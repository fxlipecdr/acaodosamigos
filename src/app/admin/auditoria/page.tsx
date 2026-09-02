import db from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ScrollText, ShieldCheck, Clock, User } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminAuditoriaPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const logs = await db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <span className="text-xs font-bold text-primary-400 uppercase tracking-wider">
          Rastreabilidade & Conformidade
        </span>
        <h1 className="text-2xl sm:text-3xl font-heading font-black text-foreground mt-0.5">
          Logs de Auditoria Administrativa
        </h1>
        <p className="text-xs text-slate-400">
          Registro imutável de todas as ações executadas no painel de administração (alterações de dados, sorteios, vendas e bloqueios).
        </p>
      </div>

      <div className="rounded-2xl bg-dark-850 border border-dark-750 overflow-hidden shadow-premium-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-dark-900 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-dark-750">
              <tr>
                <th className="py-3 px-4">Data/Hora</th>
                <th className="py-3 px-4">Administrador</th>
                <th className="py-3 px-4">Ação</th>
                <th className="py-3 px-4">Entidade</th>
                <th className="py-3 px-4">Detalhes / Valores</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-750/60 font-mono">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 font-sans">
                    Nenhum registro de auditoria no momento.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-dark-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("pt-BR")}
                    </td>

                    <td className="py-3 px-4 font-sans font-bold text-foreground">
                      {log.adminEmail}
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-primary-500/10 text-primary-400 border border-primary-500/20 text-[10px] font-bold font-sans">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-400 font-sans">
                      {log.entityType} {log.entityId ? `#${log.entityId}` : ""}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400 max-w-md truncate">
                      {log.newValue || log.oldValue || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
