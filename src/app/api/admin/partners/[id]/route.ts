import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autorizado." }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const current = await db.partner.findUnique({ where: { id } });
    if (!current) {
      return NextResponse.json({ success: false, error: "Parceiro não encontrado." }, { status: 404 });
    }

    const updated = await db.partner.update({
      where: { id },
      data: {
        name: body.name !== undefined ? body.name.trim() : undefined,
        tradeName: body.tradeName !== undefined ? body.tradeName?.trim() : undefined,
        contactName: body.contactName !== undefined ? body.contactName?.trim() : undefined,
        phone: body.phone !== undefined ? body.phone?.trim() : undefined,
        whatsapp: body.whatsapp !== undefined ? body.whatsapp?.trim() : undefined,
        neighborhood: body.neighborhood !== undefined ? body.neighborhood.trim() : undefined,
        address: body.address !== undefined ? body.address?.trim() : undefined,
        number: body.number !== undefined ? String(body.number).trim() : undefined,
        complement: body.complement !== undefined ? body.complement?.trim() : undefined,
        cep: body.cep !== undefined ? body.cep.trim() : undefined,
        city: body.city !== undefined ? body.city.trim() : undefined,
        googleMapsUrl: body.googleMapsUrl !== undefined ? body.googleMapsUrl?.trim() : undefined,
        commissionRate: body.commissionRate !== undefined ? Number(body.commissionRate) : undefined,
        notes: body.notes !== undefined ? body.notes?.trim() : undefined,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : undefined,
      },
    });

    await createAuditLog({
      adminEmail: session.email,
      action: "UPDATE_PARTNER",
      entityType: "Partner",
      entityId: id,
      oldValue: current,
      newValue: updated,
    });

    return NextResponse.json({ success: true, partner: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
