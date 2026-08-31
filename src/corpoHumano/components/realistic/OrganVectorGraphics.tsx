import React from 'react';
import { motion } from 'motion/react';

interface GraphicProps {
  themeColor?: string;
}

export const BrainVector: React.FC<GraphicProps> = () => (
  <svg viewBox="0 0 400 320" className="w-full h-full max-h-[320px]" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="brnCortex" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fda4af" />
        <stop offset="50%" stopColor="#fb7185" />
        <stop offset="100%" stopColor="#e11d48" />
      </linearGradient>
      <linearGradient id="brnCereb" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f43f5e" />
        <stop offset="100%" stopColor="#be123c" />
      </linearGradient>
      <linearGradient id="brnStem" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fed7aa" />
        <stop offset="100%" stopColor="#fdba74" />
      </linearGradient>
    </defs>
    <rect width="400" height="320" rx="16" fill="#0f172a" />
    <path d="M 185,190 C 185,210 190,240 190,280 C 190,295 215,295 215,280 C 215,240 220,210 220,190 Z" fill="url(#brnStem)" stroke="#c2410c" strokeWidth="3" />
    <ellipse cx="202" cy="225" rx="18" ry="12" fill="#fed7aa" stroke="#ea580c" strokeWidth="2" />
    <path d="M 130,170 C 95,185 90,235 135,250 C 170,260 190,240 185,200 C 180,180 150,165 130,170 Z" fill="url(#brnCereb)" stroke="#881337" strokeWidth="3" />
    <path d="M 105,200 Q 140,205 175,200" stroke="#fecdd3" strokeWidth="2" strokeDasharray="3 3" fill="none" />
    <path d="M 110,215 Q 145,220 175,215" stroke="#fecdd3" strokeWidth="2" strokeDasharray="3 3" fill="none" />
    <motion.g animate={{ scale: [1, 1.01, 1] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
      <path d="M 120,170 C 80,160 65,110 95,70 C 130,30 270,25 315,65 C 345,95 340,150 310,180 C 275,210 240,190 220,175 C 190,160 160,180 120,170 Z" fill="url(#brnCortex)" stroke="#9f1239" strokeWidth="4" />
      <path d="M 125,75 Q 160,95 195,65 T 270,75" fill="none" stroke="#881337" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M 105,115 Q 145,130 185,100 T 265,115" fill="none" stroke="#881337" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M 125,145 Q 170,160 215,135 T 300,140" fill="none" stroke="#881337" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M 180,45 Q 200,90 205,145" fill="none" stroke="#4c0519" strokeWidth="3" strokeLinecap="round" />
      <path d="M 245,45 Q 255,95 250,155" fill="none" stroke="#4c0519" strokeWidth="3" strokeLinecap="round" />
    </motion.g>
    <g className="text-[10px] font-sans font-bold fill-slate-300">
      <text x="210" y="25" textAnchor="middle" fill="#fbcfe8">Córtex Cerebral (Giros e Sulcos)</text>
      <text x="65" y="230" fill="#fda4af">Cerebelo</text>
      <text x="235" y="275" fill="#fdba74">Tronco Encefálico</text>
    </g>
  </svg>
);

export const HeartVector: React.FC<GraphicProps> = () => (
  <svg viewBox="0 0 400 320" className="w-full h-full max-h-[320px]" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="hrtAorta" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ef4444" /><stop offset="100%" stopColor="#b91c1c" /></linearGradient>
      <radialGradient id="hrtMyo" cx="40%" cy="40%" r="60%"><stop offset="0%" stopColor="#f87171" /><stop offset="70%" stopColor="#dc2626" /><stop offset="100%" stopColor="#7f1d1d" /></radialGradient>
    </defs>
    <rect width="400" height="320" rx="16" fill="#0f172a" />
    <path d="M 130,50 L 130,120 L 155,120 L 155,50 Z" fill="#2563eb" stroke="#1e40af" strokeWidth="2.5" />
    <path d="M 190,110 C 190,40 270,40 270,110 L 250,110 C 250,65 210,65 210,110 Z" fill="url(#hrtAorta)" stroke="#991b1b" strokeWidth="3" />
    <path d="M 215,55 L 215,25 L 225,25 L 225,55 Z" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
    <path d="M 235,50 L 235,25 L 245,25 L 245,50 Z" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
    <path d="M 255,55 L 255,25 L 265,25 L 265,55 Z" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
    <path d="M 175,115 L 215,75 L 245,95 L 205,135 Z" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="2.5" />
    <motion.g animate={{ scale: [1, 1.03, 0.98, 1.02, 1] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }} style={{ transformOrigin: '200px 180px' }}>
      <path d="M 140,130 C 100,140 100,200 140,240 C 175,275 200,290 215,290 C 240,290 290,240 300,180 C 310,130 260,120 220,130 C 190,120 160,120 140,130 Z" fill="url(#hrtMyo)" stroke="#7f1d1d" strokeWidth="4" />
      <path d="M 215,135 Q 200,200 210,285" fill="none" stroke="#fca5a5" strokeWidth="3.5" />
      <path d="M 205,170 Q 170,180 150,170" fill="none" stroke="#ef4444" strokeWidth="2.5" />
      <path d="M 210,185 Q 250,195 275,180" fill="none" stroke="#3b82f6" strokeWidth="2.5" />
    </motion.g>
    <g className="text-[10px] font-sans font-bold fill-slate-300">
      <text x="240" y="18" textAnchor="middle" fill="#fca5a5">Aorta Ascendente</text>
      <text x="80" y="80" fill="#93c5fd">Veia Cava</text>
      <text x="290" y="85" fill="#93c5fd">Tronco Pulmonar</text>
      <text x="290" y="270" fill="#fca5a5">Miocárdio Ventricular</text>
    </g>
  </svg>
);

export const LungsVector: React.FC<GraphicProps> = () => (
  <svg viewBox="0 0 400 320" className="w-full h-full max-h-[320px]" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="lngGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#f472b6" /><stop offset="100%" stopColor="#e11d48" /></linearGradient>
    </defs>
    <rect width="400" height="320" rx="16" fill="#0f172a" />
    <path d="M 188,25 L 188,95 L 212,95 L 212,25 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2.5" />
    {[35, 50, 65, 80].map((y) => (<line key={y} x1="188" y1={y} x2="212" y2={y} stroke="#64748b" strokeWidth="2" />))}
    <path d="M 188,95 L 140,135 L 152,148 L 200,105 L 248,148 L 260,135 L 212,95 Z" fill="#cbd5e1" stroke="#64748b" strokeWidth="2" />
    <motion.g animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }} style={{ transformOrigin: '200px 160px' }}>
      <path d="M 140,110 C 130,80 85,110 75,160 C 65,210 75,260 120,270 C 145,275 160,250 160,210 C 160,160 150,120 140,110 Z" fill="url(#lngGrad)" stroke="#9f1239" strokeWidth="3.5" />
      <path d="M 260,110 C 270,80 315,110 325,160 C 335,210 325,260 280,270 C 255,275 235,240 240,200 C 243,175 250,160 240,150 C 240,130 250,120 260,110 Z" fill="url(#lngGrad)" stroke="#9f1239" strokeWidth="3.5" />
      <path d="M 145,140 Q 120,165 105,195 M 120,165 Q 135,190 125,225" fill="none" stroke="#fecdd3" strokeWidth="2" strokeLinecap="round" />
      <path d="M 255,140 Q 280,165 295,195 M 280,165 Q 265,190 275,225" fill="none" stroke="#fecdd3" strokeWidth="2" strokeLinecap="round" />
    </motion.g>
    <g transform="translate(290, 20) scale(0.85)">
      <rect width="115" height="100" rx="12" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
      <text x="58" y="18" textAnchor="middle" fill="#7dd3fc" fontSize="9" fontWeight="bold">Saco Alveolar</text>
      <circle cx="45" cy="45" r="14" fill="#fb923c" stroke="#c2410c" strokeWidth="1.5" />
      <circle cx="70" cy="45" r="15" fill="#fb923c" stroke="#c2410c" strokeWidth="1.5" />
      <circle cx="55" cy="70" r="16" fill="#fb923c" stroke="#c2410c" strokeWidth="1.5" />
      <path d="M 30,55 Q 55,30 85,50" fill="none" stroke="#3b82f6" strokeWidth="2" />
      <path d="M 32,70 Q 60,85 85,70" fill="none" stroke="#ef4444" strokeWidth="2" />
      <text x="58" y="93" textAnchor="middle" fill="#cbd5e1" fontSize="7.5">Hematose por Difusão</text>
    </g>
    <g className="text-[10px] font-sans font-bold fill-slate-300">
      <text x="200" y="18" textAnchor="middle" fill="#cbd5e1">Traqueia</text>
      <text x="45" y="190" fill="#fda4af">Pulmão Direito</text>
      <text x="245" y="295" fill="#fda4af">Pulmão Esquerdo</text>
    </g>
  </svg>
);

