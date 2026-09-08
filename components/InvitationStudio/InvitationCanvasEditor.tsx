"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, CircleHelp, Copy, ImagePlus, Link2, MousePointer2, Music2, Pause, Play, Redo2, RotateCcw, Search, Trash2, Type, Undo2, Upload, ZoomIn, ZoomOut } from "lucide-react";
import { Circle, Group, Layer, Line, Rect, Stage, Text } from "react-konva";
import type Konva from "konva";
import { useTheme } from "@/components/Theme/ThemeContext";

type CanvasElement = {
  id: string;
  type: "text" | "line";
  text?: string;
  x: number;
  y: number;
  fontSize?: number;
  fill?: string;
  width?: number;
  points?: number[];
};

type MusicAsset = { id: string; url: string; title: string | null };

const canvasWidth = 540;
const canvasHeight = 760;
const templates = [
  { name: "Eternal Blossom", tone: "from-[#f8d9de] to-[#fff7f1]", mark: "EB" },
  { name: "Modern Maroon", tone: "from-[#7A1C25] to-[#d49b8d]", mark: "MM" },
  { name: "Garden Light", tone: "from-[#d9e5d5] to-[#fffaf0]", mark: "GL" },
  { name: "Midnight Gold", tone: "from-[#161017] to-[#9b7a43]", mark: "MG" },
  { name: "Soft Botanical", tone: "from-[#e7efe4] to-[#f5d8d4]", mark: "SB" },
  { name: "Classic Pearl", tone: "from-[#eee7df] to-[#ffffff]", mark: "CP" },
];

const initialElements: CanvasElement[] = [
  { id: "eyebrow", type: "text", text: "THE WEDDING OF", x: 145, y: 92, fontSize: 13, fill: "#7A1C25", width: 250 },
  { id: "groom", type: "text", text: "Indra", x: 116, y: 184, fontSize: 46, fill: "#251b1e", width: 308 },
  { id: "ampersand", type: "text", text: "&", x: 245, y: 250, fontSize: 27, fill: "#C26B70", width: 50 },
  { id: "bride", type: "text", text: "Imelda", x: 115, y: 296, fontSize: 46, fill: "#251b1e", width: 320 },
  { id: "message", type: "text", text: "We're getting married!", x: 135, y: 398, fontSize: 15, fill: "#7A1C25", width: 280 },
  { id: "date", type: "text", text: "26 . 09 . 2026", x: 170, y: 445, fontSize: 14, fill: "#251b1e", width: 200 },
  { id: "venue", type: "text", text: "Bandung, Indonesia", x: 165, y: 482, fontSize: 12, fill: "#7A1C25", width: 220 },
  { id: "divider", type: "line", x: 90, y: 372, points: [0, 0, 360, 0], fill: "#E60087", width: 360 },
];

function IconButton({ label, children, onClick }: { label: string; children: React.ReactNode; onClick?: () => void }) {
  return <button type="button" title={label} aria-label={label} onClick={onClick} className="flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-[10px] opacity-60 transition hover:bg-[#FCE8EF] hover:text-[#E60087] hover:opacity-100 dark:hover:bg-white/10"><span>{children}</span><span>{label}</span></button>;
}

