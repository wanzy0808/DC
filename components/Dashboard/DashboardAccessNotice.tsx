import type { ReactNode } from "react";
import { LockKeyhole } from "lucide-react";

type DashboardAccessNoticeProps = {
  title: string;
  description: string;
  label?: string;
  heading?: "h1" | "h2" | "h3";
  children?: ReactNode;
};

/** Shared presentation only; access decisions remain with each caller and API. */
export default function DashboardAccessNotice({
  title,
  description,
  label = "Akses paket",
  heading: Heading = "h2",
  children,
}: DashboardAccessNoticeProps) {
  return (
    <div className="min-w-0 space-y-5 text-foreground">
      <div className="flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-[10px] border border-border text-primary">
          <LockKeyhole className="size-5" aria-hidden="true" />
        </span>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </p>
      </div>
      <div className="space-y-3">
        <Heading className="break-words font-heading text-2xl leading-tight text-primary sm:text-3xl">
          {title}
        </Heading>
        <p className="max-w-xl text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
      {children && <div className="border-t border-border pt-5">{children}</div>}
    </div>
  );
}
