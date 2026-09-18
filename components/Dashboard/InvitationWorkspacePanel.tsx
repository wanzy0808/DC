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
import { useDashboardI18n } from "@/components/Dashboard/useDashboardI18n";
import {
  DashboardCompactStat,
  DashboardEmptyState,
  DashboardMetricCard,
  DashboardMetricGrid,
  DashboardNotice,
  DashboardPage,
  DashboardSectionHeader,
  DashboardStatusBadge,
  DashboardSurface,
} from "@/components/Dashboard/DashboardPrimitives";

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
  const { d } = useDashboardI18n();
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
        throw new Error(invitationData?.error || d("Undangan belum dapat dimuat."));
      }
      setInvitations(
        sortInvitations((invitationData?.invitations ?? []) as Invitation[]),
      );
      setGuests((guestData?.guests ?? []) as Guest[]);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : d("Undangan belum dapat dimuat."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load().catch(() => undefined);
  }, [load]);

  async function publishInvitation(invitation: Invitation) {
    if (invitation.isPublished) {
      setNotice(d("Undangan yang sudah terbit dikunci dan tidak dapat dikembalikan menjadi draft."));
      return;
    }
    if (!invitation.eventConfigured) {
      setNotice(d("Lengkapi dan simpan detail acara sebelum publish."));
      return;
    }
    if (!invitation.templateKey?.trim()) {
      setNotice(d("Pilih dan simpan template undangan sebelum publish."));
      return;
    }

    setBusyId(invitation.id);
    setNotice("");
    try {
      const response = await fetch("/api/invitations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: invitation.id, isPublished: true }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || d("Undangan belum dapat dipublish."));
      setInvitations((current) =>
        current.map((item) =>
          item.id === invitation.id ? data.invitation : item,
        ),
      );
      setNotice(d("Undangan berhasil diterbitkan."));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : d("Undangan belum dapat dipublish."));
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
    <DashboardPage className="pt-7 sm:pt-8">
      {notice && <DashboardNotice className="mb-4">{notice}</DashboardNotice>}

      <DashboardMetricGrid>
        <Metric icon={Users} label={d("Undangan")} value={String(invitations.length)} />
        <Metric icon={CalendarDays} label={d("Siap desain")} value={String(readyCount)} />
        <Metric icon={Send} label={d("Dipublish")} value={String(publishedCount)} />
        <Metric icon={Eye} label={d("Total dibuka")} value={String(openedCount)} />
      </DashboardMetricGrid>

      <DashboardSurface className="mt-5 p-4 sm:p-5">
        <DashboardSectionHeader
          eyebrow={d("Undangan Digital")}
          title={d("Semua acara")}
          description={d("Pilih acara untuk membuka Studio, menyelesaikan desain, dan menerbitkan undangan.")}
          actions={
            <>
              <Button type="button" size="sm" onClick={onCreateSequence}>
                <Plus className="h-4 w-4" />
                {d("Tambah acara")}
              </Button>
              <Button type="button" size="sm" onClick={() => load()} disabled={loading}>
                <RefreshCw className="h-4 w-4" />
                {d("Muat ulang")}
              </Button>
            </>
          }
        />

        {invitations.length === 0 ? (
          <DashboardEmptyState
            className="mt-4"
            icon={CalendarDays}
            title={d("Belum ada acara")}
            description={d("Buat rangkaian acara terlebih dahulu untuk mulai mendesain Undangan Digital.")}
            action={
              <Button type="button" size="sm" onClick={onCreateSequence}>
                <Plus className="h-4 w-4" />
                {d("Tambah acara")}
              </Button>
            }
          />
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {invitations.map((invitation) => {
              const url = publicUrl(invitation);
              const title = invitation.title.trim() || d("Acara tanpa judul");
              const purchaseHref = `/packages?package=INVITATION_BASIC&invitationId=${encodeURIComponent(invitation.id)}`;
              const studioHref = `/dashboard/editor?type=${invitation.type}&invitationId=${encodeURIComponent(invitation.id)}`;
              const hasDesign = Boolean(invitation.templateKey?.trim());

              return (
                <article
                  key={invitation.id}
                  className="rounded-xl border border-border/70 bg-background p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-[family-name:var(--font-dc-mono)] text-[8px] uppercase tracking-[0.12em] text-muted-foreground">
                        Undangan Digital
                      </p>
                      <h3 className="mt-1 truncate text-sm font-semibold text-foreground">
                        {title}
                      </h3>
                    </div>
                    <span className="shrink-0 rounded-lg bg-primary/[0.07] px-2 py-1 font-[family-name:var(--font-dc-mono)] text-[8px] uppercase tracking-[0.1em] text-primary">
                      {invitation.isPublished
                        ? d("Terbit")
                        : !invitation.eventConfigured
                          ? d("Belum lengkap")
                          : hasDesign
                            ? d("Siap publish")
                            : d("Belum desain")}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <SmallMetric label={d("Dibuka")} value={String(invitation.viewCount || 0)} />
                    <SmallMetric label={d("Venue")} value={invitation.venue || d("Belum diatur")} />
                  </div>

                  <div className="mt-4 rounded-xl border border-primary/12 bg-primary/[0.025] p-3">
                    <p className="font-[family-name:var(--font-dc-mono)] text-[8px] uppercase tracking-[0.1em] text-muted-foreground">
                      Desain undangan
                    </p>
                    {invitation.eventConfigured ? (
                      <Button asChild size="lg" className="mt-2 w-full">
                        <Link href={studioHref} aria-label={`${hasDesign ? "Edit" : "Buat"} undangan untuk ${title}`}>
                          <PenLine className="h-4 w-4" />
                          {hasDesign ? d("Edit undangan") : d("Buat undangan")}
                        </Link>
                      </Button>
                    ) : (
                      <Button type="button" size="lg" className="mt-2 w-full" onClick={onCreateSequence}>
                        <CalendarDays className="h-4 w-4" />
                        {d("Lengkapi acara")}
                      </Button>
                    )}
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {!invitation.eventConfigured ? (
                      <div className="flex h-9 items-center justify-center rounded-[10px] border border-border/70 bg-foreground/[0.018] px-3 text-center font-[family-name:var(--font-dc-mono)] text-[8px] uppercase tracking-[0.08em] text-muted-foreground">
                        {d("Lengkapi acara")} dulu
                      </div>
                    ) : !hasDesign ? (
                      <div className="flex h-9 items-center justify-center rounded-[10px] border border-border/70 bg-foreground/[0.018] px-3 text-center font-[family-name:var(--font-dc-mono)] text-[8px] uppercase tracking-[0.08em] text-muted-foreground">
                        {d("Simpan template dulu")}
                      </div>
                    ) : invitation.isPublished ? (
                      <DashboardStatusBadge active className="h-9 w-full justify-center">
                        {d("Terbit · terkunci")}
                      </DashboardStatusBadge>
                    ) : invitation.accessPaid ? (
                      <Button
                        size="sm"
                        className="w-full"
                        disabled={loading || busyId === invitation.id}
                        onClick={() => publishInvitation(invitation)}
                      >
                        <Send className="h-4 w-4" />
                        {busyId === invitation.id ? d("Menyimpan...") : d("Publish")}
                      </Button>
                    ) : (
                      <Button asChild size="sm" className="w-full">
                        <Link href={purchaseHref}>
                          <Send className="h-4 w-4" />
                          {d("Beli paket & publish")}
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
                      <div className="flex h-9 items-center justify-center rounded-[10px] border border-border/70 bg-foreground/[0.018] px-3 text-center font-[family-name:var(--font-dc-mono)] text-[8px] uppercase tracking-[0.08em] text-muted-foreground">
                        Belum dipublish
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </DashboardSurface>

      <DashboardSurface className="mt-5 p-4 sm:p-5">
        <DashboardSectionHeader
          eyebrow={d("RSVP")}
          title={d("Respons terbaru")}
          description={d("Respons terbaru dari seluruh undangan yang berada di workspace ini.")}
          actions={<DashboardStatusBadge active>{responders.length} respons</DashboardStatusBadge>}
        />

        <div className="mt-4 max-h-80 space-y-2 overflow-y-auto pr-1">
          {responders.length === 0 && (
            <DashboardEmptyState
              title={d("Belum ada respons")}
              description={d("Respons RSVP tamu akan muncul di sini setelah undangan mulai dibagikan.")}
            />
          )}
          {responders.map((guest) => (
            <div
              key={guest.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background px-3 py-2.5"
            >
              <div className="min-w-0">
                <span className="block truncate text-xs font-medium text-foreground">
                  {guest.name}
                </span>
                <span className="mt-0.5 block truncate text-[9px] text-muted-foreground">
                  {guest.invitation?.title || d("Acara")}
                </span>
              </div>
              <span className="shrink-0 font-[family-name:var(--font-dc-mono)] text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
                {d(responseLabel[guest.rsvpStatus] || guest.rsvpStatus)} · {guest.plusOnes + 1} pax
              </span>
            </div>
          ))}
        </div>
      </DashboardSurface>
    </DashboardPage>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Send; label: string; value: string }) {
  return <DashboardMetricCard icon={Icon} label={label} value={value} />;
}

function SmallMetric({ label, value }: { label: string; value: string }) {
  return <DashboardCompactStat label={label} value={value} />;
}
