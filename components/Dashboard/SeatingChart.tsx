"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, LayoutGrid, UserPlus, X } from "lucide-react";
import { Circle, Group, Layer, Rect, Stage, Text } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import { useTheme } from "@/components/Theme/ThemeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DashboardCompactStat,
  DashboardEmptyState,
  DashboardSectionHeader,
  DashboardStatusBadge,
  DashboardSurface,
} from "@/components/Dashboard/DashboardPrimitives";
import { matchesGuestLabels, type GuestLabels } from "@/lib/guests/filters";

type Guest = GuestLabels & {
  id: string;
  name: string;
  tableId?: string | null;
  seatNumber?: number | null;
  rsvpStatus?: string;
  source?: "RSVP" | "MANUAL";
};

type Table = {
  id: string;
  name: string;
  shape: string;
  capacity: number;
};

type Props = {
  invitationId: string;
  guests: Guest[];
  tables: Table[];
  accent?: string;
  onAssigned: (
    guestId: string,
    tableId: string,
    seatNumber: number,
  ) => Promise<void>;
};

type Point = { x: number; y: number };
type SeatTarget = { table: Table; seat: number; guest: Guest | null };

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
  const rowGap =
    rows > 1 ? Math.min(TABLE_GAP_Y, (STAGE_HEIGHT - 190) / (rows - 1)) : 0;

  return {
    x: STAGE_WIDTH / 2 - width / 2 + column * TABLE_GAP_X,
    y: 95 + row * rowGap,
  };
}

function seatPoint(center: Point, index: number, capacity: number): Point {
  const angle = (Math.PI * 2 * index) / Math.max(capacity, 1) - Math.PI / 2;
  return {
    x: center.x + Math.cos(angle) * TABLE_RADIUS,
    y: center.y + Math.sin(angle) * TABLE_RADIUS,
  };
}

function findSeatTarget(
  point: Point,
  tables: Table[],
  guests: Guest[],
  draggedGuestId: string | null,
): SeatTarget | null {
  let nearest: SeatTarget | null = null;
  let distance = Number.POSITIVE_INFINITY;

  tables.forEach((table, tableIndex) => {
    const center = tablePoint(tableIndex, tables.length);
    for (let index = 0; index < table.capacity; index += 1) {
      const seat = seatPoint(center, index, table.capacity);
      const currentDistance = Math.hypot(point.x - seat.x, point.y - seat.y);
      if (currentDistance >= distance || currentDistance > 38) continue;

      nearest = {
        table,
        seat: index + 1,
        guest:
          guests.find(
            (item) =>
              item.tableId === table.id &&
              item.seatNumber === index + 1 &&
              item.id !== draggedGuestId,
          ) ?? null,
      };
      distance = currentDistance;
    }
  });

  return nearest;
}

