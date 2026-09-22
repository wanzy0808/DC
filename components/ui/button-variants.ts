import { cn } from "@/lib/utils"

export type ButtonSize =
  | "xs"
  | "sm"
  | "default"
  | "lg"
  | "icon-xs"
  | "icon-sm"
  | "icon"
  | "icon-lg"

const sizeClasses: Record<ButtonSize, string> = {
  xs: "h-8 rounded-[var(--dc-control-radius)] px-3 text-xs",
  sm: "h-9 rounded-[var(--dc-control-radius)] px-3.5 text-sm",
  default: "h-10 rounded-[var(--dc-control-radius)] px-4 text-sm",
  lg: "h-11 rounded-[var(--dc-control-radius)] px-5 text-sm",
  "icon-xs": "size-8 rounded-[var(--dc-control-radius)]",
  "icon-sm": "size-9 rounded-[var(--dc-control-radius)]",
  icon: "size-10 rounded-[var(--dc-control-radius)]",
  "icon-lg": "size-11 rounded-[var(--dc-control-radius)]",
}

const buttonBase =
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap border border-primary/80 bg-[#C07A84] font-[family-name:var(--font-fauna)] font-medium text-white shadow-[0_3px_8px_rgb(17_17_17_/_0.16),0_1px_0_rgb(255_255_255_/_0.18)_inset] transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-px hover:bg-[#A65E69] hover:shadow-[0_5px_12px_rgb(17_17_17_/_0.2),0_1px_0_rgb(255_255_255_/_0.2)_inset] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C07A84]/50 active:translate-y-0 active:shadow-[0_2px_5px_rgb(17_17_17_/_0.18)] disabled:cursor-not-allowed disabled:opacity-100 disabled:shadow-none disabled:hover:translate-y-0 disabled:hover:bg-[#C07A84] disabled:active:translate-y-0 dark:border-primary/80 dark:bg-[#C07A84] dark:text-black dark:hover:bg-[#D9A3AA] dark:focus-visible:ring-[#D9A3AA]/50 dark:disabled:hover:bg-[#C07A84]"

export const buttonVariants = ({
  className,
  size = "default",
}: {
  className?: string
  variant?: string
  size?: ButtonSize
} = {}) => cn(buttonBase, sizeClasses[size], className)
