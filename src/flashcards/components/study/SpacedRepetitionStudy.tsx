import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Volume2, Star, Sparkles, CheckCircle2, RotateCcw, Brain, Clock } from 'lucide-react';
import { Flashcard, Deck } from '../../types';
import { SM2Rating, getIntervalPreview } from '../../utils/sm2';
import { soundFx } from '../../utils/sound';
import { COLOR_THEMES } from '../../utils/theme';

interface SpacedRepetitionStudyProps {
  deck: Deck;
  cards: Flashcard[];
  onToggleStar: (cardId: string) => void;
  onRateCard: (cardId: string, rating: SM2Rating) => void;
  onFinish: (studiedCount: number, correctCount: number) => void;
  onExit: () => void;
}

export const SpacedRepetitionStudy: React.FC<SpacedRepetitionStudyProps> = ({
  deck,
  cards: rawCards,
  onToggleStar,
  onRateCard,
  onFinish,
  onExit,
}) => {
  // Queue cards: prioritize due cards first, then learning/new
  const now = Date.now();
  const sortedCards = [...rawCards].sort((a, b) => {
    const aDue = a.dueDate || 0;
    const bDue = b.dueDate || 0;
    return aDue - bDue;
  });

  const [queue, setQueue] = useState<Flashcard[]>(sortedCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const currentCard = queue[currentIndex];
  const theme = COLOR_THEMES[deck.color] || COLOR_THEMES.indigo;

  const handleReveal = useCallback(() => {
    soundFx.playFlip();
    setIsAnswerRevealed(true);
  }, []);

  const handleRating = useCallback(
    (rating: SM2Rating) => {
      if (!currentCard) return;

      if (rating >= 3) {
        soundFx.playCorrect();
        setCorrectCount((prev) => prev + 1);
      } else {
        soundFx.playWrong();
      }

      onRateCard(currentCard.id, rating);
      const newReviewedCount = reviewedCount + 1;
      setReviewedCount(newReviewedCount);

      if (currentIndex < queue.length - 1) {
        setIsAnswerRevealed(false);
        setCurrentIndex((prev) => prev + 1);
      } else {
        // Finished spaced repetition session
        onFinish(newReviewedCount, rating >= 3 ? correctCount + 1 : correctCount);
      }
    },
    [currentCard, reviewedCount, currentIndex, queue.length, onRateCard, correctCount, onFinish]
  );

  // Keyboard navigation for Spaced Repetition
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (!isAnswerRevealed) {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          handleReveal();
        }
      } else {
        if (e.key === '1') {
          handleRating(0); // Não sei
        } else if (e.key === '2') {
          handleRating(1); // Muito difícil
        } else if (e.key === '3') {
          handleRating(2); // Razoável
        } else if (e.key === '4') {
          handleRating(3); // Fácil
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswerRevealed, handleReveal, handleRating]);

  if (!currentCard || queue.length === 0) {
    return (
      <div className="p-8 text-center max-w-md mx-auto">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-[#1C1917] dark:text-[#FAF9F5]">Todas as revisões em dia!</h3>
        <p className="text-xs text-[#78716C] mt-1">
          Não há cards pendentes para o algoritmo SM-2 neste momento.
        </p>
        <button
          onClick={onExit}
          className="mt-4 px-5 py-2 bg-[#2D5A46] text-white rounded-xl text-sm font-semibold"
        >
          Voltar ao Baralho
        </button>
      </div>
    );
  }

  const intervalPreviews = getIntervalPreview(currentCard);
  const progressPercent = Math.round(((currentIndex + 1) / queue.length) * 100);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 flex flex-col items-center">
      {/* Top action bar */}
      <div className="w-full flex items-center justify-between gap-2 mb-6">
        <button
          id="btn-spaced-exit"
          onClick={onExit}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#FAF9F5] px-3 py-1.5 rounded-lg hover:bg-[#EFECE6] dark:hover:bg-[#232326] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Sair</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-[#EBF3EF] dark:bg-[#15221B] text-[#224A38] dark:text-[#52B788] border border-[#C9DDD2] dark:border-[#33493F]">
            <Brain className="w-3.5 h-3.5" />
            <span>Repetição Espaçada (SM-2)</span>
          </span>
          <span className="text-xs font-bold text-[#78716C] dark:text-[#A8A29E]">
            {currentIndex + 1} / {queue.length}
          </span>
        </div>
      </div>

      {/* Progress line */}
      <div className="w-full bg-[#E7E2D9] dark:bg-[#2C2C30] h-2 rounded-full overflow-hidden mb-6">
        <div
          className={`h-full transition-all duration-300 ${theme.bg}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Card Box */}
      <div className="w-full perspective-1000 mb-6">
        <div
          className={`grid transform-style-3d transition-transform duration-500 rounded-3xl border border-[#E7E2D9] dark:border-[#2C2C30] ${
            isAnswerRevealed ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT FACE */}
          <div
            id="flashcard-3d-box"
            onClick={handleReveal}
            className="[grid-area:1/1] backface-hidden cursor-pointer w-full min-h-[360px] bg-white dark:bg-[#232326] rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EFECE6] dark:bg-[#232326] text-[#44403C] dark:text-[#D6D3CD]">
                  {currentCard.status === 'mastered'
                    ? 'Dominado'
                    : currentCard.status === 'learning'
                    ? 'Aprendendo'
                    : currentCard.status === 'review'
                    ? 'Em Revisão'
                    : 'Novo'}
                </span>
                {currentCard.tag && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#EFECE6] dark:bg-[#232326] text-[#78716C]">
                    {currentCard.tag}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  id="btn-spaced-tts"
                  onClick={(e) => {
                    e.stopPropagation();
                    soundFx.speak(currentCard.front);
                  }}
                  title="Ouvir"
                  className="p-1.5 rounded-lg text-[#A8A29E] hover:text-[#57534E] dark:hover:text-[#E7E5E4] hover:bg-[#EFECE6] dark:hover:bg-[#232326] transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  id="btn-spaced-star"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStar(currentCard.id);
                  }}
                  className={`p-1.5 rounded-lg transition-colors ${
                    currentCard.starred
                      ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                      : 'text-[#A8A29E] hover:text-amber-500 hover:bg-[#EFECE6] dark:hover:bg-[#232326]'
                  }`}
                >
                  <Star className={`w-4 h-4 ${currentCard.starred ? 'fill-amber-500' : ''}`} />
                </button>
              </div>
            </div>

            {/* Question Front */}
            <div className="py-6 text-center">
              <span className="text-xs font-semibold text-[#A8A29E] dark:text-[#78716C] uppercase tracking-widest block mb-2">
                Pergunta / Termo
              </span>
              <p className="text-xl sm:text-2xl font-bold text-[#1C1917] dark:text-[#FAF9F5] font-['Outfit',sans-serif] leading-relaxed">
                {currentCard.front}
              </p>
            </div>

            {/* Reveal Hint */}
            <div className="text-center pt-6 border-t border-[#E7E2D9] dark:border-[#2C2C30]">
              <span className="text-xs font-semibold text-[#A8A29E] dark:text-[#78716C] uppercase tracking-wider">
                Clique no card para ver a resposta [Espaço]
              </span>
            </div>
          </div>

          {/* BACK FACE */}
          <div className="[grid-area:1/1] backface-hidden rotate-y-180 w-full min-h-[360px] bg-[#FAF8F5] dark:bg-[#1A1A1D] rounded-3xl p-6 sm:p-8 shadow-xl border border-[#CFE1D6] dark:border-[#22392D] flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EBF3EF] dark:bg-[#1D2B24] text-[#2D5A46] dark:text-[#52B788]">
                  {currentCard.status === 'mastered'
                    ? 'Dominado'
                    : currentCard.status === 'learning'
                    ? 'Aprendendo'
                    : currentCard.status === 'review'
                    ? 'Em Revisão'
                    : 'Novo'}
                </span>
                {currentCard.tag && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#EFECE6] dark:bg-[#232326] text-[#78716C]">
                    {currentCard.tag}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  id="btn-spaced-tts-back"
                  onClick={() => soundFx.speak(currentCard.back)}
                  title="Ouvir resposta"
                  className="p-1.5 rounded-lg text-[#A8A29E] hover:text-[#57534E] dark:hover:text-[#E7E5E4] hover:bg-[#EFECE6] dark:hover:bg-[#232326] transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  id="btn-spaced-star-back"
                  onClick={() => onToggleStar(currentCard.id)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    currentCard.starred
                      ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                      : 'text-[#A8A29E] hover:text-amber-500 hover:bg-[#EFECE6] dark:hover:bg-[#232326]'
                  }`}
                >
                  <Star className={`w-4 h-4 ${currentCard.starred ? 'fill-amber-500' : ''}`} />
                </button>
              </div>
            </div>

            {/* Answer Back */}
            <div className="py-6 text-center">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-2">
                Resposta / Definição
              </span>
              <p className="text-lg sm:text-xl font-medium text-[#1C1917] dark:text-[#FAF9F5] leading-relaxed">
                {currentCard.back}
              </p>
            </div>

            {/* Rating Hint */}
            <div className="text-center pt-6 border-t border-[#E7E2D9] dark:border-[#2C2C30]">
              <span className="text-xs font-semibold text-[#A8A29E] dark:text-[#78716C] uppercase tracking-wider">
                Como foi lembrar deste card? Avalie abaixo.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SM-2 4 Rating Buttons */}
      {isAnswerRevealed && (
        <div className="w-full animate-in fade-in slide-in-from-bottom-3 duration-200">
          <p className="text-center text-xs font-semibold text-[#78716C] dark:text-[#A8A29E] uppercase tracking-wider mb-2.5">
            Como foi lembrar deste card?
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Errei */}
            <button
              id="btn-sm2-again"
              onClick={() => handleRating(0)}
              className="p-3 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 flex flex-col items-center justify-center transition-all hover:scale-102 group"
            >
              <span className="text-xs font-bold text-rose-700 dark:text-rose-400">
                1. Não sei
              </span>
              <span className="text-[11px] text-rose-600/80 dark:text-rose-400/80 font-mono mt-0.5">
                {intervalPreviews[0]}
              </span>
            </button>

            {/* Muito difícil */}
            <button
              id="btn-sm2-hard"
              onClick={() => handleRating(1)}
              className="p-3 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/50 flex flex-col items-center justify-center transition-all hover:scale-102 group"
            >
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                2. Muito difícil
              </span>
              <span className="text-[11px] text-amber-600/80 dark:text-amber-400/80 font-mono mt-0.5">
                {intervalPreviews[1]}
              </span>
            </button>

            {/* Razoável */}
            <button
              id="btn-sm2-good"
              onClick={() => handleRating(2)}
              className="p-3 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 flex flex-col items-center justify-center transition-all hover:scale-102 group"
            >
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                3. Razoável
              </span>
              <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 font-mono mt-0.5">
                {intervalPreviews[2]}
              </span>
            </button>

            {/* Fácil */}
            <button
              id="btn-sm2-easy"
              onClick={() => handleRating(3)}
              className="p-3 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 flex flex-col items-center justify-center transition-all hover:scale-102 group"
            >
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400">
                4. Fácil
              </span>
              <span className="text-[11px] text-blue-600/80 dark:text-blue-400/80 font-mono mt-0.5">
                {intervalPreviews[3]}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
