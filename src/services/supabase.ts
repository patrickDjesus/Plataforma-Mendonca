import { createClient, User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { QuizQuestion, PerformanceAnalytics, PerformanceSessionHistory } from '../types/design';
import { LeaderboardUser } from '../components/GlobalLeaderboard';
import { NotebookDoc } from '../data/disciplinesData';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

const formatSupabaseUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}.supabase.co`;
};

const envUrl = formatSupabaseUrl(rawUrl);

export const isSupabaseConfigured = Boolean(
  envUrl &&
  envKey &&
  !envUrl.includes('placeholder') &&
  !envKey.includes('placeholder')
);

const supabaseUrl = isSupabaseConfigured ? envUrl : 'https://placeholder.supabase.co';
const supabaseAnonKey = isSupabaseConfigured ? envKey : 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// ============================================================================
// LOCAL STORAGE FALLBACK HELPERS
// ============================================================================

const LOCAL_STORAGE_KEYS = {
  USER: 'mendonca_auth_user',
  QUESTIONS: 'mendonca_custom_questions',
  PERFORMANCE: 'mendonca_user_performance',
  LEADERBOARD: 'mendonca_leaderboard_data',
  DOCUMENTS: 'mendonca_user_documents',
  PROFILES: 'mendonca_user_profiles',
};

const authListeners = new Set<(event: AuthChangeEvent, session: Session | null) => void>();

function notifyAuthChange(event: AuthChangeEvent, session: Session | null) {
  authListeners.forEach(listener => {
    try {
      listener(event, session);
    } catch (e) {
      console.warn('Auth listener error:', e);
    }
  });
}

function getLocalUser(): User | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

function setLocalUser(user: User | null): void {
  try {
    if (user) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
    }
  } catch {
    // ignore
  }
}

function createMockUser(email: string, displayName?: string): User {
  const id = `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  return {
    id,
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: {
      full_name: displayName || email.split('@')[0] || 'Estudante',
      display_name: displayName || email.split('@')[0] || 'Estudante',
    },
    aud: 'authenticated',
    confirmation_sent_at: new Date().toISOString(),
    confirmed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    email: email,
    email_confirmed_at: new Date().toISOString(),
    phone: '',
    role: 'authenticated',
    updated_at: new Date().toISOString(),
  } as unknown as User;
}

// Override auth listener if in fallback mode
if (!isSupabaseConfigured) {
  supabase.auth.onAuthStateChange = ((callback: (event: AuthChangeEvent, session: Session | null) => void) => {
    authListeners.add(callback);
    const localUser = getLocalUser();
    if (localUser) {
      const mockSession: Session = {
        access_token: 'mock-token',
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        refresh_token: 'mock-refresh-token',
        user: localUser,
      };
      setTimeout(() => callback('INITIAL_SESSION', mockSession), 10);
    }
    return {
      data: {
        subscription: {
          id: `mock-sub-${Math.random()}`,
          callback,
          unsubscribe: () => {
            authListeners.delete(callback);
          },
        },
      },
    };
  }) as any;

  supabase.auth.getSession = (async () => {
    const localUser = getLocalUser();
    if (!localUser) return { data: { session: null }, error: null };
    const mockSession: Session = {
      access_token: 'mock-token',
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      refresh_token: 'mock-refresh-token',
      user: localUser,
    };
    return { data: { session: mockSession }, error: null };
  }) as any;

  supabase.auth.getUser = (async () => {
    const localUser = getLocalUser();
    return { data: { user: localUser }, error: null };
  }) as any;
}

// ============================================================================
// AUTH
// ============================================================================

export const signInWithGoogle = async (): Promise<void> => {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
      return;
    } catch (error) {
      console.warn('Login Google Supabase falhou, usando fallback local:', error);
    }
  }

  // Fallback demo user
  const mockGoogleUser = createMockUser('estudante@mendonca.edu.br', 'Estudante Mendonça');
  mockGoogleUser.app_metadata = { provider: 'google', providers: ['google'] };
  setLocalUser(mockGoogleUser);
  const mockSession: Session = {
    access_token: 'mock-google-token',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    refresh_token: 'mock-refresh-token',
    user: mockGoogleUser,
  };
  notifyAuthChange('SIGNED_IN', mockSession);
};

