/**
 * Generische Array-Hilfsfunktionen.
 */

/**
 * Mischt ein Array per Fisher-Yates und gibt eine neue Kopie zurück.
 */
export function shuffle<T>(items: readonly T[]): T[] {
  const result: T[] = [...items];

  for (let i = result.length - 1; i > 0; i -= 1) {
    const j: number = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}
