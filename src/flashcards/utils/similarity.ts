/**
 * Normalize string: lowercases, removes accents/diacritics, trims, removes extra punctuation
 */
export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[.,/#!$%^&*;:{}=_\-`~()?"'’]/g, '') // remove punctuation
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Standard Levenshtein distance calculation
 */
export function levenshteinDistance(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;

  const matrix = Array.from({ length: bn + 1 }, (_, i) => [i]);
  for (let j = 0; j <= an; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= bn; i++) {
    for (let j = 1; j <= an; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[bn][an];
}

export interface ComparisonResult {
  isExact: boolean;
  isClose: boolean;
  score: number; // 0 to 100
  distance: number;
}

/**
 * Compare user typed answer to target definition
 */
export function checkAnswerSimilarity(userAnswer: string, targetAnswer: string): ComparisonResult {
  const normUser = normalizeString(userAnswer);
  const normTarget = normalizeString(targetAnswer);

  if (normUser === normTarget) {
    return { isExact: true, isClose: true, score: 100, distance: 0 };
  }

  const distance = levenshteinDistance(normUser, normTarget);
  const maxLength = Math.max(normUser.length, normTarget.length);
  if (maxLength === 0) {
    return { isExact: false, isClose: false, score: 0, distance: 0 };
  }

  const similarity = Math.max(0, (1 - distance / maxLength) * 100);
  const score = Math.round(similarity);

  // Allow close tolerance if similarity is >= 82% or distance <= 2 for short words
  const isClose = score >= 82 || (maxLength > 3 && distance <= 2);

  return {
    isExact: score === 100,
    isClose,
    score,
    distance,
  };
}
