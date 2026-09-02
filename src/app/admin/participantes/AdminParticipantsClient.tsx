"use client";

import { useState, useMemo } from "react";
import { Search, User, Ticket, Phone, Mail, ChevronDown, ChevronUp, ShoppingBag } from "lucide-react";
import { formatCPF, maskCPF } from "@/lib/cpf";
import { formatCurrency } from "@/lib/pricing";

export default function AdminParticipantsClient({ initialParticipants }: { initialParticipants: any[] }) {
  const [participants] = useState(initialParticipants);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return participants;
    const search = searchTerm.toLowerCase();
    return participants.filter(
      (p) =>
        p.fullName.toLowerCase().includes(search) ||
        p.cpf.includes(search) ||
        p.whatsapp.includes(search) ||
        p.numbers.some((n: any) => n.number.toString().includes(search))
    );
  }, [participants, searchTerm]);

  return (
    <div className="space-y-4">
      
      {/* Search */}
      <div className="p-4 rounded-2xl bg-dark-850 border border-dark-750">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome, CPF ou número do bilhete..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-dark-900 border border-dark-700 rounded-xl text-xs text-foreground placeholder:text-slate-500 focus:outline-none focus:border-primary-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-dark-850 border border-dark-750 overflow-hidden shadow-premium-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-dark-900 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-dark-750">
              <tr>
                <th className="py-3 px-4">PARTICIPANTE</th>
                <th className="py-3 px-4">CPF</th>
                <th className="py-3 px-4">WHATSAPP</th>
                <th className="py-3 px-4">NÚMEROS</th>
                <th className="py-3 px-4">TOTAL GASTO</th>
                <th className="py-3 px-4">DATA CADASTRO</th>
                <th className="py-3 px-4 text-right">DETALHES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-750/60 font-mono">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-sans font-bold uppercase">
                    NENHUM PARTICIPANTE ENCONTRADO
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const isExpanded = expandedId === p.id;
                  const totalSpent = p.numbers.reduce((acc: number, n: any) => acc + (n.pricePaid || 30), 0);

                  return (
                    <tr key={p.id} className="hover:bg-dark-800/40 transition-colors">
                      <td className="py-3 px-4 font-sans font-bold text-foreground uppercase">
                        {p.fullName}
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-400">
                        {formatCPF(p.cpf)}
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-400">
                        {p.whatsapp || "—"}
                      </td>

                      <td className="py-3 px-4 font-sans font-bold text-primary-400 uppercase">
                        {p.numbers.length} {p.numbers.length === 1 ? "COTA" : "COTAS"}
                      </td>

                      <td className="py-3 px-4 font-bold text-emerald-400">
                        {formatCurrency(totalSpent)}
                      </td>

                      <td className="py-3 px-4 text-slate-400">
                        {new Date(p.createdAt).toLocaleDateString("pt-BR")}
                      </td>

                      <td className="py-3 px-4 text-right font-sans">
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : p.id)}
                          className="px-2.5 py-1 rounded bg-dark-800 hover:bg-dark-700 text-slate-300 font-bold uppercase text-[11px]"
                        >
                          {isExpanded ? "OCULTAR" : "VER COTAS"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
