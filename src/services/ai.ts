import { supabase, isSupabaseConfigured } from './supabase';

export interface AiChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const formatSupabaseUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}.supabase.co`;
};
const envUrl = formatSupabaseUrl(rawUrl);

const functionsBase = isSupabaseConfigured && envUrl
  ? `${envUrl.replace(/\/$/, '')}/functions/v1`
  : '';

// Chama a Edge Function "groq-chat" do Supabase (proxy seguro para a API Groq).
// Retorna a resposta de texto, ou null em caso de falha/configuração ausente
// para que os componentes possam usar seu fallback local.
export async function chatWithGroq(
  messages: AiChatMessage[],
  systemInstruction: string
): Promise<string | null> {
  if (!isSupabaseConfigured || !functionsBase) return null;

  try {
    let authHeader = anonKey ? `Bearer ${anonKey}` : '';
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.access_token) {
        authHeader = `Bearer ${data.session.access_token}`;
      }
    } catch {
      // sem sessão -> usa a anon key
    }

    const res = await fetch(`${functionsBase}/groq-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
        ...(anonKey ? { apikey: anonKey } : {}),
      },
      body: JSON.stringify({ messages, systemInstruction }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    return typeof data.reply === 'string' && data.reply.trim() ? data.reply : null;
  } catch {
    return null;
  }
}
