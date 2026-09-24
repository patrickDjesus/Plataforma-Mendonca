import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  BookMarked,
  Sparkles,
  Wand2,
  LayoutTemplate,
  ListFilter,
  Maximize2,
  CheckCheck,
  MessageSquarePlus,
  Copy,
  ClipboardPaste,
  Check,
  EyeOff,
} from 'lucide-react';
import { AiEditAction } from '../services/ai';

export interface SpellPopupState {
  x: number;
  y: number;
  from: number;
  to: number;
  word: string;
}

interface SpellContextMenuProps {
  anchor: SpellPopupState;
  suggestions: string[];
  message?: string;
  loading: boolean;
  isSpellError?: boolean;
  onPick: (value: string) => void;
  onCopy: () => void;
  onPaste: () => void;
  onIgnore: () => void;
  onDefineGlossary?: (word: string) => void;
  onAiAction?: (action: AiEditAction, customPrompt?: string) => void;
  onClose: () => void;
}

export default function SpellContextMenu({
  anchor,
  suggestions,
  message,
  loading,
  isSpellError = false,
  onPick,
  onCopy,
  onPaste,
  onIgnore,
  onDefineGlossary,
  onAiAction,
  onClose,
}: SpellContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: anchor.x, top: anchor.y + 4 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const left = Math.max(8, Math.min(anchor.x, window.innerWidth - rect.width - 8));
    const top = Math.max(8, Math.min(anchor.y + 4, window.innerHeight - rect.height - 8));
    setPos({ left, top });
  }, [anchor]);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        e.preventDefault();
        onClose();
      }
    }
    document.addEventListener('mousedown', onMouseDown, true);
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('mousedown', onMouseDown, true);
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, [onClose]);

  const hasWord = anchor.word.trim().length > 0;
  const wordDisplay = anchor.word.length > 28 ? `${anchor.word.slice(0, 26)}…` : anchor.word;

  return createPortal(
    <div
      ref={ref}
      className="doc-ctx-menu fixed z-[99999] min-w-[210px] max-w-[270px] max-h-[82vh] overflow-y-auto p-1.5 rounded-xl border border-[#E7E2D9] dark:border-[#2C2C30] bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-md shadow-2xl shadow-black/15 dark:shadow-black/60 select-none"
      style={{ left: pos.left, top: pos.top }}
    >
      {/* Cabeçalho limpo com o texto selecionado (sem badges coloridos) */}
      {hasWord ? (
        <div className="px-2.5 py-1.5 border-b border-[#F0EBE1] dark:border-[#2C2C30] mb-1">
          <div className="text-[10px] font-medium uppercase tracking-wider text-stone-400 dark:text-stone-500">
            Seleção
          </div>
          <div className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate mt-0.5" title={anchor.word}>
            "{wordDisplay}"
          </div>
        </div>
      ) : null}

      {/* Ações da IA — Agrupadas sob um cabeçalho simples */}
      {hasWord && onAiAction ? (
        <div className="mb-1">
          <div className="px-2.5 pt-1 pb-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            Ajustar com IA
          </div>

          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              className="doc-ctx-item group"
              onClick={() => onAiAction('simplify')}
            >
              <Sparkles className="w-4 h-4 text-stone-400 dark:text-stone-400 group-hover:text-[#2D5A46] dark:group-hover:text-[#52B788] transition-colors flex-shrink-0" strokeWidth={1.75} />
              <span>Simplificar</span>
            </button>

            <button
              type="button"
              className="doc-ctx-item group"
              onClick={() => onAiAction('improve')}
            >
              <Wand2 className="w-4 h-4 text-stone-400 dark:text-stone-400 group-hover:text-[#2D5A46] dark:group-hover:text-[#52B788] transition-colors flex-shrink-0" strokeWidth={1.75} />
              <span>Melhorar redação</span>
            </button>

            <button
              type="button"
              className="doc-ctx-item group"
              onClick={() => onAiAction('organize')}
            >
              <LayoutTemplate className="w-4 h-4 text-stone-400 dark:text-stone-400 group-hover:text-[#2D5A46] dark:group-hover:text-[#52B788] transition-colors flex-shrink-0" strokeWidth={1.75} />
              <span>Organizar em tópicos</span>
            </button>

            <button
              type="button"
              className="doc-ctx-item group"
              onClick={() => onAiAction('summarize')}
            >
              <ListFilter className="w-4 h-4 text-stone-400 dark:text-stone-400 group-hover:text-[#2D5A46] dark:group-hover:text-[#52B788] transition-colors flex-shrink-0" strokeWidth={1.75} />
              <span>Resumir pontos-chave</span>
            </button>

            <button
              type="button"
              className="doc-ctx-item group"
              onClick={() => onAiAction('expand')}
            >
              <Maximize2 className="w-4 h-4 text-stone-400 dark:text-stone-400 group-hover:text-[#2D5A46] dark:group-hover:text-[#52B788] transition-colors flex-shrink-0" strokeWidth={1.75} />
              <span>Expandir com exemplos</span>
            </button>

            <button
              type="button"
              className="doc-ctx-item group"
              onClick={() => onAiAction('fix-grammar')}
            >
              <CheckCheck className="w-4 h-4 text-stone-400 dark:text-stone-400 group-hover:text-[#2D5A46] dark:group-hover:text-[#52B788] transition-colors flex-shrink-0" strokeWidth={1.75} />
              <span>Corrigir gramática</span>
            </button>

            <button
              type="button"
              className="doc-ctx-item group"
              onClick={() => onAiAction('custom')}
            >
              <MessageSquarePlus className="w-4 h-4 text-stone-400 dark:text-stone-400 group-hover:text-[#2D5A46] dark:group-hover:text-[#52B788] transition-colors flex-shrink-0" strokeWidth={1.75} />
              <span>Ajuste personalizado...</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* Definir no glossário — agora com a mesma aparência uniforme dos outros itens */}
      {hasWord && onDefineGlossary ? (
        <>
          <div className="doc-ctx-sep" />
          <button
            type="button"
            className="doc-ctx-item group"
            onClick={() => onDefineGlossary(anchor.word)}
          >
            <BookMarked className="w-4 h-4 text-stone-400 dark:text-stone-400 group-hover:text-[#2D5A46] dark:group-hover:text-[#52B788] transition-colors flex-shrink-0" strokeWidth={1.75} />
            <span>Definir no glossário</span>
          </button>
        </>
      ) : null}

      <div className="doc-ctx-sep" />

      {/* Copiar e Colar — estilo de ícone e espaçamento uniforme */}
      <button type="button" className="doc-ctx-item group" onClick={onCopy}>
        <Copy className="w-4 h-4 text-stone-400 dark:text-stone-400 group-hover:text-[#2D5A46] dark:group-hover:text-[#52B788] transition-colors flex-shrink-0" strokeWidth={1.75} />
        <span>Copiar</span>
      </button>
      <button type="button" className="doc-ctx-item group" onClick={onPaste}>
        <ClipboardPaste className="w-4 h-4 text-stone-400 dark:text-stone-400 group-hover:text-[#2D5A46] dark:group-hover:text-[#52B788] transition-colors flex-shrink-0" strokeWidth={1.75} />
        <span>Colar</span>
      </button>

      {/* Sugestões do Corretor / LanguageTool (quando houver erro ortográfico) */}
      {hasWord && isSpellError ? (
        <>
          <div className="doc-ctx-sep" />
          {message ? (
            <div className="px-2.5 py-1 text-[11px] text-stone-500 dark:text-stone-400 leading-snug">
              {message}
            </div>
          ) : null}
          <div className="px-2.5 pt-1 pb-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            Sugestões
          </div>
          {loading ? (
            <div className="px-2.5 py-1.5 text-xs text-stone-400 italic">
              Buscando sugestões…
            </div>
          ) : suggestions.length > 0 ? (
            <div className="flex flex-col gap-0.5">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="doc-ctx-item group font-medium"
                  onClick={() => onPick(s)}
                >
                  <Check className="w-4 h-4 text-stone-400 group-hover:text-[#2D5A46] dark:group-hover:text-[#52B788] transition-colors flex-shrink-0" strokeWidth={1.75} />
                  <span>{s}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-2.5 py-1.5 text-xs text-stone-400 italic">
              Nenhuma sugestão encontrada.
            </div>
          )}
          <div className="doc-ctx-sep" />
          <button type="button" className="doc-ctx-item group" onClick={onIgnore}>
            <EyeOff className="w-4 h-4 text-stone-400 dark:text-stone-400 group-hover:text-[#2D5A46] dark:group-hover:text-[#52B788] transition-colors flex-shrink-0" strokeWidth={1.75} />
            <span>Ignorar erro</span>
          </button>
        </>
      ) : null}
    </div>,
    document.body,
  );
}
