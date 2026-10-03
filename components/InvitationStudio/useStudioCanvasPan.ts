"use client";

import {
  useEffect,
  useState,
  type Dispatch,
  type PointerEvent as ReactPointerEvent,
  type SetStateAction,
} from "react";
import { bindStudioCanvasPanLifecycle, createStudioCanvasPan } from "./studio-canvas-pan";

export type StudioCanvasPanController = {
  canvasPanReady: boolean;
  canvasPanning: boolean;
  setCanvasPanReady: Dispatch<SetStateAction<boolean>>;
  beginCanvasPan: (event: ReactPointerEvent<HTMLDivElement>, backgroundPan?: boolean) => boolean;
  moveCanvasPan: (event: ReactPointerEvent<HTMLDivElement>) => void;
  endCanvasPan: (event: ReactPointerEvent<HTMLDivElement>) => void;
  cancelCanvasPan: (pointerId?: number) => void;
  consumeSuppressedCanvasClick: () => boolean;
};

export function useStudioCanvasPan(): StudioCanvasPanController {
  const [canvasPanReady, setCanvasPanReady] = useState(false);
  const [canvasPanning, setCanvasPanning] = useState(false);
  const [canvasPan] = useState(() => createStudioCanvasPan(setCanvasPanning));

  useEffect(() => bindStudioCanvasPanLifecycle(canvasPan, setCanvasPanReady, window, document), [canvasPan]);

  function beginCanvasPan(event: ReactPointerEvent<HTMLDivElement>, backgroundPan = false) {
    // A cancelled gesture may not produce a click; never swallow the next one.
    canvasPan.clearSuppressedClick();
    if (event.button !== 0 || (!canvasPanReady && !backgroundPan)) return false;
    const target = event.target;
    if (!canvasPanReady && target instanceof Element && target.closest(
      'button, a, input, textarea, select, [contenteditable="true"], [role="textbox"], [data-studio-design-object], [data-studio-native-object], [data-studio-native-heading], [data-studio-copy-field], [data-invitation-photo-slot], [data-studio-rsvp-element], [data-studio-section-element]',
    )) return false;

    const node = event.currentTarget;
    if (!canvasPan.begin(event, node, canvasPanReady)) return false;
    if (canvasPanReady) event.preventDefault();
    node.focus({ preventScroll: true });
    return true;
  }

  function moveCanvasPan(event: ReactPointerEvent<HTMLDivElement>) {
    if (canvasPan.move(event)) event.preventDefault();
  }

  function endCanvasPan(event: ReactPointerEvent<HTMLDivElement>) {
    canvasPan.end(event.pointerId);
  }

  function consumeSuppressedCanvasClick() {
    return canvasPan.consumeSuppressedClick();
  }

  return {
    canvasPanReady,
    canvasPanning,
    setCanvasPanReady,
    beginCanvasPan,
    moveCanvasPan,
    endCanvasPan,
    cancelCanvasPan: canvasPan.cancel,
    consumeSuppressedCanvasClick,
  };
}
