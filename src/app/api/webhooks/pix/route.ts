import { NextResponse } from "next/server";
import db from "@/lib/db";
import { sendWhatsAppApiNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    // 1. Validação de token se configurado ASAAS_WEBHOOK_SECRET
    const webhookSecret = process.env.ASAAS_WEBHOOK_SECRET;
    if (webhookSecret && webhookSecret.trim().length > 0) {
      const incomingToken = request.headers.get("asaas-access-token");
      if (incomingToken && incomingToken !== webhookSecret) {
        console.warn("Webhook rejeitado: cabeçalho asaas-access-token inválido.");
        return NextResponse.json({ success: false, error: "Não autorizado." }, { status: 401 });
      }
    }

    const payload = await request.json();
    console.log("Recebido Webhook Pix:", JSON.stringify(payload));

    // 2. Se for evento específico do Asaas, só processa liquidações
    if (
      payload.event &&
      payload.event !== "PAYMENT_RECEIVED" &&
      payload.event !== "PAYMENT_CONFIRMED"
    ) {
      return NextResponse.json({ received: true, message: `Evento ignorado (${payload.event})` });
    }

    // 3. Identificação de txid / orderCode (incluindo formato Asaas: payload.payment.externalReference)
    let orderCode =
      payload.orderCode ||
      payload.txid ||
      payload.externalReference ||
      payload.payment?.externalReference;

    if (orderCode && orderCode.startsWith("LDPG") === false && orderCode.length === 10) {
      // Ex: LDPG847291 -> LDPG-847291
      orderCode = `LDPG-${orderCode.substring(4)}`;
    }

    if (!orderCode) {
      return NextResponse.json({ received: true, message: "Ignorado (sem orderCode correspondente)" });
    }

    const purchase = await db.purchase.findUnique({
      where: { code: orderCode },
      include: {
        participant: true,
        items: true,
        payments: true,
      },
    });

    if (!purchase) {
      return NextResponse.json({ received: true, message: "Pedido não localizado" });
    }

    // Idempotência: se já pago, apenas responde OK
    if (purchase.status === "COMPLETED") {
      return NextResponse.json({ received: true, message: "Já processado anteriormente" });
    }

    const now = new Date();
    const numberList = purchase.items.map((it) => it.number);

    await db.$transaction(async (tx) => {
      await tx.purchase.update({
        where: { id: purchase.id },
        data: { status: "COMPLETED" },
      });

      if (purchase.payments.length > 0) {
        await tx.payment.update({
          where: { id: purchase.payments[0].id },
          data: {
            status: "PAID",
            paidAt: now,
            webhookPayload: JSON.stringify(payload),
          },
        });
      }

      const avgPrice = purchase.totalPaid / (numberList.length || 1);

      for (const num of numberList) {
        await tx.raffleNumber.update({
          where: { number: num },
          data: {
            status: "PAID",
            pricePaid: avgPrice,
            reservedUntil: null,
            reservationSessionId: null,
          },
        });
      }
    });

    // Dispara notificação no WhatsApp se API estiver configurada
    if (purchase.participant?.whatsapp) {
      sendWhatsAppApiNotification({
        orderCode: purchase.code,
        participantName: purchase.participant.fullName,
        participantPhone: purchase.participant.whatsapp,
        numbers: numberList,
        totalPaid: purchase.totalPaid,
      }).catch((err) => console.error("Erro ao enviar WhatsApp via Webhook:", err));
    }

    return NextResponse.json({
      received: true,
      success: true,
      message: `Pagamento do pedido ${orderCode} confirmado com sucesso.`,
    });
  } catch (error) {
    console.error("Erro no Webhook Pix:", error);
    return NextResponse.json({ error: "Erro interno no processamento do webhook" }, { status: 500 });
  }
}
