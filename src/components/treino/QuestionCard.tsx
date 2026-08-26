import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lightbulb, Sparkles, ArrowRight, Maximize2 } from 'lucide-react';
import { QuizQuestion } from '../../types/design';
import { playSound } from '../../utils/sounds';

interface QuestionCardProps {
  currentQuestion: QuizQuestion;
  selectedOptionId: string | null;
  isAnswerConfirmed: boolean;
  showAiHint: boolean;
  hasWrongAttempt: boolean;
  onSelectOption: (optionId: string) => void;
  onConfirmAnswer: () => void;
  onNextQuestion: () => void;
  onSetZoomImageUrl: (url: string | null) => void;
  onToggleHint: () => void;
  onPlaySound: typeof playSound;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  currentQuestion,
  selectedOptionId,
  isAnswerConfirmed,
  showAiHint,
  hasWrongAttempt,
  onSelectOption,
  onConfirmAnswer,
  onNextQuestion,
  onSetZoomImageUrl,
  onToggleHint,
  onPlaySound,
}) => {
  return (
    <motion.div
      key={currentQuestion.id}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-6"
    >
      {/* A) INTERFACE ESPECÍFICA: QUÍMICA & TABELA PERIÓDICA */}
      {currentQuestion.gameType === 'chemistry' && currentQuestion.chemicalElement && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800">
              {currentQuestion.subject}
            </span>
            <span className="text-slate-400 font-medium">Elemento Químico</span>
          </div>

          <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
            {currentQuestion.statement}
          </p>

          {/* Card Realista de Elemento da Tabela Periódica */}
          <div className="flex justify-center py-2">
            <div 
              className="w-48 h-52 rounded-2xl p-3.5 flex flex-col justify-between shadow-lg border-2 transition-transform hover:scale-102 relative overflow-hidden bg-slate-950"
              style={{ borderColor: currentQuestion.chemicalElement.color }}
            >
              {/* Brilho de fundo */}
              <div 
                className="absolute -right-8 -top-8 w-28 h-28 rounded-full opacity-20 blur-xl pointer-events-none"
                style={{ backgroundColor: currentQuestion.chemicalElement.color }}
              />

              {/* Topo: Z e Massa */}
              <div className="flex items-center justify-between text-xs font-mono font-bold">
                {currentQuestion.chemicalElement.hiddenProperty === 'atomicInfo' ? (
                  <>
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-dashed border-amber-400/60 text-amber-300">Z = ??</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-dashed border-amber-400/60 text-amber-300">A ≈ ?? u</span>
                  </>
                ) : (
                  <>
                    <span className="text-slate-400">Z = {currentQuestion.chemicalElement.atomicNumber}</span>
                    <span className="text-slate-400">{Math.round(currentQuestion.chemicalElement.atomicMass)} u</span>
                  </>
                )}
              </div>

              {/* Centro: Símbolo Gigante */}
              <div className="text-center my-auto">
                {currentQuestion.chemicalElement.hiddenProperty === 'symbol' ? (
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900/90 border-2 border-dashed border-cyan-400 shadow-inner">
                    <span className="text-4xl font-black text-cyan-300 animate-pulse">?</span>
                  </div>
                ) : (
                  <span 
                    className="text-5xl font-black font-display tracking-tight drop-shadow-md block"
                    style={{ color: currentQuestion.chemicalElement.color }}
                  >
                    {currentQuestion.chemicalElement.symbol}
                  </span>
                )}
              </div>

              {/* Rodapé do Card: Nome e Família/Estado */}
              <div className="text-center space-y-1">
                {currentQuestion.chemicalElement.hiddenProperty === 'name' ? (
                  <span className="text-[11px] font-bold text-slate-400 italic block">
                    [ Elemento Oculto ]
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-slate-200 block truncate">
                    {currentQuestion.chemicalElement.name}
                  </span>
                )}

                {currentQuestion.chemicalElement.hiddenProperty === 'family' ? (
                  <span className="text-[9px] px-2 py-0.5 rounded bg-slate-800 text-purple-300 inline-block font-semibold border border-dashed border-purple-500/50">
                    Família: [ ? ]
                  </span>
                ) : currentQuestion.chemicalElement.hiddenProperty === 'state' ? (
                  <span className="text-[9px] px-2 py-0.5 rounded bg-slate-800 text-emerald-300 inline-block font-semibold border border-dashed border-emerald-500/50">
                    Estado: [ ? ]
                  </span>
                ) : (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 inline-block font-semibold">
                    {currentQuestion.chemicalElement.family}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* B) INTERFACE ESPECÍFICA: CÁLCULO MENTAL ARCADE */}
      {currentQuestion.gameType === 'math' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 font-bold border border-cyan-200 dark:border-cyan-800">
              {currentQuestion.subject}
            </span>
            <span className="text-slate-400 font-medium">{currentQuestion.topic}</span>
          </div>

          <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
            {currentQuestion.statement}
          </p>

          {/* Display Neon de Aritmética */}
          <div className="bg-slate-950 rounded-2xl p-6 border border-cyan-500/30 text-center shadow-inner relative overflow-hidden">
            <div className="text-3xl sm:text-4xl font-mono font-black text-cyan-400 tracking-wider drop-shadow-md">
              {currentQuestion.mathExpression || currentQuestion.statement}
            </div>
          </div>
        </div>
      )}

      {/* C) INTERFACE ESPECÍFICA: FÓRMULAS ENEM & MACETES */}
      {currentQuestion.gameType === 'formula' && currentQuestion.formulaInfo && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800">
              {currentQuestion.subject}
            </span>
            <span className="text-slate-400 font-medium">{currentQuestion.topic}</span>
          </div>

          {/* Badge de Macete Mnemônico */}
          {currentQuestion.formulaInfo.mnemonic && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-bold">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Macete: {currentQuestion.formulaInfo.mnemonic}</span>
            </div>
          )}

          <p className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">
            {currentQuestion.statement}
          </p>
        </div>
      )}

      {/* D) INTERFACE PADRÃO / SIMULADO / SALA DO PROFESSOR */}
      {(!currentQuestion.gameType || currentQuestion.gameType === 'standard') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
              {currentQuestion.subject}
            </span>
            <span className="text-slate-400 font-medium">{currentQuestion.topic}</span>
          </div>

          <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white leading-relaxed font-display">
            {currentQuestion.statement}
          </h3>

          {/* Imagem Ilustrativa com Zoom */}
          {currentQuestion.imageUrl && (
            <div className="relative group/img max-w-lg mx-auto rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 shadow-sm flex flex-col items-center">
              <img
                src={currentQuestion.imageUrl}
                alt={currentQuestion.imageCaption || 'Imagem da questão'}
                className="max-h-64 w-auto object-contain rounded-2xl cursor-zoom-in"
                onClick={() => onSetZoomImageUrl(currentQuestion.imageUrl || null)}
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />

              <button
                type="button"
                onClick={() => onSetZoomImageUrl(currentQuestion.imageUrl || null)}
                className="absolute top-2 right-2 p-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-xl backdrop-blur-sm opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer text-xs flex items-center gap-1"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Ampliar</span>
              </button>

              {currentQuestion.imageCaption && (
                <p className="p-2 text-xs text-slate-500 dark:text-slate-400 italic text-center border-t border-slate-200/50 dark:border-slate-800/50 w-full bg-slate-100/50 dark:bg-slate-900/50">
                  {currentQuestion.imageCaption}
                </p>
              )}
            </div>
          )}

          {currentQuestion.codeSnippet && (
            <div className="bg-slate-950 rounded-2xl p-3.5 font-mono text-xs text-cyan-300 border border-slate-800 overflow-x-auto shadow-inner">
              <pre>{currentQuestion.codeSnippet}</pre>
            </div>
          )}
        </div>
      )}

      {/* GRID DE ALTERNATIVAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
        {currentQuestion.options.map((option, idx) => {
          const isSelected = selectedOptionId === option.id;
          const keyNumber = idx + 1;
          let optionStyle = 'bg-slate-50/80 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300 hover:bg-slate-100/70';

          if (isAnswerConfirmed) {
            if (option.isCorrect) {
              optionStyle = 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-400/30';
            } else if (isSelected && !option.isCorrect) {
              optionStyle = 'bg-rose-50 dark:bg-rose-950/80 border-rose-500 text-rose-950 dark:text-rose-100 ring-2 ring-rose-400/30';
            }
          } else if (isSelected) {
            optionStyle = 'bg-cyan-50/90 dark:bg-cyan-950/70 border-cyan-600 text-cyan-950 dark:text-cyan-100 ring-2 ring-cyan-500/25';
          }

          return (
            <button
              key={option.id}
              onClick={() => onSelectOption(option.id)}
              disabled={isAnswerConfirmed}
              className={`text-left p-3.5 rounded-2xl border transition-all duration-200 flex items-start gap-3 cursor-pointer group relative ${optionStyle}`}
            >
              <div
                className={`w-7 h-7 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 transition-colors ${
                  isAnswerConfirmed && option.isCorrect
                    ? 'bg-emerald-500 text-white'
                    : isAnswerConfirmed && isSelected && !option.isCorrect
                    ? 'bg-rose-500 text-white'
                    : isSelected
                    ? 'bg-cyan-600 text-white'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 group-hover:border-cyan-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-300'
                }`}
              >
                {option.id}
              </div>

              <div className="flex-1 pt-0.5">
                <p className="text-xs sm:text-sm leading-relaxed font-medium">{option.text}</p>
                {isAnswerConfirmed && (
                  <p className={`text-xs mt-1.5 font-semibold ${option.isCorrect ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-400'}`}>
                    {option.explanation}
                  </p>
                )}
              </div>

              {/* Atalho de Teclado Badge */}
              <div className="hidden sm:flex items-center justify-center px-1.5 py-0.5 rounded-md bg-slate-200/60 dark:bg-slate-800 text-[10px] font-mono text-slate-500 dark:text-slate-400 opacity-60 group-hover:opacity-100 transition-opacity shrink-0">
                {keyNumber}
              </div>
            </button>
          );
        })}
      </div>

      {/* Dica Pedagógica Synapse */}
      <AnimatePresence>
        {showAiHint && currentQuestion.aiHint && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: 10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-purple-50/90 dark:bg-purple-950/70 border border-purple-200 dark:border-purple-800 rounded-2xl p-4 flex items-start gap-3 text-xs text-purple-950 dark:text-purple-200"
          >
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <p className="font-bold font-display text-purple-900 dark:text-purple-100 flex items-center gap-1.5">
                <span>Dica Sináptica:</span>
                {hasWrongAttempt && (
                  <span className="text-[10px] bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 px-2 py-0.5 rounded-md font-bold">
                    Você perdeu 1 vida! Veja o raciocínio abaixo:
                  </span>
                )}
              </p>
              <p className="leading-relaxed font-medium">{currentQuestion.aiHint}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Barra Inferior de Ações de Resposta */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              onToggleHint();
              if (!showAiHint) onPlaySound('hint');
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{showAiHint ? 'Ocultar Dica' : 'Pedir Dica Sináptica'}</span>
          </button>

          <span className="hidden md:inline-flex text-[11px] text-slate-400 dark:text-slate-500 font-mono">
            Atalhos: [1-4] Selecionar • [Enter] Confirmar
          </span>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {!isAnswerConfirmed ? (
            <button
              type="button"
              onClick={onConfirmAnswer}
              disabled={!selectedOptionId}
              className={`flex items-center gap-1.5 px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer ${
                selectedOptionId
                  ? 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-cyan-500/25 scale-102'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Confirmar Resposta</span>
              {selectedOptionId && (
                <kbd className="px-1.5 py-0.5 rounded bg-cyan-700 text-[10px] font-mono text-cyan-100">↵ Enter</kbd>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={onNextQuestion}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-500/25 transition-all cursor-pointer scale-102"
            >
              <span>Próxima Pergunta</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/20 text-[10px] font-mono text-white">↵</kbd>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
