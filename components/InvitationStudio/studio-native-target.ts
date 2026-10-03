type NativeTargetEnvironment = {
  createResizeObserver: (callback: () => void) => Pick<ResizeObserver, "observe" | "disconnect">;
  createMutationObserver: (callback: () => void) => Pick<MutationObserver, "observe" | "disconnect">;
  windowTarget: Pick<Window, "addEventListener" | "removeEventListener">;
  requestFrame: typeof requestAnimationFrame;
  cancelFrame: typeof cancelAnimationFrame;
};

/** A selected photo/section can mount after selection when its renderer is lazy-loaded. */
export function observeStudioNativeTarget(
  canvas: HTMLElement,
  selector: string,
  onMeasure: () => void,
  environment: NativeTargetEnvironment = {
    createResizeObserver: (callback) => new ResizeObserver(callback),
    createMutationObserver: (callback) => new MutationObserver(callback),
    windowTarget: window,
    requestFrame: (callback) => requestAnimationFrame(callback),
    cancelFrame: (frame) => cancelAnimationFrame(frame),
  },
) {
  let node: Element | null = null;
  let frame: number | null = null;
  let stopped = false;

  const schedule = () => {
    if (stopped || frame !== null) return;
    frame = environment.requestFrame(() => {
      frame = null;
      if (stopped) return;
      const next = canvas.querySelector(selector);
      if (next !== node) {
        resizeObserver.disconnect();
        node = next;
        if (node) resizeObserver.observe(node);
      }
      onMeasure();
    });
  };
  const resizeObserver = environment.createResizeObserver(schedule);
  const mutationObserver = environment.createMutationObserver(schedule);
  mutationObserver.observe(canvas, { childList: true, subtree: true });
  canvas.addEventListener("scroll", schedule, { passive: true });
  environment.windowTarget.addEventListener("resize", schedule);
  schedule();

  return () => {
    stopped = true;
    resizeObserver.disconnect();
    mutationObserver.disconnect();
    canvas.removeEventListener("scroll", schedule);
    environment.windowTarget.removeEventListener("resize", schedule);
    if (frame !== null) environment.cancelFrame(frame);
  };
}
