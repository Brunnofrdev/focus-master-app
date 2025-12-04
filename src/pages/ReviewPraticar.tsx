import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRevisao, Revisao } from '@/hooks/useRevisao';
import { Navigation } from '@/components/Navigation';
import { AIHelpButton, AIExplainModal } from '@/components/ai';
import { 
  Brain, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  Trophy,
  Clock,
  Zap,
  ArrowLeft,
  Keyboard,
  ThumbsUp,
  ThumbsDown,
  SkipForward,
  Lightbulb,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ReviewPraticar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { listarRevisoesPendentes, adicionarRevisao, loading } = useRevisao();
  const { toast } = useToast();
  
  const [revisoes, setRevisoes] = useState<Revisao[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [respostaUsuario, setRespostaUsuario] = useState<string | null>(null);
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [tempoInicio, setTempoInicio] = useState<number>(Date.now());
  const [tempoQuestao, setTempoQuestao] = useState<number>(0);
  const [estatisticas, setEstatisticas] = useState({ 
    acertos: 0, 
    erros: 0,
    tempoTotal: 0,
    tempos: [] as number[]
  });
  const [confianca, setConfianca] = useState<'facil' | 'medio' | 'dificil' | null>(null);
  const [mostrarAtalhos, setMostrarAtalhos] = useState(false);
  const [showAIExplain, setShowAIExplain] = useState(false);

  useEffect(() => {
    carregarRevisoes();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      if (!mostrarResultado) {
        // Responder com teclas 1-5 ou A-E
        const keyMap: Record<string, string> = {
          '1': 'A', '2': 'B', '3': 'C', '4': 'D', '5': 'E',
          'a': 'A', 'b': 'B', 'c': 'C', 'd': 'D', 'e': 'E'
        };
        if (keyMap[e.key.toLowerCase()]) {
          handleResposta(keyMap[e.key.toLowerCase()]);
        }
      } else {
        // Enter ou Space para próxima
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleProxima();
        }
      }
      
      // ESC para voltar
      if (e.key === 'Escape') {
        navigate('/review');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mostrarResultado, currentIndex, revisoes]);

  const carregarRevisoes = async () => {
    const disciplinaFiltro = location.state?.disciplina;
    let data = await listarRevisoesPendentes();
    
    if (disciplinaFiltro && disciplinaFiltro !== 'all') {
      data = data.filter(r => r.questao?.disciplina?.nome === disciplinaFiltro);
    }
    
    if (data.length === 0) {
      toast({
        title: 'Nenhuma revisão pendente',
        description: 'Você está em dia com suas revisões!',
      });
      navigate('/review');
      return;
    }
    
    setRevisoes(data);
    setTempoInicio(Date.now());
  };

  const handleResposta = useCallback((alternativa: string) => {
    if (mostrarResultado) return;
    
    const tempoResposta = Math.floor((Date.now() - tempoInicio) / 1000);
    setTempoQuestao(tempoResposta);
    setRespostaUsuario(alternativa);
    setMostrarResultado(true);
    
    const questaoAtual = revisoes[currentIndex];
    const correto = alternativa === questaoAtual.questao.gabarito;
    
    setEstatisticas(prev => ({
      ...prev,
      acertos: correto ? prev.acertos + 1 : prev.acertos,
      erros: !correto ? prev.erros + 1 : prev.erros,
      tempoTotal: prev.tempoTotal + tempoResposta,
      tempos: [...prev.tempos, tempoResposta]
    }));
    
    // Registrar revisão
    adicionarRevisao(questaoAtual.questao_id, correto);
  }, [mostrarResultado, tempoInicio, revisoes, currentIndex, adicionarRevisao]);

  const handleProxima = useCallback(() => {
    if (currentIndex < revisoes.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setRespostaUsuario(null);
      setMostrarResultado(false);
      setConfianca(null);
      setTempoInicio(Date.now());
    } else {
      // Finalizar sessão
      const tempoMedio = estatisticas.tempoTotal / revisoes.length;
      const taxa = (estatisticas.acertos / revisoes.length) * 100;
      
      toast({
        title: 'Revisão completa! 🎉',
        description: `${estatisticas.acertos}/${revisoes.length} acertos (${taxa.toFixed(0)}%) • Tempo médio: ${tempoMedio.toFixed(0)}s`,
      });
      navigate('/review');
    }
  }, [currentIndex, revisoes.length, estatisticas, navigate, toast]);

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
  const taxaAtual = estatisticas.acertos + estatisticas.erros > 0 
    ? (estatisticas.acertos / (estatisticas.acertos + estatisticas.erros)) * 100 
    : 0;

  // Detectar se é questão CESPE (Certo/Errado)
  const isCespe = !questaoAtual.questao.alternativa_c || 
                  questaoAtual.questao.alternativa_c.trim() === '';
  const alternativas = isCespe 
    ? ['a', 'b'] 
    : ['a', 'b', 'c', 'd', 'e'].filter(l => questaoAtual.questao[`alternativa_${l}` as keyof typeof questaoAtual.questao]);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 pt-24 max-w-4xl">
        {/* Header com Progresso */}
        <Card className="p-4 mb-6 sticky top-20 z-10 bg-card/95 backdrop-blur-sm border-b shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/review')}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <div>
                  <span className="font-semibold">
                    Questão {currentIndex + 1}/{revisoes.length}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex gap-3 text-sm">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="font-semibold text-success">{estatisticas.acertos}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-destructive/10">
                  <XCircle className="h-4 w-4 text-destructive" />
                  <span className="font-semibold text-destructive">{estatisticas.erros}</span>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMostrarAtalhos(!mostrarAtalhos)}
                className="h-8 w-8"
              >
                <Keyboard className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Progress value={progresso} className="flex-1 h-2" />
            <span className="text-sm text-muted-foreground font-medium">
              {taxaAtual.toFixed(0)}%
            </span>
          </div>
          
          {/* Atalhos de teclado */}
          {mostrarAtalhos && (
            <div className="mt-3 pt-3 border-t flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-muted rounded">1-5</kbd> ou
                <kbd className="px-1.5 py-0.5 bg-muted rounded">A-E</kbd> Responder
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-muted rounded">Enter</kbd> Próxima
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-muted rounded">ESC</kbd> Sair
              </span>
            </div>
          )}
        </Card>

        {/* Questão */}
        <Card className="p-6 md:p-8 mb-6">
          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {typeof questaoAtual.questao?.disciplina === 'object' 
                ? questaoAtual.questao.disciplina?.nome 
                : 'Geral'}
            </Badge>
            {isCespe && (
              <Badge variant="outline" className="text-orange-500 border-orange-500/50">
                CESPE - Certo/Errado
              </Badge>
            )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
              <Zap className="h-3 w-3" />
              Acertos consecutivos: {questaoAtual.acertos_consecutivos}
            </div>
          </div>
          
          {/* Enunciado */}
          <div className="mb-8">
            <h3 className="text-lg md:text-xl leading-relaxed font-medium">
              {questaoAtual.questao.enunciado}
            </h3>
          </div>

          {/* Alternativas */}
          <div className="space-y-3">
            {alternativas.map((letra, idx) => {
              const alternativaKey = `alternativa_${letra}` as keyof typeof questaoAtual.questao;
              const alternativa = questaoAtual.questao[alternativaKey];
              
              if (!alternativa || (typeof alternativa === 'string' && alternativa.trim() === '')) return null;

              const isGabarito = letra.toUpperCase() === questaoAtual.questao.gabarito;
              const isResposta = letra.toUpperCase() === respostaUsuario;
              
              let cardClass = 'border-border bg-card hover:border-primary hover:bg-primary/5';
              let iconElement = null;
              
              if (mostrarResultado) {
                if (isGabarito) {
                  cardClass = 'border-success bg-success/10';
                  iconElement = <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />;
                } else if (isResposta) {
                  cardClass = 'border-destructive bg-destructive/10';
                  iconElement = <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />;
                } else {
                  cardClass = 'border-muted bg-muted/30 opacity-60';
                }
              } else if (isResposta) {
                cardClass = 'border-primary bg-primary/10';
              }

              // Labels para CESPE
              const label = isCespe 
                ? (letra === 'a' ? 'CERTO' : 'ERRADO')
                : `${letra.toUpperCase()})`;

              return (
                <button
                  key={letra}
                  onClick={() => handleResposta(letra.toUpperCase())}
                  disabled={mostrarResultado}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${cardClass} ${
                    !mostrarResultado ? 'cursor-pointer' : 'cursor-default'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`font-bold text-lg min-w-[2rem] ${
                      isCespe ? (letra === 'a' ? 'text-success' : 'text-destructive') : ''
                    }`}>
                      {label}
                    </span>
                    <span className="flex-1 leading-relaxed">{String(alternativa)}</span>
                    {iconElement}
                  </div>
                  
                  {/* Atalho de teclado */}
                  {!mostrarResultado && (
                    <span className="absolute top-2 right-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100">
                      {idx + 1}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Resultado e Explicação */}
          {mostrarResultado && (
            <div className="mt-6 space-y-4">
              {/* Feedback rápido */}
              <div className={`p-4 rounded-xl flex items-center gap-4 ${
                correto ? 'bg-success/10 border border-success/20' : 'bg-destructive/10 border border-destructive/20'
              }`}>
                {correto ? (
                  <ThumbsUp className="h-8 w-8 text-success" />
                ) : (
                  <ThumbsDown className="h-8 w-8 text-destructive" />
                )}
                <div className="flex-1">
                  <p className={`font-semibold ${correto ? 'text-success' : 'text-destructive'}`}>
                    {correto ? 'Correto!' : 'Incorreto'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tempo: {tempoQuestao}s • 
                    Gabarito: {questaoAtual.questao.gabarito}
                  </p>
                </div>
                
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {tempoQuestao}s
                </div>
              </div>
              
              {/* Explicação */}
              {questaoAtual.questao.explicacao && (
                <div className="p-5 rounded-xl bg-muted/50 border">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Lightbulb className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2">Explicação</h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {questaoAtual.questao.explicacao}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Botão IA */}
              <Button
                variant="outline"
                onClick={() => setShowAIExplain(true)}
                className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/10"
              >
                <Sparkles className="w-4 h-4" />
                Explicação detalhada com IA
              </Button>
            </div>
          )}
        </Card>

        {/* Navegação */}
        {mostrarResultado && (
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button 
              size="lg" 
              onClick={handleProxima}
              className="gap-2 min-w-[200px]"
            >
              {currentIndex < revisoes.length - 1 ? (
                <>
                  Próxima Questão
                  <ChevronRight className="h-5 w-5" />
                </>
              ) : (
                <>
                  Finalizar Revisão
                  <Trophy className="h-5 w-5" />
                </>
              )}
            </Button>
            
            {currentIndex < revisoes.length - 1 && (
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => {
                  // Skip to summary
                  navigate('/review');
                }}
                className="gap-2"
              >
                <BarChart3 className="h-5 w-5" />
                Ver Resumo
              </Button>
            )}
          </div>
        )}
        
        {/* Dica de atalho */}
        {!mostrarResultado && (
          <p className="text-center text-xs text-muted-foreground mt-4">
            Pressione <kbd className="px-1.5 py-0.5 bg-muted rounded mx-1">1-5</kbd> 
            ou <kbd className="px-1.5 py-0.5 bg-muted rounded mx-1">A-E</kbd> para responder rapidamente
          </p>
        )}
      </div>
      
      {/* AI Explain Modal */}
      {revisoes.length > 0 && (
        <AIExplainModal
          open={showAIExplain}
          onOpenChange={setShowAIExplain}
          question={revisoes[currentIndex]?.questao?.enunciado || ''}
          answer={revisoes[currentIndex]?.questao?.gabarito || ''}
          alternatives={{
            a: revisoes[currentIndex]?.questao?.alternativa_a || '',
            b: revisoes[currentIndex]?.questao?.alternativa_b || '',
            c: revisoes[currentIndex]?.questao?.alternativa_c || '',
            d: revisoes[currentIndex]?.questao?.alternativa_d || '',
            e: revisoes[currentIndex]?.questao?.alternativa_e || ''
          }}
        />
      )}
      
      {/* FAB AI */}
      <AIHelpButton variant="fab" context="Revisão de questões para concursos" />
    </div>
  );
};

export default ReviewPraticar;
