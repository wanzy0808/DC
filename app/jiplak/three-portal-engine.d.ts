export type PortalId = 1 | 2 | 3;

export type PortalEngineOptions = {
  getActiveDoor: () => PortalId;
  getDarkMode: () => boolean;
  getOrbit: () => number;
  onHover: (door: PortalId) => void;
  onLeave: () => void;
  onChoose: (door: PortalId) => void;
  onEnter: (door: PortalId) => void;
  reducedMotion: boolean;
};

export function mountThreePortals(
  container: HTMLDivElement,
  options: PortalEngineOptions,
): Promise<() => void>;
