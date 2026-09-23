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
  DashboardEmptyState,
  DashboardPanel,
  DashboardStatusBadge,
} from "@/components/Dashboard/DashboardPrimitives";
import {
  PersonalInvitationGuestFields,
  type GuestInvitationForm,
} from "@/components/Dashboard/PersonalInvitationGuestFields";
import { buildPersonalInvitationPublicUrl } from "@/components/Dashboard/personal-invitation-helpers";
import type {
  PersonalInvitationEvent,
  PersonalInvitationGuest,
  PersonalInvitationItem,
} from "@/components/Dashboard/personal-invitation-types";

export function PersonalInvitationCreatePanel({
  availableGuests,
  guestId,
  setGuestId,
  name,
  setName,
  phone,
  setPhone,
  profile,
  setProfile,
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
  profile: GuestInvitationForm;
  setProfile: (next: GuestInvitationForm) => void;
  loading: boolean;
  busyId: string | null;
  protectedCount: number;
  draftCount: number;
  onCreateExisting: () => void;
  onCreateNew: () => void;
}) {
  const { d } = useDashboardI18n();
  const selectedGuest = availableGuests.find((guest) => guest.id === guestId);
  const busy = loading || Boolean(busyId);
  const valid = Number.isInteger(profile.invitedPax) && profile.invitedPax >= 1
    && profile.invitedPax <= 30 && Boolean(profile.category.trim())
    && Boolean(guestId ? selectedGuest : name.trim());

  return (
    <DashboardPanel title={d("Buat Undangan Personal")}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!valid || busy) return;
          if (guestId) onCreateExisting();
          else onCreateNew();
        }}
        className="space-y-5"
      >
        <label className="block min-w-0 text-sm font-medium text-foreground">
          {d("Sumber penerima")}
          <select
            value={guestId}
            onChange={(event) => setGuestId(event.target.value)}
            disabled={busy}
            className="mt-1.5 min-h-11 w-full border border-primary/25 bg-background px-3 text-sm text-foreground"
          >
            <option value="">{d("Tambah tamu baru")}</option>
            {availableGuests.map((guest) => (
              <option key={guest.id} value={guest.id}>
                <span className="dc-ui-name">{guest.name}</span>{guest.phone ? ` · ${guest.phone}` : ""}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-xs text-muted-foreground">
            {d("Pilih tamu yang sudah ada agar nama dan nomor tidak tersimpan dua kali.")}
          </span>
        </label>

        {selectedGuest ? (
          <div className="border-y border-primary/15 py-3">
            <p className="dc-ui-name text-sm font-semibold text-foreground">{selectedGuest.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{selectedGuest.phone || d("Tanpa nomor WhatsApp")}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {d("Data ini terhubung dengan RSVP, WA Blast, dan pengaturan meja.")}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block min-w-0 text-sm font-medium text-foreground">
              {d("Nama penerima")}
              <Input
                value={name}
                maxLength={120}
                onChange={(event) => setName(event.target.value)}
                placeholder={d("Contoh: Bapak Andi")}
                required
                disabled={busy}
                className="mt-1.5"
              />
            </label>
            <label className="block min-w-0 text-sm font-medium text-foreground">
              {d("Nomor WhatsApp (opsional)")}
              <Input
                type="tel"
                value={phone}
                maxLength={32}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="08xxxxxxxxxx"
                disabled={busy}
                className="mt-1.5"
              />
            </label>
          </div>
        )}

        <PersonalInvitationGuestFields value={profile} onChange={setProfile} disabled={busy} />

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-primary/15 pt-4">
          <p className="text-xs text-muted-foreground">
            {d("Buat satu tautan personal untuk penerima ini.")}
          </p>
          <Button type="submit" size="sm" disabled={!valid || busy}>
            <Plus className="size-4" />
            {busyId ? d("Menyimpan...") : d("Buat undangan")}
          </Button>
        </div>
      </form>
      <div className="flex flex-wrap gap-4 border-t border-primary/15 pt-3 text-xs text-muted-foreground">
        <span>{d("Password")}: {protectedCount}</span>
        <span>{d("Draft")}: {draftCount}</span>
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
  editProfile,
  setEditProfile,
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
  editProfile: GuestInvitationForm;
  setEditProfile: (value: GuestInvitationForm) => void;
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
              className="dc-dashboard-detail-card rounded-tr-[22px] border border-primary/20 bg-primary/[0.025] p-4 sm:p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  {editing ? (
                    <div className="space-y-4">
                      <div className="grid gap-2 sm:grid-cols-2">
                        <label className="text-sm font-medium text-foreground">
                          {d("Nama penerima")}
                          <Input
                            value={editName}
                            maxLength={120}
                            onChange={(event) => setEditName(event.target.value)}
                            className="mt-1.5"
                          />
                        </label>
                        <label className="text-sm font-medium text-foreground">
                          {d("Nomor WhatsApp (opsional)")}
                          <Input
                            type="tel"
                            maxLength={32}
                            value={editPhone}
                            onChange={(event) => setEditPhone(event.target.value)}
                            className="mt-1.5"
                          />
                        </label>
                      </div>
                      <PersonalInvitationGuestFields
                        value={editProfile}
                        onChange={setEditProfile}
                        disabled={busyId === item.id}
                      />
                    </div>
                  ) : (
                    <>
                      <p className="break-words text-sm font-semibold text-foreground">
                        <span className="dc-ui-name">{item.personalAddressee || item.name}</span>
                      </p>
                      {item.personalAddressee && item.personalAddressee !== item.name && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {d("Data tamu")}: <span className="dc-ui-name">{item.name}</span>
                        </p>
                      )}
                      <p className="mt-1 break-words text-xs text-muted-foreground">
                        {item.phone || d("Tanpa nomor")} · {item.personalViewCount || 0} {d("kali dibuka")}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.category || d("Reguler")} · {item.invitedPax ?? 1} {d("orang diundang")}
                        {(item.tags?.length ?? 0) > 0 ? ` · ${item.tags?.join(", ")}` : ""}
                      </p>
                      {item.personalGreeting && (
                        <p className="mt-1 break-words text-xs italic text-muted-foreground">
                          {item.personalGreeting}
                        </p>
                      )}
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
                <DashboardStatusBadge active={Boolean(item.personalSharedAt)}>
                  {item.personalSharedAt ? d("Ditandai dibagikan") : d("Belum dibagikan")}
                </DashboardStatusBadge>
                <DashboardStatusBadge active={item.rsvpStatus === "ATTENDING"}>
                  {item.rsvpStatus === "ATTENDING"
                    ? `${d("Hadir")} · ${(item.plusOnes ?? 0) + 1} pax`
                    : item.rsvpStatus === "NOT_ATTENDING"
                      ? d("Tidak hadir")
                      : item.rsvpStatus === "TENTATIVE"
                        ? d("Tentatif")
                        : d("Belum RSVP")}
                </DashboardStatusBadge>
                {item.checkedIn && (
                  <DashboardStatusBadge active>{d("Sudah check-in")}</DashboardStatusBadge>
                )}
                {item.table?.name && (
                  <span className="text-xs text-muted-foreground">{d("Meja")}: {item.table.name}</span>
                )}
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
                  <>
                    <Button asChild size="sm">
                      <a href={publicUrl} target="_blank" rel="noreferrer">
                        {d("Buka publik")}
                      </a>
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      disabled={busyId === item.id}
                      onClick={() => onPatch(
                        item.id,
                        { markShared: !item.personalSharedAt },
                        item.personalSharedAt
                          ? d("Penanda dibagikan dibatalkan.")
                          : d("Ditandai dibagikan secara manual; status pengiriman WhatsApp tidak diverifikasi."),
                      )}
                    >
                      {item.personalSharedAt ? d("Batalkan tanda dibagikan") : d("Tandai dibagikan")}
                    </Button>
                  </>
                )}
              </div>

              {passwordOpen && (
                <div className="mt-4 flex flex-col gap-2 border-t border-primary/20 pt-4 sm:flex-row sm:items-center">
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
