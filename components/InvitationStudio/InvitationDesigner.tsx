"use client";

import { useEffect, useState } from "react";
import { Eye, ImagePlus, Music2, Palette, RotateCcw, Save, Type, Undo2, Redo2 } from "lucide-react";
import { invitationTemplates } from "@/lib/templates/catalog";
import { invitationFonts, invitationPalettes, makeDesignKey, parseDesignKey, type FontKey, type PaletteKey } from "@/lib/templates/design";

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
const fonts = Object.entries(invitationFonts) as [FontKey, (typeof invitationFonts)[FontKey]][];

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
  const [design, setDesign] = useState({ template: "eternal-blossom", palette: "rose" as PaletteKey, font: "cinzelFauna" as FontKey, decor: decor[0] });

  useEffect(() => {
    fetch("/api/invitations").then(r => r.json()).then(data => {
      const i = data.invitation as Invitation;
      setInvitation(i); setMusicUrl(i.musicUrl ?? "");
      setForm({ groomName: i.groomName, brideName: i.brideName, venue: i.venue, eventDate: i.eventDate.slice(0, 10), ceremonyTime: i.ceremonyTime ?? "", receptionTime: i.receptionTime ?? "", description: i.description ?? "", weddingHashtag: i.weddingHashtag ?? "", dressCode: i.dressCode ?? "", eventNotes: i.eventNotes ?? "" });
      const parsed = parseDesignKey(i.templateKey);
      setDesign({ template: parsed.template, palette: parsed.palette, font: parsed.font, decor: i.assets.find(a => a.type === "IMAGE")?.url ?? decor[0] });
      setNotice("Siap diedit.");
    }).catch(() => setNotice("Undangan belum dapat dimuat."));
  }, []);

  const palette = invitationPalettes[design.palette];
  const fontPair = invitationFonts[design.font];
  const template = invitationTemplates.find(t => t.key === design.template) ?? invitationTemplates[0];
  const designKey = makeDesignKey(design.template, design.palette, design.font);

  function changeDesign(next: Partial<typeof design>) {
    setHistory(h => [...h.slice(-9), designKey]); setFuture([]); setDesign(d => ({ ...d, ...next }));
  }
  function undo() { const key = history.at(-1); if (!key) return; setFuture(f => [...f, designKey]); const p = parseDesignKey(key); setDesign(d => ({ ...d, template: p.template, palette: p.palette, font: p.font })); setHistory(h => h.slice(0, -1)); }
  function redo() { const key = future.at(-1); if (!key) return; setHistory(h => [...h, designKey]); const p = parseDesignKey(key); setDesign(d => ({ ...d, template: p.template, palette: p.palette, font: p.font })); setFuture(f => f.slice(0, -1)); }

  async function save() {
    setSaving(true); setNotice("Menyimpan...");
    const body = { ...form, templateKey: designKey, musicUrl, isPublished: invitation?.isPublished ?? false };
    const r = await fetch("/api/invitations", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await r.json();
    if (r.ok) { setInvitation(data.invitation); setNotice("Perubahan tersimpan."); } else setNotice(data.error ?? "Gagal menyimpan.");
    setSaving(false);
  }
  function field(name: keyof typeof form, value: string) { setForm(f => ({ ...f, [name]: value })); }

  return <section className="dc-invitation-studio min-h-[calc(100vh-122px)] bg-[#f8f0ed] font-[var(--font-fauna)] text-[#2d2020]">
    <div className="flex min-h-16 items-center justify-between border-b px-5 sm:px-7">
      <div><p className="font-[var(--font-cinzel)] text-sm tracking-[0.14em]">INVITATION STUDIO</p><p className="mt-0.5 text-[11px] opacity-70">{template.name} · {fontPair.name}</p></div>
      <div className="flex items-center gap-2"><span className="hidden text-[11px] opacity-75 md:block">{notice}</span><button className="rounded-lg p-2 opacity-80 hover:bg-white/10 hover:opacity-100" onClick={undo} title="Undo"><Undo2 className="h-4 w-4"/></button><button className="rounded-lg p-2 opacity-80 hover:bg-white/10 hover:opacity-100" onClick={redo} title="Redo"><Redo2 className="h-4 w-4"/></button><button onClick={() => setPreview(true)} className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-3 py-2 text-xs"><Eye className="h-4 w-4"/>Pratinjau</button><button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-[#FFF8F5] px-4 py-2 text-xs font-semibold text-[#7A1C25] disabled:opacity-50"><Save className="h-4 w-4"/>{saving ? "Menyimpan" : "Simpan"}</button></div>
    </div>
    <div className="grid min-h-[calc(100vh-178px)] lg:grid-cols-[96px_320px_minmax(0,1fr)]">
      <aside className="studio-tool-rail border-r p-3"><div className="grid gap-2"><Tool active={panel === "Design"} label="Design" icon={<Palette/>} onClick={() => setPanel("Design")}/><Tool active={panel === "Content"} label="Isi Undangan" icon={<Type/>} onClick={() => setPanel("Content")}/><Tool active={panel === "Decor"} label="Dekorasi" icon={<ImagePlus/>} onClick={() => setPanel("Decor")}/><Tool active={panel === "Music"} label="Musik" icon={<Music2/>} onClick={() => setPanel("Music")}/></div></aside>
      <aside className="studio-control-panel overflow-y-auto border-r p-5">
        <p className="font-[var(--font-cinzel)] text-base font-semibold">{panel}</p><p className="mt-1 text-xs opacity-60">Pilihan terkurasi, bukan editor bebas.</p>
        {panel === "Design" && <div className="mt-6 space-y-7">
          <div><p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#7A1C25]">Template</p><div className="grid gap-3">{invitationTemplates.map(t => <button key={t.key} onClick={() => changeDesign({ template: t.key })} className={`overflow-hidden rounded-xl text-left transition ${design.template === t.key ? "ring-2 ring-[#7A1C25]" : "ring-1 ring-black/10 hover:ring-[#7A1C25]/50"}`}><img src={t.previewImage} alt="" className="h-28 w-full object-cover"/><div className="p-3"><p className="font-[var(--font-cinzel)] text-xs">{t.name}</p><p className="mt-1 text-[10px] opacity-60">{t.description}</p></div></button>)}</div></div>
          <div><p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#7A1C25]">Color palette</p><div className="grid grid-cols-5 gap-2">{palettes.map(([key,p]) => <button key={key} onClick={() => changeDesign({ palette: key })} title={p.name} aria-label={p.name} className={`h-9 rounded-full border-2 ${design.palette === key ? "border-[#7A1C25] ring-2 ring-[#7A1C25]/15" : "border-transparent"}`} style={{ background: `linear-gradient(135deg,${p.accent},${p.soft})` }}/>)}</div></div>
          <div><p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#7A1C25]">Font combo</p><select value={design.font} onChange={e => changeDesign({ font: e.target.value as FontKey })} className="w-full rounded-xl border border-[#7A1C25]/25 bg-white px-3 py-3 text-sm text-[#2d2020] outline-none focus:border-[#7A1C25] focus:ring-2 focus:ring-[#7A1C25]/15">{fonts.map(([key, f]) => <option key={key} value={key}>{f.name}</option>)}</select><div className="mt-3 rounded-xl border border-[#7A1C25]/15 bg-[#fffaf8] p-4"><p style={{fontFamily: fontPair.heading}} className="text-xl">{fontPair.heading}</p><p style={{fontFamily: fontPair.body}} className="mt-1 text-sm opacity-75">{fontPair.body} · contoh tampilan</p></div></div>
        </div>}
        {panel === "Content" && <div className="mt-6 space-y-3">{([['groomName','Mempelai pria'],['brideName','Mempelai wanita'],['venue','Lokasi'],['eventDate','Tanggal'],['ceremonyTime','Jam akad / pemberkatan'],['receptionTime','Jam resepsi'],['weddingHashtag','Hashtag'],['dressCode','Dress code']] as [keyof typeof form,string][]).map(([k,l]) => <label key={k} className="block text-xs font-medium">{l}<input type={k === 'eventDate' ? 'date' : 'text'} value={form[k]} onChange={e=>field(k,e.target.value)} className="mt-1 w-full rounded-lg border border-[#7A1C25]/15 bg-white px-3 py-2.5 text-xs"/></label>)}<label className="block text-xs font-medium">Cerita singkat<textarea value={form.description} onChange={e=>field('description',e.target.value)} rows={4} className="mt-1 w-full rounded-lg border border-[#7A1C25]/15 bg-white px-3 py-2.5 text-xs"/></label><label className="block text-xs font-medium">Catatan acara<textarea value={form.eventNotes} onChange={e=>field('eventNotes',e.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-[#7A1C25]/15 bg-white px-3 py-2.5 text-xs"/></label></div>}
        {panel === "Decor" && <div className="mt-6 space-y-4"><p className="text-xs opacity-65">Tambahkan sedikit dekorasi. Template tetap mengatur komposisinya agar hasil tidak berantakan.</p><div className="grid grid-cols-3 gap-2">{decor.map(src=><button key={src} onClick={()=>changeDesign({decor:src})} className={`overflow-hidden rounded-lg ${design.decor===src?'ring-2 ring-[#7A1C25]':'ring-1 ring-black/10'}`}><img src={src} alt="" className="aspect-square object-cover"/></button>)}</div><button onClick={()=>changeDesign({decor:""})} className="inline-flex items-center gap-2 text-xs text-[#7A1C25]"><RotateCcw className="h-3.5 w-3.5"/>Hapus dekorasi</button></div>}
        {panel === "Music" && <div className="mt-6 space-y-4"><p className="text-xs opacity-65">Musik tetap sederhana: pilih satu musik untuk undangan.</p><input value={musicUrl} onChange={e=>setMusicUrl(e.target.value)} placeholder="https://.../music.mp3" className="w-full rounded-lg border border-[#7A1C25]/15 bg-white px-3 py-2.5 text-xs"/><p className="text-[10px] opacity-50">Upload musik sendiri tetap mengikuti paket yang aktif.</p></div>}
      </aside>
      <main className="flex items-start justify-center overflow-auto bg-[#efe3df] p-8"><div className="w-[360px] origin-top" style={{transform:"scale(.92)", transformOrigin:"top center"}}><InvitationPreview invitation={invitation} form={form} palette={palette} fontPair={fontPair} decorUrl={design.decor}/></div></main>
    </div>
    {preview && <div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4" onClick={()=>setPreview(false)}><div className="max-h-[92vh] overflow-auto rounded-3xl bg-background p-3" onClick={e=>e.stopPropagation()}><InvitationPreview invitation={invitation} form={form} palette={palette} fontPair={fontPair} decorUrl={design.decor}/></div></div>}
  </section>;
}

function Tool({active,label,icon,onClick}:{active:boolean;label:string;icon:React.ReactNode;onClick:()=>void}) { return <button data-active={active} onClick={onClick} className="grid min-h-20 w-full justify-items-center gap-2 rounded-xl p-3 text-[11px] font-semibold transition" style={{fontFamily:"var(--font-cinzel)"}}>{icon}<span className="text-center leading-4">{label}</span></button> }

function InvitationPreview({ invitation, form, palette, fontPair, decorUrl }: { invitation: Invitation | null; form: Record<string,string>; palette: (typeof invitationPalettes)[PaletteKey]; fontPair: (typeof invitationFonts)[FontKey]; decorUrl: string }) {
  const date = new Intl.DateTimeFormat("id-ID", { dateStyle: "full" }).format(new Date(form.eventDate));
  const image = invitation?.assets.find(a=>a.type==='IMAGE')?.url;
  const heading = { fontFamily: fontPair.heading };
  const body = { fontFamily: fontPair.body };
  return <div className="min-h-[760px] overflow-hidden rounded-[28px] shadow-xl" style={{background:palette.bg,color:palette.ink,...body}}><div className="relative min-h-[420px] overflow-hidden px-7 pb-10 pt-12 text-center">{image&&<img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20"/>}<div className="absolute inset-0" style={{background:`linear-gradient(180deg,${palette.bg}66,${palette.bg})`}}/>{decorUrl&&<img src={decorUrl} alt="" className="absolute -right-10 top-12 h-40 w-40 object-cover opacity-40 mix-blend-multiply"/>}<div className="relative"><p className="text-[9px] uppercase tracking-[.32em]" style={{color:palette.accent}}>The Wedding Of</p><h1 className="mt-16 text-4xl leading-tight" style={heading}>{form.groomName}<br/><span style={{color:palette.soft}}>&amp;</span><br/>{form.brideName}</h1><p className="mt-8 text-xs opacity-70">{form.description}</p><p className="mt-7 text-[10px] uppercase tracking-widest" style={{color:palette.accent}}>{date}</p></div></div><div className="space-y-8 px-7 py-10 text-center"><section><p className="text-[9px] uppercase tracking-[.28em]" style={{color:palette.accent}}>Save The Date</p><h2 className="mt-2 text-2xl" style={heading}>A day to remember</h2></section><div className="space-y-4 text-left text-xs"><Info title="Lokasi" value={form.venue} heading={heading}/>{form.ceremonyTime&&<Info title="Akad / Pemberkatan" value={form.ceremonyTime} heading={heading}/>} {form.receptionTime&&<Info title="Resepsi" value={form.receptionTime} heading={heading}/>}</div><section className="rounded-2xl p-5 text-center" style={{background:palette.surface}}><p className="text-lg" style={heading}>Wedding Wishes</p><p className="mt-2 text-xs leading-6 opacity-65">Semoga perjalanan kalian selalu dipenuhi cinta, ketenangan, dan kebahagiaan.</p></section><section className="rounded-2xl p-5 text-center" style={{background:palette.surface}}><p className="text-lg" style={heading}>RSVP</p><p className="mt-2 text-xs leading-6 opacity-65">Konfirmasi kehadiran tamu akan masuk ke dashboard dan dapat dikelola dari Guestbook.</p><button className="mt-4 rounded-full px-5 py-2 text-xs text-white" style={{background:palette.accent}}>Konfirmasi Kehadiran</button></section><section><p className="text-lg" style={heading}>Map &amp; Venue</p><div className="mt-3 grid h-28 place-items-center rounded-2xl border border-current/10 text-xs opacity-60">{form.venue}<br/>Google Maps</div></section><p className="pt-4 text-[10px] uppercase tracking-[.25em]" style={{color:palette.accent,...heading}}>With love, {form.groomName} &amp; {form.brideName}</p></div></div>;
}
function Info({title,value,heading}:{title:string;value:string;heading:React.CSSProperties}) { return <div className="border-b border-current/10 pb-3"><p className="text-[9px] uppercase tracking-widest opacity-50">{title}</p><p className="mt-1 text-sm" style={heading}>{value}</p></div> }
