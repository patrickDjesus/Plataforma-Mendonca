import React, { useState } from 'react';
import { ScreenId } from '../types/design';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ArrowRight, 
  Send, 
  Flame, 
  BrainCircuit, 
  Clock, 
  BookOpen, 
  Layers, 
  Play, 
  Zap, 
  Network,
  Atom,
  Target,
  Trophy,
  CheckCircle2,
  X,
  Compass,
  Award
} from 'lucide-react';

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
  const [chatInput, setChatInput] = useState('');
  
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
    completed: 34,
    total: 100,
    daysLeft: 5
  });

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Olá Lucas! Bem-vindo à Plataforma Mendonça. Notei que você está revisando Física Térmica. Gostaria de ver o mapa de conceitos de Termodinâmica e Entropia?',
      time: 'Agora'
    },
    {
      id: '2',
      sender: 'user',
      text: 'Sim, por favor! E mostre os pontos mais cobrados no ENEM e vestibulares.',
      time: '1m atrás'
    },
    {
      id: '3',
      sender: 'ai',
      text: 'Excelente! O nó "Ciclo de Carnot & Segunda Lei" tem 88% de incidência histórica. Adicionei 3 flashcards prioritários ao seu treino.',
      time: 'Agora'
    }
  ]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: chatInput,
      time: 'Agora'
    };

    setMessages(prev => [...prev, newMsg]);
    const prompt = chatInput;
    setChatInput('');

    setTimeout(() => {
      let reply = 'Excelente pergunta! Cruzando com o seu Grafo de Conhecimento na Plataforma Mendonça, sugiro abrir o Caderno de Disciplinas para resumirmos a fórmula.';
      if (prompt.toLowerCase().includes('foco')) {
        reply = 'O Modo Foco foi calibrado para sua meta semanal. Você pode alternar entre Fácil (50q), Médio (100q) e Difícil (200q) a qualquer momento!';
      } else if (prompt.toLowerCase().includes('simulado') || prompt.toLowerCase().includes('treino')) {
        reply = 'Preparei uma bateria adaptativa de questões no modo Treino para calibrar sua retenção de hoje.';
      } else if (prompt.toLowerCase().includes('mapa') || prompt.toLowerCase().includes('conceito')) {
        reply = 'O nó correspondente no Mapa Neural foi realçado com conexões multidisciplinares.';
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
    }, 600);
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

  const daysOfWeek = [
    { label: 'S', active: true, done: true },
    { label: 'T', active: true, done: true },
    { label: 'Q', active: true, done: true },
    { label: 'Q', active: true, done: true },
    { label: 'S', active: false, done: false },
    { label: 'S', active: false, done: false },
    { label: 'D', active: false, done: false },
  ];

  const currentPlan = FOCUS_PLANS.find(p => p.id === activeFocus.level) || FOCUS_PLANS[1];
  const progressPercent = Math.min(100, Math.round((activeFocus.completed / activeFocus.total) * 100));

  return (
    <div className="flex-1 flex flex-col gap-6 overflow-y-auto pb-24 pr-1 relative select-none text-slate-900 dark:text-slate-100">
      
      {/* Grid Principal do Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        
        {/* COLUNA ESQUERDA / PRINCIPAL: 8 Colunas */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* BANNER COUNTDOWN COM BOTÃO DE INICIAR FOCO EM DESTAQUE */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative rounded-[32px] overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 p-8 flex items-center shadow-lg shadow-blue-500/10 min-h-[200px]"
          >
            <div className="z-10 flex flex-col max-w-xl">
              <span className="text-blue-200 text-xs font-bold uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
                Contagem Regressiva ENEM 2026
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-1.5 tracking-tight font-display">
                Faltam 14 dias para o Exame
              </h2>
              <p className="text-blue-100 text-sm font-medium leading-relaxed">
                Mantenha o ritmo de absorção na <strong className="text-white font-bold">Plataforma Mendonça</strong>. Você já revisou <strong className="text-white font-bold">72% da matéria prioritária</strong> com 94% de retenção.
              </p>
              
              <div className="mt-5 flex flex-wrap items-center gap-3">
                {/* BOTÃO FOCO / INICIAR FOCO EM DESTAQUE */}
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setIsFocusModalOpen(true)}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all shadow-lg shadow-amber-400/20 flex items-center gap-2 cursor-pointer"
                >
                  <Target className="w-4 h-4 text-slate-950" />
                  <span>Modo Foco</span>
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

          {/* CARD DE METAS DE FOCO SEMANAL ATIVO */}
          <div className="bg-white dark:bg-slate-900 rounded-[28px] p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-lg hover:shadow-blue-500/30 hover:border-blue-300 dark:hover:border-blue-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden transition-all duration-300">
            <div className="flex items-start gap-4">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                style={{ backgroundColor: `${currentPlan.color}15`, color: currentPlan.color }}
              >
                <Target className="w-6 h-6" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400">
                    Desafio Semanal Ativo
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{currentPlan.name} ({currentPlan.questionsTotal} Questões)</span>
                </div>
                <h3 className="text-base font-bold font-display text-slate-900 dark:text-white mt-1">
                  Progresso: {activeFocus.completed} de {activeFocus.total} questões resolvidas
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">
                  Faltam {activeFocus.daysLeft} dias para concluir este ciclo semanal • Meta diária de {currentPlan.dailyAverage}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-2.5 shrink-0">
              <div className="w-full sm:w-44 flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  <span>Concluído</span>
                  <span className="text-blue-600 dark:text-blue-400">{progressPercent}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFocusModalOpen(true)}
                  className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Alterar Foco
                </button>
                <button
                  onClick={() => onNavigate('treino')}
                  className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1 hover:shadow-md hover:shadow-blue-500/30"
                >
                  Resolver Agora <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* MATERIAIS RECENTES (High Density 3-card grid) */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 font-display flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Materiais Recentes
              </h3>
              <button 
                onClick={() => onNavigate('caderno')}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 text-xs font-bold cursor-pointer hover:underline flex items-center gap-1"
              >
                Ver tudo <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Card 1 */}
              <motion.div 
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate('caderno')}
                className="bg-white dark:bg-slate-900 p-5 rounded-[24px] border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Cálculo Diferencial
                  </h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-400 uppercase mt-1 tracking-wider font-semibold">
                    Aula 04 • 15 min atrás
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-300 font-medium">
                  <span>92% absorvido</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold group-hover:translate-x-0.5 transition-transform">Abrir →</span>
                </div>
              </motion.div>

              {/* Card 2 */}
              <motion.div 
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate('caderno')}
                className="bg-white dark:bg-slate-900 p-5 rounded-[24px] border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-amber-300 dark:hover:border-amber-600 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    História Colonial
                  </h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-400 uppercase mt-1 tracking-wider font-semibold">
                    Caderno • Ontem
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-300 font-medium">
                  <span>78% absorvido</span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold group-hover:translate-x-0.5 transition-transform">Abrir →</span>
                </div>
              </motion.div>

              {/* Card 3 */}
              <motion.div 
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate('treino')}
                className="bg-white dark:bg-slate-900 p-5 rounded-[24px] border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Atom className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    Física Quântica
                  </h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-400 uppercase mt-1 tracking-wider font-semibold">
                    Treino • 2h atrás
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-300 font-medium">
                  <span>84% precisão</span>
                  <span className="text-purple-600 dark:text-purple-400 font-bold group-hover:translate-x-0.5 transition-transform">Treinar →</span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* MAPA DE CONHECIMENTO WIDGET INTERATIVO */}
          <motion.div 
            whileHover={{ y: -2 }}
            onClick={() => onNavigate('mapa')}
            className="bg-white dark:bg-slate-900 flex-1 min-h-[200px] rounded-[32px] border border-slate-200/80 dark:border-slate-800 p-6 flex flex-col relative overflow-hidden shadow-2xs hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 cursor-pointer group"
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
          
          {/* STREAK TRACKER CARD */}
          <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs hover:shadow-lg hover:shadow-blue-500/30 hover:border-blue-300 dark:hover:border-blue-700/60 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100 font-display">Ofensiva Semanal</span>
              </div>
              <span className="text-xs text-slate-400 dark:text-slate-400 font-semibold uppercase tracking-wider">Nível 4</span>
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
              <span>Meta diária: <strong>45 min</strong></span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{streakCount} dias seguidos 🔥</span>
            </div>
          </div>

          {/* AI GLASSMORPHISM CHAT ASSISTANT */}
          <div 
            className="flex-1 rounded-[32px] border border-slate-200/80 dark:border-slate-800 p-6 relative overflow-hidden shadow-xl bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl flex flex-col min-h-[380px] hover:shadow-lg hover:shadow-blue-500/30 hover:border-blue-300 dark:hover:border-blue-700/60 transition-all duration-300"
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
                    <p>{msg.text}</p>
                    <span className={`block text-[9px] mt-1 font-medium ${msg.sender === 'ai' ? 'text-slate-400 dark:text-slate-400' : 'text-blue-200'}`}>
                      {msg.time}
                    </span>
                  </div>
                ))}
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
      {/* MODAL INTERATIVO: MODO FOCO (FÁCIL 50q, MÉDIO 100q, DIFÍCIL 200q) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isFocusModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFocusModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[36px] shadow-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 overflow-hidden z-10 max-h-[90vh] flex flex-col text-slate-900 dark:text-slate-100"
            >
              {/* Header do Modal */}
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

              {/* Corpo com os 3 Níveis de Escolha de Foco */}
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
                        {/* Tag Superior */}
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

                        {/* Título & Meta de Questões */}
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

                        {/* Métricas do Plano */}
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

                {/* Detalhamento do que precisa fazer no nível selecionado */}
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

              {/* Rodapé com Ação */}
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

      {/* FLOATING TRAINING PANEL MINIMIZED BAR */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-800 text-white px-6 sm:px-8 py-3.5 rounded-full shadow-2xl flex items-center gap-4 sm:gap-6 border border-slate-800 dark:border-slate-700 z-40 max-w-[92vw]"
      >
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-pulse shadow-sm shadow-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider whitespace-nowrap">Treino Ativo</span>
        </div>
        <div className="h-4 w-px bg-slate-700 hidden sm:block" />
        <div className="flex flex-col hidden sm:flex">
          <span className="text-[10px] text-slate-400 font-bold tracking-wider">QUESTÃO 12/45 • FÍSICA</span>
          <div className="w-28 sm:w-36 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
            <div className="w-1/3 h-full bg-gradient-to-r from-blue-400 to-cyan-400" />
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate('treino')}
          className="bg-white text-slate-900 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-cyan-400 hover:text-slate-950 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
        >
          IR AO TREINO
        </motion.button>
      </motion.div>
    </div>
  );
};
