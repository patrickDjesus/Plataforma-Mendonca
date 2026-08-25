export interface HighYieldStudyMaterial {
  id: string;
  title: string;
  discipline: string;
  category: 'Matemática' | 'Física' | 'Química' | 'Biologia' | 'Redação' | 'História' | 'Geografia';
  color: string;
  icon: string;
  readTime: string;
  summary: string;
  sections: Array<{
    heading: string;
    content: string;
    formulaOrCode?: string;
    callout?: string;
    keyPoints?: string[];
  }>;
  enemIncidence: string; // Ex: "94% cobrado no 2º dia"
  flashReviewQuestion: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export const HIGH_YIELD_STUDY_MATERIALS: HighYieldStudyMaterial[] = [
  {
    id: 'mat-redacao-1000',
    title: 'Manual Prático: Redação ENEM Nota 1000',
    discipline: 'Linguagens & Redação',
    category: 'Redação',
    color: '#E11D48',
    icon: 'PenTool',
    readTime: '6 min de leitura',
    summary: 'Estrutura passo a passo do texto dissertativo-argumentativo em 4 parágrafos, repertórios coringas e proposta com 5 elementos obrigatórios.',
    enemIncidence: '100% obrigatório no ENEM (Peso crucial na média final)',
    sections: [
      {
        heading: '1. Arquitetura dos 4 Parágrafos',
        content: 'Uma redação nota 1000 é dividida com rigor: Introdução (Contextualização + Tema + Tese com 2 argumentos D1 e D2), Desenvolvimento 1 (Tópico frasal + Repertório Legitimado + Argumentação crítica), Desenvolvimento 2 (Aprofundamento de causa/consequência) e Conclusão (Retomada da tese + Proposta de intervenção completa).',
        callout: 'Dica do Corretor: Nunca use a primeira pessoa ("eu acho", "vemos"). Prefira a impessoalidade: "Infere-se que", "Evidencia-se a urgência de".'
      },
      {
        heading: '2. Proposta de Intervenção com os 5 Elementos Obrigatórios',
        content: 'Para atingir a nota máxima (200 pontos) na Competência 5, sua proposta deve conter sem exceção: 1) AGENTE (Quem fará? Ex: Ministério da Educação, Ministério da Saúde); 2) AÇÃO (O que será feito? Ex: deve implementar programas pedagógicos continuados); 3) MEIO/MODO (Por intermédio de que? Ex: mediante parcerias público-privadas e palestras nas escolas); 4) EFEITO (Para que? Ex: a fim de mitigar a exclusão digital); 5) DETALHAMENTO (Explicação extra de um dos itens anteriores).',
        formulaOrCode: 'FÓRMULA C5 = AGENTE + AÇÃO + MEIO/MODO + EFEITO + DETALHAMENTO (Ex: "órgão responsável por gerir as diretrizes curriculares")'
      },
      {
        heading: '3. Repertórios Filosóficos & Sociológicos Coringas',
        content: 'Repertórios com alta aplicabilidade para temas sociais e éticos:',
        keyPoints: [
          'Zygmunt Bauman (Modernidade Líquida): Relações frágeis, individualismo e imediatismo contemporâneo.',
          'Thomas Hobbes (Leviatã / Omissão Estatal): Quando o Estado falha no pacto social de garantir direitos fundamentais aos cidadãos.',
          'Hannah Arendt (Banalidade do Mal): Normalização de problemas crônicos pela sociedade sem reflexão crítica.',
          'Constituição Cidadã de 1988 (Art. 6º): Direitos sociais inalienáveis (saúde, educação, segurança, moradia).'
        ]
      }
    ],
    flashReviewQuestion: {
      question: 'Qual dos seguintes conjuntos contém TODOS os 5 elementos obrigatórios da Competência 5 na Redação do ENEM?',
      options: [
        'Agente, Título, Ação, Opinião e Efeito',
        'Agente, Ação, Meio/Modo, Efeito e Detalhamento',
        'Tese, Repertório, Causa, Consequência e Conclusão',
        'Ministério, Verbo no infinitivo, Metáfora, Alusão e Fechamento'
      ],
      correctIndex: 1,
      explanation: 'Exatamente! A banca do ENEM exige: Agente, Ação, Meio/Modo, Efeito e Detalhamento de um dos elementos para atribuir 200 pontos na C5.'
    }
  },
  {
    id: 'mat-fisica-mecanica',
    title: 'Fórmulas Essenciais de Mecânica & Dinâmica',
    discipline: 'Física',
    category: 'Física',
    color: '#0284C7',
    icon: 'Zap',
    readTime: '5 min de leitura',
    summary: 'Cinemática, Leis de Newton, Conservação da Energia Mecânica, Impulso e Quantidade de Movimento com aplicações de prova.',
    enemIncidence: '92% cobrado anualmente no ENEM e vestibulares',
    sections: [
      {
        heading: '1. Cinemática Escalar e Vetorial',
        content: 'Para o Movimento Uniformemente Variado (MUV), as três equações mestras devem estar na ponta da língua:',
        formulaOrCode: '1) S = S_0 + v_0 \\cdot t + \\frac{a \\cdot t^2}{2} \\quad 2) v = v_0 + a \\cdot t \\quad 3) v^2 = v_0^2 + 2 \\cdot a \\cdot \\Delta S \\text{ (Torricelli)}',
        callout: 'Use a Equação de Torricelli sempre que a questão NÃO fornecer e NÃO pedir o tempo (t).'
      },
      {
        heading: '2. Dinâmica e Trabalho-Energia',
        content: 'A energia mecânica (E_m = E_c + E_p) se conserva em sistemas livres de forças dissipativas (como atrito e resistência do ar):',
        formulaOrCode: 'E_c = \\frac{m \\cdot v^2}{2} \\quad \\text{e} \\quad E_{pg} = m \\cdot g \\cdot h \\quad \\text{e} \\quad E_{pel} = \\frac{k \\cdot x^2}{2}',
        keyPoints: [
          'Segunda Lei de Newton: F_res = m · a (onde a força resultante acelera a massa).',
          'Potência Mecânica: P = W / Δt = F · v (fundamental para cálculos de consumo de energia e motores no ENEM).'
        ]
      }
    ],
    flashReviewQuestion: {
      question: 'Um automóvel trafegando a 20 m/s é freado uniformemente com desaceleração de 4 m/s² até parar completamente. Qual a distância percorrida na frenagem?',
      options: [
        '25 metros',
        '50 metros',
        '80 metros',
        '100 metros'
      ],
      correctIndex: 1,
      explanation: 'Aplicando Torricelli: v² = v₀² + 2·a·ΔS -> 0² = 20² + 2·(-4)·ΔS -> 0 = 400 - 8·ΔS -> 8·ΔS = 400 -> ΔS = 50 metros.'
    }
  },
  {
    id: 'mat-quimica-estequiometria',
    title: 'Estequiometria & Funções Orgânicas no ENEM',
    discipline: 'Química',
    category: 'Química',
    color: '#7C3AED',
    icon: 'FlaskConical',
    readTime: '7 min de leitura',
    summary: 'Relações molares, rendimento, pureza, reagente em excesso e identificação rápida dos principais grupos funcionais orgânicos.',
    enemIncidence: '88% de incidência no caderno de Ciências da Natureza',
    sections: [
      {
        heading: '1. O Passo a Passo Infalível da Estequiometria',
        content: 'Para resolver qualquer problema estequiométrico sem errar:',
        keyPoints: [
          'Passo 1: Escreva a equação química e confira o balanceamento.',
          'Passo 2: Identifique os dados do enunciado (massa, volume molar = 22,4 L nas CNTP, mols ou moléculas).',
          'Passo 3: Se houver pureza, aplique a porcentagem ANTES nos reagentes (ex: 80% de pureza).',
          'Passo 4: Monte a regra de três respeitando as proporções molares dos coeficientes estequiométricos.',
          'Passo 5: Se houver rendimento, aplique a porcentagem no produto obtido.'
        ]
      },
      {
        heading: '2. Funções Orgânicas Oxigenadas & Nitrogenadas mais Cobradas',
        content: 'Reconhecimento instantâneo de funções nos fármacos e combustíveis:',
        formulaOrCode: 'Álcool: R-OH | Fenol: Anel-OH | Aldeído: R-CHO | Cetona: R-CO-R | Ácido Carboxílico: R-COOH | Éster: R-COO-R | Amina: R-NH2 | Amida: R-CONH2'
      }
    ],
    flashReviewQuestion: {
      question: 'Qual função orgânica é caracterizada pela ligação de uma hidroxila (-OH) diretamente a um carbono insaturado de um anel aromático?',
      options: [
        'Álcool secundário',
        'Fenol',
        'Éter',
        'Cetona aromática'
      ],
      correctIndex: 1,
      explanation: 'Fenol é o composto que possui o grupo hidroxila (-OH) ligado diretamente ao anel aromático (benzeno).'
    }
  },
  {
    id: 'mat-geometria-espacial',
    title: 'Geometria Espacial: Volumes e Áreas de Sólidos',
    discipline: 'Matemática',
    category: 'Matemática',
    color: '#059669',
    icon: 'Calculator',
    readTime: '5 min de leitura',
    summary: 'Cilindros, cones, prismas, esferas, troncos e problemas de capacidade em litros e vazão no ENEM.',
    enemIncidence: '96% de presença certa na prova de Matemática',
    sections: [
      {
        heading: '1. Fórmulas Mestras de Volumes',
        content: 'Fórmulas mais frequentes na prova:',
        formulaOrCode: 'Cilindro: V = \\pi \\cdot r^2 \\cdot h \\quad | \\quad Cone: V = \\frac{1}{3} \\pi \\cdot r^2 \\cdot h \\quad | \\quad Esfera: V = \\frac{4}{3} \\pi \\cdot r^3',
        callout: 'Conversão Crucial para o ENEM: 1 m³ = 1.000 Litros e 1 cm³ = 1 mL (ou 1 dm³ = 1 Litro).'
      },
      {
        heading: '2. Projeção Ortogonal e Visões Espaciais',
        content: 'O ENEM adora cobrar a sombra ou a vista superior/frontal de trajetórias em sólidos tridimensionais (como a rota de uma formiga andando sobre um cilindro ou cubo aberto).'
      }
    ],
    flashReviewQuestion: {
      question: 'Se o raio da base de um reservatório cilíndrico for duplicado e sua altura for mantida constante, seu volume total:',
      options: [
        'Permanecerá igual',
        'Irá duplicar (2x)',
        'Irá quadruplicar (4x)',
        'Aumentará em 8 vezes'
      ],
      correctIndex: 2,
      explanation: 'Como o volume do cilindro depende do raio ao quadrado (V = π·r²·h), duplicar o raio resulta em (2r)² = 4r², quadruplicando o volume!'
    }
  }
];
