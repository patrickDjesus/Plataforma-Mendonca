import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Upload,
  Search,
  Filter,
  Star,
  Edit2,
  Trash2,
  Copy,
  Layers,
  Brain,
  HelpCircle,
  PenTool,
  Grid,
  Download,
  Share2,
  MoreVertical,
  Volume2,
  Sparkles,
  CheckCircle2,
  Clock,
  Shuffle,
} from 'lucide-react';
import { Deck, Flashcard, StudyFocus } from '../types';
import { COLOR_THEMES, renderDeckIcon } from '../utils/theme';
import { soundFx } from '../utils/sound';
import { DeckStatusChart } from './DeckStatusChart';
import { isHardCard, countHardCards } from '../utils/studyFilter';

interface DeckDetailProps {
  deck: Deck;
  initialSearch?: string;
  onBack: () => void;
  onStartStudy: (focus: StudyFocus) => void;
  onAddCard: () => void;
  onEditCard: (card: Flashcard) => void;
  onDuplicateCard: (card: Flashcard) => void;
  onDeleteCard: (cardId: string) => void;
  onToggleStarCard: (cardId: string) => void;
  onOpenBatchImport: () => void;
  onEditDeck: () => void;
  onDeleteDeck: () => void;
  onDuplicateDeck: () => void;
}

