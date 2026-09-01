import unisulBanner from '../assets/images/unisul_faculdade_banner.jpg';
import { simulatorDoc } from '../corpoHumano/simulatorDoc';

export interface DocSection {
  id: string;
  heading: string;
  content: string;
  contentHtml?: string;
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
  imageLayout?: 'block' | 'float';
  imageFloatSide?: 'left' | 'right';
  imageSize?: number;
}

export interface GlossaryDefinition {
  term: string;
  definition?: string;
  example?: string;
  category?: string;
  imageUrl?: string;
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
  isPublic?: boolean;
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
    docCount: 0,
    description: 'Álgebra linear, geometria espacial, funções trigonométricas, cálculo e probabilidade estatística.',
    topics: ['Funções & Logaritmos', 'Geometria Espacial', 'Probabilidade'],
    documents: [],
  },
  {
    id: 'fisica',
    name: 'Física',
    category: 'enem',
    icon: 'Zap',
    color: '#0284C7',
    bgLight: 'bg-sky-50',
    borderColor: 'border-sky-200',
    hoverColor: '#0369A1',
    hoverGradient: 'from-sky-600 to-blue-700',
    image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=800&q=80',
    docCount: 0,
    description: 'Mecânica clássica, termologia, óptica geométrica, ondulatória, eletromagnetismo e física moderna.',
    topics: ['Cinemática & MUV', 'Eletrodinâmica', 'Ondulatória'],
    documents: [],
  },
  {
    id: 'quimica',
    name: 'Química',
    category: 'enem',
    icon: 'FlaskConical',
    color: '#7C3AED',
    bgLight: 'bg-purple-50',
    borderColor: 'border-purple-200',
    hoverColor: '#6D28D9',
    hoverGradient: 'from-purple-600 to-violet-800',
    image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80',
    docCount: 0,
    description: 'Química geral e inorgânica, físico-química, equilíbrios, termoquímica e química orgânica.',
    topics: ['Estequiometria', 'Funções Orgânicas', 'Termoquímica'],
    documents: [],
  },
  {
    id: 'biologia',
    name: 'Biologia',
    category: 'enem',
    icon: 'Dna',
    color: '#059669',
    bgLight: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    hoverColor: '#047857',
    hoverGradient: 'from-emerald-600 to-teal-800',
    image: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=800&q=80',
    docCount: 1,
    description: 'Citologia celular, genética mendeliana, ecologia de ecossistemas, botânica e fisiologia humana.',
    topics: ['Genética & DNA', 'Ecologia & Biomas', 'Fisiologia Humana'],
    documents: [simulatorDoc],
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
    hoverGradient: 'from-amber-600 to-orange-700',
    image: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=800&q=80',
    docCount: 0,
    description: 'História do Brasil colonial e contemporâneo, história geral, revoluções e geopolítica mundial.',
    topics: ['Brasil Império & República', 'Era Vargas', 'Guerra Fria'],
    documents: [],
  },
  {
    id: 'geografia',
    name: 'Geografia',
    category: 'enem',
    icon: 'Globe',
    color: '#0D9488',
    bgLight: 'bg-teal-50',
    borderColor: 'border-teal-200',
    hoverColor: '#0F766E',
    hoverGradient: 'from-teal-600 to-emerald-800',
    image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80',
    docCount: 0,
    description: 'Geografia física, relevo, hidrografia, demografia, urbanização, agronegócio e globalização.',
    topics: ['Geopolítica & Globalização', 'Urbanização Brasileira', 'Climatologia'],
    documents: [],
  },
  {
    id: 'filosofia',
    name: 'Filosofia & Sociologia',
    category: 'enem',
    icon: 'Brain',
    color: '#6366F1',
    bgLight: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    hoverColor: '#4F46E5',
    hoverGradient: 'from-indigo-600 to-blue-800',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    docCount: 0,
    description: 'Filosofia antiga, modernidade, ética, teoria do conhecimento, contratualismo e sociologia contemporânea.',
    topics: ['Ética & Política', 'Contratualistas', 'Sociologia do Trabalho'],
    documents: [],
  },
  {
    id: 'portugues',
    name: 'Linguagens & Literatura',
    category: 'enem',
    icon: 'Languages',
    color: '#EA580C',
    bgLight: 'bg-orange-50',
    borderColor: 'border-orange-200',
    hoverColor: '#C2410C',
    hoverGradient: 'from-orange-600 to-red-700',
    image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80',
    docCount: 0,
    description: 'Interpretação textual, gêneros e tipologias, funções da linguagem, escolas literárias e gramática aplicada.',
    topics: ['Funções da Linguagem', 'Modernismo no Brasil', 'Variação Linguística'],
    documents: [],
  },
  {
    id: 'redacao',
    name: 'Redação Nota 1000',
    category: 'enem',
    icon: 'PenTool',
    color: '#BE185D',
    bgLight: 'bg-pink-50',
    borderColor: 'border-pink-200',
    hoverColor: '#9D174D',
    hoverGradient: 'from-pink-600 to-rose-800',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80',
    docCount: 0,
    description: 'Estrutura dissertativo-argumentativa, repertórios socioculturais legitimados e propostas de intervenção completas.',
    topics: ['Estrutura dos 4 Parágrafos', 'Repertórios Socioculturais', 'Proposta de Intervenção C5'],
    documents: [],
  },
  {
    id: 'faculdade',
    name: 'Faculdade',
    category: 'faculdade',
    icon: 'GraduationCap',
    color: '#7C3AED',
    bgLight: 'bg-purple-50',
    borderColor: 'border-purple-200',
    hoverColor: '#6D28D9',
    hoverGradient: 'from-purple-600 to-indigo-800',
    image: unisulBanner,
    docCount: 0,
    description: 'Anotações da graduação na Unisul, projetos universitários, inteligência artificial, engenharia de software e disciplinas do semestre acadêmico.',
    topics: ['Unisul • Matérias do Semestre', 'Projetos & Trabalhos Acadêmicos', 'Anotações & Resumos de Aulas'],
    documents: [],
  },
  {
    id: 'pessoal',
    name: 'Pessoal',
    category: 'pessoal',
    icon: 'PenLine',
    color: '#9333EA',
    bgLight: 'bg-fuchsia-50',
    borderColor: 'border-fuchsia-200',
    hoverColor: '#7E22CE',
    hoverGradient: 'from-fuchsia-600 to-purple-800',
    image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80',
    docCount: 0,
    description: 'Espaço livre para reflexões, diário de bordo, ideias criativas, lembretes, metas pessoais e anotações sem amarras de vestibular.',
    topics: ['Diário Livre & Reflexões', 'Ideias & Lembretes', 'Metas Pessoais'],
    documents: [],
  }
];
