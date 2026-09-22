"use client";

import { useEffect, useState } from "react";
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
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTemplateCatalog } from "@/lib/templates/use-template-catalog";
import { defaultPhotoAssignments, type PhotoFocus, type PhotoSlot } from "@/lib/templates/photo-slots";
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
  const catalog = useTemplateCatalog();
  const readyTemplates = catalog.filter((item) => item.ready);
  const [invitation, setInvitation] = useState<InvitationDesignerInvitation | null>(null);
  const [panel, setPanel] = useState<InvitationDesignerPanel>("template");
  const [activePhotoSlot, setActivePhotoSlot] = useState<PhotoSlot>("cover");
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
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
    sections: { rsvp: true, wishes: true, gift: true },
    photos: defaultPhotoAssignments(),
  });

  async function load() {
    setNotice("Memuat undangan...");
    const params = new URLSearchParams(window.location.search);
    const invitationId = params.get("invitationId")?.trim() || "";
    const legacyType =
      params.get("type") === "ADAT_AKAD" ? "ADAT_AKAD" : "WEDDING";
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
    setDesign(invitationDesignStateFromKey(next.templateKey, fallbackDecor));
    setHistory([]);
    setFuture([]);
    setNotice("Siap diedit.");
  }

  useEffect(() => {
    load().catch((error) =>
      setNotice(
        error instanceof Error
          ? error.message
          : "Undangan belum dapat dimuat.",
      ),
    );
  }, []);

  const template =
    readyTemplates.find((item) => item.key === design.template) ||
    readyTemplates[0];
  const palette = invitationPalettes[design.palette];
  const fontPair = invitationFonts[design.font];
  const designKey = makeInvitationDesignStateKey(design);
  const identity = getInvitationEventIdentity(invitation);

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
    }
  }

  async function save() {
    if (!invitation) return;
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
          isPublished: invitation.isPublished,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal menyimpan.");
      setInvitation(data.invitation);
      setNotice("Desain tersimpan.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="dc-invitation-studio-shell min-h-[calc(100vh-64px)] bg-background font-[family-name:var(--font-dc-sans)] text-foreground">
      <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-border/70 bg-background px-5 py-3 sm:px-7">
        <div className="min-w-0">
          <p className="font-[family-name:var(--font-dc-heading)] text-sm tracking-[0.14em] text-primary">
            INVITATION STUDIO
          </p>
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
            {identity.label} · {invitation?.title || "Acara"} · {template?.name || "Template"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="hidden max-w-52 truncate text-[11px] text-muted-foreground md:block">
            {notice}
          </span>
          <Button size="icon-sm" onClick={undo} disabled={!history.length} aria-label="Undo" title="Undo">
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button size="icon-sm" onClick={redo} disabled={!future.length} aria-label="Redo" title="Redo">
            <Redo2 className="h-4 w-4" />
          </Button>
          <Button onClick={() => setPreview(true)} size="sm">
            <Eye className="h-4 w-4" />
            Pratinjau
          </Button>
          <Button onClick={save} disabled={saving || !invitation} size="sm">
            <Save className="h-4 w-4" />
            {saving ? "Menyimpan..." : "Simpan desain"}
          </Button>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-128px)] lg:grid-cols-[96px_390px_minmax(0,1fr)]">
        <aside className="border-r border-border/70 bg-background p-2">
          <DesignerTool active={panel === "template"} label="Template" icon={<LayoutTemplate className="h-4 w-4" />} onClick={() => setPanel("template")} />
          <DesignerTool active={panel === "sections"} label="Section" icon={<SlidersHorizontal className="h-4 w-4" />} onClick={() => setPanel("sections")} />
          <DesignerTool active={panel === "color"} label="Warna" icon={<Palette className="h-4 w-4" />} onClick={() => setPanel("color")} />
          <DesignerTool active={panel === "font"} label="Font" icon={<Type className="h-4 w-4" />} onClick={() => setPanel("font")} />
          <div className="my-1 border-t border-border/60" />
          <DesignerTool active={panel === "content"} label="Isi" icon={<FilePenLine className="h-4 w-4" />} onClick={() => setPanel("content")} />
          <DesignerTool active={panel === "decor"} label="Foto" icon={<ImagePlus className="h-4 w-4" />} onClick={() => setPanel("decor")} />
          <DesignerTool active={panel === "music"} label="Musik" icon={<Music2 className="h-4 w-4" />} onClick={() => setPanel("music")} />
        </aside>

        <aside className="overflow-y-auto border-r border-border/70 bg-background p-5">
          {panel === "template" && <TemplatePanel selected={design.template} onSelect={selectTemplate} templates={catalog} />}
          {panel === "sections" && <SectionsPanel sections={design.sections} onChange={setSection} />}
          {panel === "color" && <ColorPanel selected={design.palette} onSelect={(value) => change({ palette: value })} />}
          {panel === "font" && <FontPanel selected={design.font} onSelect={(value) => change({ font: value })} />}
          {panel === "content" && (
            <ContentPanel
              invitation={invitation}
              eventTag={eventTag}
              dressCode={dressCode}
              setEventTag={setEventTag}
              setDressCode={setDressCode}
            />
          )}
          {panel === "decor" && (
            <PhotoPanel
              photos={invitation?.assets ?? []}
              slots={catalog.find((item) => item.key === design.template && item.ready)?.photoSlots ?? ["cover"]}
              assignments={design.photos}
              activeSlot={activePhotoSlot}
              onActiveSlotChange={setActivePhotoSlot}
              onSetPhoto={setPhoto}
              onToggleGallery={toggleGalleryPhoto}
              onSetFocus={setPhotoFocus}
              onUpload={(file) => uploadAsset(file, "IMAGE")}
            />
          )}
          {panel === "music" && <MusicPanel musicUrl={musicUrl} setMusicUrl={setMusicUrl} onUpload={(file) => uploadAsset(file, "AUDIO")} />}
        </aside>

        <main className="flex items-start justify-center overflow-auto bg-foreground/[0.025] p-6 sm:p-10">
          <div className="w-[390px] max-w-full origin-top">
            <InvitationPreview
              invitation={invitation}
              templateKey={design.template}
              palette={palette}
              fontPair={fontPair}
              decorUrl={design.decor}
              eventTag={eventTag}
              dressCode={dressCode}
              sections={design.sections}
              photoAssignments={design.photos}
              designKey={designKey}
              onEditPhoto={editPhotoFromCanvas}
            />
          </div>
        </main>
      </div>

      {preview && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/65 p-4" onClick={() => setPreview(false)}>
          <div className="relative max-h-[92vh] overflow-auto rounded-[28px] bg-background p-3" onClick={(event) => event.stopPropagation()}>
            <Button size="icon-sm" onClick={() => setPreview(false)} className="absolute right-4 top-4 z-20" aria-label="Tutup pratinjau" title="Tutup pratinjau">
              <X className="h-4 w-4" />
            </Button>
            <div className="w-[390px] max-w-[86vw]">
              <InvitationPreview
                invitation={invitation}
                templateKey={design.template}
                palette={palette}
                fontPair={fontPair}
                decorUrl={design.decor}
                eventTag={eventTag}
                dressCode={dressCode}
                sections={design.sections}
                photoAssignments={design.photos}
              designKey={designKey}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
