from pathlib import Path
import re

ROOT = Path('.')


def write(path: str, text: str) -> None:
    Path(path).write_text(text)


def read(path: str) -> str:
    return Path(path).read_text()


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise SystemExit(f'missing required pattern: {label}')
    return text.replace(old, new, 1)


# ---------------------------------------------------------------------------
# Canonical dashboard primitives
# ---------------------------------------------------------------------------
primitives = '''import type { HTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

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
  ...props
}: HTMLAttributes<HTMLElement> & { children: ReactNode }) {
  return (
    <section
      {...props}
      className={classes(
        "dc-dashboard-surface rounded-2xl border border-border/70 bg-background shadow-[0_1px_2px_rgba(0,0,0,0.03)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function DashboardMetricGrid({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={classes("grid gap-3 sm:grid-cols-2 xl:grid-cols-4", className)}>
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
        "dc-dashboard-notice rounded-xl border border-primary/15 bg-primary/[0.035] px-4 py-3 text-xs leading-5 text-muted-foreground",
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

export function DashboardStatusBadge({
  children,
  active = false,
  className = "",
}: {
  children: ReactNode;
  active?: boolean;
  className?: string;
}) {
  return (
    <span
      className={classes(
        "inline-flex min-h-7 items-center rounded-lg border px-2.5 py-1 font-[family-name:var(--font-dc-mono)] text-[8px] uppercase tracking-[0.08em]",
        active
          ? "border-primary/15 bg-primary/[0.08] text-primary"
          : "border-border/70 bg-background text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function DashboardEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={classes(
        "flex min-h-36 flex-col items-start justify-center rounded-xl border border-dashed border-border/80 bg-background px-5 py-6",
        className,
      )}
    >
      {Icon && (
        <span className="mb-3 grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
          <Icon className="h-4 w-4" strokeWidth={1.8} />
        </span>
      )}
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {description && (
        <p className="mt-1 max-w-xl text-xs leading-5 text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
'''
write('components/Dashboard/DashboardPrimitives.tsx', primitives)

# ---------------------------------------------------------------------------
# Canonical typography tokens + common surface cleanup across dashboard files
# ---------------------------------------------------------------------------
paths = [Path('app/dashboard/page.tsx'), *Path('components/Dashboard').glob('*.tsx')]
for path in paths:
    text = path.read_text()
    text = text.replace('var(--font-cinzel)', 'var(--font-dc-heading)')
    text = text.replace('var(--font-dm-mono)', 'var(--font-dc-mono)')
    text = text.replace('var(--font-fauna)', 'var(--font-dc-sans)')
    text = text.replace(
        'rounded-xl border border-border/80 bg-foreground/[0.018]',
        'rounded-2xl border border-border/70 bg-background shadow-[0_1px_2px_rgba(0,0,0,0.03)]',
    )
    text = text.replace(
        'rounded-xl border border-primary/10 bg-foreground/[0.022]',
        'rounded-2xl border border-border/70 bg-background shadow-[0_1px_2px_rgba(0,0,0,0.03)]',
    )
    text = text.replace(
        'rounded-xl border border-border/80 bg-background/80',
        'rounded-xl border border-border/70 bg-background',
    )
    text = text.replace(
        'rounded-xl border border-border/75 bg-background/80',
        'rounded-xl border border-border/70 bg-background',
    )
    text = text.replace(
        'rounded-lg border border-border/70 bg-background/80',
        'rounded-xl border border-border/70 bg-background',
    )
    path.write_text(text)