export const signInWithEmail = async (email: string, password?: string) => {
  if (isSupabaseConfigured) {
    if (!password) throw new Error('Senha obrigatória.');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  }

  const existingLocal = getLocalUser();
  const user = (existingLocal && existingLocal.email === email)
    ? existingLocal
    : createMockUser(email, email.split('@')[0]);

  setLocalUser(user);
  const mockSession: Session = {
    access_token: 'mock-token',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    refresh_token: 'mock-refresh-token',
    user,
  };
  notifyAuthChange('SIGNED_IN', mockSession);
  return user;
};

export const signUpWithEmail = async (
  email: string,
  password?: string,
  displayName?: string
): Promise<{ user: User | null; session: Session | null }> => {
  if (isSupabaseConfigured) {
    if (!password) throw new Error('Senha obrigatória.');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    if (error) throw error;
    // Com "Confirm email" habilitado, o Supabase devolve user sem session.
    return { user: data.user, session: data.session };
  }

  const user = createMockUser(email, displayName);
  setLocalUser(user);
  const mockSession: Session = {
    access_token: 'mock-token',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    refresh_token: 'mock-refresh-token',
    user,
  };
  notifyAuthChange('SIGNED_IN', mockSession);
  return { user, session: mockSession };
};

export const logout = async (): Promise<void> => {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) console.warn('Supabase signOut error:', error);
    } catch (error) {
      console.warn('Erro ao deslogar do Supabase:', error);
    }
  }
  setLocalUser(null);
  notifyAuthChange('SIGNED_OUT', null);
};

export const getCurrentUser = () => supabase.auth.getUser();
export const getCurrentSession = () => supabase.auth.getSession();

// ============================================================================
// 1. QUESTIONS (Questoes do Professor & Comunidade)
// ============================================================================

export const createQuestion = async (
  questionData: Omit<QuizQuestion, 'id'> & { id?: string | number },
  creatorUser: { id: string; displayName?: string | null; email?: string | null }
): Promise<QuizQuestion> => {
  const generatedId = typeof questionData.id === 'number'
    ? String(questionData.id)
    : String(Date.now() + Math.floor(Math.random() * 1000));

  const now = new Date().toISOString();

  const createdQuestion: QuizQuestion = {
    ...questionData,
    id: Number(generatedId) || Date.now(),
  } as QuizQuestion;

  if (isSupabaseConfigured) {
    const payload = {
      id: generatedId,
      creator_id: creatorUser.id,
      creator_name: creatorUser.displayName || 'Professor(a) Mendonca',
      creator_email: creatorUser.email || '',
      subject: questionData.subject || 'Geral',
      topic: questionData.topic || 'Conceitos Gerais',
      difficulty: questionData.difficulty || 'Médio',
      statement: questionData.statement || '',
      options: questionData.options || [],
      image_url: questionData.imageUrl || '',
      image_caption: questionData.imageCaption || '',
      code_snippet: questionData.codeSnippet || '',
      game_type: questionData.gameType || 'standard',
      ai_hint: questionData.aiHint || '',
      math_expression: questionData.mathExpression || '',
      chemical_element: questionData.chemicalElement || null,
      formula_info: questionData.formulaInfo || null,
      created_at: now,
      updated_at: now,
    };

    try {
      const { error } = await supabase.from('questions').upsert(payload, { onConflict: 'id' });
      if (!error) return createdQuestion;
    } catch (e) {
      console.warn('Erro ao criar no Supabase, salvando local:', e);
    }
  }

  // Fallback local
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.QUESTIONS);
    const list: QuizQuestion[] = saved ? JSON.parse(saved) : [];
    list.unshift(createdQuestion);
    localStorage.setItem(LOCAL_STORAGE_KEYS.QUESTIONS, JSON.stringify(list));
  } catch {
    // ignore
  }

  return createdQuestion;
};

