from pathlib import Path
import re

ROOT = Path('.')


def read(path: str) -> str:
    return (ROOT / path).read_text()


def write(path: str, text: str) -> None:
    target = ROOT / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(text)


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise SystemExit(f"missing required pattern: {label}")
    return text.replace(old, new, 1)


# ---------------------------------------------------------------------------
# Shared section configuration
# ---------------------------------------------------------------------------
write(
    "lib/templates/sections.ts",
    '''export const invitationSectionKeys = ["rsvp", "wishes", "gift"] as const;

export type InvitationSectionKey = (typeof invitationSectionKeys)[number];
export type InvitationSectionConfig = Record<InvitationSectionKey, boolean>;

export const defaultInvitationSectionConfig: InvitationSectionConfig = {
  rsvp: true,
  wishes: false,
  gift: true,
};

export function normalizeInvitationSectionConfig(
  value: unknown,
): InvitationSectionConfig {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ...defaultInvitationSectionConfig };
  }

  const source = value as Record<string, unknown>;
  return invitationSectionKeys.reduce<InvitationSectionConfig>(
    (result, key) => {
      if (typeof source[key] === "boolean") result[key] = source[key] as boolean;
      return result;
    },
    { ...defaultInvitationSectionConfig },
  );
}
''',
)


# ---------------------------------------------------------------------------
# Prisma: per-invitation section config + real Wishes persistence
# ---------------------------------------------------------------------------
schema = read("prisma/schema.prisma")
schema = replace_once(
    schema,
    "  giftAccountNumber  String?\n  musicUrl           String?\n",
    "  giftAccountNumber  String?\n  sectionConfig      Json?\n  musicUrl           String?\n",
    "Invitation sectionConfig",
)
schema = replace_once(
    schema,
    "  tables             WeddingTable[]\n  guests             Guest[]\n",
    "  tables             WeddingTable[]\n  guests             Guest[]\n  wishes             InvitationWish[]\n",
    "Invitation wishes relation",
)
insert_before = "model InvitationAsset {"
if insert_before not in schema:
    raise SystemExit("missing InvitationAsset model marker")
wish_model = '''model InvitationWish {
  id           String     @id @default(cuid())
  invitationId String
  name         String
  message      String     @db.Text
  createdAt    DateTime   @default(now())
  invitation   Invitation @relation(fields: [invitationId], references: [id], onDelete: Cascade)

  @@index([invitationId, createdAt])
}

'''
schema = schema.replace(insert_before, wish_model + insert_before, 1)
write("prisma/schema.prisma", schema)

write(
    "prisma/migrations/20260917121000_add_invitation_sections_and_wishes/migration.sql",
    '''ALTER TABLE "Invitation"
ADD COLUMN "sectionConfig" JSONB;

CREATE TABLE "InvitationWish" (
    "id" TEXT NOT NULL,
    "invitationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvitationWish_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "InvitationWish_invitationId_createdAt_idx"
ON "InvitationWish"("invitationId", "createdAt");

ALTER TABLE "InvitationWish"
ADD CONSTRAINT "InvitationWish_invitationId_fkey"
FOREIGN KEY ("invitationId") REFERENCES "Invitation"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
''',
)


# ---------------------------------------------------------------------------
# Catalog: screenshot-inspired test template
# ---------------------------------------------------------------------------
catalog = read("lib/templates/catalog.ts")
marker = '''  {
    key: "modern-maroon",
'''
if marker not in catalog:
    raise SystemExit("catalog insertion marker missing")
sage_item = '''  {
    key: "sage-editorial",
    name: "Sage Editorial",
    description: "Cream + sage editorial dengan alur panjang modular untuk RSVP, Wishes, dan Gift.",
    previewImage:
      "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&q=80&w=900",
    assetPath: "/templates/sage-editorial",
  },
'''
catalog = catalog.replace(marker, sage_item + marker, 1)
write("lib/templates/catalog.ts", catalog)


# ---------------------------------------------------------------------------
# Real public Wishes API with the same baseline anti-spam pattern as RSVP
# ---------------------------------------------------------------------------
write(
    "app/api/invite/[slug]/wishes/route.ts",
    '''import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasPaidDigitalInvitation } from "@/lib/packages/access";
import { hasInvitationAccess } from "@/lib/invitation-password";
import {
  checkPublicRateLimit,
  getClientIp,
} from "@/lib/public-rate-limit";
import { normalizeInvitationSectionConfig } from "@/lib/templates/sections";

async function activeInvitation(slug: string) {
  const invitation = await prisma.invitation.findUnique({
    where: { slug },
    include: { payment: true },
  });
  if (
    !invitation ||
    !invitation.eventConfigured ||
    !invitation.isPublished ||
    !hasPaidDigitalInvitation(invitation.payment)
  ) {
    return null;
  }
  const sections = normalizeInvitationSectionConfig(invitation.sectionConfig);
  if (!sections.wishes) return null;
  if (
    invitation.passwordProtected &&
    !(await hasInvitationAccess(invitation.slug))
  ) {
    return null;
  }
  return invitation;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const invitation = await activeInvitation(slug);
  if (!invitation) {
    return NextResponse.json({ error: "Wishes tidak aktif." }, { status: 404 });
  }

  const wishes = await prisma.invitationWish.findMany({
    where: { invitationId: invitation.id },
    orderBy: { createdAt: "desc" },
    take: 30,
    select: { id: true, name: true, message: true, createdAt: true },
  });
  return NextResponse.json({ wishes });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const invitation = await activeInvitation(slug);
  if (!invitation) {
    return NextResponse.json({ error: "Wishes tidak aktif." }, { status: 404 });
  }

  const clientIp = getClientIp(request);
  const rate = checkPublicRateLimit(`wishes:${slug}:${clientIp}`, 5, 60_000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak ucapan dikirim. Coba lagi sebentar." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rate.retryAfterSeconds),
          "X-RateLimit-Limit": "5",
          "X-RateLimit-Remaining": "0",
        },
      },
    );
  }

  const body = await request.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const message = String(body?.message ?? "").trim();
  if (!name || !message) {
    return NextResponse.json(
      { error: "Nama dan ucapan wajib diisi." },
      { status: 400 },
    );
  }
  if (name.length > 80 || message.length > 500) {
    return NextResponse.json(
      { error: "Nama maksimal 80 karakter dan ucapan maksimal 500 karakter." },
      { status: 400 },
    );
  }

  const wish = await prisma.invitationWish.create({
    data: { invitationId: invitation.id, name, message },
    select: { id: true, name: true, message: true, createdAt: true },
  });

  return NextResponse.json(
    { wish },
    {
      status: 201,
      headers: {
        "X-RateLimit-Limit": "5",
        "X-RateLimit-Remaining": String(rate.remaining),
      },
    },
  );
}
''',
)

