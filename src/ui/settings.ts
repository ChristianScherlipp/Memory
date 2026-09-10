/**
 * Erzeugt das Auswahl-Formular (Spielerfarbe, Spielfeldgröße, Theme)
 * und verknüpft dessen Klicks mit dem Spielzustand. Event-Delegation.
 */

import {
  BOARD_SIZES,
  PLAYER_COLORS,
  START_GAME_BUTTON_ID,
  THEME_IDS,
} from "../config/settings";
import type { BoardSize, GameSettings, PlayerColor, ThemeId } from "../types";

/** Eine wählbare Option innerhalb einer Gruppe. */
interface Option {
  value: string;
  label: string;
}

/** Name einer Auswahl-Gruppe – entspricht einem Feld von `GameSettings`. */
type SettingsGroup = keyof GameSettings;

/** Eine im Formular angeklickte Auswahl (Rohwert aus dem DOM). */
interface Choice {
  group: SettingsGroup;
  value: string;
}

const PLAYER_LABELS: Record<PlayerColor, string> = {
  orange: "Orange",
  blue: "Blue",
};

const SIZE_LABELS: Record<BoardSize, string> = {
  "4x4": "4 × 4",
  "4x6": "4 × 6",
  "6x6": "6 × 6",
};

/** Optionen je Gruppe, aus der Konfiguration abgeleitet. */
const GROUPS: ReadonlyArray<{
  group: SettingsGroup;
  legend: string;
  options: readonly Option[];
}> = [
  {
    group: "playerColor",
    legend: "Player colour",
    options: Object.keys(PLAYER_COLORS).map((value: string): Option => ({
      value,
      label: PLAYER_LABELS[value as PlayerColor],
    })),
  },
  {
    group: "boardSize",
    legend: "Board size",
    options: Object.keys(BOARD_SIZES).map((value: string): Option => ({
      value,
      label: SIZE_LABELS[value as BoardSize],
    })),
  },
  {
    group: "theme",
    legend: "Theme",
    options: THEME_IDS.map((value: ThemeId, index: number): Option => ({
      value,
      label: `Variant ${index + 1}`,
    })),
  },
];

/** Markup einer einzelnen Options-Schaltfläche. */
function renderOption(group: SettingsGroup, option: Option, active: boolean): string {
  const activeClass: string = active ? " option--active" : "";
  const swatch: string =
    group === "playerColor"
      ? `<span class="option__swatch" data-color="${option.value}"></span>`
      : "";
  return `
    <button class="option${activeClass}" type="button"
            data-group="${group}" data-value="${option.value}"
            aria-pressed="${active}">
      ${swatch}${option.label}
    </button>
  `;
}

/** Markup einer Auswahl-Gruppe (eine Zeile mit Optionen). */
function renderGroup(
  group: SettingsGroup,
  legend: string,
  options: readonly Option[],
  current: GameSettings,
): string {
  const buttons: string = options
    .map((option: Option): string =>
      renderOption(group, option, current[group] === option.value),
    )
    .join("");
  return `
    <fieldset class="settings__group">
      <legend class="settings__legend">${legend}</legend>
      <div class="settings__options">${buttons}</div>
    </fieldset>
  `;
}

/** Vollständiges Markup des Einstellungsformulars. */
export function renderSettings(current: GameSettings): string {
  const groups: string = GROUPS.map((entry): string =>
    renderGroup(entry.group, entry.legend, entry.options, current),
  ).join("");
  return `
    <form class="settings">
      ${groups}
      <button class="button" type="button" id="${START_GAME_BUTTON_ID}">
        Start game
      </button>
    </form>
  `;
}

/** Liest Gruppe und Wert aus einer angeklickten Option. */
function readChoice(target: EventTarget | null): Choice | undefined {
  if (!(target instanceof HTMLElement)) {
    return undefined;
  }
  const button: HTMLElement | null = target.closest(".option");
  const group: string | undefined = button?.dataset.group;
  const value: string | undefined = button?.dataset.value;
  if (group === undefined || value === undefined) {
    return undefined;
  }
  return { group: group as SettingsGroup, value };
}

/** Kopiert `current` und ersetzt den Wert einer Gruppe (Rohwert aus dem DOM). */
function withChoice(
  current: GameSettings,
  group: SettingsGroup,
  value: string,
): GameSettings {
  switch (group) {
    case "playerColor":
      return { ...current, playerColor: value as PlayerColor };
    case "boardSize":
      return { ...current, boardSize: value as BoardSize };
    case "theme":
      return { ...current, theme: value as ThemeId };
  }
}

/**
 * Registriert einen delegierten Klick-Handler auf dem Formular-Container.
 * `onChange` erhält die neue Auswahl, `onStart` startet das Spiel.
 */
export function bindSettingsEvents(
  root: HTMLElement,
  getCurrent: () => GameSettings,
  onChange: (next: GameSettings) => void,
  onStart: () => void,
): void {
  root.addEventListener("click", (event: MouseEvent): void => {
    const target: EventTarget | null = event.target;
    if (target instanceof HTMLElement && target.closest(`#${START_GAME_BUTTON_ID}`)) {
      onStart();
      return;
    }
    const choice: Choice | undefined = readChoice(target);
    if (choice !== undefined) {
      onChange(withChoice(getCurrent(), choice.group, choice.value));
    }
  });
}
