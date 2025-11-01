import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { 
  Trophy, 
  Clock, 
  Target, 
  PlayCircle,
  Plus
} from "lucide-react";
import { useSimulados } from "@/hooks/useSimulados";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

const Simulados = () => {
  const navigate = useNavigate();
  const { listarSimulados, criarSimulado, iniciarSimulado, loading } = useSimulados();
  const [simulados, setSimulados] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [quantidade, setQuantidade] = useState(30);
  const [bancaSelecionada, setBancaSelecionada] = useState<string>("");
  const [bancas, setBancas] = useState<any[]>([]);
  const [disciplinasSelecionadas, setDisciplinasSelecionadas] = useState<string[]>([]);
  const [disciplinas, setDisciplinas] = useState<any[]>([]);

  useEffect(() => {
    carregarSimulados();
    carregarBancas();
    carregarDisciplinas();
  }, []);

  const carregarBancas = async () => {
    const { data } = await supabase
      .from('bancas')
      .select('*')
      .eq('ativo', true)
      .order('nome');
    setBancas(data || []);
  };

  const carregarDisciplinas = async () => {
    const { data } = await supabase
      .from('disciplinas')
      .select('*')
      .order('nome');
    setDisciplinas(data || []);
  };

  const carregarSimulados = async () => {
    const data = await listarSimulados();
    setSimulados(data);
  };

  const handleCriar = async () => {
    if (!titulo.trim()) return;
    
    const simulado = await criarSimulado(
      titulo, 
      quantidade, 
      bancaSelecionada || undefined,
      disciplinasSelecionadas.length > 0 ? disciplinasSelecionadas : undefined
    );
    if (simulado) {
      setDialogOpen(false);
      setTitulo("");
      setQuantidade(30);
      setBancaSelecionada("");
      setDisciplinasSelecionadas([]);
      carregarSimulados();
    }
  };

  const handleIniciar = async (simuladoId: string) => {
    const sucesso = await iniciarSimulado(simuladoId);
    if (sucesso) {
      navigate(`/simulados/${simuladoId}/executar`);
    }
  };

  const handleVerResultado = (simuladoId: string) => {
    navigate(`/simulados/${simuladoId}/resultado`);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="mb-2">Simulados</h1>
            <p className="text-muted-foreground text-lg">
              Pratique com provas simuladas e avalie seu desempenho
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Criar Simulado
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Simulado</DialogTitle>
                <DialogDescription>
                  Configure seu simulado escolhendo o título, quantidade de questões e banca
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="titulo">Título do Simulado</Label>
                  <Input
                    id="titulo"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ex: Simulado Geral CESPE 2024"
                  />
                </div>
                <div>
                  <Label htmlFor="quantidade">Quantidade de Questões</Label>
                  <Input
                    id="quantidade"
                    type="number"
                    min="5"
                    max="120"
                    value={quantidade}
                    onChange={(e) => setQuantidade(parseInt(e.target.value) || 30)}
                  />
                </div>
                <div>
                  <Label htmlFor="banca">Banca (Opcional)</Label>
                  <Select value={bancaSelecionada} onValueChange={setBancaSelecionada}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as bancas" />
                    </SelectTrigger>
                    <SelectContent>
                      {bancas.map((banca) => (
                        <SelectItem key={banca.id} value={banca.id}>
                          {banca.sigla} - {banca.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Disciplinas (Opcional)</Label>
                  <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                    {disciplinas.map((disc) => (
                      <div key={disc.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={disc.id}
                          checked={disciplinasSelecionadas.includes(disc.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setDisciplinasSelecionadas([...disciplinasSelecionadas, disc.id]);
                            } else {
                              setDisciplinasSelecionadas(disciplinasSelecionadas.filter(id => id !== disc.id));
                            }
                          }}
                          className="rounded"
                        />
                        <Label htmlFor={disc.id} className="cursor-pointer font-normal">
                          {disc.nome}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <Button 
                  onClick={handleCriar} 
                  disabled={loading || !titulo.trim()}
                  className="w-full"
                >
                  {loading ? 'Criando...' : 'Criar Simulado'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de Simulados */}
        <div className="grid gap-6 mb-8">
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
              <Card key={simulado.id} className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Trophy className="h-6 w-6 text-primary" />
                      <h3 className="text-xl font-semibold">{simulado.titulo}</h3>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        {simulado.total_questoes} questões
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {simulado.tempo_limite_minutos || 180} min
                      </span>
                      {simulado.status === 'concluido' && (
                        <span className="text-success font-semibold">
                          {simulado.nota_final?.toFixed(0)}% de acerto
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        simulado.status === 'nao_iniciado' ? 'bg-primary/10 text-primary' :
                        simulado.status === 'em_andamento' ? 'bg-warning/10 text-warning' :
                        'bg-success/10 text-success'
                      }`}>
                        {simulado.status === 'nao_iniciado' ? 'Não iniciado' :
                         simulado.status === 'em_andamento' ? 'Em andamento' :
                         'Concluído'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {simulado.status === 'nao_iniciado' && (
                      <Button 
                        className="gap-2"
                        onClick={() => handleIniciar(simulado.id)}
                        disabled={loading}
                      >
                        <PlayCircle className="h-4 w-4" />
                        Iniciar Simulado
                      </Button>
                    )}
                    {simulado.status === 'em_andamento' && (
                      <Button 
                        variant="outline"
                        onClick={() => navigate(`/simulados/${simulado.id}/executar`)}
                      >
                        Continuar
                      </Button>
                    )}
                    {simulado.status === 'concluido' && (
                      <Button 
                        variant="outline"
                        onClick={() => handleVerResultado(simulado.id)}
                      >
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
    </div>
  );
};

export default Simulados;
