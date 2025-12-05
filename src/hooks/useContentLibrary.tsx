import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ContentItem {
  id: string;
  titulo: string;
  conteudo: string;
  tipo: 'resumo' | 'mapa_mental' | 'lei' | 'exemplo';
  disciplina_id?: string;
  disciplina?: { nome: string };
  tags: string[];
  is_public: boolean;
  created_at: string;
}

export const useContentLibrary = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const listarConteudos = useCallback(async (filtros?: {
    tipo?: string;
    disciplinaId?: string;
    busca?: string;
  }) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      let query = supabase
        .from('content_library')
        .select('*, disciplinas(nome)')
        .order('created_at', { ascending: false });

      // Filtrar por público ou próprio do usuário
      if (user) {
        query = query.or(`is_public.eq.true,user_id.eq.${user.id}`);
      } else {
        query = query.eq('is_public', true);
      }

      if (filtros?.tipo) {
        query = query.eq('tipo', filtros.tipo);
      }

      if (filtros?.disciplinaId) {
        query = query.eq('disciplina_id', filtros.disciplinaId);
      }

      if (filtros?.busca) {
        query = query.or(`titulo.ilike.%${filtros.busca}%,conteudo.ilike.%${filtros.busca}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(item => ({
        ...item,
        disciplina: item.disciplinas
      })) as ContentItem[];
    } catch (error: any) {
      console.error('Erro ao listar conteúdos:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const criarConteudo = useCallback(async (conteudo: {
    titulo: string;
    conteudo: string;
    tipo: string;
    disciplinaId?: string;
    tags?: string[];
    isPublic?: boolean;
  }) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('content_library')
        .insert({
          user_id: user.id,
          titulo: conteudo.titulo,
          conteudo: conteudo.conteudo,
          tipo: conteudo.tipo,
          disciplina_id: conteudo.disciplinaId || null,
          tags: conteudo.tags || [],
          is_public: conteudo.isPublic || false
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Conteúdo salvo!',
        description: 'Adicionado à sua biblioteca.'
      });

      return data;
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar conteúdo',
        description: error.message,
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deletarConteudo = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('content_library')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Conteúdo removido',
        description: 'O item foi excluído da biblioteca.'
      });
      return true;
    } catch (error: any) {
      toast({
        title: 'Erro ao remover',
        description: error.message,
        variant: 'destructive'
      });
      return false;
    }
  }, [toast]);

  return {
    loading,
    listarConteudos,
    criarConteudo,
    deletarConteudo
  };
};
