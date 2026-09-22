/**
 * DC Organizer global UI-control design contract.
 *
 * Use these classes for app-level fields, chips and custom dropdowns.
 * Button and Input primitives share the shape/outline tokens in globals.css.
 * Intentional exceptions: branded invitation-template artwork, navigation chrome,
 * native checkbox/radio, multi-line textareas and controls with explicit geometry.
 */
export const controlStyles = {
  input:
    "min-h-12 w-full rounded-[var(--dc-control-radius)] border border-primary/80 bg-background/75 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/50",
  filter:
    "min-h-11 rounded-[var(--dc-control-radius)] border border-primary/80 px-5 py-2 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
  trigger:
    "flex min-h-11 min-w-[155px] items-center justify-between gap-3 rounded-[var(--dc-control-radius)] border border-primary/80 bg-background/85 px-4 py-2 text-xs text-foreground shadow-sm transition hover:border-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
  menu:
    "absolute right-0 top-[calc(100%+8px)] z-30 w-52 overflow-hidden rounded-[var(--dc-control-menu-radius)] border border-primary/80 bg-background/95 p-2 shadow-[0_16px_36px_rgba(0,0,0,0.16)] backdrop-blur-md",
  option:
    "flex min-h-11 w-full items-center rounded-[var(--dc-control-radius)] border px-4 text-left text-xs transition hover:border-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
  cta:
    "mt-4 min-h-11 w-full rounded-[var(--dc-control-radius)] border-primary/80 text-sm focus-visible:ring-primary/60",
} as const;
