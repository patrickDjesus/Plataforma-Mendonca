import { QuizQuestion } from '../types/design';

export type GameCategory = 'math_arcade' | 'enem_formulas' | 'periodic_table' | 'enem_mixed' | 'endurance';
export type GameDifficulty = 'Fácil' | 'Médio' | 'Difícil' | 'Hardcore';

export interface ChemicalElement {
  symbol: string;
  name: string;
  atomicNumber: number;
  atomicMass: number;
  family: string;
  period: number;
  group: number;
  stateAt25C: 'Sólido' | 'Líquido' | 'Gasoso';
  description: string;
  curiosity: string;
  color: string;
}

// Formatador inteligente de fórmulas e símbolos matemáticos
export function cleanMathText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\$(.*?)\$/g, '$1') // remove demarcadores $
    .replace(/\\cdot/g, '·')
    .replace(/\\times/g, '×')
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\Omega/g, 'Ω')
    .replace(/\\pi/g, 'π')
    .replace(/\\log_\{?(\w+)\}?/g, 'log_$1')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)')
    .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\le/g, '≤')
    .replace(/\\ge/g, '≥')
    .replace(/\\neq/g, '≠')
    .replace(/\^2/g, '²')
    .replace(/\^3/g, '³')
    .replace(/\^4/g, '⁴')
    .replace(/\^5/g, '⁵')
    .replace(/\^6/g, '⁶')
    .replace(/\^7/g, '⁷')
    .replace(/\^8/g, '⁸')
    .replace(/\^9/g, '⁹')
    .replace(/\^0/g, '⁰')
    .replace(/\^x/g, 'ˣ')
    .replace(/_0/g, '₀')
    .replace(/_1/g, '₁')
    .replace(/_2/g, '₂')
    .replace(/_3/g, '₃')
    .replace(/_eq/g, '₍ₑq₎')
    .replace(/_c/g, '₍c₎')
    .replace(/_total/g, ' (total)')
    .replace(/\\ /g, ' ')
    .replace(/\\,/g, ' ');
}

