
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/auth";
import ativosRoutes from "./routes/ativos";
import planosRoutes, { gerarPreventivasAgendado } from "./routes/planos";
import ordensRoutes from "./routes/ordens";
import materiaisRoutes from "./routes/materiais";
import relatoriosRoutes from "./routes/relatorios";

dotenv.config();
const prisma = new PrismaClient();
const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "GMAO backend ativo 🚀" });
});

app.use("/auth", authRoutes);
app.use("/ativos", ativosRoutes);
app.use("/planos", planosRoutes);
app.use("/ordens", ordensRoutes);
app.use("/materiais", materiaisRoutes);
app.use("/relatorios", relatoriosRoutes);

// Cron: roda a cada hora e gera OM preventivas quando necessário
cron.schedule("0 * * * *", async () => {
  await gerarPreventivasAgendado(prisma);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ API ouvindo na porta ${PORT}`));
