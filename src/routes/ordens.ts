
import { Router } from "express";
import { PrismaClient, WOStatus } from "@prisma/client";
import { auth, AuthReq } from "../middlewares/auth";

const prisma = new PrismaClient();
const router = Router();

router.get("/", auth, async (req, res) => {
  const itens = await prisma.workOrder.findMany({ include: { asset:true, plan:true } });
  res.json(itens);
});

router.post("/", auth, async (req: AuthReq, res) => {
  const { code, type, assetId, description, priority } = req.body;
  const om = await prisma.workOrder.create({ data: {
    code: code || `OM-${Date.now()}`, type, assetId, description, priority, createdById: req.user?.id
  }});
  res.json(om);
});

router.post("/:id/iniciar", auth, async (req, res) => {
  const id = Number(req.params.id);
  const om = await prisma.workOrder.update({ where: { id }, data: { status: WOStatus.EM_EXECUCAO } });
  res.json(om);
});

router.post("/:id/finalizar", auth, async (req, res) => {
  const id = Number(req.params.id);
  const om = await prisma.workOrder.update({ where: { id }, data: { status: WOStatus.CONCLUIDA, closedAt: new Date() } });
  res.json(om);
});

router.post("/:id/horas", auth, async (req: AuthReq, res) => {
  const id = Number(req.params.id);
  const { hours, notes } = req.body;
  const wl = await prisma.workLog.create({ data: { workOrderId: id, userId: req.user!.id, hours, notes } });
  res.json(wl);
});

export default router;
