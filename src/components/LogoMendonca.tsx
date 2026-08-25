import React, { useState } from 'react';
import logoImg from '../assets/images/logo_mendonca_transparent.png';

interface LogoMendoncaProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showText?: boolean;
  isDark?: boolean;
  centered?: boolean;
}

export const LogoMendonca: React.FC<LogoMendoncaProps> = ({
  className = '',
  size = 'md',
  showText = true,
  isDark = false,
  centered = false,
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeDimensions = {
    sm: { container: 'w-7 h-7', textTitle: 'text-sm', textSub: 'text-[9px]' },
    md: { container: 'w-9 h-9', textTitle: 'text-base sm:text-lg', textSub: 'text-[10px]' },
    lg: { container: 'w-12 h-12', textTitle: 'text-xl sm:text-2xl', textSub: 'text-xs' },
    xl: { container: 'w-20 h-20', textTitle: 'text-2xl sm:text-3xl', textSub: 'text-sm' },
    '2xl': { container: 'w-28 h-28', textTitle: 'text-3xl sm:text-4xl', textSub: 'text-base' },
  };

  const dim = sizeDimensions[size] || sizeDimensions.md;

  return (
    <div className={`flex ${centered ? 'flex-col items-center text-center' : 'items-center'} gap-2.5 shrink-0 select-none ${className}`}>
      {/* Símbolo / Logo Emblem */}
      <div className={`relative ${dim.container} flex items-center justify-center shrink-0`}>
        {!imageError ? (
          <img
            src={logoImg}
            alt="Plataforma Mendonça"
            className="w-full h-full object-contain filter drop-shadow-sm select-none pointer-events-none transition-transform hover:scale-105"
            onError={() => setImageError(true)}
            loading="eager"
          />
        ) : (
          /* Fallback Vetorial Premium em SVG */
          <div className="w-full h-full rounded-xl bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700 flex items-center justify-center text-white font-black shadow-md border border-white/20">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4/5 h-4/5">
              <path
                d="M8 32V10L20 22L32 10V32"
                stroke="white"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="20" cy="8" r="3" fill="#FBBF24" />
              <circle cx="8" cy="10" r="2.5" fill="#60A5FA" />
              <circle cx="32" cy="10" r="2.5" fill="#60A5FA" />
            </svg>
          </div>
        )}
      </div>

      {/* Tipografia da Marca */}
      {showText && (
        <div className={`flex flex-col ${centered ? 'items-center' : 'items-start'} leading-none`}>
          <div className="flex items-center gap-1">
            <span className={`font-display font-black tracking-tight ${dim.textTitle} text-slate-900 dark:text-white`}>
              MENDONÇA
            </span>
          </div>
          <span className={`${dim.textSub} text-slate-500 dark:text-slate-400 font-semibold tracking-wider uppercase mt-0.5`}>
            Plataforma de Estudos
          </span>
        </div>
      )}
    </div>
  );
};
