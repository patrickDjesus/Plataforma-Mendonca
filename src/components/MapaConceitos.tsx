import React, { useState, useRef } from 'react';
import { CONCEPT_NODES } from '../data/mockData';
import { ConceptNode, ScreenId } from '../types/design';
import { 
  ZoomIn, 
  ZoomOut, 
  Search, 
  Sparkles, 
  Zap, 
  Play, 
  ArrowUpRight, 
  Brain,
  Plus,
  Share2,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AddConceptModal } from './AddConceptModal';

interface MapaConceitosProps {
  onNavigate: (screen: ScreenId) => void;
}

export const MapaConceitos: React.FC<MapaConceitosProps> = ({ onNavigate }) => {
  const [nodes, setNodes] = useState<ConceptNode[]>(CONCEPT_NODES);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-1');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isAddConceptOpen, setIsAddConceptOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const startPanRef = useRef({ x: 0, y: 0 });

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only pan if clicking canvas directly
    if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).id === 'canvas-bg') {
      setIsPanning(true);
      startPanRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - startPanRef.current.x,
        y: e.clientY - startPanRef.current.y,
      });
    }
  };

  const handleMouseUp = () => setIsPanning(false);

  const handleAddConcept = (newNode: ConceptNode) => {
    setNodes(prev => {
      // Also ensure connected nodes know about this connection
      const updated = prev.map(existing => {
        if (newNode.connections.includes(existing.id)) {
          return {
            ...existing,
            connections: Array.from(new Set([...existing.connections, newNode.id]))
          };
        }
        return existing;
      });
      return [...updated, newNode];
    });

    setSelectedNodeId(newNode.id);
    setSuccessToast(`Termo "${newNode.label}" adicionado à rede sináptica!`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Get distinct categories
  const allCategories = Array.from(new Set(nodes.map(n => n.category)));

  const filteredNodes = nodes.filter((node) => {
    const matchesSearch = node.label.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          node.tags.some(t => t.toLowerCase().includes(searchFilter.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || node.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div 
      id="canvas-bg"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="relative w-full h-full min-h-[550px] rounded-[32px] bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden select-none bg-neural-grid cursor-grab active:cursor-grabbing shadow-xs"
    >
      {/* Toast de Confirmação */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-40 px-4 py-2 bg-emerald-600 text-white rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. HUD Superior Esquerdo: Barra de Busca & Filtros por Categoria */}
      <div className="absolute top-5 left-5 z-20 flex flex-wrap items-center gap-3">
        {/* Caixa de Busca Flutuante em Vidro */}
        <div className="glass-panel px-3.5 py-2 rounded-2xl flex items-center gap-2.5 shadow-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Buscar nós ou tags..."
            className="bg-transparent text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none w-40 sm:w-56"
          />
          {searchFilter && (
            <button onClick={() => setSearchFilter('')} className="text-xs text-slate-400 hover:text-slate-700" aria-label="Limpar busca">
              ✕
            </button>
          )}
        </div>

        {/* Filtros por Categoria */}
        <div className="glass-panel p-1 rounded-2xl flex items-center gap-1 shadow-md hidden md:flex bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              categoryFilter === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Todas ({nodes.length})
          </button>
          {allCategories.slice(0, 4).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Botão Principal: + Novo Termo Neural */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setIsAddConceptOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-purple-500/25 transition-all cursor-pointer"
          title="Criar novo termo/conceito e vincular aos nós da rede"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Novo Termo</span>
        </motion.button>
      </div>

      {/* 2. HUD Inferior Direito: Controles de Zoom & Vista */}
      <div className="absolute bottom-5 right-5 z-20 flex flex-col gap-2">
        <div className="glass-panel p-1.5 rounded-2xl flex flex-col gap-1 shadow-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800">
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.8, z + 0.15))}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Aproximar Zoom"
            aria-label="Aumentar zoom"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.15))}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Afastar Zoom"
            aria-label="Diminuir zoom"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="w-full h-[1px] bg-slate-200 dark:bg-slate-700 my-0.5" />
          <button
            onClick={() => { setZoomLevel(1); setPanOffset({ x: 0, y: 0 }); }}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-[10px] font-bold text-center cursor-pointer"
            title="Resetar Vista"
            aria-label="Resetar zoom"
          >
            100%
          </button>
        </div>
      </div>

      {/* 3. Gaveta Lateral Flutuante com Detalhes do Nó Selecionado */}
      {selectedNode && (
        <motion.div 
          key={selectedNode.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-5 left-5 z-20 w-80 sm:w-96 glass-panel-ai rounded-3xl p-5 shadow-2xl space-y-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-slate-200/90 dark:border-slate-800"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span 
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                style={{ 
                  backgroundColor: selectedNode.color + '18',
                  color: selectedNode.color,
                  border: `1px solid ${selectedNode.color}40`
                }}
              >
                <Brain className="w-3 h-3" />
                {selectedNode.category}
              </span>
              <h3 className="font-display font-extrabold text-base text-slate-900 dark:text-white">
                {selectedNode.label}
              </h3>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-400 font-medium">Domínio</span>
              <span className="text-sm font-extrabold text-cyan-600 dark:text-cyan-400 font-mono">
                {selectedNode.mastery}%
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {selectedNode.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {selectedNode.tags.map((tag, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-medium">
                #{tag}
              </span>
            ))}
          </div>

          {/* Ações Rápidas */}
          <div className="pt-3 border-t border-purple-100 dark:border-slate-800 flex items-center gap-2">
            <button
              onClick={() => onNavigate('treino')}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Treinar Este Nó</span>
            </button>
            <button
              onClick={() => onNavigate('caderno')}
              className="py-2.5 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
              title="Abrir anotações sobre este conceito"
              aria-label="Abrir no caderno"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* 4. Canvas SVG & Nós da Rede Neural */}
      <div 
        className="w-full h-full transform transition-transform duration-75 origin-center"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`
        }}
      >
        <svg className="w-full h-full absolute inset-0 pointer-events-auto">
          <defs>
            {/* Gradientes para Conexões */}
            <linearGradient id="synapseGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="synapseGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E40AF" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.7" />
            </linearGradient>
          </defs>

          {/* Linhas de Conexão Sináptica em Curvas de Bézier */}
          {filteredNodes.map((node) => {
            return (node.connections || []).map((targetId) => {
              const targetNode = nodes.find((n) => n.id === targetId);
              if (!targetNode) return null;

              const isHighlighted = selectedNodeId === node.id || selectedNodeId === targetId;
              const dx = targetNode.x - node.x;
              const dy = targetNode.y - node.y;
              const cx1 = node.x + dx * 0.5;
              const cy1 = node.y;
              const cx2 = node.x + dx * 0.5;
              const cy2 = targetNode.y;

              const pathData = `M ${node.x} ${node.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${targetNode.x} ${targetNode.y}`;

              return (
                <g key={`${node.id}-${targetId}`}>
                  {/* Linha de Conexão Base */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke={isHighlighted ? (node.color || '#06B6D4') : '#CBD5E1'}
                    strokeWidth={isHighlighted ? '2.5' : '1.5'}
                    strokeDasharray={isHighlighted ? 'none' : '4, 4'}
                    className="transition-all duration-300 opacity-80"
                  />

                  {/* Pulso Sináptico Animado percorrendo a linha */}
                  {isHighlighted && (
                    <circle r="3.5" fill={node.color || '#06B6D4'} className="animate-neural-pulse">
                      <animateMotion
                        path={pathData}
                        dur="2.5s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                </g>
              );
            });
          })}

          {/* Renderização dos Nós */}
          {filteredNodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const isHovered = hoveredNodeId === node.id;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => setSelectedNodeId(node.id)}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                className="cursor-pointer transition-transform duration-200 group"
              >
                {/* Anel Luminoso Externo de Seleção (Efeito Halo Neon) */}
                {isSelected && (
                  <circle
                    r={node.size + 14}
                    fill="none"
                    stroke={node.color}
                    strokeWidth="2"
                    strokeOpacity="0.4"
                    className="animate-ping"
                  />
                )}

                {/* Anel Perimétrico de Nível de Domínio */}
                <circle
                  r={node.size + 6}
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="2"
                />
                <circle
                  r={node.size + 6}
                  fill="none"
                  stroke={node.color}
                  strokeWidth="2.5"
                  strokeDasharray={`${(node.mastery / 100) * 2 * Math.PI * (node.size + 6)} ${2 * Math.PI * (node.size + 6)}`}
                  strokeLinecap="round"
                  transform="rotate(-90)"
                />

                {/* Corpo do Nó Central */}
                <circle
                  r={node.size}
                  fill="#FFFFFF"
                  stroke={node.color}
                  strokeWidth={isSelected ? '3.5' : '2'}
                  filter="drop-shadow(0 4px 10px rgba(0,0,0,0.06))"
                  className="transition-all duration-150"
                />

                {/* Ícone ou Indicador de Categoria Interno */}
                <circle
                  r={node.size - 8}
                  fill={node.color}
                  fillOpacity={isSelected ? '0.25' : '0.12'}
                />

                <text
                  textAnchor="middle"
                  dy=".3em"
                  fontSize="10"
                  fontWeight="bold"
                  fill={node.color}
                  fontFamily="sans-serif"
                >
                  {node.mastery}%
                </text>

                {/* Rótulo Flutuante do Nó */}
                <g transform={`translate(0, ${node.size + 18})`}>
                  <rect
                    x="-65"
                    y="-10"
                    width="130"
                    height="20"
                    rx="10"
                    fill={isSelected ? '#0F172A' : '#FFFFFF'}
                    stroke={isSelected ? '#0F172A' : '#E2E8F0'}
                    strokeWidth="1"
                    filter="drop-shadow(0 2px 5px rgba(0,0,0,0.04))"
                  />
                  <text
                    textAnchor="middle"
                    dy=".35em"
                    fontSize="10"
                    fontWeight="600"
                    fill={isSelected ? '#FFFFFF' : '#1E293B'}
                    fontFamily="sans-serif"
                  >
                    {node.label}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Empty State quando não há nós neurais */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 p-6">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 rounded-[32px] p-8 max-w-md text-center shadow-2xl pointer-events-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 mx-auto flex items-center justify-center shadow-inner">
              <Brain className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white">
                Grafo de Conhecimento Neural Zerado
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Nenhum conceito foi mapeado ainda. Comece a estruturar sua rede sináptica adicionando termos-chave, fórmulas e tópicos interconectados.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setIsAddConceptOpen(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-purple-500/25 inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Adicionar Primeiro Termo Neural</span>
            </motion.button>
          </div>
        </div>
      )}

      {/* Modal para Adicionar Novo Termo / Nó */}
      <AddConceptModal
        isOpen={isAddConceptOpen}
        onClose={() => setIsAddConceptOpen(false)}
        existingNodes={nodes}
        onAddConcept={handleAddConcept}
      />
    </div>
  );
};
