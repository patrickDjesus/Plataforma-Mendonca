import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Sigma, MousePointerClick } from 'lucide-react';
import { SPECIAL_CHAR_CATEGORIES, TOTAL_SPECIAL_CHARS } from '../data/specialCharacters';
import { playSound } from '../utils/sounds';

interface SpecialCharPickerProps {
  open: boolean;
  onSelectChar: (char: string) => void;
  onClose: () => void;
}

export const SpecialCharPicker: React.FC<SpecialCharPickerProps> = ({ open, onSelectChar, onClose }) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const searching = query.trim().length > 0;

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = searching
      ? SPECIAL_CHAR_CATEGORIES
      : activeCategory === 'all'
        ? SPECIAL_CHAR_CATEGORIES
        : SPECIAL_CHAR_CATEGORIES.filter((cat) => cat.id === activeCategory);

    return base
      .map((cat) =>
        searching
          ? {
              ...cat,
              chars: cat.chars.filter(
                (ch) => ch.name.toLowerCase().includes(q) || ch.char.includes(q),
              ),
            }
          : cat,
      )
      .filter((cat) => cat.chars.length > 0);
  }, [query, activeCategory, searching]);

  const visibleCount = filteredCategories.reduce((acc, cat) => acc + cat.chars.length, 0);

  const close = () => {
    playSound('click');
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, x: -24, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -24, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="fixed left-2 sm:left-4 top-2 sm:top-4 z-[99999] w-[min(84vw,21rem)] sm:w-80 max-h-[calc(100vh-1rem)] sm:max-h-[calc(100vh-2rem)] flex flex-col bg-white dark:bg-[#18181B] rounded-2xl border border-[#E7E2D9] dark:border-[#2C2C30] shadow-2xl overflow-hidden"
        >
          {/* Header compacto */}
          <div className="relative overflow-hidden bg-gradient-to-r from-[#1C1917] via-[#22392D] to-[#1E3E30] border-b border-[#52B788]/30 px-3 py-2.5 text-white shrink-0">
            <div className="absolute right-0 top-0 bottom-0 w-1/4 opacity-10 bg-[radial-gradient(#52B788_1px,transparent_1px)] [background-size:14px_14px] pointer-events-none" />
            <div className="relative z-10 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-[#2D5A46]/25 border border-[#2D5A46]/40 text-[#52B788] flex items-center justify-center shrink-0">
                  <Sigma className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-display font-extrabold text-[13px] leading-tight">Caracteres Especiais</h2>
                  <p className="text-[9px] text-[#A8A29E] leading-tight truncate">{TOTAL_SPECIAL_CHARS} símbolos • clique para inserir</p>
                </div>
              </div>
              <button
                type="button"
                onClick={close}
                className="shrink-0 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#D6D3CD] transition-colors cursor-pointer"
                title="Fechar (Esc)"
                aria-label="Fechar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Busca + chips */}
          <div className="px-3 pt-2.5 pb-1.5 space-y-2 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#A8A29E] pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Pesquisar (ex: integral, seta...)"
                className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg bg-[#EFECE6] dark:bg-[#232326] border border-[#E7E2D9] dark:border-[#3B3B40] outline-none text-[#1C1917] dark:text-[#E7E5E4] placeholder:text-[#A8A29E] placeholder:text-[11px] focus:ring-1 focus:ring-[#2D5A46]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-[#E5DFD5] dark:hover:bg-[#333338] text-[#A8A29E] transition-colors cursor-pointer"
                  title="Limpar busca"
                  aria-label="Limpar busca"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {!searching && (
              <div className="flex gap-1 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => { playSound('click'); setActiveCategory('all'); }}
                  className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer border ${
                    activeCategory === 'all'
                      ? 'bg-[#2D5A46] dark:bg-[#2D5A46] text-white dark:text-white border-[#2D5A46] dark:border-[#2D5A46]'
                      : 'bg-[#EFECE6] dark:bg-[#232326] text-[#57534E] dark:text-[#D6D3CD] border-[#E7E2D9] dark:border-[#3B3B40] hover:bg-[#E5DFD5] dark:hover:bg-[#333338]'
                  }`}
                >
                  Todas
                </button>
                {SPECIAL_CHAR_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => { playSound('click'); setActiveCategory(cat.id); }}
                    className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer border ${
                      activeCategory === cat.id
                        ? 'text-white border-transparent'
                        : 'bg-[#EFECE6] dark:bg-[#232326] text-[#57534E] dark:text-[#D6D3CD] border-[#E7E2D9] dark:border-[#3B3B40] hover:bg-[#E5DFD5] dark:hover:bg-[#333338]'
                    }`}
                    style={activeCategory === cat.id ? { backgroundColor: cat.accent } : undefined}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Lista com scroll interno */}
          <div className="flex-1 overflow-y-auto px-3 py-2 no-scrollbar min-h-0">
            {visibleCount === 0 ? (
              <div className="py-8 text-center space-y-1.5">
                <div className="text-2xl">🔍</div>
                <p className="text-[11px] font-bold text-[#78716C] dark:text-[#A8A29E]">
                  Nada para "{query.trim()}".
                </p>
                <p className="text-[10px] text-[#A8A29E] dark:text-[#78716C]">
                  Tente: integral, sigma, seta, raiz, fração...
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCategories.map((cat) => (
                  <div key={cat.id}>
                    <div className="flex items-center gap-1.5 pb-1.5">
                      <span className="w-1 h-3.5 rounded-full shrink-0" style={{ backgroundColor: cat.accent }} />
                      <h3 className="font-display font-extrabold text-[11px] text-[#1C1917] dark:text-[#FAF9F5] truncate">
                        {cat.label}
                      </h3>
                      <span className="text-[9px] font-medium text-[#A8A29E] dark:text-[#78716C] shrink-0">
                        {cat.chars.length}
                      </span>
                    </div>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(60px,1fr))] gap-1">
                      {cat.chars.map((ch) => (
                        <button
                          key={ch.name + ch.char}
                          type="button"
                          onClick={() => onSelectChar(ch.char)}
                          title={ch.name}
                          className="group flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-lg border border-[#E7E2D9]/80 dark:border-[#2C2C30] bg-white dark:bg-[#18181B] hover:border-[#2D5A46] hover:bg-[#EBF3EF] dark:hover:bg-[#15221B]/40 hover:shadow-md transition-all cursor-pointer"
                        >
                          <span className="text-xl leading-none text-[#1C1917] dark:text-[#FAF9F5] group-hover:text-[#2D5A46] dark:group-hover:text-[#52B788]" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
                            {ch.char}
                          </span>
                          <span className="w-full text-center text-[8px] leading-tight text-[#A8A29E] dark:text-[#78716C] line-clamp-2 group-hover:text-[#2D5A46] dark:group-hover:text-[#52B788]">
                            {ch.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rodapé */}
          <div className="px-3 py-1.5 border-t border-[#E7E2D9] dark:border-[#2C2C30] bg-[#EFECE6] dark:bg-[#232326]/50 flex items-center justify-between text-[9px] text-[#A8A29E] dark:text-[#78716C] shrink-0">
            <span className="flex items-center gap-1 min-w-0">
              <MousePointerClick className="w-2.5 h-2.5 shrink-0" />
              <span className="truncate">
                {searching
                  ? `${visibleCount} resultado(s) — clique para inserir`
                  : `${visibleCount} de ${TOTAL_SPECIAL_CHARS}`}
              </span>
            </span>
            <kbd className="shrink-0 px-1.5 py-0.5 rounded-md bg-[#E7E2D9]/70 dark:bg-[#3B3B40] text-[#78716C] dark:text-[#D6D3CD] font-mono text-[8px]">Esc</kbd>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};