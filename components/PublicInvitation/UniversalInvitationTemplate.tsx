"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { CalendarDays, ChevronDown, Gift, Heart, MapPin, Music2 } from "lucide-react";
import RsvpForm from "@/components/InvitationStudio/RsvpForm";
import { getEventCategory, normalizeEventCategory } from "@/lib/events/catalog";
import { invitationFonts, invitationPalettes, parseDesignKey } from "@/lib/templates/design";
import { getInvitationTemplate } from "@/lib/templates/catalog";
import { resolveInvitationPhotos, type PhotoAssignments, type PhotoSlot } from "@/lib/templates/photo-slots";
import { parseInvitationSections, type InvitationSections } from "@/lib/templates/sections";

type InvitationData = {
  slug: string;
  title: string;
  eventCategory: string;
  groomName: string;
  brideName: string;
  venue: string;
  address?: string | null;
  mapUrl?: string | null;
  timezone: string;
  eventDate: Date | string;
  ceremonyTime: string | null;
  receptionTime: string | null;
  description: string | null;
  templateKey: string;
  giftBankName?: string | null;
  giftAccountName?: string | null;
  giftAccountNumber?: string | null;
  weddingHashtag?: string | null;
  dressCode?: string | null;
  musicUrl?: string | null;
  assets: { id: string; type: "IMAGE" | "AUDIO"; url: string; title: string | null }[];
};

const headings = {
  cover: ["The celebration", "Sebuah Undangan"],
  greeting: ["A warm welcome", "Dengan Hangat"],
  identity: ["Meet the hosts", "Yang Mengundang"],
  event: ["Our celebration", "Detail Acara"],
  dateTime: ["Save the date", "Tanggal & Waktu"],
  gallery: ["Our moments", "Galeri Foto"],
  countdown: ["The day is near", "Menuju Hari Istimewa"],
  location: ["Find your way", "Lokasi"],
  rsvp: ["Your presence matters", "Konfirmasi Kehadiran"],
  wishes: ["Kind words", "Ucapan & Doa"],
  gift: ["With gratitude", "Tanda Kasih"],
  closing: ["Until we meet", "Terima Kasih"],
} as const;

function displayDate(value: Date | string, timezone: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Tanggal belum ditentukan";
  try {
    return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: timezone || "Asia/Jakarta" }).format(date);
  } catch {
    return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(date);
  }
}

function eventCountdown(value: Date | string, now: number | null) {
  if (now === null) return null;
  const end = new Date(value).getTime();
  if (!Number.isFinite(end)) return null;
  const seconds = Math.max(0, Math.floor((end - now) / 1000));
  return [
    ["Hari", Math.floor(seconds / 86400)],
    ["Jam", Math.floor((seconds / 3600) % 24)],
    ["Menit", Math.floor((seconds / 60) % 60)],
    ["Detik", seconds % 60],
  ] as const;
}

/** One real public/Studio presentation for the six non-Romantic Rose built-in themes.
 * Section logic, media ownership and RSVP are shared; visual palette/layout remain template-owned.
 */
