import type {
  DashboardEvent,
  EventGuestData,
} from "@/components/Dashboard/dashboard-types";

export function sortDashboardEvents(items: DashboardEvent[]) {
  return [...items].sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

export async function fetchEventGuestData(
  invitationId: string,
  fallbackError = "Data acara belum dapat dimuat.",
): Promise<EventGuestData> {
  if (!invitationId) return { guests: [], tables: [] };

  const response = await fetch(
    `/api/guests?invitationId=${encodeURIComponent(invitationId)}`,
    { cache: "no-store" },
  );
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || fallbackError);
  }

  return {
    guests: data?.guests ?? [],
    tables: data?.tables ?? [],
  };
}
