"use client";

import { Eye, EyeOff, Lock, Unlock } from "lucide-react";
import {
  MAX_ASSET_LAYERS,
  type InvitationAssetLayer,
} from "@/lib/templates/asset-layers";
import type {
  AssetLayerAlignment,
  AssetLayerDistribution,
} from "@/components/InvitationStudio/designer-layer-geometry";

export default function StudioLayerList({
  locale,
  layers,
  selectedId,
  selectedIds,
  dragOverId,
  onDragOverId,
  onSelect,
  onUpdate,
  onReorder,
  onGroup,
  onUngroup,
  onAlign,
  onDistribute,
}: {
  locale: string;
  layers: InvitationAssetLayer[];
  selectedId: string | null;
  selectedIds: string[];
  dragOverId: string | null;
  onDragOverId: (id: string | null) => void;
  onSelect: (id: string, additive: boolean) => void;
  onUpdate: (id: string, patch: Partial<InvitationAssetLayer>) => void;
  onReorder: (sourceId: string, targetId: string) => void;
  onGroup: () => void;
  onUngroup: () => void;
  onAlign: (alignment: AssetLayerAlignment) => void;
  onDistribute: (direction: AssetLayerDistribution) => void;
}) {
  const en = locale === "en";
  const selectedLayers = layers.filter((layer) => selectedIds.includes(layer.id));
  const groupedSelection = selectedLayers.some((layer) => layer.groupId);

  return (
    <aside className="dc-studio-layer-list" aria-label={en ? "Asset list" : "Daftar aset"}>
      <div className="dc-studio-layer-list-head">
        {en ? "Assets" : "Asset"} {layers.length}/{MAX_ASSET_LAYERS}
      </div>

      {(selectedIds.length > 1 || groupedSelection) && (
        <div
          className="dc-studio-layer-group-actions"
          role="group"
          aria-label={en ? "Layer grouping and alignment" : "Pengelompokan dan alignment layer"}
        >
          {selectedIds.length > 1 && (
            <>
              <button type="button" onClick={onGroup}>Group</button>
              <button type="button" onClick={() => onAlign("left")} title={en ? "Align left" : "Rata kiri"} aria-label={en ? "Align left" : "Rata kiri"}>↤</button>
              <button type="button" onClick={() => onAlign("center-x")} title={en ? "Align horizontal center" : "Rata tengah horizontal"} aria-label={en ? "Align horizontal center" : "Rata tengah horizontal"}>↔</button>
              <button type="button" onClick={() => onAlign("right")} title={en ? "Align right" : "Rata kanan"} aria-label={en ? "Align right" : "Rata kanan"}>↦</button>
              <button type="button" onClick={() => onAlign("top")} title={en ? "Align top" : "Rata atas"} aria-label={en ? "Align top" : "Rata atas"}>↥</button>
              <button type="button" onClick={() => onAlign("center-y")} title={en ? "Align vertical center" : "Rata tengah vertikal"} aria-label={en ? "Align vertical center" : "Rata tengah vertikal"}>↕</button>
              <button type="button" onClick={() => onAlign("bottom")} title={en ? "Align bottom" : "Rata bawah"} aria-label={en ? "Align bottom" : "Rata bawah"}>↧</button>
              {selectedIds.length > 2 && (
                <>
                  <button type="button" onClick={() => onDistribute("horizontal")} title={en ? "Distribute horizontally" : "Sebar horizontal"} aria-label={en ? "Distribute horizontally" : "Sebar horizontal"}>H</button>
                  <button type="button" onClick={() => onDistribute("vertical")} title={en ? "Distribute vertically" : "Sebar vertikal"} aria-label={en ? "Distribute vertically" : "Sebar vertikal"}>V</button>
                </>
              )}
            </>
          )}
          {groupedSelection && <button type="button" onClick={onUngroup}>Ungroup</button>}
        </div>
      )}

      <div className="dc-studio-layer-list-items">
        {[...layers].reverse().map((layer) => {
          const assetNumber = layers.indexOf(layer) + 1;
          const automaticLayerName = layer.kind === "text"
            ? `${en ? "Text" : "Teks"} · ${(layer.text || "").trim().slice(0, 18) || assetNumber}`
            : `${en ? "Image" : "Gambar"} ${assetNumber}`;
          const layerName = layer.name?.trim() || automaticLayerName;

          return (
            <div
              key={layer.id}
              className="dc-studio-layer-list-row"
              draggable={!layer.locked}
              onDragStart={(event) => {
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("application/x-dc-layer", layer.id);
              }}
              onDragEnter={() => onDragOverId(layer.id)}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
              }}
              onDrop={(event) => {
                event.preventDefault();
                event.stopPropagation();
                const sourceId = event.dataTransfer.getData("application/x-dc-layer");
                if (sourceId) onReorder(sourceId, layer.id);
                onDragOverId(null);
              }}
              onDragEnd={() => onDragOverId(null)}
              data-layer-drag-over={dragOverId === layer.id ? "true" : undefined}
            >
              <button
                type="button"
                className="dc-studio-layer-select-button"
                aria-pressed={selectedIds.includes(layer.id) || selectedId === layer.id}
                onClick={(event) => onSelect(layer.id, event.shiftKey)}
                title={layerName}
              >
                {layerName}
              </button>
              <button
                type="button"
                className="dc-studio-layer-quick"
                aria-label={layer.hidden ? (en ? "Show layer" : "Tampilkan layer") : (en ? "Hide layer" : "Sembunyikan layer")}
                title={layer.hidden ? (en ? "Show" : "Tampilkan") : (en ? "Hide" : "Sembunyikan")}
                onClick={() => onUpdate(layer.id, { hidden: layer.hidden ? undefined : true })}
              >
                {layer.hidden ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
              <button
                type="button"
                className="dc-studio-layer-quick"
                aria-label={layer.locked ? (en ? "Unlock layer" : "Buka kunci layer") : (en ? "Lock layer" : "Kunci layer")}
                title={layer.locked ? (en ? "Unlock" : "Buka kunci") : (en ? "Lock" : "Kunci")}
                onClick={() => onUpdate(layer.id, { locked: layer.locked ? undefined : true })}
              >
                {layer.locked ? <Lock size={13} /> : <Unlock size={13} />}
              </button>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
