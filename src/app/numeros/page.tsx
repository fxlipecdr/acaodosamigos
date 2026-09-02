"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  Ticket, 
  Search, 
  Check, 
  Sparkles, 
  ShoppingCart, 
  Trash2, 
  ArrowRight, 
  Clock, 
  Lock, 
  AlertCircle,
  RefreshCw,
  XCircle,
  Info,
  CheckCircle2
} from "lucide-react";
import { calculateOrderPrice, formatCurrency } from "@/lib/pricing";

interface NumberItem {
  number: number;
  status: "AVAILABLE" | "RESERVED" | "PAID" | "BLOCKED";
  origin: "ONLINE" | "PRESENTIAL";
}

export default function NumerosPage() {
  const router = useRouter();
  const [numbers, setNumbers] = useState<NumberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [reserving, setReserving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [unitPrice, setUnitPrice] = useState(30.0);
  const [bundleSize, setBundleSize] = useState(3);
  const [bundlePrice, setBundlePrice] = useState(63.0);

  // Load numbers from API
  const loadNumbers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/numbers?mode=ONLINE");
      const data = await res.json();
      if (data.success) {
        setNumbers(data.numbers);
        if (data.settings) {
          setUnitPrice(data.settings.unitPrice);
          setBundleSize(data.settings.promoBundleSize);
          setBundlePrice(data.settings.promoBundlePrice);
        }
      }
    } catch (err) {
      console.error("Erro ao carregar números:", err);
      setErrorMessage("Não foi possível carregar os números. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNumbers();
  }, []);

  // Filter numbers
  const filteredNumbers = useMemo(() => {
    if (!searchTerm.trim()) return numbers;
    return numbers.filter((n) => n.number.toString().includes(searchTerm.trim()));
  }, [numbers, searchTerm]);

  // Pricing calculation
  const pricing = useMemo(() => {
    return calculateOrderPrice(selectedNumbers.length, unitPrice, bundleSize, bundlePrice);
  }, [selectedNumbers.length, unitPrice, bundleSize, bundlePrice]);

  // Toggle selection
  const toggleNumber = (num: number, status: string) => {
    if (status !== "AVAILABLE" && !selectedNumbers.includes(num)) return;

    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== num));
    } else {
      setSelectedNumbers([...selectedNumbers, num]);
    }
  };

  // Quick random selectors (+1, +3 promo, +6 promo)
  const selectRandomNumbers = (count: number) => {
    const available = numbers.filter(
      (n) => n.status === "AVAILABLE" && !selectedNumbers.includes(n.number)
    );

    if (available.length < count) {
      setErrorMessage(`Existem apenas ${available.length} números disponíveis para seleção.`);
      return;
    }

    // Shuffle and pick
    const shuffled = [...available].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, count).map((n) => n.number);

    setSelectedNumbers([...selectedNumbers, ...picked]);
    setErrorMessage(null);
  };

  const clearSelection = () => {
    setSelectedNumbers([]);
  };

  // Proceed to Checkout & Hold numbers
  const handleProceedToCheckout = async () => {
    if (selectedNumbers.length === 0) return;

    try {
      setReserving(true);
      setErrorMessage(null);

      const res = await fetch("/api/checkout/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numbers: selectedNumbers }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Alguns números selecionados acabaram de ser reservados por outro usuário. Por favor, tente novamente.");
        loadNumbers(); // Refresh numbers
        return;
      }

      // Save reservation details in sessionStorage and redirect to checkout
      sessionStorage.setItem("currentReservation", JSON.stringify({
        reservationId: data.reservationId,
        numbers: data.numbers,
        expiresAt: data.expiresAt,
        finalTotal: pricing.finalTotal,
        unitPrice,
        bundleSize,
        bundlePrice
      }));

      router.push("/checkout");
    } catch (err) {
      setErrorMessage("Erro de conexão ao reservar números. Tente novamente.");
    } finally {
      setReserving(false);
    }
  };

  // Check if a specific number was searched
  const searchDirectMatch = useMemo(() => {
    if (searchTerm.length === 4) {
      const parsed = parseInt(searchTerm, 10);
      return numbers.find((n) => n.number === parsed);
    }
    return null;
  }, [searchTerm, numbers]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-32">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-8 space-y-2">
        <span className="text-xs font-bold text-primary-400 uppercase tracking-widest">
          VENDA ONLINE OFICIAL
        </span>
        <h1 className="text-3xl sm:text-4xl font-heading font-black text-foreground uppercase tracking-tight">
          ESCOLHA SEUS NÚMEROS DA SORTE
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Clique nos números disponíveis para selecionar. Aproveite nossa promoção especial online!
        </p>
      </div>

      {/* Online Promotion Highlight Banner */}
      <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-primary-950/40 via-dark-850 to-primary-950/40 border border-primary-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-glow-primary">
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="w-12 h-12 rounded-xl bg-primary-500/20 text-primary-400 flex items-center justify-center font-black shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-primary-400 uppercase tracking-wider">PROMOÇÃO AUTOMÁTICA</span>
            <p className="text-sm sm:text-base font-black text-foreground uppercase tracking-tight">
              COMPRE 2 NÚMEROS POR R$ 60 E LEVE O 3º POR APENAS <span className="text-emerald-400">R$ 3,00</span>!
            </p>
            <p className="text-xs text-slate-400">3 números saem por R$ 63 (R$ 21 cada um)</p>
          </div>
        </div>

        {/* Quick select batch buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => selectRandomNumbers(1)}
            className="px-3 py-2 rounded-lg bg-dark-800 hover:bg-dark-750 text-slate-300 hover:text-foreground text-xs font-bold uppercase tracking-wider border border-dark-700"
          >
            +1 NÚMERO
          </button>
          <button
            onClick={() => selectRandomNumbers(3)}
            className="px-3.5 py-2 rounded-lg bg-primary-500/20 hover:bg-primary-500/30 text-primary-300 text-xs font-black uppercase tracking-wider border border-primary-500/40 shadow-sm"
          >
            +3 NÚMEROS (R$ 63)
          </button>
          <button
            onClick={() => selectRandomNumbers(6)}
            className="px-3.5 py-2 rounded-lg bg-primary-500/20 hover:bg-primary-500/30 text-primary-300 text-xs font-black uppercase tracking-wider border border-primary-500/40 shadow-sm"
          >
            +6 NÚMEROS (R$ 126)
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="mb-6 bg-dark-850 p-4 rounded-2xl border border-dark-750 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Digite um número (ex: 3124)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.replace(/\D/g, ""))}
            className="w-full pl-10 pr-4 py-2.5 bg-dark-900 border border-dark-700 rounded-xl text-sm text-foreground placeholder:text-slate-500 focus:outline-none focus:border-primary-500 font-mono"
            maxLength={4}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold uppercase text-slate-400 hover:text-slate-200"
            >
              LIMPAR
            </button>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold uppercase tracking-wider text-slate-300">
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-dark-800 border border-dark-600 inline-block" />
            DISPONÍVEL
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-primary-500 inline-block" />
            SELECIONADO
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-amber-500/30 border border-amber-500/50 inline-block" />
            RESERVADO
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-dark-950 border border-dark-800 opacity-50 inline-block" />
            VENDIDO
          </span>
          <button
            onClick={loadNumbers}
            disabled={loading}
            className="p-1.5 rounded-lg bg-dark-800 hover:bg-dark-750 text-slate-400 hover:text-foreground transition-colors ml-2"
            title="Atualizar números"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

      </div>

      {/* Direct Search Match Alert Card */}
      {searchDirectMatch && (
        <div className="mb-6 p-4 rounded-xl bg-dark-900 border border-dark-750 flex items-center justify-between gap-4 animate-in fade-in">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase">RESULTADO DA BUSCA:</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xl font-mono font-black text-foreground">
                Nº {searchDirectMatch.number}
              </span>
              {searchDirectMatch.status === "AVAILABLE" ? (
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  NÚMERO DISPONÍVEL
                </span>
              ) : searchDirectMatch.status === "PAID" ? (
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-dark-800 border border-dark-700 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" />
                  NÚMERO JÁ VENDIDO
                </span>
              ) : (
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  TEMPORARIAMENTE RESERVADO
                </span>
              )}
            </div>
          </div>

          {searchDirectMatch.status === "AVAILABLE" && (
            <button
              onClick={() => toggleNumber(searchDirectMatch.number, "AVAILABLE")}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                selectedNumbers.includes(searchDirectMatch.number)
                  ? "bg-red-500/20 text-red-300 border border-red-500/40"
                  : "bg-primary-500 text-dark-900 shadow-glow-primary"
              }`}
            >
              {selectedNumbers.includes(searchDirectMatch.number) ? "REMOVER" : "SELECIONAR NÚMERO"}
            </button>
          )}
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs sm:text-sm font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Grid of Numbers */}
      {loading ? (
        <div className="p-16 text-center space-y-3 bg-dark-850 rounded-2xl border border-dark-750">
          <RefreshCw className="w-8 h-8 text-primary-400 animate-spin mx-auto" />
          <p className="text-sm font-bold uppercase tracking-wider text-slate-300">CARREGANDO NÚMEROS DA AÇÃO...</p>
        </div>
      ) : filteredNumbers.length === 0 ? (
        <div className="p-12 text-center bg-dark-850 rounded-2xl border border-dark-750 text-slate-400 space-y-2">
          <Ticket className="w-8 h-8 mx-auto text-slate-500 mb-2" />
          <p className="font-heading font-black text-foreground uppercase">NENHUM NÚMERO ENCONTRADO</p>
          <p className="text-xs text-slate-500">Tente buscar por outro número na faixa de 3000 a 3999.</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 sm:gap-2.5">
          {filteredNumbers.map((item) => {
            const isSelected = selectedNumbers.includes(item.number);
            const isAvailable = item.status === "AVAILABLE";
            const isReserved = item.status === "RESERVED";
            const isPaid = item.status === "PAID" || item.status === "BLOCKED";

            return (
              <button
                key={item.number}
                disabled={!isAvailable && !isSelected}
                onClick={() => toggleNumber(item.number, item.status)}
                className={`
                  relative h-12 rounded-xl font-mono text-sm font-bold transition-all duration-150 flex items-center justify-center select-none
                  ${
                    isSelected
                      ? "bg-gradient-to-br from-primary-400 to-primary-600 text-dark-900 shadow-glow-primary scale-105 z-10 font-black"
                      : isAvailable
                      ? "bg-dark-850 hover:bg-dark-750 text-foreground border border-dark-700/80 hover:border-primary-500/50 hover:scale-105 active:scale-95 cursor-pointer"
                      : isReserved
                      ? "bg-amber-500/10 text-amber-500/50 border border-amber-500/20 cursor-not-allowed"
                      : "bg-dark-950 text-slate-600 border border-dark-850 opacity-40 cursor-not-allowed line-through"
                  }
                `}
              >
                <span>{item.number}</span>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 absolute top-1 right-1 text-dark-900 stroke-[3]" />
                )}
                {isReserved && !isSelected && (
                  <Lock className="w-2.5 h-2.5 absolute top-1 right-1 text-amber-500/60" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Floating Bottom Cart Bar */}
      {selectedNumbers.length > 0 && (
        <div className="fixed bottom-4 inset-x-4 max-w-4xl mx-auto z-40 bg-dark-900/95 backdrop-blur-md border-2 border-primary-500/60 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-bottom-4 duration-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Numbers List & Selection Info */}
            <div className="w-full md:w-auto flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-500 text-dark-900 font-black flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      {selectedNumbers.length} {selectedNumbers.length === 1 ? "NÚMERO SELECIONADO" : "NÚMEROS SELECIONADOS"}
                    </span>
                    <button
                      onClick={clearSelection}
                      className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 font-bold uppercase"
                    >
                      <Trash2 className="w-3 h-3" /> LIMPAR
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1 max-h-12 overflow-y-auto">
                    {selectedNumbers.map((n) => (
                      <span
                        key={n}
                        className="px-2 py-0.5 rounded bg-dark-800 text-primary-400 border border-primary-500/30 text-xs font-mono font-bold"
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Promo incentive badge */}
              {pricing.remainderCount === 2 && (
                <div className="text-xs bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider animate-pulse flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ADICIONE +1 NÚMERO E LEVE POR APENAS R$ 3,00!</span>
                </div>
              )}
            </div>

            {/* Price Breakdown & CTA */}
            <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-6 pt-2 md:pt-0 border-t md:border-t-0 border-dark-800">
              
              <div className="text-right">
                {pricing.discountAmount > 0 && (
                  <div className="flex items-center justify-end gap-1.5 text-[11px]">
                    <span className="text-slate-500 line-through font-mono">
                      {formatCurrency(pricing.originalTotal)}
                    </span>
                    <span className="text-emerald-400 font-bold uppercase">
                      ECONOMIA: {formatCurrency(pricing.discountAmount)}
                    </span>
                  </div>
                )}
                <div className="flex items-baseline justify-end gap-1.5">
                  <span className="text-xs text-slate-400 uppercase font-bold">TOTAL:</span>
                  <span className="text-2xl sm:text-3xl font-heading font-black text-foreground">
                    {formatCurrency(pricing.finalTotal)}
                  </span>
                </div>
              </div>

              <button
                disabled={reserving}
                onClick={handleProceedToCheckout}
                className="px-6 sm:px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 text-dark-900 font-black text-xs uppercase tracking-wider shadow-glow-primary active:scale-95 transition-all flex items-center gap-2 shrink-0 disabled:opacity-50"
              >
                {reserving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>RESERVANDO...</span>
                  </>
                ) : (
                  <>
                    <span>CONTINUAR</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
