import React from 'react';
import { X, Flame, Target, CheckCircle2, AlertTriangle, Calendar, Award, RotateCcw } from 'lucide-react';
import { UserStats, Deck, Flashcard } from '../types';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats;
  decks: Deck[];
  onSelectDeckForStudy?: (deckId: string) => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  stats,
  decks,
}) => {
  if (!isOpen) return null;

  // Aggregate cards across all decks
  const allCards: { card: Flashcard; deckName: string; deckId: string }[] = [];
  decks.forEach((deck) => {
    deck.cards.forEach((card) => {
      allCards.push({ card, deckName: deck.name, deckId: deck.id });
    });
  });

  const totalCardsInDecks = allCards.length;
  const masteredCards = allCards.filter((c) => c.card.status === 'mastered').length;
  const learningCards = allCards.filter((c) => c.card.status === 'learning').length;
  const reviewCards = allCards.filter((c) => c.card.status === 'review').length;
  const newCards = allCards.filter((c) => c.card.status === 'new').length;

  const accuracy =
    stats.totalCardsStudied > 0
      ? Math.round((stats.totalCorrect / stats.totalCardsStudied) * 100)
      : 0;

  // Top cards with most errors
  const mostErroneousCards = [...allCards]
    .filter((c) => (c.card.errorCount || 0) > 0)
    .sort((a, b) => (b.card.errorCount || 0) - (a.card.errorCount || 0))
    .slice(0, 5);

  // Generate last 7 days chart data
  const days: { label: string; dateStr: string; reviewed: number; correct: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3);
    const log = stats.historyByDate[dateStr] || { reviewed: 0, correct: 0 };
    days.push({
      label: dayName,
      dateStr,
      reviewed: log.reviewed,
      correct: log.correct,
    });
  }

  const maxReviewedInAWeek = Math.max(...days.map((d) => d.reviewed), 10);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-[#FAF8F5] dark:bg-[#18181B] w-full max-w-2xl rounded-2xl shadow-2xl border-2 border-[#E7E2D9] dark:border-[#2C2C30] overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E2D9] dark:border-[#2C2C30]">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#1C1917] dark:text-[#FAF9F5] font-['Fraunces',serif]">
              Estatísticas de Desempenho
            </h2>
          </div>
          <button
            id="btn-close-stats-modal"
            onClick={onClose}
            className="p-1.5 text-[#8C7A6B] hover:text-[#1C1917] dark:hover:text-white rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Key metrics grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-[#EBF3EF] dark:bg-[#15221B] border-2 border-[#CFE1D6] dark:border-[#22392D]">
              <div className="flex items-center gap-1.5 text-[#2D5A46] dark:text-[#6BCFA0] mb-1">
                <Flame className="w-4 h-4" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Sequência</span>
              </div>
              <div className="text-2xl font-black text-[#1C1917] dark:text-[#FAF9F5] font-['Fraunces',serif]">
                {stats.streak} <span className="text-xs font-mono font-normal text-[#8C7A6B]">dias</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#EBF3EF] dark:bg-[#15221B] border-2 border-[#CFE1D6] dark:border-[#22392D]">
              <div className="flex items-center gap-1.5 text-[#2D5A46] dark:text-[#6BCFA0] mb-1">
                <Target className="w-4 h-4" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Revisões</span>
              </div>
              <div className="text-2xl font-black text-[#1C1917] dark:text-[#FAF9F5] font-['Fraunces',serif]">
                {stats.totalCardsStudied}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#EAF5EE] dark:bg-[#1A3326] border-2 border-[#CFE1D6] dark:border-[#264433]">
              <div className="flex items-center gap-1.5 text-[#2D5A46] dark:text-[#52B788] mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Precisão</span>
              </div>
              <div className="text-2xl font-black text-[#1C1917] dark:text-[#FAF9F5] font-['Fraunces',serif]">
                {accuracy}%
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#EFECE6] dark:bg-[#252529] border-2 border-[#E7E2D9] dark:border-[#38383F]">
              <div className="flex items-center gap-1.5 text-[#57534E] dark:text-[#D6D3CD] mb-1">
                <Award className="w-4 h-4" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Dominados</span>
              </div>
              <div className="text-2xl font-black text-[#1C1917] dark:text-[#FAF9F5] font-['Fraunces',serif]">
                {masteredCards} <span className="text-xs font-mono font-normal text-[#8C7A6B]">/ {totalCardsInDecks}</span>
              </div>
            </div>
          </div>

          {/* Activity Bar Chart (Last 7 Days) */}
          <div className="p-5 rounded-2xl border-2 border-[#E7E2D9] dark:border-[#2C2C30] bg-white dark:bg-[#141416] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#2D5A46]" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#1C1917] dark:text-[#FAF9F5]">
                  Cards Estudados nos Últimos 7 Dias
                </h3>
              </div>
              <span className="text-xs font-mono text-[#8C7A6B] dark:text-[#A8A29E]">
                {days.reduce((acc, d) => acc + d.reviewed, 0)} cards esta semana
              </span>
            </div>

            <div className="h-40 flex items-end justify-between gap-2 pt-4 px-2">
              {days.map((d, idx) => {
                const heightPct = Math.max(8, Math.round((d.reviewed / maxReviewedInAWeek) * 100));
                const isToday = idx === days.length - 1;
                return (
                  <div key={d.dateStr} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-mono font-bold text-[#8C7A6B] opacity-0 group-hover:opacity-100 transition-opacity">
                      {d.reviewed}
                    </span>
                    <div className="w-full max-w-[36px] bg-[#EFECE6] dark:bg-[#252529] rounded-t-lg overflow-hidden flex flex-col justify-end transition-all group-hover:brightness-105" style={{ height: `${heightPct}%` }}>
                      <div
                        className={`w-full rounded-t-lg transition-all ${
                          isToday
                            ? 'bg-[#2D5A46]'
                            : 'bg-[#2D5A46]/70'
                        }`}
                        style={{ height: '100%' }}
                      />
                    </div>
                    <span className={`text-[11px] font-mono capitalize ${
                      isToday
                        ? 'text-[#2D5A46] font-bold'
                        : 'text-[#8C7A6B] dark:text-[#A8A29E]'
                    }`}>
                      {d.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cards Mastery Distribution */}
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#8C7A6B] dark:text-[#A8A29E] mb-2">
              Distribuição de Domínio Global
            </h3>
            <div className="h-3 rounded-full bg-[#EFECE6] dark:bg-[#252529] overflow-hidden flex">
              <div
                title={`Dominados: ${masteredCards}`}
                className="bg-[#2D5A46] transition-all"
                style={{ width: `${totalCardsInDecks ? (masteredCards / totalCardsInDecks) * 100 : 0}%` }}
              />
              <div
                title={`Em revisão: ${reviewCards}`}
                className="bg-[#2D5A46] transition-all"
                style={{ width: `${totalCardsInDecks ? (reviewCards / totalCardsInDecks) * 100 : 0}%` }}
              />
              <div
                title={`Aprendendo: ${learningCards}`}
                className="bg-[#D97706] transition-all"
                style={{ width: `${totalCardsInDecks ? (learningCards / totalCardsInDecks) * 100 : 0}%` }}
              />
              <div
                title={`Novos: ${newCards}`}
                className="bg-[#E7E2D9] dark:bg-[#38383F] transition-all"
                style={{ width: `${totalCardsInDecks ? (newCards / totalCardsInDecks) * 100 : 0}%` }}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between text-xs pt-2 font-mono text-[#57534E] dark:text-[#A8A29E]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2D5A46]" />
                Dominados ({masteredCards})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2D5A46]" />
                Em revisão ({reviewCards})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
                Aprendendo ({learningCards})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8C7A6B]" />
                Novos ({newCards})
              </span>
            </div>
          </div>

          {/* Cards with most errors */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <AlertTriangle className="w-4 h-4 text-[#A8423F]" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#8C7A6B] dark:text-[#A8A29E]">
                Cards Mais Desafiadores (Mais Errados)
              </h3>
            </div>

            {mostErroneousCards.length > 0 ? (
              <div className="space-y-2">
                {mostErroneousCards.map(({ card, deckName }) => (
                  <div
                    key={card.id}
                    className="p-3.5 rounded-xl border-2 border-[#E7E2D9] dark:border-[#2C2C30] bg-white dark:bg-[#141416] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[#1C1917] dark:text-[#FAF9F5] truncate font-['Fraunces',serif]">
                        {card.front}
                      </div>
                      <div className="text-[#57534E] dark:text-[#A8A29E] truncate text-[11px] mt-0.5">
                        {card.back}
                      </div>
                      <div className="text-[10px] font-mono text-[#2D5A46] mt-0.5">
                        Baralho: {deckName}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#F9ECEB] text-[#A8423F] dark:bg-[#2C1818] font-mono font-bold text-[11px]">
                        {card.errorCount} {card.errorCount === 1 ? 'erro' : 'erros'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-[#8C7A6B] border-2 border-dashed border-[#E7E2D9] dark:border-[#2C2C30] rounded-xl font-mono">
                Nenhum cartão com erros registrado ainda. Ótimo trabalho!
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-[#E7E2D9] dark:border-[#2C2C30] bg-[#EFECE6]/50 dark:bg-[#141416]">
          <button
            id="btn-close-stats-footer"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-white bg-[#2D5A46] hover:bg-[#21483A] rounded-xl shadow-xs transition-all"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
