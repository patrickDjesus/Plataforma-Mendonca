import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BodyPartData } from '../types';
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

interface DetailModalProps {
  part: BodyPartData | null;
  onClose: () => void;
  onSelectPart: (part: BodyPartData) => void;
  allParts: BodyPartData[];
}

type TabType = 'fisiologia' | 'vida_real' | 'enem_dicas' | 'flashcards' | 'questao';

export const DetailModal: React.FC<DetailModalProps> = ({
  part,
  onClose,
  onSelectPart,
  allParts,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('fisiologia');
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [flashcardFlipped, setFlashcardFlipped] = useState<{ [index: number]: boolean }>({});
  const [showQuickPicker, setShowQuickPicker] = useState<boolean>(false);

  if (!part) return null;

  const currentPartIndex = allParts.findIndex((p) => p.id === part.id);
  const prevPart =
    currentPartIndex > 0 ? allParts[currentPartIndex - 1] : allParts[allParts.length - 1];
  const nextPart =
    currentPartIndex < allParts.length - 1 ? allParts[currentPartIndex + 1] : allParts[0];

  const goToTab = (tab: TabType) => {
    sounds.playPop();
    setActiveTab(tab);
  };

  const handleNavigatePart = (targetPart: BodyPartData) => {
    sounds.playPop();
    sounds.stopNarration();
    setIsPlayingAudio(false);
    setSelectedOption(null);
    setShowExplanation(false);
    setShowQuickPicker(false);
    onSelectPart(targetPart);
  };

  const handleReadAloud = () => {
    if (isPlayingAudio) {
      sounds.stopNarration();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      const simpleIntro = part.simpleAnalogy ? `Para entender fácil: ${part.simpleAnalogy}` : '';
      const textToRead = `${part.name}. ${part.tagline}. ${part.shortDesc}. ${simpleIntro}. Como funciona: ${part.fullPhysiology}. Dica para o Enem: ${part.enemTips[0]?.description || ''}`;
      sounds.speakText(textToRead, () => {
        setIsPlayingAudio(false);
      });
    }
  };

  const handleOptionClick = (index: number) => {
    setSelectedOption(index);
    setShowExplanation(true);
    const opt = part.enemQuestion.options[index];
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
      id: 'fisiologia' as TabType,
      label: 'Fisiologia & Mecanismos',
      shortLabel: 'Fisiologia',
      icon: <BookOpen className="w-3.5 h-3.5 text-blue-600" />,
    },
    {
      id: 'vida_real' as TabType,
      label: '🔬 Na Vida Real (Ultraestrutura)',
      shortLabel: '🔬 Vida Real',
      icon: <Microscope className="w-3.5 h-3.5 text-indigo-600" />,
    },
    {
      id: 'enem_dicas' as TabType,
      label: 'Como Cai no ENEM',
      shortLabel: 'Dicas ENEM',
      icon: <Zap className="w-3.5 h-3.5 text-amber-500" />,
    },
    {
      id: 'flashcards' as TabType,
      label: `Flashcards (${part.flashcards.length})`,
      shortLabel: 'Flashcards',
      icon: <Layers className="w-3.5 h-3.5 text-sky-600" />,
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
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border-2 border-blue-200 overflow-hidden z-10 my-auto flex flex-col max-h-[92vh] dark:bg-slate-900 dark:border-slate-700"
        >
          {/* Header Banner */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-700 text-white flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-sm flex items-center justify-center text-2xl shadow-inner shrink-0">
                {part.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black font-display tracking-tight">
                    {part.name}
                  </h2>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-900/40 text-blue-100 border border-white/20">
                    {part.enemRecurrence === 'Altíssima' || part.enemRecurrence === 'Alta' ? 'Alta' : part.enemRecurrence === 'Média' ? 'Média' : 'Baixa'}
                  </span>
                </div>
                <p className="text-xs text-blue-100 font-medium italic">
                  {part.scientificName} • {part.tagline}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleReadAloud}
                className={`flex items-center gap-1 px-3 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                  isPlayingAudio
                    ? 'bg-amber-400 text-amber-950 border-amber-300 animate-pulse'
                    : 'bg-white/20 hover:bg-white/30 text-white border-white/20'
                }`}
                title={isPlayingAudio ? 'Parar leitura de voz' : 'Ouvir resumo em áudio'}
              >
                {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span className="hidden sm:inline">{isPlayingAudio ? 'Parar' : 'Ouvir'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  sounds.stopNarration();
                  onClose();
                }}
                className="p-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer border border-white/20"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Clean Segmented Tab Bar - Zero Horizontal Dragging */}
          <div className="bg-slate-100/90 p-2 border-b border-slate-200 shrink-0 dark:bg-slate-800/90 dark:border-slate-700">
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
                        ? 'bg-white text-blue-700 border-blue-300 shadow-sm ring-2 ring-blue-200/60 font-black dark:bg-slate-800 dark:text-sky-400 dark:border-slate-600 dark:ring-sky-500/30'
                        : 'bg-slate-200/50 hover:bg-white/80 border-transparent text-slate-600 hover:text-slate-900 dark:bg-slate-800/50 dark:hover:bg-slate-700 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    {tab.icon}
                    <span className="truncate">{tab.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scrollable Tab Content */}
          <div className="p-5 overflow-y-auto space-y-4 text-slate-800 flex-1 text-sm scrollbar-thin dark:text-slate-200">
            {/* TAB 1: FISIOLOGIA & MECANISMOS */}
            {activeTab === 'fisiologia' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Easy Analogy & Quick Summary Card */}
                {part.simpleAnalogy && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border-2 border-amber-300 shadow-sm space-y-2.5">
                    <div className="flex items-center gap-2 text-amber-900 font-black font-display text-base dark:text-amber-300">
                      <span className="text-xl">💡</span>
                      <h3>Para Entender Fácil (Sem Complicação)</h3>
                    </div>
                    <p className="text-slate-800 font-semibold text-sm leading-relaxed dark:text-slate-100">
                      {part.simpleAnalogy}
                    </p>

                    {/* Easy Steps if available */}
                    {part.easySteps && part.easySteps.length > 0 && (
                      <div className="pt-2 border-t border-amber-200/80 mt-2 space-y-1.5">
                        <h4 className="text-[11px] font-black uppercase text-amber-900 tracking-wider">
                          Como funciona na prática (passo a passo):
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {part.easySteps.map((step, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-xl bg-white/90 border border-amber-200 text-xs font-bold text-slate-800 flex items-start gap-2 shadow-xs dark:bg-slate-800/90 dark:border-amber-700 dark:text-slate-100"
                            >
                              <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-black text-[11px] flex items-center justify-center shrink-0">
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

                {/* Keywords pill list */}
                <div>
                  <h4 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider mb-2 dark:text-slate-400">
                    Conceitos que o ENEM mais cobra:
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {part.enemKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold dark:bg-sky-950/50 dark:border-sky-900/60 dark:text-sky-300"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Main Physiology Mechanism */}
                <div className="p-4 rounded-2xl bg-white border border-blue-100 shadow-sm space-y-2 dark:bg-slate-800/70 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-blue-900 font-black font-display text-base dark:text-sky-300">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <h3>O que ele faz no corpo (Fisiologia)</h3>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-sm dark:text-slate-300">
                    {part.fullPhysiology}
                  </p>
                </div>

                {/* Cellular & Biochemical details */}
                <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 shadow-sm space-y-2 dark:bg-sky-950/40 dark:border-sky-900/60">
                  <div className="flex items-center gap-2 text-sky-950 font-black font-display text-base dark:text-sky-300">
                    <Sparkles className="w-5 h-5 text-sky-600" />
                    <h3>Por dentro das células (Bioquímica Explicada)</h3>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-sm dark:text-slate-300">
                    {part.cellularBiochemistry}
                  </p>
                </div>

                {/* Direct Advance Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => goToTab('vida_real')}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
                  >
                    <span>Avançar: Ver Esquema & Na Vida Real</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB: COMO É NA VIDA REAL (FOTO REAL / HISTOLOGIA) */}
            {activeTab === 'vida_real' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <RealLifeVisualizer
                  id={part.id}
                  realLifeInfo={part.realLifeInfo}
                  name={part.name}
                  scientificName={part.scientificName}
                  icon={part.icon}
                  themeColor="#2563eb"
                />

                <div className="pt-2 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => goToTab('fisiologia')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Fisiologia</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => goToTab('enem_dicas')}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                  >
                    <span>Avançar: Dicas ENEM & Pegadinhas</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: COMO CAI NO ENEM & PEGADINHAS */}
            {activeTab === 'enem_dicas' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 font-semibold flex items-center gap-2 dark:bg-sky-950/50 dark:border-sky-900/60 dark:text-sky-300">
                  <Award className="w-5 h-5 text-blue-600 shrink-0" />
                  <span>
                    Dicas calibradas pela análise dos últimos 15 anos de provas do ENEM (TRI de Ciências da Natureza).
                  </span>
                </div>

                {part.enemTips.map((tip, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-2xl border transition-all ${
                      tip.type === 'pegadinha'
                        ? 'bg-amber-50/70 border-amber-200 text-amber-950 dark:bg-amber-950/40 dark:border-amber-800/60 dark:text-amber-200'
                        : tip.type === 'frequente'
                        ? 'bg-blue-50/70 border-blue-200 text-blue-950 dark:bg-sky-950/40 dark:border-sky-800/60 dark:text-sky-200'
                        : 'bg-emerald-50/70 border-emerald-200 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-800/60 dark:text-emerald-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm mb-1.5">
                      {tip.type === 'pegadinha' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                      ) : tip.type === 'frequente' ? (
                        <Sparkles className="w-4 h-4 text-blue-600" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      )}
                      <span>{tip.title}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium dark:text-slate-300">
                      {tip.description}
                    </p>
                  </div>
                ))}

                <div className="pt-2 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => goToTab('vida_real')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Vida Real</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => goToTab('flashcards')}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition-all cursor-pointer"
                  >
                    <span>Avançar: Flashcards</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: FLASHCARDS */}
            {activeTab === 'flashcards' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="p-3 bg-sky-50 border border-sky-200 rounded-2xl text-xs text-sky-900 font-semibold flex items-center justify-between dark:bg-sky-950/40 dark:border-sky-900/60 dark:text-sky-300">
                  <span className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-sky-600" />
                    <span>Toque no flashcard para revelar o gabarito e explicação</span>
                  </span>
                  <span className="text-[11px] font-bold text-sky-700 dark:text-sky-300">
                    {part.flashcards.length} cards
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {part.flashcards.map((card, idx) => {
                    const isFlipped = !flashcardFlipped[idx];
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleFlashcard(idx)}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer min-h-[140px] flex flex-col justify-between select-none ${
                          isFlipped
                            ? 'bg-blue-600 border-blue-700 text-white shadow-md'
                            : 'bg-white hover:bg-blue-50/50 border-blue-100 text-slate-800 shadow-sm dark:bg-slate-800/70 dark:hover:bg-slate-700/60 dark:border-slate-700 dark:text-slate-100'
                        }`}
                      >
                        <div>
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              isFlipped
                                ? 'bg-white/20 text-white'
                                : 'bg-blue-100 text-blue-800 dark:bg-sky-950/60 dark:text-sky-300'
                            }`}
                          >
                            {isFlipped ? 'Resposta & Conceito' : 'Pergunta de Prova'}
                          </span>
                          <p
                            className={`text-xs sm:text-sm font-bold mt-2 leading-relaxed ${
                              isFlipped ? 'text-white' : 'text-slate-800 dark:text-slate-100'
                            }`}
                          >
                            {isFlipped ? card.answer : card.question}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 text-[10px] font-bold opacity-80">
                          <span>Card #{idx + 1}</span>
                          <span className="flex items-center gap-1">
                            <RotateCcw className="w-3 h-3" />
                            <span>{isFlipped ? 'Voltar pergunta' : 'Girar card'}</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => goToTab('enem_dicas')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Dicas ENEM</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => goToTab('questao')}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                  >
                    <span>Avançar: Questão Inédita ENEM</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: QUESTÃO INÉDITA ENEM */}
            {activeTab === 'questao' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 dark:bg-slate-800/60 dark:border-slate-700">
                  <div className="flex items-center justify-between text-xs font-black text-slate-500 uppercase tracking-wider dark:text-slate-400">
                    <span>Ciências da Natureza e suas Tecnologias</span>
                    <span className="text-blue-600 font-bold dark:text-sky-400">Matriz de Habilidades</span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed dark:text-slate-100">
                    {part.enemQuestion.statement}
                  </p>
                </div>

                {/* Multiple Choice Options */}
                <div className="space-y-2">
                  {part.enemQuestion.options.map((opt, index) => {
                    const isSelected = selectedOption === index;
                    let optionStyle =
                      'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 dark:bg-slate-800/60 dark:hover:bg-slate-700/60 dark:border-slate-700 dark:text-slate-100';

                    if (selectedOption !== null) {
                      if (opt.isCorrect) {
                        optionStyle =
                          'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-300';
                      } else if (isSelected && !opt.isCorrect) {
                        optionStyle =
                          'bg-rose-50 border-rose-500 text-rose-950 font-bold ring-2 ring-rose-300';
                      } else {
                        optionStyle =
                          'bg-slate-50 border-slate-200 text-slate-400 opacity-60 dark:bg-slate-800/40 dark:border-slate-700 dark:text-slate-500';
                      }
                    }

                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleOptionClick(index)}
                        disabled={selectedOption !== null}
                        className={`w-full p-3.5 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-start gap-3 cursor-pointer ${optionStyle}`}
                      >
                        <span className="w-6 h-6 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs shrink-0 text-slate-700 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="flex-1 mt-0.5 font-medium">{opt.text}</span>
                        {selectedOption !== null && opt.isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        )}
                        {selectedOption === index && !opt.isCorrect && (
                          <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Box */}
                {showExplanation && selectedOption !== null && (
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-2 dark:bg-sky-950/50 dark:border-sky-900/60">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-blue-900 tracking-wider dark:text-sky-300">
                        Comentário da Resolução ENEM:
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedOption(null);
                          setShowExplanation(false);
                          sounds.playPop();
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 underline font-bold cursor-pointer dark:text-sky-400 dark:hover:text-sky-300"
                      >
                        Tentar Novamente
                      </button>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium dark:text-slate-300">
                      {part.enemQuestion.options[selectedOption].explanation}
                    </p>
                    <p className="text-xs text-blue-900 font-semibold pt-1 border-t border-blue-200 dark:text-sky-300 dark:border-sky-900/60">
                      💡 {part.enemQuestion.generalExplanation}
                    </p>
                  </div>
                )}

                <div className="pt-2 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => goToTab('flashcards')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Flashcards</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigatePart(nextPart)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                  >
                    <span>Próximo Órgão: {nextPart.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Navigation Bar: Previous / Next Structure Stepper (Zero Scrollbars) */}
          <div className="p-3 bg-slate-50 border-t border-blue-100 flex items-center justify-between gap-2 shrink-0 dark:bg-slate-800/80 dark:border-slate-700">
            {/* Previous Organ Button */}
            <button
              type="button"
              onClick={() => handleNavigatePart(prevPart)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-sm dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-600 dark:hover:border-sky-600 dark:text-slate-200"
              title={`Ver ${prevPart.name}`}
            >
              <ChevronLeft className="w-4 h-4 text-blue-600" />
              <span className="text-sm">{prevPart.icon}</span>
              <span className="hidden sm:inline truncate max-w-[110px]">{prevPart.name}</span>
            </button>

            {/* Quick Structure Selector / Progress indicator */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  setShowQuickPicker(!showQuickPicker);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 text-xs font-extrabold transition-all cursor-pointer dark:bg-sky-950/50 dark:hover:bg-sky-900/50 dark:border-sky-900/60 dark:text-sky-300"
              >
                <List className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  Estrutura {currentPartIndex + 1} de {allParts.length}
                </span>
              </button>

              {/* Popover Quick Picker */}
              <AnimatePresence>
                {showQuickPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border-2 border-blue-200 p-2.5 z-40 max-h-64 overflow-y-auto dark:bg-slate-800 dark:border-slate-600"
                  >
                    <div className="text-[11px] font-black text-slate-500 uppercase px-2 py-1 flex items-center justify-between dark:text-slate-400">
                      <span>Ir direto para órgão:</span>
                      <span className="text-blue-600 font-bold dark:text-sky-400">{allParts.length} itens</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 mt-1">
                      {allParts.map((p) => {
                        const isCurrent = p.id === part.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleNavigatePart(p)}
                            className={`p-2 rounded-xl text-left text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                              isCurrent
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-slate-50 hover:bg-blue-50 text-slate-800 dark:bg-slate-700/60 dark:hover:bg-slate-600/60 dark:text-slate-200'
                            }`}
                          >
                            <span className="text-base">{p.icon}</span>
                            <span className="truncate">{p.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Next Organ Button */}
            <button
              type="button"
              onClick={() => handleNavigatePart(nextPart)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-sm dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-600 dark:hover:border-sky-600 dark:text-slate-200"
              title={`Ver ${nextPart.name}`}
            >
              <span className="hidden sm:inline truncate max-w-[110px]">{nextPart.name}</span>
              <span className="text-sm">{nextPart.icon}</span>
              <ChevronRight className="w-4 h-4 text-blue-600" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
