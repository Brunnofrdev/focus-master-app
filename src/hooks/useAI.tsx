import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

type AIAction = 'chat' | 'summary' | 'explain_question' | 'create_flashcards' | 'create_questions';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface UseAIReturn {
  isLoading: boolean;
  error: string | null;
  streamingContent: string;
  sendMessage: (messages: Message[]) => Promise<string>;
  generateSummary: (text: string) => Promise<string>;
  explainQuestion: (question: string, answer: string, banca?: string) => Promise<string>;
  createFlashcards: (content: string) => Promise<any[]>;
  createQuestions: (topic: string, banca?: string) => Promise<any[]>;
  cancelRequest: () => void;
}

const AI_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

export const useAI = (): UseAIReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState('');
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const { toast } = useToast();

  const cancelRequest = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsLoading(false);
    }
  }, [abortController]);

  const streamRequest = useCallback(async (
    action: AIAction,
    body: Record<string, unknown>
  ): Promise<string> => {
    setIsLoading(true);
    setError(null);
    setStreamingContent('');

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const response = await fetch(AI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ action, ...body }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || 'Erro ao processar solicitação';
        
        if (response.status === 429) {
          toast({
            title: 'Limite atingido',
            description: 'Muitas requisições. Aguarde um momento.',
            variant: 'destructive',
          });
        } else if (response.status === 402) {
          toast({
            title: 'Créditos esgotados',
            description: 'Entre em contato com o suporte.',
            variant: 'destructive',
          });
        }
        
        throw new Error(errorMessage);
      }

      if (!response.body) {
        throw new Error('Resposta sem conteúdo');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullContent += content;
              setStreamingContent(fullContent);
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      // Process remaining buffer
      if (buffer.trim()) {
        for (let raw of buffer.split('\n')) {
          if (!raw) continue;
          if (raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullContent += content;
              setStreamingContent(fullContent);
            }
          } catch { /* ignore */ }
        }
      }

      return fullContent;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return '';
      }
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  }, [toast]);

  const sendMessage = useCallback(async (messages: Message[]): Promise<string> => {
    return streamRequest('chat', { messages });
  }, [streamRequest]);

  const generateSummary = useCallback(async (text: string): Promise<string> => {
    return streamRequest('summary', { text });
  }, [streamRequest]);

  const explainQuestion = useCallback(async (
    question: string, 
    answer: string, 
    banca?: string
  ): Promise<string> => {
    return streamRequest('explain_question', { question, answer, banca });
  }, [streamRequest]);

  const createFlashcards = useCallback(async (content: string): Promise<any[]> => {
    const result = await streamRequest('create_flashcards', { content });
    try {
      const jsonMatch = result.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return [];
    } catch {
      console.error('Failed to parse flashcards:', result);
      return [];
    }
  }, [streamRequest]);

  const createQuestions = useCallback(async (topic: string, banca?: string): Promise<any[]> => {
    const result = await streamRequest('create_questions', { topic, banca });
    try {
      const jsonMatch = result.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return [];
    } catch {
      console.error('Failed to parse questions:', result);
      return [];
    }
  }, [streamRequest]);

  return {
    isLoading,
    error,
    streamingContent,
    sendMessage,
    generateSummary,
    explainQuestion,
    createFlashcards,
    createQuestions,
    cancelRequest,
  };
};
