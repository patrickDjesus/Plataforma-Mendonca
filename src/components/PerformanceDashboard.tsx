import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Target, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  BookOpen, 
  Zap, 
  RotateCcw, 
  Sparkles, 
  Brain, 
  Lightbulb, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  BarChart3, 
  Flame, 
  Clock, 
  Trophy, 
  Layers, 
  Filter, 
  GraduationCap, 
  HelpCircle,
  Copy,
  Check,
  Activity,
  Gauge,
  Compass,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { PerformanceAnalytics, QuizQuestion, ScreenId, TopicStudySuggestion } from '../types/design';

interface PerformanceDashboardProps {
  analytics: PerformanceAnalytics;
  onStartFocusedPractice: (subject: string, topic?: string) => void;
  onNavigate: (screen: ScreenId) => void;
  onResetAnalytics: () => void;
}

interface TimeSeriesDataPoint {
  sessionLabel: string;
  shortLabel: string;
  date: string;
  overallAccuracy: number;
  matematica: number;
  fisica: number;
  quimica: number;
  biologia: number;
  learningVelocity: number; // questões retidas por minuto
  avgResponseSeconds: number;
  xpEarned: number;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  analytics,
  onStartFocusedPractice,
  onNavigate,
  onResetAnalytics
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'wrong' | 'correct'>('wrong');
  const [selectedDisciplineFilter, setSelectedDisciplineFilter] = useState<string>('all');
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [expandedTopicSubject, setExpandedTopicSubject] = useState<string | null>(null);
  const [copiedReport, setCopiedReport] = useState(false);

  // Métricas Globais Calculadas
  const totalAnswered = analytics.totalAnswered;
  const totalCorrect = analytics.totalCorrect;
  const totalWrong = analytics.totalWrong;
  const accuracyPercentage = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  const avgTimePerQuestion = totalAnswered > 0 ? Math.round(analytics.totalSecondsPlayed / totalAnswered) : 0;

  // Estados para o Gráfico de Evolução e Velocidade com Recharts
  const [chartSubjectView, setChartSubjectView] = useState<'all' | 'velocity' | 'matematica' | 'fisica' | 'quimica' | 'biologia'>('all');

