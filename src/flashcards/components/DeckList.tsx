import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Sparkles,
  Flame,
  ArrowRight,
  MoreVertical,
  Edit2,
  Copy,
  Trash2,
  Clock,
  CheckCircle2,
  X,
  AlertCircle,
  ArrowUpDown,
  BookOpen,
  Layers,
} from 'lucide-react';
import { Deck, Flashcard, UserStats } from '../types';
import { COLOR_THEMES, renderDeckIcon } from '../utils/theme';

interface DeckListProps {
  decks: Deck[];
  stats: UserStats;
  onSelectDeck: (deck: Deck, initialSearch?: string) => void;
  onNewDeck: () => void;
  onEditDeck: (deck: Deck) => void;
  onDuplicateDeck: (deck: Deck) => void;
  onDeleteDeck: (deckId: string) => void;
  onOpenStats: () => void;
}

interface MatchedCardItem {
  card: Flashcard;
  deck: Deck;
  matchedIn: 'front' | 'back' | 'tag' | 'both';
}

/** Helper to highlight matching query text within strings */
function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim() || !text) {
    return <span>{text}</span>;
  }

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={i}
            className="bg-amber-200 dark:bg-amber-900/70 text-amber-950 dark:text-amber-100 px-1 py-0.5 rounded font-semibold"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

