import * as React from "react"

import {
  GlowButton,
  glowButtonVariants,
  type GlowButtonProps,
} from "@/components/ui/glow-button"

/**
 * Compatibility wrapper for existing shadcn-style imports.
 *
 * DC Organizer has one application button visual language: GlowButton.
 * Legacy variant names remain accepted so existing callers keep compiling,
 * but they no longer create separate visual treatments.
 */
export type ButtonProps = GlowButtonProps & {
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "destructive"
    | "link"
    | "brand-gradient"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant: _variant, ...props }, ref) => (
    <GlowButton ref={ref} {...props} />
  ),
)
Button.displayName = "Button"

type ButtonVariant = NonNullable<ButtonProps["variant"]>
type ButtonSize = NonNullable<GlowButtonProps["size"]>

type ButtonVariantOptions = {
  className?: string
  variant?: ButtonVariant
  size?: ButtonSize
}

const buttonVariants = ({ className, size }: ButtonVariantOptions = {}) =>
  glowButtonVariants({ size, className })

export { Button, buttonVariants }
