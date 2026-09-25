import { NextResponse } from "next/server";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getInvitationTemplate } from "@/lib/templates/catalog";
import { parseDesignKey } from "@/lib/templates/design";

const previewTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);
const templateTypes = new Map([
  ["application/zip", "zip"],
  ["application/x-zip-compressed", "zip"],
  ["text/html", "html"],
  ["application/json", "json"],
]);

async function requireTemplateAuthor() {
  const user = await getCurrentUser();
  return user && ["OWNER", "DESIGNER", "EDITOR"].includes(user.role) ? user : null;
}

function safeName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9-_]/g, "-").replace(/-+/g, "-").slice(0, 60);
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

async function createUploadedTemplate(request: Request, author: NonNullable<Awaited<ReturnType<typeof requireTemplateAuthor>>>) {
  let lastError = "Template belum dapat diupload.";

  try {
    const form = await request.formData();
    const name = String(form.get("name") ?? "").trim();
    const tags = cleanTags(form.get("tags"));
    const preview = form.get("preview");
    const template = form.get("template");

    if (!name || !(preview instanceof File) || !(template instanceof File)) {
      return NextResponse.json({ error: "Nama, preview gambar, dan file template wajib diisi." }, { status: 400 });
    }

    const previewExt = previewTypes.get(preview.type);
    const templateExt = templateTypes.get(template.type);
    if (!previewExt) return NextResponse.json({ error: "Preview harus JPG, PNG, atau WEBP." }, { status: 400 });
    if (!templateExt) return NextResponse.json({ error: "File template harus ZIP, HTML, atau JSON." }, { status: 400 });
    if (preview.size > 5 * 1024 * 1024 || template.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: "Ukuran preview maksimal 5 MB dan template maksimal 25 MB." }, { status: 400 });
    }

    const previewBuffer = await sharp(Buffer.from(await preview.arrayBuffer()), { limitInputPixels: 40_000_000 })
      .rotate()
      .resize({ width: 1200, height: 1800, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toBuffer();
    const base = safeName(name) || "template";

    for (let attempt = 0; attempt < 3; attempt += 1) {
      let folder = "";
      try {
        const templateNo = await nextTemplateNumber();
        folder = path.join(process.cwd(), "public", "uploads", "templates", templateNo);
        await mkdir(folder, { recursive: true });
        const previewName = `${base}-${randomUUID()}.webp`;
        const templateName = `${base}-${randomUUID()}.${templateExt}`;
        await writeFile(path.join(folder, previewName), previewBuffer);
        await writeFile(path.join(folder, templateName), Buffer.from(await template.arrayBuffer()));

        try {
          const created = await prisma.designerTemplate.create({
            data: {
              templateNo,
              name,
              tags,
              previewUrl: `/uploads/templates/${templateNo}/${previewName}`,
              templateFile: `/uploads/templates/${templateNo}/${templateName}`,
              designerId: author.id,
            },
          });
          return NextResponse.json({ template: created, ready: false }, { status: 201 });
        } catch (error) {
          await rm(folder, { recursive: true, force: true });
          const code = typeof error === "object" && error !== null && "code" in error
            ? (error as { code?: string }).code
            : undefined;
          if (code === "P2002") {
            lastError = "Nomor template sedang dipakai, mencoba nomor berikutnya...";
            continue;
          }
          throw error;
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : lastError;
        if (folder) await rm(folder, { recursive: true, force: true }).catch(() => undefined);
        if (attempt === 2) break;
      }
    }
  } catch (error) {
    lastError = error instanceof Error ? error.message : lastError;
  }

  return NextResponse.json({ error: lastError }, { status: 500 });
}

export async function POST(request: Request) {
  const author = await requireTemplateAuthor();
  if (!author) return NextResponse.json({ error: "Akses Template Studio diperlukan." }, { status: 403 });

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      return await createStudioTemplate(request, author);
    } catch (error) {
      console.error("POST /api/designer/templates Studio failed", error);
      return NextResponse.json({ error: "Template Studio belum dapat disimpan." }, { status: 500 });
    }
  }

  return createUploadedTemplate(request, author);
}
