"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ShieldCheck, 
  Ticket, 
  QrCode, 
  Copy, 
  Check, 
  Clock, 
  AlertCircle, 
  ArrowLeft, 
  RefreshCw, 
  CheckCircle2, 
  Zap,
  Lock,
  ExternalLink
} from "lucide-react";
import { formatCPF, cleanCPF, validateCPF } from "@/lib/cpf";
import { formatCurrency, calculateOrderPrice } from "@/lib/pricing";

export default function CheckoutPage() {
  const router = useRouter();

  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [agreedRules, setAgreedRules] = useState(false);

  // Flow states
  const [step, setStep] = useState<"form" | "pix">("form");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pix state
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [pixCopiaECola, setPixCopiaECola] = useState("");
  const [qrCodeBase64, setQrCodeBase64] = useState("");
  const [copied, setCopied] = useState(false);
  const [simulating, setSimulating] = useState(false);

  // Expiration countdown
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60); // 15 min default

  // Load numbers from session
  useEffect(() => {
    const stored = sessionStorage.getItem("currentReservation");
    if (!stored) {
      router.push("/numeros");
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      if (!parsed || !Array.isArray(parsed.numbers) || parsed.numbers.length === 0) {
        router.push("/numeros");
      } else {
        setSelectedNumbers(parsed.numbers);
      }
    } catch {
      router.push("/numeros");
    }
  }, [router]);

  // Pricing
  const pricing = calculateOrderPrice(selectedNumbers.length, 30.0, 3, 63.0);

  // Format CPF input
  const handleCpfChange = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 11);
    setCpf(formatCPF(raw));
  };

  // Format phone input
  const handlePhoneChange = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 11);
    if (raw.length <= 10) {
      setWhatsapp(raw.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3"));
    } else {
      setWhatsapp(raw.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3"));
    }
  };

  // Submit and generate Pix
  const handleGeneratePix = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validations
    if (!fullName.trim() || fullName.trim().split(/\s+/).length < 2) {
      setErrorMessage("Por favor, digite seu nome e sobrenome completos.");
      return;
    }

    const cleanCpfVal = cleanCPF(cpf);
    if (!validateCPF(cleanCpfVal)) {
      setErrorMessage("O CPF digitado é inválido. Verifique os números.");
      return;
    }

    const cleanPhoneVal = whatsapp.replace(/\D/g, "");
    if (cleanPhoneVal.length < 10) {
      setErrorMessage("Por favor, digite um número de WhatsApp válido.");
      return;
    }

    if (!agreedRules) {
      setErrorMessage("Você precisa concordar com o Regulamento Oficial da ação para continuar.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/checkout/pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numbers: selectedNumbers,
          fullName: fullName.trim(),
          cpf: cleanCpfVal,
          whatsapp: cleanPhoneVal,
          email: email.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Não foi possível gerar a cobrança Pix. Tente novamente.");
        return;
      }

      setOrderCode(data.purchase.orderCode);
      setPixCopiaECola(data.pixCopiaECola);
      setQrCodeBase64(data.qrCodeBase64);
      setStep("pix");
    } catch {
      setErrorMessage("Erro de conexão ao processar pagamento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Copy Pix code
  const handleCopyPix = () => {
    if (!pixCopiaECola) return;
    navigator.clipboard.writeText(pixCopiaECola);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Timer countdown
  useEffect(() => {
    if (step !== "pix") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setErrorMessage("Sua reserva de 15 minutos expirou. Por favor, escolha seus números novamente.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step]);

  // Polling for payment confirmation
  useEffect(() => {
    if (step !== "pix" || !orderCode) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/checkout/status?orderCode=${orderCode}`);
        const data = await res.json();
        if (data.success && data.status === "PAID") {
          clearInterval(interval);
          sessionStorage.removeItem("currentReservation");
          router.push(`/confirmacao?code=${orderCode}`);
        }
      } catch (err) {
        console.error("Erro ao verificar status:", err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [step, orderCode, router]);

  // Simulation handler (for demo / testing)
  const handleSimulatePayment = async () => {
    if (!orderCode) return;

    try {
      setSimulating(true);
      const res = await fetch("/api/checkout/simulate-pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderCode }),
      });
      const data = await res.json();
      if (data.success) {
        sessionStorage.removeItem("currentReservation");
        router.push(`/confirmacao?code=${orderCode}`);
      } else {
        setErrorMessage(data.error || "Falha ao simular pagamento.");
      }
    } catch {
      setErrorMessage("Erro ao simular pagamento.");
    } finally {
      setSimulating(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <div className="min-h-screen py-8 sm:py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/numeros"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-primary-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>VOLTAR PARA ESCOLHA DE NÚMEROS</span>
        </Link>
      </div>

      {step === "form" ? (
        /* STEP 1: FORMULÁRIO DO PARTICIPANTE */
        <div className="space-y-8">
          
          <div className="text-center max-w-xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>AMBIENTE SEGURO & CRIPTOGRAFADO</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-foreground uppercase tracking-tight">
              FINALIZE SEUS NÚMEROS DA SORTE
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Informe seus dados para vincular aos bilhetes e gerar o Pix de pagamento.
            </p>
          </div>

          {/* Error display */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs sm:text-sm font-bold uppercase flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Form Fields (7 cols) */}
            <form onSubmit={handleGeneratePix} className="lg:col-span-7 space-y-4">
              <div className="p-6 rounded-2xl bg-dark-850 border border-dark-750 space-y-4 shadow-premium-card">
                <h3 className="font-heading font-black text-xs text-foreground uppercase tracking-wider border-b border-dark-750 pb-3 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary-400" />
                  DADOS DO PARTICIPANTE
                </h3>

                {/* Nome Completo */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    NOME COMPLETO <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos Eduardo da Silva"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-dark-900 border border-dark-700 rounded-xl text-sm text-foreground placeholder:text-slate-500 focus:outline-none focus:border-primary-500"
                  />
                </div>

                {/* CPF */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    CPF <span className="text-red-400">*</span>
                    <span className="text-[11px] text-slate-500 font-normal ml-1">(Para registro do bilhete)</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => handleCpfChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-dark-900 border border-dark-700 rounded-xl text-sm text-foreground placeholder:text-slate-500 focus:outline-none focus:border-primary-500 font-mono"
                  />
                </div>

                {/* WhatsApp */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    WHATSAPP <span className="text-red-400">*</span>
                    <span className="text-[11px] text-slate-500 font-normal ml-1">(Para contato caso seja o ganhador)</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="(00) 00000-0000"
                    value={whatsapp}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-dark-900 border border-dark-700 rounded-xl text-sm text-foreground placeholder:text-slate-500 focus:outline-none focus:border-primary-500 font-mono"
                  />
                </div>

                {/* E-mail (Opcional) */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    E-MAIL <span className="text-slate-500 text-[11px]">(OPCIONAL)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="seuemail@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-dark-900 border border-dark-700 rounded-xl text-sm text-foreground placeholder:text-slate-500 focus:outline-none focus:border-primary-500"
                  />
                </div>

                {/* Checkbox Regulamento */}
                <div className="pt-3 border-t border-dark-750">
                  <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-300 leading-relaxed select-none">
                    <input
                      type="checkbox"
                      checked={agreedRules}
                      onChange={(e) => setAgreedRules(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-dark-600 bg-dark-900 text-primary-500 focus:ring-primary-500 focus:ring-offset-dark-900 cursor-pointer"
                    />
                    <span>
                      Li e concordo com o{" "}
                      <Link href="/regras" target="_blank" className="text-primary-400 underline font-bold uppercase">
                        REGULAMENTO DA AÇÃO
                      </Link>{" "}
                      e com os critérios de apuração baseados na Loteria Federal.
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-dark-900 font-black text-xs uppercase tracking-wider shadow-glow-emerald active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>GERANDO COBRANÇA PIX...</span>
                  </>
                ) : (
                  <>
                    <QrCode className="w-5 h-5" />
                    <span>GERAR PIX DE {formatCurrency(pricing.finalTotal)}</span>
                  </>
                )}
              </button>
            </form>

            {/* Order Summary (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-6 rounded-2xl bg-dark-850 border border-dark-750 space-y-4 shadow-premium-card">
                <h3 className="font-heading font-black text-xs text-foreground uppercase tracking-wider border-b border-dark-750 pb-3 flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-primary-400" />
                  RESUMO DO PEDIDO
                </h3>

                {/* Numbers list */}
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                    NÚMEROS SELECIONADOS ({selectedNumbers.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-2 max-h-32 overflow-y-auto p-2 rounded-xl bg-dark-900 border border-dark-750">
                    {selectedNumbers.map((n) => (
                      <span
                        key={n}
                        className="px-2.5 py-1 rounded-lg bg-dark-800 text-primary-400 border border-primary-500/30 text-xs font-mono font-black"
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pricing detail */}
                <div className="space-y-2 pt-2 border-t border-dark-750 text-xs">
                  <div className="flex justify-between text-slate-400 uppercase font-semibold">
                    <span>PREÇO ORIGINAL ({selectedNumbers.length}X R$ 30,00):</span>
                    <span className="font-mono">{formatCurrency(pricing.originalTotal)}</span>
                  </div>

                  {pricing.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-bold bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20 uppercase">
                      <span>DESCONTO PROMOÇÃO 3 POR R$ 63:</span>
                      <span className="font-mono">-{formatCurrency(pricing.discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-baseline pt-2 border-t border-dark-750 text-foreground">
                    <span className="text-xs font-black uppercase tracking-wider">TOTAL A PAGAR:</span>
                    <span className="text-2xl font-heading font-black text-primary-400 font-mono">
                      {formatCurrency(pricing.finalTotal)}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-dark-900 border border-dark-750 text-[11px] text-slate-400 space-y-1 uppercase font-semibold">
                  <p className="flex items-center gap-1.5 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    CONFIRMAÇÃO INSTANTÂNEA VIA PIX
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    BILHETES EMITIDOS APÓS O PAGAMENTO
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* STEP 2: PIX QR CODE & COPIA E COLA */
        <div className="max-w-xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider animate-pulse">
              <Clock className="w-3.5 h-3.5" />
              <span>AGUARDANDO PAGAMENTO PIX</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-foreground uppercase tracking-tight">
              PAGUE COM SEU BANCO OU CARTEIRA
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Escaneie o QR Code abaixo ou copie o código Pix para pagar no app do seu banco.
            </p>
          </div>

          {/* Reservation Countdown Warning */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider text-center flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>SEUS NÚMEROS ESTÃO RESERVADOS POR: <strong className="font-mono text-sm text-foreground">{formatTimer(timeLeft)}</strong></span>
          </div>

          {/* QR Code Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-dark-850 border border-dark-700 shadow-2xl text-center space-y-6">
            
            {/* Amount */}
            <div>
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">VALOR DO PIX</span>
              <p className="text-3xl font-heading font-black text-emerald-400 mt-0.5">
                {formatCurrency(pricing.finalTotal)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 uppercase font-semibold">PEDIDO: {orderCode}</p>
            </div>

            {/* QR Code Frame */}
            <div className="relative w-64 h-64 mx-auto p-3 bg-white rounded-2xl shadow-xl flex items-center justify-center">
              {qrCodeBase64 ? (
                <img src={qrCodeBase64} alt="QR Code Pix" className="w-full h-full object-contain" />
              ) : (
                <div className="text-dark-900 text-xs font-bold uppercase animate-pulse">GERANDO QR CODE...</div>
              )}
            </div>

            {/* Pix Copia e Cola */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                PIX COPIA E COLA:
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={pixCopiaECola}
                  className="w-full px-3.5 py-2.5 bg-dark-900 border border-dark-700 rounded-xl text-xs text-slate-300 font-mono truncate focus:outline-none"
                />
                <button
                  onClick={handleCopyPix}
                  className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-all ${
                    copied
                      ? "bg-emerald-500 text-dark-900"
                      : "bg-primary-500 hover:bg-primary-400 text-dark-900 shadow-glow-primary"
                  }`}
                >
                  {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? "COPIADO!" : "COPIAR"}</span>
                </button>
              </div>
            </div>

            {/* Simulated Payment Button (Sandbox/Test Mode) */}
            <div className="pt-4 border-t border-dark-750">
              <div className="p-3 rounded-xl bg-dark-900 border border-dark-750 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1 text-amber-400 font-bold uppercase tracking-wider">
                    <Zap className="w-3.5 h-3.5" />
                    AMBIENTE DE DEMONSTRAÇÃO / TESTES:
                  </span>
                </div>
                <button
                  onClick={handleSimulatePayment}
                  disabled={simulating}
                  className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-1.5 transition-all"
                >
                  {simulating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>CONFIRMANDO...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>SIMULAR PAGAMENTO PIX AGORA</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Auto status listener note */}
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 uppercase font-semibold">
              <RefreshCw className="w-3.5 h-3.5 text-primary-400 animate-spin" />
              <span>IDENTIFICANDO PAGAMENTO AUTOMATICAMENTE...</span>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
