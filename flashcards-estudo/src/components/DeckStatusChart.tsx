import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Flashcard } from '../types';
import { CheckCircle2, BookOpen, Sparkles } from 'lucide-react';

interface DeckStatusChartProps {
  cards: Flashcard[];
}

interface ChartItem {
  name: string;
  value: number;
  color: string;
  key: 'new' | 'learning' | 'review' | 'mastered';
  description: string;
}

export const DeckStatusChart: React.FC<DeckStatusChartProps> = ({ cards }) => {
  const total = cards.length;

  const countNew = cards.filter((c) => !c.status || c.status === 'new').length;
  const countLearning = cards.filter((c) => c.status === 'learning').length;
  const countReview = cards.filter((c) => c.status === 'review').length;
  const countMastered = cards.filter((c) => c.status === 'mastered').length;

  const data: ChartItem[] = [
    {
      name: 'Novos',
      value: countNew,
      color: '#78716C', // Stone 500
      key: 'new',
      description: 'Ainda não respondidos',
    },
    {
      name: 'Em revisão',
      value: countReview,
      color: '#3B82F6', // Blue 500
      key: 'review',
      description: 'Respondidos e agendados para revisão',
    },
    {
      name: 'Aprendendo',
      value: countLearning,
      color: '#D97706', // Warm Amber
      key: 'learning',
      description: 'Em fase de fixação',
    },
    {
      name: 'Dominados',
      value: countMastered,
      color: '#2D5A46', // Forest green
      key: 'mastered',
      description: 'Retidos na memória',
    },
  ];

  // Filter out slices with value 0 for the pie display, unless all are 0
  const activeData = data.filter((d) => d.value > 0);

  const masteryPercent = total > 0 ? Math.round((countMastered / total) * 100) : 0;

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item: ChartItem = payload[0].payload;
      const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
      return (
        <div className="bg-white dark:bg-[#18181B] px-3.5 py-2.5 rounded-xl shadow-xl border-2 border-[#E7E2D9] dark:border-[#2C2C30] text-xs z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center gap-2 font-bold text-[#1C1917] dark:text-[#FAF9F5] mb-0.5">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="font-['Fraunces',serif]">{item.name}</span>
          </div>
          <p className="text-[#57534E] dark:text-[#D6D3CD] font-medium font-mono text-[11px]">
            <strong className="text-[#1C1917] dark:text-[#FAF9F5] font-bold">{item.value}</strong>{' '}
            cards ({pct}%)
          </p>
          <p className="text-[10px] text-[#8C7A6B] dark:text-[#A8A29E] mt-0.5">
            {item.description}
          </p>
        </div>
      );
    }
    return null;
  };

  if (total === 0) {
    return (
      <div className="p-6 rounded-2xl bg-[#FAF8F5] dark:bg-[#18181B] border-2 border-[#E7E2D9] dark:border-[#2C2C30] text-center flex flex-col items-center justify-center min-h-[180px]">
        <BookOpen className="w-8 h-8 text-[#8C7A6B] mb-2 stroke-1" />
        <p className="text-xs font-bold text-[#57534E] dark:text-[#D6D3CD]">
          Nenhum cartão cadastrado neste baralho
        </p>
        <span className="text-[11px] text-[#8C7A6B] dark:text-[#A8A29E] mt-1">
          Adicione cartões para acompanhar o gráfico de distribuição de aprendizado
        </span>
      </div>
    );
  }

  return (
    <div
      id="deck-status-distribution-card"
      className="p-5 sm:p-6 rounded-2xl bg-[#FAF8F5] dark:bg-[#18181B] border-2 border-[#E7E2D9] dark:border-[#2C2C30] shadow-xs"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-[#1C1917] dark:text-[#FAF9F5] font-['Fraunces',serif] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#2D5A46]" />
            Distribuição de Estados dos Cards
          </h3>
          <p className="text-xs text-[#78716C] dark:text-[#A8A29E] mt-0.5">
            Acompanhe a proporção de cartões novos, em aprendizado e dominados
          </p>
        </div>
        <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-white dark:bg-[#141416] border border-[#E7E2D9] dark:border-[#2C2C30] text-[#1C1917] dark:text-[#FAF9F5]">
          Total: <strong className="text-[#2D5A46]">{total}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Recharts Donut Chart */}
        <div className="md:col-span-6 relative h-[180px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={activeData.length > 0 ? activeData : [{ name: 'Sem dados', value: 1, color: '#E7E2D9' }]}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={activeData.length > 1 ? 4 : 0}
                dataKey="value"
                animationDuration={800}
                stroke="none"
              >
                {activeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center text inside donut hole */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-black text-[#1C1917] dark:text-[#FAF9F5] font-['Fraunces',serif] leading-tight">
              {masteryPercent}%
            </span>
            <span className="text-[10px] font-mono font-bold text-[#8C7A6B] uppercase tracking-wider">
              Dominado
            </span>
          </div>
        </div>

        {/* Legend / Breakdown List */}
        <div className="md:col-span-6 space-y-2.5">
          {data.map((item) => {
            const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
            return (
              <div
                key={item.key}
                className="p-2.5 rounded-xl border border-[#E7E2D9] dark:border-[#2C2C30] bg-white dark:bg-[#141416] flex items-center justify-between gap-3 hover:border-[#2D5A46] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <span className="text-xs font-bold text-[#1C1917] dark:text-[#FAF9F5] block leading-tight font-['Fraunces',serif]">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-[#8C7A6B] dark:text-[#A8A29E] block">
                      {item.description}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-[#1C1917] dark:text-[#FAF9F5] block font-mono">
                    {item.value} <span className="text-[10px] text-[#8C7A6B] font-normal">({pct}%)</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
