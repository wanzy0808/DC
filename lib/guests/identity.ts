import { prisma } from "@/lib/prisma";

/**
 * Detect repeated guest entries within ONE event, across all entry points.
 * This is a suggestion/guard, not a unique identity: two people may share a
 * name/telephone. Never silently merge multiple matching rows.
 *
 * Compare common Indonesian WhatsApp spellings (08..., 628..., +628...)
 * without rewriting the number stored for display or sending messages.
 */
export function comparableGuestPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("0062")) return digits.slice(2);
  if (digits.startsWith("08")) return `62${digits.slice(1)}`;
  if (digits.startsWith("8")) return `62${digits}`;
  return digits;
}

export async function findGuestsByContact(
  invitationId: string,
  name: string,
  phone: string,
) {
  const comparablePhone = comparableGuestPhone(phone);
  if (!invitationId || !name.trim() || !comparablePhone) return [];

  const candidates = await prisma.guest.findMany({
    where: {
      invitationId,
      name: { equals: name.trim(), mode: "insensitive" },
      phone: { not: null },
    },
    select: {
      id: true,
      name: true,
      phone: true,
      personalToken: true,
      waBlastSelected: true,
      checkedIn: true,
      invitedPax: true,
      rsvpStatus: true,
      plusOnes: true,
    },
  });

  return candidates.filter(
    (guest) => guest.phone && comparableGuestPhone(guest.phone) === comparablePhone,
  );
}
