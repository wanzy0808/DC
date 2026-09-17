from pathlib import Path

page_path = Path('app/dashboard/page.tsx')
layout_path = Path('app/dashboard/layout.tsx')
changelog_path = Path('prd1.md')

page = page_path.read_text()
layout = layout_path.read_text()
changelog = changelog_path.read_text()


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise SystemExit(f'Missing expected block: {label}')
    return text.replace(old, new, 1)

# Keep cards neutral/white and use hierarchy through spacing, borders and Rose accents.
page = replace_once(
    page,
    '''    <section\n      className={`rounded-xl border border-border/80 bg-foreground/[0.018] ${className}`}\n    >''',
    '''    <section\n      className={`rounded-2xl border border-border/70 bg-background shadow-[0_1px_2px_rgba(0,0,0,0.03)] ${className}`}\n    >''',
    'Card surface',
)

# Sidebar: neutral canvas, Rose only for active state/accent.
page = replace_once(
    page,
    '''          <nav className="flex-1 space-y-2 bg-primary/[0.045] p-3 dark:bg-primary/[0.07]">\n            <p className="px-3 pb-3 pt-3 font-[family-name:var(--font-cinzel)] text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">\n              Workspace\n            </p>''',
    '''          <nav className="flex-1 space-y-1.5 bg-background p-3">\n            <p className="px-3 pb-2 pt-3 font-[family-name:var(--font-dm-mono)] text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">\n              Workspace\n            </p>''',
    'sidebar surface',
)

page = page.replace(
    'className="rounded-xl border border-primary/10 bg-background/35 p-1.5"',
    'className="rounded-xl border border-border/70 bg-background p-1.5"',
    1,
)

# Replace header with a stable two-column shell: logo aligned to sidebar, workspace aligned to content pane.
header_start = page.index('          <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">')
header_end = page.index('          </header>', header_start) + len('          </header>')
new_header = '''          <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur-xl">
            <div className="flex min-h-16 w-full min-w-0 items-stretch">
              <div className="hidden w-64 shrink-0 items-center border-r border-border/70 px-5 lg:flex">
                <Link
                  href="/"
                  className="font-[family-name:var(--font-cinzel)] text-base font-bold tracking-[0.12em] text-primary"
                >
                  DC Organizer
                </Link>
              </div>

              <div className="min-w-0 flex-1">
                <div className="mx-auto flex min-h-16 w-[80vw] max-w-[calc(100%-2rem)] min-w-0 items-center gap-3">
                  <Button
                    type="button"
                    size="icon"
                    className="lg:hidden"
                    onClick={() => setMobileOpen((value) => !value)}
                    aria-label="Buka menu dashboard"
                    title="Buka menu dashboard"
                  >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </Button>

                  <Link
                    href="/"
                    className="shrink-0 font-[family-name:var(--font-cinzel)] text-sm font-bold tracking-[0.12em] text-primary lg:hidden"
                  >
                    DC Organizer
                  </Link>

                  <div className="hidden h-8 w-px bg-border/70 sm:block lg:hidden" />

                  <div className="min-w-0">
                    <p className="font-[family-name:var(--font-dm-mono)] text-[8px] uppercase tracking-[0.16em] text-muted-foreground">
                      {meta.eyebrow}
                    </p>
                    <div className="flex min-w-0 items-center gap-2">
                      <p className="truncate text-sm font-semibold text-foreground sm:text-base">
                        {meta.title}
                      </p>
                      {scopedHeaderEvent && (
                        <span className="hidden max-w-56 truncate border-l border-border pl-2 text-[11px] text-muted-foreground xl:inline">
                          {scopedHeaderEvent.title}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="relative ml-auto">
                    <Button
                      type="button"
                      onClick={() => setProfileMenu((value) => !value)}
                      className="h-11 min-w-0 bg-transparent px-2 text-foreground shadow-none hover:bg-primary/[0.06] hover:text-foreground"
                      aria-label={`Buka menu akun ${profileLabel}`}
                      title="Menu akun"
                    >
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 font-[family-name:var(--font-dm-mono)] text-[11px] font-semibold uppercase text-primary">
                        {profileLabel.slice(0, 2)}
                      </span>
                      <span className="hidden max-w-36 truncate text-xs sm:inline">{profileLabel}</span>
                      <ChevronDown
                        className={`h-3.5 w-3.5 shrink-0 text-muted-foreground transition ${profileMenu ? "rotate-180" : ""}`}
                      />
                    </Button>

                    {profileMenu && (
                      <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-xl border border-border bg-background p-2.5 text-foreground shadow-[0_18px_45px_rgba(0,0,0,0.12)] dark:shadow-black/40">
                        <div className="px-2 pb-3 pt-1">
                          <p className="font-[family-name:var(--font-cinzel)] text-sm font-semibold">
                            {profileLabel}
                          </p>
                          <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                            {ctx?.profile.email || ""}
                          </p>
                        </div>
                        <div className="space-y-1.5">
                          <MenuItem
                            icon={Receipt}
                            text="Lihat transaksi"
                            onClick={() => router.push("/transactions")}
                          />
                          <MenuItem
                            icon={Settings2}
                            text="Beli layanan"
                            onClick={() => router.push("/packages")}
                          />
                          <MenuItem
                            icon={CircleHelp}
                            text="Buka FAQ"
                            onClick={() => router.push("/faq")}
                          />
                          <MenuItem
                            icon={MessageCircle}
                            text="Buka bantuan"
                            onClick={() => setProfileMenu(false)}
                          />
                          <div className="my-2 border-t border-border" />
                          <MenuItem icon={LogOut} text="Keluar akun" danger onClick={logout} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </header>'''
