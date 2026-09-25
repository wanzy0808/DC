import {
  editableInvitationCopyFields,
  type EditableInvitationCopyField,
} from "@/lib/templates/editable-copy";
import {
  isInvitationSectionAnimation,
  type InvitationSectionAnimation,
} from "@/lib/templates/section-animations";

export type EditableCopyMotionUnit = "whole" | "word" | "character" | "line";

export type EditableCopyMotion = {
  animation?: InvitationSectionAnimation;
  animationDuration?: number;
  animationDelay?: number;
  unit?: EditableCopyMotionUnit;
  stagger?: number;
};

export type EditableCopyMotions = Partial<Record<EditableInvitationCopyField, EditableCopyMotion>>;

const bounded = (value: unknown, min: number, max: number, fallback: number) =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.min(max, Math.max(min, value))
    : fallback;

function sanitizeMotion(value: unknown): EditableCopyMotion | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const source = value as Record<string, unknown>;
  if (!isInvitationSectionAnimation(source.animation) || source.animation === "none") return undefined;

  const motion: EditableCopyMotion = { animation: source.animation };
  if (source.animationDuration !== undefined) {
    motion.animationDuration = bounded(source.animationDuration, 0.2, 2.5, 0.7);
  }
  if (source.animationDelay !== undefined) {
    motion.animationDelay = bounded(source.animationDelay, 0, 2, 0);
  }
  if (source.unit === "word" || source.unit === "character" || source.unit === "line") {
    motion.unit = source.unit;
    if (source.stagger !== undefined) {
      motion.stagger = bounded(source.stagger, 0.01, 0.15, 0.05);
    }
  }
  return motion;
}

export function sanitizeEditableCopyMotions(value: unknown): EditableCopyMotions {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const source = value as Record<string, unknown>;
  const motions: EditableCopyMotions = {};

  for (const field of editableInvitationCopyFields) {
    const motion = sanitizeMotion(source[field]);
    if (motion) motions[field] = motion;
  }

  return motions;
}

export function parseEditableCopyMotions(designKey: string): EditableCopyMotions {
  const token = designKey.split("::").find((part) => part.startsWith("copyMotion="));
  if (!token || token.length > 12000) return {};
  try {
    return sanitizeEditableCopyMotions(
      JSON.parse(decodeURIComponent(token.slice("copyMotion=".length))),
    );
  } catch {
    return {};
  }
}

export function withEditableCopyMotions(
  designKey: string,
  motions: EditableCopyMotions,
): string {
  const base = designKey
    .split("::")
    .filter((part) => !part.startsWith("copyMotion="))
    .join("::");
  const normalized = sanitizeEditableCopyMotions(motions);
  return Object.keys(normalized).length
    ? `${base}::copyMotion=${encodeURIComponent(JSON.stringify(normalized))}`
    : base;
}
