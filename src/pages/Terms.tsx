import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";

const Terms = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>

        <Card className="p-8 max-w-4xl mx-auto">
          <h1 className="mb-6">Termos de Uso</h1>
          <p className="text-muted-foreground mb-8">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>

          <div className="space-y-8 text-foreground/90">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Aceitação dos Termos</h2>
              <p className="leading-relaxed">
                Ao acessar e usar a plataforma ConcursoMax, você concorda em cumprir e estar vinculado aos seguintes termos e condições de uso. Se você não concordar com qualquer parte destes termos, não deverá usar nossos serviços.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Descrição do Serviço</h2>
              <p className="leading-relaxed mb-4">
                ConcursoMax é uma plataforma digital de preparação para concursos públicos que oferece:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Planner de estudos personalizado</li>
                <li>Sistema de revisão automática com repetição espaçada</li>
                <li>Simulados personalizados por banca e disciplina</li>
                <li>Análises estatísticas de desempenho</li>
                <li>Banco de questões de concursos públicos</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Cadastro e Conta de Usuário</h2>
              <p className="leading-relaxed mb-4">
                Para utilizar nossos serviços, você deve:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Fornecer informações verdadeiras, precisas e completas</li>
                <li>Manter a segurança e confidencialidade de sua senha</li>
                <li>Notificar-nos imediatamente sobre qualquer uso não autorizado de sua conta</li>
                <li>Ser responsável por todas as atividades realizadas em sua conta</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Uso Aceitável</h2>
              <p className="leading-relaxed mb-4">
                Você concorda em NÃO:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Usar a plataforma para qualquer finalidade ilegal ou não autorizada</li>
                <li>Compartilhar seu acesso com terceiros</li>
                <li>Fazer engenharia reversa, copiar ou modificar qualquer parte da plataforma</li>
                <li>Fazer scraping ou uso automatizado dos nossos conteúdos</li>
                <li>Interferir ou interromper o funcionamento da plataforma</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Propriedade Intelectual</h2>
              <p className="leading-relaxed">
                Todo o conteúdo da plataforma, incluindo textos, gráficos, logos, ícones, imagens, questões e software, é propriedade da ConcursoMax ou de seus fornecedores de conteúdo e está protegido por leis de direitos autorais brasileiras e internacionais.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Assinaturas e Pagamentos</h2>
              <p className="leading-relaxed mb-4">
                Oferecemos período de teste gratuito de 7 dias. Após esse período:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>A cobrança será automática conforme o plano escolhido</li>
                <li>Você pode cancelar sua assinatura a qualquer momento</li>
                <li>Não oferecemos reembolso proporcional por períodos não utilizados</li>
                <li>Reservamos o direito de alterar preços mediante aviso prévio</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Modificações e Cancelamento</h2>
              <p className="leading-relaxed">
                Reservamos o direito de modificar ou descontinuar, temporária ou permanentemente, a plataforma (ou qualquer parte dela) com ou sem aviso prévio. Você concorda que não seremos responsáveis perante você ou terceiros por qualquer modificação, suspensão ou descontinuação da plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Limitação de Responsabilidade</h2>
              <p className="leading-relaxed">
                A ConcursoMax não se responsabiliza por aprovação em concursos públicos. Nosso serviço é uma ferramenta de auxílio aos estudos. O desempenho e aprovação dependem exclusivamente do esforço e dedicação do usuário.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Lei Aplicável</h2>
              <p className="leading-relaxed">
                Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. Qualquer disputa relacionada a estes termos será resolvida nos tribunais brasileiros.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Contato</h2>
              <p className="leading-relaxed">
                Para questões sobre estes Termos de Uso, entre em contato conosco através do e-mail: contato@concursomax.com.br
              </p>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Terms;