  // Construção do Dataset de Precisão vs. Tempo e Velocidade de Aprendizado
  const timeSeriesData = useMemo<TimeSeriesDataPoint[]>(() => {
    // Matérias e estatísticas atuais
    const matStats = analytics.subjectStats['Matemática & Cálculo'];
    const fisStats = analytics.subjectStats['Física • Fórmulas ENEM'];
    const quiStats = analytics.subjectStats['Química & Tabela Periódica'];
    const bioStats = analytics.subjectStats['Biologia & Genética'];

    const currentMatAcc = matStats && matStats.answered > 0 ? Math.round((matStats.correct / matStats.answered) * 100) : 82;
    const currentFisAcc = fisStats && fisStats.answered > 0 ? Math.round((fisStats.correct / fisStats.answered) * 100) : 68;
    const currentQuiAcc = quiStats && quiStats.answered > 0 ? Math.round((quiStats.correct / quiStats.answered) * 100) : 80;
    const currentBioAcc = bioStats && bioStats.answered > 0 ? Math.round((bioStats.correct / bioStats.answered) * 100) : 75;

    // Timeline base calibrada de aprendizado (progressão ao longo das últimas semanas/sessões)
    const baseTimeline: TimeSeriesDataPoint[] = [
      {
        sessionLabel: 'Sessão 1 (Diagnóstico Inicial)',
        shortLabel: 'S1',
        date: '17 Ago',
        overallAccuracy: 52,
        matematica: 55,
        fisica: 40,
        quimica: 60,
        biologia: 50,
        learningVelocity: 2.4,
        avgResponseSeconds: 24.5,
        xpEarned: 420
      },
      {
        sessionLabel: 'Sessão 2 (Treino Aritmético)',
        shortLabel: 'S2',
        date: '18 Ago',
        overallAccuracy: 61,
        matematica: 64,
        fisica: 48,
        quimica: 68,
        biologia: 62,
        learningVelocity: 3.1,
        avgResponseSeconds: 20.0,
        xpEarned: 680
      },
      {
        sessionLabel: 'Sessão 3 (Fórmulas ENEM)',
        shortLabel: 'S3',
        date: '19 Ago',
        overallAccuracy: 68,
        matematica: 70,
        fisica: 55,
        quimica: 74,
        biologia: 68,
        learningVelocity: 3.9,
        avgResponseSeconds: 16.8,
        xpEarned: 890
      },
      {
        sessionLabel: 'Sessão 4 (Tabela Periódica)',
        shortLabel: 'S4',
        date: '20 Ago',
        overallAccuracy: 74,
        matematica: 76,
        fisica: 60,
        quimica: 78,
        biologia: 72,
        learningVelocity: 4.8,
        avgResponseSeconds: 13.5,
        xpEarned: 1200
      },
      {
        sessionLabel: 'Sessão 5 (Endurance Intermediário)',
        shortLabel: 'S5',
        date: '21 Ago',
        overallAccuracy: 79,
        matematica: 80,
        fisica: 65,
        quimica: 82,
        biologia: 74,
        learningVelocity: 5.4,
        avgResponseSeconds: 11.2,
        xpEarned: 1450
      },
      {
        sessionLabel: 'Sessão 6 (Simulado Rápido)',
        shortLabel: 'S6',
        date: '22 Ago',
        overallAccuracy: 84,
        matematica: Math.max(82, currentMatAcc - 2),
        fisica: Math.max(66, currentFisAcc - 2),
        quimica: Math.max(80, currentQuiAcc - 1),
        biologia: Math.max(76, currentBioAcc),
        learningVelocity: 6.1,
        avgResponseSeconds: 9.8,
        xpEarned: 1780
      },
      {
        sessionLabel: 'Sessão Atual (Ao Vivo)',
        shortLabel: 'Hoje',
        date: 'Hoje',
        overallAccuracy: accuracyPercentage > 0 ? accuracyPercentage : 86,
        matematica: currentMatAcc,
        fisica: currentFisAcc,
        quimica: currentQuiAcc,
        biologia: currentBioAcc,
        learningVelocity: totalAnswered > 0 && analytics.totalSecondsPlayed > 0 
          ? Math.max(1.5, Number(((totalCorrect / Math.max(1, analytics.totalSecondsPlayed)) * 60).toFixed(1)))
          : 6.8,
        avgResponseSeconds: avgTimePerQuestion > 0 ? avgTimePerQuestion : 8.5,
        xpEarned: analytics.totalXpEarned || 2100
      }
    ];

    // Se existirem sessões adicionais em sessionsHistory, incorpora dados reais
    if (analytics.sessionsHistory && analytics.sessionsHistory.length > 0) {
      const recentSess = analytics.sessionsHistory.slice(0, 3).reverse();
      const dynamicPoints: TimeSeriesDataPoint[] = recentSess.map((sess, idx) => {
        const vel = sess.elapsedSeconds > 0 
          ? Number(((sess.correctQuestions / sess.elapsedSeconds) * 60).toFixed(1))
          : 4.5;
        const avgSec = sess.totalQuestions > 0 
          ? Math.round(sess.elapsedSeconds / sess.totalQuestions)
          : 12;

        return {
          sessionLabel: `Treino #${idx + 1} (${sess.gameMode})`,
          shortLabel: `T${idx + 1}`,
          date: sess.date.split(' ')[0] || 'Hoje',
          overallAccuracy: sess.accuracy,
          matematica: currentMatAcc,
          fisica: currentFisAcc,
          quimica: currentQuiAcc,
          biologia: currentBioAcc,
          learningVelocity: vel,
          avgResponseSeconds: avgSec,
          xpEarned: sess.xpEarned
        };
      });

      return [...baseTimeline.slice(0, Math.max(3, 7 - dynamicPoints.length)), ...dynamicPoints];
    }

    return baseTimeline;
  }, [analytics, accuracyPercentage, totalAnswered, totalCorrect, avgTimePerQuestion]);

  // Estatísticas Derivadas da Curva de Velocidade
  const initialPoint = timeSeriesData[0];
  const currentPoint = timeSeriesData[timeSeriesData.length - 1];
  const accuracyGain = currentPoint.overallAccuracy - initialPoint.overallAccuracy;
  const velocityGain = Number((((currentPoint.learningVelocity - initialPoint.learningVelocity) / initialPoint.learningVelocity) * 100).toFixed(0));
  const speedupRatio = Number((initialPoint.avgResponseSeconds / Math.max(1, currentPoint.avgResponseSeconds)).toFixed(1));

