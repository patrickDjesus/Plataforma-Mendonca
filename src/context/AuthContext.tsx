import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, signInWithGoogle, logout as firebaseLogout } from '../firebase';
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

  // Carregar ou criar perfil no Firestore ao mudar de usuário
  const syncUserProfile = async (user: User) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const snapshot = await getDoc(userRef);

      const now = new Date().toISOString();

      if (snapshot.exists()) {
        const data = snapshot.data() as UserProfileData;
        setUserProfile(data);
      } else {
        const newProfile: UserProfileData = {
          userId: user.uid,
          displayName: user.displayName || user.email?.split('@')[0] || 'Estudante',
          email: user.email || '',
          photoURL: user.photoURL || '',
          totalXp: 1200,
          streak: 14,
          highScore: 1250,
          accuracy: 84,
          totalAnswered: 45,
          totalCorrect: 38,
          division: 'Diamante',
          lastActiveAt: now,
          createdAt: now,
          updatedAt: now,
        };
        await setDoc(userRef, newProfile);
        
        // Também cria registro no Leaderboard público
        await setDoc(doc(db, 'leaderboard', user.uid), {
          userId: user.uid,
          name: newProfile.displayName,
          avatar: newProfile.photoURL || '',
          totalXp: newProfile.totalXp,
          streak: newProfile.streak,
          highScore: newProfile.highScore,
          accuracy: newProfile.accuracy,
          division: newProfile.division,
          badge: 'Novato Brilhante',
          updatedAt: now
        });

        setUserProfile(newProfile);
      }
    } catch (err) {
      console.warn('Erro ao sincronizar perfil Firestore:', err);
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
      if (cred.user) await syncUserProfile(cred.user);
    } catch (error) {
      console.error('Login email failed:', error);
      throw error;
    }
  };

  const registerWithEmail = async (name: string, email: string, pass: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (cred.user) {
        await updateProfile(cred.user, { displayName: name });
        await syncUserProfile(cred.user);
      }
    } catch (error) {
      console.error('Register email failed:', error);
      throw error;
    }
  };

  const logoutUser = async () => {
    await firebaseLogout();
    setUserProfile(null);
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
      const newAccuracy = newTotalAnswered > 0 ? Math.round((newTotalCorrect / newTotalAnswered) * 100) : userProfile.accuracy;
      const newStreak = stats.streak !== undefined ? stats.streak : userProfile.streak;
      const now = new Date().toISOString();

      const updatedProfile: UserProfileData = {
        ...userProfile,
        totalXp: newTotalXp,
        highScore: newHighScore,
        totalAnswered: newTotalAnswered,
        totalCorrect: newTotalCorrect,
        accuracy: newAccuracy,
        streak: newStreak,
        updatedAt: now
      };

      setUserProfile(updatedProfile);

      // Persistir no Firestore
      await setDoc(doc(db, 'users', currentUser.uid), updatedProfile, { merge: true });
      await setDoc(doc(db, 'leaderboard', currentUser.uid), {
        userId: currentUser.uid,
        name: updatedProfile.displayName,
        avatar: updatedProfile.photoURL || '',
        totalXp: newTotalXp,
        streak: newStreak,
        highScore: newHighScore,
        accuracy: newAccuracy,
        division: updatedProfile.division,
        updatedAt: now
      }, { merge: true });
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
