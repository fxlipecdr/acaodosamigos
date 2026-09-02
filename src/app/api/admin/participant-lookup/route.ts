import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { cleanCPF } from "@/lib/cpf";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Não autorizado." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cpf = cleanCPF(searchParams.get("cpf") || "");

    if (cpf.length !== 11) {
      return NextResponse.json({ success: false, found: false });
    }

    const participant = await db.participant.findUnique({
      where: { cpf },
    });

    if (!participant) {
      return NextResponse.json({ success: true, found: false });
    }

    return NextResponse.json({
      success: true,
      found: true,
      participant: {
        fullName: participant.fullName,
        whatsapp: participant.whatsapp,
        email: participant.email,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Erro na busca." }, { status: 500 });
  }
}
