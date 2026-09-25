"use client";

import { useEffect, useState } from "react";
import { invitationTemplates, type InvitationTemplate } from "@/lib/templates/catalog";

export type CatalogTemplate = Omit<InvitationTemplate, "preset" | "previewType"> & {
  preset?: InvitationTemplate["preset"];
  previewType: InvitationTemplate["previewType"] | "image";
  source: "built-in" | "designer";
  ready: boolean;
  designKey?: string;
  musicUrl?: string | null;
};

const localCatalog: CatalogTemplate[] = invitationTemplates.map((item) => ({
  ...item,
  source: "built-in",
  ready: true,
}));

/** The same live catalog powers public galleries and the authenticated Studio. */
export function useTemplateCatalog() {
  const [templates, setTemplates] = useState<CatalogTemplate[]>(localCatalog);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/templates", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Katalog belum bisa dimuat.");
        return response.json() as Promise<{ templates: CatalogTemplate[] }>;
      })
      .then((data) => {
        if (!controller.signal.aborted && Array.isArray(data.templates)) {
          setTemplates(data.templates);
        }
      })
      .catch(() => {
        // Local ready-to-render registry remains available if the API is offline.
      });
    return () => controller.abort();
  }, []);

  return templates;
}
