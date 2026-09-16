import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPaidDigitalInvitation } from "@/lib/packages/access";
import { hashInvitationPassword } from "@/lib/invitation-password";

async function getMainInvitation(userId: string) {
  return prisma.invitation.findFirst({
    where: { ownerId: userId, type: "WEDDING" },
    include: { payment: true },
    orderBy: { createdAt: "asc" },
  });
}

function sanitizeGuest<T extends object>(guest: T) {
  const { personalPasswordHash: _personalPasswordHash, ...safeGuest } = guest as T & {
    personalPasswordHash?: string | null;
  };
  return safeGuest;
}

async function uniqueToken() {
  while (true) {
    const token = randomBytes(18).toString("hex");
    const exists = await prisma.guest.findUnique({ where: { personalToken: token }, select: { id: true } });
    if (!exists) return token;
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });
    const invitation = await getMainInvitation(user.id);
    if (!invitation) return NextResponse.json({ invitations: [] });
    if (!hasPaidDigitalInvitation(invitation.payment)) {
      return NextResponse.json({ error: "Personal Invitation membutuhkan paket Digital Invitation." }, { status: 402 });
    }

    const guests = await prisma.guest.findMany({
      where: { invitationId: invitation.id, personalToken: { not: null } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      invitations: guests.map(sanitizeGuest),
      mainSlug: invitation.slug,
    });
  } catch (error) {
    console.error("GET /api/personal-invitations failed", error);
    return NextResponse.json({ error: "Personal Invitation gagal dimuat." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });
    const invitation = await getMainInvitation(user.id);
    if (!invitation || !hasPaidDigitalInvitation(invitation.payment)) {
      return NextResponse.json({ error: "Personal Invitation membutuhkan paket Digital Invitation." }, { status: 402 });
    }

    const body = await request.json();
    const guestId = String(body.guestId ?? "").trim();
    const token = await uniqueToken();

    if (guestId) {
      const guest = await prisma.guest.findFirst({ where: { id: guestId, invitationId: invitation.id } });
      if (!guest) return NextResponse.json({ error: "Tamu tidak ditemukan." }, { status: 404 });
      const updated = await prisma.guest.update({
        where: { id: guest.id },
        data: { personalToken: guest.personalToken || token },
      });
      return NextResponse.json({ invitation: sanitizeGuest(updated), mainSlug: invitation.slug });
    }

    const name = String(body.name ?? "").trim();
    const phone = String(body.phone ?? "").trim() || null;
    if (!name) return NextResponse.json({ error: "Nama tamu wajib diisi." }, { status: 400 });

    const guest = await prisma.guest.create({
      data: {
        invitationId: invitation.id,
        name,
        phone,
        source: "MANUAL",
        personalToken: token,
      },
    });

    return NextResponse.json({ invitation: sanitizeGuest(guest), mainSlug: invitation.slug }, { status: 201 });
  } catch (error) {
    console.error("POST /api/personal-invitations failed", error);
    return NextResponse.json({ error: "Personal Invitation belum dapat dibuat." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });
    const invitation = await getMainInvitation(user.id);
    if (!invitation || !hasPaidDigitalInvitation(invitation.payment)) {
      return NextResponse.json({ error: "Personal Invitation membutuhkan paket Digital Invitation." }, { status: 402 });
    }

    const body = await request.json();
    const id = String(body.id ?? "").trim();
    if (!id) return NextResponse.json({ error: "Personal Invitation wajib dipilih." }, { status: 400 });

    const guest = await prisma.guest.findFirst({ where: { id, invitationId: invitation.id, personalToken: { not: null } } });
    if (!guest) return NextResponse.json({ error: "Personal Invitation tidak ditemukan." }, { status: 404 });

    const data: {
      name?: string;
      phone?: string | null;
      personalPublished?: boolean;
      personalPasswordProtected?: boolean;
      personalPasswordHash?: string | null;
    } = {};

    if (typeof body.name === "string") {
      const name = body.name.trim();
      if (!name) return NextResponse.json({ error: "Nama tamu wajib diisi." }, { status: 400 });
      data.name = name;
    }
    if (typeof body.phone === "string") data.phone = body.phone.trim() || null;
    if (typeof body.published === "boolean") data.personalPublished = body.published;

    if (typeof body.passwordProtected === "boolean") {
      if (!body.passwordProtected) {
        data.personalPasswordProtected = false;
        data.personalPasswordHash = null;
      } else {
        const password = String(body.password ?? "").trim();
        if (!guest.personalPasswordHash && password.length < 6) {
          return NextResponse.json({ error: "Password minimal 6 karakter." }, { status: 400 });
        }
        data.personalPasswordProtected = true;
        if (password) {
          if (password.length < 6) return NextResponse.json({ error: "Password minimal 6 karakter." }, { status: 400 });
          data.personalPasswordHash = await hashInvitationPassword(password);
        }
      }
    }

    const updated = await prisma.guest.update({ where: { id: guest.id }, data });
    return NextResponse.json({ invitation: sanitizeGuest(updated), mainSlug: invitation.slug });
  } catch (error) {
    console.error("PATCH /api/personal-invitations failed", error);
    return NextResponse.json({ error: "Personal Invitation belum dapat diperbarui." }, { status: 500 });
  }
}