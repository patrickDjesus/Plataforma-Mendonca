import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  BookMarked,
  Check,
  Lightbulb,
  Link as LinkIcon,
  Sparkles,
  Trash2,
  AlertCircle,
  Loader2,
  Info,
  BookOpen,
} from 'lucide-react';
import { GlossaryDefinition } from '../data/disciplinesData';
import { isValidImageUrl } from '../lib/glossary';
import { LatexRenderer } from './LatexRenderer';

interface AddGlossaryTermModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTerm?: string;
  initialDefinition?: GlossaryDefinition | null;
  onSaveTerm?: (definition: GlossaryDefinition, scope?: 'document' | 'group' | 'global') => void;
  onAddTerm?: (term: string, definition: GlossaryDefinition, oldTermKey?: string, scope?: 'document' | 'group' | 'global') => void;
  onDeleteTerm?: (term: string, scope?: 'document' | 'group' | 'global') => void;
  existingCategories?: string[];
  docContextText?: string;
}

export const AddGlossaryTermModal: React.FC<AddGlossaryTermModalProps> = ({
  isOpen,
  onClose,
  initialTerm = '',
  initialDefinition,
  onSaveTerm,
  onAddTerm,
  onDeleteTerm,
  docContextText = '',
}) => {
  const [term, setTerm] = useState(initialTerm);
  const [definition, setDefinition] = useState('');
  const [example, setExample] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [oldKey, setOldKey] = useState<string | null>(null);

  // Estados de validação de imagem
  const [imageErrorMsg, setImageErrorMsg] = useState<string | null>(null);
  const [imageValid, setImageValid] = useState<boolean>(false);
  const [imageLoading, setImageLoading] = useState<boolean>(false);

  // Estados de IA
  const [aiLoading, setAiLoading] = useState(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  // Padrão do sistema: sempre salvar no escopo do grupo e categoria 'Conceito'
  const scope = 'group';
  const category = 'Conceito';

  // Sincronização ao abrir o modal
  useEffect(() => {
    if (isOpen) {
      const t = initialTerm.trim();
      setTerm(t);
      if (initialDefinition) {
        setOldKey(initialDefinition.term || t || null);
        setDefinition(initialDefinition.definition || '');
        setExample(initialDefinition.example || '');
        setImageUrl(initialDefinition.imageUrl || '');
      } else {
        setOldKey(t || null);
        setDefinition('');
        setExample('');
        setImageUrl('');
      }
      setImageErrorMsg(null);
      setImageValid(false);
      setAiNotice(null);
    }
  }, [isOpen, initialTerm, initialDefinition]);

  // Validação estrita de imagem HTTPS
  useEffect(() => {
    const trimmed = imageUrl.trim();
    if (!trimmed) {
      setImageErrorMsg(null);
      setImageValid(false);
      setImageLoading(false);
      return;
    }

    if (!isValidImageUrl(trimmed)) {
      setImageErrorMsg(
        'A URL deve começar com https://, ter no máximo 2048 caracteres e não ser data:/blob:.',
      );
      setImageValid(false);
      setImageLoading(false);
      return;
    }

    setImageLoading(true);
    setImageErrorMsg(null);
    const testImg = new Image();
    testImg.referrerPolicy = 'no-referrer';
    testImg.onload = () => {
      setImageLoading(false);
      setImageValid(true);
      setImageErrorMsg(null);
    };
    testImg.onerror = () => {
      setImageLoading(false);
      setImageValid(false);
      setImageErrorMsg(
        'Não foi possível carregar essa imagem. Use um link direto para o arquivo (.png, .jpg, .svg…)',
      );
    };
    testImg.src = trimmed;
  }, [imageUrl]);

  const isImageEntered = imageUrl.trim().length > 0;
  const isImageAcceptable = !isImageEntered || imageValid;
  const canSubmit =
    term.trim().length > 0 &&
    (definition.trim().length > 0 || (isImageEntered && imageValid)) &&
    isImageAcceptable;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!canSubmit) return;

    const trimmedTerm = term.trim();
    const finalDefinition: GlossaryDefinition = {
      term: trimmedTerm,
      definition: definition.trim() || undefined,
      example: example.trim() || undefined,
      category,
      imageUrl: isImageEntered && imageValid ? imageUrl.trim() : undefined,
      scope,
      isCustom: true,
      updatedAt: Date.now(),
    };

    if (onAddTerm) {
      onAddTerm(trimmedTerm, finalDefinition, oldKey || undefined, scope);
    } else if (onSaveTerm) {
      onSaveTerm(finalDefinition, scope);
    }

    onClose();
  };

  // Atalhos de teclado: Ctrl/Cmd + Enter salva, Esc fecha
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, canSubmit, term, definition, example, imageUrl]);

  // Sugestão via IA
  const handleSuggestWithAi = async () => {
    if (!term.trim()) return;
    setAiLoading(true);
    setAiNotice(null);

    try {
      const { chatWithGroq } = await import('../services/ai');
      const prompt = `Defina de forma concisa e acadêmica o termo "${term.trim()}" para alunos de Ensino Médio/Vestibular no Brasil.
Contexto do documento onde aparece: "${docContextText.slice(0, 500)}".

Responda em formato JSON estrito:
{
  "definition": "definição clara de 1 ou 2 frases (você pode usar fórmulas matemáticas no formato \\( ... \\) se for cálculo/física)",
  "example": "um exemplo prático ou aplicação direta simples"
}`;

      const res = await chatWithGroq(
        [{ role: 'user', content: prompt }],
        'Você é um especialista pedagógico que gera definições concisas e precisas para glossário de estudo. Retorne apenas JSON sem markdown adicional.',
      );

      if (res) {
        const cleaned = res.replace(/```(?:json)?/gi, '').trim();
        const parsed = JSON.parse(cleaned);
        if (parsed.definition) setDefinition(parsed.definition);
        if (parsed.example) setExample(parsed.example);
        setAiNotice('Sugestão gerada pela IA a partir do texto do seu documento. Revise antes de salvar.');
      } else {
        setAiNotice('Não foi possível gerar a sugestão agora. Preencha manualmente.');
      }
    } catch {
      setAiNotice('Erro ao contatar IA. Preencha a definição manualmente.');
    } finally {
      setAiLoading(false);
    }
  };

  if (!isOpen) return null;

  const isEditing = Boolean(initialDefinition || (oldKey && oldKey.trim()));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Scrim / Backdrop com foco suave */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#141210]/75 backdrop-blur-md"
        />

        {/* Modal com Identidade Visual Tátil e Assinatura Mendonça */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="relative w-full max-w-4xl bg-[#FAF8F5] dark:bg-[#141416] rounded-[28px] shadow-2xl border border-[#E6E1D7] dark:border-[#27272A] overflow-hidden z-10 my-auto flex flex-col max-h-[92vh]"
        >
          {/* Header Superior */}
          <div className="flex items-center justify-between px-7 py-5 border-b border-[#E8E3D8] dark:border-[#242428] bg-white/80 dark:bg-[#1A1A1E]/80 backdrop-blur-sm shrink-0">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2D5A46] to-[#1E3E30] text-white flex items-center justify-center shadow-md shadow-[#2D5A46]/20 ring-1 ring-emerald-400/20">
                <BookMarked className="w-5 h-5 text-emerald-100" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-extrabold text-lg text-[#1C1917] dark:text-[#FAF9F5] tracking-tight">
                    {isEditing ? 'Editar Conceito' : 'Novo Conceito'}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF3EF] dark:bg-[#1A2D23] text-[#2D5A46] dark:text-[#52B788] border border-[#CFE1D6] dark:border-[#22392D] uppercase tracking-wider">
                    Grupo
                  </span>
                </div>
                <p className="text-xs text-[#8C827A] dark:text-[#9A938C] font-medium mt-0.5">
                  Salvo automaticamente para todos os cadernos deste grupo.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl hover:bg-[#EFECE6] dark:hover:bg-[#232326] text-[#A8A29E] hover:text-[#3C3836] dark:hover:text-[#FAF9F5] flex items-center justify-center transition-colors cursor-pointer"
              title="Fechar (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Grid Principal: 2 Colunas (Campos + Cartão de Pré-visualização) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto flex-1 divide-y lg:divide-y-0 lg:divide-x divide-[#E8E3D8] dark:divide-[#242428]">
            {/* Coluna Esquerda: Formulário de Campos Limpos (7 colunas) */}
            <form onSubmit={handleSubmit} className="lg:col-span-7 p-7 space-y-5 bg-white dark:bg-[#161618]">
              {/* Campo: Termo */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-[#2D5A46] dark:text-[#52B788] mb-1.5">
                  Conceito ou Termo <span className="text-emerald-700 dark:text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="Ex: Derivada, Entropia, Mitose..."
                  className="w-full bg-[#F5F2EC] dark:bg-[#202024] rounded-2xl px-4 py-3 text-sm font-bold text-[#1C1917] dark:text-[#FAF9F5] placeholder-[#A8A29E] focus:bg-white dark:focus:bg-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#2D5A46] transition-all shadow-inner-xs"
                />
              </div>

              {/* Campo: Definição Conceitual + Sugestão com IA */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-[#2D5A46] dark:text-[#52B788]">
                    Definição Conceitual <span className="text-emerald-700 dark:text-emerald-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleSuggestWithAi}
                    disabled={!term.trim() || aiLoading}
                    className="flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/50 px-2.5 py-1 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {aiLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
                        <span>Gerando...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        <span>Sugerir com IA</span>
                      </>
                    )}
                  </button>
                </div>

                {aiNotice && (
                  <div className="mb-2.5 p-3 rounded-2xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/60 text-xs text-purple-900 dark:text-purple-200 flex items-start gap-2">
                    <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span className="flex-1 leading-relaxed">{aiNotice}</span>
                    <button
                      type="button"
                      onClick={() => setAiNotice(null)}
                      className="text-purple-500 hover:text-purple-800 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <textarea
                  rows={3}
                  value={definition}
                  onChange={(e) => {
                    setDefinition(e.target.value);
                    if (aiNotice) setAiNotice(null);
                  }}
                  placeholder="Explique o significado com clareza. Suporta fórmulas LaTeX como \( f'(x) \)."
                  className="w-full bg-[#F5F2EC] dark:bg-[#202024] rounded-2xl p-4 text-xs font-medium text-[#1C1917] dark:text-[#FAF9F5] placeholder-[#A8A29E] focus:bg-white dark:focus:bg-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#2D5A46] transition-all resize-none leading-relaxed"
                />
                <p className="text-[11px] font-medium text-[#8C827A] dark:text-[#9A938C] mt-1">
                  Dica: use <code className="font-mono bg-[#EFECE6] dark:bg-[#27272A] px-1.5 py-0.5 rounded text-[#2D5A46] dark:text-[#52B788]">\( x^2 \)</code> para fórmulas matemáticas.
                </p>
              </div>

              {/* Campo: Exemplo Prático */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-[#2D5A46] dark:text-[#52B788] mb-1.5 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  Exemplo Prático (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={example}
                  onChange={(e) => setExample(e.target.value)}
                  placeholder="Ex: A velocidade do velocímetro em um exato instante."
                  className="w-full bg-[#F5F2EC] dark:bg-[#202024] rounded-2xl p-3.5 text-xs font-medium text-[#1C1917] dark:text-[#FAF9F5] placeholder-[#A8A29E] focus:bg-white dark:focus:bg-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#2D5A46] transition-all resize-none leading-relaxed"
                />
              </div>

              {/* Campo: Link da Imagem */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-[#2D5A46] dark:text-[#52B788] mb-1.5 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-[#2D5A46]" />
                  Link da Imagem (Opcional)
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://exemplo.com/diagrama.png"
                  className={`w-full bg-[#F5F2EC] dark:bg-[#202024] rounded-2xl px-4 py-2.5 text-xs font-medium text-[#1C1917] dark:text-[#FAF9F5] placeholder-[#A8A29E] focus:bg-white dark:focus:bg-[#18181B] focus:outline-none focus:ring-2 ${
                    imageErrorMsg
                      ? 'focus:ring-red-500'
                      : 'focus:ring-[#2D5A46]'
                  } transition-all`}
                />

                {imageLoading && (
                  <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 mt-1.5 flex items-center gap-1">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Validando imagem...</span>
                  </p>
                )}

                {imageErrorMsg && (
                  <p className="text-[11px] font-semibold text-red-600 dark:text-red-400 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{imageErrorMsg}</span>
                  </p>
                )}

                {imageValid && !imageErrorMsg && (
                  <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Link da imagem validado com sucesso.</span>
                  </p>
                )}
              </div>
            </form>

            {/* Coluna Direita: Painel Integrado de Pré-visualização com Identidade Mendonça (5 colunas) */}
            <div className="lg:col-span-5 p-7 bg-[#FAF8F5] dark:bg-[#121214] flex flex-col justify-between relative overflow-hidden">
              {/* Faixa / Acento de Assinatura Decorativo */}
              <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-[#2D5A46]/15 via-emerald-500/5 to-transparent rounded-bl-full pointer-events-none" />

              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#2D5A46] animate-ping" />
                    <span className="font-display font-extrabold text-[11px] uppercase tracking-widest text-[#2D5A46] dark:text-[#52B788]">
                      Cartão do Conceito
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-[#8C827A] dark:text-[#9A938C]">
                    Prévia ao vivo
                  </span>
                </div>

                {/* Cartão de Estudo Tátil Integrado */}
                <div className="relative bg-[#FFFDF9] dark:bg-[#1A1A1E] rounded-3xl p-6 shadow-xl border border-[#EBE6DD] dark:border-[#2C2C32] overflow-hidden group">
                  {/* Fita lateral verde de assinatura */}
                  <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-[#2D5A46] via-[#386F58] to-[#224838]" />

                  {/* Header do Cartão */}
                  <div className="flex items-start justify-between gap-3 mb-3 pl-2">
                    <div className="min-w-0 flex-1">
                      <span className="inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-[#EBF3EF] dark:bg-[#15221B] text-[#2D5A46] dark:text-[#52B788] border border-[#CFE1D6] dark:border-[#22392D] uppercase tracking-wider mb-1.5">
                        Conceito
                      </span>
                      <h4 className="font-display font-extrabold text-xl text-[#1C1917] dark:text-[#FAF9F5] leading-tight break-words">
                        {term.trim() || 'Nome do Conceito'}
                      </h4>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-[#2D5A46]/10 text-[#2D5A46] dark:text-[#52B788] flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Definição no Cartão */}
                  <div className="pl-2 my-2 text-xs text-[#3A3632] dark:text-[#E7E5E4] leading-relaxed font-medium break-words min-h-[50px]">
                    {definition.trim() ? (
                      <LatexRenderer content={definition.trim()} />
                    ) : (
                      <span className="italic text-[#A8A29E]">
                        Sua explicação conceitual aparecerá formatada aqui...
                      </span>
                    )}
                  </div>

                  {/* Imagem (se houver) */}
                  {isImageEntered && imageValid && (
                    <div className="my-3 rounded-2xl overflow-hidden border border-[#E7E2D9] dark:border-[#3B3B40] bg-[#F5F1EA] dark:bg-[#242426] max-h-36 flex items-center justify-center p-1">
                      <img
                        src={imageUrl.trim()}
                        alt="Preview do Conceito"
                        className="max-h-32 object-contain rounded-xl"
                      />
                    </div>
                  )}

                  {/* Exemplo no Cartão */}
                  {example.trim() && (
                    <div className="mt-3 ml-2 p-3 rounded-2xl bg-[#EBF3EF] dark:bg-[#15221B]/80 border border-[#CFE1D6] dark:border-[#22392D] text-xs text-[#2D5A46] dark:text-[#A7D7C5] flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div className="leading-snug">
                        <strong className="font-bold mr-1">Exemplo:</strong>
                        <LatexRenderer content={example.trim()} />
                      </div>
                    </div>
                  )}

                  {/* Selo de Assinatura no Rodapé do Cartão */}
                  <div className="mt-4 pt-3 border-t border-[#F0ECE1] dark:border-[#26262B] flex items-center justify-between text-[10px] text-[#A8A29E] pl-2">
                    <span className="font-display font-semibold tracking-wider uppercase text-[9px] text-[#2D5A46] dark:text-[#52B788]">
                      Mendonça Caderno
                    </span>
                    <span>Salvo no Grupo</span>
                  </div>
                </div>
              </div>

              {/* Dica de atalho */}
              <div className="mt-6 text-center text-[11px] font-medium text-[#8C827A] dark:text-[#9A938C]">
                Atalho: <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border text-[#1C1917] dark:text-[#FAF9F5] font-mono text-[10px]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border text-[#1C1917] dark:text-[#FAF9F5] font-mono text-[10px]">Enter</kbd> para salvar.
              </div>
            </div>
          </div>

          {/* Footer do Modal */}
          <div className="px-7 py-4 border-t border-[#E8E3D8] dark:border-[#242428] bg-white/80 dark:bg-[#1A1A1E]/80 backdrop-blur-sm flex items-center justify-between gap-3 shrink-0">
            <div>
              {isEditing && onDeleteTerm && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Deseja realmente excluir o conceito "${term}"?`)) {
                      onDeleteTerm(oldKey || term, scope);
                      onClose();
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Excluir conceito</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#57534E] dark:text-[#D6D3CD] hover:bg-[#EFECE6] dark:hover:bg-[#232326] transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={!canSubmit}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#2D5A46] to-[#224A38] hover:from-[#21483A] hover:to-[#193A2C] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-extrabold shadow-md shadow-[#2D5A46]/25 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Salvar Conceito</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
