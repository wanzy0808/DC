export function parseUsherQrToken(value: string) {
  const raw = value.trim();

  try {
    const url = new URL(raw);
    return url.searchParams.get("token") ?? url.searchParams.get("qr") ?? raw;
  } catch {
    return raw;
  }
}

export function usherQrImageUrl(token: string) {
  return `https://quickchart.io/qr?text=${encodeURIComponent(token)}&size=320&margin=2`;
}
