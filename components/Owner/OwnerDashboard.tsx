"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SessionLogoutButton from "@/components/Auth/SessionLogoutButton";
import AdminPayments from "@/components/Admin/AdminPayments";

type UserRow = { id:string; email:string; firstName:string; lastName:string|null; role:string; emailVerifiedAt:string|null; createdAt:string; _count:{invitations:number;orders:number} };
const roles = ["USER", "DESIGNER", "ADMIN"];

function roleLabel(role:string){ return role === "DESIGNER" ? "Designer" : role === "ADMIN" ? "Admin" : "User"; }
function date(value:string){ return new Intl.DateTimeFormat("id-ID", { dateStyle:"medium" }).format(new Date(value)); }

export default function OwnerDashboard(){
  const [users,setUsers]=useState<UserRow[]>([]); const [selected,setSelected]=useState<UserRow|null>(null); const [message,setMessage]=useState(""); const [loading,setLoading]=useState(true);
  const [form,setForm]=useState({email:"",role:"USER",password:""}); const [password,setPassword]=useState(""); const [saving,setSaving]=useState(false);
  async function load(){ setLoading(true); const r=await fetch("/api/owner/users",{cache:"no-store"}); const d=await r.json(); if(r.ok)setUsers(d.users??[]); else setMessage(d.error??"Data user belum dapat dimuat."); setLoading(false); }
  useEffect(()=>{void load()},[]);
  function edit(user:UserRow){setSelected(user);setForm({email:user.email,role:roles.includes(user.role)?user.role:"USER",password:""});setPassword("");setMessage("")}
  async function create(){setSaving(true);setMessage("");const r=await fetch("/api/owner/users",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});const d=await r.json();setSaving(false);if(!r.ok){setMessage(d.error??"Akun belum dapat dibuat.");return}setMessage("Akun berhasil dibuat.");setForm({email:"",role:"USER",password:""});await load()}
  async function update(){if(!selected)return;setSaving(true);setMessage("");const r=await fetch("/api/owner/users",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:selected.id,email:form.email,role:form.role})});const d=await r.json();setSaving(false);if(!r.ok){setMessage(d.error??"Data belum dapat diubah.");return}setMessage("Data akun diperbarui.");await load()}
  async function requestPassword(){if(!selected)return;setSaving(true);setMessage("");const r=await fetch("/api/owner/users",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:selected.id,action:"PASSWORD",password})});const d=await r.json();setSaving(false);setMessage(d.message??d.error??"Permintaan belum dapat dibuat.");if(r.ok)setPassword("")}
  const counts={all:users.length,admin:users.filter(u=>u.role==="ADMIN").length,designer:users.filter(u=>u.role==="DESIGNER").length,user:users.filter(u=>u.role==="USER").length};
  return <main className="mx-auto w-[80vw] max-w-full space-y-8 px-5 py-8 font-[family-name:var(--font-fauna)]">
    <header className="flex flex-wrap items-start justify-between gap-4"><div className="min-w-0"><p className="font-[family-name:var(--font-dm-mono)] text-xs uppercase tracking-[.2em] text-primary">Owner Dashboard</p><h1 className="mt-2 font-[family-name:var(--font-cinzel)] text-3xl font-semibold">Kontrol Seluruh DC Organizer</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Kelola akun, peran, data penting, dan akses tim dari satu tempat.</p></div><div className="flex items-center gap-2"><Button asChild><Link href="/owner/studio">Template Studio</Link></Button><SessionLogoutButton /></div></header>
    <div className="grid gap-4 sm:grid-cols-4">{[["Total",counts.all],["Admin",counts.admin],["Designer",counts.designer],["User",counts.user]].map(([label,count])=><section key={String(label)} className="rounded-2xl border border-border bg-background p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 font-[family-name:var(--font-dm-mono)] text-3xl">{count}</p></section>)}</div>
    <AdminPayments />
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="overflow-hidden rounded-2xl border border-border bg-background"><div className="border-b border-border p-5"><h2 className="font-[family-name:var(--font-cinzel)] text-xl">Daftar akun</h2></div>{loading?<p className="p-5 text-sm text-muted-foreground">Memuat...</p>:<div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="px-5 py-3">Nama</th><th className="px-5 py-3">Email</th><th className="px-5 py-3">Role</th><th className="px-5 py-3">Data</th><th className="px-5 py-3"/></tr></thead><tbody>{users.map(user=><tr key={user.id} className="border-b border-border last:border-0"><td className="px-5 py-3 font-medium">{user.firstName} {user.lastName??""}</td><td className="px-5 py-3 text-muted-foreground">{user.email}</td><td className="px-5 py-3">{roleLabel(user.role)}</td><td className="px-5 py-3 text-xs text-muted-foreground">{user._count.invitations} undangan · {user._count.orders} order</td><td className="px-5 py-3"><Button type="button" size="sm" onClick={()=>edit(user)}>Edit</Button></td></tr>)}</tbody></table></div>}</section>
      <section className="rounded-2xl border border-border bg-background p-5"><h2 className="font-[family-name:var(--font-cinzel)] text-xl">{selected?"Edit ID":"Buat ID"}</h2><div className="mt-4 space-y-3"><Input type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/><select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>{roles.map(role=><option key={role} value={role}>{roleLabel(role)}</option>)}</select>{!selected&&<Input type="password" placeholder="Password awal (min. 8 karakter)" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>}<Button type="button" disabled={saving} className="w-full" onClick={selected?update:create}>{saving?"Memproses...":selected?"Simpan perubahan":"Buat ID"}</Button>{selected&&<><div className="my-4 border-t border-border"/><p className="text-xs text-muted-foreground">Perubahan password membutuhkan konfirmasi email Owner.</p><Input type="password" placeholder="Password baru (min. 8 karakter)" value={password} onChange={e=>setPassword(e.target.value)}/><Button type="button" disabled={saving||password.length<8} className="w-full" onClick={requestPassword}>Kirim konfirmasi password</Button><Button type="button" className="w-full" onClick={()=>{setSelected(null);setForm({email:"",role:"USER",password:""})}}>Buat ID lain</Button></>}</div>{message&&<p className="mt-4 rounded-xl bg-primary/10 p-3 text-xs">{message}</p>}</section>
    </div>
  </main>
}
