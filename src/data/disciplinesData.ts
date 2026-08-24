export interface DocSection {
  id: string;
  heading: string;
  content: string;
  type?: 'paragraph' | 'h1' | 'h2' | 'h3' | 'callout' | 'quote' | 'code' | 'todo' | 'bullet' | 'numbered' | 'divider' | 'table' | 'image';
  callout?: string;
  calloutType?: 'tip' | 'warning' | 'focus' | 'success';
  bulletPoints?: string[];
  formula?: string;
  checked?: boolean;
  align?: 'left' | 'center' | 'right' | 'justify';
  fontSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  textColor?: string;
  highlightColor?: string;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  isStrikethrough?: boolean;
  tableData?: string[][];
  imageUrl?: string;
  imageCaption?: string;
  imageAlt?: string;
}

export interface GlossaryDefinition {
  term: string;
  definition: string;
  example?: string;
  category?: string;
}

export interface NotebookDoc {
  id: string;
  title: string;
  disciplineId: string;
  lastEdited: string;
  createdAt: string;
  author: string;
  tags: string[];
  summary: string;
  sections: DocSection[];
  wordCount: number;
  readTime: string;
  starred?: boolean;
  isPublic?: boolean; // true = 🌐 Público para a comunidade, false = 🔒 Privado
  glossary?: Record<string, GlossaryDefinition>;
}

export interface Discipline {
  id: string;
  name: string;
  category: 'enem' | 'faculdade' | 'pessoal';
  icon: string;
  color: string;
  bgLight: string;
  borderColor: string;
  image: string;
  hoverColor: string;
  hoverGradient: string;
  docCount: number;
  description: string;
  topics: string[];
  documents: NotebookDoc[];
}