write(
    "components/PublicInvitation/WishesForm.tsx",
    '''"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageCircleMore, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Wish = {
  id: string;
  name: string;
  message: string;
  createdAt: string;
};

export default function WishesForm({ slug }: { slug: string }) {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    const response = await fetch(`/api/invite/${encodeURIComponent(slug)}/wishes`, {
      cache: "no-store",
    });
    const data = await response.json().catch(() => null);
    if (response.ok) setWishes((data?.wishes ?? []) as Wish[]);
  }, [slug]);

  useEffect(() => {
    load().catch(() => undefined);
  }, [load]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim() || !message.trim() || busy) return;
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch(`/api/invite/${encodeURIComponent(slug)}/wishes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), message: message.trim() }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "Ucapan belum dapat dikirim.");
      setName("");
      setMessage("");
      setWishes((current) => [data.wish as Wish, ...current].slice(0, 30));
      setNotice("Ucapan terkirim.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Ucapan belum dapat dikirim.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={submit} className="space-y-3">
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={80}
          placeholder="Nama Anda"
          aria-label="Nama pengirim ucapan"
        />
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          maxLength={500}
          rows={4}
          placeholder="Tulis ucapan Anda"
          className="w-full rounded-[10px] border border-current/15 bg-white/55 px-3 py-3 text-sm outline-none placeholder:text-current/45 focus:border-current/35"
          aria-label="Ucapan"
        />
        <Button type="submit" size="sm" disabled={busy || !name.trim() || !message.trim()}>
          <Send className="h-4 w-4" />
          {busy ? "Mengirim..." : "Kirim ucapan"}
        </Button>
        {notice && <p className="text-xs opacity-65" role="status">{notice}</p>}
      </form>

      <div className="space-y-2">
        {wishes.length === 0 ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-current/10 px-4 py-6 text-xs opacity-55">
            <MessageCircleMore className="h-4 w-4" />
            Belum ada ucapan.
          </div>
        ) : (
          wishes.map((wish) => (
            <article key={wish.id} className="rounded-xl border border-current/10 bg-white/35 px-4 py-3 text-left">
              <p className="text-xs font-semibold">{wish.name}</p>
              <p className="mt-1 whitespace-pre-wrap text-xs leading-5 opacity-70">{wish.message}</p>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
''',
)


# ---------------------------------------------------------------------------
# Public template registry and screenshot-inspired Sage template
# ---------------------------------------------------------------------------
write(
    "components/PublicInvitation/TemplateRenderer.tsx",
    '''import PublicInvitation, {
  type PublicInvitationData,
} from "@/components/PublicInvitation/PublicInvitation";
import FigmaClassicTemplate from "@/components/PublicInvitation/FigmaClassicTemplate";
import SageEditorialTemplate from "@/components/PublicInvitation/SageEditorialTemplate";

const renderers = {
  "eternal-blossom": FigmaClassicTemplate,
  "sage-editorial": SageEditorialTemplate,
} as const;

export default function TemplateRenderer({
  invitation,
}: {
  invitation: PublicInvitationData;
}) {
  const templateKey = invitation.templateKey.split("::")[0];
  const Renderer = renderers[templateKey as keyof typeof renderers];
  return Renderer ? <Renderer invitation={invitation} /> : <PublicInvitation invitation={invitation} />;
}
''',
)

write(
    "components/PublicInvitation/SageEditorialTemplate.tsx",
    '''import { MapPin } from "lucide-react";
import RsvpForm from "@/components/InvitationStudio/RsvpForm";
import WishesForm from "@/components/PublicInvitation/WishesForm";
import {
  weddingParentLine,
  type PublicInvitationData,
} from "@/components/PublicInvitation/PublicInvitation";
import {
  buildEventTitle,
  getEventCategory,
  getIndonesiaTimezone,
  normalizeEventCategory,
} from "@/lib/events/catalog";
import { normalizeInvitationSectionConfig } from "@/lib/templates/sections";

const cream = "#f6f0e5";
const paper = "#fbf8f0";
const ink = "#27342b";
const sage = "#65775f";
const line = "#cabd9e";

function Divider() {
  return (
    <div className="flex items-center justify-center gap-3 py-2" style={{ color: line }}>
      <span className="h-px w-14" style={{ background: line }} />
      <span className="text-[9px]">◇</span>
      <span className="h-px w-14" style={{ background: line }} />
    </div>
  );
}

function Heading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="text-center">
      <p className="text-[8px] font-semibold uppercase tracking-[0.22em]" style={{ color: line }}>{eyebrow}</p>
      <h2 className="mt-2 text-[28px] font-normal leading-none" style={{ fontFamily: "Georgia, serif" }}>{title}</h2>
      {description && <p className="mx-auto mt-2 max-w-[280px] text-[10px] leading-4 opacity-55">{description}</p>}
    </div>
  );
}

export default function SageEditorialTemplate({ invitation }: { invitation: PublicInvitationData }) {
  const sectionConfig = normalizeInvitationSectionConfig(invitation.sectionConfig);
  const categoryKey = normalizeEventCategory(invitation.eventCategory);
  const category = getEventCategory(categoryKey);
  const timezone = getIndonesiaTimezone(invitation.timezone);
  const title = invitation.title.trim() || buildEventTitle(categoryKey, invitation.groomName, invitation.brideName, invitation.title) || category.label;
  const couple = category.nameMode === "couple";
  const identity = couple
    ? [invitation.groomName, invitation.brideName].filter(Boolean).join(" & ")
    : category.nameMode === "single"
      ? invitation.groomName
      : title;
  const date = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: invitation.timezone || "Asia/Jakarta",
  }).format(invitation.eventDate);
  const image = invitation.assets.find((asset) => asset.type === "IMAGE")?.url;
  const groomParents = categoryKey === "WEDDING" ? weddingParentLine(invitation.groomFatherName, invitation.groomMotherName) : "";
  const brideParents = categoryKey === "WEDDING" ? weddingParentLine(invitation.brideFatherName, invitation.brideMotherName) : "";
  const giftReady = Boolean(invitation.giftBankName && invitation.giftAccountNumber);

  return (
    <main className="min-h-screen px-4 py-8" style={{ background: cream, color: ink }}>
      <div className="mx-auto w-full max-w-[420px] border p-2 shadow-[0_18px_60px_rgba(44,53,43,.08)]" style={{ borderColor: line, background: paper }}>
        <div className="overflow-hidden border px-5 py-8" style={{ borderColor: `${line}88` }}>
          <section className="text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-full border text-[11px]" style={{ borderColor: line, color: sage }}>
              DC
            </div>
            <p className="mt-6 text-[8px] uppercase tracking-[0.22em]" style={{ color: line }}>{category.label}</p>
            <h1 className="mt-2 text-[34px] leading-none" style={{ fontFamily: "Georgia, serif" }}>{identity || title}</h1>
            <div className="mx-auto mt-7 h-52 w-44 overflow-hidden rounded-t-[88px] border p-1" style={{ borderColor: line }}>
              {image ? <img src={image} alt="" className="h-full w-full rounded-t-[84px] object-cover" /> : <div className="h-full w-full rounded-t-[84px]" style={{ background: "#dfe5d6" }} />}
            </div>
            <p className="mt-5 text-[11px]" style={{ fontFamily: "Georgia, serif" }}>{date}</p>
            <p className="mt-1 text-[9px] opacity-55">{invitation.venue}</p>
          </section>

          <div className="my-8"><Divider /></div>

          <section className="space-y-7 text-center">
            <p className="mx-auto max-w-[290px] text-[11px] leading-5 opacity-65">
              {invitation.description || "Dengan penuh kebahagiaan, kami mengundang Anda untuk hadir dan menjadi bagian dari momen istimewa ini."}
            </p>
            {couple && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl" style={{ fontFamily: "Georgia, serif" }}>{invitation.groomName}</h2>
                  {groomParents && <p className="mx-auto mt-1 max-w-[280px] text-[9px] leading-4 opacity-50">{groomParents}</p>}
                </div>
                <p className="text-sm opacity-40">&amp;</p>
                <div>
                  <h2 className="text-2xl" style={{ fontFamily: "Georgia, serif" }}>{invitation.brideName}</h2>
                  {brideParents && <p className="mx-auto mt-1 max-w-[280px] text-[9px] leading-4 opacity-50">{brideParents}</p>}
                </div>
              </div>
            )}
          </section>

          <div className="my-8"><Divider /></div>

          <section>
            <Heading eyebrow="Save the date" title="Waktu & Lokasi" description="Detail acara untuk membantu Anda mempersiapkan kehadiran." />
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl border p-4 text-center" style={{ borderColor: line, background: cream }}>
                <p className="text-lg" style={{ fontFamily: "Georgia, serif" }}>Mulai</p>
                <p className="mt-3 text-[10px] font-semibold">{invitation.ceremonyTime || "—"} {timezone.label}</p>
              </div>
              <div className="rounded-xl p-4 text-center text-white" style={{ background: ink }}>
                <p className="text-lg" style={{ fontFamily: "Georgia, serif" }}>Selesai</p>
                <p className="mt-3 text-[10px] font-semibold">{invitation.receptionTime || "—"} {timezone.label}</p>
              </div>
            </div>
            <div className="mt-6 text-center">
              <span className="mx-auto grid size-8 place-items-center rounded-full" style={{ background: "#e5e8dc", color: sage }}><MapPin className="h-3.5 w-3.5" /></span>
              <h3 className="mt-3 text-xl" style={{ fontFamily: "Georgia, serif" }}>{invitation.venue}</h3>
              {invitation.address && <p className="mx-auto mt-1 max-w-[280px] text-[9px] leading-4 opacity-50">{invitation.address}</p>}
              {invitation.mapUrl && <a href={invitation.mapUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-[9px] underline underline-offset-4" style={{ color: sage }}>Lihat Lokasi</a>}
            </div>
          </section>

          {sectionConfig.rsvp && (
            <>
              <div className="my-8"><Divider /></div>
              <section>
                <Heading eyebrow="Kehadiran" title="Konfirmasi RSVP" description="Silakan isi konfirmasi kehadiran Anda." />
                <div className="mt-6">
                  <RsvpForm slug={invitation.slug} eventDate={invitation.eventDate} venue={invitation.venue} title={title} start={invitation.ceremonyTime} description={invitation.description} />
                </div>
              </section>
            </>
          )}

          {sectionConfig.wishes && (
            <>
              <div className="my-8"><Divider /></div>
              <section>
                <Heading eyebrow="Ucapan & Doa" title="Wishes" description="Berikan ucapan dan doa baik untuk acara ini." />
                <div className="mt-6"><WishesForm slug={invitation.slug} /></div>
              </section>
            </>
          )}

          {sectionConfig.gift && giftReady && (
            <>
              <div className="my-8"><Divider /></div>
              <section>
                <Heading eyebrow="Tanda Kasih" title="Gift" description="Jika berkenan, tanda kasih dapat dikirim melalui informasi berikut." />
                <div className="mt-6 rounded-xl border p-5" style={{ borderColor: line, background: cream }}>
                  <p className="text-center text-lg" style={{ fontFamily: "Georgia, serif" }}>Transfer Bank</p>
                  <div className="mx-auto my-4 h-px w-10" style={{ background: line }} />
                  <div className="space-y-3 text-[10px]">
                    <div><p className="uppercase tracking-[0.12em] opacity-45">Bank</p><p className="mt-1 font-semibold">{invitation.giftBankName}</p></div>
                    {invitation.giftAccountName && <div><p className="uppercase tracking-[0.12em] opacity-45">Nama Pemilik</p><p className="mt-1 font-semibold">{invitation.giftAccountName}</p></div>}
                    <div><p className="uppercase tracking-[0.12em] opacity-45">Nomor Rekening</p><p className="mt-1 font-semibold">{invitation.giftAccountNumber}</p></div>
                  </div>
                </div>
              </section>
            </>
          )}

          <div className="my-8"><Divider /></div>
          <footer className="text-center">
            <p className="mx-auto max-w-[280px] text-[9px] leading-4 opacity-50">Terima kasih telah menjadi bagian dari momen ini. Kehadiran dan doa baik Anda sangat berarti bagi kami.</p>
            <p className="mt-5 text-xl" style={{ fontFamily: "Georgia, serif" }}>Sampai bertemu di acara,</p>
            <p className="mt-2 text-2xl" style={{ fontFamily: "Georgia, serif" }}>{identity || title}</p>
          </footer>
        </div>
      </div>
    </main>
  );
}
''',
)


