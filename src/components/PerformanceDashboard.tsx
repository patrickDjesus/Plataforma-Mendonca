import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileUp,
  Target,
  CheckCircle2,
  XCircle,
  BookOpen,
  Lightbulb,
  TrendingUp,
  Download,
  Sparkles,
  AlertTriangle,
  BarChart3,
  RotateCcw
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { PerformanceAnalytics, ScreenId } from '../types/design';
import { parseImportedAnswers, ImportedAnswer } from '../utils/performanceImport';

interface PerformanceDashboardProps {
  analytics: PerformanceAnalytics;
  onStartFocusedPractice: (subject: string, topic?: string) => void;
  onNavigate: (screen: ScreenId) => void;
  onResetAnalytics: () => void;
  onImportAnalytics: (records: ImportedAnswer[]) => Promise<boolean>;
}

interface ContentStat {
  subject: string;
  topic: string;
  answered: number;
  correct: number;
  wrong: number;
  errorRate: number;
}

const EXAMPLE_JSON = `[
  { "disciplina": "Matemática", "conteudo": "Funções", "acertou": false },
  { "disciplina": "Matemática", "conteudo": "Funções", "acertou": true },
  { "disciplina": "Física", "conteudo": "Eletrodinâmica", "acertou": false },
  { "disciplina": "Química", "conteudo": "Estequiometria", "acertou": true }
]`;

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  analytics,
  onStartFocusedPractice,
  onNavigate: _onNavigate,
  onResetAnalytics,
  onImportAnalytics
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'wrong' | 'correct'>('wrong');
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [importing, setImporting] = useState(false);

  // Métricas Globais
  const totalAnswered = analytics.totalAnswered;
  const totalCorrect = analytics.totalCorrect;
  const totalWrong = analytics.totalWrong;
  const accuracyPercentage = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  // Agregação de conteúdos (disciplina + tópico) por desempenho
  const contentStats = useMemo<ContentStat[]>(() => {
    const map: Record<string, ContentStat> = {};
    Object.entries(analytics.subjectStats || {}).forEach(([subject, sub]) => {
      const subStats = (sub || {}) as { topics?: Record<string, { answered: number; correct: number; wrong: number }> };
      Object.entries(subStats.topics || {}).forEach(([topic, t]) => {
        const key = `${subject}::${topic}`;
        map[key] = {
          subject,
          topic,
          answered: t.answered,
          correct: t.correct,
          wrong: t.wrong,
          errorRate: t.answered > 0 ? t.wrong / t.answered : 0
        };
      });
    });
    return Object.values(map);
  }, [analytics.subjectStats]);

  // Conteúdos que preciso melhorar (maior taxa de erro)
  const toImprove = useMemo<ContentStat[]>(() => {
    return contentStats
      .filter((c) => c.wrong > 0)
      .sort((a, b) => b.errorRate - a.errorRate || b.wrong - a.wrong)
      .slice(0, 8);
  }, [contentStats]);

  // Ranking de acertos
  const rightContents = useMemo<ContentStat[]>(() => {
    return contentStats
      .filter((c) => c.correct > 0)
      .sort((a, b) => b.correct - a.correct)
      .slice(0, 10);
  }, [contentStats]);

  // Ranking de erros
  const wrongContents = useMemo<ContentStat[]>(() => {
    return contentStats
      .filter((c) => c.wrong > 0)
      .sort((a, b) => b.wrong - a.wrong)
      .slice(0, 10);
  }, [contentStats]);

  // Curva de acerto (acurácia acumulada ao longo das questões respondidas)
  const curveData = useMemo<{ label: string; accuracy: number }[]>(() => {
    const log = analytics.recentQuestionsLog || [];
    if (log.length === 0) return [];
    let correctCount = 0;
    return log
      .slice()
      .reverse()
      .map((entry, idx) => {
        if (entry.isCorrect) correctCount += 1;
        const answered = idx + 1;
        return {
          label: `Q${answered}`,
          accuracy: Math.round((correctCount / answered) * 100)
        };
      });
  }, [analytics.recentQuestionsLog]);

  // Lista de questões por filtro
  const filteredQuestions = useMemo(() => {
    const log = analytics.recentQuestionsLog || [];
    if (activeFilter === 'all') return log;
    return log.filter((item) => (activeFilter === 'correct' ? item.isCorrect : !item.isCorrect));
  }, [analytics.recentQuestionsLog, activeFilter]);

  // Preview do JSON colado
  const parsedPreview = useMemo(() => parseImportedAnswers(importText), [importText]);

  const handleImport = async () => {
    setImporting(true);
    try {
      if (parsedPreview.records.length === 0) return;
      await onImportAnalytics(parsedPreview.records);
      setImportText('');
      setShowImport(false);
    } finally {
      setImporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* ============================ HEADER + IMPORT ============================ */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 border border-slate-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-slate-200 text-xs font-bold border border-white/10">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Dashboard de Acerto & Conteúdo</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-display">Seu desempenho em questões</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Acompanhe sua taxa de acerto e descubra exatamente quais conteúdos você precisa revisar.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowImport(!showImport)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <FileUp className="w-4 h-4" />
            {showImport ? 'Fechar Importação' : 'Importar JSON de Questões'}
          </button>
        </div>

        {/* Painel de Importação */}
        <AnimatePresence>
          {showImport && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="relative z-10 mt-6 rounded-2xl bg-black/25 border border-white/10 p-4 sm:p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <Sparkles className="w-4 h-4 text-emerald-300" />
                    Importar questões respondidas fora do app
                  </div>
                  <button
                    type="button"
                    onClick={() => setImportText(EXAMPLE_JSON)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-emerald-200 border border-white/10 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Inserir exemplo
                  </button>
                </div>

                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  rows={7}
                  spellCheck={false}
                  placeholder={'Cole aqui o JSON das questões, ex:\n[\n  { "disciplina": "Matemática", "conteudo": "Funções", "acertou": false }\n]'}
                  className="w-full p-3 rounded-xl bg-white/95 text-slate-900 text-xs font-mono border border-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-y"
                />

                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Formato de cada item: <code className="text-emerald-300">{"disciplina"}</code>,{' '}
                  <code className="text-emerald-300">{"conteudo"}</code> e{' '}
                  <code className="text-emerald-300">{"acertou"}</code> (true/false). Apenas esses 3 dados são
                  necessários — não precisa colar o enunciado.
                </p>

                {parsedPreview.errors.length > 0 && (
                  <div className="rounded-xl bg-rose-500/20 border border-rose-400/40 p-3 text-xs text-rose-100 space-y-1">
                    {parsedPreview.errors.slice(0, 5).map((err, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{err}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs font-bold text-slate-200">
                    {parsedPreview.records.length > 0
                      ? `${parsedPreview.records.length} questão(ões) válida(s) pronta(s) para importar`
                      : 'Nenhuma questão válida detectada ainda'}
                  </span>
                  <button
                    type="button"
                    disabled={parsedPreview.records.length === 0 || importing}
                    onClick={handleImport}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                  >
                    <FileUp className="w-4 h-4" />
                    {importing ? 'Importando…' : `Importar ${parsedPreview.records.length || ''} questões`}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ============================ KPI CARDS ============================ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 p-4 sm:p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
            <Target className="w-3.5 h-3.5" />
            Questões Respondidas
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
            {totalAnswered}
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 p-4 sm:p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
            <TrendingUp className="w-3.5 h-3.5" />
            Taxa de Acerto
          </div>
          <div className={`mt-2 text-2xl sm:text-3xl font-extrabold font-display ${
            accuracyPercentage >= 70 ? 'text-emerald-500' : accuracyPercentage >= 50 ? 'text-amber-500' : 'text-rose-500'
          }`}>
            {accuracyPercentage}%
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 p-4 sm:p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Acertos
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-display">
            {totalCorrect}
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 p-4 sm:p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
            <XCircle className="w-3.5 h-3.5" />
            Erros
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400 font-display">
            {totalWrong}
          </div>
        </div>
      </div>

      {/* ============================ CURVA DE ACERTO ============================ */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white font-display">Curva de acerto</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Evolução da sua taxa de acerto ao longo das questões.</p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
            Acurácia: {accuracyPercentage}%
          </span>
        </div>

        {curveData.length > 1 ? (
          <div className="h-52 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={curveData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,120,140,0.15)" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  unit="%"
                />
                <Tooltip
                  contentStyle={{
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: 12,
                    fontSize: 12
                  }}
                  labelStyle={{ color: '#cbd5e1' }}
                  formatter={(value: number) => [`${value}%`, 'Acerto']}
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-14 text-center text-xs text-slate-400 dark:text-slate-500">
            Responda ou importe questões para ver sua curva de acerto aparecer aqui.
          </div>
        )}
      </div>

      {/* ============================ O QUE PRECISO MELHORAR ============================ */}
      <div className="rounded-3xl bg-gradient-to-r from-rose-950/30 via-slate-900 to-rose-950/30 dark:from-rose-950/40 dark:via-slate-900 dark:to-rose-950/40 border border-rose-500/20 p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-extrabold text-white font-display">O que preciso melhorar</h3>
        </div>

        {toImprove.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-300">
            Nenhum conteúdo com erros registrado ainda. Continue praticando!
          </div>
        ) : (
          <div className="space-y-2">
            {toImprove.map((c, idx) => (
              <div
                key={`${c.subject}::${c.topic}`}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400 font-mono shrink-0">{idx + 1}.</span>
                    <span className="font-bold text-white truncate">{c.topic}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-300 truncate">{c.subject}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-300">
                    <span className="text-rose-400 font-bold">{c.wrong} erro(s)</span>
                    <span>/</span>
                    <span className="text-emerald-400">{c.correct} acerto(s)</span>
                    <span>• {Math.round(c.errorRate * 100)}% de erro</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onStartFocusedPractice(c.subject, c.topic)}
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Treinar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============================ CONTEÚDOS QUE ERRO / ACERTO ============================ */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white font-display">Conteúdos por desempenho</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Ranking dos conteúdos que você mais erra e mais acerta.</p>
          </div>

          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
            {([
              ['wrong', 'Que erro'],
              ['correct', 'Que acerto'],
              ['all', 'Todas as questões']
            ] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveFilter(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === key
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Listas de conteúdo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-900/50 p-4">
            <div className="flex items-center gap-2 mb-3 text-xs font-extrabold text-rose-700 dark:text-rose-300">
              <XCircle className="w-4 h-4" />
              Conteúdos que erro
            </div>
            {wrongContents.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">Nenhum erro registrado ainda. 🎉</div>
            ) : (
              <div className="space-y-2">
                {wrongContents.map((c) => (
                  <div key={`${c.subject}::${c.topic}`} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/70 dark:bg-slate-900/50">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{c.topic}</div>
                      <div className="text-[10px] text-slate-500 truncate">{c.subject}</div>
                    </div>
                    <span className="shrink-0 text-[11px] font-black text-rose-500">{c.wrong} erros</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/50 p-4">
            <div className="flex items-center gap-2 mb-3 text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4" />
              Conteúdos que acerto
            </div>
            {rightContents.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">Nenhum acerto registrado ainda.</div>
            ) : (
              <div className="space-y-2">
                {rightContents.map((c) => (
                  <div key={`${c.subject}::${c.topic}`} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/70 dark:bg-slate-900/50">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{c.topic}</div>
                      <div className="text-[10px] text-slate-500 truncate">{c.subject}</div>
                    </div>
                    <span className="shrink-0 text-[11px] font-black text-emerald-500">{c.correct} acertos</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================ HISTÓRICO DE QUESTÕES ============================ */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white font-display">Últimas questões</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {activeFilter === 'wrong' ? 'Mostrando apenas os erros' : activeFilter === 'correct' ? 'Mostrando apenas os acertos' : 'Mostrando todas as questões'}
            </p>
          </div>
          <BookOpen className="w-5 h-5 text-slate-400" />
        </div>

        {filteredQuestions.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            {activeFilter === 'wrong' ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            ) : (
              <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {activeFilter === 'wrong'
                ? 'Nenhum erro encontrado. Excelente!'
                : activeFilter === 'correct'
                ? 'Nenhum acerto encontrado com o filtro selecionado.'
                : 'Nenhuma questão registrada ainda.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredQuestions.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${
                  item.isCorrect
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/50'
                    : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200/60 dark:border-rose-900/50'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${
                      item.isCorrect
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                    }`}>
                      {item.isCorrect ? '✓ Acerto' : '✗ Erro'}
                    </span>
                    <span className="font-bold text-slate-700 dark:text-slate-300 truncate">{item.question?.topic || 'Conceitos Gerais'}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500 truncate">{item.question?.subject || 'Geral'}</span>
                    <span className="text-[10px] text-slate-400 font-mono ml-auto shrink-0">{item.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============================ RODAPÉ / RESET ============================ */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 px-1">
        <span>Dados sincronizados por usuário (Supabase) com backup local.</span>
        <button
          type="button"
          onClick={() => {
            if (confirm('Deseja realmente redefinir todas as estatísticas de desempenho e conteúdos importados?')) {
              onResetAnalytics();
            }
          }}
          className="flex items-center gap-1.5 text-slate-400 hover:text-rose-500 font-bold transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Redefinir Estatísticas
        </button>
      </div>
    </motion.div>
  );
};
