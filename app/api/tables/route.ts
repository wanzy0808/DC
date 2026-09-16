import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasAccountDigitalInvitation } from "@/lib/packages/server-access";

const ALLOWED_SHAPES = new Set(["ROUND", "RECTANGLE", "SQUARE"]);

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });

  const body = await request.json();
  const invitationId = String(body.invitationId ?? "").trim();
  const invitation = await prisma.invitation.findFirst({
    where: invitationId
      ? { id: invitationId, ownerId: user.id }
      : { ownerId: user.id, type: "WEDDING" },
    include: { payment: true },
    orderBy: invitationId ? undefined : { createdAt: "asc" },
  });
  if (!invitation || !(await hasAccountDigitalInvitation(user.id, invitation.payment))) {
    return NextResponse.json({ error: "Table arrangement membutuhkan paket Digital Invitation." }, { status: 402 });
  }

  const name = String(body.name ?? "").trim();
  const capacity = Number(body.capacity ?? 8);
  const shape = String(body.shape ?? "ROUND").trim().toUpperCase();

  if (!name || !Number.isInteger(capacity) || capacity < 1 || capacity > 50) {
    return NextResponse.json({ error: "Nama dan kapasitas meja wajib valid (1–50 kursi)." }, { status: 400 });
  }
  if (!ALLOWED_SHAPES.has(shape)) {
    return NextResponse.json({ error: "Bentuk meja tidak valid." }, { status: 400 });
  }

  const tableCount = await prisma.weddingTable.count({ where: { invitationId: invitation.id } });
  if (tableCount >= 100) {
    return NextResponse.json({ error: "Maksimal 100 meja per acara." }, { status: 409 });
  }

  const table = await prisma.weddingTable.create({
    data: { invitationId: invitation.id, name, shape, capacity },
  });
  return NextResponse.json({ table }, { status: 201 });
}