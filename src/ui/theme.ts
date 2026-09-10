/**
 * Überträgt die Nutzer-Auswahl als Data-Attribute auf das <html>-Element.
 * Die konkreten Farben/Spalten setzt daraufhin das CSS.
 */

import type { GameSettings } from "../types";

/** Setzt `data-theme` und `data-player` auf dem Wurzelelement. */
export function applySettings(settings: GameSettings): void {
  const root: HTMLElement = document.documentElement;
  root.dataset.theme = settings.theme;
  root.dataset.player = settings.playerColor;
}
