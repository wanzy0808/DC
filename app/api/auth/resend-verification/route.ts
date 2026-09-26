import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/auth";
import { sendEmail } from "@/lib/notifications/email";
import { checkPublicRateLimit, getClientIp } from "@/lib/security/public-rate-limit";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = checkPublicRateLimit(`auth:resend-verification:ip:${ip}`, 5, 60 * 60_000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan. Coba lagi nanti." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
      );
    }

    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Masukkan alamat email yang valid." }, { status: 400 });
    }
    const emailLimit = checkPublicRateLimit(`auth:resend-verification:email:${email}`, 3, 60 * 60_000);
    if (!emailLimit.allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan. Coba lagi nanti." },
        { status: 429, headers: { "Retry-After": String(emailLimit.retryAfterSeconds) } },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, emailVerifiedAt: true },
    });
    if (user && !user.emailVerifiedAt) {
      const baseUrl = process.env.APP_URL;
      if (process.env.NODE_ENV === "production" && !baseUrl) {
        return NextResponse.json({ error: "Email verifikasi belum dapat dikirim. Coba lagi nanti." }, { status: 503 });
      }
      const { token, tokenHash } = createToken();
      const record = await prisma.emailVerificationToken.create({
        data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + 24 * 60 * 60_000) },
      });
      const verifyUrl = `${baseUrl ?? "http://localhost:3000"}/api/auth/verify-email?token=${token}`;
      const mail = await sendEmail({
        to: email,
        subject: "Verifikasi email — DC Organizer",
        html: `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#21191c;line-height:1.6"><h2>DC Organizer</h2><p>Verifikasi email untuk mengaktifkan akunmu.</p><p><a href="${verifyUrl}">Verifikasi email</a></p><p>Link berlaku 24 jam dan hanya dapat digunakan sekali.</p></body></html>`,
      });
      if (!mail.sent) {
        if (process.env.NODE_ENV !== "production") {
          console.info(`[DEV] Verify ${email}: ${verifyUrl}`);
        } else {
          await prisma.emailVerificationToken.delete({ where: { id: record.id } });
          return NextResponse.json({ error: "Email verifikasi belum dapat dikirim. Coba lagi nanti." }, { status: 503 });
        }
      }
    }
    return NextResponse.json({ message: "Jika akun belum diverifikasi, tautan baru telah dikirim." });
  } catch {
    return NextResponse.json({ error: "Permintaan verifikasi belum dapat diproses." }, { status: 500 });
  }
}
