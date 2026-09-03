import { ShieldCheck, BarChart3, Users, Ticket, CheckCircle2, Clock } from "lucide-react";

interface TransparencyCardProps {
  totalNumbers: number;
  totalSold: number;
  totalAvailable: number;
  totalReserved: number;
  minQuota: number;
  drawDate: string;
}

export default function TransparencyCard({
  totalNumbers,
  totalSold,
  totalAvailable,
  totalReserved,
  minQuota,
  drawDate,
}: TransparencyCardProps) {
  const percentage = totalNumbers > 0 ? Math.round((totalSold / totalNumbers) * 100) : 0;
  const quotaReached = totalSold >= minQuota;
  const quotaPercentage = minQuota > 0 ? Math.min(100, Math.round((totalSold / minQuota) * 100)) : 0;

  return (
    <div className="w-full bg-dark-850 rounded-2xl border border-dark-700 p-4 sm:p-8 shadow-premium-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 sm:pb-6 border-b border-dark-700/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>DADOS REAIS E AUDITÁVEIS</span>
          </div>
          <h3 className="text-lg sm:text-2xl font-heading font-black text-foreground uppercase tracking-tight">
            TRANSPARÊNCIA DA AÇÃO
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Acompanhe o andamento das vendas e a apuração em tempo real direto do sistema.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-300 bg-dark-900 px-3 py-1.5 rounded-xl border border-dark-750 self-start sm:self-auto font-bold uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5 text-primary-400" />
          <span>SORTEIO: <strong className="text-foreground">{drawDate}</strong></span>
        </div>
      </div>

      {/* Stats Counter Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 my-5 sm:my-6">
        <div className="p-3 sm:p-4 rounded-xl bg-dark-900 border border-dark-750">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Ticket className="w-3.5 h-3.5 text-primary-400" />
            TOTAL DE NÚMEROS
          </span>
          <p className="text-xl sm:text-3xl font-heading font-black text-foreground mt-1">
            {totalNumbers.toLocaleString("pt-BR")}
          </p>
          <span className="text-[11px] text-slate-400 uppercase font-semibold">FAIXA 1000 A 3999</span>
        </div>

        <div className="p-3 sm:p-4 rounded-xl bg-dark-900 border border-dark-750">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            NÚMEROS VENDIDOS
          </span>
          <p className="text-xl sm:text-3xl font-heading font-black text-emerald-400 mt-1">
            {totalSold.toLocaleString("pt-BR")}
          </p>
          <span className="text-[11px] text-slate-400 uppercase font-semibold">{percentage}% DO TOTAL</span>
        </div>

        <div className="p-3 sm:p-4 rounded-xl bg-dark-900 border border-dark-750">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Ticket className="w-3.5 h-3.5 text-blue-400" />
            DISPONÍVEIS
          </span>
          <p className="text-xl sm:text-3xl font-heading font-black text-slate-200 mt-1">
            {totalAvailable.toLocaleString("pt-BR")}
          </p>
          <span className="text-[11px] text-slate-400 uppercase font-semibold">ONLINE E PRESENCIAL</span>
        </div>

        <div className="p-3 sm:p-4 rounded-xl bg-dark-900 border border-dark-750">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            META MÍNIMA
          </span>
          <p className="text-xl sm:text-3xl font-heading font-black text-amber-400 mt-1">
            {minQuota.toLocaleString("pt-BR")}
          </p>
          <span className="text-[11px] text-slate-400 uppercase font-semibold">PARA REALIZAÇÃO</span>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-4 pt-2">
        {/* Total Progress */}
        <div>
          <div className="flex flex-wrap gap-x-2 justify-between text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-1.5">
            <span className="text-slate-300">PROGRESSO GERAL DE VENDAS</span>
            <span className="text-primary-400 font-bold">{totalSold} DE {totalNumbers} ({percentage}%)</span>
          </div>
          <div className="w-full h-3 bg-dark-950 rounded-full overflow-hidden border border-dark-750">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-amber-400 rounded-full transition-all duration-500 shadow-glow-primary"
              style={{ width: `${Math.max(3, percentage)}%` }}
            />
          </div>
        </div>

        {/* Quota Progress */}
        <div>
          <div className="flex flex-wrap gap-x-2 justify-between text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-1.5">
            <span className="text-slate-400">PROGRESSO DA META MÍNIMA</span>
            <span className={quotaReached ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
              {quotaReached ? "META ATINGIDA" : `${totalSold} DE ${minQuota} (${quotaPercentage}%)`}
            </span>
          </div>
          <div className="w-full h-2 bg-dark-950 rounded-full overflow-hidden border border-dark-750">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                quotaReached ? "bg-emerald-500 shadow-glow-emerald" : "bg-amber-500"
              }`}
              style={{ width: `${Math.max(2, quotaPercentage)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Info note */}
      <div className="mt-5 sm:mt-6 p-3.5 rounded-xl bg-dark-900 border border-dark-750 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] sm:text-xs text-slate-400">
        <span>FORMA DE APURAÇÃO: <strong className="text-foreground uppercase">RESULTADO DA LOTERIA FEDERAL</strong></span>
        <span className="text-[11px] text-slate-400 font-semibold uppercase">ATUALIZAÇÃO EM TEMPO REAL</span>
      </div>
    </div>
  );
}
