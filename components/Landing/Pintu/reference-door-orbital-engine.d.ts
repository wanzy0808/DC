export type OrbitalDoorId = 1 | 2 | 3;

export type OrbitalDoorControls = {
  pause: (paused: boolean) => void;
  resume: () => void;
  select: (id: OrbitalDoorId) => void;
  enter: (id: OrbitalDoorId) => boolean;
  cancel: () => void;
  dispose: () => void;
};

export function mountOrbitalDoors(
  container: HTMLDivElement,
  options?: {
    reducedMotion?: boolean;
    onActiveDoor?: (id: OrbitalDoorId) => void;
    onEntered?: (id: OrbitalDoorId) => void;
    onContextChange?: (status: "lost" | "restored") => void;
  },
): Promise<OrbitalDoorControls>;
