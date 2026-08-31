import React, { useState, useEffect, useMemo } from 'react';
import { ScreenId } from '../types/design';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ArrowRight, 
  Send, 
  Flame, 
  BrainCircuit, 
  Clock, 
  Play, 
  Zap, 
  Network,
  Target,
  Trophy,
  CheckCircle2,
  X,
  Compass,
  ChevronDown,
  Calendar,
  PenTool,
  FlaskConical,
  Calculator
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DailyLearningGoal } from './DailyLearningGoal';
import { StudyTimeSummaryCard } from './StudyTimeSummaryCard';
import { StudyMaterialModal } from './StudyMaterialModal';
import { StudyBadgesAndRewards } from './StudyBadgesAndRewards';
import { HIGH_YIELD_STUDY_MATERIALS, HighYieldStudyMaterial } from '../data/highYieldMaterials';
import { TARGET_EXAMS, calculateExamCountdown } from '../utils/examCountdown';
import { chatWithGroq } from '../services/ai';
import { Markdown } from './Markdown';

interface HomeDashboardProps {
  onNavigate: (screen: ScreenId) => void;
  streakCount: number;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

export type FocusLevel = 'facil' | 'medio' | 'dificil';

interface FocusPlan {
  id: FocusLevel;
  name: string;
  tag: string;
  questionsTotal: number;
  dailyAverage: string;
  estimatedTime: string;
  xpReward: number;
  badge: string;
  color: string;
  borderColor: string;
  bgGradient: string;
  buttonColor: string;
  description: string;
  instructions: string[];
}

const FOCUS_PLANS: FocusPlan[] = [
  {
    id: 'facil',
    name: 'Foco Fácil',
    tag: 'Iniciante / Hábito',
    questionsTotal: 50,
    dailyAverage: '7 questões/dia',
    estimatedTime: '15 - 20 min diários',
    xpReward: 250,
    badge: '🥉 Bronze',
    color: '#0284C7',
    borderColor: 'border-sky-300 dark:border-sky-700',
    bgGradient: 'from-sky-50 to-blue-50 dark:from-sky-950/40 dark:to-blue-950/40',
    buttonColor: 'bg-sky-600 hover:bg-sky-700 text-white',
    description: 'Consolidação gradual da rotina de estudos com foco na retenção de conceitos básicos e fórmulas fundamentais.',
    instructions: [
      'Resolver 50 questões no modo Treino durante os 7 dias da semana.',
      'Média diária de cerca de 7 a 8 exercícios comentados.',
      'Revisão leve de erros e consolidação com a IA da Plataforma Mendonça.',
      'Garante +250 XP e Insígnia Foco Bronze no perfil.'
    ]
  },
  {
    id: 'medio',
    name: 'Foco Médio',
    tag: '⭐ Mais Escolhido',
    questionsTotal: 100,
    dailyAverage: '14 questões/dia',
    estimatedTime: '35 - 45 min diários',
    xpReward: 600,
    badge: '🥈 Prata',
    color: '#2563EB',
    borderColor: 'border-blue-400 dark:border-blue-600',
    bgGradient: 'from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40',
    buttonColor: 'bg-blue-600 hover:bg-blue-700 text-white',
    description: 'Equilíbrio ideal entre velocidade e profundidade para estudantes que buscam alto rendimento e retenção no Grafo.',
    instructions: [
      'Resolver 100 questões no modo Treino ao longo de 7 dias.',
      'Média diária de 14 a 15 questões divididas por disciplinas.',
      'Taxa de acerto recomendada de 75%+ nos simulados diários.',
      'Garante +600 XP e Insígnia Foco Prata no perfil.'
    ]
  },
  {
    id: 'dificil',
    name: 'Foco Difícil',
    tag: '🔥 Alta Performance',
    questionsTotal: 200,
    dailyAverage: '28 questões/dia',
    estimatedTime: '75 - 90 min diários',
    xpReward: 1500,
    badge: '🥇 Mestre Mendonça',
    color: '#7C3AED',
    borderColor: 'border-purple-400 dark:border-purple-600',
    bgGradient: 'from-purple-50 to-violet-50 dark:from-purple-950/40 dark:to-violet-950/40',
    buttonColor: 'bg-purple-600 hover:bg-purple-700 text-white',
    description: 'Imersão intensiva e maratona de resolução para candidatos a cursos de alta concorrência (Medicina, Computação e Engenharia).',
    instructions: [
      'Resolver 200 questões de nível intermediário/avançado em 1 semana.',
      'Média diária de 28 a 30 questões com controle de tempo de prova.',
      'Mapeamento completo dos nós neurais com maior incidência.',
      'Garante +1.500 XP e Insígnia Mestre do Foco no perfil.'
    ]
  }
];

export const HomeDashboard: React.FC<HomeDashboardProps> = ({ onNavigate, streakCount }) => {
  const { currentUser, userProfile } = useAuth();
  const userName = userProfile?.displayName || currentUser?.displayName || 'Estudante';
  const firstName = userName.split(' ')[0];

  // Estado do Exame Selecionado para Contagem Regressiva Real
  const [selectedExamId, setSelectedExamId] = useState<string>('enem-dia-1');
  const [isExamDropdownOpen, setIsExamDropdownOpen] = useState(false);
  const [countdownTick, setCountdownTick] = useState(0);

  // Material de Estudo Aberto no Modal
  const [selectedStudyMaterial, setSelectedStudyMaterial] = useState<HighYieldStudyMaterial | null>(null);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);

