import RomanticRoseTemplate from "@/components/PublicInvitation/RomanticRoseTemplate";
import type { PersonalRsvpGuest } from "@/components/InvitationStudio/rsvp-types";
import UniversalInvitationTemplate from "@/components/PublicInvitation/UniversalInvitationTemplate";
import { InvitationLockedState, type PublicInvitationData } from "@/components/PublicInvitation/PublicInvitation";
import { invitationTemplates } from "@/lib/templates/catalog";
import { parseDesignKey } from "@/lib/templates/design";

/** One dispatcher for normal event URLs, event-specific URLs and personalized guest URLs. */
export default function PublicInvitationRenderer({ invitation, personalGuest }: { invitation: PublicInvitationData; personalGuest?: PersonalRsvpGuest }) {
  const key = parseDesignKey(invitation.templateKey).template;
  if (key === "romantic-rose") return <RomanticRoseTemplate invitation={invitation} personalGuest={personalGuest} />;
  // Studio only offers render-ready built-ins; reject unknown/unintegrated keys at the route.
  if (invitationTemplates.some((template) => template.key === key)) {
    return <UniversalInvitationTemplate invitation={invitation} templateKey={key} personalGuest={personalGuest} />;
  }
  return <InvitationLockedState />;
}
