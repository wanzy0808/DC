export const velvetHorizonArtwork = {
  blossom: "/templates/velvet-horizon/01_sakura_branch.webp",
  horizon: "/templates/velvet-horizon/03_ink_mountain_landscape.webp",
  cloudBand: "/templates/velvet-horizon/06_japanese_cloud_band.webp",
  sunsetDisc: "/templates/velvet-horizon/08_red_sun_clouds.webp",
  drape: "/templates/modern-maroon/04_fabric_wave.webp",
  arch: "/templates/garden-light/10_romantic_lit_wedding_arch.webp",
  lanterns: "/templates/garden-light/03_romantic_lantern_arrangement.webp",
  teaTable: "/templates/garden-light/05_vintage_garden_tea_table.webp",
  fountain: "/templates/garden-light/08_elegant_garden_fountain.webp",
  garland: "/templates/classic-pearl/09_ivory_bridal_garland_swag.webp",
} as const;

export type VelvetHorizonArtworkKey = keyof typeof velvetHorizonArtwork;

export function VelvetHorizonArt({
  objectKey,
  asset,
  className = "",
  eager = false,
}: {
  objectKey: string;
  asset: VelvetHorizonArtworkKey;
  className?: string;
  eager?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      data-studio-native-object={objectKey}
      className={`vh-art ${className}`}
    >
      <img
        src={velvetHorizonArtwork[asset]}
        alt=""
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
    </span>
  );
}

const sectionAssets: Partial<Record<string, [VelvetHorizonArtworkKey, VelvetHorizonArtworkKey?]>> = {
  greeting: ["blossom", "sunsetDisc"],
  identity: ["horizon", "blossom"],
  event: ["garland", "lanterns"],
  dateTime: ["sunsetDisc", "cloudBand"],
  gallery: ["horizon", "blossom"],
  countdown: ["teaTable", "cloudBand"],
  location: ["arch", "fountain"],
  rsvp: ["blossom", "garland"],
  wishes: ["lanterns", "blossom"],
  gift: ["garland", "sunsetDisc"],
  closing: ["arch", "lanterns"],
};

export function VelvetHorizonSectionArt({ section }: { section: string }) {
  const assets = sectionAssets[section];
  if (!assets) return null;
  const [primary, secondary] = assets;
  return (
    <div aria-hidden="true" className={`vh-section-art vh-section-art-${section}`}>
      <VelvetHorizonArt
        objectKey={`object:${section}:velvet-art`}
        asset={primary}
        className="vh-section-primary"
      />
      {secondary && (
        <VelvetHorizonArt
          objectKey={`object:${section}:velvet-secondary-art`}
          asset={secondary}
          className="vh-section-secondary"
        />
      )}
    </div>
  );
}
