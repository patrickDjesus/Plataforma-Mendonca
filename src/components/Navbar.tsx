import React, { useState } from 'react';
import { ScreenId } from '../types/design';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Target, 
  Layers,
  Flame, 
  LogOut, 
  User, 
  Sparkles,
  Sun,
  Moon,
  Bell,
  Search
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
  user = { name: 'Estudante', email: '', avatar: 'EM' },
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
    { id: 'treino', label: 'Treino', icon: <Target className="w-4 h-4" /> },
    { id: 'flashcards', label: 'FlashCards', icon: <Layers className="w-4 h-4" /> },
  ];

  const surface = 'bg-[#F5F2EB] dark:bg-[#232326] hover:bg-[#EFECE6] dark:hover:bg-[#2A2A2F] border border-[#E7E2D9]/80 dark:border-[#333338]';

  return (
    <header className="w-full bg-[#FAF8F5]/90 dark:bg-[#161618]/90 backdrop-blur-md border-b border-[#E7E2D9] dark:border-[#2C2C30] sticky top-0 z-40 px-3 sm:px-6 lg:px-8 py-2.5 transition-colors duration-200 select-none shadow-xs">
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
        <nav className="hidden md:flex items-center gap-1 bg-[#EFECE6] dark:bg-[#202024] p-1.5 rounded-2xl border border-[#E7E2D9]/70 dark:border-[#2C2C30]/70 overflow-x-auto no-scrollbar">
          {navCategories.map((item) => {
            const active = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentScreen(item.id)}
                className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs whitespace-nowrap shrink-0 transition-colors duration-200 cursor-pointer ${
                  active 
                    ? 'text-[#224A38] dark:text-[#52B788] font-bold' 
                    : 'text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#FAF9F5] font-medium'
                }`}
              >
                {/* Active animated sliding background pill */}
                {active && (
                  <motion.div
                    layoutId="active-header-pill"
                    className="absolute inset-0 bg-white dark:bg-[#161618] rounded-xl shadow-xs border border-[#E7E2D9] dark:border-[#2C2C30]"
                    transition={{
                      type: 'spring',
                      stiffness: 450,
                      damping: 32,
                    }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2 font-['Plus_Jakarta_Sans',sans-serif]">
                  <span className={active ? 'text-[#2D5A46]' : 'text-[#8C7A6B] dark:text-[#57534E]'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </span>
              </button>
            );
          })}
        </nav>

        {/* ZONA 3: AÇÕES PRIMÁRIAS (Busca Rápida Cmd+K, Notificações, Tema, Streak, Perfil) */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 relative">
          
          {/* Botão de Busca / Paleta de Comandos (Cmd+K) */}
          <button
            onClick={onOpenCommandPalette}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-2xl ${surface} text-[#57534E] dark:text-[#D6D3CD] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2D5A46]/30`}
            title="Abrir Paleta de Comandos e Busca Global (Cmd+K ou /)"
          >
            <Search className="w-3.5 h-3.5 text-[#2D5A46]" />
            <span className="hidden md:inline text-xs font-medium text-[#78716C] dark:text-[#A8A29E]">Buscar...</span>
            <kbd className="hidden sm:inline-flex items-center text-[10px] font-mono font-bold text-[#8C7A6B] dark:text-[#A8A29E] bg-white dark:bg-[#161618] px-1.5 py-0.5 rounded border border-[#E7E2D9] dark:border-[#333338]">
              ⌘K
            </kbd>
          </button>

          {/* Botão de Notificações com Sino e Alertas */}
          <button
            onClick={onOpenNotifications}
            className={`relative p-2 rounded-2xl ${surface} text-[#57534E] dark:text-[#D6D3CD] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2D5A46]/30`}
            title="Abrir Notificações e Alertas de Estudos"
            aria-label="Abrir notificações"
          >
            <Bell className="w-4 h-4" />
            
            {/* Badge Dinâmico com indicador do nível mais crítico */}
            {unreadNotificationsCount > 0 && (
              <span className={`absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full text-[9px] font-extrabold text-white shadow-xs ${
                hasRedAlert 
                  ? 'bg-[#A8423F] animate-pulse ring-2 ring-[#EFC9C7] dark:ring-[#3D1D1C]' 
                  : hasYellowAlert 
                  ? 'bg-[#D97706] ring-2 ring-[#FDE68A] dark:ring-[#4B3917]' 
                  : 'bg-[#2D5A46]'
              }`}>
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Toggle Modo Claro / Modo Escuro */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-2xl ${surface} text-[#57534E] dark:text-[#D6D3CD] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2D5A46]/30`}
            title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
            aria-label={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#FBBF24] transition-transform rotate-0 hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-[#57534E] transition-transform -rotate-12 hover:rotate-0" />
            )}
          </button>

          {/* Badge de Ofensiva / Streak */}
          <div className="hidden sm:flex items-center gap-1.5 bg-[#EBF3EF] dark:bg-[#15221B] px-3 py-1.5 rounded-full border border-[#CFE1D6] dark:border-[#22392D]">
            <span className="text-[#2D5A46] dark:text-[#52B788] font-bold text-xs flex items-center gap-1">
              <Flame className="w-4 h-4 fill-[#2D5A46] dark:fill-[#52B788] text-[#2D5A46] dark:text-[#52B788]" />
              {streakCount}
            </span>
            <span className="text-[#CFE1D6] dark:text-[#22392D]">|</span>
            <span className="text-[#2D5A46] dark:text-[#52B788] text-[10px] font-extrabold uppercase tracking-wider font-mono">Dias</span>
          </div>

          {/* User Avatar with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-8.5 h-8.5 rounded-full border-2 border-white dark:border-[#161618] ring-2 ring-[#2D5A46] overflow-hidden shadow-xs cursor-pointer hover:scale-105 transition-transform shrink-0 flex items-center justify-center focus:outline-none"
              title="Menu do Usuário"
              aria-label="Abrir menu do perfil"
            >
              <div className="w-full h-full bg-gradient-to-b from-[#2D5A46] to-[#A8423F] flex items-center justify-center text-xs font-bold text-white">
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
                    className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1E1E22] rounded-2xl shadow-xl border border-[#E7E2D9] dark:border-[#2C2C30] p-2 z-50 overflow-hidden text-[#1C1917] dark:text-[#E7E5E4]"
                  >
                    <div className="p-3 bg-[#FAF8F5] dark:bg-[#232326] rounded-xl mb-1 border border-[#E7E2D9] dark:border-[#333338]">
                      <p className="text-xs font-bold text-[#1C1917] dark:text-[#FAF9F5] font-display flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#2D5A46]" />
                        {user.name}
                      </p>
                      <p className="text-[11px] text-[#78716C] dark:text-[#A8A29E] truncate mt-0.5">
                        {user.email}
                      </p>
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="bg-[#EBF3EF] dark:bg-[#15221B] text-[#224A38] dark:text-[#52B788] text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider border border-[#CFE1D6] dark:border-[#22392D]">
                          Plataforma Mendonça
                        </span>
                        <span className="bg-[#FEF3C7] dark:bg-[#3D2E14] text-[#92400E] dark:text-[#FBBF24] text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-[#FDE68A] dark:border-[#5E441D]">
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
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#57534E] dark:text-[#D6D3CD] hover:bg-[#EBF3EF] dark:hover:bg-[#15221B] hover:text-[#224A38] dark:hover:text-[#52B788] rounded-xl transition-colors text-left cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#2D5A46]" />
                        <span>Meu Dashboard</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          onOpenNotifications();
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-[#57534E] dark:text-[#D6D3CD] hover:bg-[#EBF3EF] dark:hover:bg-[#15221B] hover:text-[#224A38] dark:hover:text-[#52B788] rounded-xl transition-colors text-left cursor-pointer"
                      >
                        <span className="flex items-center gap-2.5">
                          <Bell className="w-3.5 h-3.5 text-[#2D5A46]" />
                          <span>Notificações</span>
                        </span>
                        {unreadNotificationsCount > 0 && (
                          <span className="bg-[#2D5A46] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
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
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#A8423F] dark:text-[#E57370] hover:bg-[#F9ECEB] dark:hover:bg-[#2C1818] rounded-xl transition-colors text-left cursor-pointer border-t border-[#E7E2D9] dark:border-[#2C2C30] mt-1 pt-2"
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
      <div className="flex md:hidden items-center justify-around gap-1 mt-2 pt-2 border-t border-[#E7E2D9] dark:border-[#2C2C30] overflow-x-auto no-scrollbar">
        {navCategories.map((item) => {
          const active = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentScreen(item.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer ${
                active 
                  ? 'bg-[#EBF3EF] dark:bg-[#15221B] text-[#224A38] dark:text-[#52B788] font-bold border border-[#CFE1D6] dark:border-[#22392D]' 
                  : 'text-[#78716C] dark:text-[#A8A29E]'
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