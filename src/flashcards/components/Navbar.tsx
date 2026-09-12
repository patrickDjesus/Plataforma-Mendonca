import React from 'react';
import { Flame, BarChart2, Volume2, VolumeX, Moon, Sun, Layers, Plus } from 'lucide-react';
import { UserStats } from '../types';

interface NavbarProps {
  stats: UserStats;
  isDark: boolean;
  onToggleTheme: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenStats: () => void;
  onNewDeck: () => void;
  onGoHome: () => void;
  hasActiveDeck: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  stats,
  isDark,
  onToggleTheme,
  soundEnabled,
  onToggleSound,
  onOpenStats,
  onNewDeck,
  onGoHome,
  hasActiveDeck,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 dark:bg-[#161618]/90 backdrop-blur-md border-b border-[#E7E2D9] dark:border-[#2C2C30] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand */}
        <button
          id="btn-brand-home"
          onClick={onGoHome}
          className="flex items-center gap-2.5 group text-left cursor-pointer focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-[#2D5A46] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="font-['Fraunces',serif] font-bold text-lg sm:text-xl tracking-tight text-[#1C1917] dark:text-[#FAF9F5] flex items-center gap-1.5">
              FlashCards<span className="text-[#2D5A46] font-normal italic">Estudo</span>
            </span>
            <p className="text-[11px] text-[#78716C] dark:text-[#A8A29E] hidden sm:block font-sans">
              Aprendizado ativo com dupla fixação
            </p>
          </div>
        </button>

        {/* Center / Right controls */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Streak badge */}
          <button
            id="btn-streak-badge"
            onClick={onOpenStats}
            title={`${stats.streak} dia(s) de sequência de estudo seguidos`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EBF3EF] dark:bg-[#15221B] border border-[#CFE1D6] dark:border-[#22392D] text-[#2D5A46] dark:text-[#52B788] text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            <Flame className="w-4 h-4 text-[#2D5A46] dark:text-[#52B788] fill-[#2D5A46] dark:fill-[#52B788]" />
            <span className="font-mono">{stats.streak} {stats.streak === 1 ? 'dia' : 'dias'}</span>
          </button>

          {/* Stats Button */}
          <button
            id="btn-open-stats"
            onClick={onOpenStats}
            title="Estatísticas de Estudo"
            className="p-2 rounded-xl text-[#57534E] dark:text-[#D6D3CD] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <BarChart2 className="w-4 h-4" />
          </button>

          {/* Sound Toggle */}
          <button
            id="btn-toggle-sound"
            onClick={onToggleSound}
            title={soundEnabled ? 'Silenciar efeitos sonoros' : 'Ativar efeitos sonoros'}
            className="p-2 rounded-xl text-[#57534E] dark:text-[#D6D3CD] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-[#2D5A46] dark:text-[#52B788]" />
            ) : (
              <VolumeX className="w-4 h-4 text-[#A8A29E]" />
            )}
          </button>

          {/* Theme Toggle */}
          <button
            id="btn-toggle-theme"
            onClick={onToggleTheme}
            title={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
            className="p-2 rounded-xl text-[#57534E] dark:text-[#D6D3CD] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Add Deck action button */}
          {!hasActiveDeck && (
            <button
              id="btn-nav-new-deck"
              onClick={onNewDeck}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1C1917] hover:bg-[#292524] dark:bg-[#FAF9F5] dark:hover:bg-[#EAE8E3] text-white dark:text-[#1C1917] text-xs font-bold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Baralho</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
