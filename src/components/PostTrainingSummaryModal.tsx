import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip 
} from 'recharts';
import { 
  Trophy, 
  Flame, 
  RotateCcw, 
  BarChart3, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Zap, 
  Sparkles, 
  Target, 
  X,
  BrainCircuit
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizQuestion } from '../types/design';

export interface PostTrainingSummaryData {
  score: number;
  xpEarned: number;
  totalQuestions: number;
  correctQuestions: number;
  wrongQuestions: number;
  accuracy: number;
  elapsedSeconds: number;
  maxCombo: number;
  gameModeLabel: string;
  answeredLog: Array<{
    question: QuizQuestion;
    selectedOptionId: string;
    isCorrect: boolean;
  }>;
}

interface PostTrainingSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: PostTrainingSummaryData;
  summaryData?: PostTrainingSummaryData;
  onPlayAgain: () => void;
  onViewDashboard: () => void;
  onViewLeaderboard?: () => void;
  onOpenCaderno?: () => void;
}

export const PostTrainingSummaryModal: React.FC<PostTrainingSummaryModalProps> = ({
  isOpen,
  onClose,
  data,
  summaryData,
  onPlayAgain,
  onViewDashboard,
  onViewLeaderboard,
  onOpenCaderno: _onOpenCaderno
}) => {
  const effectiveData: PostTrainingSummaryData = data || summaryData || {
    score: 0,
    xpEarned: 0,
    totalQuestions: 0,
    correctQuestions: 0,
    wrongQuestions: 0,
    accuracy: 0,
    elapsedSeconds: 0,
    maxCombo: 0,
    gameModeLabel: 'Treino de Alta Frequência',
    answeredLog: []
  };

  // Dispara confetes se a precisão for alta (>= 70%)
  React.useEffect(() => {
    if (isOpen && (effectiveData?.accuracy ?? 0) >= 70) {
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch { /* ignored */ }
    }
  }, [isOpen, effectiveData?.accuracy]);

  if (!isOpen) return null;

  // Formatação do tempo
  const formatTime = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Dados para o Gráfico de Rosca (Donut) do Recharts
  const chartData = [
    { name: 'Acertos', value: effectiveData.correctQuestions, color: '#10B981' }, // Emerald
    { name: 'Erros', value: effectiveData.wrongQuestions, color: '#F43F5E' }      // Rose
  ];

  // Se não respondeu nada ou 0 acertos e 0 erros, exibe placeholder
  const isChartEmpty = effectiveData.totalQuestions === 0;
  const displayChartData = isChartEmpty 
    ? [{ name: 'Sem dados', value: 1, color: '#A8A29E' }] 
    : chartData.filter(d => d.value > 0);

  // Recomendações pedagógicas contextuais da IA Mendonça
  const getFeedback = () => {
    const acc = effectiveData.accuracy ?? 0;
    if (acc >= 90) {
      return {
        badge: '🏆 Nível Mestre',
        badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-700',
        title: 'Excelente Retenção Conceitual!',
        text: 'Você demonstrou velocidade e domínio analítico nas questões. Continue nesse ritmo para garantir o topo do ranking semanal!'
      };
    } else if (acc >= 70) {
      return {
        badge: '🥈 Desempenho Avançado',
        badgeColor: 'bg-[#EBF3EF] text-[#2D5A46] dark:bg-[#15221B]/70 dark:text-[#52B788] border-[#CFE1D6] dark:border-[#2D5A46]',
        title: 'Ótima Consistência de Treino!',
        text: 'Sua precisão está acima da média do exame. Revise as alternativas incorretas no Caderno de Resumos para lapidar os detalhes finais.'
      };
    } else if (acc >= 50) {
      return {
        badge: '🥉 Em Evolução',
        badgeColor: 'bg-[#EBF3EF] text-[#2D5A46] dark:bg-[#15221B]/70 dark:text-[#52B788] border-[#CFE1D6] dark:border-[#2D5A46]',
        title: 'Bom Treino de Fixação!',
        text: 'Identificamos algumas oscilações em fórmulas e termos conceituais. Recomendamos revisar esses pontos no seu caderno de anotações e refazer as questões de treino para fechar as lacunas.'
      };
    } else {
      return {
        badge: '💡 Diagnóstico de Apoio',
        badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-300 dark:border-rose-700',
        title: 'Oportunidade de Consolidação',
        text: 'Não desanime! Questões desafiadoras constroem sinapses fortes. Abra a Lúmina AI ou consulte os resumos temáticos antes da próxima bateria.'
      };
    }
  };

  const feedback = getFeedback();
  const avgSecondsPerQuestion = effectiveData.totalQuestions > 0 
    ? Math.round(effectiveData.elapsedSeconds / effectiveData.totalQuestions) 
    : 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#121214]/75 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl bg-white dark:bg-[#18181B] rounded-[32px] shadow-2xl border border-[#E7E2D9]/90 dark:border-[#2C2C30] p-5 sm:p-8 z-10 overflow-hidden flex flex-col max-h-[92vh] text-[#1C1917] dark:text-[#E7E5E4]"
        >
          {/* Top Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-24 bg-gradient-to-b from-[#2D5A46]/15 via-[#52B788]/5 to-transparent rounded-full blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E7E2D9] dark:border-[#2C2C30] relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#2D5A46] to-[#1E3E30] flex items-center justify-center text-white shadow-md shadow-[#2D5A46]/25">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#2D5A46] dark:text-[#52B788] font-mono">
                  {effectiveData.gameModeLabel}
                </span>
                <h2 className="text-xl font-bold font-display text-[#1C1917] dark:text-[#FAF9F5]">
                  Resumo da Sessão de Treino
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-[#EFECE6] dark:bg-[#232326] hover:bg-[#E7E2D9] dark:hover:bg-[#3B3B40] text-[#78716C] dark:text-[#A8A29E] flex items-center justify-center transition-colors cursor-pointer"
              title="Fechar resumo"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="py-4 overflow-y-auto flex-1 space-y-5 pr-1">
            
            {/* Seção Principal: Gráfico Donut Recharts + KPIs Centrais */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-[#EFECE6]/80 dark:bg-[#232326]/40 rounded-2xl p-4 sm:p-5 border border-[#E7E2D9]/70 dark:border-[#2C2C30]">
              
              {/* Gráfico Donut de Desempenho (5 Colunas) */}
              <div className="md:col-span-5 flex flex-col items-center justify-center relative">
                <div className="w-44 h-44 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const p = payload[0];
                            return (
                              <div className="bg-[#18181B] text-[#FAF9F5] text-xs px-2.5 py-1.5 rounded-lg shadow-lg font-bold">
                                <span>{p.name}: </span>
                                <span style={{ color: p.payload.color }}>{p.value} questão(ões)</span>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Pie
                        data={displayChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={70}
                        paddingAngle={isChartEmpty ? 0 : 4}
                        dataKey="value"
                        stroke="none"
                        animationDuration={900}
                      >
                        {displayChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Texto Central do Donut: Taxa de Acerto */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl sm:text-3xl font-black font-display text-[#1C1917] dark:text-[#FAF9F5]">
                      {effectiveData.accuracy}%
                    </span>
                    <span className="text-[10px] font-bold text-[#78716C] dark:text-[#A8A29E] uppercase tracking-wider">
                      Precisão
                    </span>
                  </div>
                </div>

                {/* Legenda do Gráfico */}
                <div className="flex items-center gap-4 text-xs font-bold mt-1">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span>{effectiveData.correctQuestions} Acertos</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                    <span className="w-3 h-3 rounded-full bg-rose-500" />
                    <span>{effectiveData.wrongQuestions} Erros</span>
                  </div>
                </div>
              </div>

              {/* Grid de Métricas Numéricas (7 Colunas) */}
              <div className="md:col-span-7 grid grid-cols-2 gap-2.5">
                <div className="bg-white dark:bg-[#18181B] p-3 rounded-xl border border-[#E7E2D9]/80 dark:border-[#3B3B40]/80 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-[#78716C] dark:text-[#A8A29E] text-[11px] font-semibold">
                    <Target className="w-3.5 h-3.5 text-[#2D5A46] dark:text-[#52B788]" />
                    <span>Total Respondido</span>
                  </div>
                  <span className="text-xl font-bold font-display text-[#1C1917] dark:text-[#FAF9F5] mt-0.5 block">
                    {effectiveData.totalQuestions} <span className="text-xs font-medium text-[#A8A29E]">questões</span>
                  </span>
                </div>

                <div className="bg-white dark:bg-[#18181B] p-3 rounded-xl border border-[#E7E2D9]/80 dark:border-[#3B3B40]/80 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-[#78716C] dark:text-[#A8A29E] text-[11px] font-semibold">
                    <Zap className="w-3.5 h-3.5 text-[#2D5A46] dark:text-[#52B788]" />
                    <span>XP Adquirido</span>
                  </div>
                  <span className="text-xl font-bold font-display text-[#2D5A46] dark:text-[#52B788] mt-0.5 block">
                    +{effectiveData.xpEarned} <span className="text-xs font-medium text-[#52B788]/80">XP</span>
                  </span>
                </div>

                <div className="bg-white dark:bg-[#18181B] p-3 rounded-xl border border-[#E7E2D9]/80 dark:border-[#3B3B40]/80 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-[#78716C] dark:text-[#A8A29E] text-[11px] font-semibold">
                    <Clock className="w-3.5 h-3.5 text-[#2D5A46] dark:text-[#52B788]" />
                    <span>Tempo Total</span>
                  </div>
                  <span className="text-xl font-bold font-mono text-[#1C1917] dark:text-[#FAF9F5] mt-0.5 block">
                    {formatTime(effectiveData.elapsedSeconds)}
                  </span>
                </div>

                <div className="bg-white dark:bg-[#18181B] p-3 rounded-xl border border-[#E7E2D9]/80 dark:border-[#3B3B40]/80 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-[#78716C] dark:text-[#A8A29E] text-[11px] font-semibold">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    <span>Maior Combo</span>
                  </div>
                  <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5 block">
                    {effectiveData.maxCombo}x <span className="text-xs font-medium text-amber-500/80">streak</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Card de Diagnóstico Pedagógico da IA Mendonça */}
            <div className="bg-gradient-to-r from-[#EBF3EF]/70 via-[#EBF3EF]/70 to-[#EBF3EF]/70 dark:from-[#15221B]/30 dark:via-[#15221B]/30 dark:to-[#15221B]/30 rounded-2xl p-4 border border-[#CFE1D6]/70 dark:border-[#22392D]/60 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#2D5A46] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider border ${feedback.badgeColor}`}>
                    {feedback.badge}
                  </span>
                  <span className="text-xs font-bold text-[#1C1917] dark:text-[#E7E5E4]">
                    {feedback.title}
                  </span>
                </div>
                <p className="text-xs text-[#57534E] dark:text-[#D6D3CD] leading-relaxed font-medium">
                  {feedback.text}
                </p>
              </div>
            </div>

            {/* Histórico Rápido das Questões Respondidas na Sessão */}
            {effectiveData.answeredLog && effectiveData.answeredLog.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#44403C] dark:text-[#D6D3CD]">
                  <span className="flex items-center gap-1.5">
                    <BrainCircuit className="w-3.5 h-3.5 text-[#2D5A46] dark:text-[#52B788]" />
                    Gabarito Rápido da Sessão ({effectiveData.answeredLog.length} itens)
                  </span>
                  <span className="text-[11px] text-[#A8A29E] font-normal">
                    Média de ~{avgSecondsPerQuestion}s por questão
                  </span>
                </div>

                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 border border-[#E7E2D9] dark:border-[#2C2C30] rounded-xl p-1.5 bg-[#EFECE6]/50 dark:bg-[#18181B]/50">
                  {effectiveData.answeredLog.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-[#232326]/80 border border-[#E7E2D9] dark:border-[#3B3B40]/60 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        {item.isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        )}
                        <span className="font-bold text-[#78716C] dark:text-[#A8A29E] shrink-0">#{idx + 1}</span>
                        <p className="truncate text-[#1C1917] dark:text-[#E7E5E4] font-medium">
                          {item.question?.statement || 'Questão sem enunciado'}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase shrink-0 bg-[#EFECE6] dark:bg-[#3B3B40] text-[#57534E] dark:text-[#D6D3CD]">
                        {item.question?.subject || 'Geral'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Footer com Botões de Ação */}
          <div className="pt-4 border-t border-[#E7E2D9] dark:border-[#2C2C30] flex flex-wrap items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onViewDashboard}
                className="px-3.5 py-2 rounded-xl bg-[#EFECE6] dark:bg-[#232326] hover:bg-[#E7E2D9] dark:hover:bg-[#3B3B40] text-[#44403C] dark:text-[#D6D3CD] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <BarChart3 className="w-3.5 h-3.5 text-[#2D5A46] dark:text-[#52B788]" />
                <span>Ver Diagnóstico</span>
              </button>

              {onViewLeaderboard && (
                <button
                  type="button"
                  onClick={onViewLeaderboard}
                  className="px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center gap-1.5 border border-amber-200/80 dark:border-amber-800/60 transition-colors cursor-pointer"
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  <span>Ranking</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-[#E7E2D9] dark:border-[#3B3B40] text-[#57534E] dark:text-[#A8A29E] text-xs font-semibold hover:bg-[#EFECE6] dark:hover:bg-[#232326] transition-colors cursor-pointer"
              >
                Sair
              </button>

              <button
                type="button"
                onClick={onPlayAgain}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#2D5A46] to-[#1E3E30] hover:from-[#21483A] hover:to-[#224A38] text-white font-bold text-xs shadow-md shadow-[#2D5A46]/20 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Jogar Novamente</span>
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
