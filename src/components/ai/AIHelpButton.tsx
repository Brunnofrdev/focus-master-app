import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Sparkles, Lightbulb, FileText, HelpCircle, Zap } from 'lucide-react';
import { AIChat } from './AIChat';
import { cn } from '@/lib/utils';

interface AIHelpButtonProps {
  context?: string;
  variant?: 'default' | 'icon' | 'fab';
  className?: string;
  side?: 'left' | 'right';
}

export const AIHelpButton = ({ 
  context, 
  variant = 'default',
  className,
  side = 'right'
}: AIHelpButtonProps) => {
  const [open, setOpen] = useState(false);

  if (variant === 'fab') {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            size="lg"
            className={cn(
              "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg",
              "bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70",
              "animate-pulse hover:animate-none",
              className
            )}
          >
            <Sparkles className="w-6 h-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side={side} className="w-full sm:w-[440px] p-0">
          <AIChat initialContext={context} onClose={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    );
  }

  if (variant === 'icon') {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn("text-primary hover:text-primary/80", className)}
            title="Ajuda da IA"
          >
            <Lightbulb className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side={side} className="w-full sm:w-[440px] p-0">
          <AIChat initialContext={context} onClose={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "gap-2 border-primary/30 text-primary hover:bg-primary/10",
            className
          )}
        >
          <Sparkles className="w-4 h-4" />
          Ajuda com IA
        </Button>
      </SheetTrigger>
      <SheetContent side={side} className="w-full sm:w-[440px] p-0">
        <AIChat initialContext={context} onClose={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
};

interface AIQuickActionsProps {
  onAction: (action: string, data?: any) => void;
  isLoading?: boolean;
  className?: string;
}

export const AIQuickActions = ({ onAction, isLoading, className }: AIQuickActionsProps) => {
  const actions = [
    { id: 'explain', label: 'Explicar', icon: HelpCircle, color: 'text-blue-500' },
    { id: 'summary', label: 'Resumir', icon: FileText, color: 'text-green-500' },
    { id: 'flashcards', label: 'Flashcards', icon: Zap, color: 'text-yellow-500' },
    { id: 'questions', label: 'Questões', icon: Lightbulb, color: 'text-purple-500' },
  ];

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.id}
            variant="outline"
            size="sm"
            onClick={() => onAction(action.id)}
            disabled={isLoading}
            className="gap-1.5"
          >
            <Icon className={cn("w-3.5 h-3.5", action.color)} />
            {action.label}
          </Button>
        );
      })}
    </div>
  );
};
