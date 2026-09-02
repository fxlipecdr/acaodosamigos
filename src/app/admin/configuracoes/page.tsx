import db from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSettingsClient from "./AdminSettingsClient";

export const dynamic = "force-dynamic";

export default async function AdminConfiguracoesPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const settings = await db.campaignSettings.findUnique({
    where: { id: "default" },
  });

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <span className="text-xs font-bold text-primary-400 uppercase tracking-wider">
          Painel de Parâmetros
        </span>
        <h1 className="text-2xl sm:text-3xl font-heading font-black text-foreground mt-0.5">
          Configurações Gerais do Sistema
        </h1>
        <p className="text-xs text-slate-400">
          Edite valores, regras comerciais de promoção, faixas de números, WhatsApp de suporte e regulamento oficial.
        </p>
      </div>

      <AdminSettingsClient settings={settings} />
    </div>
  );
}
