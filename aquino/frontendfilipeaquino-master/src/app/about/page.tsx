import { apiGet } from "@/lib/api";

interface AdminSettings {
  siteTitle: string;
  aboutMe: string | null;
  avatarUrl: string | null;
}

export default async function AboutPage() {
  let settings: AdminSettings | null = null;

  try {
    settings = await apiGet<AdminSettings>("/api/admin/settings");
  } catch {
    settings = null;
  }

  const title = settings?.siteTitle || "Sobre mim";
  const aboutMeText =
    settings?.aboutMe ||
    "Este é o espaço para você contar um pouco mais sobre seu trabalho, sua forma de ensinar e o que os alunos podem esperar das aulas e workshops.";
  const avatarUrl = settings?.avatarUrl || null;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 px-6 py-10 flex justify-center">
      <div className="w-full max-w-4xl">
        <header className="mb-6">
          <p className="inline-flex items-center rounded-full bg-slate-900/70 border border-slate-800 px-3 py-1 text-[11px] uppercase tracking-wide text-slate-400 mb-3">
            Sobre mim
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold mb-2 tracking-tight">{title}</h1>
          <p className="text-xs md:text-sm text-slate-400 max-w-2xl">
            Texto e foto desta página podem ser configurados pelo painel administrativo em Configurações gerais.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 md:p-6 flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          <div className="flex-shrink-0 flex justify-center md:justify-start w-full md:w-auto">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={title}
                className="h-32 w-32 md:h-40 md:w-40 rounded-full object-cover border border-slate-700 shadow-lg shadow-sky-500/15"
              />
            ) : (
              <div className="h-32 w-32 md:h-40 md:w-40 rounded-full bg-gradient-to-tr from-sky-500 to-emerald-400 border border-slate-700 shadow-lg shadow-sky-500/20" />
            )}
          </div>

          <div className="flex-1 text-sm md:text-base text-slate-200 whitespace-pre-line">
            {aboutMeText}
          </div>
        </section>
      </div>
    </main>
  );
}
