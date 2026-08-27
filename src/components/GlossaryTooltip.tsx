import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Sparkles, Lightbulb, Tag } from 'lucide-react';
import { GlossaryDefinition } from '../data/disciplinesData';
import definitionsData from '../data/definitions.json';
import { Tooltip, DefinitionItem } from './Tooltip';
import { AnimatedEmoji } from './AnimatedEmoji';

// Exporta o dicionário global carregado de definitions.json para compatibilidade
export const GLOBAL_GLOSSARY: Record<string, GlossaryDefinition> = definitionsData as Record<string, GlossaryDefinition>;

interface GlossaryWordProps {
  term: string;
  definition: GlossaryDefinition;
  children: React.ReactNode;
}

/**
 * Componente que envolve um termo com destaque de cor azul suave e Tooltip ao passar o mouse
 */
export const GlossaryWord: React.FC<GlossaryWordProps> = ({ term, definition, children }) => {
  return (
    <Tooltip definition={definition} position="top">
      <span
        className="inline-block relative group/term px-1.5 py-0.5 mx-0.5 rounded-md font-semibold transition-all duration-200 cursor-help bg-blue-100/80 hover:bg-blue-200/90 text-blue-950 dark:bg-blue-950/70 dark:hover:bg-blue-900/90 dark:text-blue-200 border-b-2 border-blue-400/80 dark:border-blue-500 shadow-2xs"
        title="Passe o mouse para ver o conceito"
      >
        {children}
        <span className="inline-block ml-0.5 text-[10px] text-blue-500/80 dark:text-blue-400/80 opacity-70 group-hover/term:opacity-100 transition-opacity">
          ✦
        </span>
      </span>
    </Tooltip>
  );
};

interface FormattedContentProps {
  content: string;
  customGlossary?: Record<string, GlossaryDefinition>;
  isRuledMode?: boolean;
}

// Regex segura para detecção de emojis unicode
const EMOJI_REGEX = /(\p{Extended_Pictographic}|\p{Emoji_Presentation})/u;

/**
 * Renderiza fragmentos de texto identificando emojis para aplicar a animação Pop-in com Framer Motion
 */
const RenderTextWithAnimatedEmojis: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;

  // Divide o texto mantendo os emojis como tokens
  const tokens = text.split(/(\p{Extended_Pictographic}|\p{Emoji_Presentation})/gu);

  if (tokens.length <= 1) {
    return <span>{text}</span>;
  }

  return (
    <>
      {tokens.map((token, i) => {
        if (!token) return null;
        if (EMOJI_REGEX.test(token)) {
          return <AnimatedEmoji key={i} emoji={token} size="md" />;
        }
        return <React.Fragment key={i}>{token}</React.Fragment>;
      })}
    </>
  );
};

/**
 * Renderiza o texto do caderno e automaticamente:
 * 1. Identifica palavras do glossário (definitions.json) e aplica o destaque leve azul com Tooltip conceitual
 * 2. Identifica emojis personalizados e aplica animação suave de pop-in via Framer Motion
 */
export const FormattedContentWithGlossary: React.FC<FormattedContentProps> = ({
  content,
  customGlossary = {}
}) => {
  if (!content) return null;

  // Unifica glossário global de definitions.json com termos personalizados do usuário
  const allGlossary: Record<string, GlossaryDefinition> = {
    ...GLOBAL_GLOSSARY,
    ...customGlossary
  };

  // Coleta todas as chaves ordenadas por comprimento decrescente (termos compostos primeiro)
  const terms = Object.keys(allGlossary).sort((a, b) => b.length - a.length);

  if (terms.length === 0) {
    return <RenderTextWithAnimatedEmojis text={content} />;
  }

  // Cria regex para capturar os termos preservando maiúsculas/minúsculas
  const regexPattern = new RegExp(`\\b(${terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'gi');

  const parts = content.split(regexPattern);

  return (
    <>
      {parts.map((part, index) => {
        const lower = part.toLowerCase().trim();
        const definition = allGlossary[lower];

        if (definition) {
          return (
            <GlossaryWord key={index} term={part} definition={definition}>
              <RenderTextWithAnimatedEmojis text={part} />
            </GlossaryWord>
          );
        }

        return <RenderTextWithAnimatedEmojis key={index} text={part} />;
      })}
    </>
  );
};
