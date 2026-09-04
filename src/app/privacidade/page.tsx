export default function PrivacidadePage() {
  return (
    <div className="min-h-screen py-8 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-heading font-black text-foreground">
          Política de Privacidade (LGPD)
        </h1>
        <p className="text-xs text-slate-400">Em total conformidade com a Lei Federal nº 13.709/2018</p>
      </div>

      <div className="p-6 sm:p-10 rounded-2xl bg-dark-850 border border-dark-750 text-xs sm:text-sm text-slate-300 space-y-6 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">1. Coleta e Finalidade dos Dados</h2>
          <p>
            Coletamos apenas os dados estritamente necessários para a emissão, vinculação e validação de seus bilhetes (Nome Completo, CPF, WhatsApp e E-mail opcional). O CPF é utilizado como identificador unívoco de propriedade do bilhete e para contato em caso de premiação.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">2. Proteção e Não Divulgação Pública</h2>
          <p>
            Seu CPF, telefone e informações financeiras <strong>nunca são exibidos publicamente</strong> em listas ou buscas. A consulta de bilhetes pelo participante exige a confirmação de segurança com o CPF associado aos 4 últimos dígitos do WhatsApp cadastrado.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">3. Divulgação do Ganhador</h2>
          <p>
            Na divulgação pública do resultado, apenas o primeiro nome e a inicial do sobrenome do ganhador serão exibidos (exemplo: <em>João S.</em>), preservando o anonimato de dados pessoais sensíveis conforme a LGPD.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">4. Seus Direitos</h2>
          <p>
            Você pode a qualquer momento solicitar a confirmação da existência de tratamento, a correção de dados incompletos ou a exclusão de seus dados após a conclusão e auditoria da ação promocional através do canal oficial de suporte.
          </p>
        </section>
      </div>
    </div>
  );
}
