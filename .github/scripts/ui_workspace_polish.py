from pathlib import Path
import re


def replace_exact(path: Path, old: str, new: str, *, minimum: int = 1) -> None:
    text = path.read_text(encoding="utf-8")
    count = text.count(old)
    if count < minimum:
        raise SystemExit(f"Expected at least {minimum} occurrence(s) in {path}: {old!r}; found {count}")
    path.write_text(text.replace(old, new), encoding="utf-8")
    print(f"updated {path}: {count} replacement(s)")


def replace_optional(path: Path, old: str, new: str) -> int:
    text = path.read_text(encoding="utf-8")
    count = text.count(old)
    if count:
        path.write_text(text.replace(old, new), encoding="utf-8")
        print(f"updated {path}: {count} optional replacement(s)")
    return count


# Dashboard page-level wrappers must not regress to the old 92vw / 1400px marketing container.
for root in (Path("app/dashboard"), Path("components/Dashboard")):
    for path in root.rglob("*.tsx"):
        text = path.read_text(encoding="utf-8")
        if "w-[min(92vw,1400px)]" in text:
            text = text.replace("w-[min(92vw,1400px)]", "w-[80vw] max-w-full")
            path.write_text(text, encoding="utf-8")
            print(f"widened {path}")

layout = Path("app/dashboard/layout.tsx")
replace_exact(
    layout,
    '''  .dc-dashboard header > div {\n    width: 100% !important;\n    max-width: none !important;\n    margin-left: 0 !important;\n    margin-right: 0 !important;\n    padding-left: 1rem !important;\n    padding-right: 1rem !important;\n  }''',
    '''  .dc-dashboard header > div {\n    width: min(80vw, calc(100% - 2rem)) !important;\n    max-width: none !important;\n    margin-left: auto !important;\n    margin-right: auto !important;\n    padding-left: 0 !important;\n    padding-right: 0 !important;\n  }''',
)
replace_exact(
    layout,
    '''  .dc-dashboard main > div,\n  .dc-dashboard main > section:not(.bg-background) {\n    width: 100% !important;\n    max-width: none !important;\n    margin-left: 0 !important;\n    margin-right: 0 !important;\n    padding-left: clamp(1rem, 2vw, 2rem) !important;\n    padding-right: clamp(1rem, 2vw, 2rem) !important;\n  }''',
    '''  .dc-dashboard main > div,\n  .dc-dashboard main > section:not(.bg-background) {\n    width: min(80vw, calc(100% - 2rem)) !important;\n    max-width: none !important;\n    margin-left: auto !important;\n    margin-right: auto !important;\n    padding-left: clamp(0rem, 0.6vw, 0.75rem) !important;\n    padding-right: clamp(0rem, 0.6vw, 0.75rem) !important;\n  }''',
)
replace_exact(
    layout,
    '''  .dc-dashboard main > section.bg-background > div {\n    width: 100% !important;\n    max-width: none !important;\n    margin-left: 0 !important;\n    margin-right: 0 !important;\n    padding-left: clamp(1rem, 2vw, 2rem) !important;\n    padding-right: clamp(1rem, 2vw, 2rem) !important;\n  }''',
    '''  .dc-dashboard main > section.bg-background > div {\n    width: min(80vw, calc(100% - 2rem)) !important;\n    max-width: none !important;\n    margin-left: auto !important;\n    margin-right: auto !important;\n    padding-left: clamp(0rem, 0.6vw, 0.75rem) !important;\n    padding-right: clamp(0rem, 0.6vw, 0.75rem) !important;\n  }''',
)

# Remove decorative/ordinal numbering from customer-facing dashboard copy.
dashboard = Path("app/dashboard/page.tsx")
for old, new in {
    'overview: { eyebrow: "Workspace / 01", title: "Beranda" },': 'overview: { eyebrow: "Workspace", title: "Beranda" },',
    'events: { eyebrow: "Acara / 01", title: "Rangkaian Acara" },': 'events: { eyebrow: "Acara", title: "Rangkaian Acara" },',
    'invitation: { eyebrow: "Acara / 02", title: "Undangan" },': 'invitation: { eyebrow: "Acara", title: "Undangan" },',
    'personalInvitation: { eyebrow: "Acara / 03", title: "Personal Invitation" },': 'personalInvitation: { eyebrow: "Acara", title: "Personal Invitation" },',
    'waBlast: { eyebrow: "Add-on / 01", title: "WA Blast" },': 'waBlast: { eyebrow: "Add-on", title: "WA Blast" },',
    'rsvp: { eyebrow: "Workspace / 02", title: "RSVP" },': 'rsvp: { eyebrow: "Workspace", title: "RSVP" },',
    'placement: { eyebrow: "Workspace / 03", title: "Manajemen Tamu" },': 'placement: { eyebrow: "Workspace", title: "Manajemen Tamu" },',
    'usher: { eyebrow: "Workspace / 04", title: "Usher App" },': 'usher: { eyebrow: "Workspace", title: "Usher App" },',
    '            Workspace / 01': '            Workspace',
    '{events.map((event, index) => (': '{events.map((event) => (',
    '                      Acara {String(index + 1).padStart(2, "0")}': '                      Acara',
    '                      {event.title || `Acara ${index + 1}`}': '                      {event.title || "Acara tanpa judul"}',
}.items():
    replace_exact(dashboard, old, new)

