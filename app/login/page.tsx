import { redirect } from "next/navigation";

/**
 * Backward-compatible entry point for bookmarked /login links, auth gates,
 * OAuth callback errors and old ?register=1 URLs. The actual UI is the global
 * dialog host; no standalone login page is rendered.
 */
export default async function LoginEntry({
  searchParams,
}: {
  searchParams: Promise<{
    next?: string | string[];
    register?: string | string[];
    error?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const single = (value: string | string[] | undefined) =>
    typeof value === "string" ? value : Array.isArray(value) ? value[0] : undefined;
  const requested = single(params.next);
  const next =
    requested?.startsWith("/") &&
    !requested.startsWith("//") &&
    !requested.startsWith("/\\")
      ? requested
      : "/dashboard";
  const target = new URLSearchParams();
  target.set("auth", single(params.register) === "1" ? "register" : "login");
  target.set("next", next);
  const error = single(params.error);
  if (error?.startsWith("google_")) target.set("error", error);
  redirect(`/?${target.toString()}`);
}
