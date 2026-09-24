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

export const MAX_INTERVAL_DAYS = 7; // Limite máximo rigoroso: 1 semana
export const MIN_INTERVAL_HOURS = 4; // Mínimo: algumas horas (4 horas)
export const MIN_INTERVAL_DAYS = MIN_INTERVAL_HOURS / 24; // ~0.167 dias

const MIN_EASE = 1.3;
const MAX_EASE = 2.8;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Algoritmo de repetição espaçada adaptado para prática diária intensiva:
 * - Intervalo máximo: 1 semana (7 dias).
 * - Intervalo mínimo: algumas horas (4h / 12h).
 * - A frequência de retorno é proporcional à dificuldade: quanto mais difícil,
 *   menor o intervalo até o cartão reaparecer.
 */
export function calculateSRS(card: Flashcard, rating: SRSRating): SRSResult {
  const now = Date.now();
  const currentInterval = card.interval || 0;
  const currentRepetition = card.repetition || 0;
  const currentEase = card.easeFactor || 2.5;

  let repetition: number;
  let interval: number; // em dias (fração para horas)
  let easeFactor: number;
  let status: CardStatus;
  let difficulty: DifficultyLevel;

  if (rating === 0) {
    // Não sei → zera o ciclo. Reaparece na própria sessão e fica agendado
    // para reforço em algumas horas (4h).
    repetition = 0;
    interval = MIN_INTERVAL_DAYS;
    easeFactor = clamp(currentEase - 0.2, MIN_EASE, MAX_EASE);
    status = 'learning';
    difficulty = 'hard';
  } else {
    const firstCorrect = currentRepetition === 0 || currentInterval <= MIN_INTERVAL_DAYS;
    repetition = currentRepetition + 1;
    easeFactor = clamp(
      currentEase + (rating === 3 ? 0.1 : rating === 2 ? 0 : -0.05),
      MIN_EASE,
      MAX_EASE
    );

    if (firstCorrect) {
      // 1ª vez lembrado:
      // Muito difícil: 12 horas (0.5 dia)
      // Razoável: 2 dias
      // Fácil: 4 dias
      interval = rating === 1 ? 0.5 : rating === 2 ? 2 : 4;
    } else {
      // Revisões seguintes: respeitam a escala diária com teto de 1 semana
      if (rating === 1) {
        // Muito difícil: escala lenta, no máximo 2 dias
        interval = Math.min(2, Math.max(0.5, currentInterval * 1.2));
      } else if (rating === 2) {
        // Razoável: escala moderada (2d -> 3d -> 5d)
        interval = Math.min(5, Math.max(1, currentInterval * 1.5));
      } else {
        // Fácil: escala rápida até o teto absoluto de 1 semana (7 dias)
        interval = Math.min(MAX_INTERVAL_DAYS, Math.max(2, currentInterval * 2.0));
      }
    }

    // Trava estrita: mínimo de algumas horas e máximo de 1 semana
    interval = Math.min(MAX_INTERVAL_DAYS, Math.max(MIN_INTERVAL_DAYS, Number(interval.toFixed(2))));

    if (rating === 1) {
      status = interval <= 1 ? 'learning' : 'review';
      difficulty = 'hard';
    } else if (rating === 2) {
      status = repetition >= 2 && interval >= 3 ? 'mastered' : 'review';
      difficulty = 'medium';
    } else {
      // Fácil: promovido para dominado
      status = repetition >= 1 && interval >= 3 ? 'mastered' : 'review';
      difficulty = 'easy';
    }
  }

  return {
    interval,
    repetition,
    easeFactor: Number(easeFactor.toFixed(2)),
    dueDate: now + Math.round(interval * MS_PER_DAY),
    status,
    difficulty,
  };
}

/** Alias retrocompatível do algoritmo (mesma implementação). */
export function calculateSM2(card: Flashcard, rating: SM2Rating): SM2Result {
  return calculateSRS(card, rating);
}

/**
 * Formata o intervalo em um rótulo legível em português (máx 1 semana, mín horas).
 */
export function formatIntervalLabel(days: number): string {
  if (days <= 0) return 'hoje (na sessão)';
  if (days < 0.95) {
    const hours = Math.max(1, Math.round(days * 24));
    return hours === 1 ? '1 hora' : `${hours} horas`;
  }
  const rounded = Math.round(days);
  if (rounded <= 1) return '1 dia';
  if (rounded < 7) return `${rounded} dias`;
  return '1 semana';
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