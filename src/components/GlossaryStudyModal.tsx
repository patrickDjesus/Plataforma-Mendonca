import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Trophy,
  BookMarked,
} from 'lucide-react';
import { Discipline, NotebookDoc, GlossaryDefinition } from '../data/disciplinesData';
import { GLOBAL_GLOSSARY } from '../lib/glossary';
import { LatexRenderer } from './LatexRenderer';

export interface GlossaryStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  terms?: GlossaryDefinition[];
  currentDoc?: NotebookDoc | null;
  discipline?: Discipline | null;
  glossary?: Record<string, GlossaryDefinition>;
}

export const GlossaryStudyModal: React.FC<GlossaryStudyModalProps> = ({
  isOpen,
  onClose,
  terms,
  currentDoc,
  discipline,
  glossary,
}) => {
  // Coleta termos disponíveis se não foram passados diretamente
  const effectiveTerms = useMemo<GlossaryDefinition[]>(() => {
    if (terms && Array.isArray(terms) && terms.length > 0) {
      return terms;
    }

    const map = new Map<string, GlossaryDefinition>();

    // 0. Termos passados via props (ex: grupo/compartilhado)
    if (glossary && typeof glossary === 'object') {
      for (const [, def] of Object.entries(glossary)) {
        if (def && def.term) {
          map.set(def.term.toLowerCase(), def);
        }
      }
    }

    // 1. Termos do documento atual
    if (currentDoc && currentDoc.glossary && typeof currentDoc.glossary === 'object') {
      for (const [, def] of Object.entries(currentDoc.glossary)) {
        if (def && def.term) {
          map.set(def.term.toLowerCase(), def);
        }
      }
    }

    // 2. Termos dos documentos da disciplina
    if (discipline && Array.isArray(discipline.documents)) {
      for (const doc of discipline.documents) {
        if (doc && doc.glossary && typeof doc.glossary === 'object') {
          for (const [, def] of Object.entries(doc.glossary)) {
            if (def && def.term && !map.has(def.term.toLowerCase())) {
              map.set(def.term.toLowerCase(), def);
            }
          }
        }
      }
    }

    // 3. Termos globais
    if (GLOBAL_GLOSSARY && typeof GLOBAL_GLOSSARY === 'object') {
      for (const [, def] of Object.entries(GLOBAL_GLOSSARY)) {
        if (def && def.term && !map.has(def.term.toLowerCase())) {
          map.set(def.term.toLowerCase(), def);
        }
      }
    }

    return Array.from(map.values());
  }, [terms, currentDoc, discipline, glossary]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const [reviewList, setReviewList] = useState<GlossaryDefinition[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [deck, setDeck] = useState<GlossaryDefinition[]>([]);

  // Embaralha ao abrir o modal ou quando os termos mudarem
  useEffect(() => {
    if (isOpen && effectiveTerms.length > 0) {
      setDeck([...effectiveTerms].sort(() => Math.random() - 0.5));
      setCurrentIndex(0);
      setIsFlipped(false);
      setKnownCount(0);
      setReviewList([]);
      setIsFinished(false);
    }
  }, [isOpen, effectiveTerms]);

  const handleRestart = () => {
    setDeck([...effectiveTerms].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnownCount(0);
    setReviewList([]);
    setIsFinished(false);
  };

  if (!isOpen) return null;

  const currentCard = deck[currentIndex];
  const progressPercent = deck.length > 0 ? Math.round((currentIndex / deck.length) * 100) : 0;

  const handleAnswer = (knew: boolean) => {
    if (knew) {
      setKnownCount((c) => c + 1);
    } else {
      setReviewList((r) => [...r, currentCard]);
    }

    if (currentIndex + 1 < deck.length) {
      setIsFlipped(false);
      setCurrentIndex((i) => i + 1);
    } else {
      setIsFinished(true);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110000] flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#1C1917]/75 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl bg-white dark:bg-[#18181B] rounded-[28px] border border-[#E7E2D9] dark:border-[#2C2C30] shadow-2xl overflow-hidden z-10 flex flex-col min-h-[460px] text-[#1C1917] dark:text-[#FAF9F5]"
        >
          {/* Header */}
          <div className="p-5 border-b border-[#E7E2D9] dark:border-[#2C2C30] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#2D5A46] text-white flex items-center justify-center">
                <BookMarked className="w-4 h-4 text-emerald-100" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm">
                  Estudo Ativo de Glossário
                </h3>
                <p className="text-[11px] text-slate-500">
                  {deck.length} cartas para fixação mnemônica
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRestart}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Reiniciar baralho"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Barra de Progresso */}
          <div className="w-full h-1 bg-[#EFECE6] dark:bg-[#27272A]">
            <div
              className="h-full bg-[#2D5A46] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Conteúdo do Estudo */}
          {deck.length === 0 ? (
            <div className="p-8 flex-1 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                <BookMarked className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-bold text-base text-[#1C1917] dark:text-[#FAF9F5]">
                  Nenhum termo disponível para estudo
                </h4>
                <p className="text-xs text-[#78716C] dark:text-[#A8A29E] max-w-xs mx-auto">
                  Adicione termos ao glossário ou abra um documento com verbetes para estudar via flashcards.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#2D5A46] text-white text-xs font-bold shadow-xs hover:bg-[#21483A] transition-colors cursor-pointer"
              >
                Voltar
              </button>
            </div>
          ) : !isFinished && currentCard ? (
            <div className="p-6 flex-1 flex flex-col justify-between">
              {/* Topo do Card: Contador e Categoria */}
              <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                <span>
                  Cartão {currentIndex + 1} de {deck.length}
                </span>
                {currentCard.category && (
                  <span className="font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {currentCard.category}
                  </span>
                )}
              </div>

              {/* Área do Cartão com Virada */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="flex-1 flex flex-col items-center justify-center p-8 rounded-2xl bg-[#FAF8F5] dark:bg-[#121214] border-2 border-dashed border-[#E7E2D9] dark:border-[#2C2C30] cursor-pointer text-center select-none min-h-[220px] transition-all hover:border-[#2D5A46]/50"
              >
                {!isFlipped ? (
                  <div className="space-y-3">
                    <span className="text-[11px] uppercase tracking-widest text-slate-400 font-bold">
                      O que significa?
                    </span>
                    <h2 className="font-display font-extrabold text-2xl text-[#1C1917] dark:text-[#FAF9F5]">
                      {currentCard.term}
                    </h2>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                      Clique para virar e ver a resposta
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-w-md animate-in fade-in duration-200">
                    <span className="text-[11px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">
                      Definição
                    </span>
                    <div className="text-sm font-normal text-[#3A3632] dark:text-[#E7E5E4] leading-relaxed">
                      <LatexRenderer content={currentCard.definition || 'Sem definição cadastrada.'} />
                    </div>
                    {currentCard.example && (
                      <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 italic">
                        Exemplo: {currentCard.example}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Botões de Resposta (quando virado) */}
              <div className="mt-6">
                {!isFlipped ? (
                  <button
                    type="button"
                    onClick={() => setIsFlipped(true)}
                    className="w-full py-3 rounded-xl bg-[#2D5A46] text-white font-bold text-xs shadow-md shadow-[#2D5A46]/20 hover:bg-[#21483A] transition-all cursor-pointer"
                  >
                    Virar Cartão
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleAnswer(false)}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 font-bold text-xs hover:bg-red-100 transition-colors cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Não lembrei</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAnswer(true)}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-400 font-bold text-xs hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Lembrei</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Tela de Conclusão */
            <div className="p-8 flex-1 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-md">
                <Trophy className="w-8 h-8" />
              </div>

              <div>
                <h3 className="font-display font-bold text-xl">Sessão Concluída!</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Você revisou todos os {deck.length} termos selecionados do glossário.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full max-w-xs p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#121214] border border-[#E7E2D9] dark:border-[#2C2C30]">
                <div>
                  <div className="font-extrabold text-2xl text-emerald-600">{knownCount}</div>
                  <div className="text-[11px] text-slate-500 font-medium">Fixados</div>
                </div>
                <div>
                  <div className="font-extrabold text-2xl text-red-500">{reviewList.length}</div>
                  <div className="text-[11px] text-slate-500 font-medium">Revisar</div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full max-w-xs pt-2">
                <button
                  type="button"
                  onClick={handleRestart}
                  className="flex-1 py-2.5 rounded-xl border border-[#E7E2D9] dark:border-[#2C2C30] hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  Repetir tudo
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-[#2D5A46] hover:bg-[#21483A] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  Concluir
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
