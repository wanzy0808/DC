"use client";

import { RotateCcw } from "lucide-react";
import type { EditableInvitationCopyField } from "@/lib/templates/editable-copy";
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
  motion,
  onMotion,
  onReset,
  onClose,
}: {
  locale: string;
  field: EditableInvitationCopyField;
  motion: EditableCopyMotion | undefined;
  onMotion: (patch: Partial<EditableCopyMotion>) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  const en = locale === "en";
  return (
    <aside className="undara-studio-section-side" aria-label={en ? "Text properties" : "Properti teks"}>
      <div className="undara-studio-section-side-head">
        <div className="min-w-0">
          <strong title={en ? labels[field].en : labels[field].id}>{en ? labels[field].en : labels[field].id}</strong>
        </div>
        <button type="button" onClick={onClose} aria-label={en ? "Close text properties" : "Tutup properti teks"} title={en ? "Close" : "Tutup"}>×</button>
      </div>

      <p className="text-xs leading-5 text-muted-foreground">{en ? "Edit wording in Content." : "Ubah teks lewat Isi."}</p>

      <CopyMotionControls locale={locale} field={field} motion={motion} onUpdate={onMotion} />

      <button type="button" className="undara-studio-section-reset" onClick={onReset}>
        <RotateCcw size={14} />
        Reset
      </button>
    </aside>
  );
}
