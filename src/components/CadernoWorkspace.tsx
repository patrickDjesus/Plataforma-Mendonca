import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ScreenId } from '../types/design';
import { DISCIPLINES, Discipline, NotebookDoc, DocSection, GlossaryDefinition } from '../data/disciplinesData';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useStudyTimer } from '../hooks/useStudyTimer';
import { getUserDocuments, saveDocument, deleteDocument, getPublicDocuments, isJunkTestDoc } from '../services/supabase';
import { 
  Calculator,
  PenTool,
  Zap,
  FlaskConical,
  Dna,
  Landmark,
  Globe,
  Brain,
  Languages,
  GraduationCap,
  Sparkles,
  Search,
  ArrowLeft,
  ArrowUp,
  FileText,
  Clock,
  BookOpen,
  LayoutGrid,
  List,
  ChevronRight,
  Copy,
  Check,
  PenLine,
  Plus,
  Lock,
  Trash2,
  CheckSquare,
  MoreHorizontal,
  Eye,
  BookmarkPlus,
  MousePointer2,
  Smile,
  Play,
  X,
  Folder,
  FolderPlus,
  Palette,
  BookMarked
} from 'lucide-react';
import { CreateDocModal } from './CreateDocModal';
import { AddGlossaryTermModal } from './AddGlossaryTermModal';
import { BlockNoteDocEditor } from './BlockNoteDocEditor';
import { GlossaryDrawer } from './GlossaryDrawer';
import { GlossaryStudyModal } from './GlossaryStudyModal';
import { DocQuiz } from './DocQuiz';
import { EmojiQuickPicker } from './EmojiQuickPicker';
import { countWordsOfSections, sectionsToText } from '../utils/docConverter';
import { CorpoHumanoSimulator } from '../corpoHumano/CorpoHumanoSimulator';
import { SIMULATOR_DOC_ID, simulatorDoc } from '../corpoHumano/simulatorDoc';
import { ScrollFade } from './ScrollFade';

interface CadernoWorkspaceProps {
  onNavigate?: (screen: ScreenId) => void;
}

const RichText: React.FC<{ html?: string; text: string; className?: string }> = ({ html, text, className }) => {
  if (html) {
    return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
  }
  return <span className={className}>{text}</span>;
};

// Cor do grupo: a primeira cor definida pelo usuário entre os documentos do grupo
const getGroupColor = (docs: NotebookDoc[], fallbackColor: string): string => {
  const colored = docs.find(doc => doc.groupColor);
  return colored?.groupColor || fallbackColor;
};

// Divide os documentos em seções por grupo. "Sem grupo" sempre por último, e a
// ordem das seções segue o documento mais recente de cada grupo.
const groupDocs = (docs: NotebookDoc[]): { name: string; docs: NotebookDoc[] }[] => {
  const ts = (d: NotebookDoc) => d.lastEditedTs ?? d.createdAtTs ?? 0;
  const groups = new Map<string, NotebookDoc[]>();
  for (const doc of docs) {
    const g = (doc.group || '').trim() || 'Sem grupo';
    const arr = groups.get(g) ?? [];
    arr.push(doc);
    groups.set(g, arr);
  }
  return Array.from(groups.entries())
    .sort((a, b) => {
      const aNone = a[0] === 'Sem grupo';
      const bNone = b[0] === 'Sem grupo';
      if (aNone !== bNone) return aNone ? 1 : -1;
      const aTs = Math.max(...a[1].map(ts));
      const bTs = Math.max(...b[1].map(ts));
      return bTs - aTs;
    })
    .map(([name, groupMembers]) => ({
      name,
      docs: groupMembers.slice().sort((x, y) => ts(y) - ts(x)),
    }));
};

