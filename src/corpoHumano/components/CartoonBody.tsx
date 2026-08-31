import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BodyPartData, BodyLayer, BiologicalSex } from '../types';
import { sounds } from '../utils/audio';
import { ZoomIn, ZoomOut, RotateCcw, Sparkles } from 'lucide-react';

interface CartoonBodyProps {
  parts: BodyPartData[];
  selectedPart: BodyPartData | null;
  onSelectPart: (part: BodyPartData) => void;
  activeLayer: BodyLayer;
  setActiveLayer: (layer: BodyLayer) => void;
  xrayOpacity: number; // 0 to 1
  gameTargetId?: string | null;
  selectedSex: BiologicalSex;
  onSelectSex: (sex: BiologicalSex) => void;
}

export const CartoonBody: React.FC<CartoonBodyProps> = ({
  parts,
  selectedPart,
  onSelectPart,
  activeLayer,
  _setActiveLayer,
  xrayOpacity,
  gameTargetId,
  selectedSex,
  onSelectSex,
}) => {
  const [hoveredPartId, setHoveredPartId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [eyeOffset, setEyeOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [blinking, setBlinking] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Eye tracking mouse movement
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 6;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 6;
    setEyeOffset({ x: Math.max(-4, Math.min(4, x)), y: Math.max(-4, Math.min(4, y)) });
  };

  // Blinking loop
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 160);
    }, 3800);
    return () => clearInterval(blinkInterval);
  }, []);

  const handlePartClick = (partId: string) => {
    const part = parts.find((p) => p.id === partId);
    if (part) {
      if (part.soundType === 'heartbeat') sounds.playHeartbeat();
      else if (part.soundType === 'breath') sounds.playBreath();
      else if (part.soundType === 'electric') sounds.playSparkle();
      else sounds.playPop();

      onSelectPart(part);
    }
  };

  const getPartById = (id: string) => parts.find((p) => p.id === id);
  const isHighlighted = (id: string) => {
    if (gameTargetId) return gameTargetId === id;
    if (selectedPart?.id === id) return true;
    if (hoveredPartId === id) return true;
    return false;
  };

  // Computed opacity based on activeLayer and xray slider
  const showOrgans = activeLayer === 'orgaos' || xrayOpacity > 0.15;
  const showSkeleton = activeLayer === 'esqueleto' || (activeLayer === 'orgaos' && xrayOpacity > 0.65);
  const showMuscles = activeLayer === 'musculos';
  const showVessels = activeLayer === 'circulacao' || (showOrgans && xrayOpacity > 0.4);
  const skinOpacity = activeLayer === 'externo' ? Math.max(0.2, 1 - xrayOpacity * 0.85) : Math.max(0.15, 0.4 - xrayOpacity * 0.3);

  const hoveredPartObj = hoveredPartId ? getPartById(hoveredPartId) : null;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      id="cartoon-body-viewer"
      className="relative flex flex-col items-center justify-center w-full min-h-[560px] lg:min-h-[660px] bg-gradient-to-b from-blue-50/50 via-white to-sky-50/60 dark:from-sky-950/30 dark:via-slate-900 dark:to-blue-950/30 rounded-3xl p-4 border-2 border-blue-100 dark:border-slate-800 shadow-xl shadow-blue-900/5 dark:shadow-black/40 select-none overflow-hidden"
    >
      {/* Floating Info Pill & Biological Sex Switcher */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 shadow-sm border border-blue-200/80 dark:border-slate-700 text-xs font-bold text-blue-900 dark:text-sky-300 pointer-events-auto backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-blue-600 animate-spin" style={{ animationDuration: '8s' }} />
          <span>Toque na estrutura para ver a fisiologia e questões ENEM</span>
        </div>

        {/* Biological Sex Switcher */}
        <div className="ml-auto flex items-center bg-white/95 p-1 rounded-2xl shadow-md border border-blue-100 dark:bg-slate-900/95 dark:border-slate-700 pointer-events-auto backdrop-blur-md">
          <button
            type="button"
            id="btn-sex-feminino"
            onClick={() => {
              sounds.playPop();
              onSelectSex('feminino');
            }}
            className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedSex === 'feminino'
                ? 'bg-rose-500 text-white shadow-sm ring-2 ring-rose-200 dark:ring-rose-900/60'
                : 'text-slate-600 hover:bg-rose-50 hover:text-rose-700 dark:text-slate-300 dark:hover:bg-rose-950/40 dark:hover:text-rose-300'
            }`}
          >
            <span>👩</span>
            <span>Feminino</span>
          </button>
          <button
            type="button"
            id="btn-sex-masculino"
            onClick={() => {
              sounds.playPop();
              onSelectSex('masculino');
            }}
            className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedSex === 'masculino'
                ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-200 dark:ring-sky-900/60'
                : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-sky-950/40 dark:hover:text-sky-300'
            }`}
          >
            <span>👨</span>
            <span>Masculino</span>
          </button>
        </div>
      </div>

      {/* Floating Hover Card */}
      <AnimatePresence>
        {hoveredPartObj && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none bg-slate-900/95 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-xl border border-blue-400/40 flex items-center gap-3 text-center max-w-sm"
          >
            <span className="text-2xl">{hoveredPartObj.icon}</span>
            <div className="text-left">
              <p className="text-sm font-black text-sky-300 font-display">
                {hoveredPartObj.name}
              </p>
              <p className="text-xs text-slate-300 truncate max-w-[220px]">
                {hoveredPartObj.tagline}
              </p>
            </div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold bg-blue-500/30 text-sky-200 px-2 py-0.5 rounded-full border border-sky-400/40 shrink-0">
              Ver ENEM
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive SVG Body Container */}
      <motion.div
        className="w-full h-full max-w-[460px] flex items-center justify-center relative cursor-pointer"
        animate={{ scale: zoomLevel }}
        transition={{ type: 'spring', stiffness: 260, damping: 25 }}
      >
        <svg
          viewBox="0 0 500 820"
          className="w-full h-auto max-h-[580px] drop-shadow-xl overflow-visible"
          style={{ transformOrigin: 'center center' }}
        >
          <defs>
            {/* Soft Blue and Natural Gradients */}
            <linearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fde8d7" />
              <stop offset="100%" stopColor="#f8caa5" />
            </linearGradient>
            {/* Feminine / Masculine Gradients */}
            <linearGradient id="hairGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="femaleHairGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#831843" />
              <stop offset="50%" stopColor="#be185d" />
              <stop offset="100%" stopColor="#4c0519" />
            </linearGradient>
            <linearGradient id="clothesGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id="femaleTopGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
            <linearGradient id="shortsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <linearGradient id="femaleShortsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9333ea" />
              <stop offset="100%" stopColor="#6b21a8" />
            </linearGradient>
            <linearGradient id="uterusGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fda4af" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
            <linearGradient id="ovaryGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
            <linearGradient id="prostateGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#7e22ce" />
            </linearGradient>
            <linearGradient id="testisGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#bae6fd" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id="heartGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#be123c" />
            </linearGradient>
            <linearGradient id="brainGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#7e22ce" />
            </linearGradient>
            <linearGradient id="lungsGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id="boneGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
            <linearGradient id="muscleGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#c2410c" />
            </linearGradient>

            {/* Glowing filter for highlighted parts (high contrast, bright edge, no movement) */}
            <filter id="cartoonGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#38bdf8" floodOpacity="1" />
              <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="#0284c7" floodOpacity="0.8" />
            </filter>
            <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0f172a" floodOpacity="0.12" />
            </filter>
          </defs>

          {/* BACKGROUND SHADOW ON FLOOR */}
          <ellipse cx="250" cy="790" rx="140" ry="18" fill="#cbd5e1" opacity="0.6" />

          {/* ================= LAYER 1: BASE BODY SILHOUETTE & SKIN ================= */}
          <g
            id="layer-exterior"
            opacity={skinOpacity}
            className="transition-opacity duration-300"
          >
            {/* Left Arm (Viewer's Left) */}
            <path
              id="svg_pele_braco_esq"
              onClick={() => handlePartClick('pele')}
              onMouseEnter={() => setHoveredPartId('pele')}
              onMouseLeave={() => setHoveredPartId(null)}
              d="M 175 250 C 130 270 110 330 115 390 C 120 440 115 480 110 520 C 105 540 125 550 135 540 C 145 500 150 450 150 400 C 150 350 175 290 190 270 Z"
              fill={isHighlighted('pele') ? '#ffe4d0' : 'url(#skinGrad)'}
              stroke={isHighlighted('pele') ? '#0284c7' : '#0f172a'}
              strokeWidth={isHighlighted('pele') ? '5' : '4'}
              strokeLinejoin="round"
              className="cursor-pointer transition-colors duration-200"
            />
            {/* Right Arm (Viewer's Right) */}
            <path
              id="svg_pele_braco_dir"
              onClick={() => handlePartClick('pele')}
              onMouseEnter={() => setHoveredPartId('pele')}
              onMouseLeave={() => setHoveredPartId(null)}
              d="M 325 250 C 370 270 390 330 385 390 C 380 440 385 480 390 520 C 395 540 375 550 365 540 C 355 500 350 450 350 400 C 350 350 325 290 310 270 Z"
              fill={isHighlighted('pele') ? '#ffe4d0' : 'url(#skinGrad)'}
              stroke={isHighlighted('pele') ? '#0284c7' : '#0f172a'}
              strokeWidth={isHighlighted('pele') ? '5' : '4'}
              strokeLinejoin="round"
              className="cursor-pointer transition-colors duration-200"
            />

            {/* Left Leg */}
            <path
              d="M 195 490 C 190 550 185 610 185 670 C 185 710 180 740 180 760 C 170 765 150 765 145 775 C 140 785 155 790 185 790 C 215 790 220 780 220 760 C 220 710 225 640 230 550 C 230 520 225 500 220 490 Z"
              fill="url(#skinGrad)"
              stroke="#0f172a"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Right Leg */}
            <path
              d="M 305 490 C 310 550 315 610 315 670 C 315 710 320 740 320 760 C 330 765 350 765 355 775 C 360 785 345 790 315 790 C 285 790 280 780 280 760 C 280 710 275 640 270 550 C 270 520 275 500 280 490 Z"
              fill="url(#skinGrad)"
              stroke="#0f172a"
              strokeWidth="4"
              strokeLinejoin="round"
            />

            {/* Torso */}
            <path
              d="M 180 240 C 180 210 320 210 320 240 C 335 300 335 410 325 490 C 315 520 185 520 175 490 C 165 410 165 300 180 240 Z"
              fill="url(#skinGrad)"
              stroke="#0f172a"
              strokeWidth="4"
              strokeLinejoin="round"
            />

            {/* Cartoon Clothes / Shorts / Top */}
            {selectedSex === 'feminino' ? (
              <>
                {/* Feminine Athletic Top */}
                <path
                  d="M 185 240 C 185 240 205 285 250 285 C 295 285 315 240 315 240 L 320 330 C 310 345 190 345 180 330 Z"
                  fill="url(#femaleTopGrad)"
                  stroke="#0f172a"
                  strokeWidth="3.5"
                />
                {/* Feminine Sports Shorts */}
                <path
                  d="M 175 435 C 175 430 325 430 325 435 C 330 480 330 515 315 530 C 295 530 275 520 250 510 C 225 520 205 530 185 530 C 170 515 170 480 175 435 Z"
                  fill="url(#femaleShortsGrad)"
                  stroke="#0f172a"
                  strokeWidth="3.5"
                />
                <rect x="238" y="440" width="24" height="14" rx="4" fill="#f472b6" stroke="#0f172a" strokeWidth="2" />
              </>
            ) : (
              <>
                {/* Cartoon Blue Shorts */}
                <path
                  d="M 175 440 C 175 435 325 435 325 440 C 330 490 330 520 315 540 C 295 540 275 530 250 515 C 225 530 205 540 185 540 C 170 520 170 490 175 440 Z"
                  fill="url(#shortsGrad)"
                  stroke="#0f172a"
                  strokeWidth="3.5"
                />
                {/* Belt Detail */}
                <rect x="238" y="445" width="24" height="18" rx="4" fill="#60a5fa" stroke="#0f172a" strokeWidth="2.5" />
              </>
            )}

            {/* Neck */}
            <path d="M 225 210 L 225 245 C 225 250 275 250 275 245 L 275 210 Z" fill="url(#skinGrad)" stroke="#0f172a" strokeWidth="4" />

            {/* Head Base */}
            <ellipse cx="250" cy="140" rx="72" ry="75" fill="url(#skinGrad)" stroke="#0f172a" strokeWidth="4.5" />

            {/* Cheeks blush */}
            <circle cx="205" cy="155" r="14" fill={selectedSex === 'feminino' ? '#fb7185' : '#38bdf8'} opacity="0.3" />
            <circle cx="295" cy="155" r="14" fill={selectedSex === 'feminino' ? '#fb7185' : '#38bdf8'} opacity="0.3" />

            {/* Cartoon Hair (Feminine Long Locks or Masculine Classic Crop) */}
            {selectedSex === 'feminino' ? (
              <g id="hair-feminino">
                {/* Back hair flowing past shoulders */}
                <path
                  d="M 170 140 C 150 190 145 270 160 330 C 170 340 185 320 180 280 C 175 230 180 180 185 150 Z"
                  fill="url(#femaleHairGrad)"
                  stroke="#0f172a"
                  strokeWidth="3.5"
                />
                <path
                  d="M 330 140 C 350 190 355 270 340 330 C 330 340 315 320 320 280 C 325 230 320 180 315 150 Z"
                  fill="url(#femaleHairGrad)"
                  stroke="#0f172a"
                  strokeWidth="3.5"
                />
                {/* Front hair and stylish bangs */}
                <path
                  d="M 175 130 C 165 70 205 40 250 40 C 295 40 335 70 325 130 C 335 110 325 70 295 50 C 265 35 215 35 185 60 C 170 80 165 110 175 130 Z"
                  fill="url(#femaleHairGrad)"
                  stroke="#0f172a"
                  strokeWidth="4"
                />
                {/* Cute side bangs */}
                <path
                  d="M 180 90 C 190 115 205 130 220 135 C 205 125 195 105 190 90 Z"
                  fill="#9d174d"
                />
                <path
                  d="M 320 90 C 310 115 295 130 280 135 C 295 125 305 105 310 90 Z"
                  fill="#9d174d"
                />
              </g>
            ) : (
              <path
                d="M 178 125 C 170 70 210 45 250 45 C 290 45 330 70 322 125 C 335 105 330 75 305 55 C 275 35 225 35 195 55 C 170 75 165 105 178 125 Z"
                fill="url(#hairGrad)"
                stroke="#0f172a"
                strokeWidth="4"
              />
            )}
          </g>

          {/* ================= LAYER 2: MUSCLES (When active) ================= */}
          {showMuscles && (
            <g
              id="layer-musculos"
              onClick={() => handlePartClick('musculos')}
              onMouseEnter={() => setHoveredPartId('musculos')}
              onMouseLeave={() => setHoveredPartId(null)}
              className="cursor-pointer animate-in fade-in duration-300 transition-all hover:brightness-125"
              filter={isHighlighted('musculos') ? 'url(#cartoonGlow)' : undefined}
            >
              {/* Pectorals */}
              <path d="M 195 260 C 220 255 245 270 248 295 C 220 305 190 295 195 260 Z" fill="url(#muscleGrad)" stroke={isHighlighted('musculos') ? '#38bdf8' : '#9a3412'} strokeWidth={isHighlighted('musculos') ? '3.5' : '2.5'} opacity="0.95" />
              <path d="M 305 260 C 280 255 255 270 252 295 C 280 305 310 295 305 260 Z" fill="url(#muscleGrad)" stroke={isHighlighted('musculos') ? '#38bdf8' : '#9a3412'} strokeWidth={isHighlighted('musculos') ? '3.5' : '2.5'} opacity="0.95" />

              {/* Abs (Six-pack) */}
              <g opacity="0.95">
                <rect x="220" y="310" width="26" height="22" rx="6" fill="url(#muscleGrad)" stroke={isHighlighted('musculos') ? '#38bdf8' : '#9a3412'} strokeWidth="2" />
                <rect x="254" y="310" width="26" height="22" rx="6" fill="url(#muscleGrad)" stroke={isHighlighted('musculos') ? '#38bdf8' : '#9a3412'} strokeWidth="2" />
                <rect x="220" y="338" width="26" height="22" rx="6" fill="url(#muscleGrad)" stroke={isHighlighted('musculos') ? '#38bdf8' : '#9a3412'} strokeWidth="2" />
                <rect x="254" y="338" width="26" height="22" rx="6" fill="url(#muscleGrad)" stroke={isHighlighted('musculos') ? '#38bdf8' : '#9a3412'} strokeWidth="2" />
                <rect x="222" y="366" width="25" height="22" rx="6" fill="url(#muscleGrad)" stroke={isHighlighted('musculos') ? '#38bdf8' : '#9a3412'} strokeWidth="2" />
                <rect x="253" y="366" width="25" height="22" rx="6" fill="url(#muscleGrad)" stroke={isHighlighted('musculos') ? '#38bdf8' : '#9a3412'} strokeWidth="2" />
              </g>

              {/* Biceps */}
              <ellipse cx="145" cy="330" rx="16" ry="24" transform="rotate(-15 145 330)" fill="url(#muscleGrad)" stroke={isHighlighted('musculos') ? '#38bdf8' : '#9a3412'} strokeWidth="2.5" opacity="0.95" />
              <ellipse cx="355" cy="330" rx="16" ry="24" transform="rotate(15 355 330)" fill="url(#muscleGrad)" stroke={isHighlighted('musculos') ? '#38bdf8' : '#9a3412'} strokeWidth="2.5" opacity="0.95" />

              {/* Quadriceps (Thighs) */}
              <ellipse cx="205" cy="560" rx="20" ry="45" fill="url(#muscleGrad)" stroke={isHighlighted('musculos') ? '#38bdf8' : '#9a3412'} strokeWidth="2.5" opacity="0.95" />
              <ellipse cx="295" cy="560" rx="20" ry="45" fill="url(#muscleGrad)" stroke={isHighlighted('musculos') ? '#38bdf8' : '#9a3412'} strokeWidth="2.5" opacity="0.95" />
            </g>
          )}

          {/* ================= LAYER 3: SKELETON / BONES ================= */}
          {showSkeleton && (
            <g
              id="layer-esqueleto"
              onClick={() => handlePartClick('ossos')}
              onMouseEnter={() => setHoveredPartId('ossos')}
              onMouseLeave={() => setHoveredPartId(null)}
              className="cursor-pointer animate-in fade-in duration-300 transition-all hover:brightness-125"
              filter={isHighlighted('ossos') ? 'url(#cartoonGlow)' : undefined}
            >
              {/* Skull Outline */}
              <ellipse cx="250" cy="135" rx="55" ry="50" fill={isHighlighted('ossos') ? '#f0f9ff' : 'url(#boneGrad)'} stroke={isHighlighted('ossos') ? '#0284c7' : '#475569'} strokeWidth={isHighlighted('ossos') ? '4' : '3'} />
              {/* Eye Sockets skeleton */}
              <ellipse cx="230" cy="135" rx="12" ry="14" fill="#1e293b" />
              <ellipse cx="270" cy="135" rx="12" ry="14" fill="#1e293b" />

              {/* Spine (Coluna Vertebral) */}
              <g id="svg_coluna">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <rect
                    key={`vert_${i}`}
                    x="242"
                    y={225 + i * 22}
                    width="16"
                    height="16"
                    rx="4"
                    fill={isHighlighted('ossos') ? '#e0f2fe' : 'url(#boneGrad)'}
                    stroke={isHighlighted('ossos') ? '#0284c7' : '#475569'}
                    strokeWidth="2"
                  />
                ))}
              </g>

              {/* Ribcage (Costelas) */}
              <g id="svg_costelas">
                {[0, 1, 2, 3, 4].map((i) => (
                  <g key={`rib_${i}`}>
                    <path
                      d={`M 242 ${260 + i * 20} C 190 ${260 + i * 20} 185 ${280 + i * 20} 242 ${290 + i * 20}`}
                      fill="none"
                      stroke={isHighlighted('ossos') ? '#38bdf8' : '#94a3b8'}
                      strokeWidth={isHighlighted('ossos') ? '6' : '5'}
                      strokeLinecap="round"
                    />
                    <path
                      d={`M 258 ${260 + i * 20} C 310 ${260 + i * 20} 315 ${280 + i * 20} 258 ${290 + i * 20}`}
                      fill="none"
                      stroke={isHighlighted('ossos') ? '#38bdf8' : '#94a3b8'}
                      strokeWidth={isHighlighted('ossos') ? '6' : '5'}
                      strokeLinecap="round"
                    />
                  </g>
                ))}
                {/* Sternum (peito) */}
                <rect x="246" y="255" width="8" height="90" rx="3" fill="#ffffff" stroke={isHighlighted('ossos') ? '#0284c7' : '#475569'} strokeWidth="2" />
              </g>

              {/* Pelvis (Bacia) */}
              <path
                d="M 200 425 C 200 405 300 405 300 425 C 315 455 285 475 250 460 C 215 475 185 455 200 425 Z"
                fill={isHighlighted('ossos') ? '#e0f2fe' : 'url(#boneGrad)'}
                stroke={isHighlighted('ossos') ? '#0284c7' : '#475569'}
                strokeWidth={isHighlighted('ossos') ? '4' : '3'}
              />

              {/* Long Leg Bones (Femur) */}
              <line x1="215" y1="460" x2="200" y2="600" stroke={isHighlighted('ossos') ? '#bae6fd' : '#cbd5e1'} strokeWidth="14" strokeLinecap="round" />
              <line x1="285" y1="460" x2="300" y2="600" stroke={isHighlighted('ossos') ? '#bae6fd' : '#cbd5e1'} strokeWidth="14" strokeLinecap="round" />
            </g>
          )}

          {/* ================= LAYER 4: BLOOD VESSELS (Circulação) ================= */}
          {showVessels && (
            <g id="layer-circulacao" opacity="0.85" className="animate-in fade-in duration-300">
              {/* Arteries (Red) */}
              <path
                d="M 245 285 L 245 220 C 245 200 235 170 235 150 M 245 285 C 230 300 200 320 150 350 M 245 295 L 245 420 C 245 450 220 520 205 650 L 195 760"
                fill="none"
                stroke="#ef4444"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray="6,3"
              />
              {/* Veins (Blue) */}
              <path
                d="M 255 285 L 255 220 C 255 200 265 170 265 150 M 255 285 C 270 300 300 320 350 350 M 255 295 L 255 420 C 255 450 280 520 295 650 L 305 760"
                fill="none"
                stroke="#2563eb"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray="6,3"
              />
            </g>
          )}

          {/* ================= LAYER 5: INTERNAL ORGANS ================= */}
          {showOrgans && (
            <g id="layer-orgaos" className="transition-all duration-300">
              {/* 1. BRAIN (Cérebro) */}
              <g
                id="svg_cerebro"
                onClick={() => handlePartClick('cerebro')}
                onMouseEnter={() => setHoveredPartId('cerebro')}
                onMouseLeave={() => setHoveredPartId(null)}
                className="cursor-pointer transition-all duration-200 hover:brightness-125 hover:saturate-150"
                filter={isHighlighted('cerebro') ? 'url(#cartoonGlow)' : undefined}
              >
                <path
                  d="M 215 125 C 205 110 210 85 235 80 C 245 70 265 70 275 85 C 295 85 300 110 285 125 C 295 140 285 155 270 155 C 255 160 245 160 230 155 C 215 150 205 135 215 125 Z"
                  fill="url(#brainGrad)"
                  stroke={isHighlighted('cerebro') ? '#38bdf8' : '#581c87'}
                  strokeWidth={isHighlighted('cerebro') ? '4.5' : '3.5'}
                />
                <path d="M 230 95 Q 240 110 235 125 M 265 95 Q 260 110 265 125 M 245 90 Q 255 120 250 145" fill="none" stroke={isHighlighted('cerebro') ? '#60a5fa' : '#4c1d95'} strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="268" cy="74" r="3.5" fill="#38bdf8" className="animate-ping" style={{ animationDuration: '2s' }} />
              </g>

              {/* 2. THYROID (Tireoide) */}
              <g
                id="svg_tireoide"
                onClick={() => handlePartClick('tireoide')}
                onMouseEnter={() => setHoveredPartId('tireoide')}
                onMouseLeave={() => setHoveredPartId(null)}
                className="cursor-pointer transition-all duration-200 hover:brightness-130 hover:saturate-150"
                filter={isHighlighted('tireoide') ? 'url(#cartoonGlow)' : undefined}
              >
                {/* Butterfly shape on neck */}
                <path
                  d="M 240 220 C 235 215 228 220 232 230 C 235 235 245 232 250 228 C 255 232 265 235 268 230 C 272 220 265 215 260 220 C 255 225 245 225 240 220 Z"
                  fill={isHighlighted('tireoide') ? '#f43f5e' : '#f472b6'}
                  stroke={isHighlighted('tireoide') ? '#38bdf8' : '#be185d'}
                  strokeWidth={isHighlighted('tireoide') ? '3.5' : '2.2'}
                />
              </g>

              {/* 3. LUNGS (Pulmões) - Breathing animation */}
              <g
                id="svg_pulmoes"
                onClick={() => handlePartClick('pulmoes')}
                onMouseEnter={() => setHoveredPartId('pulmoes')}
                onMouseLeave={() => setHoveredPartId(null)}
                className="cursor-pointer transition-all duration-200 hover:brightness-125 hover:saturate-150"
                filter={isHighlighted('pulmoes') ? 'url(#cartoonGlow)' : undefined}
              >
                {/* Right Lung */}
                <path
                  d="M 200 245 C 215 240 232 250 232 280 C 232 315 220 335 195 330 C 180 325 175 285 185 260 C 190 250 195 245 200 245 Z"
                  fill="url(#lungsGrad)"
                  stroke={isHighlighted('pulmoes') ? '#38bdf8' : '#0369a1'}
                  strokeWidth={isHighlighted('pulmoes') ? '4.5' : '3'}
                />
                {/* Left Lung */}
                <path
                  d="M 300 245 C 285 240 268 250 268 275 C 268 305 280 335 305 330 C 320 325 325 285 315 260 C 310 250 305 245 300 245 Z"
                  fill="url(#lungsGrad)"
                  stroke={isHighlighted('pulmoes') ? '#38bdf8' : '#0369a1'}
                  strokeWidth={isHighlighted('pulmoes') ? '4.5' : '3'}
                />
                <path d="M 250 235 L 250 255 L 220 275 M 250 255 L 280 275" fill="none" stroke={isHighlighted('pulmoes') ? '#60a5fa' : '#0284c7'} strokeWidth="2.5" strokeLinecap="round" />
              </g>

              {/* 4. HEART (Coração) - Pulsing animation */}
              <g
                id="svg_coracao"
                onClick={() => handlePartClick('coracao')}
                onMouseEnter={() => setHoveredPartId('coracao')}
                onMouseLeave={() => setHoveredPartId(null)}
                className="cursor-pointer transition-all duration-200 hover:brightness-125 hover:saturate-150"
                filter={isHighlighted('coracao') ? 'url(#cartoonGlow)' : undefined}
              >
                <path
                  d="M 260 275 C 255 265 242 265 237 275 C 230 288 245 305 260 318 C 275 305 290 288 283 275 C 278 265 265 265 260 275 Z"
                  fill="url(#heartGrad)"
                  stroke={isHighlighted('coracao') ? '#38bdf8' : '#881337'}
                  strokeWidth={isHighlighted('coracao') ? '4.5' : '3'}
                  className="drop-shadow-md"
                />
                <path d="M 253 268 C 253 258 265 258 268 265" fill="none" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
                <path d="M 265 268 C 265 258 277 258 280 266" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />
                <circle cx="260" cy="292" r="16" fill="none" stroke="#f43f5e" strokeWidth="1.5" opacity="0.6" className="animate-ping" style={{ animationDuration: '1.2s' }} />
              </g>

              {/* 5. LIVER (Fígado) */}
              <g
                id="svg_figado"
                onClick={() => handlePartClick('figado')}
                onMouseEnter={() => setHoveredPartId('figado')}
                onMouseLeave={() => setHoveredPartId(null)}
                className="cursor-pointer transition-all duration-200 hover:brightness-125 hover:saturate-150"
                filter={isHighlighted('figado') ? 'url(#cartoonGlow)' : undefined}
              >
                <path
                  d="M 200 335 C 235 325 255 330 260 345 C 262 360 240 375 210 370 C 195 365 190 345 200 335 Z"
                  fill={isHighlighted('figado') ? '#d97706' : '#b45309'}
                  stroke={isHighlighted('figado') ? '#38bdf8' : '#78350f'}
                  strokeWidth={isHighlighted('figado') ? '4' : '2.8'}
                />
                <path d="M 208 340 Q 230 334 245 338" fill="none" stroke="#fef08a" strokeWidth="2" opacity="0.6" strokeLinecap="round" />
              </g>

              {/* 6. STOMACH (Estômago) */}
              <g
                id="svg_estomago"
                onClick={() => handlePartClick('estomago')}
                onMouseEnter={() => setHoveredPartId('estomago')}
                onMouseLeave={() => setHoveredPartId(null)}
                className="cursor-pointer transition-all duration-200 hover:brightness-125 hover:saturate-150"
                filter={isHighlighted('estomago') ? 'url(#cartoonGlow)' : undefined}
              >
                <path
                  d="M 255 338 C 275 335 295 345 290 370 C 285 390 260 395 248 385 C 240 378 245 360 255 338 Z"
                  fill={isHighlighted('estomago') ? '#34d399' : '#10b981'}
                  stroke={isHighlighted('estomago') ? '#38bdf8' : '#065f46'}
                  strokeWidth={isHighlighted('estomago') ? '4' : '2.8'}
                />
                <circle cx="272" cy="365" r="4" fill="#a7f3d0" stroke="#047857" strokeWidth="1.5" />
              </g>

              {/* 7. PANCREAS (Pâncreas) */}
              <g
                id="svg_pancreas"
                onClick={() => handlePartClick('pancreas')}
                onMouseEnter={() => setHoveredPartId('pancreas')}
                onMouseLeave={() => setHoveredPartId(null)}
                className="cursor-pointer transition-all duration-200 hover:brightness-130 hover:saturate-150"
                filter={isHighlighted('pancreas') ? 'url(#cartoonGlow)' : undefined}
              >
                <path
                  d="M 230 365 C 245 360 270 365 275 372 C 275 378 250 378 230 372 Z"
                  fill={isHighlighted('pancreas') ? '#fde047' : '#eab308'}
                  stroke={isHighlighted('pancreas') ? '#38bdf8' : '#a16207'}
                  strokeWidth={isHighlighted('pancreas') ? '3.5' : '2'}
                />
              </g>

              {/* 8. KIDNEYS (Rins) */}
              <g
                id="svg_rins"
                onClick={() => handlePartClick('rins')}
                onMouseEnter={() => setHoveredPartId('rins')}
                onMouseLeave={() => setHoveredPartId(null)}
                className="cursor-pointer transition-all duration-200 hover:brightness-125 hover:saturate-150"
                filter={isHighlighted('rins') ? 'url(#cartoonGlow)' : undefined}
              >
                <path
                  d="M 205 380 C 218 380 224 392 220 405 C 215 415 200 415 195 402 C 192 390 198 380 205 380 Z"
                  fill={isHighlighted('rins') ? '#38bdf8' : '#0284c7'}
                  stroke={isHighlighted('rins') ? '#ffffff' : '#0369a1'}
                  strokeWidth={isHighlighted('rins') ? '3.5' : '2.5'}
                />
                <path
                  d="M 295 375 C 308 375 314 387 310 400 C 305 410 290 410 285 397 C 282 385 288 375 295 375 Z"
                  fill={isHighlighted('rins') ? '#38bdf8' : '#0284c7'}
                  stroke={isHighlighted('rins') ? '#ffffff' : '#0369a1'}
                  strokeWidth={isHighlighted('rins') ? '3.5' : '2.5'}
                />
              </g>

              {/* 9. INTESTINO GROSSO */}
              <g
                id="svg_intestino_grosso"
                onClick={() => handlePartClick('intestino_grosso')}
                onMouseEnter={() => setHoveredPartId('intestino_grosso')}
                onMouseLeave={() => setHoveredPartId(null)}
                className="cursor-pointer transition-all duration-200 hover:brightness-125 hover:saturate-150"
                filter={isHighlighted('intestino_grosso') ? 'url(#cartoonGlow)' : undefined}
              >
                <path
                  d="M 215 440 L 215 400 C 215 390 285 390 285 400 L 285 445"
                  fill="none"
                  stroke={isHighlighted('intestino_grosso') ? '#fb7185' : '#f43f5e'}
                  strokeWidth={isHighlighted('intestino_grosso') ? '13' : '11'}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>

              {/* 10. INTESTINO DELGADO */}
              <g
                id="svg_intestino_delgado"
                onClick={() => handlePartClick('intestino_delgado')}
                onMouseEnter={() => setHoveredPartId('intestino_delgado')}
                onMouseLeave={() => setHoveredPartId(null)}
                className="cursor-pointer transition-all duration-200 hover:brightness-125 hover:saturate-150"
                filter={isHighlighted('intestino_delgado') ? 'url(#cartoonGlow)' : undefined}
              >
                <path
                  d="M 230 405 Q 270 410 235 420 Q 268 425 230 435 Q 265 445 250 455"
                  fill="none"
                  stroke={isHighlighted('intestino_delgado') ? '#fda4af' : '#fb7185'}
                  strokeWidth={isHighlighted('intestino_delgado') ? '10' : '8'}
                  strokeLinecap="round"
                />
              </g>

              {/* 11. BEXIGA URINÁRIA */}
              <g
                id="svg_bexiga"
                onClick={() => handlePartClick('bexiga')}
                onMouseEnter={() => setHoveredPartId('bexiga')}
                onMouseLeave={() => setHoveredPartId(null)}
                className="cursor-pointer transition-all duration-200 hover:brightness-130 hover:saturate-150"
                filter={isHighlighted('bexiga') ? 'url(#cartoonGlow)' : undefined}
              >
                <ellipse cx="250" cy="480" rx="14" ry="12" fill={isHighlighted('bexiga') ? '#7dd3fc' : '#38bdf8'} stroke={isHighlighted('bexiga') ? '#0284c7' : '#0284c7'} strokeWidth={isHighlighted('bexiga') ? '3.5' : '2.5'} />
              </g>

              {/* 12. SISTEMA IMUNOLÓGICO / BAÇO */}
              <g
                id="svg_imune"
                onClick={() => handlePartClick('imune')}
                onMouseEnter={() => setHoveredPartId('imune')}
                onMouseLeave={() => setHoveredPartId(null)}
                className="cursor-pointer transition-all duration-200 hover:brightness-130 hover:saturate-150"
                filter={isHighlighted('imune') ? 'url(#cartoonGlow)' : undefined}
              >
                {/* Spleen (Baço) on left upper quadrant */}
                <ellipse cx="300" cy="350" rx="10" ry="16" transform="rotate(-20 300 350)" fill={isHighlighted('imune') ? '#a78bfa' : '#8b5cf6'} stroke={isHighlighted('imune') ? '#38bdf8' : '#6d28d9'} strokeWidth={isHighlighted('imune') ? '3.5' : '2.2'} />
              </g>

              {/* 13. SISTEMA REPRODUTOR (Condicional por Sexo Biológico) */}
              {selectedSex === 'feminino' ? (
                <g
                  id="svg_reprodutor_fem"
                  onClick={() => handlePartClick('reprodutor_feminino')}
                  onMouseEnter={() => setHoveredPartId('reprodutor_feminino')}
                  onMouseLeave={() => setHoveredPartId(null)}
                  className="cursor-pointer transition-all duration-200 hover:brightness-125"
                  filter={isHighlighted('reprodutor_feminino') ? 'url(#cartoonGlow)' : undefined}
                >
                  {/* Broad ligament outline */}
                  <path
                    d="M 220 488 C 235 495 265 495 280 488 C 275 515 225 515 220 488 Z"
                    fill="#fecdd3"
                    opacity="0.5"
                  />
                  {/* Tubas Uterinas (Fallopian Tubes) */}
                  <path
                    d="M 238 492 C 225 482 215 484 212 489"
                    fill="none"
                    stroke={isHighlighted('reprodutor_feminino') ? '#f43f5e' : '#e11d48'}
                    strokeWidth={isHighlighted('reprodutor_feminino') ? '3.5' : '2.8'}
                    strokeLinecap="round"
                  />
                  <path
                    d="M 262 492 C 275 482 285 484 288 489"
                    fill="none"
                    stroke={isHighlighted('reprodutor_feminino') ? '#f43f5e' : '#e11d48'}
                    strokeWidth={isHighlighted('reprodutor_feminino') ? '3.5' : '2.8'}
                    strokeLinecap="round"
                  />
                  {/* Fimbriae tips */}
                  <circle cx="211" cy="490" r="2.5" fill="#e11d48" />
                  <circle cx="289" cy="490" r="2.5" fill="#e11d48" />

                  {/* Ovários (Ovaries) */}
                  <ellipse
                    cx="214"
                    cy="495"
                    rx="5.5"
                    ry="4.5"
                    fill="url(#ovaryGrad)"
                    stroke="#c2410c"
                    strokeWidth="1.5"
                  />
                  <circle cx="214" cy="495" r="1.5" fill="#ffffff" />
                  <ellipse
                    cx="286"
                    cy="495"
                    rx="5.5"
                    ry="4.5"
                    fill="url(#ovaryGrad)"
                    stroke="#c2410c"
                    strokeWidth="1.5"
                  />
                  <circle cx="286" cy="495" r="1.5" fill="#ffffff" />

                  {/* Útero (Uterus) */}
                  <path
                    d="M 240 488 C 240 482 260 482 260 488 C 258 506 254 514 250 516 C 246 514 242 506 240 488 Z"
                    fill={isHighlighted('reprodutor_feminino') ? '#f43f5e' : 'url(#uterusGrad)'}
                    stroke={isHighlighted('reprodutor_feminino') ? '#ffffff' : '#be123c'}
                    strokeWidth={isHighlighted('reprodutor_feminino') ? '3.5' : '2'}
                  />
                  {/* Cervix indicator */}
                  <rect x="247" y="515" width="6" height="5" rx="1.5" fill="#9f1239" />
                </g>
              ) : (
                <g
                  id="svg_reprodutor_masc"
                  onClick={() => handlePartClick('reprodutor_masculino')}
                  onMouseEnter={() => setHoveredPartId('reprodutor_masculino')}
                  onMouseLeave={() => setHoveredPartId(null)}
                  className="cursor-pointer transition-all duration-200 hover:brightness-125"
                  filter={isHighlighted('reprodutor_masculino') ? 'url(#cartoonGlow)' : undefined}
                >
                  {/* Ductos Deferentes (Vas Deferens) */}
                  <path
                    d="M 244 526 C 235 505 238 480 248 485"
                    fill="none"
                    stroke={isHighlighted('reprodutor_masculino') ? '#0284c7' : '#0369a1'}
                    strokeWidth={isHighlighted('reprodutor_masculino') ? '3' : '2'}
                    strokeDasharray="2 1"
                  />
                  <path
                    d="M 256 526 C 265 505 262 480 252 485"
                    fill="none"
                    stroke={isHighlighted('reprodutor_masculino') ? '#0284c7' : '#0369a1'}
                    strokeWidth={isHighlighted('reprodutor_masculino') ? '3' : '2'}
                    strokeDasharray="2 1"
                  />

                  {/* Próstata (Prostate below bladder) */}
                  <ellipse
                    cx="250"
                    cy="497"
                    rx="8"
                    ry="6.5"
                    fill={isHighlighted('reprodutor_masculino') ? '#a855f7' : 'url(#prostateGrad)'}
                    stroke={isHighlighted('reprodutor_masculino') ? '#ffffff' : '#6b21a8'}
                    strokeWidth={isHighlighted('reprodutor_masculino') ? '3' : '1.8'}
                  />
                  <circle cx="250" cy="497" r="1.5" fill="#ffffff" />

                  {/* Testículos & Escroto (Testes & Scrotum) */}
                  <path
                    d="M 238 522 C 238 518 262 518 262 522 C 264 534 256 538 250 538 C 244 538 236 534 238 522 Z"
                    fill="#e2e8f0"
                    stroke="#475569"
                    strokeWidth="1.5"
                    opacity="0.8"
                  />
                  {/* Left Testis */}
                  <ellipse
                    cx="244"
                    cy="528"
                    rx="4.5"
                    ry="6"
                    fill={isHighlighted('reprodutor_masculino') ? '#38bdf8' : 'url(#testisGrad)'}
                    stroke="#0369a1"
                    strokeWidth="1.5"
                  />
                  {/* Right Testis */}
                  <ellipse
                    cx="256"
                    cy="528"
                    rx="4.5"
                    ry="6"
                    fill={isHighlighted('reprodutor_masculino') ? '#38bdf8' : 'url(#testisGrad)'}
                    stroke="#0369a1"
                    strokeWidth="1.5"
                  />
                  {/* Epididymis crest */}
                  <path d="M 239 524 C 240 521 245 522 245 526" fill="none" stroke="#0284c7" strokeWidth="1.5" />
                  <path d="M 261 524 C 260 521 255 522 255 526" fill="none" stroke="#0284c7" strokeWidth="1.5" />
                </g>
              )}
            </g>
          )}

          {/* ================= LAYER 6: CARTOON FACE, EYES & MOUTH ================= */}
          <g id="layer-rosto">
            {/* 1. EYES (Olhos) */}
            <g
              id="svg_olhos"
              onClick={() => handlePartClick('olhos')}
              onMouseEnter={() => setHoveredPartId('olhos')}
              onMouseLeave={() => setHoveredPartId(null)}
              className="cursor-pointer transition-all duration-200 hover:brightness-115"
              filter={isHighlighted('olhos') ? 'url(#cartoonGlow)' : undefined}
            >
              {blinking ? (
                <>
                  <path d="M 216 135 Q 228 142 240 135" fill="none" stroke={isHighlighted('olhos') ? '#0284c7' : '#0f172a'} strokeWidth="4" strokeLinecap="round" />
                  <path d="M 260 135 Q 272 142 284 135" fill="none" stroke={isHighlighted('olhos') ? '#0284c7' : '#0f172a'} strokeWidth="4" strokeLinecap="round" />
                </>
              ) : (
                <>
                  {/* Left Eye Whites */}
                  <ellipse cx="228" cy="135" rx="14" ry="16" fill="#ffffff" stroke={isHighlighted('olhos') ? '#0284c7' : '#0f172a'} strokeWidth={isHighlighted('olhos') ? '4' : '3'} />
                  {/* Left Pupil + Blue Iris */}
                  <circle cx={228 + eyeOffset.x} cy={135 + eyeOffset.y} r="8" fill="#2563eb" />
                  <circle cx={228 + eyeOffset.x} cy={135 + eyeOffset.y} r="5" fill="#0f172a" />
                  <circle cx={226 + eyeOffset.x} cy={132 + eyeOffset.y} r="2.5" fill="#ffffff" />

                  {/* Right Eye Whites */}
                  <ellipse cx="272" cy="135" rx="14" ry="16" fill="#ffffff" stroke={isHighlighted('olhos') ? '#0284c7' : '#0f172a'} strokeWidth={isHighlighted('olhos') ? '4' : '3'} />
                  {/* Right Pupil + Blue Iris */}
                  <circle cx={272 + eyeOffset.x} cy={135 + eyeOffset.y} r="8" fill="#2563eb" />
                  <circle cx={272 + eyeOffset.x} cy={135 + eyeOffset.y} r="5" fill="#0f172a" />
                  <circle cx={270 + eyeOffset.x} cy={132 + eyeOffset.y} r="2.5" fill="#ffffff" />
                </>
              )}

              {/* Eyebrows */}
              <path d="M 215 115 Q 228 108 240 115" fill="none" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M 260 115 Q 272 108 285 115" fill="none" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
            </g>

            {/* 2. MOUTH & TEETH (Boca) */}
            <g
              id="svg_boca"
              onClick={() => handlePartClick('boca')}
              onMouseEnter={() => setHoveredPartId('boca')}
              onMouseLeave={() => setHoveredPartId(null)}
              className="cursor-pointer transition-all duration-200 hover:brightness-125"
              filter={isHighlighted('boca') ? 'url(#cartoonGlow)' : undefined}
            >
              <path
                d="M 232 165 Q 250 162 268 165 C 268 185 232 185 232 165 Z"
                fill={isHighlighted('boca') ? '#be123c' : '#991b1b'}
                stroke={isHighlighted('boca') ? '#38bdf8' : '#0f172a'}
                strokeWidth={isHighlighted('boca') ? '4.5' : '3.5'}
                strokeLinejoin="round"
              />
              <path d="M 235 165 Q 250 168 265 165 L 265 170 Q 250 173 235 170 Z" fill="#ffffff" />
              <path d="M 242 178 Q 250 170 258 178 Q 250 185 242 178 Z" fill="#fb7185" />
            </g>
          </g>
        </svg>
      </motion.div>

      {/* Floating Zoom & Reset controls bottom-right */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 bg-white/95 p-1 rounded-2xl shadow-md border border-blue-100 dark:bg-slate-900/95 dark:border-slate-700 backdrop-blur-md">
        <button
          type="button"
          onClick={() => {
            setZoomLevel((prev) => Math.min(1.4, prev + 0.15));
            sounds.playPop();
          }}
          className="p-2 rounded-xl text-slate-700 hover:bg-blue-50 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-sky-950/40 dark:hover:text-sky-300 transition-colors cursor-pointer"
          title="Aproximar Zoom"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            setZoomLevel((prev) => Math.max(0.85, prev - 0.15));
            sounds.playPop();
          }}
          className="p-2 rounded-xl text-slate-700 hover:bg-blue-50 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-sky-950/40 dark:hover:text-sky-300 transition-colors cursor-pointer"
          title="Afastar Zoom"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            setZoomLevel(1);
            sounds.playPop();
          }}
          className="p-2 rounded-xl text-slate-700 hover:bg-blue-50 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-sky-950/40 dark:hover:text-sky-300 transition-colors cursor-pointer"
          title="Resetar Posição"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
