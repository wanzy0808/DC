type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div className={`${centered ? "mx-auto text-center" : "text-left"} max-w-3xl space-y-3`}>
      <p className="text-xs font-mono font-semibold uppercase tracking-[0.24em] text-[var(--primary)]">
        [ {eyebrow} ]
      </p>
      <h2 className="font-[family-name:var(--font-dc-heading)] text-3xl leading-tight md:text-4xl lg:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="text-sm leading-7 text-[var(--muted-foreground)] md:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}
