import React, { useState, useRef, useEffect } from 'react';
import { ScreenId } from '../types/design';
import { DISCIPLINES, Discipline, NotebookDoc, DocSection, GlossaryDefinition } from '../data/disciplinesData';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { getUserDocuments, saveDocument, deleteDocument, getPublicDocuments } from '../services/supabase';
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
  X
} from 'lucide-react';
import { CreateDocModal } from './CreateDocModal';
import { AddGlossaryTermModal } from './AddGlossaryTermModal';
import { DocInsightSidebar } from './DocInsightSidebar';
import { DocAiChatDrawer } from './DocAiChatDrawer';
import { NotionDocEditor } from './NotionDocEditor';
import { EmojiQuickPicker } from './EmojiQuickPicker';
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

export const CadernoWorkspace: React.FC<CadernoWorkspaceProps> = ({ onNavigate }) => {
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
  }, [selectedDisciplineId]);

  // Modals & Drawers State
  const [isCreateDocOpen, setIsCreateDocOpen] = useState(false);
  const [isAddGlossaryOpen, setIsAddGlossaryOpen] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [initialGlossaryTerm, setInitialGlossaryTerm] = useState('');
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [showInsightSidebar, setShowInsightSidebar] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

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
  
  // Discreet Document Paper Mode (📄 Digital, 📝 Pautado, 📐 Grade)
  const [docPaperMode, setDocPaperMode] = useState<'docs' | 'ruled' | 'grid'>('docs');
  
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

  const filteredDocs = selectedDiscipline?.documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  // Documentos públicos da comunidade filtrados pela disciplina selecionada
  const disciplinePublicDocs = (selectedDiscipline
    ? publicDocs.filter(doc => doc.disciplineId === selectedDiscipline.id)
    : []);

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
                return { ...doc, title: newTitle, lastEdited: 'Agora mesmo' };
              }
              return doc;
            })
          };
        }
        return d;
      })
    );

    if (userId) {
      saveDocument(userId, { ...selectedDoc, title: newTitle, lastEdited: 'Agora mesmo' }).catch(err =>
        console.warn('Erro ao salvar documento no Supabase:', err)
      );
    }
    setTimeout(() => setSaveStatus('saved'), 400);
  };

  const handleUpdateSections = (newSections: DocSection[]) => {
    if (!selectedDisciplineId || !selectedDocId || !selectedDoc) return;
    setSaveStatus('saving');

    const wordCount = newSections.reduce((acc, s) => acc + (s.content || '').split(/\s+/).filter(Boolean).length, 0);
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
        saveDocument(userId, { ...selectedDocRef.current, sections: newSections, wordCount, lastEdited: 'Agora mesmo' }).catch(err =>
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

  // Add custom glossary term to current document
  const handleAddGlossaryTerm = (term: string, definition: GlossaryDefinition) => {
    if (!selectedDisciplineId || !selectedDocId || !selectedDoc) return;

    const newGlossary = {
      ...(selectedDoc.glossary || {}),
      [term]: definition
    };

    setAllDisciplines(prev =>
      prev.map(d => {
        if (d.id === selectedDisciplineId) {
          return {
            ...d,
            documents: d.documents.map(doc => {
              if (doc.id === selectedDocId) {
                return { ...doc, glossary: newGlossary };
              }
              return doc;
            })
          };
        }
        return d;
      })
    );

    if (userId) {
      saveDocument(userId, { ...selectedDoc, glossary: newGlossary }).catch(err =>
        console.warn('Erro ao salvar glossário no Supabase:', err)
      );
    }
  };

  // Copy full document text
  const handleCopyDoc = () => {
    if (!selectedDoc) return;
    const fullText = `${selectedDoc.title}\n\n${selectedDoc.summary}\n\n` +
      selectedDoc.sections.map(s => `${s.heading ? s.heading + '\n' : ''}${s.content}\n${s.formula ? 'Fórmula: ' + s.formula + '\n' : ''}`).join('\n');
    
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Insert AI message text into doc
  const handleInsertAiTextIntoDoc = (text: string) => {
    if (!selectedDisciplineId || !selectedDocId || !selectedDoc) return;
    const newSection: DocSection = {
      id: `s-ai-${Date.now()}`,
      heading: '',
      content: text,
      type: 'callout',
      callout: text,
      calloutType: 'tip'
    };
    handleUpdateSections([...selectedDoc.sections, newSection]);
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
          <div className="bg-white dark:bg-slate-900 rounded-[28px] p-6 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <h2 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white">
                    Caderno Digital Integrado
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Acesse seus cadernos organizados por matérias, resumos de aula e glossário conceitual
                </p>
              </div>

              {/* Barra de Busca de Disciplinas */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar matéria ou tópico..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
            </div>

            {/* Abas de Categorias com Seleção Robusta */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
              {[
                { id: 'all', label: 'Todas as Matérias' },
                { id: 'enem', label: 'ENEM & Vestibulares' },
                { id: 'faculdade', label: 'Faculdade (Unisul)' },
                { id: 'pessoal', label: 'Pessoal & Diário' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
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
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-2xs z-0'
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
                    className="absolute inset-0 bg-white dark:bg-slate-900 transition-opacity duration-300 pointer-events-none -z-10"
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
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-900 dark:text-white shadow-xs">
                        {discipline.category === 'enem' ? 'ENEM' : discipline.category === 'faculdade' ? 'Faculdade' : 'Pessoal'}
                      </span>

                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/10 flex items-center gap-1.5 shadow-xs">
                        <FileText className="w-3 h-3 text-blue-400" />
                        {discipline.docCount} {discipline.docCount === 1 ? 'doc' : 'docs'}
                      </span>
                    </div>
                  </div>

                  {/* 2. Ícone Flutuante da Matéria sobreposto à capa */}
                  <div className="px-5 relative z-10 shrink-0">
                    <div 
                      className="w-12 h-12 -mt-6 rounded-2xl flex items-center justify-center text-white shadow-xl border-2 border-white dark:border-slate-900 z-20 font-bold transition-all duration-300 group-hover:scale-105"
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
                        <span className={isHovered ? '' : 'text-slate-900 dark:text-white'}>
                          {discipline.name}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed font-normal">
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
                            <span className={isHovered ? 'font-semibold' : 'text-slate-600 dark:text-slate-300'}>
                              {topic}
                            </span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 4. Rodapé do Card */}
                  <div 
                    className="px-5 py-3.5 mt-2 border-t border-slate-100 dark:border-slate-800/80 transition-colors duration-300 flex items-center justify-between text-xs text-slate-400 z-10 shrink-0"
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
                      <span className={isHovered ? '' : 'text-blue-600 dark:text-blue-400'}>
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
                className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-xl hover:shadow-2xl hover:border-blue-500 text-xs font-bold transition-all cursor-pointer group"
              >
                <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:-translate-y-0.5 transition-transform">
                  <ArrowUp className="w-3.5 h-3.5" />
                </div>
                <span>Voltar ao Topo</span>
                <span className="font-mono text-[10px] text-slate-400 font-normal">({galleryPercent}%)</span>
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
          <div className="bg-white dark:bg-slate-900 rounded-[28px] p-6 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDisciplineId(null)}
                className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
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
                  <h2 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white">
                    {selectedDiscipline.name}
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
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
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200/60 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                title="Selecionar múltiplos documentos (arraste para marcar)"
                aria-label="Modo de seleção múltipla"
              >
                <MousePointer2 className="w-4 h-4" />
                <span className="hidden lg:inline">{selectionMode ? 'Sair da Seleção' : 'Selecionar'}</span>
              </button>

              {/* Alternador Grid / Lista */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700">
                <button
                  onClick={() => setGalleryViewMode('grid')}
                  className={`p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                    galleryViewMode === 'grid' 
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs' 
                      : 'text-slate-400 hover:text-slate-700'
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
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs' 
                      : 'text-slate-400 hover:text-slate-700'
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
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Documento</span>
              </motion.button>
            </div>
          </div>
          </ScrollFade>

          {/* Barra de Filtro de Documentos */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Filtrar documentos em ${selectedDiscipline.name}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs font-medium"
            />
          </div>

          {/* Barra de Ações em Lote (Modo Seleção) */}
          {selectionMode && selectedDocs.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 px-4 py-3 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/60 shadow-sm">
              <span className="text-xs font-bold text-blue-800 dark:text-blue-200 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-blue-500" />
                {selectedDocs.length} {selectedDocs.length === 1 ? 'documento selecionado' : 'documentos selecionados'}
              </span>
              <div className="flex items-center gap-2 ml-auto flex-wrap">
                <button
                  onClick={handleBulkVisibility}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
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
                <button
                  onClick={handleSelectAllVisible}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  title="Selecionar todos os documentos visíveis"
                >
                  Selecionar tudo
                </button>
                <button
                  onClick={handleClearSelection}
                  className="p-1.5 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
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
            <div className="bg-white dark:bg-slate-900 rounded-[28px] p-12 border border-dashed border-slate-300 dark:border-slate-800 text-center flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-1">
                <h3 className="font-display font-extrabold text-base text-slate-900 dark:text-white">
                  Nenhum caderno salvo em {selectedDiscipline.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {searchQuery 
                    ? `Nenhum documento encontrado com "${searchQuery}".` 
                    : 'Crie seu primeiro resumo, anotação de aula ou material de estudo estruturado.'}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsCreateDocOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all cursor-pointer mt-2"
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
              {filteredDocs.map((doc) => {
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
                        ? 'bg-gradient-to-br from-emerald-50 to-sky-50 dark:from-emerald-950/30 dark:to-sky-950/20 border-emerald-200 dark:border-emerald-900/60 hover:shadow-xl hover:shadow-emerald-500/15'
                        : sel
                        ? 'border-blue-500 ring-2 ring-blue-400/70 dark:ring-blue-500/60 bg-blue-50/60 dark:bg-blue-950/40 shadow-lg shadow-blue-500/20'
                        : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:shadow-xl hover:shadow-blue-500/10'
                    }`}
                  >
                    {/* Indicador de seleção (canto superior direito) */}
                    {selectionMode && (
                      <div className={`absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full border-[3px] border-white dark:border-slate-900 shadow-md flex items-center justify-center z-10 transition-all ${
                        sel ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-300 dark:text-slate-600'
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
                          <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300">
                            {doc.readTime}
                          </span>
                        )}
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                        isSim
                          ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300'
                          : doc.isPublic !== false 
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                      }`}>
                        {isSim ? <Sparkles className="w-3 h-3" /> : doc.isPublic !== false ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        {isSim ? 'Interativo' : doc.isPublic !== false ? 'Público' : 'Privado'}
                      </span>
                    </div>

                    <h3 className={`font-display font-extrabold text-base transition-colors leading-snug ${
                      isSim ? 'text-emerald-800 dark:text-emerald-300' : 'text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400'
                    }`}>
                      {doc.title}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {doc.summary}
                    </p>

                    {/* Tags */}
                    {doc.tags && doc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {doc.tags.map(t => (
                          <span key={t} className={`px-2 py-0.5 rounded-lg text-[10px] font-medium ${
                            isSim ? 'bg-white/70 dark:bg-slate-800/80 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className={`pt-4 mt-4 border-t flex items-center justify-between text-[11px] ${
                    isSim ? 'border-emerald-200/70 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400' : 'border-slate-100 dark:border-slate-800 text-slate-400'
                  }`}>
                    <span>{doc.lastEdited}</span>
                    <span className={`font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1 ${
                      isSim ? 'text-emerald-600 dark:text-emerald-400' : sel ? 'text-blue-600 dark:text-blue-400' : 'text-blue-600 dark:text-blue-400'
                    }`}>
                      {selectionMode ? (sel ? 'Selecionado' : 'Selecionar') : isSim ? 'Abrir Simulador' : 'Abrir e Editar'} <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </motion.div>
                );
              })}

              {/* Quadrado de seleção (rubber-band) */}
              {dragRect && (
                <div
                  className="pointer-events-none fixed z-[60]"
                  style={{
                    left: dragRect.left,
                    top: dragRect.top,
                    width: dragRect.width,
                    height: dragRect.height,
                    background: 'rgba(59, 130, 246, 0.15)',
                    border: '1.5px solid rgba(59, 130, 246, 0.7)',
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
                  {filteredDocs.map((doc) => {
                    const isSim = doc.id === SIMULATOR_DOC_ID;
                    return (
                    <tr
                      key={doc.id}
                      onClick={() => setSelectedDocId(doc.id)}
                      className={`transition-colors cursor-pointer group ${
                        isSim
                          ? 'bg-gradient-to-r from-emerald-50 to-sky-50 dark:from-emerald-950/25 dark:to-sky-950/15 hover:bg-emerald-50/90 dark:hover:bg-emerald-950/30'
                          : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <td className="p-4">
                        <span className={`font-bold transition-colors ${
                          isSim ? 'text-emerald-800 dark:text-emerald-300 group-hover:text-emerald-600' : 'text-slate-900 dark:text-white group-hover:text-blue-600'
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
                          isSim ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'
                        }`}>
                          {isSim ? 'Abrir Simulador' : 'Abrir'} <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                    );
                  })}
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
                {disciplinePublicDocs.map((doc) => (
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
                ))}
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

            {/* Lado Direito: Ações Discretas (Emojis Rápidos + Quiz + Menu Dropdown ...) */}
            <div className="flex items-center gap-2 relative">
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

              {/* Botão Discreto de Auto-Teste / Quiz AI */}
              {!isSimulatorDoc && (
              <button
                onClick={() => setShowInsightSidebar(!showInsightSidebar)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  showInsightSidebar 
                    ? 'bg-purple-600 text-white shadow-xs' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                title="Abrir Auto-Teste e Quiz de Fixação"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Auto-Teste AI</span>
              </button>
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

                    {/* Estilo da Página (Digital, Pautado, Grade) */}
                    <div className="px-3 py-1.5 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 block mb-1.5">
                        Estilo da Folha
                      </span>
                      <div className="grid grid-cols-3 gap-1">
                        <button
                          onClick={() => setDocPaperMode('docs')}
                          className={`py-1 text-[11px] rounded-lg font-medium transition-all ${
                            docPaperMode === 'docs' 
                              ? 'bg-blue-600 text-white font-bold' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          Digital
                        </button>
                        <button
                          onClick={() => setDocPaperMode('ruled')}
                          className={`py-1 text-[11px] rounded-lg font-medium transition-all ${
                            docPaperMode === 'ruled' 
                              ? 'bg-indigo-600 text-white font-bold' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          Linhas
                        </button>
                        <button
                          onClick={() => setDocPaperMode('grid')}
                          className={`py-1 text-[11px] rounded-lg font-medium transition-all ${
                            docPaperMode === 'grid' 
                              ? 'bg-emerald-600 text-white font-bold' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          Grade
                        </button>
                      </div>
                    </div>

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
              className="flex-1 overflow-y-auto pr-1 flex items-start justify-center pb-28 scroll-smooth"
            >
              <div 
                className={`w-full max-w-4xl min-h-[700px] transition-all rounded-[28px] p-6 sm:p-12 shadow-xs relative ${
                  docPaperMode === 'ruled'
                    ? 'bg-caderno-ruled border border-amber-200/60 dark:border-slate-700'
                    : docPaperMode === 'grid'
                    ? 'bg-caderno-grid border border-slate-200/80 dark:border-slate-800'
                    : 'bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80'
                }`}
              >
                {/* Título Principal do Documento (Fluido com quebra de linha natural) */}
                <div className="mb-4 pb-2 border-b border-slate-100 dark:border-slate-800/60">
                  <textarea
                    rows={1}
                    value={selectedDoc.title}
                    onChange={(e) => {
                      handleUpdateDocTitle(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    placeholder="Título do Documento..."
                    className="w-full bg-transparent resize-none border-none outline-none text-2xl sm:text-4xl font-black text-slate-900 dark:text-white font-display tracking-tight leading-tight placeholder:text-slate-300 dark:placeholder:text-slate-600 overflow-hidden break-words"
                  />
                  
                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 font-medium pt-2">
                    <span className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-blue-500" />
                      {selectedDoc.sections.reduce((acc, s) => acc + (s.content || '').split(/\s+/).filter(Boolean).length, 0)} palavras
                      • {selectedDoc.sections.reduce((acc, s) => acc + (s.content || '').length, 0)} caracteres
                    </span>
                    <span>Criado em {selectedDoc.createdAt}</span>
                  </div>
                </div>

                {/* Editor Rich Text de Blocos Notion / Word */}
                <NotionDocEditor
                  sections={selectedDoc.sections}
                  glossary={selectedDoc.glossary}
                  disciplineColor={selectedDiscipline.color}
                  paperMode={docPaperMode}
                  onUpdateSections={handleUpdateSections}
                  onOpenAddGlossary={(term) => {
                    setInitialGlossaryTerm(term || '');
                    setIsAddGlossaryOpen(true);
                  }}
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
                    className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-xl hover:border-blue-500 text-xs font-bold transition-all cursor-pointer group"
                  >
                    <div className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:-translate-y-0.5 transition-transform">
                      <ArrowUp className="w-3 h-3" />
                    </div>
                    <span>Topo</span>
                    <span className="font-mono text-[10px] text-slate-400 font-normal">({docPercent}%)</span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Sidebar de Insights e Auto-Teste AI */}
            <AnimatePresence>
              {showInsightSidebar && (
                <DocInsightSidebar
                  doc={selectedDoc}
                  discipline={selectedDiscipline}
                  isOpen={showInsightSidebar}
                  onClose={() => setShowInsightSidebar(false)}
                  onNavigate={onNavigate}
                />
              )}
            </AnimatePresence>
          </div>
          )}

          {/* Botão Flutuante Discreto da IA Lumina no Canto Esquerdo (oculto no simulador) */}
          {!isSimulatorDoc && (
            <div className="fixed bottom-6 left-6 z-40">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsAiChatOpen(true)}
                className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 cursor-pointer transition-all border border-purple-400/30"
              >
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <span>Lumina AI Tutor</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </motion.button>
            </div>
          )}

          {/* Gaveta de Chat da IA */}
          {!isSimulatorDoc && (
          <DocAiChatDrawer
            isOpen={isAiChatOpen}
            onClose={() => setIsAiChatOpen(false)}
            doc={selectedDoc}
            discipline={selectedDiscipline}
            onInsertTextIntoDoc={handleInsertAiTextIntoDoc}
          />
          )}
        </div>
      )}

      {/* Modal de Criação de Documento (Padrão em Branco) */}
      {selectedDiscipline && (
        <CreateDocModal
          isOpen={isCreateDocOpen}
          onClose={() => setIsCreateDocOpen(false)}
          discipline={selectedDiscipline}
          onCreateDoc={handleCreateDocument}
        />
      )}

      {/* Modal para Adicionar Termo ao Glossário */}
      {selectedDoc && (
        <AddGlossaryTermModal
          isOpen={isAddGlossaryOpen}
          initialTerm={initialGlossaryTerm}
          initialDefinition={
            initialGlossaryTerm && selectedDoc.glossary
              ? (Object.entries(selectedDoc.glossary).find(
                  ([key]) => key.trim().toLowerCase() === initialGlossaryTerm.trim().toLowerCase()
                )?.[1] ?? null)
              : null
          }
          onClose={() => {
            setIsAddGlossaryOpen(false);
            setInitialGlossaryTerm('');
          }}
          onAddTerm={handleAddGlossaryTerm}
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