export const PERIODIC_ELEMENTS: ChemicalElement[] = [
  { symbol: 'H', name: 'Hidrogênio', atomicNumber: 1, atomicMass: 1.008, family: 'Não-metal', period: 1, group: 1, stateAt25C: 'Gasoso', description: 'Elemento mais abundante do universo, combustível das estrelas.', curiosity: 'Forma a água (H₂O) e ácidos comuns.', color: '#38bdf8' },
  { symbol: 'He', name: 'Hélio', atomicNumber: 2, atomicMass: 4.0026, family: 'Gás Nobre', period: 1, group: 18, stateAt25C: 'Gasoso', description: 'Segundo elemento mais leve, inerte e não inflamável.', curiosity: 'Usado em balões meteorológicos e criogenia de ressonância magnética.', color: '#c084fc' },
  { symbol: 'Li', name: 'Lítio', atomicNumber: 3, atomicMass: 6.94, family: 'Metal Alcalino', period: 2, group: 1, stateAt25C: 'Sólido', description: 'Metal mais leve, altamente reativo com água.', curiosity: 'Fundamental nas baterias de smartphones e carros elétricos.', color: '#f87171' },
  { symbol: 'Be', name: 'Berílio', atomicNumber: 4, atomicMass: 9.0122, family: 'Metal Alcalinoterroso', period: 2, group: 2, stateAt25C: 'Sólido', description: 'Metal cinza-claro muito resistente e leve.', curiosity: 'Usado em componentes aeroespaciais e ligas de alta dureza.', color: '#fb923c' },
  { symbol: 'B', name: 'Boro', atomicNumber: 5, atomicMass: 10.81, family: 'Semimetal', period: 2, group: 13, stateAt25C: 'Sólido', description: 'Metaloide semicondutor de grande dureza.', curiosity: 'Presente no vidro borossilicato (Pyrex) resistente a choque térmico.', color: '#2dd4bf' },
  { symbol: 'C', name: 'Carbono', atomicNumber: 6, atomicMass: 12.011, family: 'Não-metal', period: 2, group: 14, stateAt25C: 'Sólido', description: 'A base de toda a química orgânica e da vida na Terra.', curiosity: 'Pode formar desde o macio grafite até o duríssimo diamante.', color: '#34d399' },
  { symbol: 'N', name: 'Nitrogênio', atomicNumber: 7, atomicMass: 14.007, family: 'Não-metal', period: 2, group: 15, stateAt25C: 'Gasoso', description: 'Compõe cerca de 78% da atmosfera terrestre.', curiosity: 'Essencial para a síntese de proteínas e DNA.', color: '#60a5fa' },
  { symbol: 'O', name: 'Oxigênio', atomicNumber: 8, atomicMass: 15.999, family: 'Calcogênio', period: 2, group: 16, stateAt25C: 'Gasoso', description: 'Gás comburente vital para a respiração aeróbica.', curiosity: 'Forma o gás ozônio (O₃) na estratosfera protetora.', color: '#22d3ee' },
  { symbol: 'F', name: 'Flúor', atomicNumber: 9, atomicMass: 18.998, family: 'Halogênio', period: 2, group: 17, stateAt25C: 'Gasoso', description: 'O elemento mais eletronegativo e reativo de toda a tabela.', curiosity: 'Adicionado em pastas de dente para fortalecimento do esmalte.', color: '#fbbf24' },
  { symbol: 'Ne', name: 'Neônio', atomicNumber: 10, atomicMass: 20.180, family: 'Gás Nobre', period: 2, group: 18, stateAt25C: 'Gasoso', description: 'Gás nobre inerte com brilho avermelhado-alaranjado sob descarga elétrica.', curiosity: 'Famoso nos clássicos letreiros luminosos de neon.', color: '#c084fc' },
  { symbol: 'Na', name: 'Sódio', atomicNumber: 11, atomicMass: 22.990, family: 'Metal Alcalino', period: 3, group: 1, stateAt25C: 'Sólido', description: 'Metal macio prateado, reage com água liberando H₂.', curiosity: 'Com o cloro forma o sal de cozinha (NaCl). Símbolo vem do latim Natrium.', color: '#f87171' },
  { symbol: 'Mg', name: 'Magnésio', atomicNumber: 12, atomicMass: 24.305, family: 'Metal Alcalinoterroso', period: 3, group: 2, stateAt25C: 'Sólido', description: 'Metal leve que queima com chama branca brilhante intensa.', curiosity: 'Átomo central da molécula de clorofila nas plantas.', color: '#fb923c' },
  { symbol: 'Al', name: 'Alumínio', atomicNumber: 13, atomicMass: 26.982, family: 'Metal Pós-transição', period: 3, group: 13, stateAt25C: 'Sólido', description: 'Metal mais abundante da crosta terrestre, leve e resistente à corrosão.', curiosity: 'Altamente reciclável, usado em latas e estruturas de aeronaves.', color: '#94a3b8' },
  { symbol: 'Si', name: 'Silício', atomicNumber: 14, atomicMass: 28.085, family: 'Semimetal', period: 3, group: 14, stateAt25C: 'Sólido', description: 'Semicondutor base de toda a microeletrônica moderna.', curiosity: 'Deu nome ao Vale do Silício devido à fabricação de microchips.', color: '#2dd4bf' },
  { symbol: 'P', name: 'Fósforo', atomicNumber: 15, atomicMass: 30.974, family: 'Não-metal', period: 3, group: 15, stateAt25C: 'Sólido', description: 'Presente nos ossos, dentes e na molécula de energia celular (ATP).', curiosity: 'O fósforo branco queima espontaneamente em contato com o ar.', color: '#f59e0b' },
  { symbol: 'S', name: 'Enxofre', atomicNumber: 16, atomicMass: 32.06, family: 'Calcogênio', period: 3, group: 16, stateAt25C: 'Sólido', description: 'Sólido amarelo cristalino associado a vulcanismo.', curiosity: 'Componente da chuva ácida (H₂SO₄) e de pontes dissulfeto em proteínas.', color: '#eab308' },
  { symbol: 'Cl', name: 'Cloro', atomicNumber: 17, atomicMass: 35.45, family: 'Halogênio', period: 3, group: 17, stateAt25C: 'Gasoso', description: 'Gás verde-amarelado sufocante com alto poder oxidante e bactericida.', curiosity: 'Usado na purificação de água potável e piscinas.', color: '#84cc16' },
  { symbol: 'Ar', name: 'Argônio', atomicNumber: 18, atomicMass: 39.948, family: 'Gás Nobre', period: 3, group: 18, stateAt25C: 'Gasoso', description: 'Gás inerte que compõe cerca de 0,93% do ar que respiramos.', curiosity: 'Usado como atmosfera protetora em soldas e lâmpadas incandescentes.', color: '#c084fc' },
  { symbol: 'K', name: 'Potássio', atomicNumber: 19, atomicMass: 39.098, family: 'Metal Alcalino', period: 4, group: 1, stateAt25C: 'Sólido', description: 'Eletrólito vital na bomba de sódio-potássio dos neurônios.', curiosity: 'Símbolo K vem de Kalium. Abundante em bananas e fertilizantes.', color: '#f87171' },
  { symbol: 'Ca', name: 'Cálcio', atomicNumber: 20, atomicMass: 40.078, family: 'Metal Alcalinoterroso', period: 4, group: 2, stateAt25C: 'Sólido', description: 'Principal mineral constituinte do esqueleto e conchas marinhas.', curiosity: 'Essencial na contração muscular e coagulação sanguínea.', color: '#fb923c' },
  { symbol: 'Ti', name: 'Titânio', atomicNumber: 22, atomicMass: 47.867, family: 'Metal de Transição', period: 4, group: 4, stateAt25C: 'Sólido', description: 'Metal biocompatível ultra-resistente e leve.', curiosity: 'Usado em próteses ósseas e turbinas de aviões a jato.', color: '#93c5fd' },
  { symbol: 'Cr', name: 'Cromo', atomicNumber: 24, atomicMass: 51.996, family: 'Metal de Transição', period: 4, group: 6, stateAt25C: 'Sólido', description: 'Metal que confere brilho espelhado e resistência à ferrugem no inox.', curiosity: 'Seu nome vem do grego chroma (cor), pois forma compostos multicor.', color: '#93c5fd' },
  { symbol: 'Mn', name: 'Manganês', atomicNumber: 25, atomicMass: 54.938, family: 'Metal de Transição', period: 4, group: 7, stateAt25C: 'Sólido', description: 'Essencial na fotólise da água na fotossíntese vegetal.', curiosity: 'Usado na produção de aços de altíssima tenacidade.', color: '#93c5fd' },
  { symbol: 'Fe', name: 'Ferro', atomicNumber: 26, atomicMass: 55.845, family: 'Metal de Transição', period: 4, group: 8, stateAt25C: 'Sólido', description: 'Coração da indústria siderúrgica e átomo central da hemoglobina.', curiosity: 'Símbolo Fe vem do latim Ferrum. Dá a cor vermelha ao sangue.', color: '#93c5fd' },
  { symbol: 'Ni', name: 'Níquel', atomicNumber: 28, atomicMass: 58.693, family: 'Metal de Transição', period: 4, group: 10, stateAt25C: 'Sólido', description: 'Metal ferromagnético resistente à oxidação.', curiosity: 'Fundamental nas baterias de íon-lítio de alto desempenho.', color: '#93c5fd' },
  { symbol: 'Cu', name: 'Cobre', atomicNumber: 29, atomicMass: 63.546, family: 'Metal de Transição', period: 4, group: 11, stateAt25C: 'Sólido', description: 'Excelente condutor elétrico e térmico de cor avermelhada.', curiosity: 'Um dos primeiros metais fundidos pela humanidade na Idade do Bronze.', color: '#f97316' },
  { symbol: 'Zn', name: 'Zinco', atomicNumber: 30, atomicMass: 65.38, family: 'Metal de Transição', period: 4, group: 12, stateAt25C: 'Sólido', description: 'Metal usado na galvanização do ferro contra ferrugem.', curiosity: 'Cofator essencial de mais de 300 enzimas biológicas.', color: '#94a3b8' },
  { symbol: 'Br', name: 'Bromo', atomicNumber: 35, atomicMass: 79.904, family: 'Halogênio', period: 4, group: 17, stateAt25C: 'Líquido', description: 'Único não-metal que é líquido à temperatura ambiente.', curiosity: 'Líquido vermelho-escuro fumegante e volátil com odor pungente.', color: '#dc2626' },
  { symbol: 'Kr', name: 'Criptônio', atomicNumber: 36, atomicMass: 83.798, family: 'Gás Nobre', period: 4, group: 18, stateAt25C: 'Gasoso', description: 'Gás nobre raro usado em lasers e lâmpadas de alta intensidade.', curiosity: 'Utilizado como padrão internacional do metro entre 1960 e 1983.', color: '#c084fc' },
  { symbol: 'Ag', name: 'Prata', atomicNumber: 47, atomicMass: 107.87, family: 'Metal de Transição', period: 5, group: 11, stateAt25C: 'Sólido', description: 'Elemento com a maior condutividade elétrica e térmica de todos os metais.', curiosity: 'Símbolo Ag vem de Argentum (origem do nome Argentina).', color: '#e2e8f0' },
  { symbol: 'Sn', name: 'Estanho', atomicNumber: 50, atomicMass: 118.71, family: 'Metal Pós-transição', period: 5, group: 14, stateAt25C: 'Sólido', description: 'Metal maleável prateado com baixo ponto de fusão.', curiosity: 'Símbolo Sn vem de Stannum. Usado para soldas eletrônicas e folhas de flandres.', color: '#94a3b8' },
  { symbol: 'I', name: 'Iodo', atomicNumber: 53, atomicMass: 126.90, family: 'Halogênio', period: 5, group: 17, stateAt25C: 'Sólido', description: 'Sólido arroxeado brilhante que sublima facilmente gerando vapor violeta.', curiosity: 'Obrigatório no sal de cozinha brasileiro para prevenir o bócio da tireoide.', color: '#a855f7' },
  { symbol: 'Xe', name: 'Xenônio', atomicNumber: 54, atomicMass: 131.29, family: 'Gás Nobre', period: 5, group: 18, stateAt25C: 'Gasoso', description: 'Gás nobre denso usado em propulsores iônicos de satélites espaciais.', curiosity: 'Primeiro gás nobre a sintetizar um composto químico estável (XePtF₆).', color: '#c084fc' },
  { symbol: 'Cs', name: 'Césio', atomicNumber: 55, atomicMass: 132.91, family: 'Metal Alcalino', period: 6, group: 1, stateAt25C: 'Sólido', description: 'Metal com a maior reatividade química de todos os metais estáveis.', curiosity: 'A oscilação do átomo de Césio-133 define o padrão internacional do Segundo (SI).', color: '#f87171' },
  { symbol: 'Ba', name: 'Bário', atomicNumber: 56, atomicMass: 137.33, family: 'Metal Alcalinoterroso', period: 6, group: 2, stateAt25C: 'Sólido', description: 'Metal alcalinoterroso denso e reativo.', curiosity: 'O sulfato de bário (BaSO₄) é radiopaco, usado em contrastes de raios-X.', color: '#fb923c' },
  { symbol: 'W', name: 'Tungstênio', atomicNumber: 74, atomicMass: 183.84, family: 'Metal de Transição', period: 6, group: 6, stateAt25C: 'Sólido', description: 'Metal com o ponto de fusão mais alto de todos os elementos (3.422 °C).', curiosity: 'Símbolo W vem do mineral Wolframita. Usado em filamentos e brocas de corte.', color: '#a1a1aa' },
  { symbol: 'Pt', name: 'Platina', atomicNumber: 78, atomicMass: 195.08, family: 'Metal de Transição', period: 6, group: 10, stateAt25C: 'Sólido', description: 'Metal nobre denso e catalisador químico extraordinário.', curiosity: 'Usada nos conversores catalíticos de escapamentos para filtrar gases tóxicos.', color: '#cbd5e1' },
  { symbol: 'Au', name: 'Ouro', atomicNumber: 79, atomicMass: 196.97, family: 'Metal de Transição', period: 6, group: 11, stateAt25C: 'Sólido', description: 'Metal nobre altamente maleável, imune à oxidação ao ar.', curiosity: 'Símbolo Au vem do latim Aurum (brilho da alvorada).', color: '#eab308' },
  { symbol: 'Hg', name: 'Mercúrio', atomicNumber: 80, atomicMass: 200.59, family: 'Metal de Transição', period: 6, group: 12, stateAt25C: 'Líquido', description: 'Único metal líquido em condições ambientes normais.', curiosity: 'Símbolo Hg vem de Hydrargyrum (prata líquida). Usado em termômetros e barômetros.', color: '#cbd5e1' },
  { symbol: 'Pb', name: 'Chumbo', atomicNumber: 82, atomicMass: 207.2, family: 'Metal Pós-transição', period: 6, group: 14, stateAt25C: 'Sólido', description: 'Metal pesado denso usado como blindagem contra radiação ionizante.', curiosity: 'Símbolo Pb vem do latim Plumbum (origem de plumbagem/encanamento).', color: '#64748b' },
  { symbol: 'Ra', name: 'Rádio', atomicNumber: 88, atomicMass: 226, family: 'Metal Alcalinoterroso', period: 7, group: 2, stateAt25C: 'Sólido', description: 'Elemento altamente radioativo descoberto por Marie e Pierre Curie.', curiosity: 'Brilha no escuro com luminescência verde devido à radiação emitida.', color: '#4ade80' },
  { symbol: 'U', name: 'Urânio', atomicNumber: 92, atomicMass: 238.03, family: 'Actinídeo', period: 7, group: 3, stateAt25C: 'Sólido', description: 'Elemento radioativo natural pesado, base da fissão nuclear.', curiosity: '1 kg de urânio produz tanta energia quanto toneladas de carvão fóssil.', color: '#4ade80' }
];

