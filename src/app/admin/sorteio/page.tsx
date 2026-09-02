import db from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminDrawClient from "./AdminDrawClient";

export const dynamic = "force-dynamic";

export default async function AdminSorteioPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const [settings, drawResult, drawHistory, totalSold] = await Promise.all([
    db.campaignSettings.findUnique({ where: { id: "default" } }),
    db.drawResult.findFirst({ where: { id: "current-draw" } }),
    db.drawHistory.findMany({ orderBy: { createdAt: "desc" } }),
    db.raffleNumber.count({ where: { status: "PAID" } }),
  ]);

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <span className="text-xs font-bold text-primary-400 uppercase tracking-wider">
          Módulo Oficial de Apuração
        </span>
        <h1 className="text-2xl sm:text-3xl font-heading font-black text-foreground mt-0.5">
          Sorteio & Conferência da Loteria Federal
        </h1>
        <p className="text-xs text-slate-400">
          Altere datas, lance os 5 prêmios extraídos da Loteria Federal e confira o ganhador de forma 100% automatizada.
        </p>
      </div>

      <AdminDrawClient
        settings={settings}
        drawResult={drawResult}
        drawHistory={drawHistory}
        totalSold={totalSold}
      />
    </div>
  );
}