export const StomachVector: React.FC<GraphicProps> = () => (
  <svg viewBox="0 0 400 320" className="w-full h-full max-h-[320px]" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="stmGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#fb923c" /><stop offset="100%" stopColor="#9a3412" /></linearGradient>
    </defs>
    <rect width="400" height="320" rx="16" fill="#0f172a" />
    <path d="M 145,25 L 145,85 L 175,85 L 175,25 Z" fill="#fed7aa" stroke="#ea580c" strokeWidth="2.5" />
    <path d="M 145,85 C 100,85 90,130 95,165 C 105,225 150,285 225,280 C 290,275 315,225 310,185 L 275,185 C 275,215 255,245 215,245 C 175,245 145,200 145,150 C 145,115 160,95 175,85 Z" fill="url(#stmGrad)" stroke="#7c2d12" strokeWidth="4" />
    <path d="M 125,150 Q 135,190 170,225" fill="none" stroke="#fed7aa" strokeWidth="3" strokeLinecap="round" />
    <path d="M 155,140 Q 170,185 205,220" fill="none" stroke="#fed7aa" strokeWidth="3" strokeLinecap="round" />
    <path d="M 185,135 Q 205,175 235,210" fill="none" stroke="#fed7aa" strokeWidth="3" strokeLinecap="round" />
    <path d="M 150,220 Q 200,240 245,210 Q 230,260 185,260 Q 155,255 150,220 Z" fill="#84cc16" opacity="0.85" />
    <circle cx="175" cy="235" r="3" fill="#ffffff" opacity="0.8" />
    <circle cx="210" cy="230" r="4" fill="#ffffff" opacity="0.8" />
    <path d="M 310,185 C 335,185 350,215 345,255 L 320,255 C 325,225 315,215 275,215 Z" fill="#fed7aa" stroke="#ea580c" strokeWidth="2.5" />
    <g className="text-[10px] font-sans font-bold fill-slate-300">
      <text x="160" y="20" textAnchor="middle" fill="#fed7aa">Esôfago</text>
      <text x="80" y="100" fill="#fdba74">Fundo Gástrico</text>
      <text x="85" y="275" fill="#fdba74">Pregas Mucosas (Rugae)</text>
      <text x="200" y="250" textAnchor="middle" fill="#14532d" fontWeight="900">Suco Gástrico (pH ~2.0)</text>
      <text x="350" y="280" textAnchor="middle" fill="#fed7aa">Duodeno</text>
    </g>
  </svg>
);

