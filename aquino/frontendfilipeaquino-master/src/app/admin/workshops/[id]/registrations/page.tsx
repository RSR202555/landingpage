"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Registration {
    id: number;
    userName: string;
    userEmail: string;
    userPhone: string | null;
    gender: string | null;
    notes: string | null;
    customField: string | null;
    status: "PENDING" | "CONFIRMED" | "CANCELLED";
    registeredAt: string;
    scheduledAt: string;
    payment: {
        status: "PENDING" | "APPROVED" | "REJECTED";
        amount: string;
        method: string | null;
        provider: string;
    } | null;
}

interface WorkshopInfo {
    id: number;
    title: string;
    description: string | null;
    date: string;
    durationMin: number;
    maxSeats: number;
    price: string;
    active: boolean;
    imageUrl: string | null;
}

interface Statistics {
    totalRegistrations: number;
    confirmedBookings: number;
    pendingBookings: number;
    cancelledBookings: number;
    totalRevenue: number;
    remainingSeats: number;
}

interface RegistrationsData {
    workshop: WorkshopInfo;
    statistics: Statistics;
    registrations: Registration[];
}

export default function WorkshopRegistrationsPage() {
    const params = useParams();
    const router = useRouter();
    const workshopId = params.id as string;

    const [data, setData] = useState<RegistrationsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");

    useEffect(() => {
        loadRegistrations();
    }, [workshopId]);

    async function loadRegistrations() {
        try {
            setLoading(true);
            const res = await fetch(`/api/workshops/admin/${workshopId}/registrations`, {
                cache: 'no-store',
            });

            if (!res.ok) {
                throw new Error('Erro ao carregar inscritos');
            }

            const responseData = await res.json();
            setData(responseData);
        } catch (e) {
            console.error(e);
            setError('Erro ao carregar inscritos do workshop');
        } finally {
            setLoading(false);
        }
    }

    const filteredRegistrations = data?.registrations.filter((reg) => {
        const matchesSearch =
            reg.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reg.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (reg.userPhone && reg.userPhone.includes(searchTerm));

        const matchesStatus = statusFilter === "ALL" || reg.status === statusFilter;

        return matchesSearch && matchesStatus;
    }) || [];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-slate-400">Carregando inscritos...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="space-y-4">
                <button
                    onClick={() => router.back()}
                    className="text-sm text-sky-400 hover:text-sky-300 transition"
                >
                    ← Voltar
                </button>
                <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                    {error || 'Workshop não encontrado'}
                </div>
            </div>
        );
    }

    const { workshop, statistics } = data;
    const workshopDate = new Date(workshop.date);
    const dateStr = workshopDate.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
    const timeStr = workshopDate.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <button
                    onClick={() => router.back()}
                    className="text-sm text-sky-400 hover:text-sky-300 transition mb-4 inline-flex items-center gap-1"
                >
                    ← Voltar para workshops
                </button>

                <div className="flex flex-col gap-2">
                    <p className="inline-flex items-center rounded-full bg-slate-900/70 border border-slate-800 px-3 py-1 text-[11px] uppercase tracking-wide text-slate-400 w-fit">
                        Relatório de Inscritos
                    </p>
                    <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{workshop.title}</h1>
                    <p className="text-sm text-slate-400">
                        {dateStr} às {timeStr} • {workshop.durationMin} minutos
                    </p>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                    <p className="text-xs text-slate-400 mb-1">Total de Inscritos</p>
                    <p className="text-2xl font-semibold text-slate-100">{statistics.totalRegistrations}</p>
                </div>

                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                    <p className="text-xs text-emerald-400 mb-1">Confirmados</p>
                    <p className="text-2xl font-semibold text-emerald-300">{statistics.confirmedBookings}</p>
                </div>

                <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4">
                    <p className="text-xs text-yellow-400 mb-1">Pendentes</p>
                    <p className="text-2xl font-semibold text-yellow-300">{statistics.pendingBookings}</p>
                </div>

                <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
                    <p className="text-xs text-red-400 mb-1">Cancelados</p>
                    <p className="text-2xl font-semibold text-red-300">{statistics.cancelledBookings}</p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                    <p className="text-xs text-slate-400 mb-1">Vagas Restantes</p>
                    <p className="text-2xl font-semibold text-slate-100">{statistics.remainingSeats}</p>
                </div>

                <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-4">
                    <p className="text-xs text-sky-400 mb-1">Receita Total</p>
                    <p className="text-2xl font-semibold text-sky-300">
                        R$ {statistics.totalRevenue.toFixed(2).replace(".", ",")}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Buscar por nome, email ou telefone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        />
                    </div>
                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full md:w-auto rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        >
                            <option value="ALL">Todos os status</option>
                            <option value="CONFIRMED">Confirmados</option>
                            <option value="PENDING">Pendentes</option>
                            <option value="CANCELLED">Cancelados</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Registrations Table */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 md:p-5">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">
                        Inscritos ({filteredRegistrations.length})
                    </h2>
                </div>

                {filteredRegistrations.length === 0 ? (
                    <p className="text-center text-slate-500 py-8">
                        {searchTerm || statusFilter !== "ALL"
                            ? "Nenhum inscrito encontrado com os filtros aplicados"
                            : "Nenhum inscrito ainda"}
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full border border-slate-800 rounded-xl overflow-hidden text-xs md:text-sm">
                            <thead className="bg-slate-900/80">
                                <tr className="text-left text-slate-400">
                                    <th className="px-3 py-2 border-b border-slate-800">Participante</th>
                                    <th className="px-3 py-2 border-b border-slate-800">Contato</th>
                                    <th className="px-3 py-2 border-b border-slate-800">Data Inscrição</th>
                                    <th className="px-3 py-2 border-b border-slate-800">Status</th>
                                    <th className="px-3 py-2 border-b border-slate-800">Pagamento</th>
                                    <th className="px-3 py-2 border-b border-slate-800">Valor</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRegistrations.map((reg) => {
                                    const regDate = new Date(reg.registeredAt);
                                    const regDateStr = regDate.toLocaleDateString("pt-BR", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                    });
                                    const regTimeStr = regDate.toLocaleTimeString("pt-BR", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    });

                                    return (
                                        <tr key={reg.id} className="border-t border-slate-800/80">
                                            <td className="px-3 py-3">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="font-medium text-slate-100">{reg.userName}</span>
                                                    {reg.customField && (
                                                        <span className="text-[11px] text-sky-400 flex items-center gap-1">
                                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                                            </svg>
                                                            {reg.customField.startsWith('@') ? reg.customField : `@${reg.customField}`}
                                                        </span>
                                                    )}
                                                    {reg.notes && (
                                                        <span className="text-[11px] text-slate-400 line-clamp-1">
                                                            Obs: {reg.notes}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-slate-300">{reg.userEmail}</span>
                                                    {reg.userPhone && (
                                                        <span className="text-[11px] text-slate-400">{reg.userPhone}</span>
                                                    )}
                                                    {reg.gender && (
                                                        <span className="text-[11px] text-slate-400">Gênero: {reg.gender}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-slate-300">{regDateStr}</span>
                                                    <span className="text-[11px] text-slate-400">{regTimeStr}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">
                                                <span
                                                    className={
                                                        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium " +
                                                        (reg.status === "CONFIRMED"
                                                            ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40"
                                                            : reg.status === "PENDING"
                                                                ? "bg-yellow-500/10 text-yellow-300 border border-yellow-500/40"
                                                                : "bg-red-500/10 text-red-300 border border-red-500/40")
                                                    }
                                                >
                                                    {reg.status === "CONFIRMED"
                                                        ? "Confirmado"
                                                        : reg.status === "PENDING"
                                                            ? "Pendente"
                                                            : "Cancelado"}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3">
                                                {reg.payment ? (
                                                    <span
                                                        className={
                                                            "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium " +
                                                            (reg.payment.status === "APPROVED"
                                                                ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40"
                                                                : reg.payment.status === "PENDING"
                                                                    ? "bg-yellow-500/10 text-yellow-300 border border-yellow-500/40"
                                                                    : "bg-red-500/10 text-red-300 border border-red-500/40")
                                                        }
                                                    >
                                                        {reg.payment.status === "APPROVED"
                                                            ? "Aprovado"
                                                            : reg.payment.status === "PENDING"
                                                                ? "Pendente"
                                                                : "Rejeitado"}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-500 text-[11px]">Sem pagamento</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-3 text-slate-300">
                                                {reg.payment
                                                    ? `R$ ${Number(reg.payment.amount).toFixed(2).replace(".", ",")}`
                                                    : "-"}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
