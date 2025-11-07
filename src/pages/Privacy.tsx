import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Privacy = () => {
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
          <h1 className="mb-6">Política de Privacidade</h1>
          <p className="text-muted-foreground mb-8">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>

          <div className="space-y-8 text-foreground/90">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Introdução</h2>
              <p className="leading-relaxed">
                A ConcursoMax ("nós", "nosso" ou "nossa") está comprometida em proteger sua privacidade. Esta Política de Privacidade explica como coletamos, usamos, divulgamos e protegemos suas informações quando você utiliza nossa plataforma de preparação para concursos públicos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Informações que Coletamos</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">2.1. Informações Fornecidas por Você</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Nome completo</li>
                    <li>Endereço de e-mail</li>
                    <li>Telefone (opcional)</li>
                    <li>CPF (para emissão de notas fiscais)</li>
                    <li>Informações de pagamento (processadas por gateway seguro)</li>
                    <li>Concurso alvo e cargo desejado</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">2.2. Informações Coletadas Automaticamente</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Endereço IP</li>
                    <li>Tipo de navegador e dispositivo</li>
                    <li>Páginas visitadas e tempo de navegação</li>
                    <li>Dados de uso da plataforma (questões respondidas, simulados realizados, tempo de estudo)</li>
                    <li>Cookies e tecnologias similares</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Como Usamos suas Informações</h2>
              <p className="leading-relaxed mb-4">
                Utilizamos suas informações para:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Fornecer, operar e manter nossa plataforma</li>
                <li>Personalizar sua experiência de aprendizado</li>
                <li>Processar pagamentos e enviar confirmações</li>
                <li>Enviar atualizações, alertas de revisão e lembretes de estudo</li>
                <li>Analisar uso da plataforma para melhorar nossos serviços</li>
                <li>Detectar e prevenir fraudes e abusos</li>
                <li>Cumprir obrigações legais</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Compartilhamento de Informações</h2>
              <p className="leading-relaxed mb-4">
                Não vendemos suas informações pessoais. Podemos compartilhar dados com:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Processadores de pagamento:</strong> Para processar transações financeiras de forma segura</li>
                <li><strong>Provedores de serviços:</strong> Que nos auxiliam na operação da plataforma (hospedagem, e-mail, analytics)</li>
                <li><strong>Autoridades legais:</strong> Quando exigido por lei ou para proteger nossos direitos</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Segurança dos Dados</h2>
              <p className="leading-relaxed">
                Implementamos medidas técnicas e organizacionais apropriadas para proteger suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição. Isso inclui:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Criptografia SSL/TLS para transmissão de dados</li>
                <li>Armazenamento seguro com criptografia em repouso</li>
                <li>Acesso restrito a dados pessoais</li>
                <li>Monitoramento contínuo de segurança</li>
                <li>Backups regulares</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Seus Direitos (LGPD)</h2>
              <p className="leading-relaxed mb-4">
                De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Confirmar a existência de tratamento de dados</li>
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
                <li>Solicitar a anonimização, bloqueio ou eliminação de dados</li>
                <li>Solicitar portabilidade de dados a outro fornecedor</li>
                <li>Revogar consentimento</li>
                <li>Obter informações sobre compartilhamento de dados</li>
              </ul>
              <p className="leading-relaxed mt-4">
                Para exercer seus direitos, entre em contato através do e-mail: privacidade@concursomax.com.br
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Cookies e Tecnologias Similares</h2>
              <p className="leading-relaxed mb-4">
                Utilizamos cookies e tecnologias similares para:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Cookies essenciais:</strong> Necessários para o funcionamento básico da plataforma</li>
                <li><strong>Cookies de desempenho:</strong> Para entender como você usa nossa plataforma</li>
                <li><strong>Cookies de funcionalidade:</strong> Para lembrar suas preferências</li>
                <li><strong>Cookies de marketing:</strong> Para personalizar anúncios (com seu consentimento)</li>
              </ul>
              <p className="leading-relaxed mt-4">
                Você pode gerenciar cookies através das configurações do seu navegador.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Retenção de Dados</h2>
              <p className="leading-relaxed">
                Mantemos suas informações pessoais apenas pelo tempo necessário para cumprir os propósitos descritos nesta política, a menos que um período de retenção mais longo seja exigido ou permitido por lei. Após o cancelamento da conta, seus dados serão anonimizados ou excluídos conforme aplicável.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Menores de Idade</h2>
              <p className="leading-relaxed">
                Nossa plataforma é destinada a pessoas maiores de 18 anos. Não coletamos intencionalmente informações de menores de idade. Se você é pai ou responsável e acredita que seu filho nos forneceu informações pessoais, entre em contato conosco.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Alterações nesta Política</h2>
              <p className="leading-relaxed">
                Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre mudanças significativas por e-mail ou através de um aviso em nossa plataforma. Recomendamos que você revise esta política regularmente.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Contato</h2>
              <p className="leading-relaxed">
                Para questões sobre esta Política de Privacidade ou sobre o tratamento de seus dados pessoais:
              </p>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p><strong>E-mail:</strong> privacidade@concursomax.com.br</p>
                <p><strong>Encarregado de Dados (DPO):</strong> dpo@concursomax.com.br</p>
              </div>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;
