import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Navigation } from '@/components/Navigation';
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
  ChevronRight
} from 'lucide-react';
import { useFlashcards, Flashcard } from '@/hooks/useFlashcards';
import { useToast } from '@/hooks/use-toast';

const Flashcards = () => {
  const { 
    listarFlashcards, 
    criarFlashcard, 
    responderFlashcard, 
    deletarFlashcard,
    contarFlashcardsPendentes,
    loading 
  } = useFlashcards();
  const { toast } = useToast();

  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [pendentes, setPendentes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [novoFlashcard, setNovoFlashcard] = useState({ frente: '', verso: '' });

  // Estados para revisão
  const [modoRevisao, setModoRevisao] = useState(false);
  const [flashcardsRevisao, setFlashcardsRevisao] = useState<Flashcard[]>([]);
  const [indexAtual, setIndexAtual] = useState(0);
  const [mostrarVerso, setMostrarVerso] = useState(false);
  const [estatisticasRevisao, setEstatisticasRevisao] = useState({ acertos: 0, erros: 0 });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setIsLoading(true);
    try {
      const [todos, count] = await Promise.all([
        listarFlashcards('todos'),
        contarFlashcardsPendentes()
      ]);
      setFlashcards(todos);
      setPendentes(count);
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
      setNovoFlashcard({ frente: '', verso: '' });
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
    setFlashcardsRevisao(pendentesList);
    setIndexAtual(0);
    setMostrarVerso(false);
    setEstatisticasRevisao({ acertos: 0, erros: 0 });
    setModoRevisao(true);
  };

  const handleResposta = async (qualidade: number) => {
    const flashcardAtual = flashcardsRevisao[indexAtual];
    await responderFlashcard(flashcardAtual.id, qualidade);

    if (qualidade >= 3) {
      setEstatisticasRevisao(prev => ({ ...prev, acertos: prev.acertos + 1 }));
    } else {
      setEstatisticasRevisao(prev => ({ ...prev, erros: prev.erros + 1 }));
    }

    if (indexAtual < flashcardsRevisao.length - 1) {
      setIndexAtual(prev => prev + 1);
      setMostrarVerso(false);
    } else {
      setModoRevisao(false);
      toast({
        title: 'Revisão concluída!',
        description: `${estatisticasRevisao.acertos + (qualidade >= 3 ? 1 : 0)} acertos de ${flashcardsRevisao.length} flashcards.`
      });
      carregarDados();
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
    
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navigation />
        
        <div className="container mx-auto px-4 py-8 pt-24 max-w-2xl">
          {/* Header Revisão */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" onClick={() => setModoRevisao(false)}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Sair
            </Button>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Flashcard</p>
              <p className="font-semibold">{indexAtual + 1} / {flashcardsRevisao.length}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="default" className="bg-success">
                <CheckCircle className="h-3 w-3 mr-1" />
                {estatisticasRevisao.acertos}
              </Badge>
              <Badge variant="destructive">
                <XCircle className="h-3 w-3 mr-1" />
                {estatisticasRevisao.erros}
              </Badge>
            </div>
          </div>

          {/* Card do Flashcard */}
          <Card 
            className="p-8 min-h-[300px] flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-lg"
            onClick={() => setMostrarVerso(!mostrarVerso)}
          >
            {!mostrarVerso ? (
              <div className="text-center">
                <Badge variant="secondary" className="mb-4">Frente</Badge>
                <p className="text-xl font-medium">{flashcardAtual.frente}</p>
                <p className="text-sm text-muted-foreground mt-6">
                  Clique para ver a resposta
                </p>
              </div>
            ) : (
              <div className="text-center">
                <Badge variant="default" className="mb-4">Verso</Badge>
                <p className="text-xl">{flashcardAtual.verso}</p>
              </div>
            )}
          </Card>

          {/* Botões de Qualidade */}
          {mostrarVerso && (
            <div className="mt-6 space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                Como foi sua resposta?
              </p>
              <div className="grid grid-cols-4 gap-2">
                <Button 
                  variant="outline" 
                  className="border-destructive text-destructive hover:bg-destructive hover:text-white"
                  onClick={() => handleResposta(0)}
                >
                  Esqueci
                </Button>
                <Button 
                  variant="outline"
                  className="border-warning text-warning hover:bg-warning hover:text-white"
                  onClick={() => handleResposta(2)}
                >
                  Difícil
                </Button>
                <Button 
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-white"
                  onClick={() => handleResposta(4)}
                >
                  Bom
                </Button>
                <Button 
                  variant="outline"
                  className="border-success text-success hover:bg-success hover:text-white"
                  onClick={() => handleResposta(5)}
                >
                  Fácil
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-primary" />
              Flashcards
            </h1>
            <p className="text-muted-foreground text-lg">
              Memorize com repetição espaçada
            </p>
          </div>
          
          <div className="flex gap-3">
            {pendentes > 0 && (
              <Button onClick={iniciarRevisao} className="gap-2">
                <Play className="h-4 w-4" />
                Revisar ({pendentes})
              </Button>
            )}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Flashcard
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Flashcard</DialogTitle>
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
                    {loading ? 'Criando...' : 'Criar Flashcard'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">{flashcards.length}</p>
            <p className="text-sm text-muted-foreground">Total de flashcards</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-3xl font-bold text-warning">{pendentes}</p>
            <p className="text-sm text-muted-foreground">Para revisar hoje</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-3xl font-bold text-success">
              {flashcards.filter(f => f.acertos_consecutivos >= 3).length}
            </p>
            <p className="text-sm text-muted-foreground">Dominados</p>
          </Card>
        </div>

        {/* Lista de Flashcards */}
        <Tabs defaultValue="todos">
          <TabsList>
            <TabsTrigger value="todos">Todos ({flashcards.length})</TabsTrigger>
            <TabsTrigger value="pendentes">Pendentes ({pendentes})</TabsTrigger>
          </TabsList>

          <TabsContent value="todos" className="mt-6">
            {flashcards.length === 0 ? (
              <Card className="p-12 text-center">
                <Sparkles className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhum flashcard</h3>
                <p className="text-muted-foreground mb-6">
                  Crie seus primeiros flashcards para começar a memorizar!
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Flashcard
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {flashcards.map((flashcard) => (
                  <Card key={flashcard.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {flashcard.origem === 'erro_simulado' ? 'Erro' : 
                         flashcard.origem === 'ia' ? 'IA' : 'Manual'}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeletar(flashcard.id)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                    <p className="font-medium mb-2 line-clamp-2">{flashcard.frente}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{flashcard.verso}</p>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <span className="text-xs text-muted-foreground">
                        Próxima: {new Date(flashcard.proxima_revisao).toLocaleDateString('pt-BR')}
                      </span>
                      <Badge 
                        variant={flashcard.acertos_consecutivos >= 3 ? 'default' : 'secondary'}
                      >
                        {flashcard.acertos_consecutivos} acertos
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pendentes" className="mt-6">
            {pendentes === 0 ? (
              <Card className="p-12 text-center">
                <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Tudo em dia!</h3>
                <p className="text-muted-foreground">
                  Nenhum flashcard pendente para revisar hoje.
                </p>
              </Card>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Você tem {pendentes} flashcard(s) para revisar
                </p>
                <Button size="lg" onClick={iniciarRevisao}>
                  <Play className="h-5 w-5 mr-2" />
                  Iniciar Revisão
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Flashcards;
