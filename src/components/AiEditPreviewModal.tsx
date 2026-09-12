import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  X,
  Check,
  RotateCcw,
  Loader2,
  ArrowLeftRight,
} from 'lucide-react';

interface AiEditPreviewModalProps {
  isOpen: boolean;
  selectedText: string;
  suggestedText: string;
  isGenerating: boolean;
  error: string | null;
  onApprove: () => void;
  onReject: () => void;
}

export const AiEditPreviewModal: React.FC<AiEditPreviewModalProps> = ({
  isOpen,
  selectedText,
  suggestedText,
  isGenerating,
  error,
  onApprove,
  onReject,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onReject}
            className="absolute inset-0 bg-[#121214]/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-white dark:bg-[#18181B] rounded-3xl shadow-2xl border border-[#E7E2D9] dark:border-[#3B3B40] overflow-hidden z-10 max-h-[85vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#EFECE6] dark:border-[#2C2C30] bg-gradient-to-r from-[#2D5A46]/10 via-[#1E3E30]/10 to-[#0E1712]/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#2D5A46] to-[#1E3E30] text-white flex items-center justify-center shadow-md shadow-[#2D5A46]/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-[#1C1917] dark:text-[#FAF9F5]">
                    Sugestão de Edição da IA
                  </h3>
                  <p className="text-[11px] text-[#78716C] dark:text-[#A8A29E]">
                    A IA propôs uma alteração. Confira antes de aplicar ao documento.
                  </p>
                </div>
              </div>
              <button
                onClick={onReject}
                className="w-8 h-8 rounded-xl bg-[#EFECE6] dark:bg-[#232326] hover:bg-[#E5DFD5] dark:hover:bg-[#333338] text-[#78716C] dark:text-[#A8A29E] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 p-5 space-y-4">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Loader2 className="w-8 h-8 text-[#2D5A46] animate-spin" />
                  <p className="mt-3 text-sm font-semibold text-[#44403C] dark:text-[#E7E5E4]">
                    Lumina está editando seu texto...
                  </p>
                  <p className="text-xs text-[#A8A29E] mt-1">
                    Reescrevendo a seleção com clareza e precisão acadêmica.
                  </p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="mt-3 text-sm font-semibold text-red-500">
                    Não foi possível gerar a sugestão.
                  </p>
                  <p className="text-xs text-[#A8A29E] mt-1">{error}</p>
                  <button
                    onClick={onReject}
                    className="mt-4 px-4 py-2 rounded-xl bg-[#EFECE6] dark:bg-[#232326] text-[#57534E] dark:text-[#D6D3CD] text-xs font-bold cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>
              ) : (
                <>
                  {/* Original */}
                  <div className="bg-[#EFECE6] dark:bg-[#232326]/60 rounded-2xl border border-[#E7E2D9] dark:border-[#3B3B40]/80 p-4">
                    <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-[#A8A29E] mb-2">
                      Texto Original
                    </h4>
                    <p className="text-sm text-[#44403C] dark:text-[#D6D3CD] leading-relaxed whitespace-pre-wrap">
                      {selectedText}
                    </p>
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-[#EBF3EF] dark:bg-[#15221B]/70 text-[#2D5A46] dark:text-[#52B788] flex items-center justify-center border border-[#CFE1D6] dark:border-[#22392D]">
                      <ArrowLeftRight className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Sugestão */}
                  <div className="bg-gradient-to-br from-[#EBF3EF] to-[#EBF3EF] dark:from-[#15221B]/40 dark:to-[#15221B]/30 rounded-2xl border border-[#CFE1D6]/70 dark:border-[#22392D]/60 p-4">
                    <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-[#2D5A46] mb-2">
                      Sugestão da IA
                    </h4>
                    <p className="text-sm text-[#1C1917] dark:text-[#FAF9F5] leading-relaxed whitespace-pre-wrap">
                      {suggestedText}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            {!isGenerating && !error && (
              <div className="flex flex-wrap items-center justify-end gap-2.5 px-5 py-4 border-t border-[#EFECE6] dark:border-[#2C2C30]">
                <button
                  onClick={onReject}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#EFECE6] hover:bg-[#E5DFD5] dark:bg-[#232326] dark:hover:bg-[#333338] text-[#57534E] dark:text-[#D6D3CD] text-xs font-bold transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Descartar
                </button>
                <button
                  onClick={onApprove}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-[#2D5A46] to-[#1E3E30] hover:from-[#21483A] hover:to-[#1E3E30] text-white text-xs font-bold transition-all shadow-md shadow-[#2D5A46]/25 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  Aplicar Alteração
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
