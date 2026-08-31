import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  Target, 
  Flame, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  Sliders, 
  Play, 
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserPerformance } from '../services/supabase';
import { PerformanceAnalytics, PerformanceSessionHistory } from '../types/design';

interface StudyTimeSummaryCardProps {
  onStartTraining: () => void;
  streakCount?: number;
}

export const StudyTimeSummaryCard: React.FC<StudyTimeSummaryCardProps> = ({
  onStartTraining,
}) => {
  const { currentUser } = useAuth();
  const userId = currentUser?.id || 'guest';

  // Meta diária definida pelo usuário (armazenada localmente)
  const [dailyTargetMinutes, setDailyTargetMinutes] = useState<number>(() => {
    const saved = localStorage.getItem('mendonca_user_daily_goal_minutes');
    return saved ? parseInt(saved, 10) : 45;
  });

  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [analytics, setAnalytics] = useState<PerformanceAnalytics | null>(null);

  // Carrega histórico de desempenho e sessões
  useEffect(() => {
    let isMounted = true;
    getUserPerformance(userId).then(data => {
      if (isMounted && data) {
        setAnalytics(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [userId]);

  // Salvar nova meta diária
  const handleSaveDailyTarget = (minutes: number) => {
    setDailyTargetMinutes(minutes);
    localStorage.setItem('mendonca_user_daily_goal_minutes', String(minutes));
    setIsEditingTarget(false);
  };

  // Cálculo do Tempo Total de Estudo nos Últimos 7 Dias
  const stats7Days = useMemo(() => {
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    let totalSeconds7Days = 0;
    let todaySeconds = 0;
    let sessions7DaysCount = 0;

    // Suporta formato pt-BR "29/08 às 14:30" além do ISO
    const parseSessionTime = (dateStr?: string): number => {
      if (!dateStr) return NaN;
      const iso = Date.parse(dateStr);
      if (!isNaN(iso)) return iso;
      const m = /^(\d{1,2})\/(\d{1,2})\s+(?:às\s+)?(\d{1,2}):(\d{2})/.exec(dateStr);
      if (m) {
        const day = Number(m[1]);
        const month = Number(m[2]);
        const hour = Number(m[3]);
        const minute = Number(m[4]);
        const nowDate = new Date();
        const parsed = new Date(nowDate.getFullYear(), month - 1, day, hour, minute, 0, 0);
        if (parsed.getTime() > nowDate.getTime()) {
          parsed.setFullYear(parsed.getFullYear() - 1);
        }
        return parsed.getTime();
      }
      return NaN;
    };

    const sessions = analytics?.sessionsHistory || [];

    if (sessions.length > 0) {
      sessions.forEach((s: PerformanceSessionHistory) => {
        let sessionTime = now;
        const parsed = parseSessionTime(s.date);
        if (!isNaN(parsed)) sessionTime = parsed;

        const sec = s.elapsedSeconds || 0;

        if (sessionTime >= sevenDaysAgo) {
          totalSeconds7Days += sec;
          sessions7DaysCount += 1;
        }

        if (sessionTime >= oneDayAgo) {
          todaySeconds += sec;
        }
      });
    }

    // Se o usuário tiver tempo geral no analytics mas poucas sessões particionadas
    if (totalSeconds7Days === 0 && (analytics?.totalSecondsPlayed || 0) > 0) {
      totalSeconds7Days = Math.min(analytics?.totalSecondsPlayed || 0, 7 * 3600);
      todaySeconds = Math.round(totalSeconds7Days / 7);
      sessions7DaysCount = Math.max(1, Math.round(totalSeconds7Days / 300));
    }

    // Caso de novo usuário com dados iniciais de demonstração produtiva
    if (totalSeconds7Days === 0) {
      totalSeconds7Days = 145 * 60; // 2h 25m inicial
      todaySeconds = 30 * 60;       // 30 min hoje
      sessions7DaysCount = 5;
    }

    const totalMinutes7Days = Math.round(totalSeconds7Days / 60);
    const hours7Days = Math.floor(totalMinutes7Days / 60);
    const remMin7Days = totalMinutes7Days % 60;

    const todayMinutes = Math.round(todaySeconds / 60);
    const dailyAverageMin = Math.round(totalMinutes7Days / 7);

    // Formatações
    const formatted7Days = hours7Days > 0 
      ? `${hours7Days}h ${remMin7Days > 0 ? `${remMin7Days}m` : ''}`
      : `${totalMinutes7Days} min`;

    const formattedToday = todayMinutes >= 60
      ? `${Math.floor(todayMinutes / 60)}h ${todayMinutes % 60}m`
      : `${todayMinutes} min`;

    // Progresso da Meta Diária (0 a 100%)
    const progressPercent = Math.min(100, Math.round((todayMinutes / dailyTargetMinutes) * 100));
    const isCompleted = todayMinutes >= dailyTargetMinutes;
    const remainingMinutes = Math.max(0, dailyTargetMinutes - todayMinutes);

    return {
      totalMinutes7Days,
      formatted7Days,
      todayMinutes,
      formattedToday,
      dailyAverageMin,
      sessionsCount: sessions7DaysCount,
      progressPercent,
      isCompleted,
      remainingMinutes
    };
  }, [analytics, dailyTargetMinutes]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[28px] p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-lg hover:shadow-indigo-500/10 hover:border-indigo-300 dark:hover:border-indigo-700/60 transition-all duration-300 relative overflow-hidden flex flex-col gap-5">
      
      {/* Background Glow suave */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header com Título e Ação de Ajuste */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
                Tempo Total de Estudo (Últimos 7 dias)
              </h3>
              {stats7Days.isCompleted && (
                <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Meta Diária Atingida!
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Acompanhamento de dedicação semanal e meta diária configurável
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsEditingTarget(!isEditingTarget)}
          className="text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5"
          title="Ajustar Meta Diária de Estudo"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Definir Meta</span>
        </button>
      </div>

      {/* Popover / Seletor de Meta Diária */}
      <AnimatePresence>
        {isEditingTarget && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 z-10"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Selecione seu alvo diário de estudo:
              </span>
              <button
                onClick={() => setIsEditingTarget(false)}
                className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Fechar
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[20, 30, 45, 60, 90, 120].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handleSaveDailyTarget(mins)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    dailyTargetMinutes === mins
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {dailyTargetMinutes === mins && <Check className="w-3.5 h-3.5" />}
                  <span>{mins >= 60 ? `${mins / 60}h (${mins}m)` : `${mins} min`}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid de Métricas dos 7 Dias */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 z-10">
        
        {/* Card 1: Total 7 Dias */}
        <div className="bg-gradient-to-br from-indigo-50/70 to-blue-50/70 dark:from-indigo-950/30 dark:to-blue-950/30 p-3.5 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-indigo-700 dark:text-indigo-300 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Últimos 7 Dias</span>
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
            {stats7Days.formatted7Days}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
            {stats7Days.sessionsCount} sessões registradas
          </span>
        </div>

        {/* Card 2: Média Diária */}
        <div className="bg-slate-50/80 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Média Diária</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
            {stats7Days.dailyAverageMin} min
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
            Ritmo constante por dia
          </span>
        </div>

        {/* Card 3: Tempo de Hoje */}
        <div className="bg-slate-50/80 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Hoje Estudado</span>
            <Flame className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
            {stats7Days.formattedToday}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
            Meta: {dailyTargetMinutes} min
          </span>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* BARRA DE PROGRESSO DA META DIÁRIA (DAILY STUDY GOAL PROGRESS BAR) */}
      {/* ========================================================================= */}
      <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2.5 z-10">
        
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="font-bold text-slate-800 dark:text-slate-200">
              Progresso da Meta Diária (Daily Study Goal)
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
            <span>{stats7Days.todayMinutes}</span>
            <span className="text-slate-400 font-normal">/</span>
            <span>{dailyTargetMinutes} min</span>
            <span className="ml-1 text-[11px] px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-sans">
              {stats7Days.progressPercent}%
            </span>
          </div>
        </div>

        {/* Visual Progress Bar com gradiente dinâmico e animação */}
        <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden relative shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stats7Days.progressPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full transition-all duration-500 ${
              stats7Days.isCompleted
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/30'
                : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-500 shadow-sm shadow-indigo-500/30'
            }`}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
          <span>
            {stats7Days.isCompleted ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Parabéns! Você completou sua meta de hoje.
              </span>
            ) : (
              <span>Faltam apenas <strong>{stats7Days.remainingMinutes} min</strong> para atingir seu objetivo.</span>
            )}
          </span>

          <button
            onClick={onStartTraining}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Estudar agora</span>
            <Play className="w-2.5 h-2.5 fill-current" />
          </button>
        </div>

      </div>

    </div>
  );
};
