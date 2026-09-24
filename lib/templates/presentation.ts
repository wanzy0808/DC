/** Keep custom palette text readable on both light and dark surfaces. */
function luminance(hex: string) {
  const channels = hex.replace("#", "").match(/.{2}/g)?.map((part) => {
    const value = parseInt(part, 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  }) ?? [0, 0, 0];
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}
export function contrastRatio(a: string, b: string) {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + 0.05) / (values[1] + 0.05);
}
export function readableInk(background: string, preferred: string) {
  if (contrastRatio(background, preferred) >= 4.5) return preferred;
  return contrastRatio(background, "#ffffff") > contrastRatio(background, "#111111") ? "#ffffff" : "#111111";
}

/** next/font exposes generated family names through CSS variables. */
export function invitationFontFamily(family: string) {
  if (family === "Cinzel") return "var(--font-dc-heading)";
  if (family === "Fauna One") return "var(--font-dc-sans)";
  return family;
}
