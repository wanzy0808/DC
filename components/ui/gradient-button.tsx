"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const gradientButtonVariants = cva(
  [
    "inline-flex items-center justify-center shrink-0",
    "rounded-xl border border-white/35",
    "text-base leading-[19px] font-medium text-white",
    "font-[family-name:var(--font-fauna)]",
    "appearance-none cursor-pointer",
    "bg-gradient-to-r from-primary via-primary/95 to-[#F4E8EA] text-[#241D1F]",
    "shadow-[inset_0_1px_0_rgb(255_255_255_/_0.28),0_3px_0_rgb(166_94_105_/_0.24),0_8px_20px_rgb(192_122_132_/_0.14)]",
    "transition-[transform,box-shadow,background-color] duration-300 ease-out",
    "hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgb(255_255_255_/_0.34),0_4px_0_rgb(166_94_105_/_0.28),0_10px_24px_rgb(192_122_132_/_0.2)]",
    "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/30",
    "active:translate-y-px",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      size: {
        xs: "min-h-7 min-w-0 gap-1 px-2.5 text-xs leading-4",
        sm: "min-h-9 min-w-0 gap-1.5 px-3.5 text-sm leading-5",
        default: "min-h-11 min-w-[132px] gap-2 px-7 py-3",
        lg: "min-h-12 min-w-[148px] gap-2 px-9 py-3.5",
        "icon-xs": "size-7 min-h-7 min-w-7 p-0 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9 min-h-9 min-w-9 p-0 [&_svg:not([class*='size-'])]:size-3.5",
        icon: "size-11 min-h-11 min-w-11 p-0 [&_svg:not([class*='size-'])]:size-4",
        "icon-lg": "size-12 min-h-12 min-w-12 p-0 [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
)

export interface GradientButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof gradientButtonVariants> {
  asChild?: boolean
}

const GradientButton = React.forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ className, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        className={cn(gradientButtonVariants({ size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
GradientButton.displayName = "GradientButton"

export { GradientButton, gradientButtonVariants }
