import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, BookOpen, BarChart3, Brain, Target, Clock, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import heroBackground from "@/assets/hero-background.jpg";
import dashboardIllustration from "@/assets/dashboard-illustration.jpg";
import plannerIllustration from "@/assets/planner-illustration.jpg";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Target className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-gradient">ConcursoMax</span>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" asChild>
              <Link to="/auth">Login</Link>
            </Button>
            <Button variant="hero" asChild>
              <Link to="/auth">Começar Grátis</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section 
        className="pt-32 pb-20 px-4 relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(99, 102, 241, 0.95), rgba(52, 211, 153, 0.85)), url(${heroBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-white mb-6 animate-fade-in">
              Sua Aprovação no Concurso Público Começa Aqui
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Plataforma completa de estudos com revisão automática, simulados personalizados e análises detalhadas para sua aprovação
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button variant="glass" size="xl" asChild>
                <Link to="/auth">
                  Começar Agora <ArrowRight className="ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                Ver Demonstração
              </Button>
            </div>
            <p className="text-white/80 text-sm mt-6">✨ 7 dias grátis • Sem cartão de crédito</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gradient-subtle">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="mb-4">Recursos Completos para Sua Preparação</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tudo que você precisa em uma única plataforma
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-lg transition-smooth border-2 hover:border-primary/50">
              <div className="h-12 w-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-3">Planner de Estudos</h3>
              <p className="text-muted-foreground">
                Organize seus estudos com calendário inteligente, cronômetro Pomodoro e controle de metas semanais
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-smooth border-2 hover:border-primary/50">
              <div className="h-12 w-12 rounded-lg gradient-success flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-3">Revisão Automática</h3>
              <p className="text-muted-foreground">
                Sistema inteligente de repetição espaçada que otimiza sua memorização e retenção do conteúdo
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-smooth border-2 hover:border-primary/50">
              <div className="h-12 w-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-3">Análises Detalhadas</h3>
              <p className="text-muted-foreground">
                Acompanhe seu progresso com gráficos, estatísticas e insights sobre seu desempenho
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-smooth border-2 hover:border-success/50">
              <div className="h-12 w-12 rounded-lg gradient-success flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-3">Simulados Personalizados</h3>
              <p className="text-muted-foreground">
                Pratique com questões das principais bancas e crie simulados customizados por disciplina
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-smooth border-2 hover:border-success/50">
              <div className="h-12 w-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-3">Timer Pomodoro</h3>
              <p className="text-muted-foreground">
                Maximize sua produtividade com sessões cronometradas e pausas programadas
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-smooth border-2 hover:border-primary/50">
              <div className="h-12 w-12 rounded-lg gradient-success flex items-center justify-center mb-4">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-3">Gamificação</h3>
              <p className="text-muted-foreground">
                Conquiste badges, acumule pontos e acompanhe seu ranking de evolução
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Detail Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <h2 className="mb-6">Estatísticas Inteligentes</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Visualize seu desempenho com gráficos detalhados por disciplina, dificuldade e evolução temporal. 
                Identifique pontos fracos e receba recomendações personalizadas.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ArrowRight className="h-4 w-4 text-success" />
                  </div>
                  <span>Taxa de acerto por disciplina e assunto</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ArrowRight className="h-4 w-4 text-success" />
                  </div>
                  <span>Curva de aprendizado e evolução</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ArrowRight className="h-4 w-4 text-success" />
                  </div>
                  <span>Heatmap de intensidade de estudos</span>
                </li>
              </ul>
            </div>
            <div>
              <img 
                src={dashboardIllustration} 
                alt="Dashboard" 
                className="rounded-2xl shadow-2xl border-2 border-border"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              <img 
                src={plannerIllustration} 
                alt="Planner" 
                className="rounded-2xl shadow-2xl border-2 border-border"
              />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="mb-6">Planejamento Eficiente</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Crie planos de estudo personalizados com distribuição inteligente de matérias. 
                Acompanhe metas semanais e ajuste seu cronograma em tempo real.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </div>
                  <span>Calendário visual com drag-and-drop</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </div>
                  <span>Distribuição automática por prioridade</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </div>
                  <span>Alertas e lembretes personalizados</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 gradient-hero relative overflow-hidden">
        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-white mb-6">Comece Sua Jornada de Aprovação Hoje</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de concurseiros que já estão estudando de forma mais inteligente
          </p>
          <Button variant="glass" size="xl" asChild>
            <Link to="/auth">
              Criar Conta Gratuita <ArrowRight className="ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t">
        <div className="container mx-auto text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Target className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-gradient">ConcursoMax</span>
          </div>
          <p>© 2025 ConcursoMax. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;