export const getQuestions = async (): Promise<QuizQuestion[]> => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('questions').select('*');
      if (!error && data && data.length > 0) {
        return data.map((row: any) => ({
          id: Number(row.id) || row.id,
          subject: row.subject || 'Geral',
          topic: row.topic || '',
          difficulty: (row.difficulty === 'Medio' ? 'Médio' : row.difficulty) || 'Médio',
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
      }
    } catch (e) {
      console.warn('Erro ao buscar questoes do Supabase:', e);
    }
  }

  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.QUESTIONS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map((q: any) => ({
          ...q,
          difficulty: q.difficulty === 'Medio' ? 'Médio' : (q.difficulty || 'Médio'),
        }));
      }
    }
  } catch {
    // ignore
  }
  return [];
};

export const subscribeToQuestions = (callback: (questions: QuizQuestion[]) => void): (() => void) => {
  getQuestions().then(callback).catch(err => console.warn('Erro ao buscar questoes iniciais:', err));

  if (!isSupabaseConfigured) {
    return () => {};
  }

  try {
    const channel = supabase
      .channel('questions-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'questions' }, () => {
        getQuestions().then(callback).catch(err => console.warn('Erro ao recarregar questoes:', err));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch {
    return () => {};
  }
};

export const updateQuestion = async (id: string | number, updates: Partial<QuizQuestion>): Promise<void> => {
  const docId = String(id);
  const now = new Date().toISOString();

  if (isSupabaseConfigured) {
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
    if (updates.mathExpression !== undefined) payload.math_expression = updates.mathExpression;
    if (updates.chemicalElement !== undefined) payload.chemical_element = updates.chemicalElement;
    if (updates.formulaInfo !== undefined) payload.formula_info = updates.formulaInfo;

    try {
      const { error } = await supabase.from('questions').update(payload).eq('id', docId);
      if (!error) return;
    } catch {
      // fallback to local
    }
  }

  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.QUESTIONS);
    if (saved) {
      const list: QuizQuestion[] = JSON.parse(saved);
      const updated = list.map(q => String(q.id) === docId ? { ...q, ...updates } : q);
      localStorage.setItem(LOCAL_STORAGE_KEYS.QUESTIONS, JSON.stringify(updated));
    }
  } catch {
    // ignore
  }
};

export const deleteQuestion = async (id: string | number): Promise<void> => {
  const docId = String(id);
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('questions').delete().eq('id', docId);
      if (!error) return;
    } catch {
      // fallback
    }
  }

  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.QUESTIONS);
    if (saved) {
      const list: QuizQuestion[] = JSON.parse(saved);
      const updated = list.filter(q => String(q.id) !== docId);
      localStorage.setItem(LOCAL_STORAGE_KEYS.QUESTIONS, JSON.stringify(updated));
    }
  } catch {
    // ignore
  }
};

// ============================================================================
// 2. PERFORMANCE (Metricas e Erros em Tempo Real)
// ============================================================================

