import { NextResponse } from "next/server";
import db from "@/lib/db";
import { cleanExpiredReservations } from "@/lib/reservations";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const mode = searchParams.get("mode") || "ONLINE"; // ONLINE or ALL

    // 1. Limpeza atômica de reservas expiradas antes de responder (RESERVED e PENDING_PAYMENT)
    await cleanExpiredReservations(db);

    const settings = await db.campaignSettings.findUnique({
      where: { id: "default" },
    });

    const onlineStart = settings?.onlineStart || 3000;
    const onlineEnd = settings?.onlineEnd || 3999;

    // Condição de busca
    const whereCondition: any = {};

    if (mode === "ONLINE") {
      whereCondition.number = {
        gte: onlineStart,
        lte: onlineEnd,
      };
    }

    if (search && !isNaN(Number(search))) {
      whereCondition.number = Number(search);
    }

    const numbers = await db.raffleNumber.findMany({
      where: whereCondition,
      select: {
        number: true,
        status: true,
        origin: true,
      },
      orderBy: {
        number: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      settings: {
        unitPrice: settings?.unitPrice || 30.0,
        promoBundleSize: settings?.promoBundleSize || 3,
        promoBundlePrice: settings?.promoBundlePrice || 63.0,
        onlineStart,
        onlineEnd,
      },
      numbers,
    });
  } catch (error) {
    console.error("Erro na rota /api/numbers:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao carregar números." },
      { status: 500 }
    );
  }
}
