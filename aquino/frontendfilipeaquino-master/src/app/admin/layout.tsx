import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  let session;
  try {
    session = await getServerSession(authOptions);
  } catch {
    redirect("/admin-login");
  }

  // protege rota admin: só ADMIN
  if (!session || (session.user as any)?.role !== "ADMIN") {
    redirect("/admin-login");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      <aside className="hidden md:flex w-60 flex-col border-r border-slate-800 bg-slate-950/80 px-4 py-6 gap-4">
        <div className="font-semibold tracking-tight text-sm mb-4">Painel administrativo</div>
        <nav className="flex flex-col gap-2 text-sm text-slate-300">
          <a href="/admin" className="hover:text-sky-400">Agenda semanal</a>
          <a href="/admin/services" className="hover:text-sky-400">Serviços</a>
          <a href="/admin/plans" className="hover:text-sky-400">Planos</a>
          <a href="/admin/workshops" className="hover:text-sky-400">Workshops</a>
          <a href="/admin/testimonials" className="hover:text-sky-400">Depoimentos</a>
          <a href="/admin/settings" className="hover:text-sky-400">Configurações</a>
        </nav>
      </aside>
      <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  );
}
