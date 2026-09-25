"use client";

import { useEffect, type RefObject } from "react";
import type { InvitationAssetLayer } from "@/lib/templates/asset-layers";
import { getSectionAnimationPreset, sectionAnimationKeyframes } from "@/lib/templates/section-animations";

export function useInvitationLayerAnimation(
  motionRef: RefObject<HTMLElement | null>,
  layer: Pick<InvitationAssetLayer, "animation" | "animationDuration" | "animationDelay">,
) {
  useEffect(() => {
    const node = motionRef.current;
    if (!node || typeof window === "undefined") return;
    if (!layer.animation || layer.animation === "none") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const preset = getSectionAnimationPreset(layer.animation);
    const frames = sectionAnimationKeyframes(layer.animation);
    if (!preset || !frames) return;

    let animation: Animation | null = null;
    const play = () => {
      animation?.cancel();
      animation = node.animate(frames, {
        duration: Math.round((layer.animationDuration ?? preset.duration) * 1000),
        delay: Math.round((layer.animationDelay ?? 0) * 1000),
        easing: preset.easing,
        fill: "both",
      });
    };

    if (!("IntersectionObserver" in window)) {
      play();
      return () => animation?.cancel();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === node && entry.isIntersecting && entry.intersectionRatio >= 0.14) {
            play();
            observer.unobserve(node);
            break;
          }
        }
      },
      { threshold: [0.14] },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      animation?.cancel();
    };
  }, [motionRef, layer.animation, layer.animationDuration, layer.animationDelay]);
}
