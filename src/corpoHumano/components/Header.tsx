import React from 'react';
import { sounds } from '../utils/audio';

export type MainViewTab = 'corpo' | 'celula';

interface HeaderProps {
  activeTab: MainViewTab;
  onSelectTab: (tab: MainViewTab) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onSelectTab }) => {
  return (
    <header className="w-full bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:px-6 sm:py-4 shadow-lg shadow-[#2D5A46]/5 border-2 border-[#E7E2D9] dark:bg-[#18181B]/95 dark:border-[#2C2C30] flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Brand Title & Cartoon Avatar */}
      <div className="flex items-center gap-3.5">
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#2D5A46] via-[#2D5A46] to-[#1E3E30] p-0.5 shadow-md shadow-[#2D5A46]/20">
            <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center text-2xl shadow-inner">
              {activeTab === 'corpo' ? '❤️' : '🔬'}
            </div>
          </div>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#1C1917] tracking-tight font-display dark:text-[#FAF9F5]">
            {activeTab === 'corpo'
              ? 'Corpo Humano & Fisiologia'
              : 'Citologia & Célula Eucariótica'}
          </h1>
          <p className="text-xs text-[#78716C] font-semibold dark:text-[#A8A29E]">
            {activeTab === 'corpo'
              ? 'Clique nas estruturas anatômicas para explorar funções, bioquímica e questões comentadas'
              : 'Explore as organelas, membranas, respiração celular, síntese proteica e questões ENEM'}
          </p>
        </div>
      </div>

      {/* Clean Navigation Tab Switcher */}
      <div className="flex items-center gap-1.5 bg-[#EFECE6] p-1.5 rounded-2xl border border-[#E7E2D9] shadow-inner dark:bg-[#232326]/80 dark:border-[#2C2C30]">
        <button
          type="button"
          onClick={() => {
            sounds.playPop();
            onSelectTab('corpo');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
            activeTab === 'corpo'
              ? 'bg-white text-[#2D5A46] shadow-sm border border-[#CFE1D6] dark:bg-[#232326] dark:text-[#52B788] dark:border-[#22392D]'
              : 'text-[#57534E] hover:text-[#1C1917] hover:bg-[#E5DFD5]/60 dark:text-[#D6D3CD] dark:hover:text-[#FAF9F5] dark:hover:bg-[#333338]/60'
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
              ? 'bg-white text-[#2D5A46] shadow-sm border border-[#CFE1D6] dark:bg-[#232326] dark:text-[#52B788] dark:border-[#22392D]'
              : 'text-[#57534E] hover:text-[#1C1917] hover:bg-[#E5DFD5]/60 dark:text-[#D6D3CD] dark:hover:text-[#FAF9F5] dark:hover:bg-[#333338]/60'
          }`}
        >
          <span>🔬</span>
          <span>Célula & Organelas</span>
        </button>
      </div>
    </header>
  );
};
