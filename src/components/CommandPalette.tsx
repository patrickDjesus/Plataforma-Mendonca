import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  BookOpen,
  Brain,
  Network,
  Home,
  Sun,
  Moon,
  Bell,
  Sparkles,
  ArrowRight,
  Flame,
  FileText,
  Clock,
  Command,
  X,
  Keyboard,
  Trash2,
} from 'lucide-react';
import { ScreenId } from '../types/design';

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'Navegação' | 'Ações Rápidas' | 'Disciplinas' | 'Atalhos';
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenNotifications: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  currentScreen,
  onNavigate,
  theme,
  onToggleTheme,
  onOpenNotifications,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const commands: CommandItem[] = [
    // Navegação
    {
      id: 'nav-home',
      title: 'Ir para Início / Dashboard',
      subtitle: 'Visão geral, metas diárias e ofensiva',
      category: 'Navegação',
      icon: <Home className="w-4 h-4 text-blue-500" />,
      shortcut: '1',
      action: () => {
        onNavigate('home');
        onClose();
      },
    },
    {
      id: 'nav-caderno',
      title: 'Ir para Caderno de Disciplinas',
      subtitle: 'Cartões interativos, resumos e documentos de aula',
      category: 'Navegação',
      icon: <BookOpen className="w-4 h-4 text-emerald-500" />,
      shortcut: '2',
      action: () => {
        onNavigate('caderno');
        onClose();
      },
    },
    {
      id: 'nav-treino',
      title: 'Ir para Treinamento Gamificado',
      subtitle: 'Questões práticas, streak, XP e simulados',
      category: 'Navegação',
      icon: <Brain className="w-4 h-4 text-purple-500" />,
      shortcut: '3',
      action: () => {
        onNavigate('treino');
        onClose();
      },
    },
    {
      id: 'nav-mapa',
      title: 'Ir para Mapa de Conceitos',
      subtitle: 'Conexões neurais e visualização cognitiva',
      category: 'Navegação',
      icon: <Network className="w-4 h-4 text-amber-500" />,
      shortcut: '4',
      action: () => {
        onNavigate('mapa');
        onClose();
      },
    },

    // Ações Rápidas
    {
      id: 'action-theme',
      title: theme === 'light' ? 'Mudar para Modo Noturno (Escuro)' : 'Mudar para Modo Claro',
      subtitle: 'Ativa a transição celestial de tema',
      category: 'Ações Rápidas',
      icon: theme === 'light' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-400" />,
      shortcut: 'T',
      action: () => {
        onToggleTheme();
        onClose();
      },
    },
    {
      id: 'action-notif',
      title: 'Abrir Painel de Notificações',
      subtitle: 'Alertas de revisão espaçada e avisos de estudo',
      category: 'Ações Rápidas',
      icon: <Bell className="w-4 h-4 text-rose-500" />,
      shortcut: 'N',
      action: () => {
        onClose();
        onOpenNotifications();
      },
    },
    // Disciplinas Frequentes
    {
      id: 'disc-calc',
      title: 'Cálculo Diferencial & Integral',
      subtitle: 'Limites, Derivadas e Aplicações',
      category: 'Disciplinas',
      icon: <FileText className="w-4 h-4 text-blue-500" />,
      action: () => {
        onNavigate('caderno');
        onClose();
      },
    },
    {
      id: 'disc-hist',
      title: 'História do Brasil & Colonial',
      subtitle: 'Ciclo do Açúcar e Estrutura Social',
      category: 'Disciplinas',
      icon: <FileText className="w-4 h-4 text-amber-500" />,
      action: () => {
        onNavigate('caderno');
        onClose();
      },
    },
    {
      id: 'disc-fis',
      title: 'Física Moderna & Quântica',
      subtitle: 'Dualidade Onda-Partícula e Efeito Fotoelétrico',
      category: 'Disciplinas',
      icon: <FileText className="w-4 h-4 text-purple-500" />,
      action: () => {
        onNavigate('caderno');
        onClose();
      },
    },
    {
      id: 'disc-bio',
      title: 'Biologia Celular & Genética',
      subtitle: 'Mitose, Meiose e Expressão Gênica',
      category: 'Disciplinas',
      icon: <FileText className="w-4 h-4 text-emerald-500" />,
      action: () => {
        onNavigate('caderno');
        onClose();
      },
    },
  ];

  const filteredCommands = commands.filter(item => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle keyboard navigation inside the command palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filteredCommands.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredCommands.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100000] flex items-start justify-center pt-20 sm:pt-28 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-all"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[75vh]"
            role="dialog"
            aria-modal="true"
            aria-label="Paleta de comandos"
          >
            {/* Input Search Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <Search className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="O que você deseja fazer ou acessar? (ou digite para filtrar)"
                className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none font-medium"
              />
              {query ? (
                <button
                  onClick={() => setQuery('')}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                  aria-label="Limpar busca"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700">
                  ESC
                </kbd>
              )}
            </div>

            {/* List Results */}
            <div
              ref={listRef}
              className="overflow-y-auto p-2.5 space-y-1 divide-y divide-transparent focus:outline-none"
            >
              {filteredCommands.length === 0 ? (
                <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                  <Command className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                  Nenhum comando encontrado para "{query}"
                </div>
              ) : (
                filteredCommands.map((item, index) => {
                  const isSelected = index === selectedIndex;
                  return (
                    <div
                      key={item.id}
                      data-index={index}
                      onClick={item.action}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all duration-150 ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-950 dark:text-blue-100 shadow-2xs border border-blue-200/60 dark:border-blue-800/60'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-white dark:bg-slate-800 shadow-2xs'
                              : 'bg-slate-100 dark:bg-slate-800'
                          }`}
                        >
                          {item.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold font-display truncate">
                            {item.title}
                          </p>
                          {item.subtitle && (
                            <p className="text-[11px] text-slate-400 dark:text-slate-400 truncate">
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        {item.shortcut && (
                          <kbd className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700">
                            {item.shortcut}
                          </kbd>
                        )}
                        <ArrowRight
                          className={`w-4 h-4 text-blue-600 dark:text-blue-400 transition-transform ${
                            isSelected ? 'translate-x-0.5 opacity-100' : 'opacity-0'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer com Dicas de Atalhos */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[9px]">↑</kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[9px]">↓</kbd>
                  navegar
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[9px]">↵</kbd>
                  selecionar
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[9px]">ESC</kbd>
                  fechar
                </span>
              </div>

              <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-400">
                <Keyboard className="w-3 h-3" />
                <span>Atalhos globais ativos: <strong className="text-slate-600 dark:text-slate-300">Cmd+K</strong>, <strong className="text-slate-600 dark:text-slate-300">/</strong></span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
