import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Navigation } from '@/components/Navigation';
import { AIHelpButton } from '@/components/ai';
import { 
  Sparkles, 
  Plus, 
  Play, 
  RotateCcw, 
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Edit,
  BookOpen,
  Brain,
  TrendingUp,
  Calendar,
  Target,
  Flame,
  Award
} from 'lucide-react';
import { useFlashcards, Flashcard } from '@/hooks/useFlashcards';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

const Flashcards = () => {
  const { 
    listarFlashcards, 
    criarFlashcard, 
    responderFlashcard, 
    deletarFlashcard,
    atualizarFlashcard,
    contarFlashcardsPendentes,
    obterEstatisticas,
    loading 
  } = useFlashcards();
  const { toast } = useToast();

  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [pendentes, setPendentes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [flashcardEdit, setFlashcardEdit] = useState<Flashcard | null>(null);
  const [novoFlashcard, setNovoFlashcard] = useState({ frente: '', verso: '', disciplinaId: '' });
  const [disciplinas, setDisciplinas] = useState<any[]>([]);
  const [filtroOrigem, setFiltroOrigem] = useState('todos');
  const [stats, setStats] = useState({ total: 0, pendentes: 0, dominados: 0, acertos: 0, erros: 0 });

  // Estados para revisão
  const [modoRevisao, setModoRevisao] = useState(false);
  const [flashcardsRevisao, setFlashcardsRevisao] = useState<Flashcard[]>([]);
  const [indexAtual, setIndexAtual] = useState(0);
  const [mostrarVerso, setMostrarVerso] = useState(false);
  const [estatisticasRevisao, setEstatisticasRevisao] = useState({ acertos: 0, erros: 0 });
  const [animacao, setAnimacao] = useState<'none' | 'flip' | 'correct' | 'wrong'>('none');

  useEffect(() => {
    carregarDados();
    carregarDisciplinas();
  }, []);

  const carregarDisciplinas = async () => {
    const { data } = await supabase.from('disciplinas').select('*').order('nome');
    setDisciplinas(data || []);
  };

  const carregarDados = async () => {
    setIsLoading(true);
    try {
      const [todos, count, estatisticas] = await Promise.all([
        listarFlashcards('todos'),
        contarFlashcardsPendentes(),
        obterEstatisticas()
      ]);
      setFlashcards(todos);
      setPendentes(count);
      setStats(estatisticas);
    } catch (error) {
      console.error('Erro ao carregar flashcards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCriar = async () => {
    if (!novoFlashcard.frente.trim() || !novoFlashcard.verso.trim()) {
      toast({
        title: 'Preencha todos os campos',
        description: 'Frente e verso são obrigatórios.',
        variant: 'destructive'
      });
      return;
    }

    const resultado = await criarFlashcard(novoFlashcard.frente, novoFlashcard.verso);
    if (resultado) {
      setDialogOpen(false);
      setNovoFlashcard({ frente: '', verso: '', disciplinaId: '' });
      carregarDados();
    }
  };

  const handleEditar = async () => {
    if (!flashcardEdit) return;
    
    const sucesso = await atualizarFlashcard(flashcardEdit.id, {
      frente: flashcardEdit.frente,
      verso: flashcardEdit.verso
    });
    
    if (sucesso) {
      setEditDialogOpen(false);
      setFlashcardEdit(null);
      carregarDados();
    }
  };

  const handleDeletar = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este flashcard?')) {
      const sucesso = await deletarFlashcard(id);
      if (sucesso) {
        carregarDados();
      }
    }
  };

  const iniciarRevisao = async () => {
    const pendentesList = await listarFlashcards('pendentes');
    if (pendentesList.length === 0) {
      toast({
        title: 'Nenhum flashcard pendente',
        description: 'Volte mais tarde para revisar.'
      });
      return;
    }
    // Shuffle the cards
    const shuffled = [...pendentesList].sort(() => Math.random() - 0.5);
    setFlashcardsRevisao(shuffled);
    setIndexAtual(0);
    setMostrarVerso(false);
    setEstatisticasRevisao({ acertos: 0, erros: 0 });
    setModoRevisao(true);
  };

  const handleFlip = () => {
    setAnimacao('flip');
    setTimeout(() => {
      setMostrarVerso(!mostrarVerso);
      setAnimacao('none');
    }, 150);
  };

  const handleResposta = async (qualidade: number) => {
    const flashcardAtual = flashcardsRevisao[indexAtual];
    
    // Animação de feedback
    setAnimacao(qualidade >= 3 ? 'correct' : 'wrong');
    
    await responderFlashcard(flashcardAtual.id, qualidade);

    const novoAcertos = qualidade >= 3 ? estatisticasRevisao.acertos + 1 : estatisticasRevisao.acertos;
    const novoErros = qualidade < 3 ? estatisticasRevisao.erros + 1 : estatisticasRevisao.erros;
    setEstatisticasRevisao({ acertos: novoAcertos, erros: novoErros });

    setTimeout(() => {
      setAnimacao('none');
      
      if (indexAtual < flashcardsRevisao.length - 1) {
        setIndexAtual(prev => prev + 1);
        setMostrarVerso(false);
      } else {
        setModoRevisao(false);
        const totalRevisados = flashcardsRevisao.length;
        const taxaAcerto = Math.round((novoAcertos / totalRevisados) * 100);
        
        toast({
          title: '🎉 Revisão concluída!',
          description: `${novoAcertos}/${totalRevisados} acertos (${taxaAcerto}%)`
        });
        carregarDados();
      }
    }, 300);
  };

  const getFilteredFlashcards = () => {
    if (filtroOrigem === 'todos') return flashcards;
    return flashcards.filter(f => f.origem === filtroOrigem);
  };

  const getOrigemColor = (origem: string) => {
    switch (origem) {
      case 'erro_simulado': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'ia': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Modo Revisão
  if (modoRevisao && flashcardsRevisao.length > 0) {
    const flashcardAtual = flashcardsRevisao[indexAtual];
    const progress = ((indexAtual + 1) / flashcardsRevisao.length) * 100;
    
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navigation />
        
        <div className="container mx-auto px-4 py-8 pt-24 max-w-2xl">
          {/* Header Revisão */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={() => setModoRevisao(false)} className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Sair
            </Button>
            <div className="flex gap-3">
              <Badge variant="outline" className="bg-success/10 text-success border-success/30 gap-1">
                <CheckCircle className="h-3 w-3" />
                {estatisticasRevisao.acertos}
              </Badge>
              <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 gap-1">
                <XCircle className="h-3 w-3" />
                {estatisticasRevisao.erros}
              </Badge>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Progresso</span>
              <span>{indexAtual + 1} de {flashcardsRevisao.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Card do Flashcard */}
          <div 
            className={cn(
              "perspective-1000",
              animacao === 'correct' && "animate-pulse",
              animacao === 'wrong' && "animate-shake"
            )}
          >
            <Card 
              className={cn(
                "p-8 min-h-[350px] flex flex-col items-center justify-center cursor-pointer transition-all duration-300",
                "hover:shadow-xl",
                animacao === 'flip' && "scale-95 opacity-80",
                animacao === 'correct' && "ring-4 ring-success/50",
                animacao === 'wrong' && "ring-4 ring-destructive/50"
              )}
              onClick={handleFlip}
            >
              <div className="text-center w-full">
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "mb-6",
                    !mostrarVerso ? "bg-primary/10 text-primary" : "bg-success/10 text-success"
                  )}
                >
                  {!mostrarVerso ? 'Pergunta' : 'Resposta'}
                </Badge>
                
                <p className="text-xl font-medium leading-relaxed">
                  {!mostrarVerso ? flashcardAtual.frente : flashcardAtual.verso}
                </p>
                
                {!mostrarVerso && (
                  <p className="text-sm text-muted-foreground mt-8 flex items-center justify-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Clique para ver a resposta
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Botões de Qualidade */}
          {mostrarVerso && (
            <div className="mt-8 space-y-4 animate-fade-in">
              <p className="text-center text-sm text-muted-foreground">
                Como foi sua resposta?
              </p>
              <div className="grid grid-cols-4 gap-3">
                <Button 
                  variant="outline" 
                  className="h-16 flex-col gap-1 border-destructive/50 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                  onClick={() => handleResposta(0)}
                >
                  <XCircle className="h-5 w-5" />
                  <span className="text-xs">Esqueci</span>
                </Button>
                <Button 
                  variant="outline"
                  className="h-16 flex-col gap-1 border-warning/50 hover:bg-warning hover:text-warning-foreground hover:border-warning"
                  onClick={() => handleResposta(2)}
                >
                  <Brain className="h-5 w-5" />
                  <span className="text-xs">Difícil</span>
                </Button>
                <Button 
                  variant="outline"
                  className="h-16 flex-col gap-1 border-primary/50 hover:bg-primary hover:text-primary-foreground hover:border-primary"
                  onClick={() => handleResposta(4)}
                >
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-xs">Bom</span>
                </Button>
                <Button 
                  variant="outline"
                  className="h-16 flex-col gap-1 border-success/50 hover:bg-success hover:text-success-foreground hover:border-success"
                  onClick={() => handleResposta(5)}
                >
                  <Flame className="h-5 w-5" />
                  <span className="text-xs">Fácil</span>
                </Button>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="mt-8 p-4 bg-muted/50 rounded-xl">
            <p className="text-xs text-muted-foreground text-center">
              💡 <strong>Dica SM-2:</strong> Flashcards difíceis aparecerão mais vezes. 
              Marque como "Fácil" apenas se lembrou instantaneamente.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <div className="p-2 rounded-xl gradient-primary">
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </div>
              Flashcards
            </h1>
            <p className="text-muted-foreground">
              Memorize com repetição espaçada (SM-2)
            </p>
          </div>
          
          <div className="flex gap-3">
            {pendentes > 0 && (
              <Button onClick={iniciarRevisao} size="lg" className="gap-2 shadow-lg">
                <Play className="h-5 w-5" />
                Revisar ({pendentes})
              </Button>
            )}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Flashcard</DialogTitle>
                  <DialogDescription>
                    Crie um novo flashcard para memorização
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Frente (Pergunta)</label>
                    <Textarea
                      value={novoFlashcard.frente}
                      onChange={(e) => setNovoFlashcard(prev => ({ ...prev, frente: e.target.value }))}
                      placeholder="Ex: O que é o princípio da legalidade?"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Verso (Resposta)</label>
                    <Textarea
                      value={novoFlashcard.verso}
                      onChange={(e) => setNovoFlashcard(prev => ({ ...prev, verso: e.target.value }))}
                      placeholder="Ex: Ninguém será obrigado a fazer ou deixar de fazer..."
                      rows={3}
                    />
                  </div>
                  <Button onClick={handleCriar} className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      'Criar Flashcard'
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          <Card className="p-4 text-center bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-2">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-primary">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </Card>
          
          <Card className="p-4 text-center bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
            <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center mx-auto mb-2">
              <Calendar className="h-5 w-5 text-warning" />
            </div>
            <p className="text-2xl font-bold text-warning">{pendentes}</p>
            <p className="text-xs text-muted-foreground">Para Hoje</p>
          </Card>
          
          <Card className="p-4 text-center bg-gradient-to-br from-success/10 to-success/5 border-success/20">
            <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center mx-auto mb-2">
              <Award className="h-5 w-5 text-success" />
            </div>
            <p className="text-2xl font-bold text-success">{stats.dominados}</p>
            <p className="text-xs text-muted-foreground">Dominados</p>
          </Card>
          
          <Card className="p-4 text-center bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="h-5 w-5 text-accent" />
            </div>
            <p className="text-2xl font-bold text-accent">{stats.acertos}</p>
            <p className="text-xs text-muted-foreground">Acertos</p>
          </Card>
          
          <Card className="p-4 text-center bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
            <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center mx-auto mb-2">
              <XCircle className="h-5 w-5 text-destructive" />
            </div>
            <p className="text-2xl font-bold text-destructive">{stats.erros}</p>
            <p className="text-xs text-muted-foreground">Erros</p>
          </Card>
        </div>

        {/* Taxa de retenção */}
        {stats.total > 0 && (
          <Card className="p-4 mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Taxa de Retenção</span>
              <span className="text-sm text-muted-foreground">
                {stats.acertos + stats.erros > 0 
                  ? Math.round((stats.acertos / (stats.acertos + stats.erros)) * 100) 
                  : 0}%
              </span>
            </div>
            <Progress 
              value={stats.acertos + stats.erros > 0 
                ? (stats.acertos / (stats.acertos + stats.erros)) * 100 
                : 0} 
              className="h-2"
            />
          </Card>
        )}

        {/* Filtros e Lista */}
        <Tabs defaultValue="todos">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <TabsList>
              <TabsTrigger value="todos">Todos ({flashcards.length})</TabsTrigger>
              <TabsTrigger value="pendentes">Pendentes ({pendentes})</TabsTrigger>
              <TabsTrigger value="dominados">Dominados ({stats.dominados})</TabsTrigger>
            </TabsList>
            
            <Select value={filtroOrigem} onValueChange={setFiltroOrigem}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Origem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas origens</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="erro_simulado">Erros</SelectItem>
                <SelectItem value="ia">IA</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="todos">
            {getFilteredFlashcards().length === 0 ? (
              <Card className="p-12 text-center">
                <div className="w-20 h-20 rounded-2xl gradient-primary mx-auto mb-6 flex items-center justify-center">
                  <Sparkles className="h-10 w-10 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Nenhum flashcard</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Crie flashcards para memorizar conceitos importantes usando repetição espaçada.
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Flashcard
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {getFilteredFlashcards().map((flashcard) => (
                  <Card key={flashcard.id} className="group overflow-hidden hover:shadow-lg transition-all">
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <Badge className={cn("text-xs border", getOrigemColor(flashcard.origem))}>
                          {flashcard.origem === 'erro_simulado' ? 'Erro' : 
                           flashcard.origem === 'ia' ? 'IA' : 'Manual'}
                        </Badge>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setFlashcardEdit(flashcard);
                              setEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDeletar(flashcard.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="font-medium mb-2 line-clamp-2">{flashcard.frente}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{flashcard.verso}</p>
                    </div>
                    
                    <div className="px-4 py-3 bg-muted/30 border-t flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(flashcard.proxima_revisao).toLocaleDateString('pt-BR')}
                      </span>
                      <Badge 
                        variant={flashcard.acertos_consecutivos >= 3 ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {flashcard.acertos_consecutivos >= 3 ? (
                          <>
                            <Award className="h-3 w-3 mr-1" />
                            Dominado
                          </>
                        ) : (
                          `${flashcard.acertos_consecutivos} acertos`
                        )}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pendentes">
            {pendentes === 0 ? (
              <Card className="p-12 text-center">
                <div className="w-20 h-20 rounded-2xl bg-success/10 mx-auto mb-6 flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-success" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Tudo em dia!</h3>
                <p className="text-muted-foreground">
                  Nenhum flashcard pendente para revisar hoje. Continue assim! 🎉
                </p>
              </Card>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-2xl gradient-primary mx-auto mb-6 flex items-center justify-center">
                  <Brain className="h-10 w-10 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {pendentes} flashcard{pendentes > 1 ? 's' : ''} para revisar
                </h3>
                <p className="text-muted-foreground mb-6">
                  Revise agora para manter sua memória afiada!
                </p>
                <Button size="lg" onClick={iniciarRevisao} className="gap-2">
                  <Play className="h-5 w-5" />
                  Iniciar Revisão
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="dominados">
            {stats.dominados === 0 ? (
              <Card className="p-12 text-center">
                <div className="w-20 h-20 rounded-2xl bg-muted mx-auto mb-6 flex items-center justify-center">
                  <Target className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Nenhum flashcard dominado ainda</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Continue revisando! Um flashcard é considerado "dominado" após 3+ acertos consecutivos.
                </p>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {flashcards.filter(f => f.acertos_consecutivos >= 3).map((flashcard) => (
                  <Card key={flashcard.id} className="p-4 border-success/30 bg-success/5">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-success/20 text-success border-success/30 gap-1">
                        <Award className="h-3 w-3" />
                        Dominado
                      </Badge>
                    </div>
                    <p className="font-medium mb-2 line-clamp-2">{flashcard.frente}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{flashcard.verso}</p>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Flashcard</DialogTitle>
          </DialogHeader>
          {flashcardEdit && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Frente (Pergunta)</label>
                <Textarea
                  value={flashcardEdit.frente}
                  onChange={(e) => setFlashcardEdit({ ...flashcardEdit, frente: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Verso (Resposta)</label>
                <Textarea
                  value={flashcardEdit.verso}
                  onChange={(e) => setFlashcardEdit({ ...flashcardEdit, verso: e.target.value })}
                  rows={3}
                />
              </div>
              <Button onClick={handleEditar} className="w-full">
                Salvar Alterações
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <AIHelpButton variant="fab" context="Me ajude a criar flashcards para concursos" />
    </div>
  );
};

export default Flashcards;