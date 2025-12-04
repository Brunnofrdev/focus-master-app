import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Copy, Check, Sparkles, RefreshCw } from 'lucide-react';
import { useAI } from '@/hooks/useAI';
import { cn } from '@/lib/utils';

interface AIExplainModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: string;
  answer: string;
  banca?: string;
  alternatives?: {
    a: string;
    b: string;
    c: string;
    d: string;
    e?: string;
  };
}

export const AIExplainModal = ({
  open,
  onOpenChange,
  question,
  answer,
  banca,
  alternatives,
}: AIExplainModalProps) => {
  const [explanation, setExplanation] = useState('');
  const [copied, setCopied] = useState(false);
  const { isLoading, streamingContent, explainQuestion, cancelRequest } = useAI();

  useEffect(() => {
    if (open && !explanation) {
      generateExplanation();
    }
  }, [open]);

  const generateExplanation = async () => {
    setExplanation('');
    
    let fullQuestion = question;
    if (alternatives) {
      fullQuestion += `\n\nA) ${alternatives.a}\nB) ${alternatives.b}\nC) ${alternatives.c}\nD) ${alternatives.d}`;
      if (alternatives.e) {
        fullQuestion += `\nE) ${alternatives.e}`;
      }
    }

    try {
      const result = await explainQuestion(fullQuestion, answer, banca);
      setExplanation(result);
    } catch (error) {
      console.error('Error explaining question:', error);
    }
  };

  const handleCopy = async () => {
    const content = explanation || streamingContent;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    cancelRequest();
    onOpenChange(false);
  };

  const formatContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('##')) {
        return <h3 key={i} className="font-bold text-lg mt-4 mb-2 text-primary">{line.replace(/^#+\s*/, '')}</h3>;
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-semibold my-2">{line.slice(2, -2)}</p>;
      }
      if (line.match(/^\*\*[^*]+\*\*/)) {
        const parts = line.split(/(\*\*[^*]+\*\*)/);
        return (
          <p key={i} className="my-1">
            {parts.map((part, j) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={j}>{part.slice(2, -2)}</strong>;
              }
              return part;
            })}
          </p>
        );
      }
      if (line.startsWith('- ') || line.startsWith('• ')) {
        return <li key={i} className="ml-6 my-1">{line.slice(2)}</li>;
      }
      if (line.match(/^\d+\./)) {
        return <li key={i} className="ml-6 my-1 list-decimal">{line.replace(/^\d+\.\s*/, '')}</li>;
      }
      if (line.trim() === '') {
        return <br key={i} />;
      }
      return <p key={i} className="my-1">{line}</p>;
    });
  };

  const displayContent = explanation || streamingContent;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            Explicação Detalhada
            {banca && (
              <span className="text-xs bg-secondary px-2 py-1 rounded-full ml-2">
                {banca}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {/* Question Preview */}
            <div className="p-4 bg-muted/50 rounded-lg border">
              <p className="text-sm font-medium text-muted-foreground mb-2">Questão:</p>
              <p className="text-sm">{question.substring(0, 200)}{question.length > 200 ? '...' : ''}</p>
              <p className="text-sm font-medium text-primary mt-2">Gabarito: {answer}</p>
            </div>

            {/* Explanation */}
            <div className="prose prose-sm max-w-none">
              {isLoading && !displayContent && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
                  <span className="text-muted-foreground">Gerando explicação detalhada...</span>
                </div>
              )}

              {displayContent && (
                <div className="text-sm leading-relaxed">
                  {formatContent(displayContent)}
                  {isLoading && (
                    <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
                  )}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={generateExplanation}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            Regenerar
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={!displayContent}
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-success" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar
                </>
              )}
            </Button>
            <Button size="sm" onClick={handleClose}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
