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
  Save,
  SlidersHorizontal,
  Type,
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
  timezone: string;
  eventDate: string;
  ceremonyTime: string | null;
  receptionTime: string | null;
  description: string | null;
  weddingHashtag: string | null;
  dressCode: string | null;
  musicUrl: string | null;
  templateKey: string;
  isPublished: boolean;
  giftBankName?: string | null;
  giftAccountName?: string | null;
  giftAccountNumber?: string | null;
  assets: { id: string; type: "IMAGE" | "AUDIO"; url: string; title: string | null }[];
};

type Panel = "template" | "sections" | "color" | "font" | "content" | "decor" | "music";

type DesignState = {
  template: string;
  palette: PaletteKey;
  font: FontKey;
  decor: string;
  sections: InvitationSections;
};

type TemplateSpec = {
  palette: PaletteKey;
  font: FontKey;
  frame: "botanical" | "editorial" | "maroon" | "garden" | "midnight" | "classic";
};

const defaultDecor = [
  "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&q=80&w=700",
  "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&q=80&w=700",
  "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=700",
];

const templateSpecs: Record<string, TemplateSpec> = {
  "botanical-ivory": { palette: "pearl", font: "cinzelFauna", frame: "botanical" },
  "eternal-blossom": { palette: "blush", font: "playfairLora", frame: "editorial" },
  "modern-maroon": { palette: "maroon", font: "cinzelFauna", frame: "maroon" },
  "garden-light": { palette: "sage", font: "playfairLora", frame: "garden" },
  "midnight-romance": { palette: "midnight", font: "cinzelFauna", frame: "midnight" },
  "classic-pearl": { palette: "pearl", font: "playfairLora", frame: "classic" },
};

const paletteEntries = Object.entries(invitationPalettes) as [PaletteKey, (typeof invitationPalettes)[PaletteKey]][];
const fontEntries = Object.entries(invitationFonts) as [FontKey, (typeof invitationFonts)[FontKey]][];

function getSpec(key: string) {
  return templateSpecs[key] || templateSpecs["botanical-ivory"];
}

function identityFor(invitation: Invitation | null) {
  if (!invitation) return { category: normalizeEventCategory("OTHER"), label: "Event", first: "Nama acara", second: "" };
  const category = normalizeEventCategory(invitation.eventCategory);
  const info = getEventCategory(category);
  if (info.nameMode === "couple") {
    return {
      category,
      label: info.label,
      first: invitation.groomName || invitation.title || "Nama pertama",
      second: invitation.brideName || "Nama kedua",
    };
  }
  if (info.nameMode === "single") {
    return { category, label: info.label, first: invitation.groomName || invitation.title || "Nama utama", second: "" };
  }
  return { category, label: info.label, first: invitation.title || "Nama acara", second: "" };
}

