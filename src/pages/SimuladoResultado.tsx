import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, TrendingUp, Target, Clock, ChevronRight } from 'lucide-react';
import { Navigation } from '@/components/Navigation';

const SimuladoResultado = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resultado, setResultado] = useState<any>(null);
  const [questoes, setQuestoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarResultado();
  }, [id]);

  const carregarResultado = async () => {
    try {
      // Buscar simulado
      const { data: simulado, error: simuladoError } = await supabase
        .from('simulados')
        .select('*')
        .eq('id', id)
        .single();

      if (simuladoError) throw simuladoError;

      // Buscar questões com respostas
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
            disciplinas (nome)
          )
        `)
        .eq('simulado_id', id)
        .order('ordem');

      if (questoesError) throw questoesError;

      setResultado(simulado);
      setQuestoes(questoesData || []);
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

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Header com Pontuação */}
        <Card className="p-8 mb-8 gradient-primary text-white">
          <div className="text-center">
            <Trophy className="h-16 w-16 mx-auto mb-4" />
            <h1 className="mb-2">{resultado.titulo}</h1>
            <div className="text-6xl font-bold mb-4">{porcentagem.toFixed(1)}%</div>
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
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => navigate('/simulados')}>
            Voltar aos Simulados
          </Button>
          <Button onClick={() => navigate('/dashboard')}>
            <ChevronRight className="h-4 w-4 mr-2" />
            Ir para Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SimuladoResultado;
