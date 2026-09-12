"use client";

import { useMemo, useState } from "react";
import { Circle, Group, Layer, Rect, Stage, Text } from "react-konva";

type Guest = { id: string; name: string; tableId?: string | null; seatNumber?: number | null; rsvpStatus?: string; source?: "RSVP" | "MANUAL" };
type Table = { id: string; name: string; shape: string; capacity: number };
type Props = { guests: Guest[]; tables: Table[]; accent: string; onAssigned: (guestId: string, tableId: string, seatNumber: number) => Promise<void> };
type Point = { x: number; y: number };

const STAGE_WIDTH = 1100;
const STAGE_HEIGHT = 620;
const TABLE_RADIUS = 72;
const SEAT_RADIUS = 16;
const TABLE_GAP_X = 250;
const TABLE_GAP_Y = 205;

function tablePoint(index: number, total: number): Point {
  const columns = Math.min(4, Math.max(1, Math.ceil(Math.sqrt(total))));
  const rows = Math.max(1, Math.ceil(total / columns));
  const row = Math.floor(index / columns);
  const column = index % columns;
  const width = (columns - 1) * TABLE_GAP_X;
  const rowGap = rows > 1 ? Math.min(TABLE_GAP_Y, (STAGE_HEIGHT - 190) / (rows - 1)) : 0;
  return { x: STAGE_WIDTH / 2 - width / 2 + column * TABLE_GAP_X, y: 95 + row * rowGap };
}

function seatPoint(center: Point, index: number, capacity: number): Point {
  const angle = (Math.PI * 2 * index) / Math.max(capacity, 1) - Math.PI / 2;
  return { x: center.x + Math.cos(angle) * TABLE_RADIUS, y: center.y + Math.sin(angle) * TABLE_RADIUS };
}

function findSeat(point: Point, table: Table, center: Point, occupied: Set<number>) {
  let nearest = -1;
  let distance = Number.POSITIVE_INFINITY;
  for (let index = 0; index < table.capacity; index += 1) {
    const seat = seatPoint(center, index, table.capacity);
    const currentDistance = Math.hypot(point.x - seat.x, point.y - seat.y);
    if (currentDistance < distance) { distance = currentDistance; nearest = index + 1; }
  }
  if (distance > 38 || occupied.has(nearest)) return null;
  return nearest;
}

