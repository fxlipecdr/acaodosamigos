"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, MessageCircle, FileText, Lock, HeartHandshake, Sparkles, ChevronRight } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="bg-dark-900 border-t border-dark-750 text-slate-400 text-sm mt-12 sm:mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
          
          {/* Col 1: About */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-primary-500/40 shadow-glow-primary shrink-0 bg-dark-950">
                <img src="/images/logo-acao.jpg" alt="Ação Entre Amigos" className="w-full h-full object-cover" />
              </div>
              <span className="font-heading font-black text-lg text-foreground tracking-tight uppercase">
                AÇÃO ENTRE AMIGOS
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Campanha promocional com prêmio de uma motocicleta Honda CG 160 Start. Apuração 100% transparente com base nos resultados oficiais da Loteria Federal.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg w-fit font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>TRANSPARÊNCIA E SEGURANÇA</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h3 className="font-heading font-black text-foreground text-xs uppercase tracking-widest border-b border-dark-800 pb-1.5">
              NAVEGAÇÃO RÁPIDA
            </h3>
            <ul className="space-y-0.5 text-xs">
              <li>
                <Link href="/numeros" className="hover:text-primary-400 transition-colors flex items-center gap-1.5 font-medium min-h-[40px] py-1">
                  <ChevronRight className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                  <span>ESCOLHER NÚMEROS ONLINE</span>
                </Link>
              </li>
              <li>
                <Link href="/pontos-de-venda" className="hover:text-primary-400 transition-colors flex items-center gap-1.5 font-medium min-h-[40px] py-1">
                  <ChevronRight className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                  <span>ONDE COMPRAR PRESENCIALMENTE</span>
                </Link>
              </li>
              <li>
                <Link href="/meus-numeros" className="hover:text-primary-400 transition-colors flex items-center gap-1.5 font-medium min-h-[40px] py-1">
                  <ChevronRight className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                  <span>CONSULTAR MEUS NÚMEROS (CPF)</span>
                </Link>
              </li>
              <li>
                <Link href="/regras" className="hover:text-primary-400 transition-colors flex items-center gap-1.5 font-medium min-h-[40px] py-1">
                  <ChevronRight className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                  <span>REGULAMENTO DA AÇÃO</span>
                </Link>
              </li>
              <li>
                <Link href="/resultado" className="hover:text-primary-400 transition-colors flex items-center gap-1.5 font-medium min-h-[40px] py-1">
                  <ChevronRight className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                  <span>RESULTADO OFICIAL DO SORTEIO</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal / Draw */}
          <div className="space-y-3">
            <h3 className="font-heading font-black text-foreground text-xs uppercase tracking-widest border-b border-dark-800 pb-1.5">
              APURAÇÃO AUDITÁVEL
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-primary-500 shrink-0 mt-0.5" />
                <span>Baseada na extração da <strong>Loteria Federal</strong></span>
              </li>
              <li className="flex items-start gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-primary-500 shrink-0 mt-0.5" />
                <span>4 últimos dígitos do prêmio extraído</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-primary-500 shrink-0 mt-0.5" />
                <span>Conferência sequencial do 1º ao 5º prêmio</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-primary-500 shrink-0 mt-0.5" />
                <span>Meta mínima: 1.000 números vendidos</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Support */}
          <div className="space-y-3">
            <h3 className="font-heading font-black text-foreground text-xs uppercase tracking-widest border-b border-dark-800 pb-1.5">
              SUPORTE & CONTATO
            </h3>
            <p className="text-xs text-slate-400">
              Dúvidas sobre reservas, comprovantes Pix ou pontos de venda?
            </p>
            <a
              href="https://wa.me/5548992178109?text=Olá!%20Gostaria%20de%20tirar%20uma%20dúvida%20sobre%20a%20Ação%20Entre%20Amigos."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-12 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider transition-colors active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>(48) 99217-8109</span>
            </a>
            <div className="pt-1 text-[11px] text-slate-500">
              Atendimento de segunda a sábado.
            </div>
          </div>

        </div>

        {/* Bottom Legal Disclaimer */}
        <div className="pt-6 sm:pt-8 border-t border-dark-800 text-center text-xs text-slate-400 space-y-2">
          <p className="max-w-3xl mx-auto leading-relaxed text-[11px]">
            <strong>AVISO LEGAL:</strong> Esta Ação Entre Amigos é de caráter privado e voluntário. A extração da Loteria Federal é utilizada estritamente como referencial público e independente para apuração do resultado. A Caixa Econômica Federal não patrocina nem administra esta ação.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400 pt-2 font-bold uppercase">
            <Link href="/termos" className="hover:text-foreground py-2 px-1">TERMOS DE PARTICIPAÇÃO</Link>
            <span>•</span>
            <Link href="/privacidade" className="hover:text-foreground py-2 px-1">POLÍTICA DE PRIVACIDADE</Link>
            <span>•</span>
            <Link href="/admin/login" className="hover:text-primary-400 py-2 px-1">ACESSO ADMINISTRATIVO</Link>
          </div>
          <p className="text-[10px] text-slate-400 pt-2 uppercase font-semibold">
            &copy; 2026 AÇÃO ENTRE AMIGOS. TODOS OS DIREITOS RESERVADOS.
          </p>
        </div>

      </div>
    </footer>
  );
}