export const getUserPerformance = async (userId: string): Promise<PerformanceAnalytics | null> => {
  if (!userId) return null;

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('performance').select('*').eq('user_id', userId).maybeSingle();
      if (!error && data) {
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
      }
    } catch (e) {
      console.warn('Erro ao buscar performance no Supabase:', e);
    }
  }

  try {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEYS.PERFORMANCE}_${userId}`);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return null;
};

export const subscribeToUserPerformance = (
  userId: string,
  callback: (analytics: PerformanceAnalytics | null) => void
): (() => void) => {
  if (!userId) return () => {};

  getUserPerformance(userId).then(callback).catch(err => console.warn('Erro ao buscar performance inicial:', err));

  if (!isSupabaseConfigured) {
    return () => {};
  }

  try {
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
  } catch {
    return () => {};
  }
};

export const saveUserPerformance = async (userId: string, analytics: PerformanceAnalytics): Promise<void> => {
  if (!userId) return;

  try {
    localStorage.setItem(`${LOCAL_STORAGE_KEYS.PERFORMANCE}_${userId}`, JSON.stringify(analytics));
  } catch {
    // ignore
  }

  if (isSupabaseConfigured) {
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

    try {
      await supabase.from('performance').upsert(payload);
    } catch (e) {
      console.warn('Erro ao persistir performance no Supabase:', e);
    }
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

  const existingSub = current.subjectStats[subject];
  const existingTop = existingSub?.topics?.[topic] || { answered: 0, correct: 0, wrong: 0 };
  const sub = existingSub
    ? {
        ...existingSub,
        answered: existingSub.answered + 1,
        correct: existingSub.correct + (record.isCorrect ? 1 : 0),
        wrong: existingSub.wrong + (record.isCorrect ? 0 : 1),
        topics: {
          ...existingSub.topics,
          [topic]: {
            answered: existingTop.answered + 1,
            correct: existingTop.correct + (record.isCorrect ? 1 : 0),
            wrong: existingTop.wrong + (record.isCorrect ? 0 : 1),
          },
        },
      }
    : {
        answered: 1,
        correct: record.isCorrect ? 1 : 0,
        wrong: record.isCorrect ? 0 : 1,
        topics: {
          [topic]: {
            answered: 1,
            correct: record.isCorrect ? 1 : 0,
            wrong: record.isCorrect ? 0 : 1,
          },
        },
      };

  const updatedSubjectStats = {
    ...current.subjectStats,
    [subject]: sub,
  };

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

// Merges a batch of user-reported answers (e.g. imported from a JSON list) into
// the same per-user analytics structure used by the in-app game. Each record
// only carries subject + topic + whether the user got it right (no full question).
export const mergeImportedQuestions = async (
  userId: string,
  prevAnalytics: PerformanceAnalytics,
  records: { subject: string; topic: string; isCorrect: boolean }[]
): Promise<PerformanceAnalytics> => {
  if (!records || records.length === 0) return prevAnalytics;

  const base = prevAnalytics || {
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

  let totalAnswered = base.totalAnswered || 0;
  let totalCorrect = base.totalCorrect || 0;
  let totalWrong = base.totalWrong || 0;
  const subjectStats: PerformanceAnalytics['subjectStats'] = JSON.parse(JSON.stringify(base.subjectStats || {}));
  const logEntries: PerformanceAnalytics['recentQuestionsLog'] = [];

  const now = new Date();
  const dateStr = `Hoje as ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

  records.forEach((record, i) => {
    const subject = record.subject || 'Geral';
    const topic = record.topic || 'Conceitos Gerais';
    const isCorrect = !!record.isCorrect;

    const existingSub = subjectStats[subject];
    const existingTop = existingSub?.topics?.[topic] || { answered: 0, correct: 0, wrong: 0 };

    subjectStats[subject] = existingSub
      ? {
          ...existingSub,
          answered: existingSub.answered + 1,
          correct: existingSub.correct + (isCorrect ? 1 : 0),
          wrong: existingSub.wrong + (isCorrect ? 0 : 1),
          topics: {
            ...existingSub.topics,
            [topic]: {
              answered: existingTop.answered + 1,
              correct: existingTop.correct + (isCorrect ? 1 : 0),
              wrong: existingTop.wrong + (isCorrect ? 0 : 1),
            },
          },
        }
      : {
          answered: 1,
          correct: isCorrect ? 1 : 0,
          wrong: isCorrect ? 0 : 1,
          topics: {
            [topic]: {
              answered: 1,
              correct: isCorrect ? 1 : 0,
              wrong: isCorrect ? 0 : 1,
            },
          },
        };

    totalAnswered += 1;
    if (isCorrect) totalCorrect += 1;
    else totalWrong += 1;

    logEntries.push({
      id: `import-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
      date: dateStr,
      question: {
        id: Date.now() + i,
        subject,
        topic,
        difficulty: 'Médio',
        statement: `[Importado] Questão de ${subject} — ${topic}`,
        options: [
          { id: 'A', text: 'Opção A', isCorrect, explanation: '' },
          { id: 'B', text: 'Opção B', isCorrect: false, explanation: '' },
        ],
        aiHint: '',
      } as PerformanceAnalytics['recentQuestionsLog'][number]['question'],
      selectedOptionId: isCorrect ? 'A' : 'B',
      isCorrect,
    });
  });

  const newAnalytics: PerformanceAnalytics = {
    ...base,
    totalAnswered,
    totalCorrect,
    totalWrong,
    subjectStats,
    recentQuestionsLog: [...logEntries, ...(base.recentQuestionsLog || [])].slice(0, 60),
    sessionsHistory: base.sessionsHistory || [],
  };

  if (userId) {
    try {
      await saveUserPerformance(userId, newAnalytics);
    } catch (err) {
      console.warn('Erro ao persistir import no Supabase:', err);
    }
  }

  return newAnalytics;
};

export const recordSessionCompleted = async (
  userId: string,
  session: PerformanceSessionHistory,
  prevAnalytics: PerformanceAnalytics
): Promise<PerformanceAnalytics> => {
  const base = prevAnalytics || {
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
  const updatedHistory = [session, ...(base.sessionsHistory || [])].slice(0, 20);
  const updatedAnalytics: PerformanceAnalytics = {
    ...base,
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
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('score', { ascending: false })
        .limit(50);

      if (!error && data && data.length > 0) {
        return data.map((row, index) => mapLeaderboardRow(row, index));
      }
    } catch (e) {
      console.warn('Erro ao buscar leaderboard no Supabase:', e);
    }
  }

  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.LEADERBOARD);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }

  return [];
};

export const subscribeToLeaderboard = (callback: (users: LeaderboardUser[]) => void): (() => void) => {
  getLeaderboard().then(callback).catch(err => console.warn('Erro ao buscar leaderboard inicial:', err));

  if (!isSupabaseConfigured) {
    return () => {};
  }

  try {
    const channel = supabase
      .channel('leaderboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leaderboard' }, () => {
        getLeaderboard().then(callback).catch(err => console.warn('Erro ao recarregar leaderboard:', err));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch {
    return () => {};
  }
};

export const saveLeaderboardEntry = async (
  userId: string,
  entry: Partial<LeaderboardUser>
): Promise<void> => {
  if (!userId) return;

  try {
    const current = await getLeaderboard();
    const existingIdx = current.findIndex(u => u.id === userId);
    const updatedUser: LeaderboardUser = existingIdx >= 0
      ? { ...current[existingIdx], ...entry }
      : {
          id: userId,
          rank: current.length + 1,
          name: entry.name || 'Estudante',
          handle: entry.handle || `@${(entry.name || 'estudante').toLowerCase().replace(/\s+/g, '')}`,
          avatarBg: entry.avatarBg || 'from-blue-500 to-indigo-600',
          avatarEmoji: entry.avatarEmoji || '⚡',
          schoolOrGoal: entry.schoolOrGoal || 'Estudos ENEM & Vestibular',
          score: entry.score || 0,
          weeklyXp: entry.weeklyXp || 0,
          streakDays: entry.streakDays || 1,
          accuracy: entry.accuracy || 80,
          totalQuestions: entry.totalQuestions || 10,
          league: entry.league || 'Prata',
          status: entry.status || 'online',
          favoriteSubject: entry.favoriteSubject || 'Treino Geral',
          enduranceRecordSecs: entry.enduranceRecordSecs || 120,
        };

    const newList = existingIdx >= 0
      ? current.map((u, idx) => idx === existingIdx ? updatedUser : u)
      : [...current, updatedUser];

    newList.sort((a, b) => (b.score || 0) - (a.score || 0));
    const reRanked = newList.map((u, idx) => ({ ...u, rank: idx + 1 }));
    localStorage.setItem(LOCAL_STORAGE_KEYS.LEADERBOARD, JSON.stringify(reRanked));
  } catch {
    // ignore
  }

  if (isSupabaseConfigured) {
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

    try {
      await supabase.from('leaderboard').upsert(payload);
    } catch (e) {
      console.warn('Erro ao salvar leaderboard no Supabase:', e);
    }
  }
};

// ============================================================================
// 4. USERS (Perfis e Dados dos Usuarios)
// ============================================================================

export const getUserProfile = async (userId: string): Promise<any | null> => {
  if (!userId) return null;

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('users').select('*').eq('user_id', userId).maybeSingle();
      if (!error && data) {
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
      }
    } catch (e) {
      console.warn('Erro ao buscar perfil no Supabase:', e);
    }
  }

  try {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEYS.PROFILES}_${userId}`);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return null;
};

export const saveUserProfile = async (userId: string, profile: Record<string, any>): Promise<void> => {
  if (!userId) return;

  try {
    const current = (await getUserProfile(userId)) || {};
    const merged = { ...current, ...profile, userId, updatedAt: new Date().toISOString() };
    localStorage.setItem(`${LOCAL_STORAGE_KEYS.PROFILES}_${userId}`, JSON.stringify(merged));
  } catch {
    // ignore
  }

  if (isSupabaseConfigured) {
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

    try {
      await supabase.from('users').upsert(payload);
    } catch (e) {
      console.warn('Erro ao salvar perfil no Supabase:', e);
    }
  }
};

// ============================================================================
// 5. DOCUMENTS (Cadernos / Documentos por Usuario)
// ============================================================================

export const getUserDocuments = async (userId: string): Promise<NotebookDoc[]> => {
  if (!userId) return [];

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId);

      if (!error && data && data.length > 0) {
        return data.map(row => ({
          id: row.id,
          title: row.title || 'Documento sem título',
          disciplineId: row.discipline_id || '',
          lastEdited: row.last_edited || '',
          createdAt: row.created_at ? new Date(row.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '',
          author: 'Você',
          tags: row.tags || [],
          summary: row.summary || '',
          sections: row.sections || [],
          wordCount: row.word_count || 0,
          readTime: `${Math.max(1, Math.ceil((row.word_count || 0) / 120))} min`,
          starred: row.starred || false,
          isPublic: row.is_public !== false,
          glossary: row.glossary || {},
        } as NotebookDoc));
      }
    } catch (e) {
      console.warn('Erro ao buscar documentos no Supabase:', e);
    }
  }

  try {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEYS.DOCUMENTS}_${userId}`);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return [];
};

export const saveDocument = async (
  userId: string,
  doc: NotebookDoc
): Promise<void> => {
  if (!userId) return;

  try {
    const current = await getUserDocuments(userId);
    const existingIdx = current.findIndex(d => d.id === doc.id);
    const updated = existingIdx >= 0
      ? current.map(d => d.id === doc.id ? doc : d)
      : [doc, ...current];
    localStorage.setItem(`${LOCAL_STORAGE_KEYS.DOCUMENTS}_${userId}`, JSON.stringify(updated));
  } catch {
    // ignore
  }

  if (isSupabaseConfigured) {
    const payload = {
      id: doc.id,
      user_id: userId,
      discipline_id: doc.disciplineId || '',
      title: doc.title || '',
      summary: doc.summary || '',
      tags: doc.tags || [],
      starred: doc.starred || false,
      is_public: doc.isPublic !== false,
      sections: doc.sections || [],
      glossary: doc.glossary || {},
      word_count: doc.wordCount || 0,
      last_edited: doc.lastEdited || '',
      updated_at: new Date().toISOString(),
    };

    try {
      await supabase.from('documents').upsert(payload, { onConflict: 'id,user_id' });
    } catch (e) {
      console.warn('Erro ao salvar documento no Supabase:', e);
    }
  }
};

export const deleteDocument = async (userId: string, docId: string): Promise<void> => {
  if (!userId) return;

  try {
    const current = await getUserDocuments(userId);
    const updated = current.filter(d => d.id !== docId);
    localStorage.setItem(`${LOCAL_STORAGE_KEYS.DOCUMENTS}_${userId}`, JSON.stringify(updated));
  } catch {
    // ignore
  }

  if (isSupabaseConfigured) {
    try {
      await supabase.from('documents').delete().eq('id', docId).eq('user_id', userId);
    } catch (e) {
      console.warn('Erro ao deletar documento no Supabase:', e);
    }
  }
};

export const getPublicDocuments = async (excludeUserId: string): Promise<NotebookDoc[]> => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('is_public', true)
        .neq('user_id', excludeUserId);

      if (!error && data && data.length > 0) {
        return data.map(row => ({
          id: row.id,
          title: row.title || 'Documento sem título',
          disciplineId: row.discipline_id || '',
          lastEdited: row.last_edited || '',
          createdAt: row.created_at ? new Date(row.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '',
          author: 'Comunidade',
          tags: row.tags || [],
          summary: row.summary || '',
          sections: row.sections || [],
          wordCount: row.word_count || 0,
          readTime: `${Math.max(1, Math.ceil((row.word_count || 0) / 120))} min`,
          starred: row.starred || false,
          isPublic: true,
          glossary: row.glossary || {},
        } as NotebookDoc));
      }
    } catch (e) {
      console.warn('Erro ao buscar documentos publicos:', e);
    }
  }

  return [];
};
