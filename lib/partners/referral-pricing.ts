export function normalizeReferralCode(value: unknown) {
  return String(value ?? "").trim().toUpperCase().replace(/\s+/g, "");
}

export function referralDiscountPercent(packageKey: string) {
  if (packageKey === "INVITATION_BASIC") return 30;
  if (packageKey === "GUESTBOOK_DIGITAL") return 15;
  return 0;
}

export function referralPrice(packageKey: string, regularPrice: number) {
  const percent = referralDiscountPercent(packageKey);
  const amount = Math.round(regularPrice * (100 - percent) / 100);
  return { percent, regularPrice, discount: regularPrice - amount, amount };
}
