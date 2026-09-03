import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ScreenId } from '../types/design';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Flame,
  Clock,
  Play,
  Target,
  Trophy,
  CheckCircle2,
  X,
  Compass,
  ChevronDown,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DailyLearningGoal } from './DailyLearningGoal';
import { StudyTimeSummaryCard } from './StudyTimeSummaryCard';
import { StudyBadgesAndRewards } from './StudyBadgesAndRewards';
import { TARGET_EXAMS, calculateExamCountdown } from '../utils/examCountdown';

interface HomeDashboardProps {
  onNavigate: (screen: ScreenId) => void;
  streakCount: number;
}

export type FocusLevel = 'facil' | 'medio' | 'dificil';

interface FocusPlan {
  id: FocusLevel;
  name: string;
  tag: string;
  questionsTotal: number;
  dailyAverage: string;
  estimatedTime: string;
  xpReward: number;
  badge: string;
  color: string;
  borderColor: string;
  bgGradient: string;
  buttonColor: string;
  description: string;
  instructions: string[];
}

const FOCUS_PLANS: FocusPlan[] = [
  {
    id: 'facil',
    name: 'Foco Fácil',
    tag: 'Iniciante / Hábito',
    questionsTotal: 50,
    dailyAverage: '7 questões/dia',
    estimatedTime: '15 - 20 min diários',
    xpReward: 250,
    badge: '🥉 Bronze',
    color: '#0284C7',
    borderColor: 'border-sky-300 dark:border-sky-700',
    bgGradient: 'from-sky-50 to-blue-50 dark:from-sky-950/40 dark:to-blue-950/40',
    buttonColor: 'bg-sky-600 hover:bg-sky-700 text-white',
    description: 'Consolidação gradual da rotina de estudos com foco na retenção de conceitos básicos e fórmulas fundamentais.',
    instructions: [
      'Resolver 50 questões no modo Treino durante os 7 dias da semana.',
      'Média diária de cerca de 7 a 8 exercícios comentados.',
      'Revisão leve de erros e consolidação com a IA da Plataforma Mendonça.',
      'Garante +250 XP e Insígnia Foco Bronze no perfil.'
    ]
  },
  {
    id: 'medio',
    name: 'Foco Médio',
    tag: '⭐ Mais Escolhido',
    questionsTotal: 100,
    dailyAverage: '14 questões/dia',
    estimatedTime: '35 - 45 min diários',
    xpReward: 600,
    badge: '🥈 Prata',
    color: '#2563EB',
    borderColor: 'border-blue-400 dark:border-blue-600',
    bgGradient: 'from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40',
    buttonColor: 'bg-blue-600 hover:bg-blue-700 text-white',
    description: 'Equilíbrio ideal entre velocidade e profundidade para estudantes que buscam alto rendimento e retenção no Grafo.',
    instructions: [
      'Resolver 100 questões no modo Treino ao longo de 7 dias.',
      'Média diária de 14 a 15 questões divididas por disciplinas.',
      'Taxa de acerto recomendada de 75%+ nos simulados diários.',
      'Garante +600 XP e Insígnia Foco Prata no perfil.'
    ]
  },
  {
    id: 'dificil',
    name: 'Foco Difícil',
    tag: '🔥 Alta Performance',
    questionsTotal: 200,
    dailyAverage: '28 questões/dia',
    estimatedTime: '75 - 90 min diários',
    xpReward: 1500,
    badge: '🥇 Mestre Mendonça',
    color: '#7C3AED',
    borderColor: 'border-purple-400 dark:border-purple-600',
    bgGradient: 'from-purple-50 to-violet-50 dark:from-purple-950/40 dark:to-violet-950/40',
    buttonColor: 'bg-purple-600 hover:bg-purple-700 text-white',
    description: 'Imersão intensiva e maratona de resolução para candidatos a cursos de alta concorrência (Medicina, Computação e Engenharia).',
    instructions: [
      'Resolver 200 questões de nível intermediário/avançado em 1 semana.',
      'Média diária de 28 a 30 questões com controle de tempo de prova.',
      'Mapeamento completo dos nós neurais com maior incidência.',
      'Garante +1.500 XP e Insígnia Mestre do Foco no perfil.'
    ]
  }
];

const SLIDE_COUNT = 4;

