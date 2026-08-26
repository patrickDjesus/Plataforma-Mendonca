import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  Zap, 
  ArrowRight, 
  Layers, 
  Calculator, 
  FlaskConical, 
  PenTool, 
  Clock, 
  Lightbulb, 
  Share2 
} from 'lucide-react';
import { HighYieldStudyMaterial } from '../data/highYieldMaterials';
import confetti from 'canvas-confetti';

interface StudyMaterialModalProps {
  material: HighYieldStudyMaterial | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToCaderno?: () => void;
  onNavigateToTreino?: () => void;
}

export const StudyMaterialModal: React.FC<StudyMaterialModalProps> = ({
  material,
  isOpen,
  onClose,
  onNavigateToCaderno,
  onNavigateToTreino
}) => {
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [isQuizConfirmed, setIsQuizConfirmed] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen || !material) return null;

  const handleSelectQuizOption = (index: number) => {
    if (isQuizConfirmed) return;
    setSelectedQuizOption(index);
  };

  const handleConfirmQuiz = () => {
    if (selectedQuizOption === null) return;
    setIsQuizConfirmed(true);
    if (selectedQuizOption === material.flashReviewQuestion.correctIndex) {
      try {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
      } catch { /* ignored */ }
    }
  };

  const handleCopyFormula = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const isCorrect = selectedQuizOption === material.flashReviewQuestion.correctIndex;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 z-10 overflow-hidden flex flex-col max-h-[90vh] text-slate-900 dark:text-slate-100"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800 relative z-10">
            <div className="flex items-start gap-3.5">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md"
                style={{ backgroundColor: material.color }}
              >
                <BookOpen className="w-6 h-6" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {material.discipline}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">•</span>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {material.enemIncidence}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white leading-tight">
                  {material.title}
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="py-5 overflow-y-auto flex-1 space-y-6 pr-1">
            
            {/* Resumo Direto */}
            <div className="bg-blue-50/70 dark:bg-blue-950/40 rounded-2xl p-4 border border-blue-200/70 dark:border-blue-900/60">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400 block mb-1">
                Síntese Rápida
              </span>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                {material.summary}
              </p>
            </div>

            {/* Seções de Conteúdo Estruturado */}
            <div className="space-y-5">
              {material.sections.map((section, sIdx) => (
                <div key={sIdx} className="space-y-2.5">
                  <h3 className="text-sm sm:text-base font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    {section.heading}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {section.content}
                  </p>

                  {/* Fórmula ou Código Destacado */}
                  {section.formulaOrCode && (
                    <div className="bg-slate-950 text-cyan-300 p-3.5 rounded-2xl font-mono text-xs border border-slate-800 relative group flex items-center justify-between shadow-inner">
                      <code className="break-all pr-8 leading-relaxed font-semibold">
                        {section.formulaOrCode}
                      </code>
                      <button
                        onClick={() => handleCopyFormula(section.formulaOrCode!)}
                        className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
                        title="Copiar fórmula"
                      >
                        {copiedCode === section.formulaOrCode ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}

                  {/* Callout / Dica do Professor */}
                  {section.callout && (
                    <div className="bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 p-3 rounded-r-xl text-xs text-amber-900 dark:text-amber-200 font-medium">
                      {section.callout}
                    </div>
                  )}

                  {/* Bullets */}
                  {section.keyPoints && section.keyPoints.length > 0 && (
                    <ul className="space-y-1.5 pl-2">
                      {section.keyPoints.map((pt, pIdx) => (
                        <li key={pIdx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            {/* Teste Rápido de Fixação (Flash Review) */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 space-y-3.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Teste Rápido de Fixação
                </span>
              </div>

              <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100">
                {material.flashReviewQuestion.question}
              </p>

              <div className="space-y-2">
                {material.flashReviewQuestion.options.map((opt, oIdx) => {
                  const isSelected = selectedQuizOption === oIdx;
                  const isCorrectOption = oIdx === material.flashReviewQuestion.correctIndex;

                  let optStyles = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200';
                  if (isSelected && !isQuizConfirmed) {
                    optStyles = 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-200';
                  } else if (isQuizConfirmed) {
                    if (isCorrectOption) {
                      optStyles = 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold';
                    } else if (isSelected && !isCorrectOption) {
                      optStyles = 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-900 dark:text-rose-200';
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      disabled={isQuizConfirmed}
                      onClick={() => handleSelectQuizOption(oIdx)}
                      className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${optStyles}`}
                    >
                      <span>{opt}</span>
                      {isQuizConfirmed && isCorrectOption && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      )}
                      {isQuizConfirmed && isSelected && !isCorrectOption && (
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {!isQuizConfirmed ? (
                <button
                  disabled={selectedQuizOption === null}
                  onClick={handleConfirmQuiz}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedQuizOption !== null
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Conferir Resposta
                </button>
              ) : (
                <div className={`p-3 rounded-xl text-xs ${isCorrect ? 'bg-emerald-100/70 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200' : 'bg-amber-100/70 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200'}`}>
                  <p className="font-bold mb-0.5">{isCorrect ? '🎉 Resposta Correta!' : '💡 Explicação Pedagógica:'}</p>
                  <p>{material.flashReviewQuestion.explanation}</p>
                </div>
              )}
            </div>

          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 relative z-10">
            <span className="text-xs text-slate-400">
              {material.readTime} • Plataforma Mendonça
            </span>

            <div className="flex items-center gap-2">
              {onNavigateToCaderno && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToCaderno();
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Abrir no Caderno Completo
                </button>
              )}

              {onNavigateToTreino && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToTreino();
                  }}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Treinar Questões Desse Tema</span>
                </button>
              )}
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
