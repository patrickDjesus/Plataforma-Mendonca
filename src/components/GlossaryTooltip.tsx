import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Sparkles, Lightbulb, ExternalLink } from 'lucide-react';
import { GlossaryDefinition } from '../data/disciplinesData';

// Dicionário global de termos padrão recorrentes nos estudos
export const GLOBAL_GLOSSARY: Record<string, GlossaryDefinition> = {
  logaritmo: {
    term: 'Logaritmo',
    definition: 'Expoente ao qual se deve elevar uma base fixa para produzir um determinado número. É o inverso da exponenciação.',
    example: 'Se 2³ = 8, então log₂(8) = 3.',
    category: 'Matemática'
  },
  'função exponencial': {
    term: 'Função Exponencial',
    definition: 'Função matemática em que a variável independente aparece como expoente (ex: f(x) = aˣ). Modela crescimento rápido e decaimento.',
    example: 'Crescimento de bactérias em placa de Petri ou decaimento radiativo.',
    category: 'Matemática'
  },
  mitose: {
    term: 'Mitose',
    definition: 'Processo de divisão celular pelo qual uma célula eucariótica produz duas células-filhas geneticamente idênticas com o mesmo número de cromossomos.',
    example: 'Regeneração de tecidos e cicatrização da pele.',
    category: 'Biologia'
  },
  meiose: {
    term: 'Meiose',
    definition: 'Divisão celular que reduz o número de cromossomos pela metade, originando quatro células-filhas haploides (gametas).',
    example: 'Produção de espermatozoides e óvulos.',
    category: 'Biologia'
  },
  derivada: {
    term: 'Derivada',
    definition: 'Taxa de variação instantânea de uma função em relação a uma de suas variáveis. Geometricamente representa a inclinação da reta tangente.',
    example: 'A derivada da posição em relação ao tempo é a velocidade instantânea.',
    category: 'Cálculo'
  },
  integral: {
    term: 'Integral',
    definition: 'Operação matemática que calcula a área sob a curva de uma função ou a acumulação de grandezas contínuas.',
    example: 'Calcular a distância total percorrida a partir do gráfico de velocidade.',
    category: 'Cálculo'
  },
  entropia: {
    term: 'Entropia',
    definition: 'Medida do grau de desordem, dispersão de energia ou aleatoriedade de um sistema termodinâmico.',
    example: 'Um cubo de gelo derretendo em água morna aumenta a entropia do universo.',
    category: 'Física / Química'
  },
  'efeito fotoelétrico': {
    term: 'Efeito Fotoelétrico',
    definition: 'Emissão de elétrons por um material (geralmente metálico) quando exposto à radiação eletromagnética de frequência suficiente.',
    example: 'Funcionamento de células e painéis solares fotovoltaicos.',
    category: 'Física Quântica'
  },
  feudalismo: {
    term: 'Feudalismo',
    definition: 'Sistema político, econômico e social predominante na Europa Medieval, baseado na posse de terras (feudos), suserania, vassalagem e servidão.',
    example: 'Relação entre o senhor feudal e os camponeses servis.',
    category: 'História'
  },
  genoma: {
    term: 'Genoma',
    definition: 'Conjunto completo de moléculas de DNA de um organismo, incluindo todos os seus genes e regiões não codificantes.',
    example: 'O sequenciamento do genoma humano contém cerca de 3 bilhões de pares de bases.',
    category: 'Genética'
  }
};

interface GlossaryWordProps {
  term: string;
  definition: GlossaryDefinition;
  children: React.ReactNode;
}

export const GlossaryWord: React.FC<GlossaryWordProps> = ({ term, definition, children }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  const handleMouseEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({
      top: rect.top - 8,
      left: rect.left + rect.width / 2
    });
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <span
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative inline-block cursor-help font-medium text-blue-700 dark:text-blue-300 underline decoration-dotted decoration-blue-500 underline-offset-4 hover:bg-blue-100/60 dark:hover:bg-blue-900/40 rounded px-0.5 transition-colors"
    >
      {children}

      <AnimatePresence>
        {isHovered && coords && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              transform: 'translate(-50%, -100%)',
              zIndex: 999999
            }}
            className="w-72 max-w-[90vw] p-3.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-2xl shadow-2xl border border-blue-200/80 dark:border-blue-800/80 pointer-events-none text-left"
          >
            {/* Header com Tag de Categoria e Ícone */}
            <div className="flex items-center justify-between gap-2 mb-1.5 border-b border-slate-100 dark:border-slate-800 pb-1.5">
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                <BookOpen className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[11px] font-bold uppercase tracking-wider font-display">
                  {definition.term || term}
                </span>
              </div>
              {definition.category && (
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                  {definition.category}
                </span>
              )}
            </div>

            {/* Definição / Significado */}
            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
              {definition.definition}
            </p>

            {/* Exemplo Prático se existir */}
            {definition.example && (
              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-start gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-xl">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <p className="italic leading-snug">
                  <strong>Exemplo:</strong> {definition.example}
                </p>
              </div>
            )}

            {/* Seta do Balão */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white dark:border-t-slate-900 drop-shadow-xs" />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
};

interface FormattedContentProps {
  content: string;
  customGlossary?: Record<string, GlossaryDefinition>;
  isRuledMode?: boolean;
}

/**
 * Renderiza o texto e automaticamente identifica palavras do glossário para aplicar o Tooltip Hover
 */
export const FormattedContentWithGlossary: React.FC<FormattedContentProps> = ({
  content,
  customGlossary = {},
  isRuledMode = false
}) => {
  if (!content) return null;

  // Unifica glossário global e glossário personalizado do documento
  const allGlossary: Record<string, GlossaryDefinition> = {
    ...GLOBAL_GLOSSARY,
    ...customGlossary
  };

  // Coleta todas as chaves ordenadas por comprimento decrescente (termos compostos primeiro)
  const terms = Object.keys(allGlossary).sort((a, b) => b.length - a.length);

  if (terms.length === 0) {
    return <span>{content}</span>;
  }

  // Cria regex para capturar os termos preservando maiúsculas/minúsculas
  const regexPattern = new RegExp(`\\b(${terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'gi');

  const parts = content.split(regexPattern);

  return (
    <>
      {parts.map((part, index) => {
        const lower = part.toLowerCase();
        const definition = allGlossary[lower];

        if (definition) {
          return (
            <GlossaryWord key={index} term={part} definition={definition}>
              {part}
            </GlossaryWord>
          );
        }

        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </>
  );
};
