"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { CalendarDays, Gift, Heart, Leaf, MapPin, Moon, Sparkles, Star } from "lucide-react";
import InvitationThemeScenes from "@/components/PublicInvitation/InvitationThemeScenes";
import RsvpForm from "@/components/InvitationStudio/RsvpForm";
import type { PersonalRsvpGuest } from "@/components/InvitationStudio/rsvp-types";
import InvitationMusic, { type InvitationMusicHandle } from "@/components/PublicInvitation/InvitationMusic";
import { resolveInvitationMusic } from "@/lib/templates/music";
import { getEventCategory, normalizeEventCategory } from "@/lib/events/catalog";
import { weddingParentLine } from "@/lib/events/parents";
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
  groomFatherName?: string | null;
  groomMotherName?: string | null;
  groomChildOrder?: number | null;
  groomChildPosition?: string | null;
  brideFatherName?: string | null;
  brideMotherName?: string | null;
  brideChildOrder?: number | null;
  brideChildPosition?: string | null;
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

/** One shared feature engine for nine individually art-directed non-Romantic Rose themes.
 * Section logic, media ownership and RSVP are shared; themed envelope, cover and section art remain template-owned.
 */
export default function UniversalInvitationTemplate({
  invitation,
  preview = false,
  sections: sectionOverride,
  photoAssignments,
  coverUrl,
  onEditPhoto,
  templateKey,
  designKey,
  personalGuest,
}: {
  invitation: InvitationData;
  personalGuest?: PersonalRsvpGuest;
  preview?: boolean;
  sections?: InvitationSections;
  photoAssignments?: PhotoAssignments;
  coverUrl?: string;
  onEditPhoto?: (slot: PhotoSlot) => void;
  templateKey?: string;
  designKey?: string;
}) {
  const [opened, setOpened] = useState(false);
  const musicRef = useRef<InvitationMusicHandle>(null);
  const [now, setNow] = useState<number | null>(null);
  const key = templateKey || parseDesignKey(invitation.templateKey).template;
  const template = getInvitationTemplate(key);
  const activeDesignKey = designKey || (parseDesignKey(invitation.templateKey).template === key
    ? invitation.templateKey
    : `${key}::${template.preset.palette}::${template.preset.font}`);
  const design = parseDesignKey(activeDesignKey);
  const palette = invitationPalettes[design.palette] || invitationPalettes[template.preset.palette];
  const font = invitationFonts[design.font] || invitationFonts[template.preset.font];
  const layout = template.preset.layout;
  const usesPhotos = template.usesPhotos;
  const isInkTheme = key === "midnight-romance" || key === "celestial-ink" || key === "golden-art-deco";
  const sections = sectionOverride ?? parseInvitationSections(activeDesignKey);
  const media = resolveInvitationPhotos(invitation.assets, activeDesignKey, coverUrl, photoAssignments);
  const identity = getEventCategory(normalizeEventCategory(invitation.eventCategory));
  const couple = identity.nameMode === "couple";
  const names = couple
    ? [invitation.groomName, invitation.brideName].filter(Boolean).join(" & ")
    : identity.nameMode === "single"
      ? invitation.groomName || invitation.title
      : invitation.title;
  const groomParents = couple ? weddingParentLine(invitation.groomFatherName, invitation.groomMotherName, invitation.groomChildOrder, "putra", invitation.groomChildPosition) : "";
  const brideParents = couple ? weddingParentLine(invitation.brideFatherName, invitation.brideMotherName, invitation.brideChildOrder, "putri", invitation.brideChildPosition) : "";
  const eventTitle = invitation.title || names || "Perayaan";
  const date = displayDate(invitation.eventDate, invitation.timezone);
  const countdown = eventCountdown(invitation.eventDate, now);
  const maps = invitation.mapUrl && /^https?:\/\//i.test(invitation.mapUrl) ? invitation.mapUrl : null;
  const hasGift = Boolean(invitation.giftBankName?.trim() && invitation.giftAccountNumber?.trim());
  const music = resolveInvitationMusic(key, invitation.musicUrl, invitation.assets);
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

  const handleOpen = () => { musicRef.current?.playOnOpen(); setOpened(true); };

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

  const section = (keyName: keyof typeof headings, children: ReactNode, index: number) => {
    const left = key === "modern-maroon" || key === "golden-art-deco";
    const paper = key === "paper-cut-botanical";
    const celestial = key === "celestial-ink";
    const contrast = isInkTheme && index % 2 === 0;
    const backdrop = contrast ? (key === "golden-art-deco" ? "#191b17" : key === "celestial-ink" ? "#101b32" : "#080d20") : index % 2 ? "var(--inv-surface)" : "var(--inv-bg)";
    const color = contrast ? (key === "celestial-ink" ? "#c9e2f0" : "#e7cfa4") : "var(--inv-ink)";
    return (
      <section key={keyName} data-invitation-section={keyName} className={`relative overflow-hidden px-6 py-16 sm:px-9 ${left ? "text-left" : "text-center"} ${paper ? "rounded-t-[70px]" : ""}`}
        style={{ backgroundColor: backdrop, color }}
      >
        {key === "botanical-ivory" && <div aria-hidden className="pointer-events-none absolute -right-10 top-2 rotate-[-24deg] text-[#71826a]/20"><Leaf className="h-36 w-36" strokeWidth={0.6}/></div>}
        {key === "classic-pearl" && <div aria-hidden className="pointer-events-none absolute inset-3 border border-[#b4a88c]/35" />}
        {paper && <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full border-[35px] border-[#a6bb90]/50" />}
        {celestial && <div aria-hidden className="pointer-events-none absolute -left-12 -top-10 h-40 w-40 rounded-full border border-[#b5cce4]/35" />}
        {key === "golden-art-deco" && <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-16 w-16 -translate-x-1/2 rotate-45 border border-[#b69c5e]/35" />}
        <div className="relative">
          <p className="text-[10px] uppercase tracking-[0.23em]" style={{color:contrast ? "inherit" : "var(--inv-accent)"}}>{headings[keyName][0]}</p>
          <h2 className={`mt-3 text-2xl leading-snug ${left ? "uppercase tracking-[.04em]" : ""}`} style={{fontFamily:font.heading}}>{headings[keyName][1]}</h2>
          <div className={`my-6 flex items-center gap-2 ${left ? "" : "justify-center"}`}>
            <span className="h-px w-12 opacity-55" style={{ backgroundColor: contrast ? "currentColor" : "var(--inv-soft)" }} />
            {key === "celestial-ink" ? <Moon className="h-4 w-4" /> : key === "paper-cut-botanical" || key === "garden-light" || key === "botanical-ivory" ? <Leaf className="h-4 w-4" /> : key === "golden-art-deco" ? <Star className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            <span className="h-px w-12 opacity-55" style={{ backgroundColor: contrast ? "currentColor" : "var(--inv-soft)" }} />
          </div>
          {children}
        </div>
      </section>
    );
  };

  return (
    <main
      className={`relative isolate mx-auto min-h-[760px] w-full max-w-2xl overflow-hidden border border-[var(--inv-soft)] text-[var(--inv-ink)] ${panel}`}
      style={css}
    >
      <InvitationMusic ref={musicRef} source={music} opened={opened} preview={preview} />
      {!opened ? (
        <InvitationThemeScenes
          theme={key}
          names={names || eventTitle}
          date={date}
          cover={usesPhotos ? media.cover : undefined}
          focus={media.assignment.focus.cover}
          stage="envelope"
          onOpen={handleOpen}
          preview={preview}
        />
      ) : (
        <div>
          <InvitationThemeScenes
            theme={key}
            names={names || eventTitle}
            date={date}
            cover={usesPhotos ? media.cover : undefined}
            focus={media.assignment.focus.cover}
            stage="cover"
            onOpen={handleOpen}
            onEditPhoto={usesPhotos && preview ? () => onEditPhoto?.("cover") : undefined}
          />

          {section("greeting", <p className="mx-auto max-w-md text-sm leading-8 opacity-80">{invitation.description || "Dengan penuh sukacita, kami mengundang Anda untuk berbagi kebahagiaan bersama kami."}</p>, 1)}

          {section("identity", (
            <div className={`mx-auto max-w-lg gap-5 ${couple ? "grid grid-cols-2" : "flex flex-col items-center"}`}>
              {couple ? (
                <>
                  {([["personOne", invitation.groomName, media.personOne], ["personTwo", invitation.brideName, media.personTwo]] as const).map(([slot, name, url]) => (
                    <div key={slot} className="min-w-0">
                      {usesPhotos && <div className={`relative mx-auto overflow-hidden ${frame}`}>
                        {url ? <img src={url} alt={`Foto ${name || "mempelai"}`} loading="lazy" className="aspect-[3/4] w-full object-cover" style={{ objectPosition: `center ${media.assignment.focus[slot]}` }} /> : <div className="flex aspect-[3/4] items-center justify-center bg-black/5"><Heart className="h-8 w-8 opacity-40"/></div>}
                        {changePhoto(slot, name || "mempelai")}
                      </div>}
                      {!usesPhotos && <div aria-hidden className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-current/40 text-xl">{slot === "personOne" ? "✧" : "◇"}</div>}
                      <p className="mt-4 break-words text-base" style={{ fontFamily: font.heading }}>{name || "Nama belum diisi"}</p>
                      {(slot === "personOne" ? groomParents : brideParents) && <p className="mx-auto mt-2 max-w-[18rem] text-xs leading-5 opacity-75">{slot === "personOne" ? groomParents : brideParents}</p>}
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
            usesPhotos ? <>
              {preview && onEditPhoto && <button type="button" onClick={() => onEditPhoto("gallery")} className="mb-5 min-h-10 rounded-full border border-[var(--inv-soft)] px-5 text-xs text-[var(--inv-accent)]">Atur foto galeri</button>}
              {media.gallery.length ? (
                <div className={`grid gap-3 ${key === "modern-maroon" ? "grid-cols-3" : key === "midnight-romance" ? "grid-cols-2 rounded-t-[120px] overflow-hidden" : key === "eternal-blossom" ? "grid-cols-2 rotate-[-1deg]" : "grid-cols-2"}`}>
                  {media.gallery.map((asset, index) => (
                    <div key={asset.id} className={`relative overflow-hidden ${key === "modern-maroon" ? "rounded-none" : key === "midnight-romance" ? "rounded-t-full rounded-b-lg" : key === "eternal-blossom" ? "rounded-t-full rounded-b-3xl" : "rounded-[35%_35%_12px_12px]"} ${index === 0 && key !== "modern-maroon" ? "col-span-2" : ""}`}>
                      <img src={asset.url} alt={`Galeri foto ${index + 1}`} loading="lazy" className={index === 0 ? "aspect-[4/3] w-full object-cover" : "aspect-[3/4] w-full object-cover"} />
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm opacity-65">Belum ada foto galeri.</p>}
            </> : (
              <div className="relative mx-auto flex min-h-48 max-w-xs flex-col items-center justify-center border border-current/25 px-6 py-10">
                <div aria-hidden className="mb-5 flex items-center gap-4 text-3xl opacity-60">{key === "celestial-ink" ? "✧ ✦ ☾" : key === "golden-art-deco" ? "◇ ◆ ◇" : key === "paper-cut-botanical" ? "❧ ❦ ❧" : "✦ ❖ ✦"}</div>
                <p className="text-sm leading-7 opacity-75">Kenangan indah hadir dalam setiap momen yang kita rayakan bersama.</p>
              </div>
            )
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
          ) : <RsvpForm slug={invitation.slug} guestId={personalGuest?.id} guestName={personalGuest?.name} guestToken={personalGuest?.token} invitedPax={personalGuest?.invitedPax} eventDate={invitation.eventDate} venue={invitation.venue} title={eventTitle} start={invitation.ceremonyTime} description={invitation.description} />, 8)}

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
            <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--inv-accent)]">Created with DC Organizer</p>
          </footer>
        </div>
      )}
    </main>
  );
}
