"use client";

import { Input } from "@/components/ui/input";
import { useDashboardI18n } from "@/components/Dashboard/useDashboardI18n";
import type { PersonalInvitationGuest } from "@/components/Dashboard/personal-invitation-types";

export type GuestInvitationForm = {
  recipientType: "INDIVIDUAL" | "COUPLE" | "FAMILY" | "GROUP";
  invitedPax: number;
  category: string;
  groupText: string;
  personalAddressee: string;
  personalGreeting: string;
};

export const emptyGuestInvitationForm: GuestInvitationForm = {
  recipientType: "INDIVIDUAL",
  invitedPax: 1,
  category: "REGULAR",
  groupText: "",
  personalAddressee: "",
  personalGreeting: "",
};

export function guestInvitationFormFrom(guest: PersonalInvitationGuest): GuestInvitationForm {
  return {
    recipientType: guest.recipientType ?? "INDIVIDUAL",
    invitedPax: guest.invitedPax ?? 1,
    category: guest.category || "REGULAR",
    groupText: (guest.tags ?? []).join(", "),
    personalAddressee: guest.personalAddressee || "",
    personalGreeting: guest.personalGreeting || "",
  };
}

/** Category and grouping reuse Guest.category and Guest.tags, not new tables. */
export function guestInvitationProfilePayload(value: GuestInvitationForm) {
  return {
    recipientType: value.recipientType,
    invitedPax: value.invitedPax,
    category: value.category,
    tags: Array.from(new Set(value.groupText.split(",").map((item) => item.trim()).filter(Boolean))),
    personalAddressee: value.personalAddressee.trim(),
    personalGreeting: value.personalGreeting.trim(),
  };
}

export function PersonalInvitationGuestFields({
  value,
  onChange,
  disabled = false,
}: {
  value: GuestInvitationForm;
  onChange: (next: GuestInvitationForm) => void;
  disabled?: boolean;
}) {
  const { d } = useDashboardI18n();
  function set<K extends keyof GuestInvitationForm>(key: K, next: GuestInvitationForm[K]) {
    onChange({ ...value, [key]: next });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block min-w-0 text-sm font-medium text-foreground">
          {d("Jenis penerima")}
          <select
            value={value.recipientType}
            onChange={(event) => {
              const recipientType = event.target.value as GuestInvitationForm["recipientType"];
              onChange({
                ...value,
                recipientType,
                invitedPax: value.invitedPax === 1 && recipientType === "COUPLE" ? 2 : value.invitedPax,
              });
            }}
            disabled={disabled}
            className="mt-1.5 min-h-11 w-full border border-primary/25 bg-background px-3 text-sm text-foreground"
          >
            <option value="INDIVIDUAL">{d("Perorangan")}</option>
            <option value="COUPLE">{d("Pasangan")}</option>
            <option value="FAMILY">{d("Keluarga")}</option>
            <option value="GROUP">{d("Rombongan")}</option>
          </select>
        </label>
        <label className="block min-w-0 text-sm font-medium text-foreground">
          {d("Jumlah tamu yang diundang")}
          <Input
            type="number"
            min={1}
            max={30}
            step={1}
            value={value.invitedPax}
            onChange={(event) => set("invitedPax", Number(event.target.value))}
            disabled={disabled}
            className="mt-1.5"
          />
          <span className="mt-1 block text-xs text-muted-foreground">
            {d("Batas RSVP, bukan jumlah yang sudah hadir.")}
          </span>
        </label>
      </div>
      <label className="block min-w-0 text-sm font-medium text-foreground">
        {d("Kategori tamu")}
        <select
          value={value.category}
          onChange={(event) => set("category", event.target.value)}
          disabled={disabled}
          className="mt-1.5 min-h-11 w-full border border-primary/25 bg-background px-3 text-sm text-foreground"
        >
          {value.category && !["REGULAR", "VIP", "VVIP"].includes(value.category) && (
            <option value={value.category}>{value.category}</option>
          )}
          <option value="REGULAR">{d("Reguler")}</option>
          <option value="VIP">VIP</option>
          <option value="VVIP">VVIP</option>
        </select>
      </label>
      <details className="border-t border-primary/15 pt-3">
        <summary className="cursor-pointer text-sm font-semibold text-primary">
          {d("Pengaturan tambahan")}
        </summary>
        <div className="mt-4 space-y-4">
          <label className="block min-w-0 text-sm font-medium text-foreground">
            {d("Nama di amplop (opsional)")}
            <Input
              value={value.personalAddressee}
              maxLength={160}
              onChange={(event) => set("personalAddressee", event.target.value)}
              placeholder={d("Contoh: Bapak Andi & Keluarga")}
              disabled={disabled}
              className="mt-1.5"
            />
            <span className="mt-1 block text-xs text-muted-foreground">
              {d("Kosongkan untuk memakai nama tamu di daftar.")}
            </span>
          </label>
          <label className="block min-w-0 text-sm font-medium text-foreground">
            {d("Kelompok tamu (opsional)")}
            <Input
              value={value.groupText}
              onChange={(event) => set("groupText", event.target.value)}
              placeholder={d("Keluarga, sahabat, rekan kerja")}
              disabled={disabled}
              className="mt-1.5"
            />
            <span className="mt-1 block text-xs text-muted-foreground">
              {d("Pisahkan beberapa kelompok dengan koma.")}
            </span>
          </label>
          <label className="block min-w-0 text-sm font-medium text-foreground">
            {d("Pesan khusus (opsional)")}
            <textarea
              value={value.personalGreeting}
              maxLength={280}
              onChange={(event) => set("personalGreeting", event.target.value)}
              placeholder={d("Sapaan atau pesan singkat untuk penerima")}
              disabled={disabled}
              rows={3}
              className="mt-1.5 min-h-24 w-full resize-y border border-primary/25 bg-background px-3 py-2.5 text-sm text-foreground"
            />
          </label>
        </div>
      </details>
    </div>
  );
}
