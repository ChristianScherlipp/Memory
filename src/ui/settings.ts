/**
 * Erzeugt das Auswahl-Formular (Theme, Spielerfarbe, Spielfeldgröße) mit
 * Radio-Inputs, Kategorie-Icons und einer Live-Vorschau des gewählten Looks
 * und verknüpft dessen Eingaben mit dem Spielzustand. Event-Delegation.
 */

import {
  BOARD_SIZES,
  CARD_IMAGE_BASE_PATH,
  CARDS_PER_PAIR,
  PLAYER_COLORS,
  SETTINGS_ICON_BASE_PATH,
  START_GAME_BUTTON_ID,
  THEME_IDS,
  THEME_IMAGE_DIRS,
  assetUrl,
} from "../config/settings";
import type { BoardSize, GameSettings, PlayerColor, ThemeId } from "../types";

/** Eine wählbare Option innerhalb einer Gruppe. */
interface Option {
  value: string;
  label: string;
}

/** Name einer Auswahl-Gruppe – entspricht einem Feld von `GameSettings`. */
type SettingsGroup = keyof GameSettings;

/** Eine im Formular geänderte Auswahl (Rohwert aus dem DOM). */
interface Choice {
  group: SettingsGroup;
  value: string;
}

/** Statische Beschreibung einer Auswahl-Gruppe. */
interface GroupSpec {
  group: SettingsGroup;
  legend: string;
  icon: string;
  options: readonly Option[];
}

/** Kartenmotiv, das die Vorderseite in der Mini-Vorschau zeigt. */
const PREVIEW_SYMBOL: string = "front1";

/** Dateiname (ohne Endung) des Icons vor der jeweiligen Kategorie. */
const GROUP_ICONS: Record<SettingsGroup, string> = {
  theme: "theme",
  playerColor: "player",
  boardSize: "board_size",
};

const THEME_LABELS: Record<ThemeId, string> = {
  v1: "Code vibes theme",
  v2: "Gaming theme",
  v3: "DA Projects theme",
  v4: "Foods theme",
};

const PLAYER_LABELS: Record<PlayerColor, string> = {
  orange: "Orange",
  blue: "Blue",
};

/** Beschriftung einer Spielfeldgröße als Kartenanzahl ("16 cards"). */
function cardCountLabel(size: BoardSize): string {
  return `${BOARD_SIZES[size].pairs * CARDS_PER_PAIR} cards`;
}

/** Optionen je Gruppe, aus der Konfiguration abgeleitet. */
const GROUPS: readonly GroupSpec[] = [
  {
    group: "theme",
    legend: "Game themes",
    icon: GROUP_ICONS.theme,
    options: THEME_IDS.map((value: ThemeId): Option => ({
      value,
      label: THEME_LABELS[value],
    })),
  },
  {
    group: "playerColor",
    legend: "Choose player",
    icon: GROUP_ICONS.playerColor,
    options: Object.keys(PLAYER_COLORS).map((value: string): Option => ({
      value,
      label: PLAYER_LABELS[value as PlayerColor],
    })),
  },
  {
    group: "boardSize",
    legend: "Board size",
    icon: GROUP_ICONS.boardSize,
    options: Object.keys(BOARD_SIZES).map((value: string): Option => ({
      value,
      label: cardCountLabel(value as BoardSize),
    })),
  },
];

/** Pfad zu einem Kategorie-Icon des Formulars. */
function iconSrc(name: string): string {
  return assetUrl(`${SETTINGS_ICON_BASE_PATH}/${name}.svg`);
}

/** Pfad zu einem Kartenmotiv des gewählten Themes für die Vorschau. */
function previewCardSrc(theme: ThemeId, symbol: string): string {
  return assetUrl(`${CARD_IMAGE_BASE_PATH}/${THEME_IMAGE_DIRS[theme]}/${symbol}.svg`);
}

