export type InvitationTemplate = {
  key: string;
  name: string;
  description: string;
  previewImage: string;
  assetPath: string;
};

// Add new designer templates here without creating a new dashboard or route.
export const invitationTemplates: InvitationTemplate[] = [
  {
    key: "eternal-blossom",
    name: "Eternal Blossom",
    description: "Floral editorial dengan warna hangat dan tipografi elegan.",
    previewImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=900",
    assetPath: "/templates/eternal-blossom",
  },
];

export function getInvitationTemplate(key: string) {
  return invitationTemplates.find((template) => template.key === key) ?? invitationTemplates[0];
}