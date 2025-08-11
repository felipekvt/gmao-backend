
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@vfpm.local";
  const exists = await prisma.user.findUnique({ where: { email } });
  if (!exists) {
    const hash = await bcrypt.hash("Admin@123", 10);
    await prisma.user.create({
      data: { name: "Admin", email, passwordHash: hash, role: Role.ADMIN }
    });
    console.log("✅ Usuário admin criado:", email);
  } else {
    console.log("ℹ️ Usuário admin já existe.");
  }
}

main().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1)});
