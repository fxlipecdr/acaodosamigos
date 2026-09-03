import db from "./db";
import { PrismaClient } from "@prisma/client";

type DbClient = PrismaClient | Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];

/**
 * Limpa atômica e confiavelmente reservas expiradas, incluindo RESERVED e PENDING_PAYMENT.
 * 
 * Números que tiveram o Pix gerado mas não foram pagos em até 15 minutos são
 * liberados de volta para a grade como AVAILABLE para que outros participantes possam comprar.
 */
export async function cleanExpiredReservations(client: DbClient = db): Promise<number> {
  const now = new Date();

  try {
    // 1. Identificar números expirados
    const expiredNumbers = await client.raffleNumber.findMany({
      where: {
        status: { in: ["RESERVED", "PENDING_PAYMENT"] },
        reservedUntil: {
          lt: now,
        },
      },
      select: {
        number: true,
        purchaseId: true,
      },
    });

    if (expiredNumbers.length === 0) {
      return 0;
    }

    const numbersToRelease = expiredNumbers.map((n) => n.number);
    const purchaseIds = Array.from(
      new Set(expiredNumbers.map((n) => n.purchaseId).filter((id): id is string => Boolean(id)))
    );

    // 2. Liberar os números de volta para AVAILABLE
    const updateResult = await client.raffleNumber.updateMany({
      where: {
        number: { in: numbersToRelease },
      },
      data: {
        status: "AVAILABLE",
        reservedUntil: null,
        reservationSessionId: null,
        participantId: null,
        purchaseId: null,
      },
    });

    // 3. Atualizar compras pendentes associadas que expiraram
    if (purchaseIds.length > 0) {
      await client.purchase.updateMany({
        where: {
          id: { in: purchaseIds },
          status: "PENDING",
        },
        data: {
          status: "EXPIRED",
        },
      });

      await client.payment.updateMany({
        where: {
          purchaseId: { in: purchaseIds },
          status: "PENDING",
        },
        data: {
          status: "EXPIRED",
        },
      });
    }

    return updateResult.count;
  } catch (err) {
    console.error("Erro ao limpar reservas expiradas:", err);
    return 0;
  }
}
