"use client";

import { useEffect, type RefObject } from "react";
import type { InvitationAssetLayer } from "@/lib/templates/asset-layers";
import { observeInvitationEntrances } from "@/components/PublicInvitation/entrance-animation-runtime";

export function useInvitationLayerAnimation(
  motionRef: RefObject<HTMLElement | null>,
  layer: Pick<InvitationAssetLayer, "animation" | "animationDuration" | "animationDelay">,
) {
  useEffect(() => {
    const node = motionRef.current;
    if (!node || !layer.animation || layer.animation === "none") return;

    return observeInvitationEntrances([{
      node,
      animation: layer.animation,
      duration: layer.animationDuration,
      delay: layer.animationDelay,
    }]);
  }, [motionRef, layer.animation, layer.animationDuration, layer.animationDelay]);
}
