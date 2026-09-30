import type { PhotoMotionMap, PhotoSlot } from "@/lib/templates/photo-slots";
import type { InvitationSectionStyles } from "@/lib/templates/section-styles";
import type { InvitationSectionAnimation } from "@/lib/templates/section-animations";

export type TemplateNativeMotion = { animation: InvitationSectionAnimation; animationDuration?: number; animationDelay?: number };

/** Theme presentation only; these defaults never overwrite a saved customer design. */
const sereinPhotos: PhotoMotionMap = {
  cover: { animation: "reveal-left", animationDuration: .9, animationDelay: .16 },
  personOne: { animation: "glide-left", animationDuration: .85 },
  personTwo: { animation: "glide-right", animationDuration: .85 },
  gallery: { animation: "rise", animationDuration: .75, animationStagger: .07 },
};

const sereinNative: Record<string, TemplateNativeMotion> = {
  "object:cover:personOne-name": { animation: "slide-left", animationDuration: .8 },
  "object:cover:personTwo-name": { animation: "slide-right", animationDuration: .8, animationDelay: .08 },
  "object:cover:ampersand-symbol": { animation: "rise", animationDuration: .65, animationDelay: .12 },
  "object:cover:event-name": { animation: "rise", animationDuration: .8 },
  "heading:greeting": { animation: "rise" },
  "heading:identity": { animation: "rise" },
  "heading:event": { animation: "slide-left" },
  "heading:dateTime": { animation: "rise" },
  "heading:gallery": { animation: "slide-left" },
  "heading:closing": { animation: "rise" },
  "object:closing:names": { animation: "rise", animationDelay: .08 },
};

export function templateNativeMotion(template: string) {
  return template === "serein" ? sereinNative : {};
}

export function templatePhotoMotion(template: string, overrides: PhotoMotionMap = {}, styles: InvitationSectionStyles = {}): PhotoMotionMap {
  if (template !== "serein") return overrides;
  const result: PhotoMotionMap = {};
  for (const slot of Object.keys(sereinPhotos) as PhotoSlot[]) {
    const section = slot === "cover" ? "cover" : slot === "gallery" ? "gallery" : "identity";
    const authoredSection = styles[section]?.animation !== undefined || Boolean(styles[section]?.timeline);
    const base = authoredSection ? {} : sereinPhotos[slot];
    result[slot] = { ...base, ...overrides[slot] };
  }
  return result;
}

export function templateNativeMotionForKey(template: string, key: string, styles: InvitationSectionStyles = {}) {
  // Instance suffixes keep the same default but retain independent persisted overrides.
  const parts = key.split(":");
  const sectionMotion = styles[parts[1] as keyof InvitationSectionStyles];
  if (sectionMotion?.animation !== undefined || sectionMotion?.timeline) return undefined;
  const base = parts[0] === "object" ? parts.slice(0, 3).join(":") : parts.slice(0, 2).join(":");
  return templateNativeMotion(template)[base];
}
