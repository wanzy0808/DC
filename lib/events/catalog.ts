export const eventCategoryOptions = [
  { key: "WEDDING", label: "Pernikahan", nameMode: "couple" },
  { key: "SILVER_WEDDING", label: "Silver Wedding", nameMode: "couple" },
  { key: "GOLDEN_WEDDING", label: "Golden Wedding", nameMode: "couple" },
  { key: "BIRTHDAY", label: "Ulang Tahun", nameMode: "single" },
  { key: "BABY_SHOWER", label: "Baby Shower", nameMode: "single" },
  { key: "OTHER", label: "Event Lainnya", nameMode: "optional" },
] as const;

export type EventCategory = (typeof eventCategoryOptions)[number]["key"];
export type EventNameMode = (typeof eventCategoryOptions)[number]["nameMode"];

const categorySet = new Set<string>(eventCategoryOptions.map((item) => item.key));

export function isEventCategory(value: unknown): value is EventCategory {
  return typeof value === "string" && categorySet.has(value);
}

export function normalizeEventCategory(value: unknown): EventCategory {
  return isEventCategory(value) ? value : "OTHER";
}

export function getEventCategory(category: EventCategory) {
  return eventCategoryOptions.find((item) => item.key === category) ?? eventCategoryOptions[5];
}

export function buildEventTitle(
  category: EventCategory,
  primaryName: string,
  secondaryName: string,
  customTitle = "",
) {
  const primary = primaryName.trim();
  const secondary = secondaryName.trim();

  switch (category) {
    case "WEDDING":
      return primary && secondary ? `Pernikahan ${primary} & ${secondary}` : "Pernikahan";
    case "SILVER_WEDDING":
      return primary && secondary ? `Silver Wedding ${primary} & ${secondary}` : "Silver Wedding";
    case "GOLDEN_WEDDING":
      return primary && secondary ? `Golden Wedding ${primary} & ${secondary}` : "Golden Wedding";
    case "BIRTHDAY":
      return primary ? `Ulang Tahun ${primary}` : "Ulang Tahun";
    case "BABY_SHOWER":
      return primary ? `Baby Shower ${primary}` : "Baby Shower";
    case "OTHER":
      return customTitle.trim();
  }
}
