import { BodyPartData } from '../types';
import realBrainImg from '../assets/images/real_brain_anatomy_1787942395281.jpg';
import realHeartImg from '../assets/images/real_human_heart_1787942350071.jpg';
import realLungsImg from '../assets/images/real_lungs_alveoli_1787942381533.jpg';

export const BODY_PARTS: BodyPartData[] = [
  {
    id: 'cerebro',
    name: 'Cérebro & Encéfalo',
    scientificName: 'Encephalon / Cerebrum',
    zone: 'cabeca',
    tagline: 'Centro de Comando Central, Pensamentos, Memória e Equilíbrio do Corpo',
    shortDesc: 'Responsável pelo processamento de informações, controle motor, memória, emoções e coordenação de todos os órgãos.',
    simpleAnalogy:
      'Pense no cérebro como a torre de controle e o supercomputador do corpo: ele recebe em tempo real os sinais dos olhos, ouvidos e da pele, processa tudo num milésimo de segundo e manda ordens elétricas pelos nervos para você se mover, falar, respirar e bater o coração sem nem precisar pensar.',
    easySteps: [
      'Recepção de Sinais: Capta tudo o que acontece dentro e fora do corpo pelos nervos.',
      'Processamento Instantâneo: Neurônios conversam usando faíscas elétricas e neurotransmissores químicos.',
      'Envio de Ordens: Dispara comandos para os músculos se moverem e órgãos funcionarem.',
      'Ajuste Automático: O bulbo no tronco cerebral ajusta a respiração e batimentos conforme o sangue precisa.',
    ],
    fullPhysiology:
      'O encéfalo é constituído pelo cérebro (telencéfalo e diencéfalo), cerebelo e tronco encefálico (mesencéfalo, ponte e bulbo). Os neurônios transmitem informações através de potenciais de ação despolarizantes (influxo de Na⁺ mediado por canais dependentes de voltagem) seguidos de repolarização (efluxo de K⁺) e manutenção do gradiente pela Bomba de Na⁺/K⁺ ATPase. As sinapses químicas convertem o sinal elétrico em químico via influxo de íons Ca²⁺ no terminal pré-sináptico, liberando neurotransmissores (como acetilcolina, dopamina, GABA e serotonina) na fenda sináptica.',
    cellularBiochemistry:
      'O tecido nervoso consome cerca de 20% da glicose e do oxigênio corporais em respiração celular aeróbica contínua. As células da glia (astrócitos, oligodendrócitos que formam a bainha de mielina no SNC, micróglia e células ependimárias) garantem nutrição, velocidade de condução saltatória e defesa imunológica através da Barreira Hematoencefálica.',
    icon: '🧠',
    soundType: 'electric',
    enemRecurrence: 'Altíssima',
    realLifeInfo: {
      imageUrl: realBrainImg,
      sourceType: 'Fotografia Anatômica Real & Ressonância Magnética (RM)',
      magnificationOrScale: 'Escala Macroscópica Natural (~1.4 kg / 15 cm)',
      visualDescription:
        'Espécime encefálico humano real dissecado. Observa-se a superfície do córtex cerebral ricamente pregueada em giros e sulcos com vascularização leptomeníngea e contraste entre substância cinzenta e branca.',
      keyRealFeatures: [
        'Sulcos e giros corticais que quadruplicam a área do córtex',
        'Vascularização superficial pelas artérias cerebrais',
        'Estrutura bilobada unida pelo corpo caloso',
      ],
    },
    enemKeywords: [
      'Sinapse química',
      'Bomba de Sódio e Potássio',
      'Condução Saltatória',
      'Bulbo e pH Sanguíneo',
      'Neurotransmissores e Drogas',
      'Hipotálamo e Termorregulação',
    ],
    enemTips: [
      {
        title: 'Bulbo e Frequência Respiratória',
        description:
          'O bulbo raquidiano não mede diretamente o oxigênio (O2), mas sim a elevação de CO2 e a queda de pH (acidose carbônica) no sangue e líquor, acelerando o ritmo respiratório.',
        type: 'frequente',
      },
      {
        title: 'Ação de Drogas e Venenos nas Sinapses',
        description:
          'Questões do ENEM adoram cobrar substâncias que bloqueiam receptores pós-sinápticos (ex: curare bloqueando acetilcolina), inibem a recaptação de neurotransmissores (antidepressivos) ou inibem a enzima acetilcolinesterase (inseticidas organofosforados).',
        type: 'pegadinha',
      },
      {
        title: 'Bainha de Mielina e Esclerose Múltipla',
        description:
          'A destruição autoimune da mielina reduz drasticamente a velocidade de propagação do impulso nervoso porque impede a condução saltatória nos nós de Ranvier.',
        type: 'interdisciplinar',
      },
    ],
    flashcards: [
      {
        front: 'Qual o principal estímulo químico detectado pelo bulbo para aumentar a frequência respiratória?',
        back: 'O aumento da concentração de CO2 (hipercapnia) e a consequente queda do pH sanguíneo (formação de ácido carbônico H2CO3 e dissociação em H+ + HCO3-).',
      },
      {
        front: 'Como a Bomba de Sódio e Potássio atua no repouso neuronal?',
        back: 'Realiza transporte ativo primário consumindo ATP: bombeia 3 Na+ para fora e 2 K+ para dentro contra seus gradientes, gerando o potencial de repouso negativo intracelular (-70 mV).',
      },
      {
        front: 'O que caracteriza a condução saltatória nos neurônios mielinizados?',
        back: 'O potencial de ação despolariza a membrana apenas nas regiões desprovidas de mielina (Nós de Ranvier), aumentando exponencialmente a velocidade do impulso elétrico com economia de ATP.',
      },
    ],
    enemQuestion: {
      id: 'enem-cerebro-1',
      context:
        'Durante uma prova de corrida intensa de 400 metros, um atleta acumula grande quantidade de dióxido de carbono (CO2) no sangue arterial devido ao aumento da taxa metabólica muscular. Esse acúmulo provoca uma reação com a água mediada pela enzima anidrase carbônica, gerando ácido carbônico que se dissocia em íons H+ e bicarbonato.',
      question:
        'Diante desse quadro fisiológico, a resposta integradora do sistema nervoso central para restabelecer a homeostase ocorre por meio do estímulo no(a):',
      options: [
        {
          letter: 'A',
          text: 'cerebelo, que inibe os movimentos diafragmáticos para reter oxigênio alveolar.',
          isCorrect: false,
          explanation: 'O cerebelo coordena equilíbrio e tônus motor, não o ritmo ventilatório.',
        },
        {
          letter: 'B',
          text: 'bulbo raquidiano, cujos quimiorreceptores detectam a queda do pH sanguíneo e aumentam a frequência ventilatória.',
          isCorrect: true,
          explanation:
            'Gabarito Correto! O centro respiratório bulbar responde primariamente ao aumento de H+ (queda de pH) decorrente do CO2 elevado, disparando impulsos motores para aumentar a ventilação e expelir CO2.',
        },
        {
          letter: 'C',
          text: 'córtex cerebral frontal, que diminui a pressão arterial para reduzir a circulação periférica.',
          isCorrect: false,
          explanation: 'A regulação respiratória básica é reflexa e involuntária, orquestrada pelo tronco encefálico.',
        },
        {
          letter: 'D',
          text: 'hipotálamo, que estimula a retenção de CO2 nos rins através da liberação de vasopressina.',
          isCorrect: false,
          explanation: 'A vasopressina (ADH) atua na retenção de água, não na retenção direta de CO2 gasoso.',
        },
        {
          letter: 'E',
          text: 'medula espinhal, que converte o excesso de íons H+ em glicose por gliconeogênese.',
          isCorrect: false,
          explanation: 'Gliconeogênese é um processo metabólico hepático e renal, não medular.',
        },
      ],
      competenceSkill: 'Competência de Área 4 - Habilidade 14 (Identificar padrões em fenômenos biológicos de regulação e homeostase).',
      generalExplanation:
        'A regulação respiratória bulbar é um dos clássicos absolutos do ENEM. A acidose respiratória (excesso de H+ por CO2) estimula quimiorreceptores centrais no bulbo, que aumentam a frequência e amplitude respiratória (hiperventilação) para eliminar CO2 e alcalinizar o sangue de volta ao pH normal (7,35 - 7,45).',
    },
    svgHighlightId: 'highlight-cerebro',
  },
  {
    id: 'olhos',
    name: 'Olhos & Visão',
    scientificName: 'Organum Visus / Oculus',
    zone: 'cabeca',
    tagline: 'Fotorrecepção, Óptica da Visão e Foco da Imagem na Retina',
    shortDesc: 'Captação de luz, ajuste de foco pelo cristalino e conversão de imagens em impulsos elétricos para o cérebro.',
    simpleAnalogy:
      'Pense no olho como uma câmera fotográfica ultra-avançada: a córnea e o cristalino funcionam como as lentes de foco, a pupila como o diafragma que abre no escuro e fecha no claro, e a retina lá atrás como o sensor digital que tira a foto e manda o arquivo pelo cabo (o nervo óptico) para o cérebro revelar.',
    easySteps: [
      'Entrada de Luz: A luz entra pela pupila (a bolinha preta do olho).',
      'Ajuste de Foco: O cristalino estica ou engrossa para focar objetos perto ou longe.',
      'Detecção na Retina: Cones detectam cores (vermelho, verde, azul) e bastonetes enxergam no escuro.',
      'Envio ao Cérebro: O nervo óptico leva a foto instantânea para o cérebro interpretar.',
    ],
    fullPhysiology:
      'O olho funciona como um sistema óptico convergente. A luz atravessa a córnea, o humor aquoso, a pupila (controlada pelos músculos da íris), o cristalino (lente biconvexa com acomodação visual via músculo ciliar) e o humor vítreo até atingir a retina. Na retina, os fotorreceptores realizam a fototransdução: os bastonetes proporcionam alta sensibilidade em baixa luminosidade (visão escotópica/preto e branco), enquanto os cones (sensíveis ao vermelho, verde e azul) atuam na acuidade visual e percepção de cores.',
    cellularBiochemistry:
      'A proteína rodopsina nos bastonetes é composta pela opsina ligada ao 11-cis-retinal (derivado da Vitamina A / Retinol). A absorção de luz isomeriza o retinal em todo-trans-retinal, desencadeando uma cascata via proteína G (transducina) que fecha canais de Na⁺/Ca²⁺ e hiperpolariza o fotorreceptor.',
    icon: '👁️',
    soundType: 'sparkle',
    enemRecurrence: 'Alta',
    realLifeInfo: {
      imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1000&q=80',
      sourceType: 'Retinografia & Fotografia Oftalmológica Real',
      magnificationOrScale: 'Escala Anatômica de Fundo de Olho (~24 mm)',
      visualDescription:
        'Visão real do fundo de olho mostrando a mácula lútea, a fóvea central (ponto de máxima acuidade visual com densidade exclusiva de cones) e os vasos sanguíneos retinianos convergindo no disco óptico.',
      keyRealFeatures: [
        'Fóvea central desprovida de bastonetes e saturada de cones',
        'Ramificações da artéria e veia central da retina',
        'Disco óptico (ponto cego anatômico sem fotorreceptores)',
      ],
    },
    enemKeywords: [
      'Acomodação visual e cristalino',
      'Miopia e Lentes Divergentes',
      'Hipermetropia e Lentes Convergentes',
      'Bastonetes, Cones e Daltonismo',
      'Vitamina A e Cegueira Noturna (Xeroftalmia)',
    ],
    enemTips: [
      {
        title: 'Miopia vs Hipermetropia no ENEM',
        description:
          'Miopia: imagem se forma ANTES da retina (globo ocular longo) -> correção com lentes DIVERGENTES (côncavas). Hipermetropia: imagem formada ATRÁS da retina -> correção com lentes CONVERGENTES (convexas).',
        type: 'frequente',
      },
      {
        title: 'Herança Ligada ao Sexo: Daltonismo',
        description:
          'O daltonismo é uma anomalia recessiva ligada ao cromossomo X que afeta a síntese dos pigmentos visuais nos cones. Homens (XᵈY) manifestam com apenas um alelo, mulheres precisam ser homozigotas recessivas (XᵈXᵈ).',
        type: 'interdisciplinar',
      },
    ],
    flashcards: [
      {
        front: 'Qual a carência vitamínica que causa a cegueira noturna (hemeralopia)?',
        back: 'Deficiência de Vitamina A (retinol), precursora do retinal, componente essencial do pigmento rodopsina nos bastonetes da retina.',
      },
      {
        front: 'Como o cristalino realiza a acomodação visual para objetos próximos?',
        back: 'O músculo ciliar se contrai, relaxando as zônulas de Zinn; o cristalino torna-se mais esférico/curvo, aumentando sua convergência (grau dióptrico).',
      },
    ],
    enemQuestion: {
      id: 'enem-olhos-1',
      context:
        'Um estudante que passava longas horas em frente a telas percebeu dificuldade crescente para enxergar com nitidez objetos distantes na sala de aula, como a lousa. O oftalmologista diagnosticou que os raios luminosos paralelos vindos do infinito convergiam em um ponto focal localizado antes do plano da retina.',
      question:
        'Para corrigir essa anomalia refrativa e permitir que a imagem se forme com nitidez na retina, o estudante deve utilizar óculos com lentes:',
      options: [
        {
          letter: 'A',
          text: 'convergentes, aumentando a refração da luz para aproximar o foco da córnea.',
          isCorrect: false,
          explanation: 'Lentes convergentes aproximariam ainda mais o foco, piorando a miopia.',
        },
        {
          letter: 'B',
          text: 'divergentes, que espalham os raios de luz deslocando a convergência focal para trás, sobre a retina.',
          isCorrect: true,
          explanation:
            'Gabarito Correto! Na miopia, a convergência excessiva ou globo alongado exige lentes divergentes (côncavas, vergência negativa) para afastar o ponto focal até a superfície da retina.',
        },
        {
          letter: 'C',
          text: 'cilíndricas opacas, destinadas a bloquear a luz que atinge os bastonetes retinianos.',
          isCorrect: false,
          explanation: 'Lentes opacas impediriam a visão; lentes cilíndricas são usadas para astigmatismo.',
        },
        {
          letter: 'D',
          text: 'bifocais convergentes, para forçar a contração contínua do músculo ciliar em repouso.',
          isCorrect: false,
          explanation: 'Na miopia não se usam lentes convergentes para longe.',
        },
        {
          letter: 'E',
          text: 'prismáticas planas, que convertem ondas luminosas em impulsos nervosos antes do nervo óptico.',
          isCorrect: false,
          explanation: 'Lentes ópticas externas não convertem luz em sinal nervoso; quem faz fototransdução é a retina.',
        },
      ],
      competenceSkill: 'Competência de Área 6 - Habilidade 20 (Caracterizar causas ou efeitos de anomalias ópticas e correções biomédicas).',
      generalExplanation:
        'A óptica da visão é um tema interdisciplinar clássico da prova de Ciências da Natureza do ENEM, unindo a Física das lentes esféricas delgadas com a Biologia e anatomia ocular.',
    },
    svgHighlightId: 'highlight-olhos',
  },
  {
    id: 'boca',
    name: 'Boca & Glândulas Salivares',
    scientificName: 'Cavitas Oris & Glandulae Salivariae',
    zone: 'cabeca',
    tagline: 'Início da Digestão Mecânica e Química com Atuação da Amilase Salivar',
    shortDesc: 'Mastigação pelos dentes, insalivação, quebra inicial do amido em pH neutro e formação do bolo alimentar.',
    simpleAnalogy:
      'Pense na boca como o triturador e o primeiro laboratório químico da digestão: os dentes picam tudo em pedacinhos (digestão mecânica) para facilitar o trabalho, enquanto a saliva joga água e a enzima ptialina para começar a quebrar o amido do pão e do arroz antes mesmo de você engolir.',
    easySteps: [
      'Trituração com Dentes: Pica o alimento para dar mais espaço para as enzimas agirem.',
      'Insalivação Neutra: A saliva lubrifica e mantém o pH em ~7.0.',
      'Quebra de Amido: A amilase salivar (ptialina) quebra o amido em maltose.',
      'Deglutição Segura: A língua empurra o bolo alimentar para o esôfago.',
    ],
    fullPhysiology:
      'A digestão tem início na cavidade oral. Os dentes executam a digestão mecânica (trituração e aumento da superfície de contato do alimento com as enzimas). As três grandes glândulas salivares pares (parótidas, submandibulares e sublinguais) secretam cerca de 1 a 1,5 litro de saliva por dia, contendo água, muco lubrificante (mucina), eletrólitos, lisozima (bactericida) e a enzima ptialina (amilase salivar).',
    cellularBiochemistry:
      'A amilase salivar (ptialina) possui pH ótimo próximo da neutralidade (~6,8 a 7,0). Ela catalisa a hidrólise de ligações glicosídicas alfa-1,4 internas do amido e glicogênio, gerando oligossacarídeos, maltose (dissacarídeo) e isomaltose. Ao atingir o estômago, o pH extremamente ácido (~2,0) do suco gástrico desnatura a amilase salivar, paralisando a digestão dos carboidratos até o duodeno.',
    icon: '👄',
    soundType: 'pop',
    enemRecurrence: 'Alta',
    realLifeInfo: {
      imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1000&q=80',
      sourceType: 'Fotografia Clínica & Histologia Oral',
      magnificationOrScale: 'Escala Anatômica / Corte Histológico 200x',
      visualDescription:
        'Cavidade oral real exibindo a mucosa jugal, o palato e o corte histológico dos ácinos serosos e mucosos das glândulas salivares parótidas secretoras de ptialina (amilase salivar).',
      keyRealFeatures: [
        'Ácinos glandulares serosos secretores de ptialina rica em água e enzimas',
        'Ductos excretores revestidos por epitélio colunar',
        'Papilas linguais com botões gustatórios fotorreceptores químicos',
      ],
    },
    enemKeywords: [
      'Amilase salivar / Ptialina',
      'pH ótimo enzimático (~7.0)',
      'Desnaturação no estômago',
      'Superfície de contato na mastigação',
      'Hidrólise de amido em maltose',
    ],
    enemTips: [
      {
        title: 'Gráfico de Atividade Enzimática vs pH',
        description:
          'O ENEM frequentemente coloca um gráfico com 3 curvas: Boca (ptialina, pico pH 7), Estômago (pepsina, pico pH 2) e Intestino (tripsina, pico pH 8). Guarde essa sequência clássica de pH: 7 -> 2 -> 8!',
        type: 'frequente',
      },
      {
        title: 'Carboidratos NÃO são digeridos no estômago',
        description:
          'Pegadinha comum: achar que o amido continua sendo quebrado no estômago. O HCl estomacal inativa a ptialina; a quebra do amido só é retomada no duodeno pela amilase pancreática.',
        type: 'pegadinha',
      },
    ],
    flashcards: [
      {
        front: 'Qual substrato e produto da reação catalisada pela amilase salivar (ptialina)?',
        back: 'Substrato: Amido (polissacarídeo). Produto: Maltose (dissacarídeo) e pequenas cadeias de glicose (dextrinas).',
      },
      {
        front: 'Por que a mastigação minuciosa acelera a velocidade da digestão química?',
        back: 'Porque fragmenta os alimentos, aumentando exponencialmente a área de superfície de contato exposta à ação das enzimas hidrolíticas.',
      },
    ],
    enemQuestion: {
      id: 'enem-boca-1',
      context:
        'Em um experimento laboratorial, tubos de ensaio contendo solução de amido e saliva fresca foram submetidos a diferentes condições de pH e temperatura. No tubo 1, mantido a 37 °C e pH 7,0, houve rápida digestão do amido em maltose. Já no tubo 2, após adição prévia de solução de ácido clorídrico concentrado (reduzindo o pH para 1,8), a digestão do amido não ocorreu.',
      question:
        'A ausência de atividade digestiva observada no tubo 2 deve-se ao fato de que o pH ácido causou na amilase salivar:',
      options: [
        {
          letter: 'A',
          text: 'rompimento das ligações peptídicas primárias por hidrólise espontânea.',
          isCorrect: false,
          explanation: 'O ácido estomacal não quebra a estrutura primária sem auxílio enzimático; ele altera a conformação espacial.',
        },
        {
          letter: 'B',
          text: 'desnaturação proteica, alterando sua estrutura tridimensional e inativando o sítio ativo catalítico.',
          isCorrect: true,
          explanation:
            'Gabarito Correto! Alterações extremas de pH modificam as cargas dos radicais de aminoácidos, desfazendo pontes de hidrogênio e atrações iônicas. A proteína desnatura e perde a conformação do seu sítio ativo.',
        },
        {
          letter: 'C',
          text: 'inversão da rota metabólica, transformando a maltose de volta em glicogênio bacteriano.',
          isCorrect: false,
          explanation: 'Enzimas catalisam reações termodinamicamente favoráveis; a amilase não polimeriza glicose em glicogênio.',
        },
        {
          letter: 'D',
          text: 'precipitação do substrato amiláceo em cristais insolúveis de celulose pura.',
          isCorrect: false,
          explanation: 'Amido não se transforma quimicamente em celulose por acidificação.',
        },
        {
          letter: 'E',
          text: 'oxidação dos monômeros de glicose com liberação imediata de gás oxigênio.',
          isCorrect: false,
          explanation: 'Não há reação de oxirredução liberando O2 nesse contexto digestivo.',
        },
      ],
      competenceSkill: 'Competência de Área 4 - Habilidade 15 (Interpretar dados experimentais sobre cinética e desnaturação enzimática).',
      generalExplanation:
        'Cinética enzimática e curvas de pH / temperatura são figurinhas carimbadas no ENEM. A ptialina opera em pH ótimo 7. Em meio ácido (pH ~2 do estômago), ela sofre desnaturação reversível/irreversível.',
    },
    svgHighlightId: 'highlight-boca',
  },
  {
    id: 'tireoide',
    name: 'Tireoide & Laringe',
    scientificName: 'Glandula Thyroidea & Larynx',
    zone: 'tronco',
    tagline: 'O termostato e acelerador do metabolismo e regulação de cálcio!',
    shortDesc: 'Glândula no pescoço em formato de borboleta que controla a velocidade com que o corpo queima calorias.',
    simpleAnalogy:
      'Pense na tireoide como o acelerador e o termostato do corpo humano: ela solta hormônios (T3 e T4 feitos com iodo) que dizem para as células se elas devem trabalhar rápido (queimando energia e aquecendo o corpo) ou desacelerar. Além disso, ela solta a Calcitonina, que guarda cálcio nos ossos.',
    easySteps: [
      'Captação de Iodo: Puxa o iodo do sal de cozinha para fabricar T3 e T4.',
      'Acelerar ou Frear: T3 e T4 mandam as células queimarem mais ou menos glicose.',
      'Controle por Feedback: Quando o hormônio sobe no sangue, a hipófise para de pedir mais.',
      'Cálcio nos Ossos: A calcitonina tira cálcio do sangue e deposita nos ossos.',
    ],
    fullPhysiology:
      'A tireoide está localizada no pescoço sobre a traqueia. Produz os hormônios tireoidianos Tri-iodotironina (T3) e Tiroxina (T4), sintetizados pelas células foliculares a partir do aminoácido tirosina e íons iodeto (I⁻). O eixo hormonal Hipotálamo-Hipófise-Tireoide é regulado por feedback negativo (retroalimentação negativa): o TRH hipotalâmico estimula a adenoipófise a secretar TSH, que estimula a tireoide. Níveis elevados de T3 e T4 inibem a liberação de TRH e TSH.',
    cellularBiochemistry:
      'T3 e T4 ligam-se a receptores nucleares, aumentando a transcrição gênica de bombas de Na⁺/K⁺ e enzimas da cadeia respiratória mitocondrial, elevando o consumo de oxigênio e a taxa metabólica basal. A tireoide também possui células parafoliculares (células C), que produzem a Calcitonina: hormônio hipocalcemiante que inibe osteoclastos e favorece a deposição de cálcio nos ossos.',
    icon: '🦋',
    soundType: 'bell',
    enemRecurrence: 'Alta',
    realLifeInfo: {
      imageUrl: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=1000&q=80',
      sourceType: 'Histopatologia & Fotografia Macroscópica Real',
      magnificationOrScale: 'Corte Histológico com H&E a 400x (~5 cm total)',
      visualDescription:
        'Corte microscópico real da glândula tireoide evidenciando os folículos tireoidianos esféricos preenchidos por coloide eosinofílico translúcido rico em tireoglobulina e iodo.',
      keyRealFeatures: [
        'Folículos tireoidianos circulares preenchidos por coloide',
        'Epitélio folicular cúbico simples sintetizador de T3 e T4',
        'Células C parafoliculares intersticiais produtoras de calcitonina',
      ],
    },
    enemKeywords: [
      'Feedback / Retroalimentação Negativa',
      'Iodo e Bócio Endêmico (Sal Iodado)',
      'Hipotireoidismo vs Hipertireoidismo',
      'Calcitonina (Tireoide) vs Paratormônio (Paratireoides)',
      'Taxa Metabólica Basal e Termogênese',
    ],
    enemTips: [
      {
        title: 'Por que o sal de cozinha brasileiro é iodado?',
        description:
          'Medida de saúde pública obrigatória para prevenir o Bócio Endêmico (papo) e o cretinismo. Sem iodo, a tireoide não produz T3/T4; a ausência de feedback negativo eleva o TSH de forma crônica, hipertrofiando a glândula.',
        type: 'frequente',
      },
      {
        title: 'Eixo Calcitonina vs Paratormônio',
        description:
          'Calcitonina (tireoide): Tira cálcio do sangue e põe no osso (HipoCalcemiante). Paratormônio/PTH (paratireoides): Tira cálcio do osso e põe no sangue (HiperCalcemiante). Dica mnemônica: Calcitonina "CALCa" o osso de cálcio!',
        type: 'pegadinha',
      },
    ],
    flashcards: [
      {
        front: 'Quais os sintomas clínicos clássicos do Hipotireoidismo e sua causa fisiológica?',
        back: 'Ganho de peso, intolerância ao frio, letargia, bradicardia e fadiga; causados pela redução na taxa metabólica basal e menor termogênese mitocondrial.',
      },
      {
        front: 'Como funciona a regulação por retroalimentação negativa da tireoide?',
        back: 'Níveis altos de T3 e T4 circulantes inibem a secreção de TSH na adenohipófise e de TRH no hipotálamo, mantendo a concentração hormonal equilibrada na corrente sanguínea.',
      },
    ],
    enemQuestion: {
      id: 'enem-tireoide-1',
      context:
        'No Brasil, a Lei Federal nº 6.150/1974 estabeleceu a obrigatoriedade da iodação do sal refinado destinado ao consumo humano. Antes dessa medida, populações que habitavam regiões distantes do litoral apresentavam elevada incidência de bócio endêmico (aumento volumétrico perceptível da glândula tireoide no pescoço).',
      question:
        'A hipertrofia glandular observada em indivíduos com dieta pobre em iodo é consequência direta do(a):',
      options: [
        {
          letter: 'A',
          text: 'acúmulo de glicose nos folículos tireoidianos devido à paralisação da respiração celular.',
          isCorrect: false,
          explanation: 'O bócio decorre da estimulação hormonal trófica contínua, não de depósito de glicose.',
        },
        {
          letter: 'B',
          text: 'estímulo contínuo do hormônio TSH sobre a tireoide, decorrente da falta de inibição por feedback negativo de T3 e T4.',
          isCorrect: true,
          explanation:
            'Gabarito Correto! Sem iodo, a tireoide não produz T3 e T4 em quantidades suficientes. A adenohipófise não recebe a inibição por feedback negativo e secreta TSH em excesso. O TSH estimula a proliferação celular e hipertrofia da tireoide, formando o bócio.',
        },
        {
          letter: 'C',
          text: 'hiperatividade dos osteoclastos promovida pela secreção descontrolada de calcitonina.',
          isCorrect: false,
          explanation: 'Calcitonina inibe osteoclastos; não tem relação causal primária com a gênese do bócio.',
        },
        {
          letter: 'D',
          text: 'excesso de tiroxina circulante que intoxica o tecido laringotraqueal subjacente.',
          isCorrect: false,
          explanation: 'Na carência de iodo ocorre déficit (hipotireoidismo), e não excesso de tiroxina.',
        },
        {
          letter: 'E',
          text: 'inibição da síntese de TRH pelo hipotálamo, provocando necrose do tecido epitelial.',
          isCorrect: false,
          explanation: 'O TRH hipotalâmico estará aumentado (desinibido) e não ocorre necrose no bócio comum.',
        },
      ],
      competenceSkill: 'Competência de Área 4 - Habilidade 16 (Avaliar propostas de intervenção em saúde coletiva associadas a distúrbios endócrinos).',
      generalExplanation:
        'O eixo endócrino hipotálamo-hipófise-tireoide e a política pública do sal iodado são conteúdos recorrentes no ENEM, integrando conceitos de biofísica, saúde pública e regulação hormonal por retroalimentação negativa.',
    },
    svgHighlightId: 'highlight-tireoide',
  },
  {
    id: 'coracao',
    name: 'Coração & Circulação',
    scientificName: 'Cor & Systema Cardiovasculare',
    zone: 'tronco',
    tagline: 'A bomba muscular automática que mantém o sangue em movimento 24 horas por dia!',
    shortDesc: 'Composto por 4 câmaras (2 átrios e 2 ventrículos), bombeia oxigênio para todo o corpo e envia sangue usado aos pulmões.',
    simpleAnalogy:
      'Pense no coração como a bomba hidráulica do seu corpo: ele bate sem parar cerca de 100 mil vezes por dia! O lado direito puxa o sangue usado (com pouco oxigênio) do corpo e empurra para os pulmões respirarem; o lado esquerdo recebe o sangue novinho e cheio de oxigênio e dá uma bombada forte pela aorta para irrigar da cabeça aos pés.',
    easySteps: [
      'Chegada do Sangue Usado: Veias cavas trazem o sangue do corpo para o átrio direito.',
      'Envio aos Pulmões: O ventrículo direito bombeia o sangue para os pulmões se oxigenarem.',
      'Retorno Fresco: O sangue oxigenado volta ao átrio e ventrículo esquerdo.',
      'Disparo Sistêmico: O ventrículo esquerdo contrai com força máxima, lançando o sangue na artéria aorta.',
    ],
    fullPhysiology:
      'Nos seres humanos, a circulação é fechada, dupla e completa (não há mistura de sangue venoso e arterial no coração). O lado direito recebe sangue desoxigenado (venoso) pelas veias cavas e o bombeia para os pulmões pela artéria pulmonar (Pequena Circulação / Hematose). O lado esquerdo recebe sangue oxigenado (arterial) pelas veias pulmonares e o ejeta para o corpo inteiro através da Artéria Aorta (Grande Circulação).',
    cellularBiochemistry:
      'O miocárdio possui automatismo cardíaco (miogênico) originado no Nó Sinoatrial (marcapasso natural), propagado pelo nó atrioventricular, feixe de His e fibras de Purkinje. As células musculares estriadas cardíacas são unidas por discos intercalares com junções comunicantes (gap junctions), permitindo a transmissão rápida do potencial de ação e contração em sincício. A pressão arterial típica sistólica (~120 mmHg) reflete a contração ventricular e a diastólica (~80 mmHg) o relaxamento.',
    icon: '❤️',
    soundType: 'heartbeat',
    enemRecurrence: 'Altíssima',
    realLifeInfo: {
      imageUrl: realHeartImg,
      sourceType: 'Fotografia Cirúrgica & Anatômica Real',
      magnificationOrScale: 'Tamanho Natural Adulto (~300 g / 12 cm)',
      visualDescription:
        'Espécime anatômico real do coração humano dissecado. Observa-se a artéria aorta ascendente com parede elástica espessa, o tronco pulmonar, as artérias coronárias na superfície do miocárdio e a ponta (ápice) ventricular.',
      keyRealFeatures: [
        'Artéria aorta e veias cavas com conexões vasculares nítidas',
        'Músculo cardíaco (miocárdio) estriado involuntário',
        'Artérias coronárias irrigando o ápice e septo',
      ],
    },
    enemKeywords: [
      'Circulação Dupla e Completa',
      'Artéria (sai) vs Veia (chega)',
      'Nó Sinoatrial e Marcapasso Miogênico',
      'Ventrículo Esquerdo (miocárdio mais espesso)',
      'Hipertensão Arterial e Aterosclerose',
      'Válvulas Cardíacas e Refluxo',
    ],
    enemTips: [
      {
        title: 'Regra de Ouro dos Vasos',
        description:
          'Toda artéria SAI do coração (transporta sob alta pressão, parede elástica e muscular espessa). Toda veia CHEGA ao coração (baixa pressão, presença de válvulas para impedir refluxo). Cuidado: a artéria pulmonar leva sangue VENOSO e as veias pulmonares trazem sangue ARTERIAL!',
        type: 'frequente',
      },
      {
        title: 'Por que a parede do Ventrículo Esquerdo é muito mais grossa?',
        description:
          'Porque precisa exercer força contrátil suficiente para impulsionar o sangue por toda a circulação sistêmica (da cabeça aos pés), enfrentando maior resistência periférica.',
        type: 'frequente',
      },
      {
        title: 'Controle Autônomo da Frequência Cardíaca',
        description:
          'Sistema Nervoso Simpático: libera Noradrenalina -> Taquicardia (aumenta FC). Sistema Nervoso Parassimpático (Nervo Vago): libera Acetilcolina -> Bradicardia (diminui FC).',
        type: 'pegadinha',
      },
    ],
    flashcards: [
      {
        front: 'Qual o trajeto do sangue oxigenado desde os pulmões até o corpo?',
        back: 'Pulmões -> Veias Pulmonares -> Átrio Esquerdo -> Válvula Mitral (Bicúspide) -> Ventrículo Esquerdo -> Válvula Aórtica -> Artéria Aorta -> Tecidos.',
      },
      {
        front: 'O que diferencia estruturalmente artérias e veias?',
        back: 'Artérias têm túnica média com músculo liso e elastina muito mais espessos para suportar altas pressões sistólicas; veias têm lúmen mais largo, menor espessura e possuem válvulas semilunares unidirecionais.',
      },
    ],
    enemQuestion: {
      id: 'enem-coracao-1',
      context:
        'Um indivíduo sedentário e hipertenso apresentou espessamento aterosclerótico nas artérias coronárias, vasos responsáveis pela irrigação nutrícia do próprio músculo cardíaco. Em um exame de eletrocardiograma, os médicos avaliaram a propagação dos estímulos elétricos gerados a partir do marcapasso natural.',
      question:
        'O nó sinoatrial, responsável pelo disparo primário dos batimentos cardíacos normais em repouso, localiza-se na parede do(a):',
      options: [
        {
          letter: 'A',
          text: 'átrio direito, próximo à desembocadura da veia cava superior.',
          isCorrect: true,
          explanation:
            'Gabarito Correto! O nó sinoatrial (ou sinusal) está situado na parede superior do átrio direito. Ele despolariza espontaneamente de forma rítmica, propagando a onda de contração para ambos os átrios e depois para o nó atrioventricular.',
        },
        {
          letter: 'B',
          text: 'ventrículo esquerdo, na base da válvula aórtica tricúspide.',
          isCorrect: false,
          explanation: 'O marcapasso primário é atrial direito; no ventrículo esquerdo estão as ramificações finais de Purkinje.',
        },
        {
          letter: 'C',
          text: 'septo interventricular membranoso, junto às cordas tendíneas.',
          isCorrect: false,
          explanation: 'No septo interventricular corre o Feixe de His, e não o nó sinoatrial.',
        },
        {
          letter: 'D',
          text: 'átrio esquerdo, conectado diretamente às quatro veias pulmonares.',
          isCorrect: false,
          explanation: 'O átrio esquerdo recebe sangue oxigenado mas não abriga o nó sinoatrial primário.',
        },
        {
          letter: 'E',
          text: 'artéria pulmonar, regulando o fluxo sanguíneo em direção aos alvéolos.',
          isCorrect: false,
          explanation: 'As artérias são vasos condutores que não contêm marcapasso miogênico intrínseco.',
        },
      ],
      competenceSkill: 'Competência de Área 4 - Habilidade 14 (Compreender a fisiologia integrada do sistema cardiovascular humano).',
      generalExplanation:
        'A anatomia funcional do coração, trajeto do sangue, distinção entre artérias/veias e a condução miogênica constituem uma das temáticas mais tradicionais em provas de vestibulares de alta concorrência e no ENEM.',
    },
    svgHighlightId: 'highlight-coracao',
  },
  {
    id: 'pulmoes',
    name: 'Pulmões & Alvéolos',
    scientificName: 'Pulmones & Alveoli Pulmonares',
    zone: 'tronco',
    tagline: 'Troca de oxigênio do ar pelo gás carbônico do sangue a cada respiração!',
    shortDesc: 'Contém cerca de 300 milhões de alvéolos (mini-saquinhos) que fazem o oxigênio entrar no sangue e o CO2 sair.',
    simpleAnalogy:
      'Pense nos pulmões como duas árvores ocas com cerca de 300 milhões de folhinhas microscópicas (os alvéolos): toda vez que você puxa o ar, o oxigênio atravessa essas paredes fininhas e entra nos glóbulos vermelhos do sangue. Ao mesmo tempo, o gás carbônico que o corpo usou passa para dentro dos saquinhos e você sopra ele para fora.',
    easySteps: [
      'Entrada do Ar: O diafragma desce e cria um vácuo que suga o ar rico em oxigênio.',
      'Troca Gasosa nos Alvéolos: O oxigênio pula para dentro do sangue e se agarra na hemoglobina.',
      'Saída do CO2: O gás carbônico que veio dos órgãos pula para fora do sangue.',
      'Expiração Elástica: O diafragma relaxa e empurra o ar usado para fora.',
    ],
    fullPhysiology:
      'A ventilação pulmonar é impulsionada pela mecânica respiratória. Na inspiração, o diafragma e os músculos intercostais externos se contraem, expandindo a caixa torácica; a pressão intrapleural/intrapulmonar cai em relação à atmosférica e o ar entra passivamente por gradiente de pressão. Na expiração em repouso, esses músculos relaxam, o volume torácico diminui, a pressão interna aumenta e o ar é ejetado elasticamente.',
    cellularBiochemistry:
      'Nos alvéolos pulmonares ocorre a Hematose: o O2 difunde-se do lúmen alveolar para o capilar, ligando-se cooperativamente ao ferro heme da Hemoglobina (formando oxiemoglobina). O CO2 é transportado no sangue de 3 formas: ~70% como íon bicarbonato (HCO3⁻) dissolvido no plasma, ~20% ligado à hemoglobina (carboemoglobina) e ~7-10% dissolvido fisicamente como gás livre. O surfactante pulmonar (sintetizado pelos pneumócitos tipo II) reduz a tensão superficial da água alveolar, impedindo o colapso (atelectasia).',
    icon: '🌬️',
    soundType: 'breath',
    enemRecurrence: 'Altíssima',
    realLifeInfo: {
      imageUrl: realLungsImg,
      sourceType: 'Microscopia Eletrônica de Varredura (MEV)',
      magnificationOrScale: 'Aumento de 1.200x (Alvéolos com ~200 µm)',
      visualDescription:
        'Micrografia eletrônica de varredura real do parênquima pulmonar revelando a rede esponjosa alveolar tridimensional, circundada por capilares sanguíneos ultrafinos onde ocorre a hematose por difusão.',
      keyRealFeatures: [
        'Sacos alveolares em formato de favo de mel aumentando a área superficial (~100 m²)',
        'Parede alveolar delgada formada por pneumócitos tipo I e II',
        'Malha de capilares contíguos com hemácias em fila única',
      ],
    },
    enemKeywords: [
      'Hematose por Difusão Simples',
      'Mecânica Ventilatória (Diafragma e Pressão Negativa)',
      'Transporte de CO2 na forma de Bicarbonato (HCO3-)',
      'Efeito Bohr e Liberação de O2 nos Tecidos',
      'Surfactante Alveolar e Tensão Superficial',
      'Intoxicação por Monóxido de Carbono (Carboxiemoglobina)',
    ],
    enemTips: [
      {
        title: 'Intoxicação por Monóxido de Carbono (CO)',
        description:
          'O CO liga-se à hemoglobina com afinidade ~200 vezes superior ao O2, formando a Carboxiemoglobina estável. Isso impede o transporte de oxigênio, levando à asfixia celular química mesmo com alvéolos cheios de ar.',
        type: 'frequente',
      },
      {
        title: 'Efeito Bohr nos Tecidos em Atividade',
        description:
          'Em tecidos com alta taxa metabólica (muito CO2 e pH ácido), a afinidade da hemoglobina pelo oxigênio DIMINUI, facilitando a entrega e descarregamento do O2 para as células musculares.',
        type: 'conceito_chave',
      },
    ],
    flashcards: [
      {
        front: 'Qual a principal forma de transporte do dióxido de carbono (CO2) no sangue humano?',
        back: 'Na forma de íon bicarbonato (HCO3-) dissolvido no plasma sanguíneo (~70%), gerado pela ação da enzima anidrase carbônica no interior das hemácias.',
      },
      {
        front: 'Como a contração do diafragma gera a entrada de ar nos pulmões durante a inspiração?',
        back: 'A contração do diafragma o desloca para baixo, aumentando o volume da cavidade torácica. Pela Lei de Boyle, o aumento de volume reduz a pressão interna abaixo da pressão atmosférica, fazendo o ar entrar por sucção.',
      },
    ],
    enemQuestion: {
      id: 'enem-pulmoes-1',
      context:
        'Aquecedores a gás instalados de forma irregular em ambientes fechados podem produzir monóxido de carbono (CO) através da combustão incompleta. Diferente do dióxido de carbono (CO2), o CO não tem cheiro perceptível e sua inalação pode ser fatal em poucos minutos.',
      question:
        'A letalidade da intoxicação aguda por monóxido de carbono decorre principalmente do fato de que esse gás:',
      options: [
        {
          letter: 'A',
          text: 'destrói a parede de fosfolipídios do surfactante pulmonar, gerando colapso mecânico imediato da traqueia.',
          isCorrect: false,
          explanation: 'A traqueia possui anéis cartilaginosos e não colapsa por surfactante.',
        },
        {
          letter: 'B',
          text: 'forma com a hemoglobina um complexo altamente estável (carboxiemoglobina), bloqueando o transporte de oxigênio aos tecidos.',
          isCorrect: true,
          explanation:
            'Gabarito Correto! O monóxido de carbono (CO) tem afinidade 200 a 250 vezes maior que o O2 pelos sítios de ferro da hemoglobina. Ao formar carboxiemoglobina irreversível/muito estável, impede o transporte de O2, causando hipóxia tecidual e morte celular.',
        },
        {
          letter: 'C',
          text: 'reage com a água alveolar formando ácido clorídrico concentrado que corrói os brônquios.',
          isCorrect: false,
          explanation: 'O CO não forma ácido clorídrico; isso ocorreria com cloro gasoso (Cl2).',
        },
        {
          letter: 'D',
          text: 'induz hiperventilação descontrolada ao ativar de forma permanente os receptores de glicose do cerebelo.',
          isCorrect: false,
          explanation: 'O cerebelo não possui receptores de glicose que controlam ventilação por CO.',
        },
        {
          letter: 'E',
          text: 'catalisa a conversão imediata de todo o oxigênio celular em gás metano.',
          isCorrect: false,
          explanation: 'Metano não é produto do metabolismo aeróbico humano.',
        },
      ],
      competenceSkill: 'Competência de Área 4 - Habilidade 14 (Compreender as bases fisiológicas e toxicológicas do transporte de gases no corpo humano).',
      generalExplanation:
        'Questão clássica interdisciplinar de Biologia e Química no ENEM: diferenciação entre Oxiemoglobina (Hb + O2), Carboemoglobina (Hb + CO2) e Carboxiemoglobina (Hb + CO, extremamente estável e tóxica).',
    },
    svgHighlightId: 'highlight-pulmoes',
  },
  {
    id: 'estomago',
    name: 'Estômago',
    scientificName: 'Ventriculus / Gaster',
    zone: 'tronco',
    tagline: 'O caldeirão ácido que quebra as carnes e proteínas com a pepsina!',
    shortDesc: 'Bolsa muscular em forma de J que mistura o alimento com ácido forte e pepsina para dissolver proteínas.',
    simpleAnalogy:
      'Pense no estômago como um liquidificador com banho de ácido forte: ele joga Ácido Clorídrico (com pH 2 super corrosivo) para amolecer as carnes e matar qualquer micróbio da comida, e solta a enzima pepsina para cortar as proteínas em pedacinhos menores. Para não se queimar, ele se protege com uma camada grossa de muco.',
    easySteps: [
      'Chegada do Alimento: O esfíncter abre e recebe o bolo alimentar mastigado.',
      'Banho de Ácido Clorídrico: O pH cai para 2, ativando a enzima pepsina e matando bactérias.',
      'Digestão de Proteínas: A pepsina corta a carne, ovos e queijos em pedacinhos.',
      'Formação do Quimo: O bolo alimentar vira uma pasta ácida chamada quimo e vai para o duodeno.',
    ],
    fullPhysiology:
      'O estômago realiza movimentos peristálticos vigorosos de mistura. A mucosa gástrica possui glândulas com diferentes tipos celulares: as células parietais (ou oxínticas) secretam HCl e Fator Intrínseco (essencial para a absorção ileal de vitamina B12); as células principais (ou zimogênicas) secretam o pepsinogênio (zimogênio inativo); e as células mucosas secretam muco alcalino rico em bicarbonato que protege a parede estomacal da autodigestão e da acidez extrema.',
    cellularBiochemistry:
      'O HCl estomacal possui tripla função crucial: 1) cria o pH ótimo (~1,8 a 2,2) para a atividade da enzima pepsina; 2) promove a clivagem autocatalítica do pepsinogênio inativo na sua forma ativa (pepsina); 3) atua como barreira antimicrobiana inata, desvitalizando a maioria das bactérias ingeridas com a dieta. A pepsina é uma endopeptidase que cliva ligações peptídicas internas de proteínas, transformando-as em peptídeos menores (polipeptídeos e oligopeptídeos).',
    icon: '🥣',
    soundType: 'digest',
    enemRecurrence: 'Altíssima',
    realLifeInfo: {
      imageUrl: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=1000&q=80',
      sourceType: 'Endoscopia Digestiva Alta & Histologia Gástrica',
      magnificationOrScale: 'Visão Endoscópica Real / Corte Histológico 250x',
      visualDescription:
        'Imagem endoscópica real do corpo e antro estomacal evidenciando as pregas gástricas (rugae) recobertas pela camada protetora de muco alcalino e fossetas gástricas profundas.',
      keyRealFeatures: [
        'Pregas mucosas longitudinais espessas que acomodam o volume alimentar',
        'Fossetas com células parietais (HCl e fator intrínseco) e principais (pepsinogênio)',
        'Barreira de muco viscoso de proteção contra pH 2.0',
      ],
    },
    enemKeywords: [
      'Pepsina e Pepsinogênio (Zimogênio)',
      'Ácido Clorídrico (HCl) e pH ~2',
      'Células Parietais e Fator Intrínseco (Vit. B12)',
      'Muco Protetor e Úlcera Péptica (H. pylori)',
      'Antiácidos e Inibidores de Bomba de Prótons (Omeprazol)',
    ],
    enemTips: [
      {
        title: 'Por que o estômago não se autodigere?',
        description:
          '1) Secreção de muco espesso e bicarbonato; 2) Junções oclusivas estreitas entre as células epiteliais; 3) Secreção da pepsina na forma inativa de zimogênio (pepsinogênio), que só é ativada no lúmen.',
        type: 'frequente',
      },
      {
        title: 'Uso crônico de Omeprazol e Absorção de Nutrientes',
        description:
          'Inibidores da bomba H+/K+ ATPase reduzem a acidez estomacal. Isso pode comprometer a ativação da pepsina, a absorção de ferro (que precisa do meio ácido para redução de Fe3+ a Fe2+) e a proteção contra patógenos.',
        type: 'interdisciplinar',
      },
    ],
    flashcards: [
      {
        front: 'Qual o papel do Ácido Clorídrico (HCl) na digestão gástrica?',
        back: 'Ativa o pepsinogênio transformando-o na enzima ativa pepsina, estabelece o pH ótimo ácido (~2,0) para digestão proteica e atua como barreira antimicrobiana.',
      },
      {
        front: 'O que é um zimogênio e por que a pepsina é secretada dessa forma?',
        back: 'Zimogênio é uma enzima precursora inativa. A pepsina é secretada como pepsinogênio para evitar que digira as proteínas das próprias células glandulares que a produziram.',
      },
    ],
    enemQuestion: {
      id: 'enem-estomago-1',
      context:
        'Indivíduos submetidos a cirurgia bariátrica com ressecção gástrica extensa (gastrectomia) frequentemente necessitam de suplementação injetável periódica de cobalamina (vitamina B12) para evitar o desenvolvimento de anemia perniciosa.',
      question:
        'A necessidade dessa suplementação deve-se à redução da produção estomacal de:',
      options: [
        {
          letter: 'A',
          text: 'pepsina, que atua na ligação covalente entre a vitamina B12 e os lipídios da dieta.',
          isCorrect: false,
          explanation: 'Pepsina cliva proteínas e não atua como carreadora específica de absorção ileal da B12.',
        },
        {
          letter: 'B',
          text: 'fator intrínseco pelas células parietais, glicoproteína indispensável para a absorção da vitamina B12 no íleo.',
          isCorrect: true,
          explanation:
            'Gabarito Correto! As células parietais do estômago produzem HCl e Fator Intrínseco. Sem o fator intrínseco, a vitamina B12 não consegue se ligar aos receptores nos enterócitos do íleo terminal, causando anemia megaloblástica/perniciosa.',
        },
        {
          letter: 'C',
          text: 'bile emulsionante, que solubiliza as vitaminas hidrossolúveis no interior do quimo gástrico.',
          isCorrect: false,
          explanation: 'A bile é produzida pelo fígado e solubiliza lipídios/vitaminas lipossolúveis (A, D, E, K).',
        },
        {
          letter: 'D',
          text: 'gastrina pelas células principais, que degrada diretamente os glóbulos vermelhos senescentes.',
          isCorrect: false,
          explanation: 'A destruição de hemácias velhas ocorre no baço (hemocaterese).',
        },
        {
          letter: 'E',
          text: 'mucina protetora, que converte a vitamina B12 em ácido fólico ativo.',
          isCorrect: false,
          explanation: 'Mucina lubrifica a mucosa; não converte B12 em folato.',
        },
      ],
      competenceSkill: 'Competência de Área 4 - Habilidade 15 (Relacionar fisiologia celular e orgânica com manifestações clínicas e carências vitamínicas).',
      generalExplanation:
        'O Fator Intrínseco gástrico e sua relação com a vitamina B12 e a eritropoiese na medula óssea são pontes comuns exploradas no ENEM unindo fisiologia digestiva, bioquímica e hematologia.',
    },
    svgHighlightId: 'highlight-estomago',
  },
  {
    id: 'figado',
    name: 'Fígado & Vesícula Biliar',
    scientificName: 'Hepar & Vesica Biliaris',
    zone: 'tronco',
    tagline: 'O grande laboratório de química, filtro de toxinas e fabricante de bile!',
    shortDesc: 'Produz a bile (detergente para gorduras), guarda glicose de reserva (glicogênio) e limpa o sangue.',
    simpleAnalogy:
      'Pense no fígado como a maior fábrica química e estação de reciclagem do corpo: tudo o que você come passa por ele primeiro para ser filtrado. Ele neutraliza remédios e toxinas, transforma a amônia perigosa em ureia, guarda açúcar de reserva para quando você estiver com fome e fabrica a bile (que funciona como um detergente de prato para dissolver a gordura da comida).',
    easySteps: [
      'Filtragem do Sangue: A veia porta leva todos os nutrientes do intestino para inspeção.',
      'Fabricação da Bile: Produz o detergente natural que desmancha as gotas de gordura.',
      'Armazenamento na Vesícula: A vesícula guarda a bile concentrada para soltar na hora do almoço.',
      'Reserva de Açúcar: Estoca glicose na forma de glicogênio e limpa substâncias tóxicas.',
    ],
    fullPhysiology:
      'O fígado é a maior glândula do corpo humano, recebendo sangue oxigenado pela artéria hepática e sangue rico em nutrientes absorvidos no intestino através da Veia Porta Hepática. Produz diariamente cerca de 600 a 1000 mL de bile, que é armazenada e concentrada na Vesícula Biliar. A bile é lançada no duodeno pelo ducto colédoco em resposta ao hormônio colecistoquinina (CCK).',
    cellularBiochemistry:
      'ATENÇÃO ENEM: A bile NÃO contém enzimas digestivas! Seus sais biliares (derivados do colesterol) agem como detergentes anfipáticos, emulsionando gotículas de gordura em micelas menores, o que aumenta a superfície de contato para a ação da enzima Lipase Pancreática. No metabolismo, o fígado realiza: 1) Glicogênese e Glicogenólise reguladas por insulina e glucagon; 2) Gliconeogênese a partir de aminoácidos e lactato; 3) Ciclo da Ornitina/Ureia (converte a amônia NH3 neurotóxica em ureia, menos tóxica e solúvel); 4) Desintoxicação via citocromo P450.',
    icon: '🧫',
    soundType: 'digest',
    enemRecurrence: 'Altíssima',
    realLifeInfo: {
      imageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1000&q=80',
      sourceType: 'Histologia Hepática & Fotografia Anatômica Real',
      magnificationOrScale: 'Aumento Histológico de 400x (~1.5 kg órgão)',
      visualDescription:
        'Corte histológico real de lóbulo hepático clássico exibindo cordões radiados de hepatócitos convergindo para a veia centrolobular, ladeados por sinusoides e tríades portais.',
      keyRealFeatures: [
        'Cordões de hepatócitos metabólicos ricos em glicogênio e peroxissomos',
        'Sinusoides hepáticos com macrófagos residentes (células de Kupffer)',
        'Canalículos biliares onde a bile é secretada continuamente',
      ],
    },
    enemKeywords: [
      'Bile: Ação Detergente Sem Enzimas',
      'Emulsificação de Gorduras para Lipase',
      'Glicogênio Hepático e Reserva Energética',
      'Ciclo da Ureia e Excreção de Amônia',
      'Veia Porta Hepática (Primeira passagem)',
      'Síntese de Albumina e Fatores de Coagulação',
    ],
    enemTips: [
      {
        title: 'Pegadinha Número 1 do ENEM sobre a Bile',
        description:
          'A bile NÃO faz digestão química/enzimática! Ela faz digestão física/mecânica (emulsificação). Se a alternativa disser "as enzimas da bile digerem triglicerídeos", está ERRADA!',
        type: 'pegadinha',
      },
      {
        title: 'Cálculos Biliares e Remoção da Vesícula',
        description:
          'Pacientes que retiram a vesícula biliar (colecistectomia) continuam produzindo bile normalmente no fígado, mas não têm reservatório para descargas rápidas; por isso, devem evitar refeições muito gordurosas de uma só vez.',
        type: 'frequente',
      },
    ],
    flashcards: [
      {
        front: 'Qual a função dos sais biliares na digestão dos lipídios?',
        back: 'Atuam como tensoativos/detergentes, emulsionando grandes gotas de gordura em microgotículas (micelas), aumentando a área de contato para o ataque catalítico da lipase pancreática.',
      },
      {
        front: 'O que ocorre no Ciclo da Ureia hepático?',
        back: 'A amônia (NH3) tóxica, gerada pela desaminação de aminoácidos, reage com CO2 e ornitina para produzir ureia, uma excreta nitrogenada solúvel e muito menos tóxica.',
      },
    ],
    enemQuestion: {
      id: 'enem-figado-1',
      context:
        'Um paciente que passou por cirurgia de retirada da vesícula biliar (colecistectomia) foi orientado pelo nutricionista a fracionar a ingestão de alimentos ricos em gordura ao longo do dia, evitando refeições copiosas ricas em frituras.',
      question:
        'Essa orientação nutricional fundamenta-se no fato de que o paciente:',
      options: [
        {
          letter: 'A',
          text: 'deixou de produzir a enzima lipase biliar que catalisava a quebra de lipídios no estômago.',
          isCorrect: false,
          explanation: 'A bile não possui enzimas e é sintetizada no fígado, não na vesícula.',
        },
        {
          letter: 'B',
          text: 'apresenta fluxo contínuo de bile gotejada no duodeno, porém sem capacidade de liberação concentrada rápida para emulsionar grandes volumes de gordura.',
          isCorrect: true,
          explanation:
            'Gabarito Correto! O fígado continua produzindo bile normalmente. A vesícula funcionava apenas como reservatório de armazenamento e concentração. Sem ela, a bile goteja continuamente em pequenas quantidades, dificultando a emulsificação de grandes cargas lipídicas repentinas.',
        },
        {
          letter: 'C',
          text: 'não consegue mais sintetizar glicogênio hepático a partir dos ácidos graxos absorvidos.',
          isCorrect: false,
          explanation: 'Glicogênio é polímero de glicose; a síntese hepática continua intacta.',
        },
        {
          letter: 'D',
          text: 'passa a secretar ácido clorídrico no duodeno, desnaturando as enzimas digestivas pancreáticas.',
          isCorrect: false,
          explanation: 'O HCl é secretado exclusivamente no estômago pelas células parietais.',
        },
        {
          letter: 'E',
          text: 'interrompeu a síntese de albumina plasmática, reduzindo a pressão coloidosmótica do sangue.',
          isCorrect: false,
          explanation: 'A síntese de albumina é função hepática mantida.',
        },
      ],
      competenceSkill: 'Competência de Área 4 - Habilidade 14 (Analisar a fisiologia das glândulas anexas do sistema digestório e dietas pós-operatórias).',
      generalExplanation:
        'O papel da bile (produzida no fígado, estocada na vesícula biliar, desprovida de enzimas) é uma das pegadinhas de fisiologia mais tradicionais e recorrentes em provas de Biologia do ENEM.',
    },
    svgHighlightId: 'highlight-figado',
  },
  {
    id: 'pancreas',
    name: 'Pâncreas',
    scientificName: 'Pancreas',
    zone: 'tronco',
    tagline: 'O controlador do açúcar no sangue (Insulina/Glucagon) e produtor de suco digestivo!',
    shortDesc: 'Glândula mista que neutraliza a acidez no intestino e regula a taxa de glicose com insulina e glucagon.',
    simpleAnalogy:
      'Pense no pâncreas como um órgão de função dupla superimportante: na digestão, ele joga bicarbonato (como antiácido) e enzimas para terminar de digerir tudo no intestino; e no sangue, ele funciona como um sensor inteligente de glicose — solta INSULINA para abrir as portas das células e guardar o açúcar depois do almoço, ou solta GLUCAGON quando você fica muito tempo sem comer.',
    easySteps: [
      'Sensor de Açúcar: Mede a quantidade de glicose circulando no sangue 24h por dia.',
      'Insulina (Pós-Almoço): Abre a porta das células musculares para a glicose entrar e alimentar o corpo.',
      'Glucagon (Jejum): Manda o fígado soltar glicose de reserva para você não desmaiar de fraqueza.',
      'Suco Pancreático (Digestão): Neutraliza o ácido com bicarbonato (pH sobe para 8) no intestino.',
    ],
    fullPhysiology:
      'O pâncreas é uma glândula mista. Na porção exócrina (ácinos pancreáticos), secreta o Suco Pancreático rico em íons Bicarbonato (HCO3⁻), que neutraliza o quimo ácido estomacal no duodeno elevando o pH para ~8,0, e um coquetel enzimático completo: Tripsina e Quimotripsina (proteínas), Lipase Pancreática (lipídios), Amilase Pancreática (amido) e Nucleases (DNA/RNA).',
    cellularBiochemistry:
      'Na porção endócrina (Ilhotas de Langerhans): as Células Beta secretam INSULINA (hormônio hipoglicemiante que estimula a translocação de transportadores GLUT4 para a membrana celular, promovendo a captação de glicose nos tecidos e a glicogênese hepática e muscular); as Células Alfa secretam GLUCAGON (hormônio hiperglicemiante que ativa a glicogenólise e a gliconeogênese no jejum). No Diabetes Tipo 1 há destruição autoimune das células beta; no Tipo 2 há resistência periférica à insulina.',
    icon: '🥞',
    soundType: 'pop',
    enemRecurrence: 'Altíssima',
    realLifeInfo: {
      imageUrl: 'https://images.unsplash.com/photo-1514792368985-f80e9d482a02?auto=format&fit=crop&w=1000&q=80',
      sourceType: 'Histologia com Imunofluorescência',
      magnificationOrScale: 'Aumento Microscópico de 300x',
      visualDescription:
        'Corte histológico real com imunocoloração do pâncreas: os ácinos exócrinos escuros circundam a Ilhota de Langerhans endócrina central, onde células beta produzem insulina e células alfa produzem glucagon.',
      keyRealFeatures: [
        'Ilhota de Langerhans esférica ricamente capilarizada (função endócrina)',
        'Ácinos pancreáticos secretores de suco digestivo e bicarbonato (função exócrina)',
        'Células beta com grânulos densos de armazenamento de insulina',
      ],
    },
    enemKeywords: [
      'Glândula Anfícrina / Mista',
      'Insulina (Células Beta - Hipoglicemiante)',
      'Glucagon (Células Alfa - Hiperglicemiante)',
      'Bicarbonato e Neutralização no Duodeno (pH 8)',
      'Diabetes Mellitus Tipo 1 vs Tipo 2',
      'Tripsinogênio e Enteroquinase',
    ],
    enemTips: [
      {
        title: 'Insulina vs Glucagon no Gráfico do ENEM',
        description:
          'Após refeição rica em carboidratos: pico de glicose -> pico de INSULINA -> glicemia cai. Em jejum prolongado: glicose cai -> pico de GLUCAGON -> quebra de glicogênio hepático para manter a glicemia.',
        type: 'frequente',
      },
      {
        title: 'Diabetes Tipo 1 vs Tipo 2',
        description:
          'Tipo 1 (Juvenil/Autoimune): Não produz insulina (destruição das células beta) -> exige insulina exógena. Tipo 2 (Adulto/Estilo de vida): Produz insulina, mas os receptores celulares apresentam resistência.',
        type: 'frequente',
      },
    ],
    flashcards: [
      {
        front: 'Por que o suco pancreático contém alta concentração de íons bicarbonato (HCO3-)?',
        back: 'Para neutralizar a acidez do quimo gástrico que chega ao duodeno, elevando o pH para cerca de 8,0, faixa ideal para o funcionamento das enzimas pancreáticas e entéricas.',
      },
      {
        front: 'Qual o mecanismo de ação da insulina na captação celular de glicose?',
        back: 'A insulina liga-se ao seu receptor tirosina-quinase na membrana celular, disparando uma cascata que promove a fusão de vesículas com transportadores GLUT-4 na membrana plasmática de células musculares e adiposas.',
      },
    ],
    enemQuestion: {
      id: 'enem-pancreas-1',
      context:
        'Um indivíduo saudável realizou um teste de tolerância oral à glicose (curva glicêmica). Uma hora após a ingestão de 75 gramas de glicose dissolvida em água, sua taxa de glicose sanguínea atingiu o ápice e começou a declinar gradativamente em direção aos valores basais de repouso.',
      question:
        'A redução da concentração plasmática de glicose de volta aos níveis de normalidade deve-se à ação da:',
      options: [
        {
          letter: 'A',
          text: 'adrenalina, estimulando a lipólise e a liberação de glicerol pelas glândulas adrenais.',
          isCorrect: false,
          explanation: 'Adrenalina é hiperglicemiante em situações de estresse.',
        },
        {
          letter: 'B',
          text: 'insulina secretada pelas células beta do pâncreas, promovendo o influxo de glicose para as células musculares e a glicogênese hepática.',
          isCorrect: true,
          explanation:
            'Gabarito Correto! O aumento da glicemia estimula a secreção de insulina pelas células beta das ilhotas pancreáticas. A insulina facilita o transporte de glicose para músculo e tecido adiposo (via GLUT-4) e estimula a síntese de glicogênio (glicogênese) no fígado e músculos.',
        },
        {
          letter: 'C',
          text: 'tripsina, que polimeriza os monossacarídeos livres no lúmen do intestino delgado.',
          isCorrect: false,
          explanation: 'Tripsina é enzima proteolítica, não atua no metabolismo de carboidratos.',
        },
        {
          letter: 'D',
          text: 'calcitonina, que desloca as moléculas de glicose para a matriz mineral óssea.',
          isCorrect: false,
          explanation: 'Calcitonina atua na homeostase do cálcio ósseo, não na glicose.',
        },
        {
          letter: 'E',
          text: 'glucagon pelas células alfa do pâncreas, inibindo a absorção intestinal de açúcares.',
          isCorrect: false,
          explanation: 'Glucagon é hiperglicemiante e atua no jejum estimulando a quebra de glicogênio.',
        },
      ],
      competenceSkill: 'Competência de Área 4 - Habilidade 14 (Compreender os mecanismos de feedback endócrino na regulação da glicemia).',
      generalExplanation:
        'A regulação hormonal da glicemia através do binômio antagônico Insulina/Glucagon é um dos pilares mais cobrados na prova de Ciências da Natureza do ENEM.',
    },
    svgHighlightId: 'highlight-pancreas',
  },
  {
    id: 'intestino_delgado',
    name: 'Intestino Delgado & Vilosidades',
    scientificName: 'Intestinum Tenue',
    zone: 'tronco',
    tagline: 'Digestão Final & Absorção de Nutrientes com Vilosidades e Microvilosidades',
    shortDesc: 'Duodeno, jejuno e íleo: aumento colossal da área de contato superficial para absorção de aminoácidos, glicose e lipídios.',
    fullPhysiology:
      'O intestino delgado mede cerca de 6 metros e divide-se em duodeno, jejuno e íleo. No duodeno ocorre a digestão final pelo suco entérico (contendo maltase, sacarase, lactase, peptidases e enteroquinase) e suco pancreático. No jejuno e íleo ocorre a absorção da quase totalidade dos monômeros nutritivos, água e vitaminas.',
    cellularBiochemistry:
      'Para maximizar a difusão e o transporte ativo, a mucosa intestinal possui três níveis de dobras: 1) Pregas circulares (válvulas de Kerckring); 2) Vilosidades intestinais (projeções digitiformes ricas em capilares sanguíneos e um capilar linfático central chamado Vaso Quilífero); 3) Microvilosidades no bordo em escova dos enterócitos. Isso expande a área interna de absorção para cerca de 250 a 300 m² (o tamanho de uma quadra de tênis!). Monossacarídeos e aminoácidos entram nos capilares em direção à veia porta hepática; ácidos graxos e colesterol formam quilomícrons e entram nos vasos quilíferos linfáticos.',
    icon: '🥖',
    soundType: 'digest',
    enemRecurrence: 'Altíssima',
    realLifeInfo: {
      imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1000&q=80',
      sourceType: 'Microscopia Eletrônica de Varredura (MEV)',
      magnificationOrScale: 'Aumento de 800x (Vilosidades ~1 mm)',
      visualDescription:
        'Micrografia eletrônica real das vilosidades do intestino delgado (jejuno), mostrando as projeções digitiformes cobertas por milhões de microvilosidades enterocíticas que criam uma área absortiva de ~250 m².',
      keyRealFeatures: [
        'Vilosidades digitiformes projetando-se no lúmen intestinal',
        'Borda em escova das microvilosidades com enzimas dissacaridases',
        'Vasos quilíferos linfáticos centrais e capilares fenestrados',
      ],
    },
    enemKeywords: [
      'Superfície de Contato (Vilosidades e Microvilosidades)',
      'Doença Celíaca e Atrofia de Vilosidades',
      'Intolerância à Lactose (deficiência de Lactase)',
      'Vasos Quilíferos Linfáticos (Absorção de Lipídios)',
      'Suco Entérico (Maltase, Sacarase, Peptidases)',
    ],
    enemTips: [
      {
        title: 'Doença Celíaca no ENEM',
        description:
          'A ingestão de glúten (proteína do trigo, centeio e cevada) gera inflamação autoimune que atrofia as vilosidades intestinais. Consequência: redução drástica da área de absorção -> desnutrição, diarreia e anemia.',
        type: 'frequente',
      },
      {
        title: 'Intolerância à Lactose vs Alergia à Proteína do Leite',
        description:
          'Intolerância à Lactose: deficiência da enzima lactase (problema digestivo no intestino). Alergia à Proteína do Leite (APLV): reação imunológica contra a caseína/proteínas do leite mediada por anticorpos.',
        type: 'pegadinha',
      },
    ],
    flashcards: [
      {
        front: 'Por que a evolução selecionou a presença de vilosidades e microvilosidades no intestino?',
        back: 'Para aumentar exponencialmente a área de superfície de contato disponível para absorção de nutrientes, sem necessitar de um aumento no volume do corpo.',
      },
      {
        front: 'Qual o destino dos lipídios absorvidos pelos enterócitos?',
        back: 'São empacotados em quilomícrons e absorvidos pelos vasos linfáticos quilíferos centrais das vilosidades, caindo na circulação sanguínea pelo ducto torácico.',
      },
    ],
    enemQuestion: {
      id: 'enem-intestino-delgado-1',
      context:
        'A Doença Celíaca é uma enteropatia crônica autoimune desencadeada pela ingestão de glúten em indivíduos geneticamente suscetíveis. A biópsia do tecido do intestino delgado de um paciente não tratado revela achatamento e perda pronunciada das vilosidades intestinais da mucosa.',
      question:
        'A principal consequência fisiológica direta decorrente dessa alteração morfológica na mucosa intestinal é a:',
      options: [
        {
          letter: 'A',
          text: 'hiperprodução de ácido clorídrico com perfuração gástrica imediata.',
          isCorrect: false,
          explanation: 'O HCl é gástrico e a doença atinge o intestino delgado.',
        },
        {
          letter: 'B',
          text: 'redução acentuada da superfície de contato, comprometendo a capacidade de absorção de nutrientes e eletrólitos.',
          isCorrect: true,
          explanation:
            'Gabarito Correto! As vilosidades e microvilosidades aumentam a área útil de absorção em centenas de vezes. Sua atrofia diminui drasticamente a superfície de contato com o quilo alimentar, levando a quadro de má absorção, esteatorreia, perda de peso e carências nutricionais.',
        },
        {
          letter: 'C',
          text: 'paralisação da síntese de bile pelos pneumócitos alveolares.',
          isCorrect: false,
          explanation: 'Pneumócitos estão nos pulmões e a bile é produzida no fígado.',
        },
        {
          letter: 'D',
          text: 'conversão de bactérias simbióticas em vírus bacteriófagos oncogênicos.',
          isCorrect: false,
          explanation: 'Bactérias não se transformam em vírus.',
        },
        {
          letter: 'E',
          text: 'obstrução dos vasos condutores da linfa com extravasamento de urina.',
          isCorrect: false,
          explanation: 'Urina é formada nos rins e conduzida pelos ureteres à bexiga.',
        },
      ],
      competenceSkill: 'Competência de Área 4 - Habilidade 15 (Relacionar a morfologia microscópica dos órgãos com sua eficiência de transporte e absorção).',
      generalExplanation:
        'O conceito biofísico de "relação superfície/volume" aplicado à biologia humana (vilosidades intestinais, alvéolos pulmonares, cristas mitocondriais) é um dos conceitos interdisciplinares favoritos do ENEM.',
    },
    svgHighlightId: 'highlight-intestino-delgado',
  },
  {
    id: 'intestino_grosso',
    name: 'Intestino Grosso & Microbiota',
    scientificName: 'Intestinum Crassum',
    zone: 'tronco',
    tagline: 'Reabsorção Hídrica, Formação do Bolo Fecal e Microbiota Simbiótica',
    shortDesc: 'Ceco (com apêndice cecal), cólon e reto: reabsorção massiva de água e eletrólitos e produção de vitaminas K e B12 por bactérias.',
    fullPhysiology:
      'O intestino grosso recebe o quilo não digerido proveniente do íleo através da válvula ileocecal. Sua função primordial é a reabsorção de água (cerca de 1,5 a 2 litros diários) e íons (sódio, cloreto), transformando o conteúdo líquido pastoso nas fezes sólidas desidratadas acumuladas no reto até o reflexo da evacuação.',
    cellularBiochemistry:
      'O cólon abriga trilhões de microrganismos que formam a Microbiota Intestinal (flora bacteriana). Essas bactérias realizam fermentação de fibras dietéticas insolúveis (celulose e amido resistente), gerando ácidos graxos de cadeia curta (butirato, propionato e acetato) que nutrem os colonócitos. Além disso, sintetizam micronutrientes indispensáveis, com destaque para a Vitamina K (fator essencial para a cascata de coagulação sanguínea no fígado) e biotina.',
    icon: '🥨',
    soundType: 'digest',
    enemRecurrence: 'Alta',
    realLifeInfo: {
      imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1000&q=80',
      sourceType: 'Colonoscopia & Microscopia da Microbiota',
      magnificationOrScale: 'Visão Endoscópica Intraluminal Real',
      visualDescription:
        'Visão endoscópica real do cólon mostrando as haustrações musculares, criptas de Lieberkühn profundas com células caliciformes secretoras de muco e biofilme microbiano comensal.',
      keyRealFeatures: [
        'Haustrações cólicas que retardam o trânsito para máxima reabsorção de água',
        'Abundância de células caliciformes secretoras de muco protetor',
        'Microbiota simbiótica comensal produtora de vitamina K',
      ],
    },
    enemKeywords: [
      'Reabsorção de Água e Diarreia (Desidratação)',
      'Microbiota Intestinal e Fibras Solúveis',
      'Vitamina K e Coagulação Sanguínea',
      'Uso Indiscriminado de Antibióticos e Disbiose',
      'Apêndice Cecal e Tecido Linfoide',
    ],
    enemTips: [
      {
        title: 'Por que a diarreia desidrata tão rápido?',
        description:
          'Toxinas bacterianas (ex: toxina colérica) hiperativam a secreção de cloreto e inibem a reabsorção de água no intestino, fazendo o corpo perder litros de água e eletrólitos em poucas horas.',
        type: 'frequente',
      },
      {
        title: 'Antibióticos de Amplo Espectro e Hemorragias',
        description:
          'Tratamentos prolongados com antibióticos podem dizimar a microbiota colônica, reduzindo a síntese bacteriana de Vitamina K e predispondo o paciente a distúrbios hemorrágicos.',
        type: 'interdisciplinar',
      },
    ],
    flashcards: [
      {
        front: 'Qual a relação simbiótica entre a microbiota do intestino grosso e a coagulação sanguínea humana?',
        back: 'As bactérias comensais do cólon sintetizam Vitamina K como subproduto metabólico. A vitamina K é absorvida e utilizada pelo fígado como cofator essencial na síntese de protrombina e fatores de coagulação.',
      },
      {
        front: 'Qual o principal papel fisiológico do intestino grosso na conservação de fluidos corporais?',
        back: 'A reabsorção ativa de íons sódio com influxo osmótico passivo de água, evitando a desidratação e moldando a consistência das fezes.',
      },
    ],
    enemQuestion: {
      id: 'enem-intestino-grosso-1',
      context:
        'Um paciente hospitalizado com infecção bacteriana grave recebeu antibioticoterapia venosa de largo espectro durante 21 dias. Ao final do tratamento, exames laboratoriais apontaram prolongamento no tempo de coagulação sanguínea e tendência a pequenos sangramentos gengivais.',
      question:
        'A alteração hemostática apresentada pelo paciente foi causada pela:',
      options: [
        {
          letter: 'A',
          text: 'destruição de eritrócitos mediada por toxinas gástricas ácidas.',
          isCorrect: false,
          explanation: 'Eritrócitos transportam O2, não participam primariamente da cascata de coagulação como a protrombina.',
        },
        {
          letter: 'B',
          text: 'eliminação de bactérias intestinais simbióticas produtoras de vitamina K, cofator da síntese hepática de fatores de coagulação.',
          isCorrect: true,
          explanation:
            'Gabarito Correto! Antibióticos de amplo espectro eliminam bactérias benéficas do cólon. Como a microbiota é responsável por suprir boa parte da vitamina K humana, sua deficiência reduz a síntese hepática de fatores da coagulação dependentes de vitamina K (fatores II/protrombina, VII, IX e X).',
        },
        {
          letter: 'C',
          text: 'paralisação da absorção de oxigênio nos alvéolos pulmonares por acúmulo de fibrina.',
          isCorrect: false,
          explanation: 'A queixa é coagulopatia pós-antibiótico no trato gastrointestinal, sem relação com alvéolos.',
        },
        {
          letter: 'D',
          text: 'conversão de plaquetas sanguíneas em osteoblastos maduros.',
          isCorrect: false,
          explanation: 'Plaquetas são fragmentos celulares de megacariócitos e não se convertem em células ósseas.',
        },
        {
          letter: 'E',
          text: 'inibição da produção de amilase salivar pelas glândulas parótidas.',
          isCorrect: false,
          explanation: 'Amilase salivar digere amido e não participa da cascata de coagulação sanguínea.',
        },
      ],
      competenceSkill: 'Competência de Área 4 - Habilidade 14 (Compreender as relações ecológicas de mutualismo entre o corpo humano e sua microbiota).',
      generalExplanation:
        'O mutualismo entre seres humanos e sua microbiota intestinal produtora de vitamina K associado ao impacto farmacológico do uso de antibióticos é uma questão de biologia aplicada muito apreciada pelo ENEM.',
    },
    svgHighlightId: 'highlight-intestino-grosso',
  },
  {
    id: 'rins',
    name: 'Rins & Néfrons',
    scientificName: 'Renes & Nephron',
    zone: 'tronco',
    tagline: 'Filtração Glomerular, Reabsorção Tubular, Hormônio ADH e Osmorregulação',
    shortDesc: 'Aproximadamente 1 milhão de néfrons por rim: filtração do plasma, controle do equilíbrio hidroeletrolítico e excreção de ureia.',
    fullPhysiology:
      'Os rins recebem cerca de 20% a 25% do débito cardíaco pelas artérias renais. A unidade funcional e morfológica renal é o Néfron, constituído pelo Corpúsculo Renal (Glomérulo de Malpighi envolto pela Cápsula de Bowman) e pelo Sistema Tubular (Túbulo Contorcido Proximal, Alça de Henle/Néfron e Túbulo Contorcido Distal, que desemboca no Ducto Coletor). O processo de formação da urina engloba três etapas obrigatórias: 1) Filtração Glomerular sob alta pressão hidrostática; 2) Reabsorção Tubular de substâncias úteis; 3) Secreção Tubular ativa de resíduos e fármacos.',
    cellularBiochemistry:
      'No glomérulo, proteínas plasmáticas e células sanguíneas NÃO passam para o filtrado em condições saudáveis. No túbulo proximal, 100% da glicose e dos aminoácidos são reabsorvidos por cotransporte ativo com Na⁺ (SGLT). Na Alça de Henle, o mecanismo de contracorrente cria um gradiente hiperosmótico na medula renal. O Hormônio Antidiurético (ADH / Vasopressina), liberado pela neuro-hipófise sob estímulo de osmorreceptores hipotalâmicos, insere canais de Aquaporinas nos ductos coletores, promovendo reabsorção maciça de água livre e concentrando a urina. A Aldosterona (córtex adrenal) estimula a reabsorção de Na⁺ e excreção de K⁺.',
    icon: '💧',
    soundType: 'pop',
    enemRecurrence: 'Altíssima',
    realLifeInfo: {
      imageUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1000&q=80',
      sourceType: 'Microscopia Eletrônica & Corte Anatômico Renal',
      magnificationOrScale: 'Aumento de 1.500x (~12 cm no todo)',
      visualDescription:
        'Micrografia eletrônica real de um glomérulo renal no córtex. Observam-se os podócitos abraçando os capilares fenestrados com seus pedicelos, formando a fenda de filtração glomerular sob pressão.',
      keyRealFeatures: [
        'Glomérulo capilar envolto pela cápsula de Bowman',
        'Podócitos com fendas de filtração nanométricas que barram proteínas',
        'Diferenciação nítida entre córtex (glomérulos) e medula (alças de Henle)',
      ],
    },
    enemKeywords: [
      'Hormônio ADH (Vasopressina) e Álcool',
      'Filtração Glomerular (Sem Proteínas)',
      'Glicosúria no Diabetes Mellitus',
      'Alça de Henle e Gradiente Osmótico',
      'Aldosterona e Pressão Arterial',
      'Excreção de Ureia e Homeostase do pH',
    ],
    enemTips: [
      {
        title: 'Efeito do Álcool sobre o ADH',
        description:
          'O álcool etílico inibe a secreção de ADH pela neuro-hipófise. Sem ADH, os ductos coletores tornam-se impermeáveis à água; o indivíduo urina em grande volume urina diluída (poliúria), resultando na clássica desidratação e ressaca!',
        type: 'frequente',
      },
      {
        title: 'Glicosúria: Por que diabético descompensado tem açúcar na urina?',
        description:
          'A glicose sanguínea supera a capacidade máxima de transporte (Tm) dos transportadores renais no túbulo proximal, extravasando para a urina. Por osmose, essa glicose puxa água, causando poliúria e polidipsia (muita sede).',
        type: 'frequente',
      },
    ],
    flashcards: [
      {
        front: 'O que ocorre quando o corpo detecta aumento na osmolaridade plasmática (pouca água no sangue)?',
        back: 'O hipotálamo estimula a neuro-hipófise a liberar ADH (vasopressina). O ADH aumenta a permeabilidade dos ductos coletores renais à água por meio de aquaporinas, reabsorvendo água para o sangue e produzindo urina concentrada e escassa.',
      },
      {
        front: 'Por que a presença de albumina (proteína) ou hemácias na urina é indicativo de patologia renal?',
        back: 'Porque os poros da membrana basal e os podócitos da cápsula glomerular formam uma barreira de tamanho e carga que impede a passagem de macromoléculas e células para o filtrado capsular.',
      },
    ],
    enemQuestion: {
      id: 'enem-rins-1',
      context:
        'Em um dia de calor extremo durante uma caminhada no deserto sem ingestão de água, um explorador nota que o volume de sua urina diminuiu acentuadamente e adquiriu coloração amarelo-escura e odor característico.',
      question:
        'A resposta fisiológica renal imediata que garantiu a retenção hídrica no organismo do explorador foi mediada pelo(a):',
      options: [
        {
          letter: 'A',
          text: 'aumento na secreção de hormônio antidiurético (ADH), que tornou as paredes dos ductos coletores mais permeáveis à água.',
          isCorrect: true,
          explanation:
            'Gabarito Correto! A desidratação eleva a osmolaridade plasmática. Os osmorreceptores hipotalâmicos ativam a liberação de ADH (vasopressina) pela neuro-hipófise. O ADH promove a translocação de aquaporinas nos ductos coletores renais, provocando reabsorção maciça de água livre de volta aos capilares peritubulares e gerando urina escassa e hiperconcentrada.',
        },
        {
          letter: 'B',
          text: 'inibição da aldosterona, provocando a eliminação acelerada de sódio e água pelo túbulo proximal.',
          isCorrect: false,
          explanation: 'Na desidratação a aldosterona aumenta (via sistema renina-angiotensina-aldosterona) para reter sódio e água.',
        },
        {
          letter: 'C',
          text: 'queda repentina na taxa de filtração por necrose total dos podócitos da medula.',
          isCorrect: false,
          explanation: 'A resposta é uma adaptação fisiológica homeostática saudável, sem necrose tecidual.',
        },
        {
          letter: 'D',
          text: 'bloqueio da gliconeogênese hepática para impedir o gasto de água na síntese de lipídios.',
          isCorrect: false,
          explanation: 'A retenção hídrica aguda nos rins é controlada diretamente pelo eixo neuroendócrino ADH.',
        },
        {
          letter: 'E',
          text: 'transformação da ureia em amônia gasosa eliminada pelos poros da pele.',
          isCorrect: false,
          explanation: 'Ureia não se converte espontaneamente em amônia para evaporação cutânea.',
        },
      ],
      competenceSkill: 'Competência de Área 4 - Habilidade 14 (Identificar os mecanismos hormonais e osmorreguladores de manutenção da homeostase hídrica).',
      generalExplanation:
        'O mecanismo do ADH (Vasopressina), osmorregulação e o funcionamento dos néfrons renais são cobrados com altíssima frequência na prova de Ciências da Natureza do ENEM.',
    },
    svgHighlightId: 'highlight-rins',
  },
  {
    id: 'bexiga',
    name: 'Bexiga Urinária',
    scientificName: 'Vesica Urinaria',
    zone: 'tronco',
    tagline: 'Reservatório Muscular Elástico de Urina com Epitélio de Transição',
    shortDesc: 'Armazenamento temporário de urina conduzida pelos ureteres até a micção voluntária pela uretra.',
    fullPhysiology:
      'A bexiga urinária é uma víscera oca revestida internamente pelo Epitélio de Transição (urotélio), cujas células mudam de formato (de cúbicas para achatadas) conforme a distensão do órgão sem perder a impermeabilidade. A parede possui uma espessa camada de músculo liso denominada Músculo Detrusor. O controle da micção é coordenado pela estimulação parassimpática (que contrai o detrusor e relaxa o esfíncter interno involuntário) e pelo controle somático voluntário do esfíncter uretral externo.',
    cellularBiochemistry:
      'O urotélio possui placas proteicas (uroplaquinas) em sua membrana apical que impedem que a urina hipertônica e rica em ureia e íons H⁺ drene água do sangue ou cause intoxicação dos tecidos adjacentes. A capacidade volumétrica média de armazenamento confortável varia entre 300 e 500 mL.',
    icon: '💧',
    soundType: 'pop',
    enemRecurrence: 'Média',
    realLifeInfo: {
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80',
      sourceType: 'Cistoscopia & Histologia de Urotélio',
      magnificationOrScale: 'Corte Histológico a 400x',
      visualDescription:
        'Corte histológico real da mucosa vesical destacando o epitélio de transição (urotélio) com suas células em guarda-chuva apicais e a espessa túnica muscular do músculo detrusor.',
      keyRealFeatures: [
        'Células superficiais em guarda-chuva impermeabilizantes (uroplaquinas)',
        'Capacidade de achatamento celular na distensão sem extravasamento',
        'Fibras entrelaçadas do músculo liso detrusor',
      ],
    },
    enemKeywords: [
      'Epitélio de Transição (Urotélio)',
      'Músculo Detrusor e Micção Parassimpática',
      'Esfíncteres Interno (Involuntário) e Externo (Voluntário)',
      'Infecções Urinárias (Cistite por E. coli)',
    ],
    enemTips: [
      {
        title: 'Cistite e Diferença Anatômica entre Sexos',
        description:
          'Mulheres apresentam maior susceptibilidade a infecções na bexiga (cistites) devido à menor extensão da uretra feminina (~4 cm) em relação à masculina (~20 cm) e maior proximidade com a região anogenital.',
        type: 'frequente',
      },
    ],
    flashcards: [
      {
        front: 'Qual o tipo de tecido epitelial que reveste a bexiga urinária e qual sua vantagem funcional?',
        back: 'Epitélio de transição (urotélio), cujas células têm capacidade de se achatar e distender acomodando grandes volumes de urina sem romper a barreira impermeabilizante.',
      },
    ],
    enemQuestion: {
      id: 'enem-bexiga-1',
      context:
        'A cistite é uma infecção comum que acomete a mucosa da bexiga urinária, sendo causada predominantemente pela bactéria comensal Escherichia coli proveniente do trato gastrointestinal. As estatísticas epidemiológicas apontam que mulheres adultas sofrem dessa patologia com frequência muito superior aos homens.',
      question:
        'Essa discrepância na incidência clínica entre os sexos fundamenta-se principalmente na característica anatômica feminina de:',
      options: [
        {
          letter: 'A',
          text: 'possuir uretra mais curta e com meato urinário mais próximo à região anal, facilitando a ascensão bacteriana.',
          isCorrect: true,
          explanation:
            'Gabarito Correto! A uretra feminina mede cerca de 4 cm (contra cerca de 20 cm no homem) e seu óstio externo fica em proximidade anatômica com o ânus, encurtando o trajeto de ascensão e colonização bacteriana na bexiga.',
        },
        {
          letter: 'B',
          text: 'ausência completa de epitélio de transição na parede vesical.',
          isCorrect: false,
          explanation: 'Ambos os sexos possuem epitélio de transição na bexiga.',
        },
        {
          letter: 'C',
          text: 'produção contínua de urina alcalina sem presença de ureia.',
          isCorrect: false,
          explanation: 'A urina feminina é igualmente ácida/neutra e rica em ureia excretada.',
        },
        {
          letter: 'D',
          text: 'falta de inervação parassimpática no músculo detrusor.',
          isCorrect: false,
          explanation: 'A inervação parassimpática atua normalmente em ambos os sexos.',
        },
        {
          letter: 'E',
          text: 'eliminação de anticorpos pelas fezes que inibem a ação dos macrófagos renais.',
          isCorrect: false,
          explanation: 'Não há inibição de macrófagos por anticorpos fecais na gênese da cistite.',
        },
      ],
      competenceSkill: 'Competência de Área 4 - Habilidade 16 (Compreender fatores anatômicos e microbiológicos determinantes de patologias do sistema excretor).',
      generalExplanation:
        'A anatomia do trato urinário associada à microbiologia e prevenção de infecções oportunistas é um contexto comum de saúde humana na matriz do ENEM.',
    },
    svgHighlightId: 'highlight-bexiga',
  },
  {
    id: 'pele',
    name: 'Pele & Tegumento',
    scientificName: 'Integumentum Commune / Cutis',
    zone: 'membros_superiores',
    tagline: 'Barreira Imunológica Inata, Termorregulação e Síntese de Vitamina D',
    shortDesc: 'Maior órgão em extensão: epiderme queratinizada avascular, derme vascularizada com anexos e hipoderme com tecido adiposo.',
    fullPhysiology:
      'A pele é dividida em Epiderme (tecido epitelial estratificado pavimentoso queratinizado avascular) e Derme (tecido conjuntivo denso ricamente vascularizado com terminações nervosas, glândulas sudoríparas e folículos pilosos). Abaixo da derme situa-se a Hipoderme (tecido subcutâneo adiposo), que atua como isolante térmico contra perdas de calor e reserva energética de triacilgliceróis.',
    cellularBiochemistry:
      'Na camada basal da epiderme, os Melanócitos sintetizam o pigmento Melanina (a partir do aminoácido tirosina), empacotando-o em melanossomos transferidos aos queratinócitos para formar uma "capa protetora nuclear" que absorve radiação UV e protege o DNA celular contra mutações dímeras de timina (prevenindo câncer de pele / melanoma). A radiação UVB é necessária para converter o 7-desidrocolesterol na epiderme em pré-vitamina D3 (Colecalciferol), ativada posteriormente no fígado e rins para garantir a absorção de cálcio no intestino.',
    icon: '🛡️',
    soundType: 'sparkle',
    enemRecurrence: 'Alta',
    realLifeInfo: {
      imageUrl: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&w=1000&q=80',
      sourceType: 'Histologia da Pele com Coloração Tricrômica',
      magnificationOrScale: 'Corte Histológico a 200x (~1.5 a 4 mm)',
      visualDescription:
        'Corte microscópico real da pele humana exibindo a camada córnea superficial de queratina acelular, as cristas epiteliais interdigitadas com as papilas dérmicas vasculares e folículos pilosos.',
      keyRealFeatures: [
        'Camada córnea espessa de queratina impermeabilizante',
        'Melanócitos na camada basal distribuindo melanina aos queratinócitos',
        'Derme densa com feixes de colágeno e vasos sanguíneos para termorregulação',
      ],
    },
    enemKeywords: [
      'Epiderme (Avascular) vs Derme (Vascularizada)',
      'Queratina e Impermeabilização',
      'Melanina e Proteção contra UV',
      'Termorregulação por Sudorese e Vasodilatação',
      'Síntese de Vitamina D e Raquitismo',
    ],
    enemTips: [
      {
        title: 'Termorregulação em Dias Quentes',
        description:
          'Em calor intenso: 1) Glândulas sudoríparas secretam suor (a evaporação da água rouba calor latente do corpo); 2) Vasodilatação periférica na derme aumenta o fluxo de sangue perto da superfície para irradiar calor.',
        type: 'frequente',
      },
      {
        title: 'Por que passar álcool na pele dá sensação de frio?',
        description:
          'O álcool possui baixo calor latente de vaporização e evapora rapidamente, absorvendo energia térmica da pele e ativando os termorreceptores de frio (corpúsculos de Krause).',
        type: 'interdisciplinar',
      },
    ],
    flashcards: [
      {
        front: 'Como o suor resfria o corpo humano durante a prática esportiva?',
        back: 'A água do suor, ao mudar de estado físico de líquido para vapor na superfície da pele, consome calor latente de vaporização do corpo, dissipando a energia térmica para o ambiente.',
      },
      {
        front: 'Qual a importância biológica da camada de queratina na epiderme?',
        back: 'É uma proteína fibrosa insolúvel que impermeabiliza a pele, impedindo tanto a perda excessiva de água por desidratação quanto a penetração direta de patógenos.',
      },
    ],
    enemQuestion: {
      id: 'enem-pele-1',
      context:
        'O uso diário de protetor solar é amplamente recomendado por dermatologistas para prevenir lesões actínicas e neoplasias cutâneas malignas, como o melanoma, causadas pela radiação ultravioleta emitida pelo Sol.',
      question:
        'A proteção natural que as células da epiderme humana desenvolvem internamente contra as mutações no DNA provocadas pelos raios ultravioleta baseia-se na:',
      options: [
        {
          letter: 'A',
          text: 'síntese acelerada de colágeno pelas células da glândula sebácea.',
          isCorrect: false,
          explanation: 'Colágeno confere sustentação mecânica na derme, não escudo UV nuclear.',
        },
        {
          letter: 'B',
          text: 'produção de melanina pelos melanócitos e sua disposição sobre os núcleos dos queratinócitos, absorvendo a radiação UV.',
          isCorrect: true,
          explanation:
            'Gabarito Correto! Os melanócitos sintetizam melanina a partir da tirosina e transferem os grânulos de pigmento para os queratinócitos. A melanina forma uma calota protetora supranuclear que absorve e dissipa a radiação ultravioleta, protegendo o DNA contra quebras e dímeros de pirimidina.',
        },
        {
          letter: 'C',
          text: 'neutralização dos raios solares por liberação de ácido clorídrico no suor.',
          isCorrect: false,
          explanation: 'O suor contém cloreto de sódio e ureia, não HCl corrosivo.',
        },
        {
          letter: 'D',
          text: 'expansão de adipócitos na epiderme superficial como barreira de reflexão total.',
          isCorrect: false,
          explanation: 'Não há adipócitos na epiderme; eles ficam na hipoderme.',
        },
        {
          letter: 'E',
          text: 'conversão de raios ultravioleta em glicose por fotossíntese celular.',
          isCorrect: false,
          explanation: 'Células animais são heterótrofas e não realizam fotossíntese.',
        },
      ],
      competenceSkill: 'Competência de Área 4 - Habilidade 15 (Interpretar a ação de agentes físicos mutagênicos sobre o tecido epitelial).',
      generalExplanation:
        'A estrutura da pele, síntese de melanina, fotoproteção e termorregulação são temas frequentes no ENEM, conectando Biologia Celular, Histologia e Saúde Humana.',
    },
    svgHighlightId: 'highlight-pele',
  },
  {
    id: 'musculos',
    name: 'Músculos Esqueléticos',
    scientificName: 'Musculi Skeletici',
    zone: 'membros_superiores',
    tagline: 'Contração Muscular por Deslizamento de Actina e Miosina, Cálcio e ATP',
    shortDesc: 'Tecido muscular estriado esquelético sob controle voluntário somático: sarcômeros, retículo sarcoplasmático e fermentação lática.',
    fullPhysiology:
      'Os músculos esqueléticos fixam-se aos ossos através de tendões de colágeno. As fibras musculares são células multinucleadas com estriações transversais formadas pela repetição de Sarcômeros (unidade morfofuncional contrátil delimitada por duas linhas Z). Na placa motora (junção neuromuscular), o neurônio motor libera Acetilcolina, gerando despolarização que se propaga pelos Túbulos T e estimula o Retículo Sarcoplasmático a liberar íons Cálcio (Ca²⁺) no sarcoplasma.',
    cellularBiochemistry:
      'Os íons Ca²⁺ ligam-se à Troponina, deslocando a Tropomiosina e expondo os sítios de ligação na Actina. As cabeças da Miosina (com atividade ATPase) ligam-se à actina e realizam o golpe de força, tracionando os filamentos finos em direção ao centro do sarcômero e encurtando a fibra. A quebra de ATP fornece a energia para o movimento, e a ligação de um NOVO ATP é necessária para que a miosina se solte da actina (sua falta após a morte causa o Rigor Mortis). Em esforço vigoroso com baixa disponibilidade de O2, as fibras realizam Fermentação Lática.',
    icon: '💪',
    soundType: 'pop',
    enemRecurrence: 'Altíssima',
    realLifeInfo: {
      imageUrl: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=1000&q=80',
      sourceType: 'Microscopia Eletrônica de Transmissão (MET)',
      magnificationOrScale: 'Aumento de 25.000x (Sarcômero ~2.5 µm)',
      visualDescription:
        'Micrografia eletrônica real longitudinal de miofibrila esquelética. Observa-se a alternância regular entre bandas I claras e bandas A escuras delimitadas pelas linhas Z densas transversais.',
      keyRealFeatures: [
        'Linhas Z nítidas delimitando os sarcômeros contráteis individuais',
        'Sobreposição de filamentos grossos de miosina e finos de actina',
        'Retículo sarcoplasmático e tríades de túbulos T para liberação de Ca²⁺',
      ],
    },
    enemKeywords: [
      'Sarcômero: Actina e Miosina',
      'Papel do Cálcio (Ca2+) e Troponina/Tropomiosina',
      'ATP na Contração e Relaxamento (Rigor Mortis)',
      'Fermentação Lática e Fadiga Muscular',
      'Fibras Lentas (Tipo I - Vermelhas) vs Rápidas (Tipo II - Brancas)',
    ],
    enemTips: [
      {
        title: 'Fibras Vermelhas (Tipo I) vs Brancas (Tipo II)',
        description:
          'Fibras Vermelhas (Lentas / Resistência / Maratonistas): ricas em mioglobina e mitocôndrias, respiração aeróbica. Fibras Brancas (Rápidas / Força Explosiva / Velocistas de 100m): ricas em glicogênio, anaeróbicas (fermentação lática), fadigam rápido.',
        type: 'frequente',
      },
      {
        title: 'Por que ocorre o Rigor Mortis (rigidez cadavérica)?',
        description:
          'Com a morte celular, cessa a síntese de ATP. Sem ATP novo, a cabeça da miosina não consegue se desligar do filamento de actina, mantendo os músculos rigidamente travados.',
        type: 'frequente',
      },
    ],
    flashcards: [
      {
        front: 'Qual o papel fundamental do íon Cálcio (Ca2+) no ciclo de contração do sarcômero?',
        back: 'O cálcio liberado do retículo sarcoplasmático liga-se à troponina, provocando a mudança conformacional da tropomiosina e liberando os sítios ativos da actina para o acoplamento das cabeças de miosina.',
      },
      {
        front: 'Em que condição a fibra muscular realiza fermentação lática e qual a sua finalidade bioquímica?',
        back: 'Em situações de alta demanda energética com suprimento insuficiente de oxigênio (hipóxia temporária), regenerando o NAD+ a partir do NADH para manter a glicólise funcionando e produzindo ATP.',
      },
    ],
    enemQuestion: {
      id: 'enem-musculos-1',
      context:
        'Em aves migratórias e maratonistas de elite, a musculatura esquelética responsável pela locomoção de longa duração apresenta intensa coloração avermelhada, alta vascularização capilar e abundância de mitocôndrias funcionais.',
      question:
        'Essas características adaptativas das fibras musculares esqueléticas lentas do tipo I garantem maior resistência à fadiga porque otimizam o processo de:',
      options: [
        {
          letter: 'A',
          text: 'fermentação alcoólica para geração rápida de piruvato.',
          isCorrect: false,
          explanation: 'Células musculares animais realizam fermentação lática, nunca alcoólica.',
        },
        {
          letter: 'B',
          text: 'respiração celular aeróbica completa, aproveitando a mioglobina para estocar oxigênio e sustentar a fosforilação oxidativa mitocondrial.',
          isCorrect: true,
          explanation:
            'Gabarito Correto! As fibras musculares lentas (tipo I ou vermelhas) são adaptadas para esforço contínuo e aeróbico. A coloração vermelha decorre da mioglobina (reserva de O2 intracelular) e dos citocromos das numerosas mitocôndrias que realizam o Ciclo de Krebs e a Fosforilação Oxidativa gerando alto rendimento de ATP sem acúmulo precoce de lactato.',
        },
        {
          letter: 'C',
          text: 'quebra anaeróbica imediata de fosfocreatina sem envolvimento de citocromos.',
          isCorrect: false,
          explanation: 'O sistema fosfagênico/creatina-fosfato é predominante em esforços explosivos de curtíssima duração (fibras tipo IIb).',
        },
        {
          letter: 'D',
          text: 'armazenamento de amido vegetal nos sarcômeros para evitar o consumo de glicogênio.',
          isCorrect: false,
          explanation: 'Células animais não produzem amido; a reserva é glicogênio.',
        },
        {
          letter: 'E',
          text: 'síntese de uracil para regenerar as fitas de DNA dos túbulos T.',
          isCorrect: false,
          explanation: 'Túbulos T são invaginações de membrana, não estruturas de DNA.',
        },
      ],
      competenceSkill: 'Competência de Área 4 - Habilidade 14 (Associar as características celulares e bioquímicas do tecido muscular às demandas bioenergéticas do organismo).',
      generalExplanation:
        'Tipos de fibras musculares (Tipo I aeróbicas x Tipo II anaeróbicas), mioglobina e o mecanismo de deslizamento de actina/miosina com ATP e cálcio são temas recorrentes no ENEM.',
    },
    svgHighlightId: 'highlight-musculos',
  },
  {
    id: 'ossos',
    name: 'Esqueleto & Ossos',
    scientificName: 'Systema Skeletale / Ossa',
    zone: 'membros_inferiores',
    tagline: 'Sustentação Mecânica, Reserva Mineral de Cálcio e Hematopoiese Medular',
    shortDesc: '206 ossos: matriz óssea mineralizada de hidroxiapatita e colágeno, hematopoiese na medula óssea vermelha e alavancas biomecânicas.',
    fullPhysiology:
      'O esqueleto humano divide-se em Axial (crânio, coluna vertebral, costelas e esterno - proteção do SNC e órgãos torácicos) e Apendicular (ossos dos membros superiores e inferiores, clavícula, escápula e bacia). Os ossos longos (como o Fêmur) possuem epífises nas extremidades com osso esponjoso e diáfise central oca revestida por periósteo contendo a medula óssea.',
    cellularBiochemistry:
      'A matriz óssea é composta por fração orgânica (~30% de fibras de colágeno tipo I, que conferem flexibilidade e resistência à tração) e inorgânica (~70% de cristais de fosfato de cálcio / hidroxiapatita, conferindo dureza). Três células atuam no dinamismo ósseo: 1) Osteoblastos: sintetizam a matriz orgânica nova (mineralização); 2) Osteócitos: mantêm a matriz viva nos canalículos; 3) Osteoclastos (células gigantes multinucleadas originadas de monócitos): realizam a reabsorção óssea liberando cálcio no sangue sob ação do Paratormônio (PTH). Na Medula Óssea Vermelha ocorre a Hematopoiese (geração de hemácias, leucócitos e plaquetas).',
    icon: '🦴',
    soundType: 'pop',
    enemRecurrence: 'Alta',
    realLifeInfo: {
      imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1000&q=80',
      sourceType: 'Microscopia Óptica de Osso Desgastado',
      magnificationOrScale: 'Aumento de 200x',
      visualDescription:
        'Corte transversal real de osso compacto maduro revelando os Sistemas de Havers (Osteônios): lamelas ósseas concêntricas mineralizadas de hidroxiapatita ao redor do canal vascular central.',
      keyRealFeatures: [
        'Canais de Havers centrais por onde passam vasos e nervos',
        'Lacunas de osteócitos conectadas por canalículos de comunicação',
        'Matriz óssea densa mineralizada com fosfato de cálcio',
      ],
    },
    enemKeywords: [
      'Remodelação Óssea: Osteoblastos vs Osteoclastos',
      'Paratormônio (PTH) vs Calcitonina',
      'Medula Óssea Vermelha e Hematopoiese',
      'Osteoporose e Menopausa (Queda de Estrogênio)',
      'Matriz Inorgânica (Cálcio) e Orgânica (Colágeno)',
    ],
    enemTips: [
      {
        title: 'Osteoporose no ENEM',
        description:
          'A osteoporose ocorre quando a reabsorção óssea (osteoclastos) supera a formação de matriz (osteoblastos). Na menopausa, a queda brusca do estrogênio (hormônio que inibe osteoclastos) acelera a perda de massa óssea em mulheres.',
        type: 'frequente',
      },
      {
        title: 'Por que o osso sem cálcio fica flexível?',
        description:
          'Se colocarmos um osso em ácido, os cristais inorgânicos de cálcio se dissolvem, restando apenas o colágeno flexível (o osso dobra sem quebrar). Se queimarmos o osso, o colágeno queima e sobram apenas os minerais quebradiços!',
        type: 'interdisciplinar',
      },
    ],
    flashcards: [
      {
        front: 'Qual a diferença funcional entre osteoblastos e osteoclastos na remodelação óssea?',
        back: 'Osteoblastos "Constroem" matriz óssea fixando cálcio e colágeno. Osteoclastos "Corroem/Reabsorvem" o tecido ósseo por secreção de ácido e enzimas, liberando cálcio para a corrente sanguínea.',
      },
      {
        front: 'Onde ocorre a produção das células do sangue humano (hematopoiese)?',
        back: 'Na medula óssea vermelha (tecido hematopoiético mieloide), situada nas cavidades do osso esponjoso de vértebras, costelas, esterno, bacia e epífises de ossos longos.',
      },
    ],
    enemQuestion: {
      id: 'enem-ossos-1',
      context:
        'Mulheres após a menopausa apresentam risco aumentado de fraturas espontâneas decorrentes da osteoporose, uma desordem esquelética sistêmica caracterizada pela diminuição da densidade mineral óssea e deterioração da microarquitetura trabecular.',
      question:
        'A nível celular, o desenvolvimento da osteoporose nessa fase da vida está diretamente associado ao(à):',
      options: [
        {
          letter: 'A',
          text: 'aumento desproporcional da atividade de reabsorção dos osteoclastos em relação à taxa de deposição dos osteoblastos.',
          isCorrect: true,
          explanation:
            'Gabarito Correto! O estrogênio normalmente exerce efeito inibitório sobre a diferenciação e sobrevivência dos osteoclastos. Com o declínio do estrogênio na menopausa, os osteoclastos tornam-se hiperativos, reabsorvendo mais matriz óssea mineralizada do que os osteoblastos conseguem repor, desestruturando as trabéculas ósseas.',
        },
        {
          letter: 'B',
          text: 'paralisação irreversível da hematopoiese na medula óssea amarela diafisária.',
          isCorrect: false,
          explanation: 'A medula amarela é rica em tecido adiposo e não participa ativamente da hematopoiese.',
        },
        {
          letter: 'C',
          text: 'transformação de todo o colágeno da matriz óssea em cristais insolúveis de hidroxiapatita pura.',
          isCorrect: false,
          explanation: 'Na osteoporose há perda de massa total (orgânica e inorgânica), tornando o osso poroso.',
        },
        {
          letter: 'D',
          text: 'excesso de calcitonina que drena cálcio do osso para os músculos.',
          isCorrect: false,
          explanation: 'A calcitonina favorece a entrada de cálcio no osso, protegendo a massa óssea.',
        },
        {
          letter: 'E',
          text: 'acúmulo de ácido úrico no interior dos canais de Havers provocando rigidez anquilosante.',
          isCorrect: false,
          explanation: 'Acúmulo de ácido úrico nas articulações caracteriza a gota, não a osteoporose.',
        },
      ],
      competenceSkill: 'Competência de Área 4 - Habilidade 15 (Avaliar as causas endócrinas e celulares de desordens degenerativas esqueléticas).',
      generalExplanation:
        'A regulação hormonal da matriz óssea (paratormônio, calcitonina, vitamina D e estrogênio) e o papel de osteoblastos versus osteoclastos são alvos constantes em provas de vestibulares de ponta e no ENEM.',
    },
    svgHighlightId: 'highlight-ossos',
  },
  {
    id: 'imune',
    name: 'Sistema Imunológico & Linfático',
    scientificName: 'Systema Immunitatis & Lymphoideum',
    zone: 'tronco',
    tagline: 'Imunidade Inata e Adaptativa, Linfócitos T e B, Vacinas vs Soros e Memória Imune',
    shortDesc: 'Linfonodos, baço, timo e células brancas (leucócitos): defesa celular, produção de anticorpos e imunização ativa/passiva.',
    fullPhysiology:
      'A defesa imunológica divide-se em Imunidade Inata (não específica, de ação imediata: barreiras físicas como pele e muco, neutrófilos, macrófagos fagocitários e células Natural Killer) e Imunidade Adaptativa (altamente específica, com memória imunológica: Linfócitos T e Linfócitos B). Os órgãos linfoides primários (medula óssea e timo) realizam a produção e maturação dos linfócitos; os secundários (baço, linfonodos e amígdalas) são os locais onde ocorre o reconhecimento de antígenos.',
    cellularBiochemistry:
      'Os Linfócitos T CD4+ (Auxiliares/Helper) reconhecem antígenos apresentados por macrófagos/células dendríticas via MHC-II e liberam citocinas (interleucinas) que coordenam toda a resposta imune. Os Linfócitos T CD8+ (Citotóxicos) destroem células infectadas por vírus ou tumorais por apoptose induzida por granzimas e perfurinas. Os Linfócitos B ativados diferenciam-se em Plasmócitos (fábricas secretoras de Anticorpos / Imunoglobulinas IgA, IgG, IgM, IgE) e Células de Memória. No HIV, o vírus ataca especificamente os Linfócitos T CD4+, destruindo o comando central da imunidade.',
    icon: '🛡️',
    soundType: 'bell',
    enemRecurrence: 'Altíssima',
    realLifeInfo: {
      imageUrl: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=1000&q=80',
      sourceType: 'Microscopia Eletrônica & Citologia Hematológica',
      magnificationOrScale: 'Aumento de 5.000x (~10 a 20 µm)',
      visualDescription:
        'Micrografia real colorizada de um macrófago ativo emitindo pseudópodes para capturar e fagocitar bactérias patogênicas, ao lado de linfócitos T e B em trânsito linfonodal.',
      keyRealFeatures: [
        'Pseudópodes de macrófagos englobando antígenos para apresentação via MHC',
        'Linfócitos com núcleo volumoso e escasso citoplasma basofílico',
        'Células de memória e plasmócitos hipersecretando anticorpos',
      ],
    },
    enemKeywords: [
      'Vacina (Antígeno / Ativa / Preventiva)',
      'Soro (Anticorpos Prontos / Passiva / Curativa)',
      'Linfócitos T CD4 (Auxiliar) e CD8 (Citotóxico)',
      'Linfócitos B, Plasmócitos e Anticorpos (Imunoglobulinas)',
      'Memória Imunológica e Resposta Secundária Rápida',
      'HIV / AIDS e Destruição de CD4',
    ],
    enemTips: [
      {
        title: 'Tabela de Ouro do ENEM: Vacina vs Soro',
        description:
          'VACINA: Contém ANTÍGENO atenuado/inativado -> Imunização ATIVA -> O próprio corpo produz anticorpos e células de memória -> Caráter PREVENTIVO.\nSORO: Contém ANTICORPOS prontos (extraídos de cavalos hiperimunizados) -> Imunização PASSIVA -> Não gera memória -> Caráter CURATIVO de emergência (venenos de cobra, escorpião, tétano).',
        type: 'frequente',
      },
      {
        title: 'Resposta Imune Primária vs Secundária',
        description:
          'Primária: primeiro contato com antígeno -> produção lenta de anticorpos (pico de IgM). Secundária (pós-vacina ou reinfecção): ação das células de memória -> produção imediata, massiva e duradoura de anticorpos de alta afinidade (IgG).',
        type: 'frequente',
      },
    ],
    flashcards: [
      {
        front: 'Qual a diferença crucial entre a vacina e o soro terapêutico?',
        back: 'Vacina contém antígenos e estimula a produção ativa de anticorpos e memória imunológica preventiva; Soro contém anticorpos pré-formados para ação passiva, imediata e curativa, sem gerar memória.',
      },
      {
        front: 'Por que a infecção pelo vírus HIV deixa o organismo vulnerável a infecções oportunistas?',
        back: 'Porque o HIV infecta e destrói seletivamente os linfócitos T auxiliares (CD4+), que são os coordenadores centrais da ativação dos linfócitos B e linfócitos T citotóxicos.',
      },
    ],
    enemQuestion: {
      id: 'enem-imune-1',
      context:
        'Um agricultor foi picado por uma serpente cascavel (Crotalus durissus) em uma área rural e socorrido imediatamente em um posto de saúde. Ao mesmo tempo, no mesmo posto, uma criança recebeu a vacina tríplice bacteriana (DTP) de acordo com o calendário nacional de imunização.',
      question:
        'Em relação aos mecanismos imunológicos envolvidos nas duas intervenções médicas, constata-se que o agricultor e a criança receberam, respectivamente:',
      options: [
        {
          letter: 'A',
          text: 'antígenos para produzir memória imunológica rápida; anticorpos prontos para eliminar as toxinas imediatamente.',
          isCorrect: false,
          explanation: 'Inverteu os conceitos: o agricultor picado precisa de soro (anticorpos prontos) e a criança recebe vacina (antígenos).',
        },
        {
          letter: 'B',
          text: 'anticorpos pré-formados (imunização passiva curativa); antígenos inativados (imunização ativa preventiva geradora de células de memória).',
          isCorrect: true,
          explanation:
            'Gabarito Correto! O soro antiofídico fornece anticorpos prontos (imunização passiva) para neutralizar as peçonhas circulantes com urgência. A vacina DTP introduz antígenos atenuados/inativados (imunização ativa) para que o sistema imunológico da criança produza seus próprios anticorpos e células de memória duradouras.',
        },
        {
          letter: 'C',
          text: 'antibióticos de largo espectro contra toxinas lipídicas; citocinas virais recombinantes.',
          isCorrect: false,
          explanation: 'Antibióticos matam bactérias e não neutralizam veneno de serpente nem são vacinas.',
        },
        {
          letter: 'D',
          text: 'linfócitos T citotóxicos exógenos cultivados em laboratório; plaquetas humanas purificadas.',
          isCorrect: false,
          explanation: 'Não se injetam linfócitos T exógenos para envenenamento ofídico comum.',
        },
        {
          letter: 'E',
          text: 'soro para gerar imunidade ativa duradoura; vacina para neutralização enzimática transitória.',
          isCorrect: false,
          explanation: 'O soro não gera imunidade ativa nem duradoura.',
        },
      ],
      competenceSkill: 'Competência de Área 4 - Habilidade 14 (Distinguir os mecanismos de imunização ativa e passiva em situações de saúde pública).',
      generalExplanation:
        'O confronto conceitual entre Vacinas (Antígenos, Imunização Ativa, Memória, Preventiva) e Soros (Anticorpos Prontos, Imunização Passiva, Sem Memória, Emergência Curativa) é simplesmente o tópico de imunologia mais cobrado em toda a história do ENEM.',
    },
    svgHighlightId: 'highlight-imune',
  },
  {
    id: 'reprodutor_feminino',
    name: 'Sistema Reprodutor Feminino',
    scientificName: 'Systema Genitale Femininum (Útero, Ovários, Tubas Uterinas)',
    zone: 'tronco',
    sex: 'feminino',
    tagline: 'Ciclo Menstrual Hormonal, Ovogênese, Fecundação Tuba-Uterina e Nidação',
    shortDesc:
      'Composto por ovários, tubas uterinas, útero, vagina e vulva. Coordena a gametogênese feminina, o ciclo reprodutivo hormonal (FSH, LH, estrogênio e progesterona), a fecundação e a gestação.',
    fullPhysiology:
      'O sistema reprodutor feminino integra funções gametogênicas e endócrinas complexas. Os ovários abrigam folículos primordiais em que os ovócitos primários permanecem paralisados em Prófase I da Meiose desde o período embrionário. A cada ciclo ovariano (cerca de 28 dias), sob estímulo do hormônio FSH (Hormônio Folículo Estimulante) liberado pela adenoipófise, um folículo ovariano amadurece e secreta crescentes quantidades de Estrogênio. O estrogênio estimula a proliferação celular do endométrio uterino (fase proliferativa) e, ao atingir um limiar crítico, exerce feedback positivo transitório desencadeando um pico expressivo de LH (Hormônio Luteinizante) no 14º dia do ciclo, deflagrando a ovulação (liberação do ovócito secundário bloqueado em Metáfase II). O restante do folículo rompidos se transforma no Corpo Lúteo (amarelo), secretando Progesterona e estrogênio para preparar o endométrio para a nidação (fase secretora/lútea). Se não houver fecundação, o corpo lúteo regride em corpo albicans, os níveis de progesterona e estrogênio despencam, causando a isquemia e descamação endometrial (Menstruação).',
    cellularBiochemistry:
      'A fecundação ocorre normalmente no terço distal (ampola) da tuba uterina. O encontro com o espermatozoide desencadeia a reação acrossômica (liberação de enzimas como a hialuronidase), seguida do bloqueio à poliespermia (despolarização da membrana e reação cortical com exocitose de grânulos corticais endurecendo a zona pelúcida). O embrião em clivagem atinge o estágio de blastocisto no 6º ao 7º dia e se implanta no endométrio (nidação). O trofoblasto embrionário secreta precocemente o hormônio hCG (gonadotrofina coriônica humana), que mimetiza o LH e mantém o corpo lúteo vivo e secretor de progesterona durante o primeiro trimestre, impedindo novas menstruações.',
    icon: '🌸',
    soundType: 'sparkle',
    enemRecurrence: 'Altíssima',
    enemKeywords: [
      'Ciclo Menstrual',
      'FSH e LH',
      'Estrogênio e Progesterona',
      'Pílula Anticoncepcional Combinada',
      'Fecundação na Tuba Uterina',
      'Corpo Lúteo e hCG',
      'Nidação do Blastocisto',
      'Métodos Contraceptivos (DIU, Laqueadura)',
    ],
    enemTips: [
      {
        title: 'Mecanismo da Pílula Anticoncepcional',
        description:
          'A pílula anticoncepcional combinada contém doses diárias de estrogênio e progesterona sintéticos que mantêm feedback negativo constante sobre o hipotálamo e hipófise. Isso inibe a liberação de FSH (impedindo o crescimento do folículo) e o pico de LH (impedindo a ovulação).',
        type: 'frequente',
      },
      {
        title: 'Local Real da Fecundação vs. Nidação',
        description:
          'Pegadinha clássica do ENEM: a fecundação NÃO ocorre no útero! Ela ocorre nas Tubas Uterinas. O embrião viaja durante cerca de 5 a 7 dias até o útero, onde se fixa no endométrio (processo chamado de nidação).',
        type: 'pegadinha',
      },
      {
        title: 'Laqueadura Tubária não Cessa Menstruação',
        description:
          'A laqueadura (ligadura tubária) é um método mecânico definitivo que corta/amarra as tubas uterinas, impedindo o encontro dos gametas. Ela NÃO afeta a produção ovariana de hormônios nem cessa a menstruação, pois os hormônios continuam viajando normalmente pelo sangue.',
        type: 'interdisciplinar',
      },
    ],
    flashcards: [
      {
        front: 'Qual o papel do pico de hormônio LH no ciclo menstrual feminino?',
        back: 'O pico expressivo de LH por volta do 14º dia do ciclo rompe o folículo maduro (de Graaf) desencadeando a ovulação e transformando o folículo restante no corpo lúteo secretor de progesterona.',
      },
      {
        front: 'Como a pílula anticoncepcional oral combinada impede a gravidez?',
        back: 'Fornece níveis contínuos de estrogênio e progesterona que inibem FSH e LH por feedback negativo na hipófise, impedindo o amadurecimento folicular e a ovulação.',
      },
      {
        front: 'Por que o hormônio hCG é o marcador medido nos testes de gravidez de farmácia e sangue?',
        back: 'Porque o hCG é produzido exclusivamente pelas células trofoblásticas do embrião recém-implantado para manter o corpo lúteo ativo secretando progesterona, confirmando a presença do embrião.',
      },
      {
        front: 'Em qual fase da divisão meiótica o ovócito secundário se encontra no momento da ovulação?',
        back: 'Paralisado em Metáfase II da Meiose. A divisão meiótica II só é concluída se houver penetração de um espermatozoide (fecundação).',
      },
    ],
    enemQuestion: {
      id: 'enem-reprodutor-fem-1',
      context:
        'As pílulas anticoncepcionais orais combinadas representam um dos métodos contraceptivos reversíveis mais utilizados no mundo. Elas contêm derivados sintéticos dos hormônios ovarianos estrogênio e progestagênio, administrados diariamente durante a maior parte do ciclo reprodutivo feminino.',
      question:
        'Do ponto de vista endócrino e fisiológico, a ação contraceptiva dessas pílulas ocorre porque os hormônios sintéticos administrados:',
      options: [
        {
          letter: 'A',
          text: 'destroem a camada funcional do endométrio, impedindo a vascularização do miométrio uterino.',
          isCorrect: false,
          explanation: 'As pílulas não destroem o endométrio, apenas regulam sua proliferação.',
        },
        {
          letter: 'B',
          text: 'atuam diretamente nas tubas uterinas desnaturando a enzima hialuronidase do acrossomo espermático.',
          isCorrect: false,
          explanation: 'A ação principal é sistêmica e hipofisária, não de desnaturação enzimática nas tubas.',
        },
        {
          letter: 'C',
          text: 'exercem retroalimentação negativa (feedback negativo) sobre a hipófise, inibindo a secreção de FSH e o pico de LH, impedindo o desenvolvimento folicular e a ovulação.',
          isCorrect: true,
          explanation:
            'Gabarito Correto! Os níveis constantes de estrogênio e progesterona exógenos inibem a secreção hipofisária de FSH (não há amadurecimento folicular) e o pico de LH (não ocorre ovulação), garantindo alta eficácia contraceptiva.',
        },
        {
          letter: 'D',
          text: 'estimulam a produção contínua de hCG pela parede da bexiga urinária, bloqueando os ovários.',
          isCorrect: false,
          explanation: 'O hCG é produzido pelo trofoblasto embrionário, não pela bexiga urinária.',
        },
        {
          letter: 'E',
          text: 'aumentam vertiginosamente o hormônio folículo estimulante (FSH), provocando atresia prematura de todos os folículos ovarianos.',
          isCorrect: false,
          explanation: 'As pílulas inibem (diminuem) o FSH, não o aumentam.',
        },
      ],
      competenceSkill: 'Competência de Área 4 - Habilidade 15 (Interpretar gráficos hormonais e avaliar a intervenção de métodos contraceptivos no organismo).',
      generalExplanation:
        'A regulação do ciclo menstrual pelo eixo hipotálamo-hipófise-ovários e a compreensão do feedback negativo dos anticoncepcionais é um dos temas de fisiologia endócrina mais frequentes e decisivos no ENEM.',
    },
    svgHighlightId: 'highlight-reprodutor-fem',
  },
  {
    id: 'reprodutor_masculino',
    name: 'Sistema Reprodutor Masculino',
    scientificName: 'Systema Genitale Masculinum (Testículos, Próstata, Epidídimo)',
    zone: 'tronco',
    sex: 'masculino',
    tagline: 'Espermatogênese Contínua, Testosterona, Células de Leydig/Sertoli e Vasectomia',
    shortDesc:
      'Composto por testículos (bolsa escrotal), epidídimos, ductos deferentes, uretra, vesículas seminais, próstata, glândulas bulbouretrais e pênis. Produz gametas masculinos e hormônios androgênicos.',
    fullPhysiology:
      'O sistema reprodutor masculino tem como órgãos centrais os testículos, alojados na bolsa escrotal (escroto), cuja posição externa mantém os testículos a uma temperatura cerca de 2°C a 3°C inferior à temperatura central do corpo humano (37°C), condição estritamente indispensável para a viabilidade da espermatogênese. No interior dos testículos, os túbulos seminíferos abrigam as Células de Sertoli, que sustentam, nutrem e formam a barreira hematotesticular para as células germinativas sob estímulo do FSH hipofisário. No tecido conjuntivo intersticial entre os túbulos situam-se as Células de Leydig (intersticiais), que, sob estímulo do hormônio LH (também denominado ICSH no homem), sintetizam e secretam a Testosterona (responsável pelas características sexuais secundárias, anabolismo proteico e manutenção da libido e espermatogênese).',
    cellularBiochemistry:
      'A espermatogênese produz continuamente espermatozoides a partir das espermatogônias (2n). Na espermiogênese (etapa final de diferenciação), o Complexo Golgiense funde suas vesículas para formar o acrossomo (repleto de enzimas proteolíticas e hialuronidase), os centríolos originam o axonema do flagelo locomotor, e as mitocôndrias se organizam em espiral na peça intermediária para fornecer ATP via fosforilação oxidativa. Os espermatozoides imaturos ganham mobilidade e são armazenados no Epidídimo. Na ejaculação, são impulsionados pelos Ductos Deferentes e recebem secreções alcalinas ricas em frutose das Vesículas Seminais (energia para o flagelo) e secreções da Próstata (que neutralizam o pH ácido da vagina), compondo o sêmen.',
    icon: '⚡',
    soundType: 'pop',
    enemRecurrence: 'Alta',
    enemKeywords: [
      'Espermatogênese',
      'Células de Leydig e Sertoli',
      'Testosterona e LH/ICSH',
      'FSH no Homem',
      'Acrossomo e Complexo de Golgi',
      'Termorregulação Escrotal',
      'Vasectomia e Líquido Seminal',
      'Mitocôndrias da Peça Intermediária',
    ],
    enemTips: [
      {
        title: 'Vasectomia não Afeta a Testosterona nem Cessa a Ejaculação',
        description:
          'Questão certeira no ENEM: a vasectomia consiste no corte dos ductos deferentes. Ela impede apenas a saída de espermatozoides. O homem continua ejaculando normalmente (pois 95% do volume do sêmen vem da próstata e vesículas seminais) e a testosterona continua sendo produzida e lançada no sangue pelas células de Leydig.',
        type: 'frequente',
      },
      {
        title: 'Herança Mitocondrial Materna',
        description:
          'Durante a fecundação, apenas o núcleo e o centríolo do espermatozoide penetram no ovócito; a peça intermediária e as mitocôndrias flagelares são degradadas. Por isso, todo o DNA mitocondrial humano tem herança exclusivamente materna.',
        type: 'conceito_chave',
      },
      {
        title: 'Criptorquidia e Fertilidade',
        description:
          'A não descida dos testículos para a bolsa escrotal (criptorquidia) mantém os testículos a 37°C, inibindo a meiose das espermatogônias e causando infertilidade, embora a produção de testosterona possa continuar.',
        type: 'pegadinha',
      },
    ],
    flashcards: [
      {
        front: 'Qual a diferença funcional entre as células de Sertoli e as células de Leydig nos testículos?',
        back: 'As células de Sertoli (estimuladas pelo FSH) nutrem, sustentam e guiam as células germinativas na espermatogênese; as células de Leydig (estimuladas pelo LH) produzem testosterona.',
      },
      {
        front: 'Por que um homem vasectomizado continua ejaculando com aspecto e volume normais?',
        back: 'Porque os espermatozoides representam menos de 5% do volume do sêmen. A maior parte do fluido seminal continua sendo produzida pelas vesículas seminais e próstata, cujos canais desembocam após a área seccionada na vasectomia.',
      },
      {
        front: 'Qual organela celular origina o acrossomo do espermatozoide e qual seu papel?',
        back: 'O Complexo Golgiense (Complexo de Golgi). O acrossomo funciona como uma bolsa de enzimas hidrolíticas (hialuronidase) que digere a corona radiata e zona pelúcida do ovócito na fecundação.',
      },
      {
        front: 'Por que os testículos estão anatomicamente localizados no escroto fora da cavidade abdominal?',
        back: 'Para manter uma temperatura cerca de 2°C a 3°C inferior à do abdômen (por volta de 34,5°C), condição essencial para que a espermatogênese ocorra sem falhas ou danos celulares aos gametas.',
      },
    ],
    enemQuestion: {
      id: 'enem-reprodutor-masc-1',
      context:
        'A vasectomia é um procedimento cirúrgico simples e seguro de esterilização voluntária masculina, realizado em ambulatório com anestesia local. Consiste na secção bilateral e ligadura dos ductos deferentes através de uma pequena incisão no saco escrotal.',
      question:
        'Considerando a anatomia e a fisiologia do sistema reprodutor masculino, após a realização da vasectomia, o indivíduo:',
      options: [
        {
          letter: 'A',
          text: 'deixa de produzir testosterona pelas células de Sertoli, tendo sua libido e caracteres secundários drasticamente reduzidos.',
          isCorrect: false,
          explanation: 'A testosterona é produzida pelas células de Leydig e cai diretamente na corrente sanguínea.',
        },
        {
          letter: 'B',
          text: 'cessa completamente a produção de sêmen e o ato de ejaculação, uma vez que a próstata é extirpada.',
          isCorrect: false,
          explanation: 'A próstata não é tocada na vasectomia; o volume do sêmen continua praticamente inalterado.',
        },
        {
          letter: 'C',
          text: 'continua produzindo espermatozoides e testosterona nos testículos, mas os espermatozoides não alcançam a uretra para compor o ejaculado.',
          isCorrect: true,
          explanation:
            'Gabarito Correto! A espermatogênese e a secreção endócrina de testosterona continuam ocorrendo normalmente nos testículos. Os espermatozoides não ejaculados são fagocitados e reabsorvidos pelo epidídimo, e a testosterona continua sendo distribuída pelo sangue normalmente.',
        },
        {
          letter: 'D',
          text: 'passa a acumular espermatozoides na bexiga urinária, sendo eliminados junto com a micção matinal.',
          isCorrect: false,
          explanation: 'Os espermatozoides não vão para a bexiga; eles são reabsorvidos fisiologicamente.',
        },
        {
          letter: 'E',
          text: 'tem a temperatura testicular elevada para 37°C, provocando a transformação das células de Leydig em espermatócitos.',
          isCorrect: false,
          explanation: 'A vasectomia não altera a temperatura escrotal nem induz mutações celulares.',
        },
      ],
      competenceSkill: 'Competência de Área 4 - Habilidade 14 (Comprender o funcionamento dos sistemas biológicos humanos e avaliar o impacto de intervenções cirúrgicas e contraceptivas).',
      generalExplanation:
        'O ENEM frequentemente testa se o aluno entende a diferença entre vias endócrinas (hormônios como a testosterona caindo no sangue) e vias exócrinas/condutoras (ductos deferentes conduzindo gametas ao sêmen).',
    },
    svgHighlightId: 'highlight-reprodutor-masc',
  },
];
