export default function TermosPage() {
  return (
    <div className="min-h-screen py-8 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-heading font-black text-foreground">
          Termos e Condições de Uso
        </h1>
        <p className="text-xs text-slate-400">Última atualização: 02 de setembro de 2026</p>
      </div>

      <div className="p-6 sm:p-10 rounded-2xl bg-dark-850 border border-dark-750 text-xs sm:text-sm text-slate-300 space-y-6 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">1. Objeto</h2>
          <p>
            O presente documento estabelece as regras e condições para aquisição de cotas/números da Ação dos Amigos, cujo prêmio principal consiste em uma motocicleta Honda CG 160 Start semi-nova conforme anunciado na página principal.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">2. Modalidades de Compra e Valores</h2>
          <p>
            O participante poderá adquirir bilhetes numerados nas faixas de 1000 a 3999 (3.000 números no total), sendo as faixas divididas entre vendas presenciais e online. O valor unitário é de R$ 30,00 por número, com condições promocionais aplicadas na compra online.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">3. Pagamento e Confirmação</h2>
          <p>
            Os pagamentos realizados pelo site são processados via Pix. A confirmação do número ocorre de forma instantânea após a liquidação do pagamento. Números em reserva temporária não confirmados no prazo limite de 15 minutos retornam automaticamente à disponibilidade pública.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">4. Apuração e Loteria Federal</h2>
          <p>
            A apuração do vencedor utiliza como referência exclusiva os 4 últimos algarismos dos prêmios da Loteria Federal. A Caixa Econômica Federal não possui qualquer participação na realização, administração ou patrocínio desta ação.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">5. Entrega do Prêmio</h2>
          <p>
            O ganhador será contatado diretamente através do WhatsApp e telefone informados no cadastro. A motocicleta será entregue quitada e pronta para transferência documental ao contemplado.
          </p>
        </section>
      </div>
    </div>
  );
}
