from pathlib import Path


def read(path: str) -> str:
    return Path(path).read_text(encoding="utf-8")


def write(path: str, text: str) -> None:
    target = Path(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(text, encoding="utf-8")


def replace_exact(text: str, old: str, new: str, label: str, count: int = 1) -> str:
    found = text.count(old)
    if found < count:
        raise SystemExit(f"{label}: expected at least {count} occurrence(s), found {found}")
    return text.replace(old, new, count)


# ---------------------------------------------------------------------------
# Canonical brand component: one implementation for the DC Organizer wordmark.
# ---------------------------------------------------------------------------
brand = '''import type { HTMLAttributes } from "react";

export type BrandWordmarkSize = "public" | "dashboard" | "mobile";

type BrandWordmarkProps = HTMLAttributes<HTMLSpanElement> & {
  size?: BrandWordmarkSize;
  showTagline?: boolean;
};

const sizeClass: Record<BrandWordmarkSize, string> = {
  public: "text-2xl sm:text-3xl",
  dashboard: "text-xl",
  mobile: "text-base",
};

export default function BrandWordmark({
  size = "public",
  showTagline = false,
  className = "",
  ...props
}: BrandWordmarkProps) {
  return (
    <span className={`block min-w-0 ${className}`} {...props}>
      <span
        className={`block font-[family-name:var(--font-dc-heading)] font-bold leading-none tracking-[0.12em] text-primary ${sizeClass[size]}`}
      >
        DC Organizer
      </span>
      {showTagline && (
        <span className="mt-1 block font-[family-name:var(--font-dc-mono)] text-[8px] uppercase tracking-[0.22em] text-foreground/60">
          Your best consultant for wedding & event
        </span>
      )}
    </span>
  );
}
'''
write("components/Brand/BrandWordmark.tsx", brand)

# ---------------------------------------------------------------------------
# Shared dashboard primitives: future dashboard workspaces extend these instead
# of inventing another card/metric/notice language.
# ---------------------------------------------------------------------------
primitives = '''import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

function classes(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function DashboardPage({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={classes(
        "dc-dashboard-page mx-auto w-[80vw] max-w-full min-w-0 pb-16 pt-6 sm:pt-7",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DashboardSurface({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={classes(
        "dc-dashboard-surface rounded-2xl border border-border/70 bg-background shadow-[0_1px_2px_rgba(0,0,0,0.03)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function DashboardMetricCard({
  label,
  value,
  icon: Icon,
  className = "",
}: {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <article
      className={classes(
        "dc-dashboard-metric flex min-w-0 items-center gap-4 rounded-2xl border border-border/70 bg-background p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]",
        className,
      )}
    >
      {Icon && (
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
          <Icon className="h-4 w-4" strokeWidth={1.8} />
        </span>
      )}
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <div className="mt-0.5 truncate text-xl font-semibold text-foreground">{value}</div>
      </div>
    </article>
  );
}

export function DashboardNotice({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={classes(
        "rounded-xl border border-primary/15 bg-primary/[0.035] px-4 py-3 text-xs leading-5 text-muted-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DashboardSectionHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="font-[family-name:var(--font-dc-mono)] text-[8px] uppercase tracking-[0.14em] text-primary">
            {eyebrow}
          </p>
        )}
        <h2 className="mt-1 font-[family-name:var(--font-dc-heading)] text-lg font-semibold text-foreground">
          {title}
        </h2>
        {description && (
          <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
'''
write("components/Dashboard/DashboardPrimitives.tsx", primitives)

# ---------------------------------------------------------------------------
# Public navbar uses the same canonical wordmark implementation.
# ---------------------------------------------------------------------------
path = "components/Layout/Navbar/Navbar.tsx"
text = read(path)
text = replace_exact(
    text,
    'import { Button } from "@/components/ui/button";\n',
    'import { Button } from "@/components/ui/button";\nimport BrandWordmark from "@/components/Brand/BrandWordmark";\n',
    "navbar brand import",
)
old = '''        <Link href="/" className="group block min-w-0">
          <div className="font-[family-name:var(--font-dc-heading)] text-2xl font-bold leading-none tracking-[0.12em] text-primary transition-transform group-hover:scale-[1.01] sm:text-3xl">DC Organizer</div>
          <div className="mt-1 font-[family-name:var(--font-dc-mono)] text-[8px] uppercase tracking-[0.22em] text-foreground/60">Your best consultant for wedding & event</div>
        </Link>'''
new = '''        <Link href="/" className="group block min-w-0">
          <BrandWordmark
            showTagline
            className="transition-transform group-hover:scale-[1.01]"
          />
        </Link>'''
text = replace_exact(text, old, new, "navbar canonical wordmark")
write(path, text)

# ---------------------------------------------------------------------------
# Dashboard header: canonical wordmark, no marketing tagline.
# Dashboard local Card delegates to shared surface primitive.
# ---------------------------------------------------------------------------
path = "app/dashboard/page.tsx"
text = read(path)
text = replace_exact(
    text,
    'import { Input } from "@/components/ui/input";\n',
    'import { Input } from "@/components/ui/input";\nimport BrandWordmark from "@/components/Brand/BrandWordmark";\nimport { DashboardSurface } from "@/components/Dashboard/DashboardPrimitives";\n',
    "dashboard shared imports",
)
old_card = '''function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-border/70 bg-background shadow-[0_1px_2px_rgba(0,0,0,0.03)] ${className}`}
    >
      {children}
    </section>
  );
}
'''
new_card = '''function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <DashboardSurface className={className}>{children}</DashboardSurface>;
}
'''
text = replace_exact(text, old_card, new_card, "dashboard Card primitive")
old_desktop = '''                <Link href="/" className="group block min-w-0">
                  <div className="font-[family-name:var(--font-dc-heading)] text-2xl font-bold leading-none tracking-[0.12em] text-primary transition-transform group-hover:scale-[1.01]">
                    DC Organizer
                  </div>
                  <div className="mt-1 whitespace-nowrap font-[family-name:var(--font-dc-mono)] text-[8px] uppercase tracking-[0.22em] text-foreground/60">
                    Your best consultant for wedding & event
                  </div>
                </Link>'''
new_desktop = '''                <Link href="/" className="group block min-w-0">
                  <BrandWordmark
                    size="dashboard"
                    className="transition-transform group-hover:scale-[1.01]"
                  />
                </Link>'''
text = replace_exact(text, old_desktop, new_desktop, "dashboard desktop brand")
old_mobile = '''                  <Link href="/" className="group min-w-0 shrink-0 lg:hidden">
                    <div className="font-[family-name:var(--font-dc-heading)] text-base font-bold leading-none tracking-[0.12em] text-primary">
                      DC Organizer
                    </div>
                    <div className="mt-0.5 hidden whitespace-nowrap font-[family-name:var(--font-dc-mono)] text-[6px] uppercase tracking-[0.16em] text-foreground/60 sm:block">
                      Your best consultant for wedding & event
                    </div>
                  </Link>'''
new_mobile = '''                  <Link href="/" className="group min-w-0 shrink-0 lg:hidden">
                    <BrandWordmark size="mobile" />
                  </Link>'''
text = replace_exact(text, old_mobile, new_mobile, "dashboard mobile brand")
write(path, text)

# ---------------------------------------------------------------------------
# Dashboard components: one neutral surface/card language like Beranda.
# ---------------------------------------------------------------------------
dashboard_files = [
    "components/Dashboard/EventPanel.tsx",
    "components/Dashboard/EventScopePicker.tsx",
    "components/Dashboard/FeatureGate.tsx",
    "components/Dashboard/InvitationWorkspacePanel.tsx",
    "components/Dashboard/PersonalInvitationPanel.tsx",
    "components/Dashboard/RsvpAnalyticsPanel.tsx",
    "components/Dashboard/SeatingChart.tsx",
    "components/Dashboard/WhatsAppBlastPanel.tsx",
]

surface_replacements = [
    (
        "rounded-xl border border-border/80 bg-foreground/[0.018]",
        "rounded-2xl border border-border/70 bg-background shadow-[0_1px_2px_rgba(0,0,0,0.03)]",
    ),
    (
        "rounded-xl border border-primary/10 bg-foreground/[0.022]",
        "rounded-2xl border border-border/70 bg-background shadow-[0_1px_2px_rgba(0,0,0,0.03)]",
    ),
    (
        "rounded-lg border border-border/70 bg-foreground/[0.018]",
        "rounded-xl border border-border/70 bg-background",
    ),
    (
        "rounded-xl border border-border/70 bg-background/80",
        "rounded-xl border border-border/70 bg-background",
    ),
    (
        "rounded-lg border border-border/70 bg-background/70",
        "rounded-xl border border-border/70 bg-background",
    ),
]

for file_path in dashboard_files:
    text = read(file_path)
    text = text.replace(
        'mx-auto w-[80vw] max-w-full min-w-0',
        'dc-dashboard-page mx-auto w-[80vw] max-w-full min-w-0',
    )
    for old, new in surface_replacements:
        text = text.replace(old, new)
    write(file_path, text)

# Rangkaian Acara receives the same grouped surface hierarchy as Beranda.
path = "components/Dashboard/EventPanel.tsx"
text = read(path)
text = replace_exact(
    text,
    '<div className="w-full min-w-0 px-4 pb-16 pt-5 sm:px-6 lg:px-8">',
    '<div className="dc-dashboard-page mx-auto w-[80vw] max-w-full min-w-0 pb-16 pt-6 sm:pt-7">',
    "event page wrapper",
)
text = replace_exact(
    text,
    '<div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">',
    '<div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:p-5">',
    "event toolbar surface",
)
text = replace_exact(
    text,
    '<div className="divide-y divide-border/70">',
    '<div className="mt-4 divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/70 bg-background px-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:px-5">',
    "event list surface",
)
text = replace_exact(
    text,
    'className="scroll-mt-24 border-t border-border pt-6"',
    'className="mt-4 scroll-mt-24 rounded-2xl border border-border/70 bg-background p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:p-6"',
    "event editor surface",
)
write(path, text)

# Metric cards in invitation and WA pages now visually match Beranda.
for file_path, icon_type in [
    ("components/Dashboard/InvitationWorkspacePanel.tsx", "Send"),
    ("components/Dashboard/WhatsAppBlastPanel.tsx", "MessageCircle"),
]:
    text = read(file_path)
    old = f'''function Metric({{
  icon: Icon,
  label,
  value,
}}: {{
  icon: typeof {icon_type};
  label: string;
  value: string;
}}) {{
  return (
    <div className="rounded-2xl border border-border/70 bg-background shadow-[0_1px_2px_rgba(0,0,0,0.03)] px-4 py-3.5">
      <div className="flex items-center justify-between gap-3">
        <p className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
          {{label}}
        </p>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="mt-1 text-xl font-semibold text-foreground">{{value}}</p>
    </div>
  );
}}'''
    new = f'''function Metric({{
  icon: Icon,
  label,
  value,
}}: {{
  icon: typeof {icon_type};
  label: string;
  value: string;
}}) {{
  return (
    <div className="flex min-w-0 items-center gap-4 rounded-2xl border border-border/70 bg-background p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-4 w-4" strokeWidth={{1.8}} />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{{label}}</p>
        <p className="mt-0.5 truncate text-xl font-semibold text-foreground">{{value}}</p>
      </div>
    </div>
  );
}}'''
    if old not in text:
        raise SystemExit(f"metric pattern missing in {file_path}")
    text = text.replace(old, new, 1)
    write(file_path, text)

# RSVP metric cards align with the overview icon-left card hierarchy.
path = "components/Dashboard/RsvpAnalyticsPanel.tsx"
text = read(path)
old = '''          <article
            key={label}
            className="min-w-0 rounded-2xl border border-border/70 bg-background shadow-[0_1px_2px_rgba(0,0,0,0.03)] p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                {label}
              </p>
              <Icon className="h-4 w-4 shrink-0 text-primary" />
            </div>
            <p className="mt-2 font-[family-name:var(--font-dm-mono)] text-2xl font-medium text-foreground">
              {value}
            </p>
          </article>'''
new = '''          <article
            key={label}
            className="flex min-w-0 items-center gap-4 rounded-2xl border border-border/70 bg-background p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
              <Icon className="h-4 w-4" strokeWidth={1.8} />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground">{label}</p>
              <p className="mt-0.5 truncate text-xl font-semibold text-foreground">{value}</p>
            </div>
          </article>'''
text = replace_exact(text, old, new, "RSVP metric hierarchy")
write(path, text)

# ---------------------------------------------------------------------------
# Dashboard shell/CSS: remove the stale 1400px rule and align fixed header/aside.
# ---------------------------------------------------------------------------
path = "app/dashboard/layout.tsx"
text = read(path)
text = text.replace("padding-top: 4rem;", "padding-top: 72px;")
text = text.replace("height: calc(100dvh - 4rem);", "height: calc(100dvh - 72px);")
text = text.replace("min-height: calc(100dvh - 4rem) !important;", "min-height: calc(100dvh - 72px) !important;")
text = text.replace("top: 4rem;", "top: 72px;")
text = text.replace("top: 4rem !important;", "top: 72px !important;")
write(path, text)

path = "app/globals.css"
text = read(path)
old_width = '''/* Dashboard content shares one readable width across every workspace page. */
.dc-dashboard header > div.mx-auto,
.dc-dashboard main > section > div.mx-auto,
.dc-dashboard main > div.mx-auto {
  width: min(calc(100% - 3rem), 1400px) !important;
  max-width: 1400px !important;
  margin-left: auto !important;
  margin-right: auto !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
}
'''
new_width = '''/* Dashboard content uses the product-wide 80vw application workspace. */
.dc-dashboard-page,
.dc-dashboard main > section > div.mx-auto,
.dc-dashboard main > div.mx-auto {
  width: min(80vw, calc(100% - 2rem)) !important;
  max-width: none !important;
  margin-left: auto !important;
  margin-right: auto !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
}

.dc-dashboard-surface {
  border-color: var(--border) !important;
  background: var(--background) !important;
}

.dc-dashboard-metric {
  border-color: color-mix(in srgb, var(--primary) 12%, var(--border)) !important;
  background: var(--background) !important;
}
'''
text = replace_exact(text, old_width, new_width, "dashboard stale 1400 width rule")
write(path, text)

# ---------------------------------------------------------------------------
# Documentation governance: make brand/dashboard contracts explicit and hard.
# ---------------------------------------------------------------------------
path = "AGENTS.md"
text = read(path)
anchor = '''- Official product brand: **DC Organizer**.
- Never introduce legacy customer-facing brands such as Citin or DC Wedding.
'''
replacement = '''- Official product brand: **DC Organizer**.
- **Protected brand wordmark contract:** customer-facing `DC Organizer` wordmarks MUST render through `components/Brand/BrandWordmark.tsx` (or preserve its exact output when technically impossible to import it). The wordmark font is `var(--font-dc-heading)` / Cinzel, its wording and Rose treatment are locked, and agents must not reinterpret, restyle, substitute, or resize it into a different logo system unless the user explicitly requests a brand change.
- Public navbar may show the existing brand tagline through `BrandWordmark showTagline`. **Dashboard/app workspace headers MUST NOT show the marketing tagline; dashboard brand anchor is wordmark-only.**
- Never introduce legacy customer-facing brands such as Citin or DC Wedding.
'''
text = replace_exact(text, anchor, replacement, "AGENTS brand contract")
anchor = '''Use only these application UI fonts:
- **Cinzel** — display, headings, titles, branding, editorial elements.
- **Fauna One** — body/UI copy, navigation, forms, buttons, descriptions.
- **DM Mono** — metadata, codes, timestamps, status values, technical labels, small utility text.
'''
replacement = '''Use only these application UI fonts:
- **Cinzel** — display, headings, titles, branding, editorial elements. **DC Organizer wordmark always uses the canonical `--font-dc-heading` token and must not be swapped to another font class.**
- **Fauna One** — body/UI copy, navigation, forms, buttons, descriptions.
- **DM Mono** — metadata, codes, timestamps, status values, technical labels, small utility text.
'''
text = replace_exact(text, anchor, replacement, "AGENTS typography lock")
anchor = '''- Dashboard chrome may span the viewport, but the customer-facing header/content workspace should target `80vw` and remain capped by the available pane width so the sidebar never causes horizontal overflow.
'''
replacement = '''- Dashboard chrome may span the viewport, but the customer-facing header/content workspace should target `80vw` and remain capped by the available pane width so the sidebar never causes horizontal overflow.
- **Dashboard visual consistency is mandatory:** Beranda is the reference visual language for every customer dashboard page and nested dashboard component. Use neutral white/near-black surfaces, subtle borders/low shadow, Rose only as meaningful accent, consistent icon treatment, and the same table/card hierarchy. Do not invent a page-specific color/card system that makes tabs look like different products.
- Reuse/extend `components/Dashboard/DashboardPrimitives.tsx` for new dashboard surfaces, metrics, notices, and section structure instead of creating another dashboard visual primitive.
- Tables/graphs are encouraged when they expose real stored/derived product data; never manufacture dashboard metrics merely to fill space.
'''
text = replace_exact(text, anchor, replacement, "AGENTS dashboard consistency")
write(path, text)

path = "README.md"
text = read(path)
anchor = '''- Brand: **DC Organizer**.
- Logo / primary brand: Rose `#C07A84`.
'''
replacement = '''- Brand: **DC Organizer**.
- Canonical wordmark implementation: `components/Brand/BrandWordmark.tsx`; the wordmark uses `--font-dc-heading` / Cinzel and must not be reinterpreted per page.
- Public navbar may show the existing marketing tagline; **dashboard headers use the DC Organizer wordmark only and do not show the tagline**.
- Logo / primary brand: Rose `#C07A84`.
'''
text = replace_exact(text, anchor, replacement, "README brand contract")
anchor = '''- Dashboard chrome can span the viewport, while its customer workspace is capped by the available main pane to avoid sidebar-driven overflow.
'''
replacement = '''- Dashboard chrome can span the viewport, while its customer workspace is capped by the available main pane to avoid sidebar-driven overflow.
- Beranda defines the canonical customer-dashboard visual language. Rangkaian Acara, Undangan, Personal Invitation, WA Blast, RSVP, Manajemen Tamu/Seating, Usher, feature gates, and reusable dashboard components must use the same neutral surface/card/table hierarchy rather than page-specific styling.
- Shared dashboard presentation primitives live in `components/Dashboard/DashboardPrimitives.tsx`; extend them for new workspace UI. Real tables/graphs are welcome when backed by actual application data, never filler/mock metrics.
'''
text = replace_exact(text, anchor, replacement, "README dashboard consistency")
write(path, text)

path = "prd.md"
text = read(path)
anchor = '''Application UI hanya memakai:
- **Cinzel** — display/headings/branding;
- **Fauna One** — body/UI/navigation/form/button;
- **DM Mono** — metadata/status/code/timestamp/utility text.

Template typography boleh dinamis bila merupakan konten invitation, bukan shell aplikasi.
'''
replacement = '''Application UI hanya memakai:
- **Cinzel** — display/headings/branding;
- **Fauna One** — body/UI/navigation/form/button;
- **DM Mono** — metadata/status/code/timestamp/utility text.

**Brand wordmark contract:** seluruh wordmark customer-facing `DC Organizer` menggunakan implementasi canonical `components/Brand/BrandWordmark.tsx` dan token `--font-dc-heading` (Cinzel). Wording, font, tracking, dan Rose treatment wordmark tidak boleh diinterpretasi ulang per halaman tanpa requirement eksplisit. Public navbar boleh menampilkan tagline marketing existing; **header Dashboard tidak menampilkan tagline dan hanya memakai wordmark `DC Organizer`**.

Template typography boleh dinamis bila merupakan konten invitation, bukan shell aplikasi.
'''
text = replace_exact(text, anchor, replacement, "PRD brand contract")
anchor = '''- Dashboard workspace mengikuti full-width application shell pada Section 6.1; jangan mengembalikan centered public-content cap ke workspace utama.
'''
replacement = '''- Dashboard workspace mengikuti full-width application shell pada Section 6.1; jangan mengembalikan centered public-content cap ke workspace utama.
- **Beranda adalah reference visual language untuk seluruh customer Dashboard.** Rangkaian Acara, Undangan, Personal Invitation, WA Blast, RSVP, Manajemen Tamu/Seating, Usher, feature gate, empty/loading/error states, dan reusable dashboard components wajib memakai hierarchy surface/card/table/icon yang konsisten: canvas netral putih/near-black, border/shadow halus, Rose sebagai accent, bukan page-specific theme.
- Shared dashboard primitives berada di `components/Dashboard/DashboardPrimitives.tsx` dan harus di-extend untuk surface/metric/notice baru agar workspace tidak kembali belang antar-tab.
- Dashboard boleh memakai table/graph ketika datanya berasal dari database/API atau derived metric yang dapat dijelaskan; jangan membuat angka/mock chart untuk dekorasi.
'''
text = replace_exact(text, anchor, replacement, "PRD dashboard visual contract")
write(path, text)

# Append implementation history; prd1 remains changelog only.
path = "prd1.md"
text = read(path)
entry = '''

---

## 2026-09-17 — Protected Brand Contract & Unified Dashboard Visual System

### Requirement / Intent
User menegaskan bahwa brand/font tidak boleh berubah antar iterasi, tagline marketing tidak diperlukan di Dashboard, dan seluruh customer Dashboard beserta nested component harus memakai visual language yang sama seperti Beranda agar tidak terlihat belang.

### Implementation
- menambahkan `components/Brand/BrandWordmark.tsx` sebagai canonical DC Organizer wordmark; font dikunci ke `--font-dc-heading` / Cinzel;
- public Navbar menggunakan shared wordmark dan tetap boleh menampilkan tagline existing;
- Dashboard desktop/mobile menggunakan shared wordmark **tanpa tagline**;
- menambahkan `components/Dashboard/DashboardPrimitives.tsx` sebagai reusable surface/metric/notice/section foundation;
- local Dashboard card primitive sekarang mendelegasikan surface ke shared dashboard primitive;
- Rangkaian Acara, Undangan, Personal Invitation, WA Blast, RSVP, Seating/Manajemen Tamu, Event Scope, dan Feature Gate diselaraskan ke neutral white/near-black surface + subtle border/shadow + Rose accent seperti Beranda;
- Rangkaian Acara mendapat grouped toolbar, list surface, dan editor surface agar tidak lagi terasa seperti halaman berbeda;
- stale global Dashboard width cap `1400px` dihapus dan canonical `80vw`/available-pane behavior dipulihkan;
- fixed Dashboard header/sidebar geometry disamakan pada tinggi 72px;
- `prd.md`, `AGENTS.md`, dan `README.md` sekarang memiliki protected brand contract, dashboard no-tagline rule, dan visual-consistency rule yang eksplisit.

### Affected Files
- `components/Brand/BrandWordmark.tsx`
- `components/Dashboard/DashboardPrimitives.tsx`
- `components/Layout/Navbar/Navbar.tsx`
- `app/dashboard/page.tsx`
- `app/dashboard/layout.tsx`
- `app/globals.css`
- `components/Dashboard/EventPanel.tsx`
- `components/Dashboard/EventScopePicker.tsx`
- `components/Dashboard/FeatureGate.tsx`
- `components/Dashboard/InvitationWorkspacePanel.tsx`
- `components/Dashboard/PersonalInvitationPanel.tsx`
- `components/Dashboard/RsvpAnalyticsPanel.tsx`
- `components/Dashboard/SeatingChart.tsx`
- `components/Dashboard/WhatsAppBlastPanel.tsx`
- `prd.md`
- `AGENTS.md`
- `README.md`
- `prd1.md`

### Validation
Validation diisi oleh workflow one-shot setelah install, Prisma Client generation, dan production build benar-benar selesai. Tidak ada database migration pada perubahan ini.
'''
if "## 2026-09-17 — Protected Brand Contract & Unified Dashboard Visual System" not in text:
    text += entry
write(path, text)
