import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageCircle, Menu, X, ArrowRight } from 'lucide-react';
import { AZIENDA } from '../content/azienda';

export default function Navbar() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Monitora lo scorrimento della finestra
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 35);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Chiudi il menu mobile al cambio di route o clic su ancore
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  if (isAdmin) return null;

  const whatsappNumber = AZIENDA.contatti.whatsapp.replace(/\D/g, '');

  const isDarkNav = !scrolled && !mobileMenuOpen;

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isDarkNav 
          ? 'bg-gradient-to-b from-black/65 via-black/30 to-transparent border-b border-white/15 text-white shadow-[0_4px_30px_rgba(0,0,0,0.3)]' 
          : 'bg-[#FAF9F6]/95 backdrop-blur-md border-b border-[#252824]/10 text-[#252824] shadow-xs'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-18 sm:h-20 flex items-center justify-between">
        
        {/* Brand Logo Ufficiale (Con scritta integrata nella grafica) */}
        <Link 
          to="/" 
          className="flex items-center group py-1.5 focus:outline-none" 
          title="Campo dei Fiori"
          onClick={() => setMobileMenuOpen(false)}
        >
          <img
            src={isDarkNav ? "/brand/logo-horizontal-white.webp" : "/brand/logo-horizontal.webp"}
            alt="Campo dei Fiori - Ornamental Plants Sicily"
            className="h-9 sm:h-11 w-auto object-contain transition-all duration-300 group-hover:scale-103"
          />
        </Link>

        {/* Menu Navigazione Desktop */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-[0.16em]">
          <a 
            href="#storia" 
            className={`transition-colors ${
              isDarkNav 
                ? 'text-white/85 hover:text-white' 
                : 'text-[#252824]/75 hover:text-[#25570A]'
            }`}
          >
            Il Vivaio
          </a>
          <a 
            href="#catalogo" 
            className={`transition-colors ${
              isDarkNav 
                ? 'text-white/85 hover:text-white' 
                : 'text-[#252824]/75 hover:text-[#25570A]'
            }`}
          >
            Listino Piante
          </a>
          <a 
            href="#logistica" 
            className={`transition-colors ${
              isDarkNav 
                ? 'text-white/85 hover:text-white' 
                : 'text-[#252824]/75 hover:text-[#25570A]'
            }`}
          >
            Logistica CC
          </a>
          <a 
            href="#contatti" 
            className={`transition-colors ${
              isDarkNav 
                ? 'text-white/85 hover:text-white' 
                : 'text-[#252824]/75 hover:text-[#25570A]'
            }`}
          >
            Contatti
          </a>
        </nav>

        {/* Azioni Desktop */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Salve, vorrei richiedere informazioni sulle disponibilità all'ingrosso di Campo dei Fiori.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all touch-target active:scale-95 ${
              isDarkNav
                ? 'bg-white/15 hover:bg-white/25 text-white border border-white/25 backdrop-blur-md'
                : 'bg-[#25570A] hover:bg-[#1A3E07] text-white shadow-xs'
            }`}
            aria-label="Ufficio Vendite WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-white/20" />
            <span>Ufficio Vendite</span>
          </a>
        </div>

        {/* Pulsante Hamburger Mobile Touch-Friendly */}
        <div className="flex items-center gap-2 sm:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2.5 rounded-xl transition-colors touch-target focus:outline-none ${
              isDarkNav 
                ? 'text-white hover:bg-white/10' 
                : 'text-[#252824] hover:bg-stone-100'
            }`}
            aria-label={mobileMenuOpen ? "Chiudi menu" : "Apri menu"}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MENU MOBILE SLIDE-DOWN (Elegante & Fluido) */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[#FAF9F6] border-b border-[#252824]/10 px-5 pt-3 pb-6 shadow-xl animate-in slide-in-from-top-3 duration-200">
          <nav className="flex flex-col space-y-3 pt-2">
            <a
              href="#storia"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider text-[#252824] hover:bg-stone-100 hover:text-[#25570A] transition-colors flex items-center justify-between"
            >
              <span>Il Vivaio</span>
              <ArrowRight className="w-4 h-4 text-[#252824]/40" />
            </a>
            <a
              href="#catalogo"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider text-[#252824] hover:bg-stone-100 hover:text-[#25570A] transition-colors flex items-center justify-between"
            >
              <span>Listino Piante</span>
              <ArrowRight className="w-4 h-4 text-[#252824]/40" />
            </a>
            <a
              href="#logistica"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider text-[#252824] hover:bg-stone-100 hover:text-[#25570A] transition-colors flex items-center justify-between"
            >
              <span>Logistica CC</span>
              <ArrowRight className="w-4 h-4 text-[#252824]/40" />
            </a>
            <a
              href="#contatti"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider text-[#252824] hover:bg-stone-100 hover:text-[#25570A] transition-colors flex items-center justify-between"
            >
              <span>Contatti</span>
              <ArrowRight className="w-4 h-4 text-[#252824]/40" />
            </a>

            {/* Tasto Azione Rapida Mobile */}
            <div className="pt-3 border-t border-stone-200/70">
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Salve, vorrei richiedere informazioni sulle disponibilità all'ingrosso di Campo dei Fiori.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 px-4 rounded-xl bg-[#25570A] active:scale-98 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-transform touch-target"
              >
                <MessageCircle className="w-4 h-4 fill-white/20" />
                <span>Contatta Ufficio Vendite</span>
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