invitation_panel = Path("components/Dashboard/InvitationWorkspacePanel.tsx")
replace_exact(invitation_panel, '{invitations.map((invitation, index) => {', '{invitations.map((invitation) => {')
replace_exact(invitation_panel, 'const title = invitation.title.trim() || `Acara ${index + 1}`;', 'const title = invitation.title.trim() || "Acara tanpa judul";')
replace_exact(
    invitation_panel,
    '                        Undangan {String(index + 1).padStart(2, "0")}',
    '                        Undangan Digital',
)

event_panel = Path("components/Dashboard/EventPanel.tsx")
replace_exact(event_panel, '{events.map((event, index) => {', '{events.map((event) => {')
replace_exact(
    event_panel,
    '''                <div className="flex min-w-0 items-center gap-2">\n                  <span className="font-[family-name:var(--font-dm-mono)] text-[9px] text-muted-foreground">\n                    {String(index + 1).padStart(2, "0")}\n                  </span>\n                  <p className="truncate text-sm font-semibold">\n                    {draft ? "Acara baru" : event.title || `Acara ${index + 1}`}\n                  </p>''',
    '''                <div className="flex min-w-0 items-center gap-2">\n                  <p className="truncate text-sm font-semibold">\n                    {draft ? "Acara baru" : event.title || "Acara tanpa judul"}\n                  </p>''',
)

wa_panel = Path("components/Dashboard/WhatsAppBlastPanel.tsx")
replace_exact(wa_panel, 'events.map((event, index) => (', 'events.map((event) => (')
replace_exact(wa_panel, '{event.title || `Acara ${index + 1}`}', '{event.title || "Acara tanpa judul"}')

scope_picker = Path("components/Dashboard/EventScopePicker.tsx")
replace_exact(scope_picker, '{events.map((event, index) => (', '{events.map((event) => (')
replace_exact(scope_picker, '{event.title.trim() || `Rangkaian ${index + 1}`}', '{event.title.trim() || "Acara tanpa judul"}')

# Keep the latest user rule explicit for future agents and resolve it with the dashboard shell requirement.
agents = Path("AGENTS.md")
replace_exact(
    agents,
    '''### Desktop View\n\n- Always !! use 80% VW for all, header/content/footer.''',
    '''### Desktop View\n\n- Always !! use 80% VW for primary desktop header/content/footer containers. Do not regress page-level content to a fixed `max-width: 1400px` (or similarly narrow legacy wrapper) that leaves excessive unused desktop space.\n- Dashboard chrome may span the viewport, but the customer-facing header/content workspace should target `80vw` and remain capped by the available pane width so the sidebar never causes horizontal overflow.\n- Do not use decorative sequence numbering in customer-facing page/component copy (for example `Workspace / 01`, `Acara 02`, `Undangan 03`, numbered feature labels, or numbered cards). Use descriptive labels instead. Numeric values that are actual product data remain allowed and required where meaningful, including dates, times, prices, counts, capacities, quotas, child order, phone numbers, and metrics.''',
)

prd = Path("prd.md")
replace_exact(
    prd,
    '''### 6.1 Desktop dashboard shell\n\nPada desktop dashboard menggunakan **full-width application workspace**, bukan centered marketing container.\n\nLayout canonical:\n- header dashboard membentang selebar viewport;\n- logo **DC Organizer** menjadi anchor kiri header;\n- sidebar dimulai tepat di bawah header/logo dan mempertahankan lebar navigasi yang stabil;\n- main workspace memakai seluruh sisa lebar viewport di sebelah sidebar dengan responsive horizontal gutter;\n- jangan membatasi workspace dashboard dengan `max-width: 1400px`/`92vw` seperti public marketing pages;\n- selector/form yang memang tidak membutuhkan full width boleh tetap compact agar mudah dibaca;\n- tabel data tidak boleh dipaksa stretch memenuhi layar lebar: gunakan content-driven desktop width yang proporsional, row treatment yang jelas, dan horizontal overflow pada viewport yang lebih kecil.''',
    '''### 6.1 Desktop dashboard shell\n\nPada desktop dashboard menggunakan **application workspace yang memanfaatkan layar lebar**, bukan centered legacy container yang berhenti di `1400px`.\n\nLayout canonical:\n- background/chrome header dashboard tetap membentang selebar viewport;\n- primary header/content container menargetkan **80vw** sesuai desktop agent rule dan selalu dibatasi oleh lebar pane yang tersedia agar tidak overflow;\n- logo **DC Organizer** menjadi anchor kiri header;\n- sidebar dimulai tepat di bawah header/logo dan mempertahankan lebar navigasi yang stabil;\n- main pane memakai seluruh sisa lebar viewport di sebelah sidebar, sementara page-level workspace di dalamnya tidak boleh kembali ke `max-width: 1400px`/`92vw`;\n- pada viewport desktop yang sempit, available pane width mengalahkan target `80vw` sehingga sidebar tidak menyebabkan horizontal overflow;\n- selector/form yang memang tidak membutuhkan full width boleh tetap compact agar mudah dibaca;\n- tabel data tidak boleh dipaksa stretch memenuhi layar lebar: gunakan content-driven desktop width yang proporsional, row treatment yang jelas, dan horizontal overflow pada viewport yang lebih kecil;\n- customer-facing page/component copy **tidak menggunakan decorative sequence numbering** seperti `Workspace / 01`, `Acara 02`, `Undangan 03`, numbered feature label, atau numbered card. Gunakan label deskriptif; angka yang merupakan data nyata (tanggal, waktu, harga, jumlah, kapasitas, kuota, urutan anak, nomor telepon, metric) tetap ditampilkan.''',
)

