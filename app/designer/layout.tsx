import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function DesignerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!["DESIGNER", "EDITOR"].includes(user.role)) redirect(user.role === "OWNER" ? "/owner" : user.role === "ADMIN" || user.role === "FINANCE" ? "/admin" : "/dashboard");
  return children;
}
