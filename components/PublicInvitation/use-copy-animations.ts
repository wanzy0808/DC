"use client";

import { useEffect, type RefObject } from "react";
import {
  editableInvitationCopyFields,
  type EditableInvitationCopy,
} from "@/lib/templates/editable-copy";
import type {
  EditableCopyMotionUnit,
  EditableCopyMotions,
} from "@/lib/templates/editable-copy-motion";
import { observeInvitationEntrances } from "@/components/PublicInvitation/entrance-animation-runtime";

const defaultStagger = (unit: EditableCopyMotionUnit | undefined) =>
  unit === "character" ? 0.025 : unit === "line" ? 0.1 : 0.06;

export function useInvitationCopyAnimations(
  rootRef: RefObject<HTMLElement | null>,
  motions: EditableCopyMotions,
  copy: EditableInvitationCopy,
  revision = "",
) {
  const motionKey = JSON.stringify(motions);
  const copyKey = JSON.stringify(copy);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const parsed = JSON.parse(motionKey) as EditableCopyMotions;

    const targets = editableInvitationCopyFields.flatMap((field) => {
      const config = parsed[field];
      if (!config?.animation || config.animation === "none") return [];

      const nodes = Array.from(
        root.querySelectorAll<HTMLElement>(
          `[data-studio-copy-field="${field}"]`,
        ),
      );

      return nodes.flatMap((node) => {
        const parts = config.unit
          ? Array.from(
              node.querySelectorAll<HTMLElement>(
                "[data-invitation-text-motion-part]",
              ),
            )
          : [];
        const targets = parts.length ? parts : [node];
        const stagger = parts.length
          ? (config.stagger ?? defaultStagger(config.unit))
          : 0;

        return targets.map((target, index) => ({
          node: target,
          animation: config.animation!,
          duration: config.animationDuration,
          delay: (config.animationDelay ?? 0) + index * stagger,
        }));
      });
    });

    return observeInvitationEntrances(targets);
  }, [rootRef, motionKey, copyKey, revision]);
}
