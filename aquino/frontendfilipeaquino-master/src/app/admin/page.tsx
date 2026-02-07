import { prisma } from "../../../lib/prisma";

export const dynamic = "force-dynamic";

interface AdminUpcomingBooking {
  id: number;
  userName: string;
  userEmail: string;
  userPhone?: string | null;
  gender?: string | null;
  customField?: string | null;
  status: string;
  scheduledAt: string;
  serviceName?: string | null;
  workshopTitle?: string | null;
  paymentStatus?: string | null;
  paymentAmount?: string | number | null;
}

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  instagram?: string | null;
  notes?: string | null;
  planId: string;
  createdAt: string;
}

export default async function AdminDashboardPage() {
  let upcoming: AdminUpcomingBooking[] = [];
  let leads: Lead[] = [];
  try {
    const now = new Date();
    const bookings = await prisma.booking.findMany({
      where: { scheduledAt: { gte: now } },
      include: { service: true, workshop: true, payment: true },
      orderBy: { scheduledAt: "asc" },
      take: 20,
    });
    upcoming = bookings.map((b) => ({
      id: b.id,
      userName: b.userName,
      userEmail: b.userEmail,
      userPhone: b.userPhone,
      gender: b.gender,
      customField: b.customField,
      status: b.status,
      scheduledAt: b.scheduledAt.toISOString(),
      serviceName: b.service ? b.service.name : null,
      workshopTitle: b.workshop ? b.workshop.title : null,
      paymentStatus: b.payment ? b.payment.status : null,
      paymentAmount: b.payment ? String(b.payment.amount) : null,
    }));
  } catch {
    // em caso de erro, mantemos a lista vazia
  }

  try {
    const leadsRaw = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
    leads = leadsRaw.map((l) => ({
      id: l.id,
      name: l.name,
      email: l.email,
      phone: l.phone,
      instagram: l.instagram,
      notes: l.notes,
      planId: l.planId,
      createdAt: l.createdAt.toISOString(),
    }));
  } catch {
    // mantém lista vazia em caso de erro
  }

  const totalLeads = leads.length;
  const basicLeads = leads.filter((l) => l.planId === "basico").length;
  const intermediateLeads = leads.filter((l) => l.planId === "intermediario").length;
  const annualLeads = leads.filter((l) => l.planId === "anual").length;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="inline-flex items-center rounded-full bg-slate-900/70 border border-slate-800 px-3 py-1 text-[11px] uppercase tracking-wide text-slate-400 mb-2">
            Painel do administrador
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Visão geral da agenda</h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl">
            Acompanhe rapidamente agendamentos do dia, workshops próximos e pagamentos pendentes. Em breve estes
            números serão conectados em tempo real ao backend.
          </p>
        </div>
        <div className="flex gap-2 mt-2 md:mt-0 text-xs">
          <button className="rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1.5 hover:border-sky-500 hover:text-sky-300 transition">
            Atualizar visão
          </button>
          <button className="rounded-full bg-sky-500 px-3 py-1.5 font-medium text-slate-950 hover:bg-sky-400 transition">
            Novo agendamento
          </button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3 text-sm">
        <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/70 to-slate-900/30 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-400">Agendamentos hoje</p>
            <span className="text-[10px] rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/30 px-2 py-0.5 uppercase tracking-wide">
              Em breve
            </span>
          </div>
          <p className="text-3xl font-semibold text-sky-400 leading-tight">--</p>
          <p className="text-[11px] text-slate-500 mt-1">Total de sessões confirmadas para o dia.</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-400">Próximo workshop</p>
            <span className="text-[10px] rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 uppercase tracking-wide">
              Agenda
            </span>
          </div>
          <p className="text-base font-medium text-slate-100">--</p>
          <p className="text-[11px] text-slate-500 mt-1">Título e data do próximo workshop agendado.</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-400">Planos contratados (landing)</p>
            <span className="text-[10px] rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 uppercase tracking-wide">
              Consultoria
            </span>
          </div>
          <p className="text-3xl font-semibold text-emerald-400 leading-tight">
            {totalLeads}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Total de leads gerados pela landing page de consultoria.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-slate-400">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 border border-slate-700 px-2 py-0.5">
              <span className="w-2 h-2 rounded-full bg-sky-400" /> Básico: {basicLeads}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 border border-slate-700 px-2 py-0.5">
              <span className="w-2 h-2 rounded-full bg-indigo-400" /> Intermediário: {intermediateLeads}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 border border-slate-700 px-2 py-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Anual: {annualLeads}
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3 text-sm">
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/40 p-4 md:p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-slate-100">Próximos agendamentos</h2>
            <span className="text-[11px] text-slate-500">Conectado ao backend</span>
          </div>
          {upcoming.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/40 px-4 py-6 text-center text-xs text-slate-500">
              Nenhum agendamento futuro encontrado no momento. Assim que novos pagamentos forem aprovados, eles
              aparecerão aqui com nome do cliente, serviço e status do pagamento.
            </div>
          ) : (
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 divide-y divide-slate-800 text-xs">
              {upcoming.map((b) => {
                const scheduledDate = new Date(b.scheduledAt);
                const dateStr = scheduledDate.toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                });
                const timeStr = scheduledDate.toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const label = b.serviceName || b.workshopTitle || "Agendamento";
                const paymentStatus = b.paymentStatus || "PENDING";
                return (
                  <div key={b.id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-100 font-medium text-xs">{b.userName}</span>
                        <span className="text-[10px] text-slate-500">{b.userEmail}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {label} · {dateStr} às {timeStr}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500">
                        {b.gender && (
                          <span>Gênero: {b.gender}</span>
                        )}
                        {b.customField && (
                          <span className="text-sky-400 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                            {b.customField.startsWith('@') ? b.customField : `@${b.customField}`}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={
                          "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium " +
                          (paymentStatus === "APPROVED"
                            ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40"
                            : paymentStatus === "PENDING"
                              ? "bg-amber-500/10 text-amber-300 border border-amber-500/40"
                              : "bg-red-500/10 text-red-300 border border-red-500/40")
                        }
                      >
                        {paymentStatus === "APPROVED"
                          ? "Pagamento aprovado"
                          : paymentStatus === "PENDING"
                            ? "Pagamento pendente"
                            : "Pagamento recusado"}
                      </span>
                      {b.paymentAmount != null && (
                        <span className="text-[11px] text-slate-400">
                          Valor: R$ {Number(b.paymentAmount).toFixed(2).replace(".", ",")}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 md:p-5 flex flex-col gap-3">
          <h2 className="text-sm font-medium text-slate-100">Ações rápidas</h2>
          <p className="text-xs text-slate-500">Atalhos para as tarefas mais comuns do seu dia a dia.</p>
          <div className="flex flex-col gap-2 text-xs">
            <a href="/admin/services" className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 hover:border-sky-500 hover:text-sky-300 transition">
              Gerenciar serviços
            </a>
            <a href="/admin/workshops" className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 hover:border-sky-500 hover:text-sky-300 transition">
              Gerenciar workshops
            </a>
            <a href="/admin/testimonials" className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 hover:border-sky-500 hover:text-sky-300 transition">
              Ver depoimentos
            </a>
            <a href="/admin/settings" className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 hover:border-sky-500 hover:text-sky-300 transition">
              Editar página Sobre mim
            </a>
            <a href="/admin/settings" className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 hover:border-sky-500 hover:text-sky-300 transition">
              Configurações gerais
            </a>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3 text-sm">
        <div className="lg:col-span-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-4 md:p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-slate-100">Consultoria Landing Page</h2>
            <span className="text-[11px] text-slate-500">Coletados via formulário de planos</span>
          </div>
          {leads.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/40 px-4 py-6 text-center text-xs text-slate-500">
              Nenhum lead cadastrado ainda. Quando visitantes preencherem o formulário da landing page, eles aparecerão aqui.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
              <table className="min-w-full text-xs">
                <thead className="bg-slate-900/60 border-b border-slate-800">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-slate-400">Nome</th>
                    <th className="px-3 py-2 text-left font-medium text-slate-400">Contato</th>
                    <th className="px-3 py-2 text-left font-medium text-slate-400">Plano</th>
                    <th className="px-3 py-2 text-left font-medium text-slate-400">Instagram</th>
                    <th className="px-3 py-2 text-left font-medium text-slate-400">Objetivo</th>
                    <th className="px-3 py-2 text-left font-medium text-slate-400">Criado em</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {leads.map((lead) => {
                    const created = new Date(lead.createdAt);
                    const dateStr = created.toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    });
                    const timeStr = created.toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    return (
                      <tr key={lead.id} className="hover:bg-slate-900/60">
                        <td className="px-3 py-2 text-slate-100">{lead.name}</td>
                        <td className="px-3 py-2 text-slate-300">
                          <div className="flex flex-col">
                            <span>{lead.email}</span>
                            <span className="text-slate-500 text-[11px]">{lead.phone}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-slate-300 text-[11px] uppercase">{lead.planId}</td>
                        <td className="px-3 py-2 text-slate-300 text-[11px]">
                          {lead.instagram ? (lead.instagram.startsWith('@') ? lead.instagram : `@${lead.instagram}`) : '-'}
                        </td>
                        <td className="px-3 py-2 text-slate-300 max-w-xs">
                          <span className="line-clamp-2">{lead.notes || '-'}</span>
                        </td>
                        <td className="px-3 py-2 text-slate-400 text-[11px]">
                          {dateStr} às {timeStr}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
