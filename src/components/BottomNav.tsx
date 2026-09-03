"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Ticket, MapPin, UserCheck, Trophy } from "lucide-react";
import { CART_VISIBILITY_EVENT } from "@/lib/uiEvents";
import { haptic } from "@/lib/haptics";

const TABS = [
  { href: "/", label: "Início", icon: Home },
  { href: "/numeros", label: "Números", icon: Ticket, primary: true },
  { href: "/pontos-de-venda", label: "Pontos", icon: MapPin },
  { href: "/meus-numeros", label: "Meus", icon: UserCheck },
  { href: "/resultado", label: "Resultado", icon: Trophy },
];

/**
 * Barra de navegação inferior — só no mobile.
 * Coloca os 5 destinos principais dentro da zona do polegar, no padrão que o
 * usuário já conhece dos apps nativos, em vez de exigir abrir o menu hambúrguer.
 */
export default function BottomNav() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);

  // Some quando o carrinho flutuante da página de números está em cena
  useEffect(() => {
    const onCart = (e: Event) => setHidden(!!(e as CustomEvent<boolean>).detail);
    window.addEventListener(CART_VISIBILITY_EVENT, onCart);
    return () => window.removeEventListener(CART_VISIBILITY_EVENT, onCart);
  }, []);

  // Ao trocar de rota o carrinho deixa de existir
  useEffect(() => setHidden(false), [pathname]);

  if (pathname.startsWith("/admin") || pathname.startsWith("/checkout")) {
    return null;
  }

  return (
    <nav
      aria-label="Navegação principal"
      className={`lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-dark-750 bg-dark-900/95 backdrop-blur-lg transition-transform duration-300 ${
        hidden ? "translate-y-full" : "translate-y-0"
      }`}
      style={{ paddingBottom: "var(--sab)" }}
    >
      <ul className="flex items-stretch justify-around h-16">
        {TABS.map((tab) => {
          const isActive =
            tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                onClick={() => haptic("select")}
                aria-current={isActive ? "page" : undefined}
                className="relative h-full flex flex-col items-center justify-center gap-1 tap-target no-tap-highlight active:scale-95 transition-transform"
              >
                {/* Indicador da aba ativa */}
                <span
                  className={`absolute top-0 h-0.5 w-8 rounded-full transition-all duration-200 ${
                    isActive ? "bg-primary-500 opacity-100" : "opacity-0"
                  }`}
                />

                <Icon
                  className={`w-[22px] h-[22px] transition-colors ${
                    isActive
                      ? "text-primary-400"
                      : tab.primary
                      ? "text-primary-500/70"
                      : "text-slate-400"
                  }`}
                  strokeWidth={isActive ? 2.4 : 2}
                />

                <span
                  className={`text-[10px] font-bold uppercase tracking-wide leading-none ${
                    isActive ? "text-primary-400" : "text-slate-400"
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
