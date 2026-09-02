import db from "@/lib/db";
import PointsOfSaleClient from "./PointsOfSaleClient";
import { MapPin } from "lucide-react";

export const revalidate = 0; // Fresh list from DB

export default async function PontosDeVendaPage() {
  const partners = await db.partner.findMany({
    where: { isActive: true },
    orderBy: [
      { neighborhood: "asc" },
      { name: "asc" },
    ],
  });

  return (
    <div className="min-h-screen py-8 sm:py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-400 text-xs font-bold uppercase tracking-wider">
          <MapPin className="w-3.5 h-3.5" />
          <span>REDE DE ESTABELECIMENTOS CREDENCIADOS</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-black text-foreground uppercase tracking-tight">
          ONDE COMPRAR PRESENCIALMENTE
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Além da compra online, você também pode adquirir seus números da ação diretamente em nossos estabelecimentos parceiros credenciados.
        </p>
      </div>

      <PointsOfSaleClient initialPartners={partners} />
    </div>
  );
}