export interface FormulaQuestionTemplate {
  discipline: 'Física' | 'Química' | 'Matemática';
  topic: string;
  formula: string;
  mnemonic?: string;
  createQuestion: (difficulty: GameDifficulty) => {
    statement: string;
    correctAnswer: string;
    wrongAnswers: string[];
    explanation: string;
    aiHint: string;
    codeSnippet?: string;
  };
}

export const ENEM_FORMULAS_BANK: FormulaQuestionTemplate[] = [
  {
    discipline: 'Física',
    topic: '1ª Lei de Ohm (Eletrodinâmica)',
    formula: 'V = R · I',
    mnemonic: '"Quem Vê R-I" (V = R × I)',
    createQuestion: (difficulty) => {
      const R = difficulty === 'Fácil' ? 10 : difficulty === 'Médio' ? 25 : 45;
      const I = difficulty === 'Fácil' ? 2 : difficulty === 'Médio' ? 4 : 3.5;
      const V = R * I;
      return {
        statement: `Um resistor ôhmico de resistência R = ${R} Ω está conectado a uma fonte e percorrido por uma corrente elétrica de intensidade I = ${I} A. Pela 1ª Lei de Ohm (V = R · I), qual é a diferença de potencial (tensão V) aplicada nos terminais?`,
        codeSnippet: `R = ${R} Ω\nI = ${I} A\nV = R · I = ?`,
        correctAnswer: `${V} V`,
        wrongAnswers: [`${V * 2} V`, `${Math.max(1, Math.round(R / I))} V`, `${V + 15} V`],
        explanation: `Pela 1ª Lei de Ohm: V = R · I => V = ${R} · ${I} = ${V} Volts.`,
        aiHint: 'Lembre-se do macete "Quem Vê Ri" (V = R × I). Multiplique a resistência em Ohms pela corrente em Amperes!'
      };
    }
  },
  {
    discipline: 'Física',
    topic: 'Energia Cinética (Mecânica)',
    formula: 'Ec = (m · v²) / 2',
    mnemonic: '"Me Veja ao Quadrado sobre 2"',
    createQuestion: (difficulty) => {
      const m = difficulty === 'Fácil' ? 4 : difficulty === 'Médio' ? 10 : 80;
      const v = difficulty === 'Fácil' ? 5 : difficulty === 'Médio' ? 6 : 10;
      const Ec = (m * Math.pow(v, 2)) / 2;
      return {
        statement: `Um corpo de massa m = ${m} kg move-se em linha reta com velocidade escalar constante de v = ${v} m/s. Qual é a Energia Cinética (Ec) associada a esse movimento?`,
        codeSnippet: `m = ${m} kg\nv = ${v} m/s\nEc = (m · v²) / 2 = ?`,
        correctAnswer: `${Ec} J`,
        wrongAnswers: [`${m * v} J`, `${Ec * 2} J`, `${Math.round(Ec / 2)} J`],
        explanation: `A energia cinética é dada por Ec = (m · v²) / 2. Calculando: (${m} · ${v}²) / 2 = (${m} · ${v * v}) / 2 = ${Ec} Joules.`,
        aiHint: 'Eleve primeiro a velocidade ao quadrado antes de multiplicar pela massa e dividir por 2!'
      };
    }
  },
  {
    discipline: 'Física',
    topic: 'Calorimetria (Calor Sensível)',
    formula: 'Q = m · c · ΔT',
    mnemonic: '"Que Macete!" (Q = m · c · ΔT)',
    createQuestion: (difficulty) => {
      const m = difficulty === 'Fácil' ? 100 : difficulty === 'Médio' ? 250 : 500;
      const c = 1.0; // água
      const deltaT = difficulty === 'Fácil' ? 20 : difficulty === 'Médio' ? 35 : 42;
      const Q = m * c * deltaT;
      return {
        statement: `Uma porção de m = ${m} g de água pura (c = 1,0 cal/g°C) é aquecida, sofrendo uma variação de temperatura de ΔT = ${deltaT}°C. Pela equação fundamental da calorimetria (Q = m · c · ΔT), qual a quantidade de calor Q absorvida?`,
        codeSnippet: `m = ${m} g\nc = 1.0 cal/(g°C)\nΔT = ${deltaT} °C\nQ = m · c · ΔT = ?`,
        correctAnswer: `${Q.toLocaleString('pt-BR')} cal`,
        wrongAnswers: [
          `${(Q / 2).toLocaleString('pt-BR')} cal`,
          `${(Q + 500).toLocaleString('pt-BR')} cal`,
          `${Math.round(m + deltaT)} cal`
        ],
        explanation: `Utilizando "Que Macete": Q = m · c · ΔT = ${m} · 1 · ${deltaT} = ${Q} calorias.`,
        aiHint: 'Lembre-se da clássica frase "Que Macete!" onde Q = massa × calor específico × variação de temperatura.'
      };
    }
  },
  {
    discipline: 'Física',
    topic: 'Equação de Torricelli (MUV)',
    formula: 'v² = v₀² + 2 · a · Δs',
    mnemonic: '"Vovô e Vovó mais dois amigos no delta S"',
    createQuestion: () => {
      return {
        statement: 'No Movimento Uniformemente Variado (MUV), quando um problema do ENEM NÃO fornece e nem pede o intervalo de tempo (t), qual equação é a mais indicada para encontrar a velocidade final ou o deslocamento?',
        correctAnswer: 'Equação de Torricelli (v² = v₀² + 2·a·Δs)',
        wrongAnswers: [
          'Função horária da posição (S = S₀ + v₀·t + a·t²/2)',
          'Equação de Gauss para lentes (1/f = 1/p + 1/p\')',
          'Lei Fundamental da Gravitação (F = G·M·m/d²)'
        ],
        explanation: 'A Equação de Torricelli (v² = v₀² + 2·a·Δs) relaciona velocidades, aceleração e deslocamento de forma independente do tempo t.',
        aiHint: 'Torricelli é a equação "sem tempo" do MUV!'
      };
    }
  },
  {
    discipline: 'Química',
    topic: 'Equação dos Gases Ideais (Clapeyron)',
    formula: 'P · V = n · R · T',
    mnemonic: '"Por Você Nunca Rezei Tanto" (P·V = n·R·T)',
    createQuestion: (difficulty) => {
      const n = difficulty === 'Fácil' ? 2 : difficulty === 'Médio' ? 3 : 5;
      const R = 0.082; // atm.L / (mol.K)
      const T = 300; // K
      const P = difficulty === 'Fácil' ? 2 : difficulty === 'Médio' ? 3 : 4;
      const V = Math.round((n * R * T) / P);
      return {
        statement: `Uma amostra de ${n} mols de um gás ideal é mantida à temperatura de ${T} K sob pressão de ${P} atm. Considerando a constante universal dos gases R ≈ 0,082 atm·L/(mol·K), qual é o volume aproximado ocupado pelo gás?`,
        codeSnippet: `P = ${P} atm\nn = ${n} mol\nT = ${T} K\nR = 0.082\nP · V = n · R · T`,
        correctAnswer: `≈ ${V} Litros`,
        wrongAnswers: [
          `≈ ${V * 2} Litros`,
          `≈ ${Math.max(1, Math.round(V / 2))} Litros`,
          `≈ ${V + 15} Litros`
        ],
        explanation: `Pela equação de Clapeyron: P · V = n · R · T => V = (n · R · T) / P = (${n} · 0,082 · ${T}) / ${P} ≈ ${V} L.`,
        aiHint: 'Lembre-se do mnemônico "Por Você Nunca Rezei Tanto" (P · V = n · R · T).'
      };
    }
  },
  {
    discipline: 'Química',
    topic: 'Potencial Hidrogeniônico (pH)',
    formula: 'pH = -log[H⁺]',
    mnemonic: 'Potencial Hidrogeniônico',
    createQuestion: (difficulty) => {
      const exp: number = difficulty === 'Fácil' ? 3 : difficulty === 'Médio' ? 5 : 9;
      const ph: number = exp;
      const acidityLabel = ph < 7 ? 'Ácida' : ph === 7 ? 'Neutra' : 'Básica/Alcalina';
      return {
        statement: `Uma solução aquosa apresenta concentração de íons hidrogênio de [H⁺] = 10⁻${exp} mol/L. Sabendo que pH = -log[H⁺], qual é o pH dessa solução e seu caráter ácido-básico?`,
        codeSnippet: `[H+] = 10^(-${exp}) M\npH = -log(10^(-${exp})) = ?`,
        correctAnswer: `pH = ${ph} (${acidityLabel})`,
        wrongAnswers: [
          `pH = ${14 - ph} (${14 - ph < 7 ? 'Ácida' : 'Básica'})`,
          `pH = ${exp * 2} (Neutra)`,
          `pH = 7 (Neutra)`
        ],
        explanation: `Como pH = -log[H⁺] = -log(10⁻${exp}) = ${exp}. Como ${ph < 7 ? 'pH < 7, a solução é ÁCIDA' : 'pH > 7, a solução é BÁSICA'}.`,
        aiHint: 'Lembre-se: se [H⁺] = 10⁻ˣ, o pH é exatamente igual a x! E se pH < 7 é ácido, se pH > 7 é básico.'
      };
    }
  },
  {
    discipline: 'Matemática',
    topic: 'Vértice da Parábola (Máximos e Mínimos)',
    formula: 'X_v = -b / (2a) | Y_v = -Δ / (4a)',
    mnemonic: 'Ponto Crítico / Extremo da Função Quadrática',
    createQuestion: () => {
      return {
        statement: 'Uma empresa modelou seu lucro mensal L(x) através da função quadrática L(x) = -x² + 20x - 15 (em milhares de reais), onde x é o número de unidades produzidas em milhares. Para qual valor de x a empresa atinge o LUCRO MÁXIMO?',
        codeSnippet: 'L(x) = -x² + 20x - 15\na = -1, b = 20, c = -15\nXv = -b / (2a) = ?',
        correctAnswer: '10 mil unidades',
        wrongAnswers: ['20 mil unidades', '15 mil unidades', '5 mil unidades'],
        explanation: 'O valor que maximiza a função é a coordenada X do vértice: Xv = -b / (2a) = -20 / (2 · (-1)) = -20 / -2 = 10.',
        aiHint: 'Para encontrar o ponto onde ocorre o lucro máximo utilize a coordenada X do vértice: Xv = -b / (2a).'
      };
    }
  }
];