export const DISCIPLINES: Discipline[] = [
  {
    id: 'matematica',
    name: 'Matemática',
    category: 'enem',
    icon: 'Calculator',
    color: '#2563EB',
    bgLight: 'bg-blue-50',
    borderColor: 'border-blue-200',
    hoverColor: '#1D4ED8',
    hoverGradient: 'from-blue-600 to-indigo-700',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
    docCount: 3,
    description: 'Álgebra linear, geometria espacial, funções trigonométricas, cálculo e probabilidade estatística.',
    topics: ['Funções & Logaritmos', 'Geometria Espacial', 'Probabilidade'],
    documents: [
      {
        id: 'mat-doc-1',
        title: 'Funções Exponenciais e Logarítmicas no ENEM',
        disciplineId: 'matematica',
        lastEdited: 'Hoje às 15:40',
        createdAt: '18 Ago 2026',
        author: 'Lucas Mendes',
        tags: ['Álgebra', 'ENEM', 'Logaritmo'],
        wordCount: 780,
        readTime: '4 min',
        starred: true,
        summary: 'Propriedades operatórias de logaritmos, curvas de crescimento populacional e decaimento radioativo.',
        sections: [
          {
            id: 's1',
            heading: '1. Fundamentos da Função Exponencial',
            content: 'A função exponencial da forma f(x) = a^x com a > 0 e a ≠ 1 modela fenômenos de crescimento e decaimento contínuo. Quando a > 1, a função é estritamente crescente; quando 0 < a < 1, é estritamente decrescente.',
            callout: 'Dica ENEM: 90% das questões contextualizam meia-vida de substâncias radioativas ou juros compostos.',
            formula: 'f(t) = Q_0 \\cdot e^{k \\cdot t} \\quad \\text{ou} \\quad M = C(1 + i)^t'
          },
          {
            id: 's2',
            heading: '2. Propriedades Operatórias dos Logaritmos',
            content: 'Logaritmo é o expoente que se deve elevar a base b para se obter o logaritmando a: log_b(a) = x ⇔ b^x = a.',
            bulletPoints: [
              'Logaritmo do Produto: log(x · y) = log(x) + log(y)',
              'Logaritmo do Quociente: log(x / y) = log(x) - log(y)',
              'Logaritmo da Potência: log(x^k) = k · log(x)',
              'Mudança de Base: log_b(a) = log_c(a) / log_c(b)'
            ]
          },
          {
            id: 's3',
            heading: '3. Aplicações Práticas: Escala Richter & pH',
            content: 'A magnitude na escala Richter mede a amplitude das ondas sísmicas de forma logarítmica: M = (2/3) · log(E / E_0). Uma variação de 1 unidade na magnitude representa uma liberação de energia cerca de 31,6 vezes maior.'
          }
        ]
      },
      {
        id: 'mat-doc-2',
        title: 'Geometria Espacial: Poliedros, Cilindros e Cones',
        disciplineId: 'matematica',
        lastEdited: 'Ontem às 18:22',
        createdAt: '12 Ago 2026',
        author: 'Lucas Mendes',
        tags: ['Geometria', 'Volumes', 'Áreas'],
        wordCount: 650,
        readTime: '3 min',
        summary: 'Fórmulas de volumes e áreas totais de sólidos geométricos com seções transversais.',
        sections: [
          {
            id: 's1',
            heading: '1. Relação de Euler e Poliedros Convexos',
            content: 'Para todo poliedro convexo vale a célebre relação V - A + F = 2, onde V é o número de vértices, A é o número de arestas e F é o número de faces.',
            formula: 'V - A + F = 2 \\quad \\text{(Relação de Euler)}'
          },
          {
            id: 's2',
            heading: '2. Volume de Sólidos de Revolução',
            content: 'O volume do cilindro reto é o produto da área da base pela altura (V = π·r²·h). Já o cone equivale a 1/3 do volume do cilindro circunscrito (V = 1/3·π·r²·h).'
          }
        ]
      },
      {
        id: 'mat-doc-3',
        title: 'Análise Combinatória & Probabilidade Condicional',
        disciplineId: 'matematica',
        lastEdited: '14 Ago 2026',
        createdAt: '10 Ago 2026',
        author: 'Lucas Mendes',
        tags: ['Combinatória', 'Probabilidade', 'Bayes'],
        wordCount: 820,
        readTime: '5 min',
        summary: 'Princípio fundamental da contagem, permutações, combinações e Teorema de Bayes.',
        sections: [
          {
            id: 's1',
            heading: '1. Arranjo vs Combinação',
            content: 'Em arranjos a ordem dos elementos importa (senhas, pódios); em combinações a ordem não altera o agrupamento (comissões, sorteios de grupos).',
            formula: 'C(n, p) = \\frac{n!}{p!(n-p)!} \\quad \\text{e} \\quad A(n, p) = \\frac{n!}{(n-p)!}'
          }
        ]
      }
    ]
  },
  {
    id: 'portugues',
    name: 'Português & Redação',
    category: 'enem',
    icon: 'PenTool',
    color: '#DC2626',
    bgLight: 'bg-red-50',
    borderColor: 'border-red-200',
    hoverColor: '#DC2626',
    hoverGradient: 'from-red-600 to-rose-700',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80',
    docCount: 2,
    description: 'Gramática normativa, sintaxe de período composto, literatura brasileira e redação dissertativo-argumentativa.',
    topics: ['Redação Nota 1000', 'Sintaxe & Orações', 'Figuras de Linguagem'],
    documents: [
      {
        id: 'port-doc-1',
        title: 'Estrutura Completa da Redação Nota 1000 (ENEM)',
        disciplineId: 'portugues',
        lastEdited: 'Hoje às 11:15',
        createdAt: '15 Ago 2026',
        author: 'Lucas Mendes',
        tags: ['Redação', 'Dissertativo', 'Nota 1000'],
        wordCount: 1100,
        readTime: '6 min',
        starred: true,
        summary: 'Esqueleto dos 4 parágrafos: introdução com tese dupla, D1, D2 e proposta de intervenção com 5 elementos.',
        sections: [
          {
            id: 's1',
            heading: '1. Introdução: Repertório Sociocultural e Tese',
            content: 'A introdução deve contextualizar a temática através de um repertório legitimado (filósofo, literatura, alusão histórica), apresentar o tema de forma explícita e expor duas causas ou problematizações (Tese A e Tese B).',
            callout: 'Dica de ouro: Use conectivos interparágrafos fortes como "Nesse viés", "Outrossim", "Portanto".'
          },
          {
            id: 's2',
            heading: '2. Desenvolvimento 1 e 2: Argumentação Consistente',
            content: 'Cada parágrafo de desenvolvimento deve possuir: Tópico Frasal + Repertório/Fundamentação + Desdobramento Crítico + Fechamento com impacto social.',
            bulletPoints: [
              'D1: Focado na omissão governamental ou negligência estatal (ex: Teoria da Cidadania de Papel de Gilberto Dimenstein).',
              'D2: Focado na inércia social ou raízes culturais (ex: Banalidade do Mal de Hannah Arendt).'
            ]
          },
          {
            id: 's3',
            heading: '3. Proposta de Intervenção (Competência 5): Os 5 Elementos',
            content: 'Para garantir os 200 pontos na Competência 5 é obrigatório apresentar: 1. Agente (Quem?), 2. Ação (O que fará?), 3. Meio/Modo (Por meio de quê?), 4. Efeito (Com qual finalidade?), 5. Detalhamento (Explicação adicional de um dos elementos).'
          }
        ]
      },
      {
        id: 'port-doc-2',
        title: 'Sintaxe do Período Composto: Orações Subordinadas',
        disciplineId: 'portugues',
        lastEdited: '19 Ago 2026',
        createdAt: '08 Ago 2026',
        author: 'Lucas Mendes',
        tags: ['Gramática', 'Sintaxe', 'Conjunções'],
        wordCount: 750,
        readTime: '4 min',
        summary: 'Classificação de orações substantivas, adjetivas explicativas/restritivas e adverbiais causais/consecutivas.',
        sections: [
          {
            id: 's1',
            heading: '1. Orações Subordinadas Substantivas',
            content: 'Exercem função sintática própria de um substantivo na oração principal (Sujeito, Objeto Direto, Objeto Indireto, Complemento Nominal, Predicativo, Apositivo).'
          }
        ]
      }
    ]
  },
  {
    id: 'fisica',
    name: 'Física',
    category: 'enem',
    icon: 'Zap',
    color: '#7C3AED',
    bgLight: 'bg-purple-50',
    borderColor: 'border-purple-200',
    hoverColor: '#6D28D9',
    hoverGradient: 'from-purple-600 to-violet-800',
    image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=800&q=80',
    docCount: 2,
    description: 'Cinemática, Dinâmica Newtoniana, Termodinâmica, Ondulatória, Eletromagnetismo e Física Moderna.',
    topics: ['Termodinâmica', 'Eletrodinâmica', 'Ondulatória'],
    documents: [
      {
        id: 'fis-doc-1',
        title: 'Termodinâmica: Leis e Ciclo de Carnot',
        disciplineId: 'fisica',
        lastEdited: 'Hoje às 09:30',
        createdAt: '19 Ago 2026',
        author: 'Lucas Mendes',
        tags: ['Termodinâmica', 'Calorimetria', 'Carnot'],
        wordCount: 890,
        readTime: '5 min',
        starred: true,
        summary: 'Primeira e Segunda Lei da Termodinâmica, rendimento de máquinas térmicas e o teorema de Carnot.',
        sections: [
          {
            id: 's1',
            heading: '1. Primeira Lei da Termodinâmica: Conservação da Energia',
            content: 'A variação da energia interna (ΔU) de um sistema termodinâmico é a diferença entre a quantidade de calor trocada (Q) e o trabalho realizado pelo gás (W).',
            formula: '\\Delta U = Q - W \\quad \\text{onde } W = P \\cdot \\Delta V \\text{ (para transformações isobáricas)}'
          },
          {
            id: 's2',
            heading: '2. Segunda Lei & O Ciclo Ideal de Carnot',
            content: 'É impossível construir uma máquina térmica que, operando em ciclo, converta integralmente calor em trabalho (Enunciado de Kelvin-Planck). O ciclo de Carnot estabelece o rendimento máximo teórico entre duas fontes.',
            formula: '\\eta_{max} = 1 - \\frac{T_{fria}}{T_{quente}} \\quad (T \\text{ em Kelvin})'
          }
        ]
      },
      {
        id: 'fis-doc-2',
        title: 'Eletrodinâmica: Circuitos e Leis de Kirchhoff',
        disciplineId: 'fisica',
        lastEdited: '16 Ago 2026',
        createdAt: '11 Ago 2026',
        author: 'Lucas Mendes',
        tags: ['Circuitos', 'Resistores', 'Kirchhoff'],
        wordCount: 680,
        readTime: '3 min',
        summary: 'Associação de resistores em série e paralelo, potência dissipada e leis dos nós e malhas.',
        sections: [
          {
            id: 's1',
            heading: '1. Primeira Lei de Ohm e Efeito Joule',
            content: 'A diferença de potencial V é proporcional à corrente I: V = R · I. A potência elétrica dissipada por efeito Joule é P = V · I = R · I² = V² / R.'
          }
        ]
      }
    ]
  },
  {
    id: 'quimica',
    name: 'Química',
    category: 'enem',
    icon: 'FlaskConical',
    color: '#059669',
    bgLight: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    hoverColor: '#047857',
    hoverGradient: 'from-emerald-600 to-teal-800',
    image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80',
    docCount: 2,
    description: 'Química Geral, Estequiometria, Físico-Química, Eletroquímica, Cinética e Química Orgânica.',
    topics: ['Química Orgânica', 'Equilíbrio & pH', 'Eletroquímica'],
    documents: [
      {
        id: 'qui-doc-1',
        title: 'Química Orgânica: Funções Oxigenadas e Nitrogenadas',
        disciplineId: 'quimica',
        lastEdited: 'Ontem às 14:10',
        createdAt: '17 Ago 2026',
        author: 'Lucas Mendes',
        tags: ['Orgânica', 'Álcoois', 'Ésteres'],
        wordCount: 840,
        readTime: '4 min',
        starred: true,
        summary: 'Reconhecimento de grupos funcionais: álcool, aldeído, cetona, ácido carboxílico, éster e aminas.',
        sections: [
          {
            id: 's1',
            heading: '1. Álcoois, Enóis e Fenóis',
            content: 'Álcool possui hidroxila (-OH) ligada a carbono saturado (sp³). Enol possui -OH ligado a carbono insaturado com dupla ligação. Fenol possui -OH ligado diretamente a anel benzênico.',
            bulletPoints: [
              'Álcool Primário: oxidação branda produz Aldeído; oxidação energética produz Ácido Carboxílico.',
              'Álcool Secundário: oxidação produz Cetona.',
              'Álcool Terciário: não sofre oxidação branda comum.'
            ]
          },
          {
            id: 's2',
            heading: '2. Reação de Esterificação de Fischer',
            content: 'Ácido Carboxílico + Álcool em meio ácido catalítico (H₂SO₄) e aquecimento gera Éster + Água.',
            formula: 'R-COOH + R\'-OH \\xrightarrow{H^+} R-COO-R\' + H_2O'
          }
        ]
      },
      {
        id: 'qui-doc-2',
        title: 'Equilíbrio Químico e Princípio de Le Chatelier',
        disciplineId: 'quimica',
        lastEdited: '13 Ago 2026',
        createdAt: '05 Ago 2026',
        author: 'Lucas Mendes',
        tags: ['Físico-Química', 'Equilíbrio', 'pH'],
        wordCount: 710,
        readTime: '3 min',
        summary: 'Constantes Kc e Kp, cálculo de pH e pOH e deslocamento de equilíbrio por temperatura e pressão.',
        sections: [
          {
            id: 's1',
            heading: '1. Deslocamento do Equilíbrio',
            content: 'Quando uma perturbação externa (pressão, temperatura ou concentração) é aplicada a um sistema em equilíbrio, este desloca-se no sentido que atenua tal perturbação.'
          }
        ]
      }
    ]
  },
  {
    id: 'biologia',
    name: 'Biologia',
    category: 'enem',
    icon: 'Dna',
    color: '#16A34A',
    bgLight: 'bg-green-50',
    borderColor: 'border-green-200',
    hoverColor: '#15803D',
    hoverGradient: 'from-green-600 to-emerald-800',
    image: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=800&q=80',
    docCount: 2,
    description: 'Citologia, Genética Molecular, Biologia Celular, Ecologia de Biomas, Fisiologia Humana e Evolução.',
    topics: ['Genética & DNA', 'Ecologia & Biomas', 'Fisiologia Humana'],
    documents: [
      {
        id: 'bio-doc-1',
        title: 'Genética Molecular: Transcrição, Tradução e Epigenética',
        disciplineId: 'biologia',
        lastEdited: 'Ontem às 20:00',
        createdAt: '14 Ago 2026',
        author: 'Lucas Mendes',
        tags: ['Genética', 'DNA', 'Proteínas'],
        wordCount: 920,
        readTime: '5 min',
        starred: true,
        summary: 'O dogma central da biologia molecular, splicing alternativo de RNA e modificações de histonas.',
        sections: [
          {
            id: 's1',
            heading: '1. Replicação Semiconservativa e Transcrição',
            content: 'A enzima RNA Polimerase sintetiza uma fita de pré-mRNA a partir da fita molde de DNA no sentido 5\' para 3\'. Nos eucariontes, ocorre o processamento com adição do Cap 5\', cauda Poli-A e splicing dos íntrons.'
          },
          {
            id: 's2',
            heading: '2. Código Genético e Síntese Proteica',
            content: 'O código genético é universal e degenerado (múltiplos códons codificam o mesmo aminoácido). O códon de início é invariavelmente AUG (Metionina), enquanto UAA, UAG e UGA representam códons de parada (stop codons).'
          }
        ]
      },
      {
        id: 'bio-doc-2',
        title: 'Ecologia: Dinâmica Populacional e Ciclos Biogeoquímicos',
        disciplineId: 'biologia',
        lastEdited: '15 Ago 2026',
        createdAt: '03 Ago 2026',
        author: 'Lucas Mendes',
        tags: ['Ecologia', 'Ciclo do Nitrogênio', 'Biomas'],
        wordCount: 640,
        readTime: '3 min',
        summary: 'Relações ecológicas harmônicas e desarmônicas, pirâmides de biomassa e fluxo energético unidirecional.',
        sections: [
          {
            id: 's1',
            heading: '1. O Ciclo do Nitrogênio e Fixação Biológica',
            content: 'Bactérias do gênero Rhizobium associadas a leguminosas fixam o N₂ atmosférico em amônia (NH₃). Posteriormente, bactérias nitrificantes (Nitrosomonas e Nitrobacter) realizam a nitrificação até nitrato (NO₃⁻).'
          }
        ]
      }
    ]
  },
  {
    id: 'historia',
    name: 'História',
    category: 'enem',
    icon: 'Landmark',
    color: '#D97706',
    bgLight: 'bg-amber-50',
    borderColor: 'border-amber-200',
    hoverColor: '#B45309',
    hoverGradient: 'from-amber-600 to-orange-800',
    image: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=800&q=80',
    docCount: 2,
    description: 'História do Brasil, Período Colonial, Era Vargas, Ditadura Militar, Idade Média, Moderna e Contemporânea.',
    topics: ['Brasil República', 'Guerra Fria', 'Revolução Industrial'],
    documents: [
      {
        id: 'hist-doc-1',
        title: 'Brasil República: Da Era Vargas à Ditadura Militar',
        disciplineId: 'historia',
        lastEdited: '18 Ago 2026',
        createdAt: '09 Ago 2026',
        author: 'Lucas Mendes',
        tags: ['Brasil', 'Vargas', 'Ditadura'],
        wordCount: 1050,
        readTime: '6 min',
        starred: true,
        summary: 'Industrialização por substituição de importações, CLT, Estado Novo, anos JK e o golpe de 1964.',
        sections: [
          {
            id: 's1',
            heading: '1. A Era Vargas (1930 - 1945)',
            content: 'Getúlio Vargas assume o poder após a Revolução de 1930, encerrando a hegemonia cafeeira da República Oligárquica. O período divide-se em: Governo Provisório (1930-1934), Constitucional (1934-1937) e Ditadura do Estado Novo (1937-1945).'
          },
          {
            id: 's2',
            heading: '2. O Plano de Metas de Juscelino Kubitschek (1956 - 1961)',
            content: 'O lema "50 anos em 5" priorizou energia, transporte e indústrias de base com abertura ao capital multinacional automobilístico e a construção de Brasília, culminando em crescente endividamento e inflação.'
          }
        ]
      },
      {
        id: 'hist-doc-2',
        title: 'Guerra Fria: Bipolaridade e Conflitos Periféricos',
        disciplineId: 'historia',
        lastEdited: '11 Ago 2026',
        createdAt: '01 Ago 2026',
        author: 'Lucas Mendes',
        tags: ['Guerra Fria', 'EUA', 'URSS'],
        wordCount: 780,
        readTime: '4 min',
        summary: 'Doutrina Truman, Plano Marshall, Corrida Armada e Espacial e a Crise dos Mísseis em Cuba.',
        sections: [
          {
            id: 's1',
            heading: '1. O Mundo Bipolar (1947 - 1991)',
            content: 'Disputa ideológica, militar e tecnológica entre o bloco capitalista liderado pelos Estados Unidos (OTAN) e o bloco socialista sob influência da União Soviética (Pacto de Varsóvia).'
          }
        ]
      }
    ]
  },
  {
    id: 'geografia',
    name: 'Geografia',
    category: 'enem',
    icon: 'Globe',
    color: '#78350F',
    bgLight: 'bg-amber-50',
    borderColor: 'border-amber-200',
    hoverColor: '#78350F',
    hoverGradient: 'from-amber-900 to-stone-900',
    image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80',
    docCount: 1,
    description: 'Geopolítica mundial, recursos energéticos, cartografia digital, climatologia, urbanização e demografia.',
    topics: ['Transição Energética', 'Urbanização', 'Geopolítica Global'],
    documents: [
      {
        id: 'geo-doc-1',
        title: 'Geopolítica dos Recursos Naturais e Transição Energética',
        disciplineId: 'geografia',
        lastEdited: '17 Ago 2026',
        createdAt: '06 Ago 2026',
        author: 'Lucas Mendes',
        tags: ['Geopolítica', 'Energia', 'Clima'],
        wordCount: 860,
        readTime: '4 min',
        summary: 'Matrizes energéticas globais, hidrocarbonetos no Oriente Médio, minerais críticos (Lítio, Terras Raras).',
        sections: [
          {
            id: 's1',
            heading: '1. A Corrida pelos Minerais Estratégicos',
            content: 'A transição energética para baterias de veículos elétricos e painéis fotovoltaicos impulsiona a disputa geopolítica pelo "Triângulo do Lítio" (Chile, Bolívia e Argentina) e pelo refinamento de terras raras concentrado na China.'
          }
        ]
      }
    ]
  },
  {
    id: 'filosofia',
    name: 'Filosofia & Sociologia',
    category: 'enem',
    icon: 'Brain',
    color: '#4F46E5',
    bgLight: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    hoverColor: '#4338CA',
    hoverGradient: 'from-indigo-600 to-purple-800',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    docCount: 1,
    description: 'Teoria do Conhecimento, Ética, Filosofia Política, Contratualismo, Indústria Cultural e Sociologia.',
    topics: ['Contratualismo', 'Indústria Cultural', 'Ética & Cidadania'],
    documents: [
      {
        id: 'filo-doc-1',
        title: 'Contratualismo Clássico: Hobbes, Locke e Rousseau',
        disciplineId: 'filosofia',
        lastEdited: '19 Ago 2026',
        createdAt: '04 Ago 2026',
        author: 'Lucas Mendes',
        tags: ['Política', 'Contratualismo', 'Estado'],
        wordCount: 950,
        readTime: '5 min',
        starred: true,
        summary: 'Comparativo do Estado de Natureza, pacto social e soberania entre Leviatã, Segundo Tratado e Contrato Social.',
        sections: [
          {
            id: 's1',
            heading: '1. Thomas Hobbes e o Estado Absolutista',
            content: 'No estado de natureza hobbesiano, "o homem é o lobo do homem" (homo homini lupus) em uma guerra de todos contra todos. Para assegurar a sobrevivência, os indivíduos cedem sua liberdade a um soberano absoluto (Leviatã).'
          },
          {
            id: 's2',
            heading: '2. John Locke e o Liberalismo Político',
            content: 'Locke postula direitos naturais inalienáveis: Vida, Liberdade e Propriedade. O governo surge para proteger esses direitos, cabendo aos cidadãos o direito de rebelião caso o pacto seja violado.'
          },
          {
            id: 's3',
            heading: '3. Jean-Jacques Rousseau e a Vontade Geral',
            content: 'Para Rousseau, o homem nasce bom e livre, mas a sociedade e a propriedade privada o corrompem. A soberania legítima reside na vontade geral do povo.'
          }
        ]
      }
    ]
  },
  {
    id: 'ingles',
    name: 'Língua Inglesa',
    category: 'enem',
    icon: 'Languages',
    color: '#334155',
    bgLight: 'bg-slate-100',
    borderColor: 'border-slate-300',
    hoverColor: '#1E293B',
    hoverGradient: 'from-slate-700 to-slate-900',
    image: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80',
    docCount: 1,
    description: 'Reading Comprehension, Linking Words, Phrasal Verbs, Inferência Textual e Vocabulário Acadêmico.',
    topics: ['Academic Connectors', 'Reading Skills', 'Phrasal Verbs'],
    documents: [
      {
        id: 'ing-doc-1',
        title: 'Mastering Academic Linking Words & Discourse Markers',
        disciplineId: 'ingles',
        lastEdited: '12 Ago 2026',
        createdAt: '02 Ago 2026',
        author: 'Lucas Mendes',
        tags: ['Vocab', 'Connectors', 'Essay'],
        wordCount: 720,
        readTime: '3 min',
        summary: 'Conectivos avançados para inferência textual, contraste e causa/efeito em exames internacionais.',
        sections: [
          {
            id: 's1',
            heading: '1. Contrast & Concession Markers',
            content: 'Discourse markers like "Whereas", "Notwithstanding", "Albeit", and "On the contrary" are essential for nuance in academic texts.'
          }
        ]
      }
    ]
  },

  // ===== CATEGORIA: FACULDADE =====
  {
    id: 'faculdade',
    name: 'Faculdade (Computação & Engenharia)',
    category: 'faculdade',
    icon: 'GraduationCap',
    color: '#9333EA',
    bgLight: 'bg-purple-50',
    borderColor: 'border-purple-300',
    hoverColor: '#7E22CE',
    hoverGradient: 'from-purple-700 to-indigo-900',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    docCount: 3,
    description: 'Estruturas de dados avançadas, arquitetura de sistemas distribuídos, algoritmos de grafos e cálculo numérico.',
    topics: ['Árvores AVL & Grafos', 'Kafka & Microsserviços', 'Cálculo Numérico'],
    documents: [
      {
        id: 'fac-doc-1',
        title: 'Estruturas de Dados Avançadas: Árvores AVL, Red-Black & Grafos',
        disciplineId: 'faculdade',
        lastEdited: 'Hoje às 16:10',
        createdAt: '19 Ago 2026',
        author: 'Lucas Mendes (Graduação)',
        tags: ['Algoritmos', 'Complexidade O(log n)', 'Grafos'],
        wordCount: 1250,
        readTime: '7 min',
        starred: true,
        summary: 'Fator de balanceamento em árvores binárias de busca, rotações simples e duplas, e algoritmos Dijkstra e A*.',
        sections: [
          {
            id: 's1',
            heading: '1. Balanceamento em Árvores AVL',
            content: 'Uma árvore AVL é uma árvore binária de busca auto-balanceável onde a diferença entre as alturas das subárvores esquerda e direita de qualquer nó (fator de balanceamento BF = h_L - h_R) deve pertencer ao conjunto {-1, 0, 1}.',
            callout: 'Complexidade de tempo garantida para busca, inserção e remoção no pior caso: O(log n).',
            formula: 'BF(u) = \\text{altura}(u.\\text{esq}) - \\text{altura}(u.\\text{dir}) \\in \\{-1, 0, 1\\}'
          },
          {
            id: 's2',
            heading: '2. Rotações de Correção: LL, RR, LR e RL',
            content: 'Quando uma inserção causa desbalanceamento com |BF| > 1, aplicam-se rotações pontuais. Desvios no mesmo sentido exigem rotação simples; desvios em zigue-zague exigem rotação dupla.',
            bulletPoints: [
              'Caso Esquerda-Esquerda (LL): Rotação simples à direita no nó desbalanceado.',
              'Caso Direita-Direita (RR): Rotação simples à esquerda no nó desbalanceado.',
              'Caso Esquerda-Direita (LR): Rotação simples à esquerda no filho esquerdo seguida de rotação à direita no nó pai.',
              'Caso Direita-Esquerda (RL): Rotação simples à direita no filho direito seguida de rotação à esquerda no pai.'
            ]
          },
          {
            id: 's3',
            heading: '3. Algoritmo de Menor Caminho de Dijkstra em Grafos Ponderados',
            content: 'Utilizando uma fila de prioridade mínima (Min-Heap), o algoritmo de Dijkstra computa as distâncias mínimas a partir de um vértice de origem com complexidade O((|V| + |E|) log |V|).'
          }
        ]
      },
      {
        id: 'fac-doc-2',
        title: 'Arquitetura de Microsserviços e Event-Driven com Apache Kafka',
        disciplineId: 'faculdade',
        lastEdited: 'Ontem às 22:45',
        createdAt: '13 Ago 2026',
        author: 'Lucas Mendes (Graduação)',
        tags: ['Engenharia de Software', 'Microsserviços', 'Kafka'],
        wordCount: 1100,
        readTime: '6 min',
        starred: true,
        summary: 'Padrão Saga para transações distribuídas, CQRS, Event Sourcing e partições em tópicos distribuídos.',
        sections: [
          {
            id: 's1',
            heading: '1. O Problema das Transações Distribuídas: Padrão Saga',
            content: 'Em arquiteturas de microsserviços com bancos de dados isolados por serviço (Database-per-service), transações ACID clássicas em duas fases (2PC) tornam-se gargalos de disponibilidade (Teorema CAP). O padrão Saga coordena uma sequência de transações locais acompanhadas de ações compensatórias em caso de falha.'
          },
          {
            id: 's2',
            heading: '2. Arquitetura Orientada a Eventos (EDA) e Kafka',
            content: 'O Kafka atua como um log de eventos distribuído e persistente no disco com commit sequencial. Consumidores agrupados em Consumer Groups leem partições paralelamente mantendo alta taxa de transferência (throughput).'
          }
        ]
      },
      {
        id: 'fac-doc-3',
        title: 'Cálculo Numérico: Métodos de Newton-Raphson e Interpolação de Lagrange',
        disciplineId: 'faculdade',
        lastEdited: '16 Ago 2026',
        createdAt: '07 Ago 2026',
        author: 'Lucas Mendes (Graduação)',
        tags: ['Cálculo III', 'Análise Numérica', 'Newton'],
        wordCount: 890,
        readTime: '5 min',
        summary: 'Aproximação iterativa de raízes de equações não lineares e convergência quadrática.',
        sections: [
          {
            id: 's1',
            heading: '1. Método Iterativo de Newton-Raphson',
            content: 'Dada uma aproximação inicial x_0, o próximo valor iterado x_{k+1} é obtido pela interseção da reta tangente à curva f(x) no ponto (x_k, f(x_k)) com o eixo das abscissas.',
            formula: 'x_{k+1} = x_k - \\frac{f(x_k)}{f\'(x_k)} \\quad \\text{com } f\'(x_k) \\neq 0'
          }
        ]
      }
    ]
  },

  // ===== CATEGORIA: PESSOAL =====
  {
    id: 'pessoal',
    name: 'Pessoal & Projetos',
    category: 'pessoal',
    icon: 'Sparkles',
    color: '#E11D48',
    bgLight: 'bg-rose-50',
    borderColor: 'border-rose-300',
    hoverColor: '#BE123C',
    hoverGradient: 'from-rose-600 to-pink-800',
    image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=800&q=80',
    docCount: 3,
    description: 'Diário de bordo, metas estratégicas 2026, finanças & investimentos, rotina matinal e resenhas de livros.',
    topics: ['OKRs & Hábitos 2026', 'Finanças & 50/30/20', 'Resenhas de Livros'],
    documents: [
      {
        id: 'pes-doc-1',
        title: 'Diário de Bordo & Planejamento Estratégico 2026',
        disciplineId: 'pessoal',
        lastEdited: 'Hoje às 17:05',
        createdAt: '01 Jan 2026',
        author: 'Lucas Mendes',
        tags: ['Metas', 'Produtividade', 'Hábitos'],
        wordCount: 980,
        readTime: '5 min',
        starred: true,
        summary: 'Metas trimestrais de estudo (OKRs), rotina matinal de hiper-foco, saúde física e mental.',
        sections: [
          {
            id: 's1',
            heading: '1. Visão Geral e OKRs do Ano',
            content: 'O objetivo central de 2026 é atingir excelência acadêmica com nota acima de 860 pontos de média no ENEM / vestibular e consolidar os fundamentos práticos de ciência da computação.',
            bulletPoints: [
              'Meta 1: Manter média semanal de 20h de estudo focado com 85%+ de acerto nos simulados.',
              'Meta 2: Ler 12 livros técnicos e 6 clássicos da literatura brasileira.',
              'Meta 3: Realizar atividade física aeróbica 4 vezes na semana e sono regular de 7h30.'
            ]
          },
          {
            id: 's2',
            heading: '2. Protocolo de Hiper-Foco e Gestão de Energia',
            content: 'Utilização de blocos de estudo de 90 minutos (ciclo ultradiano) intercalados com pausas de descompressão ativa (sem telas ou redes sociais) para permitir a consolidação sináptica da memória.'
          }
        ]
      },
      {
        id: 'pes-doc-2',
        title: 'Finanças Pessoais & Metas de Investimento a Longo Prazo',
        disciplineId: 'pessoal',
        lastEdited: '15 Ago 2026',
        createdAt: '10 Jan 2026',
        author: 'Lucas Mendes',
        tags: ['Finanças', 'Investimentos', 'Reserva'],
        wordCount: 760,
        readTime: '4 min',
        summary: 'Distribuição de ativos (Renda Fixa, Tesouro Selic, ETFs Globais) e regra orçamentária 50-30-20.',
        sections: [
          {
            id: 's1',
            heading: '1. Orçamento e Regra 50/30/20',
            content: '50% para necessidades fundamentais (moradia, alimentação, estudos), 30% para estilo de vida consciente e 20% destinados estritamente para a reserva de emergência e investimentos de longo prazo.'
          }
        ]
      },
      {
        id: 'pes-doc-3',
        title: 'Lista de Leituras & Resenhas Críticas (2026)',
        disciplineId: 'pessoal',
        lastEdited: '08 Ago 2026',
        createdAt: '15 Jan 2026',
        author: 'Lucas Mendes',
        tags: ['Livros', 'Resenhas', 'Literatura'],
        wordCount: 820,
        readTime: '4 min',
        summary: 'Anotações sobre "Hábitos Atômicos", "O Homem que Calculava" e "Memórias Póstumas de Brás Cubas".',
        sections: [
          {
            id: 's1',
            heading: '1. Resenha: Hábitos Atômicos (James Clear)',
            content: 'A tese de que melhorias marginais de 1% todos os dias geram retornos exponenciais cumulativos. Foco nos sistemas e na identidade em vez de obsessão apenas nas metas.'
          }
        ]
      }
    ]
  }
];
