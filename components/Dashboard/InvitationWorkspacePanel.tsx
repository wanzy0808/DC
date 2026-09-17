"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Eye,
  PenLine,
  Plus,
  RefreshCw,
  Send,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Invitation = {
  id: string;
  slug: string;
  type: "WEDDING" | "ADAT_AKAD";
  title: string;
  venue: string;
  templateKey: string;
  eventConfigured: boolean;
  isPublished: boolean;
  viewCount: number;
  accessPaid: boolean;
  createdAt: string;
};

type Guest = {
  id: string;
  invitationId: string;
  name: string;
  rsvpStatus: string;
  plusOnes: number;
  invitation?: { id: string; title: string; slug: string };
};

type Props = {
  onCreateSequence: () => void;
};

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_INVITATION_ROOT_DOMAIN || "dcwedding.com";

const responseLabel: Record<string, string> = {
  ATTENDING: "Hadir",
  NOT_ATTENDING: "Tidak hadir",
  TENTATIVE: "Ragu",
};

function sortInvitations(items: Invitation[]) {
  return [...items].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

function publicUrl(invitation: Invitation) {
  return `https://${invitation.slug}.${ROOT_DOMAIN}/`;
}

export default function InvitationWorkspacePanel({ onCreateSequence }: Props) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [invitationResponse, guestResponse] = await Promise.all([
        fetch("/api/invitations?all=1", { cache: "no-store" }),
        fetch("/api/guests?all=1", { cache: "no-store" }),
      ]);
      const invitationData = await invitationResponse.json().catch(() => null);
      const guestData = await guestResponse.json().catch(() => null);
      if (!invitationResponse.ok) {
        throw new Error(invitationData?.error || "Undangan belum dapat dimuat.");
      }
      setInvitations(
        sortInvitations((invitationData?.invitations ?? []) as Invitation[]),
      );
      setGuests((guestData?.guests ?? []) as Guest[]);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Undangan belum dapat dimuat.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load().catch(() => undefined);
  }, [load]);

  async function togglePublish(invitation: Invitation) {
    if (!invitation.eventConfigured) {
      setNotice("Lengkapi dan simpan detail acara sebelum publish.");
      return;
    }
    if (!invitation.templateKey?.trim()) {
      setNotice("Pilih dan simpan template undangan sebelum publish.");
      return;
    }

    setBusyId(invitation.id);
    setNotice("");
    try {
      const response = await fetch("/api/invitations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: invitation.id, isPublished: !invitation.isPublished }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "Status publish belum dapat diubah.");
      setInvitations((current) =>
        current.map((item) =>
          item.id === invitation.id ? data.invitation : item,
        ),
      );
      setNotice(
        data.invitation?.isPublished
          ? "Undangan berhasil diterbitkan."
          : "Undangan ditarik dari publik.",
      );
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Status publish belum dapat diubah.");
    } finally {
      setBusyId(null);
    }
  }

  const publishedCount = invitations.filter((item) => item.isPublished).length;
  const readyCount = invitations.filter((item) => item.eventConfigured).length;
  const openedCount = invitations.reduce(
    (sum, item) => sum + (item.viewCount || 0),
    0,
  );
  const responders = useMemo(
    () => guests.filter((guest) => guest.rsvpStatus && guest.rsvpStatus !== "PENDING"),
    [guests],
  );

  return (
    <div className="dc-dashboard-page mx-auto w-[80vw] max-w-full min-w-0 pb-16 pt-7 sm:pt-8">
      {notice && (
        <div
          className="mb-4 rounded-xl border border-primary/15 bg-primary/[0.035] px-3 py-2.5 text-xs text-muted-foreground"
          role="status"
        >
          {notice}
        </div>
      )}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Users} label="Undangan" value={String(invitations.length)} />
        <Metric icon={CalendarDays} label="Siap desain" value={String(readyCount)} />
        <Metric icon={Send} label="Dipublish" value={String(publishedCount)} />
        <Metric icon={Eye} label="Total dibuka" value={String(openedCount)} />
      </section>

      <section className="mt-5 rounded-2xl border border-border/70 bg-background shadow-[0_1px_2px_rgba(0,0,0,0.03)] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
              Undangan Digital
            </p>
            <h2 className="mt-1 font-[family-name:var(--font-cinzel)] text-lg font-semibold text-foreground">
              Semua acara
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={onCreateSequence}>
              <Plus className="h-4 w-4" />
              Tambah acara
            </Button>
            <Button type="button" size="sm" onClick={() => load()} disabled={loading}>
              <RefreshCw className="h-4 w-4" />
              Muat ulang
            </Button>
          </div>
        </div>

        {invitations.length === 0 ? (
          <div className="mt-4 rounded-xl border border-border/70 bg-background/70 p-5 text-sm text-muted-foreground">
            Belum ada acara. Buat acara terlebih dahulu untuk mulai mendesain undangan.
          </div>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {invitations.map((invitation) => {
              const url = publicUrl(invitation);
              const title = invitation.title.trim() || "Acara tanpa judul";
              const purchaseHref = `/packages?package=INVITATION_BASIC&invitationId=${encodeURIComponent(invitation.id)}`;
              const studioHref = `/dashboard/editor?type=${invitation.type}&invitationId=${encodeURIComponent(invitation.id)}`;
              const hasDesign = Boolean(invitation.templateKey?.trim());

              return (
                <article
                  key={invitation.id}
                  className="rounded-xl border border-border/80 bg-background/80 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-[family-name:var(--font-dm-mono)] text-[8px] uppercase tracking-[0.12em] text-muted-foreground">
                        Undangan Digital
                      </p>
                      <h3 className="mt-1 truncate text-sm font-semibold text-foreground">
                        {title}
                      </h3>
                    </div>
                    <span className="shrink-0 rounded-lg bg-primary/[0.07] px-2 py-1 font-[family-name:var(--font-dm-mono)] text-[8px] uppercase tracking-[0.1em] text-primary">
                      {invitation.isPublished
                        ? "Terbit"
                        : !invitation.eventConfigured
                          ? "Belum lengkap"
                          : hasDesign
                            ? "Siap publish"
                            : "Belum desain"}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <SmallMetric label="Dibuka" value={String(invitation.viewCount || 0)} />
                    <SmallMetric label="Venue" value={invitation.venue || "Belum diatur"} />
                  </div>

                  <div className="mt-4 rounded-xl border border-primary/12 bg-primary/[0.025] p-3">
                    <p className="font-[family-name:var(--font-dm-mono)] text-[8px] uppercase tracking-[0.1em] text-muted-foreground">
                      Desain undangan
                    </p>
                    {invitation.eventConfigured ? (
                      <Button asChild size="lg" className="mt-2 w-full">
                        <Link href={studioHref} aria-label={`${hasDesign ? "Edit" : "Buat"} undangan untuk ${title}`}>
                          <PenLine className="h-4 w-4" />
                          {hasDesign ? "Edit undangan" : "Buat undangan"}
                        </Link>
                      </Button>
                    ) : (
                      <Button type="button" size="lg" className="mt-2 w-full" onClick={onCreateSequence}>
                        <CalendarDays className="h-4 w-4" />
                        Lengkapi acara
                      </Button>
                    )}
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {!invitation.eventConfigured ? (
                      <div className="flex h-9 items-center justify-center rounded-[10px] border border-border/70 bg-foreground/[0.018] px-3 text-center font-[family-name:var(--font-dm-mono)] text-[8px] uppercase tracking-[0.08em] text-muted-foreground">
                        Lengkapi acara dulu
                      </div>
                    ) : !hasDesign ? (
                      <div className="flex h-9 items-center justify-center rounded-[10px] border border-border/70 bg-foreground/[0.018] px-3 text-center font-[family-name:var(--font-dm-mono)] text-[8px] uppercase tracking-[0.08em] text-muted-foreground">
                        Simpan template dulu
                      </div>
                    ) : invitation.isPublished ? (
                      <Button
                        size="sm"
                        className="w-full"
                        disabled={loading || busyId === invitation.id}
                        onClick={() => togglePublish(invitation)}
                      >
                        <Send className="h-4 w-4" />
                        {busyId === invitation.id ? "Menyimpan..." : "Tarik publik"}
                      </Button>
                    ) : invitation.accessPaid ? (
                      <Button
                        size="sm"
                        className="w-full"
                        disabled={loading || busyId === invitation.id}
                        onClick={() => togglePublish(invitation)}
                      >
                        <Send className="h-4 w-4" />
                        {busyId === invitation.id ? "Menyimpan..." : "Publish"}
                      </Button>
                    ) : (
                      <Button asChild size="sm" className="w-full">
                        <Link href={purchaseHref}>
                          <Send className="h-4 w-4" />
                          Beli paket & publish
                        </Link>
                      </Button>
                    )}

                    {invitation.isPublished ? (
                      <Button asChild size="sm" className="w-full">
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          title="Buka undangan publik"
                          aria-label={`Buka undangan publik ${title}`}
                        >
                          <ArrowUpRight className="h-4 w-4" />
                          Buka publik
                        </a>
                      </Button>
                    ) : (
                      <div className="flex h-9 items-center justify-center rounded-[10px] border border-border/70 bg-foreground/[0.018] px-3 text-center font-[family-name:var(--font-dm-mono)] text-[8px] uppercase tracking-[0.08em] text-muted-foreground">
                        Belum dipublish
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-5 rounded-2xl border border-border/70 bg-background shadow-[0_1px_2px_rgba(0,0,0,0.03)] p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
              RSVP
            </p>
            <h2 className="mt-1 font-[family-name:var(--font-cinzel)] text-lg font-semibold text-foreground">
              Respons terbaru
            </h2>
          </div>
          <span className="rounded-lg bg-primary/[0.07] px-2.5 py-1 font-[family-name:var(--font-dm-mono)] text-[9px] text-primary">
            {responders.length}
          </span>
        </div>

        <div className="mt-4 max-h-80 space-y-2 overflow-y-auto pr-1">
          {responders.length === 0 && (
            <div className="rounded-xl border border-border/70 bg-background px-3 py-5 text-center text-xs text-muted-foreground">
              Belum ada tamu yang merespon.
            </div>
          )}
          {responders.map((guest) => (
            <div
              key={guest.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-background/80 px-3 py-2.5"
            >
              <div className="min-w-0">
                <span className="block truncate text-xs font-medium text-foreground">
                  {guest.name}
                </span>
                <span className="mt-0.5 block truncate text-[9px] text-muted-foreground">
                  {guest.invitation?.title || "Acara"}
                </span>
              </div>
              <span className="shrink-0 font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
                {responseLabel[guest.rsvpStatus] || guest.rsvpStatus} · {guest.plusOnes + 1} pax
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Send;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-4 rounded-2xl border border-border/70 bg-background p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-4 w-4" strokeWidth={1.8} />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="mt-0.5 truncate text-xl font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

function SmallMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-border/70 bg-background px-2.5 py-2">
      <p className="font-[family-name:var(--font-dm-mono)] text-[8px] uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 truncate text-[11px] font-medium text-foreground">{value}</p>
    </div>
  );
}
