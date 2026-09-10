/**
 * Kleine DOM-Hilfsfunktionen.
 */

/**
 * Liefert das Element mit der ID oder wirft, wenn es nicht existiert.
 */
export function requireElement(id: string): HTMLElement {
  const element: HTMLElement | null = document.getElementById(id);

  if (element === null) {
    throw new Error(`Element mit ID "${id}" wurde nicht gefunden.`);
  }

  return element;
}

/**
 * Liefert den `<dialog>` mit der ID oder wirft, wenn er fehlt oder kein Dialog ist.
 */
export function requireDialog(id: string): HTMLDialogElement {
  const element: HTMLElement = requireElement(id);

  if (!(element instanceof HTMLDialogElement)) {
    throw new Error(`Element mit ID "${id}" ist kein <dialog>.`);
  }

  return element;
}
