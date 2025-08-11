
import { Router } from "express";
import { PrismaClient, PlanUnit, WOType, WOStatus } from "@prisma/client";
import { auth } from "../middlewares/auth";

const prisma = new PrismaClient();
const router = Router();

export async function gerarPreventivasAgendado(prismaClient: PrismaClient) {
  const planos = await prismaClient.maintenancePlan.findMany({ where: { isActive: true } });
  const now = new Date();

  for (const p of planos) {
    // Regra simples: se nunca gerou OU passou do intervalo previsto, cria OM
    const last = p.lastGeneratedAt ? new Date(p.lastGeneratedAt) : null;
    let due = false;
    const addMs = (n:number, unit:PlanUnit) => {
      const map:any = { DIA: 86400000, SEMANA: 604800000, MES: 2592000000, HORA: 3600000 };
      return n * map[unit];
    };
    if (!last) due = true;
    else due = (now.getTime() - last.getTime()) >= addMs(p.everyN, p.unit);

    if (due) {
      const code = `PM02-${now.getTime()}`;
      await prismaClient.workOrder.create({
        data: {
          code, type: WOType.PM02, status: WOStatus.ABERTA,
          assetId: p.assetId, planId: p.id, description: p.title
        }
      });
      await prismaClient.maintenancePlan.update({ where: { id: p.id }, data: { lastGeneratedAt: now } });
    }
  }
}

router.get("/", auth, async (req, res) => {
  const itens = await prisma.maintenancePlan.findMany({ include: { asset:true } });
  res.json(itens);
});

router.post("/", auth, async (req, res) => {
  const { assetId, title, type, everyN, unit } = req.body;
  try {
    const plano = await prisma.maintenancePlan.create({ data: { assetId, title, type, everyN, unit } });
    res.json(plano);
  } catch(e:any) {
    res.status(400).json({ message: e.message });
  }
});

router.post("/:id/gerar-agora", auth, async (req, res) => {
  const id = Number(req.params.id);
  const p = await prisma.maintenancePlan.findUnique({ where: { id } });
  if (!p) return res.status(404).json({ message: "Plano não encontrado" });
  const code = `PM02-${Date.now()}`;
  const om = await prisma.workOrder.create({
    data: { code, type: "PM02", status: "ABERTA", assetId: p.assetId, planId: p.id, description: p.title }
  });
  await prisma.maintenancePlan.update({ where: { id }, data: { lastGeneratedAt: new Date() } });
  res.json(om);
});

export default router;
