import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Flame, 
  Zap, 
  Crown, 
  Medal, 
  Users, 
  Globe, 
  ShieldCheck, 
  Swords, 
  Search, 
  Sparkles 
} from 'lucide-react';
import { ScreenId } from '../types/design';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { subscribeToLeaderboard } from '../services/supabase';

export interface LeaderboardUser {

  id: string;
  rank: number;
  name: string;
  handle: string;
  avatarBg: string;
  avatarEmoji: string;
  schoolOrGoal: string;
  score: number;
  streakDays: number;
  accuracy: number;
  totalQuestions: number;
  league: 'Diamante' | 'Platina' | 'Ouro' | 'Prata';
  isCurrentUser?: boolean;
  isFriend?: boolean;
  status: 'online' | 'jogando' | 'offline';
  favoriteSubject: string;
  weeklyXp: number;
  enduranceRecordSecs: number;
}

interface GlobalLeaderboardProps {
  onStartChallenge: (mode?: string) => void;
  onNavigate: (screen: ScreenId) => void;
}

export const GlobalLeaderboard: React.FC<GlobalLeaderboardProps> = ({
  onStartChallenge,
  onNavigate: _onNavigate
}) => {
  const { userProfile, currentUser } = useAuth();
  // Filtros
  const [scope, setScope] = useState<'global' | 'friends' | 'league'>('global');
  const [period, setPeriod] = useState<'weekly' | 'allTime' | 'endurance'>('weekly');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionToast, setActionToast] = useState<string | null>(null);
  const [supabaseEntries, setSupabaseEntries] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToLeaderboard((entries) => {
      if (entries && entries.length > 0) {
        setSupabaseEntries(entries);
      }
    });
    return () => unsubscribe();
  }, []);

  const showToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 3000);
  };

    // Competidores reais vindos do Supabase (ranking global)
  const competitors: LeaderboardUser[] = useMemo(() => {
    const displayName = userProfile?.displayName || currentUser?.displayName || 'Você';

    const list: LeaderboardUser[] = supabaseEntries.map((fe, index) => {
      const entryId = fe.userId || fe.id;
      const isMe = entryId === currentUser?.id;
      const name = isMe ? `${displayName} (Você)` : (fe.displayName || fe.name || 'Estudante');
      const score = fe.score || fe.totalXp || 0;
      const leagueName: 'Diamante' | 'Platina' | 'Ouro' | 'Prata' =
        score > 8000 ? 'Diamante' : score > 4000 ? 'Platina' : score > 1500 ? 'Ouro' : 'Prata';
      return {
        id: entryId || `fs-${index}`,
        rank: index + 1,
        name,
        handle: fe.handle || `@${name.toLowerCase().replace(/\s+/g, '')}`,
        avatarBg: isMe ? 'from-emerald-400 to-teal-600' : (fe.avatarBg || 'from-indigo-400 to-purple-600'),
        avatarEmoji: isMe ? '🔥' : (fe.avatarEmoji || '⭐'),
        schoolOrGoal: fe.schoolOrGoal || fe.goal || 'Preparação ENEM & Vestibulares',
        score,
        weeklyXp: fe.weeklyXp || 0,
        streakDays: fe.streak || fe.streakDays || 1,
        accuracy: fe.accuracy ?? 0,
        totalQuestions: fe.totalAnswered || fe.totalQuestions || 0,
        league: leagueName,
        isCurrentUser: isMe,
        isFriend: false,
        status: fe.status || 'online',
        favoriteSubject: fe.favoriteSubject || 'Treino Geral',
        enduranceRecordSecs: fe.enduranceRecordSecs || 120
      };
    });

    const sorted = [...list].sort((a, b) => {
      if (period === 'weekly') {
        return b.weeklyXp - a.weeklyXp;
      } else if (period === 'endurance') {
        return b.enduranceRecordSecs - a.enduranceRecordSecs;
      } else {
        return b.score - a.score;
      }
    });

    return sorted.map((u, idx) => ({
      ...u,
      rank: idx + 1
    }));
  }, [supabaseEntries, currentUser, userProfile, period]);

  // Lista filtrada por busca e escopo
  const filteredUsers = useMemo(() => {
    return competitors.filter(user => {
      if (scope === 'friends' && !user.isFriend && !user.isCurrentUser) return false;
      if (scope === 'league' && user.league !== 'Diamante') return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchName = user.name.toLowerCase().includes(q);
        const matchHandle = user.handle.toLowerCase().includes(q);
        const matchSchool = user.schoolOrGoal.toLowerCase().includes(q);
        const matchSubject = user.favoriteSubject.toLowerCase().includes(q);
        return matchName || matchHandle || matchSchool || matchSubject;
      }
      return true;
    });
  }, [competitors, scope, searchQuery]);

  const currentUserData = competitors.find(u => u.isCurrentUser);
  const top3 = filteredUsers.slice(0, 3);

  const handleCheerFriend = (user: LeaderboardUser) => {
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#F59E0B', '#EF4444', '#8B5CF6', '#10B981']
      });
    } catch { /* ignored */ }
    showToast(`🔥 Você enviou fogo de incentivo para ${user.name}!`);
  };

  const handleChallenge = (user: LeaderboardUser) => {
    showToast(`⚔️ Desafio enviado para ${user.name}! O treino foi iniciado.`);
    setTimeout(() => {
      onStartChallenge(period === 'endurance' ? 'endurance' : 'enem_formulas');
    }, 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Toast de Notificação */}
      <AnimatePresence>
        {actionToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white border border-amber-500/40 shadow-2xl text-xs font-bold"
          >
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{actionToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. HERO BANNER DO RANKING GLOBAL */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-amber-950/70 to-slate-900 border border-amber-500/30 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
              <Crown className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
              <span>Liga Diamante Sináptica • Temporada Ativa</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white flex items-center gap-2.5">
              <span>Ranking Global & Comunidade</span>
              <Trophy className="w-6 h-6 text-amber-400 hidden sm:inline-block" />
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Dispute o topo com estudantes de todo o Brasil. Mantenha suas sequências de fogo diárias, acumule XP nos modos Survival & Endurance e suba de divisão a cada fechamento semanal.
            </p>
          </div>

          {/* Card Resumo do Usuário no Banner */}
          {currentUserData && (
            <div className="shrink-0 p-4 rounded-2xl bg-white/10 dark:bg-slate-900/60 border border-amber-500/30 backdrop-blur-md space-y-2 min-w-[240px]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wider">
                  Sua Posição na Liga
                </span>
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-amber-500 text-slate-900">
                  #{currentUserData.rank}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Sequência Atual:</span>
                  <span className="font-black text-amber-400 font-mono flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-amber-400" />
                    {currentUserData.streakDays} dias
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">XP Competitivo:</span>
                  <span className="font-black text-white font-mono">
                    {period === 'weekly' ? currentUserData.weeklyXp : currentUserData.score} XP
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Grade decorativa */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      </div>

      {/* 2. FILTROS & NAVEGAÇÃO DE ESCOPO */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Escopo de Competidores */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <button
              type="button"
              onClick={() => setScope('global')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                scope === 'global'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-cyan-500" />
              <span>Global (Todos)</span>
            </button>

            <button
              type="button"
              onClick={() => setScope('friends')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                scope === 'friends'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-purple-500" />
              <span>Amigos & Turma ({competitors.filter(u => u.isFriend || u.isCurrentUser).length})</span>
            </button>

            <button
              type="button"
              onClick={() => setScope('league')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                scope === 'league'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              <span>Divisão Diamante</span>
            </button>
          </div>

          {/* Período / Modalidade */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
              <button
                type="button"
                onClick={() => setPeriod('weekly')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  period === 'weekly'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Semanal
              </button>
              <button
                type="button"
                onClick={() => setPeriod('allTime')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  period === 'allTime'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Geral (All-time)
              </button>
              <button
                type="button"
                onClick={() => setPeriod('endurance')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  period === 'endurance'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Zap className="w-3 h-3" />
                <span>Endurance</span>
              </button>
            </div>

            {/* Campo de Busca */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar competidor ou curso..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 w-full sm:w-56"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. PÓDIO TOP 3 DESTACADO */}
      {filteredUsers.length >= 3 && searchQuery.trim() === '' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          {/* 2º Lugar */}
          {top3[1] && (
            <motion.div
              whileHover={{ y: -4 }}
              className="order-2 md:order-1 p-5 rounded-3xl bg-gradient-to-b from-slate-100 to-white dark:from-slate-800/80 dark:to-slate-900 border border-slate-300 dark:border-slate-700 shadow-sm relative flex flex-col justify-between space-y-4"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-black flex items-center gap-1 border border-slate-400/50 shadow-xs">
                <Medal className="w-3.5 h-3.5 text-slate-500" />
                <span>2º LUGAR</span>
              </div>

              <div className="pt-2 text-center space-y-2">
                <div className="relative inline-block mx-auto">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${top3[1].avatarBg} flex items-center justify-center text-2xl shadow-md ring-4 ring-slate-300 dark:ring-slate-700`}>
                    {top3[1].avatarEmoji}
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" title="Online" />
                </div>

                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white font-display">
                    {top3[1].name}
                  </h4>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    {top3[1].schoolOrGoal}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">Pontuação:</span>
                  <span className="font-black text-slate-900 dark:text-white font-mono">
                    {period === 'weekly' ? top3[1].weeklyXp : top3[1].score} XP
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">Sequência:</span>
                  <span className="font-extrabold text-amber-500 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-amber-500" />
                    {top3[1].streakDays} dias
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">Precisão:</span>
                  <span className="font-bold text-emerald-500">{top3[1]?.accuracy ?? 0}%</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleCheerFriend(top3[1])}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>Apoiar</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleChallenge(top3[1])}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>Desafiar</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* 1º Lugar (Campeão - Centro Maior) */}
          {top3[0] && (
            <motion.div
              whileHover={{ y: -6 }}
              className="order-1 md:order-2 p-6 rounded-3xl bg-gradient-to-b from-amber-50 via-white to-amber-50/40 dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-900 border-2 border-amber-400 dark:border-amber-500/60 shadow-lg shadow-amber-500/10 relative flex flex-col justify-between space-y-4 md:-translate-y-3"
            >
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 text-xs font-black flex items-center gap-1.5 border border-amber-300 shadow-md animate-pulse">
                <Crown className="w-4 h-4 fill-slate-900" />
                <span>1º LUGAR • LÍDER</span>
              </div>

              <div className="pt-3 text-center space-y-2">
                <div className="relative inline-block mx-auto">
                  <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${top3[0].avatarBg} flex items-center justify-center text-3xl shadow-xl ring-4 ring-amber-400 dark:ring-amber-500`}>
                    {top3[0].avatarEmoji}
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 flex items-center justify-center text-[9px] text-white font-bold" title="Online">
                    ✓
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white font-display">
                    {top3[0].name}
                  </h4>
                  <span className="text-xs text-amber-700 dark:text-amber-300 font-bold block">
                    {top3[0].schoolOrGoal}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-100/50 dark:bg-amber-950/40 border border-amber-300/60 dark:border-amber-800/60 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400 text-[11px] font-bold">XP Acumulado:</span>
                  <span className="font-black text-amber-600 dark:text-amber-400 font-mono text-sm">
                    {period === 'weekly' ? top3[0].weeklyXp : top3[0].score} XP
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400 text-[11px] font-bold">Sequência Hebbiana:</span>
                  <span className="font-black text-amber-500 flex items-center gap-1">
                    <Flame className="w-4 h-4 fill-amber-500" />
                    {top3[0].streakDays} dias seguidos
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400 text-[11px] font-bold">Taxa de Precisão:</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">{top3[0]?.accuracy ?? 0}%</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleCheerFriend(top3[0])}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900/80 text-amber-900 dark:text-amber-200 text-xs font-extrabold transition-all cursor-pointer"
                >
                  <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Apoiar Líder</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleChallenge(top3[0])}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-900 font-black text-xs shadow-md transition-all cursor-pointer"
                >
                  <Swords className="w-4 h-4" />
                  <span>Desafiar Líder</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* 3º Lugar */}
          {top3[2] && (
            <motion.div
              whileHover={{ y: -4 }}
              className="order-3 md:order-3 p-5 rounded-3xl bg-gradient-to-b from-slate-100 to-white dark:from-slate-800/80 dark:to-slate-900 border border-slate-300 dark:border-slate-700 shadow-sm relative flex flex-col justify-between space-y-4"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-700 text-white text-[11px] font-black flex items-center gap-1 border border-amber-600 shadow-xs">
                <Medal className="w-3.5 h-3.5 text-amber-300" />
                <span>3º LUGAR</span>
              </div>

              <div className="pt-2 text-center space-y-2">
                <div className="relative inline-block mx-auto">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${top3[2].avatarBg} flex items-center justify-center text-2xl shadow-md ring-4 ring-amber-700/40`}>
                    {top3[2].avatarEmoji}
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-400 ring-2 ring-white dark:ring-slate-900" title="Offline" />
                </div>

                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white font-display">
                    {top3[2].name}
                  </h4>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    {top3[2].schoolOrGoal}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">Pontuação:</span>
                  <span className="font-black text-slate-900 dark:text-white font-mono">
                    {period === 'weekly' ? top3[2].weeklyXp : top3[2].score} XP
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">Sequência:</span>
                  <span className="font-extrabold text-amber-500 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-amber-500" />
                    {top3[2].streakDays} dias
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">Precisão:</span>
                  <span className="font-bold text-emerald-500">{top3[2]?.accuracy ?? 0}%</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleCheerFriend(top3[2])}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>Apoiar</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleChallenge(top3[2])}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>Desafiar</span>
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* 4. TABELA COMPLETA DE CLASSIFICAÇÃO */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-display">
                Classificação Geral da Temporada
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mostrando {filteredUsers.length} competidores ativos na categoria selecionada.
              </p>
            </div>
          </div>

          <span className="text-xs font-extrabold px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {period === 'weekly' ? 'Reset em 2d 14h' : 'Atualizado em tempo real'}
          </span>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <Users className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Nenhum competidor encontrado para os filtros selecionados.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredUsers.map((user) => {
              const isTop3 = user.rank <= 3;
              const isUser = user.isCurrentUser;

              return (
                <motion.div
                  key={user.id}
                  whileHover={{ scale: 1.01 }}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 ${
                    isUser
                      ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-400 dark:border-amber-500/60 ring-2 ring-amber-400/30 shadow-sm'
                      : isTop3
                      ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/80'
                      : 'bg-white dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-800'
                  }`}
                >
                  {/* Lado Esquerdo: Posição, Avatar, Dados do Aluno */}
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div className="w-8 text-center shrink-0">
                      {user.rank === 1 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-amber-400 text-slate-900 font-black text-xs shadow-xs">
                          🥇
                        </span>
                      ) : user.rank === 2 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-white font-black text-xs shadow-xs">
                          🥈
                        </span>
                      ) : user.rank === 3 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-amber-700 text-white font-black text-xs shadow-xs">
                          🥉
                        </span>
                      ) : (
                        <span className="text-xs font-black text-slate-400 font-mono">
                          #{user.rank}
                        </span>
                      )}
                    </div>

                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${user.avatarBg} flex items-center justify-center text-lg shadow-xs shrink-0`}>
                      {user.avatarEmoji}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs sm:text-sm font-extrabold truncate ${isUser ? 'text-amber-700 dark:text-amber-300' : 'text-slate-900 dark:text-white'}`}>
                          {user.name}
                        </span>
                        {isUser && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-slate-900 uppercase tracking-wider">
                            Você
                          </span>
                        )}
                        {user.isFriend && !isUser && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                            Amigo
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 truncate">
                        <span className="truncate">{user.schoolOrGoal}</span>
                        <span>•</span>
                        <span className="text-slate-400 truncate">{user.favoriteSubject}</span>
                      </div>
                    </div>
                  </div>

                  {/* Lado Direito: Métricas (Streaks, Precisão, Pontuação) e Ações */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                    {/* Sequência de Dias */}
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-400 block">Sequência:</span>
                      <span className="text-xs font-black text-amber-500 flex items-center gap-1 font-mono">
                        <Flame className="w-3.5 h-3.5 fill-amber-500" />
                        {user.streakDays}d
                      </span>
                    </div>

                    {/* Taxa de Acerto */}
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-400 block">Precisão:</span>
                      <span className="text-xs font-bold text-emerald-500 font-mono">
                        {user?.accuracy ?? 0}%
                      </span>
                    </div>

                    {/* Pontuação */}
                    <div className="text-right min-w-[70px]">
                      <span className="text-[10px] text-slate-400 block">
                        {period === 'weekly' ? 'XP Semanal:' : 'Total:'}
                      </span>
                      <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white font-mono">
                        {period === 'weekly' ? user.weeklyXp : user.score} XP
                      </span>
                    </div>

                    {/* Botões de Ação */}
                    {!isUser && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleCheerFriend(user)}
                          className="p-1.5 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-950/60 text-amber-600 transition-colors cursor-pointer"
                          title="Enviar Fogo de Incentivo"
                        >
                          <Flame className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleChallenge(user)}
                          className="p-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-colors cursor-pointer shadow-xs"
                          title="Desafiar no Treino"
                        >
                          <Swords className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};