page = page[:header_start] + new_header + page[header_end:]

# Dynamic title now lives only in the header; remove duplicated page title strip.
start_marker = '''            {tab !== "overview" && (\n              <section className="bg-background">'''
start = page.index(start_marker)
end_marker = '''            )}\n\n            {tab === "overview" && ('''
end = page.index(end_marker, start)
page = page[:start] + '            {tab === "overview" && (' + page[end + len(end_marker):]

# Overview redesign: no images, no fake activity; only real data and real navigation.
overview_start = page.index('function WorkspaceOverview({')
overview_end = page.index('\nfunction EventActivationNotice', overview_start)
new_overview = r'''function formatEventDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function WorkspaceOverview({
  ctx,
  events,
  onGo,
}: {
  ctx: Context | null;
  events: DashboardEvent[];
  onGo: (id: Tab) => void;
}) {
  const overview = ctx?.overview;
  const active = events.filter((event) => event.accessPaid).length;
  const published = events.filter((event) => event.isPublished).length;

  const stats = [
    { label: "Total acara", value: events.length, icon: CalendarDays },
    { label: "Undangan aktif", value: active, icon: Mail },
    { label: "Total RSVP", value: overview?.totalRsvp ?? 0, icon: MessageSquareHeart },
    { label: "Total tamu", value: overview?.totalGuests ?? 0, icon: Users },
  ];

  return (
    <div className="mx-auto w-[80vw] max-w-full min-w-0 pb-16 pt-6 sm:pt-7">
      <section className="overflow-hidden rounded-2xl border border-border/70 bg-background shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col gap-5 border-l-4 border-primary px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="min-w-0">
            <p className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.16em] text-primary">
              DC Organizer
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-cinzel)] text-2xl font-semibold leading-tight sm:text-3xl">
              Halo, {ctx?.profile.displayName || "Akun"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Kelola acara, undangan, RSVP, dan tamu dari satu workspace.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <div className="min-w-28 rounded-xl border border-border/70 bg-foreground/[0.018] px-4 py-3">
              <p className="font-[family-name:var(--font-dm-mono)] text-[8px] uppercase tracking-[0.14em] text-muted-foreground">
                Workspace
              </p>
              <p className="mt-1 text-sm font-semibold">
                {events.length ? `${events.length} acara` : "Belum ada acara"}
              </p>
            </div>
            <Button onClick={() => onGo("events")} size="sm">
              <CalendarDays className="h-4 w-4" />
              Tambah acara
            </Button>
          </div>
        </div>
      </section>

      <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <article
              key={item.label}
              className="flex min-w-0 items-center gap-4 rounded-2xl border border-border/70 bg-background p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-4 w-4" strokeWidth={1.8} />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground">{item.label}</p>
                <p className="mt-0.5 truncate text-xl font-semibold text-foreground">{item.value}</p>
              </div>
            </article>
          );
        })}
      </section>

      <section className="mt-4 grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.75fr)]">
        <Card className="min-w-0 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-[family-name:var(--font-cinzel)] text-lg font-semibold">Acara terbaru</h2>
              <p className="mt-1 font-[family-name:var(--font-dm-mono)] text-[8px] uppercase tracking-[0.12em] text-muted-foreground">
                {active} aktif · {published} terbit
              </p>
            </div>
            <Button onClick={() => onGo("events")} size="sm">
              Kelola acara
            </Button>
          </div>

          {events.length ? (
            <div className="overflow-x-auto px-4 pb-4 sm:px-5">
              <table className="w-full min-w-[760px] border-separate border-spacing-0 text-left">
                <thead>
                  <tr className="text-[10px] text-muted-foreground">
                    <th className="px-3 py-3 font-medium">Acara</th>
                    <th className="px-3 py-3 font-medium">Tanggal</th>
                    <th className="px-3 py-3 font-medium">Lokasi</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                    <th className="px-3 py-3 text-right font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {events.slice(0, 6).map((event) => (
                    <tr key={event.id} className="border-t border-border/60">
                      <td className="max-w-64 px-3 py-3.5">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {event.title || "Acara tanpa judul"}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-xs text-muted-foreground">
                        {formatEventDate(event.eventDate)}
                      </td>
                      <td className="max-w-52 px-3 py-3.5 text-xs text-muted-foreground">
                        <p className="truncate">{event.venue || "—"}</p>
                      </td>
                      <td className="px-3 py-3.5">
                        <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 font-[family-name:var(--font-dm-mono)] text-[8px] uppercase tracking-[0.08em] text-primary">
                          {event.isPublished ? "Terbit" : event.accessPaid ? "Aktif" : "Draft"}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-right">
                        <Link
                          href={`/dashboard/editor?type=${event.type}&invitationId=${event.id}`}
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          Undangan
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-5 py-8 sm:px-6">
              <div className="flex max-w-xl items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <CalendarDays className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Belum ada acara</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Buat acara pertama untuk mulai menyiapkan undangan digital.
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>

        <Card className="min-w-0 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-[family-name:var(--font-dm-mono)] text-[8px] uppercase tracking-[0.14em] text-primary">
                Akses cepat
              </p>
              <h2 className="mt-1 font-[family-name:var(--font-cinzel)] text-lg font-semibold">
                Kelola workspace
              </h2>
            </div>
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
              <Settings2 className="h-4 w-4" />
            </span>
          </div>

          <div className="mt-5 divide-y divide-border/70 border-y border-border/70">
            {[
              { id: "invitation" as Tab, label: "Undangan Digital", icon: Mail },
              { id: "rsvp" as Tab, label: "RSVP", icon: MessageSquareHeart },
              { id: "placement" as Tab, label: "Manajemen Tamu", icon: Users },
              { id: "waBlast" as Tab, label: "WA Blast Add-on", icon: Send },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onGo(item.id)}
                  className="flex min-h-12 w-full items-center gap-3 py-3 text-left text-sm transition hover:text-primary"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/[0.08] text-primary">
                    <Icon className="h-4 w-4" strokeWidth={1.8} />
                  </span>
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  <ChevronDown className="h-3.5 w-3.5 -rotate-90 text-muted-foreground" />
                </button>
              );
            })}
          </div>

          <div className="mt-5 rounded-xl border border-border/70 bg-foreground/[0.018] p-4">
            <p className="text-xs font-semibold">Status workspace</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <p className="font-[family-name:var(--font-dm-mono)] text-[8px] uppercase tracking-[0.1em] text-muted-foreground">
                  Terbit
                </p>
                <p className="mt-1 text-lg font-semibold">{published}</p>
              </div>
              <div>
                <p className="font-[family-name:var(--font-dm-mono)] text-[8px] uppercase tracking-[0.1em] text-muted-foreground">
                  Dibagikan
                </p>
                <p className="mt-1 text-lg font-semibold">{overview?.invitationsShared ?? 0}</p>
              </div>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
'''
page = page[:overview_start] + new_overview + page[overview_end:]

