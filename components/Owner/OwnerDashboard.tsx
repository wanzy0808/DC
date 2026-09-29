"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SessionLogoutButton from "@/components/Auth/SessionLogoutButton";
import AdminPayments from "@/components/Admin/AdminPayments";
import OwnerBusinessInsights from "@/components/Owner/OwnerBusinessInsights";
import OwnerTemplateReview from "@/components/Owner/OwnerTemplateReview";
import { changeOwnerGrant, ownerAccessState, type OwnerGrant } from "./owner-account-access";

type PackageAccess = {
  digital: boolean;
  guestbook: boolean;
  purchasedDigital: boolean;
  purchasedGuestbook: boolean;
  grantedDigital: boolean;
  grantedGuestbook: boolean;
};

type UserRow = {
  id: string;
  email: string;
  role: string;
  emailVerifiedAt: string | null;
  createdAt: string;
  packageAccess: PackageAccess;
  _count: { invitations: number; orders: number };
};

const roles = ["USER", "DESIGNER", "ADMIN", "SUPPORT"];

function roleLabel(role: string) {
  if (role === "DESIGNER") return "Designer";
  if (role === "ADMIN") return "Admin";
  if (role === "SUPPORT") return "Mitra";
  return "User";
}

type AccountDraft = { email: string; role: string; packageAccess: OwnerGrant };
const emptyCreateForm = { email: "", role: "USER", password: "" };

