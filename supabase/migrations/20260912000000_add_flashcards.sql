-- ============================================================
-- TABELAS FLASHCARDS - Decks, Estatísticas e Sessões de Estudo
-- Execute este script no SQL Editor do Dashboard Supabase
-- ============================================================

-- 1. FLASHCARD_DECKS (Baralhos e seus cartões)
CREATE TABLE IF NOT EXISTS public.flashcard_decks (
  id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  color TEXT NOT NULL DEFAULT 'emerald',
  icon TEXT NOT NULL DEFAULT 'Layers',
  cards JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_studied_at TIMESTAMPTZ DEFAULT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id, user_id)
);

-- 2. FLASHCARD_STATS (Estatísticas do usuário: streak, histórico)
CREATE TABLE IF NOT EXISTS public.flashcard_stats (
  user_id TEXT PRIMARY KEY,
  streak NUMERIC DEFAULT 0,
  last_study_date TEXT DEFAULT '',
  total_cards_studied NUMERIC DEFAULT 0,
  total_correct NUMERIC DEFAULT 0,
  sessions_completed NUMERIC DEFAULT 0,
  history_by_date JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. FLASHCARD_SESSIONS (Log de sessões de estudo)
CREATE TABLE IF NOT EXISTS public.flashcard_sessions (
  id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  deck_id TEXT DEFAULT '',
  mode TEXT DEFAULT 'unified',
  cards_reviewed NUMERIC DEFAULT 0,
  correct NUMERIC DEFAULT 0,
  duration_seconds NUMERIC DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id, user_id)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_flashcard_decks_user ON public.flashcard_decks(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_sessions_user ON public.flashcard_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_sessions_date ON public.flashcard_sessions(started_at);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- FLASHCARD_DECKS: só o dono lê e escreve
ALTER TABLE public.flashcard_decks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "flashcard_decks_select_own" ON public.flashcard_decks;
CREATE POLICY "flashcard_decks_select_own"
  ON public.flashcard_decks FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "flashcard_decks_insert_own" ON public.flashcard_decks;
CREATE POLICY "flashcard_decks_insert_own"
  ON public.flashcard_decks FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "flashcard_decks_update_own" ON public.flashcard_decks;
CREATE POLICY "flashcard_decks_update_own"
  ON public.flashcard_decks FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "flashcard_decks_delete_own" ON public.flashcard_decks;
CREATE POLICY "flashcard_decks_delete_own"
  ON public.flashcard_decks FOR DELETE
  TO authenticated
  USING (user_id = auth.uid()::text);

-- FLASHCARD_STATS: só o dono lê e escreve
ALTER TABLE public.flashcard_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "flashcard_stats_select_own" ON public.flashcard_stats;
CREATE POLICY "flashcard_stats_select_own"
  ON public.flashcard_stats FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "flashcard_stats_insert_own" ON public.flashcard_stats;
CREATE POLICY "flashcard_stats_insert_own"
  ON public.flashcard_stats FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "flashcard_stats_update_own" ON public.flashcard_stats;
CREATE POLICY "flashcard_stats_update_own"
  ON public.flashcard_stats FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "flashcard_stats_delete_own" ON public.flashcard_stats;
CREATE POLICY "flashcard_stats_delete_own"
  ON public.flashcard_stats FOR DELETE
  TO authenticated
  USING (user_id = auth.uid()::text);

-- FLASHCARD_SESSIONS: só o dono lê e escreve
ALTER TABLE public.flashcard_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "flashcard_sessions_select_own" ON public.flashcard_sessions;
CREATE POLICY "flashcard_sessions_select_own"
  ON public.flashcard_sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "flashcard_sessions_insert_own" ON public.flashcard_sessions;
CREATE POLICY "flashcard_sessions_insert_own"
  ON public.flashcard_sessions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "flashcard_sessions_update_own" ON public.flashcard_sessions;
CREATE POLICY "flashcard_sessions_update_own"
  ON public.flashcard_sessions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "flashcard_sessions_delete_own" ON public.flashcard_sessions;
CREATE POLICY "flashcard_sessions_delete_own"
  ON public.flashcard_sessions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid()::text);

-- ============================================================
-- HABILITAR REALTIME
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'flashcard_decks'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.flashcard_decks;
  END IF;
END
$$;

-- ============================================================
-- PRONTO! Flashcards persistidos no Supabase.
-- Os cartões ficam como JSONB no campo `cards` do baralho.
-- ============================================================
