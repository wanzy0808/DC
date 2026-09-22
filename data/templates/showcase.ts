import { invitationTemplates } from "@/lib/templates/catalog";

/**
 * The public gallery derives its built-in entries from the actual Studio catalog.
 * No standalone mock products, made-up serial numbers, or fabricated premium labels.
 */
const categories: Record<string, string> = {
  "romantic-rose": "Floral",
  "botanical-ivory": "Botanical",
  "eternal-blossom": "Floral",
  "modern-maroon": "Modern",
  "garden-light": "Botanical",
  "midnight-romance": "Modern",
  "classic-pearl": "Classic",
};

export const templateShowcaseItems = invitationTemplates.map((template) => ({
  ...template,
  category: categories[template.key] ?? "Lainnya",
  /** Only Romantic Rose currently uses its public renderer in the Studio canvas. */
  previewType: template.key === "romantic-rose" ? ("public" as const) : ("studio" as const),
}));

export type TemplateShowcaseItem = (typeof templateShowcaseItems)[number];

export const templateShowcaseCategories = [
  "Semua",
  ...Array.from(new Set(templateShowcaseItems.map((item) => item.category))),
];
