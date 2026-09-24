import React, { useMemo } from 'react';
import katex from 'katex';

interface LatexRendererProps {
  content: string;
  className?: string;
  glossaryTerms?: Record<string, unknown>;
  onTermClick?: (term: string) => void;
}

// Renderiza formatação inline markdown (negrito **...**, itálico *...*, código `...`)
// e conecta termos do glossário clicáveis.
const renderRichInlineText = (
  text: string,
  glossaryTerms?: Record<string, unknown>,
  onTermClick?: (term: string) => void,
  keyPrefix = 'rich'
): React.ReactNode[] => {
  if (!text) return [];

  // Regex para capturar:
  // 1. **negrito** ou <b>negrito</b>
  // 2. *itálico* ou <i>itálico</i>
  // 3. `código`
  const styleRegex = /(\*\*[^*]+\*\*|<b>[\s\S]*?<\/b>|\*[^*]+\*|<i>[\s\S]*?<\/i>|`[^`]+`)/g;
  const nodes: React.ReactNode[] = [];
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = styleRegex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      const before = text.substring(lastIdx, match.index);
      nodes.push(
        <TextWithGlossaryLinks
          key={`${keyPrefix}-plain-${lastIdx}`}
          text={before}
          glossaryTerms={glossaryTerms}
          onTermClick={onTermClick}
        />
      );
    }

    const token = match[0];
    const matchKey = `${keyPrefix}-styled-${match.index}`;

    if (token.startsWith('**') && token.endsWith('**')) {
      const inner = token.slice(2, -2);
      nodes.push(
        <strong key={matchKey} className="font-bold text-[#1C1917] dark:text-[#FAF9F5]">
          <TextWithGlossaryLinks text={inner} glossaryTerms={glossaryTerms} onTermClick={onTermClick} />
        </strong>
      );
    } else if (token.startsWith('<b>') && token.endsWith('</b>')) {
      const inner = token.slice(3, -4);
      nodes.push(
        <strong key={matchKey} className="font-bold text-[#1C1917] dark:text-[#FAF9F5]">
          <TextWithGlossaryLinks text={inner} glossaryTerms={glossaryTerms} onTermClick={onTermClick} />
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      const inner = token.slice(1, -1);
      nodes.push(
        <em key={matchKey} className="italic text-[#44403C] dark:text-[#D6D3D1]">
          <TextWithGlossaryLinks text={inner} glossaryTerms={glossaryTerms} onTermClick={onTermClick} />
        </em>
      );
    } else if (token.startsWith('<i>') && token.endsWith('</i>')) {
      const inner = token.slice(3, -4);
      nodes.push(
        <em key={matchKey} className="italic text-[#44403C] dark:text-[#D6D3D1]">
          <TextWithGlossaryLinks text={inner} glossaryTerms={glossaryTerms} onTermClick={onTermClick} />
        </em>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      const inner = token.slice(1, -1);
      nodes.push(
        <code
          key={matchKey}
          className="px-1.5 py-0.5 rounded-md bg-[#EFECE6] dark:bg-[#27272A] font-mono text-[11px] text-[#2D5A46] dark:text-[#52B788] border border-[#E7E2D9] dark:border-[#3F3F46]"
        >
          {inner}
        </code>
      );
    } else {
      nodes.push(token);
    }

    lastIdx = styleRegex.lastIndex;
  }

  if (lastIdx < text.length) {
    const after = text.substring(lastIdx);
    nodes.push(
      <TextWithGlossaryLinks
        key={`${keyPrefix}-plain-${lastIdx}`}
        text={after}
        glossaryTerms={glossaryTerms}
        onTermClick={onTermClick}
      />
    );
  }

  return nodes;
};

// Divide o texto encontrando blocos de fórmula matemática \( ... \) e preserva espaçamento/parágrafos
export const LatexRenderer: React.FC<LatexRendererProps> = ({
  content,
  className = '',
  glossaryTerms,
  onTermClick,
}) => {
  const renderedContent = useMemo(() => {
    if (!content) return null;

    // Divide por linhas/parágrafos respeitando espaçamento
    const lines = content.split('\n');

    return lines.map((line, lineIdx) => {
      // Linha vazia vira espaçamento entre parágrafos
      if (!line.trim()) {
        return <div key={`empty-${lineIdx}`} className="h-2" />;
      }

      // Procura por fórmulas LaTeX \( ... \)
      const regex = /\\\(([\s\S]*?)\\\)/g;
      const parts: React.ReactNode[] = [];
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = regex.exec(line)) !== null) {
        const textBefore = line.substring(lastIndex, match.index);
        if (textBefore) {
          parts.push(
            ...renderRichInlineText(
              textBefore,
              glossaryTerms,
              onTermClick,
              `l${lineIdx}-b${lastIndex}`
            )
          );
        }

        const formula = match[1];
        let html = '';
        let isError = false;
        try {
          html = katex.renderToString(formula, {
            displayMode: false,
            throwOnError: false,
          });
        } catch {
          isError = true;
        }

        if (!isError && html) {
          parts.push(
            <span
              key={`l${lineIdx}-math-${match.index}`}
              className="inline-block px-1 font-mono text-emerald-800 dark:text-emerald-300"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } else {
          parts.push(<span key={`l${lineIdx}-err-${match.index}`}>{match[0]}</span>);
        }

        lastIndex = regex.lastIndex;
      }

      const remainingText = line.substring(lastIndex);
      if (remainingText) {
        parts.push(
          ...renderRichInlineText(
            remainingText,
            glossaryTerms,
            onTermClick,
            `l${lineIdx}-after-${lastIndex}`
          )
        );
      }

      return (
        <div key={`line-${lineIdx}`} className="mb-1.5 last:mb-0 leading-relaxed">
          {parts}
        </div>
      );
    });
  }, [content, glossaryTerms, onTermClick]);

  return <div className={`select-text ${className}`}>{renderedContent}</div>;
};

// Renderiza texto identificando menções a outros termos do glossário para torná-los clicáveis
interface TextWithGlossaryLinksProps {
  text: string;
  glossaryTerms?: Record<string, unknown>;
  onTermClick?: (term: string) => void;
}

export const TextWithGlossaryLinks: React.FC<TextWithGlossaryLinksProps> = ({
  text,
  glossaryTerms,
  onTermClick,
}) => {
  if (!glossaryTerms || !onTermClick || Object.keys(glossaryTerms).length === 0) {
    return <span>{text}</span>;
  }

  // Prepara termos ordenados por tamanho decrescente
  const termsList = Object.keys(glossaryTerms)
    .filter((k) => k.length >= 3)
    .sort((a, b) => b.length - a.length);

  if (termsList.length === 0) return <span>{text}</span>;

  // Regex para casar termos inteiros com limites de palavras
  const escapedTerms = termsList.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const termRegex = new RegExp(`\\b(${escapedTerms})\\b`, 'giu');

  const nodes: React.ReactNode[] = [];
  let lastIdx = 0;
  let m: RegExpExecArray | null;

  while ((m = termRegex.exec(text)) !== null) {
    if (m.index > lastIdx) {
      nodes.push(text.substring(lastIdx, m.index));
    }
    const matchedWord = m[0];
    nodes.push(
      <button
        key={`term-link-${m.index}`}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onTermClick(matchedWord);
        }}
        className="inline font-medium text-[#2D5A46] dark:text-[#52B788] underline decoration-dotted underline-offset-2 hover:decoration-solid hover:bg-[#EBF3EF]/60 dark:hover:bg-[#15221B]/60 rounded-xs px-0.5 transition-all cursor-pointer"
        title={`Ver termo "${matchedWord}"`}
      >
        {matchedWord}
      </button>
    );
    lastIdx = termRegex.lastIndex;
  }

  if (lastIdx < text.length) {
    nodes.push(text.substring(lastIdx));
  }

  return <span>{nodes}</span>;
};
