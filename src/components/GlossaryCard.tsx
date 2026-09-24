import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookMarked,
  Lightbulb,
  Edit3,
  Copy,
  Check,
  X,
  ArrowLeft,
  BookOpen,
  Maximize2,
  Users,
  Globe,
  FileText,
} from 'lucide-react';
import { GlossaryDefinition } from '../data/disciplinesData';
import { getCategoryColor } from '../lib/glossary';
import { LatexRenderer } from './LatexRenderer';

export interface GlossaryCardProps {
  definition: GlossaryDefinition;
  isPinned?: boolean;
  onClose?: () => void;
  onEdit?: (term: string) => void;
  onViewInGlossary?: (term: string) => void;
  onNavigateTerm?: (term: string) => void;
  onBack?: () => void;
  historyCount?: number;
  glossaryMap?: Record<string, GlossaryDefinition>;
  isSheet?: boolean; // Para versão bottom sheet em telas estreitas
  onCustomizeGlobal?: (def: GlossaryDefinition) => void;
  onShareWithGroup?: (term: string, scope: 'document' | 'group' | 'global') => void;
}

export const GlossaryCard: React.FC<GlossaryCardProps> = ({
  definition,
  isPinned: _isPinned = false,
  onClose,
  onEdit,
  onViewInGlossary,
  onNavigateTerm,
  onBack,
  historyCount = 0,
  glossaryMap,
  isSheet = false,
  onCustomizeGlobal: _onCustomizeGlobal,
}) => {
  const [copied, setCopied] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const categoryColor = getCategoryColor(definition.category);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = `${definition.term}${definition.category ? ` (${definition.category})` : ''}:\n${
      definition.definition || ''
    }${definition.example ? `\n\nExemplo: ${definition.example}` : ''}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentScope = definition.scope || (definition.isCustom ? 'document' : 'global');

  return (
    <>
      <div
        className={`flex flex-col text-left ${
          isSheet
            ? 'w-full max-w-lg mx-auto p-5 pb-8'
            : 'w-[23rem] max-w-[calc(100vw-2rem)] p-4.5'
        } bg-white/95 dark:bg-[#18181B]/95 backdrop-blur-xl rounded-2xl border border-[#E7E2D9] dark:border-[#2C2C30] shadow-2xl text-[#1C1917] dark:text-[#FAF9F5] select-text`}
      >
        {/* Barra superior: Categoria + Selo de Escopo + Fechar */}
        <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-[#E7E2D9] dark:border-[#2C2C30]">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            {historyCount > 0 && onBack && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onBack();
                }}
                className="p-1 -ml-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer flex items-center gap-1 text-xs font-medium"
                title="Voltar ao termo anterior"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar</span>
              </button>
            )}

            {definition.category && (
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${categoryColor.bgLight} ${categoryColor.textLight} ${categoryColor.borderLight} ${categoryColor.bgDark} ${categoryColor.textDark} ${categoryColor.borderDark} shrink-0`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: categoryColor.dot }}
                />
                {definition.category}
              </span>
            )}

            {/* Selo de Escopo / Compartilhamento */}
            {currentScope === 'group' ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
                <Users className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                Grupo
              </span>
            ) : currentScope === 'global' ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                <Globe className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                Geral
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EBF3EF] dark:bg-[#15221B] text-[#2D5A46] dark:text-[#52B788] border border-[#CFE1D6] dark:border-[#22392D]">
                <FileText className="w-3 h-3 text-[#2D5A46] dark:text-[#52B788]" />
                Caderno
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {onClose && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="w-6 h-6 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                title="Fechar (Esc)"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Título do Termo com ícone BookMarked */}
        <div className="flex items-start gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2D5A46] to-[#224A38] text-white flex items-center justify-center shadow-md shadow-[#2D5A46]/20 shrink-0 mt-0.5">
            <BookMarked className="w-4 h-4 text-emerald-100" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display font-bold text-[19px] text-[#1C1917] dark:text-[#FAF9F5] leading-tight break-words">
              {definition.term}
            </h3>
            {definition.aliases && definition.aliases.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                <span>Aliases:</span>
                {definition.aliases.map((al, idx) => (
                  <span
                    key={idx}
                    className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono"
                  >
                    {al}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Imagem (se houver e não deu erro) - max-h 140px, clicável para Lightbox */}
        {definition.imageUrl && !imageError && (
          <div className="relative group my-2 rounded-xl overflow-hidden border border-[#E7E2D9] dark:border-[#3B3B40] bg-[#F5F1EA] dark:bg-[#242426]/70 shadow-xs">
            <img
              src={definition.imageUrl}
              alt={definition.term}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="w-full max-h-[140px] object-contain mx-auto cursor-zoom-in transition-transform duration-200 group-hover:scale-[1.02]"
              onClick={(e) => {
                e.stopPropagation();
                setIsLightboxOpen(true);
              }}
              onError={() => setImageError(true)}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsLightboxOpen(true);
              }}
              className="absolute bottom-1.5 right-1.5 p-1 rounded-md bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              title="Ampliar imagem"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Definição com suporte a formatação, parágrafos, negrito, KaTeX \( ... \) */}
        {definition.definition && (
          <div className="text-[13.5px] text-[#3A3632] dark:text-[#E7E5E4] leading-relaxed font-normal my-1 break-words">
            <LatexRenderer
              content={definition.definition}
              glossaryTerms={glossaryMap}
              onTermClick={onNavigateTerm}
            />
          </div>
        )}

        {/* Bloco de Exemplo destacado */}
        {definition.example && (
          <div className="mt-2.5 p-2.5 rounded-xl bg-[#EBF3EF] dark:bg-[#15221B]/60 border border-[#CFE1D6] dark:border-[#22392D] text-[12px] text-[#2D5A46] dark:text-[#A7D7C5] flex items-start gap-2 break-words">
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1 leading-snug">
              <strong className="font-semibold mr-1 text-[#1F4333] dark:text-[#C4E5D8]">
                Exemplo:
              </strong>
              <LatexRenderer
                content={definition.example}
                glossaryTerms={glossaryMap}
                onTermClick={onNavigateTerm}
              />
            </div>
          </div>
        )}

        {/* Rodapé com Ações: Editar, Compartilhar com Grupo, Copiar */}
        <div className="mt-3 pt-2.5 border-t border-[#E7E2D9] dark:border-[#2C2C30] flex items-center justify-between gap-1 text-xs">
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(definition.term);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-colors cursor-pointer"
                title="Editar este termo ou mudar formatação"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#2D5A46] dark:text-[#52B788]" />
                <span>Editar</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors cursor-pointer"
              title="Copiar definição"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>

          {onViewInGlossary && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onViewInGlossary(definition.term);
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[#2D5A46] dark:text-[#52B788] hover:bg-[#EBF3EF] dark:hover:bg-[#15221B] font-semibold transition-colors cursor-pointer"
              title="Abrir no painel lateral do glossário"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Glossário</span>
            </button>
          )}
        </div>
      </div>

      {/* Lightbox para ampliação de imagem */}
      <AnimatePresence>
        {isLightboxOpen && definition.imageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              e.stopPropagation();
              setIsLightboxOpen(false);
            }}
            className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          >
            <div
              className="relative max-w-3xl max-h-[90vh] bg-white dark:bg-[#18181B] rounded-2xl overflow-hidden shadow-2xl p-2 border border-slate-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-sm text-slate-800 dark:text-slate-100">
                    {definition.term}
                  </span>
                  {definition.category && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {definition.category}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(false)}
                  className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-2 flex items-center justify-center bg-[#FAF8F5] dark:bg-[#121214] rounded-xl my-2 max-h-[75vh] overflow-hidden">
                <img
                  src={definition.imageUrl}
                  alt={definition.term}
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
