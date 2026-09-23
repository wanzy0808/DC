"use client";

import Link from "next/link";
import {
  ContactRound,
  Eye,
  KeyRound,
  PenLine,
  Plus,
  RefreshCw,
  Send,
  ShieldOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDashboardI18n } from "@/components/Dashboard/useDashboardI18n";
import {
  DashboardCompactStat,
  DashboardEmptyState,
  DashboardPanel,
  DashboardStatusBadge,
} from "@/components/Dashboard/DashboardPrimitives";
import { buildPersonalInvitationPublicUrl } from "@/components/Dashboard/personal-invitation-helpers";
import type {
  PersonalInvitationEvent,
  PersonalInvitationGuest,
  PersonalInvitationItem,
} from "@/components/Dashboard/personal-invitation-types";

export function PersonalInvitationCreatePanel({
  selectedEvent,
  availableGuests,
  guestId,
  setGuestId,
  name,
  setName,
  phone,
  setPhone,
  loading,
  busyId,
  protectedCount,
  draftCount,
  onCreateExisting,
  onCreateNew,
}: {
  selectedEvent: PersonalInvitationEvent;
  availableGuests: PersonalInvitationGuest[];
  guestId: string;
  setGuestId: (value: string) => void;
  name: string;
  setName: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  loading: boolean;
  busyId: string | null;
  protectedCount: number;
  draftCount: number;
  onCreateExisting: () => void;
  onCreateNew: () => void;
}) {
  const { d } = useDashboardI18n();

  return (
    <DashboardPanel
      title={d("Buat Personal Invitation")}
    >
      <div className="rounded-2xl border border-primary/20 bg-primary/[0.025] p-4">
        <p className="text-xs font-semibold text-foreground">
          {d("Dari daftar tamu")}
        </p>
        <select
          value={guestId}
          onChange={(event) => setGuestId(event.target.value)}
          disabled={loading || Boolean(busyId)}
          className="mt-2 w-full px-3 text-sm"
        >
          <option value="">{d("Pilih tamu")}</option>
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
          onClick={onCreateExisting}
        >
          <Plus className="h-4 w-4" />
          {d("Buat Personal Invitation")}
        </Button>
      </div>

      <div className="rounded-xl border border-border/70 bg-background p-3">
        <p className="text-xs font-semibold text-foreground">
          {d("Tamu belum ada")}
        </p>
        <div className="mt-2 space-y-2">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={d("Nama tamu")}
            disabled={Boolean(busyId)}
          />
          <Input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder={d("Nomor WhatsApp (opsional)")}
            disabled={Boolean(busyId)}
          />
          <Button
            type="button"
            size="sm"
            className="w-full"
            disabled={!name.trim() || Boolean(busyId)}
            onClick={onCreateNew}
          >
            <Plus className="h-4 w-4" />
            {d("Tambah & buat undangan")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <DashboardCompactStat
          label={d("Password")}
          value={String(protectedCount)}
        />
        <DashboardCompactStat label={d("Draft")} value={String(draftCount)} />
      </div>
    </DashboardPanel>
  );
}

export function PersonalInvitationListPanel({
  selectedEvent,
  personal,
  editingId,
  editName,
  setEditName,
  editPhone,
  setEditPhone,
  passwordId,
  setPasswordId,
  password,
  setPassword,
  busyId,
  loading,
  onReload,
  onStartEdit,
  onSaveEdit,
  onPatch,
  onSavePassword,
  onDisablePassword,
}: {
  selectedEvent: PersonalInvitationEvent;
  personal: PersonalInvitationItem[];
  editingId: string | null;
  editName: string;
  setEditName: (value: string) => void;
  editPhone: string;
  setEditPhone: (value: string) => void;
  passwordId: string | null;
  setPasswordId: (value: string | null) => void;
  password: string;
  setPassword: (value: string) => void;
  busyId: string | null;
  loading: boolean;
  onReload: () => void;
  onStartEdit: (item: PersonalInvitationItem) => void;
  onSaveEdit: (item: PersonalInvitationItem) => void;
  onPatch: (
    id: string,
    body: Record<string, unknown>,
    successMessage: string,
  ) => Promise<boolean>;
  onSavePassword: (item: PersonalInvitationItem) => void;
  onDisablePassword: (item: PersonalInvitationItem) => void;
}) {
  const { d } = useDashboardI18n();

  return (
    <DashboardPanel
      title={d("Daftar undangan")}
      actions={
        <Button
          type="button"
          size="sm"
          onClick={onReload}
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4" />
          {d("Muat ulang")}
        </Button>
      }
    >
      <div className="space-y-3">
        {personal.length === 0 && (
          <DashboardEmptyState
            icon={ContactRound}
            title={d("Belum ada Personal Invitation")}
            description={d(
              "Buat undangan personal dari daftar tamu atau tambahkan tamu baru.",
            )}
          />
        )}

        {personal.map((item) => {
          const publicUrl = buildPersonalInvitationPublicUrl(
            selectedEvent.slug,
            item.personalToken,
          );
          const editing = editingId === item.id;
          const passwordOpen = passwordId === item.id;

          return (
            <article
              key={item.id}
              className="rounded-[22px] border border-primary/20 bg-primary/[0.025] p-4 sm:p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  {editing ? (
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Input
                        value={editName}
                        onChange={(event) => setEditName(event.target.value)}
                        placeholder={d("Nama tamu")}
                      />
                      <Input
                        value={editPhone}
                        onChange={(event) => setEditPhone(event.target.value)}
                        placeholder={d("Nomor WhatsApp")}
                      />
                    </div>
                  ) : (
                    <>
                      <p className="truncate text-sm font-semibold text-foreground">
                        {item.name}
                      </p>
                      <p className="mt-0.5 truncate font-[family-name:var(--font-dc-mono)] text-[11px] text-muted-foreground">
                        {item.phone || d("Tanpa nomor")} ·{" "}
                        {item.personalViewCount || 0} dibuka
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
                      {d("Pratinjau")}
                    </Link>
                  </Button>

                  {editing ? (
                    <Button
                      type="button"
                      size="sm"
                      disabled={busyId === item.id}
                      onClick={() => onSaveEdit(item)}
                    >
                      {d("Simpan edit")}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => onStartEdit(item)}
                    >
                      <PenLine className="h-4 w-4" />
                      {d("Edit")}
                    </Button>
                  )}

                  <Button
                    type="button"
                    size="sm"
                    disabled={busyId === item.id}
                    onClick={() =>
                      onPatch(
                        item.id,
                        { published: !item.personalPublished },
                        item.personalPublished
                          ? d("Personal Invitation ditarik dari publik.")
                          : d("Personal Invitation dipublish."),
                      )
                    }
                  >
                    <Send className="h-4 w-4" />
                    {item.personalPublished ? d("Tarik publik") : d("Publish")}
                  </Button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <DashboardStatusBadge active={item.personalPublished}>
                  {item.personalPublished ? d("Terbit") : d("Draft")}
                </DashboardStatusBadge>
                <DashboardStatusBadge
                  active={item.personalPasswordProtected}
                >
                  {item.personalPasswordProtected
                    ? d("Password aktif")
                    : d("Tanpa password")}
                </DashboardStatusBadge>

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
                    ? d("Ganti password")
                    : d("Aktifkan password")}
                </Button>

                {item.personalPasswordProtected && (
                  <Button
                    type="button"
                    size="sm"
                    disabled={busyId === item.id}
                    onClick={() => onDisablePassword(item)}
                  >
                    <ShieldOff className="h-4 w-4" />
                    {d("Matikan password")}
                  </Button>
                )}

                {item.personalPublished && publicUrl && (
                  <Button asChild size="sm">
                    <a href={publicUrl} target="_blank" rel="noreferrer">
                      {d("Buka publik")}
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
                    placeholder={d("Password baru minimal 6 karakter")}
                    className="min-w-0 flex-1"
                  />
                  <Button
                    type="button"
                    size="sm"
                    disabled={
                      password.trim().length < 6 || busyId === item.id
                    }
                    onClick={() => onSavePassword(item)}
                  >
                    {d("Simpan password")}
                  </Button>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </DashboardPanel>
  );
}