# ---------------------------------------------------------------------------
# Studio canvas renderer: template selection now truly changes the canvas.
# Shared RSVP/Wishes/Gift preview components are reused across variants.
# ---------------------------------------------------------------------------
write(
    "components/InvitationStudio/StudioTemplateRenderer.tsx",
    '''import { MapPin } from "lucide-react";
import { weddingParentLine } from "@/lib/events/parents";
import {
  getEventCategory,
  getIndonesiaTimezone,
  normalizeEventCategory,
} from "@/lib/events/catalog";
import type { InvitationSectionConfig } from "@/lib/templates/sections";
import type { FontKey, PaletteKey } from "@/lib/templates/design";
import { invitationFonts, invitationPalettes } from "@/lib/templates/design";

type PreviewInvitation = {
  title: string;
  eventCategory: string;
  groomName: string;
  brideName: string;
  groomFatherName?: string | null;
  groomMotherName?: string | null;
  brideFatherName?: string | null;
  brideMotherName?: string | null;
  venue: string;
  address?: string | null;
  timezone: string;
  eventDate: string;
  ceremonyTime: string | null;
  receptionTime: string | null;
  description: string | null;
};

type GiftPreview = {
  bankName: string;
  accountName: string;
  accountNumber: string;
};

type Props = {
  templateKey: string;
  invitation: PreviewInvitation | null;
  palette: (typeof invitationPalettes)[PaletteKey];
  fontPair: (typeof invitationFonts)[FontKey];
  decorUrl: string;
  eventTag: string;
  sections: InvitationSectionConfig;
  gift: GiftPreview;
};

function info(invitation: PreviewInvitation | null) {
  const categoryKey = normalizeEventCategory(invitation?.eventCategory || "OTHER");
  const category = getEventCategory(categoryKey);
  const primary = category.nameMode === "couple"
    ? invitation?.groomName || invitation?.title || "Nama pertama"
    : category.nameMode === "single"
      ? invitation?.groomName || invitation?.title || "Nama utama"
      : invitation?.title || "Nama acara";
  const secondary = category.nameMode === "couple" ? invitation?.brideName || "Nama kedua" : "";
  const date = invitation?.eventDate ? new Date(invitation.eventDate) : null;
  const dateLabel = date && !Number.isNaN(date.getTime())
    ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: invitation?.timezone || "Asia/Jakarta" }).format(date)
    : "Tanggal acara";
  const timezone = getIndonesiaTimezone(invitation?.timezone || "Asia/Jakarta");
  const start = invitation?.ceremonyTime || "00:00";
  const end = invitation?.receptionTime || "00:00";
  return {
    categoryKey,
    category,
    primary,
    secondary,
    dateLabel,
    timeLabel: `${start}${invitation?.receptionTime ? `–${end}` : ""} ${timezone.label}`,
    groomParents: categoryKey === "WEDDING" ? weddingParentLine(invitation?.groomFatherName, invitation?.groomMotherName) : "",
    brideParents: categoryKey === "WEDDING" ? weddingParentLine(invitation?.brideFatherName, invitation?.brideMotherName) : "",
  };
}

function RsvpPreview() {
  return (
    <div className="space-y-2">
      <div className="h-8 rounded-md border border-current/15 bg-white/45 px-2 text-left text-[8px] leading-8 opacity-55">Nama tamu</div>
      <div className="h-8 rounded-md border border-current/15 bg-white/45 px-2 text-left text-[8px] leading-8 opacity-55">Konfirmasi kehadiran</div>
      <div className="h-8 rounded-md bg-current text-center text-[8px] font-semibold leading-8 text-white/90">Kirim RSVP</div>
    </div>
  );
}

function WishesPreview() {
  return (
    <div className="space-y-2">
      <div className="h-8 rounded-md border border-current/15 bg-white/45 px-2 text-left text-[8px] leading-8 opacity-55">Nama Anda</div>
      <div className="h-16 rounded-md border border-current/15 bg-white/45 px-2 py-2 text-left text-[8px] opacity-55">Tulis ucapan Anda...</div>
      <div className="h-8 rounded-md border border-current/10 bg-white/30 px-2 text-left text-[8px] leading-8 opacity-45">Ucapan yang dikirim akan tampil di sini.</div>
    </div>
  );
}

function GiftPreview({ gift }: { gift: GiftPreview }) {
  return (
    <div className="rounded-xl border border-current/15 bg-white/35 p-4 text-left text-[9px]">
      <p className="text-center text-base" style={{ fontFamily: "Georgia, serif" }}>Transfer Bank</p>
      <div className="my-3 h-px bg-current/15" />
      <p className="uppercase tracking-[0.12em] opacity-40">Bank</p>
      <p className="mt-1 font-semibold">{gift.bankName || "Isi bank di panel Section"}</p>
      <p className="mt-3 uppercase tracking-[0.12em] opacity-40">Nama Pemilik</p>
      <p className="mt-1 font-semibold">{gift.accountName || "Nama pemilik rekening"}</p>
      <p className="mt-3 uppercase tracking-[0.12em] opacity-40">Nomor Rekening</p>
      <p className="mt-1 font-semibold">{gift.accountNumber || "Nomor rekening"}</p>
    </div>
  );
}

function OptionalSections({ sections, gift, accent, fontHeading }: { sections: InvitationSectionConfig; gift: GiftPreview; accent: string; fontHeading: string }) {
  return (
    <>
      {sections.rsvp && (
        <section className="border-t border-current/10 px-6 py-7 text-center">
          <p className="text-[7px] uppercase tracking-[0.2em] opacity-45">Kehadiran</p>
          <h3 className="mt-2 text-2xl" style={{ fontFamily: fontHeading }}>Konfirmasi RSVP</h3>
          <div className="mx-auto mt-5 max-w-[280px]"><RsvpPreview /></div>
        </section>
      )}
      {sections.wishes && (
        <section className="border-t border-current/10 px-6 py-7 text-center">
          <p className="text-[7px] uppercase tracking-[0.2em] opacity-45">Ucapan & Doa</p>
          <h3 className="mt-2 text-2xl" style={{ fontFamily: fontHeading }}>Wishes</h3>
          <div className="mx-auto mt-5 max-w-[280px]"><WishesPreview /></div>
        </section>
      )}
      {sections.gift && (
        <section className="border-t border-current/10 px-6 py-7 text-center">
          <p className="text-[7px] uppercase tracking-[0.2em] opacity-45">Tanda Kasih</p>
          <h3 className="mt-2 text-2xl" style={{ fontFamily: fontHeading }}>Gift</h3>
          <div className="mx-auto mt-5 max-w-[280px]" style={{ color: accent }}><GiftPreview gift={gift} /></div>
        </section>
      )}
    </>
  );
}

function SagePreview(props: Props) {
  const meta = info(props.invitation);
  const cream = "#f6f0e5";
  const paper = "#fbf8f0";
  const ink = "#27342b";
  const sage = "#65775f";
  const line = "#cabd9e";
  return (
    <div className="overflow-hidden border p-2 shadow-[0_24px_70px_rgba(44,53,43,.12)]" style={{ background: cream, borderColor: line, color: ink }}>
      <div className="border px-5 py-8" style={{ background: paper, borderColor: `${line}88` }}>
        <section className="text-center">
          <div className="mx-auto grid size-11 place-items-center rounded-full border text-[9px]" style={{ borderColor: line, color: sage }}>DC</div>
          <p className="mt-5 text-[7px] uppercase tracking-[0.22em]" style={{ color: line }}>{meta.category.label}</p>
          <h1 className="mt-2 text-[30px] leading-none" style={{ fontFamily: "Georgia, serif" }}>{meta.secondary ? `${meta.primary} & ${meta.secondary}` : meta.primary}</h1>
          <div className="mx-auto mt-6 h-48 w-40 overflow-hidden rounded-t-[80px] border p-1" style={{ borderColor: line }}>
            {props.decorUrl ? <img src={props.decorUrl} alt="" className="h-full w-full rounded-t-[76px] object-cover opacity-80" /> : <div className="h-full w-full bg-[#dfe5d6]" />}
          </div>
          <p className="mt-4 text-[10px]" style={{ fontFamily: "Georgia, serif" }}>{meta.dateLabel}</p>
          <p className="mt-1 text-[8px] opacity-50">{props.invitation?.venue || "Lokasi acara"}</p>
        </section>
        <section className="mt-8 border-t px-1 pt-7 text-center" style={{ borderColor: `${line}88` }}>
          <p className="mx-auto max-w-[270px] text-[9px] leading-4 opacity-60">{props.invitation?.description || "Dengan penuh kebahagiaan, kami mengundang Anda untuk hadir di momen istimewa ini."}</p>
          {meta.secondary && <div className="mt-6 space-y-4"><div><p className="text-xl" style={{ fontFamily: "Georgia, serif" }}>{meta.primary}</p>{meta.groomParents && <p className="mt-1 text-[8px] opacity-45">{meta.groomParents}</p>}</div><p className="opacity-30">&amp;</p><div><p className="text-xl" style={{ fontFamily: "Georgia, serif" }}>{meta.secondary}</p>{meta.brideParents && <p className="mt-1 text-[8px] opacity-45">{meta.brideParents}</p>}</div></div>}
        </section>
        <section className="mt-8 border-t pt-7 text-center" style={{ borderColor: `${line}88` }}>
          <p className="text-[7px] uppercase tracking-[0.2em]" style={{ color: line }}>Save the date</p>
          <h2 className="mt-2 text-2xl" style={{ fontFamily: "Georgia, serif" }}>Waktu & Lokasi</h2>
          <div className="mt-5 grid grid-cols-2 gap-2"><div className="rounded-xl border p-3" style={{ borderColor: line, background: cream }}><p className="text-base" style={{ fontFamily: "Georgia, serif" }}>Mulai</p><p className="mt-2 text-[8px] font-semibold">{props.invitation?.ceremonyTime || "00:00"}</p></div><div className="rounded-xl p-3 text-white" style={{ background: ink }}><p className="text-base" style={{ fontFamily: "Georgia, serif" }}>Selesai</p><p className="mt-2 text-[8px] font-semibold">{props.invitation?.receptionTime || "00:00"}</p></div></div>
          <MapPin className="mx-auto mt-5 h-4 w-4" style={{ color: sage }} /><p className="mt-2 text-base" style={{ fontFamily: "Georgia, serif" }}>{props.invitation?.venue || "Lokasi acara"}</p>
        </section>
        <div className="mt-8"><OptionalSections sections={props.sections} gift={props.gift} accent={sage} fontHeading="Georgia, serif" /></div>
        <footer className="border-t border-current/10 px-4 pt-7 text-center"><p className="text-[8px] leading-4 opacity-45">Terima kasih telah menjadi bagian dari momen ini.</p><p className="mt-4 text-lg" style={{ fontFamily: "Georgia, serif" }}>{meta.secondary ? `${meta.primary} & ${meta.secondary}` : meta.primary}</p></footer>
      </div>
    </div>
  );
}

const variantMood: Record<string, { radius: string; image: string; frame: boolean; dark: boolean }> = {
  "eternal-blossom": { radius: "rounded-[30px]", image: "rounded-[55%_45%_50%_50%]", frame: false, dark: false },
  "modern-maroon": { radius: "rounded-[18px]", image: "rounded-md", frame: false, dark: false },
  "garden-light": { radius: "rounded-[26px]", image: "rounded-t-[90px]", frame: false, dark: false },
  "midnight-romance": { radius: "rounded-[18px]", image: "rounded-full", frame: false, dark: true },
  "classic-pearl": { radius: "rounded-none", image: "rounded-t-full", frame: true, dark: false },
};

function StandardPreview(props: Props) {
  const meta = info(props.invitation);
  const mood = variantMood[props.templateKey] || variantMood["eternal-blossom"];
  const bg = mood.dark ? "#171318" : props.palette.bg;
  const ink = mood.dark ? "#f8f2ee" : props.palette.ink;
  const accent = mood.dark ? "#e7a9b1" : props.palette.accent;
  return (
    <div className={`min-h-[780px] overflow-hidden ${mood.radius} ${mood.frame ? "border-4 border-double" : ""} shadow-[0_24px_70px_rgba(66,42,33,.18)]`} style={{ background: bg, color: ink, borderColor: props.palette.soft, fontFamily: props.fontPair.body }}>
      <section className={`relative overflow-hidden px-7 pb-10 pt-11 text-center ${props.templateKey === "modern-maroon" ? "border-l-[18px]" : ""}`} style={{ borderColor: accent }}>
        {props.decorUrl && <img src={props.decorUrl} alt="" className={`mx-auto h-44 w-44 object-cover opacity-75 ${mood.image}`} />}
        <p className="mt-6 text-[8px] uppercase tracking-[0.24em]" style={{ color: accent }}>{meta.category.label}</p>
        <h1 className="mt-4 text-4xl leading-none" style={{ fontFamily: props.fontPair.heading }}>{meta.primary}</h1>
        {meta.groomParents && <p className="mx-auto mt-2 max-w-[260px] text-[8px] opacity-50">{meta.groomParents}</p>}
        {meta.secondary && <><p className="my-2 text-xs opacity-40">&amp;</p><h2 className="text-4xl leading-none" style={{ fontFamily: props.fontPair.heading }}>{meta.secondary}</h2>{meta.brideParents && <p className="mx-auto mt-2 max-w-[260px] text-[8px] opacity-50">{meta.brideParents}</p>}</>}
        <p className="mx-auto mt-6 max-w-[280px] text-[10px] leading-4 opacity-60">{props.invitation?.description || "Kami mengundang Anda untuk hadir dan menjadi bagian dari acara ini."}</p>
      </section>
      <section className="border-t border-current/10 px-7 py-7 text-center"><p className="text-[8px] uppercase tracking-[0.18em]" style={{ color: accent }}>{meta.dateLabel}</p><p className="mt-2 text-[10px] opacity-60">{meta.timeLabel}</p><p className="mt-3 text-sm">{props.invitation?.venue || "Lokasi acara"}</p>{props.eventTag && <p className="mt-5 text-[9px]" style={{ color: accent }}>{props.eventTag}</p>}</section>
      <OptionalSections sections={props.sections} gift={props.gift} accent={accent} fontHeading={props.fontPair.heading} />
    </div>
  );
}

export default function StudioTemplateRenderer(props: Props) {
  return props.templateKey === "sage-editorial" ? <SagePreview {...props} /> : <StandardPreview {...props} />;
}
''',
)


