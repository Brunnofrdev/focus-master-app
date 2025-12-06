import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Flashcard {
  id: string;
  frente: string;
  verso: string;
  proxima_revisao: string;
  intervalo_dias: number;
  facilidade: number;
  acertos_consecutivos: number;
  origem: string;
  questao_id?: string;
  created_at: string;
}

interface FlashcardStats {
  total: number;
  pendentes: number;
  dominados: number;
  acertos: number;
  erros: number;
}

export const useFlashcards = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const criarFlashcard = useCallback(async (
    frente: string, 
    verso: string, 
    origem: string = 'manual',
    questaoId?: string
  ) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('flashcards')
        .insert({
          user_id: user.id,
          frente,
          verso,
          origem,
          questao_id: questaoId || null,
          proxima_revisao: new Date().toISOString().split('T')[0],
          intervalo_dias: 1,
          facilidade: 2.5,
          acertos_consecutivos: 0
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Flashcard criado!',
        description: 'Adicionado à sua fila de revisão.'
      });

      return data;
    } catch (error: any) {
      toast({
        title: 'Erro ao criar flashcard',
        description: error.message,
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const criarFlashcardsPorErro = useCallback(async (
    questaoId: string,
    enunciado: string,
    explicacao: string
  ) => {
    const frente = `Revisar: ${enunciado.substring(0, 200)}...`;
    const verso = explicacao || 'Revise a explicação da questão original.';
    
    return criarFlashcard(frente, verso, 'erro_simulado', questaoId);
  }, [criarFlashcard]);

  const listarFlashcards = useCallback(async (filtro?: 'pendentes' | 'todos' | 'dominados') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from('flashcards')
        .select('*')
        .eq('user_id', user.id)
        .order('proxima_revisao', { ascending: true });

      if (filtro === 'pendentes') {
        const hoje = new Date().toISOString().split('T')[0];
        query = query.lte('proxima_revisao', hoje);
      } else if (filtro === 'dominados') {
        query = query.gte('acertos_consecutivos', 3);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Erro ao listar flashcards:', error);
      return [];
    }
  }, []);

  const atualizarFlashcard = useCallback(async (
    flashcardId: string,
    dados: { frente?: string; verso?: string }
  ) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('flashcards')
        .update(dados)
        .eq('id', flashcardId);

      if (error) throw error;

      toast({
        title: 'Flashcard atualizado!',
        description: 'As alterações foram salvas.'
      });
      return true;
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar',
        description: error.message,
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const responderFlashcard = useCallback(async (
    flashcardId: string,
    qualidade: number // 0-5: 0=esqueceu, 5=perfeito
  ) => {
    try {
      const { data: flashcard, error: fetchError } = await supabase
        .from('flashcards')
        .select('*')
        .eq('id', flashcardId)
        .single();

      if (fetchError) throw fetchError;

      let novaFacilidade = Number(flashcard.facilidade) || 2.5;
      let novoIntervalo = flashcard.intervalo_dias || 1;
      let novosAcertos = flashcard.acertos_consecutivos || 0;

      if (qualidade < 3) {
        // Errou - resetar
        novosAcertos = 0;
        novoIntervalo = 1;
        novaFacilidade = Math.max(1.3, novaFacilidade - 0.2);
      } else {
        // Acertou - aplicar SM-2
        novosAcertos++;
        
        // Fórmula SM-2 para facilidade
        novaFacilidade = novaFacilidade + (0.1 - (5 - qualidade) * (0.08 + (5 - qualidade) * 0.02));
        novaFacilidade = Math.max(1.3, novaFacilidade);
        
        // Calcular próximo intervalo
        if (novosAcertos === 1) {
          novoIntervalo = 1;
        } else if (novosAcertos === 2) {
          novoIntervalo = 6;
        } else {
          novoIntervalo = Math.round(flashcard.intervalo_dias * novaFacilidade);
        }
        
        // Cap máximo de 180 dias
        novoIntervalo = Math.min(novoIntervalo, 180);
      }

      const proximaRevisao = new Date();
      proximaRevisao.setDate(proximaRevisao.getDate() + novoIntervalo);

      const { error } = await supabase
        .from('flashcards')
        .update({
          facilidade: novaFacilidade,
          intervalo_dias: novoIntervalo,
          acertos_consecutivos: novosAcertos,
          proxima_revisao: proximaRevisao.toISOString().split('T')[0]
        })
        .eq('id', flashcardId);

      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error('Erro ao responder flashcard:', error);
      return false;
    }
  }, []);

  const deletarFlashcard = useCallback(async (flashcardId: string) => {
    try {
      const { error } = await supabase
        .from('flashcards')
        .delete()
        .eq('id', flashcardId);

      if (error) throw error;

      toast({
        title: 'Flashcard removido',
        description: 'O flashcard foi excluído com sucesso.'
      });
      return true;
    } catch (error: any) {
      toast({
        title: 'Erro ao remover flashcard',
        description: error.message,
        variant: 'destructive'
      });
      return false;
    }
  }, [toast]);

  const contarFlashcardsPendentes = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const hoje = new Date().toISOString().split('T')[0];
      const { count, error } = await supabase
        .from('flashcards')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .lte('proxima_revisao', hoje);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Erro ao contar flashcards:', error);
      return 0;
    }
  }, []);

  const obterEstatisticas = useCallback(async (): Promise<FlashcardStats> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { total: 0, pendentes: 0, dominados: 0, acertos: 0, erros: 0 };

      const hoje = new Date().toISOString().split('T')[0];
      
      const { data: flashcards, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const todos = flashcards || [];
      const total = todos.length;
      const pendentes = todos.filter(f => f.proxima_revisao <= hoje).length;
      const dominados = todos.filter(f => f.acertos_consecutivos >= 3).length;
      
      // Calcular acertos e erros baseado no histórico de acertos consecutivos
      const acertos = todos.reduce((acc, f) => acc + (f.acertos_consecutivos || 0), 0);
      const erros = todos.filter(f => f.intervalo_dias === 1 && f.acertos_consecutivos === 0).length;

      return { total, pendentes, dominados, acertos, erros };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return { total: 0, pendentes: 0, dominados: 0, acertos: 0, erros: 0 };
    }
  }, []);

  return {
    loading,
    criarFlashcard,
    criarFlashcardsPorErro,
    listarFlashcards,
    atualizarFlashcard,
    responderFlashcard,
    deletarFlashcard,
    contarFlashcardsPendentes,
    obterEstatisticas
  };
};