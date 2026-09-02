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
    const {
      prizeModel,
      prizeYear,
      prizeColor,
      prizeMileage,
      prizeCondition,
      prizeDetails,
      prizeCoverImage,
      prizeImages,
      prizeVideoUrl,
    } = body;

    const current = await db.campaignSettings.findUnique({ where: { id: "default" } });

    const updated = await db.campaignSettings.upsert({
      where: { id: "default" },
      update: {
        prizeModel: prizeModel?.trim() || undefined,
        prizeYear: prizeYear?.trim() || undefined,
        prizeColor: prizeColor?.trim() || undefined,
        prizeMileage: prizeMileage?.trim() || undefined,
        prizeCondition: prizeCondition?.trim() || undefined,
        prizeDetails: prizeDetails?.trim() || undefined,
        prizeCoverImage: prizeCoverImage?.trim() || undefined,
        prizeImagesJson: prizeImages ? JSON.stringify(prizeImages) : undefined,
        prizeVideoUrl: prizeVideoUrl?.trim() || null,
      },
      create: {
        id: "default",
        prizeModel: prizeModel?.trim() || "Honda CB 300F Twister 0km",
        prizeYear: prizeYear?.trim() || "2025/2025",
        prizeColor: prizeColor?.trim() || "Vermelha Metálica",
        prizeMileage: prizeMileage?.trim() || "0 km",
        prizeCondition: prizeCondition?.trim() || "Nova e emplacada",
        prizeDetails: prizeDetails?.trim() || "",
        prizeCoverImage: prizeCoverImage?.trim() || "/placeholders/moto-hero.webp",
        prizeImagesJson: prizeImages ? JSON.stringify(prizeImages) : "[]",
        prizeVideoUrl: prizeVideoUrl?.trim() || null,
        rulesText: "",
      },
    });

    await createAuditLog({
      adminEmail: session.email,
      action: "UPDATE_PRIZE_SPECS_AND_PHOTOS",
      entityType: "CampaignSettings",
      entityId: "default",
      oldValue: current,
      newValue: updated,
    });

    return NextResponse.json({
      success: true,
      message: "Dados da motocicleta e fotos atualizados com sucesso!",
    });
  } catch (error: any) {
    console.error("Erro ao atualizar dados da moto:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
