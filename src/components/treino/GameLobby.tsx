import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap,
  Trophy,
  Check,
  Calculator,
  Atom,
  GraduationCap,
  ChevronRight,
  Play,
  BarChart3
} from 'lucide-react';
import { PerformanceAnalytics } from '../../types/design';
import { GameCategory, GameDifficulty } from '../../utils/gameGenerators';
import { playSound } from '../../utils/sounds';

interface BurstParticles {
  id: number;
  modeId: string;
}

interface GameModeOption {
  id: string;
  title: string;
  badge: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  borderActive: string;
}

interface GameLobbyProps {
  analytics: PerformanceAnalytics;
  customQuestionsCount: number;
  gameMode: GameCategory | 'teacher_custom';
  onGameModeChange: (mode: GameCategory | 'teacher_custom') => void;
  customSubjectFilter?: string | null;
  difficulty: GameDifficulty;
  onDifficultyChange: (d: GameDifficulty) => void;
  burstParticles: BurstParticles | null;
  onTriggerModeBurst: (modeId: string) => void;
  onStartSurvival: () => void;
  onNavigateTab: (tab: 'dashboard' | 'leaderboard') => void;
}

const GAME_MODES: Omit<GameModeOption, 'icon'>[] = [
  {
    id: 'math_arcade',
    title: 'Cálculo Mental Arcade',
    badge: 'Aritmética & Álgebra',
    desc: 'Display digital neon para respostas rápidas de cálculo, raízes e equações.',
    color: 'from-blue-600 to-cyan-600',
    borderActive: 'border-cyan-500 ring-2 ring-cyan-400/40 bg-gradient-to-b from-cyan-50/80 to-blue-50/40 dark:from-cyan-950/40 dark:to-blue-950/20 shadow-md shadow-cyan-500/10'
  },
  {
    id: 'periodic_table',
    title: 'Tabela Periódica',
    badge: 'Química Visual',
    desc: 'Adivinhe símbolos, números atômicos e famílias em cards químicos interativos.',
    color: 'from-purple-600 to-pink-600',
    borderActive: 'border-purple-500 ring-2 ring-purple-400/40 bg-gradient-to-b from-purple-50/80 to-pink-50/40 dark:from-purple-950/40 dark:to-pink-950/20 shadow-md shadow-purple-500/10'
  },
  {
    id: 'teacher_custom',
    title: 'Minhas Questões',
    badge: '',  // filled dynamically
    desc: 'Simulado focado nas questões autorais que você cadastrou no estúdio.',
    color: 'from-emerald-600 to-teal-600',
    borderActive: 'border-emerald-500 ring-2 ring-emerald-400/40 bg-gradient-to-b from-emerald-50/80 to-teal-50/40 dark:from-emerald-950/40 dark:to-teal-950/20 shadow-md shadow-emerald-500/10'
  }
];

const MODE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  math_arcade: Calculator,
  periodic_table: Atom,
  teacher_custom: GraduationCap
};

const DIFFICULTIES = ['Fácil', 'Médio', 'Difícil', 'Hardcore'] as const;

const DIFFICULTY_CLASSES: Record<string, string> = {
  'Fácil': 'bg-emerald-500 text-white shadow-xs scale-105',
  'Médio': 'bg-amber-500 text-white shadow-xs scale-105',
  'Difícil': 'bg-rose-500 text-white shadow-xs scale-105',
  'Hardcore': 'bg-purple-600 text-white shadow-xs scale-105 animate-pulse'
};

