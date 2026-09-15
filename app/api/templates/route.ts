import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const templates = await prisma.designerTemplate.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { templateNo: "asc" },
    select: {
      id: true,
      templateNo: true,
      name: true,
      tags: true,
      previewUrl: true,
      templateFile: true,
      status: true,
    },
  });

  return NextResponse.json({
    templates: templates.map((template) => ({
      ...template,
      key: template.templateNo,
      description: template.tags.length ? template.tags.join(" · ") : "Digital invitation template",
      previewImage: template.previewUrl,
      assetPath: template.templateFile,
    })),
  });
}
