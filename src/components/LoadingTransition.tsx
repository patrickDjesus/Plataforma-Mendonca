import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Check, ShieldCheck, Zap } from 'lucide-react';
import { GeometricTrianglesCanvas } from './GeometricTrianglesCanvas';
import logoImg from '../assets/images/logo_mendonca_transparent.png';

interface LoadingTransitionProps {
  userName: string;
  onFinish: () => void;
}

export const LoadingTransition: React.FC<LoadingTransitionProps> = ({ userName, onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const steps = [
    { title: 'Autenticando sessão...', detail: 'Sincronizando credenciais de acesso' },
    { title: 'Carregando Plataforma Mendonça...', detail: 'Sincronizando cronograma e alertas' },
    { title: 'Abrindo Caderno de Disciplinas...', detail: 'Fórmulas, resumos e tópicos' },
    { title: 'Configurando Metas de Alto Rendimento...', detail: 'Métricas e simulados ativados' },
    { title: 'Pronto para começar!', detail: 'Acessando seu Dashboard...' },
  ];

  useEffect(() => {
    const startTime = Date.now();
    const duration = 2100;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      const stepIdx = Math.min(
        steps.length - 1,
        Math.floor((pct / 100) * steps.length)
      );
      setCurrentStepIndex(stepIdx);

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          onFinish();
        }, 250);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [onFinish, steps.length]);

  return (
    <div className="fixed inset-0 z-50 bg-[#F8FAFC] flex flex-col items-center justify-center p-6 select-none overflow-hidden text-slate-900 font-sans">
      
      {/* 1. FUNDO GEOMÉTRICO INTERATIVO DE TRIÂNGULOS */}
      <GeometricTrianglesCanvas />

      {/* 2. Suave iluminação ambiente de fundo */}
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-blue-200/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-indigo-200/40 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Loading Card com Glassmorphism Refinado */}
      <div className="relative z-10 flex flex-col items-center max-w-md w-full text-center">
        
        {/* Animated Emblem Core */}
        <div className="relative w-28 h-28 flex items-center justify-center mb-6">
          
          {/* Subtle Outer Rotating Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-2 border-dashed border-blue-400/80"
          />
          
          {/* Subtle Inner Counter-Rotating Ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-2 rounded-full border border-indigo-300"
          />

          {/* Central Logo Box */}
          <motion.div
            initial={{ scale: 0.85 }}
            animate={{ scale: 1 }}
            className="relative w-18 h-18 flex items-center justify-center z-10 drop-shadow-md"
          >
            <img
              src={logoImg}
              alt="Plataforma Mendonça"
              className="w-full h-full object-contain"
            />
          </motion.div>

          {/* Orbiting Satellite Dot */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0"
          >
            <div className="w-2.5 h-2.5 bg-blue-600 rounded-full shadow-md shadow-blue-400 absolute -top-1 left-1/2 -translate-x-1/2" />
          </motion.div>
        </div>

        {/* Welcome & Status Text */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-700 flex items-center justify-center gap-1.5 mb-1.5 bg-white/90 backdrop-blur-md px-3.5 py-1 rounded-full border border-blue-200/80 shadow-xs inline-flex">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Plataforma Mendonça
          </span>

          <h2 className="text-2xl font-extrabold font-display text-slate-900 tracking-tight drop-shadow-xs">
            Preparando seu Espaço, {userName}
          </h2>

          <p className="text-xs text-slate-600 mt-1.5 h-4 font-medium transition-all duration-200">
            {steps[currentStepIndex]?.title}
          </p>
        </motion.div>

        {/* Light Mode Progress Card com Glassmorphism Refinado */}
        <div className="w-full mt-7 bg-white/95 backdrop-blur-2xl border border-white/80 rounded-2xl p-5 shadow-2xl shadow-slate-900/10">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-600 text-[11px] font-semibold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> {steps[currentStepIndex]?.detail}
            </span>
            <span className="text-blue-600 font-mono font-extrabold text-xs">
              {progress}%
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
            <motion.div
              className="h-full bg-blue-600 rounded-full relative"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut', duration: 0.1 }}
            />
          </div>

          {/* Stepper Dots */}
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100 px-1">
            {steps.map((_, idx) => {
              const isCompleted = idx < currentStepIndex || progress === 100;
              const isCurrent = idx === currentStepIndex && progress < 100;

              return (
                <div key={idx} className="flex items-center gap-1">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold transition-all duration-200 ${
                      isCompleted
                        ? 'bg-blue-600 text-white shadow-xs'
                        : isCurrent
                        ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-400/40 font-extrabold'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : idx + 1}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Security badge at bottom */}
        <div className="mt-6 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium bg-white/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/60">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Ambiente seguro sincronizado</span>
        </div>

      </div>

    </div>
  );
};
