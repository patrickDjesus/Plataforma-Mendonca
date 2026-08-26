import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip 
} from 'recharts';
import { 
  Target, 
  CheckCircle2, 
  Clock, 
  Flame, 
  Zap, 
  Sparkles, 
  Play, 
  Edit3, 
  Settings2, 
  Award,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DailyLearningGoalProps {
  onStartTraining: () => void;
  onOpenCaderno?: () => void;
  streakCount: number;
  // Métricas do dia (opcionais, com fallback inteligente)
  todayQuestionsAnswered?: number;
  todayMinutesStudied?: number;
  todayXpEarned?: number;
}

export const DailyLearningGoal: React.FC<DailyLearningGoalProps> = ({
  onStartTraining,
  onOpenCaderno,
  streakCount,
  todayQuestionsAnswered = 12,
  todayMinutesStudied = 35,
  todayXpEarned = 450
}) => {
  // Alvos customizáveis pelo estudante (salvos no localStorage)
  const [targetQuestions, setTargetQuestions] = useState<number>(() => {
    const saved = localStorage.getItem('mendonca_daily_target_q');
    return saved ? Number(saved) : 15;
  });

  const [targetMinutes, setTargetMinutes] = useState<number>(() => {
    const saved = localStorage.getItem('mendonca_daily_target_min');
    return saved ? Number(saved) : 45;
  });

  const [isEditingGoal, setIsEditingGoal] = useState<boolean>(false);
  const [activeMetric, setActiveMetric] = useState<'questions' | 'time' | 'xp'>('questions');

  // Cálculos de porcentagem
  const questionsProgress = Math.min(100, Math.round((todayQuestionsAnswered / targetQuestions) * 100));
  const timeProgress = Math.min(100, Math.round((todayMinutesStudied / targetMinutes) * 100));
  const targetXp = targetQuestions * 35;
  const xpProgress = Math.min(100, Math.round((todayXpEarned / targetXp) * 100));

  const isGoalReached = questionsProgress >= 100;

  // Salvar alterações de metas
  const handleSaveGoals = (newQ: number, newMin: number) => {
    setTargetQuestions(newQ);
    setTargetMinutes(newMin);
    localStorage.setItem('mendonca_daily_target_q', String(newQ));
    localStorage.setItem('mendonca_daily_target_min', String(newMin));
    setIsEditingGoal(false);

    if (todayQuestionsAnswered >= newQ) {
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch { /* ignored */ }
    }
  };

  // Dados para o Recharts Donut Gauge
  const activePercent = 
    activeMetric === 'questions' ? questionsProgress :
    activeMetric === 'time' ? timeProgress : xpProgress;

  const currentVal = 
    activeMetric === 'questions' ? todayQuestionsAnswered :
    activeMetric === 'time' ? todayMinutesStudied : todayXpEarned;

  const targetVal = 
    activeMetric === 'questions' ? targetQuestions :
    activeMetric === 'time' ? targetMinutes : targetXp;

  const unitLabel = 
    activeMetric === 'questions' ? 'questões' :
    activeMetric === 'time' ? 'minutos' : 'XP';

  const gaugeData = [
    { name: 'Concluído', value: Math.min(100, activePercent), color: activePercent >= 100 ? '#10B981' : '#3B82F6' },
    { name: 'Restante', value: Math.max(0, 100 - activePercent), color: '#E2E8F0' }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[28px] p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-lg hover:shadow-blue-500/15 hover:border-blue-300 dark:hover:border-blue-700/60 transition-all duration-300 flex flex-col gap-5 relative overflow-hidden">
      
      {/* Header com Ícone, Título e Botão de Ajuste */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
                Meta Diária de Aprendizado
              </h3>
              {isGoalReached && (
                <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Concluída!
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Acompanhamento inteligente de foco para o ENEM e vestibulares
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsEditingGoal(!isEditingGoal)}
          className="text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1"
          title="Personalizar metas"
        >
          <Settings2 className="w-4 h-4" />
          <span className="hidden sm:inline">Ajustar</span>
        </button>
      </div>

      {/* Editor Rápido de Metas (quando expandido) */}
      <AnimatePresence>
        {isEditingGoal && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Selecione sua meta diária de resolução:
              </span>
              <button
                onClick={() => setIsEditingGoal(false)}
                className="text-[11px] text-slate-400 hover:text-slate-600"
              >
                Fechar
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { q: 10, min: 25, label: 'Leve (10q)' },
                { q: 15, min: 45, label: 'Padrão (15q)' },
                { q: 30, min: 80, label: 'Intenso (30q)' }
              ].map(preset => (
                <button
                  key={preset.q}
                  onClick={() => handleSaveGoals(preset.q, preset.min)}
                  className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    targetQuestions === preset.q
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visualização Principal: Recharts Gauge Donut + Detalhes Interativos */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        
        {/* Recharts Circular Progress Donut (4 Colunas) */}
        <div className="sm:col-span-4 flex flex-col items-center justify-center">
          <div className="w-32 h-32 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow font-bold">
                          {payload[0].name}: {payload[0].value}%
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Pie
                  data={gaugeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={56}
                  startAngle={90}
                  endAngle={-270}
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                  animationDuration={800}
                >
                  <Cell fill={isGoalReached ? '#10B981' : '#2563EB'} />
                  <Cell fill="#E2E8F0" className="dark:opacity-20" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Texto Central */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl sm:text-2xl font-black font-display text-slate-900 dark:text-white">
                {activePercent}%
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Hoje
              </span>
            </div>
          </div>
        </div>

        {/* 3 Cartões de Métricas Selecionáveis (8 Colunas) */}
        <div className="sm:col-span-8 flex flex-col gap-2.5">
          
          {/* Card 1: Questões */}
          <div 
            onClick={() => setActiveMetric('questions')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
              activeMetric === 'questions'
                ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 shadow-2xs'
                : 'bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Exercícios Resolvidos
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {todayQuestionsAnswered} de {targetQuestions} questões concluídas
                </p>
              </div>
            </div>
            <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 font-mono">
              {questionsProgress}%
            </span>
          </div>

          {/* Card 2: Tempo de Estudo */}
          <div 
            onClick={() => setActiveMetric('time')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
              activeMetric === 'time'
                ? 'bg-cyan-50/70 dark:bg-cyan-950/40 border-cyan-300 dark:border-cyan-700 shadow-2xs'
                : 'bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-xs font-bold shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Tempo Dedicado Hoje
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {todayMinutesStudied} de {targetMinutes} minutos planejados
                </p>
              </div>
            </div>
            <span className="text-xs font-extrabold text-cyan-600 dark:text-cyan-400 font-mono">
              {timeProgress}%
            </span>
          </div>

          {/* Card 3: XP Acumulado */}
          <div 
            onClick={() => setActiveMetric('xp')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
              activeMetric === 'xp'
                ? 'bg-purple-50/70 dark:bg-purple-950/40 border-purple-300 dark:border-purple-700 shadow-2xs'
                : 'bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-bold shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  XP Neural Diário
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  +{todayXpEarned} XP acumulados hoje
                </p>
              </div>
            </div>
            <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400 font-mono">
              {xpProgress}%
            </span>
          </div>

        </div>
      </div>

      {/* Footer com CTA Direto para o Treino */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {isGoalReached ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Parabéns! Meta diária atingida com sucesso.
            </span>
          ) : (
            <span>
              Faltam apenas <strong>{Math.max(0, targetQuestions - todayQuestionsAnswered)} questões</strong> para bater a meta de hoje!
            </span>
          )}
        </span>

        <button
          onClick={onStartTraining}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>{isGoalReached ? 'Continuar Praticando' : 'Avançar na Meta'}</span>
        </button>
      </div>

    </div>
  );
};
