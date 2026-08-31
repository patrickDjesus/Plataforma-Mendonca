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
    <div className="w-full bg-white rounded-3xl p-4 sm:p-5 border-2 border-blue-100 shadow-md shadow-blue-900/5 flex flex-col gap-3.5 dark:bg-slate-900 dark:border-slate-800">
      {/* Header with Title & Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 font-display flex items-center gap-2 dark:text-white">
            <span>Fichário de Fisiologia & Órgãos</span>
            <span className="text-xs bg-blue-50 border border-blue-200 text-blue-700 px-2.5 py-0.5 rounded-full font-bold dark:bg-sky-950/50 dark:border-sky-900/50 dark:text-sky-300">
              {filtered.length} {filtered.length === 1 ? 'estrutura' : 'estruturas'}
            </span>
          </h3>
          <p className="text-xs text-slate-500 font-semibold dark:text-slate-400">
            Busque por órgão, sistema fisiológico, enzima, hormônio ou termo do ENEM
          </p>
        </div>
      </div>

      {/* Prominent Search Bar */}
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-blue-500" />
        </div>
        <input
          id="search-body-parts-input"
          type="text"
          placeholder="Ex: Coração, Rins, Glicemia, Tireoide, Néfrons, Digestório..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-blue-50/60 hover:bg-blue-50/90 focus:bg-white border-2 border-blue-200 focus:border-blue-500 text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all shadow-inner dark:bg-slate-800/70 dark:hover:bg-slate-800 dark:focus:bg-slate-800 dark:border-slate-700 dark:focus:border-sky-500 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-sky-900/40"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              sounds.playPop();
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer dark:text-slate-500 dark:hover:text-slate-300"
            title="Limpar busca"
          >
            <X className="w-4 h-4 bg-slate-200 hover:bg-slate-300 rounded-full p-0.5 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-300" />
          </button>
        )}
      </div>

      {/* Body Zone Filter - Clean symmetrical 2x2 grid layout */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5 text-slate-600 font-extrabold dark:text-slate-300">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Filtrar por região anatômica:</span>
          </span>
          {selectedZone !== 'todas' && (
            <button
              type="button"
              onClick={() => {
                sounds.playPop();
                setSelectedZone('todas');
              }}
              className="text-blue-600 hover:text-blue-800 text-[11px] font-extrabold hover:underline cursor-pointer flex items-center gap-1 dark:text-sky-400 dark:hover:text-sky-300"
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
                ? 'bg-blue-600 border-blue-700 text-white shadow-sm shadow-blue-500/25 ring-2 ring-blue-200/80 font-black dark:ring-sky-500/40'
                : 'bg-slate-50 hover:bg-blue-50/70 border-slate-200 text-slate-700 hover:text-blue-800 hover:border-blue-200 dark:bg-slate-800/60 dark:hover:bg-slate-700/70 dark:border-slate-700 dark:text-slate-200 dark:hover:text-sky-300 dark:hover:border-sky-700'
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-sm shrink-0">🌐</span>
              <span className="truncate text-xs">Todas Estruturas</span>
            </div>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-black shrink-0 ${
                selectedZone === 'todas' ? 'bg-white/25 text-white' : 'bg-slate-200/70 text-slate-600 dark:bg-slate-700/70 dark:text-slate-300'
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
                ? 'bg-blue-600 border-blue-700 text-white shadow-sm shadow-blue-500/25 ring-2 ring-blue-200/80 font-black dark:ring-sky-500/40'
                : 'bg-slate-50 hover:bg-blue-50/70 border-slate-200 text-slate-700 hover:text-blue-800 hover:border-blue-200 dark:bg-slate-800/60 dark:hover:bg-slate-700/70 dark:border-slate-700 dark:text-slate-200 dark:hover:text-sky-300 dark:hover:border-sky-700'
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-sm shrink-0">🧠</span>
              <span className="truncate text-xs">Cabeça & Sentidos</span>
            </div>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-black shrink-0 ${
                selectedZone === 'cabeca' ? 'bg-white/25 text-white' : 'bg-slate-200/70 text-slate-600 dark:bg-slate-700/70 dark:text-slate-300'
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
                ? 'bg-blue-600 border-blue-700 text-white shadow-sm shadow-blue-500/25 ring-2 ring-blue-200/80 font-black dark:ring-sky-500/40'
                : 'bg-slate-50 hover:bg-blue-50/70 border-slate-200 text-slate-700 hover:text-blue-800 hover:border-blue-200 dark:bg-slate-800/60 dark:hover:bg-slate-700/70 dark:border-slate-700 dark:text-slate-200 dark:hover:text-sky-300 dark:hover:border-sky-700'
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-sm shrink-0">❤️</span>
              <span className="truncate text-xs">Tronco & Vísceras</span>
            </div>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-black shrink-0 ${
                selectedZone === 'tronco' ? 'bg-white/25 text-white' : 'bg-slate-200/70 text-slate-600 dark:bg-slate-700/70 dark:text-slate-300'
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
                ? 'bg-blue-600 border-blue-700 text-white shadow-sm shadow-blue-500/25 ring-2 ring-blue-200/80 font-black dark:ring-sky-500/40'
                : 'bg-slate-50 hover:bg-blue-50/70 border-slate-200 text-slate-700 hover:text-blue-800 hover:border-blue-200 dark:bg-slate-800/60 dark:hover:bg-slate-700/70 dark:border-slate-700 dark:text-slate-200 dark:hover:text-sky-300 dark:hover:border-sky-700'
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
                  : 'bg-slate-200/70 text-slate-600'
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
                    ? 'bg-blue-50/95 border-blue-600 shadow-md ring-2 ring-blue-300 dark:bg-sky-950/50 dark:border-sky-500 dark:ring-sky-500/30'
                    : 'bg-white hover:bg-blue-50/50 border-blue-100 hover:border-blue-300 shadow-sm dark:bg-slate-900 dark:hover:bg-slate-800/80 dark:border-slate-800 dark:hover:border-sky-700'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-xl shrink-0 group-hover:bg-blue-100 group-hover:border-blue-300 transition-colors dark:bg-slate-800 dark:border-slate-700 dark:group-hover:bg-slate-700 dark:group-hover:border-slate-600">
                  {part.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 min-w-0 truncate">
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate font-display dark:text-white">
                        {part.name}
                      </h4>
                      {part.sex === 'feminino' && (
                        <span className="text-[9px] font-black bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.2 rounded-md shrink-0 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900/60">
                          ♀ Fem
                        </span>
                      )}
                      {part.sex === 'masculino' && (
                        <span className="text-[9px] font-black bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.2 rounded-md shrink-0 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-900/60">
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
                  <p className="text-[11px] text-slate-500 truncate font-medium mt-0.5 dark:text-slate-400">
                    {part.tagline}
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-blue-600 font-bold dark:text-sky-400">
                    <span>Abrir ficha completa</span>
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </button>
            );
          })
        ) : (
          <div className="col-span-1 sm:col-span-2 py-8 flex flex-col items-center justify-center text-center gap-3 bg-blue-50/40 rounded-2xl border border-dashed border-blue-200 p-4 dark:bg-slate-800/40 dark:border-slate-700">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-2xl dark:bg-slate-800 dark:text-sky-400">
              🔍
            </div>
            <div>
              <p className="text-sm font-black text-slate-800 font-display dark:text-slate-100">
                Nenhum órgão ou termo encontrado
              </p>
              <p className="text-xs text-slate-500 font-medium max-w-xs mt-0.5 dark:text-slate-400">
                Não encontramos resultados para "{searchTerm}". Tente pesquisar por termos como "Coração", "Rins", "Glicemia" ou "Tireoide".
              </p>
            </div>
            <button
              type="button"
              onClick={handleClearSearch}
              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              Limpar Filtros e Ver Todos
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
