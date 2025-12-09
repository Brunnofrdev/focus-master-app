import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navigation } from "@/components/Navigation";
import { 
  Brain, 
  Play,
  BarChart3,
  Calendar as CalendarIcon,
  Loader2
} from "lucide-react";
import { useRevisao } from "@/hooks/useRevisao";
import { useNavigate } from "react-router-dom";
import { ReviewStats, ReviewProgress } from "@/components/review/ReviewStats";
import { ReviewCalendar } from "@/components/review/ReviewCalendar";
import { ReviewQueue } from "@/components/review/ReviewQueue";
import { ReviewMethodInfo } from "@/components/review/ReviewMethodInfo";
import { supabase } from "@/integrations/supabase/client";
import { AIHelpButton } from "@/components/ai";

const Review = () => {
  const navigate = useNavigate();
  const { listarRevisoesPendentes, contarRevisoesPorDia, loading } = useRevisao();
  const [revisoes, setRevisoes] = useState<any[]>([]);
  const [contadores, setContadores] = useState({ hoje: 0, amanha: 0, proximos7dias: 0 });
  const [estatisticasGerais, setEstatisticasGerais] = useState({
    streak: 0,
    totalRevisadas: 0,
    taxaAcerto: 0
  });
  const [calendarData, setCalendarData] = useState<{ date: string; count: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setIsLoading(true);
    try {
      const [revisoesData, contadoresData] = await Promise.all([
        listarRevisoesPendentes(),
        contarRevisoesPorDia()
      ]);
      
      setRevisoes(revisoesData);
      setContadores(contadoresData);
      
      // Carregar estatísticas gerais
      await carregarEstatisticasGerais();
      
      // Carregar dados do calendário
      await carregarCalendario();
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const carregarEstatisticasGerais = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar revisões dos últimos 30 dias para calcular estatísticas
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: revisoesRecentes } = await supabase
        .from('revisoes')
        .select('ultima_resposta, updated_at')
        .eq('user_id', user.id)
        .gte('updated_at', thirtyDaysAgo.toISOString());

      if (revisoesRecentes && revisoesRecentes.length > 0) {
        const acertos = revisoesRecentes.filter(r => r.ultima_resposta === true).length;
        const taxaAcerto = (acertos / revisoesRecentes.length) * 100;
        
        setEstatisticasGerais(prev => ({
          ...prev,
          totalRevisadas: revisoesRecentes.length,
          taxaAcerto
        }));
      }

      // Calcular streak (dias consecutivos com revisões)
      const { data: sessoesPorDia } = await supabase
        .from('revisoes')
        .select('updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (sessoesPorDia && sessoesPorDia.length > 0) {
        let streak = 0;
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        const diasUnicos = [...new Set(
          sessoesPorDia.map(s => new Date(s.updated_at).toISOString().split('T')[0])
        )];
        
        for (let i = 0; i < diasUnicos.length && i < 30; i++) {
          const dataRevisao = new Date(diasUnicos[i]);
          dataRevisao.setHours(0, 0, 0, 0);
          
          const diffDias = Math.floor((hoje.getTime() - dataRevisao.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDias === streak) {
            streak++;
          } else {
            break;
          }
        }
        
        setEstatisticasGerais(prev => ({ ...prev, streak }));
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas gerais:', error);
    }
  };

  const carregarCalendario = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar revisões dos próximos 60 dias
      const hoje = new Date().toISOString().split('T')[0];
      const futuro = new Date();
      futuro.setDate(futuro.getDate() + 60);

      const { data } = await supabase
        .from('revisoes')
        .select('proxima_revisao')
        .eq('user_id', user.id)
        .gte('proxima_revisao', hoje)
        .lte('proxima_revisao', futuro.toISOString().split('T')[0]);

      if (data) {
        const countByDate: Record<string, number> = {};
        data.forEach(r => {
          countByDate[r.proxima_revisao] = (countByDate[r.proxima_revisao] || 0) + 1;
        });
        
        setCalendarData(
          Object.entries(countByDate).map(([date, count]) => ({ date, count }))
        );
      }
    } catch (error) {
      console.error('Erro ao carregar calendário:', error);
    }
  };

  // Agrupar por disciplina com mais informações
  const revisoesPorDisciplina = revisoes.reduce((acc: any, rev: any) => {
    const disciplina = rev.questao?.disciplina?.nome || 'Outras';
    if (!acc[disciplina]) {
      acc[disciplina] = {
        disciplina,
        questoes: 0,
        hojeCount: 0,
        atrasadas: 0,
        facilidadeTotal: 0,
        ultimaRevisao: null
      };
    }
    
    const hoje = new Date().toISOString().split('T')[0];
    acc[disciplina].questoes++;
    acc[disciplina].facilidadeTotal += rev.facilidade || 2.5;
    
    if (rev.proxima_revisao === hoje) {
      acc[disciplina].hojeCount++;
    } else if (rev.proxima_revisao < hoje) {
      acc[disciplina].atrasadas++;
    }
    
    if (!acc[disciplina].ultimaRevisao || rev.updated_at > acc[disciplina].ultimaRevisao) {
      acc[disciplina].ultimaRevisao = rev.updated_at;
    }
    
    return acc;
  }, {});

  const disciplinasOrdenadas = Object.values(revisoesPorDisciplina)
    .map((d: any) => ({
      ...d,
      facilidadeMedia: d.facilidadeTotal / d.questoes
    }))
    .sort((a: any, b: any) => {
      // Prioridade: atrasadas > hoje > outras
      if (a.atrasadas !== b.atrasadas) return b.atrasadas - a.atrasadas;
      if (a.hojeCount !== b.hojeCount) return b.hojeCount - a.hojeCount;
      return b.questoes - a.questoes;
    });

  const handleRevisar = (disciplina?: string) => {
    navigate('/review/praticar', { state: { disciplina } });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando revisões...</p>
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
              <Brain className="h-8 w-8 text-primary" />
              Revisão Inteligente
            </h1>
            <p className="text-muted-foreground text-lg">
              Sistema de repetição espaçada para fixação permanente
            </p>
          </div>
          
          {contadores.hoje > 0 && (
            <Button 
              size="lg" 
              onClick={() => handleRevisar()}
              className="gap-2 shadow-lg"
            >
              <Play className="h-5 w-5" />
              Iniciar Revisão ({contadores.hoje})
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="mb-8">
          <ReviewStats 
            stats={{
              ...contadores,
              total: revisoes.length,
              streak: estatisticasGerais.streak,
              totalRevisadas: estatisticasGerais.totalRevisadas,
              taxaAcerto: estatisticasGerais.taxaAcerto
            }} 
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="queue" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="queue" className="gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Fila de Revisão</span>
              <span className="sm:hidden">Fila</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <CalendarIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Calendário</span>
              <span className="sm:hidden">Agenda</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Estatísticas</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="queue" className="space-y-6">
            <ReviewQueue 
              disciplinas={disciplinasOrdenadas as any}
              onRevisar={handleRevisar}
              loading={loading}
            />
            
            <ReviewMethodInfo />
          </TabsContent>

          <TabsContent value="calendar">
            <div className="grid lg:grid-cols-2 gap-6">
              <ReviewCalendar 
                reviewDays={calendarData}
                onDayClick={(date) => {
                  console.log('Day clicked:', date);
                }}
              />
              
              <ReviewProgress 
                totalRevisadas={estatisticasGerais.totalRevisadas}
                taxaAcerto={estatisticasGerais.taxaAcerto}
                metaDiaria={20}
              />
            </div>
          </TabsContent>

          <TabsContent value="stats">
            <div className="grid md:grid-cols-2 gap-6">
              <ReviewProgress 
                totalRevisadas={estatisticasGerais.totalRevisadas}
                taxaAcerto={estatisticasGerais.taxaAcerto}
                metaDiaria={20}
              />
              
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Resumo por Disciplina</h3>
                <div className="space-y-4">
                  {disciplinasOrdenadas.slice(0, 5).map((d: any, idx) => {
                    const dominio = d.facilidadeMedia >= 2.2 ? 90 : 
                                   d.facilidadeMedia >= 1.8 ? 70 :
                                   d.facilidadeMedia >= 1.5 ? 50 : 30;
                    return (
                      <div key={idx}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="truncate">{d.disciplina}</span>
                          <span className="text-muted-foreground">{d.questoes} questões</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all"
                            style={{ width: `${dominio}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <AIHelpButton variant="fab" context="Ajude-me com a revisão espaçada. Explique como funciona o algoritmo SM-2 e como otimizar meus estudos." />
    </div>
  );
};

export default Review;
