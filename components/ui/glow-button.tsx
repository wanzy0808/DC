"use client"

import React, { forwardRef, useState } from "react"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string
}

export const GlowButton = forwardRef<HTMLButtonElement, GlowButtonProps>(
  ({ label = "Generate", onClick, className, children, ...props }, ref) => {
    const [isClicked, setIsClicked] = useState(false)

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      setIsClicked(true)
      window.setTimeout(() => setIsClicked(false), 200)
      onClick?.(event)
    }

    return (
      <button
        {...props}
        ref={ref}
        type={props.type ?? "button"}
        aria-label={props["aria-label"] ?? label}
        className={cn("glow-btn", className)}
        onClick={handleClick}
        data-state={isClicked ? "clicked" : undefined}
      >
        {children ?? (
          <span className="flex items-center justify-center gap-1.5">
            {label}
            <Sparkles size={16} className="ml-0.5" />
          </span>
        )}
      </button>
    )
  },
)

GlowButton.displayName = "GlowButton"

export const Component = GlowButton
