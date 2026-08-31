export type BodyLayer = 'externo' | 'orgaos' | 'esqueleto' | 'musculos' | 'circulacao';

export type BodyZone = 'cabeca' | 'tronco' | 'membros_superiores' | 'membros_inferiores';

export type BiologicalSex = 'feminino' | 'masculino';

export type CellOrganelleCategory = 'genetico' | 'energetico' | 'sintese_secrecao' | 'digestao_detox' | 'estrutural_membrana';

export interface EnemOption {
  letter: 'A' | 'B' | 'C' | 'D' | 'E';
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface EnemQuestion {
  id: string;
  context: string; // Contexto ou situação-problema típica do ENEM
  question: string; // Enunciado no padrão INEP
  options: EnemOption[];
  competenceSkill: string; // ex: "Competência de Área 4 - Habilidade 14"
  generalExplanation: string;
}

export interface EnemTip {
  title: string;
  description: string;
  type: 'frequente' | 'pegadinha' | 'interdisciplinar' | 'conceito_chave';
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface RealLifeInfo {
  imageUrl: string;
  sourceType: string; // ex: "Microscopia Eletrônica de Transmissão (MET)", "Anatomia Real / Fotografia Médica", etc.
  magnificationOrScale: string; // ex: "Aumento de 60.000x (~1 µm)" ou "Escala real (~12 cm x 8 cm)"
  visualDescription: string; // O que os cientistas e médicos realmente enxergam
  keyRealFeatures: string[]; // 3-4 pontos identificáveis na foto real
}

export interface BodyPartData {
  id: string;
  name: string;
  scientificName: string;
  zone: BodyZone;
  sex?: 'feminino' | 'masculino' | 'ambos';
  tagline: string;
  shortDesc: string;
  simpleAnalogy?: string; // Analogia super simples e intuitiva do dia a dia
  easySteps?: string[]; // 3-4 passos fáceis de como funciona
  fullPhysiology: string;
  cellularBiochemistry: string;
  icon: string;
  soundType?: 'heartbeat' | 'breath' | 'pop' | 'bell' | 'electric' | 'digest' | 'sparkle';
  enemRecurrence: 'Altíssima' | 'Alta' | 'Média';
  enemKeywords: string[];
  enemTips: EnemTip[];
  flashcards: Flashcard[];
  enemQuestion: EnemQuestion;
  svgHighlightId: string;
  realLifeInfo?: RealLifeInfo;
}

export interface CellOrganelleData {
  id: string;
  name: string;
  scientificName: string;
  category: CellOrganelleCategory;
  categoryLabel: string;
  tagline: string;
  shortDesc: string;
  simpleAnalogy?: string; // Analogia super simples e intuitiva do dia a dia
  easySteps?: string[]; // 3-4 passos fáceis de como funciona
  fullFunction: string;
  biochemistryMecanismo: string;
  icon: string;
  soundType?: 'sparkle' | 'pop' | 'electric' | 'breath' | 'heartbeat' | 'digest' | 'bell';
  enemRecurrence: 'Altíssima' | 'Alta' | 'Média';
  enemKeywords: string[];
  enemTips: EnemTip[];
  flashcards: Flashcard[];
  enemQuestion: EnemQuestion;
  color: string;
  svgHighlightId: string;
  realLifeInfo?: RealLifeInfo;
}
