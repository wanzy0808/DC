export const sectionAnimationPresets = [
  { key: "fade", group: "elegant", labelId: "Fade lembut", labelEn: "Soft fade", duration: 0.7, easing: "cubic-bezier(.2,.7,.2,1)" },
  { key: "rise", group: "elegant", labelId: "Naik lembut", labelEn: "Soft rise", duration: 0.75, easing: "cubic-bezier(.2,.8,.2,1)" },
  { key: "blur-in", group: "elegant", labelId: "Blur masuk", labelEn: "Blur in", duration: 0.85, easing: "cubic-bezier(.2,.7,.2,1)" },
  { key: "cinematic", group: "elegant", labelId: "Cinematic", labelEn: "Cinematic", duration: 1.05, easing: "cubic-bezier(.16,1,.3,1)" },
  { key: "reveal-up", group: "elegant", labelId: "Reveal ke atas", labelEn: "Reveal up", duration: 0.9, easing: "cubic-bezier(.16,1,.3,1)" },

  { key: "slide-left", group: "editorial", labelId: "Geser dari kiri", labelEn: "Slide from left", duration: 0.7, easing: "cubic-bezier(.2,.7,.2,1)" },
  { key: "slide-right", group: "editorial", labelId: "Geser dari kanan", labelEn: "Slide from right", duration: 0.7, easing: "cubic-bezier(.2,.7,.2,1)" },
  { key: "reveal-left", group: "editorial", labelId: "Reveal dari kiri", labelEn: "Reveal from left", duration: 0.85, easing: "cubic-bezier(.16,1,.3,1)" },
  { key: "drift-up", group: "editorial", labelId: "Drift ke atas", labelEn: "Drift up", duration: 1.0, easing: "cubic-bezier(.16,1,.3,1)" },

  { key: "zoom", group: "dramatic", labelId: "Zoom masuk", labelEn: "Zoom in", duration: 0.75, easing: "cubic-bezier(.2,.8,.2,1)" },
  { key: "zoom-out", group: "dramatic", labelId: "Zoom keluar", labelEn: "Zoom out", duration: 0.85, easing: "cubic-bezier(.16,1,.3,1)" },
  { key: "flip-up", group: "dramatic", labelId: "Flip ke atas", labelEn: "Flip up", duration: 0.9, easing: "cubic-bezier(.16,1,.3,1)" },
  { key: "tilt-in", group: "dramatic", labelId: "Tilt masuk", labelEn: "Tilt in", duration: 0.8, easing: "cubic-bezier(.2,.8,.2,1)" },

  { key: "float-in", group: "playful", labelId: "Melayang masuk", labelEn: "Float in", duration: 1.05, easing: "cubic-bezier(.22,1,.36,1)" },
  { key: "soft-bounce", group: "playful", labelId: "Bounce lembut", labelEn: "Soft bounce", duration: 0.95, easing: "cubic-bezier(.34,1.56,.64,1)" },
  { key: "swing-in", group: "playful", labelId: "Swing masuk", labelEn: "Swing in", duration: 0.9, easing: "cubic-bezier(.22,1,.36,1)" },
] as const;

export type InvitationSectionAnimation = "none" | (typeof sectionAnimationPresets)[number]["key"];
export type SectionAnimationPreset = (typeof sectionAnimationPresets)[number];
export type SectionAnimationGroup = SectionAnimationPreset["group"];

export const sectionAnimationGroups: Array<{
  key: SectionAnimationGroup;
  labelId: string;
  labelEn: string;
}> = [
  { key: "elegant", labelId: "Elegant", labelEn: "Elegant" },
  { key: "editorial", labelId: "Editorial", labelEn: "Editorial" },
  { key: "dramatic", labelId: "Dramatic", labelEn: "Dramatic" },
  { key: "playful", labelId: "Playful", labelEn: "Playful" },
];

const presetMap = new Map(sectionAnimationPresets.map((preset) => [preset.key, preset]));

