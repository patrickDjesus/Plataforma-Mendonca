import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  ArrowRight, 
  RotateCcw, 
  Zap, 
  Trophy, 
  Flame, 
  Check, 
  Award, 
  Layers,
  Brain,
  Plus,
  FileQuestion,
  Calculator,
  Atom,
  FlaskConical,
  GraduationCap,
  Heart,
  HeartCrack,
  Timer as TimerIcon,
  Lightbulb,
  Search,
  Filter,
  Edit3,
  Trash2,
  Play,
  Maximize2,
  ChevronRight,
  ChevronLeft,
  Image as ImageIcon,
  ExternalLink,
  Shuffle,
  Eye,
  BookOpen,
  HelpCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  Copy,
  ChevronDown,
  ChevronUp,
  X,
  Target,
  BarChart3,
  Pause
} from 'lucide-react';
import { QUIZ_QUESTIONS } from '../data/mockData';
import { QuizQuestion, ScreenId, PerformanceAnalytics, PerformanceSessionHistory } from '../types/design';
import { GameLobby } from './treino/GameLobby';
import { PerformanceDashboard } from './PerformanceDashboard';
import { GlobalLeaderboard } from './GlobalLeaderboard';
import { QuestionCard } from './treino/QuestionCard';
import { PostTrainingSummaryModal, PostTrainingSummaryData } from './PostTrainingSummaryModal';
import { useAuth } from '../context/AuthContext';
import { GameHUD } from './treino/GameHUD';
import { GameOver } from './treino/GameOver';
import { 
  subscribeToQuestions, 
  createQuestion, 
  updateQuestion, 
  deleteQuestion, 
  subscribeToUserPerformance, 
  recordQuestionAnswer, 
  recordSessionCompleted, 
  resetUserPerformance 
} from '../services/supabase';

import { 
  generateRandomMathQuestion, 
  generateRandomPeriodicTableQuestion, 
  generateRandomFormulaQuestion,
  cleanMathText,
  GameCategory,
  GameDifficulty,
  ChemicalElement,
  PERIODIC_ELEMENTS 
} from '../utils/gameGenerators';
import { playSound, getAudioContext } from '../utils/sounds';
import { getEnduranceLevel } from '../utils/endurance';
import { CUSTOM_QUESTIONS_STORAGE_KEY, HIGH_SCORE_STORAGE_KEY, ANALYTICS_STORAGE_KEY, DEFAULT_ANALYTICS, SUBJECT_OPTIONS } from '../constants/game';

interface TreinoGamificacaoProps {
  onNavigate: (screen: ScreenId) => void;
  streakCount?: number;
  onStreakChange?: (count: number) => void;
}

