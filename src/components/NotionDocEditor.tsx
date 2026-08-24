import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Square,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Info,
  Quote,
  Code,
  Minus,
  Plus,
  Trash2,
  MoreVertical,
  Type,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Check,
  Table as TableIcon,
  BookOpen,
  CornerDownLeft,
  ChevronDown,
  Image as ImageIcon,
  Link,
  Clock,
  FileText,
  Layers,
  ExternalLink,
  Edit3
} from 'lucide-react';
import { DocSection, GlossaryDefinition } from '../data/disciplinesData';
import { FormattedContentWithGlossary } from './GlossaryTooltip';
import { NotionToolbar, FormattingState, TEXT_COLORS, HIGHLIGHT_COLORS } from './NotionToolbar';

interface NotionDocEditorProps {
  sections: DocSection[];
  glossary?: Record<string, GlossaryDefinition>;
  disciplineColor?: string;
  paperMode?: 'docs' | 'ruled' | 'grid';
  onUpdateSections: (newSections: DocSection[]) => void;
  onOpenAddGlossary?: () => void;
}

// Auto-resizing textarea that never shows internal scrollbars and breaks long words
const AutoResizeTextarea: React.FC<{
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  inputRef?: (el: HTMLTextAreaElement | null) => void;
}> = ({ value, onChange, onKeyDown, onFocus, onBlur, placeholder, className = '', style, inputRef }) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const resize = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(26, textareaRef.current.scrollHeight)}px`;
    }
  }, []);

  useEffect(() => {
    resize();
  }, [value, resize]);

  return (
    <textarea
      ref={el => {
        textareaRef.current = el;
        if (inputRef) inputRef(el);
      }}
      rows={1}
      value={value}
      placeholder={placeholder}
      onChange={e => {
        onChange(e.target.value);
        resize();
      }}
      onKeyDown={onKeyDown}
      onFocus={() => {
        if (onFocus) onFocus();
        resize();
      }}
      onBlur={onBlur}
      style={{
        overflow: 'hidden',
        resize: 'none',
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
        ...style,
      }}
      className={`w-full bg-transparent border-none outline-none transition-all p-0 m-0 ${className}`}
    />
  );
};

export const NotionDocEditor: React.FC<NotionDocEditorProps> = ({
  sections,
  glossary = {},
  disciplineColor = '#3B82F6',
  paperMode = 'docs',
  onUpdateSections,
  onOpenAddGlossary = () => {},
}) => {
  // Focus & Selection States
  const [activeBlockIndex, setActiveBlockIndex] = useState<number>(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeMenuBlockIndex, setActiveMenuBlockIndex] = useState<number | null>(null);
  
  // History Undo/Redo State
  const [history, setHistory] = useState<DocSection[][]>([sections]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Slash menu state
  const [slashMenuIndex, setSlashMenuIndex] = useState<number | null>(null);
  const [slashQuery, setSlashQuery] = useState('');
  const [selectedSlashItem, setSelectedSlashItem] = useState(0);

  // Floating Mini Bubble Toolbar State
  const [showFloatingToolbar, setShowFloatingToolbar] = useState(false);
  const [floatingToolbarPos, setFloatingToolbarPos] = useState({ top: 0, left: 0 });

  // Refs for focusing
  const blockRefs = useRef<(HTMLTextAreaElement | null)[]>([]);

  // Update history on external change
  const pushToHistory = useCallback((newSections: DocSection[]) => {
    const updatedHistory = history.slice(0, historyIndex + 1);
    updatedHistory.push(newSections);
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
    onUpdateSections(newSections);
  }, [history, historyIndex, onUpdateSections]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      onUpdateSections(history[prevIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      onUpdateSections(history[nextIndex]);
    }
  };

  // Current active formatting state based on selected block
  const currentBlock = sections[activeBlockIndex] || sections[0] || {
    id: 's-default',
    type: 'paragraph',
    content: '',
    heading: '',
  };

  const currentFormatting: FormattingState = {
    type: currentBlock.type || 'paragraph',
    align: currentBlock.align || 'left',
    fontSize: currentBlock.fontSize || (currentBlock.type === 'h1' ? '3xl' : currentBlock.type === 'h2' ? '2xl' : currentBlock.type === 'h3' ? 'xl' : 'base'),
    isBold: !!currentBlock.isBold,
    isItalic: !!currentBlock.isItalic,
    isUnderline: !!currentBlock.isUnderline,
    isStrikethrough: !!currentBlock.isStrikethrough,
    textColor: currentBlock.textColor || '',
    highlightColor: currentBlock.highlightColor || '',
  };

  // Apply format to active block or all selected
  const handleApplyFormat = (format: Partial<DocSection>) => {
    const updated = [...sections];
    if (activeBlockIndex < 0 || activeBlockIndex >= updated.length) return;

    updated[activeBlockIndex] = {
      ...updated[activeBlockIndex],
      ...format,
      // If type changed to heading, sync heading field
      heading: (format.type === 'h1' || format.type === 'h2' || format.type === 'h3') 
        ? updated[activeBlockIndex].content 
        : (format.type ? '' : updated[activeBlockIndex].heading),
    };

    pushToHistory(updated);
  };

  // Clear format of current block
  const handleClearFormatting = () => {
    const updated = [...sections];
    if (activeBlockIndex < 0 || activeBlockIndex >= updated.length) return;

    updated[activeBlockIndex] = {
      ...updated[activeBlockIndex],
      type: 'paragraph',
      align: 'left',
      fontSize: 'base',
      isBold: false,
      isItalic: false,
      isUnderline: false,
      isStrikethrough: false,
      textColor: '',
      highlightColor: '',
    };
    pushToHistory(updated);
  };

  // Add block from toolbar or slash menu
  const handleAddBlock = (type: DocSection['type'], extra: Partial<DocSection> = {}) => {
    const newBlock: DocSection = {
      id: `s-${Date.now()}`,
      type: type || 'paragraph',
      content: extra.content || '',
      heading: (type === 'h1' || type === 'h2' || type === 'h3') ? (extra.content || '') : '',
      checked: type === 'todo' ? false : undefined,
      align: 'left',
      fontSize: type === 'h1' ? '3xl' : type === 'h2' ? '2xl' : type === 'h3' ? 'xl' : 'base',
      ...extra,
    };

    const updated = [...sections];
    const insertIdx = activeBlockIndex + 1;
    updated.splice(insertIdx, 0, newBlock);
    pushToHistory(updated);
    setActiveBlockIndex(insertIdx);

    setTimeout(() => {
      blockRefs.current[insertIdx]?.focus();
    }, 50);
  };

  // Content update handler with markdown triggers
  const handleUpdateBlockContent = (idx: number, text: string) => {
    // Markdown shortcut prefixes
    if (text.startsWith('# ')) {
      convertBlockType(idx, 'h1', text.slice(2));
      return;
    }
    if (text.startsWith('## ')) {
      convertBlockType(idx, 'h2', text.slice(3));
      return;
    }
    if (text.startsWith('### ')) {
      convertBlockType(idx, 'h3', text.slice(4));
      return;
    }
    if (text.startsWith('- ') || text.startsWith('* ')) {
      convertBlockType(idx, 'bullet', text.slice(2));
      return;
    }
    if (text.startsWith('1. ')) {
      convertBlockType(idx, 'numbered', text.slice(3));
      return;
    }
    if (text.startsWith('[] ') || text.startsWith('[ ] ')) {
      convertBlockType(idx, 'todo', text.replace(/^\[\s*\]\s*/, ''));
      return;
    }
    if (text.startsWith('> ')) {
      convertBlockType(idx, 'quote', text.slice(2));
      return;
    }
    if (text.startsWith('$$ ') || text.startsWith('```')) {
      convertBlockType(idx, 'code', text.replace(/^(\$\$|```)\s*/, ''));
      return;
    }
    if (text.startsWith('/imagem ') || text.startsWith('/image ') || text.startsWith('/img ')) {
      const urlPart = text.replace(/^(\/imagem|\/image|\/img)\s*/, '');
      convertBlockType(idx, 'image', '');
      if (urlPart.trim()) {
        const updated = [...sections];
        updated[idx] = { ...updated[idx], imageUrl: urlPart.trim() };
        pushToHistory(updated);
      }
      return;
    }

    // Slash command trigger
    if (text.startsWith('/')) {
      setSlashMenuIndex(idx);
      setSlashQuery(text.slice(1));
      setSelectedSlashItem(0);
    } else if (slashMenuIndex === idx) {
      setSlashMenuIndex(null);
    }

    const updated = [...sections];
    updated[idx] = {
      ...updated[idx],
      content: text,
      heading: (updated[idx].type === 'h1' || updated[idx].type === 'h2' || updated[idx].type === 'h3') ? text : updated[idx].heading,
      formula: updated[idx].type === 'code' ? text : updated[idx].formula,
    };
    onUpdateSections(updated);
  };

  const convertBlockType = (idx: number, newType: DocSection['type'], cleanContent?: string) => {
    const updated = [...sections];
    const targetContent = cleanContent !== undefined ? cleanContent : updated[idx].content.replace(/^\/[a-zA-Z0-9]*/, '');

    updated[idx] = {
      ...updated[idx],
      type: newType,
      content: targetContent,
      heading: (newType === 'h1' || newType === 'h2' || newType === 'h3') ? targetContent : '',
      checked: newType === 'todo' ? (updated[idx].checked || false) : undefined,
      callout: newType === 'callout' ? (targetContent || 'Conceito importante para fixação.') : undefined,
      calloutType: newType === 'callout' ? (updated[idx].calloutType || 'tip') : undefined,
      formula: newType === 'code' ? targetContent : undefined,
      fontSize: newType === 'h1' ? '3xl' : newType === 'h2' ? '2xl' : newType === 'h3' ? 'xl' : 'base',
    };
    pushToHistory(updated);
    setSlashMenuIndex(null);

    setTimeout(() => {
      blockRefs.current[idx]?.focus();
    }, 50);
  };

  // Keyboard shortcut handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, idx: number) => {
    // Keyboard shortcuts (Ctrl+B, Ctrl+I, Ctrl+U)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      handleApplyFormat({ isBold: !currentFormatting.isBold });
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      handleApplyFormat({ isItalic: !currentFormatting.isItalic });
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') {
      e.preventDefault();
      handleApplyFormat({ isUnderline: !currentFormatting.isUnderline });
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      if (e.shiftKey) {
        e.preventDefault();
        handleRedo();
      } else {
        e.preventDefault();
        handleUndo();
      }
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      handleRedo();
      return;
    }

    // Slash menu navigation
    if (slashMenuIndex !== null) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSlashItem(prev => (prev + 1) % 9);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSlashItem(prev => (prev - 1 + 9) % 9);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setSlashMenuIndex(null);
        return;
      }
    }

    // Enter creates next block seamlessly
    if (e.key === 'Enter' && !e.shiftKey) {
      if (sections[idx].type === 'code') {
        return; // Allow multiline inside code block
      }

      e.preventDefault();
      const current = sections[idx];
      let nextType: DocSection['type'] = 'paragraph';
      if (current.type === 'bullet') nextType = 'bullet';
      if (current.type === 'numbered') nextType = 'numbered';
      if (current.type === 'todo') nextType = 'todo';

      const newBlock: DocSection = {
        id: `s-${Date.now()}`,
        type: nextType,
        content: '',
        heading: '',
        checked: nextType === 'todo' ? false : undefined,
        align: current.align || 'left',
      };

      const updated = [...sections];
      updated.splice(idx + 1, 0, newBlock);
      pushToHistory(updated);
      setActiveBlockIndex(idx + 1);

      setTimeout(() => {
        blockRefs.current[idx + 1]?.focus();
      }, 50);
    }

    // Backspace at start deletes empty block and focuses previous
    if (e.key === 'Backspace') {
      const target = e.currentTarget;
      if (target.selectionStart === 0 && target.selectionEnd === 0) {
        if (sections[idx].type !== 'paragraph') {
          e.preventDefault();
          convertBlockType(idx, 'paragraph');
          return;
        }

        if (sections.length > 1 && sections[idx].content === '') {
          e.preventDefault();
          const updated = sections.filter((_, i) => i !== idx);
          pushToHistory(updated);
          const prevIdx = Math.max(0, idx - 1);
          setActiveBlockIndex(prevIdx);
          setTimeout(() => {
            blockRefs.current[prevIdx]?.focus();
          }, 50);
        }
      }
    }
  };

  const handleDeleteBlock = (idx: number) => {
    if (sections.length <= 1) {
      pushToHistory([{ id: `s-${Date.now()}`, type: 'paragraph', content: '', heading: '' }]);
      return;
    }
    const updated = sections.filter((_, i) => i !== idx);
    pushToHistory(updated);
    setActiveMenuBlockIndex(null);
    setActiveBlockIndex(Math.max(0, idx - 1));
  };

  const handleToggleTodo = (idx: number) => {
    const updated = [...sections];
    updated[idx] = {
      ...updated[idx],
      checked: !updated[idx].checked,
    };
    pushToHistory(updated);
  };

  // Table cell edit helper
  const handleTableCellChange = (blockIdx: number, rowIdx: number, colIdx: number, value: string) => {
    const updated = [...sections];
    const currentTable = updated[blockIdx].tableData || [
      ['Item', 'Descrição', 'Status'],
      ['', '', '']
    ];
    const newTable = currentTable.map((row, r) =>
      r === rowIdx ? row.map((cell, c) => (c === colIdx ? value : cell)) : row
    );
    updated[blockIdx] = { ...updated[blockIdx], tableData: newTable };
    pushToHistory(updated);
  };

  const handleAddTableRow = (blockIdx: number) => {
    const updated = [...sections];
    const currentTable = updated[blockIdx].tableData || [['', '', '']];
    const cols = currentTable[0]?.length || 3;
    const newRow = Array(cols).fill('');
    updated[blockIdx] = { ...updated[blockIdx], tableData: [...currentTable, newRow] };
    pushToHistory(updated);
  };

  const handleAddTableCol = (blockIdx: number) => {
    const updated = [...sections];
    const currentTable = updated[blockIdx].tableData || [['', '']];
    const newTable = currentTable.map(row => [...row, '']);
    updated[blockIdx] = { ...updated[blockIdx], tableData: newTable };
    pushToHistory(updated);
  };

  // Image block helper
  const handleUpdateImageBlock = (blockIdx: number, url: string, caption?: string) => {
    const updated = [...sections];
    updated[blockIdx] = {
      ...updated[blockIdx],
      type: 'image',
      imageUrl: url,
      imageCaption: caption !== undefined ? caption : updated[blockIdx].imageCaption,
      content: caption !== undefined ? caption : updated[blockIdx].content,
    };
    pushToHistory(updated);
  };

  // Dynamic real-time word counter and statistics
  const totalStats = useMemo(() => {
    let words = 0;
    let chars = 0;
    let charsNoSpaces = 0;

    for (const s of sections) {
      const textParts = [
        s.content || '',
        s.heading || '',
        s.formula || '',
        s.imageCaption || '',
        s.callout || ''
      ];
      const combined = textParts.join(' ').trim();
      if (combined) {
        const tokens = combined.split(/\s+/).filter(Boolean);
        words += tokens.length;
        chars += combined.length;
        charsNoSpaces += combined.replace(/\s+/g, '').length;
      }

      if (s.tableData) {
        for (const row of s.tableData) {
          for (const cell of row) {
            const trimmed = cell.trim();
            if (trimmed) {
              words += trimmed.split(/\s+/).filter(Boolean).length;
              chars += trimmed.length;
              charsNoSpaces += trimmed.replace(/\s+/g, '').length;
            }
          }
        }
      }
    }

    const readingTimeMin = Math.max(1, Math.ceil(words / 200));

    return { words, chars, charsNoSpaces, blocksCount: sections.length, readingTimeMin };
  }, [sections]);

  // Helper for generating dynamic block styling
  const getBlockStyle = (section: DocSection): { className: string; inlineStyle: React.CSSProperties } => {
    const classes = [];
    const inlineStyle: React.CSSProperties = {};

    // Font Style & Weight
    if (section.isBold) classes.push('font-bold');
    if (section.isItalic) classes.push('italic');
    if (section.isUnderline) classes.push('underline underline-offset-4');
    if (section.isStrikethrough) classes.push('line-through');

    // Alignment
    if (section.align === 'center') classes.push('text-center');
    else if (section.align === 'right') classes.push('text-right');
    else if (section.align === 'justify') classes.push('text-justify');
    else classes.push('text-left');

    // Text & Highlight Colors
    if (section.textColor) {
      inlineStyle.color = section.textColor;
    }
    if (section.highlightColor) {
      inlineStyle.backgroundColor = section.highlightColor;
      inlineStyle.padding = '2px 6px';
      inlineStyle.borderRadius = '6px';
    }

    return { className: classes.join(' '), inlineStyle };
  };

  return (
    <div className="w-full space-y-4 relative font-sans select-text">
      
      {/* 1. BARRA DE FERRAMENTAS PRINCIPAL ESTILO WORD (FIXA NO TOPO DO DOCUMENTO) */}
      <NotionToolbar
        currentFormatting={currentFormatting}
        onApplyFormat={handleApplyFormat}
        onAddBlock={handleAddBlock}
        onOpenAddGlossary={onOpenAddGlossary}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onClearFormatting={handleClearFormatting}
      />

      {/* 2. ÁREA DE TEXTO FLUIDA DO DOCUMENTO (SEM SCROLL INTERNO, QUEBRA NATURAL DE PALAVRAS) */}
      <div className="w-full space-y-2 pt-2">
        {sections.map((section, idx) => {
          const isFocused = activeBlockIndex === idx;
          const isHovered = hoveredIndex === idx;
          const { className: formatClass, inlineStyle } = getBlockStyle(section);

          return (
            <motion.div
              key={section.id || idx}
              id={`doc-block-${idx}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => setActiveBlockIndex(idx)}
              className={`group relative flex items-start -ml-6 sm:-ml-10 pl-6 sm:pl-10 rounded-xl transition-all duration-200 scroll-mt-24 ${
                isFocused ? 'bg-blue-50/20 dark:bg-blue-950/10' : ''
              }`}
            >
              {/* Left Action Handle Gutter */}
              <div
                className={`absolute left-0 top-1.5 flex items-center gap-0.5 transition-opacity select-none ${
                  isHovered || isFocused ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleAddBlock('paragraph')}
                  className="w-5 h-5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors"
                  title="Adicionar bloco abaixo (Enter)"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveMenuBlockIndex(activeMenuBlockIndex === idx ? null : idx)}
                    className="w-5 h-5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors"
                    title="Mais opções do bloco"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>

                  {/* Dropdown de Opções Rápidas do Bloco */}
                  {activeMenuBlockIndex === idx && (
                    <div className="absolute left-6 top-0 z-50 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-1.5 text-xs animate-in fade-in zoom-in-95">
                      <button
                        onClick={() => {
                          convertBlockType(idx, 'paragraph');
                          setActiveMenuBlockIndex(null);
                        }}
                        className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                      >
                        <Type className="w-3.5 h-3.5 text-slate-400" /> Texto Normal
                      </button>
                      <button
                        onClick={() => {
                          convertBlockType(idx, 'h1');
                          setActiveMenuBlockIndex(null);
                        }}
                        className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 font-bold"
                      >
                        <Heading1 className="w-3.5 h-3.5 text-blue-600" /> Título 1 (H1)
                      </button>
                      <button
                        onClick={() => {
                          convertBlockType(idx, 'h2');
                          setActiveMenuBlockIndex(null);
                        }}
                        className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 font-semibold"
                      >
                        <Heading2 className="w-3.5 h-3.5 text-indigo-600" /> Título 2 (H2)
                      </button>
                      <button
                        onClick={() => {
                          convertBlockType(idx, 'bullet');
                          setActiveMenuBlockIndex(null);
                        }}
                        className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                      >
                        <List className="w-3.5 h-3.5 text-emerald-600" /> Marcadores
                      </button>
                      <button
                        onClick={() => {
                          convertBlockType(idx, 'todo');
                          setActiveMenuBlockIndex(null);
                        }}
                        className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                      >
                        <CheckSquare className="w-3.5 h-3.5 text-teal-600" /> Checklist
                      </button>
                      <button
                        onClick={() => {
                          convertBlockType(idx, 'callout');
                          setActiveMenuBlockIndex(null);
                        }}
                        className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                      >
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Caixa Destaque
                      </button>
                      <button
                        onClick={() => {
                          convertBlockType(idx, 'image');
                          setActiveMenuBlockIndex(null);
                        }}
                        className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-pink-500" /> Imagem (URL)
                      </button>
                      <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                      <button
                        onClick={() => handleDeleteBlock(idx)}
                        className="w-full px-3 py-1.5 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 flex items-center gap-2 font-medium"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Excluir Bloco
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Corpo Principal do Bloco Formatado */}
              <div className="flex-1 w-full min-w-0 relative">
                
                {/* 1. PARÁGRAFO DE TEXTO NORMAL */}
                {(!section.type || section.type === 'paragraph') && (
                  <div className="py-1">
                    <AutoResizeTextarea
                      inputRef={el => (blockRefs.current[idx] = el)}
                      value={section.content || ''}
                      placeholder="Digite '/' para comandos ou comece a escrever..."
                      onChange={val => handleUpdateBlockContent(idx, val)}
                      onKeyDown={e => handleKeyDown(e, idx)}
                      onFocus={() => setActiveBlockIndex(idx)}
                      style={inlineStyle}
                      className={`text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 font-normal ${formatClass}`}
                    />
                  </div>
                )}

                {/* 2. TÍTULO 1 (H1) COM QUEBRA DE LINHA NATURAL */}
                {section.type === 'h1' && (
                  <div className="pt-4 pb-1">
                    <AutoResizeTextarea
                      inputRef={el => (blockRefs.current[idx] = el)}
                      value={section.content || section.heading || ''}
                      placeholder="Título Principal H1..."
                      onChange={val => handleUpdateBlockContent(idx, val)}
                      onKeyDown={e => handleKeyDown(e, idx)}
                      onFocus={() => setActiveBlockIndex(idx)}
                      style={inlineStyle}
                      className={`font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight leading-tight placeholder:text-slate-300 dark:placeholder:text-slate-600 ${formatClass}`}
                    />
                  </div>
                )}

                {/* 3. TÍTULO 2 (H2) */}
                {section.type === 'h2' && (
                  <div className="pt-3 pb-1">
                    <AutoResizeTextarea
                      inputRef={el => (blockRefs.current[idx] = el)}
                      value={section.content || section.heading || ''}
                      placeholder="Subtítulo H2..."
                      onChange={val => handleUpdateBlockContent(idx, val)}
                      onKeyDown={e => handleKeyDown(e, idx)}
                      onFocus={() => setActiveBlockIndex(idx)}
                      style={inlineStyle}
                      className={`font-display font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight leading-snug placeholder:text-slate-300 dark:placeholder:text-slate-600 ${formatClass}`}
                    />
                  </div>
                )}

                {/* 4. TÍTULO 3 (H3) */}
                {section.type === 'h3' && (
                  <div className="pt-2 pb-0.5">
                    <AutoResizeTextarea
                      inputRef={el => (blockRefs.current[idx] = el)}
                      value={section.content || section.heading || ''}
                      placeholder="Título 3..."
                      onChange={val => handleUpdateBlockContent(idx, val)}
                      onKeyDown={e => handleKeyDown(e, idx)}
                      onFocus={() => setActiveBlockIndex(idx)}
                      style={inlineStyle}
                      className={`font-display font-bold text-lg sm:text-xl text-slate-800 dark:text-slate-200 tracking-tight leading-normal placeholder:text-slate-300 dark:placeholder:text-slate-600 ${formatClass}`}
                    />
                  </div>
                )}

                {/* 5. LISTA COM MARCADORES (BULLET LIST) */}
                {section.type === 'bullet' && (
                  <div className="flex items-start gap-3 py-1">
                    <span className="w-2 h-2 rounded-full bg-slate-500 dark:bg-slate-400 mt-2 shrink-0" />
                    <AutoResizeTextarea
                      inputRef={el => (blockRefs.current[idx] = el)}
                      value={section.content || ''}
                      placeholder="Item com marcador..."
                      onChange={val => handleUpdateBlockContent(idx, val)}
                      onKeyDown={e => handleKeyDown(e, idx)}
                      onFocus={() => setActiveBlockIndex(idx)}
                      style={inlineStyle}
                      className={`text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 ${formatClass}`}
                    />
                  </div>
                )}

                {/* 6. LISTA NUMERADA */}
                {section.type === 'numbered' && (
                  <div className="flex items-start gap-2.5 py-1">
                    <span className="font-bold text-sm text-slate-500 dark:text-slate-400 mt-0.5 shrink-0 min-w-[20px]">
                      {idx + 1}.
                    </span>
                    <AutoResizeTextarea
                      inputRef={el => (blockRefs.current[idx] = el)}
                      value={section.content || ''}
                      placeholder="Item numerado..."
                      onChange={val => handleUpdateBlockContent(idx, val)}
                      onKeyDown={e => handleKeyDown(e, idx)}
                      onFocus={() => setActiveBlockIndex(idx)}
                      style={inlineStyle}
                      className={`text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 ${formatClass}`}
                    />
                  </div>
                )}

                {/* 7. TO-DO / CHECKLIST */}
                {section.type === 'todo' && (
                  <div className="flex items-start gap-3 py-1">
                    <button
                      type="button"
                      onClick={() => handleToggleTodo(idx)}
                      className="mt-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer shrink-0"
                    >
                      {section.checked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                    <AutoResizeTextarea
                      inputRef={el => (blockRefs.current[idx] = el)}
                      value={section.content || ''}
                      placeholder="Meta ou tarefa..."
                      onChange={val => handleUpdateBlockContent(idx, val)}
                      onKeyDown={e => handleKeyDown(e, idx)}
                      onFocus={() => setActiveBlockIndex(idx)}
                      style={inlineStyle}
                      className={`text-sm sm:text-base leading-relaxed transition-all ${
                        section.checked
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-800 dark:text-slate-200'
                      } ${formatClass}`}
                    />
                  </div>
                )}

                {/* 8. CAIXAS DE DESTAQUE / CALLOUT (DICA, AVISO, SUCESSO, FOCO) */}
                {section.type === 'callout' && (
                  <div className={`my-3 p-4 rounded-2xl border flex items-start gap-3 transition-all ${
                    section.calloutType === 'warning'
                      ? 'bg-red-50/80 dark:bg-red-950/40 border-red-200 dark:border-red-900/60 text-red-950 dark:text-red-100'
                      : section.calloutType === 'success'
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-emerald-950 dark:text-emerald-100'
                      : section.calloutType === 'focus'
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60 text-blue-950 dark:text-blue-100'
                      : 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-950 dark:text-amber-100'
                  }`}>
                    <div className="mt-0.5 shrink-0">
                      {section.calloutType === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      ) : section.calloutType === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : section.calloutType === 'focus' ? (
                        <Info className="w-4 h-4 text-blue-500" />
                      ) : (
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <AutoResizeTextarea
                        inputRef={el => (blockRefs.current[idx] = el)}
                        value={section.content || ''}
                        placeholder="Destaque importante, axioma ou regra de ouro..."
                        onChange={val => handleUpdateBlockContent(idx, val)}
                        onKeyDown={e => handleKeyDown(e, idx)}
                        onFocus={() => setActiveBlockIndex(idx)}
                        style={inlineStyle}
                        className={`text-xs sm:text-sm font-medium leading-relaxed ${formatClass}`}
                      />
                    </div>
                  </div>
                )}

                {/* 9. CITAÇÃO (QUOTE) */}
                {section.type === 'quote' && (
                  <div className="my-3 pl-4 border-l-4 border-purple-500 py-1 italic text-slate-700 dark:text-slate-300">
                    <AutoResizeTextarea
                      inputRef={el => (blockRefs.current[idx] = el)}
                      value={section.content || ''}
                      placeholder="Citação memorável..."
                      onChange={val => handleUpdateBlockContent(idx, val)}
                      onKeyDown={e => handleKeyDown(e, idx)}
                      onFocus={() => setActiveBlockIndex(idx)}
                      style={inlineStyle}
                      className={`text-sm sm:text-base font-serif italic ${formatClass}`}
                    />
                  </div>
                )}

                {/* 10. FÓRMULA / BLOCO DE CÓDIGO */}
                {section.type === 'code' && (
                  <div className="my-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-cyan-300 font-mono text-xs shadow-inner">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2 font-sans">
                      <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-cyan-400">
                        <Code className="w-3.5 h-3.5" />
                        Fórmula / Expressão Matemática
                      </span>
                      <span>LaTeX / Code</span>
                    </div>
                    <AutoResizeTextarea
                      inputRef={el => (blockRefs.current[idx] = el)}
                      value={section.formula || section.content || ''}
                      placeholder="Ex: \int_{a}^{b} f(x)dx ou Δ = b² - 4ac..."
                      onChange={val => handleUpdateBlockContent(idx, val)}
                      onKeyDown={e => handleKeyDown(e, idx)}
                      onFocus={() => setActiveBlockIndex(idx)}
                      className="text-xs sm:text-sm font-mono text-cyan-300"
                    />
                  </div>
                )}

                {/* 11. TABELA ESTILO WORD COM LINHAS E COLUNAS EDITÁVEIS */}
                {section.type === 'table' && (
                  <div className="my-4 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                    <table className="w-full text-xs text-left border-collapse">
                      <tbody>
                        {(section.tableData || [['Coluna 1', 'Coluna 2', 'Coluna 3'], ['', '', '']]).map((row, rIdx) => (
                          <tr 
                            key={rIdx} 
                            className={rIdx === 0 ? 'bg-slate-100/80 dark:bg-slate-800/80 font-bold' : 'border-t border-slate-200/80 dark:border-slate-800'}
                          >
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="p-2.5 border-r border-slate-200/80 dark:border-slate-800 last:border-r-0">
                                <input
                                  type="text"
                                  value={cell}
                                  onChange={e => handleTableCellChange(idx, rIdx, cIdx, e.target.value)}
                                  placeholder={`Célula ${rIdx + 1},${cIdx + 1}`}
                                  className="w-full bg-transparent border-none outline-none text-slate-800 dark:text-slate-200 text-xs focus:ring-1 focus:ring-blue-500 rounded px-1"
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="p-2 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
                      <button
                        type="button"
                        onClick={() => handleAddTableRow(idx)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Adicionar Linha
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddTableCol(idx)}
                        className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Adicionar Coluna
                      </button>
                    </div>
                  </div>
                )}

                {/* 12. LINHA DIVISÓRIA (DIVIDER) */}
                {section.type === 'divider' && (
                  <div className="my-4 py-2 flex items-center justify-center">
                    <div className="w-full h-px bg-slate-200 dark:border-slate-800 dark:bg-slate-800" />
                  </div>
                )}

                {/* 13. IMAGEM POR URL */}
                {section.type === 'image' && (
                  <div className={`my-4 w-full flex flex-col ${
                    section.align === 'center' ? 'items-center' : section.align === 'right' ? 'items-end' : 'items-start'
                  }`}>
                    {section.imageUrl ? (
                      <div className="relative group/img max-w-full rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm bg-slate-50 dark:bg-slate-900/50">
                        <img
                          src={section.imageUrl}
                          alt={section.imageCaption || section.imageAlt || 'Imagem do documento'}
                          className="max-h-[460px] w-auto max-w-full object-contain rounded-2xl transition-transform hover:scale-[1.005]"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            const fallback = target.parentElement?.querySelector('.img-error-fallback') as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />

                        {/* Fallback de Erro de URL */}
                        <div className="img-error-fallback hidden p-6 flex-col items-center justify-center gap-2 text-center text-red-500 bg-red-50/50 dark:bg-red-950/20">
                          <AlertTriangle className="w-6 h-6 text-red-500" />
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Não foi possível carregar a imagem do link fornecido.</p>
                          <span className="text-[11px] text-slate-400 font-mono break-all max-w-sm">{section.imageUrl}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newUrl = prompt('Atualizar link da imagem (URL):', section.imageUrl);
                              if (newUrl !== null) {
                                handleUpdateImageBlock(idx, newUrl.trim(), section.imageCaption);
                              }
                            }}
                            className="mt-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors shadow-2xs"
                          >
                            Editar Link da Imagem
                          </button>
                        </div>

                        {/* Controles Flutuantes da Imagem ao passar o mouse */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover/img:opacity-100 transition-opacity bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl p-1 flex items-center gap-1 shadow-lg z-10">
                          <button
                            type="button"
                            onClick={() => {
                              const newUrl = prompt('Alterar URL da imagem:', section.imageUrl);
                              if (newUrl !== null && newUrl.trim()) {
                                handleUpdateImageBlock(idx, newUrl.trim(), section.imageCaption);
                              }
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                            title="Alterar URL da Imagem"
                          >
                            <Link className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              window.open(section.imageUrl, '_blank');
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                            title="Abrir imagem original"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBlock(idx)}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-red-500 transition-colors cursor-pointer"
                            title="Remover Imagem"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Card Inline para Inserir URL quando vazio */
                      <div className="w-full p-4 border-2 border-dashed border-pink-300/80 dark:border-pink-900/60 rounded-2xl bg-pink-50/40 dark:bg-pink-950/20 flex flex-col gap-2.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-pink-700 dark:text-pink-300">
                          <ImageIcon className="w-4 h-4 text-pink-500" />
                          <span>Inserir Imagem por Link (URL)</span>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            placeholder="Cole aqui o link direto da imagem (ex: https://.../figura.png)"
                            defaultValue=""
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const val = (e.target as HTMLInputElement).value;
                                if (val.trim()) handleUpdateImageBlock(idx, val.trim(), section.imageCaption);
                              }
                            }}
                            className="flex-1 text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-pink-200 dark:border-pink-800 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-pink-500"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              const input = (e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement);
                              if (input && input.value.trim()) {
                                handleUpdateImageBlock(idx, input.value.trim(), section.imageCaption);
                              }
                            }}
                            className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                          >
                            Inserir
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Legenda Editável da Imagem */}
                    <div className="w-full max-w-xl mt-1.5 px-2">
                      <AutoResizeTextarea
                        inputRef={el => (blockRefs.current[idx] = el)}
                        value={section.imageCaption || section.content || ''}
                        placeholder="Escreva uma legenda ou fonte para a imagem..."
                        onChange={val => {
                          const updated = [...sections];
                          updated[idx] = { ...updated[idx], imageCaption: val, content: val };
                          pushToHistory(updated);
                        }}
                        onFocus={() => setActiveBlockIndex(idx)}
                        className="text-center text-xs text-slate-500 dark:text-slate-400 italic placeholder:text-slate-300 dark:placeholder:text-slate-600"
                      />
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 3. BOTÃO DE INSERIR NOVO BLOCO NO FINAL DO DOCUMENTO */}
      <div className="pt-6 pb-2 flex items-center justify-center">
        <button
          type="button"
          onClick={() => handleAddBlock('paragraph')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs transition-all cursor-pointer shadow-xs hover:shadow-md"
        >
          <Plus className="w-4 h-4 text-blue-600" />
          <span>Continuar escrevendo / Novo parágrafo</span>
        </button>
      </div>

      {/* 4. RODAPÉ COM CONTADOR DE PALAVRAS DINÂMICO EM TEMPO REAL */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 pt-4 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 select-none font-medium"
      >
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Contador de Palavras */}
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold border border-blue-200/60 dark:border-blue-800/60 shadow-2xs">
            <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="font-mono text-sm">{totalStats.words}</span>
            <span className="font-normal text-slate-500 dark:text-slate-400 text-[11px]">
              {totalStats.words === 1 ? 'palavra' : 'palavras'}
            </span>
          </span>

          {/* Contador de Caracteres */}
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <span className="font-mono font-semibold">{totalStats.chars}</span>
            <span className="text-[11px] text-slate-400">caracteres</span>
          </span>

          <span className="hidden md:inline-flex text-[11px] text-slate-400">
            ({totalStats.charsNoSpaces} sem espaços)
          </span>

          {/* Contador de Blocos */}
          <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <Layers className="w-3.5 h-3.5 text-purple-500" />
            <span className="font-mono font-semibold">{totalStats.blocksCount}</span>
            <span className="text-[11px] text-slate-400">{totalStats.blocksCount === 1 ? 'bloco' : 'blocos'}</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Tempo Estimado de Leitura */}
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 font-medium text-[11px]">
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            <span>~{totalStats.readingTimeMin} min de leitura</span>
          </span>

          {/* Indicador de Salvamento Ativo */}
          <span className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Em tempo real
          </span>
        </div>
      </motion.div>

    </div>
  );
};