  // Chat com IA Tutor
  const [chatInput, setChatInput] = useState('');
  const [isChatTyping, setIsChatTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: `Olá ${firstName}! Bem-vindo(a) à Plataforma Mendonça. Seus dados de desempenho estão sincronizados no Supabase. Como posso te apoiar hoje nos seus estudos?`,
      time: 'Agora'
    }
  ]);
  
  // Foco Modal & Active State
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
  const [selectedFocusPlan, setSelectedFocusPlan] = useState<FocusLevel>('medio');
  const [activeFocus, setActiveFocus] = useState<{
    level: FocusLevel;
    completed: number;
    total: number;
    daysLeft: number;
  }>({
    level: 'medio',
    completed: 0,
    total: 100,
    daysLeft: 7
  });

  // Atualização do Cronômetro do Exame a cada minuto/segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownTick(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentExam = useMemo(() => {
    return TARGET_EXAMS.find(e => e.id === selectedExamId) || TARGET_EXAMS[0];
  }, [selectedExamId]);

  const countdown = useMemo(() => {
    return calculateExamCountdown(currentExam.targetDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentExam, countdownTick]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isChatTyping) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: chatInput,
      time: 'Agora'
    };

    setMessages(prev => [...prev, newMsg]);
    const prompt = chatInput;
    setChatInput('');
    setIsChatTyping(true);

    const systemInstruction =
      `Você é o assistente de estudos "IA Mendonça" da Plataforma Mendonça, preparando o estudante ${firstName} para o ENEM e vestibulares. ` +
      `Faltam ${countdown.formattedText} dias para o ${currentExam.shortName}. ` +
      `Responda em português do Brasil, de forma clara, didática e objetiva, orientando o aluno sobre estudos, ` +
      `redação, treinos, simulados, foco e revisão. Seja apoio e motivação.`;

    const history = [
      ...messages.map(m => ({ role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant', content: m.text })),
      { role: 'user' as const, content: prompt },
    ];

    const aiReply = await chatWithGroq(history, systemInstruction);

    // Se a Edge Function não estiver disponível, não fabrica resposta formatada
    let reply = aiReply;
    if (!reply) {
      reply = 'Não foi possível conectar meu assistente de estudos agora. Verifique sua conexão (ou se o serviço Groq está ativo) e tente novamente em instantes.';
    }

    setMessages(prev => [
      ...prev,
      {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: reply,
        time: 'Agora'
      }
    ]);
    setIsChatTyping(false);
  };

  const handleSelectPlan = (planId: FocusLevel) => {
    setSelectedFocusPlan(planId);
  };

  const handleConfirmFocus = () => {
    const plan = FOCUS_PLANS.find(p => p.id === selectedFocusPlan) || FOCUS_PLANS[1];
    setActiveFocus({
      level: plan.id,
      completed: 0,
      total: plan.questionsTotal,
      daysLeft: 7
    });
    setIsFocusModalOpen(false);
  };

  const handleOpenMaterial = (material: HighYieldStudyMaterial) => {
    setSelectedStudyMaterial(material);
    setIsMaterialModalOpen(true);
  };

  // Calcula os dias da semana de forma dinâmica (Seg a Dom)
  const daysOfWeek = useMemo(() => {
    const dayLabels = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
    const todayJsDay = new Date().getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
    const currentDayIndex = todayJsDay === 0 ? 6 : todayJsDay - 1;

    return dayLabels.map((label, idx) => {
      const isToday = idx === currentDayIndex;
      const done = isToday && streakCount >= 1;
      return {
        label,
        active: isToday,
        done,
      };
    });
  }, [streakCount]);

  return (
    <div className="flex-1 flex flex-col gap-6 overflow-y-auto pb-24 pr-1 relative select-none text-slate-900 dark:text-slate-100">
      
      {/* Grid Principal do Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        
        {/* COLUNA ESQUERDA / PRINCIPAL: 8 Colunas */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* ========================================================================= */}
          {/* 1. BANNER DINÂMICO DE CONTAGEM REGRESSIVA REAL PARA O EXAME */}
          {/* ========================================================================= */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative rounded-[32px] overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-950 p-6 sm:p-8 flex flex-col justify-between shadow-xl shadow-blue-500/10 min-h-[220px]"
          >
            <div className="z-10 flex flex-col max-w-2xl">
              
              {/* Seletor de Exame Dinâmico */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="relative">
                  <button
                    onClick={() => setIsExamDropdownOpen(!isExamDropdownOpen)}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
                    <span>{currentExam.name}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-white/70" />
                  </button>

                  <AnimatePresence>
                    {isExamDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        className="absolute left-0 top-full mt-2 w-72 bg-slate-900/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl p-2 z-50 space-y-1 text-white"
                      >
                        <span className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1 block">
                          Selecione o Exame Alvo:
                        </span>
                        {TARGET_EXAMS.map((exam) => (
                          <button
                            key={exam.id}
                            onClick={() => {
                              setSelectedExamId(exam.id);
                              setIsExamDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                              exam.id === selectedExamId
                                ? 'bg-blue-600 text-white font-bold'
                                : 'hover:bg-white/10 text-slate-200'
                            }`}
                          >
                            <span className="truncate">{exam.shortName}</span>
                            {exam.id === selectedExamId && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-300" />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 backdrop-blur-sm text-[11px] font-bold text-blue-200 border border-white/10">
                  <Calendar className="w-3.5 h-3.5 text-cyan-300" />
                  <span>{new Date(currentExam.targetDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                </div>
              </div>

              {/* Título Principal com Contagem Real */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-2 tracking-tight font-display flex flex-wrap items-baseline gap-2">
                <span>Faltam {countdown.days} dias</span>
                {countdown.days < 45 && (
                  <span className="text-lg sm:text-xl font-normal text-cyan-300 font-mono">
                    e {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
                  </span>
                )}
              </h2>

              <p className="text-blue-100 text-xs sm:text-sm font-medium leading-relaxed">
                {currentExam.tips}
              </p>
              
              {/* Botões de Ação Imediata */}
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setIsFocusModalOpen(true)}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all shadow-lg shadow-amber-400/20 flex items-center gap-2 cursor-pointer"
                >
                  <Target className="w-4 h-4 text-slate-950" />
                  <span>Modo Foco Semanal</span>
                  <span className="bg-slate-950/10 text-slate-900 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase">
                    {activeFocus.total}q / sem
                  </span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onNavigate('treino')}
                  className="bg-white text-blue-900 hover:bg-cyan-50 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-blue-700" />
                  Ir para o Treino
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onNavigate('caderno')}
                  className="bg-blue-900/60 hover:bg-blue-900/80 text-white border border-white/20 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  Caderno de Disciplinas
                </motion.button>
              </div>
            </div>

            {/* Ambient Background Circles */}
            <div className="absolute right-[-20px] bottom-[-20px] opacity-20 w-64 h-64 border-[30px] border-white rounded-full pointer-events-none" />
            <div className="absolute right-24 top-[-40px] opacity-10 w-48 h-48 border-[20px] border-cyan-200 rounded-full pointer-events-none" />
          </motion.div>

          {/* ========================================================================= */}
          {/* 1.5 SEÇÃO DE RESUMO: TEMPO TOTAL DE ESTUDO (ÚLTIMOS 7 DIAS) & META DIÁRIA */}
          {/* ========================================================================= */}
          <StudyTimeSummaryCard
            onStartTraining={() => onNavigate('treino')}
            streakCount={streakCount}
          />

          {/* ========================================================================= */}
          {/* 2. COMPONENTE RECHARTS: META DIÁRIA DE APRENDIZADO */}
          {/* ========================================================================= */}
          <DailyLearningGoal
            streakCount={streakCount}
            onStartTraining={() => onNavigate('treino')}
            onOpenCaderno={() => onNavigate('caderno')}
            todayQuestionsAnswered={userProfile?.totalAnswered || 0}
            todayMinutesStudied={0}
            todayXpEarned={userProfile?.totalXp || 0}
          />

          {/* ========================================================================= */}
          {/* 2.5 SISTEMA DE MEDALHAS & RECOMPENSAS VISUAIS DE ESTUDO */}
          {/* ========================================================================= */}
          <StudyBadgesAndRewards
            streakCount={userProfile?.streak || streakCount || 1}
            totalAnswered={userProfile?.totalAnswered || 0}
            totalCorrect={userProfile?.totalCorrect || 0}
            accuracy={userProfile?.accuracy ?? 0}
            totalXp={userProfile?.totalXp || 0}
            onNavigateToTreino={() => onNavigate('treino')}
          />

          {/* ========================================================================= */}
          {/* 3. MATERIAIS RECENTES 100% FUNCIONAIS COM MODAL DE LEITURA & RESUMO */}
          {/* ========================================================================= */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 font-display">
                  Materiais de Alto Rendimento & Resumos
                </h3>
              </div>
              <button 
                onClick={() => onNavigate('caderno')}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 text-xs font-bold cursor-pointer hover:underline flex items-center gap-1"
              >
                Ver todo o Caderno <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {HIGH_YIELD_STUDY_MATERIALS.map((material) => (
                <motion.div 
                  key={material.id}
                  whileHover={{ y: -4, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleOpenMaterial(material)}
                  className="bg-white dark:bg-slate-900 p-4 rounded-[22px] border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between min-h-[170px]"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div 
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs shadow-xs"
                        style={{ backgroundColor: material.color }}
                      >
                        {material.category === 'Redação' && <PenTool className="w-4 h-4" />}
                        {material.category === 'Física' && <Zap className="w-4 h-4" />}
                        {material.category === 'Química' && <FlaskConical className="w-4 h-4" />}
                        {material.category === 'Matemática' && <Calculator className="w-4 h-4" />}
                      </div>
                      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {material.category}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                      {material.title}
                    </h4>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    <span>{material.readTime}</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      Ler síntese →
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 4. MAPA DE CONHECIMENTO WIDGET INTERATIVO */}
          {/* ========================================================================= */}
          <motion.div 
            whileHover={{ y: -2 }}
            onClick={() => onNavigate('mapa')}
            className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200/80 dark:border-slate-800 p-6 flex flex-col relative overflow-hidden shadow-2xs hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg hover:shadow-blue-500/15 transition-all duration-300 cursor-pointer group min-h-[200px]"
          >
            <div className="flex items-center justify-between z-10 mb-2">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 font-display flex items-center gap-2">
                <Network className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Mapa de Conhecimento Neural
              </h3>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                Explorar Grafo Completo <ArrowRight className="w-3 h-3" />
              </span>
            </div>

            {/* Neural Network Node Simulation */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-full h-full">
                <svg className="absolute inset-0 w-full h-full opacity-60 dark:opacity-80">
                  <line x1="22%" y1="52%" x2="48%" y2="35%" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3 3" />
                  <line x1="48%" y1="35%" x2="78%" y2="48%" stroke="#60A5FA" strokeWidth="2" />
                  <line x1="32%" y1="72%" x2="48%" y2="35%" stroke="#CBD5E1" strokeWidth="1.5" />
                  <line x1="48%" y1="35%" x2="62%" y2="75%" stroke="#C084FC" strokeWidth="1.5" />
                </svg>

                <div className="absolute top-1/2 left-1/4 w-3.5 h-3.5 bg-blue-500 rounded-full ring-4 ring-blue-100 dark:ring-blue-900/40 shadow-sm" />
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-5 h-5 bg-cyan-400 rounded-full ring-8 ring-cyan-50 dark:ring-cyan-950/40 animate-pulse shadow-md flex items-center justify-center text-[8px] font-bold text-white">
                  ★
                </div>
                <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-purple-500 rounded-full ring-2 ring-purple-100 dark:ring-purple-900/40" />
                <div className="absolute top-1/2 right-1/4 w-5 h-5 bg-purple-600 rounded-full ring-4 ring-purple-100 dark:ring-purple-900/40 shadow-md">
                  <div className="absolute inset-[-4px] border border-purple-200 dark:border-purple-800 rounded-full scale-150 opacity-30 animate-ping" />
                </div>
                <div className="absolute bottom-1/5 right-1/3 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-emerald-100 dark:ring-emerald-900/40" />
              </div>
            </div>

            <div className="mt-auto z-10 flex flex-wrap gap-2 pt-14">
              <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide flex items-center gap-1 border border-blue-100/60 dark:border-blue-900/40">
                <BrainCircuit className="w-3 h-3" /> NEURO-REDE ATIVA
              </span>
              <span className="bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide flex items-center gap-1 border border-purple-100/60 dark:border-purple-900/40">
                <Sparkles className="w-3 h-3" /> IA MENDONÇA
              </span>
              <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide flex items-center gap-1 border border-emerald-100/60 dark:border-emerald-900/40">
                84 NÓS CONECTADOS
              </span>
            </div>
          </motion.div>
        </div>

        {/* COLUNA DIREITA: 4 Colunas (Streak & AI Assistant) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* OFENSIVA SEMANAL */}
          <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700/60 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100 font-display">Ofensiva Semanal</span>
              </div>
              <span className="text-xs text-slate-400 dark:text-slate-400 font-semibold uppercase tracking-wider">Nível {Math.min(7, Math.floor((streakCount || 1) / 2) + 1)}</span>
            </div>

            <div className="flex justify-between items-center gap-1.5">
              {daysOfWeek.map((day, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1.5">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                      day.done
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-blue-950 scale-105'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-400'
                    }`}
                  >
                    {day.label}
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-400">
                    {idx === 0 ? 'Seg' : idx === 6 ? 'Dom' : ''}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-300">
              <span>Sequência Ativa:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{streakCount} dias seguidos 🔥</span>
            </div>
          </div>

          {/* AI ASSISTANT CHAT */}
          <div 
            className="flex-1 rounded-[32px] border border-slate-200/80 dark:border-slate-800 p-6 relative overflow-hidden shadow-xl bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl flex flex-col min-h-[380px] hover:shadow-lg hover:shadow-blue-500/15 hover:border-blue-300 dark:hover:border-blue-700/60 transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-36 h-36 bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col h-full z-10">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 font-display">Tutor Mendonça AI</p>
                  <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online Agora
                  </p>
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1 max-h-[220px]">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 text-xs leading-relaxed transition-all ${
                      msg.sender === 'ai'
                        ? 'bg-slate-100/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 rounded-2xl rounded-tl-xs border border-slate-200/60 dark:border-slate-700/60 shadow-2xs self-start max-w-[90%]'
                        : 'bg-blue-600 text-white rounded-2xl rounded-tr-xs self-end max-w-[85%] shadow-sm'
                    }`}
                  >
                    <Markdown content={msg.text} />
                    <span className={`block text-[9px] mt-1 font-medium ${msg.sender === 'ai' ? 'text-slate-400 dark:text-slate-400' : 'text-blue-200'}`}>
                      {msg.time}
                    </span>
                  </div>
                ))}
                {isChatTyping && (
                  <div className="p-3 text-xs leading-relaxed bg-slate-100/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 rounded-2xl rounded-tl-xs border border-slate-200/60 dark:border-slate-700/60 self-start">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.15s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.3s]" />
                    </span>
                  </div>
                )}
              </div>

              <form onSubmit={handleSendMessage} className="mt-4 relative">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Tire dúvidas sobre matérias ou metas..."
                  className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 py-3 pl-4 pr-12 rounded-2xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-400 outline-none shadow-inner"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="submit"
                  className="absolute right-2 top-2 w-7 h-7 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                  title="Enviar mensagem"
                >
                  <Send className="w-3.5 h-3.5" />
                </motion.button>
              </form>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL INTERATIVO DO MODO FOCO SEMANAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isFocusModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFocusModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[36px] shadow-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 overflow-hidden z-10 max-h-[90vh] flex flex-col text-slate-900 dark:text-slate-100"
            >
              <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
                      Modo Foco Semanal • Plataforma Mendonça
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Escolha seu nível de intensidade para os próximos 7 dias e ganhe XP bônus
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsFocusModalOpen(false)}
                  className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
                  title="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-6 overflow-y-auto flex-1 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {FOCUS_PLANS.map((plan) => {
                    const isSelected = selectedFocusPlan === plan.id;

                    return (
                      <motion.div
                        key={plan.id}
                        whileHover={{ y: -4 }}
                        onClick={() => handleSelectPlan(plan.id)}
                        className={`rounded-[28px] p-5 border-2 transition-all cursor-pointer flex flex-col justify-between relative ${
                          isSelected
                            ? `${plan.borderColor} bg-gradient-to-b ${plan.bgGradient} shadow-md`
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider bg-white dark:bg-slate-800 shadow-2xs text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
                            {plan.tag}
                          </span>
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                            isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
                          }`}>
                            {isSelected && <CheckCircle2 className="w-4 h-4" />}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                            {plan.name}
                          </h3>
                          <div className="mt-2 flex items-baseline gap-1.5">
                            <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">
                              {plan.questionsTotal}
                            </span>
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">questões / semana</span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                            {plan.description}
                          </p>
                        </div>

                        <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-slate-800 space-y-2 text-xs">
                          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 font-medium">
                            <span className="flex items-center gap-1.5 text-slate-500">
                              <Compass className="w-3.5 h-3.5" /> Ritmo:
                            </span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{plan.dailyAverage}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 font-medium">
                            <span className="flex items-center gap-1.5 text-slate-500">
                              <Clock className="w-3.5 h-3.5" /> Tempo diário:
                            </span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{plan.estimatedTime}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 font-medium">
                            <span className="flex items-center gap-1.5 text-slate-500">
                              <Trophy className="w-3.5 h-3.5 text-amber-500" /> Recompensa:
                            </span>
                            <span className="font-extrabold text-amber-600 dark:text-amber-400">+{plan.xpReward} XP ({plan.badge})</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {selectedFocusPlan && (
                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      O que você precisa fazer no plano selecionado:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {(FOCUS_PLANS.find(p => p.id === selectedFocusPlan)?.instructions || []).map((step, sIdx) => (
                        <div key={sIdx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700 shadow-2xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
                  Você pode recalibrar sua meta a qualquer momento. O progresso é registrado a cada exercício concluído.
                </p>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => setIsFocusModalOpen(false)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmFocus}
                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Target className="w-4 h-4" />
                    <span>Iniciar Foco Agora</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL INTERATIVO DE LEITURA DO MATERIAL RECENTE SELECIONADO */}
      {/* ========================================================================= */}
      <StudyMaterialModal
        isOpen={isMaterialModalOpen}
        material={selectedStudyMaterial}
        onClose={() => setIsMaterialModalOpen(false)}
        onNavigateToCaderno={() => onNavigate('caderno')}
        onNavigateToTreino={() => onNavigate('treino')}
      />

    </div>
  );
};
