"use client";

import { useEffect, type RefObject } from "react";
import {
  nativeVisualSelector,
  nativeVisualSupportsAnimation,
  parseNativeVisualTransforms,
} from "@/lib/templates/native-visual-transforms";
import { defaultNativeVisualTransform } from "@/lib/templates/native-visual-transforms";
import { templateHasDefaultMotion, templateNativeMotion, templateNativeMotionForKey } from "@/lib/templates/template-motion";
import type { InvitationSectionStyles } from "@/lib/templates/section-styles";
import { observeInvitationEntranceRoot, type InvitationEntranceTarget } from "@/components/PublicInvitation/entrance-animation-runtime";

export function useInvitationNativeVisualAnimations(
  rootRef: RefObject<HTMLElement | null>,
  designKey: string,
  revision = "",
  theme?: { template: string; sectionStyles: InvitationSectionStyles },
) {
  const template = theme?.template ?? "";
  const stylesKey = JSON.stringify(theme?.sectionStyles ?? {});

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const overrides = parseNativeVisualTransforms(designKey);
    const styles = JSON.parse(stylesKey) as InvitationSectionStyles;
    const defaults = templateNativeMotion(template);
    const configs = {
      ...Object.fromEntries(Object.entries(defaults).map(([key, motion]) =>
        [key, { ...defaultNativeVisualTransform, ...motion }],
      )),
      ...Object.fromEntries(Object.entries(overrides).map(([key, config]) =>
        [key, { ...templateNativeMotionForKey(template, key), ...config }],
      )),
    };
    const collect = () => {
      const targets = new Map<HTMLElement, InvitationEntranceTarget>();
      for (const [key, config] of Object.entries(configs)) {
        if (!nativeVisualSupportsAnimation(key)) continue;
        const selector = nativeVisualSelector(key);
        if (!selector) continue;
        const authored = overrides[key]?.animation !== undefined;
        const section = key.split(":")[1] as keyof InvitationSectionStyles;
        const sectionMotion = styles[section];
        if (!authored && (sectionMotion?.animation !== undefined || sectionMotion?.timeline)) continue;
        root.querySelectorAll<HTMLElement>(selector).forEach((node) => {
          if (!config.animation || config.animation === "none") { targets.delete(node); return; }
          targets.set(node, {
            node,
            animation: config.animation,
            duration: config.animationDuration,
            delay: config.animationDelay,
            finalOpacity: config.opacity,
          });
        });
      }
      return Array.from(targets.values());
    };
    const themed = templateHasDefaultMotion(template);
    // Theme entrances are one-shot while scrolling. Studio replay remains available through the explicit replay event.
    const replay = false;
    return observeInvitationEntranceRoot(root, collect, {
      replay,
      preservePresentation: themed,
      waitForImages: template === "zen-atelier" || template === "pencil-reverie" || template === "botanical-ivory" || template === "eternal-blossom" || template === "modern-maroon" || template === "garden-light" || template === "midnight-romance" || template === "classic-pearl" || template === "golden-art-deco" || template === "celestial-ink" || template === "velvet-horizon" || template === "paper-cut-botanical",
    });
  }, [rootRef, designKey, revision, template, stylesKey]);
}
