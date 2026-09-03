import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sprout, Lock, MessageCircle } from 'lucide-react';
import { AZIENDA } from '../content/azienda';

export default function Navbar() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isLogin = location.pathname === '/login';

  const whatsappNumber = AZIENDA.contatti.whatsapp.replace(/\D/g, '');

  // Sulle rotte admin non mostrare la navbar pubblica (l'area admin ha la sua barra dedicata)
  if (isAdmin) return null;

  return (
    <header className="sticky top-0 z-40 bg-stone-950/80 backdrop-blur-xl border-b border-white/10 text-white transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo & Payoff */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center shadow-lg shadow-emerald-950/40 ring-1 ring-white/25 transition-transform group-hover:scale-105">
            <Sprout className="w-4 h-4" />
          </div>
          <div>
            <span className="font-display font-bold text-base sm:text-lg text-white leading-tight block tracking-tight">
              {AZIENDA.nome}
            </span>
            <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-emerald-400 font-semibold leading-none mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Listino All'Ingrosso</span>
            </span>
          </div>
        </Link>

        {/* Azioni Rapide a Destra */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Tasto WhatsApp Rapido */}
          {!isAdmin && !isLogin && (
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Salve Vivaio Finocchiaro, vorrei informazioni.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 text-emerald-300 text-xs font-semibold backdrop-blur-md transition-all touch-target active:scale-95"
              aria-label="Contatto WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-white/20" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          )}

          {/* Accesso Area Gestione / Vetrina */}
          {!isAdmin ? (
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-stone-200 hover:text-white text-xs font-medium backdrop-blur-md transition-all touch-target active:scale-95"
              title="Area Riservata Vivaio"
            >
              <Lock className="w-3.5 h-3.5 text-stone-300" />
              <span className="hidden sm:inline">Area Gestione</span>
              <span className="sm:hidden">Admin</span>
            </Link>
          ) : (
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-900/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-200 text-xs font-semibold backdrop-blur-md transition-all touch-target"
            >
              <Sprout className="w-3.5 h-3.5" />
              <span>Vetrina Pubblica</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
