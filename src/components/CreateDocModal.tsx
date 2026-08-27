import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  FileText,
  Globe,
  Lock,
  Plus,
  Tag,
  BookOpen,
  Sparkles,
  Check,
  Calendar,
  User,
  Smile,
  Search,
  CheckCircle2
} from 'lucide-react';
import { Discipline, NotebookDoc, DocSection } from '../data/disciplinesData';

interface CreateDocModalProps {
  isOpen: boolean;
  onClose: () => void;
  discipline: Discipline;
  onCreateDoc: (newDoc: NotebookDoc) => void;
}

export interface EmojiCategory {
  id: string;
  name: string;
  icon: string;
  emojis: string[];
}

export const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: 'estudos',
    name: 'Estudos & Livros',
    icon: '📚',
    emojis: ['📝', '📘', '📕', '📗', '📙', '📓', '📒', '📚', '📖', '✍️', '🖋️', '🎓', '📑', '🔖', '🏷️', '📄', '📜', '🎒', '🗂️', '📋', '🖊️', '🗒️']
  },
  {
    id: 'ciencias',
    name: 'Ciências & Natureza',
    icon: '🔬',
    emojis: ['🔬', '🧪', '🧬', '🦠', '🧫', '⚛️', '🪐', '🌍', '🌋', '🌿', '🌱', '🌳', '🐾', '🌡️', '🔭', '☀️', '⚡', '🌊', '🌪️', '🍄', '🌸', '🫀']
  },
  {
    id: 'exatas',
    name: 'Exatas & Tecnologia',
    icon: '📐',
    emojis: ['📐', '📏', '🧮', '📊', '📈', '📉', '💻', '🖥️', '🤖', '⚙️', '🔍', '💡', '🔋', '📡', '💾', '🔢', '⌨️', '🛰️', '🕹️', '📱', '🔧', '🧲']
  },
  {
    id: 'humanas',
    name: 'Humanas & Sociedade',
    icon: '🏛️',
    emojis: ['🏛️', '🗺️', '🗿', '⚖️', '🎨', '🎭', '🎬', '🎻', '🎷', '🖌️', '🏰', '📜', '🧭', '🕊️', '🌎', '👑', '🎪', '✒️', '🕯️', '🗣️', '📖', '🗽']
  },
  {
    id: 'metas',
    name: 'Metas & Performance',
    icon: '🎯',
    emojis: ['🎯', '🏆', '🥇', '🥈', '🥉', '⭐', '🌟', '✨', '🔥', '🚀', '💯', '🔑', '💎', '🧠', '💪', '📌', '🚩', '⏰', '🎖️', '⏱️', '🥇', '🏅']
  },
  {
    id: 'simbolos',
    name: 'Símbolos & Conceitos',
    icon: '💡',
    emojis: ['💡', '💭', '💬', '👁️', '🩺', '💊', '🔮', '🛡️', '⚔️', '🪄', '🧩', '🏷️', '⏳', '🌈', '🎲', '🌙', '⚡', '💠', '🎯', '🔆', '♾️', '💠']
  }
];

const ALL_EMOJIS = Array.from(new Set(EMOJI_CATEGORIES.flatMap(c => c.emojis)));

const DEFAULT_TAG_SUGGESTIONS = [
  'Teoria',
  'Resumo',
  'Exercícios',
  'Revisão',
  'ENEM 2026',
  'Fórmulas',
  'Conceitos'
];

