import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  RotateCcw,
  Volume2,
  Star,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  ArrowLeft,
  Check,
  X,
  Keyboard,
} from 'lucide-react';
import { Flashcard, Deck } from '../../types';
import { soundFx } from '../../utils/sound';
import { COLOR_THEMES } from '../../utils/theme';

interface ClassicStudyProps {
  deck: Deck;
  cards: Flashcard[];
  onToggleStar: (cardId: string) => void;
  onFinish: (studiedCount: number, correctCount: number) => void;
  onExit: () => void;
  quickStudyMinutes?: number; // optional timer
}

export const ClassicStudy: React.FC<ClassicStudyProps> = ({
  deck,
  cards: initialCards,
  onToggleStar,
  onFinish,
  onExit,
}) => {
  const [cards, setCards] = useState<Flashcard[]>(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flippedCard, setFlippedCard] = useState<Flashcard | null>(null);
  const [markedKnown, setMarkedKnown] = useState<Record<string, boolean>>({});
  const [quickTimer, setQuickTimer] = useState<number | null>(null); // seconds
  const [timerActive, setTimerActive] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  const theme = COLOR_THEMES[deck.color] || COLOR_THEMES.indigo;
  const currentCard = cards[currentIndex];

  // Flip card handler
  const handleFlip = useCallback(() => {
    soundFx.playFlip();
    setIsFlipped((prev) => {
      const next = !prev;
      if (next && currentCard) {
        setFlippedCard(currentCard);
      }
      return next;
    });
  }, [currentCard]);

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Completed all cards
      const correctCount = Object.values(markedKnown).filter(Boolean).length;
      onFinish(cards.length, correctCount);
    }
  }, [currentIndex, cards.length, markedKnown, onFinish]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleMark = (known: boolean) => {
    if (!currentCard) return;
    if (known) {
      soundFx.playCorrect();
    } else {
      soundFx.playWrong();
    }
    setMarkedKnown((prev) => ({ ...prev, [currentCard.id]: known }));
    handleNext();
  };

  const handleShuffle = () => {
    soundFx.playFlip();
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.code === 'KeyS' && currentCard) {
        e.preventDefault();
        onToggleStar(currentCard.id);
      } else if (e.code === 'Digit1') {
        handleMark(false);
      } else if (e.code === 'Digit2') {
        handleMark(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev, currentCard, onToggleStar]);

  // Optional quick study countdown timer
  useEffect(() => {
    if (!timerActive || quickTimer === null || quickTimer <= 0) return;
    const interval = setInterval(() => {
      setQuickTimer((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          setTimerActive(false);
          const correct = Object.values(markedKnown).filter(Boolean).length;
          onFinish(currentIndex + 1, correct);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, quickTimer, currentIndex, markedKnown, onFinish]);

  const toggleQuickTimer = (seconds: number) => {
    if (timerActive) {
      setTimerActive(false);
      setQuickTimer(null);
    } else {
      setQuickTimer(seconds);
      setTimerActive(true);
    }
  };

  if (!currentCard || cards.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-[#78716C]">Nenhum cartão disponível neste baralho.</p>
        <button
          onClick={onExit}
          className="mt-4 px-4 py-2 bg-[#2D5A46] text-white rounded-xl text-sm"
        >
          Voltar
        </button>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / cards.length) * 100);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 flex flex-col items-center">
      {/* Top action bar */}
      <div className="w-full flex items-center justify-between gap-2 mb-6">
        <button
          id="btn-classic-exit"
          onClick={onExit}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#FAF9F5] px-3 py-1.5 rounded-lg hover:bg-[#EFECE6] dark:hover:bg-[#232326] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Baralho</span>
        </button>

        {/* Center mode indicator */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#EFECE6] dark:bg-[#232326] text-[#44403C] dark:text-[#D6D3CD]">
            Card {currentIndex + 1} de {cards.length}
          </span>
          {/* Quick study timer button */}
          <button
            id="btn-classic-timer"
            onClick={() => toggleQuickTimer(timerActive ? 0 : 120)}
            title="Modo Estudo Rápido com Timer (2 minutos)"
            className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-all ${
              timerActive
                ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 text-rose-600 dark:text-rose-400 font-bold animate-pulse'
                : 'bg-white dark:bg-[#232326] border-[#E7E2D9] dark:border-[#2C2C30] text-[#57534E] dark:text-[#D6D3CD] hover:bg-[#EFECE6]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>
              {timerActive && quickTimer !== null
                ? `${Math.floor(quickTimer / 60)}:${String(quickTimer % 60).padStart(2, '0')}`
                : 'Timer'}
            </span>
          </button>
        </div>

        {/* Right tools */}
        <div className="flex items-center gap-1">
          <button
            id="btn-classic-shuffle"
            onClick={handleShuffle}
            title="Embaralhar cards"
            className="p-2 text-[#57534E] dark:text-[#A8A29E] hover:bg-[#EFECE6] dark:hover:bg-[#232326] rounded-lg transition-colors"
          >
            <Shuffle className="w-4 h-4" />
          </button>
          <button
            id="btn-classic-shortcuts"
            onClick={() => setShowShortcutsModal(!showShortcutsModal)}
            title="Atalhos de teclado"
            className="p-2 text-[#57534E] dark:text-[#A8A29E] hover:bg-[#EFECE6] dark:hover:bg-[#232326] rounded-lg transition-colors"
          >
            <Keyboard className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress line */}
      <div className="w-full bg-[#E7E2D9] dark:bg-[#2C2C30] h-2 rounded-full overflow-hidden mb-6">
        <div
          className={`h-full transition-all duration-300 ${theme.bg}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 3D Flashcard Container with motion rotateY */}
      <div className="w-full mb-6" style={{ perspective: 1200 }}>
        <motion.div
          id="flashcard-3d-box"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          initial={false}
          transition={{
            duration: 0.5,
            ease: [0.23, 1, 0.32, 1],
          }}
          style={{ transformStyle: 'preserve-3d' }}
          className="grid w-full min-h-[340px] sm:min-h-[380px] rounded-3xl"
        >
          {/* FRONT FACE */}
          <div
            onClick={!isFlipped ? handleFlip : undefined}
            style={{
              gridArea: '1 / 1',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(0deg)',
            }}
            className="w-full min-h-[340px] sm:min-h-[380px] bg-white dark:bg-[#18181B] rounded-3xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden cursor-pointer select-none shadow-xl hover:shadow-2xl border border-[#E7E2D9] dark:border-[#2C2C30]"
          >
            {/* Front Header */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EBF3EF] dark:bg-[#15221B] text-[#224A38] dark:text-[#52B788]">
                  Frente • Pergunta
                </span>
                {currentCard.tag && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#EFECE6] dark:bg-[#232326] text-[#57534E] dark:text-[#A8A29E]">
                    {currentCard.tag}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                <button
                  id="btn-card-tts-front"
                  onClick={() => soundFx.speak(currentCard.front)}
                  title="Ouvir pronúncia"
                  className="p-1.5 rounded-lg text-[#A8A29E] hover:text-[#57534E] dark:hover:text-[#E7E5E4] hover:bg-[#EFECE6] dark:hover:bg-[#232326] transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  id="btn-card-star-front"
                  onClick={() => onToggleStar(currentCard.id)}
                  title={currentCard.starred ? 'Favorito' : 'Marcar como favorito'}
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

            {/* Front Content */}
            <div className="my-auto py-6 text-center">
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1C1917] dark:text-[#FAF9F5] leading-relaxed font-['Outfit',sans-serif]">
                {currentCard.front}
              </p>
            </div>

            {/* Front Footer */}
            <div className="flex items-center justify-between text-xs text-[#A8A29E] dark:text-[#78716C] border-t border-[#E7E2D9] dark:border-[#2C2C30] pt-3">
              <span className="flex items-center gap-1 text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-[#2D5A46]" />
                Clique no card para virar a resposta
              </span>
              <span className="hidden sm:inline text-[11px] bg-[#EFECE6] dark:bg-[#232326] px-2 py-0.5 rounded font-mono">
                [Espaço]
              </span>
            </div>
          </div>

          {/* BACK FACE */}
          {(() => {
            const backCard = isFlipped ? currentCard : (flippedCard || currentCard);
            return (
              <div
                onClick={isFlipped ? handleFlip : undefined}
                style={{
                  gridArea: '1 / 1',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
                className="w-full min-h-[340px] sm:min-h-[380px] bg-gradient-to-br from-[#EBF3EF]/70 via-white to-[#EBF3EF]/50 dark:from-[#18181B] dark:via-[#18181B] dark:to-[#15221B]/40 rounded-3xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden border border-[#CFE1D6] dark:border-[#22392D] cursor-pointer select-none"
              >
                {/* Back Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                      Verso • Resposta
                    </span>
                    {backCard.tag && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#EFECE6] dark:bg-[#232326] text-[#57534E] dark:text-[#A8A29E]">
                        {backCard.tag}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      id="btn-card-tts-back"
                      onClick={() => soundFx.speak(backCard.back)}
                      title="Ouvir resposta"
                      className="p-1.5 rounded-lg text-[#A8A29E] hover:text-[#57534E] dark:hover:text-[#E7E5E4] hover:bg-[#EFECE6] dark:hover:bg-[#232326] transition-colors"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      id="btn-card-star-back"
                      onClick={() => onToggleStar(backCard.id)}
                      title={backCard.starred ? 'Favorito' : 'Marcar como favorito'}
                      className={`p-1.5 rounded-lg transition-colors ${
                        backCard.starred
                          ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                          : 'text-[#A8A29E] hover:text-amber-500 hover:bg-[#EFECE6] dark:hover:bg-[#232326]'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${backCard.starred ? 'fill-amber-500' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Back Content */}
                <div className="my-auto py-6 text-center">
                  <p className="text-lg sm:text-xl md:text-2xl font-medium text-[#1C1917] dark:text-[#FAF9F5] leading-relaxed">
                    {backCard.back}
                  </p>
                </div>

                {/* Back Footer */}
                <div className="flex items-center justify-between text-xs text-[#A8A29E] dark:text-[#78716C] border-t border-[#E7E2D9] dark:border-[#2C2C30] pt-3">
                  <span className="text-[11px]">
                    Clique para voltar para a pergunta
                  </span>
                  <span className="hidden sm:inline text-[11px] bg-[#EFECE6] dark:bg-[#232326] px-2 py-0.5 rounded font-mono">
                    [Espaço]
                  </span>
                </div>
              </div>
            );
          })()}
        </motion.div>
      </div>

      {/* Quick rating / Knowledge buttons */}
      <div className="w-full grid grid-cols-2 gap-3 mb-4">
        <button
          id="btn-mark-learning"
          onClick={() => handleMark(false)}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 text-sm font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all hover:scale-101"
        >
          <X className="w-4 h-4" />
          <span>Ainda não sei (1)</span>
        </button>
        <button
          id="btn-mark-known"
          onClick={() => handleMark(true)}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-sm font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all hover:scale-101"
        >
          <Check className="w-4 h-4" />
          <span>Já sei bem (2)</span>
        </button>
      </div>

      {/* Navigation arrows bar */}
      <div className="w-full flex items-center justify-between gap-4">
        <button
          id="btn-classic-prev"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#D6D0C5] dark:border-[#2C2C30] text-[#44403C] dark:text-[#D6D3CD] text-sm font-medium hover:bg-[#EFECE6] dark:hover:bg-[#232326] disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Anterior</span>
        </button>

        <button
          id="btn-flip-card-action"
          onClick={handleFlip}
          className="flex-1 max-w-[200px] py-2.5 px-4 rounded-xl bg-[#EFECE6] dark:bg-[#232326] text-[#1C1917] dark:text-[#E7E5E4] hover:bg-[#EFECE6] dark:hover:bg-[#2A2A2F] text-sm font-semibold transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{isFlipped ? 'Ver Pergunta' : 'Virar Resposta'}</span>
        </button>

        <button
          id="btn-classic-next"
          onClick={handleNext}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2D5A46] hover:bg-[#21483A] text-white text-sm font-semibold shadow-sm transition-all"
        >
          <span>{currentIndex === cards.length - 1 ? 'Concluir' : 'Próximo'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Keyboard shortcuts popup */}
      {showShortcutsModal && (
        <div className="mt-6 p-4 rounded-2xl bg-[#EFECE6] dark:bg-[#232326]/80 border border-[#E7E2D9] dark:border-[#2C2C30] text-xs text-[#57534E] dark:text-[#D6D3CD] w-full animate-in fade-in duration-150">
          <div className="font-bold mb-2 flex items-center gap-1.5 text-[#1C1917] dark:text-[#FAF9F5]">
            <Keyboard className="w-4 h-4" />
            Atalhos de Teclado Disponíveis:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
            <div><kbd className="px-1.5 py-0.5 bg-white dark:bg-[#2A2A2F] rounded border">Espaço</kbd> : Virar</div>
            <div><kbd className="px-1.5 py-0.5 bg-white dark:bg-[#2A2A2F] rounded border">→</kbd> : Próximo</div>
            <div><kbd className="px-1.5 py-0.5 bg-white dark:bg-[#2A2A2F] rounded border">←</kbd> : Anterior</div>
            <div><kbd className="px-1.5 py-0.5 bg-white dark:bg-[#2A2A2F] rounded border">S</kbd> : Favoritar</div>
            <div><kbd className="px-1.5 py-0.5 bg-white dark:bg-[#2A2A2F] rounded border">1</kbd> : Ainda não sei</div>
            <div><kbd className="px-1.5 py-0.5 bg-white dark:bg-[#2A2A2F] rounded border">2</kbd> : Já sei bem</div>
          </div>
        </div>
      )}
    </div>
  );
};
