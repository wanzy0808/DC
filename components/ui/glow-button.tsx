"use client"

import React, { forwardRef, useState } from "react"
import { Slot } from "@radix-ui/react-slot"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string
  size?: "xs" | "sm" | "default" | "lg" | "icon-xs" | "icon-sm" | "icon" | "icon-lg"
  asChild?: boolean
}

export const glowButtonVariants = ({
  size = "default",
  className,
}: {
  size?: GlowButtonProps["size"]
  className?: string
} = {}) => {
  const sizeClass = {
    xs: "h-7 rounded-lg px-2.5 text-xs",
    sm: "h-8 rounded-lg px-3 text-xs",
    default: "h-10 rounded-xl px-4 text-sm",
    lg: "h-11 rounded-xl px-5 text-sm",
    "icon-xs": "size-7 rounded-lg",
    "icon-sm": "size-8 rounded-lg",
    icon: "size-10 rounded-xl",
    "icon-lg": "size-11 rounded-xl",
  }[size ?? "default"]

  return cn(
    "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap border font-medium transition-all duration-200",
    "bg-primary text-primary-foreground border-primary/35",
    "shadow-[0_4px_14px_rgb(192_122_132_/_0.16)]",
    "hover:-translate-y-0.5 hover:bg-[#A65E69] hover:border-[#A65E69]",
    "hover:shadow-[0_6px_18px_rgb(192_122_132_/_0.22)]",
    "focus-visible:outline-none focus-visible:border-[#A65E69] focus-visible:ring-2 focus-visible:ring-primary/25",
    "active:translate-y-px active:scale-[0.98]",
    "disabled:pointer-events-none disabled:opacity-50",
    sizeClass,
    className,
  )
}

export const GlowButton = forwardRef<HTMLButtonElement, GlowButtonProps>(
  (
    {
      asChild = false,
      label = "Generate",
      onClick,
      className,
      children,
      size = "default",
      type,
      ...props
    },
    ref,
  ) => {
    const [isClicked, setIsClicked] = useState(false)
    const Comp = asChild ? Slot : "button"

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      setIsClicked(true)
      window.setTimeout(() => setIsClicked(false), 200)
      onClick?.(event)
    }

    return (
      <Comp
        {...props}
        ref={ref}
        {...(!asChild ? { type: type ?? "button" } : {})}
        aria-label={props["aria-label"] ?? label}
        className={glowButtonVariants({ size, className })}
        onClick={handleClick}
        data-state={isClicked ? "clicked" : undefined}
      >
        {children ?? (
          <span className="flex items-center justify-center gap-1.5">
            {label}
            <Sparkles size={16} className="ml-0.5" />
          </span>
        )}
      </Comp>
    )
  },
)

GlowButton.displayName = "GlowButton"

export const Component = GlowButton
