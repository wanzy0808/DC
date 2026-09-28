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
  xs: "h-8 rounded-[var(--undara-control-radius)] px-3 text-xs",
  sm: "h-9 rounded-[var(--undara-control-radius)] px-3.5 text-sm",
  default: "h-10 rounded-[var(--undara-control-radius)] px-4 text-sm",
  lg: "h-11 rounded-[var(--undara-control-radius)] px-5 text-sm",
  "icon-xs": "size-8 rounded-[var(--undara-control-radius)]",
  "icon-sm": "size-9 rounded-[var(--undara-control-radius)]",
  icon: "size-10 rounded-[var(--undara-control-radius)]",
  "icon-lg": "size-11 rounded-[var(--undara-control-radius)]",
}

const buttonBase =
  "undara-app-button inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap border border-primary bg-primary font-[family-name:var(--font-undara-body)] font-medium text-primary-foreground shadow-[0_3px_8px_rgb(58_32_32_/_0.16),0_1px_0_rgb(255_255_255_/_0.18)_inset] transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-px hover:bg-primary/90 hover:shadow-[0_5px_12px_rgb(58_32_32_/_0.20),0_1px_0_rgb(255_255_255_/_0.20)_inset] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 active:translate-y-0 active:bg-primary/85 active:shadow-[0_2px_5px_rgb(58_32_32_/_0.18)] disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none disabled:hover:translate-y-0 disabled:hover:bg-primary disabled:active:translate-y-0"

export const buttonVariants = ({
  className,
  size = "default",
}: {
  className?: string
  variant?: string
  size?: ButtonSize
} = {}) => cn(buttonBase, sizeClasses[size], className)
