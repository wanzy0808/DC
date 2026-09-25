"use client";

import { useEffect, type RefObject } from "react";
import type { InvitationAssetLayer } from "@/lib/templates/asset-layers";
import { observeInvitationEntrances } from "@/components/PublicInvitation/entrance-animation-runtime";

const defaultStagger = (unit: InvitationAssetLayer["textAnimationUnit"]) =>
  unit === "character" ? 0.025 : unit === "line" ? 0.1 : 0.06;

export function useInvitationLayerAnimation(
  motionRef: RefObject<HTMLElement | null>,
  layer: Pick<
    InvitationAssetLayer,
    "kind" | "text" | "animation" | "animationDuration" | "animationDelay" | "textAnimationUnit" | "animationStagger"
  >,
) {
  useEffect(() => {
    const node = motionRef.current;
    if (!node || !layer.animation || layer.animation === "none") return;

    const base = {
      animation: layer.animation,
      duration: layer.animationDuration,
    } as const;

    const parts = layer.kind === "text" && layer.textAnimationUnit
      ? Array.from(node.querySelectorAll<HTMLElement>("[data-invitation-text-motion-part]"))
      : [];

    if (parts.length) {
      const stagger = layer.animationStagger ?? defaultStagger(layer.textAnimationUnit);
      return observeInvitationEntrances(parts.map((part, index) => ({
        node: part,
        ...base,
        delay: (layer.animationDelay ?? 0) + index * stagger,
      })));
    }

    return observeInvitationEntrances([{
      node,
      ...base,
      delay: layer.animationDelay,
    }]);
  }, [
    motionRef,
    layer.kind,
    layer.text,
    layer.animation,
    layer.animationDuration,
    layer.animationDelay,
    layer.textAnimationUnit,
    layer.animationStagger,
  ]);
}
