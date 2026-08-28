# Plataforma Mendonça 🎓

Plataforma de estudos preparatória para o **ENEM e vestibulares**, construída com **React + Vite + TypeScript + Tailwind CSS** e backend gerenciado via **Supabase** (banco de dados, autenticação e Edge Functions).

## Funcionalidades

- **Caderno de Estudos** — editor de notas estilo Notion (slash menu, undo, formatação, listas numeradas).
- **Chat com IA** — assistente "Lumina" (chat do documento) e "IA Mendonça" (dashboard), alimentados por **Groq** através de uma Edge Function segura do Supabase.
- **Treino Gamificado** — treinos, simulados com questões próprias, modo foco, desafios e ranking.
- **Mapa de Conceitos** — grafo de conhecimento neural interdisciplinar.
- **Dashboard de Desempenho**, Séries e Medalhas, Redação, Onda de Estudos e mais.

## Stack

- Frontend: React 18, Vite, TypeScript, Tailwind CSS v4, Motion.
- Backend/Infra: Supabase (Postgres, Auth, RLS, Edge Functions).
- IA: Groq API (`https://api.groq.com`), acessada **somente** via Edge Function (a chave nunca vai para o frontend).

## Começando

```bash
npm install
npm run dev        # http://localhost:3000
```

### Variáveis de ambiente

Crie um arquivo `.env` na raiz:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

> Confira `.env.example` para referência. **Não** coloque a chave do Groq no `.env` — ela é um segredo do servidor (ver abaixo).

## Scripts

```bash
npm run dev        # dev server (porta 3000)
npm run typecheck  # typecheck do TypeScript
npm run lint       # eslint (src/)
npm run build      # build de produção
```

## IA (Groq) — Edge Function do Supabase

O chat de IA usa a Edge Function `groq-chat`, que faz o papel de **proxy seguro** entre o frontend e a API do Groq. A chave `GROQ_API_KEY` fica armazenada como segredo no Supabase e **nunca** é exposta ao navegador.

### Código

- `supabase/functions/groq-chat/index.ts` — Edge Function (Deno) que recebe `{ messages, systemInstruction }`, chama a Groq e retorna `{ reply }`.
- `src/services/ai.ts` — serviço frontend que invoca a função com o JWT do usuário (com fallback para `null`; os componentes usam respostas locais se a função falhar).

### Deploy

Instalar o Supabase CLI (já incluído como dependência de desenvolvimento):

```bash
npx supabase login
npx supabase link --project-ref <SEU_PROJECT_REF>
```

Definir os segredos e publicar:

```bash
npx supabase secrets set GROQ_API_KEY=gsk_xxxxxxxx
npx supabase secrets set GROQ_MODEL=qwen/qwen3.8-27b   # opcional
npx supabase functions deploy groq-chat
```

> Para atualizar a função após alterações no código:
> `npx supabase functions deploy groq-chat`

### Teste rápido (via HTTP)

```bash
curl -X POST "https://<ref>.supabase.co/functions/v1/groq-chat" \
  -H "Authorization: Bearer <ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"systemInstruction":"Responda em uma frase curta.","messages":[{"role":"user","content":"Diga oi"}]}'
```

Espera-se `{"reply":"..."}`.

## Banco de Dados

O schema (tabelas `questions`, `users`, `performance`, `leaderboard`, RLS com `auth.uid()`) está em `supabase-schema.sql`. As operações do app passam por `src/services/supabase.ts`.
