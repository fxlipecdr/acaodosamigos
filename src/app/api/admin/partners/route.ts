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
      name,
      tradeName,
      contactName,
      phone,
      whatsapp,
      neighborhood,
      address,
      number,
      complement,
      cep,
      city = "Tubarão / SC",
      googleMapsUrl,
      commissionRate = 30.0,
      notes,
      isActive = true,
    } = body;

    if (!name || !neighborhood || !cep || !number) {
      return NextResponse.json(
        { success: false, error: "Nome, Bairro, CEP e Número são obrigatórios." },
        { status: 400 }
      );
    }

    // Gerar slug único
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
    const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

    const partner = await db.partner.create({
      data: {
        slug,
        name: name.trim(),
        tradeName: tradeName?.trim() || null,
        contactName: contactName?.trim() || null,
        phone: phone?.trim() || null,
        whatsapp: whatsapp?.trim() || null,
        neighborhood: neighborhood.trim(),
        address: address?.trim() || null,
        number: String(number).trim(),
        complement: complement?.trim() || null,
        cep: cep.trim(),
        city: city.trim(),
        googleMapsUrl: googleMapsUrl?.trim() || null,
        commissionRate: Number(commissionRate) || 30.0,
        notes: notes?.trim() || null,
        isActive: Boolean(isActive),
      },
    });

    await createAuditLog({
      adminEmail: session.email,
      action: "CREATE_PARTNER",
      entityType: "Partner",
      entityId: partner.id,
      newValue: partner,
    });

    return NextResponse.json({
      success: true,
      message: "Ponto de venda cadastrado com sucesso!",
      partner,
    });
  } catch (error: any) {
    console.error("Erro ao cadastrar parceiro:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
