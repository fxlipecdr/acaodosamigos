"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Sparkles,
  Ticket,
  MapPin,
  FileText,
  UserCheck,
  Trophy,
  MessageCircle,
  ChevronRight,
} from "lucide-react";
import { haptic } from "@/lib/haptics";

const navLinks: Array<{
  href: string;
  label: string;
  short?: string;
  icon: any;
  highlight?: boolean;
}> = [
  { href: "/", label: "INÍCIO", icon: Sparkles },
  { href: "/numeros", label: "ESCOLHER NÚMEROS", short: "NÚMEROS", icon: Ticket, highlight: true },
  { href: "/pontos-de-venda", label: "PONTOS DE VENDA", short: "PONTOS", icon: MapPin },
  { href: "/meus-numeros", label: "MEUS NÚMEROS", short: "MEUS NÚMEROS", icon: UserCheck },
  { href: "/regras", label: "REGRAS", icon: FileText },
  { href: "/resultado", label: "RESULTADO", icon: Trophy },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [hideOnScroll, setHideOnScroll] = useState(false);
  const lastScrollY = useRef(0);
  const pathname = usePathname();

  // Fecha o menu ao navegar
  useEffect(() => setIsOpen(false), [pathname]);

  // Trava a rolagem do fundo enquanto o drawer está aberto
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  // Esconde o cabeçalho ao descer e devolve ao subir — mais tela util no celular
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const goingDown = y > lastScrollY.current;
      setHideOnScroll(goingDown && y > 140);
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <header
        className={`sticky top-0 z-50 bg-dark-900/95 backdrop-blur-md border-b border-dark-750 shadow-md transition-transform duration-300 ${
          hideOnScroll && !isOpen ? "-translate-y-full lg:translate-y-0" : "translate-y-0"
        }`}
        style={{ paddingTop: "var(--sat)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* min-w-0 em toda a cadeia impede que o conteudo estoure a largura da tela */}
          <div className="flex items-center justify-between h-14 lg:h-20 gap-2 sm:gap-4 min-w-0">
            {/* 1. Marca */}
            <Link
              href="/"
              className="flex items-center gap-2 sm:gap-3 group min-w-0 flex-1 xl:flex-none no-tap-highlight"
            >
              <div className="relative w-9 h-9 lg:w-11 lg:h-11 rounded-full overflow-hidden border-2 border-primary-500/50 shadow-glow-primary group-hover:scale-105 transition-transform shrink-0 bg-dark-900">
                <img
                  src="/images/logo-acao.jpg"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>

              <span className="font-heading font-black text-[13px] sm:text-base xl:text-lg text-foreground tracking-tight uppercase leading-none truncate">
                AÇÃO ENTRE AMIGOS
              </span>
            </Link>

            {/* 2. Navegação desktop */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-2.5 xl:px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-1.5 leading-none shrink-0 ${
                      isActive
                        ? "text-primary-400 bg-primary-500/15 border border-primary-500/30 shadow-sm"
                        : link.highlight
                        ? "text-primary-300 hover:text-foreground hover:bg-dark-800"
                        : "text-slate-300 hover:text-foreground hover:bg-dark-800"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-primary-400 shrink-0" />
                    <span>{link.short ?? link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* 3. CTA desktop — só a partir de xl: entre 1024 e 1279px não há
                largura para marca + 6 links + botão, e o link em destaque
                "ESCOLHER NÚMEROS" já cobre a ação. */}
            <div className="hidden xl:flex items-center gap-3 shrink-0">
              <Link
                href="/numeros"
                className="px-3.5 xl:px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 text-dark-900 font-black text-[11px] xl:text-xs uppercase tracking-wider whitespace-nowrap shadow-glow-primary active:scale-95 transition-all flex items-center gap-1.5 leading-none shrink-0"
              >
                <Ticket className="w-4 h-4 shrink-0" />
                <span>COMPRAR NÚMEROS</span>
              </Link>
            </div>

            {/* 4. Ações mobile */}
            <div className="flex lg:hidden items-center gap-1.5 shrink-0">
              <Link
                href="/numeros"
                onClick={() => haptic("select")}
                className="h-10 px-3 rounded-xl bg-primary-500 active:bg-primary-600 text-dark-900 font-black text-[11px] uppercase tracking-wider whitespace-nowrap flex items-center gap-1.5 shadow-glow-primary active:scale-95 transition-all no-tap-highlight"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>COMPRAR</span>
              </Link>

              <button
                onClick={() => {
                  haptic("select");
                  setIsOpen((v) => !v);
                }}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-dark-800 text-slate-200 border border-dark-750 active:scale-95 transition-all no-tap-highlight"
                aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
                aria-expanded={isOpen}
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Drawer mobile em tela cheia — evita a lista comprimida do dropdown antigo */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] flex flex-col">
          <button
            aria-label="Fechar menu"
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
          />

          <div
            className="relative mt-auto bg-dark-900 border-t border-dark-750 rounded-t-3xl shadow-2xl animate-sheet-up max-h-[88vh] overflow-y-auto momentum-scroll"
            style={{ paddingBottom: "calc(var(--sab) + 1rem)" }}
          >
            {/* Alça da folha */}
            <div className="sticky top-0 bg-dark-900 pt-3 pb-2 flex justify-center">
              <span className="w-10 h-1.5 rounded-full bg-dark-700" />
            </div>

            <nav className="px-4 pb-2">
              <ul className="space-y-1.5">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  const Icon = link.icon;
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => {
                          haptic("select");
                          setIsOpen(false);
                        }}
                        className={`px-4 h-14 rounded-2xl text-sm font-black uppercase tracking-wider flex items-center gap-3 transition-colors active:scale-[0.98] no-tap-highlight ${
                          isActive
                            ? "text-primary-400 bg-primary-500/15 border border-primary-500/30"
                            : "text-slate-200 bg-dark-850 border border-dark-750"
                        }`}
                      >
                        <Icon className="w-5 h-5 text-primary-400 shrink-0" />
                        <span className="flex-1 truncate">{link.label}</span>
                        <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="px-4 pt-2 space-y-2.5">
              <Link
                href="/numeros"
                onClick={() => setIsOpen(false)}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 text-dark-900 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-glow-primary active:scale-[0.98] transition-transform"
              >
                <Ticket className="w-5 h-5" />
                <span>ESCOLHER MEUS NÚMEROS</span>
              </Link>

              <a
                href="https://wa.me/5548992178109"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Falar no WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
