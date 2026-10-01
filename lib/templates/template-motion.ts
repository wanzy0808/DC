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

const blossomPhotos: PhotoMotionMap = {
  cover: { animation: "reveal-up", animationDuration: .85, animationDelay: .1 },
  personOne: { animation: "glide-left", animationDuration: .8 },
  personTwo: { animation: "glide-right", animationDuration: .8, animationDelay: .07 },
  gallery: { animation: "tilt-in", animationDuration: .75, animationStagger: .07 },
};

const modernMaroonPhotos: PhotoMotionMap = {
  cover: { animation: "reveal-left", animationDuration: .9, animationDelay: .08 },
  personOne: { animation: "glide-left", animationDuration: .82 },
  personTwo: { animation: "glide-right", animationDuration: .82, animationDelay: .08 },
  gallery: { animation: "tilt-in", animationDuration: .72, animationStagger: .055, parallax: .045 },
};

const photoDefaults: Record<string, PhotoMotionMap> = { serein: sereinPhotos, "eternal-blossom": blossomPhotos, "modern-maroon": modernMaroonPhotos };

export function templateHasDefaultPhotoMotion(template: string) {
  return Object.hasOwn(photoDefaults, template);
}

const blossomNative: Record<string, TemplateNativeMotion> = {
  "heading:envelope": { animation: "rise", animationDuration: .7 },
  "object:envelope:date": { animation: "fade", animationDelay: .07 },
  "object:envelope:flower": { animation: "glide-left", animationDuration: .85 },
  "object:envelope:flower-right": { animation: "glide-right", animationDuration: .85, animationDelay: .07 },
  "object:cover:flower-left": { animation: "glide-left", animationDuration: .9 },
  "object:cover:flower-right": { animation: "glide-right", animationDuration: .9, animationDelay: .07 },
  "object:cover:personOne-name": { animation: "slide-left", animationDuration: .8 },
  "object:cover:personTwo-name": { animation: "slide-right", animationDuration: .8, animationDelay: .07 },
  "object:cover:ampersand-symbol": { animation: "fade", animationDelay: .07 },
  "object:cover:event-name": { animation: "rise", animationDuration: .8 },
  "object:cover:date": { animation: "rise", animationDelay: .14 },
  "heading:greeting": { animation: "rise" },
  "object:greeting:flower-art": { animation: "soft-scale", animationDuration: .8 },
  "heading:identity": { animation: "rise" },
  "object:identity:personOne-name": { animation: "slide-left" },
  "object:identity:personTwo-name": { animation: "slide-right", animationDelay: .07 },
  "heading:event": { animation: "slide-left" },
  "heading:dateTime": { animation: "rise" },
  "heading:gallery": { animation: "slide-left" },
  "heading:countdown": { animation: "fade" },
  "heading:location": { animation: "rise" },
  "heading:rsvp": { animation: "rise" },
  "heading:wishes": { animation: "rise" },
  "heading:gift": { animation: "rise" },
  "heading:closing": { animation: "rise" },
  "object:closing:flower-art": { animation: "soft-scale", animationDuration: .85 },
  "object:closing:names": { animation: "rise", animationDelay: .07 },
};

const modernMaroonNative: Record<string, TemplateNativeMotion> = {
  "object:envelope:background-art": { animation: "fade", animationDuration: .8 },
  "object:envelope:fabric-art": { animation: "glide-right", animationDuration: .9, animationDelay: .08 },
  "object:envelope:card-stage": { animation: "rise", animationDuration: .86, animationDelay: .1 },
  "object:envelope:monogram": { animation: "soft-scale", animationDuration: .72 },
  "object:cover:background-art": { animation: "fade", animationDuration: .8 },
  "object:cover:gold-art": { animation: "reveal-left", animationDuration: .9, animationDelay: .04 },
  "object:cover:flower-art": { animation: "glide-left", animationDuration: .9, animationDelay: .08 },
  "object:cover:monogram": { animation: "soft-scale", animationDuration: .75 },
  "object:cover:media-group": { animation: "reveal-left", animationDuration: .92, animationDelay: .06 },
  "object:cover:copy-panel": { animation: "rise", animationDuration: .82, animationDelay: .12 },
  "heading:greeting": { animation: "slide-left", animationDuration: .72 },
  "object:greeting:copy-group": { animation: "glide-right", animationDuration: .82, animationDelay: .08 },
  "object:greeting:flourish": { animation: "reveal-left", animationDuration: .8, animationDelay: .12 },
  "heading:identity": { animation: "rise", animationDuration: .7 },
  "object:identity:personOne-group": { animation: "glide-left", animationDuration: .86 },
  "object:identity:personTwo-group": { animation: "glide-right", animationDuration: .86, animationDelay: .09 },
  "heading:event": { animation: "slide-left", animationDuration: .72 },
  "object:event:details-group": { animation: "rise", animationDuration: .8, animationDelay: .08 },
  "heading:dateTime": { animation: "fade", animationDuration: .7 },
  "object:dateTime:panel": { animation: "reveal-up", animationDuration: .88, animationDelay: .07 },
  "heading:gallery": { animation: "slide-left", animationDuration: .7 },
  "object:gallery:flourish": { animation: "reveal-left", animationDuration: .8 },
  "heading:countdown": { animation: "fade", animationDuration: .65 },
  "object:countdown:grid": { animation: "rise", animationDuration: .72, animationDelay: .06 },
  "heading:location": { animation: "slide-left", animationDuration: .72 },
  "object:location:details-group": { animation: "glide-right", animationDuration: .82, animationDelay: .08 },
  "heading:rsvp": { animation: "rise", animationDuration: .72 },
  "heading:wishes": { animation: "slide-left", animationDuration: .72 },
  "heading:gift": { animation: "fade", animationDuration: .7 },
  "object:gift:panel": { animation: "reveal-up", animationDuration: .84, animationDelay: .08 },
  "heading:closing": { animation: "rise", animationDuration: .74 },
  "object:closing:copy-group": { animation: "glide-right", animationDuration: .86, animationDelay: .07 },
  "object:closing:flourish": { animation: "reveal-left", animationDuration: .8, animationDelay: .11 },
  "object:closing:names": { animation: "soft-scale", animationDuration: .78, animationDelay: .13 },
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
  "eternal-blossom": blossomNative,
  "modern-maroon": modernMaroonNative,
};

export function templateHasDefaultMotion(template: string) {
  return Object.hasOwn(nativeDefaults, template);
}

export function templateNativeMotion(template: string) {
  return nativeDefaults[template] ?? {};
}

export function templatePhotoMotion(template: string, overrides: PhotoMotionMap = {}, styles: InvitationSectionStyles = {}): PhotoMotionMap {
  const defaults = photoDefaults[template];
  if (!defaults) return overrides;
  const result: PhotoMotionMap = {};
  for (const slot of Object.keys(defaults) as PhotoSlot[]) {
    const section = slot === "cover" ? "cover" : slot === "gallery" ? "gallery" : "identity";
    const authoredSection = styles[section]?.animation !== undefined || Boolean(styles[section]?.timeline);
    const base = authoredSection ? {} : defaults[slot];
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
