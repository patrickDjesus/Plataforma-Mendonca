import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, signInWithGoogle, signInWithEmail as supabaseSignInWithEmail, signUpWithEmail as supabaseSignUpWithEmail, logout as supabaseLogout, getUserProfile, saveUserProfile, saveLeaderboardEntry } from '../services/supabase';

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

  // Sincronizar perfil do usuario no Supabase
  const syncUserProfile = async (user: User, fallbackMeta?: { displayName?: string; email?: string }) => {
    const userId = user.id;
    const now = new Date().toISOString();
    const resolvedDisplayName = fallbackMeta?.displayName || user.user_metadata?.display_name || user.user_metadata?.full_name || fallbackMeta?.email?.split('@')[0] || user.email?.split('@')[0] || 'Estudante';
    const resolvedEmail = fallbackMeta?.email || user.email || 'estudante@mendonca.edu.br';
    const photoURL = user.user_metadata?.avatar_url || '';

    try {
      const existing = await getUserProfile(userId);

      if (existing) {
        const merged: UserProfileData = {
          ...existing,
          displayName: existing.displayName || resolvedDisplayName,
          email: existing.email || resolvedEmail,
        };
        setUserProfile(merged);
      } else {
        const newProfile: UserProfileData = {
          userId,
          displayName: resolvedDisplayName,
          email: resolvedEmail,
          photoURL,
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

        await saveUserProfile(userId, {
          displayName: newProfile.displayName,
          email: newProfile.email,
          photoURL: newProfile.photoURL,
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
          favoriteSubject: 'Treino Geral',
        });

        setUserProfile(newProfile);
      }
    } catch (err) {
      console.warn('Sincronizacao de perfil mantida localmente:', err);
      setUserProfile({
        userId,
        displayName: resolvedDisplayName,
        email: resolvedEmail,
        photoURL,
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

  // Listener de autenticacao Supabase
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user || null;
      setCurrentUser(user);
      if (user) {
        await syncUserProfile(user);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    // Verifica sessao existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user || null;
      setCurrentUser(user);
      if (user) {
        syncUserProfile(user);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithGoogle();
      // OAuth redireciona - onAuthStateChange cuida do resto
    } catch (error) {
      console.warn('Erro login Google:', error);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      const user = await supabaseSignInWithEmail(email, pass);
      if (user) await syncUserProfile(user as any, { email });
    } catch (error: any) {
      console.warn('Aviso de autenticacao por e-mail:', error?.message || error);
      throw error;
    }
  };

  const registerWithEmail = async (name: string, email: string, pass: string) => {
    try {
      const user = await supabaseSignUpWithEmail(email, pass, name);
      if (user) await syncUserProfile(user as any, { displayName: name, email });
    } catch (error: any) {
      console.warn('Aviso de cadastro por e-mail:', error?.message || error);
      throw error;
    }
  };

  const logoutUser = async () => {
    try {
      await supabaseLogout();
    } catch (error) {
      console.warn('Erro ao deslogar, limpando estado local:', error);
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
        updatedAt: now,
      };

      setUserProfile(updatedProfile);

      await saveUserProfile(currentUser.id, {
        totalXp: newTotalXp,
        highScore: newHighScore,
        totalAnswered: newTotalAnswered,
        totalCorrect: newTotalCorrect,
        accuracy: newAccuracy,
        streak: newStreak,
        division: newDivision,
        updatedAt: now,
      });

      await saveLeaderboardEntry(currentUser.id, {
        name: updatedProfile.displayName,
        score: newHighScore,
        weeklyXp: newTotalXp,
        streakDays: newStreak,
        accuracy: newAccuracy,
        totalQuestions: newTotalAnswered,
        league: newDivision,
        status: 'online',
      });
    } catch (error) {
      console.warn('Erro ao salvar progresso no Supabase:', error);
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
        saveGamificationProgress,
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
