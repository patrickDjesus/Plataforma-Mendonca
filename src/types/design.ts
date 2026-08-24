export type ScreenId = 'home' | 'caderno' | 'mapa' | 'treino';
export type ViewMode = 'prototype' | 'specification';

export interface ConceptNode {
  id: string;
  label: string;
  category: string;
  color: string;
  glowColor: string;
  x: number;
  y: number;
  size: number;
  mastery: number; // 0 to 100%
  description: string;
  connections: string[]; // ids of connected nodes
  synapticStrength: number; // 1 to 5
  tags: string[];
}

export interface QuizQuestion {
  id: number;
  subject: string;
  topic: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  statement: string;
  imageUrl?: string;
  imageCaption?: string;
  codeSnippet?: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  aiHint: string;
  gameType?: 'math' | 'chemistry' | 'formula' | 'standard';
  mathExpression?: string;
  chemicalElement?: {
    symbol: string;
    name: string;
    atomicNumber: number;
    atomicMass: number;
    family: string;
    period: number;
    group: number;
    stateAt25C: 'Sólido' | 'Líquido' | 'Gasoso';
    description: string;
    curiosity: string;
    color: string;
    hiddenProperty?: 'symbol' | 'name' | 'family' | 'atomicInfo' | 'state';
  };
  formulaInfo?: {
    formula: string;
    mnemonic?: string;
    discipline: string;
  };
}

export interface RecentMaterial {
  id: string;
  title: string;
  module: string;
  category: string;
  progress: number;
  lastAccess: string;
  readTime: string;
  iconName: string;
  colorScheme: 'cyan' | 'purple' | 'blue';
}

export interface DesignToken {
  name: string;
  hex: string;
  role: string;
  usage: string;
  contrastRatio: string;
}

export interface TopicStudySuggestion {
  subject: string;
  topic: string;
  wrongCount: number;
  totalCount: number;
  errorRate: number;
  priority: 'Crítico' | 'Moderado' | 'Revisão Leve';
  recommendedAction: string;
  reason: string;
  discipline: 'Matemática' | 'Física' | 'Química' | 'Biologia' | 'Geral';
}

export interface PerformanceSessionHistory {
  id: string;
  date: string;
  gameMode: string;
  score: number;
  xpEarned: number;
  accuracy: number;
  totalQuestions: number;
  correctQuestions: number;
  maxCombo: number;
  elapsedSeconds: number;
}

export interface PerformanceAnalytics {
  totalAnswered: number;
  totalCorrect: number;
  totalWrong: number;
  totalXpEarned: number;
  bestStreakCombo: number;
  totalSecondsPlayed: number;
  subjectStats: Record<string, {
    answered: number;
    correct: number;
    wrong: number;
    topics: Record<string, {
      answered: number;
      correct: number;
      wrong: number;
    }>;
  }>;
  recentQuestionsLog: {
    id: string;
    date: string;
    question: QuizQuestion;
    selectedOptionId: string;
    isCorrect: boolean;
  }[];
  sessionsHistory: PerformanceSessionHistory[];
}

