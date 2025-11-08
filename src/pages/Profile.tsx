import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Navigation } from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Camera,
  Bell,
  Lock,
  LogOut,
  Trophy,
  Target,
  Clock,
  TrendingUp,
  Calendar,
  Award,
  BookOpen,
  CheckCircle2
} from "lucide-react";

const Profile = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [senhaDialogOpen, setSenhaDialogOpen] = useState(false);
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [statistics, setStatistics] = useState({
    totalHoras: 0,
    questoesRespondidas: 0,
    taxaAcerto: 0,
    diasConsecutivos: 0,
    simuladosRealizados: 0
  });
  const [atividadesRecentes, setAtividadesRecentes] = useState<any[]>([]);
  const [notificacoes, setNotificacoes] = useState({
    lembretes_estudo: true,
    revisoes_pendentes: true,
    relatorios_semanais: false
  });

  useEffect(() => {
    if (user) {
      carregarDados();
    }
  }, [user]);

  const carregarDados = async () => {
    await Promise.all([
      carregarPerfil(),
      carregarEstatisticas(),
      carregarAtividadesRecentes()
    ]);
    setLoading(false);
  };

  const carregarPerfil = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user?.id)
      .maybeSingle();
    
    if (data) {
      setProfile(data);
      if (data.notificacoes && typeof data.notificacoes === 'object') {
        setNotificacoes(data.notificacoes as any);
      }
    }
  };

  const carregarEstatisticas = async () => {
    // Total de horas estudadas
    const { data: sessoes } = await supabase
      .from('sessoes_estudo')
      .select('duracao_minutos')
      .eq('user_id', user?.id);
    
    const totalMinutos = sessoes?.reduce((acc, s) => acc + s.duracao_minutos, 0) || 0;
    const totalHoras = Math.round((totalMinutos / 60) * 10) / 10;

    // Simulados realizados
    const { data: simulados } = await supabase
      .from('simulados')
      .select('*')
      .eq('user_id', user?.id)
      .eq('status', 'concluido');
    
    const simuladosRealizados = simulados?.length || 0;
    
    // Taxa de acerto média
    const notasSimulados = simulados?.map(s => s.nota_final).filter(n => n !== null) || [];
    const taxaAcerto = notasSimulados.length > 0
      ? Math.round(notasSimulados.reduce((a, b) => a + b, 0) / notasSimulados.length)
      : 0;

    // Questões respondidas (aproximado através dos simulados)
    const questoesRespondidas = simulados?.reduce((acc, s) => acc + (s.total_questoes || 0), 0) || 0;

    // Dias consecutivos (última sessão até hoje)
    const { data: ultimaSessao } = await supabase
      .from('sessoes_estudo')
      .select('data')
      .eq('user_id', user?.id)
      .order('data', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    let diasConsecutivos = 0;
    if (ultimaSessao) {
      const hoje = new Date();
      const ultimaData = new Date(ultimaSessao.data);
      const diffTime = Math.abs(hoje.getTime() - ultimaData.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      diasConsecutivos = diffDays <= 1 ? 1 : 0; // Simplificado
    }

    setStatistics({
      totalHoras,
      questoesRespondidas,
      taxaAcerto,
      diasConsecutivos,
      simuladosRealizados
    });
  };

  const carregarAtividadesRecentes = async () => {
    const { data: sessoes } = await supabase
      .from('sessoes_estudo')
      .select(`
        *,
        disciplinas (nome)
      `)
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    const { data: simulados } = await supabase
      .from('simulados')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(3);

    const atividades = [
      ...(sessoes?.map(s => ({
        tipo: 'sessao',
        titulo: `Estudo de ${s.disciplinas?.nome || 'disciplina'}`,
        data: s.created_at,
        duracao: s.duracao_minutos
      })) || []),
      ...(simulados?.map(s => ({
        tipo: 'simulado',
        titulo: s.titulo,
        data: s.created_at,
        status: s.status,
        nota: s.nota_final
      })) || [])
    ].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()).slice(0, 8);

    setAtividadesRecentes(atividades);
  };

  const handleUploadFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast({ title: 'Erro ao enviar foto', variant: 'destructive' });
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    await supabase
      .from('profiles')
      .update({ foto_url: publicUrl })
      .eq('id', user.id);

    toast({ title: 'Foto atualizada!' });
    carregarPerfil();
    setUploading(false);
  };

  const handleSalvar = async () => {
    const { error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('id', user?.id);
    
    if (error) {
      toast({ title: 'Erro ao salvar perfil', variant: 'destructive' });
      return;
    }
    
    toast({ title: 'Perfil atualizado com sucesso!' });
  };

  const handleNotificacaoChange = async (key: string, value: boolean) => {
    const novasNotificacoes = { ...notificacoes, [key]: value };
    setNotificacoes(novasNotificacoes);

    const { error } = await supabase
      .from('profiles')
      .update({ notificacoes: novasNotificacoes } as any)
      .eq('id', user?.id);

    if (error) {
      toast({ title: 'Erro ao salvar configuração', variant: 'destructive' });
      return;
    }

    toast({ title: 'Configuração salva!' });
  };

  const handleAlterarSenha = async () => {
    if (novaSenha !== confirmarSenha) {
      toast({ title: 'As senhas não coincidem', variant: 'destructive' });
      return;
    }

    if (novaSenha.length < 6) {
      toast({ title: 'A senha deve ter no mínimo 6 caracteres', variant: 'destructive' });
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: novaSenha
    });

    if (error) {
      toast({ title: 'Erro ao alterar senha', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Senha alterada com sucesso!' });
    setSenhaDialogOpen(false);
    setNovaSenha('');
    setConfirmarSenha('');
  };

  const formatarData = (data: string) => {
    const d = new Date(data);
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(ontem.getDate() - 1);

    if (d.toDateString() === hoje.toDateString()) return 'Hoje';
    if (d.toDateString() === ontem.toDateString()) return 'Ontem';
    
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 pt-24 max-w-7xl">
        <div className="mb-8">
          <h1 className="mb-2">Meu Perfil</h1>
          <p className="text-muted-foreground text-lg">
            Gerencie suas informações, acompanhe seu progresso e conquistas
          </p>
        </div>

        {/* Header com Foto e Estatísticas Principais */}
        <Card className="p-6 mb-6 bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="relative">
              {profile?.foto_url ? (
                <img src={profile.foto_url} alt="Perfil" className="w-40 h-40 rounded-full object-cover border-4 border-background shadow-lg" />
              ) : (
                <div className="w-40 h-40 rounded-full bg-gradient-primary flex items-center justify-center text-white text-5xl font-bold shadow-lg">
                  {profile?.nome_completo?.charAt(0) || 'U'}
                </div>
              )}
              <input
                type="file"
                id="foto-upload"
                accept="image/*"
                className="hidden"
                onChange={handleUploadFoto}
              />
              <Button 
                size="icon" 
                variant="secondary"
                className="absolute bottom-0 right-0 rounded-full h-10 w-10 shadow-md"
                onClick={() => document.getElementById('foto-upload')?.click()}
                disabled={uploading}
              >
                <Camera className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-3xl font-bold mb-2">{profile?.nome_completo || 'Usuário'}</h2>
              <p className="text-muted-foreground mb-4">{user?.email}</p>
              {profile?.concurso_alvo && (
                <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="font-medium">Meta: {profile.concurso_alvo}</span>
                </div>
              )}
            </div>

            {/* Cards de Estatísticas Rápidas */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full lg:w-auto">
              <div className="bg-background/80 backdrop-blur rounded-lg p-4 text-center shadow-sm">
                <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{statistics.totalHoras}h</div>
                <div className="text-xs text-muted-foreground">Estudadas</div>
              </div>
              <div className="bg-background/80 backdrop-blur rounded-lg p-4 text-center shadow-sm">
                <CheckCircle2 className="h-6 w-6 text-success mx-auto mb-2" />
                <div className="text-2xl font-bold">{statistics.taxaAcerto}%</div>
                <div className="text-xs text-muted-foreground">Acertos</div>
              </div>
              <div className="bg-background/80 backdrop-blur rounded-lg p-4 text-center shadow-sm">
                <Trophy className="h-6 w-6 text-warning mx-auto mb-2" />
                <div className="text-2xl font-bold">{statistics.simuladosRealizados}</div>
                <div className="text-xs text-muted-foreground">Simulados</div>
              </div>
              <div className="bg-background/80 backdrop-blur rounded-lg p-4 text-center shadow-sm">
                <TrendingUp className="h-6 w-6 text-accent mx-auto mb-2" />
                <div className="text-2xl font-bold">{statistics.questoesRespondidas}</div>
                <div className="text-xs text-muted-foreground">Questões</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs de Conteúdo */}
        <Tabs defaultValue="geral" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="progresso">Progresso</TabsTrigger>
            <TabsTrigger value="preferencias">Preferências</TabsTrigger>
            <TabsTrigger value="seguranca">Segurança</TabsTrigger>
          </TabsList>

          {/* Tab: Informações Gerais */}
          <TabsContent value="geral" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Informações Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="nome">Nome Completo</Label>
                      <Input 
                        id="nome" 
                        value={profile?.nome_completo || ''} 
                        onChange={(e) => setProfile({...profile, nome_completo: e.target.value})}
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cpf">CPF</Label>
                        <Input 
                          id="cpf" 
                          value={profile?.cpf || ''} 
                          onChange={(e) => setProfile({...profile, cpf: e.target.value})}
                          placeholder="000.000.000-00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="telefone">Telefone</Label>
                        <Input 
                          id="telefone" 
                          value={profile?.telefone || ''} 
                          onChange={(e) => setProfile({...profile, telefone: e.target.value})}
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={user?.email || ''} disabled />
                    </div>
                  </div>
                  <Button onClick={handleSalvar} className="w-full">Salvar Alterações</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Objetivos de Estudo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="concurso">Concurso Alvo</Label>
                    <Input 
                      id="concurso" 
                      value={profile?.concurso_alvo || ''} 
                      onChange={(e) => setProfile({...profile, concurso_alvo: e.target.value})}
                      placeholder="Ex: TRT 2024"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cargo">Cargo Desejado</Label>
                    <Input 
                      id="cargo" 
                      value={profile?.cargo_alvo || ''} 
                      onChange={(e) => setProfile({...profile, cargo_alvo: e.target.value})}
                      placeholder="Ex: Analista Judiciário"
                    />
                  </div>
                  <div>
                    <Label htmlFor="meta-horas">Meta Semanal (horas)</Label>
                    <Input 
                      id="meta-horas" 
                      type="number"
                      value={profile?.meta_horas_semanais || 20} 
                      onChange={(e) => setProfile({...profile, meta_horas_semanais: parseInt(e.target.value)})}
                    />
                  </div>
                  {profile?.dias_ate_prova && (
                    <div className="bg-primary/10 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        <span className="font-semibold">Dias até a prova</span>
                      </div>
                      <div className="text-3xl font-bold text-primary">{profile.dias_ate_prova} dias</div>
                    </div>
                  )}
                  <Button onClick={handleSalvar} className="w-full">Atualizar Metas</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Progresso e Conquistas */}
          <TabsContent value="progresso" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Estatísticas Detalhadas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Meta Semanal</span>
                      <span className="text-sm text-muted-foreground">
                        {statistics.totalHoras}h / {profile?.meta_horas_semanais || 20}h
                      </span>
                    </div>
                    <Progress 
                      value={(statistics.totalHoras / (profile?.meta_horas_semanais || 20)) * 100} 
                      className="h-3"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Total de Horas</div>
                      <div className="text-3xl font-bold text-primary">{statistics.totalHoras}h</div>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Taxa de Acerto</div>
                      <div className="text-3xl font-bold text-success">{statistics.taxaAcerto}%</div>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Simulados Feitos</div>
                      <div className="text-3xl font-bold text-warning">{statistics.simuladosRealizados}</div>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Questões Respondidas</div>
                      <div className="text-3xl font-bold text-accent">{statistics.questoesRespondidas}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Conquistas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {statistics.totalHoras >= 10 && (
                      <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                        <div className="bg-primary/20 p-2 rounded-full">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-sm">Dedicado</div>
                          <div className="text-xs text-muted-foreground">10+ horas estudadas</div>
                        </div>
                      </div>
                    )}
                    {statistics.simuladosRealizados >= 5 && (
                      <div className="flex items-center gap-3 p-3 bg-warning/10 rounded-lg">
                        <div className="bg-warning/20 p-2 rounded-full">
                          <Trophy className="h-5 w-5 text-warning" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-sm">Guerreiro</div>
                          <div className="text-xs text-muted-foreground">5+ simulados completos</div>
                        </div>
                      </div>
                    )}
                    {statistics.taxaAcerto >= 70 && (
                      <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg">
                        <div className="bg-success/20 p-2 rounded-full">
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-sm">Expert</div>
                          <div className="text-xs text-muted-foreground">70%+ de acertos</div>
                        </div>
                      </div>
                    )}
                    {statistics.totalHoras < 10 && statistics.simuladosRealizados < 5 && statistics.taxaAcerto < 70 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Award className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Continue estudando para<br />desbloquear conquistas!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Atividades Recentes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Atividades Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {atividadesRecentes.length > 0 ? (
                  <div className="space-y-3">
                    {atividadesRecentes.map((atividade, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                        <div className={`p-2 rounded-full ${
                          atividade.tipo === 'sessao' 
                            ? 'bg-primary/20' 
                            : atividade.status === 'concluido' 
                            ? 'bg-success/20' 
                            : 'bg-warning/20'
                        }`}>
                          {atividade.tipo === 'sessao' ? (
                            <Clock className="h-4 w-4 text-primary" />
                          ) : (
                            <Trophy className="h-4 w-4 text-warning" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{atividade.titulo}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatarData(atividade.data)}
                            {atividade.duracao && ` • ${atividade.duracao} min`}
                            {atividade.nota && ` • ${atividade.nota.toFixed(0)}% de acerto`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Nenhuma atividade registrada ainda</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Preferências */}
          <TabsContent value="preferencias">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Notificações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">Lembretes de Estudo</p>
                    <p className="text-sm text-muted-foreground">
                      Receba lembretes para suas sessões de estudo programadas
                    </p>
                  </div>
                  <Switch 
                    checked={notificacoes.lembretes_estudo}
                    onCheckedChange={(checked) => handleNotificacaoChange('lembretes_estudo', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">Revisões Pendentes</p>
                    <p className="text-sm text-muted-foreground">
                      Alertas quando houver questões que precisam ser revisadas
                    </p>
                  </div>
                  <Switch 
                    checked={notificacoes.revisoes_pendentes}
                    onCheckedChange={(checked) => handleNotificacaoChange('revisoes_pendentes', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">Relatórios Semanais</p>
                    <p className="text-sm text-muted-foreground">
                      Resumo semanal do seu progresso e desempenho
                    </p>
                  </div>
                  <Switch 
                    checked={notificacoes.relatorios_semanais}
                    onCheckedChange={(checked) => handleNotificacaoChange('relatorios_semanais', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Segurança */}
          <TabsContent value="seguranca" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  Segurança da Conta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">Alterar Senha</p>
                    <p className="text-sm text-muted-foreground">
                      Mantenha sua conta segura alterando sua senha regularmente
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => setSenhaDialogOpen(true)}>
                    Alterar
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">Email de Recuperação</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                  <Button variant="outline" disabled>
                    Verificado
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <LogOut className="h-5 w-5" />
                  Sair da Conta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-muted-foreground">
                      Desconectar de todos os dispositivos e encerrar a sessão atual
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={signOut}
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog de Alterar Senha */}
      <Dialog open={senhaDialogOpen} onOpenChange={setSenhaDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
            <DialogDescription>
              Digite sua nova senha. Ela deve ter no mínimo 6 caracteres.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nova-senha">Nova Senha</Label>
              <Input 
                id="nova-senha"
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="Digite sua nova senha"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmar-senha">Confirmar Senha</Label>
              <Input 
                id="confirmar-senha"
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="Confirme sua nova senha"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSenhaDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAlterarSenha}>
              Alterar Senha
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
