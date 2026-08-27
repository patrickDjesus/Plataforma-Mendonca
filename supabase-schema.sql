-- ============================================================
-- PLATAFORMA MENDONCA - SETUP COMPLETO SUPABASE
-- Execute este script no SQL Editor do Dashboard Supabase
-- ============================================================

-- 1. TABELA USERS (Perfis dos Usuarios)
CREATE TABLE IF NOT EXISTS public.users (
  user_id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL DEFAULT 'Estudante',
  email TEXT NOT NULL DEFAULT '',
  photo_url TEXT DEFAULT '',
  total_xp NUMERIC DEFAULT 0,
  streak NUMERIC DEFAULT 1,
  high_score NUMERIC DEFAULT 0,
  accuracy NUMERIC DEFAULT 0,
  total_answered NUMERIC DEFAULT 0,
  total_correct NUMERIC DEFAULT 0,
  division TEXT DEFAULT 'Iniciante',
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA QUESTIONS (Questoes do Professor & Comunidade)
CREATE TABLE IF NOT EXISTS public.questions (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL,
  creator_name TEXT DEFAULT 'Professor(a)',
  creator_email TEXT DEFAULT '',
  subject TEXT DEFAULT 'Geral',
  topic TEXT DEFAULT '',
  difficulty TEXT DEFAULT 'Medio',
  statement TEXT DEFAULT '',
  options JSONB DEFAULT '[]'::jsonb,
  image_url TEXT DEFAULT '',
  image_caption TEXT DEFAULT '',
  code_snippet TEXT DEFAULT '',
  game_type TEXT DEFAULT 'standard',
  ai_hint TEXT DEFAULT '',
  math_expression TEXT DEFAULT '',
  chemical_element JSONB DEFAULT NULL,
  formula_info JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA PERFORMANCE (Metricas de Desempenho por Usuario)
CREATE TABLE IF NOT EXISTS public.performance (
  user_id TEXT PRIMARY KEY,
  total_answered NUMERIC DEFAULT 0,
  total_correct NUMERIC DEFAULT 0,
  total_wrong NUMERIC DEFAULT 0,
  total_xp_earned NUMERIC DEFAULT 0,
  best_streak_combo NUMERIC DEFAULT 1,
  total_seconds_played NUMERIC DEFAULT 0,
  subject_stats JSONB DEFAULT '{}'::jsonb,
  recent_questions_log JSONB DEFAULT '[]'::jsonb,
  sessions_history JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELA LEADERBOARD (Ranking Global Competitivo)
CREATE TABLE IF NOT EXISTS public.leaderboard (
  user_id TEXT PRIMARY KEY,
  name TEXT DEFAULT 'Estudante',
  handle TEXT DEFAULT '',
  avatar_emoji TEXT DEFAULT '🔥',
  avatar_bg TEXT DEFAULT '',
  school_or_goal TEXT DEFAULT '',
  score NUMERIC DEFAULT 0,
  weekly_xp NUMERIC DEFAULT 0,
  streak_days NUMERIC DEFAULT 1,
  accuracy NUMERIC DEFAULT 0,
  total_questions NUMERIC DEFAULT 0,
  league TEXT DEFAULT 'Prata',
  status TEXT DEFAULT 'online',
  favorite_subject TEXT DEFAULT 'Treino Geral',
  endurance_record_secs NUMERIC DEFAULT 120,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABELA DOCUMENTS (Cadernos / Documentos por Usuario)
CREATE TABLE IF NOT EXISTS public.documents (
  id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  discipline_id TEXT DEFAULT '',
  title TEXT DEFAULT '',
  summary TEXT DEFAULT '',
  tags JSONB DEFAULT '[]'::jsonb,
  starred BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  sections JSONB DEFAULT '[]'::jsonb,
  glossary JSONB DEFAULT '{}'::jsonb,
  word_count NUMERIC DEFAULT 0,
  last_edited TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id, user_id)
);

-- ============================================================
-- INDEXES para performance nas queries
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_questions_subject ON public.questions(subject);
CREATE INDEX IF NOT EXISTS idx_questions_creator ON public.questions(creator_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON public.leaderboard(score DESC);
CREATE INDEX IF NOT EXISTS idx_performance_user ON public.performance(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_user ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_discipline ON public.documents(discipline_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- USERS: so o dono le e escreve (protege email e dados pessoais)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own" ON public.users;
CREATE POLICY "users_select_own"
  ON public.users FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "users_insert_own" ON public.users;
CREATE POLICY "users_insert_own"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "users_delete_own" ON public.users;
CREATE POLICY "users_delete_own"
  ON public.users FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id);

-- QUESTIONS: todos leem, autenticados criam/editam as suas
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "questions_select_all" ON public.questions;
CREATE POLICY "questions_select_all"
  ON public.questions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "questions_insert_auth" ON public.questions;
CREATE POLICY "questions_insert_auth"
  ON public.questions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = creator_id);

DROP POLICY IF EXISTS "questions_update_creator" ON public.questions;
CREATE POLICY "questions_update_creator"
  ON public.questions FOR UPDATE
  TO authenticated
  USING (creator_id = auth.uid()::text)
  WITH CHECK (creator_id = auth.uid()::text);

DROP POLICY IF EXISTS "questions_delete_creator" ON public.questions;
CREATE POLICY "questions_delete_creator"
  ON public.questions FOR DELETE
  TO authenticated
  USING (creator_id = auth.uid()::text);

-- PERFORMANCE: so o dono le e escreve
ALTER TABLE public.performance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "performance_select_own" ON public.performance;
CREATE POLICY "performance_select_own"
  ON public.performance FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "performance_insert_own" ON public.performance;
CREATE POLICY "performance_insert_own"
  ON public.performance FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "performance_update_own" ON public.performance;
CREATE POLICY "performance_update_own"
  ON public.performance FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "performance_delete_own" ON public.performance;
CREATE POLICY "performance_delete_own"
  ON public.performance FOR DELETE
  TO authenticated
  USING (user_id = auth.uid()::text);

-- LEADERBOARD: todos leem, autenticados escrevem o proprio
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leaderboard_select_all" ON public.leaderboard;
CREATE POLICY "leaderboard_select_all"
  ON public.leaderboard FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "leaderboard_insert_own" ON public.leaderboard;
CREATE POLICY "leaderboard_insert_own"
  ON public.leaderboard FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "leaderboard_update_own" ON public.leaderboard;
CREATE POLICY "leaderboard_update_own"
  ON public.leaderboard FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "leaderboard_delete_own" ON public.leaderboard;
CREATE POLICY "leaderboard_delete_own"
  ON public.leaderboard FOR DELETE
  TO authenticated
  USING (user_id = auth.uid()::text);

-- DOCUMENTS: dono pode ler/escrever; publicos podem ser lidos por todos
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "documents_select" ON public.documents;
CREATE POLICY "documents_select"
  ON public.documents FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text OR is_public = true);

DROP POLICY IF EXISTS "documents_insert_own" ON public.documents;
CREATE POLICY "documents_insert_own"
  ON public.documents FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "documents_update_own" ON public.documents;
CREATE POLICY "documents_update_own"
  ON public.documents FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "documents_delete_own" ON public.documents;
CREATE POLICY "documents_delete_own"
  ON public.documents FOR DELETE
  TO authenticated
  USING (user_id = auth.uid()::text);

-- ============================================================
-- HABILITAR REALTIME (para atualizacoes em tempo real)
-- Seguro para rodar multiplas vezes (ignora se ja existe)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'questions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.questions;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'leaderboard'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.leaderboard;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'performance'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.performance;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'documents'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.documents;
  END IF;
END
$$;

-- ============================================================
-- PRONTO! As 5 tabelas estao criadas e seguras via RLS.
-- ============================================================
