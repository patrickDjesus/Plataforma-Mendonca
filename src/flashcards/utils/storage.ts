import { Deck, UserStats, Flashcard } from '../types';

const DECKS_STORAGE_KEY = 'flashcards_decks_v2';
const STATS_STORAGE_KEY = 'flashcards_stats_v2';
const THEME_STORAGE_KEY = 'flashcards_theme_v1';
const SOUND_STORAGE_KEY = 'flashcards_sound_v1';

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function loadStoredDecks(): Deck[] {
  try {
    const raw = localStorage.getItem(DECKS_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load decks from localStorage', err);
    return [];
  }
}

export function saveStoredDecks(decks: Deck[]): void {
  try {
    localStorage.setItem(DECKS_STORAGE_KEY, JSON.stringify(decks));
  } catch (err) {
    console.error('Failed to save decks', err);
  }
}

export function loadStoredStats(): UserStats {
  const defaultStats: UserStats = {
    streak: 0,
    lastStudyDate: '',
    totalCardsStudied: 0,
    totalCorrect: 0,
    sessionsCompleted: 0,
    historyByDate: {},
  };

  try {
    const raw = localStorage.getItem(STATS_STORAGE_KEY);
    if (!raw) {
      saveStoredStats(defaultStats);
      return defaultStats;
    }
    const parsed = JSON.parse(raw);
    return { ...defaultStats, ...parsed };
  } catch {
    return defaultStats;
  }
}

export function saveStoredStats(stats: UserStats): void {
  try {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch (err) {
    console.error('Failed to save stats', err);
  }
}

export function loadSoundSetting(): boolean {
  try {
    const raw = localStorage.getItem(SOUND_STORAGE_KEY);
    return raw !== null ? raw === 'true' : true;
  } catch {
    return true;
  }
}

export function saveSoundSetting(val: boolean): void {
  try {
    localStorage.setItem(SOUND_STORAGE_KEY, String(val));
  } catch {
    // ignore
  }
}

export function loadThemeSetting(): boolean {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (raw !== null) {
      return raw === 'dark';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return false;
  }
}

export function saveThemeSetting(isDark: boolean): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
  } catch {
    // ignore
  }
}

/**
 * Update user streak and study log
 */
export function recordStudySession(cardsCount: number, correctCount: number): UserStats {
  const stats = loadStoredStats();
  const today = getTodayDateString();

  // Streak logic
  let newStreak = stats.streak;
  if (stats.lastStudyDate) {
    const lastDate = new Date(stats.lastStudyDate);
    const currentDate = new Date(today);
    const diffDays = Math.round((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      newStreak += 1;
    } else if (diffDays > 1) {
      newStreak = 1;
    }
  } else {
    newStreak = 1;
  }

  const existingDaily = stats.historyByDate[today] || { reviewed: 0, correct: 0 };
  const updatedDaily = {
    reviewed: existingDaily.reviewed + cardsCount,
    correct: existingDaily.correct + correctCount,
  };

  const updatedStats: UserStats = {
    ...stats,
    streak: newStreak,
    lastStudyDate: today,
    totalCardsStudied: stats.totalCardsStudied + cardsCount,
    totalCorrect: stats.totalCorrect + correctCount,
    sessionsCompleted: stats.sessionsCompleted + 1,
    historyByDate: {
      ...stats.historyByDate,
      [today]: updatedDaily,
    },
  };

  saveStoredStats(updatedStats);

  return updatedStats;
}

/**
 * Incrementally update the global stats after a single live card review
 * (used so performance, streak and daily log update in real time while studying)
 */
export function updateStatsWithReview(stats: UserStats, correct: boolean): UserStats {
  const today = getTodayDateString();

  // Streak logic
  let newStreak = stats.streak;
  if (stats.lastStudyDate) {
    const lastDate = new Date(stats.lastStudyDate);
    const currentDate = new Date(today);
    const diffDays = Math.round((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      newStreak += 1;
    } else if (diffDays > 1) {
      newStreak = 1;
    }
  } else {
    newStreak = 1;
  }

  const existingDaily = stats.historyByDate[today] || { reviewed: 0, correct: 0 };

  return {
    ...stats,
    streak: newStreak,
    lastStudyDate: today,
    totalCardsStudied: stats.totalCardsStudied + 1,
    totalCorrect: stats.totalCorrect + (correct ? 1 : 0),
    historyByDate: {
      ...stats.historyByDate,
      [today]: {
        reviewed: existingDaily.reviewed + 1,
        correct: existingDaily.correct + (correct ? 1 : 0),
      },
    },
  };
}

/**
 * Mark a finished session (totals are already updated live during the session)
 */
export function incrementSessionsCompleted(stats: UserStats): UserStats {
  return { ...stats, sessionsCompleted: stats.sessionsCompleted + 1 };
}

/**
 * Batch import parser: accepts formats like:
 * Termo - Definição
 * Pergunta : Resposta
 * Term / Definition
 * Term [TAB] Definition
 */
export function parseBatchCardsText(rawText: string, defaultTag = 'Importados'): Partial<Flashcard>[] {
  const lines = rawText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const cards: Partial<Flashcard>[] = [];

  for (const line of lines) {
    let front: string;
    let back: string;

    if (line.includes('\t')) {
      const parts = line.split('\t');
      front = parts[0]?.trim() || '';
      back = parts.slice(1).join(' ').trim() || '';
    } else if (line.includes(' - ')) {
      const parts = line.split(' - ');
      front = parts[0]?.trim() || '';
      back = parts.slice(1).join(' - ').trim() || '';
    } else if (line.includes(' : ')) {
      const parts = line.split(' : ');
      front = parts[0]?.trim() || '';
      back = parts.slice(1).join(' : ').trim() || '';
    } else if (line.includes(' / ')) {
      const parts = line.split(' / ');
      front = parts[0]?.trim() || '';
      back = parts.slice(1).join(' / ').trim() || '';
    } else if (line.includes('=')) {
      const parts = line.split('=');
      front = parts[0]?.trim() || '';
      back = parts.slice(1).join('=').trim() || '';
    } else {
      // Fallback: split by comma if has comma
      if (line.includes(',')) {
        const idx = line.indexOf(',');
        front = line.slice(0, idx).trim();
        back = line.slice(idx + 1).trim();
      } else {
        front = line.trim();
        back = '';
      }
    }

    if (front) {
      cards.push({
        id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        front,
        back: back || 'Sem definição cadastrada',
        tag: defaultTag,
        difficulty: 'medium',
        starred: false,
        createdAt: Date.now(),
        repetition: 0,
        interval: 1,
        easeFactor: 2.5,
        dueDate: Date.now(),
        status: 'new',
        errorCount: 0,
        correctCount: 0,
      });
    }
  }

  return cards;
}
