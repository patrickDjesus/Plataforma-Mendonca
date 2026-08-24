import React from 'react';
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
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-20 h-20',
    '2xl': 'w-28 h-28',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base sm:text-lg',
    lg: 'text-xl sm:text-2xl',
    xl: 'text-2xl sm:text-3xl',
    '2xl': 'text-3xl sm:text-4xl',
  };

  return (
    <div className={`flex ${centered ? 'flex-col items-center text-center' : 'items-center'} gap-3 shrink-0 select-none ${className}`}>
      {/* Imagem Transparente com tratamento de opacidade e renderização limpa sem resquício de fundo */}
      <div className={`relative ${sizeMap[size]} flex items-center justify-center shrink-0`}>
        <img
          src={logoImg}
          alt="Plataforma Mendonça"
          className="w-full h-full object-contain filter drop-shadow-sm select-none pointer-events-none"
          loading="eager"
        />
      </div>

      {/* Tipografia da Marca */}
      {showText && (
        <div className={`flex flex-col ${centered ? 'items-center' : 'items-start'}`}>
          <div className="flex items-center leading-none">
            <span className={`font-display font-black tracking-tight ${textSizes[size]} text-slate-900 dark:text-white`}>
              MENDONÇA
            </span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold tracking-wide mt-1">
            Plataforma de Estudos
          </span>
        </div>
      )}
    </div>
  );
};
