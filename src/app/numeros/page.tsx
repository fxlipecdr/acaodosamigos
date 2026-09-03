"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  X,
} from "lucide-react";
import { calculateOrderPrice, formatCurrency } from "@/lib/pricing";
import { haptic } from "@/lib/haptics";
import { setCartBarVisible } from "@/lib/uiEvents";

interface NumberItem {
  number: number;
  status: "AVAILABLE" | "RESERVED" | "PAID" | "BLOCKED";
  origin: "ONLINE" | "PRESENTIAL";
}

type StatusFilter = "ALL" | "AVAILABLE" | "SELECTED";

/** Tamanho de cada faixa exibida por vez — evita montar 1.000 botões no celular. */
const RANGE_SIZE = 100;

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

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [activeRange, setActiveRange] = useState(0);
  const [cartExpanded, setCartExpanded] = useState(false);

  const gridRef = useRef<HTMLDivElement>(null);

  // Carrega os números da API
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

  // Avisa a navegação inferior / botão do WhatsApp que o carrinho ocupou a base
  useEffect(() => {
    setCartBarVisible(selectedNumbers.length > 0);
    return () => setCartBarVisible(false);
  }, [selectedNumbers.length]);

  // Faixas de 100 em 100 a partir do menor número disponível na campanha
  const ranges = useMemo(() => {
    if (numbers.length === 0) return [];
    const min = numbers[0].number;
    const max = numbers[numbers.length - 1].number;
    const out: Array<{ start: number; end: number }> = [];
    for (let s = min; s <= max; s += RANGE_SIZE) {
      out.push({ start: s, end: Math.min(s + RANGE_SIZE - 1, max) });
    }
    return out;
  }, [numbers]);

  const availableCount = useMemo(
    () => numbers.filter((n) => n.status === "AVAILABLE").length,
    [numbers]
  );

  // Busca por número tem prioridade sobre a faixa ativa
  const isSearching = searchTerm.trim().length > 0;

  const visibleNumbers = useMemo(() => {
    let base = numbers;

    if (isSearching) {
      base = base.filter((n) => n.number.toString().includes(searchTerm.trim()));
    } else if (ranges[activeRange]) {
      const { start, end } = ranges[activeRange];
      base = base.filter((n) => n.number >= start && n.number <= end);
    }

    if (statusFilter === "AVAILABLE") {
      base = base.filter(
        (n) => n.status === "AVAILABLE" || selectedNumbers.includes(n.number)
      );
    } else if (statusFilter === "SELECTED") {
      base = numbers.filter((n) => selectedNumbers.includes(n.number));
    }

    return base;
  }, [numbers, searchTerm, isSearching, ranges, activeRange, statusFilter, selectedNumbers]);

  // Quantos números livres cada faixa ainda tem — mostrado na aba
  const rangeAvailability = useMemo(() => {
    const map = new Map<number, number>();
    ranges.forEach((r, idx) => {
      map.set(
        idx,
        numbers.filter(
          (n) => n.number >= r.start && n.number <= r.end && n.status === "AVAILABLE"
        ).length
      );
    });
    return map;
  }, [ranges, numbers]);

  const pricing = useMemo(
    () => calculateOrderPrice(selectedNumbers.length, unitPrice, bundleSize, bundlePrice),
    [selectedNumbers.length, unitPrice, bundleSize, bundlePrice]
  );

  const toggleNumber = (num: number, status: string) => {
    if (status !== "AVAILABLE" && !selectedNumbers.includes(num)) return;

    if (selectedNumbers.includes(num)) {
      haptic("select");
      setSelectedNumbers(selectedNumbers.filter((n) => n !== num));
    } else {
      haptic("select");
      setSelectedNumbers([...selectedNumbers, num]);
    }
  };

  const selectRandomNumbers = (count: number) => {
    const available = numbers.filter(
      (n) => n.status === "AVAILABLE" && !selectedNumbers.includes(n.number)
    );

    if (available.length < count) {
      haptic("error");
      setErrorMessage(`Existem apenas ${available.length} números disponíveis para seleção.`);
      return;
    }

    const shuffled = [...available].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, count).map((n) => n.number);

    haptic("success");
    setSelectedNumbers([...selectedNumbers, ...picked]);
    setErrorMessage(null);
  };

  const clearSelection = () => {
    haptic("warning");
    setSelectedNumbers([]);
    setCartExpanded(false);
  };

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
        haptic("error");
        setErrorMessage(
          data.error ||
            "Alguns números selecionados acabaram de ser reservados por outro usuário. Por favor, tente novamente."
        );
        loadNumbers();
        return;
      }

      // A rota devolve sessionId/expiresAt — os números vêm da seleção local,
      // que é a fonte da verdade do que acabou de ser reservado.
      sessionStorage.setItem(
        "currentReservation",
        JSON.stringify({
          sessionId: data.sessionId,
          numbers: selectedNumbers,
          expiresAt: data.expiresAt,
          finalTotal: pricing.finalTotal,
          unitPrice,
          bundleSize,
          bundlePrice,
        })
      );

      haptic("success");
      router.push("/checkout");
    } catch (err) {
      haptic("error");
      setErrorMessage("Erro de conexão ao reservar números. Tente novamente.");
    } finally {
      setReserving(false);
    }
  };

  const searchDirectMatch = useMemo(() => {
    if (searchTerm.length === 4) {
      const parsed = parseInt(searchTerm, 10);
      return numbers.find((n) => n.number === parsed);
    }
    return null;
  }, [searchTerm, numbers]);

  const goToRange = (idx: number) => {
    haptic("select");
    setActiveRange(idx);
    setSearchTerm("");
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
      {/* Cabeçalho */}
      <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8 space-y-1.5 sm:space-y-2">
        <span className="text-[11px] sm:text-xs font-bold text-primary-400 uppercase tracking-widest">
          VENDA ONLINE OFICIAL
        </span>
        <h1 className="text-2xl sm:text-4xl font-heading font-black text-foreground uppercase tracking-tight leading-tight">
          ESCOLHA SEUS NÚMEROS DA SORTE
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Toque nos números disponíveis para selecionar. A promoção é aplicada automaticamente.
        </p>
      </div>

      {/* Promoção + escolha rápida */}
      <div className="mb-5 sm:mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-primary-950/40 via-dark-850 to-primary-950/40 border border-primary-500/30 shadow-glow-primary">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary-500/20 text-primary-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs font-bold text-primary-400 uppercase tracking-wider">
                PROMOÇÃO AUTOMÁTICA
              </span>
              <p className="text-sm sm:text-base font-black text-foreground uppercase tracking-tight leading-snug">
                3 NÚMEROS POR <span className="text-emerald-400">R$ 63,00</span>
              </p>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Leve 2 por R$ 60 e o 3º sai por apenas R$ 3
              </p>
            </div>
          </div>

          {/* Escolha rápida — rolagem horizontal no celular, sem quebrar linha */}
          <div className="-mx-1 px-1 flex sm:flex-wrap items-center gap-2 overflow-x-auto hide-scrollbar sm:overflow-visible">
            <button
              onClick={() => selectRandomNumbers(1)}
              className="shrink-0 h-11 px-3.5 rounded-xl bg-dark-800 active:bg-dark-750 text-slate-300 text-xs font-bold uppercase tracking-wider border border-dark-700 active:scale-95 transition-transform no-tap-highlight"
            >
              +1 número
            </button>
            <button
              onClick={() => selectRandomNumbers(3)}
              className="shrink-0 h-11 px-3.5 rounded-xl bg-primary-500/20 active:bg-primary-500/30 text-primary-300 text-xs font-black uppercase tracking-wider border border-primary-500/40 active:scale-95 transition-transform no-tap-highlight"
            >
              +3 (R$ 63)
            </button>
            <button
              onClick={() => selectRandomNumbers(6)}
              className="shrink-0 h-11 px-3.5 rounded-xl bg-primary-500/20 active:bg-primary-500/30 text-primary-300 text-xs font-black uppercase tracking-wider border border-primary-500/40 active:scale-95 transition-transform no-tap-highlight"
            >
              +6 (R$ 126)
            </button>
          </div>
        </div>
      </div>

      {/* Barra de busca e filtros — gruda no topo ao rolar a grade */}
      <div
        className="sticky z-30 -mx-4 sm:mx-0 px-4 sm:px-0 py-3 sm:py-0 bg-background/95 backdrop-blur-md sm:bg-transparent sm:backdrop-blur-none border-b border-dark-800 sm:border-0 mb-4 sm:mb-6"
        style={{ top: "calc(var(--sat) + 3.5rem)" }}
      >
        <div className="sm:bg-dark-850 sm:p-4 sm:rounded-2xl sm:border sm:border-dark-750 space-y-3">
          <div className="flex items-center gap-2">
            {/* Busca */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                enterKeyHint="search"
                placeholder="Buscar número (ex: 3124)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value.replace(/\D/g, ""))}
                className="w-full h-11 pl-10 pr-10 bg-dark-900 border border-dark-700 rounded-xl text-base sm:text-sm text-foreground placeholder:text-slate-500 focus:outline-none focus:border-primary-500 font-mono"
                maxLength={4}
                aria-label="Buscar número"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  aria-label="Limpar busca"
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-slate-400 active:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={loadNumbers}
              disabled={loading}
              aria-label="Atualizar disponibilidade"
              className="w-11 h-11 shrink-0 flex items-center justify-center rounded-xl bg-dark-800 border border-dark-700 text-slate-300 active:scale-95 transition-transform no-tap-highlight"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Filtros por status */}
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar -mx-1 px-1">
            {(
              [
                { id: "ALL", label: "Todos", count: numbers.length },
                { id: "AVAILABLE", label: "Disponíveis", count: availableCount },
                { id: "SELECTED", label: "Selecionados", count: selectedNumbers.length },
              ] as Array<{ id: StatusFilter; label: string; count: number }>
            ).map((chip) => {
              const isActive = statusFilter === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => {
                    haptic("select");
                    setStatusFilter(chip.id);
                  }}
                  className={`shrink-0 h-9 px-3.5 rounded-full text-[11px] font-black uppercase tracking-wider border transition-colors active:scale-95 no-tap-highlight ${
                    isActive
                      ? "bg-primary-500 text-dark-900 border-primary-500"
                      : "bg-dark-850 text-slate-300 border-dark-700"
                  }`}
                >
                  {chip.label}
                  <span className={isActive ? "opacity-70" : "text-slate-500"}> · {chip.count}</span>
                </button>
              );
            })}

            {/* Legenda compacta, só onde há espaço */}
            <div className="hidden md:flex items-center gap-3 ml-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-primary-500 inline-block" /> Selecionado
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-500/30 border border-amber-500/50 inline-block" />{" "}
                Reservado
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-dark-950 border border-dark-800 inline-block" /> Vendido
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Abas de faixa (100 em 100) — só quando não há busca nem filtro de seleção */}
      {!isSearching && statusFilter !== "SELECTED" && ranges.length > 1 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Faixa de números
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary-400">
              {rangeAvailability.get(activeRange) ?? 0} livres nesta faixa
            </span>
          </div>

          <div className="snap-x-carousel gap-2 -mx-4 px-4 sm:mx-0 sm:px-0 pb-1">
            {ranges.map((r, idx) => {
              const isActive = idx === activeRange;
              const free = rangeAvailability.get(idx) ?? 0;
              return (
                <button
                  key={r.start}
                  onClick={() => goToRange(idx)}
                  className={`snap-item h-11 px-4 rounded-xl border text-xs font-black tracking-wide font-mono transition-colors active:scale-95 no-tap-highlight ${
                    isActive
                      ? "bg-primary-500 text-dark-900 border-primary-500 shadow-glow-primary"
                      : free === 0
                      ? "bg-dark-900 text-slate-600 border-dark-800"
                      : "bg-dark-850 text-slate-300 border-dark-700"
                  }`}
                >
                  {r.start}–{r.end}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Resultado direto da busca */}
      {searchDirectMatch && (
        <div className="mb-4 p-4 rounded-2xl bg-dark-850 border border-dark-750 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fade-in">
          <div>
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              Resultado da busca
            </span>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-xl font-mono font-black text-foreground">
                Nº {searchDirectMatch.number}
              </span>
              {searchDirectMatch.status === "AVAILABLE" ? (
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Disponível
                </span>
              ) : searchDirectMatch.status === "PAID" ? (
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-dark-800 border border-dark-700 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" />
                  Já vendido
                </span>
              ) : (
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Reservado
                </span>
              )}
            </div>
          </div>

          {searchDirectMatch.status === "AVAILABLE" && (
            <button
              onClick={() => toggleNumber(searchDirectMatch.number, "AVAILABLE")}
              className={`h-11 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 w-full sm:w-auto ${
                selectedNumbers.includes(searchDirectMatch.number)
                  ? "bg-red-500/20 text-red-300 border border-red-500/40"
                  : "bg-primary-500 text-dark-900 shadow-glow-primary"
              }`}
            >
              {selectedNumbers.includes(searchDirectMatch.number)
                ? "Remover"
                : "Selecionar número"}
            </button>
          )}
        </div>
      )}

      {/* Erro */}
      {errorMessage && (
        <div className="mb-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs sm:text-sm font-bold flex items-start gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          <span className="flex-1">{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} aria-label="Fechar aviso">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Grade */}
      <div ref={gridRef} className="scroll-mt-40">
        {loading ? (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 sm:gap-2.5">
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={i} className="h-14 sm:h-12 rounded-xl skeleton" />
            ))}
          </div>
        ) : visibleNumbers.length === 0 ? (
          <div className="p-10 text-center bg-dark-850 rounded-2xl border border-dark-750 text-slate-400 space-y-2">
            <Ticket className="w-8 h-8 mx-auto text-slate-500 mb-1" />
            <p className="font-heading font-black text-foreground uppercase text-sm">
              Nenhum número encontrado
            </p>
            <p className="text-xs text-slate-500">
              {statusFilter === "SELECTED"
                ? "Você ainda não selecionou nenhum número."
                : "Tente outra faixa ou limpe a busca."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 sm:gap-2.5">
            {visibleNumbers.map((item) => {
              const isSelected = selectedNumbers.includes(item.number);
              const isAvailable = item.status === "AVAILABLE";
              const isReserved = item.status === "RESERVED";

              return (
                <button
                  key={item.number}
                  disabled={!isAvailable && !isSelected}
                  onClick={() => toggleNumber(item.number, item.status)}
                  aria-pressed={isSelected}
                  aria-label={`Número ${item.number}${
                    isSelected ? ", selecionado" : isAvailable ? ", disponível" : ", indisponível"
                  }`}
                  className={`
                    relative h-14 sm:h-12 rounded-xl font-mono text-sm font-bold transition-all duration-150 flex items-center justify-center select-none no-tap-highlight
                    ${
                      isSelected
                        ? "bg-gradient-to-br from-primary-400 to-primary-600 text-dark-900 shadow-glow-primary scale-105 z-10 font-black"
                        : isAvailable
                        ? "bg-dark-850 text-foreground border border-dark-700/80 active:scale-95 active:border-primary-500/50 cursor-pointer"
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
      </div>

      {/* Navegação entre faixas ao final da grade */}
      {!isSearching && statusFilter !== "SELECTED" && ranges.length > 1 && !loading && (
        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            disabled={activeRange === 0}
            onClick={() => goToRange(activeRange - 1)}
            className="h-11 px-4 rounded-xl bg-dark-850 border border-dark-700 text-slate-300 text-xs font-bold uppercase tracking-wider disabled:opacity-30 active:scale-95 transition-transform"
          >
            Faixa anterior
          </button>
          <span className="text-[11px] font-mono text-slate-500">
            {activeRange + 1} / {ranges.length}
          </span>
          <button
            disabled={activeRange === ranges.length - 1}
            onClick={() => goToRange(activeRange + 1)}
            className="h-11 px-4 rounded-xl bg-dark-850 border border-dark-700 text-slate-300 text-xs font-bold uppercase tracking-wider disabled:opacity-30 active:scale-95 transition-transform"
          >
            Próxima faixa
          </button>
        </div>
      )}

      {/* Espaço para o carrinho não cobrir o fim da lista */}
      <div className={selectedNumbers.length > 0 ? "h-40" : "h-6"} />

      {/* ---- Carrinho flutuante (bottom sheet no celular) ---- */}
      {selectedNumbers.length > 0 && (
        <>
          {/* Fundo escurecido quando a folha está expandida */}
          {cartExpanded && (
            <button
              aria-label="Fechar resumo"
              onClick={() => setCartExpanded(false)}
              className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fade-in"
            />
          )}

          <div
            className="fixed bottom-0 inset-x-0 lg:bottom-4 lg:inset-x-4 lg:max-w-4xl lg:mx-auto z-50 bg-dark-900/97 backdrop-blur-md border-t-2 lg:border-2 border-primary-500/60 rounded-t-3xl lg:rounded-2xl shadow-2xl animate-sheet-up"
            style={{ paddingBottom: "var(--sab)" }}
          >
            {/* Alça / cabeçalho tocável para expandir o resumo */}
            <button
              onClick={() => {
                haptic("select");
                setCartExpanded((v) => !v);
              }}
              className="lg:hidden w-full pt-2.5 pb-1 flex flex-col items-center gap-2 no-tap-highlight"
              aria-expanded={cartExpanded}
              aria-label={cartExpanded ? "Recolher resumo" : "Expandir resumo"}
            >
              <span className="w-10 h-1.5 rounded-full bg-dark-700" />
            </button>

            <div className="p-4 pt-2 lg:pt-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              {/* Resumo da seleção */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-11 h-11 rounded-xl bg-primary-500 text-dark-900 flex items-center justify-center shrink-0">
                  <ShoppingCart className="w-5 h-5" />
                  <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-emerald-500 text-dark-900 text-[11px] font-black flex items-center justify-center border-2 border-dark-900">
                    {selectedNumbers.length}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block">
                    {selectedNumbers.length === 1
                      ? "1 número selecionado"
                      : `${selectedNumbers.length} números selecionados`}
                  </span>

                  {/* Prévia dos números escolhidos */}
                  <div className="flex items-center gap-1 mt-1 overflow-hidden">
                    {selectedNumbers.slice(0, 3).map((n) => (
                      <span
                        key={n}
                        className="px-1.5 py-0.5 rounded bg-dark-800 text-primary-400 border border-primary-500/30 text-[11px] font-mono font-bold shrink-0"
                      >
                        {n}
                      </span>
                    ))}
                    {selectedNumbers.length > 3 && (
                      <span className="text-[11px] text-slate-400 font-bold shrink-0">
                        +{selectedNumbers.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Valor + expandir (celular) */}
                <div className="text-right shrink-0 lg:hidden">
                  {pricing.discountAmount > 0 && (
                    <span className="block text-[10px] text-slate-500 line-through font-mono leading-none">
                      {formatCurrency(pricing.originalTotal)}
                    </span>
                  )}
                  <span className="text-xl font-heading font-black text-foreground leading-tight">
                    {formatCurrency(pricing.finalTotal)}
                  </span>
                  <button
                    onClick={() => setCartExpanded((v) => !v)}
                    className="flex items-center gap-0.5 ml-auto text-[10px] font-bold uppercase text-primary-400"
                  >
                    {cartExpanded ? "Menos" : "Detalhes"}
                    {cartExpanded ? (
                      <ChevronDown className="w-3 h-3" />
                    ) : (
                      <ChevronUp className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>

              {/* Bloco de preço + CTA (desktop) */}
              <div className="hidden lg:flex items-center gap-6 shrink-0">
                <div className="text-right">
                  {pricing.discountAmount > 0 && (
                    <div className="flex items-center justify-end gap-1.5 text-[11px]">
                      <span className="text-slate-500 line-through font-mono">
                        {formatCurrency(pricing.originalTotal)}
                      </span>
                      <span className="text-emerald-400 font-bold uppercase">
                        Economia: {formatCurrency(pricing.discountAmount)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-baseline justify-end gap-1.5">
                    <span className="text-xs text-slate-400 uppercase font-bold">Total:</span>
                    <span className="text-3xl font-heading font-black text-foreground">
                      {formatCurrency(pricing.finalTotal)}
                    </span>
                  </div>
                </div>

                <button
                  disabled={reserving}
                  onClick={handleProceedToCheckout}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 text-dark-900 font-black text-xs uppercase tracking-wider shadow-glow-primary active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {reserving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Reservando...</span>
                    </>
                  ) : (
                    <>
                      <span>Continuar</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Detalhes expandidos (celular) */}
            {cartExpanded && (
              <div className="lg:hidden px-4 pb-3 space-y-3 border-t border-dark-800 pt-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Seus números
                  </span>
                  <button
                    onClick={clearSelection}
                    className="text-[11px] text-red-400 flex items-center gap-1 font-bold uppercase h-8 px-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Limpar tudo
                  </button>
                </div>

                {/* Cada número pode ser removido individualmente */}
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto momentum-scroll">
                  {selectedNumbers.map((n) => (
                    <button
                      key={n}
                      onClick={() => toggleNumber(n, "AVAILABLE")}
                      className="h-9 pl-2.5 pr-1.5 rounded-lg bg-dark-800 text-primary-400 border border-primary-500/30 text-xs font-mono font-bold flex items-center gap-1 active:scale-95 transition-transform"
                      aria-label={`Remover número ${n}`}
                    >
                      {n}
                      <X className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                  ))}
                </div>

                <div className="space-y-1 text-xs pt-2 border-t border-dark-800">
                  <div className="flex justify-between text-slate-400">
                    <span className="uppercase font-semibold">
                      {selectedNumbers.length} × {formatCurrency(unitPrice)}
                    </span>
                    <span className="font-mono">{formatCurrency(pricing.originalTotal)}</span>
                  </div>
                  {pricing.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span className="uppercase">Desconto promoção</span>
                      <span className="font-mono">-{formatCurrency(pricing.discountAmount)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Dica de promoção + CTA principal (celular) */}
            <div className="lg:hidden px-4 pb-4 space-y-2">
              {pricing.remainderCount === 2 && (
                <button
                  onClick={() => selectRandomNumbers(1)}
                  className="w-full text-[11px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-3 py-2 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Adicione +1 número por só R$ 3,00</span>
                </button>
              )}

              <button
                disabled={reserving}
                onClick={handleProceedToCheckout}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 text-dark-900 font-black text-sm uppercase tracking-wider shadow-glow-primary active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {reserving ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Reservando...</span>
                  </>
                ) : (
                  <>
                    <span>Continuar · {formatCurrency(pricing.finalTotal)}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
