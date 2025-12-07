import { useState, useCallback } from 'react';
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
  nota_final: number | null;
}

export interface SimuladoFiltros {
  bancaId?: string;
  disciplinasIds?: string[];
  dificuldade?: 'facil' | 'medio' | 'dificil';
  quantidade: number;
}

export const useSimulados = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Buscar bancas que possuem questões ativas
  const listarBancasComQuestoes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('bancas')
        .select('id, nome, sigla')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;

      // Verificar quais bancas têm questões
      const bancasComQuestoes = [];
      for (const banca of data || []) {
        const { count } = await supabase
          .from('questoes')
          .select('id', { count: 'exact', head: true })
          .eq('banca_id', banca.id)
          .eq('status', 'ativo');
        
        if (count && count > 0) {
          bancasComQuestoes.push({ ...banca, totalQuestoes: count });
        }
      }

      return bancasComQuestoes;
    } catch (error) {
      console.error('Erro ao listar bancas:', error);
      return [];
    }
  }, []);

  // Buscar disciplinas que possuem questões ativas
  const listarDisciplinasComQuestoes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('disciplinas')
        .select('id, nome')
        .order('nome');

      if (error) throw error;

      // Verificar quais disciplinas têm questões
      const disciplinasComQuestoes = [];
      for (const disc of data || []) {
        const { count } = await supabase
          .from('questoes')
          .select('id', { count: 'exact', head: true })
          .eq('disciplina_id', disc.id)
          .eq('status', 'ativo');
        
        if (count && count > 0) {
          disciplinasComQuestoes.push({ ...disc, totalQuestoes: count });
        }
      }

      return disciplinasComQuestoes;
    } catch (error) {
      console.error('Erro ao listar disciplinas:', error);
      return [];
    }
  }, []);

  // Contar questões disponíveis com filtros
  const contarQuestoesDisponiveis = useCallback(async (filtros: Partial<SimuladoFiltros>) => {
    try {
      let query = supabase
        .from('questoes')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'ativo');

      if (filtros.bancaId) {
        query = query.eq('banca_id', filtros.bancaId);
      }

      if (filtros.disciplinasIds && filtros.disciplinasIds.length > 0) {
        query = query.in('disciplina_id', filtros.disciplinasIds);
      }

      if (filtros.dificuldade) {
        query = query.eq('dificuldade', filtros.dificuldade);
      }

      const { count, error } = await query;

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Erro ao contar questões:', error);
      return 0;
    }
  }, []);

  // Criar simulado com validações robustas
  const criarSimulado = async (
    titulo: string, 
    quantidade: number, 
    bancaId?: string, 
    disciplinasIds?: string[],
    dificuldade?: 'facil' | 'medio' | 'dificil',
    tempoMinutos?: number
  ) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: 'Erro de autenticação',
          description: 'Você precisa estar logado para criar um simulado',
          variant: 'destructive'
        });
        return null;
      }

      // Construir query para buscar questões
      let query = supabase
        .from('questoes')
        .select('*')
        .eq('status', 'ativo');
      
      if (bancaId) {
        query = query.eq('banca_id', bancaId);
      }
      
      if (disciplinasIds && disciplinasIds.length > 0) {
        query = query.in('disciplina_id', disciplinasIds);
      }

      if (dificuldade) {
        query = query.eq('dificuldade', dificuldade);
      }
      
      const { data: questoes, error: questoesError } = await query;

      if (questoesError) {
        console.error('Erro ao buscar questões:', questoesError);
        throw new Error('Erro ao buscar questões: ' + questoesError.message);
      }

      if (!questoes || questoes.length === 0) {
        let erroMsg = 'Não há questões disponíveis';
        
        if (bancaId && disciplinasIds?.length) {
          erroMsg += ' para a banca e disciplinas selecionadas.';
        } else if (bancaId) {
          erroMsg += ' para a banca selecionada.';
        } else if (disciplinasIds?.length) {
          erroMsg += ' para as disciplinas selecionadas.';
        } else {
          erroMsg += ' no sistema.';
        }
        
        erroMsg += ' Tente remover alguns filtros.';
        
        toast({
          title: 'Sem questões disponíveis',
          description: erroMsg,
          variant: 'destructive'
        });
        return null;
      }
      
      // Embaralhar questões usando Fisher-Yates
      const questoesEmbaralhadas = [...questoes];
      for (let i = questoesEmbaralhadas.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questoesEmbaralhadas[i], questoesEmbaralhadas[j]] = [questoesEmbaralhadas[j], questoesEmbaralhadas[i]];
      }

      const questoesSelecionadas = questoesEmbaralhadas.slice(0, quantidade);
      
      if (questoesSelecionadas.length < quantidade) {
        toast({
          title: 'Aviso',
          description: `Apenas ${questoesSelecionadas.length} questões disponíveis com os filtros selecionados.`,
          variant: 'default'
        });
      }

      // Calcular tempo baseado na quantidade (3 min por questão por padrão)
      const tempoCalculado = tempoMinutos || Math.max(60, questoesSelecionadas.length * 3);

      // Criar simulado
      const { data: simulado, error: simuladoError } = await supabase
        .from('simulados')
        .insert({
          user_id: user.id,
          titulo,
          total_questoes: questoesSelecionadas.length,
          tempo_limite_minutos: tempoCalculado,
          status: 'nao_iniciado',
          banca_id: bancaId || null,
          acertos: 0,
          nota_final: 0
        })
        .select()
        .single();

      if (simuladoError) {
        console.error('Erro ao criar simulado:', simuladoError);
        throw simuladoError;
      }

      // Adicionar questões ao simulado
      const simuladoQuestoes = questoesSelecionadas.map((q, index) => ({
        simulado_id: simulado.id,
        questao_id: q.id,
        ordem: index + 1,
        marcada_revisao: false,
        correto: null,
        resposta_usuario: null,
        tempo_resposta_segundos: null
      }));

      const { error: insertError } = await supabase
        .from('simulado_questoes')
        .insert(simuladoQuestoes);

      if (insertError) {
        // Rollback - deletar simulado criado
        await supabase.from('simulados').delete().eq('id', simulado.id);
        throw insertError;
      }

      toast({
        title: 'Simulado criado com sucesso!',
        description: `${questoesSelecionadas.length} questões adicionadas. Tempo: ${tempoCalculado} minutos.`
      });

      return simulado;
    } catch (error: any) {
      console.error('Erro ao criar simulado:', error);
      toast({
        title: 'Erro ao criar simulado',
        description: error.message || 'Erro desconhecido',
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Iniciar simulado
  const iniciarSimulado = async (simuladoId: string) => {
    try {
      setLoading(true);

      // Verificar se simulado existe e pertence ao usuário
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: simulado, error: checkError } = await supabase
        .from('simulados')
        .select('id, status, user_id')
        .eq('id', simuladoId)
        .single();

      if (checkError || !simulado) {
        throw new Error('Simulado não encontrado');
      }

      if (simulado.user_id !== user.id) {
        throw new Error('Você não tem permissão para acessar este simulado');
      }

      // Se já está em andamento, apenas retornar sucesso
      if (simulado.status === 'em_andamento') {
        return true;
      }

      // Se já foi concluído, não permitir reiniciar
      if (simulado.status === 'concluido') {
        toast({
          title: 'Simulado já concluído',
          description: 'Este simulado já foi finalizado. Veja os resultados ou crie um novo.',
          variant: 'default'
        });
        return false;
      }

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
        description: 'Boa sorte! O tempo já está contando.'
      });

      return true;
    } catch (error: any) {
      console.error('Erro ao iniciar simulado:', error);
      toast({
        title: 'Erro ao iniciar simulado',
        description: error.message,
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Responder questão com salvamento automático
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

      if (error) {
        console.error('Erro ao salvar resposta:', error);
        return false;
      }
      return true;
    } catch (error: any) {
      console.error('Erro ao salvar resposta:', error);
      return false;
    }
  };

  // Salvar progresso do simulado
  const salvarProgresso = async (simuladoId: string, questoesRespondidas: number) => {
    try {
      // Atualizar timestamp para indicar atividade
      await supabase
        .from('simulados')
        .update({ 
          // Pode ser usado para tracking de progresso
        })
        .eq('id', simuladoId);
      
      return true;
    } catch (error) {
      console.error('Erro ao salvar progresso:', error);
      return false;
    }
  };

  // Finalizar simulado com cálculos completos
  const finalizarSimulado = async (simuladoId: string) => {
    try {
      setLoading(true);

      // Buscar questões e respostas
      const { data: questoes, error: questoesError } = await supabase
        .from('simulado_questoes')
        .select(`
          *,
          questoes (gabarito, disciplina_id)
        `)
        .eq('simulado_id', simuladoId);

      if (questoesError) throw questoesError;

      if (!questoes || questoes.length === 0) {
        throw new Error('Nenhuma questão encontrada no simulado.');
      }

      // Calcular acertos e atualizar cada questão
      let acertos = 0;
      let tempoTotal = 0;

      const updatePromises = questoes.map(async (q) => {
        const correto = q.resposta_usuario === q.questoes?.gabarito;
        if (correto) acertos++;
        if (q.tempo_resposta_segundos) tempoTotal += q.tempo_resposta_segundos;
        
        return supabase
          .from('simulado_questoes')
          .update({ correto })
          .eq('id', q.id);
      });

      await Promise.all(updatePromises);

      // Calcular nota final
      const notaFinal = parseFloat(((acertos / questoes.length) * 100).toFixed(2));

      // Atualizar simulado
      const { error } = await supabase
        .from('simulados')
        .update({
          status: 'concluido',
          concluido_em: new Date().toISOString(),
          acertos,
          nota_final: notaFinal
        })
        .eq('id', simuladoId);

      if (error) throw error;

      toast({
        title: 'Simulado finalizado!',
        description: `Você acertou ${acertos} de ${questoes.length} questões (${notaFinal}%)`
      });

      return { 
        acertos, 
        total: questoes.length, 
        nota: notaFinal,
        tempoTotal 
      };
    } catch (error: any) {
      console.error('Erro ao finalizar simulado:', error);
      toast({
        title: 'Erro ao finalizar simulado',
        description: error.message,
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Listar simulados do usuário
  const listarSimulados = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('simulados')
        .select(`
          *,
          bancas (nome, sigla)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao listar simulados:', error);
      return [];
    }
  };

  // Buscar detalhes de um simulado
  const buscarSimulado = async (simuladoId: string) => {
    try {
      const { data, error } = await supabase
        .from('simulados')
        .select(`
          *,
          bancas (nome, sigla)
        `)
        .eq('id', simuladoId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar simulado:', error);
      return null;
    }
  };

  // Buscar questões de um simulado
  const buscarQuestoesSimulado = async (simuladoId: string) => {
    try {
      const { data, error } = await supabase
        .from('simulado_questoes')
        .select(`
          id,
          ordem,
          marcada_revisao,
          resposta_usuario,
          tempo_resposta_segundos,
          correto,
          questoes (
            id,
            enunciado,
            alternativa_a,
            alternativa_b,
            alternativa_c,
            alternativa_d,
            alternativa_e,
            gabarito,
            explicacao,
            dificuldade,
            disciplinas (nome)
          )
        `)
        .eq('simulado_id', simuladoId)
        .order('ordem');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar questões:', error);
      return [];
    }
  };

  // Excluir simulado
  const excluirSimulado = async (simuladoId: string) => {
    try {
      setLoading(true);

      // Primeiro excluir as questões do simulado
      const { error: questoesError } = await supabase
        .from('simulado_questoes')
        .delete()
        .eq('simulado_id', simuladoId);

      if (questoesError) throw questoesError;

      // Depois excluir o simulado
      const { error } = await supabase
        .from('simulados')
        .delete()
        .eq('id', simuladoId);

      if (error) throw error;

      toast({
        title: 'Simulado excluído',
        description: 'O simulado foi removido com sucesso.'
      });

      return true;
    } catch (error: any) {
      console.error('Erro ao excluir simulado:', error);
      toast({
        title: 'Erro ao excluir',
        description: error.message,
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Estatísticas gerais do usuário
  const buscarEstatisticas = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: simulados } = await supabase
        .from('simulados')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'concluido');

      if (!simulados || simulados.length === 0) {
        return {
          totalSimulados: 0,
          mediaGeral: 0,
          totalQuestoes: 0,
          totalAcertos: 0,
          melhorNota: 0,
          piorNota: 0
        };
      }

      const totalSimulados = simulados.length;
      const totalQuestoes = simulados.reduce((acc, s) => acc + (s.total_questoes || 0), 0);
      const totalAcertos = simulados.reduce((acc, s) => acc + (s.acertos || 0), 0);
      const notas = simulados.map(s => s.nota_final || 0);
      const mediaGeral = notas.reduce((a, b) => a + b, 0) / notas.length;
      const melhorNota = Math.max(...notas);
      const piorNota = Math.min(...notas);

      return {
        totalSimulados,
        mediaGeral: parseFloat(mediaGeral.toFixed(2)),
        totalQuestoes,
        totalAcertos,
        melhorNota,
        piorNota
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return null;
    }
  };

  return {
    loading,
    criarSimulado,
    iniciarSimulado,
    responderQuestao,
    salvarProgresso,
    finalizarSimulado,
    listarSimulados,
    buscarSimulado,
    buscarQuestoesSimulado,
    excluirSimulado,
    buscarEstatisticas,
    listarBancasComQuestoes,
    listarDisciplinasComQuestoes,
    contarQuestoesDisponiveis
  };
};
