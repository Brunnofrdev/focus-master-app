import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Target, 
  Clock, 
  Trophy, 
  TrendingUp,
  Calendar,
  Brain,
  BarChart3
} from "lucide-react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";

const Dashboard = () => {
  // Mock data - will be replaced with real data later
  const stats = {
    hoursThisWeek: 18.5,
    hoursToday: 2.5,
    totalHours: 124,
    accuracyRate: 78,
    questionsAnswered: 1247,
    simuladosDone: 12,
    nextReviewDate: "Hoje",
    reviewQuestionsCount: 15,
    daysUntilExam: 89
  };

  const recentActivity = [
    { subject: "Direito Constitucional", hours: 3.5, accuracy: 82, date: "Hoje" },
    { subject: "Português", hours: 2.0, accuracy: 75, date: "Ontem" },
    { subject: "Raciocínio Lógico", hours: 4.0, accuracy: 88, date: "2 dias atrás" }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="mb-2">Bem-vindo de volta! 👋</h1>
          <p className="text-muted-foreground text-lg">
            Continue sua preparação para conquistar sua aprovação
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 gradient-primary text-white">
            <div className="flex items-start justify-between mb-4">
              <Clock className="h-8 w-8" />
              <span className="text-sm bg-white/20 px-2 py-1 rounded">Esta Semana</span>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.hoursThisWeek}h</div>
            <div className="text-white/80">Horas estudadas</div>
          </Card>

          <Card className="p-6 gradient-success text-white">
            <div className="flex items-start justify-between mb-4">
              <Target className="h-8 w-8" />
              <span className="text-sm bg-white/20 px-2 py-1 rounded">Geral</span>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.accuracyRate}%</div>
            <div className="text-white/80">Taxa de acerto</div>
          </Card>

          <Card className="p-6 border-2 hover:shadow-lg transition-smooth">
            <div className="flex items-start justify-between mb-4">
              <Brain className="h-8 w-8 text-primary" />
              <span className="text-sm bg-accent/10 text-accent px-2 py-1 rounded font-semibold">Urgente</span>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.reviewQuestionsCount}</div>
            <div className="text-muted-foreground">Para revisar hoje</div>
          </Card>

          <Card className="p-6 border-2 hover:shadow-lg transition-smooth">
            <div className="flex items-start justify-between mb-4">
              <Calendar className="h-8 w-8 text-warning" />
              <span className="text-sm bg-warning/10 text-warning px-2 py-1 rounded font-semibold">Faltam</span>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.daysUntilExam}</div>
            <div className="text-muted-foreground">Dias até a prova</div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Quick Actions */}
          <Card className="lg:col-span-2 p-6">
            <h3 className="mb-6 flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Ações Rápidas
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Button variant="outline" size="lg" className="h-auto py-6 flex-col gap-2" asChild>
                <Link to="/planner">
                  <BookOpen className="h-8 w-8 text-primary" />
                  <span className="font-semibold">Iniciar Sessão</span>
                  <span className="text-xs text-muted-foreground">Começar a estudar</span>
                </Link>
              </Button>
              
              <Button variant="outline" size="lg" className="h-auto py-6 flex-col gap-2" asChild>
                <Link to="/simulados">
                  <Trophy className="h-8 w-8 text-success" />
                  <span className="font-semibold">Fazer Simulado</span>
                  <span className="text-xs text-muted-foreground">Testar conhecimento</span>
                </Link>
              </Button>
              
              <Button variant="outline" size="lg" className="h-auto py-6 flex-col gap-2" asChild>
                <Link to="/review">
                  <Brain className="h-8 w-8 text-accent" />
                  <span className="font-semibold">Revisar</span>
                  <span className="text-xs text-muted-foreground">{stats.reviewQuestionsCount} questões</span>
                </Link>
              </Button>
              
              <Button variant="outline" size="lg" className="h-auto py-6 flex-col gap-2" asChild>
                <Link to="/statistics">
                  <BarChart3 className="h-8 w-8 text-primary" />
                  <span className="font-semibold">Ver Estatísticas</span>
                  <span className="text-xs text-muted-foreground">Análise detalhada</span>
                </Link>
              </Button>
            </div>
          </Card>

          {/* Today's Progress */}
          <Card className="p-6">
            <h3 className="mb-6 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              Progresso de Hoje
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Meta de Horas</span>
                  <span className="text-sm text-muted-foreground">{stats.hoursToday} / 4h</span>
                </div>
                <Progress value={(stats.hoursToday / 4) * 100} className="h-2" />
              </div>
              
              <div className="pt-4 border-t">
                <div className="text-2xl font-bold mb-1">{stats.hoursToday}h</div>
                <p className="text-sm text-muted-foreground">Estudadas hoje</p>
              </div>

              <Button variant="success" className="w-full" size="lg" asChild>
                <Link to="/planner">
                  Continuar Estudando
                </Link>
              </Button>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="mb-6 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Atividade Recente
          </h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-smooth"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg gradient-primary flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold">{activity.subject}</div>
                    <div className="text-sm text-muted-foreground">{activity.date}</div>
                  </div>
                </div>
                <div className="flex gap-8 items-center">
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Tempo</div>
                    <div className="font-semibold">{activity.hours}h</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Acertos</div>
                    <div className="font-semibold text-success">{activity.accuracy}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;