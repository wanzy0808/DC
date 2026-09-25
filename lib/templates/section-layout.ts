import { invitationSectionItems, type InvitationSectionKey } from "@/lib/templates/sections";

export type InvitationSectionInstance = {
  id: string;
  key: InvitationSectionKey;
  hidden?: boolean;
};

export const invitationContentSectionKeys = invitationSectionItems
  .map((item) => item.key)
  .filter((key): key is InvitationSectionKey => key !== "envelope" && key !== "music");

const validKeys = new Set<InvitationSectionKey>(invitationContentSectionKeys);

export const defaultInvitationSectionLayout: InvitationSectionInstance[] =
  invitationContentSectionKeys.map((key) => ({ id: key, key }));

const cleanId = (value: unknown) =>
  typeof value === "string" && /^[a-zA-Z0-9_-]{1,64}$/.test(value) ? value : "";

export function sanitizeInvitationSectionLayout(value: unknown): InvitationSectionInstance[] {
  if (!Array.isArray(value)) return defaultInvitationSectionLayout.map((item) => ({ ...item }));
  const output: InvitationSectionInstance[] = [];
  const ids = new Set<string>();
  for (const raw of value.slice(0, 36)) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue;
    const source = raw as Record<string, unknown>;
    const id = cleanId(source.id);
    const key = source.key as InvitationSectionKey;
    if (!id || ids.has(id) || !validKeys.has(key)) continue;
    ids.add(id);
    output.push({ id, key, ...(source.hidden === true ? { hidden: true } : {}) });
  }
  return output;
}

export function parseInvitationSectionLayout(designKey: string): InvitationSectionInstance[] {
  const token = designKey.split("::").find((part) => part.startsWith("sectionLayout="));
  if (!token || token.length > 16000) return defaultInvitationSectionLayout.map((item) => ({ ...item }));
  try {
    return sanitizeInvitationSectionLayout(JSON.parse(decodeURIComponent(token.slice("sectionLayout=".length))));
  } catch {
    return defaultInvitationSectionLayout.map((item) => ({ ...item }));
  }
}

function isDefaultLayout(layout: InvitationSectionInstance[]) {
  if (layout.length !== defaultInvitationSectionLayout.length) return false;
  return layout.every((item, index) => {
    const baseline = defaultInvitationSectionLayout[index];
    return baseline && item.id === baseline.id && item.key === baseline.key && item.hidden !== true;
  });
}

export function withInvitationSectionLayout(designKey: string, layout: InvitationSectionInstance[]) {
  const base = designKey.split("::").filter((part) => !part.startsWith("sectionLayout=")).join("::");
  const normalized = sanitizeInvitationSectionLayout(layout);
  return isDefaultLayout(normalized)
    ? base
    : `${base}::sectionLayout=${encodeURIComponent(JSON.stringify(normalized))}`;
}

export function instancesForSection(
  layout: InvitationSectionInstance[],
  key: InvitationSectionKey,
) {
  return layout
    .map((instance, order) => ({ ...instance, order }))
    .filter((instance) => instance.key === key);
}
