const FOREST_MASK = "linear-gradient(to bottom, transparent 0%, black 20%, black 79%, transparent 100%)";

/** Quiet forest backdrop shared by framed marketing pages, excluding the landing. */
export default function EventPlannerBotanicalAtmosphere() {
  return (
    <div aria-hidden="true" data-undara-marketing-atmosphere className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div
        className="absolute inset-0 bg-[url('/assets/marketing/atmosphere/forest-light.webp')] bg-cover bg-center opacity-[0.55] dark:hidden"
        style={{ WebkitMaskImage: FOREST_MASK, maskImage: FOREST_MASK }}
      />
      <div
        className="absolute inset-0 hidden bg-[url('/assets/marketing/atmosphere/forest-dark.webp')] bg-cover bg-center opacity-[0.42] dark:block"
        style={{ WebkitMaskImage: FOREST_MASK, maskImage: FOREST_MASK }}
      />
    </div>
  );
}
