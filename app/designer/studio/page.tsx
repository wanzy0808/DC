import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import InvitationEditorPage from "@/components/InvitationStudio/InvitationEditorPage";

export default async function DesignerTemplateStudioPage() {
  const user = await getCurrentUser();
  if (!user || !["DESIGNER", "EDITOR"].includes(user.role)) redirect("/dashboard");
  return <InvitationEditorPage mode="template" backHref="/designer" allowBlankCanvas={user.role === "DESIGNER"} />;
}
