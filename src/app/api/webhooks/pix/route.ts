import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    console.log("Recebido Webhook Pix:", JSON.stringify(payload));

    // Identificação de txid / orderCode dependendo do formato do gateway
    let orderCode = payload.orderCode || payload.txid || payload.externalReference;
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

      const numberList = purchase.items.map((it) => it.number);
      const avgPrice = purchase.totalPaid / numberList.length;

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
