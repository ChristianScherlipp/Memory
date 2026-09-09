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
