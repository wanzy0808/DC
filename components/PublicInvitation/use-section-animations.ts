"use client";

import { useEffect, type RefObject } from "react";
import type { InvitationSectionKey } from "@/lib/templates/sections";
import type {
  InvitationSectionAnimation,
  InvitationSectionStyles,
} from "@/lib/templates/section-styles";

function keyframesFor(animation: InvitationSectionAnimation): Keyframe[] | null {
  switch (animation) {
    case "fade":
      return [{ opacity: 0 }, { opacity: 1 }];
    case "rise":
      return [{ opacity: 0, transform: "translateY(28px)" }, { opacity: 1, transform: "translateY(0)" }];
    case "slide-left":
      return [{ opacity: 0, transform: "translateX(-32px)" }, { opacity: 1, transform: "translateX(0)" }];
    case "slide-right":
      return [{ opacity: 0, transform: "translateX(32px)" }, { opacity: 1, transform: "translateX(0)" }];
    case "zoom":
      return [{ opacity: 0, transform: "scale(.96)" }, { opacity: 1, transform: "scale(1)" }];
    case "none":
      return null;
  }
}

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
      const frames = keyframesFor(config.animation);
      if (!frames) return;

      played.add(node);
      const animation = node.animate(frames, {
        duration: Math.round((config.animationDuration ?? 0.7) * 1000),
        delay: Math.round((config.animationDelay ?? 0) * 1000),
        easing: "cubic-bezier(.2,.7,.2,1)",
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
