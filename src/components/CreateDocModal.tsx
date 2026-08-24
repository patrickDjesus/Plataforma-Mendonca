import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  FileText,
  Globe,
  Lock,
  Plus,
  Tag,
  Check,
  Wand2,
  Sparkles,
  GraduationCap,
  Calculator,
  Brain,
  FlaskConical,
  CheckSquare,
  BookOpen,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Discipline, NotebookDoc, DocSection } from '../data/disciplinesData';

interface CreateDocModalProps {
  isOpen: boolean;
  onClose: () => void;
  discipline: Discipline;
  onCreateDoc: (newDoc: NotebookDoc) => void;
}

interface DocTemplate {
  id: string;
  title: string;
  emoji: string;
  description: string;
  badge: string;
  color: string;
  summary: string;
  tags: string[];
  sections: DocSection[];
}

const EMOJI_PRESETS = ['📘', '📝', '⚡', '🔬', '🧠', '🪐', '💡', '📐', '🧬', '🏛️', '🔥', '📊', '🧪', '📈'];

export const CreateDocModal: React.FC<CreateDocModalProps> = ({
  isOpen,
  onClose,
  discipline,
  onCreateDoc
}) => {
  // Available rich templates
  const TEMPLATES: DocTemplate[] = [
    {
      id: 'blank',
      title: 'Documento em Branco',
      emoji: '📄',
      description: 'Página limpa para escrita livre, anotações rápidas e raciocínio livre.',
      badge: 'Básico',
      color: '#64748B',
      summary: 'Anotações livres e síntese geral.',
      tags: [discipline.name, 'Geral', 'Anotações'],
      sections: [
        {
          id: `s-${Date.now()}-1`,
          heading: '',
          content: 'Comece a digitar suas anotações aqui. Digite / para ver opções de formatação como títulos, listas, fórmulas e caixas de destaque...',
          type: 'paragraph'
        }
      ]
    },
    {
      id: 'lecture',
      title: 'Anotação de Aula / Teoria',
      emoji: '🎓',
      description: 'Estrutura pedagógica com introdução, tópicos essenciais, exemplos e resumo Cornell.',
      badge: 'Recomendado',
      color: '#3B82F6',
      summary: `Síntese estruturada das aulas teóricas de ${discipline.name}.`,
      tags: [discipline.name, 'Teoria', 'Aulas', 'ENEM 2026'],
      sections: [
        {
          id: `s-${Date.now()}-1`,
          heading: '1. Introdução & Contextualização',
          content: `Fundamentos essenciais de ${discipline.name} com foco nos conceitos de alta recorrência nos exames.`,
          type: 'paragraph'
        },
        {
          id: `s-${Date.now()}-2`,
          heading: '2. Conceitos & Leis Principais',
          content: 'Registre aqui os axiomas, regras operatórias e definições teóricas.',
          type: 'paragraph'
        },
        {
          id: `s-${Date.now()}-3`,
          heading: '',
          content: 'Ponto chave: memorize as condições de contorno e aplicações práticas.',
          type: 'callout',
          callout: 'Destaque importante para fixação sináptica.',
          calloutType: 'tip'
        },
        {
          id: `s-${Date.now()}-4`,
          heading: '3. Resumo & Próximos Passos',
          content: 'Realizar lista de 10 exercícios de fixação para consolidação na memória de longo prazo.',
          type: 'todo',
          checked: false
        }
      ]
    },
    {
      id: 'formulas',
      title: 'Fórmulas & Axiomas',
      emoji: '⚡',
      description: 'Quadro analítico com equações matemáticas, deduções, grandezas e unidades no SI.',
      badge: 'Exatas',
      color: '#8B5CF6',
      summary: `Compilado de fórmulas e relações matemáticas de ${discipline.name}.`,
      tags: [discipline.name, 'Fórmulas', 'Exatas', 'Revisão'],
      sections: [
        {
          id: `s-${Date.now()}-1`,
          heading: '1. Equação Fundamental',
          content: 'Relação direta entre grandezas e proporcionalidades:',
          type: 'paragraph'
        },
        {
          id: `s-${Date.now()}-2`,
          heading: '',
          content: 'E = m · c²  ou  ∫ f(x)dx = F(b) - F(a)',
          formula: 'E = m · c²  ou  ∫ f(x)dx = F(b) - F(a)',
          type: 'code'
        },
        {
          id: `s-${Date.now()}-3`,
          heading: '2. Condições de Aplicação',
          content: 'Verifique sempre a consistência dimensional antes de calcular.',
          type: 'paragraph'
        }
      ]
    },
    {
      id: 'active_recall',
      title: 'Resumo Ativo & Auto-Teste',
      emoji: '🧠',
      description: 'Perguntas de fixação rápida (Active Recall) para testar sua retenção sem consulta.',
      badge: 'Neurociência',
      color: '#EC4899',
      summary: `Perguntas desafiadoras de recuperação ativa para ${discipline.name}.`,
      tags: [discipline.name, 'ActiveRecall', 'Simulado', 'Fixação'],
      sections: [
        {
          id: `s-${Date.now()}-1`,
          heading: '🎯 Perguntas de Fixação Imediata',
          content: 'Tente responder mentalmente antes de checar suas anotações:',
          type: 'paragraph'
        },
        {
          id: `s-${Date.now()}-2`,
          heading: '',
          content: 'Qual é o conceito central que diferencia este fenômeno de outros semelhantes?',
          type: 'todo',
          checked: false
        },
        {
          id: `s-${Date.now()}-3`,
          heading: '',
          content: 'Como resolver uma questão típica sem cair na pegadinha mais comum?',
          type: 'todo',
          checked: false
        }
      ]
    },
    {
      id: 'exercises',
      title: 'Resolução de Exercícios',
      emoji: '📝',
      description: 'Passo a passo detalhado: identificação de dados, raciocínio e gabarito comentado.',
      badge: 'Prática',
      color: '#10B981',
      summary: `Resolução comentada de exercícios de ${discipline.name}.`,
      tags: [discipline.name, 'Exercícios', 'Gabarito', 'PassoAPasso'],
      sections: [
        {
          id: `s-${Date.now()}-1`,
          heading: 'Exercício 01 — Análise do Enunciado',
          content: 'Dados fornecidos: \n• Grandeza A: ...\n• Grandeza B: ...\nO que se pede: ...',
          type: 'paragraph'
        },
        {
          id: `s-${Date.now()}-2`,
          heading: 'Resolução Passo a Passo',
          content: '1. Aplicando a fórmula básica...\n2. Simplificando os termos...\n3. Resposta final: ...',
          type: 'paragraph'
        }
      ]
    },
    {
      id: 'lab',
      title: 'Experimento & Prática',
      emoji: '🔬',
      description: 'Hipótese, materiais, método experimental, coleta de dados e conclusões.',
      badge: 'Laboratório',
      color: '#F59E0B',
      summary: `Relatório prático e experimental de ${discipline.name}.`,
      tags: [discipline.name, 'Prática', 'Laboratório', 'Relatório'],
      sections: [
        {
          id: `s-${Date.now()}-1`,
          heading: '1. Objetivo & Hipótese',
          content: 'Investigar o comportamento de...',
          type: 'paragraph'
        },
        {
          id: `s-${Date.now()}-2`,
          heading: '2. Procedimento & Observações',
          content: 'Registros das medições e variações observadas durante o teste.',
          type: 'paragraph'
        }
      ]
    }
  ];

  const [selectedTemplate, setSelectedTemplate] = useState<DocTemplate>(TEMPLATES[1]);
  const [selectedEmoji, setSelectedEmoji] = useState(TEMPLATES[1].emoji);
  const [title, setTitle] = useState(`${discipline.name}: Fundamentos & Anotações de Aula`);
  const [summary, setSummary] = useState(TEMPLATES[1].summary);
  const [tagsInput, setTagsInput] = useState(TEMPLATES[1].tags.join(', '));
  const [isPublic, setIsPublic] = useState(true);
  const [customizing, setCustomizing] = useState(false);

  if (!isOpen) return null;

  const handleSelectTemplate = (tpl: DocTemplate) => {
    setSelectedTemplate(tpl);
    setSelectedEmoji(tpl.emoji);
    setTitle(tpl.id === 'blank' ? '' : `${discipline.name}: ${tpl.title}`);
    setSummary(tpl.summary);
    setTagsInput(tpl.tags.join(', '));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const docTitle = title.trim() || `${selectedTemplate.title}`;

    const tags = tagsInput
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    if (tags.length === 0) {
      tags.push(discipline.name, 'Anotação');
    }

    const sections = selectedTemplate.sections.map((s, idx) => ({
      ...s,
      id: `s-${Date.now()}-${idx}`
    }));

    const wordCount = (summary + ' ' + (sections[0]?.content || '')).trim().split(/\s+/).filter(Boolean).length;
    const readTime = `${Math.max(1, Math.ceil(wordCount / 100))} min`;

    const newDoc: NotebookDoc = {
      id: `doc-${Date.now()}`,
      title: `${selectedEmoji} ${docTitle}`,
      disciplineId: discipline.id,
      lastEdited: 'Agora mesmo',
      createdAt: 'Hoje',
      author: 'Você',
      tags,
      summary: summary.trim() || 'Anotações estruturadas.',
      sections,
      wordCount: Math.max(wordCount, 150),
      readTime,
      starred: false,
      isPublic,
      glossary: {}
    };

    onCreateDoc(newDoc);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden z-10 my-6 flex flex-col max-h-[90vh]"
        >
          {/* Top Line */}
          <div 
            className="h-2 w-full shrink-0" 
            style={{ 
              background: `linear-gradient(90deg, ${discipline.color}, #3B82F6, #8B5CF6)` 
            }} 
          />

          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 shrink-0">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md font-bold"
                style={{ backgroundColor: discipline.color }}
              >
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white font-display flex items-center gap-2">
                  Novo Documento
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    {discipline.name}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Escolha um modelo inteligente ou crie um documento em branco
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* 1. SELEÇÃO DE MODELOS (CARTÕES INTELIGENTES RESTAURADOS) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Modelos de Documento
                </label>
                <span className="text-[11px] text-slate-400">
                  {TEMPLATES.length} modelos disponíveis
                </span>
              </div>

              {/* Grid de Cartões de Modelos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {TEMPLATES.map((tpl) => {
                  const isSelected = selectedTemplate.id === tpl.id;
                  return (
                    <motion.div
                      key={tpl.id}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectTemplate(tpl)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                        isSelected
                          ? 'bg-blue-50/90 dark:bg-blue-950/70 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                          : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl p-1.5 bg-white dark:bg-slate-700 rounded-xl border border-slate-200/60 dark:border-slate-600 shadow-2xs">
                            {tpl.emoji}
                          </span>
                          <span 
                            className="text-[9px] font-extrabold px-2 py-0.5 rounded-full"
                            style={{ 
                              backgroundColor: `${tpl.color}20`,
                              color: tpl.color 
                            }}
                          >
                            {tpl.badge}
                          </span>
                        </div>

                        <div>
                          <h4 className={`text-xs font-bold font-display ${isSelected ? 'text-blue-950 dark:text-blue-100' : 'text-slate-800 dark:text-slate-200'}`}>
                            {tpl.title}
                          </h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {tpl.description}
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="mt-3 pt-2 border-t border-blue-200/60 dark:border-blue-800/60 flex items-center justify-between text-[10px] font-bold text-blue-600 dark:text-blue-300">
                          <span>Modelo Selecionado</span>
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* 2. DETALHES DO DOCUMENTO */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Personalizar Informações
                </span>
                
                {/* Emojis Rápidos */}
                <div className="flex items-center gap-1">
                  {EMOJI_PRESETS.slice(0, 6).map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`w-7 h-7 rounded-lg text-xs transition-all cursor-pointer ${
                        selectedEmoji === emoji
                          ? 'bg-blue-600 text-white shadow-xs scale-110'
                          : 'bg-white dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Título */}
              <div className="flex items-center gap-2">
                <span className="text-xl p-2 bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 shrink-0">
                  {selectedEmoji}
                </span>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título do Documento..."
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                />
              </div>

              {/* Resumo */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Resumo / Foco da Sessão
                </label>
                <input
                  type="text"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Ex: Anotações com definições, axiomas e resolução de exercícios..."
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* Tags & Visibilidade em 2 colunas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-slate-400" />
                    Tags
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="Ex: Teoria, ENEM, Revisão"
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Privacidade Inicial
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsPublic(true)}
                      className={`flex-1 py-1.5 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isPublic
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Público</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPublic(false)}
                      className={`flex-1 py-1.5 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        !isPublic
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Privado</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Criar Documento</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
