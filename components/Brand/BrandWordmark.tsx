import type { HTMLAttributes } from "react";

export type BrandWordmarkSize = "public" | "dashboard" | "mobile";

type BrandWordmarkProps = HTMLAttributes<HTMLSpanElement> & {
  size?: BrandWordmarkSize;
  showTagline?: boolean;
};

const sizeClass: Record<BrandWordmarkSize, string> = {
  public: "w-[104px] sm:w-[128px] lg:w-[136px]",
  dashboard: "w-[104px]",
  mobile: "w-[84px]",
};

export default function BrandWordmark({
  size = "public",
  showTagline = false,
  className = "",
  ...props
}: BrandWordmarkProps) {
  return (
    <span className={`block min-w-0 text-primary ${className}`} {...props}>
      <span
        aria-hidden="true"
        className={`undara-brand-logo block ${sizeClass[size]}`}
      />
      <span className="sr-only">Undara</span>
      {showTagline && (
        <span className={`mt-1 block font-[family-name:var(--font-dc-mono)] uppercase tracking-[0.22em] text-foreground/60 ${size === "public" ? "text-[8px] sm:text-[9px] lg:text-[10px]" : "text-[8px]"}`}>
          Undangan & Acara
        </span>
      )}
    </span>
  );
}
