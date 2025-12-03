import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Clock, 
  Target, 
  ChevronRight,
  Zap,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";

interface DisciplinaRevisao {
  disciplina: string;
  questoes: number;
  hojeCount: number;
  atrasadas: number;
  facilidadeMedia: number;
  ultimaRevisao?: string;
}

interface ReviewQueueProps {
  disciplinas: DisciplinaRevisao[];
  onRevisar: (disciplina: string) => void;
  loading?: boolean;
}

export const ReviewQueue = ({ disciplinas, onRevisar, loading }: ReviewQueueProps) => {
  const getPrioridade = (item: DisciplinaRevisao) => {
    if (item.atrasadas > 0) return { label: 'Urgente', color: 'bg-destructive text-destructive-foreground' };
    if (item.hojeCount > 0) return { label: 'Hoje', color: 'bg-warning text-warning-foreground' };
    return { label: 'Agendado', color: 'bg-muted text-muted-foreground' };
  };
  
  const getDominioLevel = (facilidade: number) => {
    if (facilidade >= 2.2) return { label: 'Dominado', color: 'text-success', percent: 90 };
    if (facilidade >= 1.8) return { label: 'Bom', color: 'text-primary', percent: 70 };
    if (facilidade >= 1.5) return { label: 'Aprendendo', color: 'text-warning', percent: 50 };
    return { label: 'Novo', color: 'text-muted-foreground', percent: 20 };
  };

  if (disciplinas.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-8 w-8 text-success" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Tudo em dia! 🎉</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Você não tem revisões pendentes no momento. Continue praticando simulados 
          para adicionar novas questões à sua fila de revisão.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Fila de Revisão</h3>
            <p className="text-sm text-muted-foreground">
              {disciplinas.length} disciplinas • {disciplinas.reduce((a, b) => a + b.questoes, 0)} questões
            </p>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        {disciplinas.map((item, idx) => {
          const prioridade = getPrioridade(item);
          const dominio = getDominioLevel(item.facilidadeMedia);
          
          return (
            <Card 
              key={idx} 
              className={`p-5 hover:shadow-md transition-all ${
                item.atrasadas > 0 ? 'border-l-4 border-l-destructive' :
                item.hojeCount > 0 ? 'border-l-4 border-l-warning' :
                'border-l-4 border-l-muted'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Info principal */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold truncate">{item.disciplina}</h4>
                    <Badge className={prioridade.color} variant="secondary">
                      {prioridade.label}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Target className="h-4 w-4" />
                      <span>{item.questoes} questões</span>
                    </div>
                    
                    {item.atrasadas > 0 && (
                      <div className="flex items-center gap-1.5 text-destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <span>{item.atrasadas} atrasadas</span>
                      </div>
                    )}
                    
                    {item.hojeCount > 0 && (
                      <div className="flex items-center gap-1.5 text-warning">
                        <Zap className="h-4 w-4" />
                        <span>{item.hojeCount} para hoje</span>
                      </div>
                    )}
                    
                    {item.ultimaRevisao && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        <span>Última: {new Date(item.ultimaRevisao).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Barra de domínio */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Nível de domínio</span>
                      <span className={`font-medium ${dominio.color}`}>{dominio.label}</span>
                    </div>
                    <Progress value={dominio.percent} className="h-1.5" />
                  </div>
                </div>
                
                {/* Ação */}
                <div className="flex-shrink-0">
                  <Button 
                    onClick={() => onRevisar(item.disciplina)}
                    disabled={loading}
                    variant={item.atrasadas > 0 || item.hojeCount > 0 ? "default" : "outline"}
                    className="w-full lg:w-auto gap-2"
                  >
                    Revisar
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