function eventDate(invitation: Invitation | null) {
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

function stateFromKey(key: string, fallbackDecor: string): DesignState {
  const parsed = parseDesignKey(key);
  const spec = getSpec(parsed.template);
  const saved = key.trim().length > 0;
  return {
    template: saved ? parsed.template : "botanical-ivory",
    palette: saved ? parsed.palette : spec.palette,
    font: saved ? parsed.font : spec.font,
    decor: parsed.decor || fallbackDecor,
    sections: parseInvitationSections(key),
  };
}

function stateKey(state: DesignState) {
  return withInvitationSections(
    makeDesignKey(state.template, state.palette, state.font, state.decor),
    state.sections,
  );
}

export default function InvitationDesignerV4() {
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [panel, setPanel] = useState<Panel>("template");
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("Memuat undangan...");
  const [musicUrl, setMusicUrl] = useState("");
  const [eventTag, setEventTag] = useState("");
  const [dressCode, setDressCode] = useState("");
  const [design, setDesign] = useState<DesignState>({
    template: "botanical-ivory",
    palette: "pearl",
    font: "cinzelFauna",
    decor: defaultDecor[0],
    sections: { rsvp: true, wishes: true, gift: true },
  });

  useEffect(() => {
    async function load() {
      const params = new URLSearchParams(window.location.search);
      const invitationId = params.get("invitationId")?.trim() || "";
      const type = params.get("type") === "ADAT_AKAD" ? "ADAT_AKAD" : "WEDDING";
      if (!invitationId) throw new Error("Acara belum dipilih.");
      const response = await fetch(`/api/invitations?id=${encodeURIComponent(invitationId)}&type=${type}`, { cache: "no-store" });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.invitation) throw new Error(data?.error || "Undangan belum dapat dimuat.");
      const next = data.invitation as Invitation;
      const fallbackDecor = next.assets.find((asset) => asset.type === "IMAGE")?.url || defaultDecor[0];
      setInvitation(next);
      setMusicUrl(next.musicUrl || "");
      setEventTag(next.weddingHashtag || "");
      setDressCode(next.dressCode || "");
      setDesign(stateFromKey(next.templateKey, fallbackDecor));
      setNotice("Siap diedit.");
    }
    load().catch((error) => setNotice(error instanceof Error ? error.message : "Undangan belum dapat dimuat."));
  }, []);

  const templates = useMemo(() => invitationTemplates, []);
  const palette = invitationPalettes[design.palette];
  const fontPair = invitationFonts[design.font];
  const activeTemplate = templates.find((item) => item.key === design.template) || templates[0];

  function selectTemplate(templateKey: string) {
    const spec = getSpec(templateKey);
    setDesign((current) => ({ ...current, template: templateKey, palette: spec.palette, font: spec.font }));
    setNotice(`Template ${templates.find((item) => item.key === templateKey)?.name || templateKey} diterapkan ke canvas.`);
  }

  function setSection(section: InvitationSectionKey, enabled: boolean) {
    setDesign((current) => ({ ...current, sections: { ...current.sections, [section]: enabled } }));
  }

  async function uploadAsset(file: File, assetType: "IMAGE" | "AUDIO") {
    if (!invitation) return;
    setNotice(assetType === "IMAGE" ? "Mengunggah foto..." : "Mengunggah musik...");
    try {
      const formData = new FormData();
      formData.append("invitationId", invitation.id);
      formData.append("type", assetType);
      formData.append("file", file);
      const response = await fetch("/api/invitations/assets/upload", { method: "POST", body: formData });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "Upload gagal.");
      setInvitation((current) => current ? { ...current, assets: [...current.assets, data.asset] } : current);
      if (assetType === "IMAGE") setDesign((current) => ({ ...current, decor: data.asset.url }));
      else setMusicUrl(data.asset.url);
      setNotice(assetType === "IMAGE" ? "Foto berhasil diunggah." : "Musik berhasil diunggah.");
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
          templateKey: stateKey(design),
          musicUrl,
          weddingHashtag: eventTag,
          dressCode,
          isPublished: invitation.isPublished,
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "Gagal menyimpan desain.");
      setInvitation(data.invitation);
      setNotice("Desain tersimpan.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Gagal menyimpan desain.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="dc-invitation-studio-shell min-h-[calc(100vh-64px)] bg-background text-foreground">
      <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-border/70 bg-background px-5 py-3 sm:px-7">
        <div>
          <p className="font-[family-name:var(--font-dc-heading)] text-sm tracking-[0.14em] text-primary">INVITATION STUDIO</p>
          <p className="mt-1 text-[11px] text-muted-foreground">{activeTemplate.name} · {notice}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setPreview(true)}><Eye className="h-4 w-4" />Pratinjau</Button>
          <Button size="sm" onClick={save} disabled={saving || !invitation}><Save className="h-4 w-4" />{saving ? "Menyimpan..." : "Simpan desain"}</Button>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-128px)] lg:grid-cols-[96px_390px_minmax(0,1fr)]">
        <aside className="border-r border-border/70 bg-background p-2">
          <Tool active={panel === "template"} label="Template" icon={<LayoutTemplate className="h-4 w-4" />} onClick={() => setPanel("template")} />
          <Tool active={panel === "sections"} label="Section" icon={<SlidersHorizontal className="h-4 w-4" />} onClick={() => setPanel("sections")} />
          <Tool active={panel === "color"} label="Warna" icon={<Palette className="h-4 w-4" />} onClick={() => setPanel("color")} />
          <Tool active={panel === "font"} label="Font" icon={<Type className="h-4 w-4" />} onClick={() => setPanel("font")} />
          <div className="my-1 border-t border-border/60" />
          <Tool active={panel === "content"} label="Isi" icon={<FilePenLine className="h-4 w-4" />} onClick={() => setPanel("content")} />
          <Tool active={panel === "decor"} label="Foto" icon={<ImagePlus className="h-4 w-4" />} onClick={() => setPanel("decor")} />
          <Tool active={panel === "music"} label="Musik" icon={<Music2 className="h-4 w-4" />} onClick={() => setPanel("music")} />
        </aside>

        <aside className="overflow-y-auto border-r border-border/70 bg-background p-5">
          {panel === "template" && <TemplatePanel selected={design.template} onSelect={selectTemplate} />}
          {panel === "sections" && <SectionsPanel sections={design.sections} onChange={setSection} />}
          {panel === "color" && <ColorPanel selected={design.palette} onSelect={(value) => setDesign((current) => ({ ...current, palette: value }))} />}
          {panel === "font" && <FontPanel selected={design.font} onSelect={(value) => setDesign((current) => ({ ...current, font: value }))} />}
          {panel === "content" && <ContentPanel invitation={invitation} eventTag={eventTag} dressCode={dressCode} setEventTag={setEventTag} setDressCode={setDressCode} />}
          {panel === "decor" && <DecorPanel selected={design.decor} onSelect={(value) => setDesign((current) => ({ ...current, decor: value }))} onUpload={(file) => uploadAsset(file, "IMAGE")} />}
          {panel === "music" && <MusicPanel value={musicUrl} onChange={setMusicUrl} onUpload={(file) => uploadAsset(file, "AUDIO")} />}
        </aside>

        <main className="flex items-start justify-center overflow-auto bg-primary/[0.045] p-6 sm:p-10">
          <div className="w-[390px] max-w-full">
            <LiveCanvas
              key={design.template}
              invitation={invitation}
              templateKey={design.template}
              palette={palette}
              fontPair={fontPair}
              decorUrl={design.decor}
              eventTag={eventTag}
              dressCode={dressCode}
              sections={design.sections}
            />
          </div>
        </main>
      </div>

      {preview && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/65 p-4" onClick={() => setPreview(false)}>
          <div className="relative max-h-[92vh] overflow-auto rounded-[28px] bg-background p-3" onClick={(event) => event.stopPropagation()}>
            <Button size="icon-sm" onClick={() => setPreview(false)} className="absolute right-4 top-4 z-20" aria-label="Tutup pratinjau"><X className="h-4 w-4" /></Button>
            <div className="w-[390px] max-w-[86vw]">
              <LiveCanvas invitation={invitation} templateKey={design.template} palette={palette} fontPair={fontPair} decorUrl={design.decor} eventTag={eventTag} dressCode={dressCode} sections={design.sections} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Tool({ active, label, icon, onClick }: { active: boolean; label: string; icon: React.ReactNode; onClick: () => void }) {
  return <Button onClick={onClick} className={`mb-1 grid h-auto min-h-[64px] w-full justify-items-center gap-1 px-2 py-2 text-[10px] ${active ? "ring-2 ring-primary/35" : ""}`} aria-pressed={active}>{icon}<span>{label}</span></Button>;
}

function Heading({ title, description }: { title: string; description: string }) {
  return <div><h2 className="font-[family-name:var(--font-dc-heading)] text-lg font-semibold">{title}</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p></div>;
}

function TemplatePanel({ selected, onSelect }: { selected: string; onSelect: (key: string) => void }) {
  return <div><Heading title="Template Undangan" description="Klik template untuk mengganti seluruh komposisi canvas secara live." /><div className="mt-5 grid gap-3">{invitationTemplates.map((item) => <button type="button" key={item.key} onClick={() => onSelect(item.key)} className={`overflow-hidden rounded-xl border text-left transition ${selected === item.key ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/40"}`}><span className="relative block"><img src={item.previewImage} alt="" className="h-28 w-full object-cover" />{selected === item.key && <span className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-primary text-white dark:text-black"><Check className="h-4 w-4" /></span>}</span><span className="block bg-background p-3.5"><span className="block text-xs font-semibold">{item.name}</span><span className="mt-1 block text-[10px] leading-4 text-muted-foreground">{item.description}</span></span></button>)}</div></div>;
}

function SectionsPanel({ sections, onChange }: { sections: InvitationSections; onChange: (key: InvitationSectionKey, enabled: boolean) => void }) {
  const items: { key: InvitationSectionKey; title: string; description: string; icon: React.ReactNode }[] = [
    { key: "rsvp", title: "RSVP", description: "Form konfirmasi kehadiran.", icon: <Check className="h-4 w-4" /> },
    { key: "wishes", title: "Wishes", description: "Ucapan dan doa tamu.", icon: <MessageCircleHeart className="h-4 w-4" /> },
    { key: "gift", title: "Gift / E-Angpao", description: "Informasi hadiah digital.", icon: <Gift className="h-4 w-4" /> },
  ];
  return <div><Heading title="Section Undangan" description="Setiap section bisa dinyalakan atau dimatikan. Canvas langsung mengikuti tanpa menghapus data acara." /><div className="mt-5 space-y-2">{items.map((item) => <label key={item.key} className="flex min-h-16 cursor-pointer items-center gap-3 rounded-xl border border-border p-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/[0.08] text-primary">{item.icon}</span><span className="min-w-0 flex-1"><span className="block text-xs font-semibold">{item.title}</span><span className="mt-0.5 block text-[10px] text-muted-foreground">{item.description}</span></span><input type="checkbox" checked={sections[item.key]} onChange={(event) => onChange(item.key, event.target.checked)} className="h-5 w-5 accent-[var(--primary)]" /></label>)}</div></div>;
}

function ColorPanel({ selected, onSelect }: { selected: PaletteKey; onSelect: (key: PaletteKey) => void }) {
  return <div><Heading title="Palet warna" description="Template memberi warna awal, lalu bisa dioverride di sini." /><div className="mt-5 space-y-2">{paletteEntries.map(([key, item]) => <button type="button" key={key} onClick={() => onSelect(key)} className={`flex min-h-14 w-full items-center gap-3 rounded-xl border px-3 text-left ${selected === key ? "border-primary ring-2 ring-primary/20" : "border-border"}`}><span className="flex h-8 w-12 overflow-hidden rounded-lg"><i className="flex-1" style={{ background: item.bg }} /><i className="flex-1" style={{ background: item.accent }} /><i className="flex-1" style={{ background: item.soft }} /></span><span className="text-xs font-semibold">{item.name}</span></button>)}</div></div>;
}

function FontPanel({ selected, onSelect }: { selected: FontKey; onSelect: (key: FontKey) => void }) {
  return <div><Heading title="Font pairing" description="Tipografi langsung diterapkan ke canvas." /><div className="mt-5 space-y-2">{fontEntries.map(([key, item]) => <button type="button" key={key} onClick={() => onSelect(key)} className={`w-full rounded-xl border px-3 py-3 text-left ${selected === key ? "border-primary ring-2 ring-primary/20" : "border-border"}`}><span className="block text-[10px] text-muted-foreground">{item.name}</span><span className="mt-1 block text-lg" style={{ fontFamily: item.heading }}>Aa Bb</span></button>)}</div></div>;
}

function ContentPanel({ invitation, eventTag, dressCode, setEventTag, setDressCode }: { invitation: Invitation | null; eventTag: string; dressCode: string; setEventTag: (value: string) => void; setDressCode: (value: string) => void }) {
  return <div><Heading title="Isi undangan" description="Nama, tanggal, waktu, lokasi, dan orang tua tetap tersinkron dari Rangkaian Acara." /><div className="mt-5 rounded-xl border border-border p-4"><p className="text-xs font-semibold">{invitation?.title || "Acara"}</p><p className="mt-1 text-[10px] text-muted-foreground">{eventDate(invitation)} · {invitation?.venue || "Lokasi belum diatur"}</p></div><label className="mt-4 block text-[11px] font-semibold">Tag / hashtag acara<input value={eventTag} onChange={(event) => setEventTag(event.target.value)} className="mt-1.5 w-full rounded-[10px] border border-border bg-background px-3 py-2.5 text-xs font-normal" /></label><label className="mt-3 block text-[11px] font-semibold">Dress code<input value={dressCode} onChange={(event) => setDressCode(event.target.value)} className="mt-1.5 w-full rounded-[10px] border border-border bg-background px-3 py-2.5 text-xs font-normal" /></label></div>;
}

function DecorPanel({ selected, onSelect, onUpload }: { selected: string; onSelect: (value: string) => void; onUpload: (file: File) => void }) {
  return <div><Heading title="Foto & dekorasi" description="Pilih visual bawaan atau unggah foto sendiri." /><div className="mt-5 grid grid-cols-3 gap-2">{defaultDecor.map((item) => <button type="button" key={item} onClick={() => onSelect(item)} className={`overflow-hidden rounded-xl border ${selected === item ? "border-primary" : "border-border"}`}><img src={item} alt="" className="aspect-square w-full object-cover" /></button>)}</div><label className="mt-4 flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-dashed border-primary/30 px-3 py-3 text-xs font-semibold text-primary"><Upload className="h-4 w-4" />Upload foto<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) onUpload(file); event.currentTarget.value = ""; }} /></label></div>;
}

function MusicPanel({ value, onChange, onUpload }: { value: string; onChange: (value: string) => void; onUpload: (file: File) => void }) {
  return <div><Heading title="Musik" description="Gunakan URL audio atau unggah satu track." /><input value={value} onChange={(event) => onChange(event.target.value)} className="mt-5 w-full rounded-[10px] border border-border bg-background px-3 py-3 text-xs" placeholder="https://.../music.mp3" /><label className="mt-3 flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-dashed border-primary/30 px-3 py-3 text-xs font-semibold text-primary"><Upload className="h-4 w-4" />Upload musik<input type="file" accept="audio/mpeg,audio/wav,audio/ogg,audio/aac,audio/mp4,audio/x-m4a" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) onUpload(file); event.currentTarget.value = ""; }} /></label></div>;
}

