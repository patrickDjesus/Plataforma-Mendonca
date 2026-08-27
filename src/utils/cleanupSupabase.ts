import { supabase } from '../services/supabase';

export interface CleanupOptions {
  deleteQuestions?: boolean;
  resetPerformance?: boolean;
  deleteLeaderboard?: boolean;
  resetUsersProgress?: boolean;
  clearLocalStorage?: boolean;
}

export interface CleanupReport {
  success: boolean;
  questionsDeleted: number;
  performanceResetCount: number;
  leaderboardDeletedCount: number;
  usersResetCount: number;
  localStorageCleared: boolean;
  timestamp: string;
  errors: string[];
  logs: string[];
}

export interface CollectionCounts {
  questions: number;
  performance: number;
  leaderboard: number;
  users: number;
}

export async function getCollectionCounts(): Promise<CollectionCounts> {
  const counts: CollectionCounts = { questions: 0, performance: 0, leaderboard: 0, users: 0 };

  try {
    const { count } = await supabase.from('questions').select('*', { count: 'exact', head: true });
    counts.questions = count || 0;
  } catch (e) { console.warn('Erro ao contar questions:', e); }

  try {
    const { count } = await supabase.from('performance').select('*', { count: 'exact', head: true });
    counts.performance = count || 0;
  } catch (e) { console.warn('Erro ao contar performance:', e); }

  try {
    const { count } = await supabase.from('leaderboard').select('*', { count: 'exact', head: true });
    counts.leaderboard = count || 0;
  } catch (e) { console.warn('Erro ao contar leaderboard:', e); }

  try {
    const { count } = await supabase.from('users').select('*', { count: 'exact', head: true });
    counts.users = count || 0;
  } catch (e) { console.warn('Erro ao contar users:', e); }

  return counts;
}

export function clearLocalTestStorage(): void {
  const keysToReset = [
    'mendonca_daily_target_q',
    'mendonca_daily_target_min',
    'mendonca_study_streak',
    'mendonca_last_training_session',
    'mendonca_cached_analytics',
    'mendonca_active_focus_plan',
    'mendonca_user_progress_backup',
  ];

  keysToReset.forEach(k => {
    try { localStorage.removeItem(k); } catch { /* ignored */ }
  });

  try {
    localStorage.setItem('mendonca_daily_target_q', '15');
    localStorage.setItem('mendonca_daily_target_min', '45');
  } catch { /* ignored */ }
}

export async function cleanupAllTestData(
  options: CleanupOptions = {
    deleteQuestions: true,
    resetPerformance: true,
    deleteLeaderboard: true,
    resetUsersProgress: true,
    clearLocalStorage: true,
  }
): Promise<CleanupReport> {
  const report: CleanupReport = {
    success: true,
    questionsDeleted: 0,
    performanceResetCount: 0,
    leaderboardDeletedCount: 0,
    usersResetCount: 0,
    localStorageCleared: false,
    timestamp: new Date().toISOString(),
    errors: [],
    logs: [],
  };

  report.logs.push(`[${new Date().toLocaleTimeString()}] Iniciando limpeza do Supabase...`);

  // 1. Limpar Questions
  if (options.deleteQuestions) {
    try {
      const { error } = await supabase.from('questions').delete().neq('id', '__never_match__');
      if (error) throw error;
      const { count } = await supabase.from('questions').select('*', { count: 'exact', head: true });
      report.questionsDeleted = count || 0;
      report.logs.push(`Questions limpa com sucesso.`);
    } catch (err) {
      const msg = `Erro ao limpar questions: ${err instanceof Error ? err.message : String(err)}`;
      report.errors.push(msg);
      report.logs.push(msg);
      report.success = false;
    }
  }

  // 2. Limpar Leaderboard
  if (options.deleteLeaderboard) {
    try {
      await supabase.from('leaderboard').delete().neq('user_id', '__never_match__');
      report.logs.push(`Leaderboard limpo com sucesso.`);
    } catch (err) {
      const msg = `Erro ao limpar leaderboard: ${err instanceof Error ? err.message : String(err)}`;
      report.errors.push(msg);
      report.logs.push(msg);
      report.success = false;
    }
  }

  // 3. Resetar Performance
  if (options.resetPerformance) {
    try {
      const { data: perfData } = await supabase.from('performance').select('user_id');
      if (perfData && perfData.length > 0) {
        const cleanAnalytics = {
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
        };

        for (const row of perfData) {
          await supabase.from('performance').update(cleanAnalytics).eq('user_id', row.user_id);
          report.performanceResetCount++;
        }
        report.logs.push(`${report.performanceResetCount} perfis de performance reiniciados.`);
      }
    } catch (err) {
      const msg = `Erro ao resetar performance: ${err instanceof Error ? err.message : String(err)}`;
      report.errors.push(msg);
      report.logs.push(msg);
      report.success = false;
    }
  }

  // 4. Resetar Users
  if (options.resetUsersProgress) {
    try {
      const { data: usersData } = await supabase.from('users').select('user_id');
      if (usersData && usersData.length > 0) {
        for (const row of usersData) {
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
          report.usersResetCount++;
        }
        report.logs.push(`${report.usersResetCount} usuarios com progresso reiniciado.`);
      }
    } catch (err) {
      const msg = `Erro ao resetar usuarios: ${err instanceof Error ? err.message : String(err)}`;
      report.errors.push(msg);
      report.logs.push(msg);
      report.success = false;
    }
  }

  // 5. Limpeza Local
  if (options.clearLocalStorage) {
    clearLocalTestStorage();
    report.localStorageCleared = true;
    report.logs.push('Cache local reiniciado.');
  }

  report.logs.push(`[${new Date().toLocaleTimeString()}] Limpeza finalizada.`);
  return report;
}

export async function resetSingleUserProgress(userId: string): Promise<void> {
  if (!userId) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== userId) {
    throw new Error('Unauthorized: cannot reset another user progress');
  }

  const now = new Date().toISOString();

  await supabase.from('performance').upsert({
    user_id: userId,
    total_answered: 0,
    total_correct: 0,
    total_wrong: 0,
    total_xp_earned: 0,
    best_streak_combo: 1,
    total_seconds_played: 0,
    subject_stats: {},
    recent_questions_log: [],
    sessions_history: [],
    updated_at: now,
  });

  await supabase.from('users').update({
    total_xp: 0,
    streak: 1,
    high_score: 0,
    accuracy: 0,
    total_answered: 0,
    total_correct: 0,
    division: 'Bronze I',
    updated_at: now,
  }).eq('user_id', userId);

  await supabase.from('leaderboard').delete().eq('user_id', userId);

  clearLocalTestStorage();
}
