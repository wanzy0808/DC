"use client";

import { displayTitleCase } from "@/lib/text/display-title-case";
import { getInvitationCountdown } from "@/lib/invitations/countdown";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronDown, Gift, Heart, MapPin } from "lucide-react";
import RsvpForm from "@/components/InvitationStudio/RsvpForm";
import GuestWishes from "@/components/PublicInvitation/GuestWishes";
import type { PersonalRsvpGuest } from "@/components/InvitationStudio/rsvp-types";
import InvitationMusic, { type InvitationMusicHandle } from "@/components/PublicInvitation/InvitationMusic";
import OurStorySection from "@/components/PublicInvitation/OurStorySection";
import InvitationAssetLayers from "@/components/PublicInvitation/InvitationAssetLayers";
import { parseAssetLayers, type InvitationAssetLayer, type StudioObjectSection } from "@/lib/templates/asset-layers";
import { resolveInvitationMusic } from "@/lib/templates/music";
import { parseDesignKey } from "@/lib/templates/design";
import { resolveEditableCopy } from "@/lib/templates/editable-copy";
import { weddingParentLine } from "@/lib/events/parents";
import { resolveInvitationPhotos, type PhotoAssignments, type PhotoSlot } from "@/lib/templates/photo-slots";
import { parseInvitationSections, type InvitationSectionKey, type InvitationSections } from "@/lib/templates/sections";
import { invitationSectionStyleCss, parseInvitationSectionStyles } from "@/lib/templates/section-styles";
import { parseInvitationRsvpConfig, rsvpElementStyleCss } from "@/lib/templates/rsvp-config";
import { parseSectionElementStyles, sectionElementStyleCss } from "@/lib/templates/section-element-styles";
import { instancesForSection, parseInvitationSectionLayout } from "@/lib/templates/section-layout";
import EditableSectionInstance, { type SectionInstanceEditorActions } from "@/components/PublicInvitation/EditableSectionInstance";
import { useInvitationSectionAnimations } from "@/components/PublicInvitation/use-section-animations";

export const romanticRoseManifest = {
  key: "romantic-rose",
  name: "Romantic Rose",
  categories: ["WEDDING"],
  sections: ["cover", "greeting", "identity", "event", "dateTime", "gallery", "countdown", "location", "rsvp", "wishes", "gift", "closing", "footer"],
  defaultOrder: ["cover", "greeting", "identity", "event", "dateTime", "gallery", "countdown", "location", "rsvp", "wishes", "gift", "closing", "footer"],
  optional: ["gallery", "rsvp", "wishes", "gift"],
  customization: { photos: true, cover: true, music: true, sections: ["rsvp", "wishes", "gift"], palette: false, fonts: false, order: false },
  animation: { envelope: true, respectReducedMotion: true },
  assets: { photos: "invitation.assets", fonts: ["Cinzel", "Fauna One"] },
  preview: { shortNames: true, longNames: true, withoutPhoto: true, manyPhotos: true, optionalSections: true },
} as const;

type RoseInvitation = {
  slug: string;
  title: string;
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
  musicUrl?: string | null;
  weddingHashtag?: string | null;
  dressCode?: string | null;
  giftBankName?: string | null;
  giftAccountName?: string | null;
  giftAccountNumber?: string | null;
  assets: { id: string; type: "IMAGE" | "AUDIO"; url: string; title: string | null }[];
};

function readableDate(value: Date | string, timezone: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Tanggal belum ditentukan";
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: timezone }).format(date);
}

function RoseHeading({ eyebrow, children, studioElement, style }: { eyebrow: string; children: React.ReactNode; studioElement?: string; style?: React.CSSProperties }) {
  return (
    <div className="mb-7 text-center">
      <p className="mb-3 text-[10px] uppercase tracking-[0.32em] text-[#ad6b7e]">{eyebrow}</p>
      <h2 data-studio-rsvp-element={studioElement} style={style} className="font-[family-name:var(--font-dc-heading)] text-2xl leading-snug text-[#613044] sm:text-3xl">{children}</h2>
      <span className="mx-auto mt-4 block h-px w-16 bg-[#d8a7b3]" />
    </div>
  );
}

