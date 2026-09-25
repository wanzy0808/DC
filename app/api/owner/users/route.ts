import { NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendOwnerAccountActionEmail } from "@/lib/notifications/email";

const roles = ["USER", "DESIGNER", "ADMIN"] as const;
const digitalKeys = new Set(["INVITATION_BASIC", "GUESTBOOK_DIGITAL", "INVITATION_GUESTBOOK"]);
const guestbookKeys = new Set(["GUESTBOOK_DIGITAL", "INVITATION_GUESTBOOK"]);

type PackageAccessInput = {
  digital?: boolean;
  guestbook?: boolean;
};

async function requireOwner() {
  const user = await getCurrentUser();
  return user?.role === "OWNER" ? user : null;
}

function packageAccessFromUser(user: {
  payments: Array<{ packageKey: string; status: string; provider: string }>;
  orders: Array<{ packageKey: string; status: string }>;
}) {
  const paidPayments = user.payments.filter((payment) => payment.status === "PAID");
  const paidOrders = user.orders.filter((order) => order.status === "PAID");
  const purchasedDigital =
    paidOrders.some((order) => digitalKeys.has(order.packageKey)) ||
    paidPayments.some((payment) => payment.provider !== "owner_grant" && digitalKeys.has(payment.packageKey));
  const purchasedGuestbook =
    paidOrders.some((order) => guestbookKeys.has(order.packageKey)) ||
    paidPayments.some((payment) => payment.provider !== "owner_grant" && guestbookKeys.has(payment.packageKey));
  const grantedDigital = paidPayments.some(
    (payment) => payment.provider === "owner_grant" && digitalKeys.has(payment.packageKey),
  );
  const grantedGuestbook = paidPayments.some(
    (payment) => payment.provider === "owner_grant" && guestbookKeys.has(payment.packageKey),
  );

  return {
    digital: purchasedDigital || purchasedGuestbook || grantedDigital || grantedGuestbook,
    guestbook: purchasedGuestbook || grantedGuestbook,
    purchasedDigital,
    purchasedGuestbook,
    grantedDigital,
    grantedGuestbook,
  };
}

async function createGrantInvitation(target: { id: string; email: string }) {
  const existing = await prisma.invitation.findFirst({
    where: { ownerId: target.id },
    orderBy: { createdAt: "asc" },
  });
  if (existing) return existing;

  const base = target.email.split("@")[0]?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "account";
  return prisma.invitation.create({
    data: {
      ownerId: target.id,
      slug: `${base}-owner-access-${randomBytes(3).toString("hex")}-${target.id.slice(-4)}`,
      type: "WEDDING",
      title: "",
      templateKey: "",
      groomName: "",
      brideName: "",
      venue: "",
      eventConfigured: false,
    },
  });
}

async function restorePurchasedPayment(invitationId: string) {
  const paidOrder = await prisma.paymentOrder.findFirst({
    where: {
      invitationId,
      status: "PAID",
      packageKey: { in: ["INVITATION_BASIC", "GUESTBOOK_DIGITAL"] },
    },
    orderBy: [{ paidAt: "desc" }, { createdAt: "desc" }],
  });

  if (!paidOrder) {
    await prisma.payment.deleteMany({
      where: { invitationId, provider: "owner_grant" },
    });
    return;
  }

  await prisma.payment.upsert({
    where: { invitationId },
    update: {
      userId: paidOrder.userId,
      packageKey: paidOrder.packageKey,
      status: "PAID",
      amount: paidOrder.amount,
      provider: paidOrder.provider,
      proofUrl: paidOrder.proofUrl,
      note: paidOrder.note,
      paidAt: paidOrder.paidAt ?? paidOrder.confirmedAt ?? paidOrder.createdAt,
      confirmedAt: paidOrder.confirmedAt,
      confirmedById: paidOrder.confirmedById,
    },
    create: {
      userId: paidOrder.userId,
      invitationId,
      packageKey: paidOrder.packageKey,
      status: "PAID",
      amount: paidOrder.amount,
      provider: paidOrder.provider,
      proofUrl: paidOrder.proofUrl,
      note: paidOrder.note,
      paidAt: paidOrder.paidAt ?? paidOrder.confirmedAt ?? paidOrder.createdAt,
      confirmedAt: paidOrder.confirmedAt,
      confirmedById: paidOrder.confirmedById,
    },
  });
}

