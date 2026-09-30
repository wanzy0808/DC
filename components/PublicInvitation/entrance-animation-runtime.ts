import {
  getSectionAnimationPreset,
  sectionAnimationKeyframes,
  type InvitationSectionAnimation,
} from "@/lib/templates/section-animations";

export type InvitationEntranceTarget = {
  node: HTMLElement;
  animation: InvitationSectionAnimation;
  duration?: number;
  delay?: number;
  /** Preserve a persisted object opacity when an entrance preset animates opacity. */
  finalOpacity?: number;
};

export type EntrancePlaybackOptions = {
  replay?: boolean;
  preservePresentation?: boolean;
  /** Start photo entrances after lazy images arrive, while their frame is visible. */
  waitForImages?: boolean;
};

export function observeInvitationEntrances(
  targets: InvitationEntranceTarget[],
  threshold = 0.14,
  options: EntrancePlaybackOptions = {},
) {
  if (!targets.length || typeof window === "undefined") return () => {};
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  const configs = new Map(targets.map((target) => [target.node, target]));
  const played = new WeakSet<HTMLElement>();
  const animations = new Set<Animation>();
  const active = new Map<HTMLElement, Animation>();
  const loading = new Map<HTMLElement, () => void>();

  const play = (node: HTMLElement) => {
    if (played.has(node) || loading.has(node) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const config = configs.get(node);
    if (!config || config.animation === "none") return;

    if (options.waitForImages) {
      const images = Array.from(node.querySelectorAll<HTMLImageElement>("img")).filter((image) => !image.complete);
      if (images.length) {
        const remaining = new Set(images);
        const detach: Array<() => void> = [];
        const release = () => { detach.forEach((remove) => remove()); loading.delete(node); };
        loading.set(node, release);
        images.forEach((image) => {
          const settled = () => {
            remaining.delete(image);
            if (!remaining.size) { release(); play(node); }
          };
          image.addEventListener("load", settled, { once: true });
          image.addEventListener("error", settled, { once: true });
          detach.push(() => {
            image.removeEventListener("load", settled);
            image.removeEventListener("error", settled);
          });
        });
        return;
      }
    }

    const previous = active.get(node);
    previous?.cancel();
    if (previous) animations.delete(previous);
    const preset = getSectionAnimationPreset(config.animation);
    const baseFrames = sectionAnimationKeyframes(config.animation);
    if (!preset || !baseFrames) return;
    const finalOpacity = config.finalOpacity;
    let frames = finalOpacity === undefined ? baseFrames : baseFrames.map((frame) =>
      typeof frame.opacity === "number"
        ? { ...frame, opacity: frame.opacity * finalOpacity }
        : frame,
    );

    if (options.preservePresentation) {
      const presentation = window.getComputedStyle(node);
      const base = presentation.transform === "none" ? "" : presentation.transform;
      const opacity = Number(presentation.opacity);
      frames = frames.map((frame) => ({
        ...frame,
        ...(typeof frame.transform === "string" ? { transform: `${base} ${frame.transform}`.trim() } : {}),
        ...(finalOpacity === undefined && typeof frame.opacity === "number" ? { opacity: frame.opacity * opacity } : {}),
      }));
    }
    played.add(node);
    const animation = node.animate(frames, {
      duration: Math.round((config.duration ?? preset.duration) * 1000),
      delay: Math.round((config.delay ?? 0) * 1000),
      easing: preset.easing,
      fill: "both",
    });
    // Legacy callers retain the final fill. Theme motion restores authored CSS
    // on completion, including customer transforms and photo hover treatments.
    animations.add(animation);
    active.set(node, animation);
    if (options.preservePresentation) {
      void animation.finished.then(() => {
        animation.cancel();
        animations.delete(animation);
        if (active.get(node) === animation) active.delete(node);
      }, () => {});
    }
  };

  if (!("IntersectionObserver" in window)) {
    targets.forEach(({ node }) => play(node));
    return () => {
      loading.forEach((release) => release());
      animations.forEach((animation) => animation.cancel());
    };
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
          const node = entry.target as HTMLElement;
          play(node);
          if (!options.replay) observer.unobserve(node);
        } else if (!entry.isIntersecting && options.replay) {
          const node = entry.target as HTMLElement;
          loading.get(node)?.();
          played.delete(node);
          const previous = active.get(node);
          previous?.cancel();
          if (previous) animations.delete(previous);
          active.delete(node);
        }
      }
    },
    { threshold: [0, threshold] },
  );

  const replay = (event: Event) => {
    const node = event.currentTarget as HTMLElement;
    loading.get(node)?.();
    played.delete(node);
    play(node);
  };
  targets.forEach(({ node }) => {
    observer.observe(node);
    node.addEventListener("invitation-replay-motion", replay);
  });
  return () => {
    observer.disconnect();
    loading.forEach((release) => release());
    targets.forEach(({ node }) => node.removeEventListener("invitation-replay-motion", replay));
    animations.forEach((animation) => animation.cancel());
  };
}

/** Register lazy-mounted scene/gallery nodes without restarting already registered content. */
export function observeInvitationEntranceRoot(
  root: HTMLElement,
  resolve: () => InvitationEntranceTarget[],
  options: EntrancePlaybackOptions = {},
) {
  if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};
  const registered = new Set<HTMLElement>();
  const stops: Array<() => void> = [];
  const scan = () => {
    const added = resolve().filter(({ node }) => root.contains(node) && !registered.has(node));
    if (!added.length) return;
    added.forEach(({ node }) => registered.add(node));
    stops.push(observeInvitationEntrances(added, .14, options));
  };
  scan();
  const observer = typeof MutationObserver === "undefined" ? null : new MutationObserver((records) => {
    if (records.some((record) => [...record.addedNodes, ...record.removedNodes].some((node) => node.nodeType === 1))) scan();
  });
  observer?.observe(root, { childList: true, subtree: true });
  return () => { observer?.disconnect(); stops.forEach((stop) => stop()); registered.clear(); };
}
