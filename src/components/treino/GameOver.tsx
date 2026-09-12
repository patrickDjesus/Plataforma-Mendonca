import React from 'react';
import { motion } from 'motion/react';
import { Heart, Trophy, BarChart3, RotateCcw } from 'lucide-react';
import { QuizQuestion } from '../../types/design';

interface GameOverProps {
  score: number;
  highScore: number;
  xpEarned: number;
  maxCombo: number;
  elapsedSeconds: number;
  answeredHistory: { isCorrect: boolean; question: QuizQuestion; selectedOptionId?: string }[];
  formatTime: (secs: number) => string;
  onShowSummary: () => void;
  onPlayAgain: () => void;
  onViewDashboard: () => void;
  onViewLeaderboard: () => void;
  onExitToLobby: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({
  score,
  highScore,
  xpEarned,
  maxCombo,
  elapsedSeconds,
  answeredHistory,
  formatTime,
  onShowSummary,
  onPlayAgain,
  onViewDashboard,
  onViewLeaderboard,
  onExitToLobby,
}) => {
  const accuracy = answeredHistory.length > 0
    ? Math.round((answeredHistory.filter(h => h.isCorrect).length / answeredHistory.length) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-[#18181B] rounded-3xl p-8 sm:p-12 border border-[#E7E2D9]/80 dark:border-[#2C2C30] shadow-xl text-center space-y-7"
    >
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-bold text-xs">
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
          <span>Treino Survival Encerrado!</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-[#1C1917] dark:text-[#FAF9F5] tracking-tight">
          {score > highScore ? '🎉 Novo Recorde Pessoal Alcançado!' : 'Excelente Desempenho!'}
        </h2>
        <p className="text-[#78716C] dark:text-[#A8A29E] text-sm max-w-lg mx-auto">
          Você sobreviveu por <strong className="text-[#1C1917] dark:text-[#FAF9F5]">{formatTime(elapsedSeconds)}</strong> e respondeu {answeredHistory.length} perguntas.
        </p>
      </div>

      {/* Estatísticas Finais */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left max-w-3xl mx-auto">
        <div className="bg-[#EFECE6] dark:bg-[#232326]/80 p-4 rounded-2xl border border-[#E7E2D9] dark:border-[#3B3B40] space-y-1">
          <span className="text-[10px] font-extrabold text-[#A8A29E] uppercase">Pontuação</span>
          <span className="text-2xl font-black text-[#2D5A46] dark:text-[#52B788] font-mono block">{score}</span>
          <span className="text-[11px] text-[#78716C]">pts totais</span>
        </div>

        <div className="bg-[#EFECE6] dark:bg-[#232326]/80 p-4 rounded-2xl border border-[#E7E2D9] dark:border-[#3B3B40] space-y-1">
          <span className="text-[10px] font-extrabold text-[#A8A29E] uppercase">XP Neural</span>
          <span className="text-2xl font-black text-[#2D5A46] dark:text-[#52B788] font-mono block">+{xpEarned}</span>
          <span className="text-[11px] text-[#78716C]">ganho</span>
        </div>

        <div className="bg-[#EFECE6] dark:bg-[#232326]/80 p-4 rounded-2xl border border-[#E7E2D9] dark:border-[#3B3B40] space-y-1">
          <span className="text-[10px] font-extrabold text-[#A8A29E] uppercase">Precisão</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono block">
            {accuracy}%
          </span>
          <span className="text-[11px] text-[#78716C]">
            {answeredHistory.filter(h => h.isCorrect).length} de {answeredHistory.length}
          </span>
        </div>

        <div className="bg-[#EFECE6] dark:bg-[#232326]/80 p-4 rounded-2xl border border-[#E7E2D9] dark:border-[#3B3B40] space-y-1">
          <span className="text-[10px] font-extrabold text-[#A8A29E] uppercase">Maior Combo</span>
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono block">{maxCombo}x</span>
          <span className="text-[11px] text-[#78716C]">multiplicador</span>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onShowSummary}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#2D5A46] hover:bg-[#21483A] text-white font-extrabold text-xs shadow-md shadow-[#2D5A46]/25 transition-all cursor-pointer ring-2 ring-[#CFE1D6] dark:ring-[#22392D]"
        >
          <BarChart3 className="w-4 h-4" />
          <span>Resumo do Treino (Gráfico Donut)</span>
        </button>

        <button
          type="button"
          onClick={onPlayAgain}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#2D5A46] hover:bg-[#21483A] text-white font-bold text-xs shadow-md shadow-[#2D5A46]/20 transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Jogar Novamente</span>
        </button>

        <button
          type="button"
          onClick={onViewDashboard}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
        >
          <BarChart3 className="w-4 h-4" />
          <span>Ver Diagnóstico & Curvas</span>
        </button>

        <button
          type="button"
          onClick={onViewLeaderboard}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-[#1C1917] font-extrabold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
        >
          <Trophy className="w-4 h-4" />
          <span>Ver Ranking Global</span>
        </button>

        <button
          type="button"
          onClick={onExitToLobby}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#EFECE6] dark:bg-[#232326] hover:bg-[#E5DFD5] dark:hover:bg-[#333338] text-[#1C1917] dark:text-[#E7E5E4] font-bold text-xs border border-[#E7E2D9] dark:border-[#3B3B40] transition-all cursor-pointer"
        >
          <span>Voltar ao Menu de Treino</span>
        </button>
      </div>
    </motion.div>
  );
};