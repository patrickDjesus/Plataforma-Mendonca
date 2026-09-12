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
  const { loginWithEmail, registerWithEmail } = useAuth();
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
      const success = authMode === 'login'
        ? await loginWithEmail(email.trim(), password)
        : await registerWithEmail(userName, email.trim(), password);

      if (!success) {
        setAuthError('Quase lá! Enviamos um link de confirmação para o seu e-mail. Verifique sua caixa de entrada e, depois de confirmar, faça login.');
        return;
      }

      onLoginSuccess({
        name: userName,
        email: email.trim(),
        avatar: initials,
      });
    } catch (err: any) {
      setAuthError(err.message || 'Erro ao processar autenticação');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF8F5] dark:bg-[#121214] flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden select-none font-sans text-[#1C1917] dark:text-[#FAF9F5] selection:bg-[#2D5A46] selection:text-white">
      
      {/* 1. FUNDO GEOMÉTRICO INTERATIVO DE TRIÂNGULOS (CANVAS) */}
      <GeometricTrianglesCanvas />

      {/* 2. Suaves gradientes de iluminação ambiente */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#CFE1D6]/40 dark:bg-[#22392D]/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#EBF3EF]/50 dark:bg-[#15221B]/50 rounded-full blur-[100px] pointer-events-none" />

      {/* Card Principal com Sombra Externa Verde Vibrante e Borda Animada */}
      <div className="relative z-10 w-full max-w-4xl">
        <div className="absolute -inset-6 sm:-inset-10 bg-gradient-to-tr from-[#2D5A46]/30 via-[#52B788]/40 to-[#1E3E30]/30 rounded-[44px] sm:rounded-[50px] blur-3xl pointer-events-none -z-20 opacity-70" />
        
        <div className="absolute -inset-2 bg-gradient-to-r from-[#2D5A46]/50 via-[#52B788]/60 to-[#21483A]/50 rounded-[38px] blur-xl opacity-80 pointer-events-none -z-10" />

        <div className="relative w-full p-[2.5px] rounded-[34px] bg-[#2D5A46]/50 overflow-hidden shadow-[0_0_60px_-5px_rgba(45,90,70,0.4),0_25px_70px_-15px_rgba(33,72,58,0.45)]">
          
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
            className="absolute -inset-[150%] w-[400%] h-[400%] pointer-events-none origin-center opacity-80 blur-xs"
            style={{
              background: 'conic-gradient(from 0deg, transparent 0deg, transparent 240deg, rgba(45, 90, 70, 0.5) 280deg, #2D5A46 320deg, #52B788 345deg, #EBF3EF 358deg, transparent 360deg)',
            }}
          />

          <div className="relative w-full h-full bg-white/95 dark:bg-[#18181B]/95 backdrop-blur-3xl rounded-[32px] overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
            
            {/* COLUNA ESQUERDA: IDENTIDADE (5 Colunas) */}
            <div className="md:col-span-5 bg-[#FAF8F5]/95 dark:bg-[#18181B]/95 p-8 sm:p-10 border-b md:border-b-0 md:border-r border-[#E7E2D9] dark:border-[#2C2C30] flex flex-col justify-between items-center text-center relative overflow-hidden">
            
              <div className="flex flex-col items-center justify-center pt-4 w-full">
                <LogoMendonca size="2xl" centered className="mb-4" />

                <p className="text-xs text-[#78716C] dark:text-[#A8A29E] mt-2 leading-relaxed font-normal max-w-xs">
                  Excelência acadêmica, cadernos digitais integrados e foco na sua aprovação com treinos em tempo real.
                </p>
              </div>

              <div className="w-full mt-8 pt-4 border-t border-[#E7E2D9]/60 dark:border-[#2C2C30]/60 flex items-center justify-between text-[11px] text-[#A8A29E] dark:text-[#78716C]">
                <span className="flex items-center gap-1.5 font-medium text-[#78716C] dark:text-[#A8A29E]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#2D5A46] dark:text-[#52B788]" /> Acesso Seguro & Criptografado
                </span>
                <span className="font-mono text-[10px] text-[#A8A29E] dark:text-[#78716C]">v3.0</span>
              </div>

            </div>

            {/* COLUNA DIREITA: FORMULÁRIO DIRETO E LIMPO (7 Colunas) */}
            <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-between bg-white/95 dark:bg-[#18181B]/95">
          
              <div>
                {/* Toggle Tabs & Quick Skip */}
                <div className="flex flex-wrap items-center gap-3 mb-8">
                  <div className="flex items-center bg-[#EFECE6] dark:bg-[#202024] p-1 rounded-2xl max-w-xs">
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        authMode === 'login'
                          ? 'bg-white dark:bg-[#161618] text-[#1C1917] dark:text-[#FAF9F5] shadow-2xs'
                          : 'text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#FAF9F5]'
                      }`}
                    >
                      Entrar na Conta
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode('register')}
                      className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        authMode === 'register'
                          ? 'bg-white dark:bg-[#161618] text-[#1C1917] dark:text-[#FAF9F5] shadow-2xs'
                          : 'text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#FAF9F5]'
                      }`}
                    >
                      Criar Conta
                    </button>
                  </div>


                </div>

                {/* Form Header */}
                <div className="mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold font-display text-[#1C1917] dark:text-[#FAF9F5]">
                    {authMode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
                  </h3>
                  <p className="text-xs text-[#78716C] dark:text-[#A8A29E] mt-1">
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
                      <label className="text-xs font-semibold text-[#57534E] dark:text-[#D6D3CD] flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#2D5A46] dark:text-[#52B788]" /> Nome Completo
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Lucas Mendes"
                        className="w-full bg-[#FAF8F5] dark:bg-[#232326] border border-[#E7E2D9] dark:border-[#2C2C30] rounded-2xl px-4 py-3 text-xs text-[#1C1917] dark:text-[#FAF9F5] placeholder-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#2D5A46]/30 focus:border-[#2D5A46] dark:focus:border-[#52B788] focus:bg-white dark:focus:bg-[#18181B] transition-all"
                      />
                    </motion.div>
                  )}

                  {/* E-mail */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#57534E] dark:text-[#D6D3CD] flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#2D5A46] dark:text-[#52B788]" /> E-mail
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu.email@exemplo.com"
                      className="w-full bg-[#FAF8F5] dark:bg-[#232326] border border-[#E7E2D9] dark:border-[#2C2C30] rounded-2xl px-4 py-3 text-xs text-[#1C1917] dark:text-[#FAF9F5] placeholder-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#2D5A46]/30 focus:border-[#2D5A46] dark:focus:border-[#52B788] focus:bg-white dark:focus:bg-[#18181B] transition-all"
                    />
                  </div>

                  {/* Senha */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[#57534E] dark:text-[#D6D3CD] flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-[#2D5A46] dark:text-[#52B788]" /> Senha
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-[#FAF8F5] dark:bg-[#232326] border border-[#E7E2D9] dark:border-[#2C2C30] rounded-2xl pl-4 pr-11 py-3 text-xs text-[#1C1917] dark:text-[#FAF9F5] placeholder-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#2D5A46]/30 focus:border-[#2D5A46] dark:focus:border-[#52B788] focus:bg-white dark:focus:bg-[#18181B] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8A29E] dark:text-[#78716C] hover:text-[#44403C] dark:hover:text-[#E7E5E4] p-1 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Lembrar-me */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-[#78716C] dark:text-[#A8A29E]">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-[#D6D3D1] dark:border-[#3B3B40] text-[#2D5A46] dark:text-[#52B788] focus:ring-[#2D5A46] dark:focus:ring-[#52B788] cursor-pointer"
                      />
                      <span>Lembrar meus dados</span>
                    </label>
                  </div>

                  {/* Mensagem de Erro se houver */}
                  {authError && (
                    <div className="p-3 rounded-xl bg-[#A8423F]/10 dark:bg-[#A8423F]/15 border border-[#D98D8A] dark:border-[#5E2B29] text-[#A8423F] dark:text-[#E57370] text-xs flex items-center gap-2">
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
                      className="w-full bg-[#2D5A46] hover:bg-[#21483A] text-white font-bold py-3.5 px-6 rounded-2xl text-xs shadow-md shadow-[#2D5A46]/25 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-70"
                    >
                      <span>{authMode === 'login' ? 'Acessar Plataforma Mendonça' : 'Criar Conta e Iniciar'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>


                  </div>
                </form>
              </div>

              {/* Rodapé Clean */}
              <div className="mt-8 pt-4 border-t border-[#E7E2D9] dark:border-[#2C2C30] flex items-center justify-center text-xs text-[#A8A29E] dark:text-[#78716C]">
                <span>Plataforma Mendonça • Todos os direitos reservados</span>
              </div>

            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
