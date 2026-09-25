"use client";

import { RotateCcw } from "lucide-react";
import { editableCopyMaxLength, type EditableInvitationCopyField } from "@/lib/templates/editable-copy";
import type { EditableCopyMotion } from "@/lib/templates/editable-copy-motion";
import CopyMotionControls from "@/components/InvitationStudio/CopyMotionControls";

const labels: Record<EditableInvitationCopyField, { id: string; en: string }> = {
  greeting: { id: "Salam / Pengantar", en: "Greeting / Introduction" },
  closing: { id: "Ucapan Penutup", en: "Closing Message" },
  ourStory: { id: "Our Story / Tentang Kami", en: "Our Story / About Us" },
  zenQuote: { id: "Kutipan Penutup", en: "Closing Quote" },
  attendanceRequest: { id: "Permohonan Kehadiran", en: "Invitation Message" },
  prayerWish: { id: "Doa / Harapan", en: "Prayer / Wish" },
};

export default function CopyTextInspector({
  locale,
  field,
  value,
  defaultValue,
  motion,
  onChange,
  onMotion,
  onReset,
  onClose,
}: {
  locale: string;
  field: EditableInvitationCopyField;
  value: string;
  defaultValue: string;
  motion: EditableCopyMotion | undefined;
  onChange: (value: string) => void;
  onMotion: (patch: Partial<EditableCopyMotion>) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  const en = locale === "en";
  return (
    <aside className="dc-studio-section-side" aria-label={en ? "Text properties" : "Properti teks"}>
      <div className="dc-studio-section-side-head">
        <div className="min-w-0">
          <span>{en ? "Text" : "Teks"}</span>
          <strong title={en ? labels[field].en : labels[field].id}>{en ? labels[field].en : labels[field].id}</strong>
        </div>
        <button type="button" onClick={onClose} aria-label={en ? "Close text properties" : "Tutup properti teks"} title={en ? "Close" : "Tutup"}>×</button>
      </div>

      <label className="dc-studio-section-field">
        <span>{en ? "Content" : "Isi"}</span>
        <textarea
          value={value}
          rows={field === "ourStory" ? 8 : 5}
          maxLength={editableCopyMaxLength[field]}
          placeholder={defaultValue}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-28 w-full resize-y rounded-[var(--dc-control-radius)] border border-primary/35 bg-background px-3 py-2.5 text-sm leading-6 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
      </label>

      <CopyMotionControls locale={locale} field={field} motion={motion} onUpdate={onMotion} />

      <button type="button" className="dc-studio-section-reset" onClick={onReset}>
        <RotateCcw size={14} />
        Reset
      </button>
    </aside>
  );
}
