"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const gradientButtonVariants = cva(
  [
    "inline-flex items-center justify-center",
    "rounded-[14px] min-w-[132px] px-9 py-4",
    "text-base leading-[19px] font-[500] text-white",
    "font-sans font-bold",
    "appearance-none cursor-pointer",
    "bg-[#C07A84]",
    "shadow-[0_0_18px_rgba(192,122,132,0.28),0_0_36px_rgba(192,122,132,0.14)]",
    "transition-[background-color,box-shadow] duration-300 ease-out",
    "hover:bg-[#A65E69]",
    "hover:shadow-[0_0_22px_rgba(192,122,132,0.42),0_0_46px_rgba(192,122,132,0.20)]",
    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        default: "",
        variant: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export interface GradientButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof gradientButtonVariants> {
  asChild?: boolean
}

const GradientButton = React.forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        className={cn(gradientButtonVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
GradientButton.displayName = "GradientButton"

export { GradientButton, gradientButtonVariants }
