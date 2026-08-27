import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, Plus, Lightbulb } from 'lucide-react';
import { GlossaryDefinition } from '../data/disciplinesData';

interface AddGlossaryTermModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTerm?: string;
  onSaveTerm?: (definition: GlossaryDefinition) => void;
  onAddTerm?: (term: string, definition: GlossaryDefinition) => void;
}

export const AddGlossaryTermModal: React.FC<AddGlossaryTermModalProps> = ({
  isOpen,
  onClose,
  initialTerm = '',
  onSaveTerm,
  onAddTerm
}) => {
  const [term, setTerm] = useState(initialTerm);
  const [definition, setDefinition] = useState('');
  const [example, setExample] = useState('');
  const [category, setCategory] = useState('Conceito');

  // Sync initialTerm when prop changes
  React.useEffect(() => {
    if (initialTerm) setTerm(initialTerm);
  }, [initialTerm]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!term.trim() || !definition.trim()) return;

    const def: GlossaryDefinition = {
      term: term.trim(),
      definition: definition.trim(),
      example: example.trim() || undefined,
      category: category.trim() || 'Conceito'
    };

    if (onSaveTerm) onSaveTerm(def);
    if (onAddTerm) onAddTerm(term.trim(), def);

    setTerm('');
    setDefinition('');
    setExample('');
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
          className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-blue-50/50 dark:bg-blue-950/30">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 font-display">
                  Definir Significado de Palavra
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Aparecerá como balão interativo ao passar o mouse.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
            {/* Termo / Palavra */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Palavra ou Termo *
              </label>
              <input
                type="text"
                required
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Ex: Derivada, Mitose, Entropia..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 font-bold"
              />
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Categoria / Matéria
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex: Biologia, Cálculo, Termodinâmica..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Significado / Definição */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Significado / Definição Conceitual *
              </label>
              <textarea
                rows={3}
                required
                value={definition}
                onChange={(e) => setDefinition(e.target.value)}
                placeholder="Explique com clareza o que esta palavra significa neste contexto..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none leading-relaxed"
              />
            </div>

            {/* Exemplo Prático */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                Exemplo ou Analogia Prática (Opcional)
              </label>
              <input
                type="text"
                value={example}
                onChange={(e) => setExample(e.target.value)}
                placeholder="Ex: A velocidade instantânea do velocímetro do carro."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
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
