import { GlossaryDefinition } from '../data/disciplinesData';
import definitionsData from '../data/definitions.json';

export const GLOBAL_GLOSSARY: Record<string, GlossaryDefinition> =
  definitionsData as Record<string, GlossaryDefinition>;

export const isAlphaNumericChar = (ch: string): boolean => /[\p{L}\p{N}_]/u.test(ch);

export const escapeRegExp = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Paleta de cores suaves por disciplina (fundo ~13% + texto forte + variantes dark)
export interface CategoryColor {
  name: string;
  dot: string;
  bgLight: string;
  textLight: string;
  borderLight: string;
  bgDark: string;
  textDark: string;
  borderDark: string;
  underlineColor: string;
  underlineColorDark: string;
}

const DEFAULT_CATEGORY_COLOR: CategoryColor = {
  name: 'Conceito',
  dot: '#2D5A46',
  bgLight: 'bg-[#EBF3EF]',
  textLight: 'text-[#2D5A46]',
  borderLight: 'border-[#CFE1D6]',
  bgDark: 'dark:bg-[#15221B]',
  textDark: 'dark:text-[#52B788]',
  borderDark: 'dark:border-[#22392D]',
  underlineColor: 'rgba(45, 90, 70, 0.75)',
  underlineColorDark: 'rgba(82, 183, 136, 0.8)',
};

export const CATEGORY_COLORS: Record<string, CategoryColor> = {
  // Matemática / Cálculo - Azul
  matematica: {
    name: 'Matemática',
    dot: '#2563EB',
    bgLight: 'bg-blue-50',
    textLight: 'text-blue-700',
    borderLight: 'border-blue-200',
    bgDark: 'dark:bg-blue-950/50',
    textDark: 'dark:text-blue-300',
    borderDark: 'dark:border-blue-800/60',
    underlineColor: 'rgba(37, 99, 235, 0.75)',
    underlineColorDark: 'rgba(96, 165, 250, 0.8)',
  },
  calculo: {
    name: 'Cálculo',
    dot: '#2563EB',
    bgLight: 'bg-blue-50',
    textLight: 'text-blue-700',
    borderLight: 'border-blue-200',
    bgDark: 'dark:bg-blue-950/50',
    textDark: 'dark:text-blue-300',
    borderDark: 'dark:border-blue-800/60',
    underlineColor: 'rgba(37, 99, 235, 0.75)',
    underlineColorDark: 'rgba(96, 165, 250, 0.8)',
  },
  // Física - Âmbar / Laranja dourado
  fisica: {
    name: 'Física',
    dot: '#D97706',
    bgLight: 'bg-amber-50',
    textLight: 'text-amber-800',
    borderLight: 'border-amber-200',
    bgDark: 'dark:bg-amber-950/50',
    textDark: 'dark:text-amber-300',
    borderDark: 'dark:border-amber-800/60',
    underlineColor: 'rgba(217, 119, 6, 0.75)',
    underlineColorDark: 'rgba(251, 191, 36, 0.8)',
  },
  // Química - Roxo
  quimica: {
    name: 'Química',
    dot: '#9333EA',
    bgLight: 'bg-purple-50',
    textLight: 'text-purple-700',
    borderLight: 'border-purple-200',
    bgDark: 'dark:bg-purple-950/50',
    textDark: 'dark:text-purple-300',
    borderDark: 'dark:border-purple-800/60',
    underlineColor: 'rgba(147, 51, 234, 0.75)',
    underlineColorDark: 'rgba(192, 132, 252, 0.8)',
  },
  // Biologia - Verde-oliva / Esmeralda
  biologia: {
    name: 'Biologia',
    dot: '#16A34A',
    bgLight: 'bg-emerald-50',
    textLight: 'text-emerald-700',
    borderLight: 'border-emerald-200',
    bgDark: 'dark:bg-emerald-950/50',
    textDark: 'dark:text-emerald-300',
    borderDark: 'dark:border-emerald-800/60',
    underlineColor: 'rgba(22, 163, 74, 0.75)',
    underlineColorDark: 'rgba(74, 222, 128, 0.8)',
  },
  // História - Terracota
  historia: {
    name: 'História',
    dot: '#EA580C',
    bgLight: 'bg-orange-50',
    textLight: 'text-orange-800',
    borderLight: 'border-orange-200',
    bgDark: 'dark:bg-orange-950/50',
    textDark: 'dark:text-orange-300',
    borderDark: 'dark:border-orange-800/60',
    underlineColor: 'rgba(234, 88, 12, 0.75)',
    underlineColorDark: 'rgba(251, 146, 60, 0.8)',
  },
  // Geografia - Turquesa / Teal
  geografia: {
    name: 'Geografia',
    dot: '#0D9488',
    bgLight: 'bg-teal-50',
    textLight: 'text-teal-800',
    borderLight: 'border-teal-200',
    bgDark: 'dark:bg-teal-950/50',
    textDark: 'dark:text-teal-300',
    borderDark: 'dark:border-teal-800/60',
    underlineColor: 'rgba(13, 148, 136, 0.75)',
    underlineColorDark: 'rgba(45, 212, 191, 0.8)',
  },
  // Filosofia / Sociologia - Rosa
  filosofia: {
    name: 'Filosofia',
    dot: '#DB2777',
    bgLight: 'bg-pink-50',
    textLight: 'text-pink-700',
    borderLight: 'border-pink-200',
    bgDark: 'dark:bg-pink-950/50',
    textDark: 'dark:text-pink-300',
    borderDark: 'dark:border-pink-800/60',
    underlineColor: 'rgba(219, 39, 119, 0.75)',
    underlineColorDark: 'rgba(244, 114, 182, 0.8)',
  },
  sociologia: {
    name: 'Sociologia',
    dot: '#DB2777',
    bgLight: 'bg-pink-50',
    textLight: 'text-pink-700',
    borderLight: 'border-pink-200',
    bgDark: 'dark:bg-pink-950/50',
    textDark: 'dark:text-pink-300',
    borderDark: 'dark:border-pink-800/60',
    underlineColor: 'rgba(219, 39, 119, 0.75)',
    underlineColorDark: 'rgba(244, 114, 182, 0.8)',
  },
  // Linguagens / Redação - Vermelho suave
  linguagens: {
    name: 'Linguagens',
    dot: '#E11D48',
    bgLight: 'bg-rose-50',
    textLight: 'text-rose-700',
    borderLight: 'border-rose-200',
    bgDark: 'dark:bg-rose-950/50',
    textDark: 'dark:text-rose-300',
    borderDark: 'dark:border-rose-800/60',
    underlineColor: 'rgba(225, 29, 72, 0.75)',
    underlineColorDark: 'rgba(251, 113, 133, 0.8)',
  },
  redacao: {
    name: 'Redação',
    dot: '#E11D48',
    bgLight: 'bg-rose-50',
    textLight: 'text-rose-700',
    borderLight: 'border-rose-200',
    bgDark: 'dark:bg-rose-950/50',
    textDark: 'dark:text-rose-300',
    borderDark: 'dark:border-rose-800/60',
    underlineColor: 'rgba(225, 29, 72, 0.75)',
    underlineColorDark: 'rgba(251, 113, 133, 0.8)',
  },
};

