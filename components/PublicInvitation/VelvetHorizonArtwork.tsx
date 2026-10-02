export const velvetHorizonArtwork = {
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

const sectionAssets: Partial<Record<string, VelvetHorizonArtworkKey>> = {
  greeting: "garland",
  identity: "arch",
  event: "lanterns",
  dateTime: "drape",
  gallery: "garland",
  countdown: "teaTable",
  location: "fountain",
  rsvp: "garland",
  wishes: "lanterns",
  gift: "garland",
  closing: "arch",
};

export function VelvetHorizonSectionArt({ section }: { section: string }) {
  const asset = sectionAssets[section];
  if (!asset) return null;
  return (
    <div aria-hidden="true" className={`vh-section-art vh-section-art-${section}`}>
      <VelvetHorizonArt
        objectKey={`object:${section}:velvet-art`}
        asset={asset}
        className="vh-section-primary"
      />
    </div>
  );
}
