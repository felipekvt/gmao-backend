
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { auth } from "../middlewares/auth";

const prisma = new PrismaClient();
const router = Router();

router.get("/", auth, async (req, res) => {
  const itens = await prisma.material.findMany();
  res.json(itens);
});

router.post("/", auth, async (req, res) => {
  const { sku, name, uom, qtyOnHand, avgCost } = req.body;
  const m = await prisma.material.create({ data: { sku, name, uom, qtyOnHand, avgCost } });
  res.json(m);
});

router.post("/baixa/:omId", auth, async (req, res) => {
  const omId = Number(req.params.omId);
  const { materialId, qty, unitCost } = req.body;
  const wom = await prisma.workOrderMaterial.create({ data: { workOrderId: omId, materialId, qty, unitCost } });
  // atualiza estoque simples
  await prisma.material.update({ where: { id: materialId }, data: { qtyOnHand: { decrement: qty } } });
  res.json(wom);
});

export default router;
