import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    // Verify that OTP was completed for this email
    const otp = await prisma.otp.findUnique({ where: { email } });
    if (!otp || !otp.verified) {
      return NextResponse.json(
        { error: "Email not verified. Please complete OTP verification first." },
        { status: 400 }
      );
    }

    // Find the user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email" },
        { status: 404 }
      );
    }

    if (!user.hashedPassword) {
      return NextResponse.json(
        { error: "This account uses Google sign-in. Password reset is not available." },
        { status: 400 }
      );
    }

    // Hash and update the password
    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { email },
      data: { hashedPassword },
    });

    // Clean up the OTP record
    await prisma.otp.delete({ where: { email } });

    return NextResponse.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
