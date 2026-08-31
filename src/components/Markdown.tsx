import React from 'react';

const INLINE_RE =
  /(`[^`]+`)|(\*\*[^*\n]+\*\*|__[^_\n]+__)|(\*[^*\n]+\*)|(~~[^~\n]+~~)|\[([^\]]+)\]\(([^)\s<>]+)\)/g;

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let key = 0;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  INLINE_RE.lastIndex = 0;
  while ((match = INLINE_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const k = `${keyPrefix}-${key++}`;

    if (match[1]) {
      nodes.push(
        <code
          key={k}
          className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/80 text-[0.92em] font-mono text-rose-600 dark:text-rose-300"
        >
          {match[1].slice(1, -1)}
        </code>
      );
    } else if (match[2]) {
      nodes.push(<strong key={k}>{renderInline(match[2].slice(2, -2), k)}</strong>);
    } else if (match[3]) {
      nodes.push(<em key={k}>{renderInline(match[3].slice(1, -1), k)}</em>);
    } else if (match[4]) {
      nodes.push(<del key={k}>{renderInline(match[4].slice(2, -2), k)}</del>);
    } else if (match[5] !== undefined && match[6]) {
      nodes.push(
        <a
          key={k}
          href={match[6]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 underline underline-offset-2 decoration-blue-400/50 hover:decoration-blue-600"
        >
          {match[5]}
        </a>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

const isBlockStart = (line: string): boolean => {
  const trimmed = line.trim();
  return (
    /^\s*$/.test(line) ||
    /^```/.test(line) ||
    /^(#{1,6})\s/.test(line) ||
    /^\s*>/.test(line) ||
    /^(-{3,}|\*{3,}|_{3,})$/.test(trimmed) ||
    /^\s*([-*+])\s+/.test(line) ||
    /^\s*\d+[.)]\s+/.test(line)
  );
};

const LIST_MARKER_RE = /^\s*([-*+])\s+(.*)$/;
const ORDERED_MARKER_RE = /^\s*\d+[.)]\s+(.*)$/;

const HEADING_CLASSES: Record<number, string> = {
  1: 'text-xl font-extrabold mt-1 mb-1',
  2: 'text-lg font-extrabold mt-1 mb-1',
  3: 'text-base font-bold mt-1 mb-0.5',
  4: 'text-sm font-bold mt-1 mb-0.5',
  5: 'text-xs font-bold mt-1 mb-0.5 uppercase tracking-wide',
  6: 'text-xs font-semibold mt-1 mb-0.5 uppercase tracking-wide opacity-80',
};

function renderBlocks(content: string, keyPrefix: string): React.ReactNode[] {
  const lines = content.replace(/\r\n?/g, '\n').split('\n');
  const blocks: React.ReactNode[] = [];
  let blockKey = 0;
  let i = 0;
  const n = lines.length;

  while (i < n) {
    const line = lines[i];
    if (/^\s*$/.test(line)) {
      i++;
      continue;
    }

    const k = `${keyPrefix}-b${blockKey++}`;

    if (/^```/.test(line)) {
      const codeLines: string[] = [];
      i++;
      while (i < n && !/^```/.test(lines[i])) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < n) i++;
      blocks.push(
        <pre
          key={k}
          className="my-1.5 p-3 rounded-xl bg-slate-900 dark:bg-slate-950 text-emerald-100 text-[11px] leading-relaxed overflow-x-auto border border-slate-200 dark:border-slate-700"
        >
          <code>{codeLines.join('\n')}</code>
        </pre>
      );
      continue;
    }

    const headingMatch = /^(#{1,6})\s+(.*)$/.exec(line);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const Tag = (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const)[level - 1] as React.ElementType;
      blocks.push(
        <Tag key={k} className={HEADING_CLASSES[level]}>
          {renderInline(headingMatch[2], k)}
        </Tag>
      );
      i++;
      continue;
    }

    const trimmed = line.trim();
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      blocks.push(
        <hr key={k} className="my-2 border-t border-slate-200 dark:border-slate-700" />
      );
      i++;
      continue;
    }

    if (/^\s*>/.test(line)) {
      const quoteLines: string[] = [];
      while (i < n && /^\s*>/.test(lines[i])) {
        quoteLines.push(lines[i].replace(/^\s*>\s?/, ''));
        i++;
      }
      blocks.push(
        <blockquote
          key={k}
          className="my-1.5 pl-3 border-l-2 border-blue-400 dark:border-blue-500 text-slate-600 dark:text-slate-300 italic"
        >
          {renderInline(quoteLines.join('\n'), k)}
        </blockquote>
      );
      continue;
    }

    const listMatch = LIST_MARKER_RE.exec(line);
    if (listMatch) {
      const items: string[] = [];
      if (listMatch[2]) items.push(listMatch[2]);
      i++;
      while (i < n) {
        if (/^\s*$/.test(lines[i])) {
          i++;
          continue;
        }
        const m = LIST_MARKER_RE.exec(lines[i]);
        if (m) {
          if (m[2]) items.push(m[2]);
          i++;
        } else {
          break;
        }
      }
      blocks.push(
        <ul key={k} className="list-disc pl-4 my-1 space-y-0.5">
          {items.map((item, j) => (
            <li key={`${k}-${j}`}>{renderInline(item, `${k}-${j}`)}</li>
          ))}
        </ul>
      );
      continue;
    }

    const orderedMatch = ORDERED_MARKER_RE.exec(line);
    if (orderedMatch) {
      const items: string[] = [];
      if (orderedMatch[1]) items.push(orderedMatch[1]);
      i++;
      while (i < n) {
        if (/^\s*$/.test(lines[i])) {
          i++;
          continue;
        }
        const m = ORDERED_MARKER_RE.exec(lines[i]);
        if (m) {
          if (m[1]) items.push(m[1]);
          i++;
        } else {
          break;
        }
      }
      blocks.push(
        <ol key={k} className="list-decimal pl-4 my-1 space-y-0.5">
          {items.map((item, j) => (
            <li key={`${k}-${j}`}>{renderInline(item, `${k}-${j}`)}</li>
          ))}
        </ol>
      );
      continue;
    }

    const paraLines: string[] = [];
    while (i < n && !isBlockStart(lines[i])) {
      if (lines[i].trim()) paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      const paraChildren: React.ReactNode[] = [];
      paraLines.forEach((pl, j) => {
        if (j > 0) paraChildren.push(<br key={`${k}-br-${j}`} />);
        paraChildren.push(...renderInline(pl, `${k}-${j}`));
      });
      blocks.push(<p key={k}>{paraChildren}</p>);
    }
  }

  return blocks;
}

interface MarkdownProps {
  content: string;
  className?: string;
}

export const Markdown: React.FC<MarkdownProps> = ({ content, className }) => {
  return <div className={className}>{renderBlocks(content || '', 'md')}</div>;
};