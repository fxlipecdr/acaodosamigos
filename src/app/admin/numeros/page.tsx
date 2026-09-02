import db from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminNumbersClient from "./AdminNumbersClient";

export const dynamic = "force-dynamic";

export default async function AdminNumerosPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const [numbers, partners] = await Promise.all([
    db.raffleNumber.findMany({
      include: {
        participant: true,
        partner: true,
      },
      orderBy: { number: "asc" },
    }),
    db.partner.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-primary-400 uppercase tracking-wider">
            Controle de Bilhetes
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-foreground mt-0.5">
            Gerenciamento de Números
          </h1>
          <p className="text-xs text-slate-400">
            Total de {numbers.length} números cadastrados no banco de dados.
          </p>
        </div>
      </div>

      <AdminNumbersClient initialNumbers={numbers} partners={partners} />
    </div>
  );
}
