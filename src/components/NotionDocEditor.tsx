import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  CheckSquare,
  Square,
  Lightbulb,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Info,
  Code,
  Plus,
  Trash2,
  MoreVertical,
  Type,
  Check,
  Image as ImageIcon,
  Link,
  Clock,
  FileText,
  Layers,
  ExternalLink,
} from 'lucide-react';
import { DocSection, GlossaryDefinition } from '../data/disciplinesData';
import { NotionToolbar, FormattingState } from './NotionToolbar';
import { DocContextMenu } from './DocContextMenu';
import definitionsData from '../data/definitions.json';

interface NotionDocEditorProps {
  sections: DocSection[];
  glossary?: Record<string, GlossaryDefinition>;
  disciplineColor?: string;
  paperMode?: 'docs' | 'ruled' | 'grid';
  onUpdateSections: (newSections: DocSection[]) => void;
  onOpenAddGlossary?: (initialTerm?: string) => void;
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

// Glossário global (definitions.json) + glossário personalizado do documento
const GLOBAL_GLOSSARY = definitionsData as Record<string, GlossaryDefinition>;

// Classe usada nas <span> de destaque dentro do contentEditable (removidas ao salvar)
const GLOSSARY_SPAN_CLASS = 'doc-glossary-term';

const escapeRegExp = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const isAlphaNumericChar = (ch: string): boolean => /[\p{L}\p{N}_]/u.test(ch);

// Unifica glossário global e personalizado em um mapa indexado por chave minúscula
const mergeGlossary = (custom?: Record<string, GlossaryDefinition>): Record<string, GlossaryDefinition> => {
  const merged: Record<string, GlossaryDefinition> = {};
  const absorb = (map?: Record<string, GlossaryDefinition>) => {
    if (!map) return;
    for (const [key, def] of Object.entries(map)) {
      merged[key.toLowerCase()] = def;
      if (def.term) merged[def.term.toLowerCase()] = def;
    }
  };
  absorb(GLOBAL_GLOSSARY);
  absorb(custom);
  return merged;
};

// Envolve cada ocorrência dos termos do glossário com <span> de destaque azul + tooltip nativo.
// Só atinge nós de texto, preservando a formatação inline (negrito, itálico etc.).
const applyGlossaryHighlights = (html: string, glossary?: Record<string, GlossaryDefinition>): string => {
  if (!glossary || Object.keys(glossary).length === 0) return html;

  const terms = Object.keys(glossary).map(t => t.trim()).filter(Boolean);
  if (terms.length === 0) return html;

  const sorted = terms.sort((a, b) => b.length - a.length).map(escapeRegExp);
  const pattern = new RegExp(`(?:${sorted.join('|')})`, 'gi');

  const div = document.createElement('div');
  div.innerHTML = html;

  const walker = document.createTreeWalker(div, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (node.parentElement && node.parentElement.closest(`.${GLOSSARY_SPAN_CLASS}`)) continue;
    textNodes.push(node as Text);
  }

  const replacements: { node: Text; fragment: DocumentFragment }[] = [];

  for (const textNode of textNodes) {
    const text = textNode.nodeValue || '';
    if (!text) continue;

    pattern.lastIndex = 0;
    if (!pattern.test(text)) continue;

    const fragment = document.createDocumentFragment();
    let last = 0;
    let match: RegExpExecArray | null;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(text))) {
      const matched = text.slice(match.index, match.index + match[0].length);
      const definition = glossary[matched.toLowerCase()];

      const before = match.index > 0 ? text[match.index - 1] : '';
      const after = match.index + matched.length < text.length ? text[match.index + matched.length] : '';

      if (!definition || isAlphaNumericChar(before) || isAlphaNumericChar(after)) {
        if (match.index === pattern.lastIndex) pattern.lastIndex++;
        continue;
      }

      if (match.index > last) fragment.appendChild(document.createTextNode(text.slice(last, match.index)));

      const span = document.createElement('span');
      span.className = GLOSSARY_SPAN_CLASS;
      span.dataset.glossaryTerm = definition.term || matched;
      span.setAttribute('contenteditable', 'false');
      span.style.cssText = 'background-color:rgba(59,130,246,0.14);border-bottom:2px solid rgba(59,130,246,0.45);border-radius:4px;padding:0 2px;cursor:pointer;';
      span.textContent = matched;
      fragment.appendChild(span);

      last = match.index + matched.length;
      if (match.index === pattern.lastIndex) pattern.lastIndex++;
    }

    if (last < text.length) fragment.appendChild(document.createTextNode(text.slice(last)));

    if (fragment.childNodes.length > 0) {
      replacements.push({ node: textNode, fragment });
    }
  }

  for (const { node: textNode, fragment } of replacements) {
    textNode.parentNode?.replaceChild(fragment, textNode);
  }

  return div.innerHTML;
};

// Remove as <span> de destaque do glossário, preservando o texto (usado ao salvar o bloco)
const unwrapGlossaryHighlights = (html: string): string => {
  const div = document.createElement('div');
  div.innerHTML = html;
  const spans = Array.from(div.querySelectorAll(`.${GLOSSARY_SPAN_CLASS}`));
  for (const span of spans) {
    const parent = span.parentNode;
    if (!parent) continue;
    while (span.firstChild) parent.insertBefore(span.firstChild, span);
    parent.removeChild(span);
  }
  return div.innerHTML;
};

