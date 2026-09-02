import db from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminQrCodeClient from "./AdminQrCodeClient";

export const dynamic = "force-dynamic";

export default async function AdminQrCodePage() {
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
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <span className="text-xs font-bold text-primary-400 uppercase tracking-wider">
          Divulgação & Impressão
        </span>
        <h1 className="text-2xl sm:text-3xl font-heading font-black text-foreground mt-0.5">
          Gerador de QR Codes & Materiais de Divulgação
        </h1>
        <p className="text-xs text-slate-400">
          Gere e baixe QR Codes em alta resolução para cartazes, panfletos e materiais específicos para cada ponto de venda parceiro.
        </p>
      </div>

      <AdminQrCodeClient partners={partners} settings={settings} />
    </div>
  );
}