type CanvasProps = {
  invitation: Invitation | null;
  templateKey: string;
  palette: (typeof invitationPalettes)[PaletteKey];
  fontPair: (typeof invitationFonts)[FontKey];
  decorUrl: string;
  eventTag: string;
  dressCode: string;
  sections: InvitationSections;
};

function LiveCanvas(props: CanvasProps) {
  const spec = getSpec(props.templateKey);
  const renderers = {
    botanical: BotanicalCanvas,
    editorial: EditorialCanvas,
    maroon: MaroonCanvas,
    garden: GardenCanvas,
    midnight: MidnightCanvas,
    classic: ClassicCanvas,
  } as const;
  const Renderer = renderers[spec.frame];
  return <Renderer {...props} />;
}

function common(props: CanvasProps) {
  const identity = identityFor(props.invitation);
  const timezone = getIndonesiaTimezone(props.invitation?.timezone || "Asia/Jakarta");
  return {
    identity,
    timezone,
    name: identity.second ? `${identity.first} & ${identity.second}` : identity.first,
    groomParents: identity.category === "WEDDING" ? weddingParentLine(props.invitation?.groomFatherName, props.invitation?.groomMotherName) : "",
    brideParents: identity.category === "WEDDING" ? weddingParentLine(props.invitation?.brideFatherName, props.invitation?.brideMotherName) : "",
  };
}

