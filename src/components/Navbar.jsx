import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sprout, Lock, Phone } from 'lucide-react';
import { AZIENDA } from '../content/azienda';

export default function Navbar() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isLogin = location.pathname === '/login';

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo / Nome Azienda */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-moss-700 group-hover:bg-moss-800 text-white flex items-center justify-center shadow-sm transition-colors">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <span className="font-display font-bold text-lg text-stone-900 tracking-tight block leading-tight">
              {AZIENDA.nome}
            </span>
            <span className="text-[10px] font-semibold tracking-wider uppercase text-moss-700 block">
              Listino Ingrosso
            </span>
          </div>
        </Link>

        {/* Link di Navigazione */}
        <div className="flex items-center gap-3 sm:gap-6">
          {!isAdmin && !isLogin && (
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
              <a href="#catalogo" className="hover:text-moss-700 transition-colors">
                Catalogo Piante
              </a>
              <a href="#chi-siamo" className="hover:text-moss-700 transition-colors">
                Chi Siamo
              </a>
              <a href="#contatti" className="hover:text-moss-700 transition-colors">
                Contatti & Ordini
              </a>
            </div>
          )}

          {/* Azione rapida o Login Admin */}
          {!isAdmin ? (
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 transition-colors touch-target"
              title="Area Riservata Vivaista"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Area Gestione</span>
            </Link>
          ) : (
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-moss-800 bg-moss-100 hover:bg-moss-200 transition-colors touch-target"
            >
              <Sprout className="w-3.5 h-3.5" />
              <span>Torna al Catalogo Pubblico</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
