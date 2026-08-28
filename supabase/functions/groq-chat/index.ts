// Supabase Edge Function: groq-chat
//
// Proxy seguro para a API do Groq. A chave fica armazenada como secret no
// Supabase (GROQ_API_KEY) e NUNCA é exposta no frontend.
//
// Deploy:
//   supabase functions deploy groq-chat
//   supabase secrets set GROQ_API_KEY=gsk_xxxx
//
// Chamada (a partir do frontend):
//   POST {YOUR_PROJECT_REF}.supabase.co/functions/v1/groq-chat
//   Headers: Authorization: Bearer <anon key ou JWT do usuário>
//            Content-Type: application/json
//   Body: { "messages": [{ role, content }], "systemInstruction": string, "model"?: string }

import { createClient } from 'jsr:@supabase/supabase-js@2';

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'qwen/qwen3.8-27b';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    if (!groqApiKey) {
      return new Response(
        JSON.stringify({ error: 'GROQ_API_KEY não configurada no servidor.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let body: { messages?: ChatMessage[]; systemInstruction?: string; model?: string } = {};
    try {
      body = await req.json();
    } catch {
      // corpo inválido -> body permanece vazio
    }

    const messages: ChatMessage[] = [];
    if (body.systemInstruction && body.systemInstruction.trim()) {
      messages.push({ role: 'system', content: body.systemInstruction.trim() });
    }
    if (Array.isArray(body.messages)) {
      messages.push(...body.messages.filter(
        (m) => m && typeof m.content === 'string' && m.content.trim()
      ));
    }

    if (messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Nenhuma mensagem fornecida.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const model = body.model || Deno.env.get('GROQ_MODEL') || DEFAULT_MODEL;

    const groqRes = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      return new Response(
        JSON.stringify({ error: `Erro do Groq (${groqRes.status}): ${errText}` }),
        { status: groqRes.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await groqRes.json();
    const reply = data?.choices?.[0]?.message?.content || '';

    return new Response(
      JSON.stringify({ reply }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('groq-chat error:', err);
    return new Response(
      JSON.stringify({ error: 'Erro interno no servidor.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