# ---------------------------------------------------------------------------
# EventScopePicker uses shared dashboard surfaces
# ---------------------------------------------------------------------------
event_scope = '''"use client";

import { CalendarDays, ChevronDown } from "lucide-react";
import { DashboardSurface } from "@/components/Dashboard/DashboardPrimitives";

export type EventScopeOption = {
  id: string;
  title: string;
  venue: string;
  eventDate: string;
  isPublished: boolean;
};

type Props = {
  events: EventScopeOption[];
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
};

export default function EventScopePicker({ events, value, onChange, disabled = false }: Props) {
  if (!events.length) {
    return (
      <DashboardSurface className="p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
            <CalendarDays className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="font-[family-name:var(--font-dc-mono)] text-[8px] uppercase tracking-[0.12em] text-primary">
              Acara aktif
            </p>
            <p className="mt-1 text-sm text-foreground">Silakan buat rangkaian acara dulu.</p>
          </div>
        </div>
      </DashboardSurface>
    );
  }

  return (
    <DashboardSurface className="p-3 sm:max-w-xl">
      <label className="block">
        <span className="mb-1.5 block font-[family-name:var(--font-dc-mono)] text-[8px] uppercase tracking-[0.12em] text-muted-foreground">
          Acara aktif
        </span>
        <span className="relative block">
          <select
            value={value}
            onChange={(event) => onChange(event.target.value)}
            disabled={disabled}
            aria-label="Pilih acara"
            className="h-11 w-full appearance-none rounded-[10px] border border-border bg-background px-3 pr-10 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed"
          >
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title.trim() || "Acara tanpa judul"}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
        </span>
      </label>
    </DashboardSurface>
  );
}
'''
write('components/Dashboard/EventScopePicker.tsx', event_scope)

# ---------------------------------------------------------------------------
# Feature gate + access notice align with Beranda surface language
# ---------------------------------------------------------------------------
access_notice = read('components/Dashboard/DashboardAccessNotice.tsx')
access_notice = access_notice.replace('font-mono', 'font-[family-name:var(--font-dc-mono)]')
access_notice = access_notice.replace('font-heading', 'font-[family-name:var(--font-dc-heading)]')
access_notice = access_notice.replace('border-t border-border pt-5', 'pt-2')
write('components/Dashboard/DashboardAccessNotice.tsx', access_notice)

feature_gate = read('components/Dashboard/FeatureGate.tsx')
if 'DashboardSurface' not in feature_gate:
    feature_gate = feature_gate.replace(
        'import DashboardAccessNotice from "@/components/Dashboard/DashboardAccessNotice";\n',
        'import DashboardAccessNotice from "@/components/Dashboard/DashboardAccessNotice";\nimport { DashboardSurface } from "@/components/Dashboard/DashboardPrimitives";\n',
    )
feature_gate = feature_gate.replace(
    '<section className="mx-auto grid w-[80vw] max-w-full min-w-0 overflow-hidden rounded-xl border border-border/80 bg-foreground/[0.018]">',
    '<DashboardSurface className="mx-auto grid w-[80vw] max-w-full min-w-0 overflow-hidden">',
)
feature_gate = feature_gate.replace('</section>\n  );\n}', '</DashboardSurface>\n  );\n}', 1)
write('components/Dashboard/FeatureGate.tsx', feature_gate)

# ---------------------------------------------------------------------------
# EventPanel: convert the event list into a readable data table and shared notice
# ---------------------------------------------------------------------------
event_panel = read('components/Dashboard/EventPanel.tsx')
if 'DashboardNotice' not in event_panel:
    event_panel = event_panel.replace(
        'import { Input } from "@/components/ui/input";\n',
        'import { Input } from "@/components/ui/input";\nimport { DashboardNotice, DashboardStatusBadge, DashboardSurface } from "@/components/Dashboard/DashboardPrimitives";\n',
    )
notice_pattern = re.compile(
    r'\{editorMode === "closed" && notice && \(\n\s*<p className="border-b border-border/70 py-3 text-xs text-muted-foreground" role="status">\n\s*\{notice\}\n\s*</p>\n\s*\)\}'
)
event_panel, count = notice_pattern.subn(
    '{editorMode === "closed" && notice && (\n        <DashboardNotice className="mt-4">{notice}</DashboardNotice>\n      )}',
    event_panel,
    count=1,
)
if count != 1:
    raise SystemExit('event panel notice pattern not found')

