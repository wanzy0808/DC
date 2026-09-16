import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import PackageSelector from "@/components/Layout/PackageSelector";

export default async function PackagesPage({
  searchParams,
}: {
  searchParams: Promise<{ package?: string; invitationId?: string }>;
}) {
  const user = await getCurrentUser();
  const params = await searchParams;
  const selectedPackage = params.package ?? "INVITATION_BASIC";
  const invitationId = params.invitationId?.trim() || "";

  if (!user) {
    const query = new URLSearchParams({ package: selectedPackage });
    if (invitationId) query.set("invitationId", invitationId);
    redirect(`/login?next=${encodeURIComponent(`/packages?${query.toString()}`)}`);
  }

  return (
    <PackageSelector
      initialPackage={selectedPackage}
      invitationId={invitationId || undefined}
    />
  );
}
