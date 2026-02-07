"use client";

import { FormEvent, Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function AdminLoginStandalonePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Credenciais inválidas ou usuário não autorizado.");
      return;
    }

    router.push(callbackUrl);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-4xl rounded-3xl border border-slate-800 bg-slate-950/70 shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* Coluna esquerda: formulário */}
        <section className="w-full md:w-1/2 px-6 py-7 md:px-8 md:py-10 border-b md:border-b-0 md:border-r border-slate-800/70">
          <div className="mb-6">
            <p className="inline-flex items-center rounded-full bg-slate-900/70 border border-slate-800 px-3 py-1 text-[11px] uppercase tracking-wide text-slate-400 mb-2">
              Acesso restrito
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">Login do administrador</h1>
            <p className="text-xs text-slate-400 mt-1">
              Use o e-mail e senha cadastrados como administrador para acessar o painel interno.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs mb-1 text-slate-300">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 placeholder:text-slate-600"
                placeholder="seu-email@dominio.com"
              />
            </div>
            <div>
              <label className="block text-xs mb-1 text-slate-300">Senha</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 placeholder:text-slate-600"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/5 border border-red-500/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 rounded-full bg-sky-500 hover:bg-sky-400 disabled:opacity-60 disabled:cursor-not-allowed px-4 py-2 text-sm font-medium text-slate-950 transition"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="mt-4 text-[11px] text-slate-500">
            Por segurança, o acesso é exclusivo para o administrador responsável pelos agendamentos.
          </p>
        </section>

        {/* Coluna direita: destaque/branding */}
        <section className="hidden md:flex w-1/2 flex-col justify-between bg-gradient-to-br from-sky-600/20 via-slate-900 to-slate-950 px-8 py-10">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-sky-300 mb-3">
              Painel de agendamentos
            </p>
            <h2 className="text-xl font-semibold mb-2">
              Controle total da sua agenda em um só lugar.
            </h2>
            <p className="text-xs text-slate-200 max-w-sm">
              Visualize horários confirmados, gerencie serviços, workshops, depoimentos e acompanhe os pagamentos em
              poucos cliques.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 text-[11px] text-slate-200">
            <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-3">
              <p className="font-medium mb-1">Agendamentos</p>
              <p className="text-slate-200/80">Resumo dos atendimentos do dia e da semana.</p>
            </div>
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-3">
              <p className="font-medium mb-1">Pagamentos</p>
              <p className="text-slate-200/80">Acompanhe o status das cobranças via Mercado Pago.</p>
            </div>
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-3">
              <p className="font-medium mb-1">Workshops</p>
              <p className="text-slate-200/80">Organize turmas, vagas restantes e próximos eventos.</p>
            </div>
            <div className="rounded-xl border border-slate-500/40 bg-slate-900/60 px-3 py-3">
              <p className="font-medium mb-1">Experiência</p>
              <p className="text-slate-200/80">Interface pensada para o dia a dia do administrador.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function AdminLoginStandalonePage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginStandalonePageInner />
    </Suspense>
  );
}
