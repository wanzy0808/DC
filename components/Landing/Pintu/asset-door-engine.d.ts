export type AssetDoorControls = {
  setView: (degrees: number) => void;
  capturePng: () => string | null;
  dispose: () => void;
};

export function mountAssetDoor(
  container: HTMLDivElement,
  options?: {
    reducedMotion?: boolean;
    onLoaded?: (model: { url: string; meshCount: number }) => void;
    onContextChange?: (status: "lost" | "restored") => void;
  },
): Promise<AssetDoorControls>;
