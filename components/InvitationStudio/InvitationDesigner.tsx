"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Eye,
  FilePenLine,
  ImagePlus,
  Music2,
  Palette,
  Redo2,
  RotateCcw,
  Save,
  Type,
  Undo2,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { weddingParentLine } from "@/lib/events/parents";
import { invitationTemplates } from "@/lib/templates/catalog";
import {
  invitationFonts,
  invitationPalettes,
  makeDesignKey,
  parseDesignKey,
  type FontKey,
  type PaletteKey,
} from "@/lib/templates/design";
import {
  getEventCategory,
  getIndonesiaTimezone,
  normalizeEventCategory,
  type EventCategory,
} from "@/lib/events/catalog";

type Invitation = {
  id: string;
  slug: string;
  type: "WEDDING" | "ADAT_AKAD";
  title: string;
  eventCategory: EventCategory | string;
  groomName: string;
  brideName: string;
  groomFatherName?: string | null;
  groomMotherName?: string | null;
  brideFatherName?: string | null;
  brideMotherName?: string | null;
  venue: string;
  address?: string | null;
  mapUrl?: string | null;
  timezone: string;
  eventDate: string;
  ceremonyTime: string | null;
  receptionTime: string | null;
  description: string | null;
  weddingHashtag: string | null;
  dressCode: string | null;
  eventNotes: string | null;
  musicUrl: string | null;
  templateKey: string;
  isPublished: boolean;
  accessPaid?: boolean;
  assets: {
    id: string;
    type: "IMAGE" | "AUDIO";
    url: string;
    title: string | null;
  }[];
  payment: { status: string; packageKey: string } | null;
};

type Panel = "template" | "color" | "font" | "content" | "decor" | "music";

type ContentForm = {
  eventTag: string;
  dressCode: string;
};

const decor = [
  "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&q=80&w=500",
  "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&q=80&w=500",
  "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=500",
];

const palettes = Object.entries(invitationPalettes) as [
  PaletteKey,
  (typeof invitationPalettes)[PaletteKey],
][];

const fonts = (
  Object.entries(invitationFonts) as [
    FontKey,
    (typeof invitationFonts)[FontKey],
  ][]
).sort((a, b) => a[1].name.localeCompare(b[1].name));

function eventIdentity(invitation: Invitation | null) {
  if (!invitation) {
    return {
      category: normalizeEventCategory("OTHER"),
      label: "Event",
      primary: "Nama acara",
      secondary: "",
    };
  }

  const category = normalizeEventCategory(invitation.eventCategory);
  const info = getEventCategory(category);

  if (info.nameMode === "couple") {
    return {
      category,
      label: info.label,
      primary: invitation.groomName || invitation.title || "Nama pertama",
      secondary: invitation.brideName || "Nama kedua",
    };
  }

  if (info.nameMode === "single") {
    return {
      category,
      label: info.label,
      primary: invitation.groomName || invitation.title || "Nama utama",
      secondary: "",
    };
  }

  return {
    category,
    label: info.label,
    primary: invitation.title || "Nama acara",
    secondary: "",
  };
}

function formatEventDate(invitation: Invitation | null) {
  if (!invitation?.eventDate) return "Tanggal acara belum diatur";
  const date = new Date(invitation.eventDate);
  if (Number.isNaN(date.getTime())) return "Tanggal acara belum diatur";
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: invitation.timezone || "Asia/Jakarta",
  }).format(date);
}

function formatTime(value: string | null) {
  return value || "";
}

