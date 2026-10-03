const TEXT_INPUT_SELECTOR = 'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"]';

export function isStudioCanvasShortcutTarget(canvas: HTMLElement | null, target: Element | null) {
  return Boolean(canvas && target && canvas.contains(target) && !target.closest(TEXT_INPUT_SELECTOR));
}

type HistoryShortcutEvent = Pick<KeyboardEvent,
  "key" | "ctrlKey" | "metaKey" | "altKey" | "shiftKey" | "isComposing" | "defaultPrevented"
>;

export function resolveStudioHistoryShortcut(event: HistoryShortcutEvent): "undo" | "redo" | null {
  if (event.defaultPrevented || event.isComposing || event.altKey) return null;
  const key = event.key.toLowerCase();
  if ((event.ctrlKey || event.metaKey) && key === "z") return event.shiftKey ? "redo" : "undo";
  if (event.ctrlKey && !event.metaKey && !event.shiftKey && key === "y") return "redo";
  return null;
}