export const HomeDashboard: React.FC<HomeDashboardProps> = ({ onNavigate, streakCount }) => {
  const { userProfile } = useAuth();

  // Estado do Exame Selecionado para Contagem Regressiva Real
  const [selectedExamId, setSelectedExamId] = useState<string>('enem-dia-1');
  const [isExamDropdownOpen, setIsExamDropdownOpen] = useState(false);
  const [countdownTick, setCountdownTick] = useState(0);

  // Slide atual do dashboard (0..3), navegado pelas setas
  const [activeSlide, setActiveSlide] = useState(0);

  // Foco Modal & Active State
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
  const [selectedFocusPlan, setSelectedFocusPlan] = useState<FocusLevel>('medio');
  const [activeFocus, setActiveFocus] = useState<{
    level: FocusLevel;
    completed: number;
    total: number;
    daysLeft: number;
  }>({
    level: 'medio',
    completed: 0,
    total: 100,
    daysLeft: 7
  });

  // Atualização do Cronômetro do Exame a cada minuto/segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownTick(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentExam = useMemo(() => {
    return TARGET_EXAMS.find(e => e.id === selectedExamId) || TARGET_EXAMS[0];
  }, [selectedExamId]);

  const countdown = useMemo(() => {
    return calculateExamCountdown(currentExam.targetDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentExam, countdownTick]);

  // Navegação entre slides
  const goToSlide = useCallback((next: number) => {
    setActiveSlide((next + SLIDE_COUNT) % SLIDE_COUNT);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isFocusModalOpen) return;
    if (e.key === 'ArrowRight') goToSlide(activeSlide + 1);
    else if (e.key === 'ArrowLeft') goToSlide(activeSlide - 1);
  }, [activeSlide, isFocusModalOpen, goToSlide]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleSelectPlan = (planId: FocusLevel) => {
    setSelectedFocusPlan(planId);
  };

  const handleConfirmFocus = () => {
    const plan = FOCUS_PLANS.find(p => p.id === selectedFocusPlan) || FOCUS_PLANS[1];
    setActiveFocus({
      level: plan.id,
      completed: 0,
      total: plan.questionsTotal,
      daysLeft: 7
    });
    setIsFocusModalOpen(false);
  };

  // Calcula os dias da semana de forma dinâmica (Seg a Dom)
  const daysOfWeek = useMemo(() => {
    const dayLabels = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
    const todayJsDay = new Date().getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
    const currentDayIndex = todayJsDay === 0 ? 6 : todayJsDay - 1;

    return dayLabels.map((label, idx) => {
      const isToday = idx === currentDayIndex;
      const done = isToday && streakCount >= 1;
      return {
        label,
        active: isToday,
        done,
      };
    });
  }, [streakCount]);

  const slides: { key: string; label: string; node: React.ReactNode }[] = [
    {
      key: 'contagem',
      label: 'Contagem',
      node: (
        <div className="w-full h-full flex flex-col items-center justify-center gap-8 px-6 sm:px-10">
          {/* Seletor de Exame */}
          <div className="relative">
            <button
              onClick={() => setIsExamDropdownOpen(!isExamDropdownOpen)}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-2 cursor-pointer transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
              <span>{currentExam.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-white/70" />
            </button>

            <AnimatePresence>
              {isExamDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.95 }}
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-72 bg-slate-900/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl p-2 z-50 space-y-1 text-white"
                >
                  <span className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1 block">
                    Selecione o Exame Alvo:
                  </span>
                  {TARGET_EXAMS.map((exam) => (
                    <button
                      key={exam.id}
                      onClick={() => {
                        setSelectedExamId(exam.id);
                        setIsExamDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                        exam.id === selectedExamId
                          ? 'bg-blue-600 text-white font-bold'
                          : 'hover:bg-white/10 text-slate-200'
                      }`}
                    >
                      <span className="truncate">{exam.shortName}</span>
                      {exam.id === selectedExamId && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-300" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Título Principal com Contagem Real */}
          <div className="text-center">
            <div className="flex items-center gap-2 px-3 py-1 mx-auto w-fit rounded-lg bg-white/10 backdrop-blur-sm text-[11px] font-bold text-blue-200 border border-white/10 mb-4">
              <Calendar className="w-3.5 h-3.5 text-cyan-300" />
              <span>{new Date(currentExam.targetDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
            </div>
            <motion.h2
              key={countdown.days}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-4 tracking-tight font-display flex flex-wrap items-baseline justify-center gap-3"
            >
              <span>{countdown.days} dias</span>
              {countdown.days < 45 && (
                <span className="text-xl sm:text-2xl font-normal text-cyan-300 font-mono">
                  {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
                </span>
              )}
            </motion.h2>
            <p className="text-blue-100 text-sm sm:text-base font-medium leading-relaxed max-w-2xl mx-auto">
              {currentExam.tips}
            </p>
          </div>

          {/* Botões de Ação Imediata */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setIsFocusModalOpen(true)}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all shadow-lg shadow-amber-400/20 flex items-center gap-2 cursor-pointer"
            >
              <Target className="w-4 h-4 text-slate-950" />
              <span>Modo Foco Semanal</span>
              <span className="bg-slate-950/10 text-slate-900 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase">
                {activeFocus.total}q / sem
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate('treino')}
              className="bg-white text-blue-900 hover:bg-cyan-50 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-blue-700" />
              Ir para o Treino
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate('caderno')}
              className="bg-blue-900/60 hover:bg-blue-900/80 text-white border border-white/20 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              Caderno de Disciplinas
            </motion.button>
          </div>
        </div>
      ),
    },
    {
      key: 'resumo',
      label: 'Resumo de Estudo',
      node: (
        <div className="w-full h-full flex items-center justify-center px-6 sm:px-10">
          <div className="w-full max-w-3xl">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md">
                <Clock className="w-4.5 h-4.5" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">Resumo de Estudo</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Tempo de estudo nos últimos 7 dias e sua meta diária</p>
              </div>
            </div>
            <StudyTimeSummaryCard
              onStartTraining={() => onNavigate('treino')}
              streakCount={streakCount}
            />
            <div className="mt-6">
              <DailyLearningGoal
                streakCount={streakCount}
                onStartTraining={() => onNavigate('treino')}
                onOpenCaderno={() => onNavigate('caderno')}
                todayQuestionsAnswered={userProfile?.totalAnswered || 0}
                todayMinutesStudied={0}
                todayXpEarned={userProfile?.totalXp || 0}
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'medalhas',
      label: 'Medalhas & Recompensas',
      node: (
        <div className="w-full h-full flex items-center justify-center px-6 sm:px-10 overflow-y-auto">
          <div className="w-full max-w-3xl py-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md">
                <Trophy className="w-4.5 h-4.5" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">Medalhas & Recompensas</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Suas conquistas e progresso de estudo</p>
              </div>
            </div>
            <StudyBadgesAndRewards
              streakCount={userProfile?.streak || streakCount || 1}
              totalAnswered={userProfile?.totalAnswered || 0}
              totalCorrect={userProfile?.totalCorrect || 0}
              accuracy={userProfile?.accuracy ?? 0}
              totalXp={userProfile?.totalXp || 0}
              onNavigateToTreino={() => onNavigate('treino')}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'ofensiva',
      label: 'Ofensiva Semanal',
      node: (
        <div className="w-full h-full flex items-center justify-center px-6 sm:px-10">
          <div className="w-full max-w-2xl">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-orange-500 to-red-500 text-white flex items-center justify-center shadow-md">
                <Flame className="w-4.5 h-4.5 fill-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">Ofensiva Semanal</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Sua sequência de estudos dia a dia</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-2xs hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700/60 transition-all duration-300">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100 font-display">Ofensiva Semanal</span>
                </div>
                <span className="text-xs text-slate-400 dark:text-slate-400 font-semibold uppercase tracking-wider">
                  Nível {Math.min(7, Math.floor((streakCount || 1) / 2) + 1)}
                </span>
              </div>

              <div className="flex justify-between items-center gap-1.5">
                {daysOfWeek.map((day, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1.5">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        day.done
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-blue-950 scale-105'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-400'
                      }`}
                    >
                      {day.label}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400">
                      {idx === 0 ? 'Seg' : idx === 6 ? 'Dom' : ''}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs sm:text-sm text-slate-500 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Sequência Ativa
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{streakCount} dias seguidos 🔥</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="relative h-full w-full overflow-hidden flex flex-col select-none text-slate-900 dark:text-slate-100">
      {/* Conteúdo em slides (fundo de cada slide) */}
      <div className="absolute inset-0 flex flex-col overflow-hidden">
        {activeSlide === 0 && (
          <div className="flex-1 bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-950" />
        )}
        {activeSlide !== 0 && (
          <div className="flex-1 bg-transparent" />
        )}
      </div>

      {/* Slide ativo */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSlide}
          initial={{ opacity: 0, x: activeSlide > 0 ? 60 : -60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: activeSlide > 0 ? -60 : 60 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 flex"
        >
          {slides[activeSlide].node}
        </motion.div>
      </AnimatePresence>

      {/* Setas de navegação esquerda/direita */}
      <button
        onClick={() => goToSlide(activeSlide - 1)}
        className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-lg hover:scale-110 transition-transform flex items-center justify-center text-slate-700 dark:text-slate-200 cursor-pointer"
        aria-label="Slide anterior"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={() => goToSlide(activeSlide + 1)}
        className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-lg hover:scale-110 transition-transform flex items-center justify-center text-slate-700 dark:text-slate-200 cursor-pointer"
        aria-label="Próximo slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Nome do slide + indicadores */}
      <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-2 z-20 pointer-events-none">
        <div className="flex items-center gap-2">
          {slides.map((s, i) => (
            <button
              key={s.key}
              onClick={() => goToSlide(i)}
              className={`pointer-events-auto rounded-full transition-all cursor-pointer ${
                i === activeSlide
                  ? 'w-6 h-2 bg-blue-600 dark:bg-blue-400'
                  : 'w-2 h-2 bg-slate-300 dark:bg-slate-600 hover:bg-blue-400'
              }`}
              aria-label={s.label}
            />
          ))}
        </div>
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider bg-white/70 dark:bg-slate-900/70 px-3 py-1 rounded-full">
          {slides[activeSlide].label}
        </span>
      </div>

      {/* MODAL INTERATIVO DO MODO FOCO SEMANAL */}
      <AnimatePresence>
        {isFocusModalOpen && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFocusModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[36px] shadow-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 overflow-hidden z-10 max-h-[90vh] flex flex-col text-slate-900 dark:text-slate-100"
            >
              <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
                      Modo Foco Semanal • Plataforma Mendonça
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Escolha seu nível de intensidade para os próximos 7 dias e ganhe XP bônus
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsFocusModalOpen(false)}
                  className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
                  title="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-6 overflow-y-auto flex-1 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {FOCUS_PLANS.map((plan) => {
                    const isSelected = selectedFocusPlan === plan.id;

                    return (
                      <motion.div
                        key={plan.id}
                        whileHover={{ y: -4 }}
                        onClick={() => handleSelectPlan(plan.id)}
                        className={`rounded-[28px] p-5 border-2 transition-all cursor-pointer flex flex-col justify-between relative ${
                          isSelected
                            ? `${plan.borderColor} bg-gradient-to-b ${plan.bgGradient} shadow-md`
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider bg-white dark:bg-slate-800 shadow-2xs text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
                            {plan.tag}
                          </span>
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                            isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
                          }`}>
                            {isSelected && <CheckCircle2 className="w-4 h-4" />}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                            {plan.name}
                          </h3>
                          <div className="mt-2 flex items-baseline gap-1.5">
                            <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">
                              {plan.questionsTotal}
                            </span>
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">questões / semana</span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                            {plan.description}
                          </p>
                        </div>

                        <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-slate-800 space-y-2 text-xs">
                          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 font-medium">
                            <span className="flex items-center gap-1.5 text-slate-500">
                              <Compass className="w-3.5 h-3.5" /> Ritmo:
                            </span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{plan.dailyAverage}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 font-medium">
                            <span className="flex items-center gap-1.5 text-slate-500">
                              <Clock className="w-3.5 h-3.5" /> Tempo diário:
                            </span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{plan.estimatedTime}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 font-medium">
                            <span className="flex items-center gap-1.5 text-slate-500">
                              <Trophy className="w-3.5 h-3.5 text-amber-500" /> Recompensa:
                            </span>
                            <span className="font-extrabold text-amber-600 dark:text-amber-400">+{plan.xpReward} XP ({plan.badge})</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {selectedFocusPlan && (
                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      O que você precisa fazer no plano selecionado:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {(FOCUS_PLANS.find(p => p.id === selectedFocusPlan)?.instructions || []).map((step, sIdx) => (
                        <div key={sIdx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700 shadow-2xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
                  Você pode recalibrar sua meta a qualquer momento. O progresso é registrado a cada exercício concluído.
                </p>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => setIsFocusModalOpen(false)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmFocus}
                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Target className="w-4 h-4" />
                    <span>Iniciar Foco Agora</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
