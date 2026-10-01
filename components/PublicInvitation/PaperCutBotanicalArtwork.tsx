export const paperCutBotanicalArtwork = {
  couple: "/templates/paper-cut-botanical/01_story_couple.webp",
  ticket: "/templates/paper-cut-botanical/02_love_ticket.webp",
  ribbon: "/templates/paper-cut-botanical/03_ribbon.webp",
  waxSeal: "/templates/paper-cut-botanical/04_wax_seal.webp",
  lantern: "/templates/paper-cut-botanical/05_lantern.webp",
  bicycle: "/templates/paper-cut-botanical/06_bicycle.webp",
  bookstack: "/templates/paper-cut-botanical/07_bookstack.webp",
  polaroid: "/templates/paper-cut-botanical/08_polaroid.webp",
  balloon: "/templates/paper-cut-botanical/09_love_balloon.webp",
  stroll: "/templates/paper-cut-botanical/10_garden_stroll.webp",
} as const;

export type PaperCutBotanicalArtworkKey = keyof typeof paperCutBotanicalArtwork;

export function PaperCutBotanicalArt({
  objectKey,
  asset,
  className = "",
  eager = false,
}: {
  objectKey: string;
  asset: PaperCutBotanicalArtworkKey;
  className?: string;
  eager?: boolean;
}) {
  return (
    <span aria-hidden="true" data-studio-native-object={objectKey} className={"pcb-art " + className}>
      <img
        src={paperCutBotanicalArtwork[asset]}
        alt=""
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
    </span>
  );
}

const sectionAsset: Partial<Record<string, PaperCutBotanicalArtworkKey>> = {
  greeting: "ribbon",
  event: "ticket",
  dateTime: "lantern",
  countdown: "balloon",
  location: "bicycle",
  rsvp: "waxSeal",
  wishes: "polaroid",
  gift: "bookstack",
  closing: "ribbon",
};

export function PaperCutBotanicalSectionArt({ section }: { section: string }) {
  const asset = sectionAsset[section];
  if (!asset) return null;
  return (
    <PaperCutBotanicalArt
      objectKey={"object:" + section + ":paper-art"}
      asset={asset}
      className={"pcb-section-art pcb-art-" + section}
    />
  );
}

export function PaperCutBotanicalIdentity({
  couple,
  first,
  second,
  firstParents,
  secondParents,
  names,
  emptyName,
}: {
  couple: boolean;
  first: string;
  second: string;
  firstParents: string;
  secondParents: string;
  names: string;
  emptyName: string;
}) {
  if (!couple) {
    return (
      <div className="pcb-identity pcb-identity-single">
        <span aria-hidden="true" data-studio-native-object="object:identity:paper-back" className="pcb-identity-paper" />
        <PaperCutBotanicalArt objectKey="object:identity:book-art" asset="bookstack" className="pcb-identity-book" />
        <p data-studio-native-object="object:identity:event-name" className="pcb-person-name">
          {names || emptyName}
        </p>
      </div>
    );
  }

  return (
    <div className="pcb-identity">
      <span aria-hidden="true" data-studio-native-object="object:identity:paper-back" className="pcb-identity-paper" />
      <PaperCutBotanicalArt objectKey="object:identity:couple-art" asset="couple" className="pcb-identity-couple" />
      <PaperCutBotanicalArt objectKey="object:identity:ribbon-art" asset="ribbon" className="pcb-identity-ribbon" />

      <div data-studio-native-object="object:identity:personOne-group" className="pcb-person pcb-person-first">
        <span aria-hidden className="pcb-person-tab">01</span>
        <p data-studio-native-object="object:identity:personOne-name" className="pcb-person-name">
          {first || emptyName}
        </p>
        {firstParents && <p data-studio-native-object="object:identity:personOne-parents" className="pcb-person-parents">{firstParents}</p>}
      </div>

      <span aria-hidden="true" data-studio-native-object="object:identity:ampersand" className="pcb-identity-amp">&amp;</span>

      <div data-studio-native-object="object:identity:personTwo-group" className="pcb-person pcb-person-second">
        <span aria-hidden className="pcb-person-tab">02</span>
        <p data-studio-native-object="object:identity:personTwo-name" className="pcb-person-name">
          {second || emptyName}
        </p>
        {secondParents && <p data-studio-native-object="object:identity:personTwo-parents" className="pcb-person-parents">{secondParents}</p>}
      </div>
    </div>
  );
}
