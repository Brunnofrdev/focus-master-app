import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useSimulados, Questao } from '@/hooks/useSimulados';
import { ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { useToast } from '@/hooks/use-toast';
import { SimuladoTimer } from '@/components/SimuladoTimer';

const SimuladoExec = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { responderQuestao, finalizarSimulado } = useSimulados();
  const { toast } = useToast();
  
  const [questoes, setQuestoes] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [respostas, setRespostas] = useState<{ [key: number]: string }>({});
  const [tempoInicio] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [tempoLimite, setTempoLimite] = useState(180);

  useEffect(() => {
    carregarSimulado();
  }, [id]);

  const carregarSimulado = async () => {
    try {
      // Buscar simulado e tempo limite
      const { data: simulado, error: simuladoError } = await supabase
        .from('simulados')
        .select('tempo_limite_minutos')
        .eq('id', id)
        .single();

      if (simuladoError) throw simuladoError;
      setTempoLimite(simulado.tempo_limite_minutos || 180);

      const { data, error } = await supabase
        .from('simulado_questoes')
        .select(`
          id,
          ordem,
          questoes (
            id,
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

      if (error) throw error;
      setQuestoes(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar simulado',
        description: error.message,
        variant: 'destructive'
      });
      navigate('/simulados');
    } finally {
      setLoading(false);
    }
  };

  const handleResposta = async (alternativa: string) => {
    const novasRespostas = { ...respostas, [currentIndex]: alternativa };
    setRespostas(novasRespostas);

    // Salvar no banco
    const questaoAtual = questoes[currentIndex];
    await responderQuestao(
      questaoAtual.id,
      alternativa,
      Math.floor((Date.now() - tempoInicio) / 1000)
    );
  };

  const handleFinalizar = async () => {
    if (window.confirm('Deseja realmente finalizar o simulado?')) {
      const resultado = await finalizarSimulado(id!);
      if (resultado) {
        navigate(`/simulados/${id}/resultado`);
      }
    }
  };

  const handleTempoEsgotado = () => {
    toast({
      title: 'Tempo esgotado!',
      description: 'O simulado será finalizado automaticamente.',
      variant: 'destructive'
    });
    handleFinalizar();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando simulado...</p>
        </div>
      </div>
    );
  }

  if (questoes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Nenhuma questão encontrada</p>
          <Button onClick={() => navigate('/simulados')}>Voltar</Button>
        </Card>
      </div>
    );
  }

  const questaoAtual = questoes[currentIndex];
  const progresso = ((currentIndex + 1) / questoes.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Header com Timer e Progresso */}
        <div className="mb-6 space-y-4 sticky top-20 z-10">
          <SimuladoTimer 
            tempoLimiteMinutos={tempoLimite} 
            onTempoEsgotado={handleTempoEsgotado}
          />
          
          <Card className="p-4 bg-card/95 backdrop-blur">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">
                Questão {currentIndex + 1} de {questoes.length}
              </span>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleFinalizar}
              >
                <Flag className="h-4 w-4 mr-2" />
                Finalizar
              </Button>
            </div>
            
            <Progress value={progresso} className="h-2" />
          </Card>
        </div>

        {/* Questão */}
        <Card className="p-8 mb-6">
          <div className="mb-6">
            <span className="text-sm text-muted-foreground">
              {questaoAtual.questoes?.disciplinas?.nome || 'Geral'}
            </span>
            <h2 className="text-xl font-semibold mt-2">
              {questaoAtual.questoes?.enunciado}
            </h2>
          </div>

          <div className="space-y-3">
            {['a', 'b', 'c', 'd', 'e'].map((letra) => {
              const alternativaKey = `alternativa_${letra}` as keyof typeof questaoAtual.questoes;
              const alternativa = questaoAtual.questoes?.[alternativaKey];
              
              if (!alternativa) return null;

              const isSelected = respostas[currentIndex] === letra.toUpperCase();

              return (
                <button
                  key={letra}
                  onClick={() => handleResposta(letra.toUpperCase())}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all hover:border-primary ${
                    isSelected 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:bg-accent/50'
                  }`}
                >
                  <span className="font-semibold mr-3">{letra.toUpperCase()})</span>
                  {alternativa}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Navegação */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          <div className="flex gap-2">
            {questoes.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                  idx === currentIndex
                    ? 'bg-primary text-white'
                    : respostas[idx]
                    ? 'bg-success/20 text-success border-2 border-success'
                    : 'bg-secondary hover:bg-accent'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={() => setCurrentIndex(prev => Math.min(questoes.length - 1, prev + 1))}
            disabled={currentIndex === questoes.length - 1}
          >
            Próxima
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SimuladoExec;
