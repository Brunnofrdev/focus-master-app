import { useState, useEffect, useRef } from 'react';

export const usePomodoro = (initialMinutes: number = 25) => {
  const [minutes, setMinutes] = useState(initialMinutes);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [sessoes, setSessoes] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Criar elemento de áudio para notificação
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA8PVqzn77BdGAg+ltryxnMpBSh+y/LaizsIGGS57OihUBELTKXh8bllHAU2jdXzzn4vBSF1xe/glEILElyx6+mrWBUIQ5zi8sFuJAUthM/z1YU2Bhxqvu7mnEoODlOq5O+zYBoGPJPY8sp2KwUme8rx3I4+CRZiturqpVITC0mi4PK8aB8GM4nU8tGAMQYfcsLu45ZFDBFYr+ftrVwZBz6Y2vPCcycFKoHN89uLNwkZaLvt559NEAxPqOPwtmMcBjiP1/PMeS0GI3fH8N2RQAoUXrTp66hVFApGnt/yvmwhBTCG0fPTgjMHHW/A7eSaRw8PVqzl77BeGQc9ltvyxXMpBSh+zPPaizsIGGS56+mjTxELTKXh8bllHAU1jdXzzn4vBSJ0xe/glEILElyx6+mrWBUIQ5zg8sFuJAUthM/z1YU2Bhxqvu7mnEoODlOq5O+zYBoGPJPY8sp2KwUme8rx3I4+CRZiturqpVITC0mi4PK8aB8GM4rU8tGAMQYfccLu45ZFDBFYr+ftrVwZBz6Y2vPCcycFKoHN89uLNwkZaLvt559NEAxPqOPwtmMcBjiP1/PMeS0GI3fH8N2RQAoUXrTp66hVFApGnt/yvmwhBTCG0fPTgjMHHW/A7eSaRw8PVqzl77BeGQc9ltvyxXMpBSh+zPPaizsIGGS56+mjTxELTKXh8bllHAU1jdXzzn4vBSJ0xe/glEILElyx6+mrWBUIQ5zg8sFuJAUthM/z1YU2Bhxqvu7mnEoODlOq5O+zYBoGPJPY8sp2KwUme8rx3I4+CRZiturqpVITC0mi4PK8aB8GM4rU8tGAMQYfccLu45ZFDBFYr+ftrVwZBz6Y2vPCcycFKoHN89uLOAkZZ7zs6J9NEAxPqOPwtmMcBjiP1/PMeS0GI3fH8N2RQAoUXrTp66hVFApGnt/yvmwhBTCG0fPTgjMHHW/A7eSaRw8PVqzl77BeGQc9ltvyxXMpBSh+zPPaizsIGGS56+mjTxELTKXh8bllHAU1jdXzzn4vBSJ0xe/glEILElyx6+mrWBUIQ5zg8sFuJAUthM/z1YU2Bhxqvu7mnEoODlOq5O+zYBoGPJPY8sp2KwUme8rx3I4+CRZiturqpVITC0mi4PK8aB8GM4rU8tGAMQYfccLu45ZFDBFYr+ftrVwZBz6Y2vPCcycFKoHN89uLNwkZaLvt559NEAxPqOPwtmMcBjiP1/PMeS0GI3fH8N2RQAoUXrTp66hVFApGnt/yvmwhBTCG0fPTgjMHHW/A7eSaRw8PVqzl77BeGQc9ltvyxXMpBSh+zPPaizsIGGS56+mjTxELTKXh8bllHAU1jdXzzn4vBSJ0xe/glEILElyx6+mrWBUIQ5zg8sFuJAUthM/z1YU2Bhxqvu7mnEoODlOq5O+zYBoGPJPY8sp2KwUme8rx3I4+CRZiturqpVITC0mi4PK8aB8GM4rU8tGAMQYfccLu45ZFDBFYr+ftrVwZBz6Y2vPCcycFKoHN89uLNwkZaLvt559NEAxPqOPwtmMcBjiP1/PMeS0GI3fH8N2RQAoUXrTp66hVFApGnt/yvmwhBTCG0fPTgjMHHW/A7eSaRw8PVqzl77BeGQc9ltv==');
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Timer terminou
            setIsRunning(false);
            setSessoes(prev => prev + 1);
            
            // Tocar som e notificar
            if (audioRef.current) {
              audioRef.current.play().catch(e => console.log('Erro ao tocar som:', e));
            }
            
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Pomodoro Concluído!', {
                body: 'Hora de fazer uma pausa.',
                icon: '/favicon.ico'
              });
            }
            
            clearInterval(intervalRef.current!);
            return;
          }
          setMinutes(prev => prev - 1);
          setSeconds(59);
        } else {
          setSeconds(prev => prev - 1);
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, minutes, seconds]);

  const start = () => {
    // Solicitar permissão para notificações
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setIsRunning(true);
  };

  const pause = () => setIsRunning(false);

  const reset = (newMinutes: number = initialMinutes) => {
    setIsRunning(false);
    setMinutes(newMinutes);
    setSeconds(0);
  };

  const toggle = () => {
    if (isRunning) {
      pause();
    } else {
      start();
    }
  };

  return {
    minutes,
    seconds,
    isRunning,
    sessoes,
    start,
    pause,
    reset,
    toggle
  };
};
