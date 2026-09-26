import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import InvitationEditorPage from "@/components/InvitationStudio/InvitationEditorPage";

export default async function OwnerTemplateStudioPage() {
  const user = await getCurrentUser();
  if (user?.role !== "OWNER") redirect("/dashboard");
  return <InvitationEditorPage mode="template" backHref="/owner" allowBlankCanvas={true} />;
}
