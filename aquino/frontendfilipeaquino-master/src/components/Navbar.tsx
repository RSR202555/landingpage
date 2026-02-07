"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { apiGet } from "@/lib/api";

interface AdminSettings {
  siteTitle: string;
}

export function Navbar() {
  const pathname = usePathname();

  // não mostra navbar nas rotas de admin
  if (pathname.startsWith("/admin") || pathname.startsWith("/admin-login")) {
    return null;
  }

  const [brandTitle, setBrandTitle] = useState("Filipe Aquino • Treinador");

  useEffect(() => {
    (async () => {
      try {
        const settings = await apiGet<AdminSettings>("/api/admin/settings");
        if (settings?.siteTitle) {
          setBrandTitle(settings.siteTitle);
        }
      } catch {
        // mantém título padrão se falhar
      }
    })();
  }, []);

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-sm px-6 py-4 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-sky-500 to-emerald-400" />
        <span className="font-semibold tracking-tight text-sm md:text-base">{brandTitle}</span>
      </div>
      <nav className="hidden md:flex gap-6 text-xs md:text-sm text-slate-300">
        <Link href="/services" className="hover:text-sky-400">
          Serviços
        </Link>
        <Link href="/workshops" className="hover:text-sky-400">
          Workshops
        </Link>
        <Link href="/about" className="hover:text-sky-400">
          Sobre
        </Link>
        <Link href="/contact" className="hover:text-sky-400">
          Contato
        </Link>
      </nav>
      <Link
        href="/services"
        className="text-xs md:text-sm px-4 py-1.5 rounded-full bg-sky-500 hover:bg-sky-400 font-medium"
      >
        Agendar agora
      </Link>
    </header>
  );
}
