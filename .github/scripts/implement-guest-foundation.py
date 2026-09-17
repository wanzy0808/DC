from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    file = Path(path)
    text = file.read_text(encoding="utf-8")
    if old not in text:
        raise SystemExit(f"Expected text not found in {path}: {old[:100]}")
    file.write_text(text.replace(old, new, 1), encoding="utf-8")


replace_once(
    "prisma/schema.prisma",
    "  phone                     String?\n  source                    GuestSource   @default(MANUAL)",
    "  phone                     String?\n  category                  String?\n  tags                      String[]      @default([])\n  source                    GuestSource   @default(MANUAL)",
)
replace_once(
    "prisma/schema.prisma",
    "  @@index([invitationId, rsvpStatus])\n  @@index([invitationId, tableId])",
    "  @@index([invitationId, rsvpStatus])\n  @@index([invitationId, category])\n  @@index([invitationId, tableId])",
)

replace_once(
    "app/api/guests/route.ts",
    "  phone: true,\n  source: true,",
    "  phone: true,\n  category: true,\n  tags: true,\n  source: true,",
)
replace_once(
    "app/api/guests/route.ts",
    "    const plusOnes = Number(body.plusOnes ?? 0);",
    "    const plusOnes = Number(body.plusOnes ?? 0);\n    const category = String(body.category ?? \"\").trim() || null;\n    const tags = Array.isArray(body.tags)\n      ? [...new Set(body.tags.map((tag: unknown) => String(tag).trim()).filter(Boolean))].slice(0, 20)\n      : [];",
)
replace_once(
    "app/api/guests/route.ts",
    "        phone: String(body.phone ?? \"\").trim() || null,\n        tableId,",
    "        phone: String(body.phone ?? \"\").trim() || null,\n        category,\n        tags,\n        tableId,",
)

migration = Path("prisma/migrations/20260917081500_add_guest_category_tags/migration.sql")
migration.parent.mkdir(parents=True, exist_ok=True)
migration.write_text(
    'ALTER TABLE "Guest" ADD COLUMN "category" TEXT;\n'
    'ALTER TABLE "Guest" ADD COLUMN "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];\n'
    'CREATE INDEX "Guest_invitationId_category_idx" ON "Guest"("invitationId", "category");\n',
    encoding="utf-8",
)

labels_route = Path("app/api/guests/[id]/labels/route.ts")
labels_route.parent.mkdir(parents=True, exist_ok=True)
labels_route.write_text('''import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Belum login." }, { status: 401 });
    }

    const { id } = await params;
    const guest = await prisma.guest.findUnique({
      where: { id },
      select: {
        id: true,
        invitation: { select: { ownerId: true } },
      },
    });

    if (!guest || guest.invitation.ownerId !== user.id) {
      return NextResponse.json({ error: "Tamu tidak ditemukan." }, { status: 404 });
    }

    const body = await request.json();
    const category =
      body.category == null || String(body.category).trim() === ""
        ? null
        : String(body.category).trim().slice(0, 80);
    const tags = Array.isArray(body.tags)
      ? [...new Set(body.tags.map((tag: unknown) => String(tag).trim()).filter(Boolean))].slice(0, 20)
      : [];

    const updated = await prisma.guest.update({
      where: { id },
      data: { category, tags },
      select: {
        id: true,
        invitationId: true,
        name: true,
        category: true,
        tags: true,
      },
    });

    return NextResponse.json({ guest: updated });
  } catch (error) {
    console.error("PATCH /api/guests/[id]/labels failed", error);
    return NextResponse.json(
      { error: "Kategori dan label tamu gagal disimpan." },
      { status: 500 },
    );
  }
}
''', encoding="utf-8")

changelog = Path("prd1.md")
text = changelog.read_text(encoding="utf-8")
heading = "## 2026-09-17 — RSVP Protection & Guest Segmentation Foundation"
if heading not in text:
    text += '''

---

## 2026-09-17 — RSVP Protection & Guest Segmentation Foundation

### Requirement / Intent
Mulai mengimplementasikan backlog prioritas dari PRD: proteksi public RSVP dari spam dan fondasi kategori/label tamu yang dapat dipakai lintas Guest List, Seating, dan distribusi undangan.

### Implementation
- menambahkan rate limiter public RSVP dengan baseline 5 request/menit per kombinasi slug + client IP;
- response over-limit memakai HTTP `429`, `Retry-After`, dan rate-limit headers;
- limiter disimpan pada process-global memory sebagai baseline aman tanpa dependency baru; untuk horizontal/multi-instance deployment tetap diarahkan ke Redis-compatible store sesuai PRD;
- menambahkan `Guest.category` nullable dan `Guest.tags` string array dengan index event + category;
- menambahkan migration PostgreSQL untuk category/tags;
- `/api/guests` sekarang mengembalikan category/tags dan menerima keduanya saat membuat guest manual;
- menambahkan `PATCH /api/guests/[id]/labels` dengan auth + ownership check untuk mengubah category/tags tanpa mencampur logic seating;
- tags dinormalisasi, deduplicated, dan dibatasi maksimal 20 label per guest.

### Affected Files
- `lib/public-rate-limit.ts`
- `app/api/invite/[slug]/rsvp/route.ts`
- `prisma/schema.prisma`
- `prisma/migrations/20260917081500_add_guest_category_tags/migration.sql`
- `app/api/guests/route.ts`
- `app/api/guests/[id]/labels/route.ts`
- `prd1.md`

### Commits
- `2e8ed2546667a50d41e3699a25a2f8d9a3806ec9` — add public RSVP rate limiter helper;
- `3c1b962c7ad347472387cbe83821b461049d9384` — enforce rate limit on public RSVP.

### Validation
- Build/type validation pending final source HEAD.
- Database migration created; production requires `pnpm db:deploy` before category/tag fields are used against production DB.
'''
    changelog.write_text(text, encoding="utf-8")
