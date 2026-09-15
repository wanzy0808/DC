import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const previewTypes = new Map([["image/jpeg","jpg"],["image/png","png"],["image/webp","webp"]]);
const templateTypes = new Map([["application/zip","zip"],["application/x-zip-compressed","zip"],["text/html","html"],["application/json","json"]]);

async function requireDesigner(){const user=await getCurrentUser();return user && ["DESIGNER","EDITOR"].includes(user.role)?user:null}
function safeName(value:string){return value.toLowerCase().replace(/[^a-z0-9-_]/g,"-").replace(/-+/g,"-").slice(0,60)}

export async function GET(){
 const designer=await requireDesigner(); if(!designer)return NextResponse.json({error:"Akses Designer diperlukan."},{status:403});
 const templates=await prisma.designerTemplate.findMany({where:{designerId:designer.id},orderBy:{createdAt:"desc"}});
 const sales=await prisma.invitation.groupBy({by:["templateKey"],where:{templateKey:{not:""}},_count:{_all:true}});
 const salesMap=new Map(sales.map(item=>[item.templateKey,item._count._all]));
 return NextResponse.json({templates:templates.map(t=>({...t,salesCount:salesMap.get(t.templateNo)??0}))});
}

export async function POST(request:Request){
 const designer=await requireDesigner(); if(!designer)return NextResponse.json({error:"Akses Designer diperlukan."},{status:403});
 try{
  const form=await request.formData();
  const name=String(form.get("name")??"").trim(); const tags=String(form.get("tags")??"").split(",").map(v=>v.trim()).filter(Boolean).slice(0,12);
  const preview=form.get("preview"); const template=form.get("template");
  if(!name || !(preview instanceof File) || !(template instanceof File))return NextResponse.json({error:"Nama, preview gambar, dan file template wajib diisi."},{status:400});
  const previewExt=previewTypes.get(preview.type); const templateExt=templateTypes.get(template.type);
  if(!previewExt)return NextResponse.json({error:"Preview harus JPG, PNG, atau WEBP."},{status:400});
  if(!templateExt)return NextResponse.json({error:"File template harus ZIP, HTML, atau JSON."},{status:400});
  if(preview.size>5*1024*1024 || template.size>25*1024*1024)return NextResponse.json({error:"Ukuran preview maksimal 5 MB dan template maksimal 25 MB."},{status:400});
  const latest=await prisma.designerTemplate.findFirst({orderBy:{templateNo:"desc"},select:{templateNo:true}});
  const nextNumber=Math.max(0,Number(latest?.templateNo??"0"))+1; const templateNo=String(nextNumber).padStart(3,"0");
  const folder=path.join(process.cwd(),"public","uploads","templates",templateNo);
  await mkdir(folder,{recursive:true});
  const base=safeName(name)||"template";
  const previewName=`${base}-${randomUUID()}.${previewExt}`; const templateName=`${base}-${randomUUID()}.${templateExt}`;
  await writeFile(path.join(folder,previewName),Buffer.from(await preview.arrayBuffer()));
  await writeFile(path.join(folder,templateName),Buffer.from(await template.arrayBuffer()));
  const created=await prisma.designerTemplate.create({data:{templateNo,name,tags,previewUrl:`/uploads/templates/${templateNo}/${previewName}`,templateFile:`/uploads/templates/${templateNo}/${templateName}`,designerId:designer.id}});
  return NextResponse.json({template:created},{status:201});
 }catch{return NextResponse.json({error:"Template belum dapat diupload."},{status:500})}
}
