"use client";

import { useState } from "react";
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
  Trophy 
} from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Don't show public navbar in /admin routes
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const navLinks = [
    { href: "/", label: "INÍCIO", icon: Sparkles },
    { href: "/numeros", label: "ESCOLHER NÚMEROS", icon: Ticket, highlight: true },
    { href: "/pontos-de-venda", label: "PONTOS DE VENDA", icon: MapPin },
    { href: "/meus-numeros", label: "MEUS NÚMEROS", icon: UserCheck },
    { href: "/regras", label: "REGRAS", icon: FileText },
    { href: "/resultado", label: "RESULTADO", icon: Trophy },
  ];

  return (
    <header className="sticky top-0 z-50 bg-dark-900/98 backdrop-blur-md border-b border-dark-750 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* 1. Brand Logo & Title */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-primary-500/50 shadow-glow-primary group-hover:scale-105 transition-transform shrink-0 bg-dark-950 flex items-center justify-center">
              <img
                src="/images/logo-acao.jpg"
                alt="Ação Entre Amigos"
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex flex-col justify-center">
              <span className="font-heading font-black text-sm sm:text-base xl:text-lg text-foreground tracking-tight uppercase leading-none">
                AÇÃO ENTRE AMIGOS
              </span>
            </div>
          </Link>

          {/* 2. Desktop Navigation Links (Visible on desktop with proper spacing and zero overlap) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-2.5 xl:px-3.5 py-2 rounded-xl text-[11px] xl:text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-1.5 leading-none shrink-0 ${
                    isActive
                      ? "text-primary-400 bg-primary-500/15 border border-primary-500/30 shadow-sm"
                      : link.highlight
                      ? "text-primary-300 hover:text-foreground hover:bg-dark-800"
                      : "text-slate-300 hover:text-foreground hover:bg-dark-800"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-primary-400 shrink-0" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* 3. Right Action CTA Button (Desktop) */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <Link
              href="/numeros"
              className="px-3.5 xl:px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 text-dark-900 font-black text-[11px] xl:text-xs uppercase tracking-wider whitespace-nowrap shadow-glow-primary active:scale-95 transition-all flex items-center gap-1.5 leading-none shrink-0"
            >
              <Ticket className="w-4 h-4 shrink-0" />
              <span>COMPRAR NÚMEROS</span>
            </Link>
          </div>

          {/* 4. Mobile / Tablet Menu & CTA (Visible on screens < lg) */}
          <div className="flex lg:hidden items-center gap-2 shrink-0">
            <Link
              href="/numeros"
              className="px-3 py-2 rounded-xl bg-primary-500 hover:bg-primary-400 text-dark-900 font-black text-xs uppercase tracking-wider whitespace-nowrap flex items-center gap-1 shadow-glow-primary transition-all leading-none shrink-0"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>COMPRAR</span>
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl bg-dark-800 text-slate-300 hover:text-foreground border border-dark-750 focus:outline-none transition-colors shrink-0"
              aria-label="Abrir Menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Dropdown Navigation */}
      {isOpen && (
        <div className="lg:hidden bg-dark-900 border-b border-dark-750 px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-200 shadow-2xl">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-3 transition-colors ${
                    isActive
                      ? "text-primary-400 bg-primary-500/15 border border-primary-500/30"
                      : "text-slate-200 hover:bg-dark-800 hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4 text-primary-400 shrink-0" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-2">
            <Link
              href="/numeros"
              onClick={() => setIsOpen(false)}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 text-dark-900 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-glow-primary"
            >
              <Ticket className="w-4 h-4" />
              <span>ESCOLHER MEUS NÚMEROS</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
