/**
 * Helper de notificações de compra aprovada via WhatsApp
 */

export interface PurchaseNotificationData {
  orderCode: string;
  participantName: string;
  participantPhone: string;
  numbers: number[];
  totalPaid: number;
}

/**
 * Monta o texto padronizado do comprovante para o WhatsApp
 */
export function formatPurchaseWhatsAppText(data: PurchaseNotificationData): string {
  const siteUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://acaoamigos.com.br";
  const formattedNumbers = data.numbers.sort((a, b) => a - b).join(", ");
  const formattedTotal = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(data.totalPaid);

  return (
    `🏍️ *AÇÃO DOS AMIGOS — COMPROVANTE OFICIAL*\n\n` +
    `Olá, *${data.participantName}*!\n` +
    `Seu pagamento Pix foi *confirmado com sucesso*!\n\n` +
    `📋 *Código do Pedido:* ${data.orderCode}\n` +
    `💰 *Valor Pago:* ${formattedTotal}\n` +
    `🎟️ *Seus Números da Sorte:* ${formattedNumbers}\n\n` +
    `📅 *Sorteio:* 15/11/2026 (Apuração pela Loteria Federal)\n` +
    `🔍 *Consultar seus bilhetes a qualquer momento:* ${siteUrl}/meus-numeros\n\n` +
    `_Boa sorte! Obrigado por apoiar esta Ação dos Amigos!_`
  );
}

/**
 * Gera o link direto wa.me para o participante enviar a si mesmo ou suporte
 */
export function generateWhatsAppReceiptLink(
  phone: string,
  data: PurchaseNotificationData
): string {
  const cleanPhone = phone.replace(/\D/g, "");
  const fullPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
  const text = encodeURIComponent(formatPurchaseWhatsAppText(data));
  return `https://wa.me/${fullPhone}?text=${text}`;
}

/**
 * Despacha notificação via API externa de WhatsApp se configurada no ambiente.
 * Suporta Evolution API, Z-API ou webhook customizado via WHATSAPP_API_URL.
 */
export async function sendWhatsAppApiNotification(
  data: PurchaseNotificationData
): Promise<boolean> {
  const apiUrl = process.env.WHATSAPP_API_URL;
  const apiToken = process.env.WHATSAPP_API_TOKEN;

  if (!apiUrl) {
    // Sem API configurada no momento — log amigável
    console.log(`[WhatsApp Notification Ready]: Pedido ${data.orderCode} para ${data.participantPhone}`);
    return false;
  }

  try {
    const cleanPhone = data.participantPhone.replace(/\D/g, "");
    const fullPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
    const message = formatPurchaseWhatsAppText(data);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiToken ? { Authorization: `Bearer ${apiToken}` } : {}),
      },
      body: JSON.stringify({
        phone: fullPhone,
        message,
      }),
    });

    return response.ok;
  } catch (err) {
    console.error("Falha ao disparar notificação WhatsApp:", err);
    return false;
  }
}
