/**
 * Laden und Speichern der Bestleistungen je Spielfeldgröße (localStorage).
 * Kennt kein Spiel-DOM, nur den Browser-Speicher.
 */

import { BOARD_SIZES, RECORDS_STORAGE_KEY } from "../config/settings";
import type { BoardSize, RecordEntry } from "../types";

/** Rekorde je Spielfeldgröße; noch nicht gespielte Größen fehlen als Schlüssel. */
export type RecordsByBoardSize = Partial<Record<BoardSize, RecordEntry>>;

/** Prüft, ob `value` eine gültige `RecordEntry` ist. */
function isValidEntry(value: unknown): value is RecordEntry {
  const candidate: Partial<RecordEntry> = (value ?? {}) as Partial<RecordEntry>;
  return (
    typeof candidate.moves === "number" &&
    typeof candidate.timeMs === "number" &&
    typeof candidate.date === "string"
  );
}

/** Baut aus unbekannten Rohdaten gültige Rekorde (ungültige Einträge entfallen). */
function normalize(raw: Partial<Record<string, unknown>>): RecordsByBoardSize {
  const result: RecordsByBoardSize = {};
  for (const size of Object.keys(BOARD_SIZES) as BoardSize[]) {
    if (isValidEntry(raw[size])) {
      result[size] = raw[size] as RecordEntry;
    }
  }
  return result;
}

/** Liest die gespeicherten Rekorde; bei Fehler/Unbekanntem bleibt die Liste leer. */
export function loadRecords(): RecordsByBoardSize {
  try {
    const stored: string | null = localStorage.getItem(RECORDS_STORAGE_KEY);
    if (stored === null) {
      return {};
    }
    return normalize(JSON.parse(stored) as Record<string, unknown>);
  } catch {
    return {};
  }
}

/** Speichert die Rekorde; Fehler (z. B. privater Modus) werden ignoriert. */
function saveRecords(records: RecordsByBoardSize): void {
  try {
    localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Persistenz ist optional – ohne Speicher läuft das Spiel trotzdem.
  }
}

/** Ob `candidate` besser ist als `current` (weniger Züge, bei Gleichstand kürzere Zeit). */
function isBetter(candidate: RecordEntry, current: RecordEntry | undefined): boolean {
  if (current === undefined) {
    return true;
  }
  return candidate.moves !== current.moves
    ? candidate.moves < current.moves
    : candidate.timeMs < current.timeMs;
}

/**
 * Speichert ein Ergebnis als neuen Rekord, falls es den bisherigen schlägt.
 * Gibt zurück, ob ein neuer Rekord gesetzt wurde.
 */
export function recordResult(boardSize: BoardSize, moves: number, timeMs: number): boolean {
  const records: RecordsByBoardSize = loadRecords();
  const candidate: RecordEntry = { moves, timeMs, date: new Date().toISOString() };
  if (!isBetter(candidate, records[boardSize])) {
    return false;
  }
  saveRecords({ ...records, [boardSize]: candidate });
  return true;
}
