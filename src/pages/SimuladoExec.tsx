import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useSimulados } from '@/hooks/useSimulados';
import { ChevronLeft, ChevronRight, Flag, Maximize, Minimize, X } from 'lucide-react';
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [marcadasRevisao, setMarcadasRevisao] = useState<Set<number>>(new Set());

  useEffect(() => {
    carregarSimulado();
  }, [id]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const carregarSimulado = async () => {
    try {
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
          marcada_revisao,
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
      
      const questoesComMarcacao = data || [];
      setQuestoes(questoesComMarcacao);
      
      // Carregar questões marcadas
      const marcadas = new Set<number>();
      questoesComMarcacao.forEach((q, idx) => {
        if (q.marcada_revisao) marcadas.add(idx);
      });
      setMarcadasRevisao(marcadas);
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

    const questaoAtual = questoes[currentIndex];
    await responderQuestao(
      questaoAtual.id,
      alternativa,
      Math.floor((Date.now() - tempoInicio) / 1000)
    );
  };

  const handleFinalizar = async () => {
    const respondidas = Object.keys(respostas).length;
    const total = questoes.length;
    
    if (respondidas < total) {
      const naoRespondidas = total - respondidas;
      if (!window.confirm(`Você tem ${naoRespondidas} questão(ões) não respondida(s). Deseja realmente finalizar o simulado?`)) {
        return;
      }
    } else {
      if (!window.confirm('Deseja realmente finalizar o simulado?')) {
        return;
      }
    }
    
    const resultado = await finalizarSimulado(id!);
    if (resultado) {
      toast({
        title: 'Simulado finalizado!',
        description: `Você acertou ${resultado.acertos} de ${resultado.total} questões.`
      });
      navigate(`/simulados/${id}/resultado`);
    }
  };

  const handleTempoEsgotado = async () => {
    toast({
      title: 'Tempo esgotado!',
      description: 'O simulado será finalizado automaticamente.',
      variant: 'destructive'
    });
    
    const resultado = await finalizarSimulado(id!);
    if (resultado) {
      navigate(`/simulados/${id}/resultado`);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error('Erro ao entrar em fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const toggleMarcacaoRevisao = async (idx: number) => {
    const novasMarcadas = new Set(marcadasRevisao);
    if (novasMarcadas.has(idx)) {
      novasMarcadas.delete(idx);
    } else {
      novasMarcadas.add(idx);
    }
    setMarcadasRevisao(novasMarcadas);

    // Salvar no banco
    const questaoAtual = questoes[idx];
    await supabase
      .from('simulado_questoes')
      .update({ marcada_revisao: novasMarcadas.has(idx) })
      .eq('id', questaoAtual.id);
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
    <div className={`min-h-screen ${isFullscreen ? 'bg-background' : 'bg-gradient-subtle'}`}>
      {!isFullscreen && <Navigation />}
      
      <div className={`container mx-auto px-4 ${isFullscreen ? 'py-8' : 'py-8 pt-24'}`}>
        {/* Header com Timer e Controles */}
        <div className="mb-6 space-y-4 sticky top-20 z-10">
          <Card className="p-4 bg-card/95 backdrop-blur">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold">Simulado em Andamento</h2>
                  {isFullscreen && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleFullscreen}
                      className="gap-2"
                    >
                      <X className="h-4 w-4" />
                      Sair
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Questão {currentIndex + 1} de {questoes.length}</span>
                  <span>•</span>
                  <span>{Object.keys(respostas).length} respondidas</span>
                  {marcadasRevisao.size > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-accent font-semibold">{marcadasRevisao.size} marcadas</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="gap-2"
                >
                  {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                  {isFullscreen ? 'Sair' : 'Modo Prova'}
                </Button>
                <SimuladoTimer 
                  tempoLimiteMinutos={tempoLimite} 
                  onTempoEsgotado={handleTempoEsgotado}
                />
              </div>
            </div>
            <Progress value={progresso} className="h-2 mt-4" />
          </Card>
        </div>

        {/* Questão */}
        <Card className="p-6 md:p-8 mb-6">
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                Questão {currentIndex + 1}
              </span>
              <Button
                variant={marcadasRevisao.has(currentIndex) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleMarcacaoRevisao(currentIndex)}
                className="gap-2"
              >
                <Flag className="h-4 w-4" />
                {marcadasRevisao.has(currentIndex) ? 'Marcada' : 'Marcar para Revisão'}
              </Button>
            </div>
            <span className="text-sm text-muted-foreground">
              {questaoAtual.questoes?.disciplinas?.nome || 'Geral'}
            </span>
            <h2 className="text-xl font-semibold mt-2 leading-relaxed">
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
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="w-full lg:w-auto"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          <div className="flex flex-wrap gap-2 max-w-3xl justify-center">
            {questoes.map((q, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                title={`Questão ${idx + 1}${respostas[idx] ? ' - Respondida' : ' - Não respondida'}${marcadasRevisao.has(idx) ? ' - Marcada para revisão' : ''}`}
                className={`w-10 h-10 rounded-lg font-semibold transition-all relative ${
                  idx === currentIndex
                    ? 'bg-primary text-white shadow-lg scale-110'
                    : respostas[idx]
                    ? 'bg-success/20 text-success border-2 border-success hover:bg-success/30'
                    : 'bg-secondary hover:bg-accent border-2 border-border'
                }`}
              >
                {idx + 1}
                {marcadasRevisao.has(idx) && (
                  <Flag className="h-3 w-3 absolute -top-1 -right-1 text-accent fill-accent" />
                )}
              </button>
            ))}
          </div>

          <div className="flex gap-2 w-full lg:w-auto">
            <Button
              variant="outline"
              onClick={() => setCurrentIndex(prev => Math.min(questoes.length - 1, prev + 1))}
              disabled={currentIndex === questoes.length - 1}
              className="flex-1 lg:flex-initial"
            >
              Próxima
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
            <Button
              variant="destructive"
              onClick={handleFinalizar}
              className="flex-1 lg:flex-initial"
            >
              <Flag className="h-4 w-4 mr-2" />
              Finalizar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimuladoExec;
