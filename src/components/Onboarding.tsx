import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Brain, Target, Trophy, ChevronRight, ChevronLeft } from "lucide-react";

interface OnboardingProps {
  open: boolean;
  onComplete: () => void;
}

const Onboarding = ({ open, onComplete }: OnboardingProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Bem-vindo ao ConcursoMax! 🎉",
      description: "Sua plataforma completa para aprovação em concursos públicos",
      icon: Target,
      content: "Vamos fazer um tour rápido pelas principais funcionalidades da plataforma."
    },
    {
      title: "Planner de Estudos 📚",
      description: "Organize seu tempo de forma eficiente",
      icon: BookOpen,
      content: "Use o Timer Pomodoro, registre sessões de estudo e acompanhe suas metas semanais no calendário visual."
    },
    {
      title: "Revisão Espaçada 🧠",
      description: "Memorize conteúdo de forma permanente",
      icon: Brain,
      content: "Nosso sistema inteligente agenda revisões automáticas baseadas em seu desempenho, otimizando sua retenção."
    },
    {
      title: "Simulados Personalizados 🎯",
      description: "Teste seus conhecimentos",
      icon: Trophy,
      content: "Crie simulados customizados por banca e disciplina. Pratique questões e acompanhe sua evolução."
    }
  ];

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md [&>button]:hidden">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center">
              <Icon className="h-8 w-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            {currentStepData.title}
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            {currentStepData.description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <p className="text-center text-muted-foreground">
            {currentStepData.content}
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-center text-muted-foreground">
              Passo {currentStep + 1} de {steps.length}
            </p>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Pular Tutorial
            </Button>
            
            <div className="flex gap-2 w-full sm:w-auto order-1 sm:order-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1 sm:flex-initial"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Voltar
                </Button>
              )}
              
              <Button
                onClick={handleNext}
                className="flex-1 sm:flex-initial"
              >
                {currentStep < steps.length - 1 ? (
                  <>
                    Próximo
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                ) : (
                  "Começar!"
                )}
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Onboarding;
