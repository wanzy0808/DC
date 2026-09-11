import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPaidDigitalInvitation } from "@/lib/packages/access";

type InvitationType = "WEDDING" | "ADAT_AKAD";

function makeSlug(firstName: string, userId: string, type: InvitationType) {
  const name = firstName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const suffix = type === "ADAT_AKAD" ? "-akad" : "-moment";
  return `${name || "wedding"}${suffix}-${userId.slice(-6)}`;
}

async function getUserPayment(userId: string) {
  return prisma.payment.findFirst({
    where: {
      userId,
      status: "PAID",
      packageKey: { in: ["INVITATION_BASIC", "INVITATION_GUESTBOOK"] },
    },
    orderBy: { paidAt: "desc" },
  });
}

async function getOrCreateInvitation(
  user: { id: string; firstName: string },
  type: InvitationType,
) {
  const existing = await prisma.invitation.findFirst({
    where: { ownerId: user.id, type },
    include: { assets: { orderBy: { createdAt: "asc" } }, payment: true },
    orderBy: { createdAt: "asc" },
  });
  if (existing) return existing;

  const invitation = await prisma.invitation.create({
    data: {
      ownerId: user.id,
      slug: makeSlug(user.firstName, user.id, type),
      type,
      templateKey: "",
      title: type === "ADAT_AKAD" ? "Akad & Sangjit" : "Rio & Lyvia",
      groomName: "Rio",
      brideName: "Lyvia",
      venue: "Gedung Pernikahan",
      timezone: "Asia/Jakarta",
      eventDate: new Date("2026-09-26T09:00:00.000Z"),
      ceremonyTime: type === "ADAT_AKAD" ? "09:00" : null,
      description:
        type === "ADAT_AKAD"
          ? "Dengan penuh rasa syukur, kami mengundang Anda untuk hadir di rangkaian akad dan sangjit kami."
          : "Dengan penuh kebahagiaan, kami mengundang Anda untuk hadir di hari istimewa kami.",
    },
  });

  return prisma.invitation.findUniqueOrThrow({
    where: { id: invitation.id },
    include: { assets: { orderBy: { createdAt: "asc" } }, payment: true },
  });
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });

  const type: InvitationType =
    new URL(request.url).searchParams.get("type") === "ADAT_AKAD" ? "ADAT_AKAD" : "WEDDING";
  const invitation = await getOrCreateInvitation(user, type);
  const paid = Boolean(await getUserPayment(user.id));

  return NextResponse.json({
    invitation: { ...invitation, accessPaid: paid },
  });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });

  try {
    const body = await request.json();
    const type: InvitationType = body.type === "ADAT_AKAD" ? "ADAT_AKAD" : "WEDDING";
    const invitation = await getOrCreateInvitation(user, type);
    const groomName = String(body.groomName ?? invitation.groomName).trim();
    const brideName = String(body.brideName ?? invitation.brideName).trim();
    const venue = String(body.venue ?? invitation.venue).trim();
    const address = String(body.address ?? invitation.address ?? "").trim() || null;
    const mapUrl = String(body.mapUrl ?? invitation.mapUrl ?? "").trim() || null;
    const timezone = String(body.timezone ?? invitation.timezone ?? "Asia/Jakarta").trim() || "Asia/Jakarta";
    const eventDate = new Date(String(body.eventDate ?? invitation.eventDate));
    const templateKey = String(body.templateKey ?? invitation.templateKey).trim();

    if (!groomName || !brideName || !venue || Number.isNaN(eventDate.getTime())) {
      return NextResponse.json({ error: "Nama pasangan, tempat, dan tanggal wajib diisi." }, { status: 400 });
    }

    const userPayment = await getUserPayment(user.id);
    const canPublish = Boolean(userPayment) || hasPaidDigitalInvitation(invitation.payment);

    const updated = await prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        groomName,
        brideName,
        venue,
        address,
        mapUrl,
        timezone,
        eventDate,
        ceremonyTime: String(body.ceremonyTime ?? "").trim() || null,
        receptionTime: String(body.receptionTime ?? "").trim() || null,
        title:
          type === "ADAT_AKAD"
            ? `${groomName} & ${brideName} · Akad & Sangjit`
            : `${groomName} & ${brideName}`,
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

    return NextResponse.json({
      invitation: { ...updated, accessPaid: Boolean(userPayment) },
      accessPaid: Boolean(userPayment),
    });
  } catch {
    return NextResponse.json({ error: "Undangan belum dapat disimpan." }, { status: 500 });
  }
}
