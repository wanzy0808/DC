import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { invitationTemplates } from "@/lib/templates/catalog";

export const dynamic = "force-dynamic";

/**
 * Single public catalog endpoint for /template-design, /d-invitation and Studio.
 * Designer uploads can appear immediately as preview-only: ZIP/HTML/JSON files
 * are not executable React template renderers and must never be selectable in Studio.
 */
export async function GET() {
  const builtIn = invitationTemplates.map((item) => ({
    ...item,
    source: "built-in" as const,
    ready: true as const,
  }));

  try {
    const uploaded = await prisma.designerTemplate.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { templateNo: "asc" },
      select: {
        templateNo: true,
        name: true,
        tags: true,
        previewUrl: true,
      },
    });

    const designer = uploaded.map((item) => ({
      key: `designer:${item.templateNo}`,
      name: item.name,
      description: item.tags.join(" · ") || "Desain dari designer",
      previewImage: item.previewUrl,
      assetPath: "",
      category: item.tags[0] || "Designer",
      previewType: "image" as const,
      source: "designer" as const,
      ready: false as const,
    }));

    return NextResponse.json(
      { templates: [...builtIn, ...designer] },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    // Built-in templates do not depend on the uploaded-designer database.
    return NextResponse.json(
      { templates: builtIn, designerCatalogUnavailable: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
}
