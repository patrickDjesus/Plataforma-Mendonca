import React, { useState, useMemo } from 'react';
import { CellOrganelleData } from '../types';
import { sounds } from '../utils/audio';
import { Search, X, ChevronRight } from 'lucide-react';

interface CellOrganellesListProps {
  organelles: CellOrganelleData[];
  selectedOrganelle: CellOrganelleData | null;
  onSelectOrganelle: (organelle: CellOrganelleData) => void;
}

export const CellOrganellesList: React.FC<CellOrganellesListProps> = ({
  organelles,
  selectedOrganelle,
  onSelectOrganelle,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');

  const categories: { id: string; label: string; icon: string }[] = [
    { id: 'todas', label: 'Todas Organelas', icon: '🔬' },
    { id: 'energetico', label: 'Energia (ATP)', icon: '⚡' },
    { id: 'genetico', label: 'Genético & DNA', icon: '🧬' },
    { id: 'sintese_secrecao', label: 'Síntese & Secreção', icon: '📦' },
    { id: 'digestao_detox', label: 'Digestão & Detox', icon: '♻️' },
    { id: 'estrutural_membrana', label: 'Membrana & Fuso', icon: '🛡️' },
  ];

  const filteredOrganelles = useMemo(() => {
    return organelles.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.scientificName.toLowerCase().includes(q) ||
        item.tagline.toLowerCase().includes(q) ||
        item.shortDesc.toLowerCase().includes(q) ||
        item.fullFunction.toLowerCase().includes(q) ||
        item.biochemistryMecanismo.toLowerCase().includes(q) ||
        item.enemKeywords.some((k) => k.toLowerCase().includes(q));

      const matchesCategory =
        selectedCategory === 'todas' || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [organelles, searchQuery, selectedCategory]);

  const handleOrganelleClick = (item: CellOrganelleData) => {
    if (item.soundType === 'sparkle') sounds.playSparkle();
    else if (item.soundType === 'electric') sounds.playSuccess();
    else sounds.playPop();

    onSelectOrganelle(item);
  };

  return (
    <div className="w-full bg-white rounded-3xl p-5 border-2 border-[#E7E2D9] shadow-lg shadow-[#2D5A46]/5 flex flex-col gap-4 dark:bg-[#18181B] dark:border-[#2C2C30]">
      {/* Title & Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#EBF3EF] border border-[#CFE1D6] text-[#2D5A46] flex items-center justify-center text-lg font-bold shadow-inner dark:bg-[#15221B]/50 dark:border-[#22392D] dark:text-[#52B788]">
            🔬
          </div>
          <div>
            <h2 className="text-lg font-black text-[#1C1917] tracking-tight font-display dark:text-[#FAF9F5]">
              Fichário de Citologia & Organelas
            </h2>
            <p className="text-xs text-[#78716C] font-semibold dark:text-[#A8A29E]">
              Selecione uma organela para explorar bioquímica celular e itens do ENEM
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar Input */}
      <div className="relative w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2D5A46] pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por organela, enzima (catalase, ATP-sintase), ATP, osmose, acrossomo..."
          className="w-full pl-10 pr-9 py-2.5 bg-[#EFECE6]/60 hover:bg-[#EFECE6]/90 focus:bg-white text-[#1C1917] text-xs sm:text-sm font-semibold rounded-2xl border border-[#E7E2D9] focus:border-[#2D5A46] focus:ring-4 focus:ring-[#CFE1D6] outline-none transition-all placeholder:text-[#A8A29E] dark:bg-[#232326]/70 dark:hover:bg-[#232326] dark:focus:bg-[#232326] dark:text-[#FAF9F5] dark:border-[#2C2C30] dark:focus:border-[#52B788] dark:focus:ring-[#22392D]/40 dark:placeholder:text-[#A8A29E]"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#E7E2D9] hover:bg-[#D6D0C5] text-[#57534E] flex items-center justify-center transition-colors cursor-pointer dark:bg-[#3B3B40] dark:hover:bg-[#44403C] dark:text-[#D6D3CD]"
            title="Limpar busca"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Category Filter Chips - Clean structured symmetrical grid */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-bold text-[#78716C] dark:text-[#A8A29E]">
          <span className="flex items-center gap-1.5 text-[#57534E] font-extrabold dark:text-[#D6D3CD]">
            <span className="w-2 h-2 rounded-full bg-[#2D5A46]" />
            <span>Filtrar por função celular:</span>
          </span>
          {selectedCategory !== 'todas' && (
            <button
              type="button"
              onClick={() => {
                sounds.playPop();
                setSelectedCategory('todas');
              }}
              className="text-[#2D5A46] hover:text-[#21483A] text-[11px] font-extrabold hover:underline cursor-pointer flex items-center gap-1 dark:text-[#52B788] dark:hover:text-[#52B788]"
            >
              <X className="w-3 h-3" />
              <span>Limpar filtro</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count =
              cat.id === 'todas'
                ? organelles.length
                : organelles.filter((o) => o.category === cat.id).length;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  sounds.playPop();
                  setSelectedCategory(cat.id);
                }}
                className={`py-2 px-2.5 rounded-xl font-bold transition-all flex items-center justify-between gap-1.5 cursor-pointer border text-xs text-left ${
                  isSelected
                    ? 'bg-[#2D5A46] border-[#21483A] text-white shadow-sm shadow-[#2D5A46]/25 ring-2 ring-[#CFE1D6]/80 font-black dark:ring-[#52B788]/40'
                    : 'bg-[#EFECE6] hover:bg-[#EBF3EF]/70 border-[#E7E2D9] text-[#57534E] hover:text-[#2D5A46] hover:border-[#CFE1D6] dark:bg-[#232326]/60 dark:hover:bg-[#333338]/70 dark:border-[#2C2C30] dark:text-[#D6D3CD] dark:hover:text-[#52B788] dark:hover:border-[#22392D]'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-sm shrink-0">{cat.icon}</span>
                  <span className="truncate text-[11px] sm:text-xs">{cat.label}</span>
                </div>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-black shrink-0 ${
                    isSelected
                      ? 'bg-white/25 text-white'
                      : 'bg-[#E7E2D9]/70 text-[#57534E] dark:bg-[#3B3B40]/70 dark:text-[#D6D3CD]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Organelles Grid List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
        {filteredOrganelles.length > 0 ? (
          filteredOrganelles.map((item) => {
            const isSelected = selectedOrganelle?.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => handleOrganelleClick(item)}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-2.5 text-left group ${
                  isSelected
                    ? 'bg-[#EBF3EF]/90 border-[#2D5A46] shadow-md ring-2 ring-[#CFE1D6] dark:bg-[#15221B] dark:border-[#52B788] dark:ring-[#52B788]/30'
                    : 'bg-white hover:bg-[#EBF3EF]/50 border-[#E7E2D9]/90 hover:border-[#CFE1D6] shadow-sm dark:bg-[#18181B] dark:hover:bg-[#232326]/80 dark:border-[#2C2C30] dark:hover:border-[#22392D]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-[#EFECE6] group-hover:bg-[#EBF3EF] border border-[#E7E2D9] flex items-center justify-center text-xl shadow-inner transition-colors shrink-0 dark:bg-[#232326] dark:group-hover:bg-[#333338] dark:border-[#2C2C30]">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-[#1C1917] group-hover:text-[#2D5A46] transition-colors font-display leading-tight dark:text-[#FAF9F5] dark:group-hover:text-[#52B788]">
                        {item.name}
                      </h3>
                      <span className="text-[10px] font-bold text-[#78716C] line-clamp-1 dark:text-[#A8A29E]">
                        {item.categoryLabel}
                      </span>
                    </div>
                  </div>

                  {(() => {
                    const diff = item.enemRecurrence === 'Altíssima' || item.enemRecurrence === 'Alta' ? 'Alta' : item.enemRecurrence === 'Média' ? 'Média' : 'Baixa';
                    const colorClass = diff === 'Alta' ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900/60' : diff === 'Média' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900/60' : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900/60';
                    return (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 border ${colorClass}`}>
                        {diff}
                      </span>
                    );
                  })()}
                </div>

                <p className="text-xs text-[#57534E] line-clamp-2 leading-relaxed font-medium dark:text-[#D6D3CD]">
                  {item.shortDesc}
                </p>

                {/* Key Concepts Badges */}
                <div className="flex items-center justify-between pt-1 border-t border-[#E7E2D9] dark:border-[#2C2C30]">
                  <div className="flex items-center gap-1 overflow-hidden">
                    {item.enemKeywords.slice(0, 2).map((kw, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#E7E2D9]/80 text-[#57534E] truncate max-w-[110px] dark:bg-[#232326] dark:text-[#D6D3CD]"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>

                  <span className="text-xs font-bold text-[#2D5A46] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform shrink-0 dark:text-[#52B788]">
                    Detalhes <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-8 text-center flex flex-col items-center justify-center gap-2">
            <span className="text-3xl">🔍</span>
            <p className="text-sm font-bold text-[#57534E] dark:text-[#D6D3CD]">Nenhuma organela encontrada para &quot;{searchQuery}&quot;</p>
            <p className="text-xs text-[#78716C] dark:text-[#A8A29E]">Tente buscar por termos como ATP, núcleo, membrana, catalase, etc.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('todas');
              }}
              className="mt-2 px-3 py-1.5 rounded-xl bg-[#EBF3EF] hover:bg-[#E5DFD5] text-[#2D5A46] text-xs font-bold border border-[#CFE1D6] transition-colors dark:bg-[#15221B]/50 dark:hover:bg-[#22392D]/50 dark:text-[#52B788] dark:border-[#22392D]"
            >
              Redefinir Filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
