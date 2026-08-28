import React, { useState, useMemo } from 'react';
import { Search, Sparkles, Clock, Star, X, Check, BookOpen, Calculator, FlaskConical, Globe, Flame } from 'lucide-react';
import { AnimatedEmoji } from './AnimatedEmoji';

export interface EmojiItem {
  emoji: string;
  name: string;
  category: 'estudos' | 'exatas' | 'ciencias' | 'humanas' | 'metas' | 'simbolos';
}

// eslint-disable-next-line react-refresh/only-export-components
export const THEMATIC_EMOJIS: EmojiItem[] = [
  // Estudos & Organização
  { emoji: '📚', name: 'Livros de Estudo', category: 'estudos' },
  { emoji: '📖', name: 'Caderno Aberto', category: 'estudos' },
  { emoji: '✍️', name: 'Escrevendo / Anotação', category: 'estudos' },
  { emoji: '📝', name: 'Memorando / Resumo', category: 'estudos' },
  { emoji: '💡', name: 'Ideia / Insight', category: 'estudos' },
  { emoji: '📌', name: 'Ponto Chave Fixado', category: 'estudos' },
  { emoji: '🧠', name: 'Cérebro / Cognição', category: 'estudos' },
  { emoji: '🎓', name: 'Formatura / Conquista', category: 'estudos' },
  { emoji: '🔍', name: 'Pesquisa / Análise', category: 'estudos' },
  { emoji: '📋', name: 'Prancheta de Estudos', category: 'estudos' },
  { emoji: '🏷️', name: 'Etiqueta / Tag', category: 'estudos' },
  { emoji: '📑', name: 'Marcador de Página', category: 'estudos' },

  // Exatas & Matemática
  { emoji: '📐', name: 'Régua Triangular / Geometria', category: 'exatas' },
  { emoji: '📏', name: 'Régua / Medição', category: 'exatas' },
  { emoji: '🔢', name: 'Números / Álgebra', category: 'exatas' },
  { emoji: '➕', name: 'Adição / Positivo', category: 'exatas' },
  { emoji: '➖', name: 'Subtração / Negativo', category: 'exatas' },
  { emoji: '✖️', name: 'Multiplicação / Produto', category: 'exatas' },
  { emoji: '➗', name: 'Divisão / Razão', category: 'exatas' },
  { emoji: '♾️', name: 'Infinito / Limite', category: 'exatas' },
  { emoji: '📊', name: 'Gráfico de Barras', category: 'exatas' },
  { emoji: '📈', name: 'Gráfico Crescente / Derivada', category: 'exatas' },
  { emoji: '📉', name: 'Gráfico Decrescente', category: 'exatas' },
  { emoji: '💻', name: 'Computação / Algoritmo', category: 'exatas' },
  { emoji: '🧮', name: 'Ábaco / Cálculo', category: 'exatas' },

  // Ciências da Natureza
  { emoji: '🔬', name: 'Microscópio / Citologia', category: 'ciencias' },
  { emoji: '🧪', name: 'Tubo de Ensaio / Química', category: 'ciencias' },
  { emoji: '⚗️', name: 'Alambique / Reação', category: 'ciencias' },
  { emoji: '🧬', name: 'DNA / Genética', category: 'ciencias' },
  { emoji: '⚛️', name: 'Átomo / Física Quântica', category: 'ciencias' },
  { emoji: '⚡', name: 'Eletricidade / Energia', category: 'ciencias' },
  { emoji: '🧲', name: 'Ímã / Eletromagnetismo', category: 'ciencias' },
  { emoji: '🌿', name: 'Botânica / Fotossíntese', category: 'ciencias' },
  { emoji: '🪐', name: 'Gravitação / Astronomia', category: 'ciencias' },
  { emoji: '🌡️', name: 'Termodinâmica / Temperatura', category: 'ciencias' },
  { emoji: '💧', name: 'Água / Osmose / Soluções', category: 'ciencias' },
  { emoji: '🦠', name: 'Microbiologia / Vírus', category: 'ciencias' },

  // Humanas, Linguagens & Sociedade
  { emoji: '🏛️', name: 'História / Antiguidade Clássica', category: 'humanas' },
  { emoji: '📜', name: 'Pergaminho / Documento Histórico', category: 'humanas' },
  { emoji: '🌍', name: 'Geopolítica / Geografia Global', category: 'humanas' },
  { emoji: '🗺️', name: 'Cartografia / Mapa', category: 'humanas' },
  { emoji: '⚖️', name: 'Justiça / Filosofia Ética', category: 'humanas' },
  { emoji: '🗣️', name: 'Oratória / Argumentação', category: 'humanas' },
  { emoji: '🎭', name: 'Literatura / Teatro', category: 'humanas' },
  { emoji: '🎨', name: 'Arte / Movimentos Culturais', category: 'humanas' },
  { emoji: '🏰', name: 'Feudalismo / Idade Média', category: 'humanas' },
  { emoji: '🗽', name: 'Liberdade / Iluminismo', category: 'humanas' },
  { emoji: '📰', name: 'Atualidades / Mídia', category: 'humanas' },
  { emoji: '🖋️', name: 'Redação Nota 1000', category: 'humanas' },

  // Metas, Pomodoro & Produtividade
  { emoji: '🎯', name: 'Alvo / Meta do Dia', category: 'metas' },
  { emoji: '⏱️', name: 'Cronômetro / Pomodoro', category: 'metas' },
  { emoji: '🔥', name: 'Streak / Foco Total', category: 'metas' },
  { emoji: '⭐', name: 'Conceito Essencial / Ouro', category: 'metas' },
  { emoji: '🏆', name: 'Revisão Concluída', category: 'metas' },
  { emoji: '✅', name: 'Tópico Dominado', category: 'metas' },
  { emoji: '🚀', name: 'Alta Performance', category: 'metas' },
  { emoji: '⏳', name: 'Tempo / Prazo', category: 'metas' },
  { emoji: '💪', name: 'Consistência', category: 'metas' },
  { emoji: '🌟', name: 'Destaque Mágico', category: 'metas' },

  // Símbolos & Destaques Visuais
  { emoji: '⚠️', name: 'Cuidado / Atenção', category: 'simbolos' },
  { emoji: '❗', name: 'Ponto Crucial', category: 'simbolos' },
  { emoji: '❓', name: 'Dúvida / Aprofundar', category: 'simbolos' },
  { emoji: '➡️', name: 'Implicação / Próximo Passo', category: 'simbolos' },
  { emoji: '🔑', name: 'Palavra-Chave / Axioma', category: 'simbolos' },
  { emoji: '💎', name: 'Informação Rara / Bizu', category: 'simbolos' },
  { emoji: '🛡️', name: 'Proteção / Regra', category: 'simbolos' },
  { emoji: '🔔', name: 'Lembrete Importante', category: 'simbolos' },
  { emoji: '📍', name: 'Localização / Foco', category: 'simbolos' },
  { emoji: '✨', name: 'Brilho / Revisão Rápida', category: 'simbolos' }
];

