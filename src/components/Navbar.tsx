import React, { useState } from 'react';
import { ScreenId } from '../types/design';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Network, 
  Target, 
  Flame, 
  LogOut, 
  User, 
  Sparkles,
  Sun,
  Moon,
  Bell,
  Search,
  Command
} from 'lucide-react';
import { LogoMendonca } from './LogoMendonca';

interface NavbarProps {
  currentScreen: ScreenId;
  setCurrentScreen: (screen: ScreenId) => void;
  streakCount: number;
  user?: { name: string; email: string; avatar: string };
  onLogout?: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onOpenNotifications: () => void;
  onOpenCommandPalette?: () => void;
  unreadNotificationsCount: number;
  hasRedAlert?: boolean;
  hasYellowAlert?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  setCurrentScreen,
  streakCount,
  user = { name: 'Lucas Mendes', email: 'lucas.mendes@mendonca.edu.br', avatar: 'LM' },
  onLogout,
  theme,
  toggleTheme,
  onOpenNotifications,
  onOpenCommandPalette,
  unreadNotificationsCount,
  hasRedAlert = false,
  hasYellowAlert = false,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const navCategories: { id: ScreenId; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'caderno', label: 'Caderno de Disciplinas', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'mapa', label: 'Mapa Neural', icon: <Network className="w-4 h-4" /> },
    { id: 'treino', label: 'Treino', icon: <Target className="w-4 h-4" /> },
  ];

  return (
    <header className="w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-40 px-3 sm:px-6 lg:px-8 py-2.5 transition-colors duration-200 select-none shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* ZONA 1: BRAND TITLE COM LOGO DA PLATAFORMA MENDONÇA */}
        <button
          onClick={() => setCurrentScreen('home')}
          className="flex items-center gap-3 cursor-pointer group text-left shrink-0 focus:outline-none"
          title="Plataforma Mendonça - Início"
        >
          <LogoMendonca size="sm" isDark={theme === 'dark'} />
        </button>

        {/* ZONA 2: NAV CATEGORIES COM MOVIMENTAÇÃO SUAVE */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/90 dark:bg-slate-800/90 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 overflow-x-auto no-scrollbar">
          {navCategories.map((item) => {
            const active = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentScreen(item.id)}
                className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors duration-200 cursor-pointer ${
                  active 
                    ? 'text-blue-700 dark:text-blue-300 font-bold' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
                }`}
              >
                {/* Active animated sliding background pill */}
                {active && (
                  <motion.div
                    layoutId="active-header-pill"
                    className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-200/60 dark:border-slate-700"
                    transition={{
                      type: 'spring',
                      stiffness: 450,
                      damping: 32,
                    }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <span className={active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </span>
              </button>
            );
          })}
        </nav>

        {/* ZONA 3: AÇÕES PRIMÁRIAS (Busca Rápida Cmd+K, Notificações, Tema Claro/Escuro, Streak, Perfil) */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 relative">
          
          {/* Botão de Busca / Paleta de Comandos (Cmd+K) */}
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-2xl bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer border border-slate-200/60 dark:border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            title="Abrir Paleta de Comandos e Busca Global (Cmd+K ou /)"
          >
            <Search className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden md:inline text-xs font-medium text-slate-500 dark:text-slate-400">Buscar...</span>
            <kbd className="hidden sm:inline-flex items-center text-[10px] font-mono font-bold text-slate-400 dark:text-slate-400 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200/70 dark:border-slate-700">
              ⌘K
            </kbd>
          </button>

          {/* Botão de Notificações com Sino e Alertas */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-2xl bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all cursor-pointer border border-slate-200/60 dark:border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            title="Abrir Notificações e Alertas de Estudos"
            aria-label="Abrir notificações"
          >
            <Bell className="w-4 h-4" />
            
            {/* Badge Dinâmico com indicador do nível mais crítico */}
            {unreadNotificationsCount > 0 && (
              <span className={`absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full text-[9px] font-extrabold text-white shadow-xs ${
                hasRedAlert 
                  ? 'bg-rose-600 animate-pulse ring-2 ring-rose-300 dark:ring-rose-900' 
                  : hasYellowAlert 
                  ? 'bg-amber-500 ring-2 ring-amber-300 dark:ring-amber-900' 
                  : 'bg-emerald-600'
              }`}>
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Toggle Modo Claro / Modo Escuro */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-2xl bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all cursor-pointer border border-slate-200/60 dark:border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
            aria-label={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 transition-transform rotate-0 hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700 transition-transform -rotate-12 hover:rotate-0" />
            )}
          </button>

          {/* Badge de Ofensiva / Streak */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-100/80 dark:bg-slate-800/80 px-3 py-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
            <span className="text-orange-500 font-bold text-xs flex items-center gap-1">
              <Flame className="w-4 h-4 fill-orange-500" />
              {streakCount}
            </span>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span className="text-slate-500 dark:text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">OFENSIVA</span>
          </div>

          {/* User Avatar with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-8.5 h-8.5 rounded-full border-2 border-white dark:border-slate-800 ring-2 ring-blue-500 overflow-hidden shadow-xs cursor-pointer hover:scale-105 transition-transform shrink-0 flex items-center justify-center focus:outline-none"
              title="Menu do Usuário"
              aria-label="Abrir menu do perfil"
            >
              <div className="w-full h-full bg-gradient-to-b from-blue-600 to-indigo-700 flex items-center justify-center text-xs font-bold text-white">
                {user.avatar}
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            <AnimatePresence>
              {showProfileMenu && (
                <>
                  <div
                    onClick={() => setShowProfileMenu(false)}
                    className="fixed inset-0 z-40"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-2 z-50 overflow-hidden text-slate-900 dark:text-slate-100"
                  >
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl mb-1 border border-slate-100 dark:border-slate-700/50">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 font-display flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        {user.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {user.email}
                      </p>
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                          Plataforma Mendonça
                        </span>
                        <span className="bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                          ENEM 2026
                        </span>
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          setCurrentScreen('home');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-colors text-left cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                        <span>Meu Dashboard</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          onOpenNotifications();
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-colors text-left cursor-pointer"
                      >
                        <span className="flex items-center gap-2.5">
                          <Bell className="w-3.5 h-3.5 text-blue-500" />
                          <span>Notificações</span>
                        </span>
                        {unreadNotificationsCount > 0 && (
                          <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                            {unreadNotificationsCount}
                          </span>
                        )}
                      </button>

                      {onLogout && (
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            onLogout();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors text-left cursor-pointer border-t border-slate-100 dark:border-slate-800 mt-1 pt-2"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sair da Conta / Trocar Usuário</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* Navegação Mobile Inferior / Subheader */}
      <div className="flex md:hidden items-center justify-around gap-1 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar">
        {navCategories.map((item) => {
          const active = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentScreen(item.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer ${
                active 
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold' 
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
