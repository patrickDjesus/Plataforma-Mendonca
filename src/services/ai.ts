import { supabase, isSupabaseConfigured } from './supabase';

export interface AiChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const formatSupabaseUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}.supabase.co`;
};
const envUrl = formatSupabaseUrl(rawUrl);

const functionsBase = isSupabaseConfigured && envUrl
  ? `${envUrl.replace(/\/$/, '')}/functions/v1`
  : '';

export const GROQ_DIRECT_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
export const groqDirectKey = (import.meta.env.VITE_GROQ_API_KEY || '').trim();
export const groqDirectModel = (import.meta.env.VITE_GROQ_MODEL || 'openai/gpt-oss-120b').trim();
export const groqFallbackModel = (import.meta.env.VITE_GROQ_FALLBACK_MODEL || 'groq/compound').trim();

// Chama a API do Groq (direta com chave VITE_GROQ_API_KEY ou Edge Function do Supabase).
// Retorna a resposta de texto, ou null em caso de falha.
export async function chatWithGroq(
  messages: AiChatMessage[],
  systemInstruction: string,
  temperature = 0.3
): Promise<string | null> {
  // 1) Se VITE_GROQ_API_KEY estiver configurada, tenta o modelo principal
  if (groqDirectKey) {
    try {
      const res = await fetch(GROQ_DIRECT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqDirectKey}`,
        },
        body: JSON.stringify({
          model: groqDirectModel,
          messages: [
            { role: 'system', content: systemInstruction },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
          ],
          temperature,
        }),
        signal: withTimeout(30000).signal,
      });

      if (res.ok) {
        const data = await res.json();
        const content = data?.choices?.[0]?.message?.content;
        if (typeof content === 'string' && content.trim()) {
          return content.trim();
        }
      }

      // Se falhar ou der rate limit, tenta modelo de fallback mais resiliente
      if (res.status === 429 || !res.ok) {
        try {
          const fallbackRes = await fetch(GROQ_DIRECT_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${groqDirectKey}`,
            },
            body: JSON.stringify({
              model: groqFallbackModel,
              messages: [
                { role: 'system', content: systemInstruction },
                ...messages.map((m) => ({ role: m.role, content: m.content })),
              ],
              temperature,
            }),
            signal: withTimeout(30000).signal,
          });

          if (fallbackRes.ok) {
            const fbData = await fallbackRes.json();
            const fbContent = fbData?.choices?.[0]?.message?.content;
            if (typeof fbContent === 'string' && fbContent.trim()) {
              return fbContent.trim();
            }
          }
        } catch {
          // segue para tentar Edge Function
        }
      }
    } catch {
      // continua para tentar proxy se disponível
    }
  }

  // 2) Fallback: Edge Function do Supabase
  if (!isSupabaseConfigured || !functionsBase) return null;

  try {
    let authHeader = anonKey ? `Bearer ${anonKey}` : '';
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.access_token) {
        authHeader = `Bearer ${data.session.access_token}`;
      }
    } catch {
      // sem sessão -> usa a anon key
    }

    const res = await fetch(`${functionsBase}/groq-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
        ...(anonKey ? { apikey: anonKey } : {}),
      },
      body: JSON.stringify({ messages, systemInstruction }),
      signal: withTimeout(25000).signal,
    });

    if (!res.ok) return null;

    const data = await res.json();
    return typeof data.reply === 'string' && data.reply.trim() ? data.reply.trim() : null;
  } catch {
    return null;
  }
}

/**
 * Cria um AbortController que aborta a requisição após `ms` milissegundos,
 * para que uma requisição lenta/ausente não deixe o app travado.
 */
function withTimeout(ms: number): AbortController & { timeout: ReturnType<typeof setTimeout> } {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return Object.assign(controller, { timeout });
}

export type AiEditAction =
  | 'organize'
  | 'simplify'
  | 'improve'
  | 'summarize'
  | 'expand'
  | 'fix-grammar'
  | 'custom';

