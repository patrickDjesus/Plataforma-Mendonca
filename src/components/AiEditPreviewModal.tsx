import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { markdownToHTML } from '@blocknote/core';
import {
  Sparkles,
  X,
  Check,
  RotateCcw,
  Loader2,
  ArrowDown,
  Copy,
  LayoutTemplate,
  Lightbulb,
  Wand2,
  ListFilter,
  CheckCheck,
  Send,
} from 'lucide-react';
import { AiEditAction } from '../services/ai';

interface AiEditPreviewModalProps {
  isOpen: boolean;
  selectedText?: string;
  originalText?: string;
  suggestedText?: string;
  currentAction?: AiEditAction;
  action?: AiEditAction;
  customPrompt?: string;
  isGenerating?: boolean;
  isLoading?: boolean;
  error?: string | null;
  onApprove: () => void;
  onReject?: () => void;
  onClose?: () => void;
  onRetryAction?: (action: AiEditAction, customPrompt?: string) => void;
  onRetry?: (action: AiEditAction, customPrompt?: string) => void;
}

export const AiEditPreviewModal: React.FC<AiEditPreviewModalProps> = ({
  isOpen,
  selectedText,
  originalText,
  suggestedText = '',
  currentAction,
  action,
  customPrompt: initialCustomPrompt,
  isGenerating,
  isLoading,
  error,
  onApprove,
  onReject,
  onClose,
  onRetryAction,
  onRetry,
}) => {
  const [copied, setCopied] = useState(false);
  const [customPrompt, setCustomPrompt] = useState(initialCustomPrompt || '');
  const [showCustom, setShowCustom] = useState(false);

  const original = selectedText ?? originalText ?? '';
  const generating = isGenerating ?? isLoading ?? false;
  const activeAction: AiEditAction = action ?? currentAction ?? 'organize';
  const handleClose = onClose ?? onReject ?? (() => {});
  const handleRetry = onRetry ?? onRetryAction;

  const renderedHtml = useMemo(() => {
    if (!suggestedText) return '';
    try {
      return markdownToHTML(suggestedText);
    } catch {
      return '';
    }
  }, [suggestedText]);

  const handleCopy = async () => {
    if (!suggestedText) return;
    try {
      await navigator.clipboard.writeText(suggestedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim() || !handleRetry) return;
    handleRetry('custom', customPrompt.trim());
  };

  const actionButtons: { action: AiEditAction; label: string; icon: React.ReactNode }[] = [
    { action: 'organize', label: 'Organizar', icon: <LayoutTemplate className="w-3 h-3" /> },
    { action: 'simplify', label: 'Simplificar', icon: <Lightbulb className="w-3 h-3" /> },
    { action: 'improve', label: 'Melhorar', icon: <Wand2 className="w-3 h-3" /> },
    { action: 'summarize', label: 'Resumir', icon: <ListFilter className="w-3 h-3" /> },
    { action: 'fix-grammar', label: 'Corrigir', icon: <CheckCheck className="w-3 h-3" /> },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-[#121214]/65 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-white dark:bg-[#18181B] rounded-3xl shadow-2xl border border-[#E7E2D9] dark:border-[#3B3B40] overflow-hidden z-10 max-h-[88vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EFECE6] dark:border-[#2C2C30] bg-[#FAF9F5] dark:bg-[#202024]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#2D5A46] to-[#1E3E30] text-white flex items-center justify-center shadow-md shadow-[#2D5A46]/20">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-[#1C1917] dark:text-[#FAF9F5]">
                    Ajuste com IA Groq (Lumina)
                  </h3>
                  <p className="text-[11px] text-[#78716C] dark:text-[#A8A29E]">
                    Revise o texto organizado e ajustado antes de aplicar ao seu documento.
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-xl bg-[#EFECE6] dark:bg-[#28282D] hover:bg-[#E5DFD5] dark:hover:bg-[#333338] text-[#78716C] dark:text-[#A8A29E] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick action bar */}
            {handleRetry && !generating && (
              <div className="px-6 py-2.5 bg-[#F5F2EC] dark:bg-[#1C1C20] border-b border-[#EFECE6] dark:border-[#2C2C30] flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase text-[#78716C] dark:text-[#A8A29E] mr-1">
                  Ajustar:
                </span>
                {actionButtons.map(({ action: btnAction, label, icon }) => (
                  <button
                    key={btnAction}
                    type="button"
                    onClick={() => handleRetry(btnAction)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                      activeAction === btnAction
                        ? 'bg-[#2D5A46] text-white shadow-xs'
                        : 'bg-white dark:bg-[#28282D] text-[#57534E] dark:text-[#D6D3CD] hover:bg-[#EAE5DC] dark:hover:bg-[#333338] border border-[#E7E2D9] dark:border-[#38383E]'
                    }`}
                  >
                    {icon}
                    <span>{label}</span>
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setShowCustom(!showCustom)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer bg-white dark:bg-[#28282D] text-[#57534E] dark:text-[#D6D3CD] hover:bg-[#EAE5DC] dark:hover:bg-[#333338] border border-[#E7E2D9] dark:border-[#38383E]"
                >
                  <Sparkles className="w-3 h-3 text-[#2D5A46] dark:text-[#52B788]" />
                  <span>Outro ajuste</span>
                </button>
              </div>
            )}

            {/* Prompt customizado expandido */}
            {showCustom && !generating && handleRetry && (
              <div className="px-6 py-2 bg-[#FAF9F5] dark:bg-[#202024] border-b border-[#EFECE6] dark:border-[#2C2C30]">
                <form onSubmit={handleCustomSubmit} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Instrução para a IA Groq (ex: 'Divida em tópicos por relevância')..."
                    className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-[#18181B] border border-[#2D5A46] dark:border-[#52B788] text-xs text-[#1C1917] dark:text-[#FAF9F5] outline-none"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!customPrompt.trim()}
                    className="px-3 py-1.5 rounded-xl bg-[#2D5A46] text-white text-xs font-bold hover:bg-[#21483A] disabled:opacity-50 transition-colors flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    Reajustar
                  </button>
                </form>
              </div>
            )}

            {/* Body */}
            <div className="overflow-y-auto flex-1 p-6 space-y-4">
              {generating ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Loader2 className="w-8 h-8 text-[#2D5A46] dark:text-[#52B788] animate-spin" />
                  <p className="mt-3 text-sm font-semibold text-[#1C1917] dark:text-[#FAF9F5]">
                    Lumina e IA Groq estão ajustando seu texto...
                  </p>
                  <p className="text-xs text-[#78716C] dark:text-[#A8A29E] mt-1">
                    Estruturando e tornando o conteúdo mais fácil e agradável de compreender.
                  </p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <p className="text-sm font-semibold text-red-500">
                    Não foi possível gerar o ajuste.
                  </p>
                  <p className="text-xs text-[#78716C] dark:text-[#A8A29E] mt-1">{error}</p>
                  {handleRetry && (
                    <button
                      onClick={() => handleRetry('organize')}
                      className="mt-4 px-4 py-2 rounded-xl bg-[#2D5A46] text-white text-xs font-bold cursor-pointer"
                    >
                      Tentar Novamente
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* Original */}
                  <div className="bg-[#FAF9F5] dark:bg-[#202024] rounded-2xl border border-[#E7E2D9] dark:border-[#333338] p-4">
                    <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E] mb-1.5 flex items-center justify-between">
                      <span>Texto Original</span>
                      <span className="text-[9px] font-normal">{original.length} caracteres</span>
                    </h4>
                    <div className="text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E] leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">
                      {original}
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="w-7 h-7 rounded-full bg-[#EBF3EF] dark:bg-[#15221B] text-[#2D5A46] dark:text-[#52B788] flex items-center justify-center border border-[#CFE1D6] dark:border-[#22392D]">
                      <ArrowDown className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Sugestão */}
                  <div className="bg-[#F3F7F5] dark:bg-[#131F19] rounded-2xl border border-[#CFE1D6] dark:border-[#1E3B2E] p-4 relative">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-[#2D5A46] dark:text-[#52B788] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Texto Ajustado e Organizado (IA Groq)</span>
                      </h4>
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-white dark:bg-[#1E2E25] text-[#2D5A46] dark:text-[#52B788] border border-[#CFE1D6] dark:border-[#2C4839] hover:bg-[#EBF3EF] transition-colors cursor-pointer"
                        title="Copiar texto gerado"
                      >
                        <Copy className="w-3 h-3" />
                        {copied ? 'Copiado!' : 'Copiar'}
                      </button>
                    </div>
                    {renderedHtml ? (
                      <div
                        className="text-xs sm:text-sm text-[#1C1917] dark:text-[#FAF9F5] leading-relaxed max-h-60 overflow-y-auto space-y-1.5 [&_p]:my-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_strong]:font-bold [&_strong]:text-[#2D5A46] dark:[&_strong]:text-[#52B788] [&_em]:italic [&_h1]:text-base [&_h1]:font-bold [&_h2]:text-sm [&_h2]:font-bold [&_h3]:text-xs [&_h3]:font-bold [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:bg-[#E8E4DC] dark:[&_code]:bg-[#26262B] [&_code]:font-mono [&_blockquote]:border-l-2 [&_blockquote]:border-[#2D5A46] [&_blockquote]:pl-3 [&_blockquote]:italic"
                        dangerouslySetInnerHTML={{ __html: renderedHtml }}
                      />
                    ) : (
                      <div className="text-xs sm:text-sm text-[#1C1917] dark:text-[#FAF9F5] leading-relaxed whitespace-pre-wrap font-sans max-h-60 overflow-y-auto">
                        {suggestedText}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            {!generating && !error && (
              <div className="flex flex-wrap items-center justify-end gap-2.5 px-6 py-4 border-t border-[#EFECE6] dark:border-[#2C2C30] bg-[#FAF9F5] dark:bg-[#202024]">
                <button
                  onClick={handleClose}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-[#28282D] hover:bg-[#EAE5DC] dark:hover:bg-[#333338] text-[#57534E] dark:text-[#D6D3CD] text-xs font-bold border border-[#E7E2D9] dark:border-[#38383E] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Descartar
                </button>
                <button
                  onClick={onApprove}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-[#2D5A46] to-[#1E3E30] hover:from-[#21483A] hover:to-[#1E3E30] text-white text-xs font-bold transition-all shadow-md shadow-[#2D5A46]/25 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  Aplicar ao Documento
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