export const TreinoGamificacao: React.FC<TreinoGamificacaoProps> = ({ 
  onNavigate,
  streakCount = 1,
  onStreakChange
}) => {
  const { userProfile, currentUser, saveGamificationProgress } = useAuth();
  // Aba ativa: 'game' (Centro de Treino), 'dashboard' (Dashboard de Desempenho), 'leaderboard' (Ranking Global) ou 'teacher' (Estúdio do Professor)
  const [activeTab, setActiveTab] = useState<'game' | 'dashboard' | 'leaderboard' | 'teacher'>('game');


  // Estado do Treino: 'lobby' (menu antes de iniciar), 'playing' (jogando sem limites), 'gameover' (perdeu as 3 vidas)
  const [gameStatus, setGameStatus] = useState<'lobby' | 'playing' | 'gameover'>('lobby');

  // Modo e Dificuldade selecionados
  const [gameMode, setGameMode] = useState<GameCategory | 'teacher_custom'>('math_arcade');
  const [difficulty, setDifficulty] = useState<GameDifficulty>('Médio');

  // Recorde pessoal
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(HIGH_SCORE_STORAGE_KEY);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Estatísticas e Analytics de Desempenho Persistidos
  const [analytics, setAnalytics] = useState<PerformanceAnalytics>(() => {
    try {
      const saved = localStorage.getItem(ANALYTICS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Erro ao ler analytics:', e);
    }
    return DEFAULT_ANALYTICS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(analytics));
    } catch (e) {
      console.error('Erro ao salvar analytics:', e);
    }
  }, [analytics]);

  // Sincronizar estatisticas de desempenho em tempo real do Supabase para o usuario autenticado
  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = subscribeToUserPerformance(currentUser.uid, (firestoreAnalytics) => {
      if (firestoreAnalytics) {
        setAnalytics(firestoreAnalytics);
      }
    });
    return () => unsubscribe();
  }, [currentUser]);

  // Resetar Analytics
  const handleResetAnalytics = () => {
    const fresh: PerformanceAnalytics = {
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
    setAnalytics(fresh);
    if (currentUser) {
      resetUserPerformance(currentUser.uid).catch(console.warn);
    }
    try {
      localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(fresh));
    } catch (error) {
      console.warn('Erro ao salvar no localStorage:', error);
    }
    showToast('Estatísticas de desempenho redefinidas com sucesso!');
  };

  // Questões personalizadas do professor
  const [customQuestions, setCustomQuestions] = useState<QuizQuestion[]>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_QUESTIONS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Erro ao ler custom questions:', e);
    }
    return [
      {
        id: 101,
        subject: 'Física Clássica & Moderna',
        topic: 'Circuitos Elétricos & Associação de Resistores',
        difficulty: 'Médio',
        statement: 'Analise o circuito elétrico ilustrado no esquema abaixo contendo resistores alimentados por uma fonte de tensão contínua. Sabendo que a corrente total que sai da fonte é 2 A, determine a potência total dissipada por efeito Joule no circuito.',
        imageUrl: 'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?auto=format&fit=crop&w=800&q=80',
        imageCaption: 'Figura 1: Diagrama esquemático de resistores ôhmicos.',
        codeSnippet: 'P_total = V · I = Req · I²',
        gameType: 'standard',
        options: [
          { id: 'A', text: '40 Watts', isCorrect: false, explanation: 'Incorreto.' },
          { id: 'B', text: '80 Watts', isCorrect: true, explanation: 'Correto! Com Req = 20 Ω, P = Req · I² = 20 · 4 = 80 W.' },
          { id: 'C', text: '120 Watts', isCorrect: false, explanation: 'Incorreto.' },
          { id: 'D', text: '160 Watts', isCorrect: false, explanation: 'Incorreto.' }
        ],
        aiHint: 'Lembre-se da fórmula de potência elétrica dissipada por efeito Joule: P = R · I² ou P = V · I.'
      },
      {
        id: 102,
        subject: 'Biologia & Genética',
        topic: 'Estrutura Celular & Mitocôndrias',
        difficulty: 'Fácil',
        statement: 'A organela citoplasmática mostrada na micrografia abaixo possui membrana dupla, cristas internas e DNA próprio. Qual é a sua função primordial na célula eucariótica?',
        imageUrl: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=800&q=80',
        imageCaption: 'Micrografia: Organela celular responsável pela respiração celular aeróbica.',
        gameType: 'standard',
        options: [
          { id: 'A', text: 'Respiração celular aeróbia e síntese massiva de ATP via fosforilação oxidativa.', isCorrect: true, explanation: 'Correto! A mitocôndria atua na produção de energia celular.' },
          { id: 'B', text: 'Síntese e empacotamento de proteínas para exportação.', isCorrect: false, explanation: 'Incorreto.' },
          { id: 'C', text: 'Digestão intracelular de macromoléculas através de enzimas.', isCorrect: false, explanation: 'Incorreto.' },
          { id: 'D', text: 'Degradação de peróxido de hidrogênio e oxidação de ácidos graxos.', isCorrect: false, explanation: 'Incorreto.' }
        ],
        aiHint: 'Observe as cristas mitocondriais e recorde a Teoria da Endossimbiose (organela com DNA próprio circular).'
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_QUESTIONS_STORAGE_KEY, JSON.stringify(customQuestions));
    } catch (e) {
      console.error('Erro ao salvar custom questions:', e);
    }
  }, [customQuestions]);

  // Sincronizar questoes autorais e comunitarias em tempo real do Supabase
  useEffect(() => {
    const unsubscribe = subscribeToQuestions((firestoreQuestions) => {
      if (firestoreQuestions && firestoreQuestions.length > 0) {
        setCustomQuestions(firestoreQuestions);
      }
    });
    return () => unsubscribe();
  }, []);

  // =========================================================================
  // ESTADO DO JOGO EM TEMPO REAL (SURVIVAL ENDLESS)
  // =========================================================================
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerConfirmed, setIsAnswerConfirmed] = useState(false);
  const [showAiHint, setShowAiHint] = useState(false);
  const [hasWrongAttempt, setHasWrongAttempt] = useState(false);
  
  // Gamificação & HUD
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [streakMultiplier, setStreakMultiplier] = useState(1);
  const [lives, setLives] = useState(3);
  const [lastLostLife, setLastLostLife] = useState<number | null>(null);
  const [answeredHistory, setAnsweredHistory] = useState<{ isCorrect: boolean; question: QuizQuestion; selectedOptionId?: string }[]>([]);
  const [maxCombo, setMaxCombo] = useState(1);

  // Modal de Resumo com Gráfico Donut Recharts
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [summaryModalData, setSummaryModalData] = useState<PostTrainingSummaryData | null>(null);

  // Efeito de partículas explodindo do card de modalidade selecionado
  const [burstParticles, setBurstParticles] = useState<{
    id: number;
    modeId: string;
    items: { char: string; color: string; tx: number; ty: number; r: number; s: number }[];
  } | null>(null);

  const triggerModeBurst = (modeId: string) => {
    let itemsPool: { chars: string[]; colors: string[] } = {
      chars: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '+', '−', '×', '÷', '=', '√', 'π', 'x²', 'Δ'],
      colors: ['#38bdf8', '#06b6d4', '#60a5fa', '#818cf8', '#93c5fd', '#3b82f6']
    };

    if (modeId === 'periodic_table') {
      itemsPool = {
        chars: ['H', 'He', 'Li', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Fe', 'Au', 'Ag', 'U', '⚛', '🧪', 'K', 'Ca', 'Cu'],
        colors: ['#c084fc', '#e879f9', '#a855f7', '#f472b6', '#38bdf8', '#34d399']
      };
    } else if (modeId === 'enem_formulas') {
      itemsPool = {
        chars: ['V=R·I', 'Q=m·c·ΔT', 'v=λ·f', 'F=m·a', 'E=mc²', 'ΔS=v·t', 'Ω', '⚡', '🔬', '💡', 'W=F·d', 'P=U·i'],
        colors: ['#fbbf24', '#f59e0b', '#fb923c', '#ea580c', '#facc15', '#f87171']
      };
    } else if (modeId === 'endurance') {
      itemsPool = {
        chars: ['⚡', '⏱️', '🔥', '10x', 'x2', 'x5', 'x8', 'HARDCORE', 'COMBO', '🚀', '🧠', 'MAX', '100%'],
        colors: ['#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981']
      };
    } else if (modeId === 'teacher_custom') {
      itemsPool = {
        chars: ['🎓', '📝', 'A', 'B', 'C', 'D', 'E', '✓', '⭐', '📚', '💡', '100%', 'ENEM', 'Simulado'],
        colors: ['#34d399', '#10b981', '#059669', '#2dd4bf', '#6ee7b7', '#14b8a6']
      };
    }

    const count = 16;
    const generated = Array.from({ length: count }, (_, i) => {
      const char = itemsPool.chars[Math.floor(Math.random() * itemsPool.chars.length)];
      const color = itemsPool.colors[Math.floor(Math.random() * itemsPool.colors.length)];
      const angle = (i / count) * 2 * Math.PI + (Math.random() * 0.4 - 0.2);
      const distance = 60 + Math.random() * 95;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      const r = Math.random() * 60 - 30;
      const s = 0.8 + Math.random() * 0.5;
      return { char, color, tx, ty, r, s };
    });

    setBurstParticles({
      id: Date.now(),
      modeId,
      items: generated
    });

    if (burstTimerRef.current) clearTimeout(burstTimerRef.current);
    burstTimerRef.current = setTimeout(() => {
      setBurstParticles(null);
    }, 1100);
  };

  // Timer Cronômetro Contínuo
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const burstTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gameoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (burstTimerRef.current) clearTimeout(burstTimerRef.current);
      if (gameoverTimerRef.current) clearTimeout(gameoverTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (gameStatus === 'playing') {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameStatus]);

  // Formatar tempo (00:00)
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Gerador de Próxima Pergunta Infinita (com suporte ao modo Endurance)
  const generateNextQuestion = (mode: GameCategory | 'teacher_custom', diff: GameDifficulty, currentElapsed = elapsedSeconds): QuizQuestion => {
    const effectiveDiff = mode === 'endurance' ? getEnduranceLevel(currentElapsed).diff : diff;

    if (mode === 'endurance') {

      // No Endurance, alterna dinamicamente com dificuldade crescente
      const dice = Math.random();
      if (dice < 0.35) {
        return generateRandomMathQuestion(effectiveDiff);
      } else if (dice < 0.65) {
        return generateRandomFormulaQuestion(effectiveDiff);
      } else if (dice < 0.90) {
        return generateRandomPeriodicTableQuestion(effectiveDiff);
      } else {
        const pool = [...QUIZ_QUESTIONS, ...customQuestions];
        const selected = pool[Math.floor(Math.random() * pool.length)];
        return {
          ...selected,
          id: Date.now() + Math.random(),
          difficulty: effectiveDiff === 'Hardcore' ? 'Difícil' : effectiveDiff
        };
      }
    }

    if (mode === 'math_arcade') {
      return generateRandomMathQuestion(diff);
    } else if (mode === 'periodic_table') {
      return generateRandomPeriodicTableQuestion(diff);
    } else if (mode === 'enem_formulas') {
      return generateRandomFormulaQuestion(diff);
    } else if (mode === 'teacher_custom') {
      if (customQuestions.length > 0) {
        const randomIndex = Math.floor(Math.random() * customQuestions.length);
        return { ...customQuestions[randomIndex], id: Date.now() + Math.random() };
      }
      return generateRandomMathQuestion(diff);
    } else {
      // enem_mixed: alterna aleatoriamente entre todos os tipos
      const coin = Math.floor(Math.random() * 4);
      if (coin === 0) return generateRandomMathQuestion(diff);
      if (coin === 1) return generateRandomPeriodicTableQuestion(diff);
      if (coin === 2) return generateRandomFormulaQuestion(diff);
      const pool = [...QUIZ_QUESTIONS, ...customQuestions];
      const selected = pool[Math.floor(Math.random() * pool.length)];
      return { ...selected, id: Date.now() + Math.random() };
    }
  };

  // Iniciar Modo Survival ou Endurance
  const handleStartSurvival = (forcedMode?: GameCategory | 'teacher_custom') => {
    const targetMode = forcedMode || gameMode;
    playSound('click');
    setGameStatus('playing');
    setElapsedSeconds(0);
    setScore(0);
    setXpEarned(0);
    setStreakMultiplier(1);
    setMaxCombo(1);
    setLives(3);
    setLastLostLife(null);
    setQuestionNumber(1);
    setAnsweredHistory([]);
    setSelectedOptionId(null);
    setIsAnswerConfirmed(false);
    setShowAiHint(false);
    setHasWrongAttempt(false);
    setCurrentQuestion(generateNextQuestion(targetMode, difficulty, 0));
  };

  // Iniciar Treino Focado a partir do Dashboard de Desempenho
  const handleStartFocusedPractice = (subject: string, topic?: string) => {
    playSound('click');
    setActiveTab('game');

    let modeToUse: GameCategory | 'teacher_custom' = 'enem_formulas';
    if (subject.toLowerCase().includes('matemática') || subject.toLowerCase().includes('cálculo') || subject.toLowerCase().includes('álgebra')) {
      modeToUse = 'math_arcade';
    } else if (subject.toLowerCase().includes('química') || subject.toLowerCase().includes('tabela')) {
      modeToUse = 'periodic_table';
    } else if (subject.toLowerCase().includes('física')) {
      modeToUse = 'enem_formulas';
    } else if (customQuestions.some(q => q.subject === subject)) {
      modeToUse = 'teacher_custom';
    }

    setGameMode(modeToUse);
    handleStartSurvival(modeToUse);
  };

  // Selecionar alternativa
  const handleSelectOption = (optId: string) => {
    if (isAnswerConfirmed) return;
    playSound('click');
    setSelectedOptionId(optId);
  };

  // Confirmar Resposta
  const handleConfirmAnswer = () => {
    if (!selectedOptionId || !currentQuestion || isAnswerConfirmed) return;

    const correctOpt = currentQuestion.options.find(o => o.isCorrect);
    const isCorrect = selectedOptionId === correctOpt?.id;

    setIsAnswerConfirmed(true);

    if (isCorrect) {
      let currentDiff = difficulty;
      let enduranceBonus = 1.0;
      if (gameMode === 'endurance') {
        const lvl = getEnduranceLevel(elapsedSeconds);
        currentDiff = lvl.diff;
        enduranceBonus = lvl.multiplierBonus;
      }

      const baseXP = currentDiff === 'Fácil' ? 80 : currentDiff === 'Médio' ? 140 : currentDiff === 'Difícil' ? 200 : 320;
      const finalXP = Math.round(baseXP * streakMultiplier * (gameMode === 'endurance' ? 1.5 : 1));
      const earnedPoints = Math.round(100 * streakMultiplier * enduranceBonus);

      setXpEarned(prev => prev + finalXP);
      setScore(prev => {
        const newScore = prev + earnedPoints;
        if (newScore > highScore) {
          setHighScore(newScore);
          try {
            localStorage.setItem(HIGH_SCORE_STORAGE_KEY, newScore.toString());
          } catch (error) {
            console.warn('Erro ao salvar no localStorage:', error);
          }
        }
        return newScore;
      });

      // No modo Endurance, o streak máximo chega até 10x!
      const maxStreakLimit = gameMode === 'endurance' ? 10 : 5;
      const nextStreak = Math.min(maxStreakLimit, streakMultiplier + 1);
      const isNewHighScore = (score + earnedPoints) > highScore && highScore > 0;
      
      setStreakMultiplier(nextStreak);
      setMaxCombo(prev => Math.max(prev, nextStreak));
      playSound('correct');

      // 🎆 Celebração com Partículas Dinâmicas (canvas-confetti)
      if (nextStreak >= 10 || isNewHighScore) {
        // Milestone Épico: Combo 10x ou Novo Recorde Histórico!
        playSound('combo');
        try {
          // Canhão esquerdo
          confetti({
            particleCount: 60,
            angle: 60,
            spread: 55,
            origin: { x: 0.1, y: 0.7 },
            colors: ['#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#10B981']
          });
          // Canhão direito
          confetti({
            particleCount: 60,
            angle: 120,
            spread: 55,
            origin: { x: 0.9, y: 0.7 },
            colors: ['#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#10B981']
          });
          // Explosão central com estrelas
          setTimeout(() => {
            confetti({
              particleCount: 40,
              spread: 100,
              origin: { y: 0.6 },
              shapes: ['circle'],
              colors: ['#FBBF24', '#38BDF8', '#4ADE80', '#A78BFA']
            });
          }, 200);
        } catch { /* ignored */ }
      } else if (nextStreak >= 5) {
        // Milestone de 5x Combo
        playSound('combo');
        try {
          confetti({
            particleCount: 75,
            spread: 80,
            origin: { y: 0.65 },
            colors: ['#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#10B981']
          });
        } catch { /* ignored */ }
      } else if (nextStreak >= 3) {
        // Milestone de 3x Combo
        try {
          confetti({
            particleCount: 35,
            spread: 60,
            origin: { y: 0.75 },
            colors: ['#06B6D4', '#8B5CF6', '#10B981']
          });
        } catch { /* ignored */ }
      }

      setAnsweredHistory(prev => [...prev, { isCorrect: true, question: currentQuestion }]);

      // Atualizar Analytics de Desempenho (Acerto)
      setAnalytics(prev => {
        const sub = currentQuestion.subject || 'Geral';
        const top = currentQuestion.topic || 'Conceitos Gerais';
        
        const currentSubStats = prev.subjectStats[sub] || { answered: 0, correct: 0, wrong: 0, topics: {} };
        const currentTopStats = currentSubStats.topics[top] || { answered: 0, correct: 0, wrong: 0 };

        const updated: PerformanceAnalytics = {
          ...prev,
          totalAnswered: prev.totalAnswered + 1,
          totalCorrect: prev.totalCorrect + 1,
          bestStreakCombo: Math.max(prev.bestStreakCombo, nextStreak),
          totalXpEarned: prev.totalXpEarned + finalXP,
          subjectStats: {
            ...prev.subjectStats,
            [sub]: {
              ...currentSubStats,
              answered: currentSubStats.answered + 1,
              correct: currentSubStats.correct + 1,
              topics: {
                ...currentSubStats.topics,
                [top]: {
                  ...currentTopStats,
                  answered: currentTopStats.answered + 1,
                  correct: currentTopStats.correct + 1
                }
              }
            }
          },
          recentQuestionsLog: [
            {
              id: `q-log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              date: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
              question: currentQuestion,
              selectedOptionId: selectedOptionId,
              isCorrect: true
            },
            ...prev.recentQuestionsLog.slice(0, 39)
          ]
        };

        try {
          localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
          console.warn('Erro ao salvar no localStorage:', error);
        }

        if (currentUser) {
          recordQuestionAnswer(currentUser.uid, prev, {
            question: currentQuestion,
            isCorrect: true,
            selectedOptionId,
            xpEarned: finalXP,
            seconds: elapsedSeconds,
            streakMultiplier: nextStreak
          }).catch(console.warn);
        }

        return updated;
      });
    } else {
      // Errou: perde 1 vida com animação de quebra/desaparecimento
      const lostIndex = lives; // 3, 2, ou 1
      setLastLostLife(lostIndex);
      const newLives = Math.max(0, lives - 1);
      setLives(newLives);
      setStreakMultiplier(1);
      setHasWrongAttempt(true);
      setShowAiHint(true);
      playSound('wrong');
      setAnsweredHistory(prev => [...prev, { isCorrect: false, question: currentQuestion }]);

      // Atualizar Analytics de Desempenho (Erro)
      setAnalytics(prev => {
        const sub = currentQuestion.subject || 'Geral';
        const top = currentQuestion.topic || 'Conceitos Gerais';
        
        const currentSubStats = prev.subjectStats[sub] || { answered: 0, correct: 0, wrong: 0, topics: {} };
        const currentTopStats = currentSubStats.topics[top] || { answered: 0, correct: 0, wrong: 0 };

        const updated: PerformanceAnalytics = {
          ...prev,
          totalAnswered: prev.totalAnswered + 1,
          totalWrong: prev.totalWrong + 1,
          subjectStats: {
            ...prev.subjectStats,
            [sub]: {
              ...currentSubStats,
              answered: currentSubStats.answered + 1,
              wrong: currentSubStats.wrong + 1,
              topics: {
                ...currentSubStats.topics,
                [top]: {
                  ...currentTopStats,
                  answered: currentTopStats.answered + 1,
                  wrong: currentTopStats.wrong + 1
                }
              }
            }
          },
          recentQuestionsLog: [
            {
              id: `q-log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              date: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
              question: currentQuestion,
              selectedOptionId: selectedOptionId,
              isCorrect: false
            },
            ...prev.recentQuestionsLog.slice(0, 39)
          ]
        };

        try {
          localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
          console.warn('Erro ao salvar no localStorage:', error);
        }

        if (currentUser) {
          recordQuestionAnswer(currentUser.uid, prev, {
            question: currentQuestion,
            isCorrect: false,
            selectedOptionId,
            xpEarned: 0,
            seconds: elapsedSeconds,
            streakMultiplier: 1
          }).catch(console.warn);
        }

        return updated;
      });

      if (newLives === 0) {
        // Game Over!
        if (gameoverTimerRef.current) clearTimeout(gameoverTimerRef.current);
        gameoverTimerRef.current = setTimeout(() => {
          playSound('gameover');
          setGameStatus('gameover');

          // Salvar Sessão no Histórico
          setAnalytics(prev => {
            const currentTotal = answeredHistory.length + 1;
            const currentCorrect = answeredHistory.filter(h => h.isCorrect).length;
            const currentAccuracy = currentTotal > 0 ? Math.round((currentCorrect / currentTotal) * 100) : 0;

            const modeLabel = 
              gameMode === 'endurance' ? 'Modo Endurance Progressivo' :
              gameMode === 'math_arcade' ? 'Cálculo Mental Arcade' :
              gameMode === 'periodic_table' ? 'Tabela Periódica' :
              gameMode === 'enem_formulas' ? 'Fórmulas ENEM' : 'Simulado Autoral';

            const newSession: PerformanceSessionHistory = {
              id: `sess-${Date.now()}`,
              date: `${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
              gameMode: modeLabel,
              score,
              xpEarned,
              accuracy: currentAccuracy,
              totalQuestions: currentTotal,
              correctQuestions: currentCorrect,
              maxCombo,
              elapsedSeconds
            };

            const updatedSessionAnalytics: PerformanceAnalytics = {
              ...prev,
              totalSecondsPlayed: prev.totalSecondsPlayed + elapsedSeconds,
              sessionsHistory: [newSession, ...prev.sessionsHistory.slice(0, 19)]
            };

            try {
              localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(updatedSessionAnalytics));
            } catch (error) {
              console.warn('Erro ao salvar no localStorage:', error);
            }

            // Persistir no Supabase
            saveGamificationProgress({
              xpEarned,
              score,
              streak: streakMultiplier > 1 ? (userProfile?.streak || streakCount) + 1 : (userProfile?.streak || streakCount),
              answeredCount: currentTotal,
              correctCount: currentCorrect
            });

            if (currentUser) {
              recordSessionCompleted(currentUser.uid, newSession, prev).catch(console.warn);
            }

            // Ativar Modal de Resumo com Gráfico Donut Recharts
            const finalSummary: PostTrainingSummaryData = {
              score,
              xpEarned,
              totalQuestions: currentTotal,
              correctQuestions: currentCorrect,
              wrongQuestions: currentTotal - currentCorrect,
              accuracy: currentAccuracy,
              elapsedSeconds,
              maxCombo,
              gameModeLabel: modeLabel,
              answeredLog: [
                ...answeredHistory.map(h => ({
                  question: h.question,
                  selectedOptionId: h.selectedOptionId || 'A',
                  isCorrect: h.isCorrect
                })),
                {
                  question: currentQuestion,
                  selectedOptionId: selectedOptionId || 'A',
                  isCorrect: false
                }
              ]
            };
            setSummaryModalData(finalSummary);
            setIsSummaryModalOpen(true);

            return updatedSessionAnalytics;
          });
        }, 1200);

      }
    }
  };

  // Avançar para próxima pergunta infinita
  const handleNextInfiniteQuestion = () => {
    if (lives <= 0) {
      setGameStatus('gameover');
      return;
    }
    playSound('click');
    setQuestionNumber(prev => prev + 1);
    setSelectedOptionId(null);
    setIsAnswerConfirmed(false);
    setShowAiHint(false);
    setHasWrongAttempt(false);
    setCurrentQuestion(generateNextQuestion(gameMode, difficulty, elapsedSeconds));
  };

  // Desistir / Pausar para o Lobby
  const handleExitToLobby = () => {
    playSound('click');
    setGameStatus('lobby');
  };

  // Suporte a Atalhos de Teclado (Teclas 1, 2, 3, 4, 5 / A, B, C, D, E e Enter / Espaço)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Apenas atua se a aba for 'game', o jogo estiver ativo e houver pergunta
      if (activeTab !== 'game' || gameStatus !== 'playing' || !currentQuestion) return;

      // Não intercepta se o foco estiver num input, textarea ou elemento editável
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || (activeEl as HTMLElement).isContentEditable)) {
        return;
      }

      const key = e.key.toLowerCase();

      if (!isAnswerConfirmed) {
        if (key === '1' || key === 'a') {
          e.preventDefault();
          if (currentQuestion.options[0]) handleSelectOption(currentQuestion.options[0].id);
        } else if (key === '2' || key === 'b') {
          e.preventDefault();
          if (currentQuestion.options[1]) handleSelectOption(currentQuestion.options[1].id);
        } else if (key === '3' || key === 'c') {
          e.preventDefault();
          if (currentQuestion.options[2]) handleSelectOption(currentQuestion.options[2].id);
        } else if (key === '4' || key === 'd') {
          e.preventDefault();
          if (currentQuestion.options[3]) handleSelectOption(currentQuestion.options[3].id);
        } else if (key === '5' || key === 'e') {
          e.preventDefault();
          if (currentQuestion.options[4]) handleSelectOption(currentQuestion.options[4].id);
        } else if (key === 'enter' || key === ' ') {
          e.preventDefault();
          if (selectedOptionId) {
            handleConfirmAnswer();
          }
        }
      } else {
        // Se a resposta já foi confirmada, Enter, Espaço ou Seta Direita avançam para a próxima pergunta
        if (key === 'enter' || key === ' ' || key === 'arrowright') {
          e.preventDefault();
          handleNextInfiniteQuestion();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, gameStatus, currentQuestion, isAnswerConfirmed, selectedOptionId]);

  // =========================================================================
  // ESTADO DO FORMULÁRIO DO PROFESSOR (AUTORIA EMBUTIDA NA PÁGINA)
  // =========================================================================
  const [formSubject, setFormSubject] = useState(SUBJECT_OPTIONS[0]);
  const [formCustomSubject, setFormCustomSubject] = useState('');
  const [formTopic, setFormTopic] = useState('');
  const [formDifficulty, setFormDifficulty] = useState<'Fácil' | 'Médio' | 'Difícil'>('Médio');
  const [formStatement, setFormStatement] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formImageCaption, setFormImageCaption] = useState('');
  const [formCodeSnippet, setFormCodeSnippet] = useState('');
  const [formEnableOptionE, setFormEnableOptionE] = useState(false);
  const [formCorrectOption, setFormCorrectOption] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('A');
  const [formOptions, setFormOptions] = useState({
    A: '',
    B: '',
    C: '',
    D: '',
    E: ''
  });
  const [formExplanation, setFormExplanation] = useState('');
  const [formAiHint, setFormAiHint] = useState('');
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string, ms = 3000) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setSuccessToast(msg);
    toastTimerRef.current = setTimeout(() => setSuccessToast(null), ms);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);
  const [showSavedQuestionsList, setShowSavedQuestionsList] = useState(false);
  const [teacherSearch, setTeacherSearch] = useState('');
  const [teacherSubjectFilter, setTeacherSubjectFilter] = useState('all');
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);

  // Estados do Wizard Multietapas do Professor
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [previewRole, setPreviewRole] = useState<'student' | 'teacher'>('student');
  const [previewSelectedOption, setPreviewSelectedOption] = useState<string | null>(null);
  const [previewIsConfirmed, setPreviewIsConfirmed] = useState(false);
  const [previewShowHint, setPreviewShowHint] = useState(false);

  // Preenchimento de Exemplos no Formulário
  const loadExamplePhysics = () => {
    playSound('click');
    setEditingQuestionId(null);
    setFormSubject('Física Clássica & Moderna');
    setFormTopic('Circuitos Elétricos & Associação de Resistores');
    setFormDifficulty('Médio');
    setFormStatement('Analise o circuito elétrico ilustrado no esquema abaixo contendo resistores alimentados por uma fonte de tensão contínua. Sabendo que a corrente total que sai da fonte é 2 A, determine a potência total dissipada por efeito Joule no circuito.');
    setFormImageUrl('https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?auto=format&fit=crop&w=800&q=80');
    setFormImageCaption('Figura 1: Diagrama esquemático de resistores ôhmicos no laboratório.');
    setFormCodeSnippet('P_total = V · I = Req · I²');
    setFormEnableOptionE(true);
    setFormCorrectOption('B');
    setFormOptions({
      A: '40 Watts',
      B: '80 Watts',
      C: '120 Watts',
      D: '160 Watts',
      E: '200 Watts'
    });
    setFormExplanation('Correto! Com resistência equivalente Req = 20 Ω e corrente I = 2 A: P = Req · I² = 20 · (2)² = 20 · 4 = 80 Watts.');
    setFormAiHint('Lembre-se da fórmula de potência dissipada por efeito Joule: P = R · I² ou P = V · I.');
    setWizardStep(1);
    showToast('Exemplo de Física carregado no formulário!');
  };

  const loadExampleBiology = () => {
    playSound('click');
    setEditingQuestionId(null);
    setFormSubject('Biologia & Genética');
    setFormTopic('Estrutura Celular & Mitocôndrias');
    setFormDifficulty('Fácil');
    setFormStatement('A organela citoplasmática mostrada na micrografia eletrônica abaixo possui membrana dupla, cristas internas e DNA próprio. Qual é a sua função primordial na célula eucariótica?');
    setFormImageUrl('https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=800&q=80');
    setFormImageCaption('Micrografia: Organela celular responsável pela respiração celular aeróbica.');
    setFormCodeSnippet('');
    setFormEnableOptionE(true);
    setFormCorrectOption('A');
    setFormOptions({
      A: 'Respiração celular aeróbia e síntese massiva de ATP via fosforilação oxidativa.',
      B: 'Síntese e empacotamento de proteínas para exportação extracelular.',
      C: 'Digestão intracelular de macromoléculas através de enzimas hidrolíticas.',
      D: 'Degradação de peróxido de hidrogênio e oxidação de ácidos graxos.',
      E: 'Fotossíntese e fixação do carbono atmosférico na fase escura.'
    });
    setFormExplanation('Correto! As mitocôndrias são as usinas energéticas da célula eucarionte, gerando ATP através do ciclo de Krebs e da cadeia respiratória.');
    setFormAiHint('Observe as cristas mitocondriais e recorde a Teoria da Endossimbiose (organela com DNA próprio circular).');
    setWizardStep(1);
    showToast('Exemplo de Biologia carregado no formulário!');
  };

  const loadExampleChemistry = () => {
    playSound('click');
    setEditingQuestionId(null);
    setFormSubject('Química Orgânica & Inorgânica');
    setFormTopic('Equilíbrio Químico & Princípio de Le Chatelier');
    setFormDifficulty('Médio');
    setFormStatement('Considere a reação exotérmica de síntese da amônia pelo processo Haber-Bosch: N₂(g) + 3H₂(g) ⇌ 2NH₃(g) (ΔH < 0). De acordo com o Princípio de Le Chatelier, qual alteração deslocará o equilíbrio no sentido de favorecer a produção de amônia?');
    setFormImageUrl('');
    setFormImageCaption('');
    setFormCodeSnippet('N₂(g) + 3H₂(g) ⇌ 2NH₃(g)   ΔH = -92,4 kJ/mol');
    setFormEnableOptionE(true);
    setFormCorrectOption('C');
    setFormOptions({
      A: 'Aumento da temperatura do sistema.',
      B: 'Diminuição da pressão total do reator.',
      C: 'Aumento da pressão total sobre o sistema.',
      D: 'Remoção contínua de gás nitrogênio (N₂).',
      E: 'Adição de um catalisador de ferro sólido.'
    });
    setFormExplanation('Correto! O lado dos reagentes possui 4 mols gasosos e os produtos 2 mols. O aumento de pressão desloca o equilíbrio no sentido de menor volume gasoso (síntese de NH₃).');
    setFormAiHint('Lembre-se: aumentar a pressão total favorece o sentido com menor número de mols gasosos.');
    setWizardStep(1);
    showToast('Exemplo de Química carregado no formulário!');
  };

  const clearForm = () => {
    playSound('click');
    setEditingQuestionId(null);
    setWizardStep(1);
    setPreviewSelectedOption(null);
    setPreviewIsConfirmed(false);
    setPreviewShowHint(false);
    setFormSubject(SUBJECT_OPTIONS[0]);
    setFormCustomSubject('');
    setFormTopic('');
    setFormDifficulty('Médio');
    setFormStatement('');
    setFormImageUrl('');
    setFormImageCaption('');
    setFormCodeSnippet('');
    setFormEnableOptionE(false);
    setFormCorrectOption('A');
    setFormOptions({ A: '', B: '', C: '', D: '', E: '' });
    setFormExplanation('');
    setFormAiHint('');
  };

  const handleEditQuestionInForm = (q: QuizQuestion) => {
    playSound('click');
    setEditingQuestionId(q.id);
    setWizardStep(1);
    setPreviewSelectedOption(null);
    setPreviewIsConfirmed(false);
    setPreviewShowHint(false);
    const isStandardSubject = SUBJECT_OPTIONS.includes(q.subject);
    setFormSubject(isStandardSubject ? q.subject : 'Personalizado');
    if (!isStandardSubject) setFormCustomSubject(q.subject);
    setFormTopic(q.topic);
    setFormDifficulty(q.difficulty);
    setFormStatement(q.statement);
    setFormImageUrl(q.imageUrl || '');
    setFormImageCaption(q.imageCaption || '');
    setFormCodeSnippet(q.codeSnippet || '');
    setFormEnableOptionE(q.options.length > 4);

    const correct = q.options.find(o => o.isCorrect)?.id as any;
    setFormCorrectOption(correct || 'A');

    const newOpts = { A: '', B: '', C: '', D: '', E: '' };
    q.options.forEach(opt => {
      if (opt.id in newOpts) {
        newOpts[opt.id as keyof typeof newOpts] = opt.text;
      }
    });
    setFormOptions(newOpts);
    setFormExplanation(q.options.find(o => o.isCorrect)?.explanation || '');
    setFormAiHint(q.aiHint || '');

    // Rolar para o topo do formulário
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`Carregada para edição: "${q.topic}"`);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStatement.trim() || !formOptions.A.trim() || !formOptions.B.trim()) {
      alert('Por favor, preencha o enunciado e pelo menos as alternativas A e B.');
      return;
    }

    const finalSubject = formSubject === 'Personalizado' 
      ? (formCustomSubject.trim() || 'Geral') 
      : formSubject;
    const finalTopic = formTopic.trim() || 'Conceito Fundamental';

    const activeLetters = ['A', 'B', 'C', 'D'];
    if (formEnableOptionE) activeLetters.push('E');

    const newQuestion: QuizQuestion = {
      id: editingQuestionId || Date.now(),
      subject: finalSubject,
      topic: finalTopic,
      difficulty: formDifficulty,
      statement: formStatement.trim(),
      imageUrl: formImageUrl.trim() || undefined,
      imageCaption: formImageCaption.trim() || undefined,
      codeSnippet: formCodeSnippet.trim() || undefined,
      gameType: 'standard',
      options: activeLetters.map(letter => ({
        id: letter,
        text: formOptions[letter as keyof typeof formOptions]?.trim() || `Alternativa ${letter}`,
        isCorrect: formCorrectOption === letter,
        explanation: formCorrectOption === letter
          ? (formExplanation.trim() || 'Resposta correta!')
          : 'Alternativa incorreta.'
      })),
      aiHint: formAiHint.trim() || 'Analise a teoria fundamental e as relações lógicas da questão.'
    };

    if (editingQuestionId) {
      updateQuestion(String(editingQuestionId), newQuestion).catch(console.warn);
      setCustomQuestions(prev => prev.map(q => q.id === editingQuestionId ? newQuestion : q));
      setSuccessToast('Questão atualizada com sucesso no banco de dados!');
    } else {
      createQuestion(newQuestion, {
        uid: currentUser?.uid || 'professor-anon',
        displayName: userProfile?.displayName || 'Professor Mendonça',
        email: currentUser?.email || ''
      }).catch(console.warn);
      setCustomQuestions(prev => [newQuestion, ...prev]);
    }

    clearForm();
    showToast('Nova questao gravada com sucesso no Supabase!', 3500);
  };

  const handleDeleteQuestion = async (id: number | string) => {
    playSound('click');
    setCustomQuestions(prev => prev.filter(q => q.id !== id));
    await deleteQuestion(String(id)).catch(console.warn);
    if (editingQuestionId === id) clearForm();
    showToast('Questão removida do Firebase com sucesso.');
  };

  const filteredQuestions = useMemo(() => {
    return customQuestions.filter(q => {
      const matchSearch = q.statement.toLowerCase().includes(teacherSearch.toLowerCase()) ||
                          q.topic.toLowerCase().includes(teacherSearch.toLowerCase()) ||
                          q.subject.toLowerCase().includes(teacherSearch.toLowerCase());
      const matchSub = teacherSubjectFilter === 'all' || q.subject === teacherSubjectFilter;
      return matchSearch && matchSub;
    });
  }, [customQuestions, teacherSearch, teacherSubjectFilter]);

  return (
    <div className="h-full overflow-y-auto max-w-5xl mx-auto pb-24 pr-1 relative select-none">
      
      {/* Toast de Sucesso */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-[300000] px-5 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl shadow-2xl text-xs font-extrabold flex items-center gap-2.5 border border-slate-700/50 dark:border-slate-300/50 backdrop-blur-md"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Zoom de Imagem */}
      <AnimatePresence>
        {zoomImageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomImageUrl(null)}
            className="fixed inset-0 z-[400000] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.92 }}
              className="relative max-w-4xl max-h-[85vh] bg-slate-900 rounded-3xl overflow-hidden p-3 border border-slate-800 shadow-2xl"
            >
              <img src={zoomImageUrl} alt="Visualização ampliada" className="max-h-[80vh] w-auto object-contain rounded-2xl mx-auto" />
              <button
                onClick={() => setZoomImageUrl(null)}
                className="absolute top-5 right-5 p-2 bg-slate-800/90 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                ✕ Fechar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. SELETOR PRINCIPAL DE ABAS (CENTRO DE TREINO vs DASHBOARD vs ESTÚDIO DO PROFESSOR) */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
          <button
            type="button"
            onClick={() => {
              playSound('click');
              setActiveTab('game');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'game'
                ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-xs scale-102'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4 text-cyan-500 fill-cyan-500" />
            <span>Centro de Treino</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playSound('click');
              setActiveTab('dashboard');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs scale-102'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-500" />
            <span>Dashboard & Curvas</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playSound('click');
              setActiveTab('leaderboard');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'leaderboard'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs scale-102'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Ranking Global & Amigos</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playSound('click');
              setActiveTab('teacher');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'teacher'
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs scale-102'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-purple-500" />
            <span>Estúdio de Criação ({customQuestions.length})</span>
          </button>
        </div>

        {/* Recorde e Info */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              playSound('click');
              setActiveTab('leaderboard');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200/80 dark:border-amber-900/60 text-amber-700 dark:text-amber-300 text-xs font-bold transition-all cursor-pointer"
            title="Ver Ranking Global"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>Recorde: {highScore} pts</span>
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200/80 dark:border-cyan-900/60 text-cyan-700 dark:text-cyan-300 text-xs font-bold">
            <Flame className="w-3.5 h-3.5 text-cyan-500" />
            <span>{streakCount} Dias Seguidos</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ABA 1: CENTRO DE TREINO SURVIVAL & ENDURANCE                              */}
      {/* ========================================================================= */}
      {activeTab === 'game' && (
        <div className="space-y-6">
          
          {/* 1.1 TELA LOBBY / MENU DE INÍCIO */}
          {gameStatus === 'lobby' && (
            <GameLobby
              analytics={analytics}
              customQuestionsCount={customQuestions.length}
              gameMode={gameMode}
              onGameModeChange={setGameMode}
              difficulty={difficulty}
              onDifficultyChange={setDifficulty}
              burstParticles={burstParticles}
              onTriggerModeBurst={triggerModeBurst}
              onStartSurvival={handleStartSurvival}
              onNavigateTab={setActiveTab}
            />
          )}

          {/* 1.2 TELA DE JOGO ATIVO (SURVIVAL & ENDLESS) */}
          {gameStatus === 'playing' && currentQuestion && (
            <div className="space-y-5">
              
              {/* HUD Superior Fixo de Jogo */}
              <GameHUD
                formatTime={formatTime}
                elapsedSeconds={elapsedSeconds}
                questionNumber={questionNumber}
                gameMode={gameMode}
                lives={lives}
                lastLostLife={lastLostLife}
                streakMultiplier={streakMultiplier}
                score={score}
                onExitToLobby={handleExitToLobby}
              />

              <QuestionCard
                currentQuestion={currentQuestion}
                selectedOptionId={selectedOptionId}
                isAnswerConfirmed={isAnswerConfirmed}
                showAiHint={showAiHint}
                hasWrongAttempt={hasWrongAttempt}
                onSelectOption={handleSelectOption}
                onConfirmAnswer={handleConfirmAnswer}
                onNextQuestion={handleNextInfiniteQuestion}
                onSetZoomImageUrl={setZoomImageUrl}
                onToggleHint={() => setShowAiHint(!showAiHint)}
                onPlaySound={playSound}
              />
            </div>
          )}

          {/* 1.3 TELA DE FIM DE JOGO (SURVIVAL CONCLUÍDO / GAME OVER) */}
          {gameStatus === 'gameover' && (
            <GameOver
              score={score}
              highScore={highScore}
              xpEarned={xpEarned}
              maxCombo={maxCombo}
              elapsedSeconds={elapsedSeconds}
              answeredHistory={answeredHistory}
              formatTime={formatTime}
              onShowSummary={() => setIsSummaryModalOpen(true)}
              onPlayAgain={() => handleStartSurvival()}
              onViewDashboard={() => { playSound('click'); setActiveTab('dashboard'); }}
              onViewLeaderboard={() => { playSound('click'); setActiveTab('leaderboard'); }}
              onExitToLobby={handleExitToLobby}
            />
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 2: DASHBOARD DE DESEMPENHO E DIAGNÓSTICO DE ERROS                     */}
      {/* ========================================================================= */}
      {activeTab === 'dashboard' && (
        <PerformanceDashboard
          analytics={analytics}
          onStartFocusedPractice={handleStartFocusedPractice}
          onNavigate={onNavigate}
          onResetAnalytics={handleResetAnalytics}
        />
      )}

      {/* ========================================================================= */}
      {/* ABA 3: RANKING GLOBAL & COMUNIDADE DE COMPETIDORES                        */}
      {/* ========================================================================= */}
      {activeTab === 'leaderboard' && (
        <GlobalLeaderboard
          userStreak={streakCount}
          userHighScore={highScore}
          userTotalXp={analytics.totalXpEarned}
          userAccuracy={analytics.totalAnswered > 0 ? Math.round((analytics.totalCorrect / analytics.totalAnswered) * 100) : 80}
          onStartChallenge={(mode) => {
            playSound('click');
            if (mode === 'endurance') {
              setGameMode('endurance');
              handleStartSurvival('endurance');
            } else {
              setGameMode('enem_formulas');
              handleStartSurvival('enem_formulas');
            }
            setActiveTab('game');
          }}
          onNavigate={onNavigate}
        />
      )}

      {/* ========================================================================= */}
      {/* ABA 4: ESTÚDIO DE CRIAÇÃO DO PROFESSOR (AUTORIA EMBUTIDA NA PÁGINA)       */}
      {/* ========================================================================= */}
      {activeTab === 'teacher' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header do Estúdio */}
          <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-500/30 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/40">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Laboratório de Autoria do Professor</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white font-display">
                  {editingQuestionId ? '✏️ Editando Questão do Banco' : '✨ Criador de Questões Autorais'}
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Defina enunciados, alternativas, gabarito instantâneo, fórmulas e **anexe imagens ilustrativas por URL** para enriquecer o banco de treinos.
                </p>
              </div>

              {/* Botões de Exemplos e Ação Rápida */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={loadExamplePhysics}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-400/30 text-xs font-bold transition-all cursor-pointer"
                  title="Carregar exemplo ilustrado de Física"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-purple-300" />
                  <span>Exemplo Física (c/ Imagem)</span>
                </button>

                <button
                  type="button"
                  onClick={loadExampleBiology}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border border-blue-400/30 text-xs font-bold transition-all cursor-pointer"
                  title="Carregar exemplo de Biologia Celular"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                  <span>Exemplo Bio</span>
                </button>

                <button
                  type="button"
                  onClick={loadExampleChemistry}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 text-xs font-bold transition-all cursor-pointer"
                  title="Carregar exemplo de Química"
                >
                  <FlaskConical className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Exemplo Química</span>
                </button>

                <button
                  type="button"
                  onClick={clearForm}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
                  title="Limpar e criar nova questão"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Novo / Limpar</span>
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* WIZARD MULTIETAPAS DE CRIAÇÃO DO PROFESSOR COM PREVIEW EM CARD AO VIVO    */}
          {/* ========================================================================= */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-6">
            
            {/* 🧭 BARRA DE ETAPAS (PROGRESS STEPPER) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
                <span>Passo {wizardStep} de 4</span>
                <span>{wizardStep === 1 ? 'Identificação & Enunciado' : wizardStep === 2 ? 'Mídias & Fórmulas' : wizardStep === 3 ? 'Alternativas & Gabarito' : 'Card Preview & Salvar'}</span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { step: 1 as const, title: '1. Enunciado', desc: 'Dados & Problema', icon: FileQuestion },
                  { step: 2 as const, title: '2. Mídias', desc: 'Imagens & Fórmulas', icon: ImageIcon },
                  { step: 3 as const, title: '3. Alternativas', desc: 'Gabarito em 1-Clique', icon: Layers },
                  { step: 4 as const, title: '4. Preview Card', desc: 'Simulação & Salvar', icon: Eye }
                ].map((s) => {
                  const isActive = wizardStep === s.step;
                  const isDone = wizardStep > s.step;
                  return (
                    <button
                      key={s.step}
                      type="button"
                      onClick={() => {
                        if (s.step === 4 && (!formStatement.trim() || !formOptions.A.trim())) {
                          showToast('Preencha o enunciado e alternativas antes do preview.');
                          return;
                        }
                        setWizardStep(s.step);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                        isActive
                          ? 'bg-purple-50 dark:bg-purple-950/70 border-purple-500 ring-2 ring-purple-400/20 shadow-xs'
                          : isDone
                          ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-purple-300'
                          : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/60 dark:border-slate-800 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                        isActive
                          ? 'bg-purple-600 text-white shadow-xs'
                          : isDone
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                      }`}>
                        {isDone ? <Check className="w-4 h-4" /> : s.step}
                      </div>
                      <div className="min-w-0">
                        <span className={`text-xs font-bold block truncate ${isActive ? 'text-purple-700 dark:text-purple-300' : 'text-slate-800 dark:text-slate-200'}`}>
                          {s.title}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {s.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CONTEÚDO DAS ETAPAS */}
            <form onSubmit={handleSaveQuestion} className="space-y-6">

              {/* 📝 ETAPA 1: DADOS BÁSICOS & ENUNCIADO */}
              {wizardStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Disciplina / Matéria *
                      </label>
                      <select
                        value={formSubject}
                        onChange={(e) => setFormSubject(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        {SUBJECT_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                        <option value="Personalizado">Outra / Personalizada</option>
                      </select>
                      {formSubject === 'Personalizado' && (
                        <input
                          type="text"
                          required
                          value={formCustomSubject}
                          onChange={(e) => setFormCustomSubject(e.target.value)}
                          placeholder="Digite o nome da disciplina..."
                          className="mt-2 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-medium"
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Tópico ou Assunto Específico *
                      </label>
                      <input
                        type="text"
                        required
                        value={formTopic}
                        onChange={(e) => setFormTopic(e.target.value)}
                        placeholder="Ex: Circuitos Elétricos, Estequiometria..."
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Grau de Dificuldade
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(['Fácil', 'Médio', 'Difícil'] as const).map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => setFormDifficulty(d)}
                            className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                              formDifficulty === d
                                ? d === 'Fácil' ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs' :
                                  d === 'Médio' ? 'bg-amber-500 text-white border-amber-600 shadow-xs' :
                                  'bg-rose-500 text-white border-rose-600 shadow-xs'
                                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Enunciado do Problema / Pergunta *
                      </label>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {formStatement.length} caracteres
                      </span>
                    </div>
                    <textarea
                      rows={4}
                      required
                      value={formStatement}
                      onChange={(e) => setFormStatement(e.target.value)}
                      placeholder="Escreva com clareza a contextualização e a pergunta central que o aluno deverá responder..."
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-medium leading-relaxed"
                    />
                  </div>

                  {/* Barra de Navegação do Passo 1 */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={clearForm}
                      className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                    >
                      Limpar
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (!formStatement.trim()) {
                          showToast('Por favor, digite o enunciado da questão.');
                          return;
                        }
                        playSound('click');
                        setWizardStep(2);
                      }}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold shadow-md shadow-purple-500/20 transition-all cursor-pointer"
                    >
                      <span>Avançar para Mídias & Fórmulas</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* 🖼️ ETAPA 2: IMAGENS ILUSTRATIVAS & BLOCO DE FÓRMULAS */}
              {wizardStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-5"
                >
                  {/* Seção de Imagem por URL */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-50/60 to-pink-50/40 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200/70 dark:border-purple-900/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                        <ImageIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span>Imagem Ilustrativa de Referência (URL Pública)</span>
                      </label>
                      {formImageUrl && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Imagem Configurada
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Adicione links diretos de fotos, esquemas elétricos, mapas, fórmulas químicas ou gráficos (Unsplash, Imgur, CDN escolar).
                    </p>

                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={formImageUrl}
                        onChange={(e) => setFormImageUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/... ou link direto da imagem"
                        className="w-full bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                      />
                      {formImageUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormImageUrl('');
                            setFormImageCaption('');
                          }}
                          className="p-2 bg-white dark:bg-slate-800 text-rose-500 rounded-xl border border-rose-200 dark:border-rose-900 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                          title="Remover Imagem"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {formImageUrl && (
                      <input
                        type="text"
                        value={formImageCaption}
                        onChange={(e) => setFormImageCaption(e.target.value)}
                        placeholder="Legenda da Imagem (Ex: Figura 1: Esquema de associação de resistores)"
                        className="w-full bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none"
                      />
                    )}

                    {/* Live Preview da Imagem */}
                    {formImageUrl && (
                      <div className="mt-2 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
                        <img
                          src={formImageUrl}
                          alt="Preview"
                          className="max-h-48 w-auto object-contain rounded-lg shadow-sm"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                            const err = e.currentTarget.parentElement?.querySelector('.img-err') as HTMLElement;
                            if (err) err.style.display = 'flex';
                          }}
                        />
                        <div className="img-err hidden p-3 text-center text-xs text-rose-500 items-center justify-center gap-1.5">
                          <AlertCircle className="w-4 h-4" />
                          <span>Não foi possível carregar a imagem deste link direto. Verifique a URL.</span>
                        </div>
                        {formImageCaption && (
                          <p className="text-[11px] text-slate-500 italic mt-2 text-center">
                            {formImageCaption}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bloco de Código / Fórmulas Opcional */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <FileQuestion className="w-3.5 h-3.5 text-slate-400" />
                      <span>Equação, Fórmula Matemática ou Linha de Código (Opcional)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={formCodeSnippet}
                      onChange={(e) => setFormCodeSnippet(e.target.value)}
                      placeholder="Ex: P_total = V · I = Req · I²   ou   ΔS = v₀·t + (a·t²)/2"
                      className="w-full bg-slate-950 text-cyan-300 font-mono text-xs rounded-xl p-3 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none shadow-inner"
                    />
                  </div>

                  {/* Barra de Navegação do Passo 2 */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        playSound('click');
                        setWizardStep(1);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Voltar para Enunciado</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        playSound('click');
                        setWizardStep(3);
                      }}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold shadow-md shadow-purple-500/20 transition-all cursor-pointer"
                    >
                      <span>Avançar para Alternativas</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* 🔠 ETAPA 3: ALTERNATIVAS DE RESPOSTA & SELEÇÃO DO GABARITO */}
              {wizardStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Opções de Resposta & Gabarito *
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Clique na letra (A, B, C, D, E) para definir qual alternativa é a correta.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setFormEnableOptionE(!formEnableOptionE)}
                        className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                      >
                        {formEnableOptionE ? '− Remover Alternativa E' : '+ Adicionar Alternativa E (Padrão ENEM)'}
                      </button>
                      <span className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-extrabold border border-emerald-300/50">
                        Gabarito Eleito: ({formCorrectOption})
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {(['A', 'B', 'C', 'D', ...(formEnableOptionE ? ['E'] : [])] as const).map((letter) => {
                      const isCorrect = formCorrectOption === letter;
                      return (
                        <div
                          key={letter}
                          className={`flex items-center gap-3 p-2.5 rounded-2xl border transition-all ${
                            isCorrect
                              ? 'bg-purple-50/80 dark:bg-purple-950/60 border-purple-500 ring-2 ring-purple-400/20 shadow-xs'
                              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              playSound('correct');
                              setFormCorrectOption(letter);
                            }}
                            className={`w-9 h-9 rounded-xl font-black text-xs flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                              isCorrect
                                ? 'bg-purple-600 text-white shadow-xs scale-105'
                                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 hover:scale-102'
                            }`}
                            title={`Clique para definir Alternativa ${letter} como Gabarito Correto`}
                          >
                            {letter}
                          </button>

                          <input
                            type="text"
                            required={letter === 'A' || letter === 'B'}
                            value={formOptions[letter]}
                            onChange={(e) =>
                              setFormOptions((prev) => ({ ...prev, [letter]: e.target.value }))
                            }
                            placeholder={`Escreva o texto da alternativa ${letter}...`}
                            className="w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none font-medium"
                          />

                          {isCorrect ? (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-extrabold shrink-0 shadow-xs">
                              Gabarito ✓
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                playSound('correct');
                                setFormCorrectOption(letter);
                              }}
                              className="text-[10px] font-bold text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 shrink-0 cursor-pointer"
                            >
                              Marcar como correto
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Barra de Navegação do Passo 3 */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        playSound('click');
                        setWizardStep(2);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Voltar para Mídias</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (!formOptions.A.trim() || !formOptions.B.trim()) {
                          showToast('Preencha ao menos as alternativas A e B.');
                          return;
                        }
                        playSound('click');
                        setWizardStep(4);
                      }}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold shadow-md shadow-purple-500/20 transition-all cursor-pointer"
                    >
                      <span>Avançar para Preview do Card</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* 🎯 ETAPA 4: PEDAGOGIA & CARD PREVIEW INTERATIVO (ANTES DE SALVAR) */}
              {wizardStep === 4 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  {/* Resolução e Dica Pedagógica */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Resolução Comentada da Questão
                      </label>
                      <textarea
                        rows={3}
                        value={formExplanation}
                        onChange={(e) => setFormExplanation(e.target.value)}
                        placeholder="Explique passo a passo o raciocínio para o aluno aprender..."
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                        <span>Dica Sináptica (Ao Errar a Questão)</span>
                      </label>
                      <textarea
                        rows={3}
                        value={formAiHint}
                        onChange={(e) => setFormAiHint(e.target.value)}
                        placeholder="Dica orientadora que apoia o aluno sem entregar o gabarito..."
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* 📱 CARD PREVIEW INTERATIVO AO VIVO */}
                  <div className="p-4 sm:p-6 rounded-3xl bg-slate-50 dark:bg-slate-950/60 border-2 border-purple-200 dark:border-purple-900/60 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                          Card Preview Interativo ao Vivo
                        </span>
                      </div>

                      {/* Alternador de Modo: Aluno vs Professor */}
                      <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <button
                          type="button"
                          onClick={() => setPreviewRole('student')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            previewRole === 'student'
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                          }`}
                        >
                          👁️ Modo Simulado (Visão do Aluno)
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewRole('teacher')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            previewRole === 'teacher'
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                          }`}
                        >
                          👨‍🏫 Gabarito & Metadados
                        </button>
                      </div>
                    </div>

                    {/* CARD SIMULADO (Visão idêntica ao treino real) */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                      
                      {/* Topo do Card */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800">
                          {formSubject === 'Personalizado' ? (formCustomSubject || 'Personalizado') : formSubject}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 font-medium">{formTopic || 'Tópico Geral'}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                            formDifficulty === 'Fácil' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                            formDifficulty === 'Médio' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                            'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          }`}>
                            {formDifficulty}
                          </span>
                        </div>
                      </div>

                      {/* Enunciado */}
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">
                        {formStatement || 'O enunciado aparecerá aqui...'}
                      </p>

                      {/* Imagem do Card Preview */}
                      {formImageUrl && (
                        <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col items-center p-2 relative">
                          <img
                            src={formImageUrl}
                            alt="Ilustração da Questão"
                            className="max-h-56 w-auto object-contain rounded-lg shadow-2xs"
                          />
                          {formImageCaption && (
                            <p className="text-[11px] text-slate-500 italic mt-1.5 text-center">
                              {formImageCaption}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Bloco de Código / Fórmula */}
                      {formCodeSnippet && (
                        <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 font-mono text-xs text-cyan-300">
                          {formCodeSnippet}
                        </div>
                      )}

                      {/* Alternativas no Preview */}
                      <div className="space-y-2 pt-2">
                        {(['A', 'B', 'C', 'D', ...(formEnableOptionE ? ['E'] : [])] as const).map((letter) => {
                          const optionText = formOptions[letter] || `Alternativa ${letter}`;
                          const isCorrect = formCorrectOption === letter;
                          const isSelectedInStudentMode = previewSelectedOption === letter;

                          // Estilização no Modo Aluno vs Modo Professor
                          let optionClass = 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200';
                          
                          if (previewRole === 'teacher') {
                            if (isCorrect) {
                              optionClass = 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold';
                            }
                          } else {
                            if (previewIsConfirmed) {
                              if (isCorrect) {
                                optionClass = 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold';
                              } else if (isSelectedInStudentMode && !isCorrect) {
                                optionClass = 'bg-rose-50 dark:bg-rose-950/70 border-rose-500 text-rose-900 dark:text-rose-200 font-bold line-through';
                              }
                            } else if (isSelectedInStudentMode) {
                              optionClass = 'bg-purple-50 dark:bg-purple-950/70 border-purple-500 text-purple-900 dark:text-purple-200 font-bold';
                            }
                          }

                          return (
                            <button
                              key={letter}
                              type="button"
                              onClick={() => {
                                if (previewRole === 'student' && !previewIsConfirmed) {
                                  playSound('click');
                                  setPreviewSelectedOption(letter);
                                }
                              }}
                              className={`w-full p-3 rounded-xl border text-left flex items-center justify-between gap-3 text-xs transition-all cursor-pointer ${optionClass}`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                  (previewRole === 'teacher' && isCorrect) || (previewIsConfirmed && isCorrect)
                                    ? 'bg-emerald-600 text-white'
                                    : isSelectedInStudentMode
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                }`}>
                                  {letter}
                                </span>
                                <span>{optionText}</span>
                              </div>

                              {previewRole === 'teacher' && isCorrect && (
                                <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold shrink-0">
                                  Gabarito Oficial ✓
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Ações de Teste no Modo Aluno */}
                      {previewRole === 'student' && (
                        <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              playSound('hint');
                              setPreviewShowHint(!previewShowHint);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold cursor-pointer"
                          >
                            <Lightbulb className="w-3.5 h-3.5" />
                            <span>{previewShowHint ? 'Ocultar Dica' : 'Testar Dica Sináptica'}</span>
                          </button>

                          <div className="flex items-center gap-2">
                            {previewIsConfirmed ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setPreviewSelectedOption(null);
                                  setPreviewIsConfirmed(false);
                                  setPreviewShowHint(false);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
                              >
                                Testar Novamente
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={!previewSelectedOption}
                                onClick={() => {
                                  if (previewSelectedOption === formCorrectOption) {
                                    playSound('correct');
                                    confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
                                  } else {
                                    playSound('wrong');
                                  }
                                  setPreviewIsConfirmed(true);
                                }}
                                className="px-4 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-bold disabled:opacity-40 cursor-pointer shadow-xs"
                              >
                                Simular Resposta
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Dica Sináptica Aberta no Preview */}
                      {(previewShowHint || previewRole === 'teacher') && formAiHint && (
                        <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold block">Dica Pedagógica Cadastrada:</span>
                            <span>{formAiHint}</span>
                          </div>
                        </div>
                      )}

                      {/* Resolução Comentada no Modo Professor */}
                      {previewRole === 'teacher' && formExplanation && (
                        <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold block">Resolução Comentada do Gabarito:</span>
                            <span>{formExplanation}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Barra de Navegação e Botão de Salvar da Etapa 4 */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        playSound('click');
                        setWizardStep(3);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Voltar para Alternativas</span>
                    </button>

                    <button
                      type="submit"
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-extrabold shadow-lg shadow-purple-500/25 transition-all cursor-pointer scale-102"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{editingQuestionId ? 'Atualizar Questão no Banco' : 'Salvar no Meu Banco de Questões'}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </form>
          </div>

          {/* GAVETA / PAINEL DE QUESTÕES SALVAS */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-500" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white font-display">
                  Suas Questões Salvas ({customQuestions.length})
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setGameMode('teacher_custom');
                    setActiveTab('game');
                    handleStartSurvival();
                  }}
                  disabled={customQuestions.length === 0}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Simulado com Minhas Questões</span>
                </button>
              </div>
            </div>

            {/* Filtros da Lista */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={teacherSearch}
                  onChange={(e) => setTeacherSearch(e.target.value)}
                  placeholder="Buscar questão por termo ou tópico..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-800 dark:text-slate-200"
                />
              </div>

              <select
                value={teacherSubjectFilter}
                onChange={(e) => setTeacherSubjectFilter(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
              >
                <option value="all">Todas as Disciplinas</option>
                {Array.from(new Set(customQuestions.map(q => q.subject))).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Itens da Lista */}
            {filteredQuestions.length > 0 ? (
              <div className="space-y-2.5 pt-2">
                {filteredQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300">
                          {q.subject}
                        </span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{q.topic}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          q.difficulty === 'Fácil' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50' :
                          q.difficulty === 'Médio' ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/50' :
                          'text-rose-600 bg-rose-50 dark:bg-rose-950/50'
                        }`}>
                          {q.difficulty}
                        </span>
                        {q.imageUrl && (
                          <span className="text-[10px] text-pink-600 font-bold flex items-center gap-0.5">
                            <ImageIcon className="w-3 h-3" /> Imagem
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">
                        {q.statement}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleEditQuestionInForm(q)}
                        className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 border border-slate-200 dark:border-slate-600 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                Nenhuma questão encontrada com os filtros selecionados.
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Modal de Resumo de Desempenho Pós-Treino com Donut Chart Recharts */}
      <PostTrainingSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        onPlayAgain={() => {
          setIsSummaryModalOpen(false);
          handleStartSurvival();
        }}
        onViewDashboard={() => {
          setIsSummaryModalOpen(false);
          setActiveTab('dashboard');
        }}
        onViewLeaderboard={() => {
          setIsSummaryModalOpen(false);
          onNavigate('ranking');
        }}
        onOpenCaderno={() => {
          setIsSummaryModalOpen(false);
          onNavigate('caderno');
        }}
        data={summaryModalData || undefined}
        summaryData={summaryModalData || undefined}
      />
    </div>
  );
};
