import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, BookOpen, BarChart3, Brain, Target, Clock, Trophy, Sparkles, Users, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import heroBackground from "@/assets/hero-background.jpg";
import dashboardIllustration from "@/assets/dashboard-illustration.jpg";
import plannerIllustration from "@/assets/planner-illustration.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation - Light mode only for landing */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Target className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ConcursoMax
            </span>
          </div>
          <div className="flex gap-2 md:gap-4 items-center">
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link to="/auth">Entrar</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity">
              <Link to="/auth">Começar Grátis</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-4 relative overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(99, 102, 241, 0.95) 0%, rgba(52, 211, 153, 0.9) 100%), url(${heroBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        
        {/* Animated shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000" />
        
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white/90 text-sm mb-8">
              <Sparkles className="h-4 w-4" />
              <span>IA integrada para potencializar seus estudos</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Sua Aprovação no Concurso Público{" "}
              <span className="relative">
                Começa Aqui
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path d="M2 10C50 4 150 2 298 10" stroke="rgba(255,255,255,0.5)" strokeWidth="4" strokeLinecap="round"/>
                </svg>
              </span>
            </h1>
            
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
              Plataforma completa de estudos com revisão automática, simulados personalizados, 
              flashcards inteligentes e análises detalhadas para sua aprovação
            </p>
            
            <div className="flex gap-4 justify-center flex-wrap">
              <Button 
                size="lg" 
                asChild
                className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all"
              >
                <Link to="/auth">
                  Começar Agora Grátis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-8 mt-12 text-white/80">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <span className="text-sm">7 dias grátis</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                <span className="text-sm">Sem cartão de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span className="text-sm">+10.000 aprovados</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
              Recursos Completos para Sua Preparação
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tudo que você precisa em uma única plataforma
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30 group">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Planner de Estudos</h3>
              <p className="text-muted-foreground leading-relaxed">
                Organize seus estudos com calendário inteligente, cronômetro Pomodoro e controle de metas semanais
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-all duration-300 border-2 hover:border-accent/30 group">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Brain className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Revisão Automática</h3>
              <p className="text-muted-foreground leading-relaxed">
                Sistema inteligente de repetição espaçada que otimiza sua memorização e retenção do conteúdo
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30 group">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Análises Detalhadas</h3>
              <p className="text-muted-foreground leading-relaxed">
                Acompanhe seu progresso com gráficos, estatísticas e insights sobre seu desempenho
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-all duration-300 border-2 hover:border-accent/30 group">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Target className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Simulados Personalizados</h3>
              <p className="text-muted-foreground leading-relaxed">
                Pratique com questões das principais bancas e crie simulados customizados por disciplina
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30 group">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Flashcards com IA</h3>
              <p className="text-muted-foreground leading-relaxed">
                Gere flashcards automaticamente e memorize com algoritmo SM-2 de repetição espaçada
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-all duration-300 border-2 hover:border-accent/30 group">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Trophy className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Coach de IA</h3>
              <p className="text-muted-foreground leading-relaxed">
                Assistente inteligente que cria sua missão diária e acompanha seu desempenho
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Detail Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-primary text-sm mb-6">
                <BarChart3 className="h-4 w-4" />
                <span>Analytics Avançado</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-foreground">
                Estatísticas Inteligentes
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Visualize seu desempenho com gráficos detalhados por disciplina, dificuldade e evolução temporal. 
                Identifique pontos fracos e receba recomendações personalizadas.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ArrowRight className="h-4 w-4 text-accent" />
                  </div>
                  <span className="text-foreground">Taxa de acerto por disciplina e assunto</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ArrowRight className="h-4 w-4 text-accent" />
                  </div>
                  <span className="text-foreground">Curva de aprendizado e evolução</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ArrowRight className="h-4 w-4 text-accent" />
                  </div>
                  <span className="text-foreground">Heatmap de intensidade de estudos</span>
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-2xl" />
              <img 
                src={dashboardIllustration} 
                alt="Dashboard de estatísticas" 
                className="relative rounded-2xl shadow-2xl border border-border"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-accent/20 to-primary/20 rounded-3xl blur-2xl" />
              <img 
                src={plannerIllustration} 
                alt="Planner de estudos" 
                className="relative rounded-2xl shadow-2xl border border-border"
              />
            </div>
            <div className="order-1 md:order-2">
              <div className="inline-flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full text-accent text-sm mb-6">
                <Clock className="h-4 w-4" />
                <span>Gestão de Tempo</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-foreground">
                Planejamento Eficiente
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Crie planos de estudo personalizados com distribuição inteligente de matérias. 
                Acompanhe metas semanais e ajuste seu cronograma em tempo real.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-foreground">Calendário visual com drag-and-drop</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-foreground">Distribuição automática por prioridade</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-foreground">Alertas e lembretes personalizados</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, hsl(243 75% 59%) 0%, hsl(158 64% 52%) 100%)'
          }}
        />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Comece Sua Jornada de Aprovação Hoje
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Junte-se a milhares de concurseiros que já estão estudando de forma mais inteligente
          </p>
          <Button 
            size="lg" 
            asChild
            className="bg-white text-primary hover:bg-white/90 text-lg px-10 py-6 shadow-xl"
          >
            <Link to="/auth">
              Criar Conta Gratuita
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">Perguntas Frequentes</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tudo que você precisa saber sobre nossa plataforma
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-4">
            <Card className="p-6 hover:shadow-md transition-shadow">
              <h3 className="font-semibold mb-2 text-foreground">Como funciona o período de teste?</h3>
              <p className="text-muted-foreground">
                Oferecemos 7 dias de teste gratuito com acesso completo a todas as funcionalidades. 
                Não é necessário cartão de crédito para começar.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-md transition-shadow">
              <h3 className="font-semibold mb-2 text-foreground">Posso cancelar minha assinatura a qualquer momento?</h3>
              <p className="text-muted-foreground">
                Sim! Você pode cancelar sua assinatura a qualquer momento através do seu perfil. 
                Não há multas ou taxas de cancelamento.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-md transition-shadow">
              <h3 className="font-semibold mb-2 text-foreground">As questões são atualizadas?</h3>
              <p className="text-muted-foreground">
                Sim! Nossa equipe adiciona constantemente novas questões de concursos recentes e 
                atualiza o conteúdo para refletir as últimas provas das principais bancas.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-md transition-shadow">
              <h3 className="font-semibold mb-2 text-foreground">Funciona em dispositivos móveis?</h3>
              <p className="text-muted-foreground">
                Perfeitamente! Nossa plataforma é 100% responsiva e funciona em computadores, 
                tablets e smartphones, permitindo que você estude em qualquer lugar.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-md transition-shadow">
              <h3 className="font-semibold mb-2 text-foreground">Como funciona o sistema de revisão?</h3>
              <p className="text-muted-foreground">
                Utilizamos o método de repetição espaçada (SM-2), que programa revisões automáticas baseadas 
                no seu desempenho, otimizando sua retenção e memorização do conteúdo.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 border-t bg-background">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  ConcursoMax
                </span>
              </div>
              <p className="text-muted-foreground text-sm">
                Sua aprovação no concurso público começa aqui. Plataforma completa de preparação.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-foreground">Plataforma</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/dashboard" className="hover:text-primary transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/planner" className="hover:text-primary transition-colors">
                    Planner
                  </Link>
                </li>
                <li>
                  <Link to="/simulados" className="hover:text-primary transition-colors">
                    Simulados
                  </Link>
                </li>
                <li>
                  <Link to="/flashcards" className="hover:text-primary transition-colors">
                    Flashcards
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-foreground">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/terms" className="hover:text-primary transition-colors">
                    Termos de Uso
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-primary transition-colors">
                    Política de Privacidade
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-foreground">Contato</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>contato@concursomax.com.br</li>
                <li>Suporte: suporte@concursomax.com.br</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2025 ConcursoMax. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;