import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Wand2,
  Minimize2,
  Maximize2,
  Pencil,
  Languages,
} from 'lucide-react';
import { AiEditAction } from '../services/ai';

interface AiEditPopoverProps {
  position: { x: number; y: number };
  onSelectAction: (action: AiEditAction) => void;
  onClose: () => void;
}

const ACTIONS: { action: AiEditAction; label: string; icon: React.ReactNode; color: string }[] = [
  { action: 'improve', label: 'Melhorar', icon: <Wand2 className="w-3.5 h-3.5" />, color: 'text-[#2D5A46] dark:text-[#52B788]' },
  { action: 'fix-grammar', label: 'Corrigir', icon: <Pencil className="w-3.5 h-3.5" />, color: 'text-[#2D5A46] dark:text-[#52B788]' },
  { action: 'simplify', label: 'Simplificar', icon: <Minimize2 className="w-3.5 h-3.5" />, color: 'text-emerald-600 dark:text-emerald-400' },
  { action: 'expand', label: 'Expandir', icon: <Maximize2 className="w-3.5 h-3.5" />, color: 'text-amber-600 dark:text-amber-400' },
  { action: 'summarize', label: 'Resumir', icon: <Languages className="w-3.5 h-3.5" />, color: 'text-[#2D5A46] dark:text-[#52B788]' },
];

export const AiEditPopover: React.FC<AiEditPopoverProps> = ({
  position,
  onSelectAction,
  onClose,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 6, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.95 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="fixed z-[99998] bg-white dark:bg-[#18181B] rounded-2xl shadow-2xl border border-[#E7E2D9] dark:border-[#3B3B40] p-1.5 flex items-center gap-0.5"
      style={{ left: position.x, top: position.y }}
    >
      <div className="flex items-center gap-1 px-2 py-1 border-r border-[#E7E2D9] dark:border-[#3B3B40] mr-1">
        <Sparkles className="w-3.5 h-3.5 text-[#2D5A46] animate-pulse" />
        <span className="text-[10px] font-extrabold text-[#2D5A46] dark:text-[#52B788] uppercase tracking-wide">
          IA
        </span>
      </div>

      {ACTIONS.map(({ action, label, icon, color }) => (
        <button
          key={action}
          type="button"
          onClick={() => onSelectAction(action)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer hover:bg-[#E5DFD5] dark:hover:bg-[#333338] ${color}`}
          title={`IA: ${label} texto selecionado`}
        >
          {icon}
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </motion.div>
  );
};
