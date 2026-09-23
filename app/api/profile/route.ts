import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });
  return NextResponse.json({ user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, avatarUrl: user.avatarUrl } });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });

  try {
    const body = await request.json();
    const firstName = String(body.firstName ?? "").trim();
    const lastName = String(body.lastName ?? "").trim();
    if (!firstName || firstName.length > 80 || lastName.length > 80) return NextResponse.json({ error: "Nama depan wajib diisi." }, { status: 400 });

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { firstName, lastName: lastName || null },
      select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true },
    });
    return NextResponse.json({ user: updated });
  } catch {
    return NextResponse.json({ error: "Profil belum dapat disimpan." }, { status: 500 });
  }
}
