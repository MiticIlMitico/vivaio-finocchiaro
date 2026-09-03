import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sprout, Lock } from 'lucide-react';
import { AZIENDA } from '../content/azienda';

export default function Navbar() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isLogin = location.pathname === '/login';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center">
            <Sprout className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-base text-stone-900 leading-tight block">
              {AZIENDA.nome}
            </span>
          </div>
        </Link>

        {/* Link Gestione */}
        <div>
          {!isAdmin ? (
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 transition-colors touch-target"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Area Gestione</span>
            </Link>
          ) : (
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-colors touch-target"
            >
              <Sprout className="w-3.5 h-3.5" />
              <span>Catalogo</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
