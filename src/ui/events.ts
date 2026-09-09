/**
 * Verknüpft DOM-Ereignisse mit Spielaktionen.
 */

import type { CardId } from "../types";

/** Callback, das die ID einer angeklickten Karte erhält. */
export type CardClickListener = (id: CardId) => void;

/**
 * Liest die Karten-ID aus einem angeklickten Element (Event-Delegation).
 */
function readCardId(target: EventTarget | null): CardId | undefined {
  if (!(target instanceof HTMLElement)) {
    return undefined;
  }

  const card: HTMLElement | null = target.closest(".card");
  const raw: string | undefined = card?.dataset.cardId;
  return raw === undefined ? undefined : Number(raw);
}

/**
 * Registriert einen delegierten Klick-Handler für alle Karten im Container.
 */
export function bindBoardEvents(
  root: HTMLElement,
  onCardClick: CardClickListener,
): void {
  root.addEventListener("click", (event: MouseEvent): void => {
    const id: CardId | undefined = readCardId(event.target);
    if (id !== undefined) {
      onCardClick(id);
    }
  });
}
