import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Flame, 
  Target, 
  TrendingUp, 
  Calendar,
  Award
} from "lucide-react";

interface ReviewStatsProps {
  stats: {
    hoje: number;
    amanha: number;
    proximos7dias: number;
    total: number;
    streak?: number;
    totalRevisadas?: number;
    taxaAcerto?: number;
  };
}

export const ReviewStats = ({ stats }: ReviewStatsProps) => {
  const statsCards = [
    {
      icon: Brain,
      label: "Para Hoje",
      value: stats.hoje,
      color: stats.hoje > 0 ? "text-warning" : "text-success",
      bgColor: stats.hoje > 0 ? "bg-warning/10" : "bg-success/10",
      description: stats.hoje > 0 ? "Revisões pendentes" : "Em dia!"
    },
    {
      icon: Calendar,
      label: "Para Amanhã",
      value: stats.amanha,
      color: "text-primary",
      bgColor: "bg-primary/10",
      description: "Próximas revisões"
    },
    {
      icon: Target,
      label: "Próximos 7 dias",
      value: stats.proximos7dias,
      color: "text-accent-foreground",
      bgColor: "bg-accent/50",
      description: "Na semana"
    },
    {
      icon: Flame,
      label: "Streak",
      value: `${stats.streak || 0} dias`,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      description: "Sequência de estudos"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statsCards.map((stat, idx) => (
        <Card 
          key={idx} 
          className={`p-5 ${stat.bgColor} border-none hover:scale-[1.02] transition-transform`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
          </div>
          <div className={`text-3xl font-bold ${stat.color} mb-1`}>
            {stat.value}
          </div>
          <div className="text-sm font-medium text-foreground">{stat.label}</div>
          <div className="text-xs text-muted-foreground mt-1">{stat.description}</div>
        </Card>
      ))}
    </div>
  );
};

export const ReviewProgress = ({ 
  totalRevisadas = 0, 
  taxaAcerto = 0,
  metaDiaria = 20 
}: { 
  totalRevisadas?: number; 
  taxaAcerto?: number;
  metaDiaria?: number;
}) => {
  const progressoMeta = Math.min((totalRevisadas / metaDiaria) * 100, 100);
  
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Award className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Progresso do Dia</h3>
          <p className="text-sm text-muted-foreground">
            Meta: {metaDiaria} revisões diárias
          </p>
        </div>
      </div>
      
      <div className="space-y-6">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Revisões completadas</span>
            <span className="font-semibold">{totalRevisadas}/{metaDiaria}</span>
          </div>
          <Progress value={progressoMeta} className="h-3" />
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Taxa de acerto</span>
            <span className={`font-semibold ${
              taxaAcerto >= 70 ? 'text-success' : 
              taxaAcerto >= 50 ? 'text-warning' : 'text-destructive'
            }`}>
              {taxaAcerto.toFixed(0)}%
            </span>
          </div>
          <Progress 
            value={taxaAcerto} 
            className={`h-3 ${
              taxaAcerto >= 70 ? '[&>div]:bg-success' : 
              taxaAcerto >= 50 ? '[&>div]:bg-warning' : '[&>div]:bg-destructive'
            }`}
          />
        </div>
        
        <div className="pt-4 border-t flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-success" />
            <span className="text-sm">Desempenho</span>
          </div>
          <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
            taxaAcerto >= 80 ? 'bg-success/10 text-success' :
            taxaAcerto >= 60 ? 'bg-primary/10 text-primary' :
            taxaAcerto >= 40 ? 'bg-warning/10 text-warning' :
            'bg-destructive/10 text-destructive'
          }`}>
            {taxaAcerto >= 80 ? 'Excelente' :
             taxaAcerto >= 60 ? 'Bom' :
             taxaAcerto >= 40 ? 'Regular' : 'Precisa melhorar'}
          </span>
        </div>
      </div>
    </Card>
  );
};
