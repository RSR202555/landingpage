"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      {/* HEADER */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Logo Filipe Aquino"
              className="h-8 w-auto object-contain"
            />
            <span className="font-semibold text-lg">Filipe Aquino · Treinador</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300">
            <Link href="/" className="hover:text-sky-400 transition">
              Início
            </Link>
            <Link href="/services" className="hover:text-sky-400 transition">
              Serviços
            </Link>
            <Link href="/workshops" className="hover:text-sky-400 transition">
              Workshops
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/557197115919"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center justify-center h-8 w-8 rounded-full border border-slate-700 hover:border-emerald-400 hover:text-emerald-400 text-slate-300 transition"
              aria-label="WhatsApp"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="h-4 w-4 fill-current"
              >
                <path d="M12.04 2C6.58 2 2.2 6.18 2.2 11.3c0 1.99.62 3.84 1.69 5.39L2 22l5.5-1.8a9.9 9.9 0 0 0 4.54 1.1h.01c5.46 0 9.84-4.18 9.84-9.3C21.9 6.18 17.5 2 12.04 2Zm0 16.74h-.01c-1.46 0-2.89-.39-4.13-1.12l-.3-.18-3.26 1.06 1.06-3.12-.2-.32a7.36 7.36 0 0 1-1.15-3.95c0-4.06 3.39-7.37 7.52-7.37 4.12 0 7.48 3.31 7.48 7.37 0 4.06-3.36 7.37-7.51 7.37Zm4.11-5.51c-.23-.12-1.37-.67-1.58-.74-.21-.08-.36-.12-.51.12-.15.23-.59.74-.72.89-.13.15-.27.17-.5.06-.23-.12-.98-.38-1.87-1.2-.69-.62-1.16-1.39-1.29-1.62-.13-.23-.01-.35.1-.47.1-.1.23-.26.34-.39.11-.13.15-.23.23-.38.08-.15.04-.29-.02-.41-.06-.12-.51-1.22-.7-1.67-.18-.43-.37-.37-.51-.38h-.43c-.15 0-.4.06-.61.29-.21.23-.8.78-.8 1.9 0 1.12.82 2.2.93 2.35.12.15 1.6 2.5 3.88 3.5.54.23.96.37 1.29.48.54.17 1.03.15 1.42.09.43-.06 1.37-.56 1.56-1.11.19-.55.19-1.02.13-1.11-.06-.09-.21-.15-.44-.27Z" />
              </svg>
            </a>
            <a
              href="https://instagram.com/filipeeaquino"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center justify-center h-8 w-8 rounded-full border border-slate-700 hover:border-pink-500 hover:text-pink-400 text-slate-300 transition"
              aria-label="Instagram"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="h-4 w-4 fill-current"
              >
                <path d="M7.75 2h8.5A5.76 5.76 0 0 1 22 7.75v8.5A5.76 5.76 0 0 1 16.25 22h-8.5A5.76 5.76 0 0 1 2 16.25v-8.5A5.76 5.76 0 0 1 7.75 2Zm0 2C6.23 4 5 5.23 5 6.75v8.5C5 16.77 6.23 18 7.75 18h8.5C17.77 18 19 16.77 19 15.25v-8.5C19 5.23 17.77 4 16.25 4h-8.5Zm4.25 2.5A4.76 4.76 0 0 1 17 11.25 4.76 4.76 0 0 1 12.25 16 4.76 4.76 0 0 1 7.5 11.25 4.76 4.76 0 0 1 12.25 6.5Zm0 2A2.76 2.76 0 0 0 9.5 11.25 2.76 2.76 0 0 0 12.25 14 2.76 2.76 0 0 0 15 11.25 2.76 2.76 0 0 0 12.25 8.5Zm4.38-2.63a1.12 1.12 0 1 1-2.24 0 1.12 1.12 0 0 1 2.24 0Z" />
              </svg>
            </a>
            <Link
              href="/services"
              className="px-4 py-2 rounded-full bg-sky-500 hover:bg-sky-400 text-sm font-medium text-slate-950 transition"
            >
              Agendar agora
            </Link>
          </div>
        </div>
      </header>

      {/* HERO – HOME DE AGENDAMENTOS */}
      <section className="max-w-6xl mx-auto px-6 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* COLUNA ESQUERDA */}
          <div className="space-y-5">
            <p className="text-xs uppercase tracking-[0.2em] text-sky-400">
              Aulas práticas · Avaliação física · Workshops
            </p>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Aulas práticas · Consultoria online · Workshops especiais
            </h1>

            <p className="text-sm md:text-base text-slate-300 max-w-xl">
              Agende sua aula com facilidade, escolha o melhor horário para a sua rotina
              e garanta seu atendimento em poucos cliques. Você escolhe o serviço, confirma
              o horário e faz o pagamento online com segurança (Pix ou cartão) — sem filas,
              sem burocracia.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/services"
                className="px-5 py-2.5 rounded-full bg-sky-500 hover:bg-sky-400 text-sm font-medium text-slate-950 transition"
              >
                Ver serviços e agendar
              </Link>
              <Link
                href="/workshops"
                className="px-5 py-2.5 rounded-full border border-slate-700 hover:border-sky-500 hover:text-sky-400 text-sm font-medium transition"
              >
                Próximos workshops
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 text-xs text-slate-300">
              <div className="space-y-1">
                <h3 className="font-semibold text-slate-100">Pagamentos online</h3>
                <p className="text-slate-400">
                  Pix e cartão via Mercado Pago, com confirmação automática.
                </p>
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-slate-100">Horários bloqueados</h3>
                <p className="text-slate-400">
                  Evite conflitos: horários confirmados saem do calendário em tempo real.
                </p>
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA – FOTO DO PERSONAL */}
          <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-[0_20px_60px_rgba(15,23,42,0.9)]">
            <img
             src="/filipe-personal-hero.jpg.jpg"
            alt="Personal trainer em aula"
            className="w-full h-full object-cover aspect-[4/5]"
             />

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />

            <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 border border-slate-700 text-[10px] uppercase tracking-[0.18em] text-slate-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.95)]" />
                <span>Personal disponível para novos alunos</span>
              </div>

              <div className="space-y-1">
                <h2 className="text-lg md:text-xl font-semibold text-slate-50">
                  Treinos personalizados para o seu objetivo
                </h2>
                <p className="text-xs md:text-sm text-slate-200/90">
                  Defina seu objetivo, escolha o serviço ideal e siga um plano pensado para
                  a sua rotina. Comece hoje mesmo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}