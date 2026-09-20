export type ReferenceDoorControls = {
  setAngle: (degrees: number) => void;
  setView: (degrees: number) => void;
  setApproach: (progress: number) => void;
  capturePng: () => string | null;
  dispose: () => void;
};

export function mountReferenceDoor(
  container: HTMLDivElement,
  options?: {
    reducedMotion?: boolean;
    onApproachSettled?: (inside: boolean) => void;
    onContextChange?: (status: "lost" | "restored") => void;
  },
): Promise<ReferenceDoorControls>;
