import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCreateBlockNote, useActiveStyles, useSelectedBlocks } from '@blocknote/react';
import { SuggestionMenu } from '@blocknote/core';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import { motion } from 'motion/react';
import { TextSelection } from 'prosemirror-state';
import type { NotebookDoc, DocSection, GlossaryDefinition } from '../data/disciplinesData';
import { sectionsToBlocks, blocksToSections } from '../utils/docConverter';
import type { PartialBlocks } from '../utils/docConverter';
import { countWordsOfSections } from '../utils/docConverter';
import { FileText, Sparkles, Lightbulb } from 'lucide-react';
import SpellContextMenu from './SpellContextMenu';
import type { SpellPopupState } from './SpellContextMenu';
import { SpecialCharPicker } from './SpecialCharPicker';
import { playSound } from '../utils/sounds';
import { createSpellPlugin, getSpellMatches, clearSpellMatches, spellKey } from '../lib/spellcheckPlugin';
import type { MappedMatch } from '../lib/spellcheckPlugin';
import { createGlossaryPlugin, glossaryKey, setGlossaryTerms } from '../lib/glossaryPlugin';
import { mergeGlossary } from '../lib/glossary';
import {
  createSpellCheckStore,
  loadIgnoredWords,
  saveIgnoredWords,
  runSpellCheck,
  suggestForWord,
} from '../lib/spellcheck';
import type { SpellCheckStatus } from '../lib/spellcheck';
import '../styles/docEditor.css';

interface BlockNoteDocEditorProps {
  doc: NotebookDoc;
  spellEnabled: boolean;
  onToggleSpell: () => void;
  onUpdateTitle: (title: string) => void;
  onUpdateSections: (sections: DocSection[]) => void;
  onDefineGlossary: (term: string) => void;
  onExit: () => void;
  glossary?: Record<string, GlossaryDefinition>;
}

