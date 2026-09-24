import { Plugin, PluginKey } from 'prosemirror-state';
import type { EditorState, Transaction } from 'prosemirror-state';
import type { Node } from 'prosemirror-model';
import type { EditorView } from 'prosemirror-view';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { GlossaryDefinition } from '../data/disciplinesData';
import { escapeRegExp, isAlphaNumericChar } from './glossary';

export interface GlossaryTermMatch {
  from: number;
  to: number;
  term: string;
  category?: string;
}

export interface GlossaryPluginState {
  terms: Record<string, GlossaryDefinition>;
  pattern: RegExp | null;
  matches: GlossaryTermMatch[];
  enabled: boolean;
  seenTerms: Set<string>;
}

export const glossaryKey = new PluginKey<GlossaryPluginState>('docGlossary');

const buildPattern = (terms: Record<string, GlossaryDefinition>): RegExp | null => {
  const keys = Object.keys(terms)
    .map((k) => k.trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);
  if (keys.length === 0) return null;
  return new RegExp(`(?:${keys.map(escapeRegExp).join('|')})`, 'giu');
};

// Varre os nós de texto do documento calculando os termos correspondentes
export function computeGlossaryMatches(
  doc: Node,
  terms: Record<string, GlossaryDefinition>,
  pattern: RegExp | null,
): GlossaryTermMatch[] {
  if (!pattern || Object.keys(terms).length === 0) return [];
  const matches: GlossaryTermMatch[] = [];

  doc.descendants((node, pos) => {
    if (node.isText && node.text) {
      const text = node.text;
      pattern.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = pattern.exec(text))) {
        const matched = m[0];
        if (!matched) {
          pattern.lastIndex++;
          continue;
        }
        const before = m.index > 0 ? text[m.index - 1] : '';
        const after = m.index + matched.length < text.length ? text[m.index + matched.length] : '';
        if (!isAlphaNumericChar(before) && !isAlphaNumericChar(after)) {
          const def = terms[matched.toLowerCase()];
          if (def) {
            matches.push({
              from: pos + m.index,
              to: pos + m.index + matched.length,
              term: def.term || matched,
              category: def.category,
            });
          }
        }
      }
    }
    return true;
  });

  return matches;
}

// Timer para debounce no cálculo de matches durante digitação
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function createGlossaryPlugin(): Plugin<GlossaryPluginState> {
  return new Plugin<GlossaryPluginState>({
    key: glossaryKey,
    state: {
      init: (): GlossaryPluginState => ({
        terms: {},
        pattern: null,
        matches: [],
        enabled: true,
        seenTerms: new Set<string>(),
      }),
      apply(tr: Transaction, value: GlossaryPluginState, _oldState: EditorState, newState: EditorState) {
        const meta = tr.getMeta(glossaryKey) as
          | {
              terms?: Record<string, GlossaryDefinition>;
              refresh?: boolean;
              enabled?: boolean;
              markSeen?: string;
            }
          | undefined;

        let nextSeen = value.seenTerms;
        if (meta && meta.markSeen) {
          nextSeen = new Set(value.seenTerms);
          nextSeen.add(meta.markSeen.trim().toLowerCase());
        }

        const nextEnabled = meta?.enabled !== undefined ? meta.enabled : value.enabled;

        if (meta && meta.terms !== undefined) {
          const pattern = buildPattern(meta.terms);
          return {
            terms: meta.terms,
            pattern,
            matches: nextEnabled ? computeGlossaryMatches(newState.doc, meta.terms, pattern) : [],
            enabled: nextEnabled,
            seenTerms: nextSeen,
          };
        }

        if (meta && meta.refresh) {
          return {
            terms: value.terms,
            pattern: value.pattern,
            matches: nextEnabled ? computeGlossaryMatches(newState.doc, value.terms, value.pattern) : [],
            enabled: nextEnabled,
            seenTerms: nextSeen,
          };
        }

        if (meta && meta.enabled !== undefined) {
          return {
            terms: value.terms,
            pattern: value.pattern,
            matches: nextEnabled ? computeGlossaryMatches(newState.doc, value.terms, value.pattern) : [],
            enabled: nextEnabled,
            seenTerms: nextSeen,
          };
        }

        if (meta && meta.markSeen) {
          return {
            ...value,
            seenTerms: nextSeen,
          };
        }

        // Se o documento mudou via digitação, mapeia posições existentes para resposta instantânea
        if (tr.docChanged) {
          if (!nextEnabled || value.matches.length === 0) {
            return { ...value, enabled: nextEnabled, seenTerms: nextSeen };
          }
          // Mapeia decorações pelas mudanças do passo
          const mappedMatches: GlossaryTermMatch[] = [];
          for (const m of value.matches) {
            const from = tr.mapping.map(m.from, 1);
            const to = tr.mapping.map(m.to, -1);
            if (from < to) {
              mappedMatches.push({ ...m, from, to });
            }
          }
          return {
            ...value,
            matches: mappedMatches,
            enabled: nextEnabled,
            seenTerms: nextSeen,
          };
        }

        return value;
      },
    },
    view(editorView: EditorView) {
      return {
        update(view: EditorView, prevState: EditorState) {
          // Debounce de recálculo preciso após o usuário parar de digitar por 300ms
          if (view.state.doc !== prevState.doc) {
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
              const state = glossaryKey.getState(view.state);
              if (state && state.enabled && state.pattern) {
                const accurateMatches = computeGlossaryMatches(view.state.doc, state.terms, state.pattern);
                view.dispatch(view.state.tr.setMeta(glossaryKey, { refresh: false }).setMeta('accurateMatches', accurateMatches));
              }
            }, 300);
          }
        },
        destroy() {
          if (debounceTimer) {
            clearTimeout(debounceTimer);
            debounceTimer = null;
          }
        },
      };
    },
    props: {
      decorations(state: EditorState): DecorationSet | null {
        const value = glossaryKey.getState(state);
        if (!value || !value.enabled || value.matches.length === 0) return null;

        return DecorationSet.create(
          state.doc,
          value.matches.map((m) => {
            const isSeen = value.seenTerms.has(m.term.trim().toLowerCase());
            // Categoria normalizada para classe CSS personalizada de disciplina
            const catNorm = (m.category || 'default')
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-z0-9]/g, '');

            const classes = [
              'doc-glossary-term',
              `doc-glossary-cat-${catNorm}`,
              isSeen ? 'doc-glossary-seen' : '',
            ]
              .filter(Boolean)
              .join(' ');

            return Decoration.inline(m.from, m.to, {
              class: classes,
              'data-glossary-term': m.term,
              'data-glossary-category': m.category || '',
              tabindex: '0',
              role: 'button',
              'aria-haspopup': 'dialog',
              'aria-label': `Termo do glossário: ${m.term}`,
            });
          }),
        );
      },
    },
  });
}

export function setGlossaryTerms(view: EditorView, terms: Record<string, GlossaryDefinition>): void {
  view.dispatch(view.state.tr.setMeta(glossaryKey, { terms }));
}

export function setGlossaryEnabled(view: EditorView, enabled: boolean): void {
  view.dispatch(view.state.tr.setMeta(glossaryKey, { enabled }));
}

export function markGlossaryTermSeen(view: EditorView, term: string): void {
  view.dispatch(view.state.tr.setMeta(glossaryKey, { markSeen: term }));
}

export function refreshGlossaryDecorations(view: EditorView): void {
  view.dispatch(view.state.tr.setMeta(glossaryKey, { refresh: true }));
}
