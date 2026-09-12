import React from 'react';
import { motion } from 'motion/react';
import { Clock, Flame, Heart, HeartCrack, Trophy, Pause } from 'lucide-react';

interface GameHUDProps {
  formatTime: (secs: number) => string;
  elapsedSeconds: number;
  questionNumber: number;
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
  lives,
  lastLostLife,
  streakMultiplier,
  score,
  onExitToLobby,
}) => {
  return (
    <div className="bg-white dark:bg-[#18181B] rounded-2xl p-3.5 sm:p-4 border border-[#E7E2D9]/80 dark:border-[#2C2C30] shadow-sm flex flex-wrap items-center justify-between gap-3">
      {/* Timer Cronômetro & Pergunta */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EFECE6] dark:bg-[#232326] text-[#1C1917] dark:text-[#E7E5E4] font-mono text-xs font-bold border border-[#E7E2D9] dark:border-[#3B3B40]">
          <Clock className="w-3.5 h-3.5 text-[#2D5A46] dark:text-[#52B788] animate-spin" style={{ animationDuration: '4s' }} />
          <span>{formatTime(elapsedSeconds)}</span>
        </div>

        <span className="text-xs font-extrabold text-[#78716C] dark:text-[#A8A29E]">
          Questão #{questionNumber}
        </span>
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
                    <Heart className="w-4 h-4 text-[#D6D0C5] dark:text-[#44403C]" />
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
            : 'bg-[#EFECE6] dark:bg-[#232326] border-[#E7E2D9] dark:border-[#3B3B40] text-[#78716C]'
        }`}>
          <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span>{streakMultiplier}x Combo</span>
        </div>

        {/* Pontos */}
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#EBF3EF] dark:bg-[#15221B] border border-[#CFE1D6]/80 dark:border-[#22392D]/60 text-[#224A38] dark:text-[#52B788] text-xs font-black font-mono">
          <Trophy className="w-3.5 h-3.5 text-[#2D5A46] dark:text-[#52B788]" />
          <span>{score} pts</span>
        </div>

        {/* Pausar / Sair */}
        <button
          type="button"
          onClick={onExitToLobby}
          className="p-1.5 rounded-xl bg-[#EFECE6] dark:bg-[#232326] text-[#78716C] hover:text-[#1C1917] dark:hover:text-[#E7E5E4] hover:bg-[#E5DFD5] dark:hover:bg-[#333338] transition-colors cursor-pointer"
          title="Pausar / Voltar ao Menu"
        >
          <Pause className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};