"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { buttonVariants, type ButtonSize } from "./button-variants"

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean
  size?: ButtonSize
  /** Legacy API compatibility only. All values intentionally render identically. */
  variant?: string
}

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

export { Button, buttonVariants }
export type { ButtonSize } from "./button-variants"
