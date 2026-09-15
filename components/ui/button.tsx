import * as React from "react"

import {
  GradientButton,
  gradientButtonVariants,
  type GradientButtonProps,
} from "@/components/ui/gradient-button"

/**
 * Compatibility wrapper for existing imports.
 *
 * New code should import GradientButton directly. All visual button rendering
 * now goes through the single GradientButton primitive; legacy variant names
 * are intentionally ignored so the application has one visual variant and
 * size remains the only styling axis.
 */
export type ButtonProps = GradientButtonProps & {
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
    <GradientButton ref={ref} {...props} />
  ),
)
Button.displayName = "Button"

type ButtonVariant = NonNullable<ButtonProps["variant"]>
type ButtonSize = NonNullable<GradientButtonProps["size"]>

type ButtonVariantOptions = {
  className?: string
  variant?: ButtonVariant
  size?: ButtonSize
}

const buttonVariants = ({ className, size }: ButtonVariantOptions = {}) =>
  gradientButtonVariants({ size, className })

export { Button, buttonVariants }
