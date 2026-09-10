/**
 * Spielzustand und Regeln des Memory-Spiels. Kennt kein DOM.
 */

import { createDeck } from "./board";
import type { Card, CardId, GameState } from "../types";

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

    (card as Card).isFlipped = true;
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
    } else {
      this.hide(openCards);
    }
    this.updateStatus();
  }

  /** Ob aktuell auf die Auswertung eines Zuges gewartet wird. */
  public hasPendingTurn(): boolean {
    return this.getOpenCards().length >= CARDS_PER_TURN;
  }

  private static createInitialState(pairCount: number): GameState {
    return {
      cards: createDeck(pairCount),
      status: "idle",
      moves: 0,
      matchedPairs: 0,
    };
  }

  private static isPair(cards: readonly Card[]): boolean {
    return cards[0].symbol === cards[1].symbol;
  }

  private canFlip(card: Card | undefined, openCards: readonly Card[]): boolean {
    const isSelectable: boolean =
      card !== undefined && !card.isFlipped && !card.isMatched;
    return isSelectable && openCards.length < CARDS_PER_TURN;
  }

  private findCard(id: CardId): Card | undefined {
    return this.state.cards.find((card: Card): boolean => card.id === id);
  }

  private getOpenCards(): Card[] {
    return this.state.cards.filter(
      (card: Card): boolean => card.isFlipped && !card.isMatched,
    );
  }

  private markMatched(cards: readonly Card[]): void {
    for (const card of cards) {
      card.isMatched = true;
    }
    this.state.matchedPairs += 1;
  }

  private hide(cards: readonly Card[]): void {
    for (const card of cards) {
      card.isFlipped = false;
    }
  }

  private updateStatus(): void {
    this.state.status = this.isWon() ? "won" : "running";
  }
}
