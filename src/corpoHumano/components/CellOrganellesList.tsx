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
    <div className="w-full bg-white rounded-3xl p-5 border-2 border-blue-100 shadow-lg shadow-blue-900/5 flex flex-col gap-4 dark:bg-slate-900 dark:border-slate-800">
      {/* Title & Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center text-lg font-bold shadow-inner dark:bg-sky-950/50 dark:border-sky-900/60 dark:text-sky-300">
            🔬
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight font-display dark:text-white">
              Fichário de Citologia & Organelas
            </h2>
            <p className="text-xs text-slate-500 font-semibold dark:text-slate-400">
              Selecione uma organela para explorar bioquímica celular e itens do ENEM
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar Input */}
      <div className="relative w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por organela, enzima (catalase, ATP-sintase), ATP, osmose, acrossomo..."
          className="w-full pl-10 pr-9 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-800 text-xs sm:text-sm font-semibold rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400 dark:bg-slate-800/70 dark:hover:bg-slate-800 dark:focus:bg-slate-800 dark:text-slate-100 dark:border-slate-700 dark:focus:border-sky-500 dark:focus:ring-sky-900/40 dark:placeholder:text-slate-500"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-300"
            title="Limpar busca"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Category Filter Chips - Clean structured symmetrical grid */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5 text-slate-600 font-extrabold dark:text-slate-300">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Filtrar por função celular:</span>
          </span>
          {selectedCategory !== 'todas' && (
            <button
              type="button"
              onClick={() => {
                sounds.playPop();
                setSelectedCategory('todas');
              }}
              className="text-blue-600 hover:text-blue-800 text-[11px] font-extrabold hover:underline cursor-pointer flex items-center gap-1 dark:text-sky-400 dark:hover:text-sky-300"
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
                    ? 'bg-blue-600 border-blue-700 text-white shadow-sm shadow-blue-500/25 ring-2 ring-blue-200/80 font-black dark:ring-sky-500/40'
                    : 'bg-slate-50 hover:bg-blue-50/70 border-slate-200 text-slate-700 hover:text-blue-800 hover:border-blue-200 dark:bg-slate-800/60 dark:hover:bg-slate-700/70 dark:border-slate-700 dark:text-slate-200 dark:hover:text-sky-300 dark:hover:border-sky-700'
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
                      : 'bg-slate-200/70 text-slate-600 dark:bg-slate-700/70 dark:text-slate-300'
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
                    ? 'bg-blue-50/90 border-blue-500 shadow-md ring-2 ring-blue-300/50 dark:bg-sky-950/50 dark:border-sky-500 dark:ring-sky-500/30'
                    : 'bg-white hover:bg-slate-50/80 border-slate-200/90 hover:border-blue-300 shadow-sm dark:bg-slate-900 dark:hover:bg-slate-800/80 dark:border-slate-800 dark:hover:border-sky-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-blue-100 border border-slate-200 flex items-center justify-center text-xl shadow-inner transition-colors shrink-0 dark:bg-slate-800 dark:group-hover:bg-slate-700 dark:border-slate-700">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 group-hover:text-blue-700 transition-colors font-display leading-tight dark:text-white dark:group-hover:text-sky-400">
                        {item.name}
                      </h3>
                      <span className="text-[10px] font-bold text-slate-500 line-clamp-1 dark:text-slate-400">
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

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium dark:text-slate-300">
                  {item.shortDesc}
                </p>

                {/* Key Concepts Badges */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1 overflow-hidden">
                    {item.enemKeywords.slice(0, 2).map((kw, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 truncate max-w-[110px] dark:bg-slate-800 dark:text-slate-300"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>

                  <span className="text-xs font-bold text-blue-600 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform shrink-0 dark:text-sky-400">
                    Detalhes <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-8 text-center flex flex-col items-center justify-center gap-2">
            <span className="text-3xl">🔍</span>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Nenhuma organela encontrada para &quot;{searchQuery}&quot;</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Tente buscar por termos como ATP, núcleo, membrana, catalase, etc.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('todas');
              }}
              className="mt-2 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition-colors dark:bg-sky-950/50 dark:hover:bg-sky-900/50 dark:text-sky-300 dark:border-sky-900/60"
            >
              Redefinir Filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
