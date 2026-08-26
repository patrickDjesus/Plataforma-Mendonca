import { PerformanceAnalytics } from '../types/design';

// Chaves do localStorage
export const CUSTOM_QUESTIONS_STORAGE_KEY = 'synapse_custom_teacher_questions_v3';
export const HIGH_SCORE_STORAGE_KEY = 'synapse_survival_high_score_v3';
export const ANALYTICS_STORAGE_KEY = 'synapse_performance_analytics_v3';

export const DEFAULT_ANALYTICS: PerformanceAnalytics = {
  totalAnswered: 0,
  totalCorrect: 0,
  totalWrong: 0,
  totalXpEarned: 0,
  bestStreakCombo: 1,
  totalSecondsPlayed: 0,
  subjectStats: {},
  recentQuestionsLog: [],
  sessionsHistory: []
};

export const SUBJECT_OPTIONS = [
  'Matemática & Cálculo',
  'Física Clássica & Moderna',
  'Química Geral & Orgânica',
  'Biologia & Genética',
  'História & Humanidades',
  'Linguagens & Literatura',
  'Ciência da Computação & IA'
];
