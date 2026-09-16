import { Flashcard, CardStatus, DifficultyLevel } from '../types';

/**
 * Classificação de 4 níveis usada pelo estudo de Repetição Espaçada.
 *
 * 0: Não sei    → o cartão NÃO sai da sessão; repete até ser lembrado.
 * 1: Muito difícil → intervalo curto (reaparece em breve).
 * 2: Razoável   → intervalo base de ~3 dias (revisão do baralho completo).
 * 3: Fácil      → intervalo longo + status promovido (sai da categoria difícil).
 */
export type SRSRating = 0 | 1 | 2 | 3;

/** Retrocompatibilidade: chamadas antigas que usavam o nome SM2Rating. */
export type SM2Rating = SRSRating;

export interface SRSResult {
  interval: number;
  repetition: number;
  easeFactor: number;
  dueDate: number;
  status: CardStatus;
  difficulty: DifficultyLevel;
}

/** Retrocompatibilidade: chamadas antigas que usavam o nome SM2Result. */
export type SM2Result = SRSResult;

const MIN_EASE = 1.3;
const MAX_EASE = 2.8;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Algoritmo de repetição espaçada baseado no SM-2, adaptado para 4 níveis:
 *
 * - A frequência de retorno é proporcional à dificuldade: quanto mais difícil,
 *   menor o intervalo até o cartão reaparecer.
 * - A primeira lembrança correta agenda ~3 dias no nível "Razoável".
 * - Marcar "Fácil" sobe o status (em direção a "mastered") e muda a categoria
 *   do cartão para 'easy', evitando que ele fique reaparecendo com frequência.
 */
export function calculateSRS(card: Flashcard, rating: SRSRating): SRSResult {
  const now = Date.now();
  const currentInterval = card.interval || 0;
  const currentRepetition = card.repetition || 0;
  const currentEase = card.easeFactor || 2.5;

  let repetition: number;
  let interval: number; // em dias
  let easeFactor: number;
  let status: CardStatus;
  let difficulty: DifficultyLevel;

  if (rating === 0) {
    // Não sei → zera o ciclo de aprendizagem. O intervalo vira 0 para que o
    // cartão continue na sessão atual e também fique "vencido" para revisão.
    repetition = 0;
    interval = 0;
    easeFactor = clamp(currentEase - 0.2, MIN_EASE, MAX_EASE);
    status = 'learning';
    difficulty = 'hard';
  } else {
    const firstCorrect = currentRepetition === 0 || currentInterval <= 0;
    repetition = currentRepetition + 1;
    easeFactor = clamp(
      currentEase + (rating === 3 ? 0.1 : rating === 2 ? 0 : -0.05),
      MIN_EASE,
      MAX_EASE
    );

    if (firstCorrect) {
      // 1ª vez lembrado: base de ~3 dias no "Razoável".
      interval = rating === 1 ? 1.5 : rating === 2 ? 3 : 6;
    } else {
      // Revisões seguintes: crescem, mas sempre respeitando a dificuldade —
      // mais difícil ⇒ multiplicador menor ⇒ reaparece mais rápido.
      const multiplier = rating === 1 ? 1.15 : rating === 2 ? 1.8 : 2.6;
      interval = currentInterval * multiplier;
    }
    interval = Math.max(1, Math.round(interval));

    if (rating === 1) {
      status = interval <= 2 ? 'learning' : 'review';
      difficulty = 'hard';
    } else if (rating === 2) {
      status = repetition >= 3 && interval >= 21 ? 'mastered' : 'review';
      difficulty = 'medium';
    } else {
      // Fácil: status promovido e saída automática da categoria difícil.
      status = interval >= 15 || repetition >= 2 ? 'mastered' : 'review';
      difficulty = 'easy';
    }
  }

  return {
    interval,
    repetition,
    easeFactor: Number(easeFactor.toFixed(2)),
    dueDate: now + interval * MS_PER_DAY,
    status,
    difficulty,
  };
}

/** Alias retrocompatível do algoritmo (mesma implementação). */
export function calculateSM2(card: Flashcard, rating: SM2Rating): SM2Result {
  return calculateSRS(card, rating);
}

/**
 * Formata o intervalo em um rótulo legível em português.
 */
export function formatIntervalLabel(days: number): string {
  if (days <= 0) return 'hoje (repete na sessão)';
  if (days === 1) return '1 dia';
  if (days < 30) return `${days} dias`;
  const months = Math.round(days / 30);
  if (months === 1) return '1 mês';
  return `${months} meses`;
}

/**
 * Prévia dos intervalos para cada uma das 4 classificações.
 */
export function getIntervalPreview(card: Flashcard): Record<SRSRating, string> {
  const r0 = calculateSRS(card, 0);
  const r1 = calculateSRS(card, 1);
  const r2 = calculateSRS(card, 2);
  const r3 = calculateSRS(card, 3);

  return {
    0: formatIntervalLabel(r0.interval),
    1: formatIntervalLabel(r1.interval),
    2: formatIntervalLabel(r2.interval),
    3: formatIntervalLabel(r3.interval),
  };
}

export const RATING_LABELS: Record<SRSRating, string> = {
  0: 'Não sei',
  1: 'Muito difícil',
  2: 'Razoável',
  3: 'Fácil',
};

export const RATING_SHORT_LABELS: Record<SRSRating, string> = {
  0: 'Repetir',
  1: 'Difícil',
  2: 'Razoável',
  3: 'Fácil',
};