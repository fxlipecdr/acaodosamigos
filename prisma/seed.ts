import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

// Mesma logica de src/lib/db.ts: com TURSO_DATABASE_URL definido, o seed
// popula o banco remoto do Turso; sem ela, usa o SQLite local.
function createPrismaClient(): PrismaClient {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  if (tursoUrl) {
    const adapter = new PrismaLibSQL({
      url: tursoUrl,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    return new PrismaClient({ adapter });
  }
  return new PrismaClient();
}

const prisma = createPrismaClient();

async function main() {
  console.log("Iniciando seed idempotente do banco de dados...");

  // 1. Criar Usuário Administrador
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const admin = await prisma.adminUser.upsert({
    where: { email: "admin@acao.com" },
    update: {},
    create: {
      email: "admin@acao.com",
      name: "Administrador Geral",
      passwordHash: adminPasswordHash,
      role: "SUPER_ADMIN",
    },
  });
  console.log(`✓ Administrador configurado: ${admin.email}`);

  // 2. Regulamento Oficial
  const defaultRules = `## REGULAMENTO OFICIAL DA AÇÃO DOS AMIGOS

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

  // 3. Configurações da Campanha com dados reais e sem "0km"
  const prizeImagesJson = JSON.stringify([
    { url: "/images/moto/moto-hero.jpg", title: "Vista Angular Frontal - Honda CG 160 Start" },
    { url: "/images/moto/moto-lateral.jpg", title: "Vista Lateral Completa - Perfil Esportivo" },
    { url: "/images/moto/moto-traseira.jpg", title: "Vista Traseira Angular - Design Moderno" },
    { url: "/images/moto/moto-frontal.jpg", title: "Vista Frontal - Farol e Carenagem" }
  ]);

  const campaign = await prisma.campaignSettings.upsert({
    where: { id: "default" },
    update: {
      title: "Ação dos Amigos da Moto",
      subtitle: "Concorra a uma motocicleta Honda CG 160 Start com apuração transparente pela Loteria Federal!",
      drawDate: "2026-11-15",
      drawTime: "19:00",
      drawNotice: null,
      minQuota: 1000,
      unitPrice: 30.0,
      promoBundleSize: 3,
      promoBundlePrice: 63.0,
      startNumber: 1000,
      endNumber: 3999,
      presencialStart: 1000,
      presencialEnd: 2999,
      onlineStart: 3000,
      onlineEnd: 3999,
      whatsappNumber: "+5548992178109",
      whatsappMessage: "Olá! Vim pelo site da Ação dos Amigos e gostaria de tirar uma dúvida sobre a moto.",
      instagramUrl: "",
      contactEmail: "contato@acaodosamigos.com.br",
      rulesText: defaultRules,
      prizeModel: "Honda CG 160 Start",
      prizeYear: "2023",
      prizeColor: "Azul Metálico",
      prizeMileage: "",
      prizeCondition: "Semi-nova em excelente estado de conservação, revisada, documentação em dia e pronta para transferência",
      prizeDetails: "Motocicleta Honda CG 160 Start semi-nova em excelente estado de conservação, revisada, com documentação em dia e pronta para transferir ao vencedor.",
      prizeCoverImage: "/images/moto/moto-hero.jpg",
      prizeImagesJson,
      prizeVideoUrl: "",
      paymentsEnabled: false,
      activeGateway: "MOCK_PIX",
      gatewayConfigJson: JSON.stringify({}),
    },
    create: {
      id: "default",
      title: "Ação dos Amigos da Moto",
      subtitle: "Concorra a uma motocicleta Honda CG 160 Start com apuração transparente pela Loteria Federal!",
      drawDate: "2026-11-15",
      drawTime: "19:00",
      drawNotice: null,
      minQuota: 1000,
      unitPrice: 30.0,
      promoBundleSize: 3,
      promoBundlePrice: 63.0,
      startNumber: 1000,
      endNumber: 3999,
      presencialStart: 1000,
      presencialEnd: 2999,
      onlineStart: 3000,
      onlineEnd: 3999,
      whatsappNumber: "+5548992178109",
      whatsappMessage: "Olá! Vim pelo site da Ação dos Amigos e gostaria de tirar uma dúvida sobre a moto.",
      instagramUrl: "",
      contactEmail: "contato@acaodosamigos.com.br",
      rulesText: defaultRules,
      prizeModel: "Honda CG 160 Start",
      prizeYear: "2023",
      prizeColor: "Azul Metálico",
      prizeMileage: "",
      prizeCondition: "Semi-nova em excelente estado de conservação, revisada, documentação em dia e pronta para transferência",
      prizeDetails: "Motocicleta Honda CG 160 Start semi-nova em excelente estado de conservação, revisada, com documentação em dia e pronta para transferir ao vencedor.",
      prizeCoverImage: "/images/moto/moto-hero.jpg",
      prizeImagesJson,
      prizeVideoUrl: "",
      paymentsEnabled: false,
      activeGateway: "MOCK_PIX",
      gatewayConfigJson: JSON.stringify({}),
    },
  });
  console.log(`✓ Campanha configurada: ${campaign.title}`);

  // 4. Reset destrutivo — SOMENTE sob pedido explícito.
  //    Este seed roda a cada build (veja o script "build" no package.json).
  //    Apagar as tabelas aqui sem trava significaria perder todas as vendas
  //    reais a cada deploy, então o reset agora exige SEED_RESET=true.
  if (process.env.SEED_RESET === "true") {
    console.log("⚠  SEED_RESET=true — apagando TODOS os dados transacionais...");
    await prisma.purchaseItem.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.purchase.deleteMany({});
    await prisma.raffleNumber.deleteMany({});
    await prisma.partner.deleteMany({});
    await prisma.participant.deleteMany({});
    await prisma.auditLog.deleteMany({});
    await prisma.verificationSession.deleteMany({});
    console.log("✓ Tabelas limpas.");
  }

  // 5. Garantir a existência dos 3.000 números (1000 a 3999).
  //    Cria apenas os que faltam: um banco já em uso passa intacto, e um banco
  //    novo recebe a faixa completa.
  const existing = await prisma.raffleNumber.findMany({
    select: { number: true },
  });
  const existingSet = new Set(existing.map((n) => n.number));

  const numbersBatch: any[] = [];
  for (let n = 1000; n <= 3999; n++) {
    if (existingSet.has(n)) continue;
    const isPresencial = n <= 2999;
    numbersBatch.push({
      number: n,
      status: "AVAILABLE",
      origin: isPresencial ? "PRESENTIAL" : "ONLINE",
      participantId: null,
      partnerId: null,
      purchaseId: null,
      pricePaid: null,
      updatedAt: new Date(),
    });
  }

  if (numbersBatch.length === 0) {
    console.log(`✓ Os ${existingSet.size} números já existem — nada a criar.`);
  } else {
    console.log(`Criando ${numbersBatch.length} números faltantes...`);
    const chunkSize = 500;
    for (let i = 0; i < numbersBatch.length; i += chunkSize) {
      // Sem skipDuplicates: o provider SQLite não o suporta, e a lista acima
      // já exclui os números que existem.
      await prisma.raffleNumber.createMany({
        data: numbersBatch.slice(i, i + chunkSize),
      });
    }
    console.log(`✓ ${numbersBatch.length} números criados como DISPONÍVEIS.`);
  }

  // 6. Configurar registro de sorteio agendado
  await prisma.drawResult.upsert({
    where: { id: "current-draw" },
    update: {
      drawDate: "2026-11-15",
      lotteryContestNumber: "Concurso Oficial Loteria Federal",
      status: "SCHEDULED",
      notes: "Sorteio agendado para 15/11/2026. A apuração utilizará os 4 últimos algarismos dos prêmios da Loteria Federal.",
      isPublished: false,
    },
    create: {
      id: "current-draw",
      drawDate: "2026-11-15",
      lotteryContestNumber: "Concurso Oficial Loteria Federal",
      status: "SCHEDULED",
      notes: "Sorteio agendado para 15/11/2026. A apuração utilizará os 4 últimos algarismos dos prêmios da Loteria Federal.",
      isPublished: false,
    },
  });

  console.log("✓ Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
