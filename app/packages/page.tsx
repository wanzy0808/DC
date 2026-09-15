import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import PackageSelector from "@/components/Layout/PackageSelector";

export default async function PackagesPage({ searchParams }: { searchParams: Promise<{ package?: string }> }) {
  const user = await getCurrentUser();
  const params = await searchParams;
  const selectedPackage = params.package ?? "INVITATION_BASIC";
  if (!user) {
    const next = `/packages?package=${encodeURIComponent(selectedPackage)}`;
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }
  return <PackageSelector initialPackage={selectedPackage} />;
}
