
import { Router, Request, Response } from "express";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const router = Router();

router.post("/register", async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  const hash = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: { name, email, passwordHash: hash, role: role || Role.TECNICO }
    });
    res.json({ id: user.id, email: user.email });
  } catch (e:any) {
    res.status(400).json({ message: e.message });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: "Credenciais inválidas" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Credenciais inválidas" });
  const secret = process.env.JWT_SECRET || "dev-secret";
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, secret, { expiresIn: "12h" });
  res.json({ accessToken: token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

export default router;
