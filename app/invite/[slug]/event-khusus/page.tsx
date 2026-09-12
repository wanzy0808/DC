import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { slugifyEvent } from "@/lib/invitation-slug";

export default async function LegacySpecialInvitationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mainInvitation = await prisma.invitation.findUnique({
    where: { slug },
    select: { ownerId: true },
  });
  if (!mainInvitation) notFound();

  const invitation = await prisma.invitation.findFirst({
    where: { ownerId: mainInvitation.ownerId, type: "ADAT_AKAD" },
    select: { title: true },
    orderBy: { createdAt: "asc" },
  });
  if (!invitation) notFound();

  redirect(`/${slugifyEvent(invitation.title || "event")}`);
}
