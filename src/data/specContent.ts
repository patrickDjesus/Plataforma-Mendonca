export interface SpecSection {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  content: string;
  highlights: { title: string; desc: string; tag?: string }[];
  tokens?: { name: string; value: string; usage: string; bg?: string; text?: string }[];
}

export const DESIGN_SYSTEM_SPECS: SpecSection[] = [
  {
    id: 'foundations',
    title: '1. Fundamentos & Linguagem Visual',
    subtitle: 'Diretrizes de Clean Futurism, Cores, Tipografia e Superfícies',
    icon: 'Layers',
    content: `O conceito visual adota a estética **"Clean, Simples e Futurista"**, projetada especificamente para plataformas de alta performance cognitiva (EdTech). A interface elimina ruídos visuais decorativos, priorizando telas imersivas com fundos claros, cantos bem arredondados (curvatura suave squircles), superfícies planas delimitadas por bordas ultrafinas translúcidas e toques pontuais de cores vibrantes com iluminação refrativa.

### Princípios Norteadores:
1. **Redução de Carga Cognitiva:** Espaçamento generoso (rhythm 8pt), hierarquia tipográfica inequívoca e ausência de sombras pesadas ou skeumorfismo poluído.
2. **Luminosidade Funcional:** O uso de cores vibrantes (Azul Profundo, Ciano Elétrico e Roxo Luminoso) é estritamente semântico — denotando caminhos de aprendizado, estados de domínio e processos de Inteligência Artificial.
3. **Superfícies Flutuantes (Light Glassmorphism):** Elementos secundários e assistenciais flutuam sobre a área de estudo através de painéis translúcidos de vidro fosco com desfoque de 14px e bordas de 1px a 85% de opacidade branca.`,
    highlights: [
      {
        title: 'Bordas e Curvatura',
        desc: 'Cantos externos em 20px a 24px (rounded-2xl/3xl) para cartões e containers; elementos internos com 10px a 14px. Bordas de 1px com opacidade calibrada (rgba(226, 232, 240, 0.8)).',
        tag: 'Geometria'
      },
      {
        title: 'Luz e Sombras',
        desc: 'Substituição de sombras escuras por ambient diffusions: box-shadow de 0 10px 30px -10px rgba(15, 23, 42, 0.04) para cartões e reflexos de brilho ciano/roxo nos elementos ativos.',
        tag: 'Iluminação'
      },
      {
        title: 'Tipografia Escalar',
        desc: 'Outfit (geométrica/futurista) para títulos e números monumentais; Plus Jakarta Sans para leitura contínua (legibilidade máxima); JetBrains Mono para fórmulas, código e métricas.',
        tag: 'Tipografia'
      }
    ],
    tokens: [
      { name: 'Deep Space Blue (Primária)', value: '#1E40AF', usage: 'Ações primárias, caminhos estruturais e fundos nobres', bg: '#1E40AF', text: '#FFFFFF' },
      { name: 'Electric Cyan (Foco & Sucesso)', value: '#06B6D4', usage: 'Progresso, acertos, nós dominados, dados e contagens', bg: '#06B6D4', text: '#083344' },
      { name: 'Luminous Purple (Inteligência Artificial)', value: '#8B5CF6', usage: 'Assistente IA, geração de síntese, nós conceituais', bg: '#8B5CF6', text: '#FFFFFF' },
      { name: 'Pure Clean Slate (Canvas)', value: '#F8FAFC', usage: 'Plano de fundo principal, reduz fadiga visual', bg: '#F8FAFC', text: '#0F172A' },
      { name: 'Elevated Surface (Cards)', value: '#FFFFFF', usage: 'Superfícies de leitura e cartões de conteúdo', bg: '#FFFFFF', text: '#0F172A' },
      { name: 'Muted Ink (Texto Secundário)', value: '#64748B', usage: 'Metadados, tempos de leitura, breadcrumbs e legendas', bg: '#64748B', text: '#FFFFFF' }
    ]
  },
  {
    id: 'home-spec',
    title: '2. Tela 1: Home (Dashboard Inicial)',
    subtitle: 'Navbar Minimalista, Banner de Contagem Regressiva, Card de Ofensiva e Grade Recente',
    icon: 'LayoutDashboard',
    content: `A Home do estudante foi desenhada como um **centro de controle de alta precisão**. Sua missão é responder em menos de 3 segundos a duas perguntas: "O que preciso fazer hoje?" e "Qual é o meu progresso rumo ao objetivo final?".

### Anatomia da Tela:

#### A. Navbar Fixa e Minimalista (Top Bar de Zona Única)
- **Estrutura:** Barra horizontal com altura de 68px, fixada no topo com efeito de vidro translúcido sutil (\`backdrop-blur-md\`, fundo 82% branco, borda inferior sutil de 1px \`#E2E8F0\`).
- **Zona Esquerda (Brand):** Logo "SYNAPSE" em tipografia geométrica display com um nó orbital cintilante em ciano/roxo.
- **Zona Central (Navegação):** 4 links diretos com pílula de seleção ativa suave (\`Home\`, \`Caderno\`, \`Mapa Mental\`, \`Treino\`), com transições de micro-hover e indicador de ponto luminoso inferior no item ativo.
- **Zona Direita (Ações & Perfil):** Barra de busca global rápida com atalho (\`⌘K\`), Badge de Ofensiva compacta (\`🔥 14 dias\`) com borda em gradiente suave e avatar do usuário com anel de nível de maestria.

#### B. Banner de Contagem Regressiva para Provas (Hero Principal)
- **Superfície:** Container com raio de 24px (\`rounded-3xl\`), preenchido por um gradiente suave e profundo de transição entre Azul Noturno (\`#1E3A8A\`) e Azul Oceano (\`#0369A1\`), com uma sutil malha geométrica de fundo.
- **Conteúdo de Destaque:** 
  - À esquerda: Título da meta ("Simulado Nacional Unificado & ENEM 2026") com badge de probabilidade de aprovação estimada ("84% de prontidão").
  - Ao centro/direita: Bloco numérico monumental com contagem regressiva em dias, horas e minutos com tipografia tabular monoespaçada e anel circular de progresso em Ciano Elétrico (\`#06B6D4\`).
  - Botão de Ação Primária: "Continuar Meta do Dia", em branco luminoso com micro-interação de expansão.

#### C. Card de Ofensiva / Streak (Gamificação Consistente)
- **Estrutura:** Cartão de superfície plana branca com borda suave de 1px e cantos arredondados de 20px.
- **Hierarquia:** 
  - Cabeçalho: Ícone de fogo vetorial com gradiente animado suave (laranja-dourado para roxo-energia), contador numérico de dias em destaque ("14 Dias Seguidos") e tokens de congelamento de streak disponíveis.
  - Grade Semanal: 7 módulos circulares/retangulares arredondados representando Segunda a Domingo. Dias concluídos recebem preenchimento em Ciano/Azul com check luminoso; o dia atual pulsa suavemente com anel de foco em Ciano; dias futuros permanecem com borda pontilhada suave.
  - Indicador de Horas: Barra de progresso semanal (18.5h de meta de 20h) com porcentagem calculada em tempo real.

#### D. Grade de Acesso Rápido aos Materiais Recentes
- **Layout:** Grid responsivo de 3 a 4 colunas com cartões retangulares de cantos arredondados (16px), borda de 1px e elevação suave ao passar o cursor (hover: translateY(-3px) e sombra luminosa leve).
- **Componentes do Card:** Tag de categoria com cor semântica (Roxo para IA, Ciano para Física, Azul para Matemática), título em peso 600, barra linear de progresso fino (4px de espessura com transição suave), tempo estimado restante ("12 min restantes") e botão de retomada rápida "Abrir Caderno".`,
    highlights: [
      {
        title: 'Visão Imediata de Metas',
        desc: 'Contagem regressiva em tempo real com probabilidade preditiva baseada nas sessões de estudo anteriores.',
        tag: 'Hero Banner'
      },
      {
        title: 'Estímulo de Hábito',
        desc: 'Dias da semana com feedback tátil visual imediato e proteção de rotina (congelamento de ofensiva).',
        tag: 'Streak 7-Days'
      },
      {
        title: 'Retomada em 1 Clique',
        desc: 'Cartões recentes armazenam exatamente o parágrafo ou questão onde o estudante pausou a sessão.',
        tag: 'Quick Resume'
      }
    ]
  },
  {
    id: 'caderno-spec',
    title: '3. Tela 2: Caderno (Workspace e Leitura / Hiper-foco)',
    subtitle: 'Barra Lateral de Linha Fina, Folha Digital Flutuante e Painéis Glassmorphism de IA',
    icon: 'BookOpen',
    content: `O Caderno foi concebido para proporcionar um estado mental de **Hiper-foco Cognitivo**, eliminando menus pesados e distrações periféricas para focar inteiramente na absorção e sintetização de conteúdo denso.

### Anatomia da Tela:

#### A. Barra Lateral Esquerda Recolhível (Slim Navigation)
- **Dimensão & Estilo:** Largura compacta (64px recolhida / 240px expandida), fundo neutro ultra-claro (\`#F8FAFC\`) separado por uma linha divisória de 1px (\`#E2E8F0\`).
- **Iconografia de Linha Fina:** Ícones com traço leve de 1.5px (Índice de Tópicos, Marcadores de Texto, Anotações Marginais, Flashcards Rápidos, Modo Foco Zen e Configurações de Leitura).
- **Micro-interações:** Ao pairar sobre a barra lateral, pequenos tooltips em pílula preta com cantos arredondados indicam a função; clique no botão recolhe a barra liberando 100% da amplitude visual.

#### B. Área Central: A Folha Digital Flutuante (Minimal Canvas)
- **Tratamento Visual:** Uma folha de estudo digital com fundo branco puro (\`#FFFFFF\`), margens confortáveis de 64px, largura máxima calculada para legibilidade ideal (72ch a 80ch), e cantos suavemente arredondados (16px) apoiada sobre o fundo cinza-claro (\`#F8FAFC\`).
- **Sem Bordas Pesadas:** A delimitação da folha ocorre exclusivamente por um contraste sutil com o canvas de fundo e uma difusão de luz ambiente (\`box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.03)\`).
- **Opções de Textura do Papel:** Toggle discreto no topo permite alternar entre: Fundo Liso Branco, Matriz de Pontos Tecnológica (Dot Grid 14px) ou Modo Papel Levemente Aquecido.
- **Tipografia do Texto:** Tamanho base de 16px a 18px com entrelinha generosa (1.75), títulos claros em Outfit e caixas de código/fórmulas em JetBrains Mono com syntax highlighting sutil.
- **Marcações e Marginalia:** Trechos selecionados recebem realces luminosos translúcidos em Ciano e Roxo, com pequenos botões de atalho flutuantes para "Gerar Flashcard" ou "Explicar com IA".

#### C. Painéis Sobrepostos à Direita em Estilo Glassmorphism
- **Estética dos Painéis:** Elementos flutuantes na lateral direita com efeito de vidro fosco translúcido (\`backdrop-blur: 16px\`, \`background: rgba(255, 255, 255, 0.85)\`, borda de 1px com brilho sutil em Roxo Luminoso (\`rgba(168, 85, 247, 0.25)\`) e cantos arredondados de 20px).
- **Aba 1: Assistente IA (Luminous Purple Copilot):**
  - Barra de chat com resposta em streaming estruturada (resumos instantâneos, analogias conceituais e testes de retenção).
  - Sugestões de perguntas pré-calculadas com base no parágrafo em leitura ("Explicar o postulado de Hebb em termos simples", "Gerar fórmula matemática relacionada").
- **Aba 2: Grafo e Lista de Conceitos Extraídos:**
  - Extração automática em tempo real dos conceitos-chave presentes no texto, com indicadores de relevância e tags interativas que abrem definições sem sair do fluxo de leitura.`,
    highlights: [
      {
        title: 'Ergonomia de Leitura',
        desc: 'Largura de linha calibrada em 75 caracteres com espaçamento vertical de 1.75 para máxima velocidade de absorção.',
        tag: 'Hiper-foco'
      },
      {
        title: 'Glassmorphism Calibrado',
        desc: 'Transluscência real com desfoque de 16px permite que o leitor sinta a continuidade do documento por baixo do assistente.',
        tag: 'UI Glass'
      },
      {
        title: 'Assistência Contextual IA',
        desc: 'O assistente analisa o parágrafo em visualização ativa e proativamente sugere conexões interdisciplinares.',
        tag: 'AI Copilot'
      }
    ]
  },
  {
    id: 'mapa-spec',
    title: '4. Tela 3: Mapa de Conceitos (Visão Futurista / Canvas Neural)',
    subtitle: 'Canvas Infinito, Nós de Rede Neural, Anéis Luminosos e Controles Flutuantes',
    icon: 'Network',
    content: `O Mapa de Conceitos transforma o currículo e as notas do estudante em uma **Rede Neural Viva e Tridimensional**, onde cada nó representa uma habilidade ou conceito interconectado aos seus pré-requisitos e desdobramentos.

### Anatomia da Tela:

#### A. Canvas Imersivo de Imersão Total
- **Superfície de Fundo:** Fundo claro clean (\`#F8FAFC\`) pontuado por uma malha vetorial suave de coordenadas (\`bg-neural-grid\`) com opacidade de 30%, dando a sensação de um ambiente de simulação científica futurista.
- **Interatividade Total:** Suporte a pan (arrastar para navegar no espaço), zoom infinito suave de 20% a 300% com roda do mouse ou pinch-to-zoom, e arrasto físico de nós com física de repulsão elástica.

#### B. Nós da Rede Neural (Design e Anatomia)
- **Representação Visual:** Esferas/círculos vetoriais planos com gradientes radiais suaves e anéis concêntricos:
  - Nós de **Neurociência / Conceitos Básicos:** Roxo Luminoso (\`#8B5CF6\`).
  - Nós de **Algoritmos / Aplicações:** Ciano Elétrico (\`#06B6D4\`).
  - Nós de **Cálculo / Teoria Pura:** Azul Profundo (\`#1E40AF\`).
- **Estado Normal:** Círculo com tamanho proporcional à relevância do tema, badge central de porcentagem de domínio e rótulo em tipografia limpa 12px sem serifa.
- **Estado Selecionado (Anel Luminoso):** O nó selecionado expande um duplo anel pulsante luminoso em neon suave (\`box-shadow: 0 0 25px rgba(6, 182, 212, 0.6)\`), destacando instantaneamente todas as conexões diretas e esmaecendo os nós não relacionados.
- **Nível de Maestria:** Um anel circular perimétrico indica a taxa de retenção do estudante (ex: 92% preenchido em arco ciano contínuo).

#### C. Linhas de Conexão Sináptica
- **Geometria das Linhas:** Curvas de Bézier suaves ligando os nós com espessura variável (de 1.5px para conexões secundárias a 3.5px para pré-requisitos vitais).
- **Pulsos Sinápticos Animados:** Pequenas partículas de luz translúcida percorrem as linhas no sentido do fluxo de aprendizado, simulando a transmissão de potenciais de ação em sinapses biológicas.

#### D. HUD de Controles Flutuantes no Canto da Tela
- **Disposição Espacial:** Painéis flutuantes em vidro translúcido nos cantos:
  - **Canto Inferior Direito:** Controles de Zoom (+ / - / Reset 100% / Ajustar à Tela) e botão de alternância de Física Neural ativa.
  - **Canto Superior Esquerdo:** Barra de busca de conceitos e filtros por área de conhecimento.
  - **Drawer Lateral Flutuante:** Ao clicar em um nó, abre-se uma gaveta translúcida com resumo do conceito, taxa de retenção, tempo desde a última revisão e botão direto "Treinar Este Conceito".`,
    highlights: [
      {
        title: 'Metáfora Sináptica',
        desc: 'Nós conectados por curvas de Bézier dinâmicas com pulsos animados de luz indicando a direção dos pré-requisitos.',
        tag: 'Neural Graph'
      },
      {
        title: 'Anéis de Energia',
        desc: 'Feedback luminoso com anéis concêntricos que indicam o estado de seleção e o nível de maestria cognitiva.',
        tag: 'Halo Effect'
      },
      {
        title: 'HUD Flutuante Não-Invasivo',
        desc: 'Todos os controles de navegação e filtros permanecem recolhidos em ilhas de vidro nos cantos da interface.',
        tag: 'Floating HUD'
      }
    ]
  },
  {
    id: 'treino-spec',
    title: '5. Tela 4: Treino (Gamificação e Questões)',
    subtitle: 'Layout Centralizado sem Distrações, Alternativas Interativas e Tela de Resultados com Notas Monumentais',
    icon: 'Target',
    content: `A tela de Treino é o ambiente de **testagem ativa e recuperação espaçada**, estruturada com layout 100% livre de distrações periféricas para maximizar o foco e a precisão do raciocínio durante simulados.

### Anatomia da Tela:

#### A. Layout Centralizado e Barra Superior de Progresso
- **Estrutura:** Conteúdo rigorosamente centralizado em uma coluna de 800px de largura máxima, com foco óptico no centro geométrico do monitor.
- **Barra de Progresso Segmentada:** No topo, uma régua translúcida com segmentos de pílula correspondentes a cada questão do bloco (ex: 10 questões). Questões respondidas corretamente ficam preenchidas em Ciano (\`#06B6D4\`), erros em Coral Suave (\`#F43F5E\`), e a questão atual pulsa em Azul Profundo.
- **Métricas de Apoio:** Cronômetro discreto com contagem regressiva por questão e multiplicador de combo de acertos (\`Streak 3x 🔥\`).

#### B. Card do Enunciado e Alternativas Interativas
- **Card Principal:** Superfície branca imaculada de 20px de raio de curvatura, borda suave de 1px e tipografia com contraste 7:1 para legibilidade de textos longos.
- **Caixas de Código ou Contexto:** Blocos destacados com fundo levemente acinzentado (\`#F1F5F9\`) e fonte monoespaçada com números de linha.
- **Cards das Alternativas (Estados Interativos):**
  - **Estado Normal:** Cards retangulares de cantos arredondados (14px) com borda cinza clara (\`#E2E8F0\`), fundo branco e letra identificadora (A, B, C, D) em círculo neutro.
  - **Estado Hover:** Borda transita para Ciano translúcido com leve deslocamento lateral (\`translateX(4px)\`).
  - **Estado Selecionado:** Borda sólida de 2px em Azul Profundo (\`#1E40AF\`), fundo com 4% de preenchimento azul e anel concêntrico no seletor de rádio.
  - **Estado de Confirmação (Feedback Imediato):** 
    - Se Correto: Borda e badge em Ciano Brilhante (\`#06B6D4\`) com ícone de check luminoso.
    - Se Incorreto: Borda em Coral Suave (\`#F43F5E\`) com destaque automático da alternativa que seria a correta.
  - **Gaveta de Explicação IA:** Expande suavemente abaixo da questão revelando a resolução passo a passo e o raciocínio detalhado.

#### C. Tela de Resultado Final (Impacto Visual e Recompensa)
- **Notas Gigantes Monumentais:** A nota percentual (ex: **92%**) é exibida em tipografia monumental display (72px a 96px, Outfit ExtraBold) com degradê metálico luminoso.
- **Anéis de Aproveitamento Coloridos:**
  - Anel externo principal em Ciano Elétrico (\`#06B6D4\`) representando o índice geral de precisão.
  - Anel secundário em Roxo Luminoso (\`#8B5CF6\`) indicando os pontos de experiência ganhos (+450 XP) e a evolução na curva de retenção de longo prazo.
- **Grid de Desempenho por Subtópico:** Cartões compactos com barras de progresso horizontais discriminando o desempenho por matéria.
- **Ações de Próximo Passo:** Botões de alta saliência visual ("Revisar Apenas Erros", "Explorar no Mapa Neural" e "Iniciar Próximo Ciclo").`,
    highlights: [
      {
        title: 'Zero Distração',
        desc: 'Navegação secundária, menus e notificações externas são completamente suprimidos durante o treino.',
        tag: 'Modo Prova'
      },
      {
        title: 'Feedback Sináptico',
        desc: 'Explicação detalhada com raciocínio lógico gerado em tempo real ao confirmar cada alternativa.',
        tag: 'Active Recall'
      },
      {
        title: 'Dopamina Visual',
        desc: 'Tela de resultados com anéis luminosos de alta saturação e números em escala monumental comemorando a evolução.',
        tag: 'Gamificação'
      }
    ]
  }
];
