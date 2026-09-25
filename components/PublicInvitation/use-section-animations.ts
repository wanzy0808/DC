"use client";

import { useEffect, type RefObject } from "react";
import type { InvitationSectionKey } from "@/lib/templates/sections";
import type { InvitationSectionStyles } from "@/lib/templates/section-styles";
import { observeInvitationEntrances } from "@/components/PublicInvitation/entrance-animation-runtime";

export function useInvitationSectionAnimations(
  rootRef: RefObject<HTMLElement | null>,
  styles: InvitationSectionStyles,
) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-invitation-section]")).flatMap((node) => {
      const key = node.dataset.invitationSection as InvitationSectionKey | undefined;
      const config = key ? styles[key] : undefined;
      if (config?.timeline || !config?.animation || config.animation === "none") return [];
      return [{
        node,
        animation: config.animation,
        duration: config.animationDuration,
        delay: config.animationDelay,
      }];
    });

    return observeInvitationEntrances(targets);
  }, [rootRef, styles]);
}
