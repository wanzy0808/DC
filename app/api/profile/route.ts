import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const nicknameCookie = "dc_dashboard_nickname";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });
  const nickname = (await cookies()).get(nicknameCookie)?.value?.trim();
  return NextResponse.json({ user: { id: user.id, firstName: nickname || user.firstName, lastName: user.lastName, email: user.email } });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });

  try {
    const body = await request.json();
    const firstName = String(body.firstName ?? "").trim();
    const lastName = String(body.lastName ?? "").trim();
    if (!firstName) return NextResponse.json({ error: "Nama depan wajib diisi." }, { status: 400 });

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { firstName, lastName: lastName || null },
      select: { id: true, firstName: true, lastName: true, email: true },
    });
    return NextResponse.json({ user: updated });
  } catch {
    return NextResponse.json({ error: "Profil belum dapat disimpan." }, { status: 500 });
  }
}