readme = Path("README.md")
replace_exact(
    readme,
    '- Canonical application button primitive: `components/ui/button.tsx`.',
    '''- Canonical application button primitive: `components/ui/button.tsx`.\n- Primary desktop header/content/footer containers target **80vw**; do not reintroduce fixed `1400px` page wrappers that waste wide-screen space.\n- Dashboard chrome can span the viewport, while its customer workspace is capped by the available main pane to avoid sidebar-driven overflow.\n- Customer-facing UI copy avoids decorative sequence numbering; use descriptive labels instead. Real numeric product data (dates, time, price, counts, capacity, quota, child order, metrics) remains visible.''',
)

supplement = Path("prd-tambahan.md")
supplement.write_text(
    '''# PRD Tambahan — Desktop Workspace & Content Label Correction\n\n**Date:** 17 September 2026  \n**Status:** Supplemental user-requested delta. Active/canonical requirements are mirrored into `prd.md`; implementation history remains in `prd1.md`.\n\n## Desktop width correction\n- Primary desktop header/content/footer containers target **80vw**.\n- Page-level UI must not regress to fixed `max-width: 1400px` / `92vw` wrappers that leave excessive unused space on wide monitors.\n- Dashboard chrome/background may span the viewport, while the content workspace targets 80vw and is capped by the actual main-pane width so the sidebar cannot create horizontal overflow.\n- Compact controls/forms may stay content-sized when readability benefits; data tables remain content-driven rather than stretched unnaturally.\n\n## Content numbering correction\n- Do not use decorative sequence numbering in page/component copy.\n- Examples to remove/avoid: `Workspace / 01`, `Acara 02`, `Undangan 03`, numbered feature labels, numbered cards, or index-based fallback titles.\n- Replace them with descriptive labels such as `Workspace`, `Acara`, `Undangan Digital`, or `Acara tanpa judul`.\n- Numbers that represent actual user/product data are not decorative and remain allowed: dates, times, prices, counts, capacities, quotas, child order, phone numbers, and metrics.\n\n## Implementation scope\n- Dashboard shell/header/content width behavior.\n- Beranda and dashboard tab headers.\n- Rangkaian Acara event list.\n- Undangan workspace cards.\n- Personal Invitation workspace.\n- WA Blast workspace.\n- RSVP, Manajemen Tamu, Usher, and feature-gate wrappers.\n- Event scope fallback labels.\n''',
    encoding="utf-8",
)
print(f"created {supplement}")

# Guard against the exact decorative-number regressions addressed by this change.
violations = []
number_patterns = [
    re.compile(r'(?:Workspace|Acara|Undangan|Add-on|Rangkaian)\s*/\s*\d+', re.I),
    re.compile(r'(?:Acara|Undangan|Rangkaian)\s*\$\{index\s*\+\s*1\}', re.I),
]
for root in (Path("app"), Path("components")):
    for path in root.rglob("*.tsx"):
        text = path.read_text(encoding="utf-8")
        for lineno, line in enumerate(text.splitlines(), 1):
            if any(pattern.search(line) for pattern in number_patterns):
                violations.append(f"{path}:{lineno}: {line.strip()}")

if violations:
    print("Residual decorative numbering found:")
    print("\n".join(violations))
    raise SystemExit(1)

print("No targeted decorative sequence numbering remains in app/components TSX.")

# Report remaining wide-screen constraints for manual review without blindly widening compact UI.
print("\nRemaining potentially narrow page-level wrappers for review:")
for root in (Path("app"), Path("components")):
    for path in root.rglob("*.tsx"):
        for lineno, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
            if "w-[min(" in line or re.search(r'\bmax-w-(?:3xl|4xl|5xl|6xl|7xl)\b', line):
                print(f"{path}:{lineno}: {line.strip()}")
