"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { CART_VISIBILITY_EVENT } from "@/lib/uiEvents";

export default function WhatsAppButton({
  phone = "5548992178109",
  message = "Olá! Vim pelo site da ação entre amigos e gostaria de tirar uma dúvida.",
}: {
  phone?: string;
  message?: string;
}) {
  const pathname = usePathname();
  const [cartVisible, setCartVisible] = useState(false);

  // No mobile o botão flutua acima da barra inferior; quando o carrinho de
  // números aparece ele sai de cena para não disputar espaço com o CTA de compra.
  useEffect(() => {
    const onCart = (e: Event) => setCartVisible(!!(e as CustomEvent<boolean>).detail);
    window.addEventListener(CART_VISIBILITY_EVENT, onCart);
    return () => window.removeEventListener(CART_VISIBILITY_EVENT, onCart);
  }, []);

  useEffect(() => setCartVisible(false), [pathname]);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  const cleanPhone = phone.replace(/\D/g, "");
  const encodedMsg = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;

  const hasBottomNav = !pathname.startsWith("/checkout");

  return (
    <div
      className={`fixed right-4 lg:right-5 z-30 flex flex-col items-end group transition-all duration-300 ${
        cartVisible
          ? "opacity-0 translate-y-4 pointer-events-none lg:opacity-100 lg:translate-y-0 lg:pointer-events-auto"
          : "opacity-100 translate-y-0"
      }`}
      style={{
        bottom: hasBottomNav
          ? "calc(var(--bottomnav-h) + var(--sab) + 0.75rem)"
          : "calc(var(--sab) + 1.25rem)",
      }}
    >
      {/* Tooltip apenas onde existe cursor */}
      <div className="hidden lg:block mb-2 mr-1 px-3 py-1.5 bg-dark-800 text-foreground text-xs font-bold uppercase tracking-wider rounded-lg shadow-xl border border-dark-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        SUPORTE NO WHATSAPP
      </div>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar pelo WhatsApp"
        className="relative flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full shadow-2xl shadow-emerald-500/40 hover:scale-110 active:scale-95 transition-all duration-200 no-tap-highlight"
      >
        <MessageCircle className="w-6 h-6 lg:w-7 lg:h-7 fill-current" />

        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-600 border-2 border-dark-900" />
        </span>
      </a>
    </div>
  );
}