# Make generic loading/activation surfaces consistent with neutral cards.
page = page.replace('rounded-xl border border-border/80 bg-foreground/[0.018]', 'rounded-2xl border border-border/70 bg-background', 2)

# Dashboard layout CSS: fixed header spans viewport, brand column lines up with sidebar; workspace remains 80vw within remaining pane.
old_layout_header = '''  .dc-dashboard header > div {\n    width: min(80vw, calc(100% - 2rem)) !important;\n    max-width: none !important;\n    margin-left: auto !important;\n    margin-right: auto !important;\n    padding-left: 0 !important;\n    padding-right: 0 !important;\n  }'''
new_layout_header = '''  .dc-dashboard header > div {\n    width: 100% !important;\n    max-width: none !important;\n    margin: 0 !important;\n    padding: 0 !important;\n  }'''
layout = replace_once(layout, old_layout_header, new_layout_header, 'dashboard header css')

old_link_rule = '''\n  @media (min-width: 1024px) {\n    .dc-dashboard header a[href="/"] {\n      width: 14.25rem;\n      flex: 0 0 14.25rem;\n    }\n  }\n'''
layout = replace_once(layout, old_link_rule, '\n', 'legacy header logo width css')

# Tables in redesigned overview own their width. Keep wide specialized workspace tables readable without stretching all tables globally.
old_table_css = '''  .dc-dashboard main table {\n    width: max-content !important;\n    min-width: 940px !important;\n    max-width: 1180px;\n    border-collapse: separate;\n    border-spacing: 0 0.4rem;\n  }\n\n  .dc-dashboard main table thead tr {\n    border-bottom: 0 !important;\n  }\n\n  .dc-dashboard main table tbody tr {\n    background: color-mix(in srgb, currentColor 2.5%, transparent);\n  }\n\n  .dc-dashboard main table tbody td:first-child {\n    border-radius: 10px 0 0 10px;\n  }\n\n  .dc-dashboard main table tbody td:last-child {\n    border-radius: 0 10px 10px 0;\n  }\n\n'''
new_table_css = '''  .dc-dashboard main table {\n    border-collapse: separate;\n  }\n\n'''
layout = replace_once(layout, old_table_css, new_table_css, 'global dashboard table css')

