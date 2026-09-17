from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    file = Path(path)
    text = file.read_text()
    if old not in text:
        raise SystemExit(f"anchor not found in {path}: {old[:100]!r}")
    file.write_text(text.replace(old, new, 1))


# API: lock event-detail mutations after publish and add delete endpoint.
api = "app/api/invitations/route.ts"
replace_once(
    api,
    '''function isValidTime24(value: string | null) {
  return !value || /^(?:[01]\\d|2[0-3]):[0-5]\\d$/.test(value);
}
''',
    '''function isValidTime24(value: string | null) {
  return !value || /^(?:[01]\\d|2[0-3]):[0-5]\\d$/.test(value);
}

const EVENT_DETAIL_MUTATION_FIELDS = [
  "type",
  "eventCategory",
  "title",
  "groomName",
  "brideName",
  "groomFatherName",
  "groomMotherName",
  "groomChildOrder",
  "brideFatherName",
  "brideMotherName",
  "brideChildOrder",
  "venue",
  "address",
  "mapUrl",
  "timezone",
  "eventDate",
  "ceremonyTime",
  "receptionTime",
  "description",
  "eventNotes",
  "eventConfigured",
] as const;

function hasEventDetailMutation(body: Record<string, unknown>) {
  return EVENT_DETAIL_MUTATION_FIELDS.some((field) =>
    Object.prototype.hasOwnProperty.call(body, field),
  );
}
''',
)
replace_once(
    api,
    '''    if (!invitation) return NextResponse.json({ error: "Undangan tidak ditemukan." }, { status: 404 });

    const eventCategory = normalizeEventCategory(body.eventCategory ?? invitation.eventCategory);
''',
    '''    if (!invitation) return NextResponse.json({ error: "Undangan tidak ditemukan." }, { status: 404 });

    if (
      invitation.isPublished &&
      (hasEventDetailMutation(body as Record<string, unknown>) || body.isPublished === false)
    ) {
      return NextResponse.json(
        {
          error:
            "Acara yang sudah dipublish terkunci dan tidak dapat diedit atau dikembalikan menjadi draft.",
        },
        { status: 409 },
      );
    }

    const eventCategory = normalizeEventCategory(body.eventCategory ?? invitation.eventCategory);
''',
)
api_text = Path(api).read_text()
if "export async function DELETE(request: Request)" in api_text:
    raise SystemExit("DELETE endpoint already exists")
api_text += '''

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });

  try {
    const id = new URL(request.url).searchParams.get("id")?.trim() || "";
    if (!id) {
      return NextResponse.json({ error: "Acara belum dipilih." }, { status: 400 });
    }

    const invitation = await findOwnedInvitation(user.id, id);
    if (!invitation) {
      return NextResponse.json({ error: "Acara tidak ditemukan." }, { status: 404 });
    }
    if (invitation.isPublished) {
      return NextResponse.json(
        { error: "Acara yang sudah dipublish tidak dapat dihapus." },
        { status: 409 },
      );
    }

    await prisma.invitation.delete({ where: { id: invitation.id } });
    return NextResponse.json({ deleted: true, id: invitation.id });
  } catch (error) {
    console.error("DELETE /api/invitations failed", error);
    return databaseFailure(error, "Acara belum dapat dihapus.");
  }
}
'''
Path(api).write_text(api_text)

# Dashboard: expose delete before publish and hide Edit/Delete after publish.
panel = "components/Dashboard/EventPanel.tsx"
replace_once(panel, "  Save,\n  X,\n", "  Save,\n  Trash2,\n  X,\n")
replace_once(
    panel,
    '''  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
''',
    '''  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [notice, setNotice] = useState("");
''',
)
replace_once(
    panel,
    '''  function activate(invitation: Invitation) {
    setActiveId(invitation.id);
''',
    '''  function activate(invitation: Invitation) {
    if (invitation.isPublished) {
      setNotice("Acara yang sudah dipublish tidak dapat diedit.");
      return;
    }
    setActiveId(invitation.id);
''',
)
replace_once(
    panel,
    '''  function startNewEvent() {
    if (saving) return;
''',
    '''  function startNewEvent() {
    if (saving || deletingId) return;
''',
)
replace_once(
    panel,
    '''  const category = form.eventCategory ? getEventCategory(form.eventCategory) : null;
''',
    '''  async function removeEvent(invitation: Invitation) {
    if (saving || deletingId) return;
    if (invitation.isPublished) {
      setNotice("Acara yang sudah dipublish tidak dapat dihapus.");
      return;
    }

    const label = invitation.title?.trim() || "Acara baru";
    const confirmed = window.confirm(
      `Hapus “${label}”?\\n\\nAcara, desain undangan, daftar tamu, dan data terkait yang belum dipublish akan ikut dihapus.`,
    );
    if (!confirmed) return;

    setDeletingId(invitation.id);
    setNotice("Menghapus acara...");
    try {
      const response = await fetch(
        `/api/invitations?id=${encodeURIComponent(invitation.id)}`,
        { method: "DELETE" },
      );
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || "Acara belum dapat dihapus.");
      }
      if (activeId === invitation.id) closeEditor();
      await load();
      setNotice("Acara dihapus.");
      onSaved();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Acara belum dapat dihapus.");
    } finally {
      setDeletingId("");
    }
  }

  const category = form.eventCategory ? getEventCategory(form.eventCategory) : null;
''',
)
replace_once(
    panel,
    '''        <Button type="button" size="sm" onClick={startNewEvent} disabled={saving}>
''',
    '''        <Button
          type="button"
          size="sm"
          onClick={startNewEvent}
          disabled={saving || Boolean(deletingId)}
        >
''',
)
replace_once(
    panel,
    '''              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" onClick={() => activate(event)}>
                  <PenLine className="h-4 w-4" />
                  Edit
                </Button>
                {!draft && (
''',
    '''              <div className="flex flex-wrap gap-2">
                {!event.isPublished && (
                  <>
                    <Button type="button" size="sm" onClick={() => activate(event)}>
                      <PenLine className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => removeEvent(event)}
                      disabled={saving || Boolean(deletingId)}
                    >
                      <Trash2 className="h-4 w-4" />
                      {deletingId === event.id ? "Menghapus..." : "Hapus"}
                    </Button>
                  </>
                )}
                {!draft && (
''',
)

