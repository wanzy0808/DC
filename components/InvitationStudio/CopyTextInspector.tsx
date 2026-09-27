"use client";

import { Lock, RotateCcw } from "lucide-react";
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
    <aside className="dc-studio-section-side" aria-label={en ? "Text properties" : "Properti teks"}>
      <div className="dc-studio-section-side-head">
        <div className="min-w-0">
          <span>{en ? "Text" : "Teks"}</span>
          <strong title={en ? labels[field].en : labels[field].id}>{en ? labels[field].en : labels[field].id}</strong>
        </div>
        <button type="button" onClick={onClose} aria-label={en ? "Close text properties" : "Tutup properti teks"} title={en ? "Close" : "Tutup"}>×</button>
      </div>

      <div className="flex items-start gap-2 rounded-[var(--dc-control-radius)] border border-primary/20 bg-primary/[.04] px-3 py-2 text-[10px] leading-4 text-muted-foreground">
        <Lock size={13} className="mt-0.5 shrink-0 text-primary" />
        <span>{en ? "Edit the wording from Content on the left. This panel controls visual motion only." : "Ubah isi teks dari menu Isi di kiri. Panel ini hanya mengatur visual dan animasi."}</span>
      </div>

      <CopyMotionControls locale={locale} field={field} motion={motion} onUpdate={onMotion} />

      <button type="button" className="dc-studio-section-reset" onClick={onReset}>
        <RotateCcw size={14} />
        Reset
      </button>
    </aside>
  );
}
