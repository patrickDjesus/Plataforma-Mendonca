import { Flashcard } from '../types';

/**
 * Define se um cartão pertence ao grupo de estudo "difíceis / não sei":
 *  - foi marcado como "Não sei" ou "Muito difícil" (status learning / difficulty hard), ou
 *  - acumulou erros nas revisões anteriores.
 * Marcar um cartão como "Fácil" o remove automaticamente deste grupo.
 */
export function isHardCard(card: Flashcard): boolean {
  return (
    card.status === 'learning' ||
    card.difficulty === 'hard' ||
    (card.errorCount || 0) > 0
  );
}

export function countHardCards(cards: Flashcard[]): number {
  return cards.filter(isHardCard).length;
}