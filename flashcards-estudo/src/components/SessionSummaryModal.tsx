import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, RotateCcw, ArrowRight, Sparkles, Star } from 'lucide-react';
import { MOTIVATIONAL_QUOTES } from '../utils/initialData';
import { soundFx } from '../utils/sound';

interface SessionSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestart: () => void;
  totalCards: number;
  correctCount: number;
  modeName: string;
  deckName: string;
}

export const SessionSummaryModal: React.FC<SessionSummaryModalProps> = ({
  isOpen,
  onClose,
  onRestart,
  totalCards,
  correctCount,
  modeName,
  deckName,
}) => {
  useEffect(() => {
    if (isOpen) {
      soundFx.playVictory();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const accuracy = totalCards > 0 ? Math.round((correctCount / totalCards) * 100) : 100;
  const quote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-[#FAF8F5] dark:bg-[#18181B] w-full max-w-md rounded-2xl shadow-2xl border-2 border-[#E7E2D9] dark:border-[#2C2C30] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 text-center space-y-5">
          {/* Celebration icon */}
          <div className="w-16 h-16 rounded-2xl bg-[#2D5A46] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#2D5A46]/30">
            <Sparkles className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#2D5A46]">
              Sessão Concluída!
            </span>
            <h2 className="text-2xl font-bold text-[#1C1917] dark:text-[#FAF9F5] font-['Fraunces',serif] mt-1">
              Excelente Trabalho!
            </h2>
            <p className="text-xs font-mono text-[#8C7A6B] dark:text-[#A8A29E] mt-1">
              Modo {modeName} • {deckName}
            </p>
          </div>

          {/* Stats pills */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#141416] border-2 border-[#E7E2D9] dark:border-[#2C2C30]">
              <span className="text-[10px] font-mono font-bold text-[#8C7A6B] uppercase tracking-wider block">
                Cards Estudados
              </span>
              <span className="text-2xl font-bold text-[#1C1917] dark:text-[#FAF9F5] font-['Fraunces',serif]">
                {totalCards}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#141416] border-2 border-[#E7E2D9] dark:border-[#2C2C30]">
              <span className="text-[10px] font-mono font-bold text-[#8C7A6B] uppercase tracking-wider block">
                Precisão
              </span>
              <span className="text-2xl font-bold text-[#2D5A46] dark:text-[#52B788] font-['Fraunces',serif]">
                {accuracy}%
              </span>
            </div>
          </div>

          {/* Motivational quote */}
          <div className="p-3.5 rounded-xl bg-[#EBF3EF] dark:bg-[#15221B] border-2 border-[#CFE1D6] dark:border-[#22392D] text-xs text-[#2D5A46] dark:text-[#6BCFA0] italic font-serif">
            "{quote}"
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button
              id="btn-session-restart"
              onClick={onRestart}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-[#E7E2D9] dark:border-[#2C2C30] text-[#57534E] dark:text-[#FAF9F5] text-sm font-bold hover:bg-[#EFECE6] dark:hover:bg-[#25252A] transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Estudar Novamente</span>
            </button>
            <button
              id="btn-session-done"
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2D5A46] hover:bg-[#21483A] text-white text-sm font-bold shadow-xs transition-all"
            >
              <span>Voltar ao Baralho</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
