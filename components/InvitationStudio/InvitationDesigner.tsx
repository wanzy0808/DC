"use client";

import { useCallback, useEffect, useRef, useState, type DragEvent } from "react";
import {
  FilePenLine,
  ImagePlus,
  Layers3,
  ArrowUp,
  ArrowDown,
  Trash2,
  Copy,
  ClipboardPaste,
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
  Smartphone,
} from "lucide-react";
import { audioUploadError } from "@/lib/invitations/audio-limits";
import { defaultInvitationSections } from "@/lib/templates/sections";
import type { EditableInvitationCopyField } from "@/lib/templates/editable-copy";
import { Button } from "@/components/ui/button";
import { useTemplateCatalog } from "@/lib/templates/use-template-catalog";
import { defaultPhotoAssignments, type PhotoFocus, type PhotoSlot } from "@/lib/templates/photo-slots";
import { getEventCategory } from "@/lib/events/catalog";
import PhotoPanel from "@/components/InvitationStudio/PhotoPanel";
import AssetPanel from "@/components/InvitationStudio/AssetPanel";
import { isTemplateIllustration, MAX_ASSET_LAYERS, type InvitationAssetLayer } from "@/lib/templates/asset-layers";
import {
  invitationFonts,
  invitationPalettes,
} from "@/lib/templates/design";
import type { InvitationSectionKey } from "@/lib/templates/sections";
import {
  ColorPanel,
  ContentPanel,
  DesignerTool,
  FontPanel,
  MusicPanel,
  SectionsPanel,
  TemplatePanel,
} from "@/components/InvitationStudio/DesignerPanels";
import { InvitationPreview } from "@/components/InvitationStudio/InvitationPreview";
import { getInvitationDefaultMusic } from "@/lib/templates/music";
import { clearTemplateSelection, readTemplateSelection, rememberTemplateSelection } from "@/lib/templates/template-intent";
import { invitationTitleCase } from "@/lib/events/parents";
import { useLanguage } from "@/components/I18n/LanguageProvider";
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
    defaults: "Restore Defaults", defaultsHint: "Restore this theme's colors, fonts, and sections without deleting photos or content.",
    undo: "Undo design", redo: "Redo design", saving: "Saving...", save: "Save Design",
    settings: "Settings", invitation: "Invitation", tools: "Design tools",
    sections: "Sections", colors: "Colors", content: "Content", photos: "Photos", music: "Music", assets: "Assets",
    envelope: "Envelope", cover: "Cover", phone: "Mobile",
    showPanel: "Show panel", hidePanel: "Hide panel", replay: "Restart from the beginning",
    envelopeHint: "Open the digital envelope in the canvas", coverHint: "Show Cover without changing the saved envelope setting",
    photoFree: "Photo-free theme", retry: "Try Again",
  } : {
    unsaved: "Perubahan belum disimpan", saved: "Desain tersimpan", empty: "Belum ada desain tersimpan",
    defaults: "Kembalikan ke Default", defaultsHint: "Kembalikan warna, font, dan bagian tema. Foto, musik, dan isi tidak dihapus.",
    undo: "Urungkan desain", redo: "Ulangi desain", saving: "Menyimpan...", save: "Simpan Desain",
    settings: "Pengaturan", invitation: "Undangan", tools: "Alat desain",
    sections: "Bagian", colors: "Warna", content: "Isi", photos: "Foto", music: "Musik", assets: "Aset",
    envelope: "Amplop", cover: "Cover", phone: "Ponsel",
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
      ? { ...loadedDesign, template: requestedTheme, palette: requestedPreset.palette, font: requestedPreset.font, copy: {}, layers: [] }
      : loadedDesign;
    setDesign(stagedDesign);
    setSavedState(JSON.stringify([makeInvitationDesignStateKey(loadedDesign), next.musicUrl || "", next.weddingHashtag || "", next.dressCode || ""]));
    setCanvasStage("envelope");
    setSelectedLayerId(null);
    setCopiedAssetLayer(null);
    setHistory([]);
    setFuture([]);
    setNotice(requestedTheme && requestedTheme !== loadedDesign.template && requestedPreset
      ? "Template dipilih. Klik Simpan Desain untuk menerapkan."
      : "Siap diedit.");
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
    });
    rememberTemplateSelection(templateKey);
    // Keep the browser URL aligned with an unsaved theme choice on refresh.
    const location = new URL(window.location.href);
    location.searchParams.set("template", templateKey);
    window.history.replaceState(window.history.state, "", location.pathname + location.search + location.hash);
    setActivePhotoSlot("cover");
    setSelectedLayerId(null);
    setCopiedAssetLayer(null);
    setCanvasStage("envelope");
  }

  function restoreDefaults() {
    const preset = invitationTemplatePresets[design.template];
    if (!preset) return;
    change({ palette: preset.palette, font: preset.font, sections: { ...defaultInvitationSections } });
    setNotice("Warna, font, dan bagian kembali ke default. Foto, musik, dan isi tetap tersimpan. Klik Simpan Desain untuk menerapkan.");
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

  function setSection(section: InvitationSectionKey, enabled: boolean) {
    change({
      sections: {
        ...design.sections,
        [section]: enabled,
      },
    });
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

  function addAssetLayer(src: string, position: { x: number; y: number } = { x: 50, y: 38 }) {
    if (!isTemplateIllustration(src) || design.layers.length >= MAX_ASSET_LAYERS) return;
    const id = crypto.randomUUID().replace(/-/g, "");
    change({ layers: [...design.layers, { id, src, x: position.x, y: position.y, width: 28, opacity: 1 }] });
    setSelectedLayerId(id);
    setCanvasStage("cover");
    setInspectorOpen(true);
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
    setCanvasStage("cover");
  }

  function beginAssetDrag(src: string) {
    if (!isTemplateIllustration(src) || design.layers.length >= MAX_ASSET_LAYERS) return;
    draggedAssetSrc.current = src;
    setCanvasStage("cover");
    canvasScrollRef.current?.scrollTo({ top: 0 });
  }

  function findCoverDropTarget(clientX: number, clientY: number): HTMLElement | null {
    const element = document.elementFromPoint(clientX, clientY);
    const section = element?.closest?.('[data-invitation-section="cover"]');
    return section instanceof HTMLElement && canvasScrollRef.current?.contains(section) ? section : null;
  }

  function onAssetDragOver(event: DragEvent<HTMLDivElement>) {
    if (!draggedAssetSrc.current || design.layers.length >= MAX_ASSET_LAYERS) return;
    const section = findCoverDropTarget(event.clientX, event.clientY);
    if (!section) { if (assetDropReady) setAssetDropReady(false); return; }
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    if (!assetDropReady) setAssetDropReady(true);
  }

  function onAssetDrop(event: DragEvent<HTMLDivElement>) {
    const src = draggedAssetSrc.current;
    const section = src ? findCoverDropTarget(event.clientX, event.clientY) : null;
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
    });
  }

  function endAssetDrag() { draggedAssetSrc.current = null; setAssetDropReady(false); }

  function updateAssetLayer(id: string, patch: Partial<InvitationAssetLayer>) {
    if (!design.layers.some((layer) => layer.id === id)) return;
    change({ layers: design.layers.map((layer) => layer.id === id ? { ...layer, ...patch } : layer) });
  }

  function removeAssetLayer(id: string) {
    change({ layers: design.layers.filter((layer) => layer.id !== id) });
    setSelectedLayerId(null);
  }

  function reorderAssetLayer(id: string, direction: -1 | 1) {
    const index = design.layers.findIndex((layer) => layer.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= design.layers.length) return;
    const next = [...design.layers];
    [next[index], next[target]] = [next[target], next[index]];
    change({ layers: next });
  }

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
    setNotice("Menyimpan desain...");
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
      <header className="dc-studio-toolbar">
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-[family-name:var(--font-dc-heading)] text-base text-primary sm:text-lg">{invitationTitleCase(invitation?.title || "Studio")}</h1>
          <p className="mt-1 text-xs text-muted-foreground">{dirty ? copy.unsaved : invitation ? (invitation.templateKey ? copy.saved : copy.empty) : notice}</p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Button size="sm" onClick={restoreDefaults} disabled={!invitation || saving || audioBusy} title={copy.defaultsHint}>
            <RotateCcw className="h-4 w-4" /> {copy.defaults}
          </Button>
          <Button size="icon-sm" onClick={undo} disabled={!history.length} aria-label={copy.undo} title={copy.undo}>
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button size="icon-sm" onClick={redo} disabled={!future.length} aria-label={copy.redo} title={copy.redo}>
            <Redo2 className="h-4 w-4" />
          </Button>
          <Button onClick={save} disabled={saving || audioBusy || !invitation} size="sm">
            <Save className="h-4 w-4" />
            {saving ? copy.saving : copy.save}
          </Button>
        </div>
      </header>

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
          <DesignerTool active={panel === "content"} label={copy.content} icon={<FilePenLine className="h-4 w-4" />} onClick={() => { setInspectorOpen(true); setMobileCanvas(false); setPanel("content"); }} />
          <DesignerTool active={panel === "decor"} label={copy.photos} icon={<ImagePlus className="h-4 w-4" />} onClick={() => { setInspectorOpen(true); setMobileCanvas(false); setPanel("decor"); }} />
          <DesignerTool active={panel === "assets"} label={copy.assets} icon={<Layers3 className="h-4 w-4" />} onClick={() => { setInspectorOpen(true); setMobileCanvas(false); setCanvasStage("cover"); setPanel("assets"); }} />
          <DesignerTool active={panel === "music"} label={copy.music} icon={<Music2 className="h-4 w-4" />} onClick={() => { setInspectorOpen(true); setMobileCanvas(false); setPanel("music"); }} />
        </nav>

        <aside className="dc-studio-inspector" aria-label="Pengaturan desain">
          <fieldset disabled={!invitation || saving} className="min-w-0 border-0 p-0 disabled:opacity-50">
          {panel === "template" && <TemplatePanel selected={design.template} onSelect={selectTemplate} templates={catalog} />}
          {panel === "sections" && <SectionsPanel sections={design.sections} onChange={setSection} />}
          {panel === "color" && design.template === "romantic-rose" && <p className="text-sm leading-7 text-muted-foreground">Warna Romantic Rose mengikuti desain asli tema.</p>}
          {panel === "color" && design.template !== "romantic-rose" && <ColorPanel selected={design.palette} onSelect={(value) => change({ palette: value })} />}
          {panel === "font" && design.template === "romantic-rose" && <p className="text-sm leading-7 text-muted-foreground">Font Romantic Rose mengikuti desain asli tema.</p>}
          {panel === "font" && design.template !== "romantic-rose" && <FontPanel selected={design.font} onSelect={(value) => change({ font: value })} />}
          {panel === "content" && (
            <ContentPanel
              templateKey={design.template}
              eventDescription={invitation?.description}
              isWedding={getEventCategory(identity.category).nameMode === "couple"}
              copy={design.copy}
              onChange={setNarrativeCopy}
            />
          )}
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
          {panel === "assets" && <AssetPanel layers={design.layers} selectedId={selectedLayerId} templateKey={design.template} onAdd={addAssetLayer} onDragAssetStart={beginAssetDrag} onDragAssetEnd={endAssetDrag} onSelect={(id) => { setSelectedLayerId(id); setCanvasStage("cover"); }} onUpdate={updateAssetLayer} onRemove={removeAssetLayer} onReorder={reorderAssetLayer} />}
          {panel === "music" && <MusicPanel musicUrl={musicUrl} defaultTrack={getInvitationDefaultMusic(design.template).title} defaultUrl={getInvitationDefaultMusic(design.template).url} assets={invitation?.assets ?? []} busy={audioBusy || saving} setMusicUrl={setMusicUrl} onUpload={(file) => uploadAsset(file, "AUDIO")} onDelete={deleteMusic} />}
          </fieldset>
        </aside>

        <div className="dc-studio-canvas">
          <div className="dc-studio-canvas-toolbar">
            <button type="button" className="dc-studio-icon dc-studio-panel-toggle" onClick={() => setInspectorOpen(!inspectorOpen)} aria-label={inspectorOpen ? copy.hidePanel : copy.showPanel} title={inspectorOpen ? copy.hidePanel : copy.showPanel}>
              {inspectorOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            </button>
            <span className="min-w-0 flex-1 truncate text-sm">{template?.name || "Studio"}</span>
            {design.sections.envelope !== false && <button type="button"
              aria-pressed={canvasStage === "envelope"}
              className={`min-h-9 shrink-0 rounded-[var(--dc-control-radius)] border border-primary/50 px-2.5 text-[11px] ${canvasStage === "envelope" ? "bg-[#C07A84] text-white hover:bg-[#A65E69] dark:text-black dark:hover:bg-[#D9A3AA]" : "bg-background text-primary hover:bg-primary/10"}`}
              onClick={() => { setCanvasStage("envelope"); setPreviewVersion((value) => value + 1); }}
              title={copy.envelopeHint}
            >{copy.envelope}</button>}
            <button type="button"
              aria-pressed={canvasStage === "cover" || design.sections.envelope === false}
              className={`min-h-9 shrink-0 rounded-[var(--dc-control-radius)] border border-primary/50 px-2.5 text-[11px] ${canvasStage === "cover" || design.sections.envelope === false ? "bg-[#C07A84] text-white hover:bg-[#A65E69] dark:text-black dark:hover:bg-[#D9A3AA]" : "bg-background text-primary hover:bg-primary/10"}`}
              onClick={() => setCanvasStage("cover")}
              title={copy.coverHint}
            >{copy.cover}</button>
            <span className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex"><Smartphone size={15} />{copy.phone}</span>
            <button type="button" className="dc-studio-icon" onClick={() => { setCanvasStage("envelope"); setPreviewVersion((value) => value + 1); }} aria-label={copy.replay} title={copy.replay}><RotateCcw size={17} /></button>
          </div>
          <div ref={canvasScrollRef} className="dc-studio-canvas-scroll" onDragOver={onAssetDragOver} onDrop={onAssetDrop} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setAssetDropReady(false); }}>
          <div className="dc-studio-preview-workspace">
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
              onSelectAssetLayer={(id) => { setSelectedLayerId(id); setPanel("assets"); setInspectorOpen(true); }}
              onMoveAssetLayer={(id, x, y) => updateAssetLayer(id, { x, y })}
              onEditPhoto={editPhotoFromCanvas}
              onEnvelopeOpened={handleCanvasEnvelopeOpened}
            />
            </div>
          </div>
          {(selectedAssetLayer || copiedAssetLayer) && <aside className="dc-studio-layer-side" aria-label={locale === "en" ? "Illustration layer tools" : "Alat layer ilustrasi"}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-primary">{locale === "en" ? "Layer" : "Layer"} {selectedAssetLayer ? `${selectedAssetIndex + 1}/${design.layers.length}` : ""}</span>
              {selectedAssetLayer && <button type="button" onClick={() => setSelectedLayerId(null)} aria-label={locale === "en" ? "Deselect layer" : "Batalkan pilihan layer"} className="text-xs text-primary hover:underline">✕</button>}
            </div>
            {selectedAssetLayer && <>
              <label className="mt-3 block space-y-2 text-xs text-foreground">
                <span className="flex justify-between gap-2"><span>{locale === "en" ? "Opacity" : "Opasitas"}</span><output>{Math.round(selectedAssetLayer.opacity * 100)}%</output></span>
                <input type="range" min="0" max="1" step="0.05" value={selectedAssetLayer.opacity} aria-label={locale === "en" ? "Layer opacity" : "Opasitas layer"} className="w-full accent-primary" onChange={(event) => updateAssetLayer(selectedAssetLayer.id, { opacity: Number(event.target.value) })} />
              </label>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button type="button" className="dc-studio-layer-action" disabled={selectedAssetIndex === 0} onClick={() => reorderAssetLayer(selectedAssetLayer.id, -1)} title={locale === "en" ? "Send backward" : "Ke belakang"}><ArrowDown size={16} />{locale === "en" ? "Back" : "Belakang"}</button>
                <button type="button" className="dc-studio-layer-action" disabled={selectedAssetIndex === design.layers.length - 1} onClick={() => reorderAssetLayer(selectedAssetLayer.id, 1)} title={locale === "en" ? "Bring forward" : "Ke depan"}><ArrowUp size={16} />{locale === "en" ? "Front" : "Depan"}</button>
                <button type="button" className="dc-studio-layer-action" onClick={copySelectedAssetLayer} title="Ctrl/Cmd+C"><Copy size={16} />{locale === "en" ? "Copy" : "Salin"}</button>
                <button type="button" className="dc-studio-layer-action" onClick={() => removeAssetLayer(selectedAssetLayer.id)} title="Delete / Del"><Trash2 size={16} />{locale === "en" ? "Delete" : "Hapus"}</button>
              </div>
            </>}
            {copiedAssetLayer && <button type="button" className="dc-studio-layer-action mt-2 w-full" disabled={design.layers.length >= MAX_ASSET_LAYERS} onClick={pasteAssetLayer} title="Ctrl/Cmd+V"><ClipboardPaste size={16} />{locale === "en" ? "Paste layer" : "Tempel layer"}</button>}
            <p className="mt-3 text-[11px] leading-5 text-muted-foreground">{locale === "en" ? "Del: delete · Ctrl/Cmd+C: copy · Ctrl/Cmd+V: paste" : "Del: hapus · Ctrl/Cmd+C: salin · Ctrl/Cmd+V: tempel"}</p>
          </aside>}
          </div>
          </div>
        </div>
      </div>

      <footer className="dc-studio-status" role="status" aria-live="polite">{notice}</footer>
    </section>
  );
}
