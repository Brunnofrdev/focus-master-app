import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Calendar, Clock, Play, Pause, Plus, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePomodoro } from "@/hooks/usePomodoro";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sessionSchema } from "@/lib/validations";
import { AIHelpButton } from "@/components/ai";

const Planner = () => {
  const { minutes, seconds, isRunning, sessoes, toggle, reset } = usePomodoro(25);
  const { user } = useAuth();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sessoesEstudo, setSessoesEstudo] = useState<any[]>([]);
  const [disciplinas, setDisciplinas] = useState<any[]>([]);
  const [metaSemanal, setMetaSemanal] = useState({ current: 0, target: 20 });
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const [novaSessao, setNovaSessao] = useState({
    data: new Date().toISOString().split('T')[0],
    duracao_minutos: 60,
    disciplina_id: '',
    notas: ''
  });

  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  
  const currentMonth = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  useEffect(() => {
    carregarDados();
  }, [user, currentDate]);

  const carregarDados = async () => {
    if (!user) return;

    // Carregar disciplinas
    const { data: disciplinasData } = await supabase
      .from('disciplinas')
      .select('*')
      .order('nome');
    
    if (disciplinasData) setDisciplinas(disciplinasData);

    // Carregar sessões do mês atual
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const { data: sessoesData } = await supabase
      .from('sessoes_estudo')
      .select('*, disciplinas(nome)')
      .eq('user_id', user.id)
      .gte('data', firstDay.toISOString().split('T')[0])
      .lte('data', lastDay.toISOString().split('T')[0])
      .order('data');

    if (sessoesData) setSessoesEstudo(sessoesData);

    // Calcular meta semanal
    const hoje = new Date();
    const primeiroDiaSemana = new Date(hoje);
    primeiroDiaSemana.setDate(hoje.getDate() - hoje.getDay() + 1);
    const ultimoDiaSemana = new Date(primeiroDiaSemana);
    ultimoDiaSemana.setDate(primeiroDiaSemana.getDate() + 6);

    const { data: sessoesSemana } = await supabase
      .from('sessoes_estudo')
      .select('duracao_minutos')
      .eq('user_id', user.id)
      .gte('data', primeiroDiaSemana.toISOString().split('T')[0])
      .lte('data', ultimoDiaSemana.toISOString().split('T')[0]);

    const horasEstudadas = sessoesSemana?.reduce((acc, s) => acc + (s.duracao_minutos / 60), 0) || 0;

    // Pegar meta do perfil
    const { data: profile } = await supabase
      .from('profiles')
      .select('meta_horas_semanais')
      .eq('id', user.id)
      .single();

    setMetaSemanal({
      current: parseFloat(horasEstudadas.toFixed(1)),
      target: profile?.meta_horas_semanais || 20
    });
  };

  const handleAdicionarSessao = async () => {
    if (!user || !novaSessao.disciplina_id) {
      toast.error("Selecione uma disciplina");
      return;
    }

    // Validação com Zod
    const validation = sessionSchema.safeParse({
      duracao_minutos: novaSessao.duracao_minutos,
      disciplina_id: novaSessao.disciplina_id,
      notas: novaSessao.notas
    });

    if (!validation.success) {
      const firstError = validation.error.issues[0];
      toast.error(firstError.message);
      return;
    }

    const { error } = await supabase
      .from('sessoes_estudo')
      .insert({
        user_id: user.id,
        data: novaSessao.data,
        duracao_minutos: novaSessao.duracao_minutos,
        disciplina_id: novaSessao.disciplina_id,
        notas: novaSessao.notas
      });

    if (error) {
      toast.error("Erro ao adicionar sessão");
      console.error(error);
    } else {
      toast.success("Sessão adicionada!");
      setDialogOpen(false);
      setNovaSessao({
        data: new Date().toISOString().split('T')[0],
        duracao_minutos: 60,
        disciplina_id: '',
        notas: ''
      });
      carregarDados();
    }
  };

  const mudarMes = (direcao: number) => {
    const novaData = new Date(currentDate);
    novaData.setMonth(novaData.getMonth() + direcao);
    setCurrentDate(novaData);
  };

  const getDiasSemanaAtual = () => {
    const hoje = new Date();
    const primeiroDia = new Date(hoje);
    primeiroDia.setDate(hoje.getDate() - hoje.getDay() + 1);
    
    return Array.from({ length: 7 }, (_, i) => {
      const dia = new Date(primeiroDia);
      dia.setDate(primeiroDia.getDate() + i);
      
      const sessoesDia = sessoesEstudo.filter(s => {
        const dataSessao = new Date(s.data);
        return dataSessao.toDateString() === dia.toDateString();
      });
      
      const horasDia = sessoesDia.reduce((acc, s) => acc + (s.duracao_minutos / 60), 0);
      
      return {
        dia: dia.getDate(),
        horas: horasDia,
        atual: dia.toDateString() === hoje.toDateString()
      };
    });
  };

  const getCalendarDays = () => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDay = firstDay.getDay();
    
    const days = [];
    
    // Dias antes do início do mês
    for (let i = 0; i < startDay; i++) {
      days.push({ dayNumber: null, sessions: [] });
    }
    
    // Dias do mês
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const dia = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      const sessoesDia = sessoesEstudo.filter(s => {
        const dataSessao = new Date(s.data + 'T00:00:00');
        return dataSessao.toDateString() === dia.toDateString();
      });
      
      days.push({ dayNumber: i, sessions: sessoesDia, isToday: dia.toDateString() === new Date().toDateString() });
    }
    
    return days;
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="mb-8">
          <h1 className="mb-2">Planner de Estudos</h1>
          <p className="text-muted-foreground text-lg">
            Organize seu tempo e maximize seus resultados
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Timer Pomodoro */}
          <Card className="p-6">
            <h3 className="mb-6 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Timer Pomodoro
            </h3>
            
            <div className="text-center mb-6">
              <div className="text-6xl font-bold mb-4 text-primary">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </div>
              <p className="text-sm text-muted-foreground">Sessão de Foco</p>
            </div>

            <div className="space-y-3">
              <Button 
                variant={isRunning ? "destructive" : "hero"}
                size="lg" 
                className="w-full"
                onClick={toggle}
              >
                {isRunning ? (
                  <>
                    <Pause className="mr-2 h-5 w-5" />
                    Pausar
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-5 w-5" />
                    Iniciar Sessão
                  </>
                )}
              </Button>

              <div className="grid grid-cols-4 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => reset(25)}
                  disabled={isRunning}
                >
                  25 min
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => reset(50)}
                  disabled={isRunning}
                >
                  50 min
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => reset(5)}
                  disabled={isRunning}
                >
                  5 min
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => reset(25)}
                  disabled={isRunning}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <div className="text-sm text-muted-foreground mb-2">
                Sessões Concluídas Hoje: {sessoes}
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i} 
                    className={`h-2 flex-1 rounded ${i <= sessoes ? 'bg-success' : 'bg-secondary'}`}
                  />
                ))}
              </div>
            </div>
          </Card>

          {/* Weekly Progress */}
          <Card className="lg:col-span-2 p-6">
            <h3 className="mb-6 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Meta Semanal
            </h3>

            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="font-semibold">Progresso da Semana</span>
                <span className="text-muted-foreground">
                  {metaSemanal.current}h / {metaSemanal.target}h
                </span>
              </div>
              <div className="h-4 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full gradient-success transition-all"
                  style={{ width: `${(metaSemanal.current / metaSemanal.target) * 100}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day, i) => {
                const diasSemana = getDiasSemanaAtual();
                const diaInfo = diasSemana[i];
                
                return (
                  <div key={day} className="text-center">
                    <div className="text-sm text-muted-foreground mb-2">{day}</div>
                    <div className={`h-20 rounded-lg flex items-center justify-center text-sm font-semibold ${
                      diaInfo.horas >= 3 ? 'gradient-primary text-white' : 
                      diaInfo.horas > 0 ? 'bg-accent/20 text-accent' : 
                      'bg-secondary'
                    } ${diaInfo.atual ? 'border-2 border-primary' : ''}`}>
                      {diaInfo.horas > 0 ? `${diaInfo.horas.toFixed(1)}h` : '0h'}
                    </div>
                  </div>
                );
              })}
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="lg" className="w-full mt-6">
                  <Plus className="mr-2 h-5 w-5" />
                  Adicionar Sessão de Estudo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nova Sessão de Estudo</DialogTitle>
                  <DialogDescription>
                    Registre uma sessão de estudos concluída
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="data">Data</Label>
                    <Input
                      id="data"
                      type="date"
                      value={novaSessao.data}
                      onChange={(e) => setNovaSessao({ ...novaSessao, data: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="disciplina">Disciplina</Label>
                    <Select
                      value={novaSessao.disciplina_id}
                      onValueChange={(value) => setNovaSessao({ ...novaSessao, disciplina_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma disciplina" />
                      </SelectTrigger>
                      <SelectContent>
                        {disciplinas.map((disc) => (
                          <SelectItem key={disc.id} value={disc.id}>
                            {disc.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="duracao">Duração (minutos)</Label>
                    <Input
                      id="duracao"
                      type="number"
                      min="1"
                      value={novaSessao.duracao_minutos}
                      onChange={(e) => setNovaSessao({ ...novaSessao, duracao_minutos: parseInt(e.target.value) })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="notas">Notas (opcional)</Label>
                    <Input
                      id="notas"
                      value={novaSessao.notas}
                      onChange={(e) => setNovaSessao({ ...novaSessao, notas: e.target.value })}
                      placeholder="Adicione observações sobre o estudo"
                    />
                  </div>
                  
                  <Button onClick={handleAdicionarSessao} className="w-full">
                    Adicionar Sessão
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </Card>
        </div>

        {/* Calendar View */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              {currentMonth}
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => mudarMes(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => mudarMes(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {days.map(day => (
              <div key={day} className="text-center text-sm font-semibold text-muted-foreground p-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {getCalendarDays().map((day, i) => (
              <div 
                key={i} 
                className={`min-h-[100px] p-2 rounded-lg border-2 transition-smooth hover:border-primary/50 ${
                  day.dayNumber ? 'bg-card cursor-pointer' : 'bg-muted/30'
                } ${day.isToday ? 'border-primary' : 'border-border'}`}
              >
                {day.dayNumber && (
                  <>
                    <div className={`text-sm font-semibold mb-1 ${day.isToday ? 'text-primary' : ''}`}>
                      {day.dayNumber}
                    </div>
                    <div className="space-y-1">
                      {day.sessions.map((session: any) => (
                        <Badge 
                          key={session.id}
                          variant="secondary"
                          className="text-xs block truncate"
                          title={`${session.disciplinas?.nome || 'Estudo'} - ${session.duracao_minutos}min`}
                        >
                          {session.disciplinas?.nome?.split(' ')[0] || 'Estudo'} ({Math.round(session.duracao_minutos / 60)}h)
                        </Badge>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
      
      <AIHelpButton variant="fab" context="Ajude-me a planejar meus estudos de forma eficiente. Sugira técnicas de estudo e organização." />
    </div>
  );
};

export default Planner;