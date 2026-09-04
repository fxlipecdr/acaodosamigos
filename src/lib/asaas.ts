/**
 * Cliente de Integração com a API v3 do Asaas para Pagamentos Pix Dinâmicos
 */

const ASAAS_API_URL = (process.env.ASAAS_API_URL || "https://api.asaas.com/v3").replace(/\/+$/, "");
const ASAAS_API_KEY = process.env.ASAAS_API_KEY || "";

export function isAsaasConfigured(): boolean {
  return Boolean(ASAAS_API_KEY && ASAAS_API_KEY.trim().length > 10);
}

interface AsaasCustomerInput {
  fullName: string;
  cpf: string;
  whatsapp: string;
  email?: string | null;
}

interface AsaasPaymentInput {
  orderCode: string;
  customer: AsaasCustomerInput;
  value: number;
  description: string;
}

interface AsaasPaymentResult {
  success: boolean;
  paymentId?: string;
  pixCopiaECola?: string;
  qrCodeBase64?: string;
  error?: string;
}

/**
 * Busca ou cadastra o cliente no Asaas
 */
async function getOrCreateAsaasCustomer(input: AsaasCustomerInput): Promise<string> {
  const cleanCpf = input.cpf.replace(/\D/g, "");
  const cleanPhone = input.whatsapp.replace(/\D/g, "");

  // 1. Tentar localizar cliente existente pelo CPF
  try {
    const searchRes = await fetch(`${ASAAS_API_URL}/customers?cpfCnpj=${cleanCpf}`, {
      headers: {
        access_token: ASAAS_API_KEY,
        "Content-Type": "application/json",
      },
    });

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.data && searchData.data.length > 0) {
        return searchData.data[0].id;
      }
    }
  } catch (err) {
    console.warn("Aviso ao buscar cliente existente no Asaas:", err);
  }

  // 2. Criar novo cliente caso não exista
  const createRes = await fetch(`${ASAAS_API_URL}/customers`, {
    method: "POST",
    headers: {
      access_token: ASAAS_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: input.fullName,
      cpfCnpj: cleanCpf,
      mobilePhone: cleanPhone,
      email: input.email || undefined,
      notificationDisabled: true, // As notificações ficam a cargo do nosso próprio WhatsApp
    }),
  });

  const createData = await createRes.json();

  if (!createRes.ok || !createData.id) {
    const errorMsg =
      createData.errors?.[0]?.description ||
      createData.message ||
      "Falha ao cadastrar cliente no Asaas.";
    throw new Error(errorMsg);
  }

  return createData.id;
}

/**
 * Cria a cobrança Pix no Asaas e busca o QR Code e código Copia e Cola oficial
 */
export async function createAsaasPixPayment(
  input: AsaasPaymentInput
): Promise<AsaasPaymentResult> {
  if (!isAsaasConfigured()) {
    return {
      success: false,
      error: "Gateway Asaas não configurado (ASAAS_API_KEY ausente).",
    };
  }

  try {
    // 1. Obter ou criar o cliente
    const customerId = await getOrCreateAsaasCustomer(input.customer);

    // 2. Data de vencimento (hoje)
    const today = new Date();
    const dueDate = today.toISOString().split("T")[0];

    // 3. Criar cobrança Pix
    const paymentRes = await fetch(`${ASAAS_API_URL}/payments`, {
      method: "POST",
      headers: {
        access_token: ASAAS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer: customerId,
        billingType: "PIX",
        value: input.value,
        dueDate,
        description: input.description,
        externalReference: input.orderCode,
        postalService: false,
      }),
    });

    const paymentData = await paymentRes.json();

    if (!paymentRes.ok || !paymentData.id) {
      const errorMsg =
        paymentData.errors?.[0]?.description ||
        paymentData.message ||
        "Falha ao gerar cobrança no Asaas.";
      return { success: false, error: errorMsg };
    }

    const asaasPaymentId = paymentData.id;

    // 4. Buscar o QR Code Pix e payload Copia e Cola
    const qrRes = await fetch(`${ASAAS_API_URL}/payments/${asaasPaymentId}/pixQrCode`, {
      headers: {
        access_token: ASAAS_API_KEY,
      },
    });

    const qrData = await qrRes.json();

    if (!qrRes.ok || !qrData.payload) {
      return {
        success: false,
        error: "Falha ao obter QR Code Pix do Asaas.",
      };
    }

    let qrCodeBase64 = qrData.encodedImage || "";
    if (qrCodeBase64 && !qrCodeBase64.startsWith("data:image")) {
      qrCodeBase64 = `data:image/png;base64,${qrCodeBase64}`;
    }

    return {
      success: true,
      paymentId: asaasPaymentId,
      pixCopiaECola: qrData.payload,
      qrCodeBase64,
    };
  } catch (err: any) {
    console.error("Erro na integração com o Asaas:", err);
    return {
      success: false,
      error: err.message || "Erro inesperado ao conectar com o Asaas.",
    };
  }
}