# ---------------------------------------------------------------------------
# Invitation API stores section config as Studio content, not event metadata.
# ---------------------------------------------------------------------------
api = read("app/api/invitations/route.ts")
api = replace_once(
    api,
    'import { isLegacyInvitationSlug, slugifyCouple } from "@/lib/invitation-slug";\n',
    'import { isLegacyInvitationSlug, slugifyCouple } from "@/lib/invitation-slug";\nimport { normalizeInvitationSectionConfig } from "@/lib/templates/sections";\n',
    "section config import",
)
api = replace_once(
    api,
    '        giftAccountNumber: String(body.giftAccountNumber ?? invitation.giftAccountNumber ?? "").trim() || null,\n        musicUrl: String(body.musicUrl ?? invitation.musicUrl ?? "").trim() || null,\n',
    '        giftAccountNumber: String(body.giftAccountNumber ?? invitation.giftAccountNumber ?? "").trim() || null,\n        sectionConfig:\n          body.sectionConfig === undefined\n            ? invitation.sectionConfig\n            : normalizeInvitationSectionConfig(body.sectionConfig),\n        musicUrl: String(body.musicUrl ?? invitation.musicUrl ?? "").trim() || null,\n',
    "API sectionConfig persistence",
)
write("app/api/invitations/route.ts", api)