export default function SeatingChart({ invitationId, guests, tables, onAssigned }: Props) {
  const { isDarkMode } = useTheme();
  const [draggedGuestId, setDraggedGuestId] = useState<string | null>(null);
  const [savingGuestId, setSavingGuestId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [manualName, setManualName] = useState("");
  const [manualSaving, setManualSaving] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [localGuests, setLocalGuests] = useState<Guest[]>([]);
  const [localTables, setLocalTables] = useState<Table[]>([]);
  const [guestOverrides, setGuestOverrides] = useState<
    Record<string, Partial<Guest>>
  >({});
  const [hoverTarget, setHoverTarget] = useState<SeatTarget | null>(null);
  const [swapCandidate, setSwapCandidate] = useState<{
    guestId: string;
    target: SeatTarget;
  } | null>(null);
  const [tableCount, setTableCount] = useState(tables.length || 1);
  const [seatsPerTable, setSeatsPerTable] = useState(
    tables[0]?.capacity || 8,
  );
  const [generating, setGenerating] = useState(false);

  const visibleTables = useMemo(() => {
    const known = new Set(tables.map((table) => table.id));
    return [
      ...tables,
      ...localTables.filter((table) => !known.has(table.id)),
    ];
  }, [tables, localTables]);

  const visibleGuests = useMemo(() => {
    const known = new Set(guests.map((guest) => guest.id));
    const merged = [
      ...guests,
      ...localGuests.filter((guest) => !known.has(guest.id)),
    ];

    return merged.map((guest) =>
      guestOverrides[guest.id]
        ? { ...guest, ...guestOverrides[guest.id] }
        : guest,
    );
  }, [guests, localGuests, guestOverrides]);

  const unassigned = visibleGuests.filter(
    (guest) =>
      !guest.tableId &&
      (guest.source === "MANUAL" || guest.rsvpStatus === "ATTENDING"),
  );
  const draggedGuest = draggedGuestId
    ? (visibleGuests.find((guest) => guest.id === draggedGuestId) ?? null)
    : null;
  const categories = Array.from(
    new Set(visibleGuests.flatMap((guest) => guest.category ? [guest.category] : [])),
  ).sort((a, b) => a.localeCompare(b, "id"));
  const tags = Array.from(
    new Set(visibleGuests.flatMap((guest) => guest.tags ?? [])),
  ).sort((a, b) => a.localeCompare(b, "id"));
  const filteredUnassigned = unassigned.filter((guest) =>
    matchesGuestLabels(guest, categoryFilter, tagFilter),
  );
  const hasRosterFilter = Boolean(categoryFilter || tagFilter);
  const totalSeats = visibleTables.reduce((sum, table) => sum + table.capacity, 0);
  const assignedCount = visibleGuests.filter((guest) => guest.tableId).length;

  const canvas = {
    background: isDarkMode ? "#111113" : "#FBFAFA",
    table: "#C07A84",
    tableText: isDarkMode ? "#111111" : "#FFFFFF",
    seatEmpty: isDarkMode ? "#0B0B0C" : "#FFFFFF",
    seatOccupied: "#D9A3AA",
    seatStroke: "#C07A84",
    guestText: isDarkMode ? "#FFFFFF" : "#111111",
    mutedText: isDarkMode ? "#A3A3A3" : "#737373",
  };

  async function generateTables(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const count = Math.max(1, Math.floor(tableCount));
    const capacity = Math.max(1, Math.floor(seatsPerTable));

    if (visibleTables.length > 0) {
      setMessage(
        "Denah sudah memiliki meja. Gunakan data meja yang sudah tersimpan.",
      );
      return;
    }

    setGenerating(true);
    setMessage("");
    try {
      const created: Table[] = [];
      for (let index = 1; index <= count; index += 1) {
        const response = await fetch("/api/tables", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            invitationId,
            name: `Meja ${index}`,
            capacity,
            shape: "ROUND",
          }),
        });
        const data = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(data?.error || `Meja ${index} gagal dibuat.`);
        }
        created.push(data.table as Table);
      }
      setLocalTables(created);
      setMessage(`Denah dibuat: ${count} meja × ${capacity} bangku.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Denah gagal dibuat.");
    } finally {
      setGenerating(false);
    }
  }

  async function addManualGuest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = manualName.trim();
    if (!name) {
      setMessage("Nama tamu manual wajib diisi.");
      return;
    }

    setManualSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId, name }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || "Tamu manual gagal ditambahkan.");
      }
      setLocalGuests((current) => [...current, data.guest as Guest]);
      setManualName("");
      setMessage("Tamu manual ditambahkan ke roster.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Tamu manual gagal ditambahkan.",
      );
    } finally {
      setManualSaving(false);
    }
  }

  function targetAtPoint(point: Point) {
    return findSeatTarget(point, visibleTables, visibleGuests, draggedGuestId);
  }

  function setHoverFromPoint(point: Point) {
    if (!draggedGuestId) return;
    setHoverTarget(targetAtPoint(point));
  }

  async function assignGuestAtPoint(guestId: string, point: Point) {
    const target = targetAtPoint(point);
    setHoverTarget(null);

    if (!target) {
      setMessage("Jatuhkan tamu tepat di kursi.");
      setDraggedGuestId(null);
      return;
    }

    if (target.guest) {
      setSwapCandidate({ guestId, target });
      return;
    }

    setSavingGuestId(guestId);
    setMessage("");
    try {
      await onAssigned(guestId, target.table.id, target.seat);
      setGuestOverrides((current) => ({
        ...current,
        [guestId]: { tableId: target.table.id, seatNumber: target.seat },
      }));
      setMessage("Penempatan tamu tersimpan.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Penempatan tamu gagal disimpan.",
      );
    } finally {
      setSavingGuestId(null);
      setDraggedGuestId(null);
    }
  }

  async function confirmSwap() {
    if (!swapCandidate) return;
    const { guestId, target } = swapCandidate;
    if (!target.guest) return;

    const source = visibleGuests.find((guest) => guest.id === guestId);
    if (!source) return;

    setSavingGuestId(guestId);
    setMessage("");
    try {
      const response = await fetch(`/api/guests/${guestId}/swap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetGuestId: target.guest.id }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || "Tukar posisi gagal disimpan.");
      }

      const swapped = data.guests as Guest[];
      const sourceResult = swapped.find((guest) => guest.id === guestId);
      const targetResult = swapped.find(
        (guest) => guest.id === target.guest?.id,
      );

      setGuestOverrides((current) => ({
        ...current,
        ...(sourceResult
          ? {
              [sourceResult.id]: {
                tableId: sourceResult.tableId,
                seatNumber: sourceResult.seatNumber,
              },
            }
          : {}),
        ...(targetResult
          ? {
              [targetResult.id]: {
                tableId: targetResult.tableId,
                seatNumber: targetResult.seatNumber,
              },
            }
          : {}),
      }));

      setMessage(`Posisi ${source.name} dan ${target.guest.name} ditukar.`);
      setSwapCandidate(null);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Tukar posisi gagal disimpan.",
      );
    } finally {
      setSavingGuestId(null);
      setDraggedGuestId(null);
      setHoverTarget(null);
    }
  }

  function cancelSwap() {
    setSwapCandidate(null);
    setDraggedGuestId(null);
    setHoverTarget(null);
    setMessage("Tukar posisi dibatalkan.");
  }

  async function assignFromDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (!draggedGuestId) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const scaleX = STAGE_WIDTH / rect.width;
    const scaleY = STAGE_HEIGHT / rect.height;

    await assignGuestAtPoint(draggedGuestId, {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    });
  }

  async function handleCanvasGuestDragEnd(
    guestId: string,
    event: KonvaEventObject<DragEvent>,
  ) {
    const stage = event.target.getStage();
    const point = stage?.getPointerPosition();
    event.target.position({ x: 0, y: 0 });

    if (!point) {
      setDraggedGuestId(null);
      setHoverTarget(null);
      return;
    }

    await assignGuestAtPoint(guestId, point);
  }

  return (
    <div className="mt-5 grid min-w-0 gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="min-w-0 space-y-4">
        <DashboardSurface className="p-4">
          <DashboardSectionHeader
            eyebrow="Setup"
            title="Struktur meja"
            description="Atur jumlah meja dan kapasitas kursi sebelum menempatkan tamu."
            actions={
              <DashboardStatusBadge active={visibleTables.length > 0}>
                {visibleTables.length} meja
              </DashboardStatusBadge>
            }
          />

          <form onSubmit={generateTables} className="mt-4 space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium">Jumlah meja</span>
              <Input
                type="number"
                min={1}
                max={100}
                value={tableCount}
                onChange={(event) => setTableCount(Number(event.target.value))}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium">Bangku per meja</span>
              <Input
                type="number"
                min={1}
                max={50}
                value={seatsPerTable}
                onChange={(event) => setSeatsPerTable(Number(event.target.value))}
              />
            </label>
            <Button
              type="submit"
              size="sm"
              className="w-full"
              disabled={generating || visibleTables.length > 0}
              title={visibleTables.length ? "Denah meja sudah tersimpan" : "Buat denah meja"}
            >
              <LayoutGrid className="h-4 w-4" />
              {generating
                ? "Membuat denah meja..."
                : visibleTables.length
                  ? "Denah meja tersimpan"
                  : "Buat denah meja"}
            </Button>
          </form>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <DashboardCompactStat label="Kursi" value={String(totalSeats)} />
            <DashboardCompactStat label="Terisi" value={String(assignedCount)} />
          </div>
        </DashboardSurface>

        <DashboardSurface className="p-4">
          <DashboardSectionHeader
            eyebrow="Roster"
            title="Belum ditempatkan"
            description="Tambahkan tamu manual atau tarik tamu yang belum memiliki meja ke denah."
            actions={
              <DashboardStatusBadge active={unassigned.length > 0}>
                {unassigned.length} tamu
              </DashboardStatusBadge>
            }
          />

          <form onSubmit={addManualGuest} className="mt-4 space-y-2">
            <Input
              value={manualName}
              onChange={(event) => setManualName(event.target.value)}
              placeholder="Nama tamu manual"
            />
            <Button
              type="submit"
              size="sm"
              className="w-full"
              disabled={manualSaving}
              title="Tambahkan tamu manual ke roster"
            >
              <UserPlus className="h-4 w-4" />
              {manualSaving ? "Menambahkan tamu..." : "Tambah tamu manual"}
            </Button>
          </form>

          <div className="mt-4 space-y-3">
            <label className="block text-xs text-muted-foreground">
              Kategori tamu
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
              >
                <option value="">Semua kategori</option>
                {categoryFilter && !categories.includes(categoryFilter) && (
                  <option value={categoryFilter}>{categoryFilter}</option>
                )}
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </label>
            <label className="block text-xs text-muted-foreground">
              Tag tamu
              <select
                value={tagFilter}
                onChange={(event) => setTagFilter(event.target.value)}
                className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
              >
                <option value="">Semua tag</option>
                {tagFilter && !tags.includes(tagFilter) && (
                  <option value={tagFilter}>{tagFilter}</option>
                )}
                {tags.map((tag) => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </label>
            <p role="status" className="text-xs text-muted-foreground">
              Menampilkan {filteredUnassigned.length} dari {unassigned.length} tamu belum ditempatkan.
            </p>
            {hasRosterFilter && (
              <Button
                type="button"
                className="min-h-11"
                onClick={() => { setCategoryFilter(""); setTagFilter(""); }}
              >
                Reset filter
              </Button>
            )}
          </div>

          <div className="mt-4 max-h-80 space-y-2 overflow-y-auto pr-1">
            {filteredUnassigned.length === 0 && (
              <DashboardEmptyState
                title={hasRosterFilter ? "Tidak ada hasil" : "Semua tamu sudah ditempatkan"}
                description={
                  hasRosterFilter
                    ? "Tidak ada tamu belum ditempatkan yang cocok dengan filter aktif."
                    : "Tamu yang belum memiliki meja akan muncul di sini."
                }
              />
            )}
            {filteredUnassigned.map((guest) => (
              <div
                key={guest.id}
                draggable
                onDragStart={() => {
                  setDraggedGuestId(guest.id);
                  setSwapCandidate(null);
                }}
                className="cursor-grab rounded-lg border border-border/75 bg-background px-3 py-2.5 text-xs transition hover:border-primary/30 hover:bg-primary/[0.035] active:cursor-grabbing"
              >
                <div className="truncate font-medium text-foreground">{guest.name}</div>
                {(guest.category || Boolean(guest.tags?.length)) && (
                  <p className="mt-1 break-words text-xs text-muted-foreground">
                    {[guest.category, ...(guest.tags ?? [])].filter(Boolean).join(" · ")}
                  </p>
                )}
                <div className="mt-1 font-[family-name:var(--font-dc-mono)] text-[8px] uppercase tracking-[0.1em] text-muted-foreground">
                  {guest.source === "RSVP" ? "RSVP · Hadir" : "Manual"}
                </div>
              </div>
            ))}
          </div>
        </DashboardSurface>
      </aside>

      <DashboardSurface className="min-w-0 p-4 sm:p-5">
        <DashboardSectionHeader
          eyebrow="Seating"
          title="Denah tempat duduk"
          description="Tarik tamu ke kursi untuk menyimpan posisi dan melihat distribusi meja secara visual."
          actions={
            <div className="flex gap-2">
              <DashboardCompactStat label="Meja" value={String(visibleTables.length)} className="min-w-20" />
              <DashboardCompactStat label="Tamu" value={`${assignedCount}/${visibleGuests.length}`} className="min-w-20" />
            </div>
          }
        />

        <div
          className="min-w-0 overflow-hidden rounded-xl border border-border/80 bg-background"
          onDragOver={(event) => {
            event.preventDefault();
            const rect = event.currentTarget.getBoundingClientRect();
            const scaleX = STAGE_WIDTH / rect.width;
            const scaleY = STAGE_HEIGHT / rect.height;
            setHoverFromPoint({
              x: (event.clientX - rect.left) * scaleX,
              y: (event.clientY - rect.top) * scaleY,
            });
          }}
          onDrop={assignFromDrop}
        >
          <div className="overflow-auto">
            <Stage width={STAGE_WIDTH} height={STAGE_HEIGHT}>
              <Layer>
                <Rect
                  x={0}
                  y={0}
                  width={STAGE_WIDTH}
                  height={STAGE_HEIGHT}
                  fill={canvas.background}
                  listening={false}
                />

                {visibleTables.map((table, tableIndex) => {
                  const center = tablePoint(tableIndex, visibleTables.length);
                  return (
                    <Group key={table.id}>
                      <Rect
                        x={center.x - 48}
                        y={center.y - 30}
                        width={96}
                        height={60}
                        cornerRadius={table.shape === "ROUND" ? 48 : 10}
                        fill={canvas.table}
                      />
                      <Text
                        x={center.x - 44}
                        y={center.y - 8}
                        width={88}
                        align="center"
                        text={table.name}
                        fontSize={13}
                        fontStyle="bold"
                        fill={canvas.tableText}
                      />

                      {Array.from({ length: table.capacity }).map((_, index) => {
                        const seat = index + 1;
                        const point = seatPoint(center, index, table.capacity);
                        const guest = visibleGuests.find(
                          (item) =>
                            item.tableId === table.id &&
                            item.seatNumber === seat,
                        );
                        const highlighted =
                          hoverTarget?.table.id === table.id &&
                          hoverTarget.seat === seat;
                        const occupiedTarget = highlighted && Boolean(hoverTarget?.guest);

                        return (
                          <Group key={`${table.id}-${seat}`}>
                            <Circle
                              x={point.x}
                              y={point.y}
                              radius={highlighted ? SEAT_RADIUS + 5 : SEAT_RADIUS}
                              fill={guest ? canvas.seatOccupied : canvas.seatEmpty}
                              stroke={canvas.seatStroke}
                              strokeWidth={highlighted ? 5 : 2}
                              opacity={occupiedTarget ? 0.92 : 1}
                              draggable={Boolean(guest)}
                              onDragStart={() => {
                                if (guest) {
                                  setDraggedGuestId(guest.id);
                                  setSwapCandidate(null);
                                }
                              }}
                              onDragMove={(event) => {
                                if (!guest) return;
                                const stage = event.target.getStage();
                                const pointer = stage?.getPointerPosition();
                                if (pointer) setHoverFromPoint(pointer);
                              }}
                              onDragEnd={(event) =>
                                guest && handleCanvasGuestDragEnd(guest.id, event)
                              }
                            />
                            <Text
                              x={point.x - 12}
                              y={point.y - 6}
                              width={24}
                              align="center"
                              text={String(seat)}
                              fontSize={10}
                              fontStyle="bold"
                              fill={guest ? canvas.guestText : canvas.seatStroke}
                              listening={false}
                            />
                            {guest && (
                              <Text
                                x={point.x - 42}
                                y={point.y + 20}
                                width={84}
                                align="center"
                                text={guest.name}
                                fontSize={9}
                                fill={canvas.guestText}
                                listening={false}
                              />
                            )}
                          </Group>
                        );
                      })}
                    </Group>
                  );
                })}

                {!visibleTables.length && (
                  <Text
                    x={80}
                    y={285}
                    width={940}
                    align="center"
                    text="Atur jumlah meja dan kursi untuk membuat denah."
                    fontSize={15}
                    fill={canvas.mutedText}
                  />
                )}
              </Layer>
            </Stage>
          </div>
        </div>

        <div className="mt-3 flex min-h-10 flex-wrap items-center justify-between gap-3 rounded-lg bg-background px-3 py-2 text-xs text-muted-foreground">
          <span>Tarik tamu ke kursi untuk menyimpan posisi.</span>
          {savingGuestId && (
            <span className="font-[family-name:var(--font-dc-mono)] text-[9px] uppercase tracking-[0.1em] text-primary">
              Menyimpan...
            </span>
          )}
        </div>

        {swapCandidate && (
          <div className="mt-3 rounded-xl border border-primary/20 bg-primary/[0.045] p-4">
            <p className="text-xs font-medium leading-5 text-foreground">
              Kursi ditempati {swapCandidate.target.guest?.name}. Tukar dengan {draggedGuest?.name}?
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                onClick={confirmSwap}
                disabled={Boolean(savingGuestId)}
                title="Konfirmasi tukar posisi tamu"
              >
                <ArrowLeftRight className="h-4 w-4" />
                Tukar posisi
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={cancelSwap}
                disabled={Boolean(savingGuestId)}
                title="Batalkan tukar posisi"
              >
                <X className="h-4 w-4" />
                Batal tukar
              </Button>
            </div>
          </div>
        )}

        {message && (
          <p
            className="mt-3 rounded-lg border border-primary/15 bg-primary/[0.035] px-3 py-2.5 text-xs font-medium leading-5 text-primary"
            role="status"
          >
            {message}
          </p>
        )}
      </DashboardSurface>
    </div>
  );
}

function InfoCell({
  label,
  value,
  compact = false,
}: {
  label: string;
  value: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border border-border/70 bg-background/75 ${compact ? "min-w-20 px-2.5 py-1.5" : "px-3 py-2.5"}`}
    >
      <p className="font-[family-name:var(--font-dc-mono)] text-[8px] uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-xs font-semibold text-foreground">{value}</p>
    </div>
  );
}
