type PanPointer = { pointerId: number; clientX: number; clientY: number };
type PanViewport = Pick<HTMLDivElement,
  "scrollLeft" | "scrollTop" | "setPointerCapture" | "hasPointerCapture" | "releasePointerCapture"
>;
type PanSession = PanPointer & {
  node: PanViewport;
  scrollLeft: number;
  scrollTop: number;
  moved: boolean;
  active: boolean;
};

export function createStudioCanvasPan(onPanningChange: (panning: boolean) => void) {
  let pan: PanSession | null = null;
  let suppressClick = false;

  function stop() {
    const current = pan;
    if (!current) return;
    pan = null;
    if (current.active) onPanningChange(false);
    if (current.node.hasPointerCapture(current.pointerId)) {
      current.node.releasePointerCapture(current.pointerId);
    }
  }

  return {
    begin(pointer: PanPointer, node: PanViewport, captureImmediately = true) {
      if (pan) return false;
      suppressClick = false;
      pan = {
        pointerId: pointer.pointerId, clientX: pointer.clientX, clientY: pointer.clientY,
        node, scrollLeft: node.scrollLeft, scrollTop: node.scrollTop, moved: false, active: captureImmediately,
      };
      if (captureImmediately) {
        node.setPointerCapture(pointer.pointerId);
        onPanningChange(true);
      }
      return true;
    },
    move(pointer: PanPointer) {
      if (!pan || pan.pointerId !== pointer.pointerId) return false;
      const dx = pointer.clientX - pan.clientX;
      const dy = pointer.clientY - pan.clientY;
      if (!pan.moved && Math.hypot(dx, dy) <= 3) return false;
      pan.moved = true;
      if (!pan.active) {
        // Capturing a tap would retarget its click to the canvas instead of the section background.
        pan.node.setPointerCapture(pointer.pointerId);
        pan.active = true;
        onPanningChange(true);
      }
      pan.node.scrollLeft = pan.scrollLeft - dx;
      pan.node.scrollTop = pan.scrollTop - dy;
      return true;
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
  // A tap can end outside the canvas before a deferred pan captures the pointer.
  const endPointer = (event: PointerEvent) => pan.end(event.pointerId);
  const cancelPointer = (event: PointerEvent) => pan.cancel(event.pointerId);

  // Keyup can land outside the canvas after focus moves while Space is held.
  windowTarget.addEventListener("keyup", releaseSpace);
  windowTarget.addEventListener("blur", cancel);
  windowTarget.addEventListener("pointerup", endPointer);
  windowTarget.addEventListener("pointercancel", cancelPointer);
  documentTarget.addEventListener("visibilitychange", visibility);
  return () => {
    windowTarget.removeEventListener("keyup", releaseSpace);
    windowTarget.removeEventListener("blur", cancel);
    windowTarget.removeEventListener("pointerup", endPointer);
    windowTarget.removeEventListener("pointercancel", cancelPointer);
    documentTarget.removeEventListener("visibilitychange", visibility);
    pan.cancel();
  };
}
