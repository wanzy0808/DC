export type AssetDoorControls = {
  setView: (degrees: number) => void;
  setAngle: (degrees: number) => void;
  capturePng: () => string | null;
  dispose: () => void;
};

export function mountAssetDoor(
  container: HTMLDivElement,
  options?: {
    reducedMotion?: boolean;
    onLoaded?: (model: {
      url: string;
      meshCount: number;
      canOpen: boolean;
      faceCount: number;
    }) => void;
    onContextChange?: (status: "lost" | "restored") => void;
  },
): Promise<AssetDoorControls | null>;
