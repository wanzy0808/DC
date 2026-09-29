import type { InvitationAssetLayer } from "@/lib/templates/asset-layers";

export type AssetLayerPosition = "front" | "forward" | "backward" | "back";

function ownerKey(layer: InvitationAssetLayer) {
  const section = layer.section ?? "cover";
  return `${section}:${layer.sectionInstanceId ?? section}`;
}

function scopedIndices(layers: InvitationAssetLayer[], id: string) {
  const selected = layers.find((layer) => layer.id === id);
  if (!selected) return [] as number[];
  const owner = ownerKey(selected);
  return layers.flatMap((layer, index) => ownerKey(layer) === owner ? [index] : []);
}

export function assetLayerScopePosition(layers: InvitationAssetLayer[], id: string) {
  const indices = scopedIndices(layers, id);
  const absoluteIndex = layers.findIndex((layer) => layer.id === id);
  return {
    index: absoluteIndex < 0 ? -1 : indices.indexOf(absoluteIndex),
    count: indices.length,
  };
}

/**
 * Reorder one Studio layer relative to another inside the same section instance.
 * Layers owned by other sections keep their slots and cannot be crossed accidentally.
 */
export function reorderAssetLayers(
  layers: InvitationAssetLayer[],
  sourceId: string,
  targetId: string,
): InvitationAssetLayer[] {
  if (sourceId === targetId) return layers;

  const source = layers.find((layer) => layer.id === sourceId);
  const target = layers.find((layer) => layer.id === targetId);
  if (!source || !target || source.locked || ownerKey(source) !== ownerKey(target)) return layers;

  const indices = scopedIndices(layers, sourceId);
  const peers = indices.map((index) => layers[index]!);
  const sourceIndex = peers.findIndex((layer) => layer.id === sourceId);
  const targetIndex = peers.findIndex((layer) => layer.id === targetId);
  if (sourceIndex < 0 || targetIndex < 0) return layers;

  const [moving] = peers.splice(sourceIndex, 1);
  if (!moving) return layers;
  const targetAfterRemoval = peers.findIndex((layer) => layer.id === targetId);
  if (targetAfterRemoval < 0) return layers;
  peers.splice(sourceIndex < targetIndex ? targetAfterRemoval + 1 : targetAfterRemoval, 0, moving);

  const next = [...layers];
  indices.forEach((absoluteIndex, peerIndex) => { next[absoluteIndex] = peers[peerIndex]!; });
  return next;
}

/**
 * Apply the four layer-order actions inside one section instance.
 * The renderer z-order is scoped by section ownership, so other sections never affect
 * whether "front" or "back" is available for the selected object.
 */
export function positionAssetLayers(
  layers: InvitationAssetLayer[],
  id: string,
  position: AssetLayerPosition,
): InvitationAssetLayer[] {
  const layer = layers.find((item) => item.id === id);
  if (!layer || layer.locked) return layers;

  const indices = scopedIndices(layers, id);
  const peers = indices.map((index) => layers[index]!);
  const index = peers.findIndex((item) => item.id === id);
  if (index < 0) return layers;

  const lastIndex = peers.length - 1;
  if (
    ((position === "front" || position === "forward") && index === lastIndex) ||
    ((position === "back" || position === "backward") && index === 0)
  ) return layers;

  if (position === "forward") {
    [peers[index], peers[index + 1]] = [peers[index + 1]!, peers[index]!];
  } else if (position === "backward") {
    [peers[index], peers[index - 1]] = [peers[index - 1]!, peers[index]!];
  } else {
    peers.splice(index, 1);
    if (position === "front") peers.push(layer);
    else peers.unshift(layer);
  }

  const next = [...layers];
  indices.forEach((absoluteIndex, peerIndex) => { next[absoluteIndex] = peers[peerIndex]!; });
  return next;
}
