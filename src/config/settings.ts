/**
 * Zentrale Konfigurationswerte des Spiels.
 * Keine Magic Numbers im übrigen Code – alles hier benennen.
 */

import type {
  BoardSize,
  CardSymbol,
  GameSettings,
  PlayerColor,
  ThemeId,
} from "../types";

/** ID des DOM-Containers, in den das Spielbrett gerendert wird. */
export const CONTAINER_ID: string = "game-board";

/** ID des DOM-Containers, in den das Einstellungsformular gerendert wird. */
export const SETTINGS_CONTAINER_ID: string = "settings-form";

/** ID des DOM-Containers, in den der End-Screen gerendert wird. */
export const END_CONTAINER_ID: string = "game-end";

/** ID des Buttons auf der Startseite, der zu den Einstellungen führt. */
export const PLAY_BUTTON_ID: string = "play-button";

/** ID des Buttons, der aus den Einstellungen ins Spiel wechselt. */
export const START_GAME_BUTTON_ID: string = "start-game-button";

/** ID des Buttons, der das laufende Spiel verlässt. */
export const EXIT_GAME_BUTTON_ID: string = "exit-game-button";

/** ID des Buttons auf dem End-Screen zurück zur Startseite. */
export const BACK_TO_START_BUTTON_ID: string = "back-to-start-button";

/** IDs der `.page`-Sektionen in der gewünschten Reihenfolge. */
export const START_PAGE_ID: string = "page-start";
export const SETTINGS_PAGE_ID: string = "page-settings";
export const GAME_PAGE_ID: string = "page-game";
export const END_PAGE_ID: string = "page-end";

/**
 * Verfügbare Kartensymbole (je eines pro Paar), genug für 6x6 (18 Paare).
 * Jeder Wert ist der Dateiname (ohne Endung) des Kartenbilds im jeweiligen
 * Theme-Verzeichnis (siehe {@link THEME_IMAGE_DIRS}).
 */
export const CARD_SYMBOLS: readonly CardSymbol[] = Array.from(
  { length: 18 },
  (_unused: unknown, index: number): CardSymbol => `front${index + 1}`,
);

/** Basispfad der Kartenbilder unterhalb von `public/`. */
export const CARD_IMAGE_BASE_PATH: string = "/assets/img/front";

/** Basispfad der End-Screen-Bilder unterhalb von `public/`. */
export const GAME_END_IMAGE_BASE_PATH: string = "/assets/img/game_end";

/** Basispfad der Kategorie-Icons im Einstellungsformular unterhalb von `public/`. */
export const SETTINGS_ICON_BASE_PATH: string = "/assets/img/settings";

/** Ordnername der Kartenbilder je Theme-Variante. */
export const THEME_IMAGE_DIRS: Record<ThemeId, string> = {
  v1: "code_vibes_theme",
  v2: "games_theme_cards",
  v3: "da_projects_theme",
  v4: "food_theme",
};

/** Sieg-Bild eines Themes: `player_<farbe>.svg` oder ein fester Pokal. */
export type WinFigure = "player" | "trophy";

/**
 * Bausteine des Sieg-Screens je Theme – nicht jedes Theme hat ein Confetti-
 * Bild, und `games_theme_cards` hat statt Spielerbildern nur einen Pokal.
 */
export const THEME_WIN_ASSETS: Record<
  ThemeId,
  { readonly confetti: boolean; readonly figure: WinFigure }
> = {
  v1: { confetti: true, figure: "player" },
  v2: { confetti: false, figure: "trophy" },
  v3: { confetti: false, figure: "player" },
  v4: { confetti: false, figure: "player" },
};

/** Eigenschaften je Spielfeldgröße: Paaranzahl und Rasterspalten. */
export const BOARD_SIZES: Record<
  BoardSize,
  { readonly pairs: number; readonly columns: number }
> = {
  "4x4": { pairs: 8, columns: 4 },
  "4x6": { pairs: 12, columns: 6 },
  "6x6": { pairs: 18, columns: 6 },
};

/** Hex-Wert je wählbarer Spielerfarbe. */
export const PLAYER_COLORS: Record<PlayerColor, string> = {
  orange: "#f58e39",
  blue: "#2bb1ff",
};

/** Farbe des jeweils anderen Spielers (Spieler 2 erhält die freie Farbe). */
export function otherPlayerColor(color: PlayerColor): PlayerColor {
  return color === "orange" ? "blue" : "orange";
}

/** Alle wählbaren Theme-Varianten. */
export const THEME_IDS: readonly ThemeId[] = ["v1", "v2", "v3", "v4"];

/** Standard-Auswahl, falls nichts gespeichert oder Gespeichertes ungültig ist. */
export const DEFAULT_SETTINGS: GameSettings = {
  playerColor: "orange",
  boardSize: "4x4",
  theme: "v1",
};

/** localStorage-Schlüssel für die persistierte Auswahl. */
export const SETTINGS_STORAGE_KEY: string = "memory:settings";

/** Verzögerung (ms), bevor ein nicht passendes Paar wieder zugedeckt wird. */
export const FLIP_BACK_DELAY_MS: number = 900;

/** Anzahl Karten, aus denen ein Paar besteht. */
export const CARDS_PER_PAIR: number = 2;