list_pattern = re.compile(
    r'\n\s*<div className="mt-4 divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/70 bg-background px-4 shadow-\[0_1px_2px_rgba\(0,0,0,0\.03\)\] sm:px-5">.*?\n\s*</div>\n\n\s*\{!loading && !events\.length && editorMode === "closed"',
    re.S,
)
new_list = '''

      {events.length > 0 && (
        <DashboardSurface className="mt-4 overflow-hidden">
          <div className="overflow-x-auto p-4 sm:p-5">
            <table className="w-full min-w-[760px] text-left">
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
                {events.map((event) => {
                  const draft = !event.eventConfigured;
                  const hasDesign = Boolean(event.templateKey?.trim());
                  const status = event.isPublished
                    ? "Terbit"
                    : hasDesign
                      ? "Siap"
                      : draft
                        ? "Draft"
                        : "Belum desain";
                  return (
                    <tr key={event.id} className="text-xs">
                      <td className="max-w-72 px-3 py-3.5">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {draft ? "Acara baru" : event.title || "Acara tanpa judul"}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-muted-foreground">
                        {event.eventDate ? isoDateToDisplay(event.eventDate) : "—"}
                      </td>
                      <td className="max-w-56 px-3 py-3.5 text-muted-foreground">
                        <p className="truncate">{draft ? "Belum dilengkapi" : event.venue || "—"}</p>
                      </td>
                      <td className="px-3 py-3.5">
                        <DashboardStatusBadge active={event.isPublished || hasDesign}>
                          {status}
                        </DashboardStatusBadge>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex justify-end gap-2">
                          {!event.isPublished && (
                            <>
                              <Button type="button" size="xs" onClick={() => activate(event)}>
                                <PenLine className="h-3.5 w-3.5" />
                                Edit
                              </Button>
                              <Button
                                type="button"
                                size="xs"
                                onClick={() => removeEvent(event)}
                                disabled={saving || Boolean(deletingId)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                {deletingId === event.id ? "Menghapus..." : "Hapus"}
                              </Button>
                            </>
                          )}
                          {!draft && (
                            <Button asChild size="xs">
                              <Link href={`/dashboard/editor?type=${event.type}&invitationId=${event.id}`}>
                                <PenLine className="h-3.5 w-3.5" />
                                {hasDesign ? "Undangan" : "Buat undangan"}
                              </Link>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </DashboardSurface>
      )}

      {!loading && !events.length && editorMode === "closed"'''
event_panel, count = list_pattern.subn(new_list, event_panel, count=1)
if count != 1:
    raise SystemExit('event panel list pattern not found')
write('components/Dashboard/EventPanel.tsx', event_panel)

# ---------------------------------------------------------------------------
# Invitation workspace: shared metrics/notices and published-state lock UX
# ---------------------------------------------------------------------------
invitation = read('components/Dashboard/InvitationWorkspacePanel.tsx')
if 'DashboardMetricCard' not in invitation:
    invitation = invitation.replace(
        'import { Button } from "@/components/ui/button";\n',
        'import { Button } from "@/components/ui/button";\nimport { DashboardMetricCard, DashboardNotice, DashboardStatusBadge } from "@/components/Dashboard/DashboardPrimitives";\n',
    )
old_toggle = '''  async function togglePublish(invitation: Invitation) {
    if (!invitation.eventConfigured) {
      setNotice("Lengkapi dan simpan detail acara sebelum publish.");
      return;
    }
    if (!invitation.templateKey?.trim()) {
      setNotice("Pilih dan simpan template undangan sebelum publish.");
      return;
    }

    setBusyId(invitation.id);
    setNotice("");
    try {
      const response = await fetch("/api/invitations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: invitation.id, isPublished: !invitation.isPublished }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "Status publish belum dapat diubah.");
      setInvitations((current) =>
        current.map((item) =>
          item.id === invitation.id ? data.invitation : item,
        ),
      );
      setNotice(
        data.invitation?.isPublished
          ? "Undangan berhasil diterbitkan."
          : "Undangan ditarik dari publik.",
      );
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Status publish belum dapat diubah.");
    } finally {
      setBusyId(null);
    }
  }'''
