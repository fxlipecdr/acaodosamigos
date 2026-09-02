import db from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import PresentialSaleClient from "./PresentialSaleClient";

export const dynamic = "force-dynamic";

export default async function AdminVendaPresencialPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const [partners, settings] = await Promise.all([
    db.partner.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
    db.campaignSettings.findUnique({
      where: { id: "default" },
    }),
  ]);

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
          Frente de Caixa Rápida
        </span>
        <h1 className="text-2xl sm:text-3xl font-heading font-black text-foreground mt-0.5">
          Registro de Venda Presencial
        </h1>
        <p className="text-xs text-slate-400">
          Cadastre bilhetes físicos vendidos nos estabelecimentos parceiros (faixa {settings?.presencialStart || 1000} a {settings?.presencialEnd || 2999}).
        </p>
      </div>

      <PresentialSaleClient
        partners={partners}
        presencialStart={settings?.presencialStart || 1000}
        presencialEnd={settings?.presencialEnd || 2999}
      />
    </div>
  );
}
