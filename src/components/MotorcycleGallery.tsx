"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, CheckCircle2, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { haptic } from "@/lib/haptics";

interface MotorcycleGalleryProps {
  coverImage: string;
  images: Array<{ url: string; title: string }>;
  model: string;
  year: string;
  color: string;
  condition: string;
  details?: string | null;
  videoUrl?: string | null;
}

export default function MotorcycleGallery({
  coverImage,
  images,
  model,
  year,
  color,
  condition,
  details,
  videoUrl,
}: MotorcycleGalleryProps) {
  const allImages = [
    { url: coverImage, title: "FOTO PRINCIPAL - " + model.toUpperCase() },
    ...(images || []).filter((img) => img.url !== coverImage),
  ];

  const [selectedIdx, setSelectedIdx] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = useRef(false);

  // Mantém o indicador sincronizado com o arraste do dedo
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Handler direto: o evento de scroll já chega alinhado ao quadro, e um
    // requestAnimationFrame aqui não dispara com a aba em segundo plano,
    // deixando o indicador dessincronizado ao voltar.
    const onScroll = () => {
      if (isProgrammaticScroll.current) return;
      if (!track.clientWidth) return;
      const idx = Math.round(track.scrollLeft / track.clientWidth);
      setSelectedIdx((prev) => (prev === idx ? prev : idx));
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  const goTo = (idx: number) => {
    const clamped = Math.max(0, Math.min(idx, allImages.length - 1));
    setSelectedIdx(clamped);
    haptic("select");

    const track = trackRef.current;
    if (!track) return;

    isProgrammaticScroll.current = true;
    track.scrollTo({ left: clamped * track.clientWidth, behavior: "smooth" });
    setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 400);
  };

  const currentImage = allImages[selectedIdx] || allImages[0];

  return (
    <div className="w-full bg-dark-850 rounded-2xl border border-dark-700 overflow-hidden shadow-premium-card">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Área da galeria */}
        <div className="lg:col-span-7 p-3 sm:p-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-dark-700 space-y-3 sm:space-y-4">
          {/* Carrossel: no celular arrasta com o dedo, no desktop troca pelas miniaturas */}
          <div className="relative rounded-xl overflow-hidden bg-gradient-to-b from-dark-900 via-dark-850 to-dark-900 border border-dark-750">
            <div
              ref={trackRef}
              className="snap-x-carousel"
              role="group"
              aria-roledescription="carrossel"
              aria-label="Fotos da motocicleta"
            >
              {allImages.map((img, idx) => (
                <div
                  key={idx}
                  className="snap-item w-full h-[260px] sm:h-[380px] lg:h-[420px] flex items-center justify-center p-3 sm:p-4"
                  aria-label={`Foto ${idx + 1} de ${allImages.length}`}
                >
                  <img
                    src={img.url}
                    alt={img.title}
                    loading={idx === 0 ? "eager" : "lazy"}
                    className="max-h-full max-w-full object-contain drop-shadow-2xl"
                  />
                </div>
              ))}
            </div>

            {/* Selo */}
            <div className="absolute top-3 left-3 bg-dark-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-primary-500/30 text-[10px] sm:text-[11px] font-black uppercase text-primary-400 flex items-center gap-1.5 shadow-lg tracking-wider pointer-events-none">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PRÊMIO PRINCIPAL</span>
            </div>

            {/* Contador de fotos */}
            {allImages.length > 1 && (
              <div className="absolute top-3 right-3 bg-dark-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-dark-700 text-[11px] font-mono font-bold text-slate-300 pointer-events-none">
                {selectedIdx + 1}/{allImages.length}
              </div>
            )}

            {/* Setas — só onde há cursor */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={() => goTo(selectedIdx - 1)}
                  disabled={selectedIdx === 0}
                  aria-label="Foto anterior"
                  className="hidden lg:flex absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-dark-900/80 border border-dark-700 text-slate-200 hover:bg-dark-800 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => goTo(selectedIdx + 1)}
                  disabled={selectedIdx === allImages.length - 1}
                  aria-label="Próxima foto"
                  className="hidden lg:flex absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-dark-900/80 border border-dark-700 text-slate-200 hover:bg-dark-800 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Legenda */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-dark-900/95 via-dark-900/70 to-transparent p-2.5 pb-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-300 text-center pointer-events-none">
              {currentImage.title}
            </div>
          </div>

          {/* Pontinhos no celular */}
          {allImages.length > 1 && (
            <div className="flex sm:hidden items-center justify-center gap-2 pt-1">
              {allImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goTo(idx)}
                  aria-label={`Ir para a foto ${idx + 1}`}
                  aria-current={selectedIdx === idx}
                  className="h-8 px-1 flex items-center no-tap-highlight"
                >
                  <span
                    className={`block rounded-full transition-all duration-200 ${
                      selectedIdx === idx
                        ? "w-6 h-2 bg-primary-500"
                        : "w-2 h-2 bg-dark-600"
                    }`}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Miniaturas a partir do tablet */}
          {allImages.length > 1 && (
            <div className="hidden sm:grid grid-cols-4 gap-2 sm:gap-3">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => goTo(idx)}
                  aria-label={`Ver foto ${idx + 1}`}
                  className={`relative h-16 sm:h-20 rounded-lg overflow-hidden border-2 transition-all p-1 bg-dark-950 flex items-center justify-center ${
                    selectedIdx === idx
                      ? "border-primary-500 shadow-glow-primary scale-105"
                      : "border-dark-750 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img.url}
                    alt=""
                    loading="lazy"
                    className="max-h-full max-w-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}

          {videoUrl && (
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-dark-900 border border-dark-750 flex items-center justify-between gap-2 active:scale-[0.98] transition-transform"
            >
              <span className="flex items-center gap-2 text-xs text-slate-300 uppercase font-bold min-w-0">
                <Play className="w-4 h-4 text-primary-400 fill-current shrink-0" />
                <span className="truncate">Vídeo da motocicleta</span>
              </span>
              <span className="text-xs font-bold text-primary-400 uppercase shrink-0">Assistir</span>
            </a>
          )}
        </div>

        {/* Informações */}
        <div className="lg:col-span-5 p-4 sm:p-8 flex flex-col justify-between space-y-5 sm:space-y-6">
          <div>
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-primary-400">
              INFORMAÇÕES DO PRÊMIO
            </span>
            <h3 className="text-xl sm:text-3xl font-heading font-black text-foreground mt-1 uppercase tracking-tight">
              {model}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              {details ||
                "Motocicleta Honda CG 160 Start semi-nova em excelente estado de conservação, revisada, com documentação em dia e pronta para transferir ao vencedor."}
            </p>

            {/* Ficha: 3 colunas já no celular — cabem e evitam empilhar */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-5">
              <div className="p-2.5 sm:p-3.5 rounded-xl bg-dark-900 border border-dark-750 text-center">
                <span className="text-[10px] sm:text-[11px] text-slate-400 uppercase font-semibold block">
                  ANO
                </span>
                <p className="text-sm sm:text-base font-bold text-foreground mt-0.5">
                  {year || "2023"}
                </p>
              </div>

              <div className="p-2.5 sm:p-3.5 rounded-xl bg-dark-900 border border-dark-750 text-center">
                <span className="text-[10px] sm:text-[11px] text-slate-400 uppercase font-semibold block">
                  COR
                </span>
                <p className="text-sm sm:text-base font-bold text-foreground mt-0.5 truncate">
                  {color || "AZUL"}
                </p>
              </div>

              <div className="p-2.5 sm:p-3.5 rounded-xl bg-dark-900 border border-dark-750 text-center">
                <span className="text-[10px] sm:text-[11px] text-slate-400 uppercase font-semibold block">
                  ESTADO
                </span>
                <p className="text-sm sm:text-base font-bold text-emerald-400 mt-0.5">REVISADA</p>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-200 uppercase font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Documentação 100% em dia</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-200 uppercase font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Transferência direta para o ganhador</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-200 uppercase font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Motocicleta pronta para rodar</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-dark-900 border border-dark-750">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Condição geral
            </span>
            <p className="text-xs text-slate-300 mt-1 uppercase leading-relaxed">
              {condition ||
                "Semi-nova em excelente estado de conservação, revisada, documentação em dia e pronta para transferência"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
