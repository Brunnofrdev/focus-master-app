import { Card } from "@/components/ui/card";
import { 
  Brain, 
  Clock, 
  Repeat, 
  TrendingUp, 
  Sparkles,
  ArrowRight
} from "lucide-react";

export const ReviewMethodInfo = () => {
  const steps = [
    {
      icon: Brain,
      title: "1ª Revisão",
      subtitle: "Após 1 dia",
      description: "Questões novas ou erradas são revisadas 24h depois para consolidação inicial.",
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      icon: Clock,
      title: "2ª Revisão",
      subtitle: "Após 3 dias",
      description: "Acertou? O intervalo aumenta. A repetição espaçada começa a funcionar.",
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    },
    {
      icon: Repeat,
      title: "3ª Revisão",
      subtitle: "Após 7 dias",
      description: "Mais um acerto e o conteúdo vai para a memória de médio prazo.",
      color: "text-orange-500",
      bg: "bg-orange-500/10"
    },
    {
      icon: TrendingUp,
      title: "4ª+ Revisões",
      subtitle: "14, 30, 60+ dias",
      description: "Acertos consecutivos aumentam exponencialmente os intervalos até a fixação permanente.",
      color: "text-success",
      bg: "bg-success/10"
    }
  ];

  return (
    <Card className="p-6 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />
      
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Como Funciona?</h3>
          <p className="text-sm text-muted-foreground">
            Algoritmo SM-2 de repetição espaçada
          </p>
        </div>
      </div>
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step, idx) => (
          <div key={idx} className="relative">
            <div className={`p-4 rounded-xl ${step.bg} h-full`}>
              <div className={`w-10 h-10 rounded-lg ${step.bg} flex items-center justify-center mb-3`}>
                <step.icon className={`h-5 w-5 ${step.color}`} />
              </div>
              <h4 className="font-semibold mb-1">{step.title}</h4>
              <p className={`text-sm font-medium ${step.color} mb-2`}>{step.subtitle}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
            
            {idx < steps.length - 1 && (
              <div className="hidden lg:flex absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 rounded-lg bg-muted/50 text-sm">
        <p className="text-muted-foreground">
          <strong className="text-foreground">💡 Dica:</strong> Errar uma questão reinicia o ciclo, 
          mas não desanime! Isso significa que você está aprendendo exatamente o que precisa revisar mais.
        </p>
      </div>
    </Card>
  );
};
