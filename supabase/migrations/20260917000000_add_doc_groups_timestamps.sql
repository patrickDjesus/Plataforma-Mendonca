-- Adiciona suporte a grupos e timestamps de criação/edição nos documentos.
-- Idempotente: pode rodar mais de uma vez sem erro.

ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS group_name TEXT DEFAULT '';
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS created_at_ts BIGINT DEFAULT 0;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS last_edited_ts BIGINT DEFAULT 0;