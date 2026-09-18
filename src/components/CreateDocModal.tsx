import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  FileText,
  Globe,
  Lock,
  Plus,
  Tag,
  Sparkles,
  Check,
  Calendar,
  User,
  Smile,
  Search,
  CheckCircle2,
  Folder,
  Palette
} from 'lucide-react';
import { Discipline, NotebookDoc, DocSection } from '../data/disciplinesData';

interface CreateDocModalProps {
  isOpen: boolean;
  onClose: () => void;
  discipline: Discipline;
  onCreateDoc: (newDoc: NotebookDoc) => void;
  editDoc?: NotebookDoc | null;
  onEditDoc?: (updated: NotebookDoc) => void;
}

// Separa o emoji inicial do restante do título (ex: "📝 Aula 01" -> "Aula 01")
const extractTitleEmoji = (title: string): { emoji: string; rest: string } => {
  const m = title.match(/^(\p{Extended_Pictographic}|\p{Emoji_Presentation})\s*$/u);
  if (m) return { emoji: m[1], rest: title.slice(m[0].length).trim() };
  const m2 = title.match(/^(\p{Extended_Pictographic}|\p{Emoji_Presentation})\s+/u);
  if (m2) return { emoji: m2[1], rest: title.slice(m2[0].length).trim() };
  return { emoji: '📝', rest: title.trim() };
};

export interface EmojiCategory {
  id: string;
  name: string;
  icon: string;
  emojis: string[];
}

// eslint-disable-next-line react-refresh/only-export-components
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
    emojis: ['🔬', '🧪', '🧬', '🦠', '🧫', '⚛️', '🪐', '🌍', '🌋', '🌿', '🌱', '🌳', '🐾', '🌡️', '🔭', '☀️', '⚡', '🌊', '🌪️', '🍄', '🌸', '❤️']
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
    emojis: ['💡', '💭', '💬', '👁️', '🩺', '💊', '🔮', '🛡️', '⚔️', '✨', '🧩', '🏷️', '⏳', '🌈', '🎲', '🌙', '⚡', '💠', '🎯', '🔆', '♾️', '💠']
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

export const GROUP_COLOR_PALETTE = [
  '#2D5A46',
  '#D97706',
  '#DC2626',
  '#7C3AED',
  '#2563EB',
  '#0891B2',
  '#DB2777',
  '#4D7C0F',
  '#9333EA',
  '#0F766E',
  '#B45309',
  '#1D4ED8'
];

