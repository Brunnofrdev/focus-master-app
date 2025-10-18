import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { 
  Trophy, 
  Clock, 
  Target, 
  PlayCircle,
  Filter,
  Plus
} from "lucide-react";

const Simulados = () => {
  const mockSimulados = [
    {
      id: 1,
      title: "Simulado Geral - CESPE 2024",
      questoes: 120,
      tempo: "180 min",
      disciplinas: ["Português", "Raciocínio Lógico", "Dir. Constitucional"],
      dificuldade: "Médio",
      status: "Disponível"
    },
    {
      id: 2,
      title: "Português - Nível Avançado",
      questoes: 50,
      tempo: "90 min",
      disciplinas: ["Português"],
      dificuldade: "Difícil",
      status: "Disponível"
    },
    {
      id: 3,
      title: "Direito Administrativo",
      questoes: 40,
      tempo: "60 min",
      disciplinas: ["Dir. Administrativo"],
      dificuldade: "Médio",
      status: "Realizado"
    }
  ];

  const historico = [
    { data: "15/10/2025", nome: "Simulado Geral", acertos: 85, total: 120 },
    { data: "10/10/2025", nome: "Português Avançado", acertos: 42, total: 50 },
    { data: "05/10/2025", nome: "Raciocínio Lógico", acertos: 28, total: 30 }
  ];

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
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Criar Simulado
          </Button>
        </div>

        {/* Filtros */}
        <Card className="p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Disciplina
            </Button>
            <Button variant="outline" size="sm">Dificuldade</Button>
            <Button variant="outline" size="sm">Banca</Button>
            <Button variant="outline" size="sm">Tempo</Button>
          </div>
        </Card>

        {/* Lista de Simulados */}
        <div className="grid gap-6 mb-8">
          {mockSimulados.map((simulado) => (
            <Card key={simulado.id} className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Trophy className="h-6 w-6 text-primary" />
                    <h3 className="text-xl font-semibold">{simulado.title}</h3>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      {simulado.questoes} questões
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {simulado.tempo}
                    </span>
                    <span>Dificuldade: {simulado.dificuldade}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {simulado.disciplinas.map((disc, idx) => (
                      <span 
                        key={idx}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                      >
                        {disc}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {simulado.status === "Disponível" ? (
                    <Button className="gap-2">
                      <PlayCircle className="h-4 w-4" />
                      Iniciar Simulado
                    </Button>
                  ) : (
                    <Button variant="outline">Ver Resultado</Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Histórico */}
        <div>
          <h2 className="mb-4">Histórico de Simulados</h2>
          <Card className="p-6">
            <div className="space-y-4">
              {historico.map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-smooth"
                >
                  <div>
                    <p className="font-semibold">{item.nome}</p>
                    <p className="text-sm text-muted-foreground">{item.data}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {Math.round((item.acertos / item.total) * 100)}%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.acertos}/{item.total} acertos
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Simulados;
