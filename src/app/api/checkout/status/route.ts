import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderCode = searchParams.get("code");

    if (!orderCode) {
      return NextResponse.json(
        { success: false, error: "Código do pedido não informado." },
        { status: 400 }
      );
    }

    const purchase = await db.purchase.findUnique({
      where: { code: orderCode },
      include: {
        participant: true,
        numbers: true,
        payments: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!purchase) {
      return NextResponse.json(
        { success: false, error: "Pedido não encontrado." },
        { status: 404 }
      );
    }

    const payment = purchase.payments[0];
    const isPaid = purchase.status === "COMPLETED";

    return NextResponse.json({
      success: true,
      status: purchase.status,
      isPaid,
      orderCode: purchase.code,
      totalPaid: purchase.totalPaid,
      participantName: purchase.participant.fullName,
      participantPhone: purchase.participant.whatsapp,
      numbers: purchase.numbers.map((n) => n.number),
      paidAt: payment?.paidAt || null,
    });
  } catch (error) {
    console.error("Erro ao checar status do pedido:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao consultar status do pagamento." },
      { status: 500 }
    );
  }
}
