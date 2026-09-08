import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPaidDigitalInvitation } from "@/lib/packages/access";

function makeSlug(firstName: string, userId: string) {
  const name = firstName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${name || "wedding"}-moment-${userId.slice(-6)}`;
}

async function getOrCreateInvitation(user: { id: string; firstName: string }) {
  const existing = await prisma.invitation.findFirst({
    where: { ownerId: user.id },
    include: { assets: { orderBy: { createdAt: "asc" } }, payment: true },
    orderBy: { createdAt: "asc" },
  });
  if (existing) {
    await prisma.payment.upsert({
      where: { invitationId: existing.id },
      update: {},
      create: { userId: user.id, invitationId: existing.id, amount: 0 },
    });
    return prisma.invitation.findUniqueOrThrow({
      where: { id: existing.id },
      include: { assets: { orderBy: { createdAt: "asc" } }, payment: true },
    });
  }

  const invitation = await prisma.invitation.create({
    data: {
      ownerId: user.id,
      slug: makeSlug(user.firstName, user.id),
      type: "WEDDING",
      title: "Rio & Lyvia",
      groomName: "Rio",
      brideName: "Lyvia",
      venue: "Gedung Pernikahan",
      eventDate: new Date("2026-09-26T09:00:00.000Z"),
      description: "Dengan penuh kebahagiaan, kami mengundang Anda untuk hadir di hari istimewa kami.",
      assets: { create: [] },
    },
  });
  await prisma.payment.create({ data: { userId: user.id, invitationId: invitation.id, amount: 0 } });
  return prisma.invitation.findUniqueOrThrow({
    where: { id: invitation.id },
    include: { assets: { orderBy: { createdAt: "asc" } }, payment: true },
  });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });

  return NextResponse.json({ invitation: await getOrCreateInvitation(user) });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });

  try {
    const invitation = await getOrCreateInvitation(user);
    const body = await request.json();
    const groomName = String(body.groomName ?? "").trim();
    const brideName = String(body.brideName ?? "").trim();
    const venue = String(body.venue ?? "").trim();
    const eventDate = new Date(String(body.eventDate ?? ""));
    const templateKey = String(body.templateKey ?? invitation.templateKey).trim() || invitation.templateKey;

    if (!groomName || !brideName || !venue || Number.isNaN(eventDate.getTime())) {
      return NextResponse.json({ error: "Nama pasangan, tempat, dan tanggal wajib diisi." }, { status: 400 });
    }
    const canPublish = hasPaidDigitalInvitation(invitation.payment);

    const updated = await prisma.invitation.update({
      where: { id: invitation.id, ownerId: user.id },
      data: {
        groomName,
        brideName,
        venue,
        eventDate,
        ceremonyTime: String(body.ceremonyTime ?? "").trim() || null,
        receptionTime: String(body.receptionTime ?? "").trim() || null,
        title: `${groomName} & ${brideName}`,
        templateKey,
        description: String(body.description ?? "").trim() || null,
        weddingHashtag: String(body.weddingHashtag ?? "").trim() || null,
        dressCode: String(body.dressCode ?? "").trim() || null,
        liveStreamUrl: String(body.liveStreamUrl ?? "").trim() || null,
        eventNotes: String(body.eventNotes ?? "").trim() || null,
        giftBankName: String(body.giftBankName ?? "").trim() || null,
        giftAccountName: String(body.giftAccountName ?? "").trim() || null,
        giftAccountNumber: String(body.giftAccountNumber ?? "").trim() || null,
        musicUrl: String(body.musicUrl ?? "").trim() || null,
        isPublished: canPublish && Boolean(body.isPublished),
      },
      include: { assets: { orderBy: { createdAt: "asc" } }, payment: true },
    });

    return NextResponse.json({ invitation: updated });
  } catch {
    return NextResponse.json({ error: "Undangan belum dapat disimpan." }, { status: 500 });
  }
}