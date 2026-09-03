"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Search, 
  ShieldCheck, 
  Ticket, 
  Calendar, 
  Lock, 
  KeyRound, 
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
  const [step, setStep] = useState<"cpf" | "otp" | "result">("cpf");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // OTP state
  const [token, setToken] = useState("");
  const [maskedPhone, setMaskedPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [demoCode, setDemoCode] = useState<string | undefined>();

  // Result state
  const [resultData, setResultData] = useState<any>(null);

  const handleCpfChange = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 11);
    setCpf(formatCPF(raw));
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanCpfVal = cleanCPF(cpf);
    if (!validateCPF(cleanCpfVal)) {
      setErrorMessage("Por favor, digite um CPF válido.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/verify/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf: cleanCpfVal }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Nenhum número encontrado para este CPF.");
        return;
      }

      setToken(data.token);
      setMaskedPhone(data.maskedPhone);
      setDemoCode(data.demoCode);
      setStep("otp");
    } catch (err) {
      console.error("Erro:", err);
      setErrorMessage("Erro de conexão ao consultar CPF.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (otpCode.length < 6) {
      setErrorMessage("Digite o código de 6 dígitos.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/verify/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, code: otpCode }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Código incorreto.");
        return;
      }

      setResultData(data);
      setStep("result");
    } catch (err) {
      console.error("Erro:", err);
      setErrorMessage("Erro de conexão ao verificar código.");
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
          Consulte seus bilhetes cadastrados com autenticação em duas etapas para garantir sua privacidade.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs sm:text-sm font-bold uppercase flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {step === "cpf" && (
        /* ETAPA 1: DIGITAR CPF */
        <div className="max-w-md mx-auto p-5 sm:p-8 rounded-2xl bg-dark-850 border border-dark-700 shadow-premium-card space-y-5 sm:space-y-6">
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                INFORME O SEU CPF:
              </label>
              <input
                type="text"
                required
                inputMode="numeric"
                pattern="[0-9.\-]*"
                enterKeyHint="go"
                autoComplete="off"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => handleCpfChange(e.target.value)}
                className="w-full h-12 px-4 bg-dark-900 border border-dark-700 rounded-xl text-base text-foreground placeholder:text-slate-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 font-mono tracking-wide"
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
                  <span>BUSCANDO REGISTROS...</span>
                </>
              ) : (
                <>
                  <span>CONSULTAR POR CPF</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="p-3.5 rounded-xl bg-dark-900 border border-dark-750 text-[11px] text-slate-400 space-y-1 uppercase font-semibold">
            <p className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              CONFORMIDADE COM A LGPD
            </p>
            <p className="text-[10px] text-slate-400">
              Por segurança, um código de verificação será solicitado antes de exibir seus bilhetes.
            </p>
          </div>
        </div>
      )}

      {step === "otp" && (
        /* ETAPA 2: CÓDIGO OTP */
        <div className="max-w-md mx-auto p-6 sm:p-8 rounded-2xl bg-dark-850 border border-dark-700 shadow-premium-card space-y-6">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-xl bg-primary-500/20 text-primary-400 flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-heading font-black text-foreground uppercase tracking-tight">VERIFICAÇÃO DE SEGURANÇA</h3>
            <p className="text-xs text-slate-400">
              Código enviado para o telefone <strong>{maskedPhone}</strong>
            </p>
          </div>

          {demoCode && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs text-center font-bold uppercase tracking-wider">
              CÓDIGO DE TESTE RÁPIDO: <strong className="font-mono text-sm">{demoCode}</strong>
            </div>
          )}

          <form onSubmit={handleConfirmOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block text-center">
                DIGITE O CÓDIGO DE 6 DÍGITOS:
              </label>
              <input
                type="text"
                maxLength={6}
                required
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                enterKeyHint="go"
                placeholder="000000"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                className="w-full h-16 bg-dark-900 border border-dark-700 rounded-xl text-3xl font-mono font-black text-center text-primary-400 tracking-[0.3em] focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-dark-900 font-black text-sm uppercase tracking-wider shadow-glow-emerald active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>VALIDANDO CÓDIGO...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>CONFIRMAR E VISUALIZAR</span>
                </>
              )}
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={() => setStep("cpf")}
              className="text-xs text-slate-400 hover:text-slate-200 font-bold uppercase tracking-wider"
            >
              VOLTAR E ALTERAR CPF
            </button>
          </div>
        </div>
      )}

      {step === "result" && resultData && (
        /* ETAPA 3: LISTA DOS NÚMEROS DO PARTICIPANTE */
        <div className="space-y-6 animate-in fade-in">
          
          {/* Header Card */}
          <div className="p-4 sm:p-6 rounded-2xl bg-dark-850 border border-dark-700 shadow-premium-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">PARTICIPANTE</span>
              <h3 className="text-xl font-heading font-black text-foreground uppercase tracking-tight mt-0.5">{resultData.participant.maskedName}</h3>
              <p className="text-xs font-mono text-slate-500 uppercase">CPF: {resultData.participant.maskedCpf}</p>
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
              onClick={() => { setStep("cpf"); setCpf(""); setOtpCode(""); setResultData(null); }}
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
