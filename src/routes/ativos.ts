
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { auth } from "../middlewares/auth";

const prisma = new PrismaClient();
const router = Router();

router.get("/", auth, async (req, res) => {
  const itens = await prisma.asset.findMany({ include: { children:true } });
  res.json(itens);
});

router.post("/", auth, async (req, res) => {
  const { name, code, parentId, location, criticality } = req.body;
  try {
    const a = await prisma.asset.create({ data: { name, code, parentId, location, criticality } });
    res.json(a);
  } catch(e:any) {
    res.status(400).json({ message: e.message });
  }
});

export default router;
