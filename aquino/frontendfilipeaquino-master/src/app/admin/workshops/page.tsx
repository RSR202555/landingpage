"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiDelete, apiPatch } from "@/lib/api";

interface AdminWorkshop {
  id: number;
  title: string;
  description: string | null;
  date: string;
  durationMin: number;
  maxSeats: number;
  price: string;
  active: boolean;
  remainingSeats: number;
  confirmedBookings: number;
  imageUrl?: string | null;
}

export default function AdminWorkshopsPage() {
  const [workshops, setWorkshops] = useState<AdminWorkshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState<AdminWorkshop | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function loadWorkshops() {
    try {
      setLoading(true);
      const res = await fetch(`/api/workshops/admin/all`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Erro ao carregar workshops');
      const data = await res.json();
      setWorkshops(data);
    } catch (e) {
      console.error(e);
      setError('Erro ao carregar workshops');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWorkshops();
  }, []);

  async function handleDelete(id: number) {
    if (!confirm('Tem certeza que deseja deletar este workshop? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await apiDelete(`/api/workshops/admin/${id}`);
      await loadWorkshops();
    } catch (e: any) {
      alert(e.message || 'Erro ao deletar workshop');
    }
  }

  async function handleToggle(id: number) {
    try {
      await apiPatch(`/api/workshops/admin/${id}/toggle`);
      await loadWorkshops();
    } catch (e: any) {
      alert(e.message || 'Erro ao alterar status');
    }
  }

  function handleEdit(workshop: AdminWorkshop) {
    setEditingWorkshop(workshop);
  }

  function closeModals() {
    setShowCreateModal(false);
    setEditingWorkshop(null);
  }

  async function handleSuccess() {
    closeModals();
    await loadWorkshops();
  }

  function handleViewRegistrations(id: number) {
    router.push(`/admin/workshops/${id}/registrations`);
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="inline-flex items-center rounded-full bg-slate-900/70 border border-slate-800 px-3 py-1 text-[11px] uppercase tracking-wide text-slate-400 mb-2">
            Workshops
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Workshops e eventos</h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl">
            Gerencie workshops, crie novos eventos, edite informações e controle vagas disponíveis.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="rounded-full bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-sky-400 transition self-start md:self-auto"
        >
          + Novo Workshop
        </button>
      </header>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 md:p-5 text-sm text-slate-300 space-y-4">
        {loading ? (
          <p className="text-center text-slate-500 py-8">Carregando workshops...</p>
        ) : (
          <div className="overflow-x-auto text-xs md:text-sm">
            <table className="min-w-full border border-slate-800 rounded-xl overflow-hidden">
              <thead className="bg-slate-900/80">
                <tr className="text-left text-slate-400">
                  <th className="px-3 py-2 border-b border-slate-800">Título</th>
                  <th className="px-3 py-2 border-b border-slate-800">Data</th>
                  <th className="px-3 py-2 border-b border-slate-800">Duração</th>
                  <th className="px-3 py-2 border-b border-slate-800">Vagas</th>
                  <th className="px-3 py-2 border-b border-slate-800">Preço</th>
                  <th className="px-3 py-2 border-b border-slate-800">Status</th>
                  <th className="px-3 py-2 border-b border-slate-800">Ações</th>
                </tr>
              </thead>
              <tbody>
                {workshops.map((w) => {
                  const date = new Date(w.date);
                  const dateStr = date.toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  });
                  const timeStr = date.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr key={w.id} className="border-t border-slate-800/80">
                      <td className="px-3 py-2">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-slate-100">{w.title}</span>
                          {w.description && (
                            <span className="text-[11px] text-slate-400 line-clamp-2">{w.description}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-slate-300">
                        <div className="flex flex-col gap-0.5">
                          <span>{dateStr}</span>
                          <span className="text-[11px] text-slate-400">{timeStr}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">{w.durationMin} min</td>
                      <td className="px-3 py-2">
                        <span className="text-slate-100 text-xs">
                          {w.remainingSeats} / {w.maxSeats} vagas
                        </span>
                        <br />
                        <span className="text-[11px] text-slate-400">
                          {w.confirmedBookings} confirmados
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        R$ {Number(w.price).toFixed(2).replace(".", ",")}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={
                            "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium " +
                            (w.active
                              ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40"
                              : "bg-slate-800/60 text-slate-400 border border-slate-700")
                          }
                        >
                          {w.active ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => handleViewRegistrations(w.id)}
                            className="text-xs px-2 py-1 rounded bg-sky-800 hover:bg-sky-700 text-sky-100 transition"
                          >
                            Ver Inscritos
                          </button>
                          <button
                            onClick={() => handleEdit(w)}
                            className="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleToggle(w.id)}
                            className="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                          >
                            {w.active ? "Desativar" : "Ativar"}
                          </button>
                          <button
                            onClick={() => handleDelete(w.id)}
                            className="text-xs px-2 py-1 rounded bg-red-900/30 hover:bg-red-900/50 text-red-300 transition"
                          >
                            Deletar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {workshops.length === 0 && (
                  <tr>
                    <td className="px-3 py-4 text-center text-slate-500" colSpan={7}>
                      Nenhum workshop cadastrado ou ativo no momento.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreateModal && (
        <WorkshopModal
          onClose={closeModals}
          onSuccess={handleSuccess}
        />
      )}

      {editingWorkshop && (
        <WorkshopModal
          workshop={editingWorkshop}
          onClose={closeModals}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}

interface WorkshopModalProps {
  workshop?: AdminWorkshop;
  onClose: () => void;
  onSuccess: () => void;
}

function WorkshopModal({ workshop, onClose, onSuccess }: WorkshopModalProps) {
  const isEdit = !!workshop;

  const [title, setTitle] = useState(workshop?.title || "");
  const [description, setDescription] = useState(workshop?.description || "");
  const [dateOnly, setDateOnly] = useState(() => {
    if (!workshop) return "";
    const d = new Date(workshop.date);
    return d.toISOString().slice(0, 10); // yyyy-mm-dd
  });
  const [startTime, setStartTime] = useState(() => {
    if (!workshop) return "";
    const d = new Date(workshop.date);
    return d.toTimeString().slice(0, 5); // HH:MM
  });
  const [endTime, setEndTime] = useState(() => {
    if (!workshop) return "";
    const start = new Date(workshop.date);
    const end = new Date(start.getTime() + workshop.durationMin * 60000);
    return end.toTimeString().slice(0, 5);
  });
  const [durationMin, setDurationMin] = useState(workshop?.durationMin || 240);
  const [maxSeats, setMaxSeats] = useState(workshop?.maxSeats || 10);
  const [price, setPrice] = useState(workshop?.price || "0");
  const [imageUrl, setImageUrl] = useState(workshop?.imageUrl || "");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`/api/admin/upload-workshop-image`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Erro ao fazer upload");

      const data = await res.json();
      setImageUrl(data.imageUrl);
    } catch (e) {
      alert("Erro ao fazer upload da imagem");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title || !dateOnly || !startTime || !endTime || !price) {
      setError("Título, data, horários e preço são obrigatórios");
      return;
    }

    // Monta Date de início/fim a partir da data e horários
    const startIso = `${dateOnly}T${startTime}:00`;
    const endIso = `${dateOnly}T${endTime}:00`;

    const startDate = new Date(startIso);
    const endDate = new Date(endIso);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      setError("Horários inválidos. Verifique os campos de hora inicial e final.");
      return;
    }

    if (endDate <= startDate) {
      setError("Hora de término deve ser depois da hora inicial.");
      return;
    }

    const calculatedDurationMin = Math.round(
      (endDate.getTime() - startDate.getTime()) / 60000
    );

    try {
      setLoading(true);

      const body = {
        title,
        description: description || null,
        date: startDate.toISOString(),
        durationMin: calculatedDurationMin,
        maxSeats,
        price: parseFloat(price),
        imageUrl: imageUrl || null,
      };

      const url = isEdit
        ? `${API_URL}/api/workshops/admin/${workshop.id}`
        : `${API_URL}/api/workshops/admin/create`;

      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro ao salvar workshop");
      }

      onSuccess();
    } catch (e: any) {
      setError(e.message || "Erro ao salvar workshop");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {isEdit ? "Editar Workshop" : "Novo Workshop"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs mb-1 text-slate-300">Título *</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              placeholder="Nome do workshop"
            />
          </div>

          <div>
            <label className="block text-xs mb-1 text-slate-300">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[80px] rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              placeholder="Descrição do workshop"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs mb-1 text-slate-300">Data *</label>
              <input
                type="date"
                required
                value={dateOnly}
                onChange={(e) => setDateOnly(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs mb-1 text-slate-300">Hora inicial *</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs mb-1 text-slate-300">Hora de término *</label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs mb-1 text-slate-300">Máximo de Vagas *</label>
              <input
                type="number"
                required
                min="1"
                value={maxSeats}
                onChange={(e) => setMaxSeats(parseInt(e.target.value))}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs mb-1 text-slate-300">Preço (R$) *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs mb-1 text-slate-300">Imagem</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
            {uploading && <p className="text-xs text-slate-400 mt-1">Enviando imagem...</p>}
            {imageUrl && (
              <div className="mt-2">
                <img
                  src={`${API_URL}${imageUrl}`}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded-lg border border-slate-700"
                />
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-xs text-red-400">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm font-medium hover:border-slate-600 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex-1 rounded-full bg-sky-500 hover:bg-sky-400 disabled:opacity-60 disabled:cursor-not-allowed px-4 py-2 text-sm font-medium text-slate-950 transition"
            >
              {loading ? "Salvando..." : isEdit ? "Atualizar" : "Criar Workshop"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
