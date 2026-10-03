type PanPointer = { pointerId: number; clientX: number; clientY: number };
type PanViewport = Pick<HTMLDivElement,
  "scrollLeft" | "scrollTop" | "setPointerCapture" | "hasPointerCapture" | "releasePointerCapture"
>;
type PanSession = PanPointer & {
  node: PanViewport;
  scrollLeft: number;
  scrollTop: number;
  moved: boolean;
};

export function createStudioCanvasPan(onPanningChange: (panning: boolean) => void) {
  let pan: PanSession | null = null;
  let suppressClick = false;

  function stop() {
    const current = pan;
    if (!current) return;
    pan = null;
    onPanningChange(false);
    if (current.node.hasPointerCapture(current.pointerId)) {
      current.node.releasePointerCapture(current.pointerId);
    }
  }

  return {
    begin(pointer: PanPointer, node: PanViewport) {
      if (pan) return false;
      suppressClick = false;
      node.setPointerCapture(pointer.pointerId);
      pan = {
        pointerId: pointer.pointerId, clientX: pointer.clientX, clientY: pointer.clientY,
        node, scrollLeft: node.scrollLeft, scrollTop: node.scrollTop, moved: false,
      };
      onPanningChange(true);
      return true;
    },
    move(pointer: PanPointer) {
      if (!pan || pan.pointerId !== pointer.pointerId) return;
      const dx = pointer.clientX - pan.clientX;
      const dy = pointer.clientY - pan.clientY;
      if (Math.hypot(dx, dy) > 3) pan.moved = true;
      pan.node.scrollLeft = pan.scrollLeft - dx;
      pan.node.scrollTop = pan.scrollTop - dy;
    },
    end(pointerId: number) {
      if (!pan || pan.pointerId !== pointerId) return;
      suppressClick = pan.moved;
      stop();
    },
    cancel(pointerId?: number) {
      if (!pan || (pointerId !== undefined && pan.pointerId !== pointerId)) return;
      suppressClick = false;
      stop();
    },
    clearSuppressedClick() { suppressClick = false; },
    consumeSuppressedClick() {
      const suppressed = suppressClick;
      suppressClick = false;
      return suppressed;
    },
  };
}

export function bindStudioCanvasPanLifecycle(
  pan: ReturnType<typeof createStudioCanvasPan>,
  setPanReady: (ready: boolean) => void,
  windowTarget: Window,
  documentTarget: Document,
) {
  const releaseSpace = (event: KeyboardEvent) => {
    if (event.code === "Space") setPanReady(false);
  };
  const cancel = () => {
    setPanReady(false);
    pan.cancel();
  };
  const visibility = () => { if (documentTarget.hidden) cancel(); };

  // Keyup can land outside the canvas after focus moves while Space is held.
  windowTarget.addEventListener("keyup", releaseSpace);
  windowTarget.addEventListener("blur", cancel);
  documentTarget.addEventListener("visibilitychange", visibility);
  return () => {
    windowTarget.removeEventListener("keyup", releaseSpace);
    windowTarget.removeEventListener("blur", cancel);
    documentTarget.removeEventListener("visibilitychange", visibility);
    pan.cancel();
  };
}
