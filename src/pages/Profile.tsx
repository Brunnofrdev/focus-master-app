import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navigation } from "@/components/Navigation";
import { 
  User, 
  Mail, 
  Phone,
  Camera,
  Bell,
  Lock,
  CreditCard,
  LogOut
} from "lucide-react";

const Profile = () => {
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
              <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center text-white text-3xl font-bold">
                JD
              </div>
              <Button 
                size="icon" 
                variant="secondary"
                className="absolute bottom-0 right-0 rounded-full h-8 w-8"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold">João da Silva</h2>
              <p className="text-muted-foreground">joao.silva@email.com</p>
              <p className="text-sm text-primary mt-1">Plano Profissional</p>
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
                <Input id="nome" defaultValue="João da Silva" />
              </div>
              <div>
                <Label htmlFor="cpf">CPF</Label>
                <Input id="cpf" defaultValue="123.456.789-00" disabled />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="joao.silva@email.com" />
              </div>
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input id="telefone" defaultValue="(11) 98765-4321" />
              </div>
            </div>
            <Button>Salvar Alterações</Button>
          </div>
        </Card>

        {/* Preferências */}
        <Card className="p-6 mb-6">
          <h3 className="mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notificações
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Lembretes de Estudo</p>
                <p className="text-sm text-muted-foreground">
                  Receba lembretes para suas sessões de estudo
                </p>
              </div>
              <Button variant="outline" size="sm">Ativado</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Revisões Pendentes</p>
                <p className="text-sm text-muted-foreground">
                  Alertas quando houver questões para revisar
                </p>
              </div>
              <Button variant="outline" size="sm">Ativado</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Relatórios Semanais</p>
                <p className="text-sm text-muted-foreground">
                  Resumo semanal do seu progresso
                </p>
              </div>
              <Button variant="outline" size="sm">Desativado</Button>
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
              <div>
                <p className="font-medium">Alterar Senha</p>
                <p className="text-sm text-muted-foreground">
                  Última alteração há 3 meses
                </p>
              </div>
              <Button variant="outline">Alterar</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Autenticação em Dois Fatores</p>
                <p className="text-sm text-muted-foreground">
                  Adicione uma camada extra de segurança
                </p>
              </div>
              <Button variant="outline">Configurar</Button>
            </div>
          </div>
        </Card>

        {/* Assinatura */}
        <Card className="p-6 mb-6">
          <h3 className="mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Assinatura
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Plano Profissional</p>
                <p className="text-sm text-muted-foreground">
                  R$ 49,90/mês • Próxima cobrança em 15/11/2025
                </p>
              </div>
              <Button variant="outline">Gerenciar</Button>
            </div>
          </div>
        </Card>

        {/* Sair */}
        <Card className="p-6 border-error/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-error">Sair da Conta</p>
              <p className="text-sm text-muted-foreground">
                Desconectar de todos os dispositivos
              </p>
            </div>
            <Button variant="outline" className="gap-2 border-error text-error hover:bg-error hover:text-white">
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
