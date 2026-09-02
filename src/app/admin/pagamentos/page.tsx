import db from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreditCard, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";
import { formatCPF } from "@/lib/cpf";
import { formatCurrency } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export default async function AdminPagamentosPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const payments = await db.payment.findMany({
    include: {
      purchase: {
        include: {
          participant: true,
          items: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <span className="text-xs font-bold text-primary-400 uppercase tracking-wider">
          Transações Financeiras
        </span>
        <h1 className="text-2xl sm:text-3xl font-heading font-black text-foreground mt-0.5">
          Histórico de Pagamentos Pix
        </h1>
        <p className="text-xs text-slate-400">
          Registro completo de cobranças geradas, liquidadas e expiradas.
        </p>
      </div>

      <div className="rounded-2xl bg-dark-850 border border-dark-750 overflow-hidden shadow-premium-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-dark-900 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-dark-750">
              <tr>
                <th className="py-3 px-4">Pedido / TxID</th>
                <th className="py-3 px-4">Participante</th>
                <th className="py-3 px-4">CPF</th>
                <th className="py-3 px-4">Valor</th>
                <th className="py-3 px-4">Números</th>
                <th className="py-3 px-4">Gateway</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-750/60 font-mono">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 font-sans">
                    Nenhum pagamento registrado ainda.
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const isPaid = p.status === "PAID";
                  const isPending = p.status === "PENDING";
                  const numbersList = p.purchase.items.map((i) => i.number);

                  return (
                    <tr key={p.id} className="hover:bg-dark-800/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-primary-400">
                        {p.purchase.code}
                      </td>

                      <td className="py-3 px-4 font-sans font-bold text-foreground">
                        {p.purchase.participant?.fullName || "—"}
                      </td>

                      <td className="py-3 px-4 text-slate-400">
                        {p.purchase.participant?.cpf ? formatCPF(p.purchase.participant.cpf) : "—"}
                      </td>

                      <td className="py-3 px-4 font-bold text-foreground">
                        {formatCurrency(p.amount)}
                      </td>

                      <td className="py-3 px-4 text-slate-300">
                        <span className="font-sans text-[11px] bg-dark-900 px-2 py-0.5 rounded border border-dark-750">
                          {numbersList.join(", ")}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-sans text-xs text-slate-400">
                        {p.gateway}
                      </td>

                      <td className="py-3 px-4 font-sans font-bold">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3" /> Pago
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                            <Clock className="w-3 h-3" /> Aguardando
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-dark-900 border border-dark-750 px-2 py-0.5 rounded">
                            Expirado
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-sans text-slate-500 text-[11px]">
                        {new Date(p.createdAt).toLocaleString("pt-BR")}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
