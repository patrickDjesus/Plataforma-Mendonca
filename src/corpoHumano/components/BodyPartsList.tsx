import React, { useState, useMemo } from 'react';
import { BodyPartData, BodyZone, BiologicalSex } from '../types';
import { sounds } from '../utils/audio';
import { Search, X, ChevronRight } from 'lucide-react';

interface BodyPartsListProps {
  parts: BodyPartData[];
  selectedPart: BodyPartData | null;
  onSelectPart: (part: BodyPartData) => void;
  selectedSex?: BiologicalSex;
  onSelectSex?: (sex: BiologicalSex) => void;
}

// Quick system categories for fast filtering
const quickSystems = [
  { id: 'todos', label: 'Todos os Sistemas', icon: '🌐' },
  { id: 'nervoso', label: 'Nervoso', icon: '🧠', match: ['cérebro', 'cerebro', 'olhos', 'visão', 'sinapse', 'neurônio'] },
  { id: 'cardiovascular', label: 'Cardiovascular', icon: '❤️', match: ['coração', 'coracao', 'circulação', 'vasos', 'pressão', 'artéria'] },
  { id: 'respiratorio', label: 'Respiratório', icon: '🌬️', match: ['pulmões', 'pulmoes', 'alvéolos', 'trocas gasosas', 'hematose'] },
  { id: 'digestorio', label: 'Digestório', icon: '🍽️', match: ['estômago', 'estomago', 'fígado', 'figado', 'pâncreas', 'pancreas', 'boca', 'intestino', 'bile', 'pepsina'] },
  { id: 'excretor', label: 'Excretor / Renal', icon: '💧', match: ['rins', 'bexiga', 'néfron', 'ureia', 'adh', 'filtração'] },
  { id: 'endocrino', label: 'Endócrino', icon: '⚡', match: ['tireoide', 'pâncreas', 'pancreas', 'insulina', 'glucagon', 't3', 't4', 'calcitonina'] },
  { id: 'imunologico', label: 'Imunológico', icon: '🛡️', match: ['imune', 'baço', 'anticorpos', 'linfócitos', 'leucócitos'] },
  { id: 'reprodutor', label: 'Reprodutor', icon: '🌸', match: ['reprodutor', 'útero', 'utero', 'ovário', 'ovario', 'tuba', 'testículo', 'testiculo', 'próstata', 'prostata', 'espermatogênese', 'fecundação', 'gameta', 'menstrual', 'vasectomia', 'pílula'] },
];

