import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendInvoiceEmail } from "@/lib/email";

async function requireStaff() {
  const user = await getCurrentUser();
  return user && ["ADMIN", "FINANCE"].includes(user.role) ? user : null;
}
function invoiceNumber(){const stamp=new Date().toISOString().slice(0,10).replaceAll("-","");return `DC-${stamp}-${randomBytes(3).toString("hex").toUpperCase()}`}

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

export async function POST(request:Request){
 const staff=await requireStaff();if(!staff)return NextResponse.json({error:"Akses Admin diperlukan."},{status:403});
 try{const body=await request.json();const invitationId=String(body.invitationId??"");const amount=Number(body.amount);if(!invitationId||!Number.isInteger(amount)||amount<=0)return NextResponse.json({error:"Undangan dan nominal custom wajib diisi."},{status:400});const invitation=await prisma.invitation.findUnique({where:{id:invitationId},include:{owner:true}});if(!invitation)return NextResponse.json({error:"Undangan tidak ditemukan."},{status:404});const order=await prisma.paymentOrder.create({data:{invoiceNumber:invoiceNumber(),userId:invitation.ownerId,invitationId,packageKey:"CUSTOM_DESIGN",amount,note:String(body.note??"").trim()||"Custom design invitation dibuat oleh Admin."}});const invoiceUrl=`${process.env.APP_URL??"http://localhost:3000"}/checkout/${order.id}`;const email=await sendInvoiceEmail({to:invitation.owner.email,invoiceNumber:order.invoiceNumber,packageName:"Custom Design Invitation",amount,invoiceUrl});await prisma.auditLog.create({data:{actorId:staff.id,action:"CUSTOM_DESIGN_ORDER_CREATED",entity:"PaymentOrder",entityId:order.id,metadata:{invitationId,amount,invoiceNumber:order.invoiceNumber}}});return NextResponse.json({order,email,invoiceUrl},{status:201})}catch{return NextResponse.json({error:"Order custom design belum dapat dibuat."},{status:500})}
}

export async function PATCH(request: Request) {
  const staff = await requireStaff();
  if (!staff) return NextResponse.json({ error: "Akses Admin diperlukan." }, { status: 403 });
  try {
    const body = await request.json();
    const invitationId = String(body.invitationId ?? "");
    const action = String(body.action ?? "NAMES");
    const existing = await prisma.invitation.findUnique({ where:{id:invitationId}, select:{id:true,groomName:true,brideName:true,isPublished:true} });
    if (!existing) return NextResponse.json({ error:"Undangan tidak ditemukan." }, { status:404 });
    if(action === "PUBLISH"){
      const invitation = await prisma.invitation.update({where:{id:invitationId},data:{isPublished:Boolean(body.isPublished)}});
      await prisma.auditLog.create({data:{actorId:staff.id,action:"ADMIN_INVITATION_PUBLICATION_UPDATED",entity:"Invitation",entityId:invitationId,metadata:{isPublished:invitation.isPublished}}});
      return NextResponse.json({invitation});
    }
    const groomName = String(body.groomName ?? "").trim();
    const brideName = String(body.brideName ?? "").trim();
    if (!groomName || !brideName) return NextResponse.json({ error:"Nama pengantin pria dan wanita wajib diisi." }, { status:400 });
    const invitation = await prisma.invitation.update({ where:{id:invitationId}, data:{groomName,brideName}, select:{id:true,groomName:true,brideName:true} });
    await prisma.auditLog.create({ data:{ actorId:staff.id, action:"ADMIN_COUPLE_DATA_UPDATED", entity:"Invitation", entityId:invitationId, metadata:{groomName,brideName} } });
    return NextResponse.json({ invitation });
  } catch {
    return NextResponse.json({ error:"Perubahan belum dapat diproses." }, { status:500 });
  }
}