new_toggle = '''  async function publishInvitation(invitation: Invitation) {
    if (invitation.isPublished) {
      setNotice("Undangan yang sudah terbit dikunci dan tidak dapat dikembalikan menjadi draft.");
      return;
    }
    if (!invitation.eventConfigured) {
      setNotice("Lengkapi dan simpan detail acara sebelum publish.");
      return;
    }
    if (!invitation.templateKey?.trim()) {
      setNotice("Pilih dan simpan template undangan sebelum publish.");
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
      if (!response.ok) throw new Error(data?.error || "Undangan belum dapat dipublish.");
      setInvitations((current) =>
        current.map((item) =>
          item.id === invitation.id ? data.invitation : item,
        ),
      );
      setNotice("Undangan berhasil diterbitkan.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Undangan belum dapat dipublish.");
    } finally {
      setBusyId(null);
    }
  }'''
invitation = replace_once(invitation, old_toggle, new_toggle, 'invitation publish function')
invitation = invitation.replace('onClick={() => togglePublish(invitation)}', 'onClick={() => publishInvitation(invitation)}')
notice_re = re.compile(
    r'\{notice && \(\n\s*<div\n\s*className="mb-4 rounded-xl border border-primary/15 bg-primary/\[0\.035\] px-3 py-2\.5 text-xs text-muted-foreground"\n\s*role="status"\n\s*>\n\s*\{notice\}\n\s*</div>\n\s*\)\}'
)
invitation, count = notice_re.subn('{notice && <DashboardNotice className="mb-4">{notice}</DashboardNotice>}', invitation, count=1)
if count != 1:
    raise SystemExit('invitation notice pattern not found')

published_button = re.compile(
    r': invitation\.isPublished \? \(\n\s*<Button\n\s*size="sm"\n\s*className="w-full"\n\s*disabled=\{loading \|\| busyId === invitation\.id\}\n\s*onClick=\{\(\) => publishInvitation\(invitation\)\}\n\s*>\n\s*<Send className="h-4 w-4" />\n\s*\{busyId === invitation\.id \? "Menyimpan\.\.\." : "Tarik publik"\}\n\s*</Button>\n\s*\) : invitation\.accessPaid \? \('
)
invitation, count = published_button.subn(
    ': invitation.isPublished ? (\n                      <DashboardStatusBadge active className="h-9 w-full justify-center">\n                        Terbit · terkunci\n                      </DashboardStatusBadge>\n                    ) : invitation.accessPaid ? (',
    invitation,
    count=1,
)
if count != 1:
    raise SystemExit('published invitation action pattern not found')

metric_pattern = re.compile(
    r'function Metric\(\{\n  icon: Icon,\n  label,\n  value,\n\}: \{\n  icon: typeof Send;\n  label: string;\n  value: string;\n\}\) \{\n  return \(\n    <div className="flex min-w-0 items-center gap-4 rounded-2xl border border-border/70 bg-background p-4 shadow-\[0_1px_2px_rgba\(0,0,0,0\.03\)\]">.*?\n    </div>\n  \);\n\}',
    re.S,
)
invitation, count = metric_pattern.subn(
    'function Metric({ icon: Icon, label, value }: { icon: typeof Send; label: string; value: string }) {\n  return <DashboardMetricCard icon={Icon} label={label} value={value} />;\n}',
    invitation,
    count=1,
)
if count != 1:
    raise SystemExit('invitation metric helper pattern not found')
write('components/Dashboard/InvitationWorkspacePanel.tsx', invitation)

# ---------------------------------------------------------------------------
# Personal Invitation: shared metric + notice primitives
# ---------------------------------------------------------------------------
personal = read('components/Dashboard/PersonalInvitationPanel.tsx')
if 'DashboardMetricCard' not in personal:
    personal = personal.replace(
        'import { Input } from "@/components/ui/input";\n',
        'import { Input } from "@/components/ui/input";\nimport { DashboardMetricCard, DashboardNotice } from "@/components/Dashboard/DashboardPrimitives";\n',
    )
