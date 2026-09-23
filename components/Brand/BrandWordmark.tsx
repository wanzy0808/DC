import type { HTMLAttributes } from "react";

export type BrandWordmarkSize = "public" | "landing" | "dashboard" | "mobile";

type BrandWordmarkProps = HTMLAttributes<HTMLSpanElement> & {
  size?: BrandWordmarkSize;
  showTagline?: boolean;
};

const sizeClass: Record<BrandWordmarkSize, string> = {
  public: "text-2xl sm:text-3xl",
  landing: "text-2xl sm:text-[34px] lg:text-[36px]",
  dashboard: "text-xl",
  mobile: "text-base",
};

export default function BrandWordmark({
  size = "public",
  showTagline = false,
  className = "",
  ...props
}: BrandWordmarkProps) {
  return (
    <span className={`block min-w-0 ${className}`} {...props}>
      <span
        className={`block font-[family-name:var(--font-dc-heading)] font-bold leading-none tracking-[0.12em] text-primary ${sizeClass[size]}`}
      >
        DC Organizer
      </span>
      {showTagline && (
        <span className={`mt-1 block font-[family-name:var(--font-dc-mono)] uppercase text-foreground/60 ${size === "landing" ? "text-[8px] tracking-[0.22em] sm:text-[9px] lg:text-[10px]" : "text-[8px] tracking-[0.22em]"}`}>
          Your best consultant for wedding & event
        </span>
      )}
    </span>
  );
}
