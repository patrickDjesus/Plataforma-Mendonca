import React from 'react';
import { motion } from 'motion/react';
import { Clock, Flame, Heart, HeartCrack, Trophy, Pause } from 'lucide-react';
import { getEnduranceLevel } from '../../utils/endurance';
import { GameCategory } from '../../utils/gameGenerators';

interface GameHUDProps {
  formatTime: (secs: number) => string;
  elapsedSeconds: number;
  questionNumber: number;
  gameMode: GameCategory | 'teacher_custom';
  lives: number;
  lastLostLife: number | null;
  streakMultiplier: number;
  score: number;
  onExitToLobby: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  formatTime,
  elapsedSeconds,
  questionNumber,
  gameMode,
  lives,
  lastLostLife,
  streakMultiplier,
  score,
  onExitToLobby,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
      {/* Timer Cronômetro & Pergunta */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-xs font-bold border border-slate-200 dark:border-slate-700">
          <Clock className="w-3.5 h-3.5 text-cyan-500 animate-spin" style={{ animationDuration: '4s' }} />
          <span>{formatTime(elapsedSeconds)}</span>
        </div>

        <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400">
          Questão #{questionNumber}
        </span>

        {/* Badge de Fase do Modo Endurance */}
        {gameMode === 'endurance' && (
          <div className={`px-2.5 py-1 rounded-xl text-[11px] font-black border flex items-center gap-1.5 animate-pulse ${getEnduranceLevel(elapsedSeconds).color} ${getEnduranceLevel(elapsedSeconds).badgeBg}`}>
            <Flame className="w-3.5 h-3.5" />
            <span>{getEnduranceLevel(elapsedSeconds).label}</span>
            <span className="text-[10px] opacity-85 font-mono">({getEnduranceLevel(elapsedSeconds).multiplierBonus}x bônus)</span>
          </div>
        )}
      </div>

      {/* Vidas, Combo, Pontuação */}
      <div className="flex items-center gap-2.5 ml-auto">
        {/* Vidas com Animação Framer Motion de Quebra / Desaparecimento */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 relative">
          {[1, 2, 3].map(h => {
            const isAlive = h <= lives;
            const wasJustLost = lastLostLife === h && !isAlive;

            return (
              <div key={h} className="relative w-5 h-5 flex items-center justify-center">
                {isAlive ? (
                  <motion.div
                    key={`alive-${h}`}
                    initial={{ scale: 0.8 }}
                    animate={{
                      scale: [1, 1.15, 1],
                      transition: { repeat: Infinity, repeatDelay: 2.2 + h * 0.4, duration: 0.6 }
                    }}
                    className="relative"
                  >
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500 drop-shadow-xs" />
                  </motion.div>
                ) : wasJustLost ? (
                  <motion.div
                    key={`lost-${h}`}
                    initial={{ scale: 1.4, rotate: 0 }}
                    animate={{
                      scale: [1.4, 1.2, 0.9, 0.85],
                      rotate: [0, -12, 12, 0],
                      filter: ['brightness(1.5)', 'brightness(1)', 'grayscale(1)']
                    }}
                    transition={{ duration: 0.75, ease: 'easeOut' }}
                    className="relative flex items-center justify-center"
                  >
                    <HeartCrack className="w-4 h-4 text-rose-600 dark:text-rose-400 fill-rose-500/30" />

                    <motion.span
                      initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                      animate={{ opacity: 0, x: -10, y: -12, scale: 0.2 }}
                      transition={{ duration: 0.65, ease: 'easeOut' }}
                      className="absolute w-1.5 h-1.5 rounded-full bg-rose-500"
                    />
                    <motion.span
                      initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                      animate={{ opacity: 0, x: 10, y: -10, scale: 0.2 }}
                      transition={{ duration: 0.65, ease: 'easeOut' }}
                      className="absolute w-1.5 h-1.5 rounded-full bg-rose-400"
                    />
                    <motion.span
                      initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                      animate={{ opacity: 0, x: 2, y: 12, scale: 0.2 }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                      className="absolute w-1 h-1 rounded-full bg-rose-600"
                    />
                    <motion.span
                      initial={{ opacity: 0.9, scale: 0.5 }}
                      animate={{ opacity: 0, scale: 2 }}
                      transition={{ duration: 0.5 }}
                      className="absolute w-4 h-4 rounded-full border border-rose-500/80 pointer-events-none"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key={`empty-${h}`}
                    initial={{ opacity: 0.4 }}
                    animate={{ opacity: 0.3 }}
                    className="relative"
                  >
                    <Heart className="w-4 h-4 text-slate-300 dark:text-slate-700" />
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        {/* Combo */}
        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-black transition-all ${
          streakMultiplier > 1
            ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-600 dark:text-amber-400 scale-105 shadow-2xs'
            : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
        }`}>
          <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span>{streakMultiplier}x Combo</span>
        </div>

        {/* Pontos */}
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200/80 dark:border-cyan-900/60 text-cyan-700 dark:text-cyan-300 text-xs font-black font-mono">
          <Trophy className="w-3.5 h-3.5 text-cyan-500" />
          <span>{score} pts</span>
        </div>

        {/* Pausar / Sair */}
        <button
          type="button"
          onClick={onExitToLobby}
          className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          title="Pausar / Voltar ao Menu"
        >
          <Pause className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
