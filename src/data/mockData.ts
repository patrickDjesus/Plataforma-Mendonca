import { ConceptNode, QuizQuestion, RecentMaterial } from '../types/design';

export const EXAM_EVENT = {
  title: 'Simulado Nacional Unificado & ENEM 2026',
  targetDate: new Date('2026-11-08T08:00:00'),
  daysRemaining: 76,
  hoursRemaining: 14,
  readinessScore: 84, // percentage
  targetScore: 920,
  currentPredictedScore: 865,
};

export const STREAK_DATA = {
  currentStreak: 14,
  bestStreak: 28,
  weekHours: 18.5,
  targetWeeklyHours: 20,
  days: [
    { day: 'SEG', full: 'Segunda', active: true, minutes: 120, date: '17 Ago' },
    { day: 'TER', full: 'Terça', active: true, minutes: 145, date: '18 Ago' },
    { day: 'QUA', full: 'Quarta', active: true, minutes: 95, date: '19 Ago' },
    { day: 'QUI', full: 'Quinta', active: true, minutes: 160, date: '20 Ago' },
    { day: 'SEX', full: 'Sexta', active: true, minutes: 130, date: '21 Ago' },
    { day: 'SÁB', full: 'Sábado', active: true, minutes: 210, date: '22 Ago' },
    { day: 'DOM', full: 'Hoje', active: true, isToday: true, minutes: 85, date: '23 Ago' },
  ],
  freezeTokens: 2,
};

export const RECENT_MATERIALS: RecentMaterial[] = [
  {
    id: 'mat-1',
    title: 'Redes Neurais Convolucionais & Visão Computacional',
    module: 'Módulo 4 • Deep Learning',
    category: 'Inteligência Artificial',
    progress: 78,
    lastAccess: 'Há 15 minutos',
    readTime: '12 min restantes',
    iconName: 'Sparkles',
    colorScheme: 'purple',
  },
  {
    id: 'mat-2',
    title: 'Termodinâmica Estatística & Entropia Quântica',
    module: 'Módulo 2 • Física Avançada',
    category: 'Física Teórica',
    progress: 42,
    lastAccess: 'Ontem às 21:30',
    readTime: '25 min restantes',
    iconName: 'Atom',
    colorScheme: 'cyan',
  },
  {
    id: 'mat-3',
    title: 'Equações Diferenciais Parciais: Navier-Stokes',
    module: 'Módulo 6 • Análise Matemática',
    category: 'Cálculo Superior',
    progress: 95,
    lastAccess: 'Há 2 dias',
    readTime: 'Concluído',
    iconName: 'Binary',
    colorScheme: 'blue',
  },
  {
    id: 'mat-4',
    title: 'Plasticidade Sináptica e Consolidação de Memória',
    module: 'Módulo 1 • Neurobiologia',
    category: 'Neurociência',
    progress: 60,
    lastAccess: 'Há 3 dias',
    readTime: '18 min restantes',
    iconName: 'Brain',
    colorScheme: 'purple',
  },
];

