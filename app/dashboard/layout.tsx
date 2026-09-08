import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  if (!user) redirect("/login");
  if (user.role === "ADMIN" || user.role === "OWNER") redirect("/admin");

  return children;
}