// HTML exibido no contentEditable: formatação original + destaques do glossário
const highlightedHtmlOf = (section: DocSection, glossary?: Record<string, GlossaryDefinition>): string =>
  applyGlossaryHighlights(htmlOf(section), glossary);

// Obtém a palavra única sob o cursor (usada quando o botão direito é clicado sem seleção)
const getWordAtPoint = (clientX: number, clientY: number): string => {
  try {
    const el = document.elementFromPoint(clientX, clientY);
    const contentEditable = el?.closest('[contenteditable="true"]') as HTMLElement | null;
    if (!el || !contentEditable) return '';

    const walker = document.createTreeWalker(contentEditable, NodeFilter.SHOW_TEXT);
    let n: Node | null;
    while ((n = walker.nextNode())) {
      const text = (n as Text).nodeValue || '';
      if (!text) continue;
      const host = (n as Text).parentElement as HTMLElement;
      const r = host.getBoundingClientRect();
      if (clientY >= r.top && clientY <= r.bottom && clientX >= r.left && clientX <= r.right && r.width > 0) {
        const frac = (clientX - r.left) / r.width;
        const charOffset = Math.max(0, Math.min(text.length, Math.round(frac * text.length)));
        let start = charOffset;
        let end = charOffset;
        while (start > 0 && /[\p{L}\p{N}_-]/u.test(text[start - 1])) start--;
        while (end < text.length && /[\p{L}\p{N}_-]/u.test(text[end])) end++;
        const word = text.slice(start, end).trim();
        return word.length >= 2 ? word : '';
      }
    }
    return '';
  } catch {
    return '';
  }
};

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
  onSelectionUpdate?: () => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  glossary?: Record<string, GlossaryDefinition>;
  inputRef?: (el: HTMLDivElement | null) => void;
}> = ({ value, onChange, onKeyDown, onFocus, onBlur, onSelectionUpdate, placeholder, className = '', style, glossary, inputRef }) => {
  const elRef = useRef<HTMLDivElement | null>(null);
  const focusedRef = useRef(false);
  const lastHtmlRef = useRef<string>('');
  const onChangeRef = useRef(onChange);
  const onKeyDownRef = useRef(onKeyDown);
  const onFocusRef = useRef(onFocus);
  const onBlurRef = useRef(onBlur);
  const onSelectionUpdateRef = useRef(onSelectionUpdate);
  const inputRefRef = useRef(inputRef);
  useEffect(() => {
    onChangeRef.current = onChange;
    onKeyDownRef.current = onKeyDown;
    onFocusRef.current = onFocus;
    onBlurRef.current = onBlur;
    onSelectionUpdateRef.current = onSelectionUpdate;
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
    const nextHtml = highlightedHtmlOf(value, glossary);
    if (!focusedRef.current && nextHtml !== lastHtmlRef.current) {
      el.innerHTML = nextHtml;
      lastHtmlRef.current = nextHtml;
    }
    resize();
  }, [value, resize, glossary]);

  useEffect(() => {
    const el = elRef.current;
    if (el && !el.innerHTML && !lastHtmlRef.current) {
      const h = highlightedHtmlOf(value, glossary);
      el.innerHTML = h;
      lastHtmlRef.current = h;
    }
    resize();
  }, [value, resize, glossary]);

  const commit = () => {
    const el = elRef.current;
    if (!el) return;
    const html = el.innerHTML;
    lastHtmlRef.current = html;
    const cleanHtml = unwrapGlossaryHighlights(html);
    onChangeRef.current(stripHtml(cleanHtml), cleanHtml);
    resize();
    if (onSelectionUpdateRef.current) {
      onSelectionUpdateRef.current();
    }
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
      onKeyDown={e => {
        if (onKeyDownRef.current) onKeyDownRef.current(e);
        if (onSelectionUpdateRef.current) setTimeout(() => onSelectionUpdateRef.current?.(), 10);
      }}
      onKeyUp={() => {
        if (onSelectionUpdateRef.current) onSelectionUpdateRef.current();
      }}
      onMouseUp={() => {
        if (onSelectionUpdateRef.current) onSelectionUpdateRef.current();
      }}
      onFocus={() => {
        focusedRef.current = true;
        if (onFocusRef.current) onFocusRef.current();
        if (onSelectionUpdateRef.current) onSelectionUpdateRef.current();
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
  glossary,
  onUpdateSections,
  onOpenAddGlossary = (_initialTerm?: string) => {},
}) => {
  // Glossary mergido (global + personalizado), recomputado quando o glossário muda
  const glossaryMap = useMemo(() => mergeGlossary(glossary), [glossary]);
  // Focus & Selection States
  const [activeBlockIndex, setActiveBlockIndex] = useState<number>(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeMenuBlockIndex, setActiveMenuBlockIndex] = useState<number | null>(null);

  // Tooltip de glossário (popover acima do termo, só no hover)
  const [glossaryTip, setGlossaryTip] = useState<{
    definition: GlossaryDefinition | null;
    x: number;
    y: number;
  } | null>(null);
  const glossaryTipIdRef = useRef<string>('');

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
  const [isDraggingActive, setIsDraggingActive] = useState(false);

  // Manage body userSelect cleanly via effect
  useEffect(() => {
    if (isDraggingActive) {
      document.body.style.userSelect = 'none';
      return () => {
        document.body.style.userSelect = '';
      };
    } else {
      document.body.style.userSelect = '';
    }
  }, [isDraggingActive]);

  // History Undo/Redo State
  const [history, setHistory] = useState<DocSection[][]>([sections]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Slash menu state
  const [slashMenuIndex, setSlashMenuIndex] = useState<number | null>(null);
  const [slashQuery, setSlashQuery] = useState('');
  const [selectedSlashItem, setSelectedSlashItem] = useState(0);

  const SLASH_ITEMS: { type: DocSection['type']; label: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; color: string }[] = [
    { type: 'paragraph', label: 'Texto Normal', icon: Type, color: '#94a3b8' },
    { type: 'h1', label: 'Título 1 (H1)', icon: Heading1, color: '#3b82f6' },
    { type: 'h2', label: 'Título 2 (H2)', icon: Heading2, color: '#6366f1' },
    { type: 'h3', label: 'Título 3 (H3)', icon: Heading3, color: '#8b5cf6' },
    { type: 'bullet', label: 'Lista com Marcadores', icon: List, color: '#10b981' },
    { type: 'numbered', label: 'Lista Numerada', icon: ListOrdered, color: '#0ea5e9' },
    { type: 'quote', label: 'Citação', icon: Quote, color: '#f59e0b' },
    { type: 'code', label: 'Bloco de Código', icon: Code, color: '#ef4444' },
    { type: 'divider', label: 'Divisor', icon: Minus, color: '#64748b' },
  ];
  const filteredSlashItems = slashQuery
    ? SLASH_ITEMS.filter(it => it.label.toLowerCase().includes(slashQuery.toLowerCase()))
    : SLASH_ITEMS;

  // Context Menu State (botão direito: Copiar, Colar, Definir Conceito, Corretor Ortográfico)
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    selectedText: string;
    targetBlockIndex: number;
    conceptDefined: boolean;
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    selectedText: '',
    targetBlockIndex: 0,
    conceptDefined: false,
  });

  const handleContextMenu = (e: React.MouseEvent, blockIndex?: number) => {
    const sel = window.getSelection();
    let selectedStr = sel ? sel.toString().trim() : '';

    const targetIdx = typeof blockIndex === 'number' ? blockIndex : activeBlockIndex;

    if (!selectedStr) {
      selectedStr = getWordAtPoint(e.clientX, e.clientY);
    }

    e.preventDefault();
    e.stopPropagation();

    const conceptDefined = !!selectedStr && !!glossaryMap[selectedStr.toLowerCase()];

    setContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      selectedText: selectedStr,
      targetBlockIndex: targetIdx,
      conceptDefined,
    });
  };

  // Mostra o popover de glossário instantaneamente ao passar o mouse sobre um termo
  const handleGlossaryTip = (e: React.MouseEvent) => {
    const under = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    const span = under?.closest(`.${GLOSSARY_SPAN_CLASS}`) as HTMLElement | null;
    if (!span) {
      if (glossaryTipIdRef.current) {
        glossaryTipIdRef.current = '';
        setGlossaryTip(null);
      }
      return;
    }
    const term = span.dataset.glossaryTerm || span.textContent || '';
    if (glossaryTipIdRef.current === term) return;
    const definition = glossaryMap[term.toLowerCase()];
    if (!definition) return;
    glossaryTipIdRef.current = term;
    const rect = span.getBoundingClientRect();
    setGlossaryTip({
      definition,
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  };

  const handleGlossaryTipHide = () => {
    glossaryTipIdRef.current = '';
    setGlossaryTip(null);
  };

  const handleContextMenuPaste = async () => {
      try {
        const text = await navigator.clipboard.readText();
      if (!text) return;
      const targetIdx = contextMenu.targetBlockIndex;
      const current = sections[targetIdx];
      if (current) {
        const updated = [...sections];
        const newContent = (current.content || '') + (current.content ? ' ' : '') + text;
        updated[targetIdx] = { ...current, content: newContent, contentHtml: undefined };
        pushToHistory(updated);
      }
    } catch (err) {
      console.warn('Não foi possível acessar a área de transferência:', err);
    }
  };

  const handleContextMenuDefine = (term: string) => {
    if (onOpenAddGlossary) {
      onOpenAddGlossary(term);
    }
  };

  const handleContextMenuCorrection = (originalWord: string, replacement: string) => {
    const targetIdx = contextMenu.targetBlockIndex;
    const current = sections[targetIdx];
    if (!current) return;

    const regex = new RegExp(`\\b${originalWord}\\b`, 'i');
    let newContent = current.content;
    if (regex.test(newContent)) {
      newContent = newContent.replace(regex, replacement);
    } else {
      newContent = newContent.split(originalWord).join(replacement);
    }

    let newHtml = current.contentHtml;
    if (newHtml) {
      if (regex.test(newHtml)) {
        newHtml = newHtml.replace(regex, replacement);
      } else {
        newHtml = newHtml.split(originalWord).join(replacement);
      }
    }

    const updated = [...sections];
    updated[targetIdx] = {
      ...current,
      content: newContent,
      contentHtml: newHtml,
    };
    pushToHistory(updated);

    setContextMenu(prev => ({
      ...prev,
      selectedText: prev.selectedText.replace(originalWord, replacement),
    }));
  };

  // Refs for focusing
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);
  const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const imageResizeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const imageDragRef = useRef<{
    blockIdx: number;
    pointerId: number;
    startX: number;
    startPct: number;
    containerWidth: number;
  } | null>(null);

  useEffect(() => {
    return () => {
      if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
      if (imageResizeDebounceRef.current) clearTimeout(imageResizeDebounceRef.current);
    };
  }, []);

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

  // Inline formatting detection state (for selection or cursor in contentEditable)
  const [inlineFormatting, setInlineFormatting] = useState<{
    isBold: boolean;
    isItalic: boolean;
    isUnderline: boolean;
    isStrikethrough: boolean;
    textColor?: string;
    highlightColor?: string;
  }>({
    isBold: false,
    isItalic: false,
    isUnderline: false,
    isStrikethrough: false,
  });

  const updateSelectionFormatting = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    let isBold = false;
    let isItalic = false;
    let isUnderline = false;
    let isStrikethrough = false;
    let textColor = '';
    let highlightColor = '';

    try {
      isBold = document.queryCommandState('bold');
      isItalic = document.queryCommandState('italic');
      isUnderline = document.queryCommandState('underline');
      isStrikethrough = document.queryCommandState('strikeThrough');
    } catch {
      // ignore
    }

    // Inspect anchor and focus nodes inside contentEditable
    const nodes = [sel.anchorNode, sel.focusNode];
    for (const node of nodes) {
      let curr: Node | null = node;
      while (curr && curr !== document.body) {
        if (curr.nodeType === Node.ELEMENT_NODE) {
          const el = curr as HTMLElement;
          if (el.getAttribute('contenteditable') === 'true') {
            break;
          }
          const tag = el.tagName.toLowerCase();
          if (tag === 'b' || tag === 'strong') isBold = true;
          if (tag === 'i' || tag === 'em') isItalic = true;
          if (tag === 'u') isUnderline = true;
          if (tag === 's' || tag === 'strike' || tag === 'del') isStrikethrough = true;

          const weight = el.style.fontWeight || window.getComputedStyle(el).fontWeight;
          if (weight === 'bold' || parseInt(weight, 10) >= 600) isBold = true;
          const fontStyle = el.style.fontStyle || window.getComputedStyle(el).fontStyle;
          if (fontStyle === 'italic') isItalic = true;
          const decor = el.style.textDecoration || window.getComputedStyle(el).textDecorationLine;
          if (decor && decor.includes('underline')) isUnderline = true;
          if (decor && (decor.includes('line-through') || decor.includes('strike'))) isStrikethrough = true;

          if (el.style.color) textColor = el.style.color;
          if (el.style.backgroundColor && el.style.backgroundColor !== 'transparent' && el.style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
            highlightColor = el.style.backgroundColor;
          }
        }
        curr = curr.parentNode;
      }
    }

    setInlineFormatting({
      isBold,
      isItalic,
      isUnderline,
      isStrikethrough,
      textColor,
      highlightColor,
    });
  }, []);

  // Listen to document-wide selection changes
  useEffect(() => {
    const handleSelectionChange = () => {
      updateSelectionFormatting();
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [updateSelectionFormatting]);

  // Current active formatting state based on selected block and active selection
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
    isBold: inlineFormatting.isBold || !!currentBlock.isBold || currentBlock.type === 'h1' || currentBlock.type === 'h2' || currentBlock.type === 'h3',
    isItalic: inlineFormatting.isItalic || !!currentBlock.isItalic || currentBlock.type === 'quote',
    isUnderline: inlineFormatting.isUnderline || !!currentBlock.isUnderline,
    isStrikethrough: inlineFormatting.isStrikethrough || !!currentBlock.isStrikethrough,
    textColor: inlineFormatting.textColor || currentBlock.textColor || '',
    highlightColor: inlineFormatting.highlightColor || currentBlock.highlightColor || '',
  };

  // Apply format to active block or selection
  const handleApplyFormat = (format: Partial<DocSection>) => {
    if (activeBlockIndex < 0 || activeBlockIndex >= sections.length) return;

    const activeEl = blockRefs.current[activeBlockIndex];
    const sel = window.getSelection();
    const isFocusInActive = activeEl && (document.activeElement === activeEl || (sel && sel.rangeCount > 0 && activeEl.contains(sel.anchorNode)));

    const hasInlineFormatKey = 
      format.isBold !== undefined || 
      format.isItalic !== undefined || 
      format.isUnderline !== undefined || 
      format.isStrikethrough !== undefined || 
      format.textColor !== undefined || 
      format.highlightColor !== undefined;

    if (hasInlineFormatKey && isFocusInActive && activeEl) {
      if (document.activeElement !== activeEl) {
        activeEl.focus();
      }

      if (format.isBold !== undefined) {
        document.execCommand('bold');
      }
      if (format.isItalic !== undefined) {
        document.execCommand('italic');
      }
      if (format.isUnderline !== undefined) {
        document.execCommand('underline');
      }
      if (format.isStrikethrough !== undefined) {
        document.execCommand('strikeThrough');
      }
      if (format.textColor !== undefined) {
        if (format.textColor) {
          document.execCommand('foreColor', false, format.textColor);
        } else {
          document.execCommand('removeFormat', false, 'foreColor');
        }
      }
      if (format.highlightColor !== undefined) {
        if (format.highlightColor) {
          document.execCommand('hiliteColor', false, format.highlightColor);
        } else {
          document.execCommand('removeFormat', false, 'hiliteColor');
        }
      }

      const newHtml = activeEl.innerHTML;
      const newText = stripHtml(newHtml);
      const updated = [...sections];
      updated[activeBlockIndex] = {
        ...updated[activeBlockIndex],
        content: newText,
        contentHtml: newHtml,
        ...(format.type ? { type: format.type } : {}),
        ...(format.align ? { align: format.align } : {}),
        ...(format.fontSize ? { fontSize: format.fontSize } : {}),
      };
      pushToHistory(updated);
      setTimeout(updateSelectionFormatting, 10);
      return;
    }

    const updated = [...sections];
    updated[activeBlockIndex] = {
      ...updated[activeBlockIndex],
      ...format,
      // If type changed to heading, sync heading field
      heading: (format.type === 'h1' || format.type === 'h2' || format.type === 'h3') 
        ? updated[activeBlockIndex].content 
        : (format.type ? '' : updated[activeBlockIndex].heading),
    };

    pushToHistory(updated);
    setTimeout(updateSelectionFormatting, 10);
  };

  // Clear format of current block
  const handleClearFormatting = () => {
    if (activeBlockIndex < 0 || activeBlockIndex >= sections.length) return;

    const activeEl = blockRefs.current[activeBlockIndex];
    if (activeEl) {
      document.execCommand('removeFormat', false);
      const newHtml = activeEl.innerHTML;
      const newText = stripHtml(newHtml);
      const updated = [...sections];
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
        content: newText,
        contentHtml: newHtml,
      };
      pushToHistory(updated);
      setTimeout(updateSelectionFormatting, 10);
      return;
    }

    const updated = [...sections];
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
    setTimeout(updateSelectionFormatting, 10);
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

  // Insere um emoji selecionado no bloco ativo ou cria um novo bloco
  const handleInsertEmoji = (emoji: string) => {
    if (sections.length === 0) {
      const newBlock: DocSection = {
        id: `s-${Date.now()}`,
        type: 'paragraph',
        content: emoji,
        contentHtml: emoji,
        heading: '',
        align: 'left',
        fontSize: 'base'
      };
      pushToHistory([newBlock]);
      setActiveBlockIndex(0);
      return;
    }

    const targetIdx = (activeBlockIndex >= 0 && activeBlockIndex < sections.length) ? activeBlockIndex : sections.length - 1;
    const currentBlock = sections[targetIdx];
    const updated = [...sections];

    const currentText = currentBlock.content || '';
    const newText = currentText ? `${currentText} ${emoji}` : emoji;
    const newHtml = currentBlock.contentHtml ? `${currentBlock.contentHtml}&nbsp;${emoji}` : newText;

    updated[targetIdx] = {
      ...currentBlock,
      content: newText,
      contentHtml: newHtml,
      heading: (currentBlock.type === 'h1' || currentBlock.type === 'h2' || currentBlock.type === 'h3') ? newText : currentBlock.heading,
    };

    pushToHistory(updated);
    setTimeout(() => {
      blockRefs.current[targetIdx]?.focus();
    }, 40);
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

    if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
    typingDebounceRef.current = setTimeout(() => {
      pushToHistory(updated);
    }, 600);
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
    // Keyboard shortcuts (Ctrl+B, Ctrl+I, Ctrl+U, Ctrl+Shift+X for strikethrough)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      document.execCommand('bold');
      const activeEl = blockRefs.current[idx];
      if (activeEl) {
        const html = activeEl.innerHTML;
        handleUpdateBlockContent(idx, stripHtml(html), html);
      }
      setTimeout(updateSelectionFormatting, 10);
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      document.execCommand('italic');
      const activeEl = blockRefs.current[idx];
      if (activeEl) {
        const html = activeEl.innerHTML;
        handleUpdateBlockContent(idx, stripHtml(html), html);
      }
      setTimeout(updateSelectionFormatting, 10);
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') {
      e.preventDefault();
      document.execCommand('underline');
      const activeEl = blockRefs.current[idx];
      if (activeEl) {
        const html = activeEl.innerHTML;
        handleUpdateBlockContent(idx, stripHtml(html), html);
      }
      setTimeout(updateSelectionFormatting, 10);
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'x') {
      e.preventDefault();
      document.execCommand('strikeThrough');
      const activeEl = blockRefs.current[idx];
      if (activeEl) {
        const html = activeEl.innerHTML;
        handleUpdateBlockContent(idx, stripHtml(html), html);
      }
      setTimeout(updateSelectionFormatting, 10);
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
      const itemCount = Math.max(1, filteredSlashItems.length);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSlashItem(prev => (prev + 1) % itemCount);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSlashItem(prev => (prev - 1 + itemCount) % itemCount);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredSlashItems.length > 0) {
          convertBlockType(idx, filteredSlashItems[selectedSlashItem % filteredSlashItems.length].type);
        } else {
          setSlashMenuIndex(null);
        }
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
    setIsDraggingActive(false);
  };

  // Dois modos de arrasto: 'marquee' (selecionar vários) e 'move' (arrastar selecionados)
  const onEditorMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const t = e.target as HTMLElement;

    // Imagens: interações sobre o corpo/controles da imagem NUNCA disparam marquee ou
    // reordenação de bloco (evita fantasma do navegador e movimentos acidentais).
    // Para mover a imagem use a alcinha da esquerda do bloco (segurador) ou Ctrl+clique + arraste de outro bloco.
    if (t.closest(
      '[data-block-type="image"] img, ' +
      '[data-block-type="image"] .image-resize-handle, ' +
      '[data-block-type="image"] .image-resize-controls, ' +
      '[data-block-type="image"] .img-error-fallback'
    )) return;

    // Se começar sobre um bloco JÁ selecionado e houver seleção => arrastar para mover
    const blockEl = t.closest('[data-block-id]') as HTMLElement | null;
    const blockId = blockEl?.getAttribute('data-block-id') || '';
    if (blockEl && selectedBlockIds.includes(blockId) && selectedBlockIds.length > 0) {
      dragModeRef.current = 'move';
      didBlockDragRef.current = false;
      moveDragRef.current = { startY: e.clientY, insertion: null };
      setIsDraggingActive(true);
      return;
    }

    // Dentro de texto/interativo => deixa o comportamento padrão (editar, clicar botão)
    if (t.closest('[contenteditable="true"], button, input, textarea, select')) return;

    // Qualquer outro lugar da página (área vazia, margens, entre blocos) => marquee
    dragModeRef.current = 'marquee';
    didBlockDragRef.current = false;
    dragSelectRef.current = { startY: e.clientY, moved: false };
    setIsDraggingActive(true);
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
    setIsDraggingActive(false);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  // Live resize preview + single debounced undo entry
  const handleImageResize = (blockIdx: number, size: number) => {
    const clamped = Math.min(100, Math.max(10, size));
    const updated = [...sections];
    updated[blockIdx] = { ...updated[blockIdx], imageSize: clamped };
    onUpdateSections(updated);
    if (imageResizeDebounceRef.current) clearTimeout(imageResizeDebounceRef.current);
    imageResizeDebounceRef.current = setTimeout(() => pushToHistory(updated), 600);
  };

  // Drag-to-resize (like Word): grab the corner handle and pull sideways
  const handleImageResizePointerDown = (e: React.PointerEvent<HTMLSpanElement>, blockIdx: number) => {
    e.preventDefault();
    e.stopPropagation();
    const container = blockListRef.current;
    if (!container) return;
    const current = sections[blockIdx];
    imageDragRef.current = {
      blockIdx,
      pointerId: e.pointerId,
      startX: e.clientX,
      startPct: current?.imageSize ?? 100,
      containerWidth: container.clientWidth,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleImageResizePointerMove = (e: React.PointerEvent<HTMLSpanElement>) => {
    const drag = imageDragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    e.preventDefault();
    const dx = e.clientX - drag.startX;
    const newPct = Math.round(drag.startPct + (dx / drag.containerWidth) * 100);
    handleImageResize(drag.blockIdx, newPct);
  };

  const finishImageResizeDrag = (e: React.PointerEvent<HTMLSpanElement>) => {
    const drag = imageDragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    e.preventDefault();
    if (imageResizeDebounceRef.current) clearTimeout(imageResizeDebounceRef.current);
    const dx = e.clientX - drag.startX;
    const clamped = Math.min(100, Math.max(10, Math.round(drag.startPct + (dx / drag.containerWidth) * 100)));
    const updated = [...sections];
    updated[drag.blockIdx] = { ...updated[drag.blockIdx], imageSize: clamped };
    onUpdateSections(updated);
    pushToHistory(updated);
    imageDragRef.current = null;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const cancelImageResizeDrag = (e: React.PointerEvent<HTMLSpanElement>) => {
    if (!imageDragRef.current || imageDragRef.current.pointerId !== e.pointerId) return;
    imageDragRef.current = null;
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      }
    } catch {
      /* ignore */
    }
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
      onMouseMove={(e) => { onEditorMouseMove(e); handleGlossaryTip(e); }}
      onMouseUp={onEditorMouseUp}
      onMouseLeave={() => { handleGlossaryTipHide(); if (dragModeRef.current) onEditorMouseUp(); }}
      onContextMenu={(e) => handleContextMenu(e)}
    >
      
      {/* 1. BARRA DE FERRAMENTAS PRINCIPAL ESTILO WORD (FIXA NO TOPO DO DOCUMENTO) */}
      <NotionToolbar
        currentFormatting={currentFormatting}
        onApplyFormat={handleApplyFormat}
        onAddBlock={handleAddBlock}
        onOpenAddGlossary={onOpenAddGlossary}
        onInsertEmoji={handleInsertEmoji}
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

          let numberedNumber = 0;
          if (section.type === 'numbered') {
            for (let i = idx; i >= 0; i--) {
              if (sections[i].type === 'numbered') numberedNumber++;
              else break;
            }
          }

          const imagePct = section.type === 'image' ? (section.imageSize ?? 100) : 100;

          return (
            <motion.div
              key={section.id || idx}
              id={`doc-block-${idx}`}
              data-block-id={section.id}
              data-block-type={section.type || 'paragraph'}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              onContextMenu={(e) => handleContextMenu(e, idx)}
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
              {/* Slash Command Menu */}
              {slashMenuIndex === idx && filteredSlashItems.length > 0 && (
                <div className="absolute left-6 top-10 z-50 w-60 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-1.5 text-xs animate-in fade-in zoom-in-95 max-h-80 overflow-y-auto">
                  {filteredSlashItems.map((item, i) => (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => {
                        convertBlockType(idx, item.type);
                        setSlashMenuIndex(null);
                      }}
                      onMouseEnter={() => setSelectedSlashItem(i)}
                      className={`w-full px-3 py-2 text-left flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 ${
                        i === selectedSlashItem % Math.max(1, filteredSlashItems.length) ? 'bg-slate-100 dark:bg-slate-800' : ''
                      }`}
                    >
                      <item.icon className="w-4 h-4" style={{ color: item.color }} />
                      <span>{item.label}</span>
                    </button>
                  ))}
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
                  <div className="py-1 min-h-[1.75rem]">
                    <TextEditable
                      inputRef={el => (blockRefs.current[idx] = el)}
                      value={section}
                      placeholder="Digite '/' para comandos ou comece a escrever..."
                      onChange={(text, html) => handleUpdateBlockContent(idx, text, html)}
                      onKeyDown={e => handleKeyDown(e, idx)}
                      onFocus={() => {
                        setActiveBlockIndex(idx);
                        updateSelectionFormatting();
                      }}
                      onSelectionUpdate={updateSelectionFormatting}
                      style={inlineStyle}
                      glossary={glossaryMap}
                      className={`text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200 font-normal ${formatClass}`}
                    />
                  </div>
                )}

                {/* 2. TÍTULO 1 (H1) COM QUEBRA DE LINHA NATURAL */}
                {section.type === 'h1' && (
                  <div className="pt-4 pb-1 min-h-[2.5rem]">
                    <TextEditable
                      inputRef={el => (blockRefs.current[idx] = el)}
                      value={section}
                      placeholder="Título Principal H1..."
                      onChange={(text, html) => handleUpdateBlockContent(idx, text, html)}
                      onKeyDown={e => handleKeyDown(e, idx)}
                      onFocus={() => {
                        setActiveBlockIndex(idx);
                        updateSelectionFormatting();
                      }}
                      onSelectionUpdate={updateSelectionFormatting}
                      style={inlineStyle}
                      glossary={glossaryMap}
                      className={`font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight leading-tight ${formatClass}`}
                    />
                  </div>
                )}

                {/* 3. TÍTULO 2 (H2) */}
                {section.type === 'h2' && (
                  <div className="pt-3 pb-1 min-h-[2.25rem]">
                    <TextEditable
                      inputRef={el => (blockRefs.current[idx] = el)}
                      value={section}
                      placeholder="Subtítulo H2..."
                      onChange={(text, html) => handleUpdateBlockContent(idx, text, html)}
                      onKeyDown={e => handleKeyDown(e, idx)}
                      onFocus={() => {
                        setActiveBlockIndex(idx);
                        updateSelectionFormatting();
                      }}
                      onSelectionUpdate={updateSelectionFormatting}
                      style={inlineStyle}
                      glossary={glossaryMap}
                      className={`font-display font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight leading-snug ${formatClass}`}
                    />
                  </div>
                )}

                {/* 4. TÍTULO 3 (H3) */}
                {section.type === 'h3' && (
                  <div className="pt-2 pb-0.5 min-h-[2rem]">
                    <TextEditable
                      inputRef={el => (blockRefs.current[idx] = el)}
                      value={section}
                      placeholder="Título 3..."
                      onChange={(text, html) => handleUpdateBlockContent(idx, text, html)}
                      onKeyDown={e => handleKeyDown(e, idx)}
                      onFocus={() => {
                        setActiveBlockIndex(idx);
                        updateSelectionFormatting();
                      }}
                      onSelectionUpdate={updateSelectionFormatting}
                      style={inlineStyle}
                      glossary={glossaryMap}
                      className={`font-display font-bold text-lg sm:text-xl text-slate-800 dark:text-slate-200 tracking-tight leading-normal ${formatClass}`}
                    />
                  </div>
                )}

                {/* 5. LISTA COM MARCADORES (BULLET LIST) */}
                {section.type === 'bullet' && (
                  <div className="flex items-start gap-3 py-1">
                    <span className="w-2 h-2 rounded-full bg-slate-500 dark:bg-slate-400 mt-2 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <TextEditable
                        inputRef={el => (blockRefs.current[idx] = el)}
                        value={section}
                        placeholder="Item com marcador..."
                        onChange={(text, html) => handleUpdateBlockContent(idx, text, html)}
                        onKeyDown={e => handleKeyDown(e, idx)}
                        onFocus={() => {
                          setActiveBlockIndex(idx);
                          updateSelectionFormatting();
                        }}
                        onSelectionUpdate={updateSelectionFormatting}
                        style={inlineStyle}
                        glossary={glossaryMap}
                        className={`text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200 ${formatClass}`}
                      />
                    </div>
                  </div>
                )}

                {/* 6. LISTA NUMERADA */}
                {section.type === 'numbered' && (
                  <div className="flex items-start gap-2.5 py-1">
                    <span className="font-bold text-sm text-slate-500 dark:text-slate-400 mt-0.5 shrink-0 min-w-[20px]">
                      {numberedNumber}.
                    </span>
                    <div className="flex-1 min-w-0">
                      <TextEditable
                        inputRef={el => (blockRefs.current[idx] = el)}
                        value={section}
                        placeholder="Item numerado..."
                        onChange={(text, html) => handleUpdateBlockContent(idx, text, html)}
                        onKeyDown={e => handleKeyDown(e, idx)}
                        onFocus={() => {
                          setActiveBlockIndex(idx);
                          updateSelectionFormatting();
                        }}
                        onSelectionUpdate={updateSelectionFormatting}
                        style={inlineStyle}
                        glossary={glossaryMap}
                        className={`text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200 ${formatClass}`}
                      />
                    </div>
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
                    <div className="flex-1 min-w-0">
                      <TextEditable
                        inputRef={el => (blockRefs.current[idx] = el)}
                        value={section}
                        placeholder="Meta ou tarefa..."
                        onChange={(text, html) => handleUpdateBlockContent(idx, text, html)}
                        onKeyDown={e => handleKeyDown(e, idx)}
                        onFocus={() => {
                          setActiveBlockIndex(idx);
                          updateSelectionFormatting();
                        }}
                        onSelectionUpdate={updateSelectionFormatting}
                        style={inlineStyle}
                        glossary={glossaryMap}
                        className={`text-sm sm:text-base leading-relaxed transition-all ${
                          section.checked
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-800 dark:text-slate-200'
                        } ${formatClass}`}
                      />
                    </div>
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
                        onFocus={() => {
                          setActiveBlockIndex(idx);
                          updateSelectionFormatting();
                        }}
                        onSelectionUpdate={updateSelectionFormatting}
                        style={inlineStyle}
                        glossary={glossaryMap}
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
                      onFocus={() => {
                        setActiveBlockIndex(idx);
                        updateSelectionFormatting();
                      }}
                      onSelectionUpdate={updateSelectionFormatting}
                      style={inlineStyle}
                      glossary={glossaryMap}
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
                  <div className="my-4 py-2 flex items-center justify-center clear-both">
                    <div className="w-full h-px bg-slate-200 dark:border-slate-800 dark:bg-slate-800" />
                  </div>
                )}

                {/* 13. IMAGEM POR URL */}
                {section.type === 'image' && (
                  <div className="my-4 w-full">
                    {section.imageUrl ? (
                      <figure
                        className="relative group/img max-w-full"
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                        data-block-type="image"
                        style={{
                          width: `${imagePct}%`,
                          ...(section.align === 'center'
                            ? { marginLeft: 'auto', marginRight: 'auto' }
                            : section.align === 'right'
                              ? { marginLeft: 'auto', marginRight: 0 }
                              : {}),
                        }}
                      >
                        <div className="w-full rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm bg-slate-50 dark:bg-slate-900/50">
                          <img
                            src={section.imageUrl}
                            alt={section.imageCaption || section.imageAlt || 'Imagem do documento'}
                            draggable={false}
                            onDragStart={(e) => e.preventDefault()}
                            onPointerDown={(e) => e.stopPropagation()}
                            className="w-auto max-w-full object-contain rounded-2xl select-none"
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

                          {/* Alça de redimensionar (arrastar como no Word) */}
                          <span
                            role="slider"
                            aria-label="Redimensionar imagem arrastando"
                            aria-valuemin={10}
                            aria-valuemax={100}
                            aria-valuenow={imagePct}
                            onPointerDown={(e) => handleImageResizePointerDown(e, idx)}
                            onPointerMove={handleImageResizePointerMove}
                            onPointerUp={finishImageResizeDrag}
                            onPointerCancel={cancelImageResizeDrag}
                            onLostPointerCapture={cancelImageResizeDrag}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onMouseDown={(e) => e.stopPropagation()}
                            className={`image-resize-handle absolute bottom-1.5 right-1.5 w-5 h-5 rounded-full bg-white dark:bg-slate-800 border border-pink-400/80 shadow-md cursor-nwse-resize touch-none select-none flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity z-10 ${
                              isFocused || isHovered ? 'opacity-100' : ''
                            }`}
                            title="Arraste para aumentar ou diminuir a imagem"
                          >
                            <span className="w-2.5 h-2.5 rounded-[3px] border-b-2 border-r-2 border-pink-500 pointer-events-none" />
                          </span>
                        </div>
                      </figure>
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

      {/* Tooltip Conceitual (hover bonito, instantâneo, acima do termo) */}
      {glossaryTip && glossaryTip.definition && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.96 }}
          transition={{ type: 'spring', damping: 26, stiffness: 500, mass: 0.4 }}
          className="fixed z-[99999] w-72 p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-blue-200/80 dark:border-blue-900/80 shadow-2xl text-left pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{ left: glossaryTip.x, top: glossaryTip.y - 14 }}
        >
          <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/30 shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white truncate">
                {glossaryTip.definition.term}
              </h4>
            </div>
            {glossaryTip.definition.category && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 shrink-0">
                {glossaryTip.definition.category}
              </span>
            )}
          </div>

          {glossaryTip.definition.imageUrl && (
            <img
              src={glossaryTip.definition.imageUrl}
              alt={glossaryTip.definition.term}
              className="w-full h-36 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shadow-md mb-2.5"
              onError={(e) => { (e.currentTarget.style.display = 'none'); }}
            />
          )}

          {glossaryTip.definition.definition && (
            <>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Significado Acadêmico:
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
                {glossaryTip.definition.definition}
              </p>
            </>
          )}

          {glossaryTip.definition.example && (
            <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-300 bg-blue-50/60 dark:bg-blue-950/30 p-2 rounded-xl border border-blue-100/50 dark:border-blue-900/40">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <p className="italic leading-snug">
                <strong className="not-italic text-slate-900 dark:text-white font-semibold">Aplicação:</strong> {glossaryTip.definition.example}
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Menu de Contexto Inteligente ao Clicar com Botão Direito no Documento */}
      <DocContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        selectedText={contextMenu.selectedText}
        conceptExists={contextMenu.conceptDefined}
        onClose={() => setContextMenu(prev => ({ ...prev, isOpen: false }))}
        onPaste={handleContextMenuPaste}
        onDefineConcept={handleContextMenuDefine}
        onApplyCorrection={handleContextMenuCorrection}
      />

    </div>
  );
};