function ToolbarBtn({ active, title, onClick, children }: {
  active?: boolean;
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      className={`doc-toolbar-btn ${active ? 'active' : ''}`}
      title={title}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function ToolbarSep() {
  return <div className="doc-toolbar-sep" />;
}

export function BlockNoteDocEditor({
  doc,
  spellEnabled,
  onToggleSpell,
  onUpdateTitle,
  onUpdateSections,
  onDefineGlossary,
  onExit,
  glossary,
}: BlockNoteDocEditorProps) {
  const sections: DocSection[] = doc.sections || [];
  const initialContent: PartialBlocks = sections.length > 0
    ? sectionsToBlocks(sections)
    : [{
        type: 'heading',
        props: { level: 1 },
        content: [{ type: 'text', text: doc.title || '', styles: {} }],
      }];

  const editor = useCreateBlockNote({ initialContent });

  const activeStyles = useActiveStyles(editor);
  const selectedBlocks = useSelectedBlocks(editor);
  const activeBlock = selectedBlocks[0];

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const emitRef = useRef<() => void>(() => {});

  const [spellPopup, setSpellPopup] = useState<SpellPopupState | null>(null);
  const [showCharPicker, setShowCharPicker] = useState(false);
  const charSelectionRef = useRef<{ from: number; to: number } | null>(null);
  const [spellSuggestions, setSpellSuggestions] = useState<string[]>([]);
  const [spellMessage, setSpellMessage] = useState('');
  const [spellLoading, setSpellLoading] = useState(false);
  const spellStoreRef = useRef(createSpellCheckStore());
  const spellCheckTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [spellDebug, setSpellDebug] = useState('');

  const glossaryMap = useMemo(() => mergeGlossary(glossary), [glossary]);
  const glossaryMapRef = useRef(glossaryMap);
  const [glossaryTip, setGlossaryTip] = useState<{
    x: number;
    y: number;
    definition: GlossaryDefinition;
  } | null>(null);
  const glossaryTipTermRef = useRef('');

  useEffect(() => {
    spellStoreRef.current.ignored = loadIgnoredWords(doc.id);
  }, [doc.id]);

  useEffect(() => {
    glossaryMapRef.current = glossaryMap;
  }, [glossaryMap]);

  useEffect(() => {
    const view = editor.prosemirrorView;
    if (view) setGlossaryTerms(view, glossaryMap);
  }, [editor, glossaryMap]);

  // Tamanho fixo de imagem: P (35%) / M (55%) / G (100%). Cada imagem
  // recebe um seletor próprio (canto superior direito). Não há arrasto,
  // nem medição de layout em clique — o texto fica estático. O id do bloco
  // vem do ProseMirror (posAtDOM -> attrs.id do nó 'block').
  useEffect(() => {
    const view = editor.prosemirrorView;
    if (!view) return;
    const root = view.dom as HTMLElement;
    const SIZES = [
      { label: 'P', pct: 0.35, title: 'Pequeno' },
      { label: 'M', pct: 0.55, title: 'Médio' },
      { label: 'G', pct: 1, title: 'Grande' },
    ] as const;

    const idAt = (block: HTMLElement): string | null => {
      try {
        const pos = view.posAtDOM(block, 0);
        const parent = view.state.doc.resolve(pos).parent;
        return (parent?.attrs?.id as string) ?? null;
      } catch {
        return null;
      }
    };

    const wire = (block: HTMLElement) => {
      if (block.querySelector('.bn-image-size-pill')) return;
      const img = block.querySelector('img[src]') as HTMLImageElement | null;
      if (!img) return;
      const pill = document.createElement('div');
      pill.className = 'bn-image-size-pill';
      SIZES.forEach(({ label, pct, title }) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = label;
        btn.title = title;
        btn.addEventListener('mousedown', (e) => e.preventDefault());
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const id = idAt(block);
          if (!id) return;
          const base = block.getBoundingClientRect().width;
          const width = Math.max(64, Math.round(base * pct));
          editor.updateBlock(id, { props: { previewWidth: width } });
        });
        pill.appendChild(btn);
      });
      block.appendChild(pill);
    };

    const scan = (el: HTMLElement) => {
      const blocks: HTMLElement[] = el.matches?.('[data-content-type="image"]')
        ? [el]
        : Array.from(el.querySelectorAll('[data-content-type="image"]'));
      blocks.forEach(wire);
    };

    scan(root);

    const mo = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        m.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) scan(node);
        });
      });
    });
    mo.observe(root, { childList: true, subtree: true });

    return () => mo.disconnect();
  }, [editor]);

  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.focus();
      titleRef.current.setSelectionRange(titleRef.current.value.length, titleRef.current.value.length);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (spellCheckTimerRef.current) clearTimeout(spellCheckTimerRef.current);
      try {
        emitRef.current();
      } catch {
        // editor já destruído — nada a salvar
      }
    };
  }, []);

  const emitSections = useCallback(() => {
    const blocks = editor.document;
    onUpdateSections(blocksToSections(blocks as unknown as PartialBlocks));
  }, [editor, onUpdateSections]);

  const flushEmit = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    emitSections();
  }, [emitSections]);

  useEffect(() => {
    emitRef.current = flushEmit;
  }, [flushEmit]);

  const initTitleTextarea = useCallback((el: HTMLTextAreaElement | null) => {
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
    titleRef.current = el;
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === ' ') {
        const sm = editor.getExtension(SuggestionMenu);
        if (sm?.shown()) sm.closeMenu();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        flushEmit();
      }
      if (e.key === 'Escape') {
        e.stopPropagation();
        const active = document.activeElement as HTMLElement | null;
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
          active.blur();
          return;
        }
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        flushEmit();
        onExit();
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [editor, flushEmit, onExit]);

  const scheduleSpellCheck = useCallback(() => {
    if (spellCheckTimerRef.current) clearTimeout(spellCheckTimerRef.current);
    spellCheckTimerRef.current = setTimeout(() => {
      const view = editor.prosemirrorView;
      if (view) {
        setSpellDebug('verificando…');
        runSpellCheck(view, spellStoreRef.current, (s) => {
          if (s.error) setSpellDebug(`erro: ${s.error}`);
          else setSpellDebug(`${s.matches} ocorrência(s)`);
        });
      }
    }, 500);
  }, [editor]);

  const reportSpellStatus = useCallback((s: SpellCheckStatus) => {
    if (s.error) setSpellDebug(`erro: ${s.error}`);
    else setSpellDebug(`${s.matches} ocorrência(s) — texto: ${JSON.stringify(s.text).slice(0, 40)}`);
  }, []);

  useEffect(() => {
    spellStoreRef.current.enabled = spellEnabled;
    if (!spellEnabled) {
      setSpellDebug('');
      setSpellPopup(null);
      const view = editor.prosemirrorView;
      if (view) clearSpellMatches(view);
    } else {
      scheduleSpellCheck();
    }
  }, [spellEnabled, editor, scheduleSpellCheck]);

  const handleEditorChange = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => emitSections(), 500);
    scheduleSpellCheck();
  }, [emitSections, scheduleSpellCheck]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const view = editor.prosemirrorView;
    if (!view) return;

    const el = (e.target as HTMLElement).closest?.('.bn-spell-error, .bn-spell-grammar') as HTMLElement | null;
    let match: MappedMatch | undefined;
    if (el) {
      const from = Number(el.dataset.from ?? NaN);
      const to = Number(el.dataset.to ?? NaN);
      if (Number.isFinite(from) && Number.isFinite(to)) {
        match = getSpellMatches(view.state).find((m) => m.from === from && m.to === to);
      }
    }
    if (!match) {
      const pos = view.posAtCoords({ left: e.clientX, top: e.clientY });
      if (pos) {
        const matches = getSpellMatches(view.state);
        match = matches.find((m) => pos.pos >= m.from && pos.pos < m.to);
      }
    }

    if (match) {
      view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc, match.from, match.to)));
    }

    setSpellPopup({
      x: e.clientX,
      y: e.clientY,
      from: match ? match.from : -1,
      to: match ? match.to : -1,
      word: match ? match.word : '',
    });
    setSpellMessage(match ? match.message : '');

    if (match && match.replacements.length > 0) {
      setSpellLoading(false);
      setSpellSuggestions(match.replacements);
    } else if (match) {
      setSpellLoading(true);
      setSpellSuggestions([]);
      suggestForWord(match.word).then((sugs) => {
        setSpellLoading(false);
        setSpellSuggestions(sugs);
      });
    } else {
      setSpellLoading(false);
      setSpellSuggestions([]);
    }
  }, [editor]);

  const copyAtPos = useCallback(async () => {
    const view = editor.prosemirrorView;
    if (!view) return;
    let text = '';
    const sel = view.state.selection;
    if (!sel.empty) {
      text = view.state.doc.textBetween(sel.from, sel.to, '\n');
    } else if (spellPopup && spellPopup.from >= 0) {
      text = spellPopup.word;
    }
    setSpellPopup(null);
    if (text) {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        // sem permissão de clipboard — ignora
      }
    }
  }, [editor, spellPopup]);

  const pasteAtPos = useCallback(() => {
    const view = editor.prosemirrorView;
    if (!view) return;
    view.focus();
    if (spellPopup && spellPopup.from >= 0) {
      view.dispatch(
        view.state.tr.setSelection(TextSelection.create(view.state.doc, spellPopup.from, spellPopup.to)),
      );
    }
    setSpellPopup(null);
    let ok = false;
    try {
      ok = document.execCommand('paste');
    } catch {
      // fallback abaixo
    }
    if (!ok) {
      navigator.clipboard
        .readText()
        .then((text) => {
          if (!text || !view.state) return;
          const { from, to } = view.state.selection;
          view.dispatch(view.state.tr.insertText(text, from, to));
        })
        .catch(() => {});
    }
  }, [editor, spellPopup]);

  const ignoreWord = useCallback(() => {
    const view = editor.prosemirrorView;
    if (spellPopup && spellPopup.word) {
      spellStoreRef.current.ignored.add(spellPopup.word.toLowerCase());
      saveIgnoredWords(doc.id, spellStoreRef.current.ignored);
      if (view) {
        clearSpellMatches(view);
        setSpellDebug('verificando…');
        runSpellCheck(view, spellStoreRef.current, reportSpellStatus);
      }
    }
    setSpellPopup(null);
  }, [editor, spellPopup, reportSpellStatus, doc.id]);

  const handleGlossaryPointerMove = useCallback((e: React.MouseEvent) => {
    const under = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    const span = under?.closest?.('.doc-glossary-term') as HTMLElement | null;
    const term = span?.dataset.glossaryTerm || '';
    if (!term) {
      if (glossaryTipTermRef.current) {
        glossaryTipTermRef.current = '';
        setGlossaryTip(null);
      }
      return;
    }
    if (glossaryTipTermRef.current === term) return;

    const definition = glossaryMap[term.toLowerCase()];
    if (!definition) {
      glossaryTipTermRef.current = '';
      setGlossaryTip(null);
      return;
    }

    glossaryTipTermRef.current = term;
    const rect = span.getBoundingClientRect();
    setGlossaryTip({
      x: rect.left + rect.width / 2,
      y: rect.top,
      definition,
    });
  }, [glossaryMap]);

  const handleGlossaryLeave = useCallback(() => {
    glossaryTipTermRef.current = '';
    setGlossaryTip(null);
  }, []);

  const handleGlossaryClick = useCallback((e: React.MouseEvent) => {
    const el = (e.target as HTMLElement).closest?.('.doc-glossary-term') as HTMLElement | null;
    const term = el?.dataset.glossaryTerm || '';
    if (!term) return;
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed) return;
    glossaryTipTermRef.current = '';
    setGlossaryTip(null);
    onDefineGlossary(term);
  }, [onDefineGlossary]);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const store = spellStoreRef.current;

    const tryInit = () => {
      if (cancelled) return;
      const view = editor.prosemirrorView;
      const tiptap = (editor as unknown as {
        _tiptapEditor?: {
          view?: { dom?: HTMLElement };
          plugins?: Array<{ key: string }>;
          registerPlugin?: (p: unknown) => unknown;
          unregisterPlugin?: (key: string) => unknown;
        };
      })._tiptapEditor;

      if (!view || !tiptap?.view) {
        if (attempts < 60) {
          attempts++;
          setTimeout(tryInit, 200);
        }
        return;
      }

      const hasSpellPlugin = tiptap.plugins?.some((p) => p.key === (spellKey as unknown as { key: string }).key);
      if (!hasSpellPlugin) tiptap.registerPlugin?.(createSpellPlugin());

      const hasGlossaryPlugin = tiptap.plugins?.some((p) => p.key === (glossaryKey as unknown as { key: string }).key);
      if (!hasGlossaryPlugin) tiptap.registerPlugin?.(createGlossaryPlugin());

      const dom = view.dom as HTMLElement;
      if (dom) dom.setAttribute('spellcheck', 'false');

      const viewReady = editor.prosemirrorView;
      if (viewReady) {
        setGlossaryTerms(viewReady, glossaryMapRef.current);
        setSpellDebug('verificando…');
        runSpellCheck(viewReady, store, (s) => {
          if (!cancelled) reportSpellStatus(s);
        });
      }
    };

    tryInit();

    return () => {
      cancelled = true;
      store.runToken++;
      (editor as unknown as {
        _tiptapEditor?: { unregisterPlugin?: (key: string) => unknown };
      })._tiptapEditor?.unregisterPlugin?.((spellKey as unknown as { key: string }).key);
      (editor as unknown as {
        _tiptapEditor?: { unregisterPlugin?: (key: string) => unknown };
      })._tiptapEditor?.unregisterPlugin?.((glossaryKey as unknown as { key: string }).key);
    };
  }, [editor, reportSpellStatus]);

  const toggleSpell = useCallback(() => {
    setSpellPopup(null);
    onToggleSpell();
  }, [onToggleSpell]);

  // Guarda a posição do cursor ao abrir o painel de símbolos e insere no cursor
  const openCharPicker = useCallback(() => {
    const view = editor.prosemirrorView;
    charSelectionRef.current = view
      ? { from: view.state.selection.from, to: view.state.selection.to }
      : null;
    setShowCharPicker(true);
  }, [editor]);

  const closeCharPicker = useCallback(() => {
    playSound('click');
    setShowCharPicker(false);
  }, []);

  const insertChar = useCallback(
    (char: string) => {
      const view = editor.prosemirrorView;
      if (view) {
        let from = charSelectionRef.current?.from;
        let to = charSelectionRef.current?.to;
        // Se o usuário clicou no documento com o painel aberto, usa o cursor atual
        try {
          const domSel = window.getSelection();
          if (
            domSel &&
            domSel.rangeCount > 0 &&
            view.dom.contains(domSel.anchorNode)
          ) {
            const range = domSel.getRangeAt(0);
            const start = view.posAtDOM(range.startContainer, range.startOffset);
            const end = view.posAtDOM(range.endContainer, range.endOffset);
            if (start != null && end != null) {
              from = start;
              to = end;
            }
          }
        } catch {
          // segue com a seleção salva
        }
        if (from === undefined) from = view.state.selection.from;
        if (to === undefined) to = view.state.selection.to;
        const start = Math.min(from, to);
        const end = Math.max(from, to);
        view.dispatch(view.state.tr.insertText(char, start, end));
        const next = start + char.length;
        charSelectionRef.current = { from: next, to: next };
        view.focus();
      }
      playSound('click');
    },
    [editor],
  );

  useEffect(() => {
    if (!showCharPicker) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowCharPicker(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showCharPicker]);

  // === Enforcement do alinhamento à régua (36px) ===
  // O BlockNote injeta seus próprios estilos (.bn-block-outer com
  // line-height: 1.5 e .bn-block-content com padding: 3px 0) que
  // quebram o encaixe do texto nas linhas da folha. Injetamos inline
  // (com <style> dentro da folha + MutationObserver) para que o texto
  // SEMPRE fique centralizado entre as linhas da régua, mesmo quando
  // imagens ou outros elementos são adicionados.
const [paperStyleId] = useState('doc-paper-grid-rule');

  useEffect(() => {
    const view = editor.prosemirrorView;
    const root = view?.dom as HTMLElement | null;
    if (!root) return;

    const snapImageHeights = () => {
      root.querySelectorAll<HTMLElement>('[data-content-type="image"]').forEach((el) => {
        const frame = el.querySelector<HTMLElement>('.bn-visual-media-wrapper');
        if (!frame) return;
        const img = frame.querySelector('img') as HTMLImageElement | null;
        if (!img) return;

        const doSnap = () => {
          const naturalH = frame.scrollHeight || frame.offsetHeight;
          if (naturalH <= 0) return;
          const remainder = naturalH % 36;
          const snapped = remainder === 0 ? naturalH : naturalH + (36 - remainder);
          frame.style.minHeight = snapped + 'px';
        };

        if (img.complete && img.naturalHeight > 0) {
          requestAnimationFrame(() => doSnap());
        } else {
          img.addEventListener('load', () => requestAnimationFrame(() => doSnap()), { once: true });
        }
      });

      // Limpa minHeight de imagens que foram removidas (evita stale height)
      root.querySelectorAll<HTMLElement>('.bn-visual-media-wrapper').forEach((frame) => {
        if (!frame.querySelector('img')) {
          frame.style.minHeight = '';
        }
      });
    };

    snapImageHeights();

    const mo = new MutationObserver(() => {
      requestAnimationFrame(snapImageHeights);
    });
    mo.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });

    return () => mo.disconnect();
  }, [editor]);

  const currentAlignment = (activeBlock?.props?.textAlignment as string) || 'left';
  const fmt = {
    toggleBold: () => editor.toggleStyles({ bold: true }),
    toggleItalic: () => editor.toggleStyles({ italic: true }),
    toggleUnderline: () => editor.toggleStyles({ underline: true }),
    toggleStrike: () => editor.toggleStyles({ strike: true }),
    heading1: () => editor.updateBlock(editor.getTextCursorPosition().block, { type: 'heading', props: { level: 1 } }),
    heading2: () => editor.updateBlock(editor.getTextCursorPosition().block, { type: 'heading', props: { level: 2 } }),
    heading3: () => editor.updateBlock(editor.getTextCursorPosition().block, { type: 'heading', props: { level: 3 } }),
    paragraph: () => editor.updateBlock(editor.getTextCursorPosition().block, { type: 'paragraph' }),
    bulletList: () => editor.updateBlock(editor.getTextCursorPosition().block, { type: 'bulletListItem' }),
    numberedList: () => editor.updateBlock(editor.getTextCursorPosition().block, { type: 'numberedListItem' }),
    checkList: () => editor.updateBlock(editor.getTextCursorPosition().block, { type: 'checkListItem' }),
    inlineCode: () => editor.toggleStyles({ code: true }),
    alignLeft: () => editor.updateBlock(editor.getTextCursorPosition().block, { props: { textAlignment: 'left' } }),
    alignCenter: () => editor.updateBlock(editor.getTextCursorPosition().block, { props: { textAlignment: 'center' } }),
    alignRight: () => editor.updateBlock(editor.getTextCursorPosition().block, { props: { textAlignment: 'right' } }),
    alignJustify: () => editor.updateBlock(editor.getTextCursorPosition().block, { props: { textAlignment: 'justify' } }),
  };

  const wordCount = countWordsOfSections(sections);
  const charCount = sections.reduce((acc, s) => acc + ((s.content || '') + (s.heading || '') + (s.formula || '')).length, 0);

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* Barra de formatação flutuante fixa no topo do documento */}
      <div className="sticky top-0 z-30 w-full flex justify-center pt-3 pr-1 pointer-events-none">
        <div className="doc-format-bar pointer-events-auto">
          <div className="doc-format-group">
            <ToolbarBtn title="Alinhar à esquerda" active={currentAlignment === 'left'} onClick={fmt.alignLeft}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="15" y2="12" />
                <line x1="3" y1="18" x2="18" y2="18" />
              </svg>
            </ToolbarBtn>
            <ToolbarBtn title="Centralizar" active={currentAlignment === 'center'} onClick={fmt.alignCenter}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="6" y1="12" x2="18" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </ToolbarBtn>
            <ToolbarBtn title="Alinhar à direita" active={currentAlignment === 'right'} onClick={fmt.alignRight}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="9" y1="12" x2="21" y2="12" />
                <line x1="6" y1="18" x2="21" y2="18" />
              </svg>
            </ToolbarBtn>
            <ToolbarBtn title="Justificar" active={currentAlignment === 'justify'} onClick={fmt.alignJustify}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </ToolbarBtn>
          </div>

          <ToolbarSep />

          <div className="doc-format-group">
            <ToolbarBtn title="Negrito (Ctrl+B)" active={!!activeStyles.bold} onClick={fmt.toggleBold}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
                <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
              </svg>
            </ToolbarBtn>
            <ToolbarBtn title="Itálico (Ctrl+I)" active={!!activeStyles.italic} onClick={fmt.toggleItalic}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="4" x2="10" y2="4" />
                <line x1="14" y1="20" x2="5" y2="20" />
                <line x1="15" y1="4" x2="9" y2="20" />
              </svg>
            </ToolbarBtn>
            <ToolbarBtn title="Sublinhado (Ctrl+U)" active={!!activeStyles.underline} onClick={fmt.toggleUnderline}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" />
                <line x1="4" y1="21" x2="20" y2="21" />
              </svg>
            </ToolbarBtn>
            <ToolbarBtn title="Tachado" active={!!activeStyles.strike} onClick={fmt.toggleStrike}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 4H9a3 3 0 0 0-2.83 4" />
                <path d="M14 12a4 4 0 0 1 0 8H6" />
                <line x1="4" y1="12" x2="20" y2="12" />
              </svg>
            </ToolbarBtn>
          </div>

          <ToolbarSep />

          <div className="doc-format-group">
            <ToolbarBtn title="Lista com marcadores" active={activeBlock?.type === 'bulletListItem'} onClick={fmt.bulletList}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="9" y1="6" x2="20" y2="6" />
                <line x1="9" y1="12" x2="20" y2="12" />
                <line x1="9" y1="18" x2="20" y2="18" />
                <circle cx="5" cy="6" r="1" fill="currentColor" />
                <circle cx="5" cy="12" r="1" fill="currentColor" />
                <circle cx="5" cy="18" r="1" fill="currentColor" />
              </svg>
            </ToolbarBtn>
            <ToolbarBtn title="Lista numerada" active={activeBlock?.type === 'numberedListItem'} onClick={fmt.numberedList}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="10" y1="6" x2="21" y2="6" />
                <line x1="10" y1="12" x2="21" y2="12" />
                <line x1="10" y1="18" x2="21" y2="18" />
                <text x="4" y="8" fontSize="7" fill="currentColor" stroke="none" fontFamily="Inter">1</text>
                <text x="4" y="14" fontSize="7" fill="currentColor" stroke="none" fontFamily="Inter">2</text>
                <text x="4" y="20" fontSize="7" fill="currentColor" stroke="none" fontFamily="Inter">3</text>
              </svg>
            </ToolbarBtn>
            <ToolbarBtn title="Lista de tarefas" active={activeBlock?.type === 'checkListItem'} onClick={fmt.checkList}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="6" height="6" rx="1" />
                <polyline points="4.5 8 6 9.5 8 6.5" />
                <line x1="12" y1="8" x2="21" y2="8" />
                <rect x="3" y="13" width="6" height="6" rx="1" />
                <line x1="12" y1="16" x2="21" y2="16" />
              </svg>
            </ToolbarBtn>
          </div>

          <ToolbarSep />

          <div className="doc-format-group">
            <ToolbarBtn title="Código inline" active={!!activeStyles.code} onClick={fmt.inlineCode}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </ToolbarBtn>
          </div>

          <ToolbarSep />

          <div className="doc-format-group">
            {/* Caracteres Especiais / Símbolos (α, √, ∑, →) */}
            <span onMouseDown={(e) => e.preventDefault()}>
              <ToolbarBtn title="Caracteres Especiais & Símbolos (α, √, ∑, →)" active={showCharPicker} onClick={openCharPicker}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 7V5c0-.6-.4-1-1-1H6.5a.5.5 0 0 0-.4.8L12 12l-5.9 7.2a.5.5 0 0 0 .4.8H17c.6 0 1-.4 1-1v-2" />
                </svg>
              </ToolbarBtn>
            </span>
          </div>

          <ToolbarSep />

          <div className="doc-format-group">
            <ToolbarBtn
              title={spellEnabled ? 'Desativar corretor ortográfico' : 'Ativar corretor ortográfico'}
              active={spellEnabled}
              onClick={toggleSpell}
            >
              <span className="doc-toolbar-label doc-spell-btn-label">ABC</span>
            </ToolbarBtn>
          </div>

          {spellDebug ? <span className="doc-spell-debug" title="Diagnóstico do corretor">{spellDebug}</span> : null}
        </div>
      </div>

      {/* Cartão do documento: título + folha pautada */}
      <div className="w-full max-w-4xl rounded-[28px] overflow-hidden border border-[#E7E2D9]/60 dark:border-[#2C2C30]/80 shadow-xs bg-white dark:bg-[#18181B]">
        <div className="px-6 sm:px-12 pt-6 pb-4">
          <textarea
            ref={initTitleTextarea}
            rows={1}
            value={doc.title}
            onChange={(e) => {
              onUpdateTitle(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            placeholder="Título do Documento..."
            className="w-full bg-transparent resize-none border-none outline-none text-2xl sm:text-4xl font-black text-[#1C1917] dark:text-[#FAF9F5] font-display tracking-tight leading-tight placeholder:text-[#D6D0C5] dark:placeholder:text-[#A8A29E] overflow-hidden break-words"
          />

          <div className="flex flex-wrap items-center justify-between text-[11px] text-[#A8A29E] font-medium pt-2">
            <span className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-[#2D5A46]" />
              {wordCount} palavras
              • {charCount} caracteres
            </span>
            <span>Criado em {doc.createdAt}</span>
          </div>
        </div>

        <div className="doc-editor-body">
          <div
            className="doc-editor-paper"
            onContextMenu={handleContextMenu}
            onMouseMove={handleGlossaryPointerMove}
            onMouseLeave={handleGlossaryLeave}
            onClick={handleGlossaryClick}
          >
            <style id={paperStyleId}>{`
              .doc-editor-paper .bn-block-outer,
              .doc-editor-paper .bn-block,
              .doc-editor-paper .bn-block-content {
                padding: 0 !important;
                margin: 0 !important;
              }
              .doc-editor-paper .bn-block-outer {
                line-height: 36px !important;
              }
              .doc-editor-paper [data-content-type] {
                padding: 0 !important;
                margin: 0 !important;
                max-width: 100% !important;
                box-sizing: border-box !important;
              }
              .doc-editor-paper [data-content-type="paragraph"],
              .doc-editor-paper [data-content-type="bulletListItem"],
              .doc-editor-paper [data-content-type="numberedListItem"],
              .doc-editor-paper [data-content-type="checkListItem"] {
                line-height: 36px !important;
                min-height: 36px !important;
              }
              .doc-editor-paper [data-content-type="heading"] {
                padding: 0 !important;
              }
              .doc-editor-paper [data-content-type="heading"][data-level="1"],
              .doc-editor-paper [data-content-type="heading"][data-level="2"] {
                line-height: 72px !important;
                min-height: 72px !important;
              }
              .doc-editor-paper [data-content-type="heading"][data-level="3"] {
                line-height: 36px !important;
                min-height: 36px !important;
              }
              .doc-editor-paper .bn-inline-content {
                max-width: 100% !important;
              }
              .doc-editor-paper .bn-trailing-block {
                height: 36px !important;
                min-height: 36px !important;
              }
              .doc-editor-paper [data-content-type="image"] {
                position: relative !important;
                box-sizing: border-box !important;
              }
              .doc-editor-paper [data-content-type="image"] .bn-file-block-content-wrapper {
                max-width: 100% !important;
                margin: 36px 0 !important;
                box-sizing: border-box !important;
              }
              .doc-editor-paper [data-content-type="image"] .bn-visual-media-wrapper {
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                justify-content: center !important;
                box-sizing: border-box !important;
                max-width: 100% !important;
                width: 100% !important;
                height: auto !important;
                padding: 6px !important;
                border-radius: 10px !important;
                border: 1px solid transparent !important;
                overflow: hidden !important;
              }
              .doc-editor-paper [data-content-type="image"] .bn-visual-media-wrapper img {
                display: block !important;
                margin: 0 !important;
                width: 100% !important;
                height: auto !important;
                max-width: 100% !important;
                max-height: none !important;
                object-fit: contain !important;
                border-radius: 6px !important;
              }
            `}</style>
            <div className="doc-paper-margin" />
            <div className="doc-paper-holes">
              <span /><span /><span />
            </div>
            <div className="doc-paper-lines">
              <BlockNoteView
                editor={editor}
                theme="light"
                onChange={handleEditorChange}
              />
            </div>
          </div>
        </div>
      </div>

      {glossaryTip ? (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.96 }}
          transition={{ type: 'spring', damping: 26, stiffness: 500, mass: 0.4 }}
          className="fixed z-[99999] w-72 p-4 rounded-2xl bg-white/95 dark:bg-[#18181B]/95 backdrop-blur-xl border border-[#CFE1D6]/80 dark:border-[#22392D]/80 shadow-2xl text-left pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{ left: glossaryTip.x, top: glossaryTip.y - 14 }}
        >
          <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-[#E7E2D9] dark:border-[#2C2C30]">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#2D5A46] to-[#224A38] text-white flex items-center justify-center shadow-md shadow-[#2D5A46]/30 shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <h4 className="font-display font-bold text-sm text-[#1C1917] dark:text-[#FAF9F5] truncate">
                {glossaryTip.definition.term}
              </h4>
            </div>
            {glossaryTip.definition.category && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF3EF] dark:bg-[#15221B]/80 text-[#2D5A46] dark:text-[#52B788] shrink-0">
                {glossaryTip.definition.category}
              </span>
            )}
          </div>

          {glossaryTip.definition.imageUrl && (
            <img
              src={glossaryTip.definition.imageUrl}
              alt={glossaryTip.definition.term}
              className="w-full h-36 object-cover rounded-xl border border-[#E7E2D9] dark:border-[#3B3B40] shadow-md mb-2.5"
              onError={(e) => { (e.currentTarget.style.display = 'none'); }}
            />
          )}

          {glossaryTip.definition.definition && (
            <>
              <span className="text-[10px] font-bold text-[#A8A29E] dark:text-[#78716C] uppercase tracking-wider block">
                Significado Acadêmico:
              </span>
              <p className="text-xs text-[#44403C] dark:text-[#E7E5E4] leading-relaxed font-normal">
                {glossaryTip.definition.definition}
              </p>
            </>
          )}

          {glossaryTip.definition.example && (
            <div className="mt-2.5 pt-2 border-t border-[#E7E2D9] dark:border-[#2C2C30]/80 flex items-start gap-2 text-[11px] text-[#57534E] dark:text-[#D6D3CD] bg-[#EBF3EF]/60 dark:bg-[#15221B]/30 p-2 rounded-xl border border-[#CFE1D6]/50 dark:border-[#22392D]/40">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <p className="italic leading-snug">
                <strong className="not-italic text-[#1C1917] dark:text-[#FAF9F5] font-semibold">{glossaryTip.definition.example}</strong>
              </p>
            </div>
          )}
        </motion.div>
      ) : null}

      {spellPopup ? (
        <SpellContextMenu
          anchor={spellPopup}
          suggestions={spellSuggestions}
          message={spellMessage}
          loading={spellLoading}
          onPick={(value) => {
            const view = editor.prosemirrorView;
            if (view && spellPopup && spellPopup.from >= 0) {
              view.dispatch(view.state.tr.insertText(value, spellPopup.from, spellPopup.to));
            }
            setSpellPopup(null);
          }}
          onCopy={copyAtPos}
          onPaste={pasteAtPos}
          onIgnore={ignoreWord}
          onDefineGlossary={(word) => {
            setSpellPopup(null);
            onDefineGlossary(word);
          }}
          onClose={() => setSpellPopup(null)}
        />
      ) : null}

      <SpecialCharPicker
        open={showCharPicker}
        onSelectChar={insertChar}
        onClose={closeCharPicker}
      />
    </div>
  );
}