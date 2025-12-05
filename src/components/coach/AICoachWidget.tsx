import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Target, 
  BookOpen, 
  Brain, 
  Trophy,
  AlertTriangle,
  Lightbulb,
  ChevronRight,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { useAICoach, DailyMission, CoachInsight } from '@/hooks/useAICoach';
import { Link } from 'react-router-dom';

export const AICoachWidget = () => {
  const { gerarMissoesDiarias, obterInsights, loading } = useAICoach();
  const [missoes, setMissoes] = useState<DailyMission[]>([]);
  const [insights, setInsights] = useState<CoachInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setIsLoading(true);
    try {
      const [missoesData, insightsData] = await Promise.all([
        gerarMissoesDiarias(),
        obterInsights()
      ]);
      
      setMissoes(missoesData || []);
      setInsights(insightsData);
    } catch (error) {
      console.error('Erro ao carregar coach:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMissionIcon = (tipo: string) => {
    switch (tipo) {
      case 'estudo': return <BookOpen className="h-4 w-4" />;
      case 'simulado': return <Target className="h-4 w-4" />;
      case 'revisao': return <Brain className="h-4 w-4" />;
      case 'flashcard': return <Sparkles className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getInsightIcon = (tipo: string) => {
    switch (tipo) {
      case 'alerta': return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'sugestao': return <Lightbulb className="h-5 w-5 text-primary" />;
      case 'conquista': return <Trophy className="h-5 w-5 text-success" />;
      default: return <Lightbulb className="h-5 w-5" />;
    }
  };

  const progressoGeral = missoes.length > 0
    ? Math.round((missoes.filter(m => m.completed).length / missoes.length) * 100)
    : 0;

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Carregando coach...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Missões do Dia */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">Missões do Dia</h3>
              <p className="text-sm text-muted-foreground">
                {progressoGeral}% completo
              </p>
            </div>
          </div>
          <Badge variant={progressoGeral === 100 ? "default" : "secondary"}>
            {missoes.filter(m => m.completed).length}/{missoes.length}
          </Badge>
        </div>

        <Progress value={progressoGeral} className="h-2 mb-6" />

        <div className="space-y-3">
          {missoes.map((missao) => (
            <div 
              key={missao.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                missao.completed 
                  ? 'bg-success/10 border-success/20' 
                  : 'bg-secondary/50 border-border hover:border-primary/50'
              }`}
            >
              <div className={`p-2 rounded-lg ${
                missao.completed ? 'bg-success/20 text-success' : 'bg-primary/10 text-primary'
              }`}>
                {missao.completed ? <CheckCircle2 className="h-4 w-4" /> : getMissionIcon(missao.tipo)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${missao.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {missao.titulo}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {missao.descricao}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">
                  {missao.progresso}/{missao.meta}
                </p>
                <Progress 
                  value={(missao.progresso / missao.meta) * 100} 
                  className="h-1 w-16 mt-1" 
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Insights do Coach */}
      {insights.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Insights do Coach
          </h3>
          
          <div className="space-y-3">
            {insights.map((insight, idx) => (
              <div 
                key={idx}
                className={`p-4 rounded-lg border ${
                  insight.tipo === 'alerta' 
                    ? 'bg-warning/10 border-warning/20' 
                    : insight.tipo === 'conquista'
                    ? 'bg-success/10 border-success/20'
                    : 'bg-primary/10 border-primary/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  {getInsightIcon(insight.tipo)}
                  <div className="flex-1">
                    <p className="font-medium">{insight.titulo}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {insight.descricao}
                    </p>
                    {insight.acao && (
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="p-0 h-auto mt-2"
                        asChild
                      >
                        <Link to={insight.acao.rota}>
                          {insight.acao.label}
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
