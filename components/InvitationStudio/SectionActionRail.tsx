"use client";

import { ChevronDown, ChevronUp, Copy, Eye, EyeOff, Trash2 } from "lucide-react";

export default function SectionActionRail({
  hidden,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onToggle,
  onDuplicate,
  onDelete,
}: {
  hidden: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggle: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const actions = [
    { label: "Geser section ke atas", icon: ChevronUp, onClick: onMoveUp, disabled: !canMoveUp },
    { label: "Geser section ke bawah", icon: ChevronDown, onClick: onMoveDown, disabled: !canMoveDown },
    { label: hidden ? "Tampilkan section" : "Sembunyikan section", icon: hidden ? EyeOff : Eye, onClick: onToggle, disabled: false },
    { label: "Duplikat section", icon: Copy, onClick: onDuplicate, disabled: false },
    { label: "Hapus section", icon: Trash2, onClick: onDelete, disabled: false },
  ];

  return (
    <div className="dc-studio-section-actions" role="toolbar" aria-label="Aksi section" onClick={(event) => event.stopPropagation()}>
      {actions.map(({ label, icon: Icon, onClick, disabled }) => (
        <button key={label} type="button" onClick={onClick} disabled={disabled} aria-label={label} title={label}>
          <Icon size={15} />
        </button>
      ))}
    </div>
  );
}
