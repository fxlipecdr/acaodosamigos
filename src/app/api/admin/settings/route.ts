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
    const current = await db.campaignSettings.findUnique({ where: { id: "default" } });

    const updated = await db.campaignSettings.upsert({
      where: { id: "default" },
      update: {
        title: body.title,
        subtitle: body.subtitle,
        whatsappNumber: body.whatsappNumber,
        whatsappMessage: body.whatsappMessage,
        contactEmail: body.contactEmail,
        instagramUrl: body.instagramUrl,
        unitPrice: Number(body.unitPrice),
        promoBundleSize: Number(body.promoBundleSize),
        promoBundlePrice: Number(body.promoBundlePrice),
        startNumber: Number(body.startNumber),
        endNumber: Number(body.endNumber),
        presencialStart: Number(body.presencialStart),
        presencialEnd: Number(body.presencialEnd),
        onlineStart: Number(body.onlineStart),
        onlineEnd: Number(body.onlineEnd),
        minQuota: Number(body.minQuota),
        rulesText: body.rulesText,
        paymentsEnabled: Boolean(body.paymentsEnabled),
        activeGateway: body.activeGateway,
      },
      create: {
        id: "default",
        title: body.title || "Ação Entre Amigos da Moto 0km",
        subtitle: body.subtitle || "",
        whatsappNumber: body.whatsappNumber || "+5548992178109",
        whatsappMessage: body.whatsappMessage || "Olá!",
        rulesText: body.rulesText || "",
        unitPrice: Number(body.unitPrice) || 30.0,
        promoBundleSize: Number(body.promoBundleSize) || 3,
        promoBundlePrice: Number(body.promoBundlePrice) || 63.0,
      },
    });

    await createAuditLog({
      adminEmail: session.email,
      action: "UPDATE_CAMPAIGN_SETTINGS",
      entityType: "CampaignSettings",
      entityId: "default",
      oldValue: current,
      newValue: updated,
    });

    return NextResponse.json({
      success: true,
      message: "Configurações gerais atualizadas com sucesso!",
    });
  } catch (error: any) {
    console.error("Erro ao atualizar configurações:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
