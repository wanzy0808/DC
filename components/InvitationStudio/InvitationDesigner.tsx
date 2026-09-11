"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Eye, ImagePlus, Music2, Palette, Plus, RotateCcw, Save, Type, Undo2, Redo2 } from "lucide-react";
import { invitationTemplates } from "@/lib/templates/catalog";
import { invitationPalettes, makeDesignKey, parseDesignKey, type PaletteKey } from "@/lib/templates/design";

type Invitation = {
  id: string; slug: string; groomName: string; brideName: string; venue: string; eventDate: string;
  ceremonyTime: string | null; receptionTime: string | null; description: string | null; weddingHashtag: string | null;
  dressCode: string | null; eventNotes: string | null; musicUrl: string | null; templateKey: string;
  isPublished: boolean; assets: { id: string; type: "IMAGE" | "AUDIO"; url: string; title: string | null }[];
  payment: { status: string; packageKey: string } | null;
};

const decor = [
  "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&q=80&w=500",
  "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&q=80&w=500",
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=500",
];

const palettes = Object.entries(invitationPalettes) as [PaletteKey, (typeof invitationPalettes)[PaletteKey]][];

export default function InvitationDesigner() {
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [panel, setPanel] = useState("Design");
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("Memuat undangan...");
  const [history, setHistory] = useState<string[]>([]);
  const [future, setFuture] = useState<string[]>([]);
  const [musicUrl, setMusicUrl] = useState("");
  const [form, setForm] = useState({ groomName: "Rio", brideName: "Lyvia", venue: "Gedung Pernikahan", eventDate: "2026-09-26", ceremonyTime: "", receptionTime: "", description: "Dengan penuh kebahagiaan, kami mengundang Anda untuk hadir di hari istimewa kami.", weddingHashtag: "", dressCode: "", eventNotes: "" });
  const [design, setDesign] = useState({ template: "eternal-blossom", palette: "rose" as PaletteKey, font: "classic" as const, decor: decor[0] });

  useEffect(() => {
    fetch("/api/invitations").then(r => r.json()).then(data => {
      const i = data.invitation as Invitation; setInvitation(i); setMusicUrl(i.musicUrl ?? "");
      setForm({ groomName: i.groomName, brideName: i.brideName, venue: i.venue, eventDate: i.eventDate.slice(0,10), ceremonyTime: i.ceremonyTime ?? "", receptionTime: i.receptionTime ?? "", description: i.description ?? "", weddingHashtag: i.weddingHashtag ?? "", dressCode: i.dressCode ?? "", eventNotes: i.eventNotes ?? "" });
      const parsed = parseDesignKey(i.templateKey); setDesign({ template: parsed.template, palette: parsed.palette, font: parsed.font, decor: i.assets.find(a => a.type === "IMAGE")?.url ?? decor[0] });
      setNotice("Siap diedit.");
    }).catch(() => setNotice("Undangan belum dapat dimuat."));
  }, []);

  const palette = invitationPalettes[design.palette];
  const template = invitationTemplates.find(t => t.key === design.template) ?? invitationTemplates[0];
  const date = useMemo(() => new Intl.DateTimeFormat("id-ID", { dateStyle: "full" }).format(new Date(form.eventDate)), [form.eventDate]);
  const designKey = makeDesignKey(design.template, design.palette, design.font);

  function changeDesign(next: Partial<typeof design>) {
    setHistory(h => [...h.slice(-9), designKey]); setFuture([]); setDesign(d => ({ ...d, ...next }));
  }
  function undo() { const key = history.at(-1); if (!key) return; setFuture(f => [...f, designKey]); const p = parseDesignKey(key); setDesign(d => ({ ...d, template: p.template, palette: p.palette, font: p.font })); setHistory(h => h.slice(0,-1)); }
  function redo() { const key = future.at(-1); if (!key) return; setHistory(h => [...h, designKey]); const p = parseDesignKey(key); setDesign(d => ({ ...d, template: p.template, palette: p.palette, font: p.font })); setFuture(f => f.slice(0,-1)); }
  function reset() { changeDesign({ template: "eternal-blossom", palette: "rose", font: "classic", decor: decor[0] }); }

  async function save() {
    setSaving(true); setNotice("Menyimpan...");
    const body = { ...form, templateKey: designKey, musicUrl, isPublished: invitation?.isPublished ?? false };
    const r = await fetch("/api/invitations", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await r.json();
    if (r.ok) { setInvitation(data.invitation); setNotice("Perubahan tersimpan."); } else setNotice(data.error ?? "Gagal menyimpan.");
    setSaving(false);
  }

  function field(name: keyof typeof form, value: string) { setForm(f => ({ ...f, [name]: value })); }

  return <section className="min-h-[calc(100vh-122px)] bg-background font-[var(--font-fauna)] text-foreground">
    <div className="flex min-h-14 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
      <div><p className="font-[var(--font-cinzel)] text-sm tracking-[0.14em]">INVITATION STUDIO</p><p className="text-[11px] opacity-50">{template.name}</p></div>
      <div className="flex items-center gap-2"><button className="p-2 opacity-60 hover:opacity-100" onClick={undo} title="Undo"><Undo2 className="h-4 w-4"/></button><button className="p-2 opacity-60 hover:opacity-100" onClick={redo} title="Redo"><Redo2 className="h-4 w-4"/></button><button onClick={() => setPreview(true)} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs"><Eye className="h-4 w-4"/>Pratinjau</button><button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs text-primary-foreground disabled:opacity-50"><Save className="h-4 w-4"/>{saving ? "Menyimpan" : "Simpan"}</button></div>
    </div>
    <div className="grid min-h-[calc(100vh-178px)] lg:grid-cols-[72px_280px_minmax(0,1fr)]">
      <aside className="border-r border-border bg-card p-2"><div className="grid gap-1"><Tool active={panel === "Design"} label="Design" icon={<Palette/>} onClick={() => setPanel("Design")}/><Tool active={panel === "Content"} label="Isi" icon={<Type/>} onClick={() => setPanel("Content")}/><Tool active={panel === "Decor"} label="Dekor" icon={<ImagePlus/>} onClick={() => setPanel("Decor")}/><Tool active={panel === "Music"} label="Musik" icon={<Music2/>} onClick={() => setPanel("Music")}/></div></aside>
      <aside className="border-r border-border bg-card p-4 overflow-y-auto">
        <p className="font-[var(--font-cinzel)] text-sm">{panel}</p><p className="mt-1 text-[11px] opacity-50">Pilihan terkurasi, bukan editor bebas.</p>
        {panel === "Design" && <div className="mt-5 space-y-6"><div><p className="mb-2 text-xs font-medium">Template</p><div className="grid gap-3">{invitationTemplates.map(t => <button key={t.key} onClick={() => changeDesign({ template: t.key })} className={`overflow-hidden text-left ${design.template === t.key ? "ring-2 ring-primary" : "ring-1 ring-border"}`}><img src={t.previewImage} className="h-28 w-full object-cover"/><div className="p-2"><p className="font-[var(--font-cinzel)] text-xs">{t.name}</p><p className="mt-1 text-[10px] opacity-50">{t.description}</p></div></button>)}</div></div><div><p className="mb-2 text-xs font-medium">Color palette</p><div className="grid grid-cols-5 gap-2">{palettes.map(([key,p]) => <button key={key} onClick={() => changeDesign({ palette: key })} title={p.name} className={`h-8 rounded-full border-2 ${design.palette === key ? "border-primary" : "border-transparent"}`} style={{background:`linear-gradient(135deg,${p.accent},${p.soft})`}}/>)}</div></div><div><p className="mb-2 text-xs font-medium">Font combo</p><button className="w-full rounded-lg border border-primary/30 p-3 text-left"><span className="font-[var(--font-cinzel)] text-sm">Cinzel</span><span className="ml-2 text-xs opacity-50">+ Fauna One</span></button></div></div>}
        {panel === "Content" && <div className="mt-5 space-y-3">{([['groomName','Mempelai pria'],['brideName','Mempelai wanita'],['venue','Lokasi'],['eventDate','Tanggal'],['ceremonyTime','Jam akad / pemberkatan'],['receptionTime','Jam resepsi'],['weddingHashtag','Hashtag'],['dressCode','Dress code']] as [keyof typeof form,string][]).map(([k,l]) => <label key={k} className="block text-xs">{l}<input type={k === 'eventDate' ? 'date' : 'text'} value={form[k]} onChange={e=>field(k,e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs"/></label>)}<label className="block text-xs">Cerita singkat<textarea value={form.description} onChange={e=>field('description',e.target.value)} rows={4} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs"/></label><label className="block text-xs">Catatan acara<textarea value={form.eventNotes} onChange={e=>field('eventNotes',e.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs"/></label></div>}
        {panel === "Decor" && <div className="mt-5 space-y-4"><p className="text-xs opacity-60">Tambahkan sedikit dekorasi. Template tetap mengatur komposisinya agar hasil tidak berantakan.</p><div className="grid grid-cols-3 gap-2">{decor.map(src=><button key={src} onClick={()=>changeDesign({decor:src})} className={`overflow-hidden rounded-lg ${design.decor===src?'ring-2 ring-primary':'ring-1 ring-border'}`}><img src={src} className="aspect-square object-cover"/></button>)}</div><button onClick={()=>changeDesign({decor:""})} className="inline-flex items-center gap-2 text-xs opacity-60"><RotateCcw className="h-3.5 w-3.5"/>Hapus dekorasi</button></div>}
        {panel === "Music" && <div className="mt-5 space-y-4"><p className="text-xs opacity-60">Musik tetap sederhana: pilih satu musik untuk undangan.</p><input value={musicUrl} onChange={e=>setMusicUrl(e.target.value)} placeholder="https://.../music.mp3" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs"/><p className="text-[10px] opacity-50">Upload musik sendiri tetap mengikuti paket yang aktif.</p></div>}
      </aside>
      <main className="flex items-start justify-center overflow-auto bg-muted/20 p-8"><div className="w-[360px] origin-top" style={{transform:"scale(.92)", transformOrigin:"top center"}}><InvitationPreview invitation={invitation} form={form} palette={palette} decorUrl={design.decor}/></div></main>
    </div>
    {preview && <div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4" onClick={()=>setPreview(false)}><div className="max-h-[92vh] overflow-auto rounded-3xl bg-background p-3" onClick={e=>e.stopPropagation()}><InvitationPreview invitation={invitation} form={form} palette={palette} decorUrl={design.decor}/></div></div>}
  </section>;
}

function Tool({active,label,icon,onClick}:{active:boolean;label:string;icon:React.ReactNode;onClick:()=>void}) { return <button onClick={onClick} className={`grid justify-items-center gap-1 rounded-lg p-2 text-[9px] ${active?'bg-primary/10 text-primary':'opacity-60 hover:opacity-100'}`}>{icon}<span>{label}</span></button> }

function InvitationPreview({ invitation, form, palette, decorUrl }: { invitation: Invitation | null; form: Record<string,string>; palette: (typeof invitationPalettes)[PaletteKey]; decorUrl: string }) {
  const date = new Intl.DateTimeFormat("id-ID", { dateStyle: "full" }).format(new Date(form.eventDate));
  const image = invitation?.assets.find(a=>a.type==='IMAGE')?.url;
  return <div className="min-h-[760px] overflow-hidden rounded-[28px] shadow-xl" style={{background:palette.bg,color:palette.ink}}><div className="relative min-h-[420px] overflow-hidden px-7 pb-10 pt-12 text-center">{image&&<img src={image} className="absolute inset-0 h-full w-full object-cover opacity-20"/>}<div className="absolute inset-0" style={{background:`linear-gradient(180deg,${palette.bg}66,${palette.bg})`}}/>{decorUrl&&<img src={decorUrl} className="absolute -right-10 top-12 h-40 w-40 object-cover opacity-40 mix-blend-multiply"/>}<div className="relative"><p className="text-[9px] uppercase tracking-[.32em]" style={{color:palette.accent}}>The Wedding Of</p><h1 className="mt-16 font-[var(--font-cinzel)] text-4xl leading-tight">{form.groomName}<br/><span style={{color:palette.soft}}>&amp;</span><br/>{form.brideName}</h1><p className="mt-8 text-xs opacity-70">{form.description}</p><p className="mt-7 text-[10px] uppercase tracking-widest" style={{color:palette.accent}}>{date}</p></div></div><div className="space-y-8 px-7 py-10 text-center"><section><p className="text-[9px] uppercase tracking-[.28em]" style={{color:palette.accent}}>Save The Date</p><h2 className="mt-2 font-[var(--font-cinzel)] text-2xl">A day to remember</h2></section><div className="space-y-4 text-left text-xs"><Info title="Lokasi" value={form.venue}/>{form.ceremonyTime&&<Info title="Akad / Pemberkatan" value={form.ceremonyTime}/>} {form.receptionTime&&<Info title="Resepsi" value={form.receptionTime}/>}</div><section className="rounded-2xl p-5 text-center" style={{background:palette.surface}}><p className="font-[var(--font-cinzel)] text-lg">Wedding Wishes</p><p className="mt-2 text-xs leading-6 opacity-65">Semoga perjalanan kalian selalu dipenuhi cinta, ketenangan, dan kebahagiaan.</p></section><section className="rounded-2xl p-5 text-center" style={{background:palette.surface}}><p className="font-[var(--font-cinzel)] text-lg">RSVP</p><p className="mt-2 text-xs leading-6 opacity-65">Konfirmasi kehadiran tamu akan masuk ke dashboard dan dapat dikelola dari Guestbook.</p><button className="mt-4 rounded-full px-5 py-2 text-xs text-white" style={{background:palette.accent}}>Konfirmasi Kehadiran</button></section><section><p className="font-[var(--font-cinzel)] text-lg">Map &amp; Venue</p><div className="mt-3 h-28 rounded-2xl border border-current/10 grid place-items-center text-xs opacity-60">{form.venue}<br/>Google Maps</div></section><p className="pt-4 font-[var(--font-cinzel)] text-[10px] uppercase tracking-[.25em]" style={{color:palette.accent}}>With love, {form.groomName} &amp; {form.brideName}</p></div></div>
}
function Info({title,value}:{title:string;value:string}) { return <div className="border-b border-current/10 pb-3"><p className="text-[9px] uppercase tracking-widest opacity-50">{title}</p><p className="mt-1 font-[var(--font-cinzel)] text-sm">{value}</p></div> }
