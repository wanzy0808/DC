import { NextRequest, NextResponse } from "next/server";

const RESERVED_SUBDOMAINS = new Set([
  "www",
  "app",
  "admin",
  "api",
  "mail",
  "ftp",
]);

function getInvitationSlug(hostname: string) {
  const rootDomain = (process.env.INVITATION_ROOT_DOMAIN ?? "dcwedding.com").toLowerCase();
  const host = hostname.toLowerCase().split(":")[0];

  // Local development: slug.localhost
  if (host.endsWith(".localhost")) {
    const slug = host.slice(0, -".localhost".length);
    return slug && !slug.includes(".") ? slug : null;
  }

  if (host === rootDomain || !host.endsWith(`.${rootDomain}`)) return null;

  const subdomain = host.slice(0, -(rootDomain.length + 1));
  if (!subdomain || subdomain.includes(".") || RESERVED_SUBDOMAINS.has(subdomain)) return null;

  // Keep invitation slugs URL-safe and predictable.
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(subdomain) ? subdomain : null;
}

export default function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Only the invitation homepage is tenant-routed by subdomain.
  // Normal application routes continue to use their existing paths.
  if (pathname !== "/") return NextResponse.next();

  const slug = getInvitationSlug(request.nextUrl.hostname);
  if (!slug) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/invite/${slug}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/"],
};
