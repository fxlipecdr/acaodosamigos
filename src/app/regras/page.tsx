import db from "@/lib/db";
import LotteryVisualizer from "@/components/LotteryVisualizer";
import { FileText, Calendar, ShieldCheck, Scale, AlertTriangle, CheckCircle2, Award, Store } from "lucide-react";

export const revalidate = 0;

export default async function RegrasPage() {
  let settings: any = null;
  try {
    settings = await db.campaignSettings.findUnique({
      where: { id: "default" },
    });
  } catch (err) {
    console.error("Database read fallback in RegrasPage:", err);
  }

  const drawDateRaw = settings?.drawDate || "2026-11-15";
  const [year, month, day] = drawDateRaw.split("-");
  const formattedDrawDate = `${day}/${month}/${year}`;

  return (
    <div className="min-h-screen py-8 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-400 text-xs font-bold uppercase tracking-wider">
          <FileText className="w-3.5 h-3.5" />
          <span>REGULAMENTO & CRITÉRIOS DE APURAÇÃO</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-black text-foreground uppercase tracking-tight">
          REGRAS DA AÇÃO ENTRE AMIGOS
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Transparência total sobre a mecânica do sorteio, faixas de números, apuração pela Loteria Federal, bonificações e entrega do prêmio.
        </p>
      </div>

      {/* Partner Incentive Highlight Box */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-dark-850 to-primary-950/30 border-2 border-emerald-500/50 shadow-glow-emerald space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              INCENTIVO PARA ESTABELECIMENTOS PARCEIROS
            </span>
            <h3 className="text-lg sm:text-xl font-heading font-black text-foreground uppercase tracking-tight mt-1">
              BONIFICAÇÃO DE R$ 500,00 PARA OS 4 PRIMEIROS PDVS
            </h3>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Os <strong>4 (quatro) primeiros estabelecimentos comerciais parceiros</strong> que alcançarem a marca de <strong>100 (cem) números vendidos</strong> receberão uma <strong>bonificação extra de R$ 500,00 (quinhentos reais)</strong> cada um, paga pela organização além da comissão padrão acordada!
        </p>
      </div>

      {/* Quick Summary Highlights Box */}
      <div className="p-6 rounded-2xl bg-dark-850 border border-dark-700 shadow-premium-card space-y-4">
        <h3 className="font-heading font-black text-xs text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-dark-750 pb-3">
          <Scale className="w-4 h-4 text-primary-400" />
          RESUMO DOS PRINCIPAIS PARÂMETROS
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs uppercase font-semibold">
          <div className="p-3.5 rounded-xl bg-dark-900 border border-dark-750">
            <span className="text-slate-400 text-[11px] block">DATA PREVISTA DO SORTEIO:</span>
            <strong className="text-foreground text-sm mt-0.5 block">{formattedDrawDate} ÀS 19H</strong>
          </div>

          <div className="p-3.5 rounded-xl bg-dark-900 border border-dark-750">
            <span className="text-slate-400 text-[11px] block">TOTAL DE BILHETES:</span>
            <strong className="text-foreground text-sm mt-0.5 block">3.000 NÚMEROS (1000 A 3999)</strong>
          </div>

          <div className="p-3.5 rounded-xl bg-dark-900 border border-dark-750">
            <span className="text-slate-400 text-[11px] block">META MÍNIMA DE VENDAS:</span>
            <strong className="text-amber-400 text-sm mt-0.5 block">{settings?.minQuota || 1000} NÚMEROS VENDIDOS</strong>
          </div>

          <div className="p-3.5 rounded-xl bg-dark-900 border border-dark-750">
            <span className="text-slate-400 text-[11px] block">VALOR UNITÁRIO:</span>
            <strong className="text-foreground text-sm mt-0.5 block">R$ 30,00 POR NÚMERO</strong>
          </div>

          <div className="p-3.5 rounded-xl bg-dark-900 border border-dark-750">
            <span className="text-slate-400 text-[11px] block">PROMOÇÃO ONLINE:</span>
            <strong className="text-emerald-400 text-sm mt-0.5 block">3 NÚMEROS POR R$ 63,00</strong>
          </div>

          <div className="p-3.5 rounded-xl bg-dark-900 border border-dark-750">
            <span className="text-slate-400 text-[11px] block">BÔNUS 4 PRIMEIROS PDVS:</span>
            <strong className="text-emerald-400 text-sm mt-0.5 block">R$ 500 AO VENDER 100 NÚMEROS</strong>
          </div>

          <div className="p-3.5 rounded-xl bg-dark-900 border border-dark-750 sm:col-span-2 md:col-span-3">
            <span className="text-slate-400 text-[11px] block">FORMA DE APURAÇÃO:</span>
            <strong className="text-primary-400 text-sm mt-0.5 block">LOTERIA FEDERAL (4 ÚLTIMOS DÍGITOS DO 1º AO 5º PRÊMIO)</strong>
          </div>
        </div>
      </div>

      {/* Visualizer Component */}
      <LotteryVisualizer />

      {/* Full Regulation Text from DB */}
      <div className="p-6 sm:p-10 rounded-2xl bg-dark-850 border border-dark-700 shadow-premium-card space-y-6">
        <h3 className="text-xl font-heading font-black text-foreground uppercase tracking-tight border-b border-dark-750 pb-4">
          REGULAMENTO COMPLETO DA AÇÃO
        </h3>

        <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line font-sans space-y-4">
          {settings?.rulesText || "Regulamento em elaboração."}
        </div>
      </div>

      {/* Legal & Regulatory Disclaimer Card */}
      <div className="p-5 rounded-2xl bg-dark-900 border border-dark-750 text-xs text-slate-400 leading-relaxed space-y-2">
        <div className="flex items-center gap-2 text-slate-300 font-bold uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>INFORMAÇÃO SOBRE A REFERÊNCIA DA LOTERIA FEDERAL</span>
        </div>
        <p>
          A extração da Loteria Federal é utilizada estritamente como referencial público, auditável e independente para a determinação do bilhete premiado. A Caixa Econômica Federal não organiza, patrocina, avaliza ou comercializa bilhetes desta Ação Entre Amigos.
        </p>
      </div>

    </div>
  );
}
