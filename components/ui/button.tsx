"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export type ButtonSize = "xs" | "sm" | "default" | "lg" | "icon-xs" | "icon-sm" | "icon" | "icon-lg"

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean
  size?: ButtonSize
  /** Legacy API compatibility only. All values intentionally render identically. */
  variant?: string
}

const sizeClasses: Record<ButtonSize, string> = {
  xs: "h-8 rounded-[10px] px-3 text-xs",
  sm: "h-9 rounded-[10px] px-3.5 text-sm",
  default: "h-10 rounded-[10px] px-4 text-sm",
  lg: "h-11 rounded-[10px] px-5 text-sm",
  "icon-xs": "size-8 rounded-[10px]",
  "icon-sm": "size-9 rounded-[10px]",
  icon: "size-10 rounded-[10px]",
  "icon-lg": "size-11 rounded-[10px]",
}

const buttonBase =
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap border border-[#A65E69]/45 bg-[#C07A84] font-medium text-white shadow-[0_3px_8px_rgb(17_17_17_/_0.16),0_1px_0_rgb(255_255_255_/_0.18)_inset] transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-px hover:bg-[#A65E69] hover:shadow-[0_5px_12px_rgb(17_17_17_/_0.2),0_1px_0_rgb(255_255_255_/_0.2)_inset] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C07A84]/35 active:translate-y-0 active:shadow-[0_2px_5px_rgb(17_17_17_/_0.18)] disabled:pointer-events-none disabled:opacity-50 dark:border-[#D9A3AA]/45 dark:bg-[#C07A84] dark:text-black dark:hover:bg-[#D9A3AA] dark:focus-visible:ring-[#D9A3AA]/35"

export const buttonVariants = ({
  className,
  size = "default",
}: {
  className?: string
  variant?: string
  size?: ButtonSize
} = {}) => cn(className, buttonBase, sizeClasses[size])

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild = false, className, size = "default", type, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        {...props}
        ref={ref}
        {...(!asChild ? { type: type ?? "button" } : {})}
        className={buttonVariants({ className, size })}
      />
    )
  },
)

Button.displayName = "Button"

export { Button }
