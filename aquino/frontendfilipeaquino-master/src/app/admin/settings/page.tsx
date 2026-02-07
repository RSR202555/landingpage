"use client";

import { useEffect, useState, FormEvent } from "react";
import { apiGet, apiPost } from "@/lib/api";

interface AdminSettings {
  id: number;
  siteTitle: string;
  contactEmail: string | null;
  contactPhone: string | null;
  cancellationPolicy: string | null;
  heroTitle: string;
  heroSubtitle: string;
  aboutMe: string | null;
  workshopsIntroText: string | null;
  workshopsEmptyText: string | null;
  avatarUrl: string | null;
}

export default function AdminSettingsPage() {
  const [values, setValues] = useState({
    siteTitle: "Agenda de Aulas",
    contactEmail: "",
    contactPhone: "",
    cancellationPolicy: "",
    heroTitle: "Organize sua agenda sem perder nenhum horário.",
    heroSubtitle: "Aulas práticas • Avaliação física • Workshops",
    aboutMe:
      "Plataforma de agendamentos pensada para o estúdio do Filipe Aquino. Seus alunos escolhem o serviço, horário ideal e pagam online via Mercado Pago (Pix ou cartão), enquanto você foca no que importa: o treino.",
    workshopsIntroText:
      "Veja os workshops disponíveis, datas e investimentos. Escolha o evento ideal para você e faça sua inscrição online.",
    workshopsEmptyText:
      "Nenhum workshop disponível no momento. Volte em breve para ver novos eventos.",
    avatarUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const settings = await apiGet<AdminSettings>("/api/admin/settings");
        setValues({
          siteTitle: settings.siteTitle ?? "Agenda de Aulas",
          contactEmail: settings.contactEmail ?? "",
          contactPhone: settings.contactPhone ?? "",
          cancellationPolicy: settings.cancellationPolicy ?? "",
          heroTitle:
            settings.heroTitle ?? "Organize sua agenda sem perder nenhum horário.",
          heroSubtitle:
            settings.heroSubtitle ??
            "Aulas práticas • Avaliação física • Workshops",
          aboutMe:
            settings.aboutMe ??
            "Plataforma de agendamentos pensada para o estúdio do Filipe Aquino. Seus alunos escolhem o serviço, horário ideal e pagam online via Mercado Pago (Pix ou cartão), enquanto você foca no que importa: o treino.",
          workshopsIntroText:
            settings.workshopsIntroText ??
            "Veja os workshops disponíveis, datas e investimentos. Escolha o evento ideal para você e faça sua inscrição online.",
          workshopsEmptyText:
            settings.workshopsEmptyText ??
            "Nenhum workshop disponível no momento. Volte em breve para ver novos eventos.",
          avatarUrl: settings.avatarUrl ?? "",
        });
      } catch (e) {
        setError("Erro ao carregar configurações.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    try {
      setSaving(true);
      await apiPost<AdminSettings>("/api/admin/settings", values);
      setSuccess(true);
    } catch (err) {
      setError("Erro ao salvar configurações. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <header>
        <p className="inline-flex items-center rounded-full bg-slate-900/70 border border-slate-800 px-3 py-1 text-[11px] uppercase tracking-wide text-slate-400 mb-2">
          Configurações gerais
        </p>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Configurações do painel</h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl">
          Ajuste informações gerais do site, dados de contato e preferências de agenda. Estas informações são salvas no
          banco de dados e poderão ser usadas em outras partes do site.
        </p>
      </header>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 md:p-5 text-sm text-slate-300 space-y-4">
        {loading && (
          <p className="text-xs text-slate-400">Carregando configurações...</p>
        )}
        {error && !loading && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/40 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        {success && !loading && !error && (
          <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/40 rounded-lg px-3 py-2">
            Configurações salvas com sucesso.
          </p>
        )}

        <div className="space-y-1">
          <label className="block text-xs text-slate-400" htmlFor="siteTitle">
            Título do site
          </label>
          <input
            id="siteTitle"
            name="siteTitle"
            value={values.siteTitle}
            onChange={(e) => setValues((v) => ({ ...v, siteTitle: e.target.value }))}
            className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs text-slate-400" htmlFor="avatar">
            Foto (usada na página Sobre mim)
          </label>
          <div className="flex items-center gap-4">
            {values.avatarUrl && (
              <img
                src={values.avatarUrl}
                alt="Pré-visualização do avatar"
                className="h-12 w-12 rounded-full object-cover border border-slate-700"
              />
            )}
            <div className="flex flex-col gap-1 text-xs text-slate-400">
              <input
                id="avatar"
                name="avatar"
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploadingAvatar(true);
                  setError(null);
                  setSuccess(false);
                  try {
                    const formData = new FormData();
                    formData.append("avatar", file);

                    const res = await fetch(
                      `/api/admin/upload-avatar`,
                      {
                        method: "POST",
                        body: formData,
                      }
                    );

                    if (!res.ok) {
                      throw new Error("Falha no upload do avatar");
                    }
                    const data = (await res.json()) as { avatarUrl: string };
                    setValues((v) => ({ ...v, avatarUrl: data.avatarUrl }));
                    setSuccess(true);
                  } catch (err) {
                    console.error(err);
                    setError("Erro ao enviar a foto. Tente novamente.");
                  } finally {
                    setUploadingAvatar(false);
                  }
                }}
                className="block text-xs text-slate-300 file:mr-3 file:rounded-full file:border-0 file:bg-slate-800 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-slate-200 hover:file:bg-slate-700"
              />
              {uploadingAvatar && <span>Enviando foto...</span>}
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="block text-xs text-slate-400" htmlFor="contactEmail">
              E-mail de contato
            </label>
            <input
              id="contactEmail"
              name="contactEmail"
              type="email"
              value={values.contactEmail}
              onChange={(e) =>
                setValues((v) => ({ ...v, contactEmail: e.target.value }))
              }
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs text-slate-400" htmlFor="contactPhone">
              Telefone/WhatsApp de contato
            </label>
            <input
              id="contactPhone"
              name="contactPhone"
              value={values.contactPhone}
              onChange={(e) =>
                setValues((v) => ({ ...v, contactPhone: e.target.value }))
              }
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs text-slate-400" htmlFor="cancellationPolicy">
            Política de cancelamento / observações gerais
          </label>
          <textarea
            id="cancellationPolicy"
            name="cancellationPolicy"
            value={values.cancellationPolicy}
            onChange={(e) =>
              setValues((v) => ({ ...v, cancellationPolicy: e.target.value }))
            }
            className="w-full min-h-[100px] rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>

        <div className="pt-4 border-t border-slate-800 space-y-3">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Textos da página inicial</p>

          <div className="space-y-1">
            <label className="block text-xs text-slate-400" htmlFor="heroSubtitle">
              Subtítulo pequeno (acima do título principal)
            </label>
            <input
              id="heroSubtitle"
              name="heroSubtitle"
              value={values.heroSubtitle}
              onChange={(e) =>
                setValues((v) => ({ ...v, heroSubtitle: e.target.value }))
              }
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs text-slate-400" htmlFor="heroTitle">
              Título principal da página inicial
            </label>
            <input
              id="heroTitle"
              name="heroTitle"
              value={values.heroTitle}
              onChange={(e) =>
                setValues((v) => ({ ...v, heroTitle: e.target.value }))
              }
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs text-slate-400" htmlFor="aboutMe">
              Texto principal (parágrafo de apresentação)
            </label>
            <textarea
              id="aboutMe"
              name="aboutMe"
              value={values.aboutMe}
              onChange={(e) =>
                setValues((v) => ({ ...v, aboutMe: e.target.value }))
              }
              className="w-full min-h-[100px] rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 space-y-3">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Textos da página de workshops</p>

          <div className="space-y-1">
            <label className="block text-xs text-slate-400" htmlFor="workshopsIntroText">
              Texto de introdução
            </label>
            <textarea
              id="workshopsIntroText"
              name="workshopsIntroText"
              value={values.workshopsIntroText}
              onChange={(e) =>
                setValues((v) => ({ ...v, workshopsIntroText: e.target.value }))
              }
              className="w-full min-h-[80px] rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs text-slate-400" htmlFor="workshopsEmptyText">
              Texto quando não há workshops disponíveis
            </label>
            <textarea
              id="workshopsEmptyText"
              name="workshopsEmptyText"
              value={values.workshopsEmptyText}
              onChange={(e) =>
                setValues((v) => ({ ...v, workshopsEmptyText: e.target.value }))
              }
              className="w-full min-h-[80px] rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving || loading}
          className="rounded-full bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-sky-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? "Salvando..." : "Salvar configurações"}
        </button>
      </div>
    </form>
  );
}
