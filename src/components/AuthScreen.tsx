import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';
import { GeometricTrianglesCanvas } from './GeometricTrianglesCanvas';
import { LogoMendonca } from './LogoMendonca';
import { useAuth } from '../context/AuthContext';

interface AuthScreenProps {
  onLoginSuccess: (userData: { name: string; email: string; avatar: string }) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const { loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError(null);

    const userName = name.trim() || (authMode === 'login' ? 'Estudante Mendonça' : 'Estudante');
    const initials = userName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0])
      .join('')
      .toUpperCase() || 'EM';

    try {
      if (authMode === 'login') {
        await loginWithEmail(email.trim(), password);
      } else {
        await registerWithEmail(userName, email.trim(), password);
      }

      onLoginSuccess({
        name: userName,
        email: email.trim() || 'estudante@mendonca.edu.br',
        avatar: initials,
      });
    } catch (err: any) {
      setAuthError(err.message || 'Erro ao processar autenticação');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setAuthError(err.message || 'Erro ao entrar com o Google');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden select-none font-sans text-slate-900 dark:text-slate-100 selection:bg-blue-100 dark:selection:bg-blue-900 selection:text-blue-900 dark:selection:text-blue-100">
      
      {/* 1. FUNDO GEOMÉTRICO INTERATIVO DE TRIÂNGULOS (CANVAS) */}
      <GeometricTrianglesCanvas />

      {/* 2. Suaves gradientes de iluminação ambiente */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-200/40 dark:bg-blue-900/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-200/40 dark:bg-indigo-900/40 rounded-full blur-[100px] pointer-events-none" />

      {/* Card Principal com Sombra Externa Azul Vibrante e Borda Animada */}
      <div className="relative z-10 w-full max-w-4xl">
        <div className="absolute -inset-6 sm:-inset-10 bg-gradient-to-tr from-blue-600/30 via-sky-400/40 to-indigo-600/30 rounded-[44px] sm:rounded-[50px] blur-3xl pointer-events-none -z-20 opacity-70" />
        
        <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/50 via-cyan-400/60 to-blue-500/50 rounded-[38px] blur-xl opacity-80 pointer-events-none -z-10" />

        <div className="relative w-full p-[2.5px] rounded-[34px] bg-blue-600/50 overflow-hidden shadow-[0_0_60px_-5px_rgba(14,165,233,0.4),0_25px_70px_-15px_rgba(2,132,199,0.45)]">
          
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
            className="absolute -inset-[150%] w-[400%] h-[400%] pointer-events-none origin-center opacity-80 blur-xs"
            style={{
              background: 'conic-gradient(from 0deg, transparent 0deg, transparent 240deg, rgba(37, 99, 235, 0.5) 280deg, #38bdf8 320deg, #7dd3fc 345deg, #e0f2fe 358deg, transparent 360deg)',
            }}
          />

          <div className="relative w-full h-full bg-white/98 dark:bg-slate-900/98 backdrop-blur-3xl rounded-[32px] overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
            
            {/* COLUNA ESQUERDA: IDENTIDADE (5 Colunas) */}
            <div className="md:col-span-5 bg-slate-50/95 dark:bg-slate-900/95 p-8 sm:p-10 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 flex flex-col justify-between items-center text-center relative overflow-hidden">
            
              <div className="flex flex-col items-center justify-center pt-4 w-full">
                <LogoMendonca size="2xl" centered className="mb-4" />

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed font-normal max-w-xs">
                  Excelência acadêmica, cadernos digitais integrados e foco na sua aprovação com treinos em tempo real.
                </p>
              </div>

              <div className="w-full mt-8 pt-4 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                <span className="flex items-center gap-1.5 font-medium text-slate-500 dark:text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> Acesso Seguro & Criptografado
                </span>
                <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">v3.0</span>
              </div>

            </div>

            {/* COLUNA DIREITA: FORMULÁRIO DIRETO E LIMPO (7 Colunas) */}
            <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-between bg-white/95 dark:bg-slate-900/95">
          
              <div>
                {/* Toggle Tabs */}
                <div className="flex items-center bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-2xl max-w-xs mb-8">
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      authMode === 'login'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Entrar na Conta
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('register')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      authMode === 'register'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Criar Conta
                  </button>
                </div>

                {/* Form Header */}
                <div className="mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-slate-100">
                    {authMode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {authMode === 'login' 
                      ? 'Digite seus dados para acessar o seu ambiente da Plataforma Mendonça.'
                      : 'Informe seu nome, e-mail e senha para começar instantaneamente.'}
                  </p>
                </div>

                {/* Form Fields */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {authMode === 'register' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-1.5"
                    >
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Nome Completo
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Lucas Mendes"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl px-4 py-3 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/30 focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-800 transition-all"
                      />
                    </motion.div>
                  )}

                  {/* E-mail */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> E-mail
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu.email@exemplo.com"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl px-4 py-3 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/30 focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-800 transition-all"
                    />
                  </div>

                  {/* Senha */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Senha
                      </label>
                      {authMode === 'login' && (
                        <a 
                          href="#esqueceu" 
                          onClick={(e) => e.preventDefault()} 
                          className="text-[11px] text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                        >
                          Esqueceu a senha?
                        </a>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl pl-4 pr-11 py-3 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/30 focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-800 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-1 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Lembrar-me */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-500 dark:text-slate-400">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-slate-300 dark:border-slate-600 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 cursor-pointer"
                      />
                      <span>Lembrar meus dados</span>
                    </label>
                  </div>

                  {/* Mensagem de Erro se houver */}
                  {authError && (
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{authError}</span>
                    </div>
                  )}

                  {/* Botão de Ação Principal */}
                  <div className="pt-2 space-y-2.5">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-blue-400 dark:bg-blue-400 hover:bg-blue-600 dark:hover:bg-blue-600 text-white font-bold py-3.5 px-6 rounded-2xl text-xs shadow-md shadow-blue-600/20 dark:shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-70"
                    >
                      <span>{authMode === 'login' ? 'Acessar Plataforma Mendonça' : 'Criar Conta e Iniciar'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>

                    <div className="relative flex py-1 items-center">
                      <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                      <span className="flex-shrink mx-3 text-[10px] uppercase font-mono text-slate-400 dark:text-slate-500">ou</span>
                      <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                    </div>

                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={isSubmitting}
                      className="w-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-bold py-3 px-6 rounded-2xl text-xs shadow-xs flex items-center justify-center gap-2.5 cursor-pointer transition-all disabled:opacity-70"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                        />
                      </svg>
                      <span>Continuar com o Google</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Rodapé Clean */}
              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">
                <span>Plataforma Mendonça • Todos os direitos reservados</span>
              </div>

            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
