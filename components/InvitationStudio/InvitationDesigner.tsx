"use client";

import { useCallback, useEffect, useRef, useState, type DragEvent } from "react";
import {
  ImagePlus,
  Layers3,
  TextCursorInput,
  LayoutTemplate,
  Music2,
  Palette,
  Redo2,
  Save,
  SlidersHorizontal,
  Type,
  Undo2,
  RotateCcw,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { audioUploadError } from "@/lib/invitations/audio-limits";
import { defaultInvitationSections } from "@/lib/templates/sections";
import { invitationCopyDefaults, type EditableInvitationCopyField } from "@/lib/templates/editable-copy";
import { Button } from "@/components/ui/button";
import { useTemplateCatalog } from "@/lib/templates/use-template-catalog";
import { defaultPhotoAssignments, type PhotoFocus, type PhotoSlot } from "@/lib/templates/photo-slots";
import { getEventCategory } from "@/lib/events/catalog";
import PhotoPanel from "@/components/InvitationStudio/PhotoPanel";
import AssetPanel from "@/components/InvitationStudio/AssetPanel";
import TextObjectPanel from "@/components/InvitationStudio/TextObjectPanel";
import AssetLayerInspector from "@/components/InvitationStudio/AssetLayerInspector";
import SectionInspector from "@/components/InvitationStudio/SectionInspector";
import RsvpElementInspector from "@/components/InvitationStudio/RsvpElementInspector";
import CopyTextInspector from "@/components/InvitationStudio/CopyTextInspector";
import SectionElementInspector from "@/components/InvitationStudio/SectionElementInspector";
import { isTemplateIllustration, MAX_ASSET_LAYERS, studioObjectSections, type StudioObjectSection, type InvitationAssetLayer } from "@/lib/templates/asset-layers";
import {
  invitationFonts,
  invitationPalettes,
} from "@/lib/templates/design";
import type { InvitationSectionKey } from "@/lib/templates/sections";
import type { InvitationSectionStyle } from "@/lib/templates/section-styles";
import { defaultInvitationRsvpConfig, MAX_RSVP_CUSTOM_FIELDS } from "@/lib/templates/rsvp-config";
import { defaultInvitationSectionLayout, invitationContentSectionKeys } from "@/lib/templates/section-layout";
import type { StudioSectionElementKind } from "@/lib/templates/section-element-styles";
import {
  ColorPanel,
  ContentPanel,
  DesignerTool,
  FontPanel,
  MusicPanel,
  TemplatePanel,
} from "@/components/InvitationStudio/DesignerPanels";
import { InvitationPreview } from "@/components/InvitationStudio/InvitationPreview";
import { getInvitationDefaultMusic } from "@/lib/templates/music";
import { clearTemplateSelection, readTemplateSelection, rememberTemplateSelection } from "@/lib/templates/template-intent";
import { useLanguage } from "@/components/I18n/LanguageProvider";
import { STUDIO_REFRESH_DRAFT_KEY, makeStudioRefreshDraft, recoverStudioRefreshDraft } from "@/lib/templates/studio-refresh-draft";
import {
  invitationDecorOptions,
  invitationTemplatePresets,
} from "@/components/InvitationStudio/designer-config";
import {
  getInvitationEventIdentity,
  invitationDesignStateFromKey,
  makeInvitationDesignStateKey,
} from "@/components/InvitationStudio/designer-state";
import type {
  InvitationDesignerInvitation,
  InvitationDesignerPanel,
  InvitationDesignState,
} from "@/components/InvitationStudio/designer-types";

export default function InvitationDesigner() {
  const { locale } = useLanguage();
  const copy = locale === "en" ? {
    unsaved: "Unsaved changes", saved: "Design saved", empty: "Design not saved",
    defaults: "Restore Defaults", defaultsHint: "Return this template to its original design state. Uploaded files stay in your media library.",
    undo: "Undo design", redo: "Redo design", saving: "Saving...", save: "Save",
    settings: "Settings", invitation: "Invitation", tools: "Design tools",
    sections: "Content", colors: "Colors", photos: "Photos", music: "Music", assets: "Assets", text: "Text",
    envelope: "Envelope", cover: "Cover",
    showPanel: "Show panel", hidePanel: "Hide panel", replay: "Restart from the beginning",
    envelopeHint: "Open the digital envelope in the canvas", coverHint: "Show Cover without changing the saved envelope setting",
    photoFree: "Photo-free theme", retry: "Try Again",
  } : {
    unsaved: "Perubahan belum disimpan", saved: "Desain tersimpan", empty: "Belum ada desain tersimpan",
    defaults: "Kembalikan ke Default", defaultsHint: "Kembalikan template ke kondisi desain awal. File upload tetap tersimpan di koleksi media.",
    undo: "Urungkan desain", redo: "Ulangi desain", saving: "Menyimpan...", save: "Simpan",
    settings: "Pengaturan", invitation: "Undangan", tools: "Alat desain",
    sections: "Isi", colors: "Warna", photos: "Foto", music: "Musik", assets: "Aset", text: "Teks",
    envelope: "Amplop", cover: "Cover",
    showPanel: "Tampilkan panel", hidePanel: "Sembunyikan panel", replay: "Ulangi dari awal",
    envelopeHint: "Tampilkan dan coba animasi Amplop Digital di canvas", coverHint: "Lihat Cover tanpa mengubah pengaturan Amplop",
    photoFree: "Tema tanpa foto", retry: "Coba Lagi",
  };
  const catalog = useTemplateCatalog();
  const readyTemplates = catalog.filter((item) => item.ready);
  const [invitation, setInvitation] = useState<InvitationDesignerInvitation | null>(null);
  const [panel, setPanel] = useState<InvitationDesignerPanel>("template");
  const [activePhotoSlot, setActivePhotoSlot] = useState<PhotoSlot>("cover");
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [selectedSectionKey, setSelectedSectionKey] = useState<InvitationSectionKey | null>(null);
  const [selectedSectionInstanceId, setSelectedSectionInstanceId] = useState<string | null>(null);
  const [selectedRsvpElementKey, setSelectedRsvpElementKey] = useState<string | null>(null);
  const [selectedCopyField, setSelectedCopyField] = useState<EditableInvitationCopyField | null>(null);
  const [selectedSectionElement, setSelectedSectionElement] = useState<{ section: InvitationSectionKey; kind: StudioSectionElementKind } | null>(null);
  const [copiedAssetLayer, setCopiedAssetLayer] = useState<InvitationAssetLayer | null>(null);
  const draggedAssetSrc = useRef<string | null>(null);
  const [assetDropReady, setAssetDropReady] = useState(false);
  const canvasScrollRef = useRef<HTMLDivElement>(null);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [mobileCanvas, setMobileCanvas] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(0);
  const [canvasStage, setCanvasStage] = useState<"envelope" | "cover">("envelope");
  // A click on the actual envelope advances the Studio stage selector, too.
  const handleCanvasEnvelopeOpened = useCallback(() => setCanvasStage("cover"), []);
  const [savedState, setSavedState] = useState("");
  const [serverRevision, setServerRevision] = useState("");
  const audioMutation = useRef(false);
  const [audioBusy, setAudioBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [notice, setNotice] = useState("Memuat undangan...");
  const [history, setHistory] = useState<string[]>([]);
  const [future, setFuture] = useState<string[]>([]);
  const [musicUrl, setMusicUrl] = useState("");
  const [eventTag, setEventTag] = useState("");
  const [dressCode, setDressCode] = useState("");
  const [design, setDesign] = useState<InvitationDesignState>({
    template: "botanical-ivory",
    palette: "pearl",
    font: "cinzelFauna",
    decor: invitationDecorOptions[0],
    sections: { ...defaultInvitationSections },
    photos: defaultPhotoAssignments(),
    copy: {},
    layers: [],
    sectionStyles: {},
    rsvpConfig: { ...defaultInvitationRsvpConfig, customFields: [], elementStyles: {} },
    sectionLayout: defaultInvitationSectionLayout.map((item) => ({ ...item })),
    sectionElementStyles: {},
  });

  async function load() {
    const params = new URLSearchParams(window.location.search);
    const invitationId = params.get("invitationId")?.trim() || "";
    const legacyType =
      params.get("type") === "ADAT_AKAD" ? "ADAT_AKAD" : "WEDDING";
    if (!invitationId) throw new Error("Pilih acara dari Dashboard untuk membuka Studio.");
    const query = invitationId
      ? `?id=${encodeURIComponent(invitationId)}&type=${legacyType}`
      : `?type=${legacyType}`;

    const response = await fetch(`/api/invitations${query}`, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok || !data.invitation) {
      throw new Error(data.error || "Undangan belum dapat dimuat.");
    }

    const next = data.invitation as InvitationDesignerInvitation;
    const fallbackDecor =
      next.assets.find((asset) => asset.type === "IMAGE")?.url || invitationDecorOptions[0];
    setInvitation(next);
    setMusicUrl(next.musicUrl || "");
    setEventTag(next.weddingHashtag || "");
    setDressCode(next.dressCode || "");
    const loadedDesign = invitationDesignStateFromKey(next.templateKey, fallbackDecor);
    // A catalog CTA may select a ready theme for THIS event, but never saves that
    // selection without the owner's explicit Save Design action.
    const requestedTheme = params.get("template") || (params.get("from") === "template" ? readTemplateSelection() : null);
    const requestedPreset = requestedTheme ? invitationTemplatePresets[requestedTheme] : undefined;
    const stagedDesign: InvitationDesignState = requestedTheme && requestedTheme !== loadedDesign.template && requestedPreset
      ? { ...loadedDesign, template: requestedTheme, palette: requestedPreset.palette, font: requestedPreset.font, copy: {}, layers: [], sectionStyles: {}, rsvpConfig: { ...defaultInvitationRsvpConfig, customFields: [], elementStyles: {} }, sectionLayout: defaultInvitationSectionLayout.map((item) => ({ ...item })), sectionElementStyles: {} }
      : loadedDesign;
    // Use actual persisted fields for cache identity; fallback photo URLs can change after an upload.
    const serverBaseline = JSON.stringify([next.templateKey || "", next.musicUrl || "", next.weddingHashtag || "", next.dressCode || ""]);
    const canonicalSavedState = JSON.stringify([makeInvitationDesignStateKey(loadedDesign), next.musicUrl || "", next.weddingHashtag || "", next.dressCode || ""]);
    // Restore only after a true browser refresh of this same invitation and saved revision.
    // A fresh visit, event switch, Back/Forward navigation or logout never reopens this draft.
    const navigationType = (window.performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined)?.type ?? "navigate";
    // PerformanceNavigationTiming describes the whole document, not each Next.js SPA route.
    // An entry marker distinguishes a real refresh of Studio from opening Studio after another page was refreshed.
    const historyState = window.history.state as Record<string, unknown> | null;
    const sameStudioEntry = historyState?.__dcStudioDraftEntry === next.id;
    let refreshed: [string, string, string, string] | null = null;
    try {
      const raw = window.sessionStorage.getItem(STUDIO_REFRESH_DRAFT_KEY);
      refreshed = recoverStudioRefreshDraft(raw, sameStudioEntry ? navigationType : "navigate", next.id, serverBaseline);
      if (!refreshed) window.sessionStorage.removeItem(STUDIO_REFRESH_DRAFT_KEY);
      if (!sameStudioEntry) window.history.replaceState({ ...historyState, __dcStudioDraftEntry: next.id }, "", window.location.href);
    } catch { /* Session storage may be disabled: ordinary editing still works. */ }
    setDesign(refreshed ? invitationDesignStateFromKey(refreshed[0], fallbackDecor) : stagedDesign);
    if (refreshed) {
      setMusicUrl(refreshed[1]);
      setEventTag(refreshed[2]);
      setDressCode(refreshed[3]);
    }
    setSavedState(canonicalSavedState);
    setServerRevision(serverBaseline);
    setCanvasStage("envelope");
    setSelectedLayerId(null);
    setCopiedAssetLayer(null);
    setHistory([]);
    setFuture([]);
    setNotice(requestedTheme && requestedTheme !== loadedDesign.template && requestedPreset
      ? "Template dipilih. Klik Simpan untuk menerapkan."
      : "");
  }

  useEffect(() => {
    load().catch((error) => {
      setLoadError(true);
      setNotice(
        error instanceof Error
          ? error.message
          : "Undangan belum dapat dimuat.",
      );
    });
  }, []);

  const template =
    readyTemplates.find((item) => item.key === design.template) ||
    readyTemplates[0];
  const palette = invitationPalettes[design.palette];
  const fontPair = invitationFonts[design.font];
  const designKey = makeInvitationDesignStateKey(design);
  const selectedAssetLayer = design.layers.find((layer) => layer.id === selectedLayerId);
  const selectedAssetIndex = design.layers.findIndex((layer) => layer.id === selectedLayerId);
  const identity = getInvitationEventIdentity(invitation);
  const currentState = JSON.stringify([designKey, musicUrl, eventTag, dressCode]);
  const dirty = Boolean(invitation && savedState !== currentState);
  useEffect(() => {
    // Do not auto-save to the API: this snapshot is only for Ctrl/Cmd+R in this tab.
    if (!invitation || !savedState || !serverRevision) return;
    try {
      if (dirty) window.sessionStorage.setItem(STUDIO_REFRESH_DRAFT_KEY,
        JSON.stringify(makeStudioRefreshDraft(invitation.id, serverRevision, currentState)));
      else window.sessionStorage.removeItem(STUDIO_REFRESH_DRAFT_KEY);
    } catch { /* Private mode, storage quota, or disabled storage must not break editing. */ }
  }, [invitation?.id, savedState, serverRevision, currentState, dirty]);
  useEffect(() => {
    const clearDraft = () => {
      try { window.sessionStorage.removeItem(STUDIO_REFRESH_DRAFT_KEY); } catch { /* Optional cache. */ }
    };
    // A normal navigation (including logout links) ends this editing session.
    const onLinkClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest<HTMLAnchorElement>("a[href]");
      if (!link || link.target === "_blank" || link.hasAttribute("download") ||
        event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.defaultPrevented) return;
      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin ||
        destination.pathname !== window.location.pathname || destination.search !== window.location.search) clearDraft();
    };
    const onPageHide = (event: PageTransitionEvent) => { if (event.persisted) clearDraft(); };
    const onPageShow = (event: PageTransitionEvent) => {
      // A browser BFCache restore must not revive in-memory, unsaved Studio edits.
      if (event.persisted) { clearDraft(); window.location.reload(); }
    };
    document.addEventListener("click", onLinkClick, true);
    window.addEventListener("popstate", clearDraft);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      document.removeEventListener("click", onLinkClick, true);
      window.removeEventListener("popstate", clearDraft);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);
  useEffect(() => {
    if (!dirty) return;
    const preventExit = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", preventExit);
    return () => window.removeEventListener("beforeunload", preventExit);
  }, [dirty]);
  // Couple-only photo roles are not relevant to single-host and general events.
  const supportedPhotoSlots = template?.photoSlots ?? (["cover"] as PhotoSlot[]);
  const photoSlots = getEventCategory(identity.category).nameMode === "couple"
    ? supportedPhotoSlots
    : supportedPhotoSlots.filter((slot) => slot !== "personOne" && slot !== "personTwo");

  function change(next: Partial<InvitationDesignState>) {
    setHistory((current) => [...current.slice(-14), designKey]);
    setFuture([]);
    setDesign((current) => ({ ...current, ...next }));
  }

  function selectTemplate(templateKey: string) {
    if (!readyTemplates.some((item) => item.key === templateKey)) {
      setNotice("Template ini masih menunggu integrasi renderer.");
      return;
    }
    const preset = invitationTemplatePresets[templateKey] || invitationTemplatePresets["botanical-ivory"];
    change({
      template: templateKey,
      palette: preset.palette,
      font: preset.font,
      copy: templateKey === design.template ? design.copy : {},
      layers: templateKey === design.template ? design.layers : [],
      sectionStyles: templateKey === design.template ? design.sectionStyles : {},
      rsvpConfig: templateKey === design.template ? design.rsvpConfig : { ...defaultInvitationRsvpConfig, customFields: [], elementStyles: {} },
      sectionLayout: templateKey === design.template ? design.sectionLayout : defaultInvitationSectionLayout.map((item) => ({ ...item })),
      sectionElementStyles: templateKey === design.template ? design.sectionElementStyles : {},
    });
    rememberTemplateSelection(templateKey);
    // Keep the browser URL aligned with an unsaved theme choice on refresh.
    const location = new URL(window.location.href);
    location.searchParams.set("template", templateKey);
    window.history.replaceState(window.history.state, "", location.pathname + location.search + location.hash);
    setActivePhotoSlot("cover");
    setSelectedLayerId(null);
    setSelectedSectionKey(null);
    setSelectedSectionInstanceId(null);
    setSelectedRsvpElementKey(null);
    setSelectedCopyField(null);
    setSelectedSectionElement(null);
    setCopiedAssetLayer(null);
    setCanvasStage("envelope");
  }

  function restoreDefaults() {
    const preset = invitationTemplatePresets[design.template];
    if (!preset || !invitation || saving || audioMutation.current) return;
    change({
      palette: preset.palette,
      font: preset.font,
      sections: { ...defaultInvitationSections },
      photos: defaultPhotoAssignments(),
      copy: {},
      layers: [],
      sectionStyles: {},
      rsvpConfig: { ...defaultInvitationRsvpConfig, customFields: [], elementStyles: {} },
      sectionLayout: defaultInvitationSectionLayout.map((item) => ({ ...item })),
      sectionElementStyles: {},
    });
    setMusicUrl("");
    setActivePhotoSlot("cover");
    setSelectedLayerId(null);
    setSelectedSectionKey(null);
    setSelectedSectionInstanceId(null);
    setSelectedRsvpElementKey(null);
    setSelectedCopyField(null);
    setSelectedSectionElement(null);
    setCopiedAssetLayer(null);
    draggedAssetSrc.current = null;
    setAssetDropReady(false);
    setCanvasStage("envelope");
    setPreviewVersion((value) => value + 1);
    requestAnimationFrame(() => canvasScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" }));
    setNotice("Desain kembali ke kondisi awal template. Aset yang dipasang di canvas, posisi/ukuran/rotasi, teks dekoratif, foto slot, pilihan musik, isi template, warna, font, dan toggle bagian sudah direset. File upload tetap tersimpan di koleksi media. Klik Simpan untuk menerapkan.");
  }

  async function deleteMusic(id: string) {
    if (!invitation || audioMutation.current || saving) return;
    const asset = invitation.assets.find((item) => item.id === id && item.type === "AUDIO");
    if (!asset) return;
    audioMutation.current = true;
    setAudioBusy(true);
    try {
      const response = await fetch(`/api/invitations/assets/${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Musik belum dapat dihapus.");
      setInvitation((current) => current ? {
        ...current, assets: current.assets.filter((item) => item.id !== id),
        musicUrl: current.musicUrl === asset.url ? null : current.musicUrl,
      } : current);
      if (musicUrl === asset.url) setMusicUrl("");
      setNotice("Musik dihapus. Slot tersedia untuk unggahan baru.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Musik belum dapat dihapus.");
    } finally {
      audioMutation.current = false;
      setAudioBusy(false);
    }
  }

  function setNarrativeCopy(field: EditableInvitationCopyField, text: string) {
    change({ copy: { ...design.copy, [field]: text } });
  }

  function focusContentSection(section: InvitationSectionKey) {
    if (section === "music") {
      setPanel("music");
      return;
    }
    setSelectedLayerId(null);
    setSelectedRsvpElementKey(null);
    setSelectedCopyField(null);
    setSelectedSectionElement(null);
    setSelectedSectionKey(section);
    const instance = design.sectionLayout.find((item) => item.key === section);
    setSelectedSectionInstanceId(instance?.id ?? null);
    if (section === "envelope") {
      setCanvasStage("envelope");
      setPreviewVersion((value) => value + 1);
    } else {
      setCanvasStage("cover");
      requestAnimationFrame(() => canvasScrollRef.current?.querySelector(`[data-invitation-section="${section}"]`)?.scrollIntoView({ block: "center" }));
    }
  }

  function focusContentElement(section: InvitationSectionKey, kind: StudioSectionElementKind) {
    setSelectedLayerId(null);
    setSelectedSectionKey(null);
    setSelectedSectionInstanceId(null);
    setSelectedCopyField(null);
    setCanvasStage(section === "envelope" ? "envelope" : "cover");

    if (section === "rsvp") {
      setSelectedSectionElement(null);
      setSelectedRsvpElementKey(kind === "input" ? "inputs" : "button");
      requestAnimationFrame(() => canvasScrollRef.current?.querySelector('[data-invitation-section="rsvp"]')?.scrollIntoView({ block: "center" }));
      return;
    }

    setSelectedRsvpElementKey(null);
    setSelectedSectionElement({ section, kind });
    requestAnimationFrame(() => canvasScrollRef.current?.querySelector(`[data-studio-section-element="${section}:${kind}"]`)?.scrollIntoView({ block: "center" }));
  }

  function setSection(section: InvitationSectionKey, enabled: boolean) {
    const sections = {
      ...design.sections,
      [section]: enabled,
    };
    if (!enabled || section === "envelope" || section === "music" || design.sectionLayout.some((item) => item.key === section)) {
      change({ sections });
      return;
    }

    const canonicalIndex = invitationContentSectionKeys.indexOf(section);
    const next = [...design.sectionLayout];
    const insertAt = next.findIndex((item) => invitationContentSectionKeys.indexOf(item.key) > canonicalIndex);
    const instance = { id: section, key: section };
    if (insertAt < 0) next.push(instance);
    else next.splice(insertAt, 0, instance);
    change({ sections, sectionLayout: next });
  }

  function setPhoto(slot: "cover" | "personOne" | "personTwo", id: string | null) {
    change({ photos: { ...design.photos, [slot]: id } });
  }

  function toggleGalleryPhoto(id: string) {
    const allIds = (invitation?.assets ?? []).filter((asset) => asset.type === "IMAGE").map((asset) => asset.id);
    const current = design.photos.gallery ?? allIds;
    const gallery = id === "*"
      ? design.photos.gallery === null ? [] : null
      : current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
    change({ photos: { ...design.photos, gallery } });
  }

  function setPhotoFocus(slot: "cover" | "personOne" | "personTwo", focus: PhotoFocus) {
    change({ photos: { ...design.photos, focus: { ...design.photos.focus, [slot]: focus } } });
  }

  function editPhotoFromCanvas(slot: PhotoSlot) {
    setActivePhotoSlot(slot);
    setPanel("decor");
    setInspectorOpen(true);
    setMobileCanvas(false);
  }

  function showDesignSection(section: StudioObjectSection) {
    setCanvasStage(section === "envelope" ? "envelope" : "cover");
    if (section === "envelope") setPreviewVersion((current) => current + 1);
  }

  function addAssetLayer(src: string, position: { x: number; y: number; section?: StudioObjectSection } = { x: 50, y: 38 }) {
    const section = position.section ?? "cover";
    if (!isTemplateIllustration(src) || design.layers.length >= MAX_ASSET_LAYERS || design.sections[section] === false) return;
    const id = crypto.randomUUID().replace(/-/g, "");
    change({ layers: [...design.layers, { id, src, x: position.x, y: position.y, section, width: 28, opacity: 1 }] });
    setSelectedLayerId(id);
    showDesignSection(section);
    setInspectorOpen(true);
  }

  function addTextObject(text: string, section: StudioObjectSection) {
    if (!text.trim() || design.layers.length >= MAX_ASSET_LAYERS || design.sections[section] === false) return;
    const id = crypto.randomUUID().replace(/-/g, "");
    change({ layers: [...design.layers, {
      id, kind: "text", src: "", text: text.slice(0, 180), section, x: 50, y: 48, width: 55,
      opacity: 1, fontSize: 24, fontRole: "heading", color: palette?.accent ?? "#C07A84", rotation: 0,
    }] });
    setSelectedLayerId(id);
    showDesignSection(section);
    setPanel("text");
    setInspectorOpen(true);
    requestAnimationFrame(() => canvasScrollRef.current?.querySelector(`[data-invitation-section="${section}"]`)?.scrollIntoView({ block: "center" }));
  }

  function focusDesignObject(id: string) {
    const layer = design.layers.find((item) => item.id === id);
    if (!layer) return;
    setSelectedSectionKey(null);
    setSelectedSectionInstanceId(null);
    setSelectedRsvpElementKey(null);
    setSelectedCopyField(null);
    setSelectedSectionElement(null);
    setSelectedLayerId(id);
    showDesignSection(layer.section ?? "cover");
    requestAnimationFrame(() => canvasScrollRef.current?.querySelector(`[data-invitation-section="${layer.section ?? "cover"}"]`)?.scrollIntoView({ block: "center" }));
  }

  function copySelectedAssetLayer() {
    const selected = design.layers.find((layer) => layer.id === selectedLayerId);
    if (selected) setCopiedAssetLayer({ ...selected });
  }

  function pasteAssetLayer() {
    if (!copiedAssetLayer || !invitation || saving || design.layers.length >= MAX_ASSET_LAYERS) return;
    const id = crypto.randomUUID().replace(/-/g, "");
    const next = { ...copiedAssetLayer, id, x: Math.min(100, copiedAssetLayer.x + 5), y: Math.min(100, copiedAssetLayer.y + 5) };
    change({ layers: [...design.layers, next] });
    setSelectedLayerId(id);
    showDesignSection(next.section ?? "cover");
  }

  function beginAssetDrag(src: string) {
    if (!isTemplateIllustration(src) || design.layers.length >= MAX_ASSET_LAYERS) return;
    draggedAssetSrc.current = src;
  }

  function findSectionDropTarget(clientX: number, clientY: number): HTMLElement | null {
    for (const element of canvasScrollRef.current?.querySelectorAll<HTMLElement>("[data-invitation-section]") ?? []) {
      if (!studioObjectSections.includes(element.dataset.invitationSection as StudioObjectSection)) continue;
      const rect = element.getBoundingClientRect();
      if (rect.width && rect.height && clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) return element;
    }
    return null;
  }

  function onAssetDragOver(event: DragEvent<HTMLDivElement>) {
    if (!draggedAssetSrc.current || design.layers.length >= MAX_ASSET_LAYERS) return;
    event.preventDefault();
    const rect = canvasScrollRef.current?.getBoundingClientRect();
    if (rect && event.clientY > rect.bottom - 48) canvasScrollRef.current!.scrollTop += 16;
    else if (rect && event.clientY < rect.top + 48) canvasScrollRef.current!.scrollTop -= 16;
    const section = findSectionDropTarget(event.clientX, event.clientY);
    if (!section || design.sections[section.dataset.invitationSection as StudioObjectSection] === false) {
      event.dataTransfer.dropEffect = "none";
      if (assetDropReady) setAssetDropReady(false);
      return;
    }
    event.dataTransfer.dropEffect = "copy";
    if (!assetDropReady) setAssetDropReady(true);
  }

  function onAssetDrop(event: DragEvent<HTMLDivElement>) {
    const src = draggedAssetSrc.current;
    const section = src ? findSectionDropTarget(event.clientX, event.clientY) : null;
    draggedAssetSrc.current = null;
    setAssetDropReady(false);
    if (!src || !section) return;
    event.preventDefault();
    const rect = section.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const clamp = (value: number) => Math.round(Math.max(0, Math.min(100, value)) * 10) / 10;
    addAssetLayer(src, {
      x: clamp((event.clientX - rect.left) / rect.width * 100),
      y: clamp((event.clientY - rect.top) / rect.height * 100),
      section: section.dataset.invitationSection as StudioObjectSection,
    });
  }

  function endAssetDrag() { draggedAssetSrc.current = null; setAssetDropReady(false); }

  function updateRsvpConfig(patch: Partial<InvitationDesignState["rsvpConfig"]>) {
    change({ rsvpConfig: { ...design.rsvpConfig, ...patch } });
  }

  function updateSectionElementStyles(styles: InvitationDesignState["sectionElementStyles"]) {
    change({ sectionElementStyles: styles });
  }

  function resetNarrativeCopy(field: EditableInvitationCopyField) {
    const next = { ...design.copy };
    delete next[field];
    change({ copy: next });
  }

  function addRsvpCustomField() {
    if (design.rsvpConfig.customFields.length >= MAX_RSVP_CUSTOM_FIELDS) return;
    const id = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
    updateRsvpConfig({
      customFields: [...design.rsvpConfig.customFields, {
        id,
        label: `Field ${design.rsvpConfig.customFields.length + 1}`,
        required: false,
      }],
    });
  }

  function updateRsvpCustomField(id: string, patch: { label?: string; required?: boolean }) {
    updateRsvpConfig({
      customFields: design.rsvpConfig.customFields.map((field) => field.id === id ? { ...field, ...patch } : field),
    });
  }

  function removeRsvpCustomField(id: string) {
    const elementStyles = { ...design.rsvpConfig.elementStyles };
    delete elementStyles[`custom:${id}`];
    updateRsvpConfig({
      customFields: design.rsvpConfig.customFields.filter((field) => field.id !== id),
      elementStyles,
    });
    if (selectedRsvpElementKey === `custom:${id}`) setSelectedRsvpElementKey(null);
  }

  function selectSectionInstance(id: string, key: InvitationSectionKey) {
    setSelectedLayerId(null);
    setSelectedRsvpElementKey(null);
    setSelectedCopyField(null);
    setSelectedSectionElement(null);
    setSelectedSectionKey(key);
    setSelectedSectionInstanceId(id);
  }

  function moveSectionInstance(id: string, direction: -1 | 1) {
    const index = design.sectionLayout.findIndex((item) => item.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= design.sectionLayout.length) return;
    const next = [...design.sectionLayout];
    [next[index], next[target]] = [next[target], next[index]];
    change({ sectionLayout: next });
  }

  function toggleSectionInstance(id: string) {
    const instance = design.sectionLayout.find((item) => item.id === id);
    if (!instance) return;
    setSection(instance.key, design.sections[instance.key] === false);
  }

  function duplicateSectionInstance(id: string) {
    const index = design.sectionLayout.findIndex((item) => item.id === id);
    const source = design.sectionLayout[index];
    if (!source || design.sectionLayout.length >= 36) return;
    const copyId = `${source.key}-copy-${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}`;
    const next = [...design.sectionLayout];
    next.splice(index + 1, 0, { id: copyId, key: source.key });
    change({ sectionLayout: next });
    setSelectedSectionKey(source.key);
    setSelectedSectionInstanceId(copyId);
  }

  function deleteSectionInstance(id: string) {
    const source = design.sectionLayout.find((item) => item.id === id);
    if (!source) return;
    const next = design.sectionLayout.filter((item) => item.id !== id);
    const hasSameSection = next.some((item) => item.key === source.key);
    change({
      sectionLayout: next,
      ...(!hasSameSection ? { sections: { ...design.sections, [source.key]: false } } : {}),
    });
    if (selectedSectionInstanceId === id) {
      setSelectedSectionKey(null);
      setSelectedSectionInstanceId(null);
    }
  }

  function updateSectionStyle(key: InvitationSectionKey, patch: Partial<InvitationSectionStyle>) {
    const current = design.sectionStyles[key] ?? {};
    const next = { ...current, ...patch };
    for (const [property, value] of Object.entries(next)) {
      if (value === undefined) delete (next as Record<string, unknown>)[property];
    }
    const sectionStyles = { ...design.sectionStyles };
    if (Object.keys(next).length) sectionStyles[key] = next;
    else delete sectionStyles[key];
    change({ sectionStyles });
  }

  function resetSectionStyle(key: InvitationSectionKey) {
    if (!design.sectionStyles[key]) return;
    const sectionStyles = { ...design.sectionStyles };
    delete sectionStyles[key];
    change({ sectionStyles });
  }

  function updateAssetLayer(id: string, patch: Partial<InvitationAssetLayer>) {
    if (!design.layers.some((layer) => layer.id === id)) return;
    if (patch.section && (design.sections[patch.section] === false || !studioObjectSections.includes(patch.section))) return;
    change({ layers: design.layers.map((layer) => layer.id === id ? { ...layer, ...patch } : layer) });
    if (patch.section) {
      showDesignSection(patch.section);
      requestAnimationFrame(() => canvasScrollRef.current?.querySelector(`[data-invitation-section="${patch.section}"]`)?.scrollIntoView({ block: "center" }));
    }
  }

  function removeAssetLayer(id: string) {
    change({ layers: design.layers.filter((layer) => layer.id !== id) });
    setSelectedLayerId(null);
  }

  function positionAssetLayer(id: string, position: "front" | "back") {
    const index = design.layers.findIndex((layer) => layer.id === id);
    if (index < 0) return;
    if ((position === "front" && index === design.layers.length - 1) || (position === "back" && index === 0)) return;
    const next = [...design.layers];
    const [layer] = next.splice(index, 1);
    if (!layer) return;
    if (position === "front") next.push(layer);
    else next.unshift(layer);
    change({ layers: next });
  }

  useEffect(() => {
    const root = canvasScrollRef.current;
    if (!root) return;
    for (const node of root.querySelectorAll<HTMLElement>("[data-invitation-section]")) {
      if (selectedSectionKey !== "rsvp" && node.dataset.invitationSection === selectedSectionKey) node.dataset.studioSectionSelected = "true";
      else delete node.dataset.studioSectionSelected;
    }
  }, [selectedSectionKey, designKey, canvasStage, previewVersion]);

  useEffect(() => {
    const root = canvasScrollRef.current;
    if (!root) return;
    for (const node of root.querySelectorAll<HTMLElement>("[data-studio-rsvp-element]")) {
      if (node.dataset.studioRsvpElement === selectedRsvpElementKey) node.dataset.studioRsvpSelected = "true";
      else delete node.dataset.studioRsvpSelected;
    }
  }, [selectedRsvpElementKey, designKey, canvasStage, previewVersion]);

  useEffect(() => {
    const root = canvasScrollRef.current;
    if (!root) return;
    const selectedKey = selectedSectionElement ? `${selectedSectionElement.section}:${selectedSectionElement.kind}` : "";
    for (const node of root.querySelectorAll<HTMLElement>("[data-studio-section-element]")) {
      if (node.dataset.studioSectionElement === selectedKey) node.dataset.studioSectionElementSelected = "true";
      else delete node.dataset.studioSectionElementSelected;
    }
  }, [selectedSectionElement, designKey, canvasStage, previewVersion]);

  useEffect(() => {
    const root = canvasScrollRef.current;
    if (!root) return;
    for (const node of root.querySelectorAll<HTMLElement>("[data-studio-copy-field]")) {
      if (node.dataset.studioCopyField === selectedCopyField) node.dataset.studioCopySelected = "true";
      else delete node.dataset.studioCopySelected;
    }
  }, [selectedCopyField, designKey, canvasStage, previewVersion]);

  useEffect(() => {
    function handleLayerShortcut(event: KeyboardEvent) {
      if (!invitation || saving || audioBusy || event.defaultPrevented || event.isComposing || canvasStage !== "cover") return;
      const target = event.target;
      if (target instanceof Element && target.closest('input, textarea, select, [contenteditable="true"], [role="textbox"]')) return;
      const activeText = window.getSelection()?.toString();
      if (activeText) return;
      const modifier = event.ctrlKey || event.metaKey;
      if (modifier && !event.altKey && !event.shiftKey && event.key.toLowerCase() === "c") {
        if (!selectedAssetLayer) return;
        event.preventDefault();
        copySelectedAssetLayer();
      } else if (modifier && !event.altKey && !event.shiftKey && event.key.toLowerCase() === "v") {
        if (!copiedAssetLayer || design.layers.length >= MAX_ASSET_LAYERS) return;
        event.preventDefault();
        pasteAssetLayer();
      } else if (!modifier && !event.altKey && (event.key === "Delete" || event.key === "Backspace")) {
        if (!selectedAssetLayer) return;
        event.preventDefault();
        removeAssetLayer(selectedAssetLayer.id);
      } else if (!modifier && !event.altKey && event.key === "Escape" && selectedAssetLayer) {
        setSelectedLayerId(null);
      }
    }
    window.addEventListener("keydown", handleLayerShortcut);
    return () => window.removeEventListener("keydown", handleLayerShortcut);
  }, [invitation, saving, audioBusy, canvasStage, selectedAssetLayer, copiedAssetLayer, design.layers]);

  function undo() {
    const key = history.at(-1);
    if (!key) return;
    setFuture((current) => [...current, designKey]);
    setDesign(invitationDesignStateFromKey(key, design.decor));
    setHistory((current) => current.slice(0, -1));
  }

  function redo() {
    const key = future.at(-1);
    if (!key) return;
    setHistory((current) => [...current, designKey]);
    setDesign(invitationDesignStateFromKey(key, design.decor));
    setFuture((current) => current.slice(0, -1));
  }

  async function uploadAsset(file: File, assetType: "IMAGE" | "AUDIO") {
    if (!invitation) return;
    if (assetType === "AUDIO") {
      if (audioMutation.current || saving) return;
      const error = audioUploadError(file, invitation.assets.filter((asset) => asset.type === "AUDIO").length);
      if (error) { setNotice(error); return; }
      audioMutation.current = true;
      setAudioBusy(true);
    }
    setNotice(assetType === "IMAGE" ? "Mengunggah foto..." : "Mengunggah musik...");
    try {
      const formData = new FormData();
      formData.append("invitationId", invitation.id);
      formData.append("type", assetType);
      formData.append("file", file);
      const response = await fetch("/api/invitations/assets/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload gagal.");

      setInvitation((current) =>
        current
          ? { ...current, assets: [...current.assets, data.asset] }
          : current,
      );
      if (assetType === "AUDIO") setMusicUrl(data.asset.url);
      setNotice(assetType === "IMAGE" ? "Foto berhasil diunggah." : "Musik berhasil diunggah.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Upload gagal.");
      if (assetType === "IMAGE") throw error;
    } finally {
      if (assetType === "AUDIO") { audioMutation.current = false; setAudioBusy(false); }
    }
  }

  async function save() {
    if (!invitation) return;
    if (saving || audioMutation.current) return;
    setSaving(true);
    setNotice("Menyimpan...");
    try {
      const response = await fetch("/api/invitations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: invitation.id,
          eventCategory: invitation.eventCategory,
          templateKey: designKey,
          musicUrl,
          weddingHashtag: eventTag,
          dressCode,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal menyimpan.");
      setInvitation(data.invitation);
      setSavedState(currentState);
      setServerRevision(JSON.stringify([data.invitation.templateKey || "", data.invitation.musicUrl || "", data.invitation.weddingHashtag || "", data.invitation.dressCode || ""]));
      try { window.sessionStorage.removeItem(STUDIO_REFRESH_DRAFT_KEY); } catch { /* Optional cache. */ }
      clearTemplateSelection();
      // After saving, stale catalog URL parameters must not reapply an old theme.
      const location = new URL(window.location.href);
      location.searchParams.delete("template");
      location.searchParams.delete("from");
      window.history.replaceState(window.history.state, "", location.pathname + location.search + location.hash);
      setNotice("Desain tersimpan.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  }

  if (loadError) return (
    <section className="flex flex-1 flex-col items-center justify-center gap-5 p-6 text-center" role="alert">
      <p className="text-sm">{notice}</p>
      <Button onClick={() => window.location.reload()}>{copy.retry}</Button>
    </section>
  );

  return (
    <section className="dc-invitation-studio-shell" data-inspector={inspectorOpen} data-mobile-canvas={mobileCanvas}>

      <div className="dc-studio-mobile-view" aria-label="Studio">
        <button type="button" aria-pressed={!mobileCanvas} onClick={() => setMobileCanvas(false)}>{copy.settings}</button>
        <button type="button" aria-pressed={mobileCanvas} onClick={() => setMobileCanvas(true)}>{copy.invitation}</button>
      </div>
      <div className="dc-studio-workspace">
        <nav className="dc-studio-rail" aria-label={copy.tools}>
          <DesignerTool active={panel === "template"} label="Template" icon={<LayoutTemplate className="h-4 w-4" />} onClick={() => { setInspectorOpen(true); setMobileCanvas(false); setPanel("template"); }} />
          <DesignerTool active={panel === "sections"} label={copy.sections} icon={<SlidersHorizontal className="h-4 w-4" />} onClick={() => { setInspectorOpen(true); setMobileCanvas(false); setPanel("sections"); }} />
          <DesignerTool active={panel === "color"} label={copy.colors} icon={<Palette className="h-4 w-4" />} onClick={() => { setInspectorOpen(true); setMobileCanvas(false); setPanel("color"); }} />
          <DesignerTool active={panel === "font"} label="Font" icon={<Type className="h-4 w-4" />} onClick={() => { setInspectorOpen(true); setMobileCanvas(false); setPanel("font"); }} />
          <div className="dc-studio-rail-divider" />
          <DesignerTool active={panel === "decor"} label={copy.photos} icon={<ImagePlus className="h-4 w-4" />} onClick={() => { setInspectorOpen(true); setMobileCanvas(false); setPanel("decor"); }} />
          <DesignerTool active={panel === "assets"} label={copy.assets} icon={<Layers3 className="h-4 w-4" />} onClick={() => { setInspectorOpen(true); setMobileCanvas(false); setPanel("assets"); }} />
          <DesignerTool active={panel === "text"} label={copy.text} icon={<TextCursorInput className="h-4 w-4" />} onClick={() => { setInspectorOpen(true); setMobileCanvas(false); setPanel("text"); }} />
          <DesignerTool active={panel === "music"} label={copy.music} icon={<Music2 className="h-4 w-4" />} onClick={() => { setInspectorOpen(true); setMobileCanvas(false); setPanel("music"); }} />
        </nav>

        <aside className="dc-studio-inspector" aria-label="Pengaturan desain">
          <fieldset disabled={!invitation || saving} className="min-w-0 border-0 p-0 disabled:opacity-50">
          {panel === "template" && <TemplatePanel selected={design.template} onSelect={selectTemplate} templates={catalog} />}
          {panel === "sections" && (
            <ContentPanel
              sections={design.sections}
              onChange={setSection}
              onSelectSection={focusContentSection}
              onSelectElement={focusContentElement}
            />
          )}
          {panel === "color" && design.template === "romantic-rose" && <p className="text-sm leading-7 text-muted-foreground">Warna Romantic Rose mengikuti desain asli tema.</p>}
          {panel === "color" && design.template !== "romantic-rose" && <ColorPanel selected={design.palette} onSelect={(value) => change({ palette: value })} />}
          {panel === "font" && design.template === "romantic-rose" && <p className="text-sm leading-7 text-muted-foreground">Font Romantic Rose mengikuti desain asli tema.</p>}
          {panel === "font" && design.template !== "romantic-rose" && <FontPanel selected={design.font} onSelect={(value) => change({ font: value })} />}
          {panel === "decor" && template && !template.usesPhotos ? (
            <div className="space-y-4 rounded-2xl border border-primary/25 bg-primary/5 p-5">
              <h2 className="font-[family-name:var(--font-dc-heading)] text-lg text-foreground">{copy.photoFree}</h2>
              <p className="text-sm leading-7 text-muted-foreground">Desain ini menggunakan tipografi dan ilustrasi, tanpa slot foto. Koleksi foto acara tetap tersimpan jika nanti kamu mengganti tema dengan foto.</p>
              <p className="text-xs text-primary">Pilih tema bertanda “Dengan foto” untuk mengatur cover, foto individu, dan galeri.</p>
            </div>
          ) : panel === "decor" && (
            <PhotoPanel
              photos={invitation?.assets ?? []}
              slots={photoSlots}
              assignments={design.photos}
              activeSlot={activePhotoSlot}
              onActiveSlotChange={setActivePhotoSlot}
              onSetPhoto={setPhoto}
              onToggleGallery={toggleGalleryPhoto}
              onSetFocus={setPhotoFocus}
              onUpload={(file) => uploadAsset(file, "IMAGE")}
            />
          )}
          {panel === "text" && <TextObjectPanel layers={design.layers} sections={design.sections} selectedId={selectedLayerId} onAdd={addTextObject} onSelect={focusDesignObject} />}
          {panel === "assets" && <AssetPanel layers={design.layers} templateKey={design.template} onAdd={addAssetLayer} onDragAssetStart={beginAssetDrag} onDragAssetEnd={endAssetDrag} />}
          {panel === "music" && <MusicPanel musicUrl={musicUrl} defaultTrack={getInvitationDefaultMusic(design.template).title} defaultUrl={getInvitationDefaultMusic(design.template).url} assets={invitation?.assets ?? []} busy={audioBusy || saving} setMusicUrl={setMusicUrl} onUpload={(file) => uploadAsset(file, "AUDIO")} onDelete={deleteMusic} />}
          </fieldset>
        </aside>

        <div className="dc-studio-canvas" onKeyDown={(event) => {
          if (!invitation || saving || audioBusy || !(event.ctrlKey || event.metaKey) || event.altKey || event.nativeEvent.isComposing) return;
          const target = event.target;
          if (target instanceof Element && target.closest('input, textarea, select, [contenteditable="true"], [role="textbox"]')) return;
          const key = event.key.toLowerCase();
          const isUndo = key === "z" && !event.shiftKey;
          const isRedo = (key === "z" && event.shiftKey) || (key === "y" && !event.shiftKey);
          if (isUndo && history.length) { event.preventDefault(); undo(); }
          if (isRedo && future.length) { event.preventDefault(); redo(); }
        }}>
          <div className="dc-studio-canvas-toolbar">
            <button type="button" className="dc-studio-icon dc-studio-panel-toggle" onClick={() => setInspectorOpen(!inspectorOpen)} aria-label={inspectorOpen ? copy.hidePanel : copy.showPanel} title={inspectorOpen ? copy.hidePanel : copy.showPanel}>
              {inspectorOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            </button>
            <span className="min-w-0 flex-1 truncate text-sm">{template?.name || "Studio"}</span>
            <Button size="icon-sm" onClick={restoreDefaults} disabled={!invitation || saving || audioBusy} aria-label={copy.replay} title={copy.defaultsHint}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <div className="dc-studio-history-actions" role="group" aria-label={locale === "en" ? "Design history" : "Riwayat desain"}>
              <Button size="icon-sm" onClick={undo} disabled={!invitation || saving || audioBusy || !history.length} aria-label={copy.undo} title={copy.undo}>
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button size="icon-sm" onClick={redo} disabled={!invitation || saving || audioBusy || !future.length} aria-label={copy.redo} title={copy.redo}>
                <Redo2 className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={save} disabled={saving || audioBusy || !invitation} size="sm">
              <Save className="h-4 w-4" />
              {saving ? copy.saving : copy.save}
            </Button>
          </div>
          <div ref={canvasScrollRef} className="dc-studio-canvas-scroll" tabIndex={0} aria-label={locale === "en" ? "Invitation canvas" : "Kanvas undangan"} onPointerDown={(event) => {
            const target = event.target;
            if (target instanceof Element && !target.closest('input, textarea, select, button, a, [contenteditable="true"], [role="textbox"]')) event.currentTarget.focus({ preventScroll: true });
          }} onClick={(event) => {
            const target = event.target;
            if (!(target instanceof Element)) return;
            const rsvpElement = target.closest<HTMLElement>("[data-studio-rsvp-element]");
            if (rsvpElement?.dataset.studioRsvpElement) {
              setSelectedLayerId(null);
              setSelectedSectionKey(null);
              setSelectedSectionInstanceId(null);
              setSelectedCopyField(null);
              setSelectedSectionElement(null);
              setSelectedRsvpElementKey(rsvpElement.dataset.studioRsvpElement);
              return;
            }

            const sectionElement = target.closest<HTMLElement>("[data-studio-section-element]");
            if (sectionElement?.dataset.studioSectionElement) {
              const [section, kind] = sectionElement.dataset.studioSectionElement.split(":");
              if ((kind === "input" || kind === "button") && section) {
                setSelectedLayerId(null);
                setSelectedSectionKey(null);
                setSelectedSectionInstanceId(null);
                setSelectedRsvpElementKey(null);
                setSelectedCopyField(null);
                setSelectedSectionElement({ section: section as InvitationSectionKey, kind });
                return;
              }
            }

            const copyElement = target.closest<HTMLElement>("[data-studio-copy-field]");
            if (copyElement?.dataset.studioCopyField) {
              setSelectedLayerId(null);
              setSelectedSectionKey(null);
              setSelectedSectionInstanceId(null);
              setSelectedRsvpElementKey(null);
              setSelectedSectionElement(null);
              setSelectedCopyField(copyElement.dataset.studioCopyField as EditableInvitationCopyField);
              return;
            }

            if (target.closest("[data-studio-design-object], .dc-studio-layer-side, .dc-studio-section-side, button, a, input, select, textarea, [contenteditable], [role=button]")) return;
            const section = target.closest<HTMLElement>("[data-invitation-section]");
            if (section?.dataset.invitationSection) {
              if (section.dataset.invitationSection === "rsvp" && target.closest("img")) {
                setSelectedLayerId(null);
                setSelectedSectionKey(null);
                setSelectedRsvpElementKey(null);
    setSelectedCopyField(null);
    setSelectedSectionElement(null);
                return;
              }
              const instance = target.closest<HTMLElement>("[data-section-instance-id]");
              const sectionKey = section.dataset.invitationSection as InvitationSectionKey;
              selectSectionInstance(instance?.dataset.sectionInstanceId || sectionKey, sectionKey);
              return;
            }
            // Empty canvas/preview space is a deselect target; do not touch content or persisted layers.
            if (target.closest(".dc-studio-preview-surface") || target === event.currentTarget || target.closest(".dc-studio-preview-workspace")) {
              setSelectedLayerId(null);
              setSelectedSectionKey(null);
              setSelectedSectionInstanceId(null);
              setSelectedRsvpElementKey(null);
    setSelectedCopyField(null);
    setSelectedSectionElement(null);
            }
          }} onDragOver={onAssetDragOver} onDrop={onAssetDrop} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setAssetDropReady(false); }}>
          <div className="dc-studio-canvas-layout">
            <aside className="dc-studio-layer-list" aria-label={locale === "en" ? "Asset list" : "Daftar aset"}>
              <div className="dc-studio-layer-list-head">{locale === "en" ? "Assets" : "Asset"} {design.layers.length}/{MAX_ASSET_LAYERS}</div>
              <div className="dc-studio-layer-list-items">
                {[...design.layers].reverse().map((layer) => {
                  const assetNumber = design.layers.indexOf(layer) + 1;
                  return (
                    <button
                      key={layer.id}
                      type="button"
                      aria-pressed={selectedLayerId === layer.id}
                      onClick={() => focusDesignObject(layer.id)}
                      title={`Asset ${assetNumber}/${MAX_ASSET_LAYERS}`}
                    >
                      Asset {assetNumber}/{MAX_ASSET_LAYERS}
                    </button>
                  );
                })}
              </div>
            </aside>

            <div className="dc-studio-preview-workspace">
              <div className="dc-studio-stage-controls" role="group" aria-label={locale === "en" ? "Invitation view" : "Tampilan undangan"}>
                {design.sections.envelope !== false && <button type="button"
                  aria-pressed={canvasStage === "envelope"}
                  className={`min-h-9 shrink-0 rounded-[var(--dc-control-radius)] border border-primary/50 px-2.5 text-[11px] ${canvasStage === "envelope" ? "bg-[#C07A84] text-white hover:bg-[#A65E69] dark:text-black dark:hover:bg-[#D9A3AA]" : "bg-[#C07A84] text-white hover:bg-[#A65E69] dark:text-black dark:hover:bg-[#D9A3AA]"}`}
                  onClick={() => { setCanvasStage("envelope"); setPreviewVersion((value) => value + 1); }}
                  title={copy.envelopeHint}
                >{copy.envelope}</button>}
                <button type="button"
                  aria-pressed={canvasStage === "cover" || design.sections.envelope === false}
                  className={`min-h-9 shrink-0 rounded-[var(--dc-control-radius)] border border-primary/50 px-2.5 text-[11px] ${canvasStage === "cover" || design.sections.envelope === false ? "bg-[#C07A84] text-white hover:bg-[#A65E69] dark:text-black dark:hover:bg-[#D9A3AA]" : "bg-[#C07A84] text-white hover:bg-[#A65E69] dark:text-black dark:hover:bg-[#D9A3AA]"}`}
                  onClick={() => setCanvasStage("cover")}
                  title={copy.coverHint}
                >{copy.cover}</button>
              </div>
              <div className="dc-studio-preview-surface" data-asset-drop={assetDropReady}>
                <div key={`${design.template}-${design.sections.envelope !== false}-${previewVersion}`}>
                  <InvitationPreview
                    invitation={invitation}
                    templateKey={design.template}
                    palette={palette}
                    fontPair={fontPair}
                    decorUrl={design.decor}
                    eventTag={eventTag}
                    dressCode={dressCode}
                    sections={canvasStage === "cover" ? { ...design.sections, envelope: false } : design.sections}
                    photoAssignments={design.photos}
                    designKey={designKey}
                    musicUrl={musicUrl}
                    selectedAssetLayerId={selectedLayerId}
                    onSelectAssetLayer={(id) => { setSelectedSectionKey(null); setSelectedRsvpElementKey(null); setSelectedCopyField(null); setSelectedSectionElement(null); setSelectedLayerId(id); }}
                    onMoveAssetLayer={(id, x, y) => updateAssetLayer(id, { x, y })}
                    onUpdateAssetLayer={updateAssetLayer}
                    onEditPhoto={editPhotoFromCanvas}
                    onEnvelopeOpened={handleCanvasEnvelopeOpened}
                    selectedSectionInstanceId={selectedSectionInstanceId}
                    onSelectSectionInstance={selectSectionInstance}
                    onMoveSectionInstance={moveSectionInstance}
                    onToggleSectionInstance={toggleSectionInstance}
                    onDuplicateSectionInstance={duplicateSectionInstance}
                    onDeleteSectionInstance={deleteSectionInstance}
                  />
                </div>
              </div>
            </div>

            {selectedAssetLayer ? (
              <AssetLayerInspector
                locale={locale}
                selectedAssetLayer={selectedAssetLayer}
                selectedAssetIndex={selectedAssetIndex}
                layerCount={design.layers.length}
                sections={design.sections}
                onDeselect={() => setSelectedLayerId(null)}
                onUpdate={updateAssetLayer}
                onPosition={positionAssetLayer}
              />
            ) : selectedRsvpElementKey ? (
              <RsvpElementInspector
                locale={locale}
                elementKey={selectedRsvpElementKey}
                config={design.rsvpConfig}
                eventCategory={invitation?.eventCategory ?? ""}
                onConfig={updateRsvpConfig}
                onAddRsvpField={addRsvpCustomField}
                onUpdateRsvpField={updateRsvpCustomField}
                onRemoveRsvpField={removeRsvpCustomField}
                onClose={() => setSelectedRsvpElementKey(null)}
              />
            ) : selectedSectionElement ? (
              <SectionElementInspector
                locale={locale}
                section={selectedSectionElement.section}
                kind={selectedSectionElement.kind}
                styles={design.sectionElementStyles}
                onChange={updateSectionElementStyles}
                onClose={() => setSelectedSectionElement(null)}
              />
            ) : selectedCopyField ? (
              <CopyTextInspector
                locale={locale}
                field={selectedCopyField}
                value={design.copy[selectedCopyField] ?? invitationCopyDefaults(design.template, invitation?.description)[selectedCopyField] ?? ""}
                defaultValue={invitationCopyDefaults(design.template, invitation?.description)[selectedCopyField] ?? ""}
                onChange={(value) => setNarrativeCopy(selectedCopyField, value)}
                onReset={() => resetNarrativeCopy(selectedCopyField)}
                onClose={() => setSelectedCopyField(null)}
              />
            ) : selectedSectionKey ? (
              <SectionInspector
                locale={locale}
                sectionKey={selectedSectionKey}
                style={design.sectionStyles[selectedSectionKey]}
                onUpdate={(patch) => updateSectionStyle(selectedSectionKey, patch)}
                onReset={() => resetSectionStyle(selectedSectionKey)}
                onClose={() => { setSelectedSectionKey(null); setSelectedSectionInstanceId(null); }}
              />
            ) : null}
          </div>
          </div>
        </div>
      </div>

      {notice && <footer className="dc-studio-status" role="status" aria-live="polite">{notice}</footer>}
    </section>
  );
}
