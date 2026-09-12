import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RealLifeInfo } from '../types';
import { RealisticVectorGraphic } from './RealisticVectorGraphic';
import {
  Microscope,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Sparkles,
  Compass,
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface RealLifeVisualizerProps {
  id?: string;
  realLifeInfo?: RealLifeInfo;
  name: string;
  scientificName: string;
  icon: string;
  themeColor?: string;
}

export const RealLifeVisualizer: React.FC<RealLifeVisualizerProps> = ({
  id = '',
  realLifeInfo,
  name,
  scientificName,
  icon,
  themeColor = '#2D5A46',
}) => {
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  return (
    <div className="space-y-4">
      {/* Visual Header & Techniques */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#18181B] text-white rounded-2xl border border-[#2C2C30] shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-[#2D5A46]/20 text-[#52B788] border border-[#52B788]/30">
            <Microscope className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#FAF9F5] block">
              Esquema Anatômico & Ultraestrutura
            </span>
            <span className="text-[11px] text-[#52B788] font-semibold">
              {realLifeInfo?.sourceType || 'Diagrama Vetorial Científico em Alta Resolução'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {realLifeInfo?.magnificationOrScale && (
            <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-[#232326] border border-[#2C2C30] text-[#52B788]">
              📏 {realLifeInfo.magnificationOrScale}
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              setIsZoomed(true);
            }}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer border border-white/10"
            title="Expandir Diagrama Científico"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Interactive Stage: Beautiful Custom Vector Graphic */}
      <div className="relative rounded-3xl overflow-hidden bg-[#121214] border-2 border-[#2C2C30] shadow-xl group">
        <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full overflow-hidden flex items-center justify-center bg-[#121214] p-2">
          <RealisticVectorGraphic
            id={id}
            name={name}
            scientificName={scientificName}
            icon={icon}
            themeColor={themeColor}
          />

          {/* Scale Overlay Watermark */}
          <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-white text-xs flex items-center gap-2 pointer-events-none">
            <span className="text-base">{icon}</span>
            <div className="leading-tight">
              <p className="font-bold text-[#FAF9F5]">{name}</p>
              <p className="text-[10px] text-[#A8A29E] italic">{scientificName}</p>
            </div>
          </div>

          {/* Top Expand Action */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                sounds.playPop();
                setIsZoomed(true);
              }}
              className="p-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/20 transition-all cursor-pointer shadow-md"
              title="Ver em Tela Cheia"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Scientific Explanation Card */}
      {realLifeInfo && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Analysis Card */}
          <div className="p-4 rounded-2xl bg-white border border-[#E7E2D9] shadow-sm space-y-2 dark:bg-[#18181B] dark:border-[#2C2C30]">
            <div className="flex items-center gap-2 text-[#1C1917] font-bold text-xs uppercase tracking-wider dark:text-[#FAF9F5]">
              <Compass className="w-4 h-4 text-[#2D5A46] dark:text-[#52B788]" />
              <span>Como a ciência descreve esta estrutura</span>
            </div>
            <p className="text-xs text-[#44403C] leading-relaxed font-medium dark:text-[#D6D3CD]">
              {realLifeInfo.visualDescription}
            </p>
          </div>

          {/* Key Morphological Landmarks */}
          <div className="p-4 rounded-2xl bg-[#EBF3EF]/60 border border-[#CFE1D6]/80 shadow-sm space-y-2 dark:bg-[#15221B]/40 dark:border-[#22392D]">
            <div className="flex items-center gap-2 text-[#2D5A46] font-bold text-xs uppercase tracking-wider dark:text-[#52B788]">
              <CheckCircle2 className="w-4 h-4 text-[#2D5A46] dark:text-[#52B788]" />
              <span>Pontos morfológicos e ultraestruturas</span>
            </div>
            <ul className="space-y-1.5">
              {realLifeInfo.keyRealFeatures.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-1.5 text-xs text-[#44403C] font-medium dark:text-[#D6D3CD]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2D5A46] mt-1.5 shrink-0 dark:bg-[#52B788]" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Didactic Note: Why are models stylized? */}
      <div className="p-3.5 rounded-2xl bg-[#EBF3EF]/80 border border-[#CFE1D6] text-[#2D5A46] text-xs space-y-1 dark:bg-[#15221B]/40 dark:border-[#22392D] dark:text-[#52B788]">
        <div className="flex items-center gap-1.5 font-bold">
          <Sparkles className="w-4 h-4 text-[#2D5A46] shrink-0 dark:text-[#52B788]" />
          <span>Por que as ilustrações científicas usam esquemas vetoriais?</span>
        </div>
        <p className="text-[#44403C] leading-relaxed dark:text-[#D6D3CD]">
          Na biologia e no ENEM, diagramas vetoriais com destaque cromático facilitam identificar imediatamente as membranas, cristas, cisternas, túbulos e vasos condutores que seriam difíceis de discernir em fotos cinzentas de microscopia eletrônica!
        </p>
      </div>

      {/* Fullscreen Lightbox Zoom Modal */}
      <AnimatePresence>
        {isZoomed && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-4xl w-full max-h-[95vh] bg-[#121214] rounded-3xl overflow-hidden border border-[#2C2C30] flex flex-col shadow-2xl"
            >
              <div className="p-4 bg-[#18181B] border-b border-[#2C2C30] flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-white">{name} - Diagrama Vetorial</h3>
                    <p className="text-xs text-[#A8A29E]">{scientificName}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playPop();
                    setIsZoomed(false);
                  }}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <Minimize2 className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-[#121214]">
                <div className="w-full max-w-2xl aspect-[4/3]">
                  <RealisticVectorGraphic
                    id={id}
                    name={name}
                    scientificName={scientificName}
                    icon={icon}
                    themeColor={themeColor}
                  />
                </div>
              </div>

              {realLifeInfo && (
                <div className="p-3 bg-[#18181B] text-xs text-[#D6D3CD] text-center border-t border-[#2C2C30]">
                  {realLifeInfo.visualDescription}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
