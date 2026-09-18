import type { GuestManagementResponse } from "@/components/InvitationStudio/guest-management-types";

export async function readGuestManagementResponse(
  response: Response,
): Promise<GuestManagementResponse> {
  const body = await response.text();
  if (!body) return {};

  try {
    return JSON.parse(body) as GuestManagementResponse;
  } catch {
    return {
      error: `Server mengembalikan respons yang tidak valid (HTTP ${response.status}).`,
    };
  }
}
