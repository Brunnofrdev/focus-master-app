import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Navigation } from '@/components/Navigation';
import { AIHelpButton } from '@/components/ai';
import { 
  BookOpen, 
  FileText, 
  Search,
  Plus,
  Loader2,
  MapPin,
  Scale,
  Lightbulb,
  Upload,
  FolderOpen,
  Trash2,
  Edit,
  Eye,
  X,
  FileUp,
  Sparkles,
  Brain,
  ChevronLeft,
  Grid,
  List as ListIcon,
  Filter
} from 'lucide-react';
import { useContentLibrary, ContentItem } from '@/hooks/useContentLibrary';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAI } from '@/hooks/useAI';
import { cn } from '@/lib/utils';

const Library = () => {
  const { listarConteudos, criarConteudo, deletarConteudo, loading } = useContentLibrary();
  const { generateSummary, createFlashcards, isLoading: aiLoading, streamingContent } = useAI();
  const { toast } = useToast();
  
  const [conteudos, setConteudos] = useState<ContentItem[]>([]);
  const [disciplinas, setDisciplinas] = useState<any[]>([]);
  const [filtros, setFiltros] = useState({
    tipo: '',
    disciplinaId: '',
    busca: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [conteudoSelecionado, setConteudoSelecionado] = useState<ContentItem | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  
  // Form states
  const [novoConteudo, setNovoConteudo] = useState({
    titulo: '',
    conteudo: '',
    tipo: 'resumo',
    disciplinaId: '',
    tags: ''
  });
  
  // Upload states
  const [uploadText, setUploadText] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [aiAction, setAiAction] = useState<'resumo' | 'flashcards' | 'mapa'>('resumo');
  const [aiResult, setAiResult] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        tipo: filtros.tipo && filtros.tipo !== 'all' ? filtros.tipo : undefined,
        disciplinaId: filtros.disciplinaId && filtros.disciplinaId !== 'all' ? filtros.disciplinaId : undefined,
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
      case 'mapa_mental': return <Brain className="h-4 w-4" />;
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

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'resumo': return 'bg-primary/10 text-primary border-primary/20';
      case 'mapa_mental': return 'bg-accent/10 text-accent border-accent/20';
      case 'lei': return 'bg-warning/10 text-warning border-warning/20';
      case 'exemplo': return 'bg-success/10 text-success border-success/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleCriarConteudo = async () => {
    if (!novoConteudo.titulo.trim() || !novoConteudo.conteudo.trim()) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha título e conteúdo.',
        variant: 'destructive'
      });
      return;
    }

    const resultado = await criarConteudo({
      titulo: novoConteudo.titulo,
      conteudo: novoConteudo.conteudo,
      tipo: novoConteudo.tipo,
      disciplinaId: novoConteudo.disciplinaId || undefined,
      tags: novoConteudo.tags.split(',').map(t => t.trim()).filter(Boolean)
    });

    if (resultado) {
      setDialogOpen(false);
      setNovoConteudo({ titulo: '', conteudo: '', tipo: 'resumo', disciplinaId: '', tags: '' });
      carregarDados();
    }
  };

  const handleDeletar = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este conteúdo?')) {
      const sucesso = await deletarConteudo(id);
      if (sucesso) {
        carregarDados();
        if (conteudoSelecionado?.id === id) {
          setConteudoSelecionado(null);
        }
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      
      // Read text files
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setUploadText(e.target?.result as string || '');
        };
        reader.readAsText(file);
      } else if (file.type === 'application/pdf') {
        toast({
          title: 'PDF detectado',
          description: 'O processamento de PDF está em desenvolvimento. Por favor, cole o texto manualmente.',
        });
      }
    }
  };

  const handleProcessarComIA = async () => {
    if (!uploadText.trim()) {
      toast({
        title: 'Texto vazio',
        description: 'Cole ou digite o texto para processar.',
        variant: 'destructive'
      });
      return;
    }

    setAiDialogOpen(true);
    setAiResult('');

    try {
      if (aiAction === 'resumo') {
        const resultado = await generateSummary(uploadText);
        setAiResult(resultado);
        
        // Auto-save to library
        await criarConteudo({
          titulo: `Resumo - ${new Date().toLocaleDateString('pt-BR')}`,
          conteudo: resultado,
          tipo: 'resumo'
        });
      } else if (aiAction === 'flashcards') {
        const flashcards = await createFlashcards(uploadText);
        if (flashcards.length > 0) {
          setAiResult(`${flashcards.length} flashcards criados com sucesso!`);
          toast({
            title: 'Flashcards criados!',
            description: `${flashcards.length} novos flashcards adicionados.`
          });
        }
      } else if (aiAction === 'mapa') {
        const resultado = await generateSummary(`Crie um mapa mental em formato de tópicos organizados hierarquicamente sobre: ${uploadText}`);
        setAiResult(resultado);
        
        await criarConteudo({
          titulo: `Mapa Mental - ${new Date().toLocaleDateString('pt-BR')}`,
          conteudo: resultado,
          tipo: 'mapa_mental'
        });
      }
      
      carregarDados();
    } catch (error) {
      toast({
        title: 'Erro ao processar',
        description: 'Tente novamente.',
        variant: 'destructive'
      });
    }
  };

  // Content View
  if (conteudoSelecionado) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navigation />
        
        <div className="container mx-auto px-4 py-8 pt-24 max-w-4xl">
          <Button 
            variant="ghost" 
            className="mb-6 gap-2"
            onClick={() => setConteudoSelecionado(null)}
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar à Biblioteca
          </Button>

          <Card className="overflow-hidden">
            <div className="p-6 border-b bg-muted/30">
              <div className="flex items-center gap-3 mb-4">
                <Badge className={cn("gap-1 border", getTipoColor(conteudoSelecionado.tipo))}>
                  {getTipoIcon(conteudoSelecionado.tipo)}
                  {getTipoLabel(conteudoSelecionado.tipo)}
                </Badge>
                {conteudoSelecionado.disciplina && (
                  <Badge variant="outline">
                    {conteudoSelecionado.disciplina.nome}
                  </Badge>
                )}
              </div>
              
              <h1 className="text-2xl font-bold">{conteudoSelecionado.titulo}</h1>
              
              <div className="flex items-center gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => handleDeletar(conteudoSelecionado.id)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
              </div>
            </div>
            
            <ScrollArea className="h-[60vh]">
              <div className="p-6">
                <div className="prose prose-lg max-w-none dark:prose-invert">
                  {conteudoSelecionado.conteudo.split('\n').map((paragraph, idx) => (
                    <p key={idx} className="mb-4 leading-relaxed">{paragraph}</p>
                  ))}
                </div>
              </div>
            </ScrollArea>

            {conteudoSelecionado.tags.length > 0 && (
              <div className="p-6 border-t bg-muted/20">
                <p className="text-sm text-muted-foreground mb-2">Tags:</p>
                <div className="flex flex-wrap gap-2">
                  {conteudoSelecionado.tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
        
        <AIHelpButton variant="fab" context="Ajude-me a entender este conteúdo de estudo" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <div className="p-2 rounded-xl gradient-primary">
                <BookOpen className="h-6 w-6 text-primary-foreground" />
              </div>
              Biblioteca de Conteúdos
            </h1>
            <p className="text-muted-foreground">
              Seus resumos, mapas mentais e materiais de estudo
            </p>
          </div>
          
          <div className="flex gap-3 flex-wrap">
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Processar com IA
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Processar Conteúdo com IA
                  </DialogTitle>
                  <DialogDescription>
                    Cole um texto ou faça upload de um arquivo para a IA processar
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      variant={aiAction === 'resumo' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAiAction('resumo')}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Resumo
                    </Button>
                    <Button
                      variant={aiAction === 'flashcards' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAiAction('flashcards')}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Flashcards
                    </Button>
                    <Button
                      variant={aiAction === 'mapa' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAiAction('mapa')}
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Mapa Mental
                    </Button>
                  </div>
                  
                  <div 
                    className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FileUp className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Clique para fazer upload ou arraste um arquivo
                    </p>
                    <p className="text-xs text-muted-foreground">
                      TXT, PDF (em breve)
                    </p>
                    {uploadFile && (
                      <Badge variant="secondary" className="mt-3">
                        {uploadFile.name}
                      </Badge>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".txt,.pdf"
                      onChange={handleFileUpload}
                    />
                  </div>
                  
                  <div className="relative">
                    <p className="text-sm font-medium mb-2">Ou cole o texto diretamente:</p>
                    <Textarea
                      value={uploadText}
                      onChange={(e) => setUploadText(e.target.value)}
                      placeholder="Cole aqui o conteúdo que deseja processar..."
                      rows={8}
                      className="resize-none"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleProcessarComIA} 
                    disabled={aiLoading || !uploadText.trim()}
                    className="w-full gap-2"
                  >
                    {aiLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        {aiAction === 'resumo' && 'Gerar Resumo'}
                        {aiAction === 'flashcards' && 'Criar Flashcards'}
                        {aiAction === 'mapa' && 'Criar Mapa Mental'}
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Conteúdo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Adicionar Conteúdo</DialogTitle>
                  <DialogDescription>
                    Adicione um novo material à sua biblioteca
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Título</label>
                    <Input
                      value={novoConteudo.titulo}
                      onChange={(e) => setNovoConteudo(prev => ({ ...prev, titulo: e.target.value }))}
                      placeholder="Ex: Resumo de Direito Constitucional"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Tipo</label>
                      <Select 
                        value={novoConteudo.tipo} 
                        onValueChange={(v) => setNovoConteudo(prev => ({ ...prev, tipo: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="resumo">Resumo</SelectItem>
                          <SelectItem value="mapa_mental">Mapa Mental</SelectItem>
                          <SelectItem value="lei">Legislação</SelectItem>
                          <SelectItem value="exemplo">Exemplo Prático</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Disciplina</label>
                      <Select 
                        value={novoConteudo.disciplinaId} 
                        onValueChange={(v) => setNovoConteudo(prev => ({ ...prev, disciplinaId: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {disciplinas.map((d) => (
                            <SelectItem key={d.id} value={d.id}>{d.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Conteúdo</label>
                    <Textarea
                      value={novoConteudo.conteudo}
                      onChange={(e) => setNovoConteudo(prev => ({ ...prev, conteudo: e.target.value }))}
                      placeholder="Digite ou cole o conteúdo..."
                      rows={8}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Tags (separadas por vírgula)</label>
                    <Input
                      value={novoConteudo.tags}
                      onChange={(e) => setNovoConteudo(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="Ex: constitucional, direitos fundamentais"
                    />
                  </div>
                  
                  <Button onClick={handleCriarConteudo} className="w-full" disabled={loading}>
                    {loading ? 'Salvando...' : 'Salvar Conteúdo'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar conteúdos..."
                className="pl-10"
                value={filtros.busca}
                onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Select 
                value={filtros.tipo} 
                onValueChange={(v) => setFiltros(prev => ({ ...prev, tipo: v }))}
              >
                <SelectTrigger className="w-[160px]">
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
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Disciplina" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas disciplinas</SelectItem>
                  {disciplinas.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex border rounded-lg overflow-hidden">
                <Button 
                  variant={viewMode === 'grid' ? 'default' : 'ghost'} 
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className="rounded-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewMode === 'list' ? 'default' : 'ghost'} 
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className="rounded-none"
                >
                  <ListIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 text-center bg-primary/5 border-primary/20">
            <p className="text-2xl font-bold text-primary">{conteudos.length}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </Card>
          <Card className="p-4 text-center bg-accent/5 border-accent/20">
            <p className="text-2xl font-bold text-accent">
              {conteudos.filter(c => c.tipo === 'resumo').length}
            </p>
            <p className="text-xs text-muted-foreground">Resumos</p>
          </Card>
          <Card className="p-4 text-center bg-warning/5 border-warning/20">
            <p className="text-2xl font-bold text-warning">
              {conteudos.filter(c => c.tipo === 'mapa_mental').length}
            </p>
            <p className="text-xs text-muted-foreground">Mapas Mentais</p>
          </Card>
          <Card className="p-4 text-center bg-success/5 border-success/20">
            <p className="text-2xl font-bold text-success">
              {conteudos.filter(c => c.tipo === 'lei').length}
            </p>
            <p className="text-xs text-muted-foreground">Legislação</p>
          </Card>
        </div>

        {/* Content List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : conteudos.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-20 h-20 rounded-2xl gradient-primary mx-auto mb-6 flex items-center justify-center">
              <BookOpen className="h-10 w-10 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Biblioteca vazia</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {filtros.busca || filtros.tipo || filtros.disciplinaId
                ? 'Nenhum conteúdo encontrado com esses filtros.'
                : 'Comece adicionando resumos, mapas mentais ou use a IA para processar seus materiais.'}
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Manual
              </Button>
              <Button variant="outline" onClick={() => setUploadDialogOpen(true)}>
                <Sparkles className="h-4 w-4 mr-2" />
                Processar com IA
              </Button>
            </div>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {conteudos.map((item) => (
              <Card 
                key={item.id} 
                className="group cursor-pointer hover:shadow-lg transition-all hover:border-primary/30 overflow-hidden"
                onClick={() => setConteudoSelecionado(item)}
              >
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={cn("gap-1 border", getTipoColor(item.tipo))}>
                      {getTipoIcon(item.tipo)}
                      {getTipoLabel(item.tipo)}
                    </Badge>
                    {item.is_public && (
                      <Badge variant="outline" className="text-xs">Público</Badge>
                    )}
                  </div>
                  
                  <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {item.titulo}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {item.conteudo}
                  </p>
                </div>

                {item.disciplina && (
                  <div className="px-6 pb-4">
                    <Badge variant="secondary" className="text-xs">
                      {item.disciplina.nome}
                    </Badge>
                  </div>
                )}
                
                <div className="px-6 py-3 border-t bg-muted/30 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString('pt-BR')}
                  </span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletar(item.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {conteudos.map((item) => (
              <Card 
                key={item.id} 
                className="p-4 cursor-pointer hover:shadow-md transition-all hover:border-primary/30 flex items-center gap-4"
                onClick={() => setConteudoSelecionado(item)}
              >
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", getTipoColor(item.tipo))}>
                  {getTipoIcon(item.tipo)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{item.titulo}</h3>
                  <p className="text-sm text-muted-foreground truncate">{item.conteudo}</p>
                </div>
                
                {item.disciplina && (
                  <Badge variant="secondary" className="hidden sm:inline-flex">
                    {item.disciplina.nome}
                  </Badge>
                )}
                
                <span className="text-xs text-muted-foreground hidden md:block">
                  {new Date(item.created_at).toLocaleDateString('pt-BR')}
                </span>
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletar(item.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* AI Result Dialog */}
      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Resultado da IA
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="prose prose-sm dark:prose-invert">
              {aiLoading && streamingContent ? (
                <p className="whitespace-pre-wrap">{streamingContent}</p>
              ) : aiLoading ? (
                <div className="flex items-center gap-2 py-8 justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span>Processando...</span>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{aiResult}</p>
              )}
            </div>
          </ScrollArea>
          {!aiLoading && aiResult && (
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setAiDialogOpen(false)}>
                Fechar
              </Button>
              <Button onClick={() => {
                setAiDialogOpen(false);
                setUploadDialogOpen(false);
                setUploadText('');
                setUploadFile(null);
              }}>
                Concluir
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <AIHelpButton variant="fab" context="Me ajude com a biblioteca de conteúdos" />
    </div>
  );
};

export default Library;