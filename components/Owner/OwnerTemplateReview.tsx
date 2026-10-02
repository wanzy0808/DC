"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type ReviewTemplate = {
  id: string;
  templateNo: string;
  name: string;
  previewUrl: string;
  category: string;
  description: string;
  status: string;
  updatedAt: string;
  designer: {
    id: string;
    firstName: string;
    lastName: string | null;
    email: string;
  };
};

type AssignmentInvitation = {
  id: string;
  title: string;
  eventCategory: string;
  groomName: string;
  brideName: string;
  templateKey: string;
  eventConfigured: boolean;
  updatedAt: string;
};

type AssignmentUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  invitations: AssignmentInvitation[];
};

function personName(user: AssignmentUser) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || user.email;
}

function eventName(invitation: AssignmentInvitation) {
  const couple = [invitation.groomName, invitation.brideName].filter(Boolean).join(" & ");
  return invitation.title?.trim() || couple || "Event draft";
}

function statusLabel(status: string) {
  if (status === "REVIEW") return "Menunggu Owner";
  if (status === "DRAFT") return "Draft Owner";
  if (status === "PUBLISHED") return "Published";
  return status;
}

export default function OwnerTemplateReview() {
  const [templates, setTemplates] = useState<ReviewTemplate[]>([]);
  const [users, setUsers] = useState<AssignmentUser[]>([]);
  const [message, setMessage] = useState("Memuat antrean template...");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [targetUserId, setTargetUserId] = useState("");
  const [targetInvitationId, setTargetInvitationId] = useState("");

  async function load() {
    const [templateResponse, userResponse] = await Promise.all([
      fetch("/api/designer/templates?scope=review", { cache: "no-store" }),
      fetch("/api/owner/custom-templates", { cache: "no-store" }),
    ]);
    const [templateData, userData] = await Promise.all([
      templateResponse.json(),
      userResponse.json(),
    ]);

    if (!templateResponse.ok) {
      setMessage(templateData.error || "Antrean template belum dapat dimuat.");
      return;
    }

    setTemplates(Array.isArray(templateData.templates) ? templateData.templates : []);
    setUsers(userResponse.ok && Array.isArray(userData.users) ? userData.users : []);
    setMessage(userResponse.ok ? "" : (userData.error || "Daftar user belum dapat dimuat."));
  }

  useEffect(() => { void load(); }, []);

  async function transition(id: string, action: "PUBLISH" | "RETURN_DRAFT" | "SUBMIT_REVIEW") {
    if (busyId) return;
    setBusyId(id);
    setMessage("");
    try {
      const response = await fetch("/api/designer/templates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Status template belum dapat diubah.");
      await load();
      setMessage(
        action === "PUBLISH"
          ? "Template dipublikasikan dan sekarang dapat masuk katalog."
          : action === "SUBMIT_REVIEW"
            ? "Draft Owner masuk tahap review dan siap dipublish atau diberikan ke user."
            : "Template dikembalikan ke Designer sebagai Draft.",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Status template belum dapat diubah.");
    } finally {
      setBusyId(null);
    }
  }

  function openAssignment(templateId: string) {
    setAssigningId((current) => current === templateId ? null : templateId);
    setTargetUserId("");
    setTargetInvitationId("");
    setMessage("");
  }

  const targetUser = useMemo(
    () => users.find((user) => user.id === targetUserId) ?? null,
    [targetUserId, users],
  );

  async function assignToUser(templateId: string) {
    if (busyId || !targetUserId || !targetInvitationId) return;
    setBusyId(templateId);
    setMessage("");
    try {
      const response = await fetch("/api/owner/custom-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId,
          userId: targetUserId,
          invitationId: targetInvitationId,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Template custom belum dapat diberikan ke user.");

      setAssigningId(null);
      setTargetUserId("");
      setTargetInvitationId("");
      await load();
      setMessage("Template custom sudah menjadi desain draft milik user. Data event dan edit berikutnya tetap mengikuti akun user tersebut.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Template custom belum dapat diberikan ke user.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="rounded-2xl border border-primary/35 bg-background p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-undara-heading)] text-xl text-primary">Template Custom & Review</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Review karya Designer, publish ke katalog, atau berikan desain custom langsung ke event user yang meminta.
          </p>
        </div>
        <span className="font-[family-name:var(--font-undara-mono)] text-xs text-muted-foreground">{templates.length} template</span>
      </div>

      {message && <p className="mt-4 rounded-xl bg-primary/10 p-3 text-sm text-muted-foreground" role="status">{message}</p>}

      {!templates.length && !message ? (
        <p className="mt-5 text-sm text-muted-foreground">Tidak ada template yang menunggu tindakan Owner.</p>
      ) : (
        <div className="mt-5 divide-y divide-border">
          {templates.map((item) => {
            const designerName = [item.designer.firstName, item.designer.lastName].filter(Boolean).join(" ");
            const assigning = assigningId === item.id;
            return (
              <article key={item.id} className="grid gap-4 py-5 first:pt-0 sm:grid-cols-[120px_minmax(0,1fr)]">
                <img src={item.previewUrl} alt={item.name} className="aspect-[4/3] w-full rounded-xl border border-border object-cover" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-[family-name:var(--font-undara-mono)] text-xs text-primary">#{item.templateNo}</span>
                    <span className="rounded-md border border-primary/30 px-2 py-1 text-[10px] font-semibold text-primary">
                      {statusLabel(item.status)}
                    </span>
                  </div>
                  <h3 className="mt-2 font-[family-name:var(--font-undara-heading)] text-lg">{item.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{designerName || item.designer.email} · {item.category}</p>
                  {item.description && <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/owner/studio?draft=${encodeURIComponent(item.id)}`}>Buka di Studio</Link>
                    </Button>

                    {item.status === "DRAFT" && (
                      <Button
                        type="button"
                        size="sm"
                        disabled={busyId === item.id}
                        onClick={() => void transition(item.id, "SUBMIT_REVIEW")}
                      >
                        {busyId === item.id ? "Memproses..." : "Kirim Review"}
                      </Button>
                    )}

                    {item.status === "REVIEW" && (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          disabled={busyId === item.id}
                          onClick={() => void transition(item.id, "PUBLISH")}
                        >
                          {busyId === item.id ? "Memproses..." : "Publish ke Katalog"}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={busyId === item.id}
                          onClick={() => void transition(item.id, "RETURN_DRAFT")}
                        >
                          Kembalikan Draft
                        </Button>
                      </>
                    )}

                    <Button
                      type="button"
                      size="sm"
                      variant={assigning ? "default" : "outline"}
                      disabled={busyId === item.id}
                      onClick={() => openAssignment(item.id)}
                    >
                      {assigning ? "Tutup Pilihan User" : "Berikan ke User"}
                    </Button>
                  </div>

                  {assigning && (
                    <div className="mt-4 rounded-xl border border-primary/25 bg-primary/5 p-4">
                      <p className="text-sm font-semibold">Assign template custom</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Desain akan dicopy ke event draft milik user. Data event, RSVP, tamu, gift, dan edit selanjutnya tetap milik user; master Designer tidak ikut berubah.
                      </p>

                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <label className="grid gap-1.5 text-xs font-medium">
                          User yang request
                          <select
                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                            value={targetUserId}
                            onChange={(event) => {
                              setTargetUserId(event.target.value);
                              setTargetInvitationId("");
                            }}
                          >
                            <option value="">Pilih user</option>
                            {users.map((user) => (
                              <option key={user.id} value={user.id}>
                                {personName(user)} · {user.email}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="grid gap-1.5 text-xs font-medium">
                          Event tujuan
                          <select
                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm disabled:opacity-50"
                            value={targetInvitationId}
                            disabled={!targetUser}
                            onChange={(event) => setTargetInvitationId(event.target.value)}
                          >
                            <option value="">{targetUser ? "Pilih event draft" : "Pilih user dulu"}</option>
                            {targetUser?.invitations.map((invitation) => (
                              <option key={invitation.id} value={invitation.id}>
                                {eventName(invitation)}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>

                      {targetUser && targetUser.invitations.length === 0 && (
                        <p className="mt-3 text-xs text-muted-foreground">
                          User ini belum punya event draft. Buat event pada akun user terlebih dahulu agar desain custom punya database tujuan.
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          disabled={busyId === item.id || !targetUserId || !targetInvitationId}
                          onClick={() => void assignToUser(item.id)}
                        >
                          {busyId === item.id ? "Memberikan..." : "Konfirmasi ke User"}
                        </Button>
                        <span className="text-xs text-muted-foreground">Template custom tidak dipublish ke katalog.</span>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
