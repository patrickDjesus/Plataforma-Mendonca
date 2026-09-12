import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  List,
  ListOrdered,
  CheckSquare,
  Sparkles,
  Highlighter,
  Code,
  Quote,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Info,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Table as TableIcon,
  Minus,
  RotateCcw,
  RotateCw,
  ChevronDown,
  Baseline,
  Eraser,
  Image as ImageIcon,
  Smile
} from 'lucide-react';
import { DocSection } from '../data/disciplinesData';
import { EmojiQuickPicker } from './EmojiQuickPicker';

export interface FormattingState {
  type: DocSection['type'];
  align: 'left' | 'center' | 'right' | 'justify';
  fontSize: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrikethrough: boolean;
  textColor?: string;
  highlightColor?: string;
}

interface NotionToolbarProps {
  currentFormatting?: FormattingState;
  onApplyFormat: (format: Partial<DocSection>) => void;
  onAddBlock: (type: DocSection['type'], extra?: Partial<DocSection>) => void;
  onOpenAddGlossary: () => void;
  onInsertEmoji?: (emoji: string) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onClearFormatting?: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const TEXT_COLORS = [
  { name: 'Padrão', value: '', class: 'bg-[#1C1917] dark:bg-[#E7E5E4] text-[#1C1917]' },
  { name: 'Azul Real', value: '#2D5A46', class: 'bg-[#2D5A46]' },
  { name: 'Índigo', value: '#224A38', class: 'bg-[#224A38]' },
  { name: 'Esmeralda', value: '#059669', class: 'bg-emerald-600' },
  { name: 'Âmbar', value: '#D97706', class: 'bg-amber-600' },
  { name: 'Vermelho', value: '#DC2626', class: 'bg-red-600' },
  { name: 'Roxo', value: '#1E3E30', class: 'bg-[#1E3E30]' },
  { name: 'Ciano', value: '#52B788', class: 'bg-[#52B788]' },
];

// eslint-disable-next-line react-refresh/only-export-components
export const HIGHLIGHT_COLORS = [
  { name: 'Sem Destaque', value: '', colorClass: 'bg-transparent border border-[#D6D0C5]' },
  { name: 'Amarelo Caneta', value: '#FEF08A', colorClass: 'bg-yellow-200 text-yellow-950' },
  { name: 'Verde Menta', value: '#BBF7D0', colorClass: 'bg-green-200 text-green-950' },
  { name: 'Azul Claro', value: '#CFE1D6', colorClass: 'bg-[#CFE1D6] text-[#224A38]' },
  { name: 'Rosa Pastel', value: '#E5DFD5', colorClass: 'bg-[#E5DFD5] text-[#44403C]' },
  { name: 'Laranja Suave', value: '#FED7AA', colorClass: 'bg-orange-200 text-orange-950' },
  { name: 'Lavanda', value: '#D6E6DC', colorClass: 'bg-[#D6E6DC] text-[#224A38]' },
];

export const NotionToolbar: React.FC<NotionToolbarProps> = ({
  currentFormatting = {
    type: 'paragraph',
    align: 'left',
    fontSize: 'base',
    isBold: false,
    isItalic: false,
    isUnderline: false,
    isStrikethrough: false,
    textColor: '',
    highlightColor: '',
  },
  onApplyFormat,
  onAddBlock,
  onOpenAddGlossary: _onOpenAddGlossary,
  onInsertEmoji,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onClearFormatting,
}) => {
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showTextColorPopover, setShowTextColorPopover] = useState(false);
  const [showHighlightPopover, setShowHighlightPopover] = useState(false);
  const [showCalloutMenu, setShowCalloutMenu] = useState(false);
  const [showImagePopover, setShowImagePopover] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageCaptionInput, setImageCaptionInput] = useState('');

  const toolbarRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setShowTypeDropdown(false);
        setShowTextColorPopover(false);
        setShowHighlightPopover(false);
        setShowCalloutMenu(false);
        setShowImagePopover(false);
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTypeText = () => {
    switch (currentFormatting.type) {
      case 'h1': return 'Título 1 (H1)';
      case 'h2': return 'Título 2 (H2)';
      case 'h3': return 'Título 3 (H3)';
      case 'bullet': return 'Marcadores';
      case 'numbered': return 'Numerada';
      case 'todo': return 'Checklist';
      case 'callout': return 'Caixa Destaque';
      case 'quote': return 'Citação';
      case 'code': return 'Código/Fórmula';
      case 'table': return 'Tabela';
      case 'image': return 'Imagem (URL)';
      default: return 'Texto Normal';
    }
  };

  return (
    <motion.div 
      ref={toolbarRef}
      initial={{ opacity: 0, y: -12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-30 flex flex-wrap items-center gap-1.5 p-2 bg-white/95 dark:bg-[#18181B]/95 backdrop-blur-xl border border-[#E7E2D9]/90 dark:border-[#2C2C30] rounded-2xl shadow-lg ring-1 ring-[#2D5A46]/10 dark:ring-[#52B788]/10 text-xs select-none transition-all"
    >
      {/* Badge Synapse Editor */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-[#2D5A46]/10 to-[#224A38]/10 dark:from-[#22392D]/30 dark:to-[#15221B]/30 border border-[#CFE1D6]/60 dark:border-[#22392D]/60 text-[#224A38] dark:text-[#52B788] font-extrabold text-[11px] tracking-wide shrink-0">
        <Sparkles className="w-3 h-3 text-[#2D5A46] dark:text-[#52B788] animate-pulse" />
        <span>SYNAPSE</span>
      </div>

      {/* 1. SEÇÃO DE DESFAZER / REFAZER (HISTÓRICO) */}
      <div className="flex items-center gap-0.5 pr-1.5 border-r border-[#E7E2D9] dark:border-[#2C2C30]">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onUndo}
          disabled={!canUndo}
          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
            canUndo 
              ? 'text-[#44403C] dark:text-[#E7E5E4] hover:bg-[#E5DFD5] dark:hover:bg-[#333338]' 
              : 'text-[#D6D0C5] dark:text-[#78716C] cursor-not-allowed'
          }`}
          title="Desfazer (Ctrl+Z)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onRedo}
          disabled={!canRedo}
          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
            canRedo 
              ? 'text-[#44403C] dark:text-[#E7E5E4] hover:bg-[#E5DFD5] dark:hover:bg-[#333338]' 
              : 'text-[#D6D0C5] dark:text-[#78716C] cursor-not-allowed'
          }`}
          title="Refazer (Ctrl+Y)"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. SELETOR DE ESTILO / TAMANHO DE TEXTO (DROPDOWN ESTILO WORD) */}
      <div className="relative">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setShowTypeDropdown(!showTypeDropdown);
            setShowTextColorPopover(false);
            setShowHighlightPopover(false);
            setShowCalloutMenu(false);
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#EFECE6] dark:bg-[#232326] hover:bg-[#E5DFD5] dark:hover:bg-[#333338] text-[#1C1917] dark:text-[#E7E5E4] font-semibold transition-all cursor-pointer min-w-[130px] justify-between text-xs"
          title="Estilo de Texto / Cabeçalho"
        >
          <span className="truncate">{getTypeText()}</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#A8A29E] shrink-0" />
        </button>

        {showTypeDropdown && (
          <div className="absolute left-0 top-full mt-1.5 z-50 w-52 bg-white dark:bg-[#18181B] rounded-2xl shadow-2xl border border-[#E7E2D9] dark:border-[#2C2C30] p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-2.5 py-1 text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider">
              Estilos de Bloco
            </div>
            
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onApplyFormat({ type: 'paragraph', fontSize: 'base' });
                setShowTypeDropdown(false);
              }}
              className={`w-full px-2.5 py-1.5 text-left rounded-xl flex items-center justify-between text-xs transition-colors ${
                currentFormatting.type === 'paragraph' ? 'bg-[#EBF3EF] dark:bg-[#15221B]/60 text-[#2D5A46] font-bold' : 'hover:bg-[#E5DFD5] dark:hover:bg-[#333338] text-[#44403C] dark:text-[#E7E5E4]'
              }`}
            >
              <span className="flex items-center gap-2">
                <Pilcrow className="w-3.5 h-3.5 text-[#A8A29E]" /> Texto Normal
              </span>
              <span className="text-[10px] text-[#A8A29E]">16px</span>
            </button>

            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onApplyFormat({ type: 'h1', fontSize: '3xl' });
                setShowTypeDropdown(false);
              }}
              className={`w-full px-2.5 py-1.5 text-left rounded-xl flex items-center justify-between text-sm font-extrabold transition-colors ${
                currentFormatting.type === 'h1' ? 'bg-[#EBF3EF] dark:bg-[#15221B]/60 text-[#2D5A46] font-bold' : 'hover:bg-[#E5DFD5] dark:hover:bg-[#333338] text-[#1C1917] dark:text-[#FAF9F5]'
              }`}
            >
              <span className="flex items-center gap-2">
                <Heading1 className="w-4 h-4 text-[#2D5A46]" /> Título 1 (H1)
              </span>
              <span className="text-[10px] font-normal text-[#A8A29E]">30px</span>
            </button>

            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onApplyFormat({ type: 'h2', fontSize: '2xl' });
                setShowTypeDropdown(false);
              }}
              className={`w-full px-2.5 py-1.5 text-left rounded-xl flex items-center justify-between text-xs font-bold transition-colors ${
                currentFormatting.type === 'h2' ? 'bg-[#EBF3EF] dark:bg-[#15221B]/60 text-[#2D5A46] font-bold' : 'hover:bg-[#E5DFD5] dark:hover:bg-[#333338] text-[#1C1917] dark:text-[#FAF9F5]'
              }`}
            >
              <span className="flex items-center gap-2">
                <Heading2 className="w-3.5 h-3.5 text-[#224A38]" /> Título 2 (H2)
              </span>
              <span className="text-[10px] font-normal text-[#A8A29E]">24px</span>
            </button>

            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onApplyFormat({ type: 'h3', fontSize: 'xl' });
                setShowTypeDropdown(false);
              }}
              className={`w-full px-2.5 py-1.5 text-left rounded-xl flex items-center justify-between text-xs font-semibold transition-colors ${
                currentFormatting.type === 'h3' ? 'bg-[#EBF3EF] dark:bg-[#15221B]/60 text-[#2D5A46] font-bold' : 'hover:bg-[#E5DFD5] dark:hover:bg-[#333338] text-[#44403C] dark:text-[#D6D3CD]'
              }`}
            >
              <span className="flex items-center gap-2">
                <Heading3 className="w-3.5 h-3.5 text-[#2D5A46]" /> Título 3 (H3)
              </span>
              <span className="text-[10px] font-normal text-[#A8A29E]">20px</span>
            </button>

            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onApplyFormat({ type: 'quote' });
                setShowTypeDropdown(false);
              }}
              className="w-full px-2.5 py-1.5 text-left rounded-xl flex items-center gap-2 text-xs italic text-[#44403C] dark:text-[#D6D3CD] hover:bg-[#E5DFD5] dark:hover:bg-[#333338] transition-colors"
            >
              <Quote className="w-3.5 h-3.5 text-[#2D5A46]" /> Citação
            </button>
          </div>
        )}
      </div>

      {/* 3. GRUPO DE FORMATAÇÃO DE TEXTO (NEGRITO, ITÁLICO, SUBLINHADO, TACHADO) */}
      <div className="flex items-center gap-0.5 px-1.5 border-x border-[#E7E2D9] dark:border-[#2C2C30]">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onApplyFormat({ isBold: !currentFormatting.isBold })}
          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
            currentFormatting.isBold
              ? 'bg-[#2D5A46] text-white shadow-xs'
              : 'text-[#44403C] dark:text-[#E7E5E4] hover:bg-[#E5DFD5] dark:hover:bg-[#333338]'
          }`}
          title="Negrito (Ctrl+B)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onApplyFormat({ isItalic: !currentFormatting.isItalic })}
          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
            currentFormatting.isItalic
              ? 'bg-[#2D5A46] text-white shadow-xs'
              : 'text-[#44403C] dark:text-[#E7E5E4] hover:bg-[#E5DFD5] dark:hover:bg-[#333338]'
          }`}
          title="Itálico (Ctrl+I)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onApplyFormat({ isUnderline: !currentFormatting.isUnderline })}
          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
            currentFormatting.isUnderline
              ? 'bg-[#2D5A46] text-white shadow-xs'
              : 'text-[#44403C] dark:text-[#E7E5E4] hover:bg-[#E5DFD5] dark:hover:bg-[#333338]'
          }`}
          title="Sublinhado (Ctrl+U)"
        >
          <Underline className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onApplyFormat({ isStrikethrough: !currentFormatting.isStrikethrough })}
          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
            currentFormatting.isStrikethrough
              ? 'bg-[#2D5A46] text-white shadow-xs'
              : 'text-[#44403C] dark:text-[#E7E5E4] hover:bg-[#E5DFD5] dark:hover:bg-[#333338]'
          }`}
          title="Tachado / Riscado"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4. PALETA DE CORES DE TEXTO & MARCA-TEXTO */}
      <div className="flex items-center gap-1 pr-1.5 border-r border-[#E7E2D9] dark:border-[#2C2C30]">
        
        {/* Cor do Texto */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setShowTextColorPopover(!showTextColorPopover);
              setShowHighlightPopover(false);
              setShowTypeDropdown(false);
              setShowCalloutMenu(false);
            }}
            className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-[#E5DFD5] dark:hover:bg-[#333338] text-[#44403C] dark:text-[#E7E5E4] transition-all cursor-pointer"
            title="Cor do Texto"
          >
            <div className="flex flex-col items-center">
              <Baseline className="w-3.5 h-3.5" />
              <div 
                className="w-3.5 h-1 rounded-full mt-0.5" 
                style={{ backgroundColor: currentFormatting.textColor || '#334155' }}
              />
            </div>
            <ChevronDown className="w-2.5 h-2.5 text-[#A8A29E]" />
          </button>

          {showTextColorPopover && (
            <div className="absolute left-0 top-full mt-1.5 z-50 p-2.5 bg-white dark:bg-[#18181B] rounded-2xl shadow-2xl border border-[#E7E2D9] dark:border-[#2C2C30] w-48 animate-in fade-in zoom-in-95">
              <div className="text-[10px] font-bold text-[#A8A29E] mb-2 uppercase tracking-wider">
                Cor da Fonte
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {TEXT_COLORS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onApplyFormat({ textColor: c.value });
                      setShowTextColorPopover(false);
                    }}
                    className={`w-7 h-7 rounded-xl flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ${
                      currentFormatting.textColor === c.value ? 'ring-2 ring-[#2D5A46] ring-offset-2 dark:ring-offset-[#18181B]' : ''
                    }`}
                    style={{ backgroundColor: c.value || '#334155' }}
                    title={c.name}
                  />
                ))}
              </div>
              {currentFormatting.textColor && (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onApplyFormat({ textColor: '' });
                    setShowTextColorPopover(false);
                  }}
                  className="w-full mt-2 pt-1.5 border-t border-[#E7E2D9] dark:border-[#2C2C30] text-[11px] text-[#78716C] hover:text-[#1C1917] dark:hover:text-[#E7E5E4] font-medium text-center"
                >
                  Restaurar Cor Padrão
                </button>
              )}
            </div>
          )}
        </div>

        {/* Marca-Texto (Highlight) */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setShowHighlightPopover(!showHighlightPopover);
              setShowTextColorPopover(false);
              setShowTypeDropdown(false);
              setShowCalloutMenu(false);
            }}
            className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-[#E5DFD5] dark:hover:bg-[#333338] text-[#44403C] dark:text-[#E7E5E4] transition-all cursor-pointer"
            title="Cor de Destaque / Marca-Texto"
          >
            <div className="flex flex-col items-center">
              <Highlighter className="w-3.5 h-3.5 text-amber-500" />
              <div 
                className="w-3.5 h-1 rounded-full mt-0.5" 
                style={{ backgroundColor: currentFormatting.highlightColor || '#fef08a' }}
              />
            </div>
            <ChevronDown className="w-2.5 h-2.5 text-[#A8A29E]" />
          </button>

          {showHighlightPopover && (
            <div className="absolute left-0 top-full mt-1.5 z-50 p-2.5 bg-white dark:bg-[#18181B] rounded-2xl shadow-2xl border border-[#E7E2D9] dark:border-[#2C2C30] w-48 animate-in fade-in zoom-in-95">
              <div className="text-[10px] font-bold text-[#A8A29E] mb-2 uppercase tracking-wider">
                Marca-Texto
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {HIGHLIGHT_COLORS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onApplyFormat({ highlightColor: c.value });
                      setShowHighlightPopover(false);
                    }}
                    className={`w-7 h-7 rounded-xl flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ${c.colorClass} ${
                      currentFormatting.highlightColor === c.value ? 'ring-2 ring-[#2D5A46] ring-offset-2 dark:ring-offset-[#18181B]' : ''
                    }`}
                    style={c.value ? { backgroundColor: c.value } : {}}
                    title={c.name}
                  >
                    {!c.value && <Eraser className="w-3 h-3 text-[#A8A29E]" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 5. ALINHAMENTO DE PARÁGRAFO */}
      <div className="flex items-center gap-0.5 pr-1.5 border-r border-[#E7E2D9] dark:border-[#2C2C30]">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onApplyFormat({ align: 'left' })}
          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
            (!currentFormatting.align || currentFormatting.align === 'left')
              ? 'bg-[#EBF3EF] dark:bg-[#15221B]/60 text-[#2D5A46] dark:text-[#52B788] font-bold'
              : 'text-[#44403C] dark:text-[#E7E5E4] hover:bg-[#E5DFD5] dark:hover:bg-[#333338]'
          }`}
          title="Alinhar à Esquerda"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onApplyFormat({ align: 'center' })}
          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
            currentFormatting.align === 'center'
              ? 'bg-[#EBF3EF] dark:bg-[#15221B]/60 text-[#2D5A46] dark:text-[#52B788] font-bold'
              : 'text-[#44403C] dark:text-[#E7E5E4] hover:bg-[#E5DFD5] dark:hover:bg-[#333338]'
          }`}
          title="Centralizar"
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onApplyFormat({ align: 'right' })}
          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
            currentFormatting.align === 'right'
              ? 'bg-[#EBF3EF] dark:bg-[#15221B]/60 text-[#2D5A46] dark:text-[#52B788] font-bold'
              : 'text-[#44403C] dark:text-[#E7E5E4] hover:bg-[#E5DFD5] dark:hover:bg-[#333338]'
          }`}
          title="Alinhar à Direita"
        >
          <AlignRight className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onApplyFormat({ align: 'justify' })}
          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
            currentFormatting.align === 'justify'
              ? 'bg-[#EBF3EF] dark:bg-[#15221B]/60 text-[#2D5A46] dark:text-[#52B788] font-bold'
              : 'text-[#44403C] dark:text-[#E7E5E4] hover:bg-[#E5DFD5] dark:hover:bg-[#333338]'
          }`}
          title="Justificar Texto"
        >
          <AlignJustify className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 6. LISTAS & TAREFAS */}
      <div className="flex items-center gap-0.5 pr-1.5 border-r border-[#E7E2D9] dark:border-[#2C2C30]">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onApplyFormat({ type: currentFormatting.type === 'bullet' ? 'paragraph' : 'bullet' })}
          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
            currentFormatting.type === 'bullet'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-[#44403C] dark:text-[#E7E5E4] hover:bg-[#E5DFD5] dark:hover:bg-[#333338]'
          }`}
          title="Lista com Marcadores"
        >
          <List className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onApplyFormat({ type: currentFormatting.type === 'numbered' ? 'paragraph' : 'numbered' })}
          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
            currentFormatting.type === 'numbered'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-[#44403C] dark:text-[#E7E5E4] hover:bg-[#E5DFD5] dark:hover:bg-[#333338]'
          }`}
          title="Lista Numerada"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onApplyFormat({ type: currentFormatting.type === 'todo' ? 'paragraph' : 'todo' })}
          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
            currentFormatting.type === 'todo'
              ? 'bg-[#2D5A46] text-white shadow-xs'
              : 'text-[#44403C] dark:text-[#E7E5E4] hover:bg-[#E5DFD5] dark:hover:bg-[#333338]'
          }`}
          title="Checklist / Tarefa"
        >
          <CheckSquare className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 7. INSERÇÕES ESPECIAIS (CALLOUT, CITAÇÃO, CÓDIGO, TABELA, DIVISOR) */}
      <div className="flex items-center gap-1 pr-1.5 border-r border-[#E7E2D9] dark:border-[#2C2C30]">
        
        {/* Menu de Caixa de Destaque (Callout) */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setShowCalloutMenu(!showCalloutMenu);
              setShowTypeDropdown(false);
              setShowTextColorPopover(false);
              setShowHighlightPopover(false);
            }}
            className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-[#E5DFD5] dark:hover:bg-[#333338] text-amber-600 dark:text-amber-400 transition-all cursor-pointer"
            title="Inserir Caixa de Destaque / Aviso"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <ChevronDown className="w-2.5 h-2.5 text-[#A8A29E]" />
          </button>

          {showCalloutMenu && (
            <div className="absolute left-0 top-full mt-1.5 z-50 w-52 bg-white dark:bg-[#18181B] rounded-2xl shadow-2xl border border-[#E7E2D9] dark:border-[#2C2C30] p-1.5 space-y-0.5 animate-in fade-in zoom-in-95">
              <div className="px-2.5 py-1 text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider">
                Tipo de Caixa
              </div>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onAddBlock('callout', { calloutType: 'tip', content: 'Dica essencial para o estudo.' });
                  setShowCalloutMenu(false);
                }}
                className="w-full px-2.5 py-1.5 text-left rounded-xl flex items-center gap-2 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Dica & Macete
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onAddBlock('callout', { calloutType: 'warning', content: 'Atenção redobrada para pegadinhas recorrentes.' });
                  setShowCalloutMenu(false);
                }}
                className="w-full px-2.5 py-1.5 text-left rounded-xl flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-700 dark:text-red-300 text-xs"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> Atenção & Pegadinha
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onAddBlock('callout', { calloutType: 'success', content: 'Regra de ouro comprovada.' });
                  setShowCalloutMenu(false);
                }}
                className="w-full px-2.5 py-1.5 text-left rounded-xl flex items-center gap-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Regra de Ouro / Sucesso
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onAddBlock('callout', { calloutType: 'focus', content: 'Conceito chave para memorização.' });
                  setShowCalloutMenu(false);
                }}
                className="w-full px-2.5 py-1.5 text-left rounded-xl flex items-center gap-2 hover:bg-[#EBF3EF] dark:hover:bg-[#15221B]/60 text-[#2D5A46] dark:text-[#52B788] text-xs"
              >
                <Info className="w-3.5 h-3.5 text-[#2D5A46]" /> Foco & Conceito
              </button>
            </div>
          )}
        </div>

        {/* Inserir Imagem por URL */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setShowImagePopover(!showImagePopover);
              setShowCalloutMenu(false);
              setShowTypeDropdown(false);
              setShowTextColorPopover(false);
              setShowHighlightPopover(false);
            }}
            className="p-1.5 rounded-lg hover:bg-[#E5DFD5] dark:hover:bg-[#333338] text-[#2D5A46] dark:text-[#52B788] transition-all cursor-pointer"
            title="Inserir Imagem por URL"
          >
            <ImageIcon className="w-3.5 h-3.5" />
          </button>

          {showImagePopover && (
            <div className="absolute left-0 top-full mt-1.5 z-50 w-72 p-3 bg-white dark:bg-[#18181B] rounded-2xl shadow-2xl border border-[#E7E2D9] dark:border-[#2C2C30] space-y-2.5 animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#1C1917] dark:text-[#E7E5E4]">
                <ImageIcon className="w-3.5 h-3.5 text-[#2D5A46]" />
                <span>Inserir Imagem (URL)</span>
              </div>
              
              <div>
                <label className="text-[10px] font-semibold text-[#A8A29E] uppercase tracking-wider block mb-1">
                  Link Direto da Imagem
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="https://exemplo.com/imagem.png"
                    className="w-full text-xs px-2.5 py-1.5 rounded-xl bg-[#EFECE6] dark:bg-[#232326] border border-[#E7E2D9] dark:border-[#3B3B40] outline-none text-[#1C1917] dark:text-[#E7E5E4] placeholder:text-[#A8A29E] focus:ring-1 focus:ring-[#2D5A46]"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-[#A8A29E] uppercase tracking-wider block mb-1">
                  Legenda (Opcional)
                </label>
                <input
                  type="text"
                  value={imageCaptionInput}
                  onChange={(e) => setImageCaptionInput(e.target.value)}
                  placeholder="Ex: Diagrama do Ciclo de Krebs..."
                  className="w-full text-xs px-2.5 py-1.5 rounded-xl bg-[#EFECE6] dark:bg-[#232326] border border-[#E7E2D9] dark:border-[#3B3B40] outline-none text-[#1C1917] dark:text-[#E7E5E4] placeholder:text-[#A8A29E] focus:ring-1 focus:ring-[#2D5A46]"
                />
              </div>

              {/* Pré-visualização Rápida se houver URL */}
              {imageUrlInput && (
                <div className="relative rounded-xl overflow-hidden border border-[#E7E2D9] dark:border-[#2C2C30] max-h-28 bg-[#EFECE6] dark:bg-[#232326] flex items-center justify-center">
                  <img
                    src={imageUrlInput}
                    alt="Preview"
                    className="max-h-28 w-auto object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowImagePopover(false);
                    setImageUrlInput('');
                    setImageCaptionInput('');
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium text-[#78716C] hover:bg-[#E5DFD5] dark:hover:bg-[#333338] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={!imageUrlInput.trim()}
                  onClick={() => {
                    if (imageUrlInput.trim()) {
                      onAddBlock('image', {
                        imageUrl: imageUrlInput.trim(),
                        imageCaption: imageCaptionInput.trim() || undefined,
                        content: imageCaptionInput.trim() || '',
                      });
                      setShowImagePopover(false);
                      setImageUrlInput('');
                      setImageCaptionInput('');
                    }
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold text-white transition-all ${
                    imageUrlInput.trim()
                      ? 'bg-[#2D5A46] hover:bg-[#224A38] shadow-xs cursor-pointer'
                      : 'bg-[#E7E2D9] dark:bg-[#3B3B40] cursor-not-allowed text-[#A8A29E]'
                  }`}
                >
                  Adicionar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Inserir Fórmula / Bloco de Código */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onAddBlock('code', { formula: 'Fórmula ou Expressão Matemática' })}
          className="p-1.5 rounded-lg hover:bg-[#E5DFD5] dark:hover:bg-[#333338] text-[#2D5A46] dark:text-[#52B788] transition-all cursor-pointer"
          title="Inserir Fórmula / Código"
        >
          <Code className="w-3.5 h-3.5" />
        </button>

        {/* Inserir Tabela Word */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onAddBlock('table', { 
            tableData: [
              ['Cabeçalho 1', 'Cabeçalho 2', 'Cabeçalho 3'],
              ['Dado 1', 'Dado 2', 'Dado 3'],
              ['Dado 4', 'Dado 5', 'Dado 6']
            ]
          })}
          className="p-1.5 rounded-lg hover:bg-[#E5DFD5] dark:hover:bg-[#333338] text-[#2D5A46] dark:text-[#52B788] transition-all cursor-pointer"
          title="Inserir Tabela"
        >
          <TableIcon className="w-3.5 h-3.5" />
        </button>

        {/* Inserir Emojis Temáticos Rápidos */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setShowImagePopover(false);
              setShowCalloutMenu(false);
              setShowTypeDropdown(false);
              setShowTextColorPopover(false);
              setShowHighlightPopover(false);
            }}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              showEmojiPicker
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 ring-2 ring-amber-400'
                : 'hover:bg-[#E5DFD5] dark:hover:bg-[#333338] text-amber-500 hover:text-amber-600'
            }`}
            title="Inserir Emoji Temático"
          >
            <Smile className="w-3.5 h-3.5" />
          </button>

          {showEmojiPicker && (
            <div className="absolute right-0 sm:left-0 top-full mt-1.5 z-50 w-72 sm:w-80 animate-in fade-in zoom-in-95">
              <EmojiQuickPicker
                onSelectEmoji={(emoji) => {
                  if (onInsertEmoji) {
                    onInsertEmoji(emoji);
                  } else {
                    onAddBlock('paragraph', { content: emoji, contentHtml: emoji });
                  }
                }}
                onClose={() => setShowEmojiPicker(false)}
              />
            </div>
          )}
        </div>

        {/* Inserir Divisor */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onAddBlock('divider')}
          className="p-1.5 rounded-lg hover:bg-[#E5DFD5] dark:hover:bg-[#333338] text-[#78716C] dark:text-[#A8A29E] transition-all cursor-pointer"
          title="Inserir Linha Divisória"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 8. LIMPAR FORMATAÇÃO */}
      {onClearFormatting && (
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onClearFormatting}
          className="ml-auto p-1.5 rounded-lg hover:bg-[#E5DFD5] dark:hover:bg-[#333338] text-[#A8A29E] hover:text-[#44403C] dark:hover:text-[#E7E5E4] transition-all cursor-pointer"
          title="Limpar Formatação do Bloco"
        >
          <Eraser className="w-3.5 h-3.5" />
        </button>
      )}

    </motion.div>
  );
};
