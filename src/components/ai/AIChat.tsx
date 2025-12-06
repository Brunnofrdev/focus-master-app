import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Sparkles,
  X,
  Trash2,
  Copy,
  Check,
  FileText,
  Brain,
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import { useAI } from '@/hooks/useAI';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatProps {
  initialContext?: string;
  onClose?: () => void;
  className?: string;
  showModes?: boolean;
}

type ChatMode = 'chat' | 'resumo' | 'flashcards' | 'explicar';

const QUICK_PROMPTS = [
  { icon: HelpCircle, label: 'Explicar conceito', prompt: 'Explique de forma didática o conceito de ' },
  { icon: FileText, label: 'Resumir tema', prompt: 'Faça um resumo objetivo sobre ' },
  { icon: Brain, label: 'Criar flashcards', prompt: 'Crie 5 flashcards sobre ' },
  { icon: Lightbulb, label: 'Dicas de estudo', prompt: 'Quais são as melhores estratégias para estudar ' },
];

export const AIChat = ({ initialContext, onClose, className, showModes = true }: AIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [mode, setMode] = useState<ChatMode>('chat');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { isLoading, streamingContent, sendMessage, generateSummary, cancelRequest } = useAI();

  // Cache local de mensagens
  const cacheKey = `ai_chat_history_${initialContext?.substring(0, 20) || 'general'}`;
  
  useEffect(() => {
    // Carregar histórico do cache
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
      } catch (e) {
        console.error('Error loading cached messages:', e);
      }
    } else if (initialContext && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: `Olá! Sou seu assistente de estudos para concursos. 🎯\n\n${initialContext ? `Contexto: ${initialContext}\n\n` : ''}Como posso ajudar você hoje?\n\n**Dicas:**\n- Pergunte sobre qualquer tema de concursos\n- Peça explicações detalhadas\n- Solicite resumos de conteúdos\n- Crie flashcards automaticamente`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [initialContext]);

  // Salvar no cache quando mensagens mudam
  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem(cacheKey, JSON.stringify(messages.slice(-50))); // Keep last 50 messages
    }
  }, [messages, cacheKey]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');

    try {
      let response: string;
      
      if (mode === 'resumo') {
        response = await generateSummary(currentInput);
      } else {
        const apiMessages = messages
          .filter(m => m.id !== 'welcome')
          .map(m => ({ role: m.role, content: m.content }));
        
        apiMessages.push({ role: 'user', content: currentInput });
        response = await sendMessage(apiMessages);
      }

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro. Tente novamente.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const clearHistory = () => {
    localStorage.removeItem(cacheKey);
    setMessages([]);
    if (initialContext) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: `Olá! Sou seu assistente de estudos para concursos. Como posso ajudar você hoje?`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  };

  const formatContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      // Headers
      if (line.startsWith('###')) {
        return <h4 key={i} className="font-bold text-base mt-3 mb-1">{line.slice(3).trim()}</h4>;
      }
      if (line.startsWith('##')) {
        return <h3 key={i} className="font-bold text-lg mt-4 mb-2">{line.slice(2).trim()}</h3>;
      }
      if (line.startsWith('#')) {
        return <h2 key={i} className="font-bold text-xl mt-4 mb-2">{line.slice(1).trim()}</h2>;
      }
      
      // Bold text
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-semibold my-1">{line.slice(2, -2)}</p>;
      }
      
      // List items
      if (line.startsWith('- ') || line.startsWith('• ')) {
        return <li key={i} className="ml-4 my-0.5">{line.slice(2)}</li>;
      }
      if (/^\d+\.\s/.test(line)) {
        return <li key={i} className="ml-4 my-0.5 list-decimal">{line.replace(/^\d+\.\s/, '')}</li>;
      }
      
      // Empty lines
      if (line.trim() === '') {
        return <br key={i} />;
      }
      
      // Regular paragraphs with inline formatting
      const formattedLine = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>');
      
      return <p key={i} className="my-1" dangerouslySetInnerHTML={{ __html: formattedLine }} />;
    });
  };

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">Assistente IA</h3>
            <p className="text-xs text-muted-foreground">Especialista em concursos</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={clearHistory}
            className="h-8 w-8"
            title="Limpar histórico"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Mode Selector */}
      {showModes && (
        <div className="p-2 border-b bg-muted/30 flex gap-2 overflow-x-auto">
          {[
            { value: 'chat', label: 'Chat', icon: Bot },
            { value: 'resumo', label: 'Resumir', icon: FileText },
            { value: 'flashcards', label: 'Flashcards', icon: Brain },
          ].map(({ value, label, icon: Icon }) => (
            <Button
              key={value}
              variant={mode === value ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode(value as ChatMode)}
              className="gap-1.5 shrink-0"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Button>
          ))}
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 group relative",
                  message.role === 'user'
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted rounded-bl-sm"
                )}
              >
                <div className="text-sm leading-relaxed">
                  {formatContent(message.content)}
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/20">
                  <span className="text-[10px] opacity-60">
                    {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {message.role === 'assistant' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleCopy(message.content, message.id)}
                    >
                      {copiedId === message.id ? (
                        <Check className="w-3 h-3 text-success" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-secondary-foreground" />
                </div>
              )}
            </div>
          ))}

          {/* Streaming message */}
          {isLoading && streamingContent && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="max-w-[85%] rounded-2xl rounded-bl-sm px-4 py-3 bg-muted">
                <div className="text-sm leading-relaxed">
                  {formatContent(streamingContent)}
                </div>
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {isLoading && !streamingContent && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 animate-pulse">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="rounded-2xl rounded-bl-sm px-4 py-3 bg-muted">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-sm text-muted-foreground">Pensando...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Quick Prompts */}
      {messages.length <= 1 && (
        <div className="p-3 border-t bg-muted/20">
          <p className="text-xs text-muted-foreground mb-2">Sugestões rápidas:</p>
          <div className="flex gap-2 flex-wrap">
            {QUICK_PROMPTS.map(({ icon: Icon, label, prompt }) => (
              <Button
                key={label}
                variant="outline"
                size="sm"
                className="text-xs h-7 gap-1"
                onClick={() => handleQuickPrompt(prompt)}
              >
                <Icon className="h-3 w-3" />
                {label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t bg-card">
        <div className="flex gap-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              mode === 'resumo' 
                ? "Cole o texto para resumir..." 
                : mode === 'flashcards'
                ? "Descreva o tema para criar flashcards..."
                : "Digite sua pergunta..."
            }
            disabled={isLoading}
            className="flex-1 min-h-[44px] max-h-[120px] resize-none"
            rows={1}
          />
          {isLoading ? (
            <Button variant="destructive" size="icon" onClick={cancelRequest} className="shrink-0">
              <X className="w-4 h-4" />
            </Button>
          ) : (
            <Button size="icon" onClick={handleSend} disabled={!input.trim()} className="shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          IA especializada em concursos públicos • Pressione Enter para enviar
        </p>
      </div>
    </div>
  );
};