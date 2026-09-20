export type ReferenceDoorControls = {
  setAngle: (degrees: number) => void;
  setView: (degrees: number) => void;
  dispose: () => void;
};

export function mountReferenceDoor(
  container: HTMLDivElement,
  options?: { reducedMotion?: boolean },
): Promise<ReferenceDoorControls>;
