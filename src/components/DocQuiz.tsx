import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  X,
  Sparkles,
  GraduationCap,
  HelpCircle,
  Check,
  AlertCircle,
  Pencil,
  ListChecks,
  Trophy,
  RotateCcw,
  Loader2,
  Brain,
  Timer,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Award,
  Clock,
  Flame,
  LayoutList,
  Compass,
  Zap,
} from 'lucide-react';
import { NotebookDoc, Discipline } from '../data/disciplinesData';
import {
  DocQuizResult,
  generateDocQuiz,
  QuizGenerationStatus,
} from '../services/ai';
import { sectionsToText } from '../utils/docConverter';
import { LatexRenderer } from './LatexRenderer';

interface DocQuizProps {
  doc: NotebookDoc;
  discipline: Discipline;
  groupDocs?: NotebookDoc[];
  groupName?: string;
}

type Stage = 'closed' | 'config' | 'loading' | 'quiz' | 'results';
type QuizViewMode = 'step' | 'list';

const LOADING_TIPS = [
  'Lendo e analisando o conteúdo do seu caderno...',
  'Identificando os principais conceitos, definições e fórmulas...',
  'Elaborando questões desafiadoras e contextualizadas com a IA...',
  'Ajustando o gabarito e as explicações detalhadas...',
  'Quase pronto! Preparando o seu desafio interativo...',
];

const errorMessageForStatus = (status: QuizGenerationStatus): string => {
  switch (status) {
    case 'rate_limit':
      return 'A IA atingiu o limite temporário de requisições. Aguarde alguns segundos e tente novamente.';
    case 'too_large':
      return 'O documento é muito extenso para a análise em uma única rodada. Tente gerar menos questões.';
    case 'timeout':
      return 'A IA demorou um pouco mais do que o esperado. Tente novamente.';
    case 'no_key':
      return 'A chave da API de IA não está configurada (VITE_GROQ_API_KEY).';
    case 'network':
      return 'Não foi possível conectar com a IA. Verifique sua conexão com a internet.';
    default:
      return 'Não foi possível gerar as questões agora. Tente novamente em instantes.';
  }
};

const BallSlider: React.FC<{
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
}> = ({ min, max, value, onChange }) => {
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;
  return (
    <div className="relative h-8 select-none flex items-center">
      <div className="absolute left-0 right-0 h-3 rounded-full bg-[#E7E2D9] dark:bg-[#3B3B40] overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#2D5A46] via-[#3A755B] to-[#52B788] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-grab active:cursor-grabbing z-10"
        aria-label="Ajustar valor"
      />

      <div
        className="pointer-events-none absolute w-6 h-6 rounded-full bg-white dark:bg-[#1C1917] border-4 border-[#2D5A46] dark:border-[#52B788] shadow-lg transition-all"
        style={{ left: `calc(${pct}% - 12px)` }}
      />
    </div>
  );
};

