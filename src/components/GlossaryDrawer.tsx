import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  BookMarked,
  Plus,
  Search,
  BookOpen,
  Edit3,
  Trash2,
  Copy,
  Check,
  Brain,
  Download,
  Highlighter,
} from 'lucide-react';
import { Discipline, NotebookDoc, GlossaryDefinition } from '../data/disciplinesData';
import { getCategoryColor, stripAccents, GLOBAL_GLOSSARY } from '../lib/glossary';
import { LatexRenderer } from './LatexRenderer';

export interface GlossaryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentDoc?: NotebookDoc | null;
  discipline?: Discipline | null;
  glossary?: Record<string, GlossaryDefinition>;
  onNewTerm?: () => void;
  onAddTermClick?: (term?: string) => void;
  onEditTerm?: ((term: string) => void) | ((def: GlossaryDefinition) => void);
  onDeleteTerm?: (term: string) => void;
  onJumpToOccurrence?: (term: string) => void;
  docText?: string;
  onStartStudy?: (terms?: GlossaryDefinition[]) => void;
  initialFilterTerm?: string;
  highlightsEnabled?: boolean;
  onToggleHighlights?: () => void;
}

export const GlossaryDrawer: React.FC<GlossaryDrawerProps> = ({
  isOpen,
  onClose,
  currentDoc,
  discipline,
  glossary,
  onNewTerm,
  onAddTermClick,
  onEditTerm,
  onDeleteTerm,
  onJumpToOccurrence,
  docText: providedDocText,
  onStartStudy,
  initialFilterTerm = '',
  highlightsEnabled,
  onToggleHighlights,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialFilterTerm);
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);
  const [copiedTerm, setCopiedTerm] = useState<string | null>(null);

  // Calcula o texto do documento se não for fornecido explicitamente
  const docText = useMemo(() => {
    if (providedDocText !== undefined) return providedDocText;
    if (!currentDoc || !currentDoc.sections) return '';
    return currentDoc.sections.map((s) => s.content || '').join('\n');
  }, [providedDocText, currentDoc]);

  // Fusão segura de todas as fontes de glossário disponíveis
  const mergedGlossary = useMemo(() => {
    const map: Record<string, GlossaryDefinition> = {};

    // 1. Termos globais integrados
    if (GLOBAL_GLOSSARY && typeof GLOBAL_GLOSSARY === 'object') {
      for (const [key, def] of Object.entries(GLOBAL_GLOSSARY)) {
        if (def) {
          const canonical = (def.term || key).trim();
          if (canonical) {
            map[canonical.toLowerCase()] = {
              ...def,
              term: canonical,
              isCustom: false,
            };
          }
        }
      }
    }

    // 2. Termos dos documentos da disciplina
    if (discipline && Array.isArray(discipline.documents)) {
      for (const doc of discipline.documents) {
        if (doc && doc.glossary && typeof doc.glossary === 'object') {
          for (const [key, def] of Object.entries(doc.glossary)) {
            if (def) {
              const canonical = (def.term || key).trim();
              if (canonical) {
                map[canonical.toLowerCase()] = {
                  ...def,
                  term: canonical,
                  isCustom: true,
                };
              }
            }
          }
        }
      }
    }

    // 3. Termos do documento atual
    if (currentDoc && currentDoc.glossary && typeof currentDoc.glossary === 'object') {
      for (const [key, def] of Object.entries(currentDoc.glossary)) {
        if (def) {
          const canonical = (def.term || key).trim();
          if (canonical) {
            map[canonical.toLowerCase()] = {
              ...def,
              term: canonical,
              isCustom: true,
            };
          }
        }
      }
    }

    // 4. Glossário passado diretamente como prop
    if (glossary && typeof glossary === 'object') {
      for (const [key, def] of Object.entries(glossary)) {
        if (def) {
          const canonical = (def.term || key).trim();
          if (canonical) {
            map[canonical.toLowerCase()] = {
              ...def,
              term: canonical,
            };
          }
        }
      }
    }

    return map;
  }, [glossary, currentDoc, discipline]);

  // Lista única de termos normalizados
  const termList = useMemo(() => {
    const map = new Map<string, GlossaryDefinition>();
    for (const [key, def] of Object.entries(mergedGlossary)) {
      if (!def) continue;
      const canonical = (def.term || key).trim();
      if (!canonical) continue;
      const lower = canonical.toLowerCase();
      if (!map.has(lower)) {
        map.set(lower, def);
      }
    }
    return Array.from(map.values());
  }, [mergedGlossary]);

  // Contagem de ocorrências de cada termo no texto do documento
  const occurrencesMap = useMemo(() => {
    const counts: Record<string, number> = {};
    if (!docText) return counts;

    for (const item of termList) {
      const candidates = [item.term, ...(item.aliases || [])].filter(Boolean);
      let count = 0;
      for (const cand of candidates) {
        try {
          const escaped = cand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`\\b${escaped}\\b`, 'giu');
          const matches = docText.match(regex);
          if (matches) count += matches.length;
        } catch {
          // ignore regex errors
        }
      }
      counts[item.term.toLowerCase()] = count;
    }
    return counts;
  }, [termList, docText]);

  // Filtragem simples e direta por busca textual
  const filteredTerms = useMemo(() => {
    const query = searchQuery.trim();
    if (!query) {
      return [...termList].sort((a, b) => a.term.localeCompare(b.term, 'pt-BR'));
    }
    const queryNorm = stripAccents(query);
    return termList
      .filter((item) => {
        const termNorm = stripAccents(item.term);
        const defNorm = stripAccents(item.definition || '');
        return termNorm.includes(queryNorm) || defNorm.includes(queryNorm);
      })
      .sort((a, b) => a.term.localeCompare(b.term, 'pt-BR'));
  }, [termList, searchQuery]);

  const handleOpenNewTerm = (term?: string) => {
    if (onAddTermClick) {
      onAddTermClick(term || '');
    } else if (onNewTerm) {
      onNewTerm();
    }
  };

  const handleOpenEditTerm = (item: GlossaryDefinition | string) => {
    const termKey = typeof item === 'string' ? item : item.term;
    const defObj = typeof item === 'object' ? item : mergedGlossary[item.toLowerCase()] || { term: item, definition: '' };
    if (onEditTerm) {
      (onEditTerm as any)(defObj);
    } else if (onAddTermClick) {
      onAddTermClick(termKey);
    }
  };

  const handleDelete = (term: string) => {
    if (onDeleteTerm) {
      onDeleteTerm(term);
    }
  };

  // Exportar glossário para JSON ou Markdown
  const handleExport = (format: 'json' | 'md') => {
    const isJson = format === 'json';
    const content = isJson
      ? JSON.stringify(filteredTerms, null, 2)
      : `# Glossário de Estudos\n\n` +
        filteredTerms
          .map(
            (t) =>
              `### ${t.term}${t.category ? ` *(${t.category})*` : ''}\n\n${
                t.definition || 'Sem definição.'
              }${t.example ? `\n\n> **Exemplo:** ${t.example}` : ''}\n`,
          )
          .join('\n---\n\n');
    const mime = isJson ? 'application/json' : 'text/markdown';
    const filename = `glossario-${Date.now()}.${isJson ? 'json' : 'md'}`;

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyDef = (item: GlossaryDefinition) => {
    const text = `${item.term}${item.category ? ` (${item.category})` : ''}: ${item.definition || ''}`;
    navigator.clipboard.writeText(text);
    setCopiedTerm(item.term);
    setTimeout(() => setCopiedTerm(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[90000] flex justify-end">
        {/* Scrim no mobile / click outside */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs"
        />

        {/* Drawer Lateral (~400px desktop, full width mobile) */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative w-full sm:w-[420px] h-full bg-white dark:bg-[#18181B] border-l border-[#E7E2D9] dark:border-[#2C2C30] shadow-2xl z-10 flex flex-col overflow-hidden text-[#1C1917] dark:text-[#FAF9F5]"
        >
          {/* Topo do Drawer */}
          <div className="p-5 border-b border-[#E7E2D9] dark:border-[#2C2C30] bg-[#FAF8F5] dark:bg-[#15221B]/40 shrink-0">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#2D5A46] text-white flex items-center justify-center shadow-xs">
                  <BookMarked className="w-4 h-4 text-emerald-100" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-[#1C1917] dark:text-[#FAF9F5]">
                    Glossário
                  </h3>
                  <p className="text-[11px] text-[#78716C] dark:text-[#A8A29E]">
                    {filteredTerms.length} {filteredTerms.length === 1 ? 'termo' : 'termos'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {onToggleHighlights && (
                  <button
                    type="button"
                    onClick={onToggleHighlights}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      highlightsEnabled
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                        : 'bg-white dark:bg-[#18181B] border-[#E7E2D9] dark:border-[#2C2C30] text-slate-500 hover:text-slate-800'
                    }`}
                    title={highlightsEnabled ? 'Desativar grifos no texto' : 'Ativar grifos no texto'}
                  >
                    <Highlighter className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{highlightsEnabled ? 'Grifos Ativos' : 'Grifos'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleOpenNewTerm()}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#2D5A46] hover:bg-[#21483A] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Novo termo</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Campo de Busca Limpo */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#A8A29E] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar conceito ou definição..."
                className="w-full pl-8.5 pr-8 py-2 bg-white dark:bg-[#18181B] border border-[#E7E2D9] dark:border-[#2C2C30] rounded-xl text-xs text-[#1C1917] dark:text-[#FAF9F5] placeholder-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#2D5A46]/30 focus:border-[#2D5A46]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Lista de Termos Compactos com Expansão */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {filteredTerms.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#EBF3EF] dark:bg-[#15221B] text-[#2D5A46] dark:text-[#52B788] flex items-center justify-center mx-auto">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-display font-bold text-sm text-[#1C1917] dark:text-[#FAF9F5]">
                    Nenhum termo encontrado
                  </h4>
                  <p className="text-xs text-[#78716C] dark:text-[#A8A29E] max-w-xs mx-auto">
                    Selecione uma palavra no texto e escolha "Adicionar ao glossário" ou crie um verbete manual.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenNewTerm()}
                  className="px-4 py-2 rounded-xl bg-[#2D5A46] text-white text-xs font-bold shadow-xs hover:bg-[#21483A] transition-colors cursor-pointer"
                >
                  Criar primeiro termo
                </button>
              </div>
            ) : (
              filteredTerms.map((item) => {
                const isExpanded = expandedTerm === item.term;
                const occCount = occurrencesMap[item.term.toLowerCase()] || 0;
                const catColor = getCategoryColor(item.category);

                return (
                  <div
                    key={item.term}
                    className="p-3.5 rounded-2xl bg-white dark:bg-[#1E1E22] border border-[#E7E2D9] dark:border-[#2C2C30] hover:border-[#2D5A46]/40 dark:hover:border-[#52B788]/40 transition-all shadow-2xs group"
                  >
                    {/* Linha Principal */}
                    <div
                      className="cursor-pointer"
                      onClick={() => setExpandedTerm(isExpanded ? null : item.term)}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-display font-bold text-sm text-[#1C1917] dark:text-[#FAF9F5]">
                            {item.term}
                          </h4>

                          {item.category && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${catColor.bgLight} ${catColor.textLight} ${catColor.borderLight} ${catColor.bgDark} ${catColor.textDark} ${catColor.borderDark}`}
                            >
                              {item.category}
                            </span>
                          )}

                          {item.isCustom ? (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#EBF3EF] dark:bg-[#15221B] text-[#2D5A46] dark:text-[#52B788]">
                              Seu
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                              Global
                            </span>
                          )}
                        </div>

                        {/* Contador de Ocorrências no Texto */}
                        <div>
                          {occCount > 0 ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onJumpToOccurrence) onJumpToOccurrence(item.term);
                              }}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 transition-colors cursor-pointer"
                              title="Pular para a próxima ocorrência no texto"
                            >
                              {occCount}× no texto
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">
                              fora do texto
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Definição curta em 2 linhas */}
                      {item.definition && (
                        <p className="text-xs text-[#57534E] dark:text-[#D6D3CD] line-clamp-2 leading-relaxed font-normal">
                          {item.definition}
                        </p>
                      )}
                    </div>

                    {/* Ações Compactas no Hover/Foco */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditTerm(item)}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Editar termo"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyDef(item)}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Copiar definição"
                        >
                          {copiedTerm === item.term ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        {item.isCustom && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Excluir o termo "${item.term}"?`)) {
                                handleDelete(item.term);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-950 transition-colors cursor-pointer"
                            title="Excluir termo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setExpandedTerm(isExpanded ? null : item.term)}
                        className="text-[11px] font-semibold text-[#2D5A46] dark:text-[#52B788] hover:underline cursor-pointer"
                      >
                        {isExpanded ? 'Recolher' : 'Ver detalhes'}
                      </button>
                    </div>

                    {/* Conteúdo Expandido */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-[#E7E2D9] dark:border-[#2C2C30] space-y-2.5 text-xs animate-in fade-in duration-150">
                        {item.definition && (
                          <div className="leading-relaxed">
                            <LatexRenderer content={item.definition} />
                          </div>
                        )}

                        {item.example && (
                          <div className="p-2.5 rounded-xl bg-[#EBF3EF] dark:bg-[#15221B]/60 border border-[#CFE1D6] dark:border-[#22392D] text-[11px] text-[#2D5A46] dark:text-[#A7D7C5]">
                            <strong className="font-semibold mr-1">Exemplo:</strong>
                            <LatexRenderer content={item.example} />
                          </div>
                        )}

                        {item.imageUrl && (
                          <div className="rounded-xl overflow-hidden border border-[#E7E2D9] dark:border-[#3B3B40] max-h-32 bg-[#F5F1EA] dark:bg-[#242426]">
                            <img
                              src={item.imageUrl}
                              alt={item.term}
                              loading="lazy"
                              referrerPolicy="no-referrer"
                              className="w-full h-28 object-contain"
                              onError={(e) => {
                                (e.currentTarget.parentElement as HTMLElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}

                        {item.aliases && item.aliases.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap text-[10px] text-slate-500">
                            <span>Variações:</span>
                            {item.aliases.map((al, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono"
                              >
                                {al}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Rodapé Fixo: Estudar termos (Flashcards) + Exportar */}
          <div className="p-4 border-t border-[#E7E2D9] dark:border-[#2C2C30] bg-[#FAF8F5] dark:bg-[#15221B]/40 flex items-center justify-between gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (onStartStudy) onStartStudy(filteredTerms);
              }}
              disabled={filteredTerms.length === 0}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#2D5A46] hover:bg-[#21483A] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Brain className="w-4 h-4 text-emerald-100" />
              <span>Estudar termos</span>
            </button>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleExport('md')}
                className="p-2 rounded-xl border border-[#E7E2D9] dark:border-[#2C2C30] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs transition-colors cursor-pointer"
                title="Exportar como Markdown"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
