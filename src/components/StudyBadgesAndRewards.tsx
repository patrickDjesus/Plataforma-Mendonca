import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, 
  Flame, 
  Zap, 
  Trophy, 
  Lock, 
  CheckCircle2, 
  X, 
  ChevronRight, 
  Crown 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import badgeChamaInicial from '../assets/images/badges/chama_inicial.png';
import badgeRitmoInabalavel from '../assets/images/badges/ritmo_inabalavel.png';
import badgeMenteDeTitanio from '../assets/images/badges/mente_de_titanio.png';
import badgeLendaDaConstancia from '../assets/images/badges/lenda_da_constancia.png';
import badgePrimeiroPasso from '../assets/images/badges/primeiro_passo.png';
import badgeCenturiaoAnalitico from '../assets/images/badges/centuriao_analitico.png';

// Imagens "capa" de cada conquista (chave = id da conquista). Faltantes => emoji.
const BADGE_IMAGES: Record<string, string> = {
  'streak-3': badgeChamaInicial,
  'streak-7': badgeRitmoInabalavel,
  'streak-14': badgeMenteDeTitanio,
  'streak-30': badgeLendaDaConstancia,
  'quest-10': badgePrimeiroPasso,
  'quest-50': badgeCenturiaoAnalitico,
};

export interface StudyBadge {
  id: string;
  title: string;
  description: string;
  category: 'streak' | 'questions' | 'accuracy' | 'xp';
  tier: 'bronze' | 'silver' | 'gold' | 'diamond' | 'legendary';
  icon: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  xpReward: number;
  titleReward?: string;
  unlocked: boolean;
  unlockedAt?: string;
}

interface StudyBadgesAndRewardsProps {
  streakCount: number;
  totalAnswered: number;
  totalCorrect: number;
  accuracy: number;
  totalXp: number;
  onNavigateToTreino?: () => void;
}

