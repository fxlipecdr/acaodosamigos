import { NextResponse } from "next/server";
import db from "@/lib/db";
import { maskName, maskCPF } from "@/lib/cpf";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, code } = body;

    if (!token || !code) {
      return NextResponse.json(
        { success: false, error: "Token e código são obrigatórios." },
        { status: 400 }
      );
    }

    const session = await db.verificationSession.findUnique({
      where: { token },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Sessão de verificação não encontrada ou expirada." },
        { status: 404 }
      );
    }

    if (new Date() > session.expiresAt) {
      return NextResponse.json(
        { success: false, error: "O código expirou. Solicite um novo código." },
        { status: 400 }
      );
    }

    if (session.code !== code.trim()) {
      return NextResponse.json(
        { success: false, error: "Código incorreto. Verifique os dígitos." },
        { status: 400 }
      );
    }

    // Marcar como verificado
    await db.verificationSession.update({
      where: { id: session.id },
      data: { verified: true },
    });

    // Buscar dados do participante e seus números pagos
    const participant = await db.participant.findUnique({
      where: { cpf: session.cpf },
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

    if (!participant) {
      return NextResponse.json(
        { success: false, error: "Participante não encontrado." },
        { status: 404 }
      );
    }

    // Obter data do sorteio
    const settings = await db.campaignSettings.findUnique({
      where: { id: "default" },
    });

    return NextResponse.json({
      success: true,
      participant: {
        maskedName: maskName(participant.fullName),
        maskedCpf: maskCPF(participant.cpf),
        totalTickets: participant.numbers.length,
      },
      drawInfo: {
        drawDate: settings?.drawDate || "2026-11-15",
        drawTime: settings?.drawTime || "19:00",
        prizeModel: settings?.prizeModel || "Honda CB 300F Twister 0km",
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
    console.error("Erro na confirmação OTP:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao confirmar código de segurança." },
      { status: 500 }
    );
  }
}
