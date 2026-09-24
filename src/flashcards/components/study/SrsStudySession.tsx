import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Volume2,
  Star,
  CheckCircle2,
  RotateCcw,
  Flame,
  Check,
  Sparkles,
  RefreshCw,
  Award,
  Flower2,
  Brain,
  X,
} from 'lucide-react';
import { Flashcard, Deck, StudyFocus } from '../../types';
import { SRSRating, calculateSRS, getIntervalPreview, formatIntervalLabel } from '../../utils/sm2';
import { soundFx } from '../../utils/sound';
import { COLOR_THEMES } from '../../utils/theme';
import { useStudyTimer } from '../../../hooks/useStudyTimer';

interface SrsStudySessionProps {
  deck: Deck;
  cards: Flashcard[];
  focus: StudyFocus;
  onToggleStar: (cardId: string) => void;
  onRateCard: (card: Flashcard, rating: SRSRating) => void;
  onFinish: (studiedCount: number, correctCount: number) => void;
  onExit: () => void;
}

type SessionPhase = 'studying' | 'completed';

const RATING_CONFIG: Array<{
  rating: SRSRating;
  label: string;
  keyLabel: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  hoverBorder: string;
  iconColor: string;
}> = [
  {
    rating: 0,
    label: 'Não sei',
    keyLabel: '1',
    icon: RotateCcw,
    hoverBorder: 'hover:border-stone-400 dark:hover:border-stone-600',
    iconColor: 'text-stone-400 dark:text-stone-500 group-hover:text-rose-400/90 dark:group-hover:text-rose-400/90',
  },
  {
    rating: 1,
    label: 'Muito difícil',
    keyLabel: '2',
    icon: Flame,
    hoverBorder: 'hover:border-stone-400 dark:hover:border-stone-600',
    iconColor: 'text-stone-400 dark:text-stone-500 group-hover:text-amber-500/80 dark:group-hover:text-amber-400/80',
  },
  {
    rating: 2,
    label: 'Razoável',
    keyLabel: '3',
    icon: Check,
    hoverBorder: 'hover:border-stone-400 dark:hover:border-stone-600',
    iconColor: 'text-stone-400 dark:text-stone-500 group-hover:text-stone-300 dark:group-hover:text-stone-200',
  },
  {
    rating: 3,
    label: 'Fácil',
    keyLabel: '4',
    icon: Sparkles,
    hoverBorder: 'hover:border-[#2D5A46] dark:hover:border-[#52B788]',
    iconColor: 'text-stone-400 dark:text-stone-500 group-hover:text-[#2D5A46] dark:group-hover:text-[#52B788]',
  },
];

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const SrsStudySession: React.FC<SrsStudySessionProps> = ({
  deck,
  cards,
  focus,
  onToggleStar,
  onRateCard,
  onFinish,
  onExit,
}) => {
  const sessionTotal = cards.length;

  // Fila inicial: primeiros os cartões vencidos (dueDate menor), depois novos.
  const sortedCards = useCallback(() => {
    return [...cards].sort((a, b) => (a.dueDate || 0) - (b.dueDate || 0));
  }, [cards]);

  const [phase, setPhase] = useState<SessionPhase>('studying');
  useStudyTimer(phase === 'studying', 'Revisão de Flashcards');
  const [queue, setQueue] = useState<Flashcard[]>(() => sortedCards());
  const [isRevealed, setIsRevealed] = useState(false);
  // Mantém congelado o cartão que foi revelado para evitar spoiler na virada para o próximo
  const [revealedCard, setRevealedCard] = useState<Flashcard | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [failedIds, setFailedIds] = useState<Set<string>>(new Set());
  const [answeredIds, setAnsweredIds] = useState<Set<string>>(new Set());
  const [firstTryCorrect, setFirstTryCorrect] = useState(0);
  const [ratedDueDates, setRatedDueDates] = useState<number[]>([]);

  const currentCard = queue[0];
  const theme = COLOR_THEMES[deck.color] || COLOR_THEMES.indigo;

  const completedCount = sessionTotal - queue.length;
  const progressPercent = sessionTotal > 0 ? Math.round((completedCount / sessionTotal) * 100) : 0;

  const handleReveal = useCallback(() => {
    if (!currentCard) return;
    soundFx.playFlip();
    setRevealedCard(currentCard);
    setIsRevealed(true);
  }, [currentCard]);

  const handleRating = useCallback(
    (rating: SRSRating) => {
      if (!currentCard || phase !== 'studying') return;
      const cardId = currentCard.id;

      // Fecha a revelação (inicia a virada de volta para a pergunta).
      // Como o verso exibirá `revealedCard` (que é o cartão atual respondido),
      // a resposta do próximo cartão NÃO aparece enquanto ele estiver virando!
      setIsRevealed(false);

      if (rating === 0) {
        // "Não sei": o cartão NÃO sai da sessão — volta para o fim da fila
        // e só é removido quando for lembrado corretamente.
        soundFx.playWrong();
        onRateCard(currentCard, rating);
        setAttempts((prev) => prev + 1);
        setFailedIds((prev) => new Set(prev).add(cardId));
        if (queue.length > 1) {
          setQueue((prev) => [...prev.slice(1), prev[0]]);
        }
        return;
      }

      // Acertou: aplica a repetição espaçada e remove da sessão.
      soundFx.playCorrect();
      onRateCard(currentCard, rating);

      // Próxima revisão agendada para este cartão.
      const srs = calculateSRS(currentCard, rating);
      setRatedDueDates((prev) => [...prev, srs.dueDate]);

      setAttempts((prev) => prev + 1);
      const wasFailed = failedIds.has(cardId);
      if (!wasFailed) setFirstTryCorrect((prev) => prev + 1);
      const newAnswered = new Set(answeredIds).add(cardId);
      setAnsweredIds(newAnswered);

      const remaining = queue.filter((c) => !newAnswered.has(c.id));
      setQueue(remaining);

      if (remaining.length === 0) {
        setPhase('completed');
        soundFx.playVictory();
        onFinish(sessionTotal, firstTryCorrect + (wasFailed ? 0 : 1));
      }
    },
    [currentCard, phase, queue, failedIds, answeredIds, firstTryCorrect, onRateCard, onFinish, sessionTotal]
  );

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (phase !== 'studying') return;

      if (!isRevealed) {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          handleReveal();
        }
      } else {
        if (e.key === '1') handleRating(0);
        else if (e.key === '2') handleRating(1);
        else if (e.key === '3') handleRating(2);
        else if (e.key === '4') handleRating(3);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, isRevealed, handleReveal, handleRating]);

  const handleRestart = () => {
    soundFx.playFlip();
    setQueue(sortedCards());
    setIsRevealed(false);
    setAttempts(0);
    setFailedIds(new Set());
    setAnsweredIds(new Set());
    setFirstTryCorrect(0);
    setRatedDueDates([]);
    setPhase('studying');
  };

  const nextReviewLabel = useCallback((): string => {
    if (ratedDueDates.length === 0) return '—';
    const next = Math.min(...ratedDueDates);
    const days = Math.max(0, Math.ceil((next - Date.now()) / MS_PER_DAY));
    return formatIntervalLabel(days);
  }, [ratedDueDates]);

  // ==========================================
  // VIEW: SESSÃO CONCLUÍDA
  // ==========================================
  if (phase === 'completed' || (sessionTotal === 0 && queue.length === 0)) {
    if (sessionTotal === 0) {
      return (
        <div className="w-full max-w-3xl mx-auto px-4 py-12 text-center">
          <div className="bg-[#FAF8F5] dark:bg-[#1A1A1D] border-2 border-[#E7E2D9] dark:border-[#2C2C30] rounded-3xl p-8 sm:p-12 space-y-4 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-lg font-bold text-[#1C1917] dark:text-[#FAF9F5]">
              Nenhum cartão para estudar
            </h3>
            <p className="text-xs text-[#78716C] dark:text-[#A8A29E]">
              {focus === 'hard'
                ? 'Não há cartões difíceis neste baralho no momento. Estude o baralho completo ou volte mais tarde.'
                : 'Este baralho ainda não possui cartões.'}
            </p>
            <button
              onClick={onExit}
              className="mt-2 px-5 py-2 bg-[#2D5A46] text-white rounded-xl text-sm font-semibold"
            >
              Voltar ao Baralho
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-12 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-[#FAF8F5] dark:bg-[#1A1A1D] border-2 border-[#E7E2D9] dark:border-[#2C2C30] rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
          {/* Decorative stamp */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#EAF5EE] dark:bg-[#1A3326] text-[#2D5A46] dark:text-[#52B788] shadow-sm mb-2 border border-[#C5E4D1] dark:border-[#24533A]">
            <Flower2 className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <span className="text-xs uppercase tracking-widest font-mono font-bold text-[#2D5A46] dark:text-[#52B788] block">
              Repetição Espaçada Concluída
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-['Fraunces',serif] text-[#1C1917] dark:text-[#FAF9F5] leading-tight">
              Baralho revisado com sucesso!
            </h2>
            <p className="text-sm text-[#78716C] dark:text-[#A8A29E] leading-relaxed">
              Cada cartão foi lembrado ao menos uma vez e agora está agendado para reaparecer
              no momento certo. Cartões mais difíceis voltam antes; os fáceis vêm depois.
            </p>
          </div>

          {/* Metrics summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto pt-2">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#141416] border border-[#E7E2D9] dark:border-[#2C2C30]">
              <span className="text-[10px] uppercase font-mono font-bold text-[#A8A29E] block">
                Cartões
              </span>
              <span className="text-2xl font-black font-['Fraunces',serif] text-[#1C1917] dark:text-[#FAF9F5]">
                {sessionTotal}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-[#141416] border border-[#E7E2D9] dark:border-[#2C2C30]">
              <span className="text-[10px] uppercase font-mono font-bold text-[#A8A29E] block">
                Acertos de 1ª
              </span>
              <span className="text-2xl font-black font-['Fraunces',serif] text-[#2D5A46] dark:text-[#52B788]">
                {firstTryCorrect}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-[#141416] border border-[#E7E2D9] dark:border-[#2C2C30]">
              <span className="text-[10px] uppercase font-mono font-bold text-[#A8A29E] block">
                Total de tentativas
              </span>
              <span className="text-2xl font-black font-['Fraunces',serif] text-[#D97706] dark:text-[#FBBF24]">
                {attempts}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-[#141416] border border-[#E7E2D9] dark:border-[#2C2C30]">
              <span className="text-[10px] uppercase font-mono font-bold text-[#A8A29E] block">
                Próx. revisão
              </span>
              <span className="text-xl sm:text-2xl font-black font-['Fraunces',serif] text-[#2D5A46] dark:text-[#52B788]">
                {nextReviewLabel()}
              </span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleRestart}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-[#D6D3CD] dark:border-[#3D3A36] text-[#57534E] dark:text-[#D6D3CD] text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refazer Sessão</span>
            </button>
            <button
              onClick={onExit}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#1C1917] dark:bg-[#FAF9F5] text-white dark:text-[#1C1917] text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              Voltar ao Baralho
            </button>
          </div>
        </div>
      </div>
    );
  }

  const intervalPreviews = currentCard ? getIntervalPreview(currentCard) : null;
  // Cartão que deve ser exibido no verso:
  // Se revelado, é o cartão atual. Se está virando de volta para a pergunta,
  // preservamos o cartão recém-respondido para que a resposta do próximo NUNCA apareça precocemente.
  const backCardToDisplay = isRevealed ? currentCard : (revealedCard || currentCard);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 flex flex-col items-center">
      {/* Top action bar */}
      <div className="w-full flex items-center justify-between gap-2 mb-6">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#FAF9F5] px-3 py-1.5 rounded-lg hover:bg-[#EFECE6] dark:hover:bg-[#232326] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Sair</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-[#EBF3EF] dark:bg-[#15221B] text-[#224A38] dark:text-[#52B788] border border-[#C9DDD2] dark:border-[#33493F]">
            <Brain className="w-3.5 h-3.5" />
            <span>Repetição Espaçada</span>
          </span>
          {focus === 'hard' && (
            <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-[#F9ECEB] dark:bg-[#2C1818] text-[#A8423F] dark:text-[#F87171] border border-[#F3D4D2] dark:border-[#5E2D2B]">
              <Flame className="w-3.5 h-3.5" />
              <span>Só difíceis</span>
            </span>
          )}
          <span className="text-xs font-bold text-[#78716C] dark:text-[#A8A29E]">
            {completedCount} / {sessionTotal}
          </span>
        </div>
      </div>

      {/* Progress line */}
      <div className="w-full bg-[#E7E2D9] dark:bg-[#2C2C30] h-2 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full transition-all duration-300 ${theme.bg}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Live counters */}
      <div className="w-full flex items-center gap-2 text-[11px] font-mono mb-6">
        <span className="text-[#78716C] dark:text-[#A8A29E]">Sessão ao vivo:</span>
        <span className="px-2 py-0.5 rounded-full bg-[#EAF5EE] dark:bg-[#1A3326] text-[#2D5A46] dark:text-[#52B788] font-bold">
          <Check className="w-3 h-3 inline-block mr-0.5" />
          {firstTryCorrect} de 1ª
        </span>
        <span className="px-2 py-0.5 rounded-full bg-[#FEF2F2] dark:bg-[#2C1818] text-[#DC2626] dark:text-[#F87171] font-bold">
          <X className="w-3 h-3 inline-block mr-0.5" />
          {failedIds.size} "não sei"
        </span>
        <span className="px-2 py-0.5 rounded-full bg-[#EFECE6] dark:bg-[#232326] text-[#57534E] dark:text-[#A8A29E]">
          {attempts} tentativas
        </span>
        <span className="ml-auto hidden sm:flex items-center gap-1 text-[#A8A29E]">
          <Sparkles className="w-3 hover:w-3.5" />
          Falta acertar: <strong>{queue.length}</strong>
        </span>
      </div>

      {/* Card Box com Animação Física 3D suave (rotateY) via motion */}
      <div className="w-full mb-6" style={{ perspective: 1200 }}>
        <motion.div
          animate={{ rotateY: isRevealed ? 180 : 0 }}
          initial={false}
          transition={{
            duration: 0.5,
            ease: [0.23, 1, 0.32, 1],
          }}
          style={{ transformStyle: 'preserve-3d' }}
          className="grid w-full min-h-[380px] rounded-3xl"
        >
          {/* FRONT FACE (Pergunta) */}
          <div
            id="srs-flashcard-front"
            onClick={!isRevealed ? handleReveal : undefined}
            style={{
              gridArea: '1 / 1',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(0deg)',
            }}
            className="cursor-pointer w-full min-h-[380px] bg-white dark:bg-[#1E1E22] rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.35)] border border-[#E7E2D9] dark:border-[#2C2C30] flex flex-col justify-between select-none"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EFECE6] dark:bg-[#2A2A2E] text-[#44403C] dark:text-[#D6D3CD]">
                  {currentCard.status === 'mastered'
                    ? 'Dominado'
                    : currentCard.status === 'learning'
                    ? 'Aprendendo'
                    : currentCard.status === 'review'
                    ? 'Em Revisão'
                    : 'Novo'}
                </span>
                {currentCard.tag && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#EFECE6] dark:bg-[#2A2A2E] text-[#78716C] dark:text-[#A8A29E]">
                    {currentCard.tag}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    soundFx.speak(currentCard.front);
                  }}
                  title="Ouvir"
                  className="p-1.5 rounded-lg text-[#A8A29E] hover:text-[#57534E] dark:hover:text-[#E7E5E4] hover:bg-[#EFECE6] dark:hover:bg-[#2C2C30] transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStar(currentCard.id);
                  }}
                  className={`p-1.5 rounded-lg transition-colors ${
                    currentCard.starred
                      ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                      : 'text-[#A8A29E] hover:text-amber-500 hover:bg-[#EFECE6] dark:hover:bg-[#2C2C30]'
                  }`}
                >
                  <Star className={`w-4 h-4 ${currentCard.starred ? 'fill-amber-500' : ''}`} />
                </button>
              </div>
            </div>

            <div className="py-6 text-center my-auto">
              <span className="text-xs font-semibold text-[#A8A29E] dark:text-[#78716C] uppercase tracking-widest block mb-2">
                Pergunta / Termo
              </span>
              <p className="text-xl sm:text-2xl font-bold text-[#1C1917] dark:text-[#FAF9F5] font-['Fraunces',serif] leading-relaxed">
                {currentCard.front}
              </p>
            </div>

            <div className="text-center pt-5 border-t border-[#E7E2D9] dark:border-[#2C2C30]">
              <span className="text-xs font-semibold text-[#A8A29E] dark:text-[#78716C] uppercase tracking-wider">
                Clique no card para ver a resposta [Espaço]
              </span>
            </div>
          </div>

          {/* BACK FACE (Resposta) */}
          <div
            id="srs-flashcard-back"
            style={{
              gridArea: '1 / 1',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
            className="w-full min-h-[380px] bg-[#FAF8F5] dark:bg-[#18181B] rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.35)] border border-[#CFE1D6]/80 dark:border-[#2A3F33] flex flex-col justify-between select-none"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EBF3EF] dark:bg-[#1A2E23] text-[#2D5A46] dark:text-[#52B788]">
                  {backCardToDisplay && backCardToDisplay.status === 'mastered'
                    ? 'Dominado'
                    : backCardToDisplay && backCardToDisplay.status === 'learning'
                    ? 'Aprendendo'
                    : backCardToDisplay && backCardToDisplay.status === 'review'
                    ? 'Em Revisão'
                    : 'Novo'}
                </span>
                {backCardToDisplay && backCardToDisplay.tag && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#EFECE6] dark:bg-[#2A2A2E] text-[#78716C] dark:text-[#A8A29E]">
                    {backCardToDisplay.tag}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => backCardToDisplay && soundFx.speak(backCardToDisplay.back)}
                  title="Ouvir resposta"
                  className="p-1.5 rounded-lg text-[#A8A29E] hover:text-[#57534E] dark:hover:text-[#E7E5E4] hover:bg-[#EFECE6] dark:hover:bg-[#2C2C30] transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => backCardToDisplay && onToggleStar(backCardToDisplay.id)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    backCardToDisplay && backCardToDisplay.starred
                      ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                      : 'text-[#A8A29E] hover:text-amber-500 hover:bg-[#EFECE6] dark:hover:bg-[#2C2C30]'
                  }`}
                >
                  <Star className={`w-4 h-4 ${backCardToDisplay && backCardToDisplay.starred ? 'fill-amber-500' : ''}`} />
                </button>
              </div>
            </div>

            <div className="py-6 text-center my-auto">
              <span className="text-xs font-semibold text-[#2D5A46] dark:text-[#52B788] uppercase tracking-widest block mb-2">
                Resposta / Definição
              </span>
              <p className="text-lg sm:text-xl font-medium text-[#1C1917] dark:text-[#FAF9F5] leading-relaxed">
                {backCardToDisplay ? backCardToDisplay.back : currentCard.back}
              </p>
            </div>

            <div className="text-center pt-5 border-t border-[#E7E2D9] dark:border-[#2C2C30]">
              <span className="text-xs font-semibold text-[#A8A29E] dark:text-[#78716C] uppercase tracking-wider">
                Como foi lembrar deste card? Avalie abaixo.
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 4 Rating Buttons Redesenhados Minimalistas */}
      {isRevealed && intervalPreviews ? (
        <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-200">
          <p className="text-center text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-3">
            Como foi lembrar deste card?
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            {RATING_CONFIG.map((cfg) => {
              const Icon = cfg.icon;
              return (
                <button
                  key={cfg.rating}
                  type="button"
                  onClick={() => handleRating(cfg.rating)}
                  className={`group relative p-4 sm:p-4.5 rounded-2xl border border-[#E7E2D9] dark:border-[#2C2C30] ${cfg.hoverBorder} bg-white/90 dark:bg-[#1A1A1D]/90 hover:bg-[#F8F6F2] dark:hover:bg-[#232326] flex flex-col items-center justify-between text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-black/40 cursor-pointer`}
                >
                  {/* Ícone minimalista com sutil destaque dessaturado no hover */}
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-stone-100 dark:bg-[#242428] group-hover:bg-stone-200/70 dark:group-hover:bg-[#2E2E33] transition-colors mb-2">
                    <Icon className={`w-4 h-4 ${cfg.iconColor} transition-colors`} strokeWidth={1.75} />
                  </div>

                  {/* Nome do botão em destaque */}
                  <span className="text-xs sm:text-[13px] font-semibold text-[#1C1917] dark:text-[#E7E2D9] tracking-tight">
                    {cfg.label}
                  </span>

                  {/* Prazo em texto secundário discreto */}
                  <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400 mt-1">
                    {intervalPreviews[cfg.rating]}
                  </span>

                  {/* Atalho de teclado em texto secundário discreto */}
                  <span className="mt-2.5 text-[10px] font-mono text-stone-400 dark:text-stone-500 px-2 py-0.5 rounded-md bg-stone-100/90 dark:bg-[#242428] border border-stone-200/60 dark:border-stone-700/60">
                    Tecla {cfg.keyLabel}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-start justify-center gap-2 text-[11px] text-stone-500 dark:text-stone-400 max-w-lg mx-auto leading-snug">
            <Sparkles className="w-3.5 h-3.5 text-[#2D5A46] dark:text-[#52B788] shrink-0 mt-0.5" />
            <p>
              <strong className="text-stone-700 dark:text-stone-300 font-medium">Não sei</strong> repete na sessão e agenda para daqui a algumas horas. O intervalo máximo é de 1 semana para garantir prática diária consistente.
            </p>
          </div>
        </div>
      ) : (
        <button
          onClick={handleReveal}
          className="w-full py-4 rounded-2xl bg-white dark:bg-[#1A1A1D] border border-[#E7E2D9] dark:border-[#2C2C30] hover:border-[#2D5A46] dark:hover:border-[#52B788] text-[#1C1917] dark:text-[#FAF9F5] font-semibold text-sm flex items-center justify-center gap-2 shadow-xs hover:shadow-md transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-[#2D5A46] dark:text-[#52B788]" strokeWidth={1.75} />
          <span>Virar e Ver a Resposta [Espaço]</span>
        </button>
      )}

      {/* Award footer */}
      {isRevealed && (
        <div className="mt-4 text-center text-[11px] text-[#A8A29E] flex items-center justify-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-amber-500" />
          O sistema agenda a próxima revisão automaticamente com base na sua avaliação.
        </div>
      )}
    </div>
  );
};