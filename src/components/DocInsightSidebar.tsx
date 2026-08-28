import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Brain,
  Zap,
  RotateCcw,
  X,
  Lightbulb
} from 'lucide-react';
import { NotebookDoc, Discipline } from '../data/disciplinesData';
import { ScreenId } from '../types/design';

interface DocInsightSidebarProps {
  doc: NotebookDoc;
  discipline: Discipline;
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (screen: ScreenId) => void;
}

interface DocQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIdx: number;
  explanation: string;
  hint: string;
}

export const DocInsightSidebar: React.FC<DocInsightSidebarProps> = ({
  doc,
  discipline,
  isOpen,
  onClose,
  onNavigate
}) => {
  // Generate smart quiz questions based on the document content
  const generateQuestionsForDoc = (): DocQuizQuestion[] => {
    const titleLower = doc.title.toLowerCase();
    if (titleLower.includes('cálculo') || titleLower.includes('integral') || titleLower.includes('derivada')) {
      return [
        {
          id: 'q-1',
          question: 'De acordo com o Teorema Fundamental do Cálculo abordado no texto, qual é a relação entre derivação e integração?',
          options: [
            'A integração é a operação inversa direta da derivação.',
            'Ambas produzem sempre funções constantes.',
            'A derivada de uma integral definida é sempre igual a zero.',
            'Não possuem qualquer vínculo analítico.'
          ],
          correctIdx: 0,
          explanation: 'O TFC estabelece que a integração e a diferenciação são processos inversos complementares.',
          hint: 'Pense na relação entre a taxa de variação instantânea e o acúmulo de área.'
        },
        {
          id: 'q-2',
          question: 'Qual é a interpretação geométrica padrão da integral definida ∫ f(x)dx no intervalo [a, b]?',
          options: [
            'O comprimento da reta tangente no ponto médio.',
            'A área líquida com sinal entre a curva f(x) e o eixo das abscissas (x).',
            'O volume de uma esfera de raio b - a.',
            'A inclinação da reta secante.'
          ],
          correctIdx: 1,
          explanation: 'A integral de Riemann calcula o somatório infinitesimal de retângulos sob a curva.',
          hint: 'Lembre-se das somas de Riemann com base dx e altura f(x).'
        }
      ];
    }

    if (titleLower.includes('quântica') || titleLower.includes('física') || titleLower.includes('schrödinger')) {
      return [
        {
          id: 'q-1',
          question: 'Conforme registrado nas anotações, o que representa o quadrado da função de onda |Ψ(x,t)|²?',
          options: [
            'A velocidade angular exata do elétron.',
            'A densidade de probabilidade de encontrar a partícula na posição x.',
            'A energia térmica dissipada pelo fóton.',
            'A carga elétrica total do núcleo.'
          ],
          correctIdx: 1,
          explanation: 'Pela interpretação estatística de Max Born, |Ψ|² é a distribuição de probabilidade quântica.',
          hint: 'Princípio de Born para probabilidade espacial.'
        },
        {
          id: 'q-2',
          question: 'Qual é a implicação prática do Princípio da Incerteza de Heisenberg para medições simultâneas?',
          options: [
            'É impossível determinar posição e momento linear com precisão infinita simultânea (Δx·Δp ≥ ℏ/2).',
            'A matéria deixa de existir quando não observada.',
            'Toda medição duplica a energia cinética da partícula.',
            'O spin torna-se nulo.'
          ],
          correctIdx: 0,
          explanation: 'A não-comutatividade dos operadores quânticos impõe o limite fundamental Δx·Δp ≥ ℏ/2.',
          hint: 'Lembre-se da relação de operadores de Fourier entre espaço e frequência espacial.'
        }
      ];
    }

    // Default dynamic questions derived from document
    return [
      {
        id: 'q-dyn-1',
        question: `Com base nas anotações de "${doc.title.replace(/^[^\w\s]+/, '').trim()}", qual o foco central abordado na introdução?`,
        options: [
          `Compreensão estrutural e aplicação prática de ${discipline.name}.`,
          'Apenas memorização de datas sem análise crítica.',
          'Substituição de fórmulas por estimativas aleatórias.',
          'Eliminação de pré-requisitos teóricos.'
        ],
        correctIdx: 0,
        explanation: 'O documento foca na fixação aprofundada dos conceitos chave e suas aplicações operatórias.',
        hint: 'Reveja a seção de introdução e o resumo geral do material.'
      },
      {
        id: 'q-dyn-2',
        question: 'Como os conceitos anotados neste documento se conectam com o seu mapa neural de estudos?',
        options: [
          'Eles formam nós conceituais com conexões sinápticas interdisciplinares.',
          'São anotações isoladas que não interagem com outras matérias.',
          'Não têm relevância para simulados e vestibulares.',
          'Devem ser apagados após a leitura.'
        ],
        correctIdx: 0,
        explanation: 'A rede neural integra os nós de cada disciplina para promover recuperação ativa e memória de longo prazo.',
        hint: 'Explore o Mapa Neural para visualizar os termos associados.'
      }
    ];
  };

  const [questions, setQuestions] = useState<DocQuizQuestion[]>(generateQuestionsForDoc());
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: string]: number }>({});
  const [showHints, setShowHints] = useState<{ [qId: string]: boolean }>({});
  const [xpBonus, setXpBonus] = useState(0);
  const [activeTab, setActiveTab] = useState<'quiz' | 'takeaways'>('quiz');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSelectOption = (qId: string, optIdx: number, correctIdx: number) => {
    if (selectedAnswers[qId] !== undefined) return;

    setSelectedAnswers(prev => ({ ...prev, [qId]: optIdx }));
    if (optIdx === correctIdx) {
      setXpBonus(prev => prev + 50);
    }
  };

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setSelectedAnswers({});
      setShowHints({});
      setQuestions([
        ...generateQuestionsForDoc(),
        {
          id: `q-gen-${Date.now()}`,
          question: `[Questão Gerada] Qual estratégia prática de revisão é mais recomendada para ${doc.title.replace(/^[^\w\s]+/, '').trim()}?`,
          options: [
            'Prática deliberada com resolução ativa de exercícios e flashcards.',
            'Leitura passiva repetida sem auto-teste.',
            'Apenas grifar o texto sem escrever anotações próprias.',
            'Pular diretamente para conteúdos avançados sem base sólida.'
          ],
          correctIdx: 0,
          explanation: 'O active recall (recuperação ativa) é comprovadamente a técnica mais eficaz para fixação neurológica.',
          hint: 'Pense nas evidências da neurociência cognitiva para fixação duradoura.'
        }
      ]);
      setIsGenerating(false);
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <motion.aside
      initial={{ x: 340, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 340, opacity: 0 }}
      transition={{ type: 'spring', damping: 26, stiffness: 280 }}
      className="w-80 sm:w-88 h-full bg-white dark:bg-slate-900 border-l border-slate-200/80 dark:border-slate-800 shadow-xl flex flex-col shrink-0 overflow-hidden z-30 select-none"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-xs text-slate-900 dark:text-white font-display flex items-center gap-1.5">
              Insight & Quiz AI
              {xpBonus > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                  +{xpBonus} XP
                </span>
              )}
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Auto-teste em tempo real baseado no texto
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          title="Fechar Insights"
          aria-label="Fechar painel de insights"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 px-3 pt-2 gap-1 bg-white dark:bg-slate-900">
        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex-1 py-2 text-xs font-bold rounded-t-xl transition-colors cursor-pointer border-b-2 ${
            activeTab === 'quiz'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/30'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          🎯 Quiz Rápido ({questions.length})
        </button>
        <button
          onClick={() => setActiveTab('takeaways')}
          className={`flex-1 py-2 text-xs font-bold rounded-t-xl transition-colors cursor-pointer border-b-2 ${
            activeTab === 'takeaways'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/30'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          💡 Síntese & Fórmulas
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'quiz' ? (
          <>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Fixação Ativa (Active Recall)
              </span>
              <button
                onClick={handleRegenerate}
                disabled={isGenerating}
                className="flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>Gerar Novas</span>
              </button>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {questions.map((q, qIndex) => {
                const userSelected = selectedAnswers[q.id];
                const isAnswered = userSelected !== undefined;
                const isCorrect = userSelected === q.correctIdx;

                return (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3"
                  >
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-black flex items-center justify-center shrink-0">
                        {qIndex + 1}
                      </span>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-snug">
                        {q.question}
                      </p>
                    </div>

                    {/* Options */}
                    <div className="space-y-1.5">
                      {q.options.map((opt, optIdx) => {
                        const isChosen = userSelected === optIdx;
                        let btnClass = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100';

                        if (isAnswered) {
                          if (optIdx === q.correctIdx) {
                            btnClass = 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500 text-emerald-900 dark:text-emerald-100 font-bold';
                          } else if (isChosen && !isCorrect) {
                            btnClass = 'bg-rose-50 dark:bg-rose-950/80 border-rose-500 text-rose-900 dark:text-rose-100';
                          } else {
                            btnClass = 'bg-white dark:bg-slate-800 opacity-60 border-slate-200 dark:border-slate-700 text-slate-500';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectOption(q.id, optIdx, q.correctIdx)}
                            disabled={isAnswered}
                            className={`w-full text-left p-2.5 rounded-xl border text-[11px] leading-tight transition-all flex items-start gap-2 cursor-pointer ${btnClass}`}
                          >
                            <span className="font-bold text-[10px] opacity-70">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            <span className="flex-1">{opt}</span>
                            {isAnswered && optIdx === q.correctIdx && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            )}
                            {isAnswered && isChosen && !isCorrect && (
                              <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Feedback & Hint */}
                    {isAnswered && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className={`p-2.5 rounded-xl text-[11px] leading-relaxed ${
                          isCorrect
                            ? 'bg-emerald-100/70 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 border border-emerald-300/60'
                            : 'bg-rose-100/70 dark:bg-rose-950/70 text-rose-900 dark:text-rose-200 border border-rose-300/60'
                        }`}
                      >
                        <p className="font-bold">{isCorrect ? '✨ Correto! (+50 XP)' : '❌ Incorreto'}</p>
                        <p className="mt-0.5">{q.explanation}</p>
                      </motion.div>
                    )}

                    {!isAnswered && (
                      <div className="pt-1">
                        <button
                          onClick={() => setShowHints(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                          className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                        >
                          <Lightbulb className="w-3 h-3" />
                          <span>{showHints[q.id] ? 'Ocultar Dica' : 'Ver Dica'}</span>
                        </button>
                        {showHints[q.id] && (
                          <p className="text-[10px] text-slate-600 dark:text-slate-300 mt-1 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200 dark:border-amber-900">
                            {q.hint}
                          </p>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </>
        ) : (
          /* Takeaways / Fórmulas Tab */
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/50 border border-blue-200/70 dark:border-blue-800 space-y-2">
              <span className="text-[10px] font-black uppercase text-blue-700 dark:text-blue-300 flex items-center gap-1">
                <Brain className="w-3.5 h-3.5" />
                Conceito Chave
              </span>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {doc.title}
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                {doc.summary}
              </p>
            </div>

            {/* Fórmulas e Axiomas Extraídos */}
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Fórmulas & Tópicos Relevantes
              </span>
              {doc.sections.filter(s => s.type === 'code' || s.formula).length > 0 ? (
                doc.sections
                  .filter(s => s.type === 'code' || s.formula)
                  .map((s, idx) => (
                    <div key={idx} className="bg-slate-950 rounded-xl p-2.5 text-cyan-300 font-mono text-xs border border-slate-800">
                      <code>{s.formula || s.content}</code>
                    </div>
                  ))
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-500">
                  Adicione blocos de fórmulas e código no editor para vê-los catalogados aqui.
                </div>
              )}
            </div>

            {/* Ação para Treino */}
            {onNavigate && (
              <div className="pt-2">
                <button
                  onClick={() => onNavigate('treino')}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Abrir no Treino Completo</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.aside>
  );
};
