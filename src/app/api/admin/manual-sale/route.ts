import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { cleanCPF, validateCPF } from "@/lib/cpf";
import { createAuditLog } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autorizado." }, { status: 401 });
    }

    const body = await request.json();
    const { ticketNumber, cpf, fullName, whatsapp, partnerId, price = 30.0 } = body;

    const num = Number(ticketNumber);
    if (isNaN(num)) {
      return NextResponse.json({ success: false, error: "Número do bilhete inválido." }, { status: 400 });
    }

    const cleanedCpf = cleanCPF(cpf || "");
    if (!validateCPF(cleanedCpf)) {
      return NextResponse.json({ success: false, error: "CPF inválido." }, { status: 400 });
    }

    if (!fullName || fullName.trim().length < 3) {
      return NextResponse.json({ success: false, error: "Nome completo obrigatório." }, { status: 400 });
    }

    const cleanedPhone = (whatsapp || "").replace(/\D/g, "");

    // Executa em transação atômica
    const result = await db.$transaction(async (tx) => {
      // 1. Verificar número
      const raffleNum = await tx.raffleNumber.findUnique({
        where: { number: num },
      });

      if (!raffleNum) {
        throw new Error(`Número ${num} não encontrado no sistema.`);
      }

      if (raffleNum.status === "PAID") {
        throw new Error(`Número ${num} já consta como PAGO/VENDIDO.`);
      }

      // 2. Criar ou atualizar participante
      const participant = await tx.participant.upsert({
        where: { cpf: cleanedCpf },
        update: {
          fullName: fullName.trim(),
          whatsapp: cleanedPhone || undefined,
        },
        create: {
          fullName: fullName.trim(),
          cpf: cleanedCpf,
          whatsapp: cleanedPhone || "Não informado",
        },
      });

      // 3. Atualizar o número para PAID com origem PRESENTIAL
      const updatedNumber = await tx.raffleNumber.update({
        where: { number: num },
        data: {
          status: "PAID",
          origin: "PRESENTIAL",
          participantId: participant.id,
          partnerId: partnerId || null,
          pricePaid: Number(price) || 30.0,
          reservedUntil: null,
          reservationSessionId: null,
        },
      });

      return { participant, updatedNumber };
    });

    await createAuditLog({
      adminEmail: session.email,
      action: "MANUAL_PRESENTIAL_SALE",
      entityType: "RaffleNumber",
      entityId: String(num),
      newValue: {
        number: num,
        participant: result.participant.fullName,
        cpf: cleanedCpf,
        partnerId,
        price,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Venda do número ${num} registrada com sucesso para ${result.participant.fullName}!`,
    });
  } catch (error: any) {
    console.error("Erro no cadastro de venda presencial:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Erro ao registrar venda presencial." },
      { status: 400 }
    );
  }
}