export const DocQuiz: React.FC<DocQuizProps> = ({ doc, discipline, groupDocs, groupName }) => {
  const [stage, setStage] = useState<Stage>('closed');
  const [total, setTotal] = useState(5);
  const [writeCount, setWriteCount] = useState(2);
  const [result, setResult] = useState<DocQuizResult | null>(null);
  const [error, setError] = useState('');
  const [quizScope, setQuizScope] = useState<'document' | 'group'>('document');

  // Estados de execução do quiz
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<QuizViewMode>('step');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [textAnswers, setTextAnswers] = useState<string[]>([]);
  const [dontKnow, setDontKnow] = useState<boolean[]>([]);
  
  // Timer e dica de loading
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [loadingTipIndex, setLoadingTipIndex] = useState(0);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'mistakes' | 'correct'>('all');

  // Semáforo para Groq
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const quizTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const loadingTipTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
      if (quizTimerRef.current) clearInterval(quizTimerRef.current);
      if (loadingTipTimerRef.current) clearInterval(loadingTipTimerRef.current);
    };
  }, []);

  // Timer durante o quiz
  useEffect(() => {
    if (stage === 'quiz') {
      setSecondsElapsed(0);
      quizTimerRef.current = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (quizTimerRef.current) clearInterval(quizTimerRef.current);
    }
    return () => {
      if (quizTimerRef.current) clearInterval(quizTimerRef.current);
    };
  }, [stage]);

  // Rotação de dicas durante loading
  useEffect(() => {
    if (stage === 'loading') {
      setLoadingTipIndex(0);
      loadingTipTimerRef.current = setInterval(() => {
        setLoadingTipIndex((prev) => (prev + 1) % LOADING_TIPS.length);
      }, 2400);
    } else {
      if (loadingTipTimerRef.current) clearInterval(loadingTipTimerRef.current);
    }
    return () => {
      if (loadingTipTimerRef.current) clearInterval(loadingTipTimerRef.current);
    };
  }, [stage]);

  const startCooldown = (totalQuestions: number) => {
    const seconds = Math.max(15, Math.round(totalQuestions * 4));
    setCooldownLeft(seconds);
    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    cooldownTimerRef.current = setInterval(() => {
      setCooldownLeft((prev) => {
        if (prev <= 1) {
          if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const docsText = useMemo(() => {
    if (quizScope === 'group' && groupDocs && groupDocs.length > 0) {
      return groupDocs.map((d, idx) => 
        `=== DOCUMENTO ${idx + 1}: ${d.title} ===\nResumo: ${d.summary || '—'}\n\n${sectionsToText(d.sections || [])}`
      ).join('\n\n----------------------------------------\n\n');
    }
    return `Título: ${doc.title}\n\nResumo: ${doc.summary || '—'}\n\n${sectionsToText(doc.sections || [])}`;
  }, [doc, groupDocs, quizScope]);

  const activeDocTitle = useMemo(() => {
    if (quizScope === 'group' && groupName) {
      return `Grupo "${groupName}" (${groupDocs?.length || 0} documentos)`;
    }
    return doc.title;
  }, [doc.title, groupName, groupDocs, quizScope]);

  const chooseCount = Math.max(0, total - writeCount);

  const resetQuiz = () => {
    setAnswers([]);
    setTextAnswers([]);
    setDontKnow([]);
    setError('');
    setCurrentIndex(0);
    setSecondsElapsed(0);
  };

  const openConfig = () => {
    setStage('config');
    resetQuiz();
  };

  const handleGenerate = async () => {
    if (cooldownLeft > 0) return;
    setStage('loading');
    setError('');
    const outcome = await generateDocQuiz({
      docTitle: activeDocTitle,
      discipline: discipline.name,
      docText: docsText,
      total,
      writeCount,
      chooseCount,
    });

    startCooldown(total);

    if (outcome.status !== 'ok' || !outcome.quiz || outcome.quiz.questions.length === 0) {
      setError(errorMessageForStatus(outcome.status === 'ok' ? 'parse' : outcome.status));
      setStage('config');
      return;
    }

    const quiz = outcome.quiz;
    const n = quiz.questions.length;
    setResult(quiz);
    setAnswers(Array(n).fill(null));
    setTextAnswers(Array(n).fill(''));
    setDontKnow(Array(n).fill(false));
    setCurrentIndex(0);
    setStage('quiz');
  };

  const answeredCount = useMemo(() => {
    if (!result) return 0;
    return result.questions.reduce((acc, q, i) => {
      if (dontKnow[i]) return acc;
      if (q.type === 'assinalar') return acc + (answers[i] !== null ? 1 : 0);
      return acc + (textAnswers[i] && textAnswers[i].trim() ? 1 : 0);
    }, 0);
  }, [result, answers, textAnswers, dontKnow]);

  const multipleChoiceTotal = useMemo(() => {
    if (!result) return 0;
    return result.questions.filter((q) => q.type === 'assinalar').length;
  }, [result]);

  const score = useMemo(() => {
    if (!result) return 0;
    return result.questions.reduce((acc, q, i) => {
      if (q.type !== 'assinalar') return acc;
      if (dontKnow[i]) return acc;
      return acc + (answers[i] === q.correctIndex ? 1 : 0);
    }, 0);
  }, [result, answers, dontKnow]);

  const accuracyPercent = useMemo(() => {
    if (!result || result.questions.length === 0) return 0;
    if (multipleChoiceTotal > 0) {
      return Math.round((score / multipleChoiceTotal) * 100);
    }
    return Math.round((answeredCount / result.questions.length) * 100);
  }, [result, multipleChoiceTotal, score, answeredCount]);

  const triggerCelebration = useCallback(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2D5A46', '#52B788', '#F59E0B', '#3B82F6', '#10B981'],
      });
      setTimeout(() => {
        confetti({
          particleCount: 45,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 45,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 350);
    } catch {
      // Ignora se indisponível
    }
  }, []);

  const finishQuiz = () => {
    setStage('results');
    if (accuracyPercent >= 60 || answeredCount === result?.questions.length) {
      triggerCelebration();
    }
  };

  const closeAll = useCallback(() => {
    setStage('closed');
    setResult(null);
    resetQuiz();
  }, []);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Atalhos de teclado durante o quiz
  useEffect(() => {
    if (stage !== 'quiz' || !result) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isTextarea = activeEl && activeEl.tagName === 'TEXTAREA';

      if (e.key === 'ArrowRight' && !isTextarea) {
        if (currentIndex < result.questions.length - 1) {
          setCurrentIndex((i) => i + 1);
        }
      } else if (e.key === 'ArrowLeft' && !isTextarea) {
        if (currentIndex > 0) {
          setCurrentIndex((i) => i - 1);
        }
      } else if (e.key === 'Escape') {
        closeAll();
      } else if (['1', '2', '3', '4'].includes(e.key) && !isTextarea) {
        const currentQ = result.questions[currentIndex];
        if (currentQ && currentQ.type === 'assinalar' && currentQ.options) {
          const optIdx = parseInt(e.key, 10) - 1;
          if (optIdx < currentQ.options.length) {
            setAnswers((prev) => {
              const next = [...prev];
              next[currentIndex] = optIdx;
              return next;
            });
            setDontKnow((prev) => {
              const next = [...prev];
              next[currentIndex] = false;
              return next;
            });
          }
        }
      } else if (['a', 'b', 'c', 'd', 'A', 'B', 'C', 'D'].includes(e.key) && !isTextarea) {
        const currentQ = result.questions[currentIndex];
        if (currentQ && currentQ.type === 'assinalar' && currentQ.options) {
          const optIdx = e.key.toLowerCase().charCodeAt(0) - 97;
          if (optIdx >= 0 && optIdx < currentQ.options.length) {
            setAnswers((prev) => {
              const next = [...prev];
              next[currentIndex] = optIdx;
              return next;
            });
            setDontKnow((prev) => {
              const next = [...prev];
              next[currentIndex] = false;
              return next;
            });
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stage, result, currentIndex, closeAll]);

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  return (
    <>
      {/* Botão flutuante só com o chapéu (canto inferior direito) */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: 'spring', damping: 18, stiffness: 350 }}
        onClick={openConfig}
        className="fixed bottom-6 right-6 z-[90] w-12 h-12 rounded-full bg-gradient-to-br from-[#2D5A46] via-[#21483A] to-[#0E1712] text-white shadow-xl shadow-[#2D5A46]/35 hover:shadow-2xl hover:shadow-[#2D5A46]/50 border border-emerald-400/25 flex items-center justify-center cursor-pointer group"
        title="Criar um teste com IA sobre este caderno"
        aria-label="Iniciar Teste com IA"
      >
        <span className="relative flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-emerald-100 group-hover:scale-110 group-hover:rotate-6 transition-transform" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 border border-[#1E3E30] group-hover:animate-ping" />
        </span>
      </motion.button>

      {/* ======================= MODAL DE CONFIGURAÇÃO ======================= */}
      <AnimatePresence>
        {stage === 'config' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[95] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setStage('closed')}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white dark:bg-[#18181B] rounded-[32px] border border-[#CFE1D6] dark:border-[#22392D]/60 shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="px-6 py-5 bg-gradient-to-r from-[#2D5A46] via-[#1E3E30] to-[#0E1712] text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-inner">
                    <GraduationCap className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base font-display leading-tight flex items-center gap-2">
                      Desafio com IA
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-semibold">
                        Imersivo
                      </span>
                    </h3>
                    <p className="text-xs text-white/80 truncate max-w-[280px]">{doc.title}</p>
                  </div>
                </div>
                <button
                  onClick={() => setStage('closed')}
                  className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Seleção do Escopo (Documento individual vs Grupo completo) */}
                {groupDocs && groupDocs.length > 1 && (
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-2">
                      Escopo do Teste com IA
                    </label>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-[#EFECE6] dark:bg-[#232326] rounded-2xl border border-[#E7E2D9] dark:border-[#3B3B40]">
                      <button
                        type="button"
                        onClick={() => setQuizScope('document')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          quizScope === 'document'
                            ? 'bg-[#2D5A46] text-white shadow-xs'
                            : 'text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917]'
                        }`}
                      >
                        Apenas Este Documento
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuizScope('group')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          quizScope === 'group'
                            ? 'bg-[#2D5A46] text-white shadow-xs'
                            : 'text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917]'
                        }`}
                      >
                        Todo o Grupo ({groupDocs.length} docs)
                      </button>
                    </div>
                  </div>
                )}

                {/* Quantidade de questões */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Quantidade de questões
                    </span>
                    <span className="text-sm font-black font-mono text-[#2D5A46] dark:text-emerald-400 bg-[#EBF3EF] dark:bg-[#15221B] px-3 py-0.5 rounded-full border border-[#CFE1D6] dark:border-[#22392D]/60">
                      {total} {total === 1 ? 'questão' : 'questões'}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {[3, 5, 8, 10].map((qty) => (
                      <button
                        key={qty}
                        type="button"
                        onClick={() => {
                          setTotal(qty);
                          setWriteCount((w) => (w > qty ? qty : w));
                        }}
                        className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          total === qty
                            ? 'bg-[#2D5A46] text-white border-[#2D5A46] shadow-sm'
                            : 'bg-slate-50 dark:bg-[#232326] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-[#3B3B40] hover:bg-slate-100 dark:hover:bg-[#2A2A2E]'
                        }`}
                      >
                        {qty} questões
                      </button>
                    ))}
                  </div>

                  <BallSlider
                    min={1}
                    max={10}
                    value={total}
                    onChange={(v) => {
                      setTotal(v);
                      setWriteCount((w) => (w > v ? v : w));
                    }}
                  />
                </div>

                {/* Formato das questões */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Formato das questões
                    </span>
                    <span className="text-xs font-bold font-mono text-[#2D5A46] dark:text-emerald-400 bg-[#EBF3EF] dark:bg-[#15221B] px-2.5 py-0.5 rounded-full border border-[#CFE1D6] dark:border-[#22392D]/60">
                      {writeCount} Dissertativas • {chooseCount} Múltipla Escolha
                    </span>
                  </div>

                  <BallSlider min={0} max={total} value={writeCount} onChange={setWriteCount} />

                  <div className="flex justify-between mt-1 text-[11px] font-semibold">
                    <span className="text-sky-600 dark:text-sky-400 flex items-center gap-1">
                      <Pencil className="w-3 h-3" /> {writeCount} dissertativas
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <ListChecks className="w-3 h-3" /> {chooseCount} múltipla escolha
                    </span>
                  </div>
                </div>

                {/* Resumo */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/70 dark:border-sky-900/60 p-3 text-center">
                    <div className="text-xl font-black text-sky-600 dark:text-sky-300">{writeCount}</div>
                    <div className="text-[10px] uppercase tracking-wider text-sky-500 font-bold">Escrever</div>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-900/60 p-3 text-center">
                    <div className="text-xl font-black text-emerald-600 dark:text-emerald-300">{chooseCount}</div>
                    <div className="text-[10px] uppercase tracking-wider text-emerald-500 font-bold">Assinalar</div>
                  </div>
                  <div className="rounded-2xl bg-[#EBF3EF] dark:bg-[#15221B] border border-[#CFE1D6] dark:border-[#22392D]/60 p-3 text-center">
                    <div className="text-xl font-black text-[#2D5A46] dark:text-emerald-400">{total}</div>
                    <div className="text-[10px] uppercase tracking-wider text-[#2D5A46]/70 dark:text-emerald-400/70 font-bold">Total</div>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-900/60 rounded-2xl p-3">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  onClick={handleGenerate}
                  disabled={cooldownLeft > 0}
                  className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-[#2D5A46] via-[#21483A] to-[#0E1712] text-white text-sm font-bold shadow-lg shadow-[#2D5A46]/25 hover:shadow-xl hover:shadow-[#2D5A46]/35 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 disabled:hover:shadow-none"
                >
                  {cooldownLeft > 0 ? (
                    <>
                      <Timer className="w-4 h-4 animate-pulse" />
                      Aguarde {cooldownLeft}s (limite da IA)
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Iniciar Desafio com IA
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================= TELA DE CARREGAMENTO IMERSIVA ======================= */}
      <AnimatePresence>
        {stage === 'loading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-gradient-to-br from-slate-950 via-[#0B1510] to-[#14261D] flex items-center justify-center p-6 text-white text-center"
          >
            <div className="relative max-w-md w-full flex flex-col items-center">
              <div className="relative mb-8">
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-2xl animate-pulse" />
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#2D5A46] to-[#52B788] flex items-center justify-center border border-white/20 shadow-2xl relative">
                  <Brain className="w-12 h-12 text-white animate-pulse" />
                </div>
              </div>

              <h3 className="font-display font-black text-2xl text-white mb-2">
                Criando seu Teste Interativo
              </h3>
              <p className="text-sm text-emerald-200/80 mb-6 font-medium">
                {doc.title} • {discipline.name}
              </p>

              <div className="w-full bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4 min-h-[72px] flex items-center justify-center mb-6">
                <motion.p
                  key={loadingTipIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="text-xs text-slate-300 font-medium leading-relaxed"
                >
                  💡 {LOADING_TIPS[loadingTipIndex]}
                </motion.p>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-4 py-1.5 rounded-full">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{total} questões em processamento</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================= TELA DO TESTE (MODERNA & TELA CHEIA) ======================= */}
      <AnimatePresence>
        {stage === 'quiz' && result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[100] ${
              isFullscreen
                ? 'bg-[#FAF9F5] dark:bg-[#121214] p-0'
                : 'bg-slate-950/80 backdrop-blur-xl p-2 sm:p-6 flex items-center justify-center'
            } transition-all select-text`}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 12 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className={`w-full ${
                isFullscreen
                  ? 'h-full rounded-none border-none'
                  : 'max-w-4xl h-[92vh] max-h-[860px] rounded-[32px] border border-slate-200/80 dark:border-slate-800 shadow-2xl'
              } bg-[#FAF9F5] dark:bg-[#18181B] text-slate-900 dark:text-[#FAF9F5] flex flex-col overflow-hidden`}
            >
              {/* Top Bar / Header do Quiz */}
              <div className="px-5 sm:px-8 py-3.5 bg-white dark:bg-[#1F1F23] border-b border-[#E7E2D9] dark:border-[#2C2C30] shrink-0 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#EBF3EF] dark:bg-[#15221B] text-[#2D5A46] dark:text-[#52B788] flex items-center justify-center shrink-0 border border-[#CFE1D6] dark:border-[#22392D]">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white truncate">
                        {discipline.name}
                      </h3>
                      <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#2A2A2E] text-slate-600 dark:text-slate-400">
                        {doc.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      <span>Respondidas: <strong className="text-[#2D5A46] dark:text-[#52B788]">{answeredCount}</strong> de {result.questions.length}</span>
                    </div>
                  </div>
                </div>

                {/* Controles de Topo: Timer, Modo de Visualização, Fullscreen, Fechar */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-[#27272A] border border-slate-200 dark:border-[#38383D] text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-[#2D5A46] dark:text-[#52B788]" />
                    <span>{formatTimer(secondsElapsed)}</span>
                  </div>

                  <div className="flex items-center bg-slate-100 dark:bg-[#27272A] p-0.5 rounded-xl border border-slate-200 dark:border-[#38383D]">
                    <button
                      type="button"
                      onClick={() => setViewMode('step')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                        viewMode === 'step'
                          ? 'bg-white dark:bg-[#18181B] text-[#2D5A46] dark:text-[#52B788] shadow-sm'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                      title="Modo Foco (Passo a Passo)"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">Foco</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                        viewMode === 'list'
                          ? 'bg-white dark:bg-[#18181B] text-[#2D5A46] dark:text-[#52B788] shadow-sm'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                      title="Modo Lista (Todas)"
                    >
                      <LayoutList className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">Lista</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#27272A] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                    title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={closeAll}
                    className="p-1.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                    title="Fechar teste"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Barra de Progresso Suave */}
              <div className="w-full bg-[#E7E2D9] dark:bg-[#27272A] h-1.5 shrink-0 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#2D5A46] via-[#3A755B] to-[#52B788]"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((answeredCount) / result.questions.length) * 100}%`,
                  }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                />
              </div>

              {/* Corpo Principal do Quiz */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col justify-between">
                {viewMode === 'step' ? (
                  // =================== MODO FOCO / PASSO A PASSO ===================
                  <div className="max-w-2xl mx-auto w-full my-auto">
                    {(() => {
                      const q = result.questions[currentIndex];
                      if (!q) return null;
                      const isDontKnow = dontKnow[currentIndex];
                      const selectedOpt = answers[currentIndex];
                      const textAns = textAnswers[currentIndex] || '';

                      return (
                        <motion.div
                          key={currentIndex}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.25 }}
                          className="space-y-6"
                        >
                          {/* Tags de Questão & Tipo */}
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-black uppercase px-3 py-1 rounded-full bg-[#2D5A46] text-white">
                                Questão {currentIndex + 1} de {result.questions.length}
                              </span>
                              {q.type === 'escrever' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-900">
                                  <Pencil className="w-3 h-3" /> Dissertativa
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                                  <ListChecks className="w-3 h-3" /> Múltipla Escolha
                                </span>
                              )}
                            </div>

                            {/* Botão de Dúvida / Não sei */}
                            <button
                              type="button"
                              onClick={() =>
                                setDontKnow((prev) => {
                                  const next = [...prev];
                                  next[currentIndex] = !next[currentIndex];
                                  return next;
                                })
                              }
                              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                isDontKnow
                                  ? 'bg-amber-500 text-white border-amber-500 shadow-md'
                                  : 'bg-white dark:bg-[#232326] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-[#38383D] hover:border-amber-400 hover:text-amber-600'
                              }`}
                            >
                              <HelpCircle className="w-3.5 h-3.5" />
                              <span>{isDontKnow ? 'Marcada como dúvida' : 'Não sei responder'}</span>
                            </button>
                          </div>

                          {/* Enunciado Grande & Destacado */}
                          <div className="p-6 rounded-3xl bg-white dark:bg-[#232326] border border-[#E7E2D9] dark:border-[#2C2C30] shadow-sm">
                            <div className="text-base sm:text-lg font-bold font-display text-slate-900 dark:text-white leading-relaxed">
                              <LatexRenderer content={q.question} />
                            </div>
                          </div>

                          {/* Resposta / Alternativas */}
                          {q.type === 'assinalar' && q.options && (
                            <div className="grid grid-cols-1 gap-3">
                              {q.options.map((opt, oi) => {
                                const isSel = selectedOpt === oi;
                                const letter = String.fromCharCode(65 + oi);

                                return (
                                  <motion.button
                                    key={oi}
                                    type="button"
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={() => {
                                      setAnswers((prev) => {
                                        const next = [...prev];
                                        next[currentIndex] = oi;
                                        return next;
                                      });
                                      setDontKnow((prev) => {
                                        const next = [...prev];
                                        next[currentIndex] = false;
                                        return next;
                                      });
                                    }}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                                      isSel
                                        ? 'bg-[#EBF3EF] dark:bg-[#172B21] border-[#2D5A46] dark:border-[#52B788] ring-2 ring-[#2D5A46]/20 shadow-md'
                                        : 'bg-white dark:bg-[#232326] border-slate-200 dark:border-[#38383D] hover:border-[#2D5A46]/40 hover:bg-slate-50 dark:hover:bg-[#2A2A2E]'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3.5 min-w-0 pr-2 flex-1">
                                      <span
                                        className={`w-8 h-8 rounded-xl font-mono font-black text-xs flex items-center justify-center shrink-0 border transition-colors ${
                                          isSel
                                            ? 'bg-[#2D5A46] dark:bg-[#52B788] text-white border-transparent'
                                            : 'bg-slate-100 dark:bg-[#2C2C30] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#3F3F46]'
                                        }`}
                                      >
                                        {letter}
                                      </span>
                                      <div className="text-sm font-medium text-slate-800 dark:text-slate-100 leading-snug flex-1">
                                        <LatexRenderer content={opt} />
                                      </div>
                                    </div>

                                    {isSel && (
                                      <div className="w-6 h-6 rounded-full bg-[#2D5A46] dark:bg-[#52B788] text-white flex items-center justify-center shrink-0">
                                        <Check className="w-3.5 h-3.5" />
                                      </div>
                                    )}
                                  </motion.button>
                                );
                              })}
                            </div>
                          )}

                          {q.type === 'escrever' && (
                            <div className="space-y-2">
                              <textarea
                                value={textAns}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setTextAnswers((prev) => {
                                    const next = [...prev];
                                    next[currentIndex] = val;
                                    return next;
                                  });
                                  if (val.trim()) {
                                    setDontKnow((prev) => {
                                      const next = [...prev];
                                      next[currentIndex] = false;
                                      return next;
                                    });
                                  }
                                }}
                                placeholder="Digite sua resposta completa com base no conteúdo estudado..."
                                rows={5}
                                className="w-full bg-white dark:bg-[#232326] border border-slate-200 dark:border-[#38383D] rounded-2xl p-4 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2D5A46]/30 resize-none font-medium leading-relaxed"
                              />
                              <div className="flex justify-between items-center text-[11px] text-slate-400 px-1 font-mono">
                                <span>{textAns.trim() ? `${textAns.trim().split(/\s+/).length} palavras` : 'Aguardando resposta...'}</span>
                                <span>{textAns.length} caracteres</span>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      );
                    })()}
                  </div>
                ) : (
                  // =================== MODO LISTA COMPLETA ===================
                  <div className="max-w-3xl mx-auto w-full space-y-6">
                    {result.questions.map((q, i) => {
                      const isDontKnow = dontKnow[i];
                      const selectedOpt = answers[i];
                      const textAns = textAnswers[i] || '';

                      return (
                        <div
                          key={i}
                          className={`rounded-3xl border p-5 sm:p-6 transition-all ${
                            isDontKnow
                              ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/50'
                              : 'bg-white dark:bg-[#232326] border-slate-200 dark:border-[#38383D]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 mb-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-black uppercase px-2.5 py-0.5 rounded-full bg-[#2D5A46] text-white">
                                Q{i + 1}
                              </span>
                              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                {q.type === 'escrever' ? '✍️ Dissertativa' : '✅ Múltipla Escolha'}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                setDontKnow((prev) => {
                                  const next = [...prev];
                                  next[i] = !next[i];
                                  return next;
                                })
                              }
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                                isDontKnow
                                  ? 'bg-amber-500 text-white border-amber-500'
                                  : 'bg-slate-50 dark:bg-[#2C2C30] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-[#3F3F46]'
                              }`}
                            >
                              <HelpCircle className="w-3 h-3" />
                              <span>{isDontKnow ? 'Dúvida' : 'Não sei'}</span>
                            </button>
                          </div>

                          <div className="text-sm font-bold text-slate-900 dark:text-white mb-4 leading-relaxed">
                            <LatexRenderer content={q.question} />
                          </div>

                          {q.type === 'assinalar' && q.options && (
                            <div className="space-y-2">
                              {q.options.map((opt, oi) => {
                                const isSel = selectedOpt === oi;
                                return (
                                  <button
                                    key={oi}
                                    type="button"
                                    onClick={() => {
                                      setAnswers((prev) => {
                                        const next = [...prev];
                                        next[i] = oi;
                                        return next;
                                      });
                                      setDontKnow((prev) => {
                                        const next = [...prev];
                                        next[i] = false;
                                        return next;
                                      });
                                    }}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer ${
                                      isSel
                                        ? 'bg-[#EBF3EF] dark:bg-[#172B21] border-[#2D5A46] dark:border-[#52B788] text-[#2D5A46] dark:text-[#52B788] font-bold'
                                        : 'bg-slate-50 dark:bg-[#1F1F23] border-slate-200 dark:border-[#38383D] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#28282C]'
                                    }`}
                                  >
                                    <span className="font-mono font-bold shrink-0">{String.fromCharCode(65 + oi)})</span>
                                    <div className="flex-1 leading-snug"><LatexRenderer content={opt} /></div>
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {q.type === 'escrever' && (
                            <textarea
                              value={textAns}
                              onChange={(e) => {
                                const val = e.target.value;
                                setTextAnswers((prev) => {
                                  const next = [...prev];
                                  next[i] = val;
                                  return next;
                                });
                              }}
                              placeholder="Digite sua resposta..."
                              rows={3}
                              className="w-full bg-slate-50 dark:bg-[#1F1F23] border border-slate-200 dark:border-[#38383D] rounded-xl p-3 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2D5A46]/30 resize-none font-medium"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Bottom Control Bar / Rodapé Fixo */}
              <div className="px-5 sm:px-8 py-4 bg-white dark:bg-[#1F1F23] border-t border-[#E7E2D9] dark:border-[#2C2C30] shrink-0 flex items-center justify-between gap-4">
                {/* Indicadores de bolinhas das questões */}
                <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto max-w-sm py-1">
                  {result.questions.map((q, idx) => {
                    const isAns =
                      dontKnow[idx] ||
                      (q.type === 'assinalar' ? answers[idx] !== null : (textAnswers[idx] || '').trim().length > 0);
                    const isCurr = currentIndex === idx;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setCurrentIndex(idx);
                          setViewMode('step');
                        }}
                        className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center ${
                          isCurr
                            ? 'bg-[#2D5A46] text-white ring-2 ring-[#2D5A46]/40 scale-110'
                            : isAns
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                              : 'bg-slate-100 dark:bg-[#2C2C30] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                        title={`Ir para questão ${idx + 1}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Navegação Anterior / Próximo e Finalizar */}
                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
                  {viewMode === 'step' && (
                    <button
                      type="button"
                      onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                      disabled={currentIndex === 0}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#38383D] text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2C2C30] disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Anterior</span>
                    </button>
                  )}

                  {viewMode === 'step' && currentIndex < result.questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentIndex((i) => Math.min(result.questions.length - 1, i + 1))}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                    >
                      <span>Próxima</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={finishQuiz}
                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#2D5A46] via-[#21483A] to-[#0E1712] text-white text-xs font-bold hover:shadow-lg hover:shadow-[#2D5A46]/30 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Concluir Teste</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================= TELA DE RESULTADOS (MODERNA & CELEBRATÓRIA) ======================= */}
      <AnimatePresence>
        {stage === 'results' && result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[100] ${
              isFullscreen
                ? 'bg-[#FAF9F5] dark:bg-[#121214] p-0'
                : 'bg-slate-950/80 backdrop-blur-xl p-2 sm:p-6 flex items-center justify-center'
            } transition-all select-text`}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className={`w-full ${
                isFullscreen
                  ? 'h-full rounded-none border-none'
                  : 'max-w-4xl h-[92vh] max-h-[860px] rounded-[32px] border border-slate-200/80 dark:border-slate-800 shadow-2xl'
              } bg-[#FAF9F5] dark:bg-[#18181B] text-slate-900 dark:text-[#FAF9F5] flex flex-col overflow-hidden`}
            >
              {/* Header do Resultado */}
              <div className="px-6 py-4 bg-gradient-to-r from-[#2D5A46] via-[#1E3E30] to-[#0E1712] text-white shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-inner">
                    <Trophy className="w-5 h-5 text-amber-300 animate-bounce" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base font-display leading-tight">
                      Resultado do Desafio
                    </h3>
                    <p className="text-xs text-white/80 truncate max-w-[280px]">{doc.title}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                    title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={closeAll}
                    className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                    aria-label="Fechar resultado"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Conteúdo com Scroll */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
                {/* Hero Card do Desempenho */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-emerald-50/40 to-[#EBF3EF] dark:from-[#232326] dark:via-[#1B2921] dark:to-[#15221B] border border-[#CFE1D6] dark:border-[#22392D] p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                  <div className="flex flex-col md:flex-row items-center gap-5">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#2D5A46] to-[#52B788] text-white flex items-center justify-center shadow-xl shadow-[#2D5A46]/25 shrink-0">
                      {accuracyPercent >= 80 ? (
                        <Award className="w-10 h-10 text-amber-300" />
                      ) : accuracyPercent >= 50 ? (
                        <Zap className="w-10 h-10 text-emerald-100" />
                      ) : (
                        <Brain className="w-10 h-10 text-emerald-200" />
                      )}
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2D5A46]/10 dark:bg-[#52B788]/20 text-[#2D5A46] dark:text-[#52B788] text-xs font-bold mb-1.5">
                        <Flame className="w-3.5 h-3.5 text-amber-500" />
                        <span>
                          {accuracyPercent >= 90
                            ? 'Desempenho Excelente!'
                            : accuracyPercent >= 60
                              ? 'Muito Bom Aprendizado!'
                              : 'Boa Prática de Estudo!'}
                        </span>
                      </div>
                      <h2 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white">
                        {multipleChoiceTotal > 0
                          ? `${score} de ${multipleChoiceTotal} questões corretas`
                          : `${answeredCount} de ${result.questions.length} questões respondidas`}
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                        Tempo de resolução: <strong>{formatTimer(secondsElapsed)}</strong> • Dúvidas assinaladas: {dontKnow.filter(Boolean).length}
                      </p>
                    </div>
                  </div>

                  {/* Porcentagem Circular / Visual */}
                  <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/80 dark:bg-[#18181B]/80 border border-slate-200 dark:border-[#38383D] shadow-sm shrink-0 min-w-[120px]">
                    <span className="text-3xl font-black font-display text-[#2D5A46] dark:text-[#52B788]">
                      {accuracyPercent}%
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-0.5">
                      Aproveitamento
                    </span>
                  </div>
                </div>

                {/* Síntese e Explicação Geral da IA */}
                {result.summary && (
                  <div className="rounded-3xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/30 p-5 sm:p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                        <Brain className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                        Resumo de Aprendizagem & Pontos-Chave
                      </span>
                    </div>
                    <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-200 font-medium">
                      <LatexRenderer content={result.summary} />
                    </div>
                  </div>
                )}

                {/* Filtros da Revisão */}
                <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Revisão Questão a Questão
                  </h4>

                  <div className="flex items-center bg-slate-100 dark:bg-[#27272A] p-0.5 rounded-xl border border-slate-200 dark:border-[#38383D]">
                    <button
                      type="button"
                      onClick={() => setReviewFilter('all')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        reviewFilter === 'all'
                          ? 'bg-white dark:bg-[#18181B] text-[#2D5A46] dark:text-[#52B788] shadow-sm'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Todas ({result.questions.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewFilter('mistakes')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        reviewFilter === 'mistakes'
                          ? 'bg-white dark:bg-[#18181B] text-red-600 dark:text-red-400 shadow-sm'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Dúvidas & Erros
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewFilter('correct')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        reviewFilter === 'correct'
                          ? 'bg-white dark:bg-[#18181B] text-emerald-600 dark:text-emerald-400 shadow-sm'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Acertos
                    </button>
                  </div>
                </div>

                {/* Cards Detalhados de Revisão */}
                <div className="space-y-4">
                  {result.questions.map((q, i) => {
                    const typedAnswer = answers[i];
                    const textAnswer = textAnswers[i] || '';
                    const isCorrect = q.type === 'assinalar' && typedAnswer === q.correctIndex;
                    const isSkip = dontKnow[i];

                    const status = isSkip
                      ? 'skip'
                      : q.type === 'assinalar'
                        ? typedAnswer !== null
                          ? isCorrect
                            ? 'correct'
                            : 'wrong'
                          : 'empty'
                        : textAnswer.trim()
                          ? 'done'
                          : 'empty';

                    if (reviewFilter === 'mistakes' && (status === 'correct' || (status === 'done' && !isSkip))) {
                      return null;
                    }
                    if (reviewFilter === 'correct' && status !== 'correct') {
                      return null;
                    }

                    return (
                      <div
                        key={i}
                        className={`rounded-3xl border p-5 sm:p-6 bg-white dark:bg-[#232326] shadow-sm transition-all ${
                          status === 'correct'
                            ? 'border-emerald-300 dark:border-emerald-900/70'
                            : status === 'wrong'
                              ? 'border-red-300 dark:border-red-900/70'
                              : status === 'skip'
                                ? 'border-amber-300 dark:border-amber-800/60'
                                : 'border-slate-200 dark:border-[#38383D]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono font-black uppercase px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-[#2A2A2E] text-slate-600 dark:text-slate-300">
                              Q{i + 1}
                            </span>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                              {q.type === 'escrever' ? 'Dissertativa' : 'Múltipla Escolha'}
                            </span>

                            {status === 'correct' && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                                <Check className="w-3 h-3" /> Correta
                              </span>
                            )}
                            {status === 'wrong' && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-950/50 px-2.5 py-0.5 rounded-full border border-red-300 dark:border-red-800">
                                <AlertCircle className="w-3 h-3" /> Incorreta
                              </span>
                            )}
                            {status === 'skip' && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                                <HelpCircle className="w-3 h-3" /> Teve Dúvida
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-sm font-bold text-slate-900 dark:text-white leading-snug mb-3">
                          <LatexRenderer content={q.question} />
                        </div>

                        {q.type === 'assinalar' && q.options && (
                          <div className="space-y-2 mb-3">
                            {q.options.map((opt, oi) => {
                              const isRightOpt = oi === q.correctIndex;
                              const isUserOpt = oi === typedAnswer;

                              return (
                                <div
                                  key={oi}
                                  className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium ${
                                    isRightOpt
                                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-bold'
                                      : isUserOpt
                                        ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200'
                                        : 'bg-slate-50 dark:bg-[#1C1917] border-slate-200 dark:border-[#38383D] text-slate-600 dark:text-slate-400'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                    <span className="font-mono font-bold shrink-0">{String.fromCharCode(65 + oi)})</span>
                                    <div className="flex-1 min-w-0"><LatexRenderer content={opt} /></div>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    {isRightOpt && (
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white flex items-center gap-1">
                                        <Check className="w-3 h-3" /> Gabarito
                                      </span>
                                    )}
                                    {isUserOpt && !isRightOpt && (
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">
                                        Sua resposta
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {q.type === 'escrever' && (
                          <div className="space-y-2.5 mb-3 text-xs">
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1C1917] border border-slate-200 dark:border-[#38383D]">
                              <span className="font-bold text-slate-500 dark:text-slate-400 block mb-1">Sua resposta:</span>
                              <span className="text-slate-800 dark:text-slate-200 font-medium">
                                {textAnswer.trim() ? textAnswer : <em className="text-slate-400">Não respondida</em>}
                              </span>
                            </div>

                            {q.answer && (
                              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                                <span className="font-bold text-emerald-700 dark:text-emerald-300 block mb-1">Resposta Esperada / Gabarito:</span>
                                <div className="text-slate-800 dark:text-slate-200 font-medium">
                                  <LatexRenderer content={q.answer} />
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {q.explanation && (
                          <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 text-xs leading-relaxed text-slate-700 dark:text-slate-200">
                            <span className="font-bold text-amber-800 dark:text-amber-400 block mb-0.5">
                              💡 Explicação & Raciocínio:
                            </span>
                            <LatexRenderer content={q.explanation} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer de Ações do Resultado */}
              <div className="px-6 py-4 bg-white dark:bg-[#1F1F23] border-t border-[#E7E2D9] dark:border-[#2C2C30] shrink-0 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={cooldownLeft > 0}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#EBF3EF] dark:bg-[#15221B] text-[#2D5A46] dark:text-[#52B788] text-xs font-bold border border-[#CFE1D6] dark:border-[#22392D] hover:bg-[#DCEAE3] dark:hover:bg-[#1C2E24] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {cooldownLeft > 0 ? (
                    <>
                      <Timer className="w-4 h-4 animate-pulse" />
                      <span>Aguarde {cooldownLeft}s</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4" />
                      <span>Gerar Novo Desafio com IA</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={closeAll}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#2D5A46] via-[#21483A] to-[#0E1712] text-white text-xs font-bold hover:shadow-lg hover:shadow-[#2D5A46]/30 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Concluir e Fechar</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
