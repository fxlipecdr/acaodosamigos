"use client";

import { useState } from "react";
import { 
  Settings, 
  DollarSign, 
  Ticket, 
  MessageCircle, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck, 
  Sliders 
} from "lucide-react";

export default function AdminSettingsClient({ settings }: { settings: any }) {
  const [title, setTitle] = useState(settings?.title || "AÇÃO DOS AMIGOS");
  const [subtitle, setSubtitle] = useState(settings?.subtitle || "Concorra a uma motocicleta Honda CG 160 Start com apuração transparente pela Loteria Federal!");
  const [whatsappNumber, setWhatsappNumber] = useState(settings?.whatsappNumber || "+5548992178109");
  const [whatsappMessage, setWhatsappMessage] = useState(settings?.whatsappMessage || "Olá! Vim pelo site da Ação dos Amigos.");
  const [contactEmail, setContactEmail] = useState(settings?.contactEmail || "contato@acaoamigos.com.br");
  const [instagramUrl, setInstagramUrl] = useState(settings?.instagramUrl || "https://instagram.com/acaoamigos");

  // Pricing & Promos
  const [unitPrice, setUnitPrice] = useState(String(settings?.unitPrice || 30.0));
  const [promoBundleSize, setPromoBundleSize] = useState(String(settings?.promoBundleSize || 3));
  const [promoBundlePrice, setPromoBundlePrice] = useState(String(settings?.promoBundlePrice || 63.0));

  // Ranges
  const [startNumber, setStartNumber] = useState(String(settings?.startNumber || 1000));
  const [endNumber, setEndNumber] = useState(String(settings?.endNumber || 3999));
  const [presencialStart, setPresencialStart] = useState(String(settings?.presencialStart || 1000));
  const [presencialEnd, setPresencialEnd] = useState(String(settings?.presencialEnd || 2999));
  const [onlineStart, setOnlineStart] = useState(String(settings?.onlineStart || 3000));
  const [onlineEnd, setOnlineEnd] = useState(String(settings?.onlineEnd || 3999));
  const [minQuota, setMinQuota] = useState(String(settings?.minQuota || 1000));

  // Regulations
  const [rulesText, setRulesText] = useState(settings?.rulesText || "");

  // Gateway & Safety switch
  const [paymentsEnabled, setPaymentsEnabled] = useState(Boolean(settings?.paymentsEnabled));
  const [activeGateway, setActiveGateway] = useState(settings?.activeGateway || "MOCK_PIX");

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      setLoading(true);
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subtitle,
          whatsappNumber,
          whatsappMessage,
          contactEmail,
          instagramUrl,
          unitPrice,
          promoBundleSize,
          promoBundlePrice,
          startNumber,
          endNumber,
          presencialStart,
          presencialEnd,
          onlineStart,
          onlineEnd,
          minQuota,
          rulesText,
          paymentsEnabled,
          activeGateway,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Erro ao salvar configurações.");
        return;
      }

      setSuccessMessage("Configurações atualizadas com sucesso!");
    } catch {
      setErrorMessage("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* 1. CAMPANHA & IDENTIDADE */}
        <div className="p-6 sm:p-8 rounded-2xl bg-dark-850 border border-dark-750 space-y-4 shadow-premium-card">
          <h3 className="font-bold text-sm text-foreground uppercase tracking-wider border-b border-dark-750 pb-3 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-primary-400" />
            Identidade da Campanha
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1 sm:col-span-2">
              <label className="font-bold text-slate-300">Título Principal da Ação</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dark-900 border border-dark-700 rounded-xl text-foreground focus:outline-none focus:border-primary-500 font-bold"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="font-bold text-slate-300">Subtítulo / Chamada Secundária</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dark-900 border border-dark-700 rounded-xl text-foreground focus:outline-none focus:border-primary-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">WhatsApp Oficial de Suporte</label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dark-900 border border-dark-700 rounded-xl text-foreground focus:outline-none focus:border-primary-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Instagram da Ação (Opcional)</label>
              <input
                type="text"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dark-900 border border-dark-700 rounded-xl text-foreground focus:outline-none focus:border-primary-500"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="font-bold text-slate-300">Mensagem Padrão ao Clicar no WhatsApp</label>
              <input
                type="text"
                value={whatsappMessage}
                onChange={(e) => setWhatsappMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dark-900 border border-dark-700 rounded-xl text-foreground focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* 2. VALORES & PROMOÇÃO */}
        <div className="p-6 sm:p-8 rounded-2xl bg-dark-850 border border-dark-750 space-y-4 shadow-premium-card">
          <h3 className="font-bold text-sm text-foreground uppercase tracking-wider border-b border-dark-750 pb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Regras Comerciais & Promoção Online
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-300">Valor Unitário por Número (R$)</label>
              <input
                type="number"
                step="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dark-900 border border-dark-700 rounded-xl text-foreground focus:outline-none focus:border-primary-500 font-mono font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Quantidade do Pacote Promocional</label>
              <input
                type="number"
                value={promoBundleSize}
                onChange={(e) => setPromoBundleSize(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dark-900 border border-dark-700 rounded-xl text-foreground focus:outline-none focus:border-primary-500 font-mono font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Valor do Pacote Promocional (R$)</label>
              <input
                type="number"
                step="0.01"
                value={promoBundlePrice}
                onChange={(e) => setPromoBundlePrice(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dark-900 border border-dark-700 rounded-xl text-emerald-400 focus:outline-none focus:border-primary-500 font-mono font-bold"
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            * Padrão atual: Compre 2 por R$ 60 e leve o 3º por R$ 3 (Total do pacote de 3 números: R$ 63,00).
          </p>
        </div>

        {/* 3. FAIXAS DE NÚMEROS & META */}
        <div className="p-6 sm:p-8 rounded-2xl bg-dark-850 border border-dark-750 space-y-4 shadow-premium-card">
          <h3 className="font-bold text-sm text-foreground uppercase tracking-wider border-b border-dark-750 pb-3 flex items-center gap-2">
            <Ticket className="w-4 h-4 text-primary-400" />
            Faixas de Bilhetes & Meta de Vendas
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-300">Faixa Físico Início</label>
              <input
                type="number"
                value={presencialStart}
                onChange={(e) => setPresencialStart(e.target.value)}
                className="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-xl text-foreground font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Faixa Físico Fim</label>
              <input
                type="number"
                value={presencialEnd}
                onChange={(e) => setPresencialEnd(e.target.value)}
                className="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-xl text-foreground font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Faixa Online Início</label>
              <input
                type="number"
                value={onlineStart}
                onChange={(e) => setOnlineStart(e.target.value)}
                className="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-xl text-primary-400 font-mono font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Faixa Online Fim</label>
              <input
                type="number"
                value={onlineEnd}
                onChange={(e) => setOnlineEnd(e.target.value)}
                className="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-xl text-primary-400 font-mono font-bold"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="font-bold text-slate-300">Meta Mínima de Vendas para Realização</label>
              <input
                type="number"
                value={minQuota}
                onChange={(e) => setMinQuota(e.target.value)}
                className="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-xl text-amber-400 font-mono font-bold"
              />
            </div>
          </div>
        </div>

        {/* 4. REGULAMENTO COMPLETO */}
        <div className="p-6 sm:p-8 rounded-2xl bg-dark-850 border border-dark-750 space-y-4 shadow-premium-card">
          <h3 className="font-bold text-sm text-foreground uppercase tracking-wider border-b border-dark-750 pb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary-400" />
            Texto do Regulamento Oficial
          </h3>

          <div className="space-y-1 text-xs">
            <textarea
              rows={12}
              value={rulesText}
              onChange={(e) => setRulesText(e.target.value)}
              className="w-full p-4 bg-dark-900 border border-dark-700 rounded-xl text-slate-300 font-mono leading-relaxed focus:outline-none focus:border-primary-500"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3.5 rounded-xl bg-primary-500 hover:bg-primary-400 text-dark-900 font-black text-sm shadow-glow-primary active:scale-95 transition-all flex items-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>SALVANDO...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>SALVAR TODAS AS CONFIGURAÇÕES</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
