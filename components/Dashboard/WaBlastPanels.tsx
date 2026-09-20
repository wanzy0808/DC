"use client";

import { Plus, RefreshCw, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDashboardI18n } from "@/components/Dashboard/useDashboardI18n";
import {
  DashboardEmptyState,
  DashboardPanel,
} from "@/components/Dashboard/DashboardPrimitives";
import type { WaBlastGuest, WaBlastRecipient } from "@/components/Dashboard/wa-blast-types";

export function WaBlastAddRecipients({
  availableGuests,
  existingGuestId,
  setExistingGuestId,
  name,
  setName,
  phone,
  setPhone,
  busy,
  canAddRecipients,
  onAddExisting,
  onAddNew,
}: {
  availableGuests: WaBlastGuest[];
  existingGuestId: string;
  setExistingGuestId: (value: string) => void;
  name: string;
  setName: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  busy: boolean;
  canAddRecipients: boolean;
  onAddExisting: () => void;
  onAddNew: () => void;
}) {
  const { d } = useDashboardI18n();

  return (
    <DashboardPanel
      eyebrow={d("Penerima")}
      title={d("Tambah penerima")}
      description={d("Gunakan data tamu yang sudah ada atau tambahkan penerima baru.")}
    >
      <div className="rounded-xl border border-border/70 bg-background p-3">
        <p className="text-xs font-semibold text-foreground">{d("Dari daftar tamu")}</p>
        <select
          value={existingGuestId}
          onChange={(event) => setExistingGuestId(event.target.value)}
          className="mt-2 w-full px-3 text-sm"
          disabled={busy || !canAddRecipients}
        >
          <option value="">{d("Pilih tamu")}</option>
          {availableGuests.map((guest) => (
            <option key={guest.id} value={guest.id}>
              {guest.name} · {guest.phone}
            </option>
          ))}
        </select>
        <Button
          type="button"
          size="sm"
          className="mt-2 w-full"
          disabled={!existingGuestId || busy || !canAddRecipients}
          onClick={onAddExisting}
        >
          <Plus className="h-4 w-4" />
          {d("Tambahkan penerima")}
        </Button>
      </div>

      <div className="rounded-xl border border-border/70 bg-background p-3">
        <p className="text-xs font-semibold text-foreground">{d("Tamu belum ada")}</p>
        <div className="mt-2 space-y-2">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={d("Nama tamu")}
            disabled={busy || !canAddRecipients}
          />
          <Input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder={d("Nomor WhatsApp")}
            disabled={busy || !canAddRecipients}
          />
          <Button
            type="button"
            size="sm"
            className="w-full"
            disabled={!name.trim() || !phone.trim() || busy || !canAddRecipients}
            onClick={onAddNew}
          >
            <Plus className="h-4 w-4" />
            {d("Tambah tamu & penerima")}
          </Button>
        </div>
      </div>
    </DashboardPanel>
  );
}

export function WaBlastRecipientQueue({
  selected,
  busy,
  onReload,
  onRemove,
}: {
  selected: WaBlastRecipient[];
  busy: boolean;
  onReload: () => void;
  onRemove: (id: string) => void;
}) {
  const { d } = useDashboardI18n();

  return (
    <DashboardPanel
      eyebrow={d("Queue")}
      title={d("Tamu yang akan diblast")}
      description={d("Kuota mengikuti pilihan di atas.")}
      actions={
        <Button type="button" size="sm" onClick={onReload} disabled={busy}>
          <RefreshCw className="h-4 w-4" />
          {d("Muat ulang")}
        </Button>
      }
    >
      <div className="mt-4 space-y-2">
        {selected.length === 0 && (
          <DashboardEmptyState
            icon={Users}
            title={d("Belum ada penerima")}
            description={d("Tambahkan dari daftar tamu atau buat penerima baru.")}
          />
        )}
        {selected.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left">
              <thead>
                <tr>
                  <th className="px-3 py-3">{d("Nama tamu")}</th>
                  <th className="px-3 py-3">WhatsApp</th>
                  <th className="px-3 py-3 text-right">{d("Aksi")}</th>
                </tr>
              </thead>
              <tbody>
                {selected.map((guest) => (
                  <tr key={guest.id}>
                    <td className="px-3 py-4 text-sm font-semibold">{guest.name}</td>
                    <td className="px-3 py-4 font-[family-name:var(--font-dc-mono)] text-xs text-muted-foreground">
                      {guest.phone || d("Nomor belum ada")}
                    </td>
                    <td className="px-3 py-4 text-right">
                      <Button
                        type="button"
                        size="icon-sm"
                        onClick={() => onRemove(guest.id)}
                        disabled={busy}
                        title={d("Hapus dari daftar WA Blast")}
                        aria-label={`${d("Hapus")} ${guest.name} · WA Blast`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardPanel>
  );
}
