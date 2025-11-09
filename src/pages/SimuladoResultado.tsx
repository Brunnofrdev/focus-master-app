import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, TrendingUp, Target, Clock, ChevronRight, PieChart, BarChart3 } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { Progress } from '@/components/ui/progress';
import { PieChart as RechartsP, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SimuladoResultado = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resultado, setResultado] = useState<any>(null);
  const [questoes, setQuestoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [estatisticasDisciplinas, setEstatisticasDisciplinas] = useState<any[]>([]);

  useEffect(() => {
    carregarResultado();
  }, [id]);

  const carregarResultado = async () => {
    try {
      const { data: simulado, error: simuladoError } = await supabase
        .from('simulados')
        .select('*')
        .eq('id', id)
        .single();

      if (simuladoError) throw simuladoError;

      const { data: questoesData, error: questoesError } = await supabase
        .from('simulado_questoes')
        .select(`
          *,
          questoes (
            enunciado,
            alternativa_a,
            alternativa_b,
            alternativa_c,
            alternativa_d,
            alternativa_e,
            gabarito,
            explicacao,
            disciplina_id,
            disciplinas (nome)
          )
        `)
        .eq('simulado_id', id)
        .order('ordem');

      if (questoesError) throw questoesError;

      setResultado(simulado);
      setQuestoes(questoesData || []);

      // Calcular estatísticas por disciplina
      const disciplinasMap = new Map();
      questoesData?.forEach((q: any) => {
        const disciplina = q.questoes?.disciplinas?.nome || 'Geral';
        if (!disciplinasMap.has(disciplina)) {
          disciplinasMap.set(disciplina, { total: 0, acertos: 0 });
        }
        const stats = disciplinasMap.get(disciplina);
        stats.total++;
        if (q.correto) stats.acertos++;
      });

      const estatisticas = Array.from(disciplinasMap.entries()).map(([disciplina, stats]: [string, any]) => ({
        disciplina,
        acertos: stats.acertos,
        erros: stats.total - stats.acertos,
        percentual: Math.round((stats.acertos / stats.total) * 100)
      }));

      setEstatisticasDisciplinas(estatisticas);
    } catch (error) {
      console.error('Erro ao carregar resultado:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando resultado...</p>
        </div>
      </div>
    );
  }

  if (!resultado) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Resultado não encontrado</p>
          <Button onClick={() => navigate('/simulados')}>Voltar</Button>
        </Card>
      </div>
    );
  }

  const porcentagem = resultado.nota_final || 0;
  const acertos = resultado.acertos || 0;
  const erros = resultado.total_questoes - acertos;
  
  // Dados para o gráfico de pizza
  const dadosPizza = [
    { name: 'Acertos', value: acertos, color: 'hsl(var(--success))' },
    { name: 'Erros', value: erros, color: 'hsl(var(--destructive))' },
  ];

  // Determinar nível de desempenho
  const getNivelDesempenho = (percent: number) => {
    if (percent >= 90) return { label: 'Excelente!', color: 'text-success', bg: 'bg-success/10' };
    if (percent >= 70) return { label: 'Bom', color: 'text-primary', bg: 'bg-primary/10' };
    if (percent >= 50) return { label: 'Regular', color: 'text-warning', bg: 'bg-warning/10' };
    return { label: 'Precisa Melhorar', color: 'text-destructive', bg: 'bg-destructive/10' };
  };

  const desempenho = getNivelDesempenho(porcentagem);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Header com Pontuação */}
        <Card className="p-8 mb-8 gradient-primary text-white">
          <div className="text-center">
            <Trophy className="h-16 w-16 mx-auto mb-4" />
            <h1 className="mb-2">{resultado.titulo}</h1>
            <div className="text-6xl font-bold mb-2">{porcentagem.toFixed(1)}%</div>
            <div className={`inline-block px-4 py-2 rounded-full ${desempenho.bg} mb-4`}>
              <span className={`font-semibold ${desempenho.color}`}>{desempenho.label}</span>
            </div>
            <p className="text-white/80 text-lg">
              Você acertou {acertos} de {resultado.total_questoes} questões
            </p>
          </div>
        </Card>

        {/* Estatísticas */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-success/10">
                <Target className="h-6 w-6 text-success" />
              </div>
              <div>
                <div className="text-3xl font-bold text-success">{acertos}</div>
                <div className="text-sm text-muted-foreground">Acertos</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-destructive/10">
                <TrendingUp className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <div className="text-3xl font-bold text-destructive">{erros}</div>
                <div className="text-sm text-muted-foreground">Erros</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-3xl font-bold">
                  {resultado.tempo_limite_minutos || 180}
                </div>
                <div className="text-sm text-muted-foreground">Minutos disponíveis</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Gráficos de Desempenho */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de Pizza */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <PieChart className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Distribuição de Respostas</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsP>
                <Pie
                  data={dadosPizza}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dadosPizza.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsP>
            </ResponsiveContainer>
          </Card>

          {/* Gráfico de Barras por Disciplina */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Desempenho por Disciplina</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={estatisticasDisciplinas}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="disciplina" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="acertos" fill="hsl(var(--success))" name="Acertos" />
                <Bar dataKey="erros" fill="hsl(var(--destructive))" name="Erros" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Análise por Disciplina */}
        <Card className="p-6 mb-8">
          <h2 className="mb-6">Análise por Disciplina</h2>
          <div className="space-y-4">
            {estatisticasDisciplinas.map((disc, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{disc.disciplina}</span>
                  <span className="text-sm text-muted-foreground">
                    {disc.acertos}/{disc.acertos + disc.erros} questões ({disc.percentual}%)
                  </span>
                </div>
                <Progress value={disc.percentual} className="h-2" />
              </div>
            ))}
          </div>
        </Card>

        {/* Revisão de Questões */}
        <Card className="p-6 mb-8">
          <h2 className="mb-6">Revisão das Questões</h2>
          <div className="space-y-6">
            {questoes.map((q, idx) => {
              const correto = q.correto;
              const respondida = q.resposta_usuario;

              return (
                <div
                  key={q.id}
                  className={`p-6 rounded-lg border-2 ${
                    correto 
                      ? 'border-success bg-success/5' 
                      : 'border-destructive bg-destructive/5'
                  }`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <span className={`px-3 py-1 rounded-full font-semibold ${
                      correto ? 'bg-success text-white' : 'bg-destructive text-white'
                    }`}>
                      {correto ? '✓' : '✗'}
                    </span>
                    <div className="flex-1">
                      <div className="text-sm text-muted-foreground mb-2">
                        Questão {idx + 1} • {q.questoes?.disciplinas?.nome || 'Geral'}
                      </div>
                      <p className="font-semibold mb-4">{q.questoes?.enunciado}</p>
                      
                      <div className="space-y-2 mb-4">
                        {['a', 'b', 'c', 'd', 'e'].map((letra) => {
                          const alternativaKey = `alternativa_${letra}` as any;
                          const alternativa = q.questoes?.[alternativaKey];
                          if (!alternativa) return null;

                          const isGabarito = letra.toUpperCase() === q.questoes?.gabarito;
                          const isResposta = letra.toUpperCase() === respondida;

                          return (
                            <div
                              key={letra}
                              className={`p-3 rounded-lg ${
                                isGabarito
                                  ? 'bg-success/20 border-2 border-success'
                                  : isResposta
                                  ? 'bg-destructive/20 border-2 border-destructive'
                                  : 'bg-secondary'
                              }`}
                            >
                              <span className="font-semibold mr-2">
                                {letra.toUpperCase()})
                              </span>
                              {alternativa}
                              {isGabarito && (
                                <span className="ml-2 text-success font-semibold">
                                  (Gabarito)
                                </span>
                              )}
                              {isResposta && !isGabarito && (
                                <span className="ml-2 text-destructive font-semibold">
                                  (Sua resposta)
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {q.questoes?.explicacao && (
                        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                          <p className="text-sm font-semibold text-primary mb-2">
                            Explicação:
                          </p>
                          <p className="text-sm">{q.questoes.explicacao}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" onClick={() => navigate('/simulados')} className="w-full sm:w-auto">
            Voltar aos Simulados
          </Button>
          <Button onClick={() => navigate('/dashboard')} className="w-full sm:w-auto">
            <ChevronRight className="h-4 w-4 mr-2" />
            Ir para Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SimuladoResultado;
