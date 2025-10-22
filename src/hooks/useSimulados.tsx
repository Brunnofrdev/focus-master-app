import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Questao {
  id: string;
  enunciado: string;
  alternativa_a: string;
  alternativa_b: string;
  alternativa_c: string;
  alternativa_d: string;
  alternativa_e: string | null;
  gabarito: string;
  explicacao: string | null;
  disciplina_id: string | null;
  banca_id: string | null;
  dificuldade: string;
}

export interface Simulado {
  id: string;
  titulo: string;
  descricao: string | null;
  status: string;
  tempo_limite_minutos: number | null;
  total_questoes: number;
  acertos: number;
  iniciado_em: string | null;
  concluido_em: string | null;
}

export const useSimulados = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const criarSimulado = async (titulo: string, quantidadeQuestoes: number, bancaId?: string) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Usuário não autenticado');

      // Buscar questões aleatórias
      let query = supabase
        .from('questoes')
        .select('*')
        .eq('status', 'ativo');
      
      // Filtrar por banca se especificada
      if (bancaId && bancaId !== 'todas') {
        query = query.eq('banca_id', bancaId);
      }
      
      const { data: questoes, error: questoesError } = await query.limit(quantidadeQuestoes);

      if (questoesError) throw questoesError;
      if (!questoes || questoes.length === 0) {
        throw new Error('Não há questões disponíveis');
      }

      // Criar simulado
      const { data: simulado, error: simuladoError } = await supabase
        .from('simulados')
        .insert({
          user_id: user.id,
          titulo,
          total_questoes: questoes.length,
          tempo_limite_minutos: 180,
          status: 'nao_iniciado',
          banca_id: bancaId && bancaId !== 'todas' ? bancaId : null
        })
        .select()
        .single();

      if (simuladoError) throw simuladoError;

      // Embaralhar questões usando Fisher-Yates
      const questoesEmbaralhadas = [...questoes];
      for (let i = questoesEmbaralhadas.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questoesEmbaralhadas[i], questoesEmbaralhadas[j]] = [questoesEmbaralhadas[j], questoesEmbaralhadas[i]];
      }

      // Adicionar questões ao simulado
      const simuladoQuestoes = questoesEmbaralhadas.map((q, index) => ({
        simulado_id: simulado.id,
        questao_id: q.id,
        ordem: index + 1
      }));

      const { error: insertError } = await supabase
        .from('simulado_questoes')
        .insert(simuladoQuestoes);

      if (insertError) throw insertError;

      toast({
        title: 'Simulado criado!',
        description: `${questoes.length} questões adicionadas.`
      });

      return simulado;
    } catch (error: any) {
      toast({
        title: 'Erro ao criar simulado',
        description: error.message,
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const iniciarSimulado = async (simuladoId: string) => {
    try {
      const { error } = await supabase
        .from('simulados')
        .update({
          status: 'em_andamento',
          iniciado_em: new Date().toISOString()
        })
        .eq('id', simuladoId);

      if (error) throw error;

      toast({
        title: 'Simulado iniciado!',
        description: 'Boa sorte!'
      });

      return true;
    } catch (error: any) {
      toast({
        title: 'Erro ao iniciar simulado',
        description: error.message,
        variant: 'destructive'
      });
      return false;
    }
  };

  const responderQuestao = async (
    simuladoQuestaoId: string, 
    resposta: string,
    tempoSegundos: number
  ) => {
    try {
      const { error } = await supabase
        .from('simulado_questoes')
        .update({
          resposta_usuario: resposta,
          tempo_resposta_segundos: tempoSegundos
        })
        .eq('id', simuladoQuestaoId);

      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error('Erro ao salvar resposta:', error);
      return false;
    }
  };

  const finalizarSimulado = async (simuladoId: string) => {
    try {
      // Buscar questões e respostas
      const { data: questoes, error: questoesError } = await supabase
        .from('simulado_questoes')
        .select(`
          *,
          questoes (gabarito)
        `)
        .eq('simulado_id', simuladoId);

      if (questoesError) throw questoesError;

      // Calcular acertos
      let acertos = 0;
      const updates = questoes?.map(q => {
        const correto = q.resposta_usuario === q.questoes?.gabarito;
        if (correto) acertos++;
        
        return supabase
          .from('simulado_questoes')
          .update({ correto })
          .eq('id', q.id);
      });

      await Promise.all(updates || []);

      // Atualizar simulado
      const { error } = await supabase
        .from('simulados')
        .update({
          status: 'concluido',
          concluido_em: new Date().toISOString(),
          acertos,
          nota_final: parseFloat(((acertos / (questoes?.length || 1)) * 100).toFixed(2))
        })
        .eq('id', simuladoId);

      if (error) throw error;

      toast({
        title: 'Simulado finalizado!',
        description: `Você acertou ${acertos} de ${questoes?.length} questões.`
      });

      return { acertos, total: questoes?.length || 0 };
    } catch (error: any) {
      toast({
        title: 'Erro ao finalizar simulado',
        description: error.message,
        variant: 'destructive'
      });
      return null;
    }
  };

  const listarSimulados = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('simulados')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao listar simulados:', error);
      return [];
    }
  };

  return {
    loading,
    criarSimulado,
    iniciarSimulado,
    responderQuestao,
    finalizarSimulado,
    listarSimulados
  };
};