interface EmojiQuickPickerProps {
  onSelectEmoji: (emoji: string) => void;
  onClose?: () => void;
  className?: string;
  compact?: boolean;
}

export const EmojiQuickPicker: React.FC<EmojiQuickPickerProps> = ({
  onSelectEmoji,
  onClose,
  className = '',
  compact = false
}) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [recentEmojis, setRecentEmojis] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('study_recent_emojis');
      return saved ? JSON.parse(saved) : ['📚', '💡', '🧠', '🔬', '📐', '🎯', '✨', '🔥'];
    } catch {
      return ['📚', '💡', '🧠', '🔬', '📐', '🎯', '✨', '🔥'];
    }
  });
  const [justCopied, setJustCopied] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'Todos', icon: Sparkles },
    { id: 'estudos', label: 'Estudos', icon: BookOpen },
    { id: 'exatas', label: 'Exatas', icon: Calculator },
    { id: 'ciencias', label: 'Ciências', icon: FlaskConical },
    { id: 'humanas', label: 'Humanas', icon: Globe },
    { id: 'metas', label: 'Metas', icon: Flame },
    { id: 'simbolos', label: 'Símbolos', icon: Star }
  ];

  const filteredEmojis = useMemo(() => {
    return THEMATIC_EMOJIS.filter(item => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchesSearch =
        !search.trim() ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.emoji.includes(search);
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  const handlePick = (emoji: string) => {
    // Atualiza recentes
    setRecentEmojis(prev => {
      const updated = [emoji, ...prev.filter(e => e !== emoji)].slice(0, 10);
      try {
        localStorage.setItem('study_recent_emojis', JSON.stringify(updated));
      } catch {
        // ignora erro de storage
      }
      return updated;
    });

    setJustCopied(emoji);
    setTimeout(() => setJustCopied(null), 1000);

    onSelectEmoji(emoji);
  };

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col ${className}`}
    >
      {/* Header com Busca & Fechar */}
      <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-800/40">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar emoji temático..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Categorias */}
      {!compact && (
        <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1 overflow-x-auto no-scrollbar bg-white dark:bg-slate-900">
          {categories.map(cat => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Recentes */}
      {recentEmojis.length > 0 && !search && (
        <div className="px-3 pt-2 pb-1 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/30 dark:bg-slate-800/20">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Recentes</span>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            {recentEmojis.map((emoji, idx) => (
              <button
                key={`${emoji}-${idx}`}
                onClick={() => handlePick(emoji)}
                className="w-8 h-8 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 flex items-center justify-center text-lg transition-transform active:scale-90 hover:scale-110"
                title={`Inserir ${emoji}`}
              >
                <AnimatedEmoji emoji={emoji} size="md" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grade de Emojis */}
      <div className="p-3 max-h-56 overflow-y-auto grid grid-cols-6 sm:grid-cols-7 gap-1.5">
        {filteredEmojis.map((item, idx) => (
          <button
            key={`${item.emoji}-${idx}`}
            onClick={() => handlePick(item.emoji)}
            className="group relative p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800/80 flex flex-col items-center justify-center transition-all hover:scale-110 active:scale-95"
            title={item.name}
          >
            <AnimatedEmoji emoji={item.emoji} size="lg" />
            <span className="text-[9px] text-slate-400 truncate max-w-full opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-1 pointer-events-none hidden">
              {item.name}
            </span>
          </button>
        ))}

        {filteredEmojis.length === 0 && (
          <div className="col-span-full py-6 text-center text-xs text-slate-400">
            Nenhum emoji encontrado para &quot;{search}&quot;.
          </div>
        )}
      </div>

      {/* Footer Dica */}
      <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-[10px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1 font-medium">
          <Sparkles className="w-3 h-3 text-amber-500" />
          Clique para inserir no caderno
        </span>
        {justCopied && (
          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 animate-pulse">
            <Check className="w-3 h-3" /> Inserido!
          </span>
        )}
      </div>
    </div>
  );
};
