import { redirect } from "next/navigation";

export default function DigitalInvitationWorkspacePage() {
  redirect("/dashboard?tab=invitation");
}
