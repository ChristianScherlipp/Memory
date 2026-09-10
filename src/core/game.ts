/**
 * Spielzustand und Regeln des Memory-Spiels. Kennt kein DOM.
 */

import { createDeck } from "./board";
import type {
  Card,
  CardId,
  GameOutcome,
  GameState,
  PlayerId,
} from "../types";

/** Anzahl gleichzeitig offener Karten, die ein Zug vergleicht. */
const CARDS_PER_TURN: number = 2;

/** Verwaltet eine einzelne Memory-Partie. */
export class Game {
  private state: GameState;
  private readonly pairCount: number;

  constructor(pairCount: number) {
    this.pairCount = pairCount;
    this.state = Game.createInitialState(pairCount);
  }

  /** Liefert den aktuellen Zustand (nur lesend gedacht). */
  public getState(): GameState {
    return this.state;
  }

  /** Ob die aktuelle Partie gewonnen ist. */
  public isWon(): boolean {
    return this.state.matchedPairs === this.pairCount;
  }

  /** Sieger der beendeten Partie; `undefined` bei Gleichstand oder laufendem Spiel. */
  public getWinner(): PlayerId | undefined {
    const [first, second] = [this.state.scores[1], this.state.scores[2]];
    if (!this.isWon() || first === second) {
      return undefined;
    }
    return first > second ? 1 : 2;
  }

  /** Ausgang der Partie; `undefined`, solange noch nicht gewonnen. */
  public getOutcome(): GameOutcome | undefined {
    if (!this.isWon()) {
      return undefined;
    }
    const winner: PlayerId | undefined = this.getWinner();
    if (winner === undefined) {
      return "draw";
    }
    return winner === 1 ? "player-1-wins" : "player-2-wins";
  }

  /** Startet eine neue Partie mit frisch gemischtem Deck. */
  public reset(): void {
    this.state = Game.createInitialState(this.pairCount);
  }

  /**
   * Deckt die Karte mit der ID auf, sofern der Zug erlaubt ist.
   * Gibt true zurück, wenn sich der Zustand geändert hat.
   */
  public flip(id: CardId): boolean {
    const card: Card | undefined = this.findCard(id);
    const openCards: Card[] = this.getOpenCards();

    if (!this.canFlip(card, openCards)) {
      return false;
    }

    card.isFlipped = true;
    this.state.status = "running";
    return true;
  }

  /**
   * Wertet die beiden offenen Karten aus: Paar behalten oder wieder zudecken.
   * Sollte aufgerufen werden, sobald zwei Karten offen sind.
   */
  public resolveTurn(): void {
    const openCards: Card[] = this.getOpenCards();
    if (openCards.length < CARDS_PER_TURN) {
      return;
    }

    this.state.moves += 1;
    if (Game.isPair(openCards)) {
      this.markMatched(openCards);
      this.state.scores[this.state.currentPlayer] += 1;
    } else {
      this.hide(openCards);
      this.switchPlayer();
    }
    this.updateStatus();
  }

  /** Wechselt das Zugrecht zum jeweils anderen Spieler. */
  private switchPlayer(): void {
    this.state.currentPlayer = this.state.currentPlayer === 1 ? 2 : 1;
  }

  /** Ob aktuell auf die Auswertung eines Zuges gewartet wird. */
  public hasPendingTurn(): boolean {
    return this.getOpenCards().length >= CARDS_PER_TURN;
  }

  /** Baut den Startzustand einer Partie mit frisch gemischtem Deck. */
  private static createInitialState(pairCount: number): GameState {
    return {
      cards: createDeck(pairCount),
      status: "idle",
      moves: 0,
      matchedPairs: 0,
      currentPlayer: 1,
      scores: { 1: 0, 2: 0 },
    };
  }

  /** Ob die beiden offenen Karten dasselbe Symbol zeigen. */
  private static isPair(cards: readonly Card[]): boolean {
    return cards[0].symbol === cards[1].symbol;
  }

  /** Prüft als Type-Guard, ob die Karte jetzt aufgedeckt werden darf. */
  private canFlip(
    card: Card | undefined,
    openCards: readonly Card[],
  ): card is Card {
    const isSelectable: boolean =
      card !== undefined && !card.isFlipped && !card.isMatched;
    return isSelectable && openCards.length < CARDS_PER_TURN;
  }

  /** Sucht eine Karte anhand ihrer ID; `undefined`, wenn keine passt. */
  private findCard(id: CardId): Card | undefined {
    return this.state.cards.find((card: Card): boolean => card.id === id);
  }

  /** Liefert alle aktuell offenen, noch nicht gematchten Karten. */
  private getOpenCards(): Card[] {
    return this.state.cards.filter(
      (card: Card): boolean => card.isFlipped && !card.isMatched,
    );
  }

  /** Markiert die übergebenen Karten als Treffer und zählt das Paar. */
  private markMatched(cards: readonly Card[]): void {
    for (const card of cards) {
      card.isMatched = true;
    }
    this.state.matchedPairs += 1;
  }

  /** Deckt die übergebenen Karten wieder zu. */
  private hide(cards: readonly Card[]): void {
    for (const card of cards) {
      card.isFlipped = false;
    }
  }

  /** Setzt den Status nach einem Zug auf `won` oder `running`. */
  private updateStatus(): void {
    this.state.status = this.isWon() ? "won" : "running";
  }
}
