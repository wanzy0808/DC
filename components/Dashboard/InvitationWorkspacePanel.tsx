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
  DashboardEmptyState,
  DashboardMetricCard,
  DashboardMetricGrid,
  DashboardNotice,
  DashboardPage,
  DashboardPageHeader,
  DashboardStatusBadge,
  DashboardPanel,
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
    <DashboardPage>
      <DashboardPageHeader eyebrow={d("Publikasi")} title={d("Undangan Digital")} description={d("Pilih yang ingin kamu desain atau terbitkan.")} />
      {notice && <DashboardNotice className="mb-4">{notice}</DashboardNotice>}

      <DashboardMetricGrid>
        <Metric icon={Users} label={d("Total")} value={String(invitations.length)} />
        <Metric icon={CalendarDays} label={d("Siap desain")} value={String(readyCount)} />
        <Metric icon={Send} label={d("Dipublish")} value={String(publishedCount)} />
        <Metric icon={Eye} label={d("Total dibuka")} value={String(openedCount)} />
      </DashboardMetricGrid>

      <DashboardPanel className="mt-5"
          eyebrow={d("Daftar")}
          title={d("Undangan")}
          description={d("Buka Studio, lanjutkan desain, atau publish dari daftar ini.")}
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
      >

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
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left">
              <thead><tr>{["Nama", "Venue", "Status", "Dibuka", "Aksi"].map(label => <th key={label} className="px-3 py-3">{d(label)}</th>)}</tr></thead>
              <tbody>{invitations.map((invitation) => {
                const title = invitation.title.trim() || d("Acara tanpa judul");
                const hasDesign = Boolean(invitation.templateKey?.trim());
                const studioHref = `/dashboard/editor?type=${invitation.type}&invitationId=${encodeURIComponent(invitation.id)}`;
                const purchaseHref = `/packages?package=INVITATION_BASIC&invitationId=${encodeURIComponent(invitation.id)}`;
                return (
                  <tr key={invitation.id}>
                    <td className="max-w-64 px-3 py-4"><p className="break-words text-sm font-semibold">{title}</p></td>
                    <td className="max-w-48 px-3 py-4 text-sm text-muted-foreground">{invitation.venue || d("Belum diatur")}</td>
                    <td className="px-3 py-4"><DashboardStatusBadge active={invitation.isPublished}>{invitation.isPublished ? d("Terbit · terkunci") : !invitation.eventConfigured ? d("Belum lengkap") : hasDesign ? d("Siap publish") : d("Belum desain")}</DashboardStatusBadge></td>
                    <td className="px-3 py-4 font-[family-name:var(--font-dc-mono)] text-sm">{invitation.viewCount || 0}</td>
                    <td className="px-3 py-4">
                      <div className="flex flex-wrap justify-end gap-2">
                        {invitation.eventConfigured ? <Button asChild size="sm"><Link href={studioHref} aria-label={`${hasDesign ? d("Edit undangan") : d("Buat undangan")} · ${title}`}><PenLine className="size-4" />{hasDesign ? d("Edit undangan") : d("Buat undangan")}</Link></Button> : <Button size="sm" onClick={onCreateSequence}><CalendarDays className="size-4" />{d("Lengkapi acara")}</Button>}
                        {invitation.isPublished ? <Button asChild size="sm"><a href={publicUrl(invitation)} target="_blank" rel="noreferrer" aria-label={`${d("Buka publik")} · ${title}`}><ArrowUpRight className="size-4" />{d("Buka publik")}</a></Button> : invitation.eventConfigured && hasDesign ? invitation.accessPaid ? <Button size="sm" disabled={loading || busyId === invitation.id} onClick={() => publishInvitation(invitation)}><Send className="size-4" />{busyId === invitation.id ? d("Menyimpan...") : d("Publish")}</Button> : <Button asChild size="sm"><Link href={purchaseHref}><Send className="size-4" />{d("Beli paket & publish")}</Link></Button> : <span className="self-center text-xs text-muted-foreground">{invitation.eventConfigured ? d("Simpan template dulu") : d("Lengkapi acara dulu")}</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
        )}
      </DashboardPanel>

      <DashboardPanel className="mt-5"
          eyebrow={d("RSVP")}
          title={d("Respons terbaru")}
          description={d("Respons terbaru dari undangan yang sudah dibagikan.")}
          actions={<DashboardStatusBadge active>{responders.length} respons</DashboardStatusBadge>}
      >

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
                <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                  {guest.invitation?.title || d("Acara tanpa judul")}
                </span>
              </div>
              <span className="shrink-0 font-[family-name:var(--font-dc-mono)] text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                {d(responseLabel[guest.rsvpStatus] || guest.rsvpStatus)} · {guest.plusOnes + 1} pax
              </span>
            </div>
          ))}
        </div>
      </DashboardPanel>
    </DashboardPage>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Send; label: string; value: string }) {
  return <DashboardMetricCard icon={Icon} label={label} value={value} />;
}
