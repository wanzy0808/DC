import { NextResponse } from "next/server";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const previewTypes = new Map([["image/jpeg","jpg"],["image/png","png"],["image/webp","webp"]]);
const templateTypes = new Map([["application/zip","zip"],["application/x-zip-compressed","zip"],["text/html","html"],["application/json","json"]]);

async function requireDesigner(){const user=await getCurrentUser();return user && ["DESIGNER","EDITOR"].includes(user.role)?user:null}
function safeName(value:string){return value.toLowerCase().replace(/[^a-z0-9-_]/g,"-").replace(/-+/g,"-").slice(0,60)}

export async function GET(){
 const designer=await requireDesigner(); if(!designer)return NextResponse.json({error:"Akses Designer diperlukan."},{status:403});
 const templates=await prisma.designerTemplate.findMany({where:{designerId:designer.id},orderBy:{createdAt:"desc"}});
 const usedInvitations=await prisma.invitation.findMany({where:{templateKey:{not:""},payment:{status:"PAID"}},select:{templateKey:true}});
 const salesMap=new Map<string,number>();
 for(const invitation of usedInvitations)salesMap.set(invitation.templateKey,(salesMap.get(invitation.templateKey)??0)+1);
 return NextResponse.json({templates:templates.map(t=>({...t,salesCount:salesMap.get(t.templateNo)??0}))});
}

export async function POST(request:Request){
 const designer=await requireDesigner(); if(!designer)return NextResponse.json({error:"Akses Designer diperlukan."},{status:403});
 let lastError="Template belum dapat diupload.";
 try{
  const form=await request.formData();
  const name=String(form.get("name")??"").trim(); const tags=String(form.get("tags")??"").split(",").map(v=>v.trim()).filter(Boolean).slice(0,12);
  const preview=form.get("preview"); const template=form.get("template");
  if(!name || !(preview instanceof File) || !(template instanceof File))return NextResponse.json({error:"Nama, preview gambar, dan file template wajib diisi."},{status:400});
  const previewExt=previewTypes.get(preview.type); const templateExt=templateTypes.get(template.type);
  if(!previewExt)return NextResponse.json({error:"Preview harus JPG, PNG, atau WEBP."},{status:400});
  if(!templateExt)return NextResponse.json({error:"File template harus ZIP, HTML, atau JSON."},{status:400});
  if(preview.size>5*1024*1024 || template.size>25*1024*1024)return NextResponse.json({error:"Ukuran preview maksimal 5 MB dan template maksimal 25 MB."},{status:400});
  const previewBuffer=await sharp(Buffer.from(await preview.arrayBuffer()),{limitInputPixels:40_000_000}).rotate().resize({width:1200,height:1800,fit:"inside",withoutEnlargement:true}).webp({quality:82,effort:4}).toBuffer();
  const base=safeName(name)||"template";
  for(let attempt=0;attempt<3;attempt++){
   let folder="";
   try{
    const latest=await prisma.designerTemplate.findFirst({orderBy:{templateNo:"desc"},select:{templateNo:true}});
    const nextNumber=Math.max(0,Number(latest?.templateNo??"0"))+1; const templateNo=String(nextNumber).padStart(3,"0");
    folder=path.join(process.cwd(),"public","uploads","templates",templateNo);
    await mkdir(folder,{recursive:true});
    const previewName=`${base}-${randomUUID()}.webp`; const templateName=`${base}-${randomUUID()}.${templateExt}`;
    await writeFile(path.join(folder,previewName),previewBuffer);
    await writeFile(path.join(folder,templateName),Buffer.from(await template.arrayBuffer()));
    try{
     const created=await prisma.designerTemplate.create({data:{templateNo,name,tags,previewUrl:`/uploads/templates/${templateNo}/${previewName}`,templateFile:`/uploads/templates/${templateNo}/${templateName}`,designerId:designer.id}});
     return NextResponse.json({template:created},{status:201});
    }catch(error){
     await rm(folder,{recursive:true,force:true});
     const code=typeof error==="object"&&error!==null&&"code" in error?(error as {code?:string}).code:undefined;
     if(code==="P2002"){lastError="Nomor template sedang dipakai, mencoba nomor berikutnya...";continue}
     throw error;
    }
   }catch(error){lastError=error instanceof Error?error.message:lastError;if(folder)await rm(folder,{recursive:true,force:true}).catch(()=>undefined);if(attempt===2)break}
  }
 }catch(error){lastError=error instanceof Error?error.message:lastError}
 return NextResponse.json({error:lastError},{status:500});
}
