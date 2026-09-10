/**
 * Einfache Seiten-Navigation: blendet `.page`-Sektionen ein und aus.
 */

import { requireElement } from "./dom";

/**
 * Zeigt die Sektion mit der angegebenen ID, versteckt alle anderen `.page`
 * und setzt den Fokus auf die neue Sektion (Tastatur-/Screenreader-Nutzung).
 */
export function showPage(id: string): void {
  const pages: NodeListOf<HTMLElement> = document.querySelectorAll(".page");
  pages.forEach((page: HTMLElement): void => {
    page.hidden = page.id !== id;
  });
  document.getElementById(id)?.focus();
}

/**
 * Verknüpft einen Button so, dass ein Klick zur Zielseite wechselt.
 */
export function bindNavButton(buttonId: string, targetPageId: string): void {
  const button: HTMLElement = requireElement(buttonId);
  button.addEventListener("click", (): void => {
    showPage(targetPageId);
  });
}
