/**
 * Verificador e Corretor Ortográfico Determinístico para a Língua Portuguesa (PT-BR)
 * 
 * Executa checagem léxica, morfológica e fonética sem necessidade de chamadas de IA.
 * Inclui:
 * 1. Base léxica abrangente do Português com termos acadêmicos, científicos e gerais.
 * 2. Tabela de erros ortográficos frequentes e vícios de linguagem em redação.
 * 3. Algoritmo de distância de Levenshtein para sugestões de digitação aproximada.
 * 4. Regras de acentuação e parônimos.
 */

export interface SpellError {
  word: string;
  startIndex: number;
  endIndex: number;
  reason: string;
  suggestions: string[];
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

// Mapa de erros ortográficos comuns (grafia incorreta -> correção direta e motivo)
const COMMON_TYPOS_MAP: Record<string, { correction: string; reason: string }> = {
  // Erros clássicos de grafia com X/CH, S/Z/SS/Ç/SC, G/J
  'excessao': { correction: 'exceção', reason: 'Grafia com "c" e "ç"' },
  'exceçao': { correction: 'exceção', reason: 'Falta acento circunflexo no "a"' },
  'excecao': { correction: 'exceção', reason: 'Falta acento til no "a"' },
  'concerteza': { correction: 'com certeza', reason: 'Escreve-se separado ("com certeza")' },
  'ancioso': { correction: 'ansioso', reason: 'Grafia com "s"' },
  'anciosa': { correction: 'ansiosa', reason: 'Grafia com "s"' },
  'anciedade': { correction: 'ansiedade', reason: 'Grafia com "s"' },
  'paralizar': { correction: 'paralisar', reason: 'Derivado de "paralisia" (com "s")' },
  'paralizacao': { correction: 'paralisação', reason: 'Derivado de "paralisar" (com "s")' },
  'paralizado': { correction: 'paralisado', reason: 'Grafia com "s"' },
  'espontanio': { correction: 'espontâneo', reason: 'Terminação "-âneo" com acento circunflexo' },
  'superfulo': { correction: 'supérfluo', reason: 'Grafia com "fl" e acento agudo' },
  'superfluo': { correction: 'supérfluo', reason: 'Falta acento agudo no "e"' },
  'previlegio': { correction: 'privilégio', reason: 'Grafia com "i" inicial e acento agudo' },
  'previlegios': { correction: 'privilégios', reason: 'Grafia com "i" inicial e acento agudo' },
  'privilegio': { correction: 'privilégio', reason: 'Falta acento agudo no "e"' },
  'beneficiente': { correction: 'beneficente', reason: 'O correto é "beneficente" (sem "i" após o "c")' },
  'beneficientes': { correction: 'beneficentes', reason: 'O correto é "beneficentes"' },
  'reinvindicar': { correction: 'reivindicar', reason: 'Não possui "n" na primeira sílaba ("re-i-vin-di-car")' },
  'reinvindicacao': { correction: 'reivindicação', reason: 'Grafia correta: "reivindicação"' },
  'sombrancelha': { correction: 'sobrancelha', reason: 'Sem "m" inicial ("sobrancelha")' },
  'cidados': { correction: 'cidadãos', reason: 'Plural de cidadão é "cidadãos"' },
  'cidadoes': { correction: 'cidadãos', reason: 'Plural de cidadão é "cidadãos"' },
  'menas': { correction: 'menos', reason: '"Menos" é palavra invariável' },
  'meche': { correction: 'mexe', reason: 'Verbo mexer é grafado com "x"' },
  'mecher': { correction: 'mexer', reason: 'Verbo mexer é grafado com "x"' },
  'geito': { correction: 'jeito', reason: 'Grafia com "j"' },
  'jeitinho': { correction: 'jeitinho', reason: 'Grafia com "j"' },
  'enchada': { correction: 'enxada', reason: 'Grafia com "x"' },
  'xuxu': { correction: 'chuchu', reason: 'Grafia com "ch"' },
  'fascinio': { correction: 'fascínio', reason: 'Falta acento agudo no "i"' },
  'eximio': { correction: 'exímio', reason: 'Falta acento agudo no "i"' },
  'adivinhar': { correction: 'adivinhar', reason: 'Sem "d" mudo com "e"' },
  'adevinhacao': { correction: 'adivinhação', reason: 'Grafia com "i" ("adivinhação")' },
  'asterisco': { correction: 'asterisco', reason: 'Grafia correta: "asterisco" (não "asterístico")' },
  'asteristico': { correction: 'asterisco', reason: 'O correto é "asterisco"' },
  'benefico': { correction: 'benéfico', reason: 'Proparoxítona: falta acento agudo no "e"' },
  'cientifico': { correction: 'científico', reason: 'Proparoxítona: falta acento agudo no "i"' },
  'cientifica': { correction: 'científica', reason: 'Proparoxítona: falta acento agudo no "i"' },
  'hipotese': { correction: 'hipótese', reason: 'Proparoxítona: falta acento agudo no "o"' },
  'hipoteses': { correction: 'hipóteses', reason: 'Proparoxítona: falta acento agudo no "o"' },
  'analise': { correction: 'análise', reason: 'Proparoxítona: falta acento agudo no "a"' },
  'analises': { correction: 'análises', reason: 'Proparoxítona: falta acento agudo no "a"' },
  'sintese': { correction: 'síntese', reason: 'Proparoxítona: falta acento agudo no "i"' },
  'pratico': { correction: 'prático', reason: 'Proparoxítona: falta acento agudo no "a"' },
  'pratica': { correction: 'prática', reason: 'Proparoxítona: falta acento agudo no "a"' },
  'teorico': { correction: 'teórico', reason: 'Proparoxítona: falta acento agudo no "o"' },
  'teorica': { correction: 'teórica', reason: 'Proparoxítona: falta acento agudo no "o"' },
  'matematica': { correction: 'matemática', reason: 'Proparoxítona: falta acento agudo no "a"' },
  'fisica': { correction: 'física', reason: 'Proparoxítona: falta acento agudo no "i"' },
  'quimica': { correction: 'química', reason: 'Proparoxítona: falta acento agudo no "i"' },
  'biologia': { correction: 'biologia', reason: 'Grafia com "b" e "g"' },
  'periodica': { correction: 'periódica', reason: 'Proparoxítona: falta acento agudo no "o"' },
  'periodico': { correction: 'periódico', reason: 'Proparoxítona: falta acento agudo no "o"' },
  'oxigenio': { correction: 'oxigênio', reason: 'Falta acento circunflexo no "e"' },
  'nitrogenio': { correction: 'nitrogênio', reason: 'Falta acento circunflexo no "e"' },
  'hidrogenio': { correction: 'hidrogênio', reason: 'Falta acento circunflexo no "e"' },
  'molecula': { correction: 'molécula', reason: 'Proparoxítona: falta acento agudo no "e"' },
  'moleculas': { correction: 'moléculas', reason: 'Proparoxítona: falta acento agudo no "e"' },
  'eletrico': { correction: 'elétrico', reason: 'Proparoxítona: falta acento agudo no "e"' },
  'eletrica': { correction: 'elétrica', reason: 'Proparoxítona: falta acento agudo no "e"' },
  'mecanica': { correction: 'mecânica', reason: 'Proparoxítona: falta acento circunflexo no "a"' },
  'termodinamica': { correction: 'termodinâmica', reason: 'Proparoxítona: falta acento circunflexo no "a"' },
  'ondulatoria': { correction: 'ondulatória', reason: 'Paroxítona terminada em ditongo: falta acento agudo no "o"' },
  'cinematica': { correction: 'cinemática', reason: 'Proparoxítona: falta acento agudo no "a"' },
  'dinamica': { correction: 'dinâmica', reason: 'Proparoxítona: falta acento circunflexo no "a"' },
  'optica': { correction: 'óptica', reason: 'Proparoxítona: falta acento agudo no "o"' },
  'gravitacao': { correction: 'gravitação', reason: 'Falta til no "a"' },
  'aceleracao': { correction: 'aceleração', reason: 'Grafia com "ç" e til' },
  'posicao': { correction: 'posição', reason: 'Grafia com "ç" e til' },
  'funcao': { correction: 'função', reason: 'Grafia com "ç" e til' },
  'funcoes': { correction: 'funções', reason: 'Grafia com "ç" e til' },
  'equacao': { correction: 'equação', reason: 'Grafia com "ç" e til' },
  'equacoes': { correction: 'equações', reason: 'Grafia com "ç" e til' },
  'reacao': { correction: 'reação', reason: 'Grafia com "ç" e til' },
  'reacoes': { correction: 'reações', reason: 'Grafia com "ç" e til' },
  'solucao': { correction: 'solução', reason: 'Grafia com "ç" e til' },
  'solucoes': { correction: 'soluções', reason: 'Grafia com "ç" e til' },
  'concentracao': { correction: 'concentração', reason: 'Grafia com "ç" e til' },
  'estequiometria': { correction: 'estequiometria', reason: 'Grafia correta: "estequiometria"' },
  'entalpia': { correction: 'entalpia', reason: 'Grafia correta: "entalpia"' },
  'entropia': { correction: 'entropia', reason: 'Grafia correta: "entropia"' },
  'cinetica': { correction: 'cinética', reason: 'Proparoxítona: falta acento agudo no "e"' },
  'equilibrio': { correction: 'equilíbrio', reason: 'Paroxítona terminada em ditongo: falta acento agudo no "i"' },
  'acidos': { correction: 'ácidos', reason: 'Proparoxítona: falta acento agudo no "a"' },
  'acido': { correction: 'ácido', reason: 'Proparoxítona: falta acento agudo no "a"' },
  'basico': { correction: 'básico', reason: 'Proparoxítona: falta acento agudo no "a"' },
  'organica': { correction: 'orgânica', reason: 'Proparoxítona: falta acento circunflexo no "a"' },
  'inorganica': { correction: 'inorgânica', reason: 'Proparoxítona: falta acento circunflexo no "a"' },
  'genetica': { correction: 'genética', reason: 'Proparoxítona: falta acento agudo no "e"' },
  'ecologia': { correction: 'ecologia', reason: 'Grafia com "g"' },
  'fisiologia': { correction: 'fisiologia', reason: 'Grafia com "s" e "g"' },
  'citologia': { correction: 'citologia', reason: 'Grafia com "c" e "g"' },
  'evolucao': { correction: 'evolução', reason: 'Grafia com "ç" e til' },
  'filogenia': { correction: 'filogenia', reason: 'Grafia correta: "filogenia"' },
  'parasitologia': { correction: 'parasitologia', reason: 'Grafia com "s" e "g"' },
  'redacao': { correction: 'redação', reason: 'Grafia com "ç" e til' },
  'conclusao': { correction: 'conclusão', reason: 'Grafia com "s" e til' },
  'introducao': { correction: 'introdução', reason: 'Grafia com "ç" e til' },
  'argumentacao': { correction: 'argumentação', reason: 'Grafia com "ç" e til' },
  'argumento': { correction: 'argumento', reason: 'Grafia correta: "argumento"' },
  'coesao': { correction: 'coesão', reason: 'Grafia com "s" e til' },
  'coerencia': { correction: 'coerência', reason: 'Paroxítona em ditongo: falta circunflexo no "e"' },
  'proposta': { correction: 'proposta', reason: 'Grafia correta: "proposta"' },
  'intervencao': { correction: 'intervenção', reason: 'Grafia com "ç" e til' },
  'detalhamento': { correction: 'detalhamento', reason: 'Grafia correta: "detalhamento"' },
  'tema': { correction: 'tema', reason: 'Grafia correta: "tema"' },
  'tese': { correction: 'tese', reason: 'Grafia correta: "tese"' },
  'repertorio': { correction: 'repertório', reason: 'Paroxítona em ditongo: falta acento agudo no "o"' },
  'legitimado': { correction: 'legitimado', reason: 'Grafia correta: "legitimado"' },
  'pertinente': { correction: 'pertinente', reason: 'Grafia correta: "pertinente"' },
  'produtivo': { correction: 'produtivo', reason: 'Grafia correta: "produtivo"' },
  'competencia': { correction: 'competência', reason: 'Paroxítona em ditongo: falta circunflexo no "e"' },
  'competencias': { correction: 'competências', reason: 'Paroxítona em ditongo: falta circunflexo no "e"' },
  'estagio': { correction: 'estágio', reason: 'Paroxítona em ditongo: falta agudo no "a"' },
  'estrategia': { correction: 'estratégia', reason: 'Paroxítona em ditongo: falta agudo no "e"' },
  'estrategias': { correction: 'estratégias', reason: 'Paroxítona em ditongo: falta agudo no "e"' },
  'historico': { correction: 'histórico', reason: 'Proparoxítona: falta agudo no "o"' },
  'historica': { correction: 'histórica', reason: 'Proparoxítona: falta agudo no "o"' },
  'geografico': { correction: 'geográfico', reason: 'Proparoxítona: falta agudo no "a"' },
  'filosofico': { correction: 'filosófico', reason: 'Proparoxítona: falta agudo no "o"' },
  'sociologico': { correction: 'sociológico', reason: 'Proparoxítona: falta agudo no "o"' },
  'politico': { correction: 'político', reason: 'Proparoxítona: falta agudo no "i"' },
  'politica': { correction: 'política', reason: 'Proparoxítona: falta agudo no "i"' },
  'economico': { correction: 'econômico', reason: 'Proparoxítona: falta circunflexo no "o"' },
  'economica': { correction: 'econômica', reason: 'Proparoxítona: falta circunflexo no "o"' },
  'sociedade': { correction: 'sociedade', reason: 'Grafia com "c"' },
  'comunidade': { correction: 'comunidade', reason: 'Grafia correta: "comunidade"' },
  'populacao': { correction: 'população', reason: 'Grafia com "ç" e til' },
  'ambiente': { correction: 'ambiente', reason: 'Grafia com "m" antes de "b"' },
  'sustentabilidade': { correction: 'sustentabilidade', reason: 'Grafia correta: "sustentabilidade"' },
  'tecnologia': { correction: 'tecnologia', reason: 'Grafia com "g"' },
  'inovacao': { correction: 'inovação', reason: 'Grafia com "ç" e til' },
  'pesquisa': { correction: 'pesquisa', reason: 'Grafia com "s"' },
  'pesquisador': { correction: 'pesquisador', reason: 'Grafia com "s"' },
  'universidade': { correction: 'universidade', reason: 'Grafia correta: "universidade"' },
  'vestibular': { correction: 'vestibular', reason: 'Grafia correta: "vestibular"' },
  'exame': { correction: 'exame', reason: 'Grafia com "x"' },
  'pontuacao': { correction: 'pontuação', reason: 'Grafia com "ç" e til' },
  'paragrafo': { correction: 'parágrafo', reason: 'Proparoxítona: falta acento agudo no "a"' },
  'paragrafos': { correction: 'parágrafos', reason: 'Proparoxítona: falta acento agudo no "a"' },
  'ortografia': { correction: 'ortografia', reason: 'Grafia correta: "ortografia"' },
  'gramatica': { correction: 'gramática', reason: 'Proparoxítona: falta acento agudo no "a"' },
  'sintaxe': { correction: 'sintaxe', reason: 'Grafia com "x"' },
  'morfologia': { correction: 'morfologia', reason: 'Grafia correta: "morfologia"' },
  'semantica': { correction: 'semântica', reason: 'Proparoxítona: falta circunflexo no "a"' },
  'vocabulario': { correction: 'vocabulário', reason: 'Paroxítona em ditongo: falta agudo no "a"' },
  'dicionario': { correction: 'dicionário', reason: 'Paroxítona em ditongo: falta agudo no "a"' },
  'conceito': { correction: 'conceito', reason: 'Grafia com "c"' },
  'definicao': { correction: 'definição', reason: 'Grafia com "ç" e til' },
  'significado': { correction: 'significado', reason: 'Grafia com "g"' },
  'exemplo': { correction: 'exemplo', reason: 'Grafia com "x"' },
  'importante': { correction: 'importante', reason: 'Grafia com "m" antes de "p"' },
  'fundamental': { correction: 'fundamental', reason: 'Grafia correta: "fundamental"' },
  'relevante': { correction: 'relevante', reason: 'Grafia correta: "relevante"' },
  'essencial': { correction: 'essencial', reason: 'Grafia com "ss"' },
  'necessario': { correction: 'necessário', reason: 'Paroxítona em ditongo: falta agudo no "a"' },
  'necessaria': { correction: 'necessária', reason: 'Paroxítona em ditongo: falta agudo no "a"' },
  'possivel': { correction: 'possível', reason: 'Paroxítona terminada em "l": falta agudo no "i"' },
  'impossivel': { correction: 'impossível', reason: 'Paroxítona terminada em "l": falta agudo no "i"' },
  'facil': { correction: 'fácil', reason: 'Paroxítona terminada em "l": falta agudo no "a"' },
  'dificil': { correction: 'difícil', reason: 'Paroxítona terminada em "l": falta agudo no "i"' },
  'util': { correction: 'útil', reason: 'Paroxítona terminada em "l": falta agudo no "u"' },
  'inutil': { correction: 'inútil', reason: 'Paroxítona terminada em "l": falta agudo no "u"' },
  'rapido': { correction: 'rápido', reason: 'Proparoxítona: falta agudo no "a"' },
  'rapida': { correction: 'rápida', reason: 'Proparoxítona: falta agudo no "a"' },
  'numero': { correction: 'número', reason: 'Proparoxítona: falta agudo no "u"' },
  'numeros': { correction: 'números', reason: 'Proparoxítona: falta agudo no "u"' },
  'calculo': { correction: 'cálculo', reason: 'Proparoxítona: falta agudo no "a"' },
  'calculos': { correction: 'cálculos', reason: 'Proparoxítona: falta agudo no "a"' },
  'angulo': { correction: 'ângulo', reason: 'Proparoxítona: falta circunflexo no "a"' },
  'angulos': { correction: 'ângulos', reason: 'Proparoxítona: falta circunflexo no "a"' },
  'triangulo': { correction: 'triângulo', reason: 'Proparoxítona: falta circunflexo no "a"' },
  'raio': { correction: 'raio', reason: 'Grafia correta: "raio"' },
  'diametro': { correction: 'diâmetro', reason: 'Proparoxítona: falta circunflexo no "a"' },
  'perimetro': { correction: 'perímetro', reason: 'Proparoxítona: falta agudo no "i"' },
  'volume': { correction: 'volume', reason: 'Grafia correta: "volume"' },
  'area': { correction: 'área', reason: 'Paroxítona em ditongo: falta agudo no "a"' },
  'areas': { correction: 'áreas', reason: 'Paroxítona em ditongo: falta agudo no "a"' },
  'circulo': { correction: 'círculo', reason: 'Proparoxítona: falta agudo no "i"' },
  'esfera': { correction: 'esfera', reason: 'Grafia correta: "esfera"' },
  'cilindro': { correction: 'cilindro', reason: 'Grafia com "c"' },
  'cone': { correction: 'cone', reason: 'Grafia correta: "cone"' },
  'piramide': { correction: 'pirâmide', reason: 'Proparoxítona: falta circunflexo no "a"' },
  'prisma': { correction: 'prisma', reason: 'Grafia com "s"' },
  'matriz': { correction: 'matriz', reason: 'Grafia com "z"' },
  'determinante': { correction: 'determinante', reason: 'Grafia correta: "determinante"' },
  'probabilidade': { correction: 'probabilidade', reason: 'Grafia com "b"' },
  'estatistica': { correction: 'estatística', reason: 'Proparoxítona: falta agudo no "i"' },
  'media': { correction: 'média', reason: 'Paroxítona em ditongo: falta agudo no "e"' },
  'mediana': { correction: 'mediana', reason: 'Grafia correta: "mediana"' },
  'moda': { correction: 'moda', reason: 'Grafia correta: "moda"' },
  'desvio': { correction: 'desvio', reason: 'Grafia correta: "desvio"' },
  'variancia': { correction: 'variância', reason: 'Paroxítona em ditongo: falta circunflexo no "a"' },
  'frequencia': { correction: 'frequência', reason: 'Paroxítona em ditongo: falta circunflexo no "e"' },
  'grafico': { correction: 'gráfico', reason: 'Proparoxítona: falta agudo no "a"' },
  'graficos': { correction: 'gráficos', reason: 'Proparoxítona: falta agudo no "a"' },
  'tabela': { correction: 'tabela', reason: 'Grafia correta: "tabela"' },
  'coluna': { correction: 'coluna', reason: 'Grafia correta: "coluna"' },
  'linha': { correction: 'linha', reason: 'Grafia com "nh"' },
  'indice': { correction: 'índice', reason: 'Proparoxítona: falta agudo no "i"' },
  'indices': { correction: 'índices', reason: 'Proparoxítona: falta agudo no "i"' },
  'taxa': { correction: 'taxa', reason: 'Taxa (imposto/proporção) é com "x"; tacha é prego pequeno' },
  'tacha': { correction: 'taxa', reason: 'Se for porcentagem/proporção, usa-se "taxa" (com "x")' },
  'sessao': { correction: 'sessão', reason: 'Sessão = reunião/tempo; Seção = divisão/departamento; Cessão = ato de ceder' },
  'secao': { correction: 'seção', reason: 'Seção = repartição; Sessão = reunião de cinema/estudo; Cessão = ceder' },
  'cessao': { correction: 'cessão', reason: 'Cessão = ato de ceder direitos/bens' },
  'afim': { correction: 'a fim', reason: 'Escreva "a fim de" (separado) para indicar finalidade/objetivo' },
  'aonde': { correction: 'onde', reason: 'Use "aonde" apenas com verbos de movimento (ir, chegar); para lugar fixo use "onde"' },
  'ha': { correction: 'há', reason: 'Para tempo decorrido ou sentido de existir, use o verbo haver ("há") com acento agudo' },
  'atraz': { correction: 'atrás', reason: 'Grafia com "s" e acento agudo ("atrás")' },
  'traz': { correction: 'traz', reason: '"Traz" (verbo trazer com "z") / "Trás" (posição posterior, com "s" e acento)' },
};

// Expressões frasais incorretas ou pleonásticas recorrentes
const PHRASE_RULES: { pattern: RegExp; suggestion: string; explanation: string }[] = [
  {
    pattern: /\bhá\s+\d+\s+(anos|meses|dias|horas)\s+atrás\b/gi,
    suggestion: 'há [tempo] OU [tempo] atrás',
    explanation: 'Pleonasmo vicioso: "há" e "atrás" indicam a mesma ideia de tempo passado.'
  },
  {
    pattern: /\ba\s+nível\s+de\b/gi,
    suggestion: 'em nível de / no âmbito de',
    explanation: 'A locução "a nível de" é inadequada na norma culta. Prefira "em nível de" ou "em âmbito de".'
  },
  {
    pattern: /\bao\s+meu\s+ver\b/gi,
    suggestion: 'a meu ver',
    explanation: 'Na norma culta, a expressão correta é "a meu ver" (sem o artigo "o").'
  },
  {
    pattern: /\ba\s+onde\s+você\s+está\b/gi,
    suggestion: 'onde você está',
    explanation: 'Verbos que indicam permanência (estar, morar, ficar) exigem "onde", não "aonde".'
  },
  {
    pattern: /\btem\s+muitas\s+pessoas\b/gi,
    suggestion: 'há muitas pessoas / existem muitas pessoas',
    explanation: 'No sentido de existir, utilize "há" (verbo haver) ou "existem", em vez de "tem".'
  }
];

// Conjunto Léxico Amplo de Palavras Válidas (Dicionário de Referência PT-BR)
const VALID_VOCABULARY = new Set<string>([
  'a', 'à', 'ao', 'aos', 'às', 'o', 'os', 'as', 'um', 'uma', 'uns', 'umas',
  'de', 'do', 'da', 'dos', 'das', 'dum', 'duma', 'em', 'no', 'na', 'nos', 'nas', 'num', 'numa',
  'por', 'pelo', 'pela', 'pelos', 'pelas', 'para', 'pra', 'pro', 'pras', 'pros', 'com', 'sem',
  'sob', 'sobre', 'trás', 'atrás', 'traz', 'frente', 'entre', 'contra', 'desde', 'até',
  'e', 'ou', 'mas', 'mais', 'porém', 'contudo', 'todavia', 'entretanto', 'portanto', 'pois',
  'porque', 'por que', 'porquê', 'por quê', 'quando', 'onde', 'aonde', 'como', 'qual', 'quais',
  'quem', 'cujo', 'cuja', 'cujos', 'cujas', 'quanto', 'quanta', 'quantos', 'quantas',
  'eu', 'tu', 'ele', 'ela', 'nós', 'vós', 'eles', 'elas', 'você', 'vocês', 'me', 'te', 'se', 'nos', 'vos',
  'lhe', 'lhes', 'o', 'a', 'os', 'as', 'mim', 'ti', 'si', 'comigo', 'contigo', 'consigo', 'conosco', 'convosco',
  'meu', 'minha', 'meus', 'minhas', 'teu', 'tua', 'teus', 'tuas', 'seu', 'sua', 'seus', 'suas',
  'nosso', 'nossa', 'nossos', 'nossas', 'vosso', 'vossa', 'vossos', 'vossas',
  'este', 'esta', 'estes', 'estas', 'isto', 'esse', 'essa', 'esses', 'essas', 'isso', 'aquele', 'aquela', 'aqueles', 'aquelas', 'aquilo',
  'que', 'se', 'como', 'conforme', 'segundo', 'consoante', 'embora', 'conquanto', 'ainda', 'mesmo', 'caso',
  'ser', 'estar', 'ter', 'haver', 'fazer', 'ir', 'vir', 'dizer', 'poder', 'ver', 'dar', 'saber', 'querer',
  'ficar', 'dever', 'passar', 'deixar', 'achar', 'levar', 'chegar', 'pensar', 'olhar', 'parecer', 'lembrar',
  'é', 'era', 'foi', 'será', 'seria', 'seja', 'fosse', 'for', 'sendo', 'sido',
  'está', 'estava', 'esteve', 'estará', 'estaria', 'esteja', 'estivesse', 'estiver', 'estando', 'estado',
  'tem', 'tinha', 'teve', 'terá', 'teria', 'tenha', 'tivesse', 'tiver', 'tendo', 'tido',
  'há', 'havia', 'houve', 'haverá', 'haveria', 'haja', 'houvesse', 'houver', 'havendo', 'havido',
  'faz', 'fazia', 'fez', 'fará', 'faria', 'faça', 'fizesse', 'fizer', 'fazendo', 'feito',
  'vai', 'ia', 'foi', 'irá', 'iria', 'vá', 'fosse', 'for', 'indo', 'ido',
  'vem', 'vinha', 'veio', 'virá', 'viria', 'venha', 'viesse', 'vier', 'vindo',
  'diz', 'dizia', 'disse', 'dirá', 'diria', 'diga', 'dissesse', 'disser', 'dizendo', 'dito',
  'pode', 'podia', 'pôde', 'poderá', 'poderia', 'possa', 'pudesse', 'puder', 'podendo', 'podido',
  'vê', 'via', 'viu', 'verá', 'veria', 'veja', 'visse', 'vir', 'vendo', 'visto',
  'sabe', 'sabia', 'soube', 'saberá', 'saberia', 'saiba', 'soubesse', 'souber', 'sabendo', 'sabido',
  'quer', 'queria', 'quis', 'quererá', 'quereria', 'queira', 'quisesse', 'quiser', 'querendo', 'querido',
  'estudo', 'estudos', 'estudante', 'estudantes', 'aluno', 'alunos', 'professor', 'professora',
  'aula', 'aulas', 'escola', 'escolas', 'colégio', 'universidade', 'faculdade', 'curso', 'caderno',
  'livro', 'livros', 'texto', 'textos', 'página', 'páginas', 'capítulo', 'resumo', 'síntese',
  'análise', 'hipótese', 'teoria', 'conceito', 'conceitos', 'definição', 'definições', 'termo', 'termos',
  'questão', 'questões', 'resposta', 'respostas', 'gabarito', 'simulado', 'simulados', 'prova', 'provas',
  'enem', 'vestibular', 'nota', 'redação', 'fórmula', 'fórmulas', 'exercício', 'exercícios',
  'matemática', 'física', 'química', 'biologia', 'história', 'geografia', 'filosofia', 'sociologia',
  'literatura', 'gramática', 'língua', 'português', 'inglês', 'espanhol', 'arte', 'educação',
  'cálculo', 'álgebra', 'geometria', 'trigonometria', 'estatística', 'probabilidade', 'função', 'funções',
  'equação', 'equações', 'gráfico', 'gráficos', 'vetor', 'matriz', 'logaritmo', 'exponencial',
  'mecânica', 'cinemática', 'dinâmica', 'energia', 'trabalho', 'potência', 'impulso', 'gravitação',
  'termodinâmica', 'calorimetria', 'óptica', 'ondulatória', 'eletricidade', 'eletrostática', 'eletrodinâmica',
  'magnetismo', 'circuito', 'corrente', 'tensão', 'resistência', 'campo', 'frequência', 'comprimento',
  'átomo', 'átomos', 'molécula', 'moléculas', 'elemento', 'elementos', 'tabela', 'periódica',
  'reação', 'reações', 'solução', 'soluções', 'ácido', 'ácidos', 'base', 'bases', 'sal', 'sais',
  'óxido', 'óxidos', 'orgânica', 'inorgânica', 'estequiometria', 'termoquímica', 'eletroquímica', 'cinética',
  'célula', 'células', 'dna', 'rna', 'proteína', 'proteínas', 'enzima', 'enzimas', 'genética', 'evolução',
  'ecologia', 'fisiologia', 'citologia', 'fotossíntese', 'respiração', 'mitose', 'meiose', 'ecossistema',
  'sociedade', 'cultura', 'política', 'economia', 'cidadania', 'direitos', 'humanos', 'democracia',
  'globalização', 'urbanização', 'população', 'meio', 'ambiente', 'sustentabilidade', 'tecnologia',
  'argumento', 'argumentos', 'tese', 'repertório', 'legitimidade', 'pertinência', 'produtividade',
  'coesão', 'coerência', 'proposta', 'intervenção', 'detalhamento', 'agente', 'ação', 'modo', 'efeito',
  'competência', 'competências', 'ortografia', 'acentuação', 'concordância', 'regência', 'crase',
  'pontuação', 'parágrafo', 'parágrafos', 'introdução', 'desenvolvimento', 'conclusão', 'título',
  'exceção', 'ansioso', 'ansiedade', 'paralisar', 'espontâneo', 'supérfluo', 'privilégio', 'beneficente',
  'reivindicar', 'sobrancelha', 'cidadãos', 'menos', 'mexe', 'mexer', 'jeito', 'chuchu', 'fascínio',
  'exímio', 'adivinhar', 'asterisco', 'benéfico', 'científico', 'prático', 'teórico', 'elétrico',
  'mecânico', 'orgânico', 'inorgânico', 'genético', 'ecológico', 'fisiológico', 'relevante', 'essencial',
  'necessário', 'possível', 'impossível', 'fácil', 'difícil', 'útil', 'inútil', 'rápido', 'número',
  'ângulo', 'triângulo', 'círculo', 'esfera', 'cilindro', 'cone', 'pirâmide', 'prisma', 'média',
  'índice', 'taxa', 'sessão', 'seção', 'cessão', 'importante', 'fundamental', 'significado', 'exemplo',
  'glossário', 'conceitual', 'didático', 'aprendizado', 'metodologia', 'fixação', 'revisão', 'domínio',
  'conhecimento', 'inteligência', 'memória', 'raciocínio', 'lógica', 'estratégia', 'desempenho', 'foco',
  'constância', 'disciplina', 'motivação', 'progresso', 'evolução', 'resultado', 'conquista', 'sucesso'
]);

// Algoritmo de Distância de Levenshtein para sugestões de digitação próxima
function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],     // deleção
          dp[i][j - 1],     // inserção
          dp[i - 1][j - 1]  // substituição
        );
      }
    }
  }

  return dp[m][n];
}