export default function UniversalInvitationTemplate({
  invitation,
  preview = false,
  sections: sectionOverride,
  photoAssignments,
  coverUrl,
  onEditPhoto,
  templateKey,
}: {
  invitation: InvitationData;
  preview?: boolean;
  sections?: InvitationSections;
  photoAssignments?: PhotoAssignments;
  coverUrl?: string;
  onEditPhoto?: (slot: PhotoSlot) => void;
  templateKey?: string;
}) {
  const [opened, setOpened] = useState(false);
  const [now, setNow] = useState<number | null>(null);
  const key = templateKey || parseDesignKey(invitation.templateKey).template;
  const template = getInvitationTemplate(key);
  const design = parseDesignKey(invitation.templateKey);
  const palette = invitationPalettes[design.palette] || invitationPalettes[template.preset.palette];
  const font = invitationFonts[design.font] || invitationFonts[template.preset.font];
  const layout = template.preset.layout;
  const sections = sectionOverride ?? parseInvitationSections(invitation.templateKey);
  const media = resolveInvitationPhotos(invitation.assets, invitation.templateKey, coverUrl, photoAssignments);
  const identity = getEventCategory(normalizeEventCategory(invitation.eventCategory));
  const couple = identity.nameMode === "couple";
  const names = couple
    ? [invitation.groomName, invitation.brideName].filter(Boolean).join(" & ")
    : identity.nameMode === "single"
      ? invitation.groomName || invitation.title
      : invitation.title;
  const eventTitle = invitation.title || names || "Perayaan";
  const date = displayDate(invitation.eventDate, invitation.timezone);
  const countdown = eventCountdown(invitation.eventDate, now);
  const maps = invitation.mapUrl && /^https?:\/\//i.test(invitation.mapUrl) ? invitation.mapUrl : null;
  const hasGift = Boolean(invitation.giftBankName?.trim() && invitation.giftAccountNumber?.trim());
  const music = invitation.musicUrl || invitation.assets.find((item) => item.type === "AUDIO")?.url;
  const frame = layout === "midnight" ? "rounded-full" : layout === "maroon" ? "rounded-none" : layout === "editorial" ? "rounded-2xl" : "rounded-t-[140px] rounded-b-xl";
  const panel = layout === "midnight" ? "rounded-3xl" : layout === "maroon" ? "rounded-sm" : layout === "editorial" ? "rounded-xl" : "rounded-[28px]";
  const css = {
    "--inv-bg": palette.bg,
    "--inv-surface": palette.surface,
    "--inv-ink": palette.ink,
    "--inv-accent": palette.accent,
    "--inv-soft": palette.soft,
    color: palette.ink,
    backgroundColor: palette.bg,
    fontFamily: font.body,
  } as CSSProperties;

  useEffect(() => {
    if (!opened) return;
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [opened]);

  const changePhoto = (slot: PhotoSlot, label: string) =>
    preview && onEditPhoto ? (
      <button
        type="button"
        className="absolute inset-0 z-10 flex items-end justify-center bg-transparent pb-3 text-xs font-medium text-transparent transition hover:bg-black/25 hover:text-white focus-visible:bg-black/25 focus-visible:text-white focus-visible:outline-2 focus-visible:outline-[var(--inv-accent)]"
        onClick={() => onEditPhoto(slot)}
        aria-label={`Atur foto ${label}`}
      >
        Atur foto
      </button>
    ) : null;

  const section = (keyName: keyof typeof headings, children: ReactNode, index: number) => (
    <section
      key={keyName}
      data-invitation-section={keyName}
      className="px-6 py-16 text-center sm:px-8"
      style={{ backgroundColor: index % 2 ? "var(--inv-surface)" : "var(--inv-bg)" }}
    >
      <p className="text-[10px] uppercase tracking-[0.23em] text-[var(--inv-accent)]">{headings[keyName][0]}</p>
      <h2 className="mt-3 text-2xl leading-snug text-[var(--inv-ink)]" style={{ fontFamily: font.heading }}>{headings[keyName][1]}</h2>
      <div className="mx-auto my-6 h-px w-14 bg-[var(--inv-soft)]" />
      {children}
    </section>
  );

  return (
    <main
      className={`relative isolate mx-auto min-h-[760px] w-full max-w-2xl overflow-hidden border border-[var(--inv-soft)] text-[var(--inv-ink)] ${panel}`}
      style={css}
    >
      {!opened ? (
        <section className="relative flex min-h-[760px] flex-col items-center justify-center overflow-hidden px-6 py-16 text-center">
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-65" style={{ background: "radial-gradient(ellipse at 50% 35%,var(--inv-surface),var(--inv-bg) 67%,var(--inv-soft))" }} />
          <div aria-hidden className="pointer-events-none absolute -left-20 top-24 h-56 w-56 rounded-full border border-[var(--inv-soft)] opacity-70" />
          <div aria-hidden className="pointer-events-none absolute -right-16 bottom-20 h-44 w-44 rounded-full border border-[var(--inv-soft)] opacity-70" />
          <p className="relative mb-9 text-[10px] uppercase tracking-[0.3em] text-[var(--inv-accent)]">{identity.label} · Digital Invitation</p>
          <div className="relative w-full max-w-[285px] drop-shadow-[0_20px_35px_rgba(35,25,30,0.18)]">
            <div className="absolute inset-x-0 top-0 z-10 h-36 origin-top [clip-path:polygon(0_0,100%_0,50%_100%)] bg-[var(--inv-soft)]" />
            <div className="relative mt-3 flex min-h-[344px] flex-col items-center justify-center border border-[var(--inv-soft)] bg-[var(--inv-surface)] px-6 pb-12 pt-16">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--inv-accent)]">Dengan hormat mengundang</p>
              <Heart className="my-6 h-7 w-7 text-[var(--inv-accent)]" strokeWidth={1.3} aria-hidden />
              <h1 className="break-words text-2xl leading-relaxed" style={{ fontFamily: font.heading }}>{names || eventTitle}</h1>
              <p className="mt-5 text-xs opacity-70">{date}</p>
            </div>
            <div aria-hidden className="relative -mt-16 h-36 bg-[var(--inv-soft)] [clip-path:polygon(0_0,50%_55%,100%_0,100%_100%,0_100%)]" />
            <div aria-hidden className="absolute bottom-7 left-1/2 z-10 grid h-11 w-11 -translate-x-1/2 place-items-center rounded-full border-4 border-[var(--inv-soft)] bg-[var(--inv-accent)] text-[var(--inv-surface)]">
              <Heart className="h-5 w-5" fill="currentColor" />
            </div>
          </div>
          <p className="relative mt-8 max-w-xs text-sm leading-7 opacity-75">Kehadiran Anda akan berarti bagi kami.</p>
          <button
            type="button"
            onClick={() => setOpened(true)}
            className="relative mt-7 min-h-11 rounded-full bg-[var(--inv-accent)] px-8 py-3 text-sm font-semibold text-[var(--inv-surface)] shadow-lg transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--inv-accent)]"
          >
            Buka Undangan
          </button>
          {preview && <p className="relative mt-4 text-[11px] opacity-60">Pratinjau · data contoh</p>}
        </section>
      ) : (
        <div>
          <section data-invitation-section="cover" className="relative flex min-h-[650px] flex-col items-center justify-center px-6 py-14 text-center">
            <div aria-hidden className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(circle at 50% 35%,var(--inv-soft),transparent 66%)" }} />
            <p className="relative text-[10px] uppercase tracking-[0.28em] text-[var(--inv-accent)]">{identity.label}</p>
            <h1 className="relative mt-5 max-w-full break-words text-3xl leading-relaxed sm:text-4xl" style={{ fontFamily: font.heading }}>{names || eventTitle}</h1>
            <div className={`relative mt-9 w-[min(70vw,285px)] overflow-hidden border-[6px] border-[var(--inv-surface)] shadow-[0_18px_38px_rgba(0,0,0,.13)] ${frame}`}>
              {media.cover ? (
                <img src={media.cover} alt="Foto utama acara" loading="lazy" className="aspect-[3/4] w-full object-cover" style={{ objectPosition: `center ${media.assignment.focus.cover}` }} />
              ) : (
                <div className="flex aspect-[3/4] items-center justify-center bg-[var(--inv-soft)]/30"><Heart className="h-10 w-10 text-[var(--inv-accent)]" strokeWidth={1} /></div>
              )}
              {changePhoto("cover", "cover")}
            </div>
            <p className="relative mt-8 text-sm opacity-75">{date}</p>
            <ChevronDown aria-hidden className="relative mt-7 h-5 w-5 animate-bounce text-[var(--inv-accent)] motion-reduce:animate-none" />
          </section>

          {section("greeting", <p className="mx-auto max-w-md text-sm leading-8 opacity-80">{invitation.description || "Dengan penuh sukacita, kami mengundang Anda untuk berbagi kebahagiaan bersama kami."}</p>, 1)}

          {section("identity", (
            <div className={`mx-auto max-w-lg gap-5 ${couple ? "grid grid-cols-2" : "flex flex-col items-center"}`}>
              {couple ? (
                <>
                  {([["personOne", invitation.groomName, media.personOne], ["personTwo", invitation.brideName, media.personTwo]] as const).map(([slot, name, url]) => (
                    <div key={slot} className="min-w-0">
                      <div className={`relative mx-auto overflow-hidden ${frame}`}>
                        {url ? <img src={url} alt={`Foto ${name || "mempelai"}`} loading="lazy" className="aspect-[3/4] w-full object-cover" style={{ objectPosition: `center ${media.assignment.focus[slot]}` }} /> : <div className="aspect-[3/4] bg-[var(--inv-soft)]/30" />}
                        {changePhoto(slot, name || "mempelai")}
                      </div>
                      <p className="mt-4 break-words text-base" style={{ fontFamily: font.heading }}>{name || "Nama belum diisi"}</p>
                    </div>
                  ))}
                </>
              ) : (
                <p className="break-words text-lg" style={{ fontFamily: font.heading }}>{names || eventTitle}</p>
              )}
            </div>
          ), 2)}

          {section("event", (
            <div className="mx-auto max-w-md space-y-3 text-sm leading-7">
              <p className="text-lg" style={{ fontFamily: font.heading }}>{eventTitle}</p>
              {invitation.venue && <p className="opacity-80">{invitation.venue}</p>}
              {invitation.dressCode && <p className="text-xs opacity-70">Dress code · {invitation.dressCode}</p>}
            </div>
          ), 3)}

          {section("dateTime", (
            <div className={`mx-auto max-w-sm border border-[var(--inv-soft)] bg-[var(--inv-bg)] px-5 py-7 ${panel}`}>
              <CalendarDays className="mx-auto h-6 w-6 text-[var(--inv-accent)]" aria-hidden />
              <p className="mt-4 text-lg" style={{ fontFamily: font.heading }}>{date}</p>
              {invitation.ceremonyTime && <p className="mt-3 text-sm">Mulai · {invitation.ceremonyTime}</p>}
              {invitation.receptionTime && <p className="mt-1 text-sm">Selesai · {invitation.receptionTime === "END" ? "Selesai acara" : invitation.receptionTime}</p>}
              <p className="mt-3 text-xs opacity-65">{invitation.timezone || "Asia/Jakarta"}</p>
            </div>
          ), 4)}

          {section("gallery", (
            <>
              {preview && onEditPhoto && <button type="button" onClick={() => onEditPhoto("gallery")} className="mb-5 min-h-10 rounded-full border border-[var(--inv-soft)] px-5 text-xs text-[var(--inv-accent)]">Atur foto galeri</button>}
              {media.gallery.length ? (
                <div className="grid grid-cols-2 gap-3">
                  {media.gallery.map((asset, index) => (
                    <div key={asset.id} className={index === 0 ? "col-span-2 overflow-hidden rounded-2xl" : "overflow-hidden rounded-2xl"}>
                      <img src={asset.url} alt={`Galeri foto ${index + 1}`} loading="lazy" className={index === 0 ? "aspect-[4/3] w-full object-cover" : "aspect-[3/4] w-full object-cover"} />
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm opacity-65">Belum ada foto galeri.</p>}
            </>
          ), 5)}

          {section("countdown", countdown ? (
            <div className="grid grid-cols-4 gap-2">
              {countdown.map(([label, value]) => (
                <div key={label} className={`border border-[var(--inv-soft)] bg-[var(--inv-bg)] px-1 py-3 ${panel}`}>
                  <p className="text-xl text-[var(--inv-accent)]" style={{ fontFamily: font.heading }}>{String(value).padStart(2, "0")}</p>
                  <p className="mt-1 text-[10px] opacity-65">{label}</p>
                </div>
              ))}
            </div>
          ) : <p className="text-sm opacity-65">Tanggal acara belum tersedia.</p>, 6)}

          {section("location", (
            <div className="mx-auto max-w-sm space-y-4">
              <MapPin aria-hidden className="mx-auto h-6 w-6 text-[var(--inv-accent)]" />
              <p className="text-lg" style={{ fontFamily: font.heading }}>{invitation.venue || "Lokasi belum ditentukan"}</p>
              {invitation.address && <p className="text-sm leading-7 opacity-75">{invitation.address}</p>}
              {maps && <a href={maps} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--inv-accent)] px-6 text-sm text-[var(--inv-surface)]">Buka Google Maps</a>}
              {!maps && <p className="text-xs opacity-55">Tautan lokasi belum tersedia.</p>}
            </div>
          ), 7)}

          {sections.rsvp && section("rsvp", preview ? (
            <div className="mx-auto max-w-sm border border-[var(--inv-soft)] bg-[var(--inv-bg)] p-6 text-sm leading-7">
              Form RSVP tersedia di undangan yang sudah dipublikasikan.
            </div>
          ) : <RsvpForm slug={invitation.slug} eventDate={invitation.eventDate} venue={invitation.venue} title={eventTitle} start={invitation.ceremonyTime} description={invitation.description} />, 8)}

          {sections.wishes && section("wishes", (
            <p className="mx-auto max-w-sm text-sm leading-7 opacity-70">Kolom ucapan belum aktif. Fitur ini akan memakai layanan Wishes bersama saat tersedia.</p>
          ), 9)}

          {sections.gift && section("gift", hasGift ? (
            <div className={`mx-auto max-w-sm border border-[var(--inv-soft)] bg-[var(--inv-bg)] px-6 py-7 text-sm ${panel}`}>
              <Gift className="mx-auto h-6 w-6 text-[var(--inv-accent)]" aria-hidden />
              <p className="mt-4 text-xs opacity-70">{invitation.giftBankName}</p>
              {invitation.giftAccountName && <p className="mt-2 font-semibold">{invitation.giftAccountName}</p>}
              <p className="mt-2 break-all text-lg" style={{ fontFamily: font.heading }}>{invitation.giftAccountNumber}</p>
              <button type="button" onClick={() => { if (invitation.giftAccountNumber) void navigator.clipboard?.writeText(invitation.giftAccountNumber); }} className="mt-5 min-h-10 rounded-full border border-[var(--inv-soft)] px-5 text-xs text-[var(--inv-accent)]">Salin nomor rekening</button>
            </div>
          ) : <p className="text-sm opacity-65">Informasi tanda kasih belum ditambahkan.</p>, 10)}

          {section("closing", (
            <div className="mx-auto max-w-sm text-sm leading-8">
              <Heart aria-hidden className="mx-auto mb-4 h-7 w-7 text-[var(--inv-accent)]" strokeWidth={1.3} />
              <p>Kehadiran dan doa baik Anda sangat berarti. Sampai bertemu!</p>
              <p className="mt-7 break-words text-lg" style={{ fontFamily: font.heading }}>{names || eventTitle}</p>
            </div>
          ), 11)}

          <footer data-invitation-section="footer" className="flex flex-col items-center gap-4 border-t border-[var(--inv-soft)] bg-[var(--inv-surface)] px-6 py-8 text-center">
            {music && <div className="flex items-center gap-2 text-xs text-[var(--inv-accent)]"><Music2 aria-hidden className="h-4 w-4" /><audio src={music} controls preload="none" aria-label="Musik undangan" className="h-9 w-52 max-w-full" /></div>}
            <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--inv-accent)]">Created with DC Organizer</p>
          </footer>
        </div>
      )}
    </main>
  );
}
