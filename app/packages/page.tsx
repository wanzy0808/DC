import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import PackageSelector from "@/components/Layout/PackageSelector";

export default async function PackagesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return <PackageSelector />;
}