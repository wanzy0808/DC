"use client";

import { useEffect, useRef, useState } from "react";
import {
  Eye,
  FilePenLine,
  ImagePlus,
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
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { audioUploadError } from "@/lib/invitations/audio-limits";
import { defaultInvitationSections } from "@/lib/templates/sections";
import { Button } from "@/components/ui/button";
import { useTemplateCatalog } from "@/lib/templates/use-template-catalog";
import { defaultPhotoAssignments, type PhotoFocus, type PhotoSlot } from "@/lib/templates/photo-slots";
import { getEventCategory } from "@/lib/events/catalog";
import PhotoPanel from "@/components/InvitationStudio/PhotoPanel";
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

export default function InvitationDesigner({ onDirtyChange }: { onDirtyChange?: (dirty: boolean) => void }) {
  const catalog = useTemplateCatalog();
  const readyTemplates = catalog.filter((item) => item.ready);
  const [invitation, setInvitation] = useState<InvitationDesignerInvitation | null>(null);
  const [panel, setPanel] = useState<InvitationDesignerPanel>("template");
  const [activePhotoSlot, setActivePhotoSlot] = useState<PhotoSlot>("cover");
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [mobileCanvas, setMobileCanvas] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(0);
  const [canvasStage, setCanvasStage] = useState<"envelope" | "cover">("envelope");
  const [savedState, setSavedState] = useState("");
  const [preview, setPreview] = useState(false);
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
    const requestedTheme = params.get("template");
    const requestedPreset = requestedTheme ? invitationTemplatePresets[requestedTheme] : undefined;
    const stagedDesign: InvitationDesignState = requestedTheme && requestedPreset
      ? { ...loadedDesign, template: requestedTheme, palette: requestedPreset.palette, font: requestedPreset.font }
      : loadedDesign;
    setDesign(stagedDesign);
    setSavedState(JSON.stringify([makeInvitationDesignStateKey(loadedDesign), next.musicUrl || "", next.weddingHashtag || "", next.dressCode || ""]));
    setCanvasStage("envelope");
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
  const identity = getInvitationEventIdentity(invitation);
  const currentState = JSON.stringify([designKey, musicUrl, eventTag, dressCode]);
  const dirty = Boolean(invitation && savedState !== currentState);
  useEffect(() => { onDirtyChange?.(dirty); }, [dirty, onDirtyChange]);
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
    });
    setActivePhotoSlot("cover");
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
      <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
    </section>
  );

  return (
    <section className="dc-invitation-studio-shell" data-inspector={inspectorOpen} data-mobile-canvas={mobileCanvas}>
      <header className="dc-studio-toolbar">
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-[family-name:var(--font-dc-heading)] text-base text-primary sm:text-lg">{invitation?.title || "Studio"}</h1>
          <p className="mt-1 text-xs text-muted-foreground">{dirty ? "Perubahan belum disimpan" : invitation ? (invitation.templateKey ? "Desain tersimpan" : "Belum ada desain tersimpan") : notice}</p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Button size="sm" onClick={restoreDefaults} disabled={!invitation || saving || audioBusy} title="Kembalikan warna, font, dan bagian tema. Foto, musik, dan isi tidak dihapus.">
            <RotateCcw className="h-4 w-4" /> Kembalikan ke Default
          </Button>
          <Button size="icon-sm" onClick={undo} disabled={!history.length} aria-label="Urungkan desain" title="Urungkan desain">
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button size="icon-sm" onClick={redo} disabled={!future.length} aria-label="Ulangi desain" title="Ulangi desain">
            <Redo2 className="h-4 w-4" />
          </Button>
          <Button onClick={() => setPreview(true)} disabled={!invitation} size="sm">
            <Eye className="h-4 w-4" />
            Pratinjau
          </Button>
          <Button onClick={save} disabled={saving || audioBusy || !invitation} size="sm">
            <Save className="h-4 w-4" />
            {saving ? "Menyimpan..." : "Simpan desain"}
          </Button>
        </div>
      </header>

      <div className="dc-studio-mobile-view" aria-label="Tampilan Studio">
        <button type="button" aria-pressed={!mobileCanvas} onClick={() => setMobileCanvas(false)}>Pengaturan</button>
        <button type="button" aria-pressed={mobileCanvas} onClick={() => setMobileCanvas(true)}>Undangan</button>
      </div>
      <div className="dc-studio-workspace">
        <nav className="dc-studio-rail" aria-label="Alat desain">
          <DesignerTool active={panel === "template"} label="Template" icon={<LayoutTemplate className="h-4 w-4" />} onClick={() => { setInspectorOpen(true); setMobileCanvas(false); setPanel("template"); }} />
          <DesignerTool active={panel === "sections"} label="Bagian" icon={<SlidersHorizontal className="h-4 w-4" />} onClick={() => { setInspectorOpen(true); setMobileCanvas(false); setPanel("sections"); }} />
          <DesignerTool active={panel === "color"} label="Warna" icon={<Palette className="h-4 w-4" />} onClick={() => { setInspectorOpen(true); setMobileCanvas(false); setPanel("color"); }} />
          <DesignerTool active={panel === "font"} label="Font" icon={<Type className="h-4 w-4" />} onClick={() => { setInspectorOpen(true); setMobileCanvas(false); setPanel("font"); }} />
          <div className="dc-studio-rail-divider" />
          <DesignerTool active={panel === "content"} label="Isi" icon={<FilePenLine className="h-4 w-4" />} onClick={() => { setInspectorOpen(true); setMobileCanvas(false); setPanel("content"); }} />
          <DesignerTool active={panel === "decor"} label="Foto" icon={<ImagePlus className="h-4 w-4" />} onClick={() => { setInspectorOpen(true); setMobileCanvas(false); setPanel("decor"); }} />
          <DesignerTool active={panel === "music"} label="Musik" icon={<Music2 className="h-4 w-4" />} onClick={() => { setInspectorOpen(true); setMobileCanvas(false); setPanel("music"); }} />
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
              invitation={invitation}
              eventTag={eventTag}
              dressCode={dressCode}
              setEventTag={setEventTag}
              setDressCode={setDressCode}
            />
          )}
          {panel === "decor" && template && !template.usesPhotos ? (
            <div className="space-y-4 rounded-2xl border border-primary/25 bg-primary/5 p-5">
              <h2 className="font-[family-name:var(--font-dc-heading)] text-lg text-foreground">Tema tanpa foto</h2>
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
          {panel === "music" && <MusicPanel musicUrl={musicUrl} defaultTrack={getInvitationDefaultMusic(design.template).title} defaultUrl={getInvitationDefaultMusic(design.template).url} assets={invitation?.assets ?? []} busy={audioBusy || saving} setMusicUrl={setMusicUrl} onUpload={(file) => uploadAsset(file, "AUDIO")} onDelete={deleteMusic} />}
          </fieldset>
        </aside>

        <div className="dc-studio-canvas">
          <div className="dc-studio-canvas-toolbar">
            <button type="button" className="dc-studio-icon dc-studio-panel-toggle" onClick={() => setInspectorOpen(!inspectorOpen)} aria-label={inspectorOpen ? "Sembunyikan panel" : "Tampilkan panel"} title={inspectorOpen ? "Sembunyikan panel" : "Tampilkan panel"}>
              {inspectorOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            </button>
            <span className="min-w-0 flex-1 truncate text-sm">{template?.name || "Pratinjau"}</span>
            {design.sections.envelope !== false && <button type="button"
              aria-pressed={canvasStage === "envelope"}
              className={`min-h-9 shrink-0 rounded-full border border-primary/50 px-2.5 text-[11px] ${canvasStage === "envelope" ? "bg-primary text-black" : "text-primary hover:bg-primary/10"}`}
              onClick={() => { setCanvasStage("envelope"); setPreviewVersion((value) => value + 1); }}
              title="Tampilkan dan coba animasi Amplop Digital di canvas"
            >Amplop</button>}
            <button type="button"
              aria-pressed={canvasStage === "cover" || design.sections.envelope === false}
              className={`min-h-9 shrink-0 rounded-full border border-primary/50 px-2.5 text-[11px] ${canvasStage === "cover" || design.sections.envelope === false ? "bg-primary text-black" : "text-primary hover:bg-primary/10"}`}
              onClick={() => setCanvasStage("cover")}
              title="Lihat Cover tanpa mengubah pengaturan Amplop"
            >Cover</button>
            <span className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex"><Smartphone size={15} />Ponsel</span>
            <button type="button" className="dc-studio-icon" onClick={() => { setCanvasStage("envelope"); setPreviewVersion((value) => value + 1); }} aria-label="Ulangi pratinjau dari awal" title="Ulangi dari awal"><RotateCcw size={17} /></button>
          </div>
          <div className="dc-studio-canvas-scroll">
          <div className="dc-studio-preview-surface">
            {!preview && <div key={`${design.template}-${design.sections.envelope !== false}-${canvasStage}-${previewVersion}`}>

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
              onEditPhoto={editPhotoFromCanvas}
            />
            </div>}
          </div>
          </div>
        </div>
      </div>

      <footer className="dc-studio-status" role="status" aria-live="polite">{notice}</footer>
      <Dialog open={preview} onOpenChange={setPreview}>
        <DialogContent data-watermark={invitation?.accessPaid === false} className="dc-studio-preview-dialog max-h-[94dvh] overflow-y-auto p-3 pt-14" overlayClassName="z-[100]">
          <DialogTitle className="sr-only">Pratinjau Undangan</DialogTitle>
          <div className="dc-studio-preview-surface">
            <InvitationPreview
              invitation={invitation} templateKey={design.template} palette={palette} fontPair={fontPair}
              decorUrl={design.decor} eventTag={eventTag} dressCode={dressCode} sections={design.sections}
              photoAssignments={design.photos} designKey={designKey} musicUrl={musicUrl}
            />
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
