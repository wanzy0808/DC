import type { CSSProperties } from "react";

export const botanicalArtwork = {
  branch: "/templates/botanical-ivory/greenplant.webp",
  fern: "/templates/botanical-ivory/fern.webp",
} as const;

/** Complete alpha artwork; the color blend follows both palette and native color overrides. */
export function BotanicalArt({ objectKey, variant = "branch", className = "", eager = false }: {
  objectKey: string;
  variant?: keyof typeof botanicalArtwork;
  className?: string;
  eager?: boolean;
}) {
  const src = botanicalArtwork[variant];
  return <span aria-hidden="true" data-studio-native-object={objectKey} className={`bi-art ${className}`} style={{ "--bi-art-source": `url('${src}')` } as CSSProperties}>
    <span className="bi-art-plate"><img src={src} alt="" width={768} height={1152} loading={eager ? "eager" : "lazy"} decoding="async" /></span>
  </span>;
}

export function BotanicalSectionArt({ section }: { section: string }) {
  if (!["greeting", "event", "location", "closing"].includes(section)) return null;
  return <BotanicalArt objectKey={`object:${section}:theme-leaf`} variant={section === "event" || section === "location" ? "fern" : "branch"} className={`bi-section-art bi-art-${section}`} />;
}

/** Event identity stays read-only; styling and decorative artwork remain native Studio objects. */
export function BotanicalIdentity({ couple, first, second, firstParents, secondParents, names, emptyName }: {
  couple: boolean;
  first: string;
  second: string;
  firstParents: string;
  secondParents: string;
  names: string;
  emptyName: string;
}) {
  return <div className={`bi-identity ${couple ? "" : "bi-identity-single"}`}>
    {couple ? <>
      <div data-studio-native-object="object:identity:personOne-group" className="bi-person bi-person-first">
        <BotanicalArt objectKey="object:identity:personOne-symbol" variant="fern" className="bi-person-art" />
        <div className="bi-person-copy"><p data-studio-native-object="object:identity:personOne-name" className="bi-person-name">{first || emptyName}</p>
          {firstParents && <p data-studio-native-object="object:identity:personOne-parents" className="bi-person-parents">{firstParents}</p>}</div>
      </div>
      <div data-studio-native-object="object:identity:personTwo-group" className="bi-person bi-person-second">
        <BotanicalArt objectKey="object:identity:personTwo-symbol" className="bi-person-art" />
        <div className="bi-person-copy"><p data-studio-native-object="object:identity:personTwo-name" className="bi-person-name">{second || emptyName}</p>
          {secondParents && <p data-studio-native-object="object:identity:personTwo-parents" className="bi-person-parents">{secondParents}</p>}</div>
      </div>
    </> : <>
      <BotanicalArt objectKey="object:identity:theme-art" variant="fern" className="bi-single-art" />
      <p data-studio-native-object="object:identity:event-name" className="bi-person-name">{names || emptyName}</p>
    </>}
  </div>;
}
