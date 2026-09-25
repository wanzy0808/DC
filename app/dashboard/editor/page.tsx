import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import InvitationEditorPage from "@/components/InvitationStudio/InvitationEditorPage";

export default async function InvitationEditorRoute() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=%2Fdashboard%2Feditor");
  if (user.role === "OWNER") redirect("/owner/studio");
  if (user.role === "DESIGNER" || user.role === "EDITOR") redirect("/designer/studio");
  if (user.role === "ADMIN" || user.role === "FINANCE") redirect("/admin");

  return <InvitationEditorPage />;
}
