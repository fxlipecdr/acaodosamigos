"use client";

import { useState } from "react";
import { 
  ShoppingBag, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Store, 
  User, 
  Ticket, 
  DollarSign 
} from "lucide-react";
import { formatCPF, cleanCPF, validateCPF } from "@/lib/cpf";

interface Partner {
  id: string;
  name: string;
  neighborhood: string;
  commissionRate: number;
}

export default function PresentialSaleClient({
  partners,
  presencialStart,
  presencialEnd,
}: {
  partners: Partner[];
  presencialStart: number;
  presencialEnd: number;
}) {
  const [ticketNumber, setTicketNumber] = useState("");
  const [cpf, setCpf] = useState("");
  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [partnerId, setPartnerId] = useState(partners[0]?.id || "");
  const [price, setPrice] = useState("30.00");

  const [loading, setLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-lookup CPF
  const handleCpfChange = async (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 11);
    const formatted = formatCPF(raw);
    setCpf(formatted);

    if (raw.length === 11 && validateCPF(raw)) {
      try {
        setLookupLoading(true);
        const res = await fetch(`/api/admin/participant-lookup?cpf=${raw}`);
        const data = await res.json();
        if (data.success && data.found) {
          setFullName(data.participant.fullName);
          setWhatsapp(data.participant.whatsapp);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLookupLoading(false);
      }
    }
  };

  const handlePhoneChange = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 11);
    if (raw.length <= 10) {
      setWhatsapp(raw.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3"));
    } else {
      setWhatsapp(raw.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3"));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    const num = parseInt(ticketNumber, 10);
    if (isNaN(num) || num < 1000 || num > 3999) {
      setErrorMessage("Por favor, digite um número válido entre 1000 e 3999.");
      return;
    }

    const cleanCpfVal = cleanCPF(cpf);
    if (!validateCPF(cleanCpfVal)) {
      setErrorMessage("Por favor, informe um CPF válido para o comprador.");
      return;
    }

    if (!fullName.trim()) {
      setErrorMessage("O nome do comprador é obrigatório.");
      return;
    }

    const cleanPhoneVal = whatsapp.replace(/\D/g, "");
    if (cleanPhoneVal.length < 10) {
      setErrorMessage("Por favor, informe um telefone de contato válido.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/admin/presential-sale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketNumber: num,
          partnerId: partnerId || null,
          cpf: cleanCpfVal,
          fullName: fullName.trim(),
          whatsapp: cleanPhoneVal,
          pricePaid: parseFloat(price) || 30.0,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Erro ao registrar venda presencial.");
        return;
      }

      setSuccessMessage(`Número ${num} registrado e confirmado com sucesso para ${fullName.trim()}!`);
      setTicketNumber("");
      setCpf("");
      setFullName("");
      setWhatsapp("");
    } catch {
      setErrorMessage("Erro de conexão ao salvar venda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-primary-400 uppercase tracking-wider">
          LANÇAMENTO RÁPIDO DE CAIXA
        </span>
        <h1 className="text-2xl sm:text-3xl font-heading font-black text-foreground mt-0.5 uppercase tracking-tight">
          REGISTRAR VENDA FÍSICA / PRESENCIAL
        </h1>
        <p className="text-xs text-slate-400">
          Cadastre vendas de bilhetes físicos realizadas presencialmente ou por estabelecimentos parceiros credenciados.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-bold uppercase flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs sm:text-sm font-bold uppercase flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-2xl bg-dark-850 border border-dark-700 shadow-premium-card space-y-6">
        
        {/* Ticket & Partner row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Numero */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Ticket className="w-3.5 h-3.5 text-primary-400" />
              NÚMERO DO BILHETE <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              required
              min={1000}
              max={3999}
              placeholder="Ex: 1845"
              value={ticketNumber}
              onChange={(e) => setTicketNumber(e.target.value)}
              className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-xl text-lg font-mono font-black text-primary-400 placeholder:text-slate-600 focus:outline-none focus:border-primary-500"
            />
            <span className="text-[10px] text-slate-500 uppercase font-mono">FAIXA FÍSICA: {presencialStart} A {presencialEnd}</span>
          </div>

          {/* Parceiro */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-primary-400" />
              ESTABELECIMENTO PARCEIRO (PDV)
            </label>
            <select
              value={partnerId}
              onChange={(e) => setPartnerId(e.target.value)}
              className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-xl text-sm text-foreground focus:outline-none focus:border-primary-500 font-medium uppercase"
            >
              <option value="">VENDA DIRETA / SEM PARCEIRO</option>
              {partners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.neighborhood}) — COMISSÃO {p.commissionRate}%
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Participant row */}
        <div className="pt-4 border-t border-dark-750 grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* CPF */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span>CPF DO COMPRADOR <span className="text-red-400">*</span></span>
              {lookupLoading && <RefreshCw className="w-3 h-3 text-primary-400 animate-spin" />}
            </label>
            <input
              type="text"
              required
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => handleCpfChange(e.target.value)}
              className="w-full px-4 py-2.5 bg-dark-900 border border-dark-700 rounded-xl text-sm text-foreground placeholder:text-slate-600 focus:outline-none focus:border-primary-500 font-mono"
            />
          </div>

          {/* Nome */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-primary-400" />
              NOME COMPLETO <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Carlos Oliveira"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 bg-dark-900 border border-dark-700 rounded-xl text-sm text-foreground placeholder:text-slate-600 focus:outline-none focus:border-primary-500"
            />
          </div>

          {/* WhatsApp */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              WHATSAPP <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="(00) 00000-0000"
              value={whatsapp}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className="w-full px-4 py-2.5 bg-dark-900 border border-dark-700 rounded-xl text-sm text-foreground placeholder:text-slate-600 focus:outline-none focus:border-primary-500 font-mono"
            />
          </div>

        </div>

        {/* Price & Submit */}
        <div className="pt-4 border-t border-dark-750 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="w-full sm:w-48 space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              VALOR COBRADO (R$)
            </label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3.5 py-2 bg-dark-900 border border-dark-700 rounded-xl text-sm font-mono font-bold text-emerald-400 focus:outline-none focus:border-primary-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-dark-900 font-black text-xs uppercase tracking-wider shadow-glow-emerald active:scale-95 transition-all flex items-center justify-center gap-2 self-end"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>CONFIRMANDO VENDA...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>CONFIRMAR & EMITIR BILHETE</span>
              </>
            )}
          </button>

        </div>

      </form>

    </div>
  );
}
