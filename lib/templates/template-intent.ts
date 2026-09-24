import { invitationTemplates } from "@/lib/templates/catalog";

/**
 * A temporary, non-sensitive template choice during catalog -> login -> event -> Studio.
 * The actual invitation design is saved only by Studio's authenticated Save Design API.
 */
const STORAGE_KEY = "dc-organizer:pending-invitation-template";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function isSelectableTemplate(key: string | null | undefined): key is string {
  return Boolean(key && invitationTemplates.some((template) => template.key === key));
}

export function rememberTemplateSelection(key: string) {
  if (!isSelectableTemplate(key) || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      key,
      expiresAt: Date.now() + MAX_AGE_MS,
    }));
  } catch {
    // URLs still carry the selection when storage is unavailable.
  }
}

export function readTemplateSelection(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const item: unknown = JSON.parse(stored);
    if (typeof item !== "object" || !item || !("key" in item) || !("expiresAt" in item)) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    const { key, expiresAt } = item as { key: unknown; expiresAt: unknown };
    if (typeof key !== "string" || !isSelectableTemplate(key) ||
        typeof expiresAt !== "number" || !Number.isFinite(expiresAt) ||
        expiresAt <= Date.now()) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return key;
  } catch {
    return null;
  }
}

export function clearTemplateSelection(key?: string) {
  if (typeof window === "undefined") return;
  try {
    if (key === undefined || readTemplateSelection() === key) {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Saving an invitation is never blocked by the optional browser cache.
  }
}
