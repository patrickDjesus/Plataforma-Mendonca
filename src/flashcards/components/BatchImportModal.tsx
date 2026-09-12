import React, { useState } from 'react';
import { X, UploadCloud, CheckCircle, FileText, AlertCircle } from 'lucide-react';
import { Flashcard } from '../types';
import { parseBatchCardsText } from '../utils/storage';

interface BatchImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (cards: Partial<Flashcard>[]) => void;
  deckName: string;
}

export const BatchImportModal: React.FC<BatchImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  deckName,
}) => {
  const [text, setText] = useState('');
  const [defaultTag, setDefaultTag] = useState('Importado');

  if (!isOpen) return null;

  const parsedCards = parseBatchCardsText(text, defaultTag);

  const handleApply = () => {
    if (parsedCards.length === 0) return;
    onImport(parsedCards);
    setText('');
    onClose();
  };

  const sampleTemplate = `Bonjour - Olá (francês)
Merci - Obrigado
Au revoir - Até logo
S'il vous plaît - Por favor`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-[#FAF8F5] dark:bg-[#18181B] w-full max-w-2xl rounded-2xl shadow-2xl border-2 border-[#E7E2D9] dark:border-[#2C2C30] overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E2D9] dark:border-[#2C2C30]">
          <div>
            <h2 className="text-lg font-bold text-[#1C1917] dark:text-[#FAF9F5] font-['Fraunces',serif]">
              Importar Cards em Lote
            </h2>
            <p className="text-xs text-[#78716C] dark:text-[#A8A29E] mt-0.5">
              Adicionar vários flashcards ao baralho: <strong className="text-[#1C1917] dark:text-[#FAF9F5]">{deckName}</strong>
            </p>
          </div>
          <button
            id="btn-close-batch-modal"
            onClick={onClose}
            className="p-1.5 text-[#8C7A6B] hover:text-[#1C1917] dark:hover:text-white rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="bg-[#EBF3EF] dark:bg-[#15221B] border-2 border-[#CFE1D6] dark:border-[#22392D] rounded-xl p-3.5 text-xs text-[#2D5A46] dark:text-[#6BCFA0] space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <UploadCloud className="w-4 h-4 text-[#2D5A46]" />
              Formatos suportados automaticamente:
            </p>
            <p className="text-[#57534E] dark:text-[#D6D3CD]">
              Cole sua lista usando separadores como hífen (<code>termo - definição</code>), dois pontos (<code>pergunta : resposta</code>), barra (<code>palavra / significado</code>) ou TAB do Excel/Google Sheets.
            </p>
            <button
              type="button"
              onClick={() => setText(sampleTemplate)}
              className="text-xs text-[#2D5A46] font-bold hover:underline inline-block pt-1"
            >
              Inserir exemplo prático
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-mono font-bold text-[#8C7A6B] dark:text-[#A8A29E] uppercase tracking-wider mb-1.5">
                Cole sua lista de cards
              </label>
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-[#8C7A6B] dark:text-[#A8A29E] uppercase tracking-wider mb-1.5">
                Tag Padrão
              </label>
              <input
                type="text"
                value={defaultTag}
                onChange={(e) => setDefaultTag(e.target.value)}
                placeholder="Ex: Vocabulário"
                className="w-full px-3 py-1.5 text-xs rounded-xl border-2 border-[#E7E2D9] dark:border-[#2C2C30] bg-white dark:bg-[#141416] text-[#1C1917] dark:text-[#FAF9F5] focus:outline-none focus:border-[#2D5A46]"
              />
            </div>
          </div>

          <textarea
            id="textarea-batch-input"
            rows={7}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Termo 1 - Definição do termo 1&#10;Termo 2 - Definição do termo 2&#10;Pergunta 3 : Resposta da pergunta 3"
            className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#E7E2D9] dark:border-[#2C2C30] bg-white dark:bg-[#141416] text-[#1C1917] dark:text-[#FAF9F5] placeholder-[#A8A29E] focus:outline-none focus:border-[#2D5A46] text-xs font-mono"
          />

          {/* Real-time preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#8C7A6B] dark:text-[#A8A29E] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Pré-visualização
              </span>
              <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${
                parsedCards.length > 0
                  ? 'bg-[#EBF3EF] text-[#2D5A46] dark:bg-[#1D2B24] dark:text-[#52B788]'
                  : 'bg-[#EFECE6] text-[#78716C] dark:bg-[#252529] dark:text-[#A8A29E]'
              }`}>
                {parsedCards.length} {parsedCards.length === 1 ? 'card detectado' : 'cards detectados'}
              </span>
            </div>

            {parsedCards.length > 0 ? (
              <div className="max-h-48 overflow-y-auto rounded-xl border-2 border-[#E7E2D9] dark:border-[#2C2C30] divide-y divide-[#E7E2D9] dark:divide-[#2C2C30] bg-white dark:bg-[#141416]">
                {parsedCards.slice(0, 10).map((c, i) => (
                  <div key={i} className="p-2.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="font-bold text-[#1C1917] dark:text-[#FAF9F5] flex-1 font-['Fraunces',serif]">
                      {c.front}
                    </div>
                    <div className="text-[#57534E] dark:text-[#A8A29E] flex-1 border-t sm:border-t-0 pt-1 sm:pt-0">
                      {c.back}
                    </div>
                  </div>
                ))}
                {parsedCards.length > 10 && (
                  <div className="p-2 text-center text-xs text-[#8C7A6B] italic font-mono">
                    + mais {parsedCards.length - 10} cards serão importados...
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-[#8C7A6B] border-2 border-dashed border-[#E7E2D9] dark:border-[#2C2C30] rounded-xl font-mono">
                Cole o texto acima para ver os cartões organizados aqui.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#E7E2D9] dark:border-[#2C2C30] bg-[#EFECE6]/50 dark:bg-[#141416]">
          <button
            id="btn-cancel-batch-modal"
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-[#57534E] dark:text-[#A8A29E] hover:bg-[#EFECE6] dark:hover:bg-[#25252A] rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            id="btn-confirm-batch-import"
            type="button"
            disabled={parsedCards.length === 0}
            onClick={handleApply}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-[#2D5A46] hover:bg-[#21483A] disabled:opacity-40 disabled:pointer-events-none rounded-xl shadow-xs transition-all"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Importar {parsedCards.length} Cards</span>
          </button>
        </div>
      </div>
    </div>
  );
};
