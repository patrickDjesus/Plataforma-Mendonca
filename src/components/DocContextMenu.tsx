import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Copy,
  ClipboardPaste,
  BookOpen,
  SpellCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  X,
  Check,
  Ban,
  Loader2
} from 'lucide-react';
import { checkSpellingAsync, ignoreSpellWord, SpellCheckResult } from '../services/spellChecker';

interface DocContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  selectedText: string;
  onClose: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onDefineConcept?: (term: string) => void;
  onApplyCorrection?: (originalWord: string, replacement: string) => void;
  conceptExists?: boolean;
}

export const DocContextMenu: React.FC<DocContextMenuProps> = ({
  isOpen,
  position,
  selectedText,
  onClose,
  onCopy,
  onPaste,
  onDefineConcept,
  onApplyCorrection,
  conceptExists = false
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [pasted, setPasted] = useState(false);
  const [spellResult, setSpellResult] = useState<SpellCheckResult | null>(null);
  const [spellLoading, setSpellLoading] = useState(false);
  const [spellError, setSpellError] = useState<string | null>(null);

  // Executa verificação ortográfica (LanguageTool API) quando abre com texto selecionado
  useEffect(() => {
    if (!isOpen || !selectedText.trim()) {
      setSpellResult(null);
      setSpellError(null);
      setSpellLoading(false);
      return;
    }

    let cancelled = false;
    const trimmed = selectedText.trim();
    setSpellLoading(true);
    setSpellError(null);

    checkSpellingAsync(trimmed)
      .then((result) => {
        if (!cancelled) setSpellResult(result);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setSpellResult(null);
        setSpellError(
          err instanceof Error
            ? err.message
            : 'Não foi possível verificar a ortografia. Verifique sua conexão e tente novamente.'
        );
      })
      .finally(() => {
        if (!cancelled) setSpellLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, selectedText]);

  // Ajuste de posicionamento na tela para evitar estourar as bordas
  const [adjustedPos, setAdjustedPos] = useState({ top: position.y, left: position.x });

  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      const menuWidth = 280;
      const menuHeight = 360;
      const winWidth = window.innerWidth;
      const winHeight = window.innerHeight;

      let left = position.x;
      let top = position.y;

      if (left + menuWidth > winWidth - 16) {
        left = winWidth - menuWidth - 16;
      }
      if (top + menuHeight > winHeight - 16) {
        top = Math.max(16, winHeight - menuHeight - 16);
      }
      if (left < 16) left = 16;
      if (top < 16) top = 16;

      setAdjustedPos({ top, left });
    };

    updatePosition();
  }, [isOpen, position]);

  // Fechar ao clicar fora
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanSelection = selectedText.trim();

  const handleCopyAction = async () => {
    try {
      if (cleanSelection) {
        await navigator.clipboard.writeText(cleanSelection);
      }
      if (onCopy) onCopy();
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        onClose();
      }, 700);
    } catch {
      if (onCopy) onCopy();
      onClose();
    }
  };

  const handlePasteAction = async () => {
    try {
      if (onPaste) {
        onPaste();
      }
      setPasted(true);
      setTimeout(() => {
        setPasted(false);
        onClose();
      }, 500);
    } catch {
      onClose();
    }
  };

  const handleDefineAction = () => {
    if (onDefineConcept) {
      onDefineConcept(cleanSelection || '');
    }
    onClose();
  };

  // Adiciona a palavra à lista de ignoradas e a remove dos resultados atuais
  const handleIgnoreError = (word: string) => {
    ignoreSpellWord(word);
    setSpellResult(prev => {
      if (!prev) return prev;
      const errors = prev.errors.filter(e => e.word !== word);
      const hasErrors = errors.length > 0 || prev.phraseCorrections.length > 0;
      return { ...prev, errors, hasErrors, isCorrect: !hasErrors };
    });
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[99999] pointer-events-none"
        style={{ position: 'fixed' }}
      >
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.95, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -4 }}
          transition={{ duration: 0.12 }}
          style={{
            position: 'absolute',
            top: adjustedPos.top,
            left: adjustedPos.left,
            pointerEvents: 'auto'
          }}
          className="w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 p-2 text-slate-800 dark:text-slate-100 font-sans z-[99999] backdrop-blur-md backdrop-saturate-150"
        >
          {/* Header do Menu */}
          <div className="flex items-center justify-between px-2.5 py-1.5 pb-2 border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <span>Ações do Documento</span>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Opções Básicas: Copiar & Colar */}
          <div className="py-1 space-y-0.5">
            <button
              onClick={handleCopyAction}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 dark:group-hover:bg-blue-950/60 dark:group-hover:text-blue-400 transition-colors">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </div>
                <span>{copied ? 'Copiado para a área!' : 'Copiar'}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Ctrl+C</span>
            </button>

            <button
              onClick={handlePasteAction}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 dark:group-hover:bg-blue-950/60 dark:group-hover:text-blue-400 transition-colors">
                  {pasted ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <ClipboardPaste className="w-3.5 h-3.5" />}
                </div>
                <span>{pasted ? 'Colado!' : 'Colar'}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Ctrl+V</span>
            </button>
          </div>

          <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

          {/* Opção Principal: Definir Conceito / Glossário */}
          <div className="py-1">
            <button
              onClick={handleDefineAction}
              disabled={!cleanSelection}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all ${
                cleanSelection
                  ? 'bg-blue-50 hover:bg-blue-100/80 text-blue-700 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 cursor-pointer shadow-xs'
                  : 'text-slate-400 dark:text-slate-600 cursor-not-allowed bg-slate-50 dark:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${cleanSelection ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400 dark:bg-slate-700'}`}>
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <div className="truncate text-left">
                  <div className="truncate">
                    {conceptExists ? 'Conceito Definido' : 'Definir Conceito'}
                  </div>
                  {cleanSelection && (
                    <div className="text-[10px] font-normal text-blue-600 dark:text-blue-400 truncate max-w-[150px]">
                      &quot;{cleanSelection}&quot;
                    </div>
                  )}
                </div>
              </div>
              <span className="text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-md font-medium shrink-0">
                {conceptExists ? 'Editar' : 'Glossário'}
              </span>
            </button>
          </div>

          <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

          {/* Seção do Corretor Ortográfico (LanguageTool API, pt-BR) */}
          <div className="pt-1">
            <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-slate-600 dark:text-slate-300">
              <SpellCheck className="w-3.5 h-3.5 text-indigo-500" />
              <span>Corretor Ortográfico</span>
            </div>

            {!cleanSelection ? (
              <div className="px-2.5 py-2 text-[11px] text-slate-400 dark:text-slate-500 italic bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                Selecione uma palavra ou trecho para verificar a ortografia.
              </div>
            ) : spellLoading ? (
              <div className="flex items-center gap-2 px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 text-xs font-medium mt-1">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-500 shrink-0" />
                <span>Verificando ortografia...</span>
              </div>
            ) : spellError ? (
              <div className="flex items-start gap-2 px-2.5 py-2 rounded-xl bg-red-50/70 dark:bg-red-950/30 border border-red-200/70 dark:border-red-900/50 text-red-700 dark:text-red-300 text-[11px] font-medium mt-1">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                <span>{spellError}</span>
              </div>
            ) : spellResult?.hasErrors ? (
              <div className="p-2 bg-amber-50/70 dark:bg-amber-950/30 rounded-xl border border-amber-200/70 dark:border-amber-900/50 space-y-2 mt-1 max-h-48 overflow-y-auto">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Possível erro ortográfico</span>
                </div>

                {/* Lista de erros e sugestões diretas */}
                {spellResult.errors.map((err, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-amber-200/50 dark:border-amber-900/40 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-red-600 dark:text-red-400 line-through">
                        {err.word}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                      {err.reason}
                    </p>

                    {err.suggestions.length > 0 ? (
                      <div>
                        <div className="text-[10px] font-semibold text-slate-400 mb-1">
                          Sugestões corretas:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {err.suggestions.map((sug, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => {
                                if (onApplyCorrection) {
                                  onApplyCorrection(err.word, sug);
                                }
                                onClose();
                              }}
                              className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] border border-emerald-200 dark:border-emerald-800 transition-colors flex items-center gap-1 cursor-pointer"
                              title={`Substituir "${err.word}" por "${sug}"`}
                            >
                              <span>{sug}</span>
                              <ArrowRight className="w-2.5 h-2.5 opacity-60" />
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-400 italic">
                        Verifique a grafia ou consulte o dicionário.
                      </div>
                    )}

                    <div className="pt-1 border-t border-amber-100 dark:border-amber-900/40 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => handleIgnoreError(err.word)}
                        className="flex items-center gap-1 px-1.5 py-1 rounded-md text-[10px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title={`Não marcar mais "${err.word}" como erro`}
                      >
                        <Ban className="w-3 h-3" />
                        Ignorar sugestão
                      </button>
                    </div>
                  </div>
                ))}

                {/* Correções de expressões frasais */}
                {spellResult.phraseCorrections.map((pc, idx) => (
                  <div key={`phrase-${idx}`} className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-amber-200/50 dark:border-amber-900/40 space-y-1">
                    <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Regra de estilo / gramática:
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      {pc.explanation}
                    </div>
                    <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      Prefira: {pc.suggestion}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 px-2.5 py-2 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mt-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Ortografia correta verificada</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