# ---------------------------------------------------------------------------
# Public invitation generic renderer now follows saved section switches.
# ---------------------------------------------------------------------------
public_inv = read("components/PublicInvitation/PublicInvitation.tsx")
public_inv = replace_once(
    public_inv,
    'import RsvpForm from "@/components/InvitationStudio/RsvpForm";\n',
    'import RsvpForm from "@/components/InvitationStudio/RsvpForm";\nimport WishesForm from "@/components/PublicInvitation/WishesForm";\nimport { normalizeInvitationSectionConfig } from "@/lib/templates/sections";\n',
    "public invitation section imports",
)
public_inv = replace_once(
    public_inv,
    '  giftAccountNumber: string | null;\n  assets: {\n',
    '  giftAccountNumber: string | null;\n  sectionConfig?: unknown;\n  assets: {\n',
    "public invitation type sectionConfig",
)
public_inv = replace_once(
    public_inv,
    '  const timeLabel = startTime\n    ? `${formatTime(startTime)}${endTime ? `–${formatTime(endTime)}` : ""} ${timezone.label}`\n    : "";\n',
    '  const timeLabel = startTime\n    ? `${formatTime(startTime)}${endTime ? `–${formatTime(endTime)}` : ""} ${timezone.label}`\n    : "";\n  const sections = normalizeInvitationSectionConfig(invitation.sectionConfig);\n  const giftReady = Boolean(invitation.giftBankName && invitation.giftAccountNumber);\n',
    "public invitation section vars",
)
old_rsvp = '''        <section className="mt-8 rounded-2xl border border-border bg-background p-6 shadow-sm md:p-10">
          <RsvpForm
            slug={invitation.slug}
            eventDate={invitation.eventDate}
            venue={invitation.venue}
            title={title}
            start={startTime}
            description={invitation.description}
          />
        </section>
'''
new_sections = '''        {sections.rsvp && (
          <section className="mt-8 rounded-2xl border border-border bg-background p-6 shadow-sm md:p-10">
            <RsvpForm
              slug={invitation.slug}
              eventDate={invitation.eventDate}
              venue={invitation.venue}
              title={title}
              start={startTime}
              description={invitation.description}
            />
          </section>
        )}

        {sections.wishes && (
          <section className="mt-8 rounded-2xl border border-border bg-background p-6 shadow-sm md:p-10">
            <h2 className="font-[family-name:var(--font-dc-heading)] text-2xl text-primary">Wishes</h2>
            <p className="mt-2 text-sm text-muted-foreground">Tinggalkan ucapan dan doa baik untuk acara ini.</p>
            <div className="mt-5"><WishesForm slug={invitation.slug} /></div>
          </section>
        )}

        {sections.gift && giftReady && (
          <section className="mt-8 rounded-2xl border border-border bg-background p-6 shadow-sm md:p-10">
            <h2 className="font-[family-name:var(--font-dc-heading)] text-2xl text-primary">Gift</h2>
            <div className="mt-5 space-y-3 text-sm">
              <p><span className="text-muted-foreground">Bank</span><br /><strong>{invitation.giftBankName}</strong></p>
              {invitation.giftAccountName && <p><span className="text-muted-foreground">Nama Pemilik</span><br /><strong>{invitation.giftAccountName}</strong></p>}
              <p><span className="text-muted-foreground">Nomor Rekening</span><br /><strong>{invitation.giftAccountNumber}</strong></p>
            </div>
          </section>
        )}
'''
public_inv = replace_once(public_inv, old_rsvp, new_sections, "public RSVP section")
public_inv = public_inv.replace('var(--font-cinzel)', 'var(--font-dc-heading)').replace('var(--font-fauna)', 'var(--font-dc-sans)').replace('var(--font-dm-mono)', 'var(--font-dc-mono)')
write("components/PublicInvitation/PublicInvitation.tsx", public_inv)