page_path.write_text(page)
layout_path.write_text(layout)

entry = '''\n\n---\n\n## 2026-09-17 — Dashboard Visual Hierarchy & Header Realignment\n\n### Summary\nDashboard customer workspace dirombak mengikuti arah visual yang disetujui user tanpa mengubah brand/product rules: neutral white/near-black surfaces, Rose `#C07A84` sebagai accent, Cinzel/Fauna One/DM Mono tetap dipakai, dan tidak ada decorative hero image atau fake activity/testimonial.\n\n### Implemented\n- header dashboard menjadi full-width chrome dengan kolom brand sejajar tepat di atas sidebar;\n- workspace header memakai sisa pane dan tetap mengikuti target 80vw tanpa overflow sidebar;\n- dynamic page title hanya tampil di header, sehingga title strip kedua di bawah header dihapus;\n- sidebar dikembalikan ke neutral surface dan Rose dipakai pada active/selected emphasis;\n- Beranda memakai hierarchy baru: welcome block, metric cards ber-icon, tabel acara terbaru, quick access, dan status workspace;\n- tabel Beranda memakai data acara asli dari PostgreSQL/API, bukan mock data;\n- tidak ada gambar dekoratif baru, perubahan logo/brand, atau perubahan product flow/entitlement;\n- global table CSS yang memaksa semua tabel menjadi `max-content`/minimum 940px dihapus agar overview table dan workspace tables dapat mengatur lebar sesuai konteks.\n\n### Affected files\n- `app/dashboard/page.tsx`;\n- `app/dashboard/layout.tsx`;\n- `prd1.md`.\n\n### Validation\n- GitHub Build Validation: pending setelah source commit.\n'''
if '## 2026-09-17 — Dashboard Visual Hierarchy & Header Realignment' not in changelog:
    changelog_path.write_text(changelog.rstrip() + entry + '\n')
