import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { digitalInvitationPackages } from "@/lib/packages/access";
import { invitationTemplates } from "@/lib/templates/catalog";

export const dynamic = "force-dynamic";

const featuredLimit = 3;

function shuffledKeys(keys: string[]) {
  const result = [...keys];
  for (let index = result.length - 1; index > 0; index--) {
    const selected = Math.floor(Math.random() * (index + 1));
    [result[index], result[selected]] = [result[selected], result[index]];
  }
  return result;
}

/**
 * Public marketing highlights, never customer records.
 * A sale is one paid Digital Invitation entitlement attached to one event;
 * pending/refunded payments and WA Blast / guestbook-only purchases do not count.
 * The current invitation.templateKey is the available attribution field; there
 * is no immutable template-at-checkout snapshot in today's database.
 */
export async function GET() {
  const keys = invitationTemplates.map((template) => template.key);

  try {
    const counts = await prisma.invitation.groupBy({
      by: ["templateKey"],
      where: {
        templateKey: { in: keys },
        payment: {
          is: {
            status: "PAID",
            packageKey: { in: [...digitalInvitationPackages] },
          },
        },
      },
      _count: { id: true },
    });

    const ranked = counts
      .filter((entry) => entry._count.id > 0)
      .sort((a, b) => b._count.id - a._count.id || a.templateKey.localeCompare(b.templateKey))
      .map((entry) => entry.templateKey)
      .slice(0, featuredLimit);

    const remaining = shuffledKeys(keys.filter((key) => !ranked.includes(key)));
    return NextResponse.json(
      { keys: [...ranked, ...remaining].slice(0, featuredLimit) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("GET /api/templates/featured failed", error);
    // Never present a manufactured top-seller list when paid data is unavailable.
    return NextResponse.json(
      { error: "Urutan template terlaris belum tersedia." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
