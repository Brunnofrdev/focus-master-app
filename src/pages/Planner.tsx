import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Calendar, Clock, Play, Pause, Plus, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePomodoro } from "@/hooks/usePomodoro";

const Planner = () => {
  const { minutes, seconds, isRunning, sessoes, toggle, reset } = usePomodoro(25);

  // Mock calendar data
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const currentMonth = 'Março 2025';
  
  const studySessions = [
    { id: 1, subject: 'Direito Constitucional', day: 15, hours: 3, color: 'primary' },
    { id: 2, subject: 'Português', day: 15, hours: 2, color: 'success' },
    { id: 3, subject: 'Raciocínio Lógico', day: 16, hours: 4, color: 'accent' },
    { id: 4, subject: 'Direito Administrativo', day: 17, hours: 3, color: 'primary' },
  ];

  const weeklyGoal = { current: 18.5, target: 25 };

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
              <div className="text-6xl font-bold mb-4 gradient-primary bg-clip-text text-transparent">
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
                  {weeklyGoal.current}h / {weeklyGoal.target}h
                </span>
              </div>
              <div className="h-4 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full gradient-success transition-all"
                  style={{ width: `${(weeklyGoal.current / weeklyGoal.target) * 100}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day, i) => (
                <div key={day} className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">{day}</div>
                  <div className={`h-20 rounded-lg flex items-center justify-center text-sm font-semibold ${
                    i < 3 ? 'gradient-primary text-white' : 
                    i === 3 ? 'bg-accent/20 text-accent' : 
                    'bg-secondary'
                  }`}>
                    {i < 3 ? `${2 + i}h` : i === 3 ? '2h' : '0h'}
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outline" size="lg" className="w-full mt-6">
              <Plus className="mr-2 h-5 w-5" />
              Adicionar Sessão de Estudo
            </Button>
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
              <Button variant="outline" size="icon">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
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
            {Array.from({ length: 35 }, (_, i) => {
              const dayNumber = i - 2; // Adjust for month start
              const hasSessions = studySessions.filter(s => s.day === dayNumber);
              const isToday = dayNumber === 15;
              
              return (
                <div 
                  key={i} 
                  className={`min-h-[100px] p-2 rounded-lg border-2 transition-smooth hover:border-primary/50 ${
                    dayNumber > 0 && dayNumber <= 31 ? 'bg-card cursor-pointer' : 'bg-muted/30'
                  } ${isToday ? 'border-primary' : 'border-border'}`}
                >
                  {dayNumber > 0 && dayNumber <= 31 && (
                    <>
                      <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-primary' : ''}`}>
                        {dayNumber}
                      </div>
                      <div className="space-y-1">
                        {hasSessions.map(session => (
                          <Badge 
                            key={session.id}
                            variant="secondary"
                            className="text-xs block truncate"
                          >
                            {session.subject.split(' ')[0]}
                          </Badge>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Planner;