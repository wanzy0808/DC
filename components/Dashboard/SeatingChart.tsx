"use client";

import { useMemo, useState } from "react";
import { Layer, Rect, Stage, Text, Group, Circle } from "react-konva";

type Guest = {
  id: string;
  name: string;
  tableId?: string | null;
  seatNumber?: number | null;
};

type Table = {
  id: string;
  name: string;
  shape: string;
  capacity: number;
};

type Props = {
  guests: Guest[];
  tables: Table[];
  accent: string;
  onAssigned: (guestId: string, tableId: string, seatNumber: number) => Promise<void>;
};

type Point = { x: number; y: number };

const STAGE_WIDTH = 900;
const STAGE_HEIGHT = 460;
const TABLE_POSITIONS: Point[] = [
  { x: 180, y: 125 },
  { x: 450, y: 125 },
  { x: 720, y: 125 },
  { x: 180, y: 335 },
  { x: 450, y: 335 },
  { x: 720, y: 335 },
];

function seatPoint(center: Point, index: number, capacity: number): Point {
  const angle = (Math.PI * 2 * index) / Math.max(capacity, 1) - Math.PI / 2;
  return { x: center.x + Math.cos(angle) * 58, y: center.y + Math.sin(angle) * 58 };
}

function findSeat(point: Point, table: Table, tableIndex: number, occupied: Set<number>) {
  const center = TABLE_POSITIONS[tableIndex % TABLE_POSITIONS.length];
  let nearest = -1;
  let distance = Number.POSITIVE_INFINITY;
  for (let index = 0; index < table.capacity; index += 1) {
    const seat = seatPoint(center, index, table.capacity);
    const currentDistance = Math.hypot(point.x - seat.x, point.y - seat.y);
    if (currentDistance < distance) {
      distance = currentDistance;
      nearest = index + 1;
    }
  }
  if (distance > 32 || occupied.has(nearest)) return null;
  return nearest;
}

