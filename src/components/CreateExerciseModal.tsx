import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Sparkles, 
  Plus, 
  Check, 
  Code, 
  Lightbulb, 
  FileQuestion,
  Image as ImageIcon,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { QuizQuestion } from '../types/design';

interface CreateExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddQuestion: (newQuestion: QuizQuestion) => void;
  initialQuestion?: QuizQuestion | null;
}

const DIFFICULTY_OPTIONS = [
  { id: 'Fácil', label: 'Fácil', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800' },
  { id: 'Médio', label: 'Médio', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800' },
  { id: 'Difícil', label: 'Difícil', color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800' }
] as const;

const SUBJECT_PRESETS = [
  'Matemática & Raciocínio Lógico',
  'Física Clássica & Moderna',
  'Química Geral & Orgânica',
  'Biologia & Genética',
  'História & Geopolítica',
  'Linguagens & Literatura',
  'Inteligência Artificial & Computação'
];

export const CreateExerciseModal: React.FC<CreateExerciseModalProps> = ({
  isOpen,
  onClose,
  onAddQuestion,
  initialQuestion
}) => {
  const [subject, setSubject] = useState(initialQuestion?.subject || SUBJECT_PRESETS[0]);
  const [customSubject, setCustomSubject] = useState('');
  const [topic, setTopic] = useState(initialQuestion?.topic || '');
  const [difficulty, setDifficulty] = useState<'Fácil' | 'Médio' | 'Difícil'>(initialQuestion?.difficulty || 'Médio');
  const [statement, setStatement] = useState(initialQuestion?.statement || '');
  const [imageUrl, setImageUrl] = useState(initialQuestion?.imageUrl || '');
  const [imageCaption, setImageCaption] = useState(initialQuestion?.imageCaption || '');
  const [showImagePreview, setShowImagePreview] = useState(Boolean(initialQuestion?.imageUrl));
  const [codeSnippet, setCodeSnippet] = useState(initialQuestion?.codeSnippet || '');
  const [enableOptionE, setEnableOptionE] = useState(Boolean(initialQuestion?.options && initialQuestion.options.length > 4));

  const [correctOptionId, setCorrectOptionId] = useState<'A' | 'B' | 'C' | 'D' | 'E'>(
    (initialQuestion?.options?.find(o => o.isCorrect)?.id as any) || 'A'
  );

  const [optionsText, setOptionsText] = useState<{ A: string; B: string; C: string; D: string; E: string }>({
    A: initialQuestion?.options?.find(o => o.id === 'A')?.text || '',
    B: initialQuestion?.options?.find(o => o.id === 'B')?.text || '',
    C: initialQuestion?.options?.find(o => o.id === 'C')?.text || '',
    D: initialQuestion?.options?.find(o => o.id === 'D')?.text || '',
    E: initialQuestion?.options?.find(o => o.id === 'E')?.text || ''
  });

  const [correctExplanation, setCorrectExplanation] = useState(
    initialQuestion?.options?.find(o => o.isCorrect)?.explanation || ''
  );
  const [aiHint, setAiHint] = useState(initialQuestion?.aiHint || '');

  if (!isOpen) return null;

  const handleQuickFillWithImage = () => {
    setSubject('Física Clássica & Moderna');
    setTopic('Circuitos Elétricos & Associação de Resistores');
    setDifficulty('Médio');
    setStatement('Analise o circuito elétrico ilustrado na figura abaixo contendo resistores alimentados por uma fonte de tensão contínua. Sabendo que a corrente total que sai da fonte é 2 A, determine a potência total dissipada por efeito Joule no circuito.');
    setImageUrl('https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?auto=format&fit=crop&w=800&q=80');
    setImageCaption('Figura 1: Diagrama esquemático do circuito elétrico no laboratório.');
    setShowImagePreview(true);
    setCodeSnippet('P_total = V * I = R_eq * I²');
    setOptionsText({
      A: '40 Watts',
      B: '80 Watts',
      C: '120 Watts',
      D: '160 Watts',
      E: '200 Watts'
    });
    setEnableOptionE(true);
    setCorrectOptionId('B');
    setCorrectExplanation('Correto! Calculando a resistência equivalente Req = 20 Ω e aplicando P = Req * I² = 20 * (2)² = 20 * 4 = 80 W.');
    setAiHint('Lembre-se da fórmula de potência elétrica dissipada por efeito Joule: P = R * I² ou P = V * I.');
  };

  const handleQuickFillBiology = () => {
    setSubject('Biologia & Genética');
    setTopic('Estrutura Celular & Mitocôndrias');
    setDifficulty('Fácil');
    setStatement('A organela citoplasmática mostrada na micrografia eletrônica abaixo possui membrana dupla, cristas internas e DNA próprio. Qual é a sua função primordial na célula eucariótica?');
    setImageUrl('https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=800&q=80');
    setImageCaption('Micrografia: Organela celular responsável pela respiração celular aeróbica.');
    setShowImagePreview(true);
    setCodeSnippet('');
    setOptionsText({
      A: 'Respiração celular aeróbia e síntese massiva de ATP via fosforilação oxidativa.',
      B: 'Síntese e empacotamento de proteínas para exportação extracelular.',
      C: 'Digestão intracelular de macromoléculas através de enzimas hidrolíticas.',
      D: 'Degradação de peróxido de hidrogênio e oxidação de ácidos graxos.',
      E: 'Fotossíntese e fixação do carbono atmosférico na fase escura.'
    });
    setEnableOptionE(true);
    setCorrectOptionId('A');
    setCorrectExplanation('Correto! As mitocôndrias são as usinas energéticas da célula eucarionte, gerando ATP através do ciclo de Krebs e da cadeia respiratória.');
    setAiHint('Observe as cristas mitocondriais e recorde a Teoria da Endossimbiose (organela com DNA próprio circular).');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statement.trim() || !optionsText.A.trim() || !optionsText.B.trim()) return;

    const finalSubject = subject === 'Personalizado' ? (customSubject.trim() || 'Geral') : subject;
    const finalTopic = topic.trim() || 'Conceitos Fundamentais';

    const activeOptions = ['A', 'B', 'C', 'D'];
    if (enableOptionE) activeOptions.push('E');

    const newQuestion: QuizQuestion = {
      id: initialQuestion?.id || Date.now(),
      subject: finalSubject,
      topic: finalTopic,
      difficulty,
      statement: statement.trim(),
      imageUrl: imageUrl.trim() || undefined,
      imageCaption: imageCaption.trim() || undefined,
      codeSnippet: codeSnippet.trim() ? codeSnippet.trim() : undefined,
      options: activeOptions.map((letter) => ({
        id: letter,
        text: optionsText[letter as keyof typeof optionsText]?.trim() || `Alternativa ${letter}`,
        isCorrect: correctOptionId === letter,
        explanation: correctOptionId === letter 
          ? (correctExplanation.trim() || 'Resposta correta!') 
          : 'Alternativa incorreta.'
      })),
      aiHint: aiHint.trim() || 'Considere a relação de causa e efeito e os fundamentos teóricos da disciplina.'
    };

    onAddQuestion(newQuestion);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden z-10 my-6"
        >
          {/* Top Decorative Gradient */}
          <div className="h-3 w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600" />

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
                <FileQuestion className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white font-display">
                  {initialQuestion ? 'Editar Questão' : 'Criar Nova Questão (Sala do Professor)'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Adicione enunciado, imagem ilustrativa por URL, gabarito e dicas inteligentes
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleQuickFillWithImage}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
                  title="Exemplo com Imagem de Física"
                >
                  <ImageIcon className="w-3 h-3 text-blue-600" />
                  <span>Exemplo c/ Imagem</span>
                </button>
                <button
                  type="button"
                  onClick={handleQuickFillBiology}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
                  title="Exemplo de Biologia"
                >
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  <span>Exemplo Bio</span>
                </button>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            
            {/* Matéria & Tópico */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-200 mb-1 uppercase tracking-wider">
                  Matéria / Disciplina *
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {SUBJECT_PRESETS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                  <option value="Personalizado">Outra / Personalizada</option>
                </select>
                {subject === 'Personalizado' && (
                  <input
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder="Digite a matéria..."
                    className="mt-1.5 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-200 mb-1 uppercase tracking-wider">
                  Tópico Específico *
                </label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Ex: Leis de Newton, Estequiometria, Funções..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
            </div>

            {/* Dificuldade Selector */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-200 mb-1.5 uppercase tracking-wider">
                Nível de Dificuldade
              </label>
              <div className="flex items-center gap-2">
                {DIFFICULTY_OPTIONS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDifficulty(d.id)}
                    className={`flex-1 py-1.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      difficulty === d.id
                        ? `${d.color} ring-2 ring-blue-400/30 shadow-xs scale-102`
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Enunciado */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-200 mb-1 uppercase tracking-wider">
                Enunciado da Questão *
              </label>
              <textarea
                rows={3}
                required
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                placeholder="Escreva o problema ou enunciado completo da questão..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed font-medium"
              />
            </div>

            {/* 🖼️ SEÇÃO DE IMAGEM DA QUESTÃO (POR URL) */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-pink-50/50 to-purple-50/40 dark:from-pink-950/20 dark:to-purple-950/20 border border-pink-200/80 dark:border-pink-900/50 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                  <ImageIcon className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                  <span>Imagem Ilustrativa da Questão (URL)</span>
                </label>
                {imageUrl && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Imagem Anexada
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setShowImagePreview(Boolean(e.target.value));
                    }}
                    placeholder="https://exemplo.com/grafico-ou-esquema.png"
                    className="w-full bg-white dark:bg-slate-900 border border-pink-200 dark:border-pink-900/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 font-mono"
                  />
                </div>
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setImageUrl('');
                      setImageCaption('');
                      setShowImagePreview(false);
                    }}
                    className="p-2 bg-white dark:bg-slate-800 text-rose-500 rounded-xl border border-rose-200 dark:border-rose-900 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Remover Imagem"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Legenda Opcional da Imagem */}
              {imageUrl && (
                <div>
                  <input
                    type="text"
                    value={imageCaption}
                    onChange={(e) => setImageCaption(e.target.value)}
                    placeholder="Legenda da Imagem (Ex: Figura 1: Esquema do experimento...)"
                    className="w-full bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-pink-500"
                  />
                </div>
              )}

              {/* Pré-visualização da Imagem */}
              {imageUrl && showImagePreview && (
                <div className="relative mt-2 p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col items-center justify-center">
                  <img
                    src={imageUrl}
                    alt="Preview da Questão"
                    className="max-h-44 w-auto object-contain rounded-lg shadow-2xs"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                      const err = e.currentTarget.parentElement?.querySelector('.img-preview-err') as HTMLElement;
                      if (err) err.style.display = 'flex';
                    }}
                  />
                  <div className="img-preview-err hidden p-3 text-center text-xs text-rose-500 items-center justify-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    <span>Não foi possível carregar o preview desta URL. Certifique-se de que o link é uma imagem pública direta.</span>
                  </div>
                  {imageCaption && (
                    <p className="text-[11px] text-slate-500 italic mt-1.5 text-center">
                      {imageCaption}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Snippet de Código ou Fórmula (Opcional) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-slate-400" />
                Bloco de Código ou Equação (Opcional)
              </label>
              <textarea
                rows={2}
                value={codeSnippet}
                onChange={(e) => setCodeSnippet(e.target.value)}
                placeholder="Ex: f(x) = \int_0^\infty e^{-x^2} dx  ou  loss = criterion(outputs, targets)"
                className="w-full bg-slate-900 text-cyan-300 font-mono text-xs rounded-xl p-2.5 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
              />
            </div>

            {/* Alternativas com Seleção da Correta */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                  Alternativas (Marque o Gabarito) *
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEnableOptionE(!enableOptionE)}
                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    {enableOptionE ? '- Remover Alternativa E' : '+ Adicionar Alternativa E (Padrão ENEM)'}
                  </button>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                    Gabarito: ({correctOptionId})
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {(['A', 'B', 'C', 'D', ...(enableOptionE ? ['E'] : [])] as const).map((letter) => {
                  const isCorrect = correctOptionId === letter;
                  return (
                    <div
                      key={letter}
                      className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                        isCorrect
                          ? 'bg-blue-50/90 dark:bg-blue-950/70 border-blue-500 ring-2 ring-blue-400/20'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setCorrectOptionId(letter)}
                        className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                          isCorrect
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100'
                        }`}
                        title={`Marcar Alternativa ${letter} como correta`}
                      >
                        {letter}
                      </button>

                      <input
                        type="text"
                        required={letter === 'A' || letter === 'B'}
                        value={optionsText[letter]}
                        onChange={(e) =>
                          setOptionsText((prev) => ({ ...prev, [letter]: e.target.value }))
                        }
                        placeholder={`Texto da alternativa ${letter}...`}
                        className="w-full bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none font-medium"
                      />

                      {isCorrect && (
                        <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-bold shrink-0">
                          Correta ✓
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Resolução Comentada & Dica Lumina AI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Resolução Comentada da Resposta
                </label>
                <textarea
                  rows={2}
                  value={correctExplanation}
                  onChange={(e) => setCorrectExplanation(e.target.value)}
                  placeholder="Explicação detalhada de por que esta alternativa é a correta..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  Dica Pedagógica Synapse (Ao Errar)
                </label>
                <textarea
                  rows={2}
                  value={aiHint}
                  onChange={(e) => setAiHint(e.target.value)}
                  placeholder="Dica para guiar o raciocínio sem entregar a resposta..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                />
              </div>
            </div>

            {/* Botões */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{initialQuestion ? 'Atualizar Questão' : 'Salvar Questão de Treino'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