// Gerador de Matemática Procedural
export function generateRandomMathQuestion(difficulty: GameDifficulty): QuizQuestion {
  const id = Date.now() + Math.floor(Math.random() * 10000);
  let statement: string;
  let mathExpression: string;
  let correctAnswer: string;
  let wrongAnswers: string[];
  let explanation: string;
  let aiHint: string;
  let codeSnippet: string | undefined;

  const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  if (difficulty === 'Fácil') {
    const type = randInt(1, 3);
    if (type === 1) {
      // Soma / Subtração
      const a = randInt(14, 88);
      const b = randInt(12, 65);
      const isSum = Math.random() > 0.4;
      const res = isSum ? a + b : a - b;
      mathExpression = `${a} ${isSum ? '+' : '−'} ${b} = ?`;
      statement = `Calcule mentalmente o valor da expressão aritmética:`;
      correctAnswer = `${res}`;
      wrongAnswers = [`${res + 2}`, `${res - 3}`, `${res + 10}`];
      explanation = `${a} ${isSum ? '+' : '−'} ${b} = ${res}.`;
      aiHint = isSum ? `Some primeiro as dezenas (${Math.floor(a/10)*10} + ${Math.floor(b/10)*10}) e depois adicione as unidades.` : `Subtraia primeiro a dezena ${Math.floor(b/10)*10} e depois ajuste com as unidades.`;
    } else if (type === 2) {
      // Multiplicação de Tabuada
      const a = randInt(6, 12);
      const b = randInt(6, 12);
      const res = a * b;
      mathExpression = `${a} × ${b} = ?`;
      statement = `Qual é o resultado da multiplicação rápida:`;
      correctAnswer = `${res}`;
      wrongAnswers = [`${res + a}`, `${res - b}`, `${res + 4}`];
      explanation = `${a} × ${b} = ${res}.`;
      aiHint = `Decomponha: ${a} × ${b} = ${a} × 10 ${b < 10 ? '−' : '+'} ${a} × ${Math.abs(b - 10)}.`;
    } else {
      // Porcentagem básica (10%, 20%, 25%, 50%)
      const percents = [10, 20, 25, 50];
      const p = percents[randInt(0, percents.length - 1)];
      const base = randInt(4, 30) * 20; // múltiplo de 20
      const res = (p / 100) * base;
      mathExpression = `${p}% de ${base} = ?`;
      statement = `Determine a porcentagem indicada mentalmente:`;
      correctAnswer = `${res}`;
      wrongAnswers = [`${res * 2}`, `${res + 10}`, `${Math.max(1, res - 5)}`];
      explanation = `${p}% de ${base} = (${p}/100) · ${base} = ${res}.`;
      aiHint = p === 50 ? '50% equivale à metade (dividir por 2).' : p === 10 ? '10% é deslocar a vírgula uma casa para a esquerda (dividir por 10).' : p === 20 ? 'Calcule 10% primeiro e dobre o valor!' : '25% equivale a dividir por 4.';
    }
  } else if (difficulty === 'Médio') {
    const type = randInt(1, 3);
    if (type === 1) {
      // Equação do 1º Grau (ax + b = c)
      const x = randInt(2, 9);
      const a = randInt(2, 6);
      const b = randInt(3, 20);
      const c = a * x + b;
      mathExpression = `${a}x + ${b} = ${c}`;
      statement = `Resolva a equação de primeiro grau e encontre o valor de x:`;
      codeSnippet = `${a}x + ${b} = ${c}\n${a}x = ${c} - ${b}\nx = ?`;
      correctAnswer = `x = ${x}`;
      wrongAnswers = [`x = ${x + 1}`, `x = ${Math.max(1, x - 2)}`, `x = ${x * 2}`];
      explanation = `${a}x + ${b} = ${c} => ${a}x = ${c - b} => x = ${c - b} / ${a} = ${x}.`;
      aiHint = `Isole x passando o +${b} para o outro lado como -${b}, e divida por ${a}.`;
    } else if (type === 2) {
      // Potências
      const base = randInt(2, 5);
      const exp = base === 2 ? randInt(5, 8) : base === 3 ? randInt(3, 5) : randInt(2, 4);
      const res = Math.pow(base, exp);
      mathExpression = `${base}^${exp} = ?`;
      statement = `Calcule o valor da exponenciação:`;
      correctAnswer = `${res}`;
      wrongAnswers = [`${res + base}`, `${res - Math.pow(base, exp - 1)}`, `${base * exp}`];
      explanation = `${base}^${exp} = ${res}.`;
      aiHint = `${base}^${exp} significa multiplicar o número ${base} por ele mesmo ${exp} vezes.`;
    } else {
      // Pitágoras Simples
      const triplets = [
        { a: 3, b: 4, c: 5 },
        { a: 6, b: 8, c: 10 },
        { a: 5, b: 12, c: 13 },
        { a: 9, b: 12, c: 15 }
      ];
      const t = triplets[randInt(0, triplets.length - 1)];
      mathExpression = `c² = ${t.a}² + ${t.b}²`;
      statement = `Em um triângulo retângulo de catetos a = ${t.a} cm e b = ${t.b} cm, quanto mede a hipotenusa (c)?`;
      codeSnippet = `c² = a² + b²\nc² = ${t.a}² + ${t.b}²\nc = ?`;
      correctAnswer = `${t.c} cm`;
      wrongAnswers = [`${t.a + t.b} cm`, `${t.c + 2} cm`, `${t.c - 1} cm`];
      explanation = `Por Pitágoras: c² = ${t.a}² + ${t.b}² = ${t.a * t.a} + ${t.b * t.b} = ${t.c * t.c} => c = ${t.c} cm.`;
      aiHint = `Pitágoras: eleve os catetos ao quadrado, some-os e extraia a raiz!`;
    }
  } else {
    // Difícil & Hardcore
    const type = randInt(1, 3);
    if (type === 1) {
      // Equação do 2º Grau por Soma e Produto (x² - Sx + P = 0)
      const r1 = randInt(2, 6);
      const r2 = randInt(r1 + 1, 9);
      const S = r1 + r2;
      const P = r1 * r2;
      mathExpression = `x² − ${S}x + ${P} = 0`;
      statement = `Encontre as raízes da equação quadrática por Soma e Produto:`;
      codeSnippet = `x² - ${S}x + ${P} = 0\nSoma = ${S}, Produto = ${P}`;
      correctAnswer = `S = {${r1}, ${r2}}`;
      wrongAnswers = [
        `S = {${r1 - 1}, ${r2 + 1}}`,
        `S = {-${r1}, -${r2}}`,
        `S = {${r1}, ${r2 + 2}}`
      ];
      explanation = `Procuramos dois números cuja soma seja ${S} e produto seja ${P}: ${r1} e ${r2}.`;
      aiHint = `Soma das raízes = ${S}, Produto das raízes = ${P}.`;
    } else if (type === 2) {
      // Logaritmos
      const bases = [2, 3, 5, 10];
      const b = bases[randInt(0, bases.length - 1)];
      const exp = randInt(2, b === 2 ? 6 : b === 3 ? 4 : 3);
      const arg = Math.pow(b, exp);
      mathExpression = `log_${b}(${arg}) = ?`;
      statement = `Determine o valor exato do logaritmo:`;
      codeSnippet = `log_${b}(${arg}) = x  <=>  ${b}^x = ${arg}`;
      correctAnswer = `${exp}`;
      wrongAnswers = [`${exp + 1}`, `${Math.max(1, exp - 1)}`, `${Math.round(arg / b)}`];
      explanation = `log_${b}(${arg}) = x => ${b}^x = ${arg} = ${b}^${exp} => x = ${exp}.`;
      aiHint = `Pergunte-se: "${b} elevado a qual expoente resulta em ${arg}?"`;
    } else {
      // Geometria Plana - Área de Círculo
      const r = randInt(3, 8);
      const area = r * r;
      mathExpression = `A = π · (${r})²`;
      statement = `Qual é a área de uma praça circular com raio r = ${r} m (em função de π)?`;
      correctAnswer = `${area}π m²`;
      wrongAnswers = [`${2 * r}π m²`, `${area * 2}π m²`, `${(r * r) - 5}π m²`];
      explanation = `Área do círculo: A = π · r² = π · (${r})² = ${area}π m².`;
      aiHint = 'A = π · r² (pi vezes o raio ao quadrado). Perímetro seria 2πr.';
    }
  }

  const rawOptions = [
    { text: cleanMathText(correctAnswer), isCorrect: true, explanation: cleanMathText(explanation) },
    ...wrongAnswers.slice(0, 3).map(w => ({ text: cleanMathText(w), isCorrect: false, explanation: 'Alternativa incorreta. Revise os passos de cálculo.' }))
  ];

  const shuffled = rawOptions.sort(() => Math.random() - 0.5);
  const letters = ['A', 'B', 'C', 'D'] as const;

  return {
    id,
    subject: 'Matemática & Cálculo Mental',
    topic: difficulty === 'Fácil' ? 'Aritmética Relâmpago' : difficulty === 'Médio' ? 'Álgebra & Geometria' : 'Cálculo Avançado',
    difficulty: difficulty === 'Hardcore' ? 'Difícil' : difficulty,
    statement: cleanMathText(statement),
    codeSnippet,
    gameType: 'math',
    mathExpression,
    options: shuffled.map((opt, i) => ({
      id: letters[i],
      text: opt.text,
      isCorrect: opt.isCorrect,
      explanation: opt.explanation
    })),
    aiHint: cleanMathText(aiHint)
  };
}

