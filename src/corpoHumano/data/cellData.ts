import { CellOrganelleData } from '../types';
import realMitochondriaImg from '../assets/images/real_mitochondria_tem_1787942336932.jpg';
import realCellNucleusImg from '../assets/images/real_cell_nucleus_1787942369182.jpg';

export const CELL_ORGANELLES: CellOrganelleData[] = [
  {
    id: 'mitocondria',
    name: 'Mitocôndria',
    scientificName: 'Mitochondrion (Respiração Celular Aeróbica)',
    category: 'energetico',
    categoryLabel: 'Produção Energética (ATP)',
    tagline: 'A usina de energia da célula: queima glicose com oxigênio para fabricar ATP!',
    shortDesc: 'Funciona como a bateria recarregável da célula, produzindo a moeda de energia (ATP) necessária para nos manter vivos.',
    simpleAnalogy:
      'Pense na mitocôndria como o motor ou a usina de energia da célula: ela recebe o combustível que você come (açúcar/gordura) e o oxigênio que você respira, e queima tudo de forma controlada para carregar as baterias do corpo (as moléculas de ATP).',
    easySteps: [
      'Entrada de Combustível: Recebe os pedaços da glicose dos alimentos.',
      'Ciclo da Matriz: Gira uma "roda química" (Ciclo de Krebs) soltando gás carbônico (CO2).',
      'Uso do Oxigênio: Usa o oxigênio que você respira como ímã final para atrair elétrons.',
      'Carga Máxima de ATP: Um mini-motor giratório (ATP-sintase) produz mais de 30 ATPs!',
    ],
    fullFunction:
      'A mitocôndria é responsável por transformar a comida que você ingere em energia útil. Sem ela, a célula produziria apenas 2 moléculas de ATP por glicose (na fermentação). Com ela e com o oxigênio, a produção salta para mais de 30 moléculas de ATP! Suas dobras internas (cristas) aumentam o espaço para abrigar milhares de mini-motores geradores de energia.',
    biochemistryMecanismo:
      'Como a mágica acontece de verdade: A energia dos alimentos é usada para bombear partículas (íons H+) para um espaço apertado. Quando essas partículas voltam como uma cachoeira através da enzima ATP-sintase, a força do fluxo une ADP + Fosfato, criando o ATP.',
    icon: '⚡',
    soundType: 'electric',
    enemRecurrence: 'Altíssima',
    color: '#f97316',
    svgHighlightId: 'svg_mitocondria',
    realLifeInfo: {
      imageUrl: realMitochondriaImg,
      sourceType: 'Microscopia Eletrônica de Transmissão (MET)',
      magnificationOrScale: 'Aumento de 60.000x (~1.5 µm)',
      visualDescription:
        'Micrografia eletrônica real de uma mitocôndria cortada transversalmente. Observa-se a dupla membrana e as cristas mitocondriais internas como dobras escuras paralelas imersas na matriz.',
      keyRealFeatures: [
        'Cristas mitocondriais internas (onde ficam as turbinas de ATP)',
        'Membrana externa lisa protetora',
        'Matriz mitocondrial interna contendo DNA próprio circular',
      ],
    },
    enemKeywords: [
      'ATP (Energia Celular)',
      'Ciclo de Krebs',
      'Oxigênio como Aceptor Final',
      'Teoria da Endossimbiose',
      'Herança Mitocondrial Materna',
      'Veneno Cianeto',
    ],
    enemTips: [
      {
        title: 'Veneno Inibidor: Cianeto e Monóxido de Carbono (CO)',
        description:
          'O cianeto bloqueia a passagem de elétrons para o oxigênio na mitocôndria. Sem oxigênio recebendo elétrons, a fábrica para na hora e a célula fica sem energia, levando ao desmaio e morte rápida.',
        type: 'pegadinha',
      },
      {
        title: 'Teoria da Endossimbiose (Origem Bacteriana)',
        description:
          'A mitocôndria era uma bactéria livre no passado que passou a morar dentro de outra célula! Provas que o ENEM ama: tem DNA próprio circular, ribossomos parecidos com os de bactérias e se duplica sozinha.',
        type: 'frequente',
      },
      {
        title: 'Herança Mitocondrial 100% da Mãe',
        description:
          'Na fecundação, as mitocôndrias do espermatozoide ficam de fora ou são destruídas. Todas as mitocôndrias do seu corpo vieram do óvulo da sua mãe biológica!',
        type: 'conceito_chave',
      },
    ],
    flashcards: [
      {
        front: 'Pra que serve o Oxigênio (O2) na respiração celular?',
        back: 'Ele é o "lixeiro final" que recebe os elétrons e hidrogênios no fim da cadeia respiratória, formando água (H2O) e mantendo a fábrica funcionando.',
      },
      {
        front: 'Onde ocorrem o Ciclo de Krebs e a produção massiva de ATP?',
        back: 'O Ciclo de Krebs ocorre na MATRIZ (líquido interno) e a produção de ATP ocorre nas CRISTAS (dobras da membrana interna).',
      },
      {
        front: 'Por que o DNA mitocondrial só é herdado da mãe?',
        back: 'Porque apenas o óvulo materno doa citoplasma e organelas para o embrião; as mitocôndrias do espermatozoide não entram.',
      },
    ],
    enemQuestion: {
      id: 'enem_mitocondria_01',
      context:
        'Substâncias desacopladoras da cadeia respiratória, como o 2,4-dinitrofenol (DNP), abrem furos na membrana interna da mitocôndria, permitindo que os prótons vazem sem passar pela ATP-sintase.',
      question:
        'Em pessoas expostas a essas substâncias, o que acontece com a queima de gorduras e a temperatura do corpo?',
      competenceSkill: 'Competência 4 - Habilidade 14 (Bioenergética celular e homeostase)',
      options: [
        {
          letter: 'A',
          text: 'O corpo queima menos glicose e a temperatura corporal cai drasticamente.',
          isCorrect: false,
          explanation: 'Incorreta. O corpo tenta desesperadamente queimar MAIS combustível para tentar repor o ATP que sumiu.',
        },
        {
          letter: 'B',
          text: 'O corpo queima nutrientes aceleradamente e a energia que viraria ATP vira calor puro (febre alta).',
          isCorrect: true,
          explanation:
            'Correta! Como a energia não consegue ser guardada em forma de ATP, ela escapa direto como calor, aumentando muito a queima calórica e a temperatura corporal.',
        },
        {
          letter: 'C',
          text: 'A produção de ATP aumenta mais de 10 vezes.',
          isCorrect: false,
          explanation: 'Incorreta. Sem prótons passando pela ATP-sintase, a produção de ATP despenca.',
        },
        {
          letter: 'D',
          text: 'A mitocôndria passa a fazer fotossíntese para produzir glicose.',
          isCorrect: false,
          explanation: 'Incorreta. Mitocôndrias animais não realizam fotossíntese.',
        },
        {
          letter: 'E',
          text: 'O oxigênio deixa de ser consumido pelos tecidos.',
          isCorrect: false,
          explanation: 'Incorreta. O oxigênio continua sendo consumido em alta velocidade.',
        },
      ],
      generalExplanation:
        'Desacopladores impedem a formação de ATP fazendo com que a energia acumulada se dissipe na forma de calor puro, acelerando o metabolismo e a temperatura.',
    },
  },
  {
    id: 'nucleo',
    name: 'Núcleo Celular & Carioteca',
    scientificName: 'Nucleus & Envelope Nuclear (Cromatina e DNA)',
    category: 'genetico',
    categoryLabel: 'Controle Genético & Transcrição',
    tagline: 'O centro de comando da célula: guarda o manual de instruções da vida (o DNA)!',
    shortDesc: 'Cofre protegido por uma membrana com portões (poros) onde fica guardado todo o código genético.',
    simpleAnalogy:
      'Pense no núcleo como a diretoria ou a biblioteca central de uma grande fábrica: lá dentro fica guardado a sete chaves o manual de instruções mestre (o DNA). A fábrica só tira cópias desse manual (o RNA) para mandar para os operários montarem as coisas lá fora.',
    easySteps: [
      'Guarda Segura: Mantém o DNA protegido de danos e mutações.',
      'Cópia de Receitas: Quando o corpo precisa de algo, o DNA é copiado em uma fita de RNA Mensageiro (Transcrição).',
      'Edição do Texto: Corta pedaços inúteis do texto e deixa só o que interessa (Splicing).',
      'Portão de Saída: Envia a receita de RNA através dos poros para o citoplasma.',
    ],
    fullFunction:
      'O núcleo controla todas as atividades celulares: quando crescer, quando se dividir e quais proteínas fabricar. O DNA fica empacotado em novelos chamados cromatina. Quando a célula precisa ler um gene, desenrola esse pedaço (eucromatina); o que não está em uso fica bem enroladinho e guardado (heterocromatina).',
    biochemistryMecanismo:
      'Edição Alternativa de Genes (Splicing): No núcleo, uma mesma receita de gene pode ser montada de formas ligeiramente diferentes, permitindo que os nossos 20 mil genes fabriquem mais de 100 mil proteínas diferentes!',
    icon: '🧬',
    soundType: 'pop',
    enemRecurrence: 'Altíssima',
    color: '#8b5cf6',
    svgHighlightId: 'svg_nucleo',
    realLifeInfo: {
      imageUrl: realCellNucleusImg,
      sourceType: 'Microscopia Eletrônica de Transmissão (MET)',
      magnificationOrScale: 'Aumento de 18.000x (~6 µm)',
      visualDescription:
        'Micrografia eletrônica real do núcleo. A carioteca exibe poros e a cromatina condensada escura concentra-se junto à borda periférica.',
      keyRealFeatures: [
        'Envelope nuclear com poros de controle de entrada e saída',
        'Heterocromatina (manchas escuras de DNA guardado e inativo)',
        'Eucromatina (região clara de DNA ativo sendo lido)',
      ],
    },
    enemKeywords: [
      'Carioteca (Membrana Nuclear)',
      'DNA e Cromatina',
      'Transcrição (DNA -> RNA)',
      'Splicing (Corte de Íntrons)',
      'Eucromatina (Ativa) vs Heterocromatina (Inativa)',
    ],
    enemTips: [
      {
        title: 'DNA de Todas as Células é Igual!',
        description:
          'Seu neurônio e sua célula da pele têm exatamente o mesmo DNA! A diferença é que a pele liga os genes de queratina e o neurônio liga os genes de neurotransmissores.',
        type: 'frequente',
      },
      {
        title: 'Eucromatina (Lida) vs Heterocromatina (Guardada)',
        description:
          'Eucromatina é o DNA esticado e frouxo, pronto para ser lido pela célula. Heterocromatina é o DNA enrolado e trancado, sem atividade.',
        type: 'conceito_chave',
      },
    ],
    flashcards: [
      {
        front: 'O que fazem os poros da carioteca (envelope nuclear)?',
        back: 'Funcionam como porteiros inteligentes: deixam o RNA sair para o citoplasma e deixam proteínas essenciais entrarem.',
      },
      {
        front: 'O que é o Splicing que acontece no núcleo?',
        back: 'É o corte das partes não codificantes (íntrons) e colagem das partes úteis (éxons) do RNA mensageiro.',
      },
    ],
    enemQuestion: {
      id: 'enem_nucleo_01',
      context:
        'Células do pâncreas produzem bastante insulina, enquanto células do olho produzem proteínas de visão, embora ambas tenham exatamente o mesmo DNA herdado na concepção.',
      question:
        'Como se explica essa diferença tão grande no funcionamento dos dois tecidos?',
      competenceSkill: 'Competência 4 - Habilidade 15 (Genética molecular e expressão gênica)',
      options: [
        {
          letter: 'A',
          text: 'O olho perdeu os genes da insulina durante o desenvolvimento embrionário.',
          isCorrect: false,
          explanation: 'Incorreta. As células não perdem genes, todas mantêm o genoma completo.',
        },
        {
          letter: 'B',
          text: 'Cada tipo de célula ativa apenas os genes específicos de que precisa, mantendo os outros desligados.',
          isCorrect: true,
          explanation:
            'Correta! Isso se chama expressão gênica diferencial: cada célula só lê o capítulo do manual de DNA que precisa para sua função.',
        },
        {
          letter: 'C',
          text: 'O código genético do pâncreas é diferente do código genético do olho.',
          isCorrect: false,
          explanation: 'Incorreta. O código genético é universal para todos os seres vivos.',
        },
        {
          letter: 'D',
          text: 'O núcleo do olho não possui poros nucleares.',
          isCorrect: false,
          explanation: 'Incorreta. Todas as células eucarióticas têm poros na carioteca.',
        },
        {
          letter: 'E',
          text: 'O pâncreas só tem RNA e não possui moléculas de DNA.',
          isCorrect: false,
          explanation: 'Incorreta. Todas as células com núcleo contêm DNA.',
        },
      ],
      generalExplanation:
        'A regulação gênica garante que a célula economize energia e execute sua função específica expressando apenas os genes adequados ao seu tecido.',
    },
  },
  {
    id: 'nucleolo',
    name: 'Nucléolo',
    scientificName: 'Nucleolus (Fábrica de Ribossomos)',
    category: 'genetico',
    categoryLabel: 'Produção Ribossômica',
    tagline: 'A oficina montadora de ribossomos dentro do núcleo!',
    shortDesc: 'Mancha escura e densa no núcleo responsável por fabricar os operários que vão ler o RNA (os ribossomos).',
    simpleAnalogy:
      'Pense no nucléolo como a montadora de impressoras da célula: ele fabrica todas as peças das pequenas impressoras 3D (os ribossomos) e as despacha pelo portão do núcleo para trabalharem no citoplasma.',
    easySteps: [
      'Leitura de Genes Especiais: Lê o DNA específico de RNA ribossômico (rRNA).',
      'Montagem de Peças: Junta esse RNA com proteínas vindas de fora.',
      'Construção em Duas Partes: Monta a parte de cima (subunidade maior) e a de baixo (subunidade menor) separadas.',
      'Envio ao Citoplasma: Manda as peças separadas para fora pelos poros do núcleo.',
    ],
    fullFunction:
      'O nucléolo não tem nenhuma membrana em volta; ele é simplesmente uma reunião densa de moléculas trabalhando a todo vapor. Quanto mais proteínas uma célula precisa produzir (como células musculares ou do fígado), maior e mais visível é o nucléolo!',
    biochemistryMecanismo:
      'Por que as peças saem separadas? Para não começarem a traduzir proteínas dentro do núcleo por engano! A subunidade maior e a menor só se juntam quando encontram um RNA Mensageiro lá no citoplasma.',
    icon: '🟣',
    soundType: 'pop',
    enemRecurrence: 'Média',
    color: '#a855f7',
    svgHighlightId: 'svg_nucleolo',
    realLifeInfo: {
      imageUrl: realCellNucleusImg,
      sourceType: 'Microscopia Eletrônica de Transmissão (MET)',
      magnificationOrScale: 'Aumento de 35.000x (~1.8 µm)',
      visualDescription:
        'Massa nuclear escura e densa sem membrana, repleta de grânulos em montagem.',
      keyRealFeatures: [
        'Sem membrana ao redor',
        'Foco de alta síntese de RNA ribossômico',
        'Grânulos de ribossomos em montagem',
      ],
    },
    enemKeywords: [
      'RNA Ribossômico (rRNA)',
      'Montagem de Ribossomos',
      'Sem Membrana',
      'Síntese Proteica Intensa',
    ],
    enemTips: [
      {
        title: 'Células com Grandes Nucléolos',
        description:
          'Se uma questão falar de uma célula com nucléolos gigantes e muito ativos, pense imediatamente: essa célula é uma campeã de síntese de proteínas (ex: células de anticorpos, fígado ou tumorais).',
        type: 'frequente',
      },
    ],
    flashcards: [
      {
        front: 'O que é fabricado dentro do nucléolo?',
        back: 'O RNA ribossômico (rRNA) e as peças (subunidades) dos ribossomos.',
      },
      {
        front: 'O nucléolo tem membrana?',
        back: 'Não! É apenas uma concentração densa de RNA e proteínas.',
      },
    ],
    enemQuestion: {
      id: 'enem_nucleolo_01',
      context:
        'Cientistas usaram uma molécula marcada (uridina radioativa) que só é usada para construir moléculas de RNA.',
      question:
        'Em qual estrutura do núcleo celular a radioatividade vai se concentrar mais rápido?',
      competenceSkill: 'Competência 4 - Habilidade 14 (Dinâmica e organelas celulares)',
      options: [
        {
          letter: 'A',
          text: 'No nucléolo, onde há uma produção gigantesca e rápida de RNA ribossômico.',
          isCorrect: true,
          explanation: 'Correta! O nucléolo trabalha sem parar transcrevendo RNA ribossômico, puxando toda a uridina disponível.',
        },
        {
          letter: 'B',
          text: 'Nos centríolos, onde se formam os ossos da célula.',
          isCorrect: false,
          explanation: 'Incorreta. Centríolos são feitos de proteínas, não usam uridina.',
        },
        {
          letter: 'C',
          text: 'No retículo liso, que só produz gorduras.',
          isCorrect: false,
          explanation: 'Incorreta. O retículo liso trabalha com lipídios, não com RNA.',
        },
        {
          letter: 'D',
          text: 'Nos lisossomos, que digerem comida.',
          isCorrect: false,
          explanation: 'Incorreta. Lisossomos são sacos de enzimas digestivas.',
        },
        {
          letter: 'E',
          text: 'Na parede celular externa.',
          isCorrect: false,
          explanation: 'Incorreta. Células animais nem possuem parede celular.',
        },
      ],
      generalExplanation:
        'A uridina é a base do RNA. Como o nucléolo é a região mais ativa na fabricação de RNA ribossômico, é lá que o marcador aparece primeiro.',
    },
  },
  {
    id: 'rer',
    name: 'Retículo Endoplasmático Rugoso (RER)',
    scientificName: 'Rough Endoplasmic Reticulum (Ergastoplasma)',
    category: 'sintese_secrecao',
    categoryLabel: 'Síntese & Tráfego de Proteínas',
    tagline: 'A grande linha de montagem e transporte de proteínas da célula!',
    shortDesc: 'Labirinto de membranas cheio de pontinhos colados (ribossomos) que fabricam proteínas para exportar ou para a membrana.',
    simpleAnalogy:
      'Pense no RER como uma grande fábrica têxtil cheia de costureiras (os ribossomos) coladas nas mesas: enquanto elas costuram as roupas (proteínas), já empurram as peças direto para os corredores internos para serem dobradas, embaladas e enviadas para fora da cidade.',
    easySteps: [
      'Costura Contínua: Ribossomos colados na parede do RER leem o RNA e fabricam a proteína.',
      'Entrada no Túnel: A proteína entra nos canais do retículo assim que nasce.',
      'Controle de Qualidade: A organela checa se a proteína foi dobrada na forma certa.',
      'Despacho em Caixas: Coloca as proteínas em pequenas bolsas (vesículas) e manda para o Correio da célula (Complexo de Golgi).',
    ],
    fullFunction:
      'O RER é chamado de "rugoso" ou "granular" porque é coberto por milhares de ribossomos em sua superfície. Ele é especializado em produzir três tipos de proteínas: 1) Proteínas que vão sair do corpo (como insulina, anticorpos e sucos digestivos); 2) Proteínas que vão ficar na membrana da célula; 3) Enzimas digestivas dos lisossomos.',
    biochemistryMecanismo:
      'Diferença importante: Proteínas que a célula usa no seu próprio citoplasma são feitas por ribossomos soltos. Proteínas que vão ser enviadas para fora do corpo são feitas obrigatoriamente no RER.',
    icon: '🧱',
    soundType: 'pop',
    enemRecurrence: 'Altíssima',
    color: '#0284c7',
    svgHighlightId: 'svg_rer',
    realLifeInfo: {
      imageUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1000&q=80',
      sourceType: 'Microscopia Eletrônica de Transmissão (MET)',
      magnificationOrScale: 'Aumento de 45.000x (~0.8 µm)',
      visualDescription:
        'Cisternas aplanadas paralelas empilhadas, recobertas em sua face externa por milhares de ribossomos pontilhados escuros.',
      keyRealFeatures: [
        'Cisternas empilhadas como folhas',
        'Pontos escuros de ribossomos aderidos',
        'Interior (lúmen) onde as proteínas são processadas',
      ],
    },
    enemKeywords: [
      'Ribossomos Aderidos',
      'Proteínas para Exportação (Hormônios/Anticorpos)',
      'Dobragem e Controle de Qualidade',
      'Vesículas de Transporte para o Golgi',
    ],
    enemTips: [
      {
        title: 'Células Campeãs em RER',
        description:
          'Células que secretam muitas proteínas têm o RER gigante! Exemplos clássicos do ENEM: plasmócitos (fabricam anticorpos), pâncreas (fabrica insulina e enzimas digestivas) e fibroblastos (fabricam colágeno).',
        type: 'frequente',
      },
    ],
    flashcards: [
      {
        front: 'Por que o RER tem esse aspecto "rugoso"?',
        back: 'Porque sua parede externa é repleta de milhares de ribossomos colados produzindo proteínas.',
      },
      {
        front: 'Qual a diferença entre ribossomos livres e os ribossomos do RER?',
        back: 'Ribossomos livres fazem proteínas para uso interno no citoplasma; os do RER fazem proteínas para exportar, para membranas ou para os lisossomos.',
      },
    ],
    enemQuestion: {
      id: 'enem_rer_01',
      context:
        'As células de defesa chamadas plasmócitos são especializadas em fabricar e jogar no sangue toneladas de anticorpos (que são proteínas solúveis de defesa).',
      question:
        'Para conseguir fabricar tanta proteína de exportação, o plasmócito precisa ter qual organela muito desenvolvida?',
      competenceSkill: 'Competência 4 - Habilidade 14 (Relação estrutura-função celular)',
      options: [
        {
          letter: 'A',
          text: 'Centríolos e cílios de locomoção.',
          isCorrect: false,
          explanation: 'Incorreta. Centríolos organizam a divisão celular, não fabricam anticorpos.',
        },
        {
          letter: 'B',
          text: 'Retículo endoplasmático rugoso e complexo golgiense.',
          isCorrect: true,
          explanation:
            'Correta! O RER fabrica as cadeias de anticorpos e o Complexo de Golgi prepara e despacha as caixas para fora da célula.',
        },
        {
          letter: 'C',
          text: 'Retículo endoplasmático liso e vacúolos de água.',
          isCorrect: false,
          explanation: 'Incorreta. O retículo liso sintetiza lipídios, não proteínas.',
        },
        {
          letter: 'D',
          text: 'Lisossomos digestivos primários.',
          isCorrect: false,
          explanation: 'Incorreta. Lisossomos digerem partículas internas, não secretam anticorpos.',
        },
        {
          letter: 'E',
          text: 'Cloroplastos ricos em clorofila.',
          isCorrect: false,
          explanation: 'Incorreta. Cloroplastos existem apenas em plantas e algas.',
        },
      ],
      generalExplanation:
        'A rota de exportação de proteínas é: RER (fabricação) -> Vesícula -> Golgi (embalagem) -> Membrana (lançamento no sangue).',
    },
  },
  {
    id: 'rel',
    name: 'Retículo Endoplasmático Liso (REL)',
    scientificName: 'Smooth Endoplasmic Reticulum (Agranular)',
    category: 'sintese_secrecao',
    categoryLabel: 'Lipídios, Detox & Cálcio',
    tagline: 'Fábrica de gorduras, filtro de remédios/álcool e reservatório de cálcio!',
    shortDesc: 'Rede de tubos lisos (sem ribossomos) que fabrica lipídios e hormônios e limpa venenos e medicamentos.',
    simpleAnalogy:
      'Pense no REL como a refinaria de óleos e o filtro de desintoxicação da célula: ele fabrica as gorduras boas e os hormônios sexuais, além de quebrar remédios e álcool no fígado para você não se intoxicar.',
    easySteps: [
      'Fabricação de Gorduras: Produz fosfolipídios para as membranas e hormônios esteroides (testosterona, estrogênio).',
      'Desintoxicação no Fígado: Neutraliza substâncias estranhas (álcool, remédios, pesticidas) tornando-as fáceis de urinar.',
      'Estoque de Cálcio: Guarda íons cálcio e os libera nos músculos para permitir a contração.',
    ],
    fullFunction:
      'O REL é "liso" porque não possui ribossomos grudados. Suas três grandes missões são: 1) Produzir lipídios e hormônios esteroides sexuais; 2) Neutralizar toxinas e drogas no fígado; 3) No músculo (onde é chamado de retículo sarcoplasmático), ele guarda cálcio e solta uma descarga elétrica de cálcio para o músculo contrair.',
    biochemistryMecanismo:
      'Por que remédios param de fazer efeito quando tomados por muito tempo? Porque o fígado percebe o remédio e faz o REL crescer! Com mais REL, o corpo quebra o remédio tão rápido que a pessoa precisa de doses maiores (tolerância medicamentosa).',
    icon: '🧪',
    soundType: 'sparkle',
    enemRecurrence: 'Alta',
    color: '#06b6d4',
    svgHighlightId: 'svg_rel',
    realLifeInfo: {
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80',
      sourceType: 'Microscopia Eletrônica de Transmissão (MET)',
      magnificationOrScale: 'Aumento de 50.000x (~0.5 µm)',
      visualDescription:
        'Tubos lisos ramificados e circulares totalmente sem ribossomos colados.',
      keyRealFeatures: [
        'Túbulos lisos interligados',
        'Sem grânulos externos',
        'Abundante em células do fígado e gônadas',
      ],
    },
    enemKeywords: [
      'Síntese de Lipídios e Colesterol',
      'Hormônios Esteroides (Testosterona / Estrogênio)',
      'Desintoxicação Hepática (Álcool e Remédios)',
      'Tolerância Medicamentosa',
      'Armazenamento de Cálcio no Músculo',
    ],
    enemTips: [
      {
        title: 'Onde tem muito Retículo Liso?',
        description:
          '1) Fígado (para desintoxicar remédios e bebidas); 2) Testículos e Ovários (para produzir testosterona e estrogênio); 3) Fibras musculares (para guardar cálcio).',
        type: 'frequente',
      },
    ],
    flashcards: [
      {
        front: 'Quais são as 3 grandes funções do Retículo Liso (REL)?',
        back: '1) Produzir gorduras e hormônios sexuais; 2) Desintoxicar o corpo de álcool e medicamentos no fígado; 3) Armazenar cálcio nos músculos.',
      },
      {
        front: 'O que acontece no fígado de quem consome álcool ou remédios com frequência?',
        back: 'O Retículo Liso aumenta de tamanho para quebrar a substância mais rápido, criando tolerância ao medicamento.',
      },
    ],
    enemQuestion: {
      id: 'enem_rel_01',
      context:
        'Um paciente que tomava remédio para dormir há meses percebeu que o mesmo comprimido já não dava sono como antes e precisava de doses cada vez maiores.',
      question:
        'Esse fenômeno de tolerância ao medicamento ocorre pelo aumento de qual organela nas células do fígado?',
      competenceSkill: 'Competência 4 - Habilidade 14 (Metabolismo e farmacologia celular)',
      options: [
        {
          letter: 'A',
          text: 'Retículo endoplasmático liso, que passou a quebrar e inativar o remédio com mais rapidez.',
          isCorrect: true,
          explanation:
            'Correta! O REL se multiplica no fígado para desintoxicar drogas com mais agilidade, reduzindo o tempo de ação do remédio no sangue.',
        },
        {
          letter: 'B',
          text: 'Lisossomo, que devorou o estômago do paciente.',
          isCorrect: false,
          explanation: 'Incorreta. Lisossomos não causam tolerância a medicamentos.',
        },
        {
          letter: 'C',
          text: 'Mitocôndria, que usou o remédio para fazer ATP no lugar da glicose.',
          isCorrect: false,
          explanation: 'Incorreta. Remédios não são combustível respiratório para mitocôndrias.',
        },
        {
          letter: 'D',
          text: 'Nucléolo, que bloqueou a digestão de água.',
          isCorrect: false,
          explanation: 'Incorreta. O nucléolo fabrica ribossomos.',
        },
        {
          letter: 'E',
          text: 'Centríolos, que impediram a absorção do comprimido.',
          isCorrect: false,
          explanation: 'Incorreta. Centríolos não atuam em fármacos.',
        },
      ],
      generalExplanation:
        'O uso contínuo de fármacos induz a multiplicação do Retículo Liso e de suas enzimas desintoxicantes no fígado.',
    },
  },
  {
    id: 'golgi',
    name: 'Complexo Golgiense (Aparelho de Golgi)',
    scientificName: 'Golgi Apparatus (Dictiossomo)',
    category: 'sintese_secrecao',
    categoryLabel: 'Endereçamento & Secreção',
    tagline: 'O centro de correios e empacotamento da célula: etiqueta, embala e envia!',
    shortDesc: 'Pilha de pratos membranosos que recebe proteínas, coloca açúcares, empacota em vesículas e cria o capacete do espermatozoide.',
    simpleAnalogy:
      'Pense no Complexo de Golgi como o centro de distribuição dos Correios ou da Amazon: as mercadorias chegam brutas da fábrica (o RER), o Golgi confere tudo, coloca a etiqueta com o endereço de entrega, embrulha em caixas (vesículas) e despacha para a porta da célula.',
    easySteps: [
      'Recebimento: Pega as proteínas que chegam do RER pela porta de entrada (Face Cis).',
      'Etiquetagem & Ajustes: Gruda açúcares nas proteínas para marcar onde cada uma deve ir (Glicosilação).',
      'Embalagem em Caixas: Empacota em bolinhas de membrana chamadas vesículas secretoras.',
      'Criação de Ferramentas: Fabrica os Lisossomos e o capacete perfurador do espermatozoide (Acrossomo).',
    ],
    fullFunction:
      'O Aparelho de Golgi é essencial para mandar substâncias para fora do corpo. Além de despachar proteínas, ele é quem fabrica o Acrossomo — uma bolsa cheia de enzimas na ponta do espermatozoide que funciona como uma broca para furar a casca do óvulo na fecundação!',
    biochemistryMecanismo:
      'Origem dos Lisossomos: As enzimas digestivas são feitas pelo RER, mas é o Complexo de Golgi que as empacota e fecha a bolsinha do lisossomo!',
    icon: '📦',
    soundType: 'sparkle',
    enemRecurrence: 'Altíssima',
    color: '#3b82f6',
    svgHighlightId: 'svg_golgi',
    realLifeInfo: {
      imageUrl: 'https://images.unsplash.com/photo-1514792368985-f80e9d482a02?auto=format&fit=crop&w=1000&q=80',
      sourceType: 'Microscopia Eletrônica de Transmissão (MET)',
      magnificationOrScale: 'Aumento de 55.000x (~1.2 µm)',
      visualDescription:
        'Pilha curva de sacos achatados com bolinhas de secreção brotando nas laterais.',
      keyRealFeatures: [
        'Cisternas achatadas em forma de arco',
        'Lado de entrada (cis) e lado de saída (trans)',
        'Vesículas de transporte brotando',
      ],
    },
    enemKeywords: [
      'Empacotamento e Secreção',
      'Glicosilação (Etiquetagem)',
      'Formação do Acrossomo do Espermatozoide',
      'Origem dos Lisossomos',
      'Face Cis (Entrada) e Face Trans (Saída)',
    ],
    enemTips: [
      {
        title: 'Acrossomo e Fertilidade Masculina',
        description:
          'Se o homem tiver um defeito no Complexo de Golgi durante a produção dos espermatozoides, ele não formará o acrossomo e será infértil, pois o espermatozoide não conseguirá perfurar o óvulo.',
        type: 'frequente',
      },
      {
        title: 'Caminho Completo da Proteína',
        description:
          'Memorize a ordem que o ENEM sempre pede: RER (fabrica) -> Golgi (empacota) -> Vesícula (transporta) -> Membrana (sai da célula por exocitose).',
        type: 'conceito_chave',
      },
    ],
    flashcards: [
      {
        front: 'Qual estrutura da ponta do espermatozoide é fabricada pelo Golgi?',
        back: 'O Acrossomo, uma bolsa com enzimas para furar a casca protetora do óvulo.',
      },
      {
        front: 'Qual é o papel do Golgi na secreção celular?',
        back: 'Ele recebe as proteínas do RER, faz os retoques finais, coloca a etiqueta de endereço e as empacota em vesículas.',
      },
    ],
    enemQuestion: {
      id: 'enem_golgi_01',
      context:
        'Na formação dos espermatozoides, uma organela se funde na frente do núcleo para formar uma bolsa enzimática chamada acrossomo, essencial para furar o óvulo.',
      question:
        'Qual organela citoplasmática é a mãe direta do acrossomo?',
      competenceSkill: 'Competência 4 - Habilidade 14 (Diferenciação celular e reprodução humana)',
      options: [
        {
          letter: 'A',
          text: 'Complexo Golgiense, que reuniu e empacotou as enzimas digestivas na cabeça do espermatozoide.',
          isCorrect: true,
          explanation:
            'Correta! O acrossomo é uma vesícula gigante derivada do Complexo de Golgi com enzimas perfuradoras.',
        },
        {
          letter: 'B',
          text: 'Retículo liso, que fabrica testosterona.',
          isCorrect: false,
          explanation: 'Incorreta. O acrossomo não vem do retículo liso.',
        },
        {
          letter: 'C',
          text: 'Centríolo, que forma a cauda que nada.',
          isCorrect: false,
          explanation: 'Incorreta. O centríolo forma o flagelo (rabinho do espermatozoide).',
        },
        {
          letter: 'D',
          text: 'Mitocôndria, que queima oxigênio.',
          isCorrect: false,
          explanation: 'Incorreta. As mitocôndrias ficam na peça intermediária gerando energia.',
        },
        {
          letter: 'E',
          text: 'Nucléolo, que só trabalha dentro do núcleo.',
          isCorrect: false,
          explanation: 'Incorreta. O nucléolo fabrica ribossomos.',
        },
      ],
      generalExplanation:
        'O acrossomo é uma bolsa enzimática especializada derivada das vesículas do Complexo Golgiense.',
    },
  },
  {
    id: 'lisossomo',
    name: 'Lisossomo',
    scientificName: 'Lysosome (Digestão Intracelular & Autofagia)',
    category: 'digestao_detox',
    categoryLabel: 'Digestão Intracelular & Reciclagem',
    tagline: 'O estômago e caminhão de lixo e reciclagem da célula!',
    shortDesc: 'Bolsa cheia de ácido e enzimas potentes que digere alimentos engolidos, destrói bactérias e recicla peças velhas.',
    simpleAnalogy:
      'Pense no lisossomo como o estômago e a usina de reciclagem da célula: tudo o que a célula engole (como uma bactéria invasora ou um pedaço de comida) é jogado dentro do lisossomo para ser picado e digerido. Se uma organela fica velha e pifa, o lisossomo a recicla para reaproveitar as peças.',
    easySteps: [
      'Ambiente Ácido: Mantém seu interior bem ácido (pH 5.0) para ativar enzimas digestivas.',
      'Destruição de Invasores: Se funde com bactérias engolidas e as desmancha por completo (Heterofagia).',
      'Faxina Interna: Engole e recicla partes estragadas da própria célula (Autofagia).',
      'Morte Programada: Se a célula for condenada, ele se rompe para destruí-la de forma limpa (Apoptose/Autólise).',
    ],
    fullFunction:
      'Os lisossomos são os responsáveis pela faxina. Eles atuam na digestão de comida, na eliminação de micróbios pelos glóbulos brancos e na metamorfose dos animais (por exemplo, quando o girino perde o rabo para virar sapo, são os lisossomos que digerem o rabo de forma controlada!). Também é assim que nossos dedos se separaram quando éramos bebês na barriga da mãe.',
    biochemistryMecanismo:
      'Segurança Inteligente: As enzimas do lisossomo só funcionam em pH bem ácido. Se um lisossomo estourar sem querer, o citoplasma é neutro e as enzimas ficam fracas, evitando que a célula se autodestrua por acidente!',
    icon: '🗑️',
    soundType: 'digest',
    enemRecurrence: 'Altíssima',
    color: '#ef4444',
    svgHighlightId: 'svg_lisossomo',
    realLifeInfo: {
      imageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1000&q=80',
      sourceType: 'Microscopia Eletrônica de Transmissão (MET)',
      magnificationOrScale: 'Aumento de 65.000x (~0.4 µm)',
      visualDescription:
        'Bolsas esféricas escuras e densas com membrana única repletas de enzimas digestivas.',
      keyRealFeatures: [
        'Vesícula esférica com membrana simples',
        'Interior denso e ácido (pH ~5.0)',
        'Contém cerca de 50 enzimas digestivas',
      ],
    },
    enemKeywords: [
      'Digestão Intracelular',
      'Fagocitose e Heterofagia',
      'Autofagia (Reciclagem Celular)',
      'Autólise e Apoptose (Regressão da Cauda do Girino)',
      'Silicose Pulmonar',
    ],
    enemTips: [
      {
        title: 'Autofagia vs Heterofagia',
        description:
          'Heterofagia é digerir o que veio DE FORA (ex: bactéria fagocitada). Autofagia é digerir o que é DE DENTRO (ex: uma mitocôndria velha para reaproveitar aminoácidos).',
        type: 'frequente',
      },
      {
        title: 'Doença do Pulmão: Silicose',
        description:
          'Trabalhadores que inalam pó de pedra (sílica) têm seus lisossomos perfurados nos pulmões. O ácido vaza nos macrófagos, matando células e criando cicatrizes nos pulmões.',
        type: 'pegadinha',
      },
    ],
    flashcards: [
      {
        front: 'O que é a Autofagia realizada pelos lisossomos?',
        back: 'É o processo de engolir e reciclar organelas velhas da própria célula para reaproveitar seus nutrientes.',
      },
      {
        front: 'Como a cauda do girino desaparece na metamorfose?',
        back: 'Por Autólise lisossômica: os lisossomos digerem as células da cauda de forma programada.',
      },
    ],
    enemQuestion: {
      id: 'enem_lisossomo_01',
      context:
        'Durante o desenvolvimento do embrião humano, as mãos começam parecendo pás sólidas. Mais tarde, as células entre os dedos morrem de forma programada, separando os dedos perfeitamente.',
      question:
        'Esse processo de escultura das mãos embrionárias ocorre pela ação de qual organela?',
      competenceSkill: 'Competência 4 - Habilidade 14 (Diferenciação e morte celular programada)',
      options: [
        {
          letter: 'A',
          text: 'Lisossomos, através do processo de autólise e morte celular programada (apoptose).',
          isCorrect: true,
          explanation:
            'Correta! Os lisossomos digerem as membranas interdigitais no embrião para soltar e definir os dedos.',
        },
        {
          letter: 'B',
          text: 'Cloroplastos, que consomem o excesso de glicose.',
          isCorrect: false,
          explanation: 'Incorreta. Animais não têm cloroplastos.',
        },
        {
          letter: 'C',
          text: 'Mitocôndrias, que congelam o citoplasma.',
          isCorrect: false,
          explanation: 'Incorreta. Mitocôndrias produzem energia térmica e ATP.',
        },
        {
          letter: 'D',
          text: 'Ribossomos livres, que bloqueiam a divisão da pele.',
          isCorrect: false,
          explanation: 'Incorreta. Ribossomos apenas constroem proteínas.',
        },
        {
          letter: 'E',
          text: 'Centríolos, que expulsam o núcleo para fora da mão.',
          isCorrect: false,
          explanation: 'Incorreta. Centríolos coordenam o fuso de divisão celular.',
        },
      ],
      generalExplanation:
        'A regressão de tecidos temporários no embrião e na metamorfose é mediada pela digestão lisossômica controlada.',
    },
  },
  {
    id: 'peroxissomo',
    name: 'Peroxissomo',
    scientificName: 'Peroxisome (Enzima Catalase & Beta-Oxidação)',
    category: 'digestao_detox',
    categoryLabel: 'Digestão Intracelular & Reciclagem',
    tagline: 'O desinfetante da célula: transforma água oxigenada tóxica em água pura e oxigênio!',
    shortDesc: 'Bolsa cheia de catalase que queima gorduras compridas e desintegra substâncias venenosas e radicais livres.',
    simpleAnalogy:
      'Pense no peroxissomo como o desinfetante e protetor anti-incêndio da célula: durante o trabalho normal, a célula produz sem querer uma substância muito perigosa chamada água oxigenada (H2O2). O peroxissomo entra em ação e desmancha essa água oxigenada na hora em água comum e ar (oxigênio)!',
    easySteps: [
      'Captura de Venenos: Pega moléculas perigosas e radicais livres produzidos no metabolismo.',
      'Ação da Catalase: A enzima catalase quebra a água oxigenada tóxica (2 H2O2 -> 2 H2O + O2).',
      'Picar Gorduras Grandes: Corta ácidos graxos gigantes em pedacinhos menores para mandar para a mitocôndria.',
    ],
    fullFunction:
      'Sabe quando você joga água oxigenada num machucado e ela borbulha e espuma na hora? Aquilo é a enzima CATALASE dos peroxissomos do seu sangue transformando a água oxigenada em gás oxigênio e água pura para matar bactérias e proteger suas células!',
    biochemistryMecanismo:
      'Em plantas (Glioxissomos): Nas sementes, os peroxissomos especiais chamados glioxissomos transformam os óleos guardados na semente em açúcar para a plantinha poder brotar no escuro!',
    icon: '💧',
    soundType: 'sparkle',
    enemRecurrence: 'Média',
    color: '#14b8a6',
    svgHighlightId: 'svg_peroxissomo',
    realLifeInfo: {
      imageUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1000&q=80',
      sourceType: 'Microscopia Eletrônica de Transmissão (MET)',
      magnificationOrScale: 'Aumento de 40.000x (~0.6 µm)',
      visualDescription:
        'Vesícula esférica que contém em seu núcleo um cristal escuro característico formado por enzimas catalases.',
      keyRealFeatures: [
        'Inclusão cristaloide escura no centro (cristal de catalase)',
        'Membrana simples delimitadora',
        'Abundante no fígado e rins',
      ],
    },
    enemKeywords: [
      'Enzima Catalase',
      'Peróxido de Hidrogênio (Água Oxigenada H2O2)',
      'Quebra de Ácidos Graxos Longos',
      'Desintoxicação Celular',
      'Glioxissomos em Plantas',
    ],
    enemTips: [
      {
        title: 'Por que o machucado borbulha?',
        description:
          'O borbulhar ao colocar água oxigenada é a catalase do peroxissomo quebrando o H2O2 em água e GÁS OXIGÊNIO (as bolhas que sobem!).',
        type: 'frequente',
      },
    ],
    flashcards: [
      {
        front: 'Qual é a principal enzima do peroxissomo e o que ela faz?',
        back: 'A Catalase: ela quebra o peróxido de hidrogênio (água oxigenada) em água líquida e gás oxigênio.',
      },
      {
        front: 'O que são os glioxissomos nas plantas?',
        back: 'São peroxissomos vegetais que transformam gorduras da semente em açúcares para a germinação.',
      },
    ],
    enemQuestion: {
      id: 'enem_peroxissomo_01',
      context:
        'Ao limpar um corte no joelho com água oxigenada a 10 volumes, observa-se efervescência imediata no local ferido com liberação de gás.',
      question:
        'Esse borbulhar deve-se à ação de qual enzima celular?',
      competenceSkill: 'Competência 4 - Habilidade 14 (Catálise enzimática e proteção celular)',
      options: [
        {
          letter: 'A',
          text: 'Catalase dos peroxissomos, que quebra o peróxido de hidrogênio liberando oxigênio gasoso.',
          isCorrect: true,
          explanation:
            'Correta! A catalase decompõe 2 H2O2 em 2 H2O + O2, gerando as bolhas visíveis de oxigênio.',
        },
        {
          letter: 'B',
          text: 'Amilase salivar, que quebra o amido do machucado.',
          isCorrect: false,
          explanation: 'Incorreta. A amilase quebra amido na boca.',
        },
        {
          letter: 'C',
          text: 'Pepsina gástrica, que só funciona no ácido do estômago.',
          isCorrect: false,
          explanation: 'Incorreta. Pepsina digere proteínas no estômago.',
        },
        {
          letter: 'D',
          text: 'DNA polimerase dos ribossomos.',
          isCorrect: false,
          explanation: 'Incorreta. DNA polimerase duplica o DNA no núcleo.',
        },
        {
          letter: 'E',
          text: 'Insulina pancreática dissolvida na pele.',
          isCorrect: false,
          explanation: 'Incorreta. Insulina é um hormônio que regula glicose no sangue.',
        },
      ],
      generalExplanation:
        'A catalase dos peroxissomos neutraliza o peróxido de hidrogênio gerando oxigênio gasoso que forma a espuma antisséptica.',
    },
  },
  {
    id: 'centriolos',
    name: 'Centríolos & Centrossomo',
    scientificName: 'Centrioles & MTOC (Fuso Mitótico, Cílios e Flagelos)',
    category: 'estrutural_membrana',
    categoryLabel: 'Estrutura & Citoesqueleto',
    tagline: 'Os guindastes da divisão celular e motores dos cílios e cauda do espermatozoide!',
    shortDesc: 'Par de cilindros formados por tubinhos de proteína que puxam os cromossomos na divisão e formam cílios e flagelos.',
    simpleAnalogy:
      'Pense nos centríolos como dois guindastes com cabos de aço: na hora em que a célula vai se dividir em duas, cada guindaste vai para um lado da célula, joga cordas nos cromossomos e puxa metade para cada lado, garantindo que as duas células filhas recebam tudo igualzinho.',
    easySteps: [
      'Posicionamento: Ficam em pares perpendiculares perto do núcleo.',
      'Lançar Cordas: Na divisão celular, montam os cabos de microtúbulos (fuso mitótico).',
      'Puxar Cromossomos: Puxam as cópias do DNA para lados opostos.',
      'Mover o Corpo: Na base de cílios e do rabo do espermatozoide, atuam como motor de natação.',
    ],
    fullFunction:
      'Os centríolos são cilindros formados por 9 trincas de tubos de proteína (tubulina). Além de coordenar a divisão celular, eles se transformam em "corpos basais" que sustentam os cílios da nossa traqueia (que varrem a poeira do pulmão) e o flagelo do espermatozoide (que permite que ele nade).',
    biochemistryMecanismo:
      'Atenção para o ENEM: Células de plantas com flores e frutos (angiospermas) NÃO possuem centríolos típicos, mas conseguem se dividir perfeitamente usando seus próprios microtúbulos!',
    icon: '🥢',
    soundType: 'sparkle',
    enemRecurrence: 'Alta',
    color: '#eab308',
    svgHighlightId: 'svg_centriolos',
    realLifeInfo: {
      imageUrl: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=1000&q=80',
      sourceType: 'Microscopia Eletrônica de Transmissão (MET)',
      magnificationOrScale: 'Aumento de 80.000x (~0.2 µm)',
      visualDescription:
        'Corte transversal mostrando a roda perfeita de 9 trincas de microtúbulos ocos circulares.',
      keyRealFeatures: [
        'Arranjo simétrico de 9 trincas de microtúbulos (9x3)',
        'Par disposto em ângulo reto (90 graus)',
        'Centro de onde nascem os fios do fuso celular',
      ],
    },
    enemKeywords: [
      'Fuso Acromático / Mitótico',
      'Divisão Celular (Mitose e Meiose)',
      'Origem de Cílios e Flagelos',
      'Ausente em Plantas Superiores',
      'Proteína Tubulina',
    ],
    enemTips: [
      {
        title: 'Remédios contra o Câncer (Vimblastina / Colchicina)',
        description:
          'Medicamentos de quimioterapia destroem os microtúbulos do fuso. Sem fuso, as células do tumor não conseguem puxar os cromossomos e param de se multiplicar!',
        type: 'interdisciplinar',
      },
    ],
    flashcards: [
      {
        front: 'Qual o papel dos centríolos na divisão celular?',
        back: 'Organizar os cabos de microtúbulos do fuso que puxam os cromossomos para os polos opostos.',
      },
      {
        front: 'Qual estrutura de natação do espermatozoide é formada a partir de um centríolo?',
        back: 'O flagelo (a cauda móvel do espermatozoide).',
      },
    ],
    enemQuestion: {
      id: 'enem_centriolo_01',
      context:
        'A colchicina é uma substância que impede a montagem dos microtúbulos a partir dos centríolos nas células.',
      question:
        'Ao aplicar colchicina em uma cultura celular em multiplicação, a divisão será interrompida em qual momento?',
      competenceSkill: 'Competência 4 - Habilidade 14 (Ciclo celular e ação de quimioterápicos)',
      options: [
        {
          letter: 'A',
          text: 'Na Metáfase/Anáfase, porque os cromossomos não conseguirão ser puxados para os polos opostos.',
          isCorrect: true,
          explanation:
            'Correta! Sem as cordas de microtúbulos organizadas pelos centríolos, a célula não consegue separar os cromossomos.',
        },
        {
          letter: 'B',
          text: 'Na duplicação do DNA na fase S.',
          isCorrect: false,
          explanation: 'Incorreta. A replicação do DNA usa enzimas polimerases, não centríolos.',
        },
        {
          letter: 'C',
          text: 'Na digestão dos alimentos pelo lisossomo.',
          isCorrect: false,
          explanation: 'Incorreta. Lisossomos não dependem de centríolos.',
        },
        {
          letter: 'D',
          text: 'Na queima de oxigênio pela mitocôndria.',
          isCorrect: false,
          explanation: 'Incorreta. A respiração celular ocorre nas mitocôndrias.',
        },
        {
          letter: 'E',
          text: 'Na fabricação de lipídios no retículo liso.',
          isCorrect: false,
          explanation: 'Incorreta. A síntese lipídica é metabólica.',
        },
      ],
      generalExplanation:
        'A inibição dos microtúbulos impede a formação do fuso mitótico, travando as células na divisão.',
    },
  },
  {
    id: 'citoesqueleto',
    name: 'Citoesqueleto',
    scientificName: 'Cytoskeleton (Microfilamentos, Intermediários e Microtúbulos)',
    category: 'estrutural_membrana',
    categoryLabel: 'Estrutura & Citoesqueleto',
    tagline: 'O esqueleto, os músculos e os trilhos de trem internos da célula!',
    shortDesc: 'Rede interna de fios de proteína que dá formato à célula, permite que ela ande e serve de estrada para transportar coisas.',
    simpleAnalogy:
      'Pense no citoesqueleto como as vigas de concreto de um prédio e os trilhos de metrô da cidade: ele mantém a célula no formato certo para não desmoronar e ainda serve de estrada para os pequenos motores levarem cargas de um lado para o outro.',
    easySteps: [
      'Microfilamentos de Actina: Dão elasticidade e permitem que a célula mude de forma e emita "pés falsos" para andar (pseudópodes).',
      'Filamentos Intermediários (Queratina): Dão resistência máxima contra puxões e impactos mecânicos na pele.',
      'Microtúbulos de Tubulina: São os canos resistentes e trilhos por onde as vesículas viajam puxadas por proteínas motoras.',
    ],
    fullFunction:
      'Sem o citoesqueleto, a célula seria uma gota mole sem formato. É graças a ele que um glóbulo branco consegue rastejar pelo meio dos tecidos para caçar bactérias e que os neurônios conseguem ter braços compridos de mais de 1 metro de comprimento!',
    biochemistryMecanismo:
      'Proteínas Motoras (Caminhões Celulares): Proteínas chamadas Cinesina e Dineína literalmente "andam a pé" sobre os microtúbulos, carregando caixas de vesículas de um canto a outro da célula consumindo ATP!',
    icon: '🕸️',
    soundType: 'sparkle',
    enemRecurrence: 'Alta',
    color: '#64748b',
    svgHighlightId: 'svg_citoesqueleto',
    realLifeInfo: {
      imageUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1000&q=80',
      sourceType: 'Microscopia de Fluorescência Confocal',
      magnificationOrScale: 'Aumento de 2.500x (~25 µm)',
      visualDescription:
        'Rede filamentosa brilhante colorida em verde e vermelho cruzando todo o interior celular.',
      keyRealFeatures: [
        'Fibras de actina ancoradas na borda',
        'Microtúbulos irradiando do centro',
        'Malha de sustentação em 3D',
      ],
    },
    enemKeywords: [
      'Microfilamentos de Actina',
      'Microtúbulos de Tubulina',
      'Filamentos Intermediários e Queratina',
      'Movimento Ameboide e Pseudópodes',
      'Cicloses Citoplasmáticas',
    ],
    enemTips: [
      {
        title: 'Movimento Ameboide no ENEM',
        description:
          'Quando um macrófago emite pseudópodes (braços) para abraçar e engolir uma bactéria, ele usa polimerização rápida de filamentos de ACTINA do citoesqueleto.',
        type: 'frequente',
      },
    ],
    flashcards: [
      {
        front: 'Quais são os 3 componentes do citoesqueleto?',
        back: '1) Microfilamentos de actina; 2) Filamentos intermediários (ex: queratina); 3) Microtúbulos de tubulina.',
      },
      {
        front: 'Qual filamento permite que a célula estique braços (pseudópodes) para se mover?',
        back: 'Os microfilamentos de Actina.',
      },
    ],
    enemQuestion: {
      id: 'enem_citoesqueleto_01',
      context:
        'Macrófagos humanos conseguem mudar rapidamente de forma, emitindo projeções citoplasmáticas (pseudópodes) para engolir micróbios invasores.',
      question:
        'Essa capacidade de emitir pés falsos e se mover depende diretamente de qual componente do citoesqueleto?',
      competenceSkill: 'Competência 4 - Habilidade 14 (Dinâmica e locomoção celular)',
      options: [
        {
          letter: 'A',
          text: 'Microfilamentos de actina, que se montam e desmontam gerando força mecânica de projeção.',
          isCorrect: true,
          explanation:
            'Correta! A actina é responsável pela motilidade celular, emissão de pseudópodes e contração.',
        },
        {
          letter: 'B',
          text: 'Fibras de celulose da parede bacteriana.',
          isCorrect: false,
          explanation: 'Incorreta. Macrófagos humanos não possuem parede celular de celulose.',
        },
        {
          letter: 'C',
          text: 'Moléculas de glicogênio armazenadas no lisossomo.',
          isCorrect: false,
          explanation: 'Incorreta. Glicogênio é reserva energética, não move a membrana.',
        },
        {
          letter: 'D',
          text: 'Queratina morta presente na carioteca.',
          isCorrect: false,
          explanation: 'Incorreta. Queratina dá resistência estática na pele.',
        },
        {
          letter: 'E',
          text: 'Poros de água da membrana mitocondrial.',
          isCorrect: false,
          explanation: 'Incorreta. Poros de água atuam em osmose, não em pseudópodes.',
        },
      ],
      generalExplanation:
        'A polimerização dinâmica da actina é o motor mecânico que empurra a membrana para a fagocitose.',
    },
  },
  {
    id: 'membrana',
    name: 'Membrana Plasmática',
    scientificName: 'Plasma Membrane (Mosaico Fluido & Permeabilidade Seletiva)',
    category: 'estrutural_membrana',
    categoryLabel: 'Estrutura & Citoesqueleto',
    tagline: 'A portaria inteligente da célula: decide quem entra e quem sai com perfeição!',
    shortDesc: 'Camada dupla de gorduras com proteínas flutuantes que separa o mundo de dentro do mundo de fora.',
    simpleAnalogy:
      'Pense na membrana plasmática como a portaria e a muralha de um condomínio fechado com catracas inteligentes: ela é feita de uma parede de gordura flexível (o mosaico fluido) e possui portões e catracas (proteínas) que só deixam passar quem tem autorização.',
    easySteps: [
      'Bicamada de Gordura: Dupla camada de fosfolipídios com cabeças que gostam de água e caudas de gordura que repelem água.',
      'Portas Livres (Passivas): Gases como oxigênio e gás carbônico passam direto pela gordura sem pagar nada (Difusão Simples).',
      'Portas com Ajuda: Açúcares entram por portas de proteína especiais a favor do fluxo (Difusão Facilitada).',
      'Bombas Pagas (Ativas): Bombas gastam moedas de energia (ATP) para puxar nutrientes contra a correnteza (ex: Bomba de Sódio e Potássio).',
    ],
    fullFunction:
      'A membrana é chamada de "Mosaico Fluido" porque suas peças de gordura e proteínas não estão coladas; elas deslizam e flutuam livremente como barcos na água. Na sua face de fora, ela tem uma camada de açúcares chamada Glicocálix, que funciona como o documento de identidade da célula para que o sistema de defesa saiba que ela pertence ao seu corpo.',
    biochemistryMecanismo:
      'Colesterol na Membrana: O colesterol fica encaixado entre as gorduras da membrana para dar a firmeza certa: no calor não deixa a membrana derreter e no frio não deixa ela congelar!',
    icon: '🛡️',
    soundType: 'pop',
    enemRecurrence: 'Altíssima',
    color: '#10b981',
    svgHighlightId: 'svg_membrana',
    realLifeInfo: {
      imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1000&q=80',
      sourceType: 'Microscopia Eletrônica de Transmissão (MET)',
      magnificationOrScale: 'Aumento de 150.000x (~7.5 nm)',
      visualDescription:
        'Visão em alta resolução da trilamina clássica (duas linhas escuras separadas por uma faixa clara no meio).',
      keyRealFeatures: [
        'Espessura ultrafina de ~7 a 10 nanômetros',
        'Bicamada fosfolipídica visível',
        'Proteínas integrais inseridas na espessura',
      ],
    },
    enemKeywords: [
      'Modelo do Mosaico Fluido (Singer & Nicolson)',
      'Permeabilidade Seletiva',
      'Bomba de Sódio e Potássio (Transporte Ativo com ATP)',
      'Osmose e Difusão',
      'Glicocálix e Reconhecimento Celular',
    ],
    enemTips: [
      {
        title: 'Transporte Passivo vs Ativo',
        description:
          'Passivo: A favor do gradiente (do mais concentrado pro menos), NÃO gasta ATP (ex: osmose, difusão). Ativo: Contra o gradiente, GASTA ATP (ex: Bomba de Sódio e Potássio).',
        type: 'frequente',
      },
      {
        title: 'Glicocálix e Rejeição de Órgãos',
        description:
          'O glicocálix na parte de fora da membrana é a "impressão digital" da célula. Na doação de órgãos, se o glicocálix do doador for muito diferente, os glóbulos brancos atacam e rejeitam o transplante.',
        type: 'conceito_chave',
      },
    ],
    flashcards: [
      {
        front: 'Por que a membrana plasmática é chamada de "Mosaico Fluido"?',
        back: 'Porque os fosfolipídios e proteínas se movem e deslizam lateralmente de forma dinâmica e contínua.',
      },
      {
        front: 'Qual a diferença entre Difusão Facilitada e Transporte Ativo?',
        back: 'Difusão Facilitada é a favor do gradiente sem gastar energia; Transporte Ativo é contra o gradiente e consome ATP.',
      },
    ],
    enemQuestion: {
      id: 'enem_membrana_01',
      context:
        'Ao colocar uma hemácia (glóbulo vermelho do sangue) dentro de um copo de água destilada pura (solução muito hipotônica), a água entra aceleradamente na célula até que ela incha e estoura (hemólise).',
      question:
        'Esse movimento espontâneo de água através da membrana plasmática sem gasto de energia ocorre por:',
      competenceSkill: 'Competência 4 - Habilidade 14 (Fenômenos de transporte e osmorregulação)',
      options: [
        {
          letter: 'A',
          text: 'Osmose, em que a água se desloca do meio menos concentrado (água pura) para o meio mais concentrado dentro da célula.',
          isCorrect: true,
          explanation:
            'Correta! A osmose é a passagem do solvente (água) do meio hipotônico para o hipertônico a favor do gradiente de potencial hídrico.',
        },
        {
          letter: 'B',
          text: 'Fagocitose mecânica acelerada pela membrana.',
          isCorrect: false,
          explanation: 'Incorreta. Fagocitose engloba partículas sólidas com pseudópodes.',
        },
        {
          letter: 'C',
          text: 'Transporte ativo com consumo em massa de ATP.',
          isCorrect: false,
          explanation: 'Incorreta. Osmose é um transporte passivo e natural, sem gasto de energia.',
        },
        {
          letter: 'D',
          text: 'Exocitose de proteínas para sugar a água.',
          isCorrect: false,
          explanation: 'Incorreta. Exocitose expulsa substâncias da célula.',
        },
        {
          letter: 'E',
          text: 'Destruição das proteínas da carioteca nuclear.',
          isCorrect: false,
          explanation: 'Incorreta. Hemácias adultas humanas nem têm núcleo.',
        },
      ],
      generalExplanation:
        'Na osmose, a água se move passivamente em direção ao local mais concentrado em solutos até equilibrar as pressões.',
    },
  },
  {
    id: 'vacuolo',
    name: 'Vacúolo',
    scientificName: 'Vacuole (Vacúolo Central & Vacúolo Contrátil)',
    category: 'digestao_detox',
    categoryLabel: 'Digestão Intracelular & Reciclagem',
    tagline: 'O reservatório de água e regulador de pressão da célula!',
    shortDesc: 'Grande bolsa de armazenamento que mantém a planta ereta e firme e expulsa excesso de água em protozoários.',
    simpleAnalogy:
      'Pense no vacúolo como uma bexiga cheia de água no centro da célula: em plantas, quando está cheia, empurra as paredes da célula para fora e deixa a folha durinha e em pé. Se faltar água e a bexiga murchar, a plantinha fica murcha e caída.',
    easySteps: [
      'Estoque de Água: Armazena água, sais, açúcares e pigmentos coloridos (como o roxo da flor).',
      'Pressão de Turgor: Empurra a parede celular para manter a planta firme sem precisar de ossos.',
      'Vacúolo Contrátil (em seres de água doce): Funciona como uma bomba que ejeta o excesso de água para fora para a célula não explodir.',
    ],
    fullFunction:
      'Nas células vegetais adultas, o vacúolo central é tão grande que pode ocupar até 90% de todo o espaço da célula! Em pequenos seres de água doce (como o Paramecium), o vacúolo contrátil bate como um coraçãozinho expulsando a água que entra sem parar por osmose.',
    biochemistryMecanismo:
      'Tonoplasto: A membrana que envolve o vacúolo é chamada de tonoplasto e possui canais especiais que bombeiam sais para dentro, puxando água por osmose.',
    icon: '💧',
    soundType: 'pop',
    enemRecurrence: 'Média',
    color: '#38bdf8',
    svgHighlightId: 'svg_vacuolo',
    realLifeInfo: {
      imageUrl: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=1000&q=80',
      sourceType: 'Microscopia Óptica e Eletrônica',
      magnificationOrScale: 'Aumento de 10.000x (~10 µm)',
      visualDescription:
        'Grande compartimento límpido central ocupando quase todo o volume da célula vegetal.',
      keyRealFeatures: [
        'Ocupa a maior parte do citoplasma vegetal',
        'Membrana elástica tonoplasto',
        'Empurra o núcleo e os cloroplastos para a borda',
      ],
    },
    enemKeywords: [
      'Vacúolo Central de Suco Celular',
      'Turgidez Vegetal e Plasmólise',
      'Vacúolo Contrátil / Pulsátil em Protozoários Dulcícolas',
      'Osmorregulação',
    ],
    enemTips: [
      {
        title: 'Vacúolo Pulsátil no ENEM',
        description:
          'Protozoários de água DOCE possuem vacúolo pulsátil para bombear água para fora (pois a água entra por osmose o tempo todo). Protozoários do MAR não precisam dele porque a água do mar é isotônica.',
        type: 'frequente',
      },
    ],
    flashcards: [
      {
        front: 'Por que uma planta murcha quando fica dias sem regar?',
        back: 'Porque os vacúolos centrais perdem água, a pressão interna (turgor) cai e as células perdem a sustentação.',
      },
      {
        front: 'Qual a função do vacúolo pulsátil nos protozoários de água doce?',
        back: 'Bombear para fora o excesso de água que entra sem parar por osmose, evitando que a célula estoure.',
      },
    ],
    enemQuestion: {
      id: 'enem_vacuolo_01',
      context:
        'Uma ameba que vivia tranquilamente em um lago de água doce foi transferida em laboratório para um aquário com água salgada marinha.',
      question:
        'O que acontecerá com a atividade de bombeamento do seu vacúolo contrátil?',
      competenceSkill: 'Competência 4 - Habilidade 14 (Osmorregulação comparada)',
      options: [
        {
          letter: 'A',
          text: 'A atividade de contração do vacúolo diminuirá ou cessará, pois a água deixará de entrar em excesso por osmose.',
          isCorrect: true,
          explanation:
            'Correta! Na água salgada hipertônica, a água não invade mais a célula por osmose, logo o vacúolo não precisa mais gastar energia bombeando água para fora.',
        },
        {
          letter: 'B',
          text: 'O vacúolo vai acelerar as batidas até explodir.',
          isCorrect: false,
          explanation: 'Incorreta. Se a água não entra em excesso, o vacúolo reduz o ritmo.',
        },
        {
          letter: 'C',
          text: 'O vacúolo vai se transformar em um cloroplasto.',
          isCorrect: false,
          explanation: 'Incorreta. Vacúolos não se transformam em cloroplastos.',
        },
        {
          letter: 'D',
          text: 'A ameba vai produzir sangue para se proteger do sal.',
          isCorrect: false,
          explanation: 'Incorreta. Amebas são seres unicelulares sem sangue.',
        },
        {
          letter: 'E',
          text: 'O vacúolo passará a secretar insulina na água salgada.',
          isCorrect: false,
          explanation: 'Incorreta. Amebas não possuem insulina pancreática.',
        },
      ],
      generalExplanation:
        'O vacúolo contrátil só trabalha rápido em ambientes hipotônicos (água doce). Na água salgada, a invasão osmótica cessa.',
    },
  },
];
