import type { InvitationAssetLayer } from "@/lib/templates/asset-layers";

export type AssetLayerPosition = "front" | "forward" | "backward" | "back";

/**
 * Reorder one Studio layer relative to another.
 *
 * Locked layers cannot be dragged themselves. Returning the original array
 * signals that no editor history entry should be created.
 */
export function reorderAssetLayers(
  layers: InvitationAssetLayer[],
  sourceId: string,
  targetId: string,
): InvitationAssetLayer[] {
  if (sourceId === targetId) return layers;

  const sourceIndex = layers.findIndex((layer) => layer.id === sourceId);
  const targetIndex = layers.findIndex((layer) => layer.id === targetId);
  const source = layers[sourceIndex];

  if (sourceIndex < 0 || targetIndex < 0 || !source || source.locked) return layers;

  const next = [...layers];
  next.splice(sourceIndex, 1);

  const targetAfterRemoval = next.findIndex((layer) => layer.id === targetId);
  if (targetAfterRemoval < 0) return layers;

  const insertAt = sourceIndex < targetIndex
    ? targetAfterRemoval + 1
    : targetAfterRemoval;

  next.splice(insertAt, 0, source);
  return next;
}

/**
 * Apply the four layer-order actions used by both text and asset inspectors.
 * The array order is the renderer z-order: index 0 is back, last index is front.
 */
export function positionAssetLayers(
  layers: InvitationAssetLayer[],
  id: string,
  position: AssetLayerPosition,
): InvitationAssetLayer[] {
  const index = layers.findIndex((layer) => layer.id === id);
  const layer = layers[index];
  if (index < 0 || !layer || layer.locked) return layers;

  const lastIndex = layers.length - 1;
  if (
    ((position === "front" || position === "forward") && index === lastIndex) ||
    ((position === "back" || position === "backward") && index === 0)
  ) {
    return layers;
  }

  const next = [...layers];

  if (position === "forward") {
    [next[index], next[index + 1]] = [next[index + 1]!, next[index]!];
    return next;
  }

  if (position === "backward") {
    [next[index], next[index - 1]] = [next[index - 1]!, next[index]!];
    return next;
  }

  next.splice(index, 1);
  if (position === "front") next.push(layer);
  else next.unshift(layer);

  return next;
}
