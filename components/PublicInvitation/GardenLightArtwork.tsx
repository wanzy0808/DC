export const gardenLightArtwork = {
  birdcage: "/templates/garden-light/01_ornate_golden_birdcage.webp",
  parasol: "/templates/garden-light/02_vintage_lace_parasol.webp",
  lanterns: "/templates/garden-light/03_romantic_lantern_arrangement.webp",
  hangingLantern: "/templates/garden-light/04_hanging_botanical_lantern.webp",
  teaTable: "/templates/garden-light/05_vintage_garden_tea_table.webp",
  swing: "/templates/garden-light/06_illuminated_garden_swing.webp",
  bicycle: "/templates/garden-light/07_romantic_ivory_bicycle.webp",
  fountain: "/templates/garden-light/08_elegant_garden_fountain.webp",
  garland: "/templates/garden-light/09_glowing_floral_light_garland.webp",
  arch: "/templates/garden-light/10_romantic_lit_wedding_arch.webp",
} as const;

export type GardenLightArtworkKey = keyof typeof gardenLightArtwork;

export function GardenLightArt({ objectKey, asset, className = "", eager = false }: {
  objectKey: string;
  asset: GardenLightArtworkKey;
  className?: string;
  eager?: boolean;
}) {
  const src = gardenLightArtwork[asset];
  return <span aria-hidden="true" data-studio-native-object={objectKey} className={`gl-art ${className}`}>
    <img src={src} alt="" loading={eager ? "eager" : "lazy"} decoding="async" />
  </span>;
}

const sectionAsset: Partial<Record<string, GardenLightArtworkKey>> = {
  greeting: "hangingLantern",
  event: "teaTable",
  dateTime: "birdcage",
  countdown: "fountain",
  location: "bicycle",
  rsvp: "lanterns",
  wishes: "parasol",
  gift: "birdcage",
  closing: "swing",
};

export function GardenLightSectionArt({ section }: { section: string }) {
  const asset = sectionAsset[section];
  if (!asset) return null;
  return <GardenLightArt objectKey={`object:${section}:garden-art`} asset={asset} className={`gl-section-art gl-art-${section}`} />;
}
