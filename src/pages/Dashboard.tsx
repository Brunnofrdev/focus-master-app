import { useState, useEffect } from "react";
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
  BarChart3,
  Sparkles,
  Library
} from "lucide-react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { AICoachWidget } from "@/components/coach/AICoachWidget";
import { AIHelpButton } from "@/components/ai";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    hoursThisWeek: 0,
    hoursToday: 0,
    totalHours: 0,
    accuracyRate: 0,
    questionsAnswered: 0,
    simuladosDone: 0,
    nextReviewDate: "Hoje",
    reviewQuestionsCount: 0,
    flashcardsPendentes: 0,
    daysUntilExam: 0
  });

  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      carregarDados();
    }
  }, [user]);

  const carregarDados = async () => {
    if (!user) return;

    try {
      const hoje = new Date();
      const inicioDia = new Date(hoje.setHours(0, 0, 0, 0)).toISOString().split('T')[0];
      const primeiroDiaSemana = new Date(hoje);
      primeiroDiaSemana.setDate(hoje.getDate() - hoje.getDay() + 1);
      const ultimoDiaSemana = new Date(primeiroDiaSemana);
      ultimoDiaSemana.setDate(primeiroDiaSemana.getDate() + 6);

      // Horas desta semana
      const { data: sessoesSemana } = await supabase
        .from('sessoes_estudo')
        .select('duracao_minutos')
        .eq('user_id', user.id)
        .gte('data', primeiroDiaSemana.toISOString().split('T')[0])
        .lte('data', ultimoDiaSemana.toISOString().split('T')[0]);

      const horasSemana = sessoesSemana?.reduce((acc, s) => acc + (s.duracao_minutos / 60), 0) || 0;

      // Horas hoje
      const { data: sessoesHoje } = await supabase
        .from('sessoes_estudo')
        .select('duracao_minutos')
        .eq('user_id', user.id)
        .eq('data', inicioDia);

      const horasHoje = sessoesHoje?.reduce((acc, s) => acc + (s.duracao_minutos / 60), 0) || 0;

      // Total de horas
      const { data: todasSessoes } = await supabase
        .from('sessoes_estudo')
        .select('duracao_minutos')
        .eq('user_id', user.id);

      const horasTotal = todasSessoes?.reduce((acc, s) => acc + (s.duracao_minutos / 60), 0) || 0;

      // Questões respondidas e taxa de acerto
      const { data: respostas } = await supabase
        .from('simulado_questoes')
        .select('resposta_usuario, correto, simulados!inner(user_id)')
        .eq('simulados.user_id', user.id)
        .not('resposta_usuario', 'is', null);

      const questoesRespondidas = respostas?.length || 0;
      const acertos = respostas?.filter(r => r.correto)?.length || 0;
      const taxaAcerto = questoesRespondidas > 0 ? Math.round((acertos / questoesRespondidas) * 100) : 0;

      // Simulados concluídos
      const { data: simulados } = await supabase
        .from('simulados')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'concluido');

      const simuladosConcluidos = simulados?.length || 0;

      // Revisões pendentes hoje
      const { data: revisoes } = await supabase
        .from('revisoes')
        .select('id')
        .eq('user_id', user.id)
        .lte('proxima_revisao', inicioDia);

      const revisoesPendentes = revisoes?.length || 0;

      // Flashcards pendentes
      const { count: flashcardsPendentes } = await supabase
        .from('flashcards')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .lte('proxima_revisao', inicioDia);

      // Dias até a prova (do perfil)
      const { data: profile } = await supabase
        .from('profiles')
        .select('dias_ate_prova')
        .eq('id', user.id)
        .single();

      const diasProva = profile?.dias_ate_prova || 0;

      // Atividades recentes (últimas 3 sessões)
      const { data: atividadesRecentes } = await supabase
        .from('sessoes_estudo')
        .select('*, disciplinas(nome)')
        .eq('user_id', user.id)
        .order('data', { ascending: false })
        .limit(3);

      const atividades = atividadesRecentes?.map(a => {
        const dataAtividade = new Date(a.data);
        const diff = Math.floor((hoje.getTime() - dataAtividade.getTime()) / (1000 * 60 * 60 * 24));
        let dataTexto = "Hoje";
        if (diff === 1) dataTexto = "Ontem";
        else if (diff > 1) dataTexto = `${diff} dias atrás`;

        return {
          subject: a.disciplinas?.nome || 'Estudo Geral',
          hours: (a.duracao_minutos / 60).toFixed(1),
          accuracy: 0,
          date: dataTexto
        };
      }) || [];

      setStats({
        hoursThisWeek: parseFloat(horasSemana.toFixed(1)),
        hoursToday: parseFloat(horasHoje.toFixed(1)),
        totalHours: Math.round(horasTotal),
        accuracyRate: taxaAcerto,
        questionsAnswered: questoesRespondidas,
        simuladosDone: simuladosConcluidos,
        nextReviewDate: "Hoje",
        reviewQuestionsCount: revisoesPendentes,
        flashcardsPendentes: flashcardsPendentes || 0,
        daysUntilExam: diasProva
      });

      setRecentActivity(atividades);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <Card className="p-4 md:p-6 gradient-primary text-white">
            <div className="flex items-start justify-between mb-4">
              <Clock className="h-6 md:h-8 w-6 md:w-8" />
              <span className="text-xs md:text-sm bg-white/20 px-2 py-1 rounded">Esta Semana</span>
            </div>
            <div className="text-2xl md:text-3xl font-bold mb-1">{stats.hoursThisWeek}h</div>
            <div className="text-sm md:text-base text-white/80">Horas estudadas</div>
          </Card>

          <Card className="p-4 md:p-6 gradient-success text-white">
            <div className="flex items-start justify-between mb-4">
              <Target className="h-6 md:h-8 w-6 md:w-8" />
              <span className="text-xs md:text-sm bg-white/20 px-2 py-1 rounded">Geral</span>
            </div>
            <div className="text-2xl md:text-3xl font-bold mb-1">{stats.accuracyRate}%</div>
            <div className="text-sm md:text-base text-white/80">Taxa de acerto</div>
          </Card>

          <Card className="p-4 md:p-6 border-2 hover:shadow-lg transition-smooth">
            <div className="flex items-start justify-between mb-4">
              <Brain className="h-6 md:h-8 w-6 md:w-8 text-primary" />
              <span className="text-xs md:text-sm bg-accent/10 text-accent px-2 py-1 rounded font-semibold">Urgente</span>
            </div>
            <div className="text-2xl md:text-3xl font-bold mb-1">{stats.reviewQuestionsCount}</div>
            <div className="text-sm md:text-base text-muted-foreground">Para revisar hoje</div>
          </Card>

          <Card className="p-4 md:p-6 border-2 hover:shadow-lg transition-smooth">
            <div className="flex items-start justify-between mb-4">
              <Calendar className="h-6 md:h-8 w-6 md:w-8 text-warning" />
              <span className="text-xs md:text-sm bg-warning/10 text-warning px-2 py-1 rounded font-semibold">Faltam</span>
            </div>
            <div className="text-2xl md:text-3xl font-bold mb-1">{stats.daysUntilExam || '-'}</div>
            <div className="text-sm md:text-base text-muted-foreground">Dias até a prova</div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8 mb-8">
          {/* Quick Actions */}
          <Card className="lg:col-span-2 p-4 md:p-6">
            <h3 className="mb-4 md:mb-6 flex items-center gap-2 text-lg md:text-xl">
              <Target className="h-5 w-5 text-primary" />
              Ações Rápidas
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              <Button variant="outline" size="lg" className="h-auto py-4 md:py-6 flex-col gap-2" asChild>
                <Link to="/planner">
                  <BookOpen className="h-6 md:h-8 w-6 md:w-8 text-primary" />
                  <span className="text-sm md:text-base font-semibold">Iniciar Sessão</span>
                  <span className="text-xs text-muted-foreground hidden md:block">Começar a estudar</span>
                </Link>
              </Button>
              
              <Button variant="outline" size="lg" className="h-auto py-4 md:py-6 flex-col gap-2" asChild>
                <Link to="/simulados">
                  <Trophy className="h-6 md:h-8 w-6 md:w-8 text-success" />
                  <span className="text-sm md:text-base font-semibold">Fazer Simulado</span>
                  <span className="text-xs text-muted-foreground hidden md:block">Testar conhecimento</span>
                </Link>
              </Button>
              
              <Button variant="outline" size="lg" className="h-auto py-4 md:py-6 flex-col gap-2" asChild>
                <Link to="/review">
                  <Brain className="h-6 md:h-8 w-6 md:w-8 text-accent" />
                  <span className="text-sm md:text-base font-semibold">Revisar</span>
                  <span className="text-xs text-muted-foreground hidden md:block">{stats.reviewQuestionsCount} questões</span>
                </Link>
              </Button>
              
              <Button variant="outline" size="lg" className="h-auto py-4 md:py-6 flex-col gap-2" asChild>
                <Link to="/flashcards">
                  <Sparkles className="h-6 md:h-8 w-6 md:w-8 text-warning" />
                  <span className="text-sm md:text-base font-semibold">Flashcards</span>
                  <span className="text-xs text-muted-foreground hidden md:block">{stats.flashcardsPendentes} pendentes</span>
                </Link>
              </Button>

              <Button variant="outline" size="lg" className="h-auto py-4 md:py-6 flex-col gap-2" asChild>
                <Link to="/library">
                  <Library className="h-6 md:h-8 w-6 md:w-8 text-primary" />
                  <span className="text-sm md:text-base font-semibold">Biblioteca</span>
                  <span className="text-xs text-muted-foreground hidden md:block">Resumos e materiais</span>
                </Link>
              </Button>
              
              <Button variant="outline" size="lg" className="h-auto py-4 md:py-6 flex-col gap-2" asChild>
                <Link to="/statistics">
                  <BarChart3 className="h-6 md:h-8 w-6 md:w-8 text-primary" />
                  <span className="text-sm md:text-base font-semibold">Estatísticas</span>
                  <span className="text-xs text-muted-foreground hidden md:block">Análise detalhada</span>
                </Link>
              </Button>
            </div>
          </Card>

          {/* Today's Progress */}
          <Card className="p-4 md:p-6">
            <h3 className="mb-4 md:mb-6 flex items-center gap-2 text-lg md:text-xl">
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

        {/* AI Coach Section */}
        <div className="grid lg:grid-cols-2 gap-6 md:gap-8 mb-8">
          <AICoachWidget />

          {/* Recent Activity */}
          {recentActivity.length > 0 && (
            <Card className="p-4 md:p-6">
              <h3 className="mb-4 md:mb-6 flex items-center gap-2 text-lg md:text-xl">
                <BookOpen className="h-5 w-5 text-primary" />
                Atividade Recente
              </h3>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div 
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-smooth"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold">{activity.subject}</div>
                        <div className="text-sm text-muted-foreground">{activity.date}</div>
                      </div>
                    </div>
                    <div className="flex gap-6 sm:gap-8 items-center">
                      <div className="text-left sm:text-right">
                        <div className="text-sm text-muted-foreground">Tempo</div>
                        <div className="font-semibold">{activity.hours}h</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
      
      <AIHelpButton variant="fab" context="Ajude-me com meus estudos para concursos. Analise meu progresso e sugira melhorias." />
    </div>
  );
};

export default Dashboard;
