import db from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminPrizeClient from "./AdminPrizeClient";

export const dynamic = "force-dynamic";

export default async function AdminPremioPage() {
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
          Configuração do Prêmio
        </span>
        <h1 className="text-2xl sm:text-3xl font-heading font-black text-foreground mt-0.5">
          Motocicleta, Fotos & Mídia
        </h1>
        <p className="text-xs text-slate-400">
          Edite as especificações técnicas da moto e gerencie a galeria de imagens e vídeo da landing page.
        </p>
      </div>

      <AdminPrizeClient settings={settings} />
    </div>
  );
}
