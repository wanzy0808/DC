export type InvitationTemplate = {
  key: string;
  name: string;
  description: string;
  previewImage: string;
  assetPath: string;
};

export const invitationTemplates: InvitationTemplate[] = [
  { key: "eternal-blossom", name: "Eternal Blossom", description: "Floral editorial, lembut dan romantis.", previewImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=900", assetPath: "/templates/eternal-blossom" },
  { key: "modern-maroon", name: "Modern Maroon", description: "Editorial modern dengan aksen maroon DC Wedding.", previewImage: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=900", assetPath: "/templates/modern-maroon" },
  { key: "garden-light", name: "Garden Light", description: "Botanical terang dengan nuansa garden wedding.", previewImage: "https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&q=80&w=900", assetPath: "/templates/garden-light" },
  { key: "midnight-romance", name: "Midnight Romance", description: "Dramatis, intimate, dan elegan untuk malam hari.", previewImage: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=900", assetPath: "/templates/midnight-romance" },
  { key: "classic-pearl", name: "Classic Pearl", description: "Clean classic dengan kesan timeless.", previewImage: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=900", assetPath: "/templates/classic-pearl" },
];

export function getInvitationTemplate(key: string) {
  const baseKey = key.split("::")[0];
  return invitationTemplates.find((template) => template.key === baseKey) ?? invitationTemplates[0];
}