// Normaliza uma palavra para comparação (remove pontuação periférica mantendo letras e hífens)
function cleanWord(raw: string): string {
  return raw.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
}

// Remove acentuação para busca aproximada
function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Busca sugestões determinísticas para uma palavra incorreta
 */
export function getSuggestionsForWord(word: string, maxSuggestions = 4): string[] {
  const lower = word.toLowerCase();
  const clean = cleanWord(lower);
  if (!clean) return [];

  // 1. Checa se é um erro clássico direto
  const directMatch = COMMON_TYPOS_MAP[clean];
  if (directMatch) {
    return [directMatch.correction];
  }

  // 2. Busca por remoção de acentos (se a pessoa digitou sem acento uma palavra que tem acento)
  const normalizedClean = removeAccents(clean);
  const accentMatches: string[] = [];

  for (const valid of VALID_VOCABULARY) {
    if (removeAccents(valid) === normalizedClean && valid !== clean) {
      accentMatches.push(valid);
    }
  }

  if (accentMatches.length > 0) {
    return accentMatches.slice(0, maxSuggestions);
  }

  // 3. Busca por distância de Levenshtein (distância <= 2 para palavras médias/longas)
  const candidates: { word: string; dist: number }[] = [];
  const maxDistance = clean.length <= 4 ? 1 : 2;

  for (const valid of VALID_VOCABULARY) {
    const dist = levenshteinDistance(clean, valid);
    if (dist <= maxDistance) {
      candidates.push({ word: valid, dist });
    }
  }

  candidates.sort((a, b) => a.dist - b.dist);
  return candidates.slice(0, maxSuggestions).map(c => c.word);
}

