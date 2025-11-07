import { Target } from "lucide-react";

const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center">
          <Target className="h-16 w-16 text-primary animate-pulse" />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2">ConcursoMax</h2>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
        <div className="flex gap-2 justify-center">
          <div className="h-3 w-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="h-3 w-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="h-3 w-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