export const LiverVector: React.FC<GraphicProps> = () => (
  <svg viewBox="0 0 400 320" className="w-full h-full max-h-[320px]" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="lvrGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#b91c1c" /><stop offset="100%" stopColor="#7f1d1d" /></linearGradient>
      <linearGradient id="galGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#84cc16" /><stop offset="100%" stopColor="#4d7c0f" /></linearGradient>
    </defs>
    <rect width="400" height="320" rx="16" fill="#0f172a" />
    <path d="M 80,120 C 130,70 280,60 340,110 C 360,130 350,210 320,230 C 270,260 170,260 100,230 C 65,210 60,140 80,120 Z" fill="url(#lvrGrad)" stroke="#450a0a" strokeWidth="4" />
    <path d="M 230,75 C 235,130 220,180 210,240" fill="none" stroke="#fecaca" strokeWidth="3" />
    <path d="M 215,200 C 230,195 255,220 250,255 C 245,280 220,285 205,270 C 195,255 200,210 215,200 Z" fill="url(#galGrad)" stroke="#365314" strokeWidth="3" />
    <path d="M 215,200 Q 200,180 190,200 T 175,230" fill="none" stroke="#65a30d" strokeWidth="4" strokeLinecap="round" />
    <path d="M 185,170 L 175,240" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
    <path d="M 195,175 L 190,240" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
    <g className="text-[10px] font-sans font-bold fill-slate-300">
      <text x="140" y="130" fill="#fecaca">Lobo Esquerdo</text>
      <text x="290" y="130" fill="#fecaca">Lobo Direito</text>
      <text x="260" y="275" fill="#bef264">Vesícula Biliar (Bile)</text>
      <text x="110" y="275" fill="#93c5fd">Veia Porta Hepática</text>
    </g>
  </svg>
);

