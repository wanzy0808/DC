"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const glowButtonVariants = cva(
  [
    "inline-flex items-center justify-center shrink-0",
    "rounded-xl border border-primary/35",
    "bg-primary text-primary-foreground",
    "font-[family-name:var(--font-dc-sans)] font-medium",
    "leading-[19px] appearance-none cursor-pointer",
    "shadow-[0_4px_14px_rgb(192_122_132_/_0.16)]",
    "transition-[transform,box-shadow,background-color,border-color] duration-200 ease-out",
    "hover:-translate-y-0.5 hover:bg-[#A65E69] hover:border-[#A65E69] hover:shadow-[0_6px_18px_rgb(192_122_132_/_0.22)]",
    "focus-visible:outline-none focus-visible:border-[#A65E69] focus-visible:ring-2 focus-visible:ring-primary/25",
    "active:translate-y-px active:scale-[0.98]",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      size: {
        xs: "min-h-7 min-w-0 gap-1 px-2.5 text-xs leading-4",
        sm: "min-h-9 min-w-0 gap-1.5 px-3.5 text-sm leading-5",
        default: "min-h-11 min-w-[132px] gap-2 px-7 py-3 text-base",
        lg: "min-h-12 min-w-[148px] gap-2 px-9 py-3.5 text-base",
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

export interface GlowButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glowButtonVariants> {
  asChild?: boolean
  label?: string
}

const GlowButton = React.forwardRef<HTMLButtonElement, GlowButtonProps>(
  ({ className, size, asChild = false, label, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        ref={ref}
        className={cn(glowButtonVariants({ size, className }))}
        aria-label={props["aria-label"] ?? label}
        {...props}
      >
        {children ?? label ?? "Generate"}
      </Comp>
    )
  },
)
GlowButton.displayName = "GlowButton"

const Component = GlowButton

export { Component, GlowButton, glowButtonVariants }
