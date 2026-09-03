import { NextResponse } from "next/server";
import db from "@/lib/db";
import { cleanCPF, validateCPF } from "@/lib/cpf";
import { calculateOrderPrice } from "@/lib/pricing";
import { generatePixPayload, generateQrCodeDataUrl } from "@/lib/pix";
import crypto from "crypto";
import { getOnlineRange, validateOnlineNumbers } from "@/lib/onlineRange";
import { checkRateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const rateLimit = checkRateLimit(request, {
      keyPrefix: "pix",
      limit: 6,
      windowMs: 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Muitas tentativas de geração de Pix. Aguarde ${rateLimit.resetInSeconds} segundos para tentar novamente.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      fullName,
      cpf,
      whatsapp,
      email,
      numbers,
      agreedRules,
      referralSlug,
    } = body;

    // 1. Validações básicas de entrada
    if (!fullName || fullName.trim().split(/\s+/).length < 2) {
      return NextResponse.json(
        { success: false, error: "Por favor, informe seu nome completo." },
        { status: 400 }
      );
    }

    const cleanedCpf = cleanCPF(cpf || "");
    if (!validateCPF(cleanedCpf)) {
      return NextResponse.json(
        { success: false, error: "CPF inválido. Verifique os dígitos digitados." },
        { status: 400 }
      );
    }

    const cleanedPhone = (whatsapp || "").replace(/\D/g, "");
    if (cleanedPhone.length < 10 || cleanedPhone.length > 13) {
      return NextResponse.json(
        { success: false, error: "Por favor, informe um WhatsApp válido com DDD." },
        { status: 400 }
      );
    }

    if (!agreedRules) {
      return NextResponse.json(
        { success: false, error: "Você precisa aceitar o regulamento da ação para continuar." },
        { status: 400 }
      );
    }

    // Mesma trava da rota de reserva: a cobrança nunca pode ser gerada para um
    // número fora da faixa online, mesmo que a reserva tenha sido burlada.
    const onlineRange = await getOnlineRange();
    const rangeError = validateOnlineNumbers(numbers, onlineRange);
    if (rangeError) {
      return NextResponse.json(
        { success: false, error: rangeError },
        { status: 400 }
      );
    }

    // 2. Carregar configurações da campanha para recálculo de preço no servidor
    const settings = await db.campaignSettings.findUnique({
      where: { id: "default" },
    });

    const unitPrice = settings?.unitPrice || 30.0;
    const bundleSize = settings?.promoBundleSize || 3;
    const bundlePrice = settings?.promoBundlePrice || 63.0;

    const pricing = calculateOrderPrice(numbers.length, unitPrice, bundleSize, bundlePrice);
    const orderCode = `LDPG-${Math.floor(100000 + Math.random() * 900000)}`;

    const expirationMinutes = 15;
    const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

    // 3. Execução Transacional Atômica
    const purchaseResult = await db.$transaction(async (tx) => {
      // a) Verificar números novamente
      const currentNumbers = await tx.raffleNumber.findMany({
        where: { number: { in: numbers } },
      });

      const alreadyPaid = currentNumbers.filter((n) => n.status === "PAID" || n.status === "BLOCKED");
      if (alreadyPaid.length > 0) {
        throw new Error(`Os seguintes números já foram vendidos: ${alreadyPaid.map((n) => n.number).join(", ")}`);
      }

      // b) Criar ou atualizar Participante
      const participant = await tx.participant.upsert({
        where: { cpf: cleanedCpf },
        update: {
          fullName: fullName.trim(),
          whatsapp: cleanedPhone,
          email: email?.trim() || null,
        },
        create: {
          fullName: fullName.trim(),
          cpf: cleanedCpf,
          whatsapp: cleanedPhone,
          email: email?.trim() || null,
        },
      });

      // c) Criar Pedido (Purchase)
      const purchase = await tx.purchase.create({
        data: {
          code: orderCode,
          participantId: participant.id,
          origin: "ONLINE",
          totalOriginal: pricing.originalTotal,
          discountAmount: pricing.discountAmount,
          totalPaid: pricing.finalTotal,
          status: "PENDING",
          referralSlug: referralSlug || null,
        },
      });

      // d) Criar Itens do Pedido
      const averageItemPrice = pricing.finalTotal / numbers.length;
      for (const num of numbers) {
        await tx.purchaseItem.create({
          data: {
            purchaseId: purchase.id,
            number: num,
            unitPrice: unitPrice,
            discount: unitPrice - averageItemPrice,
            finalPrice: averageItemPrice,
          },
        });
      }

      // e) Atualizar Números para PENDING_PAYMENT
      await tx.raffleNumber.updateMany({
        where: { number: { in: numbers } },
        data: {
          status: "PENDING_PAYMENT",
          participantId: participant.id,
          purchaseId: purchase.id,
          reservedUntil: expiresAt,
        },
      });

      // f) Gerar Pix
      const pixKey = (settings?.whatsappNumber || "48992178109").replace(/\D/g, "");
      const pixPayload = generatePixPayload({
        key: pixKey,
        name: "ACAO DOS AMIGOS MOTO",
        city: "TUBARAO",
        amount: pricing.finalTotal,
        txid: orderCode.replace("-", ""),
        description: `Rifa Moto - ${numbers.length} cotas`,
      });

      const qrCodeBase64 = await generateQrCodeDataUrl(pixPayload);

      // g) Registrar Pagamento no banco
      const payment = await tx.payment.create({
        data: {
          purchaseId: purchase.id,
          gateway: settings?.activeGateway || "MOCK_PIX",
          amount: pricing.finalTotal,
          pixCopiaECola: pixPayload,
          qrCodeBase64,
          status: "PENDING",
          expiresAt,
        },
      });

      return {
        purchaseId: purchase.id,
        orderCode: purchase.code,
        participant: {
          fullName: participant.fullName,
          cpf: participant.cpf,
        },
        pricing,
        payment: {
          id: payment.id,
          pixCopiaECola: payment.pixCopiaECola,
          qrCodeBase64: payment.qrCodeBase64,
          expiresAt: payment.expiresAt,
          amount: payment.amount,
        },
      };
    });

    return NextResponse.json({
      success: true,
      ...purchaseResult,
    });
  } catch (error: any) {
    console.error("Erro ao gerar Pix no checkout:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Falha ao processar pagamento. Tente novamente.",
      },
      { status: 400 }
    );
  }
}