function BotanicalCanvas(props: CanvasProps) {
  const c = common(props);
  return <CanvasShell props={props} className="rounded-[24px]" hero={<><p className="text-[8px] uppercase tracking-[0.24em]" style={{ color: props.palette.accent }}>{c.identity.label}</p><h1 className="mt-3 text-[34px] leading-tight" style={{ fontFamily: props.fontPair.heading }}>{c.name}</h1><div className="mx-auto mt-7 w-[230px] rounded-[120px_120px_30px_30px] border p-2" style={{ borderColor: props.palette.soft, background: props.palette.bg }}><img src={props.decorUrl} alt="" className="aspect-[4/5] w-full rounded-[112px_112px_24px_24px] object-cover" /></div></>} identityMode="stack" />;
}

function EditorialCanvas(props: CanvasProps) {
  const c = common(props);
  return <CanvasShell props={props} className="rounded-[18px]" hero={<div className="grid grid-cols-[1fr_120px] items-end gap-5 text-left"><div><p className="text-[8px] uppercase tracking-[0.28em]" style={{ color: props.palette.accent }}>{c.identity.label}</p><h1 className="mt-4 text-[38px] italic leading-[1.05]" style={{ fontFamily: props.fontPair.heading }}>{c.name}</h1><p className="mt-4 text-[10px] opacity-60">{eventDate(props.invitation)}</p></div><img src={props.decorUrl} alt="" className="aspect-[3/4] w-full rotate-2 rounded-[18px] border object-cover" style={{ borderColor: props.palette.soft }} /></div>} identityMode="split" />;
}

