import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireStaff() {
  const user = await getCurrentUser();
  return user && ["ADMIN", "FINANCE"].includes(user.role) ? user : null;
}

export async function GET() {
  const staff = await requireStaff();
  if (!staff) return NextResponse.json({ error: "Akses Admin diperlukan." }, { status: 403 });
  const [users, invitations, orders] = await Promise.all([
    prisma.user.findMany({ select: { id:true,email:true,firstName:true,lastName:true,role:true,createdAt:true }, orderBy:{createdAt:"desc"} }),
    prisma.invitation.findMany({ select:{ id:true,slug:true,title:true,groomName:true,brideName:true,templateKey:true,isPublished:true,owner:{select:{id:true,email:true,firstName:true}},payment:{select:{packageKey:true,status:true,amount:true}} }, orderBy:{updatedAt:"desc"} }),
    prisma.paymentOrder.findMany({ where:{ status:"PENDING" }, include:{ user:{select:{email:true,firstName:true}}, invitation:{select:{groomName:true,brideName:true,templateKey:true}} }, orderBy:{createdAt:"desc"} }),
  ]);
  return NextResponse.json({ users, invitations, orders });
}

export async function PATCH(request: Request) {
  const staff = await requireStaff();
  if (!staff) return NextResponse.json({ error: "Akses Admin diperlukan." }, { status: 403 });
  try {
    const body = await request.json();
    const invitationId = String(body.invitationId ?? "");
    const groomName = String(body.groomName ?? "").trim();
    const brideName = String(body.brideName ?? "").trim();
    if (!invitationId || !groomName || !brideName) return NextResponse.json({ error:"Nama pengantin pria dan wanita wajib diisi." }, { status:400 });
    const invitation = await prisma.invitation.update({ where:{id:invitationId}, data:{groomName,brideName}, select:{id:groomName,brideName} });
    await prisma.auditLog.create({ data:{ actorId:staff.id, action:"ADMIN_COUPLE_DATA_UPDATED", entity:"Invitation", entityId:invitationId, metadata:{groomName,brideName} } });
    return NextResponse.json({ invitation });
  } catch {
    return NextResponse.json({ error:"Data pengantin belum dapat diperbarui." }, { status:500 });
  }
}
