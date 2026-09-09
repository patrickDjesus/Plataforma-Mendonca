import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calculator, Zap, FlaskConical, Dna, Landmark, Languages, BrainCircuit, Layers } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { playSound } from '../../utils/sounds';

interface TeacherCustomModeModalProps {
  open: boolean;
  subjects: { subject: string; count: number }[];
  totalCount: number;
  onConfirm: (subject: string | null) => void;
  onClose: () => void;
}

// Arte de cada matéria (imagem, ícone e cor) para os cards verticais,
// no mesmo estilo visual do Caderno de Disciplinas.
const SUBJECT_ART: Record<string, { icon: LucideIcon; color: string; image: string }> = {
  'Matemática & Cálculo': {
    icon: Calculator,
    color: '#2563EB',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
  },
  'Física Clássica & Moderna': {
    icon: Zap,
    color: '#0284C7',
    image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=800&q=80',
  },
  'Química Geral & Orgânica': {
    icon: FlaskConical,
    color: '#7C3AED',
    image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80',
  },
  'Biologia & Genética': {
    icon: Dna,
    color: '#059669',
    image: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=800&q=80',
  },
  'História & Humanidades': {
    icon: Landmark,
    color: '#D97706',
    image: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=800&q=80',
  },
  'Linguagens & Literatura': {
    icon: Languages,
    color: '#EA580C',
    image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80',
  },
  'Ciência da Computação & IA': {
    icon: BrainCircuit,
    color: '#6366F1',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
  },
};

const FALLBACK_ART = {
  icon: Layers,
  color: '#64748B',
  image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80',
};

const GERAL_ART = {
  icon: Layers,
  color: '#059669',
  image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80',
};

interface ArtCard {
  key: string;
  label: string;
  count: number;
  art: { icon: LucideIcon; color: string; image: string };
  onSelect: () => void;
}

export const TeacherCustomModeModal: React.FC<TeacherCustomModeModalProps> = ({ open, subjects, totalCount, onConfirm, onClose }) => {
  const cards: ArtCard[] = [
    {
      key: 'geral',
      label: 'Todas as Matérias',
      count: totalCount,
      art: GERAL_ART,
      onSelect: () => { playSound('click'); onConfirm(null); },
    },
    ...subjects.map((item) => ({
      key: item.subject,
      label: item.subject,
      count: item.count,
      art: SUBJECT_ART[item.subject] || FALLBACK_ART,
      onSelect: () => { playSound('click'); onConfirm(item.subject); },
    })),
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border-b border-purple-500/30 p-5 text-white">
              <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#a78bfa_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
              <div className="relative z-10 flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[10px] font-extrabold uppercase tracking-wider">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Minhas Questões</span>
                  </div>
                  <h2 className="text-lg font-extrabold font-display">Como você quer treinar?</h2>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Escolha a modalidade de treino com suas questões autorais.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { playSound('click'); onClose(); }}
                  className="shrink-0 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition-colors cursor-pointer"
                  title="Fechar"
                  aria-label="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Cards das matérias (lado a lado, verticais) */}
            <div className="p-4 sm:p-5">
              {subjects.length === 0 && totalCount === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
                  Você ainda não tem questões salvas. Crie algumas no Estúdio para personalizar o treino.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[55vh] overflow-y-auto no-scrollbar pr-1">
                  {cards.map((card) => {
                    const Icon = card.art.icon;
                    return (
                      <motion.button
                        key={card.key}
                        type="button"
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={card.onSelect}
                        className="group relative flex flex-col rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden text-left cursor-pointer transition-colors shadow-sm hover:shadow-lg"
                        style={{
                          boxShadow: `0 10px 25px -12px ${card.art.color}30`,
                        }}
                      >
                        {/* Capa com imagem */}
                        <div className="relative h-24 w-full overflow-hidden bg-slate-900 shrink-0">
                          <img
                            src={card.art.image}
                            alt={card.label}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/30 to-transparent" />

                          {/* Badge de quantidade */}
                          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-black/60 backdrop-blur-md text-white border border-white/20 shadow-xs">
                            {card.count} {card.count === 1 ? 'questão' : 'questões'}
                          </span>
                        </div>

                        {/* Ícone flutuante sobre a capa */}
                        <div className="px-3.5 relative z-10 shrink-0">
                          <div
                            className="w-10 h-10 -mt-5 rounded-xl flex items-center justify-center text-white shadow-lg border-2 border-white dark:border-slate-900 transition-transform duration-300 group-hover:scale-105"
                            style={{ backgroundColor: card.art.color }}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                        </div>

                        {/* Conteúdo */}
                        <div className="px-3.5 pt-2 pb-3 flex-1 flex flex-col justify-between gap-1 z-10">
                          <h3 className="font-display font-extrabold text-[13px] leading-tight text-slate-900 dark:text-white">
                            {card.label}
                          </h3>
                          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: card.art.color }}>
                            {card.key === 'geral' ? 'Todas as matérias' : 'Treino focado'}
                          </span>
                        </div>

                        {/* Glow da cor da matéria no hover */}
                        <div
                          className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                          style={{
                            background: `linear-gradient(160deg, ${card.art.color}18 0%, ${card.art.color}30 100%)`,
                          }}
                        />
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};