# ---------------------------------------------------------------------------
# Figma Classic compatibility template honors the same toggles and real Wishes.
# ---------------------------------------------------------------------------
figma = read("components/PublicInvitation/FigmaClassicTemplate.tsx")
figma = replace_once(
    figma,
    'import RsvpForm from "@/components/InvitationStudio/RsvpForm";\n',
    'import RsvpForm from "@/components/InvitationStudio/RsvpForm";\nimport WishesForm from "@/components/PublicInvitation/WishesForm";\nimport { normalizeInvitationSectionConfig } from "@/lib/templates/sections";\n',
    "Figma section imports",
)
figma = replace_once(
    figma,
    '  const rsvpTitle = eventTitle || identityTitle || "Acara";\n',
    '  const rsvpTitle = eventTitle || identityTitle || "Acara";\n  const sections = normalizeInvitationSectionConfig(invitation.sectionConfig);\n  const giftReady = Boolean(invitation.giftBankName && invitation.giftAccountNumber);\n',
    "Figma section vars",
)
# Wrap RSVP block.
old = '''          <Divider />

          <section className="w-full px-2 pb-6">
            <SectionHeading
              label="Kehadiran"
              title="Konfirmasi RSVP"
              description="Silakan isi konfirmasi kehadiran Anda untuk membantu persiapan acara."
            />
            <div className="mt-8">
              <RsvpForm
                slug={invitation.slug}
                eventDate={invitation.eventDate}
                venue={invitation.venue}
                title={rsvpTitle}
                start={invitation.ceremonyTime}
                description={invitation.description}
              />
            </div>
          </section>

          <Divider />

          <section className="w-full px-2 pb-6">
            <SectionHeading
              label="Tanda Kasih"
              title="Gift"
              description="Jika berkenan, informasi berikut dapat digunakan untuk mengirimkan tanda kasih."
            />
            {invitation.giftBankName && invitation.giftAccountNumber ? (
              <div className="mt-8 w-full rounded-xl border border-stone-400 bg-stone-200 p-6">
                <h3 className="text-center font-[Cormorant_Garamond,serif] text-xl">Transfer Bank</h3>
                <div className="mx-auto my-4 h-px w-10 bg-stone-400" />
                <div className="space-y-3 font-sans text-sm">
                  <div>
                    <p className="text-xs font-semibold uppercase text-stone-400">Bank</p>
                    <p className="font-semibold">{invitation.giftBankName}</p>
                  </div>
                  {invitation.giftAccountName && (
                    <div>
                      <p className="text-xs font-semibold uppercase text-stone-400">Nama Pemilik</p>
                      <p className="font-semibold">{invitation.giftAccountName}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold uppercase text-stone-400">Nomor Rekening</p>
                    <p className="font-semibold">{invitation.giftAccountNumber}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-8 text-center font-sans text-xs text-stone-400">
                Informasi hadiah akan ditampilkan jika penyelenggara mengaktifkannya.
              </p>
            )}
          </section>

          <Divider />
'''
new = '''          {sections.rsvp && (
            <>
              <Divider />
              <section className="w-full px-2 pb-6">
                <SectionHeading label="Kehadiran" title="Konfirmasi RSVP" description="Silakan isi konfirmasi kehadiran Anda untuk membantu persiapan acara." />
                <div className="mt-8">
                  <RsvpForm slug={invitation.slug} eventDate={invitation.eventDate} venue={invitation.venue} title={rsvpTitle} start={invitation.ceremonyTime} description={invitation.description} />
                </div>
              </section>
            </>
          )}

          {sections.wishes && (
            <>
              <Divider />
              <section className="w-full px-2 pb-6">
                <SectionHeading label="Ucapan & Doa" title="Wishes" description="Tinggalkan ucapan dan doa baik untuk acara ini." />
                <div className="mt-8"><WishesForm slug={invitation.slug} /></div>
              </section>
            </>
          )}

          {sections.gift && giftReady && (
            <>
              <Divider />
              <section className="w-full px-2 pb-6">
                <SectionHeading label="Tanda Kasih" title="Gift" description="Jika berkenan, informasi berikut dapat digunakan untuk mengirimkan tanda kasih." />
                <div className="mt-8 w-full rounded-xl border border-stone-400 bg-stone-200 p-6">
                  <h3 className="text-center font-[Cormorant_Garamond,serif] text-xl">Transfer Bank</h3>
                  <div className="mx-auto my-4 h-px w-10 bg-stone-400" />
                  <div className="space-y-3 font-sans text-sm">
                    <div><p className="text-xs font-semibold uppercase text-stone-400">Bank</p><p className="font-semibold">{invitation.giftBankName}</p></div>
                    {invitation.giftAccountName && <div><p className="text-xs font-semibold uppercase text-stone-400">Nama Pemilik</p><p className="font-semibold">{invitation.giftAccountName}</p></div>}
                    <div><p className="text-xs font-semibold uppercase text-stone-400">Nomor Rekening</p><p className="font-semibold">{invitation.giftAccountNumber}</p></div>
                  </div>
                </div>
              </section>
            </>
          )}

          <Divider />
'''
figma = replace_once(figma, old, new, "Figma optional sections")
write("components/PublicInvitation/FigmaClassicTemplate.tsx", figma)


# ---------------------------------------------------------------------------
# Public page goes through one renderer registry instead of hardcoded branching.
# ---------------------------------------------------------------------------
page = read("app/invite/[slug]/page.tsx")
page = page.replace(
    'import PublicInvitation, {\n  InvitationLockedState,\n} from "@/components/PublicInvitation/PublicInvitation";\nimport FigmaClassicTemplate from "@/components/PublicInvitation/FigmaClassicTemplate";\n',
    'import { InvitationLockedState } from "@/components/PublicInvitation/PublicInvitation";\nimport TemplateRenderer from "@/components/PublicInvitation/TemplateRenderer";\n',
)
old_branch = '''  const templateKey = invitation.templateKey.split("::")[0];

  // The existing Eternal Blossom key remains the compatibility slot for this design.
  if (templateKey === "eternal-blossom") {
    return <FigmaClassicTemplate invitation={invitation} />;
  }

  return <PublicInvitation invitation={invitation} />;
'''
page = replace_once(page, old_branch, '  return <TemplateRenderer invitation={invitation} />;\n', "public template registry")
write("app/invite/[slug]/page.tsx", page)


