"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ContactRound, Eye, Send } from "lucide-react";
import EventScopePicker from "@/components/Dashboard/EventScopePicker";
import { useDashboardI18n } from "@/components/Dashboard/useDashboardI18n";
import {
  DashboardMetricCard,
  DashboardMetricGrid,
  DashboardNotice,
  DashboardPage,
  DashboardPageHeader,
} from "@/components/Dashboard/DashboardPrimitives";
import {
  PersonalInvitationCreatePanel,
  PersonalInvitationListPanel,
} from "@/components/Dashboard/PersonalInvitationPanels";
import { sortPersonalInvitationEvents } from "@/components/Dashboard/personal-invitation-helpers";
import { hasWeddingSessions } from "@/lib/events/wedding-sessions";
import type {
  PersonalInvitationEvent,
  PersonalInvitationGuest,
  PersonalInvitationItem,
} from "@/components/Dashboard/personal-invitation-types";

export default function PersonalInvitationPanel() {
  const { d } = useDashboardI18n();
  const [events, setEvents] = useState<PersonalInvitationEvent[]>([]);
  const [eventId, setEventId] = useState("");
  const [personal, setPersonal] = useState<PersonalInvitationItem[]>([]);
  const [guests, setGuests] = useState<PersonalInvitationGuest[]>([]);
  const [guestId, setGuestId] = useState("");
  const [weddingSessionAccess, setWeddingSessionAccess] = useState("");
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
      const response = await fetch("/api/invitations?all=1", {
        cache: "no-store",
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || d("Daftar acara belum dapat dimuat."));
      }

      const configured = sortPersonalInvitationEvents(
        ((data?.invitations ?? []) as PersonalInvitationEvent[]).filter(
          (invitation) => invitation.eventConfigured,
        ),
      );

      setEvents(configured);
      setEventId((current) => {
        if (configured.some((event) => event.id === current)) return current;
        return (
          configured.find((event) => event.accessPaid)?.id ??
          configured[0]?.id ??
          ""
        );
      });
    } catch (error) {
      setEvents([]);
      setEventId("");
      setNotice(
        error instanceof Error
          ? error.message
          : d("Daftar acara belum dapat dimuat."),
      );
    } finally {
      setEventsLoading(false);
    }
  }, [d]);

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
        fetch(`/api/guests?invitationId=${encodedId}`, {
          cache: "no-store",
        }),
      ]);

      const personalData = await personalResponse.json().catch(() => null);
      const guestData = await guestResponse.json().catch(() => null);

      if (!personalResponse.ok) {
        throw new Error(
          personalData?.error ||
            d("Personal Invitation belum dapat dimuat."),
        );
      }

      if (!guestResponse.ok) {
        throw new Error(
          guestData?.error || d("Daftar tamu belum dapat dimuat."),
        );
      }

      setPersonal(
        (personalData?.invitations ?? []) as PersonalInvitationItem[],
      );
      setGuests((guestData?.guests ?? []) as PersonalInvitationGuest[]);
    } catch (error) {
      setPersonal([]);
      setGuests([]);
      setNotice(
        error instanceof Error
          ? error.message
          : d("Personal Invitation belum dapat dimuat."),
      );
    } finally {
      setLoading(false);
    }
  }, [d, eventId, selectedEvent]);

  useEffect(() => {
    loadEvents().catch(() => undefined);
  }, [loadEvents]);

  useEffect(() => {
    setGuestId("");
    setWeddingSessionAccess("");
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
    if (!eventId || !guestId || (selectedEvent?.eventCategory === "WEDDING" && hasWeddingSessions(selectedEvent) && !weddingSessionAccess)) return;

    setBusyId("create-existing");
    setNotice("");

    try {
      const response = await fetch("/api/personal-invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId: eventId, guestId, weddingSessionAccess }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error || d("Personal Invitation belum dapat dibuat."),
        );
      }

      setGuestId("");
      await loadCurrent();
      setNotice(d("Personal Invitation dibuat untuk acara ini."));
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : d("Personal Invitation belum dapat dibuat."),
      );
    } finally {
      setBusyId(null);
    }
  }

  async function createNew() {
    if (!eventId || !name.trim() || (selectedEvent?.eventCategory === "WEDDING" && hasWeddingSessions(selectedEvent) && !weddingSessionAccess)) return;

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
          weddingSessionAccess,
        }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error || d("Personal Invitation belum dapat dibuat."),
        );
      }

      setName("");
      setPhone("");
      await loadCurrent();
      setNotice(d("Tamu dan Personal Invitation dibuat untuk acara ini."));
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : d("Personal Invitation belum dapat dibuat."),
      );
    } finally {
      setBusyId(null);
    }
  }

  async function patchPersonalInvitation(
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
        throw new Error(
          data?.error || d("Personal Invitation belum dapat diperbarui."),
        );
      }

      setPersonal((current) =>
        current.map((item) =>
          item.id === id
            ? (data.invitation as PersonalInvitationItem)
            : item,
        ),
      );
      setNotice(successMessage);
      return true;
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : d("Personal Invitation belum dapat diperbarui."),
      );
      return false;
    } finally {
      setBusyId(null);
    }
  }

  function startEdit(item: PersonalInvitationItem) {
    setEditingId(item.id);
    setEditName(item.name);
    setEditPhone(item.phone || "");
  }

  async function saveEdit(item: PersonalInvitationItem) {
    if (!editName.trim()) return;

    const ok = await patchPersonalInvitation(
      item.id,
      { name: editName.trim(), phone: editPhone.trim() },
      d("Data tamu diperbarui."),
    );

    if (ok) setEditingId(null);
  }

  async function savePassword(item: PersonalInvitationItem) {
    if (password.trim().length < 6) {
      setNotice(d("Password minimal 6 karakter."));
      return;
    }

    const ok = await patchPersonalInvitation(
      item.id,
      { passwordProtected: true, password: password.trim() },
      d("Password Personal Invitation diperbarui."),
    );

    if (ok) {
      setPasswordId(null);
      setPassword("");
    }
  }

  async function disablePassword(item: PersonalInvitationItem) {
    const ok = await patchPersonalInvitation(
      item.id,
      { passwordProtected: false },
      d("Password Personal Invitation dimatikan."),
    );

    if (ok) {
      setPasswordId(null);
      setPassword("");
    }
  }

  const publishedCount = personal.filter(
    (item) => item.personalPublished,
  ).length;
  const protectedCount = personal.filter(
    (item) => item.personalPasswordProtected,
  ).length;
  const totalViews = personal.reduce(
    (sum, item) => sum + (item.personalViewCount || 0),
    0,
  );

  return (
    <DashboardPage>
      <DashboardPageHeader
        eyebrow={d("Distribusi")}
        title={d("Personal Invitation")}
        description={d("Buat tautan personal untuk tamu yang dipilih.")}
      >
        <EventScopePicker
          events={events}
          value={eventId}
          onChange={setEventId}
          disabled={eventsLoading || Boolean(busyId)}
        />
      </DashboardPageHeader>

      {notice && <DashboardNotice className="mt-4">{notice}</DashboardNotice>}

      {!events.length ? null : selectedEvent ? (
        <>
          <DashboardMetricGrid className="mt-4 xl:grid-cols-3">
            <DashboardMetricCard
              icon={ContactRound}
              label={d("Personal Invitation")}
              value={String(personal.length)}
            />
            <DashboardMetricCard
              icon={Send}
              label={d("Publish")}
              value={String(publishedCount)}
            />
            <DashboardMetricCard
              icon={Eye}
              label={d("Dibuka")}
              value={String(totalViews)}
            />
          </DashboardMetricGrid>

          <div className="mt-5 grid gap-4 2xl:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.7fr)]">
            <PersonalInvitationCreatePanel
              selectedEvent={selectedEvent}
              availableGuests={availableGuests}
              guestId={guestId}
              setGuestId={setGuestId}
              weddingSessionAccess={weddingSessionAccess}
              setWeddingSessionAccess={setWeddingSessionAccess}
              name={name}
              setName={setName}
              phone={phone}
              setPhone={setPhone}
              loading={loading}
              busyId={busyId}
              protectedCount={protectedCount}
              draftCount={personal.length - publishedCount}
              onCreateExisting={createFromExisting}
              onCreateNew={createNew}
            />

            <PersonalInvitationListPanel
              selectedEvent={selectedEvent}
              personal={personal}
              editingId={editingId}
              editName={editName}
              setEditName={setEditName}
              editPhone={editPhone}
              setEditPhone={setEditPhone}
              passwordId={passwordId}
              setPasswordId={setPasswordId}
              password={password}
              setPassword={setPassword}
              busyId={busyId}
              loading={loading}
              onReload={() => void loadCurrent()}
              onStartEdit={startEdit}
              onSaveEdit={(item) => void saveEdit(item)}
              onPatch={patchPersonalInvitation}
              onSavePassword={(item) => void savePassword(item)}
              onDisablePassword={(item) => void disablePassword(item)}
            />
          </div>
        </>
      ) : null}
    </DashboardPage>
  );
}