export default function SeatingChart({ guests, tables, accent, onAssigned }: Props) {
  const [draggedGuestId, setDraggedGuestId] = useState<string | null>(null);
  const [savingGuestId, setSavingGuestId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const occupiedByTable = useMemo(() => {
    const map = new Map<string, Set<number>>();
    for (const guest of guests) {
      if (!guest.tableId || !guest.seatNumber) continue;
      if (!map.has(guest.tableId)) map.set(guest.tableId, new Set());
      map.get(guest.tableId)?.add(guest.seatNumber);
    }
    return map;
  }, [guests]);

  const unassigned = guests.filter((guest) => !guest.tableId);

  async function assignFromDrop(table: Table, tableIndex: number, event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (!draggedGuestId) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const scaleX = STAGE_WIDTH / rect.width;
    const scaleY = STAGE_HEIGHT / rect.height;
    const point = { x: (event.clientX - rect.left) * scaleX, y: (event.clientY - rect.top) * scaleY };
    const seat = findSeat(point, table, tableIndex, occupiedByTable.get(table.id) ?? new Set());
    if (!seat) {
      setMessage("Jatuhkan tamu tepat di kursi yang kosong.");
      return;
    }
    setSavingGuestId(draggedGuestId);
    setMessage("");
    try {
      await onAssigned(draggedGuestId, table.id, seat);
      setMessage("Penempatan tamu tersimpan.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Penempatan tamu gagal disimpan.");
    } finally {
      setSavingGuestId(null);
      setDraggedGuestId(null);
    }
  }

  return (
    <div className="mt-6 grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
      <div className="rounded-2xl border border-[#d8cbc2] bg-[#fffaf6] p-4 dark:border-white/10 dark:bg-black/20">
        <p className={`font-[family-name:var(--font-cinzel)] text-xs font-semibold uppercase tracking-[.14em] ${accent}`}>Tamu belum ditempatkan</p>
        <div className="mt-3 space-y-2">
          {unassigned.length === 0 && <p className="font-[family-name:var(--font-fauna)] text-xs text-[#5A4545] dark:text-white/70">Semua tamu sudah memiliki meja.</p>}
          {unassigned.map((guest) => (
            <div
              key={guest.id}
              draggable
              onDragStart={() => setDraggedGuestId(guest.id)}
              onDragEnd={() => setDraggedGuestId(null)}
              className="cursor-grab rounded-xl border border-[#d8cbc2] bg-[#f3ede6] px-3 py-2.5 font-[family-name:var(--font-fauna)] text-xs font-semibold active:cursor-grabbing dark:border-white/10 dark:bg-[#121116]"
            >
              {guest.name}
            </div>
          ))}
        </div>
      </div>

      <div
        className="min-w-0 overflow-hidden rounded-2xl border border-[#d8cbc2] bg-[#fffaf6] p-2 dark:border-white/10 dark:bg-black/20"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          const target = event.target as HTMLElement;
          const tableIndex = Number(target.dataset.tableIndex ?? -1);
          if (tableIndex >= 0 && tables[tableIndex]) void assignFromDrop(tables[tableIndex], tableIndex, event);
        }}
      >
        <div className="overflow-x-auto">
          <Stage width={STAGE_WIDTH} height={STAGE_HEIGHT}>
            <Layer>
              <Rect x={0} y={0} width={STAGE_WIDTH} height={STAGE_HEIGHT} fill="#F3EDE6" cornerRadius={18} listening={false} />
              {tables.slice(0, TABLE_POSITIONS.length).map((table, tableIndex) => {
                const center = TABLE_POSITIONS[tableIndex];
                const occupied = occupiedByTable.get(table.id) ?? new Set<number>();
                return (
                  <Group key={table.id}>
                    <Rect x={center.x - 46} y={center.y - 30} width={92} height={60} cornerRadius={table.shape === "ROUND" ? 46 : 12} fill="#7A1C25" opacity={0.95} />
                    <Text x={center.x - 40} y={center.y - 8} width={80} align="center" text={table.name} fontSize={13} fontStyle="bold" fill="#FFF8F2" />
                    {Array.from({ length: table.capacity }).map((_, index) => {
                      const seat = index + 1;
                      const point = seatPoint(center, index, table.capacity);
                      const guest = guests.find((item) => item.tableId === table.id && item.seatNumber === seat);
                      return (
                        <Group key={`${table.id}-${seat}`}>
                          <Circle x={point.x} y={point.y} radius={15} fill={guest ? "#C26B70" : "#FFF8F2"} stroke="#7A1C25" strokeWidth={2} />
                          <Text x={point.x - 12} y={point.y - 6} width={24} align="center" text={String(seat)} fontSize={10} fontStyle="bold" fill={guest ? "#FFF8F2" : "#7A1C25"} />
                          {guest && <Text x={point.x - 38} y={point.y + 18} width={76} align="center" text={guest.name} fontSize={9} fill="#2D2222" />}
                        </Group>
                      );
                    })}
                  </Group>
                );
              })}
              {tables.length > TABLE_POSITIONS.length && <Text x={24} y={430} text={`Menampilkan ${TABLE_POSITIONS.length} meja pertama. Meja tambahan tetap tersimpan.`} fontSize={11} fill="#5A4545" />}
            </Layer>
          </Stage>
        </div>
        <div className="flex items-center justify-between gap-3 px-3 py-2">
          <p className="font-[family-name:var(--font-fauna)] text-xs text-[#5A4545] dark:text-white/70">Tarik nama tamu ke kursi kosong pada meja.</p>
          {savingGuestId && <span className="font-[family-name:var(--font-dm-mono)] text-[10px] font-semibold uppercase tracking-wider">Menyimpan...</span>}
        </div>
        {message && <p className="px-3 pb-3 font-[family-name:var(--font-fauna)] text-xs font-semibold text-[#7A1C25] dark:text-[#E8A5AE]">{message}</p>}
      </div>
    </div>
  );
}
