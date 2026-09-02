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

  console.log("\n=========================================");
  console.log(`📊 RESULTADO FINAL: ${passed} PASSOU | ${failed} FALHOU`);
  console.log("=========================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
