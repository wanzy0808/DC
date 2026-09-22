/** Shared visual contract for Login and Register. UI only; auth behavior stays in page/dialog code. */
export const authCardClass =
  "w-full rounded-[32px] border border-primary/35 bg-white bg-[radial-gradient(ellipse_at_50%_12%,rgba(217,163,170,0.10),transparent_72%)] text-[#21191c] shadow-[0_18px_75px_rgba(192,122,132,0.16)] backdrop-blur-xl dark:bg-white dark:text-[#21191c] dark:shadow-[0_18px_75px_rgba(192,122,132,0.18)]";

export const authHeaderClass =
  "space-y-3 text-center";

export const authEyebrowClass =
  "mx-auto block h-1 w-12 rounded-full bg-primary/70";

export const authTitleClass =
  "font-[family-name:var(--font-dc-heading)] text-3xl font-normal leading-tight text-primary sm:text-4xl";

export const authDescriptionClass =
  "mx-auto max-w-[34ch] font-[family-name:var(--font-dc-body)] text-sm leading-7 text-[#74646a] dark:text-[#74646a]";

export const authLabelClass =
  "block font-[family-name:var(--font-dc-body)] text-sm font-medium text-[#21191c] dark:text-[#21191c]";

export const authFieldClass =
  "mt-2 h-12 w-full rounded-[var(--dc-control-radius)] border border-primary/55 bg-white/95 px-5 font-[family-name:var(--font-dc-body)] text-sm text-[#21191c] outline-none transition-[border-color,box-shadow,background-color] placeholder:text-[#8b777e] hover:border-primary/75 focus-visible:border-primary focus-visible:bg-white focus-visible:ring-[3px] focus-visible:ring-primary/20 disabled:opacity-60 dark:bg-white/95 dark:text-[#21191c] dark:placeholder:text-[#8b777e] dark:focus-visible:bg-white";

export const authPasswordToggleClass =
  "absolute right-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full text-primary transition-colors hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export const authGoogleButtonClass =
  "h-12 w-full gap-3 rounded-[var(--dc-control-radius)] border border-primary/55 bg-white/95 font-[family-name:var(--font-dc-body)] text-sm font-semibold text-[#21191c] shadow-sm hover:border-primary hover:bg-[#fff3f5] hover:text-[#21191c] dark:border-primary/55 dark:bg-white/95 dark:text-[#21191c] dark:hover:bg-[#fff3f5] dark:hover:text-[#21191c]";

export const authSubmitButtonClass =
  "h-12 w-full rounded-[var(--dc-control-radius)] font-[family-name:var(--font-dc-body)] text-sm font-semibold shadow-sm";

export const authSeparatorClass =
  "font-[family-name:var(--font-dc-mono)] text-[10px] uppercase tracking-[0.16em] text-[#74646a] dark:text-[#74646a]";

export const authErrorClass =
  "rounded-[20px] border border-destructive/35 bg-destructive/10 px-4 py-3 font-[family-name:var(--font-dc-body)] text-sm leading-6 text-destructive";

export const authSecondaryLinkClass =
  "font-semibold text-primary underline decoration-primary/35 underline-offset-4 transition-colors hover:text-primary/75 hover:decoration-primary";

export const authChoiceBoxClass =
  "space-y-3 rounded-[22px] border border-primary/20 bg-[#fff7f8] p-4 font-[family-name:var(--font-dc-body)] text-xs text-[#74646a] dark:text-[#74646a]";
