"use client";

const ROOT = "/templates/modern-maroon/";

function Art({
  src,
  object,
  className,
}: {
  src: string;
  object: string;
  className: string;
}) {
  return (
    <img
      src={ROOT + src}
      alt=""
      aria-hidden="true"
      loading="lazy"
      data-studio-native-object={object}
      className={`pointer-events-none absolute select-none object-contain ${className}`}
    />
  );
}

/** Template-owned decoration only; shared section data and controls remain untouched. */
export default function ModernMaroonSectionArt({ section }: { section: string }) {
  switch (section) {
    case "greeting":
      return <Art src="04_fabric_wave.webp" object="object:greeting:theme-art" className="-right-20 -top-12 z-0 w-[62%] opacity-20 mix-blend-multiply" />;
    case "identity":
      return <>
        <Art src="06_gold_curve_lines.webp" object="object:identity:theme-art" className="-left-12 top-[12%] z-0 w-[68%] opacity-35" />
        <Art src="05_petal_fall.webp" object="object:identity:petal-art" className="-right-10 bottom-8 z-0 w-[42%] opacity-35" />
      </>;
    case "event":
      return <Art src="02_flower_cluster.webp" object="object:event:flower-art" className="-right-14 -top-10 z-0 w-[45%] opacity-24" />;
    case "dateTime":
      return <Art src="06_gold_curve_lines.webp" object="object:dateTime:theme-art" className="-right-24 bottom-12 z-0 w-[74%] opacity-24" />;
    case "gallery":
      return <Art src="05_petal_fall.webp" object="object:gallery:petal-art" className="-left-16 top-[24%] z-0 w-[44%] opacity-24" />;
    case "countdown":
      return <Art src="08_minimal_divider.webp" object="object:countdown:theme-art" className="bottom-9 left-1/2 z-0 w-[72%] -translate-x-1/2 opacity-32" />;
    case "location":
      return <Art src="10_leaf_branch.webp" object="object:location:leaf-art" className="-left-14 bottom-6 z-0 w-[48%] opacity-22" />;
    case "rsvp":
      return <Art src="01_flower_cascade.webp" object="object:rsvp:flower-art" className="-right-20 -top-8 z-0 w-[52%] opacity-20" />;
    case "wishes":
      return <Art src="04_fabric_wave.webp" object="object:wishes:fabric-art" className="-left-24 bottom-0 z-0 w-[68%] opacity-16 mix-blend-multiply" />;
    case "gift":
      return <Art src="06_gold_curve_lines.webp" object="object:gift:theme-art" className="-left-16 top-[20%] z-0 w-[72%] opacity-24" />;
    case "closing":
      return <>
        <Art src="01_flower_cascade.webp" object="object:closing:flower-art" className="-left-16 -top-10 z-0 w-[50%] opacity-20" />
        <Art src="10_leaf_branch.webp" object="object:closing:leaf-art" className="-right-16 bottom-4 z-0 w-[46%] -scale-x-100 opacity-20" />
      </>;
    default:
      return null;
  }
}
