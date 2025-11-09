import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Award,
  BookOpen
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
  ResponsiveContainer
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Statistics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalHours: 0,
    accuracyRate: 0,
    questionsAnswered: 0,
    monthlyGrowth: 0
  });
  const [subjectAccuracy, setSubjectAccuracy] = useState<any[]>([]);
  const [weeklyProgress, setWeeklyProgress] = useState<any[]>([]);
  const [difficultyData, setDifficultyData] = useState<any[]>([]);
  const [insights, setInsights] = useState({ best: '', worst: '' });

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
        .select('duracao_minutos')
        .eq('user_id', user.id);

      const totalMinutos = sessoes?.reduce((acc, s) => acc + s.duracao_minutos, 0) || 0;
      const totalHoras = Math.round(totalMinutos / 60);

      // Questões respondidas e taxa de acerto
      const { data: respostas } = await supabase
        .from('simulado_questoes')
        .select('resposta_usuario, correto, simulados!inner(user_id)')
        .eq('simulados.user_id', user.id)
        .not('resposta_usuario', 'is', null);

      const questoesRespondidas = respostas?.length || 0;
      const acertos = respostas?.filter(r => r.correto)?.length || 0;
      const taxaAcerto = questoesRespondidas > 0 ? Math.round((acertos / questoesRespondidas) * 100) : 0;

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
            subject: disc.nome.substring(0, 20),
            accuracy,
            total
          };
        })
      );

      const disciplinasComQuestoes = disciplinasComStats.filter(d => d.total > 0);
      setSubjectAccuracy(disciplinasComQuestoes.length > 0 ? disciplinasComQuestoes : [
        { subject: 'Sem dados ainda', accuracy: 0, total: 0 }
      ]);

      // Encontrar melhor e pior desempenho
      if (disciplinasComQuestoes.length > 0) {
        const melhor = disciplinasComQuestoes.reduce((max, d) => d.accuracy > max.accuracy ? d : max);
        const pior = disciplinasComQuestoes.reduce((min, d) => d.accuracy < min.accuracy ? d : min);
        setInsights({ best: melhor.subject, worst: pior.subject });
      }

      // Progresso semanal (últimas 5 semanas)
      const semanas = [];
      for (let i = 4; i >= 0; i--) {
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

        // Questões da semana para calcular accuracy
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
          week: `Sem ${5 - i}`,
          hours: Math.round(horasSemana),
          accuracy: accuracySemana
        });
      }
      setWeeklyProgress(semanas);

      // Distribuição por dificuldade
      const { data: questoesFaceis } = await supabase
        .from('simulado_questoes')
        .select('id, questoes!inner(dificuldade), simulados!inner(user_id)')
        .eq('simulados.user_id', user.id)
        .eq('questoes.dificuldade', 'facil')
        .not('resposta_usuario', 'is', null);

      const { data: questoesMedias } = await supabase
        .from('simulado_questoes')
        .select('id, questoes!inner(dificuldade), simulados!inner(user_id)')
        .eq('simulados.user_id', user.id)
        .eq('questoes.dificuldade', 'medio')
        .not('resposta_usuario', 'is', null);

      const { data: questoesDificeis } = await supabase
        .from('simulado_questoes')
        .select('id, questoes!inner(dificuldade), simulados!inner(user_id)')
        .eq('simulados.user_id', user.id)
        .eq('questoes.dificuldade', 'dificil')
        .not('resposta_usuario', 'is', null);

      setDifficultyData([
        { name: 'Fácil', value: questoesFaceis?.length || 0, color: '#34d399' },
        { name: 'Médio', value: questoesMedias?.length || 0, color: '#6366f1' },
        { name: 'Difícil', value: questoesDificeis?.length || 0, color: '#f59e0b' }
      ]);

      // Crescimento mensal (comparar mês atual com anterior)
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
        monthlyGrowth: crescimento
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  const statsCards = [
    { label: 'Total de Horas', value: `${stats.totalHours}h`, icon: BookOpen, color: 'primary' },
    { label: 'Taxa de Acerto', value: `${stats.accuracyRate}%`, icon: Target, color: 'success' },
    { label: 'Questões Resolvidas', value: stats.questionsAnswered.toLocaleString(), icon: Award, color: 'accent' },
    { label: 'Evolução Mensal', value: `${stats.monthlyGrowth > 0 ? '+' : ''}${stats.monthlyGrowth}%`, icon: TrendingUp, color: stats.monthlyGrowth >= 0 ? 'success' : 'destructive' },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="mb-8">
          <h1 className="mb-2">Estatísticas e Análises</h1>
          <p className="text-muted-foreground text-lg">
            Acompanhe seu desempenho e identifique áreas de melhoria
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            const colorMap: Record<string, string> = {
              primary: 'text-primary',
              success: 'text-success',
              accent: 'text-accent',
              destructive: 'text-destructive'
            };
            return (
              <Card key={index} className="p-4 md:p-6">
                <div className="flex items-start justify-between mb-4">
                  <Icon className={`h-6 md:h-8 w-6 md:w-8 ${colorMap[stat.color]}`} />
                </div>
                <div className="text-2xl md:text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 md:gap-8 mb-8">
          {/* Subject Performance */}
          <Card className="p-4 md:p-6">
            <h3 className="mb-4 md:mb-6 flex items-center gap-2 text-lg md:text-xl">
              <BarChart3 className="h-5 w-5 text-primary" />
              Desempenho por Disciplina
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectAccuracy}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="subject" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 11 }}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="accuracy" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Difficulty Distribution */}
          <Card className="p-4 md:p-6">
            <h3 className="mb-4 md:mb-6 flex items-center gap-2 text-lg md:text-xl">
              <Target className="h-5 w-5 text-primary" />
              Distribuição por Dificuldade
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={difficultyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {difficultyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {difficultyData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs md:text-sm">{item.value} questões</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Evolution Over Time */}
        <Card className="p-4 md:p-6 mb-8">
          <h3 className="mb-4 md:mb-6 flex items-center gap-2 text-lg md:text-xl">
            <TrendingUp className="h-5 w-5 text-success" />
            Evolução ao Longo do Tempo
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="hours" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Horas de Estudo"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="accuracy" 
                stroke="hsl(var(--success))" 
                strokeWidth={2}
                name="Taxa de Acerto (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Insights */}
        {insights.best && insights.worst && (
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            <Card className="p-4 md:p-6 border-l-4 border-l-success">
              <h4 className="font-semibold mb-2 text-success">✨ Ponto Forte</h4>
              <p className="text-sm md:text-base text-muted-foreground">
                Excelente desempenho em <strong>{insights.best}</strong>. 
                Continue praticando para manter esse nível!
              </p>
            </Card>

            <Card className="p-4 md:p-6 border-l-4 border-l-warning">
              <h4 className="font-semibold mb-2 text-warning">⚠️ Atenção Necessária</h4>
              <p className="text-sm md:text-base text-muted-foreground">
                <strong>{insights.worst}</strong> precisa de mais atenção. 
                Recomendamos aumentar o tempo de estudo nesta disciplina.
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistics;