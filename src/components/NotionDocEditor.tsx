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
  Edit3,
  X,
  ChevronUp,
  Copy
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

// Escape HTML special characters (used for placeholder/default text)
const escapeHtml = (str: string): string =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Remove HTML tags keeping plain text (for word count, copy, summaries, etc.)
const stripHtml = (html: string): string => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return (div.textContent || div.innerText || '').replace(/\u00a0/g, ' ');
};

const htmlOf = (section: DocSection): string =>
  section.contentHtml || escapeHtml(section.content || '');

// True when the caret is collapsed at the very start of a contentEditable block
const isCaretAtStart = (el: HTMLElement): boolean => {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return true;
  const range = sel.getRangeAt(0);
  if (!range.collapsed) return false;
  if (range.startContainer === el && range.startOffset === 0) return true;
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
  const firstText = walker.nextNode();
  if (firstText && range.startContainer === firstText && range.startOffset === 0) return true;
  return false;
};

// Auto-resizing contentEditable block that supports inline formatting (Ctrl+B/I/U etc.)
const TextEditable: React.FC<{
  value: DocSection;
  onChange: (plainText: string, html: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  inputRef?: (el: HTMLDivElement | null) => void;
}> = ({ value, onChange, onKeyDown, onFocus, onBlur, placeholder, className = '', style, inputRef }) => {
  const elRef = useRef<HTMLDivElement | null>(null);
  const focusedRef = useRef(false);
  const lastHtmlRef = useRef<string>('');
  const onChangeRef = useRef(onChange);
  const onKeyDownRef = useRef(onKeyDown);
  const onFocusRef = useRef(onFocus);
  const onBlurRef = useRef(onBlur);
  const inputRefRef = useRef(inputRef);
  useEffect(() => {
    onChangeRef.current = onChange;
    onKeyDownRef.current = onKeyDown;
    onFocusRef.current = onFocus;
    onBlurRef.current = onBlur;
    inputRefRef.current = inputRef;
  });

  const resize = useCallback(() => {
    if (elRef.current) {
      elRef.current.style.height = 'auto';
      elRef.current.style.height = `${Math.max(26, elRef.current.scrollHeight)}px`;
    }
  }, []);

  // Sync external HTML into the element only when it differs and block is not being typed in
  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    const nextHtml = htmlOf(value);
    if (!focusedRef.current && nextHtml !== lastHtmlRef.current) {
      el.innerHTML = nextHtml;
      lastHtmlRef.current = nextHtml;
    }
    resize();
  }, [value, resize]);

  useEffect(() => {
    const el = elRef.current;
    if (el && !el.innerHTML && !lastHtmlRef.current) {
      el.innerHTML = htmlOf(value);
      lastHtmlRef.current = htmlOf(value);
    }
    resize();
  }, []);

  const commit = () => {
    const el = elRef.current;
    if (!el) return;
    const html = el.innerHTML;
    lastHtmlRef.current = html;
    onChangeRef.current(stripHtml(html), html);
    resize();
  };

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    const onInput = () => commit();
    el.addEventListener('input', onInput);
    return () => el.removeEventListener('input', onInput);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={el => {
        elRef.current = el;
        if (inputRefRef.current) inputRefRef.current(el);
      }}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-multiline="true"
      data-placeholder={placeholder}
      onKeyDown={e => onKeyDownRef.current && onKeyDownRef.current(e)}
      onFocus={() => {
        focusedRef.current = true;
        if (onFocusRef.current) onFocusRef.current();
        resize();
      }}
      onBlur={() => {
        focusedRef.current = false;
        commit();
        if (onBlurRef.current) onBlurRef.current();
      }}
      style={{
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
        whiteSpace: 'pre-wrap',
        outline: 'none',
        ...style,
      }}
      className={`w-full bg-transparent border-none p-0 m-0 empty:before:content-[attr(data-placeholder)] empty:before:text-slate-300 empty:before:dark:text-slate-600 ${className}`}
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

  // Multi-seleção de blocos (automática: arraste em qualquer lugar para marcar vários)
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([]);
  const blockListRef = useRef<HTMLDivElement>(null);
  const dragSelectRef = useRef<{ startY: number; moved: boolean } | null>(null);
  const dragModeRef = useRef<'marquee' | 'move' | null>(null);
  const moveDragRef = useRef<{ startY: number; insertion: number | null } | null>(null);
  const didBlockDragRef = useRef(false);
  const [dragLiveIds, setDragLiveIds] = useState<string[]>([]);
  const [dragSelectRect, setDragSelectRect] = useState<{ top: number; height: number } | null>(null);
  const [moveIndicatorY, setMoveIndicatorY] = useState<number | null>(null);

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
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);

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
  const handleUpdateBlockContent = (idx: number, text: string, html?: string) => {
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
      contentHtml: html !== undefined ? html : updated[idx].contentHtml,
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
      contentHtml: targetContent ? escapeHtml(targetContent) : '',
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
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, idx: number) => {
    // Keyboard shortcuts (Ctrl+B, Ctrl+I, Ctrl+U, Ctrl+Shift+5 for strikethrough)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      document.execCommand('bold');
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      document.execCommand('italic');
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') {
      e.preventDefault();
      document.execCommand('underline');
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'x') {
      e.preventDefault();
      document.execCommand('strikeThrough');
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

    // Delete / Backspace: select-all + Delete removes the whole block,
    // and Backspace on an empty block removes the block too.
    if (e.key === 'Delete' || e.key === 'Backspace') {
      const el = e.currentTarget;
      const sel = window.getSelection();
      const blockText = el.textContent || '';
      const hasSelection = !!sel && sel.rangeCount > 0 && sel.toString().length > 0;
      const wholeSelected = hasSelection && sel.toString().length >= blockText.length;
      const isParagraph = !sections[idx].type || sections[idx].type === 'paragraph';

      // Select everything in the block and press Delete/Backspace => delete the block
      if (wholeSelected && blockText.length > 0) {
        e.preventDefault();
        deleteThisBlock(idx);
        return;
      }

      // Backspace on an empty paragraph (or after collapsing the selection)
      if (e.key === 'Backspace') {
        const collapsed = !hasSelection && (!sel || sel.rangeCount === 0 || sel.getRangeAt(0).collapsed);
        if (sections[idx].content === '' && collapsed) {
          e.preventDefault();
          if (isParagraph) {
            deleteThisBlock(idx);
          } else {
            convertBlockType(idx, 'paragraph');
          }
          return;
        }
        if (collapsed && !isParagraph && isCaretAtStart(el)) {
          e.preventDefault();
          convertBlockType(idx, 'paragraph');
          return;
        }
      }
    }
  };

  const deleteThisBlock = (idx: number) => {
    if (sections.length <= 1) {
      pushToHistory([{ id: `s-${Date.now()}`, type: 'paragraph', content: '', heading: '' }]);
      setActiveBlockIndex(0);
      setTimeout(() => {
        blockRefs.current[0]?.focus();
      }, 50);
      return;
    }
    const updated = sections.filter((_, i) => i !== idx);
    pushToHistory(updated);
    setActiveMenuBlockIndex(null);
    const prevIdx = Math.max(0, idx - 1);
    setActiveBlockIndex(prevIdx);
    setTimeout(() => {
      blockRefs.current[prevIdx]?.focus();
    }, 50);
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

  // --- Multi-seleção de blocos (automática: arraste em qualquer lugar da página) ---
  const isBlockSelected = (id: string) => selectedBlockIds.includes(id) || dragLiveIds.includes(id);

  const toggleBlockSelect = (id: string) => {
    setSelectedBlockIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const clearBlockSelection = () => {
    setSelectedBlockIds([]);
    setDragLiveIds([]);
    setDragSelectRect(null);
    setMoveIndicatorY(null);
    dragModeRef.current = null;
    moveDragRef.current = null;
    dragSelectRef.current = null;
    document.body.style.userSelect = '';
  };

  // Dois modos de arrasto: 'marquee' (selecionar vários) e 'move' (arrastar selecionados)
  const onEditorMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const t = e.target as HTMLElement;

    // Se começar sobre um bloco JÁ selecionado e houver seleção => arrastar para mover
    const blockEl = t.closest('[data-block-id]') as HTMLElement | null;
    const blockId = blockEl?.getAttribute('data-block-id') || '';
    if (blockEl && selectedBlockIds.includes(blockId) && selectedBlockIds.length > 0) {
      dragModeRef.current = 'move';
      didBlockDragRef.current = false;
      moveDragRef.current = { startY: e.clientY, insertion: null };
      document.body.style.userSelect = 'none';
      return;
    }

    // Dentro de texto/interativo => deixa o comportamento padrão (editar, clicar botão)
    if (t.closest('[contenteditable="true"], button, input, textarea, select')) return;

    // Qualquer outro lugar da página (área vazia, margens, entre blocos) => marquee
    dragModeRef.current = 'marquee';
    didBlockDragRef.current = false;
    dragSelectRef.current = { startY: e.clientY, moved: false };
    document.body.style.userSelect = 'none';
  };

  const onEditorMouseMove = (e: React.MouseEvent) => {
    if (dragModeRef.current === 'marquee') {
      const drag = dragSelectRef.current;
      if (!drag) return;
      if (!drag.moved && Math.abs(e.clientY - drag.startY) < 6) return;
      drag.moved = true;
      didBlockDragRef.current = true;

      const top = Math.min(drag.startY, e.clientY);
      const height = Math.abs(e.clientY - drag.startY);
      setDragSelectRect({ top, height });

      const live: string[] = [];
      if (blockListRef.current) {
        blockListRef.current.querySelectorAll('[data-block-id]').forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.top < top + height && r.bottom > top) {
            const id = el.getAttribute('data-block-id');
            if (id) live.push(id);
          }
        });
      }
      setDragLiveIds(live);
    } else if (dragModeRef.current === 'move') {
      const mv = moveDragRef.current;
      if (!mv) return;
      e.preventDefault();
      didBlockDragRef.current = true;

      let insertion = 0;
      let found = false;
      if (blockListRef.current) {
        blockListRef.current.querySelectorAll('[data-block-id]').forEach(el => {
          const r = el.getBoundingClientRect();
          if (e.clientY > r.top + r.height / 2) { insertion += 1; found = true; }
        });
      }
      mv.insertion = insertion;

      const els = blockListRef.current?.querySelectorAll('[data-block-id]');
      let y = 0;
      if (els && els.length) {
        if (insertion <= 0) y = els[0].getBoundingClientRect().top;
        else if (insertion >= els.length) y = els[els.length - 1].getBoundingClientRect().bottom;
        else y = els[insertion].getBoundingClientRect().top;
      }
      setMoveIndicatorY(found || els && els.length ? y : null);
    }
  };

  const onEditorMouseUp = () => {
    const mode = dragModeRef.current;
    if (mode === 'marquee') {
      const drag = dragSelectRef.current;
      if (drag?.moved) {
        setSelectedBlockIds(prev => {
          const merged = [...prev];
          dragLiveIds.forEach(id => { if (!merged.includes(id)) merged.push(id); });
          return merged;
        });
      }
    } else if (mode === 'move') {
      const mv = moveDragRef.current;
      if (mv && mv.insertion !== null && didBlockDragRef.current) {
        moveToInsertion(mv.insertion);
      }
    }
    dragModeRef.current = null;
    dragSelectRef.current = null;
    moveDragRef.current = null;
    setMoveIndicatorY(null);
    setDragLiveIds([]);
    setDragSelectRect(null);
    document.body.style.userSelect = '';
  };

  const moveToInsertion = (insertion: number) => {
    const sel = new Set<string>(selectedBlockIds);
    const selected = sections.filter(s => sel.has(s.id));
    const rest = sections.filter(s => !sel.has(s.id));
    const at = Math.max(0, Math.min(insertion, rest.length));
    pushToHistory([...rest.slice(0, at), ...selected, ...rest.slice(at)]);
  };

  const deleteSelectedBlocks = () => {
    if (selectedBlockIds.length === 0) return;
    const ids = new Set<string>(selectedBlockIds);
    const kept = sections.filter(s => !ids.has(s.id));
    const next = kept.length ? kept : [{ id: `s-${Date.now()}`, type: 'paragraph' as const, content: '', heading: '' }];
    pushToHistory(next);
    clearBlockSelection();
  };

  // Delete/Backspace apaga os blocos selecionados (quando o foco não está no texto)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;
      if (e.ctrlKey || e.metaKey) return;
      const t = e.target as HTMLElement;
      if (t && t.closest && t.closest('input, textarea, [contenteditable="true"]')) return;
      if (selectedBlockIds.length === 0) return;
      e.preventDefault();
      deleteSelectedBlocks();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedBlockIds]);

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
    <div
      className="w-full space-y-4 relative font-sans select-text"
      onMouseDown={onEditorMouseDown}
      onMouseMove={onEditorMouseMove}
      onMouseUp={onEditorMouseUp}
      onMouseLeave={() => { if (dragModeRef.current) onEditorMouseUp(); }}
    >
      
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
        <div ref={blockListRef} className="relative w-full space-y-2">
        {sections.map((section, idx) => {
          const isFocused = activeBlockIndex === idx;
          const isHovered = hoveredIndex === idx;
          const { className: formatClass, inlineStyle } = getBlockStyle(section);

          return (
            <motion.div
              key={section.id || idx}
              id={`doc-block-${idx}`}
              data-block-id={section.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={(e) => {
                if (didBlockDragRef.current) { didBlockDragRef.current = false; return; }
                if (e.ctrlKey || e.metaKey) {
                  toggleBlockSelect(section.id);
                } else {
                  if (selectedBlockIds.length > 0) clearBlockSelection();
                  setActiveBlockIndex(idx);
                }
              }}
              className={`group relative flex items-start -ml-6 sm:-ml-10 pl-6 sm:pl-10 rounded-xl transition-all duration-200 scroll-mt-24 ${
                selectedBlockIds.length > 0 ? 'cursor-pointer' : ''
              } ${
                isBlockSelected(section.id)
                  ? 'bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-blue-400/70 dark:ring-blue-500/50'
                  : isFocused ? 'bg-blue-50/20 dark:bg-blue-950/10' : ''
              }`}
            >
              {isBlockSelected(section.id) && (
                <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900 text-white flex items-center justify-center z-20 shadow-md">
                  <Check className="w-3 h-3" />
                </div>
              )}
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
                    <TextEditable
                      inputRef={el => (blockRefs.current[idx] = el)}
                      value={section}
                      placeholder="Digite '/' para comandos ou comece a escrever..."
                      onChange={(text, html) => handleUpdateBlockContent(idx, text, html)}
                      onKeyDown={e => handleKeyDown(e, idx)}
                      onFocus={() => setActiveBlockIndex(idx)}
                      style={inlineStyle}
                      className={`text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200 font-normal ${formatClass}`}
                    />
                  </div>
                )}

                {/* 2. TÍTULO 1 (H1) COM QUEBRA DE LINHA NATURAL */}
                {section.type === 'h1' && (
                  <div className="pt-4 pb-1">
                    <TextEditable
                      inputRef={el => (blockRefs.current[idx] = el)}
                      value={section}
                      placeholder="Título Principal H1..."
                      onChange={(text, html) => handleUpdateBlockContent(idx, text, html)}
                      onKeyDown={e => handleKeyDown(e, idx)}
                      onFocus={() => setActiveBlockIndex(idx)}
                      style={inlineStyle}
                      className={`font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight leading-tight ${formatClass}`}
                    />
                  </div>
                )}

                {/* 3. TÍTULO 2 (H2) */}
                {section.type === 'h2' && (
                  <div className="pt-3 pb-1">
                    <TextEditable
                      inputRef={el => (blockRefs.current[idx] = el)}
                      value={section}
                      placeholder="Subtítulo H2..."
                      onChange={(text, html) => handleUpdateBlockContent(idx, text, html)}
                      onKeyDown={e => handleKeyDown(e, idx)}
                      onFocus={() => setActiveBlockIndex(idx)}
                      style={inlineStyle}
                      className={`font-display font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight leading-snug ${formatClass}`}
                    />
                  </div>
                )}

                {/* 4. TÍTULO 3 (H3) */}
                {section.type === 'h3' && (
                  <div className="pt-2 pb-0.5">
                    <TextEditable
                      inputRef={el => (blockRefs.current[idx] = el)}
                      value={section}
                      placeholder="Título 3..."
                      onChange={(text, html) => handleUpdateBlockContent(idx, text, html)}
                      onKeyDown={e => handleKeyDown(e, idx)}
                      onFocus={() => setActiveBlockIndex(idx)}
                      style={inlineStyle}
                      className={`font-display font-bold text-lg sm:text-xl text-slate-800 dark:text-slate-200 tracking-tight leading-normal ${formatClass}`}
                    />
                  </div>
                )}

                {/* 5. LISTA COM MARCADORES (BULLET LIST) */}
                {section.type === 'bullet' && (
                  <div className="flex items-start gap-3 py-1">
                    <span className="w-2 h-2 rounded-full bg-slate-500 dark:bg-slate-400 mt-2 shrink-0" />
                    <TextEditable
                      inputRef={el => (blockRefs.current[idx] = el)}
                      value={section}
                      placeholder="Item com marcador..."
                      onChange={(text, html) => handleUpdateBlockContent(idx, text, html)}
                      onKeyDown={e => handleKeyDown(e, idx)}
                      onFocus={() => setActiveBlockIndex(idx)}
                      style={inlineStyle}
                      className={`text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200 ${formatClass}`}
                    />
                  </div>
                )}

                {/* 6. LISTA NUMERADA */}
                {section.type === 'numbered' && (
                  <div className="flex items-start gap-2.5 py-1">
                    <span className="font-bold text-sm text-slate-500 dark:text-slate-400 mt-0.5 shrink-0 min-w-[20px]">
                      {idx + 1}.
                    </span>
                    <TextEditable
                      inputRef={el => (blockRefs.current[idx] = el)}
                      value={section}
                      placeholder="Item numerado..."
                      onChange={(text, html) => handleUpdateBlockContent(idx, text, html)}
                      onKeyDown={e => handleKeyDown(e, idx)}
                      onFocus={() => setActiveBlockIndex(idx)}
                      style={inlineStyle}
                      className={`text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200 ${formatClass}`}
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
                    <TextEditable
                      inputRef={el => (blockRefs.current[idx] = el)}
                      value={section}
                      placeholder="Meta ou tarefa..."
                      onChange={(text, html) => handleUpdateBlockContent(idx, text, html)}
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
                      <TextEditable
                        inputRef={el => (blockRefs.current[idx] = el)}
                        value={section}
                        placeholder="Destaque importante, axioma ou regra de ouro..."
                        onChange={(text, html) => handleUpdateBlockContent(idx, text, html)}
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
                    <TextEditable
                      inputRef={el => (blockRefs.current[idx] = el)}
                      value={section}
                      placeholder="Citação memorável..."
                      onChange={(text, html) => handleUpdateBlockContent(idx, text, html)}
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
                    <TextEditable
                      inputRef={el => (blockRefs.current[idx] = el)}
                      value={{ ...section, content: section.formula || section.content, contentHtml: undefined }}
                      placeholder="Ex: \int_{a}^{b} f(x)dx ou Δ = b² - 4ac..."
                      onChange={(text, html) => handleUpdateBlockContent(idx, text, html)}
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
                      <TextEditable
                        inputRef={el => (blockRefs.current[idx] = el)}
                        value={{ ...section, content: section.imageCaption || section.content, contentHtml: section.imageCaption ? escapeHtml(section.imageCaption) : undefined }}
                        placeholder="Escreva uma legenda ou fonte para a imagem..."
                        onChange={(text, html) => {
                          const updated = [...sections];
                          updated[idx] = { ...updated[idx], imageCaption: text, content: text, contentHtml: html };
                          pushToHistory(updated);
                        }}
                        onFocus={() => setActiveBlockIndex(idx)}
                        className="text-center text-xs text-slate-500 dark:text-slate-400 italic"
                      />
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          );
        })}

          {/* Retângulo de seleção (rubber-band vertical) */}
          {dragSelectRect && (
            <div
              className="pointer-events-none fixed z-[60]"
              style={{
                left: 0,
                right: 0,
                top: dragSelectRect.top,
                height: dragSelectRect.height,
                background: 'rgba(59, 130, 246, 0.15)',
                border: '1.5px solid rgba(59, 130, 246, 0.7)',
                borderRadius: 8,
              }}
            />
          )}

          {/* Indicador de posição ao arrastar blocos selecionados */}
          {moveIndicatorY !== null && (
            <div
              className="pointer-events-none fixed z-[60] h-[3px] rounded-full bg-blue-500 shadow-[0_0_0_1px_rgba(255,255,255,0.8)]"
              style={{ left: 8, right: 8, top: moveIndicatorY - 1 }}
            />
          )}
        </div>
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
