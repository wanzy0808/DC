import type { InvitationSectionKey } from "@/lib/templates/sections";

export const premiumSectionTimelinePresets = [
  {
    key: "romantic-cascade",
    labelId: "Romantic cascade",
    labelEn: "Romantic cascade",
    duration: 0.82,
    stagger: 0.11,
    ease: "power3.out",
  },
  {
    key: "editorial-sequence",
    labelId: "Editorial sequence",
    labelEn: "Editorial sequence",
    duration: 0.68,
    stagger: 0.085,
    ease: "power2.out",
  },
  {
    key: "luxe-cinematic",
    labelId: "Luxe cinematic",
    labelEn: "Luxe cinematic",
    duration: 0.95,
    stagger: 0.13,
    ease: "power4.out",
  },
  {
    key: "paper-story",
    labelId: "Paper story",
    labelEn: "Paper story",
    duration: 0.76,
    stagger: 0.1,
    ease: "power2.out",
  },
] as const;

export type InvitationPremiumTimeline = (typeof premiumSectionTimelinePresets)[number]["key"];
export type PremiumSectionTimelinePreset = (typeof premiumSectionTimelinePresets)[number];

const timelineMap = new Map(premiumSectionTimelinePresets.map((preset) => [preset.key, preset]));

export function isInvitationPremiumTimeline(value: unknown): value is InvitationPremiumTimeline {
  return timelineMap.has(value as InvitationPremiumTimeline);
}

export function getPremiumSectionTimelinePreset(
  value: InvitationPremiumTimeline | undefined,
): PremiumSectionTimelinePreset | null {
  return value ? timelineMap.get(value) ?? null : null;
}

/** Functional sections keep their interaction path simple; premium timelines focus on storytelling sections. */
export const premiumTimelineSectionKeys: ReadonlySet<InvitationSectionKey> = new Set([
  "cover",
  "greeting",
  "identity",
  "event",
  "dateTime",
  "gallery",
  "closing",
]);
