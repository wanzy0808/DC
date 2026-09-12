const RESERVED_SUBDOMAINS = new Set(["www", "app", "api", "admin", "dashboard", "mail", "ftp"]);

export function slugifyCouple(groomName: string, brideName: string) {
  const parts = [groomName, brideName]
    .map((value) => value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, ""))
    .map((value) => value.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""))
    .filter(Boolean);

  const slug = parts.join("-") || "wedding";
  return RESERVED_SUBDOMAINS.has(slug) ? `${slug}-wedding` : slug;
}

export function isLegacyInvitationSlug(slug: string) {
  return /-(moment|akad)-[a-z0-9]{6}$/.test(slug) || slug === "wedding";
}
