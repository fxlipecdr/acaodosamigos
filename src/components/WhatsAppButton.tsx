"use client";

import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";

export default function WhatsAppButton({ 
  phone = "5548992178109", 
  message = "Olá! Vim pelo site da ação entre amigos e gostaria de tirar uma dúvida." 
}: { 
  phone?: string; 
  message?: string;
}) {
  const pathname = usePathname();

  // Don't show on admin panel
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const cleanPhone = phone.replace(/\D/g, "");
  const encodedMsg = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;

  return (
    <div className="fixed bottom-6 right-5 z-40 flex flex-col items-end group">
      {/* Tooltip on hover */}
      <div className="hidden sm:block mb-2 mr-1 px-3 py-1.5 bg-dark-800 text-foreground text-xs font-bold uppercase tracking-wider rounded-lg shadow-xl border border-dark-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        SUPORTE NO WHATSAPP
      </div>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar pelo WhatsApp"
        className="relative flex items-center justify-center w-14 h-14 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full shadow-2xl shadow-emerald-500/40 hover:scale-110 active:scale-95 transition-all duration-200"
      >
        <MessageCircle className="w-7 h-7 fill-current" />
        
        {/* Pulsing ring indicator */}
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-600 border-2 border-dark-900"></span>
        </span>
      </a>
    </div>
  );
}
