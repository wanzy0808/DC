export const goldenArtDecoArtwork = {
  arch: "/templates/golden-art-deco/01_gatsby_archway.webp",
  fan: "/templates/golden-art-deco/02_gold_pearl_fan_emblem.webp",
  champagne: "/templates/golden-art-deco/03_champagne_tower.webp",
  gramophone: "/templates/golden-art-deco/04_vintage_gramophone.webp",
  mirror: "/templates/golden-art-deco/05_art_deco_oval_mirror.webp",
  candelabra: "/templates/golden-art-deco/06_golden_crystal_candelabra.webp",
  lanterns: "/templates/golden-art-deco/07_paired_art_deco_lanterns.webp",
  dessertTable: "/templates/golden-art-deco/08_art_deco_dessert_table.webp",
  chaise: "/templates/golden-art-deco/09_ivory_gold_chaise_lounge.webp",
  garland: "/templates/golden-art-deco/10_crystal_drapery_garland.webp",
} as const;

export type GoldenArtDecoArtworkKey = keyof typeof goldenArtDecoArtwork;

export function GoldenArtDecoArt({ objectKey, asset, className = "", eager = false }: {
  objectKey: string;
  asset: GoldenArtDecoArtworkKey;
  className?: string;
  eager?: boolean;
}) {
  const src = goldenArtDecoArtwork[asset];
  return <span aria-hidden="true" data-studio-native-object={objectKey} className={`gd-art ${className}`}>
    <img src={src} alt="" loading={eager ? "eager" : "lazy"} decoding="async" />
  </span>;
}

const sectionAsset: Partial<Record<string, GoldenArtDecoArtworkKey>> = {
  greeting: "lanterns",
  event: "gramophone",
  dateTime: "candelabra",
  countdown: "champagne",
  location: "arch",
  rsvp: "lanterns",
  wishes: "mirror",
  gift: "dessertTable",
  closing: "chaise",
};

export function GoldenArtDecoSectionArt({ section }: { section: string }) {
  const asset = sectionAsset[section];
  if (!asset) return null;
  return <GoldenArtDecoArt objectKey={`object:${section}:deco-art`} asset={asset} className={`gd-section-art gd-art-${section}`} />;
}

export function GoldenArtDecoIdentity({ couple, first, second, firstParents, secondParents, names, emptyName }: {
  couple: boolean;
  first: string;
  second: string;
  firstParents: string;
  secondParents: string;
  names: string;
  emptyName: string;
}) {
  if (!couple) {
    return <div className="gd-identity gd-identity-single">
      <GoldenArtDecoArt objectKey="object:identity:mirror-art" asset="mirror" className="gd-identity-mirror" />
      <GoldenArtDecoArt objectKey="object:identity:fan-art" asset="fan" className="gd-identity-fan" />
      <p data-studio-native-object="object:identity:event-name" className="gd-person-name">{names || emptyName}</p>
    </div>;
  }

  return <div className="gd-identity">
    <GoldenArtDecoArt objectKey="object:identity:mirror-art" asset="mirror" className="gd-identity-mirror" />
    <GoldenArtDecoArt objectKey="object:identity:chaise-art" asset="chaise" className="gd-identity-chaise" />
    <GoldenArtDecoArt objectKey="object:identity:fan-art" asset="fan" className="gd-identity-fan" />
    <div data-studio-native-object="object:identity:personOne-group" className="gd-person gd-person-first">
      <span aria-hidden className="gd-person-index">I</span>
      <p data-studio-native-object="object:identity:personOne-name" className="gd-person-name">{first || emptyName}</p>
      {firstParents && <p data-studio-native-object="object:identity:personOne-parents" className="gd-person-parents">{firstParents}</p>}
    </div>
    <span aria-hidden="true" data-studio-native-object="object:identity:ampersand" className="gd-identity-amp">&amp;</span>
    <div data-studio-native-object="object:identity:personTwo-group" className="gd-person gd-person-second">
      <span aria-hidden className="gd-person-index">II</span>
      <p data-studio-native-object="object:identity:personTwo-name" className="gd-person-name">{second || emptyName}</p>
      {secondParents && <p data-studio-native-object="object:identity:personTwo-parents" className="gd-person-parents">{secondParents}</p>}
    </div>
  </div>;
}
