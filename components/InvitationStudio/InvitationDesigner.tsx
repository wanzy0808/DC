"use client";

import { useCallback, useEffect, useRef, useState, type DragEvent } from "react";
import {
  ImagePlus,
  Layers3,
  Type,
  LayoutTemplate,
  Music2,
  Palette,
  Redo2,
  Save,
  SlidersHorizontal,
  Undo2,
  RotateCcw,
  PanelLeftClose,
  PanelLeftOpen,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { audioUploadError } from "@/lib/invitations/audio-limits";
import { defaultInvitationSections } from "@/lib/templates/sections";
import { invitationCopyDefaults, type EditableInvitationCopyField } from "@/lib/templates/editable-copy";
import type { EditableCopyMotion } from "@/lib/templates/editable-copy-motion";
import { Button } from "@/components/ui/button";
import { useTemplateCatalog } from "@/lib/templates/use-template-catalog";
import { defaultPhotoAssignments, type CroppablePhotoSlot, type PhotoCrop, type PhotoFocus, type PhotoMotion, type PhotoSlot } from "@/lib/templates/photo-slots";
import { getEventCategory } from "@/lib/events/catalog";
import PhotoPanel from "@/components/InvitationStudio/PhotoPanel";
import AssetPanel from "@/components/InvitationStudio/AssetPanel";
import TextObjectPanel from "@/components/InvitationStudio/TextObjectPanel";
import TextLayerInspector from "@/components/InvitationStudio/TextLayerInspector";
import AssetLayerInspector from "@/components/InvitationStudio/AssetLayerInspector";
import SectionInspector from "@/components/InvitationStudio/SectionInspector";
import PhotoSlotInspector from "@/components/InvitationStudio/PhotoSlotInspector";
import RsvpElementInspector from "@/components/InvitationStudio/RsvpElementInspector";
import CopyTextInspector from "@/components/InvitationStudio/CopyTextInspector";
import SectionElementInspector from "@/components/InvitationStudio/SectionElementInspector";
import { isTemplateIllustration, MAX_ASSET_LAYERS, studioObjectSections, type StudioObjectSection, type InvitationAssetLayer, type InvitationShapeKind } from "@/lib/templates/asset-layers";
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
import {
  positionAssetLayers,
  reorderAssetLayers,
  type AssetLayerPosition,
} from "@/components/InvitationStudio/designer-layer-order";
import {
  createStudioTemplate,
  deleteStudioAsset,
  loadStudioInvitation,
  makeStudioSavedState,
  makeStudioServerRevision,
  saveStudioInvitation,
  uploadStudioAsset,
} from "@/components/InvitationStudio/designer-persistence";
import { useStudioCanvasPan } from "@/components/InvitationStudio/useStudioCanvasPan";
import type {
  InvitationDesignerInvitation,
  InvitationDesignerPanel,
  InvitationDesignState,
} from "@/components/InvitationStudio/designer-types";
import { templateDemoInvitation, templateDemoPhoto } from "@/data/templates/preview-invitation";

export default function InvitationDesigner({ mode = "invitation" }: { mode?: "invitation" | "template" }) {
  const { locale } = useLanguage();
  const templateMode = mode === "template";
  const copy = locale === "en" ? {
    unsaved: "Unsaved changes", saved: "Design saved", empty: "Design not saved",
    defaults: "Restore Defaults", defaultsHint: "Return this template to its original design state. Uploaded files stay in your media library.",
    undo: "Undo design", redo: "Redo design", saving: "Saving...", save: "Save",
    settings: "Settings", invitation: "Invitation", tools: "Design tools",
    sections: "Content", colors: "Colors", photos: "Photos", music: "Music", assets: "Assets", text: "Text",
    envelope: "Envelope", cover: "Content",
    showPanel: "Show panel", hidePanel: "Hide panel", replay: "Restart from the beginning",
    envelopeHint: "Open the digital envelope in the canvas", coverHint: "Show invitation content without changing the saved envelope setting",
    photoFree: "Photo-free theme", retry: "Try Again",
  } : {
    unsaved: "Perubahan belum disimpan", saved: "Desain tersimpan", empty: "Belum ada desain tersimpan",
    defaults: "Kembalikan ke Default", defaultsHint: "Kembalikan template ke kondisi desain awal. File upload tetap tersimpan di koleksi media.",
    undo: "Urungkan desain", redo: "Ulangi desain", saving: "Menyimpan...", save: "Simpan",
    settings: "Pengaturan", invitation: "Undangan", tools: "Alat desain",
    sections: "Isi", colors: "Warna", photos: "Foto", music: "Musik", assets: "Aset", text: "Teks",
    envelope: "Amplop", cover: "Isi",
    showPanel: "Tampilkan panel", hidePanel: "Sembunyikan panel", replay: "Ulangi dari awal",
    envelopeHint: "Tampilkan dan coba animasi Amplop Digital di canvas", coverHint: "Lihat isi undangan tanpa mengubah pengaturan Amplop",
    photoFree: "Tema tanpa foto", retry: "Coba Lagi",
  };
  const catalog = useTemplateCatalog();
  const readyTemplates = catalog.filter((item) => item.ready);
  const [selectedCatalogKey, setSelectedCatalogKey] = useState("botanical-ivory");
  const [invitation, setInvitation] = useState<InvitationDesignerInvitation | null>(null);
  const [panel, setPanel] = useState<InvitationDesignerPanel>("template");
  const [activePhotoSlot, setActivePhotoSlot] = useState<PhotoSlot>("cover");
  const [cropModeSlot, setCropModeSlot] = useState<CroppablePhotoSlot | null>(null);
  const [selectedPhotoSlot, setSelectedPhotoSlot] = useState<PhotoSlot | null>(null);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [selectedLayerIds, setSelectedLayerIds] = useState<string[]>([]);
  const [selectedSectionKey, setSelectedSectionKey] = useState<InvitationSectionKey | null>(null);
  const [selectedSectionInstanceId, setSelectedSectionInstanceId] = useState<string | null>(null);
  const [selectedRsvpElementKey, setSelectedRsvpElementKey] = useState<string | null>(null);
  const [selectedCopyField, setSelectedCopyField] = useState<EditableInvitationCopyField | null>(null);
  const [selectedSectionElement, setSelectedSectionElement] = useState<{ section: InvitationSectionKey; kind: StudioSectionElementKind } | null>(null);
  const [copiedAssetLayer, setCopiedAssetLayer] = useState<InvitationAssetLayer | null>(null);
  const [copiedAssetLayers, setCopiedAssetLayers] = useState<InvitationAssetLayer[]>([]);
  const draggedAssetSrc = useRef<string | null>(null);
  const [assetDropReady, setAssetDropReady] = useState(false);
  const [layerDragOverId, setLayerDragOverId] = useState<string | null>(null);
  const canvasScrollRef = useRef<HTMLDivElement>(null);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [mobileCanvas, setMobileCanvas] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(0);
  const [canvasStage, setCanvasStage] = useState<"envelope" | "cover">("envelope");
  const [canvasZoom, setCanvasZoom] = useState(1);
  const {
    canvasPanReady,
    canvasPanning,
    setCanvasPanReady,
    beginCanvasPan,
    moveCanvasPan,
    endCanvasPan,
    consumeSuppressedCanvasClick,
  } = useStudioCanvasPan();
  // A click on the actual envelope advances the Studio stage selector, too.
  const handleCanvasEnvelopeOpened = useCallback(() => setCanvasStage("cover"), []);
  const [savedState, setSavedState] = useState("");
  const [serverRevision, setServerRevision] = useState("");
  const audioMutation = useRef(false);
  const requestedCatalogApplied = useRef(false);
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
    copyMotion: {},
    layers: [],
    sectionStyles: {},
    rsvpConfig: { ...defaultInvitationRsvpConfig, customFields: [], elementStyles: {} },
    sectionLayout: defaultInvitationSectionLayout.map((item) => ({ ...item })),
    sectionElementStyles: {},
  });

  async function load() {
    const params = new URLSearchParams(window.location.search);

    if (templateMode) {
      const requested = params.get("template")?.trim() || "botanical-ivory";
      const baseKey = invitationTemplatePresets[requested] ? requested : "botanical-ivory";
      const preset = invitationTemplatePresets[baseKey] || invitationTemplatePresets["botanical-ivory"];
      const initialKey = `${baseKey}::${preset.palette}::${preset.font}`;
      const loadedDesign = invitationDesignStateFromKey(initialKey, templateDemoPhoto);
      const defaultMusic = getInvitationDefaultMusic(baseKey).url;
      const demoInvitation: InvitationDesignerInvitation = {
        ...templateDemoInvitation,
        id: "template-studio-draft",
        templateKey: initialKey,
        accessPaid: true,
      };
      const serverBaseline = JSON.stringify(["template-studio", initialKey, defaultMusic]);
      const canonicalSavedState = JSON.stringify([makeInvitationDesignStateKey(loadedDesign), defaultMusic, "", ""]);
      const navigationType = (window.performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined)?.type ?? "navigate";
      const historyState = window.history.state as Record<string, unknown> | null;
      const sameStudioEntry = historyState?.__dcStudioDraftEntry === demoInvitation.id;
      let refreshed: [string, string, string, string] | null = null;
      try {
        const raw = window.sessionStorage.getItem(STUDIO_REFRESH_DRAFT_KEY);
        refreshed = recoverStudioRefreshDraft(raw, sameStudioEntry ? navigationType : "navigate", demoInvitation.id, serverBaseline);
        if (!refreshed) window.sessionStorage.removeItem(STUDIO_REFRESH_DRAFT_KEY);
        if (!sameStudioEntry) window.history.replaceState({ ...historyState, __dcStudioDraftEntry: demoInvitation.id }, "", window.location.href);
      } catch { /* Optional refresh draft. */ }

      setInvitation(demoInvitation);
      setDesign(refreshed ? invitationDesignStateFromKey(refreshed[0], templateDemoPhoto) : loadedDesign);
      setMusicUrl(refreshed ? refreshed[1] : defaultMusic);
      setEventTag("");
      setDressCode("");
      setSavedState(canonicalSavedState);
      setServerRevision(serverBaseline);
      setSelectedCatalogKey(baseKey);
      setCanvasStage("envelope");
      setSelectedLayerId(null);
      setCopiedAssetLayer(null);
      setCopiedAssetLayers([]);
      setHistory([]);
      setFuture([]);
      setNotice("");
      return;
    }

    const invitationId = params.get("invitationId")?.trim() || "";
    const legacyType =
      params.get("type") === "ADAT_AKAD" ? "ADAT_AKAD" : "WEDDING";
    if (!invitationId) throw new Error("Pilih acara dari Dashboard untuk membuka Studio.");
    const next = await loadStudioInvitation(invitationId, legacyType);
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
      ? { ...loadedDesign, template: requestedTheme, palette: requestedPreset.palette, font: requestedPreset.font, copy: {}, copyMotion: {}, layers: [], sectionStyles: {}, rsvpConfig: { ...defaultInvitationRsvpConfig, customFields: [], elementStyles: {} }, sectionLayout: defaultInvitationSectionLayout.map((item) => ({ ...item })), sectionElementStyles: {} }
      : loadedDesign;
    // Use actual persisted fields for cache identity; fallback photo URLs can change after an upload.
    const serverBaseline = makeStudioServerRevision(next);
    const canonicalSavedState = makeStudioSavedState(makeInvitationDesignStateKey(loadedDesign), next.musicUrl || "", next.weddingHashtag || "", next.dressCode || "");
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
    setSelectedCatalogKey(requestedTheme && requestedPreset ? requestedTheme : loadedDesign.template);
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
      setCopiedAssetLayers([]);
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
  useEffect(() => {
    if (templateMode || !invitation || requestedCatalogApplied.current) return;
    const requested = new URLSearchParams(window.location.search).get("template")?.trim() || "";
    if (!requested.startsWith("designer:")) return;
    const available = readyTemplates.find((item) => item.key === requested && item.designKey);
    if (!available) return;
    requestedCatalogApplied.current = true;
    selectTemplate(requested);
    setNotice("Template dipilih. Klik Simpan untuk menerapkan.");
  }, [catalog, invitation, templateMode]);


  const template =
    readyTemplates.find((item) => item.key === design.template) ||
    readyTemplates[0];
  const palette = invitationPalettes[design.palette];
  const fontPair = invitationFonts[design.font];
  const designKey = makeInvitationDesignStateKey(design);
  const selectedAssetLayer = design.layers.find((layer) => layer.id === selectedLayerId);
  const selectedAssetIndex = design.layers.findIndex((layer) => layer.id === selectedLayerId);
  const selectedAssetLayers = design.layers.filter((layer) => selectedLayerIds.includes(layer.id));
  const textTargetSection: StudioObjectSection =
    selectedSectionKey && studioObjectSections.includes(selectedSectionKey as StudioObjectSection) && design.sections[selectedSectionKey] !== false
      ? selectedSectionKey as StudioObjectSection
      : selectedAssetLayer?.section ?? "cover";
  const identity = getInvitationEventIdentity(invitation);
  const currentState = makeStudioSavedState(designKey, musicUrl, eventTag, dressCode);
  const dirty = Boolean(invitation && savedState !== currentState);
  useEffect(() => {
    if (!selectedLayerId) {
      if (selectedLayerIds.length) setSelectedLayerIds([]);
      return;
    }
    if (!selectedLayerIds.includes(selectedLayerId)) setSelectedLayerIds([selectedLayerId]);
  }, [selectedLayerId, selectedLayerIds]);

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
    const catalogTemplate = readyTemplates.find((item) => item.key === templateKey);
    if (!catalogTemplate) {
      setNotice("Template ini masih menunggu integrasi renderer.");
      return;
    }

    if (catalogTemplate.designKey) {
      const imported = invitationDesignStateFromKey(catalogTemplate.designKey, invitationDecorOptions[0]);
      change({
        ...imported,
        photos: {
          ...imported.photos,
          cover: null,
          personOne: null,
          personTwo: null,
          gallery: null,
        },
      });
      setMusicUrl(catalogTemplate.musicUrl || getInvitationDefaultMusic(imported.template).url);
    } else {
      const preset = invitationTemplatePresets[templateKey] || invitationTemplatePresets["botanical-ivory"];
      change({
        template: templateKey,
        palette: preset.palette,
        font: preset.font,
        copy: templateKey === design.template ? design.copy : {},
        copyMotion: templateKey === design.template ? design.copyMotion : {},
        layers: templateKey === design.template ? design.layers : [],
        sectionStyles: templateKey === design.template ? design.sectionStyles : {},
        rsvpConfig: templateKey === design.template ? design.rsvpConfig : { ...defaultInvitationRsvpConfig, customFields: [], elementStyles: {} },
        sectionLayout: templateKey === design.template ? design.sectionLayout : defaultInvitationSectionLayout.map((item) => ({ ...item })),
        sectionElementStyles: templateKey === design.template ? design.sectionElementStyles : {},
      });
      setMusicUrl(getInvitationDefaultMusic(templateKey).url);
    }

    setSelectedCatalogKey(templateKey);
    rememberTemplateSelection(templateKey);
    const location = new URL(window.location.href);
    location.searchParams.set("template", templateKey);
    window.history.replaceState(window.history.state, "", location.pathname + location.search + location.hash);
    setActivePhotoSlot("cover");
    setSelectedPhotoSlot(null);
    setSelectedLayerId(null);
    setSelectedSectionKey(null);
    setSelectedSectionInstanceId(null);
    setSelectedRsvpElementKey(null);
    setSelectedCopyField(null);
    setSelectedSectionElement(null);
    setCopiedAssetLayer(null);
      setCopiedAssetLayers([]);
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
      copyMotion: {},
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
      setCopiedAssetLayers([]);
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
      await deleteStudioAsset(id);
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
    setSelectedPhotoSlot(null);
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
    setSelectedPhotoSlot(null);
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
    change({ photos: { ...design.photos, [slot]: id, crop: { ...design.photos.crop, [slot]: null } } });
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
    change({ photos: { ...design.photos, focus: { ...design.photos.focus, [slot]: focus }, crop: { ...design.photos.crop, [slot]: null } } });
  }

  function setPhotoCrop(slot: "cover" | "personOne" | "personTwo", crop: PhotoCrop) {
    change({ photos: { ...design.photos, crop: { ...design.photos.crop, [slot]: crop } } });
  }

  function resetPhotoCrop(slot: "cover" | "personOne" | "personTwo") {
    change({ photos: { ...design.photos, crop: { ...design.photos.crop, [slot]: null } } });
  }

  function updatePhotoMotion(slot: PhotoSlot, patch: Partial<PhotoMotion>) {
    const current = design.photos.motion?.[slot] ?? {};
    const next: PhotoMotion = { ...current, ...patch };
    for (const [key, value] of Object.entries(next)) {
      if (value === undefined) delete (next as Record<string, unknown>)[key];
    }
    const motion = { ...(design.photos.motion ?? {}) };
    if ((next.animation && next.animation !== "none") || (next.parallax ?? 0) > 0) motion[slot] = next;
    else delete motion[slot];
    change({ photos: { ...design.photos, motion } });
  }

  function resetPhotoMotion(slot: PhotoSlot) {
    if (!design.photos.motion?.[slot]) return;
    const motion = { ...design.photos.motion };
    delete motion[slot];
    change({ photos: { ...design.photos, motion } });
  }

  function selectPhotoVisual(slot: PhotoSlot) {
    setActivePhotoSlot(slot);
    setSelectedLayerIds([]);
    setSelectedLayerId(null);
    setSelectedSectionKey(null);
    setSelectedSectionInstanceId(null);
    setSelectedRsvpElementKey(null);
    setSelectedCopyField(null);
    setSelectedSectionElement(null);
    setSelectedPhotoSlot(slot);
  }

  function editPhotoFromCanvas(slot: PhotoSlot) {
    selectPhotoVisual(slot);
    setCropModeSlot(slot === "gallery" ? null : slot);
    setPanel("decor");
    setInspectorOpen(true);
    setMobileCanvas(false);
  }

  function fitCanvasZoom() {
    const scroller = canvasScrollRef.current;
    const surface = scroller?.querySelector<HTMLElement>(".dc-studio-preview-surface");
    if (!scroller || !surface) return;
    const rect = surface.getBoundingClientRect();
    const naturalWidth = rect.width / Math.max(canvasZoom, 0.01);
    if (!naturalWidth) return;
    const availableWidth = Math.max(1, scroller.clientWidth - 32);
    const next = Math.min(1.3, Math.max(0.7, availableWidth / naturalWidth));
    setCanvasZoom(Math.round(next * 10) / 10);
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
    setSelectedPhotoSlot(null);
    setSelectedLayerId(id);
    showDesignSection(section);
    setInspectorOpen(true);
  }

  function addShapeObject(shape: InvitationShapeKind) {
    const section = textTargetSection;
    if (design.layers.length >= MAX_ASSET_LAYERS || design.sections[section] === false) return;
    const id = crypto.randomUUID().replace(/-/g, "");
    const accent = palette?.accent ?? "#C07A84";
    const size = shape === "circle" ? 28 : shape === "line" ? 42 : 38;
    const height = shape === "circle" ? 28 : shape === "line" ? 3 : 22;
    change({ layers: [...design.layers, {
      id,
      kind: "shape",
      shape,
      src: "",
      section,
      x: 50,
      y: 42,
      width: size,
      height,
      opacity: 1,
      rotation: 0,
      fill: accent,
      stroke: accent,
      strokeWidth: shape === "line" ? 2 : 0,
      radius: shape === "circle" ? 100 : 0,
      name: shape === "rectangle" ? "Rectangle" : shape === "circle" ? "Circle" : "Line",
    }] });
    setSelectedPhotoSlot(null);
    setSelectedLayerIds([id]);
    setSelectedLayerId(id);
    showDesignSection(section);
    setPanel("assets");
    setInspectorOpen(true);
  }

  function addTextObject(text: string, section: StudioObjectSection) {
    if (!text.trim() || design.layers.length >= MAX_ASSET_LAYERS || design.sections[section] === false) return;
    const id = crypto.randomUUID().replace(/-/g, "");
    change({ layers: [...design.layers, {
      id, kind: "text", src: "", text: text.slice(0, 180), section, x: 50, y: 48, width: 55,
      opacity: 1, fontSize: 24, fontRole: "heading", fontWeight: 400, textAlign: "center",
      letterSpacing: 0, lineHeight: 1.2, color: palette?.accent ?? "#C07A84", rotation: 0,
    }] });
    setSelectedPhotoSlot(null);
    setSelectedLayerId(id);
    showDesignSection(section);
    setPanel("text");
    setInspectorOpen(true);
    requestAnimationFrame(() => canvasScrollRef.current?.querySelector(`[data-invitation-section="${section}"]`)?.scrollIntoView({ block: "center" }));
  }

  function focusDesignObject(id: string, additive = false) {
    const layer = design.layers.find((item) => item.id === id);
    if (!layer) return;
    const targetIds = layer.groupId
      ? design.layers.filter((item) => item.groupId === layer.groupId).map((item) => item.id)
      : [id];
    const allSelected = targetIds.every((targetId) => selectedLayerIds.includes(targetId));
    const keepExistingMultiSelection = !additive
      && !layer.groupId
      && selectedLayerIds.length > 1
      && selectedLayerIds.includes(id);
    const nextIds = keepExistingMultiSelection
      ? selectedLayerIds
      : additive
        ? allSelected
          ? selectedLayerIds.filter((targetId) => !targetIds.includes(targetId))
          : [...new Set([...selectedLayerIds, ...targetIds])]
        : targetIds;
    setSelectedSectionKey(null);
    setSelectedSectionInstanceId(null);
    setSelectedRsvpElementKey(null);
    setSelectedCopyField(null);
    setSelectedSectionElement(null);
    setSelectedPhotoSlot(null);
    setCropModeSlot(null);
    setSelectedLayerIds(nextIds);
    setSelectedLayerId(nextIds.includes(id) ? id : nextIds.at(-1) ?? null);
    showDesignSection(layer.section ?? "cover");
    requestAnimationFrame(() => canvasScrollRef.current?.querySelector(`[data-invitation-section="${layer.section ?? "cover"}"]`)?.scrollIntoView({ block: "center" }));
  }

  function groupSelectedAssetLayers() {
    const candidates = selectedAssetLayers.filter((layer) => !layer.locked);
    if (candidates.length < 2) return;
    const section = candidates[0]?.section ?? "cover";
    if (candidates.some((layer) => (layer.section ?? "cover") !== section)) {
      setNotice(locale === "en" ? "Group layers inside the same section." : "Group hanya untuk layer dalam section yang sama.");
      return;
    }
    const groupId = `group-${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
    const ids = new Set(candidates.map((layer) => layer.id));
    change({ layers: design.layers.map((layer) => ids.has(layer.id) ? { ...layer, groupId } : layer) });
    setSelectedLayerIds(candidates.map((layer) => layer.id));
    setSelectedLayerId(candidates.at(-1)?.id ?? null);
  }

  function ungroupSelectedAssetLayers() {
    const groupIds = new Set(selectedAssetLayers.map((layer) => layer.groupId).filter((value): value is string => Boolean(value)));
    if (!groupIds.size) return;
    change({
      layers: design.layers.map((layer) => {
        if (!layer.groupId || !groupIds.has(layer.groupId) || layer.locked) return layer;
        const next = { ...layer };
        delete next.groupId;
        return next;
      }),
    });
  }

  function selectedLayerGeometry(minimum: number) {
    const candidates = selectedAssetLayers.filter((layer) => !layer.locked && !layer.hidden);
    if (candidates.length < minimum) return null;
    const section = candidates[0]?.section ?? "cover";
    if (candidates.some((layer) => (layer.section ?? "cover") !== section)) {
      setNotice(locale === "en" ? "Align layers inside the same section." : "Align hanya untuk layer dalam section yang sama.");
      return null;
    }
    const sectionNode = canvasScrollRef.current?.querySelector<HTMLElement>(`[data-invitation-section="${section}"]`);
    const sectionRect = sectionNode?.getBoundingClientRect();
    if (!sectionRect?.width || !sectionRect.height) return null;
    const items = candidates.flatMap((layer) => {
      const node = canvasScrollRef.current?.querySelector<HTMLElement>(`[data-studio-design-object="${CSS.escape(layer.id)}"]`);
      const rect = node?.getBoundingClientRect();
      return rect?.width && rect.height ? [{ layer, rect }] : [];
    });
    return items.length >= minimum ? { items, sectionRect } : null;
  }

  function alignSelectedAssetLayers(mode: "left" | "center-x" | "right" | "top" | "center-y" | "bottom") {
    const geometry = selectedLayerGeometry(2);
    if (!geometry) return;
    const { items, sectionRect } = geometry;
    const left = Math.min(...items.map(({ rect }) => rect.left));
    const right = Math.max(...items.map(({ rect }) => rect.right));
    const top = Math.min(...items.map(({ rect }) => rect.top));
    const bottom = Math.max(...items.map(({ rect }) => rect.bottom));
    const centerX = (left + right) / 2;
    const centerY = (top + bottom) / 2;
    const updates = new Map<string, { x?: number; y?: number }>();

    for (const { layer, rect } of items) {
      if (mode === "left") updates.set(layer.id, { x: layer.x + (left - rect.left) / sectionRect.width * 100 });
      else if (mode === "center-x") updates.set(layer.id, { x: layer.x + (centerX - (rect.left + rect.width / 2)) / sectionRect.width * 100 });
      else if (mode === "right") updates.set(layer.id, { x: layer.x + (right - rect.right) / sectionRect.width * 100 });
      else if (mode === "top") updates.set(layer.id, { y: layer.y + (top - rect.top) / sectionRect.height * 100 });
      else if (mode === "center-y") updates.set(layer.id, { y: layer.y + (centerY - (rect.top + rect.height / 2)) / sectionRect.height * 100 });
      else updates.set(layer.id, { y: layer.y + (bottom - rect.bottom) / sectionRect.height * 100 });
    }

    change({
      layers: design.layers.map((layer) => {
        const patch = updates.get(layer.id);
        if (!patch) return layer;
        return {
          ...layer,
          ...(patch.x === undefined ? {} : { x: Math.min(100, Math.max(0, patch.x)) }),
          ...(patch.y === undefined ? {} : { y: Math.min(100, Math.max(0, patch.y)) }),
        };
      }),
    });
  }

  function distributeSelectedAssetLayers(axis: "horizontal" | "vertical") {
    const geometry = selectedLayerGeometry(3);
    if (!geometry) return;
    const { items, sectionRect } = geometry;
    const sorted = [...items].sort((a, b) => axis === "horizontal"
      ? (a.rect.left + a.rect.width / 2) - (b.rect.left + b.rect.width / 2)
      : (a.rect.top + a.rect.height / 2) - (b.rect.top + b.rect.height / 2));
    const firstCenter = axis === "horizontal"
      ? sorted[0]!.rect.left + sorted[0]!.rect.width / 2
      : sorted[0]!.rect.top + sorted[0]!.rect.height / 2;
    const last = sorted.at(-1)!;
    const lastCenter = axis === "horizontal"
      ? last.rect.left + last.rect.width / 2
      : last.rect.top + last.rect.height / 2;
    const gap = (lastCenter - firstCenter) / (sorted.length - 1);
    const updates = new Map<string, { x?: number; y?: number }>();

    sorted.forEach(({ layer, rect }, index) => {
      const currentCenter = axis === "horizontal"
        ? rect.left + rect.width / 2
        : rect.top + rect.height / 2;
      const delta = firstCenter + gap * index - currentCenter;
      updates.set(layer.id, axis === "horizontal"
        ? { x: layer.x + delta / sectionRect.width * 100 }
        : { y: layer.y + delta / sectionRect.height * 100 });
    });

    change({
      layers: design.layers.map((layer) => {
        const patch = updates.get(layer.id);
        if (!patch) return layer;
        return {
          ...layer,
          ...(patch.x === undefined ? {} : { x: Math.min(100, Math.max(0, patch.x)) }),
          ...(patch.y === undefined ? {} : { y: Math.min(100, Math.max(0, patch.y)) }),
        };
      }),
    });
  }

  function currentClipboardSelection(includeLocked = true) {
    const ids = selectedLayerIds.length > 1
      ? new Set(selectedLayerIds)
      : selectedAssetLayer ? new Set([selectedAssetLayer.id]) : new Set<string>();
    return design.layers.filter((layer) => ids.has(layer.id) && (includeLocked || !layer.locked));
  }

  function copySelectedAssetLayer() {
    const selected = currentClipboardSelection(true);
    if (!selected.length) return;
    const copies = selected.map((layer) => ({ ...layer }));
    setCopiedAssetLayers(copies);
    setCopiedAssetLayer(copies.at(-1) ?? null);
  }

  function cloneAssetLayers(sourceLayers: InvitationAssetLayer[]) {
    const available = MAX_ASSET_LAYERS - design.layers.length;
    if (!sourceLayers.length || sourceLayers.length > available) {
      if (sourceLayers.length > available) {
        setNotice(locale === "en" ? "Not enough layer slots to paste all selected objects." : "Slot layer tidak cukup untuk menempel semua objek terpilih.");
      }
      return [] as InvitationAssetLayer[];
    }
    const groupIds = new Map<string, string>();
    return sourceLayers.map((source) => {
      const id = crypto.randomUUID().replace(/-/g, "");
      let groupId = source.groupId;
      if (groupId) {
        if (!groupIds.has(groupId)) groupIds.set(groupId, `group-${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`);
        groupId = groupIds.get(groupId);
      }
      return {
        ...source,
        id,
        ...(groupId ? { groupId } : { groupId: undefined }),
        x: Math.min(100, source.x + 5),
        y: Math.min(100, source.y + 5),
      };
    });
  }

  function pasteAssetLayer() {
    if (!invitation || saving) return;
    const source = copiedAssetLayers.length
      ? copiedAssetLayers
      : copiedAssetLayer ? [copiedAssetLayer] : [];
    const next = cloneAssetLayers(source);
    if (!next.length) return;
    change({ layers: [...design.layers, ...next] });
    const ids = next.map((layer) => layer.id);
    setSelectedLayerIds(ids);
    setSelectedLayerId(ids.at(-1) ?? null);
    showDesignSection(next[0]?.section ?? "cover");
  }

  function duplicateSelectedAssetLayer() {
    if (!invitation || saving) return;
    const source = currentClipboardSelection(false);
    const next = cloneAssetLayers(source);
    if (!next.length) return;
    change({ layers: [...design.layers, ...next] });
    const ids = next.map((layer) => layer.id);
    setSelectedLayerIds(ids);
    setSelectedLayerId(ids.at(-1) ?? null);
    showDesignSection(next[0]?.section ?? "cover");
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

  function updateCopyMotion(field: EditableInvitationCopyField, patch: Partial<EditableCopyMotion>) {
    const current = design.copyMotion[field] ?? {};
    const next: EditableCopyMotion = { ...current, ...patch };
    for (const [key, value] of Object.entries(next)) {
      if (value === undefined) delete (next as Record<string, unknown>)[key];
    }
    const copyMotion = { ...design.copyMotion };
    if (next.animation && next.animation !== "none") copyMotion[field] = next;
    else delete copyMotion[field];
    change({ copyMotion });
  }

  function resetCopyMotion(field: EditableInvitationCopyField) {
    if (!design.copyMotion[field]) return;
    const copyMotion = { ...design.copyMotion };
    delete copyMotion[field];
    change({ copyMotion });
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
    setCropModeSlot(null);
    setSelectedLayerId(null);
    setSelectedPhotoSlot(null);
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
    const source = design.layers.find((layer) => layer.id === id);
    if (!source) return;
    if (patch.section && (design.sections[patch.section] === false || !studioObjectSections.includes(patch.section))) return;

    const patchKeys = Object.keys(patch);
    const movingSelection = selectedLayerIds.length > 1
      && selectedLayerIds.includes(id)
      && patchKeys.length > 0
      && patchKeys.every((key) => key === "x" || key === "y")
      && !source.locked;

    if (movingSelection) {
      const dx = patch.x === undefined ? 0 : patch.x - source.x;
      const dy = patch.y === undefined ? 0 : patch.y - source.y;
      const sourceSection = source.section ?? "cover";
      const selected = new Set(selectedLayerIds);
      change({
        layers: design.layers.map((layer) => {
          if (!selected.has(layer.id) || layer.locked || (layer.section ?? "cover") !== sourceSection) return layer;
          return {
            ...layer,
            x: Math.min(100, Math.max(0, layer.x + dx)),
            y: Math.min(100, Math.max(0, layer.y + dy)),
          };
        }),
      });
      return;
    }

    change({ layers: design.layers.map((layer) => layer.id === id ? { ...layer, ...patch } : layer) });
    if (patch.section) {
      showDesignSection(patch.section);
      requestAnimationFrame(() => canvasScrollRef.current?.querySelector(`[data-invitation-section="${patch.section}"]`)?.scrollIntoView({ block: "center" }));
    }
  }

  function removeAssetLayer(id: string) {
    const selected = selectedLayerIds.includes(id) && selectedLayerIds.length > 1
      ? selectedLayerIds
      : [id];
    const removable = new Set(selected.filter((layerId) => !design.layers.find((layer) => layer.id === layerId)?.locked));
    if (!removable.size) return;
    change({ layers: design.layers.filter((layer) => !removable.has(layer.id)) });
    setSelectedLayerIds([]);
    setSelectedLayerId(null);
  }

  function reorderAssetLayer(sourceId: string, targetId: string) {
    const next = reorderAssetLayers(design.layers, sourceId, targetId);
    if (next === design.layers) return;
    change({ layers: next });
    setSelectedLayerIds([sourceId]);
    setSelectedLayerId(sourceId);
  }

  function positionAssetLayer(id: string, position: AssetLayerPosition) {
    const next = positionAssetLayers(design.layers, id, position);
    if (next === design.layers) return;
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
    const root = canvasScrollRef.current;
    if (!root) return;
    for (const node of root.querySelectorAll<HTMLElement>("[data-invitation-photo-slot]")) {
      if (node.dataset.invitationPhotoSlot === selectedPhotoSlot) node.dataset.studioPhotoSelected = "true";
      else delete node.dataset.studioPhotoSelected;
    }
  }, [selectedPhotoSlot, designKey, canvasStage, previewVersion]);


  useEffect(() => {
    function handleLayerShortcut(event: KeyboardEvent) {
      if (!invitation || saving || audioBusy || event.defaultPrevented || event.isComposing) return;
      const target = event.target;
      if (target instanceof Element && target.closest('input, textarea, select, [contenteditable="true"], [role="textbox"]')) return;
      if (!event.ctrlKey && !event.metaKey && !event.altKey && event.key === "Escape" && selectedPhotoSlot) {
        setSelectedPhotoSlot(null);
        return;
      }
      if (canvasStage !== "cover" || selectedPhotoSlot) return;
      const activeText = window.getSelection()?.toString();
      if (activeText) return;
      const modifier = event.ctrlKey || event.metaKey;
      const shortcutKey = event.key.toLowerCase();
      if (modifier && !event.altKey && !event.shiftKey && shortcutKey === "a") {
        event.preventDefault();
        const targetSection = selectedAssetLayer?.section ?? "cover";
        const ids = design.layers
          .filter((layer) => (layer.section ?? "cover") === targetSection && !layer.hidden)
          .map((layer) => layer.id);
        setSelectedLayerIds(ids);
        setSelectedLayerId(ids.at(-1) ?? null);
      } else if (modifier && !event.altKey && !event.shiftKey && shortcutKey === "g") {
        if (selectedLayerIds.length < 2) return;
        event.preventDefault();
        groupSelectedAssetLayers();
      } else if (modifier && !event.altKey && event.shiftKey && shortcutKey === "g") {
        if (!selectedAssetLayers.some((layer) => layer.groupId)) return;
        event.preventDefault();
        ungroupSelectedAssetLayers();
      } else if (modifier && !event.altKey && !event.shiftKey && shortcutKey === "c") {
        if (!selectedAssetLayer) return;
        event.preventDefault();
        copySelectedAssetLayer();
      } else if (modifier && !event.altKey && !event.shiftKey && shortcutKey === "x") {
        const cuttable = currentClipboardSelection(false);
        if (!cuttable.length) return;
        event.preventDefault();
        const copies = cuttable.map((layer) => ({ ...layer }));
        setCopiedAssetLayers(copies);
        setCopiedAssetLayer(copies.at(-1) ?? null);
        removeAssetLayer(cuttable.at(-1)!.id);
      } else if (modifier && !event.altKey && !event.shiftKey && shortcutKey === "v") {
        if ((!copiedAssetLayers.length && !copiedAssetLayer) || design.layers.length >= MAX_ASSET_LAYERS) return;
        event.preventDefault();
        pasteAssetLayer();
      } else if (modifier && !event.altKey && !event.shiftKey && shortcutKey === "d") {
        if (!currentClipboardSelection(false).length || design.layers.length >= MAX_ASSET_LAYERS) return;
        event.preventDefault();
        duplicateSelectedAssetLayer();
      } else if (!modifier && !event.altKey && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
        if (!selectedAssetLayer || selectedAssetLayer.locked) return;
        event.preventDefault();
        const step = event.shiftKey ? 5 : 1;
        updateAssetLayer(selectedAssetLayer.id, {
          x: Math.min(100, Math.max(0, selectedAssetLayer.x + (event.key === "ArrowLeft" ? -step : event.key === "ArrowRight" ? step : 0))),
          y: Math.min(100, Math.max(0, selectedAssetLayer.y + (event.key === "ArrowUp" ? -step : event.key === "ArrowDown" ? step : 0))),
        });
      } else if (!modifier && !event.altKey && (event.key === "Delete" || event.key === "Backspace")) {
        if (!selectedAssetLayer || selectedAssetLayer.locked) return;
        event.preventDefault();
        removeAssetLayer(selectedAssetLayer.id);
      } else if (!modifier && !event.altKey && event.key === "Escape" && selectedAssetLayer) {
        setSelectedLayerIds([]);
        setSelectedLayerId(null);
      }
    }
    window.addEventListener("keydown", handleLayerShortcut);
    return () => window.removeEventListener("keydown", handleLayerShortcut);
  }, [invitation, saving, audioBusy, canvasStage, selectedPhotoSlot, selectedAssetLayer, selectedAssetLayers, selectedLayerIds, copiedAssetLayer, copiedAssetLayers, design.layers]);

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
      const uploadedAsset = await uploadStudioAsset(invitation.id, assetType, file);

      setInvitation((current) =>
        current
          ? { ...current, assets: [...current.assets, uploadedAsset] }
          : current,
      );
      if (assetType === "AUDIO") setMusicUrl(uploadedAsset.url);
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
    setNotice(templateMode ? "Menyimpan template..." : "Menyimpan...");
    try {
      if (templateMode) {
        const selectedCatalog = catalog.find((item) => item.key === selectedCatalogKey);
        const cleanTemplateDesign: InvitationDesignState = {
          ...design,
          photos: {
            ...design.photos,
            cover: null,
            personOne: null,
            personTwo: null,
            gallery: null,
          },
        };
        const templateDesignKey = makeInvitationDesignStateKey(cleanTemplateDesign);
        const createdTemplate = await createStudioTemplate({
          designKey: templateDesignKey,
          name: `${selectedCatalog?.name || template?.name || "Template"} Studio`,
          tags: [selectedCatalog?.category || template?.category || "Designer", "studio"],
          previewUrl: selectedCatalog?.previewImage || template?.previewImage,
          category: selectedCatalog?.category || template?.category || "Designer",
          description: `Template Studio berbasis ${selectedCatalog?.name || template?.name || "desain DC Organizer"}.`,
          usesPhotos: selectedCatalog?.usesPhotos ?? template?.usesPhotos ?? false,
          musicUrl,
        });
        setSavedState(currentState);
        try { window.sessionStorage.removeItem(STUDIO_REFRESH_DRAFT_KEY); } catch { /* Optional cache. */ }
        setNotice(`Template #${createdTemplate.templateNo} ditambahkan ke katalog dan siap dijual.`);
        return;
      }

      const savedInvitation = await saveStudioInvitation(
        invitation,
        designKey,
        musicUrl,
        eventTag,
        dressCode,
      );
      setInvitation(savedInvitation);
      setSavedState(currentState);
      setServerRevision(makeStudioServerRevision(savedInvitation));
      try { window.sessionStorage.removeItem(STUDIO_REFRESH_DRAFT_KEY); } catch { /* Optional cache. */ }
      clearTemplateSelection();
      const location = new URL(window.location.href);
      location.searchParams.delete("template");
      location.searchParams.delete("from");
      window.history.replaceState(window.history.state, "", location.pathname + location.search + location.hash);
      setNotice("Desain tersimpan.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : templateMode ? "Template belum dapat disimpan." : "Gagal menyimpan.");
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
          <DesignerTool active={panel === "template"} label={locale === "en" ? "Catalog" : "Katalog"} icon={<LayoutTemplate className="h-4 w-4" />} onClick={() => { setInspectorOpen(true); setMobileCanvas(false); setPanel("template"); }} />
          <DesignerTool active={panel === "sections"} label={copy.sections} icon={<SlidersHorizontal className="h-4 w-4" />} onClick={() => { setInspectorOpen(true); setMobileCanvas(false); setPanel("sections"); }} />
          <DesignerTool active={panel === "text"} label={copy.text} icon={<Type className="h-4 w-4" strokeWidth={2.2} />} onClick={() => { setInspectorOpen(true); setMobileCanvas(false); setPanel("text"); }} />
          <DesignerTool active={panel === "decor"} label={copy.photos} icon={<ImagePlus className="h-4 w-4" />} onClick={() => { setInspectorOpen(true); setMobileCanvas(false); setPanel("decor"); }} />
          <DesignerTool active={panel === "assets"} label={copy.assets} icon={<Layers3 className="h-4 w-4" />} onClick={() => { setInspectorOpen(true); setMobileCanvas(false); setPanel("assets"); }} />
          <DesignerTool active={panel === "music"} label={copy.music} icon={<Music2 className="h-4 w-4" />} onClick={() => { setInspectorOpen(true); setMobileCanvas(false); setPanel("music"); }} />
          <DesignerTool active={panel === "color"} label={copy.colors} icon={<Palette className="h-4 w-4" />} onClick={() => { setInspectorOpen(true); setMobileCanvas(false); setPanel("color"); }} />
        </nav>

        <aside className="dc-studio-inspector" aria-label="Pengaturan desain">
          <fieldset disabled={!invitation || saving} className="min-w-0 border-0 p-0 disabled:opacity-50">
          {panel === "template" && <TemplatePanel selected={selectedCatalogKey} onSelect={selectTemplate} templates={catalog} />}
          {panel === "sections" && (
            <ContentPanel
              sections={design.sections}
              rsvpConfig={design.rsvpConfig}
              eventCategory={invitation?.eventCategory ?? ""}
              onChange={setSection}
              onSelectSection={focusContentSection}
              onSelectElement={focusContentElement}
              onRsvpConfig={updateRsvpConfig}
              onAddRsvpField={addRsvpCustomField}
              onUpdateRsvpField={updateRsvpCustomField}
              onRemoveRsvpField={removeRsvpCustomField}
            />
          )}
          {panel === "color" && design.template === "romantic-rose" && <p className="text-sm leading-7 text-muted-foreground">Warna Romantic Rose mengikuti desain asli tema.</p>}
          {panel === "color" && design.template !== "romantic-rose" && <ColorPanel selected={design.palette} onSelect={(value) => change({ palette: value })} />}
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
              onSetCrop={setPhotoCrop}
              onResetCrop={resetPhotoCrop}
              onUpload={(file) => uploadAsset(file, "IMAGE")}
            />
          )}
          {panel === "text" && <TextObjectPanel layers={design.layers} selectedId={selectedLayerId} targetSection={textTargetSection} selectedFont={design.font} onAdd={addTextObject} onSelect={focusDesignObject} onFontSelect={(value) => change({ font: value })} />}
          {panel === "assets" && <AssetPanel layers={design.layers} templateKey={design.template} onDragAssetStart={beginAssetDrag} onDragAssetEnd={endAssetDrag} onAddShape={addShapeObject} />}
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
            <Button onClick={save} disabled={saving || audioBusy || !invitation || (templateMode && !dirty)} size="sm">
              <Save className="h-4 w-4" />
              {saving ? copy.saving : templateMode ? (locale === "en" ? "Save Template" : "Simpan Template") : copy.save}
            </Button>
          </div>
          <div ref={canvasScrollRef} className="dc-studio-canvas-scroll" tabIndex={0} aria-label={locale === "en" ? "Invitation canvas" : "Kanvas undangan"} data-space-pan={canvasPanReady ? "true" : undefined} data-panning={canvasPanning ? "true" : undefined}
          onKeyDown={(event) => {
            if (event.code !== "Space" || event.altKey || event.ctrlKey || event.metaKey) return;
            const target = event.target;
            if (target instanceof Element && target.closest('input, textarea, select, [contenteditable="true"], [role="textbox"]')) return;
            event.preventDefault();
            setCanvasPanReady(true);
          }}
          onKeyUp={(event) => {
            if (event.code === "Space") setCanvasPanReady(false);
          }}
          onPointerDown={(event) => {
            if (beginCanvasPan(event)) return;
            const target = event.target;
            if (target instanceof Element && !target.closest('input, textarea, select, button, a, [contenteditable="true"], [role="textbox"]')) event.currentTarget.focus({ preventScroll: true });
          }}
          onPointerMove={moveCanvasPan}
          onPointerUp={endCanvasPan}
          onPointerCancel={(event) => { endCanvasPan(event); setCanvasPanReady(false); }}
          onClick={(event) => {
            if (consumeSuppressedCanvasClick()) return;
            const target = event.target;
            if (!(target instanceof Element)) return;
            const rsvpElement = target.closest<HTMLElement>("[data-studio-rsvp-element]");
            if (rsvpElement?.dataset.studioRsvpElement) {
              setSelectedLayerId(null);
              setSelectedPhotoSlot(null);
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
                setSelectedPhotoSlot(null);
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
              setSelectedPhotoSlot(null);
              setSelectedSectionKey(null);
              setSelectedSectionInstanceId(null);
              setSelectedRsvpElementKey(null);
              setSelectedSectionElement(null);
              setSelectedCopyField(copyElement.dataset.studioCopyField as EditableInvitationCopyField);
              return;
            }

            if (target.closest("[data-studio-photo-crop]")) return;
            const photoElement = target.closest<HTMLElement>("[data-invitation-photo-slot]");
            const photoSlot = photoElement?.dataset.invitationPhotoSlot as PhotoSlot | undefined;
            if (photoSlot && (["cover", "personOne", "personTwo", "gallery"] as PhotoSlot[]).includes(photoSlot)) {
              selectPhotoVisual(photoSlot);
              return;
            }

            if (target.closest("[data-studio-design-object], .dc-studio-layer-side, .dc-studio-section-side, button, a, input, select, textarea, [contenteditable], [role=button]")) return;
            const section = target.closest<HTMLElement>("[data-invitation-section]");
            if (section?.dataset.invitationSection) {
              if (section.dataset.invitationSection === "rsvp" && target.closest("img")) {
                setSelectedLayerId(null);
                setSelectedPhotoSlot(null);
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
              setSelectedPhotoSlot(null);
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
              {(selectedLayerIds.length > 1 || selectedAssetLayers.some((layer) => layer.groupId)) && (
                <div className="dc-studio-layer-group-actions" role="group" aria-label={locale === "en" ? "Layer grouping and alignment" : "Pengelompokan dan alignment layer"}>
                  {selectedLayerIds.length > 1 && (
                    <>
                      <button type="button" onClick={groupSelectedAssetLayers}>
                        {locale === "en" ? "Group" : "Group"}
                      </button>
                      <button type="button" onClick={() => alignSelectedAssetLayers("left")} title={locale === "en" ? "Align left" : "Rata kiri"} aria-label={locale === "en" ? "Align left" : "Rata kiri"}>↤</button>
                      <button type="button" onClick={() => alignSelectedAssetLayers("center-x")} title={locale === "en" ? "Align horizontal center" : "Rata tengah horizontal"} aria-label={locale === "en" ? "Align horizontal center" : "Rata tengah horizontal"}>↔</button>
                      <button type="button" onClick={() => alignSelectedAssetLayers("right")} title={locale === "en" ? "Align right" : "Rata kanan"} aria-label={locale === "en" ? "Align right" : "Rata kanan"}>↦</button>
                      <button type="button" onClick={() => alignSelectedAssetLayers("top")} title={locale === "en" ? "Align top" : "Rata atas"} aria-label={locale === "en" ? "Align top" : "Rata atas"}>↥</button>
                      <button type="button" onClick={() => alignSelectedAssetLayers("center-y")} title={locale === "en" ? "Align vertical center" : "Rata tengah vertikal"} aria-label={locale === "en" ? "Align vertical center" : "Rata tengah vertikal"}>↕</button>
                      <button type="button" onClick={() => alignSelectedAssetLayers("bottom")} title={locale === "en" ? "Align bottom" : "Rata bawah"} aria-label={locale === "en" ? "Align bottom" : "Rata bawah"}>↧</button>
                      {selectedLayerIds.length > 2 && (
                        <>
                          <button type="button" onClick={() => distributeSelectedAssetLayers("horizontal")} title={locale === "en" ? "Distribute horizontally" : "Sebar horizontal"} aria-label={locale === "en" ? "Distribute horizontally" : "Sebar horizontal"}>H</button>
                          <button type="button" onClick={() => distributeSelectedAssetLayers("vertical")} title={locale === "en" ? "Distribute vertically" : "Sebar vertikal"} aria-label={locale === "en" ? "Distribute vertically" : "Sebar vertikal"}>V</button>
                        </>
                      )}
                    </>
                  )}
                  {selectedAssetLayers.some((layer) => layer.groupId) && (
                    <button type="button" onClick={ungroupSelectedAssetLayers}>
                      {locale === "en" ? "Ungroup" : "Ungroup"}
                    </button>
                  )}
                </div>
              )}
              <div className="dc-studio-layer-list-items">
                {[...design.layers].reverse().map((layer) => {
                  const assetNumber = design.layers.indexOf(layer) + 1;
                  const automaticLayerName = layer.kind === "text"
                    ? `${locale === "en" ? "Text" : "Teks"} · ${(layer.text || "").trim().slice(0, 18) || assetNumber}`
                    : `${locale === "en" ? "Image" : "Gambar"} ${assetNumber}`;
                  const layerName = layer.name?.trim() || automaticLayerName;
                  return (
                    <div key={layer.id} className="dc-studio-layer-list-row" draggable={!layer.locked} onDragStart={(event) => { event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("application/x-dc-layer", layer.id); }} onDragEnter={() => setLayerDragOverId(layer.id)} onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; }} onDrop={(event) => { event.preventDefault(); event.stopPropagation(); const sourceId = event.dataTransfer.getData("application/x-dc-layer"); if (sourceId) reorderAssetLayer(sourceId, layer.id); setLayerDragOverId(null); }} onDragEnd={() => setLayerDragOverId(null)} data-layer-drag-over={layerDragOverId === layer.id ? "true" : undefined}>
                      <button
                        type="button"
                        className="dc-studio-layer-select-button"
                        aria-pressed={selectedLayerIds.includes(layer.id) || selectedLayerId === layer.id}
                        onClick={(event) => focusDesignObject(layer.id, event.shiftKey)}
                        title={layerName}
                      >
                        {layerName}
                      </button>
                      <button
                        type="button"
                        className="dc-studio-layer-quick"
                        aria-label={layer.hidden ? (locale === "en" ? "Show layer" : "Tampilkan layer") : (locale === "en" ? "Hide layer" : "Sembunyikan layer")}
                        title={layer.hidden ? (locale === "en" ? "Show" : "Tampilkan") : (locale === "en" ? "Hide" : "Sembunyikan")}
                        onClick={() => updateAssetLayer(layer.id, { hidden: layer.hidden ? undefined : true })}
                      >
                        {layer.hidden ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                      <button
                        type="button"
                        className="dc-studio-layer-quick"
                        aria-label={layer.locked ? (locale === "en" ? "Unlock layer" : "Buka kunci layer") : (locale === "en" ? "Lock layer" : "Kunci layer")}
                        title={layer.locked ? (locale === "en" ? "Unlock" : "Buka kunci") : (locale === "en" ? "Lock" : "Kunci")}
                        onClick={() => updateAssetLayer(layer.id, { locked: layer.locked ? undefined : true })}
                      >
                        {layer.locked ? <Lock size={13} /> : <Unlock size={13} />}
                      </button>
                    </div>
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
                <div className="ml-auto flex items-center gap-1 rounded-[var(--dc-control-radius)] border border-primary/30 bg-background p-1">
                  <button type="button" className="grid h-7 w-7 place-items-center rounded-lg text-primary hover:bg-primary/10" onClick={() => setCanvasZoom((value) => Math.max(0.7, Math.round((value - 0.1) * 10) / 10))} disabled={canvasZoom <= 0.7} aria-label={locale === "en" ? "Zoom out canvas" : "Perkecil kanvas"} title={locale === "en" ? "Zoom out" : "Perkecil"}>
                    <ZoomOut size={14} />
                  </button>
                  <button type="button" className="min-h-7 min-w-11 rounded-lg px-1.5 text-[10px] font-semibold text-muted-foreground hover:bg-primary/10 hover:text-primary" onClick={() => setCanvasZoom(1)} aria-label={locale === "en" ? "Reset canvas zoom to 100 percent" : "Reset zoom kanvas ke 100 persen"} title={locale === "en" ? "Reset to 100%" : "Kembali ke 100%"}>{Math.round(canvasZoom * 100)}%</button>
                  <button type="button" className="min-h-7 rounded-lg px-2 text-[10px] font-semibold text-primary hover:bg-primary/10" onClick={fitCanvasZoom} aria-label={locale === "en" ? "Fit canvas to workspace" : "Sesuaikan kanvas ke area kerja"} title={locale === "en" ? "Fit canvas" : "Sesuaikan kanvas"}>Fit</button>
                  <button type="button" className="grid h-7 w-7 place-items-center rounded-lg text-primary hover:bg-primary/10" onClick={() => setCanvasZoom((value) => Math.min(1.3, Math.round((value + 0.1) * 10) / 10))} disabled={canvasZoom >= 1.3} aria-label={locale === "en" ? "Zoom in canvas" : "Perbesar kanvas"} title={locale === "en" ? "Zoom in" : "Perbesar"}>
                    <ZoomIn size={14} />
                  </button>
                </div>
              </div>
              <div className="dc-studio-preview-surface" data-asset-drop={assetDropReady} style={{ zoom: canvasZoom }}>
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
                    activeCropSlot={cropModeSlot}
                    onCropPhoto={setPhotoCrop}
                    onFinishCrop={() => setCropModeSlot(null)}
                    designKey={designKey}
                    musicUrl={musicUrl}
                    selectedAssetLayerId={selectedLayerId}
                    selectedAssetLayerIds={selectedLayerIds}
                    onSelectAssetLayer={(id, additive) => focusDesignObject(id, Boolean(additive))}
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

            {selectedAssetLayer?.kind === "text" ? (
              <TextLayerInspector
                locale={locale}
                layer={selectedAssetLayer}
                selectedIndex={selectedAssetIndex}
                layerCount={design.layers.length}
                sections={design.sections}
                onClose={() => { setSelectedLayerIds([]); setSelectedLayerId(null); }}
                onUpdate={updateAssetLayer}
                onPosition={positionAssetLayer}
              />
            ) : selectedAssetLayer ? (
              <AssetLayerInspector
                locale={locale}
                selectedAssetLayer={selectedAssetLayer}
                selectedAssetIndex={selectedAssetIndex}
                layerCount={design.layers.length}
                sections={design.sections}
                onDeselect={() => { setSelectedLayerIds([]); setSelectedLayerId(null); }}
                onUpdate={updateAssetLayer}
                onPosition={positionAssetLayer}
              />
            ) : selectedPhotoSlot ? (
              <PhotoSlotInspector
                locale={locale}
                slot={selectedPhotoSlot}
                motion={design.photos.motion?.[selectedPhotoSlot]}
                onUpdate={(patch) => updatePhotoMotion(selectedPhotoSlot, patch)}
                onReset={() => resetPhotoMotion(selectedPhotoSlot)}
                onClose={() => setSelectedPhotoSlot(null)}
              />
            ) : selectedRsvpElementKey ? (
              <RsvpElementInspector
                locale={locale}
                elementKey={selectedRsvpElementKey}
                config={design.rsvpConfig}
                onConfig={updateRsvpConfig}
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
                motion={design.copyMotion[selectedCopyField]}
                onChange={(value) => setNarrativeCopy(selectedCopyField, value)}
                onMotion={(patch) => updateCopyMotion(selectedCopyField, patch)}
                onReset={() => {
                  resetNarrativeCopy(selectedCopyField);
                  resetCopyMotion(selectedCopyField);
                }}
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
