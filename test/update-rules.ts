import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const defaultRules = `REGULAMENTO OFICIAL - AÇÃO DOS AMIGOS

1. **DO OBJETIVO**
A presente Ação dos Amigos tem como finalidade a arrecadação de fundos através da cessão de bilhetes numerados, tendo como prêmio principal uma motocicleta Honda CG 160 Start descrita na página oficial.

2. **DA PARTICIPAÇÃO E MODALIDADES DE VENDA**
* O valor unitário de cada número é de **R$ 30,00 (trinta reais)**.
* **Venda Presencial:** Números de **1000 a 2999**, disponíveis nos estabelecimentos parceiros credenciados.
* **Venda Online:** Números de **3000 a 3999**, disponíveis diretamente através da plataforma web.
* **Promoção Especial Online:** Na aquisição de bilhetes pelo site, a cada 2 (dois) números adquiridos no valor regular (R$ 60,00), o 3º (terceiro) número tem valor promocional de R$ 3,00, totalizando **R$ 63,00 para cada lote de 3 números** (ex: 6 números por R$ 126,00).

3. **DA FORMA DE APURAÇÃO E SORTEIO**
* A data prevista para apuração é **15 de novembro de 2026 (15/11/2026)**.
* A apuração terá como base única e exclusiva a extração oficial da **Loteria Federal**, realizada pela Caixa Econômica Federal.
* **Critério de Identificação:** Serão considerados **OS 4 (QUATRO) ÚLTIMOS ALGARISMOS** de cada bilhete premiado da Loteria Federal (desconsiderando-se a dezena de milhar/primeiro dígito de 5 algarismos).
* **Ordem de Conferência:**
  1. Primeiro prêmio da Loteria Federal;
  2. Segundo prêmio (caso o número do 1º prêmio não tenha sido comercializado e pago);
  3. Terceiro prêmio (caso os anteriores não tenham sido comercializados);
  4. Quarto prêmio;
  5. Quinto prêmio.

4. **SORTEIO PENDENTE / NOVA APURAÇÃO**
* Caso nenhum dos 5 (cinco) números apurados corresponda a um bilhete efetivamente comercializado e com pagamento confirmado até o encerramento das vendas, **o prêmio permanecerá pendente**.
* Não haverá sorteio interno, aproximação ou escolha manual. Uma nova apuração será realizada na extração subsequente da Loteria Federal, sendo a nova data amplamente divulgada na página oficial.
* Para a realização do sorteio, é exigida a meta mínima de **1.000 (mil) números comercializados**. Caso a meta não seja atingida até a data estipulada, a organização poderá prorrogar a data do sorteio mediante aviso prévio e transparência no site.

5. **ENTREGA DO PRÊMIO**
* O ganhador será contatado através dos dados informados no ato da compra (WhatsApp/Telefone).
* O prêmio será entregue com documentação quitada e recibo de transferência em nome do ganhador.
* O ganhador autoriza a divulgação parcial de seu primeiro nome e inicial do sobrenome para fins de transparência pública, resguardados os dados sensíveis nos termos da Lei Geral de Proteção de Dados (LGPD).

6. **BONIFICAÇÃO PARA ESTABELECIMENTOS PARCEIROS (PONTOS DE VENDA)**
* Como incentivo especial de vendas presenciais, **os 4 (quatro) primeiros estabelecimentos parceiros credenciados que alcançarem a marca de 100 (cem) números comercializados e confirmados receberão uma bonificação de R$ 500,00 (quinhentos reais) cada um**, paga pela organização além da respectiva comissão padrão acordada.

7. **ISENÇÃO E INDEPENDÊNCIA**
* Esta ação é de iniciativa privada e não possui qualquer vínculo, patrocínio ou organização por parte da Caixa Econômica Federal, sendo a Loteria Federal utilizada estritamente como parâmetro público e auditável de apuração.`;

  await prisma.campaignSettings.update({
    where: { id: "default" },
    data: { rulesText: defaultRules },
  });

  console.log("✓ Regulamento atualizado no banco de dados com sucesso!");
}

main().finally(() => prisma.$disconnect());
