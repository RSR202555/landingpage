import { apiGet } from "@/lib/api";

interface Service {
  id: number;
  name: string;
  description: string | null;
  durationMin: number;
  basePrice: string;
  type: string;
}

interface AdminSettings {
  heroSubtitle: string;
  aboutMe: string | null;
}

export default async function ServicesPage() {
  const [services, settings] = await Promise.all([
    apiGet<Service[]>("/api/services"),
    apiGet<AdminSettings>("/api/admin/settings").catch(() => null),
  ]);

  const introSubtitle = settings?.heroSubtitle || "Passo 1 · Escolha seu atendimento";
  const introText =
    settings?.aboutMe ||
    "Encontre o serviço ideal para o seu momento. Na próxima etapa você escolhe data e horário e finaliza o pagamento com total segurança pelo Mercado Pago.";

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 px-6 py-10">
      <header className="max-w-3xl mb-8">
        <p className="inline-flex items-center rounded-full bg-slate-900/70 border border-slate-800 px-3 py-1 text-[11px] uppercase tracking-wide text-slate-400 mb-3">
          {introSubtitle}
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold mb-2 tracking-tight">Serviços e experiências</h1>
        <p className="text-slate-300 text-sm md:text-base">{introText}</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <div
            key={service.id}
            className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 flex flex-col justify-between gap-4 shadow-sm hover:border-sky-500/60 hover:shadow-[0_0_30px_rgba(56,189,248,0.15)] transition"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h2 className="text-base md:text-lg font-semibold leading-snug">{service.name}</h2>
                <span className="text-[10px] rounded-full bg-slate-950/80 border border-slate-700 px-2 py-0.5 uppercase tracking-wide text-slate-400">
                  {service.type === "INDIVIDUAL" ? "Individual" : service.type === "GROUP" ? "Grupo" : service.type}
                </span>
              </div>
              {service.description && (
                <p className="text-slate-300 text-xs md:text-sm mb-3 line-clamp-3">{service.description}</p>
              )}
              <div className="flex items-end justify-between mt-2">
                <div>
                  <p className="text-slate-400 text-[11px] uppercase tracking-wide mb-1">
                    Duração aproximada
                  </p>
                  <p className="text-sm font-medium text-slate-100">{service.durationMin} minutos</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-slate-400 uppercase tracking-wide">Investimento</p>
                  <p className="text-lg md:text-xl font-semibold text-sky-400">
                    R$ {Number(service.basePrice).toFixed(2).replace(".", ",")}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <a
                href={`/booking?serviceId=${service.id}`}
                className="px-4 py-2 rounded-full bg-sky-500 hover:bg-sky-400 text-xs md:text-sm font-medium text-slate-950 shadow-sm"
              >
                Agendar
              </a>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
