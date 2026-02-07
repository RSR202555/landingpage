"use client";

import { useState } from "react";

interface WorkshopCardProps {
    workshop: {
        id: number;
        title: string;
        description: string | null;
        date: string;
        durationMin: number;
        maxSeats: number;
        price: string;
        imageUrl?: string | null;
    };
}

export function WorkshopCard({ workshop }: WorkshopCardProps) {
    const [showFullDescription, setShowFullDescription] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    const date = new Date(workshop.date);
    const dateStr = date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
    const startTimeStr = date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
    });

    const endDate = new Date(date.getTime() + workshop.durationMin * 60000);
    const endTimeStr = endDate.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
    });

    const hasLongDescription = workshop.description && workshop.description.length > 150;

    return (
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/50 p-5 flex flex-col justify-between gap-4 shadow-sm hover:border-sky-500/60 hover:shadow-[0_0_30px_rgba(56,189,248,0.15)] transition">
            <div className="space-y-3">
                {workshop.imageUrl && (
                    <div className="mb-4 -mx-5 -mt-5">
                        {/**
                         * Se a API retornar apenas o caminho relativo (ex: /uploads/workshops/arquivo.jpg),
                         * prefixamos com o API_URL para carregar a imagem correta do backend.
                         */}
                        {(() => {
                            const src = workshop.imageUrl!.startsWith('http')
                                ? workshop.imageUrl!
                                : `${API_URL}${workshop.imageUrl}`;

                            return (
                            <img
                                src={src}
                                alt={workshop.title}
                                className="w-full h-40 md:h-44 lg:h-48 object-cover rounded-t-2xl border-b border-slate-800"
                            />
                            );
                        })()}
                    </div>
                )}

                <h2 className="text-base md:text-lg font-semibold leading-snug">{workshop.title}</h2>

                {workshop.description && (
                    <div>
                        <p className={`text-slate-300 text-xs md:text-sm leading-relaxed ${!showFullDescription && hasLongDescription ? 'line-clamp-3' : ''}`}>
                            {workshop.description}
                        </p>
                        {hasLongDescription && (
                            <button
                                onClick={() => setShowFullDescription(!showFullDescription)}
                                className="text-sky-400 hover:text-sky-300 text-xs mt-2 font-medium transition"
                            >
                                {showFullDescription ? "Ver menos" : "Ver mais"}
                            </button>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/50">
                    <span>
                        {dateStr}
                    </span>
                    <span>
                        {startTimeStr} - {endTimeStr}
                    </span>
                </div>

                <p className="text-[11px] text-slate-400">
                    Máx. {workshop.maxSeats} vagas
                </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
                <div className="text-right">
                    <p className="text-[11px] text-slate-400 uppercase tracking-wide">Investimento</p>
                    <p className="text-lg md:text-xl font-semibold text-sky-400">
                        R$ {Number(workshop.price).toFixed(2).replace(".", ",")}
                    </p>
                </div>
                <a
                    href={`/booking?workshopId=${workshop.id}`}
                    className="px-4 py-2 rounded-full bg-sky-500 hover:bg-sky-400 text-xs md:text-sm font-medium text-slate-950 shadow-sm transition"
                >
                    Inscrever-se
                </a>
            </div>
        </div>
    );
}
