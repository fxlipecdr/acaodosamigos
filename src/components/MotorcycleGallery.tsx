"use client";

import { useState } from "react";
import { Sparkles, CheckCircle2, Play } from "lucide-react";

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
  const currentImage = allImages[selectedIdx] || allImages[0];

  return (
    <div className="w-full bg-dark-850 rounded-2xl border border-dark-700 overflow-hidden shadow-premium-card">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        
        {/* Gallery / Image View Area (7 cols) */}
        <div className="lg:col-span-7 p-4 sm:p-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-dark-700 space-y-4">
          
          {/* Main Display Frame with optimized proportions */}
          <div className="relative w-full h-[300px] sm:h-[380px] lg:h-[420px] rounded-xl overflow-hidden bg-gradient-to-b from-dark-900 via-dark-850 to-dark-900 border border-dark-750 flex items-center justify-center p-2 sm:p-4 group">
            <img
              src={currentImage.url}
              alt={currentImage.title}
              className="max-h-full max-w-full object-contain drop-shadow-2xl transition-transform duration-300 group-hover:scale-[1.02]"
            />

            {/* Badge */}
            <div className="absolute top-3 left-3 bg-dark-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-primary-500/30 text-[11px] font-black uppercase text-primary-400 flex items-center gap-1.5 shadow-lg tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PRÊMIO PRINCIPAL</span>
            </div>

            {/* Caption */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-dark-900/95 via-dark-900/70 to-transparent p-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-300 text-center">
              {currentImage.title}
            </div>
          </div>

          {/* Thumbnails list */}
          {allImages.length > 1 && (
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedIdx(idx)}
                  className={`relative h-16 sm:h-20 rounded-lg overflow-hidden border-2 transition-all p-1 bg-dark-950 flex items-center justify-center ${
                    selectedIdx === idx
                      ? "border-primary-500 shadow-glow-primary scale-105"
                      : "border-dark-750 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img.url} alt={img.title} className="max-h-full max-w-full object-contain" />
                </button>
              ))}
            </div>
          )}

          {videoUrl && (
            <div className="mt-2 p-3 rounded-xl bg-dark-900 border border-dark-750 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-300 uppercase font-bold">
                <Play className="w-4 h-4 text-primary-400 fill-current" />
                <span>VÍDEO DE APRESENTAÇÃO DA MOTOCICLETA</span>
              </div>
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-primary-400 hover:text-primary-300 underline uppercase"
              >
                ASSISTIR VÍDEO
              </a>
            </div>
          )}
        </div>

        {/* Information Area (5 cols) */}
        <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary-400">
              INFORMAÇÕES DO PRÊMIO
            </span>
            <h3 className="text-2xl sm:text-3xl font-heading font-black text-foreground mt-1 uppercase tracking-tight">
              {model}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              {details || "Motocicleta Honda CG 160 Start semi-nova em excelente estado de conservação, revisada, com documentação em dia e pronta para transferir ao vencedor."}
            </p>

            {/* Clean Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
              <div className="p-3.5 rounded-xl bg-dark-900 border border-dark-750 text-center">
                <span className="text-[11px] text-slate-400 uppercase font-semibold block">ANO</span>
                <p className="text-base font-bold text-foreground mt-0.5">{year || "2023"}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-dark-900 border border-dark-750 text-center">
                <span className="text-[11px] text-slate-400 uppercase font-semibold block">COR</span>
                <p className="text-base font-bold text-foreground mt-0.5">{color || "AZUL"}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-dark-900 border border-dark-750 text-center">
                <span className="text-[11px] text-slate-400 uppercase font-semibold block">ESTADO</span>
                <p className="text-base font-bold text-emerald-400 mt-0.5">REVISADA</p>
              </div>
            </div>

            {/* Guaranteed items */}
            <div className="mt-6 space-y-2.5">
              <div className="flex items-center gap-2 text-xs text-slate-200 uppercase font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>DOCUMENTAÇÃO 100% EM DIA</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-200 uppercase font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>TRANSFERÊNCIA DIRETA PARA O GANHADOR</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-200 uppercase font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>MOTOCICLETA PRONTA PARA RODAR</span>
              </div>
            </div>
          </div>

          {/* Condition Box */}
          <div className="p-4 rounded-xl bg-dark-900 border border-dark-750">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">CONDIÇÃO GERAL</span>
            <p className="text-xs text-slate-300 mt-1 uppercase leading-relaxed">
              {condition || "Semi-nova em excelente estado de conservação, revisada, documentação em dia e pronta para transferência"}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
