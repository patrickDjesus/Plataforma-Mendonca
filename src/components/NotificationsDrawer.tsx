import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  X, 
  Check, 
  CheckCheck, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  Clock, 
  Calendar, 
  ShieldAlert, 
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';
import { StudyNotification, NotificationLevel } from '../types/notification';
import { ScreenId } from '../types/design';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: StudyNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNavigate?: (screen: ScreenId) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onNavigate,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | NotificationLevel>('all');

  const unreadCount = notifications.filter(n => !n.read).length;
  const redCount = notifications.filter(n => n.level === 'red' && !n.read).length;
  const yellowCount = notifications.filter(n => n.level === 'yellow' && !n.read).length;
  const greenCount = notifications.filter(n => n.level === 'green' && !n.read).length;

  const filteredNotifications = notifications.filter(n => {
    if (selectedFilter === 'all') return true;
    return n.level === selectedFilter;
  });

  const getLevelBadge = (level: NotificationLevel) => {
    switch (level) {
      case 'green':
        return {
          label: 'Nível 1 • Simples / Rotina',
          badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          icon: <Info className="w-4 h-4 text-emerald-500 shrink-0" />,
          cardBorder: 'border-emerald-200/80 dark:border-emerald-900/40 hover:border-emerald-300 dark:hover:border-emerald-700',
          glow: 'bg-emerald-500/5',
        };
      case 'yellow':
        return {
          label: 'Nível 2 • Ficar de Olho',
          badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          icon: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
          cardBorder: 'border-amber-200/80 dark:border-amber-900/40 hover:border-amber-300 dark:hover:border-amber-700',
          glow: 'bg-amber-500/5',
        };
      case 'red':
        return {
          label: 'Nível 3 • Aviso Administrador',
          badgeClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
          icon: <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />,
          cardBorder: 'border-rose-300/90 dark:border-rose-900/60 hover:border-rose-400 dark:hover:border-rose-700',
          glow: 'bg-rose-500/10',
        };
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Translúcido Escurecido */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
          />

          {/* Painel Lateral Slide-Over */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-l border-slate-200/80 dark:border-slate-800 shadow-2xl z-50 flex flex-col overflow-hidden text-slate-900 dark:text-slate-100"
            role="dialog"
            aria-modal="true"
            aria-label="Painel de notificações"
          >
            {/* Header do Painel */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                      Notificações & Alertas
                      {unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Cronogramas e avisos da Plataforma Mendonça
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Fechar notificações"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Botão de Marcar Tudo Como Lido */}
              {unreadCount > 0 && (
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={onMarkAllAsRead}
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Marcar todas como lidas
                  </button>
                </div>
              )}

              {/* Filtros por 3 Níveis de Alerta */}
              <div className="grid grid-cols-4 gap-1.5 mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
                <button
                  onClick={() => setSelectedFilter('all')}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all text-center cursor-pointer ${
                    selectedFilter === 'all'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Todas ({notifications.length})
                </button>

                <button
                  onClick={() => setSelectedFilter('green')}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
                    selectedFilter === 'green'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Verde ({greenCount})
                </button>

                <button
                  onClick={() => setSelectedFilter('yellow')}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
                    selectedFilter === 'yellow'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Amarelo ({yellowCount})
                </button>

                <button
                  onClick={() => setSelectedFilter('red')}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
                    selectedFilter === 'red'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Vermelho ({redCount})
                </button>
              </div>
            </div>

            {/* Lista de Notificações com Scroll */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredNotifications.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 text-slate-400">
                    <Check className="w-6 h-6 text-emerald-500" />
                  </div>
                  <p className="font-bold text-sm text-slate-700 dark:text-slate-300">Tudo em dia!</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Não há notificações pendentes nesta categoria.
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notification) => {
                  const meta = getLevelBadge(notification.level);

                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`relative p-4 rounded-2xl border transition-all ${meta.cardBorder} ${
                        notification.read
                          ? 'bg-white/70 dark:bg-slate-900/40 opacity-75'
                          : `bg-white dark:bg-slate-800/80 shadow-md shadow-slate-200/30 dark:shadow-black/20 ${meta.glow}`
                      }`}
                    >
                      {/* Top Header do Card: Nível e Timestamp */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          {meta.icon}
                          <span
                            className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border ${meta.badgeClass}`}
                          >
                            {meta.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium shrink-0">
                          <Clock className="w-3 h-3" />
                          <span>{notification.timestamp}</span>
                        </div>
                      </div>

                      {/* Título & Descrição */}
                      <h4
                        className={`text-xs font-bold font-display ${
                          notification.read
                            ? 'text-slate-700 dark:text-slate-300'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {notification.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {notification.description}
                      </p>

                      {/* Ação e Botão de Marcar como Lido */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                        {notification.actionLabel && (
                          <button
                            onClick={() => {
                              if (notification.actionTarget && onNavigate) {
                                onNavigate(notification.actionTarget);
                                onClose();
                              }
                              onMarkAsRead(notification.id);
                            }}
                            className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                          >
                            <span>{notification.actionLabel}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}

                        {!notification.read && (
                          <button
                            onClick={() => onMarkAsRead(notification.id)}
                            className="ml-auto text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Check className="w-3 h-3 text-blue-500" />
                            Lida
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Rodapé Informativo */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200/80 dark:border-slate-800 text-[10px] text-slate-400 text-center">
              Sistema de Notificações • Plataforma Mendonça
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
