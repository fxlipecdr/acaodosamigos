"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, ArrowRight, HelpCircle, Sparkles, ShieldCheck } from "lucide-react";

export default function LotteryVisualizer() {
  const [activeTab, setActiveTab] = useState<"exemplo" | "como-funciona">("exemplo");

  return (
    <div className="w-full bg-dark-850 rounded-2xl border border-dark-700 p-4 sm:p-8 shadow-premium-card">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 sm:pb-6 border-b border-dark-700/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>APURAÇÃO 100% AUDITÁVEL</span>
          </div>
          <h3 className="text-lg sm:text-2xl font-heading font-black text-foreground uppercase tracking-tight">
            COMO SERÁ DEFINIDO O GANHADOR?
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Mecânica transparente baseada no resultado oficial da <strong>Loteria Federal</strong>.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex w-full sm:w-auto bg-dark-900 p-1 rounded-xl border border-dark-750 self-stretch sm:self-auto">
          <button
            onClick={() => setActiveTab("exemplo")}
            className={`flex-1 sm:flex-none h-10 px-3 rounded-lg text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === "exemplo"
                ? "bg-primary-500 text-dark-900 shadow-sm"
                : "text-slate-400 hover:text-foreground"
            }`}
          >
            EXEMPLO PRÁTICO
          </button>
          <button
            onClick={() => setActiveTab("como-funciona")}
            className={`flex-1 sm:flex-none h-10 px-3 rounded-lg text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === "como-funciona"
                ? "bg-primary-500 text-dark-900 shadow-sm"
                : "text-slate-400 hover:text-foreground"
            }`}
          >
            REGRA DOS 4 DÍGITOS
          </button>
        </div>
      </div>

      {activeTab === "exemplo" ? (
        /* Exemplo Didático Sequencial (Seção 56) */
        <div className="pt-6 space-y-6">
          <div className="p-4 rounded-xl bg-dark-900/80 border border-dark-750 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <p>
              A verificação ocorre na <strong>ordem oficial dos prêmios (1º ao 5º)</strong>. O primeiro número extraído que corresponder a um bilhete vendido e pago será o grande contemplado!
            </p>
          </div>

          <div className="space-y-3">
            {/* 1º Prêmio */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-dark-900 border border-dark-750/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-dark-800 border border-dark-700 flex items-center justify-center font-bold text-xs text-slate-400">
                  1º
                </span>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">1º PRÊMIO DA LOTERIA FEDERAL (EXEMPLO)</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-lg font-mono font-bold text-slate-500 line-through">8</span>
                    <span className="text-lg font-mono font-black text-primary-400">1845</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1.5 rounded-lg w-fit font-bold uppercase tracking-wider">
                <XCircle className="w-3.5 h-3.5 shrink-0" />
                <span>NÚMERO 1845 NÃO FOI VENDIDO</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 ml-1 hidden sm:inline" />
              </div>
            </div>

            {/* 2º Prêmio */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-dark-900 border border-dark-750/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-dark-800 border border-dark-700 flex items-center justify-center font-bold text-xs text-slate-400">
                  2º
                </span>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">2º PRÊMIO DA LOTERIA FEDERAL (EXEMPLO)</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-lg font-mono font-bold text-slate-500 line-through">7</span>
                    <span className="text-lg font-mono font-black text-primary-400">3218</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1.5 rounded-lg w-fit font-bold uppercase tracking-wider">
                <XCircle className="w-3.5 h-3.5 shrink-0" />
                <span>NÚMERO 3218 NÃO FOI VENDIDO</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 ml-1 hidden sm:inline" />
              </div>
            </div>

            {/* 3º Prêmio - Ganhador */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-emerald-500/15 via-dark-900 to-dark-900 border-2 border-emerald-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 shadow-glow-emerald">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-emerald-500 text-dark-900 flex items-center justify-center font-black text-xs">
                  3º
                </span>
                <div>
                  <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">3º PRÊMIO DA LOTERIA FEDERAL (EXEMPLO)</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-lg font-mono font-bold text-slate-500 line-through">4</span>
                    <span className="text-xl font-mono font-black text-emerald-400 tracking-wider">3527</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start sm:items-center gap-1.5 text-[11px] sm:text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-2 rounded-lg font-bold w-fit uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
                <span>NÚMERO 3527 VENDIDO → GANHADOR CONTEMPLADO!</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-dark-900 border border-dark-800 text-[11px] text-slate-400 italic">
            * Exemplo meramente ilustrativo para demonstrar o funcionamento da apuração. A conferência real ocorrerá no dia do sorteio oficial.
          </div>
        </div>
      ) : (
        /* Explicação dos 4 Dígitos */
        <div className="pt-6 space-y-6">
          <div className="p-5 rounded-xl bg-dark-900 border border-dark-750">
            <h4 className="font-heading font-black text-xs uppercase tracking-wider text-foreground mb-2 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-primary-400" />
              POR QUE OS 4 ÚLTIMOS ALGARISMOS?
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Os prêmios da Loteria Federal são compostos por bilhetes de 5 dígitos (ex: <strong>83.247</strong>). Como nossa ação utiliza 3.000 números (faixa 1000 a 3999), <strong>o primeiro dígito é desconsiderado</strong> e utilizamos exatamente os 4 últimos dígitos:
            </p>

            <div className="mt-4 p-4 rounded-xl bg-dark-950 border border-dark-700/60 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-center">
              <div>
                <span className="text-[11px] text-slate-400 block uppercase font-semibold">BILHETE DA LOTERIA</span>
                <span className="text-2xl font-mono font-bold text-slate-500">8</span>
                <span className="text-2xl font-mono font-black text-primary-400">3247</span>
              </div>

              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-primary-500 rotate-90 sm:rotate-0" />

              <div>
                <span className="text-[11px] text-primary-400 block font-bold uppercase">NÚMERO APURADO</span>
                <span className="text-2xl font-mono font-black text-emerald-400">3247</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-dark-900/60 border border-dark-750 text-xs text-slate-300 space-y-2">
            <p className="font-bold text-foreground uppercase tracking-wider">
              E SE NENHUM DOS 5 PRÊMIOS FOR VENDIDO?
            </p>
            <p className="text-slate-400 leading-relaxed">
              Caso nenhum dos 5 prêmios extraídos corresponda a um número vendido e confirmado, o sorteio é automaticamente declarado <strong>pendente</strong> e a apuração é transferida para o concurso seguinte da Loteria Federal.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
