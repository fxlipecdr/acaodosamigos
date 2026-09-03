"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Search, 
  ShieldCheck, 
  Ticket, 
  Calendar, 
  Lock, 
  Phone,
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw,
  Sparkles,
  Store,
  Globe
} from "lucide-react";
import { formatCPF, cleanCPF, validateCPF } from "@/lib/cpf";

export default function MeusNumerosPage() {
  const [cpf, setCpf] = useState("");
  const [last4Digits, setLast4Digits] = useState("");
  const [step, setStep] = useState<"form" | "result">("form");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Result state
  const [resultData, setResultData] = useState<any>(null);

  const handleCpfChange = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 11);
    setCpf(formatCPF(raw));
  };

  const handleLast4Change = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 4);
    setLast4Digits(raw);
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanCpfVal = cleanCPF(cpf);
    if (!validateCPF(cleanCpfVal)) {
      setErrorMessage("Por favor, informe um CPF válido com 11 dígitos.");
      return;
    }

    if (last4Digits.length !== 4) {
      setErrorMessage("Por favor, digite os 4 últimos dígitos do WhatsApp cadastrado.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/verify/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cpf: cleanCpfVal,
          last4Digits: last4Digits.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Nenhum bilhete encontrado ou dados não conferem.");
        return;
      }

      setResultData(data);
      setStep("result");
    } catch (err) {
      console.error("Erro:", err);
      setErrorMessage("Erro de conexão ao consultar bilhetes. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-6 sm:py-16 max-w-3xl mx-auto px-4 sm:px-6">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2 mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-400 text-xs font-bold uppercase tracking-wider">
          <Search className="w-3.5 h-3.5" />
          <span>ÁREA DO PARTICIPANTE</span>
        </div>
        <h1 className="text-xl sm:text-3xl font-heading font-black text-foreground uppercase tracking-tight">
          CONSULTAR MEUS NÚMEROS
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Informe seu CPF e os 4 últimos dígitos do WhatsApp cadastrado na compra para visualizar seus bilhetes ativos.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs sm:text-sm font-bold uppercase flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {step === "form" && (
        <div className="max-w-md mx-auto p-5 sm:p-8 rounded-2xl bg-dark-850 border border-dark-700 shadow-premium-card space-y-5 sm:space-y-6">
          <form onSubmit={handleLookup} className="space-y-4">
            
            {/* Campo CPF */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                1. SEU CPF:
              </label>
              <input
                type="text"
                required
                inputMode="numeric"
                pattern="[0-9.\-]*"
                enterKeyHint="next"
                autoComplete="off"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => handleCpfChange(e.target.value)}
                className="w-full h-12 px-4 bg-dark-900 border border-dark-700 rounded-xl text-base text-foreground placeholder:text-slate-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 font-mono tracking-wide"
              />
            </div>

            {/* Campo 4 Últimos Dígitos */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                <span>2. 4 ÚLTIMOS DÍGITOS DO WHATSAPP:</span>
                <span className="text-[10px] text-slate-500 font-normal">Ex: (48) 9****-<strong>8109</strong></span>
              </label>
              <input
                type="text"
                required
                maxLength={4}
                inputMode="numeric"
                pattern="[0-9]*"
                enterKeyHint="go"
                autoComplete="off"
                placeholder="Ex: 8109"
                value={last4Digits}
                onChange={(e) => handleLast4Change(e.target.value)}
                className="w-full h-12 px-4 bg-dark-900 border border-dark-700 rounded-xl text-base text-center font-mono font-black text-primary-400 placeholder:text-slate-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 tracking-widest"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-primary-500 hover:bg-primary-400 text-dark-900 font-black text-sm uppercase tracking-wider shadow-glow-primary active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>CONSULTANDO REGISTROS...</span>
                </>
              ) : (
                <>
                  <span>BUSCAR MEUS NÚMEROS</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="p-3.5 rounded-xl bg-dark-900 border border-dark-750 text-[11px] text-slate-400 space-y-1 uppercase font-semibold">
            <p className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              PRIVACIDADE E SEGURANÇA
            </p>
            <p className="text-[10px] text-slate-400 normal-case">
              Os 4 últimos dígitos do seu telefone confirmam sua identidade com segurança sem necessidade de aguardar códigos por SMS.
            </p>
          </div>
        </div>
      )}

      {step === "result" && resultData && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Header Card */}
          <div className="p-4 sm:p-6 rounded-2xl bg-dark-850 border border-dark-700 shadow-premium-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">PARTICIPANTE</span>
              <h3 className="text-xl font-heading font-black text-foreground uppercase tracking-tight mt-0.5">{resultData.participant.maskedName}</h3>
              <p className="text-xs font-mono text-slate-500 uppercase">CPF: {resultData.participant.maskedCpf} • Tel: {resultData.participant.maskedPhone}</p>
            </div>

            <div className="p-3 bg-dark-900 rounded-xl border border-dark-750 text-right uppercase">
              <span className="text-[11px] text-slate-400 font-bold">TOTAL DE COTAS:</span>
              <p className="text-2xl font-black text-primary-400 font-mono">
                {resultData.participant.totalTickets} {resultData.participant.totalTickets === 1 ? "NÚMERO" : "NÚMEROS"}
              </p>
            </div>
          </div>

          {/* Sorteio Info Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-primary-950/40 to-dark-850 border border-primary-500/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs font-bold uppercase tracking-wider">
            <div className="flex items-center gap-2 text-slate-300">
              <Calendar className="w-4 h-4 text-primary-400" />
              <span>SORTEIO: <strong className="text-foreground">15/11/2026</strong> (LOTERIA FEDERAL)</span>
            </div>
            <span className="text-primary-400">{resultData.drawInfo.prizeModel}</span>
          </div>

          {/* Numbers Grid */}
          <div className="p-4 sm:p-6 rounded-2xl bg-dark-850 border border-dark-700 shadow-premium-card space-y-4">
            <h4 className="font-heading font-black text-xs text-foreground uppercase tracking-wider flex items-center gap-2">
              <Ticket className="w-4 h-4 text-primary-400" />
              SEUS NÚMEROS ATIVOS
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
              {resultData.tickets.map((t: any) => (
                <div
                  key={t.number}
                  className="p-3.5 rounded-xl bg-dark-900 border border-dark-750 flex flex-col justify-between space-y-2 hover:border-primary-500/40 transition-colors"
                >
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-mono font-black text-primary-400">
                      {t.number}
                    </span>
                    <span className="text-[10px] font-bold uppercase text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      PAGO
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 space-y-0.5 border-t border-dark-800 pt-1.5 uppercase font-semibold">
                    <p className="truncate flex items-center gap-1">
                      {t.origin === "PRESENTIAL" ? (
                        <>
                          <Store className="w-3 h-3 text-primary-400" />
                          <span>PRESENCIAL</span>
                        </>
                      ) : (
                        <>
                          <Globe className="w-3 h-3 text-emerald-400" />
                          <span>ONLINE</span>
                        </>
                      )}
                    </p>
                    {t.partnerName && (
                      <p className="truncate text-slate-500 text-[10px]">PDV: {t.partnerName}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center pt-4">
            <button
              onClick={() => { setStep("form"); setCpf(""); setLast4Digits(""); setResultData(null); }}
              className="text-xs text-primary-400 hover:text-primary-300 font-bold uppercase tracking-wider underline"
            >
              FAZER UMA NOVA CONSULTA
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
