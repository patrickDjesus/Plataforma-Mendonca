import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Deck, DeckColor } from '../types';
import { COLOR_THEMES, AVAILABLE_ICONS, renderDeckIcon } from '../utils/theme';

interface DeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (deckData: { name: string; description: string; color: DeckColor; icon: string }) => void;
  initialDeck?: Deck | null;
}

export const DeckModal: React.FC<DeckModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialDeck,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState<DeckColor>('indigo');
  const [icon, setIcon] = useState('BookOpen');

  useEffect(() => {
    if (initialDeck) {
      setName(initialDeck.name);
      setDescription(initialDeck.description || '');
      setColor(initialDeck.color);
      setIcon(initialDeck.icon || 'BookOpen');
    } else {
      setName('');
      setDescription('');
      setColor('indigo');
      setIcon('BookOpen');
    }
  }, [initialDeck, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      description: description.trim(),
      color,
      icon,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-[#FAF8F5] dark:bg-[#18181B] w-full max-w-md rounded-2xl shadow-2xl border-2 border-[#E7E2D9] dark:border-[#2C2C30] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E2D9] dark:border-[#2C2C30]">
          <h2 className="text-lg font-bold text-[#1C1917] dark:text-[#FAF9F5] font-['Fraunces',serif]">
            {initialDeck ? 'Editar Baralho' : 'Novo Baralho de Flashcards'}
          </h2>
          <button
            id="btn-close-deck-modal"
            onClick={onClose}
            className="p-1.5 text-[#8C7A6B] hover:text-[#1C1917] dark:hover:text-white rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold text-[#8C7A6B] dark:text-[#A8A29E] uppercase tracking-wider mb-1.5">
              Nome do Baralho *
            </label>
            <input
              id="input-deck-name"
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Vocabulário Espanhol, Anatomia, Direito Civil..."
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#E7E2D9] dark:border-[#2C2C30] bg-white dark:bg-[#141416] text-[#1C1917] dark:text-[#FAF9F5] placeholder-[#A8A29E] focus:outline-none focus:border-[#2D5A46] text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-[#8C7A6B] dark:text-[#A8A29E] uppercase tracking-wider mb-1.5">
              Descrição (opcional)
            </label>
            <textarea
              id="input-deck-description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o propósito ou tópicos principais deste conjunto..."
              className="w-full px-3.5 py-2 rounded-xl border-2 border-[#E7E2D9] dark:border-[#2C2C30] bg-white dark:bg-[#141416] text-[#1C1917] dark:text-[#FAF9F5] placeholder-[#A8A29E] focus:outline-none focus:border-[#2D5A46] text-sm resize-none"
            />
          </div>

          {/* Color selector */}
          <div>
            <label className="block text-xs font-mono font-bold text-[#8C7A6B] dark:text-[#A8A29E] uppercase tracking-wider mb-2">
              Cor de Destaque
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {(Object.keys(COLOR_THEMES) as DeckColor[]).map((cKey) => {
                const theme = COLOR_THEMES[cKey];
                const isSelected = color === cKey;
                return (
                  <button
                    key={cKey}
                    type="button"
                    title={theme.name}
                    onClick={() => setColor(cKey)}
                    className={`h-9 rounded-xl flex items-center justify-center transition-all ${theme.bg} ${
                      isSelected
                        ? 'ring-2 ring-offset-2 ring-[#1C1917] dark:ring-white dark:ring-offset-[#18181B] scale-105'
                        : 'opacity-85 hover:opacity-100 hover:scale-102'
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Icon selector */}
          <div>
            <label className="block text-xs font-mono font-bold text-[#8C7A6B] dark:text-[#A8A29E] uppercase tracking-wider mb-2">
              Ícone Temático
            </label>
            <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1.5 border-2 border-[#E7E2D9] dark:border-[#2C2C30] rounded-xl bg-white dark:bg-[#141416]">
              {AVAILABLE_ICONS.map((item) => {
                const isSelected = icon === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    title={item.label}
                    onClick={() => setIcon(item.id)}
                    className={`p-2.5 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${
                      isSelected
                        ? 'bg-[#2D5A46] text-white shadow-xs'
                        : 'text-[#57534E] dark:text-[#A8A29E] hover:bg-[#EBF3EF] dark:hover:bg-[#15221B] hover:text-[#2D5A46]'
                    }`}
                  >
                    {renderDeckIcon(item.id, 'w-5 h-5')}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E7E2D9] dark:border-[#2C2C30]">
            <button
              id="btn-cancel-deck-modal"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-[#57534E] dark:text-[#A8A29E] hover:bg-[#EFECE6] dark:hover:bg-[#25252A] rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              id="btn-submit-deck-modal"
              type="submit"
              disabled={!name.trim()}
              className="px-5 py-2.5 text-sm font-bold text-white bg-[#2D5A46] hover:bg-[#21483A] disabled:opacity-40 disabled:pointer-events-none rounded-xl shadow-xs transition-all"
            >
              {initialDeck ? 'Salvar Alterações' : 'Criar Baralho'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
