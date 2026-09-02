"use client";

import { useState } from "react";
import { 
  Store, 
  Plus, 
  MapPin, 
  Percent, 
  DollarSign, 
  Edit2, 
  Check, 
  X, 
  Phone, 
  MessageCircle, 
  ExternalLink,
  RefreshCw,
  Power
} from "lucide-react";
import { formatCurrency } from "@/lib/pricing";

export default function AdminPartnersClient({ initialPartners }: { initialPartners: any[] }) {
  const [partners, setPartners] = useState(initialPartners);
  const [showModal, setShowModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [tradeName, setTradeName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [address, setAddress] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [cep, setCep] = useState("");
  const [city, setCity] = useState("");
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const [commissionRate, setCommissionRate] = useState("30.0");
  const [notes, setNotes] = useState("");
  const [isActive, setIsActive] = useState(true);

  const openAddModal = () => {
    setEditingPartner(null);
    setName("");
    setTradeName("");
    setContactName("");
    setPhone("");
    setWhatsapp("");
    setNeighborhood("");
    setAddress("");
    setNumber("");
    setComplement("");
    setCep("");
    setCity("");
    setGoogleMapsUrl("");
    setCommissionRate("30.0");
    setNotes("");
    setIsActive(true);
    setShowModal(true);
  };

  const openEditModal = (p: any) => {
    setEditingPartner(p);
    setName(p.name);
    setTradeName(p.tradeName || "");
    setContactName(p.contactName || "");
    setPhone(p.phone || "");
    setWhatsapp(p.whatsapp || "");
    setNeighborhood(p.neighborhood);
    setAddress(p.address || "");
    setNumber(p.number);
    setComplement(p.complement || "");
    setCep(p.cep);
    setCity(p.city || "");
    setGoogleMapsUrl(p.googleMapsUrl || "");
    setCommissionRate(String(p.commissionRate));
    setNotes(p.notes || "");
    setIsActive(p.isActive);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const url = editingPartner ? `/api/admin/partners/${editingPartner.id}` : "/api/admin/partners";
      const method = editingPartner ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          tradeName,
          contactName,
          phone,
          whatsapp,
          neighborhood,
          address,
          number,
          complement,
          cep,
          city,
          googleMapsUrl,
          commissionRate: Number(commissionRate),
          notes,
          isActive,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (editingPartner) {
          setPartners((prev) =>
            prev.map((p) => (p.id === editingPartner.id ? { ...p, ...data.partner } : p))
          );
        } else {
          setPartners((prev) => [{ ...data.partner, numbers: [] }, ...prev]);
        }
        setShowModal(false);
      } else {
        alert(data.error || "Erro ao salvar parceiro.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (partner: any) => {
    try {
      const res = await fetch(`/api/admin/partners/${partner.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !partner.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        setPartners((prev) =>
          prev.map((p) => (p.id === partner.id ? { ...p, isActive: !p.isActive } : p))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Action Button */}
      <div className="flex justify-end">
        <button
          onClick={openAddModal}
          className="px-5 py-3 rounded-xl bg-primary-500 hover:bg-primary-400 text-dark-900 font-black text-xs shadow-glow-primary flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ ADICIONAR PONTO DE VENDA</span>
        </button>
      </div>

      {/* Partners Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {partners.map((partner) => {
          const ticketsCount = partner.numbers?.length || 0;
          const grossSales = ticketsCount * 30.0;
          const commissionAmount = (grossSales * partner.commissionRate) / 100;

          return (
            <div
              key={partner.id}
              className={`p-6 rounded-2xl bg-dark-850 border transition-all flex flex-col justify-between space-y-4 shadow-premium-card ${
                partner.isActive ? "border-dark-700 hover:border-dark-600" : "border-red-500/30 opacity-60"
              }`}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-primary-500/10 text-primary-400 text-[10px] font-bold">
                      Bairro {partner.neighborhood}
                    </span>
                    <h3 className="font-bold text-foreground text-base mt-1 line-clamp-1">
                      {partner.name}
                    </h3>
                  </div>

                  <button
                    onClick={() => toggleActive(partner)}
                    className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                      partner.isActive
                        ? "bg-emerald-500/10 text-emerald-400 hover:bg-red-500/20 hover:text-red-400"
                        : "bg-red-500/10 text-red-400 hover:bg-emerald-500/20 hover:text-emerald-400"
                    }`}
                    title={partner.isActive ? "Desativar parceiro" : "Ativar parceiro"}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                </div>

                {/* Address info */}
                <div className="p-3 rounded-xl bg-dark-900 border border-dark-800 text-xs text-slate-300 space-y-1">
                  <p className="flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-primary-400 shrink-0 mt-0.5" />
                    <span>{partner.address ? `${partner.address}, Nº ${partner.number}` : `Nº ${partner.number}`}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 pl-4">CEP: {partner.cep} • {partner.city}</p>
                </div>

                {/* Performance Box */}
                <div className="p-3.5 rounded-xl bg-dark-950 border border-dark-800 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">VENDIDOS</span>
                    <strong className="text-foreground font-mono text-sm">{ticketsCount} BILHETES</strong>
                    <span className="text-[10px] text-slate-400 block">{formatCurrency(grossSales)}</span>
                  </div>

                  <div className="text-right border-l border-dark-800 pl-2">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">COMISSÃO ({partner.commissionRate}%)</span>
                    <strong className="text-emerald-400 font-mono text-sm">{formatCurrency(commissionAmount)}</strong>
                    <span className="text-[10px] text-slate-500 block uppercase">ESTIMADA</span>
                  </div>
                </div>

                {/* Meta de Bonificação R$ 500 (100 vendas) */}
                <div className="p-2.5 rounded-xl bg-dark-900 border border-dark-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-bold uppercase">BÔNUS R$ 500 (100 VENDAS):</span>
                    <span className={ticketsCount >= 100 ? "text-emerald-400 font-black" : "text-primary-400 font-bold font-mono"}>
                      {ticketsCount >= 100 ? "QUALIFICADO" : `${ticketsCount} / 100`}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-dark-950 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-emerald-400 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(ticketsCount > 0 ? 5 : 0, (ticketsCount / 100) * 100))}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-3 border-t border-dark-750 flex items-center justify-between">
                <button
                  onClick={() => openEditModal(partner)}
                  className="px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-750 text-slate-300 hover:text-foreground text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Editar Informações</span>
                </button>

                {partner.googleMapsUrl && (
                  <a
                    href={partner.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary-400 hover:underline flex items-center gap-1"
                  >
                    <span>Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-dark-850 border border-dark-700 rounded-2xl w-full max-w-xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 my-8">
            
            <div className="flex items-center justify-between border-b border-dark-750 pb-4">
              <h3 className="font-heading font-black text-lg text-foreground">
                {editingPartner ? "Editar Ponto de Venda" : "+ Adicionar Ponto de Venda"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-300">Nome do Estabelecimento *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Nome do Ponto de Venda"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-dark-900 border border-dark-700 rounded-xl text-foreground focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Bairro *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Centro"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-dark-900 border border-dark-700 rounded-xl text-foreground focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">CEP *</label>
                  <input
                    type="text"
                    required
                    placeholder="88701-000"
                    value={cep}
                    onChange={(e) => setCep(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-dark-900 border border-dark-700 rounded-xl text-foreground focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-300">Rua / Endereço</label>
                  <input
                    type="text"
                    placeholder="Ex: Av. Marcolino Martins Cabral"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-dark-900 border border-dark-700 rounded-xl text-foreground focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Número *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 1250"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-dark-900 border border-dark-700 rounded-xl text-foreground focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Comissão (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="30.0"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-dark-900 border border-dark-700 rounded-xl text-foreground focus:outline-none focus:border-primary-500 font-mono"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-300">Link Google Maps (Opcional)</label>
                  <input
                    type="url"
                    placeholder="https://maps.google.com/?q=..."
                    value={googleMapsUrl}
                    onChange={(e) => setGoogleMapsUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-dark-900 border border-dark-700 rounded-xl text-foreground focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-dark-750">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-dark-800 text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-400 text-dark-900 font-black shadow-glow-primary"
                >
                  {loading ? "SALVANDO..." : "SALVAR PONTO DE VENDA"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
