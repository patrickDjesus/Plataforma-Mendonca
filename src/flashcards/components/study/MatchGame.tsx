import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Zap, CheckCircle2, RotateCcw, Trophy } from 'lucide-react';
import { Flashcard, Deck } from '../../types';
import { soundFx } from '../../utils/sound';
import { COLOR_THEMES } from '../../utils/theme';

interface MatchGameProps {
  deck: Deck;
  cards: Flashcard[];
  onFinish: (studiedCount: number, correctCount: number) => void;
  onExit: () => void;
}

interface TileItem {
  id: string; // unique tile id
  cardId: string;
  text: string;
  type: 'front' | 'back';
}

export const MatchGame: React.FC<MatchGameProps> = ({
  deck,
  cards,
  onFinish,
  onExit,
}) => {
  // Take up to 6 cards (12 tiles total) per match round for optimal grid layout
  const gameCards = cards.slice(0, 6);

  const [tiles, setTiles] = useState<TileItem[]>([]);
  const [selectedTile, setSelectedTile] = useState<TileItem | null>(null);
  const [clearedCardIds, setClearedCardIds] = useState<string[]>([]);
  const [wrongTileIds, setWrongTileIds] = useState<string[]>([]);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [timerRunning, setTimerRunning] = useState(true);
  const [mismatches, setMismatches] = useState(0);

  const theme = COLOR_THEMES[deck.color] || COLOR_THEMES.indigo;

  // Initialize game board
  const setupGame = () => {
    const list: TileItem[] = [];
    gameCards.forEach((c) => {
      list.push({
        id: `f-${c.id}`,
        cardId: c.id,
        text: c.front,
        type: 'front',
      });
      list.push({
        id: `b-${c.id}`,
        cardId: c.id,
        text: c.back,
        type: 'back',
      });
    });

    // Shuffle tiles
    setTiles(list.sort(() => Math.random() - 0.5));
    setSelectedTile(null);
    setClearedCardIds([]);
    setWrongTileIds([]);
    setSecondsElapsed(0);
    setTimerRunning(true);
    setMismatches(0);
  };

  useEffect(() => {
    setupGame();
  }, [cards]);

  // Stopwatch timer
  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  // Handle tile click
  const handleTileClick = (tile: TileItem) => {
    // If already cleared or wrong animation active, ignore
    if (clearedCardIds.includes(tile.cardId) || wrongTileIds.length > 0) return;

    soundFx.playFlip();

    // If no tile selected yet
    if (!selectedTile) {
      setSelectedTile(tile);
      return;
    }

    // If clicked the exact same tile again, deselect
    if (selectedTile.id === tile.id) {
      setSelectedTile(null);
      return;
    }

    // Check match: must have same cardId and different types (one front, one back)
    if (selectedTile.cardId === tile.cardId && selectedTile.type !== tile.type) {
      // MATCH!
      soundFx.playCorrect();
      const nextCleared = [...clearedCardIds, tile.cardId];
      setClearedCardIds(nextCleared);
      setSelectedTile(null);

      // Check if all cleared
      if (nextCleared.length === gameCards.length) {
        setTimerRunning(false);
        soundFx.playVictory();
        setTimeout(() => {
          onFinish(gameCards.length, Math.max(1, gameCards.length - mismatches));
        }, 800);
      }
    } else {
      // MISMATCH
      soundFx.playWrong();
      setMismatches((prev) => prev + 1);
      setWrongTileIds([selectedTile.id, tile.id]);

      setTimeout(() => {
        setWrongTileIds([]);
        setSelectedTile(null);
      }, 700);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 flex flex-col items-center">
      {/* Top action bar */}
      <div className="w-full flex items-center justify-between gap-2 mb-6">
        <button
          id="btn-match-exit"
          onClick={onExit}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#FAF9F5] px-3 py-1.5 rounded-lg hover:bg-[#EFECE6] dark:hover:bg-[#232326] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Sair</span>
        </button>

        <div className="flex items-center gap-3">
          {/* Stopwatch */}
          <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-[#EBF3EF] dark:bg-[#15221B] text-[#224A38] dark:text-[#52B788] border border-[#C9DDD2] dark:border-[#33493F]">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTime(secondsElapsed)}</span>
          </div>

          <span className="text-xs font-bold text-[#78716C] dark:text-[#A8A29E]">
            {clearedCardIds.length} / {gameCards.length} pares
          </span>

          <button
            onClick={setupGame}
            title="Reiniciar jogo"
            className="p-1.5 text-[#78716C] hover:text-[#44403C] dark:hover:text-[#D6D3CD] rounded-lg hover:bg-[#EFECE6] dark:hover:bg-[#232326] transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Instruction banner */}
      <div className="w-full text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-[#1C1917] dark:text-[#FAF9F5] font-['Outfit',sans-serif]">
          Conecte os Pares
        </h2>
        <p className="text-xs text-[#78716C] dark:text-[#A8A29E] mt-1">
          Toque em um termo e na sua respectiva definição para eliminá-los o mais rápido possível!
        </p>
      </div>

      {/* Tiles Grid */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
        {tiles.map((tile) => {
          const isCleared = clearedCardIds.includes(tile.cardId);
          const isSelected = selectedTile?.id === tile.id;
          const isWrong = wrongTileIds.includes(tile.id);

          let tileClass =
            'bg-white dark:bg-[#232326] border-[#E7E2D9] dark:border-[#2C2C30] text-[#1C1917] dark:text-[#E7E5E4] hover:border-[#2D5A46] hover:scale-102';

          if (isCleared) {
            tileClass =
              'opacity-0 pointer-events-none scale-90 transition-all duration-500';
          } else if (isWrong) {
            tileClass =
              'bg-rose-100 dark:bg-rose-950/70 border-rose-500 text-rose-900 dark:text-rose-200 ring-2 ring-rose-400 animate-shake';
          } else if (isSelected) {
            tileClass =
              'bg-[#EBF3EF] dark:bg-[#15221B] border-[#2D5A46] text-[#224A38] dark:text-[#52B788] ring-2 ring-[#2D5A46] scale-103 shadow-md';
          }

          return (
            <button
              key={tile.id}
              onClick={() => handleTileClick(tile)}
              disabled={isCleared}
              className={`min-h-[110px] sm:min-h-[130px] p-4 rounded-2xl border text-center flex items-center justify-center font-medium text-xs sm:text-sm leading-relaxed transition-all duration-200 select-none shadow-xs ${tileClass}`}
            >
              <span className="line-clamp-4">{tile.text}</span>
            </button>
          );
        })}
      </div>

      {/* Completion message */}
      {clearedCardIds.length === gameCards.length && (
        <div className="p-6 text-center bg-emerald-50 dark:bg-emerald-950/50 rounded-2xl border border-emerald-300 dark:border-emerald-800 animate-in zoom-in-95 duration-200">
          <Trophy className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-200">
            Parabéns! Todos os pares conectados!
          </h3>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
            Tempo: {formatTime(secondsElapsed)} • Erros: {mismatches}
          </p>
        </div>
      )}
    </div>
  );
};
