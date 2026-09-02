import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { maskName } from "@/lib/cpf";
import { createAuditLog } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autorizado." }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    // AÇÃO 1: Alterar Data do Sorteio
    if (action === "UPDATE_DATE") {
      const { newDate, drawTime = "19:00", reason, drawNotice } = body;

      if (!newDate || !reason) {
        return NextResponse.json(
          { success: false, error: "Data e motivo da alteração são obrigatórios." },
          { status: 400 }
        );
      }

      const current = await db.campaignSettings.findUnique({ where: { id: "default" } });

      await db.campaignSettings.update({
        where: { id: "default" },
        data: {
          drawDate: newDate,
          drawTime,
          drawNotice: drawNotice?.trim() || `Data do sorteio alterada para ${newDate}. Motivo: ${reason}`,
        },
      });

      // Registrar no histórico público
      await db.drawHistory.create({
        data: {
          date: newDate,
          status: "POSTPONED",
          reason: reason.trim(),
          notes: drawNotice?.trim() || null,
        },
      });

      await createAuditLog({
        adminEmail: session.email,
        action: "UPDATE_DRAW_DATE",
        entityType: "CampaignSettings",
        oldValue: { drawDate: current?.drawDate },
        newValue: { drawDate: newDate, reason },
      });

      return NextResponse.json({
        success: true,
        message: "Data do sorteio e histórico atualizados com sucesso!",
      });
    }

    // AÇÃO 2: Simular / Conferir Resultado da Loteria Federal
    if (action === "CHECK_LOTTERY") {
      const { contestNumber, p1, p2, p3, p4, p5 } = body;

      const extract4 = (val: string) => {
        const clean = (val || "").replace(/\D/g, "");
        if (clean.length < 4) return null;
        return clean.slice(-4);
      };

      const n1 = extract4(p1);
      const n2 = extract4(p2);
      const n3 = extract4(p3);
      const n4 = extract4(p4);
      const n5 = extract4(p5);

      const checks = [
        { tier: 1, full: p1, extracted: n1 ? Number(n1) : null },
        { tier: 2, full: p2, extracted: n2 ? Number(n2) : null },
        { tier: 3, full: p3, extracted: n3 ? Number(n3) : null },
        { tier: 4, full: p4, extracted: n4 ? Number(n4) : null },
        { tier: 5, full: p5, extracted: n5 ? Number(n5) : null },
      ];

      // Buscar todos os números envolvidos que estejam pagos
      const validNumbers = checks.map((c) => c.extracted).filter((n): n is number => n !== null);

      const soldTickets = await db.raffleNumber.findMany({
        where: {
          number: { in: validNumbers },
          status: "PAID",
        },
        include: {
          participant: true,
          partner: true,
        },
      });

      const soldMap = new Map(soldTickets.map((t) => [t.number, t]));

      let matchWinner: any = null;

      const checkedPrizes = checks.map((c) => {
        if (!c.extracted) {
          return { ...c, isSold: false, status: "INVALID", ticket: null };
        }
        const ticket = soldMap.get(c.extracted);
        const isSold = !!ticket;

        if (isSold && !matchWinner) {
          matchWinner = {
            tier: c.tier,
            number: c.extracted,
            fullLotteryNumber: c.full,
            participant: ticket.participant,
            partner: ticket.partner,
          };
        }

        return {
          ...c,
          isSold,
          ticket: ticket
            ? {
                number: ticket.number,
                participantName: ticket.participant?.fullName,
                origin: ticket.origin,
              }
            : null,
        };
      });

      return NextResponse.json({
        success: true,
        contestNumber,
        checkedPrizes,
        hasWinner: !!matchWinner,
        winner: matchWinner,
      });
    }

    // AÇÃO 3: Publicar Resultado Oficial com Ganhador
    if (action === "PUBLISH_WINNER") {
      const {
        drawDate,
        lotteryContestNumber,
        prize1,
        prize2,
        prize3,
        prize4,
        prize5,
        winningPrizeTier,
        winningNumber,
        winnerParticipantId,
        notes,
      } = body;

      const participant = await db.participant.findUnique({
        where: { id: winnerParticipantId },
      });

      const maskedName = participant ? maskName(participant.fullName) : "Participante";

      const drawResult = await db.drawResult.upsert({
        where: { id: "current-draw" },
        update: {
          drawDate,
          lotteryContestNumber,
          prize1,
          prize2,
          prize3,
          prize4,
          prize5,
          winningPrizeTier: Number(winningPrizeTier),
          winningNumber: Number(winningNumber),
          winnerMaskedName: maskedName,
          winnerParticipantId,
          status: "COMPLETED",
          isPublished: true,
          notes,
        },
        create: {
          id: "current-draw",
          drawDate,
          lotteryContestNumber,
          prize1,
          prize2,
          prize3,
          prize4,
          prize5,
          winningPrizeTier: Number(winningPrizeTier),
          winningNumber: Number(winningNumber),
          winnerMaskedName: maskedName,
          winnerParticipantId,
          status: "COMPLETED",
          isPublished: true,
          notes,
        },
      });

      await db.drawHistory.create({
        data: {
          date: drawDate,
          contestNumber: lotteryContestNumber,
          status: "DRAW_HELD",
          reason: `Sorteio realizado! Ganhador contemplado no ${winningPrizeTier}º prêmio (Número ${winningNumber} - ${maskedName}).`,
          notes,
        },
      });

      await createAuditLog({
        adminEmail: session.email,
        action: "PUBLISH_DRAW_WINNER",
        entityType: "DrawResult",
        entityId: "current-draw",
        newValue: drawResult,
      });

      return NextResponse.json({
        success: true,
        message: `Resultado publicado oficialmente! Ganhador: ${maskedName} (Número ${winningNumber}).`,
      });
    }

    // AÇÃO 4: Declarar Apuração Pendente (Sem Ganhador)
    if (action === "DECLARE_PENDING") {
      const { contestNumber, nextDate, notes } = body;

      await db.drawResult.upsert({
        where: { id: "current-draw" },
        update: {
          status: "PENDING_NEW_DATE",
          notes: notes || "Nenhum número vendido nos 5 prêmios. Nova apuração agendada.",
          isPublished: true,
        },
        create: {
          id: "current-draw",
          drawDate: nextDate || "Próxima Semana",
          status: "PENDING_NEW_DATE",
          notes: notes || "Nenhum número vendido nos 5 prêmios. Nova apuração agendada.",
          isPublished: true,
        },
      });

      if (nextDate) {
        await db.campaignSettings.update({
          where: { id: "default" },
          data: {
            drawDate: nextDate,
            drawNotice: `Nova apuração agendada para ${nextDate}. Motivo: Nenhum dos 5 prêmios anteriores continha número vendido.`,
          },
        });
      }

      await db.drawHistory.create({
        data: {
          date: new Date().toLocaleDateString("pt-BR"),
          contestNumber,
          status: "PENDING_NEW_DATE",
          reason: "Nenhum dos 5 números correspondentes aos prêmios estava vendido.",
          notes,
        },
      });

      await createAuditLog({
        adminEmail: session.email,
        action: "DECLARE_DRAW_PENDING",
        entityType: "DrawResult",
        entityId: "current-draw",
      });

      return NextResponse.json({
        success: true,
        message: "Status de sorteio pendente registrado e nova apuração agendada com transparência!",
      });
    }

    return NextResponse.json({ success: false, error: "Ação inválida." }, { status: 400 });
  } catch (error: any) {
    console.error("Erro no módulo de sorteio:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
