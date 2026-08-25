import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore,
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { QuizQuestion, PerformanceAnalytics, PerformanceSessionHistory } from '../types/design';
import { LeaderboardUser } from '../components/GlobalLeaderboard';
import { UserProfileData } from '../context/AuthContext';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

// Inicialização segura do Firebase App e Firestore
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Inicializa o Firestore com detecção automática de Long Polling para contornar restrições de rede/iframe
export const db = (() => {
  try {
    return initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
      ignoreUndefinedProperties: true,
    }, (firebaseConfig as any).firestoreDatabaseId || undefined);
  } catch {
    return getFirestore(app, (firebaseConfig as any).firestoreDatabaseId || undefined);
  }
})();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async (): Promise<User | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.warn('Login Google popup:', error);
    return null;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.warn('Erro ao sair:', error);
    throw error;
  }
};

// Validação de conexão não-bloqueante com persistência offline transparente
export async function testConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error: any) {
    // Quando em ambiente offline ou antes da primeira sincronização bem-sucedida,
    // o Firestore opera automaticamente em cache local sem quebrar a interface
    if (
      error?.code === 'unavailable' ||
      (error instanceof Error && (
        error.message.includes('offline') || 
        error.message.includes('unavailable') || 
        error.message.includes('Could not reach Cloud Firestore')
      ))
    ) {
      // Conexão em segundo plano ou em modo offline gerenciado
      return;
    }
  }
}
testConnection();

// ============================================================================
// 1. SERVIÇOS CRUD PARA A COLEÇÃO 'questions' (Questões do Professor & Comunidade)
// ============================================================================

export const createQuestion = async (
  questionData: Omit<QuizQuestion, 'id'> & { id?: string | number },
  creatorUser: { uid: string; displayName?: string | null; email?: string | null }
): Promise<QuizQuestion> => {
  const generatedId = typeof questionData.id === 'number' 
    ? String(questionData.id) 
    : String(Date.now() + Math.floor(Math.random() * 1000));
  
  const docRef = doc(db, 'questions', generatedId);
  const now = new Date().toISOString();

  const payload = {
    id: generatedId,
    creatorId: creatorUser.uid,
    creatorName: creatorUser.displayName || 'Professor(a) Mendonça',
    creatorEmail: creatorUser.email || '',
    subject: questionData.subject || 'Geral',
    topic: questionData.topic || 'Conceitos Gerais',
    difficulty: questionData.difficulty || 'Médio',
    statement: questionData.statement || '',
    options: questionData.options || [],
    imageUrl: questionData.imageUrl || '',
    imageCaption: questionData.imageCaption || '',
    codeSnippet: questionData.codeSnippet || '',
    gameType: questionData.gameType || 'standard',
    aiHint: questionData.aiHint || '',
    createdAt: now,
    updatedAt: now
  };

  try {
    await setDoc(docRef, payload);
    return {
      ...questionData,
      id: Number(generatedId) || Date.now(),
    } as QuizQuestion;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `questions/${generatedId}`);
  }
};

