import React, { useState, useEffect, useRef } from 'react';
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
  updateStatsWithReview,
  incrementSessionsCompleted,
} from './utils/storage';
import { calculateSM2 } from './utils/sm2';
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
import {
  getFlashcardUserId,
  subscribeToFlashcardAuth,
  loadDecksFromDb,
  saveDecksToDb,
  deleteDeckFromDb,
  loadStatsFromDb,
  saveStatsToDb,
  logStudySession,
} from './services/supabaseFlashcards';

import { Flame, BarChart2, Volume2, VolumeX, Plus, Layers } from 'lucide-react';

interface FlashcardsAppProps {
  embedded?: boolean;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export default function App({ embedded = false, theme, onToggleTheme: _onToggleTheme }: FlashcardsAppProps) {
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

  // Sync theme with HTML class (disabled in embedded mode: the platform owns the theme)
  useEffect(() => {
    if (embedded) return;
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveThemeSetting(isDark);
  }, [isDark, embedded, theme]);

  const dark =
    embedded && theme ? theme === 'dark' : isDark;

  // Persist decks
  useEffect(() => {
    saveStoredDecks(decks);
  }, [decks]);

  // Persist stats (updated in real time during study sessions)
  useEffect(() => {
    saveStoredStats(stats);
  }, [stats]);

  // ======== Sync Supabase (baralhos, estatísticas e sessões) ========
  const [flashcardUserId, setFlashcardUserId] = useState<string | null>(null);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    getFlashcardUserId().then(setFlashcardUserId);
    subscribeToFlashcardAuth(setFlashcardUserId).then((u) => {
      unsub = u;
    });
    return () => {
      unsub?.();
    };
  }, []);

  // Carrega do banco (nuvem vence) ou sobe os dados locais quando o banco está vazio
  useEffect(() => {
    if (!flashcardUserId) return;
    let cancelled = false;

    (async () => {
      const dbDecks = await loadDecksFromDb(flashcardUserId);
      if (cancelled) return;
      if (dbDecks && dbDecks.length > 0) {
        setDecks(dbDecks);
      } else if (dbDecks && loadStoredDecks().length > 0) {
        await saveDecksToDb(flashcardUserId, loadStoredDecks());
      }

      const dbStats = await loadStatsFromDb(flashcardUserId);
      if (cancelled) return;
      if (dbStats) {
        setStats(dbStats);
      } else {
        await saveStatsToDb(flashcardUserId, loadStoredStats());
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [flashcardUserId]);

  // Persiste decks no banco quando mudam (debounce)
  useEffect(() => {
    if (!flashcardUserId) return;
    const t = setTimeout(() => {
      saveDecksToDb(flashcardUserId, decks);
    }, 500);
    return () => clearTimeout(t);
  }, [decks, flashcardUserId]);

  // Persiste estatísticas no banco quando mudam (debounce)
  useEffect(() => {
    if (!flashcardUserId) return;
    const t = setTimeout(() => {
      saveStatsToDb(flashcardUserId, stats);
    }, 500);
    return () => clearTimeout(t);
  }, [stats, flashcardUserId]);

  // Marca o início da sessão de estudo para medir duração
  const studyStartedAtRef = useRef<number | null>(null);
  useEffect(() => {
    if (activeStudyMode) {
      studyStartedAtRef.current = Date.now();
    } else {
      studyStartedAtRef.current = null;
    }
  }, [activeStudyMode]);

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
      if (flashcardUserId) {
        deleteDeckFromDb(flashcardUserId, deckId);
      }
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

  // Live card review while studying: updates the card stats and global progress in real time
  const handleCardReviewed = (card: Flashcard, correct: boolean) => {
    if (!activeDeckId) return;
    const cardId = card.id;

    setDecks((prev) =>
      prev.map((d) => {
        if (d.id !== activeDeckId) return d;
        return {
          ...d,
          lastStudiedAt: Date.now(),
          cards: d.cards.map((c) => {
            if (c.id !== cardId) return c;
            const sm2 = calculateSM2(c, correct ? 4 : 0);
            return {
              ...c,
              repetition: sm2.repetition,
              interval: sm2.interval,
              easeFactor: sm2.easeFactor,
              dueDate: sm2.dueDate,
              status: sm2.status,
              correctCount: (c.correctCount || 0) + (correct ? 1 : 0),
              errorCount: (c.errorCount || 0) + (correct ? 0 : 1),
              reviewHistory: [
                ...(c.reviewHistory || []),
                { timestamp: Date.now(), rating: correct ? 4 : 0, mode: 'unified' },
              ],
            };
          }),
        };
      })
    );

    setStats((prev) => updateStatsWithReview(prev, correct));
  };

  // Finish study session
  const handleFinishStudySession = (studiedCount: number, correctCount: number) => {
    if (!activeDeck) return;

    const durationSeconds = studyStartedAtRef.current
      ? Math.round((Date.now() - studyStartedAtRef.current) / 1000)
      : 0;

    if (flashcardUserId) {
      logStudySession(flashcardUserId, {
        deckId: activeDeck.id,
        mode: activeStudyMode || 'unified',
        cardsReviewed: studiedCount,
        correct: correctCount,
        durationSeconds,
      });
    }

    // Stats were already updated live during the session; only mark it as completed
    setStats((prev) => incrementSessionsCompleted(prev));

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
      {!embedded ? (
        <Navbar
          stats={stats}
          isDark={dark}
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
      ) : (
        <div className="sticky top-0 z-30 bg-[#FAF8F5]/90 dark:bg-[#161618]/90 backdrop-blur-md border-b border-[#E7E2D9] dark:border-[#2C2C30] transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#2D5A46] flex items-center justify-center text-white flex-shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="font-['Fraunces',serif] font-bold text-base tracking-tight text-[#1C1917] dark:text-[#FAF9F5] flex items-center gap-1.5 truncate">
                  FlashCards<span className="text-[#2D5A46] font-normal italic">Estudo</span>
                </span>
                <p className="text-[10px] text-[#78716C] dark:text-[#A8A29E] hidden sm:block font-sans">
                  Reconhecimento + escrita ativa
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3">
              <button
                onClick={() => setIsStatsModalOpen(true)}
                title={`${stats.streak} dia(s) de sequência de estudo seguidos`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EBF3EF] dark:bg-[#15221B] border border-[#CFE1D6] dark:border-[#22392D] text-[#2D5A46] dark:text-[#52B788] text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                <Flame className="w-4 h-4 text-[#2D5A46] dark:text-[#52B788] fill-[#2D5A46] dark:fill-[#52B788]" />
                <span className="font-mono">{stats.streak} {stats.streak === 1 ? 'dia' : 'dias'}</span>
              </button>

              <button
                onClick={() => setIsStatsModalOpen(true)}
                title="Estatísticas de Estudo"
                className="p-2 rounded-xl text-[#57534E] dark:text-[#D6D3CD] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <BarChart2 className="w-4 h-4" />
              </button>

              <button
                onClick={toggleSound}
                title={soundEnabled ? 'Silenciar efeitos sonoros' : 'Ativar efeitos sonoros'}
                className="p-2 rounded-xl text-[#57534E] dark:text-[#D6D3CD] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-[#2D5A46] dark:text-[#52B788]" />
                ) : (
                  <VolumeX className="w-4 h-4 text-[#A8A29E]" />
                )}
              </button>

              {!activeDeckId && (
                <button
                  onClick={() => {
                    setEditingDeck(null);
                    setIsDeckModalOpen(true);
                  }}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1C1917] hover:bg-[#292524] dark:bg-[#FAF9F5] dark:hover:bg-[#EAE8E3] text-white dark:text-[#1C1917] text-xs font-bold shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Baralho</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 pb-16">
        {/* VIEW 1: Study Mode in progress */}
        {activeDeck && activeStudyMode ? (
          <div className="w-full animate-in fade-in duration-150">
            <UnifiedStudySession
              deck={activeDeck}
              cards={activeDeck.cards}
              onCardReviewed={handleCardReviewed}
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