async function applyOwnerPackageAccess(
  ownerId: string,
  target: { id: string; email: string },
  input: PackageAccessInput,
) {
  const wantsGuestbook = input.guestbook === true;
  const wantsDigital = wantsGuestbook || input.digital === true;
  const desiredKey = wantsGuestbook ? "GUESTBOOK_DIGITAL" : wantsDigital ? "INVITATION_BASIC" : null;

  const currentGrant = await prisma.payment.findFirst({
    where: { userId: target.id, provider: "owner_grant" },
    orderBy: { updatedAt: "desc" },
  });

  if (!desiredKey) {
    if (currentGrant) await restorePurchasedPayment(currentGrant.invitationId);
    await prisma.auditLog.create({
      data: {
        actorId: ownerId,
        action: "OWNER_PACKAGE_ACCESS_UPDATED",
        entity: "User",
        entityId: target.id,
        metadata: { digital: false, guestbook: false },
      },
    });
    return;
  }

  const purchasedOrders = await prisma.paymentOrder.findMany({
    where: { userId: target.id, status: "PAID" },
    select: { packageKey: true },
  });
  const alreadyPurchasedGuestbook = purchasedOrders.some((order) => guestbookKeys.has(order.packageKey));
  const alreadyPurchasedDigital = purchasedOrders.some((order) => digitalKeys.has(order.packageKey));

  if ((desiredKey === "GUESTBOOK_DIGITAL" && alreadyPurchasedGuestbook) ||
      (desiredKey === "INVITATION_BASIC" && (alreadyPurchasedDigital || alreadyPurchasedGuestbook))) {
    if (currentGrant) await restorePurchasedPayment(currentGrant.invitationId);
    await prisma.auditLog.create({
      data: {
        actorId: ownerId,
        action: "OWNER_PACKAGE_ACCESS_UPDATED",
        entity: "User",
        entityId: target.id,
        metadata: { digital: wantsDigital, guestbook: wantsGuestbook, purchaseAlreadyCoversAccess: true },
      },
    });
    return;
  }

  const invitation = currentGrant
    ? await prisma.invitation.findUnique({ where: { id: currentGrant.invitationId } })
    : await createGrantInvitation(target);
  if (!invitation) throw new Error("Invitation entitlement target not found");

  const now = new Date();
  await prisma.payment.upsert({
    where: { invitationId: invitation.id },
    update: {
      userId: target.id,
      packageKey: desiredKey,
      status: "PAID",
      amount: 0,
      provider: "owner_grant",
      proofUrl: null,
      note: "Hak paket diberikan manual oleh Owner.",
      paidAt: now,
      confirmedAt: now,
      confirmedById: ownerId,
    },
    create: {
      userId: target.id,
      invitationId: invitation.id,
      packageKey: desiredKey,
      status: "PAID",
      amount: 0,
      provider: "owner_grant",
      note: "Hak paket diberikan manual oleh Owner.",
      paidAt: now,
      confirmedAt: now,
      confirmedById: ownerId,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: ownerId,
      action: "OWNER_PACKAGE_ACCESS_UPDATED",
      entity: "User",
      entityId: target.id,
      metadata: { digital: wantsDigital, guestbook: wantsGuestbook, packageKey: desiredKey },
    },
  });
}

