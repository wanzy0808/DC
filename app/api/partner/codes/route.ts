import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createPartnerVoucher, getPartnerVoucherCodes } from "@/lib/partners/vouchers";
import { isTrustedMutationOrigin } from "@/lib/security/request-origin";

export async function POST(request: Request) {
  const partner = await getCurrentUser();
  if (!partner || partner.role !== "SUPPORT") {
    return NextResponse.json({ error: "Akses Mitra diperlukan." }, { status: 403 });
  }
  if (!isTrustedMutationOrigin(request)) return NextResponse.json({ error: "Origin permintaan tidak valid." }, { status: 403 });

  const codes = await getPartnerVoucherCodes(partner.id);
  if (codes.length >= 20) return NextResponse.json({ error: "Batas 20 kode referral aktif sudah tercapai." }, { status: 409 });

  const code = await createPartnerVoucher(partner.id, { id: partner.id, email: partner.email });
  if (!code) return NextResponse.json({ error: "Kode belum dapat dibuat. Coba lagi." }, { status: 409 });
  return NextResponse.json({ code }, { status: 201 });
}
