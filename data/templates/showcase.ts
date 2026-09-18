export type TemplateShowcaseItem = {
  id: string;
  name: string;
  category: string;
  status: "Baru" | "Studio" | "Premium";
  image: string;
};

export const templateShowcaseItems: TemplateShowcaseItem[] = [
  { id: "167", name: "Tema 167", category: "Floral", status: "Baru", image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=88&w=900" },
  { id: "194", name: "Palembang Classic Artistry", category: "Adat", status: "Studio", image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=88&w=900" },
  { id: "166", name: "Tema 166", category: "Classic", status: "Baru", image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=88&w=900" },
  { id: "193", name: "Chinese Royal Radiance", category: "Adat", status: "Studio", image: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=88&w=900" },
  { id: "181", name: "Garden Bloom", category: "Floral", status: "Premium", image: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=88&w=900" },
  { id: "172", name: "Javanese Garden", category: "Adat", status: "Studio", image: "https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&q=88&w=900" },
  { id: "155", name: "Blue Serenity", category: "Minimal", status: "Premium", image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=88&w=900" },
  { id: "148", name: "Line Art Love", category: "Minimal", status: "Baru", image: "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?auto=format&fit=crop&q=88&w=900" },
];

export const templateShowcaseCategories = [
  "Semua",
  ...Array.from(new Set(templateShowcaseItems.map((item) => item.category))),
];
