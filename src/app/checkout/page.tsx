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
  ChevronDown,
} from "lucide-react";
import { formatCPF, cleanCPF, validateCPF } from "@/lib/cpf";
import { formatCurrency, calculateOrderPrice } from "@/lib/pricing";
import { haptic } from "@/lib/haptics";

export default function CheckoutPage() {
  const router = useRouter();

  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [agreedRules, setAgreedRules] = useState(false);

  // Estados do fluxo
  const [step, setStep] = useState<"form" | "pix">("form");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);

  // Pix
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [pixCopiaECola, setPixCopiaECola] = useState("");
  const [qrCodeBase64, setQrCodeBase64] = useState("");
  const [copied, setCopied] = useState(false);
  const [simulating, setSimulating] = useState(false);

  const [timeLeft, setTimeLeft] = useState<number>(15 * 60);
  const isDevMode = process.env.NODE_ENV !== "production";

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
        setSessionId(parsed.sessionId ?? null);
      }
    } catch {
      router.push("/numeros");
    }
  }, [router]);

  const pricing = calculateOrderPrice(selectedNumbers.length, 30.0, 3, 63.0);

  const handleCpfChange = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 11);
    setCpf(formatCPF(raw));
  };

  const handlePhoneChange = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 11);
    if (raw.length <= 10) {
      setWhatsapp(raw.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3"));
    } else {
      setWhatsapp(raw.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3"));
    }
  };

  const handleGeneratePix = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || fullName.trim().split(/\s+/).length < 2) {
      haptic("error");
      setErrorMessage("Por favor, digite seu nome e sobrenome completos.");
      return;
    }

    const cleanCpfVal = cleanCPF(cpf);
    if (!validateCPF(cleanCpfVal)) {
      haptic("error");
      setErrorMessage("O CPF digitado é inválido. Verifique os números.");
      return;
    }

    const cleanPhoneVal = whatsapp.replace(/\D/g, "");
    if (cleanPhoneVal.length < 10) {
      haptic("error");
      setErrorMessage("Por favor, digite um número de WhatsApp válido.");
      return;
    }

    if (!agreedRules) {
      haptic("error");
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
          // A rota exige o aceite explícito do regulamento
          agreedRules,
          sessionId,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        haptic("error");
        setErrorMessage(data.error || "Não foi possível gerar a cobrança Pix. Tente novamente.");
        return;
      }

      // A rota devolve orderCode na raiz e os dados do Pix dentro de `payment`
      setOrderCode(data.orderCode);
      setPixCopiaECola(data.payment?.pixCopiaECola || "");
      setQrCodeBase64(data.payment?.qrCodeBase64 || "");
      haptic("success");
      setStep("pix");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      haptic("error");
      setErrorMessage("Erro de conexão ao processar pagamento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPix = async () => {
    if (!pixCopiaECola) return;
    try {
      await navigator.clipboard.writeText(pixCopiaECola);
    } catch {
      // Navegadores antigos / contextos sem permissão de área de transferência
      const el = document.createElement("textarea");
      el.value = pixCopiaECola;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    haptic("success");
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

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

  useEffect(() => {
    if (step !== "pix" || !orderCode) return;

    const interval = setInterval(async () => {
      try {
        // A rota lê o parâmetro `code`
        const res = await fetch(`/api/checkout/status?code=${orderCode}`);
        const data = await res.json();
        // A compra fica com status "COMPLETED"; `isPaid` é o sinal canônico
        if (data.success && data.isPaid) {
          clearInterval(interval);
          sessionStorage.removeItem("currentReservation");
          haptic("success");
          router.push(`/confirmacao?code=${orderCode}`);
        }
      } catch (err) {
        console.error("Erro ao verificar status:", err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [step, orderCode, router]);

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

  /** Classe base dos campos: 48px de altura e fonte 16px (sem zoom no iOS). */
  const fieldClass =
    "w-full h-12 px-4 bg-dark-900 border border-dark-700 rounded-xl text-base sm:text-sm text-foreground placeholder:text-slate-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-12">
      {/* Voltar */}
      <div className="mb-4">
        <Link
          href="/numeros"
          className="inline-flex items-center gap-1.5 h-10 text-xs font-bold uppercase tracking-wider text-slate-400 active:text-primary-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar aos números</span>
        </Link>
      </div>

      {/* Indicador de etapas */}
      <div className="flex items-center gap-2 mb-6" aria-label="Progresso do pedido">
        {[
          { id: "form", label: "Seus dados" },
          { id: "pix", label: "Pagamento" },
        ].map((s, idx) => {
          const isDone = step === "pix" && s.id === "form";
          const isCurrent = step === s.id;
          return (
            <div key={s.id} className="flex-1 flex items-center gap-2">
              <div className="flex-1">
                <div
                  className={`h-1.5 rounded-full transition-colors ${
                    isDone || isCurrent ? "bg-primary-500" : "bg-dark-750"
                  }`}
                />
                <span
                  className={`mt-1.5 block text-[10px] font-black uppercase tracking-wider ${
                    isCurrent ? "text-primary-400" : isDone ? "text-emerald-400" : "text-slate-500"
                  }`}
                >
                  {idx + 1}. {s.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {step === "form" ? (
        /* ---------- ETAPA 1: DADOS DO PARTICIPANTE ---------- */
        <div className="space-y-5">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Ambiente seguro</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-heading font-black text-foreground uppercase tracking-tight leading-tight">
              Finalize seus números da sorte
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Informe seus dados para vincular os bilhetes e gerar o Pix.
            </p>
          </div>

          {/* Resumo colapsável — no celular fica no topo, sem empurrar o formulário */}
          <div className="lg:hidden rounded-2xl bg-dark-850 border border-dark-750 overflow-hidden">
            <button
              onClick={() => setSummaryOpen((v) => !v)}
              aria-expanded={summaryOpen}
              className="w-full px-4 h-14 flex items-center justify-between gap-3 no-tap-highlight"
            >
              <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-200">
                <Ticket className="w-4 h-4 text-primary-400" />
                {selectedNumbers.length}{" "}
                {selectedNumbers.length === 1 ? "número" : "números"}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-lg font-heading font-black text-primary-400">
                  {formatCurrency(pricing.finalTotal)}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    summaryOpen ? "rotate-180" : ""
                  }`}
                />
              </span>
            </button>

            {summaryOpen && (
              <div className="px-4 pb-4 space-y-3 border-t border-dark-750 pt-3 animate-fade-in">
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto momentum-scroll">
                  {selectedNumbers.map((n) => (
                    <span
                      key={n}
                      className="px-2.5 py-1 rounded-lg bg-dark-900 text-primary-400 border border-primary-500/30 text-xs font-mono font-black"
                    >
                      {n}
                    </span>
                  ))}
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400 uppercase font-semibold">
                    <span>{selectedNumbers.length} × R$ 30,00</span>
                    <span className="font-mono">{formatCurrency(pricing.originalTotal)}</span>
                  </div>
                  {pricing.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-bold uppercase">
                      <span>Desconto promoção</span>
                      <span className="font-mono">-{formatCurrency(pricing.discountAmount)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs sm:text-sm font-bold flex items-start gap-2"
            >
              <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Formulário */}
            <form onSubmit={handleGeneratePix} className="lg:col-span-7 space-y-4">
              <div className="p-4 sm:p-6 rounded-2xl bg-dark-850 border border-dark-750 space-y-4 shadow-premium-card">
                <h2 className="font-heading font-black text-xs text-foreground uppercase tracking-wider border-b border-dark-750 pb-3 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary-400" />
                  Dados do participante
                </h2>

                <div className="space-y-1.5">
                  <label
                    htmlFor="fullName"
                    className="text-xs font-bold uppercase tracking-wider text-slate-300 block"
                  >
                    Nome completo <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    autoComplete="name"
                    autoCapitalize="words"
                    enterKeyHint="next"
                    placeholder="Ex: Carlos Eduardo da Silva"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={fieldClass}
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="cpf"
                    className="text-xs font-bold uppercase tracking-wider text-slate-300 block"
                  >
                    CPF <span className="text-red-400">*</span>
                    <span className="text-[11px] text-slate-500 font-normal normal-case ml-1">
                      (registro do bilhete)
                    </span>
                  </label>
                  {/* inputMode numeric abre o teclado numérico do celular */}
                  <input
                    id="cpf"
                    type="text"
                    required
                    inputMode="numeric"
                    pattern="[0-9.\-]*"
                    enterKeyHint="next"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => handleCpfChange(e.target.value)}
                    className={`${fieldClass} font-mono tracking-wide`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="whatsapp"
                    className="text-xs font-bold uppercase tracking-wider text-slate-300 block"
                  >
                    WhatsApp <span className="text-red-400">*</span>
                    <span className="text-[11px] text-slate-500 font-normal normal-case ml-1">
                      (contato do ganhador)
                    </span>
                  </label>
                  <input
                    id="whatsapp"
                    type="tel"
                    required
                    inputMode="tel"
                    autoComplete="tel-national"
                    enterKeyHint="next"
                    placeholder="(00) 00000-0000"
                    value={whatsapp}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className={`${fieldClass} font-mono tracking-wide`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="text-xs font-bold uppercase tracking-wider text-slate-300 block"
                  >
                    E-mail{" "}
                    <span className="text-slate-500 text-[11px] normal-case font-normal">
                      (opcional)
                    </span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    enterKeyHint="done"
                    placeholder="seuemail@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={fieldClass}
                  />
                </div>

                <div className="pt-3 border-t border-dark-750">
                  <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-300 leading-relaxed select-none py-1">
                    <input
                      type="checkbox"
                      checked={agreedRules}
                      onChange={(e) => setAgreedRules(e.target.checked)}
                      className="mt-0.5 w-5 h-5 shrink-0 rounded border-dark-600 bg-dark-900 text-primary-500 focus:ring-primary-500 focus:ring-offset-dark-900 cursor-pointer"
                    />
                    <span>
                      Li e concordo com o{" "}
                      <Link
                        href="/regras"
                        target="_blank"
                        className="text-primary-400 underline font-bold uppercase"
                      >
                        Regulamento da ação
                      </Link>{" "}
                      e com os critérios de apuração da Loteria Federal.
                    </span>
                  </label>
                </div>
              </div>

              {/* CTA fixo no rodapé do celular; inline no desktop */}
              <div
                className="fixed lg:static bottom-0 inset-x-0 z-40 p-4 lg:p-0 bg-dark-900/97 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none border-t lg:border-0 border-dark-750"
                style={{ paddingBottom: "calc(var(--sab) + 1rem)" }}
              >
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-dark-900 font-black text-sm uppercase tracking-wider shadow-glow-emerald active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Gerando Pix...</span>
                    </>
                  ) : (
                    <>
                      <QrCode className="w-5 h-5" />
                      <span>Gerar Pix de {formatCurrency(pricing.finalTotal)}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Reserva de espaço para o CTA fixo */}
              <div className="lg:hidden h-24" aria-hidden />
            </form>

            {/* Resumo completo (desktop) */}
            <aside className="hidden lg:block lg:col-span-5 space-y-4">
              <div className="p-6 rounded-2xl bg-dark-850 border border-dark-750 space-y-4 shadow-premium-card sticky top-24">
                <h2 className="font-heading font-black text-xs text-foreground uppercase tracking-wider border-b border-dark-750 pb-3 flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-primary-400" />
                  Resumo do pedido
                </h2>

                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                    Números selecionados ({selectedNumbers.length}):
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

                <div className="space-y-2 pt-2 border-t border-dark-750 text-xs">
                  <div className="flex justify-between text-slate-400 uppercase font-semibold">
                    <span>Preço original ({selectedNumbers.length}× R$ 30,00):</span>
                    <span className="font-mono">{formatCurrency(pricing.originalTotal)}</span>
                  </div>

                  {pricing.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-bold bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20 uppercase">
                      <span>Desconto promoção:</span>
                      <span className="font-mono">-{formatCurrency(pricing.discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-baseline pt-2 border-t border-dark-750 text-foreground">
                    <span className="text-xs font-black uppercase tracking-wider">Total a pagar:</span>
                    <span className="text-2xl font-heading font-black text-primary-400 font-mono">
                      {formatCurrency(pricing.finalTotal)}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-dark-900 border border-dark-750 text-[11px] text-slate-400 space-y-1 uppercase font-semibold">
                  <p className="flex items-center gap-1.5 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Confirmação instantânea via Pix
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Bilhetes emitidos após o pagamento
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      ) : (
        /* ---------- ETAPA 2: PAGAMENTO PIX ---------- */
        <div className="max-w-xl mx-auto space-y-5">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-bold uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5" />
              <span>Aguardando pagamento</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-heading font-black text-foreground uppercase tracking-tight leading-tight">
              Pague com o app do seu banco
            </h1>
          </div>

          {/* Contagem regressiva grudada no topo — sempre visível ao rolar */}
          <div
            className="sticky z-30 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider text-center flex items-center justify-center gap-2 backdrop-blur-md"
            style={{ top: "calc(var(--sat) + 4rem)" }}
          >
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Reservado por{" "}
              <strong className="font-mono text-sm text-foreground">{formatTimer(timeLeft)}</strong>
            </span>
          </div>

          <div className="p-4 sm:p-8 rounded-2xl bg-dark-850 border border-dark-700 shadow-2xl text-center space-y-5">
            <div>
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                Valor do Pix
              </span>
              <p className="text-3xl sm:text-4xl font-heading font-black text-emerald-400 mt-0.5">
                {formatCurrency(pricing.finalTotal)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 uppercase font-semibold font-mono">
                Pedido: {orderCode}
              </p>
            </div>

            {/* QR Code — acompanha a largura da tela no celular */}
            <div className="relative w-full max-w-[260px] aspect-square mx-auto p-3 bg-white rounded-2xl shadow-xl flex items-center justify-center">
              {qrCodeBase64 ? (
                <img
                  src={qrCodeBase64}
                  alt="QR Code do Pix para pagamento"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-dark-900 text-xs font-bold uppercase animate-pulse">
                  Gerando QR Code...
                </div>
              )}
            </div>

            {/* Copia e cola — botão grande e largo, o caminho principal no celular */}
            <div className="space-y-2">
              <button
                onClick={handleCopyPix}
                className={`w-full h-14 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                  copied
                    ? "bg-emerald-500 text-dark-900"
                    : "bg-primary-500 text-dark-900 shadow-glow-primary"
                }`}
              >
                {copied ? (
                  <Check className="w-5 h-5 stroke-[3]" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
                <span>{copied ? "Código copiado!" : "Copiar código Pix"}</span>
              </button>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Abra o app do seu banco → Pix → <strong>Pix Copia e Cola</strong> → cole o código.
              </p>

              <details className="text-left">
                <summary className="text-[11px] font-bold uppercase tracking-wider text-slate-400 cursor-pointer py-2 list-none flex items-center gap-1">
                  <ChevronDown className="w-3.5 h-3.5" />
                  Ver o código completo
                </summary>
                <p className="mt-1 p-3 rounded-xl bg-dark-900 border border-dark-700 text-[10px] text-slate-400 font-mono break-all select-all">
                  {pixCopiaECola}
                </p>
              </details>
            </div>

            {/* Modo de demonstração (visível apenas em ambiente de testes/desenvolvimento) */}
            {isDevMode && (
              <div className="pt-4 border-t border-dark-750">
                <div className="p-3 rounded-xl bg-dark-900 border border-dark-750 space-y-2">
                  <span className="flex items-center justify-center gap-1 text-amber-400 font-bold uppercase tracking-wider text-[11px]">
                    <Zap className="w-3.5 h-3.5" />
                    Ambiente de demonstração
                  </span>
                  <button
                    onClick={handleSimulatePayment}
                    disabled={simulating}
                    className="w-full h-12 rounded-xl bg-emerald-600 active:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                  >
                    {simulating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Confirmando...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Simular pagamento Pix</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 uppercase font-semibold">
              <RefreshCw className="w-3.5 h-3.5 text-primary-400 animate-spin" />
              <span>Identificando o pagamento automaticamente...</span>
            </div>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-bold flex items-start gap-2"
            >
              <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
