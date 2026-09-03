"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { haptic } from "@/lib/haptics";

/**
 * Bloco de texto longo que começa recolhido no celular.
 * Evita que o leitor role milhares de pixels de regulamento para chegar
 * ao que vem depois, sem esconder nada de quem quiser ler tudo.
 */
export default function ExpandableText({
  children,
  collapsedHeight = 340,
  labelExpand = "Ler regulamento completo",
  labelCollapse = "Recolher texto",
}: {
  children: React.ReactNode;
  collapsedHeight?: number;
  labelExpand?: string;
  labelCollapse?: string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <div
        className="relative overflow-hidden transition-[max-height] duration-300"
        style={{ maxHeight: expanded ? "none" : collapsedHeight }}
        aria-hidden={false}
      >
        {children}

        {/* Esmaecimento indicando que há mais conteúdo */}
        {!expanded && (
          <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-dark-850 to-transparent pointer-events-none" />
        )}
      </div>

      <button
        onClick={() => {
          haptic("select");
          setExpanded((v) => !v);
        }}
        aria-expanded={expanded}
        className="mt-3 w-full h-12 rounded-xl bg-dark-900 border border-dark-700 text-primary-400 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform no-tap-highlight"
      >
        <span>{expanded ? labelCollapse : labelExpand}</span>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
    </div>
  );
}