export const CadernoWorkspace: React.FC<CadernoWorkspaceProps> = ({ onNavigate: _onNavigate }) => {
  const { currentUser } = useAuth();
  const userId = currentUser?.id || null;

  // State for all disciplines (allows adding new docs locally)
  const [allDisciplines, setAllDisciplines] = useState<Discipline[]>(DISCIPLINES);

  // Carrega os documentos do usuario autenticado vindos do Supabase
  useEffect(() => {
    if (!userId) return;
    let active = true;
    (async () => {
      try {
        const docs = await getUserDocuments(userId);
        if (!active) return;
        setAllDisciplines(prev =>
          prev.map(d => {
            const userDocs = docs.filter(doc => doc.disciplineId === d.id);
            if (userDocs.length === 0) return d;

            // Sempre preserva o card do simulador de Biologia na lista,
            // mesmo quando o usuário carrega seus próprios documentos.
            let documents = userDocs.map(doc => ({ ...doc, disciplineId: d.id }));
            if (d.id === 'biologia' && !documents.some(doc => doc.id === SIMULATOR_DOC_ID)) {
              documents = [simulatorDoc, ...documents];
            }

            return {
              ...d,
              docCount: documents.length,
              documents,
            };
          })
        );
      } catch (err) {
        console.warn('Erro ao carregar documentos do Supabase:', err);
      }
    })();
    return () => { active = false; };
  }, [userId]);

  // Navigation State inside Caderno:
  // Level 1: 'disciplines' (Gallery of Subjects)
  // Level 2: 'doc_gallery' (Google Docs-like list for selected discipline)
  // Level 3: 'document_view' (Full reading & editing workspace for selected doc)
  const [selectedDisciplineId, setSelectedDisciplineId] = useState<string | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'enem' | 'faculdade' | 'pessoal'>('all');

  // Documentos públicos da comunidade (somente leitura)
  const [publicDocs, setPublicDocs] = useState<NotebookDoc[]>([]);
  const [selectedPublicDoc, setSelectedPublicDoc] = useState<NotebookDoc | null>(null);

  // Filtro por grupo na galeria + grupo digitado para atribuição em massa
  const [activeGroupFilter, setActiveGroupFilter] = useState<string | null>(null);
  const [bulkGroupInput, setBulkGroupInput] = useState('');

  // Carrega documentos públicos (excluindo os do próprio usuário)
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const docs = await getPublicDocuments(userId || '');
        if (active) setPublicDocs(docs);
      } catch (err) {
        console.warn('Erro ao carregar documentos públicos:', err);
      }
    })();
    return () => { active = false; };
  }, [userId]);

  // Limpa documento público selecionado ao trocar de disciplina
  useEffect(() => {
    setSelectedPublicDoc(null);
    setActiveGroupFilter(null);
  }, [selectedDisciplineId]);

  // Modals & Drawers State
  const [isCreateDocOpen, setIsCreateDocOpen] = useState(false);
  const [docToEdit, setDocToEdit] = useState<NotebookDoc | null>(null);
  const [isAddGlossaryOpen, setIsAddGlossaryOpen] = useState(false);
  const [isGlossaryDrawerOpen, setIsGlossaryDrawerOpen] = useState(false);
  const [isGlossaryStudyOpen, setIsGlossaryStudyOpen] = useState(false);
  const [glossaryHighlightsEnabled, setGlossaryHighlightsEnabled] = useState(true);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [initialGlossaryTerm, setInitialGlossaryTerm] = useState('');
  const [editingGlossaryDef, setEditingGlossaryDef] = useState<GlossaryDefinition | null>(null);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [spellEnabled, setSpellEnabled] = useState(true);
  const [editorEpoch, setEditorEpoch] = useState(0);

  // Search & View Modes
  const [searchQuery, setSearchQuery] = useState('');
  const [galleryViewMode, setGalleryViewMode] = useState<'grid' | 'list'>('grid');

  // Seleção estilo Windows (rubber-band) na galeria de documentos
  const gridRef = useRef<HTMLDivElement>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [dragRect, setDragRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  const [dragLiveIds, setDragLiveIds] = useState<string[]>([]);
  const dragStartRef = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const didDragRef = useRef(false);
  
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const saveDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (saveDebounceRef.current) clearTimeout(saveDebounceRef.current);
    };
  }, []);

  // Smooth Scroll Refs & State
  const galleryContainerRef = useRef<HTMLDivElement>(null);
  const docContainerRef = useRef<HTMLDivElement>(null);
  const disciplineContainerRef = useRef<HTMLDivElement>(null);

  const [galleryScrolled, setGalleryScrolled] = useState(false);
  const [galleryPercent, setGalleryPercent] = useState(0);

  const [docScrolled, setDocScrolled] = useState(false);
  const [docPercent, setDocPercent] = useState(0);

  // Scroll tracking handlers
  const handleGalleryScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const maxScroll = target.scrollHeight - target.clientHeight;
    if (maxScroll > 0) {
      const progress = target.scrollTop / maxScroll;
      setGalleryScrolled(target.scrollTop > 80);
      setGalleryPercent(Math.round(progress * 100));
    } else {
      setGalleryScrolled(false);
      setGalleryPercent(0);
    }
  };

  const handleDocScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const maxScroll = target.scrollHeight - target.clientHeight;
    if (maxScroll > 0) {
      const progress = target.scrollTop / maxScroll;
      setDocScrolled(target.scrollTop > 60);
      setDocPercent(Math.round(progress * 100));
    } else {
      setDocScrolled(false);
      setDocPercent(0);
    }
  };

  // Smooth Scroll Action Handlers
  const handleGalleryScrollToTop = () => {
    galleryContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDocScrollToTop = () => {
    docContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Selected Discipline & Doc
  const selectedDiscipline = allDisciplines.find(d => d.id === selectedDisciplineId);
  const selectedDoc = selectedDiscipline?.documents.find(doc => doc.id === selectedDocId);
  const isSimulatorDoc = selectedDoc?.id === SIMULATOR_DOC_ID;

  // Ref sempre com o doc mais recente (evita regressão de título no autosave debounce)
  const selectedDocRef = useRef(selectedDoc);
  useEffect(() => {
    selectedDocRef.current = selectedDoc;
  }, [selectedDoc]);

  // Contador de tempo ativo de estudo com timer de inatividade de 5min
  useStudyTimer(!!selectedDocId && !isSimulatorDoc, 'Leitura de Documento');

  // Close more menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setIsMoreMenuOpen(false);
    if (isMoreMenuOpen) {
      window.addEventListener('click', handleClickOutside);
    }
    return () => window.removeEventListener('click', handleClickOutside);
  }, [isMoreMenuOpen]);

  // Filter disciplines or documents
  const filteredDisciplines = allDisciplines.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.topics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;
    if (selectedCategory === 'all') return true;
    return d.category === selectedCategory;
  });

  // Timestamp confiável para ordenar (mais recente primeiro). O simulador é
  // sempre fixado no topo da galeria.
  const docSortTs = (doc: NotebookDoc): number =>
    doc.id === SIMULATOR_DOC_ID ? Number.POSITIVE_INFINITY : (doc.lastEditedTs ?? doc.createdAtTs ?? 0);

  const filteredDocs = (selectedDiscipline?.documents || [])
    .filter(doc =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .filter(doc => activeGroupFilter == null || (doc.group || '') === activeGroupFilter)
    .sort((a, b) => docSortTs(b) - docSortTs(a));

  // Grupos disponíveis (sem repetição) nos documentos da disciplina atual
  const availableGroups = Array.from(
    new Set(
      (selectedDiscipline?.documents ?? [])
        .map(d => (d.group || '').trim())
        .filter(Boolean)
    )
  );

  // Divide os documentos em seções por grupo. O simulador fica de fora e é
  // renderizado fixo no topo. A ordem das seções segue o documento mais recente
  // de cada grupo; "Sem grupo" sempre por último.
  const groupedDocs = useMemo(() => {
    const groups = new Map<string, NotebookDoc[]>();
    for (const doc of filteredDocs) {
      if (doc.id === SIMULATOR_DOC_ID) continue;
      const g = (doc.group || '').trim() || 'Sem grupo';
      const arr = groups.get(g) ?? [];
      arr.push(doc);
      groups.set(g, arr);
    }
    return Array.from(groups.entries())
      .sort((a, b) => {
        const aNone = a[0] === 'Sem grupo';
        const bNone = b[0] === 'Sem grupo';
        if (aNone !== bNone) return aNone ? 1 : -1;
        const aTs = Math.max(...a[1].map(docSortTs));
        const bTs = Math.max(...b[1].map(docSortTs));
        return bTs - aTs;
      })
      .map(([name, groupMembers]) => ({
        name,
        docs: groupMembers.slice().sort((x, y) => docSortTs(y) - docSortTs(x)),
      }));
  }, [filteredDocs]);

  const simDoc = filteredDocs.find(doc => doc.id === SIMULATOR_DOC_ID);

  // Documentos públicos da comunidade filtrados pela disciplina selecionada
  const disciplinePublicDocs = useMemo(() => {
    if (!selectedDiscipline) return [];
    return publicDocs.filter(doc => doc.disciplineId === selectedDiscipline.id && !isJunkTestDoc(doc));
  }, [selectedDiscipline, publicDocs]);

  // Glossário compartilhado do grupo de documentos
  const selectedDocIdStr = selectedDoc?.id;
  const selectedDocGroup = (selectedDoc?.group || '').trim().toLowerCase();

  const effectiveGlossary = useMemo(() => {
    if (!selectedDocIdStr || !selectedDiscipline) return {};
    if (!selectedDocGroup) return selectedDoc?.glossary || {};

    const merged: Record<string, GlossaryDefinition> = {};
    (selectedDiscipline.documents || [])
      .filter(doc => (doc.group || '').trim().toLowerCase() === selectedDocGroup)
      .forEach(doc => {
        if (doc.glossary) {
          Object.assign(merged, doc.glossary);
        }
      });
    return merged;
  }, [selectedDocIdStr, selectedDocGroup, selectedDiscipline, selectedDoc]);

  // Públicos também agrupados: grupos aparecem como um card único, com apenas
  // os documentos públicos dentro (o grupo só expõe o que é público).
  const publicGroupedDocs = useMemo(
    () => groupDocs(publicDocs.filter(doc => doc.disciplineId === selectedDisciplineId && !isJunkTestDoc(doc))),
    [publicDocs, selectedDisciplineId]
  );

  // Handlers for Document Creation & Updating
  const handleCreateDocument = (newDoc: NotebookDoc) => {
    if (!selectedDisciplineId) return;

    setAllDisciplines(prev => 
      prev.map(d => {
        if (d.id === selectedDisciplineId) {
          return {
            ...d,
            docCount: d.docCount + 1,
            documents: [newDoc, ...d.documents]
          };
        }
        return d;
      })
    );

    if (userId) {
      saveDocument(userId, { ...newDoc, disciplineId: selectedDisciplineId }).catch(err =>
        console.warn('Erro ao salvar documento no Supabase:', err)
      );
    }

    // Open created doc directly
    setSelectedDocId(newDoc.id);
  };

  // Atualiza informações (título, descrição, tags, privacidade) de documento existente
  const handleEditDocument = (updated: NotebookDoc) => {
    if (!selectedDisciplineId || !selectedDocId || !updated.id) return;
    setSaveStatus('saving');

    const groupName = (updated.group || '').trim();
    const groupColor = updated.groupColor || null;

    setAllDisciplines(prev =>
      prev.map(d => {
        if (d.id === selectedDisciplineId) {
          return {
            ...d,
            documents: d.documents.map(doc => {
              if (doc.id === updated.id) {
                return { ...doc, ...updated, groupColor: groupColor || doc.groupColor, disciplineId: d.id, lastEdited: 'Agora mesmo', lastEditedTs: Date.now() };
              }
              // Propaga a nova cor para os demais documentos do mesmo grupo
              if (groupName && groupColor && (doc.group || '').trim() === groupName && doc.groupColor !== groupColor) {
                return { ...doc, groupColor, lastEdited: 'Agora mesmo', lastEditedTs: Date.now() };
              }
              return doc;
            })
          };
        }
        return d;
      })
    );

    if (userId) {
      const savedDoc = { ...updated, groupColor: groupColor || updated.groupColor, disciplineId: selectedDisciplineId, lastEdited: 'Agora mesmo', lastEditedTs: Date.now() };
      saveDocument(userId, savedDoc).catch(err =>
        console.warn('Erro ao salvar alterações do documento no Supabase:', err)
      );
      // Também propaga a cor do grupo para os outros documentos no Supabase
      if (groupName && groupColor) {
        const others = (selectedDiscipline?.documents ?? [])
          .filter(doc => doc.id !== updated.id && (doc.group || '').trim() === groupName && doc.groupColor !== groupColor);
        others.forEach(doc => saveDocument(userId, { ...doc, groupColor, lastEdited: 'Agora mesmo', lastEditedTs: Date.now() }).catch(err =>
          console.warn('Erro ao propagar cor do grupo no Supabase:', err)
        ));
      }
    }
    setTimeout(() => setSaveStatus('saved'), 400);
    setDocToEdit(null);
  };

  // Toggle Document Sharing Status (Público vs Privado)
  const handleToggleDocVisibility = () => {
    if (!selectedDisciplineId || !selectedDocId || !selectedDoc) return;
    const newPublicState = selectedDoc.isPublic === false ? true : false;

    setAllDisciplines(prev =>
      prev.map(d => {
        if (d.id === selectedDisciplineId) {
          return {
            ...d,
            documents: d.documents.map(doc => {
              if (doc.id === selectedDocId) {
                return { ...doc, isPublic: newPublicState };
              }
              return doc;
            })
          };
        }
        return d;
      })
    );

    if (userId) {
      saveDocument(userId, { ...selectedDoc, isPublic: newPublicState }).catch(err =>
        console.warn('Erro ao salvar visibilidade no Supabase:', err)
      );
    }
  };

  // Handlers for in-place text and section editing
  const handleUpdateDocTitle = (newTitle: string) => {
    if (!selectedDisciplineId || !selectedDocId || !selectedDoc) return;
    setSaveStatus('saving');
    setAllDisciplines(prev =>
      prev.map(d => {
        if (d.id === selectedDisciplineId) {
          return {
            ...d,
            documents: d.documents.map(doc => {
              if (doc.id === selectedDocId) {
                return { ...doc, title: newTitle, lastEdited: 'Agora mesmo', lastEditedTs: Date.now() };
              }
              return doc;
            })
          };
        }
        return d;
      })
    );

    if (userId) {
      saveDocument(userId, { ...selectedDoc, title: newTitle, lastEdited: 'Agora mesmo', lastEditedTs: Date.now() }).catch(err =>
        console.warn('Erro ao salvar documento no Supabase:', err)
      );
    }
    setTimeout(() => setSaveStatus('saved'), 400);
  };

  const handleUpdateSections = (newSections: DocSection[]) => {
    if (!selectedDisciplineId || !selectedDocId || !selectedDoc) return;
    setSaveStatus('saving');

    const wordCount = countWordsOfSections(newSections);
    const readTime = `${Math.max(1, Math.ceil(wordCount / 120))} min`;

    setAllDisciplines(prev =>
      prev.map(d => {
        if (d.id === selectedDisciplineId) {
          return {
            ...d,
            documents: d.documents.map(doc => {
              if (doc.id === selectedDocId) {
                return {
                  ...doc,
                  lastEdited: 'Agora mesmo',
                  lastEditedTs: Date.now(),
                  sections: newSections,
                  wordCount,
                  readTime
                };
              }
              return doc;
            })
          };
        }
        return d;
      })
    );

    if (userId) {
      if (saveDebounceRef.current) clearTimeout(saveDebounceRef.current);
      saveDebounceRef.current = setTimeout(() => {
        saveDocument(userId, { ...selectedDocRef.current, sections: newSections, wordCount, lastEdited: 'Agora mesmo', lastEditedTs: Date.now() }).catch(err =>
          console.warn('Erro ao salvar documento no Supabase:', err)
        );
      }, 500);
    }
    setTimeout(() => setSaveStatus('saved'), 400);
  };

  const handleInsertEmojiIntoDoc = (emoji: string) => {
    if (!selectedDoc) return;
    const currentSections = selectedDoc.sections || [];
    if (currentSections.length === 0) {
      handleUpdateSections([
        {
          id: `sec-${Date.now()}`,
          type: 'paragraph',
          content: emoji,
          contentHtml: emoji,
          heading: ''
        }
      ]);
    } else {
      const lastIndex = currentSections.length - 1;
      const lastSection = currentSections[lastIndex];
      const updated = [...currentSections];
      const newContent = `${lastSection.content || ''} ${emoji}`.trim();
      const newHtml = `${lastSection.contentHtml || lastSection.content || ''}&nbsp;${emoji}`.trim();
      updated[lastIndex] = {
        ...lastSection,
        content: newContent,
        contentHtml: newHtml
      };
      handleUpdateSections(updated);
    }
    setEditorEpoch((v) => v + 1);
  };

  const handleDeleteCurrentDoc = () => {
    if (!selectedDisciplineId || !selectedDocId) return;
    if (saveDebounceRef.current) {
      clearTimeout(saveDebounceRef.current);
      saveDebounceRef.current = null;
    }
    setAllDisciplines(prev =>
      prev.map(d => {
        if (d.id === selectedDisciplineId) {
          return {
            ...d,
            docCount: Math.max(0, d.docCount - 1),
            documents: d.documents.filter(doc => doc.id !== selectedDocId)
          };
        }
        return d;
      })
    );

    if (userId) {
      deleteDocument(userId, selectedDocId).catch(err =>
        console.warn('Erro ao deletar documento no Supabase:', err)
      );
    }
    setSelectedDocId(null);
  };

  // --- Seleção em lote estilo Windows (rubber-band) ---
  const selectedDocs = (selectedDiscipline?.documents || []).filter(doc => selectedDocIds.includes(doc.id));
  const isSelected = (id: string) => selectedDocIds.includes(id) || dragLiveIds.includes(id);

  const rectsIntersect = (a: DOMRect, b: DOMRect) =>
    a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

  const toggleSelect = (id: string) => {
    setSelectedDocIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const onGridMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    didDragRef.current = false;
    dragStartRef.current = { x: e.clientX, y: e.clientY, moved: false };
    document.body.style.userSelect = 'none';
  };

  const onGridMouseMove = (e: React.MouseEvent) => {
    const start = dragStartRef.current;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (!start.moved && Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
    start.moved = true;
    didDragRef.current = true;

    const left = Math.min(start.x, e.clientX);
    const top = Math.min(start.y, e.clientY);
    const rect = new DOMRect(left, top, Math.abs(dx), Math.abs(dy));
    setDragRect({ left, top, width: Math.abs(dx), height: Math.abs(dy) });

    if (gridRef.current) {
      const live: string[] = [];
      gridRef.current.querySelectorAll('[data-doc-card]').forEach(card => {
        const cr = card.getBoundingClientRect();
        if (rectsIntersect(rect, cr)) {
          const id = card.getAttribute('data-doc-card');
          if (id) live.push(id);
        }
      });
      setDragLiveIds(live);
    }
  };

  const onGridMouseUp = () => {
    const hadDrag = dragStartRef.current?.moved ?? false;
    dragStartRef.current = null;
    document.body.style.userSelect = '';
    if (dragRect) {
      setSelectedDocIds(prev => {
        const merged = [...prev];
        dragLiveIds.forEach(id => { if (!merged.includes(id)) merged.push(id); });
        return merged;
      });
    }
    setDragRect(null);
    setDragLiveIds([]);
    if (hadDrag && !selectionMode) setSelectionMode(true);
  };

  const handleClearSelection = () => {
    setSelectedDocIds([]);
    setSelectionMode(false);
  };

  const handleSelectAllVisible = () => {
    setSelectedDocIds(filteredDocs.map(d => d.id));
    setSelectionMode(true);
  };

  const handleBulkDelete = () => {
    if (!selectedDisciplineId || selectedDocIds.length === 0) return;
    const ids = new Set<string>(selectedDocIds.filter(id => id !== SIMULATOR_DOC_ID));
    if (ids.size === 0) { handleClearSelection(); return; }
    setAllDisciplines(prev => prev.map(d => {
      if (d.id === selectedDisciplineId) {
        const removed = d.documents.filter(doc => ids.has(doc.id)).length;
        return {
          ...d,
          docCount: Math.max(0, d.docCount - removed),
          documents: d.documents.filter(doc => !ids.has(doc.id))
        };
      }
      return d;
    }));
    if (userId) {
      ids.forEach(id => deleteDocument(userId, id).catch(err =>
        console.warn('Erro ao deletar documento no Supabase:', err)));
    }
    handleClearSelection();
  };

  const handleBulkVisibility = () => {
    if (!selectedDisciplineId || selectedDocs.length === 0) return;
    // Sempre ignora o simulador: ele é um card local e não deve ser persistido no Supabase.
    const targetDocs = selectedDocs.filter(doc => doc.id !== SIMULATOR_DOC_ID);
    if (targetDocs.length === 0) return;
    const newPublic = targetDocs.some(doc => doc.isPublic !== false) ? false : true;
    const ids = new Set(selectedDocIds.filter(id => id !== SIMULATOR_DOC_ID));
    setAllDisciplines(prev => prev.map(d => {
      if (d.id === selectedDisciplineId) {
        return {
          ...d,
          documents: d.documents.map(doc => ids.has(doc.id) ? { ...doc, isPublic: newPublic } : doc)
        };
      }
      return d;
    }));
    if (userId) {
      targetDocs.forEach(doc => saveDocument(userId, { ...doc, isPublic: newPublic }).catch(err =>
        console.warn('Erro ao salvar visibilidade no Supabase:', err)));
    }
  };

  // Move os documentos selecionados para um grupo (cria o grupo se necessário)
  const handleBulkAssignGroup = () => {
    if (!selectedDisciplineId || selectedDocIds.length === 0) return;
    const groupName = bulkGroupInput.trim();
    if (!groupName) return;
    const ids = new Set(selectedDocIds.filter(id => id !== SIMULATOR_DOC_ID));
    const targetDocs = selectedDocs.filter(doc => ids.has(doc.id));
    if (targetDocs.length === 0) return;

    const now = Date.now();
    const groupColor = (selectedDiscipline?.documents ?? [])
      .find(doc => (doc.group || '').trim() === groupName && doc.groupColor)
      ?.groupColor;

    setAllDisciplines(prev => prev.map(d => {
      if (d.id === selectedDisciplineId) {
        return {
          ...d,
          documents: d.documents.map(doc =>
            ids.has(doc.id)
              ? { ...doc, group: groupName, ...(groupColor && { groupColor }), lastEdited: 'Agora mesmo', lastEditedTs: now }
              : doc
          )
        };
      }
      return d;
    }));

    if (userId) {
      targetDocs.forEach(doc => saveDocument(userId, {
        ...doc,
        group: groupName,
        ...(groupColor && { groupColor }),
        lastEdited: 'Agora mesmo',
        lastEditedTs: now
      }).catch(err => console.warn('Erro ao salvar grupo no Supabase:', err)));
    }
    setBulkGroupInput('');
  };

  // Add custom glossary term to current document with scope support:
  // - 'document': only the current document
  // - 'group': all documents in the same group within this discipline
  // - 'global': all documents across this discipline
  const handleAddGlossaryTerm = (
    term: string,
    definition: GlossaryDefinition,
    oldTermKey?: string,
    scope?: 'document' | 'group' | 'global'
  ) => {
    if (!selectedDisciplineId || !selectedDocId || !selectedDoc) return;

    const actualScope = scope || definition.scope || 'document';
    const group = (selectedDoc.group || '').trim();

    const updateDocGlossary = (doc: NotebookDoc): NotebookDoc => {
      const g = { ...(doc.glossary || {}) };
      if (oldTermKey && oldTermKey !== term) {
        delete g[oldTermKey];
      }
      g[term] = { ...definition, scope: actualScope };
      return { ...doc, glossary: g };
    };

    setAllDisciplines(prev =>
      prev.map(d => {
        if (d.id !== selectedDisciplineId) return d;
        return {
          ...d,
          documents: d.documents.map(doc => {
            if (actualScope === 'global') {
              return updateDocGlossary(doc);
            }
            if (actualScope === 'group' && group) {
              return (doc.group || '').trim() === group ? updateDocGlossary(doc) : doc;
            }
            return doc.id === selectedDocId ? updateDocGlossary(doc) : doc;
          })
        };
      })
    );

    if (userId) {
      const affected = (selectedDiscipline?.documents || []).filter(doc => {
        if (actualScope === 'global') return true;
        if (actualScope === 'group' && group) return (doc.group || '').trim() === group;
        return doc.id === selectedDocId;
      });
      affected.forEach(doc => {
        saveDocument(userId, updateDocGlossary(doc)).catch(err =>
          console.warn('Erro ao salvar glossário no Supabase:', err)
        );
      });
    }
  };

  const handleDeleteGlossaryTerm = (term: string, scope?: 'document' | 'group' | 'global') => {
    if (!selectedDisciplineId || !selectedDocId || !selectedDoc) return;
    const group = (selectedDoc.group || '').trim();

    const withoutTerm = (doc: NotebookDoc): NotebookDoc => {
      const g = { ...(doc.glossary || {}) };
      delete g[term];
      return { ...doc, glossary: g };
    };

    setAllDisciplines(prev =>
      prev.map(d => {
        if (d.id !== selectedDisciplineId) return d;
        return {
          ...d,
          documents: d.documents.map(doc => {
            if (scope === 'global') return withoutTerm(doc);
            if (scope === 'group' && group) return (doc.group || '').trim() === group ? withoutTerm(doc) : doc;
            if (!group) return doc.id === selectedDocId ? withoutTerm(doc) : doc;
            const sameGroup = (doc.group || '').trim() === group;
            return sameGroup ? withoutTerm(doc) : doc;
          })
        };
      })
    );

    if (userId) {
      const affected = (selectedDiscipline?.documents || []).filter(doc => {
        if (scope === 'global') return true;
        if (scope === 'group' && group) return (doc.group || '').trim() === group;
        if (doc.id === selectedDocId) return true;
        return group && (doc.group || '').trim() === group;
      });
      affected.forEach(doc => {
        saveDocument(userId, withoutTerm(doc)).catch(err =>
          console.warn('Erro ao remover termo do glossário no Supabase:', err)
        );
      });
    }
  };

  // Copy full document text
  const handleCopyDoc = () => {
    if (!selectedDoc) return;
    const fullText = `${selectedDoc.title}\n\n${selectedDoc.summary}\n\n` +
      sectionsToText(selectedDoc.sections || []);
    
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper icon selector
  const getDisciplineIcon = (iconName: string) => {
    switch (iconName) {
      case 'Calculator': return <Calculator className="w-5 h-5" />;
      case 'Zap': return <Zap className="w-5 h-5" />;
      case 'FlaskConical': return <FlaskConical className="w-5 h-5" />;
      case 'Dna': return <Dna className="w-5 h-5" />;
      case 'Landmark': return <Landmark className="w-5 h-5" />;
      case 'Globe': return <Globe className="w-5 h-5" />;
      case 'Brain': return <Brain className="w-5 h-5" />;
      case 'PenTool': return <PenTool className="w-5 h-5" />;
      case 'Languages': return <Languages className="w-5 h-5" />;
      case 'PenLine': return <PenLine className="w-5 h-5" />;
      case 'GraduationCap': return <GraduationCap className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  // Card da galeria (grade), usado para o simulador fixo e para cada seção de grupo
  const renderDocCard = (doc: NotebookDoc) => {
    const sel = isSelected(doc.id);
    const isSim = doc.id === SIMULATOR_DOC_ID;
    return (
      <motion.div
        key={doc.id}
        data-doc-card={doc.id}
        whileHover={selectionMode ? { scale: 1.02 } : { y: -4, transition: { duration: 0.15 } }}
        onClick={() => {
          if (didDragRef.current) { didDragRef.current = false; return; }
          if (selectionMode) { toggleSelect(doc.id); return; }
          setSelectedDocId(doc.id);
        }}
        className={`group relative rounded-[28px] p-6 border shadow-2xs transition-all flex flex-col justify-between cursor-pointer ${
          isSim
            ? 'bg-gradient-to-br from-emerald-50 to-[#CFE1D6] dark:from-emerald-950/30 dark:to-[#15221B] border-emerald-200 dark:border-emerald-900/60 hover:shadow-xl hover:shadow-emerald-500/15'
            : sel
            ? 'border-[#2D5A46] ring-2 ring-[#2D5A46]/70 dark:ring-[#2D5A46]/60 bg-[#EBF3EF]/60 dark:bg-[#15221B]/40 shadow-lg shadow-[#2D5A46]/20'
            : 'bg-white dark:bg-[#18181B] border-[#E7E2D9] dark:border-[#2C2C30] hover:shadow-xl hover:shadow-[#2D5A46]/10'
        }`}
      >
        {/* Indicador de seleção (canto superior direito) */}
        {selectionMode && (
          <div className={`absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full border-[3px] border-white dark:border-[#18181B] shadow-md flex items-center justify-center z-10 transition-all ${
            sel ? 'bg-[#2D5A46] text-white' : 'bg-white dark:bg-[#18181B] text-[#D6D3D1] dark:text-[#78716C]'
          }`}>
            {sel && <Check className="w-3.5 h-3.5" />}
          </div>
        )}

        <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isSim ? (
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-xl bg-emerald-600 text-white flex items-center gap-1 shadow-md shadow-emerald-500/25">
                <Play className="w-3 h-3" /> Simulador Interativo
              </span>
            ) : (
              <span className="text-xs font-bold px-2.5 py-1 bg-[#EFECE6] dark:bg-[#252529] rounded-xl text-[#44403C] dark:text-[#E7E5E4]">
                {doc.readTime}
              </span>
            )}
          </div>

          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
            isSim
              ? 'bg-[#EBF3EF] dark:bg-[#15221B]/60 text-[#224A38] dark:text-[#52B788]'
              : doc.isPublic !== false
              ? 'bg-[#EBF3EF] dark:bg-[#15221B] text-[#224A38] dark:text-[#52B788]'
              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
          }`}>
            {isSim ? <Sparkles className="w-3 h-3" /> : doc.isPublic !== false ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
            {isSim ? 'Interativo' : doc.isPublic !== false ? 'Público' : 'Privado'}
          </span>
        </div>

        <h3 className={`font-display font-extrabold text-base transition-colors leading-snug ${
          isSim ? 'text-emerald-800 dark:text-emerald-300' : 'text-[#1C1917] dark:text-[#FAF9F5] group-hover:text-[#2D5A46] dark:group-hover:text-[#52B788]'
        }`}>
          {doc.title}
        </h3>

        <p className="text-xs text-[#78716C] dark:text-[#A8A29E] line-clamp-2 leading-relaxed">
          {doc.summary}
        </p>

        {/* Tags */}
        {doc.tags && doc.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {doc.tags.map(t => (
              <span key={t} className={`px-2 py-0.5 rounded-lg text-[10px] font-medium ${
                isSim ? 'bg-white/70 dark:bg-[#18181B]/80 text-emerald-700 dark:text-emerald-300' : 'bg-[#EFECE6] dark:bg-[#252529] text-[#57534E] dark:text-[#A8A29E]'
              }`}>
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className={`pt-4 mt-4 border-t flex items-center justify-between text-[11px] ${
        isSim ? 'border-emerald-200/70 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400' : 'border-[#E7E2D9] dark:border-[#2C2C30] text-[#A8A29E]'
      }`}>
        <span>{doc.lastEdited}</span>
        <span className={`font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1 ${
          isSim ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#2D5A46] dark:text-[#52B788]'
        }`}>
          {selectionMode ? (sel ? 'Selecionado' : 'Selecionar') : isSim ? 'Abrir Simulador' : 'Abrir e Editar'} <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </motion.div>
    );
  };

  // Miniatura de documento dentro do card de um grupo
  const renderDocMini = (doc: NotebookDoc, color: string, readOnly: boolean = false) => {
    const sel = isSelected(doc.id);
    const isSim = doc.id === SIMULATOR_DOC_ID;

    return (
      <motion.div
        key={doc.id}
        data-doc-card={doc.id}
        whileHover={selectionMode ? { scale: 1.02 } : { y: -3, transition: { duration: 0.15 } }}
        onClick={() => {
          if (didDragRef.current) { didDragRef.current = false; return; }
          if (selectionMode) { toggleSelect(doc.id); return; }
          if (readOnly) { setSelectedPublicDoc(doc); return; }
          setSelectedDocId(doc.id);
        }}
        className={`group relative rounded-2xl border p-4 transition-all cursor-pointer flex flex-col justify-between overflow-hidden select-none ${
          sel
            ? 'border-[#2D5A46] ring-2 ring-[#2D5A46]/70 dark:ring-[#2D5A46]/60 bg-[#EBF3EF]/60 dark:bg-[#15221B]/40 shadow-lg shadow-[#2D5A46]/20'
            : 'bg-white dark:bg-[#18181B] border-[#E7E2D9] dark:border-[#2C2C30] hover:shadow-lg hover:shadow-[#2D5A46]/10'
        }`}
      >
        {/* Faixa superior na cor do grupo */}
        <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: color }} />

        {/* Indicador de seleção (canto superior direito) */}
        {selectionMode && (
          <div className={`absolute -top-2 -right-2 w-5 h-5 rounded-full border-[3px] border-white dark:border-[#18181B] shadow-md flex items-center justify-center z-10 ${
            sel ? 'bg-[#2D5A46] text-white' : 'bg-white dark:bg-[#18181B] text-[#D6D3D1] dark:text-[#78716C]'
          }`}>
            {sel && <Check className="w-3 h-3" />}
          </div>
        )}

        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#EFECE6] dark:bg-[#252529] text-[#44403C] dark:text-[#E7E5E4] whitespace-nowrap">
              {isSim ? 'Interativo' : doc.readTime}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 whitespace-nowrap ${
              readOnly
                ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400'
                : isSim
                ? 'bg-[#EBF3EF] dark:bg-[#15221B]/60 text-[#224A38] dark:text-[#52B788]'
                : doc.isPublic !== false
                ? 'bg-[#EBF3EF] dark:bg-[#15221B] text-[#224A38] dark:text-[#52B788]'
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
            }`}>
              {readOnly ? <Eye className="w-2.5 h-2.5" /> : isSim ? <Sparkles className="w-2.5 h-2.5" /> : doc.isPublic !== false ? <Globe className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
              {readOnly ? 'Público' : isSim ? 'Interativo' : doc.isPublic !== false ? 'Público' : 'Privado'}
            </span>
          </div>

          <h4 className="font-display font-extrabold text-sm text-[#1C1917] dark:text-[#FAF9F5] leading-snug line-clamp-2">
            {doc.title}
          </h4>

          <p className="text-[11px] text-[#78716C] dark:text-[#A8A29E] line-clamp-2 leading-relaxed">
            {doc.summary}
          </p>

          {doc.tags && doc.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {doc.tags.slice(0, 3).map(t => (
                <span key={t} className={`px-1.5 py-0.5 rounded-md text-[9px] font-medium ${
                  isSim
                    ? 'bg-white/70 dark:bg-[#232326] text-emerald-700 dark:text-emerald-300'
                    : 'bg-[#EFECE6] dark:bg-[#252529] text-[#57534E] dark:text-[#A8A29E]'
                }`}>
                  #{t}
                </span>
              ))}
              {doc.tags.length > 3 && (
                <span className="text-[9px] text-[#A8A29E] px-1">+{doc.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>

        <div className="pt-3 mt-3 border-t border-[#E7E2D9] dark:border-[#2C2C30] flex items-center justify-between text-[10px] text-[#A8A29E]">
          <span>{doc.lastEdited}</span>
          <span className="font-bold flex items-center gap-0.5" style={{ color: isSim ? undefined : color }}>
            {isSim ? 'Abrir Simulador' : selectionMode ? (sel ? 'Selecionado' : 'Selecionar') : readOnly ? 'Visualizar' : 'Abrir'} <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </motion.div>
    );
  };

  // Card de grupo: título acima, cor definida pelo usuário e miniaturas dos documentos
  const renderGroupCard = (groupName: string, docs: NotebookDoc[], fallbackColor: string, readOnly: boolean = false) => {
    const color = getGroupColor(docs, fallbackColor);
    const publicCount = docs.filter(d => d.isPublic !== false).length;
    const privateCount = docs.length - publicCount;

    return (
      <div
        key={`group-card-${groupName}`}
        className="sm:col-span-2 lg:col-span-3 rounded-[28px] border-2 overflow-hidden transition-all"
        style={{
          borderColor: `${color}66`,
          boxShadow: `0 14px 36px -16px ${color}66`,
        }}
      >
        {/* Cabeçalho do grupo com a cor definida pelo usuário */}
        <div
          className="px-5 sm:px-6 py-4 flex flex-wrap items-center gap-3"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}E6)` }}
        >
          <div className="w-10 h-10 rounded-2xl bg-white/25 backdrop-blur flex items-center justify-center text-white shadow-sm shrink-0">
            <Folder className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-[140px]">
            <h3 className="font-display font-extrabold text-base sm:text-lg text-white leading-tight drop-shadow-sm">
              {groupName}
            </h3>
            <p className="text-[11px] text-white/85 font-medium">
              {docs.length} {docs.length === 1 ? 'documento' : 'documentos'}
              <span className="mx-1.5 opacity-60">•</span>
              {publicCount} {publicCount === 1 ? 'público' : 'públicos'}
              {privateCount > 0 && (
                <>
                  <span className="mx-1.5 opacity-60">•</span>
                  {privateCount} {privateCount === 1 ? 'privado' : 'privados'}
                </>
              )}
            </p>
          </div>
          {readOnly ? (
            <span className="ml-auto text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/20 text-white backdrop-blur flex items-center gap-1">
              <Eye className="w-3 h-3" /> Somente leitura
            </span>
          ) : (
            <span
              className="ml-auto text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/25 text-white backdrop-blur flex items-center gap-1"
              title="Cor escolhida por você para este grupo"
            >
              <Palette className="w-3 h-3" /> Cor do grupo
            </span>
          )}
        </div>

        {/* Miniaturas dos documentos do grupo */}
        <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-white dark:bg-[#18181B]">
          {docs.map(doc => renderDocMini(doc, color, readOnly))}
        </div>
      </div>
    );
  };

  // Card de documento público da comunidade (sem grupo)
  const renderPublicDocCard = (doc: NotebookDoc) => (
    <motion.div
      key={`${doc.id}-${doc.lastEdited}`}
      whileHover={{ y: -4, transition: { duration: 0.15 } }}
      onClick={() => setSelectedPublicDoc(doc)}
      className="group bg-white dark:bg-slate-900 rounded-[28px] p-6 border border-purple-200/60 dark:border-purple-900/40 shadow-2xs hover:shadow-xl hover:shadow-purple-500/10 transition-all cursor-pointer flex flex-col justify-between"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center gap-1">
            <Eye className="w-3 h-3" /> Público
          </span>
          <span className="text-[10px] text-slate-400">Somente leitura</span>
        </div>

        <h4 className="font-display font-extrabold text-base text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors leading-snug line-clamp-2">
          {doc.title}
        </h4>

        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {doc.summary}
        </p>

        {doc.tags && doc.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {doc.tags.slice(0, 4).map(t => (
              <span key={t} className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span>{doc.lastEdited}</span>
        <span className="font-bold text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
          Visualizar <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </motion.div>
  );

  // Linha da galeria (lista)
  const renderDocRow = (doc: NotebookDoc) => {
    const isSim = doc.id === SIMULATOR_DOC_ID;
    return (
      <tr
        key={doc.id}
        onClick={() => setSelectedDocId(doc.id)}
        className={`transition-colors cursor-pointer group ${
          isSim
            ? 'bg-gradient-to-r from-emerald-50 to-[#CFE1D6] dark:from-emerald-950/25 dark:to-[#15221B] hover:bg-emerald-50/90 dark:hover:bg-emerald-950/30'
            : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
        }`}
      >
        <td className="p-4">
          <span className={`font-bold transition-colors ${
            isSim ? 'text-emerald-800 dark:text-emerald-300 group-hover:text-emerald-600' : 'text-[#1C1917] dark:text-white group-hover:text-[#2D5A46]'
          }`}>
            {doc.title}
          </span>
          <p className="text-[11px] text-slate-400 truncate max-w-sm">{doc.summary}</p>
        </td>
        <td className="p-4 hidden sm:table-cell">
          {isSim ? (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center gap-1 w-fit">
              <Sparkles className="w-3 h-3" /> Interativo
            </span>
          ) : (
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
            doc.isPublic !== false ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
          }`}>
            {doc.isPublic !== false ? '🌐 Público' : '🔒 Privado'}
          </span>
          )}
        </td>
        <td className={`p-4 hidden md:table-cell ${isSim ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-500'}`}>{doc.readTime}</td>
        <td className={`p-4 hidden lg:table-cell ${isSim ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'}`}>{doc.lastEdited}</td>
        <td className="p-4 text-right">
          <span className={`font-bold group-hover:underline flex items-center justify-end gap-0.5 ${
            isSim ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#2D5A46] dark:text-[#52B788]'
          }`}>
            {isSim ? 'Abrir Simulador' : 'Abrir'} <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </td>
      </tr>
    );
  };

  return (
    <div className="h-full flex flex-col overflow-hidden relative">
      
      {/* ========================================================================= */}
      {/* NÍVEL 1: GALERIA DE MATÉRIAS (PÁGINA PRINCIPAL DO CADERNO) */}
      {/* ========================================================================= */}
      {!selectedDisciplineId && (
        <div 
          ref={galleryContainerRef}
          onScroll={handleGalleryScroll}
          className="flex-1 overflow-y-auto pb-24 pr-1 space-y-6 scroll-smooth"
        >
          {/* Header da Galeria com Busca Rápida e Filtros de Categoria */}
          <ScrollFade container={galleryContainerRef}>
          <div className="bg-white dark:bg-[#18181B] rounded-[28px] p-6 border border-[#E7E2D9] dark:border-[#2C2C30] shadow-2xs flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#EBF3EF] dark:bg-[#15221B] text-[#2D5A46] dark:text-[#52B788] flex items-center justify-center font-bold">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <h2 className="font-display font-extrabold text-xl sm:text-2xl text-[#1C1917] dark:text-[#FAF9F5]">
                    Caderno Digital Integrado
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-[#78716C] dark:text-[#A8A29E]">
                  Acesse seus cadernos organizados por matérias, resumos de aula e glossário conceitual
                </p>
              </div>

              {/* Barra de Busca de Disciplinas */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-[#A8A29E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar matéria ou tópico..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#FAF8F5] dark:bg-[#232326] border border-[#E7E2D9] dark:border-[#333338] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#1C1917] dark:text-[#FAF9F5] placeholder-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#2D5A46] font-medium"
                />
              </div>
            </div>
          </div>
          </ScrollFade>

          {/* Grid de Cards das Matérias com Animação Fluida Framer Motion Stagger */}
          <ScrollFade container={galleryContainerRef}>
          <motion.div 
            key={selectedCategory + searchQuery}
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.04,
                  delayChildren: 0.02,
                }
              }
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-stretch"
          >
            {filteredDisciplines.map((discipline) => {
              const isHovered = hoveredCardId === discipline.id;
              return (
                <motion.div
                  key={discipline.id}
                  variants={{
                    hidden: { opacity: 0, y: 15, scale: 0.98 },
                    show: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
                    }
                  }}
                  whileHover={{ y: -7, transition: { duration: 0.2, ease: 'easeOut' } }}
                  onMouseEnter={() => setHoveredCardId(discipline.id)}
                  onMouseLeave={() => setHoveredCardId(null)}
                  onClick={() => {
                    setSelectedDisciplineId(discipline.id);
                    setSearchQuery('');
                  }}
                  style={{
                    borderColor: isHovered 
                      ? `${discipline.color}90` 
                      : undefined,
                    boxShadow: isHovered 
                      ? `0 20px 35px -10px ${discipline.color}40, 0 0 0 1.5px ${discipline.color}70` 
                      : undefined,
                  }}
                  className={`group relative rounded-[28px] border transition-colors duration-300 cursor-pointer flex flex-col justify-between overflow-hidden h-full min-h-[380px] select-none ${
                    isHovered
                      ? 'z-20'
                      : 'bg-white dark:bg-[#18181B] border-[#E7E2D9] dark:border-[#2C2C30] shadow-2xs z-0'
                  }`}
                >
                  {/* Fundo dinâmico animado com a cor da disciplina ao passar o mouse */}
                  <div 
                    className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
                    style={{
                      opacity: isHovered ? 1 : 0,
                      background: `linear-gradient(145deg, ${discipline.color}15 0%, ${discipline.color}28 100%)`,
                    }}
                  />
                  {/* Fundo base para dark mode quando em hover */}
                  <div 
                    className="absolute inset-0 bg-white dark:bg-[#18181B] transition-opacity duration-300 pointer-events-none -z-10"
                  />

                  {/* 1. Capa com Imagem de Alta Resolução + Gradient Overlay */}
                  <div className="relative h-40 w-full overflow-hidden bg-slate-900 z-10 shrink-0">
                    <img
                      src={discipline.image}
                      alt={discipline.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    {/* Gradiente de escurecimento para leitura */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/35 to-transparent" />

                    {/* Overlay sutil da cor da matéria na imagem ao passar o mouse */}
                    <div 
                      className="absolute inset-0 transition-opacity duration-300 mix-blend-color"
                      style={{ 
                        backgroundColor: discipline.color, 
                        opacity: isHovered ? 0.35 : 0 
                      }} 
                    />

                    {/* Badges superiores na imagem */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/90 dark:bg-[#18181B]/90 backdrop-blur-md text-[#1C1917] dark:text-[#FAF9F5] shadow-xs">
                        {discipline.category === 'enem' ? 'ENEM' : discipline.category === 'faculdade' ? 'Faculdade' : 'Pessoal'}
                      </span>

                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/10 flex items-center gap-1.5 shadow-xs">
                        <FileText className="w-3 h-3 text-[#52B788]" />
                        {discipline.docCount} {discipline.docCount === 1 ? 'doc' : 'docs'}
                      </span>
                    </div>
                  </div>

                  {/* 2. Ícone Flutuante da Matéria sobreposto à capa */}
                  <div className="px-5 relative z-10 shrink-0">
                    <div 
                      className="w-12 h-12 -mt-6 rounded-2xl flex items-center justify-center text-white shadow-xl border-2 border-white dark:border-[#18181B] z-20 font-bold transition-all duration-300 group-hover:scale-105"
                      style={{ 
                        backgroundColor: discipline.color,
                        boxShadow: isHovered ? `0 8px 20px -4px ${discipline.color}80` : undefined
                      }}
                    >
                      {getDisciplineIcon(discipline.icon)}
                    </div>
                  </div>

                  {/* 3. Conteúdo do Card */}
                  <div className="px-5 pt-3 pb-2 flex-1 flex flex-col justify-between space-y-3 z-10">
                    <div>
                      <h3 
                        className="font-display font-extrabold text-base transition-colors duration-200 leading-tight"
                        style={{
                          color: isHovered ? discipline.color : undefined
                        }}
                      >
                        <span className={isHovered ? '' : 'text-[#1C1917] dark:text-[#FAF9F5]'}>
                          {discipline.name}
                        </span>
                      </h3>
                      <p className="text-xs text-[#78716C] dark:text-[#A8A29E] mt-1.5 line-clamp-2 leading-relaxed font-normal">
                        {discipline.description}
                      </p>
                    </div>

                    {/* Tópicos em Destaque - Altura e padding fixos para nunca alterar dimensões */}
                    {discipline.topics && discipline.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {discipline.topics.slice(0, 3).map((topic) => (
                          <span
                            key={topic}
                            className="px-2 py-0.5 rounded-lg text-[10px] font-medium transition-colors duration-200"
                            style={{
                              backgroundColor: isHovered ? `${discipline.color}25` : undefined,
                              color: isHovered ? discipline.color : undefined,
                            }}
                          >
                            <span className={isHovered ? 'font-semibold' : 'text-[#57534E] dark:text-[#E7E5E4]'}>
                              {topic}
                            </span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 4. Rodapé do Card */}
                  <div 
                    className="px-5 py-3.5 mt-2 border-t border-[#E7E2D9] dark:border-[#2C2C30] transition-colors duration-300 flex items-center justify-between text-xs text-[#A8A29E] z-10 shrink-0"
                    style={{
                      backgroundColor: isHovered ? `${discipline.color}18` : undefined
                    }}
                  >
                    <span className="text-[11px] font-medium">Acessar cadernos</span>
                    <span 
                      className="font-bold flex items-center gap-1 group-hover:translate-x-1.5 transition-all duration-200"
                      style={{
                        color: isHovered ? discipline.color : undefined
                      }}
                    >
                      <span className={isHovered ? '' : 'text-[#2D5A46] dark:text-[#52B788]'}>
                        Abrir
                      </span> 
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
          </ScrollFade>

          {/* Botão Flutuante Futurista de Rolagem Suave ao Topo da Galeria */}
          <AnimatePresence>
            {galleryScrolled && (
              <motion.button
                initial={{ opacity: 0, y: 15, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.8 }}
                onClick={handleGalleryScrollToTop}
                className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/95 dark:bg-[#18181B]/95 backdrop-blur-xl border border-[#E7E2D9] dark:border-[#2C2C30] text-[#44403C] dark:text-[#E7E5E4] shadow-xl hover:shadow-2xl hover:border-[#2D5A46] text-xs font-bold transition-all cursor-pointer group"
              >
                <div className="w-6 h-6 rounded-full bg-[#EBF3EF] dark:bg-[#15221B] text-[#2D5A46] dark:text-[#52B788] flex items-center justify-center group-hover:-translate-y-0.5 transition-transform">
                  <ArrowUp className="w-3.5 h-3.5" />
                </div>
                <span>Voltar ao Topo</span>
                <span className="font-mono text-[10px] text-[#A8A29E] font-normal">({galleryPercent}%)</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ========================================================================= */}
      {/* NÍVEL 2: LISTA DE DOCUMENTOS DA MATÉRIA */}
      {/* ========================================================================= */}
      {selectedDiscipline && !selectedDocId && (
        <div ref={disciplineContainerRef} className="flex-1 overflow-y-auto pb-16 pr-1 space-y-6">
          
          {/* Header da Disciplina */}
          <ScrollFade container={disciplineContainerRef}>
          <div className="bg-white dark:bg-[#18181B] rounded-[28px] p-6 border border-[#E7E2D9] dark:border-[#2C2C30] shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDisciplineId(null)}
                className="w-10 h-10 rounded-2xl bg-[#EFECE6] dark:bg-[#252529] hover:bg-[#E5DFD5] dark:hover:bg-[#333338] flex items-center justify-center text-[#44403C] dark:text-[#E7E5E4] transition-colors cursor-pointer"
                title="Voltar às Matérias"
                aria-label="Voltar às matérias"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>

              <div 
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md font-bold"
                style={{ backgroundColor: selectedDiscipline.color }}
              >
                {getDisciplineIcon(selectedDiscipline.icon)}
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-extrabold text-xl sm:text-2xl text-[#1C1917] dark:text-[#FAF9F5]">
                    {selectedDiscipline.name}
                  </h2>
                </div>
                <p className="text-xs text-[#78716C] dark:text-[#A8A29E]">
                  {selectedDiscipline.documents.length} cadernos e notas salvas
                </p>
              </div>
            </div>

            {/* Ações: Criar Documento + Visualização */}
            <div className="flex items-center gap-3">
              {/* Alternador de Modo de Seleção */}
              <button
                onClick={() => setSelectionMode(m => !m)}
                className={`p-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  selectionMode
                    ? 'bg-[#2D5A46] border-[#2D5A46] text-white shadow-md shadow-[#2D5A46]/25'
                    : 'bg-[#EFECE6] dark:bg-[#252529] border-[#E7E2D9] dark:border-[#333338] text-[#57534E] dark:text-[#E7E5E4] hover:bg-[#E5DFD5] dark:hover:bg-[#333338]'
                }`}
                title="Selecionar múltiplos documentos (arraste para marcar)"
                aria-label="Modo de seleção múltipla"
              >
                <MousePointer2 className="w-4 h-4" />
                <span className="hidden lg:inline">{selectionMode ? 'Sair da Seleção' : 'Selecionar'}</span>
              </button>

              {/* Botão Glossário da Disciplina na Galeria */}
              <button
                onClick={() => setIsGlossaryDrawerOpen(true)}
                className="px-3 py-2 rounded-2xl bg-[#EBF3EF] dark:bg-[#15221B] border border-[#CFE1D6] dark:border-[#22392D] text-[#2D5A46] dark:text-[#52B788] hover:bg-[#2D5A46] hover:text-white dark:hover:bg-[#2D5A46] dark:hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                title="Abrir Glossário Geral da Disciplina"
              >
                <BookMarked className="w-4 h-4" />
                <span className="hidden sm:inline">Glossário</span>
              </button>

              {/* Alternador Grid / Lista */}
              <div className="flex items-center bg-[#EFECE6] dark:bg-[#252529] p-1 rounded-2xl border border-[#E7E2D9] dark:border-[#333338]">
                <button
                  onClick={() => setGalleryViewMode('grid')}
                  className={`p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                    galleryViewMode === 'grid' 
                      ? 'bg-white dark:bg-[#161618] text-[#1C1917] dark:text-white shadow-2xs' 
                      : 'text-[#A8A29E] hover:text-[#44403C]'
                  }`}
                  title="Visualização em Grade"
                  aria-label="Visualização em grade"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setGalleryViewMode('list')}
                  className={`p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                    galleryViewMode === 'list' 
                      ? 'bg-white dark:bg-[#161618] text-[#1C1917] dark:text-white shadow-2xs' 
                      : 'text-[#A8A29E] hover:text-[#44403C]'
                  }`}
                  title="Visualização em Lista"
                  aria-label="Visualização em lista"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Botão Criar Documento */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsCreateDocOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#2D5A46] hover:bg-[#21483A] text-white text-xs font-bold shadow-md shadow-[#2D5A46]/25 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Documento</span>
              </motion.button>
            </div>
          </div>
          </ScrollFade>

          {/* Barra de Filtro de Documentos */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-[#A8A29E] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Filtrar documentos em ${selectedDiscipline.name}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-[#18181B] border border-[#E7E2D9] dark:border-[#2C2C30] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#1C1917] dark:text-[#FAF9F5] placeholder-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#2D5A46] shadow-2xs font-medium"
            />
          </div>

          {/* Filtro por Grupo */}
          {availableGroups.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveGroupFilter(null)}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1 ${
                  activeGroupFilter == null
                    ? 'bg-[#2D5A46] text-white border-[#2D5A46] shadow-sm'
                    : 'bg-white dark:bg-[#18181B] border-[#E7E2D9] dark:border-[#3B3B40] text-[#57534E] dark:text-[#A8A29E] hover:bg-[#EFECE6] dark:hover:bg-[#333338]'
                }`}
              >
                <Folder className="w-3 h-3" />
                Todos os grupos
              </button>
              {availableGroups.map((g) => (
                <button
                  key={g}
                  onClick={() => setActiveGroupFilter(activeGroupFilter === g ? null : g)}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1 ${
                    activeGroupFilter === g
                      ? 'bg-[#2D5A46] text-white border-[#2D5A46] shadow-sm'
                      : 'bg-white dark:bg-[#18181B] border-[#E7E2D9] dark:border-[#3B3B40] text-[#57534E] dark:text-[#A8A29E] hover:bg-[#EFECE6] dark:hover:bg-[#333338]'
                  }`}
                >
                  <Folder className="w-3 h-3" />
                  {g}
                </button>
              ))}
            </div>
          )}

          {/* Barra de Ações em Lote (Modo Seleção) */}
          {selectionMode && selectedDocs.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 px-4 py-3 rounded-2xl bg-[#EBF3EF]/80 dark:bg-[#15221B]/40 border border-[#CFE1D6]/70 dark:border-[#22392D]/60 shadow-sm">
              <span className="text-xs font-bold text-[#224A38] dark:text-[#52B788] flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#2D5A46]" />
                {selectedDocs.length} {selectedDocs.length === 1 ? 'documento selecionado' : 'documentos selecionados'}
              </span>
              <div className="flex items-center gap-2 ml-auto flex-wrap">
                <button
                  onClick={handleBulkVisibility}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#18181B] border border-[#CFE1D6] dark:border-[#22392D] text-[#224A38] dark:text-[#52B788] text-xs font-bold hover:bg-[#EBF3EF] dark:hover:bg-[#252529] transition-colors cursor-pointer"
                  title="Alterar visibilidade dos selecionados"
                >
                  {selectedDocs.some(doc => doc.isPublic !== false) ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                  {selectedDocs.some(doc => doc.isPublic !== false) ? 'Tornar Privados' : 'Tornar Públicos'}
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-500/25 transition-colors cursor-pointer"
                  title="Deletar selecionados"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Deletar ({selectedDocs.length})
                </button>
                <div className="flex items-center gap-1.5 bg-white dark:bg-[#18181B] border border-[#CFE1D6] dark:border-[#22392D] rounded-xl p-1 pl-2.5">
                  <FolderPlus className="w-3.5 h-3.5 text-[#2D5A46] dark:text-[#52B788]" />
                  <input
                    type="text"
                    value={bulkGroupInput}
                    onChange={(e) => setBulkGroupInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleBulkAssignGroup(); } }}
                    placeholder="Novo grupo..."
                    className="w-32 bg-transparent text-xs text-[#1C1917] dark:text-[#FAF9F5] placeholder-[#A8A29E] focus:outline-none"
                  />
                  <button
                    onClick={handleBulkAssignGroup}
                    className="px-2.5 py-1 rounded-lg bg-[#2D5A46] hover:bg-[#21483A] text-white text-[11px] font-bold transition-colors cursor-pointer"
                    title="Mover selecionados para o grupo digitado"
                  >
                    Mover
                  </button>
                </div>
                <button
                  onClick={handleSelectAllVisible}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#18181B] border border-[#E7E2D9] dark:border-[#333338] text-[#57534E] dark:text-[#E7E5E4] text-xs font-bold hover:bg-[#FAF8F5] dark:hover:bg-[#252529] transition-colors cursor-pointer"
                  title="Selecionar todos os documentos visíveis"
                >
                  Selecionar tudo
                </button>
                <button
                  onClick={handleClearSelection}
                  className="p-1.5 rounded-xl text-[#78716C] hover:text-[#44403C] dark:hover:text-[#FAF9F5] hover:bg-[#EFECE6] dark:hover:bg-[#252529] transition-colors cursor-pointer"
                  title="Limpar seleção"
                  aria-label="Limpar seleção"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Grid ou Lista de Documentos, ou Empty State */}
          <ScrollFade container={disciplineContainerRef}>
          {filteredDocs.length === 0 ? (
            <div className="bg-white dark:bg-[#18181B] rounded-[28px] p-12 border border-dashed border-[#D6D3D1] dark:border-[#3B3B40] text-center flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#EBF3EF] dark:bg-[#15221B] text-[#2D5A46] dark:text-[#52B788] flex items-center justify-center">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-1">
                <h3 className="font-display font-extrabold text-base text-[#1C1917] dark:text-[#FAF9F5]">
                  Nenhum caderno salvo em {selectedDiscipline.name}
                </h3>
                <p className="text-xs text-[#78716C] dark:text-[#A8A29E]">
                  {searchQuery 
                    ? `Nenhum documento encontrado com "${searchQuery}".` 
                    : 'Crie seu primeiro resumo, anotação de aula ou material de estudo estruturado.'}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsCreateDocOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#2D5A46] hover:bg-[#21483A] text-white text-xs font-bold shadow-md shadow-[#2D5A46]/25 transition-all cursor-pointer mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>Criar Primeiro Documento</span>
              </motion.button>
            </div>
          ) : galleryViewMode === 'grid' ? (
            <div
              ref={gridRef}
              className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              onMouseDown={onGridMouseDown}
              onMouseMove={onGridMouseMove}
              onMouseUp={onGridMouseUp}
              onMouseLeave={() => { if (dragStartRef.current) onGridMouseUp(); }}
            >
              {simDoc && renderDocCard(simDoc)}
              {groupedDocs.map(({ name, docs }) =>
                name === 'Sem grupo' ? (
                  <React.Fragment key={name}>
                    <div className="sm:col-span-2 lg:col-span-3 flex items-center gap-2 px-1 pt-1 pb-1 select-none">
                      <Folder className="w-4 h-4 text-[#2D5A46] dark:text-[#52B788]" />
                      <span className="font-display font-extrabold text-xs text-[#57534E] dark:text-[#E7E5E4] uppercase tracking-wider leading-none">
                        {name}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EFECE6] dark:bg-[#252529] text-[#A8A29E]">
                        {docs.length} {docs.length === 1 ? 'documento' : 'documentos'}
                      </span>
                    </div>
                    {docs.map(doc => renderDocCard(doc))}
                  </React.Fragment>
                ) : (
                  renderGroupCard(name, docs, selectedDiscipline.color)
                )
              )}

              {/* Quadrado de seleção (rubber-band) */}
              {dragRect && (
                <div
                  className="pointer-events-none fixed z-[60]"
                  style={{
                    left: dragRect.left,
                    top: dragRect.top,
                    width: dragRect.width,
                    height: dragRect.height,
background: 'rgba(45, 90, 70, 0.15)',
                  border: '1.5px solid rgba(45, 90, 70, 0.7)',
                    borderRadius: 6,
                  }}
                />
              )}
            </div>
          ) : (
            /* Lista de Documentos */
            <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase border-b border-slate-200/70 dark:border-slate-800">
                  <tr>
                    <th className="p-4">Título do Documento</th>
                    <th className="p-4 hidden sm:table-cell">Privacidade</th>
                    <th className="p-4 hidden md:table-cell">Tempo de Leitura</th>
                    <th className="p-4 hidden lg:table-cell">Última Edição</th>
                    <th className="p-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {simDoc && renderDocRow(simDoc)}
                  {groupedDocs.map(({ name: groupName, docs }) => (
                    <React.Fragment key={groupName}>
                      <tr>
                        <td colSpan={5} className="px-4 py-2.5 bg-[#EFECE6]/60 dark:bg-[#252529]/40">
                          <span className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#57534E] dark:text-[#E7E5E4] uppercase tracking-wider">
                            <Folder className="w-3.5 h-3.5 text-[#2D5A46] dark:text-[#52B788]" />
                            {groupName}
                            <span className="text-[10px] font-medium normal-case text-[#A8A29E]">
                              {docs.length} {docs.length === 1 ? 'documento' : 'documentos'}
                            </span>
                          </span>
                        </td>
                      </tr>
                      {docs.map(doc => renderDocRow(doc))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Seção de Documentos Públicos da Comunidade (Somente Leitura) */}
          {disciplinePublicDocs.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Globe className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-display font-extrabold text-sm text-slate-900 dark:text-white">
                  Cadernos Públicos da Comunidade
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                  {disciplinePublicDocs.length} disponíveis
                </span>
                <span className="ml-auto text-[10px] text-slate-400 hidden sm:inline">
                  Leitura compartilhada por outros usuários
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {publicGroupedDocs.map(({ name: groupName, docs: groupMembers }) =>
                  groupName === 'Sem grupo'
                    ? groupMembers.map(doc => renderPublicDocCard(doc))
                    : renderGroupCard(groupName, groupMembers, selectedDiscipline.color, true)
                )}
              </div>
            </div>
          )}
          </ScrollFade>
        </div>
      )}

      {/* ========================================================================= */}
      {/* NÍVEL 3: VISUALIZAÇÃO E ESCRITA LIMPA (ESTILO NOTION / WORD, SEM EXCESSO) */}
      {/* ========================================================================= */}
      {selectedDoc && selectedDiscipline && (
        <div className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* Top Bar Minimalista & Limpa (Sem Poluição Visual) */}
          <div className="flex items-center justify-between pb-3 select-none shrink-0 border-b border-slate-100 dark:border-slate-800/80 px-2">
            {/* Lado Esquerdo: Voltar e Breadcrumb */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedDocId(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                title="Voltar aos Documentos"
                aria-label="Voltar aos documentos"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 text-xs">
                <span 
                  onClick={() => { setSelectedDocId(null); setSelectedDisciplineId(null); }} 
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer hidden sm:inline"
                >
                  Caderno
                </span>
                <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">/</span>
                <span 
                  onClick={() => setSelectedDocId(null)} 
                  className="font-medium text-slate-600 dark:text-slate-300 hover:underline cursor-pointer"
                >
                  {selectedDiscipline.name}
                </span>
              </div>
            </div>

            {/* Centro: Indicador Discreto de Salvamento (ou modo simulador) */}
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium hidden md:flex items-center gap-1.5">
              {isSimulatorDoc ? (
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-500" /> Simulador interativo
                </span>
              ) : saveStatus === 'saving' ? (
                <span className="text-amber-500 flex items-center gap-1 animate-pulse">
                  <Clock className="w-3 h-3" /> Salvando alterações...
                </span>
              ) : (
                <span className="text-slate-400 flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-500" /> Salvo na nuvem • {selectedDoc.readTime}
                </span>
              )}
            </div>

            {/* Lado Direito: Ações Discretas (Glossário + Emojis Rápidos + Menu Dropdown ...) */}
            <div className="flex items-center gap-2 relative">
              {/* Botão de Glossário da Disciplina / Documento */}
              {!isSimulatorDoc && (
                <button
                  onClick={() => setIsGlossaryDrawerOpen(true)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isGlossaryDrawerOpen
                      ? 'bg-[#2D5A46] text-white shadow-xs'
                      : 'bg-[#EBF3EF] dark:bg-[#15221B] text-[#2D5A46] dark:text-[#52B788] hover:bg-[#2D5A46] hover:text-white dark:hover:bg-[#2D5A46] dark:hover:text-white'
                  }`}
                  title="Abrir Glossário de Termos e Conceitos"
                >
                  <BookMarked className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Glossário</span>
                </button>
              )}

              {/* Botão de Painel Rápido de Emojis */}
              {!isSimulatorDoc && (
              <div className="relative">
                <button
                  onClick={() => {
                    setIsEmojiPickerOpen(!isEmojiPickerOpen);
                    setIsMoreMenuOpen(false);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isEmojiPickerOpen
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600 dark:hover:text-amber-400'
                  }`}
                  title="Inserir Emojis Temáticos Rápidos"
                >
                  <Smile className="w-3.5 h-3.5 text-amber-500" />
                  <span className="hidden sm:inline">Emojis</span>
                </button>

                {/* Popover de Emojis Rápidos */}
                {isEmojiPickerOpen && (
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-10 z-50 w-72 sm:w-80 animate-in fade-in zoom-in-95 duration-100"
                  >
                    <EmojiQuickPicker
                      onSelectEmoji={(emoji) => {
                        handleInsertEmojiIntoDoc(emoji);
                      }}
                      onClose={() => setIsEmojiPickerOpen(false)}
                    />
                  </div>
                )}
              </div>
              )}

              {/* Menu Mais Opções (...) onde ficam os botões discretos */}
              {!isSimulatorDoc && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMoreMenuOpen(!isMoreMenuOpen);
                  }}
                  className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                  title="Mais Opções da Página"
                  aria-label="Mais opções"
                  aria-expanded={isMoreMenuOpen}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {/* Dropdown Discreto */}
                {isMoreMenuOpen && (
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-10 z-50 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-1.5 text-xs animate-in fade-in zoom-in-95 duration-100"
                  >
                    <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                      Configurações do Documento
                    </div>

                    {/* Editar Informações do Documento */}
                    <button
                      onClick={() => {
                        setDocToEdit(selectedDoc);
                        setIsMoreMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <PenLine className="w-4 h-4 text-[#2D5A46]" />
                      <span>Editar Informações</span>
                    </button>

                    <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                    {/* Alternar Visibilidade */}
                    <button
                      onClick={() => {
                        handleToggleDocVisibility();
                        setIsMoreMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2 font-medium">
                        {selectedDoc.isPublic !== false ? <Globe className="w-4 h-4 text-blue-500" /> : <Lock className="w-4 h-4 text-amber-500" />}
                        Privacidade
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {selectedDoc.isPublic !== false ? 'Público' : 'Privado'}
                      </span>
                    </button>

                    <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                    {/* Copiar Texto */}
                    <button
                      onClick={() => {
                        handleCopyDoc();
                        setIsMoreMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
                      <span>{copied ? 'Copiado!' : 'Copiar Texto Completo'}</span>
                    </button>

                    {/* Glossário e Termos */}
                    <button
                      onClick={() => {
                        setIsGlossaryDrawerOpen(true);
                        setIsMoreMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <BookMarked className="w-4 h-4 text-[#2D5A46]" />
                      <span>Abrir Glossário</span>
                    </button>

                    {/* Adicionar ao Glossário */}
                    <button
                      onClick={() => {
                        setIsAddGlossaryOpen(true);
                        setIsMoreMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <BookmarkPlus className="w-4 h-4 text-purple-500" />
                      <span>Novo Termo no Glossário</span>
                    </button>

                    {/* Modo Estudo Flashcards */}
                    <button
                      onClick={() => {
                        setIsGlossaryStudyOpen(true);
                        setIsMoreMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Praticar Flashcards</span>
                    </button>

                    <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                    {/* Excluir Documento */}
                    <button
                      onClick={() => {
                        handleDeleteCurrentDoc();
                        setIsMoreMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Excluir Documento</span>
                    </button>
                  </div>
                )}
              </div>
              )}
            </div>
          </div>

          {/* Área Principal: Canvas do Documento OU Simulador Interativo */}
          {isSimulatorDoc ? (
            <div className="flex-1 overflow-hidden pt-3">
              <CorpoHumanoSimulator onBack={() => setSelectedDocId(null)} />
            </div>
          ) : (
          <div className="flex-1 flex gap-4 overflow-hidden pt-3">
            
            {/* FOLHA DE ESCRITA LIMPA (CANVAS NOTION / WORD COM AUTO-WRAP E CONTADOR) */}
            <div 
              ref={docContainerRef}
              onScroll={handleDocScroll}
              className="flex-1 overflow-y-auto pr-1 scroll-smooth"
            >
              <div className="flex flex-col items-center gap-4 pb-28">
                <BlockNoteDocEditor
                  key={`${selectedDoc.id}:${editorEpoch}`}
                  doc={selectedDoc}
                  spellEnabled={spellEnabled}
                  disciplineName={selectedDiscipline.name}
                  onToggleSpell={() => setSpellEnabled(v => !v)}
                  highlightsEnabled={glossaryHighlightsEnabled}
                  onToggleHighlights={() => setGlossaryHighlightsEnabled(v => !v)}
                  onOpenGlossaryDrawer={() => setIsGlossaryDrawerOpen(true)}
                  onCustomizeGlobal={(def) => {
                    setInitialGlossaryTerm(def.term);
                    setEditingGlossaryDef(def);
                    setIsAddGlossaryOpen(true);
                  }}
                  onShareGlossaryTerm={(term, scope) => {
                    const currentDef = selectedDoc.glossary?.[term] || selectedDoc.glossary?.[term.toLowerCase()];
                    if (currentDef) {
                      handleAddGlossaryTerm(term, currentDef, term, scope);
                    }
                  }}
                  onUpdateTitle={handleUpdateDocTitle}
                  onUpdateSections={handleUpdateSections}
                  onDefineGlossary={(term) => {
                    setInitialGlossaryTerm(term);
                    setEditingGlossaryDef(null);
                    setIsAddGlossaryOpen(true);
                  }}
                  onExit={() => setSelectedDocId(null)}
                  glossary={effectiveGlossary}
                />
              </div>

              {/* Botão Flutuante Suave de Voltar ao Topo do Documento Longo */}
              <AnimatePresence>
                {docScrolled && (
                  <motion.button
                    initial={{ opacity: 0, y: 15, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.8 }}
                    onClick={handleDocScrollToTop}
                    className="fixed bottom-[6.5rem] right-6 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-xl hover:border-blue-500 text-xs font-bold transition-all cursor-pointer group"
                  >
                    <div className="w-5 h-5 rounded-full bg-[#EBF3EF] dark:bg-[#15221B] text-[#2D5A46] dark:text-[#52B788] flex items-center justify-center group-hover:-translate-y-0.5 transition-transform">
                      <ArrowUp className="w-3 h-3" />
                    </div>
                    <span>Topo</span>
                    <span className="font-mono text-[10px] text-[#A8A29E] font-normal">({docPercent}%)</span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

          </div>
          )}

          {/* Botão flutuante "Teste" — gera um mini-questionário com IA sobre o documento */}
          {!isSimulatorDoc && selectedDoc && selectedDiscipline && (
            <DocQuiz
              doc={selectedDoc}
              discipline={selectedDiscipline}
              groupDocs={selectedDoc.group ? selectedDiscipline.documents.filter(d => (d.group || '').trim().toLowerCase() === (selectedDoc.group || '').trim().toLowerCase()) : undefined}
              groupName={selectedDoc.group}
            />
          )}

        </div>
      )}

      {/* Modal de Criação/Edição de Documento (Padrão em Branco) */}
      {selectedDiscipline && (
        <CreateDocModal
          isOpen={isCreateDocOpen || !!docToEdit}
          onClose={() => {
            setIsCreateDocOpen(false);
            setDocToEdit(null);
          }}
          discipline={selectedDiscipline}
          onCreateDoc={handleCreateDocument}
          editDoc={docToEdit}
          onEditDoc={handleEditDocument}
        />
      )}

      {/* Modal para Adicionar Termo ao Glossário */}
      {selectedDoc && (
        <AddGlossaryTermModal
          isOpen={isAddGlossaryOpen}
          initialTerm={initialGlossaryTerm}
          initialDefinition={
            editingGlossaryDef ||
            (initialGlossaryTerm && selectedDoc.glossary
              ? (Object.entries(selectedDoc.glossary).find(
                  ([key]) => key.trim().toLowerCase() === initialGlossaryTerm.trim().toLowerCase()
                )?.[1] ?? null)
              : null)
          }
          onClose={() => {
            setIsAddGlossaryOpen(false);
            setInitialGlossaryTerm('');
            setEditingGlossaryDef(null);
          }}
          onAddTerm={handleAddGlossaryTerm}
          docContextText={sectionsToText(selectedDoc.sections || []).slice(0, 1500)}
          existingCategories={Array.from(
            new Set(
              Object.values(selectedDoc.glossary || {})
                .map((d) => d.category)
                .filter(Boolean) as string[]
            )
          )}
        />
      )}

      {/* Gaveta Lateral de Glossário (Drawer) */}
      {selectedDiscipline && (
        <GlossaryDrawer
          isOpen={isGlossaryDrawerOpen}
          onClose={() => setIsGlossaryDrawerOpen(false)}
          currentDoc={selectedDoc}
          discipline={selectedDiscipline}
          glossary={effectiveGlossary}
          onAddTermClick={(term) => {
            setInitialGlossaryTerm(term || '');
            setEditingGlossaryDef(null);
            setIsAddGlossaryOpen(true);
          }}
          onEditTerm={(def) => {
            setInitialGlossaryTerm(def.term);
            setEditingGlossaryDef(def);
            setIsAddGlossaryOpen(true);
          }}
          onDeleteTerm={(term) => {
            handleDeleteGlossaryTerm(term);
          }}
          onStartStudy={() => {
            setIsGlossaryStudyOpen(true);
          }}
          highlightsEnabled={glossaryHighlightsEnabled}
          onToggleHighlights={() => setGlossaryHighlightsEnabled(v => !v)}
        />
      )}

      {/* Modal de Estudo com Flashcards do Glossário */}
      {selectedDiscipline && (
        <GlossaryStudyModal
          isOpen={isGlossaryStudyOpen}
          onClose={() => setIsGlossaryStudyOpen(false)}
          currentDoc={selectedDoc}
          discipline={selectedDiscipline}
          glossary={effectiveGlossary}
        />
      )}

      {/* Visualizador de Documento Público da Comunidade (Somente Leitura) */}
      <AnimatePresence>
        {selectedPublicDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100000] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
            onClick={() => setSelectedPublicDoc(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
            >
              {/* Cabeçalho */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white font-display">
                      Caderno Público da Comunidade
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Modo somente leitura</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPublicDoc(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Fechar visualização"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Conteúdo do Documento */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-10">
                <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white leading-tight mb-1">
                  {selectedPublicDoc.title}
                </h2>
                <p className="text-xs text-slate-400 mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
                  {selectedPublicDoc.summary}
                </p>

                <div className="space-y-2">
                  {selectedPublicDoc.sections.map((s, idx) => {
                    if (s.type === 'h1') return <h3 key={idx} className="font-extrabold text-xl text-slate-900 dark:text-white pt-3"><RichText html={s.contentHtml} text={s.content || s.heading} /></h3>;
                    if (s.type === 'h2') return <h4 key={idx} className="font-extrabold text-lg text-slate-900 dark:text-white pt-2"><RichText html={s.contentHtml} text={s.content || s.heading} /></h4>;
                    if (s.type === 'h3') return <h5 key={idx} className="font-bold text-base text-slate-800 dark:text-slate-200 pt-1"><RichText html={s.contentHtml} text={s.content || s.heading} /></h5>;
                    if (s.type === 'bullet') return <p key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"><span className="w-2 h-2 rounded-full bg-slate-400 mt-2 shrink-0" /><RichText html={s.contentHtml} text={s.content} /></p>;
                    if (s.type === 'numbered') {
                      let num = 0;
                      for (let i = idx; i >= 0; i--) {
                        if (selectedPublicDoc.sections[i].type === 'numbered') num++;
                        else break;
                      }
                      return <p key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"><span className="font-bold text-slate-400">{num}.</span><RichText html={s.contentHtml} text={s.content} /></p>;
                    }
                    if (s.type === 'todo') return <p key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"><CheckSquare className={`w-4 h-4 mt-0.5 ${s.checked ? 'text-emerald-500' : 'text-slate-300'}`} /><span className={s.checked ? 'line-through text-slate-400' : ''}><RichText html={s.contentHtml} text={s.content} /></span></p>;
                    if (s.type === 'callout') return <div key={idx} className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-900/60 text-amber-950 dark:text-amber-100 text-sm"><RichText html={s.contentHtml} text={s.content} /></div>;
                    if (s.type === 'quote') return <blockquote key={idx} className="pl-3 border-l-4 border-purple-500 italic text-slate-600 dark:text-slate-300 text-sm"><RichText html={s.contentHtml} text={s.content} /></blockquote>;
                    if (s.type === 'code') return <pre key={idx} className="p-3 rounded-xl bg-slate-950 text-cyan-300 font-mono text-xs overflow-x-auto border border-slate-800">{s.formula || s.content}</pre>;
                    if (s.type === 'divider') return <hr key={idx} className="my-4 border-slate-200 dark:border-slate-800 clear-both" />;
                    if (s.type === 'image' && s.imageUrl) {
                      const imgPct = s.imageSize ?? 100;
                      const imgStyle: React.CSSProperties = { width: `${imgPct}%`, margin: '12px auto' };
                      return (
                        <figure key={idx} className="max-w-full" style={imgStyle}>
                          <img src={s.imageUrl} alt={s.imageCaption || s.imageAlt || ''} draggable={false} onDragStart={(e) => e.preventDefault()} className="w-auto max-w-full object-contain rounded-2xl select-none" />
                        </figure>
                      );
                    }
                    return <p key={idx} className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed py-1"><RichText html={s.contentHtml} text={s.content} /></p>;
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
