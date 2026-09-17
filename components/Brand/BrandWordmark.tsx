import type { HTMLAttributes } from "react";

export type BrandWordmarkSize = "public" | "dashboard" | "mobile";

type BrandWordmarkProps = HTMLAttributes<HTMLSpanElement> & {
  size?: BrandWordmarkSize;
  showTagline?: boolean;
};

const sizeClass: Record<BrandWordmarkSize, string> = {
  public: "text-2xl sm:text-3xl",
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
        <span className="mt-1 block font-[family-name:var(--font-dc-mono)] text-[8px] uppercase tracking-[0.22em] text-foreground/60">
          Your best consultant for wedding & event
        </span>
      )}
    </span>
  );
}