export const StudyBadgesAndRewards: React.FC<StudyBadgesAndRewardsProps> = ({
  streakCount,
  totalAnswered,
  accuracy,
  totalXp,
  onNavigateToTreino
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<StudyBadge | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  // Lista dinâmica de todas as medalhas e verificação de critérios
  const badges: StudyBadge[] = useMemo(() => {
    const list: StudyBadge[] = [
      // STREAKS
      {
        id: 'streak-3',
        title: 'Chama Inicial',
        description: 'Mantenha 3 dias seguidos de estudo ativo na plataforma.',
        category: 'streak',
        tier: 'bronze',
        icon: '🔥',
        currentValue: streakCount,
        targetValue: 3,
        unit: 'dias',
        xpReward: 150,
        titleReward: 'Estudante Focado',
        unlocked: streakCount >= 3,
      },
      {
        id: 'streak-7',
        title: 'Ritmo Inabalável',
        description: 'Complete 1 semana ininterrupta de exercícios e revisões.',
        category: 'streak',
        tier: 'silver',
        icon: '⚡',
        currentValue: streakCount,
        targetValue: 7,
        unit: 'dias',
        xpReward: 350,
        titleReward: 'Semana Perfeita',
        unlocked: streakCount >= 7,
      },
      {
        id: 'streak-14',
        title: 'Mente de Titânio',
        description: 'Alcance 14 dias seguidos fortalecendo os caminhos neurais.',
        category: 'streak',
        tier: 'gold',
        icon: '🛡️',
        currentValue: streakCount,
        targetValue: 14,
        unit: 'dias',
        xpReward: 700,
        titleReward: 'Guardião da Rotina',
        unlocked: streakCount >= 14,
      },
      {
        id: 'streak-30',
        title: 'Lenda da Constância',
        description: 'Supere a barreira dos 30 dias de neuroplasticidade contínua.',
        category: 'streak',
        tier: 'legendary',
        icon: '👑',
        currentValue: streakCount,
        targetValue: 30,
        unit: 'dias',
        xpReward: 2000,
        titleReward: 'Mestre da Disciplina',
        unlocked: streakCount >= 30,
      },

      // QUESTÕES
      {
        id: 'quest-10',
        title: 'Primeiro Passo',
        description: 'Resolva seus primeiros 10 exercícios no modo Treino.',
        category: 'questions',
        tier: 'bronze',
        icon: '🎯',
        currentValue: totalAnswered,
        targetValue: 10,
        unit: 'questões',
        xpReward: 100,
        titleReward: 'Iniciante Curioso',
        unlocked: totalAnswered >= 10,
      },
      {
        id: 'quest-50',
        title: 'Centurião Analítico',
        description: 'Complete 50 questões comentadas no banco de alta frequência.',
        category: 'questions',
        tier: 'silver',
        icon: '🚀',
        currentValue: totalAnswered,
        targetValue: 50,
        unit: 'questões',
        xpReward: 300,
        titleReward: 'Resolvedor Ágil',
        unlocked: totalAnswered >= 50,
      },
      {
        id: 'quest-100',
        title: 'Mestre do Banco',
        description: 'Supere 100 questões com mapeamento de acertos e erros.',
        category: 'questions',
        tier: 'gold',
        icon: '📚',
        currentValue: totalAnswered,
        targetValue: 100,
        unit: 'questões',
        xpReward: 800,
        titleReward: 'Gabaritador',
        unlocked: totalAnswered >= 100,
      },
      {
        id: 'quest-300',
        title: 'Titã dos Simulados',
        description: 'Acumule mais de 300 resoluções ativas em todas as matérias.',
        category: 'questions',
        tier: 'legendary',
        icon: '💎',
        currentValue: totalAnswered,
        targetValue: 300,
        unit: 'questões',
        xpReward: 2500,
        titleReward: 'Enciclopédia Humana',
        unlocked: totalAnswered >= 300,
      },

      // PRECISÃO
      {
        id: 'acc-80',
        title: 'Mira Laser',
        description: 'Alcance precisão de pelo menos 80% (mínimo de 15 questões respondidas).',
        category: 'accuracy',
        tier: 'silver',
        icon: '🎯',
        currentValue: totalAnswered >= 15 ? accuracy : 0,
        targetValue: 80,
        unit: '% precisão',
        xpReward: 400,
        titleReward: 'Sniper de Questões',
        unlocked: totalAnswered >= 15 && accuracy >= 80,
      },
      {
        id: 'acc-90',
        title: 'Precisão Cirúrgica',
        description: 'Atinja 90%+ de assertividade com ao menos 25 questões no histórico.',
        category: 'accuracy',
        tier: 'diamond',
        icon: '✨',
        currentValue: totalAnswered >= 25 ? accuracy : 0,
        targetValue: 90,
        unit: '% precisão',
        xpReward: 1200,
        titleReward: 'Mente Cirúrgica',
        unlocked: totalAnswered >= 25 && accuracy >= 90,
      },

      // XP / RANK
      {
        id: 'xp-500',
        title: 'Calouro Dedicado',
        description: 'Acumule seus primeiros 500 XP na Plataforma Mendonça.',
        category: 'xp',
        tier: 'bronze',
        icon: '🌱',
        currentValue: totalXp,
        targetValue: 500,
        unit: 'XP',
        xpReward: 150,
        titleReward: 'Aluno Promissor',
        unlocked: totalXp >= 500,
      },
      {
        id: 'xp-2000',
        title: 'Especialista Neuro',
        description: 'Conquiste 2.000 XP acumulados nos treinos e desafios diários.',
        category: 'xp',
        tier: 'gold',
        icon: '🧠',
        currentValue: totalXp,
        targetValue: 2000,
        unit: 'XP',
        xpReward: 600,
        titleReward: 'Neuro-Especialista',
        unlocked: totalXp >= 2000,
      },
      {
        id: 'xp-5000',
        title: 'Grão-Mestre Mendonça',
        description: 'Alcance o marco de 5.000 XP e integre o topo dos vestibulandos.',
        category: 'xp',
        tier: 'legendary',
        icon: '👑',
        currentValue: totalXp,
        targetValue: 5000,
        unit: 'XP',
        xpReward: 3000,
        titleReward: 'Lenda da Plataforma',
        unlocked: totalXp >= 5000,
      }
    ];

    return list;
  }, [streakCount, totalAnswered, accuracy, totalXp]);

  const unlockedCount = badges.filter(b => b.unlocked).length;
  const totalCount = badges.length;
  const overallProgress = Math.round((unlockedCount / totalCount) * 100);

  // Encontra a próxima medalha mais perto de desbloquear
  const nextBadge = useMemo(() => {
    const locked = badges.filter(b => !b.unlocked);
    if (locked.length === 0) return null;
    
    return locked.reduce((closest, badge) => {
      const progA = Math.min(1, badge.currentValue / badge.targetValue);
      const progB = closest ? Math.min(1, closest.currentValue / closest.targetValue) : -1;
      return progA > progB ? badge : closest;
    }, locked[0]);
  }, [badges]);

  const handleOpenBadgeDetails = (badge: StudyBadge) => {
    setSelectedBadge(badge);
    if (badge.unlocked) {
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch { /* ignored */ }
    }
  };

  const filteredBadges = useMemo(() => {
    if (activeFilter === 'unlocked') return badges.filter(b => b.unlocked);
    if (activeFilter === 'locked') return badges.filter(b => !b.unlocked);
    return badges;
  }, [badges, activeFilter]);

  const getTierColor = (tier: StudyBadge['tier']) => {
    switch (tier) {
      case 'bronze': return {
        bg: 'from-amber-700/20 to-orange-800/20',
        border: 'border-amber-700/40 dark:border-amber-600/40',
        text: 'text-amber-700 dark:text-amber-400',
        badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
        glow: 'shadow-amber-500/10'
      };
      case 'silver': return {
        bg: 'from-slate-400/20 to-blue-500/20',
        border: 'border-slate-300 dark:border-slate-600',
        text: 'text-blue-600 dark:text-blue-300',
        badge: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
        glow: 'shadow-blue-500/10'
      };
      case 'gold': return {
        bg: 'from-yellow-400/20 to-amber-500/20',
        border: 'border-yellow-400/50 dark:border-yellow-500/50',
        text: 'text-yellow-600 dark:text-yellow-400',
        badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-300',
        glow: 'shadow-yellow-500/20'
      };
      case 'diamond': return {
        bg: 'from-cyan-400/20 to-blue-600/20',
        border: 'border-cyan-400/60 dark:border-cyan-500/60',
        text: 'text-cyan-600 dark:text-cyan-300',
        badge: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300',
        glow: 'shadow-cyan-500/25'
      };
      case 'legendary': return {
        bg: 'from-purple-500/20 via-pink-500/20 to-amber-500/20',
        border: 'border-purple-400/70 dark:border-purple-500/70',
        text: 'text-purple-600 dark:text-purple-300',
        badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300',
        glow: 'shadow-purple-500/30'
      };
    }
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* CARD PRINCIPAL DE MEDALHAS & RECOMPENSAS NO DASHBOARD */}
      {/* ========================================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs hover:border-blue-300 dark:hover:border-blue-700/60 hover:shadow-md transition-all duration-300 flex flex-col gap-4 relative overflow-hidden"
      >
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/10 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-purple-400/10 dark:bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 shadow-md shadow-amber-400/20">
              <Award className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
                  Medalhas & Conquistas de Estudo
                </h3>
                <span className="bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-300/60 dark:border-amber-700">
                  {unlockedCount}/{totalCount} Conquistadas
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Desbloqueie insígnias exclusivas mantendo seus streaks e resolvendo simulados
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Ver Vitrine Completa</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Barra de Progresso Geral para Próxima Patente */}
        <div className="z-10 bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3.5 border border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:flex-1 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                Progresso da Temporada
              </span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                {overallProgress}% ({unlockedCount} de {totalCount})
              </span>
            </div>
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${overallProgress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 rounded-full shadow-xs"
              />
            </div>
          </div>

          {nextBadge && (
            <div className="w-full sm:w-auto flex items-center gap-2.5 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs shrink-0">
              {BADGE_IMAGES[nextBadge.id] ? (
                <img
                  src={BADGE_IMAGES[nextBadge.id]}
                  alt={nextBadge.title}
                  className="w-14 h-14 object-cover rounded-xl border border-slate-200 dark:border-slate-700 grayscale opacity-75 shrink-0"
                />
              ) : (
                <span className="text-3xl shrink-0">{nextBadge.icon}</span>
              )}
              <div className="text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Próxima Conquista:</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block max-w-[130px]">
                  {nextBadge.title}
                </span>
              </div>
              <span className="text-[11px] font-mono font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-lg border border-blue-200 dark:border-blue-800">
                {nextBadge.currentValue}/{nextBadge.targetValue}
              </span>
            </div>
          )}
        </div>

        {/* Carrossel / Grid Rápido de Medalhas em Destaque */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 z-10">
          {badges.slice(0, 6).map((badge) => {
            const colors = getTierColor(badge.tier);
            const percent = Math.min(100, Math.round((badge.currentValue / badge.targetValue) * 100));

            return (
              <motion.div
                key={badge.id}
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleOpenBadgeDetails(badge)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-between text-center relative overflow-hidden min-h-[160px] select-none ${
                  badge.unlocked
                    ? `bg-gradient-to-b ${colors.bg} ${colors.border} shadow-sm ${colors.glow}`
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-700/60 opacity-65 hover:opacity-100'
                }`}
              >
                {badge.unlocked ? (
                  <div className="absolute top-1.5 right-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                ) : (
                  <div className="absolute top-1.5 right-1.5">
                    <Lock className="w-3 h-3 text-slate-400" />
                  </div>
                )}

                {BADGE_IMAGES[badge.id] ? (
                  <div className="relative w-full flex items-center justify-center my-0.5">
                    <img
                      src={BADGE_IMAGES[badge.id]}
                      alt={badge.title}
                      className={`w-28 h-28 object-cover rounded-2xl border-2 transition-all duration-300 ${
                        badge.unlocked
                          ? 'border-amber-300/80 dark:border-amber-500/60 shadow-lg'
                          : 'grayscale opacity-70 border-slate-300/70 dark:border-slate-600'
                      }`}
                    />
                    {!badge.unlocked && (
                      <span className="absolute bottom-1.5 right-1.5 bg-slate-900/80 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md border border-white/20">
                        {badge.currentValue}/{badge.targetValue}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="text-3xl mt-1 filter drop-shadow-sm">
                    {badge.icon}
                  </div>
                )}

                <div className="w-full">
                  <h4 className="text-[11px] font-extrabold text-slate-900 dark:text-white truncate">
                    {badge.title}
                  </h4>
                  
                  {badge.unlocked ? (
                    <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                      +{badge.xpReward} XP Conquistado
                    </span>
                  ) : (
                    <div className="w-full mt-1 space-y-0.5">
                      <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full" 
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-mono text-slate-400 block text-right">
                        {badge.currentValue}/{badge.targetValue}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ========================================================================= */}
      {/* MODAL / VITRINE COMPLETA DE TODAS AS MEDALHAS */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[36px] shadow-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 overflow-hidden z-10 max-h-[90vh] flex flex-col text-slate-900 dark:text-slate-100"
            >
              {/* Header do Modal */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 shadow-md">
                    <Trophy className="w-5 h-5 fill-slate-950" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
                      Vitrine de Conquistas & Medalhas
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Acompanhe sua evolução e desbloqueie títulos honorários para o ranking
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Filtros de Categoria */}
              <div className="flex items-center justify-between gap-3 pt-4 pb-2">
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
                  <button
                    onClick={() => setActiveFilter('all')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      activeFilter === 'all'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Todas ({badges.length})
                  </button>
                  <button
                    onClick={() => setActiveFilter('unlocked')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      activeFilter === 'unlocked'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Desbloqueadas ({unlockedCount})
                  </button>
                  <button
                    onClick={() => setActiveFilter('locked')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      activeFilter === 'locked'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    A Conquistar ({badges.length - unlockedCount})
                  </button>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <Flame className="w-4 h-4 fill-amber-500" />
                  <span>Streak Atual: {streakCount} dias</span>
                </div>
              </div>

              {/* Grid Completo de Medalhas */}
              <div className="overflow-y-auto flex-1 py-4 pr-1 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {filteredBadges.map((badge) => {
                    const colors = getTierColor(badge.tier);
                    const percent = Math.min(100, Math.round((badge.currentValue / badge.targetValue) * 100));

                    return (
                      <motion.div
                        key={badge.id}
                        whileHover={{ y: -3 }}
                        onClick={() => handleOpenBadgeDetails(badge)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative ${
                          badge.unlocked
                            ? `bg-gradient-to-b ${colors.bg} ${colors.border} shadow-sm`
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/80 opacity-75 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2.5">
                          <div className="flex items-center gap-2.5">
                            {BADGE_IMAGES[badge.id] ? (
                              <div className="relative shrink-0">
                                <img
                                  src={BADGE_IMAGES[badge.id]}
                                  alt={badge.title}
                                  className={`w-20 h-20 object-cover rounded-2xl border-2 transition-all duration-300 ${
                                    badge.unlocked
                                      ? 'border-amber-300/80 dark:border-amber-500/60 shadow-lg'
                                      : 'grayscale opacity-70 border-slate-300/70 dark:border-slate-600'
                                  }`}
                                />
                                {!badge.unlocked && (
                                  <span className="absolute bottom-1 right-1 bg-slate-900/80 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md border border-white/20">
                                    {badge.currentValue}/{badge.targetValue}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-3xl filter drop-shadow-sm shrink-0">{badge.icon}</span>
                            )}
                            <div>
                              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                                {badge.title}
                              </h4>
                              <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full inline-block mt-0.5 ${colors.badge}`}>
                                {badge.tier}
                              </span>
                            </div>
                          </div>

                          {badge.unlocked ? (
                            <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4" />
                            </span>
                          ) : (
                            <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 flex items-center justify-center">
                              <Lock className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                          {badge.description}
                        </p>

                        <div className="mt-auto pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-500 dark:text-slate-400 font-medium">Recompensa:</span>
                            <span className="font-extrabold text-amber-600 dark:text-amber-400">
                              +{badge.xpReward} XP {badge.titleReward && `• "${badge.titleReward}"`}
                            </span>
                          </div>

                          {!badge.unlocked && (
                            <div className="space-y-1">
                              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-500 rounded-full"
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                              <div className="flex justify-between text-[9px] font-mono text-slate-400">
                                <span>Progresso:</span>
                                <span>{badge.currentValue} / {badge.targetValue} {badge.unit}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Rodapé do Modal */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Novas medalhas são desbloqueadas automaticamente conforme você estuda.
                </p>
                {onNavigateToTreino && (
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      onNavigateToTreino();
                    }}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer flex items-center gap-2"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Praticar no Treino Agora</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL ESPECÍFICO DE DETALHES DE UMA MEDALHA SELECIONADA */}
      <AnimatePresence>
        {selectedBadge && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBadge(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl z-10 text-center space-y-4"
            >
              {BADGE_IMAGES[selectedBadge.id] ? (
                <div className="relative my-2 inline-block">
                  <img
                    src={BADGE_IMAGES[selectedBadge.id]}
                    alt={selectedBadge.title}
                    className={`w-44 h-44 object-cover rounded-3xl border-2 shadow-xl mx-auto transition-all duration-300 ${
                      selectedBadge.unlocked
                        ? 'border-amber-300 dark:border-amber-500/60 shadow-amber-400/20'
                        : 'grayscale opacity-65 border-slate-300 dark:border-slate-600'
                    }`}
                  />
                </div>
              ) : (
                <div className="text-5xl my-2 filter drop-shadow-md">
                  {selectedBadge.icon}
                </div>
              )}

              <div>
                <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full inline-block mb-1.5 ${getTierColor(selectedBadge.tier).badge}`}>
                  Nível {selectedBadge.tier}
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white font-display">
                  {selectedBadge.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {selectedBadge.description}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-700/60 space-y-2 text-xs text-left">
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className={`font-bold ${selectedBadge.unlocked ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {selectedBadge.unlocked ? '✓ Desbloqueada' : '⏳ Em progresso'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Recompensa de XP:</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">+{selectedBadge.xpReward} XP</span>
                </div>
                {selectedBadge.titleReward && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Título Honorário:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">"{selectedBadge.titleReward}"</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Requisito:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedBadge.currentValue} / {selectedBadge.targetValue} {selectedBadge.unit}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedBadge(null)}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Fechar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
