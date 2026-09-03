import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sprout, Lock, Phone, MessageCircle } from 'lucide-react';
import { AZIENDA } from '../content/azienda';

export default function Navbar() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isLogin = location.pathname === '/login';

  const whatsappNumber = AZIENDA.contatti.whatsapp.replace(/\D/g, '');

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-stone-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo / Nome Azienda */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-moss-700 to-moss-900 group-hover:from-moss-600 group-hover:to-moss-800 text-white flex items-center justify-center shadow-md shadow-moss-900/10 transition-all">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <span className="font-display font-bold text-base sm:text-lg text-stone-900 tracking-tight block leading-tight group-hover:text-moss-800 transition-colors">
              {AZIENDA.nome}
            </span>
            <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-700 block">
              Listino Professionale
            </span>
          </div>
        </Link>

        {/* Link di Navigazione Desktop */}
        <div className="flex items-center gap-3 sm:gap-6">
          {!isAdmin && !isLogin && (
            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-stone-600">
              <a href="#catalogo" className="hover:text-moss-700 transition-colors">
                Tutte le Piante
              </a>
              <a href="#chi-siamo" className="hover:text-moss-700 transition-colors">
                Chi Siamo
              </a>
              <a href="#contatti" className="hover:text-moss-700 transition-colors">
                Contatti & Carichi
              </a>
            </nav>
          )}

          {/* WhatsApp rapido per desktop */}
          {!isAdmin && !isLogin && (
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Salve Vivaio Finocchiaro, vorrei informazioni.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          )}

          {/* Accesso Area Gestione */}
          {!isAdmin ? (
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100/90 hover:bg-stone-200 transition-colors touch-target"
              title="Area Riservata Vivaista"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pannello</span>
              <span className="sm:hidden">Admin</span>
            </Link>
          ) : (
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-moss-800 bg-moss-100 hover:bg-moss-200 transition-colors touch-target"
            >
              <Sprout className="w-3.5 h-3.5" />
              <span>Vetrina</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
