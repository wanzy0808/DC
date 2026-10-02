import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getInvitationTemplate } from "@/lib/templates/catalog";
import { parseDesignKey } from "@/lib/templates/design";
import { isTrustedMutationOrigin } from "@/lib/security/request-origin";

async function requireOwner() {
  const user = await getCurrentUser();
  return user?.role === "OWNER" ? user : null;
}

export async function GET() {
  const owner = await requireOwner();
  if (!owner) {
    return NextResponse.json({ error: "Akses Owner diperlukan." }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    where: { role: "USER" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      invitations: {
        where: { isPublished: false },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          title: true,
          eventCategory: true,
          groomName: true,
          brideName: true,
          templateKey: true,
          eventConfigured: true,
          updatedAt: true,
        },
      },
    },
  });

  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  const owner = await requireOwner();
  if (!owner) {
    return NextResponse.json({ error: "Akses Owner diperlukan." }, { status: 403 });
  }
  if (!isTrustedMutationOrigin(request)) {
    return NextResponse.json({ error: "Origin permintaan tidak valid." }, { status: 403 });
  }

  try {
    const body = await request.json().catch(() => null) as Record<string, unknown> | null;
    const templateId = String(body?.templateId ?? "").trim();
    const userId = String(body?.userId ?? "").trim();
    const invitationId = String(body?.invitationId ?? "").trim();

    if (!templateId || !userId || !invitationId) {
      return NextResponse.json(
        { error: "Pilih template, user, dan event tujuan." },
        { status: 400 },
      );
    }

    const template = await prisma.designerTemplate.findUnique({
      where: { id: templateId },
      select: {
        id: true,
        templateNo: true,
        name: true,
        designKey: true,
        musicUrl: true,
        status: true,
        designerId: true,
      },
    });
    if (!template || !template.designKey) {
      return NextResponse.json({ error: "Template custom tidak ditemukan atau belum memiliki desain." }, { status: 404 });
    }

    const assignable =
      template.status === "REVIEW" ||
      (template.status === "DRAFT" && template.designerId === owner.id);
    if (!assignable) {
      return NextResponse.json(
        { error: "Template harus menunggu review Owner, atau merupakan Draft yang dibuat Owner sendiri." },
        { status: 409 },
      );
    }

    const parsed = parseDesignKey(template.designKey);
    const baseTemplate = getInvitationTemplate(parsed.template);
    if (!baseTemplate || baseTemplate.key !== parsed.template) {
      return NextResponse.json({ error: "Desain template custom tidak lagi tersedia." }, { status: 409 });
    }

    const targetUser = await prisma.user.findFirst({
      where: { id: userId, role: "USER" },
      select: { id: true, email: true, firstName: true, lastName: true },
    });
    if (!targetUser) {
      return NextResponse.json({ error: "User tujuan tidak ditemukan." }, { status: 404 });
    }

    const invitation = await prisma.invitation.findFirst({
      where: {
        id: invitationId,
        ownerId: targetUser.id,
        isPublished: false,
      },
      select: {
        id: true,
        title: true,
        templateKey: true,
        musicUrl: true,
      },
    });
    if (!invitation) {
      return NextResponse.json(
        { error: "Event tujuan tidak ditemukan atau sudah dipublish. Pilih event draft milik user." },
        { status: 404 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const archived = await tx.designerTemplate.updateMany({
        where: {
          id: template.id,
          status: template.status,
        },
        data: { status: "ARCHIVED" },
      });
      if (archived.count !== 1) {
        throw new Error("Template sudah diproses oleh Owner lain. Muat ulang panel.");
      }

      const updatedInvitation = await tx.invitation.update({
        where: { id: invitation.id },
        data: {
          templateKey: template.designKey!,
          ...(template.musicUrl ? { musicUrl: template.musicUrl } : {}),
        },
        select: {
          id: true,
          ownerId: true,
          title: true,
          templateKey: true,
          musicUrl: true,
          isPublished: true,
          updatedAt: true,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: owner.id,
          action: "CUSTOM_TEMPLATE_ASSIGNED",
          entity: "Invitation",
          entityId: updatedInvitation.id,
          metadata: {
            templateId: template.id,
            templateNo: template.templateNo,
            templateName: template.name,
            designerId: template.designerId,
            targetUserId: targetUser.id,
            targetUserEmail: targetUser.email,
            previousTemplateKey: invitation.templateKey,
          },
        },
      });

      return updatedInvitation;
    });

    return NextResponse.json({
      invitation: result,
      assignment: {
        templateId: template.id,
        templateNo: template.templateNo,
        userId: targetUser.id,
        invitationId: result.id,
      },
      message: "Template custom sudah diberikan ke user sebagai desain draft undangannya.",
    });
  } catch (error) {
    console.error("POST /api/owner/custom-templates failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Template custom belum dapat diberikan ke user." },
      { status: 500 },
    );
  }
}