export const AI_EDIT_ACTION_LABELS: Record<AiEditAction, string> = {
  organize: 'Organizar e estruturar o texto',
  simplify: 'Tornar mais fácil de entender e didático',
  improve: 'Melhorar a redação e fluidez',
  summarize: 'Resumir em pontos-chave',
  expand: 'Expandir com mais detalhes e exemplos',
  'fix-grammar': 'Corrigir gramática, ortografia e pontuação',
  custom: 'Ajuste personalizado',
};

export function getLocalEditFallback(text: string, action: AiEditAction, customPrompt?: string): string {
  const trimmed = text.trim();
  switch (action) {
    case 'organize': {
      const sentences = trimmed.split(/(?<=[.!?])\s+/).filter(Boolean);
      if (sentences.length <= 1) return `- ${trimmed}`;
      return sentences.map((s) => `- ${s.trim()}`).join('\n');
    }
    case 'simplify':
      return trimmed
        .replace(/\butilizar\b/gi, 'usar')
        .replace(/\brealizar\b/gi, 'fazer')
        .replace(/\bmediante\b/gi, 'por meio de')
        .replace(/\bconsoante\b/gi, 'conforme')
        .replace(/\boutrossim\b/gi, 'além disso')
        .replace(/\bem virtude de\b/gi, 'devido a');
    case 'fix-grammar':
      return trimmed
        .replace(/\s+/g, ' ')
        .replace(/\s+([,.;:!?])/g, '$1')
        .replace(/(^|\.\s+)([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase());
    case 'summarize': {
      const words = trimmed.split(/\s+/);
      if (words.length <= 25) return trimmed;
      return words.slice(0, 25).join(' ') + '...';
    }
    case 'expand':
      return `${trimmed}\n\nExemplo Prático: Na preparação para vestibulares e ENEM, a aplicação deste conceito aparece frequentemente em questões interdisciplinares e análise de situações-problema.`;
    case 'custom':
      if (customPrompt) {
        return `[Ajuste: ${customPrompt}]\n${trimmed}`;
      }
      return trimmed;
    case 'improve':
    default:
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  }
}

export async function aiEditSelectedText(
  selectedText: string,
  action: AiEditAction,
  docTitle?: string,
  discipline?: string,
  customPrompt?: string,
): Promise<string | null> {
  let taskDescription: string;

  switch (action) {
    case 'organize':
      taskDescription =
        `Sua principal missão é REORGANIZAR e ESTRUTURAR o texto para torná-lo EXTREMAMENTE CLARO, ` +
        `lógico e agradável de estudar. Divida em parágrafos bem definidos, utilize tópicos ou marcadores quando ` +
        `adequado para separar conceitos distintos, ordene as ideias por ordem de relevância/causa e efeito, ` +
        `e garanta que um estudante de vestibular consiga assimilar a hierarquia das ideias imediatamente.`;
      break;

    case 'simplify':
      taskDescription =
        `Sua principal missão é TORNAR O TEXTO DE MAIS FÁCIL ENTENDIMENTO. Explique os conceitos de forma didática, ` +
        `direta e intuitiva, substituindo construções excessivamente rebuscadas por explicações claras, ` +
        `sem perder o rigor científico necessário para vestibulares e ENEM. Se houver processos complexos, use uma analogia ou passo a passo claro.`;
      break;

    case 'improve':
      taskDescription =
        `Sua missão é MELHORAR e POLIR a redação, aumentando a fluidez, a coesão textual, a precisão vocabular ` +
        `e a elegância acadêmica, mantendo todo o sentido e conteúdo original intactos.`;
      break;

    case 'summarize':
      taskDescription =
        `Sua missão é RESUMIR o texto em uma síntese esquematizada dos PONTOS-CHAVE essenciais, ` +
        `eliminando redundâncias e destacando as conclusões fundamentais para revisão rápida.`;
      break;

    case 'expand':
      taskDescription =
        `Sua missão é EXPANDIR o texto com explicações mais aprofundadas, contextualização histórica/científica ` +
        `e exemplos práticos que ajudem o aluno a fixar o conteúdo para a prova.`;
      break;

    case 'fix-grammar':
      taskDescription =
        `Sua missão é CORRIGIR minuciosamente ortografia, concordância, regência, crase e pontuação segundo a norma culta do português brasileiro. ` +
        `Retorne o texto com a correção aplicada de forma fluida e natural. NÃO adicione asteriscos (** ou *) nem marcações para indicar o que mudou; apenas entregue o texto correto pronto para o documento.`;
      break;

    case 'custom':
      taskDescription =
        `O aluno pediu o seguinte ajuste específico no texto: "${customPrompt || 'Melhore e organize o texto'}". ` +
        `Atenda fielmente a essa instrução mantendo a qualidade acadêmica.`;
      break;

    default:
      taskDescription = `Ajuste e organize o texto para melhorar seu entendimento e estrutura.`;
  }

  const systemInstruction =
    `Você é a Lumina, assistente de redação e estudos acadêmicos da Plataforma Mendonça, movida por inteligência artificial Groq. ` +
    `O aluno está editando o documento "${docTitle || 'Anotações'}" da disciplina de ${discipline || 'estudos gerais'}.\n\n` +
    `DIRETRIZES FUNDAMENTAIS DE FORMATAÇÃO E RESPOSTA:\n` +
    `1. ${taskDescription}\n` +
    `2. Retorne APENAS o texto resultante final e pronto para inserção no documento. NÃO inclua saudações, introduções ("Aqui está o seu texto:"), notas explicativas, aspas extras no início/fim ou blocos de código com crases triplas desnecessárias.\n` +
    `3. COERÊNCIA COM O DOCUMENTO DE TEXTO:\n` +
    `   - Se o trecho selecionado for apenas uma palavra, oração ou frase em um parágrafo, responda de forma proporcional e direta (sem criar títulos # ou listas a menos que explicitamente solicitado).\n` +
    `   - Formatações markdown: use **negrito** apenas quando for um conceito ou termo fundamental a destacar, e *itálico* para termos em outras línguas ou ênfase técnica. NUNCA use asteriscos vazios ou soltos (** **, * *), nem use asteriscos para sinalizar alterações feitas.\n` +
    `   - Para tópicos ou pontos, utilize hifens normais (- tópico).\n` +
    `4. Se o texto original contiver notações matemáticas em KaTeX/LaTeX no formato \\( ... \\), preserve-as com total fidelidade.\n` +
    `5. Responda em português do Brasil, com linguagem impecável, clara e de fácil compreensão.`;

  const messages: AiChatMessage[] = [
    {
      role: 'user',
      content: `Ajuste o seguinte trecho:\n\n${selectedText}`,
    },
  ];

  const result = await chatWithGroq(messages, systemInstruction, 0.4);
  return result;
}

// ============================================================================
// QUIZ (TESTE) GERADO POR IA A PARTIR DO CONTEÚDO DO DOCUMENTO
// ============================================================================

export type DocQuizQuestionType = 'escrever' | 'assinalar';

export interface DocQuizQuestion {
  type: DocQuizQuestionType;
  question: string;
  options?: string[];
  correctIndex?: number;
  answer?: string;
  explanation?: string;
}

export interface DocQuizResult {
  questions: DocQuizQuestion[];
  summary: string;
}

const ALUNOS_NIVEL =
  'Ensino Médio, em plena preparação para o ENEM e vestibulares (Fuvest, Unicamp, UERJ, UFRGS e similares)';

const extractJsonObject = (text: string): Record<string, unknown> | null => {
  const cleaned = text.replace(/```(?:json)?/gi, '').trim();
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === 'object') return parsed as Record<string, unknown>;
  } catch {
    // continua para tentativa abaixo
  }
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start !== -1 && end > start) {
    try {
      const parsed = JSON.parse(cleaned.slice(start, end + 1));
      if (parsed && typeof parsed === 'object') return parsed as Record<string, unknown>;
    } catch {
      // continua
    }
  }
  return null;
};

export interface DocQuizOptions {
  docTitle: string;
  discipline: string;
  docText: string;
  total: number;
  writeCount: number;
  chooseCount: number;
}

const normalizeDocQuizResult = (raw: Record<string, unknown>): DocQuizResult | null => {
  const list = Array.isArray(raw.questions) ? raw.questions : [];
  if (list.length === 0) return null;

  const questions: DocQuizQuestion[] = list
    .map((q): DocQuizQuestion | null => {
      const item = (q || {}) as Record<string, unknown>;
      if (typeof item.question !== 'string' || !item.question.trim()) return null;
      const type: DocQuizQuestionType =
        String(item.type).toLowerCase().startsWith('escrev') ? 'escrever' : 'assinalar';
      const options = Array.isArray(item.options)
        ? item.options.map(o => String(o)).filter(Boolean)
        : [];
      return {
        type,
        question: String(item.question).trim(),
        options: options.length > 0 ? options : undefined,
        correctIndex:
          typeof item.correctIndex === 'number'
            ? item.correctIndex
            : typeof item.correctIndex === 'string'
              ? parseInt(item.correctIndex, 10)
              : undefined,
        answer: typeof item.answer === 'string' ? item.answer : undefined,
        explanation: typeof item.explanation === 'string' ? item.explanation : undefined,
      };
    })
    .filter((q): q is DocQuizQuestion => q !== null);

  if (questions.length === 0) return null;

  return {
    questions,
    summary: typeof raw.summary === 'string' ? raw.summary.trim() : '',
  };
};

export type QuizGenerationStatus =
  | 'ok'
  | 'no_key'
  | 'rate_limit'
  | 'too_large'
  | 'timeout'
  | 'network'
  | 'parse';

export interface QuizGenerationOutcome {
  status: QuizGenerationStatus;
  quiz: DocQuizResult | null;
}

const rateLimitCode = (status: number, bodyText: string): boolean => {
  if (status === 429) return true;
  return /rate_limit|otpm|tokens per minute/i.test(bodyText);
};

const tooLargeCode = (status: number, bodyText: string): boolean =>
  status === 400 && /(context length|maximum context|too large|exceeds|token limit)/i.test(bodyText);

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

interface QuizAttrs {
  model: string;
  systemInstruction: string;
  userMessage: string;
}

// Faz UMA tentativa de gerar o questionário no modelo informado. Em rate_limit
// também devolve o tempo de espera sugerido (header Retry-After, quando houver).
async function requestQuizWithModel(
  attrs: QuizAttrs,
): Promise<QuizGenerationOutcome & { retryAfterSeconds?: number }> {
  try {
    const res = await fetch(GROQ_DIRECT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${groqDirectKey}`,
      },
      body: JSON.stringify({
        model: attrs.model,
        messages: [
          { role: 'system', content: attrs.systemInstruction },
          { role: 'user', content: attrs.userMessage },
        ],
        temperature: 0.6,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      }),
      signal: withTimeout(45000).signal,
    });

    const bodyText = await res.text().catch(() => '');

    if (rateLimitCode(res.status, bodyText)) {
      const rawRetryAfter = Number(res.headers.get('retry-after'));
      const retryAfterSeconds =
        Number.isFinite(rawRetryAfter) && rawRetryAfter > 0 ? rawRetryAfter : undefined;
      return { status: 'rate_limit', quiz: null, retryAfterSeconds };
    }
    if (tooLargeCode(res.status, bodyText)) {
      return { status: 'too_large', quiz: null };
    }
    if (!res.ok) {
      return { status: 'parse', quiz: null };
    }

    const data = JSON.parse(bodyText);
    const content =
      typeof data?.choices?.[0]?.message?.content === 'string'
        ? data.choices[0].message.content
        : '';
    const raw = extractJsonObject(content);
    if (raw) {
      const result = normalizeDocQuizResult(raw);
      if (result) return { status: 'ok', quiz: result };
    }
    return { status: 'parse', quiz: null };
  } catch (err) {
    if ((err as Error)?.name === 'AbortError') {
      return { status: 'timeout', quiz: null };
    }
    return { status: 'network', quiz: null };
  }
}

