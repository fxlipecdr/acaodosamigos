"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import { 
  CheckCircle2, 
  Ticket, 
  Download, 
  Search, 
  MessageCircle, 
  Calendar, 
  ShieldCheck, 
  Printer, 
  Sparkles,
  ArrowRight
} from "lucide-react";
import { formatCurrency } from "@/lib/pricing";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get("code");

  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code) {
      router.push("/");
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/checkout/status?code=${code}`);
        const data = await res.json();
        if (data.success) {
          setOrderData(data);
          // Trigger confetti on successful load
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#F59E0B", "#10B981", "#3B82F6", "#FDE047"],
          });
        }
      } catch (err) {
        console.error("Erro ao buscar pedido:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [code, router]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center text-slate-400">
          <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold uppercase tracking-wider">CARREGANDO COMPROVANTE...</p>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-dark-850 rounded-2xl border border-dark-700 text-center space-y-4">
        <p className="text-sm text-red-400 font-bold uppercase">PEDIDO NÃO LOCALIZADO.</p>
        <Link href="/" className="inline-block px-4 py-2 bg-dark-800 text-slate-200 text-xs font-bold uppercase rounded-xl">
          VOLTAR AO INÍCIO
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 sm:py-16 max-w-2xl mx-auto px-4 sm:px-6">
      
      {/* Printable Receipt Frame */}
      <div className="p-6 sm:p-10 rounded-3xl bg-dark-850 border border-emerald-500/40 shadow-glow-emerald space-y-8 print:bg-white print:text-black print:border-black">
        
        {/* Success Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-glow-emerald animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider">
            PAGAMENTO CONFIRMADO
          </span>

          <h1 className="text-3xl sm:text-4xl font-heading font-black text-foreground uppercase tracking-tight print:text-black">
            BOA SORTE! PARABÉNS!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 print:text-gray-700">
            Seu pagamento foi confirmado com sucesso e seus números já estão oficialmente concorrendo à moto!
          </p>
        </div>

        {/* Numbers Acquired Badge Grid */}
        <div className="p-6 rounded-2xl bg-dark-900 border border-dark-750 text-center space-y-3 print:bg-gray-100 print:border-gray-300">
          <span className="text-xs font-bold text-primary-400 uppercase tracking-wider print:text-black">
            SEUS NÚMEROS DA SORTE ({orderData.numbers?.length})
          </span>

          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            {orderData.numbers?.map((num: number) => (
              <div
                key={num}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-primary-500 to-amber-500 text-dark-900 font-mono font-black text-xl shadow-glow-primary print:bg-gray-800 print:text-white"
              >
                {num}
              </div>
            ))}
          </div>
        </div>

        {/* Purchase Metadata Details */}
        <div className="p-5 rounded-2xl bg-dark-900/60 border border-dark-750/80 space-y-3 text-xs print:bg-transparent print:border-gray-300 uppercase font-semibold">
          <div className="flex justify-between py-1.5 border-b border-dark-800 print:border-gray-200">
            <span className="text-slate-400 print:text-gray-600">PARTICIPANTE:</span>
            <strong className="text-foreground print:text-black font-bold">{orderData.participantName}</strong>
          </div>

          <div className="flex justify-between py-1.5 border-b border-dark-800 print:border-gray-200">
            <span className="text-slate-400 print:text-gray-600">CÓDIGO DA COMPRA:</span>
            <strong className="text-primary-400 font-mono font-black print:text-black">{orderData.orderCode}</strong>
          </div>

          <div className="flex justify-between py-1.5 border-b border-dark-800 print:border-gray-200">
            <span className="text-slate-400 print:text-gray-600">VALOR TOTAL PAGO:</span>
            <strong className="text-emerald-400 font-mono font-black text-sm print:text-black">
              {formatCurrency(orderData.totalPaid ?? 0)}
            </strong>
          </div>

          <div className="flex justify-between py-1.5 border-b border-dark-800 print:border-gray-200">
            <span className="text-slate-400 print:text-gray-600">FORMA DE PAGAMENTO:</span>
            <strong className="text-foreground print:text-black">PIX INSTANTÂNEO</strong>
          </div>

          <div className="flex justify-between py-1.5">
            <span className="text-slate-400 print:text-gray-600">DATA DA CONFIRMAÇÃO:</span>
            <strong className="text-foreground print:text-black font-mono">
              {new Date().toLocaleString("pt-BR")}
            </strong>
          </div>
        </div>

        {/* Action Buttons (Hidden when printing) */}
        <div className="space-y-3 print:hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handlePrint}
              className="py-3 px-4 rounded-xl bg-dark-800 hover:bg-dark-750 text-slate-200 border border-dark-700 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
            >
              <Printer className="w-4 h-4 text-primary-400" />
              <span>SALVAR / IMPRIMIR COMPROVANTE</span>
            </button>

            <Link
              href="/meus-numeros"
              className="py-3 px-4 rounded-xl bg-dark-800 hover:bg-dark-750 text-slate-200 border border-dark-700 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
            >
              <Search className="w-4 h-4 text-primary-400" />
              <span>CONSULTAR COTAS POR CPF</span>
            </Link>
          </div>

          <Link
            href="/"
            className="w-full py-3.5 rounded-xl bg-primary-500 hover:bg-primary-400 text-dark-900 font-black text-xs uppercase tracking-wider text-center shadow-glow-primary flex items-center justify-center gap-2 transition-all"
          >
            <span>VOLTAR PARA A PÁGINA INICIAL</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>

    </div>
  );
}

export default function ConfirmacaoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center text-xs font-bold uppercase tracking-wider text-slate-400">
        CARREGANDO...
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}
