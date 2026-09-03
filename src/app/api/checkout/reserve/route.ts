import { NextResponse } from "next/server";
import db from "@/lib/db";
import crypto from "crypto";
import { getOnlineRange, validateOnlineNumbers } from "@/lib/onlineRange";
import { cleanExpiredReservations } from "@/lib/reservations";
import { checkRateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    // Proteção contra robôs e reservas massivas abusivas
    const rateLimit = checkRateLimit(request, {
      keyPrefix: "reserve",
      limit: 12,
      windowMs: 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Muitas tentativas de reserva. Aguarde ${rateLimit.resetInSeconds} segundos para tentar novamente.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { numbers, sessionId } = body;

    // A faixa online é imposta aqui, não só na tela: a grade esconde os
    // números presenciais, mas qualquer requisição direta chegaria sem eles.
    const range = await getOnlineRange();
    const rangeError = validateOnlineNumbers(numbers, range);
    if (rangeError) {
      return NextResponse.json(
        { success: false, error: rangeError },
        { status: 400 }
      );
    }

    const currentSessionId = sessionId || crypto.randomUUID();
    const reservationMinutes = 15;
    const expiresAt = new Date(Date.now() + reservationMinutes * 60 * 1000);
    const now = new Date();

    // Executa em transação atômica
    const result = await db.$transaction(async (tx) => {
      // 1. Limpar todas as reservas expiradas (RESERVED e PENDING_PAYMENT)
      await cleanExpiredReservations(tx);

      // 2. Buscar status atual de todos os números solicitados
      const currentNumbers = await tx.raffleNumber.findMany({
        where: {
          number: { in: numbers },
        },
      });

      // 3. Checar se algum número não está disponível para esta sessão
      const unavailable = currentNumbers.filter((n) => {
        if (n.status === "PAID" || n.status === "BLOCKED") return true;
        if (
          (n.status === "RESERVED" || n.status === "PENDING_PAYMENT") &&
          n.reservationSessionId !== currentSessionId
        ) {
          return true;
        }
        return false;
      });

      if (unavailable.length > 0) {
        return {
          success: false,
          error: "Alguns números selecionados acabaram de ser reservados ou vendidos por outro participante.",
          unavailableNumbers: unavailable.map((u) => u.number),
        };
      }

      // 4. Se todos estão liberados, efetua a reserva atômica
      await tx.raffleNumber.updateMany({
        where: {
          number: { in: numbers },
        },
        data: {
          status: "RESERVED",
          reservationSessionId: currentSessionId,
          reservedUntil: expiresAt,
        },
      });

      return {
        success: true,
        sessionId: currentSessionId,
        expiresAt: expiresAt.toISOString(),
        reservedCount: numbers.length,
      };
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 409 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro na rota /api/checkout/reserve:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao processar reserva dos números." },
      { status: 500 }
    );
  }
}
