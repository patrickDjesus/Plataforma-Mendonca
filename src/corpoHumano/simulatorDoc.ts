import { NotebookDoc } from '../data/disciplinesData';

/**
 * Identificador reservado do card do simulador interativo dentro do Caderno.
 * Quando um documento com este id é aberto, o Caderno renderiza o simulador
 * de Corpo Humano / Citologia em vez do editor de texto.
 */
export const SIMULATOR_DOC_ID = 'simulador-corpo-humano-interativo';

export const simulatorDoc: NotebookDoc = {
  id: SIMULATOR_DOC_ID,
  title: '🔬 Simulador: Corpo Humano & Célula',
  disciplineId: 'biologia',
  lastEdited: 'Sempre atualizado',
  createdAt: '2026',
  author: 'Plataforma Mendonça',
  tags: ['simulador', 'interativo', 'citologia', 'fisiologia', 'ENEM'],
  summary:
    'Simulador interativo do corpo humano e da célula eucariótica, com citologia e fisiologia focadas no ENEM, explicações detalhadas por estrutura e questões comentadas.',
  sections: [],
  wordCount: 0,
  readTime: 'Interativo',
  isPublic: true,
  starred: true,
};
