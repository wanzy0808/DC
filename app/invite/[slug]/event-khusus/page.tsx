import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { slugifyEvent } from "@/lib/invitations/slug";

export default async function LegacySpecialInvitationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const baseInvitation = await prisma.invitation.findUnique({
    where: { slug },
    select: { id: true, ownerId: true },
  });
  if (!baseInvitation) notFound();

  const invitation = await prisma.invitation.findFirst({
    where: {
      ownerId: baseInvitation.ownerId,
      eventConfigured: true,
      id: { not: baseInvitation.id },
    },
    select: { title: true },
    orderBy: { createdAt: "asc" },
  });
  if (!invitation) notFound();

  redirect(`/${slugifyEvent(invitation.title || "event")}`);
}
