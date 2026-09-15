import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import InvitationEditorPage from "@/components/InvitationStudio/InvitationEditorPage";

export default async function InvitationEditorRoute() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=%2Fdashboard%2Feditor");

  return <InvitationEditorPage />;
}
