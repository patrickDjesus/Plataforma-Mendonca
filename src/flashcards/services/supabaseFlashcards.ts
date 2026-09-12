import { supabase, isSupabaseConfigured } from '../../services/supabase';
import { Deck, Flashcard, UserStats, DeckColor } from '../types';

// ============================================================================
// SYNC FLASHCARDS COM SUPABASE
// Guarda os baralhos (com cartões como JSONB), estatísticas e sessões de estudo
// no projeto supremacista. Quando o usuário não está logado ou o banco não
// responde, o app segue 100% no localStorage como antes.
// ============================================================================

interface FlashcardDeckRow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  cards: unknown;
  created_at: string | null;
  last_studied_at: string | null;
  updated_at: string | null;
}

interface FlashcardStatsRow {
  user_id: string;
  streak: number | null;
  last_study_date: string | null;
  total_cards_studied: number | null;
  total_correct: number | null;
  sessions_completed: number | null;
  history_by_date: unknown;
  updated_at: string | null;
}

export interface StudySessionLog {
  deckId: string;
  mode: string;
  cardsReviewed: number;
  correct: number;
  durationSeconds: number;
}

function rowToDeck(row: FlashcardDeckRow): Deck {
  const validColors: DeckColor[] = ['indigo', 'emerald', 'rose', 'amber', 'violet', 'cyan', 'blue', 'fuchsia'];
  const color = validColors.includes(row.color as DeckColor) ? (row.color as DeckColor) : 'emerald';

  return {
    id: row.id,
    name: row.name,
    description: (row.description as string) || '',
    color,
    icon: (row.icon as string) || 'Layers',
    cards: Array.isArray(row.cards) ? (row.cards as Flashcard[]) : [],
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    lastStudiedAt: row.last_studied_at ? new Date(row.last_studied_at).getTime() : undefined,
  };
}

function deckToRow(deck: Deck, userId: string): FlashcardDeckRow {
  return {
    id: deck.id,
    user_id: userId,
    name: deck.name,
    description: deck.description || '',
    color: deck.color,
    icon: deck.icon,
    cards: deck.cards || [],
    created_at: deck.createdAt ? new Date(deck.createdAt).toISOString() : new Date().toISOString(),
    last_studied_at: deck.lastStudiedAt ? new Date(deck.lastStudiedAt).toISOString() : null,
    updated_at: new Date().toISOString(),
  };
}

function rowToStats(row: FlashcardStatsRow): UserStats {
  return {
    streak: Number(row.streak) || 0,
    lastStudyDate: (row.last_study_date as string) || '',
    totalCardsStudied: Number(row.total_cards_studied) || 0,
    totalCorrect: Number(row.total_correct) || 0,
    sessionsCompleted: Number(row.sessions_completed) || 0,
    historyByDate: (row.history_by_date as Record<string, { reviewed: number; correct: number }>) || {},
  };
}

function statsToRow(stats: UserStats, userId: string): FlashcardStatsRow {
  return {
    user_id: userId,
    streak: stats.streak,
    last_study_date: stats.lastStudyDate,
    total_cards_studied: stats.totalCardsStudied,
    total_correct: stats.totalCorrect,
    sessions_completed: stats.sessionsCompleted,
    history_by_date: stats.historyByDate || {},
    updated_at: new Date().toISOString(),
  };
}

/** Retorna o id do usuário logado (ou null). */
export async function getFlashcardUserId(): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    return data.user.id;
  } catch {
    return null;
  }
}

/** Assina mudanças de autenticação. Retorna função para desassinar. */
export async function subscribeToFlashcardAuth(
  cb: (userId: string | null) => void
): Promise<() => void> {
  if (!isSupabaseConfigured) return () => {};
  try {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      cb(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  } catch {
    return () => {};
  }
}

/** Carrega todos os baralhos do usuário. Retorna null em erro (tabela ausente etc). */
export async function loadDecksFromDb(userId: string): Promise<Deck[] | null> {
  try {
    const { data, error } = await supabase
      .from('flashcard_decks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data as FlashcardDeckRow[] | null)?.map(rowToDeck) ?? [];
  } catch (err) {
    console.warn('Flashcards: falha ao carregar baralhos do Supabase', err);
    return null;
  }
}

/** Faz upsert dos baralhos do usuário (chave composta id + user_id). */
export async function saveDecksToDb(userId: string, decks: Deck[]): Promise<boolean> {
  if (!decks.length) return true;
  try {
    const rows = decks.map((d) => deckToRow(d, userId));
    const { error } = await supabase.from('flashcard_decks').upsert(rows, {
      onConflict: 'id,user_id',
    });
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Flashcards: falha ao salvar baralhos no Supabase', err);
    return false;
  }
}

/** Remove um baralho do Supabase. */
export async function deleteDeckFromDb(userId: string, deckId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('flashcard_decks')
      .delete()
      .eq('user_id', userId)
      .eq('id', deckId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Flashcards: falha ao excluir baralho no Supabase', err);
    return false;
  }
}

/** Carrega as estatísticas do usuário. Retorna null se não existirem ainda. */
export async function loadStatsFromDb(userId: string): Promise<UserStats | null> {
  try {
    const { data, error } = await supabase
      .from('flashcard_stats')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToStats(data as FlashcardStatsRow) : null;
  } catch (err) {
    console.warn('Flashcards: falha ao carregar estatísticas do Supabase', err);
    return null;
  }
}

/** Faz upsert das estatísticas do usuário. */
export async function saveStatsToDb(userId: string, stats: UserStats): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('flashcard_stats')
      .upsert(statsToRow(stats, userId), { onConflict: 'user_id' });
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Flashcards: falha ao salvar estatísticas no Supabase', err);
    return false;
  }
}

/** Registra uma sessão de estudo concluída. */
export async function logStudySession(userId: string, s: StudySessionLog): Promise<boolean> {
  try {
    const { error } = await supabase.from('flashcard_sessions').insert({
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      user_id: userId,
      deck_id: s.deckId,
      mode: s.mode,
      cards_reviewed: s.cardsReviewed,
      correct: s.correct,
      duration_seconds: s.durationSeconds,
    });
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Flashcards: falha ao registrar sessão no Supabase', err);
    return false;
  }
}