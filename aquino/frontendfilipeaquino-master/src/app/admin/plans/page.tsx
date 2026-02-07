"use client";

import { useEffect, useState, FormEvent } from "react";
import { apiGet, apiPost } from "@/lib/api";

interface Plan {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  price: string | number;
  features: string | null;
  active: boolean;
}

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [editing, setEditing] = useState<Partial<Plan> | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<Plan[]>("/api/plans/admin");
      setPlans(data);
    } catch (e) {
      setError("Erro ao carregar planos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(plan?: Plan) {
    if (plan) {
      setEditing({ ...plan });
    } else {
      setEditing({
        id: 0,
        slug: "",
        name: "",
        description: "",
        price: "0",
        features: "",
        active: true,
      });
    }
    setSuccess(false);
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        slug: (editing.slug || "").trim(),
        name: editing.name,
        description: editing.description,
        price: Number(editing.price || 0),
        features: editing.features,
        active: editing.active,
      };

      if (!payload.slug) {
        setError("Slug é obrigatório (ex: basico, intermediario, anual).");
        setSaving(false);
        return;
      }

      if (editing.id && editing.id !== 0) {
        await apiPost<Plan>("/api/plans/admin/update", {
          id: editing.id,
          ...payload,
        });
      } else {
        await apiPost<Plan>("/api/plans/admin/create", payload);
      }

      setSuccess(true);
      setEditing(null);
      await load();
    } catch (e: any) {
      setError(e?.message || "Erro ao salvar plano. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(plan: Plan) {
    const confirmDelete = window.confirm(
      `Tem certeza que deseja excluir o plano "${plan.name}"? Essa ação não poderá ser desfeita.`
    );
    if (!confirmDelete) return;

    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await apiPost("/api/plans/admin/delete", { id: plan.id });
      await load();
      setSuccess(true);
    } catch (e) {
      setError("Erro ao excluir plano. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(plan: Plan) {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await apiPost<Plan>("/api/plans/admin/update", {
        id: plan.id,
        slug: plan.slug,
        name: plan.name,
        description: plan.description,
        price: Number(plan.price),
        features: plan.features,
        active: !plan.active,
      });
      await load();
    } catch (e) {
      setError("Erro ao atualizar plano.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="inline-flex items-center rounded-full bg-slate-900/70 border border-slate-800 px-3 py-1 text-[11px] uppercase tracking-wide text-slate-400 mb-2">
            Planos
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Gerenciar planos da landing</h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl">
            Os planos cadastrados aqui serão exibidos na landing page e usados no checkout. Você pode ajustar nomes,
            preços, descrições e benefícios sem precisar editar código.
          </p>
        </div>
        <div className="flex gap-2 mt-2 md:mt-0 text-xs">
          <button
            type="button"
            onClick={() => startEdit()}
            className="rounded-full bg-sky-500 px-3 py-1.5 font-medium text-slate-950 hover:bg-sky-400 transition"
          >
            Novo plano
          </button>
        </div>
      </header>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 md:p-5 text-sm text-slate-300 space-y-4">
        {loading && <p className="text-xs text-slate-400">Carregando planos...</p>}
        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/40 rounded-lg px-3 py-2">{error}</p>
        )}
        {success && !error && (
          <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/40 rounded-lg px-3 py-2">
            Plano salvo com sucesso.
          </p>
        )}

        <div className="overflow-x-auto text-xs md:text-sm">
          <table className="min-w-full border border-slate-800 rounded-xl overflow-hidden">
            <thead className="bg-slate-900/80">
              <tr className="text-left text-slate-400">
                <th className="px-3 py-2 border-b border-slate-800">Nome</th>
                <th className="px-3 py-2 border-b border-slate-800">Slug</th>
                <th className="px-3 py-2 border-b border-slate-800">Preço</th>
                <th className="px-3 py-2 border-b border-slate-800">Ativo</th>
                <th className="px-3 py-2 border-b border-slate-800 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id} className="border-t border-slate-800/80">
                  <td className="px-3 py-2">{plan.name}</td>
                  <td className="px-3 py-2 text-slate-400">{plan.slug}</td>
                  <td className="px-3 py-2">
                    R$ {Number(plan.price).toFixed(2).replace(".", ",")}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium " +
                        (plan.active
                          ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40"
                          : "bg-slate-800/60 text-slate-400 border border-slate-700")
                      }
                    >
                      {plan.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => startEdit(plan)}
                      className="text-xs px-2 py-1 rounded-full border border-slate-700 hover:border-sky-500 hover:text-sky-300"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleActive(plan)}
                      className="text-xs px-2 py-1 rounded-full border border-slate-700 hover:border-amber-500 hover:text-amber-300"
                    >
                      {plan.active ? "Desativar" : "Ativar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(plan)}
                      className="text-xs px-2 py-1 rounded-full border border-red-700 hover:border-red-500 hover:text-red-300"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && plans.length === 0 && (
                <tr>
                  <td className="px-3 py-4 text-center text-slate-500" colSpan={5}>
                    Nenhum plano cadastrado ainda.
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
            {editing.id && editing.id !== 0 ? "Editar plano" : "Novo plano"}
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-xs text-slate-400" htmlFor="name">
                Nome do plano
              </label>
              <input
                id="name"
                value={editing.name || ""}
                onChange={(e) => setEditing((s) => (s ? { ...s, name: e.target.value } : s))}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs text-slate-400" htmlFor="slug">
                Slug (identificador)
              </label>
              <input
                id="slug"
                value={editing.slug || ""}
                onChange={(e) =>
                  setEditing((s) => (s ? { ...s, slug: e.target.value.toLowerCase() } : s))
                }
                placeholder="ex.: basico, intermediario, anual"
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
              <label className="block text-xs text-slate-400" htmlFor="price">
                Preço (R$)
              </label>
              <input
                id="price"
                type="number"
                min={0}
                step={0.01}
                value={editing.price ?? "0"}
                onChange={(e) =>
                  setEditing((s) => (s ? { ...s, price: e.target.value as any } : s))
                }
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="block text-xs text-slate-400" htmlFor="features">
                Benefícios / Features (um por linha)
              </label>
              <textarea
                id="features"
                value={editing.features || ""}
                onChange={(e) =>
                  setEditing((s) => (s ? { ...s, features: e.target.value } : s))
                }
                placeholder={"Ex.:\n2 sessões mensais\nSuporte via WhatsApp"}
                className="w-full min-h-[80px] rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-2 md:col-span-2">
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
                Ativo (aparece na landing page)
              </label>
            </div>
          </div>

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
              {saving ? "Salvando..." : "Salvar plano"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