export const BodyPartsList: React.FC<BodyPartsListProps> = ({
  parts,
  selectedPart,
  onSelectPart,
  _selectedSex = 'feminino',
  onSelectSex,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedZone, setSelectedZone] = useState<'todas' | BodyZone>('todas');
  const [selectedSystemFilter, setSelectedSystemFilter] = useState<string>('todos');

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return parts.filter((part) => {
      // 1. Search term filter
      const matchesSearch =
        term === '' ||
        part.name.toLowerCase().includes(term) ||
        part.scientificName.toLowerCase().includes(term) ||
        part.tagline.toLowerCase().includes(term) ||
        part.shortDesc.toLowerCase().includes(term) ||
        part.fullPhysiology.toLowerCase().includes(term) ||
        part.cellularBiochemistry.toLowerCase().includes(term) ||
        part.enemKeywords.some((k) => k.toLowerCase().includes(term)) ||
        part.enemTips.some((t) => t.title.toLowerCase().includes(term) || t.description.toLowerCase().includes(term));

      // 2. Zone filter
      const matchesZone =
        selectedZone === 'todas' ||
        part.zone === selectedZone ||
        (selectedZone === 'membros_superiores' && (part.zone === 'membros_superiores' || part.zone === 'membros_inferiores'));

      // 3. System quick filter
      let matchesSystem = true;
      if (selectedSystemFilter !== 'todos') {
        const sys = quickSystems.find((s) => s.id === selectedSystemFilter);
        if (sys && sys.match) {
          matchesSystem = sys.match.some(
            (m) =>
              part.name.toLowerCase().includes(m) ||
              part.shortDesc.toLowerCase().includes(m) ||
              part.enemKeywords.some((k) => k.toLowerCase().includes(m))
          );
        }
      }

      return matchesSearch && matchesZone && matchesSystem;
    });
  }, [parts, searchTerm, selectedZone, selectedSystemFilter]);

  const handleClearSearch = () => {
    setSearchTerm('');
    setSelectedZone('todas');
    setSelectedSystemFilter('todos');
    sounds.playPop();
  };

  return (
    <div className="w-full bg-white rounded-3xl p-4 sm:p-5 border-2 border-[#E7E2D9] shadow-md shadow-[#2D5A46]/5 flex flex-col gap-3.5 dark:bg-[#18181B] dark:border-[#2C2C30]">
      {/* Header with Title & Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base sm:text-lg font-black text-[#1C1917] font-display flex items-center gap-2 dark:text-[#FAF9F5]">
            <span>Fichário de Fisiologia & Órgãos</span>
            <span className="text-xs bg-[#EBF3EF] border border-[#CFE1D6] text-[#2D5A46] px-2.5 py-0.5 rounded-full font-bold dark:bg-[#15221B] dark:border-[#22392D] dark:text-[#52B788]">
              {filtered.length} {filtered.length === 1 ? 'estrutura' : 'estruturas'}
            </span>
          </h3>
          <p className="text-xs text-[#78716C] font-semibold dark:text-[#A8A29E]">
            Busque por órgão, sistema fisiológico, enzima, hormônio ou termo do ENEM
          </p>
        </div>
      </div>

      {/* Prominent Search Bar */}
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-[#2D5A46]" />
        </div>
        <input
          id="search-body-parts-input"
          type="text"
          placeholder="Ex: Coração, Rins, Glicemia, Tireoide, Néfrons, Digestório..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-[#EFECE6]/60 hover:bg-[#EFECE6]/90 focus:bg-white border-2 border-[#E7E2D9] focus:border-[#2D5A46] text-xs sm:text-sm font-semibold text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-4 focus:ring-[#CFE1D6] transition-all shadow-inner dark:bg-[#232326]/70 dark:hover:bg-[#232326] dark:focus:bg-[#232326] dark:border-[#2C2C30] dark:focus:border-[#52B788] dark:text-[#D6D3CD] dark:placeholder:text-[#A8A29E] dark:focus:ring-[#22392D]"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              sounds.playPop();
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#A8A29E] hover:text-[#57534E] transition-colors cursor-pointer dark:text-[#A8A29E] dark:hover:text-[#D6D3CD]"
            title="Limpar busca"
          >
            <X className="w-4 h-4 bg-[#E7E2D9] hover:bg-[#D6D0C5] rounded-full p-0.5 text-[#1C1917] dark:bg-[#3B3B40] dark:hover:bg-[#44403C] dark:text-[#D6D3CD]" />
          </button>
        )}
      </div>

      {/* Body Zone Filter - Clean symmetrical 2x2 grid layout */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-bold text-[#78716C] dark:text-[#A8A29E]">
          <span className="flex items-center gap-1.5 text-[#57534E] font-extrabold dark:text-[#D6D3CD]">
            <span className="w-2 h-2 rounded-full bg-[#2D5A46]" />
            <span>Filtrar por região anatômica:</span>
          </span>
          {selectedZone !== 'todas' && (
            <button
              type="button"
              onClick={() => {
                sounds.playPop();
                setSelectedZone('todas');
              }}
              className="text-[#2D5A46] hover:text-[#21483A] text-[11px] font-extrabold hover:underline cursor-pointer flex items-center gap-1 dark:text-[#52B788] dark:hover:text-[#52B788]"
            >
              <X className="w-3 h-3" />
              <span>Limpar filtro</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              setSelectedZone('todas');
            }}
            className={`py-2 px-2.5 rounded-xl font-bold transition-all flex items-center justify-between gap-1.5 cursor-pointer border text-xs text-left ${
              selectedZone === 'todas'
                ? 'bg-[#2D5A46] border-[#21483A] text-white shadow-sm shadow-[#2D5A46]/25 ring-2 ring-[#CFE1D6]/80 font-black dark:ring-[#52B788]/40'
                : 'bg-[#EFECE6] hover:bg-[#EBF3EF]/70 border-[#E7E2D9] text-[#57534E] hover:text-[#2D5A46] hover:border-[#CFE1D6] dark:bg-[#232326]/60 dark:hover:bg-[#333338]/70 dark:border-[#2C2C30] dark:text-[#D6D3CD] dark:hover:text-[#52B788] dark:hover:border-[#22392D]'
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-sm shrink-0">🌐</span>
              <span className="truncate text-xs">Todas Estruturas</span>
            </div>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-black shrink-0 ${
                selectedZone === 'todas' ? 'bg-white/25 text-white' : 'bg-[#E7E2D9]/70 text-[#57534E] dark:bg-[#3B3B40]/70 dark:text-[#D6D3CD]'
              }`}
            >
              {parts.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              setSelectedZone('cabeca');
            }}
            className={`py-2 px-2.5 rounded-xl font-bold transition-all flex items-center justify-between gap-1.5 cursor-pointer border text-xs text-left ${
              selectedZone === 'cabeca'
                ? 'bg-[#2D5A46] border-[#21483A] text-white shadow-sm shadow-[#2D5A46]/25 ring-2 ring-[#CFE1D6]/80 font-black dark:ring-[#52B788]/40'
                : 'bg-[#EFECE6] hover:bg-[#EBF3EF]/70 border-[#E7E2D9] text-[#57534E] hover:text-[#2D5A46] hover:border-[#CFE1D6] dark:bg-[#232326]/60 dark:hover:bg-[#333338]/70 dark:border-[#2C2C30] dark:text-[#D6D3CD] dark:hover:text-[#52B788] dark:hover:border-[#22392D]'
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-sm shrink-0">🧠</span>
              <span className="truncate text-xs">Cabeça & Sentidos</span>
            </div>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-black shrink-0 ${
                selectedZone === 'cabeca' ? 'bg-white/25 text-white' : 'bg-[#E7E2D9]/70 text-[#57534E] dark:bg-[#3B3B40]/70 dark:text-[#D6D3CD]'
              }`}
            >
              {parts.filter((p) => p.zone === 'cabeca').length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              setSelectedZone('tronco');
            }}
            className={`py-2 px-2.5 rounded-xl font-bold transition-all flex items-center justify-between gap-1.5 cursor-pointer border text-xs text-left ${
              selectedZone === 'tronco'
                ? 'bg-[#2D5A46] border-[#21483A] text-white shadow-sm shadow-[#2D5A46]/25 ring-2 ring-[#CFE1D6]/80 font-black dark:ring-[#52B788]/40'
                : 'bg-[#EFECE6] hover:bg-[#EBF3EF]/70 border-[#E7E2D9] text-[#57534E] hover:text-[#2D5A46] hover:border-[#CFE1D6] dark:bg-[#232326]/60 dark:hover:bg-[#333338]/70 dark:border-[#2C2C30] dark:text-[#D6D3CD] dark:hover:text-[#52B788] dark:hover:border-[#22392D]'
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-sm shrink-0">❤️</span>
              <span className="truncate text-xs">Tronco & Vísceras</span>
            </div>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-black shrink-0 ${
                selectedZone === 'tronco' ? 'bg-white/25 text-white' : 'bg-[#E7E2D9]/70 text-[#57534E] dark:bg-[#3B3B40]/70 dark:text-[#D6D3CD]'
              }`}
            >
              {parts.filter((p) => p.zone === 'tronco').length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              setSelectedZone('membros_superiores');
            }}
            className={`py-2 px-2.5 rounded-xl font-bold transition-all flex items-center justify-between gap-1.5 cursor-pointer border text-xs text-left ${
              selectedZone === 'membros_superiores'
                ? 'bg-[#2D5A46] border-[#21483A] text-white shadow-sm shadow-[#2D5A46]/25 ring-2 ring-[#CFE1D6]/80 font-black dark:ring-[#52B788]/40'
                : 'bg-[#EFECE6] hover:bg-[#EBF3EF]/70 border-[#E7E2D9] text-[#57534E] hover:text-[#2D5A46] hover:border-[#CFE1D6] dark:bg-[#232326]/60 dark:hover:bg-[#333338]/70 dark:border-[#2C2C30] dark:text-[#D6D3CD] dark:hover:text-[#52B788] dark:hover:border-[#22392D]'
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-sm shrink-0">🦴</span>
              <span className="truncate text-xs">Músculos & Ossos</span>
            </div>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-black shrink-0 ${
                selectedZone === 'membros_superiores'
                  ? 'bg-white/25 text-white'
                  : 'bg-[#E7E2D9]/70 text-[#57534E]'
              }`}
            >
              {
                parts.filter(
                  (p) => p.zone === 'membros_superiores' || p.zone === 'membros_inferiores'
                ).length
              }
            </span>
          </button>
        </div>
      </div>

      {/* Cards List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
        {filtered.length > 0 ? (
          filtered.map((part) => {
            const isSelected = selectedPart?.id === part.id;
            return (
              <button
                key={part.id}
                type="button"
                onClick={() => {
                  if (part.soundType === 'heartbeat') sounds.playHeartbeat();
                  else if (part.soundType === 'breath') sounds.playBreath();
                  else if (part.soundType === 'electric') sounds.playSparkle();
                  else sounds.playPop();

                  if (part.sex === 'feminino' && onSelectSex) onSelectSex('feminino');
                  if (part.sex === 'masculino' && onSelectSex) onSelectSex('masculino');

                  onSelectPart(part);
                }}
                className={`p-3 rounded-2xl border-2 text-left transition-colors flex items-start gap-3 cursor-pointer group ${
                  isSelected
                    ? 'bg-[#EBF3EF]/95 border-[#2D5A46] shadow-md ring-2 ring-[#CFE1D6] dark:bg-[#15221B] dark:border-[#52B788] dark:ring-[#52B788]/30'
                    : 'bg-white hover:bg-[#EBF3EF]/50 border-[#E7E2D9] hover:border-[#CFE1D6] shadow-sm dark:bg-[#18181B] dark:hover:bg-[#232326]/80 dark:border-[#2C2C30] dark:hover:border-[#22392D]'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-[#EBF3EF] border border-[#CFE1D6] flex items-center justify-center text-xl shrink-0 group-hover:bg-[#E5DFD5] group-hover:border-[#22392D] transition-colors dark:bg-[#232326] dark:border-[#2C2C30] dark:group-hover:bg-[#333338] dark:group-hover:border-[#3B3B40]">
                  {part.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 min-w-0 truncate">
                      <h4 className="text-xs sm:text-sm font-black text-[#1C1917] truncate font-display dark:text-[#FAF9F5]">
                        {part.name}
                      </h4>
                      {part.sex === 'feminino' && (
                        <span className="text-[9px] font-black bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.2 rounded-md shrink-0 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900/60">
                          ♀ Fem
                        </span>
                      )}
                      {part.sex === 'masculino' && (
                        <span className="text-[9px] font-black bg-[#EBF3EF] text-[#2D5A46] border border-[#CFE1D6] px-1.5 py-0.2 rounded-md shrink-0 dark:bg-[#15221B] dark:text-[#52B788] dark:border-[#22392D]">
                          ♂ Masc
                        </span>
                      )}
                    </div>
                    {(() => {
                      const diff = part.enemRecurrence === 'Altíssima' || part.enemRecurrence === 'Alta' ? 'Alta' : part.enemRecurrence === 'Média' ? 'Média' : 'Baixa';
                      const colorClass = diff === 'Alta' ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900/60' : diff === 'Média' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900/60' : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900/60';
                      return (
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${colorClass} shrink-0`}>
                          {diff}
                        </span>
                      );
                    })()}
                  </div>
                  <p className="text-[11px] text-[#78716C] truncate font-medium mt-0.5 dark:text-[#D6D3CD]">
                    {part.tagline}
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-[#2D5A46] font-bold dark:text-[#52B788]">
                    <span>Abrir ficha completa</span>
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </button>
            );
          })
        ) : (
          <div className="col-span-1 sm:col-span-2 py-8 flex flex-col items-center justify-center text-center gap-3 bg-[#EBF3EF]/40 rounded-2xl border border-dashed border-[#CFE1D6] p-4 dark:bg-[#232326]/40 dark:border-[#2C2C30]">
            <div className="w-12 h-12 rounded-2xl bg-[#EBF3EF] text-[#2D5A46] flex items-center justify-center text-2xl dark:bg-[#232326] dark:text-[#52B788]">
              🔍
            </div>
            <div>
              <p className="text-sm font-black text-[#1C1917] font-display dark:text-[#FAF9F5]">
                Nenhum órgão ou termo encontrado
              </p>
              <p className="text-xs text-[#78716C] font-medium max-w-xs mt-0.5 dark:text-[#A8A29E]">
                Não encontramos resultados para "{searchTerm}". Tente pesquisar por termos como "Coração", "Rins", "Glicemia" ou "Tireoide".
              </p>
            </div>
            <button
              type="button"
              onClick={handleClearSearch}
              className="px-4 py-1.5 rounded-xl bg-[#2D5A46] hover:bg-[#21483A] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              Limpar Filtros e Ver Todos
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
