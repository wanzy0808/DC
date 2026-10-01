"use client";

import type { CSSProperties } from "react";

export const botanicalArtwork = {
  branch: "/templates/botanical-ivory/greenplant.webp",
  fern: "/templates/botanical-ivory/fern.webp",
} as const;

/** Complete alpha artwork; kept intentionally secondary in the romantic editorial direction. */
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

export function BotanicalRomanceMark({ objectKey, className = "" }: { objectKey: string; className?: string }) {
  return <span aria-hidden="true" data-studio-native-object={objectKey} className={`bi-romance-mark ${className}`}>
    <span className="bi-romance-ring bi-romance-ring-a" />
    <span className="bi-romance-ring bi-romance-ring-b" />
    <span className="bi-romance-thread" />
  </span>;
}

export function BotanicalSectionArt({ section }: { section: string }) {
  if (section === "greeting" || section === "closing") {
    return <BotanicalArt objectKey={`object:${section}:theme-leaf`} className={`bi-section-art bi-art-${section}`} />;
  }
  if (section === "event" || section === "location") {
    return <BotanicalRomanceMark objectKey={`object:${section}:ring-ornament`} className={`bi-section-rings bi-rings-${section}`} />;
  }
  return null;
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
  if (!couple) return <div className="bi-identity bi-identity-single">
    <BotanicalRomanceMark objectKey="object:identity:ring-ornament" className="bi-identity-rings" />
    <p data-studio-native-object="object:identity:event-name" className="bi-person-name">{names || emptyName}</p>
    <BotanicalArt objectKey="object:identity:theme-art" variant="fern" className="bi-single-art" />
  </div>;

  return <div className="bi-identity">
    <BotanicalArt objectKey="object:identity:theme-art" className="bi-identity-sprig" />
    <div data-studio-native-object="object:identity:personOne-group" className="bi-person bi-person-first">
      <div className="bi-person-copy">
        <p data-studio-native-object="object:identity:personOne-name" className="bi-person-name">{first || emptyName}</p>
        {firstParents && <p data-studio-native-object="object:identity:personOne-parents" className="bi-person-parents">{firstParents}</p>}
      </div>
    </div>
    <BotanicalRomanceMark objectKey="object:identity:ring-ornament" className="bi-identity-rings" />
    <div data-studio-native-object="object:identity:personTwo-group" className="bi-person bi-person-second">
      <div className="bi-person-copy">
        <p data-studio-native-object="object:identity:personTwo-name" className="bi-person-name">{second || emptyName}</p>
        {secondParents && <p data-studio-native-object="object:identity:personTwo-parents" className="bi-person-parents">{secondParents}</p>}
      </div>
    </div>
  </div>;
}