export const CreateDocModal: React.FC<CreateDocModalProps> = ({
  isOpen,
  onClose,
  discipline,
  onCreateDoc,
  editDoc = null,
  onEditDoc
}) => {
  const isEdit = !!editDoc;
  const [title, setTitle] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('📝');
  const [summary, setSummary] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([discipline.name]);
  const [isPublic, setIsPublic] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeCategoryTab, setActiveCategoryTab] = useState('all');
  const [emojiSearch, setEmojiSearch] = useState('');
  const [group, setGroup] = useState('');
  const [groupColor, setGroupColor] = useState('');

  // Cor já definida para cada grupo desta disciplina (a primeira encontrada)
  const groupColors = useMemo(() => {
    const map = new Map<string, string>();
    for (const doc of discipline?.documents ?? []) {
      const g = (doc.group || '').trim();
      if (g && doc.groupColor && !map.has(g)) map.set(g, doc.groupColor);
    }
    return map;
  }, [discipline]);

  // Grupos já usados nesta disciplina (para criar/atribuir com 1 clique)
  const existingGroups = useMemo(
    () =>
      Array.from(
        new Set(
          (discipline?.documents ?? [])
            .map(d => (d.group || '').trim())
            .filter(Boolean)
        )
      ),
    [discipline]
  );

  // Sincroniza os campos com o documento a editar (ou limpa ao criar)
  useEffect(() => {
    if (!isOpen) return;
    if (editDoc) {
      const { emoji, rest } = extractTitleEmoji(editDoc.title);
      setSelectedEmoji(emoji);
      setTitle(rest);
      setSummary(editDoc.summary || '');
      setSelectedTags(editDoc.tags?.length ? [...editDoc.tags] : [discipline.name]);
      setIsPublic(editDoc.isPublic !== false);
      setGroup(editDoc.group || '');
      setGroupColor(editDoc.groupColor || (editDoc.group ? discipline.color : ''));
    } else {
      setSelectedEmoji('📝');
      setTitle('');
      setSummary('');
      setSelectedTags([discipline.name]);
      setIsPublic(true);
      setGroup('');
      setGroupColor('');
    }
    setTagsInput('');
    setShowEmojiPicker(false);
    setActiveCategoryTab('all');
    setEmojiSearch('');
  }, [isOpen, editDoc, discipline.name, discipline.color]);

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

    const titleText = title.trim() || 'Documento sem Título';
    const finalTitle = `${selectedEmoji} ${titleText}`.trim();
    const finalSummary = summary.trim() || 'Documento em branco para anotações livres e síntese de estudos.';

    if (editDoc && onEditDoc) {
      const updatedDoc: NotebookDoc = {
        ...editDoc,
        title: finalTitle,
        tags: combinedTags,
        summary: finalSummary,
        isPublic,
        group: group.trim() || undefined,
        groupColor: group.trim() ? (groupColor || undefined) : undefined,
        lastEdited: 'Agora mesmo',
        lastEditedTs: Date.now()
      };
      onEditDoc(updatedDoc);
      onClose();
      return;
    }

    // Padrão em branco solicitado: página limpa para escrita
    const sections: DocSection[] = [
      {
        id: `s-${Date.now()}-1`,
        heading: '',
        content: '',
        type: 'paragraph'
      }
    ];

    const now = Date.now();

    const newDoc: NotebookDoc = {
      id: `doc-${now}`,
      title: finalTitle,
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
      glossary: {},
      group: group.trim() || undefined,
      groupColor: group.trim() ? (groupColor || undefined) : undefined,
      createdAtTs: now,
      lastEditedTs: now
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
          className="fixed inset-0 bg-[#1C1917]/75 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative w-full max-w-4xl bg-white dark:bg-[#18181B] rounded-[32px] border border-[#E7E2D9]/90 dark:border-[#2C2C30] shadow-2xl overflow-hidden z-10 my-4 flex flex-col max-h-[92vh]"
        >
          {/* Top Line Decorativa com a Cor da Disciplina */}
          <div 
            className="h-2 w-full shrink-0" 
            style={{ 
              background: `linear-gradient(90deg, ${discipline.color}, #2D5A46, #1E3E30)` 
            }} 
          />

          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[#E7E2D9] dark:border-[#2C2C30] bg-[#EFECE6]/60 dark:bg-[#232326]/40 shrink-0">
            <div className="flex items-center gap-3.5">
              <div 
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md font-bold shrink-0 text-xl"
                style={{ backgroundColor: discipline.color }}
              >
                {selectedEmoji}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-lg text-[#1C1917] dark:text-[#FAF9F5] font-display">
                    {isEdit ? 'Editar Documento' : 'Criar Novo Documento'}
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
                <p className="text-xs text-[#78716C] dark:text-[#A8A29E] mt-0.5">
                  {isEdit
                    ? 'Atualize título, descrição, tags e privacidade deste caderno'
                    : 'Página em branco personalizada para anotações, fórmulas e resumos'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-[#A8A29E] hover:text-[#44403C] dark:hover:text-[#E7E5E4] rounded-xl hover:bg-[#EFECE6] dark:hover:bg-[#232326] transition-colors cursor-pointer"
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
                  <label className="block text-xs font-extrabold text-[#44403C] dark:text-[#E7E5E4] uppercase tracking-wider">
                    Título do Documento <span className="text-red-500">*</span>
                  </label>

                  <div className="flex items-center gap-2 relative">
                    {/* Botão Seletor de Emoji com Dropdown Enriquecido */}
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="w-12 h-12 rounded-2xl bg-[#EFECE6] dark:bg-[#232326] hover:bg-[#E5DFD5] dark:hover:bg-[#333338] border border-[#E7E2D9]/80 dark:border-[#3B3B40] flex items-center justify-center text-2xl transition-all cursor-pointer shrink-0 shadow-2xs hover:scale-105"
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
                          className="absolute top-14 left-0 z-50 p-4 bg-white dark:bg-[#18181B] rounded-3xl border border-[#E7E2D9] dark:border-[#3B3B40] shadow-2xl w-80 sm:w-96 space-y-3"
                        >
                          <div className="flex items-center justify-between text-xs font-bold text-[#44403C] dark:text-[#E7E5E4] px-1 border-b border-[#E7E2D9] dark:border-[#2C2C30] pb-2">
                            <span className="flex items-center gap-1.5">
                              <Smile className="w-4 h-4 text-[#2D5A46]" />
                              Escolha o Ícone do Documento
                            </span>
                            <button
                              type="button"
                              onClick={() => setShowEmojiPicker(false)}
                              className="text-[#A8A29E] hover:text-[#57534E] dark:hover:text-[#E7E5E4] p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Campo de Busca Rápida de Emojis */}
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#A8A29E]" />
                            <input
                              type="text"
                              value={emojiSearch}
                              onChange={(e) => setEmojiSearch(e.target.value)}
                              placeholder="Pesquisar ou colar emoji..."
                              className="w-full pl-8 pr-3 py-1.5 bg-[#EFECE6] dark:bg-[#232326] rounded-xl text-xs text-[#1C1917] dark:text-[#FAF9F5] placeholder-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#2D5A46]"
                            />
                          </div>

                          {/* Tabs de Categorias de Emojis */}
                          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] scrollbar-none">
                            <button
                              type="button"
                              onClick={() => setActiveCategoryTab('all')}
                              className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer ${
                                activeCategoryTab === 'all'
                                  ? 'bg-[#2D5A46] text-white'
                                  : 'bg-[#EFECE6] dark:bg-[#232326] text-[#57534E] dark:text-[#A8A29E] hover:bg-[#E5DFD5]'
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
                                    ? 'bg-[#2D5A46] text-white'
                                    : 'bg-[#EFECE6] dark:bg-[#232326] text-[#57534E] dark:text-[#A8A29E] hover:bg-[#E5DFD5]'
                                }`}
                              >
                                <span>{cat.icon}</span>
                                <span>{cat.name.split(' ')[0]}</span>
                              </button>
                            ))}
                          </div>

                          {/* Grid de Emojis */}
                          <div className="grid grid-cols-7 gap-1.5 max-h-48 overflow-y-auto p-1 bg-[#EFECE6] dark:bg-[#232326]/50 rounded-2xl border border-[#E7E2D9] dark:border-[#2C2C30]">
                            {filteredEmojis.map((emoji, eIdx) => (
                              <button
                                key={`${emoji}-${eIdx}`}
                                type="button"
                                onClick={() => {
                                  setSelectedEmoji(emoji);
                                  setShowEmojiPicker(false);
                                }}
                                className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center hover:bg-[#EBF3EF] dark:hover:bg-[#15221B]/60 transition-transform hover:scale-125 cursor-pointer ${
                                  selectedEmoji === emoji ? 'bg-[#EBF3EF] dark:bg-[#15221B] ring-2 ring-[#2D5A46] scale-110' : ''
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
                      className="w-full bg-white dark:bg-[#18181B] border border-[#E7E2D9] dark:border-[#2C2C30] rounded-2xl px-4 py-3 text-sm text-[#1C1917] dark:text-[#FAF9F5] placeholder-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#2D5A46]/30 focus:border-[#2D5A46] font-semibold shadow-2xs"
                    />
                  </div>

                  {/* Barra Rápida de Emojis Populares */}
                  <div className="flex items-center gap-1.5 pt-1.5 overflow-x-auto pb-1">
                    <span className="text-[11px] text-[#A8A29E] mr-1 flex items-center gap-1 shrink-0">
                      <Smile className="w-3.5 h-3.5 text-[#2D5A46]" /> Ícones Rápidos:
                    </span>
                    {ALL_EMOJIS.slice(0, 10).map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setSelectedEmoji(em)}
                        className={`text-sm px-2 py-1 rounded-xl transition-all cursor-pointer ${
                          selectedEmoji === em 
                            ? 'bg-[#EBF3EF] dark:bg-[#15221B] font-bold shadow-xs scale-110 ring-2 ring-[#2D5A46]' 
                            : 'bg-[#EFECE6] dark:bg-[#232326] text-[#57534E] dark:text-[#D6D3CD] hover:bg-[#E5DFD5] dark:hover:bg-[#333338] hover:scale-105'
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Descrição / Resumo do Foco de Estudo (Opcional) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-[#44403C] dark:text-[#E7E5E4] uppercase tracking-wider">
                    Descrição ou Foco do Estudo <span className="text-[10px] text-[#A8A29E] font-normal lowercase">(opcional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder={`Ex: Resumo dos conceitos centrais de ${discipline.name}, fórmulas e resoluções passo a passo...`}
                    className="w-full bg-white dark:bg-[#18181B] border border-[#E7E2D9] dark:border-[#2C2C30] rounded-2xl p-3.5 text-xs text-[#1C1917] dark:text-[#FAF9F5] placeholder-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#2D5A46]/30 focus:border-[#2D5A46] resize-none shadow-2xs"
                  />
                </div>

                {/* 3. Tags & Palavras-chave */}
                <div className="space-y-2">
                  <label className="block text-xs font-extrabold text-[#44403C] dark:text-[#E7E5E4] uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#A8A29E]" />
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
                              ? 'bg-[#EBF3EF] dark:bg-[#15221B]/60 border-[#CFE1D6] dark:border-[#22392D] text-[#224A38] dark:text-[#52B788] shadow-2xs'
                              : 'bg-white dark:bg-[#232326] border-[#E7E2D9] dark:border-[#3B3B40] text-[#57534E] dark:text-[#A8A29E] hover:bg-[#EFECE6] dark:hover:bg-[#333338]'
                          }`}
                        >
                          {isSelected ? <Check className="w-3 h-3 text-[#2D5A46]" /> : <Plus className="w-3 h-3 text-[#A8A29E]" />}
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
                    className="w-full bg-white dark:bg-[#18181B] border border-[#E7E2D9] dark:border-[#2C2C30] rounded-2xl px-3.5 py-2 text-xs text-[#1C1917] dark:text-[#FAF9F5] placeholder-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#2D5A46]/30 focus:border-[#2D5A46] shadow-2xs"
                  />
                </div>

                {/* 4. Grupo do Documento */}
                <div className="space-y-2">
                  <label className="block text-xs font-extrabold text-[#44403C] dark:text-[#E7E5E4] uppercase tracking-wider flex items-center gap-1.5">
                    <Folder className="w-3.5 h-3.5 text-[#A8A29E]" />
                    Grupo <span className="text-[10px] text-[#A8A29E] font-normal lowercase">(opcional)</span>
                  </label>

                  {existingGroups.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {existingGroups.map((g) => {
                        const isSelected = group.trim() === g;
                        return (
                          <button
                            key={g}
                            type="button"
                            onClick={() => {
                              setGroup(isSelected ? '' : g);
                              setGroupColor(isSelected ? '' : (groupColors.get(g) || discipline.color));
                            }}
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border transition-all cursor-pointer flex items-center gap-1 ${
                              isSelected
                                ? 'bg-[#EBF3EF] dark:bg-[#15221B]/60 border-[#CFE1D6] dark:border-[#22392D] text-[#224A38] dark:text-[#52B788] shadow-2xs'
                                : 'bg-white dark:bg-[#232326] border-[#E7E2D9] dark:border-[#3B3B40] text-[#57534E] dark:text-[#A8A29E] hover:bg-[#EFECE6] dark:hover:bg-[#333338]'
                            }`}
                          >
                            {isSelected ? <Check className="w-3 h-3 text-[#2D5A46]" /> : <Folder className="w-3 h-3 text-[#A8A29E]" />}
                            <span>{g}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <input
                    type="text"
                    value={group}
                    onChange={(e) => setGroup(e.target.value)}
                    placeholder="Agrupe por conteúdo (ex: Aula 01, Revisão, Lista de Exercícios...)"
                    className="w-full bg-white dark:bg-[#18181B] border border-[#E7E2D9] dark:border-[#2C2C30] rounded-2xl px-3.5 py-2 text-xs text-[#1C1917] dark:text-[#FAF9F5] placeholder-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#2D5A46]/30 focus:border-[#2D5A46] shadow-2xs"
                  />

                  {/* Cor do Grupo (definida pelo usuário) */}
                  {group.trim() && (
                    <div className="flex items-center gap-3 pt-0.5">
                      <span className="text-[11px] font-bold text-[#57534E] dark:text-[#A8A29E] flex items-center gap-1 shrink-0">
                        <Palette className="w-3.5 h-3.5" />
                        Cor do grupo:
                      </span>
                      <div className="flex items-center gap-1.5">
                        {GROUP_COLOR_PALETTE.map((color) => (
                          <button
                            key={color}
                            type="button"
                            title={color}
                            onClick={() => setGroupColor(color)}
                            className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center ${
                              groupColor === color
                                ? 'border-[#1C1917] dark:border-white scale-110 shadow-sm'
                                : 'border-transparent hover:scale-110'
                            }`}
                            style={{ backgroundColor: color }}
                          >
                            {groupColor === color && <Check className="w-3 h-3 text-white" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. Visibilidade / Privacidade */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-[#44403C] dark:text-[#E7E5E4] uppercase tracking-wider">
                    Privacidade do Caderno
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Opção Pública */}
                    <button
                      type="button"
                      onClick={() => setIsPublic(true)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                        isPublic
                          ? 'bg-[#EBF3EF]/80 dark:bg-[#15221B]/50 border-[#2D5A46] dark:border-[#2D5A46] shadow-sm ring-1 ring-[#2D5A46]/20'
                          : 'bg-white dark:bg-[#232326] border-[#E7E2D9] dark:border-[#3B3B40] hover:bg-[#EFECE6] dark:hover:bg-[#333338]'
                      }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 ${isPublic ? 'bg-[#2D5A46] text-white' : 'bg-[#EFECE6] dark:bg-[#3B3B40] text-[#78716C]'}`}>
                        <Globe className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#1C1917] dark:text-[#FAF9F5] flex items-center gap-1">
                          Público
                          {isPublic && <Check className="w-3 h-3 text-[#2D5A46] dark:text-[#52B788]" />}
                        </div>
                        <p className="text-[10px] text-[#78716C] dark:text-[#A8A29E] leading-tight mt-0.5">
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
                          : 'bg-white dark:bg-[#232326] border-[#E7E2D9] dark:border-[#3B3B40] hover:bg-[#EFECE6] dark:hover:bg-[#333338]'
                      }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 ${!isPublic ? 'bg-amber-600 text-white' : 'bg-[#EFECE6] dark:bg-[#3B3B40] text-[#78716C]'}`}>
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#1C1917] dark:text-[#FAF9F5] flex items-center gap-1">
                          Privado
                          {!isPublic && <Check className="w-3 h-3 text-amber-600 dark:text-amber-400" />}
                        </div>
                        <p className="text-[10px] text-[#78716C] dark:text-[#A8A29E] leading-tight mt-0.5">
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
                  <span className="text-xs font-extrabold text-[#44403C] dark:text-[#E7E5E4] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#2D5A46]" />
                    Prévia do Documento
                  </span>
                  <span className="text-[10px] text-[#A8A29E] font-medium">
                    Layout Padrão em Branco
                  </span>
                </div>

                {/* Card de Demonstração em Tempo Real */}
                <div className="bg-gradient-to-b from-[#EFECE6] to-white dark:from-[#232326] dark:to-[#18181B] rounded-[24px] p-5 border border-[#E7E2D9]/90 dark:border-[#3B3B40]/80 shadow-md space-y-4 relative overflow-hidden">
                  
                  {/* Faixa decorativa superior */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-1.5"
                    style={{ backgroundColor: discipline.color }}
                  />

                  {/* Header do Card */}
                  <div className="flex items-start justify-between gap-3 pt-1">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#232326] border border-[#E7E2D9]/80 dark:border-[#3B3B40] shadow-sm flex items-center justify-center text-2xl shrink-0">
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
                          ? 'bg-[#EBF3EF] dark:bg-[#15221B] text-[#224A38] dark:text-[#52B788]' 
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                      }`}>
                        {isPublic ? <Globe className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                        {isPublic ? 'Público' : 'Privado'}
                      </span>
                    </div>
                  </div>

                  {/* Título & Resumo */}
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-sm sm:text-base text-[#1C1917] dark:text-[#FAF9F5] font-display line-clamp-2">
                      {title.trim() ? `${selectedEmoji} ${title}` : `${selectedEmoji} Título do Documento`}
                    </h4>
                    <p className="text-xs text-[#78716C] dark:text-[#A8A29E] line-clamp-2 leading-relaxed">
                      {summary.trim() 
                        ? summary 
                        : 'Documento limpo e pronto para receber suas anotações, fórmulas e resumos com suporte a barra Word e atalhos.'}
                    </p>
                  </div>

                  {/* Mini-Simulação do Documento em Branco com Destaque de Conceito */}
                  <div className="p-3 bg-white dark:bg-[#232326] rounded-xl border border-[#E7E2D9]/80 dark:border-[#3B3B40]/80 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold text-[#A8A29E] border-b border-[#E7E2D9] dark:border-[#3B3B40]/60 pb-1.5">
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3 h-3 text-[#A8A29E]" />
                        Página em Branco
                      </span>
                      <span className="text-[#2D5A46] dark:text-[#52B788] font-semibold flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" /> Conceitos Ativos
                      </span>
                    </div>
                    <div className="space-y-2 py-1 text-xs text-[#57534E] dark:text-[#D6D3CD]">
                      <p className="leading-relaxed">
                        Ao escrever termos como <span className="bg-[#EBF3EF] dark:bg-[#15221B] text-[#224A38] dark:text-[#52B788] border-b border-[#2D5A46] px-1 py-0.5 rounded font-medium">Logaritmo</span> ou <span className="bg-[#EBF3EF] dark:bg-[#15221B] text-[#224A38] dark:text-[#52B788] border-b border-[#2D5A46] px-1 py-0.5 rounded font-medium">Entropia</span>, eles são destacados com o significado instantâneo.
                      </p>
                    </div>
                  </div>

                  {/* Tags no Card */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {combinedTags.slice(0, 4).map((tg) => (
                      <span
                        key={tg}
                        className="text-[10px] font-medium bg-[#EFECE6] dark:bg-[#232326] text-[#57534E] dark:text-[#A8A29E] px-2 py-0.5 rounded-lg border border-[#E7E2D9]/60 dark:border-[#3B3B40]/60"
                      >
                        #{tg}
                      </span>
                    ))}
                    {combinedTags.length > 4 && (
                      <span className="text-[10px] text-[#A8A29E] font-medium px-1">
                        +{combinedTags.length - 4}
                      </span>
                    )}
                  </div>

                  {/* Meta do Documento */}
                  <div className="pt-2 border-t border-[#E7E2D9] dark:border-[#2C2C30] flex items-center justify-between text-[10px] text-[#A8A29E]">
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
            <div className="pt-4 border-t border-[#E7E2D9] dark:border-[#2C2C30] flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-[#A8A29E] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 inline-block" />
                <span>{isEdit ? 'Alterações salvas após confirmar' : 'Pronto para edição imediata no Caderno'}</span>
              </div>

              <div className="flex items-center gap-3 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-2xl text-xs font-bold text-[#57534E] dark:text-[#D6D3CD] hover:bg-[#EFECE6] dark:hover:bg-[#232326] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#2D5A46] hover:bg-[#21483A] text-white text-xs font-bold shadow-md shadow-[#2D5A46]/25 transition-all cursor-pointer"
                >
                  {isEdit ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{isEdit ? 'Salvar Alterações' : 'Criar e Começar a Escrever'}</span>
                </motion.button>
              </div>
            </div>

          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