export const CONCEPT_NODES: ConceptNode[] = [
  {
    id: 'node-1',
    label: 'Plasticidade Sináptica',
    category: 'Neurociência',
    color: '#8B5CF6',
    glowColor: 'rgba(139, 92, 246, 0.4)',
    x: 420,
    y: 260,
    size: 28,
    mastery: 92,
    description: 'Capacidade do sistema nervoso de modificar suas conexões em resposta à experiência e aprendizado (LTP e LTD).',
    connections: ['node-2', 'node-3', 'node-6'],
    synapticStrength: 5,
    tags: ['LTP', 'Potenciação', 'Memória a Longo Prazo'],
  },
  {
    id: 'node-2',
    label: 'Redes Hebbianas',
    category: 'Neurociência',
    color: '#8B5CF6',
    glowColor: 'rgba(139, 92, 246, 0.4)',
    x: 270,
    y: 180,
    size: 22,
    mastery: 85,
    description: 'Princípio do postulado de Hebb: "Neurônios que disparam juntos, conectam-se juntos".',
    connections: ['node-1', 'node-4'],
    synapticStrength: 4,
    tags: ['Regra de Hebb', 'Associação Sináptica'],
  },
  {
    id: 'node-3',
    label: 'Backpropagation',
    category: 'Algoritmos',
    color: '#06B6D4',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    x: 620,
    y: 220,
    size: 26,
    mastery: 88,
    description: 'Algoritmo de propagação reversa do gradiente para ajuste de pesos em redes neurais multicamadas.',
    connections: ['node-1', 'node-5', 'node-6'],
    synapticStrength: 5,
    tags: ['Gradiente Descendente', 'Regra da Cadeia', 'Loss Function'],
  },
  {
    id: 'node-4',
    label: 'Codificação Esparsa',
    category: 'Neurociência',
    color: '#8B5CF6',
    glowColor: 'rgba(139, 92, 246, 0.4)',
    x: 160,
    y: 330,
    size: 18,
    mastery: 64,
    description: 'Representação neural onde apenas uma pequena fração de neurônios está ativa simultaneamente.',
    connections: ['node-2'],
    synapticStrength: 3,
    tags: ['Eficiência Energética', 'Córtex Visual'],
  },
  {
    id: 'node-5',
    label: 'Convoluções 2D',
    category: 'Algoritmos',
    color: '#06B6D4',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    x: 770,
    y: 320,
    size: 20,
    mastery: 73,
    description: 'Operação matemática de filtro deslizante para extração de mapas de características visuais.',
    connections: ['node-3', 'node-7'],
    synapticStrength: 4,
    tags: ['Filtros Sobel', 'Receptive Field', 'Feature Maps'],
  },
  {
    id: 'node-6',
    label: 'Otimização por Gradiente',
    category: 'Cálculo',
    color: '#1E40AF',
    glowColor: 'rgba(30, 64, 175, 0.4)',
    x: 520,
    y: 430,
    size: 24,
    mastery: 90,
    description: 'Método iterativo de primeira ordem para encontrar mínimos locais de funções custo multidimensionais.',
    connections: ['node-1', 'node-3', 'node-7', 'node-8'],
    synapticStrength: 5,
    tags: ['Adam', 'Momentum', 'Learning Rate'],
  },
  {
    id: 'node-7',
    label: 'Atenção & Transformers',
    category: 'Algoritmos',
    color: '#06B6D4',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    x: 720,
    y: 490,
    size: 24,
    mastery: 79,
    description: 'Mecanismo de auto-atenção (Scaled Dot-Product Attention) que calcula dependências contextuais globais.',
    connections: ['node-5', 'node-6'],
    synapticStrength: 4,
    tags: ['Multi-Head', 'Q-K-V', 'Positional Encoding'],
  },
  {
    id: 'node-8',
    label: 'Entropia de Shannon',
    category: 'Física Quântica',
    color: '#1E40AF',
    glowColor: 'rgba(30, 64, 175, 0.4)',
    x: 340,
    y: 530,
    size: 20,
    mastery: 68,
    description: 'Medida quantitativa da incerteza ou do conteúdo médio de informação gerado por uma fonte estocástica.',
    connections: ['node-6'],
    synapticStrength: 3,
    tags: ['Teoria da Informação', 'Kullback-Leibler'],
  }
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    subject: 'Inteligência Artificial & Otimização',
    topic: 'Gradiente Descendente e Taxa de Aprendizado',
    difficulty: 'Médio',
    statement: 'Em um modelo de deep learning treinado com otimizador SGD com Momentum, observa-se que a função de perda oscila bruscamente ao redor do mínimo global sem convergir. Qual das seguintes intervenções de hiperparâmetros é a mais recomendada para estabilizar a convergência?',
    codeSnippet: `optimizer = torch.optim.SGD(
    model.parameters(), 
    lr=0.085, # <- suspeito de instabilidade
    momentum=0.9, 
    weight_decay=1e-4
)`,
    options: [
      {
        id: 'A',
        text: 'Aumentar a taxa de aprendizado (lr) e remover o termo de decaimento de peso (weight_decay).',
        isCorrect: false,
        explanation: 'Incorreto. Aumentar a taxa de aprendizado exacerbaria ainda mais a instabilidade e o comportamento de overshoot.',
      },
      {
        id: 'B',
        text: 'Implementar um agendador de decaimento de taxa de aprendizado (Learning Rate Decay) e aplicar clipping de gradiente.',
        isCorrect: true,
        explanation: 'Correto! Reduzir a taxa de aprendizado conforme o treinamento avança evita que os passos ultrapassem vales estreitos da loss surface, estabilizando o SGD com Momentum.',
      },
      {
        id: 'C',
        text: 'Alterar a função de ativação de todas as camadas ocultas para Sigmoid para limitar as saídas entre 0 e 1.',
        isCorrect: false,
        explanation: 'Incorreto. Substituir ativações por Sigmoid causaria saturação e o problema do desaparecimento de gradiente (vanishing gradient).',
      },
      {
        id: 'D',
        text: 'Reduzir o tamanho do lote (batch size) para 1 para forçar atualizações estocásticas puras.',
        isCorrect: false,
        explanation: 'Incorreto. Batch size = 1 gera variância extrema nas estimativas do gradiente, aumentando o ruído e as oscilações.',
      },
    ],
    aiHint: 'Considere como passos muito largos em paisagens com alta curvatura geram o efeito de "gangorra" (overshoot) nos vales da função de custo.',
  },
  {
    id: 2,
    subject: 'Neurobiologia Cognitiva',
    topic: 'Plasticidade Sináptica Hebbiana',
    difficulty: 'Fácil',
    statement: 'O fenômeno da Potenciação a Longo Prazo (LTP) no hipocampo é considerado a base celular primordial para a memória explícita. Qual receptor glutamatérgico atua como o principal "detector de coincidência" para o influxo de cálcio (Ca²⁺)?',
    options: [
      {
        id: 'A',
        text: 'Receptor AMPA ionotrópico dependente exclusivamente de voltagem basal.',
        isCorrect: false,
        explanation: 'Receptores AMPA conduzem primariamente Na+ e são responsáveis pela despolarização inicial rápida.',
      },
      {
        id: 'B',
        text: 'Receptor NMDA, cuja remoção do bloqueio por Mg²⁺ requer despolarização pós-sináptica concomitante à ligação do glutamato.',
        isCorrect: true,
        explanation: 'Exato! O receptor NMDA atua como detector de coincidência pois só permite influxo massivo de Ca²⁺ se houver glutamato ligado E despolarização para expulsar o íon Mg²⁺ do poro.',
      },
      {
        id: 'C',
        text: 'Receptor GABA-A ligado a canais de cloro hiperpolarizantes.',
        isCorrect: false,
        explanation: 'GABA-A é o principal receptor inibitório do SNC, não excitatório glutamatérgico.',
      },
      {
        id: 'D',
        text: 'Receptores metabotrópicos mGluR7 acoplados a proteína G inibitória Gi.',
        isCorrect: false,
        explanation: 'mGluR7 atua frequentemente como autorreceptor pré-sináptico inibindo liberação.',
      },
    ],
    aiHint: 'Lembre-se do íon que bloqueia o canal em repouso eletroquímico e requer despolarização prévia.',
  },
  {
    id: 3,
    subject: 'Cálculo Vetorial & Física Matemática',
    topic: 'Teorema da Divergência de Gauss',
    difficulty: 'Difícil',
    statement: 'Seja um campo vetorial F(x,y,z) = (2x, 3y, -z) definido sobre uma esfera sólida fechada S de raio R=2 centrada na origem. O fluxo total do campo saindo através da superfície da esfera é:',
    options: [
      {
        id: 'A',
        text: '128π / 3',
        isCorrect: true,
        explanation: 'Pelo Teorema da Divergência: div(F) = 2 + 3 - 1 = 4. O fluxo é a integral tripla de 4 no volume da esfera: 4 * (4/3 π R³) = 4 * (4/3 π 8) = 128π / 3.',
      },
      {
        id: 'B',
        text: '64π',
        isCorrect: false,
        explanation: 'Cálculo incorreto da integral de volume.',
      },
      {
        id: 'C',
        text: '32π / 3',
        isCorrect: false,
        explanation: 'Ocorreu esquecimento do fator constante 4 proveniente da divergência div(F).',
      },
      {
        id: 'D',
        text: 'Zero, pois a divergência se anula no centro da esfera.',
        isCorrect: false,
        explanation: 'A divergência é constante e igual a 4 em todo o espaço.',
      },
    ],
    aiHint: 'Aplique o Teorema da Divergência: transforme a integral de superfície fechada em uma integral de volume de div(F).',
  }
];

