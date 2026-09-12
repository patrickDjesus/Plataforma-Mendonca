import React, { useState, useEffect } from 'react';
import {
  Deck,
  Flashcard,
  UserStats,
  StudyMode,
  DifficultyLevel,
  DeckColor,
} from './types';
import {
  loadStoredDecks,
  saveStoredDecks,
  loadStoredStats,
  saveStoredStats,
  loadSoundSetting,
  saveSoundSetting,
  loadThemeSetting,
  saveThemeSetting,
  recordStudySession,
} from './utils/storage';
import { calculateSM2, SM2Rating } from './utils/sm2';
import { soundFx } from './utils/sound';
import { Navbar } from './components/Navbar';
import { DeckList } from './components/DeckList';
import { DeckDetail } from './components/DeckDetail';
import { DeckModal } from './components/DeckModal';
import { CardModal } from './components/CardModal';
import { BatchImportModal } from './components/BatchImportModal';
import { StatsModal } from './components/StatsModal';
import { SessionSummaryModal } from './components/SessionSummaryModal';
import { UnifiedStudySession } from './components/study/UnifiedStudySession';

import { ClassicStudy } from './components/study/ClassicStudy';
import { SpacedRepetitionStudy } from './components/study/SpacedRepetitionStudy';
import { QuizStudy } from './components/study/QuizStudy';
import { WriteStudy } from './components/study/WriteStudy';
import { MatchGame } from './components/study/MatchGame';