function RosePhoto({ url, alt, className, focus = "center" }: { url?: string; alt: string; className: string; focus?: "top" | "center" | "bottom" }) {
  return url ? (
    <img src={url} alt={alt} className={className} style={{ objectPosition: `center ${focus}` }} loading="lazy" />
  ) : (
    <div role="img" aria-label={alt} className={className + " flex items-center justify-center bg-gradient-to-br from-[#f6dbe1] via-[#fdf7f4] to-[#deb4c1]"}>
      <Heart className="h-10 w-10 text-[#c58a9c]/70" strokeWidth={1} />
    </div>
  );
}

/**
 * One shared presentation template; invitation/event/asset data stays per invitation.
 * Preview uses the same section visibility as the public renderer.
 * Shared GuestWishes reads/writes only on a published invitation; previews never submit.
 */
export default function RomanticRoseTemplate({
  invitation,
  designKey,
  preview = false,
  sections: sectionOverride,
  coverUrl,
  photoAssignments,
  onEditPhoto,
  onEnvelopeOpened,
  selectedAssetLayerId,
  onSelectAssetLayer,
  onMoveAssetLayer,
  onUpdateAssetLayer,
  selectedSectionInstanceId,
  onSelectSectionInstance,
  onMoveSectionInstance,
  onToggleSectionInstance,
  onDuplicateSectionInstance,
  onDeleteSectionInstance,
  personalGuest,
}: {
  invitation: RoseInvitation;
  /** Studio override; the public renderer reads the saved design key. */
  designKey?: string;
  personalGuest?: PersonalRsvpGuest;
  preview?: boolean;
  sections?: InvitationSections;
  coverUrl?: string;
  photoAssignments?: PhotoAssignments;
  onEditPhoto?: (slot: PhotoSlot) => void;
  /** Studio canvas only: synchronize the active stage after opening. */
  onEnvelopeOpened?: () => void;
  selectedAssetLayerId?: string | null;
  onSelectAssetLayer?: (id: string) => void;
  onMoveAssetLayer?: (id: string, x: number, y: number) => void;
  onUpdateAssetLayer?: (id: string, patch: Partial<InvitationAssetLayer>) => void;
  selectedSectionInstanceId?: string | null;
  onSelectSectionInstance?: (id: string, key: InvitationSectionKey) => void;
  onMoveSectionInstance?: (id: string, direction: -1 | 1) => void;
  onToggleSectionInstance?: (id: string) => void;
  onDuplicateSectionInstance?: (id: string) => void;
  onDeleteSectionInstance?: (id: string) => void;
}) {
  const [opened, setOpened] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const musicRef = useRef<InvitationMusicHandle>(null);
  const [now, setNow] = useState<number | null>(null);
  const sections = sectionOverride ?? parseInvitationSections(invitation.templateKey);
  const activeDesignKey = designKey || invitation.templateKey;
  const sectionStyles = useMemo(() => parseInvitationSectionStyles(activeDesignKey), [activeDesignKey]);
  useInvitationSectionAnimations(rootRef, sectionStyles);
  const rsvpConfig = parseInvitationRsvpConfig(activeDesignKey);
  const sectionElementStyles = parseSectionElementStyles(activeDesignKey);
  const sectionLayout = parseInvitationSectionLayout(activeDesignKey);
  const sectionEditorActions: SectionInstanceEditorActions | undefined = preview ? {
    selectedId: selectedSectionInstanceId,
    onSelect: onSelectSectionInstance,
    onMove: onMoveSectionInstance,
    onToggle: onToggleSectionInstance,
    onDuplicate: onDuplicateSectionInstance,
    onDelete: onDeleteSectionInstance,
  } : undefined;
  const editableCopy = resolveEditableCopy(designKey || invitation.templateKey, "romantic-rose", invitation.description);
  const illustrationLayers = parseAssetLayers(designKey || invitation.templateKey);
  const configuredCover = coverUrl ?? parseDesignKey(invitation.templateKey).decor ?? undefined;
  const media = resolveInvitationPhotos(invitation.assets, invitation.templateKey, configuredCover, photoAssignments);
  const { cover, gallery, assignment } = media;
  const groomPhoto = media.personOne;
  const bridePhoto = media.personTwo;
  const editPhoto = (slot: PhotoSlot, label: string) =>
    preview && onEditPhoto ? (
      <button
        type="button"
        onClick={() => onEditPhoto(slot)}
        className="absolute inset-0 z-20 flex items-end justify-center bg-transparent pb-2 text-[11px] font-semibold text-transparent transition hover:bg-black/20 hover:text-white focus-visible:bg-black/25 focus-visible:text-white focus-visible:outline-2 focus-visible:outline-primary"
        aria-label={`Ganti foto ${label}`}
      >
        Ganti foto
      </button>
    ) : null;
  const displayName = [displayTitleCase(invitation.groomName), displayTitleCase(invitation.brideName)].filter(Boolean).join(" & ");
  const groomParents = weddingParentLine(invitation.groomFatherName, invitation.groomMotherName, invitation.groomChildOrder, "putra", invitation.groomChildPosition);
  const brideParents = weddingParentLine(invitation.brideFatherName, invitation.brideMotherName, invitation.brideChildOrder, "putri", invitation.brideChildPosition);
  const eventDate = readableDate(invitation.eventDate, invitation.timezone || "Asia/Jakarta");
  const countdown = getInvitationCountdown(invitation.eventDate, now ?? 0);
  const music = resolveInvitationMusic(invitation.templateKey, invitation.musicUrl, invitation.assets);
  const hasGift = Boolean(invitation.giftBankName && invitation.giftAccountNumber);
  const handleOpen = () => {
    musicRef.current?.playOnOpen();
    setOpened(true);
    onEnvelopeOpened?.();
  };
  const scrollHint = <ChevronDown className="mx-auto mt-8 h-5 w-5 animate-bounce text-[#b77f90] motion-reduce:animate-none" aria-hidden />;

  useEffect(() => {
    if (!opened && sections.envelope !== false) return;
    setNow(Date.now());
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [opened, sections.envelope]);

  const objectOverlay = (target: StudioObjectSection) => <InvitationAssetLayers layers={illustrationLayers} section={target}
    editable={preview && Boolean(onUpdateAssetLayer)} selectedId={selectedAssetLayerId} onSelect={onSelectAssetLayer} onUpdate={onUpdateAssetLayer} />;

  const renderSectionInstances = (key: InvitationSectionKey, render: () => React.ReactNode) => {
    const hidden = sections[key] === false;
    if (hidden && !preview) return null;
    return instancesForSection(sectionLayout, key).map((instance) => (
      <EditableSectionInstance
        key={instance.id}
        instance={instance}
        order={instance.order}
        total={sectionLayout.length}
        preview={preview}
        hidden={hidden}
        actions={sectionEditorActions}
      >
        {render()}
      </EditableSectionInstance>
    ));
  };

  return (
    <main ref={rootRef} data-studio-preview-root={preview ? "true" : undefined} className={`relative isolate min-h-[760px] ${preview ? "overflow-visible" : "overflow-hidden"} bg-[#fff9f7] text-[#583844] [font-family:var(--font-dc-body)]`}>
      {sections.music !== false && <InvitationMusic ref={musicRef} source={music} opened={opened || sections.envelope === false} preview={preview} />}
      {!opened && sections.envelope !== false ? (
        <section data-invitation-section="envelope" style={invitationSectionStyleCss(sectionStyles.envelope)} className="relative relative flex min-h-[760px] flex-col items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_40%,#fffefb_0%,#f7e2e6_55%,#eac8d2_100%)] px-6 py-16 text-center">
            {objectOverlay("envelope")}
          <div className="pointer-events-none absolute -left-20 top-10 h-56 w-56 rounded-full border border-white/60" />
          <div className="pointer-events-none absolute -right-20 bottom-10 h-64 w-64 rounded-full border border-white/70" />
          <p className="mb-7 text-[10px] uppercase tracking-[0.3em] text-[#8e586d]">The wedding invitation</p>
          <div className="relative w-full max-w-[300px] drop-shadow-[0_24px_40px_rgba(119,56,80,0.21)]">
            <div className="absolute inset-x-0 top-0 h-1/2 origin-top [clip-path:polygon(0_0,100%_0,50%_100%)] bg-[#d8a0b0] shadow-xl" />
            <div className="relative mt-2 flex min-h-[345px] flex-col items-center justify-center border border-[#dbadba] bg-[#fffdfb] p-5 shadow-[inset_0_0_0_7px_#f9e9ed]">
              <p className="text-[10px] uppercase tracking-[0.24em] text-[#ad7889]">Untuk yang terkasih</p>
              <span className="my-6 grid h-12 w-12 place-items-center rounded-full border border-[#d9a7b4] text-[#a76b80]"><Heart className="h-5 w-5" /></span>
              <h1 className="break-words font-[family-name:var(--font-dc-heading)] text-2xl leading-relaxed text-[#713b50]">{displayName || "Undangan Pernikahan"}</h1>
              <p className="mt-5 text-xs text-[#966a7c]">{eventDate}</p>
            </div>
            <div className="relative -mt-9 h-24 bg-[#edc6d0] [clip-path:polygon(0_0,50%_55%,100%_0,100%_100%,0_100%)]" aria-hidden />
            <span className="absolute bottom-6 left-1/2 grid h-12 w-12 -translate-x-1/2 place-items-center rounded-full border-4 border-[#edc6d0] bg-[#b7798d] text-white shadow-md"><Heart className="h-5 w-5" fill="currentColor" /></span>
          </div>
          <p className="mt-8 text-xs leading-6 text-[#815768]">Dengan hangat kami mengundang Anda<br />untuk merayakan hari istimewa kami.</p>
          <button type="button" onClick={handleOpen} className="mt-7 min-h-11 rounded-full bg-[#a65e69] px-8 py-3 text-sm font-medium text-white shadow-lg transition hover:bg-[#8e4d5d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a65e69]">
            Buka Undangan
          </button>
          {preview && <p className="mt-4 text-[11px] text-[#8e586d]">Preview · foto dan isi mengikuti undangan ini</p>}
        </section>
      ) : (
        <div className="mx-auto flex max-w-2xl flex-col">
          {renderSectionInstances("cover", () => (
            <section data-invitation-section="cover" style={invitationSectionStyleCss(sectionStyles.cover)} className="relative flex min-h-[680px] flex-col items-center justify-center overflow-hidden bg-[#f8eaec] px-7 pb-16 pt-14 text-center">
                        <div className="absolute inset-0 opacity-30"><RosePhoto url={cover} alt="" focus={assignment.focus.cover} className="h-full w-full object-cover" /></div>
                        <div className="absolute inset-0 bg-gradient-to-b from-[#fff9f7]/85 via-[#fff9f7]/65 to-[#f8eaec]" />
                        <div className="relative z-10 flex w-full flex-col items-center">
                          <p className="text-[10px] uppercase tracking-[0.3em] text-[#835064]">The wedding of</p>
                          <h1 className="mt-5 max-w-full break-words font-[family-name:var(--font-dc-heading)] text-3xl leading-relaxed text-[#66394b] sm:text-5xl">{displayName || displayTitleCase(invitation.title)}</h1>
                          <div className="relative mt-9 w-[min(74vw,280px)] overflow-hidden rounded-t-[145px] rounded-b-xl border-[7px] border-white bg-white shadow-[0_20px_45px_rgba(121,67,84,0.22)]">
                            <RosePhoto url={cover} alt="Foto sampul pasangan" focus={assignment.focus.cover} className="aspect-[3/4] w-full object-cover" />
                            {editPhoto("cover", "cover utama")}
                          </div>
                          <p className="mt-8 text-sm tracking-[0.1em] text-[#754b5f]">{eventDate}</p>
                          {scrollHint}
                        </div>
                        {objectOverlay("cover")}
                      </section>
          ))}

          {renderSectionInstances("greeting", () => (
            <section data-invitation-section="greeting" style={invitationSectionStyleCss(sectionStyles.greeting)} className="relative bg-[#fffaf8] px-8 py-20 text-center">
                        {objectOverlay("greeting")}
                        <RoseHeading eyebrow="A warm invitation">Dengan penuh sukacita</RoseHeading>
                        <p data-studio-copy-field="greeting" className="mx-auto max-w-md whitespace-pre-line text-sm leading-8 text-[#765460]">{editableCopy.greeting}</p>
                      </section>
          ))}

          {renderSectionInstances("identity", () => (
            <section data-invitation-section="identity" style={invitationSectionStyleCss(sectionStyles.identity)} className="relative bg-[#f8eef0] px-7 py-20">
                        {objectOverlay("identity")}
                        <RoseHeading eyebrow="The two of us">Mempelai</RoseHeading>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="min-w-0 text-center">
                            <div className="relative overflow-hidden rounded-t-full rounded-b-xl">
                              <RosePhoto url={groomPhoto} alt="Foto mempelai pertama" focus={assignment.focus.personOne} className="mx-auto aspect-[3/4] w-full object-cover shadow-lg" />
                              {editPhoto("personOne", "mempelai pertama")}
                            </div>
                            <h3 className="mt-5 break-words font-[family-name:var(--font-dc-heading)] text-base leading-relaxed text-[#713b50]">{displayTitleCase(invitation.groomName) || "Mempelai pertama"}</h3>
                            {groomParents && <p className="mx-auto mt-2 max-w-[12rem] text-xs leading-5 text-[#765460]">{groomParents}</p>}
                          </div>
                          <div className="min-w-0 text-center">
                            <div className="relative overflow-hidden rounded-t-full rounded-b-xl">
                              <RosePhoto url={bridePhoto} alt="Foto mempelai kedua" focus={assignment.focus.personTwo} className="mx-auto aspect-[3/4] w-full object-cover shadow-lg" />
                              {editPhoto("personTwo", "mempelai kedua")}
                            </div>
                            <h3 className="mt-5 break-words font-[family-name:var(--font-dc-heading)] text-base leading-relaxed text-[#713b50]">{displayTitleCase(invitation.brideName) || "Mempelai kedua"}</h3>
                            {brideParents && <p className="mx-auto mt-2 max-w-[12rem] text-xs leading-5 text-[#765460]">{brideParents}</p>}
                          </div>
                        </div>
                      </section>
          ))}



          {sections.identity !== false && <div style={{ order: Math.max(0, sectionLayout.findIndex((item) => item.key === "identity")) + 0.1 }}><OurStorySection story={editableCopy.ourStory} theme="romantic-rose" preview={preview} /></div>}

          {renderSectionInstances("event", () => (
            <section data-invitation-section="event" style={invitationSectionStyleCss(sectionStyles.event)} className="relative bg-[#fffaf8] px-8 py-20 text-center">
                        {objectOverlay("event")}
                        <RoseHeading eyebrow="Save the date">Detail Acara</RoseHeading>
                        <p className="text-sm leading-7 text-[#765460]">{displayTitleCase(invitation.title) || "Perayaan Pernikahan"}</p>
                        <p className="mt-3 text-lg text-[#66394b]">{invitation.venue || "Lokasi belum ditentukan"}</p>
                        {invitation.dressCode && <p className="mt-4 text-sm text-[#765460]">Dress code · {invitation.dressCode}</p>}
                      </section>
          ))}

          {renderSectionInstances("dateTime", () => (
            <section data-invitation-section="dateTime" style={invitationSectionStyleCss(sectionStyles.dateTime)} className="relative bg-[#f8eef0] px-8 py-20 text-center">
                        {objectOverlay("dateTime")}
                        <RoseHeading eyebrow="A day to remember">Tanggal & Waktu</RoseHeading>
                        <div className="mx-auto flex max-w-sm flex-col items-center gap-3 rounded-3xl border border-[#e7cbd3] bg-white/70 px-6 py-9">
                          <CalendarDays className="h-6 w-6 text-[#a65e69]" />
                          <p className="font-[family-name:var(--font-dc-heading)] text-xl">{eventDate}</p>
                          {invitation.ceremonyTime && <p className="text-sm">Mulai: {invitation.ceremonyTime}</p>}
                          {invitation.receptionTime && <p className="text-sm">Selesai: {invitation.receptionTime === "END" ? "- end" : invitation.receptionTime}</p>}
                          <p className="text-xs text-[#916f7a]">{invitation.timezone || "Asia/Jakarta"}</p>
                        </div>
                      </section>
          ))}

          {renderSectionInstances("gallery", () => (
            <section data-invitation-section="gallery" style={invitationSectionStyleCss(sectionStyles.gallery)} className="relative bg-[#fffaf8] px-6 py-20">
                        {objectOverlay("gallery")}
                          <RoseHeading eyebrow="Our memories">Galeri Foto</RoseHeading>
                          {preview && onEditPhoto && <button type="button" onClick={() => onEditPhoto("gallery")} className="mb-5 w-full rounded-full border border-[#dab0be] py-2 text-xs font-medium text-[#a65e69]">Atur foto galeri</button>}
                          {gallery.length ? <div className="grid grid-cols-2 gap-3">
                            {gallery.map((photo, index) => (
                              <div key={photo.id} className={index === 0 ? "col-span-2 overflow-hidden rounded-2xl" : "overflow-hidden rounded-2xl"}>
                                <RosePhoto url={photo.url} alt={"Foto pasangan " + (index + 1)} className={index === 0 ? "aspect-[4/3] w-full object-cover" : "aspect-[3/4] w-full object-cover"} />
                              </div>
                            ))}
                          </div> : <p className="text-sm text-[#906978]">Belum ada foto galeri.</p>}
                        </section>
          ))}

          {renderSectionInstances("countdown", () => (
            <section data-invitation-section="countdown" style={invitationSectionStyleCss(sectionStyles.countdown)} className="relative bg-[#f8eef0] px-8 py-20 text-center">
                        {objectOverlay("countdown")}
                        <RoseHeading eyebrow="Counting the moments">Menuju Hari Bahagia</RoseHeading>
                        {now !== null && countdown ? (
                          <div className="grid grid-cols-4 gap-2">
                            {([["Hari", countdown.days], ["Jam", countdown.hours], ["Menit", countdown.minutes], ["Detik", countdown.seconds]] as const).map(([label, value]) => (
                              <div key={label} className="rounded-xl border border-[#e8cbd3] bg-white/85 p-2">
                                <p className="font-[family-name:var(--font-dc-heading)] text-xl text-[#7b465a]">{String(value).padStart(2, "0")}</p>
                                <p className="mt-1 text-[10px] text-[#906978]">{label}</p>
                              </div>
                            ))}
                          </div>
                        ) : <p className="text-sm text-[#906978]">Tanggal acara belum tersedia.</p>}
                      </section>
          ))}

          {renderSectionInstances("location", () => (
            <section data-invitation-section="location" style={invitationSectionStyleCss(sectionStyles.location)} className="relative bg-[#fffaf8] px-8 py-20 text-center">
                        {objectOverlay("location")}
                        <RoseHeading eyebrow="Find your way">Lokasi</RoseHeading>
                        <MapPin className="mx-auto mb-3 h-6 w-6 text-[#a65e69]" />
                        <h3 className="text-lg text-[#66394b]">{invitation.venue || "Lokasi belum ditentukan"}</h3>
                        {invitation.address && <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#765460]">{invitation.address}</p>}
                        {invitation.mapUrl && (
                          <a data-studio-section-element="location:button" style={sectionElementStyleCss(sectionElementStyles, "location", "button")} href={invitation.mapUrl} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-[var(--dc-control-radius)] bg-[#a65e69] px-6 py-3 text-sm text-white hover:bg-[#8e4d5d]">
                            <MapPin className="h-4 w-4" /> Buka Google Maps
                          </a>
                        )}
                      </section>
          ))}

          {renderSectionInstances("rsvp", () => (
            <section data-invitation-section="rsvp" style={invitationSectionStyleCss(sectionStyles.rsvp)} className="relative bg-[#f8eef0] px-5 py-20">
                        {objectOverlay("rsvp")}
                          <RoseHeading eyebrow="Your presence means so much" studioElement="title" style={rsvpElementStyleCss(rsvpConfig, "title")}>{rsvpConfig.title || "Konfirmasi Kehadiran"}</RoseHeading>
                          <RsvpForm slug={invitation.slug} preview={preview} eventCategory="WEDDING" rsvpConfig={rsvpConfig} guestId={personalGuest?.id} guestName={personalGuest?.name} guestToken={personalGuest?.token} invitedPax={personalGuest?.invitedPax} eventDate={invitation.eventDate} venue={invitation.venue} title={displayTitleCase(invitation.title) || displayName} start={invitation.ceremonyTime} description={invitation.description} />
                        </section>
          ))}

          {renderSectionInstances("wishes", () => (
            <section data-invitation-section="wishes" style={invitationSectionStyleCss(sectionStyles.wishes)} className="relative bg-[#fffaf8] px-7 py-20 text-center">
                        {objectOverlay("wishes")}
                          <RoseHeading eyebrow="A little note of love">Ucapan & Doa</RoseHeading>
                          <GuestWishes slug={invitation.slug} preview={preview} appearance="rose" initialName={personalGuest?.name} inputStyle={sectionElementStyleCss(sectionElementStyles, "wishes", "input")} buttonStyle={sectionElementStyleCss(sectionElementStyles, "wishes", "button")} />
                        </section>
          ))}

          {renderSectionInstances("gift", () => (
            <section data-invitation-section="gift" style={invitationSectionStyleCss(sectionStyles.gift)} className="relative bg-[#f8eef0] px-7 py-20 text-center">
                        {objectOverlay("gift")}
                          <RoseHeading eyebrow="With gratitude">Tanda Kasih</RoseHeading>
                          <Gift className="mx-auto h-6 w-6 text-[#a65e69]" />
                          {hasGift ? <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-[#e8cbd3] bg-white/85 p-6">
                            <p className="text-sm text-[#916f7a]">{invitation.giftBankName}</p>
                            <p className="mt-2 text-sm font-semibold">{invitation.giftAccountName}</p>
                            <p className="mt-2 break-all font-[family-name:var(--font-dc-heading)] text-lg">{invitation.giftAccountNumber}</p>
                            {invitation.giftAccountNumber && <button data-studio-section-element="gift:button" style={sectionElementStyleCss(sectionElementStyles, "gift", "button")} type="button" onClick={() => navigator.clipboard?.writeText(invitation.giftAccountNumber || "")} className="mt-5 min-h-10 rounded-[var(--dc-control-radius)] border border-[#d5a6b4] px-5 py-2 text-xs text-[#7b465a] hover:bg-[#f8eaec]">Salin nomor rekening</button>}
                          </div> : <p className="mt-5 text-sm text-[#906978]">Informasi tanda kasih belum ditambahkan.</p>}
                        </section>
          ))}

          {renderSectionInstances("closing", () => (
            <section data-invitation-section="closing" style={invitationSectionStyleCss(sectionStyles.closing)} className="relative bg-[#fffaf8] px-8 py-20 text-center">
                        {objectOverlay("closing")}
                        <Heart className="mx-auto h-7 w-7 text-[#bf8496]" />
                        <RoseHeading eyebrow="Forever begins here">Terima Kasih</RoseHeading>
                        <p data-studio-copy-field="closing" className="mx-auto max-w-sm whitespace-pre-line text-sm leading-8 text-[#765460]">{editableCopy.closing}</p>
                        <p className="mt-8 break-words font-[family-name:var(--font-dc-heading)] text-xl text-[#713b50]">{displayName}</p>
                        {invitation.weddingHashtag && <p className="mt-4 text-sm text-[#765460]">{invitation.weddingHashtag}</p>}
                      </section>
          ))}

          {renderSectionInstances("footer", () => (
            <footer data-invitation-section="footer" style={invitationSectionStyleCss(sectionStyles.footer)} className="relative flex items-center justify-center border-t border-[#e7cbd3] bg-[#f8eef0] px-6 py-5">
                        {objectOverlay("footer")}
                        <span aria-hidden="true" className="h-px w-10 bg-[#bf8496] opacity-50" />
                      </footer>
          ))}


        </div>
      )}
    </main>
  );
}