// Gerador de Química & Tabela Periódica
export function generateRandomPeriodicTableQuestion(difficulty: GameDifficulty): QuizQuestion {
  const id = Date.now() + Math.floor(Math.random() * 10000);
  const el = PERIODIC_ELEMENTS[Math.floor(Math.random() * PERIODIC_ELEMENTS.length)];
  const questionType = Math.floor(Math.random() * 5); // 0: Símbolo -> Nome, 1: Nome -> Símbolo, 2: Família, 3: Número Atômico / Massa, 4: Estado Físico

  let statement: string;
  let correctAnswer: string;
  let wrongAnswers: string[];
  let explanation: string;
  let aiHint: string;
  let hiddenProp: 'symbol' | 'name' | 'family' | 'atomicInfo' | 'state';

  const getOtherElements = (count: number) => {
    return PERIODIC_ELEMENTS.filter(e => e.symbol !== el.symbol)
      .sort(() => Math.random() - 0.5)
      .slice(0, count);
  };

  if (questionType === 0) {
    hiddenProp = 'name';
    statement = `O card abaixo exibe o símbolo e dados atômicos de um elemento. Qual é o NOME deste elemento químico?`;
    correctAnswer = el.name;
    wrongAnswers = getOtherElements(3).map(e => e.name);
    explanation = `O símbolo "${el.symbol}" (Z = ${el.atomicNumber}) corresponde ao elemento ${el.name}. ${el.curiosity}`;
    aiHint = `${el.description} ${el.curiosity}`;
  } else if (questionType === 1) {
    hiddenProp = 'symbol';
    statement = `Qual é o SÍMBOLO QUÍMICO oficial do elemento ${el.name} (Z = ${el.atomicNumber})?`;
    correctAnswer = el.symbol;
    wrongAnswers = getOtherElements(3).map(e => e.symbol);
    explanation = `O elemento ${el.name} possui o símbolo químico oficial "${el.symbol}". ${el.curiosity}`;
    aiHint = `Pertence à família dos ${el.family} e possui massa atômica de ≈ ${Math.round(el.atomicMass)} u.`;
  } else if (questionType === 2) {
    hiddenProp = 'family';
    statement = `O elemento químico ${el.name} (${el.symbol}, Z = ${el.atomicNumber}) pertence a qual família da Tabela Periódica?`;
    correctAnswer = el.family;
    const allFamilies = ['Metal Alcalino', 'Metal Alcalinoterroso', 'Metal de Transição', 'Halogênio', 'Gás Nobre', 'Calcogênio', 'Não-metal', 'Semimetal', 'Metal Pós-transição'];
    wrongAnswers = allFamilies.filter(f => f !== el.family).sort(() => Math.random() - 0.5).slice(0, 3);
    explanation = `${el.name} (${el.symbol}) pertence à família dos ${el.family} (Grupo ${el.group}, Período ${el.period}).`;
    aiHint = `Observe a sua posição no grupo ${el.group} e características: ${el.description}`;
  } else if (questionType === 3) {
    hiddenProp = 'atomicInfo';
    statement = `Qual é o NÚMERO ATÔMICO (Z) e a massa aproximada do elemento ${el.name} (${el.symbol})?`;
    correctAnswer = `Z = ${el.atomicNumber} | A ≈ ${Math.round(el.atomicMass)} u`;
    const others = getOtherElements(3);
    wrongAnswers = others.map(o => `Z = ${o.atomicNumber} | A ≈ ${Math.round(o.atomicMass)} u`);
    explanation = `O ${el.name} (${el.symbol}) possui número atômico Z = ${el.atomicNumber} e massa atômica de ${el.atomicMass} u.`;
    aiHint = `${el.name} está no período ${el.period} e grupo ${el.group} da Tabela Periódica.`;
  } else {
    hiddenProp = 'state';
    statement = `Qual é o ESTADO FÍSICO do elemento químico ${el.name} (${el.symbol}) a 25 °C e 1 atm?`;
    correctAnswer = el.stateAt25C;
    const states = ['Sólido', 'Líquido', 'Gasoso'] as const;
    wrongAnswers = states.filter(s => s !== el.stateAt25C);
    explanation = `À temperatura ambiente (25 °C) e 1 atm, o ${el.name} (${el.symbol}) encontra-se no estado ${el.stateAt25C}. ${el.curiosity}`;
    aiHint = `${el.description}`;
  }

  const rawOptions = [
    { text: cleanMathText(correctAnswer), isCorrect: true, explanation: cleanMathText(explanation) },
    ...wrongAnswers.slice(0, 3).map(w => ({ text: cleanMathText(w), isCorrect: false, explanation: 'Incorreto. Verifique a posição e dados do elemento na Tabela Periódica.' }))
  ];

  const shuffled = rawOptions.sort(() => Math.random() - 0.5);
  const letters = ['A', 'B', 'C', 'D'] as const;

  return {
    id,
    subject: 'Química & Tabela Periódica',
    topic: hiddenProp === 'name' ? `Símbolo [ ${el.symbol} ] • ${el.family}` : `${el.name} (${hiddenProp === 'symbol' ? '?' : el.symbol}) • ${hiddenProp === 'family' ? 'Tabela Periódica' : el.family}`,
    difficulty: difficulty === 'Hardcore' ? 'Difícil' : difficulty,
    statement: cleanMathText(statement),
    gameType: 'chemistry',
    chemicalElement: {
      ...el,
      hiddenProperty: hiddenProp
    },
    options: shuffled.map((opt, i) => ({
      id: letters[i],
      text: opt.text,
      isCorrect: opt.isCorrect,
      explanation: opt.explanation
    })),
    aiHint: cleanMathText(aiHint)
  };
}

