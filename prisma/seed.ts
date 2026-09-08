import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("ADMIN_EMAIL dan ADMIN_PASSWORD wajib diisi.");

  await prisma.user.upsert({
    where: { email: email.toLowerCase() },
    update: { role: "OWNER", emailVerifiedAt: new Date() },
    create: {
      email: email.toLowerCase(),
      passwordHash: await bcrypt.hash(password, 12),
      firstName: "Platform",
      lastName: "Owner",
      role: "OWNER",
      emailVerifiedAt: new Date(),
    },
  });
}

main().finally(() => prisma.$disconnect());
