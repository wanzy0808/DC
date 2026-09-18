import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

function classes(...values: Array<string | false | null | undefined>) {
  return cn(...values);
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
        "dc-dashboard-metric flex min-w-0 items-center gap-4 rounded-2xl border border-border/70 bg-background p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]",
        className,
      )}
    >
      {Icon && (
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </span>
      )}
      <div className="min-w-0">
        <p className="text-[13px] leading-5 text-muted-foreground">{label}</p>
        <div className="mt-1 break-words text-2xl font-semibold leading-none text-foreground">{value}</div>
      </div>
    </article>
  );
}

export function DashboardCompactStat({
  label,
  value,
  className = "",
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={classes(
        "min-w-0 rounded-xl border border-border/70 bg-foreground/[0.018] px-3.5 py-3",
        className,
      )}
    >
      <p className="font-[family-name:var(--font-dc-mono)] text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </p>
      <div className="mt-1.5 break-words text-base font-semibold text-foreground">{value}</div>
    </div>
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
        "dc-dashboard-notice rounded-xl border border-primary/15 bg-primary/[0.035] px-4 py-3.5 text-sm leading-6 text-muted-foreground",
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
          <p className="font-[family-name:var(--font-dc-mono)] text-xs uppercase tracking-[0.14em] text-primary">
            {eyebrow}
          </p>
        )}
        <h2 className="mt-1.5 font-[family-name:var(--font-dc-heading)] text-xl font-semibold leading-tight text-foreground sm:text-2xl">
          {title}
        </h2>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
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
        "inline-flex min-h-8 items-center rounded-lg border px-2.5 py-1 font-[family-name:var(--font-dc-mono)] text-[11px] uppercase tracking-[0.08em]",
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
        "flex min-h-40 flex-col items-start justify-center rounded-xl border border-dashed border-border/80 bg-background px-5 py-7",
        className,
      )}
    >
      {Icon && (
        <span className="mb-3 grid size-11 place-items-center rounded-full bg-primary/10 text-primary">
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </span>
      )}
      <p className="text-base font-semibold text-foreground">{title}</p>
      {description && (
        <p className="mt-1.5 max-w-xl text-sm leading-6 text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** The Beranda introduction, shared by every operational workspace. */
export function DashboardPageHeader({ eyebrow, title, description, actions, children }: {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <DashboardSurface className="mb-4 overflow-hidden">
      <div className="border-l-4 border-primary px-5 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            {eyebrow && <p className="font-[family-name:var(--font-dc-mono)] text-xs uppercase tracking-[0.14em] text-primary">{eyebrow}</p>}
            <h1 className="mt-2 break-words font-[family-name:var(--font-dc-heading)] text-2xl font-semibold leading-tight text-foreground sm:text-3xl">{title}</h1>
            {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>}
        </div>
        {children && <div className="mt-5 border-t border-border/70 pt-4">{children}</div>}
      </div>
    </DashboardSurface>
  );
}

/** Beranda's card hierarchy: separated heading, roomy body, neutral surface. */
export function DashboardPanel({ children, className, ...header }: Parameters<typeof DashboardSectionHeader>[0] & {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <DashboardSurface className={classes("dc-dashboard-panel min-w-0 overflow-hidden", className)}>
      <div className="border-b border-border/70 px-5 py-4 sm:px-6">
        <DashboardSectionHeader {...header} />
      </div>
      {children && <div className="min-w-0 space-y-4 p-5 sm:p-6">{children}</div>}
    </DashboardSurface>
  );
}
