import { redirect } from "next/navigation";

/**
 * Legacy compatibility route.
 * Digital Invitation management now lives inside the canonical /dashboard workspace.
 */
export default function LegacyDigitalInvitationWorkspacePage() {
  redirect("/dashboard");
}
