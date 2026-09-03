import { NextResponse } from "next/server";
import db from "@/lib/db";
import { cleanCPF, validateCPF, maskName, maskCPF } from "@/lib/cpf";
import { checkRateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    // 1. Rate limiting contra tentativas automatizadas / força bruta
    const rateLimit = checkRateLimit(request, {
      keyPrefix: "lookup",
      limit: 15,
      windowMs: 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Muitas consultas realizadas. Aguarde ${rateLimit.resetInSeconds} segundos para tentar novamente.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { cpf, last4Digits } = body;

    // 2. Validação do CPF
    const cleanedCpf = cleanCPF(cpf || "");
    if (!validateCPF(cleanedCpf)) {
      return NextResponse.json(
        { success: false, error: "CPF inválido. Verifique os dígitos informados." },
        { status: 400 }
      );
    }

    // 3. Validação dos 4 últimos dígitos
    const cleanLast4 = (last4Digits || "").toString().replace(/\D/g, "");
    if (cleanLast4.length !== 4) {
      return NextResponse.json(
        {
          success: false,
          error: "Informe exatamente os 4 últimos dígitos do WhatsApp cadastrado.",
        },
        { status: 400 }
      );
    }

    // 4. Busca do participante e seus bilhetes pagos
    const participant = await db.participant.findUnique({
      where: { cpf: cleanedCpf },
      include: {
        numbers: {
          where: { status: "PAID" },
          include: {
            partner: {
              select: { name: true, neighborhood: true },
            },
            purchase: {
              select: { code: true, createdAt: true, totalPaid: true },
            },
          },
          orderBy: { number: "asc" },
        },
      },
    });

    if (!participant || participant.numbers.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Nenhum bilhete confirmado/pago foi localizado para este CPF.",
        },
        { status: 404 }
      );
    }

    // 5. Validação dos 4 últimos dígitos do telefone
    const phoneDigits = (participant.whatsapp || "").replace(/\D/g, "");
    if (!phoneDigits.endsWith(cleanLast4)) {
      return NextResponse.json(
        {
          success: false,
          error: "Os 4 últimos dígitos não conferem com o telefone cadastrado para este CPF.",
        },
        { status: 400 }
      );
    }

    // 6. Dados da campanha
    const settings = await db.campaignSettings.findUnique({
      where: { id: "default" },
    });

    const maskedPhone =
      phoneDigits.length >= 8
        ? `(${phoneDigits.slice(0, 2)}) *****-${phoneDigits.slice(-4)}`
        : "WhatsApp cadastrado";

    return NextResponse.json({
      success: true,
      participant: {
        maskedName: maskName(participant.fullName),
        maskedCpf: maskCPF(participant.cpf),
        maskedPhone,
        totalTickets: participant.numbers.length,
      },
      drawInfo: {
        drawDate: settings?.drawDate || "2026-11-15",
        drawTime: settings?.drawTime || "19:00",
        prizeModel: settings?.prizeModel || "Honda CG 160 Start",
      },
      tickets: participant.numbers.map((n) => ({
        number: n.number,
        origin: n.origin,
        partnerName: n.partner ? `${n.partner.name} (${n.partner.neighborhood})` : null,
        purchaseCode: n.purchase?.code || "PRESENCIAL",
        purchasedAt: n.updatedAt,
        status: "CONFIRMADO / PAGO",
      })),
    });
  } catch (error) {
    console.error("Erro na rota /api/verify/lookup:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno ao consultar bilhetes." },
      { status: 500 }
    );
  }
}
