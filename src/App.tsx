import React, { useState, useEffect, useRef } from 'react';
import { ScreenId } from './types/design';
import { Navbar } from './components/Navbar';
import { HomeDashboard } from './components/HomeDashboard';
import { AuthScreen } from './components/AuthScreen';
import { LoadingTransition } from './components/LoadingTransition';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { CommandPalette } from './components/CommandPalette';
import { CadernoWorkspace } from './components/CadernoWorkspace';
import { MapaConceitos } from './components/MapaConceitos';
import { TreinoGamificacao } from './components/TreinoGamificacao';
import { StudyNotification } from './types/notification';
import { AnimatePresence, motion } from 'motion/react';
import { Moon, Sun } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { isGameActive } from './utils/gameActivity';

export const App: React.FC = () => {
  const { currentUser, userProfile, logoutUser } = useAuth();
  const [authState, setAuthState] = useState<'unauthenticated' | 'loading' | 'authenticated'>('loading');
  const [user, setUser] = useState({
    name: 'Estudante',
    email: 'estudante@mendonca.edu.br',
    avatar: 'EM',
  });
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('home');
  const [streakCount, setStreakCount] = useState<number>(1);

  // Sincroniza com Supabase Auth
  useEffect(() => {
    if (currentUser) {
      const displayName = currentUser.displayName || userProfile?.displayName || 'Estudante';
      const initials = displayName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(n => n[0])
        .join('')
        .toUpperCase();

      setUser({
        name: displayName,
        email: currentUser.email || 'estudante@mendonca.edu.br',
        avatar: initials || 'EM'
      });
      setStreakCount(userProfile?.streak ?? 1);
      setAuthState('authenticated');
    } else {
      setAuthState('unauthenticated');
    }
  }, [currentUser, userProfile]);

  
  // Dark Mode State with Smooth Cinematic Screen Flash Transition
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mendonca_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const [isThemeTransitioning, setIsThemeTransitioning] = useState(false);
  const [transitionTarget, setTransitionTarget] = useState<'light' | 'dark'>('light');
  const themeTimerRef = useRef<{ theme: ReturnType<typeof setTimeout>; overlay: ReturnType<typeof setTimeout> } | null>(null);

  // Notifications & Command Palette State
  const [notifications, setNotifications] = useState<StudyNotification[]>(() => {
    try {
      const saved = localStorage.getItem('mendonca_notifications');
      if (saved) {
        return JSON.parse(saved) as StudyNotification[];
      }
    } catch {
      // localStorage indisponivel (ex: Safari private mode)
    }
    return [];
  });
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('mendonca_notifications', JSON.stringify(notifications));
    } catch {
      // localStorage cheio ou indisponivel
    }
  }, [notifications]);

  // Sync dark class on documentElement and body
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (theme === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
    }
    localStorage.setItem('mendonca_theme', theme);
  }, [theme]);

  // Global Keyboard Shortcuts (Cmd+K, /, Esc, 1-4, N)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      // Cmd+K or Ctrl+K -> Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
        return;
      }

      // Escape -> Close Command Palette / Notifications Drawer / Blur Input
      if (e.key === 'Escape') {
        if (isCommandPaletteOpen) {
          e.preventDefault();
          setIsCommandPaletteOpen(false);
          return;
        }
        if (isNotificationsOpen) {
          e.preventDefault();
          setIsNotificationsOpen(false);
          return;
        }
        if (isInput) {
          target.blur();
        }
        return;
      }

      // '/' -> Focus active search input on screen or open Command Palette
      if (e.key === '/' && !isInput && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement | null;
        if (searchInput && document.body.contains(searchInput)) {
          searchInput.focus();
          searchInput.select();
        } else {
          setIsCommandPaletteOpen(true);
        }
        return;
      }

      // Quick jumps when not in an input
      if (!isInput && authState === 'authenticated' && !isCommandPaletteOpen && !isNotificationsOpen && !isGameActive()) {
        if (e.key === '1') {
          setCurrentScreen('home');
        } else if (e.key === '2') {
          setCurrentScreen('caderno');
        } else if (e.key === '3') {
          setCurrentScreen('treino');
        } else if (e.key === '4') {
          setCurrentScreen('mapa');
        } else if (e.key.toLowerCase() === 'n' && !e.metaKey && !e.ctrlKey) {
          setIsNotificationsOpen(prev => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [authState, isCommandPaletteOpen, isNotificationsOpen]);

  const toggleTheme = () => {
    if (isThemeTransitioning) return;
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTransitionTarget(nextTheme);
    setIsThemeTransitioning(true);

    // Limpar timers anteriores
    if (themeTimerRef.current) {
      clearTimeout(themeTimerRef.current.theme);
      clearTimeout(themeTimerRef.current.overlay);
    }

    const themeTimer = setTimeout(() => {
      setTheme(nextTheme);
    }, 750);

    const overlayTimer = setTimeout(() => {
      setIsThemeTransitioning(false);
    }, 1800);

    themeTimerRef.current = { theme: themeTimer, overlay: overlayTimer };
  };

  useEffect(() => {
    return () => {
      if (themeTimerRef.current) {
        clearTimeout(themeTimerRef.current.theme);
        clearTimeout(themeTimerRef.current.overlay);
      }
    };
  }, []);

  const handleLoginSuccess = (userData: { name: string; email: string; avatar: string }) => {
    setUser(userData);
    setAuthState('loading');
  };

  const handleLoadingFinish = () => {
    setAuthState('authenticated');
    setCurrentScreen('home');
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.warn('Erro ao fazer logout:', error);
    }
    setAuthState('unauthenticated');
  };


  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const hasRedAlert = notifications.some(n => n.level === 'red' && !n.read);
  const hasYellowAlert = notifications.some(n => n.level === 'yellow' && !n.read);

  return (
    <div className={`min-h-screen w-full transition-colors duration-200 ${theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-[#F8FAFC] text-slate-900'}`}>
      <AnimatePresence mode="wait">
        
        {/* TELA 1: LOGIN / REGISTRO COM PLATAFORMA MENDONÇA */}
        {authState === 'unauthenticated' && (
          <motion.div
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.28 }}
            className="w-full min-h-screen"
          >
            <AuthScreen onLoginSuccess={handleLoginSuccess} />
          </motion.div>
        )}

        {/* TELA 2: ANIMAÇÃO DE LOADING NEURAL */}
        {authState === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.35 }}
            className="w-full h-screen"
          >
            <LoadingTransition
              userName={user.name}
              onFinish={handleLoadingFinish}
            />
          </motion.div>
        )}

        {/* TELA 3: APLICAÇÃO PRINCIPAL (DASHBOARD & MÓDULOS) */}
        {authState === 'authenticated' && (
          <motion.div
            key="app-main"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col h-screen w-full bg-[#F8FAFC] dark:bg-slate-950 overflow-hidden text-slate-900 dark:text-slate-100 selection:bg-blue-100 selection:text-blue-900"
          >
            {/* MENU HEADER SUPERIOR COM TABS ANIMADAS, TEMA E NOTIFICAÇÕES */}
            <Navbar
              currentScreen={currentScreen}
              setCurrentScreen={setCurrentScreen}
              streakCount={streakCount}
              user={user}
              onLogout={handleLogout}
              theme={theme}
              toggleTheme={toggleTheme}
              onOpenNotifications={() => setIsNotificationsOpen(true)}
              onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
              unreadNotificationsCount={unreadCount}
              hasRedAlert={hasRedAlert}
              hasYellowAlert={hasYellowAlert}
            />

            {/* PAINEL LATERAL TRANSLÚCIDO DE NOTIFICAÇÕES COM 3 NÍVEIS DE ALERTA */}
            <NotificationsDrawer
              isOpen={isNotificationsOpen}
              onClose={() => setIsNotificationsOpen(false)}
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
              onNavigate={(screen) => setCurrentScreen(screen)}
            />

            {/* PALETA DE COMANDOS GLOBAL (CMD+K / CTRL+K / ATALHOS) */}
            <CommandPalette
              isOpen={isCommandPaletteOpen}
              onClose={() => setIsCommandPaletteOpen(false)}
              currentScreen={currentScreen}
              onNavigate={(screen) => setCurrentScreen(screen)}
              theme={theme}
              onToggleTheme={toggleTheme}
              onOpenNotifications={() => setIsNotificationsOpen(true)}
            />

            {/* ÁREA PRINCIPAL COM TRANSIÇÕES SUAVES ENTRE TELAS */}
            <main className="flex-1 flex flex-col p-4 sm:p-6 lg:px-8 lg:py-6 overflow-hidden relative max-w-7xl mx-auto w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentScreen}
                  initial={{ opacity: 0, y: 12, scale: 0.995 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.995 }}
                  transition={{
                    duration: 0.24,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="flex-1 flex flex-col overflow-hidden h-full"
                >
                  {currentScreen === 'home' && (
                    <HomeDashboard
                      onNavigate={setCurrentScreen}
                      streakCount={streakCount}
                    />
                  )}

                  {currentScreen === 'caderno' && (
                    <div className="flex-1 overflow-hidden h-full">
                      <CadernoWorkspace onNavigate={setCurrentScreen} />
                    </div>
                  )}

                  {currentScreen === 'mapa' && (
                    <div className="flex-1 overflow-hidden h-full">
                      <MapaConceitos onNavigate={setCurrentScreen} />
                    </div>
                  )}

                  {currentScreen === 'treino' && (
                    <div className="flex-1 overflow-hidden h-full">
                      <TreinoGamificacao
                        onNavigate={setCurrentScreen}
                        streakCount={streakCount}
                        onStreakChange={setStreakCount}
                      />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </main>
          </motion.div>
        )}

      </AnimatePresence>

      {/* OVERLAY DE TRANSIÇÃO CINEMÁTICA COMPLETA AO ALTERNAR MODO CLARO / ESCURO */}
      <AnimatePresence>
        {isThemeTransitioning && (
          <motion.div
            key={`theme-transition-${transitionTarget}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.75, times: [0, 0.25, 0.75, 1], ease: 'easeInOut' }}
            className={`fixed inset-0 z-[99999] pointer-events-none flex flex-col items-center justify-center overflow-hidden ${
              transitionTarget === 'dark'
                ? 'bg-slate-950 text-white'
                : 'bg-slate-50 text-slate-900'
            }`}
          >
            {/* Background Glow Ring */}
            <div
              className={`absolute w-[450px] h-[450px] rounded-full blur-3xl opacity-50 transition-all duration-1000 ${
                transitionTarget === 'dark' ? 'bg-indigo-600' : 'bg-amber-300'
              }`}
            />

            {/* Ícone Celestial com Animação Fluida de Surgimento, Escala e Brilho */}
            {transitionTarget === 'dark' ? (
              <motion.div
                initial={{ scale: 0.35, y: 35, opacity: 0, rotate: -25 }}
                animate={{ 
                  scale: [0.35, 1.18, 1, 0.9],
                  y: [35, -8, 0, -20],
                  opacity: [0, 1, 1, 0],
                  rotate: [-25, 0, 8, 18]
                }}
                transition={{ duration: 1.7, times: [0, 0.3, 0.75, 1], ease: 'easeOut' }}
                className="relative flex flex-col items-center gap-5 z-10"
              >
                {/* Lua Estilizada com Crateras e Brilho Etéreo */}
                <div className="relative w-32 h-32 rounded-full bg-slate-900 border-2 border-indigo-400/60 flex items-center justify-center shadow-2xl shadow-indigo-500/60">
                  <div className="absolute inset-0 rounded-full bg-indigo-500/30 blur-lg animate-pulse" />
                  <Moon className="w-16 h-16 text-indigo-200 fill-indigo-200/40 drop-shadow-[0_0_20px_rgba(165,180,252,0.9)]" />
                  {/* Estrelas sutis ao redor */}
                  <span className="absolute top-2 right-4 text-indigo-300 text-sm animate-ping">✦</span>
                  <span className="absolute bottom-4 left-4 text-cyan-300 text-xs animate-pulse">✦</span>
                  <span className="absolute top-10 left-3 text-purple-300 text-[10px] animate-bounce">✦</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <span className="text-base font-display font-extrabold uppercase tracking-widest text-indigo-200">
                    Modo Noturno
                  </span>
                  <span className="text-xs text-indigo-400/90 font-medium mt-0.5">
                    Modo de concentração neural ativado
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0.35, y: 35, opacity: 0, rotate: -35 }}
                animate={{ 
                  scale: [0.35, 1.18, 1, 0.9],
                  y: [35, -8, 0, -20],
                  opacity: [0, 1, 1, 0],
                  rotate: [-35, 0, 20, 60]
                }}
                transition={{ duration: 1.7, times: [0, 0.3, 0.75, 1], ease: 'easeOut' }}
                className="relative flex flex-col items-center gap-5 z-10"
              >
                {/* Sol Estilizado com Raios Radiantes */}
                <div className="relative w-32 h-32 rounded-full bg-amber-50 border-2 border-amber-400/70 flex items-center justify-center shadow-2xl shadow-amber-500/50">
                  <div className="absolute inset-0 rounded-full bg-amber-400/30 blur-lg animate-pulse" />
                  <Sun className="w-16 h-16 text-amber-500 fill-amber-400/50 drop-shadow-[0_0_25px_rgba(251,191,36,0.95)] animate-[spin_10s_linear_infinite]" />
                </div>
                <div className="flex flex-col items-center text-center">
                  <span className="text-base font-display font-extrabold uppercase tracking-widest text-amber-800">
                    Modo Claro
                  </span>
                  <span className="text-xs text-amber-600/90 font-medium mt-0.5">
                    Claridade e foco restaurados
                  </span>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
