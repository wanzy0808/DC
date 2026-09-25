import { MAX_TEXT_MOTION_PARTS } from "@/lib/templates/motion-performance";
import type { InvitationTextAnimationUnit } from "@/lib/templates/asset-layers";

function inlineParts(text: string, unit: "word" | "character") {
  const characterCount = Array.from(text).filter((part) => !/\s/u.test(part)).length;
  const effectiveUnit = unit === "character" && characterCount > MAX_TEXT_MOTION_PARTS ? "word" : unit;
  const parts = effectiveUnit === "word" ? text.split(/(\s+)/u) : Array.from(text);
  const motionPartCount = parts.filter((part) => part && !/^\s+$/u.test(part)).length;
  if (motionPartCount > MAX_TEXT_MOTION_PARTS) return text;

  return parts.map((part, index) => {
    if (!part || /^\s+$/u.test(part)) return <span key={index}>{part}</span>;
    return (
      <span
        key={index}
        data-invitation-text-motion-part
        className="inline-block"
      >
        {part}
      </span>
    );
  });
}

export default function InvitationLayerTextContent({
  text,
  unit = "whole",
}: {
  text: string;
  unit?: InvitationTextAnimationUnit;
}) {
  if (unit === "word" || unit === "character") return <>{inlineParts(text, unit)}</>;

  if (unit === "line") {
    const lines = text.split("\n");
    if (lines.length > MAX_TEXT_MOTION_PARTS) return <>{text}</>;
    return (
      <>
        {lines.map((line, index) => (
          <span key={index} data-invitation-text-motion-part className="block min-h-[1em]">
            {line || "\u00A0"}
          </span>
        ))}
      </>
    );
  }

  return <>{text}</>;
}