export const DeckList: React.FC<DeckListProps> = ({
  decks,
  stats,
  onSelectDeck,
  onNewDeck,
  onEditDeck,
  onDuplicateDeck,
  onDeleteDeck,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDueOnly, setFilterDueOnly] = useState(false);
  const [sortByDueFirst, setSortByDueFirst] = useState(true);
  const [activeTab, setActiveTab] = useState<'decks' | 'cards'>('decks');
  const [activeMenuDeckId, setActiveMenuDeckId] = useState<string | null>(null);

  const now = Date.now();

  // Metrics across all decks
  const totalCardsAllDecks = useMemo(
    () => decks.reduce((acc, d) => acc + d.cards.length, 0),
    [decks]
  );

  const totalDueToday = useMemo(
    () =>
      decks.reduce(
        (acc, d) => acc + d.cards.filter((c) => (c.dueDate || 0) <= now).length,
        0
      ),
    [decks, now]
  );

  // Search through ALL cards across ALL decks
  const matchingCards: MatchedCardItem[] = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const results: MatchedCardItem[] = [];
    decks.forEach((deck) => {
      deck.cards.forEach((card) => {
        const frontMatch = card.front.toLowerCase().includes(q);
        const backMatch = card.back.toLowerCase().includes(q);
        const tagMatch = card.tag ? card.tag.toLowerCase().includes(q) : false;

        if (frontMatch || backMatch || tagMatch) {
          const matchedIn: 'front' | 'back' | 'tag' | 'both' =
            frontMatch && backMatch ? 'both' : frontMatch ? 'front' : backMatch ? 'back' : 'tag';

          results.push({
            card,
            deck,
            matchedIn,
          });
        }
      });
    });

    return results;
  }, [decks, searchQuery]);

  // Search & Filter Decks
  const processedDecks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return decks
      .filter((deck) => {
        // Due filter
        if (filterDueOnly) {
          const hasDue = deck.cards.some((c) => (c.dueDate || 0) <= now);
          if (!hasDue) return false;
        }

        // Search filter: matches deck info OR has matching cards inside it
        if (q) {
          const matchesDeckMeta =
            deck.name.toLowerCase().includes(q) ||
            (deck.description && deck.description.toLowerCase().includes(q));

          const hasMatchingCard = deck.cards.some(
            (c) =>
              c.front.toLowerCase().includes(q) ||
              c.back.toLowerCase().includes(q) ||
              (c.tag && c.tag.toLowerCase().includes(q))
          );

          if (!matchesDeckMeta && !hasMatchingCard) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortByDueFirst) {
          const aDue = a.cards.filter((c) => (c.dueDate || 0) <= now).length;
          const bDue = b.cards.filter((c) => (c.dueDate || 0) <= now).length;
          if (aDue > 0 && bDue === 0) return -1;
          if (bDue > 0 && aDue === 0) return 1;
          if (aDue !== bDue) return bDue - aDue;
        }
        return 0;
      });
  }, [decks, searchQuery, filterDueOnly, sortByDueFirst, now]);

  const decksWithDueCount = useMemo(
    () => decks.filter((d) => d.cards.some((c) => (c.dueDate || 0) <= now)).length,
    [decks, now]
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Editorial Overview Header */}
      <div className="rounded-3xl bg-[#FAF8F5] dark:bg-[#18181B] border-2 border-[#E7E2D9] dark:border-[#2C2C30] p-6 sm:p-8 relative overflow-hidden shadow-xs">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF3EF] dark:bg-[#1D2B24] border border-[#CFE1D6] dark:border-[#2B4637] text-[#2D5A46] dark:text-[#52B788] text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Sistema Ativo: Reconhecimento + Escrita</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#1C1917] dark:text-[#FAF9F5] font-['Fraunces',serif]">
            Seus Baralhos de Estudo
          </h1>

          <p className="text-[#57534E] dark:text-[#A8A29E] text-xs sm:text-sm leading-relaxed">
            Fixe conceitos com ciclo duplo: primeiro valide o reconhecimento mental de cada cartão e, em seguida, exercite a escrita ativa com tolerância a variações sinônimas.
          </p>

          <div className="pt-2 flex items-center gap-3 flex-wrap text-xs font-mono">
            <div className="flex items-center gap-1.5 bg-[#F5F2EB] dark:bg-[#232326] px-3 py-1.5 rounded-xl border border-[#E7E2D9] dark:border-[#333338] text-[#1C1917] dark:text-[#E7E5E4]">
              <Flame className="w-4 h-4 text-[#2D5A46] dark:text-[#52B788] fill-[#2D5A46] dark:fill-[#52B788]" />
              <span>
                Sequência: <strong>{stats.streak} {stats.streak === 1 ? 'dia' : 'dias'}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#F5F2EB] dark:bg-[#232326] px-3 py-1.5 rounded-xl border border-[#E7E2D9] dark:border-[#333338] text-[#1C1917] dark:text-[#E7E5E4]">
              <Clock className="w-4 h-4 text-[#2D5A46]" />
              <span>
                Revisão diária: <strong>{totalDueToday} cards</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#F5F2EB] dark:bg-[#232326] px-3 py-1.5 rounded-xl border border-[#E7E2D9] dark:border-[#333338] text-[#1C1917] dark:text-[#E7E5E4]">
              <Layers className="w-4 h-4 text-[#2D5A46] dark:text-[#52B788]" />
              <span>
                Acervo total: <strong>{totalCardsAllDecks} fichas</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Subtle decorative stamp */}
        <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full border-4 border-[#E7E2D9]/40 dark:border-[#2C2C30]/40 pointer-events-none flex items-center justify-center opacity-30 select-none">
          <span className="font-['Fraunces',serif] text-xs uppercase tracking-widest text-[#78716C] rotate-[-20deg]">
            Arquivo de Estudo
          </span>
        </div>
      </div>

      {/* Global Search Bar & Main Controls */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Global Search Input */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-[#8C7A6B] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="input-global-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisa global: busque conceitos, termos, perguntas ou tags..."
              className="w-full pl-11 pr-10 py-3.5 rounded-2xl border-2 border-[#E7E2D9] dark:border-[#2C2C30] bg-white dark:bg-[#18181B] text-[#1C1917] dark:text-[#FAF9F5] placeholder-[#A8A29E] text-sm focus:outline-none focus:border-[#2D5A46] shadow-xs transition-colors"
            />
            {searchQuery && (
              <button
                id="btn-clear-global-search"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#8C7A6B] hover:text-[#1C1917] dark:hover:text-white rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                title="Limpar pesquisa"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* New Deck Action */}
          <button
            id="btn-create-deck-main"
            onClick={onNewDeck}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#2D5A46] hover:bg-[#21483A] text-white font-bold text-sm shadow-sm hover:shadow transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Novo Baralho</span>
          </button>
        </div>

        {/* Filters & Tabs Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          {/* If search query is active, show tabs: Decks vs Matched Cards */}
          {searchQuery.trim() ? (
            <div className="flex items-center gap-2 bg-[#EFECE6] dark:bg-[#202024] p-1 rounded-2xl text-xs font-semibold">
              <button
                id="tab-search-decks"
                onClick={() => setActiveTab('decks')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  activeTab === 'decks'
                    ? 'bg-white dark:bg-[#161618] text-[#1C1917] dark:text-white shadow-xs'
                    : 'text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-white'
                }`}
              >
                Baralhos ({processedDecks.length})
              </button>
              <button
                id="tab-search-cards"
                onClick={() => setActiveTab('cards')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'cards'
                    ? 'bg-white dark:bg-[#161618] text-[#2D5A46] shadow-xs font-bold'
                    : 'text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Cards Encontrados ({matchingCards.length})</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap text-xs">
              {/* Quick filter: Pending reviews today */}
              <button
                id="filter-pending-today"
                onClick={() => setFilterDueOnly(!filterDueOnly)}
                className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 border-2 ${
                  filterDueOnly
                    ? 'bg-[#FEF3C7] dark:bg-[#3D2E14] text-[#92400E] dark:text-[#FBBF24] border-[#FDE68A] dark:border-[#5E441D] shadow-xs'
                    : 'bg-white dark:bg-[#18181B] text-[#57534E] dark:text-[#D6D3CD] border-[#E7E2D9] dark:border-[#2C2C30] hover:border-[#2D5A46]'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Pendentes Hoje</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold font-mono ${
                    filterDueOnly
                      ? 'bg-[#FDE68A] dark:bg-[#5E441D] text-[#92400E] dark:text-[#FDE68A]'
                      : 'bg-[#FEF3C7] dark:bg-[#3D2E14] text-[#92400E] dark:text-[#FBBF24]'
                  }`}
                >
                  {decksWithDueCount}
                </span>
              </button>

              {/* Quick sort toggle: Prioritize due decks first */}
              <button
                id="sort-toggle-due-first"
                onClick={() => setSortByDueFirst(!sortByDueFirst)}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 border-2 text-xs ${
                  sortByDueFirst
                    ? 'bg-[#EBF3EF] dark:bg-[#15221B] text-[#2D5A46] border-[#CFE1D6] dark:border-[#22392D] font-semibold'
                    : 'bg-white dark:bg-[#18181B] text-[#78716C] dark:text-[#A8A29E] border-[#E7E2D9] dark:border-[#2C2C30] hover:border-[#2D5A46]'
                }`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>Priorizar revisões pendentes</span>
              </button>
            </div>
          )}

          {/* Search stats label */}
          {searchQuery.trim() && (
            <div className="text-xs text-[#78716C] dark:text-[#A8A29E] flex items-center gap-1.5 font-mono">
              <span>Buscando por: </span>
              <strong className="text-[#1C1917] dark:text-[#FAF9F5] font-bold">"{searchQuery}"</strong>
              <span>— {matchingCards.length} {matchingCards.length === 1 ? 'card' : 'cards'}</span>
            </div>
          )}
        </div>
      </div>

      {/* VIEW A: MATCHING CARDS TAB (When user clicks Cards tab during Global Search) */}
      {searchQuery.trim() && activeTab === 'cards' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#1C1917] dark:text-[#FAF9F5] font-['Fraunces',serif] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D97706]" />
              Cards Encontrados ({matchingCards.length})
            </h2>
            <span className="text-xs text-[#78716C] dark:text-[#A8A29E]">
              Clique em qualquer card para abrir o baralho correspondente
            </span>
          </div>

          {matchingCards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {matchingCards.map(({ card, deck, matchedIn }) => {
                const theme = COLOR_THEMES[deck.color] || COLOR_THEMES.indigo;
                return (
                  <div
                    key={`${deck.id}-${card.id}`}
                    onClick={() => onSelectDeck(deck, searchQuery)}
                    className="p-5 rounded-2xl bg-[#FAF8F5] dark:bg-[#18181B] border-2 border-[#E7E2D9] dark:border-[#2C2C30] hover:border-[#2D5A46] dark:hover:border-[#2D5A46] hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
                  >
                    <div>
                      {/* Deck Origin Badge */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={`w-6 h-6 rounded-lg ${theme.bg} text-white flex items-center justify-center shrink-0 shadow-xs`}
                          >
                            {renderDeckIcon(deck.icon, 'w-3.5 h-3.5')}
                          </div>
                          <span className="text-xs font-bold text-[#57534E] dark:text-[#D6D3CD] truncate">
                            {deck.name}
                          </span>
                        </div>

                        {card.tag && (
                          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#EFECE6] dark:bg-[#252529] text-[#78716C] dark:text-[#A8A29E] shrink-0">
                            {card.tag}
                          </span>
                        )}
                      </div>

                      {/* Card Front (Term) */}
                      <div className="mb-2">
                        <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-[#8C7A6B] block mb-0.5">
                          Termo / Frente
                        </span>
                        <h3 className="text-base font-bold text-[#1C1917] dark:text-[#FAF9F5] font-['Fraunces',serif] group-hover:text-[#2D5A46] transition-colors leading-snug">
                          <HighlightedText text={card.front} query={searchQuery} />
                        </h3>
                      </div>

                      {/* Card Back (Definition) */}
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-[#8C7A6B] block mb-0.5">
                          Definição / Verso
                        </span>
                        <p className="text-xs text-[#57534E] dark:text-[#A8A29E] line-clamp-3 leading-relaxed">
                          <HighlightedText text={card.back} query={searchQuery} />
                        </p>
                      </div>
                    </div>

                    {/* Card Footer: Status & Action */}
                    <div className="pt-3 mt-4 border-t border-[#E7E2D9] dark:border-[#2C2C30] flex items-center justify-between text-xs text-[#78716C]">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            card.status === 'mastered'
                              ? 'bg-[#EAF5EE] dark:bg-[#1A3326] text-[#2D5A46] dark:text-[#52B788]'
                              : card.status === 'learning'
                              ? 'bg-[#FEF3C7] dark:bg-[#3D2E14] text-[#D97706] dark:text-[#FBBF24]'
                              : 'bg-[#EBF3EF] dark:bg-[#15221B] text-[#2D5A46]'
                          }`}
                        >
                          {card.status === 'mastered'
                            ? 'Dominado'
                            : card.status === 'learning'
                            ? 'Aprendendo'
                            : 'Novo'}
                        </span>
                      </div>

                      <span className="text-xs font-bold text-[#2D5A46] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        Abrir baralho <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center bg-[#FAF8F5] dark:bg-[#18181B] rounded-2xl border-2 border-[#E7E2D9] dark:border-[#2C2C30] space-y-3">
              <p className="text-sm font-semibold text-[#57534E] dark:text-[#D6D3CD]">
                Nenhum flashcard encontrado com o termo "{searchQuery}".
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 bg-[#EFECE6] dark:bg-[#242428] text-[#1C1917] dark:text-white rounded-xl text-xs font-semibold hover:bg-[#E5DFD5] transition-colors"
              >
                Limpar busca
              </button>
            </div>
          )}
        </div>
      ) : (
        /* VIEW B: DECKS GRID */
        <div className="space-y-6">
          {/* Deck Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {processedDecks.map((deck) => {
              const theme = COLOR_THEMES[deck.color] || COLOR_THEMES.indigo;
              const totalCards = deck.cards.length;
              const masteredCards = deck.cards.filter((c) => c.status === 'mastered').length;
              const masteryPercent =
                totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0;
              const dueCards = deck.cards.filter((c) => (c.dueDate || 0) <= now).length;
              const isMenuOpen = activeMenuDeckId === deck.id;

              // Check how many cards match the search query inside this deck
              const matchingCardsInDeck = searchQuery.trim()
                ? deck.cards.filter(
                    (c) =>
                      c.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      c.back.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (c.tag && c.tag.toLowerCase().includes(searchQuery.toLowerCase()))
                  ).length
                : 0;

              return (
                <div
                  key={deck.id}
                  id={`deck-card-${deck.id}`}
                  className={`rounded-2xl bg-[#FAF8F5] dark:bg-[#18181B] border-2 transition-all duration-200 flex flex-col justify-between overflow-hidden group cursor-pointer relative ${
                    dueCards > 0
                      ? 'border-[#F0C988] dark:border-[#6B5020] shadow-sm hover:shadow-md'
                      : 'border-[#E7E2D9] dark:border-[#2C2C30] hover:border-[#2D5A46] shadow-xs hover:shadow-md'
                  }`}
                  onClick={() => onSelectDeck(deck, searchQuery)}
                >
                  {/* PENDING REVIEW BADGE (Warm amber editorial bar) */}
                  {dueCards > 0 && (
                    <div className="bg-[#FEF3C7] dark:bg-[#3D2E14] text-[#92400E] dark:text-[#FBBF24] border-b border-[#FDE68A] dark:border-[#5E441D] px-4 py-1.5 flex items-center justify-between text-xs font-bold font-mono">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Revisão Pendente</span>
                      </div>
                      <span className="bg-[#FDE68A] dark:bg-[#5E441D] px-2 py-0.5 rounded-full text-[11px] font-black">
                        {dueCards} {dueCards === 1 ? 'card' : 'cards'}
                      </span>
                    </div>
                  )}

                  {/* Header color stripe / Icon */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div
                        className={`w-12 h-12 rounded-xl ${theme.bg} text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}
                      >
                        {renderDeckIcon(deck.icon, 'w-6 h-6')}
                      </div>

                      <div
                        className="flex items-center gap-1.5 relative"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Matching cards indicator badge if search is active */}
                        {matchingCardsInDeck > 0 && (
                          <span className="text-[10px] font-bold font-mono px-2.5 py-1 rounded-full bg-[#EBF3EF] dark:bg-[#15221B] text-[#2D5A46] border border-[#CFE1D6] dark:border-[#22392D]">
                            {matchingCardsInDeck} {matchingCardsInDeck === 1 ? 'encontrado' : 'encontrados'}
                          </span>
                        )}

                        <button
                          id={`btn-menu-${deck.id}`}
                          onClick={() => setActiveMenuDeckId(isMenuOpen ? null : deck.id)}
                          className="p-1.5 text-[#8C7A6B] hover:text-[#1C1917] dark:hover:text-white rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {isMenuOpen && (
                          <div className="absolute right-0 top-8 w-44 bg-white dark:bg-[#1E1E22] rounded-xl shadow-xl border-2 border-[#E7E2D9] dark:border-[#2C2C30] py-1.5 z-20 text-xs text-[#57534E] dark:text-[#D6D3CD] animate-in fade-in zoom-in-95 duration-100">
                            <button
                              onClick={() => {
                                setActiveMenuDeckId(null);
                                onEditDeck(deck);
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-[#FAF8F5] dark:hover:bg-[#25252A] flex items-center gap-2 font-medium"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-[#8C7A6B]" />
                              <span>Editar</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenuDeckId(null);
                                onDuplicateDeck(deck);
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-[#FAF8F5] dark:hover:bg-[#25252A] flex items-center gap-2 font-medium"
                            >
                              <Copy className="w-3.5 h-3.5 text-[#8C7A6B]" />
                              <span>Duplicar</span>
                            </button>
                            <div className="border-t border-[#E7E2D9] dark:border-[#2C2C30] my-1" />
                            <button
                              onClick={() => {
                                setActiveMenuDeckId(null);
                                onDeleteDeck(deck.id);
                              }}
                              className="w-full px-4 py-2 text-left text-[#A8423F] hover:bg-[#F9ECEB] dark:hover:bg-[#2C1818] flex items-center gap-2 font-medium"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Excluir</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-[#1C1917] dark:text-[#FAF9F5] font-['Fraunces',serif] group-hover:text-[#2D5A46] transition-colors leading-snug">
                      <HighlightedText text={deck.name} query={searchQuery} />
                    </h3>
                    <p className="text-xs text-[#78716C] dark:text-[#A8A29E] mt-1.5 line-clamp-2 leading-relaxed">
                      {deck.description ? (
                        <HighlightedText text={deck.description} query={searchQuery} />
                      ) : (
                        'Nenhuma descrição adicionada ainda.'
                      )}
                    </p>
                  </div>

                  {/* Progress & footer */}
                  <div className="p-6 pt-0 space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-[#78716C] dark:text-[#A8A29E]">
                        <span className="font-mono font-medium">
                          {totalCards} {totalCards === 1 ? 'card' : 'cards'}
                        </span>
                        <span className="font-mono font-bold text-[#2D5A46] dark:text-[#52B788]">
                          {masteryPercent}% dominado
                        </span>
                      </div>

                      <div className="w-full bg-[#E7E2D9] dark:bg-[#2C2C30] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#2D5A46] h-full rounded-full transition-all duration-300"
                          style={{ width: `${masteryPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-[#E7E2D9] dark:border-[#2C2C30] text-xs">
                      {dueCards > 0 ? (
                        <span className="font-mono font-bold text-[#D97706] dark:text-[#FBBF24] flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> Estudar agora
                        </span>
                      ) : (
                        <span className="text-[#8C7A6B] font-mono flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3 h-3 text-[#2D5A46]" /> Em dia
                        </span>
                      )}

                      <span className="font-bold text-[#2D5A46] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        Abrir baralho <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Create Deck placeholder card */}
            <button
              id="btn-create-deck-card"
              onClick={onNewDeck}
              className="rounded-2xl border-2 border-dashed border-[#D5CEBF] dark:border-[#38383E] hover:border-[#2D5A46] dark:hover:border-[#2D5A46] p-8 flex flex-col items-center justify-center text-center gap-3 text-[#78716C] dark:text-[#A8A29E] hover:text-[#2D5A46] dark:hover:text-[#2D5A46] transition-all group min-h-[240px] cursor-pointer bg-white/40 dark:bg-[#18181B]/40"
            >
              <div className="w-12 h-12 rounded-xl bg-[#EBF3EF] dark:bg-[#15221B] text-[#2D5A46] group-hover:scale-105 flex items-center justify-center transition-all">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <span className="font-bold text-base font-['Fraunces',serif] block text-[#1C1917] dark:text-[#FAF9F5] group-hover:text-[#2D5A46] transition-colors">
                  Criar Novo Baralho
                </span>
                <span className="text-xs text-[#8C7A6B] dark:text-[#A8A29E] block mt-1">
                  Personalize cores, ícones e adicione seus cards
                </span>
              </div>
            </button>
          </div>

          {/* Empty state when filtering or searching */}
          {processedDecks.length === 0 && (
            <div className="text-center py-12 bg-[#FAF8F5] dark:bg-[#18181B] rounded-2xl border-2 border-[#E7E2D9] dark:border-[#2C2C30] p-6 space-y-3">
              <p className="text-sm font-semibold text-[#57534E] dark:text-[#D6D3CD]">
                Nenhum baralho encontrado com os filtros selecionados.
              </p>
              <div className="flex items-center justify-center gap-2 pt-1">
                {filterDueOnly && (
                  <button
                    onClick={() => setFilterDueOnly(false)}
                    className="px-3.5 py-1.5 bg-[#EFECE6] dark:bg-[#25252A] text-[#1C1917] dark:text-white rounded-xl text-xs font-semibold hover:bg-[#E5DFD5] transition-colors"
                  >
                    Mostrar todos os baralhos
                  </button>
                )}
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-3.5 py-1.5 bg-[#2D5A46] text-white rounded-xl text-xs font-bold hover:bg-[#21483A] transition-colors"
                  >
                    Limpar pesquisa
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