export const getQuestions = async (): Promise<QuizQuestion[]> => {
  try {
    const q = query(collection(db, 'questions'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => {
      const data = d.data();
      return {
        id: Number(data.id) || d.id,
        subject: data.subject || 'Geral',
        topic: data.topic || '',
        difficulty: data.difficulty || 'Médio',
        statement: data.statement || '',
        options: data.options || [],
        imageUrl: data.imageUrl,
        imageCaption: data.imageCaption,
        codeSnippet: data.codeSnippet,
        gameType: data.gameType || 'standard',
        aiHint: data.aiHint || '',
        mathExpression: data.mathExpression,
        chemicalElement: data.chemicalElement,
        formulaInfo: data.formulaInfo
      } as QuizQuestion;
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'questions');
  }
};

export const subscribeToQuestions = (callback: (questions: QuizQuestion[]) => void): (() => void) => {
  const colRef = collection(db, 'questions');
  return onSnapshot(colRef, (snapshot) => {
    const questions: QuizQuestion[] = snapshot.docs.map(d => {
      const data = d.data();
      return {
        id: Number(data.id) || d.id,
        subject: data.subject || 'Geral',
        topic: data.topic || '',
        difficulty: data.difficulty || 'Médio',
        statement: data.statement || '',
        options: data.options || [],
        imageUrl: data.imageUrl,
        imageCaption: data.imageCaption,
        codeSnippet: data.codeSnippet,
        gameType: data.gameType || 'standard',
        aiHint: data.aiHint || '',
        mathExpression: data.mathExpression,
        chemicalElement: data.chemicalElement,
        formulaInfo: data.formulaInfo
      } as QuizQuestion;
    });
    callback(questions);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'questions');
  });
};

export const updateQuestion = async (id: string | number, updates: Partial<QuizQuestion>): Promise<void> => {
  const docId = String(id);
  const docRef = doc(db, 'questions', docId);
  try {
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `questions/${docId}`);
  }
};

export const deleteQuestion = async (id: string | number): Promise<void> => {
  const docId = String(id);
  const docRef = doc(db, 'questions', docId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `questions/${docId}`);
  }
};

// ============================================================================
// 2. SERVIÇOS CRUD PARA A COLEÇÃO 'performance' (Métricas e Erros em Tempo Real)
// ============================================================================

export const getUserPerformance = async (userId: string): Promise<PerformanceAnalytics | null> => {
  if (!userId) return null;
  const docRef = doc(db, 'performance', userId);
  try {
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as PerformanceAnalytics;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `performance/${userId}`);
  }
};

export const subscribeToUserPerformance = (
  userId: string, 
  callback: (analytics: PerformanceAnalytics | null) => void
): (() => void) => {
  if (!userId) return () => {};
  const docRef = doc(db, 'performance', userId);
  return onSnapshot(docRef, (snap) => {
    if (snap.exists()) {
      callback(snap.data() as PerformanceAnalytics);
    } else {
      callback(null);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, `performance/${userId}`);
  });
};

