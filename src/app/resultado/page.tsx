import db from "@/lib/db";
import Link from "next/link";
import { Trophy, Calendar, Sparkles, Clock, CheckCircle2, AlertCircle, History, ShieldCheck, Ticket, Info } from "lucide-react";
import LotteryVisualizer from "@/components/LotteryVisualizer";

export const revalidate = 0;

export default async function ResultadoPage() {
  let settings: any = null;
  let drawResult: any = null;
  let drawHistory: any[] = [];

  try {
    const [dbSettings, dbDrawResult, dbDrawHistory] = await Promise.all([
      db.campaignSettings.findUnique({ where: { id: "default" } }),
      db.drawResult.findFirst({
        where: { id: "current-draw" },
      }),
      db.drawHistory.findMany({
        orderBy: { createdAt: "desc" },
      }),
    ]);
    settings = dbSettings;
    drawResult = dbDrawResult;
    drawHistory = dbDrawHistory;
  } catch (err) {
    console.error("Database read fallback in ResultadoPage:", err);
  }

  const drawDateRaw = settings?.drawDate || "2026-11-15";
  const [year, month, day] = drawDateRaw.split("-");
  const formattedDrawDate = `${day}/${month}/${year}`;

  const isCompleted = drawResult?.status === "COMPLETED" && drawResult.winningNumber;
  const isPendingNewDate = drawResult?.status === "PENDING_NEW_DATE";

  return (
    <div className="min-h-screen py-8 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-400 text-xs font-bold uppercase tracking-wider">
          <Trophy className="w-3.5 h-3.5" />
          <span>APURAÇÃO & GANHADOR</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-black text-foreground uppercase tracking-tight">
          RESULTADO OFICIAL DA AÇÃO
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Divulgação transparente dos números sorteados com base na extração oficial da Loteria Federal.
        </p>
      </div>

      {isCompleted ? (
        /* ESTADO 1: SORTEIO REALIZADO COM GANHADOR */
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-dark-850 to-primary-950/40 border-2 border-emerald-500/50 shadow-glow-emerald space-y-8 text-center animate-in zoom-in-95">
          
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-glow-emerald">
            <Trophy className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black uppercase tracking-wider">
              GANHADOR CONTEMPLADO!
            </span>
            <h2 className="text-3xl sm:text-5xl font-heading font-black text-foreground uppercase tracking-tight">
              NÚMERO VENCEDOR: <span className="text-emerald-400 font-mono">{drawResult.winningNumber}</span>
            </h2>
            <p className="text-lg font-bold text-slate-300 uppercase">
              CONTEMPLADO: <strong className="text-primary-400">{drawResult.winnerMaskedName || "PARTICIPANTE"}</strong>
            </p>
          </div>

          {/* Draw Details Card */}
          <div className="max-w-xl mx-auto p-5 rounded-2xl bg-dark-900 border border-dark-750 text-xs space-y-2.5 text-left uppercase font-semibold">
            <div className="flex justify-between py-1 border-b border-dark-800">
              <span className="text-slate-400">DATA DA APURAÇÃO:</span>
              <strong className="text-foreground">{drawResult.drawDate}</strong>
            </div>

            <div className="flex justify-between py-1 border-b border-dark-800">
              <span className="text-slate-400">EXTRAÇÃO DE REFERÊNCIA:</span>
              <strong className="text-primary-400">{drawResult.lotteryContestNumber || "LOTERIA FEDERAL"}</strong>
            </div>

            <div className="flex justify-between py-1 border-b border-dark-800">
              <span className="text-slate-400">PRÊMIO CONTEMPLADO NA LOTERIA:</span>
              <strong className="text-foreground">{drawResult.winningPrizeTier}º PRÊMIO</strong>
            </div>

            {drawResult.notes && (
              <div className="pt-2 text-slate-300 text-xs flex items-start gap-1.5 normal-case font-normal">
                <Info className="w-3.5 h-3.5 text-primary-400 shrink-0 mt-0.5" />
                <span>{drawResult.notes}</span>
              </div>
            )}
          </div>

        </div>
      ) : isPendingNewDate ? (
        /* ESTADO 2: SORTEIO PENDENTE (NENHUM NÚMERO VENDIDO NOS 5 PRÊMIOS) */
        <div className="p-8 sm:p-10 rounded-2xl bg-dark-850 border border-amber-500/40 shadow-premium-card space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
              SORTEIO PENDENTE / NOVA APURAÇÃO
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-black text-foreground uppercase tracking-tight">
              AGUARDANDO PRÓXIMA EXTRAÇÃO
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              Nenhum dos 5 números correspondentes aos prêmios da Loteria Federal utilizados na apuração anterior estava vendido. Conforme previsto no regulamento, uma <strong>nova apuração será realizada no próximo concurso oficial</strong>.
            </p>
          </div>

          <div className="p-4 max-w-md mx-auto rounded-xl bg-dark-900 border border-dark-750 text-xs text-slate-400 uppercase font-semibold">
            NOVA DATA PREVISTA: <strong className="text-primary-400">{formattedDrawDate}</strong>
          </div>
        </div>
      ) : (
        /* ESTADO 3: PRÉ-SORTEIO (AGUARDANDO A DATA) */
        <div className="p-8 sm:p-12 rounded-3xl bg-dark-850 border border-dark-700 shadow-premium-card space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-primary-500/20 text-primary-400 border border-primary-500/30 flex items-center justify-center mx-auto shadow-glow-primary">
            <Calendar className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-dark-800 text-primary-400 border border-dark-700 text-xs font-bold uppercase tracking-wider">
              SORTEIO AGENDADO
            </span>
            <h2 className="text-2xl sm:text-4xl font-heading font-black text-foreground uppercase tracking-tight">
              RESULTADO AINDA NÃO DISPONÍVEL
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
              A apuração oficial está prevista para o dia <strong className="text-foreground">{formattedDrawDate}</strong> às 19:00, logo após a extração oficial da Loteria Federal.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/numeros"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary-500 hover:bg-primary-400 text-dark-900 font-black text-xs uppercase tracking-wider shadow-glow-primary transition-all"
            >
              <Ticket className="w-4 h-4" />
              <span>GARANTIR MEUS NÚMEROS ANTES DO SORTEIO</span>
            </Link>
          </div>
        </div>
      )}

      {/* History Area */}
      {drawHistory.length > 0 && (
        <div className="p-6 rounded-2xl bg-dark-850 border border-dark-700 space-y-4">
          <h3 className="font-heading font-black text-xs text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-dark-750 pb-3">
            <History className="w-4 h-4 text-primary-400" />
            HISTÓRICO PÚBLICO DE APURAÇÕES & ADIAMENTOS
          </h3>

          <div className="space-y-2 text-xs">
            {drawHistory.map((h) => (
              <div key={h.id} className="p-3 bg-dark-900 rounded-xl border border-dark-750 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-mono text-primary-400 font-bold">{h.date}</span>
                  <p className="text-slate-300 mt-0.5">{h.reason}</p>
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-500">
                  {new Date(h.createdAt).toLocaleDateString("pt-BR")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visualizer Component */}
      <LotteryVisualizer />

    </div>
  );
}
