export const classicPearlArtwork = {
  candelabra: "/templates/classic-pearl/01_ornate_golden_candelabra.webp",
  chaise: "/templates/classic-pearl/02_ivory_victorian_chaise_lounge.webp",
  mirror: "/templates/classic-pearl/03_pearl_crested_baroque_mirror_frame.webp",
  perfume: "/templates/classic-pearl/04_pearl_adorned_perfume_bottle.webp",
  tiara: "/templates/classic-pearl/05_gold_pearl_bridal_tiara.webp",
  chandelier: "/templates/classic-pearl/06_crystal_pearl_chandelier.webp",
  teaTable: "/templates/classic-pearl/07_bridal_tea_table.webp",
  arch: "/templates/classic-pearl/08_ivory_gold_wedding_arch.webp",
  garland: "/templates/classic-pearl/09_ivory_bridal_garland_swag.webp",
  carriage: "/templates/classic-pearl/10_golden_bridal_carriage.webp",
} as const;

export type ClassicPearlArtworkKey = keyof typeof classicPearlArtwork;

export function ClassicPearlArt({ objectKey, asset, className = "", eager = false }: {
  objectKey: string;
  asset: ClassicPearlArtworkKey;
  className?: string;
  eager?: boolean;
}) {
  const src = classicPearlArtwork[asset];
  return <span aria-hidden="true" data-studio-native-object={objectKey} className={`cp-art ${className}`}>
    <img src={src} alt="" loading={eager ? "eager" : "lazy"} decoding="async" />
  </span>;
}

const sectionAsset: Partial<Record<string, ClassicPearlArtworkKey>> = {
  greeting: "mirror",
  event: "teaTable",
  dateTime: "candelabra",
  countdown: "chandelier",
  location: "carriage",
  rsvp: "garland",
  wishes: "perfume",
  gift: "tiara",
  closing: "chaise",
};

export function ClassicPearlSectionArt({ section }: { section: string }) {
  const asset = sectionAsset[section];
  if (!asset) return null;
  return <ClassicPearlArt objectKey={`object:${section}:pearl-art`} asset={asset} className={`cp-section-art cp-art-${section}`} />;
}

export function ClassicPearlIdentity({ couple, first, second, firstParents, secondParents, names, emptyName }: {
  couple: boolean;
  first: string;
  second: string;
  firstParents: string;
  secondParents: string;
  names: string;
  emptyName: string;
}) {
  if (!couple) {
    return <div className="cp-identity cp-identity-single">
      <ClassicPearlArt objectKey="object:identity:mirror-art" asset="mirror" className="cp-identity-mirror" />
      <p data-studio-native-object="object:identity:event-name" className="cp-person-name">{names || emptyName}</p>
    </div>;
  }

  return <div className="cp-identity">
    <ClassicPearlArt objectKey="object:identity:mirror-art" asset="mirror" className="cp-identity-mirror" />
    <ClassicPearlArt objectKey="object:identity:tiara-art" asset="tiara" className="cp-identity-tiara" />
    <div data-studio-native-object="object:identity:personOne-group" className="cp-person cp-person-first">
      <p data-studio-native-object="object:identity:personOne-name" className="cp-person-name">{first || emptyName}</p>
      {firstParents && <p data-studio-native-object="object:identity:personOne-parents" className="cp-person-parents">{firstParents}</p>}
    </div>
    <span aria-hidden="true" data-studio-native-object="object:identity:ampersand" className="cp-identity-amp">&amp;</span>
    <div data-studio-native-object="object:identity:personTwo-group" className="cp-person cp-person-second">
      <p data-studio-native-object="object:identity:personTwo-name" className="cp-person-name">{second || emptyName}</p>
      {secondParents && <p data-studio-native-object="object:identity:personTwo-parents" className="cp-person-parents">{secondParents}</p>}
    </div>
  </div>;
}