export const NOTEBOOK_CONTENT = {
  title: 'Mecanismos Moleculares da Memória & Redes Neurais',
  breadcrumb: 'Neurociência Aplicada > Módulo 3 > Aula 14',
  lastEdited: 'Salvo automaticamente na nuvem há 2 min',
  sections: [
    {
      id: 'sec-1',
      heading: '1. Introdução: O Postulado de Hebb e a Plasticidade Sináptica',
      content: `A plasticidade sináptica descreve a habilidade dinâmica com que os neurônios ajustam a eficácia e a força de suas conexões sinápticas. Proposto pioneiramente por Donald Hebb em 1949, o princípio fundamental dita que quando um axônio da célula A excita repetidamente a célula B, ocorre algum processo de crescimento ou alteração metabólica em uma ou ambas as células que aumenta a eficiência de A no disparo de B.`,
      callout: 'Analogia Computacional: No aprendizado profundo artificial, isso se reflete diretamente nas matrizes de pesos sinápticos W atualizadas via matriz de gradientes conjugados.',
    },
    {
      id: 'sec-2',
      heading: '2. Cascata Bioquímica da Potenciação a Longo Prazo (LTP)',
      content: `A indução da LTP depende estritamente da ativação coordenada de receptores glutamatérgicos do tipo AMPA e NMDA. Em condições de repouso, o receptor NMDA encontra-se estericamente ocluído por um íon magnésio (Mg²⁺). Apenas a despolarização prolongada da membrana pós-sináptica é capaz de repelir eletrostaticamente o Mg²⁺, permitindo o influxo maciço de íons Cálcio (Ca²⁺).`,
      code: `// Expressão matemática simplificada da variação sináptica:
Δw_ij = η * x_i * y_j - γ * w_ij * (y_j)^2
// Onde:
// η = Taxa de plasticidade (Learning Rate)
// x_i = Atividade pré-sináptica
// y_j = Atividade pós-sináptica
// γ = Termo de normalização biológica de Oja`,
    },
    {
      id: 'sec-3',
      heading: '3. Consolidação Sistêmica e Transferência Cortical',
      content: `Durante o sono de ondas lentas (NREM), ocorrem complexos de ondulação rápida (Sharp-Wave Ripples) no hipocampo. Esses padrões temporais replicam as trajetórias de ativação diurnas em velocidade comprimida (replay neural), transferindo os engramas transitórios para o neocórtex pré-frontal para consolidação permanente.`,
    }
  ],
  entities: [
    { name: 'Receptor NMDA', type: 'Receptor Ionotrópico', confidence: '98%', count: 6 },
    { name: 'Potenciação a Longo Prazo (LTP)', type: 'Processo Bioquímico', confidence: '96%', count: 11 },
    { name: 'Íon Magnésio (Mg²⁺)', type: 'Bloqueador de Canal', confidence: '94%', count: 4 },
    { name: 'Sharp-Wave Ripples', type: 'Oscilação Eletrofisiológica', confidence: '91%', count: 3 },
    { name: 'Donald Hebb', type: 'Pesquisador/Teoria', confidence: '99%', count: 2 },
  ],
  aiChat: [
    {
      sender: 'user',
      text: 'Explique de forma concisa como a regra de Oja evita que os pesos sinápticos cresçam infinitamente no modelo de Hebb.',
      time: '14:22'
    },
    {
      sender: 'ai',
      text: 'A regra de Oja introduz um termo de normalização local quadrático (- γ * w_ij * y_j²). Enquanto a regra de Hebb pura faz o peso crescer exponencialmente a cada co-ativação, a regra de Oja faz o peso convergir para um vetor unitário correspondente ao primeiro componente principal (PCA) dos dados de entrada.',
      time: '14:23',
      concepts: ['Regra de Oja', 'PCA Neural', 'Estabilidade de Lyapunov']
    }
  ]
};