function MaroonCanvas(props: CanvasProps) {
  const c = common(props);
  return <CanvasShell props={props} dark className="rounded-[8px]" hero={<><img src={props.decorUrl} alt="" className="h-52 w-full object-cover opacity-75" /><div className="px-7 pb-2 pt-8"><p className="text-[8px] uppercase tracking-[0.3em]" style={{ color: props.palette.soft }}>{c.identity.label}</p><h1 className="mt-3 text-[38px] uppercase tracking-[0.04em]" style={{ fontFamily: props.fontPair.heading }}>{c.name}</h1></div></>} identityMode="stack" heroFlush />;
}

function GardenCanvas(props: CanvasProps) {
  const c = common(props);
  return <CanvasShell props={props} className="rounded-[28px]" hero={<><div className="mx-auto h-2 w-24 rounded-full" style={{ background: props.palette.soft }} /><p className="mt-8 text-[8px] uppercase tracking-[0.26em]" style={{ color: props.palette.accent }}>{c.identity.label}</p><div className="mx-auto mt-5 w-[220px] rounded-[48%_48%_16px_16px] border p-2" style={{ borderColor: props.palette.soft }}><img src={props.decorUrl} alt="" className="aspect-[4/5] w-full rounded-[48%_48%_12px_12px] object-cover" /></div><h1 className="mt-6 text-[31px]" style={{ fontFamily: props.fontPair.heading }}>{c.name}</h1></>} identityMode="stack" />;
}

