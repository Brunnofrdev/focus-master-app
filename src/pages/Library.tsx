import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navigation } from '@/components/Navigation';
import { 
  BookOpen, 
  FileText, 
  Search,
  Filter,
  Plus,
  Loader2,
  MapPin,
  Scale,
  Lightbulb
} from 'lucide-react';
import { useContentLibrary, ContentItem } from '@/hooks/useContentLibrary';
import { supabase } from '@/integrations/supabase/client';

const Library = () => {
  const { listarConteudos, loading } = useContentLibrary();
  const [conteudos, setConteudos] = useState<ContentItem[]>([]);
  const [disciplinas, setDisciplinas] = useState<any[]>([]);
  const [filtros, setFiltros] = useState({
    tipo: '',
    disciplinaId: '',
    busca: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [conteudoSelecionado, setConteudoSelecionado] = useState<ContentItem | null>(null);

  useEffect(() => {
    carregarDados();
  }, [filtros]);

  useEffect(() => {
    carregarDisciplinas();
  }, []);

  const carregarDisciplinas = async () => {
    const { data } = await supabase.from('disciplinas').select('*').order('nome');
    setDisciplinas(data || []);
  };

  const carregarDados = async () => {
    setIsLoading(true);
    try {
      const data = await listarConteudos({
        tipo: filtros.tipo || undefined,
        disciplinaId: filtros.disciplinaId || undefined,
        busca: filtros.busca || undefined
      });
      setConteudos(data);
    } finally {
      setIsLoading(false);
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'resumo': return <FileText className="h-4 w-4" />;
      case 'mapa_mental': return <MapPin className="h-4 w-4" />;
      case 'lei': return <Scale className="h-4 w-4" />;
      case 'exemplo': return <Lightbulb className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'resumo': return 'Resumo';
      case 'mapa_mental': return 'Mapa Mental';
      case 'lei': return 'Legislação';
      case 'exemplo': return 'Exemplo Prático';
      default: return tipo;
    }
  };

  if (conteudoSelecionado) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navigation />
        
        <div className="container mx-auto px-4 py-8 pt-24">
          <Button 
            variant="outline" 
            className="mb-6"
            onClick={() => setConteudoSelecionado(null)}
          >
            ← Voltar
          </Button>

          <Card className="p-8">
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="secondary" className="gap-1">
                {getTipoIcon(conteudoSelecionado.tipo)}
                {getTipoLabel(conteudoSelecionado.tipo)}
              </Badge>
              {conteudoSelecionado.disciplina && (
                <Badge variant="outline">
                  {conteudoSelecionado.disciplina.nome}
                </Badge>
              )}
            </div>
            
            <h1 className="text-2xl font-bold mb-6">{conteudoSelecionado.titulo}</h1>
            
            <div className="prose prose-lg max-w-none dark:prose-invert">
              {conteudoSelecionado.conteudo.split('\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            {conteudoSelecionado.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t">
                <p className="text-sm text-muted-foreground mb-2">Tags:</p>
                <div className="flex flex-wrap gap-2">
                  {conteudoSelecionado.tags.map((tag, idx) => (
                    <Badge key={idx} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-primary" />
              Biblioteca de Conteúdos
            </h1>
            <p className="text-muted-foreground text-lg">
              Resumos, mapas mentais e materiais de estudo
            </p>
          </div>
        </div>

        {/* Filtros */}
        <Card className="p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar conteúdos..."
                className="pl-10"
                value={filtros.busca}
                onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
              />
            </div>
            <Select 
              value={filtros.tipo} 
              onValueChange={(v) => setFiltros(prev => ({ ...prev, tipo: v }))}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="resumo">Resumos</SelectItem>
                <SelectItem value="mapa_mental">Mapas Mentais</SelectItem>
                <SelectItem value="lei">Legislação</SelectItem>
                <SelectItem value="exemplo">Exemplos</SelectItem>
              </SelectContent>
            </Select>
            <Select 
              value={filtros.disciplinaId} 
              onValueChange={(v) => setFiltros(prev => ({ ...prev, disciplinaId: v }))}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Disciplina" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas disciplinas</SelectItem>
                {disciplinas.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Lista de Conteúdos */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : conteudos.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum conteúdo encontrado</h3>
            <p className="text-muted-foreground">
              {filtros.busca || filtros.tipo || filtros.disciplinaId
                ? 'Tente ajustar os filtros de busca.'
                : 'A biblioteca ainda está vazia.'}
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {conteudos.map((item) => (
              <Card 
                key={item.id} 
                className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setConteudoSelecionado(item)}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="gap-1">
                    {getTipoIcon(item.tipo)}
                    {getTipoLabel(item.tipo)}
                  </Badge>
                  {item.is_public && (
                    <Badge variant="outline" className="text-xs">Público</Badge>
                  )}
                </div>
                
                <h3 className="font-semibold mb-2 line-clamp-2">{item.titulo}</h3>
                
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {item.conteudo}
                </p>

                {item.disciplina && (
                  <div className="mt-4 pt-4 border-t">
                    <Badge variant="outline" className="text-xs">
                      {item.disciplina.nome}
                    </Badge>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;
