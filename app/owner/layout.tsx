import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function OwnerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "OWNER") redirect("/dashboard");
  return children;
}
