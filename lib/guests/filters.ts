export type GuestLabels = {
  category?: string | null;
  tags?: string[];
};

export function matchesGuestLabels(
  guest: GuestLabels,
  category: string,
  tag: string,
) {
  return (
    (!category || guest.category === category) &&
    (!tag || Boolean(guest.tags?.includes(tag)))
  );
}
