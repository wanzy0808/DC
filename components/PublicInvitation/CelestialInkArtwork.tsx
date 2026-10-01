export const celestialInkArtwork = {
  pillars: "/templates/celestial-ink/01_celestial_lantern_pillars.webp",
  tea: "/templates/celestial-ink/02_celestial_tea_ceremony.webp",
  gramophone: "/templates/celestial-ink/03_celestial_gramophone_music_box.webp",
  drapery: "/templates/celestial-ink/04_celestial_drapery_header.webp",
  calligraphy: "/templates/celestial-ink/05_celestial_calligraphy_set.webp",
  lantern: "/templates/celestial-ink/06_celestial_hanging_lantern.webp",
  mirror: "/templates/celestial-ink/07_celestial_mirror_frame.webp",
  screen: "/templates/celestial-ink/08_celestial_folding_screen.webp",
  chaise: "/templates/celestial-ink/09_celestial_chaise_lounge.webp",
  moonGate: "/templates/celestial-ink/10_celestial_moon_gate.webp",
} as const;

export type CelestialInkArtworkKey = keyof typeof celestialInkArtwork;

export function CelestialInkArt({ objectKey, asset, className = "", eager = false }: {
  objectKey: string;
  asset: CelestialInkArtworkKey;
  className?: string;
  eager?: boolean;
}) {
  return <span aria-hidden="true" data-studio-native-object={objectKey} className={`ci-art ${className}`}>
    <img src={celestialInkArtwork[asset]} alt="" loading={eager ? "eager" : "lazy"} decoding="async" />
  </span>;
}

const sectionAsset: Partial<Record<string, CelestialInkArtworkKey>> = {
  greeting: "calligraphy",
  event: "tea",
  dateTime: "pillars",
  countdown: "gramophone",
  location: "moonGate",
  rsvp: "lantern",
  wishes: "screen",
  gift: "calligraphy",
  closing: "chaise",
};

export function CelestialInkSectionArt({ section }: { section: string }) {
  const asset = sectionAsset[section];
  if (!asset) return null;
  return <CelestialInkArt objectKey={`object:${section}:celestial-art`} asset={asset} className={`ci-section-art ci-art-${section}`} />;
}

export function CelestialInkIdentity({ couple, first, second, firstParents, secondParents, names, emptyName }: {
  couple: boolean;
  first: string;
  second: string;
  firstParents: string;
  secondParents: string;
  names: string;
  emptyName: string;
}) {
  if (!couple) return <div className="ci-identity ci-identity-single">
    <CelestialInkArt objectKey="object:identity:mirror-art" asset="mirror" className="ci-identity-mirror" />
    <p data-studio-native-object="object:identity:event-name" className="ci-identity-single-name">{names || emptyName}</p>
  </div>;

  return <div className="ci-identity">
    <CelestialInkArt objectKey="object:identity:mirror-art" asset="mirror" className="ci-identity-mirror" />
    <CelestialInkArt objectKey="object:identity:chaise-art" asset="chaise" className="ci-identity-chaise" />
    <div data-studio-native-object="object:identity:personOne-group" className="ci-person ci-person-one">
      <span aria-hidden className="ci-person-star">✦</span>
      <p data-studio-native-object="object:identity:personOne-name" className="ci-person-name">{first || emptyName}</p>
      {firstParents && <p data-studio-native-object="object:identity:personOne-parents" className="ci-person-parents">{firstParents}</p>}
    </div>
    <div data-studio-native-object="object:identity:personTwo-group" className="ci-person ci-person-two">
      <span aria-hidden className="ci-person-star">☾</span>
      <p data-studio-native-object="object:identity:personTwo-name" className="ci-person-name">{second || emptyName}</p>
      {secondParents && <p data-studio-native-object="object:identity:personTwo-parents" className="ci-person-parents">{secondParents}</p>}
    </div>
  </div>;
}
