/**
 * Script de Limpeza do Supabase - Plataforma Mendonca
 *
 * Executa a remocao e reset de dados de teste:
 * 1. Remove todas as questoes da tabela 'questions'
 * 2. Remove todos os placares da tabela 'leaderboard'
 * 3. Restaura os registros da tabela 'performance' para o estado inicial
 * 4. Reinicia contadores de streak e progresso da tabela 'users'
 *
 * Como executar:
 * npx tsx scripts/clean-supabase.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Carregar variaveis de ambiente do .env
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variaveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY sao obrigatorias no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runCleanup() {
  console.log('=====================================================');
  console.log('  INICIANDO SCRIPT DE LIMPEZA DO SUPABASE');
  console.log(`  Projeto: ${supabaseUrl}`);
  console.log('=====================================================\n');

  let questionsCount = 0;
  let leaderboardCount = 0;
  let performanceCount = 0;
  let usersCount = 0;

  // 1. Limpar Questions
  try {
    process.stdout.write('1. Limpando tabela "questions"... ');
    const { data, error } = await supabase.from('questions').select('id');
    if (error) throw error;
    questionsCount = data?.length || 0;
    if (questionsCount > 0) {
      await supabase.from('questions').delete().neq('id', '__never_match__');
    }
    console.log(`OK [${questionsCount} questoes removidas]`);
  } catch (err) {
    console.log(`ERRO: ${err}`);
  }

  // 2. Limpar Leaderboard
  try {
    process.stdout.write('2. Limpando tabela "leaderboard"... ');
    const { data, error } = await supabase.from('leaderboard').select('user_id');
    if (error) throw error;
    leaderboardCount = data?.length || 0;
    if (leaderboardCount > 0) {
      await supabase.from('leaderboard').delete().neq('user_id', '__never_match__');
    }
    console.log(`OK [${leaderboardCount} placares removidos]`);
  } catch (err) {
    console.log(`ERRO: ${err}`);
  }

  // 3. Resetar Performance
  try {
    process.stdout.write('3. Resetando tabela "performance"... ');
    const { data, error } = await supabase.from('performance').select('user_id');
    if (error) throw error;
    performanceCount = data?.length || 0;
    if (performanceCount > 0) {
      for (const row of data) {
        await supabase.from('performance').update({
          total_answered: 0,
          total_correct: 0,
          total_wrong: 0,
          total_xp_earned: 0,
          best_streak_combo: 1,
          total_seconds_played: 0,
          subject_stats: {},
          recent_questions_log: [],
          sessions_history: [],
          updated_at: new Date().toISOString(),
        }).eq('user_id', row.user_id);
      }
    }
    console.log(`OK [${performanceCount} perfis resetados]`);
  } catch (err) {
    console.log(`ERRO: ${err}`);
  }

  // 4. Resetar Users
  try {
    process.stdout.write('4. Reiniciando contadores na tabela "users"... ');
    const { data, error } = await supabase.from('users').select('user_id');
    if (error) throw error;
    usersCount = data?.length || 0;
    if (usersCount > 0) {
      for (const row of data) {
        await supabase.from('users').update({
          total_xp: 0,
          streak: 1,
          high_score: 0,
          accuracy: 0,
          total_answered: 0,
          total_correct: 0,
          division: 'Bronze I',
          updated_at: new Date().toISOString(),
        }).eq('user_id', row.user_id);
      }
    }
    console.log(`OK [${usersCount} usuarios reiniciados]`);
  } catch (err) {
    console.log(`ERRO: ${err}`);
  }

  console.log('\n=====================================================');
  console.log('  LIMPEZA CONCLUIDA COM SUCESSO!');
  console.log(`  Questoes deletadas: ${questionsCount}`);
  console.log(`  Placares deletados: ${leaderboardCount}`);
  console.log(`  Perfis de Performance resetados: ${performanceCount}`);
  console.log(`  Usuarios com progresso reiniciado: ${usersCount}`);
  console.log('=====================================================');
  process.exit(0);
}

runCleanup().catch((err) => {
  console.error('Falha fatal no script de limpeza:', err);
  process.exit(1);
});
