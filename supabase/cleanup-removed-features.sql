-- ============================================================
-- PLATAFORMA MENDONCA - LIMPEZA DE FUNCIONALIDADES REMOVIDAS
-- ============================================================
-- Execute este script no SQL Editor do Dashboard Supabase
-- (usa as credenciais administrativas do dashboard, que possuem
-- privilegios para contornar o RLS).
--
-- Remove os dados das funcionalidades descontinuadas:
--   1. Mapa Neural / Rede de Conceitos (tabela concept_nodes)
--   2. Modo Endurance (sessoes no historico de desempenho)
--   3. Fórmulas & Macetes (sessoes e questoes de formula) parametrizadas
--   4. Coluna endurance_record_secs do leaderboard (sem uso)
-- ============================================================

BEGIN;

-- ------------------------------------------------------------------
-- 1. MAPA NEURAL / REDE DE CONCEITOS
-- Tabela inteira deixou de ser usada pelo app. Removemos do
-- publication do Realtime (se foi adicionada) e derrubamos a tabela.
-- ------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'concept_nodes'
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.concept_nodes;
  END IF;
END
$$;

DROP TABLE IF EXISTS public.concept_nodes;

-- ------------------------------------------------------------------
-- 2. & 3. SESSOES DE TREINO DOS MODOS REMOVIDOS
-- O historico vive em performance.sessions_history (array JSONB) no
-- campo "gameMode". Removemos apenas as sessoes dos modos excluidos.
-- ------------------------------------------------------------------
UPDATE public.performance
SET sessions_history = COALESCE(
  (
    SELECT jsonb_agg(s)
    FROM jsonb_array_elements(sessions_history) AS s
    WHERE s->>'gameMode' NOT IN ('Modo Endurance Progressivo', 'Fórmulas ENEM')
  ),
  '[]'::jsonb
)
WHERE sessions_history IS NOT NULL
  AND sessions_history != '[]'::jsonb;

-- Log recente de respostas: remove questoes geradas como formula
-- (gameType = 'formula'), que eram exclusivas da modalidade
-- "Fórmulas & Macetes". Questoes do professor usam 'standard'
-- e nao sao afetadas.
UPDATE public.performance
SET recent_questions_log = COALESCE(
  (
    SELECT jsonb_agg(q)
    FROM jsonb_array_elements(recent_questions_log) AS q
    WHERE q->'question'->>'gameType' IS DISTINCT FROM 'formula'
  ),
  '[]'::jsonb
)
WHERE recent_questions_log IS NOT NULL
  AND recent_questions_log != '[]'::jsonb;

-- ------------------------------------------------------------------
-- 4. COLUNA DE RECORDE DO ENDURANCE NO LEADERBOARD
-- Sem o modo Endurance, a coluna ficou sem uso no app.
-- ------------------------------------------------------------------
ALTER TABLE public.leaderboard DROP COLUMN IF EXISTS endurance_record_secs;

-- ------------------------------------------------------------------
-- OPCIONAL: apagar questoes autorais exclusivas de formula
-- (game_type = 'formula') criadas no estudio. Descomente se quiser
-- remover do banco as questoes publicadas pelo professor com esse
-- objetivo. Nao confunda com questoes dinamicas: essas nunca sao
-- persistidas na tabela questions.
-- ------------------------------------------------------------------
-- DELETE FROM public.questions
-- WHERE game_type = 'formula';

COMMIT;

-- ============================================================
-- CONCLUIDO!
-- ============================================================