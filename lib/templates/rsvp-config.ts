export type RsvpEventOption = "ceremony" | "reception";

export type RsvpCustomField = {
  id: string;
  label: string;
  required: boolean;
};

export type InvitationRsvpConfig = {
  ceremony: boolean;
  reception: boolean;
  attendAll: boolean;
  customFields: RsvpCustomField[];
};

export const MAX_RSVP_CUSTOM_FIELDS = 5;

export const defaultInvitationRsvpConfig: InvitationRsvpConfig = {
  ceremony: true,
  reception: true,
  attendAll: true,
  customFields: [],
};

const cleanId = (value: unknown) =>
  typeof value === "string" && /^[a-zA-Z0-9_-]{1,40}$/.test(value) ? value : "";

const cleanLabel = (value: unknown) =>
  typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, 60) : "";

export function sanitizeInvitationRsvpConfig(value: unknown): InvitationRsvpConfig {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { ...defaultInvitationRsvpConfig, customFields: [] };
  const source = value as Record<string, unknown>;
  const customFields = Array.isArray(source.customFields)
    ? source.customFields.slice(0, MAX_RSVP_CUSTOM_FIELDS).flatMap((raw) => {
        if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
        const field = raw as Record<string, unknown>;
        const id = cleanId(field.id);
        const label = cleanLabel(field.label);
        if (!id || !label) return [];
        return [{ id, label, required: field.required === true }];
      })
    : [];
  const unique = customFields.filter((field, index) => customFields.findIndex((item) => item.id === field.id) === index);
  return {
    ceremony: source.ceremony !== false,
    reception: source.reception !== false,
    attendAll: source.attendAll !== false,
    customFields: unique,
  };
}

export function parseInvitationRsvpConfig(designKey: string): InvitationRsvpConfig {
  const token = designKey.split("::").find((part) => part.startsWith("rsvpConfig="));
  if (!token || token.length > 12000) return { ...defaultInvitationRsvpConfig, customFields: [] };
  try {
    return sanitizeInvitationRsvpConfig(JSON.parse(decodeURIComponent(token.slice("rsvpConfig=".length))));
  } catch {
    return { ...defaultInvitationRsvpConfig, customFields: [] };
  }
}

export function withInvitationRsvpConfig(designKey: string, config: InvitationRsvpConfig) {
  const base = designKey.split("::").filter((part) => !part.startsWith("rsvpConfig=")).join("::");
  const normalized = sanitizeInvitationRsvpConfig(config);
  const isDefault = normalized.ceremony && normalized.reception && normalized.attendAll && normalized.customFields.length === 0;
  return isDefault
    ? base
    : `${base}::rsvpConfig=${encodeURIComponent(JSON.stringify(normalized))}`;
}

export function normalizeRsvpEvents(value: unknown, config: InvitationRsvpConfig) {
  if (!Array.isArray(value)) return [] as RsvpEventOption[];
  const allowed = new Set<RsvpEventOption>([
    ...(config.ceremony ? ["ceremony" as const] : []),
    ...(config.reception ? ["reception" as const] : []),
  ]);
  return [...new Set(value.filter((item): item is RsvpEventOption => item === "ceremony" || item === "reception"))]
    .filter((item) => allowed.has(item));
}

export function sanitizeRsvpAnswers(value: unknown, config: InvitationRsvpConfig) {
  const source = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  const output: Record<string, string> = {};
  for (const field of config.customFields) {
    const answer = typeof source[field.id] === "string" ? String(source[field.id]).trim().slice(0, 200) : "";
    if (answer) output[field.id] = answer;
  }
  return output;
}
