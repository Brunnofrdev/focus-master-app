import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { 
  Brain, 
  Calendar,
  Target,
  TrendingUp,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useRevisao } from "@/hooks/useRevisao";
import { useNavigate } from "react-router-dom";

const Review = () => {
  const navigate = useNavigate();
  const { listarRevisoesPendentes, contarRevisoesPorDia, loading } = useRevisao();
  const [revisoes, setRevisoes] = useState<any[]>([]);
  const [contadores, setContadores] = useState({ hoje: 0, amanha: 0, proximos7dias: 0 });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    const [revisoesData, contadoresData] = await Promise.all([
      listarRevisoesPendentes(),
      contarRevisoesPorDia()
    ]);
    setRevisoes(revisoesData);
    setContadores(contadoresData);
  };

  // Agrupar por disciplina
  const revisoesPorDisciplina = revisoes.reduce((acc: any, rev: any) => {
    const disciplina = rev.questao?.disciplina?.nome || 'Outras';
    if (!acc[disciplina]) {
      acc[disciplina] = [];
    }
    acc[disciplina].push(rev);
    return acc;
  }, {});

  const filaRevisao = Object.entries(revisoesPorDisciplina).map(([disciplina, items]: [string, any]) => {
    const hoje = new Date().toISOString().split('T')[0];
    const qtdHoje = items.filter((i: any) => i.proxima_revisao === hoje).length;
    
    return {
      disciplina,
      questoes: items.length,
      proximaRevisao: qtdHoje > 0 ? "Hoje" : "Próximos dias",
      prioridade: qtdHoje > 0 ? "Alta" : "Média"
    };
  });

  const estatisticas = [
    { label: "Para Revisar Hoje", valor: contadores.hoje.toString(), cor: "warning" },
    { label: "Para Amanhã", valor: contadores.amanha.toString(), cor: "primary" },
    { label: "Próximos 7 Dias", valor: contadores.proximos7dias.toString(), cor: "accent" },
    { label: "Total Pendente", valor: revisoes.length.toString(), cor: "success" }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="mb-8">
          <h1 className="mb-2">Revisão Inteligente</h1>
          <p className="text-muted-foreground text-lg">
            Sistema de revisão espaçada para fixação permanente
          </p>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {estatisticas.map((stat, idx) => (
            <Card key={idx} className="p-6">
              <div className="text-3xl font-bold mb-1">{stat.valor}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Alerta de Revisão */}
        {contadores.hoje > 0 && (
          <Card className="p-6 mb-8 border-l-4 border-l-warning bg-warning/5">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-warning flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold mb-2">
                  Você tem {contadores.hoje} questões para revisar hoje!
                </h3>
                <p className="text-muted-foreground mb-4">
                  A revisão espaçada é mais efetiva quando feita no momento certo. 
                  Não deixe acumular para manter seu desempenho.
                </p>
                <Button 
                  className="gap-2"
                  onClick={() => navigate('/review/praticar')}
                  disabled={loading}
                >
                  <Brain className="h-4 w-4" />
                  Iniciar Revisão Agora
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Fila de Revisão */}
        <div className="mb-8">
          <h2 className="mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Fila de Revisão por Disciplina
          </h2>
          <div className="grid gap-4">
            {filaRevisao.map((item, idx) => {
              const prioridadeColors = {
                Alta: "border-l-error",
                Média: "border-l-warning",
                Baixa: "border-l-success"
              };
              
              return (
                <Card 
                  key={idx} 
                  className={`p-6 border-l-4 ${prioridadeColors[item.prioridade as keyof typeof prioridadeColors]}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{item.disciplina}</h3>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          {item.questoes} questões
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {item.proximaRevisao}
                        </span>
                        <span>Prioridade: {item.prioridade}</span>
                      </div>
                    </div>
                    <Button 
                      variant={item.proximaRevisao === "Hoje" ? "default" : "outline"}
                    >
                      Revisar
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Como Funciona */}
        <Card className="p-6">
          <h2 className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-success" />
            Como Funciona a Revisão Espaçada?
          </h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold">Dia 1 - Primeira Revisão</p>
                <p className="text-muted-foreground">
                  Questões novas ou erradas são revisadas após 1 dia
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold">Dia 3 - Segunda Revisão</p>
                <p className="text-muted-foreground">
                  Se você acertar, a questão retorna em 3 dias
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold">Dia 7 - Terceira Revisão</p>
                <p className="text-muted-foreground">
                  Mais um acerto? A questão volta em 7 dias
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold">Dia 21+ - Fixação Permanente</p>
                <p className="text-muted-foreground">
                  Com acertos consecutivos, os intervalos aumentam progressivamente
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Review;
