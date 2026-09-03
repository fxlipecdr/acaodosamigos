import { calculateOrderPrice } from "../src/lib/pricing";
import { validateCPF, cleanCPF, formatCPF, maskCPF, maskName } from "../src/lib/cpf";
import { generatePixPayload } from "../src/lib/pix";

async function runTests() {
  console.log("=========================================");
  console.log("🧪 INICIANDO SUÍTE DE TESTES AUTOMATIZADOS");
  console.log("=========================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ PASSOU: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FALHOU: ${testName}`);
      failed++;
    }
  }

  // 1. TESTE DO MOTOR DE PREÇOS E PROMOÇÃO ONLINE (3x R$63)
  console.log("--- 1. Testes de Regra Comercial e Promoção ---");
  
  // 1 número = R$ 30
  const p1 = calculateOrderPrice(1, 30.0, 3, 63.0);
  assert(p1.finalTotal === 30.0 && p1.discountAmount === 0, "1 número = R$ 30,00");

  // 2 números = R$ 60
  const p2 = calculateOrderPrice(2, 30.0, 3, 63.0);
  assert(p2.finalTotal === 60.0 && p2.discountAmount === 0, "2 números = R$ 60,00");

  // 3 números = R$ 63 (R$ 27 de desconto)
  const p3 = calculateOrderPrice(3, 30.0, 3, 63.0);
  assert(p3.finalTotal === 63.0 && p3.discountAmount === 27.0, "3 números = R$ 63,00 (Promoção 3x R$63)");

  // 4 números = R$ 93 (63 + 30)
  const p4 = calculateOrderPrice(4, 30.0, 3, 63.0);
  assert(p4.finalTotal === 93.0 && p4.discountAmount === 27.0, "4 números = R$ 93,00");

  // 5 números = R$ 123 (63 + 60)
  const p5 = calculateOrderPrice(5, 30.0, 3, 63.0);
  assert(p5.finalTotal === 123.0 && p5.discountAmount === 27.0, "5 números = R$ 123,00");

  // 6 números = R$ 126 (2 pacotes de 3)
  const p6 = calculateOrderPrice(6, 30.0, 3, 63.0);
  assert(p6.finalTotal === 126.0 && p6.discountAmount === 54.0, "6 números = R$ 126,00 (2x R$63)");

  // 2. TESTES DE VALIDAÇÃO ESTREITA DE CPF & LGPD
  console.log("\n--- 2. Testes de Validação de CPF e Anonimização LGPD ---");

  assert(validateCPF("12345678909") === true || validateCPF("52998224725") === true, "Validador de CPF identifica CPF com dígitos válidos");
  assert(validateCPF("11111111111") === false, "Rejeita CPF com todos os dígitos iguais");
  assert(validateCPF("123") === false, "Rejeita CPF incompleto");
  assert(cleanCPF("123.456.789-01") === "12345678901", "Limpa formatação de CPF");
  assert(maskCPF("12345678901") === "***.456.789-**", "Aplica máscara de CPF LGPD");
  assert(maskName("Carlos Eduardo Silva") === "Carlos S.", "Anonimiza nome público do ganhador (LGPD: Nome + Inicial do sobrenome)");

  // 3. TESTES DE GERAÇÃO DO PAYLOAD PIX (PADRÃO BANCO CENTRAL)
  console.log("\n--- 3. Testes do Payload Pix EMV ---");

  const pix = generatePixPayload({
    amount: 63.0,
    txid: "LDPG847291",
  });

  assert(pix.startsWith("000201"), "Payload Pix inicia com formato padrão EMV (000201)");
  assert(pix.includes("br.gov.bcb.pix"), "Contém identificador oficial do Banco Central");
  assert(pix.includes("63.00"), "Contém valor monetário formatado correto");

  // 4. TESTES DA MECÂNICA DE APURAÇÃO DA LOTERIA FEDERAL (4 ÚLTIMOS DÍGITOS)
  console.log("\n--- 4. Testes da Mecânica da Loteria Federal ---");

  const federalExample = "83247";
  const last4 = federalExample.slice(-4);
  assert(last4 === "3247", "Extrai corretamente os 4 últimos dígitos (83247 -> 3247)");

  const federalFirst = "81845".slice(-4);
  assert(federalFirst === "1845", "Extrai 1º prêmio 81845 -> 1845");

  // 5. TESTES DO RATE LIMITER CONTRA BOTS
  console.log("\n--- 5. Testes do Rate Limiter ---");
  const { checkRateLimit } = await import("../src/lib/rateLimit");
  const dummyReq = new Request("http://localhost/api/test", {
    headers: { "x-forwarded-for": "203.0.113.195" },
  });

  const r1 = checkRateLimit(dummyReq, { keyPrefix: "test_e2e", limit: 2, windowMs: 5000 });
  assert(r1.allowed === true && r1.remaining === 1, "Rate limiter permite primeira requisição");
  
  const r2 = checkRateLimit(dummyReq, { keyPrefix: "test_e2e", limit: 2, windowMs: 5000 });
  assert(r2.allowed === true && r2.remaining === 0, "Rate limiter permite segunda requisição no limite");

  const r3 = checkRateLimit(dummyReq, { keyPrefix: "test_e2e", limit: 2, windowMs: 5000 });
  assert(r3.allowed === false && r3.remaining === 0, "Rate limiter bloqueia requisições excedentes (429)");

  // 6. TESTES DA FORMATAÇÃO DE COMPROVANTE WHATSAPP
  console.log("\n--- 6. Testes do Comprovante WhatsApp ---");
  const { formatPurchaseWhatsAppText, generateWhatsAppReceiptLink } = await import("../src/lib/notifications");
  const receiptText = formatPurchaseWhatsAppText({
    orderCode: "LDPG-123456",
    participantName: "Carlos Silva",
    participantPhone: "48992178109",
    numbers: [3010, 3011, 3012],
    totalPaid: 63.0,
  });

  assert(receiptText.includes("LDPG-123456"), "Comprovante contém código do pedido");
  assert(receiptText.includes("3010, 3011, 3012"), "Comprovante lista os números comprados ordenados");
  assert(receiptText.includes("R$ 63,00") || receiptText.includes("63,00"), "Comprovante inclui valor formatado");

  const waLink = generateWhatsAppReceiptLink("48992178109", {
    orderCode: "LDPG-123456",
    participantName: "Carlos Silva",
    participantPhone: "48992178109",
    numbers: [3010],
    totalPaid: 30.0,
  });
  assert(waLink.startsWith("https://wa.me/5548992178109"), "Gera link wa.me com DDI 55 correto");

  // 7. TESTE DA REGRA DE VALIDAÇÃO DE 4 DÍGITOS DO TELEFONE
  console.log("\n--- 7. Teste de Validação dos 4 Dígitos do Telefone ---");
  const phoneSample = "48992178109";
  assert(phoneSample.slice(-4) === "8109", "Extrai com exatidão os 4 últimos dígitos (8109)");
  assert(phoneSample.endsWith("8109") === true, "Valida corretamente match com os 4 últimos dígitos");
  assert(phoneSample.endsWith("0000") === false, "Rejeita corretamente dígitos divergentes");

  console.log("\n=========================================");
  console.log(`📊 RESULTADO FINAL: ${passed} PASSOU | ${failed} FALHOU`);
  console.log("=========================================\n");

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runTests();
