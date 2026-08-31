import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CellOrganelleData } from '../types';
import { sounds } from '../utils/audio';
import { Sparkles } from 'lucide-react';

interface InteractiveCellProps {
  organelles: CellOrganelleData[];
  selectedOrganelle: CellOrganelleData | null;
  onSelectOrganelle: (organelle: CellOrganelleData) => void;
  membraneCutOpacity?: number; // 0 (fechada) a 1 (abertura máxima para ver o interior)
}

export const InteractiveCell: React.FC<InteractiveCellProps> = ({
  organelles,
  selectedOrganelle,
  onSelectOrganelle,
  _membraneCutOpacity = 0.85,
}) => {
  const [hoveredOrganelle, setHoveredOrganelle] = useState<string | null>(null);

  const getOrganelle = (id: string) => organelles.find((o) => o.id === id);

  const handleOrganelleClick = (id: string) => {
    const organelle = getOrganelle(id);
    if (organelle) {
      if (organelle.soundType === 'electric') sounds.playSuccess();
      else if (organelle.soundType === 'sparkle') sounds.playSparkle();
      else sounds.playPop();

      onSelectOrganelle(organelle);
    }
  };

  const getHighlightClass = (id: string) => {
    const isHovered = hoveredOrganelle === id;
    const isSelected = selectedOrganelle?.id === id;

    if (isSelected) {
      return 'filter brightness-125 drop-shadow-[0_0_12px_rgba(59,130,246,0.9)] stroke-blue-500 stroke-[3px] transition-all duration-200 cursor-pointer';
    }
    if (isHovered) {
      return 'filter brightness-120 drop-shadow-[0_0_8px_rgba(56,189,248,0.7)] stroke-sky-400 stroke-[2px] transition-all duration-150 cursor-pointer';
    }
    return 'transition-all duration-200 cursor-pointer hover:brightness-110';
  };

  const hoveredObj = hoveredOrganelle ? getOrganelle(hoveredOrganelle) : null;

  return (
    <div
      id="interactive-cell-viewer"
      className="relative w-full aspect-[4/3] sm:aspect-square max-w-[560px] mx-auto bg-gradient-to-b from-blue-50/70 via-sky-50/40 to-slate-50 rounded-3xl p-4 flex items-center justify-center border-2 border-blue-100 shadow-inner select-none overflow-hidden dark:from-slate-900 dark:via-slate-800/70 dark:to-slate-950 dark:border-slate-700"
    >
      {/* Background Microscopic Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#2563eb 1.5px, transparent 1.5px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Floating Microscopic Dust / ATP particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            y: [-10, 10, -10],
            x: [-5, 5, -5],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-12 left-16 text-xs text-sky-400/60 font-mono font-bold"
        >
          ATP ⚡
        </motion.div>
        <motion.div
          animate={{
            y: [8, -8, 8],
            x: [6, -6, 6],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-16 right-20 text-xs text-indigo-400/50 font-mono font-bold"
        >
          H₂O 💧
        </motion.div>
        <motion.div
          animate={{
            y: [-6, 6, -6],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-28 right-16 text-xs text-amber-400/50 font-mono font-bold"
        >
          Na⁺ / K⁺ 🔋
        </motion.div>
      </div>

      {/* Helper Badges */}
      <div className="absolute top-3 left-3 sm:left-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm border border-blue-200 text-slate-700 text-xs font-bold shadow-sm dark:bg-slate-900/90 dark:border-slate-700 dark:text-slate-200">
        <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse dark:text-sky-400" />
        <span>Toque na organela para abrir</span>
      </div>

      <div className="absolute top-3 right-3 sm:right-4 z-20 flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50/90 backdrop-blur-sm border border-emerald-200 text-emerald-700 text-[11px] font-bold shadow-sm dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block mr-0.5" />
        <span>Ciclose & Movimento Celular</span>
      </div>

      {/* SVG Interactive Eukaryotic Cell Model */}
      <svg
        viewBox="0 0 600 600"
        className="w-full h-full max-h-[500px] drop-shadow-xl"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Radial Gradient for Cytosol */}
          <radialGradient id="cytosolGradient" cx="45%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.95" />
            <stop offset="65%" stopColor="#bae6fd" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0.85" />
          </radialGradient>

          {/* Plasma Membrane Bilayer Gradient */}
          <linearGradient id="membraneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>

          {/* Nucleus Gradient */}
          <radialGradient id="nucleusGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="50%" stopColor="#9333ea" />
            <stop offset="100%" stopColor="#6b21a8" />
          </radialGradient>

          {/* Nucleolus Gradient */}
          <radialGradient id="nucleolusGrad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#f3e8ff" />
            <stop offset="40%" stopColor="#d8b4fe" />
            <stop offset="100%" stopColor="#581c87" />
          </radialGradient>

          {/* Mitochondria Outer & Inner Matrix */}
          <linearGradient id="mitoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="60%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#9a3412" />
          </linearGradient>
          <linearGradient id="mitoMatrixGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>

          {/* Golgi Gradient */}
          <linearGradient id="golgiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="50%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>

          {/* RER Gradient */}
          <linearGradient id="rerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="70%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>

          {/* REL Gradient */}
          <linearGradient id="relGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>

          {/* Lysosome Gradient */}
          <radialGradient id="lysoGrad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#fca5a5" />
            <stop offset="60%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#991b1b" />
          </radialGradient>

          {/* Peroxisome Gradient */}
          <radialGradient id="peroxiGrad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="60%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#065f46" />
          </radialGradient>

          {/* Centriole Gradient */}
          <linearGradient id="centrioleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a5b4fc" />
            <stop offset="100%" stopColor="#4338ca" />
          </linearGradient>
        </defs>

        {/* 1. PLASMA MEMBRANE & CYTOSOL (OUTER CELL BOUNDARY) */}
        <g
          id="svg_membrana"
          className={getHighlightClass('membrana')}
          onMouseEnter={() => setHoveredOrganelle('membrana')}
          onMouseLeave={() => setHoveredOrganelle(null)}
          onClick={() => handleOrganelleClick('membrana')}
        >
          {/* Outer Lipid Bilayer Glow and Border */}
          <path
            d="M 120,280 C 100,180 170,90 280,75 C 410,60 510,130 525,250 C 540,380 470,490 350,515 C 210,540 130,470 105,380 C 95,340 105,305 120,280 Z"
            fill="url(#membraneGrad)"
            stroke="#0284c7"
            strokeWidth="10"
            strokeLinejoin="round"
            className="filter drop-shadow-md"
          />

          {/* Microvilli / Lipid Head bumps on the perimeter */}
          <path
            d="M 120,280 C 100,180 170,90 280,75 C 410,60 510,130 525,250 C 540,380 470,490 350,515 C 210,540 130,470 105,380 Z"
            fill="none"
            stroke="#e0f2fe"
            strokeWidth="3"
            strokeDasharray="4 6"
            opacity="0.8"
          />

          {/* Membrane Transport Protein Channels embedded */}
          <rect x="250" y="70" width="16" height="12" rx="4" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
          <rect x="495" y="190" width="14" height="16" rx="4" fill="#a855f7" stroke="#7e22ce" strokeWidth="1.5" />
          <rect x="400" y="495" width="18" height="12" rx="4" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
          <rect x="100" y="320" width="14" height="16" rx="4" fill="#f43f5e" stroke="#be123c" strokeWidth="1.5" />
        </g>

        {/* 2. CYTOSOL / HYALOPLASM (INTERNAL AQUEOUS MATRIX) */}
        <g
          id="svg_citosol"
          className={getHighlightClass('citosol')}
          onMouseEnter={() => setHoveredOrganelle('citosol')}
          onMouseLeave={() => setHoveredOrganelle(null)}
          onClick={() => handleOrganelleClick('citosol')}
        >
          <path
            d="M 126,280 C 108,188 174,100 278,86 C 400,72 498,138 512,250 C 526,370 460,478 348,502 C 218,526 142,460 118,376 C 110,340 116,305 126,280 Z"
            fill="url(#cytosolGradient)"
          />

          {/* Microtubules and Cytoskeleton structural filaments */}
          <g
            id="svg_citoesqueleto"
            className={getHighlightClass('citoesqueleto')}
            onMouseEnter={() => setHoveredOrganelle('citoesqueleto')}
            onMouseLeave={() => setHoveredOrganelle(null)}
            onClick={(e) => {
              e.stopPropagation();
              handleOrganelleClick('citoesqueleto');
            }}
          >
            <motion.path
              d="M 150,180 Q 230,220 300,160 T 450,220"
              fill="none"
              stroke="#60a5fa"
              strokeWidth="2.5"
              strokeDasharray="4 4"
              animate={{ opacity: [0.45, 0.85, 0.45] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.path
              d="M 160,420 Q 240,360 350,440 T 470,360"
              fill="none"
              stroke="#60a5fa"
              strokeWidth="2.5"
              strokeDasharray="4 4"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            />
            <motion.path
              d="M 210,130 Q 180,260 210,400"
              fill="none"
              stroke="#818cf8"
              strokeWidth="2.5"
              strokeDasharray="4 4"
              animate={{ opacity: [0.35, 0.75, 0.35] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            />
            <motion.path
              d="M 440,150 Q 480,290 420,440"
              fill="none"
              stroke="#818cf8"
              strokeWidth="2.5"
              strokeDasharray="4 4"
              animate={{ opacity: [0.35, 0.75, 0.35] }}
              transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
            />
          </g>
        </g>

        {/* 3. FREE RIBOSOMES (SCATTERED DOTS WITH SUBTLE BROWNIAN DRIFT) */}
        <motion.g
          id="svg_ribossomos"
          className={getHighlightClass('ribossomo')}
          onMouseEnter={() => setHoveredOrganelle('ribossomo')}
          onMouseLeave={() => setHoveredOrganelle(null)}
          onClick={() => handleOrganelleClick('ribossomo')}
          animate={{
            x: [-1.5, 1.5, -0.5, -1.5],
            y: [-1, 2, -1.5, -1],
          }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <circle cx="170" cy="200" r="3" fill="#0369a1" />
          <circle cx="176" cy="203" r="3.5" fill="#0284c7" />
          <circle cx="182" cy="198" r="2.8" fill="#0369a1" />

          <circle cx="430" cy="180" r="3" fill="#0369a1" />
          <circle cx="438" cy="184" r="3.5" fill="#0284c7" />
          <circle cx="445" cy="179" r="3" fill="#0369a1" />

          <circle cx="210" cy="440" r="3.2" fill="#0284c7" />
          <circle cx="218" cy="446" r="3.5" fill="#0369a1" />
          <circle cx="225" cy="441" r="2.8" fill="#0284c7" />

          <circle cx="460" cy="390" r="3" fill="#0369a1" />
          <circle cx="468" cy="394" r="3.2" fill="#0284c7" />
          <circle cx="475" cy="388" r="2.9" fill="#0369a1" />

          <circle cx="140" cy="300" r="3" fill="#0369a1" />
          <circle cx="146" cy="306" r="3.4" fill="#0284c7" />
        </motion.g>

        {/* 4. ROUGH ENDOPLASMIC RETICULUM (RER) - Cisternae around the Nucleus */}
        <motion.g
          id="svg_rer"
          className={getHighlightClass('rer')}
          onMouseEnter={() => setHoveredOrganelle('rer')}
          onMouseLeave={() => setHoveredOrganelle(null)}
          onClick={() => handleOrganelleClick('rer')}
          animate={{
            scale: [1, 1.015, 1],
          }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '310px 290px' }}
        >
          {/* Layer 1 */}
          <path
            d="M 230,190 C 270,165 350,165 390,200 C 400,210 395,225 380,225 C 345,195 275,195 240,220 C 228,225 220,205 230,190 Z"
            fill="url(#rerGrad)"
            stroke="#0369a1"
            strokeWidth="2"
          />
          {/* Ribosome studs on layer 1 */}
          <circle cx="250" cy="180" r="2.2" fill="#082f49" />
          <circle cx="270" cy="174" r="2.2" fill="#082f49" />
          <circle cx="295" cy="170" r="2.2" fill="#082f49" />
          <circle cx="325" cy="170" r="2.2" fill="#082f49" />
          <circle cx="355" cy="176" r="2.2" fill="#082f49" />
          <circle cx="378" cy="188" r="2.2" fill="#082f49" />

          {/* Layer 2 */}
          <path
            d="M 215,225 C 240,195 380,185 410,230 C 420,245 405,255 395,245 C 370,215 255,220 230,250 C 220,255 210,240 215,225 Z"
            fill="url(#rerGrad)"
            stroke="#0369a1"
            strokeWidth="2"
          />
          <circle cx="225" cy="220" r="2.2" fill="#082f49" />
          <circle cx="245" cy="205" r="2.2" fill="#082f49" />
          <circle cx="380" cy="205" r="2.2" fill="#082f49" />
          <circle cx="400" cy="222" r="2.2" fill="#082f49" />

          {/* Layer 3 - Bottom Fold */}
          <path
            d="M 210,360 C 230,395 375,410 410,365 C 420,350 405,340 395,350 C 365,385 255,375 230,345 C 220,340 205,350 210,360 Z"
            fill="url(#rerGrad)"
            stroke="#0369a1"
            strokeWidth="2"
          />
          <circle cx="230" cy="375" r="2.2" fill="#082f49" />
          <circle cx="260" cy="390" r="2.2" fill="#082f49" />
          <circle cx="360" cy="390" r="2.2" fill="#082f49" />
          <circle cx="395" cy="370" r="2.2" fill="#082f49" />
        </motion.g>

        {/* 5. SMOOTH ENDOPLASMIC RETICULUM (REL) - Tubular Networks */}
        <motion.g
          id="svg_rel"
          className={getHighlightClass('rel')}
          onMouseEnter={() => setHoveredOrganelle('rel')}
          onMouseLeave={() => setHoveredOrganelle(null)}
          onClick={() => handleOrganelleClick('rel')}
          animate={{
            rotate: [-1.2, 1.2, -1.2],
            y: [-1, 1, -1],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '180px 280px' }}
        >
          {/* Branching smooth tubules (No ribosomes) */}
          <path
            d="M 180,240 C 160,230 150,260 170,270 C 150,285 165,315 185,305 C 175,325 200,340 210,320 C 205,300 200,280 195,255 Z"
            fill="url(#relGrad)"
            stroke="#0891b2"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <ellipse cx="170" cy="255" rx="8" ry="5" fill="#a5f3fc" opacity="0.6" />
          <ellipse cx="180" cy="290" rx="9" ry="6" fill="#a5f3fc" opacity="0.6" />
        </motion.g>

        {/* 6. NUCLEUS & CARIOTHECA (CENTRAL COMMAND) */}
        <motion.g
          id="svg_nucleo"
          className={getHighlightClass('nucleo')}
          onMouseEnter={() => setHoveredOrganelle('nucleo')}
          onMouseLeave={() => setHoveredOrganelle(null)}
          onClick={() => handleOrganelleClick('nucleo')}
          animate={{
            scale: [1, 1.008, 1],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '310px 290px' }}
        >
          {/* Nuclear Envelope Double Layer with Chromatin */}
          <circle
            cx="310"
            cy="290"
            r="68"
            fill="url(#nucleusGrad)"
            stroke="#581c87"
            strokeWidth="4"
            className="filter drop-shadow-md"
          />

          {/* Nuclear Pores (Dotted on the perimeter) */}
          <circle cx="310" cy="222" r="3.5" fill="#f3e8ff" stroke="#6b21a8" strokeWidth="1.5" />
          <circle cx="378" cy="290" r="3.5" fill="#f3e8ff" stroke="#6b21a8" strokeWidth="1.5" />
          <circle cx="310" cy="358" r="3.5" fill="#f3e8ff" stroke="#6b21a8" strokeWidth="1.5" />
          <circle cx="242" cy="290" r="3.5" fill="#f3e8ff" stroke="#6b21a8" strokeWidth="1.5" />
          <circle cx="260" cy="240" r="3.5" fill="#f3e8ff" stroke="#6b21a8" strokeWidth="1.5" />
          <circle cx="360" cy="240" r="3.5" fill="#f3e8ff" stroke="#6b21a8" strokeWidth="1.5" />
          <circle cx="260" cy="340" r="3.5" fill="#f3e8ff" stroke="#6b21a8" strokeWidth="1.5" />
          <circle cx="360" cy="340" r="3.5" fill="#f3e8ff" stroke="#6b21a8" strokeWidth="1.5" />

          {/* Chromatin Threads / Fibers */}
          <motion.path
            d="M 270,270 Q 290,250 310,275 T 345,260 T 360,290"
            fill="none"
            stroke="#e9d5ff"
            strokeWidth="2.5"
            strokeLinecap="round"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.path
            d="M 260,310 Q 280,335 315,320 T 350,330"
            fill="none"
            stroke="#e9d5ff"
            strokeWidth="2.5"
            strokeLinecap="round"
            animate={{ opacity: [0.5, 0.75, 0.5] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />
        </motion.g>

        {/* 7. NUCLEOLUS (INSIDE NUCLEUS) */}
        <motion.g
          id="svg_nucleolo"
          className={getHighlightClass('nucleolo')}
          onMouseEnter={() => setHoveredOrganelle('nucleolo')}
          onMouseLeave={() => setHoveredOrganelle(null)}
          onClick={(e) => {
            e.stopPropagation();
            handleOrganelleClick('nucleolo');
          }}
          animate={{
            scale: [1, 1.04, 1],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '325px 280px' }}
        >
          <circle
            cx="325"
            cy="280"
            r="24"
            fill="url(#nucleolusGrad)"
            stroke="#4c1d95"
            strokeWidth="2.5"
            className="filter drop-shadow-inner"
          />
          {/* Dense core reflection */}
          <circle cx="318" cy="273" r="7" fill="#ffffff" opacity="0.4" />
        </motion.g>

        {/* 8. GOLGI APPARATUS (STACKED CURVED CISTERNAE & SECRETORY VESICLES) */}
        <motion.g
          id="svg_golgi"
          className={getHighlightClass('golgi')}
          onMouseEnter={() => setHoveredOrganelle('golgi')}
          onMouseLeave={() => setHoveredOrganelle(null)}
          onClick={() => handleOrganelleClick('golgi')}
          animate={{
            y: [-1.5, 1.5, -1.5],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Cisterna 1 (Cis face) */}
          <path
            d="M 400,240 C 425,265 425,315 400,340 C 392,348 402,356 410,348 C 438,320 438,260 410,232 C 402,224 392,232 400,240 Z"
            fill="url(#golgiGrad)"
            stroke="#1e40af"
            strokeWidth="2"
          />
          {/* Cisterna 2 (Medial) */}
          <path
            d="M 418,235 C 445,265 445,315 418,345 C 410,353 420,361 428,353 C 458,320 458,260 428,227 C 420,219 410,227 418,235 Z"
            fill="url(#golgiGrad)"
            stroke="#1e40af"
            strokeWidth="2"
          />
          {/* Cisterna 3 (Trans face) */}
          <path
            d="M 436,230 C 465,265 465,315 436,350 C 428,358 438,366 446,358 C 478,320 478,260 446,222 C 438,214 428,222 436,230 Z"
            fill="url(#golgiGrad)"
            stroke="#1e40af"
            strokeWidth="2"
          />

          {/* Secretory Vesicles budding off Trans Face - floating toward membrane */}
          <motion.circle
            cx="468"
            cy="225"
            r="7"
            fill="#60a5fa"
            stroke="#1d4ed8"
            strokeWidth="1.5"
            animate={{ x: [0, 5, 0], y: [0, -3, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.circle
            cx="482"
            cy="275"
            r="8"
            fill="#60a5fa"
            stroke="#1d4ed8"
            strokeWidth="1.5"
            animate={{ x: [0, 6, 0], y: [-1, 2, -1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          />
          <motion.circle
            cx="475"
            cy="335"
            r="7.5"
            fill="#60a5fa"
            stroke="#1d4ed8"
            strokeWidth="1.5"
            animate={{ x: [0, 5, 0], y: [0, 3, 0] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />
          <motion.circle
            cx="460"
            cy="370"
            r="6"
            fill="#60a5fa"
            stroke="#1d4ed8"
            strokeWidth="1.5"
            animate={{ x: [0, 4, 0], y: [-2, 2, -2] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          />
        </motion.g>

        {/* 9. MITOCHONDRIA 1 (Top Left - Floating & Tilting Gently) */}
        <motion.g
          id="svg_mitocondria_1"
          className={getHighlightClass('mitocondria')}
          onMouseEnter={() => setHoveredOrganelle('mitocondria')}
          onMouseLeave={() => setHoveredOrganelle(null)}
          onClick={() => handleOrganelleClick('mitocondria')}
          animate={{
            x: [-3, 4, -2, -3],
            y: [-4, 2, -3, -4],
            rotate: [-2, 2, -2],
          }}
          transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '190px 160px' }}
        >
          {/* Outer Bean Shape */}
          <path
            d="M 180,120 C 220,110 250,140 240,175 C 230,210 170,210 155,180 C 140,150 150,125 180,120 Z"
            fill="url(#mitoGrad)"
            stroke="#7c2d12"
            strokeWidth="3"
          />
          {/* Inner Matrix & Cristae (Wavy Folds) */}
          <path
            d="M 180,130 C 210,122 235,145 228,170 C 220,195 175,195 165,172 C 155,150 160,135 180,130 Z"
            fill="url(#mitoMatrixGrad)"
          />
          {/* Mitochondrial Cristae lines */}
          <path d="M 170,140 Q 195,142 180,150" fill="none" stroke="#7c2d12" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 215,145 Q 190,155 210,165" fill="none" stroke="#7c2d12" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 172,165 Q 195,168 180,178" fill="none" stroke="#7c2d12" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 205,172 Q 185,180 200,188" fill="none" stroke="#7c2d12" strokeWidth="2.5" strokeLinecap="round" />
        </motion.g>

        {/* 10. MITOCHONDRIA 2 (Bottom Right - Floating & Breathing) */}
        <motion.g
          id="svg_mitocondria_2"
          className={getHighlightClass('mitocondria')}
          onMouseEnter={() => setHoveredOrganelle('mitocondria')}
          onMouseLeave={() => setHoveredOrganelle(null)}
          onClick={() => handleOrganelleClick('mitocondria')}
          animate={{
            x: [3, -4, 2, 3],
            y: [2, -4, 3, 2],
            rotate: [1.5, -2, 1.5],
          }}
          transition={{ duration: 7.2, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          style={{ transformOrigin: '390px 450px' }}
        >
          {/* Outer Bean Shape rotated */}
          <path
            d="M 370,420 C 410,400 450,425 445,455 C 440,485 390,500 365,475 C 340,450 345,430 370,420 Z"
            fill="url(#mitoGrad)"
            stroke="#7c2d12"
            strokeWidth="3"
          />
          <path
            d="M 373,428 C 403,412 435,432 430,455 C 426,478 388,488 368,468 C 350,448 355,434 373,428 Z"
            fill="url(#mitoMatrixGrad)"
          />
          <path d="M 368,438 Q 395,436 385,448" fill="none" stroke="#7c2d12" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 420,440 Q 395,452 415,460" fill="none" stroke="#7c2d12" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 378,460 Q 400,465 388,475" fill="none" stroke="#7c2d12" strokeWidth="2.5" strokeLinecap="round" />
        </motion.g>

        {/* 11. LYSOSOMES (ACTIVE DIGESTIVE VESICLES FLOATING IN CYTOSOL) */}
        <motion.g
          id="svg_lisossomo"
          className={getHighlightClass('lisossomo')}
          onMouseEnter={() => setHoveredOrganelle('lisossomo')}
          onMouseLeave={() => setHoveredOrganelle(null)}
          onClick={() => handleOrganelleClick('lisossomo')}
          animate={{
            x: [-6, 5, -3, -6],
            y: [-4, 6, -5, -4],
          }}
          transition={{ duration: 5.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Main Lysosome */}
          <circle cx="280" cy="445" r="20" fill="url(#lysoGrad)" stroke="#b91c1c" strokeWidth="2.5" />
          {/* Internal digestive hydrolytic granules */}
          <circle cx="274" cy="440" r="3" fill="#fee2e2" opacity="0.8" />
          <circle cx="286" cy="446" r="2.5" fill="#fecaca" opacity="0.8" />
          <circle cx="278" cy="452" r="2.8" fill="#fca5a5" opacity="0.8" />

          {/* Secondary smaller lysosome */}
          <circle cx="160" cy="350" r="14" fill="url(#lysoGrad)" stroke="#b91c1c" strokeWidth="2" />
          <circle cx="156" cy="347" r="2" fill="#fee2e2" opacity="0.8" />
        </motion.g>

        {/* 12. PEROXISOMES (GREEN DETOX VESICLES WITH CATALASE CRYSTAL CORE FLOATING) */}
        <motion.g
          id="svg_peroxissomo"
          className={getHighlightClass('peroxissomo')}
          onMouseEnter={() => setHoveredOrganelle('peroxissomo')}
          onMouseLeave={() => setHoveredOrganelle(null)}
          onClick={() => handleOrganelleClick('peroxissomo')}
          animate={{
            x: [4, -5, 3, 4],
            y: [-5, 4, -2, -5],
          }}
          transition={{ duration: 6.2, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
        >
          {/* Peroxisome 1 */}
          <circle cx="450" cy="125" r="18" fill="url(#peroxiGrad)" stroke="#047857" strokeWidth="2.5" />
          {/* Crystalline Core of Catalase Enzyme */}
          <rect x="444" y="119" width="12" height="12" rx="2" fill="#a7f3d0" stroke="#065f46" strokeWidth="1.5" />

          {/* Peroxisome 2 */}
          <circle cx="140" cy="240" r="13" fill="url(#peroxiGrad)" stroke="#047857" strokeWidth="2" />
          <rect x="136" y="236" width="8" height="8" rx="1.5" fill="#a7f3d0" stroke="#065f46" strokeWidth="1" />
        </motion.g>

        {/* 13. CENTRIOLES & CENTROSOME (PERPENDICULAR MICROTUBULE BARRELS & ASTER) */}
        <motion.g
          id="svg_centriolos"
          className={getHighlightClass('centriolo')}
          onMouseEnter={() => setHoveredOrganelle('centriolo')}
          onMouseLeave={() => setHoveredOrganelle(null)}
          onClick={() => handleOrganelleClick('centriolo')}
          animate={{
            scale: [1, 1.025, 1],
          }}
          transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '242px 282px' }}
        >
          {/* Vertical Barrel Centriole */}
          <g transform="translate(230, 270)">
            <rect x="0" y="0" width="12" height="24" rx="3" fill="url(#centrioleGrad)" stroke="#312e81" strokeWidth="1.8" />
            <line x1="4" y1="2" x2="4" y2="22" stroke="#e0e7ff" strokeWidth="1" />
            <line x1="8" y1="2" x2="8" y2="22" stroke="#e0e7ff" strokeWidth="1" />
          </g>

          {/* Horizontal Barrel Centriole (90 degrees perpendicular) */}
          <g transform="translate(242, 282)">
            <rect x="0" y="0" width="24" height="12" rx="3" fill="url(#centrioleGrad)" stroke="#312e81" strokeWidth="1.8" />
            <line x1="2" y1="4" x2="22" y2="4" stroke="#e0e7ff" strokeWidth="1" />
            <line x1="2" y1="8" x2="22" y2="8" stroke="#e0e7ff" strokeWidth="1" />
          </g>

          {/* Centrosomal Aster rays */}
          <circle cx="242" cy="282" r="22" fill="none" stroke="#818cf8" strokeWidth="1" strokeDasharray="2 3" opacity="0.5" />
        </motion.g>

        {/* 14. VACUOLES / PINOCYTIC & PHAGOCYTIC VESICLES (GENTLE TRANSLUCENT FLOATING) */}
        <motion.g
          id="svg_vacuolo"
          className={getHighlightClass('vacuolo')}
          onMouseEnter={() => setHoveredOrganelle('vacuolo')}
          onMouseLeave={() => setHoveredOrganelle(null)}
          onClick={() => handleOrganelleClick('vacuolo')}
          animate={{
            x: [-5, 4, -2, -5],
            y: [3, -5, 2, 3],
          }}
          transition={{ duration: 6.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Main Vacuole / Vesicle */}
          <circle
            cx="210"
            cy="365"
            r="16"
            fill="#bae6fd"
            stroke="#0284c7"
            strokeWidth="2"
            opacity="0.85"
            className="filter drop-shadow-sm"
          />
          <circle cx="205" cy="360" r="4" fill="#ffffff" opacity="0.6" />

          {/* Secondary small endocytic vesicle */}
          <circle
            cx="480"
            cy="165"
            r="11"
            fill="#bae6fd"
            stroke="#0284c7"
            strokeWidth="1.8"
            opacity="0.85"
          />
          <circle cx="477" cy="162" r="3" fill="#ffffff" opacity="0.6" />
        </motion.g>
      </svg>

      {/* Floating Hover Card for Active Organelle */}
      <AnimatePresence>
        {hoveredObj && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-4 left-4 right-4 z-30 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border-2 border-blue-200 flex items-center justify-between pointer-events-none dark:bg-slate-900/95 dark:border-slate-700 dark:shadow-black/40"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-xl shadow-inner shrink-0 dark:bg-sky-950/50 dark:border-sky-900/60">
                {hoveredObj.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-slate-900 font-display dark:text-white">
                    {hoveredObj.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-900/60">
                    {hoveredObj.categoryLabel}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium line-clamp-1 dark:text-slate-300">
                  {hoveredObj.tagline}
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 dark:text-sky-400 dark:bg-sky-950/50 dark:border-sky-900/60">
              <span>Ver Fisiologia ENEM</span>
              <span>→</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