export const PancreasVector: React.FC<GraphicProps> = () => (
  <svg viewBox="0 0 400 320" className="w-full h-full max-h-[320px]" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="pncGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#fef08a" /><stop offset="100%" stopColor="#eab308" /></linearGradient>
    </defs>
    <rect width="400" height="320" rx="16" fill="#0f172a" />
    <path d="M 120,60 C 60,90 60,220 120,250 L 145,250 C 95,220 95,90 145,60 Z" fill="#fed7aa" stroke="#ea580c" strokeWidth="3.5" />
    <path d="M 125,120 C 135,90 160,110 180,120 C 230,130 300,120 340,110 C 355,105 365,125 350,140 C 310,170 240,180 180,175 C 150,175 130,195 125,170 Z" fill="url(#pncGrad)" stroke="#ca8a04" strokeWidth="3.5" />
    <path d="M 125,150 C 170,145 240,150 335,125" fill="none" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" />
    <g transform="translate(240, 180) scale(0.9)">
      <rect width="160" height="120" rx="12" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
      <text x="80" y="18" textAnchor="middle" fill="#7dd3fc" fontSize="9" fontWeight="bold">Ilhota de Langerhans</text>
      <circle cx="80" cy="65" r="36" fill="#4f46e5" stroke="#6366f1" strokeWidth="2" />
      <circle cx="70" cy="55" r="5" fill="#38bdf8" /><circle cx="85" cy="60" r="5" fill="#38bdf8" /><circle cx="75" cy="75" r="5" fill="#38bdf8" />
      <circle cx="95" cy="55" r="4.5" fill="#f43f5e" /><circle cx="65" cy="65" r="4.5" fill="#f43f5e" />
      <text x="80" y="112" textAnchor="middle" fill="#e2e8f0" fontSize="7.5">Beta (Insulina) • Alfa (Glucagon)</text>
    </g>
    <g className="text-[10px] font-sans font-bold fill-slate-300">
      <text x="145" y="105" fill="#854d0e">Cabeça</text>
      <text x="235" y="115" fill="#854d0e">Corpo</text>
      <text x="345" y="95" fill="#854d0e">Cauda</text>
      <text x="140" y="275" fill="#38bdf8">Ducto Pancreático</text>
    </g>
  </svg>
);

export const KidneysVector: React.FC<GraphicProps> = () => (
  <svg viewBox="0 0 400 320" className="w-full h-full max-h-[320px]" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="kdnCrtx" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#b91c1c" /><stop offset="100%" stopColor="#7f1d1d" /></linearGradient>
    </defs>
    <rect width="400" height="320" rx="16" fill="#0f172a" />
    <path d="M 120,40 C 60,80 50,220 120,270 C 180,310 230,260 210,200 C 200,170 200,140 210,110 C 230,50 170,10 120,40 Z" fill="url(#kdnCrtx)" stroke="#450a0a" strokeWidth="4" />
    <path d="M 125,70 L 165,110 L 115,115 Z" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
    <path d="M 95,125 L 155,145 L 105,175 Z" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
    <path d="M 105,190 L 160,175 L 125,235 Z" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
    <path d="M 160,115 C 180,140 180,180 160,200 L 210,195 L 240,290 L 260,285 L 230,170 C 240,135 220,110 160,115 Z" fill="#eab308" stroke="#ca8a04" strokeWidth="2.5" />
    <path d="M 210,135 L 285,120" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" />
    <path d="M 205,160 L 285,150" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" />
    <g transform="translate(245, 15) scale(0.9)">
      <rect width="155" height="135" rx="12" fill="#1e293b" stroke="#ef4444" strokeWidth="2" />
      <text x="77" y="18" textAnchor="middle" fill="#fca5a5" fontSize="9" fontWeight="bold">Néfron (Glomérulo Renal)</text>
      <circle cx="65" cy="75" r="18" fill="#ef4444" opacity="0.3" />
      <path d="M 35,65 Q 65,55 65,75 T 90,75" fill="none" stroke="#ef4444" strokeWidth="3" />
      <path d="M 85,105 Q 115,120 135,95" fill="none" stroke="#fde047" strokeWidth="3" strokeLinecap="round" />
      <text x="77" y="125" textAnchor="middle" fill="#cbd5e1" fontSize="7.5">Filtração sob Pressão</text>
    </g>
    <g className="text-[10px] font-sans font-bold fill-slate-300">
      <text x="65" y="45" fill="#fca5a5">Córtex Renal</text>
      <text x="50" y="150" fill="#fca5a5">Pirâmides</text>
      <text x="260" y="275" fill="#fde047">Ureter</text>
    </g>
  </svg>
);

export const GenericOrganVector: React.FC<{ title: string; subtitle: string; icon: string; color?: string }> = ({
  title,
  subtitle,
  icon,
  color = '#3b82f6',
}) => (
  <svg viewBox="0 0 400 320" className="w-full h-full max-h-[320px]" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="320" rx="16" fill="#0f172a" />
    <circle cx="200" cy="140" r="85" fill={color} opacity="0.2" />
    <circle cx="200" cy="140" r="60" fill={color} opacity="0.5" stroke="#ffffff" strokeWidth="3" />
    <text x="200" y="155" textAnchor="middle" fontSize="48">{icon}</text>
    <text x="200" y="245" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="bold">{title}</text>
    <text x="200" y="275" textAnchor="middle" fill="#94a3b8" fontSize="12">{subtitle}</text>
  </svg>
);