export const saveUserPerformance = async (userId: string, analytics: PerformanceAnalytics): Promise<void> => {
  if (!userId) return;
  const docRef = doc(db, 'performance', userId);
  try {
    await setDoc(docRef, {
      ...analytics,
      userId,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `performance/${userId}`);
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
    sessionsHistory: []
  };

  const subject = record.question.subject || 'Geral';
  const topic = record.question.topic || 'Conceitos Gerais';

  // Atualiza estatísticas por matéria e tópico
  const updatedSubjectStats = { ...current.subjectStats };
  if (!updatedSubjectStats[subject]) {
    updatedSubjectStats[subject] = {
      answered: 0,
      correct: 0,
      wrong: 0,
      topics: {}
    };
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
  const dateStr = `Hoje às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

  const newLogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    date: dateStr,
    question: record.question,
    selectedOptionId: record.selectedOptionId,
    isCorrect: record.isCorrect
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
    sessionsHistory: current.sessionsHistory || []
  };

  if (userId) {
    try {
      await saveUserPerformance(userId, newAnalytics);
    } catch (err) {
      console.warn('Erro ao persistir performance no Firebase:', err);
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
    sessionsHistory: updatedHistory
  };

  if (userId) {
    try {
      await saveUserPerformance(userId, updatedAnalytics);
    } catch (err) {
      console.warn('Erro ao salvar sessão no Firebase:', err);
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
    sessionsHistory: []
  };

  if (userId) {
    try {
      const docRef = doc(db, 'performance', userId);
      await setDoc(docRef, { ...clean, userId, updatedAt: new Date().toISOString() });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `performance/${userId}`);
    }
  }

  return clean;
};

// ============================================================================
// 3. SERVIÇOS CRUD PARA A COLEÇÃO 'leaderboard' (Ranking Global Competitivo)
// ============================================================================

export const getLeaderboard = async (): Promise<LeaderboardUser[]> => {
  try {
    const q = query(collection(db, 'leaderboard'), orderBy('score', 'desc'), limit(50));
    const snap = await getDocs(q);
    return snap.docs.map((d, index) => {
      const data = d.data();
      return {
        id: d.id,
        rank: index + 1,
        name: data.name || 'Estudante',
        handle: data.handle || `@${(data.name || 'estudante').toLowerCase().replace(/\s+/g, '')}`,
        avatarBg: data.avatarBg || 'from-emerald-400 to-teal-600',
        avatarEmoji: data.avatarEmoji || '🔥',
        schoolOrGoal: data.schoolOrGoal || 'Estudos ENEM & Vestibular',
        score: data.score || data.totalXp || 0,
        weeklyXp: data.weeklyXp || Math.round((data.score || 0) * 0.4),
        streakDays: data.streakDays || data.streak || 1,
        accuracy: data.accuracy || 80,
        totalQuestions: data.totalQuestions || 10,
        league: data.league || 'Diamante',
        status: (data.status as 'online' | 'jogando' | 'offline') || 'online',
        favoriteSubject: data.favoriteSubject || 'Treino Geral',
        enduranceRecordSecs: data.enduranceRecordSecs || 120
      };
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'leaderboard');
  }
};

export const subscribeToLeaderboard = (
  callback: (users: LeaderboardUser[]) => void
): (() => void) => {
  const colRef = collection(db, 'leaderboard');
  const q = query(colRef, orderBy('score', 'desc'), limit(50));

  return onSnapshot(q, (snap) => {
    const users: LeaderboardUser[] = snap.docs.map((d, index) => {
      const data = d.data();
      return {
        id: d.id,
        rank: index + 1,
        name: data.name || 'Estudante',
        handle: data.handle || `@${(data.name || 'estudante').toLowerCase().replace(/\s+/g, '')}`,
        avatarBg: data.avatarBg || 'from-emerald-400 to-teal-600',
        avatarEmoji: data.avatarEmoji || '🔥',
        schoolOrGoal: data.schoolOrGoal || 'Estudos ENEM & Vestibular',
        score: data.score || data.totalXp || 0,
        weeklyXp: data.weeklyXp || Math.round((data.score || 0) * 0.4),
        streakDays: data.streakDays || data.streak || 1,
        accuracy: data.accuracy || 80,
        totalQuestions: data.totalQuestions || 10,
        league: data.league || 'Diamante',
        status: (data.status as 'online' | 'jogando' | 'offline') || 'online',
        favoriteSubject: data.favoriteSubject || 'Treino Geral',
        enduranceRecordSecs: data.enduranceRecordSecs || 120
      };
    });
    callback(users);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'leaderboard');
  });
};

export const saveLeaderboardEntry = async (
  userId: string,
  entry: Partial<LeaderboardUser>
): Promise<void> => {
  if (!userId) return;
  const docRef = doc(db, 'leaderboard', userId);
  try {
    await setDoc(docRef, {
      ...entry,
      userId,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `leaderboard/${userId}`);
  }
};

// ============================================================================
// 4. SERVIÇOS CRUD PARA A COLEÇÃO 'users' (Perfis e Dados dos Usuários)
// ============================================================================

export const getUserProfile = async (userId: string): Promise<UserProfileData | null> => {
  if (!userId) return null;
  const docRef = doc(db, 'users', userId);
  try {
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as UserProfileData;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${userId}`);
  }
};

export const saveUserProfile = async (
  userId: string, 
  profile: Partial<UserProfileData>
): Promise<void> => {
  if (!userId) return;
  const docRef = doc(db, 'users', userId);
  try {
    await setDoc(docRef, {
      ...profile,
      userId,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
  }
};
