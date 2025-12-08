import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useSimulados } from '@/hooks/useSimulados';
import { 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  Maximize, 
  Minimize, 
  X,
  Check,
  AlertCircle,
  Clock,
  Save
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { useToast } from '@/hooks/use-toast';
import { SimuladoTimer } from '@/components/SimuladoTimer';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface QuestaoSimulado {
  id: string;
  ordem: number;
  marcada_revisao: boolean;
  resposta_usuario: string | null;
  questoes: {
    id: string;
    enunciado: string;
    alternativa_a: string;
    alternativa_b: string;
    alternativa_c: string;
    alternativa_d: string;
    alternativa_e: string | null;
    gabarito: string;
    explicacao: string | null;
    disciplinas?: { nome: string } | null;
  } | null;
}

const SimuladoExec = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { responderQuestao, finalizarSimulado, buscarSimulado, buscarQuestoesSimulado } = useSimulados();
  const { toast } = useToast();
  
  const [questoes, setQuestoes] = useState<QuestaoSimulado[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [respostas, setRespostas] = useState<{ [key: number]: string }>({});
  const [tempoInicio] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [tempoLimite, setTempoLimite] = useState(180);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [marcadasRevisao, setMarcadasRevisao] = useState<Set<number>>(new Set());
  const [salvando, setSalvando] = useState(false);
  const [showFinalizarDialog, setShowFinalizarDialog] = useState(false);
  const [simuladoInfo, setSimuladoInfo] = useState<any>(null);
  
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (id) {
      carregarSimulado();
    }
    
    return () => {
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
    };
  }, [id]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Auto-save a cada 30 segundos
  useEffect(() => {
    autoSaveRef.current = setInterval(() => {
      if (Object.keys(respostas).length > 0) {
        toast({
          title: 'Progresso salvo',
          description: 'Suas respostas foram salvas automaticamente.',
          duration: 2000
        });
      }
    }, 30000);

    return () => {
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
    };
  }, [respostas]);

  const carregarSimulado = async () => {
    try {
      setLoading(true);

      // Buscar informacoes do simulado
      const simulado = await buscarSimulado(id!);
      if (!simulado) {
        toast({
          title: 'Simulado nao encontrado',
          description: 'O simulado solicitado nao existe.',
          variant: 'destructive'
        });
        navigate('/simulados');
        return;
      }

      setSimuladoInfo(simulado);
      setTempoLimite(simulado.tempo_limite_minutos || 180);

      // Buscar questoes
      const questoesData = await buscarQuestoesSimulado(id!);
      
      if (!questoesData || questoesData.length === 0) {
        toast({
          title: 'Sem questoes',
          description: 'Este simulado nao possui questoes.',
          variant: 'destructive'
        });
        navigate('/simulados');
        return;
      }

      setQuestoes(questoesData as QuestaoSimulado[]);

      // Carregar respostas ja salvas
      const respostasSalvas: { [key: number]: string } = {};
      const marcadas = new Set<number>();
      
      questoesData.forEach((q: any, idx: number) => {
        if (q.resposta_usuario) {
          respostasSalvas[idx] = q.resposta_usuario;
        }
        if (q.marcada_revisao) {
          marcadas.add(idx);
        }
      });

      setRespostas(respostasSalvas);
      setMarcadasRevisao(marcadas);
    } catch (error: any) {
      console.error('Erro ao carregar simulado:', error);
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

  const handleResposta = useCallback(async (alternativa: string) => {
    const novasRespostas = { ...respostas, [currentIndex]: alternativa };
    setRespostas(novasRespostas);

    const questaoAtual = questoes[currentIndex];
    if (questaoAtual) {
      setSalvando(true);
      await responderQuestao(
        questaoAtual.id,
        alternativa,
        Math.floor((Date.now() - tempoInicio) / 1000)
      );
      setSalvando(false);
    }
  }, [respostas, currentIndex, questoes, tempoInicio, responderQuestao]);

  const handleFinalizar = async () => {
    setShowFinalizarDialog(false);
    
    const resultado = await finalizarSimulado(id!);
    if (resultado) {
      navigate(`/simulados/${id}/resultado`);
    }
  };

  const handleTempoEsgotado = async () => {
    toast({
      title: 'Tempo esgotado!',
      description: 'O simulado sera finalizado automaticamente.',
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

    const questaoAtual = questoes[idx];
    if (questaoAtual) {
      await supabase
        .from('simulado_questoes')
        .update({ marcada_revisao: novasMarcadas.has(idx) })
        .eq('id', questaoAtual.id);
    }
  };

  const navegarQuestao = (direcao: 'anterior' | 'proxima') => {
    if (direcao === 'anterior' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (direcao === 'proxima' && currentIndex < questoes.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        navegarQuestao('anterior');
      } else if (e.key === 'ArrowRight') {
        navegarQuestao('proxima');
      } else if (['a', 'b', 'c', 'd', 'e', 'A', 'B', 'C', 'D', 'E'].includes(e.key)) {
        const letra = e.key.toUpperCase();
        const questaoAtual = questoes[currentIndex];
        const alternativaKey = `alternativa_${letra.toLowerCase()}` as keyof typeof questaoAtual.questoes;
        if (questaoAtual?.questoes?.[alternativaKey]) {
          handleResposta(letra);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, questoes, handleResposta]);

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
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Nenhuma questao encontrada</p>
          <Button onClick={() => navigate('/simulados')}>Voltar</Button>
        </Card>
      </div>
    );
  }

  const questaoAtual = questoes[currentIndex];
  const progresso = ((currentIndex + 1) / questoes.length) * 100;
  const respondidas = Object.keys(respostas).length;
  const naoRespondidas = questoes.length - respondidas;

  return (
    <div className={`min-h-screen ${isFullscreen ? 'bg-background' : 'bg-gradient-subtle'}`}>
      {!isFullscreen && <Navigation />}
      
      <div className={`container mx-auto px-4 ${isFullscreen ? 'py-4' : 'py-8 pt-24'}`}>
        {/* Header com Timer e Controles */}
        <div className={`mb-6 space-y-4 ${isFullscreen ? '' : 'sticky top-20'} z-10`}>
          <Card className="p-4 bg-card/95 backdrop-blur">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold">{simuladoInfo?.titulo || 'Simulado'}</h2>
                  {salvando && (
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Save className="h-3 w-3 animate-pulse" />
                      Salvando...
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="font-semibold text-foreground">Questao {currentIndex + 1}</span> de {questoes.length}
                  </span>
                  <span className="flex items-center gap-1 text-success">
                    <Check className="h-4 w-4" />
                    {respondidas} respondidas
                  </span>
                  {naoRespondidas > 0 && (
                    <span className="flex items-center gap-1 text-warning">
                      <AlertCircle className="h-4 w-4" />
                      {naoRespondidas} pendentes
                    </span>
                  )}
                  {marcadasRevisao.size > 0 && (
                    <span className="flex items-center gap-1 text-accent">
                      <Flag className="h-4 w-4" />
                      {marcadasRevisao.size} marcadas
                    </span>
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

        {/* Questao */}
        <Card className="p-6 md:p-8 mb-6">
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4 gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                  Questao {currentIndex + 1}
                </span>
                <span className="text-sm text-muted-foreground">
                  {questaoAtual.questoes?.disciplinas?.nome || 'Geral'}
                </span>
              </div>
              <Button
                variant={marcadasRevisao.has(currentIndex) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleMarcacaoRevisao(currentIndex)}
                className="gap-2 shrink-0"
              >
                <Flag className="h-4 w-4" />
                {marcadasRevisao.has(currentIndex) ? 'Marcada' : 'Marcar'}
              </Button>
            </div>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-lg leading-relaxed whitespace-pre-wrap">
                {questaoAtual.questoes?.enunciado}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {['a', 'b', 'c', 'd', 'e'].map((letra) => {
              const alternativaKey = `alternativa_${letra}` as 'alternativa_a' | 'alternativa_b' | 'alternativa_c' | 'alternativa_d' | 'alternativa_e';
              const alternativa = questaoAtual.questoes?.[alternativaKey] as string | null | undefined;
              
              if (!alternativa) return null;

              const isSelected = respostas[currentIndex] === letra.toUpperCase();

              return (
                <button
                  key={letra}
                  onClick={() => handleResposta(letra.toUpperCase())}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all hover:border-primary ${
                    isSelected 
                      ? 'border-primary bg-primary/10 shadow-md' 
                      : 'border-border hover:bg-accent/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`font-bold text-lg shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      isSelected ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                    }`}>
                      {letra.toUpperCase()}
                    </span>
                    <span className="pt-1">{alternativa}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground mt-4 text-center">
            Dica: Use as teclas A, B, C, D, E para responder e setas para navegar
          </p>
        </Card>

        {/* Navegacao de Questoes */}
        <div className="flex flex-wrap gap-2 justify-center mb-6 p-4 bg-card rounded-lg">
          {questoes.map((q, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              title={`Questao ${idx + 1}${respostas[idx] ? ' - Respondida' : ' - Nao respondida'}${marcadasRevisao.has(idx) ? ' - Marcada para revisao' : ''}`}
              className={`w-10 h-10 rounded-lg font-semibold transition-all relative ${
                idx === currentIndex
                  ? 'bg-primary text-primary-foreground shadow-lg scale-110 ring-2 ring-primary ring-offset-2'
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

        {/* Botoes de Navegacao */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navegarQuestao('anterior')}
            disabled={currentIndex === 0}
            className="w-full sm:w-auto"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => navegarQuestao('proxima')}
              disabled={currentIndex === questoes.length - 1}
              className="flex-1 sm:flex-initial"
            >
              Proxima
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowFinalizarDialog(true)}
              className="flex-1 sm:flex-initial"
            >
              <Flag className="h-4 w-4 mr-2" />
              Finalizar
            </Button>
          </div>
        </div>
      </div>

      {/* Dialog de Confirmacao */}
      <AlertDialog open={showFinalizarDialog} onOpenChange={setShowFinalizarDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finalizar Simulado</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Voce respondeu {respondidas} de {questoes.length} questoes.</p>
              {naoRespondidas > 0 && (
                <p className="text-warning font-semibold">
                  Atencao: {naoRespondidas} questao(oes) ainda nao foi(ram) respondida(s).
                </p>
              )}
              <p>Deseja realmente finalizar o simulado?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar Respondendo</AlertDialogCancel>
            <AlertDialogAction onClick={handleFinalizar}>
              Finalizar Simulado
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SimuladoExec;
