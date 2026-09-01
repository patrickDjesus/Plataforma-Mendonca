-- ============================================================
-- TABELA CONCEPT_NODES (Mapa de Conceitos / Rede Neural)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.concept_nodes (
  id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  category TEXT DEFAULT '',
  color TEXT DEFAULT '#06B6D4',
  glow_color TEXT DEFAULT '',
  x NUMERIC DEFAULT 500,
  y NUMERIC DEFAULT 350,
  size NUMERIC DEFAULT 26,
  mastery NUMERIC DEFAULT 0,
  description TEXT DEFAULT '',
  connections JSONB DEFAULT '[]'::jsonb,
  synaptic_strength NUMERIC DEFAULT 1,
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_concept_nodes_user ON public.concept_nodes(user_id);

-- RLS
ALTER TABLE public.concept_nodes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "concept_nodes_select_own" ON public.concept_nodes;
CREATE POLICY "concept_nodes_select_own"
  ON public.concept_nodes FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "concept_nodes_insert_own" ON public.concept_nodes;
CREATE POLICY "concept_nodes_insert_own"
  ON public.concept_nodes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "concept_nodes_update_own" ON public.concept_nodes;
CREATE POLICY "concept_nodes_update_own"
  ON public.concept_nodes FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "concept_nodes_delete_own" ON public.concept_nodes;
CREATE POLICY "concept_nodes_delete_own"
  ON public.concept_nodes FOR DELETE
  TO authenticated
  USING (user_id = auth.uid()::text);
