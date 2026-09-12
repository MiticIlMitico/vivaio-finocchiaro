import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageCircle, ArrowRight } from 'lucide-react';
import { AZIENDA } from '../content/azienda';

export default function Navbar() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) return null;

  const whatsappNumber = AZIENDA.contatti.whatsapp.replace(/\D/g, '');

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-[#252824]/10 text-[#252824] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-18 sm:h-20 flex items-center justify-between">
        {/* Brand Logo Ufficiale con SCRITTA INCLUSA nella grafica */}
        <Link to="/" className="flex items-center group py-1.5 focus:outline-none" title="Campo dei Fiori">
          <img
            src="/brand/logo-horizontal.png"
            alt="Campo dei Fiori - Ornamental Plants Sicily"
            className="h-9 sm:h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-103"
          />
        </Link>

        {/* Menu Navigazione Desktop - Pulito & Discreto */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-[0.16em] text-[#252824]/75">
          <a href="#storia" className="hover:text-[#25570A] transition-colors">
            Il Vivaio
          </a>
          <a href="#catalogo" className="hover:text-[#25570A] transition-colors">
            Listino Piante
          </a>
          <a href="#logistica" className="hover:text-[#25570A] transition-colors">
            Logistica CC
          </a>
          <a href="#contatti" className="hover:text-[#25570A] transition-colors">
            Contatti
          </a>
        </nav>

        {/* Tasto Contatto Rapido */}
        <div className="flex items-center gap-3">
          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Salve, vorrei richiedere informazioni sulle disponibilità all'ingrosso di Campo dei Fiori.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-[#25570A] hover:bg-[#1A3E07] active:scale-95 text-white text-xs font-bold uppercase tracking-wider shadow-xs transition-all touch-target"
            aria-label="Ufficio Vendite WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-white/20" />
            <span>Ufficio Vendite</span>
          </a>
        </div>
      </div>
    </header>
  );
}