function MidnightCanvas(props: CanvasProps) {
  const c = common(props);
  return <CanvasShell props={props} dark className="rounded-[28px]" hero={<><p className="text-[8px] uppercase tracking-[0.28em]" style={{ color: props.palette.soft }}>{c.identity.label}</p><div className="mx-auto mt-7 h-[210px] w-[210px] rounded-full border p-2" style={{ borderColor: props.palette.soft }}><img src={props.decorUrl} alt="" className="h-full w-full rounded-full object-cover" /></div><h1 className="mt-7 text-[34px]" style={{ fontFamily: props.fontPair.heading }}>{c.name}</h1></>} identityMode="stack" />;
}

function ClassicCanvas(props: CanvasProps) {
  const c = common(props);
  return <CanvasShell props={props} className="rounded-[18px]" hero={<><div className="mx-auto w-[210px] rounded-[90px_90px_12px_12px] border p-2" style={{ borderColor: props.palette.soft }}><img src={props.decorUrl} alt="" className="aspect-[4/5] w-full rounded-[82px_82px_8px_8px] object-cover" /></div><p className="mt-6 text-[8px] uppercase tracking-[0.24em]" style={{ color: props.palette.accent }}>{c.identity.label}</p><h1 className="mt-3 text-[32px]" style={{ fontFamily: props.fontPair.heading }}>{c.name}</h1></>} identityMode="stack" />;
}