export default function InvitationDesigner() {
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [panel, setPanel] = useState<Panel>("template");
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("Memuat undangan...");
  const [history, setHistory] = useState<string[]>([]);
  const [future, setFuture] = useState<string[]>([]);
  const [musicUrl, setMusicUrl] = useState("");
  const [content, setContent] = useState<ContentForm>({
    eventTag: "",
    dressCode: "",
  });
  const [design, setDesign] = useState({
    template: "eternal-blossom",
    palette: "rose" as PaletteKey,
    font: "cinzelFauna" as FontKey,
    decor: decor[0],
  });

  async function load() {
    setNotice("Memuat undangan...");
    const params = new URLSearchParams(window.location.search);
    const invitationId = params.get("invitationId")?.trim() || "";
    const legacyType = params.get("type") === "ADAT_AKAD" ? "ADAT_AKAD" : "WEDDING";
    const query = invitationId
      ? `?id=${encodeURIComponent(invitationId)}&type=${legacyType}`
      : `?type=${legacyType}`;

    const response = await fetch(`/api/invitations${query}`, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok || !data.invitation) {
      throw new Error(data.error || "Undangan belum dapat dimuat.");
    }

    const next = data.invitation as Invitation;
    setInvitation(next);
    setMusicUrl(next.musicUrl || "");
    setContent({
      eventTag: next.weddingHashtag || "",
      dressCode: next.dressCode || "",
    });

    const parsed = parseDesignKey(next.templateKey);
    setDesign({
      template: parsed.template,
      palette: parsed.palette,
      font: parsed.font,
      decor:
        parsed.decor ||
        next.assets.find((asset) => asset.type === "IMAGE")?.url ||
        decor[0],
    });
    setHistory([]);
    setFuture([]);
    setNotice("Siap diedit.");
  }

  useEffect(() => {
    load().catch((error) =>
      setNotice(
        error instanceof Error ? error.message : "Undangan belum dapat dimuat.",
      ),
    );
  }, []);

  const palette = invitationPalettes[design.palette];
  const fontPair = invitationFonts[design.font];
  const template =
    invitationTemplates.find((item) => item.key === design.template) ||
    invitationTemplates[0];
  const designKey = makeDesignKey(
    design.template,
    design.palette,
    design.font,
    design.decor,
  );
  const templates = useMemo(() => invitationTemplates, []);
  const identity = eventIdentity(invitation);

  function change(next: Partial<typeof design>) {
    setHistory((current) => [...current.slice(-9), designKey]);
    setFuture([]);
    setDesign((current) => ({ ...current, ...next }));
  }

  function undo() {
    const key = history.at(-1);
    if (!key) return;
    setFuture((current) => [...current, designKey]);
    const parsed = parseDesignKey(key);
    setDesign((current) => ({
      ...current,
      template: parsed.template,
      palette: parsed.palette,
      font: parsed.font,
      decor: parsed.decor || current.decor,
    }));
    setHistory((current) => current.slice(0, -1));
  }

  function redo() {
    const key = future.at(-1);
    if (!key) return;
    setHistory((current) => [...current, designKey]);
    const parsed = parseDesignKey(key);
    setDesign((current) => ({
      ...current,
      template: parsed.template,
      palette: parsed.palette,
      font: parsed.font,
      decor: parsed.decor || current.decor,
    }));
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
        current ? { ...current, assets: [...current.assets, data.asset] } : current,
      );
      if (assetType === "IMAGE") {
        setDesign((current) => ({ ...current, decor: data.asset.url }));
      } else {
        setMusicUrl(data.asset.url);
      }
      setNotice(assetType === "IMAGE" ? "Foto berhasil diunggah." : "Musik berhasil diunggah.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Upload gagal.");
    }
  }

  async function save() {
    if (!invitation) return;
    setSaving(true);
    setNotice("Menyimpan ke database...");
    try {
      const response = await fetch("/api/invitations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: invitation.id,
          eventCategory: invitation.eventCategory,
          templateKey: designKey,
          musicUrl,
          weddingHashtag: content.eventTag,
          dressCode: content.dressCode,
          isPublished: invitation.isPublished,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal menyimpan.");
      setInvitation(data.invitation);
      setNotice("Tersimpan ke database.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="dc-invitation-studio-shell min-h-[calc(100vh-64px)] bg-background font-[family-name:var(--font-fauna)] text-foreground">
      <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-border/70 bg-background px-5 py-3 sm:px-7">
        <div className="min-w-0">
          <p className="font-[family-name:var(--font-cinzel)] text-sm tracking-[0.14em] text-primary">
            INVITATION STUDIO
          </p>
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
            {identity.label} · {invitation?.title || "Acara"} · {template.name}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="hidden max-w-52 truncate text-[11px] text-muted-foreground md:block">
            {notice}
          </span>
          <Button
            size="icon-sm"
            onClick={undo}
            disabled={!history.length}
            aria-label="Batalkan perubahan desain terakhir"
            title="Undo"
            className="bg-transparent text-foreground shadow-none hover:bg-primary/[0.07] hover:text-primary disabled:bg-transparent"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            size="icon-sm"
            onClick={redo}
            disabled={!future.length}
            aria-label="Ulangi perubahan desain"
            title="Redo"
            className="bg-transparent text-foreground shadow-none hover:bg-primary/[0.07] hover:text-primary disabled:bg-transparent"
          >
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

      <div className="grid min-h-[calc(100vh-128px)] lg:grid-cols-[88px_390px_minmax(0,1fr)]">
        <aside className="border-r border-border/70 bg-background p-2">
          <Tool active={panel === "template"} label="Template" icon={<LayoutIcon />} onClick={() => setPanel("template")} />
          <Tool active={panel === "color"} label="Warna" icon={<Palette className="h-4 w-4" />} onClick={() => setPanel("color")} />
          <Tool active={panel === "font"} label="Font" icon={<Type className="h-4 w-4" />} onClick={() => setPanel("font")} />
          <div className="my-1 border-t border-border/60" />
          <Tool active={panel === "content"} label="Isi" icon={<FilePenLine className="h-4 w-4" />} onClick={() => setPanel("content")} />
          <Tool active={panel === "decor"} label="Dekorasi" icon={<ImagePlus className="h-4 w-4" />} onClick={() => setPanel("decor")} />
          <Tool active={panel === "music"} label="Musik" icon={<Music2 className="h-4 w-4" />} onClick={() => setPanel("music")} />
        </aside>

        <aside className="overflow-y-auto border-r border-border/70 bg-background p-5">
          {panel === "template" && (
            <TemplatePanel templates={templates} selected={design.template} onSelect={(value) => change({ template: value })} />
          )}
          {panel === "color" && <ColorPanel selected={design.palette} onSelect={(value) => change({ palette: value })} />}
          {panel === "font" && <FontPanel selected={design.font} onSelect={(value) => change({ font: value })} />}
          {panel === "content" && (
            <ContentPanel
              invitation={invitation}
              eventTag={content.eventTag}
              dressCode={content.dressCode}
              setEventTag={(value) => setContent((current) => ({ ...current, eventTag: value }))}
              setDressCode={(value) => setContent((current) => ({ ...current, dressCode: value }))}
            />
          )}
          {panel === "decor" && (
            <DecorPanel
              selected={design.decor}
              onSelect={(value) => change({ decor: value })}
              onUpload={(file) => uploadAsset(file, "IMAGE")}
              imageCount={invitation?.assets.filter((asset) => asset.type === "IMAGE").length ?? 0}
            />
          )}
          {panel === "music" && (
            <MusicPanel
              musicUrl={musicUrl}
              setMusicUrl={setMusicUrl}
              onUpload={(file) => uploadAsset(file, "AUDIO")}
              audioCount={invitation?.assets.filter((asset) => asset.type === "AUDIO").length ?? 0}
            />
          )}
        </aside>

        <main className="flex items-start justify-center overflow-auto bg-primary/[0.045] p-6 sm:p-10">
          <div className="w-[360px] max-w-full origin-top" style={{ transform: "scale(.94)", transformOrigin: "top center" }}>
            <InvitationPreview
              invitation={invitation}
              palette={palette}
              fontPair={fontPair}
              decorUrl={design.decor}
              eventTag={content.eventTag}
            />
          </div>
        </main>
      </div>

      {preview && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/65 p-4" onClick={() => setPreview(false)}>
          <div className="relative max-h-[92vh] overflow-auto rounded-[28px] bg-background p-3" onClick={(event) => event.stopPropagation()}>
            <Button
              size="icon-sm"
              onClick={() => setPreview(false)}
              className="absolute right-4 top-4 z-10"
              aria-label="Tutup pratinjau"
              title="Tutup pratinjau"
            >
              <X className="h-4 w-4" />
            </Button>
            <InvitationPreview
              invitation={invitation}
              palette={palette}
              fontPair={fontPair}
              decorUrl={design.decor}
              eventTag={content.eventTag}
            />
          </div>
        </div>
      )}
    </section>
  );
}

function Tool({ active, label, icon, onClick }: { active: boolean; label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      className={`mb-1 grid h-auto min-h-[68px] w-full justify-items-center gap-1.5 px-2 py-2 text-[10px] shadow-none ${
        active
          ? "bg-primary text-white dark:text-black"
          : "border-transparent bg-transparent text-muted-foreground hover:bg-primary/[0.07] hover:text-primary"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Button>
  );
}

function LayoutIcon() {
  return (
    <span className="grid h-4 w-4 grid-cols-2 gap-0.5">
      <i className="rounded-sm bg-current" />
      <i className="rounded-sm bg-current opacity-50" />
      <i className="col-span-2 rounded-sm bg-current opacity-70" />
    </span>
  );
}

function Heading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div>
      <p className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
      <h2 className="mt-1 font-[family-name:var(--font-cinzel)] text-lg font-semibold text-foreground">{title}</h2>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
    </div>
  );
}

function TemplatePanel({ templates, selected, onSelect }: { templates: typeof invitationTemplates; selected: string; onSelect: (key: string) => void }) {
  return (
    <div>
      <Heading eyebrow="Design" title="Template Undangan" description="Pilih komposisi utama untuk event ini." />
      <div className="mt-5 grid gap-3">
        {templates.map((item) => (
          <Button
            key={item.key}
            onClick={() => onSelect(item.key)}
            className={`group h-auto w-full overflow-hidden rounded-xl p-0 text-left shadow-none ${
              selected === item.key
                ? "border-primary bg-primary/[0.05]"
                : "border-border bg-background hover:border-primary/35 hover:bg-primary/[0.025]"
            }`}
          >
            <span className="block w-full">
              <span className="relative block">
                <img src={item.previewImage} alt="" className="h-28 w-full object-cover" />
                {selected === item.key && (
                  <span className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-primary text-white dark:text-black">
                    <Check className="h-4 w-4" />
                  </span>
                )}
              </span>
              <span className="block p-3.5">
                <span className="block font-[family-name:var(--font-cinzel)] text-xs font-semibold text-foreground">{item.name}</span>
                <span className="mt-1 block whitespace-normal text-[10px] leading-4 text-muted-foreground">{item.description}</span>
              </span>
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}

function ColorPanel({ selected, onSelect }: { selected: PaletteKey; onSelect: (key: PaletteKey) => void }) {
  return (
    <div>
      <Heading eyebrow="Design" title="Palet warna" description="Warna berlaku pada isi undangan, bukan dashboard DC Organizer." />
      <div className="mt-5 space-y-1.5">
        {palettes.map(([key, item]) => (
          <Button
            key={key}
            onClick={() => onSelect(key)}
            className={`h-auto w-full justify-start px-3 py-2.5 text-left shadow-none ${
              selected === key ? "bg-primary/[0.08] text-foreground" : "bg-transparent text-foreground hover:bg-primary/[0.04]"
            }`}
          >
            <span className="flex h-10 w-14 shrink-0 overflow-hidden rounded-lg">
              <i className="flex-1" style={{ background: item.bg }} />
              <i className="flex-1" style={{ background: item.accent }} />
              <i className="flex-1" style={{ background: item.soft }} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold">{item.name}</span>
              <span className="block text-[9px] text-muted-foreground">{item.accent} · {item.soft}</span>
            </span>
            {selected === key && <Check className="h-4 w-4 text-primary" />}
          </Button>
        ))}
      </div>
    </div>
  );
}

function FontPanel({ selected, onSelect }: { selected: FontKey; onSelect: (key: FontKey) => void }) {
  return (
    <div>
      <Heading eyebrow="Typography" title="Font pairing" description="Pilih tipografi untuk konten undangan." />
      <div className="mt-5 space-y-1.5">
        {fonts.map(([key, item]) => (
          <Button
            key={key}
            onClick={() => onSelect(key)}
            className={`h-auto w-full justify-start px-3 py-3 text-left shadow-none ${
              selected === key ? "bg-primary/[0.08] text-foreground" : "bg-transparent text-foreground hover:bg-primary/[0.04]"
            }`}
          >
            <span className="min-w-0 flex-1">
              <span className="block truncate font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.08em] text-muted-foreground">{item.name}</span>
              <span className="mt-1.5 block text-xl leading-none" style={{ fontFamily: item.heading }}>Aa Bb</span>
              <span className="mt-1 block truncate text-[11px]" style={{ fontFamily: item.body }}>Digital invitation</span>
            </span>
            {selected === key && <Check className="h-4 w-4 text-primary" />}
          </Button>
        ))}
      </div>
    </div>
  );
}

function ContentPanel({ invitation, eventTag, dressCode, setEventTag, setDressCode }: { invitation: Invitation | null; eventTag: string; dressCode: string; setEventTag: (value: string) => void; setDressCode: (value: string) => void }) {
  const identity = eventIdentity(invitation);
  const timezone = getIndonesiaTimezone(invitation?.timezone || "Asia/Jakarta");
  const time = invitation?.ceremonyTime
    ? `${formatTime(invitation.ceremonyTime)}${invitation.receptionTime ? `–${formatTime(invitation.receptionTime)}` : ""} ${timezone.label}`
    : "Waktu belum diatur";
  const groomParents =
    identity.category === "WEDDING"
      ? weddingParentLine(invitation?.groomFatherName, invitation?.groomMotherName)
      : "";
  const brideParents =
    identity.category === "WEDDING"
      ? weddingParentLine(invitation?.brideFatherName, invitation?.brideMotherName)
      : "";

  return (
    <div>
      <Heading eyebrow="Content" title="Isi undangan" description="Data utama acara dibaca dari Rangkaian Acara dan tidak diinput ulang di Studio." />
      <div className="mt-5 rounded-xl border border-border/75 bg-foreground/[0.018] p-4">
        <p className="text-[11px] font-semibold text-primary">Data tersinkron</p>
        <p className="mt-1 text-xs font-semibold text-foreground">{invitation?.title || identity.primary}</p>
        <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
          {identity.secondary ? `${identity.primary} & ${identity.secondary} · ` : `${identity.primary} · `}
          {formatEventDate(invitation)} · {time} · {invitation?.venue || "Tempat belum diatur"}
        </p>
        {(groomParents || brideParents) && (
          <div className="mt-2 space-y-1 text-[10px] leading-4 text-muted-foreground">
            {groomParents && <p>{identity.primary}: {groomParents}</p>}
            {brideParents && <p>{identity.secondary}: {brideParents}</p>}
          </div>
        )}
        <p className="mt-2 text-[10px] leading-4 text-muted-foreground">Ubah nama, orang tua, tanggal, waktu, dan lokasi dari menu Rangkaian Acara.</p>
      </div>
      <div className="mt-5 space-y-3">
        <label className="block text-[11px] font-semibold">
          Tag / hashtag acara
          <input
            value={eventTag}
            onChange={(event) => setEventTag(event.target.value)}
            className="mt-1.5 w-full rounded-[10px] border border-border bg-foreground/[0.018] px-3 py-2.5 text-xs font-normal outline-none focus:border-primary"
            placeholder="#AcaraKita"
          />
        </label>
        <label className="block text-[11px] font-semibold">
          Dress code
          <input
            value={dressCode}
            onChange={(event) => setDressCode(event.target.value)}
            className="mt-1.5 w-full rounded-[10px] border border-border bg-foreground/[0.018] px-3 py-2.5 text-xs font-normal outline-none focus:border-primary"
            placeholder="Formal / Batik / Pastel"
          />
        </label>
      </div>
    </div>
  );
}

function DecorPanel({ selected, onSelect, onUpload, imageCount }: { selected: string; onSelect: (value: string) => void; onUpload: (file: File) => void; imageCount: number }) {
  return (
    <div>
      <Heading eyebrow="Details" title="Dekorasi" description="Pilih satu aksen visual atau unggah foto sendiri." />
      <div className="mt-5 grid grid-cols-3 gap-2">
        {decor.map((item) => (
          <Button
            key={item}
            size="icon-lg"
            onClick={() => onSelect(item)}
            className={`h-auto w-full overflow-hidden p-0 shadow-none ${selected === item ? "border-primary" : "border-border"}`}
          >
            <img src={item} alt="" className="aspect-square w-full object-cover" />
          </Button>
        ))}
      </div>
      <label className="mt-4 flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-dashed border-primary/30 bg-primary/[0.025] px-3 py-3 text-xs font-semibold text-primary hover:bg-primary/[0.05]">
        <Upload className="h-4 w-4" />
        Upload foto
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onUpload(file);
            event.currentTarget.value = "";
          }}
        />
      </label>
      <p className="mt-2 text-[10px] text-muted-foreground">{imageCount}/30 foto terpakai · foto otomatis WebP</p>
      <Button size="sm" onClick={() => onSelect("")} className="mt-3">
        <RotateCcw className="h-3.5 w-3.5" />
        Hapus dekorasi
      </Button>
    </div>
  );
}

function MusicPanel({ musicUrl, setMusicUrl, onUpload, audioCount }: { musicUrl: string; setMusicUrl: (value: string) => void; onUpload: (file: File) => void; audioCount: number }) {
  return (
    <div>
      <Heading eyebrow="Details" title="Musik" description="Simpan satu sumber musik untuk undangan ini." />
      <input
        value={musicUrl}
        onChange={(event) => setMusicUrl(event.target.value)}
        placeholder="https://.../music.mp3"
        className="mt-5 w-full rounded-[10px] border border-border bg-foreground/[0.018] px-3 py-3 text-xs outline-none focus:border-primary"
      />
      <label className="mt-3 flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-dashed border-primary/30 bg-primary/[0.025] px-3 py-3 text-xs font-semibold text-primary hover:bg-primary/[0.05]">
        <Upload className="h-4 w-4" />
        Upload musik
        <input
          type="file"
          accept="audio/mpeg,audio/wav,audio/ogg,audio/aac,audio/mp4,audio/x-m4a"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onUpload(file);
            event.currentTarget.value = "";
          }}
        />
      </label>
      <p className="mt-2 text-[10px] text-muted-foreground">{audioCount}/1 musik aktif · maksimal 1 track custom</p>
    </div>
  );
}

function InvitationPreview({ invitation, palette, fontPair, decorUrl, eventTag }: { invitation: Invitation | null; palette: (typeof invitationPalettes)[PaletteKey]; fontPair: (typeof invitationFonts)[FontKey]; decorUrl: string; eventTag: string }) {
  const identity = eventIdentity(invitation);
  const image = invitation?.assets.find((asset) => asset.type === "IMAGE")?.url;
  const timezone = getIndonesiaTimezone(invitation?.timezone || "Asia/Jakarta");
  const startTime = formatTime(invitation?.ceremonyTime || null);
  const endTime = formatTime(invitation?.receptionTime || null);
  const groomParents =
    identity.category === "WEDDING"
      ? weddingParentLine(invitation?.groomFatherName, invitation?.groomMotherName)
      : "";
  const brideParents =
    identity.category === "WEDDING"
      ? weddingParentLine(invitation?.brideFatherName, invitation?.brideMotherName)
      : "";

  return (
    <div
      className="min-h-[780px] overflow-hidden rounded-[30px] shadow-[0_24px_70px_rgba(66,42,33,.18)]"
      style={{ background: palette.bg, color: palette.ink, fontFamily: fontPair.body }}
    >
      <div className="relative min-h-[430px] overflow-hidden px-7 pb-12 pt-12 text-center">
        {image && <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />}
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg,${palette.bg}66,${palette.bg})` }} />
        {decorUrl && <img src={decorUrl} alt="" className="absolute -right-10 top-10 h-40 w-40 object-cover opacity-30 mix-blend-multiply" />}
        <div className="relative">
          <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: palette.accent }}>{identity.label}</p>

          {identity.secondary ? (
            <>
              <h1 className="mt-10 text-5xl leading-[0.95]" style={{ fontFamily: fontPair.heading }}>{identity.primary}</h1>
              {groomParents && <p className="mx-auto mt-2 max-w-[270px] text-[10px] leading-4 opacity-65">{groomParents}</p>}
              <p className="my-3 text-sm opacity-60">&</p>
              <h2 className="text-5xl leading-[0.95]" style={{ fontFamily: fontPair.heading }}>{identity.secondary}</h2>
              {brideParents && <p className="mx-auto mt-2 max-w-[270px] text-[10px] leading-4 opacity-65">{brideParents}</p>}
            </>
          ) : (
            <h1 className="mx-auto mt-12 max-w-[300px] text-5xl leading-[1.02]" style={{ fontFamily: fontPair.heading }}>{identity.primary}</h1>
          )}

          <p className="mx-auto mt-8 max-w-[270px] text-xs leading-5 opacity-75">
            {invitation?.description || "Kami mengundang Anda untuk hadir dan menjadi bagian dari acara ini."}
          </p>
        </div>
      </div>

      <div className="px-8 pb-10 text-center">
        <div className="mx-auto h-px w-16" style={{ background: palette.soft }} />
        <p className="mt-6 text-[11px] uppercase tracking-[0.18em]" style={{ color: palette.accent }}>{formatEventDate(invitation)}</p>
        {(startTime || endTime) && (
          <p className="mt-2 text-xs opacity-70">
            {startTime ? `Mulai ${startTime}` : ""}{startTime && endTime ? " · " : ""}{endTime ? `Selesai ${endTime}` : ""} {timezone.label}
          </p>
        )}
        <p className="mt-3 text-sm">{invitation?.venue || "Lokasi belum diatur"}</p>
        {invitation?.address && <p className="mx-auto mt-1 max-w-[270px] text-xs opacity-65">{invitation.address}</p>}
        {invitation?.mapUrl && (
          <a href={invitation.mapUrl} target="_blank" rel="noreferrer" className="mt-4 inline-block text-xs font-semibold" style={{ color: palette.accent }}>
            Lihat lokasi di Maps
          </a>
        )}
        {invitation?.eventNotes && <p className="mx-auto mt-6 max-w-[270px] text-xs leading-5 opacity-65">{invitation.eventNotes}</p>}
        {eventTag && <p className="mt-8 text-xs" style={{ color: palette.accent }}>{eventTag}</p>}
      </div>
    </div>
  );
}
