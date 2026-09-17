"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Eye,
  KeyRound,
  PenLine,
  Plus,
  RefreshCw,
  Send,
  ShieldOff,
} from "lucide-react";
import EventScopePicker, {
  type EventScopeOption,
} from "@/components/Dashboard/EventScopePicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardMetricCard, DashboardNotice } from "@/components/Dashboard/DashboardPrimitives";

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

type PersonalEvent = EventScopeOption & {
  slug: string;
  eventConfigured: boolean;
  accessPaid: boolean;
  createdAt: string;
};

const ROOT_DOMAIN =
  process.env.NEXT_PUBLIC_INVITATION_ROOT_DOMAIN || "dcwedding.com";

function sortEvents(items: PersonalEvent[]) {
  return [...items].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

export default function PersonalInvitationPanel() {
  const [events, setEvents] = useState<PersonalEvent[]>([]);
  const [eventId, setEventId] = useState("");
  const [personal, setPersonal] = useState<PersonalGuest[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [guestId, setGuestId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [passwordId, setPasswordId] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === eventId) ?? null,
    [events, eventId],
  );

  const loadEvents = useCallback(async () => {
    setEventsLoading(true);
    setNotice("");
    try {
      const response = await fetch("/api/invitations?all=1", { cache: "no-store" });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || "Daftar acara belum dapat dimuat.");
      }

      const configured = sortEvents(
        ((data?.invitations ?? []) as PersonalEvent[]).filter(
          (invitation) => invitation.eventConfigured,
        ),
      );
      setEvents(configured);
      setEventId((current) => {
        if (configured.some((event) => event.id === current)) return current;
        return configured.find((event) => event.accessPaid)?.id ?? configured[0]?.id ?? "";
      });
    } catch (error) {
      setEvents([]);
      setEventId("");
      setNotice(error instanceof Error ? error.message : "Daftar acara belum dapat dimuat.");
    } finally {
      setEventsLoading(false);
    }
  }, []);

  const loadCurrent = useCallback(async () => {
    if (!eventId || !selectedEvent) {
      setPersonal([]);
      setGuests([]);
      setLoading(false);
      return;
    }

    if (!selectedEvent.accessPaid) {
      setPersonal([]);
      setGuests([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setNotice("");
    try {
      const encodedId = encodeURIComponent(eventId);
      const [personalResponse, guestResponse] = await Promise.all([
        fetch(`/api/personal-invitations?invitationId=${encodedId}`, {
          cache: "no-store",
        }),
        fetch(`/api/guests?invitationId=${encodedId}`, { cache: "no-store" }),
      ]);
      const personalData = await personalResponse.json().catch(() => null);
      const guestData = await guestResponse.json().catch(() => null);
      if (!personalResponse.ok) {
        throw new Error(
          personalData?.error || "Personal Invitation belum dapat dimuat.",
        );
      }
      if (!guestResponse.ok) {
        throw new Error(guestData?.error || "Daftar tamu belum dapat dimuat.");
      }
      setPersonal((personalData?.invitations ?? []) as PersonalGuest[]);
      setGuests((guestData?.guests ?? []) as Guest[]);
    } catch (error) {
      setPersonal([]);
      setGuests([]);
      setNotice(
        error instanceof Error ? error.message : "Personal Invitation belum dapat dimuat.",
      );
    } finally {
      setLoading(false);
    }
  }, [eventId, selectedEvent]);

  useEffect(() => {
    loadEvents().catch(() => undefined);
  }, [loadEvents]);

  useEffect(() => {
    setGuestId("");
    setName("");
    setPhone("");
    setEditingId(null);
    setPasswordId(null);
    setPassword("");
    loadCurrent().catch(() => undefined);
  }, [eventId, loadCurrent]);

  const personalIds = useMemo(
    () => new Set(personal.map((item) => item.id)),
    [personal],
  );
  const availableGuests = useMemo(
    () => guests.filter((item) => !personalIds.has(item.id)),
    [guests, personalIds],
  );

  async function createFromExisting() {
    if (!eventId || !guestId) return;
    setBusyId("create-existing");
    setNotice("");
    try {
      const response = await fetch("/api/personal-invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId: eventId, guestId }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || "Personal Invitation belum dapat dibuat.");
      }
      setGuestId("");
      await loadCurrent();
      setNotice("Personal Invitation dibuat untuk acara ini.");
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Personal Invitation belum dapat dibuat.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function createNew() {
    if (!eventId || !name.trim()) return;
    setBusyId("create-new");
    setNotice("");
    try {
      const response = await fetch("/api/personal-invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitationId: eventId,
          name: name.trim(),
          phone: phone.trim(),
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || "Personal Invitation belum dapat dibuat.");
      }
      setName("");
      setPhone("");
      await loadCurrent();
      setNotice("Tamu dan Personal Invitation dibuat untuk acara ini.");
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Personal Invitation belum dapat dibuat.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function patch(
    id: string,
    body: Record<string, unknown>,
    successMessage: string,
  ) {
    if (!eventId) return false;
    setBusyId(id);
    setNotice("");
    try {
      const response = await fetch("/api/personal-invitations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId: eventId, id, ...body }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || "Personal Invitation belum dapat diperbarui.");
      }
      setPersonal((current) =>
        current.map((item) =>
          item.id === id ? (data.invitation as PersonalGuest) : item,
        ),
      );
      setNotice(successMessage);
      return true;
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Personal Invitation belum dapat diperbarui.",
      );
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
    const ok = await patch(
      item.id,
      { name: editName.trim(), phone: editPhone.trim() },
      "Data tamu diperbarui.",
    );
    if (ok) setEditingId(null);
  }

  async function savePassword(item: PersonalGuest) {
    if (password.trim().length < 6) {
      setNotice("Password minimal 6 karakter.");
      return;
    }
    const ok = await patch(
      item.id,
      { passwordProtected: true, password: password.trim() },
      "Password Personal Invitation diperbarui.",
    );
    if (ok) {
      setPasswordId(null);
      setPassword("");
    }
  }

  async function disablePassword(item: PersonalGuest) {
    const ok = await patch(
      item.id,
      { passwordProtected: false },
      "Password Personal Invitation dimatikan.",
    );
    if (ok) {
      setPasswordId(null);
      setPassword("");
    }
  }

  const publishedCount = personal.filter((item) => item.personalPublished).length;
  const protectedCount = personal.filter(
    (item) => item.personalPasswordProtected,
  ).length;
  const totalViews = personal.reduce(
    (sum, item) => sum + (item.personalViewCount || 0),
    0,
  );

  return (
    <div className="dc-dashboard-page mx-auto w-[80vw] max-w-full min-w-0 pb-16 pt-7 sm:pt-8">
      <EventScopePicker
        events={events}
        value={eventId}
        onChange={setEventId}
        disabled={eventsLoading || Boolean(busyId)}
      />

      {notice && <DashboardNotice className="mt-4">{notice}</DashboardNotice>}

      {!events.length ? null : selectedEvent && !selectedEvent.accessPaid ? (
        <section className="mt-4 rounded-2xl border border-border/70 bg-background shadow-[0_1px_2px_rgba(0,0,0,0.03)] p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="font-[family-name:var(--font-dc-mono)] text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                Belum aktif
              </p>
              <h2 className="mt-1 font-[family-name:var(--font-dc-heading)] text-lg font-semibold text-foreground">
                {selectedEvent.title || "Acara"}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Aktifkan Undangan Digital untuk memakai Personal Invitation pada acara ini.
              </p>
            </div>
            <Button asChild size="sm">
              <Link
                href={`/packages?package=INVITATION_BASIC&invitationId=${encodeURIComponent(selectedEvent.id)}`}
              >
                <CreditCard className="h-4 w-4" />
                Aktifkan Rp150.000
              </Link>
            </Button>
          </div>
        </section>
      ) : selectedEvent ? (
        <>
          <section className="mt-4 grid gap-3 sm:grid-cols-3">
            <Metric label="Personal Invitation" value={String(personal.length)} />
            <Metric label="Publish" value={String(publishedCount)} />
            <Metric label="Dibuka" value={String(totalViews)} />
          </section>

          <div className="mt-5 grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
            <section className="space-y-4 rounded-2xl border border-border/70 bg-background shadow-[0_1px_2px_rgba(0,0,0,0.03)] p-4 sm:p-5">
              <div>
                <p className="font-[family-name:var(--font-dc-mono)] text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                  Tamu · {selectedEvent.title || "Acara"}
                </p>
                <h2 className="mt-1 font-[family-name:var(--font-dc-heading)] text-lg font-semibold text-foreground">
                  Buat Personal Invitation
                </h2>
              </div>

              <div className="rounded-xl border border-border/70 bg-background p-3">
                <p className="text-xs font-semibold text-foreground">Dari daftar tamu</p>
                <select
                  value={guestId}
                  onChange={(event) => setGuestId(event.target.value)}
                  disabled={loading || Boolean(busyId)}
                  className="mt-2 w-full px-3 text-sm"
                >
                  <option value="">Pilih tamu</option>
                  {availableGuests.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                      {item.phone ? ` · ${item.phone}` : ""}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  size="sm"
                  className="mt-2 w-full"
                  disabled={!guestId || Boolean(busyId)}
                  onClick={createFromExisting}
                >
                  <Plus className="h-4 w-4" />
                  Buat Personal Invitation
                </Button>
              </div>

              <div className="rounded-xl border border-border/70 bg-background p-3">
                <p className="text-xs font-semibold text-foreground">Tamu belum ada</p>
                <div className="mt-2 space-y-2">
                  <Input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Nama tamu"
                    disabled={Boolean(busyId)}
                  />
                  <Input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="Nomor WhatsApp (opsional)"
                    disabled={Boolean(busyId)}
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="w-full"
                    disabled={!name.trim() || Boolean(busyId)}
                    onClick={createNew}
                  >
                    <Plus className="h-4 w-4" />
                    Tambah & buat undangan
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <SmallMetric label="Password" value={String(protectedCount)} />
                <SmallMetric
                  label="Draft"
                  value={String(personal.length - publishedCount)}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-border/70 bg-background shadow-[0_1px_2px_rgba(0,0,0,0.03)] p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-[family-name:var(--font-dc-mono)] text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                    Daftar · {selectedEvent.title || "Acara"}
                  </p>
                  <h2 className="mt-1 font-[family-name:var(--font-dc-heading)] text-lg font-semibold text-foreground">
                    Personal Invitation
                  </h2>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => loadCurrent()}
                  disabled={loading}
                >
                  <RefreshCw className="h-4 w-4" />
                  Muat ulang
                </Button>
              </div>

              <div className="mt-4 space-y-3">
                {personal.length === 0 && (
                  <div className="rounded-xl border border-border/70 bg-background px-3 py-6 text-center text-xs text-muted-foreground">
                    Belum ada Personal Invitation untuk acara ini.
                  </div>
                )}
                {personal.map((item) => {
                  const publicUrl =
                    selectedEvent.slug && item.personalToken
                      ? `https://${selectedEvent.slug}.${ROOT_DOMAIN}/p/${item.personalToken}`
                      : "";
                  const editing = editingId === item.id;
                  const passwordOpen = passwordId === item.id;
                  return (
                    <article
                      key={item.id}
                      className="rounded-xl border border-border/70 bg-background p-3.5"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1">
                          {editing ? (
                            <div className="grid gap-2 sm:grid-cols-2">
                              <Input
                                value={editName}
                                onChange={(event) => setEditName(event.target.value)}
                                placeholder="Nama tamu"
                              />
                              <Input
                                value={editPhone}
                                onChange={(event) => setEditPhone(event.target.value)}
                                placeholder="Nomor WhatsApp"
                              />
                            </div>
                          ) : (
                            <>
                              <p className="truncate text-sm font-semibold text-foreground">
                                {item.name}
                              </p>
                              <p className="mt-0.5 truncate font-[family-name:var(--font-dc-mono)] text-[9px] text-muted-foreground">
                                {item.phone || "Tanpa nomor"} · {item.personalViewCount || 0}{" "}
                                dibuka
                              </p>
                            </>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button asChild size="sm">
                            <Link
                              href={`/dashboard/personal-invitation/${item.id}`}
                              target="_blank"
                            >
                              <Eye className="h-4 w-4" />
                              Pratinjau
                            </Link>
                          </Button>
                          {editing ? (
                            <Button
                              type="button"
                              size="sm"
                              disabled={busyId === item.id}
                              onClick={() => saveEdit(item)}
                            >
                              Simpan edit
                            </Button>
                          ) : (
                            <Button type="button" size="sm" onClick={() => startEdit(item)}>
                              <PenLine className="h-4 w-4" />
                              Edit
                            </Button>
                          )}
                          <Button
                            type="button"
                            size="sm"
                            disabled={busyId === item.id}
                            onClick={() =>
                              patch(
                                item.id,
                                { published: !item.personalPublished },
                                item.personalPublished
                                  ? "Personal Invitation ditarik dari publik."
                                  : "Personal Invitation dipublish.",
                              )
                            }
                          >
                            <Send className="h-4 w-4" />
                            {item.personalPublished ? "Tarik publik" : "Publish"}
                          </Button>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-lg bg-primary/[0.07] px-2 py-1 font-[family-name:var(--font-dc-mono)] text-[8px] uppercase tracking-[0.08em] text-primary">
                          {item.personalPublished ? "Terbit" : "Draft"}
                        </span>
                        <span className="rounded-lg bg-foreground/[0.04] px-2 py-1 font-[family-name:var(--font-dc-mono)] text-[8px] uppercase tracking-[0.08em] text-muted-foreground">
                          {item.personalPasswordProtected ? "Password aktif" : "Tanpa password"}
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            setPasswordId(passwordOpen ? null : item.id);
                            setPassword("");
                          }}
                        >
                          <KeyRound className="h-4 w-4" />
                          {item.personalPasswordProtected
                            ? "Ganti password"
                            : "Aktifkan password"}
                        </Button>
                        {item.personalPasswordProtected && (
                          <Button
                            type="button"
                            size="sm"
                            disabled={busyId === item.id}
                            onClick={() => disablePassword(item)}
                          >
                            <ShieldOff className="h-4 w-4" />
                            Matikan password
                          </Button>
                        )}
                        {item.personalPublished && publicUrl && (
                          <Button asChild size="sm">
                            <a href={publicUrl} target="_blank" rel="noreferrer">
                              Buka publik
                            </a>
                          </Button>
                        )}
                      </div>

                      {passwordOpen && (
                        <div className="mt-3 flex flex-col gap-2 rounded-lg border border-primary/15 bg-primary/[0.035] p-3 sm:flex-row sm:items-center">
                          <Input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Password baru minimal 6 karakter"
                            className="min-w-0 flex-1"
                          />
                          <Button
                            type="button"
                            size="sm"
                            disabled={password.trim().length < 6 || busyId === item.id}
                            onClick={() => savePassword(item)}
                          >
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
        </>
      ) : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <DashboardMetricCard label={label} value={value} />;
}

function SmallMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/70 bg-background/75 px-3 py-2.5">
      <p className="font-[family-name:var(--font-dc-mono)] text-[8px] uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-xs font-semibold text-foreground">{value}</p>
    </div>
  );
}
