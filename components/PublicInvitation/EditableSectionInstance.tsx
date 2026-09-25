"use client";

import type { ReactNode } from "react";
import SectionActionRail from "@/components/InvitationStudio/SectionActionRail";
import type { InvitationSectionInstance } from "@/lib/templates/section-layout";
import type { InvitationSectionKey } from "@/lib/templates/sections";

export type SectionInstanceEditorActions = {
  selectedId?: string | null;
  onSelect?: (id: string, key: InvitationSectionKey) => void;
  onMove?: (id: string, direction: -1 | 1) => void;
  onToggle?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
};

export default function EditableSectionInstance({
  instance,
  order,
  total,
  preview,
  hidden = false,
  actions,
  children,
}: {
  instance: InvitationSectionInstance;
  order: number;
  total: number;
  preview: boolean;
  hidden?: boolean;
  actions?: SectionInstanceEditorActions;
  children: ReactNode;
}) {
  if (hidden && !preview) return null;
  const selected = Boolean(preview && actions?.selectedId === instance.id);
  const showActions = Boolean(preview && actions?.onMove && actions.onToggle && actions.onDuplicate && actions.onDelete);

  return (
    <div
      data-section-instance-id={instance.id}
      data-section-instance-key={instance.key}
      data-section-instance-hidden={hidden ? "true" : undefined}
      className="dc-section-instance relative"
      data-section-instance-selected={selected ? "true" : undefined}
      style={{ order }}
      onClick={() => actions?.onSelect?.(instance.id, instance.key)}
    >
      <div className={`dc-section-instance-content${hidden && preview ? " dc-section-instance-hidden" : ""}`}>
        {children}
      </div>
      {showActions && (
        <SectionActionRail
          hidden={hidden}
          canMoveUp={order > 0}
          canMoveDown={order < total - 1}
          onMoveUp={() => actions?.onMove?.(instance.id, -1)}
          onMoveDown={() => actions?.onMove?.(instance.id, 1)}
          onToggle={() => actions?.onToggle?.(instance.id)}
          onDuplicate={() => actions?.onDuplicate?.(instance.id)}
          onDelete={() => actions?.onDelete?.(instance.id)}
        />
      )}
    </div>
  );
}
