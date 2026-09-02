import { NextResponse } from "next/server";
import db from "@/lib/db";
import { cleanCPF, validateCPF } from "@/lib/cpf";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cpf } = body;

    const cleanedCpf = cleanCPF(cpf || "");
    if (!validateCPF(cleanedCpf)) {
      return NextResponse.json(
        { success: false, error: "CPF inválido. Verifique os números digitados." },
        { status: 400 }
      );
    }

    const participant = await db.participant.findUnique({
      where: { cpf: cleanedCpf },
      include: {
        numbers: {
          where: { status: "PAID" },
        },
      },
    });

    if (!participant || participant.numbers.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Nenhum número pago ou cadastrado foi encontrado para este CPF.",
        },
        { status: 404 }
      );
    }

    // Gerar código de verificação de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const token = crypto.randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await db.verificationSession.create({
      data: {
        cpf: cleanedCpf,
        code,
        token,
        expiresAt,
        verified: false,
      },
    });

    // Mascarar telefone para exibição (ex: (48) *****-1234)
    const phone = participant.whatsapp || "";
    const maskedPhone =
      phone.length >= 8
        ? `(${phone.slice(0, 2)}) *****-${phone.slice(-4)}`
        : "WhatsApp cadastrado";

    return NextResponse.json({
      success: true,
      message: `Código de verificação enviado para o ${maskedPhone}.`,
      maskedPhone,
      token,
      // Em modo dev/demonstração enviamos o código de teste no response para facilidade de uso
      demoCode: process.env.NODE_ENV !== "production" ? code : undefined,
    });
  } catch (error) {
    console.error("Erro na solicitação de código OTP:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao gerar verificação de segurança." },
      { status: 500 }
    );
  }
}
