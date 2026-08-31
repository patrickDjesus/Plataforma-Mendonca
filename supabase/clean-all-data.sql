-- ============================================================
-- PLATAFORMA MENDONCA - LIMPAR TODOS OS DADOS (ZERAR O SITE)
-- ============================================================
-- Execute este script no SQL Editor do Dashboard Supabase
-- (usa as credenciais administrativas do dashboard, que possuem
-- privilegios para contornar o RLS via TRUNCATE).
--
-- Este script APAGA TODO O CONTEUDO das tabelas, mas
-- NAO DROPAR as tabelas / schemas / RLS / indices.
-- As tabelas permanecem criadas e prontas para uso.
--
-- Tabelas afetadas:
--   public.users
--   public.questions
--   public.performance
--   public.leaderboard
--   public.documents
-- ============================================================

-- TRUNCATE remove todas as linhas de forma rapida e
-- reinicia a contagem de auto-increment (nao aplicavel, sao TEXT).
-- CASCADE garante o reset mesmo com FK (nao ha FK, mas fica seguro).
TRUNCATE TABLE
  public.users,
  public.questions,
  public.performance,
  public.leaderboard,
  public.documents
CASCADE;

-- ============================================================
-- (Opcional) Remover usuarios autenticados do Supabase Auth
-- A tabela public.users guarda apenas perfis. As contas reais
-- ficam em auth.users. Se quiser zerar TAMBEM as contas de
-- login (para recomecar do zero), descomente o bloco abaixo.
-- ATENCAO: isso derruba todos os logins existentes.
-- ============================================================
-- DELETE FROM auth.users;

-- ============================================================
-- CONCLUIDO! As tabelas agora estao vazias e prontas para uso.
-- ============================================================
