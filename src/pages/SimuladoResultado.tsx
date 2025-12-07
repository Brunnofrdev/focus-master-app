import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { 
  Trophy, 
  TrendingUp, 
  Target, 
  Clock, 
  ChevronRight, 
  PieChart, 
  BarChart3,
  CheckCircle2,
  XCircle,
  BookOpen,
  Lightbulb,
  Share2,
  RotateCcw,
  Eye,
  EyeOff
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PieChart as RechartsP, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { useFlashcards } from '@/hooks/useFlashcards';
import { useToast } from '@/hooks/use-toast';

interface QuestaoResultado {
  id: string;
  ordem: number;
  resposta_usuario: string | null;
  correto: boolean | null;
  tempo_resposta_segundos: number | null;
  questoes: {
    enunciado: string;
    alternativa_a: string;
    alternativa_b: string;
    alternativa_c: string;
    alternativa_d: string;
    alternativa_e: string | null;
    gabarito: string;
    explicacao: string | null;
    disciplina_id: string | null;
    disciplinas?: { nome: string } | null;
  };
}

const SimuladoResultado = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { criarFlashcard } = useFlashcards();
  
  const [resultado, setResultado] = useState<any>(null);
  const [questoes, setQuestoes] = useState<QuestaoResultado[]>([]);
  const [loading, setLoading] = useState(true);
  const [estatisticasDisciplinas, setEstatisticasDisciplinas] = useState<any[]>([]);
  const [mostrarExplicacoes, setMostrarExplicacoes] = useState<Set<number>>(new Set());
  const [flashcardsCriados, setFlashcardsCriados] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (id) {
      carregarResultado();
    }
  }, [id]);

  const carregarResultado = async () => {
    try {
      const { data: simulado, error: simuladoError } = await supabase
        .from('simulados')
        .select(`
          *,
          bancas (nome, sigla)
        `)
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

      // Calcular estatisticas por disciplina
      const disciplinasMap = new Map();
      questoesData?.forEach((q: any) => {
        const disciplina = q.questoes?.disciplinas?.nome || 'Geral';
        if (!disciplinasMap.has(disciplina)) {
          disciplinasMap.set(disciplina, { total: 0, acertos: 0, tempoTotal: 0 });
        }
        const stats = disciplinasMap.get(disciplina);
        stats.total++;
        if (q.correto) stats.acertos++;
        if (q.tempo_resposta_segundos) stats.tempoTotal += q.tempo_resposta_segundos;
      });

      const estatisticas = Array.from(disciplinasMap.entries()).map(([disciplina, stats]: [string, any]) => ({
        disciplina,
        acertos: stats.acertos,
        erros: stats.total - stats.acertos,
        percentual: Math.round((stats.acertos / stats.total) * 100),
        tempoMedio: stats.tempoTotal > 0 ? Math.round(stats.tempoTotal / stats.total) : 0
      }));

      setEstatisticasDisciplinas(estatisticas.sort((a, b) => b.percentual - a.percentual));
    } catch (error) {
      console.error('Erro ao carregar resultado:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExplicacao = (idx: number) => {
    setMostrarExplicacoes(prev => {
      const novo = new Set(prev);
      if (novo.has(idx)) {
        novo.delete(idx);
      } else {
        novo.add(idx);
      }
      return novo;
    });
  };

  const criarFlashcardDeErro = async (questao: QuestaoResultado) => {
    if (flashcardsCriados.has(questao.id)) {
      toast({
        title: 'Flashcard ja criado',
        description: 'Voce ja criou um flashcard para esta questao.',
      });
      return;
    }

    const gabarito = questao.questoes.gabarito;
    const alternativaCorreta = questao.questoes[`alternativa_${gabarito.toLowerCase()}` as keyof typeof questao.questoes];

    const frente = questao.questoes.enunciado.substring(0, 200) + (questao.questoes.enunciado.length > 200 ? '...' : '');
    const verso = `Resposta: ${gabarito}) ${alternativaCorreta}\n\n${questao.questoes.explicacao || 'Sem explicacao disponivel.'}`;

    const success = await criarFlashcard(frente, verso, 'erro_simulado');
    
    if (success) {
      setFlashcardsCriados(prev => new Set(prev).add(questao.id));
      toast({
        title: 'Flashcard criado!',
        description: 'A questao foi adicionada aos seus flashcards para revisao.',
      });
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
          <p className="text-muted-foreground mb-4">Resultado nao encontrado</p>
          <Button onClick={() => navigate('/simulados')}>Voltar</Button>
        </Card>
      </div>
    );
  }

  const porcentagem = resultado.nota_final || 0;
  const acertos = resultado.acertos || 0;
  const erros = resultado.total_questoes - acertos;
  
  // Dados para o grafico de pizza
  const dadosPizza = [
    { name: 'Acertos', value: acertos, color: 'hsl(142, 76%, 36%)' },
    { name: 'Erros', value: erros, color: 'hsl(0, 84%, 60%)' },
  ];

  // Determinar nivel de desempenho
  const getNivelDesempenho = (percent: number) => {
    if (percent >= 90) return { label: 'Excelente!', color: 'text-success', bg: 'bg-success/10', emoji: '🏆' };
    if (percent >= 70) return { label: 'Muito Bom!', color: 'text-primary', bg: 'bg-primary/10', emoji: '🌟' };
    if (percent >= 50) return { label: 'Regular', color: 'text-warning', bg: 'bg-warning/10', emoji: '📚' };
    return { label: 'Precisa Melhorar', color: 'text-destructive', bg: 'bg-destructive/10', emoji: '💪' };
  };

  const desempenho = getNivelDesempenho(porcentagem);
  const questoesErradas = questoes.filter(q => !q.correto);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Header com Pontuacao */}
        <Card className="p-8 mb-8 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <div className="text-center">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-300" />
            <h1 className="text-2xl font-bold mb-2">{resultado.titulo}</h1>
            {resultado.bancas && (
              <p className="opacity-80 mb-4">{resultado.bancas.sigla} - {resultado.bancas.nome}</p>
            )}
            <div className="text-7xl font-bold mb-2">{porcentagem.toFixed(0)}%</div>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 mb-4`}>
              <span className="text-2xl">{desempenho.emoji}</span>
              <span className="font-semibold">{desempenho.label}</span>
            </div>
            <p className="opacity-90 text-lg">
              Voce acertou <span className="font-bold">{acertos}</span> de <span className="font-bold">{resultado.total_questoes}</span> questoes
            </p>
          </div>
        </Card>

        {/* Estatisticas Rapidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-success">{acertos}</p>
                <p className="text-sm text-muted-foreground">Acertos</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-destructive">{erros}</p>
                <p className="text-sm text-muted-foreground">Erros</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{resultado.total_questoes}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Clock className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{resultado.tempo_limite_minutos}</p>
                <p className="text-sm text-muted-foreground">Minutos</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs de Conteudo */}
        <Tabs defaultValue="graficos" className="mb-8">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="graficos" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Graficos
            </TabsTrigger>
            <TabsTrigger value="disciplinas" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Disciplinas
            </TabsTrigger>
            <TabsTrigger value="revisao" className="gap-2">
              <Lightbulb className="h-4 w-4" />
              Revisao
            </TabsTrigger>
          </TabsList>

          <TabsContent value="graficos">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Grafico de Pizza */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <PieChart className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Distribuicao de Respostas</h3>
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

              {/* Grafico de Barras por Disciplina */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Desempenho por Disciplina</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={estatisticasDisciplinas.slice(0, 6)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="disciplina" type="category" width={100} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Bar dataKey="percentual" fill="hsl(var(--primary))" name="Aproveitamento" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="disciplinas">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6">Analise por Disciplina</h3>
              <div className="space-y-6">
                {estatisticasDisciplinas.map((disc, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{disc.disciplina}</span>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-success">{disc.acertos} acertos</span>
                        <span className="text-destructive">{disc.erros} erros</span>
                        <Badge variant={disc.percentual >= 70 ? "default" : disc.percentual >= 50 ? "secondary" : "destructive"}>
                          {disc.percentual}%
                        </Badge>
                      </div>
                    </div>
                    <Progress value={disc.percentual} className="h-2" />
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="revisao">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Revisao das Questoes</h3>
                {questoesErradas.length > 0 && (
                  <Badge variant="destructive">{questoesErradas.length} questoes para revisar</Badge>
                )}
              </div>
              
              <div className="space-y-6">
                {questoes.map((q, idx) => {
                  const correto = q.correto;
                  const respondida = q.resposta_usuario;
                  const mostrarExplicacao = mostrarExplicacoes.has(idx);

                  return (
                    <div
                      key={q.id}
                      className={`p-6 rounded-lg border-2 ${
                        correto 
                          ? 'border-success/30 bg-success/5' 
                          : 'border-destructive/30 bg-destructive/5'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <span className={`px-3 py-1 rounded-full font-semibold shrink-0 ${
                          correto ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'
                        }`}>
                          {correto ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-semibold text-muted-foreground">
                              Questao {idx + 1}
                            </span>
                            <span className="text-sm text-muted-foreground">•</span>
                            <span className="text-sm text-muted-foreground">
                              {q.questoes?.disciplinas?.nome || 'Geral'}
                            </span>
                          </div>
                          
                          <p className="font-medium mb-4 whitespace-pre-wrap">{q.questoes?.enunciado}</p>
                          
                          <div className="space-y-2 mb-4">
                            {['a', 'b', 'c', 'd', 'e'].map((letra) => {
                              const alternativaKey = `alternativa_${letra}` as keyof typeof q.questoes;
                              const alternativa = q.questoes?.[alternativaKey];
                              if (!alternativa) return null;

                              const isGabarito = letra.toUpperCase() === q.questoes?.gabarito;
                              const isResposta = letra.toUpperCase() === respondida;

                              return (
                                <div
                                  key={letra}
                                  className={`p-3 rounded-lg flex items-start gap-2 ${
                                    isGabarito
                                      ? 'bg-success/20 border-2 border-success'
                                      : isResposta && !isGabarito
                                      ? 'bg-destructive/20 border-2 border-destructive'
                                      : 'bg-secondary/50'
                                  }`}
                                >
                                  <span className={`font-bold shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                                    isGabarito ? 'bg-success text-success-foreground' :
                                    isResposta && !isGabarito ? 'bg-destructive text-destructive-foreground' : 
                                    'bg-muted'
                                  }`}>
                                    {letra.toUpperCase()}
                                  </span>
                                  <span className="flex-1">{alternativa}</span>
                                  {isGabarito && (
                                    <Badge variant="outline" className="border-success text-success shrink-0">
                                      Gabarito
                                    </Badge>
                                  )}
                                  {isResposta && !isGabarito && (
                                    <Badge variant="outline" className="border-destructive text-destructive shrink-0">
                                      Sua resposta
                                    </Badge>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {q.questoes?.explicacao && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleExplicacao(idx)}
                                className="gap-2"
                              >
                                {mostrarExplicacao ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                {mostrarExplicacao ? 'Ocultar' : 'Ver'} Explicacao
                              </Button>
                            )}
                            {!correto && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => criarFlashcardDeErro(q)}
                                disabled={flashcardsCriados.has(q.id)}
                                className="gap-2"
                              >
                                <BookOpen className="h-4 w-4" />
                                {flashcardsCriados.has(q.id) ? 'Flashcard Criado' : 'Criar Flashcard'}
                              </Button>
                            )}
                          </div>

                          {mostrarExplicacao && q.questoes?.explicacao && (
                            <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                              <p className="text-sm font-semibold text-primary mb-2">
                                Explicacao:
                              </p>
                              <p className="text-sm whitespace-pre-wrap">{q.questoes.explicacao}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Acoes */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" onClick={() => navigate('/simulados')} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Voltar aos Simulados
          </Button>
          <Button onClick={() => navigate('/flashcards')} className="gap-2">
            <BookOpen className="h-4 w-4" />
            Revisar Flashcards
          </Button>
          <Button onClick={() => navigate('/dashboard')} variant="secondary" className="gap-2">
            <ChevronRight className="h-4 w-4" />
            Ir para Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SimuladoResultado;
