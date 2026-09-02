import db from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  DollarSign, 
  Ticket, 
  Users, 
  Store, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  ShoppingBag, 
  Trophy, 
  ArrowUpRight,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { formatCurrency } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  // Aggregate stats from DB
  const [
    settings,
    totalNumbersCount,
    soldOnlineCount,
    soldPresentialCount,
    reservedCount,
    totalParticipantsCount,
    partners,
    recentSales,
    drawResult,
  ] = await Promise.all([
    db.campaignSettings.findUnique({ where: { id: "default" } }),
    db.raffleNumber.count(),
    db.raffleNumber.count({ where: { status: "PAID", origin: "ONLINE" } }),
    db.raffleNumber.count({ where: { status: "PAID", origin: "PRESENTIAL" } }),
    db.raffleNumber.count({ where: { status: "RESERVED" } }),
    db.participant.count(),
    db.partner.findMany({
      include: {
        numbers: { where: { status: "PAID" } },
      },
    }),
    db.raffleNumber.findMany({
      where: { status: "PAID" },
      orderBy: { updatedAt: "desc" },
      take: 8,
      include: {
        participant: true,
        partner: true,
      },
    }),
    db.drawResult.findFirst({ where: { id: "current-draw" } }),
  ]);

  const totalSold = soldOnlineCount + soldPresentialCount;
  const totalAvailable = Math.max(0, totalNumbersCount - totalSold - reservedCount);
  const percentageSold = totalNumbersCount > 0 ? Math.round((totalSold / totalNumbersCount) * 100) : 0;

  // Compute Revenue
  const onlineRevenue = await db.purchase.aggregate({
    where: { status: "COMPLETED" },
    _sum: { totalPaid: true },
  });

  const totalOnlinePaid = onlineRevenue._sum.totalPaid || 0;
  const totalPresentialPaid = soldPresentialCount * 30.0;
  const totalGrossRevenue = totalOnlinePaid + totalPresentialPaid;

  // Compute total partner commissions (30% default)
  let totalEstimatedCommissions = 0;
  partners.forEach((p) => {
    const partnerSalesVal = p.numbers.length * 30.0;
    const commission = (partnerSalesVal * p.commissionRate) / 100;
    totalEstimatedCommissions += commission;
  });

  const drawDateRaw = settings?.drawDate || "2026-11-15";
  const [year, month, day] = drawDateRaw.split("-");
  const formattedDrawDate = `${day}/${month}/${year}`;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-dark-750">
        <div>
          <span className="text-xs font-bold text-primary-400 uppercase tracking-wider">
            PAINEL GERAL DE CONTROLE
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-foreground mt-0.5 uppercase tracking-tight">
            VISÃO GERAL DA AÇÃO
          </h1>
          <p className="text-xs text-slate-400">
            Acompanhe a arrecadação, vendas online, vendas presenciais e comissões em tempo real.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/venda-presencial"
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-dark-900 font-black text-xs uppercase tracking-wider shadow-glow-emerald flex items-center gap-1.5 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>NOVA VENDA PRESENCIAL</span>
          </Link>

          <Link
            href="/admin/sorteio"
            className="px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-400 text-dark-900 font-black text-xs uppercase tracking-wider shadow-glow-primary flex items-center gap-1.5 transition-all"
          >
            <Trophy className="w-4 h-4" />
            <span>APURAÇÃO LOTERIA FEDERAL</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Gross Revenue */}
        <div className="p-5 rounded-2xl bg-dark-850 border border-dark-750 space-y-2 shadow-premium-card">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>ARRECADAÇÃO BRUTA</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-heading font-black text-emerald-400 font-mono">
            {formatCurrency(totalGrossRevenue)}
          </p>
          <div className="text-[11px] text-slate-400 flex justify-between pt-1 border-t border-dark-750 uppercase font-semibold">
            <span>ONLINE: {formatCurrency(totalOnlinePaid)}</span>
            <span>PDV: {formatCurrency(totalPresentialPaid)}</span>
          </div>
        </div>

        {/* Total Sold */}
        <div className="p-5 rounded-2xl bg-dark-850 border border-dark-750 space-y-2 shadow-premium-card">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>TOTAL VENDIDO</span>
            <Ticket className="w-4 h-4 text-primary-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-heading font-black text-foreground font-mono">
            {totalSold} <span className="text-xs text-slate-400 font-sans">/ {totalNumbersCount}</span>
          </p>
          <div className="text-[11px] text-slate-400 flex justify-between pt-1 border-t border-dark-750 uppercase font-semibold">
            <span>{percentageSold}% DO TOTAL</span>
            <span>{totalAvailable} DISPONÍVEIS</span>
          </div>
        </div>

        {/* Online vs Physical Breakdown */}
        <div className="p-5 rounded-2xl bg-dark-850 border border-dark-750 space-y-2 shadow-premium-card">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>ORIGEM DAS VENDAS</span>
            <Store className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-mono font-bold text-primary-400">{soldOnlineCount} online</span>
            <span className="text-slate-500">•</span>
            <span className="text-lg font-mono font-bold text-slate-200">{soldPresentialCount} físico</span>
          </div>
          <div className="text-[11px] text-slate-400 flex justify-between pt-1 border-t border-dark-750 uppercase font-semibold">
            <span>PARTICIPANTES: {totalParticipantsCount}</span>
            <span>RESERVAS: {reservedCount}</span>
          </div>
        </div>

        {/* Draw Date & Quota status */}
        <div className="p-5 rounded-2xl bg-dark-850 border border-dark-750 space-y-2 shadow-premium-card">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>DATA PREVISTA</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl sm:text-2xl font-heading font-black text-foreground">
            {formattedDrawDate}
          </p>
          <div className="text-[11px] text-slate-400 flex justify-between pt-1 border-t border-dark-750 uppercase font-semibold">
            <span>META: {settings?.minQuota || 1000}</span>
            <span className={totalSold >= (settings?.minQuota || 1000) ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
              {totalSold >= (settings?.minQuota || 1000) ? "META ATINGIDA" : `${totalSold}/${settings?.minQuota || 1000}`}
            </span>
          </div>
        </div>

      </div>

      {/* Progress Bars */}
      <div className="p-6 rounded-2xl bg-dark-850 border border-dark-700 space-y-4">
        <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
          <span className="text-slate-300">META MÍNIMA DE VENDAS PARA SORTEIO</span>
          <span className="text-primary-400 font-mono font-bold">
            {totalSold} DE {settings?.minQuota || 1000} NÚMEROS ({Math.min(100, Math.round((totalSold / (settings?.minQuota || 1000)) * 100))}%)
          </span>
        </div>
        <div className="w-full h-3 bg-dark-900 rounded-full overflow-hidden border border-dark-750">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-emerald-400 rounded-full transition-all"
            style={{ width: `${Math.min(100, Math.max(3, (totalSold / (settings?.minQuota || 1000)) * 100))}%` }}
          />
        </div>
      </div>

      {/* Two Columns: Recent Sales & Partner Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Sales (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-dark-850 border border-dark-700 space-y-4 shadow-premium-card">
          <div className="flex items-center justify-between border-b border-dark-750 pb-3">
            <h3 className="font-heading font-black text-xs text-foreground uppercase tracking-wider flex items-center gap-2">
              <Ticket className="w-4 h-4 text-primary-400" />
              ÚLTIMOS NÚMEROS VENDIDOS
            </h3>
            <Link href="/admin/numeros" className="text-xs font-bold uppercase tracking-wider text-primary-400 hover:underline">
              VER TODOS
            </Link>
          </div>

          <div className="space-y-2">
            {recentSales.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center font-bold uppercase">NENHUMA VENDA REGISTRADA AINDA</p>
            ) : (
              recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="p-3 rounded-xl bg-dark-900 border border-dark-750 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-lg bg-primary-500/20 text-primary-400 font-mono font-black text-sm border border-primary-500/30">
                      {sale.number}
                    </span>
                    <div>
                      <strong className="text-foreground block truncate max-w-[160px] sm:max-w-xs uppercase">
                        {sale.participant?.fullName || "PARTICIPANTE"}
                      </strong>
                      <span className="text-[11px] text-slate-500 uppercase font-semibold">
                        {sale.origin === "PRESENTIAL" ? `PDV: ${sale.partner?.name || "PRESENCIAL"}` : "VENDA ONLINE"}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-emerald-400 font-bold font-mono">
                      {sale.pricePaid ? formatCurrency(sale.pricePaid) : "R$ 30,00"}
                    </span>
                    <span className="text-[10px] text-slate-500 block font-mono">
                      {new Date(sale.updatedAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Partners Performance (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-dark-850 border border-dark-700 space-y-4 shadow-premium-card">
          <div className="flex items-center justify-between border-b border-dark-750 pb-3">
            <h3 className="font-heading font-black text-xs text-foreground uppercase tracking-wider flex items-center gap-2">
              <Store className="w-4 h-4 text-primary-400" />
              PONTOS DE VENDA FÍSICOS ({partners.length})
            </h3>
            <Link href="/admin/parceiros" className="text-xs font-bold uppercase tracking-wider text-primary-400 hover:underline">
              GERENCIAR
            </Link>
          </div>

          <div className="space-y-2">
            {partners.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center font-bold uppercase">NENHUM PONTO DE VENDA CADASTRADO</p>
            ) : (
              partners.map((p) => {
                const partnerSalesVal = p.numbers.length * 30.0;
                const commissionVal = (partnerSalesVal * p.commissionRate) / 100;

                return (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-dark-900 border border-dark-750 flex items-center justify-between text-xs"
                  >
                    <div>
                      <strong className="text-foreground block uppercase">{p.name}</strong>
                      <span className="text-[11px] text-slate-500 uppercase">
                        {p.neighborhood} • COMISSÃO {p.commissionRate}%
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-primary-400 font-bold font-mono block">
                        {p.numbers.length} VENDAS
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">
                        COMISSÃO: {formatCurrency(commissionVal)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
