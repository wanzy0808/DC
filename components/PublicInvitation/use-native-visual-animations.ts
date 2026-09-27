"use client";

import { useEffect, type RefObject } from "react";
import {
  nativeVisualSelector,
  nativeVisualSupportsAnimation,
  parseNativeVisualTransforms,
} from "@/lib/templates/native-visual-transforms";
import { observeInvitationEntrances } from "@/components/PublicInvitation/entrance-animation-runtime";

export function useInvitationNativeVisualAnimations(
  rootRef: RefObject<HTMLElement | null>,
  designKey: string,
  revision = "",
) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const targets = Object.entries(parseNativeVisualTransforms(designKey)).flatMap(([key, config]) => {
      if (!nativeVisualSupportsAnimation(key) || !config.animation || config.animation === "none") return [];
      const selector = nativeVisualSelector(key);
      if (!selector) return [];
      const node = root.querySelector<HTMLElement>(selector);
      if (!node) return [];
      return [{
        node,
        animation: config.animation,
        duration: config.animationDuration,
        delay: config.animationDelay,
        finalOpacity: config.opacity,
      }];
    });

    return observeInvitationEntrances(targets);
  }, [rootRef, designKey, revision]);
}
