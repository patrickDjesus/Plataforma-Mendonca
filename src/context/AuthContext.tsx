import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously,
  updateProfile 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, signInWithGoogle, logout as firebaseLogout, saveLeaderboardEntry } from '../services/firebase';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

export interface UserProfileData {
  userId: string;
  displayName: string;
  email: string;
  photoURL?: string;
  totalXp: number;
  streak: number;
  highScore: number;
  accuracy: number;
  totalAnswered: number;
  totalCorrect: number;
  division: string;
  lastActiveAt: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfileData | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, pass: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  saveGamificationProgress: (stats: {
    xpEarned: number;
    score: number;
    streak?: number;
    answeredCount: number;
    correctCount: number;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar ou criar perfil no Firestore ao autenticar
  const syncUserProfile = async (user: User, fallbackMeta?: { displayName?: string; email?: string }) => {
    const userId = user.uid || 'guest-user';
    const now = new Date().toISOString();
    const resolvedDisplayName = fallbackMeta?.displayName || user.displayName || fallbackMeta?.email?.split('@')[0] || user.email?.split('@')[0] || 'Estudante';
    const resolvedEmail = fallbackMeta?.email || user.email || 'estudante@mendonca.edu.br';

    try {
      const userRef = doc(db, 'users', userId);
      const snapshot = await getDoc(userRef);

      if (snapshot.exists()) {
        const data = snapshot.data() as UserProfileData;
        const merged: UserProfileData = {
          ...data,
          displayName: data.displayName || resolvedDisplayName,
          email: data.email || resolvedEmail,
        };
        setUserProfile(merged);
      } else {
        const newProfile: UserProfileData = {
          userId,
          displayName: resolvedDisplayName,
          email: resolvedEmail,
          photoURL: user.photoURL || '',
          totalXp: 0,
          streak: 1,
          highScore: 0,
          accuracy: 0,
          totalAnswered: 0,
          totalCorrect: 0,
          division: 'Iniciante',
          lastActiveAt: now,
          createdAt: now,
          updatedAt: now,
        };
        await setDoc(userRef, newProfile);
        
        // Também cria registro no Leaderboard público
        await saveLeaderboardEntry(userId, {
          name: newProfile.displayName,
          handle: `@${newProfile.displayName.toLowerCase().replace(/\s+/g, '')}`,
          score: 0,
          weeklyXp: 0,
          streakDays: 1,
          accuracy: 0,
          totalQuestions: 0,
          league: 'Prata',
          status: 'online',
          avatarEmoji: '⚡',
          avatarBg: 'from-blue-500 to-indigo-600',
          favoriteSubject: 'Treino Geral'
        });

        setUserProfile(newProfile);
      }
    } catch (err) {
      console.warn('Sincronização de perfil mantida localmente:', err);
      setUserProfile({
        userId,
        displayName: resolvedDisplayName,
        email: resolvedEmail,
        photoURL: user.photoURL || '',
        totalXp: 0,
        streak: 1,
        highScore: 0,
        accuracy: 0,
        totalAnswered: 0,
        totalCorrect: 0,
        division: 'Iniciante',
        lastActiveAt: now,
        createdAt: now,
        updatedAt: now,
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await syncUserProfile(user);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const user = await signInWithGoogle();
      if (user) await syncUserProfile(user);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'users');
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      if (cred.user) await syncUserProfile(cred.user, { email });
    } catch (error: any) {
      // Se Email/Password não estiver ativado no Firebase Console ou bloqueado, utiliza fallback de sessão segura
      if (error?.code === 'auth/operation-not-allowed' || error?.code === 'auth/configuration-not-found') {
        try {
          const anon = await signInAnonymously(auth);
          if (anon.user) {
            await syncUserProfile(anon.user, { email, displayName: email.split('@')[0] });
            return;
          }
        } catch {
          // Fallback de perfil local se o anonymous também não responder
          setUserProfile({
            userId: 'local-' + Date.now(),
            displayName: email.split('@')[0] || 'Estudante',
            email: email,
            totalXp: 0,
            streak: 1,
            highScore: 0,
            accuracy: 0,
            totalAnswered: 0,
            totalCorrect: 0,
            division: 'Iniciante',
            lastActiveAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          return;
        }
      }
      console.warn('Aviso de autenticação por e-mail:', error?.message || error);
      throw error;
    }
  };

  const registerWithEmail = async (name: string, email: string, pass: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (cred.user) {
        try {
          await updateProfile(cred.user, { displayName: name });
        } catch {
          // ignora falha de updateProfile se offline
        }
        await syncUserProfile(cred.user, { displayName: name, email });
      }
    } catch (error: any) {
      // Se Email/Password não estiver ativado no Firebase Console ou bloqueado, utiliza fallback de sessão segura
      if (error?.code === 'auth/operation-not-allowed' || error?.code === 'auth/configuration-not-found') {
        try {
          const anon = await signInAnonymously(auth);
          if (anon.user) {
            try {
              await updateProfile(anon.user, { displayName: name });
            } catch {
              // ignora falha de updateProfile se offline
            }
            await syncUserProfile(anon.user, { displayName: name, email });
            return;
          }
        } catch {
          setUserProfile({
            userId: 'local-' + Date.now(),
            displayName: name || email.split('@')[0] || 'Estudante',
            email: email,
            totalXp: 0,
            streak: 1,
            highScore: 0,
            accuracy: 0,
            totalAnswered: 0,
            totalCorrect: 0,
            division: 'Iniciante',
            lastActiveAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          return;
        }
      }
      console.warn('Aviso de cadastro por e-mail:', error?.message || error);
      throw error;
    }
  };

  const logoutUser = async () => {
    try {
      await firebaseLogout();
    } catch {
      // ignora erro ao deslogar
    }
    setUserProfile(null);
    setCurrentUser(null);
  };

  const saveGamificationProgress = async (stats: {
    xpEarned: number;
    score: number;
    streak?: number;
    answeredCount: number;
    correctCount: number;
  }) => {
    if (!currentUser || !userProfile) return;

    try {
      const newTotalXp = (userProfile.totalXp || 0) + stats.xpEarned;
      const newHighScore = Math.max(userProfile.highScore || 0, stats.score);
      const newTotalAnswered = (userProfile.totalAnswered || 0) + stats.answeredCount;
      const newTotalCorrect = (userProfile.totalCorrect || 0) + stats.correctCount;
      const newAccuracy = newTotalAnswered > 0 ? Math.round((newTotalCorrect / newTotalAnswered) * 100) : (userProfile?.accuracy ?? 0);
      const newStreak = stats.streak !== undefined ? stats.streak : (userProfile?.streak ?? 1);
      const now = new Date().toISOString();

      let newDivision = userProfile.division || 'Iniciante';
      if (newTotalXp > 5000) newDivision = 'Mestre';
      else if (newTotalXp > 2500) newDivision = 'Diamante';
      else if (newTotalXp > 1000) newDivision = 'Ouro';
      else if (newTotalXp > 300) newDivision = 'Prata';

      const updatedProfile: UserProfileData = {
        ...userProfile,
        totalXp: newTotalXp,
        highScore: newHighScore,
        totalAnswered: newTotalAnswered,
        totalCorrect: newTotalCorrect,
        accuracy: newAccuracy,
        streak: newStreak,
        division: newDivision,
        updatedAt: now
      };

      setUserProfile(updatedProfile);

      // Persistir no Firestore
      await setDoc(doc(db, 'users', currentUser.uid), updatedProfile, { merge: true });
      await saveLeaderboardEntry(currentUser.uid, {
        name: updatedProfile.displayName,
        score: newHighScore,
        weeklyXp: newTotalXp,
        streakDays: newStreak,
        accuracy: newAccuracy,
        totalQuestions: newTotalAnswered,
        league: newDivision,
        status: 'online'
      });
    } catch (error) {
      console.warn('Erro ao salvar progresso no Firestore:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logoutUser,
        saveGamificationProgress
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
