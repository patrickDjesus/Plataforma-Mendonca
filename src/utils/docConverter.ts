import type { DefaultBlockSchema, DefaultInlineContentSchema, DefaultStyleSchema, PartialBlock, StyledText } from '@blocknote/core';
import type { DocSection } from '../data/disciplinesData';

export type PartialBlocks = PartialBlock<DefaultBlockSchema, DefaultInlineContentSchema, DefaultStyleSchema>[];

const inlineOf = (s: DocSection, text: string): StyledText<DefaultStyleSchema> => {
  const styles: Record<string, any> = {};
  if (s.isBold) styles.bold = true;
  if (s.isItalic) styles.italic = true;
  if (s.isUnderline) styles.underline = true;
  if (s.isStrikethrough) styles.strike = true;
  if (s.textColor) styles.textColor = s.textColor;
  if (s.highlightColor) styles.backgroundColor = s.highlightColor;
  return { type: 'text', text: text || '', styles };
};

const contentOf = (s: DocSection): any => {
  if (Array.isArray(s.inlineContent) && s.inlineContent.length > 0) {
    return s.inlineContent;
  }
  const text = s.heading || s.content || s.callout || s.formula || '';
  if (!text) return [];
  return [inlineOf(s, text)];
};

const mapAlign = (align?: DocSection['align']) =>
  align === 'center' || align === 'right' || align === 'justify' ? align : 'left';

const mapBackground = (s: DocSection): 'default' | 'gray' | 'brown' | 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink' => {
  if (s.type === 'callout') {
    if (s.calloutType === 'warning' || s.calloutType === 'success') return 'yellow';
    if (s.calloutType === 'focus') return 'blue';
    return 'yellow';
  }
  return 'default';
};

// Converte uma lista de DocSection para blocos BlockNote, preservando estrutura,
// tipos nativos e formatação inline básica.
export const sectionsToBlocks = (sections: DocSection[]): PartialBlocks => {
  const blocks: PartialBlocks = [];

  for (const s of sections) {
    const base: PartialBlock<DefaultBlockSchema, DefaultInlineContentSchema, DefaultStyleSchema> = {
      id: s.id,
      props: {} as any,
    };

    switch (s.type) {
      case 'h1':
      case 'h2':
      case 'h3': {
        const level = s.type === 'h1' ? 1 : s.type === 'h2' ? 2 : 3;
        base.type = 'heading';
        base.props = { level, textAlignment: mapAlign(s.align) } as any;
        base.content = contentOf(s);
        break;
      }
      case 'bullet':
        base.type = 'bulletListItem';
        base.props = { textAlignment: mapAlign(s.align) } as any;
        base.content = contentOf(s);
        break;
      case 'numbered':
        base.type = 'numberedListItem';
        base.props = { start: 1, textAlignment: mapAlign(s.align) } as any;
        base.content = contentOf(s);
        break;
      case 'todo':
        base.type = 'checkListItem';
        base.props = { checked: !!s.checked } as any;
        base.content = contentOf(s);
        break;
      case 'quote':
        base.type = 'quote';
        base.props = {} as any;
        base.content = contentOf(s);
        break;
      case 'code':
        base.type = 'codeBlock';
        base.props = { language: 'plain text' } as any;
        base.content = contentOf(s);
        break;
      case 'divider':
        base.type = 'divider';
        base.content = [];
        break;
      case 'image':
        base.type = 'image';
        base.props = {
          url: s.imageUrl || '',
          caption: s.imageCaption || '',
          previewWidth: s.imageSize ?? 100,
          textAlignment: mapAlign(s.align),
        } as any;
        break;
      case 'table': {
        const rows = s.tableData || [['', '']];
        base.type = 'table';
        (base as any).content = {
          type: 'tableContent',
          rows: rows.map((rowContent) => ({
            cells: rowContent.map((cell) => ({
              type: 'tableCell',
              content: cell ? [{ type: 'text' as const, text: cell, styles: {} }] : [],
            })),
          })),
        };
        break;
      }
      case 'callout':
        // Callout não é nativo no BlockNote default; preserva como parágrafo
        // com fundo colorido + texto para não perder o conteúdo.
        base.type = 'paragraph';
        base.props = { backgroundColor: mapBackground(s), textAlignment: mapAlign(s.align) } as any;
        base.content = contentOf(s);
        break;
      default:
        base.type = 'paragraph';
        base.props = { textAlignment: mapAlign(s.align), backgroundColor: 'default' } as any;
        base.content = contentOf(s);
    }

    blocks.push(base);
  }

  return blocks;
};

const textOfInline = (content: any): string => {
  if (!content) return '';
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content.map((c: any) => {
      if (typeof c === 'string') return c;
      if (c && c.type === 'text') return c.text ?? '';
      if (c && c.type === 'link' && Array.isArray(c.content)) {
        return c.content.map((x: any) => x?.text ?? '').join('');
      }
      return '';
    }).join('');
  }
  if (content && content.type === 'tableContent') return '';
  return '';
};

const alignOf = (props: any): DocSection['align'] =>
  props?.textAlignment === 'center' || props?.textAlignment === 'right' || props?.textAlignment === 'justify'
    ? (props.textAlignment as DocSection['align'])
    : 'left';

