import React from 'react';
import { sounds } from '../utils/audio';

export type MainViewTab = 'corpo' | 'celula';

interface HeaderProps {
  activeTab: MainViewTab;
  onSelectTab: (tab: MainViewTab) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onSelectTab }) => {
  return (
    <header className="w-full bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:px-6 sm:py-4 shadow-lg shadow-blue-900/5 border-2 border-blue-100 dark:bg-slate-900/95 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Brand Title & Cartoon Avatar */}
      <div className="flex items-center gap-3.5">
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 p-0.5 shadow-md shadow-blue-500/20">
            <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center text-2xl shadow-inner">
              {activeTab === 'corpo' ? '❤️' : '🔬'}
            </div>
          </div>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-display dark:text-white">
            {activeTab === 'corpo'
              ? 'Corpo Humano & Fisiologia'
              : 'Citologia & Célula Eucariótica'}
          </h1>
          <p className="text-xs text-slate-500 font-semibold dark:text-slate-400">
            {activeTab === 'corpo'
              ? 'Clique nas estruturas anatômicas para explorar funções, bioquímica e questões comentadas'
              : 'Explore as organelas, membranas, respiração celular, síntese proteica e questões ENEM'}
          </p>
        </div>
      </div>

      {/* Clean Navigation Tab Switcher */}
      <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner dark:bg-slate-800/80 dark:border-slate-700">
        <button
          type="button"
          onClick={() => {
            sounds.playPop();
            onSelectTab('corpo');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
            activeTab === 'corpo'
              ? 'bg-white text-blue-700 shadow-sm border border-blue-200 dark:bg-slate-800 dark:text-sky-400 dark:border-slate-600'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-700/60'
          }`}
        >
          <span>❤️</span>
          <span>Corpo Humano</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sounds.playPop();
            onSelectTab('celula');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
            activeTab === 'celula'
              ? 'bg-white text-blue-700 shadow-sm border border-blue-200 dark:bg-slate-800 dark:text-sky-400 dark:border-slate-600'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-700/60'
          }`}
        >
          <span>🔬</span>
          <span>Célula & Organelas</span>
        </button>
      </div>
    </header>
  );
};