export function isInvitationSectionAnimation(value: unknown): value is InvitationSectionAnimation {
  return value === "none" || presetMap.has(value as SectionAnimationPreset["key"]);
}

export function getSectionAnimationPreset(
  value: InvitationSectionAnimation | undefined,
): SectionAnimationPreset | null {
  if (!value || value === "none") return null;
  return presetMap.get(value as SectionAnimationPreset["key"]) ?? null;
}

export function sectionAnimationKeyframes(animation: InvitationSectionAnimation): Keyframe[] | null {
  switch (animation) {
    case "fade":
      return [{ opacity: 0 }, { opacity: 1 }];
    case "rise":
      return [{ opacity: 0, transform: "translateY(28px)" }, { opacity: 1, transform: "translateY(0)" }];
    case "blur-in":
      return [{ opacity: 0, filter: "blur(12px)", transform: "translateY(12px)" }, { opacity: 1, filter: "blur(0)", transform: "translateY(0)" }];
    case "cinematic":
      return [{ opacity: 0, filter: "blur(8px)", transform: "scale(1.035)" }, { opacity: 1, filter: "blur(0)", transform: "scale(1)" }];
    case "reveal-up":
      return [{ opacity: 0, clipPath: "inset(100% 0 0 0)", transform: "translateY(18px)" }, { opacity: 1, clipPath: "inset(0 0 0 0)", transform: "translateY(0)" }];
    case "slide-left":
      return [{ opacity: 0, transform: "translateX(-36px)" }, { opacity: 1, transform: "translateX(0)" }];
    case "slide-right":
      return [{ opacity: 0, transform: "translateX(36px)" }, { opacity: 1, transform: "translateX(0)" }];
    case "reveal-left":
      return [{ opacity: 0, clipPath: "inset(0 100% 0 0)", transform: "translateX(-18px)" }, { opacity: 1, clipPath: "inset(0 0 0 0)", transform: "translateX(0)" }];
    case "drift-up":
      return [{ opacity: 0, transform: "translateY(52px) scale(.99)" }, { opacity: 1, transform: "translateY(0) scale(1)" }];
    case "zoom":
      return [{ opacity: 0, transform: "scale(.94)" }, { opacity: 1, transform: "scale(1)" }];
    case "zoom-out":
      return [{ opacity: 0, transform: "scale(1.07)" }, { opacity: 1, transform: "scale(1)" }];
    case "flip-up":
      return [{ opacity: 0, transform: "perspective(900px) rotateX(12deg) translateY(20px)", transformOrigin: "50% 100%" }, { opacity: 1, transform: "perspective(900px) rotateX(0deg) translateY(0)", transformOrigin: "50% 100%" }];
    case "tilt-in":
      return [{ opacity: 0, transform: "rotate(-2.5deg) scale(.97) translateY(18px)" }, { opacity: 1, transform: "rotate(0deg) scale(1) translateY(0)" }];
    case "float-in":
      return [{ opacity: 0, transform: "translateY(38px) scale(.98)" }, { opacity: 0.72, transform: "translateY(-5px) scale(1.005)", offset: 0.78 }, { opacity: 1, transform: "translateY(0) scale(1)" }];
    case "soft-bounce":
      return [{ opacity: 0, transform: "translateY(30px) scale(.96)" }, { opacity: 1, transform: "translateY(-4px) scale(1.01)", offset: 0.72 }, { opacity: 1, transform: "translateY(0) scale(1)" }];
    case "swing-in":
      return [{ opacity: 0, transform: "rotate(-3deg) translateY(24px) scale(.98)", transformOrigin: "50% 0%" }, { opacity: 1, transform: "rotate(.5deg) translateY(0) scale(1)", offset: 0.8 }, { opacity: 1, transform: "rotate(0deg) translateY(0) scale(1)" }];
    case "none":
      return null;
  }
}
