import type { InvitationAssetLayer } from "@/lib/templates/asset-layers";

export type AssetLayerAlignment =
  | "left"
  | "center-x"
  | "right"
  | "top"
  | "center-y"
  | "bottom";

export type AssetLayerDistribution = "horizontal" | "vertical";

export type AssetLayerGeometryItem = {
  layer: InvitationAssetLayer;
  rect: Pick<DOMRect, "left" | "right" | "top" | "bottom" | "width" | "height">;
};

export type AssetLayerGeometry = {
  items: AssetLayerGeometryItem[];
  sectionRect: Pick<DOMRect, "width" | "height">;
};

const clampPercent = (value: number) => Math.min(100, Math.max(0, value));

function applyGeometryUpdates(
  layers: InvitationAssetLayer[],
  updates: Map<string, { x?: number; y?: number }>,
) {
  return layers.map((layer) => {
    const patch = updates.get(layer.id);
    if (!patch) return layer;
    return {
      ...layer,
      ...(patch.x === undefined ? {} : { x: clampPercent(patch.x) }),
      ...(patch.y === undefined ? {} : { y: clampPercent(patch.y) }),
    };
  });
}

export function alignAssetLayerGeometry(
  layers: InvitationAssetLayer[],
  geometry: AssetLayerGeometry,
  mode: AssetLayerAlignment,
): InvitationAssetLayer[] {
  const { items, sectionRect } = geometry;
  const left = Math.min(...items.map(({ rect }) => rect.left));
  const right = Math.max(...items.map(({ rect }) => rect.right));
  const top = Math.min(...items.map(({ rect }) => rect.top));
  const bottom = Math.max(...items.map(({ rect }) => rect.bottom));
  const centerX = (left + right) / 2;
  const centerY = (top + bottom) / 2;
  const updates = new Map<string, { x?: number; y?: number }>();

  for (const { layer, rect } of items) {
    if (mode === "left") {
      updates.set(layer.id, {
        x: layer.x + (left - rect.left) / sectionRect.width * 100,
      });
    } else if (mode === "center-x") {
      updates.set(layer.id, {
        x: layer.x + (centerX - (rect.left + rect.width / 2)) / sectionRect.width * 100,
      });
    } else if (mode === "right") {
      updates.set(layer.id, {
        x: layer.x + (right - rect.right) / sectionRect.width * 100,
      });
    } else if (mode === "top") {
      updates.set(layer.id, {
        y: layer.y + (top - rect.top) / sectionRect.height * 100,
      });
    } else if (mode === "center-y") {
      updates.set(layer.id, {
        y: layer.y + (centerY - (rect.top + rect.height / 2)) / sectionRect.height * 100,
      });
    } else {
      updates.set(layer.id, {
        y: layer.y + (bottom - rect.bottom) / sectionRect.height * 100,
      });
    }
  }

  return applyGeometryUpdates(layers, updates);
}

export function distributeAssetLayerGeometry(
  layers: InvitationAssetLayer[],
  geometry: AssetLayerGeometry,
  axis: AssetLayerDistribution,
): InvitationAssetLayer[] {
  const { items, sectionRect } = geometry;
  const sorted = [...items].sort((a, b) =>
    axis === "horizontal"
      ? (a.rect.left + a.rect.width / 2) - (b.rect.left + b.rect.width / 2)
      : (a.rect.top + a.rect.height / 2) - (b.rect.top + b.rect.height / 2),
  );

  const first = sorted[0];
  const last = sorted.at(-1);
  if (!first || !last || sorted.length < 2) return layers;

  const firstCenter = axis === "horizontal"
    ? first.rect.left + first.rect.width / 2
    : first.rect.top + first.rect.height / 2;
  const lastCenter = axis === "horizontal"
    ? last.rect.left + last.rect.width / 2
    : last.rect.top + last.rect.height / 2;
  const gap = (lastCenter - firstCenter) / (sorted.length - 1);
  const updates = new Map<string, { x?: number; y?: number }>();

  sorted.forEach(({ layer, rect }, index) => {
    const currentCenter = axis === "horizontal"
      ? rect.left + rect.width / 2
      : rect.top + rect.height / 2;
    const delta = firstCenter + gap * index - currentCenter;
    updates.set(
      layer.id,
      axis === "horizontal"
        ? { x: layer.x + delta / sectionRect.width * 100 }
        : { y: layer.y + delta / sectionRect.height * 100 },
    );
  });

  return applyGeometryUpdates(layers, updates);
}
