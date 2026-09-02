"use client";

import { useState } from "react";
import { 
  Sparkles, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Star, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Play, 
  Info 
} from "lucide-react";

export default function AdminPrizeClient({ settings }: { settings: any }) {
  const [model, setModel] = useState(settings?.prizeModel || "Honda CG 160 Start");
  const [year, setYear] = useState(settings?.prizeYear || "2023");
  const [color, setColor] = useState(settings?.prizeColor || "Azul Metálico");
  const [condition, setCondition] = useState(settings?.prizeCondition || "Semi-nova em excelente estado de conservação, revisada, documentação em dia e pronta para transferência");
  const [details, setDetails] = useState(settings?.prizeDetails || "Motocicleta Honda CG 160 Start semi-nova em excelente estado de conservação, revisada, documentação em dia e pronta para transferir ao vencedor.");
  const [coverImage, setCoverImage] = useState(settings?.prizeCoverImage || "/images/moto/moto-hero.jpg");
  const [videoUrl, setVideoUrl] = useState(settings?.prizeVideoUrl || "");

  // Photos array
  const initialImages = settings?.prizeImagesJson ? JSON.parse(settings.prizeImagesJson) : [];
  const [images, setImages] = useState<Array<{ url: string; title: string }>>(initialImages);

  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageTitle, setNewImageTitle] = useState("");

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAddImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl.trim()) return;
    setImages([...images, { url: newImageUrl.trim(), title: newImageTitle.trim() || "Foto do Prêmio" }]);
    setNewImageUrl("");
    setNewImageTitle("");
  };

  const handleRemoveImage = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  const handleSetCover = (url: string) => {
    setCoverImage(url);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      setLoading(true);
      const res = await fetch("/api/admin/prize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prizeModel: model,
          prizeYear: year,
          prizeColor: color,
          prizeCondition: condition,
          prizeDetails: details,
          prizeCoverImage: coverImage,
          prizeVideoUrl: videoUrl,
          prizeImagesJson: JSON.stringify(images),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Erro ao salvar informações do prêmio.");
        return;
      }

      setSuccessMessage("Informações do prêmio e galeria de fotos salvas com sucesso!");
    } catch {
      setErrorMessage("Erro de conexão ao salvar prêmio.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-bold uppercase flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs sm:text-sm font-bold uppercase flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Specs Section */}
        <div className="p-6 sm:p-8 rounded-2xl bg-dark-850 border border-dark-750 space-y-6 shadow-premium-card">
          <h3 className="font-heading font-black text-xs text-foreground uppercase tracking-wider border-b border-dark-750 pb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary-400" />
            ESPECIFICAÇÕES DA MOTOCICLETA
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            
            <div className="space-y-1 sm:col-span-2">
              <label className="font-bold uppercase tracking-wider text-slate-300">MODELO DA MOTO</label>
              <input
                type="text"
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dark-900 border border-dark-700 rounded-xl text-foreground focus:outline-none focus:border-primary-500 font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-slate-300">ANO / MODELO</label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dark-900 border border-dark-700 rounded-xl text-foreground focus:outline-none focus:border-primary-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-slate-300">COR</label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dark-900 border border-dark-700 rounded-xl text-foreground focus:outline-none focus:border-primary-500"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="font-bold uppercase tracking-wider text-slate-300">CONDIÇÃO & DOCUMENTAÇÃO</label>
              <input
                type="text"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dark-900 border border-dark-700 rounded-xl text-foreground focus:outline-none focus:border-primary-500"
              />
            </div>

            <div className="space-y-1 sm:col-span-3">
              <label className="font-bold uppercase tracking-wider text-slate-300">DESCRIÇÃO DETALHADA</label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dark-900 border border-dark-700 rounded-xl text-foreground focus:outline-none focus:border-primary-500 leading-relaxed"
              />
            </div>

            <div className="space-y-1 sm:col-span-3">
              <label className="font-bold uppercase tracking-wider text-slate-300">URL DE VÍDEO DO YOUTUBE / APRESENTAÇÃO (OPCIONAL)</label>
              <input
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dark-900 border border-dark-700 rounded-xl text-foreground focus:outline-none focus:border-primary-500 font-mono"
              />
            </div>

          </div>
        </div>

        {/* Photos Gallery Management */}
        <div className="p-6 sm:p-8 rounded-2xl bg-dark-850 border border-dark-700 space-y-6 shadow-premium-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-dark-750 pb-3">
            <div>
              <h3 className="font-heading font-black text-xs text-foreground uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-primary-400" />
                GALERIA DE FOTOS DO PRÊMIO
              </h3>
              <p className="text-xs text-slate-400">
                Adicione fotos em alta qualidade para exibição na página inicial da ação.
              </p>
            </div>

            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              TOTAL: {images.length} FOTOS
            </span>
          </div>

          {/* Add Image Inline Form */}
          <div className="p-4 rounded-xl bg-dark-900 border border-dark-750 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">ADICIONAR NOVA FOTO (URL OU CAMINHO LOCAL)</span>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6">
                <input
                  type="text"
                  placeholder="/images/moto/foto.jpg ou https://..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2 bg-dark-950 border border-dark-700 rounded-xl text-xs text-foreground focus:outline-none focus:border-primary-500 font-mono"
                />
              </div>
              <div className="sm:col-span-4">
                <input
                  type="text"
                  placeholder="Legenda (ex: Lateral Esquerda)"
                  value={newImageTitle}
                  onChange={(e) => setNewImageTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-dark-950 border border-dark-700 rounded-xl text-xs text-foreground focus:outline-none focus:border-primary-500"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="w-full py-2 rounded-xl bg-dark-800 hover:bg-dark-750 text-primary-400 border border-dark-700 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>INCLUIR</span>
                </button>
              </div>
            </div>
          </div>

          {/* Images Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {images.map((img, idx) => {
              const isCover = coverImage === img.url;

              return (
                <div
                  key={idx}
                  className={`relative rounded-2xl overflow-hidden border p-2 flex flex-col justify-between space-y-2 bg-dark-900 transition-all ${
                    isCover ? "border-primary-500 shadow-glow-primary" : "border-dark-750"
                  }`}
                >
                  <div className="relative h-40 w-full rounded-xl overflow-hidden bg-dark-950 flex items-center justify-center p-2">
                    <img
                      src={img.url}
                      alt={img.title}
                      className="max-h-full max-w-full object-contain"
                    />
                    {isCover && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-primary-500 text-dark-900 text-[10px] font-black uppercase tracking-wider shadow-md">
                        CAPA PRINCIPAL
                      </span>
                    )}
                  </div>

                  <div className="px-1">
                    <p className="text-xs font-bold text-foreground truncate uppercase">{img.title}</p>
                    <p className="text-[10px] text-slate-500 truncate font-mono">{img.url}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-dark-800 text-xs">
                    {!isCover && (
                      <button
                        type="button"
                        onClick={() => handleSetCover(img.url)}
                        className="text-[11px] text-primary-400 hover:text-primary-300 font-bold uppercase tracking-wider flex items-center gap-1"
                      >
                        <Star className="w-3.5 h-3.5" />
                        <span>DEFINIR CAPA</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="text-[11px] text-red-400 hover:text-red-300 font-bold uppercase tracking-wider flex items-center gap-1 ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>REMOVER</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3.5 rounded-xl bg-primary-500 hover:bg-primary-400 text-dark-900 font-black text-xs uppercase tracking-wider shadow-glow-primary active:scale-95 transition-all flex items-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>SALVANDO ALTERAÇÕES...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>SALVAR TODAS AS ALTERAÇÕES</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
