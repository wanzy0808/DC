"use client";

import { useEffect, type RefObject } from "react";
import type { InvitationSectionKey } from "@/lib/templates/sections";
import type { InvitationSectionStyles } from "@/lib/templates/section-styles";
import { observeInvitationEntranceRoot } from "@/components/PublicInvitation/entrance-animation-runtime";

export function useInvitationSectionAnimations(
  rootRef: RefObject<HTMLElement | null>,
  styles: InvitationSectionStyles,
) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const collect = () => Array.from(root.querySelectorAll<HTMLElement>("[data-invitation-section]")).flatMap((node) => {
      const key = node.dataset.invitationSection as InvitationSectionKey | undefined;
      const config = key ? styles[key] : undefined;
      if (config?.timeline || config?.animation === "none") return [];
      const animation = config?.animation ?? (key === "footer" ? "fade" : undefined);
      if (!animation) return [];
      return [{
        node,
        animation,
        duration: config?.animationDuration ?? (key === "footer" ? .58 : undefined),
        delay: config?.animationDelay,
      }];
    });

    return observeInvitationEntranceRoot(root, collect, { preservePresentation: true });
  }, [rootRef, styles]);
}
