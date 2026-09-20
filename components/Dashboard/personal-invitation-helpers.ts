import type { PersonalInvitationEvent } from "@/components/Dashboard/personal-invitation-types";

export const PERSONAL_INVITATION_ROOT_DOMAIN =
  process.env.NEXT_PUBLIC_INVITATION_ROOT_DOMAIN || "dcwedding.com";

export function sortPersonalInvitationEvents(
  items: PersonalInvitationEvent[],
) {
  return [...items].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

export function buildPersonalInvitationPublicUrl(
  eventSlug: string,
  token: string,
) {
  if (!eventSlug || !token) return "";
  return `https://${eventSlug}.${PERSONAL_INVITATION_ROOT_DOMAIN}/p/${token}`;
}
