import React, { useState, useRef, useEffect } from 'react';
import { ScreenId } from '../types/design';
import { DISCIPLINES, Discipline, NotebookDoc, DocSection, GlossaryDefinition } from '../data/disciplinesData';
import { motion, AnimatePresence } from 'motion/react';
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
  Calendar,
  BookOpen,
  LayoutGrid,
  List,
  ListTree,
  ChevronRight,
  Copy,
  Check,
  Send,
  PenLine,
  Grid,
  Plus,
  Lock,
  Trash2,
  Edit3,
  CheckSquare,
  Square,
  Lightbulb,
  AlertTriangle,
  Quote,
  Code,
  HelpCircle,
  CheckCircle2,
  Bot,
  MoreHorizontal,
  Layers,
  Share2,
  Eye,
  SlidersHorizontal,
  BookmarkPlus,
  Compass
} from 'lucide-react';
import { FormattedContentWithGlossary } from './GlossaryTooltip';
import { CreateDocModal } from './CreateDocModal';
import { AddGlossaryTermModal } from './AddGlossaryTermModal';
import { DocInsightSidebar } from './DocInsightSidebar';
import { DocAiChatDrawer } from './DocAiChatDrawer';
import { NotionDocEditor } from './NotionDocEditor';

interface CadernoWorkspaceProps {
  onNavigate?: (screen: ScreenId) => void;
}

