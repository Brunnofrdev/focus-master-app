import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

export interface DailyMission {
  id: string;
  titulo: string;
  descricao: string;
  tipo: 'estudo' | 'simulado' | 'revisao' | 'flashcard';
  meta: number;
  progresso: number;
  completed: boolean;
  disciplina?: string;
}

export interface CoachInsight {
  tipo: 'alerta' | 'sugestao' | 'conquista';
  titulo: string;
  descricao: string;
  acao?: { label: string; rota: string };
}

export const useAICoach = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const gerarMissoesDiarias = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const hoje = new Date().toISOString().split('T')[0];

      // Verificar se já existem missões para hoje
      const { data: missoesExistentes } = await supabase
        .from('daily_missions')
        .select('*')
        .eq('user_id', user.id)
        .eq('data', hoje)
        .maybeSingle();

      if (missoesExistentes) {
        return missoesExistentes.missoes as unknown as DailyMission[];
      }

      // Buscar dados para gerar missões inteligentes
      const [
        { data: revisoesPendentes },
        { count: flashcardsPendentes },
        { data: sessoesRecentes },
        { data: profile }
      ] = await Promise.all([
        supabase.from('revisoes').select('*').eq('user_id', user.id).lte('proxima_revisao', hoje),
        supabase.from('flashcards').select('*', { count: 'exact', head: true }).eq('user_id', user.id).lte('proxima_revisao', hoje),
        supabase.from('sessoes_estudo').select('disciplina_id, duracao_minutos, disciplinas(nome)').eq('user_id', user.id).order('data', { ascending: false }).limit(10),
        supabase.from('profiles').select('meta_horas_semanais').eq('id', user.id).single()
      ]);

      const metaHorasSemana = profile?.meta_horas_semanais || 20;
      const metaDiaria = Math.round((metaHorasSemana / 7) * 60); // em minutos

      // Identificar disciplinas menos estudadas
      const disciplinasEstudadas: Record<string, number> = {};
      sessoesRecentes?.forEach((s: any) => {
        const nome = s.disciplinas?.nome || 'Geral';
        disciplinasEstudadas[nome] = (disciplinasEstudadas[nome] || 0) + s.duracao_minutos;
      });

      const disciplinaMaisFrequente = Object.entries(disciplinasEstudadas)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || 'Direito Constitucional';

      // Gerar missões
      const missoes: DailyMission[] = [
        {
          id: 'estudo-1',
          titulo: `Estudar ${Math.round(metaDiaria / 2)} minutos`,
          descricao: `Foque em ${disciplinaMaisFrequente} hoje`,
          tipo: 'estudo',
          meta: Math.round(metaDiaria / 2),
          progresso: 0,
          completed: false,
          disciplina: disciplinaMaisFrequente
        }
      ];

      if ((revisoesPendentes?.length || 0) > 0) {
        missoes.push({
          id: 'revisao-1',
          titulo: `Revisar ${Math.min(revisoesPendentes?.length || 0, 15)} questões`,
          descricao: 'Questões pendentes no sistema de repetição espaçada',
          tipo: 'revisao',
          meta: Math.min(revisoesPendentes?.length || 0, 15),
          progresso: 0,
          completed: false
        });
      }

      if ((flashcardsPendentes || 0) > 0) {
        missoes.push({
          id: 'flashcard-1',
          titulo: `Revisar ${Math.min(flashcardsPendentes || 0, 20)} flashcards`,
          descricao: 'Mantenha seu conhecimento ativo',
          tipo: 'flashcard',
          meta: Math.min(flashcardsPendentes || 0, 20),
          progresso: 0,
          completed: false
        });
      }

      missoes.push({
        id: 'simulado-1',
        titulo: 'Fazer 10 questões de simulado',
        descricao: 'Teste seus conhecimentos com questões de concurso',
        tipo: 'simulado',
        meta: 10,
        progresso: 0,
        completed: false
      });

      // Salvar missões
      await supabase
        .from('daily_missions')
        .insert({
          user_id: user.id,
          data: hoje,
          missoes: missoes as unknown as Json
        });

      return missoes;
    } catch (error: any) {
      console.error('Erro ao gerar missões:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const obterInsights = useCallback(async (): Promise<CoachInsight[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const insights: CoachInsight[] = [];
      const hoje = new Date().toISOString().split('T')[0];
      const umaSemanaAtras = new Date();
      umaSemanaAtras.setDate(umaSemanaAtras.getDate() - 7);

      // Buscar dados
      const [
        { count: revisoesPendentes },
        { data: simuladosRecentes },
        { data: sessoesSemanais }
      ] = await Promise.all([
        supabase.from('revisoes').select('*', { count: 'exact', head: true }).eq('user_id', user.id).lte('proxima_revisao', hoje),
        supabase.from('simulados').select('nota_final, created_at').eq('user_id', user.id).eq('status', 'concluido').gte('created_at', umaSemanaAtras.toISOString()).order('created_at', { ascending: false }),
        supabase.from('sessoes_estudo').select('duracao_minutos').eq('user_id', user.id).gte('data', umaSemanaAtras.toISOString().split('T')[0])
      ]);

      // Alertas de revisão
      if ((revisoesPendentes || 0) > 10) {
        insights.push({
          tipo: 'alerta',
          titulo: 'Revisões acumulando!',
          descricao: `Você tem ${revisoesPendentes} questões pendentes. Não deixe acumular para não esquecer o conteúdo.`,
          acao: { label: 'Revisar agora', rota: '/review' }
        });
      }

      // Análise de desempenho em simulados
      if (simuladosRecentes && simuladosRecentes.length >= 2) {
        const notas = simuladosRecentes.map(s => s.nota_final || 0);
        const mediaRecente = notas.slice(0, 2).reduce((a, b) => a + b, 0) / 2;
        const mediaAnterior = notas.slice(2, 4).reduce((a, b) => a + b, 0) / Math.min(notas.length - 2, 2) || mediaRecente;

        if (mediaRecente < mediaAnterior - 10) {
          insights.push({
            tipo: 'alerta',
            titulo: 'Desempenho em queda',
            descricao: `Sua média caiu de ${mediaAnterior.toFixed(0)}% para ${mediaRecente.toFixed(0)}%. Reveja os conteúdos com dificuldade.`,
            acao: { label: 'Ver estatísticas', rota: '/statistics' }
          });
        } else if (mediaRecente > 80) {
          insights.push({
            tipo: 'conquista',
            titulo: 'Excelente desempenho!',
            descricao: `Você está acertando ${mediaRecente.toFixed(0)}% das questões. Continue assim!`
          });
        }
      }

      // Horas de estudo
      const horasSemana = sessoesSemanais?.reduce((acc, s) => acc + (s.duracao_minutos / 60), 0) || 0;
      if (horasSemana < 10) {
        insights.push({
          tipo: 'sugestao',
          titulo: 'Aumente suas horas de estudo',
          descricao: `Você estudou apenas ${horasSemana.toFixed(1)}h esta semana. Tente dedicar mais tempo.`,
          acao: { label: 'Iniciar sessão', rota: '/planner' }
        });
      }

      return insights;
    } catch (error) {
      console.error('Erro ao obter insights:', error);
      return [];
    }
  }, []);

  const atualizarProgressoMissao = useCallback(async (
    missaoId: string,
    incremento: number
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const hoje = new Date().toISOString().split('T')[0];
      
      const { data: missaoData } = await supabase
        .from('daily_missions')
        .select('missoes')
        .eq('user_id', user.id)
        .eq('data', hoje)
        .single();

      if (!missaoData) return;

      const missoes = missaoData.missoes as unknown as DailyMission[];
      const missaoAtualizada = missoes.map(m => {
        if (m.id === missaoId) {
          const novoProgresso = Math.min(m.meta, m.progresso + incremento);
          return {
            ...m,
            progresso: novoProgresso,
            completed: novoProgresso >= m.meta
          };
        }
        return m;
      });

      await supabase
        .from('daily_missions')
        .update({ missoes: missaoAtualizada as unknown as Json })
        .eq('user_id', user.id)
        .eq('data', hoje);

      // Verificar se completou todas
      const todasCompletas = missaoAtualizada.every(m => m.completed);
      if (todasCompletas) {
        toast({
          title: '🎉 Missões do dia completas!',
          description: 'Parabéns! Você completou todas as missões de hoje.'
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar missão:', error);
    }
  }, [toast]);

  return {
    loading,
    gerarMissoesDiarias,
    obterInsights,
    atualizarProgressoMissao
  };
};
