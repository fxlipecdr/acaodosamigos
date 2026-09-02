import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderCode } = body;

    if (!orderCode) {
      return NextResponse.json(
        { success: false, error: "Código do pedido obrigatório." },
        { status: 400 }
      );
    }

    const purchase = await db.purchase.findUnique({
      where: { code: orderCode },
      include: {
        numbers: true,
        items: true,
        payments: {
          where: { status: "PENDING" },
          take: 1,
        },
      },
    });

    if (!purchase) {
      return NextResponse.json(
        { success: false, error: "Pedido não localizado." },
        { status: 404 }
      );
    }

    if (purchase.status === "COMPLETED") {
      return NextResponse.json({
        success: true,
        message: "Este pagamento já foi confirmado anteriormente.",
        orderCode: purchase.code,
      });
    }

    const now = new Date();

    await db.$transaction(async (tx) => {
      // 1. Atualizar compra para COMPLETED
      await tx.purchase.update({
        where: { id: purchase.id },
        data: { status: "COMPLETED" },
      });

      // 2. Atualizar pagamento para PAID
      if (purchase.payments.length > 0) {
        await tx.payment.update({
          where: { id: purchase.payments[0].id },
          data: {
            status: "PAID",
            paidAt: now,
          },
        });
      }

      // 3. Atualizar números associados para PAID
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
      success: true,
      message: "Pagamento confirmado com sucesso via ambiente de testes!",
      orderCode: purchase.code,
    });
  } catch (error) {
    console.error("Erro ao simular pagamento:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao confirmar pagamento." },
      { status: 500 }
    );
  }
}
