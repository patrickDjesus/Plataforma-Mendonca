import { GameDifficulty } from './gameGenerators';

// Níveis dinâmicos do Modo Endurance com base no tempo progressivo
export const getEnduranceLevel = (seconds: number): {
  level: number;
  label: string;
  diff: GameDifficulty;
  multiplierBonus: number;
  color: string;
  badgeBg: string;
} => {
  if (seconds < 35) {
    return {
      level: 1,
      label: 'Fase 1: Aquecimento',
      diff: 'Fácil',
      multiplierBonus: 1.0,
      color: 'text-emerald-400 border-emerald-500/40',
      badgeBg: 'bg-emerald-500/10'
    };
  } else if (seconds < 80) {
    return {
      level: 2,
      label: 'Fase 2: Aceleração',
      diff: 'Médio',
      multiplierBonus: 1.5,
      color: 'text-amber-400 border-amber-500/40',
      badgeBg: 'bg-amber-500/15'
    };
  } else if (seconds < 140) {
    return {
      level: 3,
      label: 'Fase 3: Sobrecarga',
      diff: 'Difícil',
      multiplierBonus: 2.0,
      color: 'text-orange-400 border-orange-500/40',
      badgeBg: 'bg-orange-500/20'
    };
  } else {
    return {
      level: 4,
      label: 'Fase 4: Hipervelocidade ⚡',
      diff: 'Hardcore',
      multiplierBonus: 3.0,
      color: 'text-rose-400 border-rose-500/40',
      badgeBg: 'bg-rose-500/25'
    };
  }
};
