import type { HTMLAttributes } from "react";

export type BrandWordmarkSize = "public" | "dashboard" | "mobile";

type BrandWordmarkProps = HTMLAttributes<HTMLSpanElement> & {
  size?: BrandWordmarkSize;
  showTagline?: boolean;
};

const sizeClass: Record<BrandWordmarkSize, string> = {
  public: "w-[112px] sm:w-[140px] lg:w-[148px]",
  dashboard: "w-[112px]",
  mobile: "w-[90px]",
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
        <span className={`mt-1 block whitespace-nowrap font-[family-name:var(--font-undara-body)] font-medium tracking-[0.05em] text-foreground/65 ${size === "public" ? "text-[7px] sm:text-[9px] lg:text-[10px]" : "text-[8px]"}`}>
          Melangkah Bersama, Menuju Hari Penuh Makna
        </span>
      )}
    </span>
  );
}
