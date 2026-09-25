const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function getOrigin(value: string | null) {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

export function isTrustedMutationOrigin(request: Request) {
  if (SAFE_METHODS.has(request.method.toUpperCase())) return true;

  const requestOrigin = getOrigin(request.headers.get("origin"));
  if (!requestOrigin) return false;

  const appOrigin = getOrigin(process.env.APP_URL ?? null);
  if (appOrigin && requestOrigin === appOrigin) return true;

  if (process.env.NODE_ENV !== "production") {
    try {
      return requestOrigin === new URL(request.url).origin;
    } catch {
      return false;
    }
  }

  return false;
}
