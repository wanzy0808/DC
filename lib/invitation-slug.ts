const RESERVED_SUBDOMAINS = new Set(["www", "app", "api", "admin", "dashboard", "mail", "ftp"]);

function slugify(value: string, fallback: string) {
  const slug = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || fallback;
}

export function slugifyCouple(groomName: string, brideName: string) {
  const slug = [groomName, brideName]
    .map((value) => slugify(value, ""))
    .filter(Boolean)
    .join("-") || "wedding";

  return RESERVED_SUBDOMAINS.has(slug) ? `${slug}-wedding` : slug;
}

export function slugifyEvent(eventName: string) {
  return slugify(eventName, "event");
}

export function isLegacyInvitationSlug(slug: string) {
  return /-(moment|akad)-[a-z0-9]{6}$/.test(slug) || slug === "wedding";
}
