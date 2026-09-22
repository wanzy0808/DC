import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StudioEntrySection from "@/components/DigitalInvitation/StudioEntrySection";

/**
 * Marketing CTA gateway. Studio needs an existing, configured event and its ID;
 * never open the editor without one or create an event as a side effect.
 */
export default async function StudioEntryPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=%2Fstudio");
  if (user.role === "OWNER") redirect("/owner");
  if (user.role === "ADMIN" || user.role === "FINANCE") redirect("/admin");
  if (user.role === "DESIGNER" || user.role === "EDITOR") redirect("/designer");

  const events = await prisma.invitation.findMany({
    where: { ownerId: user.id, eventConfigured: true },
    select: { id: true, title: true, type: true },
    orderBy: { updatedAt: "desc" },
  });

  if (events.length === 1) {
    const event = events[0];
    redirect(`/dashboard/editor?invitationId=${encodeURIComponent(event.id)}&type=${event.type}`);
  }

  return <StudioEntrySection events={events} />;
}