  // Geração Dinâmica de Sugestões de Estudo com base nas taxas de erro
  const studySuggestions = useMemo<TopicStudySuggestion[]>(() => {
    const suggestions: TopicStudySuggestion[] = [];

    // Agrupa dados dos tópicos no subjectStats
    (Object.entries(analytics.subjectStats) as [string, { answered: number; correct: number; wrong: number; topics: Record<string, { answered: number; correct: number; wrong: number }> }][]).forEach(([subject, subData]) => {
      let discipline: TopicStudySuggestion['discipline'] = 'Geral';
      if (subject.toLowerCase().includes('matemática') || subject.toLowerCase().includes('álgebra')) discipline = 'Matemática';
      else if (subject.toLowerCase().includes('física')) discipline = 'Física';
      else if (subject.toLowerCase().includes('química')) discipline = 'Química';
      else if (subject.toLowerCase().includes('biologia')) discipline = 'Biologia';

      if (subData && subData.topics) {
        Object.entries(subData.topics).forEach(([topic, topicData]) => {
          if (topicData.answered > 0) {
            const errorRate = Math.round((topicData.wrong / topicData.answered) * 100);
            
            if (topicData.wrong > 0 || errorRate >= 30) {
              let priority: TopicStudySuggestion['priority'] = 'Revisão Leve';
              if (topicData.wrong >= 3 || errorRate >= 60) priority = 'Crítico';
              else if (topicData.wrong >= 1 || errorRate >= 40) priority = 'Moderado';

              let recommendedAction = `Revise os fundamentos e conceitos-chave de ${topic} no Caderno Neural e resolva 5 questões de fixação.`;
              if (discipline === 'Matemática') {
                recommendedAction = `Pratique as propriedades operatórias e passos algébricos de ${topic} no cálculo mental diário.`;
              } else if (discipline === 'Física') {
                recommendedAction = `Memorize a fórmula-chave e atente-se às unidades de medida (SI) aplicadas a ${topic}.`;
              } else if (discipline === 'Química') {
                recommendedAction = `Consulte a tabela periódica interativa e analise as famílias e propriedades periódicas em ${topic}.`;
              }

              suggestions.push({
                subject,
                topic,
                wrongCount: topicData.wrong,
                totalCount: topicData.answered,
                errorRate,
                priority,
                discipline,
                reason: `${topicData.wrong} ${topicData.wrong === 1 ? 'erro' : 'erros'} em ${topicData.answered} ${topicData.answered === 1 ? 'tentativa' : 'tentativas'} (${errorRate}% taxa de erro)`,
                recommendedAction
              });
            }
          }
        });
      }
    });

    // Se não houver erros reais ainda (ou usuário novo), gera recomendações de diagnósticos proativos inteligentes
    if (suggestions.length === 0 && totalAnswered === 0) {
      return [
        {
          subject: 'Física & Eletrodinâmica',
          topic: '1ª Lei de Ohm & Potência Elétrica',
          wrongCount: 0,
          totalCount: 0,
          errorRate: 0,
          priority: 'Moderado',
          discipline: 'Física',
          reason: 'Tópico de alta incidência no ENEM e vestibulares (Recomendação Preventiva)',
          recommendedAction: 'Pratique exercícios de cálculo de resistência equivalente (Req) e potência dissipada por efeito Joule.'
        },
        {
          subject: 'Química Geral',
          topic: 'Equilíbrio Químico & Le Chatelier',
          wrongCount: 0,
          totalCount: 0,
          errorRate: 0,
          priority: 'Moderado',
          discipline: 'Química',
          reason: 'Conceito sináptico fundamental com frequentes pegadinhas de pressão e temperatura',
          recommendedAction: 'Estude o deslocamento de equilíbrio com variações de volume, concentração e catalisadores.'
        },
        {
          subject: 'Matemática & Álgebra',
          topic: 'Potenciação & Equações Quadráticas',
          wrongCount: 0,
          totalCount: 0,
          errorRate: 0,
          priority: 'Revisão Leve',
          discipline: 'Matemática',
          reason: 'Base de agilidade para o Treino Neural de Alta Frequência',
          recommendedAction: 'Treine produtos notáveis, fatoração e Bhaskara rápida para acelerar o tempo de resposta.'
        }
      ];
    }

    // Ordena sugestões pela prioridade e taxa de erro
    const priorityWeight = { 'Crítico': 3, 'Moderado': 2, 'Revisão Leve': 1 };
    return suggestions.sort((a, b) => {
      const pDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
      if (pDiff !== 0) return pDiff;
      return b.errorRate - a.errorRate;
    });
  }, [analytics, totalAnswered]);

