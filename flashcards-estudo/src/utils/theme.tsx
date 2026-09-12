import { DeckColor } from '../types';
import {
  Languages,
  Code,
  Dna,
  Brain,
  BookOpen,
  Sparkles,
  Globe,
  Calculator,
  Palette,
  GraduationCap,
  FlaskConical,
  Compass,
  Music,
  Folder,
} from 'lucide-react';
import React from 'react';

export const COLOR_THEMES: Record<
  DeckColor,
  {
    name: string;
    bg: string;
    lightBg: string;
    darkBg: string;
    text: string;
    border: string;
    badge: string;
    gradient: string;
    ring: string;
  }
> = {
  indigo: {
    name: 'Verde Floresta',
    bg: 'bg-[#2D5A46]',
    lightBg: 'bg-[#EBF3EF] dark:bg-[#15221B]',
    darkBg: 'bg-[#0E1712]',
    text: 'text-[#2D5A46] dark:text-[#52B788]',
    border: 'border-[#CFE1D6] dark:border-[#22392D]',
    badge: 'bg-[#E2EFE7] text-[#224A38] dark:bg-[#1D3528] dark:text-[#6BCFA0]',
    gradient: 'from-[#2D5A46] to-[#1E3E30]',
    ring: 'focus:ring-[#2D5A46]',
  },
  emerald: {
    name: 'Verde Floresta',
    bg: 'bg-[#2D5A46]',
    lightBg: 'bg-[#EBF3EF] dark:bg-[#15221B]',
    darkBg: 'bg-[#0E1712]',
    text: 'text-[#2D5A46] dark:text-[#52B788]',
    border: 'border-[#CFE1D6] dark:border-[#22392D]',
    badge: 'bg-[#E2EFE7] text-[#224A38] dark:bg-[#1D3528] dark:text-[#6BCFA0]',
    gradient: 'from-[#2D5A46] to-[#1E3E30]',
    ring: 'focus:ring-[#2D5A46]',
  },
  rose: {
    name: 'Carmesim Antigo',
    bg: 'bg-[#A8423F]',
    lightBg: 'bg-[#F9ECEB] dark:bg-[#241515]',
    darkBg: 'bg-[#180E0E]',
    text: 'text-[#A8423F] dark:text-[#E57370]',
    border: 'border-[#EFC9C7] dark:border-[#3D1D1C]',
    badge: 'bg-[#F5DFDE] text-[#8F2E2B] dark:bg-[#331716] dark:text-[#F08F8D]',
    gradient: 'from-[#A8423F] to-[#8C3330]',
    ring: 'focus:ring-[#A8423F]',
  },
  amber: {
    name: 'Âmbar Dourado',
    bg: 'bg-[#D97706]',
    lightBg: 'bg-[#FEF3C7]/70 dark:bg-[#2C210E]',
    darkBg: 'bg-[#1A1407]',
    text: 'text-[#B45309] dark:text-[#FBBF24]',
    border: 'border-[#FDE68A] dark:border-[#4B3917]',
    badge: 'bg-[#FEF3C7] text-[#92400E] dark:bg-[#3D2E14] dark:text-[#FCD34D]',
    gradient: 'from-[#D97706] to-[#B45309]',
    ring: 'focus:ring-[#D97706]',
  },
  violet: {
    name: 'Ameixa Arquivo',
    bg: 'bg-[#6B4F67]',
    lightBg: 'bg-[#F4EFF3] dark:bg-[#20161F]',
    darkBg: 'bg-[#150D14]',
    text: 'text-[#6B4F67] dark:text-[#BFA1BB]',
    border: 'border-[#DECEDC] dark:border-[#3B2739]',
    badge: 'bg-[#EDE4EC] text-[#553C51] dark:bg-[#301F2E] dark:text-[#D4BCD1]',
    gradient: 'from-[#6B4F67] to-[#553C51]',
    ring: 'focus:ring-[#6B4F67]',
  },
  cyan: {
    name: 'Petróleo Nobre',
    bg: 'bg-[#2E6068]',
    lightBg: 'bg-[#ECF4F5] dark:bg-[#121F21]',
    darkBg: 'bg-[#0B1517]',
    text: 'text-[#2E6068] dark:text-[#67B5C2]',
    border: 'border-[#C8DFE3] dark:border-[#1E393D]',
    badge: 'bg-[#DEEFF1] text-[#224B51] dark:bg-[#182C30] dark:text-[#7FC2CD]',
    gradient: 'from-[#2E6068] to-[#1E4349]',
    ring: 'focus:ring-[#2E6068]',
  },
  blue: {
    name: 'Azul Caderno',
    bg: 'bg-[#294B73]',
    lightBg: 'bg-[#ECF2F9] dark:bg-[#131B26]',
    darkBg: 'bg-[#0D131C]',
    text: 'text-[#294B73] dark:text-[#769ED1]',
    border: 'border-[#C7D9EE] dark:border-[#203248]',
    badge: 'bg-[#DFECF9] text-[#1E3958] dark:bg-[#1A293B] dark:text-[#8CB0DF]',
    gradient: 'from-[#294B73] to-[#1C3554]',
    ring: 'focus:ring-[#294B73]',
  },
  fuchsia: {
    name: 'Ocre Terroso',
    bg: 'bg-[#965839]',
    lightBg: 'bg-[#EBF3EF] dark:bg-[#15221B]',
    darkBg: 'bg-[#180F0B]',
    text: 'text-[#965839] dark:text-[#DC9E7D]',
    border: 'border-[#E7D0C4] dark:border-[#3D261D]',
    badge: 'bg-[#EFE2D9] text-[#7A4225] dark:bg-[#342017] dark:text-[#E8B69B]',
    gradient: 'from-[#965839] to-[#7B4428]',
    ring: 'focus:ring-[#965839]',
  },
};

export const AVAILABLE_ICONS: { id: string; label: string }[] = [
  { id: 'Languages', label: 'Idiomas' },
  { id: 'Code', label: 'Código' },
  { id: 'Dna', label: 'Biologia' },
  { id: 'Brain', label: 'Ciência/Mente' },
  { id: 'BookOpen', label: 'Livros' },
  { id: 'Sparkles', label: 'Ideias' },
  { id: 'Globe', label: 'Geografia' },
  { id: 'Calculator', label: 'Exatas' },
  { id: 'Palette', label: 'Artes' },
  { id: 'GraduationCap', label: 'Acadêmico' },
  { id: 'FlaskConical', label: 'Química' },
  { id: 'Compass', label: 'História' },
  { id: 'Music', label: 'Música' },
];

export function renderDeckIcon(iconName: string, className = 'w-5 h-5') {
  switch (iconName) {
    case 'Languages':
      return <Languages className={className} />;
    case 'Code':
      return <Code className={className} />;
    case 'Dna':
      return <Dna className={className} />;
    case 'Brain':
      return <Brain className={className} />;
    case 'BookOpen':
      return <BookOpen className={className} />;
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'Globe':
      return <Globe className={className} />;
    case 'Calculator':
      return <Calculator className={className} />;
    case 'Palette':
      return <Palette className={className} />;
    case 'GraduationCap':
      return <GraduationCap className={className} />;
    case 'FlaskConical':
      return <FlaskConical className={className} />;
    case 'Compass':
      return <Compass className={className} />;
    case 'Music':
      return <Music className={className} />;
    default:
      return <Folder className={className} />;
  }
}
