"use client";

import { displayTitleCase } from "@/lib/text/display-title-case";
import { getInvitationCountdown } from "@/lib/invitations/countdown";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { CalendarDays, Gift, Heart, Leaf, MapPin, Moon, Sparkles, Star } from "lucide-react";
import "./zen-atelier.css";
import "./pencil-reverie.css";
import InvitationThemeScenes from "@/components/PublicInvitation/InvitationThemeScenes";
import RsvpForm from "@/components/InvitationStudio/RsvpForm";
import GuestWishes from "@/components/PublicInvitation/GuestWishes";
import type { PersonalRsvpGuest } from "@/components/InvitationStudio/rsvp-types";
import { readableInk, invitationFontFamily } from "@/lib/templates/presentation";
import InvitationFonts from "@/components/PublicInvitation/InvitationFonts";
import OurStorySection from "@/components/PublicInvitation/OurStorySection";
import InvitationAssetLayers from "@/components/PublicInvitation/InvitationAssetLayers";
import { parseAssetLayers, type InvitationAssetLayer, type StudioObjectSection } from "@/lib/templates/asset-layers";
import InvitationMusic, { type InvitationMusicHandle } from "@/components/PublicInvitation/InvitationMusic";
import { resolveInvitationMusic } from "@/lib/templates/music";
import { getEventCategory, normalizeEventCategory } from "@/lib/events/catalog";
import { weddingParentLine } from "@/lib/events/parents";
import { invitationFonts, invitationPalettes, parseDesignKey } from "@/lib/templates/design";
import { resolveEditableCopy } from "@/lib/templates/editable-copy";
import { getInvitationTemplate } from "@/lib/templates/catalog";
import { photoCropStyle, resolveInvitationPhotos, resolvePhotoCrop, type CroppablePhotoSlot, type PhotoAssignments, type PhotoCrop, type PhotoSlot } from "@/lib/templates/photo-slots";
import { parseInvitationSections, type InvitationSectionKey, type InvitationSections } from "@/lib/templates/sections";
import { invitationSectionStyleCss, parseInvitationSectionStyles } from "@/lib/templates/section-styles";
import { parseInvitationRsvpConfig, rsvpElementStyleCss } from "@/lib/templates/rsvp-config";
import { parseSectionElementStyles, sectionElementStyleCss } from "@/lib/templates/section-element-styles";
import { instancesForSection, parseInvitationSectionLayout } from "@/lib/templates/section-layout";
import EditableSectionInstance, { type SectionInstanceEditorActions } from "@/components/PublicInvitation/EditableSectionInstance";
import { useInvitationSectionAnimations } from "@/components/PublicInvitation/use-section-animations";
import { useInvitationPhotoAnimations } from "@/components/PublicInvitation/use-photo-animations";
import StudioPhotoCropOverlay from "@/components/InvitationStudio/StudioPhotoCropOverlay";

const PencilSectionArt = dynamic(() => import("@/components/PublicInvitation/PencilReverieArtwork").then((module) => module.PencilSectionArt));
const PencilMemoryGallery = dynamic(() => import("@/components/PublicInvitation/PencilReverieArtwork").then((module) => module.PencilMemoryGallery));
const PencilBackwardClock = dynamic(() => import("@/components/PublicInvitation/PencilReverieArtwork").then((module) => module.PencilBackwardClock));
const ZenAtelierGallery = dynamic(() => import("@/components/PublicInvitation/ZenAtelierGallery"));
const ZenSectionArtwork = dynamic(() => import("@/components/PublicInvitation/ZenAtelierArtwork").then((module) => module.ZenSectionArtwork));
const ZenMemoryArtwork = dynamic(() => import("@/components/PublicInvitation/ZenAtelierArtwork").then((module) => module.ZenMemoryArtwork));

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

const zenHeadings: Record<keyof typeof headings, string> = {
  cover: "Sampul",
  greeting: "Sebuah Cerita",
  identity: "Tentang Kami",
  event: "Detail Acara",
  dateTime: "Tanggal & Waktu",
  gallery: "Galeri Foto",
  countdown: "Hitung Mundur",
  location: "Lokasi Acara",
  rsvp: "Konfirmasi Kehadiran",
  wishes: "Ucapan & Doa",
  gift: "Kirim Hadiah",
  closing: "Terima Kasih",
};

function displayDate(value: Date | string, timezone: string, numeric = false) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Tanggal belum ditentukan";
  try {
    return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: numeric ? "2-digit" : "long", year: "numeric", timeZone: timezone || "Asia/Jakarta" }).format(date).replaceAll("/", " · ");
  } catch {
    return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: numeric ? "2-digit" : "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(date).replaceAll("/", " · ");
  }
}

function eventCountdown(value: Date | string, now: number | null) {
  if (now === null) return null;
  const remaining = getInvitationCountdown(value, now);
  if (!remaining) return null;
  return [
    ["Hari", remaining.days],
    ["Jam", remaining.hours],
    ["Menit", remaining.minutes],
    ["Detik", remaining.seconds],
  ] as const;
}