function CanvasShell({ props, hero, identityMode, dark = false, heroFlush = false, className }: { props: CanvasProps; hero: React.ReactNode; identityMode: "stack" | "split"; dark?: boolean; heroFlush?: boolean; className: string }) {
  const c = common(props);
  const invitation = props.invitation;
  return <div className={`${className} overflow-hidden border shadow-[0_24px_70px_rgba(66,42,33,.16)]`} data-template={props.templateKey} style={{ background: props.palette.surface, borderColor: props.palette.soft, color: props.palette.ink, fontFamily: props.fontPair.body }}>
    <section className={`text-center ${heroFlush ? "p-0" : "px-7 pb-9 pt-10"}`} style={{ background: dark ? props.palette.ink : props.palette.surface, color: dark ? props.palette.surface : props.palette.ink }}>{hero}{!heroFlush && <><p className="mt-6 text-[12px]" style={{ fontFamily: props.fontPair.heading }}>{eventDate(invitation)}</p><p className="mt-1 text-[9px] opacity-65">{invitation?.venue || "Lokasi belum diatur"}</p></>}</section>
    <Divider color={props.palette.soft} />
    <section className="px-8 text-center"><p className="text-[10px] leading-5 opacity-65">{invitation?.description || "Dengan penuh kebahagiaan, kami mengundang Anda untuk hadir dan menjadi bagian dari momen istimewa ini."}</p>{c.identity.second && <div className={`mt-7 gap-5 ${identityMode === "split" ? "grid grid-cols-2 text-left" : "grid"}`}><Person name={c.identity.first} parents={c.groomParents} font={props.fontPair.heading} />{identityMode === "stack" && <p className="text-xs opacity-40">&</p>}<Person name={c.identity.second} parents={c.brideParents} font={props.fontPair.heading} /></div>}</section>
    <Divider color={props.palette.soft} />
    <section className="px-8 text-center"><p className="text-[8px] uppercase tracking-[0.2em]" style={{ color: props.palette.accent }}>Save The Date</p><h2 className="mt-2 text-2xl" style={{ fontFamily: props.fontPair.heading }}>Waktu & Lokasi</h2><div className="mt-5 space-y-2"><Info title="Mulai" value={`${invitation?.ceremonyTime || "--:--"} ${c.timezone.label}`} props={props} />{invitation?.receptionTime && <Info title="Selesai" value={`${invitation.receptionTime} ${c.timezone.label}`} props={props} />}</div><p className="mt-5 text-lg" style={{ fontFamily: props.fontPair.heading }}>{invitation?.venue || "Lokasi belum diatur"}</p>{invitation?.address && <p className="mt-1 text-[9px] leading-4 opacity-60">{invitation.address}</p>}{props.dressCode && <p className="mt-3 text-[9px] opacity-55">Dress code · {props.dressCode}</p>}</section>
    <OptionalSections props={props} />
    <Divider color={props.palette.soft} />
    <footer className="px-8 pb-9 text-center">{props.eventTag && <p className="text-[10px]" style={{ color: props.palette.accent }}>{props.eventTag}</p>}<p className="mt-3 text-[9px] opacity-50">DC Organizer</p></footer>
  </div>;
}

