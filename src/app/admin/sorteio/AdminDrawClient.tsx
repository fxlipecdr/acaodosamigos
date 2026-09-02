"use client";

import { useState } from "react";
import { 
  Trophy, 
  Calendar, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ArrowRight, 
  RefreshCw, 
  History,
  ShieldCheck,
  Award
} from "lucide-react";
import { maskName } from "@/lib/cpf";

export default function AdminDrawClient({
  settings,
  drawResult,
  drawHistory: initialHistory,
  totalSold,
}: {
  settings: any;
  drawResult: any;
  drawHistory: any[];
  totalSold: number;
}) {
  const [history, setHistory] = useState(initialHistory);

  // Date edit state
  const [newDate, setNewDate] = useState(settings?.drawDate || "2026-11-15");
  const [newTime, setNewTime] = useState(settings?.drawTime || "19:00");
  const [changeReason, setChangeReason] = useState("");
  const [drawNotice, setDrawNotice] = useState(settings?.drawNotice || "");
  const [dateLoading, setDateLoading] = useState(false);

  // Lottery check state
  const [contestNumber, setContestNumber] = useState("Concurso 5980");
  const [p1, setP1] = useState("81845");
  const [p2, setP2] = useState("73218");
  const [p3, setP3] = useState("43527");
  const [p4, setP4] = useState("19023");
  const [p5, setP5] = useState("55120");

  const [checkLoading, setCheckLoading] = useState(false);
  const [checkResult, setCheckResult] = useState<any | null>(null);
  const [publishLoading, setPublishLoading] = useState(false);

  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Change Date submit
  const handleUpdateDate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMessage(null);
    setErrorMessage(null);

    if (!changeReason.trim()) {
      setErrorMessage("Por favor, informe a justificativa para alteração da data.");
      return;
    }

    try {
      setDateLoading(true);
      const res = await fetch("/api/admin/draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_DATE",
          newDate,
          drawTime: newTime,
          reason: changeReason,
          drawNotice,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMessage(data.message);
        setChangeReason("");
      } else {
        setErrorMessage(data.error || "Erro ao atualizar data.");
      }
    } catch {
      setErrorMessage("Erro de conexão ao salvar data.");
    } finally {
      setDateLoading(false);
    }
  };

  // Check Lottery results
  const handleCheckLottery = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMessage(null);
    setErrorMessage(null);

    try {
      setCheckLoading(true);
      const res = await fetch("/api/admin/draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CHECK_LOTTERY",
          contestNumber,
          p1,
          p2,
          p3,
          p4,
          p5,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCheckResult(data);
      } else {
        setErrorMessage(data.error || "Erro ao conferir números.");
      }
    } catch {
      setErrorMessage("Erro de conexão ao processar apuração.");
    } finally {
      setCheckLoading(false);
    }
  };

  // Publish Winner
  const handlePublishWinner = async () => {
    if (!checkResult?.winner) return;

    try {
      setPublishLoading(true);
      const res = await fetch("/api/admin/draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "PUBLISH_WINNER",
          contestNumber,
          winningNumber: checkResult.winner.number,
          winningTier: checkResult.winner.tier,
          winnerName: checkResult.winner.participant?.fullName,
          winnerMaskedName: maskName(checkResult.winner.participant?.fullName || "Participante"),
          p1, p2, p3, p4, p5,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMessage("Ganhador publicado com sucesso na página oficial de resultados!");
      } else {
        setErrorMessage(data.error || "Erro ao publicar ganhador.");
      }
    } catch {
      setErrorMessage("Erro de conexão.");
    } finally {
      setPublishLoading(false);
    }
  };

  // Declare Pending
  const handleDeclarePending = async () => {
    try {
      setPublishLoading(true);
      const res = await fetch("/api/admin/draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "DECLARE_PENDING",
          contestNumber,
          p1, p2, p3, p4, p5,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMessage("Sorteio declarado pendente. Nova data de apuração aguardando próximo concurso.");
      } else {
        setErrorMessage(data.error || "Erro ao atualizar status.");
      }
    } catch {
      setErrorMessage("Erro de conexão.");
    } finally {
      setPublishLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-dark-750">
        <div>
          <span className="text-xs font-bold text-primary-400 uppercase tracking-wider">
            MÓDULO OFICIAL DE APURAÇÃO
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-foreground mt-0.5 uppercase tracking-tight">
            SORTEIO & APURAÇÃO LOTERIA FEDERAL
          </h1>
          <p className="text-xs text-slate-400">
            Mecanismo de conferência sequencial do 1º ao 5º prêmio e gestão da data da ação.
          </p>
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-bold uppercase flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs sm:text-sm font-bold uppercase flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1. SEÇÃO DE CONFERÊNCIA DA LOTERIA FEDERAL */}
      <div className="p-6 sm:p-8 rounded-2xl bg-dark-850 border border-primary-500/40 space-y-6 shadow-glow-primary">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-dark-750 pb-4">
          <div>
            <span className="text-xs font-bold text-primary-400 uppercase tracking-wider">
              MECANISMO DE APURAÇÃO AUTOMÁTICO
            </span>
            <h3 className="text-xl font-heading font-black text-foreground mt-0.5 uppercase tracking-tight">
              CONFERIR EXTRAÇÃO DA LOTERIA FEDERAL
            </h3>
            <p className="text-xs text-slate-400">
              Digite os 5 prêmios oficiais da Loteria Federal (5 dígitos cada). O sistema extrai os 4 últimos dígitos e busca o ganhador no banco.
            </p>
          </div>

          <span className="px-3 py-1 rounded-xl bg-dark-900 border border-dark-750 text-xs text-slate-300 font-mono uppercase font-bold">
            VENDIDOS: <strong>{totalSold} COTAS</strong>
          </span>
        </div>

        <form onSubmit={handleCheckLottery} className="space-y-6">
          
          <div className="max-w-xs space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">CONCURSO DA LOTERIA FEDERAL</label>
            <input
              type="text"
              required
              placeholder="Ex: Concurso 5980"
              value={contestNumber}
              onChange={(e) => setContestNumber(e.target.value)}
              className="w-full px-3.5 py-2 bg-dark-900 border border-dark-700 rounded-xl text-xs text-foreground focus:outline-none focus:border-primary-500 font-bold"
            />
          </div>

          {/* 5 Prizes Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            
            <div className="p-3.5 rounded-xl bg-dark-900 border border-dark-750 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">1º PRÊMIO (5 DÍGITOS)</span>
              <input
                type="text"
                maxLength={5}
                required
                value={p1}
                onChange={(e) => setP1(e.target.value.replace(/\D/g, ""))}
                className="w-full px-2 py-2 bg-dark-950 border border-dark-700 rounded-lg text-lg font-mono font-black text-primary-400 text-center tracking-widest focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 block text-center uppercase font-mono">4 DÍGITOS: {p1.slice(-4) || "—"}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-dark-900 border border-dark-750 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">2º PRÊMIO (5 DÍGITOS)</span>
              <input
                type="text"
                maxLength={5}
                required
                value={p2}
                onChange={(e) => setP2(e.target.value.replace(/\D/g, ""))}
                className="w-full px-2 py-2 bg-dark-950 border border-dark-700 rounded-lg text-lg font-mono font-black text-primary-400 text-center tracking-widest focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 block text-center uppercase font-mono">4 DÍGITOS: {p2.slice(-4) || "—"}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-dark-900 border border-dark-750 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">3º PRÊMIO (5 DÍGITOS)</span>
              <input
                type="text"
                maxLength={5}
                required
                value={p3}
                onChange={(e) => setP3(e.target.value.replace(/\D/g, ""))}
                className="w-full px-2 py-2 bg-dark-950 border border-dark-700 rounded-lg text-lg font-mono font-black text-primary-400 text-center tracking-widest focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 block text-center uppercase font-mono">4 DÍGITOS: {p3.slice(-4) || "—"}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-dark-900 border border-dark-750 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">4º PRÊMIO (5 DÍGITOS)</span>
              <input
                type="text"
                maxLength={5}
                required
                value={p4}
                onChange={(e) => setP4(e.target.value.replace(/\D/g, ""))}
                className="w-full px-2 py-2 bg-dark-950 border border-dark-700 rounded-lg text-lg font-mono font-black text-primary-400 text-center tracking-widest focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 block text-center uppercase font-mono">4 DÍGITOS: {p4.slice(-4) || "—"}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-dark-900 border border-dark-750 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">5º PRÊMIO (5 DÍGITOS)</span>
              <input
                type="text"
                maxLength={5}
                required
                value={p5}
                onChange={(e) => setP5(e.target.value.replace(/\D/g, ""))}
                className="w-full px-2 py-2 bg-dark-950 border border-dark-700 rounded-lg text-lg font-mono font-black text-primary-400 text-center tracking-widest focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 block text-center uppercase font-mono">4 DÍGITOS: {p5.slice(-4) || "—"}</span>
            </div>

          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={checkLoading}
              className="px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-400 text-dark-900 font-black text-xs uppercase tracking-wider shadow-glow-primary active:scale-95 transition-all flex items-center gap-2"
            >
              {checkLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>CONFERINDO BANCO DE DADOS...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>CONFERIR PRÊMIOS SEQUENCIAIS</span>
                </>
              )}
            </button>
          </div>

        </form>

        {/* Check Results Display Area */}
        {checkResult && (
          <div className="pt-6 border-t border-dark-750 space-y-6 animate-in fade-in">
            
            <h4 className="font-heading font-black text-xs text-foreground uppercase tracking-wider">
              RESULTADO DA CONFERÊNCIA SEQUENCIAL:
            </h4>

            <div className="space-y-3">
              {checkResult.checkedPrizes.map((p: any) => {
                const isWinnerTier = checkResult.winner?.tier === p.tier;

                return (
                  <div
                    key={p.tier}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isWinnerTier
                        ? "bg-emerald-950/30 border-emerald-500 shadow-glow-emerald"
                        : p.isSold
                        ? "bg-dark-900 border-dark-750 opacity-60"
                        : "bg-dark-900 border-dark-750"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isWinnerTier ? "bg-emerald-500 text-dark-900 font-black" : "bg-dark-800 text-slate-400"
                      }`}>
                        {p.tier}º
                      </span>
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-semibold">NÚMERO DA LOTERIA: <strong className="text-foreground">{p.full}</strong></p>
                        <p className="text-base font-mono font-black text-primary-400 uppercase">
                          4 DÍGITOS EXTRAÍDOS: {p.extracted}
                        </p>
                      </div>
                    </div>

                    {isWinnerTier ? (
                      <div className="flex items-center gap-3 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-4 py-2 rounded-xl text-xs font-bold">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        <div>
                          <p className="text-sm font-black uppercase tracking-wider">CONTEMPLADO NO {p.tier}º PRÊMIO!</p>
                          <p className="text-[11px] font-normal text-slate-200 uppercase">
                            GANHADOR: <strong>{checkResult.winner.participant?.fullName}</strong> ({checkResult.winner.participant?.whatsapp})
                          </p>
                        </div>
                      </div>
                    ) : p.isSold ? (
                      <span className="text-xs text-slate-400 font-semibold uppercase">
                        NÚMERO VENDIDO, MAS DESCONSIDERADO (JÁ HOUVE VENCEDOR EM PRÊMIO ANTERIOR).
                      </span>
                    ) : (
                      <span className="text-xs text-red-400/80 font-bold uppercase flex items-center gap-1">
                        <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                        NÚMERO NÃO VENDIDO
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Publication Action */}
            <div className="p-4 rounded-xl bg-dark-900 border border-dark-750 flex flex-col sm:flex-row items-center justify-between gap-4">
              {checkResult.hasWinner ? (
                <div>
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    VENCEDOR IDENTIFICADO: {checkResult.winner.participant?.fullName} (NÚMERO {checkResult.winner.number})
                  </p>
                  <p className="text-[11px] text-slate-400 uppercase">
                    CLIQUE ABAIXO PARA PUBLICAR O RESULTADO OFICIALMENTE NA PÁGINA PÚBLICA DO SITE.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    NENHUM DOS 5 NÚMEROS ESTAVA VENDIDO!
                  </p>
                  <p className="text-[11px] text-slate-400 uppercase">
                    CONFORME AS REGRAS, O SORTEIO DEVE FICAR PENDENTE PARA A PRÓXIMA EXTRAÇÃO OFICIAL.
                  </p>
                </div>
              )}

              {checkResult.hasWinner ? (
                <button
                  type="button"
                  disabled={publishLoading}
                  onClick={handlePublishWinner}
                  className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-dark-900 font-black text-xs uppercase tracking-wider shadow-glow-emerald active:scale-95 transition-all flex items-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  <span>PUBLICAR GANHADOR NO SITE</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={publishLoading}
                  onClick={handleDeclarePending}
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-dark-900 font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all flex items-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  <span>DECLARAR PENDENTE & AGENDAR PRÓXIMA EXTRAÇÃO</span>
                </button>
              )}
            </div>

          </div>
        )}

      </div>

      {/* 2. SEÇÃO DE ALTERAÇÃO DA DATA DO SORTEIO */}
      <div className="p-6 sm:p-8 rounded-2xl bg-dark-850 border border-dark-700 space-y-6 shadow-premium-card">
        <h3 className="font-heading font-black text-xs text-foreground uppercase tracking-wider border-b border-dark-750 pb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary-400" />
          GERENCIAR DATA & AVISOS DO SORTEIO
        </h3>

        <form onSubmit={handleUpdateDate} className="space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-slate-300">NOVA DATA DO SORTEIO *</label>
              <input
                type="date"
                required
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dark-900 border border-dark-700 rounded-xl text-foreground focus:outline-none focus:border-primary-500 font-mono font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-slate-300">HORÁRIO PREVISTO</label>
              <input
                type="text"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dark-900 border border-dark-700 rounded-xl text-foreground focus:outline-none focus:border-primary-500 font-mono font-bold"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="font-bold uppercase tracking-wider text-slate-300">MOTIVO DA ALTERAÇÃO (REGISTRADO NO HISTÓRICO PÚBLICO) *</label>
              <input
                type="text"
                required
                placeholder="Ex: Meta mínima de 1.000 números em andamento / Ajuste de extração"
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dark-900 border border-dark-700 rounded-xl text-foreground focus:outline-none focus:border-primary-500"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="font-bold uppercase tracking-wider text-slate-300">TEXTO DE AVISO AOS PARTICIPANTES (BANNER NO SITE)</label>
              <input
                type="text"
                placeholder="Ex: A apuração foi reagendada para 22/11/2026. Agradecemos a compreensão!"
                value={drawNotice}
                onChange={(e) => setDrawNotice(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dark-900 border border-dark-700 rounded-xl text-foreground focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={dateLoading}
              className="px-6 py-2.5 rounded-xl bg-dark-800 hover:bg-dark-750 text-slate-200 border border-dark-700 font-bold text-xs uppercase tracking-wider transition-colors"
            >
              {dateLoading ? "SALVANDO..." : "SALVAR ALTERAÇÃO DE DATA"}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
