import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autorizado." }, { status: 401 });
    }

    const body = await request.json();
    const { action, number } = body;

    const num = Number(number);
    if (isNaN(num)) {
      return NextResponse.json({ success: false, error: "Número inválido." }, { status: 400 });
    }

    const current = await db.raffleNumber.findUnique({
      where: { number: num },
    });

    if (!current) {
      return NextResponse.json({ success: false, error: "Número não encontrado." }, { status: 404 });
    }

    let updated;

    if (action === "BLOCK") {
      updated = await db.raffleNumber.update({
        where: { number: num },
        data: {
          status: "BLOCKED",
          reservedUntil: null,
          reservationSessionId: null,
        },
      });
    } else if (action === "UNBLOCK" || action === "RELEASE") {
      updated = await db.raffleNumber.update({
        where: { number: num },
        data: {
          status: "AVAILABLE",
          participantId: null,
          partnerId: null,
          purchaseId: null,
          pricePaid: null,
          reservedUntil: null,
          reservationSessionId: null,
        },
      });
    } else {
      return NextResponse.json({ success: false, error: "Ação não reconhecida." }, { status: 400 });
    }

    await createAuditLog({
      adminEmail: session.email,
      action: `NUMBER_${action}`,
      entityType: "RaffleNumber",
      entityId: String(num),
      oldValue: current,
      newValue: updated,
    });

    return NextResponse.json({
      success: true,
      message: `Número ${num} atualizado com sucesso!`,
      number: updated,
    });
  } catch (error: any) {
    console.error("Erro na ação sobre o número:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
