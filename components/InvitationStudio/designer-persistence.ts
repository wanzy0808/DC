import type { InvitationDesignerInvitation } from "@/components/InvitationStudio/designer-types";

type StudioFetcher = typeof fetch;

export type StudioInvitationLegacyType = "WEDDING" | "ADAT_AKAD";

export type StudioTemplateCreateInput = {
  designKey: string;
  name: string;
  tags: string[];
  previewUrl?: string | null;
  category: string;
  description: string;
  usesPhotos: boolean;
  musicUrl: string;
};

export type StudioTemplateCreateResult = {
  templateNo: string | number;
};

export function makeStudioSavedState(
  designKey: string,
  musicUrl: string,
  eventTag: string,
  dressCode: string,
) {
  return JSON.stringify([designKey, musicUrl, eventTag, dressCode]);
}

export function makeStudioServerRevision(
  invitation: Pick<InvitationDesignerInvitation, "templateKey" | "musicUrl" | "weddingHashtag" | "dressCode">,
) {
  return JSON.stringify([
    invitation.templateKey || "",
    invitation.musicUrl || "",
    invitation.weddingHashtag || "",
    invitation.dressCode || "",
  ]);
}

export async function loadStudioInvitation(
  invitationId: string,
  legacyType: StudioInvitationLegacyType,
  fetcher: StudioFetcher = fetch,
): Promise<InvitationDesignerInvitation> {
  const query = `?id=${encodeURIComponent(invitationId)}&type=${legacyType}`;
  const response = await fetcher(`/api/invitations${query}`, { cache: "no-store" });
  const data = await response.json();

  if (!response.ok || !data.invitation) {
    throw new Error(data.error || "Undangan belum dapat dimuat.");
  }

  return data.invitation as InvitationDesignerInvitation;
}

export async function saveStudioInvitation(
  invitation: InvitationDesignerInvitation,
  designKey: string,
  musicUrl: string,
  eventTag: string,
  dressCode: string,
  fetcher: StudioFetcher = fetch,
): Promise<InvitationDesignerInvitation> {
  const response = await fetcher("/api/invitations", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: invitation.id,
      eventCategory: invitation.eventCategory,
      templateKey: designKey,
      musicUrl,
      weddingHashtag: eventTag,
      dressCode,
    }),
  });
  const data = await response.json();

  if (!response.ok || !data.invitation) {
    throw new Error(data.error || "Gagal menyimpan.");
  }

  return data.invitation as InvitationDesignerInvitation;
}

export async function createStudioTemplate(
  input: StudioTemplateCreateInput,
  fetcher: StudioFetcher = fetch,
): Promise<StudioTemplateCreateResult> {
  const response = await fetcher("/api/designer/templates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await response.json();

  if (!response.ok || !data.template) {
    throw new Error(data.error || "Template belum dapat disimpan.");
  }

  return {
    templateNo: data.template.templateNo,
  };
}

export async function uploadStudioAsset(
  invitationId: string,
  assetType: "IMAGE" | "AUDIO",
  file: File,
  fetcher: StudioFetcher = fetch,
): Promise<InvitationDesignerInvitation["assets"][number]> {
  const formData = new FormData();
  formData.append("invitationId", invitationId);
  formData.append("type", assetType);
  formData.append("file", file);

  const response = await fetcher("/api/invitations/assets/upload", {
    method: "POST",
    body: formData,
  });
  const data = await response.json();

  if (!response.ok || !data.asset) {
    throw new Error(data.error || "Upload gagal.");
  }

  return data.asset as InvitationDesignerInvitation["assets"][number];
}

export async function deleteStudioAsset(
  assetId: string,
  fetcher: StudioFetcher = fetch,
): Promise<void> {
  const response = await fetcher(
    `/api/invitations/assets/${encodeURIComponent(assetId)}`,
    { method: "DELETE" },
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Musik belum dapat dihapus.");
  }
}

