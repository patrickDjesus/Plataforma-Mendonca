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
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-10 max-h-[85vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-purple-600/10 via-indigo-600/10 to-blue-600/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-500/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                    Sugestão de Edição da IA
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    A IA propôs uma alteração. Confira antes de aplicar ao documento.
                  </p>
                </div>
              </div>
              <button
                onClick={onReject}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 p-5 space-y-4">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                  <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Lumina está editando seu texto...
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Reescrevendo a seleção com clareza e precisão acadêmica.
                  </p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="mt-3 text-sm font-semibold text-red-500">
                    Não foi possível gerar a sugestão.
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{error}</p>
                  <button
                    onClick={onReject}
                    className="mt-4 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>
              ) : (
                <>
                  {/* Original */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-4">
                    <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                      Texto Original
                    </h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {selectedText}
                    </p>
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200 dark:border-purple-800">
                      <ArrowLeftRight className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Sugestão */}
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/30 rounded-2xl border border-purple-200/70 dark:border-purple-800/60 p-4">
                    <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-purple-500 mb-2">
                      Sugestão da IA
                    </h4>
                    <p className="text-sm text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-wrap">
                      {suggestedText}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            {!isGenerating && !error && (
              <div className="flex flex-wrap items-center justify-end gap-2.5 px-5 py-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={onReject}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Descartar
                </button>
                <button
                  onClick={onApprove}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-purple-500/25 cursor-pointer"
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
