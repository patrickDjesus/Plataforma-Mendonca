import { 
  collection, 
  getDocs, 
  deleteDoc, 
  doc, 
  setDoc, 
  writeBatch 
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { PerformanceAnalytics } from '../types/design';
import { UserProfileData } from '../context/AuthContext';

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

/**
 * Obtém a contagem atual de documentos em cada coleção do Firestore.
 */
export async function getCollectionCounts(): Promise<CollectionCounts> {
  const counts: CollectionCounts = {
    questions: 0,
    performance: 0,
    leaderboard: 0,
    users: 0,
  };

  try {
    const qSnap = await getDocs(collection(db, 'questions'));
    counts.questions = qSnap.size;
  } catch (e) {
    console.warn('Erro ao contar questions:', e);
  }

  try {
    const pSnap = await getDocs(collection(db, 'performance'));
    counts.performance = pSnap.size;
  } catch (e) {
    console.warn('Erro ao contar performance:', e);
  }

  try {
    const lSnap = await getDocs(collection(db, 'leaderboard'));
    counts.leaderboard = lSnap.size;
  } catch (e) {
    console.warn('Erro ao contar leaderboard:', e);
  }

  try {
    const uSnap = await getDocs(collection(db, 'users'));
    counts.users = uSnap.size;
  } catch (e) {
    console.warn('Erro ao contar users:', e);
  }

  return counts;
}

/**
 * Limpa todos os dados locais de teste armazenados no navegador (localStorage).
 */
export function clearLocalTestStorage(): void {
  const keysToReset = [
    'mendonca_daily_target_q',
    'mendonca_daily_target_min',
    'mendonca_study_streak',
    'mendonca_last_training_session',
    'mendonca_cached_analytics',
    'mendonca_active_focus_plan',
    'mendonca_user_progress_backup'
  ];

  keysToReset.forEach(k => {
    try {
      localStorage.removeItem(k);
    } catch {}
  });

  // Define os valores padrão iniciais limpos
  try {
    localStorage.setItem('mendonca_daily_target_q', '15');
    localStorage.setItem('mendonca_daily_target_min', '45');
  } catch {}
}

/**
 * Executa a limpeza e o reset completo das coleções do Firestore e reinicia os estados para um estado limpo.
 */
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

  report.logs.push(`[${new Date().toLocaleTimeString()}] Iniciando script de limpeza do Firestore...`);

  // 1. Limpar Coleção 'questions'
  if (options.deleteQuestions) {
    try {
      report.logs.push('Consultando coleção "questions"...');
      const questionsSnap = await getDocs(collection(db, 'questions'));
      
      if (!questionsSnap.empty) {
        let count = 0;
        for (const docSnap of questionsSnap.docs) {
          await deleteDoc(doc(db, 'questions', docSnap.id));
          count++;
        }
        report.questionsDeleted = count;
        report.logs.push(`✓ ${count} questão(ões) de teste removida(s) com sucesso.`);
      } else {
        report.logs.push('Coleção "questions" já estava vazia.');
      }
    } catch (err) {
      const msg = `Erro ao limpar coleção "questions": ${err instanceof Error ? err.message : String(err)}`;
      report.errors.push(msg);
      report.logs.push(`✗ ${msg}`);
      report.success = false;
    }
  }

  // 2. Limpar/Resetar Coleção 'leaderboard'
  if (options.deleteLeaderboard) {
    try {
      report.logs.push('Consultando coleção "leaderboard"...');
      const leaderboardSnap = await getDocs(collection(db, 'leaderboard'));
      
      if (!leaderboardSnap.empty) {
        let count = 0;
        for (const docSnap of leaderboardSnap.docs) {
          await deleteDoc(doc(db, 'leaderboard', docSnap.id));
          count++;
        }
        report.leaderboardDeletedCount = count;
        report.logs.push(`✓ ${count} entrada(s) de placar/ranking removida(s) do leaderboard.`);
      } else {
        report.logs.push('Coleção "leaderboard" já estava vazia.');
      }
    } catch (err) {
      const msg = `Erro ao limpar "leaderboard": ${err instanceof Error ? err.message : String(err)}`;
      report.errors.push(msg);
      report.logs.push(`✗ ${msg}`);
      report.success = false;
    }
  }

  // 3. Resetar Coleção 'performance' para o estado inicial zerado
  if (options.resetPerformance) {
    try {
      report.logs.push('Consultando coleção "performance"...');
      const perfSnap = await getDocs(collection(db, 'performance'));
      
      if (!perfSnap.empty) {
        let count = 0;
        for (const docSnap of perfSnap.docs) {
          const userId = docSnap.id;
          const cleanAnalytics: PerformanceAnalytics = {
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
          
          await setDoc(doc(db, 'performance', userId), {
            ...cleanAnalytics,
            userId,
            updatedAt: new Date().toISOString(),
          });
          count++;
        }
        report.performanceResetCount = count;
        report.logs.push(`✓ ${count} perfil(is) de performance reiniciado(s) para o estado inicial limpo (0 XP, 0 acertos/erros).`);
      } else {
        report.logs.push('Coleção "performance" já estava vazia.');
      }
    } catch (err) {
      const msg = `Erro ao resetar "performance": ${err instanceof Error ? err.message : String(err)}`;
      report.errors.push(msg);
      report.logs.push(`✗ ${msg}`);
      report.success = false;
    }
  }

  // 4. Resetar Progresso e Streaks dos Usuários na Coleção 'users'
  if (options.resetUsersProgress) {
    try {
      report.logs.push('Consultando coleção "users"...');
      const usersSnap = await getDocs(collection(db, 'users'));
      
      if (!usersSnap.empty) {
        let count = 0;
        for (const docSnap of usersSnap.docs) {
          const uData = docSnap.data();
          const userId = docSnap.id;

          const resetUserData: Partial<UserProfileData> = {
            totalXp: 0,
            streak: 1,
            highScore: 0,
            accuracy: 0,
            totalAnswered: 0,
            totalCorrect: 0,
            division: 'Bronze I',
            updatedAt: new Date().toISOString(),
          };

          await setDoc(doc(db, 'users', userId), {
            ...uData,
            ...resetUserData,
          }, { merge: true });

          count++;
        }
        report.usersResetCount = count;
        report.logs.push(`✓ ${count} usuário(s) com streak reiniciado (1 dia), XP zerado e divisão Bronze I.`);
      } else {
        report.logs.push('Coleção "users" vazia.');
      }
    } catch (err) {
      const msg = `Erro ao resetar progresso de usuários: ${err instanceof Error ? err.message : String(err)}`;
      report.errors.push(msg);
      report.logs.push(`✗ ${msg}`);
      report.success = false;
    }
  }

  // 5. Limpeza Local de Cache & Metas
  if (options.clearLocalStorage) {
    clearLocalTestStorage();
    report.localStorageCleared = true;
    report.logs.push('✓ Cache local, metas e preferências temporárias reiniciadas no navegador.');
  }

  report.logs.push(`[${new Date().toLocaleTimeString()}] Limpeza finalizada com status: ${report.success ? 'SUCESSO TOTAL' : 'PARCIAL COM AVISOS'}.`);

  return report;
}

/**
 * Reseta o progresso individual de um usuário específico para o estado inicial limpo.
 */
export async function resetSingleUserProgress(
  userId: string,
  userData?: Partial<UserProfileData>
): Promise<void> {
  if (!userId) return;

  const now = new Date().toISOString();

  // Reset Performance
  const cleanAnalytics: PerformanceAnalytics = {
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

  await setDoc(doc(db, 'performance', userId), {
    ...cleanAnalytics,
    userId,
    updatedAt: now,
  });

  // Reset User Profile Stats
  const resetProfile: Partial<UserProfileData> = {
    totalXp: 0,
    streak: 1,
    highScore: 0,
    accuracy: 0,
    totalAnswered: 0,
    totalCorrect: 0,
    division: 'Bronze I',
    updatedAt: now,
  };

  await setDoc(doc(db, 'users', userId), {
    userId,
    displayName: userData?.displayName || 'Estudante',
    email: userData?.email || '',
    photoURL: userData?.photoURL || '',
    ...resetProfile,
  }, { merge: true });

  // Delete Leaderboard entry or reset it
  try {
    await deleteDoc(doc(db, 'leaderboard', userId));
  } catch {}

  clearLocalTestStorage();
}