personal_notice = re.compile(
    r'\{notice && \(\n\s*<div\n\s*className="mt-4 rounded-xl border border-primary/15 bg-primary/\[0\.035\] px-3 py-2\.5 text-xs text-muted-foreground"\n\s*role="status"\n\s*>\n\s*\{notice\}\n\s*</div>\n\s*\)\}'
)
personal, count = personal_notice.subn('{notice && <DashboardNotice className="mt-4">{notice}</DashboardNotice>}', personal, count=1)
if count != 1:
    raise SystemExit('personal notice pattern not found')
# Replace local Metric helper at end if present.
personal = re.sub(
    r'function Metric\(\{ label, value \}: \{ label: string; value: string \}\) \{.*?\n\}',
    'function Metric({ label, value }: { label: string; value: string }) {\n  return <DashboardMetricCard label={label} value={value} />;\n}',
    personal,
    count=1,
    flags=re.S,
)
write('components/Dashboard/PersonalInvitationPanel.tsx', personal)

# ---------------------------------------------------------------------------
# WA Blast: shared metric + notice primitives
# ---------------------------------------------------------------------------
wa = read('components/Dashboard/WhatsAppBlastPanel.tsx')
if 'DashboardMetricCard' not in wa:
    wa = wa.replace(
        'import { Input } from "@/components/ui/input";\n',
        'import { Input } from "@/components/ui/input";\nimport { DashboardMetricCard, DashboardNotice } from "@/components/Dashboard/DashboardPrimitives";\n',
    )
wa_notice = re.compile(
    r'\{notice && \(\n\s*<div\n\s*className="mb-4 rounded-xl border border-primary/15 bg-primary/\[0\.035\] px-3 py-2\.5 text-xs text-muted-foreground"\n\s*role="status"\n\s*>\n\s*\{notice\}\n\s*</div>\n\s*\)\}'
)
wa, count = wa_notice.subn('{notice && <DashboardNotice className="mb-4">{notice}</DashboardNotice>}', wa, count=1)
if count != 1:
    raise SystemExit('wa notice pattern not found')
wa = re.sub(
    r'function Metric\(\{\n  icon: Icon,\n  label,\n  value,\n\}: \{\n  icon: typeof MessageCircle;\n  label: string;\n  value: string;\n\}\) \{.*?\n\}',
    'function Metric({ icon: Icon, label, value }: { icon: typeof MessageCircle; label: string; value: string }) {\n  return <DashboardMetricCard icon={Icon} label={label} value={value} />;\n}',
    wa,
    count=1,
    flags=re.S,
)
write('components/Dashboard/WhatsAppBlastPanel.tsx', wa)

# ---------------------------------------------------------------------------
# RSVP: shared metric + notice primitives
# ---------------------------------------------------------------------------
rsvp = read('components/Dashboard/RsvpAnalyticsPanel.tsx')
if 'DashboardMetricCard' not in rsvp:
    rsvp = rsvp.replace(
        'import { Input } from "@/components/ui/input";\n',
        'import { Input } from "@/components/ui/input";\nimport { DashboardMetricCard, DashboardNotice } from "@/components/Dashboard/DashboardPrimitives";\n',
    )
rsvp_notice = re.compile(
    r'\{notice && \(\n\s*<div\n\s*className="mb-4 flex min-w-0 items-center gap-2 rounded-xl border border-primary/15 bg-primary/\[0\.035\] px-3 py-2\.5 text-xs text-muted-foreground"\n\s*role="status"\n\s*>\n\s*<CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />\n\s*<span>\{notice\}</span>\n\s*</div>\n\s*\)\}'
)
rsvp, count = rsvp_notice.subn(
    '{notice && (\n        <DashboardNotice className="mb-4 flex items-center gap-2">\n          <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />\n          <span>{notice}</span>\n        </DashboardNotice>\n      )}',
    rsvp,
    count=1,
)
if count != 1:
    raise SystemExit('rsvp notice pattern not found')
