"use client";

import { useEffect, useState, FormEvent } from "react";
import { apiGet, apiPost } from "@/lib/api";

interface Service {
  id: number;
  name: string;
  description: string | null;
  durationMin: number;
  basePrice: string;
  type: string;
  active: boolean;
}

interface Availability {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [editing, setEditing] = useState<Partial<Service> | null>(null);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loadingAvail, setLoadingAvail] = useState(false);
  const [newAvailDate, setNewAvailDate] = useState("");
  const [newAvailStart, setNewAvailStart] = useState("");
  const [newAvailEnd, setNewAvailEnd] = useState("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<Service[]>("/api/services/admin");
      setServices(data);
    } catch (e) {
      setError("Erro ao carregar serviços.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(service?: Service) {
    if (service) {
      setEditing({ ...service });
    } else {
      setEditing({
        id: 0,
        name: "",
        description: "",
        durationMin: 60,
        basePrice: "0",
        type: "AULA_INDIVIDUAL",
        active: true,
      });
    }
    setSuccess(false);
    setError(null);

    // ao abrir edição, se já existe serviço, carrega disponibilidades
    if (service) {
      loadAvailabilities(service.id);
    } else {
      setAvailabilities([]);
    }
  }

  async function loadAvailabilities(serviceId: number) {
    setLoadingAvail(true);
    try {
      const data = await apiGet<Availability[]>(`/api/availabilities/admin?serviceId=${serviceId}`);
      // normaliza datas/horas para strings simples
      const normalized = data.map((a) => {
        const rawDate = String(a.date);
        const rawStart = String(a.startTime);
        const rawEnd = String(a.endTime);

        const datePart = rawDate.split('T')[0] || rawDate; // YYYY-MM-DD
        const startPart = rawStart.split('T')[1]?.slice(0, 5) || rawStart.slice(11, 16) || rawStart;
        const endPart = rawEnd.split('T')[1]?.slice(0, 5) || rawEnd.slice(11, 16) || rawEnd;
        return {
          ...a,
          date: datePart,
          startTime: startPart,
          endTime: endPart,
        };
      });
      setAvailabilities(normalized);
    } catch (e) {
      // mantém silencioso por enquanto
    } finally {
      setLoadingAvail(false);
    }
  }

  async function handleAddAvailability(serviceId: number) {
    if (!newAvailDate || !newAvailStart || !newAvailEnd) {
      setError("Para adicionar um horário, preencha data, hora inicial e hora final.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await apiPost("/api/availabilities/admin/create", {
        serviceId,
        date: newAvailDate,
        startTime: newAvailStart,
        endTime: newAvailEnd,
      });

      setNewAvailDate("");
      setNewAvailStart("");
      setNewAvailEnd("");
      await loadAvailabilities(serviceId);
    } catch (e) {
      setError("Erro ao adicionar horário. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAvailability(serviceId: number, availabilityId: number) {
    const confirmDelete = window.confirm("Remover este horário disponível?");
    if (!confirmDelete) return;

    setSaving(true);
    setError(null);
    try {
      await apiPost("/api/availabilities/admin/delete", { id: availabilityId });
      await loadAvailabilities(serviceId);
    } catch (e) {
      setError("Erro ao remover horário. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        name: editing.name,
        description: editing.description,
        durationMin: Number(editing.durationMin || 0),
        basePrice: Number(editing.basePrice || 0),
        type: editing.type,
        active: editing.active,
      };

      if (editing.id && editing.id !== 0) {
        await apiPost<Service>(`/api/services/admin/update`, {
          id: editing.id,
          ...payload,
        });
      } else {
        await apiPost<Service>("/api/services/admin/create", payload);
      }

      setSuccess(true);
      setEditing(null);
      await load();
    } catch (e) {
      setError("Erro ao salvar serviço. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(service: Service) {
    const confirmDelete = window.confirm(
      `Tem certeza que deseja excluir o serviço "${service.name}"? Essa ação não poderá ser desfeita.`
    );
    if (!confirmDelete) return;

    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await apiPost("/api/services/admin/delete", { id: service.id });
      await load();
      setSuccess(true);
    } catch (e) {
      setError("Erro ao excluir serviço. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(service: Service) {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await apiPost<Service>("/api/services/admin/update", {
        id: service.id,
        name: service.name,
        description: service.description,
        durationMin: service.durationMin,
        basePrice: Number(service.basePrice),
        type: service.type,
        active: !service.active,
      });
      await load();
    } catch (e) {
      setError("Erro ao atualizar serviço.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="inline-flex items-center rounded-full bg-slate-900/70 border border-slate-800 px-3 py-1 text-[11px] uppercase tracking-wide text-slate-400 mb-2">
            Serviços
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Gerenciar serviços</h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl">
            Os serviços cadastrados aqui aparecem na página pública de serviços/planos. Você pode criar novos, editar
            valores e ativar ou desativar quando não quiser mais exibir um serviço.
          </p>
        </div>
        <div className="flex gap-2 mt-2 md:mt-0 text-xs">
          <button
            type="button"
            onClick={() => startEdit()}
            className="rounded-full bg-sky-500 px-3 py-1.5 font-medium text-slate-950 hover:bg-sky-400 transition"
          >
            Novo serviço
          </button>
        </div>
      </header>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 md:p-5 text-sm text-slate-300 space-y-4">
        {loading && <p className="text-xs text-slate-400">Carregando serviços...</p>}
        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/40 rounded-lg px-3 py-2">{error}</p>
        )}
        {success && !error && (
          <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/40 rounded-lg px-3 py-2">
            Serviço salvo com sucesso.
          </p>
        )}

        <div className="overflow-x-auto text-xs md:text-sm">
          <table className="min-w-full border border-slate-800 rounded-xl overflow-hidden">
            <thead className="bg-slate-900/80">
              <tr className="text-left text-slate-400">
                <th className="px-3 py-2 border-b border-slate-800">Nome</th>
                <th className="px-3 py-2 border-b border-slate-800">Tipo</th>
                <th className="px-3 py-2 border-b border-slate-800">Duração</th>
                <th className="px-3 py-2 border-b border-slate-800">Preço</th>
                <th className="px-3 py-2 border-b border-slate-800">Ativo</th>
                <th className="px-3 py-2 border-b border-slate-800 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id} className="border-t border-slate-800/80">
                  <td className="px-3 py-2">{service.name}</td>
                  <td className="px-3 py-2">{service.type}</td>
                  <td className="px-3 py-2">{service.durationMin} min</td>
                  <td className="px-3 py-2">
                    R$ {Number(service.basePrice).toFixed(2).replace(".", ",")}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium " +
                        (service.active
                          ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40"
                          : "bg-slate-800/60 text-slate-400 border border-slate-700")
                      }
                    >
                      {service.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => startEdit(service)}
                      className="text-xs px-2 py-1 rounded-full border border-slate-700 hover:border-sky-500 hover:text-sky-300"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleActive(service)}
                      className="text-xs px-2 py-1 rounded-full border border-slate-700 hover:border-amber-500 hover:text-amber-300"
                    >
                      {service.active ? "Desativar" : "Ativar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(service)}
                      className="text-xs px-2 py-1 rounded-full border border-red-700 hover:border-red-500 hover:text-red-300"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && services.length === 0 && (
                <tr>
                  <td className="px-3 py-4 text-center text-slate-500" colSpan={6}>
                    Nenhum serviço cadastrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 md:p-5 text-xs md:text-sm space-y-4"
        >
          <h2 className="text-sm font-medium text-slate-100 mb-1">
            {editing.id && editing.id !== 0 ? "Editar serviço" : "Novo serviço"}
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1 md:col-span-2">
              <label className="block text-xs text-slate-400" htmlFor="name">
                Nome do serviço
              </label>
              <input
                id="name"
                value={editing.name || ""}
                onChange={(e) => setEditing((s) => (s ? { ...s, name: e.target.value } : s))}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="block text-xs text-slate-400" htmlFor="description">
                Descrição
              </label>
              <textarea
                id="description"
                value={editing.description || ""}
                onChange={(e) =>
                  setEditing((s) => (s ? { ...s, description: e.target.value } : s))
                }
                className="w-full min-h-[80px] rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs text-slate-400" htmlFor="durationMin">
                Duração (minutos)
              </label>
              <input
                id="durationMin"
                type="number"
                min={1}
                value={editing.durationMin ?? 60}
                onChange={(e) =>
                  setEditing((s) =>
                    s ? { ...s, durationMin: Number(e.target.value || 0) } : s
                  )
                }
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs text-slate-400" htmlFor="basePrice">
                Preço (R$)
              </label>
              <input
                id="basePrice"
                type="number"
                min={0}
                step="0.01"
                value={editing.basePrice ?? "0"}
                onChange={(e) =>
                  setEditing((s) =>
                    s ? { ...s, basePrice: e.target.value as any } : s
                  )
                }
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs text-slate-400" htmlFor="type">
                Tipo
              </label>
              <select
                id="type"
                value={editing.type || "AULA_INDIVIDUAL"}
                onChange={(e) =>
                  setEditing((s) => (s ? { ...s, type: e.target.value } : s))
                }
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              >
                <option value="AULA_INDIVIDUAL">Aula individual</option>
                <option value="AULA_DUPLA">Aula em dupla</option>
                <option value="AVALIACAO_FISICA">Avaliação física</option>
                <option value="CONSULTA_TECNICA">Consulta técnica</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-4">
              <input
                id="active"
                type="checkbox"
                checked={editing.active ?? true}
                onChange={(e) =>
                  setEditing((s) => (s ? { ...s, active: e.target.checked } : s))
                }
                className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-sky-500"
              />
              <label htmlFor="active" className="text-xs text-slate-300">
                Ativo (aparece na página pública de serviços)
              </label>
            </div>
          </div>

          {editing.id && editing.id !== 0 && (
            <div className="mt-4 border-t border-slate-800 pt-4 space-y-3">
              <h3 className="text-sm font-medium text-slate-100">Horários disponíveis para este serviço</h3>
              <p className="text-[11px] text-slate-500">
                Cadastre datas e horários em que este serviço pode ser agendado. Em breve esses horários poderão ser usados automaticamente na página de agendamento.
              </p>

              <div className="space-y-2">
                {loadingAvail ? (
                  <p className="text-[11px] text-slate-400">Carregando horários...</p>
                ) : availabilities.length === 0 ? (
                  <p className="text-[11px] text-slate-500">Nenhum horário cadastrado ainda para este serviço.</p>
                ) : (
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 divide-y divide-slate-800">
                    {availabilities.map((a) => {
                      const d = new Date(a.date + 'T00:00:00');
                      const dateLabel = d.toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      });
                      return (
                        <div key={a.id} className="flex items-center justify-between px-3 py-2 text-[11px]">
                          <span className="text-slate-300">
                            {dateLabel} · {a.startTime} - {a.endTime}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteAvailability(editing.id as number, a.id)}
                            className="text-[10px] px-2 py-1 rounded-full border border-red-700 hover:border-red-500 hover:text-red-300"
                          >
                            Remover
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid gap-2 md:grid-cols-4 items-end">
                <div className="space-y-1">
                  <label className="block text-xs text-slate-400" htmlFor="availDate">
                    Data
                  </label>
                  <input
                    id="availDate"
                    type="date"
                    value={newAvailDate}
                    onChange={(e) => setNewAvailDate(e.target.value)}
                    className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs text-slate-400" htmlFor="availStart">
                    Hora inicial
                  </label>
                  <input
                    id="availStart"
                    type="time"
                    value={newAvailStart}
                    onChange={(e) => setNewAvailStart(e.target.value)}
                    className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs text-slate-400" htmlFor="availEnd">
                    Hora final
                  </label>
                  <input
                    id="availEnd"
                    type="time"
                    value={newAvailEnd}
                    onChange={(e) => setNewAvailEnd(e.target.value)}
                    className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
                <div className="flex justify-end md:justify-start">
                  <button
                    type="button"
                    onClick={() => handleAddAvailability(editing.id as number)}
                    className="mt-1 rounded-full bg-sky-500 px-4 py-2 text-xs font-medium text-slate-950 hover:bg-sky-400 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Adicionar horário
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-full border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:border-slate-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-sky-500 px-4 py-2 text-xs font-medium text-slate-950 hover:bg-sky-400 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Salvando..." : "Salvar serviço"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
