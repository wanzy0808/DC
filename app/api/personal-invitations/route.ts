import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hashInvitationPassword } from "@/lib/invitations/password";
import { hasWeddingSessions, validWeddingSessionAccess } from "@/lib/events/wedding-sessions";

async function getEventInvitation(userId: string, invitationId: string) {
  if (!invitationId) return null;

  return prisma.invitation.findFirst({
    where: {
      id: invitationId,
      ownerId: userId,
      eventConfigured: true,
    },
    include: { payment: true },
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
    const exists = await prisma.guest.findUnique({
      where: { personalToken: token },
      select: { id: true },
    });
    if (!exists) return token;
  }
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Belum login." }, { status: 401 });
    }

    const invitationId = new URL(request.url).searchParams.get("invitationId")?.trim() ?? "";
    if (!invitationId) {
      return NextResponse.json({ error: "Acara wajib dipilih." }, { status: 400 });
    }

    const invitation = await getEventInvitation(user.id, invitationId);
    if (!invitation) {
      return NextResponse.json({ error: "Acara tidak ditemukan." }, { status: 404 });
    }
    const guests = await prisma.guest.findMany({
      where: { invitationId: invitation.id, personalToken: { not: null } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      invitations: guests.map(sanitizeGuest),
      event: {
        id: invitation.id,
        slug: invitation.slug,
        title: invitation.title,
      },
    });
  } catch (error) {
    console.error("GET /api/personal-invitations failed", error);
    return NextResponse.json({ error: "Personal Invitation gagal dimuat." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Belum login." }, { status: 401 });
    }

    const body = await request.json();
    const invitationId = String(body.invitationId ?? "").trim();
    if (!invitationId) {
      return NextResponse.json({ error: "Acara wajib dipilih." }, { status: 400 });
    }

    const invitation = await getEventInvitation(user.id, invitationId);
    if (!invitation) {
      return NextResponse.json({ error: "Acara tidak ditemukan." }, { status: 404 });
    }
    const scopedWedding = invitation.eventCategory === "WEDDING" && hasWeddingSessions(invitation);
    const weddingSessionAccess = scopedWedding ? body.weddingSessionAccess : null;
    if (scopedWedding && !validWeddingSessionAccess(invitation, weddingSessionAccess)) {
      return NextResponse.json({ error: "Pilih cakupan Upacara Nikah, Resepsi, atau Keduanya untuk tamu ini." }, { status: 400 });
    }

    const guestId = String(body.guestId ?? "").trim();
    const token = await uniqueToken();

    if (guestId) {
      const guest = await prisma.guest.findFirst({
        where: { id: guestId, invitationId: invitation.id },
      });
      if (!guest) {
        return NextResponse.json({ error: "Tamu tidak ditemukan pada acara ini." }, { status: 404 });
      }
      const updated = await prisma.guest.update({
        where: { id: guest.id },
        data: { personalToken: guest.personalToken || token, weddingSessionAccess },
      });
      return NextResponse.json({
        invitation: sanitizeGuest(updated),
        event: { id: invitation.id, slug: invitation.slug, title: invitation.title },
      });
    }

    const name = String(body.name ?? "").trim();
    const phone = String(body.phone ?? "").trim() || null;
    if (!name) {
      return NextResponse.json({ error: "Nama tamu wajib diisi." }, { status: 400 });
    }

    const guest = await prisma.guest.create({
      data: {
        invitationId: invitation.id,
        name,
        phone,
        source: "MANUAL",
        personalToken: token,
        weddingSessionAccess,
      },
    });

    return NextResponse.json(
      {
        invitation: sanitizeGuest(guest),
        event: { id: invitation.id, slug: invitation.slug, title: invitation.title },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/personal-invitations failed", error);
    return NextResponse.json({ error: "Personal Invitation belum dapat dibuat." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Belum login." }, { status: 401 });
    }

    const body = await request.json();
    const invitationId = String(body.invitationId ?? "").trim();
    if (!invitationId) {
      return NextResponse.json({ error: "Acara wajib dipilih." }, { status: 400 });
    }

    const invitation = await getEventInvitation(user.id, invitationId);
    if (!invitation) {
      return NextResponse.json({ error: "Acara tidak ditemukan." }, { status: 404 });
    }
    const id = String(body.id ?? "").trim();
    if (!id) {
      return NextResponse.json({ error: "Personal Invitation wajib dipilih." }, { status: 400 });
    }

    const guest = await prisma.guest.findFirst({
      where: {
        id,
        invitationId: invitation.id,
        personalToken: { not: null },
      },
    });
    if (!guest) {
      return NextResponse.json(
        { error: "Personal Invitation tidak ditemukan pada acara ini." },
        { status: 404 },
      );
    }

    const data: {
      name?: string;
      phone?: string | null;
      personalPublished?: boolean;
      personalPasswordProtected?: boolean;
      personalPasswordHash?: string | null;
      weddingSessionAccess?: string | null;
    } = {};

    if (typeof body.name === "string") {
      const name = body.name.trim();
      if (!name) {
        return NextResponse.json({ error: "Nama tamu wajib diisi." }, { status: 400 });
      }
      data.name = name;
    }
    if (typeof body.phone === "string") data.phone = body.phone.trim() || null;
    if (Object.prototype.hasOwnProperty.call(body, "weddingSessionAccess")) {
      if (invitation.eventCategory === "WEDDING" && hasWeddingSessions(invitation)) {
        if (!validWeddingSessionAccess(invitation, body.weddingSessionAccess)) {
          return NextResponse.json({ error: "Pilihan sesi tamu tidak sesuai dengan sesi pernikahan yang aktif." }, { status: 400 });
        }
        data.weddingSessionAccess = body.weddingSessionAccess;
      } else {
        return NextResponse.json({ error: "Pilihan sesi hanya tersedia untuk pernikahan bersesi." }, { status: 400 });
      }
    }
    if (typeof body.published === "boolean") {
      if (body.published && invitation.eventCategory === "WEDDING" && hasWeddingSessions(invitation) &&
          !validWeddingSessionAccess(invitation, data.weddingSessionAccess ?? guest.weddingSessionAccess)) {
        return NextResponse.json({ error: "Tentukan sesi undangan tamu sebelum publish." }, { status: 400 });
      }
      data.personalPublished = body.published;
    }

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
          if (password.length < 6) {
            return NextResponse.json({ error: "Password minimal 6 karakter." }, { status: 400 });
          }
          data.personalPasswordHash = await hashInvitationPassword(password);
        }
      }
    }

    const updated = await prisma.guest.update({
      where: { id: guest.id },
      data,
    });

    return NextResponse.json({
      invitation: sanitizeGuest(updated),
      event: { id: invitation.id, slug: invitation.slug, title: invitation.title },
    });
  } catch (error) {
    console.error("PATCH /api/personal-invitations failed", error);
    return NextResponse.json({ error: "Personal Invitation belum dapat diperbarui." }, { status: 500 });
  }
}
