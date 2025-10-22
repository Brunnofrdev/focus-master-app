import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { useRevisao } from '@/hooks/useRevisao';
import { Navigation } from '@/components/Navigation';
import { Brain, CheckCircle2, XCircle, ChevronRight, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ReviewPraticar = () => {
  const navigate = useNavigate();
  const { listarRevisoesPendentes, adicionarRevisao, loading } = useRevisao();
  const { toast } = useToast();
  
  const [revisoes, setRevisoes] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [respostaUsuario, setRespostaUsuario] = useState<string | null>(null);
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [estatisticas, setEstatisticas] = useState({ acertos: 0, erros: 0 });

  useEffect(() => {
    carregarRevisoes();
  }, []);

  const carregarRevisoes = async () => {
    const data = await listarRevisoesPendentes();
    if (data.length === 0) {
      toast({
        title: 'Nenhuma revisão pendente',
        description: 'Você está em dia com suas revisões!',
      });
      navigate('/review');
      return;
    }
    setRevisoes(data);
  };

  const handleResposta = (alternativa: string) => {
    if (mostrarResultado) return;
    setRespostaUsuario(alternativa);
    setMostrarResultado(true);
    
    const correto = alternativa === questaoAtual.questao.gabarito;
    
    if (correto) {
      setEstatisticas(prev => ({ ...prev, acertos: prev.acertos + 1 }));
    } else {
      setEstatisticas(prev => ({ ...prev, erros: prev.erros + 1 }));
    }
    
    // Registrar revisão
    adicionarRevisao(questaoAtual.questao_id, correto);
  };

  const handleProxima = () => {
    if (currentIndex < revisoes.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setRespostaUsuario(null);
      setMostrarResultado(false);
    } else {
      // Finalizar sessão
      toast({
        title: 'Revisão completa! 🎉',
        description: `Você acertou ${estatisticas.acertos} de ${revisoes.length} questões.`,
      });
      navigate('/review');
    }
  };

  if (loading || revisoes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando revisões...</p>
        </div>
      </div>
    );
  }

  const questaoAtual = revisoes[currentIndex];
  const progresso = ((currentIndex + 1) / revisoes.length) * 100;
  const correto = respostaUsuario === questaoAtual.questao.gabarito;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 pt-24 max-w-4xl">
        {/* Header com Progresso */}
        <Card className="p-6 mb-6 sticky top-20 z-10 bg-card/95 backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Brain className="h-6 w-6 text-primary" />
              <div>
                <h2 className="font-semibold">Sessão de Revisão</h2>
                <p className="text-sm text-muted-foreground">
                  Questão {currentIndex + 1} de {revisoes.length}
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="font-semibold">{estatisticas.acertos}</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-destructive" />
                <span className="font-semibold">{estatisticas.erros}</span>
              </div>
            </div>
          </div>
          
          <Progress value={progresso} className="h-2" />
        </Card>

        {/* Questão */}
        <Card className="p-8 mb-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold">
                {questaoAtual.questao?.disciplina?.nome || 'Geral'}
              </span>
              <span className="text-sm text-muted-foreground">
                Próxima revisão prevista: {new Date(questaoAtual.proxima_revisao).toLocaleDateString('pt-BR')}
              </span>
            </div>
            <h3 className="text-xl leading-relaxed">
              {questaoAtual.questao.enunciado}
            </h3>
          </div>

          <div className="space-y-3">
            {['a', 'b', 'c', 'd', 'e'].map((letra) => {
              const alternativaKey = `alternativa_${letra}`;
              const alternativa = questaoAtual.questao[alternativaKey];
              
              if (!alternativa) return null;

              const isGabarito = letra.toUpperCase() === questaoAtual.questao.gabarito;
              const isResposta = letra.toUpperCase() === respostaUsuario;
              
              let borderClass = 'border-border';
              let bgClass = 'bg-card';
              
              if (mostrarResultado) {
                if (isGabarito) {
                  borderClass = 'border-success';
                  bgClass = 'bg-success/10';
                } else if (isResposta) {
                  borderClass = 'border-destructive';
                  bgClass = 'bg-destructive/10';
                }
              } else if (isResposta) {
                borderClass = 'border-primary';
                bgClass = 'bg-primary/10';
              }

              return (
                <button
                  key={letra}
                  onClick={() => handleResposta(letra.toUpperCase())}
                  disabled={mostrarResultado}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${borderClass} ${bgClass} ${
                    !mostrarResultado ? 'hover:border-primary cursor-pointer' : 'cursor-default'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="font-bold text-lg">{letra.toUpperCase()})</span>
                    <span className="flex-1">{alternativa}</span>
                    {mostrarResultado && isGabarito && (
                      <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                    )}
                    {mostrarResultado && isResposta && !isGabarito && (
                      <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explicação */}
          {mostrarResultado && questaoAtual.questao.explicacao && (
            <div className={`mt-6 p-6 rounded-lg border-2 ${
              correto ? 'border-success bg-success/5' : 'border-destructive bg-destructive/5'
            }`}>
              <div className="flex items-start gap-3 mb-3">
                {correto ? (
                  <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0 mt-1" />
                ) : (
                  <XCircle className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
                )}
                <div>
                  <h4 className="font-semibold mb-2">
                    {correto ? 'Parabéns! Resposta correta!' : 'Resposta incorreta'}
                  </h4>
                  <p className="text-sm leading-relaxed">{questaoAtual.questao.explicacao}</p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Navegação */}
        {mostrarResultado && (
          <div className="flex justify-center">
            <Button 
              size="lg" 
              onClick={handleProxima}
              className="gap-2"
            >
              {currentIndex < revisoes.length - 1 ? (
                <>
                  Próxima Questão
                  <ChevronRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  Finalizar Revisão
                  <Trophy className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewPraticar;
