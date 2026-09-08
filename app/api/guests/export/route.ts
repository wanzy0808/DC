import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });
  const invitation = await prisma.invitation.findFirst({ where: { ownerId: user.id, payment: { status: "PAID" } } });
  if (!invitation) return NextResponse.json({ error: "Paket belum aktif." }, { status: 402 });
  const guests = await prisma.guest.findMany({ where: { invitationId: invitation.id }, include: { table: true }, orderBy: { name: "asc" } });
  const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;
  const rows = ["Nama,Telepon,Status RSVP,Plus One,Meja", ...guests.map((guest) => [guest.name, guest.phone ?? "", guest.rsvpStatus, String(guest.plusOnes), guest.table?.name ?? ""].map(escape).join(","))];
  return new NextResponse(rows.join("\n"), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=guests.csv" } });
}