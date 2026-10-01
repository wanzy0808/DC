import Image from "next/image";

/** Theme-owned illustration; names, media and actions stay in the shared engine. */
export function BlossomArt({ objectKey, className = "", branch = false, eager = false }: {
  objectKey: string; className?: string; branch?: boolean; eager?: boolean;
}) {
  return <div data-studio-native-object={objectKey} className={`eb-art ${className}`} aria-hidden="true">
    <Image src={`/templates/eternal-blossom/blossom-${branch ? "branch" : "sprig"}.webp`} alt="" width={branch ? 768 : 640} height={branch ? 1152 : 640} sizes="(max-width: 640px) 45vw, 240px" loading={eager ? "eager" : "lazy"} />
  </div>;
}

export function BlossomSymbol({ className = "" }: { className?: string }) {
  return <svg className={className} viewBox="-18 -18 36 36" fill="none" stroke="currentColor" strokeWidth=".8" aria-hidden="true">
    {[0, 72, 144, 216, 288].map(angle => <path key={angle} transform={`rotate(${angle})`} d="M0 0C-9-5-9-14-3-14C-1-14 0-12 0-12C0-12 1-14 3-14C9-14 9-5 0 0Z" />)}
    <circle r="2.4" />
  </svg>;
}

// Actual scalloped paper geometry, independent of the event's replaceable photo.
const scallop = Array.from({ length: 360 }, (_, i) => {
  const angle = i * Math.PI / 180;
  const ripple = 1 + .022 * Math.cos(36 * angle);
  return `${i ? "L" : "M"}${(150 + 142 * ripple * Math.cos(angle)).toFixed(2)} ${(195 + 185 * ripple * Math.sin(angle)).toFixed(2)}`;
}).join(" ") + " Z";

export function BlossomScallop() {
  return <svg className="eb-scallop" viewBox="0 0 300 390" preserveAspectRatio="none" aria-hidden="true"><path d={scallop} fill="currentColor" /></svg>;
}

export function EternalBlossomSectionArt({ section }: { section: string }) {
  if (section === "greeting") return <BlossomArt objectKey="object:greeting:flower-art" className="eb-greeting-art" />;
  if (section === "closing") return <BlossomArt objectKey="object:closing:flower-art" className="eb-closing-art" />;
  return null;
}
