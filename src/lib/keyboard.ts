/**
 * True when a keydown should be left alone by single-key study shortcuts:
 * the user is typing in a field or holding a modifier for a browser/OS shortcut.
 */
export function shouldIgnoreShortcut(event: KeyboardEvent): boolean {
  if (event.metaKey || event.ctrlKey || event.altKey) return true;
  const target = event.target;
  if (!(target instanceof HTMLElement)) return false;
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    target.isContentEditable
  );
}

/** True when Enter/Space would already activate a focused control. */
export function isActivatableTarget(event: KeyboardEvent): boolean {
  const target = event.target;
  return target instanceof HTMLElement && Boolean(target.closest("button, a, [role='button'], [role='tab']"));
}
