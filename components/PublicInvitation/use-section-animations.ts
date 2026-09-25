"use client";

import { useEffect, type RefObject } from "react";
import type { InvitationSectionKey } from "@/lib/templates/sections";
import type { InvitationSectionStyles } from "@/lib/templates/section-styles";
import { getSectionAnimationPreset, sectionAnimationKeyframes } from "@/lib/templates/section-animations";

export function useInvitationSectionAnimations(
  rootRef: RefObject<HTMLElement | null>,
  styles: InvitationSectionStyles,
) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const nodes = Array.from(root.querySelectorAll<HTMLElement>("[data-invitation-section]"));
    const animatedNodes = nodes.filter((node) => {
      const key = node.dataset.invitationSection as InvitationSectionKey | undefined;
      return Boolean(key && styles[key]?.animation && styles[key]?.animation !== "none");
    });
    if (!animatedNodes.length) return;

    const played = new WeakSet<HTMLElement>();
    const animations = new Set<Animation>();

    const play = (node: HTMLElement) => {
      if (played.has(node)) return;
      const key = node.dataset.invitationSection as InvitationSectionKey | undefined;
      if (!key) return;
      const config = styles[key];
      if (!config?.animation || config.animation === "none") return;
      const preset = getSectionAnimationPreset(config.animation);
      const frames = sectionAnimationKeyframes(config.animation);
      if (!preset || !frames) return;

      played.add(node);
      const animation = node.animate(frames, {
        duration: Math.round((config.animationDuration ?? preset.duration) * 1000),
        delay: Math.round((config.animationDelay ?? 0) * 1000),
        easing: preset.easing,
        fill: "both",
      });
      animations.add(animation);
      animation.addEventListener("finish", () => animations.delete(animation), { once: true });
      animation.addEventListener("cancel", () => animations.delete(animation), { once: true });
    };

    if (!("IntersectionObserver" in window)) {
      animatedNodes.forEach(play);
      return () => animations.forEach((animation) => animation.cancel());
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.14) {
            play(entry.target as HTMLElement);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: [0.14] },
    );

    animatedNodes.forEach((node) => observer.observe(node));
    return () => {
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
    };
  }, [rootRef, styles]);
}
