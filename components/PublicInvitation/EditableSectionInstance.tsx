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
  actions,
  children,
}: {
  instance: InvitationSectionInstance;
  order: number;
  total: number;
  preview: boolean;
  actions?: SectionInstanceEditorActions;
  children: ReactNode;
}) {
  if (instance.hidden && !preview) return null;
  const selected = Boolean(preview && actions?.selectedId === instance.id);

  return (
    <div
      data-section-instance-id={instance.id}
      data-section-instance-key={instance.key}
      data-section-instance-hidden={instance.hidden === true ? "true" : undefined}
      className="dc-section-instance relative"
      style={{ order }}
      onClick={() => actions?.onSelect?.(instance.id, instance.key)}
    >
      <div className={instance.hidden && preview ? "dc-section-instance-hidden" : undefined}>
        {children}
      </div>
      {selected && actions?.onMove && actions.onToggle && actions.onDuplicate && actions.onDelete && (
        <SectionActionRail
          hidden={instance.hidden === true}
          canMoveUp={order > 0}
          canMoveDown={order < total - 1}
          onMoveUp={() => actions.onMove?.(instance.id, -1)}
          onMoveDown={() => actions.onMove?.(instance.id, 1)}
          onToggle={() => actions.onToggle?.(instance.id)}
          onDuplicate={() => actions.onDuplicate?.(instance.id)}
          onDelete={() => actions.onDelete?.(instance.id)}
        />
      )}
    </div>
  );
}
