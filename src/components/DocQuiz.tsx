import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
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
} from 'lucide-react';
import { NotebookDoc, Discipline } from '../data/disciplinesData';
import {
  DocQuizQuestion,
  DocQuizResult,
  generateDocQuiz,
  QuizGenerationStatus,
} from '../services/ai';
import { sectionsToText } from '../utils/docConverter';

interface DocQuizProps {
  doc: NotebookDoc;
  discipline: Discipline;
}

type Stage = 'closed' | 'config' | 'loading' | 'quiz' | 'results';

// Mensagem amigável de acordo com o tipo de falha retornado pelo serviço.
const errorMessageForStatus = (status: QuizGenerationStatus): string => {
  switch (status) {
    case 'rate_limit':
      return 'A IA atingiu o limite de tokens por minuto (Groq). Aguarde alguns segundos e tente novamente.';
    case 'too_large':
      return 'O documento é muito grande e estourou o limite de contexto/tokens da IA. Tente gerar menos questões ou resumir/editar o documento.';
    case 'timeout':
      return 'O documento é muito grande e a IA demorou demais para responder. Tente gerar menos questões ou reduzir o tamanho do documento.';
    case 'no_key':
      return 'A chave da API do Groq não está configurada (VITE_GROQ_API_KEY).';
    case 'network':
      return 'Não foi possível conectar com a IA (Groq). Verifique sua internet e tente novamente.';
    default:
      return 'A IA não conseguiu montar as questões agora. Tente novamente em alguns instantes.';
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
    <div className="relative h-7 select-none">
      {/* Trilho com preenchimento */}
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-2.5 rounded-full bg-[#E7E2D9] dark:bg-[#3B3B40] overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#2D5A46] to-[#52B788]"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Input transparente que captura o arrastar */}
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-grab active:cursor-grabbing"
        aria-label="Ajustar valor do controle deslizante"
      />

      {/* Bolinha que acompanha o valor */}
      <div
        className="pointer-events-none absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white dark:bg-[#232326] border-4 border-[#2D5A46] dark:border-[#52B788] shadow-[0_2px_8px_rgba(45,90,70,0.45)]"
        style={{ left: `calc(${pct}% - 12px)` }}
      />
    </div>
  );
};

const TypeBadge: React.FC<{ type: DocQuizQuestion['type'] }> = ({ type }) =>
  type === 'escrever' ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/70 dark:border-sky-900/60">
      <Pencil className="w-2.5 h-2.5" /> Escrever
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-900/60">
      <ListChecks className="w-2.5 h-2.5" /> Assinalar
    </span>
  );

