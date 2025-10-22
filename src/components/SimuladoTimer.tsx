import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Play, Pause, RotateCcw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface SimuladoTimerProps {
  tempoLimiteMinutos: number;
  onTempoEsgotado?: () => void;
}

export const SimuladoTimer = ({ tempoLimiteMinutos, onTempoEsgotado }: SimuladoTimerProps) => {
  const [segundosRestantes, setSegundosRestantes] = useState(tempoLimiteMinutos * 60);
  const [rodando, setRodando] = useState(true);
  const [intervaloAtual, setIntervaloAtual] = useState(0);
  
  const INTERVALO_TRABALHO = 25 * 60; // 25 minutos
  const INTERVALO_PAUSA = 5 * 60; // 5 minutos
  const [modoPomodoro, setModoPomodoro] = useState(false);
  const [emPausa, setEmPausa] = useState(false);

  useEffect(() => {
    if (!rodando) return;

    const interval = setInterval(() => {
      setSegundosRestantes(prev => {
        if (prev <= 1) {
          if (onTempoEsgotado) {
            onTempoEsgotado();
          }
          return 0;
        }
        return prev - 1;
      });

      // Pomodoro logic
      if (modoPomodoro) {
        setIntervaloAtual(prev => {
          const limite = emPausa ? INTERVALO_PAUSA : INTERVALO_TRABALHO;
          if (prev >= limite - 1) {
            setEmPausa(!emPausa);
            // Play notification sound
            try {
              const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHGu+7+OZRBMQT6Xh8bBfGgU2jdXzzn0pBSh+zPLaizsKFlm56+qnVhMMR6Hh8r1rIAU0hdLz0YIyBhpovO/inUYRD1Gk4/KyYRoFNo7V89J+KgYogM/z2ow7ChVbuuvqp1cUDEef4PK+ayAFMobS89GCMgYaaL3v4Z1GEg9Ppd/ys2EaBDaP1vPTgCsGKIHQ8tqMPAoVXLrs6qhYFAxHnuDyv2wgBTGF0PPRgjIGGmi87+KdRhMPT6Xf8rJgGgU2jdXy0oAqBiiAzvHajDsKFVy57OqoWRQMSJ/g8sFsIQUxhdH00YMyBhlnvO/hnEYSDk+l3+GzYhsGNo7W89SALAYpgdDy2ow8ChVcuuzqqFgUDEie4PLBbiEFMYXS89GDMgYZZ7zv4ZxGEw5PpN7hsmEbBjaN1fLSgSsGKIDO8dmLOwoUXLrr6qdZFAxIoODywW4hBTCE0fPRgzIGGWa87+GcRRIOT6Td4bFhGwY2jdXy0oErBiiAzvHZizsKFFy66+unWBQMR5/f8sFuIQUwhdHy0YQyBhhnu+/hnEURDk6k3eCxYRsGNo3V8dKAKgYpgM7x2Is7ChRbuuvqp1gUDEef3/K/biEFMITR8tGEMgYYZrvv4ZtFEQ5OpN3gsWEbBjWM1fHSgCoGKIDO8NiKOwoUW7ns6qdXFAxHnt/yv24gBS+D0fLRhDMGGGa67+CbRRANTqPd4LBgGwY1i9Tx0n8qBieAze/YijoKFFq46+mmVxMLRp3e8b5tIAUugM/y0IQzBhdmuu/gmkQQDU2j3d+wYBsGNYvU8dJ/KQYngM3v14k6ChRauOroplcTCUWc3vG+bB8FLn/P8s+DMAYXZrjv3phDDwxNo9vfsF4aBDSK1PDP');
              audio.play();
            } catch (e) {
              console.log('Could not play notification sound');
            }
            return 0;
          }
          return prev + 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [rodando, modoPomodoro, emPausa, onTempoEsgotado]);

  const formatarTempo = (segundos: number) => {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = segundos % 60;
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  };

  const togglePausar = () => {
    setRodando(!rodando);
  };

  const resetar = () => {
    setSegundosRestantes(tempoLimiteMinutos * 60);
    setIntervaloAtual(0);
    setEmPausa(false);
    setRodando(true);
  };

  const progressoPomodoro = modoPomodoro 
    ? (intervaloAtual / (emPausa ? INTERVALO_PAUSA : INTERVALO_TRABALHO)) * 100
    : 0;

  const corAlerta = segundosRestantes < 600 ? 'text-destructive' : segundosRestantes < 1800 ? 'text-warning' : 'text-primary';

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Clock className={`h-5 w-5 ${corAlerta}`} />
          <div>
            <div className={`text-2xl font-bold ${corAlerta}`}>
              {formatarTempo(segundosRestantes)}
            </div>
            {modoPomodoro && (
              <div className="text-xs text-muted-foreground">
                {emPausa ? 'Pausa' : 'Foco'} - {formatarTempo(emPausa ? INTERVALO_PAUSA - intervaloAtual : INTERVALO_TRABALHO - intervaloAtual)}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={togglePausar}
          >
            {rodando ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetar}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant={modoPomodoro ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setModoPomodoro(!modoPomodoro);
              setIntervaloAtual(0);
              setEmPausa(false);
            }}
          >
            Pomodoro
          </Button>
        </div>
      </div>
      
      {modoPomodoro && (
        <div className="mt-3">
          <Progress value={progressoPomodoro} className="h-1" />
        </div>
      )}
    </Card>
  );
};
