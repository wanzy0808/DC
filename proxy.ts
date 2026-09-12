import { NextRequest, NextResponse } from "next/server";

const RESERVED_SUBDOMAINS = new Set(["www", "app", "admin", "api", "mail", "ftp"]);
const ROOT_DOMAIN = (process.env.INVITATION_ROOT_DOMAIN ?? "dcwedding.com").toLowerCase();

function getInvitationSlug(hostname: string) {
  const host = hostname.toLowerCase().split(":")[0];

  if (host.endsWith(".localhost")) {
    const slug = host.slice(0, -".localhost".length);
    return slug && !slug.includes(".") ? slug : null;
  }

  if (host === ROOT_DOMAIN || !host.endsWith(`.${ROOT_DOMAIN}`)) return null;

  const subdomain = host.slice(0, -(ROOT_DOMAIN.length + 1));
  if (!subdomain || subdomain.includes(".") || RESERVED_SUBDOMAINS.has(subdomain)) return null;

  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(subdomain) ? subdomain : null;
}

export default function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const slug = getInvitationSlug(request.nextUrl.hostname);

  if (slug) {
    if (pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = `/invite/${slug}`;
      return NextResponse.rewrite(url);
    }

    // Backward-compatible alias. The target page redirects this to the event name slug.
    if (pathname === "/event-khusus" || pathname === "/event-khusus/") {
      const url = request.nextUrl.clone();
      url.pathname = `/invite/${slug}/event-khusus`;
      return NextResponse.rewrite(url);
    }

    const match = pathname.match(/^\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/);
    if (match) {
      const url = request.nextUrl.clone();
      url.pathname = `/invite/${slug}/${match[1]}`;
      return NextResponse.rewrite(url);
    }

    return NextResponse.next();
  }

  // Keep old /invite links working, but make the canonical public URL the subdomain.
  if (pathname.startsWith("/invite/")) {
    const parts = pathname.split("/").filter(Boolean);
    const legacySlug = parts[1];
    if (legacySlug) {
      const suffix = parts[2] === "event-khusus" ? "/event-khusus" : parts[2] ? `/${parts[2]}` : "";
      const target = new URL(`https://${legacySlug}.${ROOT_DOMAIN}${suffix}`);
      target.search = request.nextUrl.search;
      return NextResponse.redirect(target, 308);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/:path", "/event-khusus", "/event-khusus/", "/invite/:path*"],
};
