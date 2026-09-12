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
      className="bg-white dark:bg-[#18181B] rounded-3xl p-6 sm:p-8 border border-[#E7E2D9]/80 dark:border-[#2C2C30] shadow-md space-y-6"
    >
      {/* A) INTERFACE ESPECÍFICA: QUÍMICA & TABELA PERIÓDICA */}
      {currentQuestion.gameType === 'chemistry' && currentQuestion.chemicalElement && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-[#EBF3EF] dark:bg-[#15221B] text-[#224A38] dark:text-[#52B788] font-bold border border-[#CFE1D6] dark:border-[#22392D]">
              {currentQuestion.subject}
            </span>
            <span className="text-[#A8A29E] font-medium">Elemento Químico</span>
          </div>

          <p className="text-sm sm:text-base font-bold text-[#1C1917] dark:text-[#FAF9F5]">
            {currentQuestion.statement}
          </p>

          {/* Card Realista de Elemento da Tabela Periódica */}
          <div className="flex justify-center py-2">
            <div 
              className="w-48 h-52 rounded-2xl p-3.5 flex flex-col justify-between shadow-lg border-2 transition-transform hover:scale-102 relative overflow-hidden bg-[#121214]"
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
                    <span className="px-1.5 py-0.5 rounded bg-[#18181B] border border-dashed border-amber-400/60 text-amber-300">Z = ??</span>
                    <span className="px-1.5 py-0.5 rounded bg-[#18181B] border border-dashed border-amber-400/60 text-amber-300">A ≈ ?? u</span>
                  </>
                ) : (
                  <>
                    <span className="text-[#A8A29E]">Z = {currentQuestion.chemicalElement.atomicNumber}</span>
                    <span className="text-[#A8A29E]">{Math.round(currentQuestion.chemicalElement.atomicMass)} u</span>
                  </>
                )}
              </div>

              {/* Centro: Símbolo Gigante */}
              <div className="text-center my-auto">
                {currentQuestion.chemicalElement.hiddenProperty === 'symbol' ? (
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#18181B]/90 border-2 border-dashed border-[#52B788] shadow-inner">
                    <span className="text-4xl font-black text-[#52B788] animate-pulse">?</span>
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
                  <span className="text-[11px] font-bold text-[#A8A29E] italic block">
                    [ Elemento Oculto ]
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-[#E7E5E4] block truncate">
                    {currentQuestion.chemicalElement.name}
                  </span>
                )}

                {currentQuestion.chemicalElement.hiddenProperty === 'family' ? (
                  <span className="text-[9px] px-2 py-0.5 rounded bg-[#232326] text-[#52B788] inline-block font-semibold border border-dashed border-[#2D5A46]/50">
                    Família: [ ? ]
                  </span>
                ) : currentQuestion.chemicalElement.hiddenProperty === 'state' ? (
                  <span className="text-[9px] px-2 py-0.5 rounded bg-[#232326] text-emerald-300 inline-block font-semibold border border-dashed border-emerald-500/50">
                    Estado: [ ? ]
                  </span>
                ) : (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#232326] text-[#D6D3CD] inline-block font-semibold">
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
            <span className="px-2.5 py-1 rounded-lg bg-[#EBF3EF] dark:bg-[#15221B] text-[#224A38] dark:text-[#52B788] font-bold border border-[#CFE1D6] dark:border-[#22392D]">
              {currentQuestion.subject}
            </span>
            <span className="text-[#A8A29E] font-medium">{currentQuestion.topic}</span>
          </div>

          <p className="text-xs sm:text-sm font-semibold text-[#57534E] dark:text-[#D6D3CD]">
            {currentQuestion.statement}
          </p>

          {/* Display Neon de Aritmética */}
          <div className="bg-[#121214] rounded-2xl p-6 border border-[#2D5A46]/30 text-center shadow-inner relative overflow-hidden">
            <div className="text-3xl sm:text-4xl font-mono font-black text-[#52B788] tracking-wider drop-shadow-md">
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
            <span className="text-[#A8A29E] font-medium">{currentQuestion.topic}</span>
          </div>

          {/* Badge de Macete Mnemônico */}
          {currentQuestion.formulaInfo.mnemonic && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-bold">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Macete: {currentQuestion.formulaInfo.mnemonic}</span>
            </div>
          )}

          <p className="text-sm sm:text-base font-semibold text-[#1C1917] dark:text-[#FAF9F5] leading-relaxed">
            {currentQuestion.statement}
          </p>
        </div>
      )}

      {/* D) INTERFACE PADRÃO / SIMULADO / SALA DO PROFESSOR */}
      {(!currentQuestion.gameType || currentQuestion.gameType === 'standard') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-[#EBF3EF] dark:bg-[#15221B] text-[#224A38] dark:text-[#52B788] font-bold border border-[#CFE1D6] dark:border-[#22392D]">
              {currentQuestion.subject}
            </span>
            <span className="text-[#A8A29E] font-medium">{currentQuestion.topic}</span>
          </div>

          <h3 className="text-sm sm:text-base font-semibold text-[#1C1917] dark:text-[#FAF9F5] leading-relaxed font-display">
            {currentQuestion.statement}
          </h3>

          {/* Imagem Ilustrativa com Zoom */}
          {currentQuestion.imageUrl && (
            <div className="relative group/img max-w-lg mx-auto rounded-2xl overflow-hidden border border-[#E7E2D9] dark:border-[#2C2C30] bg-[#EFECE6] dark:bg-[#121214]/50 shadow-sm flex flex-col items-center">
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
                className="absolute top-2 right-2 p-1.5 bg-[#18181B]/80 hover:bg-[#18181B] text-white rounded-xl backdrop-blur-sm opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer text-xs flex items-center gap-1"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Ampliar</span>
              </button>

              {currentQuestion.imageCaption && (
                <p className="p-2 text-xs text-[#78716C] dark:text-[#A8A29E] italic text-center border-t border-[#E7E2D9]/50 dark:border-[#2C2C30]/50 w-full bg-[#EFECE6]/50 dark:bg-[#18181B]/50">
                  {currentQuestion.imageCaption}
                </p>
              )}
            </div>
          )}

          {currentQuestion.codeSnippet && (
            <div className="bg-[#121214] rounded-2xl p-3.5 font-mono text-xs text-[#52B788] border border-[#2C2C30] overflow-x-auto shadow-inner">
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
          let optionStyle = 'bg-[#EFECE6]/80 dark:bg-[#232326]/50 border-[#E7E2D9]/80 dark:border-[#2C2C30] text-[#1C1917] dark:text-[#E7E5E4] hover:border-[#D6D0C5] hover:bg-[#EFECE6]/70';

          if (isAnswerConfirmed) {
            if (option.isCorrect) {
              optionStyle = 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-400/30';
            } else if (isSelected && !option.isCorrect) {
              optionStyle = 'bg-rose-50 dark:bg-rose-950/80 border-rose-500 text-rose-950 dark:text-rose-100 ring-2 ring-rose-400/30';
            }
          } else if (isSelected) {
            optionStyle = 'bg-[#EBF3EF]/90 dark:bg-[#15221B]/70 border-[#2D5A46] text-[#224A38] dark:text-[#E7E5E4] ring-2 ring-[#2D5A46]/25';
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
                    ? 'bg-[#2D5A46] text-white'
                    : 'bg-white dark:bg-[#44403C] text-[#44403C] dark:text-[#D6D3CD] border border-[#E7E2D9] dark:border-[#57534E] group-hover:border-[#2D5A46] group-hover:text-[#2D5A46] dark:group-hover:text-[#52B788]'
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
              <div className="hidden sm:flex items-center justify-center px-1.5 py-0.5 rounded-md bg-[#E7E2D9]/60 dark:bg-[#232326] text-[10px] font-mono text-[#78716C] dark:text-[#A8A29E] opacity-60 group-hover:opacity-100 transition-opacity shrink-0">
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
            className="bg-[#EBF3EF]/90 dark:bg-[#15221B]/70 border border-[#CFE1D6] dark:border-[#22392D] rounded-2xl p-4 flex items-start gap-3 text-xs text-[#224A38] dark:text-[#52B788]"
          >
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <p className="font-bold font-display text-[#224A38] dark:text-[#52B788] flex items-center gap-1.5">
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
      <div className="pt-2 border-t border-[#EFECE6] dark:border-[#2C2C30] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              onToggleHint();
              if (!showAiHint) onPlaySound('hint');
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-[#2D5A46] dark:text-[#52B788] hover:text-[#21483A] transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{showAiHint ? 'Ocultar Dica' : 'Pedir Dica Sináptica'}</span>
          </button>

          <span className="hidden md:inline-flex text-[11px] text-[#A8A29E] dark:text-[#78716C] font-mono">
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
                  ? 'bg-[#2D5A46] hover:bg-[#21483A] text-white shadow-[#2D5A46]/25 scale-102'
                  : 'bg-[#EFECE6] dark:bg-[#232326] text-[#A8A29E] dark:text-[#78716C] cursor-not-allowed'
              }`}
            >
              <span>Confirmar Resposta</span>
              {selectedOptionId && (
                <kbd className="px-1.5 py-0.5 rounded bg-[#21483A] text-[10px] font-mono text-[#CFE1D6]">↵ Enter</kbd>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={onNextQuestion}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#2D5A46] to-[#1E3E30] hover:from-[#21483A] hover:to-[#1E3E30] text-white font-bold text-xs shadow-md shadow-[#2D5A46]/25 transition-all cursor-pointer scale-102"
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