import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CellOrganelleData } from '../types';
import { sounds } from '../utils/audio';
import { RealLifeVisualizer } from './RealLifeVisualizer';
import {
  X,
  Volume2,
  VolumeX,
  Sparkles,
  BookOpen,
  Award,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Layers,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Zap,
  GraduationCap,
  Microscope,
  ArrowRight,
  ArrowLeft,
  List,
} from 'lucide-react';

interface CellDetailModalProps {
  organelle: CellOrganelleData | null;
  onClose: () => void;
  onSelectOrganelle: (organelle: CellOrganelleData) => void;
  allOrganelles: CellOrganelleData[];
}

type TabType = 'citologia' | 'vida_real' | 'enem_dicas' | 'flashcards' | 'questao';

export const CellDetailModal: React.FC<CellDetailModalProps> = ({
  organelle,
  onClose,
  onSelectOrganelle,
  allOrganelles,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('citologia');
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [flashcardFlipped, setFlashcardFlipped] = useState<{ [index: number]: boolean }>({});
  const [showQuickPicker, setShowQuickPicker] = useState<boolean>(false);

  if (!organelle) return null;

  const currentIdx = allOrganelles.findIndex((o) => o.id === organelle.id);
  const prevOrganelle =
    currentIdx > 0 ? allOrganelles[currentIdx - 1] : allOrganelles[allOrganelles.length - 1];
  const nextOrganelle =
    currentIdx < allOrganelles.length - 1 ? allOrganelles[currentIdx + 1] : allOrganelles[0];

  const goToTab = (tab: TabType) => {
    sounds.playPop();
    setActiveTab(tab);
  };

  const handleNavigateOrganelle = (target: CellOrganelleData) => {
    sounds.playPop();
    sounds.stopNarration();
    setIsPlayingAudio(false);
    setSelectedOption(null);
    setShowExplanation(false);
    setShowQuickPicker(false);
    onSelectOrganelle(target);
  };

  const handleReadAloud = () => {
    if (isPlayingAudio) {
      sounds.stopNarration();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      const simpleIntro = organelle.simpleAnalogy ? `Para entender fácil: ${organelle.simpleAnalogy}` : '';
      const textToRead = `${organelle.name}. ${organelle.tagline}. ${organelle.shortDesc}. ${simpleIntro}. Como funciona: ${organelle.fullFunction}. Dica do ENEM: ${organelle.enemTips[0]?.description || ''}`;
      sounds.speakText(textToRead, () => {
        setIsPlayingAudio(false);
      });
    }
  };

  const handleOptionClick = (index: number) => {
    setSelectedOption(index);
    setShowExplanation(true);
    const opt = organelle.enemQuestion.options[index];
    if (opt.isCorrect) {
      sounds.playSuccess();
    } else {
      sounds.playError();
    }
  };

  const toggleFlashcard = (idx: number) => {
    sounds.playPop();
    setFlashcardFlipped((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const tabsConfig = [
    {
      id: 'citologia' as TabType,
      label: 'Bioquímica & Citologia',
      shortLabel: 'Citologia',
      icon: <BookOpen className="w-3.5 h-3.5 text-[#2D5A46]" />,
    },
    {
      id: 'vida_real' as TabType,
      label: '🔬 Na Vida Real (Ultraestrutura)',
      shortLabel: '🔬 Vida Real',
      icon: <Microscope className="w-3.5 h-3.5 text-[#52B788]" />,
    },
    {
      id: 'enem_dicas' as TabType,
      label: 'Como Cai no ENEM',
      shortLabel: 'Dicas ENEM',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />,
    },
    {
      id: 'flashcards' as TabType,
      label: `Flashcards (${organelle.flashcards.length})`,
      shortLabel: 'Flashcards',
      icon: <Sparkles className="w-3.5 h-3.5 text-[#52B788]" />,
    },
    {
      id: 'questao' as TabType,
      label: 'Questão Inédita ENEM',
      shortLabel: 'Questão ENEM',
      icon: <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />,
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            sounds.stopNarration();
            onClose();
          }}
          className="fixed inset-0 bg-[#18181B]/60 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border-2 border-[#E7E2D9] overflow-hidden z-10 my-auto flex flex-col max-h-[92vh] dark:bg-[#18181B] dark:border-[#2C2C30]"
        >
          {/* Header Banner */}
          <div
            className="p-5 sm:p-6 text-white flex items-center justify-between gap-4 shrink-0 transition-colors"
            style={{ backgroundColor: organelle.color }}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner shrink-0">
                {organelle.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight">
                    {organelle.name}
                  </h2>
                  <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                    {organelle.category}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-white/90 font-medium italic mt-0.5">
                  {organelle.scientificName} • Dificuldade: {organelle.enemRecurrence === 'Altíssima' || organelle.enemRecurrence === 'Alta' ? 'Alta' : organelle.enemRecurrence === 'Média' ? 'Média' : 'Baixa'}
                </p>
              </div>
            </div>

            {/* Top Action Controls */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleReadAloud}
                className={`p-2.5 rounded-2xl border transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer ${
                  isPlayingAudio
                    ? 'bg-[#21483A] text-white border-[#21483A] animate-pulse'
                    : 'bg-white/15 hover:bg-white/25 border-white/20 text-white'
                }`}
                title={isPlayingAudio ? 'Parar Áudio' : 'Ouvir Explicação'}
              >
                {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span className="hidden sm:inline">{isPlayingAudio ? 'Parar' : 'Ouvir'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.stopNarration();
                  sounds.playPop();
                  onClose();
                }}
                className="p-2.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-white transition-colors cursor-pointer"
                title="Fechar Detalhes"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Clean Segmented Tab Bar - Zero Horizontal Scrollbars */}
          <div className="bg-[#EFECE6]/90 p-2 border-b border-[#E7E2D9] shrink-0 dark:bg-[#232326]/90 dark:border-[#2C2C30]">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {tabsConfig.map((tab) => {
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => goToTab(tab.id)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-white text-[#2D5A46] border-[#CFE1D6] shadow-sm ring-2 ring-[#CFE1D6]/60 font-black dark:bg-[#232326] dark:text-[#52B788] dark:border-[#3B3B40] dark:ring-[#52B788]/30'
                        : 'bg-[#E7E2D9]/50 hover:bg-white/80 border-transparent text-[#57534E] hover:text-[#1C1917] dark:bg-[#2C2C30]/50 dark:hover:bg-[#333338] dark:text-[#A8A29E] dark:hover:text-[#FAF9F5]'
                    }`}
                  >
                    {tab.icon}
                    <span className="truncate">{tab.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modal Tab Contents (Scrollable) */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-5 scrollbar-thin dark:text-[#FAF9F5]">
            {/* TAB 1: BIOQUÍMICA & CITOLOGIA */}
            {activeTab === 'citologia' && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                {/* Easy Analogy & Quick Summary Card */}
                {organelle.simpleAnalogy && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-[#EBF3EF] via-[#EBF3EF]/80 to-[#EBF3EF] border-2 border-[#CFE1D6] shadow-sm space-y-2.5">
                    <div className="flex items-center gap-2 text-[#2D5A46] font-black font-display text-base dark:text-[#52B788]">
                      <span className="text-xl">💡</span>
                      <h3>Para Entender Fácil (Sem Complicação)</h3>
                    </div>
                    <p className="text-[#44403C] font-semibold text-sm leading-relaxed dark:text-[#D6D3CD]">
                      {organelle.simpleAnalogy}
                    </p>

                    {/* Easy Steps if available */}
                    {organelle.easySteps && organelle.easySteps.length > 0 && (
                      <div className="pt-2 border-t border-[#CFE1D6] mt-2 space-y-1.5">
                        <h4 className="text-[11px] font-black uppercase text-[#2D5A46] tracking-wider">
                          Como funciona na prática (passo a passo):
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {organelle.easySteps.map((step, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-xl bg-white/90 border border-[#CFE1D6] text-xs font-bold text-[#44403C] flex items-start gap-2 shadow-xs dark:bg-[#18181B]/90 dark:border-[#22392D] dark:text-[#D6D3CD]"
                            >
                              <span className="w-5 h-5 rounded-full bg-[#2D5A46] text-white font-black text-[11px] flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <span className="leading-snug">{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tagline Box */}
                <div className="p-4 rounded-2xl bg-[#EBF3EF]/80 border border-[#CFE1D6] flex items-start gap-3 dark:bg-[#15221B]/50 dark:border-[#22392D]">
                  <div className="w-8 h-8 rounded-xl bg-[#2D5A46] text-white flex items-center justify-center font-bold text-base shrink-0 mt-0.5">
                    🔬
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#2D5A46] uppercase tracking-wider dark:text-[#52B788]">
                      O que ela faz na célula
                    </h4>
                    <p className="text-sm font-bold text-[#1C1917] leading-snug dark:text-[#FAF9F5]">
                      {organelle.tagline}
                    </p>
                  </div>
                </div>

                {/* Full Physiology Explanation */}
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-black text-[#1C1917] uppercase tracking-wider flex items-center gap-2 dark:text-[#FAF9F5]">
                    <Layers className="w-4 h-4 text-[#2D5A46]" />
                    Como Ela Funciona (Citologia Descomplicada)
                  </h3>
                  <div className="p-4 rounded-2xl bg-[#EFECE6]/60 border border-[#E7E2D9] text-[#44403C] text-sm leading-relaxed font-medium dark:bg-[#232326]/60 dark:border-[#2C2C30] dark:text-[#D6D3CD]">
                    {organelle.fullFunction}
                  </div>
                </div>

                {/* Cellular Biochemistry Mechanism */}
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-black text-[#1C1917] uppercase tracking-wider flex items-center gap-2 dark:text-[#FAF9F5]">
                    <Zap className="w-4 h-4 text-[#2D5A46]" />
                    Bioquímica e Reações Químicas Explicadas
                  </h3>
                  <div className="p-4 rounded-2xl bg-[#EBF3EF]/60 border border-[#CFE1D6] text-[#44403C] text-sm leading-relaxed font-medium dark:bg-[#15221B]/40 dark:border-[#22392D] dark:text-[#D6D3CD]">
                    {organelle.biochemistryMecanismo}
                  </div>
                </div>

                {/* Key Keywords Badges */}
                <div className="flex flex-col gap-2">
                  <h4 className="text-xs font-black text-[#78716C] uppercase tracking-wider dark:text-[#A8A29E]">
                    Termos Recorrentes nas Provas de Ciências da Natureza:
                  </h4>
                  <div className="flex items-center gap-2 flex-wrap">
                    {organelle.enemKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-xl bg-[#E7E2D9]/80 text-[#57534E] text-xs font-bold border border-[#D6D0C5] flex items-center gap-1 dark:bg-[#232326] dark:text-[#D6D3CD] dark:border-[#2C2C30]"
                      >
                        <span className="text-[#2D5A46] dark:text-[#52B788]">#</span>
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Advance Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => goToTab('vida_real')}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#2D5A46] hover:bg-[#21483A] text-white font-bold text-xs shadow-md shadow-[#2D5A46]/20 transition-all cursor-pointer"
                  >
                    <span>Avançar: Ver Esquema & Ultraestrutura</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB: COMO É NA VIDA REAL (MICROSCOPIA REAL) */}
            {activeTab === 'vida_real' && (
              <div className="animate-in fade-in duration-200 flex flex-col gap-4">
                <RealLifeVisualizer
                  id={organelle.id}
                  realLifeInfo={organelle.realLifeInfo}
                  name={organelle.name}
                  scientificName={organelle.scientificName}
                  icon={organelle.icon}
                  themeColor={organelle.color}
                />

                <div className="pt-2 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => goToTab('citologia')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EFECE6] hover:bg-[#E5DFD5] text-[#57534E] font-bold text-xs transition-colors cursor-pointer dark:bg-[#232326] dark:hover:bg-[#333338] dark:text-[#D6D3CD]"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Bioquímica & Citologia</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => goToTab('enem_dicas')}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#2D5A46] hover:bg-[#21483A] text-white font-bold text-xs shadow-md shadow-[#2D5A46]/20 transition-all cursor-pointer"
                  >
                    <span>Avançar: Dicas ENEM & Pegadinhas</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: COMO CAI NO ENEM & PEGADINHAS */}
            {activeTab === 'enem_dicas' && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-[#1C1917] uppercase tracking-wider flex items-center gap-2 dark:text-[#FAF9F5]">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Mapeamento de Distratores & Pegadinhas Clássicas
                  </h3>
                  <span className="text-xs font-bold text-[#78716C] dark:text-[#A8A29E]">
                    {organelle.enemTips.length} pontos de atenção
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {organelle.enemTips.map((tip, idx) => (
                    <div
                      key={idx}
className={`p-4 rounded-2xl border-2 flex flex-col gap-1.5 ${
                        tip.type === 'pegadinha'
                          ? 'bg-rose-50/80 border-rose-200 text-[#1C1917] dark:bg-rose-950/40 dark:border-rose-800/60 dark:text-rose-100'
                          : tip.type === 'frequente'
                          ? 'bg-[#EBF3EF]/80 border-[#CFE1D6] text-[#2D5A46] dark:bg-[#15221B]/40 dark:border-[#22392D] dark:text-[#52B788]'
                          : 'bg-emerald-50/80 border-emerald-200 text-[#1C1917] dark:bg-emerald-950/40 dark:border-emerald-800/60 dark:text-emerald-100'
                    }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-[#1C1917] flex items-center gap-1.5 font-display dark:text-[#FAF9F5]">
                          {tip.type === 'pegadinha' && '⚠️ Cuidado: Pegadinha de Prova'}
                          {tip.type === 'frequente' && '📌 Padrão Muito Recorrente'}
                          {tip.type === 'conceito_chave' && '🎯 Fundamento Indispensável'}
                        </span>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-white border border-[#E7E2D9] dark:bg-[#3B3B40] dark:border-[#44403C] dark:text-[#D6D3CD]">
                          {tip.type}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[#1C1917] dark:text-[#FAF9F5]">{tip.title}</h4>
                      <p className="text-xs sm:text-sm text-[#44403C] leading-relaxed font-medium dark:text-[#D6D3CD]">
                        {tip.description}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => goToTab('vida_real')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EFECE6] hover:bg-[#E5DFD5] text-[#57534E] font-bold text-xs transition-colors cursor-pointer dark:bg-[#232326] dark:hover:bg-[#333338] dark:text-[#D6D3CD]"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Microscopia Real</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => goToTab('flashcards')}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#2D5A46] hover:bg-[#21483A] text-white font-bold text-xs shadow-md shadow-[#2D5A46]/20 transition-all cursor-pointer"
                  >
                    <span>Avançar: Flashcards de Memorização</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: FLASHCARDS INTERATIVOS */}
            {activeTab === 'flashcards' && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-[#1C1917] uppercase tracking-wider dark:text-[#FAF9F5]">
                      Memorização Ativa & Repetição Espaçada
                    </h3>
                    <p className="text-xs text-[#78716C] font-semibold dark:text-[#A8A29E]">
                      Clique no cartão para virar e conferir a resposta ideal
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playPop();
                      setFlashcardFlipped({});
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-[#2D5A46] hover:text-[#21483A] bg-[#EBF3EF] px-2.5 py-1 rounded-xl border border-[#CFE1D6] cursor-pointer dark:text-[#52B788] dark:hover:text-[#52B788] dark:bg-[#15221B]/50 dark:border-[#22392D]"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Desvirar Todos</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {organelle.flashcards.map((card, idx) => {
                    const isTurned = !!flashcardFlipped[idx];
                    return (
                      <div key={idx} className="perspective-1000 h-full">
                        <div
                          onClick={() => toggleFlashcard(idx)}
                          className={`grid transform-style-3d transition-transform duration-500 cursor-pointer select-none ${
                            isTurned ? 'rotate-y-180' : ''
                          }`}
                        >
                          {/* Front Face */}
                          <div className="[grid-area:1/1] backface-hidden flex flex-col justify-between min-h-[160px] p-5 rounded-2xl border-2 bg-white hover:bg-[#EBF3EF]/60 border-[#E7E2D9] text-[#1C1917] hover:border-[#CFE1D6] shadow-sm dark:bg-[#232326]/70 dark:hover:bg-[#333338]/60 dark:border-[#2C2C30] dark:text-[#FAF9F5] dark:hover:border-[#22392D]">
                            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider opacity-80">
                              <span>❓ Pergunta do Flashcard</span>
                              <span>Card #{idx + 1}</span>
                            </div>

                            <p className="text-sm font-bold my-auto leading-relaxed text-[#1C1917] dark:text-[#FAF9F5]">
                              {card.front}
                            </p>

                            <div className="flex items-center justify-between text-[10px] font-bold opacity-75 pt-2 border-t border-current/20">
                              <span>Toque para revelar a resposta</span>
                              <span>↺</span>
                            </div>
                          </div>

                          {/* Back Face */}
                          <div className="[grid-area:1/1] backface-hidden rotate-y-180 flex flex-col justify-between min-h-[160px] p-5 rounded-2xl border-2 bg-gradient-to-br from-[#2D5A46] to-[#1E3E30] text-white border-[#21483A] shadow-sm shadow-[#2D5A46]/20">
                            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider opacity-80">
                              <span>✅ Resposta Modelo</span>
                              <span>Card #{idx + 1}</span>
                            </div>

                            <p className="text-sm font-bold my-auto leading-relaxed text-[#EBF3EF]">
                              {card.back}
                            </p>

                            <div className="flex items-center justify-between text-[10px] font-bold opacity-75 pt-2 border-t border-current/20">
                              <span>Toque para rever a pergunta</span>
                              <span>↺</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => goToTab('enem_dicas')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EFECE6] hover:bg-[#E5DFD5] text-[#57534E] font-bold text-xs transition-colors cursor-pointer dark:bg-[#232326] dark:hover:bg-[#333338] dark:text-[#D6D3CD]"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Dicas ENEM</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => goToTab('questao')}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                  >
                    <span>Avançar: Resolver Questão ENEM</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: QUESTÃO INÉDITA ENEM COMENTADA */}
            {activeTab === 'questao' && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                {/* Competence Tag */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-xl bg-[#EBF3EF] text-[#2D5A46] text-xs font-black border border-[#CFE1D6] dark:bg-[#15221B]/50 dark:text-[#52B788] dark:border-[#22392D]">
                    {organelle.enemQuestion.competenceSkill}
                  </span>
                  <span className="text-xs font-bold text-[#78716C] dark:text-[#A8A29E]">
                    Estilo Padrão INEP / ENEM
                  </span>
                </div>

                {/* Question Context & Prompt */}
                <div className="p-4 rounded-2xl bg-[#EFECE6]/60 border border-[#E7E2D9] flex flex-col gap-2.5 dark:bg-[#232326]/60 dark:border-[#2C2C30]">
                  <p className="text-xs sm:text-sm text-[#44403C] leading-relaxed font-medium dark:text-[#D6D3CD]">
                    {organelle.enemQuestion.context}
                  </p>
                  <p className="text-sm sm:text-base font-black text-[#1C1917] font-display dark:text-[#FAF9F5]">
                    {organelle.enemQuestion.question}
                  </p>
                </div>

                {/* Multiple Choice Options */}
                <div className="flex flex-col gap-2.5">
                  {organelle.enemQuestion.options.map((opt, idx) => {
                    const isSelected = selectedOption === idx;
                    return (
                      <button
                        key={opt.letter}
                        type="button"
                        onClick={() => handleOptionClick(idx)}
                        className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-start gap-3 cursor-pointer ${
                          isSelected
                            ? opt.isCorrect
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-md ring-2 ring-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-500 dark:text-emerald-100 dark:ring-emerald-900/60'
                              : 'bg-rose-50 border-rose-500 text-rose-900 shadow-md ring-2 ring-rose-200 dark:bg-rose-950/50 dark:border-rose-500 dark:text-rose-100 dark:ring-rose-900/60'
                            : 'bg-white hover:bg-[#EFECE6] border-[#E7E2D9] text-[#1C1917] hover:border-[#CFE1D6] dark:bg-[#232326]/60 dark:hover:bg-[#333338]/60 dark:border-[#2C2C30] dark:text-[#FAF9F5]'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                            isSelected
                              ? opt.isCorrect
                                ? 'bg-emerald-600 text-white'
                                : 'bg-rose-600 text-white'
                              : 'bg-[#EFECE6] text-[#57534E] border border-[#E7E2D9] dark:bg-[#3B3B40] dark:text-[#D6D3CD] dark:border-[#44403C]'
                          }`}
                        >
                          {opt.letter}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs sm:text-sm font-bold leading-snug">
                            {opt.text}
                          </p>
                          {showExplanation && isSelected && (
                            <p
                              className={`mt-2 text-xs font-semibold leading-relaxed pt-2 border-t ${
                                opt.isCorrect
                                  ? 'border-emerald-200 text-emerald-800 dark:border-emerald-800/60 dark:text-emerald-300'
                                  : 'border-rose-200 text-rose-800 dark:border-rose-800/60 dark:text-rose-300'
                              }`}
                            >
                              {opt.explanation}
                            </p>
                          )}
                        </div>
                        {showExplanation && (
                          <div className="shrink-0 mt-0.5">
                            {opt.isCorrect ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            ) : isSelected ? (
                              <XCircle className="w-5 h-5 text-rose-600" />
                            ) : null}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* General Resolution Box */}
                {showExplanation && (
                  <div className="p-4 rounded-2xl bg-[#EBF3EF] border-2 border-[#CFE1D6] flex flex-col gap-1.5 dark:bg-[#15221B]/50 dark:border-[#22392D]">
                    <h4 className="text-xs font-black text-[#2D5A46] uppercase tracking-wider flex items-center gap-1.5 dark:text-[#52B788]">
                      <Award className="w-4 h-4 text-[#2D5A46]" />
                      Gabarito Comentado & Estratégia de Resolução
                    </h4>
                    <p className="text-xs sm:text-sm text-[#1C1917] leading-relaxed font-medium dark:text-[#FAF9F5]">
                      {organelle.enemQuestion.generalExplanation}
                    </p>
                  </div>
                )}

                <div className="pt-2 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => goToTab('flashcards')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EFECE6] hover:bg-[#E5DFD5] text-[#57534E] font-bold text-xs transition-colors cursor-pointer dark:bg-[#232326] dark:hover:bg-[#333338] dark:text-[#D6D3CD]"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Voltar aos Flashcards</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigateOrganelle(nextOrganelle)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#2D5A46] hover:bg-[#21483A] text-white font-bold text-xs shadow-md shadow-[#2D5A46]/20 transition-all cursor-pointer"
                  >
                    <span>Próxima Organela: {nextOrganelle.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Next/Prev Organelle Navigation Bar (Zero Scrollbars) */}
          <div className="bg-[#EFECE6] p-3.5 border-t border-[#E7E2D9] flex items-center justify-between gap-2 shrink-0 dark:bg-[#232326]/80 dark:border-[#2C2C30]">
            {/* Previous Organelle Button */}
            <button
              type="button"
              onClick={() => handleNavigateOrganelle(prevOrganelle)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#EBF3EF] border border-[#E7E2D9] hover:border-[#CFE1D6] text-[#57534E] text-xs font-bold transition-all cursor-pointer shadow-sm dark:bg-[#232326] dark:hover:bg-[#333338] dark:border-[#2C2C30] dark:hover:border-[#22392D] dark:text-[#D6D3CD]"
              title={`Ver ${prevOrganelle.name}`}
            >
              <ChevronLeft className="w-4 h-4 text-[#2D5A46]" />
              <span className="text-sm">{prevOrganelle.icon}</span>
              <span className="hidden sm:inline truncate max-w-[110px]">{prevOrganelle.name}</span>
            </button>

            {/* Quick Organelle Selector / Progress indicator */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  setShowQuickPicker(!showQuickPicker);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EBF3EF] hover:bg-[#E5DFD5] border border-[#CFE1D6] text-[#2D5A46] text-xs font-extrabold transition-all cursor-pointer dark:bg-[#15221B]/50 dark:hover:bg-[#22392D]/50 dark:border-[#22392D] dark:text-[#52B788]"
              >
                <List className="w-3.5 h-3.5 text-[#2D5A46]" />
                <span>
                  Organela {currentIdx + 1} de {allOrganelles.length}
                </span>
              </button>

              {/* Popover Quick Picker */}
              <AnimatePresence>
                {showQuickPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border-2 border-[#E7E2D9] p-2.5 z-40 max-h-64 overflow-y-auto dark:bg-[#232326] dark:border-[#44403C]"
                  >
                    <div className="text-[11px] font-black text-[#78716C] uppercase px-2 py-1 flex items-center justify-between dark:text-[#A8A29E]">
                      <span>Ir direto para organela:</span>
                      <span className="text-[#2D5A46] font-bold dark:text-[#52B788]">{allOrganelles.length} itens</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 mt-1">
                      {allOrganelles.map((o) => {
                        const isCurrent = o.id === organelle.id;
                        return (
                          <button
                            key={o.id}
                            type="button"
                            onClick={() => handleNavigateOrganelle(o)}
                            className={`p-2 rounded-xl text-left text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                              isCurrent
                                ? 'bg-[#2D5A46] text-white shadow-sm'
                                : 'bg-[#EFECE6] hover:bg-[#EBF3EF] text-[#1C1917] dark:bg-[#3B3B40]/60 dark:hover:bg-[#44403C]/60 dark:text-[#D6D3CD]'
                            }`}
                          >
                            <span className="text-base">{o.icon}</span>
                            <span className="truncate">{o.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Next Organelle Button */}
            <button
              type="button"
              onClick={() => handleNavigateOrganelle(nextOrganelle)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#EBF3EF] border border-[#E7E2D9] hover:border-[#CFE1D6] text-[#57534E] text-xs font-bold transition-all cursor-pointer shadow-sm dark:bg-[#232326] dark:hover:bg-[#333338] dark:border-[#2C2C30] dark:hover:border-[#22392D] dark:text-[#D6D3CD]"
              title={`Ver ${nextOrganelle.name}`}
            >
              <span className="hidden sm:inline truncate max-w-[110px]">{nextOrganelle.name}</span>
              <span className="text-sm">{nextOrganelle.icon}</span>
              <ChevronRight className="w-4 h-4 text-[#2D5A46]" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
