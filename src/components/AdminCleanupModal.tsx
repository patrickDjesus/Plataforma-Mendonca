import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Database, 
  RefreshCw, 
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  cleanupAllTestData, 
  getCollectionCounts, 
  CollectionCounts, 
  CleanupReport 
} from '../utils/cleanupSupabase';
import confetti from 'canvas-confetti';

interface AdminCleanupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AdminCleanupModal: React.FC<AdminCleanupModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { currentUser, userProfile } = useAuth();
  
  const [counts, setCounts] = useState<CollectionCounts>({
    questions: 0,
    performance: 0,
    leaderboard: 0,
    users: 0,
  });

  const [isLoadingCounts, setIsLoadingCounts] = useState<boolean>(false);
  const [isCleaning, setIsCleaning] = useState<boolean>(false);
  const [cleanupReport, setCleanupReport] = useState<CleanupReport | null>(null);

  // Opções de limpeza granulares
  const [cleanQuestions, setCleanQuestions] = useState<boolean>(true);
  const [cleanPerformance, setCleanPerformance] = useState<boolean>(true);
  const [cleanLeaderboard, setCleanLeaderboard] = useState<boolean>(true);
  const [resetUsers, setResetUsers] = useState<boolean>(true);
  const [clearLocalStorage, setClearLocalStorage] = useState<boolean>(true);

  // Confirmação de segurança
  const [confirmText, setConfirmText] = useState<string>('');
  const REQUIRED_CONFIRM = 'LIMPAR';

  const loadCounts = async () => {
    setIsLoadingCounts(true);
    try {
      const data = await getCollectionCounts();
      setCounts(data);
    } catch (err) {
      console.warn('Erro ao carregar contagens:', err);
    } finally {
      setIsLoadingCounts(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadCounts();
      setCleanupReport(null);
      setConfirmText('');
    }
  }, [isOpen]);

  const handleExecuteCleanup = async () => {
    if (confirmText.trim().toUpperCase() !== REQUIRED_CONFIRM) return;

    setIsCleaning(true);
    setCleanupReport(null);

    try {
      const report = await cleanupAllTestData({
        deleteQuestions: cleanQuestions,
        resetPerformance: cleanPerformance,
        deleteLeaderboard: cleanLeaderboard,
        resetUsersProgress: resetUsers,
        clearLocalStorage: clearLocalStorage,
      });

      setCleanupReport(report);
      await loadCounts();

      if (report.success) {
        try {
          confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        } catch { /* ignored */ }
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Erro na limpeza:', err);
    } finally {
      setIsCleaning(false);
    }
  };

  if (!isOpen) return null;

  const isConfirmed = confirmText.trim().toUpperCase() === REQUIRED_CONFIRM;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 z-10 overflow-hidden flex flex-col max-h-[90vh] text-slate-900 dark:text-slate-100"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-xs">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
                    Script de Limpeza do Supabase
                  </h2>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                    Admin / Reset
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Remoção de registros de teste e reinicialização de progresso para estado limpo
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="py-5 overflow-y-auto flex-1 space-y-5 pr-1">
            
            {/* Visão Geral do Banco */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Tabelas do Supabase Atuais:
                </span>
                <button
                  onClick={loadCounts}
                  disabled={isLoadingCounts}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingCounts ? 'animate-spin' : ''}`} />
                  Atualizar
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                  <span className="text-[10px] text-slate-400 font-bold block">Questões</span>
                  <span className="text-lg font-black font-display text-blue-600 dark:text-blue-400">
                    {isLoadingCounts ? '...' : counts.questions}
                  </span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                  <span className="text-[10px] text-slate-400 font-bold block">Performance</span>
                  <span className="text-lg font-black font-display text-cyan-600 dark:text-cyan-400">
                    {isLoadingCounts ? '...' : counts.performance}
                  </span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                  <span className="text-[10px] text-slate-400 font-bold block">Leaderboard</span>
                  <span className="text-lg font-black font-display text-purple-600 dark:text-purple-400">
                    {isLoadingCounts ? '...' : counts.leaderboard}
                  </span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                  <span className="text-[10px] text-slate-400 font-bold block">Usuários</span>
                  <span className="text-lg font-black font-display text-emerald-600 dark:text-emerald-400">
                    {isLoadingCounts ? '...' : counts.users}
                  </span>
                </div>
              </div>
            </div>

            {/* Checklist de Itens a Limpar */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Selecione as Ações de Limpeza:
              </span>

              <label className="flex items-start gap-3 p-3 bg-white dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-blue-400 transition-colors">
                <input
                  type="checkbox"
                  checked={cleanQuestions}
                  onChange={(e) => setCleanQuestions(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Remover questões de teste da coleção <code className="text-[11px] text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-1 py-0.5 rounded">questions</code>
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Exclui todas as questões de teste criadas no banco.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-white dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-blue-400 transition-colors">
                <input
                  type="checkbox"
                  checked={cleanPerformance}
                  onChange={(e) => setCleanPerformance(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Resetar estatísticas da coleção <code className="text-[11px] text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-1 py-0.5 rounded">performance</code>
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Zera XP, contagem de acertos/erros, histórico de sessões e registros de resposta.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-white dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-blue-400 transition-colors">
                <input
                  type="checkbox"
                  checked={cleanLeaderboard}
                  onChange={(e) => setCleanLeaderboard(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Remover placares da coleção <code className="text-[11px] text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-1 py-0.5 rounded">leaderboard</code>
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Limpa o ranking global competitivo de pontuações de teste.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-white dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-blue-400 transition-colors">
                <input
                  type="checkbox"
                  checked={resetUsers}
                  onChange={(e) => setResetUsers(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Reiniciar streaks e progresso na coleção <code className="text-[11px] text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-1 py-0.5 rounded">users</code>
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Restaura streak para 1 dia, totalXp para 0 e divisão Bronze I.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-white dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-blue-400 transition-colors">
                <input
                  type="checkbox"
                  checked={clearLocalStorage}
                  onChange={(e) => setClearLocalStorage(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Limpar cache local & metas diárias (<code className="text-[11px] text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-1 py-0.5 rounded">localStorage</code>)
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Restaura as metas diárias para os valores de fábrica (15 questões / 45 min).
                  </p>
                </div>
              </label>
            </div>

            {/* Caixa de Confirmação de Segurança */}
            <div className="bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs font-bold">
                <ShieldAlert className="w-4 h-4" />
                <span>Confirmação de Segurança:</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Digite a palavra <strong className="text-rose-600 dark:text-rose-400 font-mono font-black">LIMPAR</strong> abaixo para habilitar a execução do script de limpeza:
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Digite LIMPAR para confirmar"
                className="w-full bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-700 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white uppercase placeholder-slate-400 outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>

            {/* Relatório de Execução */}
            {cleanupReport && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl p-4 border text-xs space-y-2 ${
                  cleanupReport.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    : 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {cleanupReport.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  )}
                  <span>
                    {cleanupReport.success
                      ? 'Limpeza e Reset Concluídos com Sucesso!'
                      : 'Limpeza concluída com algumas observações.'}
                  </span>
                </div>

                <ul className="space-y-1 font-mono text-[11px] pl-4 list-disc opacity-90">
                  {cleanupReport.logs.map((log, idx) => (
                    <li key={idx}>{log}</li>
                  ))}
                </ul>
              </motion.div>
            )}

          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <span className="text-xs text-slate-400">
              {currentUser?.email ? `Usuário: ${currentUser.email}` : 'Modo Conectado'}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                disabled={isCleaning}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Fechar
              </button>

              <button
                onClick={handleExecuteCleanup}
                disabled={!isConfirmed || isCleaning}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  isConfirmed && !isCleaning
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/25'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-300 dark:border-slate-700'
                }`}
              >
                {isCleaning ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Limpando coleções...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Executar Limpeza Agora</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