function OptionalSections({ props }: { props: CanvasProps }) {
  return <>{props.sections.rsvp && <><Divider color={props.palette.soft} /><Section eyebrow="Kehadiran" title="Konfirmasi RSVP" description="Silakan konfirmasi kehadiran Anda." props={props}><div className="space-y-2"><Field label="Nama Tamu" /><Field label="Konfirmasi Kehadiran" /><Field label="Jumlah Tamu" /><div className="rounded-lg px-3 py-2 text-center text-[9px] font-semibold" style={{ background: props.palette.ink, color: props.palette.surface }}>Kirim RSVP</div></div></Section></>}{props.sections.wishes && <><Divider color={props.palette.soft} /><Section eyebrow="Ucapan & Doa" title="Wishes" description="Tamu dapat menulis ucapan pada section ini." props={props}><div className="rounded-xl border p-3 text-left" style={{ borderColor: props.palette.soft, background: props.palette.bg }}><p className="text-[9px] opacity-55">Tulis ucapan Anda</p><div className="mt-3 h-14 rounded-lg border" style={{ borderColor: props.palette.soft }} /></div></Section></>}{props.sections.gift && <><Divider color={props.palette.soft} /><Section eyebrow="Tanda Kasih" title="Gift / E-Angpao" description="Informasi hadiah digital hanya tampil ketika section aktif." props={props}><div className="rounded-xl border p-4 text-left" style={{ borderColor: props.palette.soft, background: props.palette.bg }}><p className="text-[9px] uppercase tracking-[0.14em] opacity-55">Transfer Bank</p><p className="mt-2 text-xs font-semibold">{props.invitation?.giftBankName || "Bank"}</p><p className="mt-1 text-[10px] opacity-65">{props.invitation?.giftAccountName || "Nama Pemilik"}</p><p className="mt-1 text-[10px] font-semibold">{props.invitation?.giftAccountNumber || "Nomor rekening"}</p></div></Section></>}</>;
}

function Person({ name, parents, font }: { name: string; parents: string; font: string }) { return <div><h2 className="text-2xl" style={{ fontFamily: font }}>{name}</h2>{parents && <p className="mt-1 text-[9px] leading-4 opacity-60">{parents}</p>}</div>; }
function Divider({ color }: { color: string }) { return <div className="flex items-center justify-center gap-3 py-6 opacity-60"><span className="h-px w-12" style={{ background: color }} /><span className="text-[8px]">◇</span><span className="h-px w-12" style={{ background: color }} /></div>; }
function Info({ title, value, props }: { title: string; value: string; props: CanvasProps }) { return <div className="rounded-xl border p-4" style={{ borderColor: props.palette.soft, background: props.palette.bg }}><p className="text-xs font-semibold">{title}</p><p className="mt-1 text-[10px] opacity-70">{value}</p></div>; }
function Section({ eyebrow, title, description, props, children }: { eyebrow: string; title: string; description: string; props: CanvasProps; children: React.ReactNode }) { return <section className="px-8 py-3 text-center"><p className="text-[8px] uppercase tracking-[0.2em]" style={{ color: props.palette.accent }}>{eyebrow}</p><h2 className="mt-2 text-2xl" style={{ fontFamily: props.fontPair.heading }}>{title}</h2><p className="mx-auto mt-2 max-w-[270px] text-[10px] leading-4 opacity-60">{description}</p><div className="mt-5">{children}</div></section>; }
function Field({ label }: { label: string }) { return <div className="rounded-lg border border-black/10 bg-white/65 px-3 py-2 text-left text-[9px] text-black/45">{label}</div>; }