export default function SeatingChart({ guests, tables, accent, onAssigned }: Props) {
  const [draggedGuestId, setDraggedGuestId] = useState<string | null>(null);
  const [savingGuestId, setSavingGuestId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [manualName, setManualName] = useState("");
  const [manualPhone, setManualPhone] = useState("");
  const [manualSaving, setManualSaving] = useState(false);
  const [localGuests, setLocalGuests] = useState<Guest[]>([]);
  const [localTables, setLocalTables] = useState<Table[]>([]);
  const [tableCount, setTableCount] = useState(tables.length || 1);
  const [seatsPerTable, setSeatsPerTable] = useState(tables[0]?.capacity || 8);
  const [generating, setGenerating] = useState(false);

  const visibleTables = useMemo(() => {
    const known = new Set(tables.map((table) => table.id));
    return [...tables, ...localTables.filter((table) => !known.has(table.id))];
  }, [tables, localTables]);

  const visibleGuests = useMemo(() => {
    const known = new Set(guests.map((guest) => guest.id));
    return [...guests, ...localGuests.filter((guest) => !known.has(guest.id))];
  }, [guests, localGuests]);

  const occupiedByTable = useMemo(() => {
    const map = new Map<string, Set<number>>();
    for (const guest of visibleGuests) {
      if (!guest.tableId || !guest.seatNumber) continue;
      if (!map.has(guest.tableId)) map.set(guest.tableId, new Set());
      map.get(guest.tableId)?.add(guest.seatNumber);
    }
    return map;
  }, [visibleGuests]);

  const unassigned = visibleGuests.filter((guest) => !guest.tableId && (guest.source === "MANUAL" || guest.rsvpStatus === "ATTENDING"));

  async function generateTables(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const count = Math.max(1, Math.floor(tableCount));
    const capacity = Math.max(1, Math.floor(seatsPerTable));
    if (visibleTables.length > 0) { setMessage("Denah sudah memiliki meja. Gunakan data meja yang sudah tersimpan."); return; }
    setGenerating(true); setMessage("");
    try {
      const created: Table[] = [];
      for (let index = 1; index <= count; index += 1) {
        const response = await fetch("/api/wedding-tables", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: `Meja ${index}`, capacity, shape: "ROUND" }) });
        const data = await response.json().catch(() => null);
        if (!response.ok) throw new Error(data?.error || `Meja ${index} gagal dibuat.`);
        created.push(data.table as Table);
      }
      setLocalTables(created);
      setMessage(`Denah dibuat: ${count} meja × ${capacity} bangku.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Denah gagal dibuat."); }
    finally { setGenerating(false); }
  }

  async function addManualGuest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = manualName.trim(); const phone = manualPhone.trim();
    if (!name) { setMessage("Nama tamu manual wajib diisi."); return; }
    setManualSaving(true); setMessage("");
    try {
      const response = await fetch("/api/guests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, phone }) });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "Tamu manual gagal ditambahkan.");
      setLocalGuests((current) => [...current, data.guest as Guest]);
      setManualName(""); setManualPhone(""); setMessage("Tamu manual ditambahkan ke roster.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Tamu manual gagal ditambahkan."); }
    finally { setManualSaving(false); }
  }

  async function assignFromDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (!draggedGuestId || !visibleTables.length) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const scaleX = STAGE_WIDTH / rect.width; const scaleY = STAGE_HEIGHT / rect.height;
    const point = { x: (event.clientX - rect.left) * scaleX, y: (event.clientY - rect.top) * scaleY };
    let selected: { table: Table; seat: number } | null = null;
    visibleTables.forEach((table, index) => { const seat = findSeat(point, table, tablePoint(index, visibleTables.length), occupiedByTable.get(table.id) ?? new Set()); if (seat && !selected) selected = { table, seat }; });
    if (!selected) { setMessage("Jatuhkan tamu tepat di kursi yang kosong."); return; }
    setSavingGuestId(draggedGuestId); setMessage("");
    try { await onAssigned(draggedGuestId, selected.table.id, selected.seat); setMessage("Penempatan tamu tersimpan."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Penempatan tamu gagal disimpan."); }
    finally { setSavingGuestId(null); setDraggedGuestId(null); }
  }

  return (
    <div className="mt-6 grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
      <div className="rounded-2xl border border-[#d8cbc2] bg-[#fffaf6] p-4 dark:border-white/10 dark:bg-black/20">
        <p className={`font-[family-name:var(--font-cinzel)] text-xs font-semibold uppercase tracking-[.14em] ${accent}`}>Setup Denah</p>
        <form onSubmit={generateTables} className="mt-3 space-y-2 border-b border-[#d8cbc2] pb-4 dark:border-white/10">
          <label className="block font-[family-name:var(--font-fauna)] text-xs font-semibold">Jumlah meja<input type="number" min={1} max={100} value={tableCount} onChange={(event) => setTableCount(Number(event.target.value))} className="mt-1 h-10 w-full rounded-xl border border-[#d8cbc2] bg-transparent px-3 outline-none focus:border-[#7A1C25] dark:border-white/10" /></label>
          <label className="block font-[family-name:var(--font-fauna)] text-xs font-semibold">Bangku per meja<input type="number" min={1} max={50} value={seatsPerTable} onChange={(event) => setSeatsPerTable(Number(event.target.value))} className="mt-1 h-10 w-full rounded-xl border border-[#d8cbc2] bg-transparent px-3 outline-none focus:border-[#7A1C25] dark:border-white/10" /></label>
          <button type="submit" disabled={generating || visibleTables.length > 0} className="h-10 w-full rounded-xl bg-[#7A1C25] px-3 font-[family-name:var(--font-fauna)] text-xs font-semibold text-white transition hover:bg-[#5E141C] disabled:opacity-50">{generating ? "Membuat denah..." : visibleTables.length ? `${visibleTables.length} meja tersimpan` : "Buat Denah"}</button>
        </form>
        <p className="mt-3 font-[family-name:var(--font-fauna)] text-xs text-[#5A4545] dark:text-white/70">Jumlah meja dan kapasitas bangku menjadi dasar grafik. Data meja tetap disimpan di database.</p>
        <p className={`mt-3 font-[family-name:var(--font-dm-mono)] text-[10px] font-semibold uppercase tracking-wider ${accent}`}>{visibleTables.length} meja · {visibleTables.reduce((sum, table) => sum + table.capacity, 0)} bangku</p>
        <div className="mt-4 border-t border-[#d8cbc2] pt-4 dark:border-white/10">
          <p className={`font-[family-name:var(--font-cinzel)] text-xs font-semibold uppercase tracking-[.14em] ${accent}`}>Roster Penempatan</p>
          <p className="mt-1 font-[family-name:var(--font-fauna)] text-xs text-[#5A4545] dark:text-white/70">RSVP Hadir dan tamu manual bisa ditempatkan.</p>
          <form onSubmit={addManualGuest} className="mt-3 space-y-2">
            <input value={manualName} onChange={(event) => setManualName(event.target.value)} placeholder="Nama tamu manual" className="h-10 w-full rounded-xl border border-[#d8cbc2] bg-transparent px-3 font-[family-name:var(--font-fauna)] text-xs font-medium outline-none focus:border-[#7A1C25] dark:border-white/10" />
            <input value={manualPhone} onChange={(event) => setManualPhone(event.target.value)} placeholder="WhatsApp (opsional)" className="h-10 w-full rounded-xl border border-[#d8cbc2] bg-transparent px-3 font-[family-name:var(--font-fauna)] text-xs font-medium outline-none focus:border-[#7A1C25] dark:border-white/10" />
            <button type="submit" disabled={manualSaving} className="h-10 w-full rounded-xl bg-[#7A1C25] px-3 font-[family-name:var(--font-fauna)] text-xs font-semibold text-white transition hover:bg-[#5E141C] disabled:opacity-60">{manualSaving ? "Menambahkan..." : "Tambah Tamu Manual"}</button>
          </form>
          <div className="mt-3 space-y-2">
            {unassigned.length === 0 && <p className="font-[family-name:var(--font-fauna)] text-xs text-[#5A4545] dark:text-white/70">Tidak ada tamu yang siap ditempatkan.</p>}
            {unassigned.map((guest) => <div key={guest.id} draggable onDragStart={() => setDraggedGuestId(guest.id)} onDragEnd={() => setDraggedGuestId(null)} className="cursor-grab rounded-xl border border-[#d8cbc2] bg-[#f3ede6] px-3 py-2.5 font-[family-name:var(--font-fauna)] text-xs font-semibold active:cursor-grabbing dark:border-white/10 dark:bg-[#121116]"><div>{guest.name}</div><div className="mt-0.5 font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-wider text-[#765f5f] dark:text-white/60">{guest.source === "RSVP" ? "RSVP · Hadir" : "Manual"}</div></div>)}
          </div>
        </div>
      </div>
      <div className="min-w-0 overflow-hidden rounded-2xl border border-[#d8cbc2] bg-[#fffaf6] p-2 dark:border-white/10 dark:bg-black/20" onDragOver={(event) => event.preventDefault()} onDrop={assignFromDrop}>
        <div className="overflow-auto"><Stage width={STAGE_WIDTH} height={STAGE_HEIGHT}><Layer>
          <Rect x={0} y={0} width={STAGE_WIDTH} height={STAGE_HEIGHT} fill="#F3EDE6" cornerRadius={18} listening={false} />
          {visibleTables.map((table, tableIndex) => { const center = tablePoint(tableIndex, visibleTables.length); return <Group key={table.id}>
            <Rect x={center.x - 48} y={center.y - 30} width={96} height={60} cornerRadius={table.shape === "ROUND" ? 48 : 12} fill="#7A1C25" opacity={0.95} />
            <Text x={center.x - 44} y={center.y - 8} width={88} align="center" text={table.name} fontSize={13} fontStyle="bold" fill="#FFF8F2" />
            {Array.from({ length: table.capacity }).map((_, index) => { const seat = index + 1; const point = seatPoint(center, index, table.capacity); const guest = visibleGuests.find((item) => item.tableId === table.id && item.seatNumber === seat); return <Group key={`${table.id}-${seat}`}>
              <Circle x={point.x} y={point.y} radius={SEAT_RADIUS} fill={guest ? "#C26B70" : "#FFF8F2"} stroke="#7A1C25" strokeWidth={2} />
              <Text x={point.x - 12} y={point.y - 6} width={24} align="center" text={String(seat)} fontSize={10} fontStyle="bold" fill={guest ? "#FFF8F2" : "#7A1C25"} />
              {guest && <Text x={point.x - 42} y={point.y + 20} width={84} align="center" text={guest.name} fontSize={9} fill="#2D2222" />}
            </Group>; })}
          </Group>; })}
          {!visibleTables.length && <Text x={80} y={285} width={940} align="center" text="Masukkan jumlah meja dan bangku di panel kiri untuk membuat denah." fontSize={16} fontStyle="bold" fill="#5A4545" />}
        </Layer></Stage></div>
        <div className="flex items-center justify-between gap-3 px-3 py-2"><p className="font-[family-name:var(--font-fauna)] text-xs text-[#5A4545] dark:text-white/70">Tarik tamu RSVP Hadir atau tamu manual ke kursi kosong.</p>{savingGuestId && <span className="font-[family-name:var(--font-dm-mono)] text-[10px] font-semibold uppercase tracking-wider">Menyimpan...</span>}</div>
        {message && <p className="px-3 pb-3 font-[family-name:var(--font-fauna)] text-xs font-semibold text-[#7A1C25] dark:text-[#E8A5AE]">{message}</p>}
      </div>
    </div>
  );
}
