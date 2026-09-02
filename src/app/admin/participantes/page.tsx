import db from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminParticipantsClient from "./AdminParticipantsClient";

export const dynamic = "force-dynamic";

export default async function AdminParticipantesPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const participants = await db.participant.findMany({
    include: {
      numbers: {
        include: {
          partner: true,
        },
        orderBy: { number: "asc" },
      },
      purchases: {
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <span className="text-xs font-bold text-primary-400 uppercase tracking-wider">
          Base de Participantes
        </span>
        <h1 className="text-2xl sm:text-3xl font-heading font-black text-foreground mt-0.5">
          Participantes Cadastrados
        </h1>
        <p className="text-xs text-slate-400">
          Total de {participants.length} participantes únicos registrados com compras online ou físicas.
        </p>
      </div>

      <AdminParticipantsClient initialParticipants={participants} />
    </div>
  );
}
