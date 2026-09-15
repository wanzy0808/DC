import { GradientButton } from "@/components/ui/gradient-button"

function Demo() {
  return (
    <div className="flex items-center gap-4">
      <GradientButton size="sm">Small</GradientButton>
      <GradientButton>Get Started</GradientButton>
      <GradientButton size="lg">Large</GradientButton>
    </div>
  )
}

export { Demo }
