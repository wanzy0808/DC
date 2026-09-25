import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getInvitationTemplate } from "@/lib/templates/catalog";
import { parseDesignKey } from "@/lib/templates/design";
import { isTrustedMutationOrigin } from "@/lib/security/request-origin";

async function requireTemplateAuthor() {
  const user = await getCurrentUser();
  return user && ["OWNER", "DESIGNER", "EDITOR"].includes(user.role) ? user : null;
}

function cleanTags(value: unknown) {
  const source = Array.isArray(value) ? value : String(value ?? "").split(",");
  return [...new Set(source.map((item) => String(item).trim()).filter(Boolean))].slice(0, 12);
}

function safePublicUrl(value: unknown) {
  const url = String(value ?? "").trim();
  return /^\/(?:api\/|templates\/|template\/|uploads\/|[^/][^?#]*)/.test(url) && !url.includes("..") ? url : "";
}

async function nextTemplateNumber() {
  const latest = await prisma.designerTemplate.findFirst({
    orderBy: { templateNo: "desc" },
    select: { templateNo: true },
  });
  return String(Math.max(0, Number(latest?.templateNo ?? "0")) + 1).padStart(3, "0");
}

export async function GET() {
  const author = await requireTemplateAuthor();
  if (!author) return NextResponse.json({ error: "Akses Template Studio diperlukan." }, { status: 403 });

  const templates = await prisma.designerTemplate.findMany({
    where: { designerId: author.id },
    orderBy: { createdAt: "desc" },
  });

  const paidOrders = await prisma.paymentOrder.findMany({
    where: {
      status: "PAID",
      packageKey: { in: ["INVITATION_BASIC", "GUESTBOOK_DIGITAL"] },
      invitation: { templateKey: { not: "" } },
    },
    select: {
      invitationId: true,
      amount: true,
      invitation: { select: { templateKey: true } },
    },
  });

  const saleEvents = new Set<string>();
  const templateRows = templates.map((template) => {
    const matching = paidOrders.filter((order) =>
      order.invitation.templateKey.includes(`designer:${template.templateNo}`),
    );
    const invitationIds = new Set(matching.map((order) => order.invitationId));
    invitationIds.forEach((id) => saleEvents.add(id));
    return {
      ...template,
      salesCount: invitationIds.size,
      orderValue: matching.reduce((sum, order) => sum + order.amount, 0),
    };
  });

  return NextResponse.json({
    templates: templateRows,
    summary: {
      templateCount: templates.length,
      templatesWithSales: templateRows.filter((template) => template.salesCount > 0).length,
      salesCount: saleEvents.size,
      orderValue: templateRows.reduce((sum, template) => sum + template.orderValue, 0),
    },
  });
}

async function createStudioTemplate(request: Request, author: NonNullable<Awaited<ReturnType<typeof requireTemplateAuthor>>>) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const designKey = String(body?.designKey ?? "").trim();
  if (!designKey || designKey.length > 30000) {
    return NextResponse.json({ error: "Design template tidak valid." }, { status: 400 });
  }

  const parsed = parseDesignKey(designKey);
  const baseTemplate = getInvitationTemplate(parsed.template);
  if (!baseTemplate || baseTemplate.key !== parsed.template) {
    return NextResponse.json({ error: "Base template tidak tersedia." }, { status: 400 });
  }

  const requestedName = String(body?.name ?? "").trim().replace(/\s+/g, " ").slice(0, 80);
  const name = requestedName || `${baseTemplate.name} Studio`;
  const category = String(body?.category ?? baseTemplate.category ?? "Designer").trim().slice(0, 40) || "Designer";
  const description = String(body?.description ?? "").trim().replace(/\s+/g, " ").slice(0, 240)
    || `Varian Studio dari ${baseTemplate.name}.`;
  const tags = cleanTags(body?.tags);
  const previewUrl = safePublicUrl(body?.previewUrl) || baseTemplate.previewImage;
  const usesPhotos = body?.usesPhotos === undefined ? baseTemplate.usesPhotos : body.usesPhotos === true;
  const musicUrl = safePublicUrl(body?.musicUrl) || null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const templateNo = await nextTemplateNumber();
      const created = await prisma.designerTemplate.create({
        data: {
          templateNo,
          name,
          tags,
          previewUrl,
          templateFile: null,
          designKey,
          category,
          description,
          usesPhotos,
          musicUrl,
          status: "PUBLISHED",
          designerId: author.id,
        },
      });
      return NextResponse.json({ template: created, ready: true }, { status: 201 });
    } catch (error) {
      const code = typeof error === "object" && error !== null && "code" in error
        ? (error as { code?: string }).code
        : undefined;
      if (code === "P2002") continue;
      throw error;
    }
  }

  return NextResponse.json({ error: "Nomor template sedang dipakai. Coba simpan lagi." }, { status: 409 });
}

export async function POST(request: Request) {
  const author = await requireTemplateAuthor();
  if (!author) return NextResponse.json({ error: "Akses Template Studio diperlukan." }, { status: 403 });
  if (!isTrustedMutationOrigin(request)) return NextResponse.json({ error: "Origin permintaan tidak valid." }, { status: 403 });

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    return NextResponse.json(
      { error: "Upload file ZIP/HTML/JSON mentah dinonaktifkan. Simpan template melalui Template Studio." },
      { status: 415 },
    );
  }

  try {
    return await createStudioTemplate(request, author);
  } catch (error) {
    console.error("POST /api/designer/templates Studio failed", error);
    return NextResponse.json({ error: "Template Studio belum dapat disimpan." }, { status: 500 });
  }
}
