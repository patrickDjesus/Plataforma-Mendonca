import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, Plus, Lightbulb, Image as ImageIcon } from 'lucide-react';
import { GlossaryDefinition } from '../data/disciplinesData';

interface AddGlossaryTermModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTerm?: string;
  initialDefinition?: GlossaryDefinition | null;
  onSaveTerm?: (definition: GlossaryDefinition) => void;
  onAddTerm?: (term: string, definition: GlossaryDefinition) => void;
}

export const AddGlossaryTermModal: React.FC<AddGlossaryTermModalProps> = ({
  isOpen,
  onClose,
  initialTerm = '',
  initialDefinition,
  onSaveTerm,
  onAddTerm
}) => {
  const [term, setTerm] = useState(initialTerm);
  const [definition, setDefinition] = useState('');
  const [example, setExample] = useState('');
  const [category, setCategory] = useState('Conceito');
  const [imageUrl, setImageUrl] = useState('');

  // Sync initialTerm / initialDefinition when prop changes
  React.useEffect(() => {
    if (initialTerm) setTerm(initialTerm);
    if (initialDefinition) {
      setDefinition(initialDefinition.definition || '');
      setExample(initialDefinition.example || '');
      setCategory(initialDefinition.category || 'Conceito');
      setImageUrl(initialDefinition.imageUrl || '');
    }
  }, [initialTerm, initialDefinition]);

  if (!isOpen) return null;

  const canSubmit = term.trim() && (definition.trim() || imageUrl.trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const def: GlossaryDefinition = {
      term: term.trim(),
      definition: definition.trim() || undefined,
      example: example.trim() || undefined,
      category: category.trim() || 'Conceito',
      imageUrl: imageUrl.trim() || undefined
    };

    if (onSaveTerm) onSaveTerm(def);
    if (onAddTerm) onAddTerm(term.trim(), def);

    setTerm('');
    setDefinition('');
    setExample('');
    setImageUrl('');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#1C1917]/65 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-white dark:bg-[#18181B] rounded-[28px] border border-[#E7E2D9]/80 dark:border-[#2C2C30] shadow-2xl overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E7E2D9] dark:border-[#2C2C30] bg-[#EBF3EF]/50 dark:bg-[#15221B]/30">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#2D5A46] text-white flex items-center justify-center shadow-xs">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#1C1917] dark:text-[#FAF9F5] font-display">
                  Definir Significado de Palavra
                </h3>
                <p className="text-[11px] text-[#78716C] dark:text-[#A8A29E]">
                  Aparecerá como balão interativo ao passar o mouse.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-[#A8A29E] hover:text-[#57534E] dark:hover:text-[#E7E5E4] rounded-xl hover:bg-[#EFECE6] dark:hover:bg-[#232326] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
            {/* Termo / Palavra */}
            <div>
              <label className="block text-xs font-bold text-[#44403C] dark:text-[#E7E5E4] mb-1">
                Palavra ou Termo *
              </label>
              <input
                type="text"
                required
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Ex: Derivada, Mitose, Entropia..."
                className="w-full bg-white dark:bg-[#18181B] border border-[#E7E2D9] dark:border-[#2C2C30] rounded-xl px-3 py-2 text-xs text-[#1C1917] dark:text-[#FAF9F5] placeholder-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#2D5A46]/30 focus:border-[#2D5A46] font-bold"
              />
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-xs font-bold text-[#44403C] dark:text-[#E7E5E4] mb-1">
                Categoria / Matéria
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex: Biologia, Cálculo, Termodinâmica..."
                className="w-full bg-white dark:bg-[#18181B] border border-[#E7E2D9] dark:border-[#2C2C30] rounded-xl px-3 py-2 text-xs text-[#1C1917] dark:text-[#FAF9F5] placeholder-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#2D5A46]/30 focus:border-[#2D5A46]"
              />
            </div>

            {/* Significado / Definição */}
            <div>
              <label className="block text-xs font-bold text-[#44403C] dark:text-[#E7E5E4] mb-1">
                Significado / Definição Conceitual (ou insira a imagem)
              </label>
              <textarea
                rows={3}
                value={definition}
                onChange={(e) => setDefinition(e.target.value)}
                placeholder="Explique com clareza o que esta palavra significa neste contexto..."
                className="w-full bg-white dark:bg-[#18181B] border border-[#E7E2D9] dark:border-[#2C2C30] rounded-xl p-3 text-xs text-[#1C1917] dark:text-[#FAF9F5] placeholder-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#2D5A46]/30 focus:border-[#2D5A46] resize-none leading-relaxed"
              />
            </div>

            {/* Imagem do Conceito */}
            <div>
              <label className="block text-xs font-bold text-[#44403C] dark:text-[#E7E5E4] mb-1 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-[#2D5A46]" />
                Imagem do Conceito (Opcional)
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://exemplo.com/diagrama.png"
                className="w-full bg-white dark:bg-[#18181B] border border-[#E7E2D9] dark:border-[#2C2C30] rounded-xl px-3 py-2 text-xs text-[#1C1917] dark:text-[#FAF9F5] placeholder-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#2D5A46]/30 focus:border-[#2D5A46]"
              />
              {imageUrl.trim() && (
                <div className="mt-2 rounded-xl overflow-hidden border border-[#E7E2D9] dark:border-[#2C2C30]">
                  <img
                    src={imageUrl.trim()}
                    alt="Pré-visualização"
                    className="w-full h-28 object-cover"
                    onError={e => { (e.currentTarget.parentElement as HTMLElement).style.display = 'none'; }}
                  />
                </div>
              )}
            </div>

            {/* Exemplo Prático */}
            <div>
              <label className="block text-xs font-bold text-[#44403C] dark:text-[#E7E5E4] mb-1 flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                Exemplo ou Analogia Prática (Opcional)
              </label>
              <input
                type="text"
                value={example}
                onChange={(e) => setExample(e.target.value)}
                placeholder="Ex: A velocidade instantânea do velocímetro do carro."
                className="w-full bg-white dark:bg-[#18181B] border border-[#E7E2D9] dark:border-[#2C2C30] rounded-xl px-3 py-2 text-xs text-[#1C1917] dark:text-[#FAF9F5] placeholder-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#2D5A46]/30 focus:border-[#2D5A46]"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-[#E7E2D9] dark:border-[#2C2C30] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#57534E] dark:text-[#D6D3CD] hover:bg-[#EFECE6] dark:hover:bg-[#232326] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!canSubmit}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2D5A46] hover:bg-[#21483A] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md shadow-[#2D5A46]/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Salvar Significado
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
