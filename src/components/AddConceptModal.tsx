import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Brain, 
  Plus, 
  Share2, 
  Tag, 
  Check, 
  Activity
} from 'lucide-react';
import { ConceptNode } from '../types/design';

interface AddConceptModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingNodes: ConceptNode[];
  onAddConcept: (newNode: ConceptNode) => void;
}

const COLOR_OPTIONS = [
  { name: 'Ciano Neon', hex: '#06B6D4', glow: 'rgba(6, 182, 212, 0.4)' },
  { name: 'Roxo Sináptico', hex: '#8B5CF6', glow: 'rgba(139, 92, 246, 0.4)' },
  { name: 'Azul Quântico', hex: '#3B82F6', glow: 'rgba(59, 130, 246, 0.4)' },
  { name: 'Esmeralda', hex: '#10B981', glow: 'rgba(16, 185, 129, 0.4)' },
  { name: 'Rosa Magenta', hex: '#EC4899', glow: 'rgba(236, 72, 153, 0.4)' },
  { name: 'Âmbar Dourado', hex: '#F59E0B', glow: 'rgba(245, 158, 11, 0.4)' },
];

const PRESET_CATEGORIES = [
  'Neurociência',
  'Algoritmos',
  'Cálculo',
  'Física Quântica',
  'Genética',
  'Filosofia',
  'Química Orgânica',
  'História & Humanas'
];

export const AddConceptModal: React.FC<AddConceptModalProps> = ({
  isOpen,
  onClose,
  existingNodes,
  onAddConcept
}) => {
  const [label, setLabel] = useState('');
  const [category, setCategory] = useState('Neurociência');
  const [customCategory, setCustomCategory] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const [mastery, setMastery] = useState(75);
  const [description, setDescription] = useState('');
  const [selectedConnections, setSelectedConnections] = useState<string[]>([]);
  const [tagsInput, setTagsInput] = useState('');

  if (!isOpen) return null;

  const handleToggleConnection = (nodeId: string) => {
    setSelectedConnections(prev =>
      prev.includes(nodeId) ? prev.filter(id => id !== nodeId) : [...prev, nodeId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    const finalCategory = category === 'Outro' ? (customCategory.trim() || 'Geral') : category;
    const tags = tagsInput
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    if (tags.length === 0) {
      tags.push(finalCategory, 'Conceito');
    }

    // Organic canvas coordinate placing
    const angle = Math.random() * Math.PI * 2;
    const radius = 180 + Math.random() * 120;
    const centerX = 500;
    const centerY = 350;
    const x = Math.round(centerX + Math.cos(angle) * radius);
    const y = Math.round(centerY + Math.sin(angle) * radius);

    const newNodeId = `node-custom-${Date.now()}`;

    const newNode: ConceptNode = {
      id: newNodeId,
      label: label.trim(),
      category: finalCategory,
      color: selectedColor.hex,
      glowColor: selectedColor.glow,
      x: Math.max(120, Math.min(880, x)),
      y: Math.max(100, Math.min(600, y)),
      size: 26,
      mastery: Number(mastery),
      description: description.trim() || `Conceito fundamental de ${label.trim()} mapeado na rede neural de estudos.`,
      connections: selectedConnections,
      synapticStrength: Math.min(5, Math.max(2, selectedConnections.length + 1)),
      tags
    };

    onAddConcept(newNode);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden z-10 my-6"
        >
          {/* Header Banner */}
          <div 
            className="h-3 w-full" 
            style={{ 
              background: `linear-gradient(90deg, ${selectedColor.hex}, #8B5CF6, #06B6D4)` 
            }} 
          />

          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md transition-colors"
                style={{ backgroundColor: selectedColor.hex }}
              >
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white font-display flex items-center gap-2">
                  Novo Termo no Mapa Neural
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Adicione um nó de conhecimento e estabeleça conexões sinápticas
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            
            {/* Nome do Termo / Conceito */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-200 mb-1.5 uppercase tracking-wider">
                Nome do Termo / Conceito *
              </label>
              <input
                type="text"
                required
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Ex: Entropia Cruzada, Ciclo de Krebs, Transformada de Fourier..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold"
              />
            </div>

            {/* Categoria & Cor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Área / Categoria
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  {PRESET_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="Outro">Personalizada / Outro</option>
                </select>
                {category === 'Outro' && (
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Digite a categoria..."
                    className="mt-2 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Cor Sináptica do Nó
                </label>
                <div className="flex items-center gap-2 pt-1">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                        selectedColor.hex === c.hex ? 'scale-125 ring-2 ring-offset-2 ring-slate-400' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      {selectedColor.hex === c.hex && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Nível de Domínio (Mastery) Slider */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-purple-500" />
                  Nível de Domínio Inicial
                </span>
                <span className="font-extrabold text-purple-600 dark:text-purple-400 font-mono text-sm">
                  {mastery}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={mastery}
                onChange={(e) => setMastery(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Iniciante (10%)</span>
                <span>Intermediário (50%)</span>
                <span>Mestre (100%)</span>
              </div>
            </div>

            {/* Conexões Sinápticas com Nós Existentes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-slate-400" />
                Conectar com outros Nós da Rede (Opcional)
              </label>
              <div className="max-h-28 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl p-2 bg-slate-50/50 dark:bg-slate-800/40 grid grid-cols-2 gap-1.5">
                {existingNodes.map((node) => {
                  const isChecked = selectedConnections.includes(node.id);
                  return (
                    <div
                      key={node.id}
                      onClick={() => handleToggleConnection(node.id)}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-purple-100/80 dark:bg-purple-950/80 text-purple-900 dark:text-purple-200 font-bold border border-purple-300 dark:border-purple-800'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div 
                        className="w-2.5 h-2.5 rounded-full shrink-0" 
                        style={{ backgroundColor: node.color }} 
                      />
                      <span className="truncate">{node.label}</span>
                      {isChecked && <Check className="w-3 h-3 ml-auto text-purple-600 shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Descrição & Síntese */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Síntese / Definição do Conceito
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explique o axioma fundamental, fórmula chave ou aplicação prática deste termo..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Tags (separadas por vírgula)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Ex: #Fórmulas, #ENEM2026, #Axioma"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            {/* Botões de Ação */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-purple-500/25 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar ao Mapa</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
