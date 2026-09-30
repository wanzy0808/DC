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

const botanicalNative: Record<string, TemplateNativeMotion> = {
  "heading:envelope": { animation: "fade", animationDuration: .7 },
  "object:envelope:date": { animation: "fade", animationDelay: .08 },
  "object:envelope:stationery-group": { animation: "fade", animationDuration: .8 },
  "object:cover:personOne-name": { animation: "rise", animationDuration: .85 },
  "object:cover:personTwo-name": { animation: "rise", animationDuration: .85, animationDelay: .1 },
  "object:cover:ampersand-symbol": { animation: "fade", animationDuration: .75, animationDelay: .1 },
  "object:cover:event-name": { animation: "rise", animationDuration: .85 },
  "object:cover:date": { animation: "fade", animationDelay: .16 },
  "object:cover:sprig-left": { animation: "reveal-up", animationDuration: .9, animationDelay: .12 },
  "object:cover:closing-copy": { animation: "fade", animationDelay: .18 },
  "heading:greeting": { animation: "rise" },
  "object:greeting:theme-leaf": { animation: "reveal-up", animationDuration: .9 },
  "heading:identity": { animation: "rise" },
  "object:identity:personOne-name": { animation: "slide-left", animationDuration: .8 },
  "object:identity:personTwo-name": { animation: "slide-right", animationDuration: .8, animationDelay: .07 },
  "object:identity:personOne-symbol": { animation: "reveal-up", animationDuration: .9 },
  "object:identity:personTwo-symbol": { animation: "reveal-up", animationDuration: .9, animationDelay: .08 },
  "object:identity:event-name": { animation: "rise" },
  "object:identity:theme-art": { animation: "reveal-up", animationDuration: .9 },
  "object:identity:our-story-heading": { animation: "rise" },
  "heading:event": { animation: "rise" },
  "object:event:theme-leaf": { animation: "reveal-up", animationDuration: .9 },
  "heading:dateTime": { animation: "rise" },
  "object:dateTime:panel": { animation: "fade", animationDelay: .08 },
  "heading:gallery": { animation: "rise" },
  "object:gallery:specimenOne-group": { animation: "tilt-in", animationDuration: .8 },
  "object:gallery:specimenTwo-group": { animation: "tilt-in", animationDuration: .8, animationDelay: .07 },
  "heading:countdown": { animation: "fade" },
  "heading:location": { animation: "rise" },
  "object:location:theme-leaf": { animation: "reveal-up", animationDuration: .9 },
  "heading:rsvp": { animation: "rise" },
  "heading:wishes": { animation: "rise" },
  "heading:gift": { animation: "rise" },
  "heading:closing": { animation: "rise" },
  "object:closing:theme-leaf": { animation: "reveal-up", animationDuration: .9 },
  "object:closing:names": { animation: "soft-scale", animationDuration: .8, animationDelay: .08 },
};

const nativeDefaults: Record<string, Record<string, TemplateNativeMotion>> = {
  serein: sereinNative,
  "botanical-ivory": botanicalNative,
};

export function templateHasDefaultMotion(template: string) {
  return Object.hasOwn(nativeDefaults, template);
}

export function templateNativeMotion(template: string) {
  return nativeDefaults[template] ?? {};
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
