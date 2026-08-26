import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Zap,
  HelpCircle,
  Lightbulb,
  Copy,
  Check,
  Plus
} from 'lucide-react';
import { NotebookDoc, Discipline } from '../data/disciplinesData';

interface DocAiChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  doc: NotebookDoc;
  discipline: Discipline;
  onInsertTextIntoDoc?: (text: string) => void;
}

interface Message {
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

export const DocAiChatDrawer: React.FC<DocAiChatDrawerProps> = ({
  isOpen,
  onClose,
  doc,
  discipline,
  onInsertTextIntoDoc
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: `Olá! Estou analisando seu documento "${doc.title.replace(/^[^\w\s]+/, '').trim()}" de ${discipline.name}. Como posso ajudar você a sintetizar, esclarecer dúvidas ou expandir seus conceitos hoje?`,
      time: 'Agora'
    }
  ]);
  const [input, setInput] = useState('');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const newMsg: Message = {
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setInput('');

    // Generate Contextual AI Response
    setTimeout(() => {
      let aiReply = '';
      const qLower = query.toLowerCase();

      if (qLower.includes('resum') || qLower.includes('síntese') || qLower.includes('tópicos')) {
        aiReply = `📌 **Síntese Estratégica do Documento:**\n\n1. **Núcleo Temático:** ${doc.title.replace(/^[^\w\s]+/, '').trim()} em ${discipline.name}.\n2. **Conceito Chave:** ${doc.summary}\n3. **Axiomas de Destaque:** O texto estrutura a base conceitual e relaciona as fórmulas às condições operatórias no exame.`;
      } else if (qLower.includes('explic') || qLower.includes('fórmula') || qLower.includes('dúvida')) {
        aiReply = `💡 **Explicação Pedagógica:**\n\nNo contexto de ${discipline.name}, esse princípio demonstra que toda variação contínua possui uma relação direta com o acúmulo de grandezas. Para aplicar em exercícios, sempre isole primeiro os parâmetros conhecidos e cheque as dimensões físicas no SI.`;
      } else if (qLower.includes('quest') || qLower.includes('quiz') || qLower.includes('pergunta')) {
        aiReply = `🎯 **Desafio Rápido de Fixação:**\n\n*Qual é a principal condição de contorno para a validade do teorema exposto nas anotações?*\n\n> Dica: Pense na continuidade e diferenciabilidade da função no intervalo fechado [a, b].`;
      } else {
        aiReply = `Entendi sua dúvida sobre "${query}". Ao analisar seu caderno de ${discipline.name}, sugiro conectar este tópico com os nós conceituais no Mapa Neural para maximizar a retenção da memória sináptica.`;
      }

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: aiReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 500);
  };

  const handleCopyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] pointer-events-none flex items-end sm:items-center justify-start p-3 sm:p-6">
        {/* Backdrop for mobile */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs sm:hidden pointer-events-auto"
        />

        {/* Floating Chat Window on Left */}
        <motion.div
          initial={{ x: -100, opacity: 0, scale: 0.95 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: -100, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          className="pointer-events-auto relative w-full sm:w-[420px] max-h-[85vh] h-[560px] bg-white dark:bg-slate-900 rounded-[32px] border border-purple-200 dark:border-purple-900/60 shadow-2xl flex flex-col overflow-hidden z-50 mb-2 sm:mb-0"
          role="dialog"
          aria-modal="true"
          aria-label="Chat de IA Lumina Tutor"
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm font-display flex items-center gap-1.5">
                  Lumina AI Tutor
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </h3>
                <p className="text-[10px] text-purple-100 opacity-90 truncate max-w-[220px]">
                  Contexto: {doc.title.replace(/^[^\w\s]+/, '').trim()}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Fechar chat de IA"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 dark:bg-slate-950/40">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs relative group ${
                    msg.sender === 'user'
                      ? 'bg-purple-600 text-white rounded-tr-none'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/80 dark:border-slate-700/80'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  
                  {/* Action Bar for AI response */}
                  {msg.sender === 'ai' && (
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-2 text-[10px]">
                      <button
                        onClick={() => handleCopyText(msg.text, idx)}
                        className="flex items-center gap-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer font-medium"
                      >
                        {copiedIdx === idx ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedIdx === idx ? 'Copiado!' : 'Copiar'}</span>
                      </button>

                      {onInsertTextIntoDoc && (
                        <button
                          onClick={() => onInsertTextIntoDoc(msg.text)}
                          className="flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:underline cursor-pointer font-semibold ml-auto"
                          title="Inserir resposta como nova anotação no documento"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Adicionar ao Doc</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-slate-400 px-1 mt-1">
                  {msg.time}
                </span>
              </div>
            ))}
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto shrink-0">
            <button
              onClick={() => handleSend('Resumir tópicos-chave deste documento')}
              className="text-[10px] whitespace-nowrap bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded-xl font-bold border border-purple-200 dark:border-purple-800/60 cursor-pointer"
            >
              ⚡ Resumo Rápido
            </button>
            <button
              onClick={() => handleSend('Explique de forma simples o conceito principal')}
              className="text-[10px] whitespace-nowrap bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 px-2.5 py-1 rounded-xl font-medium cursor-pointer"
            >
              💡 Explicar Conceito
            </button>
            <button
              onClick={() => handleSend('Crie um exemplo prático aplicado')}
              className="text-[10px] whitespace-nowrap bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-xl font-bold border border-blue-200 dark:border-blue-800/60 cursor-pointer"
            >
              🔬 Exemplo Prático
            </button>
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua dúvida sobre o documento..."
              className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-9 h-9 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center shadow-md disabled:opacity-40 transition-colors cursor-pointer shrink-0"
              aria-label="Enviar mensagem"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
