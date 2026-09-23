import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPaidDigitalInvitation } from "@/lib/packages/access";

const categories = ["INVITATION", "RSVP_REMINDER", "EVENT_REMINDER", "THANK_YOU"] as const;
type Category = (typeof categories)[number];

async function ownedEvent(userId: string, invitationId: string) {
  if (!invitationId) return null;
  return prisma.invitation.findFirst({
    where: { id: invitationId, ownerId: userId },
    select: { id: true, payment: { select: { packageKey: true, status: true } } },
  });
}

function validate(input: Record<string, unknown>) {
  const category = String(input.category ?? "").trim();
  const name = String(input.name ?? "").trim();
  const title = String(input.title ?? "").trim();
  const body = String(input.body ?? "").trim();
  if (!categories.includes(category as Category)) return "Pilih jenis pesan yang tersedia.";
  if (!name || name.length > 80) return "Nama template harus 1–80 karakter.";
  if (!title || title.length > 120) return "Judul pesan harus 1–120 karakter.";
  if (!body || body.length > 3000) return "Isi pesan harus 1–3000 karakter.";
  // Restrict only brace-style placeholders, not ordinary WhatsApp punctuation.
  const tokens = body.match(/\{[^{}]*\}/g) || [];
  const allowed = new Set(["{nama}", "{acara}", "{tanggal}", "{lokasi}", "{link}"]);
  if (tokens.some((token) => !allowed.has(token)) || /[{}]/.test(body.replace(/\{[^{}]*\}/g, ""))) {
    return "Variabel pesan hanya boleh {nama}, {acara}, {tanggal}, {lokasi}, dan {link}.";
  }
  return null;
}

async function access(userId: string, invitationId: string) {
  const event = await ownedEvent(userId, invitationId);
  if (!event) return { error: NextResponse.json({ error: "Acara tidak ditemukan." }, { status: 404 }) };
  if (!hasPaidDigitalInvitation(event.payment)) {
    return { error: NextResponse.json({ error: "Aktifkan Undangan Digital untuk mengelola template WA Blast." }, { status: 402 }) };
  }
  return { event };
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });
    const invitationId = new URL(request.url).searchParams.get("invitationId")?.trim() || "";
    const result = await access(user.id, invitationId);
    if (result.error) return result.error;
    const templates = await prisma.waBlastTemplate.findMany({
      where: { invitationId },
      orderBy: [{ updatedAt: "desc" }],
      select: { id: true, category: true, name: true, title: true, body: true, updatedAt: true },
    });
    return NextResponse.json({ templates });
  } catch (error) {
    console.error("GET /api/wa-blast/templates failed", error);
    return NextResponse.json({ error: "Template belum dapat dimuat. Pastikan migrasi database telah dijalankan." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });
    const input = await request.json().catch(() => null);
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      return NextResponse.json({ error: "Data template tidak valid." }, { status: 400 });
    }
    const invitationId = String(input.invitationId ?? "").trim();
    const result = await access(user.id, invitationId);
    if (result.error) return result.error;
    const invalid = validate(input);
    if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });
    const count = await prisma.waBlastTemplate.count({ where: { invitationId } });
    if (count >= 30) return NextResponse.json({ error: "Maksimal 30 template per acara." }, { status: 409 });
    const template = await prisma.waBlastTemplate.create({
      data: {
        invitationId,
        category: String(input.category),
        name: String(input.name).trim(),
        title: String(input.title).trim(),
        body: String(input.body).trim(),
      },
      select: { id: true, category: true, name: true, title: true, body: true, updatedAt: true },
    });
    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error("POST /api/wa-blast/templates failed", error);
    return NextResponse.json({ error: "Template belum dapat disimpan. Periksa migrasi database." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });
    const input = await request.json().catch(() => null);
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      return NextResponse.json({ error: "Data template tidak valid." }, { status: 400 });
    }
    const invitationId = String(input.invitationId ?? "").trim();
    const result = await access(user.id, invitationId);
    if (result.error) return result.error;
    const invalid = validate(input);
    if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });
    const id = String(input.id ?? "").trim();
    const existing = await prisma.waBlastTemplate.findFirst({ where: { id, invitationId }, select: { id: true } });
    if (!existing) return NextResponse.json({ error: "Template tidak ditemukan." }, { status: 404 });
    const template = await prisma.waBlastTemplate.update({
      where: { id: existing.id },
      data: {
        category: String(input.category),
        name: String(input.name).trim(),
        title: String(input.title).trim(),
        body: String(input.body).trim(),
      },
      select: { id: true, category: true, name: true, title: true, body: true, updatedAt: true },
    });
    return NextResponse.json({ template });
  } catch (error) {
    console.error("PATCH /api/wa-blast/templates failed", error);
    return NextResponse.json({ error: "Template belum dapat diperbarui." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });
    const input = await request.json().catch(() => null);
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      return NextResponse.json({ error: "Data template tidak valid." }, { status: 400 });
    }
    const invitationId = String(input.invitationId ?? "").trim();
    const result = await access(user.id, invitationId);
    if (result.error) return result.error;
    const id = String(input.id ?? "").trim();
    const existing = await prisma.waBlastTemplate.findFirst({ where: { id, invitationId }, select: { id: true } });
    if (!existing) return NextResponse.json({ error: "Template tidak ditemukan." }, { status: 404 });
    await prisma.waBlastTemplate.delete({ where: { id: existing.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/wa-blast/templates failed", error);
    return NextResponse.json({ error: "Template belum dapat dihapus." }, { status: 500 });
  }
}
