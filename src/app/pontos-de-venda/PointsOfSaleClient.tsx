"use client";

import { useState, useMemo } from "react";
import { 
  Store, 
  MapPin, 
  Phone, 
  Search, 
  ExternalLink, 
  MessageCircle, 
  CheckCircle2, 
  Navigation,
  Info,
  Award,
  Sparkles
} from "lucide-react";

interface PartnerItem {
  id: string;
  name: string;
  tradeName?: string | null;
  contactName?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  neighborhood: string;
  address?: string | null;
  number: string;
  complement?: string | null;
  cep: string;
  city: string;
  googleMapsUrl?: string | null;
  notes?: string | null;
  isActive: boolean;
}

export default function PointsOfSaleClient({
  initialPartners,
}: {
  initialPartners: PartnerItem[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>("ALL");

  // Extract unique neighborhoods for filter tabs
  const neighborhoods = useMemo(() => {
    const set = new Set<string>();
    initialPartners.forEach((p) => {
      if (p.neighborhood) set.add(p.neighborhood.trim());
    });
    return Array.from(set).sort();
  }, [initialPartners]);

  // Filter partners
  const filteredPartners = useMemo(() => {
    return initialPartners.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.tradeName && p.tradeName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        p.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.address && p.address.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchNeighborhood =
        selectedNeighborhood === "ALL" || p.neighborhood.trim() === selectedNeighborhood;

      return matchSearch && matchNeighborhood;
    });
  }, [initialPartners, searchTerm, selectedNeighborhood]);

  // Group partners by neighborhood for structured presentation
  const groupedPartners = useMemo(() => {
    const groups: { [key: string]: PartnerItem[] } = {};
    filteredPartners.forEach((partner) => {
      const b = partner.neighborhood.trim();
      if (!groups[b]) groups[b] = [];
      groups[b].push(partner);
    });
    return groups;
  }, [filteredPartners]);

  return (
    <div className="space-y-8">
      
      {/* Partner Incentive Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-dark-850 to-primary-950/30 border-2 border-emerald-500/40 shadow-glow-emerald flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-md">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              CAMPANHA DE INCENTIVO AOS PARCEIROS
            </span>
            <h3 className="text-base sm:text-lg font-heading font-black text-foreground uppercase tracking-tight mt-0.5">
              BONIFICAÇÃO DE R$ 500,00 PARA OS 4 PRIMEIROS PDVS
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Os 4 primeiros estabelecimentos comerciais parceiros a venderem 100 números ganham R$ 500,00 de bônus direto!
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-dark-850 p-4 sm:p-6 rounded-2xl border border-dark-750 space-y-4 shadow-premium-card">
        
        {/* Search Input */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Procure pelo nome do estabelecimento ou bairro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-dark-900 border border-dark-700 rounded-xl text-sm text-foreground placeholder:text-slate-500 focus:outline-none focus:border-primary-500"
          />
        </div>

        {/* Neighborhood Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
          <button
            onClick={() => setSelectedNeighborhood("ALL")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
              selectedNeighborhood === "ALL"
                ? "bg-primary-500 text-dark-900 shadow-glow-primary"
                : "bg-dark-900 text-slate-400 hover:text-foreground border border-dark-700"
            }`}
          >
            TODOS OS BAIRROS ({initialPartners.length})
          </button>

          {neighborhoods.map((bairro) => (
            <button
              key={bairro}
              onClick={() => setSelectedNeighborhood(bairro)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                selectedNeighborhood === bairro
                  ? "bg-primary-500 text-dark-900 shadow-glow-primary"
                  : "bg-dark-900 text-slate-400 hover:text-foreground border border-dark-700"
              }`}
            >
              {bairro}
            </button>
          ))}
        </div>

      </div>

      {/* Grouped Listing by Neighborhood */}
      {initialPartners.length === 0 ? (
        <div className="p-12 sm:p-16 text-center bg-dark-850 rounded-2xl border border-dark-750 text-slate-400 space-y-4 shadow-premium-card">
          <div className="w-16 h-16 rounded-2xl bg-primary-500/10 border border-primary-500/20 text-primary-400 flex items-center justify-center mx-auto">
            <Store className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-heading font-black text-lg text-foreground uppercase tracking-wider">CREDENCIAMENTO DE PONTOS FÍSICOS EM ANDAMENTO</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto mt-1">
              Os estabelecimentos parceiros presenciais estão sendo cadastrados pela organização. Você já pode garantir seus números diretamente pela nossa plataforma online com confirmação instantânea via Pix!
            </p>
          </div>
          <div className="pt-2">
            <a
              href="/numeros"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-400 text-dark-900 font-black text-xs uppercase tracking-wider shadow-glow-primary transition-all"
            >
              <span>ESCOLHER NÚMEROS ONLINE</span>
            </a>
          </div>
        </div>
      ) : Object.keys(groupedPartners).length === 0 ? (
        <div className="p-12 text-center bg-dark-850 rounded-2xl border border-dark-750 text-slate-400 space-y-2">
          <Store className="w-8 h-8 mx-auto text-slate-500 mb-2" />
          <p className="font-heading font-black text-foreground uppercase">NENHUM PONTO DE VENDA ENCONTRADO</p>
          <p className="text-xs text-slate-500">Tente buscar por outro termo ou limpe o filtro.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(groupedPartners).map(([neighborhood, partners]) => (
            <div key={neighborhood} className="space-y-4">
              
              {/* Section Bairro Header */}
              <div className="flex items-center gap-2.5 pb-2 border-b border-dark-750">
                <span className="w-3 h-3 rounded-full bg-primary-500 inline-block shadow-glow-primary" />
                <h2 className="text-xl font-heading font-black text-foreground uppercase tracking-tight">
                  BAIRRO {neighborhood}
                </h2>
                <span className="text-xs text-slate-500 font-bold uppercase">
                  ({partners.length} {partners.length === 1 ? "ESTABELECIMENTO" : "ESTABELECIMENTOS"})
                </span>
              </div>

              {/* Grid of Partners */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {partners.map((partner) => (
                  <div
                    key={partner.id}
                    className="p-5 rounded-2xl bg-dark-850 border border-dark-750 flex flex-col justify-between space-y-4 hover:border-dark-600 transition-all shadow-premium-card"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-heading font-black text-foreground text-sm uppercase tracking-wide line-clamp-1">{partner.name}</h3>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase shrink-0 border border-emerald-500/20">
                          PONTO ATIVO
                        </span>
                      </div>

                      {partner.tradeName && (
                        <p className="text-xs text-slate-500 uppercase">{partner.tradeName}</p>
                      )}

                      {/* Address info */}
                      <div className="p-3 rounded-xl bg-dark-900 border border-dark-800 text-xs text-slate-300 space-y-1">
                        <p className="flex items-start gap-1.5">
                          <MapPin className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" />
                          <span>
                            {partner.address ? `${partner.address}, Nº ${partner.number}` : `Nº ${partner.number}`}
                            {partner.complement ? ` - ${partner.complement}` : ""}
                          </span>
                        </p>
                        <p className="text-[11px] text-slate-400 pl-5 uppercase font-mono">
                          CEP: {partner.cep} {partner.city ? `• ${partner.city}` : ""}
                        </p>
                      </div>

                      {partner.notes && (
                        <p className="text-xs text-slate-400 flex items-start gap-1">
                          <Info className="w-3.5 h-3.5 text-primary-400 shrink-0 mt-0.5" />
                          <span>{partner.notes}</span>
                        </p>
                      )}
                    </div>

                    {/* Partner Actions */}
                    <div className="pt-3 border-t border-dark-800 flex items-center justify-between gap-2 text-xs">
                      {partner.whatsapp ? (
                        <a
                          href={`https://wa.me/55${partner.whatsapp.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-bold uppercase tracking-wider"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>WHATSAPP</span>
                        </a>
                      ) : partner.phone ? (
                        <span className="text-slate-400 flex items-center gap-1 font-mono">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          {partner.phone}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px] uppercase font-semibold">VENDA PRESENCIAL</span>
                      )}

                      {partner.googleMapsUrl ? (
                        <a
                          href={partner.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-750 text-slate-200 border border-dark-700 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                        >
                          <Navigation className="w-3.5 h-3.5 text-primary-400" />
                          <span>VER NO MAPA</span>
                        </a>
                      ) : (
                        <a
                          href={`https://maps.google.com/?q=${encodeURIComponent(`${partner.name}, ${partner.address || ""} ${partner.neighborhood} ${partner.city}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-750 text-slate-200 border border-dark-700 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                        >
                          <Navigation className="w-3.5 h-3.5 text-primary-400" />
                          <span>ABRIR MAPA</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
