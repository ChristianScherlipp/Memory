/**
 * Einfacher Spiel-Timer (verstrichene Sekunden). Kennt kein DOM.
 */

/** Meldet die verstrichene Zeit in ganzen Sekunden. */
export type TimerTickListener = (elapsedSeconds: number) => void;

/** Millisekunden pro Tick. */
const TICK_INTERVAL_MS: number = 1000;

/** Misst die Dauer einer Partie und benachrichtigt einen Listener pro Sekunde. */
export class GameTimer {
  private elapsedSeconds: number = 0;
  private handle: number | undefined = undefined;

  constructor(private readonly onTick: TimerTickListener) {}

  /** Startet den Timer, falls er nicht bereits läuft. */
  public start(): void {
    if (this.handle !== undefined) {
      return;
    }
    this.handle = window.setInterval((): void => {
      this.elapsedSeconds += 1;
      this.onTick(this.elapsedSeconds);
    }, TICK_INTERVAL_MS);
  }

  /** Stoppt den Timer. */
  public stop(): void {
    if (this.handle === undefined) {
      return;
    }
    window.clearInterval(this.handle);
    this.handle = undefined;
  }

  /** Setzt den Timer auf null zurück und stoppt ihn. */
  public reset(): void {
    this.stop();
    this.elapsedSeconds = 0;
  }
}
