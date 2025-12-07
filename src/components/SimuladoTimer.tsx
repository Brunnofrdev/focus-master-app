import { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Play, Pause, RotateCcw, Timer, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface SimuladoTimerProps {
  tempoLimiteMinutos: number;
  onTempoEsgotado?: () => void;
  onPause?: () => void;
  onResume?: () => void;
}

export const SimuladoTimer = ({ 
  tempoLimiteMinutos, 
  onTempoEsgotado,
  onPause,
  onResume 
}: SimuladoTimerProps) => {
  const [segundosRestantes, setSegundosRestantes] = useState(tempoLimiteMinutos * 60);
  const [rodando, setRodando] = useState(true);
  const [modoPomodoro, setModoPomodoro] = useState(false);
  const [emPausa, setEmPausa] = useState(false);
  const [intervaloAtual, setIntervaloAtual] = useState(0);
  const [alertaExibido, setAlertaExibido] = useState(false);
  
  const tempoInicialRef = useRef(tempoLimiteMinutos * 60);
  const INTERVALO_TRABALHO = 25 * 60; // 25 minutos
  const INTERVALO_PAUSA = 5 * 60; // 5 minutos

  // Reset quando tempo limite muda
  useEffect(() => {
    tempoInicialRef.current = tempoLimiteMinutos * 60;
    setSegundosRestantes(tempoLimiteMinutos * 60);
  }, [tempoLimiteMinutos]);

  // Timer principal
  useEffect(() => {
    if (!rodando) return;

    const interval = setInterval(() => {
      setSegundosRestantes(prev => {
        if (prev <= 1) {
          setRodando(false);
          if (onTempoEsgotado) {
            onTempoEsgotado();
          }
          return 0;
        }
        
        // Alerta quando faltam 10 minutos
        if (prev === 600 && !alertaExibido) {
          setAlertaExibido(true);
          playAlertSound();
        }
        
        // Alerta quando faltam 5 minutos
        if (prev === 300) {
          playAlertSound();
        }
        
        // Alerta quando falta 1 minuto
        if (prev === 60) {
          playAlertSound();
        }
        
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [rodando, onTempoEsgotado, alertaExibido]);

  // Timer Pomodoro
  useEffect(() => {
    if (!rodando || !modoPomodoro) return;

    const interval = setInterval(() => {
      setIntervaloAtual(prev => {
        const limite = emPausa ? INTERVALO_PAUSA : INTERVALO_TRABALHO;
        if (prev >= limite - 1) {
          setEmPausa(!emPausa);
          playNotificationSound();
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [rodando, modoPomodoro, emPausa]);

  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHGu+7+OZRBMQT6Xh8bBfGgU2jdXzzn0pBSh+zPLaizsKFlm56+qnVhMMR6Hh8r1rIAU0hdLz0YIyBhpovO/inUYRD1Gk4/KyYRoFNo7V89J+KgYogM/z2ow7ChVbuuvqp1cUDEef4PK+ayAFMobS89GCMgYaaL3v4Z1GEg9Ppd/ys2EaBDaP1vPTgCsGKIHQ8tqMPAoVXLrs6qhYFAxHnuDyv2wgBTGF0PPRgjIGGmi87+KdRhMPT6Xf8rJgGgU2jdXy0oAqBiiAzvHajDsKFVy57OqoWRQMSJ/g8sFsIQUxhdH00YMyBhlnvO/hnEYSDk+l3+GzYhsGNo7W89SALAYpgdDy2ow8ChVcuuzqqFgUDEie4PLBbiEFMYXS89GDMgYZZ7zv4ZxGEw5PpN7hsmEbBjaN1fLSgSsGKIDO8dmLOwoUXLrr6qdZFAxIoODywW4hBTCE0fPRgzIGGWa87+GcRRIOT6Td4bFhGwY2jdXy0oErBiiAzvHZizsKFFy66+unWBQMR5/f8sFuIQUwhdHy0YQyBhhnu+/hnEURDk6k3eCxYRsGNo3V8dKAKgYpgM7x2Is7ChRbuuvqp1gUDEef3/K/biEFMITR8tGEMgYYZrvv4ZtFEQ5OpN3gsWEbBjWM1fHSgCoGKIDO8NiKOwoUW7ns6qdXFAxHnt/yv24gBS+D0fLRhDMGGGa67+CbRRANTqPd4LBgGwY1i9Tx0n8qBieAze/YijoKFFq46+mmVxMLRp3e8b5tIAUugM/y0IQzBhdmuu/gmkQQDU2j3d+wYBsGNYvU8dJ/KQYngM3v14k6ChRauOroplcTCUWc3vG+bB8FLn/P8s+DMAYXZrjv3phDDwxNo9vfsF4aBDSK1PDP');
      audio.play().catch(() => {});
    } catch (e) {
      // Ignorar erros de audio
    }
  }, []);

  const playAlertSound = useCallback(() => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHGu+7+OZRBMQT6Xh8bBfGgU2jdXzzn0pBSh+zPLaizsKFlm56+qnVhMMR6Hh8r1rIAU0hdLz0YIyBhpovO/inUYRD1Gk4/KyYRoFNo7V89J+KgYogM/z2ow7ChVbuuvqp1cUDEef4PK+ayAFMobS89GCMgYaaL3v4Z1GEg9Ppd/ys2EaBDaP1vPTgCsGKIHQ8tqMPAoVXLrs6qhYFAxHnuDyv2wgBTGF0PPRgjIGGmi87+KdRhMPT6Xf8rJgGgU2jdXy0oAqBiiAzvHajDsKFVy57OqoWRQMSJ/g8sFsIQUxhdH00YMyBhlnvO/hnEYSDk+l3+GzYhsGNo7W89SALAYpgdDy2ow8ChVcuuzqqFgUDEie4PLBbiEFMYXS89GDMgYZZ7zv4ZxGEw5PpN7hsmEbBjaN1fLSgSsGKIDO8dmLOwoUXLrr6qdZFAxIoODywW4hBTCE0fPRgzIGGWa87+GcRRIOT6Td4bFhGwY2jdXy0oErBiiAzvHZizsKFFy66+unWBQMR5/f8sFuIQUwhdHy0YQyBhhnu+/hnEURDk6k3eCxYRsGNo3V8dKAKgYpgM7x2Is7ChRbuuvqp1gUDEef3/K/biEFMITR8tGEMgYYZrvv4ZtFEQ5OpN3gsWEbBjWM1fHSgCoGKIDO8NiKOwoUW7ns6qdXFAxHnt/yv24gBS+D0fLRhDMGGGa67+CbRRANTqPd4LBgGwY1i9Tx0n8qBieAze/YijoKFFq46+mmVxMLRp3e8b5tIAUugM/y0IQzBhdmuu/gmkQQDU2j3d+wYBsGNYvU8dJ/KQYngM3v14k6ChRauOroplcTCUWc3vG+bB8FLn/P8s+DMAYXZrjv3phDDwxNo9vfsF4aBDSK1PDP');
      audio.play().catch(() => {});
    } catch (e) {
      // Ignorar erros de audio
    }
  }, []);

  const formatarTempo = useCallback((segundos: number) => {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = segundos % 60;
    
    if (horas > 0) {
      return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
    }
    return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  }, []);

  const togglePausar = useCallback(() => {
    setRodando(prev => {
      if (prev && onPause) onPause();
      if (!prev && onResume) onResume();
      return !prev;
    });
  }, [onPause, onResume]);

  const resetar = useCallback(() => {
    setSegundosRestantes(tempoInicialRef.current);
    setIntervaloAtual(0);
    setEmPausa(false);
    setRodando(true);
    setAlertaExibido(false);
  }, []);

  const togglePomodoro = useCallback(() => {
    setModoPomodoro(prev => !prev);
    setIntervaloAtual(0);
    setEmPausa(false);
  }, []);

  // Calcular progresso
  const progressoTempo = ((tempoInicialRef.current - segundosRestantes) / tempoInicialRef.current) * 100;
  const progressoPomodoro = modoPomodoro 
    ? (intervaloAtual / (emPausa ? INTERVALO_PAUSA : INTERVALO_TRABALHO)) * 100
    : 0;

  // Determinar cor do timer
  const getCorTempo = () => {
    if (segundosRestantes <= 60) return 'text-destructive animate-pulse';
    if (segundosRestantes <= 300) return 'text-destructive';
    if (segundosRestantes <= 600) return 'text-warning';
    return 'text-primary';
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            {segundosRestantes <= 300 ? (
              <AlertTriangle className={`h-6 w-6 ${getCorTempo()}`} />
            ) : (
              <Clock className={`h-6 w-6 ${getCorTempo()}`} />
            )}
          </div>
          <div>
            <div className={`text-2xl font-bold font-mono ${getCorTempo()}`}>
              {formatarTempo(segundosRestantes)}
            </div>
            {modoPomodoro && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Timer className="h-3 w-3" />
                {emPausa ? 'Pausa' : 'Foco'} - {formatarTempo(emPausa ? INTERVALO_PAUSA - intervaloAtual : INTERVALO_TRABALHO - intervaloAtual)}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePausar}
            title={rodando ? 'Pausar' : 'Continuar'}
          >
            {rodando ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={resetar}
            title="Resetar timer"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant={modoPomodoro ? "secondary" : "ghost"}
            size="sm"
            onClick={togglePomodoro}
            title="Modo Pomodoro (25min foco / 5min pausa)"
            className="text-xs"
          >
            Pomodoro
          </Button>
        </div>
      </div>
      
      {/* Barra de progresso do tempo */}
      <Progress 
        value={progressoTempo} 
        className="h-1.5 mt-3" 
      />
      
      {/* Barra de progresso do Pomodoro */}
      {modoPomodoro && (
        <div className="mt-2">
          <Progress 
            value={progressoPomodoro} 
            className={`h-1 ${emPausa ? 'bg-success/20' : 'bg-primary/20'}`}
          />
        </div>
      )}
    </Card>
  );
};
