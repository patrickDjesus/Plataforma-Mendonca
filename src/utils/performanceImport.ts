export interface ImportedAnswer {
  subject: string;
  topic: string;
  isCorrect: boolean;
}

export interface ImportParseResult {
  records: ImportedAnswer[];
  errors: string[];
  rawCount: number;
}

// Normatiza nomes de disciplina para os valores padroes exibidos no app
const normalizeDiscipline = (raw: string): string => {
  const value = (raw || '').trim();
  const lower = value.toLowerCase();
  if (lower.includes('matemá') || lower.includes('matematic') || lower.includes('álgebra') || lower.includes('calculo')) {
    return 'Matemática & Cálculo';
  }
  if (lower.includes('fís') || lower.includes('fis')) return 'Física Clássica & Moderna';
  if (lower.includes('quím') || lower.includes('quim')) return 'Química Geral & Orgânica';
  if (lower.includes('biol') || lower.includes('gené') || lower.includes('gene')) return 'Biologia & Genética';
  if (lower.includes('hist') || lower.includes('human')) return 'História & Humanidades';
  if (lower.includes('lingu') || lower.includes('liter') || lower.includes('portugu')) return 'Linguagens & Literatura';
  if (lower.includes('comput') || lower.includes('ia') || lower.includes('programa')) return 'Ciência da Computação & IA';
  if (value) return value;
  return 'Geral';
};

// Parseia o JSON colado pelo usuario. Aceita:
//  [{ "disciplina": "...", "conteudo": "...", "acertou": true|false }, ...]
// e tambem { subject, topic, correct } / { matéria, conteúdo, correto } etc.
export const parseImportedAnswers = (rawJson: string): ImportParseResult => {
  const errors: string[] = [];
  const records: ImportedAnswer[] = [];
  let rawCount = 0;

  if (!rawJson || !rawJson.trim()) {
    return { records, errors: ['Cole um JSON válido no campo acima.'], rawCount };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return { records, errors: ['JSON inválido. Verifique se há erros de sintaxe (chaves, colchetes e vírgulas).'], rawCount };
  }

  if (!Array.isArray(parsed)) {
    return { records, errors: ['O JSON deve ser um array de questões, ex: [{ "disciplina": "Matemática", "conteudo": "Funções", "acertou": true }].'], rawCount };
  }

  if (parsed.length === 0) {
    return { records, errors: ['O array está vazio — não há questões para importar.'], rawCount };
  }

  parsed.forEach((item, idx) => {
    rawCount++;
    if (!item || typeof item !== 'object') {
      errors.push(`Item ${idx + 1}: não é um objeto válido.`);
      return;
    }

    const obj = item as Record<string, unknown>;

    const discipline =
      asString(obj.disciplina) || asString(obj.subject) || asString(obj.materia) || asString(obj.matéria) || '';
    const topic =
      asString(obj.conteudo) || asString(obj.content) || asString(obj.topico) || asString(obj.tópico) || asString(obj.topic) || '';
    const correct = asBool(obj.acertou, obj.correct, obj.correto, obj.hit, obj.right);

    if (!discipline) {
      errors.push(`Item ${idx + 1}: campo "disciplina" é obrigatório.`);
    }
    if (!topic) {
      errors.push(`Item ${idx + 1}: campo "conteudo" é obrigatório.`);
    }
    if (correct === null) {
      errors.push(`Item ${idx + 1}: campo "acertou" deve ser true ou false.`);
    }

    if (discipline && topic && correct !== null) {
      records.push({
        subject: normalizeDiscipline(discipline),
        topic: topic.trim(),
        isCorrect: correct,
      });
    }
  });

  return { records, errors, rawCount };
};

const asString = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return '';
};

const asBool = (...values: unknown[]): boolean | null => {
  for (const v of values) {
    if (typeof v === 'boolean') return v;
    if (typeof v === 'string') {
      const lower = v.trim().toLowerCase();
      if (lower === 'true' || lower === 'sim' || lower === 'correcto' || lower === 'acertou' || lower === '1') return true;
      if (lower === 'false' || lower === 'não' || lower === 'nao' || lower === 'errei' || lower === '0') return false;
    }
    if (typeof v === 'number') {
      if (v === 1) return true;
      if (v === 0) return false;
    }
  }
  return null;
};
