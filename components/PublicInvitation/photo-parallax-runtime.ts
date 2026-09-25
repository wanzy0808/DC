export type PhotoParallaxTarget = {
  node: HTMLElement;
  strength: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function observePhotoParallax(targets: PhotoParallaxTarget[]) {
  if (!targets.length || typeof window === "undefined") return () => {};
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  const scroller = targets[0]?.node.closest<HTMLElement>(".dc-studio-canvas-scroll") ?? null;
  const initial = new Map(targets.map(({ node }) => [node, node.style.translate]));
  let frame = 0;

  const update = () => {
    frame = 0;
    const scrollerRect = scroller?.getBoundingClientRect();
    const viewportTop = scrollerRect?.top ?? 0;
    const viewportHeight = Math.max(1, scroller?.clientHeight ?? window.innerHeight);

    for (const { node, strength } of targets) {
      const rect = node.getBoundingClientRect();
      if (!rect.width || !rect.height) continue;
      const center = rect.top + rect.height / 2 - viewportTop;
      const normalized = clamp((center / viewportHeight - 0.5) * 2, -1, 1);
      const offset = Math.round(-normalized * strength * 10) / 10;
      node.style.translate = `0 ${offset}px`;
    }
  };

  const requestUpdate = () => {
    if (!frame) frame = window.requestAnimationFrame(update);
  };

  window.addEventListener("scroll", requestUpdate, { passive: true, capture: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
  scroller?.addEventListener("scroll", requestUpdate, { passive: true });
  requestUpdate();

  return () => {
    if (frame) window.cancelAnimationFrame(frame);
    window.removeEventListener("scroll", requestUpdate, true);
    window.removeEventListener("resize", requestUpdate);
    scroller?.removeEventListener("scroll", requestUpdate);
    for (const [node, translate] of initial) node.style.translate = translate;
  };
}