export const GameLobby: React.FC<GameLobbyProps> = ({
  analytics,
  customQuestionsCount,
  gameMode,
  onGameModeChange,
  customSubjectFilter = null,
  difficulty,
  onDifficultyChange,
  burstParticles,
  onTriggerModeBurst,
  onStartSurvival,
  onNavigateTab
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Hero Banner Lobby */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 p-6 sm:p-9 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold">
              <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Modo Survival • 3 Vidas</span>
            </div>

            <button
              type="button"
              onClick={() => {
                playSound('click');
                onNavigateTab('dashboard');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-colors cursor-pointer"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Análise & Curvas ({analytics.totalWrong} erros)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playSound('click');
                onNavigateTab('leaderboard');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-colors cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Ranking Global & Amigos</span>
            </button>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white">
            Treino Neural de Alta Frequência
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Escolha a modalidade de treino abaixo e inicie o desafio. O timer começa imediatamente e as perguntas continuam sem interrupção até você esgotar suas 3 vidas!
          </p>
        </div>

        {/* Efeito de grade sutil */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      </div>

      {/* Seletor de Modos de Jogo */}
      <div className="space-y-2.5">
        <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
          1. Escolha a Modalidade de Treino:
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {GAME_MODES.map((mode) => {
            const Icon = MODE_ICONS[mode.id];
            const isSelected = gameMode === mode.id;
            return (
              <div key={mode.id} className="relative">
                <motion.button
                  whileHover={{ scale: 1.015, y: -2 }}
                  whileTap={{ scale: 0.985 }}
                  type="button"
                  onClick={() => {
                    playSound('click');
                    onGameModeChange(mode.id as GameCategory | 'teacher_custom');
                    onTriggerModeBurst(mode.id);
                  }}
                  className={`w-full min-h-[175px] p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? `${mode.borderActive}`
                      : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                  }`}
                >
                  {/* Sutil brilho de fundo quando selecionado */}
                  {isSelected && (
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cyan-500/10 via-transparent to-transparent pointer-events-none rounded-tr-2xl" />
                  )}

                  <div className="w-full space-y-2.5 relative z-10">
                    <div className="flex items-center justify-between">
                      <motion.div 
                        animate={isSelected ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className={`p-2.5 rounded-xl bg-gradient-to-br ${mode.color} text-white shadow-xs`}
                      >
                        <Icon className="w-5 h-5" />
                      </motion.div>
                      <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/60 shrink-0">
                        {mode.id === 'teacher_custom'
                          ? `${customQuestionsCount} no banco`
                          : mode.badge}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white font-display">
                        {mode.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                        {mode.desc}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold relative z-10">
                    {isSelected ? (
                      <motion.span 
                        initial={{ opacity: 0, x: -3 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 font-extrabold"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Selecionado</span>
                      </motion.span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 flex items-center gap-1">
                        <span>Clique para treinar</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </motion.button>

                {/* Efeito sutil de onda ao selecionar */}
                <AnimatePresence>
                  {burstParticles && burstParticles.modeId === mode.id && (
                    <motion.div
                      key={burstParticles.id}
                      initial={{ opacity: 0.6, scale: 0.98 }}
                      animate={{ opacity: 0, scale: 1.04 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.45, ease: 'easeOut' }}
                      className="absolute inset-0 rounded-2xl border-2 border-cyan-400/60 dark:border-cyan-400/40 pointer-events-none z-20"
                    />
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Seletor de Dificuldade */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-0.5">
            2. Nível de Desafio & Ritmo:
          </span>
          <p className="text-[11px] text-slate-500">
            Maior dificuldade concede multiplicadores extras de XP e pontuação.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => {
                playSound('click');
                onDifficultyChange(d);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                difficulty === d
                  ? DIFFICULTY_CLASSES[d]
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* BOTÃO PRINCIPAL DE INICIAR TREINO */}
      <div className="pt-2 flex flex-col items-center justify-center gap-2 text-center">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={() => onStartSurvival()}
          className="w-full sm:w-auto min-w-[320px] flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-cyan-500/25 transition-all cursor-pointer"
        >
          <Play className="w-5 h-5 fill-white" />
          <span>⚡ INICIAR TREINO SURVIVAL</span>
        </motion.button>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          O cronômetro dispara ao clicar. Responda o máximo de perguntas até perder suas 3 vidas!
        </p>

        {gameMode === 'teacher_custom' && customSubjectFilter && (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
            <Check className="w-3.5 h-3.5" />
            <span>
              Foco: {customSubjectFilter}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
