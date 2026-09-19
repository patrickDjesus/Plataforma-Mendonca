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
}

export interface GlossaryPluginState {
  terms: Record<string, GlossaryDefinition>;
  pattern: RegExp | null;
  matches: GlossaryTermMatch[];
}

export const glossaryKey = new PluginKey<GlossaryPluginState>('docGlossary');

const buildPattern = (terms: Record<string, GlossaryDefinition>): RegExp | null => {
  const keys = Object.keys(terms)
    .map((k) => k.trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);
  if (keys.length === 0) return null;
  // 'i' para casar "Logaritmo"/"LOGARITMO" com a chave "logaritmo" do
  // glossário — sem isso, termos capitalizados (início de frase) nunca
  // eram destacados. A checagem de palavra inteira continua no
  // computeGlossaryMatches, usando o texto real casado.
  return new RegExp(`(?:${keys.map(escapeRegExp).join('|')})`, 'giu');
};

// Varre os nós de texto do documento envolvendo cada ocorrência dos termos do
// glossário (somente palavra inteira, preservando negrito/itálico por nó, já
// que atravessa apenas um nó de texto por vez).
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
            });
          }
        }
      }
    }
    return true;
  });

  return matches;
}

export function createGlossaryPlugin(): Plugin<GlossaryPluginState> {
  return new Plugin<GlossaryPluginState>({
    key: glossaryKey,
    state: {
      init: (): GlossaryPluginState => ({ terms: {}, pattern: null, matches: [] }),
      apply(tr: Transaction, value: GlossaryPluginState, _oldState: EditorState, newState: EditorState) {
        const meta = tr.getMeta(glossaryKey) as
          | { terms?: Record<string, GlossaryDefinition>; refresh?: boolean }
          | undefined;

        if (meta && meta.terms !== undefined) {
          const pattern = buildPattern(meta.terms);
          return {
            terms: meta.terms,
            pattern,
            matches: computeGlossaryMatches(newState.doc, meta.terms, pattern),
          };
        }

        if (tr.docChanged || (meta && meta.refresh)) {
          return {
            terms: value.terms,
            pattern: value.pattern,
            matches: computeGlossaryMatches(newState.doc, value.terms, value.pattern),
          };
        }

        return value;
      },
    },
    props: {
      decorations(state: EditorState): DecorationSet | null {
        const value = glossaryKey.getState(state);
        if (!value || value.matches.length === 0) return null;
        return DecorationSet.create(
          state.doc,
          value.matches.map((m) =>
            Decoration.inline(m.from, m.to, {
              class: 'doc-glossary-term',
              'data-glossary-term': m.term,
            }),
          ),
        );
      },
    },
  });
}

export function setGlossaryTerms(view: EditorView, terms: Record<string, GlossaryDefinition>): void {
  view.dispatch(view.state.tr.setMeta(glossaryKey, { terms }));
}

export function refreshGlossaryDecorations(view: EditorView): void {
  view.dispatch(view.state.tr.setMeta(glossaryKey, { refresh: true }));
}