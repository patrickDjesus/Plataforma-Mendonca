import React, { useState, useRef, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lightbulb, Sparkles, Tag } from 'lucide-react';
import definitionsData from '../data/definitions.json';

export interface DefinitionItem {
  term: string;
  definition?: string;
  example?: string;
  category?: string;
  imageUrl?: string;
}

export type DefinitionsMap = Record<string, DefinitionItem>;

// Carrega as definições padrão do arquivo definitions.json
// eslint-disable-next-line react-refresh/only-export-components
export const STUDY_DEFINITIONS: DefinitionsMap = definitionsData as DefinitionsMap;

interface TooltipProps {
  /** O termo ou chave de busca no definitions.json */
  termKey?: string;
  /** Ou a definição direta passada via props */
  definition?: DefinitionItem;
  /** Conteúdo visual que recebe o hover */
  children: ReactNode;
  /** Posição preferida do balão */
  position?: 'top' | 'bottom';
  /** Classe adicional para o container */
  className?: string;
}

/**
 * Componente de Tooltip Reutilizável que utiliza definitions.json para
 * renderizar definições conceituais elegantes ao passar o mouse sobre as palavras marcadas.
 */
export const Tooltip: React.FC<TooltipProps> = ({
  termKey,
  definition: customDef,
  children,
  position = 'top',
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLSpanElement | null>(null);

  // Busca a definição correspondente a partir do definitions.json ou da prop direta
  const normalizedKey = termKey ? termKey.toLowerCase().trim() : '';
  const definition: DefinitionItem | undefined = customDef || (normalizedKey ? STUDY_DEFINITIONS[normalizedKey] : undefined);

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: position === 'top' ? rect.top : rect.bottom,
        left: rect.left + rect.width / 2
      });
    }
    setIsHovered(true);
  };

  if (!definition) {
    return <span className={className}>{children}</span>;
  }

  return (
    <span
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative inline-block cursor-pointer transition-all ${className}`}
    >
      {/* Elemento filho / palavra destacada */}
      {children}

      {/* Tooltip Popover Elegante com Framer Motion */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: position === 'top' ? 6 : -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: position === 'top' ? 4 : -4, scale: 0.96 }}
            transition={{ type: 'spring', damping: 20, stiffness: 350 }}
            className={`fixed z-[99999] w-72 sm:w-80 p-3.5 rounded-2xl bg-white/95 dark:bg-[#18181B]/95 backdrop-blur-xl border border-[#CFE1D6]/80 dark:border-[#22392D]/80 shadow-2xl text-left pointer-events-none transform -translate-x-1/2 ${
              position === 'top' ? '-translate-y-full mb-2' : 'mt-2'
            }`}
            style={{
              top: position === 'top' ? `${coords.top - 10}px` : `${coords.top + 10}px`,
              left: `${coords.left}px`
            }}
          >
            {/* Header do Conceito */}
            <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-[#E7E2D9] dark:border-[#2C2C30]">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="w-5 h-5 rounded-lg bg-[#2D5A46]/10 dark:bg-[#52B788]/20 text-[#2D5A46] dark:text-[#52B788] flex items-center justify-center shrink-0">
                  <Sparkles className="w-3 h-3" />
                </div>
                <h4 className="font-display font-bold text-xs sm:text-sm text-[#1C1917] dark:text-[#FAF9F5] truncate">
                  {definition.term}
                </h4>
              </div>

              {definition.category && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF3EF] dark:bg-[#15221B]/80 text-[#224A38] dark:text-[#52B788] shrink-0">
                  <Tag className="w-2.5 h-2.5" />
                  {definition.category}
                </span>
              )}
            </div>

            {/* Imagem Conceitual */}
            {definition.imageUrl && (
              <img
                src={definition.imageUrl}
                alt={definition.term}
                className="w-full h-36 object-cover rounded-xl border border-[#E7E2D9] dark:border-[#3B3B40] shadow-md mb-2.5"
                onError={e => {
                  (e.currentTarget.style.display = 'none');
                }}
              />
            )}

            {/* Corpo da Definição */}
            {(definition.definition || definition.example) && (
            <div className="space-y-1.5">
              {definition.definition && (
                <span className="text-[10px] font-bold text-[#A8A29E] dark:text-[#78716C] uppercase tracking-wider block">
                  Significado Acadêmico:
                </span>
              )}
              {definition.definition && (
                <p className="text-xs text-[#44403C] dark:text-[#E7E5E4] leading-relaxed font-normal">
                  {definition.definition}
                </p>
              )}

              {/* Exemplo / Aplicação Prática */}
              {definition.example && (
                <div className="mt-2.5 pt-2 border-t border-[#E7E2D9] dark:border-[#2C2C30]/80 flex items-start gap-2 text-[11px] text-[#57534E] dark:text-[#D6D3CD] bg-[#EBF3EF]/60 dark:bg-[#15221B]/30 p-2 rounded-xl border border-[#CFE1D6]/50 dark:border-[#22392D]/40">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="italic leading-snug">
                    <strong className="not-italic text-[#1C1917] dark:text-[#FAF9F5] font-semibold">{definition.example}</strong>
                  </p>
                </div>
              )}
            </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
};