# Master PRD: active lifecycle requirement.
prd = "prd.md"
replace_once(
    prd,
    '''16. Public invitation dapat dibuka dan didistribusikan.

Legacy blank draft''',
    '''16. Public invitation dapat dibuka dan didistribusikan.
17. Selama `isPublished = false`, user boleh mengedit atau menghapus Rangkaian Acara miliknya.
18. Setelah `isPublished = true`, data Rangkaian Acara menjadi terkunci: user tidak dapat mengedit detail event, menghapus event, atau mengembalikannya menjadi draft/unpublished melalui flow customer biasa.
19. Lock setelah publish wajib ditegakkan server-side; menyembunyikan tombol Edit/Hapus di UI bukan security boundary.

Legacy blank draft''',
)
replace_once(
    prd,
    '''UI bukan security boundary. Request API yang mencoba melewati urutan tersebut tetap harus ditolak server.
''',
    '''UI bukan security boundary. Request API yang mencoba melewati urutan tersebut tetap harus ditolak server.

Setelah publish berhasil, Rangkaian Acara bersifat immutable untuk customer: event-detail mutation, unpublish, dan delete harus ditolak backend. Invitation Studio tetap dapat dibuka sesuai capability yang tersedia; lock ini khusus pada identitas/detail Rangkaian Acara dan lifecycle record event.
''',
)

# AGENTS: preserve the server-authoritative rule for future coding.
agents = "AGENTS.md"
replace_once(
    agents,
    '''- Authorization is server-side; UI entitlement must reflect server entitlement.
''',
    '''- Authorization is server-side; UI entitlement must reflect server entitlement.
- Published Rangkaian Acara is customer-immutable: once `Invitation.isPublished = true`, server APIs must reject event-detail edits, unpublish attempts, and event deletion. UI must also stop exposing Edit/Hapus for that event. This lock applies to Rangkaian Acara metadata/lifecycle and must not silently disable unrelated Studio capabilities unless the PRD explicitly expands the lock.
''',
)

# README: product overview.
readme = "README.md"
replace_once(
    readme,
    '''  7. Publish.
- The Digital Invitation package is required at the **Publish** step, not when creating the event or entering Studio.
''',
    '''  7. Publish.
- Before Publish, a user may edit or delete their Rangkaian Acara. After `isPublished = true`, event details are locked: customer APIs reject event-detail edits, unpublish attempts, and event deletion, while unrelated Studio capabilities remain governed separately.
- The Digital Invitation package is required at the **Publish** step, not when creating the event or entering Studio.
''',
)

# Changelog entry; validation is recorded after CI is observed.
changelog = Path("prd1.md")
with changelog.open("a") as handle:
    handle.write('''

---

## 2026-09-17 — Rangkaian Acara Delete & Published Lock

### Requirement / Intent
Rangkaian Acara boleh diedit dan dihapus sebelum Publish. Karena Publish hanya dapat berhasil setelah entitlement Digital Invitation aktif, event yang sudah terbit harus menjadi record customer yang terkunci dan tidak boleh diedit, dihapus, atau di-unpublish melalui request manual.

### Implementation
- menambahkan `DELETE /api/invitations?id=<invitationId>` dengan ownership check server-side;
- delete hanya diizinkan ketika `isPublished = false`;
- `PUT /api/invitations` menolak event-detail mutation setelah publish;
- published event juga tidak dapat di-unpublish (`isPublished=false`) untuk menghindari bypass lock;
- dashboard Rangkaian Acara menampilkan `Hapus` hanya untuk event yang belum publish;
- `Edit` dan `Hapus` tidak lagi tersedia pada event berstatus `Terbit`;
- delete meminta konfirmasi karena record event beserta data relasi yang cascade akan ikut dihapus;
- Invitation Studio tidak di-lock secara global oleh perubahan ini; requirement ini khusus detail/lifecycle Rangkaian Acara.

### Affected Files
- `app/api/invitations/route.ts`
- `components/Dashboard/EventPanel.tsx`
- `prd.md`
- `AGENTS.md`
- `README.md`
- `prd1.md`

### Validation
- Pending observed GitHub Build Validation for the implementation source state.
- Database migration: N/A.
''')
