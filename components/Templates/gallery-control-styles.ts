/**
 * Shared, gallery-scoped Rose pill control language.
 * Apply to search, filters and custom dropdowns in /template-design.
 * CTA continues to render through the canonical <Button> primitive.
 * Do not apply these styles to landing/navbar or unrelated dashboard controls.
 */
export const galleryControlStyles = {
  field:
    "min-h-12 w-full rounded-full border border-primary/80 bg-background/75 py-3 pl-10 pr-5 text-sm shadow-sm backdrop-blur-md outline-none transition hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/50",
  filter:
    "min-h-11 rounded-full border border-primary/70 px-5 py-2 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
  trigger:
    "flex min-h-11 min-w-[155px] items-center justify-between gap-3 rounded-full border border-primary/80 bg-background/85 px-4 py-2 text-xs text-foreground shadow-sm transition hover:border-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
  menu:
    "absolute right-0 top-[calc(100%+8px)] z-30 w-52 overflow-hidden rounded-[32px] border border-primary/80 bg-background/95 p-2 shadow-[0_16px_36px_rgba(0,0,0,0.16)] backdrop-blur-md",
  option:
    "flex min-h-11 w-full items-center rounded-full border px-4 text-left text-xs transition hover:border-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
  cta:
    "mt-4 min-h-11 w-full rounded-full border-primary/80 text-sm focus-visible:ring-primary/60",
} as const;