metrics_block = re.compile(
    r'<section className="grid min-w-0 gap-2 sm:grid-cols-2 xl:grid-cols-4">\n\s*\{metrics\.map\(\(\{ label, value, icon: Icon \}\) => \(\n\s*<article.*?\n\s*</article>\n\s*\)\)\}\n\s*</section>',
    re.S,
)
rsvp, count = metrics_block.subn(
    '<section className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4">\n        {metrics.map(({ label, value, icon: Icon }) => (\n          <DashboardMetricCard key={label} icon={Icon} label={label} value={String(value)} />\n        ))}\n      </section>',
    rsvp,
    count=1,
)
if count != 1:
    raise SystemExit('rsvp metrics pattern not found')
write('components/Dashboard/RsvpAnalyticsPanel.tsx', rsvp)

# ---------------------------------------------------------------------------
# Additional dashboard class cleanup and semantic token use
# ---------------------------------------------------------------------------
for path in [Path('app/dashboard/page.tsx'), *Path('components/Dashboard').glob('*.tsx')]:
    text = path.read_text()
    text = text.replace('bg-background/80', 'bg-background')
    text = text.replace('bg-background/70', 'bg-background')
    text = text.replace('bg-background/65', 'bg-background')
    path.write_text(text)

# ---------------------------------------------------------------------------
# Documentation governance: explicit user-requested supplemental file exception
# ---------------------------------------------------------------------------
prd = read('prd.md')
needle = '- jangan membuat `PRD-TAMBAHAN.md`, `PRD2.md`, `PRD3.md`, dst. selama `prd1.md` masih dapat digunakan;'
if needle in prd and 'supplemental non-canonical delta log' not in prd:
    prd = prd.replace(
        needle,
        needle + '\n- exception: jika user secara eksplisit meminta `prd-tambahan.md`, file tersebut boleh dipakai sebagai **supplemental non-canonical delta log**; requirement aktif tetap harus dicerminkan ke `prd.md` dan histori implementasi material tetap dicatat di `prd1.md`;',
    )
write('prd.md', prd)

agents = read('AGENTS.md')
agent_needle = 'Do not create `PRD-TAMBAHAN.md`, `PRD2.md`, `PRD3.md`, or other split PRD files unless the user explicitly changes the documentation governance defined in `prd.md`.'
if agent_needle in agents and 'supplemental non-canonical delta log' not in agents:
    agents = agents.replace(
        agent_needle,
        agent_needle + '\n\nWhen the user explicitly requests `prd-tambahan.md`, it may exist only as a **supplemental non-canonical delta log**. Mirror active requirements to `prd.md`, keep implementation history in `prd1.md`, and never let the supplemental file override either canonical document.',
    )
write('AGENTS.md', agents)

readme = read('README.md')
if '## Documentation Governance' not in readme:
    readme += '''\n\n## Documentation Governance\n\n- `prd.md` remains the active product-requirement source of truth.\n- `prd1.md` remains the chronological implementation changelog.\n- `AGENTS.md` contains mandatory engineering/design rules for agent-made changes.\n- When explicitly requested by the user, `prd-tambahan.md` may be maintained as a supplemental non-canonical delta log; it must not override `prd.md` or replace the required `prd1.md` implementation entry.\n'''
write('README.md', readme)

