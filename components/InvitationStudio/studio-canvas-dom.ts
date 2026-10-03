import { studioObjectSections, type StudioObjectSection } from "@/lib/templates/asset-layers";

/** Resolve a drag destination inside the current viewport, including duplicated sections. */
export function findSectionAt(x: number, y: number, root: HTMLElement): { section: StudioObjectSection; instanceId: string; rect: DOMRect } | null {
  const invitation = root.closest(".undara-studio-preview-surface, .dc-studio-preview-surface");
  if (!invitation) return null;
  for (const node of invitation.querySelectorAll<HTMLElement>("[data-invitation-section]")) {
    if (!studioObjectSections.includes(node.dataset.invitationSection as StudioObjectSection)) continue;
    const rect = node.getBoundingClientRect();
    if (rect.width && rect.height && x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
      const instanceId = node.closest<HTMLElement>("[data-section-instance-id]")?.dataset.sectionInstanceId
        || node.dataset.invitationSection as StudioObjectSection;
      return { section: node.dataset.invitationSection as StudioObjectSection, instanceId, rect };
    }
  }
  return null;
}