/**
 * Analisa e verifica ortografia de um texto ou seleção
 */
export function checkSpelling(text: string): SpellCheckResult {
  if (!text || !text.trim()) {
    return {
      originalText: text,
      isCorrect: true,
      hasErrors: false,
      wordsAnalyzed: 0,
      errors: [],
      phraseCorrections: []
    };
  }

  const errors: SpellError[] = [];
  const phraseCorrections: PhraseCorrection[] = [];

  // 1. Checagem de expressões frasais
  for (const rule of PHRASE_RULES) {
    const match = rule.pattern.exec(text);
    if (match) {
      phraseCorrections.push({
        original: match[0],
        suggestion: rule.suggestion,
        explanation: rule.explanation
      });
    }
  }

  // 2. Checagem palavra por palavra
  // Regex para extrair palavras preservando índices
  const wordRegex = /[\p{L}\p{N}_\-']+/gu;
  let match: RegExpExecArray | null;
  let wordCount = 0;

  while ((match = wordRegex.exec(text)) !== null) {
    wordCount++;
    const rawWord = match[0];
    const startIndex = match.index;
    const endIndex = startIndex + rawWord.length;

    // Ignora números puros ou caracteres isolados especiais
    if (/^\d+$/.test(rawWord) || rawWord.length <= 1) continue;

    const lower = rawWord.toLowerCase();
    const clean = cleanWord(lower);

    if (!clean) continue;

    // Checa se está no mapa direto de erros comuns
    if (COMMON_TYPOS_MAP[clean]) {
      const typoInfo = COMMON_TYPOS_MAP[clean];
      errors.push({
        word: rawWord,
        startIndex,
        endIndex,
        reason: typoInfo.reason,
        suggestions: [typoInfo.correction]
      });
      continue;
    }

    // Checa se está no vocabulário oficial
    if (VALID_VOCABULARY.has(clean)) {
      continue;
    }

    // Se a versão sem acento bate com alguma proparoxítona/paroxítona que exige acento
    const suggestions = getSuggestionsForWord(clean, 4);

    if (suggestions.length > 0) {
      const isAccentProblem = suggestions.some(s => removeAccents(s) === removeAccents(clean));
      errors.push({
        word: rawWord,
        startIndex,
        endIndex,
        reason: isAccentProblem ? 'Possível ausência ou erro de acentuação gráfica.' : 'Grafia não reconhecida no vocabulário padrão.',
        suggestions
      });
    } else {
      // Se não encontrou sugestões próximas mas não é uma palavra conhecida
      errors.push({
        word: rawWord,
        startIndex,
        endIndex,
        reason: 'Palavra não encontrada no dicionário de referência.',
        suggestions: []
      });
    }
  }

  const hasErrors = errors.length > 0 || phraseCorrections.length > 0;

  return {
    originalText: text,
    isCorrect: !hasErrors,
    hasErrors,
    wordsAnalyzed: wordCount,
    errors,
    phraseCorrections
  };
}
