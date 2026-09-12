import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  X,
  Send,
  Copy,
  Check,
  Plus
} from 'lucide-react';
import { NotebookDoc, Discipline } from '../data/disciplinesData';
import { chatWithGroq } from '../services/ai';
import { Markdown } from './Markdown';

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
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isTyping) return;

    const newMsg: Message = {
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setIsTyping(true);

    const systemInstruction =
      `Você é a "Lumina", tutora de estudos da Plataforma Mendonça preparando o aluno para o ENEM e vestibulares. ` +
      `Está analisando o documento de estudo "${doc.title.replace(/^[^\w\s]+/, '').trim()}" da disciplina ${discipline.name}. ` +
      `Contexto do documento: ${doc.summary}. ` +
      `Responda em português do Brasil, de forma clara, didática e objetiva, ajudando o estudante a sintetizar e fixar o conteúdo.` +
      (doc.sections && doc.sections.length > 0
        ? ` As anotações do documento incluem os seguintes títulos: ${doc.sections.filter(s => s.heading).slice(0, 20).map(s => s.heading).join('; ')}.`
        : '');

    const history = [
      ...messages.map(m => ({ role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant', content: m.text })),
      { role: 'user' as const, content: query },
    ];

    const aiReply = await chatWithGroq(history, systemInstruction);

    // Fallback local (mock) caso a Edge Function não esteja disponível
    let reply = aiReply;
    if (!reply) {
      const qLower = query.toLowerCase();
      if (qLower.includes('resum') || qLower.includes('síntese') || qLower.includes('tópicos')) {
        reply = `📌 **Síntese Estratégica do Documento:**\n\n1. **Núcleo Temático:** ${doc.title.replace(/^[^\w\s]+/, '').trim()} em ${discipline.name}.\n2. **Conceito Chave:** ${doc.summary}\n3. **Axiomas de Destaque:** O texto estrutura a base conceitual e relaciona as fórmulas às condições operatórias no exame.`;
      } else if (qLower.includes('explic') || qLower.includes('fórmula') || qLower.includes('dúvida')) {
        reply = `💡 **Explicação Pedagógica:**\n\nNo contexto de ${discipline.name}, esse princípio demonstra que toda variação contínua possui uma relação direta com o acúmulo de grandezas. Para aplicar em exercícios, sempre isole primeiro os parâmetros conhecidos e cheque as dimensões físicas no SI.`;
      } else if (qLower.includes('quest') || qLower.includes('quiz') || qLower.includes('pergunta')) {
        reply = `🎯 **Desafio Rápido de Fixação:**\n\n*Qual é a principal condição de contorno para a validade do teorema exposto nas anotações?*\n\n> Dica: Pense na continuidade e diferenciabilidade da função no intervalo fechado [a, b].`;
      } else {
        reply = `Entendi sua dúvida sobre "${query}". Ao analisar seu caderno de ${discipline.name}, sugiro revisar este tópico no seu material e praticar com as questões de treino para reforçar a retenção da memória sináptica.`;
      }
    }

    setMessages(prev => [
      ...prev,
      {
        sender: 'ai',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setIsTyping(false);
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
          className="fixed inset-0 bg-[#121214]/40 backdrop-blur-xs sm:hidden pointer-events-auto"
        />

        {/* Floating Chat Window on Left */}
        <motion.div
          initial={{ x: -100, opacity: 0, scale: 0.95 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: -100, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          className="pointer-events-auto relative w-full sm:w-[420px] max-h-[85vh] h-[560px] bg-white dark:bg-[#18181B] rounded-[32px] border border-[#CFE1D6] dark:border-[#22392D]/60 shadow-2xl flex flex-col overflow-hidden z-50 mb-2 sm:mb-0"
          role="dialog"
          aria-modal="true"
          aria-label="Chat de IA Lumina Tutor"
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#2D5A46] via-[#1E3E30] to-[#0E1712] text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm font-display flex items-center gap-1.5">
                  Lumina AI Tutor
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </h3>
                <p className="text-[10px] text-[#FAF9F5] opacity-90 truncate max-w-[220px]">
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
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#EFECE6]/50 dark:bg-[#121214]/40">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs relative group ${
                    msg.sender === 'user'
                      ? 'bg-[#2D5A46] text-white rounded-tr-none'
                      : 'bg-white dark:bg-[#232326] text-[#1C1917] dark:text-[#FAF9F5] rounded-tl-none border border-[#E7E2D9]/80 dark:border-[#3B3B40]/80'
                  }`}
                >
                  <Markdown content={msg.text} />
                  
                  {/* Action Bar for AI response */}
                  {msg.sender === 'ai' && (
                    <div className="mt-2 pt-2 border-t border-[#EFECE6] dark:border-[#3B3B40]/60 flex items-center gap-2 text-[10px]">
                      <button
                        onClick={() => handleCopyText(msg.text, idx)}
                        className="flex items-center gap-1 text-[#A8A29E] hover:text-[#44403C] dark:hover:text-[#E7E5E4] cursor-pointer font-medium"
                      >
                        {copiedIdx === idx ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedIdx === idx ? 'Copiado!' : 'Copiar'}</span>
                      </button>

                      {onInsertTextIntoDoc && (
                        <button
                          onClick={() => onInsertTextIntoDoc(msg.text)}
                          className="flex items-center gap-1 text-[#2D5A46] dark:text-[#52B788] hover:underline cursor-pointer font-semibold ml-auto"
                          title="Inserir resposta como nova anotação no documento"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Adicionar ao Doc</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-[#A8A29E] px-1 mt-1">
                  {msg.time}
                </span>
              </div>
            ))}
            {isTyping && (
              <div className="flex flex-col items-start">
                <div className="max-w-[88%] p-3.5 rounded-2xl text-xs bg-white dark:bg-[#232326] text-[#1C1917] dark:text-[#FAF9F5] rounded-tl-none border border-[#E7E2D9]/80 dark:border-[#3B3B40]/80">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#52B788] animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2D5A46] animate-bounce [animation-delay:0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#21483A] animate-bounce [animation-delay:0.3s]" />
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2 bg-white dark:bg-[#18181B] border-t border-[#EFECE6] dark:border-[#2C2C30] flex items-center gap-1.5 overflow-x-auto shrink-0">
            <button
              onClick={() => handleSend('Resumir tópicos-chave deste documento')}
              className="text-[10px] whitespace-nowrap bg-[#EBF3EF] dark:bg-[#15221B]/60 hover:bg-[#DFEBE3] text-[#224A38] dark:text-[#52B788] px-2.5 py-1 rounded-xl font-bold border border-[#CFE1D6] dark:border-[#22392D]/60 cursor-pointer"
            >
              ⚡ Resumo Rápido
            </button>
            <button
              onClick={() => handleSend('Explique de forma simples o conceito principal')}
              className="text-[10px] whitespace-nowrap bg-[#EFECE6] dark:bg-[#232326] hover:bg-[#E5DFD5] text-[#44403C] dark:text-[#E7E5E4] px-2.5 py-1 rounded-xl font-medium cursor-pointer"
            >
              💡 Explicar Conceito
            </button>
            <button
              onClick={() => handleSend('Crie um exemplo prático aplicado')}
              className="text-[10px] whitespace-nowrap bg-[#EBF3EF] dark:bg-[#15221B]/60 hover:bg-[#DFEBE3] text-[#224A38] dark:text-[#52B788] px-2.5 py-1 rounded-xl font-bold border border-[#CFE1D6] dark:border-[#22392D]/60 cursor-pointer"
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
            className="p-3 bg-white dark:bg-[#18181B] border-t border-[#EFECE6] dark:border-[#2C2C30] flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua dúvida sobre o documento..."
              className="flex-1 bg-white dark:bg-[#18181B] border border-[#E7E2D9] dark:border-[#2C2C30] rounded-2xl px-3.5 py-2.5 text-xs text-[#1C1917] dark:text-[#FAF9F5] placeholder-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#2D5A46]/30 font-medium"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-9 h-9 rounded-2xl bg-[#2D5A46] hover:bg-[#21483A] text-white flex items-center justify-center shadow-md disabled:opacity-40 transition-colors cursor-pointer shrink-0"
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
