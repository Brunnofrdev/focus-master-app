import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navigation } from "@/components/Navigation";
import { AIHelpButton } from "@/components/ai";
import { 
  StatsCard, 
  PerformanceRing, 
  StreakDisplay, 
  DisciplineProgress,
  StudyHeatmap,
  QuickStatsRow
} from "@/components/statistics/StatsDashboard";
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Award,
  BookOpen,
  Clock,
  Brain,
  Calendar,
  Trophy,
  Flame,
  ChevronRight,
  Sparkles
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format, subDays, startOfWeek, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

const Statistics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalHours: 0,
    accuracyRate: 0,
    questionsAnswered: 0,
    monthlyGrowth: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalCorrect: 0,
    totalWrong: 0,
    avgTimePerQuestion: 0,
    todayQuestions: 0
  });
  const [subjectAccuracy, setSubjectAccuracy] = useState<any[]>([]);
  const [weeklyProgress, setWeeklyProgress] = useState<any[]>([]);
  const [difficultyData, setDifficultyData] = useState<any[]>([]);
  const [disciplineProgress, setDisciplineProgress] = useState<any[]>([]);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [radarData, setRadarData] = useState<any[]>([]);
  const [insights, setInsights] = useState({ best: '', worst: '', improvement: '' });

  useEffect(() => {
    if (user) {
      carregarEstatisticas();
    }
  }, [user]);

  const carregarEstatisticas = async () => {
    if (!user) return;

    try {
      // Total de horas estudadas
      const { data: sessoes } = await supabase
        .from('sessoes_estudo')
        .select('duracao_minutos, data')
        .eq('user_id', user.id);

      const totalMinutos = sessoes?.reduce((acc, s) => acc + s.duracao_minutos, 0) || 0;
      const totalHoras = Math.round(totalMinutos / 60);

      // Heatmap data (últimos 90 dias)
      const last90Days = eachDayOfInterval({
        start: subDays(new Date(), 89),
        end: new Date()
      });

      const heatmap = last90Days.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayMinutes = sessoes?.filter(s => s.data === dateStr)
          .reduce((acc, s) => acc + s.duracao_minutos, 0) || 0;
        return {
          date: format(date, 'dd/MM'),
          hours: Math.round(dayMinutes / 60 * 10) / 10
        };
      });
      setHeatmapData(heatmap);

      // Calcular streak
      let currentStreak = 0;
      let bestStreak = 0;
      let tempStreak = 0;
      const sortedDates = [...new Set(sessoes?.map(s => s.data) || [])].sort().reverse();
      
      for (let i = 0; i < sortedDates.length; i++) {
        const date = new Date(sortedDates[i]);
        const prevDate = i > 0 ? new Date(sortedDates[i - 1]) : new Date();
        const diff = Math.abs((prevDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diff <= 1) {
          tempStreak++;
          if (i === 0) currentStreak = tempStreak;
        } else {
          if (tempStreak > bestStreak) bestStreak = tempStreak;
          tempStreak = 1;
        }
      }
      if (tempStreak > bestStreak) bestStreak = tempStreak;

      // Questões respondidas e taxa de acerto
      const { data: respostas } = await supabase
        .from('simulado_questoes')
        .select('resposta_usuario, correto, tempo_resposta_segundos, simulados!inner(user_id, iniciado_em)')
        .eq('simulados.user_id', user.id)
        .not('resposta_usuario', 'is', null);

      const questoesRespondidas = respostas?.length || 0;
      const acertos = respostas?.filter(r => r.correto)?.length || 0;
      const erros = questoesRespondidas - acertos;
      const taxaAcerto = questoesRespondidas > 0 ? Math.round((acertos / questoesRespondidas) * 100) : 0;
      
      // Tempo médio por questão
      const tempoTotal = respostas?.reduce((acc, r) => acc + (r.tempo_resposta_segundos || 0), 0) || 0;
      const tempoMedio = questoesRespondidas > 0 ? Math.round(tempoTotal / questoesRespondidas) : 0;

      // Questões de hoje
      const today = format(new Date(), 'yyyy-MM-dd');
      const questoesHoje = respostas?.filter(r => 
        r.simulados?.iniciado_em?.startsWith(today)
      )?.length || 0;

      // Taxa de acerto por disciplina
      const { data: disciplinas } = await supabase
        .from('disciplinas')
        .select('id, nome')
        .order('nome');

      const disciplinasComStats = await Promise.all(
        (disciplinas || []).map(async (disc) => {
          const { data: questoes } = await supabase
            .from('simulado_questoes')
            .select('correto, resposta_usuario, questoes!inner(disciplina_id), simulados!inner(user_id)')
            .eq('questoes.disciplina_id', disc.id)
            .eq('simulados.user_id', user.id)
            .not('resposta_usuario', 'is', null);

          const total = questoes?.length || 0;
          const corretas = questoes?.filter(q => q.correto)?.length || 0;
          const accuracy = total > 0 ? Math.round((corretas / total) * 100) : 0;

          return {
            name: disc.nome.substring(0, 25),
            accuracy,
            total,
            questionsAnswered: total,
            trend: accuracy >= 70 ? 'up' as const : accuracy >= 50 ? 'stable' as const : 'down' as const
          };
        })
      );

      const disciplinasComQuestoes = disciplinasComStats.filter(d => d.total > 0);
      setSubjectAccuracy(disciplinasComQuestoes.length > 0 ? disciplinasComQuestoes : [
        { name: 'Sem dados', accuracy: 0, total: 0 }
      ]);
      setDisciplineProgress(disciplinasComQuestoes.slice(0, 6));

      // Dados para radar chart
      const radarData = disciplinasComQuestoes.slice(0, 6).map(d => ({
        subject: d.name.substring(0, 12),
        value: d.accuracy,
        fullMark: 100
      }));
      setRadarData(radarData);

      // Encontrar insights
      if (disciplinasComQuestoes.length > 0) {
        const sorted = [...disciplinasComQuestoes].sort((a, b) => b.accuracy - a.accuracy);
        const melhor = sorted[0];
        const pior = sorted[sorted.length - 1];
        
        setInsights({ 
          best: melhor.name, 
          worst: pior.name,
          improvement: pior.accuracy < 60 ? `Foque em ${pior.name} para melhorar seu desempenho geral.` : 'Continue praticando todas as disciplinas!'
        });
      }

      // Progresso semanal (últimas 8 semanas)
      const semanas = [];
      for (let i = 7; i >= 0; i--) {
        const fimSemana = new Date();
        fimSemana.setDate(fimSemana.getDate() - (i * 7));
        const inicioSemana = new Date(fimSemana);
        inicioSemana.setDate(inicioSemana.getDate() - 6);

        const { data: sessoesSemana } = await supabase
          .from('sessoes_estudo')
          .select('duracao_minutos')
          .eq('user_id', user.id)
          .gte('data', inicioSemana.toISOString().split('T')[0])
          .lte('data', fimSemana.toISOString().split('T')[0]);

        const horasSemana = sessoesSemana?.reduce((acc, s) => acc + (s.duracao_minutos / 60), 0) || 0;

        const { data: respostasSemana } = await supabase
          .from('simulado_questoes')
          .select('correto, resposta_usuario, simulados!inner(user_id, iniciado_em)')
          .eq('simulados.user_id', user.id)
          .gte('simulados.iniciado_em', inicioSemana.toISOString())
          .lte('simulados.iniciado_em', fimSemana.toISOString())
          .not('resposta_usuario', 'is', null);

        const totalSemana = respostasSemana?.length || 0;
        const acertosSemana = respostasSemana?.filter(r => r.correto)?.length || 0;
        const accuracySemana = totalSemana > 0 ? Math.round((acertosSemana / totalSemana) * 100) : 0;

        semanas.push({
          week: `S${8 - i}`,
          hours: Math.round(horasSemana * 10) / 10,
          accuracy: accuracySemana,
          questions: totalSemana
        });
      }
      setWeeklyProgress(semanas);

      // Distribuição por dificuldade
      const { data: questoesFaceis } = await supabase
        .from('simulado_questoes')
        .select('id, correto, questoes!inner(dificuldade), simulados!inner(user_id)')
        .eq('simulados.user_id', user.id)
        .eq('questoes.dificuldade', 'facil')
        .not('resposta_usuario', 'is', null);

      const { data: questoesMedias } = await supabase
        .from('simulado_questoes')
        .select('id, correto, questoes!inner(dificuldade), simulados!inner(user_id)')
        .eq('simulados.user_id', user.id)
        .eq('questoes.dificuldade', 'medio')
        .not('resposta_usuario', 'is', null);

      const { data: questoesDificeis } = await supabase
        .from('simulado_questoes')
        .select('id, correto, questoes!inner(dificuldade), simulados!inner(user_id)')
        .eq('simulados.user_id', user.id)
        .eq('questoes.dificuldade', 'dificil')
        .not('resposta_usuario', 'is', null);

      const acertosFacil = questoesFaceis?.filter(q => q.correto)?.length || 0;
      const acertosMedio = questoesMedias?.filter(q => q.correto)?.length || 0;
      const acertosDificil = questoesDificeis?.filter(q => q.correto)?.length || 0;

      setDifficultyData([
        { 
          name: 'Fácil', 
          total: questoesFaceis?.length || 0,
          acertos: acertosFacil,
          taxa: questoesFaceis?.length ? Math.round((acertosFacil / questoesFaceis.length) * 100) : 0,
          color: 'hsl(var(--success))'
        },
        { 
          name: 'Médio', 
          total: questoesMedias?.length || 0,
          acertos: acertosMedio,
          taxa: questoesMedias?.length ? Math.round((acertosMedio / questoesMedias.length) * 100) : 0,
          color: 'hsl(var(--warning))'
        },
        { 
          name: 'Difícil', 
          total: questoesDificeis?.length || 0,
          acertos: acertosDificil,
          taxa: questoesDificeis?.length ? Math.round((acertosDificil / questoesDificeis.length) * 100) : 0,
          color: 'hsl(var(--destructive))'
        }
      ]);

      // Crescimento mensal
      const mesAtual = new Date();
      const mesAnterior = new Date();
      mesAnterior.setMonth(mesAnterior.getMonth() - 1);

      const { data: questoesMesAtual } = await supabase
        .from('simulado_questoes')
        .select('id, simulados!inner(user_id, iniciado_em)')
        .eq('simulados.user_id', user.id)
        .gte('simulados.iniciado_em', new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1).toISOString())
        .not('resposta_usuario', 'is', null);

      const { data: questoesMesAnterior } = await supabase
        .from('simulado_questoes')
        .select('id, simulados!inner(user_id, iniciado_em)')
        .eq('simulados.user_id', user.id)
        .gte('simulados.iniciado_em', new Date(mesAnterior.getFullYear(), mesAnterior.getMonth(), 1).toISOString())
        .lt('simulados.iniciado_em', new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1).toISOString())
        .not('resposta_usuario', 'is', null);

      const qtdAtual = questoesMesAtual?.length || 0;
      const qtdAnterior = questoesMesAnterior?.length || 1;
      const crescimento = Math.round(((qtdAtual - qtdAnterior) / qtdAnterior) * 100);

      setStats({
        totalHours: totalHoras,
        accuracyRate: taxaAcerto,
        questionsAnswered: questoesRespondidas,
        monthlyGrowth: crescimento,
        currentStreak,
        bestStreak,
        totalCorrect: acertos,
        totalWrong: erros,
        avgTimePerQuestion: tempoMedio,
        todayQuestions: questoesHoje
      });

    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin"></div>
          </div>
          <p className="text-muted-foreground">Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary-foreground" />
              </div>
              Estatísticas
            </h1>
            <p className="text-muted-foreground">
              Análise completa do seu desempenho nos estudos
            </p>
          </div>
          <AIHelpButton 
            context="Análise de estatísticas de estudo para concursos. Ajude a interpretar dados de desempenho."
            variant="default"
          />
        </div>

        {/* Quick Stats */}
        <QuickStatsRow 
          stats={{
            totalCorrect: stats.totalCorrect,
            totalWrong: stats.totalWrong,
            avgTimePerQuestion: stats.avgTimePerQuestion,
            todayQuestions: stats.todayQuestions
          }}
          className="mb-8"
        />

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <StatsCard
            label="Total de Horas"
            value={`${stats.totalHours}h`}
            icon={BookOpen}
            trend={stats.monthlyGrowth}
            description="Tempo total investido"
            color="primary"
          />
          <StatsCard
            label="Taxa de Acerto"
            value={`${stats.accuracyRate}%`}
            icon={Target}
            description={`${stats.totalCorrect} de ${stats.questionsAnswered}`}
            color="success"
          />
          <StatsCard
            label="Questões Resolvidas"
            value={stats.questionsAnswered.toLocaleString()}
            icon={Award}
            description="Total de questões"
            color="accent"
          />
          <StatsCard
            label="Evolução Mensal"
            value={`${stats.monthlyGrowth > 0 ? '+' : ''}${stats.monthlyGrowth}%`}
            icon={TrendingUp}
            description="vs. mês anterior"
            color={stats.monthlyGrowth >= 0 ? 'success' : 'destructive'}
          />
        </div>

        {/* Streak Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <StreakDisplay 
            currentStreak={stats.currentStreak} 
            bestStreak={stats.bestStreak}
            className="md:col-span-1"
          />
          
          {/* Performance Rings */}
          <Card className="md:col-span-2 p-6">
            <h3 className="font-semibold mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Desempenho por Dificuldade
            </h3>
            <div className="flex flex-wrap justify-around items-center gap-6">
              {difficultyData.map((diff, index) => (
                <div key={index} className="text-center">
                  <PerformanceRing 
                    value={diff.taxa} 
                    label={diff.name}
                    color={diff.name === 'Fácil' ? 'success' : diff.name === 'Médio' ? 'warning' : 'destructive'}
                    size="md"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {diff.acertos}/{diff.total} questões
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="performance" className="mb-8">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="performance" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Desempenho
            </TabsTrigger>
            <TabsTrigger value="progress" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Progresso
            </TabsTrigger>
            <TabsTrigger value="analysis" className="gap-2">
              <Brain className="w-4 h-4" />
              Análise
            </TabsTrigger>
          </TabsList>

          <TabsContent value="performance">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Subject Performance Bar Chart */}
              <Card className="p-6">
                <h3 className="font-semibold mb-6 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Desempenho por Disciplina
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={subjectAccuracy} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={100}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`${value}%`, 'Taxa de Acerto']}
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                    />
                    <Bar 
                      dataKey="accuracy" 
                      fill="hsl(var(--primary))" 
                      radius={[0, 8, 8, 0]}
                      background={{ fill: 'hsl(var(--muted))' }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Radar Chart */}
              <Card className="p-6">
                <h3 className="font-semibold mb-6 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  Visão Geral
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Radar
                      name="Taxa de Acerto"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="progress">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Weekly Progress */}
              <Card className="p-6 lg:col-span-2">
                <h3 className="font-semibold mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-success" />
                  Evolução Semanal
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={weeklyProgress}>
                    <defs>
                      <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip 
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                    />
                    <Legend />
                    <Area 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="hours" 
                      stroke="hsl(var(--primary))" 
                      fillOpacity={1}
                      fill="url(#colorHours)"
                      name="Horas de Estudo"
                    />
                    <Area 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="accuracy" 
                      stroke="hsl(var(--success))" 
                      fillOpacity={1}
                      fill="url(#colorAccuracy)"
                      name="Taxa de Acerto (%)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>

              {/* Heatmap */}
              <StudyHeatmap data={heatmapData} className="lg:col-span-2" />
            </div>
          </TabsContent>

          <TabsContent value="analysis">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Discipline Progress List */}
              <DisciplineProgress disciplines={disciplineProgress} />

              {/* Insights */}
              <div className="space-y-4">
                {insights.best && (
                  <Card className="p-6 border-l-4 border-l-success">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
                        <Trophy className="w-6 h-6 text-success" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-success mb-1">Ponto Forte</h4>
                        <p className="text-sm text-muted-foreground">
                          Excelente desempenho em <strong>{insights.best}</strong>. 
                          Continue praticando para manter esse nível!
                        </p>
                      </div>
                    </div>
                  </Card>
                )}

                {insights.worst && (
                  <Card className="p-6 border-l-4 border-l-warning">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center flex-shrink-0">
                        <Target className="w-6 h-6 text-warning" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-warning mb-1">Atenção Necessária</h4>
                        <p className="text-sm text-muted-foreground">
                          <strong>{insights.worst}</strong> precisa de mais atenção. 
                          {insights.improvement}
                        </p>
                      </div>
                    </div>
                  </Card>
                )}

                <Card className="p-6 border-l-4 border-l-primary">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-1">Dica da IA</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Use a IA para explicar questões que você errou e criar flashcards personalizados.
                      </p>
                      <AIHelpButton 
                        context={`Análise de desempenho: Taxa de acerto ${stats.accuracyRate}%, ${stats.questionsAnswered} questões respondidas. Melhor disciplina: ${insights.best}. Pior disciplina: ${insights.worst}.`}
                        variant="default"
                        className="w-full"
                      />
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* FAB AI Button */}
      <AIHelpButton variant="fab" context="Estatísticas de estudo para concursos" />
    </div>
  );
};

export default Statistics;