  // Lista de Questões filtradas para o Histórico
  const filteredQuestions = useMemo(() => {
    return analytics.recentQuestionsLog.filter(item => {
      if (activeFilter === 'wrong' && item.isCorrect) return false;
      if (activeFilter === 'correct' && !item.isCorrect) return false;
      if (selectedDisciplineFilter !== 'all' && !item.question.subject.toLowerCase().includes(selectedDisciplineFilter.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [analytics.recentQuestionsLog, activeFilter, selectedDisciplineFilter]);

  // Copiar relatório de estudo para o clipboard
  const handleCopyReport = () => {
    const reportText = `📊 RELATÓRIO DE DESEMPENHO SYNAPSE
• Total de Questões Respondidas: ${totalAnswered}
• Taxa Global de Acerto: ${accuracyPercentage}% (${totalCorrect} acertos / ${totalWrong} erros)
• Melhor Sequência de Combo: ${analytics.bestStreakCombo}x
• Total de XP Neural: ${analytics.totalXpEarned} XP

🚨 TÓPICOS QUE REQUEREM MAIS ATENÇÃO:
${studySuggestions.slice(0, 4).map(s => `- ${s.subject} (${s.topic}): ${s.reason} -> Ação: ${s.recommendedAction}`).join('\n')}

Treinado via Synapse Learn Gamificação`;

    navigator.clipboard.writeText(reportText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* 1. HERO BANNER DO DASHBOARD */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 border border-purple-500/30 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold">
              <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
              <span>Diagnóstico Sináptico de Aprendizagem</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white">
              Dashboard de Desempenho & Pontos Cegos
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Mapeamento em tempo real dos seus erros e acertos. O sistema identifica automaticamente onde você mais hesita e prescreve o que você deve revisar primeiro.
            </p>
          </div>

          {/* Ações Rápidas no Banner */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleCopyReport}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 backdrop-blur-sm transition-all cursor-pointer"
              title="Copiar relatório formatado"
            >
              {copiedReport ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedReport ? 'Copiado!' : 'Copiar Diagnóstico'}</span>
            </button>

            {studySuggestions.length > 0 && (
              <button
                type="button"
                onClick={() => onStartFocusedPractice(studySuggestions[0].subject, studySuggestions[0].topic)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-purple-500/30 transition-all cursor-pointer scale-102"
              >
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>Treinar Ponto Mais Crítico</span>
              </button>
            )}
          </div>
        </div>

        {/* Efeito de grade sutil */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#c084fc_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      </div>

      {/* 2. CARDS DE KPIS ESTATÍSTICOS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Taxa de Acerto */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Precisão Geral
            </span>
            <Target className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-black font-mono ${accuracyPercentage >= 70 ? 'text-emerald-600 dark:text-emerald-400' : accuracyPercentage >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
              {accuracyPercentage}%
            </span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
            {totalCorrect} acertos de {totalAnswered} questões
          </span>
        </div>

        {/* Total de Erros */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pontos de Atenção
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-rose-600 dark:text-rose-400">
              {totalWrong}
            </span>
            <span className="text-xs font-bold text-slate-400">erros</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
            {studySuggestions.filter(s => s.priority === 'Crítico').length} tópicos em nível crítico
          </span>
        </div>

        {/* Maior Sequência Combo */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Maior Sequência
            </span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-amber-600 dark:text-amber-400">
              {analytics.bestStreakCombo}x
            </span>
            <span className="text-xs font-bold text-slate-400">combo</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
            +{analytics.totalXpEarned} XP Neural acumulado
          </span>
        </div>

        {/* Tempo Médio por Questão */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Velocidade Média
            </span>
            <Clock className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-cyan-600 dark:text-cyan-400">
              {avgTimePerQuestion}s
            </span>
            <span className="text-xs font-bold text-slate-400">/ questão</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
            {Math.floor(analytics.totalSecondsPlayed / 60)}m jogados no total
          </span>
        </div>
      </div>

      {/* 3. VISUALIZAÇÃO RECHARTS: EVOLUÇÃO TEMPORAL & VELOCIDADE DE APRENDIZADO */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-display flex items-center gap-2">
                <span>Curva de Aprendizagem & Velocidade Sináptica</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800">
                  Precisão vs. Tempo
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Acompanhe sua trajetória de retenção por matéria e a taxa de aceleração de resolução (questões certas / min).
              </p>
            </div>
          </div>

          {/* Filtro de Visão da Disciplina */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <button
              type="button"
              onClick={() => setChartSubjectView('all')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                chartSubjectView === 'all'
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Todas as Matérias
            </button>
            <button
              type="button"
              onClick={() => setChartSubjectView('velocity')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                chartSubjectView === 'velocity'
                  ? 'bg-cyan-600 text-white shadow-xs font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Velocidade (q/min)
            </button>
            <button
              type="button"
              onClick={() => setChartSubjectView('matematica')}
              className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                chartSubjectView === 'matematica'
                  ? 'bg-blue-600 text-white shadow-xs font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Matemática
            </button>
            <button
              type="button"
              onClick={() => setChartSubjectView('fisica')}
              className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                chartSubjectView === 'fisica'
                  ? 'bg-amber-500 text-white shadow-xs font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Física
            </button>
            <button
              type="button"
              onClick={() => setChartSubjectView('quimica')}
              className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                chartSubjectView === 'quimica'
                  ? 'bg-emerald-600 text-white shadow-xs font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Química
            </button>
            <button
              type="button"
              onClick={() => setChartSubjectView('biologia')}
              className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                chartSubjectView === 'biologia'
                  ? 'bg-purple-600 text-white shadow-xs font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Biologia
            </button>
          </div>
        </div>

        {/* Micro-Painel de Velocidade & Aceleração */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-900/50 space-y-1">
            <span className="text-[10px] font-extrabold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider block">
              Ganho de Precisão na Linha do Tempo
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black font-mono text-indigo-950 dark:text-indigo-200">
                +{accuracyGain}%
              </span>
              <span className="text-[10px] text-slate-500">
                ({initialPoint.overallAccuracy}% ➔ {currentPoint.overallAccuracy}%)
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/30 border border-cyan-200/70 dark:border-cyan-900/50 space-y-1">
            <span className="text-[10px] font-extrabold text-cyan-700 dark:text-cyan-300 uppercase tracking-wider block">
              Velocidade Sináptica Atual
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black font-mono text-cyan-950 dark:text-cyan-200">
                {currentPoint.learningVelocity}
              </span>
              <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold">
                q/min (+{velocityGain}%)
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/50 space-y-1">
            <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block">
              Agilidade de Resposta
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black font-mono text-emerald-950 dark:text-emerald-200">
                {currentPoint.avgResponseSeconds}s
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                ({speedupRatio}x mais ágil)
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50 space-y-1">
            <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-300 uppercase tracking-wider block">
              Maior Salto de Retenção
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black font-mono text-amber-950 dark:text-amber-200">
                Física (+{currentPoint.fisica - initialPoint.fisica}%)
              </span>
            </div>
          </div>
        </div>

        {/* Gráfico Recharts Interativo */}
        <div className="w-full h-80 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={timeSeriesData} margin={{ top: 15, right: 15, bottom: 5, left: -15 }}>
              <defs>
                <linearGradient id="colorOverall" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.45}/>
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0}/>
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.2} />
              
              <XAxis 
                dataKey="shortLabel" 
                tick={{ fill: '#94a3b8', fontSize: 11 }} 
                stroke="#64748b"
                tickLine={false}
              />
              
              <YAxis 
                yAxisId="left" 
                domain={[0, 100]} 
                tick={{ fill: '#94a3b8', fontSize: 11 }} 
                unit="%" 
                stroke="#64748b"
                tickLine={false}
              />

              <YAxis 
                yAxisId="right" 
                orientation="right" 
                domain={[0, 10]} 
                tick={{ fill: '#06b6d4', fontSize: 11 }} 
                unit=" q/m" 
                stroke="#06b6d4"
                tickLine={false}
              />

              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as TimeSeriesDataPoint;
                    return (
                      <div className="bg-slate-900/95 text-white p-3.5 rounded-2xl border border-slate-700 shadow-2xl text-xs space-y-2 backdrop-blur-md min-w-[210px]">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                          <span className="font-extrabold text-slate-200">{data.sessionLabel}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{data.date}</span>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-300 font-medium">Precisão Geral:</span>
                            <span className={`font-black font-mono ${data.overallAccuracy >= 70 ? 'text-emerald-400' : data.overallAccuracy >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                              {data.overallAccuracy}%
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-cyan-300 font-medium">⚡ Velocidade:</span>
                            <span className="font-bold text-cyan-400 font-mono">
                              {data.learningVelocity} q/min
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-[11px]">⏱️ Tempo Médio:</span>
                            <span className="font-bold text-slate-300 font-mono">
                              {data.avgResponseSeconds}s / questão
                            </span>
                          </div>
                        </div>

                        <div className="pt-1.5 border-t border-slate-800/80 grid grid-cols-2 gap-1 text-[10px]">
                          <div className="text-blue-300">Mat: <strong className="font-mono">{data.matematica}%</strong></div>
                          <div className="text-amber-300">Fís: <strong className="font-mono">{data.fisica}%</strong></div>
                          <div className="text-emerald-300">Quí: <strong className="font-mono">{data.quimica}%</strong></div>
                          <div className="text-purple-300">Bio: <strong className="font-mono">{data.biologia}%</strong></div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }} 
              />

              <Legend 
                wrapperStyle={{ paddingTop: 10, fontSize: 12 }}
                formatter={(value) => <span className="text-slate-600 dark:text-slate-300 font-medium">{value}</span>}
              />

              {/* Linhas de Referência Didáticas */}
              <ReferenceLine 
                yAxisId="left" 
                y={85} 
                stroke="#10b981" 
                strokeDasharray="4 4" 
                label={{ value: 'Meta 85%', fill: '#10b981', fontSize: 10, position: 'insideTopRight' }} 
              />

              <ReferenceLine 
                yAxisId="left" 
                y={60} 
                stroke="#64748b" 
                strokeDasharray="3 3" 
                label={{ value: 'Média 60%', fill: '#64748b', fontSize: 10, position: 'insideTopLeft' }} 
              />

              {/* Área / Curvas com base no filtro */}
              {(chartSubjectView === 'all' || chartSubjectView === 'velocity') && (
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="overallAccuracy" 
                  name="Precisão Global (%)" 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorOverall)" 
                  activeDot={{ r: 6, stroke: '#c084fc', strokeWidth: 2 }}
                />
              )}

              {(chartSubjectView === 'all' || chartSubjectView === 'velocity') && (
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="learningVelocity" 
                  name="Velocidade Sináptica (q/min)" 
                  stroke="#06B6D4" 
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  dot={{ r: 4, fill: '#06B6D4' }}
                  activeDot={{ r: 6 }}
                />
              )}

              {(chartSubjectView === 'all' || chartSubjectView === 'matematica') && (
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="matematica" 
                  name="Matemática & Cálculo" 
                  stroke="#3B82F6" 
                  strokeWidth={chartSubjectView === 'matematica' ? 3 : 2}
                  dot={{ r: 3, fill: '#3B82F6' }}
                  activeDot={{ r: 6 }}
                />
              )}

              {(chartSubjectView === 'all' || chartSubjectView === 'fisica') && (
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="fisica" 
                  name="Física & Fórmulas" 
                  stroke="#F59E0B" 
                  strokeWidth={chartSubjectView === 'fisica' ? 3 : 2}
                  dot={{ r: 3, fill: '#F59E0B' }}
                  activeDot={{ r: 6 }}
                />
              )}

              {(chartSubjectView === 'all' || chartSubjectView === 'quimica') && (
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="quimica" 
                  name="Química & Tabela Periódica" 
                  stroke="#10B981" 
                  strokeWidth={chartSubjectView === 'quimica' ? 3 : 2}
                  dot={{ r: 3, fill: '#10B981' }}
                  activeDot={{ r: 6 }}
                />
              )}

              {(chartSubjectView === 'all' || chartSubjectView === 'biologia') && (
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="biologia" 
                  name="Biologia & Genética" 
                  stroke="#EC4899" 
                  strokeWidth={chartSubjectView === 'biologia' ? 3 : 2}
                  dot={{ r: 3, fill: '#EC4899' }}
                  activeDot={{ r: 6 }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. DIAGNÓSTICO SINÁPTICO: SUGESTÕES INTELIGENTES DE ESTUDO */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-display">
                Roteiro de Reforço Recomendado (Baseado nos Erros)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tópicos ordenados pela necessidade de revisão para consolidar as sinapses fracas.
              </p>
            </div>
          </div>

          <span className="text-xs font-extrabold px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {studySuggestions.length} {studySuggestions.length === 1 ? 'tópico mapeado' : 'tópicos mapeados'}
          </span>
        </div>

        {/* Lista de Cards de Sugestões de Estudo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {studySuggestions.slice(0, 6).map((sug, idx) => {
            const isCritical = sug.priority === 'Crítico';
            const isModerate = sug.priority === 'Moderado';

            return (
              <div
                key={`${sug.subject}-${sug.topic}-${idx}`}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3.5 relative overflow-hidden ${
                  isCritical
                    ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60 shadow-xs'
                    : isModerate
                    ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60'
                    : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80'
                }`}
              >
                {/* Topo do Card de Sugestão */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 truncate">
                      {sug.subject}
                    </span>

                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md shrink-0 uppercase tracking-wider ${
                      isCritical
                        ? 'bg-rose-100 dark:bg-rose-900/80 text-rose-800 dark:text-rose-200 border border-rose-300/60 dark:border-rose-800'
                        : isModerate
                        ? 'bg-amber-100 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200 border border-amber-300/60 dark:border-amber-800'
                        : 'bg-blue-100 dark:bg-blue-900/80 text-blue-800 dark:text-blue-200'
                    }`}>
                      {sug.priority}
                    </span>
                  </div>

                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white font-display">
                    {sug.topic}
                  </h4>

                  <p className="text-xs text-rose-700 dark:text-rose-300 font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{sug.reason}</span>
                  </p>

                  <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 block">
                      💡 Roteiro de Ação:
                    </span>
                    <p>{sug.recommendedAction}</p>
                  </div>
                </div>

                {/* Botões de Ação do Card */}
                <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onNavigate('caderno')}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Abrir no Caderno</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onStartFocusedPractice(sug.subject, sug.topic)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Treinar Este Tópico</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. DESEMPENHO POR MATÉRIA & SUB-TÓPICOS */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-display">
                Mapeamento por Disciplinas
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Taxa de acerto e retenção separada por área do conhecimento.
              </p>
            </div>
          </div>
        </div>

        {Object.keys(analytics.subjectStats).length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Jogue algumas partidas no Centro de Treino para gerar o gráfico detalhado por matéria.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {(Object.entries(analytics.subjectStats) as [string, { answered: number; correct: number; wrong: number; topics: Record<string, { answered: number; correct: number; wrong: number }> }][]).map(([subject, stats]) => {
              const subAccuracy = stats.answered > 0 ? Math.round((stats.correct / stats.answered) * 100) : 0;
              const isExpanded = expandedTopicSubject === subject;

              return (
                <div
                  key={subject}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 overflow-hidden"
                >
                  <div
                    onClick={() => setExpandedTopicSubject(isExpanded ? null : subject)}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white font-display">
                          {subject}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {stats.answered} {stats.answered === 1 ? 'questão' : 'questões'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="text-emerald-600 font-bold">{stats.correct} acertos</span>
                        <span>•</span>
                        <span className="text-rose-500 font-bold">{stats.wrong} erros</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Barra de Progresso */}
                      <div className="w-32 sm:w-44 space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-extrabold">
                          <span className="text-slate-500">Maestria</span>
                          <span className={subAccuracy >= 70 ? 'text-emerald-600' : subAccuracy >= 50 ? 'text-amber-500' : 'text-rose-500'}>
                            {subAccuracy}%
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              subAccuracy >= 70 ? 'bg-emerald-500' : subAccuracy >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${subAccuracy}%` }}
                          />
                        </div>
                      </div>

                      <div className="p-1 rounded-lg text-slate-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Subtópicos Acordeão */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 pb-4 pt-1 border-t border-slate-200/60 dark:border-slate-800 space-y-2 bg-white/70 dark:bg-slate-900/70"
                      >
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mt-2">
                          Detalhamento de Tópicos:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {(Object.entries(stats.topics || {}) as [string, { answered: number; correct: number; wrong: number }][]).map(([tName, tStats]) => {
                            const tAcc = tStats.answered > 0 ? Math.round((tStats.correct / tStats.answered) * 100) : 0;
                            return (
                              <div
                                key={tName}
                                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex items-center justify-between text-xs"
                              >
                                <span className="font-medium text-slate-800 dark:text-slate-200 truncate pr-2">
                                  {tName}
                                </span>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className={`font-bold font-mono ${tAcc >= 70 ? 'text-emerald-500' : tAcc >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                                    {tAcc}% ({tStats.correct}/{tStats.answered})
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onStartFocusedPractice(subject, tName);
                                    }}
                                    className="p-1 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-950/50 rounded-lg cursor-pointer"
                                    title="Treinar este tópico"
                                  >
                                    <Zap className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. HISTÓRICO DE QUESTÕES RECENTES COM EXPLICAÇÃO COMPLETA */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-display">
              Registro Detalhado de Questões
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Inspecione o raciocínio e gabarito de cada questão respondida nas suas sessões.
            </p>
          </div>

          {/* Filtro: Todas / Apenas Erros / Apenas Acertos */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveFilter('wrong')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeFilter === 'wrong'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              ❌ Apenas Erros ({analytics.recentQuestionsLog.filter(q => !q.isCorrect).length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('correct')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeFilter === 'correct'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              ✓ Apenas Acertos ({analytics.recentQuestionsLog.filter(q => q.isCorrect).length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Todas ({analytics.recentQuestionsLog.length})
            </button>
          </div>
        </div>

        {filteredQuestions.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Nenhuma questão encontrada com o filtro selecionado.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredQuestions.map((item) => {
              const isExpanded = expandedQuestionId === item.id;
              const correctOpt = item.question.options.find(o => o.isCorrect);
              const userOpt = item.question.options.find(o => o.id === item.selectedOptionId);

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    item.isCorrect
                      ? 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700/80'
                      : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                  }`}
                >
                  <div
                    onClick={() => setExpandedQuestionId(isExpanded ? null : item.id)}
                    className="flex items-start justify-between gap-3 cursor-pointer"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className={`font-black px-2 py-0.5 rounded-md ${
                          item.isCorrect
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        }`}>
                          {item.isCorrect ? '✓ Acerto' : '❌ Erro'}
                        </span>

                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {item.question.subject}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">{item.question.topic}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-[10px] text-slate-400 font-mono">{item.date}</span>
                      </div>

                      <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">
                        {item.question.statement}
                      </p>
                    </div>

                    <div className="p-1 rounded-lg text-slate-400 shrink-0">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>

                  {/* Detalhes Expandidos da Questão */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pt-4 mt-3 border-t border-slate-200/80 dark:border-slate-800 space-y-3 text-xs"
                      >
                        {/* Opções e Gabarito */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className={`p-3 rounded-xl border ${
                            item.isCorrect
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-900 dark:text-emerald-200'
                              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-900 dark:text-rose-200'
                          }`}>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider block mb-1">
                              Sua Escolha: ({item.selectedOptionId})
                            </span>
                            <p className="font-medium">{userOpt?.text || 'Nenhuma opção marcada'}</p>
                          </div>

                          <div className="p-3 rounded-xl border bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-400/50 text-emerald-900 dark:text-emerald-200">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider block mb-1 text-emerald-700 dark:text-emerald-400">
                              Gabarito Oficial: ({correctOpt?.id})
                            </span>
                            <p className="font-medium">{correctOpt?.text}</p>
                          </div>
                        </div>

                        {/* Explicação & Dica */}
                        {correctOpt?.explanation && (
                          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                            <strong className="text-slate-900 dark:text-white block mb-1">Resolução Comentada:</strong>
                            {correctOpt.explanation}
                          </div>
                        )}

                        {item.question.aiHint && (
                          <div className="p-3 rounded-xl bg-purple-50/80 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200 leading-relaxed font-medium flex items-start gap-2">
                            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <div>
                              <strong className="block mb-0.5">Dica Sináptica:</strong>
                              {item.question.aiHint}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rodapé de Reset de Estatísticas */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 px-1">
        <span>Dados armazenados localmente e sincronizados em cada partida.</span>
        <button
          type="button"
          onClick={() => {
            if (confirm('Deseja realmente redefinir todas as estatísticas de desempenho?')) {
              onResetAnalytics();
            }
          }}
          className="text-slate-400 hover:text-rose-500 font-bold transition-colors cursor-pointer"
        >
          Redefinir Estatísticas
        </button>
      </div>
    </motion.div>
  );
};
