import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import { QuizQuestion, PerformanceAnalytics, PerformanceSessionHistory } from '../types/design';
import { LeaderboardUser } from '../components/GlobalLeaderboard';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// ============================================================================
// AUTH
// ============================================================================

export const signInWithGoogle = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
  } catch (error) {
    console.warn('Login Google:', error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
};

export const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  });
  if (error) throw error;
  return data.user;
};

export const logout = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = () => supabase.auth.getUser();
export const getCurrentSession = () => supabase.auth.getSession();

// ============================================================================
// 1. QUESTIONS (Questoes do Professor & Comunidade)
// ============================================================================

export const createQuestion = async (
  questionData: Omit<QuizQuestion, 'id'> & { id?: string | number },
  creatorUser: { uid: string; displayName?: string | null; email?: string | null }
): Promise<QuizQuestion> => {
  const generatedId = typeof questionData.id === 'number'
    ? String(questionData.id)
    : String(Date.now() + Math.floor(Math.random() * 1000));

  const now = new Date().toISOString();

  const payload = {
    id: generatedId,
    creator_id: creatorUser.uid,
    creator_name: creatorUser.displayName || 'Professor(a) Mendonca',
    creator_email: creatorUser.email || '',
    subject: questionData.subject || 'Geral',
    topic: questionData.topic || 'Conceitos Gerais',
    difficulty: questionData.difficulty || 'Medio',
    statement: questionData.statement || '',
    options: questionData.options || [],
    image_url: questionData.imageUrl || '',
    image_caption: questionData.imageCaption || '',
    code_snippet: questionData.codeSnippet || '',
    game_type: questionData.gameType || 'standard',
    ai_hint: questionData.aiHint || '',
    created_at: now,
    updated_at: now,
  };

  const { error } = await supabase.from('questions').upsert(payload);
  if (error) {
    console.error('Erro ao criar questao:', error.message);
    throw error;
  }

  return {
    ...questionData,
    id: Number(generatedId) || Date.now(),
  } as QuizQuestion;
};

export const getQuestions = async (): Promise<QuizQuestion[]> => {
  const { data, error } = await supabase.from('questions').select('*');
  if (error) {
    console.error('Erro ao buscar questoes:', error.message);
    return [];
  }
  return (data || []).map((row: any) => ({
    id: Number(row.id) || row.id,
    subject: row.subject || 'Geral',
    topic: row.topic || '',
    difficulty: row.difficulty || 'Medio',
    statement: row.statement || '',
    options: row.options || [],
    imageUrl: row.image_url,
    imageCaption: row.image_caption,
    codeSnippet: row.code_snippet,
    gameType: row.game_type || 'standard',
    aiHint: row.ai_hint || '',
    mathExpression: row.math_expression,
    chemicalElement: row.chemical_element,
    formulaInfo: row.formula_info,
  } as QuizQuestion));
};

