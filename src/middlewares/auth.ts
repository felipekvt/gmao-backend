
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthReq extends Request {
  user?: { id: number; role: string; email: string };
}

export function auth(req: AuthReq, res: Response, next: NextFunction) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Sem token" });
  try {
    const secret = process.env.JWT_SECRET || "dev-secret";
    const decoded = jwt.verify(token, secret) as any;
    req.user = { id: decoded.id, role: decoded.role, email: decoded.email };
    next();
  } catch (e) {
    return res.status(401).json({ message: "Token inválido" });
  }
}
