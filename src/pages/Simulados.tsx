import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { AIHelpButton } from "@/components/ai";
import { 
  Trophy, 
  Clock, 
  Target, 
  PlayCircle,
  Plus,
  Trash2,
  Eye,
  Filter,
  BarChart3,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { useSimulados } from "@/hooks/useSimulados";
import { useNavigate } from "react-router-dom";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
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

interface Banca {
  id: string;
  nome: string;
  sigla: string;
  totalQuestoes: number;
}

interface Disciplina {
  id: string;
  nome: string;
  totalQuestoes: number;
}

const Simulados = () => {
  const navigate = useNavigate();
  const { 
    listarSimulados, 
    criarSimulado, 
    iniciarSimulado, 
    excluirSimulado,
    listarBancasComQuestoes,
    listarDisciplinasComQuestoes,
    contarQuestoesDisponiveis,
    buscarEstatisticas,
    loading 
  } = useSimulados();
  
  const [simulados, setSimulados] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [simuladoParaExcluir, setSimuladoParaExcluir] = useState<string | null>(null);
  
  // Form state
  const [titulo, setTitulo] = useState("");
  const [quantidade, setQuantidade] = useState(30);
  const [bancaSelecionada, setBancaSelecionada] = useState<string>("");
  const [disciplinasSelecionadas, setDisciplinasSelecionadas] = useState<string[]>([]);
  const [dificuldade, setDificuldade] = useState<string>("");
  const [tempoPersonalizado, setTempoPersonalizado] = useState(90);
  
  // Data state
  const [bancas, setBancas] = useState<Banca[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [questoesDisponiveis, setQuestoesDisponiveis] = useState(0);
  const [estatisticas, setEstatisticas] = useState<any>(null);
  const [carregandoDados, setCarregandoDados] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    atualizarQuestoesDisponiveis();
  }, [bancaSelecionada, disciplinasSelecionadas, dificuldade]);

  const carregarDados = async () => {
    setCarregandoDados(true);
    try {
      const [simuladosData, bancasData, disciplinasData, stats] = await Promise.all([
        listarSimulados(),
        listarBancasComQuestoes(),
        listarDisciplinasComQuestoes(),
        buscarEstatisticas()
      ]);
      
      setSimulados(simuladosData);
      setBancas(bancasData);
      setDisciplinas(disciplinasData);
      setEstatisticas(stats);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setCarregandoDados(false);
    }
  };

  const atualizarQuestoesDisponiveis = async () => {
    const count = await contarQuestoesDisponiveis({
      bancaId: bancaSelecionada || undefined,
      disciplinasIds: disciplinasSelecionadas.length > 0 ? disciplinasSelecionadas : undefined,
      dificuldade: dificuldade as any || undefined
    });
    setQuestoesDisponiveis(count);
  };

  const handleCriar = async () => {
    if (!titulo.trim()) return;
    
    const simulado = await criarSimulado(
      titulo, 
      quantidade, 
      bancaSelecionada || undefined,
      disciplinasSelecionadas.length > 0 ? disciplinasSelecionadas : undefined,
      dificuldade as any || undefined,
      tempoPersonalizado
    );
    
    if (simulado) {
      setDialogOpen(false);
      resetForm();
      carregarDados();
    }
  };

  const resetForm = () => {
    setTitulo("");
    setQuantidade(30);
    setBancaSelecionada("");
    setDisciplinasSelecionadas([]);
    setDificuldade("");
    setTempoPersonalizado(90);
  };

  const handleIniciar = async (simuladoId: string) => {
    const sucesso = await iniciarSimulado(simuladoId);
    if (sucesso) {
      navigate(`/simulados/${simuladoId}/executar`);
    }
  };

  const handleExcluir = async () => {
    if (simuladoParaExcluir) {
      const sucesso = await excluirSimulado(simuladoParaExcluir);
      if (sucesso) {
        carregarDados();
      }
      setSimuladoParaExcluir(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleVerResultado = (simuladoId: string) => {
    navigate(`/simulados/${simuladoId}/resultado`);
  };

  const toggleDisciplina = (discId: string) => {
    setDisciplinasSelecionadas(prev => 
      prev.includes(discId) 
        ? prev.filter(id => id !== discId)
        : [...prev, discId]
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'nao_iniciado':
        return <Badge variant="outline" className="gap-1"><AlertCircle className="h-3 w-3" /> Não iniciado</Badge>;
      case 'em_andamento':
        return <Badge className="gap-1 bg-warning text-warning-foreground"><Clock className="h-3 w-3" /> Em andamento</Badge>;
      case 'concluido':
        return <Badge className="gap-1 bg-success text-success-foreground"><CheckCircle2 className="h-3 w-3" /> Concluído</Badge>;
      default:
        return null;
    }
  };

  if (carregandoDados) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-80px)] pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando simulados...</p>
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Simulados</h1>
            <p className="text-muted-foreground">
              Pratique com provas simuladas e avalie seu desempenho
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" size="lg">
                <Plus className="h-5 w-5" />
                Criar Simulado
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Novo Simulado</DialogTitle>
                <DialogDescription>
                  Configure seu simulado personalizado
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Titulo */}
                <div className="space-y-2">
                  <Label htmlFor="titulo">Titulo do Simulado</Label>
                  <Input
                    id="titulo"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ex: Simulado CESPE - Direito Constitucional"
                  />
                </div>

                {/* Banca */}
                <div className="space-y-2">
                  <Label>Banca Examinadora</Label>
                  <Select value={bancaSelecionada || "all"} onValueChange={(val) => setBancaSelecionada(val === "all" ? "" : val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as bancas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as bancas</SelectItem>
                      {bancas.map((banca) => (
                        <SelectItem key={banca.id} value={banca.id}>
                          {banca.sigla} - {banca.nome} ({banca.totalQuestoes} questoes)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Disciplinas */}
                <div className="space-y-2">
                  <Label>Disciplinas</Label>
                  <div className="border rounded-lg p-4 max-h-48 overflow-y-auto space-y-2 bg-background">
                    {disciplinas.length === 0 ? (
                      <p className="text-muted-foreground text-sm">Nenhuma disciplina disponivel</p>
                    ) : (
                      disciplinas.map((disc) => (
                        <div key={disc.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={disc.id}
                            checked={disciplinasSelecionadas.includes(disc.id)}
                            onCheckedChange={() => toggleDisciplina(disc.id)}
                          />
                          <label 
                            htmlFor={disc.id} 
                            className="text-sm cursor-pointer flex-1"
                          >
                            {disc.nome}
                            <span className="text-muted-foreground ml-2">
                              ({disc.totalQuestoes} questoes)
                            </span>
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                  {disciplinasSelecionadas.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {disciplinasSelecionadas.length} disciplina(s) selecionada(s)
                    </p>
                  )}
                </div>

                {/* Dificuldade */}
                <div className="space-y-2">
                  <Label>Nivel de Dificuldade</Label>
                  <Select value={dificuldade || "all"} onValueChange={(val) => setDificuldade(val === "all" ? "" : val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os niveis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os niveis</SelectItem>
                      <SelectItem value="facil">Facil</SelectItem>
                      <SelectItem value="medio">Medio</SelectItem>
                      <SelectItem value="dificil">Dificil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Quantidade de Questoes */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Quantidade de Questoes</Label>
                    <span className="text-lg font-semibold text-primary">{quantidade}</span>
                  </div>
                  <Slider
                    value={[quantidade]}
                    onValueChange={(value) => setQuantidade(value[0])}
                    min={5}
                    max={Math.min(120, questoesDisponiveis || 120)}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>5 questoes</span>
                    <span>{Math.min(120, questoesDisponiveis || 120)} questoes</span>
                  </div>
                </div>

                {/* Tempo */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Tempo Limite (minutos)</Label>
                    <span className="text-lg font-semibold text-primary">{tempoPersonalizado} min</span>
                  </div>
                  <Slider
                    value={[tempoPersonalizado]}
                    onValueChange={(value) => setTempoPersonalizado(value[0])}
                    min={30}
                    max={300}
                    step={15}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>30 min</span>
                    <span>5 horas</span>
                  </div>
                </div>

                {/* Questoes Disponiveis */}
                <Card className="p-4 bg-primary/5 border-primary/20">
                  <div className="flex items-center gap-3">
                    <Filter className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold">
                        {questoesDisponiveis} questoes disponiveis
                      </p>
                      <p className="text-sm text-muted-foreground">
                        com os filtros selecionados
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Botao Criar */}
                <Button 
                  onClick={handleCriar} 
                  disabled={loading || !titulo.trim() || questoesDisponiveis === 0}
                  className="w-full"
                  size="lg"
                >
                  {loading ? 'Criando simulado...' : 'Criar Simulado'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Estatisticas Gerais */}
        {estatisticas && estatisticas.totalSimulados > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{estatisticas.totalSimulados}</p>
                  <p className="text-sm text-muted-foreground">Simulados</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <BarChart3 className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{estatisticas.mediaGeral}%</p>
                  <p className="text-sm text-muted-foreground">Media Geral</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{estatisticas.totalAcertos}</p>
                  <p className="text-sm text-muted-foreground">Total Acertos</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Target className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{estatisticas.totalQuestoes}</p>
                  <p className="text-sm text-muted-foreground">Questoes Feitas</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Lista de Simulados */}
        <div className="space-y-4">
          {simulados.length === 0 ? (
            <Card className="p-12 text-center">
              <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum simulado criado</h3>
              <p className="text-muted-foreground mb-6">
                Crie seu primeiro simulado e comece a testar seus conhecimentos!
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Simulado
              </Button>
            </Card>
          ) : (
            simulados.map((simulado) => (
              <Card key={simulado.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <Trophy className="h-6 w-6 text-primary mt-1" />
                      <div>
                        <h3 className="text-xl font-semibold">{simulado.titulo}</h3>
                        {simulado.bancas && (
                          <p className="text-sm text-muted-foreground">
                            {simulado.bancas.sigla} - {simulado.bancas.nome}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        {simulado.total_questoes} questoes
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {simulado.tempo_limite_minutos || 180} min
                      </span>
                      {simulado.status === 'concluido' && (
                        <>
                          <span className="flex items-center gap-1 text-success font-semibold">
                            <CheckCircle2 className="h-4 w-4" />
                            {simulado.acertos} acertos
                          </span>
                          <span className="flex items-center gap-1 text-destructive">
                            <XCircle className="h-4 w-4" />
                            {simulado.total_questoes - simulado.acertos} erros
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(simulado.status)}
                      {simulado.status === 'concluido' && (
                        <span className="text-lg font-bold text-primary">
                          {simulado.nota_final?.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    {simulado.status === 'nao_iniciado' && (
                      <>
                        <Button 
                          className="gap-2"
                          onClick={() => handleIniciar(simulado.id)}
                          disabled={loading}
                        >
                          <PlayCircle className="h-4 w-4" />
                          Iniciar
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => {
                            setSimuladoParaExcluir(simulado.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {simulado.status === 'em_andamento' && (
                      <Button 
                        variant="outline"
                        className="gap-2"
                        onClick={() => navigate(`/simulados/${simulado.id}/executar`)}
                      >
                        <PlayCircle className="h-4 w-4" />
                        Continuar
                      </Button>
                    )}
                    {simulado.status === 'concluido' && (
                      <Button 
                        variant="outline"
                        className="gap-2"
                        onClick={() => handleVerResultado(simulado.id)}
                      >
                        <Eye className="h-4 w-4" />
                        Ver Resultado
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Simulado</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este simulado? Esta acao nao pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleExcluir} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AIHelpButton variant="fab" context="Simulados para concursos publicos" />
    </div>
  );
};

export default Simulados;