/** One shared feature engine for individually art-directed non-Romantic Rose themes.
 * Section logic, media ownership and RSVP are shared; themed envelope, cover and section art remain template-owned.
 */
export default function UniversalInvitationTemplate({
  invitation,
  preview = false,
  sections: sectionOverride,
  photoAssignments,
  activeCropSlot,
  onCropPhoto,
  onFinishCrop,
  coverUrl,
  onEditPhoto,
  onEnvelopeOpened,
  selectedAssetLayerId,
  selectedAssetLayerIds,
  onSelectAssetLayer,
  onMoveAssetLayer,
  onUpdateAssetLayer,
  selectedSectionInstanceId,
  onSelectSectionInstance,
  onMoveSectionInstance,
  onToggleSectionInstance,
  onDuplicateSectionInstance,
  onDeleteSectionInstance,
  templateKey,
  designKey,
  personalGuest,
}: {
  invitation: InvitationData;
  personalGuest?: PersonalRsvpGuest;
  preview?: boolean;
  sections?: InvitationSections;
  photoAssignments?: PhotoAssignments;
  activeCropSlot?: CroppablePhotoSlot | null;
  onCropPhoto?: (slot: CroppablePhotoSlot, crop: PhotoCrop) => void;
  onFinishCrop?: () => void;
  coverUrl?: string;
  onEditPhoto?: (slot: PhotoSlot) => void;
  /** Optional Studio-only callback; fires after the envelope has finished opening. */
  onEnvelopeOpened?: () => void;
  selectedAssetLayerId?: string | null;
  selectedAssetLayerIds?: string[];
  onSelectAssetLayer?: (id: string, additive?: boolean) => void;
  onMoveAssetLayer?: (id: string, x: number, y: number) => void;
  onUpdateAssetLayer?: (id: string, patch: Partial<InvitationAssetLayer>) => void;
  selectedSectionInstanceId?: string | null;
  onSelectSectionInstance?: (id: string, key: InvitationSectionKey) => void;
  onMoveSectionInstance?: (id: string, direction: -1 | 1) => void;
  onToggleSectionInstance?: (id: string) => void;
  onDuplicateSectionInstance?: (id: string) => void;
  onDeleteSectionInstance?: (id: string) => void;
  templateKey?: string;
  designKey?: string;
}) {
  const [opened, setOpened] = useState(false);
  const [opening, setOpening] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const [copyMessage, setCopyMessage] = useState("");
  const musicRef = useRef<InvitationMusicHandle>(null);
  const [now, setNow] = useState<number | null>(null);
  const key = templateKey || parseDesignKey(invitation.templateKey).template;
  const template = getInvitationTemplate(key);
  // A bare theme key is used by public demo cards and legacy saved records.
  // Resolve its actual theme preset instead of unintentionally using global rose/Cinzel defaults.
  const activeDesignKey = designKey || (parseDesignKey(invitation.templateKey).template === key && invitation.templateKey.includes("::")
    ? invitation.templateKey
    : `${key}::${template.preset.palette}::${template.preset.font}`);
  const design = parseDesignKey(activeDesignKey);
  const editableCopy = resolveEditableCopy(activeDesignKey, key, invitation.description);
  const illustrationLayers = parseAssetLayers(activeDesignKey);
  const palette = invitationPalettes[design.palette] || invitationPalettes[template.preset.palette];
  const font = invitationFonts[design.font] || invitationFonts[template.preset.font];
  const layout = template.preset.layout;
  const usesPhotos = template.usesPhotos;
  const isInkTheme = key === "midnight-romance" || key === "celestial-ink" || key === "golden-art-deco";
  const sections = sectionOverride ?? parseInvitationSections(activeDesignKey);
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
  const media = resolveInvitationPhotos(invitation.assets, activeDesignKey, coverUrl, photoAssignments);
  useInvitationPhotoAnimations(rootRef, media.assignment, `${opened}-${media.gallery.length}`);
  const identity = getEventCategory(normalizeEventCategory(invitation.eventCategory));
  const couple = identity.nameMode === "couple";
  const names = couple
    ? (key === "zen-atelier" ? [displayTitleCase(invitation.brideName), displayTitleCase(invitation.groomName)] : [displayTitleCase(invitation.groomName), displayTitleCase(invitation.brideName)]).filter(Boolean).join(" & ")
    : identity.nameMode === "single"
      ? displayTitleCase(invitation.groomName) || displayTitleCase(invitation.title)
      : displayTitleCase(invitation.title);
  const groomParents = couple ? weddingParentLine(invitation.groomFatherName, invitation.groomMotherName, invitation.groomChildOrder, "putra", invitation.groomChildPosition) : "";
  const brideParents = couple ? weddingParentLine(invitation.brideFatherName, invitation.brideMotherName, invitation.brideChildOrder, "putri", invitation.brideChildPosition) : "";
  const eventTitle = displayTitleCase(invitation.title) || names || "Perayaan";
  const date = displayDate(invitation.eventDate, invitation.timezone);
  const countdown = eventCountdown(invitation.eventDate, now);
  const maps = invitation.mapUrl && /^https?:\/\//i.test(invitation.mapUrl) ? invitation.mapUrl : null;
  const hasGift = Boolean(invitation.giftBankName?.trim() && invitation.giftAccountNumber?.trim());
  const music = resolveInvitationMusic(key, invitation.musicUrl, invitation.assets);
  const frame = key === "zen-atelier" ? "rounded-none border border-[var(--inv-soft)] p-1 bg-[var(--inv-surface)]" : layout === "midnight" ? "rounded-full" : layout === "maroon" ? "rounded-none" : layout === "editorial" ? "rounded-2xl" : "rounded-t-[140px] rounded-b-xl";
  const panel = key === "zen-atelier" ? "rounded-none" : layout === "midnight" ? "rounded-3xl" : layout === "maroon" ? "rounded-sm" : layout === "editorial" ? "rounded-xl" : "rounded-[28px]";
  const customPalette = design.palette !== template.preset.palette;
  const css = {
    "--inv-heading": invitationFontFamily(font.heading),
    ...(customPalette ? {
      "--inv-scene-bg": palette.bg,
      "--inv-scene-text": "currentColor",
      "--inv-scene-surface": palette.surface,
      "--inv-scene-ink": readableInk(palette.bg, palette.ink),
      "--inv-scene-surface-ink": readableInk(palette.surface, palette.ink),
      "--inv-scene-accent": palette.accent,
      "--inv-scene-soft": palette.soft,
    } : {}),
    "--inv-bg": palette.bg,
    "--inv-surface": palette.surface,
    "--inv-ink": key === "zen-atelier" ? readableInk(palette.bg, palette.ink) : palette.ink,
    "--inv-accent": palette.accent,
    "--inv-soft": palette.soft,
    color: palette.ink,
    backgroundColor: palette.bg,
    fontFamily: invitationFontFamily(font.body),
  } as CSSProperties;

  useEffect(() => {
    if (!opened && sections.envelope !== false) return;
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [opened, sections.envelope]);

  useEffect(() => {
    if (!opening) return;
    const timer = window.setTimeout(() => {
      setOpened(true);
      setOpening(false);
      onEnvelopeOpened?.();
    }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : key === "pencil-reverie" ? 1050 : 1350);
    return () => window.clearTimeout(timer);
  }, [opening, onEnvelopeOpened, key]);
  useEffect(() => {
    if (key !== "pencil-reverie" || (!opened && sections.envelope !== false)) return;
    const root = rootRef.current;
    const targets = root?.querySelectorAll<HTMLElement>(".pr-section");
    if (!targets?.length || !window.IntersectionObserver ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const node = entry.target as HTMLElement;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.14) node.dataset.prVisible = "true";
        else if (!entry.isIntersecting) delete node.dataset.prVisible;
      }
    }, { threshold: 0.14 });
    targets.forEach((node) => {
      const sectionKey = node.dataset.invitationSection as InvitationSectionKey | undefined;
      if (sectionKey && sectionStyles[sectionKey]?.animation !== undefined) return;
      observer.observe(node);
    });
    return () => observer.disconnect();
  }, [key, opened, sections.envelope, sectionStyles]);

  useEffect(() => {
    if (key !== "zen-atelier" || (!opened && sections.envelope !== false)) return;
    if (!window.IntersectionObserver || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.target.classList.toggle("zen-reveal", entry.isIntersecting));
    }, { threshold: .12 });
    rootRef.current?.querySelectorAll<HTMLElement>(".zen-section h2, .zen-couple-name, .zen-gallery-grid button, .zen-quote").forEach((node) => {
      const sectionNode = node.closest<HTMLElement>("[data-invitation-section]");
      const sectionKey = sectionNode?.dataset.invitationSection as InvitationSectionKey | undefined;
      if (sectionKey && sectionStyles[sectionKey]?.animation !== undefined) return;
      observer.observe(node);
    });
    return () => observer.disconnect();
  }, [key, opened, sections.envelope, media.gallery.length, sectionStyles]);
  const handleOpen = () => {
    musicRef.current?.playOnOpen();
    if (key === "zen-atelier" || key === "pencil-reverie") {
      setOpening(true);
    } else {
      setOpened(true);
      onEnvelopeOpened?.();
    }
  };

  const changePhoto = (slot: PhotoSlot, label: string) =>
    preview && onEditPhoto && activeCropSlot !== slot ? (
      <button
        type="button"
        className="absolute inset-0 z-10 flex items-end justify-center bg-transparent pb-3 text-xs font-medium text-transparent transition hover:bg-black/25 hover:text-white focus-visible:bg-black/25 focus-visible:text-white focus-visible:outline-2 focus-visible:outline-[var(--inv-accent)]"
        onClick={() => onEditPhoto(slot)}
        aria-label={`Atur foto ${label}`}
      >
        Atur foto
      </button>
    ) : null;

  const cropOverlay = (slot: CroppablePhotoSlot) =>
    preview && activeCropSlot === slot && onCropPhoto && onFinishCrop ? (
      <StudioPhotoCropOverlay
        crop={resolvePhotoCrop(media.assignment, slot)}
        onChange={(crop) => onCropPhoto(slot, crop)}
        onDone={onFinishCrop}
      />
    ) : null;

  const objectOverlay = (target: StudioObjectSection) => <InvitationAssetLayers layers={illustrationLayers} section={target}
    editable={preview && Boolean(onUpdateAssetLayer)} selectedId={selectedAssetLayerId} selectedIds={selectedAssetLayerIds} onSelect={onSelectAssetLayer}
    onUpdate={onUpdateAssetLayer} />;

  const renderSectionInstances = (keyName: InvitationSectionKey, render: (instanceId: string) => ReactNode) => {
    const hidden = sections[keyName] === false;
    if (hidden && !preview) return null;
    return instancesForSection(sectionLayout, keyName).map((instance) => (
      <EditableSectionInstance
        key={instance.id}
        instance={instance}
        order={instance.order}
        total={sectionLayout.length}
        preview={preview}
        hidden={hidden}
        actions={sectionEditorActions}
      >
        {render(instance.id)}
      </EditableSectionInstance>
    ));
  };

  const section = (keyName: keyof typeof headings, children: ReactNode, index: number) => {
    const left = key === "modern-maroon" || key === "golden-art-deco";
    const paper = key === "paper-cut-botanical";
    const celestial = key === "celestial-ink";
    const zen = key === "zen-atelier";
    const pencil = key === "pencil-reverie";
    const contrast = !customPalette && isInkTheme && index % 2 === 0;
    const backdrop = contrast ? (key === "golden-art-deco" ? "#191b17" : key === "celestial-ink" ? "#101b32" : "#080d20") : index % 2 ? "var(--inv-surface)" : "var(--inv-bg)";
    const color = customPalette ? readableInk(index % 2 ? palette.surface : palette.bg, palette.ink) : contrast ? (key === "celestial-ink" ? "#c9e2f0" : "#e7cfa4") : "var(--inv-ink)";
    return renderSectionInstances(keyName, () => (
      <section data-invitation-section={keyName} className={`relative overflow-hidden px-6 sm:px-9 ${zen ? "zen-section" : pencil ? "pr-section" : "py-16"} ${left ? "text-left" : "text-center"} ${paper ? "rounded-t-[70px]" : ""}`}
        style={{ backgroundColor: backdrop, color, backgroundImage: zen ? "radial-gradient(circle at 10% 40%,rgba(112,100,81,.055),transparent 42%)" : undefined, ...invitationSectionStyleCss(sectionStyles[keyName]) }}
      >
        {key === "botanical-ivory" && <div aria-hidden className="pointer-events-none absolute -right-10 top-2 rotate-[-24deg] text-[#71826a]/20"><Leaf className="h-36 w-36" strokeWidth={0.6}/></div>}
        {key === "classic-pearl" && <div aria-hidden className="pointer-events-none absolute inset-3 border border-[#b4a88c]/35" />}
        {paper && <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full border-[35px] border-[#a6bb90]/50" />}
        {celestial && <div aria-hidden className="pointer-events-none absolute -left-12 -top-10 h-40 w-40 rounded-full border border-[#b5cce4]/35" />}
        {key === "golden-art-deco" && <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-16 w-16 -translate-x-1/2 rotate-45 border border-[#b69c5e]/35" />}
        {zen && <ZenSectionArtwork section={keyName} />}
        {pencil && <PencilSectionArt section={keyName} />}
        <div className="relative">
          {!zen && !pencil && <p className="text-[10px] uppercase tracking-[0.23em]" style={{color:contrast ? "inherit" : "var(--inv-accent)"}}>{headings[keyName][0]}</p>}
          <h2
            data-studio-rsvp-element={keyName === "rsvp" ? "title" : undefined}
            className={`leading-snug ${zen ? "text-[29px] tracking-[-.03em]" : `mt-3 text-2xl ${left ? "uppercase tracking-[.04em]" : ""}`}`}
            style={{
              fontFamily: invitationFontFamily(font.heading),
              color: "inherit",
              ...(keyName === "rsvp" ? rsvpElementStyleCss(rsvpConfig, "title") : {}),
            }}
          >
            {keyName === "rsvp"
              ? (rsvpConfig.title || (zen ? zenHeadings.rsvp : headings.rsvp[1]))
              : zen ? zenHeadings[keyName] : pencil && keyName === "gallery" ? "Galeri Cerita" : headings[keyName][1]}
          </h2>
          {zen || pencil ? <span aria-hidden="true" className="mx-auto my-6 block h-px w-10 bg-[var(--inv-accent)]/75" /> : (
            <div className={`my-6 flex items-center gap-2 ${left ? "" : "justify-center"}`}>
              <span className="h-px w-12 opacity-55" style={{ backgroundColor: contrast ? "currentColor" : "var(--inv-soft)" }} />
              {key === "celestial-ink" ? <Moon className="h-4 w-4" /> : key === "paper-cut-botanical" || key === "garden-light" || key === "botanical-ivory" ? <Leaf className="h-4 w-4" /> : key === "golden-art-deco" ? <Star className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
              <span className="h-px w-12 opacity-55" style={{ backgroundColor: contrast ? "currentColor" : "var(--inv-soft)" }} />
            </div>
          )}
          {children}
        </div>
        {objectOverlay(keyName)}
      </section>
    ));
  };

  return (
    <main
      ref={rootRef}
      data-studio-preview-root={preview ? "true" : undefined}
      className={`relative isolate mx-auto min-h-[760px] w-full max-w-2xl ${preview ? "overflow-visible" : "overflow-hidden"} border border-[var(--inv-soft)] text-[var(--inv-ink)] ${panel} ${key === "zen-atelier" ? "zen-invitation" : key === "pencil-reverie" ? "pr-invitation" : ""}`}
      style={css}
    >
      <InvitationFonts families={[font.heading, font.body]} />
      {sections.music !== false && <InvitationMusic ref={musicRef} source={music} opened={opened || sections.envelope === false} preview={preview} />}
      {!opened && sections.envelope !== false ? (
        <div data-invitation-section="envelope" className="relative" style={invitationSectionStyleCss(sectionStyles.envelope)}><InvitationThemeScenes
          theme={key}
          isWedding={normalizeEventCategory(invitation.eventCategory) === "WEDDING"}
          hashtag={invitation.weddingHashtag}
          names={names || eventTitle}
          date={key === "zen-atelier" ? displayDate(invitation.eventDate, invitation.timezone, true) : date}
          cover={usesPhotos ? media.cover : undefined}
          focus={media.assignment.focus.cover}
          crop={resolvePhotoCrop(media.assignment, "cover")}
          cropEditing={preview && activeCropSlot === "cover"}
          onCropChange={onCropPhoto ? (crop) => onCropPhoto("cover", crop) : undefined}
          onFinishCrop={onFinishCrop}
          stage="envelope"
          onOpen={handleOpen}
          preview={preview}
        />{objectOverlay("envelope")}</div>
      ) : (
        <div className={`${key === "zen-atelier" ? "zen-content " : ""}flex flex-col`}>
          {renderSectionInstances("cover", () => (
            <div className="relative" data-studio-cover-stage data-invitation-section="cover" style={invitationSectionStyleCss(sectionStyles.cover)}><InvitationThemeScenes
              theme={key}
              isWedding={normalizeEventCategory(invitation.eventCategory) === "WEDDING"}
              hashtag={invitation.weddingHashtag}
              names={names || eventTitle}
              date={key === "zen-atelier" ? displayDate(invitation.eventDate, invitation.timezone, true) : date}
              cover={usesPhotos ? media.cover : undefined}
              focus={media.assignment.focus.cover}
          crop={resolvePhotoCrop(media.assignment, "cover")}
          cropEditing={preview && activeCropSlot === "cover"}
          onCropChange={onCropPhoto ? (crop) => onCropPhoto("cover", crop) : undefined}
          onFinishCrop={onFinishCrop}
              stage="cover"
              onOpen={handleOpen}
              onEditPhoto={usesPhotos && preview ? () => onEditPhoto?.("cover") : undefined}
            />{objectOverlay("cover")}</div>
          ))}

          {section("greeting", key === "pencil-reverie" ? (
            <div className="pr-greeting-copy">
              <p data-studio-copy-field="greeting" className="whitespace-pre-line">{editableCopy.greeting}</p>
              <p data-studio-copy-field="attendanceRequest" className="whitespace-pre-line">{editableCopy.attendanceRequest}</p>
            </div>
          ) : <p data-studio-copy-field="greeting" className="mx-auto max-w-md whitespace-pre-line text-sm leading-8 opacity-80">{editableCopy.greeting}</p>, 1)}

          {section("identity", key === "pencil-reverie" ? (
            <div className="pr-identity-story">
              <div className="pr-identity-polaroid"><span className="pr-polaroid-tape" aria-hidden="true"/>
                <Image alt="Ilustrasi dua orang yang saling bersandar" src="/templates/pencil-reverie/couplesitting.png" width={1122} height={1402} sizes="(max-width: 640px) 70vw, 310px" loading="lazy"/>
              </div>
              <p className="pr-identity-names">{names || eventTitle}</p>
              {couple && <p className="pr-identity-signature">Dua hati, satu cerita yang selalu tumbuh.</p>}
              {(groomParents || brideParents) && <div className="mt-8 grid grid-cols-2 gap-4 border-t border-[var(--inv-soft)] pt-6 text-xs leading-7"><p>{groomParents}</p><p>{brideParents}</p></div>}
            </div>
          ) : key === "zen-atelier" ? (
            <div>
              {media.cover && <div data-invitation-photo-slot="cover" className="zen-identity-photo relative">
                <img src={media.cover} alt={`Foto ${names || eventTitle}`} loading="lazy" style={photoCropStyle(media.assignment, "cover")} />
                {changePhoto("cover", "pasangan")}
                {cropOverlay("cover")}
              </div>}
              {!media.cover && preview && onEditPhoto && <button className="zen-action mb-6" type="button" onClick={() => onEditPhoto("cover")}>Pilih Foto Pasangan</button>}
              <p className="zen-couple-name">{couple ? <>{displayTitleCase(invitation.brideName)}<em>&amp;</em>{displayTitleCase(invitation.groomName)}</> : names || eventTitle}</p>
              {couple && <p className="zen-quote">Dua jiwa, satu perjalanan, menuju selamanya.</p>}
              {(groomParents || brideParents) && <div className="zen-parents"><p>{brideParents}</p><p>{groomParents}</p></div>}
            </div>
          ) : (
            <div className={`mx-auto max-w-lg gap-5 ${couple ? "grid grid-cols-2" : "flex flex-col items-center"}`}>
              {couple ? (
                <>
                  {([["personOne", displayTitleCase(invitation.groomName), media.personOne], ["personTwo", displayTitleCase(invitation.brideName), media.personTwo]] as const).map(([slot, name, url]) => (
                    <div key={slot} className="min-w-0">
                      {usesPhotos && <div data-invitation-photo-slot={slot} className={`relative mx-auto overflow-hidden ${frame}`}>
                        {url ? <img src={url} alt={`Foto ${name || "mempelai"}`} loading="lazy" className="aspect-[3/4] w-full object-cover" style={photoCropStyle(media.assignment, slot)} /> : <div className="flex aspect-[3/4] items-center justify-center bg-black/5"><Heart className="h-8 w-8 opacity-40"/></div>}
                        {changePhoto(slot, name || "mempelai")}
                        {cropOverlay(slot)}
                      </div>}
                      {!usesPhotos && (key === "zen-atelier"
                        ? <span aria-hidden className="mx-auto mb-5 flex h-12 w-12 items-center justify-center border-b border-[var(--inv-accent)] text-xl text-[var(--inv-accent)]">{slot === "personOne" ? "花" : "和"}</span>
                        : <div aria-hidden className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-current/40 text-xl">{slot === "personOne" ? "✧" : "◇"}</div>)}
                      <p className="mt-4 break-words text-base" style={{ fontFamily: invitationFontFamily(font.heading) }}>{name || "Nama belum diisi"}</p>
                      {(slot === "personOne" ? groomParents : brideParents) && <p className="mx-auto mt-2 max-w-[18rem] text-xs leading-5 opacity-75">{slot === "personOne" ? groomParents : brideParents}</p>}
                    </div>
                  ))}
                </>
              ) : (
                <p className="break-words text-lg" style={{ fontFamily: invitationFontFamily(font.heading) }}>{names || eventTitle}</p>
              )}
            </div>
          ), 2)}

          {couple && sections.identity !== false && <OurStorySection story={editableCopy.ourStory} theme={key} preview={preview} />}

          {section("event", key === "pencil-reverie" ? (
            <div className="pr-event-story">
              <p className="mb-2 text-[10px] uppercase tracking-[.22em] text-[var(--inv-accent)]">{couple ? "Hari kita berdua" : "Hari istimewa"}</p>
              <h3>{eventTitle}</h3>
              {invitation.venue && <p className="mt-3">{invitation.venue}</p>}
              {invitation.address && <p className="mt-1 opacity-75">{invitation.address}</p>}
              {invitation.dressCode && <p className="mt-3 text-xs">Dress code · {invitation.dressCode}</p>}
            </div>
          ) : (
            <div className="mx-auto max-w-md space-y-3 text-sm leading-7">
              {key === "zen-atelier" ? <div className="grid grid-cols-[24px_1fr] gap-4 border-y border-[var(--inv-soft)] py-6 text-left">
                <CalendarDays size={22} strokeWidth={1.3} className="mt-1 text-[var(--inv-accent)]" aria-hidden="true" />
                <div><h3 className="text-xl">{eventTitle}</h3>{invitation.venue && <p className="mt-3">{invitation.venue}</p>}</div>
              </div> : <><p className="text-lg" style={{ fontFamily: invitationFontFamily(font.heading) }}>{eventTitle}</p>
              {invitation.venue && <p className="opacity-80">{invitation.venue}</p>}</>}
              {invitation.dressCode && <p className="text-xs opacity-70">Dress code · {invitation.dressCode}</p>}
            </div>
          ), 3)}

          {section("dateTime", (
            <div className={key === "pencil-reverie" ? "pr-date-scrap" : `mx-auto max-w-sm border border-[var(--inv-soft)] bg-[var(--inv-bg)] px-5 py-7 ${panel}`}>
              <CalendarDays className="mx-auto h-6 w-6 text-[var(--inv-accent)]" aria-hidden />
              <p className="mt-4 text-lg" style={{ fontFamily: invitationFontFamily(font.heading) }}>{date}</p>
              {invitation.ceremonyTime && <p className="mt-3 text-sm">Mulai · {invitation.ceremonyTime}</p>}
              {invitation.receptionTime && <p className="mt-1 text-sm">Selesai · {invitation.receptionTime === "END" ? "Selesai acara" : invitation.receptionTime}</p>}
              <p className="mt-3 text-xs opacity-65">{invitation.timezone || "Asia/Jakarta"}</p>
            </div>
          ), 4)}

          {section("gallery", key === "pencil-reverie" ? <PencilMemoryGallery /> : key === "zen-atelier" ? <>
            {preview && onEditPhoto && <button type="button" className="zen-action mb-5" onClick={() => onEditPhoto("gallery")}>Atur Foto Galeri</button>}
            <ZenAtelierGallery photos={media.gallery} customMotion={Boolean(media.assignment.motion.gallery?.animation)} />
          </> : (
            usesPhotos ? <>
              {preview && onEditPhoto && <button type="button" onClick={() => onEditPhoto("gallery")} className="mb-5 min-h-10 rounded-full border border-[var(--inv-soft)] px-5 text-xs text-[var(--inv-accent)]">Atur foto galeri</button>}
              {media.gallery.length ? (
                <div className={`grid gap-3 ${key === "modern-maroon" ? "grid-cols-3" : key === "midnight-romance" ? "grid-cols-2 rounded-t-[120px] overflow-hidden" : key === "eternal-blossom" ? "grid-cols-2 rotate-[-1deg]" : key === "zen-atelier" ? "grid-cols-2 auto-rows-[125px] sm:auto-rows-[155px]" : "grid-cols-2"}`}>
                  {media.gallery.map((asset, index) => (
                    <div key={asset.id} data-invitation-photo-slot="gallery" className={`relative overflow-hidden ${key === "modern-maroon" ? "rounded-none" : key === "midnight-romance" ? "rounded-t-full rounded-b-lg" : key === "eternal-blossom" ? "rounded-t-full rounded-b-3xl" : key === "zen-atelier" ? "rounded-none border border-[var(--inv-soft)] bg-[var(--inv-surface)] p-1" : "rounded-[35%_35%_12px_12px]"} ${index === 0 && key === "zen-atelier" && media.gallery.length > 1 ? "row-span-2" : index === 0 && key !== "modern-maroon" ? "col-span-2" : ""}`}>
                      <img src={asset.url} alt={`Galeri foto ${index + 1}`} loading="lazy" className={key === "zen-atelier" ? "h-full w-full object-cover" : index === 0 ? "aspect-[4/3] w-full object-cover" : "aspect-[3/4] w-full object-cover"} />
                    </div>
                  ))}
                </div>
              ) : key === "zen-atelier" ? (
                <div className="mx-auto max-w-sm">
                  <ZenMemoryArtwork />
                  <p className="mt-5 text-sm opacity-65">Foto galeri belum ditambahkan.</p>
                </div>
              ) : <p className="text-sm opacity-65">Belum ada foto galeri.</p>}
            </> : key === "zen-atelier" ? (
              <div className="mx-auto max-w-sm">
                <ZenMemoryArtwork />
                <p className="mx-auto mt-6 max-w-xs text-sm leading-7 opacity-75">Setiap pertemuan menyimpan cerita yang layak dikenang.</p>
              </div>
            ) : (
              <div className="relative mx-auto flex min-h-48 max-w-xs flex-col items-center justify-center border border-current/25 px-6 py-10">
                <div aria-hidden className="mb-5 flex items-center gap-4 text-3xl opacity-60">{key === "celestial-ink" ? "✧ ✦ ☾" : key === "golden-art-deco" ? "◇ ◆ ◇" : key === "paper-cut-botanical" ? "❧ ❦ ❧" : "✦ ❖ ✦"}</div>
                <p className="text-sm leading-7 opacity-75">Kenangan indah hadir dalam setiap momen yang kita rayakan bersama.</p>
              </div>
            )
          ), 5)}

          {section("countdown", countdown ? (<div className={key === "pencil-reverie" ? "pr-countdown-canvas" : ""}>{key === "pencil-reverie" && <PencilBackwardClock />}
            <div className="grid grid-cols-4 gap-2">
              {countdown.map(([label, value]) => (
                <div key={label} className={`border border-[var(--inv-soft)] bg-[var(--inv-bg)] px-1 py-3 ${panel}`}>
                  <p className="text-xl text-[var(--inv-accent)]" style={{ fontFamily: invitationFontFamily(font.heading) }}>{String(value).padStart(2, "0")}</p>
                  <p className="mt-1 text-[10px] opacity-65">{label}</p>
                </div>
              ))}
            </div></div>
          ) : <p className="text-sm opacity-65">Tanggal acara belum tersedia.</p>, 6)}

          {section("location", (
            <div className="mx-auto max-w-sm space-y-4">
              <MapPin aria-hidden className="mx-auto h-6 w-6 text-[var(--inv-accent)]" />
              <p className="text-lg" style={{ fontFamily: invitationFontFamily(font.heading) }}>{invitation.venue || "Lokasi belum ditentukan"}</p>
              {invitation.address && <p className="text-sm leading-7 opacity-75">{invitation.address}</p>}
              {maps && <a data-studio-section-element="location:button" style={sectionElementStyleCss(sectionElementStyles, "location", "button")} href={maps} target="_blank" rel="noopener noreferrer" className={key === "zen-atelier" ? "zen-action" : "inline-flex min-h-11 items-center justify-center rounded-[var(--dc-control-radius)] bg-[var(--inv-accent)] px-6 text-sm text-white"}>Lihat Lokasi</a>}
              {!maps && <p className="text-xs opacity-55">Tautan lokasi belum tersedia.</p>}
            </div>
          ), 7)}

          {sections.rsvp && section("rsvp", key === "pencil-reverie" || key === "zen-atelier" ? <>
            <p className="mx-auto mb-7 max-w-sm text-sm leading-7">Merupakan kebahagiaan bagi kami apabila Anda berkenan hadir.</p>
            <RsvpForm slug={invitation.slug} appearance="zen" preview={preview} eventCategory={invitation.eventCategory} rsvpConfig={rsvpConfig} guestId={personalGuest?.id} guestName={personalGuest?.name} guestToken={personalGuest?.token} invitedPax={personalGuest?.invitedPax} eventDate={invitation.eventDate} venue={invitation.venue} title={eventTitle} start={invitation.ceremonyTime} description={invitation.description} />
          </> : <RsvpForm slug={invitation.slug} preview={preview} eventCategory={invitation.eventCategory} rsvpConfig={rsvpConfig} guestId={personalGuest?.id} guestName={personalGuest?.name} guestToken={personalGuest?.token} invitedPax={personalGuest?.invitedPax} eventDate={invitation.eventDate} venue={invitation.venue} title={eventTitle} start={invitation.ceremonyTime} description={invitation.description} />, 8)}

          {sections.wishes && section("wishes", (
            <GuestWishes slug={invitation.slug} preview={preview} initialName={personalGuest?.name} appearance={key === "zen-atelier" ? "zen" : "default"} inputStyle={sectionElementStyleCss(sectionElementStyles, "wishes", "input")} buttonStyle={sectionElementStyleCss(sectionElementStyles, "wishes", "button")} />
          ), 9)}

          {sections.gift && section("gift", hasGift ? (
            <div className={`mx-auto max-w-sm border border-[var(--inv-soft)] bg-[var(--inv-bg)] px-6 py-7 text-sm ${key === "pencil-reverie" ? "pr-gift-panel" : panel}`}>
              <Gift className="mx-auto h-6 w-6 text-[var(--inv-accent)]" aria-hidden />
              <p className="mt-4 text-xs opacity-70">{invitation.giftBankName}</p>
              {invitation.giftAccountName && <p className="mt-2 font-semibold">{invitation.giftAccountName}</p>}
              <p className="mt-2 break-all text-lg" style={{ fontFamily: invitationFontFamily(font.heading) }}>{invitation.giftAccountNumber}</p>
              <button data-studio-section-element="gift:button" style={sectionElementStyleCss(sectionElementStyles, "gift", "button")} type="button" onClick={async () => { if (!invitation.giftAccountNumber) return; try { await navigator.clipboard.writeText(invitation.giftAccountNumber); setCopyMessage("Nomor rekening disalin."); } catch { setCopyMessage("Belum dapat menyalin. Silakan salin nomor secara manual."); } }} className="mt-5 min-h-10 rounded-[var(--dc-control-radius)] border border-[var(--inv-soft)] px-5 text-xs text-[var(--inv-accent)]">Salin Nomor Rekening</button>
              {copyMessage && <p role="status" className="mt-3 text-xs">{copyMessage}</p>}
            </div>
          ) : <p className="text-sm opacity-65">Informasi tanda kasih belum ditambahkan.</p>, 10)}

          {section("closing", (
            <div className={key === "zen-atelier" ? "zen-closing-copy text-sm leading-8" : key === "pencil-reverie" ? "pr-closing-copy text-sm leading-8" : "mx-auto max-w-sm text-sm leading-8"}>
              {key === "zen-atelier" ? <p data-studio-copy-field="closing" className="mx-auto max-w-xs whitespace-pre-line text-[15px] leading-8">{editableCopy.closing}</p> : <><Heart aria-hidden className="mx-auto mb-4 h-7 w-7 text-[var(--inv-accent)]" strokeWidth={1.3} /><p data-studio-copy-field="closing" className="whitespace-pre-line">{editableCopy.closing}</p></>}
              <p className="mt-7 break-words text-lg" style={{ fontFamily: invitationFontFamily(font.heading) }}>{names || eventTitle}</p>
              {key === "pencil-reverie" && <p data-studio-copy-field="prayerWish" className="pr-prayer-copy whitespace-pre-line">{editableCopy.prayerWish}</p>}
              {key === "zen-atelier" && couple && <p data-studio-copy-field="zenQuote" className="zen-quote whitespace-pre-line">{editableCopy.zenQuote}</p>}
            </div>
          ), 11)}

          {renderSectionInstances("footer", () => (
            <footer data-invitation-section="footer" style={invitationSectionStyleCss(sectionStyles.footer)} className="relative flex items-center justify-center border-t border-[var(--inv-soft)] bg-[var(--inv-surface)] px-6 py-5">
              <span aria-hidden="true" className="h-px w-10 bg-[var(--inv-accent)] opacity-50" />
              {objectOverlay("footer")}
            </footer>
          ))}
        </div>
      )}
    </main>
  );
}
