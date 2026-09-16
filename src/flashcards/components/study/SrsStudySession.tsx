import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Volume2, Star, CheckCircle2, RotateCcw, Brain, X, Check, Flame, Sparkles, RefreshCw, Award, Flower2 } from 'lucide-react';
import { Flashcard, Deck, StudyFocus } from '../../types';
import { SRSRating, calculateSRS, getIntervalPreview, formatIntervalLabel } from '../../utils/sm2';
import { soundFx } from '../../utils/sound';
import { COLOR_THEMES } from '../../utils/theme';

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
  shortLabel: string;
  keyLabel: string;
  classes: string;
  badge: string;
}> = [
  {
    rating: 0,
    label: 'Não sei',
    shortLabel: 'Repetir',
    keyLabel: '1',
    classes:
      'border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-400',
    badge: 'text-rose-700 dark:text-rose-400',
  },
  {
    rating: 1,
    label: 'Muito difícil',
    shortLabel: 'Difícil',
    keyLabel: '2',
    classes:
      'border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-400',
    badge: 'text-amber-700 dark:text-amber-400',
  },
  {
    rating: 2,
    label: 'Razoável',
    shortLabel: 'Razoável',
    keyLabel: '3',
    classes:
      'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400',
    badge: 'text-emerald-700 dark:text-emerald-400',
  },
  {
    rating: 3,
    label: 'Fácil',
    shortLabel: 'Fácil',
    keyLabel: '4',
    classes:
      'border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400',
    badge: 'text-blue-700 dark:text-blue-400',
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
  const [queue, setQueue] = useState<Flashcard[]>(() => sortedCards());
  const [isRevealed, setIsRevealed] = useState(false);
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
    soundFx.playFlip();
    setIsRevealed(true);
  }, []);

  const handleRating = useCallback(
    (rating: SRSRating) => {
      if (!currentCard || phase !== 'studying') return;
      const cardId = currentCard.id;

      if (rating === 0) {
        // "Não sei": o cartão NÃO sai da sessão — volta para o fim da fila
        // e só é removido quando for lembrado corretamente.
        soundFx.playWrong();
        onRateCard(currentCard, rating);
        setAttempts((prev) => prev + 1);
        setFailedIds((prev) => new Set(prev).add(cardId));
        setIsRevealed(false);
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
      setIsRevealed(false);

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

      {/* Card Box */}
      <div className="w-full perspective-1000 mb-6">
        <div
          className={`grid transform-style-3d transition-transform duration-500 rounded-3xl border border-[#E7E2D9] dark:border-[#2C2C30] ${
            isRevealed ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT FACE */}
          <div
            id="srs-flashcard-front"
            onClick={handleReveal}
            className="[grid-area:1/1] backface-hidden cursor-pointer w-full min-h-[360px] bg-white dark:bg-[#232326] rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between"
          >
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

            <div className="py-6 text-center">
              <span className="text-xs font-semibold text-[#A8A29E] dark:text-[#78716C] uppercase tracking-widest block mb-2">
                Pergunta / Termo
              </span>
              <p className="text-xl sm:text-2xl font-bold text-[#1C1917] dark:text-[#FAF9F5] font-['Fraunces',serif] leading-relaxed">
                {currentCard.front}
              </p>
            </div>

            <div className="text-center pt-6 border-t border-[#E7E2D9] dark:border-[#2C2C30]">
              <span className="text-xs font-semibold text-[#A8A29E] dark:text-[#78716C] uppercase tracking-wider">
                Clique no card para ver a resposta [Espaço]
              </span>
            </div>
          </div>

          {/* BACK FACE */}
          <div id="srs-flashcard-back" className="[grid-area:1/1] backface-hidden rotate-y-180 w-full min-h-[360px] bg-[#FAF8F5] dark:bg-[#1A1A1D] rounded-3xl p-6 sm:p-8 shadow-xl border border-[#CFE1D6] dark:border-[#22392D] flex flex-col justify-between">
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
                  onClick={() => soundFx.speak(currentCard.back)}
                  title="Ouvir resposta"
                  className="p-1.5 rounded-lg text-[#A8A29E] hover:text-[#57534E] dark:hover:text-[#E7E5E4] hover:bg-[#EFECE6] dark:hover:bg-[#232326] transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
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

            <div className="py-6 text-center">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-2">
                Resposta / Definição
              </span>
              <p className="text-lg sm:text-xl font-medium text-[#1C1917] dark:text-[#FAF9F5] leading-relaxed">
                {currentCard.back}
              </p>
            </div>

            <div className="text-center pt-6 border-t border-[#E7E2D9] dark:border-[#2C2C30]">
              <span className="text-xs font-semibold text-[#A8A29E] dark:text-[#78716C] uppercase tracking-wider">
                Como foi lembrar deste card? Classifique abaixo.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Rating Buttons */}
      {isRevealed && intervalPreviews ? (
        <div className="w-full animate-in fade-in slide-in-from-bottom-3 duration-200">
          <p className="text-center text-xs font-semibold text-[#78716C] dark:text-[#A8A29E] uppercase tracking-wider mb-2.5">
            Como foi lembrar deste card?
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 mb-3">
            {RATING_CONFIG.map((cfg) => (
              <button
                key={cfg.rating}
                onClick={() => handleRating(cfg.rating)}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition-all hover:scale-[1.02] cursor-pointer ${cfg.classes}`}
              >
                <span className="text-xs font-bold">{cfg.label}</span>
                <span className={`text-[11px] font-mono mt-0.5 opacity-80 ${cfg.badge}`}>
                  {intervalPreviews[cfg.rating]}
                </span>
                <span className="text-[10px] font-mono opacity-50 mt-1">
                  Tecla {cfg.keyLabel}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-start justify-center gap-2 text-[11px] text-[#78716C] dark:text-[#A8A29E] max-w-lg mx-auto leading-snug">
            <Sparkles className="w-3.5 h-3.5 text-[#2D5A46] shrink-0 mt-0.5" />
            <p>
              <strong className="text-[#44403C] dark:text-[#D6D3CD] font-semibold">Não sei</strong> mantém o cartão
              na sessão até você acertar. Quanto <strong className="font-semibold">mais difícil</strong>, mais rápido
              ele reaparece; marcando <strong className="font-semibold">Fácil</strong> ele sai da categoria de difíceis.
            </p>
          </div>
        </div>
      ) : (
        <button
          onClick={handleReveal}
          className="w-full py-4 rounded-2xl bg-white dark:bg-[#1A1A1D] border-2 border-[#E7E2D9] dark:border-[#2C2C30] hover:border-[#2D5A46] text-[#1C1917] dark:text-[#FAF9F5] font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-[#2D5A46]" />
          <span>Virar e Ver a Resposta (Espaço)</span>
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