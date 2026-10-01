export const midnightRomanceArtwork = {
  lantern: "/templates/midnight-romance/01_ornate_candlelit_lantern.webp",
  chaise: "/templates/midnight-romance/02_baroque_chaise_lounge.webp",
  garland: "/templates/midnight-romance/03_burgundy_light_garland.webp",
  arch: "/templates/midnight-romance/04_navy_rose_wedding_arch.webp",
  teaTable: "/templates/midnight-romance/05_parisian_tea_table.webp",
  mirror: "/templates/midnight-romance/06_celestial_rose_mirror.webp",
  candelabra: "/templates/midnight-romance/07_gothic_candelabra.webp",
  carriage: "/templates/midnight-romance/08_golden_rose_carriage.webp",
  chandelier: "/templates/midnight-romance/09_crescent_moon_chandelier.webp",
  perfume: "/templates/midnight-romance/10_sapphire_perfume_bottle.webp",
} as const;

export type MidnightRomanceArtworkKey = keyof typeof midnightRomanceArtwork;

export function MidnightRomanceArt({ objectKey, asset, className = "", eager = false }: {
  objectKey: string;
  asset: MidnightRomanceArtworkKey;
  className?: string;
  eager?: boolean;
}) {
  const src = midnightRomanceArtwork[asset];
  return <span aria-hidden="true" data-studio-native-object={objectKey} className={`mr-art ${className}`}>
    <img src={src} alt="" loading={eager ? "eager" : "lazy"} decoding="async" />
  </span>;
}

const sectionAsset: Partial<Record<string, MidnightRomanceArtworkKey>> = {
  greeting: "lantern",
  identity: "mirror",
  event: "teaTable",
  dateTime: "candelabra",
  countdown: "chandelier",
  location: "carriage",
  rsvp: "candelabra",
  wishes: "perfume",
  gift: "perfume",
  closing: "chaise",
};

export function MidnightRomanceSectionArt({ section }: { section: string }) {
  const asset = sectionAsset[section];
  if (!asset) return null;
  return <MidnightRomanceArt objectKey={`object:${section}:midnight-art`} asset={asset} className={`mr-section-art mr-art-${section}`} />;
}
