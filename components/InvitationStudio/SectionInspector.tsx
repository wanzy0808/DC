"use client";

import { RotateCcw } from "lucide-react";
import { invitationSectionItems, type InvitationSectionKey } from "@/lib/templates/sections";
import type { InvitationSectionAlign, InvitationSectionStyle } from "@/lib/templates/section-styles";
import { MAX_RSVP_CUSTOM_FIELDS, type InvitationRsvpConfig } from "@/lib/templates/rsvp-config";

const functionalNotes: Partial<Record<InvitationSectionKey, string[]>> = {
  gallery: ["Media event", "Focus foto"],
  countdown: ["Tanggal acara", "Timer otomatis"],
  location: ["Venue", "Alamat", "Tautan maps"],
  rsvp: ["Nama tamu", "WhatsApp", "Status hadir", "Jumlah pendamping", "Submit RSVP"],
  wishes: ["Nama tamu", "Ucapan", "Kirim ucapan"],
  gift: ["Bank", "Nama rekening", "Nomor rekening", "Salin rekening"],
};

export default function SectionInspector({
  locale,
  sectionKey,
  style,
  rsvpConfig,
  eventCategory,
  onUpdate,
  onReset,
  onRsvpConfig,
  onAddRsvpField,
  onUpdateRsvpField,
  onRemoveRsvpField,
  onClose,
}: {
  locale: string;
  sectionKey: InvitationSectionKey;
  style: InvitationSectionStyle | undefined;
  rsvpConfig: InvitationRsvpConfig;
  eventCategory: string;
  onUpdate: (patch: Partial<InvitationSectionStyle>) => void;
  onReset: () => void;
  onRsvpConfig: (patch: Partial<InvitationRsvpConfig>) => void;
  onAddRsvpField: () => void;
  onUpdateRsvpField: (id: string, patch: { label?: string; required?: boolean }) => void;
  onRemoveRsvpField: (id: string) => void;
  onClose: () => void;
}) {
  const en = locale === "en";
  const title = invitationSectionItems.find((item) => item.key === sectionKey)?.title ?? sectionKey;
  const notes = functionalNotes[sectionKey] ?? [];

  const optionalNumber = (
    label: string,
    value: number | undefined,
    placeholder: string,
    min: number,
    max: number,
    suffix: string,
    key: "paddingY",
  ) => (
    <label className="dc-studio-section-field">
      <span>{label}</span>
      <span className="dc-studio-section-number">
        <input
          type="number"
          min={min}
          max={max}
          step={1}
          value={value ?? ""}
          placeholder={placeholder}
          onChange={(event) => {
            const raw = event.currentTarget.value;
            if (!raw) return onUpdate({ [key]: undefined });
            const next = event.currentTarget.valueAsNumber;
            if (Number.isFinite(next)) onUpdate({ [key]: Math.min(max, Math.max(min, next)) });
          }}
        />
        <small>{suffix}</small>
      </span>
    </label>
  );

  return (
    <aside className="dc-studio-section-side" aria-label={en ? "Section properties" : "Properti section"}>
      <div className="dc-studio-section-side-head">
        <div className="min-w-0">
          <span>{en ? "Section" : "Section"}</span>
          <strong title={title}>{title}</strong>
        </div>
        <button type="button" onClick={onClose} aria-label={en ? "Close section properties" : "Tutup properti section"} title={en ? "Close" : "Tutup"}>×</button>
      </div>

      <label className="dc-studio-section-field">
        <span>{en ? "Alignment" : "Perataan"}</span>
        <select
          value={style?.align ?? ""}
          onChange={(event) => onUpdate({ align: (event.target.value || undefined) as InvitationSectionAlign | undefined })}
        >
          <option value="">{en ? "Template default" : "Default template"}</option>
          <option value="left">{en ? "Left" : "Kiri"}</option>
          <option value="center">{en ? "Center" : "Tengah"}</option>
          <option value="right">{en ? "Right" : "Kanan"}</option>
        </select>
      </label>

      {optionalNumber(en ? "Vertical space" : "Ruang vertikal", style?.paddingY, en ? "Template" : "Template", 0, 160, "px", "paddingY")}

      <label className="dc-studio-section-field">
        <span className="flex items-center justify-between gap-2">
          <span>{en ? "Opacity" : "Opasitas"}</span>
          <output>{Math.round((style?.opacity ?? 1) * 100)}%</output>
        </span>
        <input
          type="range"
          min="0.2"
          max="1"
          step="0.05"
          value={style?.opacity ?? 1}
          onChange={(event) => onUpdate({ opacity: Number(event.target.value) })}
        />
      </label>

      <div className="dc-studio-section-field">
        <span>{en ? "Background" : "Latar"}</span>
        <div className="dc-studio-section-color">
          <input
            type="color"
            value={style?.background ?? "#ffffff"}
            aria-label={en ? "Section background color" : "Warna latar section"}
            onChange={(event) => onUpdate({ background: event.target.value })}
          />
          <button type="button" onClick={() => onUpdate({ background: undefined })}>
            {en ? "Template" : "Default"}
          </button>
        </div>
      </div>

      {sectionKey === "rsvp" && (
        <div className="dc-studio-rsvp-config">
          <div className="dc-studio-rsvp-config-title">
            <span>{en ? "Events" : "Acara RSVP"}</span>
            {eventCategory !== "WEDDING" && <small>{en ? "Event choices are mainly used for weddings." : "Pilihan acara terutama dipakai untuk wedding."}</small>}
          </div>
          <label className="dc-studio-rsvp-switch">
            <span>{en ? "Wedding Ceremony" : "Upacara Nikah"}</span>
            <input type="checkbox" checked={rsvpConfig.ceremony} onChange={(event) => onRsvpConfig({ ceremony: event.target.checked })} />
          </label>
          <label className="dc-studio-rsvp-switch">
            <span>{en ? "Reception" : "Resepsi"}</span>
            <input type="checkbox" checked={rsvpConfig.reception} onChange={(event) => onRsvpConfig({ reception: event.target.checked })} />
          </label>
          <label className="dc-studio-rsvp-switch">
            <span>{en ? "Attend all" : "Hadir Semua Acara"}</span>
            <input
              type="checkbox"
              checked={rsvpConfig.attendAll}
              disabled={!(rsvpConfig.ceremony && rsvpConfig.reception)}
              onChange={(event) => onRsvpConfig({ attendAll: event.target.checked })}
            />
          </label>

          <div className="dc-studio-rsvp-fields">
            <div className="dc-studio-rsvp-fields-head">
              <span>{en ? "Fields" : "Field RSVP"}</span>
              <small>{rsvpConfig.customFields.length}/{MAX_RSVP_CUSTOM_FIELDS}</small>
            </div>
            <div className="dc-studio-rsvp-core-fields">
              <small>{en ? "Name" : "Nama"}</small>
              <small>WhatsApp</small>
              <small>{en ? "Attendance status" : "Status Kehadiran"}</small>
              <small>{en ? "Companions" : "Jumlah Pendamping"}</small>
            </div>
            {rsvpConfig.customFields.map((field) => (
              <div className="dc-studio-rsvp-custom-field" key={field.id}>
                <input
                  type="text"
                  value={field.label}
                  maxLength={60}
                  aria-label={en ? "Custom RSVP field label" : "Label field RSVP tambahan"}
                  onChange={(event) => onUpdateRsvpField(field.id, { label: event.target.value })}
                />
                <label title={en ? "Required field" : "Wajib diisi"}>
                  <input type="checkbox" checked={field.required} onChange={(event) => onUpdateRsvpField(field.id, { required: event.target.checked })} />
                  <span>{en ? "Req" : "Wajib"}</span>
                </label>
                <button type="button" onClick={() => onRemoveRsvpField(field.id)} aria-label={en ? "Remove custom field" : "Hapus field tambahan"} title={en ? "Remove field" : "Hapus field"}>×</button>
              </div>
            ))}
            <button
              type="button"
              className="dc-studio-rsvp-add"
              disabled={rsvpConfig.customFields.length >= MAX_RSVP_CUSTOM_FIELDS}
              onClick={onAddRsvpField}
            >
              + {en ? "Add column" : "Tambah Kolom"}
            </button>
          </div>
        </div>
      )}

      {notes.length > 0 && (
        <div className="dc-studio-section-functions">
          <span>{en ? "Protected function" : "Fungsi terlindungi"}</span>
          <div>
            {notes.map((note) => <small key={note}>{note}</small>)}
          </div>
          <p>{en ? "Visuals can change; data, validation and submit actions stay connected to DC Organizer." : "Visual boleh diubah; data, validasi, dan aksi submit tetap memakai fungsi DC Organizer."}</p>
        </div>
      )}

      <button type="button" className="dc-studio-section-reset" onClick={onReset}>
        <RotateCcw size={14} />
        {en ? "Reset section" : "Reset section"}
      </button>
    </aside>
  );
}