// Extrai os estilos inline do PRIMEIRO nó de texto com estilos do bloco
// (incluindo o conteúdo de links aninhados). O modelo DocSection tem um único
// conjunto de estilos por seção, então usamos o nó mais representativo.
const inlineStylesOf = (content: any): Record<string, any> => {
  if (!content) return {};
  if (Array.isArray(content)) {
    for (const c of content) {
      if (!c || typeof c !== 'object') continue;
      if (c.styles && typeof c.styles === 'object' && Object.keys(c.styles).length > 0) {
        return c.styles;
      }
      if (c.type === 'link' && Array.isArray(c.content)) {
        const nested = inlineStylesOf(c.content);
        if (Object.keys(nested).length > 0) return nested;
      }
    }
    return {};
  }
  if (typeof content === 'object' && content.styles && typeof content.styles === 'object') {
    return content.styles;
  }
  return {};
};

// Aplica os estilos inline (cor, highlight, negrito, itálico, etc.) na DocSection,
// preservando também o backgroundColor de bloco quando não vier dos estilos inline.
const applyInlineStyles = (section: DocSection, content: any, props: Record<string, any>): DocSection => {
  const styles = inlineStylesOf(content);
  if (styles.bold) section.isBold = true;
  if (styles.italic) section.isItalic = true;
  if (styles.underline) section.isUnderline = true;
  if (styles.strike || styles.strikethrough) section.isStrikethrough = true;
  if (styles.textColor) section.textColor = styles.textColor;
  if (styles.backgroundColor) section.highlightColor = styles.backgroundColor;
  if (!section.highlightColor && props?.backgroundColor && props.backgroundColor !== 'default') {
    section.highlightColor = props.backgroundColor;
  }
  return section;
};

// Converte um bloco BlockNote em DocSection + seus filhos aninhados,
// preservando TODO o conteúdo (listas aninhadas via Tab, toggles etc.).
const sectionFromBlock = (b: PartialBlocks[number]): DocSection | null => {
  const type = b.type;
  if (!type) return null;
  const text = textOfInline(b.content);
  const props = (b.props || {}) as Record<string, any>;
  const id = typeof b.id === 'string' ? b.id : `s-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const base: DocSection = {
    id,
    heading: '',
    content: text,
    align: alignOf(props),
    inlineContent: Array.isArray(b.content) ? b.content : undefined,
    blockProps: Object.keys(props).length > 0 ? props : undefined,
  };

  applyInlineStyles(base, b.content, props);

  switch (type) {
    case 'heading': {
      const level = props.level;
      base.type = level === 1 ? 'h1' : level === 2 ? 'h2' : 'h3';
      base.fontSize = level === 1 ? '3xl' : level === 2 ? '2xl' : 'xl';
      base.heading = text;
      base.content = text;
      break;
    }
    case 'bulletListItem':
      base.type = 'bullet';
      break;
    case 'numberedListItem':
      base.type = 'numbered';
      break;
    case 'checkListItem':
      base.type = 'todo';
      base.checked = !!props.checked;
      break;
    case 'quote':
      base.type = 'quote';
      break;
    case 'codeBlock':
      base.type = 'code';
      base.formula = text;
      break;
    case 'image':
      base.type = 'image';
      base.imageUrl = props.url || '';
      base.imageCaption = props.caption || '';
      base.imageSize = props.previewWidth ?? 100;
      break;
    case 'table': {
      base.type = 'table';
      const content = b.content as any;
      if (content && content.type === 'tableContent' && Array.isArray(content.rows)) {
        base.tableData = content.rows.map((row: any) =>
          Array.isArray(row?.cells) ? row.cells.map((cell: any) => textOfInline(cell?.content)) : []
        );
      } else {
        base.tableData = [['', '']];
      }
      break;
    }
    case 'divider':
      base.type = 'divider';
      base.content = '';
      break;
    default:
      base.type = 'paragraph';
  }

  return base;
};

// Converte blocos BlockNote de volta para DocSection, preservando o que for
// possível no formato nativo de armazenamento da aplicação. Percorre também os
// `children` (sub-itens de listas criados com Tab, toggles etc.), pois antes
// eles eram IGNORADOS e todo o conteúdo aninhado era perdido ao salvar.
export const blocksToSections = (blocks: PartialBlocks): DocSection[] => {
  const sections: DocSection[] = [];

  const appendBlock = (b: PartialBlocks[number]) => {
    const section = sectionFromBlock(b);
    if (section) sections.push(section);
    const children = (b as any)?.children;
    if (Array.isArray(children) && children.length > 0) {
      for (const child of children) appendBlock(child);
    }
  };

  for (const b of blocks) appendBlock(b);

  return sections;
};

// Conta palavras considerando todos os campos de texto relevantes do section.
export const countWordsOfSections = (sections: DocSection[]): number =>
  sections.reduce((acc, s) => {
    const parts = [s.content, s.heading, s.formula, s.callout, s.imageCaption]
      .filter(Boolean) as string[];
    let words = parts.join(' ').split(/\s+/).filter(Boolean).length;
    if (s.tableData) {
      for (const row of s.tableData) {
        for (const cell of row) {
          if (cell.trim()) words += cell.trim().split(/\s+/).filter(Boolean).length;
        }
      }
    }
    return acc + words;
  }, 0);

// Converte o conteúdo de um documento (sections) em texto simples para cópia.
export const sectionsToText = (sections: DocSection[]): string =>
  sections
    .map((s) => {
      if (s.type === 'h1' || s.type === 'h2' || s.type === 'h3') {
        return `${s.heading || s.content}\n`;
      }
      if (s.type === 'divider') return '---';
      if (s.type === 'table' && s.tableData) {
        return s.tableData.map((row) => row.join(' | ')).join('\n');
      }
      if (s.type === 'image' && s.imageUrl) return `[Imagem: ${s.imageCaption || s.imageUrl}]`;
      return s.content || '';
    })
    .filter(Boolean)
    .join('\n');
