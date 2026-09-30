import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getServicePackage } from "@/lib/packages/catalog";
import { referralPrice } from "@/lib/partners/referral-pricing";
import { getActivePartnerVoucher, getSelectedReferralCode, normalizeVoucherCode, setSelectedReferralCode } from "@/lib/partners/vouchers";
import { isTrustedMutationOrigin } from "@/lib/security/request-origin";

function offers() {
  return ["INVITATION_BASIC", "GUESTBOOK_DIGITAL"].map((key) => {
    const item = getServicePackage(key)!;
    return { packageKey: key, name: item.name, ...referralPrice(key, item.price) };
  });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "USER") return NextResponse.json({ error: "Akses pelanggan diperlukan." }, { status: 403 });

  const code = await getSelectedReferralCode(user.id);
  const voucher = code ? await getActivePartnerVoucher(code) : null;
  return NextResponse.json({ code, active: !!voucher, offers: offers() });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "USER") return NextResponse.json({ error: "Akses pelanggan diperlukan." }, { status: 403 });
  if (!isTrustedMutationOrigin(request)) return NextResponse.json({ error: "Origin permintaan tidak valid." }, { status: 403 });

  const body = await request.json().catch(() => null);
  const code = normalizeVoucherCode(body?.code);
  if (!/^MITRA-[A-Z0-9]{8,16}$/.test(code)) {
    return NextResponse.json({ error: "Masukkan kode referral Mitra yang valid." }, { status: 400 });
  }
  const voucher = await getActivePartnerVoucher(code);
  if (!voucher) return NextResponse.json({ error: "Kode referral tidak ditemukan atau sudah tidak aktif." }, { status: 400 });

  await setSelectedReferralCode(user.id, voucher.code);
  return NextResponse.json({ code: voucher.code, active: true, offers: offers() });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "USER") return NextResponse.json({ error: "Akses pelanggan diperlukan." }, { status: 403 });
  if (!isTrustedMutationOrigin(request)) return NextResponse.json({ error: "Origin permintaan tidak valid." }, { status: 403 });
  await setSelectedReferralCode(user.id, "");
  return NextResponse.json({ code: "", active: false, offers: offers() });
}