export const DocQuiz: React.FC<DocQuizProps> = ({ doc, discipline }) => {
  const [stage, setStage] = useState<Stage>('closed');
  const [total, setTotal] = useState(5);
  const [writeCount, setWriteCount] = useState(2);
  const [result, setResult] = useState<DocQuizResult | null>(null);
  const [error, setError] = useState('');

  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [textAnswers, setTextAnswers] = useState<string[]>([]);
  const [dontKnow, setDontKnow] = useState<boolean[]>([]);

  // Semáforo: após uma geração, bloqueia o botão por alguns segundos para não
  // estourar o limite de tokens por minuto do Groq (~60s para 10 questões).
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
  }, []);

  const startCooldown = (totalQuestions: number) => {
    const seconds = Math.max(20, Math.round(totalQuestions * 6));
    setCooldownLeft(seconds);
    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    cooldownTimerRef.current = setInterval(() => {
      setCooldownLeft(prev => {
        if (prev <= 1) {
          if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const docsText = useMemo(
    () => `Título: ${doc.title}\n\nResumo: ${doc.summary || '—'}\n\n${sectionsToText(doc.sections || [])}`,
    [doc],
  );

  const chooseCount = Math.max(0, total - writeCount);

  const resetQuiz = () => {
    setAnswers([]);
    setTextAnswers([]);
    setDontKnow([]);
    setError('');
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
      docTitle: doc.title,
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

  const score = useMemo(() => {
    if (!result) return 0;
    return result.questions.reduce((acc, q, i) => {
      if (q.type !== 'assinalar') return acc;
      if (dontKnow[i]) return acc;
      return acc + (answers[i] === q.correctIndex ? 1 : 0);
    }, 0);
  }, [result, answers, dontKnow]);

  const finishQuiz = () => setStage('results');

  const closeAll = () => {
    setStage('closed');
    setResult(null);
    resetQuiz();
  };

  return (
    <>
      {/* Botão flutuante "Teste" (canto inferior direito) */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        onClick={openConfig}
        className="fixed bottom-6 right-6 z-[90] flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-br from-[#2D5A46] via-[#21483A] to-[#0E1712] text-white shadow-2xl shadow-[#2D5A46]/30 hover:shadow-[#2D5A46]/50 border border-white/10 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
        title="Criar um teste sobre o conteúdo deste documento"
      >
        <span className="relative flex items-center justify-center">
          <GraduationCap className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 group-hover:animate-pulse" />
        </span>
        <span className="font-display font-bold text-sm tracking-wide">Teste</span>
      </motion.button>

      {/* Backdrop transparente para fechar o menuzinho */}
      <AnimatePresence>
        {stage === 'config' && (
          <div className="fixed inset-0 z-[91]" onClick={() => setStage('closed')} />
        )}
      </AnimatePresence>

      {/* ======================= MENU DE CONFIGURAÇÃO ======================= */}
      <AnimatePresence>
        {stage === 'config' && (
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.94 }}
            transition={{ type: 'spring', damping: 24, stiffness: 340 }}
            className="fixed bottom-24 right-6 z-[92] w-[340px] max-w-[calc(100vw-3rem)] bg-white dark:bg-[#18181B] rounded-3xl border border-[#CFE1D6] dark:border-[#22392D]/60 shadow-2xl overflow-hidden"
          >
            {/* Header do menuzinho */}
            <div className="px-5 py-4 bg-gradient-to-r from-[#2D5A46] via-[#1E3E30] to-[#0E1712] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm font-display leading-tight">Criar Teste</h3>
                  <p className="text-[10px] text-white/80 truncate max-w-[200px]">{doc.title}</p>
                </div>
              </div>
              <button
                onClick={() => setStage('closed')}
                className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Fechar menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Total de questões */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Quantas questões?
                  </span>
                  <span className="text-sm font-black font-mono text-[#2D5A46] dark:text-emerald-400 bg-[#EBF3EF] dark:bg-[#15221B] px-2.5 py-0.5 rounded-full border border-[#CFE1D6] dark:border-[#22392D]/60">
                    {total}
                  </span>
                </div>
                <BallSlider min={1} max={10} value={total} onChange={(v) => {
                  setTotal(v);
                  setWriteCount((w) => (w > v ? v : w));
                }} />
                <div className="flex justify-between mt-1 text-[10px] text-slate-400 font-medium">
                  <span>1 questão</span>
                  <span>máx. 10</span>
                </div>
              </div>

              {/* Divisão escrever / assinalar */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Escrever ou assinalar?
                  </span>
                  <span className="text-sm font-black font-mono text-[#2D5A46] dark:text-emerald-400 bg-[#EBF3EF] dark:bg-[#15221B] px-2.5 py-0.5 rounded-full border border-[#CFE1D6] dark:border-[#22392D]/60">
                    {writeCount} / {chooseCount}
                  </span>
                </div>
                <BallSlider min={0} max={total} value={writeCount} onChange={setWriteCount} />
                <div className="flex justify-between mt-1 text-[10px] font-semibold">
                  <span className="text-sky-600 dark:text-sky-400">✍️ Escrever</span>
                  <span className="text-emerald-600 dark:text-emerald-400">✅ Assinalar</span>
                </div>
              </div>

              {/* Chips resumo */}
              <div className="flex items-stretch gap-2">
                <div className="flex-1 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/70 dark:border-sky-900/60 px-3 py-2 text-center">
                  <div className="text-xl font-black text-sky-600 dark:text-sky-300">{writeCount}</div>
                  <div className="text-[9px] uppercase tracking-wider text-sky-500 font-bold">Escrever</div>
                </div>
                <div className="flex-1 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-900/60 px-3 py-2 text-center">
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-300">{chooseCount}</div>
                  <div className="text-[9px] uppercase tracking-wider text-emerald-500 font-bold">Assinalar</div>
                </div>
                <div className="flex-1 rounded-2xl bg-[#EBF3EF] dark:bg-[#15221B] border border-[#CFE1D6] dark:border-[#22392D]/60 px-3 py-2 text-center">
                  <div className="text-xl font-black text-[#2D5A46] dark:text-emerald-400">{total}</div>
                  <div className="text-[9px] uppercase tracking-wider text-[#2D5A46]/70 dark:text-emerald-400/70 font-bold">Total</div>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-900/60 rounded-xl px-3 py-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={cooldownLeft > 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-[#2D5A46] via-[#21483A] to-[#0E1712] text-white text-sm font-bold hover:shadow-lg hover:shadow-[#2D5A46]/25 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 disabled:hover:shadow-none"
              >
                {cooldownLeft > 0 ? (
                  <>
                    <Timer className="w-4 h-4 animate-pulse" />
                    Aguarde {cooldownLeft}s (limite do Groq)
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Gerar Teste
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================= CARREGANDO ======================= */}
      <AnimatePresence>
        {stage === 'loading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-md flex items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white dark:bg-[#18181B] rounded-3xl border border-[#CFE1D6] dark:border-[#22392D]/60 shadow-2xl p-8 flex flex-col items-center max-w-xs text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#EBF3EF] dark:bg-[#15221B] text-[#2D5A46] dark:text-emerald-400 flex items-center justify-center mb-4">
                <Brain className="w-7 h-7 animate-pulse" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white font-display mb-1">
                Criando seu teste...
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Analisando o conteúdo de "{doc.title}" para gerar {total} questões, sendo {writeCount} de escrever e {chooseCount} de assinalar.
              </p>
              <Loader2 className="w-5 h-5 text-[#2D5A46] dark:text-emerald-400 animate-spin mt-4" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================= FORMULÁRIO DO TESTE ======================= */}
      <AnimatePresence>
        {stage === 'quiz' && result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
            onClick={closeAll}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl bg-white dark:bg-[#18181B] rounded-[28px] border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="px-5 py-4 bg-gradient-to-r from-[#2D5A46] via-[#1E3E30] to-[#0E1712] text-white shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm font-display leading-tight">Mini-Teste • {discipline.name}</h3>
                    <p className="text-[10px] text-white/80 truncate max-w-[240px]">{doc.title}</p>
                  </div>
                </div>
                <button
                  onClick={closeAll}
                  className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Fechar teste"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Barra de progresso */}
              <div className="px-5 pt-3 shrink-0">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  <span>
                    Respondidas: {answeredCount} / {result.questions.length}
                  </span>
                  <span>
                    Faltam: {result.questions.length - answeredCount}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(answeredCount / result.questions.length) * 100}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-[#2D5A46] to-[#52B788]"
                  />
                </div>
              </div>

              {/* Questões */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                {result.questions.map((q, i) => (
                  <div
                    key={i}
                    className={`rounded-2xl border p-4 transition-colors ${
                      dontKnow[i]
                        ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300/80 dark:border-amber-800/60'
                        : 'bg-slate-50/80 dark:bg-[#232326] border-slate-200/80 dark:border-[#3B3B40]/80'
                    }`}
                  >
                    {/* Enunciado */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h4 className="font-bold text-[13px] text-slate-900 dark:text-white leading-snug flex items-start gap-2">
                        <span className="text-slate-400 dark:text-slate-500 font-mono text-[11px] mt-0.5 shrink-0">Q{i + 1}.</span>
                        <span>{q.question}</span>
                      </h4>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <TypeBadge type={q.type} />
                        {/* Botão "Não sei" ao lado da questão */}
                        <button
                          onClick={() => setDontKnow(prev => {
                            const next = [...prev];
                            next[i] = !next[i];
                            return next;
                          })}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                            dontKnow[i]
                              ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                              : 'bg-white dark:bg-[#2C2C30] text-slate-500 dark:text-slate-300 border-slate-200 dark:border-[#3B3B40] hover:bg-amber-50 dark:hover:bg-amber-950/50 hover:text-amber-600 dark:hover:text-amber-400'
                          }`}
                          title="Não sei responder — ganhe uma explicação no final"
                        >
                          <HelpCircle className="w-3 h-3" />
                          Não sei
                        </button>
                      </div>
                    </div>

                    {/* Alternativas */}
                    {q.type === 'assinalar' && q.options?.length ? (
                      <div className="space-y-2">
                        {q.options.map((opt, oi) => {
                          const isSel = answers[i] === oi;
                          return (
                            <button
                              key={oi}
                              onClick={() =>
                                setAnswers(prev => {
                                  const next = [...prev];
                                  next[i] = oi;
                                  return next;
                                })
                              }
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                                isSel
                                  ? 'bg-[#2D5A46]/10 dark:bg-emerald-950/50 border-[#2D5A46]/50 dark:border-emerald-700/70 text-slate-900 dark:text-white font-semibold shadow-sm'
                                  : 'bg-white dark:bg-[#232326] border-slate-200 dark:border-[#3B3B40] text-slate-600 dark:text-slate-300 hover:border-[#2D5A46]/40 dark:hover:border-emerald-700/50 hover:bg-[#EBF3EF] dark:hover:bg-[#15221B]'
                              }`}
                            >
                              <span
                                className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center text-[8px] font-black ${
                                  isSel ? 'border-[#2D5A46] dark:border-emerald-400 bg-[#2D5A46] dark:bg-emerald-400 text-white' : 'border-slate-300 dark:border-slate-600'
                                }`}
                              >
                                {isSel ? <Check className="w-2.5 h-2.5" /> : null}
                              </span>
                              <span>{String.fromCharCode(65 + oi)}) {opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <textarea
                        value={textAnswers[i] || ''}
                        onChange={(e) =>
                          setTextAnswers(prev => {
                            const next = [...prev];
                            next[i] = e.target.value;
                            return next;
                          })
                        }
                        placeholder="Escreva sua resposta aqui..."
                        rows={4}
                        className="w-full bg-white dark:bg-[#232326] border border-slate-200 dark:border-[#3B3B40] rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2D5A46]/30 resize-y font-medium"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Rodapé com botão de finalizar (permite finalizar antes de responder tudo) */}
              <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-[#121214]/40 shrink-0 flex items-center justify-between gap-3">
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium hidden sm:block">
                  Você pode finalizar antes de responder tudo.
                </div>
                <button
                  onClick={finishQuiz}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#2D5A46] via-[#21483A] to-[#0E1712] text-white text-sm font-bold hover:shadow-lg hover:shadow-[#2D5A46]/25 active:scale-[0.99] transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Finalizar Teste
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================= RESULTADOS ======================= */}
      <AnimatePresence>
        {stage === 'results' && result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
            onClick={closeAll}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl bg-white dark:bg-[#18181B] rounded-[28px] border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="px-5 py-4 bg-gradient-to-r from-[#2D5A46] via-[#1E3E30] to-[#0E1712] text-white shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm font-display leading-tight">Resultado do Teste</h3>
                    <p className="text-[10px] text-white/80 truncate max-w-[240px]">{doc.title}</p>
                  </div>
                </div>
                <button
                  onClick={closeAll}
                  className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Fechar resultado"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {/* Resumo de desempenho */}
                <div className="flex items-center gap-4 rounded-2xl bg-[#EBF3EF] dark:bg-[#15221B] border border-[#CFE1D6] dark:border-[#22392D]/60 p-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2D5A46] to-[#52B788] text-white flex items-center justify-center shrink-0">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-black text-[#2D5A46] dark:text-emerald-400 font-display">
                      {score} de {result.questions.filter(q => q.type === 'assinalar').length} corretas
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      {answeredCount} de {result.questions.length} respondidas • {dontKnow.filter(Boolean).length} marcadas como "não sei"
                    </p>
                  </div>
                  <div className="text-2xl font-black font-display text-slate-200 dark:text-slate-600">
                    {result.questions.length > 0 ? Math.round(((answeredCount > 0 ? score : answeredCount) * 100) / result.questions.length) : 0}%
                  </div>
                </div>

                {/* Explicação resumida do assunto */}
                {result.summary && (
                  <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-900/70 bg-emerald-50/70 dark:bg-emerald-950/30 p-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                        <Brain className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                        Explicação resumida do assunto
                      </span>
                    </div>
                    <p className="text-[13px] leading-relaxed text-slate-700 dark:text-slate-200 font-medium">
                      {result.summary}
                    </p>
                  </div>
                )}

                {/* Revisão questão a questão */}
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Revisão das questões
                  </h4>
                  {result.questions.map((q, i) => {
                    const typedAnswer = answers[i];
                    const textAnswer = textAnswers[i] || '';
                    const isCorrect = q.type === 'assinalar' && typedAnswer === q.correctIndex;
                    const answered = dontKnow[i]
                      ? 'skip'
                      : q.type === 'assinalar'
                        ? typedAnswer !== null
                          ? isCorrect ? 'correct' : 'wrong'
                          : 'empty'
                        : textAnswer.trim()
                          ? 'done'
                          : 'empty';

                    const statusColor =
                      answered === 'correct' ? 'border-emerald-300/80 dark:border-emerald-900/70' :
                      answered === 'wrong' ? 'border-red-300/80 dark:border-red-900/70' :
                      answered === 'skip' ? 'border-amber-300/80 dark:border-amber-800/60' :
                      'border-slate-200 dark:border-[#3B3B40]';

                    return (
                      <div key={i} className={`rounded-2xl border ${statusColor} bg-white dark:bg-[#232326] p-4`}>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-mono font-bold text-slate-400">Q{i + 1}</span>
                            <TypeBadge type={q.type} />
                            {answered === 'correct' && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                                <Check className="w-2.5 h-2.5" /> Correta
                              </span>
                            )}
                            {answered === 'wrong' && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-950/50 px-2 py-0.5 rounded-full">
                                <AlertCircle className="w-2.5 h-2.5" /> Errou
                              </span>
                            )}
                            {answered === 'skip' && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/50 px-2 py-0.5 rounded-full">
                                <HelpCircle className="w-2.5 h-2.5" /> Não sabia
                              </span>
                            )}
                            {answered === 'empty' && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                Sem resposta
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-[13px] font-bold text-slate-900 dark:text-white leading-snug mb-2">{q.question}</p>

                        {q.type === 'assinalar' && (
                          <div className="text-[11px] space-y-1 mb-2">
                            {q.options?.map((opt, oi) => (
                              <div
                                key={oi}
                                className={`flex items-center gap-2 ${
                                  oi === q.correctIndex
                                    ? 'text-emerald-700 dark:text-emerald-300 font-semibold'
                                    : oi === typedAnswer
                                      ? 'text-red-600 dark:text-red-400 font-semibold'
                                      : 'text-slate-500 dark:text-slate-400'
                                }`}
                              >
                                <span className="font-mono font-bold">{String.fromCharCode(65 + oi)})</span>
                                <span>{opt}</span>
                                {oi === q.correctIndex && <Check className="w-3 h-3 text-emerald-500" />}
                                {oi === typedAnswer && oi !== q.correctIndex && (
                                  <span className="text-red-400 text-[9px] font-bold">(sua resposta)</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {q.type === 'escrever' && (
                          <div className="text-[11px] space-y-1.5 mb-2">
                            <div>
                              <span className="font-bold text-slate-500 dark:text-slate-400">Sua resposta: </span>
                              <span className="text-slate-700 dark:text-slate-200">
                                {textAnswer.trim() ? textAnswer : <em className="text-slate-400">não respondida</em>}
                              </span>
                            </div>
                            {q.answer && (
                              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/60 px-3 py-2">
                                <span className="font-bold text-emerald-700 dark:text-emerald-300">Gabarito: </span>
                                <span className="text-slate-700 dark:text-slate-200">{q.answer}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {q.explanation && (
                          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                            <span className="font-bold text-[#2D5A46] dark:text-emerald-400">💡 Explicação: </span>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer do resultado */}
              <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-[#121214]/40 shrink-0 flex items-center gap-2">
                <button
                  onClick={handleGenerate}
                  disabled={cooldownLeft > 0}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#EBF3EF] dark:bg-[#15221B] text-[#2D5A46] dark:text-emerald-400 text-sm font-bold border border-[#CFE1D6] dark:border-[#22392D]/60 hover:bg-[#DFEBE3] dark:hover:bg-[#1B2A20] transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[#EBF3EF] dark:disabled:hover:bg-[#15221B]"
                >
                  {cooldownLeft > 0 ? (
                    <>
                      <Timer className="w-4 h-4 animate-pulse" />
                      Aguarde {cooldownLeft}s
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4" />
                      Refazer com novas questões
                    </>
                  )}
                </button>
                <button
                  onClick={closeAll}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#2D5A46] via-[#21483A] to-[#0E1712] text-white text-sm font-bold hover:shadow-lg active:scale-[0.99] transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};