export const DeckDetail: React.FC<DeckDetailProps> = ({
  deck,
  initialSearch,
  onBack,
  onStartStudy,
  onAddCard,
  onEditCard,
  onDuplicateCard,
  onDeleteCard,
  onToggleStarCard,
  onOpenBatchImport,
  onEditDeck,
  onDeleteDeck,
  onDuplicateDeck,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  const [filterType, setFilterType] = useState<'all' | 'starred' | 'difficult' | 'mastered'>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [showDeckMenu, setShowDeckMenu] = useState(false);
  const [studyFocus, setStudyFocus] = useState<StudyFocus>('all');

  const theme = COLOR_THEMES[deck.color] || COLOR_THEMES.indigo;

  // Deck metrics
  const totalCards = deck.cards.length;
  const masteredCards = deck.cards.filter((c) => c.status === 'mastered').length;
  const reviewedCards = deck.cards.filter(
    (c) => c.status !== 'new' || (c.correctCount || 0) > 0
  ).length;
  const inProgressCards = deck.cards.filter(
    (c) => c.status === 'learning' || c.status === 'review'
  ).length;
  const starredCount = deck.cards.filter((c) => c.starred).length;
  const hardCount = countHardCards(deck.cards);

  const now = Date.now();
  const dueTodayCount = deck.cards.filter((c) => (c.dueDate || 0) <= now).length;

  // Extract unique tags
  const tags = useMemo(() => {
    const list = deck.cards
      .map((c) => c.tag)
      .filter((t): t is string => Boolean(t && t.trim().length > 0));
    return Array.from(new Set(list));
  }, [deck.cards]);

  // Filtered cards
  const filteredCards = useMemo(() => {
    return deck.cards.filter((c) => {
      // Search
      const matchesSearch =
        c.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.back.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.tag && c.tag.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // Tag filter
      if (selectedTag !== 'all' && c.tag !== selectedTag) return false;

      // Status/Type filter
      if (filterType === 'starred' && !c.starred) return false;
      if (filterType === 'difficult' && !isHardCard(c)) return false;
      if (filterType === 'mastered' && c.status !== 'mastered') return false;

      return true;
    });
  }, [deck.cards, searchQuery, selectedTag, filterType]);

  // Export deck to JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(deck, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${deck.name.replace(/\s+/g, '_').toLowerCase()}_flashcards.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const masteryPercent = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0;
  const answeredPercent = totalCards > 0 ? Math.round((reviewedCards / totalCards) * 100) : 0;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Deck Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          id="btn-deck-back"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#57534E] dark:text-[#D6D3CD] hover:text-[#2D5A46] px-3.5 py-2 rounded-xl border border-[#E7E2D9] dark:border-[#2C2C30] bg-white dark:bg-[#18181B] hover:border-[#2D5A46] transition-colors w-fit shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar aos Baralhos</span>
        </button>

        <div className="flex items-center gap-2 relative">
          <button
            id="btn-deck-import-batch"
            onClick={onOpenBatchImport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-2 border-[#E7E2D9] dark:border-[#2C2C30] bg-white dark:bg-[#18181B] text-[#57534E] dark:text-[#D6D3CD] text-xs font-bold hover:border-[#2D5A46] transition-colors shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Importar em Lote</span>
          </button>

          <button
            id="btn-deck-new-card"
            onClick={onAddCard}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2D5A46] hover:bg-[#21483A] text-white text-xs font-bold shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Card</span>
          </button>

          {/* More options menu */}
          <div className="relative">
            <button
              id="btn-deck-options-dropdown"
              onClick={() => setShowDeckMenu(!showDeckMenu)}
              className="p-2 rounded-xl border-2 border-[#E7E2D9] dark:border-[#2C2C30] bg-white dark:bg-[#18181B] text-[#57534E] dark:text-[#D6D3CD] hover:border-[#2D5A46] transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showDeckMenu && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1E1E22] rounded-xl shadow-xl border-2 border-[#E7E2D9] dark:border-[#2C2C30] py-1.5 z-20 text-xs text-[#57534E] dark:text-[#D6D3CD]"
                onClick={() => setShowDeckMenu(false)}
              >
                <button
                  id="btn-menu-edit-deck"
                  onClick={onEditDeck}
                  className="w-full px-4 py-2 text-left hover:bg-[#FAF8F5] dark:hover:bg-[#25252A] flex items-center gap-2 font-medium"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#8C7A6B]" />
                  <span>Editar Baralho</span>
                </button>
                <button
                  id="btn-menu-duplicate-deck"
                  onClick={onDuplicateDeck}
                  className="w-full px-4 py-2 text-left hover:bg-[#FAF8F5] dark:hover:bg-[#25252A] flex items-center gap-2 font-medium"
                >
                  <Copy className="w-3.5 h-3.5 text-[#8C7A6B]" />
                  <span>Duplicar Baralho</span>
                </button>
                <button
                  id="btn-menu-export-deck"
                  onClick={handleExportJSON}
                  className="w-full px-4 py-2 text-left hover:bg-[#FAF8F5] dark:hover:bg-[#25252A] flex items-center gap-2 font-medium"
                >
                  <Download className="w-3.5 h-3.5 text-[#8C7A6B]" />
                  <span>Exportar JSON</span>
                </button>
                <div className="border-t border-[#E7E2D9] dark:border-[#2C2C30] my-1" />
                <button
                  id="btn-menu-delete-deck"
                  onClick={onDeleteDeck}
                  className="w-full px-4 py-2 text-left text-[#A8423F] hover:bg-[#F9ECEB] dark:hover:bg-[#2C1818] flex items-center gap-2 font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir Baralho</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Deck Hero Card */}
      <div className={`p-6 sm:p-8 rounded-2xl border-2 ${theme.border} ${theme.lightBg} shadow-xs relative overflow-hidden`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-xl ${theme.bg} text-white flex items-center justify-center shadow-sm shrink-0`}>
              {renderDeckIcon(deck.icon, 'w-7 h-7')}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-[#1C1917] dark:text-[#FAF9F5] font-['Fraunces',serif] tracking-tight">
                  {deck.name}
                </h1>
                <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${theme.badge}`}>
                  {totalCards} {totalCards === 1 ? 'card' : 'cards'}
                </span>
              </div>
              <p className="text-sm text-[#57534E] dark:text-[#A8A29E] mt-1.5 max-w-2xl leading-relaxed">
                {deck.description || 'Baralho pronto para você praticar e acelerar seu aprendizado.'}
              </p>
            </div>
          </div>

          {/* Quick Mastery & Due Metrics */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3.5 rounded-xl bg-white/90 dark:bg-[#18181B]/90 border-2 border-[#E7E2D9] dark:border-[#2C2C30] text-center min-w-[100px]">
              <span className="text-[10px] font-mono font-bold text-[#2D5A46] dark:text-[#52B788] uppercase tracking-wider block">
                Respondidos
              </span>
              <span className="text-xl font-bold text-[#2D5A46] dark:text-[#52B788] font-mono">
                {answeredPercent}%
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/90 dark:bg-[#18181B]/90 border-2 border-[#E7E2D9] dark:border-[#2C2C30] text-center min-w-[100px]">
              <span className="text-[10px] font-mono font-bold text-[#8C7A6B] uppercase tracking-wider block">
                Dominados
              </span>
              <span className="text-xl font-bold text-[#2D5A46] dark:text-[#52B788] font-mono">
                {masteryPercent}%
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/90 dark:bg-[#18181B]/90 border-2 border-[#E7E2D9] dark:border-[#2C2C30] text-center min-w-[100px]">
              <span className="text-[10px] font-mono font-bold text-[#8C7A6B] uppercase tracking-wider block">
                Para Revisar
              </span>
              <span className="text-xl font-bold text-[#D97706] dark:text-[#FBBF24] font-mono">
                {dueTodayCount}
              </span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6 w-full bg-[#E7E2D9] dark:bg-[#2C2C30] h-2.5 rounded-full overflow-hidden flex">
          <div
            className="bg-[#2D5A46] transition-all duration-300"
            style={{ width: `${totalCards ? (masteredCards / totalCards) * 100 : 0}%` }}
            title={`Dominados: ${masteredCards}`}
          />
          <div
            className="bg-[#D97706] transition-all duration-300"
            style={{ width: `${totalCards ? (inProgressCards / totalCards) * 100 : 0}%` }}
            title={`Em aprendizado: ${inProgressCards}`}
          />
        </div>
      </div>

      {/* Repetição Espaçada — Ação Principal de Estudo */}
      <div
        id="unified-study-action-card"
        className="p-6 sm:p-8 rounded-3xl bg-[#FAF8F5] dark:bg-[#1A1A1D] border-2 border-[#E7E2D9] dark:border-[#2C2C30] shadow-[0_6px_24px_rgba(0,0,0,0.04)] relative overflow-hidden"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#EAF5EE] dark:bg-[#1A3326] text-[#2D5A46] dark:text-[#52B788] border border-[#C5E4D1] dark:border-[#24533A]">
                Repetição Espaçada
              </span>
              {dueTodayCount > 0 && (
                <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#FEF3C7] dark:bg-[#3D2E14] text-[#D97706] dark:text-[#FBBF24]">
                  {dueTodayCount} para revisar hoje
                </span>
              )}
              {hardCount > 0 && (
                <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#F9ECEB] dark:bg-[#2C1818] text-[#A8423F] dark:text-[#F87171]">
                  {hardCount} difícil/não sei
                </span>
              )}
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black font-['Fraunces',serif] text-[#1C1917] dark:text-[#FAF9F5] leading-snug">
                Estudo com Repetição Espaçada
              </h2>
              <p className="text-xs sm:text-sm text-[#78716C] dark:text-[#A8A29E] mt-1 leading-relaxed">
                Classifique cada cartão em 4 níveis: <strong className="text-[#1C1917] dark:text-[#FAF9F5]">Não sei</strong>,{' '}
                <strong className="text-[#1C1917] dark:text-[#FAF9F5]">Muito difícil</strong>,{' '}
                <strong className="text-[#1C1917] dark:text-[#FAF9F5]">Razoável</strong> e{' '}
                <strong className="text-[#1C1917] dark:text-[#FAF9F5]">Fácil</strong>. Os mais difíceis reaparecem
                com mais frequência, e o baralho é reagendado para revisão em ~3 dias para refrescar a memória.
              </p>
            </div>

            {/* Filtro de foco do estudo */}
            <div className="pt-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8C7A6B] dark:text-[#A8A29E] block mb-1.5">
                O que estudar agora?
              </span>
              <div className="flex flex-wrap gap-1.5 p-1 bg-[#EFECE6] dark:bg-[#202024] rounded-xl text-xs font-semibold w-fit">
                <button
                  onClick={() => setStudyFocus('all')}
                  className={`px-3.5 py-2 rounded-lg font-medium transition-all ${
                    studyFocus === 'all'
                      ? 'bg-white dark:bg-[#161618] text-[#1C1917] dark:text-white shadow-xs'
                      : 'text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C1917]'
                  }`}
                >
                  Baralho completo ({totalCards})
                </button>
                <button
                  onClick={() => setStudyFocus('hard')}
                  className={`px-3.5 py-2 rounded-lg font-medium transition-all ${
                    studyFocus === 'hard'
                      ? 'bg-white dark:bg-[#161618] text-[#A8423F] dark:text-[#F87171] shadow-xs'
                      : 'text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C1917]'
                  }`}
                >
                  Difíceis e "não sei" ({hardCount})
                </button>
              </div>
            </div>
          </div>

          {/* Big Action CTA */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-center justify-center gap-3 lg:border-l lg:border-[#E7E2D9] dark:lg:border-[#2C2C30] lg:pl-8 shrink-0">
            <button
              id="btn-start-study-session"
              onClick={() => onStartStudy(studyFocus)}
              disabled={totalCards === 0 || (studyFocus === 'hard' && hardCount === 0)}
              className="w-full sm:w-auto lg:w-full flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-[#2D5A46] hover:bg-[#21483A] disabled:opacity-40 disabled:pointer-events-none text-white text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer group"
            >
              <span>{studyFocus === 'hard' ? 'Estudar Difíceis' : 'Começar a Estudar'}</span>
              <span className="font-mono text-xs opacity-90">
                ({studyFocus === 'hard' ? hardCount : totalCards} {studyFocus === 'hard' && hardCount === 1 ? 'carta' : totalCards === 1 ? 'carta' : 'cartas'})
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {totalCards === 0 && (
              <span className="text-[11px] text-[#A8A29E] text-center">
                Cadastre pelo menos 1 cartão abaixo para iniciar
              </span>
            )}
            {totalCards > 0 && studyFocus === 'hard' && hardCount === 0 && (
              <span className="text-[11px] text-[#A8A29E] text-center">
                Nenhum cartão difícil por enquanto — estude o baralho completo.
              </span>
            )}
            {totalCards > 0 && (
              <span className="text-[11px] text-[#8C7A6B] dark:text-[#A8A29E] text-center max-w-[220px]">
                "Não sei" mantém o cartão na sessão até acertar; "Fácil" tira da categoria difícil.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Donut Chart: Card Status Distribution (Recharts) */}
      <DeckStatusChart cards={deck.cards} />

      {/* Cards Management Section */}
      <div className="space-y-4">
        {/* Search & Filter Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-4 border-t border-[#E7E2D9] dark:border-[#2C2C30]">
          <div className="flex items-center gap-2 flex-1 max-w-md relative">
            <Search className="w-4 h-4 text-[#8C7A6B] absolute left-3.5 pointer-events-none" />
            <input
              id="input-search-deck-cards"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar termo ou definição no baralho..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-[#E7E2D9] dark:border-[#2C2C30] bg-white dark:bg-[#18181B] text-[#1C1917] dark:text-[#FAF9F5] placeholder-[#A8A29E] text-xs focus:outline-none focus:border-[#2D5A46] transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter pills */}
            <div className="flex items-center gap-1 p-1 bg-[#EFECE6] dark:bg-[#202024] rounded-xl text-xs font-semibold">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  filterType === 'all'
                    ? 'bg-white dark:bg-[#161618] text-[#1C1917] dark:text-white shadow-xs'
                    : 'text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C1917]'
                }`}
              >
                Todos ({totalCards})
              </button>
              <button
                onClick={() => setFilterType('starred')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 ${
                  filterType === 'starred'
                    ? 'bg-white dark:bg-[#161618] text-[#D97706] shadow-xs'
                    : 'text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C1917]'
                }`}
              >
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                Favoritos ({starredCount})
              </button>
              <button
                onClick={() => setFilterType('difficult')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  filterType === 'difficult'
                    ? 'bg-white dark:bg-[#161618] text-[#A8423F] shadow-xs'
                    : 'text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C1917]'
                }`}
              >
                Desafiadores ({hardCount})
              </button>
            </div>

            {/* Tag selector */}
            {tags.length > 0 && (
              <select
                id="select-tag-filter"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="px-3 py-2 rounded-xl border-2 border-[#E7E2D9] dark:border-[#2C2C30] bg-white dark:bg-[#18181B] text-[#1C1917] dark:text-[#FAF9F5] text-xs font-medium focus:outline-none focus:border-[#2D5A46]"
              >
                <option value="all">Todas as Tags</option>
                {tags.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Cards List / Table */}
        {filteredCards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredCards.map((card, idx) => (
              <div
                key={card.id}
                className="p-5 rounded-2xl bg-[#FAF8F5] dark:bg-[#18181B] border-2 border-[#E7E2D9] dark:border-[#2C2C30] shadow-xs hover:border-[#2D5A46] transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EFECE6] dark:bg-[#252529] text-[#78716C] dark:text-[#A8A29E] font-mono">
                        #{idx + 1}
                      </span>
                      {card.tag && (
                        <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#EBF3EF] dark:bg-[#15221B] text-[#2D5A46]">
                          {card.tag}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          card.difficulty === 'easy'
                            ? 'bg-[#EAF5EE] dark:bg-[#1A3326] text-[#2D5A46] dark:text-[#52B788]'
                            : card.difficulty === 'medium'
                            ? 'bg-[#FEF3C7] dark:bg-[#3D2E14] text-[#D97706] dark:text-[#FBBF24]'
                            : 'bg-[#F9ECEB] dark:bg-[#2C1818] text-[#A8423F]'
                        }`}
                      >
                        {card.difficulty === 'easy' ? 'Fácil' : card.difficulty === 'medium' ? 'Médio' : 'Difícil'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => soundFx.speak(card.front)}
                        title="Ouvir termo"
                        className="p-1.5 text-[#8C7A6B] hover:text-[#1C1917] dark:hover:text-white rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onToggleStarCard(card.id)}
                        title={card.starred ? 'Favorito' : 'Marcar favorito'}
                        className={`p-1.5 rounded-lg transition-colors ${
                          card.starred
                            ? 'text-amber-500'
                            : 'text-[#8C7A6B] hover:text-amber-500'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${card.starred ? 'fill-amber-500' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-base font-bold text-[#1C1917] dark:text-[#FAF9F5] font-['Fraunces',serif] mb-2 leading-snug">
                    {card.front}
                  </h4>
                  <p className="text-xs text-[#57534E] dark:text-[#A8A29E] leading-relaxed">
                    {card.back}
                  </p>
                  {card.acceptedAnswers && card.acceptedAnswers.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-dashed border-[#E7E2D9] dark:border-[#2C2C30]">
                      <span className="text-[10px] font-mono text-[#8C7A6B] dark:text-[#A8A29E] block mb-1">
                        Formatos alternativos aceitos:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {card.acceptedAnswers.map((ans, aIdx) => (
                          <span
                            key={aIdx}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-[#EBF3EF] dark:bg-[#1D2B24] text-[#2D5A46] dark:text-[#52B788] border border-[#CFE1D6] dark:border-[#2B4637] font-mono"
                          >
                            {ans}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card footer metrics & actions */}
                <div className="flex items-center justify-between pt-4 mt-3 border-t border-[#E7E2D9] dark:border-[#2C2C30] text-[11px] text-[#78716C] font-mono">
                  <div className="flex items-center gap-2">
                    <span>
                      Repetições: <strong>{card.repetition}</strong>
                    </span>
                    {(card.errorCount || 0) > 0 && (
                      <span className="text-[#A8423F] font-bold">
                        {card.errorCount} erros
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditCard(card)}
                      title="Editar cartão"
                      className="p-1.5 text-[#78716C] hover:text-[#2D5A46] rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDuplicateCard(card)}
                      title="Duplicar cartão"
                      className="p-1.5 text-[#78716C] hover:text-[#2D5A46] rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteCard(card.id)}
                      title="Excluir cartão"
                      className="p-1.5 text-[#78716C] hover:text-[#A8423F] rounded-lg hover:bg-[#F9ECEB] dark:hover:bg-[#2C1818] transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-[#FAF8F5] dark:bg-[#18181B] rounded-2xl border-2 border-[#E7E2D9] dark:border-[#2C2C30] p-6 space-y-3">
            <p className="text-sm font-semibold text-[#57534E] dark:text-[#D6D3CD]">
              {searchQuery || filterType !== 'all' || selectedTag !== 'all'
                ? 'Nenhum flashcard encontrado com os filtros atuais.'
                : 'Este baralho ainda não possui flashcards.'}
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={onAddCard}
                className="px-4 py-2 bg-[#2D5A46] text-white rounded-xl text-xs font-bold hover:bg-[#21483A] transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Criar Primeiro Cartão</span>
              </button>
              <button
                onClick={onOpenBatchImport}
                className="px-4 py-2 border-2 border-[#E7E2D9] dark:border-[#2C2C30] text-[#1C1917] dark:text-white rounded-xl text-xs font-bold hover:border-[#2D5A46] transition-colors bg-white dark:bg-[#18181B]"
              >
                Importar em Lote
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
