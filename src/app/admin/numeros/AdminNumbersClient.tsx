"use client";

import { useState, useMemo } from "react";
import { 
  Search, 
  Filter, 
  Lock, 
  Unlock, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Ban, 
  User, 
  Store,
  ChevronLeft,
  ChevronRight,
  Globe
} from "lucide-react";
import { formatCPF } from "@/lib/cpf";
import { formatCurrency } from "@/lib/pricing";

interface NumberData {
  id: string;
  number: number;
  status: string;
  origin: string;
  pricePaid: number | null;
  updatedAt: Date | string;
  participant?: {
    id: string;
    fullName: string;
    cpf: string;
    whatsapp: string;
  } | null;
  partner?: {
    id: string;
    name: string;
    neighborhood: string;
  } | null;
}

export default function AdminNumbersClient({
  initialNumbers,
  partners,
}: {
  initialNumbers: any[];
  partners: any[];
}) {
  const [numbers, setNumbers] = useState<NumberData[]>(initialNumbers);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [originFilter, setOriginFilter] = useState("ALL");
  const [partnerFilter, setPartnerFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const itemsPerPage = 50;

  // Filter logic
  const filtered = useMemo(() => {
    return numbers.filter((item) => {
      // Search
      const search = searchTerm.trim().toLowerCase();
      const matchSearch =
        !search ||
        item.number.toString().includes(search) ||
        (item.participant && item.participant.fullName.toLowerCase().includes(search)) ||
        (item.participant && item.participant.cpf.includes(search));

      // Status
      const matchStatus = statusFilter === "ALL" || item.status === statusFilter;

      // Origin
      const matchOrigin = originFilter === "ALL" || item.origin === originFilter;

      // Partner
      const matchPartner = partnerFilter === "ALL" || item.partner?.id === partnerFilter;

      return matchSearch && matchStatus && matchOrigin && matchPartner;
    });
  }, [numbers, searchTerm, statusFilter, originFilter, partnerFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginatedNumbers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  // Status Action (Block, Unblock, Release)
  const handleAction = async (number: number, action: "BLOCK" | "UNBLOCK" | "RELEASE") => {
    const current = numbers.find((n) => n.number === number);

    // Liberar um número pago tira o bilhete do comprador — pede confirmação.
    if (action === "RELEASE" && current?.status === "PAID") {
      const ok = confirm(
        `O número ${number} está PAGO${current.participant ? ` por ${current.participant.fullName}` : ""}.\n\nLiberar remove o bilhete desse comprador e o devolve à venda. Continuar?`
      );
      if (!ok) return;
    }
    if (action === "RELEASE" && current?.status === "PENDING_PAYMENT") {
      const ok = confirm(
        `O número ${number} tem um Pix gerado aguardando pagamento.\n\nSe o comprador pagar depois da liberação, o número pode acabar com dois donos. Continuar?`
      );
      if (!ok) return;
    }

    try {
      setActionLoading(number);
      const res = await fetch("/api/admin/numbers/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number, action }),
      });

      const data = await res.json();
      if (data.success) {
        // A rota devolve o registro atualizado em `data.number` (não existe
        // `newStatus`). Ao liberar/desbloquear, o comprador e o ponto de venda
        // também são desvinculados no banco, então a linha limpa os dois.
        const updated = data.number;
        const cleared = action === "RELEASE" || action === "UNBLOCK";
        setNumbers((prev) =>
          prev.map((n) =>
            n.number === number
              ? {
                  ...n,
                  status: updated.status,
                  pricePaid: updated.pricePaid,
                  updatedAt: updated.updatedAt,
                  participant: cleared ? null : n.participant,
                  partner: cleared ? null : n.partner,
                }
              : n
          )
        );
      } else {
        alert(data.error || "Erro ao executar ação.");
      }
    } catch {
      alert("Erro de conexão.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-primary-400 uppercase tracking-wider">
            CONTROLE DE COTAS
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-foreground mt-0.5 uppercase tracking-tight">
            GERENCIAMENTO DE NÚMEROS
          </h1>
          <p className="text-xs text-slate-400">
            Total de {numbers.length} números cadastrados na ação (1000 a 3999).
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 sm:p-6 rounded-2xl bg-dark-850 border border-dark-750 space-y-4 shadow-premium-card">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por número, nome ou CPF..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-3 py-2 bg-dark-900 border border-dark-700 rounded-xl text-foreground focus:outline-none focus:border-primary-500 font-medium"
            />
          </div>

          {/* Status filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-xl text-foreground focus:outline-none focus:border-primary-500 font-medium uppercase"
            >
              <option value="ALL">TODOS OS STATUS</option>
              <option value="AVAILABLE">DISPONÍVEL</option>
              <option value="PAID">PAGO (CONFIRMADO)</option>
              <option value="RESERVED">RESERVADO (NO CARRINHO)</option>
              <option value="PENDING_PAYMENT">AGUARDANDO PIX</option>
              <option value="BLOCKED">BLOQUEADO</option>
            </select>
          </div>

          {/* Origin filter */}
          <div>
            <select
              value={originFilter}
              onChange={(e) => { setOriginFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-xl text-foreground focus:outline-none focus:border-primary-500 font-medium uppercase"
            >
              <option value="ALL">TODAS AS ORIGENS</option>
              <option value="ONLINE">ONLINE (SITE)</option>
              <option value="PRESENTIAL">PRESENCIAL (PDV)</option>
            </select>
          </div>

          {/* Partner filter */}
          <div>
            <select
              value={partnerFilter}
              onChange={(e) => { setPartnerFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-xl text-foreground focus:outline-none focus:border-primary-500 font-medium uppercase"
            >
              <option value="ALL">TODOS OS PONTOS DE VENDA</option>
              {partners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.neighborhood})
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Counter Summary */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-dark-750 uppercase font-semibold">
          <span>ENCONTRADOS: <strong className="text-foreground">{filtered.length}</strong> NÚMEROS</span>
          <span>PÁGINA {currentPage} DE {totalPages}</span>
        </div>

      </div>

      {/* Numbers Table */}
      <div className="rounded-2xl bg-dark-850 border border-dark-750 overflow-hidden shadow-premium-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 font-mono">
            
            <thead className="bg-dark-900 border-b border-dark-750 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">NÚMERO</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4">ORIGEM</th>
                <th className="py-3 px-4">PARTICIPANTE</th>
                <th className="py-3 px-4">PDV / PARCEIRO</th>
                <th className="py-3 px-4">VALOR PAGO</th>
                <th className="py-3 px-4 text-right">AÇÕES</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-dark-800">
              {paginatedNumbers.map((item) => {
                const isPaid = item.status === "PAID";
                const isReserved = item.status === "RESERVED";
                const isBlocked = item.status === "BLOCKED";
                const isAvailable = item.status === "AVAILABLE";
                const isPendingPix = item.status === "PENDING_PAYMENT";

                return (
                  <tr key={item.number} className="hover:bg-dark-800/50 transition-colors">
                    
                    <td className="py-3 px-4">
                      <span className="font-bold text-sm text-primary-400">
                        {item.number}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-sans font-bold uppercase">
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3" /> PAGO
                        </span>
                      ) : isAvailable ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-dark-900 border border-dark-700 px-2 py-0.5 rounded">
                          DISPONÍVEL
                        </span>
                      ) : isPendingPix ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded">
                          <Clock className="w-3 h-3" /> AGUARDANDO PIX
                        </span>
                      ) : isReserved ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                          <Clock className="w-3 h-3" /> RESERVADO
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded">
                          <Ban className="w-3 h-3" /> BLOQUEADO
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-sans text-xs uppercase font-semibold">
                      {item.origin === "PRESENTIAL" ? (
                        <span className="text-slate-300 flex items-center gap-1">
                          <Store className="w-3.5 h-3.5 text-primary-400" />
                          PRESENCIAL
                        </span>
                      ) : (
                        <span className="text-primary-300 flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5 text-emerald-400" />
                          ONLINE
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-sans">
                      {item.participant ? (
                        <div>
                          <p className="font-bold text-foreground text-xs uppercase">{item.participant.fullName}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{formatCPF(item.participant.cpf)}</p>
                        </div>
                      ) : (
                        <span className="text-slate-600 text-[11px]">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-sans text-xs uppercase">
                      {item.partner ? (
                        <span className="text-slate-300 font-semibold">{item.partner.name}</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-bold text-foreground">
                      {item.pricePaid ? formatCurrency(item.pricePaid) : "—"}
                    </td>

                    <td className="py-3 px-4 text-right space-x-1 font-sans uppercase">
                      {isBlocked ? (
                        <button
                          onClick={() => handleAction(item.number, "UNBLOCK")}
                          disabled={actionLoading === item.number}
                          className="px-2.5 py-1 rounded bg-dark-800 hover:bg-dark-700 text-primary-400 text-xs font-bold"
                          title="Desbloquear número"
                        >
                          DESBLOQUEAR
                        </button>
                      ) : isAvailable ? (
                        <button
                          onClick={() => handleAction(item.number, "BLOCK")}
                          disabled={actionLoading === item.number}
                          className="px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold"
                          title="Bloquear número"
                        >
                          BLOQUEAR
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAction(item.number, "RELEASE")}
                          disabled={actionLoading === item.number}
                          className="px-2.5 py-1 rounded bg-dark-800 hover:bg-dark-700 text-slate-400 hover:text-red-300 text-xs font-bold"
                          title="Liberar número de volta para Disponível"
                        >
                          LIBERAR
                        </button>
                      )}
                    </td>

                  </tr>
                );
              })}
            </tbody>

          </table>
        </div>

        {/* Pagination bar */}
        <div className="p-4 bg-dark-900 border-t border-dark-750 flex items-center justify-between text-xs">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-750 text-slate-300 font-bold uppercase disabled:opacity-40 flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>ANTERIOR</span>
          </button>

          <span className="text-slate-400 uppercase font-semibold">
            PÁGINA <strong className="text-foreground">{currentPage}</strong> DE <strong className="text-foreground">{totalPages}</strong>
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-750 text-slate-300 font-bold uppercase disabled:opacity-40 flex items-center gap-1"
          >
            <span>PRÓXIMA</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}
