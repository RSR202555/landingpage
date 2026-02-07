import { prisma } from "../../../lib/prisma";
import { WorkshopCard } from "@/components/WorkshopCard";

export const dynamic = "force-dynamic";

export default async function WorkshopsPage() {
  const [workshopsRaw, settings] = await Promise.all([
    prisma.workshop.findMany({
      where: { active: true },
      orderBy: { date: "asc" },
      include: {
        bookings: { where: { status: "CONFIRMED" }, select: { id: true } },
      },
    }),
    prisma.setting.findFirst().catch(() => null),
  ]);

  const workshops = workshopsRaw.map((w) => ({
    id: w.id,
    title: w.title,
    description: w.description,
    date: w.date.toISOString(),
    durationMin: w.durationMin,
    maxSeats: w.maxSeats,
    price: String(w.price),
    active: w.active,
    imageUrl: w.imageUrl,
    remainingSeats: w.maxSeats - w.bookings.length,
  }));

  const introText =
    settings?.workshopsIntroText ||
    "Veja os workshops disponíveis, datas e investimentos. Escolha o evento ideal para você e faça sua inscrição online.";
  const emptyText =
    settings?.workshopsEmptyText ||
    "Nenhum workshop disponível no momento. Volte em breve para ver novos eventos.";

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 px-6 py-10">
      <div className="max-w-6xl mx-auto">
      <header className="max-w-3xl mb-8">
        <p className="inline-flex items-center rounded-full bg-slate-900/70 border border-slate-800 px-3 py-1 text-[11px] uppercase tracking-wide text-slate-400 mb-3">
          Workshops e eventos
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold mb-2 tracking-tight">Próximos workshops</h1>
        <p className="text-slate-300 text-sm md:text-base">{introText}</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 justify-items-center">
        {workshops.map((workshop) => (
          <WorkshopCard key={workshop.id} workshop={workshop} />
        ))}

        {workshops.length === 0 && (
          <p className="text-xs md:text-sm text-slate-400 col-span-full">{emptyText}</p>
        )}
      </div>
      </div>
    </main>
  );
}
