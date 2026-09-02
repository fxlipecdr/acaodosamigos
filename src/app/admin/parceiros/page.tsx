import db from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminPartnersClient from "./AdminPartnersClient";

export const dynamic = "force-dynamic";

export default async function AdminParceirosPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const partners = await db.partner.findMany({
    include: {
      numbers: {
        where: { status: "PAID" },
        select: { number: true, pricePaid: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-dark-750">
        <div>
          <span className="text-xs font-bold text-primary-400 uppercase tracking-wider">
            Rede de Pontos de Venda
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-foreground mt-0.5">
            Estabelecimentos Parceiros & Comissões
          </h1>
          <p className="text-xs text-slate-400">
            Cadastre, edite e gerencie estabelecimentos físicos que comercializam bilhetes.
          </p>
        </div>
      </div>

      <AdminPartnersClient initialPartners={partners} />
    </div>
  );
}
