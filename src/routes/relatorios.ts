
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { auth } from "../middlewares/auth";

const prisma = new PrismaClient();
const router = Router();

router.get("/kpis", auth, async (req, res) => {
  const from = req.query.from ? new Date(String(req.query.from)) : new Date(Date.now() - 30*86400000);
  const to = req.query.to ? new Date(String(req.query.to)) : new Date();

  const ordens = await prisma.workOrder.findMany({ where: { createdAt: { gte: from, lte: to } } });
  const concluidas = ordens.filter(o => o.closedAt);
  const mttr = concluidas.length ? concluidas.reduce((acc,o)=>acc+((o.closedAt!.getTime()-o.createdAt.getTime())/3600000),0)/concluidas.length : 0;
  const pm2 = ordens.filter(o => o.type === "PM02").length;
  const pm1 = ordens.filter(o => o.type === "PM01").length;
  const percentPreventiva = ordens.length ? (pm2 / ordens.length) * 100 : 0;

  res.json({ totalOrdens: ordens.length, mttrHoras: Number(mttr.toFixed(2)), percentPreventiva: Number(percentPreventiva.toFixed(1)) });
});

export default router;
