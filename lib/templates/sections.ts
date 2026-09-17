export type InvitationSectionKey = "rsvp" | "wishes" | "gift";

export type InvitationSections = Record<InvitationSectionKey, boolean>;

export const defaultInvitationSections: InvitationSections = {
  rsvp: true,
  wishes: true,
  gift: true,
};

const sectionOrder: InvitationSectionKey[] = ["rsvp", "wishes", "gift"];

export function parseInvitationSections(templateKey: string): InvitationSections {
  const sectionPart = templateKey
    .split("::")
    .find((part) => part.startsWith("sections="));

  if (!sectionPart) return { ...defaultInvitationSections };

  const enabled = new Set(
    sectionPart
      .slice("sections=".length)
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );

  return {
    rsvp: enabled.has("rsvp"),
    wishes: enabled.has("wishes"),
    gift: enabled.has("gift"),
  };
}

export function withInvitationSections(
  designKey: string,
  sections: InvitationSections,
) {
  const parts = designKey
    .split("::")
    .filter((part) => !part.startsWith("sections="));
  const enabled = sectionOrder.filter((key) => sections[key]);

  return `${parts.join("::")}::sections=${enabled.join(",")}`;
}
