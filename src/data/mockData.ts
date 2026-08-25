import { ConceptNode, QuizQuestion, RecentMaterial } from '../types/design';

export const EXAM_EVENT = {
  title: 'ENEM 2026 • Exame Nacional do Ensino Médio',
  targetDate: new Date('2026-11-01T13:00:00-03:00'),
  daysRemaining: Math.max(1, Math.floor((new Date('2026-11-01T13:00:00-03:00').getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
  hoursRemaining: 12,
  readinessScore: 0,
  targetScore: 940,
  currentPredictedScore: 0,
};

export const STREAK_DATA = {
  currentStreak: 1,
  bestStreak: 1,
  weekHours: 0,
  targetWeeklyHours: 20,
  days: [
    { day: 'SEG', full: 'Segunda', active: false, minutes: 0, date: '' },
    { day: 'TER', full: 'Terça', active: true, isToday: true, minutes: 0, date: 'Hoje' },
    { day: 'QUA', full: 'Quarta', active: false, minutes: 0, date: '' },
    { day: 'QUI', full: 'Quinta', active: false, minutes: 0, date: '' },
    { day: 'SEX', full: 'Sexta', active: false, minutes: 0, date: '' },
    { day: 'SÁB', full: 'Sábado', active: false, minutes: 0, date: '' },
    { day: 'DOM', full: 'Domingo', active: false, minutes: 0, date: '' },
  ],
  freezeTokens: 0,
};

// Materiais recentes zerados (alimentados conforme o estudante estuda)
export const RECENT_MATERIALS: RecentMaterial[] = [];

// Grafo neural de conceitos zerado (o usuário constrói seus próprios nós ou adiciona pelo estúdio)
export const CONCEPT_NODES: ConceptNode[] = [];

// Questões zeradas (o banco de dados e geradores dinâmicos fornecem o conteúdo conforme o uso)
export const QUIZ_QUESTIONS: QuizQuestion[] = [];
