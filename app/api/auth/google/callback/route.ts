import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { completeGoogleSignIn } from "@/lib/google-auth";

const stateCookie = "google_oauth_state";
const nextCookie = "google_auth_next";
function loginUrl(error:string){return new URL(`/login?error=${encodeURIComponent(error)}`,process.env.APP_URL??"http://localhost:3000")}
function destinationForRole(role:string,next:string){if(role==="OWNER")return "/owner";if(role==="ADMIN"||role==="FINANCE")return "/admin";if(role==="DESIGNER"||role==="EDITOR")return "/designer";return next}

export async function GET(request:Request){
 const url=new URL(request.url),code=url.searchParams.get("code"),state=url.searchParams.get("state"),cookieStore=await cookies(),savedState=cookieStore.get(stateCookie)?.value,next=cookieStore.get(nextCookie)?.value??"/dashboard";
 cookieStore.delete(stateCookie);cookieStore.delete(nextCookie);
 if(!code||!state||!savedState||state!==savedState)return NextResponse.redirect(loginUrl("google_state"));
 try{const user=await completeGoogleSignIn(code);const safeNext=next.startsWith("/")&&!next.startsWith("//")?next:"/dashboard";return NextResponse.redirect(new URL(destinationForRole(user.role,safeNext),process.env.APP_URL??"http://localhost:3000"))}catch(error){console.error("Google OAuth callback error",error);return NextResponse.redirect(loginUrl("google_failed"))}
}
