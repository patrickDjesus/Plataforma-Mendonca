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
      className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200/80 dark:border-slate-800 shadow-xl text-center space-y-7"
    >
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-bold text-xs">
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
          <span>Treino Survival Encerrado!</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
          {score > highScore ? '🎉 Novo Recorde Pessoal Alcançado!' : 'Excelente Desempenho!'}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-lg mx-auto">
          Você sobreviveu por <strong className="text-slate-800 dark:text-slate-100">{formatTime(elapsedSeconds)}</strong> e respondeu {answeredHistory.length} perguntas.
        </p>
      </div>

      {/* Estatísticas Finais */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left max-w-3xl mx-auto">
        <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase">Pontuação</span>
          <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400 font-mono block">{score}</span>
          <span className="text-[11px] text-slate-500">pts totais</span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase">XP Neural</span>
          <span className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono block">+{xpEarned}</span>
          <span className="text-[11px] text-slate-500">ganho</span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase">Precisão</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono block">
            {accuracy}%
          </span>
          <span className="text-[11px] text-slate-500">
            {answeredHistory.filter(h => h.isCorrect).length} de {answeredHistory.length}
          </span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase">Maior Combo</span>
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono block">{maxCombo}x</span>
          <span className="text-[11px] text-slate-500">multiplicador</span>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onShowSummary}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/25 transition-all cursor-pointer ring-2 ring-blue-300 dark:ring-blue-800"
        >
          <BarChart3 className="w-4 h-4" />
          <span>Resumo do Treino (Gráfico Donut)</span>
        </button>

        <button
          type="button"
          onClick={onPlayAgain}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
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
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
        >
          <Trophy className="w-4 h-4" />
          <span>Ver Ranking Global</span>
        </button>

        <button
          type="button"
          onClick={onExitToLobby}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
        >
          <span>Voltar ao Menu de Treino</span>
        </button>
      </div>
    </motion.div>
  );
};
