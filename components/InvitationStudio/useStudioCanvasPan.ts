"use client";

import {
  useRef,
  useState,
  type Dispatch,
  type PointerEvent as ReactPointerEvent,
  type SetStateAction,
} from "react";

type CanvasPanSession = {
  pointerId: number;
  startX: number;
  startY: number;
  scrollLeft: number;
  scrollTop: number;
  moved: boolean;
};

export type StudioCanvasPanController = {
  canvasPanReady: boolean;
  canvasPanning: boolean;
  setCanvasPanReady: Dispatch<SetStateAction<boolean>>;
  beginCanvasPan: (event: ReactPointerEvent<HTMLDivElement>) => boolean;
  moveCanvasPan: (event: ReactPointerEvent<HTMLDivElement>) => void;
  endCanvasPan: (event: ReactPointerEvent<HTMLDivElement>) => void;
  consumeSuppressedCanvasClick: () => boolean;
};

export function useStudioCanvasPan(): StudioCanvasPanController {
  const [canvasPanReady, setCanvasPanReady] = useState(false);
  const [canvasPanning, setCanvasPanning] = useState(false);
  const canvasPan = useRef<CanvasPanSession | null>(null);
  const suppressCanvasClick = useRef(false);

  function beginCanvasPan(event: ReactPointerEvent<HTMLDivElement>) {
    if (!canvasPanReady || event.button !== 0) return false;

    event.preventDefault();
    const node = event.currentTarget;
    canvasPan.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: node.scrollLeft,
      scrollTop: node.scrollTop,
      moved: false,
    };
    node.setPointerCapture(event.pointerId);
    setCanvasPanning(true);
    return true;
  }

  function moveCanvasPan(event: ReactPointerEvent<HTMLDivElement>) {
    const pan = canvasPan.current;
    if (!pan || pan.pointerId !== event.pointerId) return;

    const dx = event.clientX - pan.startX;
    const dy = event.clientY - pan.startY;
    if (Math.hypot(dx, dy) > 3) pan.moved = true;
    event.currentTarget.scrollLeft = pan.scrollLeft - dx;
    event.currentTarget.scrollTop = pan.scrollTop - dy;
  }

  function endCanvasPan(event: ReactPointerEvent<HTMLDivElement>) {
    const pan = canvasPan.current;
    if (!pan || pan.pointerId !== event.pointerId) return;

    suppressCanvasClick.current = pan.moved;
    canvasPan.current = null;
    setCanvasPanning(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function consumeSuppressedCanvasClick() {
    if (!suppressCanvasClick.current) return false;
    suppressCanvasClick.current = false;
    return true;
  }

  return {
    canvasPanReady,
    canvasPanning,
    setCanvasPanReady,
    beginCanvasPan,
    moveCanvasPan,
    endCanvasPan,
    consumeSuppressedCanvasClick,
  };
}
