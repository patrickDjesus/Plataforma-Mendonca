import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Check, X, HelpCircle, ArrowRight, Lightbulb, Volume2 } from 'lucide-react';
import { Flashcard, Deck } from '../../types';
import { checkAnswerSimilarity, ComparisonResult } from '../../utils/similarity';
import { soundFx } from '../../utils/sound';
import { COLOR_THEMES } from '../../utils/theme';

interface WriteStudyProps {
  deck: Deck;
  cards: Flashcard[];
  onFinish: (studiedCount: number, correctCount: number) => void;
  onExit: () => void;
}

export const WriteStudy: React.FC<WriteStudyProps> = ({
  deck,
  cards,
  onFinish,
  onExit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [revealedHint, setRevealedHint] = useState<string>('');
  const [score, setScore] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const theme = COLOR_THEMES[deck.color] || COLOR_THEMES.indigo;
  const currentCard = cards[currentIndex];

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentIndex, isSubmitted]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitted || !inputVal.trim()) return;

    const result = checkAnswerSimilarity(inputVal, currentCard.back);
    setComparison(result);
    setIsSubmitted(true);

    if (result.isClose) {
      soundFx.playCorrect();
      setScore((prev) => prev + 1);
    } else {
      soundFx.playWrong();
    }
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setInputVal('');
      setComparison(null);
      setIsSubmitted(false);
      setRevealedHint('');
    } else {
      // Completed all
      const finalScore = score + (comparison?.isClose ? 1 : 0);
      onFinish(cards.length, finalScore);
    }
  };

  // Give hint
  const handleGiveHint = () => {
    const target = currentCard.back.trim();
    if (target.length <= 2) {
      setRevealedHint(target[0] + '...');
      return;
    }
    const currentLen = revealedHint ? revealedHint.replace('...', '').length : 0;
    const nextChars = target.slice(0, Math.min(target.length, currentLen + 2));
    setRevealedHint(nextChars + '...');
  };

  // Override mark as correct if user believes they were right
  const handleOverrideCorrect = () => {
    soundFx.playCorrect();
    setScore((prev) => prev + 1);
    if (comparison) {
      setComparison({ ...comparison, isClose: true, score: 100 });
    }
  };

  if (!currentCard || cards.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-[#78716C]">Nenhum cartão para o modo de escrita.</p>
        <button onClick={onExit} className="mt-4 px-4 py-2 bg-[#2D5A46] text-white rounded-xl text-sm">
          Voltar
        </button>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / cards.length) * 100);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 flex flex-col items-center">
      {/* Top action bar */}
      <div className="w-full flex items-center justify-between gap-2 mb-6">
        <button
          id="btn-write-exit"
          onClick={onExit}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#FAF9F5] px-3 py-1.5 rounded-lg hover:bg-[#EFECE6] dark:hover:bg-[#232326] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Sair</span>
        </button>

        <span className="text-xs font-bold text-[#78716C] dark:text-[#A8A29E]">
          Card {currentIndex + 1} de {cards.length}
        </span>
      </div>

      {/* Progress line */}
      <div className="w-full bg-[#E7E2D9] dark:bg-[#2C2C30] h-2 rounded-full overflow-hidden mb-6">
        <div
          className={`h-full transition-all duration-300 ${theme.bg}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Front prompt */}
      <div className="w-full bg-white dark:bg-[#232326] rounded-3xl p-6 sm:p-8 shadow-xl border border-[#E7E2D9] dark:border-[#2C2C30] mb-6 text-center">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EBF3EF] dark:bg-[#15221B] text-[#224A38] dark:text-[#52B788]">
            Digite a resposta correta
          </span>
          <button
            onClick={() => soundFx.speak(currentCard.front)}
            title="Ouvir termo"
            className="p-1 text-[#A8A29E] hover:text-[#57534E] dark:hover:text-[#E7E5E4] rounded"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-[#1C1917] dark:text-[#FAF9F5] font-['Outfit',sans-serif] leading-relaxed my-4">
          {currentCard.front}
        </h2>

        {revealedHint && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs font-medium mt-1">
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Dica: {revealedHint}</span>
          </div>
        )}
      </div>

      {/* Form / Answer verification */}
      <div className="w-full">
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                id="input-write-answer"
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Escreva sua resposta aqui..."
                className="w-full px-5 py-4 rounded-2xl border-2 border-[#D6D0C5] dark:border-[#2C2C30] bg-white dark:bg-[#232326] text-[#1C1917] dark:text-[#FAF9F5] placeholder-[#A8A29E] focus:outline-none focus:border-[#2D5A46] text-base shadow-sm"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleGiveHint}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#D6D0C5] dark:border-[#2C2C30] text-[#57534E] dark:text-[#A8A29E] hover:bg-[#EFECE6] dark:hover:bg-[#232326] text-xs font-semibold transition-colors"
              >
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Pedir Dica</span>
              </button>

              <button
                id="btn-write-submit"
                type="submit"
                disabled={!inputVal.trim()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2D5A46] hover:bg-[#21483A] disabled:opacity-50 disabled:pointer-events-none text-white text-sm font-semibold shadow-sm transition-all"
              >
                <span>Verificar Resposta</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Feedback box */}
            <div
              className={`p-6 rounded-2xl border ${
                comparison?.isClose
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <span
                  className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                    comparison?.isClose
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-rose-700 dark:text-rose-400'
                  }`}
                >
                  {comparison?.isExact ? (
                    <>
                      <Check className="w-4 h-4" /> Perfeito! Resposta exata!
                    </>
                  ) : comparison?.isClose ? (
                    <>
                      <Check className="w-4 h-4" /> Correto! (Tolerância a pequenos erros: {comparison.score}%)
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4" /> Não foi dessa vez
                    </>
                  )}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-xs font-semibold text-[#78716C] dark:text-[#A8A29E] block">
                    Sua resposta:
                  </span>
                  <p className="font-medium text-[#1C1917] dark:text-[#E7E5E4]">
                    {inputVal}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#78716C] dark:text-[#A8A29E] block">
                    Resposta esperada:
                  </span>
                  <p className="font-semibold text-[#1C1917] dark:text-[#FAF9F5]">
                    {currentCard.back}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3">
              {!comparison?.isClose && (
                <button
                  id="btn-write-override"
                  type="button"
                  onClick={handleOverrideCorrect}
                  className="text-xs text-[#2D5A46] dark:text-[#52B788] font-medium hover:underline"
                >
                  Minha resposta estava correta (considerar acerto)
                </button>
              )}

              <button
                id="btn-write-next"
                type="button"
                onClick={handleNext}
                autoFocus
                className="ml-auto flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2D5A46] hover:bg-[#21483A] text-white text-sm font-semibold shadow-sm transition-all"
              >
                <span>{currentIndex === cards.length - 1 ? 'Concluir' : 'Próximo Cartão'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
