"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Eye,
  FilePenLine,
  Gift,
  ImagePlus,
  LayoutTemplate,
  MessageCircleHeart,
  Music2,
  Palette,
  Redo2,
  Save,
  SlidersHorizontal,
  Type,
  Undo2,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { weddingParentLine } from "@/lib/events/parents";
import {
  getEventCategory,
  getIndonesiaTimezone,
  normalizeEventCategory,
  type EventCategory,
} from "@/lib/events/catalog";
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
  parseInvitationSections,
  withInvitationSections,
  type InvitationSectionKey,
  type InvitationSections,
} from "@/lib/templates/sections";

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
  giftBankName?: string | null;
  giftAccountName?: string | null;
  giftAccountNumber?: string | null;
  assets: {
    id: string;
    type: "IMAGE" | "AUDIO";
    url: string;
    title: string | null;
  }[];
};

type Panel =
  | "template"
  | "sections"
  | "color"
  | "font"
  | "content"
  | "decor"
  | "music";

type ContentForm = {
  eventTag: string;
  dressCode: string;
};

type DesignState = {
  template: string;
  palette: PaletteKey;
  font: FontKey;
  decor: string;
  sections: InvitationSections;
};

const decor = [
  "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&q=80&w=700",
  "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&q=80&w=700",
  "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=700",
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

function makeStateKey(state: DesignState) {
  return withInvitationSections(
    makeDesignKey(state.template, state.palette, state.font, state.decor),
    state.sections,
  );
}

function stateFromKey(key: string, fallbackDecor: string): DesignState {
  const parsed = parseDesignKey(key);
  return {
    template: parsed.template,
    palette: parsed.palette,
    font: parsed.font,
    decor: parsed.decor || fallbackDecor,
    sections: parseInvitationSections(key),
  };
}

export default function InvitationDesignerV2() {
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
  const [design, setDesign] = useState<DesignState>({
    template: "botanical-ivory",
    palette: "pearl",
    font: "cinzelFauna",
    decor: decor[0],
    sections: { rsvp: true, wishes: true, gift: true },
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

    const response = await fetch(`/api/invitations${query}`, {
      cache: "no-store",
    });
    const data = await response.json();
    if (!response.ok || !data.invitation) {
      throw new Error(data.error || "Undangan belum dapat dimuat.");
    }

    const next = data.invitation as Invitation;
    const fallbackDecor =
      next.assets.find((asset) => asset.type === "IMAGE")?.url || decor[0];
    setInvitation(next);
    setMusicUrl(next.musicUrl || "");
    setContent({
      eventTag: next.weddingHashtag || "",
      dressCode: next.dressCode || "",
    });
    setDesign(stateFromKey(next.templateKey, fallbackDecor));
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
    invitationTemplates.find((item) => item.key === design.template) ||
    invitationTemplates[0];
  const palette = invitationPalettes[design.palette];
  const fontPair = invitationFonts[design.font];
  const designKey = makeStateKey(design);
  const identity = eventIdentity(invitation);
  const templates = useMemo(() => invitationTemplates, []);

  function change(next: Partial<DesignState>) {
    setHistory((current) => [...current.slice(-14), designKey]);
    setFuture([]);
    setDesign((current) => ({ ...current, ...next }));
  }

  function setSection(section: InvitationSectionKey, enabled: boolean) {
    change({
      sections: {
        ...design.sections,
        [section]: enabled,
      },
    });
  }

  function undo() {
    const key = history.at(-1);
    if (!key) return;
    setFuture((current) => [...current, designKey]);
    setDesign(stateFromKey(key, design.decor));
    setHistory((current) => current.slice(0, -1));
  }

  function redo() {
    const key = future.at(-1);
    if (!key) return;
    setHistory((current) => [...current, designKey]);
    setDesign(stateFromKey(key, design.decor));
    setFuture((current) => current.slice(0, -1));
  }

  async function uploadAsset(file: File, assetType: "IMAGE" | "AUDIO") {
    if (!invitation) return;
    setNotice(
      assetType === "IMAGE" ? "Mengunggah foto..." : "Mengunggah musik...",
    );
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
      if (assetType === "IMAGE") {
        change({ decor: data.asset.url });
      } else {
        setMusicUrl(data.asset.url);
      }
      setNotice(
        assetType === "IMAGE"
          ? "Foto berhasil diunggah."
          : "Musik berhasil diunggah.",
      );
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Upload gagal.");
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
          weddingHashtag: content.eventTag,
          dressCode: content.dressCode,
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
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            size="icon-sm"
            onClick={redo}
            disabled={!future.length}
            aria-label="Ulangi perubahan desain"
            title="Redo"
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

      <div className="grid min-h-[calc(100vh-128px)] lg:grid-cols-[96px_390px_minmax(0,1fr)]">
        <aside className="border-r border-border/70 bg-background p-2">
          <Tool
            active={panel === "template"}
            label="Template"
            icon={<LayoutTemplate className="h-4 w-4" />}
            onClick={() => setPanel("template")}
          />
          <Tool
            active={panel === "sections"}
            label="Section"
            icon={<SlidersHorizontal className="h-4 w-4" />}
            onClick={() => setPanel("sections")}
          />
          <Tool
            active={panel === "color"}
            label="Warna"
            icon={<Palette className="h-4 w-4" />}
            onClick={() => setPanel("color")}
          />
          <Tool
            active={panel === "font"}
            label="Font"
            icon={<Type className="h-4 w-4" />}
            onClick={() => setPanel("font")}
          />
          <div className="my-1 border-t border-border/60" />
          <Tool
            active={panel === "content"}
            label="Isi"
            icon={<FilePenLine className="h-4 w-4" />}
            onClick={() => setPanel("content")}
          />
          <Tool
            active={panel === "decor"}
            label="Foto"
            icon={<ImagePlus className="h-4 w-4" />}
            onClick={() => setPanel("decor")}
          />
          <Tool
            active={panel === "music"}
            label="Musik"
            icon={<Music2 className="h-4 w-4" />}
            onClick={() => setPanel("music")}
          />
        </aside>

        <aside className="overflow-y-auto border-r border-border/70 bg-background p-5">
          {panel === "template" && (
            <TemplatePanel
              templates={templates}
              selected={design.template}
              onSelect={(value) => change({ template: value })}
            />
          )}
          {panel === "sections" && (
            <SectionsPanel
              sections={design.sections}
              onChange={setSection}
            />
          )}
          {panel === "color" && (
            <ColorPanel
              selected={design.palette}
              onSelect={(value) => change({ palette: value })}
            />
          )}
          {panel === "font" && (
            <FontPanel
              selected={design.font}
              onSelect={(value) => change({ font: value })}
            />
          )}
          {panel === "content" && (
            <ContentPanel
              invitation={invitation}
              eventTag={content.eventTag}
              dressCode={content.dressCode}
              setEventTag={(value) =>
                setContent((current) => ({ ...current, eventTag: value }))
              }
              setDressCode={(value) =>
                setContent((current) => ({ ...current, dressCode: value }))
              }
            />
          )}
          {panel === "decor" && (
            <DecorPanel
              selected={design.decor}
              onSelect={(value) => change({ decor: value })}
              onUpload={(file) => uploadAsset(file, "IMAGE")}
            />
          )}
          {panel === "music" && (
            <MusicPanel
              musicUrl={musicUrl}
              setMusicUrl={setMusicUrl}
              onUpload={(file) => uploadAsset(file, "AUDIO")}
            />
          )}
        </aside>

        <main className="flex items-start justify-center overflow-auto bg-primary/[0.045] p-6 sm:p-10">
          <div className="w-[390px] max-w-full origin-top">
            <InvitationCanvas
              invitation={invitation}
              templateKey={design.template}
              palette={palette}
              fontPair={fontPair}
              decorUrl={design.decor}
              eventTag={content.eventTag}
              sections={design.sections}
            />
          </div>
        </main>
      </div>

      {preview && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/65 p-4"
          onClick={() => setPreview(false)}
        >
          <div
            className="relative max-h-[92vh] overflow-auto rounded-[28px] bg-background p-3"
            onClick={(event) => event.stopPropagation()}
          >
            <Button
              size="icon-sm"
              onClick={() => setPreview(false)}
              className="absolute right-4 top-4 z-20"
              aria-label="Tutup pratinjau"
              title="Tutup pratinjau"
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="w-[390px] max-w-[86vw]">
              <InvitationCanvas
                invitation={invitation}
                templateKey={design.template}
                palette={palette}
                fontPair={fontPair}
                decorUrl={design.decor}
                eventTag={content.eventTag}
                sections={design.sections}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Tool({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Button
      onClick={onClick}
      className={`mb-1 grid h-auto min-h-[64px] w-full justify-items-center gap-1 px-2 py-2 text-[10px] ${
        active ? "ring-2 ring-primary/35" : ""
      }`}
      aria-pressed={active}
    >
      {icon}
      <span>{label}</span>
    </Button>
  );
}

function Heading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="font-[family-name:var(--font-cinzel)] text-lg font-semibold text-foreground">
        {title}
      </h2>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function TemplatePanel({
  templates,
  selected,
  onSelect,
}: {
  templates: typeof invitationTemplates;
  selected: string;
  onSelect: (key: string) => void;
}) {
  return (
    <div>
      <Heading
        title="Template Undangan"
        description="Pilih template. Canvas di kanan langsung mengikuti struktur template yang dipilih."
      />
      <div className="mt-5 grid gap-3">
        {templates.map((item) => (
          <button
            type="button"
            key={item.key}
            onClick={() => onSelect(item.key)}
            className={`overflow-hidden rounded-xl border text-left transition ${
              selected === item.key
                ? "border-primary ring-2 ring-primary/20"
                : "border-border hover:border-primary/40"
            }`}
          >
            <span className="relative block">
              <img
                src={item.previewImage}
                alt=""
                className="h-28 w-full object-cover"
              />
              {selected === item.key && (
                <span className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-primary text-white dark:text-black">
                  <Check className="h-4 w-4" />
                </span>
              )}
            </span>
            <span className="block bg-background p-3.5">
              <span className="block font-[family-name:var(--font-cinzel)] text-xs font-semibold text-foreground">
                {item.name}
              </span>
              <span className="mt-1 block text-[10px] leading-4 text-muted-foreground">
                {item.description}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function SectionsPanel({
  sections,
  onChange,
}: {
  sections: InvitationSections;
  onChange: (section: InvitationSectionKey, enabled: boolean) => void;
}) {
  const items: {
    key: InvitationSectionKey;
    title: string;
    description: string;
    icon: React.ReactNode;
  }[] = [
    {
      key: "rsvp",
      title: "RSVP",
      description: "Form konfirmasi kehadiran.",
      icon: <Check className="h-4 w-4" />,
    },
    {
      key: "wishes",
      title: "Wishes",
      description: "Section ucapan dan doa tamu.",
      icon: <MessageCircleHeart className="h-4 w-4" />,
    },
    {
      key: "gift",
      title: "Gift / E-Angpao",
      description: "Informasi transfer hadiah digital.",
      icon: <Gift className="h-4 w-4" />,
    },
  ];

  return (
    <div>
      <Heading
        title="Section Undangan"
        description="Nyalakan hanya section yang dibutuhkan. Pengaturan ikut tersimpan bersama desain."
      />
      <div className="mt-5 space-y-2">
        {items.map((item) => (
          <label
            key={item.key}
            className="flex min-h-16 cursor-pointer items-center gap-3 rounded-xl border border-border bg-background p-3"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/[0.08] text-primary">
              {item.icon}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold text-foreground">
                {item.title}
              </span>
              <span className="mt-0.5 block text-[10px] leading-4 text-muted-foreground">
                {item.description}
              </span>
            </span>
            <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={sections[item.key]}
                onChange={(event) => onChange(item.key, event.target.checked)}
              />
              <span className="absolute inset-0 rounded-full bg-border transition peer-checked:bg-primary" />
              <span className="absolute left-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function ColorPanel({
  selected,
  onSelect,
}: {
  selected: PaletteKey;
  onSelect: (key: PaletteKey) => void;
}) {
  return (
    <div>
      <Heading
        title="Palet warna"
        description="Warna ini hanya untuk isi undangan."
      />
      <div className="mt-5 space-y-2">
        {palettes.map(([key, item]) => (
          <button
            type="button"
            key={key}
            onClick={() => onSelect(key)}
            className={`flex min-h-14 w-full items-center gap-3 rounded-xl border px-3 text-left ${
              selected === key
                ? "border-primary ring-2 ring-primary/20"
                : "border-border"
            }`}
          >
            <span className="flex h-8 w-12 shrink-0 overflow-hidden rounded-lg">
              <i className="flex-1" style={{ background: item.bg }} />
              <i className="flex-1" style={{ background: item.accent }} />
              <i className="flex-1" style={{ background: item.soft }} />
            </span>
            <span className="text-xs font-semibold text-foreground">
              {item.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function FontPanel({
  selected,
  onSelect,
}: {
  selected: FontKey;
  onSelect: (key: FontKey) => void;
}) {
  return (
    <div>
      <Heading
        title="Font pairing"
        description="Tipografi langsung diterapkan pada canvas."
      />
      <div className="mt-5 space-y-2">
        {fonts.map(([key, item]) => (
          <button
            type="button"
            key={key}
            onClick={() => onSelect(key)}
            className={`w-full rounded-xl border px-3 py-3 text-left ${
              selected === key
                ? "border-primary ring-2 ring-primary/20"
                : "border-border"
            }`}
          >
            <span className="block text-[10px] text-muted-foreground">
              {item.name}
            </span>
            <span
              className="mt-1 block text-lg text-foreground"
              style={{ fontFamily: item.heading }}
            >
              Aa Bb
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ContentPanel({
  invitation,
  eventTag,
  dressCode,
  setEventTag,
  setDressCode,
}: {
  invitation: Invitation | null;
  eventTag: string;
  dressCode: string;
  setEventTag: (value: string) => void;
  setDressCode: (value: string) => void;
}) {
  return (
    <div>
      <Heading
        title="Isi undangan"
        description="Nama, tanggal, waktu, lokasi, dan orang tua tetap mengikuti Rangkaian Acara."
      />
      <div className="mt-5 rounded-xl border border-border p-4">
        <p className="text-xs font-semibold text-foreground">
          {invitation?.title || "Acara"}
        </p>
        <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
          {formatEventDate(invitation)} · {invitation?.venue || "Lokasi belum diatur"}
        </p>
      </div>
      <div className="mt-4 space-y-3">
        <label className="block text-[11px] font-semibold">
          Tag / hashtag acara
          <input
            value={eventTag}
            onChange={(event) => setEventTag(event.target.value)}
            className="mt-1.5 w-full rounded-[10px] border border-border bg-background px-3 py-2.5 text-xs font-normal outline-none focus:border-primary"
            placeholder="#AcaraKita"
          />
        </label>
        <label className="block text-[11px] font-semibold">
          Dress code
          <input
            value={dressCode}
            onChange={(event) => setDressCode(event.target.value)}
            className="mt-1.5 w-full rounded-[10px] border border-border bg-background px-3 py-2.5 text-xs font-normal outline-none focus:border-primary"
            placeholder="Formal / Batik / Pastel"
          />
        </label>
      </div>
    </div>
  );
}

function DecorPanel({
  selected,
  onSelect,
  onUpload,
}: {
  selected: string;
  onSelect: (value: string) => void;
  onUpload: (file: File) => void;
}) {
  return (
    <div>
      <Heading
        title="Foto & dekorasi"
        description="Pilih visual bawaan atau unggah foto sendiri."
      />
      <div className="mt-5 grid grid-cols-3 gap-2">
        {decor.map((item) => (
          <button
            type="button"
            key={item}
            onClick={() => onSelect(item)}
            className={`overflow-hidden rounded-xl border ${
              selected === item ? "border-primary" : "border-border"
            }`}
          >
            <img src={item} alt="" className="aspect-square w-full object-cover" />
          </button>
        ))}
      </div>
      <label className="mt-4 flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-dashed border-primary/30 px-3 py-3 text-xs font-semibold text-primary">
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
    </div>
  );
}

function MusicPanel({
  musicUrl,
  setMusicUrl,
  onUpload,
}: {
  musicUrl: string;
  setMusicUrl: (value: string) => void;
  onUpload: (file: File) => void;
}) {
  return (
    <div>
      <Heading
        title="Musik"
        description="Gunakan URL audio atau unggah satu track."
      />
      <input
        value={musicUrl}
        onChange={(event) => setMusicUrl(event.target.value)}
        placeholder="https://.../music.mp3"
        className="mt-5 w-full rounded-[10px] border border-border bg-background px-3 py-3 text-xs outline-none focus:border-primary"
      />
      <label className="mt-3 flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-dashed border-primary/30 px-3 py-3 text-xs font-semibold text-primary">
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
    </div>
  );
}

function Divider({ color }: { color: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-6 opacity-60">
      <span className="h-px w-12" style={{ background: color }} />
      <span className="text-[8px]">◇</span>
      <span className="h-px w-12" style={{ background: color }} />
    </div>
  );
}

function InvitationCanvas({
  invitation,
  templateKey,
  palette,
  fontPair,
  decorUrl,
  eventTag,
  sections,
}: {
  invitation: Invitation | null;
  templateKey: string;
  palette: (typeof invitationPalettes)[PaletteKey];
  fontPair: (typeof invitationFonts)[FontKey];
  decorUrl: string;
  eventTag: string;
  sections: InvitationSections;
}) {
  if (templateKey === "botanical-ivory") {
    return (
      <BotanicalIvoryCanvas
        invitation={invitation}
        palette={palette}
        fontPair={fontPair}
        decorUrl={decorUrl}
        eventTag={eventTag}
        sections={sections}
      />
    );
  }

  return (
    <AdaptiveCanvas
      invitation={invitation}
      templateKey={templateKey}
      palette={palette}
      fontPair={fontPair}
      decorUrl={decorUrl}
      eventTag={eventTag}
      sections={sections}
    />
  );
}

function BotanicalIvoryCanvas({
  invitation,
  palette,
  fontPair,
  decorUrl,
  eventTag,
  sections,
}: {
  invitation: Invitation | null;
  palette: (typeof invitationPalettes)[PaletteKey];
  fontPair: (typeof invitationFonts)[FontKey];
  decorUrl: string;
  eventTag: string;
  sections: InvitationSections;
}) {
  const identity = eventIdentity(invitation);
  const timezone = getIndonesiaTimezone(invitation?.timezone || "Asia/Jakarta");
  const groomParents =
    identity.category === "WEDDING"
      ? weddingParentLine(
          invitation?.groomFatherName,
          invitation?.groomMotherName,
        )
      : "";
  const brideParents =
    identity.category === "WEDDING"
      ? weddingParentLine(
          invitation?.brideFatherName,
          invitation?.brideMotherName,
        )
      : "";

  return (
    <div
      className="overflow-hidden rounded-[28px] border shadow-[0_24px_70px_rgba(66,42,33,.16)]"
      style={{
        background: palette.surface,
        borderColor: palette.soft,
        color: palette.ink,
        fontFamily: fontPair.body,
      }}
    >
      <section className="px-7 pb-7 pt-9 text-center">
        <div
          className="mx-auto grid h-12 w-12 place-items-center rounded-full border text-[11px]"
          style={{ borderColor: palette.soft, color: palette.accent }}
        >
          DC
        </div>
        <p
          className="mt-6 text-[9px] uppercase tracking-[0.24em]"
          style={{ color: palette.accent }}
        >
          {identity.label}
        </p>
        <h1
          className="mt-2 text-3xl leading-tight"
          style={{ fontFamily: fontPair.heading }}
        >
          {identity.secondary
            ? `${identity.primary} & ${identity.secondary}`
            : identity.primary}
        </h1>
        <div
          className="relative mx-auto mt-7 aspect-[4/5] w-[230px] overflow-hidden rounded-[115px_115px_34px_34px] border"
          style={{ borderColor: palette.soft, background: palette.bg }}
        >
          {decorUrl && (
            <img
              src={decorUrl}
              alt=""
              className="h-full w-full object-cover opacity-85"
            />
          )}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, transparent 58%, ${palette.surface})`,
            }}
          />
        </div>
        <p className="mt-5 text-sm" style={{ fontFamily: fontPair.heading }}>
          {formatEventDate(invitation)}
        </p>
        <p className="mt-1 text-[10px] opacity-65">
          {invitation?.venue || "Lokasi belum diatur"}
        </p>
      </section>

      <Divider color={palette.soft} />

      <section className="px-8 text-center">
        <p className="text-[11px] leading-5 opacity-65">
          {invitation?.description ||
            "Dengan penuh kebahagiaan, kami mengundang Anda untuk hadir dan menjadi bagian dari momen istimewa ini."}
        </p>
        {identity.secondary ? (
          <div className="mt-8 space-y-5">
            <div>
              <h2
                className="text-2xl"
                style={{ fontFamily: fontPair.heading }}
              >
                {identity.primary}
              </h2>
              {groomParents && (
                <p className="mt-1 text-[9px] leading-4 opacity-60">
                  {groomParents}
                </p>
              )}
            </div>
            <p className="text-xs opacity-45">&</p>
            <div>
              <h2
                className="text-2xl"
                style={{ fontFamily: fontPair.heading }}
              >
                {identity.secondary}
              </h2>
              {brideParents && (
                <p className="mt-1 text-[9px] leading-4 opacity-60">
                  {brideParents}
                </p>
              )}
            </div>
          </div>
        ) : null}
      </section>

      <Divider color={palette.soft} />

      <section className="px-8 text-center">
        <p
          className="text-[8px] uppercase tracking-[0.2em]"
          style={{ color: palette.accent }}
        >
          Save The Date
        </p>
        <h2
          className="mt-2 text-2xl"
          style={{ fontFamily: fontPair.heading }}
        >
          Waktu & Lokasi
        </h2>
        <div className="mt-5 grid gap-3">
          <div
            className="rounded-xl border p-4"
            style={{ borderColor: palette.soft, background: palette.bg }}
          >
            <p className="text-xs font-semibold">Mulai</p>
            <p className="mt-1 text-[10px] opacity-65">
              {invitation?.ceremonyTime || "--:--"} {timezone.label}
            </p>
          </div>
          {invitation?.receptionTime && (
            <div
              className="rounded-xl p-4"
              style={{ background: palette.ink, color: palette.surface }}
            >
              <p className="text-xs font-semibold">Selesai</p>
              <p className="mt-1 text-[10px] opacity-75">
                {invitation.receptionTime} {timezone.label}
              </p>
            </div>
          )}
        </div>
        <p
          className="mt-5 text-lg"
          style={{ fontFamily: fontPair.heading }}
        >
          {invitation?.venue || "Lokasi belum diatur"}
        </p>
        {invitation?.address && (
          <p className="mt-1 text-[10px] leading-4 opacity-60">
            {invitation.address}
          </p>
        )}
      </section>

      {sections.rsvp && (
        <>
          <Divider color={palette.soft} />
          <PreviewSection
            eyebrow="Kehadiran"
            title="Konfirmasi RSVP"
            description="Form konfirmasi kehadiran akan tampil di sini."
            palette={palette}
            fontPair={fontPair}
          >
            <div className="space-y-2">
              <PreviewField label="Nama Tamu" />
              <PreviewField label="Konfirmasi Kehadiran" />
              <PreviewField label="Jumlah Tamu" />
              <div
                className="rounded-lg px-3 py-2 text-center text-[9px] font-semibold"
                style={{ background: palette.ink, color: palette.surface }}
              >
                KIRIM KONFIRMASI
              </div>
            </div>
          </PreviewSection>
        </>
      )}

      {sections.wishes && (
        <>
          <Divider color={palette.soft} />
          <PreviewSection
            eyebrow="Ucapan & Doa"
            title="Wishes"
            description="Tamu dapat meninggalkan ucapan untuk acara Anda."
            palette={palette}
            fontPair={fontPair}
          >
            <div
              className="rounded-xl border p-4 text-left"
              style={{ borderColor: palette.soft, background: palette.bg }}
            >
              <p className="text-[10px] font-semibold">Tulis ucapan Anda</p>
              <p className="mt-2 text-[9px] leading-4 opacity-55">
                Semoga acara berjalan lancar dan menjadi momen yang penuh kebahagiaan.
              </p>
            </div>
          </PreviewSection>
        </>
      )}

      {sections.gift && (
        <>
          <Divider color={palette.soft} />
          <PreviewSection
            eyebrow="Tanda Kasih"
            title="Gift"
            description="Section hadiah digital hanya tampil jika Anda mengaktifkannya."
            palette={palette}
            fontPair={fontPair}
          >
            <div
              className="rounded-xl border p-4 text-left"
              style={{ borderColor: palette.soft, background: palette.bg }}
            >
              <p className="text-[9px] uppercase tracking-[0.14em] opacity-55">
                Transfer Bank
              </p>
              <p className="mt-2 text-xs font-semibold">
                {invitation?.giftBankName || "Bank"}
              </p>
              <p className="mt-1 text-[10px] opacity-65">
                {invitation?.giftAccountName || "Nama Pemilik"}
              </p>
              <p className="mt-1 text-[10px] font-semibold">
                {invitation?.giftAccountNumber || "Nomor rekening"}
              </p>
            </div>
          </PreviewSection>
        </>
      )}

      <Divider color={palette.soft} />
      <footer className="px-8 pb-9 text-center">
        {eventTag && (
          <p className="text-[10px]" style={{ color: palette.accent }}>
            {eventTag}
          </p>
        )}
        <p className="mt-3 text-[9px] opacity-50">DC Organizer</p>
      </footer>
    </div>
  );
}

function AdaptiveCanvas({
  invitation,
  templateKey,
  palette,
  fontPair,
  decorUrl,
  eventTag,
  sections,
}: {
  invitation: Invitation | null;
  templateKey: string;
  palette: (typeof invitationPalettes)[PaletteKey];
  fontPair: (typeof invitationFonts)[FontKey];
  decorUrl: string;
  eventTag: string;
  sections: InvitationSections;
}) {
  const identity = eventIdentity(invitation);
  const darkHero = templateKey === "midnight-romance" || templateKey === "modern-maroon";
  const squareHero = templateKey === "modern-maroon";
  const centeredCard = templateKey === "classic-pearl";

  return (
    <div
      className={`${centeredCard ? "rounded-[10px]" : "rounded-[28px]"} overflow-hidden border shadow-[0_24px_70px_rgba(66,42,33,.16)]`}
      style={{
        background: palette.surface,
        borderColor: palette.soft,
        color: palette.ink,
        fontFamily: fontPair.body,
      }}
    >
      <section
        className="relative overflow-hidden px-7 py-12 text-center"
        style={{
          background: darkHero ? palette.ink : palette.bg,
          color: darkHero ? palette.surface : palette.ink,
        }}
      >
        {decorUrl && (
          <img
            src={decorUrl}
            alt=""
            className={`mx-auto mb-8 object-cover ${
              squareHero
                ? "h-48 w-full rounded-xl"
                : centeredCard
                  ? "h-52 w-40 rounded-[80px]"
                  : "h-48 w-48 rounded-full"
            }`}
          />
        )}
        <p className="text-[9px] uppercase tracking-[0.22em] opacity-65">
          {identity.label}
        </p>
        <h1
          className="mt-4 text-4xl leading-tight"
          style={{ fontFamily: fontPair.heading }}
        >
          {identity.secondary
            ? `${identity.primary} & ${identity.secondary}`
            : identity.primary}
        </h1>
        <p className="mt-5 text-xs opacity-70">{formatEventDate(invitation)}</p>
      </section>

      <section className="px-8 py-8 text-center">
        <p className="text-xs leading-5 opacity-65">
          {invitation?.description ||
            "Kami mengundang Anda untuk hadir dan menjadi bagian dari acara ini."}
        </p>
        <p className="mt-6 text-sm font-semibold">
          {invitation?.venue || "Lokasi belum diatur"}
        </p>
        {invitation?.address && (
          <p className="mt-1 text-[10px] opacity-55">{invitation.address}</p>
        )}
      </section>

      {sections.rsvp && (
        <PreviewSection
          eyebrow="Kehadiran"
          title="RSVP"
          description="Konfirmasi kehadiran tamu."
          palette={palette}
          fontPair={fontPair}
        >
          <PreviewField label="Nama Tamu" />
        </PreviewSection>
      )}
      {sections.wishes && (
        <PreviewSection
          eyebrow="Ucapan"
          title="Wishes"
          description="Ucapan dan doa dari tamu."
          palette={palette}
          fontPair={fontPair}
        />
      )}
      {sections.gift && (
        <PreviewSection
          eyebrow="Tanda Kasih"
          title="Gift"
          description="Informasi gift atau e-angpao."
          palette={palette}
          fontPair={fontPair}
        />
      )}

      {eventTag && (
        <p className="px-8 pb-8 text-center text-[10px]" style={{ color: palette.accent }}>
          {eventTag}
        </p>
      )}
    </div>
  );
}

function PreviewSection({
  eyebrow,
  title,
  description,
  palette,
  fontPair,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  palette: (typeof invitationPalettes)[PaletteKey];
  fontPair: (typeof invitationFonts)[FontKey];
  children?: React.ReactNode;
}) {
  return (
    <section className="px-8 py-8 text-center">
      <p
        className="text-[8px] uppercase tracking-[0.2em]"
        style={{ color: palette.accent }}
      >
        {eyebrow}
      </p>
      <h2
        className="mt-2 text-2xl"
        style={{ fontFamily: fontPair.heading }}
      >
        {title}
      </h2>
      <p className="mx-auto mt-2 max-w-[270px] text-[10px] leading-4 opacity-60">
        {description}
      </p>
      {children && <div className="mt-5">{children}</div>}
    </section>
  );
}

function PreviewField({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-black/10 bg-white/65 px-3 py-2 text-left text-[9px] text-black/45">
      {label}
    </div>
  );
}
