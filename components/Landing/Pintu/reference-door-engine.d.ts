export type ReferenceDoorControls = {
  setAngle: (degrees: number) => void;
  setView: (degrees: number) => void;
  setApproach: (progress: number) => void;
  dispose: () => void;
};

export function mountReferenceDoor(
  container: HTMLDivElement,
  options?: { reducedMotion?: boolean; onApproachSettled?: (inside: boolean) => void },
): Promise<ReferenceDoorControls>;
