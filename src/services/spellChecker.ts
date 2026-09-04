/**
 * Corretor Ortográfico e Gramatical via LanguageTool API (pt-BR)
 *
 * A LinguaTool é um corretor baseado em RÉGULAS e n-grams (NÃO é IA generativa),
 * que detecta erros de ortografia, gramática e estilo com suporte completo a pt-BR.
 *
 * Endpoint configurável via VITE_LANGUAGETOOL_API_URL (padrão: https://api.languagetool.org/v2).
 * Isso permite usar uma instância própria (self-host) para evitar limites de uso.
 *
 * Limites da API pública gratuita: 20 requisições/min/IP, 20.000 caracteres por
 * requisição e 75.000 caracteres/min. O texto selecionado é fatiado em blocos
 * seguros para respeitar esses limites e melhorar a qualidade das sugestões.
 */

const DEFAULT_API_URL = 'https://api.languagetool.org/v2';
const MAX_CHUNK_SIZE = 4000;
const MAX_SUGGESTIONS = 5;
const IGNORE_KEY = 'mendonca:spell-ignored-words';

export interface SpellError {
  word: string;
  startIndex: number;
  endIndex: number;
  reason: string;
  suggestions: string[];
  ruleId?: string;
  issueType?: string;
}

export interface PhraseCorrection {
  original: string;
  suggestion: string;
  explanation: string;
}

export interface SpellCheckResult {
  originalText: string;
  isCorrect: boolean;
  hasErrors: boolean;
  wordsAnalyzed: number;
  errors: SpellError[];
  phraseCorrections: PhraseCorrection[];
}

// ----- Lista de palavras ignoradas pelo usuário (persistida em localStorage) -----
const ignoredCache: Set<string> = new Set();

try {
  const raw = localStorage.getItem(IGNORE_KEY);
  if (raw) {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      parsed.forEach((w) => {
        if (typeof w === 'string' && w.trim()) ignoredCache.add(w.trim().toLowerCase());
      });
    }
  }
} catch {
  // armazenamento indisponível: segue com lista vazia
}

export function getIgnoredSpellWords(): string[] {
  return [...ignoredCache];
}

export function isIgnoredSpellWord(word: string): boolean {
  return ignoredCache.has(word.trim().toLowerCase());
}

export function ignoreSpellWord(word: string): void {
  ignoredCache.add(word.trim().toLowerCase());
  try {
    localStorage.setItem(IGNORE_KEY, JSON.stringify([...ignoredCache]));
  } catch {
    // armazenamento indisponível: mantém só em memória
  }
}

export function removeIgnoredSpellWord(word: string): void {
  ignoredCache.delete(word.trim().toLowerCase());
  try {
    localStorage.setItem(IGNORE_KEY, JSON.stringify([...ignoredCache]));
  } catch {
    // armazenamento indisponível
  }
}

interface LtMatch {
  message?: string;
  shortMessage?: string;
  offset: number;
  length: number;
  replacements?: { value: string }[];
  rule?: { id?: string; issueType?: string; category?: { id?: string; name?: string } };
}

interface LtChunk {
  text: string;
  start: number;
}

function getApiBase(): string {
  const env = (import.meta.env.VITE_LANGUAGETOOL_API_URL as string | undefined) || '';
  return env.trim().replace(/\/+$/, '') || DEFAULT_API_URL;
}

// Fatia o texto em blocos no limite de caracteres, cortando em quebras de linha/espaços
function buildChunks(text: string, size: number): LtChunk[] {
  if (text.length <= size) return [{ text, start: 0 }];
  const chunks: LtChunk[] = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + size, text.length);
    if (end < text.length) {
      const boundary = Math.max(text.lastIndexOf(' ', end), text.lastIndexOf('\n', end));
      if (boundary > start + size * 0.5) end = boundary;
    }
    chunks.push({ text: text.slice(start, end), start });
    start = end;
  }
  return chunks;
}

async function checkChunk(chunk: LtChunk): Promise<LtMatch[]> {
  const params = new URLSearchParams();
  params.set('text', chunk.text);
  params.set('language', 'pt-BR');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const res = await fetch(`${getApiBase()}/check`, {
      method: 'POST',
      body: params,
      signal: controller.signal
    });

    if (!res.ok) {
      if (res.status === 429) {
        throw new Error('Limite de consultas da API de correção atingido. Aguarde um instante e tente novamente.');
      }
      throw new Error(`A API de correção retornou um erro (${res.status}).`);
    }

    const data = (await res.json()) as { matches?: LtMatch[] };
    return Array.isArray(data.matches) ? data.matches : [];
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        throw new Error('A consulta de correção demorou demais. Verifique sua conexão e tente novamente.', { cause: err });
      }
      const message =
        err instanceof TypeError
          ? 'Não foi possível conectar à API de correção ortográfica. Verifique sua conexão e tente novamente.'
          : err.message || 'Falha ao consultar a API de correção ortográfica.';
      throw new Error(message, { cause: err });
    }
    throw new Error('Falha ao consultar a API de correção ortográfica.', { cause: err });
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Verifica a ortografia de um texto selecionado usando a LanguageTool API.
 * Palavras da lista de ignoradas do usuário são excluídas automaticamente.
 */
export async function checkSpellingAsync(text: string): Promise<SpellCheckResult> {
  const trimmed = (text || '').trim();
  const wordsAnalyzed = (trimmed.match(/[\p{L}\p{N}_\-']+/gu) || []).length;

  if (!trimmed || wordsAnalyzed === 0) {
    return {
      originalText: trimmed,
      isCorrect: true,
      hasErrors: false,
      wordsAnalyzed,
      errors: [],
      phraseCorrections: []
    };
  }

  const chunks = buildChunks(trimmed, MAX_CHUNK_SIZE);
  const chunkResults = await Promise.all(chunks.map(checkChunk));

  const errors: SpellError[] = [];
  const phraseCorrections: PhraseCorrection[] = [];

  chunkResults.forEach((matches, ci) => {
    const base = chunks[ci].start;
    for (const m of matches) {
      const absOffset = base + m.offset;
      const raw = trimmed.slice(absOffset, absOffset + m.length);
      if (!raw.trim()) continue;

      const issueType = m.rule?.issueType || '';
      const suggestions = (m.replacements || []).map(r => r.value).slice(0, MAX_SUGGESTIONS);
      const message = m.message || m.shortMessage || '';

      if (issueType === 'misspelling') {
        const word = raw.trim();
        if (isIgnoredSpellWord(word)) continue;
        errors.push({
          word,
          startIndex: absOffset,
          endIndex: absOffset + m.length,
          reason: message || 'Possível erro de grafia.',
          suggestions,
          ruleId: m.rule?.id,
          issueType
        });
      } else {
        phraseCorrections.push({
          original: raw.trim(),
          suggestion: suggestions[0] || 'rever esta expressão',
          explanation: message || 'Sugestão de estilo ou gramática.'
        });
      }
    }
  });

  const hasErrors = errors.length > 0 || phraseCorrections.length > 0;

  return {
    originalText: trimmed,
    isCorrect: !hasErrors,
    hasErrors,
    wordsAnalyzed,
    errors,
    phraseCorrections
  };
}