export const CreateDocModal: React.FC<CreateDocModalProps> = ({
  isOpen,
  onClose,
  discipline,
  onCreateDoc
}) => {
  const [title, setTitle] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('📝');
  const [summary, setSummary] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([discipline.name]);
  const [isPublic, setIsPublic] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeCategoryTab, setActiveCategoryTab] = useState('all');
  const [emojiSearch, setEmojiSearch] = useState('');

  // Filtragem dos Emojis no Picker
  const filteredEmojis = useMemo(() => {
    let pool = ALL_EMOJIS;
    if (activeCategoryTab !== 'all') {
      const cat = EMOJI_CATEGORIES.find(c => c.id === activeCategoryTab);
      pool = cat ? cat.emojis : ALL_EMOJIS;
    }
    if (emojiSearch.trim()) {
      return pool.filter(e => e.includes(emojiSearch.trim()));
    }
    return pool;
  }, [activeCategoryTab, emojiSearch]);

  // Tags processadas
  const combinedTags = useMemo(() => {
    const fromInput = tagsInput
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const merged = Array.from(new Set([...selectedTags, ...fromInput]));
    return merged.length > 0 ? merged : [discipline.name, 'Anotação'];
  }, [tagsInput, selectedTags, discipline.name]);

  if (!isOpen) return null;

  const handleToggleTagSuggestion = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalTitle = title.trim() || 'Documento sem Título';
    const finalSummary = summary.trim() || 'Documento em branco para anotações livres e síntese de estudos.';

    // Padrão em branco solicitado: página limpa para escrita
    const sections: DocSection[] = [
      {
        id: `s-${Date.now()}-1`,
        heading: '',
        content: '',
        type: 'paragraph'
      }
    ];

    const newDoc: NotebookDoc = {
      id: `doc-${Date.now()}`,
      title: `${selectedEmoji} ${finalTitle}`,
      disciplineId: discipline.id,
      lastEdited: 'Agora mesmo',
      createdAt: 'Hoje',
      author: 'Você',
      tags: combinedTags,
      summary: finalSummary,
      sections,
      wordCount: 0,
      readTime: '1 min',
      starred: false,
      isPublic,
      glossary: {}
    };

    onCreateDoc(newDoc);
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
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden z-10 my-4 flex flex-col max-h-[92vh]"
        >
          {/* Top Line Decorativa com a Cor da Disciplina */}
          <div 
            className="h-2 w-full shrink-0" 
            style={{ 
              background: `linear-gradient(90deg, ${discipline.color}, #3B82F6, #8B5CF6)` 
            }} 
          />

          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 shrink-0">
            <div className="flex items-center gap-3.5">
              <div 
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md font-bold shrink-0 text-xl"
                style={{ backgroundColor: discipline.color }}
              >
                {selectedEmoji}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white font-display">
                    Criar Novo Documento
                  </h3>
                  <span 
                    className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                    style={{ 
                      backgroundColor: `${discipline.color}15`,
                      color: discipline.color 
                    }}
                  >
                    {discipline.name}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Página em branco personalizada para anotações, fórmulas e resumos
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content: 2 Colunas (Formulário + Prévia em Tempo Real) */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* COLUNA ESQUERDA: CAMPOS DO FORMULÁRIO (7 colunas) */}
              <div className="lg:col-span-7 space-y-5">
                
                {/* 1. Título do Documento com Seletor Extensivo de Emojis */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                    Título do Documento <span className="text-red-500">*</span>
                  </label>

                  <div className="flex items-center gap-2 relative">
                    {/* Botão Seletor de Emoji com Dropdown Enriquecido */}
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-2xl transition-all cursor-pointer shrink-0 shadow-2xs hover:scale-105"
                      title="Explorar Coleção de Emojis"
                    >
                      {selectedEmoji}
                    </button>

                    {/* Popover Extensivo com Categorias e Busca de Emojis */}
                    <AnimatePresence>
                      {showEmojiPicker && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          className="absolute top-14 left-0 z-50 p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl w-80 sm:w-96 space-y-3"
                        >
                          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200 px-1 border-b border-slate-100 dark:border-slate-800 pb-2">
                            <span className="flex items-center gap-1.5">
                              <Smile className="w-4 h-4 text-blue-500" />
                              Escolha o Ícone do Documento
                            </span>
                            <button
                              type="button"
                              onClick={() => setShowEmojiPicker(false)}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Campo de Busca Rápida de Emojis */}
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                            <input
                              type="text"
                              value={emojiSearch}
                              onChange={(e) => setEmojiSearch(e.target.value)}
                              placeholder="Pesquisar ou colar emoji..."
                              className="w-full pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          {/* Tabs de Categorias de Emojis */}
                          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] scrollbar-none">
                            <button
                              type="button"
                              onClick={() => setActiveCategoryTab('all')}
                              className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer ${
                                activeCategoryTab === 'all'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                              }`}
                            >
                              Todos
                            </button>
                            {EMOJI_CATEGORIES.map((cat) => (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => setActiveCategoryTab(cat.id)}
                                className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1 ${
                                  activeCategoryTab === cat.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                                }`}
                              >
                                <span>{cat.icon}</span>
                                <span>{cat.name.split(' ')[0]}</span>
                              </button>
                            ))}
                          </div>

                          {/* Grid de Emojis */}
                          <div className="grid grid-cols-7 gap-1.5 max-h-48 overflow-y-auto p-1 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                            {filteredEmojis.map((emoji, eIdx) => (
                              <button
                                key={`${emoji}-${eIdx}`}
                                type="button"
                                onClick={() => {
                                  setSelectedEmoji(emoji);
                                  setShowEmojiPicker(false);
                                }}
                                className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-transform hover:scale-125 cursor-pointer ${
                                  selectedEmoji === emoji ? 'bg-blue-200 dark:bg-blue-800 ring-2 ring-blue-500 scale-110' : ''
                                }`}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Campo de Texto do Título */}
                    <input
                      type="text"
                      required
                      autoFocus
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={`Ex: ${discipline.name}: Aula 01 - Fundamentos e Exemplos`}
                      className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold shadow-2xs"
                    />
                  </div>

                  {/* Barra Rápida de Emojis Populares */}
                  <div className="flex items-center gap-1.5 pt-1.5 overflow-x-auto pb-1">
                    <span className="text-[11px] text-slate-400 mr-1 flex items-center gap-1 shrink-0">
                      <Smile className="w-3.5 h-3.5 text-blue-500" /> Ícones Rápidos:
                    </span>
                    {ALL_EMOJIS.slice(0, 10).map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setSelectedEmoji(em)}
                        className={`text-sm px-2 py-1 rounded-xl transition-all cursor-pointer ${
                          selectedEmoji === em 
                            ? 'bg-blue-600 text-white font-bold shadow-xs scale-110 ring-2 ring-blue-400' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-105'
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Descrição / Resumo do Foco de Estudo (Opcional) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                    Descrição ou Foco do Estudo <span className="text-[10px] text-slate-400 font-normal lowercase">(opcional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder={`Ex: Resumo dos conceitos centrais de ${discipline.name}, fórmulas e resoluções passo a passo...`}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none shadow-2xs"
                  />
                </div>

                {/* 3. Tags & Palavras-chave */}
                <div className="space-y-2">
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                    Tags do Documento
                  </label>

                  {/* Chips Sugeridos com 1 Clique */}
                  <div className="flex flex-wrap gap-1.5">
                    {DEFAULT_TAG_SUGGESTIONS.map((tag) => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleToggleTagSuggestion(tag)}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border transition-all cursor-pointer flex items-center gap-1 ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-400 dark:border-blue-700 text-blue-700 dark:text-blue-300 shadow-2xs'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                          }`}
                        >
                          {isSelected ? <Check className="w-3 h-3 text-blue-600" /> : <Plus className="w-3 h-3 text-slate-400" />}
                          <span>{tag}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Input de Tags Personalizadas */}
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="Adicionar outras tags separadas por vírgula (ex: Genética, Eletrostática, Simulado)"
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                  />
                </div>

                {/* 4. Visibilidade / Privacidade */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                    Privacidade do Caderno
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Opção Pública */}
                    <button
                      type="button"
                      onClick={() => setIsPublic(true)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                        isPublic
                          ? 'bg-blue-50/80 dark:bg-blue-950/50 border-blue-500 dark:border-blue-600 shadow-sm ring-1 ring-blue-500/20'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
                      }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 ${isPublic ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                        <Globe className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                          Público
                          {isPublic && <Check className="w-3 h-3 text-blue-600 dark:text-blue-400" />}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                          Disponível para a comunidade do app
                        </p>
                      </div>
                    </button>

                    {/* Opção Privada */}
                    <button
                      type="button"
                      onClick={() => setIsPublic(false)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                        !isPublic
                          ? 'bg-amber-50/80 dark:bg-amber-950/50 border-amber-500 dark:border-amber-600 shadow-sm ring-1 ring-amber-500/20'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
                      }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 ${!isPublic ? 'bg-amber-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                          Privado
                          {!isPublic && <Check className="w-3 h-3 text-amber-600 dark:text-amber-400" />}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                          Apenas no seu caderno pessoal
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

              </div>

              {/* COLUNA DIREITA: PRÉVIA VISUAL DO CARD (5 colunas) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    Prévia do Documento
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Layout Padrão em Branco
                  </span>
                </div>

                {/* Card de Demonstração em Tempo Real */}
                <div className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-850 dark:to-slate-900 rounded-[24px] p-5 border border-slate-200/90 dark:border-slate-700/80 shadow-md space-y-4 relative overflow-hidden">
                  
                  {/* Faixa decorativa superior */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-1.5"
                    style={{ backgroundColor: discipline.color }}
                  />

                  {/* Header do Card */}
                  <div className="flex items-start justify-between gap-3 pt-1">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-center justify-center text-2xl shrink-0">
                      {selectedEmoji}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span 
                        className="text-[10px] font-extrabold px-2 py-0.5 rounded-full"
                        style={{ 
                          backgroundColor: `${discipline.color}20`,
                          color: discipline.color 
                        }}
                      >
                        {discipline.name}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isPublic 
                          ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' 
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                      }`}>
                        {isPublic ? <Globe className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                        {isPublic ? 'Público' : 'Privado'}
                      </span>
                    </div>
                  </div>

                  {/* Título & Resumo */}
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white font-display line-clamp-2">
                      {title.trim() ? `${selectedEmoji} ${title}` : `${selectedEmoji} Título do Documento`}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {summary.trim() 
                        ? summary 
                        : 'Documento limpo e pronto para receber suas anotações, fórmulas e resumos com suporte a barra Word e atalhos.'}
                    </p>
                  </div>

                  {/* Mini-Simulação do Documento em Branco com Destaque de Conceito */}
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 border-b border-slate-100 dark:border-slate-700/60 pb-1.5">
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3 h-3 text-slate-400" />
                        Página em Branco
                      </span>
                      <span className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" /> Conceitos Ativos
                      </span>
                    </div>
                    <div className="space-y-2 py-1 text-xs text-slate-600 dark:text-slate-300">
                      <p className="leading-relaxed">
                        Ao escrever termos como <span className="bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200 border-b border-blue-400 px-1 py-0.5 rounded font-medium">Logaritmo</span> ou <span className="bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200 border-b border-blue-400 px-1 py-0.5 rounded font-medium">Entropia</span>, eles são destacados com o significado instantâneo.
                      </p>
                    </div>
                  </div>

                  {/* Tags no Card */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {combinedTags.slice(0, 4).map((tg) => (
                      <span
                        key={tg}
                        className="text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60"
                      >
                        #{tg}
                      </span>
                    ))}
                    {combinedTags.length > 4 && (
                      <span className="text-[10px] text-slate-400 font-medium px-1">
                        +{combinedTags.length - 4}
                      </span>
                    )}
                  </div>

                  {/* Meta do Documento */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" /> Você
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Hoje
                    </span>
                  </div>

                </div>
              </div>

            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 inline-block" />
                <span>Pronto para edição imediata no Caderno</span>
              </div>

              <div className="flex items-center gap-3 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Criar e Começar a Escrever</span>
                </motion.button>
              </div>
            </div>

          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
