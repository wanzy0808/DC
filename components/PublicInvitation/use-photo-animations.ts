"use client";

import { useEffect, type RefObject } from "react";
import type { PhotoAssignments, PhotoMotionMap, PhotoSlot } from "@/lib/templates/photo-slots";
import { observeInvitationEntrances } from "@/components/PublicInvitation/entrance-animation-runtime";
import { observePhotoParallax } from "@/components/PublicInvitation/photo-parallax-runtime";
import { MAX_PHOTO_PARALLAX_TARGETS } from "@/lib/templates/motion-performance";

const slots: PhotoSlot[] = ["cover", "personOne", "personTwo", "gallery"];

export function useInvitationPhotoAnimations(
  rootRef: RefObject<HTMLElement | null>,
  assignments: PhotoAssignments,
  revision = "",
) {
  const motionKey = JSON.stringify(assignments.motion ?? {});

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const motion = JSON.parse(motionKey) as PhotoMotionMap;

    const entranceTargets = slots.flatMap((slot) => {
      const config = motion[slot];
      if (!config?.animation || config.animation === "none") return [];
      const nodes = Array.from(root.querySelectorAll<HTMLElement>(
        `[data-invitation-photo-slot="${slot}"]`,
      ));
      const stagger = slot === "gallery" ? (config.animationStagger ?? 0.08) : 0;
      return nodes.map((node, index) => ({
        node,
        animation: config.animation!,
        duration: config.animationDuration,
        delay: (config.animationDelay ?? 0) + index * stagger,
      }));
    });

    const parallaxTargets = slots.flatMap((slot) => {
      const strength = motion[slot]?.parallax ?? 0;
      if (strength <= 0) return [];
      return Array.from(root.querySelectorAll<HTMLElement>(
        `[data-invitation-photo-slot="${slot}"]`,
      )).map((node) => ({ node, strength }));
    }).slice(0, MAX_PHOTO_PARALLAX_TARGETS);

    const stopEntrance = observeInvitationEntrances(entranceTargets);
    const stopParallax = observePhotoParallax(parallaxTargets);
    return () => {
      stopEntrance();
      stopParallax();
    };
  }, [rootRef, motionKey, revision]);
}