// Gera o questionário usando a API do Groq (chave direta VITE_GROQ_API_KEY).
// Se a chave não estiver configurada, tenta a Edge Function groq-chat como
// fallback. Retorna um "status" com o tipo de falha para o frontend mostrar a
// mensagem certa (documento muito grande, limite estourado, sem rede etc.).
//
// Estratégia contra rate limit (429):
//  1. tenta o modelo principal (padrão VITE_GROQ_MODEL);
//  2. em 429, tenta na hora o fallback groq/compound (janela bem maior de tokens);
//  3. se o fallback também limitar, espera o tempo de reset do modelo principal
//     (Retry-After, ou ~20s) e tenta o principal de novo;
//  4. só devolve rate_limit se mesmo assim continuar bloqueado.
export async function generateDocQuiz(opts: DocQuizOptions): Promise<QuizGenerationOutcome> {
  const truncatedText = opts.docText.length > 40000
    ? `${opts.docText.slice(0, 40000)}\n[... conteúdo truncado por limite de tamanho ...]`
    : opts.docText;

  const systemInstruction =
    `Você é a Lumina, professora de estudos da Plataforma Mendonça, com experiência em elaboração de itens ` +
    `para o ENEM e vestibulares (Fuvest, Unicamp, UERJ, UFRGS e similares). Crie um mini-questionário de ` +
    `aprofundamento sobre o documento abaixo, com o rigor de uma banca examinadora.\n\n` +
    `# DADOS\n` +
    `Disciplina: ${opts.discipline}\n` +
    `Nível dos alunos: ${ALUNOS_NIVEL}\n` +
    `Quantidade: ${opts.total} questões, sendo ${opts.chooseCount} do tipo "assinalar" e ${opts.writeCount} do tipo "escrever".\n\n` +
    `<documento titulo="${opts.docTitle}">\n${truncatedText}\n</documento>\n\n` +
    `# PRINCÍPIO CENTRAL\n` +
    `O questionário existe para o aluno COMPREENDER e APLICAR o assunto, nunca para decorar. Cada questão deve ser ` +
    `impossível de acertar apenas localizando um trecho no texto: é preciso entender o conceito e usá-lo em um contexto novo.\n\n` +
    `PROIBIDO:\n` +
    `- perguntar sobre o documento em si (título, seções, estrutura, organização, quantidade de tópicos, nome do capítulo);\n` +
    `- perguntas de memorização ("o que é X?", "quantas etapas tem Y?", "qual o nome de Z?") cuja resposta esteja copiada no texto;\n` +
    `- questões que dependam de conteúdo que não está no documento.\n\n` +
    `# ANATOMIA DE UMA QUESTÃO NÍVEL ENEM/VESTIBULAR\n` +
    `1. Texto-base ou situação-problema: um cenário plausível do mundo real (cotidiano, saúde, ambiente, tecnologia, indústria, ` +
    `agricultura, profissões, debate social, experimento, notícia hipotética, dados descritos em texto, como pequenas tabelas ou ` +
    `resultados de medições). O cenário deve ser necessário para a resposta, não decorativo.\n` +
    `2. Comando claro e objetivo ao final, dizendo exatamente o que o aluno deve fazer.\n` +
    `3. Exigência cognitiva real. Varie entre: interpretar dados ou texto, aplicar um conceito a um caso novo, comparar situações, ` +
    `prever consequências, identificar a causa de um fenômeno, avaliar uma decisão ou afirmação, relacionar dois conceitos, corrigir um raciocínio equivocado.\n` +
    `4. Registro impessoal, preciso e sem ambiguidade, como nas provas oficiais ("Com base no texto...", "A explicação adequada para...", ` +
    `"Considerando os conceitos estudados..."). Nada de linguagem infantilizada.\n` +
    `5. Quando o documento permitir, integre contextos interdisciplinares (ambiente, saúde, tecnologia, sociedade), sem forçar.\n\n` +
    `# COMO ELABORAR CADA TIPO\n` +
    `"assinalar": texto-base + comando + 4 alternativas (a, b, c, d) com UMA única correta.\n` +
    `- Distratores plausíveis, construídos a partir de erros conceituais comuns dos alunos (confusão entre conceitos parecidos, inversão ` +
    `de causa e efeito, generalização indevida, raciocínio correto aplicado ao contexto errado). Um aluno que não domina o conceito deve ser tentado por eles.\n` +
    `- Alternativas homogêneas: mesma estrutura gramatical, tamanho parecido e mesmo nível de detalhe. A correta não pode ser a mais ` +
    `longa, a mais detalhada nem a única com ressalvas.\n` +
    `- Sem pistas: evite "sempre", "nunca", "apenas" e "somente" como sinais de alternativa falsa; evite repetir no enunciado palavras que só a correta contém.\n` +
    `- Não use "todas as anteriores", "nenhuma das anteriores" nem itens combinados ("I e III"). Evite comandos negativos ("exceto", ` +
    `"incorreta") e nunca use dupla negação.\n` +
    `- Se as alternativas forem numéricas, coloque-as em ordem crescente.\n` +
    `- Varie a posição da correta entre as questões (nunca a mesma posição em mais de 2 questões seguidas, e distribua entre as 4 posições).\n\n` +
    `"escrever": situação-problema + comando aberto que exija argumentação (explique, justifique, compare, decida e argumente, proponha ` +
    `e fundamente). Deve permitir uma resposta de 4 a 8 linhas, com raciocínio causal, e não uma resposta de uma palavra. No campo ` +
    `"answer", traga a resposta-modelo e, ao final, os pontos-chave que uma correção deve buscar (2 a 4 itens) e o erro mais comum a observar.\n\n` +
    `# DIFICULDADE E VARIEDADE\n` +
    `- Distribua a dificuldade: cerca de 20% média-baixa, 50% média, 30% alta (questões que exigem combinar dois ou mais conceitos ou interpretar dados).\n` +
    `- Cubra conceitos diferentes do documento; não concentre várias questões no mesmo tópico.\n` +
    `- Cada questão deve ter contexto e cenário diferentes das demais. Não repita questões.\n\n` +
    `# FIDELIDADE E RIGOR\n` +
    `- Os conceitos exigidos para resolver cada questão devem estar no documento. Conhecimento geral consolidado da disciplina pode ser ` +
    `usado apenas para montar o cenário, nunca como o que se cobra.\n` +
    `- Não invente estatísticas, estudos, autores, instituições, leis ou citações reais. Dados numéricos, quando necessários, devem ser ` +
    `claramente hipotéticos, coerentes e cientificamente plausíveis (use expressões como "em um experimento hipotético" ou "em uma simulação").\n` +
    `- Todo conteúdo deve ser correto e sem erros conceituais. Se o documento for curto, aprofunde os conceitos que ele contém em vez de importar assuntos externos.\n\n` +
    `# VERIFICAÇÃO INTERNA (faça em silêncio, antes de responder; não escreva isto na saída)\n` +
    `Para cada questão, confirme: (1) só existe UMA alternativa defensável como correta? (2) um aluno que nunca estudou o conceito, ` +
    `usando apenas bom senso, erraria? (3) a resposta NÃO está copiada literalmente do documento? (4) cada distrator representa um erro ` +
    `de raciocínio identificável? (5) o comando está claro e o cenário é necessário para a resposta? (6) o gabarito (correctIndex ou ` +
    `answer) bate com o conteúdo da explicação? Se alguma resposta for "não", reescreva a questão antes de finalizar.\n\n` +
    `# EXEMPLOS DE PADRÃO (ilustração de estilo, de OUTROS assuntos; NÃO reutilize os temas nem os cenários)\n` +
    `Ruim: "Qual é o título do documento?" / "Quantas etapas tem o processo X?" / "O que é inércia?" (resposta copiada do texto).\n\n` +
    `Bom (assinalar):\n` +
    `"Em uma rodovia, um motorista freia bruscamente e nota que a mochila, solta no banco do carona, é lançada para a frente até bater ` +
    `no painel. Um passageiro comenta que o freio empurrou a mochila. Qual explicação é fisicamente adequada para o movimento da mochila?"\n` +
    `a) O freio aplica sobre a mochila uma força para a frente, proporcional à intensidade da frenagem.\n` +
    `b) Durante a frenagem, surge sobre a mochila uma força de reação que a arremessa no sentido do movimento do carro.\n` +
    `c) A mochila tende a manter sua velocidade, enquanto o carro é desacelerado; por isso ela avança em relação ao veículo.\n` +
    `d) A mochila avança porque objetos em repouso em relação ao carro deixam de ter inércia durante a frenagem.\n` +
    `(Os distratores exploram erros clássicos: confundir inércia com força, mal-entendido sobre ação e reação, e conceito de inércia invertido.)\n\n` +
    `Bom (escrever):\n` +
    `"Um padeiro percebe que a massa de pão, deixada durante a noite em uma sala muito fria, não cresceu como de costume. Explique o que ` +
    `provavelmente ocorreu com o processo de crescimento da massa e proponha uma correção, justificando-a."\n\n` +
    `# FORMATO DE SAÍDA\n` +
    `Responda SOMENTE com JSON válido, sem markdown, sem comentários e sem texto fora do JSON. Regras de sintaxe:\n` +
    `- Dentro dos textos, use aspas simples, nunca aspas duplas.\n` +
    `- Use \\n para quebras de linha dentro de strings. Sem vírgula sobrando no final.\n` +
    `- Fórmulas e símbolos em texto simples ou Unicode (CO₂, m/s², H₂O). Sem LaTeX e sem asteriscos.\n` +
    `- Não inclua campos que não se aplicam ao tipo: "options" e "correctIndex" só em "assinalar"; "answer" só em "escrever".\n` +
    `- Em "assinalar", as alternativas em "options" vão SEM as letras a), b), c), d). "correctIndex" é o índice (0 a 3) da correta.\n` +
    `- Ordene as questões de forma variada (não agrupe todos os tipos juntos).\n\n` +
    `{"questions":[` +
    `{"type":"assinalar","question":"texto-base + comando","options":["...","...","...","..."],"correctIndex":2,"explanation":"por que a correta está certa e por que cada distrator está errado (3 a 6 frases)"},` +
    `{"type":"escrever","question":"situação-problema + comando aberto","answer":"resposta-modelo. Pontos-chave: (1) ... (2) ... (3) ... Erro comum: ...","explanation":"raciocínio esperado explicado, com o PORQUÊ"}` +
    `],"summary":"2 a 5 frases que conectam o assunto à vida real, em tom acolhedor, dirigindo-se ao aluno"}` +
    `\n\nEscreva em português do Brasil.`;

  const userMessage = 'Elabore o questionário agora, seguindo rigorosamente as instruções do sistema.';

  // 1) Tenta a chamada direta à API do Groq, com retry em rate limit.
  if (groqDirectKey) {
    const attrs: QuizAttrs = {
      model: groqDirectModel,
      systemInstruction,
      userMessage,
    };

    let outcome = await requestQuizWithModel(attrs);

    if (outcome.status === 'rate_limit') {
      // 2) tenta na hora o fallback com janela maior de tokens
      const fallback = await requestQuizWithModel({ ...attrs, model: groqFallbackModel });
      if (fallback.status === 'ok' || fallback.status === 'too_large') return fallback;

      // 3) ambos limitados: respeita o reset do modelo principal e tenta de novo
      const waitSeconds = Math.min(30, Math.max(15, outcome.retryAfterSeconds ?? 20));
      await sleep(waitSeconds * 1000);
      outcome = await requestQuizWithModel(attrs);
    }

    return outcome;
  }

  // 2) Sem chave configurada: tenta a Edge Function groq-chat (proxy seguro).
  try {
    const reply = await chatWithGroq(
      [{ role: 'user', content: userMessage }],
      `${systemInstruction}\nGaranta que a resposta seja JSON válido, começando com "{" e terminando com "}".`,
    );
    if (reply) {
      const raw = extractJsonObject(reply);
      if (raw) {
        const result = normalizeDocQuizResult(raw);
        if (result) return { status: 'ok', quiz: result };
      }
    }
    return { status: 'no_key', quiz: null };
  } catch {
    return { status: 'no_key', quiz: null };
  }
}
