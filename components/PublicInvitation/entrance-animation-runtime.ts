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
};

export function observeInvitationEntrances(
  targets: InvitationEntranceTarget[],
  threshold = 0.14,
) {
  if (!targets.length || typeof window === "undefined") return () => {};
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  const configs = new Map(targets.map((target) => [target.node, target]));
  const played = new WeakSet<HTMLElement>();
  const animations = new Set<Animation>();

  const play = (node: HTMLElement) => {
    if (played.has(node)) return;
    const config = configs.get(node);
    if (!config || config.animation === "none") return;

    const preset = getSectionAnimationPreset(config.animation);
    const frames = sectionAnimationKeyframes(config.animation);
    if (!preset || !frames) return;

    played.add(node);
    const animation = node.animate(frames, {
      duration: Math.round((config.duration ?? preset.duration) * 1000),
      delay: Math.round((config.delay ?? 0) * 1000),
      easing: preset.easing,
      fill: "both",
    });
    animations.add(animation);
    const clear = () => animations.delete(animation);
    animation.addEventListener("finish", clear, { once: true });
    animation.addEventListener("cancel", clear, { once: true });
  };

  if (!("IntersectionObserver" in window)) {
    targets.forEach(({ node }) => play(node));
    return () => animations.forEach((animation) => animation.cancel());
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
          const node = entry.target as HTMLElement;
          play(node);
          observer.unobserve(node);
        }
      }
    },
    { threshold: [threshold] },
  );

  targets.forEach(({ node }) => observer.observe(node));
  return () => {
    observer.disconnect();
    animations.forEach((animation) => animation.cancel());
  };
}
