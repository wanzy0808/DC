"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Eye, KeyRound, PenLine, Plus, RefreshCw, Send, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Guest = {
  id: string;
  name: string;
  phone: string | null;
  personalToken?: string | null;
  personalPublished?: boolean;
  personalPasswordProtected?: boolean;
  personalViewCount?: number;
};

type PersonalGuest = Guest & {
  personalToken: string;
  personalPublished: boolean;
  personalPasswordProtected: boolean;
  personalViewCount: number;
};

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_INVITATION_ROOT_DOMAIN || "dcwedding.com";

export default function PersonalInvitationPanel() {
  const [personal, setPersonal] = useState<PersonalGuest[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [mainSlug, setMainSlug] = useState("");
  const [guestId, setGuestId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [passwordId, setPasswordId] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [personalResponse, guestResponse] = await Promise.all([
        fetch("/api/personal-invitations", { cache: "no-store" }),
        fetch("/api/guests", { cache: "no-store" }),
      ]);
      const personalData = await personalResponse.json().catch(() => null);
      const guestData = await guestResponse.json().catch(() => null);
      if (!personalResponse.ok) throw new Error(personalData?.error || "Personal Invitation belum dapat dimuat.");
      setPersonal((personalData?.invitations ?? []) as PersonalGuest[]);
      setMainSlug(personalData?.mainSlug ?? "");
      setGuests((guestData?.guests ?? []) as Guest[]);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Personal Invitation belum dapat dimuat.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load().catch(() => undefined);
  }, [load]);

  const personalIds = useMemo(() => new Set(personal.map((item) => item.id)), [personal]);
  const availableGuests = useMemo(() => guests.filter((item) => !personalIds.has(item.id)), [guests, personalIds]);

  async function createFromExisting() {
    if (!guestId) return;
    setBusyId("create-existing");
    setNotice("");
    try {
      const response = await fetch("/api/personal-invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "Personal Invitation belum dapat dibuat.");
      setGuestId("");
      await load();
      setNotice("Personal Invitation dibuat.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Personal Invitation belum dapat dibuat.");
    } finally {
      setBusyId(null);
    }
  }

  async function createNew() {
    if (!name.trim()) return;
    setBusyId("create-new");
    setNotice("");
    try {
      const response = await fetch("/api/personal-invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "Personal Invitation belum dapat dibuat.");
      setName("");
      setPhone("");
      await load();
      setNotice("Personal Invitation dibuat.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Personal Invitation belum dapat dibuat.");
    } finally {
      setBusyId(null);
    }
  }

  async function patch(id: string, body: Record<string, unknown>, successMessage: string) {
    setBusyId(id);
    setNotice("");
    try {
      const response = await fetch("/api/personal-invitations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...body }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "Personal Invitation belum dapat diperbarui.");
      setPersonal((current) => current.map((item) => (item.id === id ? (data.invitation as PersonalGuest) : item)));
      setNotice(successMessage);
      return true;
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Personal Invitation belum dapat diperbarui.");
      return false;
    } finally {
      setBusyId(null);
    }
  }

  function startEdit(item: PersonalGuest) {
    setEditingId(item.id);
    setEditName(item.name);
    setEditPhone(item.phone || "");
  }

  async function saveEdit(item: PersonalGuest) {
    if (!editName.trim()) return;
    const ok = await patch(item.id, { name: editName.trim(), phone: editPhone.trim() }, "Data tamu diperbarui.");
    if (ok) setEditingId(null);
  }

  async function savePassword(item: PersonalGuest) {
    if (password.trim().length < 6) {
      setNotice("Password minimal 6 karakter.");
      return;
    }
    const ok = await patch(item.id, { passwordProtected: true, password: password.trim() }, "Password Personal Invitation diperbarui.");
    if (ok) {
      setPasswordId(null);
      setPassword("");
    }
  }

  async function disablePassword(item: PersonalGuest) {
    const ok = await patch(item.id, { passwordProtected: false }, "Password Personal Invitation dimatikan.");
    if (ok) {
      setPasswordId(null);
      setPassword("");
    }
  }

  const publishedCount = personal.filter((item) => item.personalPublished).length;
  const protectedCount = personal.filter((item) => item.personalPasswordProtected).length;
  const totalViews = personal.reduce((sum, item) => sum + (item.personalViewCount || 0), 0);

  return (
    <div className="mx-auto w-[min(92vw,1400px)] min-w-0 pb-16 pt-7 sm:pt-8">
      {notice && <div className="mb-4 rounded-xl border border-primary/15 bg-primary/[0.035] px-3 py-2.5 text-xs text-muted-foreground" role="status">{notice}</div>}

      <section className="grid gap-3 sm:grid-cols-3">
        <Metric label="Personal Invitation" value={String(personal.length)} />
        <Metric label="Publish" value={String(publishedCount)} />
        <Metric label="Dibuka" value={String(totalViews)} />
      </section>

      <div className="mt-5 grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
        <section className="space-y-4 rounded-xl border border-border/80 bg-foreground/[0.018] p-4 sm:p-5">
          <div>
            <p className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.12em] text-muted-foreground">Tamu</p>
            <h2 className="mt-1 font-[family-name:var(--font-cinzel)] text-lg font-semibold text-foreground">Buat Personal Invitation</h2>
          </div>

          <div className="rounded-xl border border-border/70 bg-background/80 p-3">
            <p className="text-xs font-semibold text-foreground">Dari daftar tamu</p>
            <select value={guestId} onChange={(event) => setGuestId(event.target.value)} disabled={loading || Boolean(busyId)} className="mt-2 w-full px-3 text-sm">
              <option value="">Pilih tamu</option>
              {availableGuests.map((item) => <option key={item.id} value={item.id}>{item.name}{item.phone ? ` · ${item.phone}` : ""}</option>)}
            </select>
            <Button type="button" size="sm" className="mt-2 w-full" disabled={!guestId || Boolean(busyId)} onClick={createFromExisting}>
              <Plus className="h-4 w-4" />
              Buat Personal Invitation
            </Button>
          </div>

          <div className="rounded-xl border border-border/70 bg-background/80 p-3">
            <p className="text-xs font-semibold text-foreground">Tamu belum ada</p>
            <div className="mt-2 space-y-2">
              <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nama tamu" disabled={Boolean(busyId)} />
              <Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Nomor WhatsApp (opsional)" disabled={Boolean(busyId)} />
              <Button type="button" size="sm" className="w-full" disabled={!name.trim() || Boolean(busyId)} onClick={createNew}>
                <Plus className="h-4 w-4" />
                Tambah & buat undangan
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <SmallMetric label="Password" value={String(protectedCount)} />
            <SmallMetric label="Draft" value={String(personal.length - publishedCount)} />
          </div>
        </section>

        <section className="rounded-xl border border-border/80 bg-foreground/[0.018] p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.12em] text-muted-foreground">Daftar</p>
              <h2 className="mt-1 font-[family-name:var(--font-cinzel)] text-lg font-semibold text-foreground">Personal Invitation</h2>
            </div>
            <Button type="button" size="sm" onClick={() => load()} disabled={loading}>
              <RefreshCw className="h-4 w-4" />
              Muat ulang
            </Button>
          </div>

          <div className="mt-4 space-y-3">
            {personal.length === 0 && <div className="rounded-lg border border-border/70 bg-background/70 px-3 py-6 text-center text-xs text-muted-foreground">Belum ada Personal Invitation.</div>}
            {personal.map((item) => {
              const publicUrl = mainSlug && item.personalToken ? `https://${mainSlug}.${ROOT_DOMAIN}/p/${item.personalToken}` : "";
              const editing = editingId === item.id;
              const passwordOpen = passwordId === item.id;
              return (
                <article key={item.id} className="rounded-xl border border-border/75 bg-background/80 p-3.5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      {editing ? (
                        <div className="grid gap-2 sm:grid-cols-2">
                          <Input value={editName} onChange={(event) => setEditName(event.target.value)} placeholder="Nama tamu" />
                          <Input value={editPhone} onChange={(event) => setEditPhone(event.target.value)} placeholder="Nomor WhatsApp" />
                        </div>
                      ) : (
                        <>
                          <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
                          <p className="mt-0.5 truncate font-[family-name:var(--font-dm-mono)] text-[9px] text-muted-foreground">{item.phone || "Tanpa nomor"} · {item.personalViewCount || 0} dibuka</p>
                        </>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild size="sm">
                        <Link href={`/dashboard/personal-invitation/${item.id}`} target="_blank">
                          <Eye className="h-4 w-4" />
                          Pratinjau
                        </Link>
                      </Button>
                      {editing ? (
                        <Button type="button" size="sm" disabled={busyId === item.id} onClick={() => saveEdit(item)}>
                          Simpan edit
                        </Button>
                      ) : (
                        <Button type="button" size="sm" onClick={() => startEdit(item)}>
                          <PenLine className="h-4 w-4" />
                          Edit
                        </Button>
                      )}
                      <Button type="button" size="sm" disabled={busyId === item.id} onClick={() => patch(item.id, { published: !item.personalPublished }, item.personalPublished ? "Personal Invitation ditarik dari publik." : "Personal Invitation dipublish.")}>
                        <Send className="h-4 w-4" />
                        {item.personalPublished ? "Tarik publik" : "Publish"}
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-primary/[0.07] px-2 py-1 font-[family-name:var(--font-dm-mono)] text-[8px] uppercase tracking-[0.08em] text-primary">{item.personalPublished ? "Terbit" : "Draft"}</span>
                    <span className="rounded-lg bg-foreground/[0.04] px-2 py-1 font-[family-name:var(--font-dm-mono)] text-[8px] uppercase tracking-[0.08em] text-muted-foreground">{item.personalPasswordProtected ? "Password aktif" : "Tanpa password"}</span>
                    <Button type="button" size="sm" onClick={() => { setPasswordId(passwordOpen ? null : item.id); setPassword(""); }}>
                      <KeyRound className="h-4 w-4" />
                      {item.personalPasswordProtected ? "Ganti password" : "Aktifkan password"}
                    </Button>
                    {item.personalPasswordProtected && (
                      <Button type="button" size="sm" disabled={busyId === item.id} onClick={() => disablePassword(item)}>
                        <ShieldOff className="h-4 w-4" />
                        Matikan password
                      </Button>
                    )}
                    {item.personalPublished && publicUrl && (
                      <Button asChild size="sm">
                        <a href={publicUrl} target="_blank" rel="noreferrer">Buka publik</a>
                      </Button>
                    )}
                  </div>

                  {passwordOpen && (
                    <div className="mt-3 flex flex-col gap-2 rounded-lg border border-primary/15 bg-primary/[0.035] p-3 sm:flex-row sm:items-center">
                      <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password baru minimal 6 karakter" className="min-w-0 flex-1" />
                      <Button type="button" size="sm" disabled={password.trim().length < 6 || busyId === item.id} onClick={() => savePassword(item)}>
                        Simpan password
                      </Button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-primary/10 bg-foreground/[0.022] px-4 py-3.5">
      <p className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function SmallMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/70 bg-background/75 px-3 py-2.5">
      <p className="font-[family-name:var(--font-dm-mono)] text-[8px] uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-xs font-semibold text-foreground">{value}</p>
    </div>
  );
}