# ---------------------------------------------------------------------------
# Studio designer: persist toggles/gift data and route canvas through renderer.
# ---------------------------------------------------------------------------
designer = read("components/InvitationStudio/InvitationDesigner.tsx")
designer = replace_once(
    designer,
    '  ImagePlus,\n  Music2,\n',
    '  ImagePlus,\n  ListChecks,\n  Music2,\n',
    "Designer ListChecks icon",
)
designer = replace_once(
    designer,
    'import { invitationTemplates } from "@/lib/templates/catalog";\n',
    'import { invitationTemplates } from "@/lib/templates/catalog";\nimport StudioTemplateRenderer from "@/components/InvitationStudio/StudioTemplateRenderer";\nimport {\n  normalizeInvitationSectionConfig,\n  type InvitationSectionConfig,\n  type InvitationSectionKey,\n} from "@/lib/templates/sections";\n',
    "Designer template renderer imports",
)
designer = replace_once(
    designer,
    '  giftAccountNumber?: string | null;\n  musicUrl: string | null;\n' if '  giftAccountNumber?: string | null;\n  musicUrl: string | null;\n' in designer else '  musicUrl: string | null;\n',
    '  giftBankName?: string | null;\n  giftAccountName?: string | null;\n  giftAccountNumber?: string | null;\n  sectionConfig?: unknown;\n  musicUrl: string | null;\n',
    "Designer invitation gift/section fields",
)
designer = replace_once(
    designer,
    'type Panel = "template" | "color" | "font" | "content" | "decor" | "music";\n',
    'type Panel = "template" | "color" | "font" | "content" | "sections" | "decor" | "music";\n',
    "Designer Panel type",
)
designer = replace_once(
    designer,
    'type ContentForm = {\n  eventTag: string;\n  dressCode: string;\n};\n',
    'type ContentForm = {\n  eventTag: string;\n  dressCode: string;\n};\n\ntype GiftForm = {\n  bankName: string;\n  accountName: string;\n  accountNumber: string;\n};\n',
    "Designer GiftForm",
)
designer = replace_once(
    designer,
    '  const [musicUrl, setMusicUrl] = useState("");\n  const [content, setContent] = useState<ContentForm>({\n',
    '  const [musicUrl, setMusicUrl] = useState("");\n  const [sections, setSections] = useState<InvitationSectionConfig>(() =>\n    normalizeInvitationSectionConfig(null),\n  );\n  const [gift, setGift] = useState<GiftForm>({ bankName: "", accountName: "", accountNumber: "" });\n  const [content, setContent] = useState<ContentForm>({\n',
    "Designer section state",
)
designer = replace_once(
    designer,
    '    setMusicUrl(next.musicUrl || "");\n    setContent({\n',
    '    setMusicUrl(next.musicUrl || "");\n    setSections(normalizeInvitationSectionConfig(next.sectionConfig));\n    setGift({\n      bankName: next.giftBankName || "",\n      accountName: next.giftAccountName || "",\n      accountNumber: next.giftAccountNumber || "",\n    });\n    setContent({\n',
    "Designer load section state",
)
# Studio save must not resend event metadata/isPublished, so published Studio edits remain allowed by scoped lock.
old_save_body = '''        body: JSON.stringify({
          id: invitation.id,
          eventCategory: invitation.eventCategory,
          templateKey: designKey,
          musicUrl,
          weddingHashtag: content.eventTag,
          dressCode: content.dressCode,
          isPublished: invitation.isPublished,
        }),
'''
new_save_body = '''        body: JSON.stringify({
          id: invitation.id,
          templateKey: designKey,
          musicUrl,
          weddingHashtag: content.eventTag,
          dressCode: content.dressCode,
          sectionConfig: sections,
          giftBankName: gift.bankName,
          giftAccountName: gift.accountName,
          giftAccountNumber: gift.accountNumber,
        }),
'''
designer = replace_once(designer, old_save_body, new_save_body, "Designer Studio-only save payload")
# Add sections tool.
designer = replace_once(
    designer,
    '          <Tool active={panel === "content"} label="Isi" icon={<FilePenLine className="h-4 w-4" />} onClick={() => setPanel("content")} />\n          <Tool active={panel === "decor"}',
    '          <Tool active={panel === "content"} label="Isi" icon={<FilePenLine className="h-4 w-4" />} onClick={() => setPanel("content")} />\n          <Tool active={panel === "sections"} label="Section" icon={<ListChecks className="h-4 w-4" />} onClick={() => setPanel("sections")} />\n          <Tool active={panel === "decor"}',
    "Designer sections tool",
)
# Add section panel after content panel.
content_panel_block = '''          {panel === "content" && (
            <ContentPanel
              invitation={invitation}
              eventTag={content.eventTag}
              dressCode={content.dressCode}
              setEventTag={(value) => setContent((current) => ({ ...current, eventTag: value }))}
              setDressCode={(value) => setContent((current) => ({ ...current, dressCode: value }))}
            />
          )}
'''
sections_panel_block = content_panel_block + '''          {panel === "sections" && (
            <SectionPanel
              sections={sections}
              onToggle={(key, enabled) =>
                setSections((current) => ({ ...current, [key]: enabled }))
              }
              gift={gift}
              setGift={setGift}
            />
          )}
'''
designer = replace_once(designer, content_panel_block, sections_panel_block, "Designer SectionPanel render")
# Template selection: Sage template gets its authored default palette while still editable afterward.
designer = replace_once(
    designer,
    '<TemplatePanel templates={templates} selected={design.template} onSelect={(value) => change({ template: value })} />',
    '<TemplatePanel templates={templates} selected={design.template} onSelect={(value) => change(value === "sage-editorial" ? { template: value, palette: "sage" } : { template: value })} />',
    "Designer template onSelect",
)
# Canvas renderer in editor and fullscreen preview.
old_canvas = '''            <InvitationPreview
              invitation={invitation}
              palette={palette}
              fontPair={fontPair}
              decorUrl={design.decor}
              eventTag={content.eventTag}
            />'''
new_canvas = '''            <StudioTemplateRenderer
              templateKey={design.template}
              invitation={invitation}
              palette={palette}
              fontPair={fontPair}
              decorUrl={design.decor}
              eventTag={content.eventTag}
              sections={sections}
              gift={gift}
            />'''
if designer.count(old_canvas) != 2:
    raise SystemExit(f"expected 2 InvitationPreview canvas instances, got {designer.count(old_canvas)}")
designer = designer.replace(old_canvas, new_canvas)
# Canonical Studio UI font tokens.
designer = designer.replace('var(--font-fauna)', 'var(--font-dc-sans)').replace('var(--font-cinzel)', 'var(--font-dc-heading)').replace('var(--font-dm-mono)', 'var(--font-dc-mono)')

# Insert SectionPanel before DecorPanel.
section_component = '''function SectionPanel({
  sections,
  onToggle,
  gift,
  setGift,
}: {
  sections: InvitationSectionConfig;
  onToggle: (key: InvitationSectionKey, enabled: boolean) => void;
  gift: GiftForm;
  setGift: React.Dispatch<React.SetStateAction<GiftForm>>;
}) {
  const items: { key: InvitationSectionKey; label: string; description: string }[] = [
    { key: "rsvp", label: "RSVP", description: "Form konfirmasi kehadiran publik." },
    { key: "wishes", label: "Wishes", description: "Ucapan tamu dengan penyimpanan dan anti-spam." },
    { key: "gift", label: "Gift / e-angpao", description: "Informasi transfer hadiah. QRIS dapat ditambahkan nanti." },
  ];

  return (
    <div>
      <Heading eyebrow="Composition" title="Section undangan" description="Nyalakan hanya bagian yang dibutuhkan. Canvas berubah langsung dan pilihan tersimpan per undangan." />
      <div className="mt-5 space-y-2">
        {items.map((item) => (
          <label key={item.key} className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/70 bg-background p-3.5">
            <input
              type="checkbox"
              checked={sections[item.key]}
              onChange={(event) => onToggle(item.key, event.target.checked)}
              className="mt-0.5 size-4 accent-[var(--primary)]"
            />
            <span className="min-w-0">
              <span className="block text-xs font-semibold text-foreground">{item.label}</span>
              <span className="mt-1 block text-[10px] leading-4 text-muted-foreground">{item.description}</span>
            </span>
          </label>
        ))}
      </div>

      {sections.gift && (
        <div className="mt-5 space-y-3 rounded-xl border border-border/70 bg-background p-4">
          <p className="text-xs font-semibold text-foreground">Data Gift / e-angpao</p>
          <input value={gift.bankName} onChange={(event) => setGift((current) => ({ ...current, bankName: event.target.value }))} placeholder="Nama bank" className="w-full rounded-[10px] border border-border bg-foreground/[0.018] px-3 py-2.5 text-xs outline-none focus:border-primary" />
          <input value={gift.accountName} onChange={(event) => setGift((current) => ({ ...current, accountName: event.target.value }))} placeholder="Nama pemilik rekening" className="w-full rounded-[10px] border border-border bg-foreground/[0.018] px-3 py-2.5 text-xs outline-none focus:border-primary" />
          <input value={gift.accountNumber} onChange={(event) => setGift((current) => ({ ...current, accountNumber: event.target.value }))} placeholder="Nomor rekening" className="w-full rounded-[10px] border border-border bg-foreground/[0.018] px-3 py-2.5 text-xs outline-none focus:border-primary" />
          <p className="text-[9px] leading-4 text-muted-foreground">Section Gift publik hanya tampil jika aktif dan data bank + nomor rekening tersedia.</p>
        </div>
      )}
    </div>
  );
}

'''
if 'function DecorPanel(' not in designer:
    raise SystemExit("DecorPanel marker missing")
designer = designer.replace('function DecorPanel(', section_component + 'function DecorPanel(', 1)
write("components/InvitationStudio/InvitationDesigner.tsx", designer)


