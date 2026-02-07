"use client";

import { useEffect, useState, FormEvent, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api";

interface BookingResponse {
  bookingId: number;
  paymentId: number;
  initPoint?: string;
  sandboxInitPoint?: string;
}

interface Service {
  id: number;
  name: string;
  description: string | null;
  durationMin: number;
  basePrice: string | number;
  type: string;
}

interface Workshop {
  id: number;
  title: string;
  description: string | null;
  date: string;
  durationMin: number;
  price: string | number;
}

interface Availability {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
}

const TIMESLOTS = [
  "06:00", "07:00", "08:00",
  "09:30", "10:30", "14:00",
  "15:30", "17:00", "19:00",
];

function BookingPageInner() {
  const searchParams = useSearchParams();
  const initialServiceId = searchParams.get("serviceId");
  const workshopId = searchParams.get("workshopId");

  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(
    initialServiceId ? Number(initialServiceId) : null
  );
  const [selectedTimeslot, setSelectedTimeslot] = useState<string | null>(null);
  const [occupiedTimes, setOccupiedTimes] = useState<string[]>([]);
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loadingAvailabilities, setLoadingAvailabilities] = useState(false);
  const [selectedAvailabilityId, setSelectedAvailabilityId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [instagram, setInstagram] = useState("");
  const [knowledgeLevel, setKnowledgeLevel] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [notes, setNotes] = useState("");
  const [customField, setCustomField] = useState("");
  const [date, setDate] = useState(""); // você pode preencher com a data atual ou escolhida em outro lugar
  const [time, setTime] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingHint, setBookingHint] = useState<string | null>(null);
  const [bookingSidebar, setBookingSidebar] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadServicesAndWorkshop() {
      try {
        // Se NÃO for fluxo de workshop, carregamos os serviços normalmente
        if (!workshopId) {
          const data = await apiGet<Service[]>("/api/services");
          setServices(data);

          if (initialServiceId) {
            setSelectedServiceId(Number(initialServiceId));
          }
        }

        // Se for fluxo de workshop, focamos em carregar apenas o workshop selecionado
        if (workshopId) {
          const workshops = await apiGet<Workshop[]>("/api/workshops");
          const w = workshops.find((wk) => wk.id === Number(workshopId)) || null;
          setSelectedWorkshop(w);

          if (!w) {
            setError("Workshop não encontrado. Tente novamente mais tarde.");
          }
        }
      } catch (e) {
        console.error(e);
        if (workshopId) {
          setError("Erro ao carregar dados do workshop. Tente novamente em instantes.");
        } else {
          setError("Erro ao carregar serviços. Tente novamente em instantes.");
        }
      }
    }

    loadServicesAndWorkshop();
  }, [initialServiceId, workshopId]);

  useEffect(() => {
    async function loadOccupiedTimes() {
      try {
        if (!date || (!selectedServiceId && !workshopId)) {
          setOccupiedTimes([]);
          return;
        }

        const params = new URLSearchParams();
        params.set("date", date);
        if (selectedServiceId) params.set("serviceId", String(selectedServiceId));
        if (workshopId) params.set("workshopId", String(workshopId));

        const resp = await apiGet<{ occupiedTimes: string[] }>(
          `/api/bookings/occupied?${params.toString()}`
        );

        setOccupiedTimes(resp.occupiedTimes || []);
      } catch (e) {
        console.error(e);
        setOccupiedTimes([]);
      }
    }

    loadOccupiedTimes();
  }, [date, selectedServiceId, workshopId]);

  useEffect(() => {
    async function loadAvailabilities() {
      if (!selectedServiceId || !date || workshopId) {
        setAvailabilities([]);
        setSelectedAvailabilityId(null);
        return;
      }

      setLoadingAvailabilities(true);
      try {
        const params = new URLSearchParams();
        params.set("serviceId", String(selectedServiceId));
        params.set("date", date);

        const data = await apiGet<Availability[]>(`/api/availabilities?${params.toString()}`);

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
        setSelectedAvailabilityId(null);
        setSelectedTimeslot(null);
      } catch (e) {
        console.error(e);
        setAvailabilities([]);
        setSelectedAvailabilityId(null);
      } finally {
        setLoadingAvailabilities(false);
      }
    }

    loadAvailabilities();
  }, [selectedServiceId, date, workshopId]);

  function showToast(message: string) {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3200);
  }

  function handleSelectService(id: number) {
    setSelectedServiceId(id);
    setSelectedTimeslot(null);
    setSelectedAvailabilityId(null);
  }

  function handleSelectTimeslot(t: string, availabilityId?: number) {
    setSelectedTimeslot(t);
    setTime(t);
    if (availabilityId != null) {
      setSelectedAvailabilityId(availabilityId);
    } else {
      setSelectedAvailabilityId(null);
    }
  }

  async function handleConfirm(e: FormEvent) {
    e.preventDefault();
    if (!selectedServiceId && !workshopId) {
      setError("Escolha um serviço ou workshop para continuar.");
      return;
    }
    let scheduledAt: Date;

    if (workshopId) {
      if (!selectedWorkshop) {
        setError("Workshop não encontrado. Tente novamente.");
        return;
      }
      // Para workshops, usamos diretamente a data definida no cadastro do workshop
      scheduledAt = new Date(selectedWorkshop.date);
    } else {
      if (!date) {
        setError("Escolha uma data para continuar.");
        return;
      }

      if (!selectedTimeslot || !selectedAvailabilityId) {
        setError("Escolha um horário disponível para continuar.");
        return;
      }

      scheduledAt = new Date(`${date}T${time}:00`);
    }

    setError(null);
    setLoading(true);

    try {
      // Formata data de nascimento (yyyy-MM-dd -> dd-MM-yyyy) para exibição no painel admin
      let formattedBirthDate = birthDate;
      if (birthDate) {
        const [year, month, day] = birthDate.split("-");
        if (year && month && day) {
          formattedBirthDate = `${day}-${month}-${year}`;
        }
      }

      // Payload no formato esperado pelo backend (/api/bookings)
      const body: any = {
        serviceId: selectedServiceId,
        workshopId: workshopId ? Number(workshopId) : undefined,
        availabilityId: selectedAvailabilityId || undefined,
        scheduledAt: scheduledAt.toISOString(),
        customer: {
          name,
          email,
          phone,
          gender,
        },
        notes,
        customField:
          customField ||
          `Idade: ${age || "-"} | Nível: ${knowledgeLevel || "-"} | Nascimento: ${
            formattedBirthDate || "-"
          } | Instagram: ${instagram || "-"}`,
      };

      const resp = await apiPost<BookingResponse>("/api/bookings", body);

      showToast("Agendamento criado! Redirecionando para o pagamento...");

      if (resp.initPoint || resp.sandboxInitPoint) {
        window.location.href = resp.initPoint ?? resp.sandboxInitPoint!;
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Erro ao criar agendamento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const selectedService = services.find((s) => s.id === selectedServiceId) || null;

  return (
    <div className="min-h-screen bg-slate-950/95 flex justify-center px-4 py-6 md:py-8">
      <div className="w-full max-w-5xl bg-slate-950/90 border border-slate-900 rounded-3xl shadow-[0_20px_60px_rgba(15,23,42,0.9)] px-4 py-5 md:px-6 md:py-6 space-y-5">
        {/* HEADER */}
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-700/60 bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-slate-900/20 text-[10px] uppercase tracking-[0.18em] text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
              <span>Agenda online · 100% segura</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-50">
              Escolha seu horário e agende sua aula
            </h1>
            <p className="text-slate-400 text-sm md:text-[15px]">
              Veja os serviços disponíveis, selecione o horário que encaixa na sua rotina
              e confirme seu agendamento em poucos cliques.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              type="button"
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 rounded-full bg-sky-500 hover:bg-sky-400 text-xs md:text-sm font-medium text-slate-950 shadow-[0_0_32px_rgba(56,189,248,0.35)] transition"
              onClick={() => (window.location.href = "/services")}
            >
              Ver serviços e agendar
            </button>
            <button
              type="button"
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 rounded-full border border-slate-700 bg-slate-900/70 text-xs md:text-sm font-medium text-slate-100 hover:border-sky-500/70 hover:text-sky-100 transition"
              onClick={() => (window.location.href = "/workshops")}
            >
              Próximos workshops
            </button>
          </div>
        </header>

        {/* LAYOUT PRINCIPAL */}
        <section className="grid gap-5 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)] items-stretch">
          {/* CARD DO PERSONAL */}
          <aside className="bg-gradient-to-br from-slate-900/90 via-slate-900 to-slate-950/95 border border-slate-700/70 rounded-3xl p-4 flex flex-col gap-3 relative overflow-hidden">
            <div className="relative rounded-2xl overflow-hidden border border-slate-700/60 shadow-[0_18px_40px_rgba(15,23,42,0.95)]">
              {/* FOTO_DO_PERSONAL_AQUI */}
              <img
                src="/filipe-aquino.jpg"
                alt="Foto do personal trainer"
                className="w-full aspect-[4/5] object-cover"
              />
              <div className="absolute left-3 bottom-3 px-3 py-1.5 rounded-full border border-slate-900 bg-slate-950/95 text-[10px] uppercase tracking-[0.18em] text-slate-100 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.95)]" />
                <span>Personal disponível hoje</span>
              </div>
            </div>

            <div className="space-y-1.5 mt-1">
              <h2 className="text-base md:text-lg font-semibold tracking-tight text-slate-50">
                Filipe Aquino
              </h2>
              <p className="text-sm text-sky-100">
                Construa seu melhor físico com treinos personalizados e acompanhamento próximo.
              </p>
              <p className="text-xs text-slate-400">
                Aulas individuais · Consultoria online · Treinos para todos os níveis.
              </p>

              <div className="mt-2 px-3 py-2 rounded-2xl border border-sky-500/40 bg-slate-950/90 text-[11px] text-sky-100 flex gap-2">
                <span className="text-sky-400 mt-0.5">★</span>
                <p>
                  Mais de <strong>500+</strong> alunos impactados, com foco em constância,
                  performance e bem-estar. Cada agendamento é uma sessão feita sob medida para você.
                </p>
              </div>
            </div>
          </aside>

          {/* PAINEL DE AGENDAMENTO */}
          <form
            onSubmit={handleConfirm}
            className="bg-slate-950/90 border border-slate-800 rounded-3xl p-4 md:p-5 flex flex-col gap-4"
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 mb-1">
                {workshopId ? "Passo 1 · Confirme seu workshop" : "Passo 1 · Escolha o serviço"}
              </p>

              {workshopId && selectedWorkshop ? (
                <div className="rounded-2xl border border-sky-500/60 bg-slate-950/80 px-3 py-3 text-xs md:text-[13px] flex flex-col gap-1">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-sky-300 mb-1">
                    Workshop selecionado
                  </span>
                  <span className="font-medium text-slate-50 mb-1">
                    {selectedWorkshop.title}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1">
                    {(() => {
                      const start = new Date(selectedWorkshop.date);
                      const end = new Date(start.getTime() + selectedWorkshop.durationMin * 60000);

                      const dateLabel = start.toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      });

                      const startTimeLabel = start.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      const endTimeLabel = end.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      return (
                        <>
                          {dateLabel}{" "}· {startTimeLabel} - {endTimeLabel} ·{" "}
                          <span className="text-sky-300 font-medium">
                            R${" "}
                            {Number(selectedWorkshop.price).toFixed(2).replace(".", ",")}
                          </span>
                        </>
                      );
                    })()}
                  </span>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Serviços disponíveis
                  </p>
                  <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                    {services.map((service) => (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => handleSelectService(service.id)}
                        className={[
                          "text-left rounded-2xl border px-3 py-2.5 bg-slate-950/80 text-xs md:text-[13px] flex flex-col gap-1 transition",
                          selectedServiceId === service.id
                            ? "border-sky-500 bg-slate-950 shadow-[0_0_26px_rgba(56,189,248,0.35)]"
                            : "border-slate-700 hover:border-sky-500/70",
                        ].join(" ")}
                      >
                        <span className="font-medium text-slate-50">
                          {service.name}
                        </span>
                        {service.description && (
                          <span className="text-[11px] text-slate-400 line-clamp-2">
                            {service.description}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400">
                          {service.durationMin} min ·{" "}
                          <span className="text-sky-300 font-medium">
                            R${" "}
                            {Number(service.basePrice)
                              .toFixed(2)
                              .replace(".", ",")}
                          </span>
                        </span>
                      </button>
                    ))}

                    {services.length === 0 && (
                      <div className="col-span-full text-xs text-slate-500">
                        Nenhum serviço encontrado. Verifique o cadastro no painel
                        admin.
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {!workshopId && (
              <>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 mb-1">
                    Passo 2 · Escolha a data
                  </p>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Selecione o dia em que deseja realizar a aula
                  </p>
                  <input
                    type="date"
                    className="w-full rounded-xl bg-slate-950/80 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:border-sky-500"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 mb-1">
                    Passo 3 · Escolha o horário
                  </p>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Horários de hoje
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {loadingAvailabilities && selectedServiceId ? (
                      <span className="text-[11px] text-slate-400">Carregando horários...</span>
                    ) : selectedServiceId && date && availabilities.length === 0 ? (
                      <span className="text-[11px] text-rose-300">
                        Nenhum horário disponível cadastrado para esta data. Escolha outra data.
                      </span>
                    ) : !selectedServiceId ? (
                      <span className="text-[11px] text-slate-400">
                        Selecione um serviço para ver os horários disponíveis.
                      </span>
                    ) : (
                      availabilities.map((a) => {
                        const slot = a.startTime;
                        const isOccupied = occupiedTimes.includes(slot);
                        return (
                          <button
                            key={a.id}
                            type="button"
                            disabled={isOccupied}
                            onClick={() => !isOccupied && handleSelectTimeslot(slot, a.id)}
                            className={[
                              "text-[11px] px-2.5 py-1.5 rounded-full border text-center bg-slate-950/80 text-slate-100 transition",
                              isOccupied
                                ? "opacity-40 cursor-not-allowed line-through border-slate-800"
                                : selectedAvailabilityId === a.id
                                ? "border-sky-500 bg-slate-900 shadow-[0_0_24px_rgba(56,189,248,0.35)]"
                                : "border-slate-700 hover:border-sky-500/70",
                            ].join(" ")}
                          >
                            {slot}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </>
            )}
            {/* Dados do aluno */}
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-slate-400">
                  Nome completo
                </label>
                <input
                  className="rounded-xl bg-slate-950/80 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:border-sky-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-slate-400">
                  E-mail
                </label>
                <input
                  type="email"
                  className="rounded-xl bg-slate-950/80 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:border-sky-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-slate-400">
                  Idade
                </label>
                <input
                  type="number"
                  min={0}
                  className="rounded-xl bg-slate-950/80 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:border-sky-500"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-slate-400">
                  Telefone / WhatsApp
                </label>
                <input
                  className="rounded-xl bg-slate-950/80 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:border-sky-500"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-slate-400">
                  @ Instagram
                </label>
                <input
                  className="rounded-xl bg-slate-950/80 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:border-sky-500"
                  placeholder="@seu_usuario"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-slate-400">
                  Nível de conhecimento em musculação
                </label>
                <select
                  className="rounded-xl bg-slate-950/80 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:border-sky-500"
                  value={knowledgeLevel}
                  onChange={(e) => setKnowledgeLevel(e.target.value)}
                >
                  <option value="">Selecione</option>
                  <option value="INICIANTE">Iniciante</option>
                  <option value="INTERMEDIARIO">Intermediário</option>
                  <option value="AVANCADO">Avançado</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-slate-400">
                  Data de nascimento
                </label>
                <input
                  type="date"
                  className="rounded-xl bg-slate-950/80 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:border-sky-500"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-slate-400">
                  Gênero
                </label>
                <select
                  className="rounded-xl bg-slate-950/80 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:border-sky-500"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="">Selecione</option>
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMININO">Feminino</option>
                  <option value="OUTRO">Outro</option>
                </select>
              </div>
            </div>

            <div className="space-y-2 mt-1">
              {error && (
                <p className="text-xs text-rose-400 bg-rose-900/20 border border-rose-500/40 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}

              <p className="text-[11px] text-slate-500">
                {workshopId && selectedWorkshop
                  ? (() => {
                      const start = new Date(selectedWorkshop.date);
                      const end = new Date(start.getTime() + selectedWorkshop.durationMin * 60000);

                      const dateLabel = start.toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      });

                      const startTimeLabel = start.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      const endTimeLabel = end.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      return (
                        <>
                          Você está se inscrevendo no workshop {" "}
                          <span className="text-sky-100 font-medium">
                            {selectedWorkshop.title}
                          </span>{" "}
                          em {" "}
                          <span className="text-sky-100 font-medium">
                            {dateLabel}
                          </span>{" "}
                          das {" "}
                          <span className="text-sky-100 font-medium">
                            {startTimeLabel} - {endTimeLabel}
                          </span>
                          .
                        </>
                      );
                    })()
                  : selectedService && selectedTimeslot
                  ? (
                      <>
                        Você selecionou{" "}
                        <span className="text-sky-100 font-medium">
                          {selectedService.name}
                        </span>{" "}
                        às{" "}
                        <span className="text-sky-100 font-medium">
                          {selectedTimeslot}
                        </span>
                        .
                      </>
                    )
                  : (
                      <>Selecione um serviço e um horário para continuar.</>
                    )}
              </p>

              <button
                type="submit"
                disabled={
                  loading ||
                  (!selectedServiceId && !workshopId) ||
                  (!workshopId && !selectedTimeslot)
                }
                className="w-full inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-sky-400 text-slate-950 text-sm font-semibold px-4 py-2.5 shadow-[0_0_30px_rgba(56,189,248,0.5)] disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-105 transition"
              >
                {loading ? "Confirmando..." : "Confirmar agendamento"}
              </button>

              <p className="text-[11px] text-slate-500">
                Ao confirmar, você será direcionado para o resumo e pagamento. Seu horário
                ficará reservado automaticamente.
              </p>
            </div>
          </form>
        </section>

        {toastMessage && (
          <div className="fixed right-4 bottom-4 z-50 inline-flex items-center gap-2 rounded-full border border-emerald-500/60 bg-slate-950/95 px-4 py-2 text-xs text-emerald-200 shadow-[0_18px_35px_rgba(15,23,42,0.9)]">
            <span>✓</span>
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={null}>
      <BookingPageInner />
    </Suspense>
  );
}