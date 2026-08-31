import React from 'react';
import { motion } from 'motion/react';

interface GraphicProps {
  themeColor?: string;
}

export const MitochondriaVector: React.FC<GraphicProps> = () => (
  <svg viewBox="0 0 400 320" className="w-full h-full max-h-[320px]" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="mitOut" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#fb923c" /><stop offset="100%" stopColor="#c2410c" /></linearGradient>
      <radialGradient id="mitMat" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#fef08a" /><stop offset="100%" stopColor="#ca8a04" /></radialGradient>
    </defs>
    <rect width="400" height="320" rx="16" fill="#0b1329" />
    <motion.g animate={{ scale: [1, 1.015, 1] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
      <path d="M 90,80 C 180,20 320,50 345,140 C 370,230 250,295 140,280 C 45,265 30,130 90,80 Z" fill="url(#mitOut)" stroke="#7c2d12" strokeWidth="5" />
      <path d="M 105,95 C 180,45 295,70 320,145 C 340,215 240,270 145,255 C 65,240 55,140 105,95 Z" fill="url(#mitMat)" opacity="0.88" />
      <path d="M 120,95 C 140,130 145,170 135,190" fill="none" stroke="#ea580c" strokeWidth="6" strokeLinecap="round" />
      <path d="M 175,70 C 190,120 185,170 170,210" fill="none" stroke="#ea580c" strokeWidth="6" strokeLinecap="round" />
      <path d="M 230,75 C 240,130 230,180 215,225" fill="none" stroke="#ea580c" strokeWidth="6" strokeLinecap="round" />
      <path d="M 285,95 C 285,140 270,190 250,225" fill="none" stroke="#ea580c" strokeWidth="6" strokeLinecap="round" />
      <path d="M 160,250 C 150,210 160,180 180,160" fill="none" stroke="#ea580c" strokeWidth="5" strokeLinecap="round" />
      <path d="M 210,255 C 205,210 215,175 235,150" fill="none" stroke="#ea580c" strokeWidth="5" strokeLinecap="round" />
      <path d="M 100,165 C 80,180 90,210 110,215 C 125,220 120,180 100,165 Z" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="4 2" />
      <text x="105" y="235" fill="#dc2626" fontSize="8" fontWeight="bold">DNA Circular</text>
      {[[140, 140], [165, 115], [200, 130], [250, 150], [220, 190]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="3" fill="#854d0e" />
      ))}
      <circle cx="172" cy="115" r="3.5" fill="#22c55e" stroke="#15803d" strokeWidth="1" />
      <circle cx="228" cy="120" r="3.5" fill="#22c55e" stroke="#15803d" strokeWidth="1" />
    </motion.g>
    <g className="text-[10px] font-sans font-bold fill-slate-300">
      <text x="210" y="25" textAnchor="middle" fill="#fdba74">Membrana Externa Lisa</text>
      <text x="270" y="70" fill="#fde047">Cristas Mitocondriais</text>
      <text x="160" y="295" fill="#86efac">ATP-Sintase • Matriz (Krebs)</text>
    </g>
  </svg>
);

export const NucleusVector: React.FC<GraphicProps> = () => (
  <svg viewBox="0 0 400 320" className="w-full h-full max-h-[320px]" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="nucBed" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#c084fc" /><stop offset="60%" stopColor="#9333ea" /><stop offset="100%" stopColor="#581c87" /></radialGradient>
      <radialGradient id="nclCent" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#3b0764" /><stop offset="100%" stopColor="#1e1b4b" /></radialGradient>
    </defs>
    <rect width="400" height="320" rx="16" fill="#0a0b1e" />
    <motion.g animate={{ scale: [1, 1.015, 1] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
      <circle cx="200" cy="160" r="115" fill="none" stroke="#a855f7" strokeWidth="8" strokeDasharray="18 6" />
      <circle cx="200" cy="160" r="108" fill="url(#nucBed)" />
      <circle cx="200" cy="160" r="102" fill="none" stroke="#3b0764" strokeWidth="9" strokeDasharray="14 10" opacity="0.8" />
      <path d="M 130,120 Q 160,180 180,110 T 260,130" fill="none" stroke="#e9d5ff" strokeWidth="2.5" />
      <circle cx="215" cy="155" r="36" fill="url(#nclCent)" stroke="#581c87" strokeWidth="3" />
      <text x="215" y="160" textAnchor="middle" fill="#f3e8ff" fontSize="10" fontWeight="bold">Nucléolo (rRNA)</text>
    </motion.g>
    <g className="text-[10px] font-sans font-bold fill-slate-300">
      <text x="200" y="25" textAnchor="middle" fill="#d8b4fe">Carioteca com Poros Nucleares</text>
      <text x="60" y="280" fill="#c084fc">Heterocromatina</text>
      <text x="240" y="280" fill="#f3e8ff">Eucromatina Ativa</text>
    </g>
  </svg>
);

export const RerVector: React.FC<GraphicProps> = () => (
  <svg viewBox="0 0 400 320" className="w-full h-full max-h-[320px]" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="rerG" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#38bdf8" /><stop offset="100%" stopColor="#0284c7" /></linearGradient>
    </defs>
    <rect width="400" height="320" rx="16" fill="#081426" />
    <path d="M 40,40 C 90,100 90,220 40,280" fill="none" stroke="#8b5cf6" strokeWidth="12" />
    <path d="M 95,80 C 170,60 270,70 320,95 C 335,105 320,125 295,120 C 230,105 160,100 95,115 Z" fill="url(#rerG)" stroke="#0369a1" strokeWidth="2.5" />
    <path d="M 95,135 C 180,120 280,130 330,155 C 345,165 330,185 305,180 C 240,165 170,160 95,175 Z" fill="url(#rerG)" stroke="#0369a1" strokeWidth="2.5" />
    <path d="M 95,195 C 180,180 270,190 320,215 C 335,225 320,245 295,240 C 230,225 160,220 95,235 Z" fill="url(#rerG)" stroke="#0369a1" strokeWidth="2.5" />
    {[[120, 75], [145, 70], [175, 68], [210, 70], [250, 76], [120, 130], [160, 124], [205, 125], [250, 132], [120, 190], [165, 184], [210, 184]].map(([cx, cy], i) => (
      <circle key={i} cx={cx} cy={cy} r="3.5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
    ))}
    <circle cx="355" cy="110" r="10" fill="#7dd3fc" stroke="#0284c7" strokeWidth="2" />
    <circle cx="365" cy="170" r="12" fill="#7dd3fc" stroke="#0284c7" strokeWidth="2" />
    <g className="text-[10px] font-sans font-bold fill-slate-300">
      <text x="210" y="35" textAnchor="middle" fill="#7dd3fc">Cisternas Aplanadas do RER</text>
      <text x="175" y="275" fill="#fde047">Ribossomos Aderidos (Síntese Proteica)</text>
      <text x="350" y="265" textAnchor="middle" fill="#bae6fd">Vesículas</text>
    </g>
  </svg>
);

export const GolgiVector: React.FC<GraphicProps> = () => (
  <svg viewBox="0 0 400 320" className="w-full h-full max-h-[320px]" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="glgG" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#60a5fa" /><stop offset="100%" stopColor="#2563eb" /></linearGradient>
    </defs>
    <rect width="400" height="320" rx="16" fill="#081426" />
    <path d="M 120,60 C 170,85 170,215 120,240 C 105,248 100,230 112,220 C 145,195 145,105 112,80 C 100,70 105,52 120,60 Z" fill="url(#glgG)" stroke="#1d4ed8" strokeWidth="2.5" />
    <path d="M 165,55 C 220,85 220,215 165,245 C 150,253 145,235 157,225 C 195,195 195,105 157,75 C 145,65 150,47 165,55 Z" fill="url(#glgG)" stroke="#1d4ed8" strokeWidth="2.5" />
    <path d="M 210,50 C 270,85 270,215 210,250 C 195,258 190,240 202,230 C 245,195 245,105 202,70 C 190,60 195,42 210,50 Z" fill="url(#glgG)" stroke="#1d4ed8" strokeWidth="2.5" />
    <path d="M 255,50 C 315,85 315,215 255,250 C 240,258 235,240 247,230 C 290,195 290,105 247,70 C 235,60 240,42 255,50 Z" fill="url(#glgG)" stroke="#1d4ed8" strokeWidth="2.5" />
    <circle cx="75" cy="110" r="10" fill="#93c5fd" stroke="#2563eb" strokeWidth="2" />
    <circle cx="330" cy="85" r="12" fill="#60a5fa" stroke="#1e40af" strokeWidth="2" />
    <circle cx="355" cy="140" r="15" fill="#38bdf8" stroke="#0284c7" strokeWidth="2.5" />
    <circle cx="350" cy="255" r="11" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
    <g className="text-[10px] font-sans font-bold fill-slate-300">
      <text x="80" y="35" fill="#93c5fd">Face CIS (Entrada)</text>
      <text x="270" y="35" fill="#93c5fd">Face TRANS (Saída)</text>
      <text x="320" y="295" fill="#fca5a5">Vesículas Secretoras & Lisossomos</text>
    </g>
  </svg>
);

export const LysosomeVector: React.FC<GraphicProps> = () => (
  <svg viewBox="0 0 400 320" className="w-full h-full max-h-[320px]" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="lysoG" cx="40%" cy="40%" r="60%"><stop offset="0%" stopColor="#f87171" /><stop offset="70%" stopColor="#dc2626" /><stop offset="100%" stopColor="#991b1b" /></radialGradient>
    </defs>
    <rect width="400" height="320" rx="16" fill="#180909" />
    <circle cx="200" cy="160" r="105" fill="url(#lysoG)" stroke="#7f1d1d" strokeWidth="6" />
    {[[160, 110], [220, 100], [245, 140], [150, 165], [190, 160], [230, 185], [155, 215], [205, 215]].map(([cx, cy], i) => (
      <circle key={i} cx={cx} cy={cy} r="7" fill="#fef08a" opacity="0.9" />
    ))}
    <g className="text-[10px] font-sans font-bold fill-slate-300">
      <text x="200" y="30" textAnchor="middle" fill="#fca5a5">Membrana com Bombas H⁺-ATPase</text>
      <text x="200" y="295" textAnchor="middle" fill="#fde047">Hidrolases Ácidas (pH ~5.0 - Digestão)</text>
    </g>
  </svg>
);

export const MembraneVector: React.FC<GraphicProps> = () => (
  <svg viewBox="0 0 400 320" className="w-full h-full max-h-[320px]" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="320" rx="16" fill="#071226" />
    {Array.from({ length: 14 }).map((_, i) => {
      const x = 30 + i * 26;
      return (
        <g key={`t-${i}`}>
          <circle cx={x} cy="100" r="10" fill="#38bdf8" stroke="#0369a1" strokeWidth="1.5" />
          <path d={`M ${x - 3},110 Q ${x - 6},128 ${x - 3},145`} fill="none" stroke="#facc15" strokeWidth="2.5" />
          <path d={`M ${x + 3},110 Q ${x + 6},128 ${x + 3},145`} fill="none" stroke="#facc15" strokeWidth="2.5" />
        </g>
      );
    })}
    {Array.from({ length: 14 }).map((_, i) => {
      const x = 30 + i * 26;
      return (
        <g key={`b-${i}`}>
          <path d={`M ${x - 3},210 Q ${x - 6},192 ${x - 3},175`} fill="none" stroke="#facc15" strokeWidth="2.5" />
          <path d={`M ${x + 3},210 Q ${x + 6},192 ${x + 3},175`} fill="none" stroke="#facc15" strokeWidth="2.5" />
          <circle cx={x} cy="220" r="10" fill="#38bdf8" stroke="#0369a1" strokeWidth="1.5" />
        </g>
      );
    })}
    <path d="M 185,75 C 225,75 225,245 185,245 C 160,245 160,75 185,75 Z" fill="#a855f7" stroke="#581c87" strokeWidth="3" />
    <g className="text-[10px] font-sans font-bold fill-slate-300">
      <text x="200" y="30" textAnchor="middle" fill="#86efac">Glicocálix & Reconhecimento</text>
      <text x="40" y="75" fill="#7dd3fc">Cabeças Polares</text>
      <text x="40" y="165" fill="#fde047">Caudas Apolares</text>
      <text x="270" y="165" fill="#d8b4fe">Proteína Canal</text>
    </g>
  </svg>
);
