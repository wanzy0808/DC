import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardLayout() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");
  redirect(user.role === "ADMIN" || user.role === "OWNER" ? "/admin" : "/dashboard");
}