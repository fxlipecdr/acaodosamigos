"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { 
  QrCode as QrIcon, 
  Download, 
  Printer, 
  Sparkles, 
  ExternalLink, 
  Store, 
  Globe 
} from "lucide-react";

export default function AdminQrCodeClient({
  partners,
  settings,
}: {
  partners: any[];
  settings: any;
}) {
  const [selectedTarget, setSelectedTarget] = useState<string>("MAIN");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [targetUrl, setTargetUrl] = useState<string>("");

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://acaoamigos.com.br";

  useEffect(() => {
    let url = baseUrl;
    if (selectedTarget !== "MAIN") {
      url = `${baseUrl}/?ref=${selectedTarget}`;
    }
    setTargetUrl(url);

    QRCode.toDataURL(url, {
      width: 500,
      margin: 2,
      color: {
        dark: "#090D16",
        light: "#FFFFFF",
      },
    })
      .then((data) => setQrDataUrl(data))
      .catch((err) => console.error(err));
  }, [selectedTarget, baseUrl]);

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `qrcode-${selectedTarget.toLowerCase()}.png`;
    link.click();
  };

  const handlePrintFlyer = () => {
    window.print();
  };

  const selectedPartnerObj = partners.find((p) => p.slug === selectedTarget);

  return (
    <div className="space-y-8">
      
      {/* Controls Bar */}
      <div className="p-6 rounded-2xl bg-dark-850 border border-dark-750 space-y-4 shadow-premium-card print:hidden">
        <h3 className="font-heading font-black text-xs text-foreground uppercase tracking-wider">
          SELECIONE O DESTINO DO QR CODE:
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold uppercase tracking-wider text-slate-300">TIPO DE MATERIAL / DESTINO</label>
            <select
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-dark-900 border border-dark-700 rounded-xl text-foreground focus:outline-none focus:border-primary-500 font-medium uppercase"
            >
              <option value="MAIN">CAMPANHA GERAL (PÁGINA INICIAL PRINCIPAL)</option>
              {partners.length > 0 && (
                <optgroup label="PONTOS DE VENDA / PARCEIROS (COM RASTREAMENTO ?REF=)">
                  {partners.map((p) => (
                    <option key={p.id} value={p.slug}>
                      {p.name} ({p.neighborhood})
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold uppercase tracking-wider text-slate-300">LINK DE DESTINO GERADO</label>
            <input
              type="text"
              readOnly
              value={targetUrl}
              className="w-full px-3.5 py-2.5 bg-dark-900 border border-dark-750 rounded-xl text-slate-300 font-mono text-xs focus:outline-none truncate"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          <button
            onClick={handleDownload}
            className="px-4 py-2.5 rounded-xl bg-dark-800 hover:bg-dark-750 text-slate-200 border border-dark-700 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-primary-400" />
            <span>BAIXAR PNG EM ALTA RESOLUÇÃO</span>
          </button>

          <button
            onClick={handlePrintFlyer}
            className="px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-400 text-dark-900 font-black text-xs uppercase tracking-wider shadow-glow-primary flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>IMPRIMIR CARTAZ PRONTO</span>
          </button>
        </div>
      </div>

      {/* Print-Ready Cartaz Preview */}
      <div className="max-w-md mx-auto p-8 rounded-3xl bg-white text-dark-900 border-4 border-primary-500 shadow-2xl text-center space-y-6 print:border-none print:shadow-none print:m-0 print:p-4">
        
        {/* Top Flyer Header */}
        <div className="space-y-2">
          <div className="inline-block px-3 py-1 bg-dark-900 text-primary-400 text-xs font-black uppercase rounded-full tracking-wider">
            AÇÃO DOS AMIGOS OFICIAL
          </div>
          <h2 className="text-3xl font-heading font-black tracking-tight leading-tight text-dark-900 uppercase">
            CONCORRA A ESTA <br />
            <span className="text-amber-600 uppercase">HONDA CG 160 START</span>
          </h2>
          <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">
            APURAÇÃO PELA LOTERIA FEDERAL
          </p>
        </div>

        {/* Price Tag */}
        <div className="p-3 rounded-2xl bg-amber-50 border-2 border-amber-400">
          <p className="text-xs font-bold text-gray-700 uppercase">APENAS</p>
          <p className="text-3xl font-black text-dark-900 font-mono">
            R$ 30,00 <span className="text-xs font-normal text-gray-600 uppercase">POR NÚMERO</span>
          </p>
          <p className="text-xs font-black text-emerald-700 mt-1 uppercase tracking-wider">
            PROMOÇÃO: 3 NÚMEROS POR R$ 63 NO SITE!
          </p>
        </div>

        {/* QR Code Graphic Frame */}
        <div className="p-4 bg-gray-50 rounded-2xl border-2 border-gray-200 inline-block">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="QR Code" className="w-56 h-56 mx-auto object-contain" />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-xs text-gray-400 uppercase font-bold">GERANDO...</div>
          )}
          <p className="text-[11px] font-black text-gray-700 mt-2 uppercase tracking-wide">
            APONTE A CÂMERA DO SEU CELULAR PARA COMPRAR
          </p>
        </div>

        {/* Partner footer note if referral */}
        {selectedPartnerObj ? (
          <div className="pt-2 border-t border-gray-200 text-xs uppercase font-semibold">
            <span className="text-gray-500 block">PONTO DE VENDA OFICIAL:</span>
            <strong className="text-dark-900 font-black text-sm block">{selectedPartnerObj.name}</strong>
            <span className="text-gray-500">{selectedPartnerObj.neighborhood} {selectedPartnerObj.city ? `• ${selectedPartnerObj.city}` : ""}</span>
          </div>
        ) : (
          <div className="pt-2 border-t border-gray-200 text-xs text-gray-600 uppercase font-semibold">
            <p className="font-bold">SORTEIO PREVISTO: 15/11/2026</p>
            <p className="text-[11px] text-gray-500">SUPORTE WHATSAPP: +55 (48) 99217-8109</p>
          </div>
        )}

      </div>

    </div>
  );
}
