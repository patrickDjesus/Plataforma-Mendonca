import React, { useState, useEffect } from 'react';
import { X, Star, HelpCircle } from 'lucide-react';
import { Flashcard, DifficultyLevel } from '../types';

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cardData: {
    front: string;
    back: string;
    tag?: string;
    difficulty: DifficultyLevel;
    starred: boolean;
  }) => void;
  initialCard?: Flashcard | null;
}

export const CardModal: React.FC<CardModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialCard,
}) => {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [tag, setTag] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [starred, setStarred] = useState(false);

  useEffect(() => {
    if (initialCard) {
      setFront(initialCard.front);
      setBack(initialCard.back);
      setTag(initialCard.tag || '');
      setDifficulty(initialCard.difficulty || 'medium');
      setStarred(!!initialCard.starred);
    } else {
      setFront('');
      setBack('');
      setTag('');
      setDifficulty('medium');
      setStarred(false);
    }
  }, [initialCard, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;
    onSave({
      front: front.trim(),
      back: back.trim(),
      tag: tag.trim() || undefined,
      difficulty,
      starred,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-[#FAF8F5] dark:bg-[#18181B] w-full max-w-lg rounded-2xl shadow-2xl border-2 border-[#E7E2D9] dark:border-[#2C2C30] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E2D9] dark:border-[#2C2C30]">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#1C1917] dark:text-[#FAF9F5] font-['Fraunces',serif]">
              {initialCard ? 'Editar Flashcard' : 'Novo Flashcard'}
            </h2>
            <button
              type="button"
              onClick={() => setStarred(!starred)}
              title={starred ? 'Marcado como favorito' : 'Marcar favorito'}
              className={`p-1.5 rounded-lg transition-colors ${
                starred
                  ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                  : 'text-[#8C7A6B] hover:text-amber-500 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Star className={`w-4 h-4 ${starred ? 'fill-amber-500' : ''}`} />
            </button>
          </div>
          <button
            id="btn-close-card-modal"
            onClick={onClose}
            className="p-1.5 text-[#8C7A6B] hover:text-[#1C1917] dark:hover:text-white rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono font-bold text-[#8C7A6B] dark:text-[#A8A29E] uppercase tracking-wider">
                Frente (Pergunta ou Termo) *
              </label>
              <span className="text-[11px] font-mono text-[#8C7A6B]">O que você verá primeiro</span>
            </div>
            <textarea
              id="input-card-front"
              required
              rows={2}
              autoFocus
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder="Ex: O que é o Teorema de Pitágoras? ou Mitocôndria..."
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#E7E2D9] dark:border-[#2C2C30] bg-white dark:bg-[#141416] text-[#1C1917] dark:text-[#FAF9F5] placeholder-[#A8A29E] focus:outline-none focus:border-[#2D5A46] text-sm resize-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono font-bold text-[#8C7A6B] dark:text-[#A8A29E] uppercase tracking-wider">
                Verso (Resposta ou Definição) *
              </label>
              <span className="text-[11px] font-mono text-[#8C7A6B]">Revelado ao virar o cartão</span>
            </div>
            <textarea
              id="input-card-back"
              required
              rows={3}
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder="Ex: A soma dos quadrados dos catetos é igual ao quadrado da hipotenusa (a² + b² = c²)..."
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#E7E2D9] dark:border-[#2C2C30] bg-white dark:bg-[#141416] text-[#1C1917] dark:text-[#FAF9F5] placeholder-[#A8A29E] focus:outline-none focus:border-[#2D5A46] text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-[#8C7A6B] dark:text-[#A8A29E] uppercase tracking-wider mb-1.5">
                Tag / Categoria (opcional)
              </label>
              <input
                id="input-card-tag"
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="Ex: Fórmulas, Verbos, Gramática..."
                className="w-full px-3.5 py-2 rounded-xl border-2 border-[#E7E2D9] dark:border-[#2C2C30] bg-white dark:bg-[#141416] text-[#1C1917] dark:text-[#FAF9F5] placeholder-[#A8A29E] focus:outline-none focus:border-[#2D5A46] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-[#8C7A6B] dark:text-[#A8A29E] uppercase tracking-wider mb-1.5">
                Nível de Dificuldade
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#EFECE6] dark:bg-[#202024] rounded-xl">
                {(['easy', 'medium', 'hard'] as DifficultyLevel[]).map((level) => {
                  const labels = { easy: 'Fácil', medium: 'Médio', hard: 'Difícil' };
                  const isSelected = difficulty === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setDifficulty(level)}
                      className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        isSelected
                          ? level === 'easy'
                            ? 'bg-[#2D5A46] text-white shadow-xs'
                            : level === 'medium'
                            ? 'bg-[#D97706] text-white shadow-xs'
                            : 'bg-[#A8423F] text-white shadow-xs'
                          : 'text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-white'
                      }`}
                    >
                      {labels[level]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E7E2D9] dark:border-[#2C2C30]">
            <button
              id="btn-cancel-card-modal"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-[#57534E] dark:text-[#A8A29E] hover:bg-[#EFECE6] dark:hover:bg-[#25252A] rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              id="btn-submit-card-modal"
              type="submit"
              disabled={!front.trim() || !back.trim()}
              className="px-5 py-2.5 text-sm font-bold text-white bg-[#2D5A46] hover:bg-[#21483A] disabled:opacity-40 disabled:pointer-events-none rounded-xl shadow-xs transition-all"
            >
              {initialCard ? 'Salvar Cartão' : 'Adicionar Cartão'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