# ---------------------------------------------------------------------------
# Editor header respects canonical wordmark; no tagline in dashboard Studio.
# ---------------------------------------------------------------------------
editor = read("components/InvitationStudio/InvitationEditorPage.tsx")
editor = replace_once(
    editor,
    'import { Button } from "@/components/ui/button";\n',
    'import { Button } from "@/components/ui/button";\nimport BrandWordmark from "@/components/Brand/BrandWordmark";\n',
    "Studio BrandWordmark import",
)
editor = replace_once(
    editor,
    '''          <Link
            href="/"
            className="font-[family-name:var(--font-cinzel)] text-sm font-semibold tracking-[0.16em] text-primary hover:text-primary/80"
          >
            DC Organizer
          </Link>''',
    '''          <Link href="/" className="group min-w-0">
            <BrandWordmark size="mobile" />
          </Link>''',
    "Studio canonical wordmark",
)
editor = editor.replace('var(--font-fauna)', 'var(--font-dc-sans)').replace('var(--font-dm-mono)', 'var(--font-dc-mono)')
write("components/InvitationStudio/InvitationEditorPage.tsx", editor)


# ---------------------------------------------------------------------------
# Documentation: canonical requirement + agent architecture + requested delta.
# ---------------------------------------------------------------------------
prd = read("prd.md")
prd_marker = "## 7. Digital Invitation & Invitation Studio\n"
if prd_marker not in prd:
    raise SystemExit("PRD Studio marker missing")
prd_add = '''## 6.2 Modular invitation template architecture

Invitation template wajib menggunakan arsitektur modular agar update template tidak menduplikasi fungsi inti:
- `lib/templates/catalog.ts` adalah metadata catalog template;
- public rendering dipilih melalui satu template renderer registry;
- Studio canvas wajib merender `templateKey` yang sedang dipilih secara live; mengganti template harus langsung mengubah canvas sebelum Save;
- functional sections seperti **RSVP**, **Wishes**, dan **Gift / e-angpao** diperlakukan sebagai reusable section capability, bukan di-hardcode ulang secara terpisah untuk setiap template;
- Studio menyediakan toggle On/Off per section dan menyimpan pilihan tersebut per invitation di database;
- public invitation wajib menghormati section config yang tersimpan;
- RSVP tetap memakai RSVP backend canonical;
- Wishes menggunakan event-scoped persisted data dan public anti-spam/rate limiting;
- Gift memakai data rekening event yang nyata; jangan menampilkan rekening atau QRIS dummy;
- penambahan template baru idealnya cukup menambah catalog metadata + renderer/template composition, tanpa menduplikasi business logic section.

Template boleh memiliki warna, font, layout, dan decorative system sendiri karena merupakan konten undangan, tetapi dashboard/Studio chrome tetap mengikuti DC Organizer application design system.

'''
prd = prd.replace(prd_marker, prd_add + prd_marker, 1)
write("prd.md", prd)

agents = read("AGENTS.md")
agents_marker = "## 5. Anti AI-Slop Text Hierarchy\n"
if agents_marker not in agents:
    raise SystemExit("AGENTS marker missing")
agents_add = '''### Invitation Template Architecture
- Treat invitation templates as compositions over shared capabilities, not isolated one-off pages.
- Template metadata belongs in `lib/templates/catalog.ts`; public template selection must go through `components/PublicInvitation/TemplateRenderer.tsx`; Studio canvas selection must go through `components/InvitationStudio/StudioTemplateRenderer.tsx`.
- A selected template must visibly update the Studio canvas immediately; never store a template key while continuing to render an unrelated fixed preview.
- RSVP, Wishes, Gift/e-angpao, and future optional sections must use persisted invitation section configuration and shared functional components/APIs. Do not fork RSVP/Wishes business logic per visual template.
- Never use fake bank accounts, fake wishes, or fake RSVP data to make a template look complete. Studio-only visual skeletons are allowed when clearly non-data previews.

'''
agents = agents.replace(agents_marker, agents_add + agents_marker, 1)
write("AGENTS.md", agents)

readme = read("README.md")
readme_marker = "## Public Invitation Architecture\n"
if readme_marker not in readme:
    raise SystemExit("README Public Invitation marker missing")
readme_add = '''### Modular invitation templates

Invitation templates use a registry + reusable-section architecture. `lib/templates/catalog.ts` owns template metadata, `components/PublicInvitation/TemplateRenderer.tsx` chooses the public renderer, and `components/InvitationStudio/StudioTemplateRenderer.tsx` mirrors the active template on the Studio canvas. Per-invitation section configuration can enable/disable RSVP, Wishes, and Gift/e-angpao. RSVP uses the existing event-scoped RSVP API, Wishes are persisted per invitation with baseline public rate limiting, and Gift uses stored bank data rather than sample account information.

'''
readme = readme.replace(readme_marker, readme_add + readme_marker, 1)
write("README.md", readme)

prd1 = read("prd1.md")
prd1 += '''\n\n---\n\n## 2026-09-17 — Modular Invitation Templates & Studio Section Toggles\n\n### Intent\nMempermudah update template panjang dengan section reusable, membuat pilihan template benar-benar mengubah canvas Studio, dan memberi user kontrol On/Off untuk RSVP, Wishes, serta Gift/e-angpao.\n\n### Implementation\n- template catalog tetap menjadi metadata source dan public rendering dipusatkan melalui registry;\n- Studio canvas sekarang dirender berdasarkan `design.template`, bukan satu preview statis;\n- menambahkan test template `Sage Editorial`, terinspirasi struktur cream/sage dari reference screenshot user tanpa menyalin asset Figma;\n- menambahkan persisted `Invitation.sectionConfig` untuk toggle RSVP/Wishes/Gift;\n- menambahkan `InvitationWish` + public Wishes API/Form dengan rate limit baseline 5 request/menit/IP;\n- Gift editor memakai field bank existing dan public Gift hanya tampil jika data nyata tersedia;\n- Studio save payload tidak lagi mengirim event metadata/isPublished yang tidak berubah, sehingga tidak bertabrakan dengan published event-detail lock;\n- canonical DC Organizer wordmark dipakai pada Studio chrome tanpa tagline.\n\n### Affected areas\n`prisma/schema.prisma`, migration `20260917121000_add_invitation_sections_and_wishes`, template registry/catalog, Studio designer/canvas, public invitation renderers, Wishes API/Form, documentation.\n\n### Validation\n__VALIDATION__\n\n### Deployment\nSchema berubah. Production wajib menjalankan `pnpm db:deploy` sebelum source baru menerima traffic.\n'''
write("prd1.md", prd1)

extra = read("prd-tambahan.md")
extra += '''\n\n---\n\n# PRD Tambahan — Modular Template Sections\n\n**Date:** 17 September 2026  \n**Reference:** dua screenshot user menampilkan undangan mobile panjang dengan cream/sage editorial composition, arched image, schedule/location cards, RSVP, Wishes, Gift, dan closing. Reference dipakai untuk struktur/layout; asset Figma tidak disalin.\n\n## Requirement delta\n- template harus mudah diupdate dengan component/section reusable;\n- mengganti template di Studio wajib langsung mengubah canvas;\n- RSVP, Wishes, dan Gift/e-angpao memiliki toggle On/Off per invitation;\n- toggle tersimpan di database dan public renderer menghormatinya;\n- RSVP tidak dibuat ulang per template; tetap memakai RSVP canonical;\n- Wishes harus menyimpan data nyata, bukan demo/fake comment;\n- Gift hanya menampilkan data rekening nyata;\n- tersedia template test **Sage Editorial** untuk menguji alur modular panjang seperti reference.\n\n## Validation\n__VALIDATION__\n\n## Deployment note\nPerubahan membawa migration baru untuk `Invitation.sectionConfig` dan `InvitationWish`; production membutuhkan `pnpm db:deploy`.\n'''
write("prd-tambahan.md", extra)
