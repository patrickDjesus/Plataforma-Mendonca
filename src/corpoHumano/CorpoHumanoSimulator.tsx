import React, { useState } from 'react';
import { BODY_PARTS } from './data/bodyPartsData';
import { CELL_ORGANELLES } from './data/cellData';
import { BodyPartData, BodyLayer, CellOrganelleData, BiologicalSex } from './types';
import { Header, MainViewTab } from './components/Header';
import { CartoonBody } from './components/CartoonBody';
import { XRaySlider } from './components/XRaySlider';
import { DetailModal } from './components/DetailModal';
import { BodyPartsList } from './components/BodyPartsList';
import { InteractiveCell } from './components/InteractiveCell';
import { CellOrganellesList } from './components/CellOrganellesList';
import { CellDetailModal } from './components/CellDetailModal';

interface CorpoHumanoSimulatorProps {
  onBack?: () => void;
}

export const CorpoHumanoSimulator: React.FC<CorpoHumanoSimulatorProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<MainViewTab>('celula');
  const [selectedPart, setSelectedPart] = useState<BodyPartData | null>(null);
  const [selectedOrganelle, setSelectedOrganelle] = useState<CellOrganelleData | null>(null);
  const [activeLayer, setActiveLayer] = useState<BodyLayer>('orgaos');
  const [xrayOpacity, setXrayOpacity] = useState<number>(0.35);
  const [selectedSex, setSelectedSex] = useState<BiologicalSex>('feminino');

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-50 via-blue-50/40 to-sky-50/60 dark:from-slate-950 dark:via-slate-900/70 dark:to-sky-950/30 p-3 sm:p-5 flex flex-col items-center overflow-y-auto">
      <div className="w-full max-w-7xl flex flex-col gap-4">
        <Header activeTab={activeTab} onSelectTab={setActiveTab} />

        {activeTab === 'corpo' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            <div className="lg:col-span-7 flex flex-col gap-3">
              <CartoonBody
                parts={BODY_PARTS}
                selectedPart={selectedPart}
                onSelectPart={setSelectedPart}
                activeLayer={activeLayer}
                setActiveLayer={setActiveLayer}
                xrayOpacity={xrayOpacity}
                selectedSex={selectedSex}
                onSelectSex={setSelectedSex}
              />
              <XRaySlider value={xrayOpacity} onChange={setXrayOpacity} />
            </div>

            <div className="lg:col-span-5 flex flex-col gap-4">
              <BodyPartsList
                parts={BODY_PARTS}
                selectedPart={selectedPart}
                onSelectPart={setSelectedPart}
                selectedSex={selectedSex}
                onSelectSex={setSelectedSex}
              />
            </div>
          </div>
        )}

        {activeTab === 'celula' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            <div className="lg:col-span-7 flex flex-col gap-3">
              <InteractiveCell
                organelles={CELL_ORGANELLES}
                selectedOrganelle={selectedOrganelle}
                onSelectOrganelle={setSelectedOrganelle}
              />
            </div>

            <div className="lg:col-span-5 flex flex-col gap-4">
              <CellOrganellesList
                organelles={CELL_ORGANELLES}
                selectedOrganelle={selectedOrganelle}
                onSelectOrganelle={setSelectedOrganelle}
              />
            </div>
          </div>
        )}

        <DetailModal
          part={selectedPart}
          onClose={() => setSelectedPart(null)}
          onSelectPart={setSelectedPart}
          allParts={BODY_PARTS}
        />

        <CellDetailModal
          organelle={selectedOrganelle}
          onClose={() => setSelectedOrganelle(null)}
          onSelectOrganelle={setSelectedOrganelle}
          allOrganelles={CELL_ORGANELLES}
        />

        {onBack && (
          <div className="text-center pb-2">
            <button
              onClick={onBack}
              className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shadow-2xs"
            >
              ← Voltar aos documentos de Biologia
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