export default function OwnerDashboard() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<AccountDraft | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/owner/users", { cache: "no-store" });
      const data = await response.json();
      if (response.ok) setUsers(data.users ?? []);
      else setMessage(data.error ?? "Data user belum dapat dimuat.");
    } catch {
      setMessage("Data user belum dapat dimuat.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  function edit(user: UserRow) {
    setEditingId(user.id);
    setDraft({
      email: user.email,
      role: roles.includes(user.role) ? user.role : "USER",
      packageAccess: {
        digital: user.packageAccess.grantedDigital,
        guestbook: user.packageAccess.grantedGuestbook,
      },
    });
    setPassword("");
    setMessage("");
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(null);
    setPassword("");
    setMessage("");
  }

  async function create() {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/owner/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error ?? "Akun belum dapat dibuat.");
        return;
      }
      setCreateForm(emptyCreateForm);
      await load();
      setMessage("ID berhasil dibuat. Atur hak paketnya pada baris akun di bawah.");
    } catch {
      setMessage("Akun belum dapat dibuat.");
    } finally {
      setSaving(false);
    }
  }

  async function update(userId: string) {
    if (!draft) return;
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/owner/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...draft }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error ?? "Data belum dapat diubah.");
        return;
      }
      cancelEdit();
      await load();
      setMessage("Data akun dan hak paket diperbarui.");
    } catch {
      setMessage("Data belum dapat diubah.");
    } finally {
      setSaving(false);
    }
  }

  async function requestPassword(userId: string) {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/owner/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "PASSWORD", password }),
      });
      const data = await response.json();
      setMessage(data.message ?? data.error ?? "Permintaan belum dapat dibuat.");
      if (response.ok) setPassword("");
    } catch {
      setMessage("Permintaan belum dapat dibuat.");
    } finally {
      setSaving(false);
    }
  }

  const counts = {
    all: users.length,
    admin: users.filter((user) => user.role === "ADMIN").length,
    designer: users.filter((user) => user.role === "DESIGNER").length,
    partner: users.filter((user) => user.role === "SUPPORT").length,
  };

  return (
    <main className="mx-auto w-[80vw] max-w-full space-y-8 px-5 py-8 font-[family-name:var(--font-undara-body)]">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-[family-name:var(--font-undara-mono)] text-xs uppercase tracking-[.2em] text-primary">Owner Dashboard</p>
          <h1 className="mt-2 font-heading text-3xl font-semibold">Kontrol Undara</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Akun, hak paket, pembayaran, designer, dan mitra dalam satu panel.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild><Link href="/owner/studio">Template Studio</Link></Button>
          <SessionLogoutButton />
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          ["Total akun", counts.all],
          ["Admin", counts.admin],
          ["Designer", counts.designer],
          ["Mitra", counts.partner],
        ].map(([label, count]) => (
          <section key={String(label)} className="rounded-2xl border border-border bg-background p-5">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 font-[family-name:var(--font-undara-mono)] text-3xl">{count}</p>
          </section>
        ))}
      </div>

      <OwnerBusinessInsights />
      <OwnerTemplateReview />
      <AdminPayments />

      <section className="rounded-2xl border border-border bg-background p-5">
        <h2 className="font-[family-name:var(--font-undara-heading)] text-xl">Buat ID</h2>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="min-w-56 flex-1 text-sm font-medium">Email
            <Input type="email" className="mt-1" value={createForm.email} onChange={(event) => setCreateForm({ ...createForm, email: event.target.value })} />
          </label>
          <label className="min-w-36 text-sm font-medium">Role
            <select className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={createForm.role} onChange={(event) => setCreateForm({ ...createForm, role: event.target.value })}>
              {roles.map((role) => <option key={role} value={role}>{roleLabel(role)}</option>)}
            </select>
          </label>
          <label className="min-w-56 flex-1 text-sm font-medium">Password awal
            <Input type="password" className="mt-1" minLength={8} value={createForm.password} onChange={(event) => setCreateForm({ ...createForm, password: event.target.value })} />
          </label>
          <Button type="button" disabled={saving || !createForm.email.trim() || createForm.password.length < 8} onClick={create}>
            {saving ? "Memproses..." : "Buat ID"}
          </Button>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-background">
        <div className="border-b border-border p-5">
          <h2 className="font-[family-name:var(--font-undara-heading)] text-xl">ID dan hak paket</h2>
          <p className="mt-1 text-xs text-muted-foreground">Centang hak setelah klik Edit pada ID terkait, lalu Simpan. Hak yang sudah dibeli tidak bisa dicabut. Grant Owner tidak tercatat sebagai penjualan.</p>
          {message && <p role="status" className="mt-3 rounded-xl bg-primary/10 p-3 text-sm">{message}</p>}
        </div>
        {loading ? <p className="p-5 text-sm text-muted-foreground">Memuat...</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th scope="col" className="px-5 py-3">ID / Email</th>
                  <th scope="col" className="px-5 py-3">Role</th>
                  <th scope="col" className="px-5 py-3">Undangan Digital</th>
                  <th scope="col" className="px-5 py-3">Guest Book</th>
                  <th scope="col" className="px-5 py-3">Data</th>
                  <th scope="col" className="px-5 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const editing = editingId === user.id && draft !== null;
                  const grant = editing ? draft.packageAccess : {
                    digital: user.packageAccess.grantedDigital,
                    guestbook: user.packageAccess.grantedGuestbook,
                  };
                  const access = ownerAccessState(user.packageAccess, grant);
                  return (
                    <tr key={user.id} className="border-b border-border align-top last:border-0">
                      <td className="px-5 py-4">
                        {editing ? <Input aria-label={`Email ID ${user.id}`} type="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} /> : <span className="font-medium">{user.email}</span>}
                        <span className="mt-1 block font-[family-name:var(--font-undara-mono)] text-xs text-muted-foreground">{user.id}</span>
                      </td>
                      <td className="px-5 py-4">
                        {editing ? (
                          <select aria-label={`Role ID ${user.id}`} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={draft.role} onChange={(event) => setDraft({ ...draft, role: event.target.value })}>
                            {roles.map((role) => <option key={role} value={role}>{roleLabel(role)}</option>)}
                          </select>
                        ) : roleLabel(user.role)}
                      </td>
                      {(["digital", "guestbook"] as const).map((packageKey) => (
                        <td key={packageKey} className="px-5 py-4">
                          <label className="flex items-center gap-2">
                            <input type="checkbox"
                              aria-label={`${packageKey === "digital" ? "Undangan Digital" : "Guest Book"} untuk ${user.email}`}
                              checked={access[packageKey]}
                              disabled={!editing || saving || access[`${packageKey}Locked`]}
                              onChange={(event) => {
                                if (draft) setDraft({ ...draft, packageAccess: changeOwnerGrant(draft.packageAccess, packageKey, event.target.checked) });
                              }}
                              className="size-4 accent-[var(--primary)]" />
                            <span>{access[packageKey] ? "Aktif" : "Belum aktif"}</span>
                          </label>
                          {user.packageAccess[packageKey === "digital" ? "purchasedDigital" : "purchasedGuestbook"] && <span className="mt-1 block text-xs text-muted-foreground">Sudah dibeli</span>}
                          {packageKey === "digital" && access.guestbook && !user.packageAccess.purchasedDigital && <span className="mt-1 block text-xs text-muted-foreground">Termasuk Guest Book</span>}
                        </td>
                      ))}
                      <td className="px-5 py-4 text-xs text-muted-foreground">{user._count.invitations} undangan · {user._count.orders} order</td>
                      <td className="px-5 py-4">
                        {editing ? (
                          <div className="flex min-w-36 flex-col gap-2">
                            <Button type="button" size="sm" disabled={saving || !draft.email.trim()} onClick={() => void update(user.id)}>{saving ? "Memproses..." : "Simpan"}</Button>
                            <Button type="button" size="sm" variant="outline" disabled={saving} onClick={cancelEdit}>Batal</Button>
                            <p className="mt-2 text-xs text-muted-foreground">Ubah password via konfirmasi email Owner.</p>
                            <Input type="password" aria-label={`Password baru untuk ${user.email}`} placeholder="Password baru" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} />
                            <Button type="button" size="sm" variant="outline" disabled={saving || password.length < 8} onClick={() => void requestPassword(user.id)}>Kirim konfirmasi</Button>
                          </div>
                        ) : <Button type="button" size="sm" disabled={saving || editingId !== null} onClick={() => edit(user)}>Edit</Button>}
                      </td>
                    </tr>
                  );
                })}
                {users.length === 0 && <tr><td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">Belum ada akun.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
