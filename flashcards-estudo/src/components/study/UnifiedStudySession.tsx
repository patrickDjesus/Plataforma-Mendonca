import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Volume2,
  Check,
  X,
  RotateCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  PenTool,
  BookmarkPlus,
  RefreshCw,
  ArrowRight,
  Flame,
  Award,
} from 'lucide-react';
import { Deck, Flashcard } from '../../types';
import { soundFx } from '../../utils/sound';

interface UnifiedStudySessionProps {
  deck: Deck;
  cards: Flashcard[];
  onUpdateCardAcceptedAnswer: (cardId: string, newAcceptedAnswer: string) => void;
  onFinish: (summary: { totalCards: number; correctCount: number; newLearnedAnswers: number }) => void;
  onExit: () => void;
}

type StudyPhase = 'recognition' | 'transition' | 'writing' | 'completed';

function normalizeText(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '') // remove punctuation
    .replace(/\s+/g, ' '); // normalize spaces
}

export const UnifiedStudySession: React.FC<UnifiedStudySessionProps> = ({
  deck,
  cards,
  onUpdateCardAcceptedAnswer,
  onFinish,
  onExit,
}) => {
  const [phase, setPhase] = useState<StudyPhase>('recognition');

  // PHASE 1: Recognition queue ("Sei" vs "Não sei")
  const [recognitionQueue, setRecognitionQueue] = useState<Flashcard[]>(() => [...cards]);
  const [isFlipped, setIsFlipped] = useState(false);
  const [recognitionAttempts, setRecognitionAttempts] = useState(0);
  const [recognitionFailures, setRecognitionFailures] = useState<Record<string, number>>({});

  // PHASE 2: Writing queue ("Escrever Resposta")
  const [writingQueue, setWritingQueue] = useState<Flashcard[]>([]);
  const [userInput, setUserInput] = useState('');
  const [writingAttempts, setWritingAttempts] = useState(0);
  const [feedbackState, setFeedbackState] = useState<'idle' | 'direct_correct' | 'ask_if_correct'>('idle');
  const [newAcceptedCount, setNewAcceptedCount] = useState(0);
  const [recentlySavedFormat, setRecentlySavedFormat] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionFlipTimeout = useRef<number | null>(null);

  const totalCardsCount = cards.length;

  // Clear pending flip-back timeout if the session unmounts mid-animation
  useEffect(() => {
    return () => {
      if (recognitionFlipTimeout.current !== null) {
        window.clearTimeout(recognitionFlipTimeout.current);
      }
    };
  }, []);

  // Keybindings for Recognition & Writing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing inside an input in Phase 2
      if (phase === 'writing' && feedbackState !== 'ask_if_correct') {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleCheckWriting();
        }
        return;
      }

      if (phase === 'recognition') {
        if (e.code === 'Space') {
          e.preventDefault();
          setIsFlipped((prev) => !prev);
        } else if (isFlipped) {
          if (e.key === '1' || e.key === 'ArrowLeft') {
            e.preventDefault();
            handleRecognitionAnswer(false);
          } else if (e.key === '2' || e.key === 'ArrowRight') {
            e.preventDefault();
            handleRecognitionAnswer(true);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, isFlipped, feedbackState, userInput]);

  // Focus input automatically when starting writing phase or moving to next card
  useEffect(() => {
    if (phase === 'writing' && feedbackState === 'idle') {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [phase, writingQueue, feedbackState]);

  // Current cards in active queues
  const currentRecognitionCard = recognitionQueue[0];
  const currentWritingCard = writingQueue[0];

  // ==========================================
  // PHASE 1 HANDLERS (Recognition: Sei vs Não Sei)
  // ==========================================
  const handleRecognitionAnswer = (knows: boolean) => {
    if (!currentRecognitionCard) return;
    if (recognitionFlipTimeout.current !== null) return;

    setRecognitionAttempts((prev) => prev + 1);

    if (knows) {
      // User knows it!
      soundFx.playCorrect();
    } else {
      // User doesn't know it -> Card stays in queue, re-appended to the end
      soundFx.playWrong();
      setRecognitionFailures((prev) => ({
        ...prev,
        [currentRecognitionCard.id]: (prev[currentRecognitionCard.id] || 0) + 1,
      }));
    }

    const queueWhenAnswered = recognitionQueue;

    // Flip the card back to the question first, then advance to the next card
    setIsFlipped(false);

    recognitionFlipTimeout.current = window.setTimeout(() => {
      recognitionFlipTimeout.current = null;

      if (knows) {
        const nextQueue = queueWhenAnswered.slice(1);
        setRecognitionQueue(nextQueue);

        if (nextQueue.length === 0) {
          // Phase 1 finished! Transition to Writing phase
          soundFx.playVictory();
          setPhase('transition');
        }
      } else if (queueWhenAnswered.length > 1) {
        // Move to back of the queue so it reappears until answered correctly
        setRecognitionQueue([...queueWhenAnswered.slice(1), queueWhenAnswered[0]]);
      }
    }, 500);
  };

  // Start Phase 2 (Writing) from scratch with all deck cards
  const handleStartWritingPhase = () => {
    // Fresh copy of all cards for the writing phase
    setWritingQueue([...cards]);
    setUserInput('');
    setFeedbackState('idle');
    setPhase('writing');
  };

  // ==========================================
  // PHASE 2 HANDLERS (Writing: Digitar e Validar)
  // ==========================================
  const handleCheckWriting = () => {
    if (!currentWritingCard || !userInput.trim() || feedbackState !== 'idle') return;

    setWritingAttempts((prev) => prev + 1);

    const normalizedInput = normalizeText(userInput);
    const normalizedDefault = normalizeText(currentWritingCard.back);

    // List of accepted answers
    const acceptedList = (currentWritingCard.acceptedAnswers || []).map((ans) =>
      normalizeText(ans)
    );

    // Check direct equality against back or any already accepted answer
    const isDirectMatch =
      normalizedInput === normalizedDefault || acceptedList.includes(normalizedInput);

    if (isDirectMatch) {
      // DIRECT MATCH: Correct!
      soundFx.playCorrect();
      setFeedbackState('direct_correct');

      setTimeout(() => {
        advanceWritingCard();
      }, 1000);
    } else {
      // NOT DIRECTLY EQUAL: Ask the user if their answer is correct in this format!
      soundFx.playFlip();
      setFeedbackState('ask_if_correct');
    }
  };

  // User confirms: "Sim, está certo dessa forma (Salvar para o futuro)"
  const handleConfirmUserFormat = () => {
    if (!currentWritingCard || !userInput.trim()) return;

    const trimmedInput = userInput.trim();

    // Persist this format for the card so it will count in the future as well
    onUpdateCardAcceptedAnswer(currentWritingCard.id, trimmedInput);
    setNewAcceptedCount((prev) => prev + 1);
    setRecentlySavedFormat(trimmedInput);

    soundFx.playCorrect();
    setFeedbackState('direct_correct');

    setTimeout(() => {
      setRecentlySavedFormat(null);
      advanceWritingCard();
    }, 1300);
  };

  // User confirms: "Não, me enganei (Rever e tentar de novo)"
  const handleRejectUserFormat = () => {
    if (!currentWritingCard) return;

    soundFx.playWrong();
    setUserInput('');
    setFeedbackState('idle');

    // Card goes to the back of the writing queue to reappear until correct
    if (writingQueue.length > 1) {
      setWritingQueue((prev) => [...prev.slice(1), prev[0]]);
    }
  };

  // Advance to next card in Writing Queue
  const advanceWritingCard = () => {
    setUserInput('');
    setFeedbackState('idle');

    const nextQueue = writingQueue.slice(1);
    setWritingQueue(nextQueue);

    if (nextQueue.length === 0) {
      // Whole session completed!
      soundFx.playVictory();
      setPhase('completed');
      onFinish({
        totalCards: totalCardsCount,
        correctCount: totalCardsCount,
        newLearnedAnswers: newAcceptedCount,
      });
    }
  };

  // ==========================================
  // VIEW: TRANSITION (Phase 1 -> Phase 2)
  // ==========================================
  if (phase === 'transition') {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-12 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-[#FAF8F5] dark:bg-[#1A1A1D] border-2 border-[#E7E2D9] dark:border-[#2C2C30] rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] relative overflow-hidden">
          {/* Decorative stamp */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#EAF5EE] dark:bg-[#1A3326] text-[#2D5A46] dark:text-[#52B788] shadow-sm mb-2 border border-[#C5E4D1] dark:border-[#24533A]">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <span className="text-xs uppercase tracking-widest font-mono font-bold text-[#2D5A46] block">
              1ª Etapa Concluída
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-['Fraunces',serif] text-[#1C1917] dark:text-[#FAF9F5] leading-tight">
              Reconhecimento 100%
            </h2>
            <p className="text-sm text-[#78716C] dark:text-[#A8A29E] leading-relaxed">
              Você revisou e acertou todas as {totalCardsCount} cartas deste baralho. Agora o sistema reiniciará do zero para você{' '}
              <strong className="text-[#1C1917] dark:text-[#FAF9F5] font-semibold">digitar cada resposta</strong> e fixar o conteúdo na memória motora.
            </p>
          </div>

          {/* Quick notes box */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#141416] border border-[#E7E2D9] dark:border-[#2C2C30] text-left max-w-md mx-auto text-xs text-[#57534E] dark:text-[#A8A29E] space-y-2">
            <div className="flex items-start gap-2">
              <PenTool className="w-4 h-4 text-[#2D5A46] shrink-0 mt-0.5" />
              <span>
                <strong>Prática de escrita:</strong> Digite como você se lembra. Se estiver correto de outra forma, você poderá aprovar e o sistema salvará para o futuro!
              </span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onExit}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-[#D6D3CD] dark:border-[#3D3A36] text-[#57534E] dark:text-[#D6D3CD] text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              Pausar e Voltar
            </button>
            <button
              id="btn-start-writing-phase"
              onClick={handleStartWritingPhase}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-[#2D5A46] hover:bg-[#21483A] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <span>Iniciar 2ª Etapa (Escrita)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: SESSION COMPLETED
  // ==========================================
  if (phase === 'completed') {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-12 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-[#FAF8F5] dark:bg-[#1A1A1D] border-2 border-[#E7E2D9] dark:border-[#2C2C30] rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#FEF3C7] dark:bg-[#3D2E14] text-[#D97706] dark:text-[#FBBF24] shadow-sm mb-2 border border-[#FDE68A] dark:border-[#5E441D]">
            <Award className="w-10 h-10" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <span className="text-xs uppercase tracking-widest font-mono font-bold text-[#2D5A46] dark:text-[#52B788] block">
              Domínio Total Alcançado
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-['Fraunces',serif] text-[#1C1917] dark:text-[#FAF9F5] leading-tight">
              Baralho 100% Concluído!
            </h2>
            <p className="text-sm text-[#78716C] dark:text-[#A8A29E] leading-relaxed">
              Você dominou as duas fases: reconheceu todas as cartas e escreveu com precisão todas as respostas.
            </p>
          </div>

          {/* Metrics summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-md mx-auto pt-2">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#141416] border border-[#E7E2D9] dark:border-[#2C2C30]">
              <span className="text-[10px] uppercase font-mono font-bold text-[#A8A29E] block">
                Total de Cartas
              </span>
              <span className="text-2xl font-black font-['Fraunces',serif] text-[#1C1917] dark:text-[#FAF9F5]">
                {totalCardsCount}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-[#141416] border border-[#E7E2D9] dark:border-[#2C2C30]">
              <span className="text-[10px] uppercase font-mono font-bold text-[#A8A29E] block">
                Tentativas Reconhec.
              </span>
              <span className="text-2xl font-black font-['Fraunces',serif] text-[#2D5A46]">
                {recognitionAttempts}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-[#141416] border border-[#E7E2D9] dark:border-[#2C2C30] col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-mono font-bold text-[#A8A29E] block">
                Novos Formatos Salvos
              </span>
              <span className="text-2xl font-black font-['Fraunces',serif] text-[#2D5A46] dark:text-[#52B788]">
                {newAcceptedCount}
              </span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                setPhase('recognition');
                setRecognitionQueue([...cards]);
                setIsFlipped(false);
                setRecognitionAttempts(0);
                setWritingAttempts(0);
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-[#D6D3CD] dark:border-[#3D3A36] text-[#57534E] dark:text-[#D6D3CD] text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Estudar Novamente</span>
            </button>
            <button
              onClick={onExit}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#1C1917] dark:bg-[#FAF9F5] text-white dark:text-[#1C1917] text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              Voltar aos Baralhos
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: ACTIVE STUDYING (Phase 1 or Phase 2)
  // ==========================================
  const activeCard = phase === 'recognition' ? currentRecognitionCard : currentWritingCard;
  const currentQueueLength = phase === 'recognition' ? recognitionQueue.length : writingQueue.length;
  const completedInPhase = totalCardsCount - currentQueueLength;
  const progressPercent = Math.round((completedInPhase / totalCardsCount) * 100);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-in fade-in duration-200">
      {/* Top Header: Navigation & Mode Indicator */}
      <div className="flex items-center justify-between gap-4">
        <button
          id="btn-exit-study-session"
          onClick={onExit}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#78716C] hover:text-[#1C1917] dark:text-[#A8A29E] dark:hover:text-[#FAF9F5] px-3 py-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Sair da Sessão</span>
        </button>

        {/* Phase Pill */}
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
              phase === 'recognition'
                ? 'bg-[#F4EFE6] dark:bg-[#252320] text-[#2D5A46] border-[#E2D9CB] dark:border-[#3D3730]'
                : 'bg-[#EBF3EF] dark:bg-[#1B2922] text-[#2D5A46] dark:text-[#52B788] border-[#CFE1D6] dark:border-[#274535]'
            }`}
          >
            {phase === 'recognition' ? '1ª Etapa: Reconhecimento Ativo' : '2ª Etapa: Fixação por Escrita'}
          </span>
        </div>
      </div>

      {/* Progress Bar & Deck Meta */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[#78716C] dark:text-[#A8A29E]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#1C1917] dark:text-[#FAF9F5] font-['Fraunces',serif]">
              {deck.name}
            </span>
            <span>•</span>
            <span className="font-mono">
              Falta acertar: <strong>{currentQueueLength}</strong> de {totalCardsCount}
            </span>
          </div>

          <span className="font-mono font-bold text-[#1C1917] dark:text-[#FAF9F5]">
            {progressPercent}%
          </span>
        </div>

        {/* Progress track */}
        <div className="w-full bg-[#E7E2D9] dark:bg-[#2C2C30] h-2 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              phase === 'recognition' ? 'bg-[#2D5A46]' : 'bg-[#2D5A46]'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* TACTILE INDEX CARD (Paper / Editorial style) */}
      {activeCard ? (
        <div className="space-y-6">
          {/* =================================================== */}
          {/* PHASE 1: RECOGNITION FLASHCARD (Frente / Verso)     */}
          {/* =================================================== */}
          {phase === 'recognition' && (
<div className="space-y-6">
                <div className="perspective-1000">
                  <div
                    id="study-flashcard-interactive"
                    onClick={() => setIsFlipped(!isFlipped)}
                    className={`grid transform-style-3d transition-transform duration-500 cursor-pointer select-none rounded-3xl border-2 ${
                      isFlipped
                        ? 'rotate-y-180 border-[#2D5A46]'
                        : 'border-[#E7E2D9] dark:border-[#2C2C30]'
                    }`}
                  >
                    {/* FRONT FACE */}
                    <div className="[grid-area:1/1] backface-hidden flex flex-col justify-between min-h-[300px] sm:min-h-[360px] p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#18181B] shadow-[0_6px_24px_rgba(0,0,0,0.04)]">
                      <div className="flex items-center justify-between border-b border-[#F0ECE1] dark:border-[#28282C] pb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#A8A29E]">
                            Frente (Pergunta)
                          </span>
                          {activeCard.tag && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F4EFE6] dark:bg-[#282522] text-[#8C7A6B] dark:text-[#C5B5A5]">
                              {activeCard.tag}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              soundFx.speak(activeCard.front);
                            }}
                            className="p-1.5 rounded-lg text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#FAF9F5] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                            title="Ouvir áudio"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                          <span className="text-xs text-[#A8A29E] flex items-center gap-1 font-mono">
                            <RotateCw className="w-3 h-3" /> Espaço
                          </span>
                        </div>
                      </div>

                      <div className="my-auto py-8 text-center px-2">
                        <div className="space-y-3">
                          <span className="text-xs font-mono uppercase tracking-widest text-[#2D5A46] font-bold block">
                            Pergunta / Conceito
                          </span>
                          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-['Fraunces',serif] text-[#1C1917] dark:text-[#FAF9F5] leading-snug">
                            {activeCard.front}
                          </h2>
                        </div>
                      </div>

                      <div className="border-t border-[#F0ECE1] dark:border-[#28282C] pt-3 text-center text-xs text-[#A8A29E]">
                        <span>Clique no cartão ou aperte <strong>Espaço</strong> para ver a resposta</span>
                      </div>
                    </div>

                    {/* BACK FACE */}
                    <div className="[grid-area:1/1] backface-hidden rotate-y-180 flex flex-col justify-between min-h-[300px] sm:min-h-[360px] p-8 sm:p-10 rounded-3xl bg-[#FAF8F5] dark:bg-[#1E1E22] shadow-[0_12px_36px_rgba(45,90,70,0.12)]">
                      <div className="flex items-center justify-between border-b border-[#F0ECE1] dark:border-[#28282C] pb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#A8A29E]">
                            Verso (Resposta)
                          </span>
                          {activeCard.tag && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F4EFE6] dark:bg-[#282522] text-[#8C7A6B] dark:text-[#C5B5A5]">
                              {activeCard.tag}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              soundFx.speak(activeCard.back);
                            }}
                            className="p-1.5 rounded-lg text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#FAF9F5] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                            title="Ouvir áudio"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                          <span className="text-xs text-[#A8A29E] flex items-center gap-1 font-mono">
                            <RotateCw className="w-3 h-3" /> Espaço
                          </span>
                        </div>
                      </div>

                      <div className="my-auto py-8 text-center px-2">
                        <div className="space-y-4">
                          <span className="text-xs font-mono uppercase tracking-widest text-[#2D5A46] dark:text-[#52B788] font-bold block">
                            Definição / Resposta
                          </span>
                          <p className="text-xl sm:text-2xl font-medium font-['Fraunces',serif] text-[#1C1917] dark:text-[#FAF9F5] leading-relaxed">
                            {activeCard.back}
                          </p>
                          {activeCard.acceptedAnswers && activeCard.acceptedAnswers.length > 0 && (
                            <div className="pt-2">
                              <span className="text-[11px] font-mono text-[#8C7A6B] dark:text-[#A8A29E] block">
                                Formatos aceitos adicionais:
                              </span>
                              <div className="flex items-center justify-center gap-1.5 flex-wrap mt-1">
                                {activeCard.acceptedAnswers.map((alt, i) => (
                                  <span
                                    key={i}
                                    className="text-[11px] px-2 py-0.5 rounded-md bg-[#EBF3EF] dark:bg-[#1D2B24] text-[#2D5A46] dark:text-[#52B788] border border-[#CFE1D6] dark:border-[#2B4637]"
                                  >
                                    {alt}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="border-t border-[#F0ECE1] dark:border-[#28282C] pt-3 text-center text-xs text-[#A8A29E]">
                        <span>Você sabia a resposta antes de virar? Escolha abaixo:</span>
                      </div>
                    </div>
                  </div>
                </div>

              {/* Action Buttons: Sei vs Não Sei */}
              {isFlipped ? (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    id="btn-study-dont-know"
                    onClick={() => handleRecognitionAnswer(false)}
                    className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1A1A1D] border-2 border-[#E7E2D9] dark:border-[#2C2C30] hover:border-[#DC2626] text-[#DC2626] dark:text-[#F87171] hover:bg-[#FEF2F2] dark:hover:bg-[#2C1818] font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer group"
                  >
                    <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>Não sei (repetir até acertar)</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 hidden sm:inline-block">
                      1 ou ←
                    </span>
                  </button>

                  <button
                    id="btn-study-know"
                    onClick={() => handleRecognitionAnswer(true)}
                    className="p-4 sm:p-5 rounded-2xl bg-[#2D5A46] hover:bg-[#234737] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <Check className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>Sei (Acertei)</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/20 hidden sm:inline-block">
                      2 ou →
                    </span>
                  </button>
                </div>
              ) : (
                <button
                  id="btn-study-reveal"
                  onClick={() => setIsFlipped(true)}
                  className="w-full py-4 rounded-2xl bg-white dark:bg-[#1A1A1D] border-2 border-[#E7E2D9] dark:border-[#2C2C30] hover:border-[#2D5A46] text-[#1C1917] dark:text-[#FAF9F5] font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <RotateCw className="w-4 h-4 text-[#2D5A46]" />
                  <span>Virar e Ver a Resposta (Espaço)</span>
                </button>
              )}
            </div>
          )}

          {/* =================================================== */}
          {/* PHASE 2: WRITING FLASHCARD (Digitar e Validar)      */}
          {/* =================================================== */}
          {phase === 'writing' && (
            <div className="space-y-6">
              {/* Question Card */}
              <div className="rounded-3xl p-8 sm:p-10 bg-white dark:bg-[#18181B] border-2 border-[#E7E2D9] dark:border-[#2C2C30] shadow-[0_6px_24px_rgba(0,0,0,0.04)] space-y-4">
                <div className="flex items-center justify-between border-b border-[#F0ECE1] dark:border-[#28282C] pb-3">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#2D5A46] dark:text-[#52B788]">
                    2ª Etapa: Escreva a Definição
                  </span>
                  {activeCard.tag && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F4EFE6] dark:bg-[#282522] text-[#8C7A6B] dark:text-[#C5B5A5]">
                      {activeCard.tag}
                    </span>
                  )}
                </div>

                <div className="text-center py-4">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#A8A29E] font-bold block mb-1">
                    Termo / Pergunta
                  </span>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-['Fraunces',serif] text-[#1C1917] dark:text-[#FAF9F5]">
                    {activeCard.front}
                  </h2>
                </div>

                {/* Input form */}
                {feedbackState !== 'ask_if_correct' && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleCheckWriting();
                    }}
                    className="space-y-3 pt-2"
                  >
                    <div className="relative">
                      <input
                        ref={inputRef}
                        id="input-writing-answer"
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Digite a resposta com suas palavras..."
                        disabled={feedbackState === 'direct_correct'}
                        className={`w-full px-5 py-4 rounded-2xl border-2 text-base sm:text-lg font-medium transition-all focus:outline-none ${
                          feedbackState === 'direct_correct'
                            ? 'bg-[#EBF3EF] dark:bg-[#1D2B24] border-[#2D5A46] text-[#2D5A46] dark:text-[#52B788]'
                            : 'bg-[#FAF8F5] dark:bg-[#1E1E22] border-[#D6D0C5] dark:border-[#3D3A36] text-[#1C1917] dark:text-[#FAF9F5] focus:border-[#2D5A46] focus:bg-white'
                        }`}
                      />
                    </div>

                    {/* Direct Correct Message */}
                    {feedbackState === 'direct_correct' && (
                      <div className="p-4 rounded-2xl bg-[#EAF5EE] dark:bg-[#1A3326] border border-[#C5E4D1] dark:border-[#24533A] flex items-center justify-between text-xs font-bold text-[#2D5A46] dark:text-[#52B788] animate-in fade-in">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>
                            {recentlySavedFormat
                              ? `Formato "${recentlySavedFormat}" aceito e salvo para o futuro!`
                              : 'Excelente! Resposta correta.'}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono opacity-80">Avançando...</span>
                      </div>
                    )}

                    {feedbackState === 'idle' && (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-[#A8A29E] font-mono">
                          Pressione <strong>Enter</strong> para verificar
                        </span>

                        <button
                          id="btn-submit-writing-answer"
                          type="submit"
                          disabled={!userInput.trim()}
                          className="px-6 py-2.5 rounded-xl bg-[#2D5A46] hover:bg-[#234737] disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                        >
                          Verificar Resposta
                        </button>
                      </div>
                    )}
                  </form>
                )}
              </div>

              {/* USER CONFIRMATION DIALOG: "Sua resposta difere. Está certo dessa forma?" */}
              {feedbackState === 'ask_if_correct' && (
                <div
                  id="dialog-confirm-alternate-answer"
                  className="rounded-3xl p-6 sm:p-8 bg-[#FAF8F5] dark:bg-[#1C1B1E] border-2 border-[#E3A824] shadow-lg space-y-5 animate-in fade-in duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#FEF3C7] dark:bg-[#3D2E14] text-[#D97706] dark:text-[#FBBF24] flex items-center justify-center shrink-0 border border-[#FDE68A] dark:border-[#5E441D]">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold font-['Fraunces',serif] text-[#1C1917] dark:text-[#FAF9F5]">
                        Sua resposta difere da resposta padrão cadastrada
                      </h3>
                      <p className="text-xs text-[#78716C] dark:text-[#A8A29E] mt-0.5">
                        O site avaliou seu texto. Verifique se o seu formato também é válido:
                      </p>
                    </div>
                  </div>

                  {/* Comparison cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* User's text */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#141416] border border-[#E7E2D9] dark:border-[#2C2C30]">
                      <span className="text-[10px] uppercase font-mono font-bold text-[#2D5A46] block mb-1">
                        O que você escreveu:
                      </span>
                      <p className="text-sm font-semibold text-[#1C1917] dark:text-[#FAF9F5] font-mono break-words">
                        "{userInput}"
                      </p>
                    </div>

                    {/* Standard text */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#141416] border border-[#E7E2D9] dark:border-[#2C2C30]">
                      <span className="text-[10px] uppercase font-mono font-bold text-[#2D5A46] dark:text-[#52B788] block mb-1">
                        Resposta cadastrada esperada:
                      </span>
                      <p className="text-sm font-semibold text-[#1C1917] dark:text-[#FAF9F5] break-words">
                        "{activeCard.back}"
                      </p>
                    </div>
                  </div>

                  {/* Question & Decision Buttons */}
                  <div className="pt-2 border-t border-[#E7E2D9] dark:border-[#2C2C30] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <BookmarkPlus className="w-4 h-4 text-[#2D5A46] shrink-0" />
                      <span className="text-xs font-bold text-[#1C1917] dark:text-[#FAF9F5]">
                        Está certo dessa forma?
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                      {/* Option: NO (Re-append to queue to practice again) */}
                      <button
                        id="btn-reject-format"
                        onClick={handleRejectUserFormat}
                        className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-[#D6D3CD] dark:border-[#3D3A36] text-[#57534E] dark:text-[#D6D3CD] hover:bg-black/5 dark:hover:bg-white/5 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Não, me enganei (tentar de novo)
                      </button>

                      {/* Option: YES (Accept and SAVE format for future sessions!) */}
                      <button
                        id="btn-accept-and-save-format"
                        onClick={handleConfirmUserFormat}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#2D5A46] hover:bg-[#234737] text-white text-xs font-bold shadow-sm hover:shadow transition-all cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Sim, está certo (salvar para o futuro)</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
