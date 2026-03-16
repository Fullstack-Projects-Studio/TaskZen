import { prisma } from "./prisma";
import crypto from "crypto";

export function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export async function createOTP(email: string) {
  const code = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.otp.upsert({
    where: { email },
    update: { code, expiresAt, verified: false },
    create: { email, code, expiresAt },
  });

  return code;
}

export async function verifyOTP(email: string, code: string) {
  const otp = await prisma.otp.findUnique({ where: { email } });

  if (!otp || otp.code !== code || otp.expiresAt < new Date()) {
    return false;
  }

  await prisma.otp.update({
    where: { email },
    data: { verified: true },
  });

  return true;
}
