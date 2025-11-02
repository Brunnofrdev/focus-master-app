import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  LogOut
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
  const [notificacoes, setNotificacoes] = useState({
    lembretes_estudo: true,
    revisoes_pendentes: true,
    relatorios_semanais: false
  });

  useEffect(() => {
    if (user) {
      carregarPerfil();
    }
  }, [user]);

  const carregarPerfil = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user?.id)
      .single();
    
    if (data) {
      setProfile(data);
      // Carregar preferências de notificação se existirem
      const profileData = data as any;
      if (profileData.notificacoes) {
        setNotificacoes(profileData.notificacoes);
      }
    }
    setLoading(false);
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

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 pt-24 max-w-4xl">
        <div className="mb-8">
          <h1 className="mb-2">Meu Perfil</h1>
          <p className="text-muted-foreground text-lg">
            Gerencie suas informações e preferências
          </p>
        </div>

        {/* Foto de Perfil */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              {profile?.foto_url ? (
                <img src={profile.foto_url} alt="Perfil" className="w-24 h-24 rounded-full object-cover" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center text-white text-3xl font-bold">
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
                className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                onClick={() => document.getElementById('foto-upload')?.click()}
                disabled={uploading}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold">{profile?.nome_completo || 'Usuário'}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </Card>

        {/* Informações Pessoais */}
        <Card className="p-6 mb-6">
          <h3 className="mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Informações Pessoais
          </h3>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome Completo</Label>
                <Input 
                  id="nome" 
                  value={profile?.nome_completo || ''} 
                  onChange={(e) => setProfile({...profile, nome_completo: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="cpf">CPF</Label>
                <Input 
                  id="cpf" 
                  value={profile?.cpf || ''} 
                  onChange={(e) => setProfile({...profile, cpf: e.target.value})}
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user?.email || ''} disabled />
              </div>
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input 
                  id="telefone" 
                  value={profile?.telefone || ''} 
                  onChange={(e) => setProfile({...profile, telefone: e.target.value})}
                />
              </div>
            </div>
            <Button onClick={handleSalvar}>Salvar Alterações</Button>
          </div>
        </Card>

        {/* Preferências */}
        <Card className="p-6 mb-6">
          <h3 className="mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notificações
          </h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium">Lembretes de Estudo</p>
                <p className="text-sm text-muted-foreground">
                  Receba lembretes para suas sessões de estudo
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
                  Alertas quando houver questões para revisar
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
                  Resumo semanal do seu progresso
                </p>
              </div>
              <Switch 
                checked={notificacoes.relatorios_semanais}
                onCheckedChange={(checked) => handleNotificacaoChange('relatorios_semanais', checked)}
              />
            </div>
          </div>
        </Card>

        {/* Segurança */}
        <Card className="p-6 mb-6">
          <h3 className="mb-4 flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Segurança
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium">Alterar Senha</p>
                <p className="text-sm text-muted-foreground">
                  Mantenha sua conta segura alterando sua senha regularmente
                </p>
              </div>
              <Button variant="outline" onClick={() => setSenhaDialogOpen(true)}>Alterar</Button>
            </div>
          </div>
        </Card>

        {/* Sair */}
        <Card className="p-6 border-destructive/50">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium text-destructive">Sair da Conta</p>
              <p className="text-sm text-muted-foreground">
                Desconectar de todos os dispositivos
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
        </Card>
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
