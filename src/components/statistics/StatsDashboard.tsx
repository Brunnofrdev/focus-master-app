import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Target,
  Award,
  TrendingUp,
  Flame,
  Brain,
  Clock,
  CheckCircle2,
  XCircle,
  Zap,
  Trophy,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: number;
  description?: string;
  color?: string;
  className?: string;
}

export const StatsCard = ({ 
  label, 
  value, 
  icon: Icon, 
  trend, 
  description,
  color = 'primary',
  className 
}: StatsCardProps) => {
  const colorClasses: Record<string, string> = {
    primary: 'from-primary/20 to-primary/5 text-primary',
    success: 'from-success/20 to-success/5 text-success',
    warning: 'from-warning/20 to-warning/5 text-warning',
    destructive: 'from-destructive/20 to-destructive/5 text-destructive',
    accent: 'from-accent/20 to-accent/5 text-accent',
  };

  return (
    <Card className={cn(
      "relative overflow-hidden group hover:shadow-lg transition-all duration-300",
      className
    )}>
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-50",
        colorClasses[color]
      )} />
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            `bg-${color}/10`
          )}>
            <Icon className={cn("w-6 h-6", `text-${color}`)} />
          </div>
          {trend !== undefined && (
            <Badge 
              variant={trend >= 0 ? 'default' : 'destructive'}
              className="text-xs"
            >
              {trend >= 0 ? '+' : ''}{trend}%
            </Badge>
          )}
        </div>
        <div className="text-3xl font-bold mb-1">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
        {description && (
          <div className="text-xs text-muted-foreground/80 mt-2">{description}</div>
        )}
      </div>
    </Card>
  );
};

interface PerformanceRingProps {
  value: number;
  label: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PerformanceRing = ({ value, label, color = 'primary', size = 'md' }: PerformanceRingProps) => {
  const sizeClasses = {
    sm: { ring: 'w-20 h-20', text: 'text-lg', label: 'text-xs' },
    md: { ring: 'w-28 h-28', text: 'text-2xl', label: 'text-sm' },
    lg: { ring: 'w-36 h-36', text: 'text-3xl', label: 'text-base' },
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className={cn("relative", sizeClasses[size].ring)}>
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-muted/20"
          />
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            className={cn(`text-${color}`)}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset,
              transition: 'stroke-dashoffset 1s ease-out',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("font-bold", sizeClasses[size].text)}>{value}%</span>
        </div>
      </div>
      <span className={cn("mt-2 text-muted-foreground", sizeClasses[size].label)}>{label}</span>
    </div>
  );
};

interface StreakDisplayProps {
  currentStreak: number;
  bestStreak: number;
  className?: string;
}

export const StreakDisplay = ({ currentStreak, bestStreak, className }: StreakDisplayProps) => {
  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
          <Flame className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{currentStreak}</span>
            <span className="text-muted-foreground">dias consecutivos</span>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Trophy className="w-4 h-4 text-yellow-500" />
              Recorde: {bestStreak} dias
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

interface DisciplineProgressProps {
  disciplines: Array<{
    name: string;
    accuracy: number;
    questionsAnswered: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  className?: string;
}

export const DisciplineProgress = ({ disciplines, className }: DisciplineProgressProps) => {
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-success" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-destructive rotate-180" />;
      default: return <div className="w-4 h-4 bg-muted rounded-full" />;
    }
  };

  const getProgressColor = (accuracy: number) => {
    if (accuracy >= 80) return 'bg-success';
    if (accuracy >= 60) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <Card className={cn("p-6", className)}>
      <h3 className="font-semibold mb-6 flex items-center gap-2">
        <Brain className="w-5 h-5 text-primary" />
        Desempenho por Disciplina
      </h3>
      <div className="space-y-4">
        {disciplines.map((disc, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{disc.name}</span>
                {getTrendIcon(disc.trend)}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {disc.questionsAnswered} questões
                </span>
                <Badge variant="outline" className="text-xs">
                  {disc.accuracy}%
                </Badge>
              </div>
            </div>
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn("absolute inset-y-0 left-0 rounded-full transition-all duration-500", getProgressColor(disc.accuracy))}
                style={{ width: `${disc.accuracy}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

interface StudyHeatmapProps {
  data: Array<{ date: string; hours: number }>;
  className?: string;
}

export const StudyHeatmap = ({ data, className }: StudyHeatmapProps) => {
  const maxHours = Math.max(...data.map(d => d.hours), 1);
  
  const getIntensity = (hours: number) => {
    if (hours === 0) return 'bg-muted/30';
    const ratio = hours / maxHours;
    if (ratio > 0.75) return 'bg-primary';
    if (ratio > 0.5) return 'bg-primary/70';
    if (ratio > 0.25) return 'bg-primary/40';
    return 'bg-primary/20';
  };

  const weeks = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }

  return (
    <Card className={cn("p-6", className)}>
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-primary" />
        Frequência de Estudos
      </h3>
      <div className="flex gap-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className={cn(
                  "w-4 h-4 rounded-sm transition-colors",
                  getIntensity(day.hours)
                )}
                title={`${day.date}: ${day.hours}h`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
        <span>Menos</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-muted/30" />
          <div className="w-3 h-3 rounded-sm bg-primary/20" />
          <div className="w-3 h-3 rounded-sm bg-primary/40" />
          <div className="w-3 h-3 rounded-sm bg-primary/70" />
          <div className="w-3 h-3 rounded-sm bg-primary" />
        </div>
        <span>Mais</span>
      </div>
    </Card>
  );
};

interface QuickStatsRowProps {
  stats: {
    totalCorrect: number;
    totalWrong: number;
    avgTimePerQuestion: number;
    todayQuestions: number;
  };
  className?: string;
}

export const QuickStatsRow = ({ stats, className }: QuickStatsRowProps) => {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
      <Card className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5 text-success" />
        </div>
        <div>
          <div className="text-2xl font-bold">{stats.totalCorrect}</div>
          <div className="text-xs text-muted-foreground">Acertos</div>
        </div>
      </Card>

      <Card className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
          <XCircle className="w-5 h-5 text-destructive" />
        </div>
        <div>
          <div className="text-2xl font-bold">{stats.totalWrong}</div>
          <div className="text-xs text-muted-foreground">Erros</div>
        </div>
      </Card>

      <Card className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
          <Clock className="w-5 h-5 text-warning" />
        </div>
        <div>
          <div className="text-2xl font-bold">{stats.avgTimePerQuestion}s</div>
          <div className="text-xs text-muted-foreground">Média/questão</div>
        </div>
      </Card>

      <Card className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Zap className="w-5 h-5 text-primary" />
        </div>
        <div>
          <div className="text-2xl font-bold">{stats.todayQuestions}</div>
          <div className="text-xs text-muted-foreground">Hoje</div>
        </div>
      </Card>
    </div>
  );
};