export function getCategoryColor(category?: string): CategoryColor {
  if (!category) return DEFAULT_CATEGORY_COLOR;
  const norm = category
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  for (const [key, color] of Object.entries(CATEGORY_COLORS)) {
    if (norm.includes(key)) return color;
  }
  return DEFAULT_CATEGORY_COLOR;
}

// Remove acentos e normaliza para busca insensível
export function stripAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

// Geração de plurais simples em português (s/es/is/res) para termos sem aliases
export function generateSimplePlurals(term: string): string[] {
  const t = term.trim();
  if (t.length < 3) return [];
  const lower = t.toLowerCase();
  const variations: string[] = [];

  // Palavras terminadas em vogal ou ditongo -> +s
  if (/[aeiouáéíóúâêîôûãõ]$/i.test(lower)) {
    variations.push(t + 's');
  }
  // Palavras terminadas em r, z -> +es
  else if (/[rz]$/i.test(lower)) {
    variations.push(t + 'es');
  }
  // Palavras terminadas em m -> troca m por ns (ex: homem -> homens)
  else if (/m$/i.test(lower)) {
    variations.push(t.slice(0, -1) + 'ns');
  }
  // Palavras terminadas em al, el, ol, ul -> troca l por is
  else if (/[aeou]l$/i.test(lower)) {
    variations.push(t.slice(0, -1) + 'is');
  }

  return variations;
}

// Unifica glossário global (definitions.json) + glossário personalizado do documento
// Suporta aliases adicionais e plurais automáticos sem sobrescrever chaves de outros termos
export function mergeGlossary(
  custom?: Record<string, GlossaryDefinition>,
  disciplineFilter?: string,
): Record<string, GlossaryDefinition> {
  const merged: Record<string, GlossaryDefinition> = {};

  // Absorb definitions
  const absorb = (map?: Record<string, GlossaryDefinition>, isCustom = false) => {
    if (!map) return;
    for (const [key, rawDef] of Object.entries(map)) {
      const normalized = key.trim().toLowerCase();
      if (!normalized) continue;

      // Filtrar global por disciplina se solicitado
      if (!isCustom && disciplineFilter) {
        const filterNorm = stripAccents(disciplineFilter);
        const catNorm = stripAccents(rawDef.category || '');
        if (filterNorm && catNorm && !catNorm.includes(filterNorm) && !filterNorm.includes(catNorm)) {
          // Permite que termos de disciplinas afins continuem visíveis
          continue;
        }
      }

      const def: GlossaryDefinition = {
        ...rawDef,
        isCustom: isCustom || rawDef.isCustom || false,
      };

      merged[normalized] = def;
      if (def.term && def.term.trim()) {
        merged[def.term.trim().toLowerCase()] = def;
      }

      // Adiciona aliases explícitos
      if (Array.isArray(def.aliases)) {
        for (const alias of def.aliases) {
          const a = alias.trim().toLowerCase();
          if (a && !merged[a]) {
            merged[a] = def;
          }
        }
      }

      // Se não tiver aliases definidos, adiciona variações de plural simples
      if (!def.aliases || def.aliases.length === 0) {
        const plurals = generateSimplePlurals(def.term || key);
        for (const p of plurals) {
          const plNorm = p.toLowerCase();
          if (!merged[plNorm]) {
            merged[plNorm] = def;
          }
        }
      }
    }
  };

  absorb(GLOBAL_GLOSSARY, false);
  absorb(custom, true);
  return merged;
}

// Validação estrita de URL de imagem conforme restrição 1
export function isValidImageUrl(url?: string | null): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith('https://')) return false;
  if (trimmed.length > 2048) return false;
  // Rejeita protocolos inseguros e formatos data/blob
  if (/^(http:|data:|blob:|file:)/i.test(trimmed)) return false;
  return true;
}