export const subscribeToQuestions = (callback: (questions: QuizQuestion[]) => void): (() => void) => {
  // Carrega dados iniciais
  getQuestions().then(callback).catch(err => console.warn('Erro ao buscar questoes iniciais:', err));

  const channel = supabase
    .channel('questions-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'questions' }, () => {
      // Recarrega todos quando qualquer questao muda
      getQuestions().then(callback).catch(err => console.warn('Erro ao recarregar questoes:', err));
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const updateQuestion = async (id: string | number, updates: Partial<QuizQuestion>): Promise<void> => {
  const docId = String(id);
  const now = new Date().toISOString();

  const payload: Record<string, any> = { updated_at: now };
  if (updates.subject !== undefined) payload.subject = updates.subject;
  if (updates.topic !== undefined) payload.topic = updates.topic;
  if (updates.difficulty !== undefined) payload.difficulty = updates.difficulty;
  if (updates.statement !== undefined) payload.statement = updates.statement;
  if (updates.options !== undefined) payload.options = updates.options;
  if (updates.imageUrl !== undefined) payload.image_url = updates.imageUrl;
  if (updates.imageCaption !== undefined) payload.image_caption = updates.imageCaption;
  if (updates.codeSnippet !== undefined) payload.code_snippet = updates.codeSnippet;
  if (updates.gameType !== undefined) payload.game_type = updates.gameType;
  if (updates.aiHint !== undefined) payload.ai_hint = updates.aiHint;

  const { error } = await supabase.from('questions').update(payload).eq('id', docId);
  if (error) {
    console.error('Erro ao atualizar questao:', error.message);
    throw error;
  }
};

export const deleteQuestion = async (id: string | number): Promise<void> => {
  const { error } = await supabase.from('questions').delete().eq('id', String(id));
  if (error) {
    console.error('Erro ao deletar questao:', error.message);
    throw error;
  }
};

// ============================================================================
// 2. PERFORMANCE (Metricas e Erros em Tempo Real)
// ============================================================================

export const getUserPerformance = async (userId: string): Promise<PerformanceAnalytics | null> => {
  if (!userId) return null;
  const { data, error } = await supabase.from('performance').select('*').eq('user_id', userId).maybeSingle();
  if (error || !data) return null;
  return {
    totalAnswered: data.total_answered || 0,
    totalCorrect: data.total_correct || 0,
    totalWrong: data.total_wrong || 0,
    totalXpEarned: data.total_xp_earned || 0,
    bestStreakCombo: data.best_streak_combo || 1,
    totalSecondsPlayed: data.total_seconds_played || 0,
    subjectStats: data.subject_stats || {},
    recentQuestionsLog: data.recent_questions_log || [],
    sessionsHistory: data.sessions_history || [],
  } as PerformanceAnalytics;
};

export const subscribeToUserPerformance = (
  userId: string,
  callback: (analytics: PerformanceAnalytics | null) => void
): (() => void) => {
  if (!userId) return () => {};

  // Carrega dados iniciais
  getUserPerformance(userId).then(callback).catch(err => console.warn('Erro ao buscar performance inicial:', err));

  const channel = supabase
    .channel(`performance-${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'performance', filter: `user_id=eq.${userId}` },
      () => {
        getUserPerformance(userId).then(callback).catch(err => console.warn('Erro ao recarregar performance:', err));
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const saveUserPerformance = async (userId: string, analytics: PerformanceAnalytics): Promise<void> => {
  if (!userId) return;

  const payload = {
    user_id: userId,
    total_answered: analytics.totalAnswered || 0,
    total_correct: analytics.totalCorrect || 0,
    total_wrong: analytics.totalWrong || 0,
    total_xp_earned: analytics.totalXpEarned || 0,
    best_streak_combo: analytics.bestStreakCombo || 1,
    total_seconds_played: analytics.totalSecondsPlayed || 0,
    subject_stats: analytics.subjectStats || {},
    recent_questions_log: analytics.recentQuestionsLog || [],
    sessions_history: analytics.sessionsHistory || [],
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('performance').upsert(payload);
  if (error) {
    console.error('Erro ao salvar performance:', error.message);
    throw error;
  }
};

export const recordQuestionAnswer = async (
  userId: string,
  prevAnalytics: PerformanceAnalytics,
  record: {
    question: QuizQuestion;
    isCorrect: boolean;
    selectedOptionId: string;
    xpEarned: number;
    seconds: number;
    streakMultiplier: number;
  }
): Promise<PerformanceAnalytics> => {
  const current = prevAnalytics || {
    totalAnswered: 0,
    totalCorrect: 0,
    totalWrong: 0,
    totalXpEarned: 0,
    bestStreakCombo: 1,
    totalSecondsPlayed: 0,
    subjectStats: {},
    recentQuestionsLog: [],
    sessionsHistory: [],
  };

  const subject = record.question.subject || 'Geral';
  const topic = record.question.topic || 'Conceitos Gerais';

  const updatedSubjectStats = { ...current.subjectStats };
  if (!updatedSubjectStats[subject]) {
    updatedSubjectStats[subject] = { answered: 0, correct: 0, wrong: 0, topics: {} };
  }

  const sub = updatedSubjectStats[subject];
  sub.answered += 1;
  if (record.isCorrect) sub.correct += 1;
  else sub.wrong += 1;

  if (!sub.topics[topic]) {
    sub.topics[topic] = { answered: 0, correct: 0, wrong: 0 };
  }
  const top = sub.topics[topic];
  top.answered += 1;
  if (record.isCorrect) top.correct += 1;
  else top.wrong += 1;

  const now = new Date();
  const dateStr = `Hoje as ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

  const newLogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    date: dateStr,
    question: record.question,
    selectedOptionId: record.selectedOptionId,
    isCorrect: record.isCorrect,
  };

  const updatedLog = [newLogEntry, ...(current.recentQuestionsLog || [])].slice(0, 30);

  const newAnalytics: PerformanceAnalytics = {
    ...current,
    totalAnswered: current.totalAnswered + 1,
    totalCorrect: current.totalCorrect + (record.isCorrect ? 1 : 0),
    totalWrong: current.totalWrong + (record.isCorrect ? 0 : 1),
    totalXpEarned: current.totalXpEarned + record.xpEarned,
    totalSecondsPlayed: current.totalSecondsPlayed + record.seconds,
    bestStreakCombo: Math.max(current.bestStreakCombo || 1, record.streakMultiplier),
    subjectStats: updatedSubjectStats,
    recentQuestionsLog: updatedLog,
    sessionsHistory: current.sessionsHistory || [],
  };

  if (userId) {
    try {
      await saveUserPerformance(userId, newAnalytics);
    } catch (err) {
      console.warn('Erro ao persistir performance no Supabase:', err);
    }
  }

  return newAnalytics;
};

export const recordSessionCompleted = async (
  userId: string,
  session: PerformanceSessionHistory,
  prevAnalytics: PerformanceAnalytics
): Promise<PerformanceAnalytics> => {
  const updatedHistory = [session, ...(prevAnalytics.sessionsHistory || [])].slice(0, 20);
  const updatedAnalytics: PerformanceAnalytics = {
    ...prevAnalytics,
    sessionsHistory: updatedHistory,
  };

  if (userId) {
    try {
      await saveUserPerformance(userId, updatedAnalytics);
    } catch (err) {
      console.warn('Erro ao salvar sessao no Supabase:', err);
    }
  }

  return updatedAnalytics;
};

export const resetUserPerformance = async (userId: string): Promise<PerformanceAnalytics> => {
  const clean: PerformanceAnalytics = {
    totalAnswered: 0,
    totalCorrect: 0,
    totalWrong: 0,
    totalXpEarned: 0,
    bestStreakCombo: 1,
    totalSecondsPlayed: 0,
    subjectStats: {},
    recentQuestionsLog: [],
    sessionsHistory: [],
  };

  if (userId) {
    try {
      await saveUserPerformance(userId, clean);
    } catch (error) {
      console.error('Erro ao resetar performance:', error);
    }
  }

  return clean;
};

// ============================================================================
// 3. LEADERBOARD (Ranking Global Competitivo)
// ============================================================================

const mapLeaderboardRow = (row: any, index: number): LeaderboardUser => ({
  id: row.user_id || `row-${index}`,
  rank: index + 1,
  name: row.name || 'Estudante',
  handle: row.handle || `@${(row.name || 'estudante').toLowerCase().replace(/\s+/g, '')}`,
  avatarBg: row.avatar_bg || 'from-emerald-400 to-teal-600',
  avatarEmoji: row.avatar_emoji || '🔥',
  schoolOrGoal: row.school_or_goal || 'Estudos ENEM & Vestibular',
  score: row.score || 0,
  weeklyXp: row.weekly_xp || 0,
  streakDays: row.streak_days || 1,
  accuracy: row.accuracy || 80,
  totalQuestions: row.total_questions || 10,
  league: row.league || 'Prata',
  status: (row.status as 'online' | 'jogando' | 'offline') || 'online',
  favoriteSubject: row.favorite_subject || 'Treino Geral',
  enduranceRecordSecs: row.endurance_record_secs || 120,
});

export const getLeaderboard = async (): Promise<LeaderboardUser[]> => {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('score', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Erro ao buscar leaderboard:', error.message);
    return [];
  }
  return (data || []).map((row, index) => mapLeaderboardRow(row, index));
};

export const subscribeToLeaderboard = (callback: (users: LeaderboardUser[]) => void): (() => void) => {
  getLeaderboard().then(callback).catch(err => console.warn('Erro ao buscar leaderboard inicial:', err));

  const channel = supabase
    .channel('leaderboard-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'leaderboard' }, () => {
      getLeaderboard().then(callback).catch(err => console.warn('Erro ao recarregar leaderboard:', err));
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const saveLeaderboardEntry = async (
  userId: string,
  entry: Partial<LeaderboardUser>
): Promise<void> => {
  if (!userId) return;

  const payload: Record<string, any> = {
    user_id: userId,
    updated_at: new Date().toISOString(),
  };

  if (entry.name !== undefined) payload.name = entry.name;
  if (entry.handle !== undefined) payload.handle = entry.handle;
  if (entry.avatarEmoji !== undefined) payload.avatar_emoji = entry.avatarEmoji;
  if (entry.avatarBg !== undefined) payload.avatar_bg = entry.avatarBg;
  if (entry.schoolOrGoal !== undefined) payload.school_or_goal = entry.schoolOrGoal;
  if (entry.score !== undefined) payload.score = entry.score;
  if (entry.weeklyXp !== undefined) payload.weekly_xp = entry.weeklyXp;
  if (entry.streakDays !== undefined) payload.streak_days = entry.streakDays;
  if (entry.accuracy !== undefined) payload.accuracy = entry.accuracy;
  if (entry.totalQuestions !== undefined) payload.total_questions = entry.totalQuestions;
  if (entry.league !== undefined) payload.league = entry.league;
  if (entry.status !== undefined) payload.status = entry.status;
  if (entry.favoriteSubject !== undefined) payload.favorite_subject = entry.favoriteSubject;
  if (entry.enduranceRecordSecs !== undefined) payload.endurance_record_secs = entry.enduranceRecordSecs;

  const { error } = await supabase.from('leaderboard').upsert(payload);
  if (error) {
    console.error('Erro ao salvar leaderboard:', error.message);
    throw error;
  }
};

// ============================================================================
// 4. USERS (Perfis e Dados dos Usuarios)
// ============================================================================

export const getUserProfile = async (userId: string): Promise<any | null> => {
  if (!userId) return null;
  const { data, error } = await supabase.from('users').select('*').eq('user_id', userId).maybeSingle();
  if (error || !data) return null;
  return {
    userId: data.user_id,
    displayName: data.display_name || 'Estudante',
    email: data.email || '',
    photoURL: data.photo_url || '',
    totalXp: data.total_xp || 0,
    streak: data.streak || 1,
    highScore: data.high_score || 0,
    accuracy: data.accuracy || 0,
    totalAnswered: data.total_answered || 0,
    totalCorrect: data.total_correct || 0,
    division: data.division || 'Iniciante',
    lastActiveAt: data.last_active_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

export const saveUserProfile = async (userId: string, profile: Record<string, any>): Promise<void> => {
  if (!userId) return;

  const payload: Record<string, any> = {
    user_id: userId,
    updated_at: new Date().toISOString(),
  };

  if (profile.displayName !== undefined) payload.display_name = profile.displayName;
  if (profile.email !== undefined) payload.email = profile.email;
  if (profile.photoURL !== undefined) payload.photo_url = profile.photoURL;
  if (profile.totalXp !== undefined) payload.total_xp = profile.totalXp;
  if (profile.streak !== undefined) payload.streak = profile.streak;
  if (profile.highScore !== undefined) payload.high_score = profile.highScore;
  if (profile.accuracy !== undefined) payload.accuracy = profile.accuracy;
  if (profile.totalAnswered !== undefined) payload.total_answered = profile.totalAnswered;
  if (profile.totalCorrect !== undefined) payload.total_correct = profile.totalCorrect;
  if (profile.division !== undefined) payload.division = profile.division;
  if (profile.lastActiveAt !== undefined) payload.last_active_at = profile.lastActiveAt;
  if (profile.createdAt !== undefined) payload.created_at = profile.createdAt;

  const { error } = await supabase.from('users').upsert(payload);
  if (error) {
    console.error('Erro ao salvar perfil:', error.message);
    throw error;
  }
};