// Gerador de Fórmulas ENEM & Aplicações
export function generateRandomFormulaQuestion(difficulty: GameDifficulty): QuizQuestion {
  const id = Date.now() + Math.floor(Math.random() * 10000);
  const template = ENEM_FORMULAS_BANK[Math.floor(Math.random() * ENEM_FORMULAS_BANK.length)];
  const qData = template.createQuestion(difficulty);

  const rawOptions = [
    { text: cleanMathText(qData.correctAnswer), isCorrect: true, explanation: cleanMathText(qData.explanation) },
    ...qData.wrongAnswers.slice(0, 3).map(w => ({ text: cleanMathText(w), isCorrect: false, explanation: 'Incorreto. Atente-se às unidades de medida e às relações diretas da fórmula.' }))
  ];

  const shuffled = rawOptions.sort(() => Math.random() - 0.5);
  const letters = ['A', 'B', 'C', 'D'] as const;

  return {
    id,
    subject: `${template.discipline} • Fórmulas ENEM`,
    topic: template.topic,
    difficulty: difficulty === 'Hardcore' ? 'Difícil' : difficulty,
    statement: cleanMathText(qData.statement),
    codeSnippet: qData.codeSnippet,
    gameType: 'formula',
    formulaInfo: {
      formula: template.formula,
      mnemonic: template.mnemonic,
      discipline: template.discipline
    },
    options: shuffled.map((opt, i) => ({
      id: letters[i],
      text: opt.text,
      isCorrect: opt.isCorrect,
      explanation: opt.explanation
    })),
    aiHint: cleanMathText(qData.aiHint)
  };
}
