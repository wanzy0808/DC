"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SessionLogoutButton from "@/components/Auth/SessionLogoutButton";
import AdminPayments from "@/components/Admin/AdminPayments";
import OwnerBusinessInsights from "@/components/Owner/OwnerBusinessInsights";

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

const emptyForm = {
  email: "",
  role: "USER",
  password: "",
  packageAccess: { digital: false, guestbook: false },
};

export default function OwnerDashboard() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [selected, setSelected] = useState<UserRow | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const response = await fetch("/api/owner/users", { cache: "no-store" });
    const data = await response.json();
    if (response.ok) setUsers(data.users ?? []);
    else setMessage(data.error ?? "Data user belum dapat dimuat.");
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  function edit(user: UserRow) {
    setSelected(user);
    setForm({
      email: user.email,
      role: roles.includes(user.role) ? user.role : "USER",
      password: "",
      packageAccess: {
        digital: user.packageAccess.grantedDigital,
        guestbook: user.packageAccess.grantedGuestbook,
      },
    });
    setPassword("");
    setMessage("");
  }

  async function create() {
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/owner/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json();
    setSaving(false);
    if (!response.ok) {
      setMessage(data.error ?? "Akun belum dapat dibuat.");
      return;
    }
    setMessage("ID berhasil dibuat.");
    setForm(emptyForm);
    await load();
  }

  async function update() {
    if (!selected) return;
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/owner/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: selected.id,
        email: form.email,
        role: form.role,
        packageAccess: form.packageAccess,
      }),
    });
    const data = await response.json();
    setSaving(false);
    if (!response.ok) {
      setMessage(data.error ?? "Data belum dapat diubah.");
      return;
    }
    setMessage("Data akun dan hak paket diperbarui.");
    await load();
  }

  async function requestPassword() {
    if (!selected) return;
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/owner/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: selected.id, action: "PASSWORD", password }),
    });
    const data = await response.json();
    setSaving(false);
    setMessage(data.message ?? data.error ?? "Permintaan belum dapat dibuat.");
    if (response.ok) setPassword("");
  }

  const counts = {
    all: users.length,
    admin: users.filter((user) => user.role === "ADMIN").length,
    designer: users.filter((user) => user.role === "DESIGNER").length,
    partner: users.filter((user) => user.role === "SUPPORT").length,
  };

  const purchasedDigital = selected?.packageAccess.purchasedDigital ?? false;
  const purchasedGuestbook = selected?.packageAccess.purchasedGuestbook ?? false;
  const effectiveGuestbook = purchasedGuestbook || form.packageAccess.guestbook;
  const effectiveDigital = purchasedDigital || effectiveGuestbook || form.packageAccess.digital;

  return (
    <main className="mx-auto w-[80vw] max-w-full space-y-8 px-5 py-8 font-[family-name:var(--font-fauna)]">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-[family-name:var(--font-dm-mono)] text-xs uppercase tracking-[.2em] text-primary">Owner Dashboard</p>
          <h1 className="mt-2 font-[family-name:var(--font-cinzel)] text-3xl font-semibold">Kontrol DC Organizer</h1>
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
            <p className="mt-2 font-[family-name:var(--font-dm-mono)] text-3xl">{count}</p>
          </section>
        ))}
      </div>

      <OwnerBusinessInsights />
      <AdminPayments />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="overflow-hidden rounded-2xl border border-border bg-background">
          <div className="border-b border-border p-5">
            <h2 className="font-[family-name:var(--font-cinzel)] text-xl">Daftar akun</h2>
          </div>
          {loading ? (
            <p className="p-5 text-sm text-muted-foreground">Memuat...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3">ID / Email</th>
                    <th className="px-5 py-3">Role</th>
                    <th className="px-5 py-3">Hak paket</th>
                    <th className="px-5 py-3">Data</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-border last:border-0">
                      <td className="px-5 py-3 font-medium">{user.email}</td>
                      <td className="px-5 py-3">{roleLabel(user.role)}</td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">
                        {user.packageAccess.guestbook
                          ? "Guest Book Rp2 jt + Undangan Digital"
                          : user.packageAccess.digital
                            ? "Undangan Digital Rp150 rb"
                            : "—"}
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">
                        {user._count.invitations} undangan · {user._count.orders} order
                      </td>
                      <td className="px-5 py-3">
                        <Button type="button" size="sm" onClick={() => edit(user)}>Edit</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-background p-5">
          <h2 className="font-[family-name:var(--font-cinzel)] text-xl">{selected ? "Edit ID" : "Buat ID"}</h2>
          <div className="mt-4 space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={form.role}
              onChange={(event) => setForm({ ...form, role: event.target.value })}
            >
              {roles.map((role) => <option key={role} value={role}>{roleLabel(role)}</option>)}
            </select>

            {!selected && (
              <Input
                type="password"
                placeholder="Password awal (min. 8 karakter)"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
              />
            )}

            <div className="rounded-xl border border-border p-4">
              <p className="text-sm font-semibold">Hak paket</p>
              <p className="mt-1 text-xs text-muted-foreground">Grant Owner tidak tercatat sebagai penjualan.</p>
              <label className="mt-4 flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={effectiveDigital}
                  disabled={purchasedDigital || effectiveGuestbook}
                  onChange={(event) => setForm({
                    ...form,
                    packageAccess: { ...form.packageAccess, digital: event.target.checked },
                  })}
                  className="mt-0.5 size-4 accent-[var(--primary)]"
                />
                <span>
                  <span className="block font-medium">Undangan Digital · Rp150.000</span>
                  {purchasedDigital && <span className="text-xs text-muted-foreground">Sudah dibeli user</span>}
                </span>
              </label>
              <label className="mt-4 flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={effectiveGuestbook}
                  disabled={purchasedGuestbook}
                  onChange={(event) => setForm({
                    ...form,
                    packageAccess: {
                      digital: event.target.checked ? true : form.packageAccess.digital,
                      guestbook: event.target.checked,
                    },
                  })}
                  className="mt-0.5 size-4 accent-[var(--primary)]"
                />
                <span>
                  <span className="block font-medium">Guest Book Digital · Rp2.000.000</span>
                  <span className="text-xs text-muted-foreground">
                    {purchasedGuestbook ? "Sudah dibeli user" : "Termasuk hak Undangan Digital"}
                  </span>
                </span>
              </label>
            </div>

            <Button
              type="button"
              disabled={saving}
              className="w-full"
              onClick={selected ? update : create}
            >
              {saving ? "Memproses..." : selected ? "Simpan perubahan" : "Buat ID"}
            </Button>

            {selected && (
              <>
                <div className="my-4 border-t border-border" />
                <p className="text-xs text-muted-foreground">Perubahan password membutuhkan konfirmasi email Owner.</p>
                <Input
                  type="password"
                  placeholder="Password baru (min. 8 karakter)"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <Button
                  type="button"
                  disabled={saving || password.length < 8}
                  className="w-full"
                  onClick={requestPassword}
                >
                  Kirim konfirmasi password
                </Button>
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => {
                    setSelected(null);
                    setForm(emptyForm);
                  }}
                >
                  Buat ID lain
                </Button>
              </>
            )}
          </div>
          {message && <p className="mt-4 rounded-xl bg-primary/10 p-3 text-xs">{message}</p>}
        </section>
      </div>
    </main>
  );
}
