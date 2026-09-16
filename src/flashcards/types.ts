export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export type CardStatus = 'new' | 'learning' | 'review' | 'mastered';

export interface ReviewLog {
  timestamp: number;
  rating: number; // 0 (Again), 3 (Hard), 4 (Good), 5 (Easy)
  mode: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  tag?: string;
  difficulty: DifficultyLevel;
  starred?: boolean;
  createdAt: number;
  acceptedAnswers?: string[]; // Alternative approved answers saved by the user
  // SM-2 Spaced Repetition stats
  repetition: number;
  interval: number; // in days
  easeFactor: number;
  dueDate: number; // timestamp in ms
  status: CardStatus;
  errorCount: number;
  correctCount: number;
  reviewHistory?: ReviewLog[];
}

export type DeckColor = 'indigo' | 'emerald' | 'rose' | 'amber' | 'violet' | 'cyan' | 'blue' | 'fuchsia';

export interface Deck {
  id: string;
  name: string;
  description: string;
  color: DeckColor;
  icon: string; // Lucide icon identifier
  cards: Flashcard[];
  createdAt: number;
  lastStudiedAt?: number;
}

export type StudyMode = 'unified' | 'classic' | 'spaced' | 'quiz' | 'write' | 'match';

// Foco do estudo: baralho completo ou somente os cartões mais difíceis
export type StudyFocus = 'all' | 'hard';

export interface DailyStudyLog {
  reviewed: number;
  correct: number;
}

export interface UserStats {
  streak: number;
  lastStudyDate: string; // YYYY-MM-DD
  totalCardsStudied: number;
  totalCorrect: number;
  sessionsCompleted: number;
  historyByDate: Record<string, DailyStudyLog>;
}
