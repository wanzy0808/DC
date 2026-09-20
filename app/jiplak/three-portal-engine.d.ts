export type PortalId = 1 | 2 | 3;

export type PortalEngineOptions = {
  getActiveDoor: () => PortalId;
  getDarkMode: () => boolean;
  onChoose: (door: PortalId) => void;
  onEnter: (door: PortalId) => void;
  reducedMotion: boolean;
};

export function mountThreePortals(
  container: HTMLDivElement,
  options: PortalEngineOptions,
): Promise<() => void>;
