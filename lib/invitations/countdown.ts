/** Shared countdown math for every published invitation theme. */
export type InvitationCountdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

/** Keep the same whole-second, zero-clamped semantics used by the existing renderers. */
export function getInvitationCountdown(value: Date | string, now: number): InvitationCountdown | null {
  const end = new Date(value).getTime();
  if (!Number.isFinite(end)) return null;
  const milliseconds = Math.max(0, end - now);
  const wholeSeconds = Math.floor(milliseconds / 1000);
  return {
    days: Math.floor(wholeSeconds / 86400),
    hours: Math.floor((wholeSeconds / 3600) % 24),
    minutes: Math.floor((wholeSeconds / 60) % 60),
    seconds: wholeSeconds % 60,
  };
}
