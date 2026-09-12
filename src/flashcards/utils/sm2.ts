import { Flashcard, CardStatus } from '../types';

export type SM2Rating = 0 | 3 | 4 | 5; 
// 0: Errei (Again)
// 3: Difícil (Hard)
// 4: Bom (Good)
// 5: Fácil (Easy)

export interface SM2Result {
  interval: number;
  repetition: number;
  easeFactor: number;
  dueDate: number;
  status: CardStatus;
}

/**
 * SuperMemo SM-2 algorithm calculation
 */
export function calculateSM2(card: Flashcard, rating: SM2Rating): SM2Result {
  const { repetition, interval, easeFactor } = card;

  // New ease factor: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const newEaseFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02))
  );

  let newRepetition: number;
  let newInterval: number;

  if (rating < 3) {
    // Errei - reset repetition
    newRepetition = 0;
    newInterval = 1;
  } else {
    // Acertou (Difícil, Bom, ou Fácil)
    newRepetition = repetition + 1;
    if (repetition === 0) {
      newInterval = 1;
    } else if (repetition === 1) {
      newInterval = rating === 3 ? 3 : 6;
    } else {
      const modifier = rating === 3 ? 1.2 : rating === 5 ? 1.3 : 1.0;
      newInterval = Math.max(1, Math.round(interval * newEaseFactor * modifier));
    }
  }

  // Determine card status
  let status: CardStatus;
  if (rating < 3) {
    status = 'learning';
  } else if (newRepetition >= 4 && newInterval >= 21) {
    status = 'mastered';
  } else {
    status = 'review';
  }

  // Due date: now + interval days in ms (86400000 ms per day)
  const now = Date.now();
  const dueDate = now + newInterval * 24 * 60 * 60 * 1000;

  return {
    interval: newInterval,
    repetition: newRepetition,
    easeFactor: Number(newEaseFactor.toFixed(2)),
    dueDate,
    status,
  };
}

/**
 * Format interval into human-readable Portuguese label
 */
export function formatIntervalLabel(days: number): string {
  if (days <= 0) return 'hoje';
  if (days === 1) return '1 dia';
  if (days < 30) return `${days} dias`;
  const months = Math.round(days / 30);
  if (months === 1) return '1 mês';
  return `${months} meses`;
}

/**
 * Preview intervals for each rating choice
 */
export function getIntervalPreview(card: Flashcard): Record<SM2Rating, string> {
  const r0 = calculateSM2(card, 0);
  const r3 = calculateSM2(card, 3);
  const r4 = calculateSM2(card, 4);
  const r5 = calculateSM2(card, 5);

  return {
    0: '1 dia',
    3: formatIntervalLabel(r3.interval),
    4: formatIntervalLabel(r4.interval),
    5: formatIntervalLabel(r5.interval),
  };
}
