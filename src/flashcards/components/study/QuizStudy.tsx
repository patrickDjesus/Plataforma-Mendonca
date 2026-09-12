import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, Trophy, Flame, HelpCircle, Volume2 } from 'lucide-react';
import { Flashcard, Deck } from '../../types';
import { soundFx } from '../../utils/sound';
import { COLOR_THEMES } from '../../utils/theme';

interface QuizStudyProps {
  deck: Deck;
  allDecks: Deck[];
  cards: Flashcard[];
  onFinish: (studiedCount: number, correctCount: number) => void;
  onExit: () => void;
}

interface QuizQuestion {
  card: Flashcard;
  options: string[];
  correctIndex: number;
}

export const QuizStudy: React.FC<QuizStudyProps> = ({
  deck,
  allDecks,
  cards,
  onFinish,
  onExit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  const theme = COLOR_THEMES[deck.color] || COLOR_THEMES.indigo;

  // Pre-generate quiz questions with options
  const questions: QuizQuestion[] = useMemo(() => {
    // Collect possible distractors from this deck + other decks if needed
    const allDefs = Array.from(
      new Set(
        allDecks
          .flatMap((d) => d.cards.map((c) => c.back))
          .filter((def) => def.trim().length > 0)
      )
    );

    return cards.map((card) => {
      const correctAnswer = card.back;
      // Filter out correct answer from distractors pool
      const pool = allDefs.filter((d) => d !== correctAnswer);
      // Pick 3 random distractors
      const shuffledPool = [...pool].sort(() => Math.random() - 0.5);
      const distractors = shuffledPool.slice(0, 3);

      // If we don't have 3 distractors, fill with generic options
      while (distractors.length < 3) {
        distractors.push(`Alternativa ${distractors.length + 1} para ${card.front}`);
      }

      const allOptions = [correctAnswer, ...distractors].sort(() => Math.random() - 0.5);
      const correctIndex = allOptions.indexOf(correctAnswer);

      return {
        card,
        options: allOptions,
        correctIndex,
      };
    });
  }, [cards, allDecks]);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;

    setSelectedOption(index);
    setIsAnswered(true);

    const isCorrect = index === currentQ.correctIndex;
    if (isCorrect) {
      soundFx.playCorrect();
      setScore((prev) => prev + 1);
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
    } else {
      soundFx.playWrong();
      setCurrentStreak(0);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Completed quiz
      onFinish(questions.length, score + (selectedOption === currentQ?.correctIndex ? 1 : 0));
    }
  };

  // Keyboard navigation 1, 2, 3, 4
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (!isAnswered) {
        if (['1', '2', '3', '4'].includes(e.key)) {
          const idx = parseInt(e.key, 10) - 1;
          if (idx >= 0 && idx < 4) {
            handleSelectOption(idx);
          }
        }
      } else {
        if (e.code === 'Space' || e.code === 'Enter' || e.code === 'ArrowRight') {
          e.preventDefault();
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (!currentQ || questions.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-[#78716C]">Cartões insuficientes para o modo quiz.</p>
        <button onClick={onExit} className="mt-4 px-4 py-2 bg-[#2D5A46] text-white rounded-xl text-sm">
          Voltar
        </button>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 flex flex-col items-center">
      {/* Top action bar */}
      <div className="w-full flex items-center justify-between gap-2 mb-6">
        <button
          id="btn-quiz-exit"
          onClick={onExit}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#FAF9F5] px-3 py-1.5 rounded-lg hover:bg-[#EFECE6] dark:hover:bg-[#232326] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Sair</span>
        </button>

        <div className="flex items-center gap-3">
          {currentStreak >= 2 && (
            <div className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 animate-bounce">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{currentStreak} seguidas!</span>
            </div>
          )}
          <span className="text-xs font-bold text-[#78716C] dark:text-[#A8A29E]">
            {currentIndex + 1} de {questions.length}
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

      {/* Question Card */}
      <div className="w-full bg-white dark:bg-[#232326] rounded-3xl p-6 sm:p-8 shadow-xl border border-[#E7E2D9] dark:border-[#2C2C30] mb-6 text-center">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EBF3EF] dark:bg-[#15221B] text-[#224A38] dark:text-[#52B788]">
            Qual a resposta correta?
          </span>
          <button
            onClick={() => soundFx.speak(currentQ.card.front)}
            title="Ouvir termo"
            className="p-1 text-[#A8A29E] hover:text-[#57534E] dark:hover:text-[#E7E5E4] rounded"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1C1917] dark:text-[#FAF9F5] font-['Outfit',sans-serif] leading-relaxed my-4">
          {currentQ.card.front}
        </h2>
      </div>

      {/* 4 Multiple Choice Options */}
      <div className="w-full space-y-3 mb-6">
        {currentQ.options.map((option, index) => {
          const isSelected = selectedOption === index;
          const isCorrect = index === currentQ.correctIndex;

          let btnStyle =
            'bg-white dark:bg-[#232326] border-[#E7E2D9] dark:border-[#2C2C30] text-[#1C1917] dark:text-[#E7E5E4] hover:border-[#2D5A46] dark:hover:border-[#52B788] hover:bg-[#EBF3EF]/30';

          if (isAnswered) {
            if (isCorrect) {
              btnStyle =
                'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-semibold ring-2 ring-emerald-400/50';
            } else if (isSelected && !isCorrect) {
              btnStyle =
                'bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-900 dark:text-rose-200 ring-2 ring-rose-400/50';
            } else {
              btnStyle = 'opacity-40 border-[#E7E2D9] dark:border-[#2C2C30] text-[#78716C]';
            }
          }

          const optionLabels = ['A', 'B', 'C', 'D'];

          return (
            <button
              key={index}
              id={`btn-quiz-option-${index}`}
              onClick={() => handleSelectOption(index)}
              disabled={isAnswered}
              className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all duration-150 ${btnStyle}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-xl bg-[#EFECE6] dark:bg-[#232326] text-[#44403C] dark:text-[#D6D3CD] font-bold text-xs flex items-center justify-center shrink-0">
                  {optionLabels[index]}
                </span>
                <span className="text-sm sm:text-base leading-snug">{option}</span>
              </div>

              {isAnswered && (
                <div className="shrink-0">
                  {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : isSelected ? (
                    <XCircle className="w-5 h-5 text-rose-500" />
                  ) : null}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Next Question action */}
      {isAnswered && (
        <button
          id="btn-quiz-next"
          onClick={handleNext}
          autoFocus
          className="w-full py-3.5 px-6 rounded-2xl bg-[#2D5A46] hover:bg-[#21483A] text-white font-semibold text-sm shadow-md shadow-[#2D5A46]/20 transition-all flex items-center justify-center gap-2"
        >
          <span>{currentIndex === questions.length - 1 ? 'Ver Resultado do Quiz' : 'Próxima Pergunta [Espaço]'}</span>
        </button>
      )}
    </div>
  );
};
