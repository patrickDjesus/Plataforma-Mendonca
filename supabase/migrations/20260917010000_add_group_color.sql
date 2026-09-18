-- Adiciona a cor personalizada dos grupos nos documentos.
-- Idempotente: pode rodar mais de uma vez sem erro.

ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS group_color TEXT DEFAULT '';