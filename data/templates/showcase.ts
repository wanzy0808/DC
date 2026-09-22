import { invitationTemplates } from "@/lib/templates/catalog";

// One catalog manifest owns categories, capability and presentation presets.
export const templateShowcaseItems = invitationTemplates;
export type TemplateShowcaseItem = (typeof templateShowcaseItems)[number];
export const templateShowcaseCategories = [
  "Semua",
  ...Array.from(new Set(templateShowcaseItems.map((item) => item.category))),
];
