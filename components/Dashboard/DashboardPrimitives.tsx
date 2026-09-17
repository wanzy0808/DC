import type { HTMLAttributes, ReactNode } from "react";
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