export async function GET() {
  const owner = await requireOwner();
  if (!owner) return NextResponse.json({ error: "Akses Owner diperlukan." }, { status: 403 });

  const users = await prisma.user.findMany({
    where: { role: { in: [...roles] } },
    select: {
      id: true,
      email: true,
      role: true,
      emailVerifiedAt: true,
      createdAt: true,
      updatedAt: true,
      payments: { select: { packageKey: true, status: true, provider: true } },
      orders: {
        where: { status: "PAID" },
        select: { packageKey: true, status: true },
      },
      _count: { select: { invitations: true, orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    users: users.map((user) => ({
      id: user.id,
      email: user.email,
      role: user.role,
      emailVerifiedAt: user.emailVerifiedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      _count: user._count,
      packageAccess: packageAccessFromUser(user),
    })),
  });
}

export async function POST(request: Request) {
  const owner = await requireOwner();
  if (!owner) return NextResponse.json({ error: "Akses Owner diperlukan." }, { status: 403 });
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const firstName = email.split("@")[0]?.trim() || "User";
    const role = roles.includes(body.role) ? body.role : "USER";
    const password = String(body.password ?? "");
    if (!email || password.length < 8) {
      return NextResponse.json({ error: "Email dan password minimal 8 karakter wajib diisi." }, { status: 400 });
    }
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return NextResponse.json({ error: "Email sudah terdaftar." }, { status: 409 });

    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName: null,
        role,
        passwordHash: await bcrypt.hash(password, 12),
      },
      select: { id: true, email: true, role: true },
    });

    const requestedAccess = body.packageAccess as PackageAccessInput | undefined;
    if (requestedAccess?.digital || requestedAccess?.guestbook) {
      await applyOwnerPackageAccess(owner.id, user, requestedAccess);
    }

    await prisma.auditLog.create({
      data: {
        actorId: owner.id,
        action: "ACCOUNT_CREATED",
        entity: "User",
        entityId: user.id,
        metadata: { role, email },
      },
    });
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("POST /api/owner/users failed", error);
    return NextResponse.json({ error: "Akun belum dapat dibuat." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const owner = await requireOwner();
  if (!owner) return NextResponse.json({ error: "Akses Owner diperlukan." }, { status: 403 });
  try {
    const body = await request.json();
    const userId = String(body.userId ?? "");
    const action = String(body.action ?? "PROFILE");
    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });
    if (!target) return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });

    if (action === "PASSWORD") {
      const password = String(body.password ?? "");
      if (password.length < 8) return NextResponse.json({ error: "Password minimal 8 karakter." }, { status: 400 });
      const token = randomBytes(32).toString("hex");
      const tokenHash = createHash("sha256").update(token).digest("hex");
      const passwordHash = await bcrypt.hash(password, 12);
      await prisma.accountActionToken.create({
        data: {
          tokenHash,
          userId: target.id,
          action: "PASSWORD_CHANGE",
          payload: { passwordHash },
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        },
      });
      const confirmationEmail = process.env.OWNER_CONFIRMATION_EMAIL ?? owner.email;
      const baseUrl = process.env.APP_URL ?? "http://localhost:3000";
      const confirmationUrl = `${baseUrl}/owner/account-confirmation?token=${encodeURIComponent(token)}`;
      await sendOwnerAccountActionEmail({
        to: confirmationEmail,
        actionLabel: "perubahan password",
        targetEmail: target.email,
        confirmationUrl,
      });
      return NextResponse.json({ message: `Konfirmasi perubahan password dikirim ke ${confirmationEmail}.` });
    }

    const email = String(body.email ?? target.email).trim().toLowerCase();
    const role = roles.includes(body.role) ? body.role : target.role;
    const updated = await prisma.user.update({
      where: { id: target.id },
      data: { email, role },
      select: { id: true, email: true, role: true, emailVerifiedAt: true, createdAt: true },
    });

    if (body.packageAccess && typeof body.packageAccess === "object") {
      await applyOwnerPackageAccess(owner.id, updated, body.packageAccess as PackageAccessInput);
    }

    await prisma.auditLog.create({
      data: {
        actorId: owner.id,
        action: "ACCOUNT_UPDATED",
        entity: "User",
        entityId: target.id,
        metadata: { email, role },
      },
    });
    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error("PATCH /api/owner/users failed", error);
    return NextResponse.json({ error: "Data akun belum dapat diubah." }, { status: 500 });
  }
}
