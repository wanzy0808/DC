import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServicePackage } from "@/lib/packages/catalog";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });

  try {
    const body = await request.json();
    const packageKey = String(body.packageKey ?? "");
    const selected = getServicePackage(packageKey);
    if (!selected) return NextResponse.json({ error: "Paket tidak ditemukan." }, { status: 400 });

    let invitation = await prisma.invitation.findFirst({ where: { ownerId: user.id }, orderBy: { createdAt: "asc" } });
    if (!invitation) {
      invitation = await prisma.invitation.create({
        data: {
          ownerId: user.id,
          slug: `${user.firstName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-moment-${user.id.slice(-6)}`,
          type: "WEDDING",
          title: "Undangan Pernikahan",
        },
      });
    }

    const proofUrl = String(body.proofUrl ?? "").trim() || null;
    const payment = await prisma.payment.upsert({
      where: { invitationId: invitation.id },
      update: { packageKey, amount: selected.price, proofUrl, status: "PENDING", confirmedAt: null, confirmedById: null },
      create: { userId: user.id, invitationId: invitation.id, packageKey, amount: selected.price, proofUrl },
    });
    return NextResponse.json({ payment, package: selected });
  } catch {
    return NextResponse.json({ error: "Paket belum dapat dipilih." }, { status: 500 });
  }
}