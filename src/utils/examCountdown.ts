export interface TargetExam {
  id: string;
  name: string;
  shortName: string;
  targetDate: string; // ISO string
  description: string;
  tips: string;
}

export const TARGET_EXAMS: TargetExam[] = [
  {
    id: 'enem-dia-1',
    name: 'ENEM 2026 • 1º Dia (Linguagens, Humanas & Redação)',
    shortName: 'ENEM 1º Dia',
    targetDate: '2026-11-01T13:00:00-03:00',
    description: '45 questões de Linguagens + 45 questões de Ciências Humanas + Redação Dissertativa.',
    tips: 'Priorize interpretação textual, sociologia crítica e a proposta de intervenção com 5 elementos.'
  },
  {
    id: 'enem-dia-2',
    name: 'ENEM 2026 • 2º Dia (Matemática & Ciências da Natureza)',
    shortName: 'ENEM 2º Dia',
    targetDate: '2026-11-08T13:00:00-03:00',
    description: '45 questões de Matemática + 45 questões de Biologia, Física e Química.',
    tips: 'Domine a TRI resolvendo primeiro as questões fáceis de matemática básica, proporção e ecologia.'
  },
  {
    id: 'fuvest-2027',
    name: 'FUVEST 2027 • 1ª Fase (USP)',
    shortName: 'FUVEST',
    targetDate: '2026-11-15T13:00:00-03:00',
    description: '90 questões de múltipla escolha com alta densidade teórica e leituras obrigatórias.',
    tips: 'Foco nos livros de literatura obrigatória e rigor algébrico nas questões de exatas.'
  },
  {
    id: 'unicamp-2027',
    name: 'UNICAMP 2027 • 1ª Fase',
    shortName: 'UNICAMP',
    targetDate: '2026-10-25T13:00:00-03:00',
    description: '72 questões interdisciplinares e contextualizadas.',
    tips: 'Atenção para questões de análise de gráficos científicos e divulgação cultural.'
  }
];

export interface CountdownResult {
  totalSeconds: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
  formattedText: string;
}

export function calculateExamCountdown(targetDateStr: string): CountdownResult {
  const targetTime = new Date(targetDateStr).getTime();
  const now = new Date().getTime();
  const diffMs = targetTime - now;

  if (diffMs <= 0) {
    return {
      totalSeconds: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isPast: true,
      formattedText: 'Exame em andamento ou realizado!'
    };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let formattedText = `${days} dias`;
  if (days < 30) {
    formattedText = `${days}d ${hours}h ${minutes}m`;
  }

  return {
    totalSeconds,
    days,
    hours,
    minutes,
    seconds,
    isPast: false,
    formattedText
  };
}