export const CadernoWorkspace: React.FC<CadernoWorkspaceProps> = ({ onNavigate }) => {
  // State for all disciplines (allows adding new docs locally)
  const [allDisciplines, setAllDisciplines] = useState<Discipline[]>(DISCIPLINES);

  // Navigation State inside Caderno:
  // Level 1: 'disciplines' (Gallery of Subjects)
  // Level 2: 'doc_gallery' (Google Docs-like list for selected discipline)
  // Level 3: 'document_view' (Full reading & editing workspace for selected doc)
  const [selectedDisciplineId, setSelectedDisciplineId] = useState<string | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'enem' | 'faculdade' | 'pessoal'>('all');

  // Modals & Drawers State
  const [isCreateDocOpen, setIsCreateDocOpen] = useState(false);
  const [isAddGlossaryOpen, setIsAddGlossaryOpen] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [showInsightSidebar, setShowInsightSidebar] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  // Search & View Modes
  const [searchQuery, setSearchQuery] = useState('');
  const [galleryViewMode, setGalleryViewMode] = useState<'grid' | 'list'>('grid');
  
  // Discreet Document Paper Mode (📄 Digital, 📝 Pautado, 📐 Grade)
  const [docPaperMode, setDocPaperMode] = useState<'docs' | 'ruled' | 'grid'>('docs');
  
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');

  // Smooth Scroll Refs & State
  const galleryContainerRef = useRef<HTMLDivElement>(null);
  const docContainerRef = useRef<HTMLDivElement>(null);

  const [galleryScrolled, setGalleryScrolled] = useState(false);
  const [galleryPercent, setGalleryPercent] = useState(0);

  const [docScrolled, setDocScrolled] = useState(false);
  const [docPercent, setDocPercent] = useState(0);
  const [isOutlineOpen, setIsOutlineOpen] = useState(false);

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

  const handleScrollToSection = (blockIndex: number) => {
    const el = document.getElementById(`doc-block-${blockIndex}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Temporary neon flash highlight
      el.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2', 'dark:ring-offset-slate-900', 'bg-blue-50/50', 'dark:bg-blue-950/40');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2', 'dark:ring-offset-slate-900', 'bg-blue-50/50', 'dark:bg-blue-950/40');
      }, 1500);
    }
    setIsOutlineOpen(false);
  };

  // Selected Discipline & Doc
  const selectedDiscipline = allDisciplines.find(d => d.id === selectedDisciplineId);
  const selectedDoc = selectedDiscipline?.documents.find(doc => doc.id === selectedDocId);

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
  };

  // Handlers for in-place text and section editing
  const handleUpdateDocTitle = (newTitle: string) => {
    if (!selectedDisciplineId || !selectedDocId) return;
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
    setTimeout(() => setSaveStatus('saved'), 400);
  };

  const handleUpdateSections = (newSections: DocSection[]) => {
    if (!selectedDisciplineId || !selectedDocId) return;
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
    setTimeout(() => setSaveStatus('saved'), 400);
  };

  const handleDeleteCurrentDoc = () => {
    if (!selectedDisciplineId || !selectedDocId) return;
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
    setSelectedDocId(null);
  };

  // Add custom glossary term to current document
  const handleAddGlossaryTerm = (term: string, definition: GlossaryDefinition) => {
    if (!selectedDisciplineId || !selectedDocId) return;

    setAllDisciplines(prev =>
      prev.map(d => {
        if (d.id === selectedDisciplineId) {
          return {
            ...d,
            documents: d.documents.map(doc => {
              if (doc.id === selectedDocId) {
                return {
                  ...doc,
                  glossary: {
                    ...(doc.glossary || {}),
                    [term]: definition
                  }
                };
              }
              return doc;
            })
          };
        }
        return d;
      })
    );
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

          {/* Grid de Cards das Matérias com Animação Fluida Framer Motion Stagger */}
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
      {/* NÍVEL 2: LISTA DE DOCUMENTOS DA MATÉRIA COM MODELOS INTELIGENTES */}
      {/* ========================================================================= */}
      {selectedDiscipline && !selectedDocId && (
        <div className="flex-1 overflow-y-auto pb-16 pr-1 space-y-6">
          
          {/* Header da Disciplina */}
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

          {/* Grid ou Lista de Documentos, ou Empty State */}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDocs.map((doc) => (
                <motion.div
                  key={doc.id}
                  whileHover={{ y: -4, transition: { duration: 0.15 } }}
                  onClick={() => setSelectedDocId(doc.id)}
                  className="group bg-white dark:bg-slate-900 rounded-[28px] p-6 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-xl hover:shadow-blue-500/10 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300">
                          {doc.readTime}
                        </span>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                        doc.isPublic !== false 
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                      }`}>
                        {doc.isPublic !== false ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        {doc.isPublic !== false ? 'Público' : 'Privado'}
                      </span>
                    </div>

                    <h3 className="font-display font-extrabold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                      {doc.title}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {doc.summary}
                    </p>

                    {/* Tags */}
                    {doc.tags && doc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {doc.tags.map(t => (
                          <span key={t} className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{doc.lastEdited}</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      Abrir e Editar <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </motion.div>
              ))}
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
                  {filteredDocs.map((doc) => (
                    <tr
                      key={doc.id}
                      onClick={() => setSelectedDocId(doc.id)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                    >
                      <td className="p-4">
                        <span className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                          {doc.title}
                        </span>
                        <p className="text-[11px] text-slate-400 truncate max-w-sm">{doc.summary}</p>
                      </td>
                      <td className="p-4 hidden sm:table-cell">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          doc.isPublic !== false ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {doc.isPublic !== false ? '🌐 Público' : '🔒 Privado'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 hidden md:table-cell">{doc.readTime}</td>
                      <td className="p-4 text-slate-400 hidden lg:table-cell">{doc.lastEdited}</td>
                      <td className="p-4 text-right">
                        <span className="text-blue-600 dark:text-blue-400 font-bold group-hover:underline flex items-center justify-end gap-0.5">
                          Abrir <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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

            {/* Centro: Indicador Discreto de Salvamento */}
            <div className="text-[11px] text-slate-400 font-medium hidden md:flex items-center gap-1.5">
              {saveStatus === 'saving' ? (
                <span className="text-amber-500 flex items-center gap-1 animate-pulse">
                  <Clock className="w-3 h-3" /> Salvando alterações...
                </span>
              ) : (
                <span className="text-slate-400 flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-500" /> Salvo na nuvem • {selectedDoc.readTime}
                </span>
              )}
            </div>

            {/* Lado Direito: Ações Discretas (Quiz + Menu Dropdown ...) */}
            <div className="flex items-center gap-2 relative">
              {/* Botão Discreto de Auto-Teste / Quiz AI */}
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

              {/* Menu Mais Opções (...) onde ficam os botões discretos */}
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
            </div>
          </div>

          {/* Área Principal: Document Canvas Imersivo (Estilo Notion / Word) + Sidebar */}
          <div className="flex-1 flex gap-4 overflow-hidden pt-3">
            
            {/* FOLHA DE ESCRITA LIMPA (CANVAS NOTION / WORD COM AUTO-WRAP E CONTADOR) */}
            <div 
              ref={docContainerRef}
              onScroll={handleDocScroll}
              className="flex-1 overflow-y-auto pr-1 flex justify-center pb-28 scroll-smooth"
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
                  onOpenAddGlossary={() => setIsAddGlossaryOpen(true)}
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

          {/* Botão Flutuante Discreto da IA Lumina no Canto Esquerdo */}
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

          {/* Gaveta de Chat da IA */}
          <DocAiChatDrawer
            isOpen={isAiChatOpen}
            onClose={() => setIsAiChatOpen(false)}
            doc={selectedDoc}
            discipline={selectedDiscipline}
            onInsertTextIntoDoc={handleInsertAiTextIntoDoc}
          />
        </div>
      )}

      {/* Modal de Criação de Documento com Cartões de Modelos Inteligentes */}
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
          onClose={() => setIsAddGlossaryOpen(false)}
          onAddTerm={handleAddGlossaryTerm}
        />
      )}
    </div>
  );
};