export default function InvitationCanvasEditor() {
  const { isDarkMode } = useTheme();
  const stageRef = useRef<Konva.Stage | null>(null);
  const uploadRef = useRef<HTMLInputElement | null>(null);
  const [elements, setElements] = useState(initialElements);
  const [selectedId, setSelectedId] = useState("groom");
  const [activeTemplate, setActiveTemplate] = useState(0);
  const [zoom, setZoom] = useState(0.76);
  const [activePanel, setActivePanel] = useState("Design");
  const [history, setHistory] = useState<CanvasElement[][]>([]);
  const [redoHistory, setRedoHistory] = useState<CanvasElement[][]>([]);
  const [designTab, setDesignTab] = useState<"Template" | "My Designs">("Template");
  const [filter, setFilter] = useState("All templates");
  const [musicUrl, setMusicUrl] = useState("");
  const [invitationId, setInvitationId] = useState("");
  const [musicAssets, setMusicAssets] = useState<MusicAsset[]>([]);
  const [selectedMusicId, setSelectedMusicId] = useState("");
  const [playingMusicId, setPlayingMusicId] = useState("");
  const musicUploadRef = useRef<HTMLInputElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [notice, setNotice] = useState("Perubahan tersimpan di perangkat ini.");

  useEffect(() => {
    fetch("/api/invitations")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Musik belum dapat dimuat.");
        return data.invitation;
      })
      .then((invitation) => {
        setInvitationId(invitation.id);
        setMusicUrl(invitation.musicUrl ?? "");
        setMusicAssets(invitation.assets.filter((asset: { type: string }) => asset.type === "AUDIO"));
      })
      .catch(() => setNotice("Musik belum dapat dimuat."));
  }, []);

  const selected = useMemo(() => elements.find((element) => element.id === selectedId), [elements, selectedId]);

  function updateElement(id: string, patch: Partial<CanvasElement>) {
    setHistory((current) => [...current.slice(-9), elements]);
    setRedoHistory([]);
    setElements((current) => current.map((element) => element.id === id ? { ...element, ...patch } : element));
    setNotice("Perubahan tersimpan di perangkat ini.");
  }

  function addText() {
    const id = `text-${Date.now()}`;
    setHistory((current) => [...current.slice(-9), elements]);
    setRedoHistory([]);
    setElements((current) => [...current, { id, type: "text", text: "Teks baru", x: 190, y: 560, fontSize: 20, fill: "#7A1C25", width: 180 }]);
    setSelectedId(id);
    setNotice("Teks baru ditambahkan.");
  }

  function undo() {
    const previous = history.at(-1);
    if (!previous) return;
    setRedoHistory((current) => [...current, elements]);
    setElements(previous);
    setHistory((current) => current.slice(0, -1));
    setNotice("Perubahan dibatalkan.");
  }

  function redo() {
    const next = redoHistory.at(-1);
    if (!next) return;
    setHistory((current) => [...current, elements]);
    setElements(next);
    setRedoHistory((current) => current.slice(0, -1));
    setNotice("Perubahan dikembalikan.");
  }

  function reset() {
    setHistory((current) => [...current, elements]);
    setRedoHistory([]);
    setElements(initialElements);
    setSelectedId("groom");
    setNotice("Desain dikembalikan ke awal.");
  }

  function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setActivePanel("Element");
    setNotice(`${file.name} siap ditambahkan sebagai asset undangan.`);
    event.target.value = "";
  }

  function saveMusic() {
    const url = musicUrl.trim();
    if (!url || !invitationId) {
      setNotice("Masukkan URL musik terlebih dahulu.");
      return;
    }
    fetch("/api/invitations/assets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ invitationId, type: "AUDIO", url, title: "Musik dari URL" }) })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Musik gagal disimpan.");
        setMusicAssets((current) => [...current, data.asset]);
        setSelectedMusicId(data.asset.id);
        setMusicUrl(url);
        setNotice("Musik undangan tersimpan.");
      })
      .catch((error: Error) => setNotice(error.message));
  }

  function uploadMusic(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !invitationId) return;
    const formData = new FormData();
    formData.append("invitationId", invitationId);
    formData.append("file", file);
    fetch("/api/invitations/assets/upload", { method: "POST", body: formData })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Upload musik gagal.");
        setMusicAssets((current) => [...current, data.asset]);
        setMusicUrl(data.asset.url);
        setSelectedMusicId(data.asset.id);
        setNotice("Musik berhasil diunggah.");
      })
      .catch((error: Error) => setNotice(error.message));
  }

  function chooseMusic(asset: MusicAsset) {
    setSelectedMusicId(asset.id);
    setMusicUrl(asset.url);
    setNotice(`${asset.title ?? "Musik"} dipilih.`);
  }

  function toggleMusic(asset: MusicAsset) {
    if (playingMusicId === asset.id && audioRef.current) {
      audioRef.current.pause();
      setPlayingMusicId("");
      return;
    }
    chooseMusic(asset);
    if (audioRef.current) {
      audioRef.current.src = asset.url;
      audioRef.current.play().then(() => setPlayingMusicId(asset.id)).catch(() => setNotice("Preview musik tidak dapat diputar."));
    }
  }

  function removeMusic(asset: MusicAsset) {
    fetch(`/api/invitations/assets/${asset.id}`, { method: "DELETE" })
      .then((response) => {
        if (!response.ok) throw new Error("Musik gagal dihapus.");
        setMusicAssets((current) => current.filter((item) => item.id !== asset.id));
        if (selectedMusicId === asset.id) {
          setSelectedMusicId("");
          setMusicUrl("");
        }
        setNotice("Musik dihapus.");
      })
      .catch((error: Error) => setNotice(error.message));
  }

  const theme = isDarkMode
    ? { surface: "#121116", canvas: "#17151b", ink: "#f8f5f0", muted: "#e8a5ae", accent: "#c26b70", border: "rgba(255,255,255,0.1)" }
    : { surface: "#ffffff", canvas: "#faf7f2", ink: "#1a1a1a", muted: "#7a1c25", accent: "#7a1c25", border: "rgba(122,28,37,0.15)" };

  return (
    <section className="flex min-h-[calc(100vh-122px)] min-w-0 flex-col bg-background font-sans text-foreground lg:flex-row">
      <input ref={uploadRef} type="file" accept="image/*,audio/*" className="hidden" onChange={handleUpload} />
      <input ref={musicUploadRef} type="file" accept="audio/mpeg,audio/wav,audio/ogg,audio/aac,audio/mp4,audio/x-m4a" className="hidden" onChange={uploadMusic} />
      <aside className="order-2 flex w-full shrink-0 flex-col border-t border-border bg-card lg:order-1 lg:w-16 lg:border-r lg:border-t-0">
        <div className="flex justify-center border-b border-border p-2"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-dc-pink text-white"><MousePointer2 className="h-4 w-4" /></span></div>
        <div className="flex justify-around gap-1 p-2 lg:flex-col lg:items-center"><IconButton label="Design" onClick={() => setActivePanel("Design")}><ImagePlus className="h-4 w-4" /></IconButton><IconButton label="Element" onClick={() => setActivePanel("Element")}><CircleHelp className="h-4 w-4" /></IconButton><IconButton label="Teks" onClick={addText}><Type className="h-4 w-4" /></IconButton><IconButton label="Upload" onClick={() => uploadRef.current?.click()}><Upload className="h-4 w-4" /></IconButton><IconButton label="Musik" onClick={() => setActivePanel("Musik")}><span className="text-sm">♫</span></IconButton></div>
      </aside>

      <aside className="order-1 flex w-full shrink-0 flex-col border-b border-border bg-card lg:order-2 lg:w-64 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between border-b border-border px-4 py-3"><div><p className="text-xs font-semibold">{activePanel}</p><p className="text-[10px] opacity-50">Atur desain undanganmu</p></div><Search className="h-4 w-4 opacity-40" /></div>
        {activePanel === "Design" ? <div className="space-y-4 overflow-auto p-4"><div className="flex gap-2 text-[10px]"><button onClick={() => setDesignTab("Template")} className={`${designTab === "Template" ? "border-b-2 border-dc-pink text-dc-pink" : "opacity-50"} pb-2`}>Template</button><button onClick={() => setDesignTab("My Designs")} className={`${designTab === "My Designs" ? "border-b-2 border-dc-pink text-dc-pink" : "opacity-50"} pb-2`}>My Designs</button></div><div className="flex gap-2"><button onClick={() => setFilter(filter === "All templates" ? "Premium only" : "All templates")} className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[10px]">{filter} <ChevronDown className="h-3 w-3" /></button><button onClick={() => setNotice("Kategori template tersedia setelah katalog diperluas.")} className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[10px]">Category <ChevronDown className="h-3 w-3" /></button></div>{designTab === "Template" ? <div className="grid grid-cols-2 gap-3">{templates.map((template, index) => <button type="button" key={template.name} onClick={() => { setActiveTemplate(index); setNotice(`${template.name} dipilih.`); }} className={`group overflow-hidden rounded-lg text-left ${activeTemplate === index ? "ring-2 ring-dc-pink" : "ring-1 ring-border"}`}><div className={`flex aspect-3/4 items-end bg-linear-to-br ${template.tone} p-2`}><div className="w-full rounded bg-white/60 p-1 text-center text-[9px] text-dc-maroon">{template.mark}<br /><span className="text-[6px]">WEDDING INVITATION</span></div></div><p className="truncate px-2 py-2 text-[10px]">{template.name}</p></button>)}</div> : <div className="rounded-lg border border-border p-4 text-xs opacity-60">Belum ada desain tersimpan. Pilih template lalu mulai edit.</div>}</div> : activePanel === "Musik" ? <div className="space-y-4 overflow-auto p-4 text-xs"><div className="rounded-lg bg-[#FCE8EF] p-3 text-dc-maroon dark:bg-white/10 dark:text-dc-pink-light"><div className="flex items-center gap-2 font-medium"><Music2 className="h-4 w-4" />Musik undangan</div><p className="mt-1 text-[10px] opacity-70">Pilih lagu untuk menemani tamu saat membuka undangan.</p></div><div className="space-y-2">{musicAssets.length ? musicAssets.map((asset) => <div key={asset.id} className={`flex items-center gap-2 rounded-lg border p-2 ${selectedMusicId === asset.id ? "border-dc-pink bg-[#FCE8EF]/60 dark:bg-white/10" : "border-border"}`}><button type="button" onClick={() => toggleMusic(asset)} className="flex min-w-0 flex-1 items-center gap-2 text-left"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-dc-pink text-white">{playingMusicId === asset.id ? <Pause className="h-3 w-3 fill-current" /> : <Play className="h-3 w-3 fill-current" />}</span><span className="min-w-0 truncate">{asset.title ?? "Musik undangan"}</span></button><button type="button" onClick={() => removeMusic(asset)} className="rounded p-1 opacity-50 hover:text-red-600 hover:opacity-100" aria-label="Hapus musik"><Trash2 className="h-3.5 w-3.5" /></button></div>) : <p className="rounded-lg border border-dashed border-border p-3 text-center opacity-50">Belum ada musik tersimpan.</p>}</div><button type="button" onClick={() => musicUploadRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-lg bg-dc-pink px-3 py-2 font-medium text-white hover:opacity-90"><Upload className="h-3.5 w-3.5" />Upload musik sendiri</button><div className="flex items-center gap-2 text-[10px] opacity-40"><span className="h-px flex-1 bg-current" />atau<span className="h-px flex-1 bg-current" /></div><div className="flex gap-2"><div className="relative flex-1"><Link2 className="absolute left-2 top-2.5 h-3.5 w-3.5 opacity-40" /><input value={musicUrl} onChange={(event) => setMusicUrl(event.target.value)} placeholder="https://.../music.mp3" className="w-full rounded-lg border border-border bg-background py-2 pl-7 pr-2 text-[10px]" /></div><button type="button" onClick={saveMusic} className="rounded-lg border border-dc-pink px-3 py-2 text-dc-pink">Tambah</button></div><p className="text-[10px] opacity-50">MP3, WAV, OGG, AAC, M4A. Maksimal 10 MB.</p></div> : <div className="space-y-4 p-4 text-xs"><button onClick={addText} className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left hover:border-dc-pink"><Type className="h-4 w-4 text-dc-pink" /><span><strong>Tambah teks</strong><small className="mt-1 block opacity-50">Buat judul atau keterangan</small></span></button><button onClick={() => uploadRef.current?.click()} className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left hover:border-dc-pink"><ImagePlus className="h-4 w-4 text-dc-pink" /><span><strong>Tambah foto</strong><small className="mt-1 block opacity-50">Pilih asset dari perangkat</small></span></button></div>}
      </aside>

      <div className="order-3 flex min-h-170 min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-4 py-2"><div className="flex items-center gap-1"><button type="button" onClick={undo} disabled={!history.length} className="rounded p-2 opacity-60 hover:bg-background hover:opacity-100 disabled:opacity-25" aria-label="Undo"><Undo2 className="h-4 w-4" /></button><button type="button" onClick={redo} disabled={!redoHistory.length} className="rounded p-2 opacity-60 hover:bg-background hover:opacity-100 disabled:opacity-25" aria-label="Redo"><Redo2 className="h-4 w-4" /></button><span className="mx-2 h-5 w-px bg-border" /><button type="button" onClick={reset} className="rounded p-2 opacity-60 hover:bg-background hover:opacity-100" aria-label="Reset"><RotateCcw className="h-4 w-4" /></button></div><div className="flex min-w-0 items-center gap-2 text-[10px] opacity-60"><span className="truncate">{notice}</span></div><div className="flex items-center gap-2"><button type="button" onClick={() => setZoom((value) => Math.max(0.45, value - 0.1))} aria-label="Zoom out"><ZoomOut className="h-4 w-4 opacity-60" /></button><input aria-label="Zoom" type="range" min="0.45" max="1.15" step="0.05" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} className="w-20 accent-dc-pink" /><button type="button" onClick={() => setZoom((value) => Math.min(1.15, value + 0.1))} aria-label="Zoom in"><ZoomIn className="h-4 w-4 opacity-60" /></button><span className="w-10 text-right text-[10px] opacity-50">{Math.round(zoom * 100)}%</span></div></div>
        <div className="flex flex-1 items-center justify-center overflow-auto bg-background p-6 sm:p-10"><div className="rounded-lg bg-card p-3 shadow-[0_15px_50px_rgba(37,27,30,0.16)]" style={{ width: canvasWidth * zoom + 24, height: canvasHeight * zoom + 24 }}><Stage ref={stageRef} width={canvasWidth} height={canvasHeight} scaleX={zoom} scaleY={zoom} onMouseDown={(event) => { if (event.target === event.target.getStage()) setSelectedId(""); }}><Layer><Rect width={canvasWidth} height={canvasHeight} fill={templates[activeTemplate].mark === "MM" ? "#f4ded7" : theme.canvas} /><Circle x={60} y={100} radius={105} fill={theme.accent} opacity={0.18} /><Circle x={480} y={640} radius={140} fill="#C5A059" opacity={0.2} /><Line points={[50, 640, 110, 570, 95, 690]} stroke={theme.muted} strokeWidth={2} opacity={0.35} /><Line points={[95, 690, 40, 705]} stroke={theme.muted} strokeWidth={2} opacity={0.35} /><Line points={[450, 125, 495, 65, 510, 150]} stroke={theme.accent} strokeWidth={2} opacity={0.45} /><Group><Circle x={103} y={119} radius={18} fill={theme.muted} opacity={0.3} /><Circle x={437} y={120} radius={16} fill="#C5A059" opacity={0.35} /></Group>{elements.map((element) => { const textFill = isDarkMode ? (element.id === "groom" || element.id === "bride" || element.id === "date" ? theme.ink : theme.muted) : (element.fill ?? theme.ink); return element.type === "text" ? <Text key={element.id} {...element} fontFamily={element.id === "groom" || element.id === "bride" ? "Cinzel" : "Fauna One"} fill={textFill} align="center" draggable onClick={() => setSelectedId(element.id)} onTap={() => setSelectedId(element.id)} onDragEnd={(event) => updateElement(element.id, { x: event.target.x(), y: event.target.y() })} /> : <Line key={element.id} {...element} stroke={theme.accent} strokeWidth={1} onClick={() => setSelectedId(element.id)} />; })}{selected && <Rect x={selected.x - 6} y={selected.y - 6} width={(selected.width ?? 100) + 12} height={(selected.fontSize ?? 18) + 12} stroke={theme.accent} dash={[5, 4]} listening={false} />}</Layer></Stage></div></div>
        <div className="flex items-center justify-center gap-5 border-t border-border bg-card px-4 py-2 text-[10px] opacity-60"><span>Section 1/15</span><span className="h-1 w-1 rounded-full bg-dc-pink" /><span>Cover</span><span>Side Display</span><span>Invitation Design</span></div>
      </div>

      <aside className="order-4 hidden w-56 shrink-0 border-l border-border bg-card xl:block"><div className="border-b border-border p-4 text-xs font-semibold [font-family:var(--font-dc-heading)]">Properti</div>{selected ? <div className="space-y-4 p-4 text-xs"><label className="block">Isi teks<input value={selected.text ?? ""} onChange={(event) => updateElement(selected.id, { text: event.target.value })} className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2" /></label><label className="block">Ukuran teks<input type="range" min="10" max="72" value={selected.fontSize ?? 18} onChange={(event) => updateElement(selected.id, { fontSize: Number(event.target.value) })} className="mt-3 w-full accent-dc-pink" /></label><div className="grid grid-cols-2 gap-2"><button onClick={() => updateElement(selected.id, { y: selected.y - 8 })} className="flex items-center justify-center rounded-lg border border-border p-2" aria-label="Naik"><ArrowUp className="h-4 w-4" /></button><button onClick={() => updateElement(selected.id, { y: selected.y + 8 })} className="flex items-center justify-center rounded-lg border border-border p-2" aria-label="Turun"><ArrowDown className="h-4 w-4" /></button></div><button onClick={() => navigator.clipboard?.writeText(selected.text ?? "")} className="flex w-full items-center justify-center gap-2 rounded-lg border border-border p-2"><Copy className="h-3.5 w-3.5" />Salin teks</button></div> : <p className="p-4 text-xs opacity-50">Pilih elemen di canvas untuk mengedit properti.</p>}</aside>
    </section>
  );
}