export default function App() {
  // Persistence state
  const [decks, setDecks] = useState<Deck[]>(() => loadStoredDecks());
  const [stats, setStats] = useState<UserStats>(() => loadStoredStats());
  const [isDark, setIsDark] = useState<boolean>(() => loadThemeSetting());
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const s = loadSoundSetting();
    soundFx.enabled = s;
    return s;
  });

  // Navigation & Active View state
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  const [activeStudyMode, setActiveStudyMode] = useState<StudyMode | null>(null);
  const [deckInitialSearch, setDeckInitialSearch] = useState<string | undefined>(undefined);

  // Modals
  const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);

  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);

  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  // Session summary celebration
  const [sessionSummary, setSessionSummary] = useState<{
    isOpen: boolean;
    totalCards: number;
    correctCount: number;
    modeName: string;
    deckName: string;
  } | null>(null);

  // Sync theme with HTML class
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveThemeSetting(isDark);
  }, [isDark]);

  // Persist decks
  useEffect(() => {
    saveStoredDecks(decks);
  }, [decks]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundFx.enabled = next;
    saveSoundSetting(next);
  };

  const activeDeck = decks.find((d) => d.id === activeDeckId) || null;

  // Deck CRUD
  const handleSaveDeck = (data: { name: string; description: string; color: DeckColor; icon: string }) => {
    if (editingDeck) {
      // Update
      setDecks((prev) =>
        prev.map((d) => (d.id === editingDeck.id ? { ...d, ...data } : d))
      );
    } else {
      // Create new
      const newDeck: Deck = {
        id: `deck-${Date.now()}`,
        name: data.name,
        description: data.description,
        color: data.color,
        icon: data.icon,
        cards: [],
        createdAt: Date.now(),
      };
      setDecks((prev) => [newDeck, ...prev]);
      setActiveDeckId(newDeck.id);
    }
  };

  const handleDuplicateDeck = (deckToDup: Deck) => {
    const duplicatedCards: Flashcard[] = deckToDup.cards.map((c) => ({
      ...c,
      id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      createdAt: Date.now(),
      repetition: 0,
      interval: 1,
      easeFactor: 2.5,
      dueDate: Date.now(),
      status: 'new',
      errorCount: 0,
      correctCount: 0,
    }));

    const duplicated: Deck = {
      ...deckToDup,
      id: `deck-${Date.now()}`,
      name: `${deckToDup.name} (Cópia)`,
      cards: duplicatedCards,
      createdAt: Date.now(),
    };

    setDecks((prev) => [duplicated, ...prev]);
  };

  const handleDeleteDeck = (deckId: string) => {
    if (confirm('Tem certeza de que deseja excluir este baralho e todos os seus cards?')) {
      setDecks((prev) => prev.filter((d) => d.id !== deckId));
      if (activeDeckId === deckId) {
        setActiveDeckId(null);
        setActiveStudyMode(null);
      }
    }
  };

  // Card CRUD
  const handleSaveCard = (data: {
    front: string;
    back: string;
    tag?: string;
    difficulty: DifficultyLevel;
    starred: boolean;
  }) => {
    if (!activeDeckId) return;

    if (editingCard) {
      // Update card
      setDecks((prev) =>
        prev.map((d) => {
          if (d.id !== activeDeckId) return d;
          return {
            ...d,
            cards: d.cards.map((c) =>
              c.id === editingCard.id
                ? {
                    ...c,
                    front: data.front,
                    back: data.back,
                    tag: data.tag,
                    difficulty: data.difficulty,
                    starred: data.starred,
                  }
                : c
            ),
          };
        })
      );
    } else {
      // Add card
      const newCard: Flashcard = {
        id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        front: data.front,
        back: data.back,
        tag: data.tag,
        difficulty: data.difficulty,
        starred: data.starred,
        createdAt: Date.now(),
        repetition: 0,
        interval: 1,
        easeFactor: 2.5,
        dueDate: Date.now(),
        status: 'new',
        errorCount: 0,
        correctCount: 0,
      };

      setDecks((prev) =>
        prev.map((d) => {
          if (d.id !== activeDeckId) return d;
          return { ...d, cards: [newCard, ...d.cards] };
        })
      );
    }
  };

  const handleDuplicateCard = (card: Flashcard) => {
    if (!activeDeckId) return;
    const duplicated: Flashcard = {
      ...card,
      id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      createdAt: Date.now(),
      front: `${card.front} (Cópia)`,
    };

    setDecks((prev) =>
      prev.map((d) => {
        if (d.id !== activeDeckId) return d;
        return { ...d, cards: [duplicated, ...d.cards] };
      })
    );
  };

  const handleDeleteCard = (cardId: string) => {
    if (!activeDeckId) return;
    setDecks((prev) =>
      prev.map((d) => {
        if (d.id !== activeDeckId) return d;
        return { ...d, cards: d.cards.filter((c) => c.id !== cardId) };
      })
    );
  };

  const handleToggleStarCard = (cardId: string) => {
    if (!activeDeckId) return;
    setDecks((prev) =>
      prev.map((d) => {
        if (d.id !== activeDeckId) return d;
        return {
          ...d,
          cards: d.cards.map((c) => (c.id === cardId ? { ...c, starred: !c.starred } : c)),
        };
      })
    );
  };

  // Batch import
  const handleBatchImport = (importedCards: Partial<Flashcard>[]) => {
    if (!activeDeckId) return;
    const fullCards: Flashcard[] = importedCards.map((c) => ({
      id: c.id || `card-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      front: c.front || '',
      back: c.back || '',
      tag: c.tag,
      difficulty: c.difficulty || 'medium',
      starred: false,
      createdAt: Date.now(),
      repetition: 0,
      interval: 1,
      easeFactor: 2.5,
      dueDate: Date.now(),
      status: 'new',
      errorCount: 0,
      correctCount: 0,
    }));

    setDecks((prev) =>
      prev.map((d) => {
        if (d.id !== activeDeckId) return d;
        return { ...d, cards: [...fullCards, ...d.cards] };
      })
    );
  };

  // SM-2 rating handler
  const handleRateCardSM2 = (cardId: string, rating: SM2Rating) => {
    if (!activeDeckId) return;

    setDecks((prev) =>
      prev.map((d) => {
        if (d.id !== activeDeckId) return d;
        return {
          ...d,
          cards: d.cards.map((c) => {
            if (c.id !== cardId) return c;
            const sm2 = calculateSM2(c, rating);
            const isError = rating < 3;
            return {
              ...c,
              repetition: sm2.repetition,
              interval: sm2.interval,
              easeFactor: sm2.easeFactor,
              dueDate: sm2.dueDate,
              status: sm2.status,
              errorCount: isError ? (c.errorCount || 0) + 1 : (c.errorCount || 0),
              correctCount: !isError ? (c.correctCount || 0) + 1 : (c.correctCount || 0),
              reviewHistory: [
                ...(c.reviewHistory || []),
                { timestamp: Date.now(), rating, mode: 'spaced' },
              ],
            };
          }),
        };
      })
    );
  };

  // Update accepted alternative answers for a flashcard and persist
  const handleUpdateCardAcceptedAnswer = (cardId: string, newAnswer: string) => {
    if (!activeDeckId || !newAnswer.trim()) return;
    const trimmed = newAnswer.trim();

    setDecks((prev) =>
      prev.map((d) => {
        if (d.id !== activeDeckId) return d;
        return {
          ...d,
          cards: d.cards.map((c) => {
            if (c.id !== cardId) return c;
            const currentList = c.acceptedAnswers || [];
            if (currentList.some((a) => a.toLowerCase() === trimmed.toLowerCase())) {
              return c;
            }
            return {
              ...c,
              acceptedAnswers: [...currentList, trimmed],
            };
          }),
        };
      })
    );
  };

  // Finish study session
  const handleFinishStudySession = (studiedCount: number, correctCount: number) => {
    if (!activeDeck) return;

    // Record stats
    const newStats = recordStudySession(studiedCount, correctCount);
    setStats(newStats);

    const modeLabels: Record<StudyMode, string> = {
      unified: 'Estudo Ativo em 2 Fases',
      classic: 'Flashcard Clássico',
      spaced: 'Repetição Espaçada',
      quiz: 'Quiz',
      write: 'Escrita',
      match: 'Jogo da Memória',
    };

    setSessionSummary({
      isOpen: true,
      totalCards: studiedCount,
      correctCount,
      modeName: activeStudyMode ? modeLabels[activeStudyMode] : 'Estudo',
      deckName: activeDeck.name,
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#121214] text-[#1C1917] dark:text-[#FAF9F5] flex flex-col transition-colors selection:bg-[#2D5A46] selection:text-white">
      <Navbar
        stats={stats}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        onOpenStats={() => setIsStatsModalOpen(true)}
        onNewDeck={() => {
          setEditingDeck(null);
          setIsDeckModalOpen(true);
        }}
        onGoHome={() => {
          setActiveDeckId(null);
          setActiveStudyMode(null);
        }}
        hasActiveDeck={!!activeDeckId}
      />

      <main className="flex-1 pb-16">
        {/* VIEW 1: Study Mode in progress */}
        {activeDeck && activeStudyMode ? (
          <div className="w-full animate-in fade-in duration-150">
            <UnifiedStudySession
              deck={activeDeck}
              cards={activeDeck.cards}
              onUpdateCardAcceptedAnswer={handleUpdateCardAcceptedAnswer}
              onFinish={({ totalCards, correctCount }) => {
                handleFinishStudySession(totalCards, correctCount);
              }}
              onExit={() => setActiveStudyMode(null)}
            />
          </div>
        ) : activeDeck ? (
          /* VIEW 2: Deck Detail & Cards Manager */
          <DeckDetail
            deck={activeDeck}
            initialSearch={deckInitialSearch}
            onBack={() => {
              setActiveDeckId(null);
              setDeckInitialSearch(undefined);
            }}
            onStartStudy={() => setActiveStudyMode('unified')}
            onAddCard={() => {
              setEditingCard(null);
              setIsCardModalOpen(true);
            }}
            onEditCard={(card) => {
              setEditingCard(card);
              setIsCardModalOpen(true);
            }}
            onDuplicateCard={handleDuplicateCard}
            onDeleteCard={handleDeleteCard}
            onToggleStarCard={handleToggleStarCard}
            onOpenBatchImport={() => setIsBatchModalOpen(true)}
            onEditDeck={() => {
              setEditingDeck(activeDeck);
              setIsDeckModalOpen(true);
            }}
            onDeleteDeck={() => handleDeleteDeck(activeDeck.id)}
            onDuplicateDeck={() => handleDuplicateDeck(activeDeck)}
          />
        ) : (
          /* VIEW 3: Deck Collection Home */
          <DeckList
            decks={decks}
            stats={stats}
            onSelectDeck={(d, initialSearch) => {
              setActiveDeckId(d.id);
              setDeckInitialSearch(initialSearch);
            }}
            onNewDeck={() => {
              setEditingDeck(null);
              setIsDeckModalOpen(true);
            }}
            onEditDeck={(d) => {
              setEditingDeck(d);
              setIsDeckModalOpen(true);
            }}
            onDuplicateDeck={handleDuplicateDeck}
            onDeleteDeck={handleDeleteDeck}
            onOpenStats={() => setIsStatsModalOpen(true)}
          />
        )}
      </main>

      {/* MODALS */}
      <DeckModal
        isOpen={isDeckModalOpen}
        onClose={() => {
          setIsDeckModalOpen(false);
          setEditingDeck(null);
        }}
        onSave={handleSaveDeck}
        initialDeck={editingDeck}
      />

      <CardModal
        isOpen={isCardModalOpen}
        onClose={() => {
          setIsCardModalOpen(false);
          setEditingCard(null);
        }}
        onSave={handleSaveCard}
        initialCard={editingCard}
      />

      {activeDeck && (
        <BatchImportModal
          isOpen={isBatchModalOpen}
          onClose={() => setIsBatchModalOpen(false)}
          onImport={handleBatchImport}
          deckName={activeDeck.name}
        />
      )}

      <StatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        stats={stats}
        decks={decks}
      />

      {sessionSummary && (
        <SessionSummaryModal
          isOpen={sessionSummary.isOpen}
          onClose={() => {
            setSessionSummary(null);
            setActiveStudyMode(null);
          }}
          onRestart={() => {
            setSessionSummary(null);
            // keep current study mode
          }}
          totalCards={sessionSummary.totalCards}
          correctCount={sessionSummary.correctCount}
          modeName={sessionSummary.modeName}
          deckName={sessionSummary.deckName}
        />
      )}
    </div>
  );
}
