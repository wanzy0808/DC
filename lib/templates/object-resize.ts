/** Canvas resize geometry: the edge opposite the active handle stays in place. */
export type ObjectResizeHandle =
  | "top-left" | "top" | "top-right" | "right"
  | "bottom-right" | "bottom" | "bottom-left" | "left";

export type ObjectResizeStart = {
  handle: ObjectResizeHandle;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  sectionWidth: number;
  sectionHeight: number;
  objectWidth: number;
  objectHeight: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const round = (value: number) => Math.round(value * 10) / 10;

/**
 * Values are percentages: object width AND height are relative to section width,
 * while the centre's Y coordinate is relative to section height.
 * Edge handles move only their own edge, corners scale around the opposite corner.
 */
export function resizeObjectFromHandle(
  start: ObjectResizeStart,
  dx: number,
  dy: number,
): { x: number; y: number; width: number; height: number } {
  const radians = start.rotation * Math.PI / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const localX = dx * cos + dy * sin;
  const localY = -dx * sin + dy * cos;
  const signX = start.handle.includes("left") ? -1 : start.handle.includes("right") ? 1 : 0;
  const signY = start.handle.includes("top") ? -1 : start.handle.includes("bottom") ? 1 : 0;
  let width = start.width;
  let height = start.height;

  if (signX && signY) {
    const proposedScale = 1 + (
      signX * localX / start.objectWidth + signY * localY / start.objectHeight
    ) / 2;
    const minScale = Math.max(5 / start.width, 3 / start.height);
    const maxScale = Math.min(85 / start.width, 200 / start.height);
    const scale = clamp(proposedScale, minScale, maxScale);
    width *= scale;
    height *= scale;
  } else if (signX) {
    width = clamp(start.width + signX * localX / start.sectionWidth * 100, 5, 85);
  } else if (signY) {
    height = clamp(start.height + signY * localY / start.sectionWidth * 100, 3, 200);
  }

  // Half of the size difference moves the centre towards the dragged edge.
  // Convert the offset back from the rotated local axes to section coordinates.
  const centreLocalX = signX * (width - start.width) / 100 * start.sectionWidth / 2;
  const centreLocalY = signY * (height - start.height) / 100 * start.sectionWidth / 2;
  const centreX = centreLocalX * cos - centreLocalY * sin;
  const centreY = centreLocalX * sin + centreLocalY * cos;

  return {
    x: round(clamp(start.x + centreX / start.sectionWidth * 100, 0, 100)),
    y: round(clamp(start.y + centreY / start.sectionHeight * 100, 0, 100)),
    width: round(width),
    height: round(height),
  };
}
