import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Revisao {
  id: string;
  questao_id: string;
  proxima_revisao: string;
  intervalo_dias: number;
  facilidade: number;
  acertos_consecutivos: number;
  ultima_resposta: boolean | null;
  questao: {
    enunciado: string;
    alternativa_a: string;
    alternativa_b: string;
    alternativa_c: string;
    alternativa_d: string;
    alternativa_e: string | null;
    gabarito: string;
    explicacao: string | null;
    disciplina: { nome: string } | null;
  };
}

export const useRevisao = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const calcularProximaRevisao = (
    facilidade: number,
    acertos: number,
    correto: boolean
  ) => {
    let novaFacilidade = facilidade;
    let novosAcertos = correto ? acertos + 1 : 0;
    
    if (correto) {
      novaFacilidade = Math.min(facilidade + 0.1, 2.5);
    } else {
      novaFacilidade = Math.max(facilidade - 0.2, 1.3);
    }

    // Algoritmo de repetição espaçada (SM-2)
    let intervalo: number;
    if (novosAcertos === 0) {
      intervalo = 1;
    } else if (novosAcertos === 1) {
      intervalo = 3;
    } else {
      intervalo = Math.round(
        Math.pow(novaFacilidade, novosAcertos - 1) * 3
      );
    }

    const proximaData = new Date();
    proximaData.setDate(proximaData.getDate() + intervalo);

    return {
      facilidade: novaFacilidade,
      acertos: novosAcertos,
      intervalo,
      proximaData: proximaData.toISOString().split('T')[0]
    };
  };

  const adicionarRevisao = async (questaoId: string, correto: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Verificar se já existe revisão
      const { data: existente } = await supabase
        .from('revisoes')
        .select('*')
        .eq('user_id', user.id)
        .eq('questao_id', questaoId)
        .single();

      if (existente) {
        // Atualizar revisão existente
        const nova = calcularProximaRevisao(
          existente.facilidade,
          existente.acertos_consecutivos,
          correto
        );

        const { error } = await supabase
          .from('revisoes')
          .update({
            proxima_revisao: nova.proximaData,
            intervalo_dias: nova.intervalo,
            facilidade: nova.facilidade,
            acertos_consecutivos: nova.acertos,
            ultima_resposta: correto
          })
          .eq('id', existente.id);

        if (error) throw error;
      } else {
        // Criar nova revisão
        const nova = calcularProximaRevisao(2.5, 0, correto);

        const { error } = await supabase
          .from('revisoes')
          .insert({
            user_id: user.id,
            questao_id: questaoId,
            proxima_revisao: nova.proximaData,
            intervalo_dias: nova.intervalo,
            facilidade: nova.facilidade,
            acertos_consecutivos: nova.acertos,
            ultima_resposta: correto
          });

        if (error) throw error;
      }

      return true;
    } catch (error: any) {
      console.error('Erro ao adicionar revisão:', error);
      return false;
    }
  };

  const listarRevisoesPendentes = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const hoje = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('revisoes')
        .select(`
          *,
          questao:questoes (
            enunciado,
            alternativa_a,
            alternativa_b,
            alternativa_c,
            alternativa_d,
            alternativa_e,
            gabarito,
            explicacao,
            disciplina:disciplinas (nome)
          )
        `)
        .eq('user_id', user.id)
        .lte('proxima_revisao', hoje)
        .order('proxima_revisao', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao listar revisões:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const contarRevisoesPorDia = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { hoje: 0, amanha: 0, proximos7dias: 0 };

      const hoje = new Date();
      const amanha = new Date(hoje);
      amanha.setDate(amanha.getDate() + 1);
      const proximos7 = new Date(hoje);
      proximos7.setDate(proximos7.getDate() + 7);

      const { count: hojeCount } = await supabase
        .from('revisoes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('proxima_revisao', hoje.toISOString().split('T')[0]);

      const { count: amanhaCount } = await supabase
        .from('revisoes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('proxima_revisao', amanha.toISOString().split('T')[0]);

      const { count: proximos7Count } = await supabase
        .from('revisoes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .lte('proxima_revisao', proximos7.toISOString().split('T')[0])
        .gte('proxima_revisao', hoje.toISOString().split('T')[0]);

      return {
        hoje: hojeCount || 0,
        amanha: amanhaCount || 0,
        proximos7dias: proximos7Count || 0
      };
    } catch (error) {
      console.error('Erro ao contar revisões:', error);
      return { hoje: 0, amanha: 0, proximos7dias: 0 };
    }
  };

  return {
    loading,
    adicionarRevisao,
    listarRevisoesPendentes,
    contarRevisoesPorDia
  };
};