supplemental = '''# PRD Tambahan — Dashboard Visual Consistency Phase 2\n\n**Date:** 17 September 2026  \n**Status:** User-requested supplemental non-canonical delta log. Active product requirements remain in `prd.md`; implementation history remains in `prd1.md`.\n\n## Requirement delta\n\n- Brand DC Organizer tetap locked; wordmark tidak boleh diinterpretasi ulang per halaman.\n- Dashboard tidak menampilkan marketing tagline pada header.\n- Seluruh tab dan component dashboard mengikuti visual language Beranda: neutral white/near-black surfaces, Rose `#C07A84` sebagai accent, subtle border/shadow, canonical font tokens, icon Lucide, dan hierarchy tabel/card yang konsisten.\n- Rangkaian Acara boleh memakai table-oriented layout agar lebih data-oriented dan mudah discan.\n- Table/graph hanya memakai data nyata atau derived data dari aplikasi; tidak ada filler/mock metric.\n- Shared dashboard presentation harus memakai/extend `components/Dashboard/DashboardPrimitives.tsx` agar styling tidak kembali belang antar-page.\n- Setelah Undangan/Rangkaian Acara berstatus published, dashboard tidak boleh menawarkan action unpublish/tarik publik yang bertentangan dengan published lock.\n\n## Implementation pada phase ini\n\n- canonical typography token dibersihkan ke `--font-dc-heading`, `--font-dc-sans`, dan `--font-dc-mono` pada dashboard workspace;\n- shared primitives diperluas untuk page, surface, metric, notice, section header, status badge, dan empty state;\n- Rangkaian Acara diubah menjadi data table dengan tanggal, lokasi, status, dan actions;\n- Undangan, Personal Invitation, WA Blast, RSVP, event scope, feature gate, dan seating-related surfaces diseragamkan ke surface hierarchy Beranda;\n- Undangan yang sudah published menampilkan status terkunci dan tidak lagi menawarkan `Tarik publik`;\n- `prd.md`, `AGENTS.md`, dan `README.md` mencatat exception dokumentasi ini sebagai supplemental non-canonical log.\n\n## Validation\n\nBuild workflow: __VALIDATION__\nDatabase migration: N/A.\n'''
write('prd-tambahan.md', supplemental)

prd1 = read('prd1.md')
entry = '''\n\n---\n\n## 2026-09-17 — Dashboard Visual Consistency Phase 2\n\n### Requirement / Intent\nMelanjutkan redesign seluruh customer dashboard agar semua tab/component mengikuti visual language Beranda, mengunci typography/brand token agar tidak berubah antar-page, dan mencatat delta pekerjaan ke `prd-tambahan.md` atas permintaan eksplisit user.\n\n### Implementation\n- memperluas `DashboardPrimitives.tsx` menjadi shared page/surface/metric/notice/section-header/status/empty-state system;\n- menormalkan font dashboard ke canonical `--font-dc-heading`, `--font-dc-sans`, dan `--font-dc-mono`;\n- merapikan surface hierarchy di Rangkaian Acara, Undangan, Personal Invitation, WA Blast, RSVP, Event Scope, Feature Gate, Seating, dan reusable dashboard component;\n- mengubah daftar Rangkaian Acara menjadi data table agar lebih mudah dipindai;\n- menghapus action `Tarik publik` dari Undangan yang sudah published dan menggantinya dengan status locked, konsisten dengan immutable published-event rule;\n- membuat `prd-tambahan.md` kembali hanya karena user meminta secara eksplisit, dengan status supplemental non-canonical;\n- menyinkronkan governance exception ke `prd.md`, `AGENTS.md`, dan `README.md`.\n\n### Affected Files\n- `app/dashboard/page.tsx`\n- `components/Dashboard/DashboardPrimitives.tsx`\n- `components/Dashboard/DashboardAccessNotice.tsx`\n- `components/Dashboard/EventScopePicker.tsx`\n- `components/Dashboard/EventPanel.tsx`\n- `components/Dashboard/InvitationWorkspacePanel.tsx`\n- `components/Dashboard/PersonalInvitationPanel.tsx`\n- `components/Dashboard/WhatsAppBlastPanel.tsx`\n- `components/Dashboard/RsvpAnalyticsPanel.tsx`\n- `components/Dashboard/SeatingChart.tsx`\n- `components/Dashboard/FeatureGate.tsx`\n- `prd.md`\n- `AGENTS.md`\n- `README.md`\n- `prd-tambahan.md`\n- `prd1.md`\n\n### Validation\n- Build workflow: __VALIDATION__\n- Prisma Client generation: __VALIDATION__\n- TypeScript / Next production build: __VALIDATION__\n- Database migration: N/A.\n'''
if '## 2026-09-17 — Dashboard Visual Consistency Phase 2' not in prd1:
    prd1 += entry
write('prd1.md', prd1)