/** Markup einer einzelnen Radio-Option (als Label mit verstecktem Input). */
function renderOption(group: SettingsGroup, option: Option, active: boolean): string {
  const swatch: string =
    group === "playerColor"
      ? `<span class="option__swatch" data-color="${option.value}"></span>`
      : "";
  return `
    <label class="option${active ? " option--active" : ""}">
      <input class="option__input" type="radio" name="${group}"
             value="${option.value}"${active ? " checked" : ""}>
      <span class="option__mark"></span>
      ${swatch}
      <span class="option__label">${option.label}</span>
    </label>
  `;
}

/** Markup der Legende einer Gruppe (Kategorie-Icon + Text). */
function renderLegend(spec: GroupSpec): string {
  return `
    <legend class="settings__legend">
      <img class="settings__icon" src="${iconSrc(spec.icon)}" alt="">
      ${spec.legend}
    </legend>
  `;
}

/** Markup einer Auswahl-Gruppe (Legende plus Optionsliste). */
function renderGroup(spec: GroupSpec, current: GameSettings): string {
  const options: string = spec.options
    .map((option: Option): string =>
      renderOption(spec.group, option, current[spec.group] === option.value),
    )
    .join("");
  return `
    <fieldset class="settings__group">
      ${renderLegend(spec)}
      <div class="settings__options">${options}</div>
    </fieldset>
  `;
}

/** Markup der Live-Vorschau: Rück- und Vorderseite im Stil der Auswahl. */
function renderPreview(current: GameSettings): string {
  const front: string = previewCardSrc(current.theme, PREVIEW_SYMBOL);
  return `
    <aside class="settings__preview" aria-hidden="true">
      <div class="preview-board">
        <span class="preview-board__card preview-board__card--back"></span>
        <img class="preview-board__card preview-board__card--front"
             src="${front}" alt="">
      </div>
    </aside>
  `;
}

/** Vollständiges Markup des Einstellungsformulars (Auswahl plus Vorschau). */
export function renderSettings(current: GameSettings): string {
  const groups: string = GROUPS.map((spec: GroupSpec): string =>
    renderGroup(spec, current),
  ).join("");
  return `
    <form class="settings">
      <div class="settings__form">
        ${groups}
        <button class="button button--start" type="button" id="${START_GAME_BUTTON_ID}">
          Start game
        </button>
      </div>
      ${renderPreview(current)}
    </form>
  `;
}

/** Liest Gruppe und Wert aus einem geänderten Radio-Input. */
function readChoice(target: EventTarget | null): Choice | undefined {
  if (!(target instanceof HTMLInputElement) || target.type !== "radio") {
    return undefined;
  }
  return { group: target.name as SettingsGroup, value: target.value };
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

/** Ob das Klick-Ziel der Start-Button (oder eines seiner Kinder) ist. */
function isStartClick(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    target.closest(`#${START_GAME_BUTTON_ID}`) !== null
  );
}

/** Setzt den Fokus nach dem Neu-Rendern zurück auf die gewählte Option. */
function refocusOption(root: HTMLElement, choice: Choice): void {
  const selector: string =
    `input[name="${choice.group}"][value="${choice.value}"]`;
  root.querySelector<HTMLInputElement>(selector)?.focus();
}

/**
 * Registriert delegierte Handler auf dem Formular-Container.
 * `onChange` erhält die neue Auswahl, `onStart` startet das Spiel.
 */
export function bindSettingsEvents(
  root: HTMLElement,
  getCurrent: () => GameSettings,
  onChange: (next: GameSettings) => void,
  onStart: () => void,
): void {
  root.addEventListener("change", (event: Event): void => {
    const choice: Choice | undefined = readChoice(event.target);
    if (choice === undefined) {
      return;
    }
    onChange(withChoice(getCurrent(), choice.group, choice.value));
    refocusOption(root, choice);
  });
  root.addEventListener("click", (event: MouseEvent): void => {
    if (isStartClick(event.target)) {
      onStart();
    }
  });
}
