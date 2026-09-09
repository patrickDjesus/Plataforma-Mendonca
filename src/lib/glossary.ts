import { GlossaryDefinition } from '../data/disciplinesData';
import definitionsData from '../data/definitions.json';

export const GLOBAL_GLOSSARY: Record<string, GlossaryDefinition> =
  definitionsData as Record<string, GlossaryDefinition>;

export const isAlphaNumericChar = (ch: string): boolean => /[\p{L}\p{N}_]/u.test(ch);

export const escapeRegExp = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Unifica glossário global (definitions.json) + glossário personalizado do
// documento em um mapa indexado por chave minúscula (com alias def.term).
export function mergeGlossary(custom?: Record<string, GlossaryDefinition>): Record<string, GlossaryDefinition> {
  const merged: Record<string, GlossaryDefinition> = {};
  const absorb = (map?: Record<string, GlossaryDefinition>) => {
    if (!map) return;
    for (const [key, def] of Object.entries(map)) {
      const normalized = key.trim().toLowerCase();
      if (!normalized) continue;
      merged[normalized] = def;
      if (def.term && def.term.trim()) merged[def.term.trim().toLowerCase()] = def;
    }
  };
  absorb(GLOBAL_GLOSSARY);
  absorb(custom);
  return merged;
}