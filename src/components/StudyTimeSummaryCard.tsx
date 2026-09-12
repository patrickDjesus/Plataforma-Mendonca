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
    <div className="bg-white dark:bg-[#18181B] rounded-[28px] p-5 sm:p-6 border border-[#E7E2D9]/80 dark:border-[#2C2C30] shadow-2xs hover:shadow-lg hover:shadow-[#2D5A46]/10 hover:border-[#2D5A46]/50 dark:hover:border-[#2D5A46]/60 transition-all duration-300 relative overflow-hidden flex flex-col gap-5">
      
      {/* Background Glow suave */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#2D5A46]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header com Título e Ação de Ajuste */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#EBF3EF] dark:bg-[#15221B]/60 text-[#2D5A46] dark:text-[#52B788] flex items-center justify-center shadow-xs">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold font-display text-[#1C1917] dark:text-[#FAF9F5]">
                Tempo Total de Estudo (Últimos 7 dias)
              </h3>
              {stats7Days.isCompleted && (
                <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Meta Diária Atingida!
                </span>
              )}
            </div>
            <p className="text-xs text-[#78716C] dark:text-[#A8A29E] font-medium">
              Acompanhamento de dedicação semanal e meta diária configurável
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsEditingTarget(!isEditingTarget)}
          className="text-xs font-semibold text-[#78716C] hover:text-[#2D5A46] dark:text-[#A8A29E] dark:hover:text-[#52B788] p-2 rounded-xl hover:bg-[#EFECE6] dark:hover:bg-[#232326] transition-colors cursor-pointer flex items-center gap-1.5"
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
            className="p-4 bg-[#EFECE6] dark:bg-[#232326]/80 rounded-2xl border border-[#E7E2D9] dark:border-[#3B3B40] space-y-3 z-10"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#44403C] dark:text-[#D6D3CD]">
                Selecione seu alvo diário de estudo:
              </span>
              <button
                onClick={() => setIsEditingTarget(false)}
                className="text-[11px] text-[#A8A29E] hover:text-[#57534E] dark:hover:text-[#E7E5E4]"
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
                      ? 'bg-[#2D5A46] text-white shadow-xs'
                      : 'bg-white dark:bg-[#18181B] text-[#44403C] dark:text-[#D6D3CD] hover:bg-[#EBF3EF] dark:hover:bg-[#15221B]/40 border border-[#E7E2D9] dark:border-[#2C2C30]'
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
        <div className="bg-gradient-to-br from-[#EBF3EF]/70 to-[#CFE1D6]/70 dark:from-[#15221B]/30 dark:to-[#22392D]/30 p-3.5 rounded-2xl border border-[#DCE9E1] dark:border-[#22392D]/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#2D5A46] dark:text-[#52B788] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Últimos 7 Dias</span>
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-extrabold text-[#1C1917] dark:text-[#FAF9F5] font-display">
            {stats7Days.formatted7Days}
          </div>
          <span className="text-[10px] text-[#78716C] dark:text-[#A8A29E] mt-1">
            {stats7Days.sessionsCount} sessões registradas
          </span>
        </div>

        {/* Card 2: Média Diária */}
        <div className="bg-[#EFECE6]/80 dark:bg-[#232326]/50 p-3.5 rounded-2xl border border-[#E7E2D9] dark:border-[#2C2C30] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#57534E] dark:text-[#D6D3CD] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Média Diária</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-[#1C1917] dark:text-[#FAF9F5] font-display">
            {stats7Days.dailyAverageMin} min
          </div>
          <span className="text-[10px] text-[#78716C] dark:text-[#A8A29E] mt-1">
            Ritmo constante por dia
          </span>
        </div>

        {/* Card 3: Tempo de Hoje */}
        <div className="bg-[#EFECE6]/80 dark:bg-[#232326]/50 p-3.5 rounded-2xl border border-[#E7E2D9] dark:border-[#2C2C30] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#57534E] dark:text-[#D6D3CD] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Hoje Estudado</span>
            <Flame className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-[#1C1917] dark:text-[#FAF9F5] font-display">
            {stats7Days.formattedToday}
          </div>
          <span className="text-[10px] text-[#78716C] dark:text-[#A8A29E] mt-1">
            Meta: {dailyTargetMinutes} min
          </span>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* BARRA DE PROGRESSO DA META DIÁRIA (DAILY STUDY GOAL PROGRESS BAR) */}
      {/* ========================================================================= */}
      <div className="bg-[#EFECE6] dark:bg-[#232326]/40 p-4 rounded-2xl border border-[#E7E2D9]/80 dark:border-[#2C2C30] space-y-2.5 z-10">
        
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[#2D5A46] dark:text-[#52B788]" />
            <span className="font-bold text-[#1C1917] dark:text-[#E7E5E4]">
              Progresso da Meta Diária (Daily Study Goal)
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-mono font-bold text-[#2D5A46] dark:text-[#52B788]">
            <span>{stats7Days.todayMinutes}</span>
            <span className="text-[#A8A29E] font-normal">/</span>
            <span>{dailyTargetMinutes} min</span>
            <span className="ml-1 text-[11px] px-1.5 py-0.5 rounded-md bg-[#CFE1D6] dark:bg-[#22392D]/60 text-[#2D5A46] dark:text-[#52B788] font-sans">
              {stats7Days.progressPercent}%
            </span>
          </div>
        </div>

        {/* Visual Progress Bar com gradiente dinâmico e animação */}
        <div className="w-full h-3 bg-[#E7E2D9] dark:bg-[#3B3B40] rounded-full overflow-hidden relative shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stats7Days.progressPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full transition-all duration-500 ${
              stats7Days.isCompleted
                ? 'bg-gradient-to-r from-[#2D5A46] to-[#52B788] shadow-sm shadow-emerald-500/30'
                : 'bg-gradient-to-r from-[#2D5A46] via-[#52B788] to-[#6BCFA0] shadow-sm shadow-[#2D5A46]/30'
            }`}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#78716C] dark:text-[#A8A29E] pt-0.5">
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
            className="text-[#2D5A46] dark:text-[#52B788] hover:text-[#21483A] dark:hover:text-[#6BCFA0] font-bold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Estudar agora</span>
            <Play className="w-2.5 h-2.5 fill-current" />
          </button>
        </div>

      </div>

    </div>
  );
};
